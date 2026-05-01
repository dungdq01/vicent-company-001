# BD4 — Review

> Quarterly partnership health review. 3 outcome branches: continue / renegotiate / sunset. **Includes anti-channel-conflict resolution + sunset playbook**.

**Owner**: CEO + COO + partner counterpart.
**Cadence**: quarterly (Q1 mid-Mar, Q2 mid-Jun, ...).
**Cost target**: $0.15-0.25 per review.

---

## Trigger

Quarterly per partnership active.

---

## Activities

| Step | Action | Owner |
|---|---|---|
| BD4.1 | Pull partnership metrics (deals, revenue, attribution, joint customer count) | R-FIN + R-BIZ |
| BD4.2 | Joint pipeline contribution actual vs target (per BD2 terms) | R-BIZ |
| BD4.3 | Relationship health (qualitative): comms quality, mutual respect, cultural fit | CEO + COO |
| BD4.4 | 90-min joint review meeting | CEO + COO + partner CEO |
| BD4.5 | Decision: continue / renegotiate / sunset | CEO sign |
| BD4.6 | If continue → schedule next BD4 + book next joint deliverable | R-BIZ |
| BD4.7 | If renegotiate → trigger BD2 with adjusted terms | R-LEG |
| BD4.8 | If sunset → execute sunset playbook (§below) | CEO + R-LEG |

---

## Channel conflict resolution rules (operational)

When channel conflict surfaces between BD reviews:

| Conflict scenario | Resolution rule |
|---|---|
| Reseller partner + studio direct sales same prospect | Per BD2 tier separation by deal size — partner < $X, direct ≥ $X |
| 2 partners contact same prospect | First-touch attribution wins (90-day window from first outreach) |
| Customer asks studio direct after partner intro | Studio refers back to partner; explicit decline by partner needed to take over |
| Studio's existing customer offered partner's competing service | Block — studio respect customer's existing relationship; defer to customer choice |
| Joint pitch wins → execution split unclear | Per BD2 default: studio = technical, partner = relationship; revenue split per terms |

**Escalation**: if rule unclear OR partner disputes → CEO + partner CEO meeting within 7 days. Document outcome in `partnership/{partner-slug}/conflicts/{date}-{slug}.md`.

---

## Sunset playbook (when BD4 = sunset)

| Step | Action | Timeline |
|---|---|---|
| 1 | Joint sunset announcement (NOT acrimonious) | Day 0 |
| 2 | Customer transition: clients served via partner have **90-day continuity SLA** | Day 0-90 |
| 3 | IP separation per BD2 terms (default: studio retains, partner license expires Day 90) | Day 30-90 |
| 4 | Brand retraction: remove partner from website + case studies + sales decks within 30 days | Day 0-30 |
| 5 | Comms channel wind-down (Slack/Discord) — archive but preserve | Day 60 |
| 6 | Joint customers notified per agreed script — neutral tone | Day 0-7 |
| 7 | Final review meeting (60 min) with retro lessons | Day 90 |
| 8 | ADR closure: ADR-{NNNN}-partnership-{slug}-sunset | Day 90 |
| 9 | Promote retro lessons to `studio/wisdom/what-we-learned.md` (anonymized) | Day 90 |

**Cooldown**: avoid re-engaging same partner < 12 months unless explicit signal (different leadership, etc.).

---

<!-- @outputs -->
## Outputs

```
business-strategy/decisions/partnership/{partner-slug}/
├── BD4-review-{YYYY-Qn}.md           ← quarterly review notes
├── BD4-decision-{YYYY-Qn}.md          ← continue / renegotiate / sunset
└── (if sunset)
    ├── BD4-sunset-plan.md
    ├── BD4-sunset-customer-comms.md
    └── ADR-{NNNN}-partnership-{slug}-sunset.md
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Skip quarterly review** (assume working = stop checking) → review mandatory regardless of partnership health
- **Sunset without retro** → R-QAL-09 retro mandatory; lessons promote
- **Brand retraction missed** (partner still on website 6 months later) → 30-day SLA; R-MKT enforce
- **Customer transition gap** (clients confused about who handles their case) → 90-day continuity SLA strict; comms to clients direct
- **IP entanglement disputes** (jointly-developed asset claim) → per BD2 terms; if ambiguous → R-LEG mediation
- **Channel conflict rule disputes** → CEO + partner CEO meeting within 7 days; KHÔNG ad-hoc
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| ADR closure mandatory at sunset | R-MAS-14 |
| Customer continuity SLA 90 days | DPA + customer-facing contract honored regardless of partner relationship |
| Sunset retro to wisdom | learning-system.md §3 + R-MAS-05 promotion |
| Lifecycle sunset rule | per `_shared/rules/90-lifecycle-rules.md` §sunset path entry for partnership |
<!-- /@harness-checkpoint -->

---

## Cross-References

- BD3 prev: [`@./BD3-EXECUTE.md`](BD3-EXECUTE.md)
- Lifecycle sunset (parent rule): [`@../../../../_shared/rules/90-lifecycle-rules.md`](../../../../_shared/rules/90-lifecycle-rules.md)
- ADR pattern: [`@../../../../_shared/standards/decision-log-index.md`](../../../../_shared/standards/decision-log-index.md)
- Studio wisdom (sunset retro): [`@../../../../studio/wisdom/what-we-learned.md`](../../../../studio/wisdom/what-we-learned.md)

---
*v1.0 — 2026-04-27. Includes anti-channel-conflict + sunset playbook per boss feedback Gap 3.*
