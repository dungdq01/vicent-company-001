# Backend Engineer Notes: Search & RAG (B12)

## 1. Search API Design

### REST API Endpoints
```
POST /api/v1/search          — hybrid search (keyword + semantic)
POST /api/v1/search/semantic  — vector-only search
POST /api/v1/ask              — RAG question answering
POST /api/v1/documents        — upload document for indexing
DELETE /api/v1/documents/:id  — remove document from index
GET /api/v1/documents/:id/status — indexing status
GET /api/v1/suggestions       — autocomplete suggestions
```

### Request/Response Design
- Search request: query, filters (date, source, category), page, limit, search_mode
- Search response: results[], total_count, facets, query_id, latency_ms
- RAG response: answer, sources[], confidence, query_id
- Always return query_id for debugging and analytics

### GraphQL Alternative
- Single `/graphql` endpoint with search, ask, and document mutations
- Advantage: clients request exactly the fields they need
- Disadvantage: harder to cache, more complex backend

Recommendation: REST for public APIs, GraphQL for internal dashboard consumption.

## 2. RAG Orchestration Backend

The RAG pipeline has multiple async steps that need orchestration:

1. **Query preprocessing**: Classify intent, extract entities, rewrite query
2. **Retrieval**: Parallel BM25 + vector search, merge results
3. **Reranking**: Score top-N candidates with cross-encoder
4. **Context assembly**: Select top-K passages, format with metadata
5. **Generation**: Send context + query to LLM, stream response
6. **Post-processing**: Extract citations, check for hallucination flags

### Implementation Options
- **LangChain/LlamaIndex**: Rapid prototyping, many integrations, but opaque abstractions
- **Custom pipeline**: More control, better observability, recommended for production
- **Event-driven**: Use message queues (Redis Streams, Kafka) for async steps

Recommendation: Build custom orchestration layer; use LangChain only for prototyping.

## 3. Streaming RAG Responses

Users expect sub-second first-token latency. Streaming is essential.

- **Server-Sent Events (SSE)**: Simplest streaming protocol; works through most proxies
- **WebSocket**: Full-duplex but overkill for search; use only if bidirectional needed
- **Implementation**: Stream LLM tokens as they arrive; send sources metadata in final event
- **Partial response format**: `data: {"type": "token", "content": "The"}` per token
- **Final event**: `data: {"type": "done", "sources": [...], "query_id": "..."}`
- **Error handling**: Send error event on LLM failure; allow client to retry

## 4. Caching Search Results

Caching reduces latency and cost significantly for repeated queries:

- **Query cache**: Cache (query_hash, filters) -> results for 5-15 minutes (Redis)
- **Embedding cache**: Cache query text -> embedding vector (avoid re-computation)
- **LLM response cache**: Cache (query + context_hash) -> generated answer
- **Semantic cache**: Use vector similarity to match semantically similar queries to cached answers
- **Cache invalidation**: Invalidate on index update; use TTL as fallback
- **Hit rates**: Expect 15-30% cache hit rate for enterprise search

## 5. Rate Limiting

Search and RAG endpoints need different rate limits:

- **Search**: 60 requests/minute per user (lightweight)
- **RAG/Ask**: 10 requests/minute per user (expensive — LLM cost)
- **Document upload**: 100 documents/hour per tenant
- **Implementation**: Token bucket algorithm in Redis; return 429 with retry-after header
- **Per-tenant limits**: Different tiers for different customer plans
- **Burst handling**: Allow 2x burst for 10-second window

## 6. Multi-Tenant Search Isolation

Enterprise search must strictly isolate tenant data:

- **Index-level isolation**: Separate vector collection per tenant (simplest, most secure)
- **Metadata filtering**: Single index with tenant_id filter (more efficient, requires careful implementation)
- **Hybrid**: Separate index for large tenants, shared index for small tenants
- **Access control**: Validate tenant_id in middleware before every search query
- **Data leakage prevention**: Never return documents without tenant_id match in filter

Recommendation: Metadata filtering with mandatory tenant_id filter for most cases. Index-level isolation only for compliance-sensitive tenants.

## 7. Document Upload and Processing Pipeline

```
Upload -> Validate -> Store (S3) -> Queue -> Process -> Chunk -> Embed -> Index
```

- **Upload**: Multipart form upload, max 50MB per file, support PDF/DOCX/TXT/HTML
- **Validation**: File type check, virus scan, size limit, content language detection
- **Storage**: Store original in S3 with tenant prefix; never lose source document
- **Queue**: SQS/Redis queue for async processing; decouple upload from indexing
- **Status tracking**: Document status (uploaded, processing, indexed, failed) via API
- **Webhook notifications**: Notify client when document indexing completes or fails

## 8. Webhook for Index Updates

- **Events**: document.indexed, document.failed, index.rebuilt, search.degraded
- **Delivery**: HTTP POST with HMAC signature for verification
- **Retry**: Exponential backoff (1s, 5s, 30s, 5m) with max 5 retries
- **Payload**: event_type, document_id, tenant_id, timestamp, details

## 9. Recommendations

1. Build the RAG pipeline as a custom orchestration layer, not a LangChain chain
2. Implement SSE streaming from day one — retrofitting is painful
3. Cache at three levels: embedding, retrieval results, and LLM response
4. Multi-tenant isolation via metadata filtering is sufficient for most cases
5. Always return query_id in responses for end-to-end debugging
6. Document processing must be async with status tracking and webhooks
7. Rate limit RAG endpoints aggressively — LLM costs accumulate fast
