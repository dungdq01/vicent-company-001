# Research Report: Recommendation Systems (B05)
## By Dr. Archon (R-alpha) — Date: 2026-03-31

---

### 1. Executive Summary

Recommendation Systems (RecSys) constitute one of the most commercially impactful applications of machine learning, directly driving revenue at companies like Amazon, Netflix, Spotify, TikTok, Shopee, and Tiki through personalized content and product suggestions. The field has evolved from simple collaborative filtering heuristics in the 1990s through matrix factorization and deep learning revolutions to the current era where large language models and graph neural networks define the state of the art. This report provides an L3-depth survey covering taxonomy, core algorithms, mathematical foundations, landmark papers, and open research questions as of early 2026.

---

### 2. Field Taxonomy

**Parent field:** Machine Learning > Information Retrieval > Recommendation Systems

**Sub-fields (12):**

1. **Collaborative Filtering (CF)** — User-user and item-item neighborhood methods
2. **Content-Based Filtering (CBF)** — Feature-driven item profiling
3. **Hybrid Methods** — Combining CF and CBF signals
4. **Knowledge-Based Recommendation** — Constraint/case-based reasoning with domain ontologies
5. **Session-Based Recommendation** — Anonymous short-session modeling (GRU4Rec, SR-GNN)
6. **Sequential Recommendation** — Ordered user history modeling (SASRec, BERT4Rec)
7. **Conversational Recommendation** — Dialog-driven preference elicitation
8. **Multi-Stakeholder Recommendation** — Balancing user, provider, and platform utility
9. **Cross-Domain Recommendation** — Transfer learning across item domains
10. **Context-Aware Recommendation** — Location, time, device signals
11. **Group Recommendation** — Aggregating preferences for multiple users
12. **Explainable Recommendation** — Generating human-understandable rationales

**Related fields:** Information Retrieval, Advertising / Auction Theory, Causal Inference, Reinforcement Learning, Natural Language Processing, Graph Theory

**ASCII Taxonomy Tree:**

```
Machine Learning
└── Information Retrieval
    └── Recommendation Systems (B05)
        ├── Memory-Based
        │   ├── User-Based CF
        │   └── Item-Based CF
        ├── Model-Based
        │   ├── Matrix Factorization (SVD, ALS, NMF)
        │   ├── Factorization Machines (FM, FFM)
        │   ├── Deep Learning RecSys
        │   │   ├── Embedding + MLP (NCF, Wide&Deep, DeepFM)
        │   │   ├── Attention-Based (DIN, DIEN, Transformer)
        │   │   ├── Sequential (SASRec, BERT4Rec, GRU4Rec)
        │   │   ├── Graph-Based (LightGCN, PinSage, SR-GNN)
        │   │   └── Multi-Task (MMOE, PLE, ESMM)
        │   └── LLM-Based (P5, InstructRec, M6-Rec)
        ├── Content-Based Filtering
        ├── Knowledge-Based
        ├── Hybrid Methods
        ├── Conversational
        ├── Multi-Stakeholder
        ├── Cross-Domain
        ├── Context-Aware
        └── Bandit / RL-Based (Thompson Sampling, LinUCB)
```

---

### 3. Core Concepts

#### 3.1 User-Item Interaction Matrix

The foundational data structure in recommendation systems is the user-item interaction matrix R of shape (m x n), where m is the number of users, n is the number of items, and each entry r_ui represents the interaction (explicit rating, implicit click, purchase) between user u and item i. In practice, this matrix is extremely sparse — Netflix's matrix was roughly 99% empty, and e-commerce platforms like Shopee see sparsity exceeding 99.9%.

The core task of recommendation is matrix completion: predicting the missing entries of R. Explicit feedback gives direct preference signals (1-5 star ratings), while implicit feedback (clicks, views, purchases, dwell time) is far more abundant but noisier, requiring specialized loss functions like BPR or weighted matrix factorization. The shift from explicit to implicit feedback has been one of the defining transitions in the field, driven by the practical reality that users rarely rate items but constantly generate behavioral signals.

**Mathematical formulation:**
```
R ∈ ℝ^{m×n}, where R_ui = { observed interaction if (u,i) ∈ Ω, ? otherwise }
Goal: learn f: (u, i) → ŷ_ui ≈ r_ui for (u,i) ∉ Ω
```

**Difficulty:** L1 (Foundational) | **Prerequisites:** Linear algebra basics

#### 3.2 Collaborative Filtering (User-Based / Item-Based)

Collaborative filtering operates on the assumption that users who agreed in the past will agree in the future. User-based CF finds the k most similar users to a target user (using cosine similarity, Pearson correlation, or Jaccard index on their rating vectors) and predicts ratings as a weighted average of those neighbors' ratings. Item-based CF, introduced by Amazon in 2001, reverses this: it finds items similar to those the target user has already liked and recommends them.

Item-based CF became the industry standard over user-based CF for a practical reason: item similarity is more stable than user similarity. The item catalog changes slowly compared to user behavior, so item-item similarity matrices can be precomputed and cached. Amazon's foundational paper on item-to-item collaborative filtering (Linden et al., 2003) demonstrated that this approach scales to hundreds of millions of users while maintaining sub-second latency.

Despite their simplicity, neighborhood methods remain competitive baselines and are still deployed in production at scale, often as part of hybrid systems. Their interpretability (recommended because you liked X) is a significant advantage over black-box deep learning alternatives.

**Mathematical formulation (Item-Based CF):**
```
ŷ_ui = Σ_{j ∈ N_k(i) ∩ I_u} sim(i, j) · r_uj / Σ_{j ∈ N_k(i) ∩ I_u} |sim(i, j)|

sim(i, j) = cos(r_i, r_j) = (r_i · r_j) / (||r_i|| · ||r_j||)
```

