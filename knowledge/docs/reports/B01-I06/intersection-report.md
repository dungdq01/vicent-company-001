# Intersection Report: B01-I06 — Shipment Volume Forecasting for Logistics
**Agent:** R-α (Dr. Archon)
**Date:** 2026-04-03
**Matrix Node:** B01 × I06

---

## 1. Problem Definition

### 1.1 What Is Actually Being Forecasted

Logistics forecasting is not a single problem — it is a family of related prediction tasks, each with different target variables, granularity, and decision stakeholders. The key distinction from general demand forecasting is that logistics generates **multiple concurrent target variables on the same historical series**, each serving a different operational decision:

| Target Variable | Primary Decision Served | Forecast Consumer |
|---|---|---|
| **Shipment count** (parcels, orders, trips) | Hub staffing, dock scheduling, driver roster | Operations manager |
| **Weight (kg)** | Truck load planning, linehaul capacity | Dispatcher, load planner |
| **Volume (CBM)** | Warehouse staging area, vehicle type selection | Warehouse supervisor |
| **Revenue (VND)** | Cash flow, contract utilization rate | Finance, commercial team |
| **Route-level demand** (trips per OD lane) | Fleet allocation, linehaul frequency | Network planning |

For a Vietnam 3PL like Smartlog, the **most actionable starting target** is shipment count at the customer-route level, because it directly drives workforce scheduling and fleet pre-positioning — decisions made 24–72 hours ahead. Revenue forecasting is secondary and follows from shipment count × average revenue per shipment.

### 1.2 Forecast Horizons and Corresponding Model Types

Logistics operates on three distinct planning horizons, each requiring a structurally different model:

| Horizon | Timeframe | Decision | Model Approach |
|---|---|---|---|
| **Operational** | 1–7 days | Driver scheduling, hub staffing, same-day load plan | High-frequency ML (LightGBM + day-of-week features), near-zero latency serving |
| **Tactical** | 1–4 weeks | Fleet leasing, subcontractor activation, warehouse staffing waves | Statistical (ETS/SARIMA) or ML ensemble, batch inference |
| **Strategic** | 1–3 months | Contract capacity commitments, linehaul frequency changes, new lane launch | Decomposition-based (trend + seasonality), scenario models, manual planner overlay |

A common mistake is building a single model that tries to serve all three horizons. The error characteristics differ: operational forecasts must minimize MAE on specific days (SLA risk); strategic forecasts must capture the directional trend without overfitting to recent noise. A multi-model architecture with explicit horizon-based routing is preferred over one universal model.

### 1.3 Forecast Granularity and the Granularity Trade-off

Logistics forecasting exists on a granularity spectrum:

```
Company total
    └── Region (North / Central / South)
        └── Province / City
            └── Customer (shipper account)
                └── Service type (express / standard / cold chain)
                    └── Origin-Destination (OD) lane
                        └── Route (specific delivery run)
```

**The fundamental tension:** finer granularity increases operational value but decreases data density and model reliability. An OD pair between a small industrial province and a rural district may have zero shipments on 60–70% of days — making point forecasting nearly useless and probabilistic/event-detection approaches more appropriate.

**Practical guidance for Smartlog:** Start at **customer × service type × week** granularity for the first model. Disaggregate to route level only after the weekly model achieves WMAPE < 25%. Aggregating too early wastes operational opportunity; disaggregating too early destroys model stability.

### 1.4 Hierarchical Reconciliation in Logistics Networks

Standard MinT (Minimum Trace) reconciliation, as documented in B01 general knowledge, applies to tree hierarchies. Logistics networks are **not trees** — they are directed graphs. A shipment from HCMC can be sorted to Hanoi via Da Nang or directly; both flows aggregate into the same "Hanoi volume" but follow different intermediate nodes.

A 2025 paper (FlowRec, arxiv 2505.03955) reformulates hierarchical forecast reconciliation as a **network flow optimization problem**, specifically addressing this logistics topology. FlowRec demonstrates 3–40x performance improvements over MinT on logistics-style network data and handles the constraint that inbound flow at a hub must equal outbound flow — a physical consistency requirement that pure MinT cannot enforce.

**For MAESTRO:** When building logistics reconciliation, the MinT baseline from B01 is the starting point, but FlowRec is the upgrade target for any deployment with hub transit complexity. The key pre-condition is a versioned hierarchy definition (as flagged in B01-learnings.md), additionally extended to a versioned network graph with timestamp-effective edges.

---

## 2. Logistics-Specific Features

