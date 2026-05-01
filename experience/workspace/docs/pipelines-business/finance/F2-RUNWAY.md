# F2 — Runway + Tax Handoff

> Weekly runway snapshot. Quarterly tax handoff to CPA.

**Owner**: COO (runway) + CEO (tax decisions) · **Agent**: R-FIN

---

## Weekly Runway

| Step | Agent | Action |
|---|---|---|
| F2.1 | R-FIN | Pull bank balance + trailing-3-month avg burn |
| F2.2 | R-FIN | Compute runway = balance / avg burn (months) |
| F2.3 | R-FIN | Alert thresholds: < 6mo (yellow COO) · < 3mo (red CEO) |
| F2.4 | R-FIN | Trend: 4-week delta runway |

## Outputs (weekly)
```
projects/_business/finance/runway/
└── runway-{YYYY-WW}.md
```

## Runway Decision Triggers
| Runway | Action |
|---|---|
| ≥ 12mo | Green; consider reinvest (hire, ads, OSS) |
| 9-12mo | Maintain; monthly check |
| 6-9mo | Yellow; COO weekly review; pause discretionary spend |
| 3-6mo | Red; CEO + COO emergency review; sales push + cost cuts |
| < 3mo | Code red; founder draws pause; renegotiate vendors; consider partnership/loan |

---

## Quarterly Tax Handoff

| Step | Agent | Action |
|---|---|---|
| F2.5 | R-FIN | End of quarter: export structured data per CPA template |
| F2.6 | Human (CEO + CPA outside) | CPA review + tax filing |
| F2.7 | R-FIN | Archive returns + receipts in `tax/{YYYY-Qx}/` |

**Hard rule**: R-FIN never files tax. Only prepares + hands off.

## Outputs (quarterly)
```
projects/_business/finance/tax/{YYYY-Qx}/
├── tax-prep-package.md
├── revenue-export.csv
├── expense-export.csv
├── receipts/                ← scanned, indexed
└── filed-returns/           ← post-CPA
```

## Definition of Done
- ✅ Runway snapshot every Friday
- ✅ Yellow flag → COO sync within 7 days
- ✅ Red flag → CEO + COO meeting within 48h
- ✅ Quarterly tax package ready by Q+15 days
- ✅ All receipts ≥ $50 archived

## Failure Modes
- **Runway false-positive** (deposit spike treated recurring): enforce trailing-3-mo avg
- **Tax filing without CPA**: hard block; never auto-file
- **Receipt loss**: monthly receipt audit; missing → reconstruct
- **Discretionary spend in yellow**: enforce pause rule

---
*v1.0*
