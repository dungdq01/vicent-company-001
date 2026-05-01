# DevOps Engineer Notes: Search & RAG (B12)

## 1. Vector Database Deployment

### Qdrant Clustering
- Deploy 3+ nodes for production with replication factor 2
- Use Kubernetes StatefulSets with persistent volumes (SSD-backed)
- Resource allocation: 4-8 vCPU, 16-32GB RAM per node for 5M vectors
- Configure write consistency level (majority for durability, one for speed)
- Health check: `/readyz` and `/livez` endpoints for Kubernetes probes

### Weaviate Clustering
- Minimum 3 nodes for RAFT consensus
- Each node needs: 8 vCPU, 32GB RAM for 5M objects
- Enable replication factor 2-3 for fault tolerance
- Use node affinity to spread across availability zones

### Helm Charts
- Both Qdrant and Weaviate provide official Helm charts
- Customize values: resource limits, storage class, replication, auth tokens
- Pin chart versions in GitOps repository

## 2. Elasticsearch Cluster Management

- **Minimum topology**: 3 master-eligible nodes, 2+ data nodes, 1 coordinating node
- **Resource sizing**: Data nodes need 32-64GB RAM (50% to JVM heap, max 31GB)
- **Storage**: NVMe SSD for data nodes; 1TB minimum per data node
- **Index lifecycle**: Hot-warm-cold architecture for cost optimization
- **Shard sizing**: Target 10-50GB per shard; avoid oversharding
- **Vietnamese analyzer**: Install ICU analysis plugin; configure custom analyzer with Vietnamese tokenizer
- **Monitoring**: Elastic APM or Prometheus elasticsearch-exporter for cluster health

## 3. GPU Allocation for Embedding Generation

### Batch Indexing (Offline)
- Dedicated GPU nodes for document embedding generation
- A100 40GB: ~10K chunks/minute with e5-large; T4: ~2K chunks/minute
- Use Kubernetes Jobs or batch processing queues
- Spot/preemptible instances for cost savings (70% cheaper)
- Autoscale GPU nodes based on indexing queue depth

### Real-time Query Embedding
- Lightweight GPU (T4 or L4) for query embedding inference
- HuggingFace TEI (Text Embeddings Inference) for serving
- 1 T4 GPU handles ~500 queries/second for e5-large
- CPU fallback: ONNX Runtime with INT8 quantization (~50 queries/second)

### GPU Sharing
- Multiple TEI instances per GPU using NVIDIA MPS or time-sharing
- Embedding service + reranker can share a single T4 for moderate traffic

## 4. Monitoring

### Search-Specific Metrics
- **Search latency**: P50, P95, P99 for search and RAG endpoints (target: P95 <500ms search, <3s RAG)
- **Retrieval relevance**: Track NDCG/MRR from user feedback (thumbs up/down)
- **Cache hit rate**: Monitor query cache, embedding cache, LLM cache separately
- **Index freshness**: Time since last document indexed; alert if >24h for active sources
- **Error rates**: Failed searches, LLM timeouts, embedding service errors
- **Token usage**: LLM tokens consumed per RAG query (cost tracking)

### Dashboards
- Grafana dashboard: search latency histogram, QPS, error rate, cache hit rate
- Vector DB dashboard: memory usage, segment count, query latency, index size
- LLM dashboard: tokens/request, cost/day, latency, error rate

### Alerting
- P95 search latency >1s for 5 minutes
- Vector DB node down or replication factor degraded
- Embedding service GPU utilization >90% sustained
- LLM error rate >5%
- Index staleness >configured threshold

## 5. CI/CD for Index Updates

- **Index pipeline**: Document change -> trigger CI -> process -> embed -> index -> validate
- **Validation step**: Run golden query set against new index; compare metrics to baseline
- **Rollback**: Keep previous index version; rollback if metrics degrade >5%
- **Blue-green deployment**: Build new collection, swap alias atomically
- **Canary indexing**: Route 10% of queries to new index, compare metrics
- **GitOps for config**: Index settings, analyzer configs, and pipeline configs in Git

## 6. Scaling for Concurrent Search

- **Horizontal scaling**: Add read replicas for vector DB and Elasticsearch
- **Load balancing**: Round-robin across search replicas; use health-check-aware LB
- **Auto-scaling**: Scale search pods on CPU/memory + custom metrics (queue depth, latency)
- **Connection pooling**: Pool connections to vector DB and Elasticsearch
- **Typical capacity**: 1 Qdrant node (8 vCPU, 32GB) handles ~1000 QPS for 5M vectors
- **Caching layer**: Redis cache in front of search reduces load 20-30%

## 7. Cost Optimization

- **Spot instances**: Use for batch embedding jobs (save 60-70%)
- **Right-sizing**: Monitor actual resource usage; most teams over-provision vector DBs 2-3x
- **Quantization**: Enable scalar quantization to halve vector DB memory requirements
- **Tiered storage**: Move infrequently accessed vectors to SSD tier
- **LLM cost**: Cache RAG responses; use smaller models for simple queries
- **Reserved instances**: Commit to 1-year reserved for stable search infrastructure

### Monthly Cost Estimate (Production, 5M documents)
| Component | Specification | Monthly Cost |
|-----------|--------------|-------------|
| Qdrant (3-node) | 8 vCPU, 32GB each | $500-800 |
| Elasticsearch (3+2) | 3 master + 2 data | $400-700 |
| GPU (embedding) | 1x T4 dedicated | $200-400 |
| LLM API (RAG) | ~1M queries/month | $500-2000 |
| Redis (cache) | 16GB | $100-200 |
| **Total** | | **$1,700-4,100** |

## 8. Recommendations

1. Start with managed services (Qdrant Cloud, Elastic Cloud) and self-host only when costs justify
2. Separate GPU allocation for batch indexing (spot) vs query serving (on-demand)
3. Blue-green index deployment is essential — always be able to rollback
4. Monitor both infrastructure metrics AND search quality metrics (relevance, freshness)
5. Cache aggressively at every layer — it reduces both latency and cost
6. Budget for LLM costs carefully — they dominate in RAG-heavy workloads
7. Use GitOps for all search infrastructure configuration
