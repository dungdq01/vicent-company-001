# M1 — Channel Pick

> Given M0 positioning + ICP, decide WHICH platforms (LinkedIn / TikTok / Substack / SEO / paid ads / podcasts / events) + budget split + frequency.

**Owner**: R-MKT + CEO sign.
**Cadence**: Quarterly with M0 + ad-hoc on channel signal.
**Cost target**: $0.10-0.15.

---

## Trigger

- After M0 positioning decided
- New channel signal: viral platform, ICP shift to new platform, paid-ad opportunity
- Channel performance drift (M5 reveals)

---

## Activities

| Step | Action | Owner |
|---|---|---|
| M1.1 | Read M0 positioning + ICP | R-MKT |
| M1.2 | Read channel playbook `05-channel-playbook.md` | R-MKT |
| M1.3 | Map ICP → channels they consume (per ICP file 02 channel preferences) | R-MKT |
| M1.4 | Score each channel: ICP fit × content velocity × cost × measurement | R-MKT |
| M1.5 | Decide channel mix (typically 3-4 active, 1 experiment) | R-MKT + CEO |
| M1.6 | Budget split + frequency cadence | R-MKT |
| M1.7 | Output channel-mix doc | R-MKT |

---

## Channel scoring rubric

```yaml
channel_score:
  icp_fit: 0-10              # do our ICPs spend time here?
  content_velocity: 0-10     # how often can we publish (capacity-aware)
  measurement: 0-10          # can we attribute conversion?
  cost_efficiency: 0-10      # cost per MQL vs other channels
  durability: 0-10           # platform algorithm stability vs trend-driven
  
  threshold: aggregate >= 6.5 → include
  weights: [0.35, 0.20, 0.20, 0.15, 0.10]
```

### Common channel matrix (Phase 1 default)

| Channel | ICP-A MMO | ICP-B Logistics | ICP-C E-com | ICP-D Enterprise | ICP-E Technical |
|---|---|---|---|---|---|
| LinkedIn | low | **high** | medium | **high** | medium |
| Substack/blog | medium | medium | medium | medium | **high** |
| TikTok | **high** | low | medium | low | low |
| YouTube long | medium | medium | medium | medium | **high** |
| X/Twitter | medium | low | medium | low | **high** |
| SEO/organic | medium | **high** | **high** | **high** | medium |
| Paid ads (Google/Meta) | medium | medium | **high** | low | low |
| Podcasts (guest) | low | medium | medium | **high** | **high** |
| Events / talks | low | medium | low | **high** | **high** |

→ M1 picks 3-4 high-fit channels per current ICP focus.

---

<!-- @outputs -->
## Outputs

```
business-strategy/decisions/marketing/channel-mix-{YYYY-Qn}.md
```

```markdown
## Channel Mix {{YYYY-Qn}}

**Active channels** (3 picked):
1. LinkedIn — 40% effort, 3 posts/week, owner R-MKT calendar
2. Substack — 30% effort, 1 deep article/2 weeks, owner CEO + R-CONTENT
3. SEO/organic — 30% effort, 1 cluster/month, owner R-MKT + R-CONTENT

**Experiment channel** (1):
- Podcast guesting — 1 appearance/month, target: ICP-E technical podcasts

**Sunset channels** (vs last quarter):
- TikTok (low ICP-B fit, was experiment, no MQL contribution)

**Budget split**:
- Organic: 70% effort
- Paid: 30% (LinkedIn ads to ICP-B + Google search ads to ICP-C)

**Total budget**: $X/quarter (per pricing-decisions T3 capacity check)
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Channel proliferation** (5+ active channels) → capacity dilution; enforce 3-4 max
- **Trend chasing** (TikTok because trend, ICP doesn't use) → R-MAS-04 anti-FOMO; ICP fit primary
- **Skip measurement** (presence without attribution) → measurement score ≥ 6 mandatory before include
- **Permanent experiment** (channel "experiment" 4 quarters never decides) → max 1 experiment slot, decide each Q
- **Sunset friction** (keeping channel because emotional) → sunset rule: 2 quarters below threshold = cut
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| Anti-FOMO channel adoption | R-MAS-04 — new channel = ADR + eval delta proof |
| Capacity-aware (R-LCY-07) | Don't add channel if exceeds R-MKT capacity |
<!-- /@harness-checkpoint -->

---

## Cross-References

- M0 prev: [`@./M0-POSITIONING.md`](M0-POSITIONING.md)
- M2 next: [`@./M2-ASSET.md`](M2-ASSET.md)
- Channel playbook: [`@../../../../business-strategy/05-channel-playbook.md`](../../../../business-strategy/05-channel-playbook.md)
- ICP channel preferences: [`@../../../../business-strategy/02-customer-segments.md`](../../../../business-strategy/02-customer-segments.md)

---
*v1.0 — 2026-04-27.*
