# AI Industry Taxonomy — MAESTRO Knowledge Graph Platform

**Version:** 1.0  
**Date:** 2026-03-31  
**Authority:** Project Manager (Cascade)  
**Status:** SSOT for industry classification and tier grouping

> Đây là tài liệu phân loại chính thức 20 Industries (Ngành nghề) của MAESTRO.  
> Mọi agent phải sử dụng IDs và tên theo đúng registry này (xem thêm `docs/CONVENTIONS.md §6`).

---

## Tổng quan: 5 Tiers of Industry Readiness (Vietnam Context)

```
TIER 1 — HIGH PRIORITY     (AI investment cao, ROI rõ, data sẵn có)
TIER 2 — GROWTH MARKETS    (AI adoption đang tăng tốc, demand mạnh)
TIER 3 — EMERGING MARKETS  (AI awareness tăng, đang pilot)
TIER 4 — REGULATED MARKETS (High value nhưng compliance nặng)
TIER 5 — SPECIALIZED       (Niche AI applications, longer cycle)
```

---

## TIER 1 — HIGH PRIORITY MARKETS
> **Đặc điểm:** Dữ liệu dồi dào, AI team đã hình thành, ngân sách AI rõ ràng, ROI có thể đo trong 6-12 tháng.

| ID | Canonical Name | Short Name | AI Maturity | Agent Card |
|----|---------------|------------|-------------|-----------|
| **I01** | Retail & E-commerce | Retail | High (L2-L3) | R-D01 |
| **I02** | Finance & Banking | Finance | High (L2-L3) | R-D02 |
| **I04** | Manufacturing | Manufacturing | Medium-High (L2) | R-D04 |
| **I06** | Logistics & Supply Chain | Logistics | High (L2) | R-D06 |

**Key pain points chung:**
- Demand forecasting (B01)
- Fraud/anomaly detection (B07, B13)
- Process automation (B02, B04)
- Customer personalization (B05, B08)

**Recommended starting baselines:** B01, B07, B13, B02

---

## TIER 2 — GROWTH MARKETS
> **Đặc điểm:** AI adoption đang tăng nhanh ở Vietnam, data infrastructure đang xây, nhiều pilot projects.

| ID | Canonical Name | Short Name | AI Maturity | Agent Card |
|----|---------------|------------|-------------|-----------|
| **I03** | Healthcare & Hospital | Healthcare | Medium (L1-L2) | R-D03 |
| **I07** | Energy & Utilities | Energy | Medium (L1-L2) | R-D07 |
| **I09** | Education & EdTech | Education | Low-Medium (L1) | R-D09 |
| **I10** | Telecom | Telecom | Medium-High (L2) | R-D10 |
| **I18** | Marketing & Advertising | Marketing | High (L2) | R-D18 |

**Key pain points chung:**
- Predictive maintenance (B01, B07)
- Personalized recommendations (B05, B08)
- Document processing (B02, B04)
- Customer churn prediction (B13)

**Recommended starting baselines:** B01, B05, B07, B08

---

## TIER 3 — EMERGING MARKETS
> **Đặc điểm:** AI awareness tăng nhanh, đang ở giai đoạn pilot và proof-of-concept, dữ liệu chưa đồng nhất.

| ID | Canonical Name | Short Name | AI Maturity | Agent Card |
|----|---------------|------------|-------------|-----------|
| **I05** | Agriculture & AgriTech | Agriculture | Low-Medium (L1) | R-D05 |
| **I08** | Construction & Built Environment | Construction | Low (L1) | R-D08 |
| **I12** | Media & Entertainment | Media | Medium (L1-L2) | R-D12 |
| **I13** | Transportation & Mobility | Transportation | Medium (L1-L2) | R-D13 |
| **I14** | Food & Beverage / Hospitality | F&B | Low-Medium (L1) | R-D14 |

**Key pain points chung:**
- Route/resource optimization (B06)
- Computer vision for quality/safety (B03)
- Demand forecasting (B01)
- Content recommendation (B05, B09)

**Recommended starting baselines:** B01, B03, B06, B09

---

## TIER 4 — REGULATED MARKETS
> **Đặc điểm:** AI value rất cao nhưng regulatory compliance (GDPR, medical regulations, financial compliance) là rào cản lớn. Chu kỳ bán hàng dài hơn.

| ID | Canonical Name | Short Name | AI Maturity | Agent Card |
|----|---------------|------------|-------------|-----------|
| **I11** | Legal & Government | Legal | Low-Medium (L1) | R-D11 |
| **I15** | Insurance | Insurance | Medium (L1-L2) | R-D15 |
| **I16** | Pharmaceutical & Life Sciences | Pharma | Medium (L2) | R-D16 |

**Key pain points chung:**
- Contract/document analysis (B02, B04)
- Risk scoring (B13, B07)
- Regulatory search (B12)
- Fraud detection (B07, B13)

**Recommended starting baselines:** B02, B04, B07, B13

---

## TIER 5 — SPECIALIZED MARKETS
> **Đặc điểm:** AI applications rất đặc thù, yêu cầu deep domain expertise, thị trường Vietnam còn nhỏ nhưng đang tăng trưởng.

| ID | Canonical Name | Short Name | AI Maturity | Agent Card |
|----|---------------|------------|-------------|-----------|
| **I17** | Gaming & Interactive | Gaming | Medium-High (L2) | R-D17 |
| **I19** | HR & Workforce Management | HR | Low-Medium (L1) | R-D19 |
| **I20** | Cybersecurity & IT Operations | Cybersecurity | Medium (L1-L2) | R-D20 |

