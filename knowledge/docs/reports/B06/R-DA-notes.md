# Data Analysis Notes: B06 Optimization
## By R-DA — Date: 2026-03-31

---

### 1. Optimization Problem Identification

The analyst's first job is recognizing where optimization can deliver value. Not every inefficiency is an optimization problem — some are process failures, data gaps, or misaligned incentives.

**Signals in the data:** High variance in KPIs across comparable units (e.g., delivery cost per order varies 3x between depots) suggests inconsistent decision-making that optimization could standardize. Manual scheduling — visible as Excel files emailed between planners — almost always hides optimization potential. Excess inventory (weeks of cover >> target) indicates replenishment decisions are not balancing holding cost against stockout risk.

**Structured discovery process:** (1) Map all decisions that are currently made by humans or simple rules. (2) Estimate the decision frequency and economic impact. (3) Assess data availability for the key inputs. (4) Prioritize by impact-to-effort ratio. A routing optimization for 50 trucks making 500 daily deliveries will save far more than optimizing a weekly 10-item purchase order.

**Quantifying the prize:** Before proposing an optimization project, estimate the theoretical savings. If current routes average 120 km per truck and a TSP solver on historical orders produces 100 km routes, the prize is roughly 17% fuel and time savings. This back-of-envelope calculation justifies (or kills) the project before engineering begins.

### 2. Baseline Measurement

Without a rigorous baseline, optimization results are meaningless. "We saved 15%" means nothing if the baseline was poorly measured.

**Before optimization:** Measure the current state over a statistically representative period. For routing, collect 4-8 weeks of actual route data (GPS traces, delivery timestamps, fuel consumption). For scheduling, collect actual makespan, machine utilization, and tardiness over multiple production cycles. For inventory, collect 3-6 months of stock levels, stockout events, and holding costs.

**Baseline must reflect reality, not plans:** Compare optimizer output against what actually happened, not against what the old plan said. If the old route plan said 100 km but drivers actually drove 130 km (due to ad hoc changes, missed deliveries, traffic), the true baseline is 130 km.

**After optimization:** Measure the same KPIs over a comparable period. Account for external changes — if demand grew 20% between baseline and optimized periods, normalize accordingly. Use difference-in-differences or matched comparisons (optimized vs control depots) when possible.

**Statistical significance:** For noisy metrics, use paired t-tests or bootstrap confidence intervals. A 3% improvement with a 5% confidence interval is not a proven win. Report effect sizes and confidence intervals, not just point estimates.

### 3. Key Metrics for Optimization Projects

Each optimization domain has specific metrics, but some are universal.

**Cost reduction (%):** The headline metric. Total cost before vs after, normalized for volume. Decompose into components: for routing, break into fuel, driver time, vehicle wear, and penalty costs. For scheduling, break into labor, machine, material, and tardiness costs.

**Service level (%):** Optimization that cuts cost but degrades service is not optimization — it is a different tradeoff. Track on-time delivery rate, fill rate, and customer complaints alongside cost. The best optimization improves both cost and service by eliminating pure waste.

**Utilization (%):** Vehicle utilization (% of capacity filled), machine utilization (% of available time productive), warehouse utilization (% of space used). Optimization should push utilization up, but not to 100% — that leaves no buffer for variability.

**Makespan reduction:** For scheduling, the total time from first job start to last job finish. Reducing makespan increases throughput without adding capacity.

**Route efficiency:** Total distance or time divided by the theoretical minimum (straight-line distances × number of stops). Values below 1.3 are considered good for urban delivery.

**Inventory turnover:** Revenue / average inventory value. Optimization should increase turnover (lower inventory for the same sales) while maintaining or improving fill rate.

### 4. What-if Analysis & Scenario Planning

Optimization models are powerful scenario analysis tools — often more valuable for insight generation than for the optimal solution itself.

**Sensitivity analysis:** Systematically vary key parameters and observe how the optimal solution and objective value change. Questions: "If demand increases 10%, how much does the optimal fleet cost increase?" "At what fuel price does switching to electric vehicles become optimal?" "How many additional drivers are needed to maintain 98% on-time delivery if order volume grows 15%?"

**Implementation:** For LP/MIP, sensitivity analysis comes free from dual variables (shadow prices). The shadow price of a constraint tells you the marginal value of relaxing it by one unit. If the shadow price on warehouse capacity is $50/pallet/day, that quantifies the value of expansion.

**Pareto frontier visualization** for multi-objective optimization: plot cost vs service level for a range of solutions. Let decision-makers visually choose their preferred tradeoff rather than forcing a single objective. Generate the frontier by solving with varying weights on the objectives or using epsilon-constraint method.

**Scenario planning:** Define 3-5 plausible future scenarios (baseline, high growth, supply disruption, regulatory change). Solve the optimization for each scenario. Identify robust decisions (good across all scenarios) versus scenario-dependent decisions. Present results as a decision matrix: rows = strategies, columns = scenarios, cells = performance metrics.

### 5. Optimization Dashboard Design

An optimization dashboard must communicate complex mathematical results to non-technical stakeholders.

**Real-time KPIs panel:** Current performance versus optimized recommendation. Show the gap — "Today's routes: 12,400 km. Optimized routes: 10,800 km. Potential savings: 12.9%." Use traffic-light indicators: green (following optimized plan), yellow (minor deviations), red (significant deviations or constraint violations).

