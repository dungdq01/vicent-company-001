# M0 — Positioning

> Strategic stance: who we are FOR (and not for), differentiation, anti-positioning. Foundation for all M1-M5.

**Owner**: CEO + R-BIZ.
**Cadence**: Quarterly review (mandatory Q1 + opportunistic on signal).
**Cost target**: $0.20-0.30 (analysis-heavy).

---

## Trigger conditions

- **Proactive**: Q1 calendar review (mandatory)
- **ICP shift signal** (any of 3):
  - Win rate per ICP changes ±20% over trailing 90 days
  - 3+ inbound leads from new ICP outside `business-strategy/02`
  - Customer feedback pattern: ≥ 3 churn cases citing same positioning gap
- **Competitive signal**: competitor pivots OR new competitor enters ICP space
- **Capability shift**: studio adds new capability tier (file 04 update)

---

## Activities

| Step | Action | Owner |
|---|---|---|
| M0.1 | Pull win rate per ICP last 90 days | R-FIN + R-AM data |
| M0.2 | Pull inbound source distribution (channel attribution) | R-MKT |
| M0.3 | Customer voice scan: NPS comments + churn reasons + QBR notes | R-CS |
| M0.4 | Competitor scan: top-3 competitors per ICP, what they say | R-BIZ web research |
| M0.5 | Generate positioning options (2-3) — different stance/differentiation angles | CEO + R-BIZ |
| M0.6 | Decide stance + write `positioning-{YYYY-Qn}.md` | CEO sign |
| M0.7 | Update `business-strategy/02` if ICP shift; update `16-brand` if voice shift | CEO + ADR |

---

## Positioning canvas (output structure)

```yaml
positioning:
  for_whom: |
    1-line ICP description (specific, not generic)
    "VN B2B 3PL logistics companies 50-300 employees với data >12 months"
  
  not_for_whom: |
    Anti-positioning — who we explicitly DON'T serve
    "NOT for enterprise (>1000 employees) — they need consulting firm scale"
    "NOT for pre-data startups — wait until they have signal"
  
  what_we_solve:
    - Specific outcome 1 (measurable)
    - Specific outcome 2
    - (max 3 — focus)
  
  differentiation:
    - "Different from {competitor X} because {specific evidence}"
    - "Different from {competitor Y} because {evidence}"
  
  proof_points:
    - "Case study: {anonymized client} achieved {result}"
    - "Founder credentials: {specific expertise}"
    - "Methodology: framework wrapper (boutique + agentic engine)"
  
  voice:
    primary: voice_b_business     # for client-facing
    secondary: voice_a_technical  # for ICP-E technical buyer
  
  validity_period: 1 quarter (re-review next Q)
```

---

<!-- @outputs -->
## Outputs

```
business-strategy/decisions/marketing/positioning-{YYYY-Qn}.md
```

If structural shift (different ICP focus, different differentiation):
- Update `02-customer-segments.md` (ADR)
- Update `16-brand-content-kit.md` (ADR if voice shift)
- Notify R-SDR + R-AM (sales messaging needs sync)
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Positioning theater** (write doc, no operational impact) → ADR mandatory propagation: 02-segments + 12-sales + 16-brand updated
- **ICP creep** (gradually serving everyone) → anti-positioning explicit; refuse leads outside ICP politely
- **Competitor obsession** (positioning = "not them") → focus on customer outcome FIRST, then differentiation
- **Stale positioning** (>1 quarter without review) → cron Q1 mandatory; alert if missed
- **Voice contract drift** post-positioning shift → R-σ + brand kit re-anchor
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| ADR mandatory if ICP/voice shift | R-MAS-14 |
| Strategic decision authority | R-MAS-03 — CEO sign mandatory |
| Update propagation: positioning → 02 → 12 → 16 | R-MAS-01 single source — all reference back to canonical doc |
<!-- /@harness-checkpoint -->

---

## Cross-References

- ICP canonical: [`@../../../../business-strategy/02-customer-segments.md`](../../../../business-strategy/02-customer-segments.md)
- Brand kit: [`@../../../../business-strategy/16-brand-content-kit.md`](../../../../business-strategy/16-brand-content-kit.md)
- Sales playbook: [`@../../../../business-strategy/12-sales-playbook.md`](../../../../business-strategy/12-sales-playbook.md)
- M1 next: [`@./M1-CHANNEL-PICK.md`](M1-CHANNEL-PICK.md)
- Pricing decisions: [`@../../../../_shared/standards/pricing-decisions.md`](../../../../_shared/standards/pricing-decisions.md) (positioning shift may trigger T1/T2)

---
*v1.0 — 2026-04-27. Includes ICP shift signals per boss feedback Gap 1.*
