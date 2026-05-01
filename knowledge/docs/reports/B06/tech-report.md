# Tech Report: Optimization & Operations Research (B06)
## By Dr. Praxis (R-B) — Date: 2026-03-31

---

### 1. Implementation Summary

Optimization and Operations Research (B06) requires a layered tech stack spanning exact solvers (LP/MIP), constraint programming engines, metaheuristic frameworks, and API orchestration for production deployment. Google OR-Tools serves as the primary free solver suite covering routing, scheduling, and constraint satisfaction, while Gurobi is recommended for enterprise scenarios demanding maximum solve speed on large MIP instances. The implementation architecture separates batch optimization (nightly planning), real-time optimization (dynamic dispatch), predict-then-optimize (forecast-driven decisions), and multi-objective pipelines (Pareto trade-off analysis). All pipelines funnel through a FastAPI layer with Celery-based async task management, enabling both synchronous small-problem solves and asynchronous long-running optimization jobs. For Vietnamese teams, the stack is designed around free and open-source tools first, with clear upgrade paths to commercial solvers when scale demands it.

---

### 2. Tech Stack Decision Matrix

| Layer | Technology | Version | Alternatives | Why This One | Cost |
|-------|-----------|---------|-------------|-------------|------|
| Solver Engine (LP/MIP) | Google OR-Tools (GLOP + SCIP) | 9.10+ | Gurobi 12, CPLEX 23.1, HiGHS 2.0, COPT 7.0 | Free, Apache-licensed, production-proven, bundles LP (GLOP) and MIP (SCIP backend); zero licensing friction for Vietnamese startups | Free |
| Metaheuristic Framework | DEAP | 1.4+ | pymoo 0.6, pagmo/pygmo 2.19, jMetalPy, Platypus | Mature Python library with GA, PSO, ES, GP support; flexible enough for custom operators; strong community and documentation | Free |
| Constraint Programming | OR-Tools CP-SAT | 9.10+ | IBM CP Optimizer, MiniZinc + Chuffed, Choco-solver | Best free CP solver available; dominates scheduling benchmarks; native Python API; integrated with OR-Tools ecosystem | Free |
| Routing Engine | OR-Tools Routing Library | 9.10+ | VROOM 1.14, OptaPlanner, custom LKH-3 wrapper | Purpose-built for CVRP/VRPTW/PDPTW; supports time windows, capacities, penalties, pickup-delivery; production-grade | Free |
| Scheduling Engine | OR-Tools CP-SAT | 9.10+ | IBM CP Optimizer, OptaPlanner, custom GA scheduler | CP-SAT excels at job-shop, flow-shop, and nurse scheduling; interval variables and no-overlap constraints are first-class | Free |
| Experiment Tracking | MLflow | 2.15+ | Weights & Biases, Neptune, custom DB logging | Tracks solver configs, objective values, solve times, solution quality across experiments; self-hosted option; familiar to ML teams | Free (self-hosted) |
| API Layer | FastAPI | 0.115+ | Flask, Django REST, gRPC | Async-native, auto-generated OpenAPI docs, Pydantic validation for constraint models, high throughput for real-time endpoints | Free |
| Monitoring | Prometheus + Grafana | Latest | Datadog, New Relic, custom dashboards | Tracks solve times, queue depths, solution quality metrics, solver timeouts; self-hosted, no per-metric cost | Free (self-hosted) |
| Task Queue | Celery + Redis | 5.4+ / 7.2+ | RQ, Dramatiq, Huey | Handles long-running optimization jobs asynchronously; retry logic for solver timeouts; priority queues for urgent re-optimization | Free |
| LP Modeling (Python) | PuLP | 2.9+ | Pyomo 6.7, cvxpy 1.5, mip (Python-MIP) | Lightweight LP/MIP modeling; solver-agnostic (swap between GLOP, HiGHS, Gurobi without code changes); beginner-friendly syntax | Free |
| Multi-Objective | pymoo | 0.6+ | DEAP, Platypus, jMetalPy | Purpose-built for multi-objective optimization; NSGA-II/III, MOEA/D built-in; Pareto front visualization; active development | Free |

---

### 3. Pipeline Architecture

#### 3a. Batch Optimization Pipeline (e.g., Nightly Route Planning)

```
                         BATCH OPTIMIZATION PIPELINE
                        (Nightly Route Planning Example)

  ┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐
  │  Data     │───>│  Preprocess  │───>│  Model       │───>│  Solve    │
  │  Ingest   │    │  & Validate  │    │  Formulate   │    │  (OR-Tools│
  │  (Orders, │    │  (Geocode,   │    │  (CVRPTW     │    │   Routing)│
  │  Fleet,   │    │   Distance   │    │   with       │    │           │
  │  Windows) │    │   Matrix)    │    │   Penalties)  │    │           │
  └──────────┘    └──────────────┘    └──────────────┘    └─────┬─────┘
                                                                │
  ┌──────────┐    ┌──────────────┐    ┌──────────────┐          │
  │  Archive  │<───│  Dispatch    │<───│  Post-Process│<─────────┘
  │  & Log    │    │  to Fleet    │    │  (Route Maps,│
  │  (MLflow) │    │  Management  │    │   ETA, KPI)  │
  └──────────┘    └──────────────┘    └──────────────┘
```

