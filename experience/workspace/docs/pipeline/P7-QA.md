# P7 — QA

> Test plan, golden sets, regression suite, performance + accessibility.

**Canonical**: [`@../../../../business-strategy/13-product-delivery-process.md:437-458`](../../../../business-strategy/13-product-delivery-process.md)
**Prev**: [`P6-DEV-GUIDES.md`](P6-DEV-GUIDES.md) — **Next**: [`P8-DEPLOYMENT.md`](P8-DEPLOYMENT.md)

---

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 7: QA                                             │
│  Goal: Test every P4 deliverable; catch regressions      │
│  Scope: Sprint D                                         │
│  Engine cost target: $0.30–0.80                         │
└─────────────────────────────────────────────────────────┘
```

---

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| 7.1 | R-QA | Test plan: unit + integration + e2e per component. |
| 7.2 | R-QA + R-MLE | Golden test set for ML/AI components (≥ 20 cases). |
| 7.3 | R-QA | Regression suite (CI-runnable). |
| 7.4 | R-QA | Manual test scripts for UX flows. |
| 7.5 | R-QA | Performance benchmarks + targets. |
| 7.6 | R-QA / R-FE | Accessibility check if UI present (WCAG AA min). |
| 7.7 | Human (CEO) | Eval gate: golden test pass rate ≥ threshold (see `_shared/eval/SPEC.md`). |

---

## Outputs

```
projects/{PROJECT_ID}/07-qa/
├── test-plan.md
├── golden-tests/
│   └── *.yaml                  ← per `_shared/eval/golden-sets/` schema
├── regression-suite/           ← runnable in CI
├── performance-benchmarks.md
├── manual-test-scripts.md
└── accessibility-report.md     ← if UI
```

---

## Definition of Done

- ✅ Test plan covers **every** P4 deliverable
- ✅ Golden test set ≥ **20 cases** for ML/AI components
- ✅ Regression suite runnable in CI (`make test` or equivalent)
- ✅ Performance targets defined + measurable (latency, throughput, cost/req)
- ✅ Accessibility WCAG AA where UI present
- ✅ Eval pass rate ≥ threshold per `_shared/eval/SPEC.md`

---

## Failure Modes
- **Tests written from spec, not from reality**: agents pass spec but real data fails. *Mitigation*: include sample real data in golden set.
- **Golden set drift**: model improves, golden expectations outdated. *Mitigation*: review per phase in retro; promote new cases from prod incidents.

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

**Phase responsibility — verify harness instrumentation works end-to-end before P8 deploy.**

| Action | Test | Rule |
|---|---|---|
| Drift detection live | Inject synthetic out-of-allowed state transition → confirm Engine flags `drift_detected` + halts run | R-HRN-07 |
| Error envelope coverage | 100% tool calls return envelope shape (audit trace sample). Bare-string returns = QA fail | R-HRN-08 |
| Permanent-fix log writable | Trigger 1 deliberate failure → confirm entry appended to `permanent-fixes.md` + `local_rules[]` updated | R-HRN-06 |
| Cache hit-rate measurement | Run baseline workload, confirm hit rate ≥ 50% (yellow) at minimum. < 50% = block deploy | R-HRN-10 |
| Approval gate test | Trigger each approval class (read_only / write_shared / destructive) → confirm matrix enforced + DENY default on timeout | R-HRN-11 |
| Observability triple complete | Sample 100 turns → confirm all R-HRN-12 fields present, no missing field | R-HRN-12 |
| Sandbox isolation (L2) | Attempt forbidden action (write outside workspace, hit non-whitelisted endpoint) → confirm blocked | R-HRN-09 |

**Gate to P8**: ALL harness instruments green. ANY missing = QA fail = block deploy. Eval pass rate per `_shared/eval/SPEC.md` separately enforced.

Cross-ref: [`@../../../../_shared/rules/80-harness-rules.md`](../../../../_shared/rules/80-harness-rules.md) — full R-HRN spec

---

## Cross-References
- Eval framework: [`@../../../../_shared/eval/SPEC.md`](../../../../_shared/eval/SPEC.md)
- Golden set schema: [`@../../../../_shared/eval/golden-sets/README.md`](../../../../_shared/eval/golden-sets/README.md)

---
*Pipeline v1.0 — last updated 2026-04-26*
