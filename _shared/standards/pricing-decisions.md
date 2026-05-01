---
file: pricing-decisions
version: v1.0
last_updated: 2026-04-27
owner: COO + CEO
status: production
---

# Pricing Decisions — Trigger-Based Flow

> Pricing không phải sequential pipeline — là **trigger-based decision matrix**. File này document khi nào revisit pricing + ai sign + bound exceptions.
>
> **Canonical pricing sheet**: [`@../../business-strategy/10-pricing-sheet.md`](../../business-strategy/10-pricing-sheet.md). File này = decision flow, KHÔNG duplicate prices.

---

## 1. Triggers — when to revisit pricing

| # | Signal | Threshold | Action | Authority | Cadence check |
|---|---|---|---|---|---|
| T1 | Win rate (trailing 90 days) | < 30% | Discount review (targeted, not blanket) | COO + CEO | weekly W02 |
| T2 | Win rate (trailing 90 days) | > 70% | Raise prices 10-15% | CEO sign + ADR | quarterly W08 |
| T3 | Capacity utilization | > 80% | Premium tier OR raise + waitlist | COO | weekly W02 |
| T4 | Vendor cost shift (Anthropic, infra) | Δ > 20% | Recalc all tiers | CTO + CEO | per vendor announce |
| T5 | Competitor pricing intel | Δ > 25% | Strategic review | All founders | quarterly |
| T6 | Market shift (recession, regulatory) | qualitative | Defensive pricing review | All founders | ad-hoc |
| T7 | Annual review | calendar | Comprehensive recalc | All founders | Q4 mandatory |

R-LLMOps + R-LCY-05 vendor watch feed T4. Sales pipeline analytics feed T1/T2/T3.

---

## 2. Decision Matrix (4-quadrant)

| Win rate × Capacity | Low capacity (<60%) | High capacity (>80%) |
|---|---|---|
| **Low win (<30%)** | **Re-position OR re-ICP** — pricing không phải vấn đề chính. ADR + W08 framework retro mandatory | **Discount targeted** (specific ICP showing fit struggle) — ADR mandatory |
| **High win (>70%)** | **Raise + add waitlist** — capacity bottleneck = signal for premium tier. ADR | **Raise aggressively + hire** — overbooked + winning = leave money. CEO sign + hiring trigger H0 |

→ Mid-range (30-70% win, 60-80% capacity) = no action, monitor.

---

## 3. Hard Rules

- ✅ Discount > 15% → COO sign mandatory (per [R-AM card](../.agents/tier-5-business/R-AM-account-manager.md))
- ✅ Discount > 25% → CEO + COO + ADR mandatory
- ✅ New pricing tier creation → ADR + R-LEG review + business-strategy/10 update
- ✅ Annual review minimum (Q4 mandatory regardless of triggers)
- ❌ "Friend pricing" prohibited — every deal goes through standard tier OR ADR exception (§4)
- ❌ Verbal discount commitments — ALL discounts must be in proposal/SOW
- ❌ Per-deal negotiation without playbook reference (`12-sales §6 + §7`)

---

## 4. Custom pricing exception (bounded)

Strategic deal cần custom pricing → ADR mandatory với:

| Field | Required content |
|---|---|
| **Justification** | 1 of: anchor logo for new ICP entry / market signal / strategic relationship |
| **Bound** | 1-time only, expires Q+1, KHÔNG apply tới future deal kể cả same client |
| **Authority** | CEO sign + COO approve |
| **Reporting** | Track in `business-strategy/10` quarterly review section |
| **Limit** | ≤ 2 exceptions per quarter (chống abuse pattern) |

**Common acceptable cases**:
- First customer in new industry (anchor logo justifies <30% lower)
- Multi-year retainer commitment (annual prepay → 10-15% off)
- Strategic alliance partner (sister company / joint customer)

**Common UNACCEPTABLE cases (auto-reject)**:
- "Friend of CEO" without business reason
- Volume promise without contract commitment
- "We'll make it up next deal" (verbal)

---

## 5. Pricing Update Lifecycle

When pricing changes:

```
1. Trigger fires (T1-T7)
   ↓
2. Authority decides per matrix § 2
   ↓
3. ADR drafted (decision-log-index format)
   ↓
4. business-strategy/10-pricing-sheet.md updated
   ↓
5. _shared/templates/project/02-sow.md template prices reviewed
   ↓
6. R-AM + R-SDR notified — current proposals in flight grandfather OR re-quote per ADR
   ↓
7. Effective date announced (typically T+30 days)
   ↓
8. CHANGELOG entry in _shared/.agents/CHANGELOG.md (skill cards if cost cap affected)
```

---

## 6. Anti-Patterns

- ❌ Pricing changed mid-quarter without ADR
- ❌ Discount > 25% without escalation to CEO
- ❌ Salesperson promising future prices verbally
- ❌ Custom pricing becoming default (>2 exceptions/quarter)
- ❌ Skipping Q4 annual review
- ❌ Reactive pricing (only when client pushes back) without proactive triggers

---

## 7. Cross-References

- Pricing canonical: [`@../../business-strategy/10-pricing-sheet.md`](../../business-strategy/10-pricing-sheet.md)
- Sales playbook discount/negotiation: [`@../../business-strategy/12-sales-playbook.md`](../../business-strategy/12-sales-playbook.md) §6 + §7
- Win/loss tracking: [`@../../experience/workspace/docs/pipelines-business/sales/S5-HANDOFF.md`](../../experience/workspace/docs/pipelines-business/sales/S5-HANDOFF.md)
- Capacity rule: [`@../rules/90-lifecycle-rules.md`](../rules/90-lifecycle-rules.md) §R-LCY-07
- Vendor cost watch: [`@./external-dependencies.md`](external-dependencies.md)
- ADR format: [`@./decision-log-index.md`](decision-log-index.md)
- R-AM card (discount enforcement): [`@../.agents/tier-5-business/R-AM-account-manager.md`](../.agents/tier-5-business/R-AM-account-manager.md)

---
*v1.0 — Adopted 2026-04-27. Closes "static pricing doc" gap. Trigger-based, not pipeline.*
