# P1 — Discovery

> Deep understanding of the problem space, gather constraints, identify SOTA.

**Canonical source**: [`@../../../../business-strategy/13-product-delivery-process.md:174-224`](../../../../business-strategy/13-product-delivery-process.md)
**Prev**: [`P0-INTAKE.md`](P0-INTAKE.md) — **Next**: [`P2-PROPOSAL.md`](P2-PROPOSAL.md)

---

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: DISCOVERY                                     │
│  Goal: Understand problem deeply; surface SOTA + risks  │
│  Duration: Day 3–7 (Sprint A) | Day 3–10 (Sprint B+)    │
│  Engine cost target: $0.30–1.00                         │
│  Human involvement: MEDIUM (CEO sanity-check 30–60 min) │
└─────────────────────────────────────────────────────────┘
```

---

## Trigger
P0 decision = `proceed` (intake approved + brief generated).

## Goal
Produce a **discovery report** rich enough that proposal (P2) and architecture (P3) can be drafted without re-discussing fundamentals.

---

## Engine Orchestration

| Step | Agent | Action | Skill card |
|---|---|---|---|
| 1.1 | R-α (Archon) | Pull / refresh baseline knowledge for matched B0X. If L < 3 → trigger Mode A re-research. | [`@../../../../_shared/.agents/tier-1-research/R-alpha-research.md`](../../../../_shared/.agents/tier-1-research/R-alpha-research.md) |
| 1.2 | R-β (Praxis) | Industry + SOTA web search; competing solutions; VN-specific constraints. | [`@../../../../_shared/.agents/tier-1-research/R-beta-tech.md`](../../../../_shared/.agents/tier-1-research/R-beta-tech.md) |
| 1.3 | R-Dxx | Domain context — pull I0Z deep-node, map pain to known patterns. | [`@../../../../_shared/.agents/tier-3-domain/R-Dxx-template.md`](../../../../_shared/.agents/tier-3-domain/R-Dxx-template.md) |
| 1.4 | R-σ | Consolidate α+β+Dxx into single report (no synthesis loss). | [`@../../../../_shared/.agents/tier-1-research/R-sigma-scribe.md`](../../../../_shared/.agents/tier-1-research/R-sigma-scribe.md) |
| 1.5 | Human (CEO) | Sanity-check ML model recommendations + cost estimate per Scope tier. | — |

**Optional**: client data review + stakeholder interview (P3 conducts, 30 min each).

---

## Inputs
- `projects/{id}/00-intake.md` (project brief)
- `projects/{id}/_metadata/gap-pre-scan.json` (from P0.2b)
- `knowledge/data/baselines/B0X.json` + `industries/I0Y.json`
- Matrix node `B0X-I0Y.json` (if exists)

## Outputs

```
projects/{PROJECT_ID}/01-discovery/
├── discovery-report.md         ← 8–15 pages, R-σ consolidate
├── research-notes-alpha.md     ← raw R-α output
├── research-notes-beta.md      ← raw R-β output
└── domain-notes-Dxx.md         ← raw R-Dxx output
```

**discovery-report.md sections**: Problem deep-dive · SOTA landscape · Recommended approach · Risk + mitigation · Data requirements · Estimated effort + cost.

---

## Definition of Done

- ✅ Discovery report passes R-eval ≥ **7.5/10** (rubric: [`@../../../../_shared/eval/scoring-rubric.md`](../../../../_shared/eval/scoring-rubric.md))
- ✅ ≥ **3 SOTA references** cited (verifiable URLs / DOIs)
- ✅ Risk section ≥ **5 risks** with mitigation
- ✅ Cost estimate within **±20%** of post-mortem actuals (track in retro)
- ✅ CEO signs off on technical recommendations
- ✅ P3 (founder) reviews for client readability

Full DoD reference: [`@../../../../_shared/standards/dod-per-deliverable.md`](../../../../_shared/standards/dod-per-deliverable.md)

---

<!-- @failure-modes -->
## Failure Modes
- **L4 gap leaked from P0** → α exhausts search budget without converging. *Mitigation*: escalate to human, expand budget per `eval/SPEC.md`.
- **β surfaces conflicting SOTA** → no clear winner. *Mitigation*: γ runs early feasibility pass to break ties.
- **Domain expert hallucination** → unverifiable industry claims. *Mitigation*: enforce citation rule in R-Dxx template.
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

**Phase responsibility — read profile, size discovery effort accordingly.** No harness mutation in P1 itself.

| Action | Detail | Rule |
|---|---|---|
| Read profile from P0 | `_meta.json.harness_profile` informs research scope | R-HRN-01 |
| Profile-aware research budget | L2 Critical → +30% budget for security / compliance / regulatory research (PDPA, NĐ 13, GDPR, HIPAA-equivalent VN) | R-HRN-01 |
| Discovery report MUST cite profile | Include "Harness profile: {L0\|L1\|L2}" in scope section so downstream phases know constraints | R-HRN-05 |

**Gate to P2**: discovery report MUST state profile + name regulatory regime applicable (or "none").

Cross-ref: [`@../../../../_shared/rules/80-harness-rules.md`](../../../../_shared/rules/80-harness-rules.md) §R-HRN-01
<!-- /@harness-checkpoint -->

---

## Cross-References
- Canonical phase spec: [`@../../../../business-strategy/13-product-delivery-process.md:174-224`](../../../../business-strategy/13-product-delivery-process.md)
- Eval rubric: [`@../../../../_shared/eval/scoring-rubric.md`](../../../../_shared/eval/scoring-rubric.md)
- Failure catalogue: [`@../../../../_shared/eval/failure-modes.md`](../../../../_shared/eval/failure-modes.md)
- Engine context loader: [`@../../AGENT-WORKSPACE-PIPELINE.md:433-470`](../../AGENT-WORKSPACE-PIPELINE.md)

---
*Pipeline v1.0 — last updated 2026-04-26*
