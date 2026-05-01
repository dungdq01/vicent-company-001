# Solution Architect Notes: Search & RAG (B12)

## 1. Reference Architecture: Simple Semantic Search

For teams starting with search, the minimal viable architecture:

```
[Documents] -> [Chunking Service] -> [Embedding Service] -> [Vector DB (Qdrant)]
                                                                    |
[User Query] -> [Embedding Service] -> [Vector DB Search] -> [Ranked Results]
```

### Components
- **Embedding service**: HuggingFace TEI with multilingual-e5-large
- **Vector DB**: Qdrant single-node or pgvector (for <5M vectors)
- **API layer**: FastAPI service exposing search endpoint
- **Suitable for**: Internal tool, prototype, <1M documents, single team

### Limitations
- No keyword search fallback (misses exact matches)
- No answer generation (just retrieval)
- No access control beyond simple auth

## 2. Reference Architecture: Hybrid Search + RAG

The production-grade architecture combining keyword and semantic search with answer generation:

```
[Documents] -> [Processing Pipeline] -> [Chunking] -> [Embedding] -> [Vector DB]
                                                   -> [Text Index] -> [Elasticsearch]

[User Query] -> [Query Understanding] -> [Parallel Search]
                                              |
                        [BM25 Search] + [Vector Search] -> [RRF Merge]
                                                              |
                                                    [Reranker (Cross-Encoder)]
                                                              |
                                              [Context Assembly] -> [LLM] -> [Streamed Answer]
```

### Components
- **Query understanding**: Intent classifier + entity extractor
- **Dual index**: Elasticsearch (BM25) + Qdrant (vector)
- **Fusion**: Reciprocal Rank Fusion to merge result sets
- **Reranker**: bge-reranker-v2-m3 on GPU
- **LLM**: Claude/GPT-4 for answer generation with streaming
- **Cache**: Redis for query cache, embedding cache, answer cache
- **Suitable for**: Production SaaS, 1-50M documents, multi-tenant

## 3. Reference Architecture: Enterprise Search Platform

Full-featured platform for large organizations:

```
[Multiple Sources] -> [Connector Framework] -> [Unified Processing Pipeline]
       |                                              |
  [Confluence]                              [Document Store (S3)]
  [SharePoint]                              [Metadata Store (PostgreSQL)]
  [Google Drive]                            [Vector Index (Milvus/Qdrant cluster)]
  [Databases]                               [Text Index (Elasticsearch cluster)]
  [APIs]                                    [Knowledge Graph (Neo4j)]
                                                      |
[API Gateway] -> [Auth/ACL] -> [Search Orchestrator] -> [Results]
                                      |
                            [Analytics Pipeline] -> [Dashboards]
```

### Additional Components
- **Connector framework**: Pluggable source connectors with incremental sync
- **Knowledge graph**: Entity relationships for enhanced retrieval
- **Analytics**: Search analytics, query logs, relevance dashboards
- **Admin UI**: Index management, source configuration, quality monitoring
- **Multi-region**: Cross-region replication for global deployments
- **Suitable for**: Enterprise, 50M+ documents, strict compliance requirements

## 4. Technology Selection Matrix

| Requirement | Recommended Technology | Alternative |
|-------------|----------------------|-------------|
| Vector search | Qdrant | Weaviate, Milvus |
| Keyword search | Elasticsearch | OpenSearch |
| Embeddings | multilingual-e5-large | BGE-M3 |
| Reranker | bge-reranker-v2-m3 | Cohere Rerank |
| LLM (RAG) | Claude 3.5 Sonnet | GPT-4o, Gemini |
| Orchestration | Custom Python | LangChain (prototype only) |
| Cache | Redis | Memcached |
| Queue | Redis Streams | SQS, Kafka |
| Object storage | S3 | GCS, MinIO |
| Monitoring | Grafana + Prometheus | Datadog |
| Vietnamese NLP | VnCoreNLP | Underthesea |

## 5. Integration with Existing Systems

### CMS Integration (WordPress, Drupal)
- Webhook on content publish/update triggers re-indexing
- Preserve CMS metadata (categories, tags, author) in search index
- Deep link search results back to CMS pages

### DMS Integration (SharePoint, Google Drive)
- Use official APIs for incremental sync (delta queries)
- Map DMS permissions to search ACLs
- Handle file format diversity (PDF, DOCX, PPTX, XLSX)

### Knowledge Base Integration (Confluence, Notion)
- API-based crawling with page hierarchy preservation
- Maintain parent-child relationships for context in RAG
- Sync every 1-4 hours via scheduled jobs

### ERP/CRM Integration
- Structured data requires different chunking (row-based vs document-based)
- Field-level access control mapping
- Real-time sync via Change Data Capture (CDC)

## 6. Multi-Source Search Federation

When searching across multiple independent systems:

- **Federated search**: Query each source in parallel, merge results
- **Unified index**: Ingest all sources into single search index (preferred)
- **Trade-offs**: Federation preserves source independence but has inconsistent ranking; unified index gives better relevance but requires more ingestion work
- **Recommendation**: Unified index for <10 sources; federated for >10 or when sources cannot be re-indexed

## 7. Migration from Keyword to Semantic Search

### Phase 1: Augment (2-4 weeks)
- Add vector search alongside existing keyword search
- Show semantic results in a separate "Related" section
- Measure user engagement with both result types

### Phase 2: Hybrid (4-8 weeks)
- Merge keyword and semantic results with RRF
- Tune weights based on A/B test results
- Add reranker for improved precision

### Phase 3: RAG (4-8 weeks)
- Add "Ask AI" mode for question answering
- Implement streaming answers with citations
- Gradual rollout: 10% -> 50% -> 100% of users

### Phase 4: Optimize (ongoing)
- Fine-tune embedding model on domain data
- Implement query understanding and expansion
- Add analytics and relevance monitoring

## 8. Recommendations

1. Start with hybrid search architecture (Architecture 2) — pure semantic search misses too many keyword matches
2. Use the phased migration approach; never do a big-bang switch from keyword to semantic
3. Choose Qdrant + Elasticsearch as the default stack unless specific requirements dictate otherwise
4. Build a custom orchestration layer — framework lock-in (LangChain) creates tech debt
5. Plan for multi-source integration from the beginning; adding sources later is harder than designing for it
6. Enterprise search requires a dedicated team of 3-5 engineers for ongoing maintenance and improvement
7. Budget 40% of effort for data pipeline and integration work; search quality depends on data quality
