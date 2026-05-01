# Feasibility Report: B01-I06 — Shipment Volume Forecasting for Logistics
**Agent:** R-γ (Dr. Sentinel)
**Date:** 2026-04-03
**Matrix Node:** B01 × I06
**Classification:** Focused intersection assessment — does NOT repeat parent node content

---

## 1. Feasibility Assessment

### 1.1 Overall Feasibility Score: 6.5 / 10

**Justification:** The technical problem is well-understood and solvable. The algorithms exist. The ROI is real. The score is held below 7.0 by the I06 data readiness gap (4/10), which is the single largest risk to project success. This is not a "if the data is clean, it will work" qualifier — it is a structural constraint that determines which tier is reachable and in what timeframe. A Tier 1 MVP is feasible within 10 weeks with realistic data prep effort. A Tier 2 production deployment is feasible in 6–9 months if a data quality investment is made in parallel. Tier 3 is feasible in 18+ months.

**Confidence: HIGH** (score grounded in I06 data readiness findings and B01 learnings on algorithm feasibility thresholds)

---

### 1.2 Data Feasibility: What 4/10 Data Readiness Means for B01

I06's data readiness score of 4/10 reflects specific structural gaps, not a general data absence. The breakdown for B01-I06:

| Data Gap (I06) | Impact on B01 Forecasting |
|---|---|
| No unified data lake — data in TMS, spreadsheets, driver app | Feature engineering requires 2–4 weeks of ETL before any model work begins |
| Address normalization incomplete | OD lane definition unstable — province-level aggregation is the only reliable granularity at MVP |
| GPS gaps and manual override timestamps | Operational features (fleet fill rate, staging utilization) are unreliable — defer these to Tier 2 |
| Return leg data missing | Weight/CBM forecasting unreliable — start with shipment count only |
| Document digitization gaps | Promo calendar features must be manually sourced from client at MVP |

**Net implication:** A Vietnam 3PL entering a B01 forecasting project today should budget 2–4 weeks of data extraction and cleaning before any model training begins. The training dataset for MVP will likely be 12–18 months of historical shipments pulled from TMS, with significant manual cleaning. This is achievable; it just must be scoped explicitly in the project plan.

**What 4/10 does NOT mean:** It does not mean the data is unsuitable for forecasting. Vietnam 3PLs have transactional shipment records — they are not starting from zero. The gaps are in ancillary operational and feature data, not in the core shipment fact table. A minimum viable forecast can be built on TMS history alone.

**Confidence: MEDIUM** (based on I06 domain findings and R-D06 data quality notes; Smartlog-specific data audit not yet completed)

---

### 1.3 Model Feasibility: Algorithms Realistic for Vietnam 3PL Data Quality

Given 4/10 data readiness, this is the algorithm shortlist that is realistically deployable — not the full B01 algorithm menu:

| Algorithm | Feasible at MVP? | Condition |
|---|---|---|
| **LightGBM (quantile regression)** | YES | Requires 52+ weeks of clean shipment history. The most robust choice for messy data due to tree-based architecture's tolerance for missing features. |
| **Prophet (Tet component)** | YES | Use only for Tet spike modeling as an additive correction on top of LightGBM — not as a standalone model. |
| **Croston/TSB** | YES (for sparse lanes) | Low data requirements. Implement via Nixtla statsforecast library. Zero infrastructure requirement. |
| **ETS/SARIMA** | BASELINE ONLY | Use as benchmark. Cannot ingest exogenous features — immediate ceiling in logistics context. |
| **DeepAR** | NO at MVP; YES at Tier 2 | Requires GPU serving infrastructure and 18+ months of data. Do not include in MVP scope. |
| **N-BEATS** | NO at MVP | Requires clean 2+ year history. Not appropriate for 4/10 data readiness context. |
| **Chronos-2 (foundation model)** | YES (cold-start only) | Use specifically for new customer onboarding or new lanes with <60 observations. Not a replacement for trained models on existing lanes. |
| **FlowRec reconciliation** | NO — defer to Tier 3 | Requires stable versioned network graph with transit hub mapping. Data pre-condition not met at 4/10 readiness. |

**Bottom line:** LightGBM + Prophet ensemble (Tet component) + Croston for sparse lanes is the full algorithm stack that is both technically sound and operationally realistic at Vietnam 3PL data readiness levels. Everything else is Tier 2 or Tier 3.

