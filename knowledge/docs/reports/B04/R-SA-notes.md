# Solution Architecture Notes: B04 NLP
## By R-SA — Date: 2026-03-31

---

### 1. NLP System Architecture Patterns

Four foundational patterns cover the majority of enterprise NLP use cases in the Vietnamese market:

**Classification Pipeline:** Input text → preprocessing → embedding → classifier → label. Synchronous, low-latency (< 100ms achievable). Best for intent detection, sentiment analysis, defect category tagging. Stateless and horizontally scalable. Use when the output space is bounded and well-defined.

**RAG System (Retrieval-Augmented Generation):** Query → retrieval from vector store → context assembly → LLM generation → structured response. Latency: 1–5 seconds typical. Best for document QA, SOPs, knowledge base search. Keeps LLM grounded in enterprise data without fine-tuning. Most appropriate pattern for Vietnamese enterprise deployments in 2025–2026.

**Conversational Chatbot:** Multi-turn session → intent/entity extraction → state machine or LLM reasoning → response → session update. Requires session management and context windowing. Best for customer service, HR FAQ, student tutoring.

**Batch Processing Pipeline:** Scheduled or event-triggered → document ingestion → bulk NLP processing → structured output to data store. Non-real-time. Best for nightly report summarization, contract analysis, monthly quality report digest. Decoupled from user-facing latency requirements.

---

### 2. LLM Integration Patterns

Decision framework for how to integrate an LLM into the system:

| Pattern | Latency | Cost | Customization | Offline Capable |
|---|---|---|---|---|
| Prompt-only API (GPT-4o, Claude) | Medium | Per-token | Low | No |
| RAG over API | Medium-High | Per-token + retrieval | Medium | No |
| Fine-tuned cloud model | Medium | Higher base | High | No |
| Local 7B (LLaMA, Qwen) | Low | Fixed infra | Medium | Yes |
| Local 70B (quantized) | Medium | High infra | High | Yes |
| Agent with Tools | High | Per-token + tool calls | Very High | Partial |

**Decision rule:** Start with prompt-only API. Move to RAG when domain knowledge is needed. Consider local deployment only when data privacy requirements or token volume economics force the decision.

---

### 3. Build vs Buy vs Fine-tune vs RAG Analysis

| Use Case | Recommendation | Rationale | Vietnam Context |
|---|---|---|---|
| General Vietnamese chatbot | RAG + GPT-4o API | Strong Vietnamese support, fast to deploy | GPT-4o handles Vietnamese well; no fine-tuning needed for general cases |
| Intent classification (Vietnamese) | Fine-tuned PhoBERT | High accuracy, low latency, low inference cost | PhoBERT trained on Vietnamese corpus; outperforms API for short text classification |
| Document QA (internal docs) | RAG + local LLM | Data privacy + cost at scale | Vietnamese companies are privacy-conscious; on-prem RAG prevents data leakage |
| SOP compliance checking | RAG over structured docs | SOPs are structured; retrieval is precise | Factory SOPs in Vietnam are often bilingual (Vietnamese + Chinese/English) |
| Customer sentiment analysis | Fine-tuned PhoBERT or UIT-VSFC model | Labeled Vietnamese sentiment datasets exist | UIT-VSFC is a mature benchmark; fine-tuning gives better results than zero-shot API |
| Contract / legal NLP | GPT-4o API + human review | Complexity requires frontier model reasoning | Vietnamese legal language is highly formal; frontier models handle it better than local 7B |
| Real-time defect classification (factory) | Lightweight BERT / DistilPhoBERT | Sub-100ms required; MES integration | Must run on-premise near the factory floor; small model fits in edge hardware |

---

### 4. Reference Architecture: Vietnamese Customer Service Bot

```
User (Web / Zalo / Facebook Messenger)
        |
        v
   [API Gateway]  ←── rate limiting, auth, tenant routing
        |
        v
   [NLP Gateway Service]
    ├── Language detection (Vietnamese / English / code-switch)
    ├── Input sanitization & PII masking
    └── Session context loader
        |
        v
   [Intent Classifier]  ←── fine-tuned PhoBERT
    ├── High-confidence intent → direct response template
    └── Low-confidence / open query → RAG path
        |
        v
   [RAG Retrieval Layer]
    ├── Dense retrieval: Vietnamese embedding model → Qdrant vector store
    ├── Sparse retrieval: BM25 over product/policy documents
    └── Re-ranker: cross-encoder for top-K context selection
        |
        v
   [LLM Generation]  ←── GPT-4o or local Qwen2.5-7B (privacy tier)
    ├── System prompt: role, tone, language instructions (Vietnamese)
    ├── Retrieved context injection
    └── Response structured output (JSON with answer + citations)
        |
        v
   [Response Validator]
    ├── Hallucination check (claim vs context grounding)
    ├── PII output scan
    └── Tone/language QA (diacritic integrity check)
        |
        v
   User Response  +  Feedback capture → monitoring pipeline
```

