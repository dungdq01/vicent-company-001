# Memory: B01-I06 — Shipment Volume Forecasting × Logistics
**Module:** Phase 3 — Matrix Node B01-I06  
**Completed:** 2026-04-03  
**Status:** Draft (depthLevel 2)  
**Workflow:** C (light) — R-α → R-γ → R-σ  
**Prerequisites:** B01 GO ✅ | I06 GO ✅

---

## Core Insight

**The binding constraint is data quality (4/10), not algorithm availability.**
LightGBM + Prophet is the right tool for Tier 1. DeepAR and foundation models are Tier 2+ only.

---

## Key Findings

### Problem Definition
- **Primary target**: `shipment_count` (start here, not weight/CBM)
- **3 horizons**: Operational (1–7 days, LightGBM), Tactical (1–4 weeks, DeepAR), Strategic (1–3 months, trend model)
- **Primary key**: `(shipment_date, origin_hub_id, destination_province_id, customer_id, service_type)`
- **Critical data constraint**: province-level destination only — raw address strings cannot be used as keys in Vietnam

### Logistics-Specific Features (top lift)
1. Customer industry segment (FMCG vs industrial vs e-commerce) — 15–25% WMAPE improvement vs. generic
2. Tet countdown (days to shutdown + days after reopening) — MUST be separate additive component, not dummy variable
3. TikTok double-days (11/11, 12/12, 9/9): 2–4x spike, 3-week lag effect
4. Fleet capacity fill rate (operational constraint signal)
5. Pre-Tet surge window (T-21 to T-7 days)

### Algorithm Tier Architecture
| Tier | Lane Type | Algorithm | Data Req |
|------|-----------|-----------|----------|
| Tier 1 MVP | All | LightGBM + Prophet (Tet) + Croston | 12 months, TMS only |
| Tier 2 | High-volume (>20/week) | LightGBM + DeepAR ensemble | 18+ months, clean pipeline |
| Tier 2 | Cold-start | Chronos-2 (foundation model) | <60 observations |
| Tier 2 | Sparse/intermittent | TSB (Teunter-Syntetos-Babai) | Any |
| Tier 3 | Platform-scale | Fine-tuned Chronos-2 + FlowRec | Multi-year, multi-client |

**Finding from benchmark**: Transformer-XGBoost-LightGBM hybrid achieved WMAPE 9.2%, outperforming LSTM by 23.5% in logistics context.

### WMAPE Benchmarks for Vietnam 3PL
- Manual/naive baseline: **35–55%** (what most Vietnam 3PLs operate today)
- MVP target (Tier 1): **< 30%**
- Production target (Tier 2): **< 20%**
- Excellent (Tier 3): **< 15%**

### ROI Estimate
- Scenario: WMAPE 40% → 20% for Smartlog-scale 3PL
- Annual benefit: **~VND 3 tỷ** (empty truck reduction + overtime + SLA breach avoidance)
- Investment: VND 700M–1B Year 1
- Payback: **6–9 months** (MEDIUM confidence — needs validation with actual Smartlog data)

### Pilot Recommendation
- **Client**: Mondelez Vietnam (FMCG, Smartlog đang phục vụ, Tet gifting spike = clear win)
- **Scope**: 1 product category, HCMC → South Vietnam routes, 7-day rolling forecast
- **Duration**: 8 weeks
- **Success criteria**: WMAPE < 30%
- **Pricing**: VND 15–25M/month flat fee (pilot phase)

### Top 3 Risks
1. **Tet cold-start** (HIGH): client with <2 years data → cannot trust Tet-period forecast → clarify data vintage upfront
2. **Data quality at 4/10** (HIGH): 2–4 weeks mandatory data cleaning before training — include in project scope
3. **Operations manager trust gap** (MEDIUM): logistics planners trust gut feel → use SHAP explainability + manual override tracking from Day 1

---

## Related Matrix Nodes (planned)
- **B06-I06**: Route Optimization × Logistics — uses shipment forecast as capacity planning input
- **B07-I06**: Anomaly Detection × Logistics — shares Evidently AI monitoring infrastructure with B01-I06
- **B01-I04**: Production Forecasting × Manufacturing — same LightGBM core, different features

---

## Files Produced
| File | Path |
|------|------|
| Intersection Report (EN) | docs/reports/B01-I06/intersection-report.md |
| Feasibility Report (EN) | docs/reports/B01-I06/feasibility-report.md |
| Final Report (VI) | docs/reports/B01-I06/final-report.md |
| Production JSON | data/matrix/B01-I06.json |

## Quality Gate
| Check | Result |
|-------|--------|
| JSON valid | ✅ |
| category == matrix | ✅ |
| All schema fields populated | ✅ 15/15 |
| algorithmRecommendation tiered | ✅ |
| roiEstimate | ✅ |
| pilotRecommendation | ✅ |
| prerequisites documented | ✅ |
| graph.json updated | ✅ |

---

*Memory by R-σ (Ms. Scribe) | MAESTRO Knowledge Graph Platform*