### 2.1 Vietnam Calendar Events (Not in Generic B01 Feature Sets)

These events are **not addressable by standard seasonality decomposition** and require explicit feature engineering:

| Event | Logistics Impact | Feature Engineering Approach |
|---|---|---|
| **Tet (Lunar New Year)** | 5–7 day operational shutdown + 3–4x volume spike in 7–10 days pre-Tet | Tet countdown feature (days_until_tet, days_since_tet), multiplicative seasonal factor per customer segment |
| **TikTok double-day sales** (10/10, 11/11, 12/12) | 2–5x volume spike, concentrated in 24–48 hours, highly category-specific | Binary flag + lagged volume from prior year's same event; signal from TikTok Shop GMV API (available to J&T; requires partnerships for others) |
| **Back-to-school (Aug–Sep)** | Moderate spike in stationery, school supplies, FMCG categories | Category-conditional seasonal feature |
| **Typhoon season (Jun–Nov)** | Route disruption in Central Vietnam (Danang, Hue, Quang Nam) — volume drops then rebounds | Typhoon landfall flag by province; rebound multiplier feature (historical average 1.3–1.8x the week after a disruption) |
| **Agricultural harvest cycles** | For agri-logistics clients: rice harvest (Dec–Jan Mekong Delta, May–Jun Central), coffee (Oct–Mar Central Highlands) | Crop calendar feature by province, yield forecast from Agri Ministry data |

**Critical warning for Tet:** The pre-Tet spike and post-Tet collapse happen within a 14-day window. Standard weekly seasonality decomposition smooths over this, producing forecasts that underestimate the peak by 40–60%. The Tet effect must be modeled as a **separate additive component** (Prophet-style) or as an explicit feature in tree-based models, not left to generic seasonality terms.

### 2.2 Operational Features Unique to Logistics

These features are rarely discussed in general forecasting literature but are high-value signals for logistics ML models:

- **Fleet capacity fill rate (prior week):** If fleet ran at 95%+ fill rate, demand may be supply-constrained — the observed shipment count understates true demand. This is the logistics version of the stock-out bias problem in retail demand sensing.
- **Warehouse staging utilization:** A leading indicator of volume surges — staging areas fill before trucks depart. If staging is at 80% capacity on Monday, Tuesday dispatch volume will be high.
- **Driver roster size (available vs. dispatched):** Constraint on the supply side; affects what volume can actually be served.
- **Route density index:** Number of active delivery points per route per day — changes when new client onboards or existing client churns. A drop in route density is a strong leading indicator of volume decline on that lane.
- **Carrier subcontractor booking rate:** What percentage of sub-carrier capacity has been pre-booked? High booking signals anticipated volume surge.

### 2.3 External Signals

| Signal | Source | Lag | Value |
|---|---|---|---|
| E-commerce GMV trend | VECOM reports, Shopee/Lazada seller volume (proxy) | 1–4 weeks | Leading indicator for B2C parcel volume |
| Customs clearance B/L count | Vietnam Customs (public data) | 1–2 weeks | Leading indicator for cross-border and industrial cargo |
| Carrier spot rates (road freight VND/km) | Spot market aggregators; driver app bid prices | Real-time | Demand pressure indicator; high rates precede volume peaks |
| Industrial production index (IIP) | General Statistics Office (GSO) Vietnam, monthly | 4–6 weeks | Leading indicator for industrial 3PL clients (Baconco, PTSC) |
| Weather forecast | NCHMF (Vietnam Met agency) API | 3–7 days | Typhoon/flood disruption signal for Central Vietnam lanes |

### 2.4 Customer Behavior Features by Industry Segment

The **single highest-lift feature** in logistics forecasting vs. standard time-series features is **customer industry segment** — because it completely determines the demand pattern shape:

| Customer Type | Demand Pattern | Key Features |
|---|---|---|
| **FMCG (Mondelez, Unilever type)** | Weekly-seasonal, promotion-driven spikes, strong Tet effect | Promo calendar, MT vs. GT channel split, TET countdown |
| **Industrial / B2B (PTSC, Baconco)** | Lumpy, project-driven, purchase order aligned | PO release date, project phase, quarterly cycle |
| **E-commerce (TikTok Shop seller)** | Platform-event-driven, viral demand, extremely volatile | Platform event calendar, seller GMV trend, return rate |
| **Cold chain / pharmaceutical** | Steady with compliance constraints | Temperature excursion events, regulatory submission cycles |

Failing to segment by customer type and building a single model across all customer types will produce a model that is mediocre for all segments. Segment-specific models or a model with a strong customer-type interaction feature outperform generic models by 15–25% WMAPE in logistics contexts.

