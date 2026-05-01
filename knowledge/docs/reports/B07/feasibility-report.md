# Feasibility Report: Anomaly Detection & Monitoring (B07)
## By Dr. Sentinel (R-γ) — Date: 2026-03-31

---

### 1. Verdict: CONDITIONAL GO

Anomaly Detection & Monitoring is a technically mature, high-demand domain with proven open-source tooling and clear monetization paths across banking, manufacturing, and e-commerce in Vietnam and Southeast Asia. The "conditional" qualifier reflects two constraints: (a) the need for domain-specific labeled datasets that do not yet exist at scale in Vietnam, and (b) the requirement for streaming infrastructure expertise that remains scarce in the local talent market. Proceed with a phased approach — batch-first for quick wins, streaming second.

---

### 2. Feasibility Scoring Matrix

| Dimension | Score (1-10) | Justification |
|---|---|---|
| **Technical Feasibility** | 8 | Mature algorithms (Isolation Forest, Autoencoders, Transformer-based models) with production-grade libraries (PyOD, Alibi Detect, River). The hybrid batch-train/stream-infer architecture proposed in the Tech Report is well-proven at scale by companies like Netflix and Uber. Open-source stack (Kafka + Flink + PyOD + MLflow) eliminates vendor lock-in. Deducted points for the complexity of real-time streaming pipelines and model drift management. |
| **Market Demand** | 9 | Vietnam's banking sector loses an estimated $200M+/year to fraud; 8,000+ factories need predictive quality control; e-commerce handles 2.5B+ packages/year requiring logistics anomaly detection. Every regulated industry (banking, telecom, energy) faces compliance mandates for monitoring. Global anomaly detection market projected at $7.1B by 2028 (MarketsandMarkets). SEA digital economy at $218B (2023, Google-Temasek) creates enormous surface area for anomaly-generating systems. |
| **Data Availability** | 6 | Public benchmark datasets exist (KDD Cup, Credit Card Fraud, NAB, SWAT). However, Vietnam-specific labeled anomaly data is extremely scarce. Banks hold proprietary fraud data but resist sharing. Factory sensor data exists but is siloed in legacy SCADA/PLC systems with no standard export. Building domain-specific datasets will require 3-6 months of partnership with pilot customers. |
| **Implementation Risk** | 6 | Key risks include: alert fatigue from high false-positive rates (industry average 30-50% FP for unsupervised methods), streaming infrastructure complexity (Kafka + Flink requires specialized DevOps), and the cold-start problem for new customers with no historical baseline. The feedback loop (Stage 6 in Tech Report) is critical but often underestimated in effort. |
| **Overall** | 7.3 | Weighted average (Tech 25%, Market 30%, Data 25%, Risk 20%). Strong market pull compensates for data availability gaps. The conditional go reflects that success depends on securing pilot customers willing to provide labeled data. |

---

### 3. Competitive Landscape

| Competitor | Type | Strengths | Weaknesses | Pricing |
|---|---|---|---|---|
| **Datadog Anomaly Detection** | SaaS (US) | Integrated with full observability stack; ML-based anomaly detection on metrics with zero config; massive ecosystem of 750+ integrations | Primarily IT/DevOps focused, not designed for business-domain anomalies (fraud, manufacturing); expensive at scale; no Vietnam data residency | $23-34/host/month (Infrastructure), anomaly detection included in Pro+ tiers. Enterprise can exceed $50K/month for large deployments |
| **AWS Lookout for Metrics** | Cloud Service (US) | Native AWS integration; automated root cause analysis; supports 19 data sources (S3, RDS, Redshift, CloudWatch); no ML expertise needed | AWS lock-in; limited customization of detection algorithms; no streaming real-time (<5 min granularity minimum); poor performance on sparse/seasonal data per user reports | $0.75 per 1,000 metrics analyzed. Typical workload: $500-5,000/month |
| **Azure Anomaly Detector** | Cloud API (US) | Simple REST API; supports univariate and multivariate time series; built-in seasonality handling; part of Azure Cognitive Services | Microsoft ecosystem dependency; limited to time-series only (no graph, image, or log anomalies); multivariate limited to 300 variables; being merged into broader AI services with uncertain roadmap | $0.157 per 1,000 data points (univariate). Multivariate: ~$0.627 per 1,000 timestamps |
| **Anodot** | SaaS (Israel) | Purpose-built for business metric anomaly detection; patented correlation engine groups related anomalies; strong in revenue/cost monitoring; real-time | Expensive for SMBs; limited to structured metrics (not logs, images, or sensor data); small partner ecosystem in SEA; requires significant data integration effort | Custom enterprise pricing, estimated $50K-200K/year depending on data volume |
| **Splunk ITSI** | On-prem/Cloud (US) | Powerful log and event anomaly detection; ML Toolkit with custom model support; strong in security (SIEM); massive install base in large enterprises | Extremely expensive; complex deployment; steep learning curve; resource-heavy (high RAM/storage); overkill for single-domain use cases | $1,800/GB/year (ingestion-based). Enterprise deployments typically $100K-500K+/year |
| **Alibaba Cloud SLS (Log Service)** | Cloud (China) | Strong in SEA market; integrated anomaly detection in log analytics; competitive pricing; Chinese-language support beneficial for Vietnamese enterprises with China trade | China-origin raises data sovereignty concerns in some Vietnamese government/military contexts; less mature ML capabilities vs. AWS/Azure; documentation quality uneven | Pay-as-you-go, ~60% cheaper than Datadog for equivalent workloads |

