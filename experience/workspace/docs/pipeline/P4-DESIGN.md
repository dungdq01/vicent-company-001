# P4 — Design (Parallel)

> Detailed design at code level. Four sub-phases run in parallel.

**Canonical**: [`@../../../../business-strategy/13-product-delivery-process.md:325-387`](../../../../business-strategy/13-product-delivery-process.md)
**Prev**: [`P3-ARCHITECTURE.md`](P3-ARCHITECTURE.md) — **Next**: [`P5-PLANNING.md`](P5-PLANNING.md)

---

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 4: DESIGN (parallel A/B/C/D + integration)        │
│  Goal: Implementable specs per discipline                │
│  Wall time: 3–5 days (vs 8–12 sequential)                │
│  Engine cost target: $0.80–2.50 (4 agents in parallel)   │
│  Human involvement: MEDIUM (CEO + P2 integration review) │
└─────────────────────────────────────────────────────────┘
```

---

## Parallel Sub-Phases

| Sub | Agent | Output |
|---|---|---|
| **P4a — API Design** | R-BE | `04-design/api/api-design.md` + OpenAPI YAML |
| **P4b — DB Schema** | R-DE | `04-design/db/db-schema.md` + SQL DDL |
| **P4c — ML Algorithm** | R-MLE (+ CEO) | `04-design/ml/algorithm-spec.md` |
| **P4d — UI/UX** | R-FE | `04-design/ui/ui-design.md` + Figma link |

### P4a — API
Endpoint list (REST/GraphQL), request/response schemas, auth + rate limiting, error codes.

### P4b — DB
ER diagram, table definitions (Postgres-first), index strategy, migration plan from existing system.

### P4c — ML
Algorithm choice with rationale (e.g., NBEATS over Prophet for sparse retail), training data requirements, eval metrics, inference latency target. **CEO validation mandatory**.

### P4d — UI/UX
Page list, component breakdown, user flow diagram, low-fi wireframes.

---

## P4e — Integration Review (consolidation, sequential)

Owner: **CEO + P2**. Cross-check API ↔ DB ↔ ML ↔ UI consistency.

Output: `04-design/integration-review.md` listing every cross-discipline conflict and resolution.

---

## Engine Orchestration Pattern

```javascript
// Parallel fan-out
const [api, db, ml, ui] = await Promise.all([
  executeAgent({ agentId: "R-BE", task: "P4a", context }),
  executeAgent({ agentId: "R-DE", task: "P4b", context }),
  executeAgent({ agentId: "R-MLE", task: "P4c", context }),
  executeAgent({ agentId: "R-FE", task: "P4d", context }),
]);
// Sequential consolidation
const integration = await reviewIntegration({ api, db, ml, ui });
```

See [`@../../AGENT-WORKSPACE-PIPELINE.md:387-398`](../../AGENT-WORKSPACE-PIPELINE.md) for the parallel execution helper.

---

## Definition of Done (per sub-phase)

- ✅ Each sub-phase passes its agent's eval ≥ **7.5/10**
- ✅ Output is **implementable** (engineer can start coding without questions)
- ✅ Integration review identifies **0 unresolved conflicts** before P5
- ✅ ML choice has CEO-signed rationale (anti-FOMO)

---

## Failure Modes
- **Conflicting schemas** (API expects field `user_id`, DB has `userId`): integration review must catch; loop back to P4a/P4b until aligned.
- **ML latency violates UI UX**: re-spec algorithm or accept async UX pattern.
- **Parallel agents drift** (each assumes different auth model): include shared *Design Premises* doc in context for all four.

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

**Phase responsibility — design memory tiers, error envelope contract, KV-cache prefix, observability schema.**

| Action | Output | Rule |
|---|---|---|
| Memory tier sizing | `manifest.yaml.memory.working.compact_at_pct=70` mandatory + define compaction model (different family from generator per R-QAL-13) + long-term storage format | R-HRN-04, R-QAL-13 |
| Error envelope schema | Define `ToolResult` envelope `{success, data, error, cost_usd, latency_ms}` for every tool — document in `04a-api-design.md` | R-HRN-08 |
| KV-cache prefix design | Identify stable prefix segments (RULES-PREAMBLE + tool schemas + skill card system prompts) — these MUST NOT contain timestamp / random / per-request data | R-HRN-10 |
| Observability schema | Confirm trace fields per R-HRN-12 (turn_id, run_id, agent_id, tokens, cost, latency, state transitions, tools_called) | R-HRN-12 |

**Gate to P5**: design doc explicit on memory compaction trigger (70%) + error envelope used by all tools + KV-cache prefix discipline noted.

Cross-ref: [`@../../../../_shared/rules/80-harness-rules.md`](../../../../_shared/rules/80-harness-rules.md) §R-HRN-04, §R-HRN-08, §R-HRN-10, §R-HRN-12

---

## Cross-References
- Skill cards: [`@../../../../_shared/.agents/tier-2-engineering/`](../../../../_shared/.agents/tier-2-engineering/)
- DoD: [`@../../../../_shared/standards/dod-per-deliverable.md`](../../../../_shared/standards/dod-per-deliverable.md)

---
*Pipeline v1.0 — last updated 2026-04-26*