**Difficulty:** L1 | **Prerequisites:** Basic statistics, similarity metrics

#### 3.3 Matrix Factorization (SVD / ALS)

Matrix factorization decomposes the interaction matrix R into two low-rank matrices: R approximately equals P * Q^T, where P is (m x k) representing user latent factors and Q is (n x k) representing item latent factors. The dimensionality k (typically 50-300) captures latent features such as genre preference, price sensitivity, or style affinity without explicit feature engineering. This was the breakthrough behind the winning solution of the Netflix Prize (2006-2009).

The standard formulation minimizes squared error with L2 regularization: min_{P,Q} Σ_{(u,i)∈Ω} (r_ui - p_u^T q_i)^2 + λ(||p_u||^2 + ||q_i||^2). For explicit feedback, Stochastic Gradient Descent (SGD) is the standard optimizer. For implicit feedback, Alternating Least Squares (ALS) is preferred because it enables efficient closed-form updates when one factor matrix is fixed, and naturally handles the dense observation matrix that arises from treating all missing entries as negative signals (Hu et al., 2008). ALS also parallelizes trivially across users and items, making it the method of choice for distributed systems like Apache Spark MLlib.

Biased matrix factorization adds global, user, and item bias terms: ŷ_ui = μ + b_u + b_i + p_u^T q_i. Temporal dynamics (Koren, 2009) further extend this by making biases and factors time-dependent, capturing drift in user preferences.

**Mathematical formulation:**
```
min_{P,Q} Σ_{(u,i)∈Ω} (r_ui - μ - b_u - b_i - p_u^T q_i)^2 + λ(||P||_F^2 + ||Q||_F^2 + ||b||^2)

ALS update (fixing Q): P_u = (Q_{I_u}^T Q_{I_u} + λI)^{-1} Q_{I_u}^T r_u
```

**Difficulty:** L2 | **Prerequisites:** Linear algebra (SVD), optimization (SGD, ALS)

#### 3.4 Embedding-Based Methods (Word2Vec to Item2Vec)

The Word2Vec revolution in NLP (Mikolov et al., 2013) inspired a direct analog in RecSys: Item2Vec (Barkan & Koenigstein, 2016). The key insight is that user interaction sequences (browsing history, purchase sequences) are analogous to sentences, and items are analogous to words. By applying Skip-gram with negative sampling (SGNS) to item co-occurrence within user sessions, dense item embeddings are learned that capture semantic similarity in a low-dimensional space.

This approach generalizes naturally. Airbnb's listing embeddings (KDD 2018) extended Item2Vec with booking-session context and market-specific negative sampling, achieving significant improvements in search ranking. Alibaba's EGES (Enhanced Graph Embedding with Side Information) incorporated item attributes (category, brand, price) into the embedding learning process, handling cold-start items that lack interaction history.

The embedding paradigm fundamentally changed RecSys architecture by enabling approximate nearest neighbor (ANN) retrieval at scale. Given a user embedding, candidate items can be retrieved in sub-millisecond time using libraries like FAISS, ScaNN, or HNSW, enabling real-time personalization over catalogs of billions of items.

**Mathematical formulation (Skip-gram for items):**
```
max Σ_{s∈S} Σ_{i∈s} Σ_{j∈N(i)} log σ(v_i^T v_j) + Σ_{k∈NEG} log σ(-v_i^T v_k)

where S = set of sessions, N(i) = context window around item i
```

**Difficulty:** L2 | **Prerequisites:** Word2Vec, embedding spaces, negative sampling

#### 3.5 Deep Learning RecSys: NCF, Wide&Deep, DeepFM

Neural Collaborative Filtering (NCF, He et al., 2017) replaced the inner product of matrix factorization with a learned neural network: ŷ_ui = f(p_u, q_i; θ), where f is a multi-layer perceptron. This allows capturing non-linear user-item interactions that a dot product cannot express. NCF's Generalized Matrix Factorization (GMF) layer and MLP layer are combined in the NeuMF architecture.

Google's Wide & Deep Learning (Cheng et al., 2016) introduced the paradigm of combining memorization (wide linear model on cross-product features) with generalization (deep MLP on dense embeddings). The wide component memorizes specific feature combinations (e.g., user installed app X AND impressed app Y), while the deep component generalizes to unseen combinations through learned representations. This architecture became the template for industrial RecSys at Google Play, YouTube, and beyond.

DeepFM (Guo et al., 2017) improved on Wide & Deep by replacing the manual cross-product features in the wide component with a Factorization Machine layer that automatically learns second-order feature interactions. This eliminated the need for feature engineering in the wide component while maintaining the deep component's generalization power. DeepFM and its successors (xDeepFM, AutoInt) remain workhorses in CTR prediction at companies like Huawei and Alibaba.

**Mathematical formulation (DeepFM):**
```
ŷ = σ(y_FM + y_DNN)

y_FM = w_0 + Σ_i w_i x_i + Σ_i Σ_{j>i} <v_i, v_j> x_i x_j   (FM component)
y_DNN = MLP(concat(e_1, e_2, ..., e_f))                          (Deep component)
```

**Difficulty:** L2–L3 | **Prerequisites:** Neural networks, FM, feature engineering

#### 3.6 Two-Tower Architecture (DSSM)

The two-tower (or dual-encoder) architecture is the dominant paradigm for large-scale retrieval in industrial RecSys. One tower encodes the user (with features like history, demographics, context) into a dense vector; the other tower encodes the item (with features like title, category, attributes) into a dense vector. The relevance score is their dot product or cosine similarity.

The critical advantage is computational: at serving time, all item embeddings can be precomputed and indexed in an ANN structure. Only the user tower needs to run online, producing a query vector that retrieves the top-k candidates via ANN search in milliseconds. This enables retrieval over billions of items — YouTube's recommendation system uses this architecture to narrow ~10^8 videos to ~10^3 candidates before ranking.