| Stage | Component | Technology | Time Budget | Output |
|-------|-----------|-----------|-------------|--------|
| 1. Data Ingest | Pull orders, fleet data, time windows from DB | PostgreSQL + SQLAlchemy | 2-5 min | Raw order/fleet DataFrames |
| 2. Preprocess | Geocode addresses, build distance/time matrix via OSRM | OSRM, pandas, numpy | 5-15 min | Distance matrix, validated constraints |
| 3. Model Formulate | Build CVRPTW model: vehicles, capacities, time windows, penalties | OR-Tools Routing API | <1 min | RoutingModel object |
| 4. Solve | Run solver with time limit, local search metaheuristic | OR-Tools (guided local search) | 5-30 min (configurable) | Solution assignment: vehicle -> ordered stops |
| 5. Post-Process | Extract routes, compute ETAs, generate map visualizations | folium, pandas | 1-2 min | Route JSON, KPI summary |
| 6. Dispatch | Push routes to fleet management system via API | REST API / webhook | <1 min | Confirmation |
| 7. Archive | Log solver config, objective value, solve time, solution hash | MLflow | <1 min | Experiment record |

**Trigger:** Cron job at 02:00 daily via Celery Beat. Typical total runtime: 15-50 minutes for 500-2000 orders.

---

#### 3b. Real-time Optimization Pipeline (e.g., Dynamic Dispatch)

```
                      REAL-TIME OPTIMIZATION PIPELINE
                       (Dynamic Dispatch Example)

  ┌──────────┐    ┌──────────┐    ┌───────────┐    ┌───────────┐
  │  Event    │───>│  Queue   │───>│  Solve    │───>│  Execute  │
  │  Stream   │    │  + Batch │    │  (Warm    │    │  & Notify  │
  │  (New     │    │  (100ms  │    │   Start,  │    │  (Push to  │
  │  Order /  │    │   window)│    │   Time    │    │   Driver)  │
  │  Cancel)  │    │          │    │   Limit)  │    │           │
  └──────────┘    └──────────┘    └───────────┘    └─────┬─────┘
                                                         │
                  ┌──────────┐    ┌───────────┐          │
                  │  Monitor │<───│  Update   │<─────────┘
                  │  (Prom + │    │  State    │
                  │  Grafana)│    │  (Redis)  │
                  └──────────┘    └───────────┘
```

| Stage | Component | Technology | Time Budget | Output |
|-------|-----------|-----------|-------------|--------|
| 1. Event Stream | Receive new orders, cancellations, driver status updates | Redis Streams / Kafka | Real-time | Event objects |
| 2. Queue + Batch | Collect events within a micro-batch window (100-500ms) | Custom Python aggregator | 100-500ms | Batch of pending changes |
| 3. Solve | Re-optimize affected routes using warm start from current solution | OR-Tools with solution hints | 1-5 sec (hard limit) | Updated route assignments |
| 4. Execute & Notify | Push updated instructions to affected drivers | WebSocket / FCM push | <500ms | Driver notifications |
| 5. Update State | Store current solution state for next warm start | Redis (in-memory) | <100ms | Solution snapshot |
| 6. Monitor | Track solve times, solution quality delta, timeout rate | Prometheus + Grafana | Continuous | Dashboards, alerts |

**Key design decisions:** Warm-starting from the previous solution is critical for sub-5-second response. The solver time limit is a hard kill: if OR-Tools has not found an improved solution within the budget, the current best (or previous solution) is returned. Micro-batching prevents per-event re-optimization overhead.

---

#### 3c. Predict-then-Optimize Pipeline

```
                    PREDICT-THEN-OPTIMIZE PIPELINE
             (e.g., Inventory Optimization with Demand Forecast)

  ┌───────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐
  │  Historical│───>│  Forecast    │───>│  Parameter   │───>│  Model    │
  │  Data      │    │  (B01 Model) │    │  Estimation  │    │  Formula- │
  │  (Sales,   │    │  (Prophet,   │    │  (Demand mu, │    │  tion     │
  │  Inventory,│    │   LightGBM)  │    │   sigma,     │    │  (LP/MIP  │
  │  Lead Time)│    │              │    │   lead time)  │    │   + safety│
  └───────────┘    └──────────────┘    └──────────────┘    │   stock)  │
                                                            └─────┬─────┘
                                                                  │
  ┌───────────┐    ┌──────────────┐    ┌──────────────┐           │
  │  Track &   │<───│  Execute     │<───│  Solve       │<──────────┘
  │  Evaluate  │    │  (Place      │    │  (PuLP +     │
  │  (MLflow,  │    │   Purchase   │    │   HiGHS /    │
  │  Actual vs │    │   Orders)    │    │   OR-Tools)  │
  │  Predicted)│    └──────────────┘    └──────────────┘
  └───────────┘
```

| Stage | Component | Technology | Notes |
|-------|-----------|-----------|-------|
| 1. Historical Data | Extract sales history, inventory levels, supplier lead times | PostgreSQL, pandas | Minimum 2 years of history recommended |
| 2. Forecast | Generate demand forecasts with prediction intervals | Prophet / LightGBM (B01 module) | Output: point forecast + confidence intervals per SKU |
| 3. Parameter Estimation | Convert forecasts to optimization parameters (demand mean, variance, service level targets) | numpy, scipy.stats | Safety stock = z_alpha * sigma * sqrt(lead_time) |
| 4. Model Formulation | Build inventory optimization model: minimize holding + ordering cost subject to service level constraints | PuLP or Pyomo | Decision variables: order quantities, reorder points per SKU |
| 5. Solve | Solve LP/MIP to get optimal order plan | HiGHS (via PuLP) or OR-Tools GLOP | Typical solve time: <1 sec for 1000 SKUs |
| 6. Execute | Generate purchase orders, push to ERP | REST API to ERP system | Automated or human-approved |
| 7. Track & Evaluate | Compare predicted vs actual demand, measure stockout rate, holding cost | MLflow, custom dashboards | Feedback loop to improve forecasts |

