# B01 Learnings — Forecasting & Time Series
Date: 2026-03-30

## Top Insights (for future modules)

1. **Foundation models solve a real problem (cold-start) but are routinely overhyped.** The "weeks to hours" development time claim is true at the cold-start / first-forecast scope but false at the production system scope. In every module where foundation models are positioned as differentiators, the synthesis layer must distinguish *model development time* from *system deployment time* — they differ by weeks of engineering. The framing that survives scrutiny: "foundation models reduce cold-start time to hours; they complement but do not replace trained models once data accumulates." This distinction will recur in any module that incorporates large pre-trained models.

2. **The right-sized stack insight is the most commercially actionable finding.** Dr. Praxis (β) described an enterprise platform; Dr. Sentinel (γ) correctly identified it as 2–3× over-engineered for early customers. The reconciled architecture — tiered by series count and serving requirement, with components introduced only when actual bottlenecks are observed — is a pattern that should be applied to every future module. The heuristic: describe the full production architecture once, then explicitly state which components are deferred for which tier and at what scale threshold each becomes justified.

3. **The Vietnam/SEA 3–5 year adoption lag is a structural competitive advantage.** Gamma surfaced the insight that SEA logistics and retail markets are behind US/EU adoption, meaning solutions that US market considers commoditised still win competitive deals in the region. This geographic timing advantage should be evaluated for every module — it affects which algorithms qualify as "defensible" in the SEA context vs. which are already API-commoditised globally.

## Patterns to Reuse

- **Three-tier architecture description**: Describe MVP (minimal viable), Production v1 (production-ready for first clients), and Full Platform (multi-tenant, full-featured). Always include effort estimates at each tier with explicit "optimistic vs. realistic" ranges. Always list which components are deferred to which tier. Apply to: every future module.

- **Contradiction resolution template**: When α and γ disagree, first check whether both claims are true at different scopes. The M4 vs M5 competition resolution (ETS wins on clean univariate; LightGBM wins on business hierarchical data) is a scope-split pattern — not a contradiction at all. Apply to: any module where academic benchmark performance diverges from production performance.

- **"Approximate, not guaranteed" language policy**: Any mathematical claim of "guaranteed" behaviour (coverage, convergence, optimality) should be checked against the assumptions required for the guarantee to hold. For time series, exchangeability is the most common violated assumption. Replace "guaranteed" with "empirically validated [X]% on [specific holdout]" in all client-facing materials. Apply to: B07 (conformal anomaly scoring), B08 (any probabilistic NLG), and any module using conformal prediction.

- **Commercial moat audit**: For any module where foundation models or managed services (AWS, Azure, GCP) could commoditise the primary differentiator within 18–24 months, explicitly identify the secondary moat (MLOps pipeline, data sovereignty, vertical integration, client switching costs). Do not allow "better models" to be the only moat. Apply to: all B-series modules in the knowledge graph.

- **Go-conditions checklist before Production v1 investment**: For each module, identify 2–3 pre-conditions that must be validated before committing to the Production v1 build. Minimum: (a) customer profile validated, (b) unit economics benchmarked for variable-cost components (GPU, API calls, storage), (c) top silent failure mode converted to a CI/CD gate.

## Pitfalls to Avoid

- **Citing competition results without context window**: M4 (2018, clean univariate) and M5 (2020, hierarchical business data) produce opposite conclusions. Always cite the dataset characteristics alongside the result. Benchmark citations without domain-scope qualifiers are a credibility risk in stakeholder presentations.

- **Including Feast in Production v1 without a prior spike**: Feast is architecturally correct for point-in-time correct features at scale, but has a 2–4× timeline overrun rate on first implementations. The default should be SQL views for Production v1 with Feast introduced only in the Full Platform phase and only after a dedicated proof-of-concept spike. Apply this "spike before critical-path commitment" discipline to any novel infrastructure component.

- **Conflating "works in notebook" with "works in production" for MinT reconciliation**: MinT requires stable, versioned hierarchy definitions. Retail and logistics hierarchies change frequently. The summing matrix must be versioned with timestamp-effective records from day 1. Retrofitting hierarchy versioning after the first category restructuring is a multi-week setback.

