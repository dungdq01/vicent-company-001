# Solution Architect Notes: Generative AI (B09)
## By BlueprintAI (R-SA) — Date: 2026-03-31

### Reference Architectures for GenAI Platforms

#### Text Generation Platform
```
Client -> API Gateway (rate limit, auth) -> Router (model selection)
  -> vLLM cluster (self-hosted models) OR External API (OpenAI/Anthropic)
  -> Post-processing (safety filter, formatting)
  -> Response (streaming SSE)

Supporting services:
  - Prompt management service (templates, versioning)
  - Conversation store (PostgreSQL + Redis cache)
  - Usage tracking (tokens, cost, per-user quotas)
  - Evaluation pipeline (async quality monitoring)
```

#### Image Generation Platform
```
Client -> API Gateway -> Job Queue (Redis/BullMQ)
  -> Worker Pool (GPU nodes running ComfyUI/diffusers)
  -> Post-processing (safety filter, watermark, resize)
  -> Object Storage (MinIO/S3)
  -> CDN -> Client (webhook or polling)

Supporting services:
  - Prompt/parameter store
  - Gallery service (metadata DB + search)
  - Moderation queue (flagged content review)
```

#### Multimodal Platform
```
Client -> API Gateway -> Orchestrator
  -> Text understanding (LLM)
  -> Image generation (Diffusion pipeline)
  -> Image understanding (VLM)
  -> Audio generation (TTS)
  -> Composition service (combine modalities)
  -> Delivery
```

Key architectural principle: each modality is a separate microservice with its own GPU allocation, scaling policy, and model versioning.

### Build vs Buy Decision Matrix

| Factor | API (OpenAI/Anthropic) | Self-Hosted Open Model | Hybrid |
|--------|----------------------|----------------------|--------|
| Time to market | Days | Weeks-months | 1-2 weeks |
| Cost at low volume (<1M tokens/day) | Low ($50-500/mo) | High (GPU idle) | Medium |
| Cost at high volume (>100M tokens/day) | Very high ($10K+/mo) | Low-medium | Optimal |
| Quality (general tasks) | Best | Good (70B+) | Best |
| Quality (domain-specific) | Good | Best (fine-tuned) | Best |
| Data privacy | Data leaves your infra | Full control | Sensitive on self-hosted |
| Customization | Limited | Full | Per use case |
| Latency | 100-500ms TTFT | 50-200ms TTFT | Route-dependent |
| Vendor lock-in | High | None | Low |
| Vietnam data residency | Fails compliance | Full compliance | Selective compliance |

**Recommendation**: Start with API for prototyping and low-volume features. Self-host for high-volume, privacy-sensitive, or domain-specific needs. Hybrid is the production-optimal architecture for most enterprises.

### Model Selection Framework

Decision tree for model selection:

1. **Task complexity**: Simple (classification, extraction, short QA) -> 7B model. Medium (summarization, translation, code) -> 7-13B or cheap API. Complex (reasoning, creative writing, multi-step) -> 70B+ or frontier API.

2. **Latency requirement**: Real-time (< 1s TTFT) -> smaller quantized model on dedicated GPU. Interactive (< 3s TTFT) -> larger model or API. Batch (minutes OK) -> largest available model, optimize for throughput.

3. **Privacy requirement**: Public data -> API acceptable. Internal data -> self-hosted or private API endpoint. PII/regulated data -> self-hosted only, Vietnam-resident infrastructure.

4. **Language requirement**: English-only -> widest model selection. Vietnamese-primary -> Qwen 2.5, GPT-4, Claude preferred. Evaluate Vietnamese quality specifically.

5. **Budget**: < $500/mo -> API only. $500-5K/mo -> single GPU self-hosted + API fallback. > $5K/mo -> multi-GPU self-hosted cluster.

### Enterprise Integration Patterns

Integrating GenAI into existing enterprise systems:

- **RAG (Retrieval-Augmented Generation)**: Connect LLM to enterprise knowledge bases. Architecture: user query -> embedding -> vector search (Qdrant, Weaviate) -> retrieve top-K documents -> inject into LLM context -> generate grounded response. Most common enterprise GenAI pattern.
- **Agentic workflows**: LLM orchestrates multi-step processes. Tools: database queries, API calls, document generation, approval workflows. Frameworks: LangGraph, CrewAI, or custom orchestrator. Keep tools simple and well-validated.
- **Document processing pipeline**: Intake (upload) -> OCR/extraction -> LLM structuring -> validation -> storage. For Vietnamese documents: VietOCR for text extraction, LLM for field extraction and classification.
- **Chatbot integration**: Embed AI chat in existing portals (Zalo OA, Facebook Messenger, internal tools). Use a conversation management layer that handles context, routing, and escalation to human agents.
- **API gateway pattern**: Centralized GenAI gateway that abstracts model selection, handles auth, rate limiting, cost tracking, and audit logging. All internal teams consume GenAI through this gateway rather than directly calling model APIs.

