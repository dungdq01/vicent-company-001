# Backend Engineer Notes: Agentic AI (B10)
## By Khanh Vo (R-BE) — Date: 2026-03-31

### 1. Overview

The backend of an agentic AI platform is fundamentally different from a chatbot backend. Agents execute multi-step workflows that may run for minutes or hours, call external tools, modify state, and require checkpointing for resumption. The Backend Engineer must build an execution engine that is reliable, scalable, secure, and observable.

### 2. Agent Execution Engine

- The core loop: receive user request -> LLM reasoning -> tool selection -> tool execution -> observation -> repeat until done.
- Design as a state machine with well-defined states: PLANNING, EXECUTING_TOOL, WAITING_FOR_APPROVAL, COMPLETED, FAILED, TIMED_OUT.
- Each state transition must be logged and persisted.
- Support both synchronous (user waits) and asynchronous (background task) execution modes.
- Implement max-step and max-token limits as circuit breakers.
- Use an event-driven architecture: agent steps emit events consumed by logging, billing, and monitoring services.

### 3. Tool Registry and Sandboxed Execution

**Tool Registry:**
- Central registry mapping tool names to execution endpoints, input schemas, output schemas, timeout, and permission level.
- Support dynamic tool registration: agents can gain/lose tools based on context.
- Version tools independently: tool v2 can coexist with tool v1 during migration.
- Store tool metadata: description, examples, rate limits, cost per call.

**Sandboxed Execution:**
- NEVER execute agent-generated code or tool calls in the main application process.
- Use containers (Docker/gVisor) for code execution tools.
- Use network policies to restrict tool access: allow-list for external APIs.
- File system isolation: each agent run gets a temporary workspace, destroyed after completion.
- Resource limits: CPU, memory, disk, and execution time per tool call.

### 4. State Management

**Checkpointing:**
- Serialize full agent state (conversation history, current plan, pending tool calls, accumulated results) after each step.
- Store checkpoints in a durable store (Redis for hot state, PostgreSQL for persistence).
- Enable resumption: if the agent process crashes, resume from the last checkpoint.
- Checkpoint format: JSON with schema versioning for backward compatibility.

**Session Management:**
- Each agent run has a unique session_id.
- Sessions can be paused (human-in-the-loop), resumed, forked (branch from a previous step), or cancelled.
- Implement session TTL: auto-expire abandoned sessions after configurable timeout.

### 5. Webhook and API Integration for Tools

- Many tools are external services accessed via REST APIs or webhooks.
- Build a universal HTTP tool executor:
  - Configure per-tool: URL template, auth method (API key, OAuth, mTLS), headers, retry policy.
  - Transform agent-provided parameters into the API's expected format.
  - Handle async APIs: poll for completion or register webhook callbacks.
- Implement a credential vault (HashiCorp Vault, AWS Secrets Manager) for tool API keys.
- Never pass credentials through the LLM — inject them at the execution layer.

### 6. Async Agent Execution

- Complex agents may run for 5-60 minutes. Users cannot hold HTTP connections that long.
- Architecture:
  - User submits task via REST API -> returns run_id immediately.
  - Agent executes in a background worker (Celery, Bull, Temporal).
  - Client polls for status or subscribes via WebSocket/SSE for real-time updates.
- Use a task queue (Redis, RabbitMQ) to decouple submission from execution.
- Support priority queues: urgent tasks preempt background tasks.

### 7. Multi-Tenant Agent Isolation

- In SaaS deployments, multiple customers share the agent platform.
- Isolation requirements:
  - **Data isolation**: each tenant's agent memory, logs, and artifacts are separate.
  - **Compute isolation**: one tenant's runaway agent must not affect others.
  - **Tool isolation**: tenant-specific tools and credentials are not accessible across tenants.
- Implementation: tenant_id as a mandatory field in all database queries, separate credential stores per tenant, resource quotas per tenant.
- Consider namespace-based Kubernetes isolation for compute-heavy tenants.

### 8. Rate Limiting for LLM Calls

- LLM API providers impose rate limits (tokens per minute, requests per minute).
- Implement a token bucket or sliding window rate limiter per LLM provider.
- Priority-based allocation: interactive agents get higher priority than background agents.
- Queue LLM requests when approaching limits rather than failing immediately.
- Track usage per tenant to enforce fair sharing and billing.
- Cache identical LLM requests (same prompt hash) to reduce API calls.

### 9. API Design

- RESTful API for agent management:
  - `POST /agents/{agent_id}/runs` — start a new run.
  - `GET /runs/{run_id}` — get run status and results.
  - `POST /runs/{run_id}/messages` — send a follow-up message to a running agent.
  - `POST /runs/{run_id}/approve` — approve a pending human-in-the-loop action.
  - `DELETE /runs/{run_id}` — cancel a running agent.
- WebSocket endpoint for real-time streaming of agent steps.
- Use OpenAPI/Swagger for documentation.

### 10. Technology Stack

- **Runtime**: Node.js (TypeScript) or Python (FastAPI) — both have strong LLM SDK support.
- **Task queue**: Temporal (recommended for complex workflows), Celery, or Bull.
- **Database**: PostgreSQL + Redis.
- **Container orchestration**: Kubernetes with gVisor for sandboxing.
- **LLM SDK**: LangChain, LlamaIndex, or Anthropic/OpenAI SDKs directly.

### Recommendations for B10

1. **Use Temporal for agent orchestration** — its durability guarantees and replay capability are ideal for long-running agents.
2. **Build the tool registry as a first-class service** — it is the backbone of agent extensibility.
3. **Sandbox everything** — treat every tool call as potentially dangerous code execution.
4. **Implement checkpointing from day one** — agents will crash, and users will expect resumption.
5. **Design for async-first** — synchronous-only agents will not scale beyond simple tasks.
6. **Build rate limiting before you need it** — one runaway agent can burn through your entire LLM budget in minutes.
