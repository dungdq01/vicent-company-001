# Deep Learning Notes: B05 Recommendation Systems
## By R-DLE — Date: 2026-03-31

### 1. Evolution: CF → MF → Deep Learning → Transformers → LLMs

The history of recommendation systems tracks the broader arc of machine learning. **Collaborative Filtering (CF)** started with user-based and item-based nearest-neighbor methods in the late 1990s — compute similarity between users or items from the interaction matrix and recommend accordingly. Simple but does not scale and cannot handle sparsity well.

**Matrix Factorization (MF)** emerged from the Netflix Prize era (2006-2009). The key insight: decompose the sparse user-item interaction matrix into low-rank user and item latent factor matrices. SVD++, ALS, and BPR (Bayesian Personalized Ranking) became standard. MF handles sparsity better than CF and scales to millions of users/items, but it cannot incorporate side features (user demographics, item metadata) naturally.

**Deep Learning** entered RecSys around 2016. The YouTube DNN paper and Wide & Deep (Google, 2016) showed that neural networks could combine memorization (wide linear component) and generalization (deep component). This opened the door to incorporating arbitrary features — text, images, sequences — into a unified model. NCF (Neural Collaborative Filtering, 2017) replaced the MF inner product with a neural network, though later work showed that simple dot-product with proper training often matches NCF.

**Transformers** arrived in RecSys via SASRec (2018) and BERT4Rec (2019), applying self-attention to user behavior sequences. The ability to model long-range dependencies in user history and parallelize training made transformers the dominant architecture for sequential recommendation.

**LLMs** represent the current frontier (2023-2026), using large language models either as feature extractors, as recommendation engines via prompting, or as unified text-to-text recommenders. The tradeoff is power versus latency — LLM inference is orders of magnitude slower than embedding lookup.

### 2. Embedding Layer Deep Dive

Embeddings are the foundation of every deep RecSys model. They convert sparse categorical features (user ID, item ID, category, brand) into dense vectors.

**Learnable Embeddings**: Standard approach — an embedding table of shape (num_entities, embedding_dim) initialized randomly and trained end-to-end. For a catalog of 10M items with 64-dim embeddings, this is a 640M-parameter table consuming ~2.5GB in float32. The embedding lookup is essentially a table indexing operation, which is memory-bound rather than compute-bound.

**Pre-trained Embeddings**: Use embeddings from pre-trained models (BERT for text, ResNet/ViT for images) as initial item representations. These can be frozen or fine-tuned. Pre-trained embeddings are essential for cold-start items that have no interaction data but do have content.

**Hash Embeddings**: When cardinality is extremely high (billions of user IDs), maintaining a full embedding table is infeasible. Hashing tricks map IDs to a smaller table via hash functions. The "double hashing" trick uses two hash functions and combines the looked-up embeddings to reduce collision effects. Facebook's TT-Rec uses tensor-train decomposition to compress embedding tables by 100x with minimal quality loss.

**Embedding Dimension Selection**: Empirically, dimensions between 16 and 256 work for most applications. A common heuristic: dim = min(600, round(6 * cardinality^0.25)). Higher cardinality features need higher dimensions. In practice, mixed-dimension embeddings (different dimensions for different features) with a projection layer save memory without hurting quality.

### 3. Feature Interaction Architectures

The core challenge in RecSys is modeling how features interact — a user's preference for "electronics" combined with "under $50" and "high rating" creates a specific intent that no single feature captures.

**Factorization Machines (FM)**: Model all pairwise feature interactions via factorized parameters. The FM formula: y = w0 + sum(wi*xi) + sum_i(sum_j(<vi, vj> * xi * xj)). The factorization trick makes this O(kn) instead of O(kn^2). FM is still a strong baseline — fast, interpretable, and effective for sparse data.

**Field-aware FM (FFM)**: Each feature learns a different embedding for each field it interacts with. More expressive than FM but parameter count grows quadratically with the number of fields. Practical only with a moderate number of fields.

