# QA Engineering Notes: B05 Recommendation Systems
## By R-QA — Date: 2026-03-31

### 1. RecSys Testing Strategy

Recommendation systems require a layered testing approach spanning unit, integration, and regression levels. **Unit tests** must cover feature pipelines individually: verify that user feature extractors produce correct embedding dimensions, item feature transformers handle missing fields gracefully, and interaction logging captures events with correct timestamps and schemas. Each feature transformation (normalization, bucketing, hashing) should have deterministic test cases with known inputs and expected outputs.

**Integration tests** validate the retrieval-then-ranking pipeline end-to-end. Given a known user profile and candidate pool, the retrieval stage (ANN search) should return a superset of relevant items, and the ranking stage should order them consistently. Test that the full pipeline returns results within latency budgets and that feature store lookups do not introduce stale data. **Regression tests** compare new model versions against the previous production model on a frozen holdout set, ensuring key metrics do not degrade beyond defined thresholds before any deployment proceeds.

### 2. Offline Evaluation Guide

**NDCG@K** (Normalized Discounted Cumulative Gain) measures ranking quality with position-weighted relevance — the standard metric for ranked lists. **HR@K** (Hit Rate) checks whether the relevant item appears in the top-K at all, useful for retrieval-stage evaluation. **MRR** (Mean Reciprocal Rank) focuses on the rank of the first relevant item and suits single-answer scenarios. **MAP** (Mean Average Precision) averages precision at each relevant position and works well when multiple items are relevant.

Critical pitfall: **random splits leak future information**. Always use time-based splits where training data precedes evaluation data chronologically. Random splits inflate metrics by 10-30% compared to realistic temporal evaluation. Additionally, ensure evaluation excludes items the user has already interacted with (filter-out-seen protocol). Report confidence intervals — a single metric point is meaningless without variance estimation.

### 3. Online Evaluation & A/B Testing

Calculate **minimum detectable effect (MDE)** before launching any test. For a 1% CTR baseline with 5% relative MDE, expect needing roughly 500K users per variant at 80% power and 5% significance. Use power calculators accounting for the specific metric distribution.

**Multi-armed bandit** approaches (Thompson Sampling, UCB) are preferable for high-cost exploration scenarios where pure A/B wastes traffic on inferior variants. However, bandits complicate statistical interpretation — use them for optimization, not for rigorous causal measurement.

**Guardrail metrics** must be defined before any test launches: revenue per session, user retention at day-7, customer support ticket rate, and page load time. Any guardrail breach triggers automatic test termination regardless of primary metric improvement.

### 4. Bias Testing

**Popularity bias**: Measure Gini coefficient of item exposure. If the top 1% of items receive more than 50% of recommendations, the model is popularity-biased. Compare recommendation frequency distribution against interaction frequency distribution — a well-calibrated model should recommend long-tail items proportionally more than a popularity baseline.

**Position bias**: Click-through rates are heavily influenced by display position. Item in slot 1 gets 3-5x more clicks than slot 5 regardless of relevance. Use inverse propensity scoring (IPS) or position-aware training to debias. Test by randomizing position for a small traffic slice and measuring true relevance.

**Fairness**: Measure item exposure equity across seller segments (small vs large sellers), content categories, and price ranges. In Vietnamese markets, ensure recommendations do not systematically disadvantage small Shopee sellers in favor of mall-verified brands.

### 5. Edge Case Testing

| Scenario | Test Approach | Expected Behavior |
|---|---|---|
| New user (0 interactions) | Synthetic cold-start user | Fallback to popularity/trending, not empty |
| New item (0 interactions) | Inject item with metadata only | Content-based features surface the item |
| User with 1 interaction | Single-event user profile | Reasonable recs, not just "similar to that one item" |
| Item with 0 interactions | Catalog-only item | Appears via content similarity, not buried |
| Adversarial user | Synthetic rapid-click user | Rate limiting, no model poisoning |
| Bot traffic in feedback | Inject bot-pattern interactions | Bot detection filters before training data |

Every edge case must have an automated test that runs before each model deployment.

### 6. Performance Testing

**Latency SLO**: P50 < 50ms, P95 < 100ms, P99 < 200ms for the full recommendation request including retrieval, ranking, and response serialization. ANN (Approximate Nearest Neighbor) libraries like FAISS or ScaNN introduce a recall-vs-latency tradeoff: at 10M items, HNSW typically achieves 95% recall@100 at ~5ms, while brute-force achieves 100% recall at ~50ms.

**Throughput target**: 10K requests/second per service instance. Load test with realistic traffic patterns including burst scenarios (flash sales in Vietnamese e-commerce generate 5-10x normal traffic within minutes). Use tools like Locust or k6 with recorded production traffic replay.

### 7. Data Quality Gates

Implement automated gates in the feature pipeline: **freshness checks** ensure no feature is older than its defined SLA (user features < 1 hour, item features < 24 hours). **Volume anomaly detection** flags when daily interaction count drops below 2 standard deviations from the 30-day rolling mean — indicating logging failures or upstream issues.

**Embedding drift monitoring**: Track cosine similarity distribution between consecutive model versions' embeddings. A sudden shift (mean cosine similarity < 0.85) signals potential training data corruption or feature schema changes. Block model deployment until drift is investigated.

### 8. Regression Testing for Model Updates

Before any A/B test, run an **A/A test** (same model in both variants) for at least 3 days to validate the experimentation platform itself. If the A/A test shows significant differences, the platform has a bug — do not proceed.

**Holdout set comparison**: Every candidate model must beat the production model on NDCG@10 by at least 0.5% relative on the holdout set. Define **metric delta thresholds**: primary metric must improve; no guardrail metric may degrade by more than 1% relative.

**Rollback criteria**: If any of the following occur within the first 24 hours of deployment, execute automatic rollback: P95 latency exceeds 150ms, error rate exceeds 0.1%, or any guardrail metric degrades by more than 2%. Maintain the previous model as a warm standby at all times.
