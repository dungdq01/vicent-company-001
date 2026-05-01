# tier-5-business/ — Business Agents (Sales · Marketing · CS · Ops · Finance · Legal · HR)

**Parent**: [`@../README.md`](../README.md) (Agents registry)

---

## Mục đích

Tier 5 = **agents vận hành phần kinh doanh** của studio. Tier 1-4 *làm sản phẩm cho client*, Tier 5 *làm cho chính studio sống*: bán hàng, content, customer success, kế toán, hợp đồng, tuyển dụng, vendor.

Mỗi agent **operationalize 1 business playbook** trong `business-strategy/12-18`.

---

## Roster (10 agents)

| ID | Name | Role | Owner (T0) | Operationalizes |
|---|---|---|---|---|
| **R-SDR** | Sales Dev Rep | Outbound + lead qual | COO | `12-sales §1-2, §8` + Sales pipeline S0-S1 |
| **R-AM** | Account Manager | Discovery → close → renew → **expansion E2-E3** | COO | `12-sales §3-7, 14-CS §6` + Sales pipeline S2-S5 + Expansion pipeline E2-E3 |
| **R-MKT** | Marketing | **Marketing pipeline M0-M5** + content calendar + SEO + distribution | CEO | `16-brand §5-8, 05-channel` + **Marketing pipeline (NEW)** |
| **R-CONTENT** | Content Writer | Articles, social, newsletter | CEO | `16-brand §4` + Content pipeline C0-C4 |
| **R-CS** | Customer Success | Onboarding + QBR + churn save (defensive CS3) + **health check + opportunity scan (E0-E1 offensive)** | COO | `14-customer-success` + CS pipeline + **Expansion pipeline E0-E1** |
| **R-FIN** | Finance | Invoicing, P&L, runway tracking | COO | `15-ops §2` + Finance pipeline F0-F2 |
| **R-LEG** | Legal Drafter | SOW, NDA, contract review + **partnership terms BD2** | COO | `15-ops §1` + DPA + NDA + Partnership BD2 |
| **R-HR** | HR / Recruiting | JD, screening, onboarding | CEO | `15-ops §3` + Hiring pipeline H0-H3 |
| **R-OPS** | Operations | Vendor mgmt, tools, ADRs | COO | `15-ops §4-7` |
| **R-BIZ** | Biz Strategy | QBR brief + ICP refresh + pricing review + **Partnership pipeline BD0-BD4** | CEO | `15-ops §9, 02-customer, 10-pricing` + **Partnership pipeline (NEW)** |

---

## Filing convention

Mỗi `.md` file follows the standard **Skill Card Format** từ [`@../README.md`](../README.md) — chỉ khác:

- **Tools**: thường có `email_compose`, `crm_write`, `calendar`, `notion_write`, `pdf_generate`. Web search optional.
- **Cost target**: thấp hơn engineering agents (text-heavy, không phải research-heavy).
- **Eval criteria**: golden set là *historical client emails / proposals / contracts* anonymized.
- **Failure modes**: tone mismatch, factual hallucination về số (pricing, dates), missing legal disclaimer.

---

## Phase 1 Active (5 ưu tiên)

Theo `business-strategy/09-phase1-execution-plan.md`, 6 tháng đầu chỉ cần:

- **R-SDR** + **R-AM** (sales) → đem $$$ về
- **R-CONTENT** (newsletter + 1 article/tuần) → audience flywheel
- **R-CS** (onboarding) → giữ Founding Customers happy
- **R-FIN** (basic invoice + monthly close) → cash discipline

→ R-MKT, R-LEG, R-HR, R-OPS, R-BIZ ship Phase 2 (khi MRR > $5K).

---

## Cross-References

| Need | Path |
|---|---|
| **Marketing pipeline (M0-M5)** | [`@../../../experience/workspace/docs/pipelines-business/marketing/`](../../../experience/workspace/docs/pipelines-business/marketing/) |
| Sales pipeline (S0-S5) | [`@../../../experience/workspace/docs/pipelines-business/sales/`](../../../experience/workspace/docs/pipelines-business/sales/) |
| Content pipeline (C0-C4) | [`@../../../experience/workspace/docs/pipelines-business/content/`](../../../experience/workspace/docs/pipelines-business/content/) |
| CS pipeline (CS0-CS3) | [`@../../../experience/workspace/docs/pipelines-business/customer-success/`](../../../experience/workspace/docs/pipelines-business/customer-success/) |
| **Expansion pipeline (E0-E3)** | [`@../../../experience/workspace/docs/pipelines-business/expansion/`](../../../experience/workspace/docs/pipelines-business/expansion/) |
| **Partnership pipeline (BD0-BD4)** | [`@../../../experience/workspace/docs/pipelines-business/partnership/`](../../../experience/workspace/docs/pipelines-business/partnership/) |
| Hiring pipeline (H0-H3) | [`@../../../experience/workspace/docs/pipelines-business/hiring/`](../../../experience/workspace/docs/pipelines-business/hiring/) |
| Finance pipeline (F0-F2) | [`@../../../experience/workspace/docs/pipelines-business/finance/`](../../../experience/workspace/docs/pipelines-business/finance/) |
| **Pricing decisions (standards)** | [`@../../standards/pricing-decisions.md`](../../standards/pricing-decisions.md) |
| Brand voice | [`@../../../business-strategy/16-brand-content-kit.md`](../../../business-strategy/16-brand-content-kit.md) |

---
*Last updated: 2026-04-26*