**SPO+ integration note:** For advanced teams, replace standard forecast loss (MSE) with SPO+ loss that directly penalizes downstream decision regret. This requires differentiating through the optimization layer, achievable via cvxpylayers or differentiable LP solvers.

---

#### 3d. Multi-objective Optimization Pipeline

```
                  MULTI-OBJECTIVE OPTIMIZATION PIPELINE
            (e.g., Supply Chain: Cost vs Service Level vs Carbon)

  ┌───────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐
  │  Define    │───>│  Configure   │───>│  Generate    │───>│  Visualize│
  │  Objectives│    │  Algorithm   │    │  Pareto      │    │  Pareto   │
  │  (Cost,    │    │  (NSGA-II /  │    │  Front       │    │  Front    │
  │  Service,  │    │   NSGA-III   │    │  (Population │    │  (Plotly, │
  │  Carbon)   │    │   via pymoo) │    │   Evolution) │    │  Dash)    │
  └───────────┘    └──────────────┘    └──────────────┘    └─────┬─────┘
                                                                  │
  ┌───────────┐    ┌──────────────┐    ┌──────────────┐           │
  │  Archive & │<───│  Execute     │<───│  Decision    │<──────────┘
  │  Log       │    │  Selected    │    │  Maker       │
  │  (MLflow)  │    │  Solution    │    │  Selects     │
  └───────────┘    └──────────────┘    │  Solution    │
                                        └──────────────┘
```

| Stage | Component | Technology | Notes |
|-------|-----------|-----------|-------|
| 1. Define Objectives | Specify 2-4 conflicting objectives with evaluation functions | Python functions | Each objective: f_i(x) -> scalar |
| 2. Configure Algorithm | Select NSGA-II (2-3 objectives) or NSGA-III (4+ objectives), set population size, generations | pymoo | Pop size: 100-500; Generations: 200-1000 |
| 3. Generate Pareto Front | Run evolutionary algorithm to approximate Pareto-optimal set | pymoo + numpy | Runtime: minutes to hours depending on evaluation cost |
| 4. Visualize | Interactive Pareto front plot with hover details per solution | Plotly, Dash | 2D scatter, 3D scatter, or parallel coordinates for 4+ objectives |
| 5. Decision Maker Selects | Human or automated selection (e.g., knee point, weighted preference) | pymoo decision-making utilities | Knee point detection, TOPSIS, or manual pick |
| 6. Execute | Implement the selected solution | Downstream systems | One solution from the Pareto front |
| 7. Archive | Store full Pareto front and selection rationale | MLflow | Reproducibility and audit trail |

---

### 4. Key Code Patterns

#### 4a. Vehicle Routing with OR-Tools

```python
"""
CVRP with Time Windows using OR-Tools Routing Solver.
Solves: assign orders to vehicles, sequence stops,
respect capacity and time window constraints.
"""
from ortools.constraint_solver import routing_enums_pb2, pywrapcp
import numpy as np


def solve_cvrptw(
    distance_matrix: np.ndarray,
    time_matrix: np.ndarray,
    demands: list[int],
    time_windows: list[tuple[int, int]],
    vehicle_capacities: list[int],
    num_vehicles: int,
    depot: int = 0,
    max_solve_seconds: int = 300,
) -> dict:
    """Solve CVRPTW and return routes per vehicle."""
    n = len(distance_matrix)

    # Create routing index manager
    manager = pywrapcp.RoutingIndexManager(n, num_vehicles, depot)
    routing = pywrapcp.RoutingModel(manager)

    # Distance callback
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(distance_matrix[from_node][to_node])

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Capacity constraint
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return demands[from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # no slack
        vehicle_capacities,
        True,  # start cumul to zero
        "Capacity",
    )

    # Time window constraint
    def time_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(time_matrix[from_node][to_node])

    time_callback_index = routing.RegisterTransitCallback(time_callback)
    routing.AddDimension(
        time_callback_index,
        30,   # allow waiting time (slack) up to 30 min
        1440, # max cumulative time per vehicle (24h in minutes)
        False,
        "Time",
    )
    time_dimension = routing.GetDimensionOrDie("Time")

    for location_idx in range(n):
        index = manager.NodeToIndex(location_idx)
        tw_start, tw_end = time_windows[location_idx]
        time_dimension.CumulVar(index).SetRange(tw_start, tw_end)

    # Minimize start times for each vehicle (reduces total span)
    for vehicle_id in range(num_vehicles):
        index = routing.Start(vehicle_id)
        time_dimension.CumulVar(index).SetRange(
            time_windows[depot][0], time_windows[depot][1]
        )

    # Solver parameters
    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_params.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_params.time_limit.FromSeconds(max_solve_seconds)

    # Solve
    solution = routing.SolveWithParameters(search_params)
    if not solution:
        return {"status": "infeasible", "routes": []}

    # Extract routes
    routes = []
    total_distance = 0
    for vehicle_id in range(num_vehicles):
        route = []
        index = routing.Start(vehicle_id)
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            time_var = time_dimension.CumulVar(index)
            route.append({
                "node": node,
                "arrival_time": solution.Min(time_var),
            })
            index = solution.Value(routing.NextVar(index))
        if len(route) > 1:  # skip empty routes
            route_distance = solution.Value(
                routing.GetDimensionOrDie("Capacity").CumulVar(
                    routing.End(vehicle_id)
                )
            )
            routes.append({
                "vehicle": vehicle_id,
                "stops": route,
            })
        total_distance += solution.ObjectiveValue()

    return {
        "status": "optimal" if routing.status() == 1 else "feasible",
        "total_cost": solution.ObjectiveValue(),
        "routes": routes,
        "num_vehicles_used": len(routes),
    }
```

