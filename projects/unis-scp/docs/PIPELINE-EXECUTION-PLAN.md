# UNIS DRP — Pipeline Execution Plan

**Version:** 1.0 | **Date:** 2026-04-13  
**Purpose:** Bản đồ thi công cho cả team — từ raw data đến production features  
**Đọc cùng:** ARCHITECTURE-PROPOSAL.md, 00-master-data.md, step docs 01-08

---

## 1. Big Picture — Toàn bộ luồng dự án

```
 RAW DATA          DATABASE           API (NestJS)        WEB (Next.js)       UPGRADE
 ═══════          ════════           ════════════        ═════════════       ═══════
                                                                              
 ┌──────────┐     ┌──────────┐     ┌──────────────┐    ┌──────────────┐    ┌──────────┐
 │ CSV/Excel │────▶│ Migrations│────▶│ Master Data  │───▶│ Config Page  │    │ Auth     │
 │ Master    │     │ + Seeds   │     │ Module       │    │ Item/Branch  │    │ RBAC     │
 │ Data      │     │           │     │ /api/v1/     │    │ Explorer     │    │ Bravo ERP│
 └──────────┘     └──────────┘     └──────────────┘    └──────────────┘    │ SSE      │
                       │                                                    │ Mobile   │
                       ▼                                                    └──────────┘
 ┌──────────┐     ┌──────────┐     ┌──────────────┐    ┌──────────────┐         ▲
 │ Forecast  │────▶│ demand_  │────▶│ Demand       │───▶│ Demand Page  │         │
 │ CSV       │     │ snapshot │     │ Module       │    │ Upload/View  │         │
 │ (monthly) │     │ + lines  │     │              │    │ Freeze/Compare│        │
 └──────────┘     └──────────┘     └──────────────┘    └──────────────┘         │
                       │                                                         │
                       ▼                                                         │
 ┌──────────┐     ┌──────────┐     ┌──────────────┐    ┌──────────────┐         │
 │ Inventory │────▶│ supply_  │────▶│ Supply       │───▶│ Supply Page  │         │
 │ CSV       │     │ snapshot │     │ Module       │    │ 4-Bucket View│         │
 │ (batch)   │     │ 4-bucket │     │              │    │ Freshness    │         │
 └──────────┘     └──────────┘     └──────────────┘    └──────────────┘         │
                       │                                                         │
                       ▼                                                         │
 ┌──────────┐     ┌──────────┐     ┌──────────────┐    ┌──────────────┐         │
 │ ABC Class │────▶│ policy   │────▶│ Policy       │───▶│ Policy Page  │         │
 │ Config    │     │ safety_  │     │ Module       │    │ SS Config    │         │
 │ SS Params │     │ stock    │     │              │    │ ABC View     │         │
 └──────────┘     └──────────┘     └──────────────┘    └──────────────┘         │
                       │                                                         │
                       ▼                                                    Phase 2+
 ┌──────────┐     ┌──────────┐     ┌──────────────┐    ┌──────────────┐    Features
 │ Python   │────▶│ drp_run  │────▶│ DRP          │───▶│ DRP Page     │    sẽ plug
 │ DRP      │     │ drp_lines│     │ Module       │    │ PAB Grid     │    vào đây
 │ Netting  │     │ exception│     │              │    │ Exceptions   │         │
 └──────────┘     └──────────┘     └──────────────┘    └──────────────┘         │
                       │                                                         │
                       ▼                                                         │
 ┌──────────┐     ┌──────────┐     ┌──────────────┐    ┌──────────────┐         │
 │ Python   │────▶│ alloc_run│────▶│ Allocation   │───▶│ Alloc Page   │         │
 │ Allocation│    │ alloc_   │     │ Module       │    │ Results Grid │         │
 │ Engine   │     │ results  │     │              │    │ Recommend.   │         │
 └──────────┘     └──────────┘     └──────────────┘    └──────────────┘         │
                       │                                                         │
                       ▼                                                         │
 ┌──────────┐     ┌──────────┐     ┌──────────────┐    ┌──────────────┐         │
 │ Python   │────▶│ transport│────▶│ Transport    │───▶│ Transport Pg │         │
 │ Bin-pack │     │ _plan    │     │ Module       │    │ Trip View    │         │
 │ 28T limit│     │ trips    │     │              │    │ Route Map    │         │
 └──────────┘     └──────────┘     └──────────────┘    └──────────────┘         │
                       │                                                         │
                       ▼                                                         │
 ┌──────────┐     ┌──────────┐     ┌──────────────┐    ┌──────────────┐         │
 │ Python   │────▶│ orders   │────▶│ Execution    │───▶│ Order Page   │◀────────┘
 │ Draft    │     │ order_   │     │ Module       │    │ Approve/     │
 │ Orders   │     │ lines    │     │ 2-step       │    │ Reject Flow  │
 └──────────┘     │ approval │     │ approval     │    │ State Machine│
                  └──────────┘     └──────────────┘    └──────────────┘
                       │
                       ▼
 ┌──────────┐     ┌──────────┐     ┌──────────────┐    ┌──────────────┐
 │ Python   │────▶│ kpi_     │────▶│ Monitor      │───▶│ Dashboard    │
 │ KPI Calc │     │ snapshot │     │ Module       │    │ KPI Cards    │
 │ Alerts   │     │ alerts   │     │              │    │ Alert List   │
 └──────────┘     └──────────┘     └──────────────┘    └──────────────┘
```

