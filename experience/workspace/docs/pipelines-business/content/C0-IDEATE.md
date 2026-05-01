# C0 — Ideate

> Quarterly calendar + weekly topic refresh.

**Owner**: CEO · **Agent**: R-MKT
**Canonical**: [`@../../../../../business-strategy/16-brand-content-kit.md:332`](../../../../../business-strategy/16-brand-content-kit.md)

---

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| C0.1 | R-MKT | Quarterly: generate 12-week calendar (1 article/wk + 3 social/wk + 1 case/mo). |
| C0.2 | R-MKT | Monthly: refresh based on performance + retro insights from product P9. |
| C0.3 | Human (CEO) | 30-min monthly review; approve/edit. |
| C0.4 | R-MKT | SEO keyword cluster per article topic. |

## Inputs
- Past performance (Substack/Plausible/LinkedIn analytics)
- Retro insights from `projects/{id}/99-retro.md` (case study triggers)
- Quarterly OKRs from CEO
- ICP signals from R-BIZ digest

## Outputs
```
projects/_business/marketing/calendar/
├── YYYY-Qx-content-calendar.md
├── seo/keyword-cluster-{topic}.md
└── monthly-refresh-{YYYY-MM}.md
```

## Definition of Done
- ✅ 12 weeks planned (no further — anti over-plan)
- ✅ Each topic has SEO cluster + buyer-intent score ≥ 6/10
- ✅ ≥ 1 case-study slot/month linked to actual project retro
- ✅ Voice variant tagged per piece (3 voices per `16-brand §2`)

## Failure Modes
- **Trend FOMO**: TikTok / video without CEO ADR → block.
- **Over-plan**: 26-week locked → quarterly re-eval mandatory.
- **Vanity topics**: high-volume / low-buyer-intent → score gate.

---
*v1.0*