**DeepFM**: Combines FM for explicit pairwise interactions with a deep network for higher-order interactions. The FM and deep components share the same embedding layer. No manual feature engineering needed. This remains one of the most deployed architectures due to its balance of effectiveness and simplicity.

**DCN-v2 (Deep & Cross Network v2)**: Replaces the FM component with a cross network that explicitly models feature interactions up to an arbitrary order. The cross layer computes x_(l+1) = x0 * (W_l * x_l + b_l) + x_l. DCN-v2 uses a mixture of experts in the cross layer for better expressiveness. Google reported significant improvements over the original DCN across multiple production tasks.

**AutoInt**: Uses multi-head self-attention over feature embeddings to automatically learn feature interactions. Each attention head captures different interaction patterns. The attention weights provide interpretability — you can inspect which feature pairs the model focuses on.

### 4. Attention in Recommendations

Attention mechanisms transformed RecSys by allowing models to dynamically weight the relevance of different parts of user history.

**DIN (Deep Interest Network)**: Alibaba's key insight — when predicting whether a user will click on a candidate item, not all of the user's history is relevant. DIN computes an attention score between the candidate item and each item in user history, then creates a weighted sum as the user representation. The attention function is a simple MLP taking the element-wise product and difference of candidate and history item embeddings. This target-aware attention means the user representation changes depending on what item is being scored.

**DIEN (Deep Interest Evolution Network)**: Extends DIN by modeling how user interests evolve over time. Uses a GRU to capture sequential dependencies, then an AUGRU (Attention Update GRU) that modifies the GRU update gate with attention scores from the target item. This captures not just what the user is interested in, but how their interest has shifted. The auxiliary loss on the GRU (predicting the next clicked item at each step) provides extra supervision signal.

**Multi-head Self-Attention (SASRec)**: Applies the transformer self-attention mechanism to user behavior sequences. Each position attends to all previous positions (causal masking). Multiple attention heads capture different types of item relationships. Position embeddings encode temporal order. SASRec outperforms GRU-based models on most benchmarks and is more parallelizable during training.

### 5. Graph Neural Networks for RecSys

User-item interactions naturally form a bipartite graph, making GNNs a natural fit.

**NGCF (Neural Graph Collaborative Filtering)**: Propagates embeddings on the user-item interaction graph. At each layer, a node aggregates messages from its neighbors (users aggregate from items they interacted with, and vice versa). Multiple layers capture higher-order connectivity — 2-hop neighbors represent "users who liked the same items also liked..." patterns. NGCF uses learnable transformation matrices in the message passing.

**LightGCN**: A simplification of NGCF that removes the nonlinear transformation and feature transformation, keeping only neighborhood aggregation and sum. The final embedding is the weighted sum of embeddings from all layers. Despite being simpler, LightGCN consistently outperforms NGCF. The lesson: for collaborative filtering on interaction graphs, the graph structure itself is the important signal — complex transformations add noise.

**PinSage (Pinterest)**: Industrial-scale GNN that handles billions of nodes. Key innovations: (a) random-walk-based neighborhood sampling instead of full neighborhood aggregation, (b) importance pooling using random walk visit counts, (c) curriculum training starting with easy negatives and progressing to hard negatives. PinSage generates item embeddings offline that are used in downstream retrieval.

**Heterogeneous Graph Approaches**: Real-world RecSys data includes multiple node types (users, items, categories, brands, queries) and edge types (click, purchase, add-to-cart, search). Models like HAN (Heterogeneous Attention Network) use type-specific transformations and hierarchical attention (node-level and meta-path-level) to handle this heterogeneity.

### 6. Sequential/Session-based Models

Users interact with items in a temporal sequence, and modeling this sequence captures evolving preferences.