---

## 2. Execution Phases — Thứ tự thi công

```
═══════════════════════════════════════════════════════════════════════════════
 PHASE 0: FOUNDATION                                              Week 0
═══════════════════════════════════════════════════════════════════════════════

 ┌─────────────────────────────────────────────────────────────────────────┐
 │                                                                         │
 │  DevOps          Data Engineer       Tech Lead         FE Lead          │
 │  ───────         ─────────────       ─────────         ────────         │
 │                                                                         │
 │  docker-compose  Seed CSV files      001_master_data   Next.js proxy    │
 │  PostgreSQL 16   load_master.py      .sql migration    /api/v1 → :3001 │
 │  pgAdmin         Validate counts     NestJS scaffold   Verify sidebar   │
 │                                      Error codes       API client setup │
 │                                                                         │
 │  Output: DB running + 6 tables seeded + NestJS boots + FE connects     │
 └─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
═══════════════════════════════════════════════════════════════════════════════
 MODULE 0: MASTER DATA                                            Week 1
═══════════════════════════════════════════════════════════════════════════════

 Data ─────────────────▶ DB ─────────────────▶ API ──────────────▶ Web
                                                                    
 [CSV Files]              [6 Tables]            [8 Endpoints]       [Config Page]
 ┌────────────────┐      ┌──────────────┐      ┌──────────────┐   ┌────────────┐
 │ items.csv      │─────▶│ item         │─────▶│ GET /items   │──▶│ Item List  │
 │ 2,412 rows     │      │ 14 columns   │      │ GET /items/:c│   │ Search     │
 │                │      │              │      │ GET /variants │   │ Filter ABC │
 │ locations.csv  │─────▶│ location     │─────▶│ GET /location│──▶│ Branch Map │
 │ 143 rows       │      │ 12 columns   │      │              │   │            │
 │                │      │              │      │ POST /import  │   │ CSV Upload │
 │ suppliers.csv  │─────▶│ supplier     │      │              │   │            │
 │ 56 rows        │      │ 8 columns    │      │ GET /stats   │──▶│ Stats Card │
 │                │      │              │      │              │   │            │
 │ rtm_rules.csv  │─────▶│ rtm_rule     │      └──────────────┘   └────────────┘
 │ 108,028 rows   │      │ 10 columns   │
 │                │      │              │       Test: AC0-01 → AC0-10
 │ configs.csv    │─────▶│ item_loc_cfg │       All pass? → next module
 └────────────────┘      │ planning_cyc │
                         └──────────────┘

 DONE criteria: 
   ✅ 6 tables seeded with correct counts
   ✅ 8 API endpoints return data
   ✅ Config page shows items + branches
   ✅ AC0-01 → AC0-10 all PASS
                                    │
                                    ▼
═══════════════════════════════════════════════════════════════════════════════
 MODULE 1: DEMAND INGESTION                                       Week 2
═══════════════════════════════════════════════════════════════════════════════

 Data ─────────────────▶ DB ─────────────────▶ API ──────────────▶ Web

 [Forecast CSV]          [2 New Tables]        [5 Endpoints]       [Demand Page]
 ┌────────────────┐      ┌──────────────┐      ┌──────────────┐   ┌────────────┐
 │ Forecast_      │      │ demand_      │      │ POST /upload │   │ CSV Upload │
 │ 30032026.csv   │─────▶│ snapshot     │─────▶│ POST /freeze │──▶│ Freeze Btn │
 │                │      │ (header)     │      │ GET /list    │   │ Snapshot   │
 │ Python:        │      │              │      │ GET /:id     │──▶│ List       │
 │ step1_demand.py│      │ demand_      │      │ GET /summary │   │ Detail     │
 │ - parse CSV    │─────▶│ lines        │      └──────────────┘   │ Summary    │
 │ - validate     │      │ (per item×   │                         │ Chart      │
 │ - map item_code│      │  branch×     │       Reads from:       └────────────┘
 │ - freeze snap  │      │  period)     │       ← item (FK validate)
 └────────────────┘      └──────────────┘       ← location (FK validate)

 Input:  Forecast CSV (monthly, branch-level)
 Output: demand_snapshot (FROZEN) + demand_lines
 Rule:   demand_basis = MAX(forecast, confirmed_PO)
 
 DONE criteria:
   ✅ Upload CSV → snapshot created
   ✅ Freeze snapshot → status FROZEN, immutable
   ✅ Summary shows item × period aggregation
   ✅ Demand page renders real data
                                    │
                                    ▼
═══════════════════════════════════════════════════════════════════════════════
 MODULE 2: SUPPLY SNAPSHOT                                        Week 3
═══════════════════════════════════════════════════════════════════════════════

 Data ─────────────────▶ DB ─────────────────▶ API ──────────────▶ Web

 [Inventory CSV]         [2 New Tables]        [3 Endpoints]       [Supply Page]
 ┌────────────────┐      ┌──────────────┐      ┌──────────────┐   ┌────────────┐
 │ Branch_        │      │ lot_         │      │ POST /capture│   │ Upload     │
 │ Inventory.csv  │─────▶│ attribute    │─────▶│ GET /list    │──▶│ Snapshot   │
 │ (Bravo export) │      │ (raw lots:   │      │ GET /:id     │   │ List       │
 │                │      │  on_hand,    │      │ GET /fresh   │──▶│ 3-Bucket   │
 │ Factory_       │      │  reserved,   │      └──────────────┘   │ View       │
 │ Inventory.csv  │─────▶│  in_transit, │                         │ Freshness  │
 │                │      │  source_type)│       Reads from:       │ Indicator  │
 │ Python:        │      │              │       ← item (FK)       └────────────┘
 │ step2_supply.py│      │ supply_      │       ← location (FK)
 │ - parse        │─────▶│ snapshot     │
 │ - map item_code│      │ (freeze pt)  │
 │ - freshness    │      │              │
 │ - aggregate    │      │ supply_      │
 └────────────────┘      │ snapshot_    │
                         │ lines        │
                         │ (computed:   │
                         │  allocatable │
                         │  reserved    │
                         │  in_transit  │
                         │  is_estimatd)│
                         └──────────────┘

 Input:  Inventory CSV (item × location × on_hand / reserved / in_transit)
 Output: lot_attribute (raw) + supply_snapshot (FROZEN) + supply_snapshot_lines
 Rule:   freshness_threshold = 240 minutes
 Rule:   allocatable_qty = on_hand_qty - reserved_qty  ← DRP dùng field này

 DONE criteria:
   ✅ Upload inventory → 4-bucket parsed correctly
   ✅ Freshness indicator shows stale/fresh
   ✅ Supply page shows stock by location
                                    │
                                    ▼
═══════════════════════════════════════════════════════════════════════════════
 MODULE 3: INVENTORY POLICY                                       Week 4
═══════════════════════════════════════════════════════════════════════════════

 Data ─────────────────▶ DB ─────────────────▶ API ──────────────▶ Web

 [Config + Compute]      [3 New Tables]        [9 Endpoints]       [Policy Page]
 ┌────────────────┐      ┌──────────────┐      ┌──────────────┐   ┌────────────┐
 │ ABC class from │      │ policy       │      │ CRUD policy  │   │ Policy     │
 │ forecast       │─────▶│ (DRAFT/      │─────▶│ POST/PUT/DEL │──▶│ Editor     │
 │ segment field  │      │  ACTIVE)     │      │ GET list     │   │ Draft/Actv │
 │                │      │              │      │ PUT activate │   │            │
 │ Python:        │      │ safety_stock │      │ PUT deactivat│   │ SS Grid    │
 │ step3_policy.py│─────▶│ (per item×   │─────▶│ POST compute │──▶│ Compute    │
 │ - SS formula   │      │  branch)     │      │              │   │ Button     │
 │ - ABC classify │      │              │      │ GET /classif │──▶│ ABC Chart  │
 │               │      │ abc_         │      └──────────────┘   │ Pie + Bar  │
 │ SS = z × √(   │─────▶│ classification│                        └────────────┘
 │  LT×σ²d +     │      └──────────────┘
 │  ADU²×σ²LT)   │       
 └────────────────┘       Reads from: item, location, demand_lines (for σ_demand)

 Input:  ABC class + SS parameters (z-score per class)
 Output: safety_stock per item × branch, policy records
 Config: A(z=1.96) B(z=1.65) C(z=1.28), LT_avg=5d, LT_std=2d

 DONE criteria:
   ✅ SS computed for 2,412 items × 68 branches
   ✅ Policy CRUD: create draft → activate → deactivate
   ✅ ABC pie chart shows A/B/C distribution
   ✅ SS grid shows computed values per item
                                    │
                                    ▼
═══════════════════════════════════════════════════════════════════════════════
 MODULE 4: DRP NETTING                                            Week 5
═══════════════════════════════════════════════════════════════════════════════

 Data ─────────────────▶ DB ─────────────────▶ API ──────────────▶ Web

 [Python Compute]        [3 New Tables]        [3 Endpoints]       [DRP Page]
 ┌────────────────┐      ┌──────────────┐      ┌──────────────┐   ┌────────────┐
 │ Python:        │      │ drp_run      │      │ POST /run    │   │ Trigger    │
 │ step4_drp.py   │      │ (metadata)   │─────▶│ GET /runs/:id│──▶│ PAB Grid   │
 │                │      │              │      │ GET /except  │   │ 12-week    │
 │ FOR EACH item  │      │ drp_lines    │      └──────────────┘   │ Horizon    │
 │  × branch:     │─────▶│ (per item×   │                         │            │
 │                │      │  branch×week)│       Pipeline trigger:  │ Exceptions │
 │ gross_req =    │      │              │       POST /api/v1/      │ Red/Amber  │
 │  demand_basis  │      │ planned_     │       pipeline/trigger/  │ Heatmap    │
 │                │─────▶│ order_release│       drp                └────────────┘
 │ net_req =      │      │ (← input for │
 │  gross - avail │      │  Module 5)   │
 │  - safety_stock│      │              │
 │                │      │ drp_         │       Reads from:
 │ PAB = prev_PAB │      │ exceptions   │       demand_snapshot (FROZEN)
 │  + supply      │      └──────────────┘       supply_snapshot_lines (FROZEN)
 │  - demand      │                             safety_stock (computed)
 │                │
 │ IF PAB < 0:    │
 │  → EXCEPTION   │
 │  IF net_req>0  │
 │  → planned_ord │
 │    _release    │
 └────────────────┘

 Input:  demand_snapshot + supply_snapshot_lines + safety_stock
 Output: drp_run + drp_lines (PAB per week) + planned_order_release + drp_exceptions
 Rule:   L4L lot sizing, 12-week horizon, 2-week frozen zone
 Rule:   HSTK < 1.5 weeks → RED, 1.5-3.0 → YELLOW, > 3.0 → GREEN

 DONE criteria:
   ✅ DRP run produces PAB for 12 weeks
   ✅ Exceptions flagged for PAB < 0
   ✅ HSTK heatmap renders correctly
   ✅ Pipeline trigger from UI works
                                    │
                                    ▼
═══════════════════════════════════════════════════════════════════════════════
 MODULE 5: ALLOCATION ENGINE                                      Week 6
═══════════════════════════════════════════════════════════════════════════════

 Data ─────────────────▶ DB ─────────────────▶ API ──────────────▶ Web

 [Python Compute]        [2 New Tables]        [3 Endpoints]       [Alloc Page]
 ┌────────────────┐      ┌──────────────┐      ┌──────────────┐   ┌────────────┐
 │ Python:        │      │ allocation_  │      │ POST /run    │   │ Trigger    │
 │ step5_alloc.py │      │ run          │─────▶│ GET /runs/:id│──▶│ Results    │
 │                │      │              │      │ GET /recom   │   │ Grid       │
 │ 6 LAYERS:      │      │ allocation_  │      │ GET /recom   │   │ Layer      │
 │ (L3 FEFO=OFF,  │─────▶│ results      │      └──────────────┘   │ Breakdown  │
 │  L6 LCNB Ph4)  │      │ (per item×   │                         │            │
 │                │      │  branch×     │       Reads from:        │ Recommend  │
 │ L1: RTM source │      │  source)     │       planned_order_     │ Cards      │
 │  → rtm_rule    │      └──────────────┘       release            └────────────┘
 │    lookup      │                             rtm_rule
 │                │                             supply_snapshot_
 │ L2: Variant    │                             lines
 │  → match color/│                             safety_stock
 │    size suffix │
 │                │
 │ L3: FEFO       │
 │  → DISABLED    │
 │    (gạch men   │
 │     no expiry) │
 │                │
 │ L4: ABC fair   │
 │  → weighted    │
 │    allocation  │
 │    A:2 B:1.5   │
 │    C:1.0       │
 │                │
 │ L5: SS Guard   │
 │  → check post- │
 │    alloc stock │
 │    vs SS target│
 │                │
 │ L6: LCNB       │
 │  → DETECT_ONLY │
 │    (Phase 4:   │
 │     EXECUTE)   │
 └────────────────┘

 Input:  planned_order_release + rtm_rules + supply_snapshot_lines + safety_stock
 Output: allocation_run + allocation_results (qty per source)
 Rule:   FEFO disabled (building materials)
 Rule:   Variant matching on specs_id suffix

 DONE criteria:
   ✅ Allocation assigns source warehouse per item × branch
   ✅ RTM priority respected (P1 → P2 → P3)
   ✅ ABC fair-share under shortage
   ✅ Recommendations generated for buyer
                                    │
                                    ▼
═══════════════════════════════════════════════════════════════════════════════
 MODULE 6: TRANSPORT PLANNING                                     Week 7
═══════════════════════════════════════════════════════════════════════════════

 Data ─────────────────▶ DB ─────────────────▶ API ──────────────▶ Web

 [Python Compute]        [2 New Tables]        [2 Endpoints]       [Transport Pg]
 ┌────────────────┐      ┌──────────────┐      ┌──────────────┐   ┌────────────┐
 │ Python:        │      │ transport_   │      │ POST /plans  │   │ Create     │
 │ step6_transp.py│      │ plan         │─────▶│ GET /plans/:i│──▶│ Plan View  │
 │                │      │              │      └──────────────┘   │            │
 │ Group by route │      │ transport_   │                         │ Trip List  │
 │ FFD bin-pack   │─────▶│ trips        │       Reads from:       │ Weight Bar │
 │ 28,000 kg max  │      │ (per trip:   │       allocation_results│ Route Map  │
 │                │      │  route,      │       item.weight_kg    └────────────┘
 │ Carrier select │      │  weight,     │       location (coords)
 │ BEST_SLA       │      │  carrier,    │
 │                │      │  ETA)        │
 └────────────────┘      └──────────────┘

 Input:  allocation_results + item.weight_kg + location coords
 Output: transport_plan + trips (route, weight, carrier, ETA)
 Rule:   MAX_CONTAINER_WEIGHT = 28,000 kg
 Rule:   Carrier preference = BEST_SLA (not cheapest)

 DONE criteria:
   ✅ Trips don't exceed 28T
   ✅ Carrier assigned by OTD%
   ✅ Trip list shows route + ETA
                                    │
                                    ▼
═══════════════════════════════════════════════════════════════════════════════
 MODULE 7: EXECUTION BRIDGE                                       Week 8
═══════════════════════════════════════════════════════════════════════════════

 Data ─────────────────▶ DB ─────────────────▶ API ──────────────▶ Web

 [Python Generate]       [3 New Tables]        [7 Endpoints]       [Order Page]
 ┌────────────────┐      ┌──────────────┐      ┌──────────────┐   ┌────────────┐
 │ Python:        │      │ draft_orders │      │ GET /orders  │   │ Order List │
 │ step7_exec.py  │      │ (state:      │─────▶│ GET /:id     │──▶│ Filter by  │
 │                │      │  DRAFT →     │      │ POST /create │   │ Status     │
 │ Group alloc    │─────▶│  SUBMITTED → │      │              │   │            │
 │ results by     │      │  CN_APPROVED→│      │ PUT /submit  │   │ Submit Btn │
 │ branch +       │      │  MGR_APPROVED│──────│ PUT /approve │──▶│ 2-Step     │
 │ transport trip │      │  → POSTED /  │      │   -branch    │   │ Approval   │
 │                │      │  REJECTED)   │      │ PUT /approve │   │ Flow       │
 │ Create draft   │      │              │      │   -manager   │   │            │
 │ orders (1 per  │─────▶│ draft_order_ │      │ PUT /reject  │   │ Reject Btn │
 │  trip × branch)│      │ lines        │      │ PUT /resubmit│   │ Re-submit  │
 │                │      │ (qty_original│      └──────────────┘   │ Button     │
 └────────────────┘      │  qty_adjusted│                         │            │
                         │  locked)     │       ⚠️ AUTH HERE:     │ State      │
                         │              │       JWT + 4 roles     │ Machine    │
                         │ approval_log │       branch_head scope │ Visual     │
                         │ (append-only │       sc_manager scope  │            │
                         │  before/after│                         │ Audit Log  │
                         │  status)     │                         └────────────┘
                         └──────────────┘

 Input:  allocation_results + transport_trips
 Output: draft_orders → approval workflow → posted
 State:  DRAFT → SUBMITTED → CN_APPROVED → MGR_APPROVED → POSTED
                    ↓               ↓
                REJECTED        REJECTED
                    ↓
              re-submit() → SUBMITTED (unlimited, EX-005)
 
 Auth:   branch_head = approve-branch own branch only
         sc_manager = approve-manager PO/TO system-wide
 Rule:   POST_APPROVAL_EDIT = true → sửa qty sau approve → reset về SUBMITTED
 Rule:   QTY_ADJUST = DECREASE_ONLY (CN không được tăng qty)

 DONE criteria:
   ✅ Draft orders generated from transport trips (not directly from allocation)
   ✅ 2-step approval: branch_head → sc_manager
   ✅ Rejected orders CAN be re-submitted (REJECTION_FINAL = false)
   ✅ qty_adjusted ≤ qty_original enforced
   ✅ Audit log records all actions (append-only)
   ✅ JWT middleware protects endpoints
                                    │
                                    ▼
═══════════════════════════════════════════════════════════════════════════════
 MODULE 8: MONITOR & LEARN                                        Week 9
═══════════════════════════════════════════════════════════════════════════════

 Data ─────────────────▶ DB ─────────────────▶ API ──────────────▶ Web

 [Python Compute]        [2 New Tables]        [3 Endpoints]       [Dashboard]
 ┌────────────────┐      ┌──────────────┐      ┌──────────────┐   ┌────────────┐
 │ Python:        │      │ kpi_snapshot │      │ GET /kpis    │   │ KPI Cards  │
 │ step8_monitor  │─────▶│ (point-in-   │─────▶│ GET /alerts  │──▶│ Fill Rate  │
 │                │      │  time KPIs)  │      │ GET /plan-vs │   │ HSTK       │
 │ Compute:       │      │              │      │   -actual    │   │ OTIF       │
 │ - Fill Rate    │      │ alerts       │      └──────────────┘   │            │
 │ - HSTK         │─────▶│ (severity,   │                         │ Alert List │
 │ - OTIF         │      │  type,       │       Reads from:       │ Red/Amber  │
 │ - MAPE         │      │  resolved?)  │       ALL previous      │ Green      │
 │ - Inv Turns    │      └──────────────┘       tables for KPI    │            │
 │                │                             computation       │ Plan vs    │
 │ Detect:        │                                               │ Actual     │
 │ - Stockout     │                                               │ Chart      │
 │ - Overstock    │                                               │ Trend Line │
 │ - Demand drift │                                               └────────────┘
 └────────────────┘

 Input:  ALL tables (demand, supply, drp, allocation, orders)
 Output: kpi_snapshot + alerts
 KPIs:  Fill Rate ≥92%, OTIF ≥90%, HSTK 1.5-3.0 weeks
 Alert: RED (stockout), AMBER (overstock), GREEN (normal)

 DONE criteria:
   ✅ KPI cards show live metrics
   ✅ Alerts trigger on threshold breach
   ✅ Plan vs Actual chart renders
   ✅ Full pipeline: CSV → 8 steps → dashboard
```

