# Tech Report: Recommendation Systems (B05)
## By Dr. Praxis (R-beta) — Date: 2026-03-31

---

### 1. Implementation Summary

Recommendation Systems in production follow a multi-stage funnel architecture: candidate retrieval via approximate nearest neighbor (ANN) search over learned embeddings, followed by a feature-rich ranking model, business rule post-processing, and A/B-tested serving. The dominant training paradigm is the two-tower model producing user and item embeddings trained with contrastive or BPR loss, stored in a vector index (FAISS or Milvus) for sub-millisecond retrieval. Real-time feature pipelines powered by Kafka, Flink, and a feature store (Feast or Tecton) ensure model inputs reflect the latest user behavior. Model serving is handled by FastAPI or Triton Inference Server behind a load balancer, with latency budgets typically under 100ms end-to-end. The entire system is orchestrated with Airflow for offline pipelines and monitored via Prometheus/Grafana with alerting on metric drift, model staleness, and serving errors.

---

### 2. Tech Stack Decision Matrix

| Layer | Technology | Version | Alternatives | Why This One | Cost |
|-------|-----------|---------|-------------|--------------|------|
| **Event Tracking** | Segment + Kafka | Segment latest / Kafka 3.7 | Snowplow, Rudderstack, Google Analytics | Segment provides turnkey SDKs with schema enforcement; Kafka decouples ingestion from processing at any scale | Segment ~$120/mo (10K MTU); Kafka self-hosted ~$500/mo or Confluent Cloud ~$1/GB |
| **Feature Store** | Feast | 0.40+ | Tecton, Hopsworks, Vertex AI Feature Store | Open-source, dual online/offline serving, integrates with any ML framework, avoids vendor lock-in | Free (self-hosted); Redis backing store ~$50-200/mo |
| **Embedding / Retrieval (ANN)** | FAISS + Milvus | FAISS 1.8 / Milvus 2.4 | ScaNN, Pinecone, Weaviate, Qdrant | FAISS is the gold standard for speed on GPU; Milvus adds managed persistence, filtering, and horizontal scaling | FAISS free; Milvus self-hosted ~$300/mo or Zilliz Cloud ~$0.10/hr |
| **Training Framework** | PyTorch + TorchRec | PyTorch 2.4 / TorchRec 0.8 | TensorFlow, JAX, RecBole | PyTorch dominates research and industry; TorchRec provides distributed embedding tables, sharding, and RecSys primitives | Free; GPU compute ~$1-3/hr (A100) |
| **Ranking Model Serving** | Triton Inference Server | 24.01+ | TorchServe, TF Serving, BentoML, Ray Serve | Triton supports multi-framework (PyTorch, ONNX, TensorRT), dynamic batching, model ensembles, and GPU sharing | Free (open-source); GPU instance ~$2-4/hr |
| **Orchestration** | Apache Airflow | 2.9+ | Prefect, Dagster, Kubeflow Pipelines | Mature, battle-tested for ML pipelines, vast operator ecosystem, strong community | Free (self-hosted); Astronomer managed ~$500/mo |
| **A/B Testing** | Growthbook | 2.x | LaunchDarkly, Unleash, Optimizely, Statsig | Open-source, Bayesian statistics built-in, feature flags + experimentation in one tool, self-hostable | Free (self-hosted); Cloud $0-$1K/mo |
| **Monitoring** | Prometheus + Grafana + Evidently | Latest stable | Datadog, New Relic, Arize, WhyLabs | Prometheus/Grafana for infra metrics (free); Evidently for ML-specific drift detection and data quality | Free (self-hosted); Datadog alternative ~$23/host/mo |

---

### 3. Pipeline Architecture

#### 3a. Training Pipeline (Offline)

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐    ┌───────────────┐
│   Data   │───>│   Feature    │───>│    Model     │───>│ Evaluation │───>│    Model      │
│Extraction│    │ Engineering  │    │  Training    │    │ & Metrics  │    │   Registry    │
└──────────┘    └──────────────┘    └──────────────┘    └────────────┘    └───────────────┘
  (Spark/SQL)    (Feast offline)     (PyTorch DDP)      (offline eval)    (MLflow/W&B)
