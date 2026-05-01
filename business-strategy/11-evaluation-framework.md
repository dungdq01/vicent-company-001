# 11 — Evaluation Framework (Strategic View)

> File này tóm tắt eval framework ở **layer chiến lược**. Implementation chi tiết ở `_shared/eval/`.

**Canonical implementation**: [`@../_shared/eval/SPEC.md`](../_shared/eval/SPEC.md)
**Operational gates**: [`@../experience/workspace/docs/quality/EVAL-GATES.md`](../experience/workspace/docs/quality/EVAL-GATES.md)

---

## 1. Tại sao Eval là moat

LLMOps eval framework là **competitive moat** khó copy của studio:

- Pattern recognition across nhiều project + nhiều client → golden set
- Prompt versioning với eval delta proof → quality compounding
- Cost optimization based on quality-vs-cost frontier → margin advantage
- Memory hygiene + drift detection → khách hàng tin tưởng prod

→ Đầu tư vào eval = đầu tư vào moat. Mọi quyết định eval tier 0 = CTO ownership.

---

## 2. Eval Layers (3 levels)

| Level | What | Frequency | Owner |
|---|---|---|---|
| **L1 — Per agent step** | LLM-as-judge against rubric | Real-time after each call | Engine auto |
| **L2 — Golden set** | Regression suite per agent | Before prompt promotion | CTO |
| **L3 — Production drift** | Cost · latency · score rolling 7-day | Continuous | CTO |

Detail: [`@../_shared/eval/SPEC.md`](../_shared/eval/SPEC.md)

---

## 3. Threshold Defaults

| Agent class | Pass | Retry | Escalate |
|---|---|---|---|
| Research (α/β/γ) | ≥ 7.5 | 6.5-7.4 | < 6.5 |
| Consolidation (σ) | ≥ 8.0 | 7.0-7.9 | < 7.0 |
| Engineering (T2) | ≥ 7.5 | 6.5-7.4 | < 6.5 |
| Domain (T3) | ≥ 7.0 | 6.0-6.9 | < 6.0 |
| Delivery (T4) | ≥ 7.5 | 6.5-7.4 | < 6.5 |
| Business (T5) | ≥ 7.5 | 6.5-7.4 | < 6.5 |

Tunable per project in `projects/{id}/_metadata/eval-overrides.json`.

---

## 4. Promotion Rule (prompt v1.0 → v1.x)

Promote chỉ khi:
- Mean improvement ≥ **+0.3** trên golden set
- **0 regressions** on existing cases
- Pattern across ≥ **3 projects** (statistical signal)
- CTO sign-off recorded in `_shared/.agents/CHANGELOG.md`

---

## 5. Drift Detection Rules

| Metric | Window | Yellow | Red action |
|---|---|---|---|
| Score drift | 7-day rolling mean | drop > 0.5 | Pause prompt, investigate |
| Cost drift | 7-day mean tokens/run | rise > 30% | Audit prompts, optimize |
| Failure pattern | 7-day count | same mode ≥ 3× | Memory review + skill card update |
| Cost cap (per project) | actual vs budget | > 100% | Halt + escalate CTO |

---

## 6. Tooling

| Tool | Purpose | Used by |
|---|---|---|
| Helicone | Cost + latency telemetry | All agent calls |
| Langfuse / Arize | Eval drift dashboard | CTO daily |
| Custom golden runner | Pre-promotion regression | CTO before bump |
| Helicone alerts | Cost cap breach | Real-time |

Stack policy: [`@06-personal-development.md`](06-personal-development.md) — anti-FOMO; eval tools are explicit allow-list.

---

## 7. Cross-Layer Eval Chain

```
L1 Knowledge:  rated by R-α/β/γ during research
                     │
L2 Agents:    rated by L1-L3 eval (per-step + golden + drift)
                     │
L3 Experience: rated by phase DoD checklist (passes per project)
                     │
L4 Projects:  rated by client NPS + eval drift in production
                     │
L5 Strategy:   rated by quarterly KPI roll-up (R-BIZ digest)
```

Each layer feeds eval signal upstream → memory promotion.

---

## 8. Anti-Patterns

- ❌ Skip eval to "ship faster" — debt compounds catastrophically
- ❌ Promote prompt without golden set proof
- ❌ Single-metric optimization (e.g., cost only, ignore quality)
- ❌ Ignore drift alerts > 7 days
- ❌ Tune eval threshold to make a bad prompt "pass"

---

## 9. Cross-References

| Need | Path |
|---|---|
| Implementation spec | [`@../_shared/eval/SPEC.md`](../_shared/eval/SPEC.md) |
| Scoring rubric | [`@../_shared/eval/scoring-rubric.md`](../_shared/eval/scoring-rubric.md) |
| Failure modes catalogue | [`@../_shared/eval/failure-modes.md`](../_shared/eval/failure-modes.md) |
| Golden sets | [`@../_shared/eval/golden-sets/`](../_shared/eval/golden-sets/) |
| Operational gates | [`@../experience/workspace/docs/quality/EVAL-GATES.md`](../experience/workspace/docs/quality/EVAL-GATES.md) |
| CTO charter | [`@../_shared/.agents/tier-0-executive/CTO-charter.md`](../_shared/.agents/tier-0-executive/CTO-charter.md) |
| Cost budgets | [`@../_shared/standards/cost-budgets.md`](../_shared/standards/cost-budgets.md) |

---
*v1.0 — last updated 2026-04-26*