**GRU4Rec**: The first deep sequential recommendation model (2015). Applies GRU to session-based recommendation where user identity may be unknown. Uses session-parallel mini-batches for efficient training and BPR/TOP1 ranking losses. Despite being superseded by attention models, GRU4Rec established the session-based recommendation paradigm.

**SASRec (Self-Attentive Sequential Recommendation)**: Applies a unidirectional (left-to-right) transformer to the user's interaction sequence. Trained with a next-item prediction objective at every position. The causal attention mask ensures each position only attends to previous items. SASRec is the standard baseline for sequential recommendation — simple, effective, and well-understood.

**BERT4Rec**: Applies bidirectional (masked) attention — randomly masks items in the sequence and trains the model to predict them, similar to BERT's MLM objective. Bidirectional attention theoretically captures richer patterns, but in practice the gains over SASRec are inconsistent, and the cloze-task training objective does not perfectly align with the next-item prediction task at inference time.

**S3-Rec (Self-Supervised Sequential Recommendation)**: Adds contrastive pre-training objectives before fine-tuning for recommendation. Pre-training tasks include: predicting masked items, predicting associated attributes, predicting sequence-subsequence relationships. The pre-trained representations transfer well to downstream tasks, especially in low-data regimes. This self-supervised paradigm has become increasingly popular.

### 7. Multi-Task & Multi-Objective Learning

Real recommendation systems optimize for multiple objectives simultaneously — a click is good, but a purchase is better, and a return is bad.

**Shared-Bottom Architecture**: The simplest multi-task approach — shared lower layers with task-specific heads. Problem: negative transfer when tasks conflict (optimizing for clicks may hurt purchase prediction).

**MMOE (Multi-gate Mixture of Experts)**: Replaces the shared bottom with multiple expert networks. Each task has its own gating network that learns to weight the experts differently. This allows different tasks to use different combinations of shared knowledge, reducing negative transfer. Google reported significant improvements over shared-bottom in production.

**PLE (Progressive Layered Extraction)**: Extends MMOE by adding task-specific expert networks alongside shared experts, with progressive separation at each layer. The extraction networks at each level combine shared and task-specific knowledge with increasing specificity. Tencent reported PLE as their production multi-task architecture across multiple recommendation surfaces.

**Pareto Optimization**: When task objectives conflict, there is no single optimal solution — instead there is a Pareto frontier of solutions. Multi-objective optimization methods (e.g., MGDA, Pareto-MTL) find solutions on this frontier. In practice, most teams use scalarization with manually tuned task weights, adjusting weights based on business priorities.

### 8. LLM-based Recommendation

The intersection of large language models and recommendation systems is the most active research area in RecSys as of 2026.

**P5 (Pretrain, Personalized Prompt, and Predict Paradigm)**: Unifies multiple recommendation tasks (rating prediction, sequential recommendation, explanation generation) into a single text-to-text framework. User history and item metadata are serialized into text prompts, and the model generates recommendations as text. Elegant but computationally expensive.

**InstructRec**: Frames recommendation as instruction following. Users express preferences in natural language ("I want something similar to X but cheaper"), and the LLM generates recommendations. This enables zero-shot recommendation for new domains without retraining.

**Chat-Rec**: Integrates a conversational LLM with a traditional RecSys backend. The LLM handles natural language understanding and explanation, while the traditional system handles retrieval and ranking. This hybrid approach gets the best of both worlds — LLM flexibility with RecSys efficiency.

**LLM as Feature Extractor vs LLM as Recommender**: Using an LLM to generate text embeddings or extract semantic features for items (then feeding into a traditional ranking model) is practical and adds value with manageable latency. Using an LLM as the actual recommender (generating item IDs or titles) is powerful but faces latency challenges — a single LLM inference takes 100ms-1s, versus 1-10ms for embedding lookup. Most production systems in 2026 use the feature-extractor approach, with LLM-as-recommender reserved for conversational or exploration-heavy scenarios.