Facebook's DSSM (Deep Structured Semantic Model), YouTube's candidate generation network, and Spotify's dual-encoder for podcast recommendation all follow this pattern. The architecture's limitation is that it cannot model fine-grained user-item feature interactions (the only interaction is the final dot product), which is why a separate ranking stage with cross-features follows retrieval.

**Mathematical formulation:**
```
score(u, i) = f_user(x_u; θ_u)^T · f_item(x_i; θ_i)

f_user: user features → ℝ^d    (user tower)
f_item: item features → ℝ^d    (item tower)
```

**Difficulty:** L2 | **Prerequisites:** Embedding models, ANN retrieval, multi-stage architecture

#### 3.7 Attention in RecSys: DIN and DIEN

Deep Interest Network (DIN, Zhou et al., 2018) from Alibaba introduced a crucial insight: a user's interest is diverse, and different historical behaviors are differently relevant to different candidate items. Instead of compressing all user history into a single fixed-length vector, DIN uses an attention mechanism where the candidate item queries against the user's behavior sequence, producing attention weights that highlight relevant historical interactions.

Deep Interest Evolution Network (DIEN, Zhou et al., 2019) extended DIN by modeling the temporal evolution of interests using a GRU with an auxiliary loss that captures interest state transitions. The AUGRU (Attention-based Update Gate Recurrent Unit) combines the attention mechanism with the GRU update gate, allowing the model to track how user interests evolve over time and focus on the interest trajectory relevant to the current candidate.

These attention-based models demonstrated 5-10% CTR improvements in Alibaba's display advertising, serving billions of requests daily. The paradigm of target-aware attention — where the candidate item participates in the encoding of user history — became a standard design pattern in industrial RecSys and was a precursor to the full Transformer-based approaches that followed.

**Mathematical formulation (DIN attention):**
```
v_u = Σ_{j∈B_u} α(e_j, e_i) · e_j

α(e_j, e_i) = softmax(MLP(e_j, e_i, e_j ⊙ e_i, e_j - e_i))

where B_u = user behavior sequence, e_i = candidate item embedding
```

**Difficulty:** L3 | **Prerequisites:** Attention mechanisms, RNN/GRU, CTR prediction

#### 3.8 Graph Neural Networks for RecSys: LightGCN, PinSage

Graph neural networks naturally model the bipartite user-item interaction graph. LightGCN (He et al., 2020) simplified the GCN architecture for recommendation by removing feature transformation and nonlinear activation — keeping only neighborhood aggregation. The final user/item embedding is a weighted sum of embeddings learned at each GCN layer, capturing multi-hop collaborative signals.

PinSage (Ying et al., 2018) from Pinterest was the first industrial-scale GNN for recommendation, operating on a graph of 3 billion nodes and 18 billion edges. Key innovations included random-walk-based neighborhood sampling (instead of full neighborhood aggregation), importance pooling, and curriculum training. PinSage learns visual-semantic pin embeddings for related pin recommendation and achieved 40% improvement in engagement over previous methods.

The GNN paradigm excels at capturing high-order connectivity patterns that matrix factorization misses. If user A and user B both like items X, Y, Z, and user B also likes item W, a 2-hop GNN path naturally propagates this signal to recommend W to user A. However, GNN-based RecSys faces scalability challenges on graphs with billions of edges, requiring mini-batch training with neighbor sampling, which introduces variance.

**Mathematical formulation (LightGCN):**
```
e_u^{(l+1)} = Σ_{i∈N_u} (1/√|N_u|·√|N_i|) · e_i^{(l)}
e_i^{(l+1)} = Σ_{u∈N_i} (1/√|N_i|·√|N_u|) · e_u^{(l)}

e_u = Σ_{l=0}^{L} α_l · e_u^{(l)}   (layer combination)
ŷ_ui = e_u^T · e_i
```

**Difficulty:** L3 | **Prerequisites:** Graph neural networks, spectral graph theory, message passing

#### 3.9 Sequential Recommendation: SASRec, BERT4Rec

Sequential recommendation models the user's interaction history as an ordered sequence and predicts the next item. SASRec (Self-Attentive Sequential Recommendation, Kang & McAuley, 2018) applied a unidirectional Transformer (decoder-only, like GPT) to item sequences, using causal self-attention to capture both short-term and long-term dependencies. SASRec outperformed RNN-based methods (GRU4Rec) and CNN-based methods (Caser) while being more parallelizable.

BERT4Rec (Sun et al., 2019) applied the bidirectional masked language model approach: randomly mask items in the sequence and train the model to predict them. This allows each position to attend to both left and right context, capturing richer patterns. However, the training-serving discrepancy (masking during training vs. predicting the last position during serving) is a known limitation that subsequent work has addressed.

The Transformer's dominance in sequential recommendation mirrors its dominance in NLP. Modern extensions include incorporating side information (item features, timestamps), multi-interest extraction (ComiRec), and contrastive learning for data augmentation (CL4SRec). The paradigm naturally extends to session-based recommendation for anonymous users where only the current session is available.

**Mathematical formulation (SASRec):**
```
S = (s_1, s_2, ..., s_t)  — item sequence
E = (e_{s1}, e_{s2}, ..., e_{st}) + PE  — item embeddings + positional encoding

H^l = TransformerBlock(H^{l-1})  — L stacked blocks with causal attention mask
ŷ_{t+1} = softmax(H_t^L · E_items^T)
```

**Difficulty:** L3 | **Prerequisites:** Transformers, self-attention, sequential modeling

#### 3.10 Multi-Task Learning: MMoE and PLE

