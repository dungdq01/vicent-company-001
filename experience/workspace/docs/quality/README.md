# quality/ — Quality Gates & Checklists

**Parent**: [`@../../README.md`](../../README.md)

**Purpose**: Operational checklists the engine + humans run **between phases** to enforce DoD before transitioning. These are the *runtime guards* — the strategic policy lives in `_shared/standards/`.

---

## Files

| File | Purpose | When run |
|---|---|---|
| [`DOD-CHECKLIST.md`](DOD-CHECKLIST.md) | Per-phase Definition of Done checklist | end of every P0–P9 |
| [`EVAL-GATES.md`](EVAL-GATES.md) | Eval threshold rules + drift detection | after each agent step |
| [`FILESYSTEM-CHECKLIST.md`](FILESYSTEM-CHECKLIST.md) | Project folder structure validation | start + end of every phase |

## 3-Layer Compliance (post-eval)

After R-eval scores, engine runs Layer 3 harness compliance check before commit:

1. **Layer 1 — Structural eval**: filesystem checklist (file exists, size, anchors per R-DOC-16)
2. **Layer 2 — R-eval LLM-judge**: content score ≥ threshold per skill class
3. **Layer 3 — Harness compliance**: per R-HRN-* rules (manifest valid, tools used in whitelist, cost within cap, memory layer boundaries respected, KV-cache discipline preserved)

Any layer fail → block commit, retry max 2, escalate human if persists.

---

## How Gates Fit Into The Pipeline

```
[Agent step]
    │
    ▼
[Eval gate]  ──fail──▶ retry (max 2) ──fail again──▶ escalate human
    │ pass
    ▼
[Phase end]
    │
    ▼
[DoD checklist]  ──fail──▶ block phase transition
    │ pass
    ▼
[Filesystem check]  ──fail──▶ engine repairs structure or alerts
    │ pass
    ▼
[Next phase]
```

---

## Cross-References

| Need | Path |
|---|---|
| DoD canonical (per-deliverable) | [`@../../../../_shared/standards/dod-per-deliverable.md`](../../../../_shared/standards/dod-per-deliverable.md) |
| Eval framework spec | [`@../../../../_shared/eval/SPEC.md`](../../../../_shared/eval/SPEC.md) |
| Scoring rubric | [`@../../../../_shared/eval/scoring-rubric.md`](../../../../_shared/eval/scoring-rubric.md) |
| Cost budgets | [`@../../../../_shared/standards/cost-budgets.md`](../../../../_shared/standards/cost-budgets.md) |

---
*Quality gates v1.1 — last updated 2026-04-28 (added Layer 3 harness compliance check)*