**Confidence: HIGH**

---

### 1.4 Talent Feasibility

The talent requirement at the intersection of ML forecasting and logistics operations is more specific than either domain alone. Assessment:

| Role | Availability in Vietnam | Risk Level |
|---|---|---|
| ML engineer with time series experience | MEDIUM — available but competitive market | MEDIUM |
| ML engineer who also understands logistics operations (fleet planning, lane economics, SLA dynamics) | LOW — rare profile; requires either hiring logistics-background person and training ML, or ML engineer embedded with ops team for 2–3 months | HIGH |
| Data engineer for TMS ETL pipeline | MEDIUM — available; not logistics-specific | LOW |
| Logistics operations manager willing to validate model outputs | PRESENT (internal Smartlog) | LOW (availability), HIGH (adoption risk — see Section 2.4) |

**Practical recommendation:** Do not search for the unicorn ML+logistics profile. Instead, structure the team as an ML engineer paired with a logistics operations analyst from Smartlog's own team. The analyst provides domain labeling (which weeks had promotions, which lanes were capacity-constrained, what the Tet window was for each client) while the ML engineer builds the model. This pairing also accelerates adoption because the internal analyst becomes the model champion.

**Confidence: MEDIUM**

---

### 1.5 Time-to-Value: First Useful Forecast Output

| Milestone | Weeks from Project Start | Gate Condition |
|---|---|---|
| Data extraction from TMS + initial cleaning | Week 1–3 | TMS access granted, ETL scripts running |
| Exploratory data analysis — confirm minimum 52 weeks of usable data | Week 3–4 | Data volume and quality confirmed |
| LightGBM MVP model trained, initial accuracy measured | Week 5–6 | WMAPE measured on hold-out set |
| Tet component added (Prophet), re-evaluated | Week 7 | Tet cycle present in training data |
| First operational forecast delivered to operations manager | Week 8–10 | WMAPE < 30% on 7-day horizon |

**First useful forecast output: 8–10 weeks from project start.** This assumes Smartlog-owned pilot data (not requiring third-party data sharing agreements) and dedicated 0.5 FTE ML engineer + 0.25 FTE data engineer + 0.25 FTE logistics analyst.

**Confidence: MEDIUM** (timeline is realistic but depends on TMS data quality; add 2 weeks buffer if first data pull reveals significant cleaning requirement)

---

## 2. Risks Specific to This Intersection

### 2.1 Tet Cold-Start Risk — CRITICAL

**The risk:** If a client has fewer than 2 years of shipment data with Smartlog, their training set contains at most one Tet cycle — and possibly zero if their Smartlog relationship started after the most recent Tet. A model trained without a complete Tet cycle in its history **cannot produce reliable forecasts for the Tet period.** Standard seasonality decomposition will underestimate the Tet peak by 40–60% based on industry evidence.

**Mitigation options (ranked by reliability):**
1. **Client-provided historical data:** Require new clients to provide 24 months of shipment data from their prior carrier as a contract condition. This is a commercial negotiation, not a technical solution — but it is the highest-value mitigation.
2. **Tet multiplier from analogous clients:** Use the Tet spike ratio (peak/baseline) from existing clients in the same industry segment as a hard-coded multiplier for the new client's forecast. This is a calibrated assumption, not a prediction — communicate it as such.
3. **Chronos-2 in-context learning:** Feed the model historical Tet patterns from similar logistics series. Better than nothing; not as good as client-specific Tet history.

**Risk rating: HIGH** if client has <2 years of data. MEDIUM if client provides prior carrier history.

**Confidence: HIGH** (this risk is structural and well-documented in B01 data history requirements)

---

### 2.2 Sparse Route Risk — HIGH for Rural/Tier-3 Lanes

**The risk:** Many origin-destination pairs in Vietnam 3PL networks have intermittent demand — zero shipments on 50–70% of days. Standard LightGBM models trained on WMAPE or MAE objectives will predict near-zero for these lanes systematically, producing either useless point forecasts or no forecast at all. This is the same zero-inflation problem in retail demand forecasting but more severe because logistics OD pairs multiply across a network.

