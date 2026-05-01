# R-PM Delivery Notes — I06 Logistics & Supply Chain
**MAESTRO Knowledge Graph Platform**
**Role:** R-PM (Project Manager / Delivery Lead)
**Industry Module:** I06 — Logistics & Supply Chain
**Date:** 2026-04-03
**Status:** Active Reference Document

---

## 1. AI Project Lifecycle in Logistics

### 1.1 Phase Overview

Logistics AI projects follow a five-phase lifecycle. Each phase has distinct objectives, duration benchmarks, and decision gates specific to the operational complexity of supply chain environments.

```
Discovery → Proof of Concept → Pilot → Production → Scale
```

---

### Phase 1: Discovery (3–6 weeks)

**Objective:** Understand the business problem, assess data readiness, and align stakeholders.

**Key Activities:**
- Stakeholder interviews (COO, Operations Manager, IT Director, Warehouse Lead)
- Current-state process mapping (order flow, shipment tracking, inventory cycle)
- Data audit: ERP data quality, TMS/WMS availability, GPS feed consistency
- Use case prioritization matrix (impact vs. feasibility)
- ROI hypothesis development

**Duration Benchmark:**
- Simple scope (single use case, existing data): 3 weeks
- Complex scope (multi-site, fragmented data): 5–6 weeks

**Decision Gate — "Discovery Sign-off":**
- At least one viable use case confirmed with clear data pathway
- Business sponsor committed and budget allocated for PoC
- Data access agreements signed
- Success criteria defined and measurable

**Success Criteria:**
- Problem statement approved by COO or Operations VP
- Data inventory completed covering at least 12 months of historical records
- PoC scope document signed off

---

### Phase 2: Proof of Concept (4–8 weeks)

**Objective:** Validate the technical approach on a subset of real data. Demonstrate feasibility, not production quality.

**Key Activities:**
- Data pipeline prototype (raw data ingestion, basic cleaning)
- Model baseline development (single algorithm, quick iteration)
- Internal demo with sample predictions or outputs
- Limitations documentation

**Duration Benchmark:**
- Forecasting or anomaly detection PoC: 4–5 weeks
- Document intelligence or route optimization PoC: 6–8 weeks

**Decision Gate — "PoC Go/No-Go":**
- Model performance meets minimum threshold (e.g., MAPE < 20% for forecasting)
- Data pipeline proven stable on at least 30 days of live data
- Business user validates output is interpretable and actionable
- Sponsor approves pilot investment

**Success Criteria:**
- At least one business user can explain model outputs without technical support
- No critical data gap that blocks production feasibility
- Effort estimate for pilot phase delivered

---

### Phase 3: Pilot (8–16 weeks)

**Objective:** Deploy in a controlled real-world environment. Collect feedback. Measure actual business impact.

**Key Activities:**
- Production-grade data pipeline (automated, monitored)
- Model refinement and retraining cycle established
- Integration with one core system (ERP, TMS, or WMS)
- KPI tracking dashboard delivered
- Change management: user training, SOP updates
- Feedback loop with operations team (weekly review cadence)

**Duration Benchmark:**
- Single-site, single use case: 8–10 weeks
- Multi-site or multi-use-case: 12–16 weeks

**Decision Gate — "Pilot to Production":**
- Business KPI improvement demonstrated (e.g., forecast accuracy improvement, cost reduction)
- End users adopted the tool (usage rate > 70% of target users over 4 weeks)
- No critical incidents in production data pipeline
- Total cost of ownership acceptable vs. ROI projection

**Success Criteria:**
- Measurable KPI delta vs. pre-pilot baseline
- IT team capable of first-line support
- Executive sponsor confirms production investment approval

---

### Phase 4: Production (8–12 weeks post-pilot)

**Objective:** Harden the system, expand user base, integrate fully with enterprise systems.

**Key Activities:**
- Full ERP/TMS/WMS integration
- Security review and access control implementation
- MLOps pipeline: automated retraining, monitoring, alerting
- SLA definition and incident response runbook
- Full user rollout and helpdesk support
- Documentation: technical and operational

**Duration Benchmark:** 8–12 weeks depending on integration complexity

