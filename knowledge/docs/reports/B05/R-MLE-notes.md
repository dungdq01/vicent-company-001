# ML Engineering Notes: B05 Recommendation Systems
## By R-MLE — Date: 2026-03-31

### 1. RecSys Training Pipeline Architecture

A production recommendation system pipeline follows a well-defined flow: data collection, feature engineering, candidate generation, ranking, serving, and feedback loop. Each stage has distinct engineering requirements.

**Data Collection** ingests user interaction logs (clicks, purchases, dwell time, add-to-cart events) from event streaming platforms like Kafka or Kinesis. Raw events land in a data lake (S3/GCS) and are processed via Spark or Flink jobs into structured training datasets. A critical concern is ensuring event deduplication and correct timestamp ordering — out-of-order events cause label leakage.

**Feature Engineering** transforms raw events into model-consumable features (covered in detail in Section 2). Features are materialized into a feature store for both training and serving consistency.

**Candidate Generation** narrows millions of items to hundreds using lightweight models — typically embedding-based retrieval with approximate nearest neighbor (ANN) search. This stage prioritizes recall over precision.

**Ranking** takes the candidate set and applies a heavier model with rich features to produce a final score per item. The ranking model is typically a deep neural network trained on click/conversion labels.

**Serving** exposes the ranked list via a low-latency API. Model inference runs on optimized serving frameworks (TensorFlow Serving, Triton, TorchServe). Latency budgets are typically 50-200ms end-to-end for the full pipeline.

**Feedback Loop** is what closes the system — served recommendations generate new interaction data, which feeds back into training. This loop introduces selection bias (users only interact with shown items), which must be addressed explicitly through techniques like inverse propensity scoring or unbiased learning-to-rank.

### 2. Feature Engineering for RecSys

Features fall into four categories, each with different engineering patterns:

**User Features**: demographics (age, gender, location), aggregated behavior (purchase frequency, average order value, category affinity scores), and temporal patterns (time-of-day preference, day-of-week activity). These are typically precomputed in batch and stored in a feature store.

**Item Features**: catalog metadata (category, brand, price), content features (title embeddings, image embeddings), and popularity statistics (view count, purchase count, rating). Item features change less frequently and are updated on catalog refresh schedules.

**Context Features**: device type, time of day, day of week, current session behavior, referral source. These are computed at request time and are critical for real-time personalization.

**Interaction Features**: cross-features between user and item — has the user viewed this item before, has the user purchased from this brand, similarity between user embedding and item embedding. These are the most predictive but also the most expensive to compute.

**Feature Stores** like Feast and Tecton solve the training-serving skew problem. They provide a unified API to retrieve features during both offline training and online serving, ensuring the model sees the same feature values in production as it did during training. Tecton adds managed feature pipelines with built-in backfill capabilities. The choice between them often depends on whether you need a fully managed solution (Tecton) or prefer open-source flexibility (Feast).

### 3. Two-Stage Architecture: Retrieval + Ranking

The two-stage architecture is the industry standard because of a fundamental constraint: you cannot run a complex ranking model over millions of items within a latency budget.

**Retrieval (Candidate Generation)** reduces the item space from millions to hundreds. Common approaches include: (a) Two-tower models where user and item are encoded separately, enabling precomputation of item embeddings and fast ANN lookup via FAISS, ScaNN, or Milvus. (b) Multiple retrieval channels — collaborative filtering retrieval, content-based retrieval, popularity-based retrieval — merged into a single candidate set. (c) The YouTube DNN paper (2016) established this paradigm, using a deep network to learn user embeddings and serving via ANN.

**Ranking** applies a feature-rich model to the candidate set. Because the candidate set is small (hundreds), this model can use dense cross-features, user-item interaction history, and contextual signals that would be prohibitively expensive at full catalog scale. Models like DeepFM, DCN-v2, or transformer-based rankers are common choices. The ranking model is trained on impression-level data with click/conversion labels.

**Why two-stage works**: retrieval optimizes for recall (do not miss relevant items), ranking optimizes for precision (order the relevant items correctly). This separation of concerns allows each stage to use architectures appropriate for its latency and accuracy requirements.

### 4. Evaluation Methodology

**Offline Metrics**: NDCG (Normalized Discounted Cumulative Gain) measures ranking quality with position-weighted relevance. MAP (Mean Average Precision) evaluates precision at each relevant item's rank. HR@K (Hit Rate at K) checks if the relevant item appears in the top-K. MRR (Mean Reciprocal Rank) measures the rank of the first relevant item. AUC measures pairwise ranking accuracy. For implicit feedback, NDCG@K and HR@K at K=10 or K=20 are most commonly reported.

