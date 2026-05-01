# BD3 — Execute

> Terms signed → joint go-to-market. Build operational rhythm + tracking.

**Owner**: R-BIZ + R-MKT (joint marketing) + R-AM (joint sales).
**Cost target**: variable per partnership scope.

---

## Trigger

BD2 terms signed.

---

## Activities

| Step | Action | Owner |
|---|---|---|
| BD3.1 | Joint kickoff (60-min) — operational onboarding | CEO + partner CEO + R-BIZ |
| BD3.2 | Comms channel setup (shared Slack / Discord / email alias) | R-BIZ + R-OPS |
| BD3.3 | Tracking setup: UTM tags, attribution, deal pipeline visibility | R-MKT + R-FIN |
| BD3.4 | Joint asset brief → R-CONTENT pipeline (C0 entry) | R-MKT |
| BD3.5 | First joint deliverable (per partnership type — see §below) | varies |
| BD3.6 | Monthly sync cadence (30 min, COO-level) | COO + partner counterpart |
| BD3.7 | Quarterly review trigger booked (BD4) | calendar |

---

## First deliverable per partnership type

| Type | First joint deliverable | Timeline |
|---|---|---|
| **Referral** | Mutual customer list scan + 3 warm intro candidates | 2 weeks |
| **Co-sell** | 1 joint pitch deck + 1 joint webinar/talk | 4 weeks |
| **Integration** | Technical spike POC + 1 demo customer | 6-8 weeks |
| **Reseller** | Partner enablement training + 1 closed deal | 4-6 weeks |

---

## Operational rhythm

| Cadence | Activity | Attendees |
|---|---|---|
| Weekly | Slack/Discord async update — pipeline status, blockers | R-BIZ + partner counterpart |
| Bi-weekly | Joint deal review (if active joint pipeline) | R-AM + partner sales lead |
| Monthly | Operational sync (30 min) | COO + partner ops |
| Quarterly | BD4 strategic review (90 min) | CEO + COO + partner CEO |

---

<!-- @outputs -->
## Outputs

```
business-strategy/decisions/partnership/{partner-slug}/
├── BD3-kickoff-notes.md
├── BD3-tracking-setup.md            ← UTM + attribution config
├── BD3-gtm-{YYYY-Qn}.md              ← GTM calendar
└── BD3-deliverables/
    └── (per partnership type — co-branded asset, pitch deck, etc.)
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Slow start** (3+ weeks no activity post-kickoff) → escalate, partnership at risk
- **Tracking gap** (deals closed but attribution unclear) → can't verify partnership ROI; setup mandatory before first deal
- **One-sided effort** (studio pulling all weight) → quarterly review BD4 catches; renegotiate or sunset
- **Brand voice drift** (joint content sounds off-brand) → R-σ + R-MKT review per voice contract
- **Customer confusion** (who do they pay? who do they call?) → comms setup must be unambiguous before first deal
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| Voice contract per `voice-registry.yaml` for joint content | R-ORC-08 |
| Cross-project boundary: partner data ≠ studio's other client data | R-MAS-16 + boundaries.md §4 |
| Cost tracking attribution per partnership | learning-system.md velocity KPI |
<!-- /@harness-checkpoint -->

---

## Cross-References

- BD2 prev: [`@./BD2-TERMS.md`](BD2-TERMS.md)
- BD4 next: [`@./BD4-REVIEW.md`](BD4-REVIEW.md)
- Marketing co-branded campaign: [`@../marketing/M3-CAMPAIGN.md`](../marketing/M3-CAMPAIGN.md)
- R-MKT card: [`@../../../../_shared/.agents/tier-5-business/R-MKT-marketing.md`](../../../../_shared/.agents/tier-5-business/R-MKT-marketing.md)

---
*v1.0 — 2026-04-27.*
