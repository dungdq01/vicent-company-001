# S4 — Close

> Negotiation, signature, deposit collection. Equivalent to product Gate G1.

**Canonical**: [`@../../../../../business-strategy/12-sales-playbook.md:240`](../../../../../business-strategy/12-sales-playbook.md)
**Prev**: [`S3-PROPOSAL.md`](S3-PROPOSAL.md) · **Next**: [`S5-HANDOFF.md`](S5-HANDOFF.md)
**Owner**: COO · **Agents**: R-AM + R-LEG + R-FIN

---

```
┌──────────────────────────────────────────────────────────┐
│  S4: CLOSE                                               │
│  Goal: Signed SOW + 50% deposit received                 │
│  Duration: D0-D14 from proposal sent                     │
│  Engine cost: $0.05-0.15                                 │
│  Human time: 1-3h negotiation calls                      │
└──────────────────────────────────────────────────────────┘
```

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| S4.1 | R-AM | Day 7 follow-up if no response (per `12-sales §9`). |
| S4.2 | R-AM | If objection → match against catalogue `12-sales §6`, draft response. |
| S4.3 | R-AM | If negotiation → apply `12-sales §7` rules. **Hard cap: 15% discount without COO sign**. |
| S4.4 | R-LEG | Final SOW draft incorporating client redlines. |
| S4.5 | Human (COO) | Final SOW sign (or CEO if > $10K). |
| S4.6 | R-FIN | Generate deposit invoice 50%. |
| S4.7 | R-AM | Confirm signed + deposit received → trigger S5. |

## Outputs

```
projects/_business/sales/leads/{LEAD_ID}/
├── follow-up-log.md             ← D7, D14
├── objection-responses.md
├── negotiation-trail.md         ← all redlines + concessions
├── sow-final.pdf                ← signed
├── deposit-invoice.pdf          ← 50% deposit
└── close-summary.md             ← amount · scope · timeline · key terms
```

## Definition of Done
- ✅ SOW signed by both parties
- ✅ 50% deposit received in bank
- ✅ Discount within **15%** (or CEO sign-off recorded)
- ✅ All redlines accepted or rejected with rationale logged
- ✅ Won/lost recorded in CRM with reason

### If Lost (S4-LOST branch)
- ✅ Win/loss analysis per `12-sales §10`
- ✅ Real reason captured (not stated — `12-sales §10` "root cause if lost")
- ✅ Action items extracted; pattern check across last 5 losses

## Failure Modes
- **Discount creep**: each ask "for this one" → enforce hard 15% cap; one-off requires CEO ADR.
- **Stuck in negotiation > 14 days**: quote expires per playbook; don't extend silently.
- **Deposit delay**: D-7 reminder; D-14 escalate; D-21 SOW void.
- **Redline accepted silently**: every redline must be in `negotiation-trail.md`.

## Cross-References
- Objection handling: [`@../../../../../business-strategy/12-sales-playbook.md:240`](../../../../../business-strategy/12-sales-playbook.md)
- Negotiation: [`@../../../../../business-strategy/12-sales-playbook.md:257`](../../../../../business-strategy/12-sales-playbook.md)
- Win/loss: [`@../../../../../business-strategy/12-sales-playbook.md:381`](../../../../../business-strategy/12-sales-playbook.md)

---
*v1.0*