#### 4b. Production Scheduling with CP-SAT

```python
"""
Job Shop Scheduling with Google CP-SAT Solver.
Solves: assign operations to machines and sequence them
to minimize makespan (total completion time).
"""
from ortools.sat.python import cp_model
import collections


def solve_job_shop(
    jobs: list[list[tuple[int, int]]],  # jobs[j] = [(machine, duration), ...]
    max_solve_seconds: int = 120,
) -> dict:
    """
    Solve job-shop scheduling problem.

    Args:
        jobs: List of jobs, each job is a list of (machine_id, processing_time)
              tuples representing operations in order.
        max_solve_seconds: Solver time limit.

    Returns:
        Schedule dict with start times per operation and makespan.
    """
    model = cp_model.CpModel()

    num_machines = max(machine for job in jobs for machine, _ in job) + 1

    # Compute horizon (upper bound on makespan)
    horizon = sum(duration for job in jobs for _, duration in job)

    # Named tuple for cleaner code
    TaskType = collections.namedtuple("TaskType", "start end interval")

    all_tasks = {}       # (job_id, task_id) -> TaskType
    machine_intervals = collections.defaultdict(list)  # machine -> [intervals]

    for job_id, job in enumerate(jobs):
        for task_id, (machine, duration) in enumerate(job):
            suffix = f"_j{job_id}_t{task_id}"
            start_var = model.new_int_var(0, horizon, "start" + suffix)
            end_var = model.new_int_var(0, horizon, "end" + suffix)
            interval_var = model.new_interval_var(
                start_var, duration, end_var, "interval" + suffix
            )
            all_tasks[job_id, task_id] = TaskType(
                start=start_var, end=end_var, interval=interval_var
            )
            machine_intervals[machine].append(interval_var)

    # No overlap: each machine processes one operation at a time
    for machine in range(num_machines):
        model.add_no_overlap(machine_intervals[machine])

    # Precedence: operations within a job must be sequential
    for job_id, job in enumerate(jobs):
        for task_id in range(len(job) - 1):
            model.add(
                all_tasks[job_id, task_id + 1].start
                >= all_tasks[job_id, task_id].end
            )

    # Objective: minimize makespan
    makespan = model.new_int_var(0, horizon, "makespan")
    model.add_max_equality(
        makespan,
        [all_tasks[job_id, len(job) - 1].end for job_id, job in enumerate(jobs)],
    )
    model.minimize(makespan)

    # Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = max_solve_seconds
    solver.parameters.num_workers = 8  # parallel search
    status = solver.solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return {"status": "infeasible", "schedule": []}

    # Extract schedule
    schedule = []
    for job_id, job in enumerate(jobs):
        for task_id, (machine, duration) in enumerate(job):
            task = all_tasks[job_id, task_id]
            schedule.append({
                "job": job_id,
                "operation": task_id,
                "machine": machine,
                "start": solver.value(task.start),
                "end": solver.value(task.end),
                "duration": duration,
            })

    return {
        "status": "optimal" if status == cp_model.OPTIMAL else "feasible",
        "makespan": solver.value(makespan),
        "schedule": sorted(schedule, key=lambda x: (x["machine"], x["start"])),
        "solve_time_sec": solver.wall_time,
        "branches": solver.num_branches,
    }
```

#### 4c. Linear Programming with PuLP

