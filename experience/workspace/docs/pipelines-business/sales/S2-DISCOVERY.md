# S2 — Discovery

> Discovery call (30 min) → scoping doc.

**Canonical**: [`@../../../../../business-strategy/12-sales-playbook.md:69`](../../../../../business-strategy/12-sales-playbook.md)
**Prev**: [`S1-QUALIFY.md`](S1-QUALIFY.md) · **Next**: [`S3-PROPOSAL.md`](S3-PROPOSAL.md)
**Owner**: COO · **Agent**: R-AM (+ optional R-SA for technical deals)

---

```
┌──────────────────────────────────────────────────────────┐
│  S2: DISCOVERY                                           │
│  Goal: Scoped opportunity, scope tier (A/B/C/D) decided  │
│  Duration: D0-D3 from qualified                          │
│  Engine cost: $0.10-0.15                                 │
│  Human time: 30 min call + 30 min review                 │
└──────────────────────────────────────────────────────────┘
```

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| S2.1 | R-AM | Pre-call: parse handoff + lead profile → 8-12 personalized discovery questions per `12-sales §3`. |
| S2.2 | Human (COO/CEO) | 30-min discovery call (Zoom/Meet, recorded). |
| S2.3 | R-AM | Post-call: parse transcript → structured notes (problem · current state · stakeholders · timeline · budget signal · decision criteria). |
| S2.4 | R-AM | Match to scope tier A/B/C/D from `10-pricing-sheet.md`. |
| S2.5 | R-AM | Produce `scoping-doc.md` per `12-sales §4`. |
| S2.6 | Human (COO) | 30-min review; approve scope or request re-call. |

## Outputs

```
projects/_business/sales/leads/{LEAD_ID}/
├── discovery-call-script.md
├── discovery-notes.md
├── scoping-doc.md               ← per 12-sales §4
└── stakeholder-map.md           ← economic buyer + champion + blocker
```

## Definition of Done
- ✅ Stakeholder map identifies **economic buyer + champion** (≥ 2 people)
- ✅ Scope tier (A/B/C/D) selected with rationale
- ✅ Scoping doc has measurable success criteria
- ✅ Out-of-scope explicitly listed (anti-creep)
- ✅ COO reviewed within 24h of call

## Failure Modes
- **No champion identified**: deal stalls; require named champion before S3.
- **Scope inflation in call**: client adds wishlist; AM must capture and tag "out-of-scope" not silent-include.
- **Tier mismatch**: $30 PDF need but Tier-D engineering proposed → CEO override required.
- **Missing budget signal**: don't proceed to S3 without ≥ ballpark; ask explicitly.

## Cross-References
- Discovery template: [`@../../../../../business-strategy/12-sales-playbook.md:69`](../../../../../business-strategy/12-sales-playbook.md)
- Scoping template: [`@../../../../../business-strategy/12-sales-playbook.md:117`](../../../../../business-strategy/12-sales-playbook.md)
- Pricing tiers: [`@../../../../../business-strategy/10-pricing-sheet.md`](../../../../../business-strategy/10-pricing-sheet.md)

---
*v1.0*
