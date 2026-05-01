# ML Engineer Notes: Search & RAG (B12)

## 1. Embedding Model Training and Fine-Tuning

Off-the-shelf embedding models (e.g., OpenAI text-embedding-3, multilingual-e5) provide a strong baseline, but domain-specific fine-tuning improves retrieval by 10-30%.

### Contrastive Learning
- **Training objective**: Pull positive pairs closer, push negative pairs apart in embedding space
- **InfoNCE loss**: Standard loss function; uses in-batch negatives for efficiency
- **Hard negative mining**: Critical for performance — use BM25 negatives or cross-encoder scored negatives
- **Training data**: (query, positive_passage, hard_negative) triplets; 10K-100K examples sufficient
- **Frameworks**: Sentence-Transformers, LlamaIndex fine-tuning, or custom PyTorch

### Fine-Tuning Strategy
1. Start with multilingual-e5-large or BGE-M3 as base model
2. Collect domain query-passage pairs from search logs or synthetic generation
3. Mine hard negatives using BM25 top-50 that are not relevant
4. Fine-tune for 3-5 epochs with learning rate 2e-5, batch size 32
5. Validate on held-out query set using Recall@10

## 2. Reranker Training (Cross-Encoder)

Rerankers dramatically improve precision by scoring query-passage pairs jointly.

- **Architecture**: Cross-encoder (BERT-based) takes concatenated (query, passage) as input
- **Base models**: mBERT, XLM-RoBERTa for multilingual, bge-reranker-v2-m3
- **Training data**: Same triplets as embedding training, but with pointwise or pairwise labels
- **Latency trade-off**: Cross-encoders are 100x slower than bi-encoders; use on top-20 candidates only
- **Distillation**: Distill cross-encoder knowledge into bi-encoder for faster retrieval

Recommendation: Use bge-reranker-v2-m3 as baseline; fine-tune only if domain gap is significant.

## 3. Evaluation Metrics for Search

### Retrieval Metrics
- **MRR (Mean Reciprocal Rank)**: Average of 1/rank of first relevant result. Target: >0.5
- **NDCG@K**: Normalized discounted cumulative gain. Accounts for graded relevance. Target: >0.6 at K=10
- **Recall@K**: Fraction of relevant documents in top-K. Target: >0.85 at K=10
- **Precision@K**: Fraction of top-K results that are relevant
- **MAP**: Mean average precision across all queries

### RAG Evaluation Metrics
- **Faithfulness**: Does the answer only use information from retrieved context? (RAGAS metric)
- **Answer relevance**: Does the answer actually address the query?
- **Context relevance**: Are retrieved passages relevant to the query?
- **Answer correctness**: Does the answer match ground truth? (requires labeled data)
- **Hallucination rate**: Percentage of claims not supported by retrieved context

Frameworks: RAGAS, DeepEval, TruLens for automated RAG evaluation.

## 4. Hybrid Search Weight Tuning

Combining BM25 (keyword) and vector (semantic) search improves robustness.

- **Reciprocal Rank Fusion (RRF)**: Merge rankings with RRF formula; k=60 is standard
- **Linear combination**: alpha * bm25_score + (1-alpha) * vector_score; tune alpha on eval set
- **Typical alpha values**: 0.3-0.5 for BM25 weight works well for most domains
- **Per-query routing**: Use query classifier to route keyword-like queries to BM25, semantic queries to vector
- **Tuning method**: Grid search over alpha on golden query set; optimize for NDCG@10

## 5. Vietnamese Embedding Models

Vietnamese is a low-to-medium resource language for embeddings:

- **multilingual-e5-large**: Best general-purpose multilingual embedding; strong Vietnamese support
- **BGE-M3**: Multi-functionality (dense + sparse + colbert); excellent multilingual including Vietnamese
- **Vietnamese-specific**: ViBERT, PhoBERT-based embeddings exist but less mature for retrieval
- **OpenAI text-embedding-3**: Good Vietnamese support but API-dependent and costly at scale
- **Cohere embed-multilingual-v3**: Strong multilingual alternative

Benchmark (Vietnamese retrieval task, estimated):
| Model | Recall@10 | Latency |
|-------|-----------|---------|
| multilingual-e5-large | 0.82 | 15ms |
| BGE-M3 | 0.85 | 20ms |
| PhoBERT-retrieval | 0.75 | 12ms |
| text-embedding-3-large | 0.83 | 50ms (API) |

## 6. Model Serving for Search

- **Embedding service**: Serve via TEI (Text Embeddings Inference by HuggingFace) or Triton
- **Batch inference**: Queue-based batch processing for indexing; real-time for queries
- **GPU sharing**: Multiple embedding models can share GPU with proper batching
- **Caching**: Cache query embeddings (LRU cache) — many queries repeat
- **Quantization**: INT8 quantization reduces memory 2x with <1% quality loss

## 7. Recommendations

1. Always establish a retrieval evaluation set (100-500 labeled queries) before optimization
2. Hybrid search (BM25 + vector) outperforms either alone in virtually all cases
3. Add a reranker — it is the single highest-impact improvement after baseline retrieval
4. For Vietnamese, start with BGE-M3 (dense+sparse in one model simplifies hybrid search)
5. Fine-tune embeddings only after exhausting architectural improvements (reranker, hybrid, chunking)
6. Use RAGAS for automated RAG evaluation; supplement with human evaluation quarterly
7. Track metrics over time — search quality degrades as corpus grows without maintenance
