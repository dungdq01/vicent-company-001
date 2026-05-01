# S1 — Qualify

> BANT + Fit scoring. Pass ≥ 60 → R-AM. Else nurture or drop.

**Canonical**: [`@../../../../../business-strategy/12-sales-playbook.md:44`](../../../../../business-strategy/12-sales-playbook.md)
**Prev**: [`S0-PROSPECT.md`](S0-PROSPECT.md) · **Next**: [`S2-DISCOVERY.md`](S2-DISCOVERY.md)
**Owner**: COO · **Agent**: R-SDR

---

```
┌──────────────────────────────────────────────────────────┐
│  S1: QUALIFY                                             │
│  Goal: BANT score, decide handoff or nurture             │
│  Trigger: lead replies to outreach                       │
│  Engine cost: $0.02/lead                                 │
│  Human time: 5 min/qualified lead (sanity check)         │
└──────────────────────────────────────────────────────────┘
```

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| S1.1 | R-SDR | Parse reply → extract Budget · Authority · Need · Timeline + Fit signals. |
| S1.2 | R-SDR | Score 0-100. Threshold ≥ 60. |
| S1.3 | Human (COO) | 5-min sanity-check on borderline (55-65). |
| S1.4 | R-SDR | If pass → produce `handoff-to-AM.md`; if fail → assign nurture stream (newsletter). |

## BANT + Fit Rubric

| Dimension | Weight | Source |
|---|---|---|
| Budget signal | 25 | mentioned ≥ approximate range |
| Authority | 20 | role = decision-maker or champion |
| Need (pain match ICP) | 25 | clear pain matched to studio capability |
| Timeline | 15 | < 6 months stated or implied |
| Fit (industry · scale · culture) | 15 | aligned with `02-customer-segments` |

## Outputs

```
projects/_business/sales/leads/{LEAD_ID}/
├── qualification-notes.md       ← BANT scoring + rationale
└── handoff-to-AM.md OR nurture-tag.md
```

## Definition of Done
- ✅ Score documented with **per-dimension rationale** (no naked number)
- ✅ Borderline (55-65) flagged for human
- ✅ AM-rejection rate < **30%** (else SDR over-qualifying)
- ✅ Nurture stream tagged for low-fit ones (don't just drop)

## Failure Modes
- **Inflation**: SDR wants pass-through → 10% audit by COO.
- **Authority confusion**: respondent ≠ buyer → require explicit champion identification.
- **Budget hallucination**: no signal → mark "unknown" not "estimated".

## Cross-References
- BANT spec: [`@../../../../../business-strategy/12-sales-playbook.md:44`](../../../../../business-strategy/12-sales-playbook.md)
- Handoff to: [`@../../../../../_shared/.agents/tier-5-business/R-AM-account-manager.md`](../../../../../_shared/.agents/tier-5-business/R-AM-account-manager.md)

---
*v1.0*
