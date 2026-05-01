# Data Engineering Notes: B05 Recommendation Systems
## By R-DE — Date: 2026-03-31

### 1. RecSys Data Pipeline Architecture

A recommendation system data pipeline follows a cyclical pattern: **event ingestion -> feature store -> training data -> model training -> serving features -> feedback loop**. The ingestion layer captures raw user interactions from multiple surfaces (web, mobile, in-app) and lands them in a message queue (Kafka or Kinesis). From there, a stream processor enriches events with session context and writes to both an event log (append-only, Parquet on S3) and the feature store's online layer. Training pipelines read from the offline store, produce model artifacts, and the serving layer pulls real-time features to assemble ranking requests. The feedback loop closes when served recommendations generate new interaction events, feeding back into ingestion.

Key design principle: decouple ingestion from consumption. The event log is the single source of truth; everything downstream is a materialized view. This allows replaying history for backfills or new feature engineering without touching production serving.

### 2. Event Tracking & Clickstream

Core events to capture for RecSys: **impressions** (item shown to user, position in list), **clicks** (item selected), **add-to-cart**, **purchases**, **dwell time** (time spent on item detail page), **search queries**, **scroll depth**, and **explicit feedback** (ratings, likes, saves). Each event needs a standardized schema:

```
{user_id, session_id, event_type, item_id, timestamp,
 context: {page, position, device, referrer},
 metadata: {price, category, seller_id}}
```

For real-time ingestion, Kafka is the standard choice with topic-per-event-type partitioning by user_id to maintain ordering. A lightweight tracking SDK (client-side JS or mobile SDK) batches events and sends them to a collection endpoint. Server-side validation rejects malformed events before they hit Kafka. Expect 10K-100K events/second for a mid-size e-commerce platform; Shopee-scale pushes into millions/second territory.

### 3. Feature Store for RecSys

The feature store is the bridge between offline training and online serving. Top options: **Feast** (open-source, good K8s integration), **Tecton** (managed, tight Spark/Databricks integration), **Hopsworks** (strong on feature pipelines). Each provides two stores:

- **Online store** (Redis, DynamoDB): low-latency key-value lookups for serving. Holds latest feature values per entity (user, item, user-item pair). Target: <5ms read latency.
- **Offline store** (S3 + Parquet, BigQuery): full historical feature values for training. Supports point-in-time joins to prevent label leakage.

Feature freshness SLAs matter enormously. User features like "items clicked in last 30 minutes" need sub-minute freshness for session-based personalization. Item features like "average rating" can tolerate hourly updates. Define explicit SLA tiers: real-time (<1 min), near-real-time (<15 min), batch (<24 hr), and assign each feature accordingly.

### 4. User-Item Interaction Storage

The user-item interaction matrix is inherently sparse (typically 0.01-0.1% density for e-commerce). Storage strategies differ by use case:

- **Event log** (Parquet on S3): append-only, full history, used for training. Partition by date for efficient time-range queries. Columnar format compresses well.
- **Materialized matrix** (sparse CSR format in memory, or HBase/Cassandra for persistence): pre-computed for collaborative filtering algorithms that need random access to user or item vectors.
- **Serving layer** (Redis sorted sets or DynamoDB): user's recent interactions for real-time feature assembly. Keep last 100-500 interactions per user with TTL of 30-90 days.

For training, always produce Parquet files with explicit train/validation/test splits based on timestamp cutoffs. Never random-split interaction data — this causes temporal leakage where the model "sees the future."

### 5. Embedding Store & ANN Index

After model training produces user and item embeddings (typically 64-256 dimensions), these need to be indexed for fast approximate nearest neighbor (ANN) retrieval:

- **FAISS** (Meta): CPU and GPU support, excellent for batch operations, widely adopted. Best for: static indexes rebuilt periodically.
- **ScaNN** (Google): optimized quantization, strong recall-latency tradeoff. Best for: large-scale production with tuned performance.
- **Milvus**: distributed, cloud-native, supports real-time inserts. Best for: systems needing incremental updates without full rebuild.
- **Qdrant**: Rust-based, good filtering support, growing ecosystem. Best for: metadata-filtered retrieval scenarios.

Index build pipeline: train embeddings -> export vectors -> build ANN index -> validate recall@K -> deploy to serving. For incremental updates, Milvus and Qdrant support adding vectors without rebuild. FAISS requires periodic full rebuilds (typically daily) but offers better query performance. A common pattern: incremental updates via brute-force search on the delta set, merged with ANN results from the main index.

### 6. Real-time Feature Pipeline

Architecture: **Kafka -> Flink/Spark Structured Streaming -> Feature Store online layer**. Flink is preferred for complex event processing with low latency; Spark Streaming works when you already have Spark infrastructure.

Critical windowed aggregations for RecSys:
- User click count in last 30 minutes (session engagement signal)
- User category distribution in current session (intent signal)
- Item click-through rate in last 1 hour (trending signal)
- User-item interaction count (repeated interest signal)

Implementation pattern: Flink reads from Kafka, maintains keyed state per user_id, computes sliding window aggregates, and writes to Redis (online store) and Kafka (for downstream consumers). Watermarking handles late-arriving events. Checkpointing to S3 ensures exactly-once processing semantics.

Latency target: event occurrence to feature availability in online store should be under 30 seconds. Monitor this with an end-to-end latency metric.

### 7. Data Versioning & Experiment Tracking

**DVC** (Data Version Control) manages training data snapshots alongside Git-versioned code. Each training run references a specific data version, making experiments fully reproducible. Store data in S3 with DVC tracking metadata in Git.

Critical practices:
- **Time-based splits**: train on data before cutoff T, validate on T to T+delta, test on T+delta to T+2*delta. Never shuffle interactions across time.
- **Consistent splits across experiments**: pin the cutoff dates in config files versioned with DVC.
- **Feature snapshots**: when computing point-in-time features, snapshot the feature values at training time. This prevents "feature drift" between training and evaluation.

Track experiments with MLflow or Weights & Biases: log hyperparameters, data version (DVC hash), offline metrics (NDCG@K, Recall@K, MAP), and model artifacts. Automate comparison dashboards to quickly identify winning configurations.

### 8. Vietnamese E-commerce Data Specifics

Working with Vietnamese e-commerce data introduces unique challenges:

- **Shopee/Tiki data access**: public APIs are limited. Shopee's affiliate API provides product catalogs but not user interaction data. Building a RecSys for these platforms means working with internal data (if employed) or building your own event tracking for your marketplace.
- **Payment method diversity**: COD (Cash on Delivery) dominates at 60-70% of transactions. This means purchase signals are delayed and noisier — cancellation rates are high (15-25%). Weight confirmed-delivery events higher than order-placed events in training.
- **Address data**: Vietnamese addresses are inconsistent (e.g., multiple ways to write "Quan 1, TP.HCM"). Normalize with a Vietnamese address parser before using location as a feature. Consider ward/district-level encoding rather than raw text.
- **Language in product data**: product titles mix Vietnamese and English. Use multilingual embeddings (e.g., multilingual-e5) for text features. Vietnamese word segmentation (VnCoreNLP, Underthesea) is needed for tokenization-based approaches.
- **Seasonal patterns**: major spikes during Tet (January/February), 11.11, 12.12 sales events. Build separate feature windows for sale vs normal periods.
