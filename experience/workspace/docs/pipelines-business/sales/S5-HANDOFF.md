# S5 — Handoff

> Sales → Product (P0) + CS (CS0) + Finance (F0). Triple handoff, single trigger.

**Prev**: [`S4-CLOSE.md`](S4-CLOSE.md) · **Next (downstream)**: P0 / CS0 / F0
**Owner**: COO · **Agents**: R-AM → R-PM + R-CS + R-FIN

---

```
┌──────────────────────────────────────────────────────────┐
│  S5: HANDOFF                                             │
│  Goal: Smooth context transfer to delivery + CS          │
│  Duration: D0-D2 from close                              │
│  Engine cost: $0.05-0.10                                 │
│  Human time: 1h kickoff sync (internal + external)       │
└──────────────────────────────────────────────────────────┘
```

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| S5.1 | R-AM | Generate `client-context-pack.md` — every signal/quote/concern from S0-S4. |
| S5.2 | R-AM → R-PM | Trigger product P0 (intake) with pack as input. |
| S5.3 | R-AM → R-CS | Trigger CS CS0 (onboarding) — kickoff scheduling. |
| S5.4 | R-AM → R-FIN | Confirm deposit collected; F0 trigger for invoice cycle. |
| S5.5 | Human (COO + AM + CS lead + PM) | 30-min internal handoff sync. |
| S5.6 | Human (CS + client) | Kickoff call scheduled within 5 business days. |

## Outputs

```
projects/{PROJECT_ID}/_meta/
├── client-context-pack.md       ← from S5.1
├── handoff-checklist.md         ← all 3 receivers ack'd
└── kickoff-calendar.ics
```

## Definition of Done
- ✅ Context pack covers: stated needs · unstated signals · stakeholder map · sensitivities · success criteria
- ✅ All 3 receivers (PM · CS · FIN) ack'd handoff in `handoff-checklist.md`
- ✅ Kickoff scheduled within **5 business days** of close
- ✅ Internal handoff sync recorded
- ✅ AM remains *escalation contact* for first 30 days (warm handoff, not cliff)

## Failure Modes
- **Cliff handoff**: AM disappears post-close. Mitigation: AM stays on shared Slack channel 30 days.
- **Context pack thin**: only restates SOW. Require ≥ 5 unstated signals captured.
- **Kickoff delay > 7 days**: client momentum drops; alert COO.
- **Stakeholder map outdated**: re-confirm in kickoff call.

## Cross-References
- R-AM card: [`@../../../../../_shared/.agents/tier-5-business/R-AM-account-manager.md`](../../../../../_shared/.agents/tier-5-business/R-AM-account-manager.md)
- R-CS card: [`@../../../../../_shared/.agents/tier-5-business/R-CS-customer-success.md`](../../../../../_shared/.agents/tier-5-business/R-CS-customer-success.md)
- Product P0: [`@../../pipeline/P0-INTAKE.md`](../../pipeline/P0-INTAKE.md)
- CS CS0: [`@../customer-success/CS0-ONBOARD.md`](../customer-success/CS0-ONBOARD.md)
- Finance F0: [`@../finance/F0-INVOICE.md`](../finance/F0-INVOICE.md)

---
*v1.0*