Key design decisions: Zalo is the dominant messaging platform in Vietnam (70M+ users); the bot must support Zalo OA API natively. Session state stored in Redis. Each tenant (client company) gets isolated vector store namespace.

---

### 5. Reference Architecture: Document Intelligence + NLP

Connects to B02 (Document Intelligence baseline):

```
[Document Ingestion]
 ├── PDF / scanned image → OCR (VietOCR or Tesseract with Vietnamese model)
 ├── Word / Excel → direct text extraction
 └── Handwritten forms → VietOCR + confidence scoring

        |
        v
[NLP Extraction Layer]
 ├── Named Entity Recognition: fine-tuned PhoBERT-NER
 │    (person names, org names, dates, amounts in Vietnamese format)
 ├── Relation extraction: LLM-based for complex documents
 ├── Table extraction: structure-aware parsing
 └── Clause / section classification for legal/contract docs

        |
        v
[Knowledge Base Population]
 ├── Structured data → PostgreSQL / data warehouse
 ├── Unstructured embeddings → Qdrant vector store
 └── Entity graph → Neo4j (MAESTRO Knowledge Graph integration)

        |
        v
[Search & QA Interface]
 ├── Semantic search over document corpus
 ├── RAG QA: "What are the payment terms in contract X?"
 └── Analytics: entity frequency, trend detection across doc corpus
```

---

### 6. Scalability & Multi-tenancy

For a SaaS NLP platform serving multiple Vietnamese enterprise clients:

**Shared LLM Infrastructure:** Use a single inference cluster (self-hosted Qwen or LLaMA) shared across tenants. Route API calls to OpenAI/Anthropic for overflow and privacy-tier clients on their own API keys.

**Tenant Isolation:** Each tenant has a dedicated namespace in the vector store (Qdrant collection-per-tenant). System prompts are tenant-scoped and stored in a prompt registry. Logging is partitioned by tenant ID with RBAC.

**Rate Limiting Design:** Token-bucket rate limiting per tenant per minute. Configurable burst allowance for peak periods (e.g., exam season for education clients, Tết for retail). Alert when a tenant approaches 80% of their monthly token quota.

**Horizontal Scaling:** NLP gateway and retrieval layers are stateless — scale with Kubernetes HPA triggered on request queue depth. LLM inference layer scales on GPU utilization. Vector store scales with Qdrant's distributed mode.

---

### 7. Total Cost of Ownership

Cost comparison at different monthly token volumes (input + output tokens combined):

| Volume | GPT-4o API | Self-hosted Qwen2.5-7B | Self-hosted Qwen2.5-72B |
|---|---|---|---|
| 10M tokens/month | ~$50 | $200 (1x A10G amortized) | Not economical |
| 100M tokens/month | ~$500 | $200 (same GPU) | $800 (2x A100) |
| 1B tokens/month | ~$5,000 | $400 (2x A10G) | $1,600 (4x A100) |
| 10B tokens/month | ~$50,000 | $1,200 (6x A10G) | $4,800 (12x A100) |

**Crossover point:** Self-hosted 7B becomes cheaper than GPT-4o API at approximately 50–80M tokens/month, assuming a 3-year hardware amortization. For Vietnamese SMEs with < 50M tokens/month, GPT-4o API is more cost-effective when factoring in engineering overhead. For large enterprises or platforms (education, banking), self-hosted is strongly preferred from both cost and data residency perspectives.

---

### 8. Data Privacy Architecture

Vietnamese enterprises — particularly in banking, healthcare, and government — have strict requirements around data residency and PII handling.

**On-Premise LLM for Sensitive Data:** Deploy quantized LLaMA 3.1-8B or Qwen2.5-7B on client infrastructure. No data leaves the corporate network. Acceptable accuracy tradeoff vs GPT-4o for structured extraction tasks.

**Data Residency:** Vietnam does not yet have a fully enacted data localization law equivalent to GDPR, but the Personal Data Protection Decree (Decree 13/2023/ND-CP, effective 2023) requires consent for data processing. For state-owned enterprise clients, recommend full on-premise deployment. For private sector, offer a hybrid: embeddings and retrieval on-prem, LLM generation via API with contractual data processing agreements.

**PII Handling Pipeline:**
1. Input scan: detect and pseudonymize PII (CCCD numbers, phone numbers, full names) before sending to any external API.
2. Named entity masking: replace with placeholders (e.g., [PERSON_1], [PHONE_1]).
3. De-identification is reversible for audit purposes using a secure mapping table stored on-premise.
4. Logging: store only pseudonymized versions in production logs.

**Audit Trail:** All LLM queries and responses logged with timestamp, tenant ID, model version, and token count. Retained for 90 days minimum to satisfy enterprise compliance requirements.
