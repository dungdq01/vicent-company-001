# E1 — Opportunity Scan

> E0 = 🟢 + signal → identify what's expandable. Top-3 ranked opportunities with confidence + justification.

**Owner**: R-CS + R-AM.
**Cost target**: $0.10-0.15.

---

## Trigger

E0 health classification = 🟢 with ≥ 1 expansion_hint signal.

---

## Activities

| Step | Action | Owner |
|---|---|---|
| E1.1 | Pull deliverables actually delivered (project's `deliverables_index`) | R-CS |
| E1.2 | Pull client-stated future needs (from E0 comms scan, QBR notes if retainer) | R-CS |
| E1.3 | Map gaps: what was OUT of original scope but client asked about | R-AM |
| E1.4 | Generate 3 opportunity types: upsell tier / cross-sell new scope / longer retainer | R-AM |
| E1.5 | Rank by: confidence × revenue × delivery feasibility | R-AM |
| E1.6 | Confidence ≥ 0.6 → recommend E2 pitch; < 0.6 → monitor only | R-AM |

---

## Opportunity taxonomy

| Type | Description | Pricing impact | Authority |
|---|---|---|---|
| **Upsell tier** | Sprint A → Sprint B (architecture) → Sprint D (full delivery) | Per pricing-sheet tier jump | COO |
| **Cross-sell scope** | New project ID for adjacent need | New SOW + DPA + project ID | COO; CEO if > $10K |
| **Longer retainer** | Monthly $500-2K for ops support | Retainer SOW per CS playbook §5 | COO |
| **Strategic alliance** | Co-development, joint product | ADR + R-LEG + CEO | CEO + ADR |

---

<!-- @outputs -->
## Outputs

```
projects/{id}/cs/E1-opportunities-{YYYY-MM}.md
```

```markdown
## Opportunities — {{client-id}} · {{YYYY-MM}}

### #1 (highest confidence) · {{type}}: {{slug}}
**Description**: 1-sentence summary
**Evidence**: client said X (DM 2026-04-20), referenced Y in QBR
**Estimated value**: $X
**Confidence**: 0.85
**Delivery feasibility**: capacity available within 30 days
**Recommended pitch angle**: ...

### #2 · {{type}}: {{slug}}
...

### #3 · {{type}}: {{slug}}
...

### Recommendation
→ Pitch #1 in next QBR (booked 2026-05-15)
→ #2 follow-up if #1 declines
→ #3 monitor — wait for explicit signal
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Force-fit opportunity** (creating need that doesn't exist) → R-MAS-15 honesty bias; if client's statements weak signal → don't push
- **Underestimate delivery cost** of cross-sell → R-AM consult R-PM before E2 pitch
- **Miss strategic alliance signal** (treats as cross-sell) → escalate CEO when type unclear
- **Pitch all 3 at once** (overwhelming client) → enforce: 1 primary pitch, others = future options
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| Cross-project boundary | R-MAS-16 — opportunities specific to THIS client; don't reference Project B's data |
| Confidence calibration | R-HRN-08 envelope; flag confidence > 0.9 for human verify (over-confidence pattern) |
<!-- /@harness-checkpoint -->

---

## Cross-References

- E0 prev: [`@./E0-HEALTH-CHECK.md`](E0-HEALTH-CHECK.md)
- E2 next: [`@./E2-PITCH.md`](E2-PITCH.md)
- Pricing tiers: [`@../../../../business-strategy/10-pricing-sheet.md`](../../../../business-strategy/10-pricing-sheet.md)
- Sales playbook: [`@../../../../business-strategy/12-sales-playbook.md`](../../../../business-strategy/12-sales-playbook.md)

---
*v1.0 — 2026-04-27.*