- **Not including a cost model for variable-cost components**: GPU inference, managed API calls, and per-prediction SaaS pricing must be benchmarked before architecture lock. Any component with variable cost that scales with customer data volume requires a cost-per-unit analysis before it enters the Production v1 serving path.

- **Walk-forward CV gap as an afterthought**: The most common silent quality failure in forecasting is an incorrect gap between training and validation. This must be a first-class CI/CD blocking gate from Week 1 of any ML development, not a code review comment caught after the first client goes live.

## Cross-Module Connections

- **B01 ↔ B07 (Anomaly Detection & Monitoring)**: Bidirectional. Forecast residuals are the anomaly signal in prediction-error-based anomaly detection. Anomaly detection outputs (outlier flags, structural break detection) feed back into forecasting as data quality gates and training set filters. Both modules share monitoring infrastructure (Evidently AI, Prometheus drift detection). When building B07, reuse the Evidently + Prometheus stack defined in B01.

- **B01 ↔ B08 (Conversational AI)**: Forecasts can be surfaced to business users via natural language interfaces ("What is our expected demand for store A next week?"). LLM-based forecasting (LLM-Time, GPT4TS) is an explicit research track that bridges the two modules. Foundation model pre-training techniques (masked modelling, next-token prediction) transfer between Chronos/TimesFM and language model architectures.

- **B01 → Operations Research / Optimisation**: Probabilistic demand forecasts are the primary inputs to inventory optimisation (newsvendor model), vehicle routing, and capacity planning. When building any optimisation module, the forecast distribution F is the stochastic input — point forecasts are insufficient for optimal decision-making under uncertainty. This connection elevates the value of probabilistic forecasting far beyond model accuracy KPIs.

- **B01 → Future modules with foundation model components**: The cold-start resolution (foundation model for < 60 observations, task-specific model for ≥ 60) is a general pattern applicable to any module that involves training on entity-level data where new entities regularly appear (customer churn, product recommendations, fraud detection per account).

## Agent Performance Notes

**What worked well in this pipeline:**
- The three-tier Layer 1 structure (Research → Tech → Feasibility) created natural coverage of theory, implementation, and risk — the agents did not overlap or duplicate, which made synthesis clean.
- Dr. Sentinel (γ) adding specific market data (Nixtla pricing at $0.0001/prediction, AWS Forecast at $0.60/1000 forecasts, Oracle implementation costs $200K–$2M) made the competitive analysis actionable rather than generic.
- The Layer 2 practitioner notes (R-MLE, R-DE, R-DA, R-BE, R-DO, R-QA, R-D06, R-SA, R-FE) provided the production grounding that Layer 1 lacked — particularly R-D06's logistics domain specifics and R-QA's explicit numeric thresholds for model quality gates.
- γ challenged α with HIGH-confidence citations, not speculation. The challenge-evidence-position structure made contradiction resolution straightforward.

**What to adjust for next module:**
- The DATA-SCHEMA.md file was not reachable (appeared in docs/ not data/). Future agents should be given the explicit path to DATA-SCHEMA.md or the schema should be inlined in the system prompt to avoid the need for a file read that may fail.
- The tech report (β) and feasibility report (γ) should both include a brief "synthesis handoff summary" table listing their top 3 contradictions and top 3 risks in a structured format — this would reduce the synthesis layer's scan time for cross-agent disagreements.
- For modules with more than one "hot topic" area (e.g., a module covering both NLP and vision), consider adding a dedicated "contradiction register" as a named section in the feasibility report so γ explicitly lists all inter-agent disagreements — the implicit format worked for B01 but may break down with more complex modules.
- Layer 2 notes could be more explicitly cross-referenced to Layer 1 claims. Currently R-MLE and R-QA independently confirmed the MASE recommendation but did not cite α's research report. Explicit cross-references would make the consensus signal stronger and reduce synthesis lookup time.