```

| Stage | Tool | Input | Output | Duration | Notes |
|-------|------|-------|--------|----------|-------|
| Data Extraction | Spark SQL / dbt | Warehouse (BigQuery, Snowflake) | Parquet interaction logs, user/item features | 30-60 min | Incremental extraction, last 90 days typically |
| Feature Engineering | Feast (offline store) + Pandas/Polars | Raw interactions + entity features | Training-ready feature matrix with point-in-time joins | 20-40 min | Prevents data leakage via point-in-time correctness |
| Model Training | PyTorch DDP on GPU cluster | Feature matrix | Two-tower model checkpoint + item embeddings | 2-8 hrs (A100) | BPR/InfoNCE loss; in-batch negatives; gradient accumulation |
| Evaluation | RecBole / custom scripts | Held-out test set | NDCG@K, Recall@K, MRR, coverage, diversity metrics | 10-20 min | Compare against baseline; gate on metric thresholds |
| Model Registry | MLflow | Model checkpoint + metrics + config | Versioned model artifact, promotion to staging/prod | 5 min | Auto-tag with training params and evaluation metrics |

#### 3b. Serving Pipeline (Online)

```
┌─────────┐   ┌──────────────┐   ┌────────────────┐   ┌──────────┐   ┌──────────────┐   ┌──────────┐
│ Request │──>│   Feature    │──>│   Candidate    │──>│ Ranking  │──>│  Business    │──>│ Response │
│ (user)  │   │  Assembly    │   │   Retrieval    │   │  Model   │   │  Rules /     │   │  (items) │
└─────────┘   └──────────────┘   └────────────────┘   └──────────┘   │  Re-ranking  │   └──────────┘
               (Feast online)     (FAISS/Milvus ANN)   (Triton)      └──────────────┘
                  ~5ms                ~10ms              ~20ms            ~5ms
```

| Stage | Latency | Tool | Details |
|-------|---------|------|---------|
| Feature Assembly | ~5ms | Feast online store (Redis) | Fetch user features, recent behavior sequence, context features |
| Candidate Retrieval | ~10ms | FAISS (GPU) or Milvus | User tower inference -> user embedding -> ANN top-500 retrieval |
| Ranking | ~20ms | Triton (PyTorch/ONNX) | Score 500 candidates with full-feature ranking model (DeepFM/DIN) |
| Business Rules / Re-ranking | ~5ms | Custom Python | Diversity injection, stock filtering, sponsor slots, freshness boost |
| Total E2E | <50ms | FastAPI orchestration | Well within 100ms budget; leaves headroom for network latency |

#### 3c. Real-time Feature Pipeline

```
┌────────────┐    ┌─────────┐    ┌──────────────┐    ┌──────────────────┐    ┌───────────────┐
│   User     │───>│  Kafka  │───>│  Flink/Spark │───>│  Feature Store   │───>│   Serving     │
│Interactions│    │ Topics  │    │  Streaming   │    │  (Online: Redis) │    │   Pipeline    │
│ (clicks,   │    │         │    │  (windowed   │    │                  │    │               │
│  views,    │    │         │    │   aggregates)│    │                  │    │               │
│  purchases)│    │         │    │              │    │                  │    │               │
└────────────┘    └─────────┘    └──────────────┘    └──────────────────┘    └───────────────┘
                                  - click count (5m)
                                  - category affinity (1h)
                                  - trending items (15m)
