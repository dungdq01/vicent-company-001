# S3 — Proposal

> Generate proposal + SOW draft + investment table. Send within 5 days of discovery.

**Canonical**: [`@../../../../../business-strategy/12-sales-playbook.md:169`](../../../../../business-strategy/12-sales-playbook.md)
**Prev**: [`S2-DISCOVERY.md`](S2-DISCOVERY.md) · **Next**: [`S4-CLOSE.md`](S4-CLOSE.md)
**Owner**: COO · **Agents**: R-AM (proposal) + R-LEG (SOW) + R-FIN (pricing sanity)

---

```
┌──────────────────────────────────────────────────────────┐
│  S3: PROPOSAL                                            │
│  Goal: Proposal + SOW + invoice schedule, sent           │
│  Duration: D0-D5 from discovery                          │
│  Engine cost: $0.30-0.50                                 │
│  Human time: 1h CEO/COO review + polish                  │
└──────────────────────────────────────────────────────────┘
```

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| S3.1 | R-AM | Generate `proposal-draft.md` per `12-sales §5` (5-10 pages). |
| S3.2 | R-LEG | Draft SOW with terms (50% deposit, IP, termination, SCR ref). |
| S3.3 | R-FIN | Pricing sanity-check vs `10-pricing-sheet.md`. |
| S3.4 | R-AM | Investment table + payment schedule. |
| S3.5 | Human (CEO) | Technical accuracy review (30 min). |
| S3.6 | Human (COO) | Brand polish + tone personalize (30 min). |
| S3.7 | R-AM | Send via email + Notion view; 14-day validity clock starts. |

## Outputs

```
projects/_business/sales/leads/{LEAD_ID}/
├── proposal-draft.md
├── proposal-final.pdf
├── executive-summary.pdf        ← 1 page
├── sow-draft.md                 ← R-LEG output (DRAFT — counsel review for > $25K)
├── investment-table.md
└── send-record.md               ← email log + read receipts
```

## Definition of Done
- ✅ Proposal addresses **every** client constraint from scoping
- ✅ Pricing matches `10-pricing-sheet.md` line + version cited
- ✅ ≥ 3 client-specific sentences in exec summary (not template-only)
- ✅ Validity date + countersign instructions clear
- ✅ SOW flags reviewed by R-LEG (RED flags → outside counsel before send)
- ✅ Sent within **5 days** of discovery call

## Failure Modes
- **Template-only proposal**: enforce ≥ 3 client-specific sentences.
- **Pricing drift**: hard-block if doesn't match pricing sheet line.
- **SOW unflagged risk**: R-LEG must flag any unlimited-liability / unusual IP grant.
- **Send delay > 7 days**: client momentum lost; flag COO if blocked.

## Cross-References
- Proposal template: [`@../../../../../business-strategy/12-sales-playbook.md:169`](../../../../../business-strategy/12-sales-playbook.md)
- R-LEG card: [`@../../../../../_shared/.agents/tier-5-business/R-LEG-legal.md`](../../../../../_shared/.agents/tier-5-business/R-LEG-legal.md)

---
*v1.0*