Industrial recommendation systems optimize multiple objectives simultaneously: click-through rate (CTR), conversion rate (CVR), watch time, user satisfaction, and long-term retention. Multi-task learning shares representations across these correlated but distinct tasks. The Mixture-of-Experts (MoE) architecture and its recommendation-specific variant MMoE (Multi-gate Mixture-of-Experts, Ma et al., 2018, Google) use multiple expert networks with task-specific gating functions that learn which experts are relevant for each task.

Progressive Layered Extraction (PLE, Tang et al., 2020, Tencent) addressed the seesaw phenomenon where improving one task degrades another. PLE introduces task-specific expert networks alongside shared experts, with progressive extraction across layers. This architecture achieved significant improvements in Tencent's video recommendation, simultaneously improving both completion rate and like rate.

ESMM (Entire Space Multi-Task Model, Ma et al., 2018, Alibaba) tackles the CVR estimation problem by decomposing it as pCTCVR = pCTR * pCVR, training on the entire impression space rather than the biased click space. This elegant formulation solves the sample selection bias and data sparsity problems inherent in CVR prediction.

**Mathematical formulation (MMoE):**
```
f_k(x) = Σ_{i=1}^{n} g_k(x)_i · expert_i(x)    for task k

g_k(x) = softmax(W_gk · x)   — task-specific gating network
expert_i(x) = MLP_i(x)         — shared expert networks

L = Σ_k w_k · L_k              — weighted multi-task loss
```

**Difficulty:** L3 | **Prerequisites:** Multi-task learning, mixture of experts, CTR/CVR modeling

#### 3.11 Cold-Start Problem

The cold-start problem is arguably the most persistent challenge in recommendation systems: how to recommend to new users (user cold-start) or recommend new items (item cold-start) with little or no interaction history. For collaborative filtering, which depends entirely on interaction patterns, cold-start is fundamentally unsolvable without auxiliary information.

Content-based features provide the primary mitigation: user demographics, item attributes, textual descriptions, and images can bootstrap initial recommendations. Meta-learning approaches (MeLU, MetaHIN) treat each user as a task and learn to quickly adapt to new users from few interactions. Bandit-based exploration (LinUCB, Thompson Sampling) explicitly balances exploiting known preferences with exploring to reduce uncertainty for cold-start entities.

In industrial systems, cold-start is handled through a combination of strategies: popular item fallback, rule-based onboarding flows (ask users to select genres/categories), cross-platform data sharing (Shopee using user data from Garena), and hybrid architectures where content-based and collaborative signals are fused with learned weighting. The cold-start problem intensifies in fast-moving catalogs like news (all items are cold) and fashion (seasonal turnover).

**Difficulty:** L2 | **Prerequisites:** CF fundamentals, bandit algorithms, meta-learning

#### 3.12 Exploration-Exploitation Tradeoff

Recommendation systems face a fundamental exploration-exploitation dilemma: exploit the model's current knowledge to show items with high predicted relevance, or explore uncertain items to gather information and improve future recommendations. Pure exploitation leads to filter bubbles and suboptimal convergence; pure exploration degrades short-term user experience.

Multi-armed bandit algorithms formalize this tradeoff. Thompson Sampling maintains a posterior distribution over item quality and samples from it, naturally balancing exploration (high-uncertainty items sometimes get sampled) and exploitation (high-mean items get sampled more often). LinUCB (Li et al., 2010) adds contextual features and uses Upper Confidence Bound to select items, exploring those with high uncertainty. These methods are widely deployed: Netflix uses Thompson Sampling for artwork personalization, and Spotify uses contextual bandits for playlist recommendation.

Reinforcement learning extends this to sequential decision-making, where the system optimizes long-term user satisfaction rather than immediate click probability. Off-policy evaluation and learning (IPS estimators, doubly robust methods) enable training RL policies from logged interaction data without costly online A/B tests.

**Mathematical formulation (LinUCB):**
```
a_t = argmax_a [θ_a^T x_{t,a} + α√(x_{t,a}^T A_a^{-1} x_{t,a})]

exploitation: θ_a^T x_{t,a}   (predicted reward)
exploration: α√(x_{t,a}^T A_a^{-1} x_{t,a})   (confidence width)
```

**Difficulty:** L3 | **Prerequisites:** Bandit theory, Bayesian inference, RL basics

---

### 4. Algorithm Catalog

| # | Algorithm | Category | Best For | Scale | Maturity | Key Innovation |
|---|-----------|----------|----------|-------|----------|----------------|
| 1 | **UserKNN** | Memory-based CF | Small, dense datasets | ~10^5 users | Classic (1994) | Neighborhood-based prediction with user similarity |
| 2 | **ItemKNN** | Memory-based CF | E-commerce "similar items" | ~10^6 items | Classic (2001) | Stable item-item similarities, Amazon's foundation |
| 3 | **SVD/ALS** | Matrix Factorization | Explicit/implicit feedback | ~10^8 interactions | Mature (2006) | Low-rank latent factor decomposition |
| 4 | **BPR** | Pairwise Learning | Implicit feedback ranking | ~10^7 interactions | Mature (2009) | Bayesian pairwise ranking loss for implicit data |
| 5 | **FM/FFM** | Feature Interaction | Sparse high-dimensional CTR | ~10^9 features | Mature (2010/2016) | Factorized second-order feature interactions |
| 6 | **Wide & Deep** | Hybrid DNN | App/content recommendation | Billions | Production (2016) | Memorization (wide) + generalization (deep) |
| 7 | **DeepFM** | Feature Interaction DNN | CTR prediction | Billions | Production (2017) | FM replaces manual wide features |
| 8 | **DIN/DIEN** | Attention-based | E-commerce display ads | Billions | Production (2018) | Target-aware attention over user behavior |
| 9 | **SASRec** | Sequential Transformer | Next-item prediction | ~10^7 sequences | Research/Prod (2018) | Causal self-attention for sequences |
| 10 | **BERT4Rec** | Bidirectional Sequential | Next-item prediction | ~10^7 sequences | Research (2019) | Masked item prediction, bidirectional context |
| 11 | **LightGCN** | Graph Neural Network | Collaborative filtering | ~10^7 edges | Research/Prod (2020) | Simplified GCN: aggregation only, no transforms |
| 12 | **Two-Tower (DSSM)** | Dual Encoder | Large-scale retrieval | Billions | Production (2013+) | Decoupled user/item encoding enables ANN retrieval |
| 13 | **PinSage** | Industrial GNN | Visual/content recommendation | Billions of nodes | Production (2018) | Random-walk sampling, importance pooling on web-scale graph |
| 14 | **Thompson Sampling** | Contextual Bandit | Exploration under uncertainty | Any | Classic/Prod | Posterior sampling for natural explore/exploit |
| 15 | **LinUCB** | Contextual Bandit | Contextual exploration | ~10^6 arms | Mature (2010) | UCB with linear contextual features |
| 16 | **P5 / InstructRec** | LLM-based | Multi-task recommendation | ~10^6 items | Emerging (2022+) | Recommendation as natural language generation |

