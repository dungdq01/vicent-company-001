# Solution Architect Notes: Agentic AI (B10)
## By Quan Bui (R-SA) — Date: 2026-03-31

### 1. Overview

The Solution Architect must design system architectures that translate the promise of agentic AI into production-grade platforms. This requires evaluating reference architectures, selecting appropriate frameworks, designing enterprise integration patterns, and planning migration paths from existing chatbot systems to full agent capabilities.

### 2. Reference Architectures

**Single-Agent Architecture:**
- One LLM-powered agent with access to a set of tools.
- Best for: focused tasks with clear scope (e.g., customer service, code review).
- Components: orchestrator, LLM, tool registry, tool executors, memory store, logging.
- Pros: simple to build, debug, and monitor. Cons: limited to what one agent can handle.

**Multi-Agent Architecture:**
- Multiple specialized agents that collaborate on complex tasks.
- Patterns:
  - **Supervisor**: A manager agent delegates sub-tasks to worker agents and synthesizes results.
  - **Peer-to-peer**: Agents communicate directly, each responsible for their domain.
  - **Pipeline**: Agents process sequentially, each adding to the work product.
- Best for: complex tasks spanning multiple domains (e.g., research + analysis + report writing).
- Pros: specialization, parallel execution. Cons: coordination complexity, harder debugging.

**Workflow-Hybrid Architecture (Recommended for most production use cases):**
- Combine deterministic workflows with agent-powered nodes.
- Fixed workflow structure (DAG) where some nodes are traditional code and some are LLM agents.
- Example: ingest document (code) -> extract entities (agent) -> validate (code) -> generate report (agent) -> human review (UI).
- Best for: enterprise use cases that need reliability with AI flexibility.
- Pros: predictable overall flow, agent intelligence where needed. Cons: less adaptive than pure agent.

### 3. Technology Selection

| Framework | Architecture | Best For | Maturity | Learning Curve |
|-----------|-------------|----------|----------|----------------|
| **LangGraph** | Graph-based agent workflows | Complex stateful agents with cycles | High | Medium |
| **CrewAI** | Multi-agent role-based | Team-of-agents use cases | Medium | Low |
| **AutoGen (AG2)** | Conversational multi-agent | Research, prototyping | Medium | Medium |
| **OpenAI Agents SDK** | Single/multi-agent | OpenAI-ecosystem agents | Medium | Low |
| **Claude Agent SDK** | Single-agent with tools | Anthropic-ecosystem agents | Growing | Low |
| **Temporal + custom** | Workflow with agent nodes | Enterprise production systems | High | High |
| **Custom (no framework)** | Any | Full control, unique requirements | N/A | High |

**Recommendation for MAESTRO Platform:**
- Use LangGraph for agent orchestration (best balance of flexibility and production-readiness).
- Use Temporal for the overall workflow engine (durable execution, checkpointing).
- Wrap agents as Temporal activities for production reliability.

### 4. Enterprise Agent Deployment Patterns

**Pattern 1: Agent-Assisted (Human + Agent)**
- Agent prepares work; human reviews and approves.
- Lowest risk, easiest adoption. Start here.
- Example: Agent drafts email response, human reviews before sending.

**Pattern 2: Agent-Supervised (Agent + Human oversight)**
- Agent executes autonomously for routine cases; escalates edge cases to humans.
- Medium risk. Deploy after Pattern 1 proves reliable.
- Example: Agent handles 80% of customer inquiries, routes complex ones to humans.

**Pattern 3: Fully Autonomous Agent**
- Agent acts independently within defined boundaries.
- Highest risk, highest efficiency gain. Deploy only for well-understood tasks.
- Example: Agent monitors inventory and auto-reorders when stock is low.

### 5. Integration with Existing Business Systems

- Agents need to connect to enterprise systems: CRM, ERP, databases, email, Slack, JIRA.
- Integration patterns:
  - **Tool wrapper**: Write a tool that calls the existing system's API. Simplest approach.
  - **MCP (Model Context Protocol)**: Standardized protocol for connecting LLMs to data sources and tools. Emerging standard.
  - **Event-driven**: Agent subscribes to business events (new order, support ticket) and acts on them.
  - **Database direct access**: Agent queries databases directly via SQL tool. Powerful but risky — use read-only access.
- Build an integration layer (API gateway) between agents and business systems for security, logging, and rate limiting.

### 6. Migration from Chatbot to Agent

**Phase 1: Enhanced Chatbot (Weeks 1-4)**
- Add tool calling to existing chatbot: search, database lookup, simple calculations.
- No autonomous decision-making; tools augment responses.

**Phase 2: Guided Agent (Weeks 5-8)**
- Enable multi-step workflows with human-in-the-loop approval for actions.
- Agent can plan and propose actions; human approves execution.

**Phase 3: Supervised Agent (Weeks 9-12)**
- Agent executes routine tasks autonomously; escalates exceptions.
- Implement monitoring, cost tracking, and safety checks.

**Phase 4: Full Agent Platform (Weeks 13+)**
- Multi-agent collaboration, complex workflows, minimal human intervention for proven tasks.
- Continuous evaluation and improvement loop.

### 7. Scalability Patterns

- **Horizontal scaling**: Add agent worker instances behind a task queue.
- **Model tiering**: Route simple steps to cheap models, complex steps to expensive models.
- **Caching**: Cache tool results, LLM responses for common queries.
- **Async processing**: Long-running agents execute in background; users get notified on completion.
- **Multi-region**: Deploy agent workers close to tool endpoints to reduce latency.
- Target architecture should support 100+ concurrent agent runs at steady state.

### 8. Architecture Decision Records

Document key decisions:
- ADR-001: LangGraph for agent orchestration (chosen over CrewAI for graph flexibility).
- ADR-002: Temporal for workflow durability (chosen over custom for reliability).
- ADR-003: Hybrid architecture (chosen over pure agent for enterprise predictability).
- ADR-004: API-based LLM serving initially (chosen over self-hosted for speed to market).
- ADR-005: PostgreSQL + Qdrant for agent state and memory.

### Recommendations for B10

1. **Start with the workflow-hybrid architecture** — it provides the best balance of reliability and AI capability for enterprise use cases.
2. **Use LangGraph + Temporal** as the core technology stack for agent orchestration.
3. **Follow the phased migration path** — do not jump to fully autonomous agents without proving each phase.
4. **Build the integration layer early** — agent value depends on connecting to real business systems.
5. **Adopt MCP for tool standardization** — it is becoming the industry standard for LLM-tool connectivity.
6. **Document every architecture decision** — the field is moving fast; record why you chose what you chose.