**Mitigation:**
- Implement Croston/TSB from the Nixtla statsforecast library as the standard sparse lane model. This requires no GPU infrastructure and runs in minutes.
- Define a sparse lane threshold: if a lane has >40% zero-volume days over trailing 90 days, route it to Croston; otherwise to LightGBM.
- Do not attempt to improve sparse lane accuracy through more complex models (DeepAR, N-BEATS) at Tier 1 — the sparse signal is insufficient to train complex models on.

**Risk rating: MEDIUM** (manageable with explicit model routing; the risk is failing to implement the routing and applying LightGBM universally)

**Confidence: HIGH**

---

### 2.3 Data Quality Risk at 4/10 Readiness

**Specific failure modes most likely in Vietnam 3PL context:**

| Data Quality Issue | Probability of Occurrence | Impact on Forecast | Mitigation |
|---|---|---|---|
| Cancelled orders included in raw TMS export | HIGH (>70% of 3PLs) | Inflates demand signal by 5–15% depending on cancellation rate | Filter `is_cancelled = TRUE` before model training; validate against finance invoice records |
| GPS gaps on rural routes | HIGH | Operational features (fleet fill rate) unreliable | Defer GPS-derived features to Tier 2; use manual dispatch records at MVP |
| Manual timestamp entry (departure/arrival 2–4 hours late) | HIGH | Distorts day-of-week patterns | Use first barcode scan at destination, not manual status update |
| Hub consolidation OD double-counting | MEDIUM | Inflates OD pair volume — HCMC→Hanoi appears as two records via Da Nang transit | Build transit hub normalization layer using Smartlog's hub network map |
| Tet data entry degradation | MEDIUM | Highest error rate in the most critical planning period | Flag Tet window explicitly; apply Huber loss during Tet training window |

**Overall data quality risk:** The 4/10 readiness score is accurate. Budget 2–4 weeks of dedicated data cleaning before model training. Do not skip this step to accelerate the timeline — dirty training data produces confidently wrong forecasts that undermine client trust permanently.

**Risk rating: HIGH** (pre-project; MEDIUM post-cleaning)

**Confidence: HIGH**

---

### 2.4 Business Adoption Risk — Operations Manager Trust Gap

**The risk:** Logistics operations managers at Vietnam 3PLs have developed a working heuristic system over years — they know from experience that Mondelez ships heavy on Tuesdays before month-end, that the Hanoi run always spikes the Friday before a public holiday, that the Da Nang route is unreliable in typhoon season. An AI model that produces WMAPE of 22% may still be overridden 40–60% of the time if the operations manager does not trust it, eliminating the operational value of the investment.

**Mitigation approach:**
1. **Explainability first:** Use SHAP values from LightGBM to show the operations manager exactly why the model predicts high volume next Tuesday — "because Mondelez always ships 20–30% above average on the first Tuesday after month-end and this Tuesday follows that pattern." Explainability converts a black box into a decision support tool.
2. **Track and display manual override outcomes:** Every time the operations manager overrides the model and the model was correct, record it. After 8 weeks, show the override accuracy vs. model accuracy. This builds trust through evidence, not assertion.
3. **Never replace — augment:** Position the model as "your gut + data." The operations manager sets the override; the model suggests. Remove the perception of replacement.
4. **Win the first week:** Ensure the first 7-day operational forecast is demonstrably better than the manager's estimate on at least 3 out of 7 days. Stage the MVP launch to start in a "normal" week — not a holiday week, not a promotion week — where the model's advantage is clearest.

**Risk rating: MEDIUM** (manageable with correct rollout strategy; HIGH if skipped)

**Confidence: HIGH**

---

### 2.5 Over-Engineering Risk

**The risk:** Recommending DeepAR + Feast feature store + Airflow + probabilistic quantile serving for a client whose decision-makers look at a whiteboard in the morning. The over-engineering risk is particularly acute because B01 research (intersection-report.md) documents sophisticated architectures that are appropriate at scale but dangerous if scoped too early.

**Hard rules for Smartlog context:**
- Tier 1 output must be a CSV or Google Sheet. No API serving. No dashboard. Forecasts are emailed or shared in Sheets.
- No GPU infrastructure before Tier 2 is validated. LightGBM runs on a standard laptop. This is a feature, not a limitation.
- No Airflow before Tier 2. Manual pipeline trigger is acceptable for one client, one product line.
- DeepAR is Tier 2 only. Do not include it in MVP design documents — it creates stakeholder confusion and scope creep.
- FlowRec network reconciliation is Tier 3 only — defer until multi-hub network is in scope.

