# Data Engineering Notes: B06 Optimization
## By R-DE — Date: 2026-03-31

---

### 1. Data Pipeline for Optimization Systems

An optimization data pipeline differs fundamentally from analytics pipelines. The flow is: **raw data collection → parameter estimation → constraint assembly → solver input generation → solver execution → solution extraction → execution tracking → feedback loop.**

**Demand data** flows from POS systems, ERP, and IoT sensors into a data lake. ETL processes clean, aggregate, and feed forecasting models that produce demand parameters for the optimizer. **Constraint data** comes from business rules databases — vehicle capacities, labor agreements, regulatory limits. These change less frequently but must be version-controlled.

**Parameter estimation** transforms raw data into solver-ready parameters: unit costs, travel time matrices, production rates, defect probabilities. This is where data quality issues cause the most damage — a wrong cost coefficient silently produces suboptimal solutions.

**Solution output pipeline:** The solver produces decisions (routes, schedules, allocations). These must be translated from mathematical variables back into actionable instructions — driver assignments, production orders, purchase orders — and pushed to execution systems (WMS, TMS, ERP). A critical but often neglected step is **feedback collection**: what actually happened versus what the optimizer recommended, enabling model recalibration.

### 2. Input Data Formats for Solvers

**LP/MPS format** is the standard interchange format for linear and mixed-integer programs. MPS (Mathematical Programming System) is column-oriented and widely supported by Gurobi, CPLEX, SCIP, and HiGHS. LP format is human-readable but less efficient for large models. Most practitioners use modeling APIs (PuLP, Pyomo, JuMP) that generate these formats internally.

**OR-Tools JSON/Protobuf:** Google OR-Tools accepts problem definitions via Protocol Buffers or programmatic API. For routing, the key input is a `RoutingModel` with a distance/time matrix, capacity constraints, and time windows specified as callback functions or matrices.

**Constraint matrices** for LP/MIP: the A matrix (constraint coefficients), b vector (right-hand side), c vector (objective coefficients), variable bounds, and variable types (continuous/integer/binary). Sparse representation is essential — real-world constraint matrices are typically >99% zeros.

**Distance matrices for routing:** Precomputed n×n matrices of travel times/distances between all location pairs. For n=1000, this is 1M entries. Asymmetric matrices (directional roads) double the storage. Caching and incremental updates are critical for large-scale routing.

### 3. Real-time Data Integration

Optimization systems increasingly consume live data to make dynamic decisions.

**Live inventory levels** from warehouse management systems trigger replenishment optimization. The pipeline: WMS → event stream (Kafka) → inventory state store (Redis/Flink state) → threshold trigger → optimizer invocation. Latency target: under 5 minutes from stock change to new replenishment order.

**Traffic data for routing:** Google Maps API, HERE, or TomTom provide real-time traffic. For dynamic rerouting, a streaming pipeline ingests traffic updates every 1-5 minutes, updates the travel time matrix, and triggers re-optimization for active routes. Challenge: re-optimization must complete before the next decision point (driver reaches next intersection).

**Price feeds for pricing optimization:** Competitor prices scraped or via API feed into dynamic pricing models. Kafka topics partition by product category; a Flink job aggregates price signals and triggers pricing optimization per category. Latency requirement varies: airline pricing tolerates minutes; e-commerce flash sales need seconds.

**Architecture pattern:** Event-driven optimization uses Kafka as the backbone. Events (new order, inventory change, traffic update) trigger optimization jobs via a dispatcher that manages solver instances, enforces timeouts, and handles solver failures gracefully.

### 4. Constraint Management System

Business constraints change frequently and must be managed as data, not hard-coded logic.

**Constraint catalog:** A database table or configuration store listing all constraints: name, type (hard/soft), parameters, effective dates, and ownership (which business unit defined it). Example: "Max driving hours = 8h/day" is a hard constraint from regulatory compliance; "Prefer morning deliveries" is a soft constraint from customer service.

**Version control for constraint sets:** Each optimization run references a specific constraint version. When a business rule changes (new labor agreement, regulatory update), a new version is created. Historical runs can be reproduced by loading the constraint version used at that time. Git-based storage (constraint YAML files in a repository) works well for audit-heavy industries.

**Conflict detection:** When constraints are added or modified, automated checks verify feasibility. Infeasible constraint sets (contradictory rules) must be flagged before reaching the solver. An irreducible infeasible subsystem (IIS) analysis identifies which constraints conflict.

**Soft constraint weighting:** Business stakeholders assign priority weights to soft constraints through a UI. The data engineer translates these weights into penalty terms in the objective function. A/B testing different weight configurations helps calibrate business preferences.

### 5. Solution Logging & Audit Trail

For regulated industries and continuous improvement, every optimization decision must be traceable.

