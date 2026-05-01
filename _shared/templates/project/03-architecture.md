---
file: 03-architecture
project_id: {{PROJECT_ID}}
phase: P3
filled_by: R-SA + CTO
last_updated: {{P3_DATE}}
status: draft | reviewed | signed
---

# {{PROJECT_NAME}} — System Architecture

> P3 deliverable. High-level system design that engineering team can build against. Signed by CTO before P4 starts.

---

## 0. Document Control

- **Author**: R-SA · [Fill: human reviewer]
- **CTO sign-off**: [Fill: name · date]
- **Eval score (R-SA)**: [Fill ≥ 7.5]
- **Decision log**: [`_meta/decisions/`](_meta/decisions/)

---

## 1. Executive Summary

[Fill: 1 paragraph · system shape · key tech choices · scaling approach]

💡 Hint: Architect explains to non-tech CEO in 2 minutes.

---

## 2. Context Diagram (C4 Level 1)

```
[Fill: ASCII or Mermaid showing system + actors + external systems]

        ┌─────────────┐
User ──→│  {{SYSTEM}} │──→ External APIs
        └─────────────┘
              │
              ▼
        Data sources
```

💡 Hint: Use C4 model. Level 1 = system context, Level 2 = container, Level 3 = component (in `04a-d`).

---

## 3. Container Diagram (C4 Level 2)

```
[Fill: containers + their interactions]

┌──────────┐    ┌──────────┐    ┌──────────┐
│ Frontend │───→│   API    │───→│    DB    │
│  Next.js │    │  Node.js │    │ Postgres │
└──────────┘    └──────────┘    └──────────┘
                      │
                      ▼
                ┌──────────┐
                │  ML svc  │
                │  Python  │
                └──────────┘
```

### 3.1 Container Inventory

| Container | Tech | Responsibility | Scale dimension |
|---|---|---|---|
| Frontend | [Fill: Next.js 16] | UI · client-side state | CDN cache · stateless |
| API | [Fill] | Business logic · auth | Horizontal · stateless |
| ML service | [Fill] | Inference | Horizontal + GPU |
| Database | [Fill] | Persistence · queries | Vertical first |
| Cache | [Fill: Redis] | Session · query cache | Cluster |

---

## 4. Data Flow

### 4.1 Critical Paths

[Fill: ≥ 3 critical user flows with sequence diagram]

```
Flow 1: [User action] → [System steps] → [Outcome]
[Fill Mermaid sequenceDiagram]
```

### 4.2 Data Lifecycle

[Fill: ingestion · processing · storage · archival · deletion]

---

## 5. Integration Points

| External system | Direction | Protocol | Auth | SLA |
|---|---|---|---|---|
| [Fill: e.g., Client ERP] | inbound + outbound | REST | OAuth2 | 99% |
| [Fill] | ... | ... | ... | ... |

---

## 6. Non-Functional Requirements

| NFR | Target | Measurement |
|---|---|---|
| Latency (p95) | [Fill: e.g., < 500ms] | API endpoint timing |
| Throughput | [Fill: e.g., 100 RPS] | Load test |
| Availability | [Fill: 99.5%] | Monthly uptime |
| Data freshness | [Fill: e.g., < 5 min] | Pipeline lag |
| Security | OWASP Top 10 + LLM safety | R-SE audit |
| Cost (monthly) | [Fill: < $X] | Helicone + cloud bill |

---

## 7. Scaling Strategy

### 7.1 Current Capacity Target
[Fill: e.g., 10K users · 100K requests/day]

### 7.2 Scale Path (10× growth)
- **Frontend**: [Fill]
- **API**: [Fill]
- **DB**: [Fill — read replicas? sharding?]
- **ML**: [Fill — batching? caching? quantization?]

### 7.3 Trigger Points
- [Fill: e.g., when DAU > 5K → add read replica]

---

## 8. Failure Modes & Mitigation

| Failure | Likelihood | Impact | Mitigation |
|---|---|---|---|
| [Fill ≥ 5] | L/M/H | L/M/H | [Fill] |

💡 Hint: P3 DoD requires ≥ 5 documented failure modes.

---

## 9. Tech Stack Summary

→ See companion doc: [`03-tech-stack.md`](03-tech-stack.md) for detailed rationale per component.

---

## 10. LLM Architecture Decisions (if applicable)

### 10.1 Model Choices Per Task

| Task | Model | Rationale | Eval target |
|---|---|---|---|
| [Fill] | [Haiku/Sonnet/Opus/open] | [Fill: cheapest passing] | ≥ [Fill] |

### 10.2 Eval Hook Points
[Fill: where in the pipeline eval runs · golden set used · threshold]

### 10.3 Cost Projection
[Fill: per-request cost · daily volume · monthly LLM bill]

### 10.4 Prompt Injection Defenses
[Fill: per R-SEC-06 · system/data separation · monitoring]

---

## 11. Security Architecture

### 11.1 Auth & Authorization
[Fill: provider · roles · permission model]

### 11.2 Data Classification
| Data type | Classification | Storage | Encryption |
|---|---|---|---|
| [Fill] | Public · Internal · Confidential · PII | [Fill] | At rest + transit |

### 11.3 Secrets Management
[Fill: per R-SEC-01]

### 11.4 Audit Logging
[Fill: events logged · retention · access]

---

## 12. Observability

| Layer | Tool | Metrics |
|---|---|---|
| App logs | [Fill: e.g., Logflare] | error rate · latency |
| LLM traces | Helicone | tokens · cost · score |
| Infra | [Fill: e.g., Vercel/Fly] | uptime · resources |
| User analytics | [Fill: PostHog] | events · funnels |

---

## 13. Architecture Decisions

Full decisions in [`_meta/decisions/`](_meta/decisions/). Top decisions summarized:

| ADR # | Decision | Rationale |
|---|---|---|
| ADR-0001 | [Fill] | [Fill] |
| ADR-0002 | ... | ... |

---

## 14. Open Items

[Fill: items needing client input or future decision]

---

## 15. Sign-Off

- **R-SA eval**: [Fill ≥ 7.5]
- **CTO sign**: [Fill name · date]
- **Client architect** (if any): [Fill]
- **Ready for P4**: [ ] Yes [ ] No

---

## Cross-References

- P3 phase doc: [`@../../../experience/workspace/docs/pipeline/P3-ARCHITECTURE.md`](../../../experience/workspace/docs/pipeline/P3-ARCHITECTURE.md)
- Stack rules: [`@../../rules/10-stack-rules.md`](../../rules/10-stack-rules.md)
- R-SA card: [`@../../.agents/tier-4-delivery/R-SA-solution-architect.md`](../../.agents/tier-4-delivery/R-SA-solution-architect.md)
- CTO charter: [`@../../.agents/tier-0-executive/CTO-charter.md`](../../.agents/tier-0-executive/CTO-charter.md)

---
*Template v1.0*
