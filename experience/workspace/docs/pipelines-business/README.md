# pipelines-business/ — Business Operations Pipelines

**Parent**: [`@../../README.md`](../../README.md) (engine workspace)

---

## Mục đích

Pipeline `P0-P9` ở folder `pipeline/` lo *làm sản phẩm cho client*.
Pipeline ở đây lo *vận hành studio*: bán hàng, content, customer success, tuyển dụng, tài chính.

→ Mỗi pipeline operationalize 1+ business playbook trong `business-strategy/12-18` qua agent Tier 5.

---

## Pipeline Index

| Folder | Phases | Owner | Driving agent(s) | Source playbook |
|---|---|---|---|---|
| [`marketing/`](marketing/) | M0–M5 | CEO | R-MKT → R-CONTENT (M2 handoff) | `05-channel-playbook.md` + `16-brand-content-kit.md` |
| [`sales/`](sales/) | S0–S5 | COO | R-SDR → R-AM → R-LEG | `12-sales-playbook.md` |
| [`content/`](content/) | C0–C4 | CEO | R-MKT → R-CONTENT | `16-brand-content-kit.md` |
| [`customer-success/`](customer-success/) | CS0–CS3 | COO | R-CS (+ R-PM) | `14-customer-success-playbook.md` |
| [`expansion/`](expansion/) | E0–E3 | COO | R-CS → R-AM → R-LEG | `14-customer-success-playbook.md` (offensive flow, sister to CS3 defensive) |
| [`partnership/`](partnership/) | BD0–BD4 | CEO | R-BIZ → R-LEG → R-MKT | `04-capability-catalog.md` (alliance + reseller + integration + referral) |
| [`hiring/`](hiring/) | H0–H3 | CEO | R-HR | `15-business-operations.md §3` |
| [`finance/`](finance/) | F0–F2 | COO | R-FIN | `15-business-operations.md §2` |

> **Pricing decisions** — trigger-based, NOT pipeline. See [`@../../../../_shared/standards/pricing-decisions.md`](../../../../_shared/standards/pricing-decisions.md).

---

## Pipeline ↔ Product Pipeline Cross-Wiring

```
Marketing: M0 ─ M1 ─ M2 ─ M3 ─ M4 ─ M5  (continuous funnel, MQL → S0)
                  ↓ (M2 hand-off)        ↑ (M4 MQL feed)
Content:  C0 ─ C1 ─ C2 ─ C3 ─ C4         │
                                          │
Sales:    S0 ◄────────────────────────────┘
          S0 ─ S1 ─ S2 ─ S3 ─ S4 ─ S5
                                  ↓ (S5 close → P0)
Product:  P0 ─ P1 ─ P2 ─G1─ P3 ─ P4 ─ P5 ─ P6 ─ P7 ─ P8 ─ P9
              ↑                                                ↓
              │                                            (P9 → CS0)
              │                            CS0 ─ CS1 ─ CS2 ─ CS3
              │                                              ↑│
              │                                              ││ if 🔴 churn defensive
              │                            E0 ─ E1 ─ E2 ─ E3 │ (offensive expansion if 🟢)
              │                                              ↓
              │                                            (E3 expanded → P0 new project)
              │                                              ↓
Partnership: BD0 ─ BD1 ─ BD2 ─ BD3 ─ BD4  (referral feeds S0, co-sell, integration, reseller)
              │                       ↓
              │                  (BD3 co-branded → M3 campaign)
              │
Finance:        F0 ─ F1 ─ F2        (per-project + monthly cycle)
Hiring:                              (on-demand per role — H0-H3)
```

**Pricing decisions** — trigger-based standards doc, not pipeline. Feeds all decisions.

**Key handoffs**:
- `M2 → C0`: Marketing brief → Content ideate (asset creation)
- `M4 → S0`: Marketing measure produces MQL → Sales prospect
- `M3 ↔ BD3`: Co-branded amplification when partner active
- `S5 → P0`: Sales close → product intake (deal becomes project)
- `P9 → CS0`: Product handoff → customer success onboarding
- `P9 → C2`: Project retro → case study draft
- `CS3 → E0`: Health check 🟢 + signal → expansion offensive flow
- `E3 → P0`: Expansion close → new project ID
- `CS3 ↔ E0`: Sister flows (defensive vs offensive based on health)
- `BD0 → BD1 → BD4`: Partnership full lifecycle
- `BD3 → S0`: Referral partner produces leads → Sales
- `P0/P9 → F0`: Project trigger → invoice cycle

---

## Common Conventions

- Each pipeline doc opens with box header (goal · duration · cost · human-involvement).
- **Engine Orchestration** table = step / agent / action / artifact.
- **Outputs** block shows literal `projects/_business/{type}/{id}/...` layout.
- **DoD** bullets per phase.
- **Failure Modes** ≥ 2 per phase.
- **Cross-References** at footer.

---

## Cost Roll-Up (engine $/tháng)

| Pipeline | Hard cap | Phase 1 expected |
|---|---|---|
| sales (R-SDR + R-AM) | $300 | $50 |
| content (R-MKT + R-CONTENT) | $130 | $80 |
| customer-success (R-CS, per client) | $30/client | $30 (1 client) |
| hiring (per role hire) | $50 | $0 (no hire Phase 1) |
| finance (R-FIN) | $20 | $20 |
| **Total Phase 1** | — | **~$180/tháng** |

Plus product engine cost ($3-9/project × ~5 projects/tháng = $15-45). Total operations: **< $250/tháng**.

---

## Cross-References

- Tier 5 agents: [`@../../../../_shared/.agents/tier-5-business/`](../../../../_shared/.agents/tier-5-business/)
- Tier 0 charters: [`@../../../../_shared/.agents/tier-0-executive/`](../../../../_shared/.agents/tier-0-executive/)
- Product pipeline P0-P9: [`@../pipeline/`](../pipeline/)
- Quality gates: [`@../quality/`](../quality/)
- Cost budgets: [`@../../../../_shared/standards/cost-budgets.md`](../../../../_shared/standards/cost-budgets.md)

---
*Last updated: 2026-04-26*
