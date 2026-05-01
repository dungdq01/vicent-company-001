# Backend Engineering Notes: B06 Optimization
## By R-BE — Date: 2026-03-31

### 1. Optimization API Design

The core endpoint for optimization is `POST /api/v1/optimize`, which accepts a structured problem definition containing an objective function, decision variables, and constraints. The request body follows a standardized schema where the caller specifies the problem type (LP, MIP, VRPTW, scheduling, etc.), the data payload, and optional solver preferences. For small problems that solve in under a few seconds, the API returns the solution synchronously in the response body. For larger problems, the API immediately returns a `202 Accepted` with a job ID, and the client can either poll `GET /api/v1/optimize/{job_id}` for status and results, or register a webhook URL in the original request to receive a callback when the solution is ready. This dual-mode approach keeps the API simple for trivial problems while properly handling solvers that may run for minutes or hours. Rate limiting is applied per tenant, and request validation rejects malformed problem definitions before they ever reach the solver queue.

### 2. Solver Integration Patterns

The backend abstracts solver access behind a unified `SolverInterface` that exposes `build_model()`, `solve()`, and `get_solution()` methods. Concrete implementations wrap Google OR-Tools (free, good for routing and scheduling), Gurobi (commercial, best-in-class MIP performance), PuLP (lightweight Python modeling layer that delegates to CBC, GLPK, or Gurobi), and a custom metaheuristic server for problems where exact solvers are too slow. The solver selection is driven by problem type and tenant tier: free-tier tenants get OR-Tools and HiGHS, while premium tenants can access Gurobi. The abstraction also handles solver-specific parameter translation, so a generic `time_limit_seconds` parameter maps to `GRB.Param.TimeLimit` for Gurobi or `solver.parameters.max_time_in_seconds` for OR-Tools CP-SAT. Model files can be exported in MPS or LP format for debugging and reproducibility.

### 3. Async Solver Architecture

Long-running optimization jobs follow a standard async pipeline. The API server validates the request and publishes a message to a Celery task queue backed by Redis. A pool of solver worker processes picks up jobs, constructs the mathematical model, invokes the solver, and writes the result to PostgreSQL (solution values, objective, solve time, optimality gap). Once stored, the worker publishes a notification event. A lightweight notification service consumes these events and either fires the webhook callback or updates a server-sent events (SSE) stream for connected dashboards. Jobs support cancellation via `DELETE /api/v1/optimize/{job_id}`, which sends a SIGTERM to the solver process. A global timeout (configurable per tier, default 300 seconds) kills runaway solvers. Failed or timed-out jobs are moved to a dead-letter queue for inspection and optional retry with relaxed parameters.

### 4. Solution Caching & Warm Starts

Many optimization problems in production are near-duplicates: a logistics company re-optimizes routes daily with minor changes to order sets. The backend computes a content hash of the problem definition (excluding metadata) and checks a Redis cache before dispatching to a solver. Exact cache hits return the stored solution instantly. For near-miss inputs, the system retrieves the closest cached solution and provides it as a warm start to the MIP solver, which can dramatically reduce solve time by giving the solver a feasible starting point. Warm starts are especially effective for Gurobi and CPLEX, which accept MIP start vectors. For metaheuristic solvers, the cached solution seeds the initial population. The cache uses an LRU eviction policy with a configurable TTL (default 24 hours) and a maximum memory budget per tenant.

### 5. Multi-tenant Solver Service

Tenant isolation is critical when multiple organizations share solver infrastructure. Each tenant is assigned a priority level (low, standard, high) that maps to separate Celery queues. High-priority tenants get dedicated solver workers with guaranteed capacity, while low-priority jobs run on shared workers and may be preempted. Resource limits are enforced per tenant: maximum concurrent jobs, maximum solve time per job, and maximum total solver-seconds per billing period. A usage metering service tracks solver CPU-seconds consumed by each tenant and feeds into the billing system. Solver licenses (especially Gurobi) are pooled and allocated on demand, with a license manager that blocks job dispatch if no license tokens are available rather than letting the solver fail at startup.

### 6. Real-time vs Batch Optimization API

Batch optimization handles large-scale problems on a schedule. A logistics company submits all next-day delivery orders at 8 PM, and the solver produces optimized routes by midnight. The batch API accepts bulk problem submissions, parallelizes across multiple workers, and aggregates results. Real-time optimization handles dynamic events: a new order arrives mid-day, a vehicle breaks down, traffic conditions change. The real-time endpoint `POST /api/v1/optimize/incremental` accepts a delta (new constraints or modified parameters) against a base solution and returns an updated solution within seconds. This is implemented by fixing most decision variables at their current values and only re-optimizing the affected subset. A hybrid approach runs batch optimization nightly and maintains a "live" model that absorbs incremental changes throughout the day, with periodic full re-optimization every few hours to prevent solution quality drift.

### 7. Error Handling for Optimization

Optimization problems can fail in ways unique to mathematical programming. The API must detect and communicate infeasibility (no solution satisfies all constraints), unboundedness (objective can improve infinitely, indicating a modeling error), and solver numerical issues. When a problem is infeasible, the backend runs an Irreducible Infeasible Subsystem (IIS) analysis to identify the minimal set of conflicting constraints and returns them to the caller with human-readable explanations. When a solver times out without finding the optimal solution, the API returns the best feasible solution found so far along with the optimality gap. The system can also suggest constraint relaxations ranked by business impact: for example, relaxing a delivery time window by 15 minutes might make an otherwise infeasible routing problem solvable. All solver errors are logged with the full model dump for offline debugging.

### 8. Production Architecture Diagram

```
Client App / Dashboard
        |
        v
   API Gateway (rate limiting, auth)
        |
        v
   Optimization API (FastAPI)
        |
        +---> Sync path (small problems, <5s)
        |         |
        |         v
        |     In-process Solver
        |         |
        |         v
        |     Return solution
        |
        +---> Async path (large problems)
                  |
                  v
            Redis Task Queue
                  |
                  v
         Solver Worker Pool (Celery)
         [OR-Tools | Gurobi | Custom]
                  |
                  v
            PostgreSQL (results)
                  |
                  v
         Notification Service
            |            |
            v            v
        Webhook      SSE Stream
        Callback     (Dashboard)
```

This architecture handles both quick feasibility checks and multi-hour MIP solves, scaling horizontally by adding solver workers and vertically by assigning high-memory VMs to large model instances.
