# E2 — Pitch

> Craft custom proposal for selected opportunity. Reuse 12-sales §5 template adapted to existing relationship context.

**Owner**: R-AM.
**Cost target**: $0.15-0.20.

---

## Trigger

E1 opportunity #1 selected for active pitch.

---

## Activities

| Step | Action | Owner |
|---|---|---|
| E2.1 | Read E1 output + project history + QBR notes | R-AM |
| E2.2 | Adapt 12-sales §5 proposal template — emphasize CONTINUITY (not first-meet) | R-AM |
| E2.3 | Pricing per `pricing-decisions.md` matrix; if discount > 15% → COO sign | R-AM |
| E2.4 | Schedule pitch call (in-person if retainer, async deck if Sprint upsell) | R-AM + P3 |
| E2.5 | Send proposal — track open/engagement | R-AM |
| E2.6 | If objection → use objection-responses.md (12-sales §6) adapted to relationship | R-AM |

---

## Pitch tone differences vs first-meet

| Element | First-meet (Path A) | Expansion pitch (E2) |
|---|---|---|
| Opening | "We discovered X..." | "Building on what we shipped, we noticed Y..." |
| Discovery | Full BANT+Fit | Skip — already qualified |
| Value prop | Generic + ICP fit | Specific + outcome from prior project |
| Risk discussion | Hypothetical | Cite ACTUAL risks discovered + mitigated last project |
| Pricing | Standard tier | Often "loyalty discount" 5-10% (within hard rule §15%) |
| Call to action | Schedule POC | Sign retainer / new SOW |

---

<!-- @outputs -->
## Outputs

```
projects/{id}/cs/E2-pitch-{YYYY-MM}/
├── proposal-draft.md       ← per 12-sales §5 adapted
├── pitch-deck.md           ← if visual presentation
└── objection-prep.md       ← anticipated objections + responses
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Generic proposal** (template fill-in) → require ≥ 5 specific references to past project deliverables/insights
- **Pricing inconsistency** (discount applied without ADR) → R-AM card hard rule enforce
- **Missing economic buyer** (proposal sent to wrong person) → verify buyer hierarchy from QBR notes
- **Ignore prior-project lessons** (didn't reference what worked / what we learned) → R-σ review checklist
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| Reuse skill_overrides from prior project | R-HRN-03 versioning |
| Pin existing knowledge depth for continuity | R-HRN-04 |
<!-- /@harness-checkpoint -->

---

## Cross-References

- E1 prev: [`@./E1-OPPORTUNITY-SCAN.md`](E1-OPPORTUNITY-SCAN.md)
- E3 next: [`@./E3-CLOSE-OR-RENEW.md`](E3-CLOSE-OR-RENEW.md)
- Sales close playbook: [`@../../../../business-strategy/12-sales-playbook.md`](../../../../business-strategy/12-sales-playbook.md) §5-§7
- R-AM card: [`@../../../../_shared/.agents/tier-5-business/R-AM-account-manager.md`](../../../../_shared/.agents/tier-5-business/R-AM-account-manager.md)

---
*v1.0 — 2026-04-27.*
