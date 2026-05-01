# P6 — Dev Guides

> Code-level spec so engineers can build without re-discussing.

**Canonical**: [`@../../../../business-strategy/13-product-delivery-process.md:410-435`](../../../../business-strategy/13-product-delivery-process.md)
**Prev**: [`P5-PLANNING.md`](P5-PLANNING.md) — **Next**: [`P7-QA.md`](P7-QA.md)

---

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 6: DEV GUIDES                                    │
│  Goal: Onboard a new engineer in 1 day                   │
│  Scope: Sprint C+ (skip for Sprint A)                    │
│  Engine cost target: $0.30–0.80                         │
└─────────────────────────────────────────────────────────┘
```

---

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| 6.1 | R-σ | Stitch P3 architecture + P4 design specs into per-component setup guides. |
| 6.2 | R-BE / R-FE / R-MLE | Per-discipline guide (frontend / backend / ML). |
| 6.3 | R-σ | Code conventions doc (formatting, naming, error handling, logging). |
| 6.4 | R-QA | Code review checklist. |
| 6.5 | R-σ | Skeleton/stub implementations per component. |
| 6.6 | Human (CEO) | Final pass for stack alignment + LLMOps practices. |

---

## Outputs

```
projects/{PROJECT_ID}/06-dev-guides/
├── setup.md                    ← local dev environment
├── conventions.md              ← code style + patterns
├── frontend-guide.md
├── backend-guide.md
├── ml-guide.md
├── code-review-checklist.md
└── skeletons/                  ← stub code per component
```

---

## Definition of Done

- ✅ A new engineer can run the project locally in **1 day** following `setup.md`
- ✅ Conventions cover: formatting, naming, error handling, logging, testing
- ✅ Code review checklist is **actionable** (binary pass/fail items, not vague)
- ✅ Skeleton stubs compile / lint cleanly
- ✅ CEO sign-off on LLMOps integration points (eval hooks, cost telemetry)

---

## Failure Modes
- **Guide assumes prior project knowledge**: test by having an *external* dev attempt setup.
- **Conventions conflict with company stack**: cross-check `business-strategy/06-personal-development.md`.

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

**Phase responsibility — implement harness primitives in code: error envelope, KV-cache prefix discipline, sandbox container, trace emission.**

| Action | Output | Rule |
|---|---|---|
| Structured error envelope in code | Every tool wrapper returns `ToolResult` envelope — no bare strings. Include in dev guide examples + lint rule | R-HRN-08 |
| KV-cache prefix discipline | Code review checks: no timestamp / UUID / per-request data in stable prefix region. Document pattern in dev guide | R-HRN-10 |
| Sandbox container build (L2) | Dockerfile for sandbox image (fs ro, network egress per whitelist, timeout 5min default) — added to `apps/sandbox/` | R-HRN-09 |
| Trace emission | Instrumentation library (Python decorator / TS middleware) that emits R-HRN-12 fields to `harness/traces/` + Helicone | R-HRN-12 |
| Code review checklist | Add "harness contract compliance" checks to PR template: envelope, cache prefix, trace emission, tool whitelist matches manifest | R-HRN-03, R-HRN-08, R-HRN-10, R-HRN-12 |

**Gate to P7**: dev guide MUST include 1 worked example of each primitive (envelope, cache, sandbox, trace). PR template updated. Linter / CI check enforces envelope shape.

Cross-ref: [`@../../../../_shared/rules/80-harness-rules.md`](../../../../_shared/rules/80-harness-rules.md) §R-HRN-08, §R-HRN-09, §R-HRN-10, §R-HRN-12

---

## Cross-References
- Stack standards: [`@../../../../business-strategy/06-personal-development.md`](../../../../business-strategy/06-personal-development.md)
- DoD: [`@../../../../_shared/standards/dod-per-deliverable.md`](../../../../_shared/standards/dod-per-deliverable.md)

---
*Pipeline v1.0 — last updated 2026-04-26*