---

### 5. State of the Art (2024-2026)

#### 5.1 Foundation Models for RecSys

The foundation model paradigm has reached recommendation systems. **P5** (Pretrain, Personalized Prompt, and Predict Paradigm, Geng et al., 2022) unifies five recommendation tasks (rating prediction, sequential recommendation, explanation generation, review summarization, direct recommendation) into a single text-to-text framework built on T5. Items and users are mapped to tokens, and all tasks are expressed as natural language prompts. M6-Rec from Alibaba extends this to multimodal inputs (images, text, behavior). InstructRec (2023) further aligns recommendation with instruction-tuning methodology.

By 2025-2026, the field has moved toward **Recommendation Foundation Models (RFMs)** that are pretrained on massive multi-domain interaction data and fine-tuned for specific platforms. These models demonstrate strong zero-shot and few-shot recommendation capabilities, partially addressing the cold-start problem. However, scaling laws for RecSys remain poorly understood compared to NLP — the relationship between model size, data volume, and recommendation quality does not follow clean power laws due to the heterogeneous nature of user behavior data.

#### 5.2 LLM-as-Recommender Paradigm

Large language models have been explored as recommenders in multiple modes: (1) LLM as scorer, directly ranking candidate items given user history in the prompt; (2) LLM as feature extractor, generating rich text embeddings for items and user profiles; (3) LLM as conversational recommender, engaging in multi-turn dialog to elicit preferences. ChatRec, RecLLM, and various GPT-4-based systems have demonstrated competitive zero-shot recommendation, particularly for cold-start users.

The key challenge is efficiency: running a 70B-parameter LLM for each recommendation request is orders of magnitude more expensive than a specialized two-tower model. Hybrid architectures are emerging where LLMs handle cold-start and long-tail cases while lightweight models serve the bulk of traffic. Knowledge distillation from LLMs into compact RecSys models is an active area of research in 2025-2026.

#### 5.3 GNN-Based Approaches

Graph neural networks continue to dominate when interaction data has rich relational structure. Beyond LightGCN, methods like **SimGCL** (contrastive learning without data augmentation), **DirectAU** (alignment and uniformity optimization), and **LightGCL** (SVD-based augmentation) have pushed the Pareto frontier of accuracy and efficiency. Heterogeneous graph models that incorporate user-item, item-item, user-user, and attribute relations show particular strength in knowledge-graph-enhanced recommendation.

#### 5.4 Real-Time Feature Stores and Streaming Recommendations

Production RecSys in 2025-2026 relies heavily on real-time feature infrastructure. Systems like Feast, Tecton, and proprietary stores at major tech companies enable features computed over streaming data (last 5 minutes of clicks, trending items, real-time inventory) to be served at prediction time with p99 latency under 10ms. The architecture typically consists of: (1) streaming ingestion (Kafka/Flink), (2) online feature computation, (3) feature store with dual online/offline serving, (4) model serving with feature lookup.

#### 5.5 Vietnamese E-Commerce Recommendation Engines

**Shopee:** Operates one of Southeast Asia's largest recommendation systems, serving 200M+ users. Their architecture features a multi-stage funnel: retrieval (two-tower with ANN), pre-ranking (lightweight model), ranking (deep cross-network with multi-task objectives), and re-ranking (diversity and business rules). Shopee's unique challenges include cross-market recommendation (13 markets with different product distributions), multilingual content, and extreme catalog velocity (millions of new listings daily). Their recommendation team has published work on cross-market transfer learning and multi-modal product understanding.

**Tiki:** Vietnam's leading local e-commerce platform uses a hybrid recommendation system combining collaborative filtering, content-based features (product descriptions in Vietnamese), and behavioral signals. Key challenges include Vietnamese NLP for product understanding, smaller data scale compared to Shopee requiring efficient learning, and integration of TikiNOW (fast delivery) signals into recommendation ranking.

**Lazada (Alibaba-backed):** Leverages Alibaba's recommendation infrastructure adapted for Southeast Asian markets. Their system benefits from transfer learning with Taobao's models and features Alibaba-developed architectures like DIEN and ESMM adapted for multi-market deployment. Cross-domain recommendation between Lazada and other Alibaba ecosystem products is a key differentiator.

**TikTok/Douyin:** ByteDance's recommendation engine is arguably the most sophisticated in the world for short-video content. The system uses a monolith architecture (embedding table sharded across parameter servers) with real-time feedback loops — user engagement signals from the first few seconds of video viewing are used to adjust subsequent recommendations within the same session. The recommendation algorithm considers content understanding (visual, audio, text), user modeling, and contextual signals with millisecond-level feature freshness.

