# Backend Engineer Notes: Generative AI (B09)
## By ServiceForge (R-BE) — Date: 2026-03-31

### LLM Serving APIs

Serving generative models requires specialized API patterns:

- **Streaming responses**: Server-Sent Events (SSE) is the standard for token-by-token streaming. Client sends POST, receives `text/event-stream` response. Each event contains a token delta. Critical for UX — users see output immediately rather than waiting 10-30s for complete response.
- **Request batching**: Group multiple requests and process together to maximize GPU utilization. Continuous batching (used by vLLM, TGI) dynamically adds/removes requests from a running batch. Increases throughput 3-5x over naive sequential serving.
- **API design**: Follow OpenAI's Chat Completions API format as de facto standard — broad tooling compatibility. Key endpoints: `/v1/chat/completions` (streaming + non-streaming), `/v1/models` (list available models), `/v1/embeddings`.
- **Timeouts**: Generation can take 5-60 seconds for long outputs. Set gateway timeouts appropriately (120s minimum). Implement client-side heartbeat detection for streaming connections.
- **Concurrency**: Limit concurrent generations per model instance. A single A100 running a 7B model handles ~20-50 concurrent requests with continuous batching. Track queue depth and reject with 429 when overloaded.

### Image Generation Queue Management

Image generation is batch-friendly and latency-tolerant compared to text:

- **Async queue architecture**: HTTP POST -> enqueue job -> return job ID -> client polls or receives webhook. Use Redis/BullMQ or RabbitMQ for job queuing.
- **Priority queues**: Premium users get higher priority. Implement at least 3 tiers: real-time (interactive), standard, batch.
- **Job parameters**: Store prompt, negative prompt, seed, dimensions, model version, steps, CFG scale, scheduler. Reproduce any generation exactly.
- **Batch processing**: Group same-model, same-resolution requests. Process 4-8 images per batch on a single GPU for optimal throughput.
- **Progress reporting**: Report denoising step progress via WebSocket or polling endpoint. Users see 0% -> 25% -> 50% -> 100% instead of a spinner.
- **Timeout and retry**: Set 120s hard timeout per image. Retry failed generations once with same seed. If still failing, return error with diagnostic info.

### Content Moderation Pipeline

Every generative system needs content moderation:

- **Pre-generation filtering**: Check input prompts against blocklist and classifier before spending compute. Fast rejection saves GPU cycles. Use a small BERT-based classifier (~5ms latency) for prompt toxicity.
- **Post-generation filtering**: Run generated text through toxicity classifier (Perspective API, or self-hosted). For images, use NSFW classifier (CLIP-based, LAION safety checker). Block and log flagged content.
- **Pipeline architecture**: Input -> pre-filter -> generation -> post-filter -> delivery. Each stage has pass/flag/block outcomes. Flagged content goes to human review queue.
- **Vietnamese moderation**: Off-the-shelf English moderation tools have poor Vietnamese coverage. Fine-tune a Vietnamese text classifier on local data. For Vietnamese cultural sensitivities (political content, historical events), maintain a curated keyword and phrase list.
- **Logging**: Log all moderation decisions with full context for audit. Retention policy: 90 days minimum, longer if required by Vietnamese regulations.

### Rate Limiting and Cost Tracking

GenAI inference is expensive — cost control is a backend concern:

- **Rate limiting strategies**: Per-user token budget (daily/monthly), per-minute request limit, concurrent request limit. Use sliding window counters in Redis.
- **Token counting**: Count input + output tokens per request. Use tiktoken or model-specific tokenizer for accurate counts. Bill based on tokens, not requests.
- **Cost tracking schema**: Record per-request: user_id, model, input_tokens, output_tokens, latency_ms, cost_usd, timestamp. Aggregate hourly for dashboards.
- **Cost per generation**: LLM text (7B self-hosted): ~$0.001-0.005 per 1K tokens. LLM text (GPT-4 API): ~$0.01-0.03 per 1K tokens. Image generation (SDXL): ~$0.01-0.02 per image. Budget alerts when user approaches limits.
- **Quota management**: Implement soft limits (warning) and hard limits (block). Allow quota increases via admin API. Enterprise customers get custom quotas.

### Multi-Model Routing

Route requests to the most cost-effective model:

- **Router architecture**: Lightweight classifier or rule-based router sits in front of model pool. Evaluates request complexity and routes accordingly.
- **Routing strategies**:
  - Simple keyword/intent classification -> cheap model (7B) for FAQ, greetings, simple tasks.
  - Complex reasoning, coding, long-form -> expensive model (70B or API).
  - Cascading: try cheap model first, escalate to expensive if confidence is low.
- **Implementation**: Define model tiers with cost/capability profiles. Router assigns tier based on: input length, detected task type, user tier, current load.
- **Fallback chain**: Primary model -> secondary model -> external API -> graceful error. Each step has timeout and quality check.
- **A/B routing**: Split traffic between models to compare quality and cost. Use feature flags for gradual model rollouts.
- **Practical savings**: Routing 60-70% of requests to a 7B model instead of 70B can reduce compute costs by 80% with acceptable quality for simple tasks.

### Webhook for Async Generation

Long-running generations need async notification:

- **Webhook registration**: User registers callback URL per-application or per-request. Store webhook URLs securely with HMAC signing keys.
- **Payload**: `{ job_id, status, result_url, model, tokens_used, created_at, completed_at }`. Sign payload with HMAC-SHA256. Include signature in header for verification.
- **Delivery**: Retry with exponential backoff (1s, 5s, 30s, 5m, 30m). Max 5 retries. Log all delivery attempts. Dead-letter queue for persistent failures.
- **Alternatives to webhooks**: WebSocket connections for real-time apps, polling endpoint as universal fallback. Support all three.

### File Storage for Generated Assets

Generated images, audio, and documents need persistent storage:

- **Storage backend**: S3 (AWS) or MinIO (self-hosted S3-compatible). MinIO recommended for Vietnam-hosted deployments for data residency compliance.
- **Object naming**: `/{tenant_id}/{asset_type}/{date}/{job_id}.{ext}`. Content-addressed naming (hash-based) for deduplication.
- **Access control**: Pre-signed URLs with expiration (1-24 hours). Never expose bucket directly. CDN (CloudFront/Cloudflare) in front for delivery.
- **Lifecycle policies**: Move to infrequent access after 30 days, archive after 90 days, delete after 1 year (or per user request). Comply with GDPR/Vietnamese data regulations for deletion.
- **Metadata**: Store generation parameters alongside assets. Enable "regenerate" and "similar" features by retrieving original parameters.
- **Thumbnails**: Generate thumbnails (256x256) immediately for gallery views. Store alongside original. Use Lambda/Cloud Function for on-demand resizing.

### Recommendations for B09

1. Adopt the OpenAI-compatible API format — it is the industry standard and ensures tooling compatibility.
2. Implement continuous batching from day one (use vLLM or TGI as serving backend) — it is the single biggest throughput multiplier.
3. Build the content moderation pipeline as a separate microservice — it will be reused across all generative features.
4. Implement token-level cost tracking per request from the start. Retrofitting cost attribution is painful.
5. Deploy a multi-model router early — even simple rule-based routing saves 50%+ on compute costs.
6. Use MinIO for self-hosted deployments in Vietnam to satisfy data residency requirements.
7. Support both streaming (SSE) and async (webhook/polling) patterns — different use cases need different approaches.
