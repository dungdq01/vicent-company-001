# Backend Engineering Notes: B05 Recommendation Systems
## By R-BE — Date: 2026-03-31

### 1. RecSys Serving Architecture

Production recommendation serving follows a **two-stage architecture**: retrieval then ranking. The full flow is: client request -> API gateway -> retrieval service (broad candidate selection, ~1000 items) -> ranking service (precise scoring, narrow to ~50) -> blending/diversification (business logic, final ordering) -> API response.

This separation exists because ranking models are expensive per-item. You cannot score millions of items with a deep neural network in real-time. The retrieval stage uses cheap, fast methods (ANN search, rule-based filters) to produce a manageable candidate set, and the ranking stage applies the expensive model only to those candidates.

Total latency budget: **<200ms end-to-end**, with retrieval at <30ms, ranking at <80ms, blending at <10ms, and the rest for network overhead and serialization.

### 2. Candidate Retrieval Service

The retrieval service produces a broad set of candidates using multiple strategies executed in parallel:

- **ANN-based**: query user embedding against item embedding index (FAISS/Milvus). Returns top-K nearest neighbors. Handles personalized recommendations.
- **Collaborative filtering candidates**: pre-computed "users who bought X also bought Y" lookup tables in Redis.
- **Content-based**: items similar to user's recent interactions, using item feature embeddings.
- **Popular/trending**: time-windowed popularity lists per category. Essential for cold-start users.

Business rule pre-filtering happens before or during retrieval: exclude out-of-stock items, exclude items from blocked sellers, restrict by user's shipping region. With Milvus or Qdrant, metadata filtering can happen during ANN search. With FAISS, apply filters on the retrieved set.

Merge candidates from all strategies, deduplicate, and pass to ranking. Typical merged set: 500-2000 items.

### 3. Ranking Service

The ranking model scores each candidate with a probability of engagement (click, purchase). Implementation options:

- **TensorFlow Serving**: mature, supports model versioning, gRPC interface. Good for TensorFlow/Keras models.
- **Triton Inference Server** (NVIDIA): multi-framework (TF, PyTorch, ONNX), dynamic batching, GPU scheduling. Best for GPU-based inference.
- **Custom Python service** (FastAPI + ONNX Runtime): flexible, easy to add custom logic, CPU-efficient with ONNX. Good for startups and iteration speed.

Feature assembly at serving time: the ranking service fetches real-time features from the feature store (user features, item features, cross features) and constructs the input tensor. This is often the latency bottleneck. Optimize by batching feature store reads — fetch all item features in a single multi-get call rather than N individual calls.

Latency budget for ranking: <80ms for scoring 1000 candidates. With batched inference on GPU (Triton), this is achievable. On CPU with ONNX Runtime, target 500 candidates to stay within budget.

### 4. API Design for Recommendations

Primary endpoint:

```
GET /api/v1/recommendations
  ?user_id=U123
  &context=homepage|product_page|cart
  &item_id=I456          // for "similar items" context
  &limit=20
  &offset=0
  &filters[category]=electronics
```

Response schema:

```json
{
  "recommendations": [
    {
      "item_id": "I789",
      "score": 0.92,
      "reason": "Based on your recent views",
      "position": 1,
      "metadata": {"title": "...", "price": 299000, "image_url": "..."}
    }
  ],
  "experiment_id": "exp_abc123",
  "fallback_used": false,
  "request_id": "req_xyz789"
}
```

Include `experiment_id` for A/B test tracking. The `reason` field enables explainable recommendations in the UI. The `fallback_used` flag indicates whether the personalized model was used or a fallback (popular items) was served — critical for monitoring personalization coverage.

For non-personalized fallback (anonymous users, cold-start): return trending items per category, pre-computed hourly and cached aggressively.

### 5. Caching Strategy

Caching is layered to balance freshness and latency:

- **User-level personalized cache** (Redis): key = `recs:{user_id}:{context}`, TTL = 5-15 minutes. Prevents redundant model inference when users refresh the page. Invalidate on significant new interactions (purchase, explicit negative feedback).
- **Popular/trending cache** (Redis or CDN): key = `trending:{category}:{region}`, TTL = 1 hour. Shared across all users in a segment. Very high hit rate.
- **Cold-start fallback cache**: pre-computed trending items with TTL = 1 hour. Served when the personalization pipeline fails or times out.
- **Item metadata cache** (Redis): key = `item:{item_id}`, TTL = 15 minutes. Avoids hitting the product catalog service for every recommendation response.