---

### 6. Key Papers

| # | Paper | Authors | Year | Venue | Key Contribution |
|---|-------|---------|------|-------|------------------|
| 1 | **Matrix Factorization Techniques for Recommender Systems** | Koren, Bell, Volinsky | 2009 | IEEE Computer | Definitive survey of MF methods; biased SVD, temporal dynamics; Netflix Prize insights |
| 2 | **BPR: Bayesian Personalized Ranking from Implicit Feedback** | Rendle, Freudenthaler, Gantner, Schmidt-Thieme | 2009 | UAI | Pairwise optimization criterion for implicit feedback; generic framework applicable to any model |
| 3 | **Wide & Deep Learning for Recommender Systems** | Cheng et al. (Google) | 2016 | DLRS | Memorization + generalization paradigm; deployed at Google Play; template for industrial RecSys |
| 4 | **DeepFM: A Factorization-Machine based Neural Network** | Guo, Tang, Ye, Li, He | 2017 | IJCAI | End-to-end FM + deep model; eliminates feature engineering in wide component |
| 5 | **Deep Interest Network for Click-Through Rate Prediction** | Zhou et al. (Alibaba) | 2018 | KDD | Target-aware attention over user behaviors; local activation unit; deployed at Alibaba |
| 6 | **Self-Attentive Sequential Recommendation (SASRec)** | Kang, McAuley | 2018 | ICDM | Transformer for sequential rec; causal self-attention; outperforms RNN/CNN baselines |
| 7 | **LightGCN: Simplifying and Powering Graph Convolution Network for Recommendation** | He, Deng, Wang, Li, Zhang, Wang | 2020 | SIGIR | Removes transformations/activations from GCN; neighborhood aggregation suffices for CF |
| 8 | **Graph Convolutional Neural Networks for Web-Scale Recommender Systems (PinSage)** | Ying et al. (Pinterest) | 2018 | KDD | First billion-scale GNN; random-walk neighbor sampling; importance pooling |
| 9 | **Recommendation as Language Processing (P5)** | Geng, Liu, He, Yuan, Ao et al. | 2022 | RecSys | Unifies 5 rec tasks as text-to-text; pretrain-prompt-predict paradigm |
| 10 | **Scaling Laws for Neural Language Models (implications for RecSys)** | Kaplan et al. / Shin et al. | 2020/2023 | — | Power-law scaling in NLP; ongoing work on whether RecSys follows similar laws |
| 11 | **Factorization Machines** | Rendle | 2010 | ICDM | General factorized feature interaction; subsumes SVD, SVD++, and other models |
| 12 | **Deep Learning Recommendation Model (DLRM)** | Naumov et al. (Meta) | 2019 | — | Industry reference architecture; embedding tables + MLP; basis for production systems at Meta |

---

### 7. Mathematical Foundations

#### 7.1 Matrix Factorization and SVD Decomposition

The Singular Value Decomposition factorizes any matrix R = UΣV^T, where U is (m x r) orthogonal, Σ is (r x r) diagonal with singular values, and V is (n x r) orthogonal. Truncated SVD retains only the top-k singular values, yielding the best rank-k approximation in Frobenius norm (Eckart-Young theorem). In RecSys, the challenge is that R has missing entries, so standard SVD cannot be applied directly. Instead, we optimize over observed entries only:

```
min_{P,Q} Σ_{(u,i)∈Ω} (r_ui - p_u^T q_i)^2 + λ(||P||_F^2 + ||Q||_F^2)

Gradient updates (SGD):
  e_ui = r_ui - p_u^T q_i
  p_u ← p_u + η(e_ui · q_i - λ · p_u)
  q_i ← q_i + η(e_ui · p_u - λ · q_i)
```

#### 7.2 BPR Loss (Bayesian Personalized Ranking)

BPR optimizes for the correct ranking of item pairs rather than pointwise rating prediction. For each user u, observed item i (positive) is preferred over unobserved item j (negative):

```
L_BPR = -Σ_{(u,i,j)∈D_S} ln σ(x̂_uij) + λ||Θ||^2

where x̂_uij = x̂_ui - x̂_uj (score difference)
      D_S = {(u,i,j) | i ∈ I_u^+, j ∈ I \ I_u^+}
      σ = sigmoid function

Gradient: ∂L/∂Θ = Σ (σ(-x̂_uij) - 1) · ∂x̂_uij/∂Θ + λΘ
```

BPR's elegance lies in its Bayesian derivation: maximizing the posterior probability of observing pairwise preferences under a likelihood model with uniform prior.

#### 7.3 Factorization Machine Feature Interaction

FMs model all pairwise feature interactions with factorized parameters, enabling generalization even for sparse feature combinations:

```
ŷ(x) = w_0 + Σ_{i=1}^{n} w_i x_i + Σ_{i=1}^{n} Σ_{j=i+1}^{n} <v_i, v_j> x_i x_j

The interaction term can be computed in O(nk) instead of O(n^2 k):
Σ_i Σ_{j>i} <v_i,v_j> x_i x_j = 1/2 [Σ_{f=1}^{k} (Σ_i v_{if} x_i)^2 - Σ_{f=1}^{k} Σ_i v_{if}^2 x_i^2]
```

This O(nk) reformulation makes FMs practical for high-dimensional sparse data with millions of features.

#### 7.4 Attention Mechanism in DIN

DIN's local activation unit computes attention weights between a candidate item and each item in the user's behavior sequence:

```
α_j = exp(a(e_j, e_ad)) / Σ_{k∈B_u} exp(a(e_k, e_ad))

a(e_j, e_ad) = W^T · ReLU(W_1[e_j; e_ad; e_j ⊙ e_ad; e_j - e_ad] + b_1) + b

v_u = Σ_{j∈B_u} α_j · e_j
```