**Online Metrics**: CTR (Click-Through Rate), CVR (Conversion Rate), revenue per session, and engagement metrics (session duration, pages viewed). A/B testing is the gold standard — split traffic between control (existing model) and treatment (new model) and measure lift on business metrics over 1-2 weeks.

**Offline-Online Gap**: This is the most frustrating problem in RecSys evaluation. A model that improves offline NDCG by 5% may show no lift or even negative lift in online A/B tests. Causes include: (a) offline data has selection bias from the logging policy, (b) offline metrics do not capture diversity/novelty preferences, (c) offline evaluation ignores feedback loop effects. Counterfactual evaluation and replay methods partially address this, but online testing remains essential.

### 5. Cold-Start Strategies

**New User Cold Start**: Start with popularity-based recommendations (most purchased items in the user's region/category). After a few interactions, use an explore-exploit strategy — epsilon-greedy or Thompson sampling to balance showing items that gather information versus items likely to convert. After sufficient interaction history, transition to full personalization.

**New Item Cold Start**: Use content-based features — item title embeddings, category, price, brand, image embeddings — to place the new item in the existing embedding space. Transfer learning from similar items helps. Metadata-based rules (e.g., boost new arrivals in relevant categories) provide initial exposure. Visual embeddings from pre-trained CNNs or ViT models can capture item similarity without interaction data.

**Hybrid approaches** combine collaborative and content signals with a gating mechanism that increases the collaborative signal weight as interaction data accumulates.

### 6. Real-time vs Batch Recommendation

**Batch**: Precompute top-K recommendations for each user nightly using Spark/distributed training. Store results in a key-value store (Redis, DynamoDB). Pros: simple serving, predictable latency. Cons: cannot adapt to intra-day behavior, stale for active users.

**Real-time**: Streaming feature computation (Flink/Kafka Streams) updates user features on each interaction. The ranking model runs inference at request time with the latest features. Pros: adapts immediately to user behavior. Cons: complex infrastructure, higher serving cost, harder to debug.

**Near-real-time**: A practical middle ground — refresh user features every 5-15 minutes via micro-batch, recompute candidate sets hourly, but run ranking in real-time with fresh context features. Most production systems use this hybrid approach.

### 7. Hardware & Scale Considerations

**Embedding Tables**: The largest memory consumer. A catalog of 100M items with 128-dim embeddings requires ~50GB. Feature hashing or mixed-dimension embeddings reduce this. Training requires either model-parallel embedding tables across GPUs or CPU-based embedding with GPU-based dense layers.

**Training**: GPU-bound for deep ranking models. A single training run on a large e-commerce dataset (billions of interactions) takes 4-12 hours on 8xA100 GPUs. Incremental/online training updates the model daily with new data rather than retraining from scratch.

**Serving**: Typically CPU-heavy because inference on a few hundred candidates is not compute-intensive enough to justify GPU overhead. However, ANN index search for retrieval benefits from GPU acceleration (FAISS GPU). Typical serving infrastructure: 16-32 core CPU instances behind a load balancer, with model loaded in memory.

**ANN Index Sizing**: FAISS IVF-PQ index for 100M 128-dim vectors requires ~10-20GB RAM with good recall. HNSW indices provide better recall but use more memory (~50-80GB for the same scale). The choice depends on recall requirements and available memory.

### 8. Common Training Failures

**Popularity Bias**: Models learn to recommend already-popular items because they have more positive interaction data. Mitigation: inverse popularity weighting, calibrated recommendations, diversity re-ranking.

**Position Bias**: Items shown in top positions get more clicks regardless of relevance. Mitigation: position-aware models that include position as a feature during training but remove it during serving, or inverse propensity weighting based on position.

**Selection Bias**: Users only interact with items that were shown to them by the previous recommendation policy. The training data is not a random sample of user-item preferences. Mitigation: unbiased learning-to-rank, propensity scoring, randomized exploration in production.

**Feedback Loops**: The model recommends popular items, users click on them, the model learns to recommend them more. This creates a rich-get-richer dynamic. Mitigation: exploration budgets, diversity constraints, counterfactual training.

**Data Leakage from Future**: Using features computed from data after the prediction timestamp. Example: using an item's total purchase count (including future purchases) as a feature for predicting past interactions. Strict temporal splitting and point-in-time correct feature computation prevent this.

**Overfitting to Clicks Ignoring Conversions**: Optimizing for CTR alone leads to clickbait recommendations. Multi-objective learning (predicting click AND purchase AND return probability) produces more balanced recommendations that align with business goals.
