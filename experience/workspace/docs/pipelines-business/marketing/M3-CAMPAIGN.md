# M3 — Campaign

> Asset published → orchestrate multi-channel campaign + UTM tracking + paid amplification (if budget).

**Owner**: R-MKT.
**Cadence**: per asset publish + per campaign theme.
**Cost target**: $0.10-0.20 per campaign.

---

## Trigger

Path C C3-PUBLISH complete (asset live on primary channel) → M3 orchestrates cross-channel amplification.

---

## Activities

| Step | Action | Owner |
|---|---|---|
| M3.1 | Read C3 published asset URL + assets list | R-MKT |
| M3.2 | UTM tag generation per channel for tracking | R-MKT |
| M3.3 | Cross-channel publish schedule (timing per channel best practices) | R-MKT |
| M3.4 | Paid amplification (if budget): targeting + budget + bid strategy | R-MKT + CEO sign |
| M3.5 | Co-branded amplification (if BD3 partner active) | R-MKT + R-BIZ |
| M3.6 | Daily monitoring first 7 days post-publish | R-MKT |
| M3.7 | Hand-off to M4 measure after campaign window closes (typically 14-30 days) | R-MKT → M4 |

---

## Channel timing matrix (when to post)

| Channel | Best timing (VN audience) | Frequency cap |
|---|---|---|
| LinkedIn | T+0 hour 9-10 AM weekday, repost T+3 days | 1 post/topic/week |
| Substack | T+1 day, weekend (subscriber consumption) | 1 issue/week |
| Twitter/X | T+0 multiple times: 9 AM + 1 PM + 8 PM | 3 threads/week max |
| TikTok | T+0 or T+1, evening 7-9 PM | 1 video/day max |
| YouTube | T+0 Friday 10 AM (algorithm window) | 1 video/week |
| Threads | T+1 (after primary), 7-9 PM | 1 carousel/topic |

---

## UTM convention

```
utm_source: {channel}        # linkedin / substack / twitter / etc
utm_medium: {format}          # post / article / thread / carousel / paid-ad
utm_campaign: {YYYY-Qn-slug}  # e.g., 2026-Q2-forecasting-roi
utm_content: {variant}        # variant-a / variant-b for A/B
utm_term: {keyword}           # if paid + keyword targeting
```

→ R-FIN aggregates per `pricing-decisions T1` win rate analysis.

---

<!-- @outputs -->
## Outputs

```
business-strategy/decisions/marketing/campaigns/{YYYY-Qn-slug}/
├── M3-campaign-plan.md           ← schedule + UTM + budget
├── M3-utm-config.json            ← UTM tags machine-readable
├── M3-paid-config.md             ← if paid amplification
└── M3-execution-log.md           ← what published when, links
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **UTM missing** (untrackable) → mandatory before publish; M4 cannot measure without
- **Channel timing wrong** (post 11 PM = dead) → enforce timing matrix
- **Frequency cap exceeded** (spam audience) → respect caps; queue overflow
- **Paid amplification without ROI thesis** → require: target CAC + conversion event + stop-loss budget
- **Campaign not closed** (open forever) → 30-day window default; close + hand to M4 explicitly
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| Paid spend approval gate | R-HRN-11 — CEO sign for any paid budget |
| Anti-spam (channel frequency caps) | R-MAS-11 globally forbidden |
| Tracking required before publish | M4 cannot measure without UTM |
<!-- /@harness-checkpoint -->

---

## Cross-References

- M2 prev: [`@./M2-ASSET.md`](M2-ASSET.md)
- M4 next: [`@./M4-MEASURE.md`](M4-MEASURE.md)
- Path C C3 (published asset source): [`@../content/C3-PUBLISH.md`](../content/C3-PUBLISH.md)
- BD3 (co-branded amplification): [`@../partnership/BD3-EXECUTE.md`](../partnership/BD3-EXECUTE.md)

---
*v1.0 — 2026-04-27.*
