# CS0 — Onboard

> First 7 days. Set tone for the entire relationship.

**Canonical**: [`@../../../../../business-strategy/14-customer-success-playbook.md:22`](../../../../../business-strategy/14-customer-success-playbook.md)
**Trigger**: S5 handoff · **Next**: CS1
**Owner**: COO · **Agent**: R-CS

---

```
┌──────────────────────────────────────────────────────────┐
│  CS0: ONBOARD (D0-D7)                                    │
│  Goal: Client feels in safe hands                         │
│  Engine cost: $0.08                                      │
│  Human time: 1h kickoff + 30 min D7 check-in             │
└──────────────────────────────────────────────────────────┘
```

## Engine Orchestration

| Day | Step | Agent | Action |
|---|---|---|---|
| D0 | Welcome kit | R-CS | Email with: kickoff agenda · Slack channel invite · key contacts · 7-day plan · expectations doc |
| D1-2 | Kickoff call | Human | 1h call: align scope · success metrics · escalation path · cadence |
| D3-4 | Setup | R-CS + Human | Notion project page · shared Slack · access provisioning |
| D5 | First update | R-CS | Status update template per `14-CS §3` |
| D7 | Check-in | Human + R-CS | 30-min review: any concerns? expectations match? |

## Inputs
- `client-context-pack.md` from S5
- Signed SOW · scope tier
- Stakeholder map

## Outputs
```
projects/{PROJECT_ID}/_cs/
├── welcome-kit.md
├── kickoff-call-notes.md
├── 7-day-plan.md
├── d5-status.md
└── d7-checkin.md
```

## Definition of Done
- ✅ Welcome kit sent within **24h** of S5 close
- ✅ Kickoff call completed by **D2**
- ✅ Slack channel + Notion live by **D3**
- ✅ D7 check-in shows green or escalates yellow
- ✅ Initial NPS pulse (optional) at D7

## Failure Modes
- **Welcome kit delay > 48h**: client momentum drops; alert COO.
- **Kickoff call no-show**: reschedule once, then escalate to R-AM (warm handoff).
- **D7 silence**: assume yellow, schedule sync.
- **Scope drift in kickoff**: client adds wishlist → SCR per `13 §5`, not silent-include.

## Cross-References
- Onboarding template: [`@../../../../../business-strategy/14-customer-success-playbook.md:22`](../../../../../business-strategy/14-customer-success-playbook.md)

---
*v1.0*
