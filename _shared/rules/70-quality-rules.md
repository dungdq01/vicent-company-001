---
file: 70-quality-rules
version: v1.0
last_updated: 2026-04-26
owner: CTO
status: production
---

# Quality Rules — Eval & DoD Enforcement

> Quality không phải optional. DoD = rules.

---

## R-QAL-01 — DoD is Binary

Each DoD item is **pass or fail**. No "mostly done". If unsure → fail.

> Auto-check: `validateDoD()` in engine sets phase to BLOCKED on any unchecked item.

DoD source: [`@../standards/dod-per-deliverable.md`](../standards/dod-per-deliverable.md) · [`@../../experience/workspace/docs/quality/DOD-CHECKLIST.md`](../../experience/workspace/docs/quality/DOD-CHECKLIST.md)

---

## R-QAL-02 — Eval Threshold MUST Be Met

Per `quality/EVAL-GATES.md`:

| Agent class | Pass threshold |
|---|---|
| R-α/β/γ (research) | ≥ 7.5 |
| R-σ (consolidation) | ≥ 8.0 |
| T2 engineering | ≥ 7.5 |
| T3 domain | ≥ 7.0 |
| T4 delivery | ≥ 7.5 |
| T5 business | ≥ 7.5 |
| R-QA · LLM golden set | ≥ 8.0 |

Below threshold → retry → escalate. MUST NOT bypass.

---

## R-QAL-03 — Golden Set Mandatory for LLM Components

Every LLM-touching deliverable MUST have golden set ≥ **20 cases** (`R-QA` enforces in P7):
- Inputs representing real distribution
- Expected outputs (pass criteria, not exact match for generative)
- Adversarial cases (≥ 3): edge · injection · OOD

Golden set drift → review per `EVAL-GATES.md` Golden-Set Regression Gate.

---

## R-QAL-04 — Cost Cap is a Quality Gate

Cost overrun = quality fail (signals inefficiency or scope drift). Per `_shared/standards/cost-budgets.md`:

| Scope | Target | Max |
|---|---|---|
| Single agent run | per skill card | per skill card × 1.5 |
| Project total (Sprint A) | per pricing | × 1.2 |
| Project total (Sprint D) | per pricing | × 1.2 |
| Daily LLM API | $50 | $100 (alert at $50) |
| Monthly | $1,000 | $1,500 (alert at $1,000) |

Beyond max → halt + CTO + CEO review.

---

## R-QAL-05 — No Self-Approval

Agent MUST NOT approve own deliverable for phase transition. Reviewer must be:
- Different agent (e.g., R-σ reviews R-α)
- Or human (CEO · COO · CTO per role)

Eval-judge model SHOULD be different family from generation when possible (e.g., GPT judges Claude).

---

## R-QAL-06 — Failure Mode Documentation

Every failure pattern observed MUST be:
1. Categorized per `_shared/eval/failure-modes.md`
2. If new pattern → add to catalogue
3. Mitigation strategy documented
4. Skill card updated if recurrent across ≥ 3 projects

> Failure without learning = failure twice.

---

## R-QAL-07 — Promotion Gate (Prompt v1.0 → v1.x)

To promote a prompt version MUST:
- Mean improvement ≥ **+0.3** on golden set
- **0 regressions** on existing cases
- Validation across ≥ **3 projects**
- CTO sign in `_shared/.agents/CHANGELOG.md`
- Diff posted to `#decisions`

No exception path.

---

## R-QAL-08 — Drift Detection

Production agents MUST have drift monitoring:

| Metric | Window | Alert |
|---|---|---|
| Eval score | 7-day rolling | drop > 0.5 |
| Cost / run | 7-day mean | rise > 30% |
| Failure mode count | 7-day | same mode ≥ 3× |
| Latency p95 | 7-day | rise > 50% |

Yellow → CTO investigates within 7 days. Red → halt agent + CTO/CEO review.

---

## R-QAL-09 — Retro Mandatory

Every closed project (won OR lost) MUST produce `99-retro.md`:
- Outcome vs goal (numbers)
- What worked
- What didn't
- Root cause
- Learnings (transferable)
- Action items (with owner)
- Memory promotion candidates

Within 7 days of P9 close OR S4-LOST. R-FIN blocks invoice closure if missing.

---

## R-QAL-10 — Memory Hygiene

Per `_shared/standards/memory-hygiene.md`:
- Each memory entry MUST be transferable (not "fixed bug X in project Y")
- MUST cite project + date + signer
- Old entries: review quarterly · archive if obsolete · keep canonical version
- MUST NOT bloat: ≤ 100 entries per baseline · ≤ 50 per industry

R-σ curates · CTO signs monthly review.

---

## R-QAL-11 — Quality Trumps Speed

When quality vs speed tradeoff arises:
- For client-facing deliverable: **quality wins** (escalate timeline if needed via SCR)
- For internal tooling: speed acceptable, document as tech debt
- For prompt promotion: **never** speed (full eval mandatory)

---

## R-QAL-12 — Continuous Improvement Loop

Quality system MUST loop:
```
Production data → drift detection → memory pattern → skill card update
       ↑                                                  ↓
       └────────────────── re-eval golden set ────────────┘
```

R-BIZ tracks loop velocity (memory promotions per quarter) as KPI.

---

## R-QAL-13 — Eval Independence

Eval judge MUST be independent of generator:
- Different model family (Claude judges GPT or vice versa)
- Or human + rubric
- MUST NOT use same prompt + same model to self-judge

Independent eval is the moat per `business-strategy/11-evaluation-framework.md`.

---

## R-QAL-14 — Anti-Patterns

- ❌ Tuning eval threshold to make a bad prompt "pass"
- ❌ Skipping golden set "because it's a small project"
- ❌ Promoting prompt without 3-project pattern proof
- ❌ Ignoring drift alerts > 7 days
- ❌ Single-metric optimization (cost-only · score-only)
- ❌ Self-approval
- ❌ "We'll add eval after launch"
- ❌ Anonymous DoD checks (always log who marked ✅)

---

## Quick Reference

```
QUALITY RULES (R-QAL):
01 DoD binary · 02 Eval threshold MUST · 03 Golden set ≥ 20
04 Cost cap = quality gate · 05 No self-approval · 06 Failure documented
07 Promotion gate · 08 Drift detection · 09 Retro mandatory
10 Memory hygiene · 11 Quality > speed · 12 Improvement loop
13 Eval independence · 14 Anti-patterns
```

---

## Cross-References

- DoD canonical: [`@../standards/dod-per-deliverable.md`](../standards/dod-per-deliverable.md)
- DoD checklist (operational): [`@../../experience/workspace/docs/quality/DOD-CHECKLIST.md`](../../experience/workspace/docs/quality/DOD-CHECKLIST.md)
- Eval framework: [`@../eval/SPEC.md`](../eval/SPEC.md)
- Eval gates: [`@../../experience/workspace/docs/quality/EVAL-GATES.md`](../../experience/workspace/docs/quality/EVAL-GATES.md)
- Cost budgets: [`@../standards/cost-budgets.md`](../standards/cost-budgets.md)
- Memory hygiene: [`@../standards/memory-hygiene.md`](../standards/memory-hygiene.md)
- Failure modes: [`@../eval/failure-modes.md`](../eval/failure-modes.md)
- Strategic eval framework: [`@../../business-strategy/11-evaluation-framework.md`](../../business-strategy/11-evaluation-framework.md)

---
*v1.0*
