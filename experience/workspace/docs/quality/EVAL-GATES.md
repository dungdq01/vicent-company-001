# Eval Gates — Threshold Rules

> Run after every agent step. Decide: pass / retry / escalate.

**Framework spec**: [`@../../../../_shared/eval/SPEC.md`](../../../../_shared/eval/SPEC.md)
**Rubric**: [`@../../../../_shared/eval/scoring-rubric.md`](../../../../_shared/eval/scoring-rubric.md)

---

## Default Thresholds

| Agent | Pass | Retry | Escalate |
|---|---|---|---|
| R-α (research) | ≥ 7.5 | 6.5–7.4 | < 6.5 |
| R-β (tech) | ≥ 7.5 | 6.5–7.4 | < 6.5 |
| R-γ (feasibility) | ≥ 7.0 | 6.0–6.9 | < 6.0 |
| R-σ (consolidation) | ≥ 8.0 | 7.0–7.9 | < 7.0 |
| R-MLE / R-DE / R-BE / R-FE / R-DO | ≥ 7.5 | 6.5–7.4 | < 6.5 |
| R-NLP / R-AE | ≥ 7.5 | 6.5–7.4 | < 6.5 |
| R-Dxx domain | ≥ 7.0 | 6.0–6.9 | < 6.0 |
| R-PM / R-SA | ≥ 7.5 | 6.5–7.4 | < 6.5 |
| R-QA | ≥ 8.0 | 7.0–7.9 | < 7.0 |

Per-project overrides recorded in `projects/{id}/_metadata/eval-overrides.json`.

---

## Decision Tree

```
agent step done
    │
    ▼
[score = LLM-as-judge against rubric]
    │
    ├─ score ≥ pass     → emit "eval_pass", proceed
    ├─ score in retry   → retry once with critique injected
    │                     │
    │                     └─ if 2nd retry still in retry band → escalate
    └─ score < escalate → emit "eval_escalate", pause for human
```

Retry budget: **max 2 retries per agent per phase**. Cost-capped via `_shared/standards/cost-budgets.md`.

---

## Eval Drift Detection (Production)

After deploy (P8), monitor:

1. **Score drift** — rolling 7-day mean of agent eval drops > 0.5 → alert.
2. **Cost drift** — tokens/run rolling 7-day mean rises > 30% → alert.
3. **Pattern drift** — same failure mode appears ≥ 3× in 7 days → trigger memory review.

Tooling: Helicone or Langfuse (see `_shared/standards/cost-budgets.md`).

---

## Golden-Set Regression Gate

Before promoting a prompt version (`v1.0 → v1.1+`):

- Run golden set from `_shared/eval/golden-sets/R-{id}.yaml`
- Required: **+0.3 mean improvement** AND **0 regressions** on existing cases
- Document in `_shared/.agents/CHANGELOG.md`

---

## Engine Hooks

```javascript
// After agent step
const evalResult = await runEvalJudge({
  agentId, output, rubric: loadRubric(agentId),
  goldenSubset: sampleGolden(agentId, n=3)
});

const decision = decideGate(agentId, evalResult.score);
// decision ∈ { "pass", "retry", "escalate" }

if (decision === "retry") return retryWithCritique(evalResult.critique);
if (decision === "escalate") return pauseForHuman(evalResult);
return proceed();
```

---

## Cross-References

- Eval framework: [`@../../../../_shared/eval/SPEC.md`](../../../../_shared/eval/SPEC.md)
- Failure catalogue: [`@../../../../_shared/eval/failure-modes.md`](../../../../_shared/eval/failure-modes.md)
- Cost budgets: [`@../../../../_shared/standards/cost-budgets.md`](../../../../_shared/standards/cost-budgets.md)
- Memory hygiene: [`@../../../../_shared/standards/memory-hygiene.md`](../../../../_shared/standards/memory-hygiene.md)

---
*Eval gates v1.0 — last updated 2026-04-26*