---

## 3. Algorithm Selection

### 3.1 Data Characteristics That Drive Algorithm Choice

Vietnam logistics data has specific characteristics that invalidate some B01 defaults:

| Characteristic | Implication for Algorithm Choice |
|---|---|
| **High volatility (CV > 1.0 on many lanes)** | Models must handle heteroscedastic errors; quantile/probabilistic output preferred over point forecast |
| **Many zeros (sparse OD pairs)** | Standard MAPE-minimizing models degrade; Croston/TSB or zero-inflated models needed |
| **Regime changes (COVID, Tet anomalies, new client onboard)** | Changepoint detection required; Prophet's changepoints or structural break tests (CUSUM) as pre-filter |
| **Multiple strong seasonal cycles** | Daily (weekday/weekend), weekly, Tet-annual, double-day-annual — complex multi-seasonality requires MSTL decomposition or model with explicit seasonal features |
| **Short history on new lanes** | Cold-start problem; foundation models or similarity-based initialization |

### 3.2 Algorithm Comparison for Logistics Context

| Algorithm | Logistics Fit | Strengths | Weaknesses | Recommended Use |
|---|---|---|---|---|
| **LightGBM** | BEST for tactical/strategic | Handles heterogeneous features, fast, SHAP explainability, excellent with logistics features (promo calendar, route density) | Requires feature engineering; no native probabilistic output (use quantile regression variant) | Primary model for 1–4 week horizon on lanes with 60+ observations |
| **Prophet** | GOOD for lanes with clear seasonality | Additive Tet component, changepoint detection, interpretable parameters | Fails on lumpy/intermittent data; slow for large lane counts; not natively multivariate | Tactical forecasting for high-volume lanes; Tet spike modeling |
| **N-BEATS** | GOOD for multi-horizon | Pure DL, no feature engineering needed, M4 winner (univariate clean data) | Requires sufficient data history; less interpretable than LightGBM; overkill for thin lanes | Strategic horizon on aggregate network-level series with 2+ years data |
| **DeepAR** | GOOD for probabilistic fleet planning | Native probabilistic output (quantiles), handles many related series jointly, handles cold-start via related series pooling | Requires GPU serving infrastructure; training time increases with series count | Probabilistic capacity planning, fleet sizing; multi-lane joint models |
| **Croston / TSB** | BEST for sparse OD pairs | Specifically designed for intermittent demand; no zero-volume bias | Point forecast only; no feature integration | Tier-3 and rural OD pairs with >50% zero days |
| **TSB-HB (2025)** | EMERGING — sparse lanes | Hierarchical Bayesian extension, partial pooling across items, outperforms Croston/SBA/TSB on UCI Retail | Research-stage; limited production tooling | Future upgrade for sparse lanes once TSB-HB has production library support |
| **Chronos-2 / TimesFM** | BEST for cold-start | Zero-shot, no training required, Chronos-2's in-context learning across related series | Accuracy plateau vs. trained models once 60+ observations exist; API cost at scale | New customer onboarding, new lane launch (first 60 days) |
| **ETS / SARIMA** | BASELINE only | Proven, interpretable, fast | Cannot ingest exogenous features; manual seasonal order selection fails on complex Vietnam calendar | Benchmark comparison only; not recommended for production |

**Key benchmark finding:** A Transformer-XGBoost-LightGBM hybrid achieved WMAPE of 9.2% for short-term international trade prediction — 23.5% lower error than LSTM alone (Transformer-XGBoost-LightGBM hybrid study, 2024). This validates the ensemble approach over single-model solutions.

### 3.3 Recommended Architecture by Tier

```
TIER 1 — High-volume lanes (>20 shipments/week, 60+ weeks history):
    Primary: LightGBM with quantile regression (P10, P50, P90)
    Secondary: Prophet for Tet spike component
    Ensemble: Weighted average, weights tuned on hold-out

TIER 2 — Medium-volume lanes (5–20 shipments/week):
    Primary: DeepAR (joint model across similar lanes)
    Alternative: N-BEATS on aggregate with top-down disaggregation

TIER 3 — Sparse/intermittent lanes (<5 shipments/week, >50% zeros):
    Primary: Croston-SBA or TSB (via Nixtla statsforecast library)
    Upgrade path: TSB-HB when production library matures

COLD-START — New lanes/customers (<60 observations):
    Primary: Chronos-2 (zero-shot)
    Transition: Hand off to Tier 1/2 model at 60-observation threshold
```

