---
hat: CEO
owner: P1 (bạn)
tier: T0
version: v1.0
last_updated: 2026-04-26
status: production
---

# CEO Charter

## Identity

Bạn (P1) là CEO. Vertical owner: **MMO / AdTech (I18)**.
**Moat**: LLMOps — eval framework, prompt versioning, cost optimization, memory hygiene. Đây là sự khác biệt khó copy nhất của studio.

---

## Accountability (KPIs CEO own)

| KPI | Target năm 1 | Source of truth |
|---|---|---|
| Monthly recurring revenue | $2,000/tháng (tháng 6) | finance dashboard |
| Burn rate | < $1,500/tháng | `15-business-operations §2` |
| Cash runway | ≥ 6 tháng | finance dashboard |
| Eval mean delta (LLMOps moat) | +0.3 / quý | `_shared/eval/` reports |
| Brand reach (followers + newsletter) | 5,000 / cuối Q4 | `16-brand-content-kit` |
| Founding customer count | 3 (cuối Q2) | sales pipeline |
| Founder personal H-index (publish) | ≥ 1 OSS repo có ⭐ + 1 talk | `06-personal-development` |

---

## Decision Rights (no escalation needed)

- Vision + 3-year direction
- Pricing tier rules (file `10-pricing-sheet.md`)
- Brand voice & content tone (`16-brand-content-kit`)
- ICP refresh + segment expansion (`02-customer-segments`)
- Quarterly OKRs
- Hire / fire (sau khi consulted COO)
- LLMOps moat investment (tools, courses, OSS)
- External speaking / media

## Sign-off Authority (mandatory CEO signature)

| Gate | File / artifact |
|---|---|
| P1 discovery technical accuracy | `meta/decisions.md` per project |
| P3 architecture LLM choice | `03-architecture/` |
| P4c ML algorithm rationale | `04-design/ml/algorithm-spec.md` |
| P6 LLMOps integration | `06-dev-guides/` |
| P8 deploy plan + monitoring | `08-deployment/` |
| Prompt version bump (≥ +0.3 eval) | `_shared/.agents/CHANGELOG.md` |
| Eval threshold change | `_shared/eval/SPEC.md` |
| Pricing > 20% change | `10-pricing-sheet.md` |

---

## Escalation Path

**Vào CEO khi**:
- Eval drift > 0.5 sau 7 ngày prod
- Cost overrun > 30% trên project budget cap
- Client refund > $1K
- Tech stack deviation from approved list (anti-FOMO)
- ADR liên quan moat (eval / prompt / cost)
- Personal burnout signal từ founder khác

**Ra ngoài CEO khi**:
- Legal exposure → R-LEG + outside counsel
- Production outage SEV-1 → CTO own, CEO notified
- Cash < 3 tháng runway → emergency review (cả 3 founders)

---

## Time Allocation (target tuần)

| Bucket | % | Hours / tuần (40h) |
|---|---|---|
| LLMOps moat (build/improve eval, prompts, tools) | **30%** | 12h |
| Strategy + decision-making | 15% | 6h |
| Sales (CEO-led for whales) | 15% | 6h |
| Brand + content (technical voice) | 15% | 6h |
| Hiring + 1:1 với founders | 10% | 4h |
| Personal learning / reading | 10% | 4h |
| Admin / context-switch buffer | 5% | 2h |

→ Khi tuần > 50h: COO review xem việc nào delegate-able sang agent.

---

## Anti-Patterns (CEO tuyệt đối không làm)

- ❌ Code feature production thay vì mentor — CEO build *engine*, không build *feature*.
- ❌ Take sales call < $2K trừ Founding Customer.
- ❌ Approve framework mới chỉ vì trending (FOMO) — phải qua ADR + eval impact.
- ❌ Skip retro của project < $5K — pattern ở project nhỏ hữu giá nhất.
- ❌ Personal write content mỗi ngày — delegate R-CONTENT cho draft, CEO chỉ review/polish.
- ❌ Trở thành single-point-of-failure cho client communication — handoff sang COO sau P2.

---

## Engine Integration

CEO không phải agent execute, nhưng có **agent advisor**:
- `R-BIZ` (Tier 5) chuẩn bị weekly digest + QBR brief cho CEO review.
- `R-σ` consolidate retro insights → CEO weekly read.
- Helicone / Langfuse dashboard → CEO check daily 5 phút (cost + eval drift).

---

## Cross-References

- LLMOps moat detail: [`@../../../business-strategy/08-ceo-technical-leverage.md`](../../../business-strategy/08-ceo-technical-leverage.md)
- Personal dev plan: [`@../../../business-strategy/06-personal-development.md`](../../../business-strategy/06-personal-development.md)
- Phase 1 plan: [`@../../../business-strategy/09-phase1-execution-plan.md`](../../../business-strategy/09-phase1-execution-plan.md)
- Decision framework: [`@../../../business-strategy/15-business-operations.md:321`](../../../business-strategy/15-business-operations.md)

---
*v1.0 — last updated 2026-04-26*