**Decision Gate — "Production Sign-off":**
- System uptime SLA met (target: 99.5% during first 30 days)
- Retraining pipeline automated and tested
- All users onboarded and trained
- Governance documentation complete

---

### Phase 5: Scale (Ongoing, 3–6 months per expansion)

**Objective:** Expand to additional sites, use cases, or business units. Extract compound ROI.

**Key Activities:**
- Replicate proven architecture to new sites or regions
- Expand model scope (new SKUs, new routes, new document types)
- Cross-use-case data sharing (e.g., forecasting feeding route optimization)
- Executive reporting on cumulative ROI
- Vendor/partner expansion if applicable

**Duration Benchmark:** 3–6 months per major expansion wave

---

## 2. Team Structure for Logistics AI Projects

### 2.1 Minimum Viable Team — Logistics AI MVP

For a single-use-case MVP (e.g., demand forecasting or route optimization), the minimum effective team is **5 core roles** with one optional role depending on integration complexity.

| Role | Responsibility | FTE Commitment |
|---|---|---|
| Data Engineer | Pipeline build, data cleaning, ERP/TMS integration | 1.0 FTE |
| ML Engineer | Model development, training, evaluation, MLOps | 1.0 FTE |
| Domain Expert (Logistics) | Business rules, KPI definition, user feedback translation | 0.5 FTE |
| Backend Developer | API development, system integration, dashboard backend | 0.5–1.0 FTE |
| DevOps / Cloud Ops | Infrastructure, deployment, monitoring, CI/CD | 0.5 FTE |
| PM / Delivery Lead | Planning, stakeholder communication, risk management | 0.5 FTE |

**Total core team:** 4–5 FTE (PoC phase), scaling to 6–7 FTE (Pilot and Production)

---

### 2.2 Role Descriptions — Logistics Context

**Data Engineer**
- Connects to TMS, WMS, ERP (SAP, Oracle, local Vietnamese ERPs)
- Handles GPS data feeds, inconsistent timestamp formats, multi-warehouse schemas
- Builds Airflow or similar pipeline; ensures data lineage

**ML Engineer**
- Selects algorithms appropriate to logistics (LightGBM for forecasting, OR-Tools for routing, isolation forest for anomaly)
- Responsible for feature engineering on supply chain data (lead time variability, seasonality, stockout flags)
- Owns MLflow or similar experiment tracking

**Domain Expert**
- Former logistics operations manager or supply chain consultant
- Translates business constraints (truck capacity, delivery windows, customs dwell times) into model features
- Critical for Vietnam-specific context: Lunar New Year demand spikes, cross-border ASEAN flows

**Backend Developer**
- Builds REST APIs for model serving
- Integrates with existing TMS/WMS vendor APIs (common in Vietnam: FAST, MiSa, Efex, Giao Hang Nhanh)
- Builds internal dashboards if BI tool not available

**DevOps / Cloud Ops**
- Manages deployment on AWS/GCP/Azure or on-premise (common in larger Vietnamese logistics firms)
- Sets up monitoring, alerting, log aggregation
- Handles data residency requirements

---

### 2.3 Vietnam Talent Availability and Cost Ranges (2025–2026)

**Market Context:**
Vietnam has a growing pool of ML and data engineering talent, concentrated in Ho Chi Minh City and Hanoi. Logistics domain expertise is rarer and commands a premium. Salaries below are gross monthly, full-time employment.

| Role | Seniority | Monthly Gross (USD) | Availability |
|---|---|---|---|
| Data Engineer | Mid (2–4 yrs) | $1,200 – $1,800 | Good |
| Data Engineer | Senior (5+ yrs) | $2,000 – $3,000 | Moderate |
| ML Engineer | Mid (2–4 yrs) | $1,500 – $2,200 | Good |
| ML Engineer | Senior (5+ yrs) | $2,500 – $3,800 | Limited |
| Logistics Domain Expert | Any | $1,000 – $2,500 | Scarce |
| Backend Developer | Mid | $1,000 – $1,600 | Abundant |
| DevOps / Cloud Ops | Mid | $1,200 – $1,800 | Moderate |
| PM / Delivery Lead (AI) | Senior | $1,500 – $2,800 | Limited |

