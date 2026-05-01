# Database Engineer Notes: Search & RAG (B12)

## 1. Vector Database Comparison

### Qdrant
- Written in Rust, high performance, production-ready
- Supports filtering during search (pre-filtering), payload indexing
- Quantization (scalar, product, binary) for memory reduction
- Distributed mode with sharding and replication
- **Best for**: Production workloads needing filtering + performance

### Weaviate
- Go-based, built-in vectorizer modules, GraphQL API
- Hybrid search (BM25 + vector) native
- Multi-tenancy support built-in
- Generative search modules (RAG built into DB layer)
- **Best for**: Teams wanting an all-in-one search+RAG platform

### Chroma
- Python-native, lightweight, easy to embed in applications
- SQLite or ClickHouse backend
- Limited scalability and production features
- **Best for**: Prototyping, small-scale applications, local development

### Pinecone
- Fully managed SaaS, zero operations
- Serverless and pod-based options
- Strong consistency, high availability
- Expensive at scale ($70+/month per 1M vectors)
- **Best for**: Teams with no DB ops capacity, fast time-to-market

### Milvus
- Open-source, highly scalable (billions of vectors)
- Multiple index types, GPU acceleration
- Complex architecture (etcd, MinIO, Pulsar dependencies)
- **Best for**: Large-scale enterprise deployments with dedicated infra team

## 2. Elasticsearch/OpenSearch for Hybrid Search

Elasticsearch remains the gold standard for keyword search and offers vector search:

- **BM25 search**: Mature, well-tuned, excellent for keyword matching
- **kNN search**: Dense vector search via HNSW (since ES 8.0)
- **Hybrid search**: Combine BM25 + kNN in single query using RRF
- **Vietnamese support**: ICU analyzer plugin handles Vietnamese tokenization
- **OpenSearch**: AWS-managed fork, similar capabilities, better for AWS-native stacks

Recommendation: If you already run Elasticsearch, add vector search there before introducing a separate vector DB. For greenfield, use Qdrant + Elasticsearch together.

## 3. PostgreSQL pgvector

- Extension adding vector data type and similarity search to PostgreSQL
- Supports HNSW and IVFFlat indexes
- **Advantage**: No new infrastructure — use existing PostgreSQL
- **Limitation**: Performance degrades beyond 5-10M vectors; no distributed mode
- **Best for**: Small-to-medium datasets (<5M vectors) where simplicity matters
- **pgvector 0.7+**: Significantly improved HNSW performance and parallel index building

## 4. Index Types

### HNSW (Hierarchical Navigable Small World)
- Best recall/speed trade-off for most use cases
- Memory-intensive: stores full graph in RAM
- Build time: moderate; supports incremental inserts
- Tuning: M=16, efConstruction=200, efSearch=100 as starting point

### IVF (Inverted File Index)
- Partitions space into clusters, searches nearest clusters
- Lower memory than HNSW, but lower recall at same speed
- Requires training step on representative data
- Good for very large datasets (100M+ vectors)

### PQ (Product Quantization)
- Compresses vectors by 4-32x, trades recall for memory
- Often combined with IVF (IVF-PQ) for large-scale search
- Acceptable for candidate generation, not for final ranking

### Flat (Brute Force)
- Exact nearest neighbor, 100% recall
- Only viable for <100K vectors
- Useful as evaluation baseline

## 5. Scaling Vector Databases

- **Sharding**: Distribute vectors across nodes by hash or range
- **Replication**: Read replicas for query throughput; 2-3 replicas typical
- **Tiered storage**: Hot vectors in memory, cold vectors on SSD
- **Quantization**: Reduce memory 4x with scalar quantization, 8-32x with PQ
- **Segment management**: Compact segments to maintain query performance
- **Capacity planning**: 1M vectors (768-dim, float32) ~3GB RAM for HNSW

## 6. Backup and Replication

- **Snapshots**: Regular snapshots to S3/GCS; Qdrant and Milvus support native snapshots
- **Replication factor**: Minimum 2 for production; 3 for critical workloads
- **Disaster recovery**: Cross-region replication for enterprise deployments
- **Point-in-time recovery**: Track change logs to enable rollback
- **Index rebuild**: Maintain source-of-truth in object storage; rebuild index from source if needed

## 7. Query Optimization

- **Pre-filtering vs post-filtering**: Pre-filter narrows search space; post-filter applies after kNN
- **Metadata indexing**: Index frequently-filtered fields (date, category, tenant_id)
- **Query caching**: Cache frequent query embeddings and results (TTL 5-15 minutes)
- **Batch queries**: Group multiple searches into single request for throughput
- **Approximate search tuning**: Lower ef/nprobe for speed, raise for recall

## 8. Cost Comparison (1M vectors, 768-dim, production)

| Solution | Monthly Cost | Ops Effort | Max Scale |
|----------|-------------|------------|-----------|
| Qdrant Cloud | $50-100 | Low | 100M+ |
| Pinecone Serverless | $70-150 | None | 1B+ |
| Weaviate Cloud | $60-120 | Low | 100M+ |
| Milvus (self-hosted) | $30-80 (infra) | High | 10B+ |
| pgvector (existing PG) | $0-20 (extra) | Low | 10M |
| Elasticsearch (existing) | $0-50 (extra) | Medium | 50M |

## 9. Recommendations

1. For startups/MVPs: pgvector (if <5M vectors) or Qdrant Cloud
2. For hybrid search: Elasticsearch/OpenSearch + Qdrant (or Weaviate alone)
3. For enterprise scale: Milvus or Qdrant distributed with dedicated infra team
4. Always use HNSW index unless you have 100M+ vectors (then consider IVF-PQ)
5. Pre-filter is almost always better than post-filter for multi-tenant search
6. Budget for 3x your current vector count in capacity planning
7. Keep source documents in object storage; vector DB is a derived index, not source of truth