**Risk rating: MEDIUM** (structural risk from engineering enthusiasm; mitigated by explicit tier boundaries)

**Confidence: HIGH**

---

## 3. Three-Tier Implementation Plan for Vietnam 3PL

### Tier 1 — MVP: Smartlog Pilot (1 Client, 1 Product Line)

**Objective:** Prove that AI forecasting improves on manual/naive baseline for one client on one route cluster. Generate a success story. Build internal confidence.

**Technical Stack:**
- **Primary model:** LightGBM with quantile regression (P10/P50/P90 outputs)
- **Tet component:** Prophet additive seasonality layer, applied as a post-processing correction to LightGBM output during Tet window (Day T-14 to Day T+3)
- **Sparse lanes:** Croston-SBA via Nixtla statsforecast, applied to lanes with >40% zero days
- **Feature set:** Day of week, week of year, Tet countdown, month-end flag, customer segment, service type, trailing 4-week moving average, trailing 4-week standard deviation (volatility feature)
- **Output format:** Google Sheets / Excel — 7-day forward forecast, updated weekly by running a Python script manually
- **Infrastructure:** Single Python environment on analyst laptop or basic cloud VM (no orchestration, no serving layer)

**Data Requirements:**
- Minimum 12 months of shipment history for the pilot client
- Confirmed Tet cycle present in training data (at least one complete Tet window)
- Cancelled orders identified and filtered
- Province-level OD confirmed (not raw address)

**Timeline:** 6–10 weeks

| Week | Activity |
|---|---|
| 1–3 | TMS data extraction, cleaning, EDA, lane inventory |
| 4–5 | LightGBM MVP training, initial WMAPE measurement |
| 6–7 | Tet component integration, Croston routing for sparse lanes |
| 8–10 | Operational delivery: weekly forecast to operations manager, feedback collection |

**Success Metric:** WMAPE < 30% on 7-day horizon for the pilot client's top 5 lanes by volume. This threshold represents improvement over naive baseline (typically 35–50% WMAPE) and sets the foundation for Tier 2 investment justification.

**Budget Estimate:** 1 ML engineer (0.5 FTE × 10 weeks) + 1 data analyst (0.25 FTE × 10 weeks) + 1 Smartlog operations analyst (0.25 FTE × 10 weeks). Total: approximately 7 person-weeks of effort. Infrastructure cost: near zero at this tier.

---

### Tier 2 — Production: Multi-Client Automated Pipeline

**Objective:** Scale the MVP to 3+ clients with an automated weekly pipeline. Achieve WMAPE targets that justify commercial pricing.

**Technical Stack:**
- **Primary model:** LightGBM for high-volume lanes (>20 shipments/week)
- **Medium lanes:** DeepAR (joint model across related lanes, SageMaker hosted) — introduced at this tier because GPU infrastructure cost is now justified across 3+ clients
- **Sparse lanes:** Croston/TSB via Nixtla (carried from Tier 1)
- **Pipeline:** Apache Airflow DAG — weekly trigger, automated feature extraction from TMS, model inference, output to client-facing dashboard
- **Feature store:** SQL views on PostgreSQL (not Feast — defer Feast to Tier 3 per B01-learnings.md guidance)
- **Output format:** Client dashboard (Metabase or Superset) + email alert for weeks where forecast indicates >20% above-average demand

**Data Requirements:**
- 18+ months of history per client
- 3+ clients with validated data
- Automated TMS connector (Python script or REST API to TMS)

**Timeline:** 3–6 months from Tier 1 MVP completion

**Success Metrics:**
- WMAPE < 20% on 7-day horizon
- WMAPE < 25% on 4-week horizon
- Pipeline runs automatically with <2 hours weekly maintenance

**Go-condition from B01-learnings.md:** Before committing to Tier 2 build, validate: (a) pilot client profile confirmed, (b) DeepAR GPU cost benchmarked against revenue per client, (c) Airflow deployment tested in non-critical path spike before it enters the weekly production DAG.

---