The key design choices are: (1) element-wise product and difference as explicit interaction features, (2) no softmax normalization in practice (unnormalized attention works better empirically, preserving the intensity of user interest), (3) the attention function is itself a small feed-forward network.

#### 7.5 Contrastive Learning for RecSys

Self-supervised contrastive learning addresses data sparsity by creating augmented views of users/items and pulling positive pairs together while pushing negatives apart:

```
L_CL = -Σ_u log [exp(sim(z_u, z_u') / τ) / Σ_{v≠u} exp(sim(z_u, z_v') / τ)]

where z_u, z_u' = two augmented views of user u's representation
      τ = temperature hyperparameter
      sim = cosine similarity

Augmentation strategies: node/edge dropout, feature masking, subgraph sampling
```

Methods like SGL, SimGCL, and CL4SRec have demonstrated that contrastive auxiliary losses consistently improve recommendation accuracy, especially for long-tail users and items.

#### 7.6 Evaluation Metrics: NDCG, MRR, Hit Rate

```
Hit Rate@K = (1/|U|) Σ_u 𝟙[relevant item in top-K]

MRR@K = (1/|U|) Σ_u 1/rank_u  (if relevant item in top-K, else 0)

NDCG@K = (1/|U|) Σ_u DCG@K_u / IDCG@K_u
  where DCG@K = Σ_{i=1}^{K} (2^{rel_i} - 1) / log_2(i+1)

Recall@K = (1/|U|) Σ_u |{relevant items in top-K}| / |{all relevant items for u}|
```

The offline-online metric gap is a critical concern: models with higher NDCG offline may not improve online engagement metrics. This motivates counterfactual evaluation (IPS weighting) and interleaving experiments.

---

### 8. Evolution Timeline

| Year | Milestone | Significance |
|------|-----------|--------------|
| **1992** | Tapestry system (Goldberg et al.) | Coined "collaborative filtering"; first email filtering by user annotations |
| **1994** | GroupLens (Resnick et al.) | Automated CF for Usenet news; established user-based neighborhood CF |
| **1998** | Amazon item-to-item CF | Scalable item-based CF; "customers who bought X also bought Y" |
| **2001** | Sarwar et al. — Item-Based CF | Formalized item-based CF algorithms; demonstrated superiority over user-based at scale |
| **2006** | Netflix Prize launched | $1M competition catalyzed MF research; brought RecSys to mainstream ML |
| **2009** | Koren — MF Techniques; Rendle — BPR | Biased SVD + temporal dynamics; pairwise optimization for implicit feedback |
| **2010** | Rendle — Factorization Machines | Unified framework for sparse feature interaction; predecessor to deep CTR models |
| **2016** | Wide & Deep (Google); GRU4Rec (Hidasi) | Deep learning enters production RecSys; session-based RNNs |
| **2017-18** | DeepFM, DIN, NCF, SASRec, PinSage | Deep learning RecSys explosion: attention, transformers, GNNs all applied |
| **2019** | DLRM (Meta); BERT4Rec; DIEN | Industrial reference architecture; bidirectional sequential models |
| **2020** | LightGCN; YouTube Two-Tower papers | GNN simplification; retrieval-ranking paradigm codified |
| **2022** | P5; InstructRec | LLM meets RecSys; recommendation as language processing |
| **2023-24** | GPT-4 as recommender; RecSys foundation models | Zero-shot recommendation; multi-task pretrained models |
| **2025-26** | RFMs at scale; real-time LLM-hybrid RecSys | Foundation models deployed in production; hybrid LLM + lightweight architectures |

---

### 9. Cross-Domain Connections

| Connection | Module | Relationship |
|------------|--------|--------------|
| **NLP for Recommendations** | B04 NLP | LLM-based recommendation (P5, InstructRec); review understanding for preference extraction; conversational recommendation; Vietnamese NLP for product matching at Tiki/Shopee |
| **Visual Recommendation** | B03 Computer Vision | Visual search as recommendation (Pinterest, Shopee visual search); multimodal product embeddings combining images + text; fashion recommendation from outfit images |
| **Optimization in RecSys** | B06 Optimization | Auction mechanisms in ad recommendation (GSP, VCG); pricing optimization; constrained optimization for fairness/diversity in rankings; bid optimization |
| **Fraud Detection** | B07 Anomaly Detection | Detecting fake reviews and click fraud that poison recommendation models; shilling attacks on CF systems; bot traffic filtering before model training |
| **Search-Rec Convergence** | B12 Search & RAG | Unified retrieval systems serving both search and recommendation; RAG for knowledge-grounded recommendations; shared embedding spaces; query recommendation |
| **Feature Engineering** | B13 Tabular ML | User/item feature engineering for CTR models; gradient boosting for re-ranking; feature stores shared between tabular ML and RecSys pipelines |
| **Time Series** | B08 Time Series | Temporal dynamics in user behavior; seasonal recommendation patterns; demand forecasting integration with inventory-aware recommendations |
| **Reinforcement Learning** | B09 RL | Bandit-based exploration; long-term reward optimization; RL for slate recommendation; off-policy evaluation |

---

### 10. Knowledge Structure Map

