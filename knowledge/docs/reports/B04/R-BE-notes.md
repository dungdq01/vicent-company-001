# Backend Engineering Notes: B04 NLP
## By R-BE — Date: 2026-03-31

---

### 1. LLM Inference API Design

The core choice is **streaming vs non-streaming**. Non-streaming returns the complete response as one JSON payload — simple to implement, acceptable for short completions, but terrible UX for long outputs where the user waits 10-30 seconds with no feedback.

**Streaming via Server-Sent Events (SSE):** The OpenAI-compatible pattern is the de facto standard. Each token is pushed as a `data:` event:
```
data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"}}]}
data: [DONE]
```
In FastAPI, use `StreamingResponse` with an async generator that yields SSE-formatted chunks. Set `Content-Type: text/event-stream` and disable buffering on the reverse proxy (Nginx: `X-Accel-Buffering: no`).

**OpenAI-compatible API spec:** Implement `/v1/chat/completions`, `/v1/completions`, `/v1/embeddings`, and `/v1/models`. Strict adherence lets you swap backend models without changing client code and enables use of existing OpenAI SDKs (Python `openai`, JS `openai`) pointing at your endpoint.

---

### 2. LLM Serving Frameworks Comparison

| Framework | Best For | Throughput (tok/s) | Latency | GPU Req |
|---|---|---|---|---|
| **vLLM** | High-throughput multi-user serving | 3,000–8,000+ (A100) | Low with PagedAttention | NVIDIA GPU required |
| **Ollama** | Local dev, single-user, quick setup | 50–200 (RTX 4090) | Moderate | GPU optional (CPU fallback) |
| **TGI (HuggingFace)** | HF model ecosystem, production API | 1,000–4,000 (A100) | Low | NVIDIA GPU required |
| **LiteLLM Gateway** | Multi-model routing, cost management | Proxy overhead only | +5–20ms | None (proxy layer) |
| **Triton + TensorRT-LLM** | Maximum GPU utilization, enterprise | 5,000–12,000+ (H100) | Lowest | NVIDIA GPU, complex setup |

**Recommendation for MAESTRO:** Use vLLM for primary serving (best throughput/complexity tradeoff), LiteLLM as the gateway layer for routing across multiple models, and Ollama for developer local environments. Avoid Triton+TensorRT-LLM unless you have dedicated MLOps capacity — the setup and maintenance cost is significant.

---

### 3. Embedding API Design

**Batch embedding endpoint:** Accept an array of strings in one request. Do not design single-string endpoints for production — the batching overhead amortizes GPU kernel launch costs.

```
POST /v1/embeddings
{"input": ["text one", "text two", ...], "model": "bge-m3"}
```

Response follows OpenAI embeddings format with `data[].embedding` arrays.

**Async processing for large batches:** For bulk embedding jobs (>10,000 texts), use an async task queue. POST the job, receive a `job_id`, poll `GET /v1/embeddings/jobs/{job_id}`. Implement with Celery + Redis or ARQ (async Redis queue). Store results in object storage (S3/MinIO) and return a presigned download URL when complete.

**Caching strategy:** Two-level cache:
1. Exact-match cache: Redis with key = `sha256(model_name + normalized_text)`. TTL 7 days. Eliminates redundant embedding for repeated queries.
2. Semantic dedup: Before embedding, check if a near-identical string already has a cached embedding using MinHash. Return the cached embedding if Jaccard similarity > 0.95 — saves GPU cycles.

---

### 4. RAG System Backend Architecture

**Query flow:** `user query → query embedding → vector search (Qdrant/pgvector) → context assembly → prompt augmentation → LLM generate → response`

**API design for RAG endpoint:**
```
POST /v1/rag/query
{
  "query": "...",
  "collection": "industry_knowledge_base",
  "top_k": 5,
  "rerank": true,
  "llm_model": "llama-3.1-70b"
}
```

**Reranking:** After vector retrieval, apply a cross-encoder reranker (`BAAI/bge-reranker-v2-m3` for multilingual) to re-score the top-k candidates. Return top-3 after reranking. This significantly improves answer quality at modest latency cost (+50-150ms).

**Error handling:** Define failure modes explicitly:
- No relevant chunks found: return low-confidence flag, do not hallucinate context.
- LLM timeout: return 504 with partial context; log for retry.
- Vector DB unavailable: return 503, do not fall through to hallucinated answers.