---

## 3. Upgrade Path — Phase 2+ Features

```
Sau khi 8 modules hoàn thành, upgrade features plug vào hệ thống:

═══════════════════════════════════════════════════════════════════════════════
 UPGRADE FEATURES (Phase 2+)                                     Backlog
═══════════════════════════════════════════════════════════════════════════════

 ┌─────────────────────────────────────────────────────────────────────────┐
 │                                                                         │
 │  U1: Full Auth (OAuth 2.0)                                              │
 │  ─────────────────────────                                              │
 │  Login page → JWT → refresh token → role from DB                        │
 │  Replaces: UAT role-selector dropdown                                   │
 │  Plugs into: Module 7 (execution auth guard already exists)             │
 │                                                                         │
 │  U2: Bravo ERP Integration (SFTP)                                       │
 │  ────────────────────────────────                                        │
 │  Pull: demand + inventory from Bravo SFTP → replaces CSV upload         │
 │  Push: SO/TO/PO → Bravo SFTP → replaces CSV download                   │
 │  Plugs into: Module 1 (demand), Module 2 (supply), Module 7 (orders)   │
 │                                                                         │
 │  U3: Real-time Updates (SSE)                                            │
 │  ───────────────────────────                                            │
 │  Pipeline progress → SSE stream → FE auto-refresh                       │
 │  Alert notifications → SSE → toast notifications                        │
 │  Plugs into: Module 8 (monitor), Pipeline trigger                       │
 │                                                                         │
 │  U4: LCNB Execute Mode                                                  │
 │  ──────────────────────                                                  │
 │  Lateral transfer between branches (not just detect)                    │
 │  Plugs into: Module 5 (allocation Layer 4 → execute mode)               │
 │                                                                         │
 │  U5: LightGBM Forecast                                                  │
 │  ─────────────────────                                                   │
 │  Replace Holt-Winters with ML model (needs 12+ months clean data)       │
 │  Plugs into: Module 1 (demand) — forecast engine swap                   │
 │                                                                         │
 │  U6: Mobile Approval                                                    │
 │  ──────────────────                                                      │
 │  Responsive UI for branch_head approve on mobile                        │
 │  Plugs into: Module 7 (execution) — FE responsive only                  │
 │                                                                         │
 │  U7: AI Copilot                                                         │
 │  ──────────────                                                          │
 │  NL-to-SQL, SHAP explanation, what-if scenarios                         │
 │  New module: /api/v1/copilot/*                                          │
 │  Plugs into: All modules (read-only analytics)                          │
 │                                                                         │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Dependency Graph — Không thể skip

```
Module 0 (Master Data)
  │
  ├──▶ Module 1 (Demand)     ← cần item + location tables
  │       │
  │       ├─────────────────────────────┐
  │       │                             │
  ├──▶ Module 2 (Supply)     ← cần item + location tables
  │       │                             │
  │       ▼                             │
  │    Module 3 (Policy)     ← cần demand_lines (σ_demand từ M1) + item (ABC)
  │                          ← cần supply_snapshot (freshness từ M2)
  │       │
  │       ▼
  │    Module 4 (DRP)        ← cần demand_snapshot + supply_snapshot_lines + safety_stock
  │       │                    → output: planned_order_release
  │       ▼
  │    Module 5 (Allocation) ← cần planned_order_release + rtm_rules + supply_snapshot_lines
  │       │
  │       ▼
  │    Module 6 (Transport)  ← cần allocation_results + item.weight
  │       │
  │       ▼
  │    Module 7 (Execution)  ← cần allocation + transport + AUTH
  │       │
  │       ▼
  └──▶ Module 8 (Monitor)   ← cần ALL tables (KPI from everything)

  ⚠️ Module 1 và 2 có thể song song (cùng depend Module 0)
  ⚠️ Module 3 cần CẢ Module 1 (demand_forecast_detail cho ADU/σ) VÀ Module 2
  ⚠️ Module 3-8 PHẢI tuần tự (output step N = input step N+1)
