# Research Report: B06 x I06 — Supply Chain Allocation & Planning Optimization
**Matrix Node:** B06 (Optimization & OR) x I06 (Logistics & Supply Chain)  
**Date:** 2026-04-09  
**Status:** Draft (depthLevel 2)  
**Source:** PRJ-SCP-001 learnings, generalized for reuse  
**Prerequisite Knowledge:** B06 (constraint satisfaction, OR-Tools), I06 (Vietnam logistics, ERP landscape)

---

## 1. Multi-Constraint Allocation Engine

### 1.1 Problem Statement

In supply chain planning, allocation is the process of assigning available inventory (supply) to demand lines while respecting multiple business constraints simultaneously. Unlike pure mathematical optimization (where a single objective is maximized), real-world allocation follows a **sequential constraint filtering** pattern — each layer eliminates invalid options before the next layer evaluates.

This pattern appears in: warehouse allocation, order fulfillment, distribution resource planning (DRP), available-to-promise (ATP), and capable-to-promise (CTP) systems.

### 1.2 Sequential Layer Stack Architecture

The recommended architecture is a **6-layer sequential constraint stack**. Each layer receives a candidate set of (demand-line, supply-lot) pairs and filters/ranks them before passing to the next layer.

```
Input: Demand Lines + Supply Lots (pre-loaded)
  │
  ▼
┌─────────────────────────────────────────────┐
│ Layer 1: SOURCE SELECTION (RTM Routing)     │
│  - Route-to-Market rules define which       │
│    source locations serve which customers   │
│  - Multi-priority: try Priority 1 first,    │
│    cascade to P2..Pn if insufficient stock  │
│  - Output: candidate (demand, source) pairs │
└─────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────┐
│ Layer 2: QUALITY / SPECS CONSTRAINT         │
│  - Match lot spec_id to demand spec_id      │
│  - Variant matching (grade, packaging, etc) │
│  - Filter out quarantined / held stock      │
│  - Output: quality-valid pairs only         │
└─────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────┐
│ Layer 3: SHELF-LIFE (FEFO / LEFO)           │
│  - First-Expiry-First-Out or                │
│    Least-Expiry-First-Out                   │
│  - Transit time adjustment: remaining life  │
│    at destination = expiry - now - transit   │
│  - Minimum remaining shelf-life % check     │
│  - Output: lots sorted by expiry preference │
└─────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────┐
│ Layer 4: QUANTITY + ABC PRIORITY             │
│  - Fair-share weighted allocation when       │
│    supply < total demand                     │
│  - ABC class weighting: A items get higher   │
│    fill-rate priority                        │
│  - Rounding rules for case/pallet quantities │
│  - Output: allocated quantities per pair     │
└─────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────┐
│ Layer 5: SAFETY STOCK GUARD                  │
│  - Check post-allocation inventory >= SS     │
│  - 4 common SS methods: Statistical (z*σ),  │
│    Days-of-Supply, Capacity-Cap, Dynamic     │
│  - If breached: reduce allocation or flag    │
│    exception for planner review              │
│  - Output: SS-safe allocations              │
└─────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────┐
│ Layer 6: LATERAL TRANSFER (LCNB)             │
│  - Location Cross-Network Balancing          │
│  - State machine: OFF / DETECT_ONLY /        │
│    EXECUTE                                   │
│  - DETECT_ONLY: flag surplus/deficit but     │
│    no auto-transfer (common Phase 1 setting) │
│  - EXECUTE: generate inter-location transfer │
│    orders to rebalance network               │
│  - Output: final allocation + transfer recs  │
└─────────────────────────────────────────────┘
  │
  ▼
Output: AllocationResult[] + Exception[] + TransferRecommendation[]
```

### 1.3 Why Sequential, Not Concurrent Optimization

| Approach | Pros | Cons | When to Use |
|---|---|---|---|
| **Sequential filtering** | Deterministic, auditable, each layer has clear business owner, easy to debug | May miss globally optimal solution | Most B2B SCP systems; when planners need to understand and override decisions |
| **Single MIP formulation** | Mathematically optimal | Black-box to planners, hard to debug infeasible solutions, constraint explosion for 10K+ demand lines | Academic settings, small-scale problems, or as a Phase 2 enhancement after sequential baseline |