**Constraint violation monitor:** List active constraints and their status. Highlight binding constraints (at their limit) — these are the bottlenecks. Show which constraints, if relaxed, would yield the largest improvement (shadow prices translated into business language: "Adding one more truck saves $2,300/day").

**Solution quality over time:** Track optimality gap and solve time across runs. A trend of increasing solve times may indicate growing problem complexity or data issues. Sudden jumps in objective value suggest data anomalies or constraint changes.

**Map visualization for routing:** Show optimized routes on an interactive map with color-coding by vehicle, time windows as markers, and actual versus planned positions. For Vietnamese logistics, overlay traffic heatmaps from Google Maps or local providers.

**What-if simulator:** Allow users to modify scenarios (add/remove orders, change vehicle availability, adjust time windows) and immediately see the impact on the optimized solution. This builds trust and gives planners a sense of control.

### 6. Vietnamese Industry Analytics

Understanding the Vietnamese context is essential for sizing optimization opportunities.

**Logistics costs:** Vietnam's logistics costs represent approximately 16-17% of GDP, compared to 8-10% in developed economies. This gap is driven by fragmented supply chains, poor infrastructure outside major corridors, and low technology adoption. Even modest optimization (5-10% cost reduction) represents enormous aggregate value.

**Manufacturing sector:** Vietnam's manufacturing is heavily export-oriented (electronics, textiles, footwear, furniture). Production scheduling optimization is relevant for the 8,000+ medium and large manufacturers. Common pain points: high work-in-process inventory, long changeover times, and manual scheduling by experienced planners approaching retirement age — their tacit knowledge is at risk.

**Last-mile delivery:** The e-commerce boom (Shopee, Lazada, TikTok Shop) has created massive last-mile optimization demand. Vietnamese cities have narrow streets, motorbike-dominated traffic, and high delivery density — characteristics that favor optimization. A typical last-mile carrier handles 200-500 parcels per rider per day, with route optimization potentially saving 15-25% of travel time.

**Cold chain logistics:** Vietnam's agricultural exports (seafood, fruits, coffee) require temperature-controlled logistics. Cold chain optimization is a high-value niche — spoilage rates of 25-30% for perishable goods indicate massive waste that routing and inventory optimization can address.

### 7. ROI Analysis for Optimization Projects

Quantifying return on investment is essential for securing budget and measuring success.

**Typical savings benchmarks:** Vehicle routing optimization delivers 10-15% distance/fuel reduction. Production scheduling optimization delivers 5-10% makespan reduction or equivalent throughput increase. Inventory optimization delivers 15-20% inventory reduction while maintaining service levels. Workforce scheduling delivers 3-8% labor cost reduction.

**Cost components of an optimization project:** Software licensing (Gurobi ~$12K-30K/year; open-source alternatives like HiGHS/OR-Tools are free), development effort (3-6 months for a senior team of 2-3 engineers), data preparation (often 40-60% of total effort), change management (training planners to trust and use optimizer output), and ongoing maintenance (model updates, constraint changes, performance monitoring).

**Payback period calculation:** For a fleet of 50 trucks spending $2M/year on fuel and driver costs, a 12% savings from routing optimization yields $240K/year. If the project costs $150K to build and $50K/year to maintain, payback is under 8 months. For inventory optimization, the savings come from reduced holding costs and reduced stockouts — both measurable in financial terms.

**Intangible benefits** often exceed direct cost savings: faster response to changes, reduced planner workload (enabling redeployment), better customer service, and data-driven decision culture. While harder to quantify, these should be mentioned in the business case.

### 8. Common Pitfalls in Optimization Analytics

Years of optimization projects reveal recurring mistakes that analysts must watch for.

**Optimizing the wrong objective:** A routing model that minimizes total distance may produce solutions where one driver works 12 hours while others finish in 4. The real objective should balance cost, fairness, and service. Always validate that the mathematical objective aligns with the actual business goal by reviewing solutions with domain experts.

**Ignoring soft constraints:** Hard constraints (vehicle capacity, operating hours) are easy to model. Soft constraints (driver preferences, customer relationships, "we always deliver to Client X first") are often omitted because they are hard to quantify. But when the optimizer produces a solution that violates these unwritten rules, planners override it, destroying trust. Invest time eliciting and encoding soft constraints.

**Over-optimizing and brittleness:** A solution that is perfectly optimal for today's parameters may be terrible if anything changes. A route plan with zero slack means one traffic jam cascades into multiple late deliveries. Build robustness into the model: add buffer times, penalize tight schedules, or optimize for worst-case scenarios rather than expected values. Stochastic optimization and robust optimization are formal frameworks for this.

**Model versus reality gap:** The optimization model is an abstraction. Travel times are estimates. Demand forecasts are uncertain. Machine processing times vary. When the model's assumptions are too far from reality, the "optimal" solution is suboptimal in practice. Continuous monitoring of plan-vs-actual deviations is the analyst's key tool for detecting and correcting model drift.

**Analyst's role in adoption:** The best optimization model is worthless if planners do not use it. Analysts must build trust through transparency — showing why the optimizer made each decision, demonstrating improvements on historical data, and giving planners override capability with feedback loops. Adoption is a social problem as much as a technical one.
