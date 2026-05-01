# M5 — Optimize

> M4 data reveals trend → adjust calendar / channel mix / paid strategy. Feeds back to M0/M1 quarterly.

**Owner**: R-MKT + CEO (structural changes).
**Cadence**: monthly (1st Monday) + quarterly with M0.
**Cost target**: $0.10 monthly, $0.20 quarterly.

---

## Trigger

- Monthly: 1st Monday → review trailing 4 weeks of M4 reports
- Quarterly: feed into M0 positioning re-review
- Ad-hoc: outlier signal (10× spike OR 50% drop)

---

## Activities

| Step | Action | Owner |
|---|---|---|
| M5.1 | Aggregate M4 weekly reports (rolling 4 weeks) | R-MKT |
| M5.2 | Trend analysis: which channels accelerating, which declining | R-MKT |
| M5.3 | Hook/angle pattern detection (what works repeatedly) | R-MKT + R-σ |
| M5.4 | CAC trend per channel + per ICP | R-FIN |
| M5.5 | Decide adjustments: calendar tweaks (tactical) OR channel mix shift (strategic) | R-MKT + CEO |
| M5.6 | If structural shift → loop to M1 (channel pick) re-decide | R-MKT + CEO |
| M5.7 | If positioning question (different ICP showing up?) → trigger M0 re-review | CEO |

---

## Decision matrix

| Signal | Action | Authority |
|---|---|---|
| Channel CAC drops 30%+ | Increase budget allocation | R-MKT |
| Channel CAC rises 30%+ | Investigate or reduce allocation | R-MKT + CEO |
| Hook pattern repeats top-3 (3 weeks running) | Promote to `studio/wisdom/high-performer-hooks.md` | R-MKT + R-σ |
| New ICP signal (3+ leads from outside ICP) | Trigger M0 ICP shift review | CEO |
| Channel below threshold 2 quarters | Sunset (per M1 sunset rule) | R-MKT + CEO |
| Total marketing CAC > Sales close LTV/3 | Strategic review | All founders |
| Velocity drop (output declining) | Capacity check (R-LCY-07) — hire vs cut scope | COO |

---

<!-- @outputs -->
## Outputs

```
business-strategy/decisions/marketing/optimization-{YYYY-Mnn}.md
```

```markdown
## Marketing Optimization {{YYYY-Mnn}}

### Trends observed (rolling 4 weeks)
- LinkedIn engagement up 25%
- Substack subscribers flat
- TikTok experiment: 2 weeks no MQL → recommend sunset

### Tactical adjustments (R-MKT authority)
- Increase LinkedIn frequency 3 → 4 posts/week
- A/B test new hook formula on Substack

### Strategic flags (escalate)
- New ICP-X signals (3 inbound leads outside file 02) → recommend M0 trigger
- TikTok sunset → recommend M1 channel mix revisit Q+1

### High-performer hooks to promote
- "Counter-intuitive {topic} for {audience}" formula — 3 top performers used this

### ADR drafts
- ADR-XXXX: TikTok sunset
- ADR-XXXX: Hook formula adoption to studio/wisdom
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Tactical-only adjustments** (never escalate strategic) → quarterly M0 trigger mandatory
- **Sunset friction** (keep underperforming channel because emotional attachment) → 2-quarter rule strict
- **Hook patterns lost** (not promoted to wisdom) → R-σ checklist; track promotion count as KPI
- **Optimization theater** (write report, no operational change) → ADR mandatory if change >5% allocation
- **CAC blindness** (impressions up but CAC up too — celebrate wrong) → CAC primary metric
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| Strategic shift = ADR mandatory | R-MAS-14 |
| Velocity tracking | learning-system.md §7 — monthly velocity feeds quarterly W08 |
| Channel sunset = R-LCY-03 cadence | sunset path entry |
<!-- /@harness-checkpoint -->

---

## Cross-References

- M4 prev: [`@./M4-MEASURE.md`](M4-MEASURE.md)
- Loops to M0: [`@./M0-POSITIONING.md`](M0-POSITIONING.md) (quarterly)
- Pricing decisions (CAC trigger): [`@../../../../_shared/standards/pricing-decisions.md`](../../../../_shared/standards/pricing-decisions.md)
- Lifecycle sunset: [`@../../../../_shared/rules/90-lifecycle-rules.md`](../../../../_shared/rules/90-lifecycle-rules.md) §R-LCY-03
- Studio wisdom (hooks): [`@../../../../studio/wisdom/high-performer-hooks.md`](../../../../studio/wisdom/high-performer-hooks.md)

---
*v1.0 — 2026-04-27.*