**Notes:**
- Logistics domain experts with both operations experience and AI literacy are the scarcest resource. Plan to hire early or develop internally.
- Freelance/contract rates are typically 1.3–1.6x monthly salary equivalent.
- Offshore delivery from Vietnam to international clients: blended team rate typically $25–$45/hour.
- Key hiring channels: TopDev, ITviec, LinkedIn Vietnam, university partnerships (HUST, HCMUT, VNU).

---

## 3. Effort Estimation by AI Use Case

### 3.1 B01 — Demand Forecasting MVP

**Scope:** Predict demand at SKU-location level, weekly granularity, 4-week horizon.

**Total Estimated Effort:** 18–26 person-weeks

| Phase | Tasks | Effort |
|---|---|---|
| Discovery | Data audit, stakeholder interviews, KPI baseline | 2 PW |
| Data Engineering | ERP extraction, cleaning, feature store setup | 5–6 PW |
| Model Development | Baseline (SARIMA/Prophet), advanced (LightGBM/XGBoost), evaluation | 4–5 PW |
| API & Integration | REST API for predictions, dashboard integration | 3–4 PW |
| Testing & Validation | Business user UAT, accuracy validation vs. manual forecast | 2–3 PW |
| Deployment & MLOps | Containerization, retraining schedule, monitoring | 2–3 PW |
| PM & Documentation | Planning, status reporting, handover docs | 2 PW |

**Key Milestones:**
- Week 2: Data pipeline delivering clean daily feed
- Week 6: Baseline model with MAPE < 20% on holdout set
- Week 10: API live, dashboard showing 4-week forecast
- Week 14: First retraining cycle completed automatically
- Week 18: MVP accepted by business owner

**Assumptions:**
- Historical sales data available for 24+ months
- ERP API access granted within week 1
- Business user available 4 hours/week for feedback

---

### 3.2 B02 — Document Intelligence MVP

**Scope:** Automated extraction from shipping documents (bills of lading, customs declarations, delivery notes). Support Vietnamese and English documents.

**Total Estimated Effort:** 20–30 person-weeks

| Phase | Tasks | Effort |
|---|---|---|
| Discovery | Document type inventory, volume assessment, error rate baseline | 2–3 PW |
| Data Collection & Annotation | Gather 500–1,000 sample docs, annotation tool setup, labeling | 5–7 PW |
| Model Development | OCR pipeline, extraction model (LayoutLM or custom), validation logic | 6–8 PW |
| API & Integration | REST API, integration with TMS/WMS document module | 3–4 PW |
| Testing & Validation | Accuracy testing per document type, edge case handling | 2–3 PW |
| Deployment | Containerized service, monitoring, fallback to manual review | 2–3 PW |
| PM & Documentation | Planning, client comms, handover | 2 PW |

**Key Milestones:**
- Week 3: 500 annotated documents ready for training
- Week 8: Extraction accuracy > 85% on bill of lading (primary document type)
- Week 12: API integrated with TMS, processing live documents
- Week 16: Human-in-the-loop review queue operational
- Week 20: MVP accepted; manual processing reduced by 60%+

**Critical Risk:** Vietnamese handwritten documents and mixed-language content require additional annotation effort. Budget 20% contingency on annotation timeline.

---

### 3.3 B06 — Route Optimization MVP

**Scope:** Optimize last-mile delivery routes for a fleet of 20–100 vehicles. Daily route generation.

**Total Estimated Effort:** 22–32 person-weeks

| Phase | Tasks | Effort |
|---|---|---|
| Discovery | Fleet data audit, constraint mapping, delivery window analysis | 3 PW |
| Data Engineering | GPS history, order data, map data integration (HERE/Google Maps API) | 5–6 PW |
| Algorithm Development | VRP solver (OR-Tools or custom heuristic), constraint encoding | 7–9 PW |
| API & Integration | Route API, driver app integration (if applicable), TMS integration | 4–5 PW |
| Testing & Validation | Pilot with 10–20 vehicles, KPI measurement (km saved, on-time rate) | 3–4 PW |
| Deployment | Real-time solver deployment, fallback routing logic | 2–3 PW |
| PM & Documentation | Planning, stakeholder reporting, handover | 2 PW |

