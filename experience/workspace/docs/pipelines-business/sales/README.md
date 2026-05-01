# sales/ — Sales Pipeline (S0–S5)

**Parent**: [`@../README.md`](../README.md)
**Canonical playbook**: [`@../../../../../business-strategy/12-sales-playbook.md`](../../../../../business-strategy/12-sales-playbook.md)
**Owner**: COO · **Agents**: R-SDR → R-AM → R-LEG

---

## Funnel Stages

| Stage | File | Goal | Owner |
|---|---|---|---|
| S0 | [`S0-PROSPECT.md`](S0-PROSPECT.md) | Build target list, initial outreach | R-SDR |
| S1 | [`S1-QUALIFY.md`](S1-QUALIFY.md) | BANT scoring, handoff or drop | R-SDR |
| S2 | [`S2-DISCOVERY.md`](S2-DISCOVERY.md) | Discovery call, scoping doc | R-AM |
| S3 | [`S3-PROPOSAL.md`](S3-PROPOSAL.md) | Proposal + pricing + SOW draft | R-AM + R-LEG |
| S4 | [`S4-CLOSE.md`](S4-CLOSE.md) | Negotiation, signature, deposit | R-AM + R-LEG |
| S5 | [`S5-HANDOFF.md`](S5-HANDOFF.md) | Handoff to product (P0) + CS (CS0) | R-AM → R-CS + R-PM |

---

## Funnel Diagram

```
[Lead pool]
    │  S0 PROSPECT (R-SDR outreach 3-touch)
    ▼
[Engaged lead]  ──no reply (D7)──▶ archive
    │  S1 QUALIFY (BANT scoring)
    ▼
[Qualified ≥ 60]  ──< 60──▶ nurture (newsletter)
    │  S2 DISCOVERY (call + scoping)
    ▼
[Scoped opportunity]  ──no fit──▶ politely decline
    │  S3 PROPOSAL (R-AM + R-LEG draft)
    ▼
[Proposal sent]  ──14 days no sign──▶ quote expires
    │  S4 CLOSE (negotiation, SOW + 50% deposit)
    ▼
[Closed-Won]
    │  S5 HANDOFF
    ▼
[Product P0] + [CS CS0] + [Finance F0]
```

---

## Conversion Targets (Phase 1)

| Stage | Conversion | Cumulative |
|---|---|---|
| Outreach → engaged | 8% | 8% |
| Engaged → qualified | 30% | 2.4% |
| Qualified → scoped | 60% | 1.4% |
| Scoped → proposal | 80% | 1.2% |
| Proposal → closed | 25% | 0.3% |

→ Để đạt 1 deal đóng/tháng: ~330 outreach/tháng = ~11/ngày.

---

## Cross-References

- Sales playbook: [`@../../../../../business-strategy/12-sales-playbook.md`](../../../../../business-strategy/12-sales-playbook.md)
- ICP: [`@../../../../../business-strategy/02-customer-segments.md`](../../../../../business-strategy/02-customer-segments.md)
- Pricing: [`@../../../../../business-strategy/10-pricing-sheet.md`](../../../../../business-strategy/10-pricing-sheet.md)
- R-SDR card: [`@../../../../../_shared/.agents/tier-5-business/R-SDR-sales-dev-rep.md`](../../../../../_shared/.agents/tier-5-business/R-SDR-sales-dev-rep.md)
- R-AM card: [`@../../../../../_shared/.agents/tier-5-business/R-AM-account-manager.md`](../../../../../_shared/.agents/tier-5-business/R-AM-account-manager.md)

---
*Last updated: 2026-04-26*