```
L0 — Prerequisites
├── Linear Algebra (matrix operations, SVD, eigendecomposition)
├── Probability & Statistics (Bayes theorem, distributions, sampling)
├── Python + NumPy/Pandas
└── Basic ML (supervised learning, loss functions, evaluation)

L1 — Foundations
├── User-item interaction matrix, sparsity
├── Similarity metrics (cosine, Pearson, Jaccard)
├── User-based CF, Item-based CF
├── Evaluation: precision, recall, NDCG, MRR
├── Train/test splitting for RecSys (temporal split)
└── Popularity baselines

L2 — Intermediate
├── Matrix Factorization (SVD, ALS, NMF)
├── BPR pairwise learning
├── Factorization Machines (FM, FFM)
├── Implicit feedback modeling
├── Embedding methods (Item2Vec)
├── Two-tower architecture + ANN retrieval
├── Wide & Deep, DeepFM, NCF
├── Multi-stage ranking pipeline (retrieval → ranking → re-ranking)
├── Cold-start strategies
└── A/B testing for recommendations

L3 — Advanced
├── Attention-based models (DIN, DIEN)
├── Sequential recommendation (SASRec, BERT4Rec)
├── Graph neural networks (LightGCN, PinSage)
├── Multi-task learning (MMoE, PLE, ESMM)
├── Contextual bandits (LinUCB, Thompson Sampling)
├── Contrastive learning for RecSys
├── Real-time feature engineering + streaming
├── Bias and fairness in recommendations
├── Counterfactual evaluation (IPS, doubly robust)
└── Production MLOps for RecSys (feature stores, model serving)

L4 — Research Frontier
├── LLM-as-recommender (P5, InstructRec, ChatRec)
├── Recommendation Foundation Models
├── Scaling laws for RecSys
├── Causal recommendation (debiasing, causal inference)
├── Multi-objective optimization + Pareto-optimal recommendations
├── Federated recommendation (privacy-preserving)
├── Conversational + interactive recommendation
└── Neuro-symbolic recommendation (knowledge graphs + neural)
```

---

### 11. Confidence Assessment

| Finding | Confidence | Evidence Source |
|---------|------------|----------------|
| Matrix factorization is well-understood and validated | **Very High** | Netflix Prize, thousands of papers, decades of production deployment |
| Deep learning RecSys (DeepFM, DIN) improves CTR | **High** | Published A/B tests at Alibaba, Huawei; reproducible benchmarks |
| LightGCN outperforms standard GCN for CF | **High** | SIGIR 2020; extensive ablations; reproduced by community |
| Two-tower + ANN is the dominant retrieval architecture | **High** | Published by YouTube, Facebook, Spotify, Pinterest; industry consensus |
| SASRec/BERT4Rec advance sequential recommendation | **High** | Strong benchmark results; widely reproduced; production adoption |
| LLM-based recommendation is competitive | **Medium** | Promising results but limited production validation; efficiency concerns unresolved |
| Recommendation Foundation Models generalize across domains | **Medium-Low** | Early-stage research; scaling laws unclear; few public large-scale validations |
| Shopee/Tiki specific architecture details | **Medium** | Based on published blog posts, conference talks, and job descriptions; internal details are proprietary |
| Filter bubble effects are significant in practice | **Medium** | Some empirical evidence, but measuring counterfactuals is inherently difficult |
| Scaling laws for RecSys follow NLP patterns | **Low** | Preliminary research only; heterogeneous data makes clean power laws unlikely |

---

### 12. Open Questions

**1. Filter Bubbles and Echo Chambers**
Do recommendation algorithms systematically narrow user exposure and reinforce existing biases? While the intuition is strong, empirical evidence is mixed. Spotify's research suggests their algorithm increases musical diversity for most users. The challenge is defining and measuring "diversity" — topical, ideological, or stylistic — and establishing causal rather than correlational effects. This is especially relevant for news and political content recommendation.

**2. Fairness in Recommendations**
Multi-stakeholder fairness remains unsolved: fairness to users (equal quality across demographics), fairness to providers (equal exposure for small sellers vs. large brands on Shopee), and fairness to items (popularity bias means long-tail items are systematically under-recommended). How do we formally define fairness constraints and incorporate them without unacceptable accuracy loss? Regulatory pressure (EU AI Act, Vietnam's emerging data regulations) is making this increasingly urgent.

**3. Cold-Start at Scale**
Despite decades of work, cold-start remains painful in fast-moving catalogs. News recommendation, fashion e-commerce, and new marketplace sellers face this daily. Can meta-learning, LLM-based content understanding, or cross-platform transfer truly solve this? The gap between academic cold-start benchmarks (small, controlled) and industrial cold-start (millions of new items daily at Shopee) remains vast.

**4. Offline-Online Metric Gap**
Models that improve NDCG@10 on offline test sets frequently show no improvement or even degradation in online A/B tests measuring engagement, revenue, or retention. This gap arises from distribution shift (offline data is biased by the previous policy), metric misalignment (NDCG does not capture long-term satisfaction), and confounders (user interface changes, seasonality). Counterfactual evaluation (IPS, doubly robust) partially addresses this but introduces high variance. Bridging this gap is perhaps the most important practical problem in RecSys.

**5. LLM Reasoning for Recommendations**
Can large language models truly reason about user preferences, or are they pattern-matching on training data? The promise is that LLMs can understand why a user might like an item (inferring intent from review text, understanding product relationships), not just correlate interaction patterns. The open question is whether this reasoning capability translates to measurably better recommendations at scale, and whether the computational cost can be justified. Emerging approaches like "chain-of-recommendation" prompting and tool-augmented LLM recommenders are exploring this frontier.

**6. Real-Time Personalization vs. Privacy**
The most effective recommendation systems use real-time behavioral signals (what you clicked 5 seconds ago), but this requires extensive tracking that conflicts with privacy regulations (GDPR, PDPA in Vietnam). Federated learning for recommendations (training models without centralizing user data) is a promising direction but introduces significant systems complexity and may reduce model quality. On-device recommendation (Apple's approach) offers another path but limits the collaborative signals available.

---

*End of Report — Dr. Archon (R-alpha), MAESTRO Knowledge Graph Platform*
*Phase 1, Module B05, Task 1.1 — Deep Academic Research*