**Key Milestones:**
- Week 3: All delivery constraints mapped and validated with operations team
- Week 8: Solver producing valid routes for test dataset
- Week 12: Pilot routes vs. manual routes comparison — target 10–15% km reduction
- Week 18: Live deployment for pilot fleet (10 vehicles)
- Week 22: Full fleet rollout decision gate

**Note:** Vietnam-specific constraints include motorbike fleets (different VRP formulation), alley-level address resolution, and traffic time-window variability in HCMC/Hanoi. Allow extra effort for constraint modeling.

---

### 3.4 B07 — Anomaly Detection MVP

**Scope:** Detect shipment anomalies (delays, diversions, damage indicators) in real-time from GPS and event data.

**Total Estimated Effort:** 16–22 person-weeks

| Phase | Tasks | Effort |
|---|---|---|
| Discovery | Event log audit, anomaly taxonomy definition, alert threshold baseline | 2 PW |
| Data Engineering | GPS stream ingestion, event log ETL, feature engineering (dwell time, speed deviation) | 4–5 PW |
| Model Development | Unsupervised baseline (Isolation Forest, DBSCAN), labeled anomaly classifier if labels exist | 4–6 PW |
| Alerting & Integration | Alert API, notification integration (email/Slack/TMS), dashboard | 3–4 PW |
| Testing & Validation | False positive rate tuning, operations team feedback loop | 2–3 PW |
| Deployment | Stream processing deployment (Kafka or Kinesis), monitoring | 2–3 PW |
| PM & Documentation | Planning, reporting, handover | 2 PW |

**Key Milestones:**
- Week 2: Anomaly taxonomy agreed with operations (at least 5 distinct anomaly types)
- Week 6: Baseline detector live on historical data, precision/recall baseline established
- Week 10: Real-time alert pipeline operational
- Week 14: False positive rate < 15%, alert fatigue managed
- Week 18: MVP accepted; operations team acting on alerts within defined SLA

---

## 4. Stakeholder Management

### 4.1 Key Stakeholders in Logistics AI Projects

| Stakeholder | Primary Concern | Engagement Level |
|---|---|---|
| COO / VP Operations | Cost reduction, service level improvement, competitive advantage | Executive sponsor; monthly steering |
| IT Director | Integration complexity, data security, infrastructure cost | Technical approver; bi-weekly review |
| Operations Manager | Workflow disruption, accuracy of AI recommendations, team adoption | Key end-user champion; weekly |
| Finance Director | ROI justification, total cost of ownership, budget approval | Approval gate at each phase transition |
| Warehouse / Fleet Supervisor | Usability, reliability, impact on daily work | Front-line adopter; must be included in UAT |
| Compliance / Customs Officer | Regulatory requirements, audit trail, document accuracy | Consult at Discovery; review at Production |

---

### 4.2 Common Objections and Responses

**Objection 1: "Our data is not clean enough for AI."**
Response: Data imperfection is the norm, not the exception. The PoC phase is specifically designed to assess and address data quality. We have seen forecasting models deliver value with 70% data completeness. We will audit your data and give you an honest feasibility assessment before any major investment.

**Objection 2: "We tried a similar system before and it failed."**
Response: Past failures in logistics AI are usually due to three causes — poor data pipeline reliability, misaligned success metrics, or lack of change management. Walk us through what happened. We will structure the PoC to specifically avoid those failure modes and include explicit go/no-go gates before scaling investment.

**Objection 3: "Our operations are too complex / unique for a standard AI solution."**
Response: Logistics AI is not a one-size-fits-all product. The Discovery phase exists to map your specific constraints — vehicle types, delivery windows, customs rules, seasonal peaks. We encode those constraints directly into the model. Complexity is a feature, not a blocker.

**Objection 4: "The team will not use it — they trust their experience."**
Response: We do not replace experienced operators — we give them better information faster. During the pilot, experienced team members will review and override AI recommendations. Over time, the system learns from those overrides. We will involve your best operators in the design process from week one.

**Objection 5: "What happens if the AI makes a wrong decision?"**
Response: Every production deployment includes a human-in-the-loop review layer and a manual override capability. We also set alert thresholds and confidence scores so the system flags uncertainty rather than forcing a decision. SLA and incident response procedures are defined before go-live.

