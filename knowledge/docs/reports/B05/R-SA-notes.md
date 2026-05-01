# Solution Architecture Notes: B05 Recommendation Systems
## By R-SA — Date: 2026-03-31

### 1. RecSys Architecture Patterns

**Batch precomputation**: Generate recommendations offline (hourly/daily), store in a key-value cache, serve with sub-10ms latency. Best for stable catalogs and non-real-time use cases. Limitation: cannot react to in-session behavior.

**Real-time personalization**: Compute recommendations on-the-fly using live user context (current session clicks, cart contents, time of day). Requires low-latency feature serving and fast model inference. Adds complexity but delivers 15-30% metric uplift over batch.

**Hybrid**: Batch-generate candidate sets, then real-time re-rank with session context. This is the dominant production pattern — it balances latency with personalization quality.

**Contextual bandits**: Treat recommendation as an exploration-exploitation problem. Each request selects an action (item to recommend) given context (user features), observes reward (click/purchase). Well-suited for cold-start and rapidly changing catalogs. Thompson Sampling and LinUCB are common choices.

### 2. Build vs Buy Analysis

| Solution | Type | Strengths | Weaknesses | Cost (10M interactions/mo) | Vietnam Fit |
|---|---|---|---|---|---|
| AWS Personalize | Managed | Fast deployment, auto-scaling, managed training | Black-box, limited customization, data stays in AWS | ~$3,000-5,000/mo | Good — AWS popular in Vietnam |
| Google Recommendations AI | Managed | Strong retail focus, integrates with Google Cloud | Retail-only, requires GCP ecosystem | ~$4,000-6,000/mo | Moderate — GCP less adopted |
| Recombee | SaaS API | Easy integration, good for startups, real-time | Limited model control, data leaves your infra | ~$2,000-4,000/mo | Good — low engineering bar |
| Custom (open-source) | Self-built | Full control, no vendor lock-in, unlimited customization | 3-6 month build, requires ML team | ~$1,500-3,000/mo (infra) + team cost | Best for mature teams |

For Vietnamese companies: startups and mid-size retailers should start with Recombee or AWS Personalize, then migrate to custom as scale and team capability grow.

### 3. Integration Patterns

**Product page — similar items**: Trigger on page view, pass current item ID, return 8-12 similar items. Use item-to-item collaborative filtering or content-based similarity. Latency budget: 100ms. Cache aggressively (item similarity is stable).

**Homepage — personalized feed**: Trigger on page load with user ID, return 20-40 items across categories. Use user-to-item model with diversity constraints. Latency budget: 150ms. Cannot cache (personalized per user).

**Email/push — re-engagement**: Batch job generates top-5 items per user daily. Filter out previously purchased items, apply business rules (no out-of-stock, no items below margin threshold). Must integrate with email platform (SendGrid, Mailchimp) via scheduled export.

**Search re-ranking**: Intercept search results, re-rank top 50 by personalized relevance score. Must not destroy search relevance — use a blended score (0.7 * search_score + 0.3 * personalization_score).

### 4. Reference Architecture: E-commerce RecSys

```
User Clickstream → Kafka Topics → Flink Stream Processing
                                        ↓
                                 Feature Store (Redis + Hive)
                                        ↓
                        ┌───────────────┴───────────────┐
                   Two-Tower Retrieval              Business Rules
                   (User Tower + Item Tower)        (inventory, margin)
                        ↓                               ↓
                   ANN Index (FAISS/Milvus)         Rule Filter
                        ↓                               ↓
                   Top-500 Candidates ──────→ Ranking Model (DNN)
                                                        ↓
                                                   Top-20 Ranked
                                                        ↓
                                                   Re-ranking (diversity, dedup)
                                                        ↓
                                                   API Gateway → Frontend
```

Key design decisions: Kafka decouples ingestion from processing; Flink enables real-time feature updates (< 1 min latency); two-tower architecture allows independent user/item embedding updates; ANN index handles 10M+ items with < 10ms retrieval.

### 5. Reference Architecture: Content/Media RecSys

```
User Watch/Read History → Session Sequence Model (Transformer)
                                    ↓
                          User Intent Embedding
                                    ↓
                     ┌──────────────┴──────────────┐
                Content Pool (fresh)           Content Pool (evergreen)
                (< 24hr, boost factor)         (popularity + quality score)
                     ↓                              ↓
                Candidate Merge + Dedup (top 200)
                     ↓
                Ranking Model (multi-objective: engagement + diversity + freshness)
                     ↓
                Slate Optimization (position-aware, category-balanced)
                     ↓
                Engagement Feedback → logging → retraining loop
```

Media differs from e-commerce: session sequences matter more (what you just watched predicts next), freshness is critical (news articles decay in hours), and diversity constraints are essential to avoid filter bubbles.

### 6. Total Cost of Ownership

| Scale (interactions/mo) | AWS Personalize | Custom (AWS infra) | Custom (on-prem Vietnam) |
|---|---|---|---|
| 1M | $500-800 | $800-1,200 + team | $400-600 + team |
| 10M | $3,000-5,000 | $1,500-3,000 + team | $800-1,500 + team |
| 100M | $25,000-40,000 | $5,000-10,000 + team | $3,000-6,000 + team |

At 100M interactions/month, custom solutions are 4-8x cheaper on infrastructure alone. The crossover point where custom becomes cost-effective (including team cost of 2-3 ML engineers at Vietnamese salary levels of $1,500-3,000/month) is approximately 20-30M interactions/month.

### 7. Migration Path

**Stage 1 — Rule-based** (week 1-2): Hand-coded rules ("if bought phone, show cases"). Baseline for comparison. Zero ML required.

**Stage 2 — Popularity** (week 3-4): Global and category-level popularity rankings. Simple SQL queries. Surprisingly strong baseline.

**Stage 3 — Collaborative filtering** (month 2-3): Matrix factorization (ALS) on user-item interactions. First real personalization. Requires interaction data accumulation.

**Stage 4 — Deep learning** (month 4-6): Two-tower retrieval + DNN ranking. Handles feature-rich scenarios. Requires ML infrastructure.

**Stage 5 — Real-time personalization** (month 6-12): Session-aware models, real-time feature serving, contextual bandits for exploration. Full production ML platform.

Each stage should demonstrate measurable metric improvement before proceeding. Vietnamese companies typically reach Stage 3-4 within 6 months.

### 8. Multi-Platform RecSys

Users interact across web, mobile app, Zalo mini-app, and email. A **shared user profile** requires cross-device identity resolution — deterministic (login-based) is reliable; probabilistic (device fingerprinting) adds coverage but introduces noise.

**Unified embedding space**: Train a single user embedding model that ingests interactions from all platforms. Platform-specific features (device type, app version) enter as context features, not separate models.

Architecture: centralized user profile service with platform-specific API adapters. Each platform sends events to a unified event bus (Kafka), feature store maintains a single user view, and recommendation API accepts platform as a context parameter for platform-aware re-ranking (mobile: fewer items, larger images; email: top-5 only; web: full grid).