```python
"""
Supply Chain Network Optimization with PuLP.
Minimize total transportation + fixed facility cost
subject to demand satisfaction and capacity constraints.
"""
import pulp
import pandas as pd


def solve_supply_chain_network(
    plants: list[str],
    warehouses: list[str],
    customers: list[str],
    plant_capacity: dict[str, float],
    warehouse_capacity: dict[str, float],
    customer_demand: dict[str, float],
    transport_cost_pw: dict[tuple[str, str], float],  # plant -> warehouse
    transport_cost_wc: dict[tuple[str, str], float],  # warehouse -> customer
    warehouse_fixed_cost: dict[str, float],
) -> dict:
    """
    Solve facility location + transportation network problem.

    Decision variables:
    - y[w]: binary, whether warehouse w is open
    - x_pw[p,w]: flow from plant p to warehouse w
    - x_wc[w,c]: flow from warehouse w to customer c
    """
    model = pulp.LpProblem("SupplyChainNetwork", pulp.LpMinimize)

    # Decision variables
    y = {w: pulp.LpVariable(f"open_{w}", cat="Binary") for w in warehouses}

    x_pw = {
        (p, w): pulp.LpVariable(f"flow_pw_{p}_{w}", lowBound=0)
        for p in plants for w in warehouses
    }
    x_wc = {
        (w, c): pulp.LpVariable(f"flow_wc_{w}_{c}", lowBound=0)
        for w in warehouses for c in customers
    }

    # Objective: minimize total cost
    model += (
        # Transportation cost: plant -> warehouse
        pulp.lpSum(transport_cost_pw[p, w] * x_pw[p, w]
                   for p in plants for w in warehouses)
        # Transportation cost: warehouse -> customer
        + pulp.lpSum(transport_cost_wc[w, c] * x_wc[w, c]
                     for w in warehouses for c in customers)
        # Fixed cost for opening warehouses
        + pulp.lpSum(warehouse_fixed_cost[w] * y[w] for w in warehouses)
    )

    # Constraint: satisfy all customer demand
    for c in customers:
        model += (
            pulp.lpSum(x_wc[w, c] for w in warehouses) == customer_demand[c],
            f"demand_{c}",
        )

    # Constraint: plant capacity
    for p in plants:
        model += (
            pulp.lpSum(x_pw[p, w] for w in warehouses) <= plant_capacity[p],
            f"plant_cap_{p}",
        )

    # Constraint: warehouse flow balance (inflow = outflow)
    for w in warehouses:
        model += (
            pulp.lpSum(x_pw[p, w] for p in plants)
            == pulp.lpSum(x_wc[w, c] for c in customers),
            f"balance_{w}",
        )

    # Constraint: warehouse capacity (only if open)
    for w in warehouses:
        model += (
            pulp.lpSum(x_wc[w, c] for c in customers)
            <= warehouse_capacity[w] * y[w],
            f"wh_cap_{w}",
        )

    # Solve
    solver = pulp.HiGHS_CMD(msg=0, timeLimit=120)
    model.solve(solver)

    if model.status != pulp.constants.LpStatusOptimal:
        return {"status": "infeasible"}

    # Extract results
    open_warehouses = [w for w in warehouses if y[w].varValue > 0.5]
    flows = []
    for p in plants:
        for w in warehouses:
            val = x_pw[p, w].varValue
            if val and val > 0.01:
                flows.append({"from": p, "to": w, "flow": val, "leg": "plant_wh"})
    for w in warehouses:
        for c in customers:
            val = x_wc[w, c].varValue
            if val and val > 0.01:
                flows.append({"from": w, "to": c, "flow": val, "leg": "wh_customer"})

    return {
        "status": "optimal",
        "total_cost": pulp.value(model.objective),
        "open_warehouses": open_warehouses,
        "flows": flows,
        "shadow_prices": {
            c: model.constraints[f"demand_{c}"].pi
            for c in customers
        },
    }
```

#### 4d. Metaheuristic with DEAP (Genetic Algorithm)

```python
"""
Multi-Objective Scheduling with DEAP Genetic Algorithm.
Optimizes two conflicting objectives: minimize makespan and minimize
total tardiness (late jobs penalty).
Uses NSGA-II for Pareto front approximation.
"""
import random
import numpy as np
from deap import base, creator, tools, algorithms


def solve_multiobjective_scheduling(
    num_jobs: int,
    num_machines: int,
    processing_times: np.ndarray,  # shape: (num_jobs, num_machines)
    due_dates: np.ndarray,         # shape: (num_jobs,)
    population_size: int = 200,
    num_generations: int = 500,
    crossover_prob: float = 0.8,
    mutation_prob: float = 0.2,
    seed: int = 42,
) -> dict:
    """
    Solve bi-objective flow-shop scheduling using NSGA-II.

    Individual representation: permutation of job indices.
    Objectives: (1) minimize makespan, (2) minimize total tardiness.
    """
    random.seed(seed)
    np.random.seed(seed)

    # DEAP setup: minimize both objectives
    creator.create("FitnessMulti", base.Fitness, weights=(-1.0, -1.0))
    creator.create("Individual", list, fitness=creator.FitnessMulti)

    def evaluate(individual):
        """Evaluate a permutation schedule."""
        perm = individual
        # Compute completion times for flow-shop
        completion = np.zeros((num_jobs, num_machines))

        # First job on first machine
        completion[0][0] = processing_times[perm[0]][0]
        # First job on remaining machines
        for m in range(1, num_machines):
            completion[0][m] = completion[0][m-1] + processing_times[perm[0]][m]
        # Remaining jobs
        for j_idx in range(1, num_jobs):
            j = perm[j_idx]
            completion[j_idx][0] = completion[j_idx-1][0] + processing_times[j][0]
            for m in range(1, num_machines):
                completion[j_idx][m] = (
                    max(completion[j_idx-1][m], completion[j_idx][m-1])
                    + processing_times[j][m]
                )

        makespan = completion[-1][-1]

        # Total tardiness
        total_tardiness = 0.0
        for j_idx in range(num_jobs):
            j = perm[j_idx]
            finish = completion[j_idx][-1]
            tardiness = max(0, finish - due_dates[j])
            total_tardiness += tardiness

        return makespan, total_tardiness

    toolbox = base.Toolbox()
    toolbox.register(
        "indices", random.sample, range(num_jobs), num_jobs
    )
    toolbox.register(
        "individual", tools.initIterate, creator.Individual, toolbox.indices
    )
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)
    toolbox.register("evaluate", evaluate)
    toolbox.register("mate", tools.cxPartialyMatched)
    toolbox.register("mutate", tools.mutShuffleIndexes, indpb=0.05)
    toolbox.register("select", tools.selNSGA2)

    # Run NSGA-II
    pop = toolbox.population(n=population_size)

    # Evaluate initial population
    fitnesses = map(toolbox.evaluate, pop)
    for ind, fit in zip(pop, fitnesses):
        ind.fitness.values = fit

    for gen in range(num_generations):
        offspring = algorithms.varAnd(pop, toolbox, crossover_prob, mutation_prob)

        # Evaluate offspring
        invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
        fitnesses = map(toolbox.evaluate, invalid_ind)
        for ind, fit in zip(invalid_ind, fitnesses):
            ind.fitness.values = fit

        pop = toolbox.select(pop + offspring, population_size)

    # Extract Pareto front
    pareto_front = tools.sortNondominated(pop, len(pop), first_front_only=True)[0]

    results = []
    for ind in pareto_front:
        results.append({
            "permutation": list(ind),
            "makespan": ind.fitness.values[0],
            "total_tardiness": ind.fitness.values[1],
        })

    results.sort(key=lambda x: x["makespan"])

    # Cleanup DEAP creators to allow re-runs
    if hasattr(creator, "FitnessMulti"):
        del creator.FitnessMulti
    if hasattr(creator, "Individual"):
        del creator.Individual

    return {
        "pareto_front_size": len(results),
        "solutions": results,
        "best_makespan": min(r["makespan"] for r in results),
        "best_tardiness": min(r["total_tardiness"] for r in results),
    }
```