### 3.4 Cold-Start: The Vietnam 3PL Reality

New customer onboarding is frequent in Vietnam 3PL due to market growth. A new client may have zero shipment history with Smartlog. Three approaches ranked by maturity:

1. **Foundation models (Chronos-2, TimesFM):** Zero-shot inference using pre-trained global patterns. A logistics company opening a new distribution center can leverage patterns from existing facilities via Chronos-2's in-context learning. Requires no training; accuracy is acceptable but not optimal.
2. **Similarity-based initialization:** Find the 3 most similar existing customers (by industry, geography, order profile) and use their historical patterns as the prior. Requires a customer similarity index — buildable from TMS metadata.
3. **Client-provided history:** Require new clients to provide 12 months of their own shipment data (from prior carrier) as part of onboarding. This is a commercial and contractual process, not a technical one — but it is the highest-value cold-start solution in practice.

---

## 4. Data Schema

### 4.1 Minimum Viable Data Model

The minimum schema needed to build a logistics forecasting pipeline:

**Core fact table: `shipment_fact`**

| Column | Type | Notes |
|---|---|---|
| `shipment_date` | DATE | Actual pickup date (not booking date) |
| `origin_hub_id` | VARCHAR | Hub/warehouse where shipment originates |
| `destination_province_id` | VARCHAR | Province-level (avoid raw address — too noisy) |
| `customer_id` | VARCHAR | Shipper account ID |
| `service_type` | VARCHAR | express / standard / cold_chain / bulky |
| `shipment_count` | INT | Number of shipments (parcels, orders, pallets) |
| `weight_kg` | FLOAT | Actual weight (not estimated) |
| `cbm` | FLOAT | Cubic meter volume |
| `revenue_vnd` | FLOAT | Net revenue before COD offset |
| `is_cancelled` | BOOLEAN | TRUE if cancelled after booking |
| `load_type` | VARCHAR | FTL / LTL / parcel — critical for capacity aggregation |

**Dimension tables required:**

- `dim_customer`: industry_segment, tier, region, start_date
- `dim_calendar`: date, day_of_week, is_public_holiday, tet_countdown, double_day_flag, typhoon_flag_by_province
- `dim_route`: origin, destination, distance_km, lane_type (urban/inter-city/cross-border)
- `dim_fleet`: vehicle_type, capacity_kg, capacity_cbm, availability_status

**Primary key for the fact table:** `(shipment_date, origin_hub_id, destination_province_id, customer_id, service_type)`

Note: Do NOT use raw OD address pairs as keys — address normalization in Vietnam is too unreliable. Province-level destination is the practical minimum granularity.

### 4.2 Target Variable Selection

**Recommended sequence for a new implementation:**

1. Start with `shipment_count` — most directly actionable, easiest to validate operationally
2. Add `weight_kg` once shipment count model is stable — needed for load planning
3. Add `revenue_vnd` for commercial forecasting — derived from count × ASP, or modeled separately
4. Defer `cbm` until cube data quality is confirmed (typically 50%+ records have null or estimated CBM in Vietnam 3PLs — see R-D06 data quality findings)

### 4.3 Data History Requirements

| Model Type | Minimum History | Preferred History | Notes |
|---|---|---|---|
| Statistical (ETS, SARIMA) | 2 years | 3+ years | Need at least 2 full Tet cycles |
| LightGBM | 1 year | 2–3 years | Minimum: 52 weeks to learn weekly seasonality + 1 Tet event |
| DeepAR (multi-series) | 6 months per series | 2 years | Can partially compensate with related series pooling |
| Chronos-2 / foundation | 0 (zero-shot) | Any | Accuracy improves with fine-tuning once data accumulates |

**Vietnam-specific requirement:** Any model that does not include at least one complete Tet cycle in training data **cannot be trusted for Tet-period forecasting**. This is a hard pre-condition, not a preference.

### 4.4 Data Quality Issues Specific to Logistics

| Issue | Description | Mitigation |
|---|---|---|
| **Cancelled order inclusion** | Cancelled orders often appear in raw TMS exports as confirmed shipments. Including them inflates demand signal. | Filter `is_cancelled = TRUE` records; track cancellation rate as a separate feature |
| **Partial loads double-counted** | A single truck trip may be split across 3 load records if loaded incrementally. Join on trip_id before aggregating. | `GROUP BY trip_id` before computing weight/CBM |
| **Hub consolidation OD distortion** | Shipment from HCMC to Hanoi may be recorded as HCMC→Da Nang + Da Nang→Hanoi (two records). True OD is HCMC→Hanoi. | Build an OD normalization layer using transit hub mapping table |
| **Manual timestamp bias** | Hub departure/arrival times entered manually, often 2–4 hours late. | Use scan-event timestamps (first barcode scan at destination), not manually entered status updates |
| **Tet data quality degradation** | Pre-Tet and post-Tet periods have highest data entry errors (reduced staffing). | Flag this window explicitly; apply outlier-robust training (Huber loss, quantile regression) during Tet window |