**Recommendation:** Start with sequential filtering for production systems. Layer-by-layer trace is critical for planner trust and regulatory audit.

### 1.4 Layer Design Principles

1. **Each layer is a pure function:** input candidate set, output filtered/ranked candidate set
2. **Each layer has a saga compensation:** if downstream layer fails, upstream layers reverse in LIFO order
3. **Each layer logs its filter statistics:** input count, output count, filtered count, reason codes
4. **Layer order matters:** RTM first (largest filter), then quality, then shelf-life (ordering), then quantity (splitting), then SS guard (constraint), then transfer (augmentation)

---

## 2. Concurrency Control Patterns for Allocation

### 2.1 Problem

Multiple allocation runs or real-time reservations can conflict on the same inventory lots. Without concurrency control, over-allocation or double-booking occurs.

### 2.2 Pattern: Optimistic Locking + Reservation TTL + Saga

**Optimistic Locking (per lot):**
```
LotAttribute.version: integer, incremented on every write
UPDATE lot_attribute 
  SET on_hand_qty = on_hand_qty - :alloc_qty, version = version + 1
  WHERE lot_id = :lot_id AND version = :expected_version;
-- If rows_affected = 0 → conflict detected → retry or escalate
```

**Reservation Token with TTL:**
```
- When allocation engine selects a lot, it sets:
    reserved_qty += alloc_qty
    reserved_until = NOW() + TTL (default 5 minutes)
- Background job sweeps expired reservations every 60 seconds
- Allocatable = on_hand_qty - reserved_qty - quarantine_qty
```

**TTL tuning guidance:**
| Context | Recommended TTL | Rationale |
|---|---|---|
| Single-line real-time allocation | 2-3 minutes | Fast approval cycle |
| Batch daily allocation run | 10-15 minutes | Run completes within this window |
| Manual planner review | 30 minutes | Human decision time |

**Saga Compensation:**
```
If Layer 4 (quantity) fails after Layer 3 (FEFO) already reserved lots:
  1. Layer 3 compensation: release FEFO reservation (decrement reserved_qty)
  2. Layer 2 compensation: no state to undo (filter only)
  3. Layer 1 compensation: no state to undo (filter only)
  4. Mark demand line as UNALLOCATED with reason code
```

### 2.3 Exclusive Batch Lock

For daily batch allocation runs that process 10K+ demand lines:
- Acquire a distributed lock (Redis `SET NX` or PostgreSQL advisory lock) before batch starts
- Block all single-line allocations during batch window
- Release lock on completion or timeout (max 30 minutes)
- If lock acquisition fails: queue the request for post-batch processing

---

## 3. Performance Patterns

### 3.1 Target: <5 Minutes for 10K Demand Lines

This target is achievable with the following strategies:

### 3.2 Prefetch Strategy

Load all reference data into memory before allocation loop begins:

| Data | Size (typical) | Load Time | Cache Location |
|---|---|---|---|
| RTM rules (per tenant) | 50K-150K rules | 2-5 seconds | In-process dictionary |
| Lot attributes (per tenant) | 25K-75K lots | 3-8 seconds | In-process dictionary |
| Item classifications | 5K-25K items | <1 second | In-process dictionary |
| Safety stock targets | 5K-25K item-locations | <1 second | In-process dictionary |

**Total prefetch: 10-15 seconds.** Eliminates per-demand-line database queries.

### 3.3 Redis Cache for RTM Lookups

```
Key pattern: rtm:{tenant_id}:{customer_id}:{item_id}
Value: sorted list of (priority, source_location_id, constraints)
TTL: 24 hours (invalidated on RTM rule change)
Lookup time: <10ms
```

RTM rules change infrequently (monthly), so cache hit rate is >99%.

### 3.4 Batch vs Single-Line Trade-offs

| Mode | Throughput | Latency | Use Case |
|---|---|---|---|
| **Batch** (all demand lines at once) | 10K lines in 3-5 min | High (minutes) | Daily planning cycle, overnight replenishment |
| **Single-line** (one demand at a time) | 1 line in 50-200ms | Low (sub-second) | Real-time order promising (ATP), manual adjustment |
| **Mini-batch** (group by item or location) | 100-500 lines in 5-15s | Medium | Near-real-time with grouping benefits (shared prefetch) |