---

### 5. Production Considerations

| Aspect | Requirement | Approach | Cost |
|--------|------------|---------|------|
| Solver Time Limits | Every solve call must have a hard time limit to prevent runaway computation | Set `time_limit` on all solvers; OR-Tools `search_params.time_limit`, CP-SAT `max_time_in_seconds`, PuLP `timeLimit`; return best feasible solution on timeout | Zero (configuration) |
| Solution Quality Guarantees | Report optimality gap so users know how close to optimal the solution is | Extract MIP gap from solver (`model.MIPGap` in Gurobi, `solver.best_objective_bound` in CP-SAT); log gap with every solution | Zero (logging) |
| Warm Starts | Re-optimization should start from previous solution, not from scratch | Use OR-Tools solution hints (`routing.AddSolutionHint`), CP-SAT solution hints (`model.AddHint`), Gurobi `Start` attribute | Zero (API usage) |
| Constraint Management | Business rules change frequently; constraints must be versionable and auditable | Store constraints as JSON/YAML config separate from solver code; version in Git; validate constraints before solving | Low (~$200/mo for config management tooling) |
| Audit Trail | Every optimization decision must be traceable: inputs, model, solution, rationale | Log to MLflow: input data hash, model formulation hash, solver config, objective value, solve time, solution hash | Low (~$100/mo MLflow hosting) |
| Infeasibility Handling | When constraints conflict, the system must explain why, not just return "infeasible" | Use IIS (Irreducible Infeasible Subsystem) computation: Gurobi `computeIIS()`, or iterative constraint relaxation for OR-Tools | Zero (solver feature) |
| Concurrency | Multiple optimization requests must not interfere with each other | Celery workers with isolated solver instances; each task gets its own model object; no shared mutable state | Low (Celery + Redis: ~$50/mo) |
| Input Validation | Malformed inputs (negative distances, overlapping time windows) must be caught before solve | Pydantic models for all API inputs; pre-solve validation layer checks constraint consistency | Zero (code) |
| Rollback | If an optimization result causes operational issues, revert to previous plan | Store last N solutions in Redis/DB; API endpoint to activate previous solution | Low (storage) |

---

### 6. Solver Comparison

| Solver | Type | Scale (Practical) | License | Speed (Relative) | Best For |
|--------|------|-------------------|---------|------------------|----------|
| **Gurobi 12.0** | LP/MIP/QP/MIQP | Millions of vars | Commercial ($12k+/yr server, free academic) | 1x (baseline, fastest) | Large MIP at scale; when optimality gap matters; enterprise with budget |
| **CPLEX 23.1** | LP/MIP/QP/CP | Millions of vars | Commercial ($10k+/yr, free academic) | 1.1-1.3x slower than Gurobi | IBM ecosystem shops; combined MIP+CP; existing IBM contracts |
| **SCIP 9.0** | MIP/MINLP | 100k+ vars | Apache 2.0 (free) | 3-5x slower than Gurobi | Research; custom branching/cutting; MINLP; extensibility needed |
| **HiGHS 2.0** | LP/MIP | Millions (LP), 100k+ (MIP) | MIT (free) | LP: matches Gurobi; MIP: 2-4x slower | LP-heavy workloads; free alternative; embedded systems |
| **OR-Tools CP-SAT** | CP/SAT/MIP-like | 10k+ vars | Apache 2.0 (free) | Excellent for scheduling | Scheduling, routing, assignment; constraint-heavy problems |
| **OR-Tools GLOP** | LP | Millions of vars | Apache 2.0 (free) | Competitive LP | LP subproblems; within OR-Tools ecosystem |
| **OR-Tools Routing** | VRP specialized | 1000+ stops | Apache 2.0 (free) | Fast with metaheuristics | CVRP, VRPTW, PDPTW; logistics routing |
| **OptaPlanner** | Constraint solver (JVM) | 10k+ entities | Apache 2.0 (free) | Moderate | Java/Kotlin shops; nurse scheduling; employee rostering |
| **DEAP** | Metaheuristic framework | Flexible | LGPL-3.0 (free) | Problem-dependent | Custom evolutionary algorithms; multi-objective; black-box optimization |
| **pymoo** | Multi-objective framework | Flexible | Apache 2.0 (free) | Problem-dependent | NSGA-II/III, MOEA/D; Pareto front generation; research and production |
| **scipy.optimize** | NLP/LP (small) | Small-medium (<10k vars) | BSD (free) | Fast for small problems | Quick prototyping; continuous optimization; curve fitting |