**Key pain points chung:**
- Player/employee analytics (B13, B07)
- Content generation (B09, B12)
- Threat detection (B07, B10)
- Conversational AI (B08)

**Recommended starting baselines:** B07, B08, B09, B13

---

## Industry Readiness Heatmap (Vietnam 2026)

```
                    Tier 1    Tier 2    Tier 3    Tier 4    Tier 5
AI Budget            ████      ███       ██        ██        █
Data Availability    ████      ███       ██        ███       ██
Talent Pool          ███       ███       ██        ██        ██
Regulatory Risk      ██        ██        █         ████      ███
Time to ROI          Fast      Medium    Slow      Slow      Variable
```

---

## Priority Baseline per Industry (Top 3)

| Industry | #1 Baseline | #2 Baseline | #3 Baseline |
|----------|------------|------------|------------|
| I01 Retail | B01 Forecasting | B05 Recommendation | B13 Tabular ML |
| I02 Finance | B07 Anomaly Detection | B13 Tabular ML | B02 Doc Intelligence |
| I03 Healthcare | B03 Computer Vision | B02 Doc Intelligence | B13 Tabular ML |
| I04 Manufacturing | B07 Anomaly Detection | B03 Computer Vision | B01 Forecasting |
| I05 Agriculture | B01 Forecasting | B03 Computer Vision | B07 Anomaly Detection |
| I06 Logistics | B01 Forecasting | B02 Doc Intelligence | B06 Optimization |
| I07 Energy | B01 Forecasting | B07 Anomaly Detection | B06 Optimization |
| I08 Construction | B03 Computer Vision | B07 Anomaly Detection | B02 Doc Intelligence |
| I09 Education | B05 Recommendation | B08 Conversational AI | B09 Generative AI |
| I10 Telecom | B07 Anomaly Detection | B01 Forecasting | B13 Tabular ML |
| I11 Legal | B02 Doc Intelligence | B04 NLP | B12 Search & RAG |
| I12 Media | B05 Recommendation | B09 Generative AI | B03 Computer Vision |
| I13 Transportation | B01 Forecasting | B06 Optimization | B07 Anomaly Detection |
| I14 F&B | B01 Forecasting | B05 Recommendation | B08 Conversational AI |
| I15 Insurance | B07 Anomaly Detection | B13 Tabular ML | B02 Doc Intelligence |
| I16 Pharma | B15 Simulation | B07 Anomaly Detection | B09 Generative AI |
| I17 Gaming | B13 Tabular ML | B07 Anomaly Detection | B10 Agentic AI |
| I18 Marketing | B13 Tabular ML | B12 Search & RAG | B09 Generative AI |
| I19 HR | B13 Tabular ML | B05 Recommendation | B04 NLP |
| I20 Cybersecurity | B07 Anomaly Detection | B13 Tabular ML | B10 Agentic AI |

---

## Mapping: Industries → Agent Skill Cards

| ID | Agent Card | File |
|----|-----------|------|
| I01 | R-D01 | `.agents/tier-3-domain/R-D01-retail-expert.md` |
| I02 | R-D02 | `.agents/tier-3-domain/R-D02-finance-expert.md` |
| I03 | R-D03 | `.agents/tier-3-domain/R-D03-healthcare-expert.md` |
| I04 | R-D04 | `.agents/tier-3-domain/R-D04-manufacturing-expert.md` |
| I05 | R-D05 | `.agents/tier-3-domain/R-D05-agriculture-expert.md` |
| I06 | R-D06 | `.agents/tier-3-domain/R-D06-logistics-expert.md` |
| I07 | R-D07 | `.agents/tier-3-domain/R-D07-energy-expert.md` |
| I08 | R-D08 | `.agents/tier-3-domain/R-D08-construction-expert.md` |
| I09 | R-D09 | `.agents/tier-3-domain/R-D09-education-expert.md` |
| I10 | R-D10 | `.agents/tier-3-domain/R-D10-telecom-expert.md` |
| I11 | R-D11 | `.agents/tier-3-domain/R-D11-legal-expert.md` |
| I12 | R-D12 | `.agents/tier-3-domain/R-D12-media-expert.md` |
| I13 | R-D13 | `.agents/tier-3-domain/R-D13-transport-expert.md` |
| I14 | R-D14 | `.agents/tier-3-domain/R-D14-fnb-hospitality-expert.md` |
| I15 | R-D15 | `.agents/tier-3-domain/R-D15-insurance-expert.md` |
| I16 | R-D16 | `.agents/tier-3-domain/R-D16-pharma-expert.md` |
| I17 | R-D17 | `.agents/tier-3-domain/R-D17-gaming-expert.md` |
| I18 | R-D18 | `.agents/tier-3-domain/R-D18-marketing-expert.md` |
| I19 | R-D19 | `.agents/tier-3-domain/R-D19-hr-expert.md` |
| I20 | R-D20 | `.agents/tier-3-domain/R-D20-cybersecurity-expert.md` |

---

*AI Industry Taxonomy v1.0 — MAESTRO Knowledge Graph Platform*  
*Cross-reference: `docs/CONVENTIONS.md §6` (canonical names) · `agent-team-config.md §I` (agent catalog)*
