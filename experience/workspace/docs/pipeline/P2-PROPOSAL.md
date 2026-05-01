# P2 — Proposal

> Formal proposal client signs. End of Sprint A delivery for outsource/POC.

**Canonical**: [`@../../../../business-strategy/13-product-delivery-process.md:226-279`](../../../../business-strategy/13-product-delivery-process.md)
**Prev**: [`P1-DISCOVERY.md`](P1-DISCOVERY.md) — **Next (gate)**: G1 SOW signature → [`P3-ARCHITECTURE.md`](P3-ARCHITECTURE.md)

---

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: PROPOSAL                                      │
│  Goal: Client-ready proposal + feasibility verdict      │
│  Duration: Day 8–14 (Sprint A)                          │
│  Engine cost target: $0.20–0.50                         │
│  Human involvement: HIGH (CEO + P3 polish + client)     │
└─────────────────────────────────────────────────────────┘
```

---

## Trigger
P1 done; discovery-report passes eval.

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| 2.1 | R-γ (Sentinel) | Feasibility scoring 30/30/20/20 — tech / market / cost / timeline. GO if ≥ 60. |
| 2.2 | R-σ (Scribe) | Generate executive summary (1 page) + detailed proposal (5–10 pages). |
| 2.3 | R-PM | Investment table + SOW skeleton from `_shared/templates/project/02-proposal.md`. |
| 2.4 | Human (P3) | Brand polish, tone personalization, team bios. |
| 2.5 | Human (CEO) | Technical accuracy + pricing review (30 min). |
| 2.6 | Human (P3) | Send to client; 14-day validity clock starts. |

---

## Outputs

```
projects/{PROJECT_ID}/02-proposal/
├── executive-summary.pdf       ← 1 page, client-facing
├── proposal.pdf                ← 5–10 pages, full
├── feasibility-scoring.md      ← internal (R-γ)
├── sow-template.docx           ← Statement of Work, ready to sign
└── investment-table.md         ← pricing breakdown
```

---

## Definition of Done

- ✅ Feasibility score **≥ 60** OR explicit NO-GO recommendation
- ✅ Proposal addresses **every** client constraint from `00-intake.md`
- ✅ Pricing aligns with [`@../../../../business-strategy/10-pricing.md`](../../../../business-strategy/10-pricing.md) tiers
- ✅ Validity date + countersign instructions clear
- ✅ CEO + P3 sign-off recorded in `meta/decisions.md`

---

## Decision Gate G1

**Pass condition**: Client signs SOW + 50% deposit within 14 days.

| Day | P3 action |
|---|---|
| Day 7 | First follow-up |
| Day 14 | Second follow-up; if no response → quote expires |
| Day 14+ | Re-quote requires updated discovery (paid second time) |

If signed → proceed P3. If declined → `99-retro.md` with NO-GO reason; insights may still feed knowledge layer.

---

<!-- @failure-modes -->
## Failure Modes
- **γ score 50–59 ambiguity**: produce *Conditional GO* with explicit risks list; let client decide.
- **Proposal jargon-heavy**: P3 must rewrite for non-technical buyer; engine outputs are draft only.
- **Pricing drift from canonical**: enforce `_shared/standards/cost-budgets.md` reference at generation time.
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

**Phase responsibility — bake harness profile into pricing + SOW scope.**

| Action | Detail | Rule |
|---|---|---|
| Profile as pricing line item | Proposal MUST list profile L0/L1/L2 explicitly. L2 = +30% on baseline tier (compliance + sandbox + 2nd approver overhead) | R-HRN-01 |
| SOW components matching profile | `02-sow.md` Scope section lists harness mandatory components per profile (manifest, guardrails, permanent-fix log, traces) — client knows what they pay for | R-HRN-01, R-HRN-05 |
| Approval chain in SOW | If L2: name 2nd approver + CTO/CEO signers per [`guardrails.yaml`](../../../../_shared/templates/project/harness/guardrails.yaml) approval matrix | R-HRN-11 |
| Cost cap explicit | Cost cap from profile manifest cited in SOW pricing rationale | R-HRN-01 + R-MAS-07 |

**Gate to P3**: proposal BLOCKED if profile not stated explicitly OR SOW lacks harness components matching profile mandatory list.

Cross-ref: [`@../../../../_shared/rules/80-harness-rules.md`](../../../../_shared/rules/80-harness-rules.md) §R-HRN-01, §R-HRN-11
<!-- /@harness-checkpoint -->

---

## Cross-References
- Pricing tiers: [`@../../../../business-strategy/10-pricing.md`](../../../../business-strategy/10-pricing.md)
- DoD: [`@../../../../_shared/standards/dod-per-deliverable.md`](../../../../_shared/standards/dod-per-deliverable.md)
- Scoring rubric: [`@../../../../_shared/eval/scoring-rubric.md`](../../../../_shared/eval/scoring-rubric.md)

---
*Pipeline v1.0 — last updated 2026-04-26*