### Tier 3 — Platform: Multi-Tenant SaaS

**Objective:** Deploy a platform-grade forecasting service that supports multiple logistics clients with automated retraining, drift detection, and hierarchical reconciliation.

**Technical Stack:**
- **Foundation model:** Chronos-2 fine-tuned on Smartlog's accumulated logistics data (replaces cold-start Chronos-2 zero-shot from Tier 1)
- **Reconciliation:** MinT on tree hierarchy for province-level aggregation; FlowRec upgrade for hub transit network (once versioned network graph is stable)
- **Feature store:** Feast (introduced here, per B01-learnings.md — after dedicated spike validates implementation)
- **Retraining:** Automated monthly retraining with walk-forward cross-validation gate — WMAPE regression triggers alert
- **Drift detection:** Evidently AI integration (shared infrastructure with B07 Anomaly Detection module)
- **Multi-tenancy:** Per-client model versioning, separate feature pipelines, shared serving infrastructure

**Timeline:** 12+ months from Tier 2 completion

**Success Metrics:**
- WMAPE < 15% on 7-day horizon for Tier 1 (high-volume) lanes
- Automated retraining with zero manual intervention
- Drift detection alert rate <5% false positives per month

---

## 4. ROI Analysis for Smartlog Context

### 4.1 Baseline Assumptions

For a Smartlog-scale mid-market Vietnam 3PL:
- Monthly shipment volume: ~50,000 shipments/month (order of magnitude for a mid-market 3PL with clients like Mondelez/Baconco)
- Average revenue per shipment: VND 150,000–250,000 (mixed service types)
- Fleet: 30–80 owned/leased trucks, significant subcontractor reliance
- Average truck-day cost (owned): VND 2,000,000–3,500,000 (driver + fuel + depreciation)
- Subcontractor premium over owned fleet: 20–35%
- Labor overtime rate: 1.5× base during surge periods

These are estimates based on Vietnam logistics market data from I06-learnings.md and public 3PL benchmarks. Primary research with Smartlog is required to confirm.

**Confidence: MEDIUM** (order of magnitude correct; exact figures require client data audit)

---

### 4.2 Scenario: WMAPE Improvement from 40% → 20% (Tier 1 MVP → Tier 2)

**Impact 1: Capacity Utilization — Fewer Empty/Underloaded Truck Runs**

Current state: High forecast error leads to over-dispatching trucks on days when volume is lower than expected (empty runs) and scrambling for subcontractors on days when volume is higher than expected (expensive last-minute bookings).

Conservative estimate: 5% reduction in empty truck-days per month.
- At 50 trucks × 22 working days = 1,100 truck-days/month
- 5% × 1,100 = 55 truck-days saved from empty runs
- 55 × VND 2,500,000 (average truck-day cost) = **VND 137,500,000/month (~VND 1.65B/year)**

**Impact 2: Labor Overtime Reduction**

Current state: Understated demand forecasts cause reactive staffing — emergency calls to drivers, overtime on pickup and sorting lines, especially in pre-Tet period.

Conservative estimate: 10% reduction in overtime labor hours per month.
- Assume VND 200,000,000/month current overtime spend (estimate for mid-market 3PL)
- 10% reduction = **VND 20,000,000/month (~VND 240M/year)**

The Tet period alone accounts for 40–50% of annual overtime spend. A Tet spike forecast within ±15% of actual reduces emergency staffing in the 7 days pre-Tet, which is where the most expensive overtime is concentrated.

**Impact 3: SLA Breach Reduction**

Current state: Understated volume forecasts → insufficient drivers → late pickups → SLA breach penalties. For industrial B2B clients (PTSC, Baconco), penalties are 1–3% of shipment value.

Conservative estimate: Reducing forecast-driven SLA breaches by 30% (not all SLA breaches are forecast-driven).
- Assume VND 500,000,000/month in SLA penalties (estimate; requires Smartlog data to confirm)
- 30% reduction × 50% attributable to forecast error = **VND 75,000,000/month avoided (~VND 900M/year)**

**Impact 4: Subcontractor Premium Avoidance**

Current state: Last-minute subcontractor bookings when owned fleet is exhausted cost 20–35% premium over planned rates.
- Conservative estimate: 8% reduction in last-minute subcontractor bookings through better forward visibility
- Assume VND 300,000,000/month in subcontractor costs: 8% × VND 300M = **VND 24,000,000/month (~VND 288M/year)**

