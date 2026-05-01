# Solution Architect Notes: Conversational AI & Chatbots (B08)
## By Quang Bui (R-SA) — Date: 2026-03-31

### Reference Architecture: Simple Rule-based Chatbot

**When to Use**: FAQ bots, simple decision trees, <50 intents, predictable flows

**Components**
- Channel adapter (Zalo, Messenger, Web) → Message router
- NLU engine (PhoBERT intent classifier + regex entity extraction)
- Dialogue manager: finite state machine or decision tree
- Response templates: parameterized Vietnamese/English templates
- Knowledge base: structured FAQ in PostgreSQL

**Pros**: deterministic, fast (<200ms), cheap to run, easy to debug
**Cons**: brittle, no generalization, requires manual flow definition for every scenario
**Cost**: $200-500/month infrastructure; no GPU needed

### Reference Architecture: RAG-based Chatbot

**When to Use**: knowledge-heavy domains, need natural responses, 50-500 knowledge articles

**Components**
- Channel adapter → API gateway (rate limiting, auth)
- Query preprocessing: Vietnamese normalization, query rewriting
- Retrieval pipeline: embedding model (BGE-M3) → vector DB (pgvector/Qdrant) → reranker
- Generation: LLM (Qwen2.5-7B on vLLM) with retrieved context
- Conversation memory: Redis (short-term) + PostgreSQL (long-term)
- Monitoring: Phoenix/LangSmith for tracing

**Data Flow**
1. User message → normalize → embed → hybrid search (vector + BM25)
2. Top-50 results → reranker → top-5 chunks
3. System prompt + conversation history (last 5 turns) + retrieved context + user message → LLM
4. LLM response → safety filter → stream to user

**Pros**: handles open-ended questions, natural language, easy knowledge updates
**Cons**: hallucination risk, higher latency (2-5s), requires GPU infrastructure
**Cost**: $1000-3000/month (1 GPU instance + vector DB + supporting infra)

### Reference Architecture: Agentic Chatbot

**When to Use**: complex workflows, tool use (API calls, database queries), multi-step tasks

**Components**
- All components from RAG architecture, plus:
- Tool registry: order lookup API, payment status API, CRM integration, ticket creation
- Agent framework: LangGraph or custom ReAct loop
- Planning module: LLM decides which tools to call and in what order
- Guardrails: tool call validation, budget limits, action confirmation for destructive operations

**Agent Loop**
1. User: "Tôi muốn đổi trả sản phẩm áo size M sang size L"
2. Agent thinks: need to (a) verify order exists, (b) check return eligibility, (c) create exchange request
3. Tool call: `lookup_order(customer_id)` → returns order details
4. Tool call: `check_return_policy(order_id, product_id)` → eligible
5. Tool call: `create_exchange(order_id, new_size="L")` → exchange ID created
6. Agent responds with confirmation and next steps

**Pros**: handles complex multi-step workflows, reduces human agent workload significantly
**Cons**: harder to debug, higher latency (5-15s for multi-step), risk of incorrect tool calls
**Cost**: $3000-8000/month (more LLM calls per conversation, higher GPU needs)

### Technology Selection Matrix

| Component | Budget Option | Recommended | Premium |
|-----------|--------------|-------------|---------|
| LLM | Qwen2.5-7B (self-hosted) | Qwen2.5-14B or Vistral-7B | GPT-4 / Claude API |
| Embedding | multilingual-e5-base | BGE-M3 | Fine-tuned BGE-M3 |
| Vector DB | pgvector | Qdrant | Pinecone |
| NLU | PhoBERT-base | PhoBERT-large | LLM-based classification |
| Serving | TGI | vLLM | vLLM + custom optimization |
| Monitoring | Custom Prometheus | Phoenix (OSS) | LangSmith |
| Cache | Redis basic | Redis + semantic cache | Redis Cluster + CDN |
| Channels | Web widget only | Web + Zalo | Web + Zalo + Messenger + API |

### Integration Patterns

**CRM Integration**
- Pull customer profile when conversation starts (name, history, tier)
- Push conversation summary + outcome to CRM after resolution
- Patterns: REST API (most common), webhook (event-driven), message queue (async)
- Vietnamese CRMs: Getfly, Bizfly, or Salesforce/HubSpot for enterprise

**Ticketing System**
- Auto-create ticket when chatbot cannot resolve or customer requests escalation
- Ticket includes: conversation transcript, detected intent, extracted entities, customer sentiment
- Integration with Freshdesk, Zendesk, or Vietnamese platforms (Subiz, Stringee)

**Knowledge Base**
- Sync product catalog, FAQ, policies from CMS to vector database
- Incremental update: detect changes, re-embed only modified documents
- Schedule: real-time for critical updates (pricing), daily batch for general content

### Scalability for Enterprise

**Multi-bot Architecture**
- Shared platform: common infrastructure (LLM serving, vector DB, channel adapters)
- Per-bot configuration: system prompt, knowledge base, tool permissions, branding
- Bot registry: CRUD for bots with versioned configurations
- Shared model pool: multiple bots share the same LLM instances (cost efficiency)

**Multi-channel**
- Unified conversation model: same data structure regardless of channel
- Channel-specific adapters: translate between channel format and internal format
- Channel-aware responses: Zalo supports different rich message types than Messenger
- Single conversation thread across channels (if user switches from web to Zalo)

### Migration Path: Rule-based to LLM-powered

**Phase 1: Augment (Month 1-2)**
- Keep existing rule-based bot running
- Add LLM as fallback for unrecognized intents (currently going to "I don't understand")
- Measure: what percentage of fallback queries does LLM handle successfully?

**Phase 2: Hybrid (Month 3-4)**
- Route complex/open-ended queries to LLM; keep simple FAQ on rule-based
- Add RAG for knowledge base queries
- Compare resolution rates: rule-based vs LLM for overlapping intents

**Phase 3: LLM-primary (Month 5-6)**
- LLM handles all queries; rule-based becomes fallback for LLM failures
- Implement full monitoring, safety filters, and evaluation pipelines
- Gradually decommission rule-based flows as confidence grows

**Phase 4: Agentic (Month 7+)**
- Add tool calling for transactional operations
- Implement agent workflows for multi-step tasks
- This phase is optional — only if business needs justify the complexity

### Recommendations for B08

1. Start with RAG architecture for v1 — it covers 80% of use cases at reasonable cost and complexity
2. Plan for multi-channel from day one (Zalo + Web minimum) — adding channels later requires architectural changes
3. Use the technology selection matrix to match client budget — not every client needs premium components
4. Migration from rule-based: run both systems in parallel for 2 months before cutting over
5. Enterprise multi-bot: build the shared platform layer first, then onboard bots incrementally
6. Budget realistically: a production RAG chatbot costs $2K-5K/month in infrastructure; agentic costs $5K-10K/month