Cache invalidation: event-driven via Kafka. When a user completes a purchase, a consumer invalidates their recommendation cache. When an item goes out of stock, invalidate all caches containing that item (track via reverse index: `item_in_caches:{item_id} -> [cache_keys]`).

Cache hit rate target: >80% for personalized, >95% for popular items. Monitor miss rates to detect issues.

### 6. A/B Testing Infrastructure

Experiment assignment uses **consistent hashing** on user_id to ensure a user always sees the same variant across sessions. Implementation: hash(user_id + experiment_id) mod 100, map to buckets (e.g., 0-49 = control, 50-99 = treatment).

Key components:
- **Experiment config service**: defines experiments (name, traffic split, model version per variant, start/end dates). Stored in a database, cached in-memory with 1-minute refresh.
- **Assignment service**: stateless, computes variant from user_id + experiment config. Called by the recommendation API on every request.
- **Metric collection pipeline**: every recommendation served logs (user_id, experiment_id, variant, items_shown, timestamp). Downstream events (clicks, purchases) are joined by user_id and timestamp window to compute per-variant metrics.
- **Feature flags integration**: experiments map to feature flags in the recommendation service. Flag `recsys.ranking_model_v2 = true` for treatment group triggers the new model path.

Guardrail metrics: set automated alerts if a variant shows >5% revenue drop or >10% latency increase. Auto-disable experiments that breach guardrails.

### 7. Business Rules Engine

Post-ranking business rules are applied as a final reordering/filtering step. These are non-negotiable overrides that the ML model does not control:

1. **Out-of-stock removal**: check inventory service, remove unavailable items. Must be real-time — stale inventory data leads to bad UX.
2. **Already-purchased suppression**: for consumable goods, allow re-recommendation after N days. For durables (laptops, appliances), suppress for 90+ days.
3. **Diversity injection**: ensure no more than 3 items from the same seller or category appear consecutively. Use a greedy re-ranking algorithm: iterate through ranked list, skip items that violate diversity constraints, insert from the remaining pool.
4. **Sponsored item insertion**: business requirement to insert promoted items at fixed positions (e.g., position 3, 7). Clearly labeled as "Sponsored" in the UI. Track separately in metrics to avoid polluting organic recommendation KPIs.
5. **Legal compliance filters**: age-restricted products (alcohol, tobacco) require age verification. Region-restricted items filtered by user's shipping address. Blacklisted products removed.

Implement as a configurable rules pipeline: each rule is a function that takes the ranked list and returns a modified list. Rules are ordered by priority and executed sequentially. Configuration is hot-reloadable from a config service without redeployment.

### 8. Production Architecture Diagram

```
                        +------------------+
                        |    Client App    |
                        +--------+---------+
                                 |
                        +--------v---------+
                        |   API Gateway    |
                        |  (rate limit,    |
                        |   auth, routing) |
                        +--------+---------+
                                 |
                   +-------------v--------------+
                   |  Recommendation API Service |
                   |  (experiment assignment,    |
                   |   cache check, orchestrate) |
                   +---+--------+----------+----+
                       |        |          |
              +--------v--+ +---v----+ +---v-----------+
              | Retrieval  | |Ranking | |Business Rules |
              | Service    | |Service | |Engine         |
              | (ANN+rules)| |(model) | |(filters,      |
              +-----+------+ +---+----+ | diversity)    |
                    |            |       +-------+------+
              +-----v------+ +--v---+           |
              |FAISS/Milvus| |Triton|    +------v------+
              |  ANN Index | |Server|    |   Response   |
              +------------+ +------+    |  + Cache Set |
                                         +-------------+
                    +------------------+
                    |  Feature Store   |
                    |  (Redis online,  |
                    |   S3 offline)    |
                    +------------------+
```

All services communicate via gRPC internally for low latency. The API gateway exposes REST/GraphQL externally. Kubernetes manages service discovery and scaling. Circuit breakers (via Istio or application-level) prevent cascade failures — if ranking service is down, serve cached or popular recommendations.