---

### 4.3 Realistic Year 1 ROI Summary

| Impact Category | Monthly VND | Annual VND |
|---|---|---|
| Capacity utilization (empty truck reduction) | 137,500,000 | 1,650,000,000 |
| Labor overtime reduction | 20,000,000 | 240,000,000 |
| SLA breach penalty avoidance | 75,000,000 | 900,000,000 |
| Subcontractor premium avoidance | 24,000,000 | 288,000,000 |
| **Total benefit** | **256,500,000** | **3,078,000,000** |

**Implementation cost estimate (Tier 1 + Tier 2):**
- Personnel: 2–3 FTE × 9 months = VND 600,000,000–900,000,000 (blended Vietnam AI talent rate)
- Infrastructure (Tier 2 AWS/GCP): VND 30,000,000–60,000,000/year
- Total investment Year 1: approximately VND 700,000,000–1,000,000,000

**Payback period:** 6–9 months from Tier 2 go-live (consistent with I06-learnings.md estimate of 6–9 month payback for B01 in logistics context)

**Year 1 ROI:** ~200–350% depending on operational efficiency captured

**Confidence: MEDIUM** — directionally correct; exact figures require Smartlog operational data. The largest uncertainty is the SLA breach estimate, which varies significantly by client contract terms.

---

## 5. Go-to-Market for B01-I06

### 5.1 Pilot Client Selection: Mondelez Vietnam

**Recommended first pilot client: Mondelez Vietnam** (confirmed by I06-learnings.md as ideal FMCG anchor).

**Why Mondelez is the right first client:**
- FMCG demand pattern is the most ML-tractable in the logistics client portfolio — weekly seasonality, strong Tet cycle, promotion-driven spikes are all well-modeled by LightGBM + Prophet
- Mondelez Vietnam's 200K retail points distribution problem creates high forecast value density — improvements matter operationally
- FMCG clients are accustomed to demand forecasting from their own supply chain planning — they understand the concept and can provide promo calendars (a critical feature input)
- Mondelez Tet-gifting SKU spike (3–5x baseline) is a concrete, visible problem that a successful AI forecast can demonstrate improvement on
- Success with Mondelez creates a reference case that speaks to other FMCG clients (Unilever, Nestlé, P&G distribution) who face the same pattern

**Avoid as first pilot:**
- Baconco (fertilizer): lumpy, agricultural-cycle demand is harder to model and requires external crop calendar data — higher complexity for first project
- PTSC (oil & gas): project-driven irregular demand — AI forecasting is the wrong tool; scenario planning is more appropriate
- E-commerce SME clients: too volatile, platform-event-driven — Tet and double-day spikes require platform API access Smartlog may not have

---

### 5.2 Pilot Scope

**Recommended MVP scope:**
- **1 client:** Mondelez Vietnam
- **1 product category:** Gifting SKUs (biscuits/chocolate gift packs) — highest Tet spike, clearest seasonal pattern
- **1 route cluster:** HCMC distribution center → South Vietnam GT (general trade) channels — highest volume, most predictable delivery pattern
- **Forecast horizon:** 7-day rolling, updated weekly
- **Output:** Weekly forecast table in Google Sheets shared with Smartlog operations manager and Mondelez supply chain contact

This scope is small enough to deliver in 8–10 weeks and large enough to generate a quantifiable result.

---

### 5.3 Pricing Model

Three options for logistics forecasting SaaS pricing:

| Model | Structure | Pros | Cons | Recommended? |
|---|---|---|---|---|
| **Per-lane/month** | VND 500,000–2,000,000 per active OD lane per month | Scales with client size; transparent | Complex to invoice for networks with many transient lanes | YES — for Tier 2+ commercial rollout |
| **Per-shipment** | VND 200–500 per forecasted shipment | Aligns with client value | Very low unit price; revenue unpredictable at sparse lane volumes | NO — too granular at Smartlog scale |
| **Platform fee (tiered)** | Flat fee by tier: Tier 1: VND 10–20M/month; Tier 2: VND 30–60M/month | Simple; predictable revenue | Does not scale with client network size | YES — for MVP/pilot phase |