```

---

## 5. Per-Module Checklist Template

Dùng checklist này cho MỖI module:

```
MODULE {N}: {NAME}
══════════════════

Pre-conditions:
  [ ] Module {N-1} DONE criteria all pass
  [ ] Migration {NNN} SQL reviewed
  [ ] Step doc 0{N} read by all devs

Data Layer (Python):
  [ ] Pipeline script step{N}_{name}.py written
  [ ] Script reads from correct source tables
  [ ] Script writes to correct output tables
  [ ] Script handles errors (log + continue)
  [ ] Test: run script → verify row counts in DB

API Layer (NestJS):
  [ ] Module scaffolded: controller + service + repository + DTOs + entities
  [ ] All endpoints from step doc implemented
  [ ] Pagination works on list endpoints
  [ ] Error codes return UNIS-ERR-XXX format
  [ ] Test: all endpoints return correct data

Web Layer (Next.js):
  [ ] Page component renders with real API data
  [ ] Loading states + error states handled
  [ ] Table paginated (server-side)
  [ ] Actions work (buttons, forms, triggers)
  [ ] Test: user flow matches step doc ACs

Integration:
  [ ] Python script output → API reads correctly
  [ ] FE displays data from API correctly
  [ ] Pipeline trigger from FE → Python runs → results show
  
Sign-off:
  [ ] All ACs from step doc PASS
  [ ] No console errors in browser
  [ ] No unhandled exceptions in API logs
  [ ] → PROCEED TO MODULE {N+1}
```

---

*PIPELINE-EXECUTION-PLAN.md — UNIS DRP | v1.1 | 2026-04-13*
*v1.1 fixes: B1 supply bucket model, B2 planned_order_release, B3 Module5 input tables, B4 REJECTION_FINAL=false, B5 table names draft_orders/supply_snapshot_lines, B6 dependency graph M1→M3*
*Đọc cùng: ARCHITECTURE-PROPOSAL.md v1.2, step docs 00-08*