### Multi-Tenant GenAI Platform Design

Serving multiple tenants (departments, customers) from shared infrastructure:

- **Tenant isolation levels**:
  - Shared model, separate quotas (simplest, lowest cost)
  - Shared model, separate fine-tuned adapters (LoRA per tenant)
  - Dedicated model instances per tenant (highest isolation, highest cost)
- **Quota management**: Per-tenant token budgets, rate limits, model access permissions. Enforce at the API gateway level.
- **Data isolation**: Tenant data (prompts, outputs, conversation history) must be strictly isolated. Use tenant_id in all database queries. Encrypt data at rest with tenant-specific keys for regulated industries.
- **Custom system prompts**: Each tenant configures their own system prompts, safety policies, and output formats. Store in a tenant configuration service.
- **Cost allocation**: Track and report costs per tenant. Support chargeback models (per-token, per-request, flat fee).
- **Model marketplace**: Allow tenants to select from a catalog of available models (different sizes, fine-tunes, modalities). Platform team manages the model catalog and infrastructure.

### Data Residency Considerations for Vietnam

Vietnamese regulations and practical considerations for GenAI deployment:

- **Decree 13/2023 (PDPA)**: Personal data of Vietnamese citizens must be stored domestically for certain categories. Cross-border transfer requires impact assessment and registration. Applies to training data containing PII and to conversation logs.
- **Infrastructure options in Vietnam**:
  - Viettel IDC, FPT Cloud, CMC Cloud: Vietnamese data centers. Limited GPU availability. Suitable for data storage and non-GPU workloads.
  - Self-hosted GPU servers: Deploy in Vietnamese colocation facilities. Import NVIDIA GPUs (subject to availability and customs).
  - Hybrid: Data storage in Vietnam, GPU inference in Singapore with encrypted transit.
- **Recommended architecture**: API gateway and data storage in Vietnam. GPU inference cluster in Singapore (lowest latency to Vietnam with GPU availability). Encrypted connections between locations. No PII transmitted to inference — anonymize before sending.
- **Compliance checklist**: Data impact assessment, cross-border transfer registration, consent management for personal data, content labeling for AI-generated output, audit logging with Vietnamese retention requirements.
- **Practical timeline**: Setting up Vietnam-resident infrastructure adds 2-4 weeks to deployment. GPU procurement for on-prem adds 2-3 months lead time.

### Technology Stack Recommendation

For a production GenAI platform targeting Vietnamese market:

- **Inference**: vLLM (text), ComfyUI (images), deployed on K8s with NVIDIA GPU Operator
- **Models**: Qwen 2.5 72B (self-hosted, Vietnamese quality), GPT-4/Claude (API fallback for complex tasks), SDXL/Flux (image generation)
- **Orchestration**: LangGraph or custom Python orchestrator
- **Vector DB**: Qdrant (self-hosted, performant, simple to operate)
- **Backend**: FastAPI (Python) for ML services, Go or Node.js for API gateway
- **Frontend**: Next.js with TipTap editor, React-based generation playground
- **Infrastructure**: Kubernetes on AWS Singapore, data storage on Vietnamese cloud, Terraform for IaC
- **Monitoring**: Prometheus + Grafana, custom GenAI dashboards, LangSmith or Langfuse for LLM observability

### Recommendations for B09

1. Adopt a hybrid architecture (self-hosted + API) from the start — pure self-hosted is too slow to market, pure API is too expensive at scale.
2. Build a centralized GenAI API gateway as the first infrastructure component — all consumers go through it.
3. Design for multi-tenancy from day one, even if starting with a single tenant. Retrofitting tenant isolation is extremely costly.
4. Use RAG as the primary enterprise integration pattern — it delivers value quickly without fine-tuning.
5. Plan Vietnam data residency architecture early — separate data plane (Vietnam) from compute plane (Singapore).
6. Select Qwen 2.5 72B as the primary self-hosted model for Vietnamese language quality at reasonable cost.
7. Budget 6-8 weeks for production-ready GenAI platform infrastructure, 2-3 weeks for MVP with API-only approach.
