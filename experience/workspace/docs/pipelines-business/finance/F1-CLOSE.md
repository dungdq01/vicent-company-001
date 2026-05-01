# F1 — Monthly Close + P&L

> EOM+5: revenue + COGS + OpEx → P&L draft. CFO/CPA review.

**Owner**: COO · **Agent**: R-FIN
**Canonical**: [`@../../../../../business-strategy/15-business-operations.md:68`](../../../../../business-strategy/15-business-operations.md)

---

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| F1.1 | R-FIN | Pull bank CSV · Stripe export · Helicone API cost · vendor invoices |
| F1.2 | R-FIN | Categorize per chart of accounts (`15-ops §2`) |
| F1.3 | R-FIN | Reconcile: invoiced vs collected vs accrued |
| F1.4 | R-FIN | Draft P&L · cash flow · margin analysis |
| F1.5 | Human (COO) | Review by EOM+5 |
| F1.6 | Human (CFO/CPA outside) | Final review monthly OR quarterly |
| F1.7 | R-FIN | Publish to internal QBR feed |

## P&L Template
```
Revenue
  Project income (cash)
  Retainer income
  Other (training, talks)

COGS
  API costs (Anthropic, OpenAI, etc.)
  Vendor / contractor pass-through
  Tooling allocated to delivery

Gross Profit / Margin %

OpEx
  Tools (recurring SaaS)
  Brand / content / ads
  Personal learning + courses
  Founder draws (when applicable)
  Office / co-working
  Other

Operating Profit / Margin %
```

## Outputs
```
projects/_business/finance/close/
├── close-{YYYY-MM}.md
├── pnl-{YYYY-MM}.md
├── cash-flow-{YYYY-MM}.md
└── reconciliation-{YYYY-MM}.md
```

## Definition of Done
- ✅ Close completed by **EOM+5**
- ✅ Reconciliation: bank balance matches ledger ±$1
- ✅ Gross margin ≥ **60%** target tracked
- ✅ Operating margin ≥ **20%** Phase 1 target
- ✅ Anomalies flagged (e.g., API cost spike > 30%)

## Failure Modes
- **Categorization drift**: same vendor in different bucket → enforce mapping
- **Reconciliation > $1 mismatch**: don't ship draft; investigate
- **Cost spike unflagged**: rolling-3-month comparison required
- **Tax misclassification**: mark all tax artifacts "draft for CPA review"

---
*v1.0*