**What to log:** Problem instance ID, solver version, constraint version, objective value, solve time, optimality gap, number of variables/constraints, all decision variable values, active constraints at the optimum, and the human who approved or overrode the solution.

**Storage design:** Solution logs can be large (millions of variable values per run). Use columnar storage (Parquet) for analytical queries and a metadata database (PostgreSQL) for indexing. Retain full solutions for the compliance window (often 7 years for financial decisions); retain summaries indefinitely.

**Compliance queries:** "Why did the optimizer assign Driver A to Route 7 on March 15?" requires reconstructing the full problem instance: what data was available, what constraints were active, and proving the assignment was optimal (or near-optimal) given those inputs. This demands immutable snapshots of all input data at solve time.

**Solution comparison:** Track solution quality over time. If Monday's routing cost is 15% higher than the previous Monday, the audit trail reveals whether the cause was demand change, new constraints, data quality issues, or solver configuration changes.

### 6. Geospatial Data for Routing

Routing optimization depends heavily on accurate geospatial data.

**OpenStreetMap (OSM)** provides free road network data. OSRM (Open Source Routing Machine) or Valhalla compute shortest paths and travel time matrices from OSM data. Self-hosted instances give full control and avoid API rate limits. For Vietnam, OSM coverage in major cities (Ho Chi Minh City, Hanoi) is good but rural coverage remains incomplete.

**Google Maps / HERE APIs** provide higher-quality traffic-aware travel times but at significant cost for large-scale operations. A hybrid approach: use Google Maps for real-time traffic on active routes, OSRM for batch distance matrix computation during planning.

**Distance matrix computation** is the major bottleneck. For n locations, computing the full n×n matrix requires n*(n-1) shortest path queries. Optimizations: precompute and cache matrices for recurring location sets, use matrix APIs (Google Distance Matrix, OSRM /table endpoint) for batch computation, and partition large problems geographically.

**Geocoding Vietnamese addresses** is notoriously challenging. Addresses often lack standardized formatting — inconsistent ward/district names, missing postal codes, local landmarks used as references. Dedicated Vietnamese geocoding services (Goong, Map4D) handle local address formats better than global providers. Building a cleaned master address database with validated coordinates is a high-value data engineering investment.

### 7. Simulation Data Pipeline

Stochastic optimization requires scenario data generated through simulation.

**Monte Carlo simulation** generates thousands of demand/supply scenarios from probability distributions. Pipeline: historical data → distribution fitting → scenario generation → scenario storage → stochastic optimizer. Each scenario is a complete realization of uncertain parameters (demand vector, travel times, machine breakdowns).

**Scenario reduction** is necessary when the full scenario set is too large for the solver. Techniques: k-medoids clustering of scenarios, probability redistribution to representative scenarios, and forward/backward reduction algorithms. A typical reduction: 10,000 raw scenarios → 50-100 representative scenarios.

**Simulation output management:** Each simulation run produces gigabytes of output. Use hierarchical storage: hot storage (SSD) for active optimization runs, warm storage (HDD/S3) for recent history, cold storage (Glacier) for archival. Tag outputs with simulation parameters for reproducibility.

**Digital twin integration:** A simulation model that mirrors the physical system (factory, warehouse, logistics network) continuously ingests real data to stay calibrated. The optimization system queries the digital twin for what-if evaluation before committing to decisions.

### 8. Vietnamese Data Challenges

Operating optimization systems in Vietnam presents unique data engineering challenges.

**Vietnamese address parsing:** Addresses follow the format "house number, street, ward (phuong/xa), district (quan/huyen), city/province." However, inconsistent usage of administrative levels, abbreviations (P. for Phuong, Q. for Quan, TX. for Thi Xa), and legacy versus new district names (after administrative boundary changes) require specialized NLP parsing and a regularly updated administrative boundary database.

**Inconsistent location data:** Many small manufacturers and distributors lack precise GPS coordinates. Delivery addresses may reference landmarks ("opposite the market," "next to the gas station") rather than structured addresses. Building a verified location master with GPS coordinates from field visits is essential before routing optimization can succeed.

**Manual data entry in manufacturing:** Many Vietnamese manufacturers, especially SMEs, still rely on paper-based or Excel-based production tracking. Data digitization is a prerequisite for optimization. Pragmatic approaches: barcode scanning at key checkpoints (material receipt, production start/end, shipment) provides 80% of the data value with 20% of the effort. Gradual migration from Excel to lightweight MES systems.

**Data quality monitoring:** Implement automated checks for Vietnamese-specific issues: addresses that fail geocoding, phone numbers with invalid format, product codes that do not match the master catalog, and weight/volume data that is physically implausible. A data quality dashboard showing completeness and accuracy scores by data source helps prioritize improvement efforts.