**Recommended approach:** Platform fee for the first 3–6 months of pilot (VND 15,000,000–25,000,000/month), transitioning to per-lane pricing once lane count is established and stable.

**Rationale:** During MVP, the lane count and data cleaning overhead are high relative to the model complexity. A flat platform fee covers implementation cost. Once the pipeline is stable and client sees value, per-lane pricing aligns revenue with network growth.

---

### 5.4 Success Story Framing

**Narrative:** "From gut feel to 20% better accuracy in 8 weeks"

**Specific claim structure for Mondelez pilot:**
- Baseline: Mondelez's distribution planners manually estimate weekly shipment needs for each route — current WMAPE approximately 35–45% (typical for manual FMCG logistics planning)
- After 8 weeks with LightGBM + Tet component: WMAPE target 20–25%
- Operational result: Smartlog pre-positioned the right fleet configuration for the Tet gifting peak in [YEAR], reducing last-minute subcontractor bookings by X% and achieving OTD rate of Y% vs. Z% in prior year
- Client quote (to be captured): "We stopped guessing the week before Tet and started planning two weeks out."

**Key framing principle:** Never lead with model accuracy. Lead with operational outcome (fewer empty trucks, no scramble before Tet) and let the accuracy figure appear as the explanation. Operations managers buy outcomes, not WMAPE numbers.

---

## 6. Confidence Scores Summary

| Claim | Confidence | Validation Required |
|---|---|---|
| Overall feasibility score 6.5/10 | HIGH | Confirmed by data readiness and algorithm analysis |
| Data cleaning requires 2–4 weeks before model training | HIGH | Consistent with I06 findings and R-D06 domain notes |
| LightGBM + Prophet is correct MVP algorithm stack | HIGH | Supported by intersection-report algorithm analysis |
| Timeline 8–10 weeks to first forecast | MEDIUM | Depends on TMS data access and cleaning complexity; needs client data audit |
| WMAPE 40% → 20% improvement achievable | MEDIUM | Industry benchmarks support 15–25% improvement; Smartlog-specific baseline requires measurement |
| ROI VND 3B+ annual benefit | MEDIUM | Order of magnitude correct; requires Smartlog operational data (truck-day cost, overtime spend, SLA penalty contracts) |
| Mondelez Vietnam as ideal first pilot | HIGH | Consistent with I06 findings, FMCG pattern tractability, and client profile |
| Per-lane pricing model as commercial structure | MEDIUM | Pricing model is common in logistics SaaS; acceptance by Vietnam 3PL clients needs validation |
| Payback period 6–9 months | MEDIUM | Consistent with I06 memory; specific to implementation cost and operational efficiency captured |
| Tet cold-start risk is critical with <2 years data | HIGH | Structural requirement — not a preference; documented in algorithm data history requirements |

**Items requiring primary research (client interviews):**
1. Smartlog's actual TMS data export format and historical depth per client
2. Current manual forecast accuracy (baseline WMAPE) — operations managers typically do not track this; requires 4-week parallel run
3. SLA penalty contract terms per client — required for breach reduction ROI calculation
4. Mondelez Vietnam's willingness to share promo calendar as model feature input (commercial/data sharing agreement required)
5. Smartlog's internal ML talent availability — or need to hire/partner for pilot

---

## Decision Recommendation

**Proceed with Tier 1 MVP. Start with Mondelez Vietnam pilot. October–December budget window is the target for commercial approval.**

Prerequisites before project start:
- [ ] Run 2-week data quality audit on Smartlog TMS data for Mondelez account
- [ ] Confirm minimum 12 months of clean shipment history is extractable
- [ ] Identify internal Smartlog operations analyst as domain partner (not optional)
- [ ] Confirm at least one complete Tet cycle is present in training data — if not, negotiate prior carrier data from Mondelez
- [ ] Budget VND 700,000,000–1,000,000,000 for full 9-month Tier 1 + Tier 2 deployment

Do not expand scope to Tier 2 until Tier 1 WMAPE < 30% is validated. Do not present Tier 3 architecture to logistics operations stakeholders — it creates scope confusion without operational benefit at this stage.

---

*Report by R-γ (Dr. Sentinel) | MAESTRO Knowledge Graph Platform | Matrix Node B01 × I06*