---

### 7. Effort Estimation

| Use Case | Duration | Team | Solver Cost | Notes |
|----------|----------|------|-------------|-------|
| Basic Routing MVP (CVRP, <200 stops) | 3-4 weeks | 1 backend dev + 1 OR engineer | $0 (OR-Tools) | Includes API, basic UI, distance matrix via OSRM; no time windows |
| Production Scheduling (job shop, <100 jobs) | 4-6 weeks | 1 OR engineer + 1 backend dev | $0 (CP-SAT) | Includes Gantt chart visualization, constraint config, API |
| Supply Chain Network Optimization | 6-8 weeks | 1 OR engineer + 1 data engineer + 1 backend dev | $0-$12k/yr (HiGHS free, Gurobi if >50k vars) | Includes data pipeline, scenario analysis, dashboard |
| Real-time Dynamic Dispatch | 8-12 weeks | 2 backend devs + 1 OR engineer + 1 DevOps | $0 (OR-Tools) | Complex: warm starts, event streaming, sub-5s SLA, monitoring |
| Multi-Objective Portfolio (Pareto dashboard) | 3-4 weeks | 1 OR engineer + 1 frontend dev | $0 (pymoo) | Interactive Pareto visualization, preference elicitation |
| Full Optimization Platform (all above) | 4-6 months | 2 OR engineers + 2 backend devs + 1 DevOps + 1 frontend | $0-$24k/yr solver licenses | Phased rollout: routing first, then scheduling, then supply chain |

---

### 8. Recommended Starter Stacks for Vietnamese Teams

**Minimal Stack (Free, No License Required)**
- Solver: OR-Tools (routing + CP-SAT + GLOP)
- Modeling: PuLP with HiGHS backend
- API: Flask or FastAPI (single endpoint)
- Deployment: Single server, synchronous solves
- Best for: Startups, proof-of-concept, <500 orders/day
- Total cost: $0 software + $20-50/mo server (VPS)

**Mid-tier Stack (Production-Ready)**
- Solver: OR-Tools + PuLP/HiGHS
- API: FastAPI with async support
- Task queue: Celery + Redis for long-running jobs
- Monitoring: Prometheus + Grafana
- Experiment tracking: MLflow (self-hosted)
- Constraint management: YAML config files, Git-versioned
- Distance matrix: Self-hosted OSRM with Vietnam road network
- Best for: Logistics companies, 500-5000 orders/day
- Total cost: $0 software + $200-500/mo infrastructure

**Enterprise Stack (Maximum Performance)**
- Solver: Gurobi 12 (academic license free for VN universities; commercial $12k+/yr)
- Modeling: Pyomo or gurobipy for advanced features (callbacks, lazy constraints)
- API: FastAPI + gRPC for internal microservices
- Real-time: Kafka/Redis Streams for event-driven re-optimization
- Monitoring: Prometheus + Grafana + PagerDuty alerts
- Dashboard: Plotly Dash or Streamlit for operations team
- Experiment tracking: MLflow + custom solver analytics
- Constraint management: Database-backed rule engine with UI
- Best for: Large logistics/manufacturing, 5000+ orders/day, tight optimality requirements
- Total cost: $12k-24k/yr solver + $500-2000/mo infrastructure

---

### 9. Known Limitations & Workarounds

**Solver Time Limits and Solution Quality**
Problem: Hard time limits may return poor solutions if the solver has not converged. MIP solvers may report large optimality gaps (e.g., 20%) if cut off early.
Workaround: Set a two-tier time limit: a "soft" limit where you check if the gap is acceptable (<5%), and a "hard" limit that forces termination. Use warm starts to give the solver a good starting point, dramatically reducing time to a quality solution.

**Model Size Limits**
Problem: Large VRP instances (>5000 stops) or network optimization models with millions of binary variables can exhaust memory or solve prohibitively slowly.
Workaround: Decompose spatially using clustering (k-means on geo-coordinates to create sub-regions), solve sub-problems independently, then stitch together. Column generation for very large instances. For OR-Tools routing, use the built-in `RoutingModel` which handles decomposition internally.

**Numerical Precision**
Problem: LP/MIP solvers use floating-point arithmetic. Constraints with very large and very small coefficients simultaneously (e.g., $0.001 cost alongside 1,000,000 capacity) cause numerical instability, leading to incorrect "optimal" solutions or false infeasibility.
Workaround: Scale all coefficients to a similar magnitude (e.g., use thousands of dollars instead of dollars, tons instead of kilograms). Check solver numerical warnings. Set `NumericFocus` parameter in Gurobi. Use integer variables with appropriate scaling where possible.

