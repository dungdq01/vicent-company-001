# Solution Architecture Notes: B06 Optimization
## By R-SA — Date: 2026-03-31

### 1. Optimization System Architecture Patterns

Four dominant patterns emerge for deploying optimization in enterprise environments:

**Batch Optimization Engine** — The most common pattern. A scheduled process collects constraints and objectives from upstream systems, runs a solver (minutes to hours), and writes results back. Used for weekly production schedules, daily route plans, and monthly network design. Typical stack: Python + OR-Tools/Gurobi on a compute-optimized VM, triggered by Airflow or cron.

**Real-Time Optimization Service** — A microservice exposing an optimization API with sub-second response times. Handles dynamic re-routing when a driver reports delay, real-time order batching, or live inventory rebalancing. Requires pre-computed components (distance matrices, constraint caches) and fast heuristics rather than exact solvers. Deployed as a containerized service behind a load balancer.

**Embedded Optimization in SaaS** — Optimization logic embedded within a larger application (WMS, TMS, ERP module). The solver is a library dependency, not a standalone service. Tight coupling yields better UX but limits solver upgrades. Common in commercial WMS products like Manhattan Associates or Blue Yonder.

**Optimization-as-a-Service (OaaS)** — Cloud-hosted optimization APIs (Google Cloud Fleet Routing, AWS Supply Chain, NextBillion.ai). Zero infrastructure management, pay-per-solve pricing. Best for companies without in-house OR expertise. Latency and data residency are trade-offs.

### 2. Build vs Buy Analysis

| Solution | Type | Best For | Monthly Cost (est.) | Vietnam Fit |
|---|---|---|---|---|
| Gurobi | Commercial solver | Large-scale LP/MIP, exact solutions | $3,000-12,000 license | Low — cost prohibitive for SMEs |
| IBM CPLEX | Commercial solver | Enterprise MIP, academic strong | $2,500-10,000 license | Low — same cost barrier |
| Google OR-Tools | Open-source | Routing, scheduling, constraint programming | Free + compute | High — zero license cost, strong community |
| OptaPlanner | Open-source (Java) | Constraint-heavy scheduling, nurse rostering | Free + compute | Medium — Java ecosystem less common in VN startups |
| Custom Metaheuristics | In-house dev | Domain-specific problems, competitive advantage | Engineering time only | High — leverages VN developer talent pool |
| Cloud Optimization APIs | SaaS | Fleet routing, quick deployment | $0.01-0.10 per request | Medium — data residency concerns |

For the Vietnamese market, OR-Tools combined with custom metaheuristics offers the best cost-to-capability ratio. Commercial solvers make sense only for large FDI factories (Samsung, Intel) where the optimization value exceeds $50K/year.

### 3. Integration with Enterprise Systems

The canonical integration flow for ERP-connected optimization:

**SAP/Oracle ERP Integration**: Extract demand forecasts, production orders, resource constraints, and BOM data via RFC/BAPI (SAP) or REST APIs (Oracle Cloud). The optimization engine processes these inputs, generates schedules or routes, and writes results back as planned orders, production schedules, or transportation requests. Middleware (MuleSoft, Apache Camel) handles data transformation.

**WMS Integration**: Receive pick lists and inventory positions, optimize pick paths and wave grouping, return optimized pick sequences. Real-time via message queue (RabbitMQ/Kafka).

**TMS Integration**: Ingest shipment orders with time windows and vehicle constraints, run VRP solver, output route plans with stop sequences and ETAs. GPS telemetry feeds back for dynamic re-optimization.

### 4. Reference Architecture: Last-Mile Delivery Optimization

```
[Order API] → [Geocoding Service] → [Distance Matrix Builder]
                                            ↓
[Constraint DB] → [VRP Solver Engine] ← [Vehicle/Driver Pool]
                        ↓
              [Route Assignment Service]
                   ↓            ↓
            [Driver App]   [Customer Notifications]
                   ↓
            [GPS Tracking] → [Dynamic Re-optimizer]
```

Key components: Geocoding must handle Vietnamese addresses (ward/district/city hierarchy). Distance matrix uses OSRM or Valhalla with Vietnam road network. VRP solver runs Google OR-Tools with capacity, time-window, and break constraints. Dynamic re-optimizer triggers on delay events or new order insertions.

### 5. Reference Architecture: Production Scheduling

```
[MES/ERP] → [Job Order Extractor] → [Machine Constraint Loader]
                                            ↓
[Material Availability] → [Scheduling Engine] ← [Worker Shift Data]
                                ↓
                    [Gantt Schedule Output]
                         ↓           ↓
                    [MES Writeback]  [Dashboard]
                         ↓
                  [Shop Floor Dispatch]
```

The scheduling engine receives job orders with processing times, machine eligibility, due dates, and setup times. It produces a Gantt chart schedule minimizing makespan or tardiness. MES writeback updates work orders with planned start/end times. The dashboard provides supervisors visibility into utilization and bottlenecks.

### 6. Scalability Design

Large optimization problems must be decomposed to remain tractable:

**Geographic Clustering** — For routing: partition delivery points into geographic clusters (k-means on lat/lng), solve each cluster independently, then refine boundary assignments. Reduces a 5,000-stop VRP into 50 parallel 100-stop problems.

**Time Decomposition** — For scheduling: solve week-by-week with rolling horizon. Each solve optimizes 5-7 days with a frozen first day. Keeps problem size manageable while maintaining inter-period continuity.

**Hierarchical Optimization** — Strategic level: network design (monthly). Tactical level: fleet allocation (weekly). Operational level: route optimization (daily). Each level provides constraints to the level below.

### 7. Total Cost of Ownership

Three-year TCO comparison for a mid-size logistics company (500 daily routes):

- **Gurobi + dedicated infra**: $108K license + $36K infra + $60K engineering = $204K
- **OR-Tools + cloud compute**: $0 license + $24K compute + $120K engineering = $144K
- **Cloud API (Google Fleet Routing)**: $0 license + $180K API costs + $30K integration = $210K

Break-even: OR-Tools wins when engineering talent is available at Vietnamese rates ($1,500-3,000/month for OR engineers). Cloud APIs win when speed-to-market matters and volume is low.

### 8. Migration Path

A practical four-phase migration for Vietnamese companies moving from manual to optimized operations:

1. **Manual Planning** (current state) — Dispatchers use experience and paper maps. Baseline: measure current KPIs (cost/delivery, utilization, on-time rate).
2. **Spreadsheet Optimization** — Excel Solver or Google Sheets for simple problems. Proves concept, builds organizational buy-in. Timeline: 1-2 months.
3. **OR-Tools Prototype** — Python-based proof of concept solving real routing or scheduling problems. Validate 10-20% improvement on historical data. Timeline: 2-3 months.
4. **Production Solver** — Containerized optimization service integrated with TMS/WMS, API-driven, monitored. Timeline: 3-6 months.
5. **Real-Time Optimization** — Dynamic re-optimization, predictive inputs (traffic, demand), continuous improvement loop. Timeline: 6-12 months.

Each phase should demonstrate measurable ROI before proceeding to the next, reducing organizational risk and building stakeholder confidence.
