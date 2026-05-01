# CS1 — Deliver (Ongoing)

> Active project phase support. CS owns relationship; PM owns delivery.

**Canonical**: [`@../../../../../business-strategy/14-customer-success-playbook.md:78`](../../../../../business-strategy/14-customer-success-playbook.md)
**Owner**: COO · **Agents**: R-CS + R-PM coordination

---

## Cadence

| Frequency | Owner | Activity |
|---|---|---|
| Daily (async) | R-CS + R-PM | Slack channel monitoring · 1st response < 24h |
| Weekly | Human + R-CS | 30-min sync (Tue or Thu) · status update doc |
| Weekly | R-CS | Health score recompute |
| Bi-weekly | R-PM | Demo of in-progress work |
| Monthly | R-CS | NPS micro-pulse (1 question) |
| Per phase end | R-CS + R-PM | Phase sign-off coordination (P1, P2, P5, P9) |

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| CS1.1 | R-CS | Generate weekly status from R-PM updates · sentiment from Slack |
| CS1.2 | R-CS | Compute health (adoption · sentiment · engagement · payment) |
| CS1.3 | R-CS | If yellow → schedule extra sync · alert COO |
| CS1.4 | R-CS | If red → CS3 churn-save mode immediately |
| CS1.5 | R-CS | Capture expansion signals (mentions of Phase 2 needs) |

## Outputs
```
projects/{PROJECT_ID}/_cs/
├── weekly/
│   ├── status-{YYYY-WW}.md
│   └── health-{YYYY-WW}.md
└── signals/
    └── expansion-signals.md
```

## Definition of Done
- ✅ Weekly status delivered every Friday EOD
- ✅ Health score updated weekly (no gaps)
- ✅ 1st response < **24h** to all client messages
- ✅ Yellow flag → action within **48h**
- ✅ Red flag → COO + CEO alert within **4h**

## Failure Modes
- **Silent client = green assumption**: > 7 days no response = yellow auto-flag
- **Health score false-green**: enforce qualitative annotation per check-in
- **Demo skipped under deadline**: re-prioritize; demo is risk-detection, not optional
- **Scope creep tolerance**: every "small ask" → SCR check

---
*v1.0*
