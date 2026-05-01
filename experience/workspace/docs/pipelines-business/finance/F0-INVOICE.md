# F0 — Invoice + Collection

> Trigger per milestone. AR aging cadence.

**Owner**: COO · **Agent**: R-FIN

---

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| F0.1 | R-AM (close) → R-FIN | Trigger: SOW signed → 50% deposit invoice |
| F0.2 | R-PM (P9) → R-FIN | Trigger: P9 acceptance → 50% final invoice |
| F0.3 | R-FIN | Generate PDF: SOW ref · line items · tax (VAT 10% VN) · Net 30 |
| F0.4 | Human (COO) | Review + send |
| F0.5 | R-FIN | Track payment: D7 reminder · D14 escalate · D28 final notice |
| F0.6 | R-FIN | D30+ → flag COO; D45+ → flag CEO + R-LEG |

## Reminder Cadence

| Day | Action | Owner |
|---|---|---|
| D-3 | Pre-due gentle reminder | R-FIN |
| D0 | Due date | — |
| D+7 | First overdue notice | R-FIN |
| D+14 | Second notice + COO Slack alert | R-FIN |
| D+21 | Third notice + COO call | Human |
| D+30 | Late fee + R-LEG notified | R-FIN |
| D+45 | Collection action discussion | CEO + R-LEG |

## Outputs
```
projects/_business/finance/invoices/
├── INV-{YYYYMM}-{NNN}.pdf
├── invoice-log.md
├── ar-aging-{YYYY-WW}.md
└── collections/
    └── {invoice-id}-collection-trail.md
```

## Definition of Done
- ✅ Invoice matches SOW pricing (zero pricing errors)
- ✅ Invoice sent within **24h** of trigger event
- ✅ AR aging refreshed weekly
- ✅ D7/14/28 reminder cron 100% fire
- ✅ Currency clear (USD + VND with FX rate)

## Failure Modes
- **Pricing mismatch**: hard block; escalate R-AM
- **Missed reminder cron**: monitoring alert, manual fire
- **Currency confusion**: always show both
- **Net 30 ignored**: aging cron escalates automatically

---
*v1.0*