---

### 4.3 Running a Successful AI Discovery Workshop with Logistics Clients

**Format:** Full-day workshop (6 hours) or two half-day sessions. Maximum 10–12 participants.

**Pre-workshop preparation (1 week before):**
- Send data inventory checklist to IT and operations teams
- Collect last 12 months of KPI reports (OTD, inventory turns, forecast accuracy, cost per shipment)
- Prepare a "Day in the life" process map for the target function (warehouse, fleet, procurement)
- Brief the executive sponsor separately: align on ambition level and decision authority

**Workshop Agenda:**

| Time | Activity | Owner |
|---|---|---|
| 09:00 – 09:30 | Welcome, objectives, rules of engagement | PM |
| 09:30 – 10:30 | Current state walkthrough: key pain points by function | Domain Expert + Operations Manager |
| 10:30 – 11:00 | Data inventory review: what exists, what is missing | Data Engineer |
| 11:00 – 12:00 | Use case brainstorming: post-it mapping of problems to AI capabilities | Facilitated by PM |
| 12:00 – 13:00 | Lunch break | — |
| 13:00 – 14:00 | Prioritization: impact vs. feasibility matrix for top 5 use cases | All |
| 14:00 – 15:00 | Deep dive on top 2 use cases: data requirements, success metrics, constraints | ML Engineer + Domain Expert |
| 15:00 – 15:30 | ROI hypothesis: rough cost/benefit for top use case | PM + Finance rep |
| 15:30 – 16:00 | Next steps, PoC scope draft, commitments | PM + Sponsor |

**Post-workshop (within 3 business days):**
- Deliver workshop summary document: problem statements, use case shortlist, data gaps, proposed PoC scope
- Schedule PoC kick-off with confirmed team and timeline
- Escalate any data access blockers immediately

---

## 5. Risk Register — PM Perspective

### Top 10 Delivery Risks for Logistics AI Projects

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R01 | Data access delayed or denied by IT/ERP vendor | High | High | Include data access SLA in project charter; escalate to COO if delayed > 1 week |
| R02 | Historical data quality insufficient for model training | High | High | Conduct data audit in week 1; define minimum data quality threshold as PoC entry criterion |
| R03 | Scope creep — business adds use cases mid-project | High | Medium | Freeze scope at PoC sign-off; use formal change request process for additions |
| R04 | Domain expert unavailable or replaced mid-project | Medium | High | Document all business rules in writing; cross-train a backup; include availability commitment in project agreement |
| R05 | Integration with TMS/WMS/ERP takes longer than planned | High | Medium | Start integration design in week 1; test API connectivity in PoC; allocate 20% buffer in integration timeline |
| R06 | Model performance does not meet business expectations at pilot | Medium | High | Set realistic benchmarks at Discovery (not aspirational); include explicit go/no-go criteria; educate stakeholders on AI limitations early |
| R07 | End-user adoption failure — team ignores AI recommendations | Medium | High | Involve operations team in design; run change management in parallel with technical delivery; measure adoption as a pilot KPI |
| R08 | Key team member resignation mid-project | Medium | High | Maintain up-to-date documentation; avoid single points of knowledge; cross-train within team |
| R09 | Infrastructure / cloud cost exceeds budget | Medium | Medium | Estimate cloud cost at PoC phase; set cost alerts; use spot/preemptible instances for training workloads |
| R10 | Regulatory / compliance issue with data usage | Low | High | Review data residency and privacy requirements at Discovery; obtain legal sign-off before processing personal data (driver data, customer addresses) |

---

## 6. Go-to-Market for Logistics AI Products

### 6.1 Pricing Models

**Model A: Per-Shipment / Per-Transaction**
- Charge based on the number of shipments processed, routes optimized, or documents extracted
- Typical range: $0.05–$0.50 per shipment/document depending on complexity
- Best for: companies with variable volume, preferred by procurement teams
- Risk: revenue unpredictability for vendor; client may throttle usage to reduce cost

**Model B: Per-User / Per-Seat**
- Monthly fee per active user of the platform (dispatchers, planners, warehouse supervisors)
- Typical range: $50–$200 per user per month for logistics AI tools
- Best for: tools with defined user roles (route optimization dashboards, forecasting workbenches)
- Risk: adoption pressure — client wants maximum value per seat