---

## 5. Business Rules

### 5.1 Capacity Constraints

Logistics forecasts do not operate in a vacuum — they must be **bounded by physical capacity constraints**:

- **Fleet capacity ceiling:** If forecast exceeds fleet capacity (total weight or CBM), the excess demand must trigger either subcontractor activation or demand deferral — the forecast itself does not change, but the operational response is constrained. The forecast pipeline must output a **capacity gap signal**: `max(0, forecast_demand - available_fleet_capacity)`.
- **Warehouse throughput ceiling:** Hub throughput is limited by dock doors, sorting conveyors, and labor. A surge forecast exceeding hub throughput by >20% triggers pre-staffing, not just vehicle pre-booking.
- **Driver roster constraint:** For last-mile in Vietnam, the binding constraint is often driver availability, not vehicle count. The forecasting system must integrate with HR scheduling to flag days where forecast demand exceeds rostered driver capacity.

### 5.2 Revenue Management: Forecast → Pricing Feedback Loop

Logistics forecasts directly feed pricing decisions:
- **Spot rate setting:** When forecast shows high demand vs. available capacity on a specific lane in the next 7 days, spot rate premium is justified. Maersk's AI system does exactly this for ocean freight — Maersk Tankers built models across 20 market segments to optimize fleet position and rate setting using freight price forecasts.
- **Contract capacity negotiation:** 1–3 month strategic forecasts are the basis for annual contract volumes with clients (guaranteed minimum volume = minimum revenue commitment). Overcommitting to guaranteed volume without a reliable forecast creates under-utilization penalties.
- **Off-peak discount incentives (demand shaping):** When forecast predicts over-capacity on a lane (e.g., Monday morning HCMC→Hanoi after Tet is consistently under-utilized), proactive discounting can pull demand forward from Tuesday, improving truck fill rate without adding capacity.

### 5.3 SLA Commitments

Forecast accuracy directly affects SLA risk:
- **Understated demand forecast** → insufficient drivers scheduled → late pickups → SLA breach → penalty payment. For Smartlog's industrial clients (PTSC, Baconco), SLA breach penalties can reach 1–3% of shipment value.
- **Overstated demand forecast** → excess staff and trucks → idle cost without revenue. In a thin-margin 3PL, idle driver cost on a misforecast day can erase the week's margin for that lane.
- **Target accuracy for SLA protection:** WMAPE < 20% on 7-day horizon is the threshold below which SLA breach rate from forecasting error drops to acceptable levels. Above 30% WMAPE, operational teams revert to manual override, defeating the purpose of the model.

### 5.4 Vietnam 3PL Client Context: Smartlog Use Cases

| Client | Forecasting Problem | Key Business Rule |
|---|---|---|
| **Mondelez Vietnam** | SKU-level distribution demand for 200K retail points, extreme Tet spike (3–5x baseline for gifting SKUs) | Forecast must be available by Day T-21 before Tet to allow production planning and finished goods positioning |
| **Baconco (fertilizer)** | Agricultural seasonal demand, harvest cycle-driven, provincial distribution | Forecast tied to crop calendar + weather; lumpy orders (full truckload purchases by distributors) — Croston approach for individual distributor, aggregate model for province-level |
| **PTSC (oil & gas logistics)** | Project-driven cargo (heavy lift, hazmat), extremely irregular | Point forecasting inappropriate; scenario planning (project milestone-driven) combined with base logistics volume ML model |

### 5.5 Demand Shaping Feasibility

Unlike retail, logistics providers have moderate ability to shape demand:
- **Pricing levers on off-peak lanes:** Works for price-sensitive e-commerce clients; less effective for industrial clients with fixed supply chains.
- **Preferred pickup day incentives:** Small discounts for moving Tet pre-spike from Day T-3 to Day T-7 can smooth the volume curve significantly — even a 15% shift to earlier days reduces peak staffing requirement by ~20%.
- **Limit:** Smartlog's B2B clients (Mondelez, Baconco) have production calendars that cannot be moved for logistics pricing incentives. Demand shaping only applies to the e-commerce and SME shipper segment.

---

