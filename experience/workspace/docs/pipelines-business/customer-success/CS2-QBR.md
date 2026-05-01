# CS2 — Quarterly Business Review (Retainer Only)

> Outcomes review + roadmap forward + expansion pitch.

**Canonical**: [`@../../../../../business-strategy/14-customer-success-playbook.md:192`](../../../../../business-strategy/14-customer-success-playbook.md)
**Trigger**: Q boundary, retainer clients only · **Cadence**: Quarterly
**Owner**: COO · **Agent**: R-CS (+ R-BIZ for strategic input)

---

```
┌──────────────────────────────────────────────────────────┐
│  CS2: QBR                                                │
│  Goal: Demonstrate value · plan ahead · expand            │
│  Duration: 2-week prep + 60-min meeting                  │
│  Engine cost: $0.12 (deck) + $0.05 (analysis)            │
│  Human time: 4h prep + 1h meeting + 30min follow-up     │
└──────────────────────────────────────────────────────────┘
```

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| CS2.1 | R-CS | Pull last-quarter outcomes: deliverables shipped, KPIs moved, savings/revenue lift |
| CS2.2 | R-BIZ | Analyze health trend, expansion opportunity, risk |
| CS2.3 | R-CS | Generate QBR deck per `14-CS §6` (10-15 slides) |
| CS2.4 | Human (COO) | 1h prep review |
| CS2.5 | Human (COO + client) | 60-min meeting |
| CS2.6 | R-CS | Follow-up doc within 24h: agreed actions, expansion proposal if signal |

## QBR Deck Sections (per 14-CS §6)
1. Last quarter outcomes (vs goals)
2. KPI dashboard
3. What worked, what didn't (honest)
4. Roadmap next quarter
5. Risks + asks
6. Expansion proposal (if green health + signal)

## Outputs
```
projects/{PROJECT_ID}/_cs/qbr/
├── qbr-deck-Qx-YYYY.pdf
├── qbr-meeting-notes.md
├── action-items.md
└── expansion-proposal.md     ← if applicable
```

## Definition of Done
- ✅ Deck delivered to client **2 days before meeting** (not at meeting)
- ✅ KPI numbers verified by R-FIN / R-PM (no inflation)
- ✅ "What didn't work" section non-empty (honesty signal)
- ✅ Action items assigned with owner + date
- ✅ NPS post-QBR ≥ 8

## Failure Modes
- **Pure status report**: missing forward + expansion → template enforces sections
- **KPI inflation**: numbers don't reconcile with R-FIN → block
- **No "what didn't work"**: trust killer; require ≥ 1 honest item
- **Expansion forced where no signal**: feels salesy; expansion only if green health

## Cross-References
- QBR template: [`@../../../../../business-strategy/14-customer-success-playbook.md:192`](../../../../../business-strategy/14-customer-success-playbook.md)

---
*v1.0*