Always include `source_documents` in the response payload so the frontend can display citations.

---

### 5. Prompt Management System

**Prompt versioning:** Store prompts in a database table with `prompt_id`, `version`, `template`, `variables`, `created_at`, `model_target`. Never hardcode prompts in application code. Use semantic versioning (v1.0, v1.1, v2.0) — major bumps for structural changes, minor for wording tweaks.

**A/B testing prompts:** Assign users/requests to variant buckets (e.g., 80% control, 20% variant) using deterministic hashing on `user_id`. Log both the prompt version and output quality metrics. Use a statistical significance threshold before promoting a variant to production.

**Prompt registry:** A simple FastAPI microservice with endpoints:
- `GET /prompts/{prompt_id}?version=latest` — fetch active prompt
- `POST /prompts` — register new prompt version
- `GET /prompts/{prompt_id}/history` — audit trail

**Template injection:** Use Jinja2 for variable substitution. Sanitize all user-provided variables before injection to prevent prompt injection attacks (see Section 7).

---

### 6. LLM Gateway Pattern

**Rate limiting per user/org:** Implement token-bucket rate limiting at the gateway. Limits: requests per minute and tokens per day per `org_id`. Store counters in Redis with TTL. Return `429 Too Many Requests` with `Retry-After` header when limit exceeded.

**Model routing by cost and latency:** Define a routing policy:
- Simple factual queries → small model (Llama 3.1 8B, low cost)
- Complex reasoning → large model (Llama 3.1 70B or API model)
- Code generation → code-specialized model (DeepSeek Coder)
- Classify query complexity with a fast lightweight classifier before routing.

**Fallback chain:** `primary model → secondary model → API fallback (OpenAI/Anthropic) → error`. Implement with exponential backoff. Log every fallback event for capacity planning.

**Usage tracking:** Emit a usage event per request: `{timestamp, org_id, user_id, model, prompt_tokens, completion_tokens, latency_ms, cost_usd}`. Stream to a time-series store (ClickHouse or InfluxDB) for real-time dashboards.

---

### 7. Security for LLM APIs

**Prompt injection defense:** Validate and sanitize user input before it reaches the prompt template. Use a prompt injection classifier (fine-tuned on adversarial examples) to score incoming requests. Reject or flag requests with scores above threshold. Separate system prompt from user content — never concatenate them with simple string joins.

**Output sanitization:** Run LLM outputs through a content moderation layer before returning to the client. Use a moderation classifier (OpenAI moderation API pattern, or a local `unitary/toxic-bert` adapted model). Strip any accidentally leaked system prompt fragments using pattern matching.

**PII redaction:** Apply PII detection on both input and output. Use `presidio-analyzer` and `presidio-anonymizer`. For Vietnamese context, extend with custom recognizers for CCCD (national ID), Vietnamese phone patterns (`(03|05|07|08|09)[0-9]{8}`), and VN bank account formats.

**Content moderation layer:** Build a sequential pipeline: input moderation → prompt injection check → LLM call → output moderation → PII scrub → response. Each stage can independently block the request. Log all blocked requests with reason codes for audit.

---

### 8. Production ASCII Architecture Diagram

```
  Clients (Web / Mobile / API Consumers)
         |
         v
  [ API Gateway / Load Balancer ]  (Nginx / AWS ALB)
         |
         v
  [ LiteLLM Gateway ]  — rate limiting, auth, model routing, usage tracking
         |
    _____|_______________________
    |                           |
    v                           v
[ vLLM Cluster ]          [ Embedding Service ]
  (GPU nodes)              (sentence-transformers / bge-m3)
  Llama 3.1 70B                 |
  DeepSeek Coder                v
    |                   [ Vector DB ]
    |                   (Qdrant cluster / pgvector)
    |                           |
    |___________________________|
         |
         v
  [ Prompt Registry ]   [ Redis Cache ]   [ Object Storage ]
  (prompt versioning)   (rate limits,     (model weights,
                         embeddings)       fine-tune data)
         |
         v
  [ Monitoring Stack ]
  Prometheus + Grafana — latency, token usage, cost, error rate
  Langfuse / Phoenix — LLM traces, prompt versions, eval scores
```

This architecture separates concerns cleanly: the gateway handles policy, vLLM handles compute, the vector DB handles retrieval, and monitoring covers observability. Each layer scales independently.