**Model C: Platform Fee + Usage Tier**
- Base platform fee (covers infrastructure, support, core features) + tiered usage above a threshold
- Typical structure: $2,000–$10,000/month platform fee + per-unit charge above included volume
- Best for: enterprise clients with predictable volume; provides revenue floor
- Recommended model for MAESTRO deployments in logistics

**Model D: Outcome-Based / Gain-Share**
- Fee linked to measurable business outcome (e.g., % of logistics cost reduction, inventory reduction)
- Highest client alignment; highest commercial risk for vendor
- Use only when baseline KPIs are well-documented and attribution is clean
- Typical structure: fixed retainer + 15–25% of measured savings

---

### 6.2 Typical Pilot Structure

**Pilot Duration:** 8–12 weeks

**Recommended Scope for Logistics AI Pilot:**
- Single use case (e.g., demand forecasting for one product category or one warehouse)
- Single geographic scope (one city, one DC)
- Defined user group (5–15 users)
- Fixed data pipeline (no new integrations mid-pilot)

**Pilot Pricing Guidance:**
- Offer pilot at 30–50% of full production price to reduce client commitment risk
- Include a clear "pilot to production" upgrade path in the contract
- Define pilot success criteria contractually — avoids disputes at pilot close

**Pilot Success Metrics (examples):**

| Use Case | Primary Metric | Target |
|---|---|---|
| Demand Forecasting | MAPE improvement vs. manual baseline | >15% reduction in forecast error |
| Document Intelligence | Manual processing time reduction | >50% reduction in processing time |
| Route Optimization | Total km driven per delivery | >10% reduction vs. pre-pilot |
| Anomaly Detection | Incidents detected before customer complaint | >70% of anomalies flagged proactively |

---

### 6.3 Structuring an AI Product Demo for Logistics Buyers

**Demo Duration:** 45–60 minutes. Do not exceed 90 minutes — operations executives have low tolerance for long demos.

**Demo Structure:**

**Opening (5 min) — Lead with their pain, not your product.**
Start with a statement of the problem the client faces, using their industry language and ideally their own data if available. "Last quarter, your industry averaged 23% forecast error. Here is what that costs in working capital."

**Current State (5 min) — Show the painful manual process.**
If possible, show a screenshot of their current spreadsheet or manual process. This anchors the contrast.

**Live Demo (25 min) — Structured around three moments:**
1. Data in: show how their data enters the system (emphasize ease of integration)
2. Intelligence generated: show the AI output — forecast, optimized route, extracted document, alert
3. Action taken: show what the user does with that output — one click to approve, export to TMS, send to driver

**ROI Snapshot (10 min) — Business case, not technical accuracy.**
Show a simple calculation: "If this system reduces your forecast error by 15%, here is the inventory reduction in VND/month." Use conservative numbers. Let them argue upward.

**Q&A and Next Step (15 min)**
Close with a specific proposed next step: "Can we schedule a 2-hour data audit session with your IT team next week to confirm pilot feasibility?"

**Demo Do's and Don'ts:**
- Do use real logistics data (anonymized) — generic retail demos do not resonate
- Do show the human override capability — logistics managers need to trust the system before they trust it
- Do not show model accuracy metrics as the headline — show business outcomes
- Do not run a live demo on unstable internet — pre-record critical sequences as backup

---

## 7. Quick Win Recommendations

### Top 3 AI Initiatives for Vietnam Logistics Companies in 2025–2026

---

### QW1 — Demand Forecasting for Seasonal Peaks (B01)

**Why this wins:**
Vietnam logistics is highly seasonal (Tet, back-to-school, 9/9, 11/11, 12/12 sale events). Manual forecasting consistently underperforms, leading to stockouts or overstock. AI forecasting on 12–24 months of sales history can deliver measurable improvement within a single pilot cycle.

**ROI Profile:**
- Inventory reduction: 10–20% reduction in safety stock
- Stockout reduction: 30–50% fewer stockout events during peak periods
- Payback period: 6–9 months post-production deployment

