---
hat: COO
owner: P3 (đề xuất)
tier: T0
version: v1.0
last_updated: 2026-04-26
status: production
---

# COO Charter

## Identity

P3 (founder #3). Vertical owner: **Logistic / Supply Chain (I06)**.
**Phạm vi**: vận hành (delivery + client + finance ops + vendor + hiring follow-through). COO biến vision của CEO thành kết quả đo được.

---

## Accountability (KPIs COO own)

| KPI | Target năm 1 | Source |
|---|---|---|
| On-time delivery rate | ≥ 90% | per-project actual vs plan |
| Customer NPS | ≥ 50 | `14-customer-success §8` |
| Project gross margin | ≥ 60% | finance dashboard |
| Churn rate (retainer) | < 10%/quý | `14-CS §7` |
| Cash collection cycle | ≤ 30 ngày | invoice → paid |
| Vendor cost / revenue | ≤ 15% | `15-ops §4` |
| 1st response time client | < 24h | Slack/email metrics |

---

## Decision Rights (no escalation)

- Project scope / timeline adjustment trong phạm vi SOW
- Client refund ≤ $1,000
- SOW < $10K (ký trực tiếp; > $10K consult CEO)
- Vendor selection + contract < $500/tháng
- Sprint plan adjustments
- Internal tools selection (Notion, Linear, Slack, Helicone, etc.)
- HR onboarding execution (sau khi CEO approve hire)
- Discount ≤ 15% off list price
- ADR for operational tools
- Project priority order trong queue

## Sign-off Authority

| Gate | File / artifact |
|---|---|
| P0 intake → proceed | `00-intake.md` |
| P1 discovery readability for client | discovery report |
| P2 proposal final → send | `02-proposal/proposal.pdf` |
| P5 plan vs client timeline | `05-planning/project-plan.md` |
| P9 acceptance + invoice | `09-final-package/acceptance-form.pdf` |
| QBR deck cho retainer client | per client |
| Vendor renewal | per vendor |

---

## Escalation Path

**Vào COO khi**:
- Project có nguy cơ trễ > 1 tuần
- Client complaint hoặc churn signal (`14-CS §7`)
- Vendor cost spike > 20%
- Hire candidate borderline (post-screen)
- 2 founders bất đồng về delivery priority
- Burnout signal từ team

**Ra COO**:
- Legal / contract risk → R-LEG + CEO
- Tech-architectural conflict → CTO
- Refund > $1K hoặc lawsuit risk → CEO

---

## Time Allocation (target tuần)

| Bucket | % | Hours / tuần |
|---|---|---|
| Project delivery management (R-PM oversight) | **25%** | 10h |
| Client communication + 1st response | 20% | 8h |
| Sales execution (warm lead handoff from CEO) | 15% | 6h |
| Finance ops (invoice, AR/AP, books review) | 10% | 4h |
| Vendor + tools management | 5% | 2h |
| Vertical work (P3 = Logistic projects) | 15% | 6h |
| Internal team 1:1 + retro | 10% | 4h |

---

## Anti-Patterns

- ❌ Skip weekly client sync để "tiết kiệm thời gian" — sync là risk-detection chính.
- ❌ Approve scope creep mà không update SOW (file `13 §5` SCR mandatory).
- ❌ Cân do mọi project — delegate P0/P1 cho R-PM agent + R-AM, COO chỉ approve gate.
- ❌ Hold cash receivables > 30 ngày — automated reminder day 7, 14, 28.
- ❌ Hire vào pipeline khi runway < 6 tháng (CEO sign).
- ❌ Bỏ qua retro vì "deadline" — retro là engine của continuous improvement.

---

## Engine Integration

COO oversees các agents:
- `R-PM` (delivery PM)
- `R-CS` (customer success agent)
- `R-AM` (account manager — closes & renewals)
- `R-FIN` (finance ops)
- `R-OPS` (vendor + tools + ADRs)
- `R-HR` (recruiting follow-through)

Daily dashboard COO review:
- Project state machine status (per `experience/workspace/SYSTEM-FLOW.md`)
- AR aging (overdue invoices)
- NPS rolling 30-day
- Cost vs budget per active project

---

## Cross-References

- Sales playbook: [`@../../../business-strategy/12-sales-playbook.md`](../../../business-strategy/12-sales-playbook.md)
- Product delivery: [`@../../../business-strategy/13-product-delivery-process.md`](../../../business-strategy/13-product-delivery-process.md)
- Customer success: [`@../../../business-strategy/14-customer-success-playbook.md`](../../../business-strategy/14-customer-success-playbook.md)
- Business operations: [`@../../../business-strategy/15-business-operations.md`](../../../business-strategy/15-business-operations.md)

---
*v1.0 — last updated 2026-04-26*