**Competitive Gap (Our Opportunity):**
None of these competitors offer a Vietnam-localized, domain-specific anomaly detection platform that combines: (1) Vietnamese-language alerting and dashboards, (2) pre-built models for local industry verticals (VietQR fraud patterns, Vietnamese manufacturing defect profiles, Tet/holiday seasonality), (3) on-premise deployment options meeting Vietnamese data residency requirements (Circular 13/2023/TT-NHNN for banking), and (4) pricing accessible to Vietnamese SMBs ($500-2,000/month range).

---

### 4. Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Alert fatigue / high false-positive rate** — Unsupervised models produce 30-50% false positives, causing operators to ignore all alerts | High (70%) | High | Implement the multi-level threshold strategy (warning/critical/emergency) from the Tech Report. Prioritize semi-supervised methods with human-in-the-loop feedback. Target <10% FP rate before production deployment via threshold calibration with pilot customers. |
| 2 | **Data cold-start problem** — New customers have insufficient historical data to train meaningful models | High (80%) | Medium | Develop transfer learning baselines per industry vertical. Provide rule-based detection as a bridge during the 2-4 week data accumulation phase. Pre-train models on public/synthetic datasets and fine-tune on customer data. |
| 3 | **Streaming infrastructure complexity** — Kafka + Flink expertise is scarce in Vietnam (estimated <200 senior engineers nationally) | Medium (50%) | High | Phase 1: batch-only architecture (simpler, cheaper, sufficient for 70% of use cases). Phase 2: add streaming only for latency-critical customers (fraud, security). Consider managed Kafka (Confluent Cloud) to reduce operational burden. |
| 4 | **Concept drift / model staleness** — Production data distributions shift over time (new fraud patterns, seasonal changes, infrastructure changes), degrading model accuracy | High (75%) | High | Implement drift detection (Alibi Detect's drift detectors as proposed in Tech Report). Automated retraining pipelines with MLflow. Set hard SLA: model must be retrained within 24h of detected drift. Budget 30% of ongoing engineering effort for model maintenance. |
| 5 | **Data privacy and regulatory compliance** — Vietnamese banking data subject to SBV regulations; cross-border data transfer restricted; PDPD (Personal Data Protection Decree 13/2023) imposes strict requirements | Medium (40%) | Critical | Offer on-premise and private cloud deployment from day one. Implement data anonymization in the feature engineering pipeline. Engage legal counsel specializing in Vietnamese fintech regulation. Obtain relevant certifications (PCI-DSS for payment fraud use case). |
| 6 | **Customer expectation mismatch** — Customers expect "plug and play" anomaly detection but reality requires weeks of configuration, feature engineering, and threshold tuning per domain | High (65%) | Medium | Set clear onboarding expectations (4-6 week implementation timeline). Build industry-specific templates that reduce configuration time to 1-2 weeks. Include professional services in initial contracts. |

---

### 5. Market Insight

**Who needs this:**
- **Banking & Fintech (Priority 1):** 47 commercial banks in Vietnam, plus ~80 fintech companies. Fraud losses exceed $200M/year and growing 25% annually with digital banking adoption. VietQR adoption (180M+ transactions/month by 2025) creates new fraud vectors. Decision-makers: CTO, CISO, Head of Risk.
- **Manufacturing (Priority 2):** 8,000+ factories in Vietnam (Samsung, Foxconn, local firms). Predictive quality control can reduce defect rates by 15-30%. Unplanned downtime costs $50K-500K/incident for large factories. Decision-makers: VP Operations, Plant Manager.
- **E-commerce & Logistics (Priority 3):** 2.5B+ packages/year across Vietnam. Anomaly detection needed for: delivery time prediction failures, pricing anomalies, fake review detection, inventory shrinkage. Key players: Shopee, Lazada, Tiki, GHTK, GHN.
- **Telecom:** 3 major operators (Viettel, VNPT, Mobifone) — network anomaly detection, fraud (SIM swap, subscription fraud).

**Willingness to pay:**
- Vietnamese banks: $20K-100K/year for SaaS; $200K-500K for on-premise with professional services
- Large manufacturers (FDI): $50K-200K/year (budget parity with global peers)
- Vietnamese SMB manufacturers: $500-2,000/month (price-sensitive, need ROI proof within 3 months)
- E-commerce platforms: $10K-50K/year per use case

**Market size — Vietnam:** Estimated $80-120M TAM for anomaly detection across all verticals by 2027, growing at 28% CAGR. Currently underserved — most Vietnamese enterprises use rule-based systems or manual monitoring.

**Market size — SEA:** $400-600M TAM by 2027. Thailand (manufacturing), Indonesia (fintech + e-commerce), Philippines (BPO fraud detection), and Singapore (financial services) represent the largest opportunities after Vietnam.

**Timing:** Optimal. Vietnamese banks are under SBV pressure to implement AI-based fraud detection by 2027 (Circular on Digital Banking Risk Management). Factory digitization accelerated by post-COVID supply chain restructuring. However, window is narrowing — Datadog and AWS are increasing SEA sales presence (AWS opened Ho Chi Minh City office in 2024).

---

### 6. Challenges to Research & Tech Reports

**Challenge 1 — Research Report underestimates the labeled data problem:**
The Research Report (Dr. Archon) provides excellent mathematical depth on 8 sub-fields and 10+ algorithmic families, but frames anomaly detection primarily as an unsupervised problem. In production, purely unsupervised methods consistently underperform. The report should have emphasized semi-supervised approaches more prominently, since most successful deployments (Stripe Radar, PayPal fraud detection) rely on historical labeled anomalies for threshold calibration. For Vietnam specifically, the absence of labeled datasets is the single biggest technical blocker — not algorithm selection.

**Challenge 2 — Tech Report's streaming-first architecture is premature:**
The Tech Report (Dr. Praxis) recommends a Hybrid architecture with Kafka + Flink as the reference design. While technically sound, this is over-engineered for the Vietnamese market entry. Most potential customers (especially manufacturers and mid-tier banks) do not have the data volume or latency requirements to justify streaming infrastructure. A batch-first architecture (hourly/daily detection) covers 70% of initial use cases at 20% of the infrastructure cost and complexity. The streaming layer should be a Phase 2 add-on.

**Challenge 3 — Neither report addresses explainability:**
Both reports omit a critical requirement for the Vietnamese banking market: regulatory explainability. SBV and Vietnamese banking compliance require that fraud detection decisions be explainable to auditors. Black-box models (deep autoencoders, transformers) face adoption resistance. The tech stack should include SHAP/LIME integration from day one. Isolation Forest and tree-based methods should be prioritized over deep learning for regulated verticals.

**Challenge 4 — Missing cost estimation:**
The Tech Report lists tools but provides no cost modeling. A realistic estimate for the proposed Kafka + Flink + MLflow + Triton + Grafana stack: $3,000-8,000/month in cloud costs for a moderate workload (10M events/day). This needs to be compared against the customer's willingness to pay. For Vietnamese SMBs paying $500-2,000/month, the margin is negative unless infrastructure is shared (multi-tenant SaaS).

**Challenge 5 — The feedback loop (Stage 6) is under-specified:**
The Tech Report mentions Label Studio and a "custom feedback API" for the feedback loop but does not design it. In practice, the feedback loop is the most important component for long-term model quality. It requires: a labeling UI embedded in the alert dashboard, a mechanism to distinguish "not anomaly" from "anomaly but not actionable," and a retraining trigger based on label volume thresholds. This needs a dedicated design.

---

### 7. Recommendations

1. **Start with Banking Fraud Detection as the beachhead vertical.** Highest willingness to pay, clearest ROI ($200M+ losses/year), regulatory tailwind (SBV mandates), and most available labeled data (transaction fraud databases). Target 2-3 mid-tier Vietnamese banks as pilot customers within Q2 2026.

2. **Deploy batch-first architecture.** Use the simplified stack: PostgreSQL + Python (PyOD/scikit-learn) + MLflow + Grafana. Total infrastructure cost: $500-1,500/month. Add Kafka streaming layer only when a customer explicitly requires <1 second latency. This reduces time-to-first-deployment from 12 weeks to 4 weeks.

3. **Build a Vietnam Anomaly Benchmark Dataset.** Partner with pilot customers to create anonymized, labeled anomaly datasets for 3 verticals (banking, manufacturing, e-commerce). This becomes a defensible competitive moat — no international competitor will invest in Vietnam-specific training data.

4. **Integrate explainability from day one.** Add SHAP explanations to every anomaly score. For the banking vertical, this is non-negotiable for regulatory compliance and customer trust. Prefer Isolation Forest + SHAP over deep learning for initial deployment.

5. **Design the multi-tenant SaaS pricing model.** To serve Vietnamese SMBs profitably at $500-2,000/month, infrastructure must be shared. Design for multi-tenancy from the start: shared Kafka cluster, per-tenant model isolation, shared Grafana with row-level security.

6. **Hire 2 streaming engineers proactively.** Even though Phase 1 is batch-only, Kafka/Flink expertise takes 3-6 months to recruit in Vietnam. Start hiring now for Phase 2 readiness (target Q4 2026).

7. **Establish partnerships with Vietnamese system integrators.** FPT Software, CMC, and Viettel Solutions have existing relationships with banks and manufacturers. A channel partner model accelerates market access without building a direct sales team.

---

*Report prepared by Dr. Sentinel (R-γ), Feasibility & Risk Assessment Agent, MAESTRO Platform.*
