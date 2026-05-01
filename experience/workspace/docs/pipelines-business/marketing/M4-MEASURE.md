# M4 — Measure

> Aggregate analytics across channels + UTM data → performance reports. Feed M5 optimization + S0 Sales handoff (MQL).

**Owner**: R-MKT + R-DA (data analyst).
**Cadence**: weekly digest + per-campaign close.
**Cost target**: $0.10 per weekly report, $0.20 per campaign-close report.

---

## Trigger

- Weekly Monday: rolling 7-day digest
- Per-campaign close: 14-30 days post-M3 publish

---

## Activities

| Step | Action | Owner |
|---|---|---|
| M4.1 | Pull analytics per channel (LinkedIn Analytics, Substack, GA, etc.) | R-DA + automation |
| M4.2 | UTM aggregation per campaign | R-DA |
| M4.3 | Compute KPIs: reach, engagement, CTR, conversion-to-MQL, CAC | R-DA |
| M4.4 | Compare vs benchmarks (last quarter, industry, target) | R-MKT |
| M4.5 | Identify top performers + underperformers | R-MKT |
| M4.6 | Identify hooks/angles that worked → flag for `studio/wisdom/high-performer-hooks.md` | R-σ + R-MKT |
| M4.7 | Hand to S0 Sales: MQL list with attribution data | R-MKT → R-SDR |
| M4.8 | Weekly report → CEO + COO | R-MKT |

---

## KPI dashboard structure

```yaml
weekly_report_{YYYY-Wnn}:
  reach:
    total_impressions: int
    by_channel: {linkedin: int, substack: int, ...}
  
  engagement:
    likes: int, comments: int, shares: int, saves: int
    engagement_rate_pct: float
    by_channel: {...}
  
  funnel:
    impressions_to_visit_pct: float        # CTR
    visit_to_lead_pct: float                # conversion
    lead_to_MQL_pct: float
    MQL_to_SQL_pct: float                   # tracked by R-SDR
  
  cost:
    paid_spend_usd: float
    organic_effort_hours: float
    estimated_CAC_per_MQL: float            # paid_spend / MQL_count
  
  highlights:
    top_3_pieces: [{slug, performance_score}]
    bottom_3_pieces: [{slug, why_underperformed}]
    high_performer_hook_candidates: [...]   # promote to studio/wisdom
  
  pipeline_handoff:
    new_MQLs_this_week: int
    handed_to_R-SDR: [list of lead_ids]
```

---

<!-- @outputs -->
## Outputs

```
business-strategy/decisions/marketing/reports/
├── weekly-{YYYY-Wnn}.md
└── campaigns/{YYYY-Qn-slug}/
    └── M4-final-report.md       ← per-campaign close report
```

Side effect:
- High-performer hooks promoted to `studio/wisdom/high-performer-hooks.md` (per Path C C7)
- MQL list → S0 Sales pipeline trigger
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **UTM data missing** (M3 didn't tag) → can't measure attribution; force fix M3 mandatory
- **Vanity metrics only** (followers without engagement) → engagement rate mandatory in report
- **No MQL handoff** (measure but don't pass leads) → S0 trigger mandatory; R-SDR ack required
- **Underperformer ignored** (only celebrate top) → bottom-3 analysis mandatory
- **High-performer hooks lost** (didn't promote to wisdom library) → R-σ checklist enforce
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| MQL handoff via R-ORC-03 quote test | R-SDR must quote 3 attribution fields verbatim |
| Velocity KPI tracking | learning-system.md §7 |
| Wisdom promotion path | high-performer-hooks per learning-system §3.1 |
<!-- /@harness-checkpoint -->

---

## Cross-References

- M3 prev: [`@./M3-CAMPAIGN.md`](M3-CAMPAIGN.md)
- M5 next: [`@./M5-OPTIMIZE.md`](M5-OPTIMIZE.md)
- Sales S0 (MQL handoff): [`@../sales/S0-PROSPECT.md`](../sales/S0-PROSPECT.md)
- Wisdom (high-performer hooks): [`@../../../../studio/wisdom/high-performer-hooks.md`](../../../../studio/wisdom/high-performer-hooks.md)
- Path C C7 (high-performer save): [`@../content/`](../content/) (cross-pipeline)

---
*v1.0 — 2026-04-27.*