**Constraint Debugging**
Problem: When a model is infeasible, finding which constraints conflict is difficult, especially with hundreds of constraints.
Workaround: Use IIS (Irreducible Infeasible Subsystem) in Gurobi/CPLEX. For OR-Tools, implement iterative constraint relaxation: remove constraints one at a time and re-solve to identify the conflict. Build a constraint validation layer that checks logical consistency before solving (e.g., total demand vs total capacity).

**Metaheuristic Reproducibility**
Problem: GA, SA, PSO results vary across runs due to stochastic components. This makes debugging and testing difficult, and operations teams distrust non-deterministic results.
Workaround: Always set random seeds (`random.seed()`, `np.random.seed()`). Log the seed with every run for reproducibility. Run multiple seeds and report statistics (mean, std, best). For production, use the best solution across K runs (e.g., K=5) with different seeds.

**OR-Tools Routing Limitations**
Problem: OR-Tools routing solver does not support all VRP variants natively (e.g., split deliveries, heterogeneous fleet with complex compatibility constraints).
Workaround: Use dimension callbacks creatively to encode custom constraints. For split deliveries, reformulate as multiple copies of each order. For very complex VRP variants, consider modeling directly in CP-SAT rather than the routing library.

**License Management**
Problem: Gurobi and CPLEX licenses are tied to specific machines or containers. Kubernetes scaling and serverless deployment are complicated by license servers.
Workaround: Use Gurobi's token server or cloud license for container deployments. Alternatively, architect so that solver calls go to a fixed pool of licensed solver servers, with the API layer scaling independently.

---

### 10. Vietnam-Specific Considerations

**Vietnamese Address Geocoding for Routing**
Vietnamese addresses are notoriously unstructured: "123 Nguyen Hue, Q1, TP.HCM" may appear in dozens of variant formats. Geocoding accuracy directly impacts routing quality. Recommended approach: use a combination of Google Maps Geocoding API (best accuracy for Vietnam, ~$5 per 1000 requests) and fallback to Nominatim/OpenStreetMap (free but lower accuracy). For high-volume operations, build a local geocoding cache in PostgreSQL with PostGIS. Consider Vietnam-specific geocoding services like Vietmap or Coc Coc Maps API for better local coverage. Always validate geocoded coordinates against expected district/province boundaries.

**Motorbike VRP Constraints**
Vietnam's logistics are dominated by motorbike delivery, not truck delivery. This changes VRP modeling fundamentally: (1) capacity is tiny (5-20 kg per trip vs hundreds of kg for trucks), meaning more routes with fewer stops; (2) speed varies dramatically by time of day due to motorbike traffic patterns (rush hour in HCMC/Hanoi reduces speed by 50-70%); (3) one-way streets and alley access create asymmetric distance matrices; (4) weather sensitivity is high (rain reduces speed and increases risk). Model these by using time-dependent travel time matrices (different matrices for different time-of-day buckets), very low vehicle capacities, and penalty terms for rain-period deliveries. OSRM with the motorbike profile on Vietnam OSM data provides reasonable time estimates.

**Gurobi Academic Licenses for Vietnamese Universities**
Gurobi offers free academic licenses for university-affiliated researchers and students. Vietnamese universities including VNU (Vietnam National University), HUST (Hanoi University of Science and Technology), and HCMUT (Ho Chi Minh City University of Technology) are eligible. The academic license supports full Gurobi functionality with no size limits, valid for 12 months and renewable. This is a significant advantage for university-industry collaboration: student interns can prototype with Gurobi, and the transition to a commercial license happens only when deploying to production. Apply at gurobi.com/academia with a valid .edu.vn email.

**OR-Tools as the Default Free Alternative**
For most Vietnamese companies, especially startups and SMEs, OR-Tools is the recommended default solver. It is completely free with no licensing restrictions, supports all major optimization paradigms (LP, CP, routing, assignment), and has active development by Google. The Python API is well-documented with extensive examples. Performance is sufficient for the vast majority of Vietnamese logistics and manufacturing use cases (up to ~2000 stops for routing, up to ~500 jobs for scheduling). The only scenario where upgrading to Gurobi is justified is when solving large MIP instances (>50,000 variables) where the 3-5x speed difference matters for business SLAs.

**Local Infrastructure and Latency**
Vietnamese cloud infrastructure has improved significantly with AWS (Singapore region), GCP (Singapore), and local providers (Viettel IDC, FPT Cloud, VNPT). For real-time optimization (dynamic dispatch), latency to the solver server matters. Deploying solver services on Vietnam-based or Singapore-based servers keeps round-trip latency under 50ms. For batch optimization, region matters less since jobs run asynchronously. FPT Cloud and Viettel IDC offer competitive pricing for compute-heavy workloads and avoid international data transfer concerns for sensitive logistics data.

**Vietnamese Holiday and Working Pattern Constraints**
Scheduling and routing optimization must account for Vietnam-specific calendar patterns: Tet holiday (1-2 week shutdown), numerous public holidays, and the 6-day working week common in manufacturing. Encode these as hard constraints (no scheduling during Tet) or soft constraints with high penalties. Saturday half-day operations and Sunday closures vary by industry and must be configurable per client.

---

*Report compiled by Dr. Praxis (R-B) for MAESTRO Knowledge Graph Platform, Phase 1, Module B06.*
*Word count: ~3,800 words.*