## 6. KPIs and Benchmarks

### 6.1 Primary Metric: WMAPE

**Why WMAPE, not MAPE:**

Standard MAPE fails for logistics in two ways:
1. **Zero-volume lanes:** MAPE is undefined when actual = 0. On sparse OD pairs, MAPE produces divide-by-zero errors or infinite values.
2. **Promotional spikes:** A single 10x spike on a normally low-volume lane produces extreme MAPE values that overwhelm the aggregate metric, even if the model is well-calibrated on all other lanes.

WMAPE resolves both issues by weighting errors by actual volume:

```
WMAPE = Σ|actual - forecast| / Σ|actual|
```

High-volume lanes dominate the metric, which aligns with business value (a 10% error on the HCMC→Hanoi linehaul lane costs far more than a 40% error on a rural tier-3 lane).

**Complementary metrics:**
- **Bias (MASE or signed error):** Persistent underforecasting is a worse operational failure than overforecasting — it causes unrecoverable SLA breaches. Track directional bias separately.
- **Percentile calibration (for probabilistic models):** The P90 forecast should contain actual demand 90% of the time. Use reliability diagrams to verify quantile calibration for fleet capacity planning.
- **Hit rate on promotional events:** % of Tet/double-day events where forecast was within ±20% of actual. This catches model failures that WMAPE averages away.

### 6.2 Vietnam Logistics WMAPE Benchmarks

| WMAPE Range | Assessment | Context |
|---|---|---|
| **< 10%** | Exceptional — world-class | Achieved by top-tier CEP players (DHL, Amazon logistics) on high-volume mature lanes |
| **10–15%** | Excellent — production-ready | Target for Smartlog Tier 1 lanes (major customers, frequent lanes) |
| **15–25%** | Acceptable — operational value delivered | Typical range for Vietnam 3PL production models on tactical horizon |
| **25–35%** | Marginal — operational override required | Common in first 6 months post-deployment; acceptable for sparse Tier 3 lanes |
| **> 35%** | Unacceptable — not better than naive baseline | Model revision required; check for data quality issues first |

