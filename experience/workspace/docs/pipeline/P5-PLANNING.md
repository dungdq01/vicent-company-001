# P5 — Planning

> Sprint plan that delivery team (client or internal) can execute.

**Canonical**: [`@../../../../business-strategy/13-product-delivery-process.md:389-407`](../../../../business-strategy/13-product-delivery-process.md)
**Prev**: [`P4-DESIGN.md`](P4-DESIGN.md) — **Next**: [`P6-DEV-GUIDES.md`](P6-DEV-GUIDES.md)

---

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 5: PLANNING                                      │
│  Goal: Sprint plan + RACI + risk register               │
│  Engine cost target: $0.10–0.30                         │
│  Human involvement: HIGH (P3 co-create with R-PM)        │
└─────────────────────────────────────────────────────────┘
```

---

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| 5.1 | R-PM | Sprint breakdown (2-week sprints), milestones M1=MVP, M2=beta, M3=GA. |
| 5.2 | R-PM | RACI matrix per task (Responsible / Accountable / Consulted / Informed). |
| 5.3 | R-PM | Dependency map (DAG of tasks). |
| 5.4 | R-PM + R-γ | Risk register ≥ 5 risks, scored (probability × impact). |
| 5.5 | Human (P3) | Validate against client timeline; adjust scope tier if overflow. |

---

## Outputs

```
projects/{PROJECT_ID}/05-planning/
├── project-plan.md         ← sprint breakdown + milestones
├── raci.md                 ← per-task ownership
├── dependency-map.md       ← task DAG (Mermaid)
├── risk-register.md        ← ≥5 risks, scored
└── linear-board.url        ← (optional) external tracking link
```

---

## Definition of Done

- ✅ Plan fits within client timeline (no overflow without scope change)
- ✅ Every task has owner + DoD + estimate
- ✅ Dependency map is acyclic and traceable
- ✅ Risk register ≥ **5 risks**, each with mitigation owner
- ✅ Plan reviewed in weekly sync with client (P3)

---

## Failure Modes
- **Plan ignores P4d UI complexity**: re-estimate with R-FE input before locking sprints.
- **Critical-path single point of failure** (one engineer owns 80% of tasks): force redistribution or accept risk explicitly.
- **Risks copy-pasted from template**: enforce project-specific risk language; eval rejects boilerplate.

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

**Phase responsibility — lock `guardrails.yaml` (COO sign before P6 Dev). Provision sandbox spec.**

| Action | Output | Rule |
|---|---|---|
| Approval matrix lock | `guardrails.yaml.approval_matrix` per profile L0/L1/L2 — COO sign mandatory | R-HRN-11 |
| Network egress whitelist | `guardrails.yaml.network_egress_whitelist[]` — list approved external endpoints + rationale per entry | R-HRN-09 |
| Hard-deny actions | `guardrails.yaml.hard_deny[]` — destructive ops blocked regardless of approver (force-push, DROP TABLE, prod credential rotation, etc.) | R-HRN-11 |
| Human-in-loop triggers | `guardrails.yaml.human_in_loop_triggers` (cost spike / failure count / drift / approval timeout default DENY) | R-HRN-07, R-HRN-11 |
| Sandbox spec (L2 only) | If profile=L2: R-DO + R-SE define container image, fs mount mode, timeout — link from guardrails.yaml | R-HRN-09 |

**Gate to P6**: `guardrails.yaml` signed by COO (filesystem record + Discord/Notion link). For L2 profile, also signed by CTO.

Cross-ref: [`@../../../../_shared/rules/80-harness-rules.md`](../../../../_shared/rules/80-harness-rules.md) §R-HRN-09, §R-HRN-11

---

## Cross-References
- R-PM skill card: [`@../../../../_shared/.agents/tier-4-delivery/R-PM-project-manager.md`](../../../../_shared/.agents/tier-4-delivery/R-PM-project-manager.md)

---
*Pipeline v1.0 — last updated 2026-04-26*
