# ML Engineer Notes: Knowledge Graph (B11)
## By Tran Quoc Huy (R-MLE) — Date: 2026-03-31

### 1. KG Embedding Models Overview

Knowledge Graph Embeddings (KGE) map entities and relations into continuous vector spaces for downstream tasks like link prediction, entity classification, and KG completion.

| Model | Type | Key Idea | Scoring Function |
|-------|------|----------|-----------------|
| TransE | Translational | h + r ≈ t | -\|\|h + r - t\|\| |
| TransR | Translational | Project to relation-specific space | -\|\|M_r h + r - M_r t\|\| |
| RotatE | Rotational | Relation as rotation in complex space | -\|\|h ∘ r - t\|\| |
| ComplEx | Tensor factorization | Complex-valued embeddings | Re(⟨h, r, conj(t)⟩) |
| DistMult | Bilinear | Diagonal relation matrix | ⟨h, r, t⟩ |
| ConvE | Neural | 2D convolution on reshaped embeddings | f(vec(f([h;r] * w))W)t |

### 2. KG Embedding Training Pipeline

```
Raw KG triples → Train/Valid/Test split → Negative sampling → Model training → Evaluation
```

Key training decisions:
- **Negative sampling**: Corrupt head or tail entity uniformly or with type constraints
- **Loss function**: Margin-based (TransE), binary cross-entropy (ComplEx), or self-adversarial negative sampling (RotatE)
- **Embedding dimension**: 100-500 typical; larger dims for complex KGs
- **Regularization**: L2 on embeddings, dropout for neural models
- **Frameworks**: PyKEEN (recommended — unified API), DGL-KE (distributed), LibKGE

### 3. Link Prediction Evaluation

Standard protocol: For each test triple (h, r, t), rank all entities as candidates for h and t.

| Metric | Description | Target |
|--------|-------------|--------|
| MRR (Mean Reciprocal Rank) | Average of 1/rank for correct entity | > 0.3 |
| Hits@1 | % of correct entities ranked #1 | > 0.2 |
| Hits@3 | % of correct entities in top 3 | > 0.35 |
| Hits@10 | % of correct entities in top 10 | > 0.5 |
| MR (Mean Rank) | Average rank of correct entity | Lower is better |

Important: Always use **filtered** metrics (remove other valid triples from ranking) to avoid penalizing correct predictions.

### 4. GNN Training on Knowledge Graphs

Graph Neural Networks operate directly on the graph structure, learning node representations by message passing.

**R-GCN (Relational Graph Convolutional Network)**:
- Extends GCN with relation-specific weight matrices
- Basis decomposition or block-diagonal decomposition to reduce parameters
- Good for node classification and entity typing in KGs
- Implementation: DGL, PyG (torch_geometric)

**CompGCN (Composition-based GCN)**:
- Jointly learns entity and relation embeddings
- Composition operators: subtraction, multiplication, circular correlation
- Outperforms R-GCN on link prediction benchmarks
- More parameter-efficient than R-GCN

Training considerations:
- **Mini-batching**: Use neighbor sampling (GraphSAGE-style) for large KGs
- **Number of layers**: 2-3 layers typical; deeper causes over-smoothing
- **Hidden dimensions**: 200-500
- **Edge dropout**: 0.1-0.3 for regularization

### 5. Hyperparameter Tuning Strategy

Priority hyperparameters (ordered by impact):

1. **Embedding dimension** — sweep [100, 200, 300, 500]
2. **Learning rate** — sweep [1e-4, 5e-4, 1e-3, 5e-3]
3. **Negative samples per positive** — sweep [32, 64, 128, 256]
4. **Regularization weight** — sweep [1e-5, 1e-4, 1e-3]
5. **Batch size** — sweep [256, 512, 1024]

Use Optuna with TPE sampler for efficient search. Budget: 50-100 trials per model.
Early stopping on validation MRR with patience of 10 epochs.

### 6. Transfer Learning for KG Embeddings

Strategies for bootstrapping embeddings on new/evolving KGs:

- **Pre-trained entity embeddings**: Initialize from Wikipedia2Vec or Wikidata embeddings for entities that match
- **Inductive learning**: Use NodePiece or NBFNet for embedding unseen entities based on their local neighborhood
- **Fine-tuning**: Train on large general KG (Wikidata), then fine-tune on domain-specific KG
- **Cross-lingual transfer**: Use multilingual LM embeddings (XLM-R) as entity features, enabling transfer from English KG to Vietnamese KG

### 7. Evaluation Frameworks

**PyKEEN** (recommended):
- Unified training and evaluation for 30+ KGE models
- Built-in hyperparameter optimization
- Standardized dataset loading and splitting
- Reproducible experiment tracking

**Custom evaluation checklist**:
- Relation-type analysis: Evaluate separately for 1-to-1, 1-to-N, N-to-1, N-to-N relations
- Per-relation breakdown: Identify which relations the model struggles with
- Calibration: Check if model confidence scores are meaningful
- Ablation: Test impact of each data source on overall performance

### 8. Model Selection for B11

Given our KG characteristics (multi-domain, moderate size, evolving):

- **Start with**: RotatE (strong baseline, handles symmetry/antisymmetry/composition)
- **Compare against**: ComplEx (good for symmetric relations), CompGCN (if node features available)
- **For production**: Ensemble top-2 models via score averaging
- **For real-time**: DistMult (fastest inference, acceptable accuracy)

### 9. Scaling Considerations

- **Large KG training**: DGL-KE supports multi-GPU and distributed training
- **Embedding storage**: 10M entities x 200 dims x 4 bytes = 8 GB — fits in RAM
- **Inference latency**: Pre-compute and index embeddings with FAISS for nearest-neighbor queries
- **Retraining frequency**: Weekly full retrain, daily incremental updates via fine-tuning on new triples

### Recommendations for B11

1. **Use PyKEEN as the primary framework** — it provides reproducible, comparable experiments across all major KGE models
2. **Benchmark RotatE, ComplEx, and CompGCN** on our domain KG before committing to a model
3. **Invest in proper evaluation**: Per-relation metrics reveal model weaknesses that aggregate metrics hide
4. **Plan for inductive settings** — new entities arrive constantly; pure transductive models will not suffice
5. **Track experiments with MLflow** — embedding dims, learning rates, and dataset versions must be logged
6. **Pre-compute embeddings for serving** — real-time KGE scoring is too slow; use FAISS for approximate nearest neighbor
7. **Start transfer learning from Wikidata** — it provides a strong initialization for Vietnamese entities that have Wikidata entries
