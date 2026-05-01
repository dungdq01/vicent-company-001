# P3 — Architecture

> System design that engineering team can build against.

**Canonical**: [`@../../../../business-strategy/13-product-delivery-process.md:282-323`](../../../../business-strategy/13-product-delivery-process.md)
**Prev**: [`P2-PROPOSAL.md`](P2-PROPOSAL.md) (+ G1 signed) — **Next**: [`P4-DESIGN.md`](P4-DESIGN.md)

---

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 3: ARCHITECTURE                                  │
│  Goal: High-level system design, tech stack, scaling    │
│  Scope: Sprint B+ (or P2 done in Sprint A delivery)     │
│  Engine cost target: $0.40–1.20                         │
│  Human involvement: HIGH (CEO sign-off mandatory)       │
└─────────────────────────────────────────────────────────┘
```

---

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| 3.1 | R-SA | High-level architecture diagram, component breakdown, data flow, integration points. |
| 3.2 | R-SA | Tech stack recommendation with rationale per component. |
| 3.3 | R-SA | Scaling considerations (horizontal/vertical, traffic projections). |
| 3.4 | R-SA + R-γ | Failure modes ≥ 5 with mitigation. |
| 3.5 | Human (CEO) | LLM choice (Sonnet vs Haiku per task), eval points in pipeline, prod cost estimate. |
| 3.6 | Optional | Client architecture review meeting (60 min). |

---

## Outputs

```
projects/{PROJECT_ID}/03-architecture/
├── architecture.md              ← high-level
├── architecture-diagram.png     ← Mermaid or draw.io export
├── tech-stack.md                ← components + rationale
├── scaling-considerations.md
└── failure-modes.md
```

---

## Definition of Done

- ✅ Architecture passes R-SA eval ≥ **7.5/10**
- ✅ Every component has explicit rationale (no "because trendy")
- ✅ ≥ **5 failure modes** documented with mitigation
- ✅ Client team confirms feasibility with existing infra
- ✅ CEO signs off; decision logged in `meta/decisions.md`

---

## Failure Modes
- **Stack drift / FOMO**: SA proposes new framework not in `business-strategy/06-personal-development.md` stack. *Mitigation*: enforce anti-FOMO check; deviations require ADR.
- **Over-engineering for MMO scope**: 3-tier microservices for $30 PDF. *Mitigation*: scope tier injected into SA system prompt.
- **Integration blind spots**: missing data contracts between ML and BE. *Mitigation*: P4e integration review catches; iterate to P3 if ≥1 conflict.

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

**Phase responsibility — R-AE fills `manifest.yaml` (control loop, allowed_transitions, tool whitelist).**

| Action | Output | Rule |
|---|---|---|
| Define control loop pattern | `manifest.yaml.control_loop.pattern` (default: observe-plan-act-evaluate-reflect) + `allowed_transitions[]` state machine | R-HRN-02 |
| Tool whitelist (≤ 20) | `manifest.yaml.tools.whitelist[]` — minimum viable set, justify each tool added | R-HRN-03 |
| Tool schema validation strategy | Pydantic / Zod / equivalent — applied to every tool input + output | R-HRN-03, R-HRN-08 |
| State checkpoint cadence | Define `checkpoint_every_n_turns` (default 10) + `max_turns_per_run` | R-HRN-02 |

**Gate to P4**: `manifest.yaml` validated by Engine schema check (control_loop + tools + checkpoint config present, allowed_transitions includes escape hatches `escalated` + `drift_detected`).

Cross-ref: [`@../../../../_shared/rules/80-harness-rules.md`](../../../../_shared/rules/80-harness-rules.md) §R-HRN-02, §R-HRN-03

---

## Cross-References
- R-SA skill card: [`@../../../../_shared/.agents/tier-4-delivery/R-SA-solution-architect.md`](../../../../_shared/.agents/tier-4-delivery/R-SA-solution-architect.md)
- Tech stack policy: [`@../../../../business-strategy/06-personal-development.md`](../../../../business-strategy/06-personal-development.md) (anti-FOMO)
- ADR template: `_shared/templates/project/` (decisions/)

---
*Pipeline v1.0 — last updated 2026-04-26*
