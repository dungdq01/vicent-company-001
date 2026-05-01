# BD0 — Identify

> Quarterly proactive scan + opportunistic signals → ranked candidate list. Studio chỉ vào BD1 với top-3 highest-fit candidates.

**Owner**: R-BIZ + CEO.
**Cadence**: quarterly proactive (Q1 mid-Mar, Q2 mid-Jun, ...) + opportunistic.
**Cost target**: $0.20-0.30 (web research + ranking).

---

## Trigger

- **Proactive**: quarterly scan tied to W08 framework retro
- **Opportunistic**: signal events:
  - Mutual customer mentioned partner X
  - Conference / podcast intro
  - Competitor partnership news (defensive)
  - Customer asking "do you integrate with X?"

---

## Activities

| Step | Action | Owner |
|---|---|---|
| BD0.1 | Define scan scope (which partnership type prioritized this quarter) | CEO + R-BIZ |
| BD0.2 | Map studio's capability gaps (per `04-capability-catalog`) | R-BIZ |
| BD0.3 | Web search candidates per partnership type (5-15 per type) | R-BIZ + R-α tools |
| BD0.4 | Score candidates: ICP overlap × strategic fit × revenue potential × cultural fit | R-BIZ |
| BD0.5 | Rank top-3 per type | CEO sign |
| BD0.6 | Anti-conflict check: do top-3 conflict with existing partnerships? | R-LEG quick scan |
| BD0.7 | Output: candidates list → BD1 outreach | R-BIZ |

---

## Scoring rubric

```yaml
candidate_score:
  icp_overlap: 0-10            # do their customers match our ICP?
  strategic_fit: 0-10          # complementary capabilities, not direct competitor
  revenue_potential: 0-10      # estimated annual revenue contribution
  cultural_fit: 0-10           # working style, values alignment
  
  weight: [0.35, 0.30, 0.20, 0.15]
  threshold_for_BD1: aggregate >= 6.5
```

---

<!-- @outputs -->
## Outputs

```
business-strategy/decisions/partnership/candidates-{YYYY-Qn}.md
```

```markdown
## Partnership candidates {{YYYY-Qn}}

### Type: Referral
1. {company} — score 8.2 — {2-line description + ICP overlap evidence}
2. ...

### Type: Co-sell
1. {company} — score 7.8 — {...}

### Type: Integration
(none above threshold this quarter)

### Type: Reseller
1. {company} — score 7.0 — {...}

### Recommendation
- Approach Referral #1 + Co-sell #1 (2 BD1 outreach)
- Defer Reseller #1 (capacity reason)
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Anti-portfolio bias** (always same type) → enforce diversity: 2+ partnership types per quarter scan
- **Top-of-mind bias** (only candidates CEO already knows) → require ≥ 5 net-new candidates per scan
- **Strategic fit hallucination** → require ≥ 2 specific evidence points (not vague "they could work with us")
- **Skip anti-conflict check** → mandatory R-LEG quick scan before BD1
- **Cultural fit ignored** → mandatory; weight 15% — partnerships fail on this often
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| Web research cost cap | R-MAS-07 — $0.30 hard for whole quarter scan |
| Anti-FOMO partnership picks | R-MAS-04 — don't chase "trending" partnerships |
<!-- /@harness-checkpoint -->

---

## Cross-References

- Capability catalog: [`@../../../../business-strategy/04-capability-catalog.md`](../../../../business-strategy/04-capability-catalog.md)
- BD1 next: [`@./BD1-OUTREACH.md`](BD1-OUTREACH.md)

---
*v1.0 — 2026-04-27.*