**Implementation Risk:** Low-Medium
- Data is typically available in ERP/WMS
- No real-time integration required for first deployment
- Proven algorithms; well-understood failure modes

**Entry Point:** Start with one warehouse, one product category, one seasonal event (e.g., Tet 2026 preparation starting Q4 2025).

---

### QW2 — Shipment Document Extraction (B02)

**Why this wins:**
Vietnamese logistics companies process high volumes of paper and PDF documents (customs declarations, bills of lading, delivery confirmations). Manual data entry is slow, error-prone, and expensive. Document AI can reduce processing time by 60–80% with high accuracy on structured document types.

**ROI Profile:**
- Labor cost reduction: 1–3 FTE equivalent per 10,000 documents/month
- Error rate reduction: 70–90% reduction in manual entry errors
- Customs clearance acceleration: 4–8 hours faster per shipment on average

**Implementation Risk:** Low-Medium
- Document types are standardized enough for initial model training
- Vietnamese language OCR has improved significantly (VinAI, PaddleOCR, Google Vision)
- Human-in-the-loop design manages residual errors safely

**Entry Point:** Start with bill of lading extraction. 500 annotated samples is enough for a working MVP. Target: 85%+ field extraction accuracy.

---

### QW3 — Last-Mile Route Optimization for Urban Delivery (B06)

**Why this wins:**
Vietnam's e-commerce growth is driving massive last-mile delivery volume in HCMC and Hanoi. Fuel costs and driver labor are significant cost lines. Route optimization is a proven ROI lever — even basic VRP optimization delivers 10–15% km reduction. For motorbike fleets with 50–200 stops per day, the savings compound quickly.

**ROI Profile:**
- Fuel cost reduction: 10–18% per route
- Driver hours saved: 30–60 minutes per driver per day
- On-time delivery improvement: 8–15 percentage points

**Implementation Risk:** Medium
- Constraint complexity (alley access, motorbike vs. truck, time windows) requires careful modeling
- Address quality in Vietnam is variable — requires address standardization layer
- Map data quality in secondary cities is lower than HCMC/Hanoi

**Entry Point:** Pilot with 10–20 motorbike drivers in one district of HCMC. Use Google Maps Platform or HERE for routing. Run for 4 weeks vs. manual routing baseline. Measure km, on-time rate, and driver overtime.

---

## Appendix A — Phase Gate Summary Table

| Phase | Duration | Key Decision | Go Criteria |
|---|---|---|---|
| Discovery | 3–6 weeks | PoC investment approved | Use case confirmed, data pathway clear, sponsor committed |
| Proof of Concept | 4–8 weeks | Pilot investment approved | Model meets minimum accuracy, business user validates output |
| Pilot | 8–16 weeks | Production investment approved | KPI improvement demonstrated, adoption > 70%, IT support ready |
| Production | 8–12 weeks | Full rollout | SLA met, retraining automated, all users onboarded |
| Scale | 3–6 months/wave | Expansion investment | ROI proven at current scope, architecture validated for replication |

---

## Appendix B — PM Toolkit Recommendations

**Project Management:**
- Linear or Jira for sprint tracking (ML teams prefer Linear for its simplicity)
- Confluence or Notion for documentation and decision logs
- Weekly status report template: RAG status, milestone progress, risks, decisions needed

**Data & ML Collaboration:**
- MLflow for experiment tracking (open source, self-hosted)
- DVC for data versioning
- Great Expectations for data quality validation

**Stakeholder Communication:**
- Monthly steering deck: 5 slides max (status, milestones, risks, financials, next decisions)
- Weekly ops update: email, 3 bullet points max
- Slack/Teams channel for day-to-day team communication; keep executive communication in formal channels

**Vietnam-Specific Notes:**
- Zalo is the dominant messaging platform in Vietnam — consider a Zalo group for client-side stakeholders
- Vietnamese business culture values relationship-building before task-orientation; invest time in informal check-ins with operations managers
- Decision-making is often centralized — ensure the true decision-maker is in the room at each gate review, not just their delegate

---

*Document Owner: R-PM, MAESTRO Platform*
*Next Review: 2026-07-01*
*Related Documents: I06/research-report.md, B01–B07 baseline reports*