**Baseline benchmarks to beat:**
- Naive forecast (last week's actual): WMAPE typically 35–55% in logistics (high due to promotional volatility)
- Simple moving average (4-week): WMAPE typically 28–42%
- Manual dispatcher estimate: WMAPE typically 25–40% (dispatchers are good at short-term but poor at Tet and event spikes)
- AI/ML target: WMAPE 15–25% for 7-day tactical horizon is the documented improvement range from AI adoption in 3PL contexts

### 6.3 Business KPIs (Translating Forecast Accuracy to Business Value)

| Forecast Accuracy Improvement | Business KPI Impact | Quantification |
|---|---|---|
| WMAPE reduction from 35% → 20% | **Capacity utilization improvement** | 5–10% reduction in empty truck runs; at VND 1.5–3M per truck-day, significant margin recovery |
| Tet spike forecast within ±15% | **Overtime labor reduction** | Avoid emergency staffing premiums (1.5–2x base rate); reduces Tet-period labor cost by 15–25% |
| 7-day forecast accuracy > 80% hit rate | **On-time delivery rate improvement** | Proactive staffing eliminates reactive scrambles; OTD improvement of 3–8 percentage points |
| Capacity gap signal active | **SLA breach reduction** | Each avoided SLA breach saves 1–3% of shipment value in penalties; high-value for PTSC/Baconco contracts |
| Off-peak demand shaping enabled | **Fleet utilization uplift** | 5–12% improvement in asset utilization ratio, reducing need for subcontractor premiums |

---

## 7. Reference Solutions

### 7.1 Amazon DeepAR — Origin in Logistics Demand Forecasting

DeepAR was developed at Amazon to address the fundamental challenge of forecasting across hundreds of related product-route time series simultaneously. The core innovation was training a single autoregressive RNN model across all related series rather than fitting individual models per series — a direct response to the cold-start and sparse-data problem in Amazon's own fulfillment network. DeepAR was published in 2017 (arxiv 1704.04110) and commercialized via AWS SageMaker. In 2025, Amazon released Chronos-2, extending the architecture to universal (multivariate, covariate-aware) forecasting with cold-start capability via in-context learning.

**MAESTRO relevance:** DeepAR's core premise — joint modeling across many related logistics series — is directly applicable to Smartlog's multi-customer, multi-lane forecasting problem. The `related_time_series` feature in SageMaker DeepAR accepts forward-looking signals (promo calendar, holiday flags) which aligns with the Vietnam calendar features defined in Section 2.1.

### 7.2 Flexport — Trade Activity Forecasting

Flexport publishes a **Trade Activity Forecast (TAF)** and **Flexport Consumption Forecast (FCF)** based on trade flow data from their forwarding operations. Their 2024 AI platform update improved shipment delay prediction by 25% and introduced predictive delay analysis across ocean and air freight lanes. The key technical insight from Flexport: **supply-side signals (port congestion, vessel schedule reliability) are as important as demand-side signals** for shipment volume forecasting. Ignoring port congestion data produces systematically biased forecasts during disruption periods (Red Sea crisis, Vietnam port congestion at Cat Lai terminal).

**MAESTRO relevance:** For Smartlog's clients with import/export components, integrating Vietnam Customs B/L count data and Cat Lai port throughput data as exogenous signals mirrors Flexport's approach and adds signal quality beyond pure TMS history.

### 7.3 Project44 — ClearMetal Predictive Intelligence

Project44 (enhanced by its acquisition of ClearMetal) combines real-time visibility with predictive analytics to forecast shipment ETAs and identify supply chain disruptions before they materialize. Their 2024 supply chain disruption report documented that companies with AI-powered visibility reduced disruption impact by 30–40% through early detection. Project44's key contribution is the **carrier performance data layer** — historical on-time rates by carrier by lane — which becomes an exogenous feature in volume forecasting (high carrier reliability on a lane → more shipper volume allocated to that lane).

**MAESTRO relevance:** Smartlog's competitive moat vs. Project44 is domestic micro-carrier visibility. Building a carrier performance scoring table (on-time rate, damage rate, by lane by month) is both a prerequisite for carrier selection AI and a feature for shipment volume forecasting.

### 7.4 Maersk Tankers — Freight Rate Forecasting Across 20 Market Segments

Maersk Tankers built ML models across 20 market segments to forecast freight prices and optimize fleet positioning. Their approach: enriched historical dataset going 5 years back, sprint-based model validation, segment-specific models rather than one universal model. Published outcome: freight price forecast accuracy sufficient to pre-commit fleet positions, directly improving revenue yield.

**MAESTRO relevance:** The segment-specific model architecture (20 separate models, each tuned to a market segment's data characteristics) mirrors the recommended approach for Smartlog — a model per customer segment, not a single global model. The sprint-based validation process is operationally feasible for a Smartlog implementation team.

### 7.5 Mondelez Vietnam — FMCG Demand Forecasting Anchor Case

As documented in R-D06-notes.md, Mondelez Vietnam's demand forecasting challenge (200K retail points, extreme Tet seasonality, TikTok Shop emergence, Tet-only SKU cold-start) is representative of the B01-I06 intersection for FMCG logistics clients. Industry practice for this profile:

- **Statistical baseline:** Holt-Winters for trend + seasonality (Tet multiplier hard-coded)
- **ML layer:** LightGBM with promo calendar, price elasticity, channel mix features
- **New SKU:** Analogous SKU initialization (similarity-based cold-start)
- **Expected accuracy improvement:** 15–25% MAPE reduction vs. manual forecast

This is the anchor benchmark for what Smartlog's AI forecasting capability should deliver to FMCG clients in Phase 1.

### 7.6 GHN — Hub Throughput Forecasting (Operational Reference)

As documented in R-D06 domain notes, GHN's highest operational-value AI deployment is **inbound volume forecasting for hub staffing** during peak periods (TikTok flash sales, 11/11, Tet prep). GHN's advantage is platform-native data (millions of daily deliveries) which enables short-term volume forecasting at 6–12 hour granularity for hub labor scheduling. This is equivalent to the operational horizon (1–7 days) defined in Section 1.2.

**MAESTRO relevance:** Smartlog cannot replicate GHN's data volume advantage. However, the use case — hub staffing optimization driven by short-term volume forecast — is achievable with Smartlog's own client volume data, targeting the operational horizon for major customers (Mondelez, Baconco delivery days are known from purchase order schedule).

### 7.7 Documented WMAPE Improvements from AI Adoption

| Source | Baseline (Manual/Statistical) | AI Achievement | Improvement |
|---|---|---|---|
| General 3PL industry (multiple studies, 2024) | MAPE/WMAPE 30–50% | 15–25% WMAPE | 20–50% error reduction |
| FMCG Vietnam (Mondelez profile, industry practice) | Manual forecast, MAPE ~35% | LightGBM + promo calendar, MAPE ~20% | ~15 percentage points |
| Transformer-XGBoost-LightGBM hybrid (2024 study) | LSTM baseline WMAPE ~12% | Hybrid WMAPE 9.2% | 23.5% improvement over LSTM |
| AI-driven supply chain (McKinsey, broad logistics) | Reported 15% logistics cost reduction, 35% inventory reduction, 65% service quality improvement | — | Directional; specific WMAPE not always cited |

---

## Sources

- [Machine Learning for Forecasting Order Volumes (DIVA Portal)](https://www.diva-portal.org/smash/get/diva2:1982923/FULLTEXT01.pdf)
- [Machine Learning Algorithms in Intermittent Demand Forecasting: A Review (Taylor & Francis, 2025)](https://www.tandfonline.com/doi/full/10.1080/00207543.2025.2578701)
- [Transformer-XGBoost-LightGBM Hybrid for Trade Demand Forecasting (Bonview Press)](https://ojs.bonviewpress.com/index.php/AIA/article/view/7024)
- [TSB-HB: Hierarchical Bayesian Extension for Intermittent Demand (arxiv 2511.12749)](https://www.arxiv.org/abs/2511.12749)
- [CrostonSBA Model — Nixtla StatsForecast](https://nixtlaverse.nixtla.io/statsforecast/docs/models/crostonsba.html)
- [FlowRec: Hierarchical Forecast Reconciliation on Networks (arxiv 2505.03955)](https://arxiv.org/abs/2505.03955)
- [Forecast Reconciliation: A Review (ScienceDirect, Hyndman et al.)](https://www.sciencedirect.com/science/article/pii/S0169207023001097)
- [MinT: Optimal Forecast Reconciliation (Rob J. Hyndman)](https://robjhyndman.com/papers/MinT.pdf)
- [The History of Amazon's Forecasting Algorithm (Amazon Science)](https://www.amazon.science/latest-news/the-history-of-amazons-forecasting-algorithm)
- [DeepAR: Probabilistic Forecasting with Autoregressive Recurrent Networks (arxiv 1704.04110)](https://arxiv.org/pdf/1704.04110)
- [Introducing Chronos-2: From Univariate to Universal Forecasting (Amazon Science)](https://www.amazon.science/blog/introducing-chronos-2-from-univariate-to-universal-forecasting)
- [Chronos-2: Cold-Start Forecasting Tutorial (Medium)](https://medium.com/data-science-collective/chronos-2-cold-start-forecasting-with-short-histories-and-no-training-a-practical-tutorial-fbc9dea96278)
- [TimesFM: Time Series Foundation Model (Google Research GitHub)](https://github.com/google-research/timesfm)
- [AI Models for Demand Forecasting: TSFMs Compared (Grid Dynamics)](https://www.griddynamics.com/blog/ai-models-demand-forecasting-tsfm-comparison)
- [Flexport Trade Activity Forecast](https://www.flexport.com/research/trade-activity-forecast/)
- [Flexport Consumption Forecast](https://www.flexport.com/research/flexport-consumption-forecast-fcf/)
- [2024 Logistics Challenges: Insights from Project44's Supply Chain Report (SupplyChain360)](https://supplychain360.io/logistics/2024-logistics-disruptions-project44-strategies-resilience/)
- [Maersk Optimizes Revenue Using AI (2021.ai)](https://2021.ai/clients/maersk-optimizes-revenue-opportunities-ai/)
- [Machine Learning in Freight Rate Forecasting: A Systematic Literature Review (Springer, 2025)](https://link.springer.com/article/10.1057/s41278-025-00334-3)
- [Deep Demand Forecasting with Amazon SageMaker (AWS Blog)](https://aws.amazon.com/blogs/machine-learning/deep-demand-forecasting-with-amazon-sagemaker/)
- [N-BEATS: Neural Basis Expansion Analysis for Time Series Forecasting (arxiv 1905.10437)](https://arxiv.org/abs/1905.10437)
- [Data-Driven ML Model for Forecasting Delivery Positions for Workforce Planning (ScienceDirect, 2024)](https://www.sciencedirect.com/science/article/pii/S2949863524000426)
- [Machine Learning and Deep Learning Models for Demand Forecasting: Critical Review (MDPI, 2024)](https://www.mdpi.com/2571-5577/7/5/93)
- [Harnessing the Power of AI in Distribution Operations (McKinsey)](https://www.mckinsey.com/industries/industrials-and-electronics/our-insights/distribution-blog/harnessing-the-power-of-ai-in-distribution-operations)

---

*Report by R-α (Dr. Archon) | MAESTRO Knowledge Graph Platform | Matrix Node B01 × I06*
