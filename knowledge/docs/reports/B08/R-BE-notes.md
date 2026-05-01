# Backend Engineer Notes: Conversational AI & Chatbots (B08)
## By Thanh Vo (R-BE) — Date: 2026-03-31

### Conversation Management API

Core API design for a chatbot backend:

```
POST /api/v1/conversations              — Create new conversation
POST /api/v1/conversations/:id/messages — Send message (returns bot response)
GET  /api/v1/conversations/:id          — Get conversation with history
GET  /api/v1/conversations/:id/messages — Paginated message history
DELETE /api/v1/conversations/:id        — Soft-delete conversation
POST /api/v1/conversations/:id/feedback — Submit user feedback on a response
```

- Use UUIDs for conversation and message IDs — never expose sequential IDs
- Every message response should include: `message_id`, `content`, `role`, `timestamp`, `metadata` (intent, confidence, sources)
- Support idempotency keys on message creation to handle network retries
- Rate limit per user session: 30 messages/minute (prevent abuse, manage LLM costs)

### Session & Context Storage

**Redis (hot context)**
- Store active conversation state: last 10 messages, extracted entities, current intent
- Key pattern: `conv:{conversation_id}:state` with TTL of 30 minutes (session timeout)
- Use Redis Streams for message queue between API server and LLM workers
- Memory per conversation: ~5-10KB; 100K concurrent sessions ≈ 1GB Redis

**PostgreSQL (persistent storage)**
- Tables: `conversations`, `messages`, `feedback`, `conversation_metadata`
- Partition `messages` table by `created_at` (monthly) — conversation history grows fast
- Index: `(conversation_id, created_at)` for efficient history retrieval
- JSONB column for metadata: intent, entities, model version, latency_ms, token_count
- Full-text search on message content using `tsvector` with Vietnamese dictionary

### Webhook Integrations

**Zalo OA (Official Account)**
- Webhook receives events: `user_send_text`, `user_send_image`, `user_send_location`
- Reply via Zalo API: `POST https://openapi.zalo.me/v3.0/oa/message/cs`
- Rate limit: 500 messages/hour per OA (can increase with Zalo partnership)
- Must handle Zalo's token refresh (access token expires every 3600 seconds)
- Message types: text, image, file, list template, request_user_info

**Facebook Messenger**
- Webhook verification via GET with `hub.verify_token`
- Incoming messages: POST to your webhook with `messaging` events
- Reply via Send API: `POST https://graph.facebook.com/v18.0/me/messages`
- Support: text, quick replies, buttons, generic templates, persistent menu
- Rate limit: 200 calls/hour per page (standard), higher with approved use case

**Website Widget**
- WebSocket connection for real-time bidirectional communication
- Fallback to long-polling for environments where WebSocket is blocked
- CORS configuration: whitelist specific customer domains
- Embed via `<script>` tag with configuration object (theme, position, default messages)

### Rate Limiting & Queuing for LLM Calls

LLM inference is expensive and slow — queuing is essential:
- Use a message queue (Redis Streams, RabbitMQ, or SQS) between API and LLM workers
- Priority queuing: VIP customers or high-urgency intents get priority
- Rate limit LLM calls: max N concurrent requests per model endpoint (match GPU capacity)
- Circuit breaker: if LLM endpoint error rate >50%, fall back to cached/template responses
- Token budget per conversation: track cumulative tokens; switch to smaller model or summarize context if budget exceeded
- Timeout: 30 seconds max for LLM response; return "still thinking" message if exceeded

### Streaming Response (SSE / WebSocket)

Users expect real-time token-by-token display:

**Server-Sent Events (SSE)**
- `POST /api/v1/conversations/:id/messages` returns `Content-Type: text/event-stream`
- Each chunk: `data: {"token": "Xin", "message_id": "...", "done": false}\n\n`
- Final chunk: `data: {"token": "", "message_id": "...", "done": true, "metadata": {...}}\n\n`
- Simpler than WebSocket; works through most proxies and CDNs
- Limitation: unidirectional (server → client); need separate POST for user messages

**WebSocket**
- Bidirectional: user messages and bot responses on same connection
- Better for chat UX but more complex: handle reconnection, heartbeat, authentication
- Use Socket.IO for automatic fallback and room management
- Authentication: pass JWT in connection handshake; validate on server

**Implementation Notes**
- Backend streams from LLM (vLLM/TGI supports streaming) → forwards to client
- Buffer tokens on backend: send every 3-5 tokens to reduce network overhead
- Log the complete response after streaming finishes; do not log partial tokens

### Multi-tenant Architecture

For SaaS chatbot platforms serving multiple businesses:
- Tenant isolation: separate API keys, separate conversation stores, separate knowledge bases
- Database: schema-per-tenant (PostgreSQL schemas) for strong isolation; shared tables with `tenant_id` for simpler scaling
- LLM: shared model serving with tenant-specific system prompts and RAG sources
- Configuration per tenant: system prompt, allowed intents, response style, escalation rules, branding
- Rate limiting per tenant: prevent one tenant from consuming all LLM capacity
- Billing: track token usage per tenant; store in a metering table for invoicing

### Conversation History Search

- PostgreSQL full-text search for basic keyword search across conversations
- For semantic search: embed messages using the same model as RAG; store in pgvector
- Search API: `GET /api/v1/conversations/search?q=hoàn tiền&from=2026-01-01&channel=zalo`
- Filters: date range, channel, intent, sentiment, escalated (boolean)
- Use cases: quality review, training data mining, compliance audit
- Index conversation summaries (auto-generated) for faster search on large datasets

### Recommendations for B08

1. Use SSE for streaming — simpler than WebSocket and sufficient for most chatbot UIs
2. Redis for hot context, PostgreSQL for persistence — do not try to use only one
3. Build the Zalo integration first — it is the primary channel for Vietnamese customers
4. Implement circuit breaker and fallback responses from day one — LLM endpoints will go down
5. Design multi-tenant from the start even for a single client — retrofitting is extremely painful
6. Track token usage per conversation and per tenant — cost visibility prevents budget surprises