**Recommendation:** Implement batch mode first for daily planning. Add single-line mode for ATP/CTP in Phase 2.

### 3.5 Scaling Beyond 10K Lines

For 50K+ demand lines:
- Partition by location group (each location group can be allocated independently)
- Parallel execution across partitions (Celery workers or thread pool)
- Merge results after all partitions complete
- Constraint: lateral transfer (Layer 6) requires cross-partition coordination — run as a second pass

---

## 4. When to Use This Pattern

### 4.1 Strong Fit

- **Supply chain planning (SCP/DRP):** The primary use case. Demand-to-supply matching with business rules.
- **Warehouse allocation / wave planning:** Assign orders to pick locations respecting FEFO, zone priority, picker capacity.
- **Order fulfillment / Available-to-Promise:** Real-time inventory commitment with multi-source routing.
- **Distribution network optimization:** Allocate production output across distribution centers based on demand priority and transit time.

### 4.2 Moderate Fit (with adaptation)

- **Production scheduling:** Layer stack concept applies but layers differ (machine capability, tooling, setup time, worker skills).
- **Procurement allocation:** Allocate purchase budget across suppliers based on quality, lead time, cost tiers.

### 4.3 Poor Fit

- **Pure routing/VRP problems:** Use B06 VRP solvers (OR-Tools, HiGHS) instead.
- **Single-constraint problems:** If only one constraint matters (e.g., FIFO only), a simple sort suffices.
- **Problems requiring global optimality proof:** Use MIP formulation instead.

---

## 5. Integration with Other MAESTRO Baselines

| Baseline | Integration Point |
|---|---|
| **B01 (Forecasting)** | Forecast output feeds as demand input to allocation Layer 1 |
| **B06 (Optimization)** | Safety stock computation (Layer 5), transport bin-packing (downstream of allocation) |
| **B07 (Anomaly Detection)** | Detect allocation anomalies (sudden fill-rate drops, unusual source selection patterns) |
| **B10 (Agentic AI)** | AI Copilot can suggest allocation parameter adjustments based on historical override patterns |
| **B11 (Knowledge Graph)** | Canonical data model for the 23+ planning objects that feed allocation |
| **I06 (Logistics)** | Vietnam-specific RTM patterns, ERP integration, Tet demand spikes |

---

## 6. Key Formulas Reference

### Safety Stock (4 Methods)

| Method | Formula | When to Use |
|---|---|---|
| **Statistical** | SS = z * sigma_demand * sqrt(lead_time) | Stable demand, reliable lead times |
| **Days-of-Supply** | SS = avg_daily_demand * DOS_target | Simple, executive-friendly |
| **Capacity-Cap** | SS = min(statistical_SS, max_storage_capacity * cap_%) | Warehouse-constrained environments |
| **Dynamic** | SS = f(forecast_error_last_N, service_level_target) | Phase 2: adapts to changing conditions |

### DRP Netting (PAB Formula)

```
PAB(t) = PAB(t-1) + Scheduled_Receipts(t) + Planned_Receipts(t) - Gross_Demand(t)

If PAB(t) < Safety_Stock:
    Net_Requirement(t) = Safety_Stock - PAB(t) + Gross_Demand(t) - Scheduled_Receipts(t)
    Planned_Order = lot_size(Net_Requirement(t))  // L4L, FOQ, or POQ
    Planned_Receipt(t + lead_time) = Planned_Order
```

### Fair-Share Allocation

```
For each demand line i with priority weight w_i:
  share_i = (w_i / sum(w_all)) * available_supply
  allocated_i = min(share_i, demand_i)
  // Iterate: redistribute unallocated surplus to remaining demand
```

---

## References

- **PRJ-SCP-001** — Smartlog SCP/DRP System (source of generalized patterns)
- **APICS CPIM Body of Knowledge** — DRP netting, lot sizing, safety stock
- **B06 Research Report** — Constraint satisfaction, OR-Tools, solver selection
- **I06 Research Report** — Vietnam logistics market, data readiness, ERP landscape

---

*Research report by alpha (R-a) | MAESTRO Knowledge Graph Platform | B06 x I06 Matrix Node*