```

Key streaming features computed in real time:
- **User-level:** click count last 5 min, category distribution last 1 hour, last 10 viewed item IDs
- **Item-level:** click velocity (clicks/min), add-to-cart rate last 30 min, trending score
- **Cross features:** user-category affinity score (updated every interaction)

#### 3d. Feedback Loop Pipeline

```
┌────────────────┐    ┌────────────┐    ┌───────────────┐    ┌──────────────┐    ┌──────────┐
│     User       │───>│  Event Log │───>│   Retrain     │───>│    Model     │───>│  Deploy  │
│  Interactions  │    │  (Kafka -> │    │   Trigger     │    │   Update     │    │  (canary │
│  (served recs  │    │   S3/GCS)  │    │ (daily cron / │    │  (full or    │    │   then   │
│   + feedback)  │    │            │    │  drift alert) │    │   incremental│    │   swap)  │
└────────────────┘    └────────────┘    └───────────────┘    └──────────────┘    └──────────┘
                                         Airflow DAG          PyTorch DDP         Triton
                                         triggers at          2-8 hrs             model reload
                                         02:00 daily                              + ANN index
                                                                                  rebuild
```

Feedback loop cadence:
- **Daily:** Full model retrain on last 90 days of data; rebuild FAISS index; canary deploy
- **Hourly (optional):** Incremental embedding update for new items; append to ANN index
- **Real-time:** Feature store updates (not model weights) to reflect latest behavior
- **Drift trigger:** If Evidently detects feature drift or metric degradation beyond threshold, trigger immediate retrain

---

### 4. Key Code Patterns

#### 4a. Two-Tower Model Training (PyTorch)

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import faiss
import numpy as np

class Tower(nn.Module):
    """Generic tower for user or item encoding."""
    def __init__(self, input_dim: int, embed_dim: int = 128, hidden_dims: list = [256, 128]):
        super().__init__()
        layers = []
        prev_dim = input_dim
        for h_dim in hidden_dims:
            layers.extend([nn.Linear(prev_dim, h_dim), nn.ReLU(), nn.BatchNorm1d(h_dim)])
            prev_dim = h_dim
        layers.append(nn.Linear(prev_dim, embed_dim))
        self.network = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        emb = self.network(x)
        return F.normalize(emb, p=2, dim=1)  # L2 normalize for cosine similarity


class TwoTowerModel(nn.Module):
    """Two-tower model with in-batch negative contrastive loss."""
    def __init__(self, user_input_dim: int, item_input_dim: int, embed_dim: int = 128):
        super().__init__()
        self.user_tower = Tower(user_input_dim, embed_dim)
        self.item_tower = Tower(item_input_dim, embed_dim)
        self.temperature = nn.Parameter(torch.tensor(0.07))

    def forward(self, user_features: torch.Tensor, item_features: torch.Tensor):
        user_emb = self.user_tower(user_features)   # (B, D)
        item_emb = self.item_tower(item_features)    # (B, D)
        return user_emb, item_emb

    def contrastive_loss(self, user_emb: torch.Tensor, item_emb: torch.Tensor) -> torch.Tensor:
        """InfoNCE loss with in-batch negatives."""
        # Similarity matrix: (B, B) — diagonal entries are positives
        logits = torch.matmul(user_emb, item_emb.T) / self.temperature
        labels = torch.arange(logits.size(0), device=logits.device)
        loss = F.cross_entropy(logits, labels)
        return loss


def build_faiss_index(model: TwoTowerModel, item_features: np.ndarray, embed_dim: int = 128):
    """Build FAISS index from all item embeddings for ANN retrieval."""
    model.eval()
    with torch.no_grad():
        item_tensor = torch.tensor(item_features, dtype=torch.float32)
        item_embeddings = model.item_tower(item_tensor).cpu().numpy()

    # IVF index for large-scale approximate search
    nlist = min(4096, len(item_embeddings) // 40)
    quantizer = faiss.IndexFlatIP(embed_dim)  # Inner product (embeddings are L2-normalized)
    index = faiss.IndexIVFFlat(quantizer, embed_dim, nlist, faiss.METRIC_INNER_PRODUCT)
    index.train(item_embeddings)
    index.add(item_embeddings)
    index.nprobe = 64  # Search 64 clusters at query time
    return index, item_embeddings


# Training loop
def train_two_tower(model, train_loader, epochs=10, lr=1e-3):
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for user_feat, item_feat in train_loader:
            user_emb, item_emb = model(user_feat, item_feat)
            loss = model.contrastive_loss(user_emb, item_emb)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(train_loader):.4f}")
```

#### 4b. Feature Store with Feast

```python
from feast import FeatureStore, Entity, FeatureView, Field, FileSource
from feast.types import Float32, Int64, String
from datetime import timedelta

# === Feature Definitions (feature_repo/features.py) ===

# Entity definitions
user = Entity(name="user_id", join_keys=["user_id"], description="Platform user")
item = Entity(name="item_id", join_keys=["item_id"], description="Catalog item")

# Offline data source (Parquet on S3/GCS)
user_stats_source = FileSource(
    path="s3://recsys-features/user_stats.parquet",
    timestamp_field="event_timestamp",
)

item_stats_source = FileSource(
    path="s3://recsys-features/item_stats.parquet",
    timestamp_field="event_timestamp",
)

# User feature view — aggregated user behavior features
user_features = FeatureView(
    name="user_features",
    entities=[user],
    ttl=timedelta(hours=24),
    schema=[
        Field(name="total_clicks_7d", dtype=Int64),
        Field(name="total_purchases_30d", dtype=Int64),
        Field(name="avg_order_value", dtype=Float32),
        Field(name="preferred_category", dtype=String),
        Field(name="click_through_rate", dtype=Float32),
        Field(name="days_since_last_purchase", dtype=Int64),
    ],
    source=user_stats_source,
    online=True,
)

# Item feature view — item metadata and popularity signals
item_features = FeatureView(
    name="item_features",
    entities=[item],
    ttl=timedelta(hours=6),
    schema=[
        Field(name="category", dtype=String),
        Field(name="price", dtype=Float32),
        Field(name="click_count_24h", dtype=Int64),
        Field(name="conversion_rate_7d", dtype=Float32),
        Field(name="avg_rating", dtype=Float32),
        Field(name="seller_rating", dtype=Float32),
    ],
    source=item_stats_source,
    online=True,
)


# === Materialization (run daily via Airflow) ===
# feast materialize-incremental $(date +%Y-%m-%dT%H:%M:%S)


# === Serving at inference time ===
def get_user_features_online(user_ids: list[str]) -> dict:
    """Fetch user features from online store for real-time serving."""
    store = FeatureStore(repo_path="feature_repo/")
    entity_rows = [{"user_id": uid} for uid in user_ids]
    features = store.get_online_features(
        features=[
            "user_features:total_clicks_7d",
            "user_features:total_purchases_30d",
            "user_features:avg_order_value",
            "user_features:preferred_category",
            "user_features:click_through_rate",
        ],
        entity_rows=entity_rows,
    )
    return features.to_dict()


# === Training data retrieval (point-in-time correct) ===
def get_training_data(entity_df):
    """Fetch historical features for training with point-in-time joins."""
    store = FeatureStore(repo_path="feature_repo/")
    training_df = store.get_historical_features(
        entity_df=entity_df,  # DataFrame with user_id, item_id, event_timestamp, label
        features=[
            "user_features:total_clicks_7d",
            "user_features:avg_order_value",
            "item_features:price",
            "item_features:conversion_rate_7d",
        ],
    ).to_df()
    return training_df
```

#### 4c. ANN Retrieval with FAISS/Milvus

```python
import faiss
import numpy as np
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility

# === Option 1: FAISS (in-process, fastest for single-node) ===

class FAISSRetriever:
    def __init__(self, embed_dim: int = 128):
        self.embed_dim = embed_dim
        self.index = None
        self.item_ids = None

    def build_index(self, item_embeddings: np.ndarray, item_ids: np.ndarray):
        """Build IVF-PQ index for billion-scale retrieval."""
        n_items = len(item_embeddings)
        self.item_ids = item_ids

        if n_items < 100_000:
            # Flat index for small catalogs — exact search
            self.index = faiss.IndexFlatIP(self.embed_dim)
        else:
            # IVF-PQ for large catalogs — approximate search
            nlist = min(4096, n_items // 40)
            m_subquantizers = 32  # Number of sub-quantizers
            nbits = 8
            quantizer = faiss.IndexFlatIP(self.embed_dim)
            self.index = faiss.IndexIVFPQ(
                quantizer, self.embed_dim, nlist, m_subquantizers, nbits,
                faiss.METRIC_INNER_PRODUCT
            )
            self.index.train(item_embeddings)

        self.index.add(item_embeddings)
        self.index.nprobe = 64

    def retrieve(self, user_embedding: np.ndarray, top_k: int = 500) -> list[tuple]:
        """Retrieve top-K candidates given user embedding."""
        scores, indices = self.index.search(user_embedding.reshape(1, -1), top_k)
        results = [
            (self.item_ids[idx], float(score))
            for idx, score in zip(indices[0], scores[0])
            if idx >= 0
        ]
        return results


# === Option 2: Milvus (distributed, with metadata filtering) ===

class MilvusRetriever:
    def __init__(self, collection_name: str = "item_embeddings", embed_dim: int = 128):
        connections.connect("default", host="localhost", port="19530")
        self.collection_name = collection_name
        self.embed_dim = embed_dim
        self._ensure_collection()

    def _ensure_collection(self):
        if not utility.has_collection(self.collection_name):
            fields = [
                FieldSchema(name="item_id", dtype=DataType.VARCHAR, is_primary=True, max_length=64),
                FieldSchema(name="category", dtype=DataType.VARCHAR, max_length=128),
                FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=self.embed_dim),
            ]
            schema = CollectionSchema(fields, description="Item embeddings for ANN retrieval")
            Collection(self.collection_name, schema)

    def upsert_embeddings(self, item_ids: list, categories: list, embeddings: np.ndarray):
        collection = Collection(self.collection_name)
        collection.insert([item_ids, categories, embeddings.tolist()])
        collection.create_index("embedding", {"index_type": "IVF_FLAT", "metric_type": "IP", "params": {"nlist": 2048}})
        collection.load()

    def retrieve(self, user_embedding: np.ndarray, top_k: int = 500, category_filter: str = None):
        collection = Collection(self.collection_name)
        search_params = {"metric_type": "IP", "params": {"nprobe": 64}}
        expr = f'category == "{category_filter}"' if category_filter else None
        results = collection.search(
            data=[user_embedding.tolist()],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            expr=expr,
            output_fields=["item_id", "category"],
        )
        return [(hit.entity.get("item_id"), hit.score) for hit in results[0]]
```

#### 4d. Recommendation API (FastAPI)

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import time
import logging

app = FastAPI(title="RecSys Serving API")
logger = logging.getLogger("recsys")

# Global singletons loaded at startup
user_tower_model = None      # PyTorch user tower
ranking_model = None          # Ranking model (DeepFM/DIN via Triton client)
faiss_retriever = None        # FAISSRetriever instance
feature_store = None          # Feast FeatureStore
popularity_fallback = None    # Pre-computed popular items list


class RecommendRequest(BaseModel):
    user_id: str
    num_results: int = 20
    context: dict = {}        # device, location, time_of_day


class RecommendedItem(BaseModel):
    item_id: str
    score: float
    explanation: str


class RecommendResponse(BaseModel):
    user_id: str
    items: list[RecommendedItem]
    latency_ms: float
    model_version: str
    is_fallback: bool = False


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": user_tower_model is not None}


@app.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    start = time.perf_counter()

    try:
        # Step 1: Fetch user features from online store (~5ms)
        user_features = feature_store.get_online_features(
            features=["user_features:total_clicks_7d", "user_features:avg_order_value",
                       "user_features:preferred_category", "user_features:click_through_rate"],
            entity_rows=[{"user_id": req.user_id}],
        ).to_dict()

        # Step 2: Compute user embedding via user tower (~3ms)
        user_feat_vector = _prepare_user_features(user_features, req.context)
        user_embedding = user_tower_model.encode(user_feat_vector)

        # Step 3: ANN candidate retrieval — top 500 (~10ms)
        candidates = faiss_retriever.retrieve(user_embedding, top_k=500)

        if len(candidates) < 10:
            raise ValueError("Too few candidates from retrieval")

        # Step 4: Fetch item features for candidates (~5ms, batched Redis lookup)
        candidate_ids = [c[0] for c in candidates]
        item_features = _fetch_item_features_batch(candidate_ids)

        # Step 5: Ranking model scores all candidates (~20ms)
        ranked = _rank_candidates(user_features, item_features, candidate_ids)

        # Step 6: Business rules post-processing (~2ms)
        final_items = _apply_business_rules(ranked, req.num_results)

        # Step 7: Generate explanations
        items_with_explanations = [
            RecommendedItem(
                item_id=item["item_id"],
                score=item["score"],
                explanation=_generate_explanation(item, user_features),
            )
            for item in final_items
        ]

        latency = (time.perf_counter() - start) * 1000
        logger.info(f"user={req.user_id} latency={latency:.1f}ms candidates={len(candidates)}")

        return RecommendResponse(
            user_id=req.user_id,
            items=items_with_explanations,
            latency_ms=round(latency, 1),
            model_version="v2.3.1-twotower",
        )

    except Exception as e:
        # Fallback to popularity-based recommendations
        logger.warning(f"Fallback for user={req.user_id}: {e}")
        latency = (time.perf_counter() - start) * 1000
        return RecommendResponse(
            user_id=req.user_id,
            items=[
                RecommendedItem(item_id=pid, score=1.0 - i * 0.01, explanation="Popular item")
                for i, pid in enumerate(popularity_fallback[:req.num_results])
            ],
            latency_ms=round(latency, 1),
            model_version="fallback-popularity",
            is_fallback=True,
        )


def _apply_business_rules(ranked: list[dict], n: int) -> list[dict]:
    """Post-processing: diversity, stock check, sponsor slots."""
    seen_categories = {}
    filtered = []
    for item in ranked:
        cat = item.get("category", "unknown")
        # Max 3 items per category in top results (diversity)
        if seen_categories.get(cat, 0) >= 3:
            continue
        # Skip out-of-stock
        if item.get("in_stock", True) is False:
            continue
        seen_categories[cat] = seen_categories.get(cat, 0) + 1
        filtered.append(item)
        if len(filtered) >= n:
            break
    return filtered


def _generate_explanation(item: dict, user_features: dict) -> str:
    """Rule-based explanation generation."""
    pref_cat = user_features.get("user_features:preferred_category", [None])[0]
    if item.get("category") == pref_cat:
        return f"Based on your interest in {pref_cat}"
    if item.get("click_count_24h", 0) > 1000:
        return "Trending right now"
    if item.get("conversion_rate_7d", 0) > 0.1:
        return "Highly rated by similar shoppers"
    return "Recommended for you"
```

---

### 5. Production Considerations

| Aspect | Requirement | Approach | Cost |
|--------|------------|----------|------|
| **Latency** | p99 < 100ms end-to-end | Pre-computed item embeddings in FAISS (GPU); user tower inference ~3ms; ranking via Triton with dynamic batching; Redis feature store with <2ms p99 | GPU instance for FAISS + Triton ~$2-4/hr |
| **Throughput** | 10,000 requests/sec | Horizontal scaling: 4-8 FastAPI replicas behind ALB; FAISS index replicated per replica (shared memory); Triton auto-scaling based on queue depth | ~$3K-5K/mo for 10K rps sustained |
| **Model Freshness** | Daily full retrain; hourly item embedding update | Airflow DAG at 02:00 UTC for full retrain (2-8 hrs on 4xA100); hourly incremental: new item embeddings appended to FAISS index without full rebuild | Training GPU ~$50-100/day |
| **A/B Testing** | Every model change validated online | Growthbook feature flags route traffic (90/10 split); primary metrics: CTR, conversion, revenue/session; guardrail metrics: page load time, error rate; 7-day experiment minimum | Growthbook self-hosted: free |
| **Fallback Strategy** | Graceful degradation on any component failure | Popularity-based fallback pre-computed hourly; cached in Redis; triggered if retrieval returns <10 candidates, ranking model timeout >50ms, or feature store unavailable | Negligible (Redis key) |
| **Cold Start (Users)** | New users with zero history | First session: popularity + trending; after 3-5 clicks: real-time feature pipeline updates context; content-based tower (item features only) provides initial personalization | No additional cost |
| **Cold Start (Items)** | New items with zero interactions | Content-based item embedding from item tower (title, category, price, images); injected into FAISS index hourly; exploration boost via Thompson Sampling for new items in first 48 hrs | No additional cost |
| **Data Quality** | Prevent garbage-in-garbage-out | Evidently data quality checks in Airflow DAG: null rate, feature distribution drift, label distribution shift; block training if checks fail; alert on-call | Evidently OSS: free |
| **Model Rollback** | Instant rollback on regression | MLflow model registry with staging/production stages; Triton model repository supports version pinning; canary deploy (5% traffic for 2 hrs) before full rollout | No additional cost |

---

### 6. Framework Comparison

| Framework | Best For | Scale | Community | Production Ready | License | Notes |
|-----------|----------|-------|-----------|-----------------|---------|-------|
| **RecBole** | Research benchmarking, rapid prototyping | Medium (~10M interactions) | Strong (4K+ GitHub stars, active) | Partial — good for offline eval, not designed for serving | MIT | 90+ models implemented; great for comparing algorithms; Python-only |
| **Merlin (NVIDIA)** | GPU-accelerated training + serving pipeline | Massive (billions) | Growing (NVIDIA-backed) | Yes — integrated with Triton | Apache 2.0 | NVTabular for feature engineering, HugeCTR for training, Triton for serving; requires NVIDIA GPUs |
| **TorchRec (Meta)** | Distributed embedding training at scale | Massive (trillions of features) | Growing (Meta-backed) | Yes — powers Meta's ads | BSD | Sharded embedding tables across GPUs; DLRM reference impl; steep learning curve |
| **Surprise** | Teaching, small explicit-rating datasets | Small (~1M ratings) | Stable (mature, 6K+ stars) | No — research/education only | BSD | Clean API for CF basics (SVD, KNN, NMF); no GPU support; no implicit feedback |
| **LightFM** | Hybrid CF + content features, cold start | Medium (~10M interactions) | Stable (4K+ stars) | Partial — good for batch recs | Apache 2.0 | Unique: factorization model that natively incorporates item/user metadata; CPU-only |
| **implicit** | Implicit feedback CF at scale | Large (~100M interactions) | Stable (3K+ stars) | Partial — efficient batch inference | MIT | ALS, BPR, logistic MF on GPU (CuPy); fastest single-box implicit CF library |
| **AWS Personalize** | Managed RecSys with zero ML expertise | Any | N/A (managed service) | Yes — fully managed | Proprietary | Black-box; pricing per inference (~$0.05/1K recs); easy start but limited customization |
| **Google Recommendations AI** | Retail product recommendations | Any | N/A (managed service) | Yes — fully managed | Proprietary | Optimized for e-commerce; integrates with Google Merchant Center; pay-per-prediction |

---

### 7. Effort Estimation

| Use Case | Duration | Team | GPU Cost | Notes |
|----------|----------|------|----------|-------|
| **Basic CF MVP** (implicit ALS + popularity fallback) | 2-3 weeks | 1 ML engineer + 1 backend | $0 (CPU-only) | LightFM or implicit library; batch recommendations precomputed nightly; Redis serving; suitable for <100K users |
| **Two-Tower Production System** (retrieval + ranking + feature store) | 2-3 months | 2 ML engineers + 1 data engineer + 1 backend | ~$2K-5K/mo (4xA100 training + 1xT4 serving) | Full pipeline: Feast + PyTorch two-tower + FAISS + FastAPI + Airflow; handles 1M+ users; daily retrain |
| **Real-Time Deep RecSys** (DIN/DIEN ranking + streaming features + A/B) | 4-6 months | 3 ML engineers + 2 data engineers + 1 backend + 1 SRE | ~$8K-15K/mo (training cluster + serving GPUs + Kafka/Flink infra) | Full multi-stage funnel; real-time Flink features; A/B platform; multi-task ranking; handles 10M+ users |
| **LLM-Enhanced Recommendations** (LLM for cold-start + explanation generation) | 6-9 months | 4 ML engineers + 2 data engineers + 1 NLP specialist + 1 backend | ~$15K-30K/mo (LLM inference GPUs + RecSys infra) | Hybrid: lightweight models for warm users, LLM for cold-start/long-tail; knowledge distillation from LLM to compact model; Vietnamese language model for product understanding |

---

### 8. Recommended Starter Stacks for Vietnamese Teams

#### Minimal Stack (No GPU, < $100/mo)
- **Model:** `implicit` library (ALS) or LightFM (hybrid with content features)
- **Serving:** Flask or FastAPI, batch-computed recommendations stored in Redis
- **Data:** PostgreSQL for interactions, daily cron job for model retrain
- **Monitoring:** Basic logging + Grafana for API metrics
- **Best for:** Startups with <100K users, limited engineering team (1-2 people)
- **Timeline:** 2-3 weeks to production
- **Vietnamese advantage:** LightFM can incorporate Vietnamese product category features for cold-start without NLP

#### Mid-Tier Stack ($500-2K/mo)
- **Model:** Two-tower PyTorch (user tower + item tower with InfoNCE loss)
- **Retrieval:** FAISS on CPU (sufficient for <10M items) or single GPU
- **Features:** Feast with Redis online store + S3 offline store
- **Serving:** FastAPI with async endpoints; 2-4 replicas behind Nginx
- **Training:** Single A100 spot instance on AWS/GCP (~$1.5/hr, 4-8 hrs daily)
- **Orchestration:** Airflow for daily retrain DAG
- **Best for:** Growing platforms with 100K-5M users, 3-5 person ML team
- **Timeline:** 2-3 months to production
- **Vietnamese advantage:** Two-tower architecture lets you encode Vietnamese product titles via PhoBERT embeddings in the item tower

#### Enterprise Stack ($5K-15K/mo)
- **Model:** Multi-stage funnel — two-tower retrieval + DIN/DeepFM ranking + multi-task (CTR + CVR)
- **Retrieval:** Milvus cluster for filtered ANN search with metadata
- **Features:** Feast + Apache Flink for real-time streaming features via Kafka
- **Serving:** Triton Inference Server on GPU instances with dynamic batching
- **A/B Testing:** Growthbook or Statsig for experiment management
- **Training:** 4xA100 cluster (on-demand or reserved) with PyTorch DDP
- **Monitoring:** Prometheus + Grafana + Evidently for ML-specific monitoring
- **Orchestration:** Airflow + Kubernetes (EKS/GKE) for auto-scaling
- **Best for:** Established platforms with 5M+ users, 8+ person ML/data team
- **Timeline:** 4-6 months to production
- **Vietnamese advantage:** Real-time features can capture flash-sale behavior patterns common on Vietnamese e-commerce platforms (Shopee 9.9, Tiki mega-sale)

---

### 9. Known Limitations & Workarounds

| Limitation | Impact | Workaround | Complexity |
|-----------|--------|-----------|------------|
| **Cold-Start Problem** | New users/items get poor recommendations; up to 30% of traffic may be cold-start | Multi-pronged: (1) popularity fallback for first session, (2) content-based item tower for new items, (3) onboarding quiz for explicit preferences, (4) Thompson Sampling exploration boost for new items | Medium |
| **Popularity Bias in Training** | Model learns to recommend already-popular items, creating feedback loop; long-tail items get zero exposure | (1) Inverse propensity scoring (IPS) in training loss, (2) negative sampling weighted by item popularity, (3) explicit diversity constraints in re-ranking, (4) causal debiasing methods (e.g., DICE) | Medium-High |
| **Offline-Online Metric Gap** | Model improves offline metrics (NDCG, Recall) but degrades online KPIs (CTR, revenue) | (1) Use counterfactual evaluation (IPS estimators) offline, (2) include business metrics as multi-task objectives in training, (3) always validate with online A/B tests before full deployment, (4) track correlation between offline and online metrics to calibrate | High |
| **Embedding Table Size** | Large catalogs (10M+ items) produce multi-GB embedding tables that strain GPU memory and index size | (1) Product quantization (PQ) in FAISS reduces memory 4-8x with <5% recall loss, (2) feature hashing for long-tail items, (3) mixed-dimension embeddings (popular items get larger embeddings), (4) periodic pruning of inactive item embeddings | Medium |
| **Feature Freshness vs. Cost** | Real-time features improve quality but Kafka+Flink infrastructure is expensive and complex | (1) Start with batch features (daily), add real-time only for high-impact features (last-clicked category, trending score), (2) use windowed aggregates in Redis (cheaper than full Flink), (3) near-real-time micro-batches (5-min Spark Structured Streaming) as middle ground | Medium |
| **Position Bias in Click Data** | Items shown in top positions get more clicks regardless of relevance; model learns position effects | (1) Position feature in training + remove at serving, (2) inverse propensity weighting by position, (3) randomized serving experiments to collect unbiased data (costly but gold standard) | Medium |
| **Multi-Objective Conflicts** | Optimizing CTR may hurt conversion or long-term retention; seesaw effect in multi-task learning | (1) PLE architecture with task-specific experts, (2) Pareto-optimal multi-objective optimization, (3) constrained optimization (maximize CTR subject to minimum CVR threshold), (4) scalarization with business-determined weights | High |
| **Serving Latency Under Load** | p99 latency spikes during traffic peaks (flash sales, campaigns) | (1) Pre-warm FAISS index in memory, (2) adaptive candidate pool (reduce top-K under load), (3) circuit breaker pattern with popularity fallback, (4) over-provision by 2x for peak headroom | Low-Medium |

---

### 10. Vietnam-Specific Considerations

#### Shopee Integration Points
- **Shopee Open Platform API:** Provides product catalog, order data, and seller metrics that can feed recommendation models. Rate limits apply (typically 10 req/s per app); batch sync recommended for catalog data.
- **Shopee Affiliate Program:** Recommendation engines driving traffic to Shopee can monetize via affiliate links. The affiliate API provides product search and category browsing that can serve as candidate generation for content publishers.
- **ShopeePay / SpayLater signals:** Payment method preferences (COD vs. digital wallet vs. installment) are strong contextual features for ranking. Users with SpayLater enabled show 2-3x higher conversion for mid-range products.
- **Shopee Live integration:** Live-stream product recommendations require real-time context (current live session, streamer, viewer engagement) with sub-second feature updates.

#### Vietnamese Product Catalog Challenges
- **Vietnamese text processing:** Product titles mix Vietnamese (with diacritics), English brand names, and informal abbreviations ("dt" for "dien thoai", "xl" for "xa lanh"). PhoBERT or ViT5 should be fine-tuned on e-commerce text for accurate embeddings. Vietnamese word segmentation (VnCoreNLP, Underthesea) is essential before any NLP processing.
- **Duplicate and near-duplicate products:** Vietnamese marketplaces have massive product duplication (same item listed by hundreds of sellers with slightly different titles/images). Embedding-based deduplication in the candidate retrieval stage prevents showing near-identical items.
- **Informal naming conventions:** Users search and list products with highly variable naming ("iPhone 15 Pro Max" vs. "ip 15 promax" vs. "iphone15pm"). Fuzzy matching and embedding similarity must handle this variance.
- **Multi-language catalogs:** Cross-border products from China often have machine-translated Vietnamese descriptions of poor quality. Content-based features should weight seller-native Vietnamese descriptions higher.

#### COD-Specific Recommendation Adjustments
- **Cash-on-Delivery dominance:** COD accounts for 60-70% of Vietnamese e-commerce transactions. This creates unique patterns: higher cart abandonment at delivery (customer not home, changed mind), and return rates of 15-30% for COD orders.
- **Recommendation implications:** (1) Weight conversion-to-delivery (not just conversion-to-order) in training labels, (2) down-rank items with historically high COD return rates, (3) for COD users, recommend items with strong visual match between listing and actual product (reduces "not as expected" returns), (4) price sensitivity is amplified for COD users (no sunk-cost effect of pre-payment).
- **COD fraud detection integration:** Recommendation systems should incorporate COD fraud scores; recommending high-value items to suspicious accounts increases loss.

#### Cost-Effective Infrastructure for Vietnamese Startups
- **Cloud selection:** AWS Singapore (ap-southeast-1) and GCP Taiwan offer lowest latency to Vietnam. Viettel Cloud and FPT Cloud provide domestic alternatives at 30-50% lower cost but with smaller GPU instance selection.
- **GPU cost optimization:** (1) Use spot/preemptible instances for training (60-80% savings), (2) T4 GPUs ($0.35/hr) are sufficient for serving most RecSys models, (3) FAISS on CPU is viable for catalogs under 5M items, avoiding GPU serving cost entirely.
- **Bandwidth costs:** Vietnamese users on mobile networks (60%+ of traffic) have variable connectivity. Recommendation API responses should be compact (<5KB); pre-fetch recommendations on page load rather than lazy-loading.
- **Team cost advantage:** Vietnamese ML engineers (8-25M VND/month depending on seniority) cost 3-5x less than US equivalents, making it feasible to build in-house RecSys teams even for mid-stage startups.
- **Open-source-first approach:** Avoid managed services (AWS Personalize at $0.05/1K recommendations adds up fast at scale). The open-source stack (PyTorch + FAISS + Feast + FastAPI) has zero licensing cost and full customization control, which matters when adapting to Vietnamese market quirks.

#### Local Data Privacy Compliance
- **Vietnam's PDPD (Personal Data Protection Decree, 2023):** Requires consent for data collection, purpose limitation, and data localization for certain categories. Recommendation systems must log consent status and support data deletion requests.
- **Data localization:** Sensitive personal data of Vietnamese citizens may need to be stored on servers in Vietnam. This constrains cloud region choice and may require hybrid architecture (features in Vietnam, training on international GPU cloud with anonymized data).

---

*Report generated by Dr. Praxis (R-beta) for MAESTRO Knowledge Graph Platform. All technology recommendations reflect the state of the ecosystem as of 2026-03-31. Cost estimates are approximate and based on public cloud pricing in the Asia-Pacific region.*
