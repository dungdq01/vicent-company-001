# Data Engineer Notes: Anomaly Detection & Monitoring (B07)
## By DataFlow Architect (R-DE) — Date: 2026-03-31

### 1. Streaming vs Batch Pipeline Architecture

**Batch pipelines** suit historical analysis, model retraining, and periodic reporting. Typical cadence: hourly to daily. Tools: Spark, dbt, Airflow.

**Streaming pipelines** are mandatory for real-time alerting (fraud, intrusion, equipment failure). Tools: Kafka + Flink, Kafka Streams, Spark Structured Streaming. Latency target: sub-second to low-seconds.

**Lambda architecture** (batch + streaming in parallel) is proven but operationally expensive. Prefer **Kappa architecture** (streaming-first with replay) when the team can handle it. Use Kafka as the immutable log; replay from offset for reprocessing.

**Practical pattern:**
- Ingest raw events into Kafka topics (partitioned by entity ID)
- Flink job computes rolling features (windows: 1min, 5min, 1hr, 24hr)
- Feature vectors land in a feature store (Feast, Tecton) for both training and serving
- Batch pipeline backfills features nightly for model retraining

### 2. Data Quality for Anomaly Systems

Anomaly detectors are extremely sensitive to data quality — garbage in means false positives out.

**Critical checks:**
- **Completeness**: Missing sensor readings or transaction fields cause phantom anomalies. Implement null-rate monitoring per column with alerting at >1% threshold.
- **Freshness**: Stale data in streaming = missed anomalies. Track event-time vs processing-time lag. Alert if lag exceeds 2x normal.
- **Schema drift**: Upstream schema changes break feature engineering. Use schema registry (Confluent Schema Registry) with compatibility checks.
- **Volume anomalies**: Sudden drops/spikes in event volume are themselves anomalies. Monitor with statistical process control on ingestion rates.
- **Duplicate detection**: Exactly-once semantics are hard. Use idempotent writes with event ID deduplication windows (Flink's built-in dedup or Redis-based).

**Tool recommendations:** Great Expectations for batch validation, custom Flink operators for streaming validation, Monte Carlo or Soda for observability.

### 3. Feature Engineering for Anomaly Scoring

**Time-window aggregations** (the backbone):
- Count, sum, mean, stddev, min, max over sliding windows
- Multiple window sizes capture different anomaly timescales
- Example: transaction_count_1hr, transaction_amount_stddev_24hr

**Behavioral features:**
- Deviation from entity's historical baseline (z-score relative to entity mean)
- Time-since-last-event features (detect unusual gaps or bursts)
- Sequence features (n-gram frequency of event types)

**Graph/relational features:**
- Entity connectivity metrics (how many unique counterparties in a window)
- Shared attributes across entities (same IP, device, location)

**Encoding strategies:**
- Categorical: target encoding, frequency encoding (avoid one-hot for high cardinality)
- Temporal: cyclical encoding (hour_sin, hour_cos, day_of_week_sin)
- Geospatial: geohash, distance-from-usual-location

### 4. Handling Imbalanced Data

Anomalies are rare by definition — typically 0.01% to 1% of data.

**Pipeline-level strategies:**
- Store all confirmed anomalies in a dedicated "anomaly bank" table for easy retrieval
- Implement stratified sampling in training data extraction
- Maintain separate data paths for normal vs anomaly examples
- Version anomaly labels alongside data versions (DVC or LakeFS)

**Do NOT oversample in the pipeline** — leave resampling to the ML training step. The pipeline should deliver clean, complete, labeled data with metadata about class distribution.

### 5. Labeling Strategies

**Sources of labels:**
- Expert review (gold standard but expensive — budget 2-5 labels per analyst per hour for complex domains)
- Rule-based auto-labeling (high-confidence rules generate weak labels at scale)
- Feedback loops from production (user confirms/dismisses alerts)
- Active learning queries (model requests labels for uncertain cases)

**Pipeline implementation:**
- Build a labeling queue service: anomaly candidates go in, labeled examples come out
- Store labels with provenance (who labeled, when, confidence, method)
- Implement label versioning — labels change as understanding improves
- Separate label storage from feature storage; join at training time

### 6. Data Drift Detection Pipelines

**What to monitor:**
- **Feature drift**: Distribution shift in input features (Population Stability Index, KL divergence, KS test)
- **Concept drift**: Relationship between features and anomaly labels changes
- **Upstream drift**: Changes in source system behavior

**Implementation:**
- Compute reference distributions from training data, store as statistical profiles
- Streaming job computes live distributions over rolling windows
- Compare live vs reference using PSI (alert if PSI > 0.2) or KS test (alert if p < 0.05)
- Run drift detection on every feature, aggregate into a drift dashboard
- Trigger automated model retraining when drift exceeds threshold for >N hours

**Storage schema for drift metrics:**
```
drift_metrics(
  feature_name, window_start, window_end,
  psi_score, ks_statistic, ks_pvalue,
  reference_mean, current_mean,
  reference_stddev, current_stddev,
  alert_triggered BOOLEAN
)
```

### 7. Technology Stack Recommendation

| Layer | Batch | Streaming |
|-------|-------|-----------|
| Ingestion | Airbyte, Fivetran | Kafka, Kafka Connect |
| Processing | Spark, dbt | Flink, Kafka Streams |
| Feature Store | Feast (offline) | Feast (online), Redis |
| Orchestration | Airflow, Dagster | Flink checkpointing |
| Storage | Delta Lake, Iceberg | Kafka (hot), S3 (warm) |
| Quality | Great Expectations | Custom Flink operators |

### Recommendations for B07

1. **Start with Kappa architecture** — a single streaming pipeline with replay capability reduces operational complexity vs Lambda.
2. **Invest heavily in data quality** before model quality. A clean pipeline with a simple model beats a dirty pipeline with a complex model.
3. **Build the labeling pipeline early** — it is the bottleneck for moving from unsupervised to semi-supervised approaches.
4. **Implement drift detection from day one** — anomaly detectors degrade silently without it.
5. **Use a feature store** to ensure training-serving consistency. Feature skew is the number one cause of production anomaly detection failures.
6. **Design for replay** — when models improve, you need to re-score historical data. Immutable event logs make this possible.
