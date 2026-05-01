# UNIS SCP v2.0 — Data Flow & Data Contracts

**Date:** 2026-04-20 · **Revised:** 2026-04-20 (accuracy audit v1.1)  
**Scope:** Toàn bộ bảng dữ liệu chính của 28 module + cách data chảy giữa chúng  
**Companion docs:** `SYSTEM-WORKFLOW.md` (action flow) · `GROUP-MODULE.md` · `specs/M00-M28.md`

> ⚠ **Accuracy notice:** File này đã được đối chiếu lại với spec thực M00-M28.
> **Authoritative sections:** §2 (M00), §3 (M10), §11 (Quick-lookup — canonical), §12 (Accuracy Audit & Errata).
> **§4-§7** (schema diagrams) có một số tên bảng không khớp spec — xem §12 để biết corrections trước khi code.

---

## 1. Data Architecture — 4 lớp dữ liệu

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║  LAYER 1 — MASTER DATA (static, slowly changing)                                 ║
║  M00: 13 tables — SKU, CN, NM, Hub, Customer, mappings, transport_lane           ║
║  M10: system_config (42 keys) + feature_flag (16 flags)                          ║
╚══════════════════════════════════════════════════════════════════════════════════╝
                                      │
                                      ▼ read by all modules
╔══════════════════════════════════════════════════════════════════════════════════╗
║  LAYER 2 — SNAPSHOTS (point-in-time input)                                       ║
║  demand_snapshot (M11)   supply_snapshot (M21)   b2b_deal (M11)                 ║
║  cn_demand_adjust (M22)  ss_cn (M23)             sync_log (M21)                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝
                                      │
                                      ▼ input cho plan runs
╔══════════════════════════════════════════════════════════════════════════════════╗
║  LAYER 3 — RUN ARTIFACTS (plan outputs, per-run immutable)                       ║
║  FLOW 2:  plan_run · drp_cn_line · allocation_result · allocation_leg            ║
║           transport_plan · transport_trip · po_header · po_line                  ║
║  FLOW 1:  saop_cycle · booking_plan · commitment_record · response_record        ║
║           virtual_inventory_snapshot · gap_snapshot · scenario_decision          ║
╚══════════════════════════════════════════════════════════════════════════════════╝
                                      │
                                      ▼ feedback loop
╔══════════════════════════════════════════════════════════════════════════════════╗
║  LAYER 4 — FEEDBACK & AUDIT (M28 + cross-module logs)                            ║
║  master_data_audit_log · po_edit_log · kpi_link · alerts · feedback_run          ║
║  trust_score (M22/M28) · honoring_rate (supplier via M28)                        ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Layer 1 — Master Data (M00)

### 2.1 13 bảng M00

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  CORE ENTITIES (6)                                                             │
│                                                                                │
│  sku                    PK(id)  UK(sku_code)                                   │
│  ├─ sku_code            Mã SKU base, unique                                    │
│  ├─ sku_name            Tên hiển thị                                           │
│  ├─ uom                 Đơn vị tính (default 'm2')                             │
│  ├─ product_group       Nhóm sản phẩm                                          │
│  └─ active              Soft-delete flag                                       │
│  (KHÔNG có nm_id → quan hệ qua sku_nm_mapping)                                 │
│                                                                                │
│  sku_variant            PK(id)  UK(sku_id, variant_code)                       │
│  ├─ sku_id  → sku                                                              │
│  ├─ variant_code        Mã variant độc lập                                     │
│  ├─ variant_suffix      A4/B2/C1... (đuôi màu gạch)                           │
│  └─ attrs (JSONB)       Màu, grade, kích thước                                 │
│                                                                                │
│  channel (CN)           PK(id)  UK(cn_code)                                    │
│  ├─ cn_code / cn_name                                                          │
│  ├─ region              Nam/Bắc/Trung                                          │
│  ├─ lat / lng           MANDATORY cho LCNB distance calc                       │
│  └─ connectivity        GOOD/MEDIUM/WEAK                                       │
│                                                                                │
│  supplier (NM)          PK(id)  UK(nm_code)                                    │
│  ├─ nm_code / nm_name                                                          │
│  ├─ capacity_monthly                                                           │
│  ├─ production_cycle_d                                                         │
│  ├─ lead_time_days      ⚠ AUTO-UPDATED by M28 (feedback)                      │
│  ├─ lt_sigma            σ_LT rolling                                           │
│  ├─ price_tier_1/2      Dùng trong M17 scenario cost                           │
│  ├─ honoring_rate       ⚠ AUTO-UPDATED by M28                                 │
│  └─ relationship_score  0–100                                                  │
│                                                                                │
│  hub                    PK(id)  UK(hub_code)                                   │
│  ├─ hub_type            VIRTUAL / PHYSICAL                                     │
│  ├─ lat / lng / capacity                                                       │
│                                                                                │
│  customer               PK(id)  UK(customer_code)                              │
│  ├─ customer_type       B2B / B2C                                              │
└────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│  MAPPING TABLES (5)                                                            │
│                                                                                │
│  sku_nm_mapping         UK(sku_id, nm_id) + unique(sku_id WHERE active=TRUE)  │
│  ├─ sku_id  → sku                                                              │
│  ├─ nm_id   → supplier                                                         │
│  ├─ moq                 Min order per lần SX                                   │
│  ├─ priority            Future multi-source fallback                           │
│  └─ active                                                                     │
│  ⚠ SOURCE OF TRUTH cho quan hệ SKU ↔ NM (single-source rule)                  │
│                                                                                │
│  sku_cn_mapping         UK(sku_id, cn_id)                                      │
│  ├─ ss_override         Override công thức SS CN                               │
│  ├─ z_override          Override z-factor per CN×SKU                           │
│  └─ is_critical         Critical item flag                                     │
│                                                                                │
│  hub_cn_cluster         UK(hub_id, cn_id)                                      │
│  hub_nm_assignment      UK(hub_id, nm_id)                                      │
│  customer_cn            UK(customer_id, cn_id)  is_primary flag                │
└────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│  OPERATIONAL (1 extend + 1 new)                                                │
│                                                                                │
│  transport_lane  (EXTEND từ M6)                                                │
│  ├─ from_location / to_location    existing                                    │
│  ├─ distance_km                    existing                                    │
│  ├─ lane_type                      NM_TO_CN | NM_TO_HUB | HUB_TO_CN | CN_TO_CN │
│  ├─ transit_lt_days                ⚠ AUTO-UPDATED by M28                      │
│  ├─ lt_sigma                                                                   │
│  ├─ last_actual_lt                                                             │
│  └─ last_updated_by_m28                                                        │
│                                                                                │
│  master_data_audit_log  (NEW)                                                  │
│  ├─ entity_type / entity_id / action (CREATE|UPDATE|DELETE|IMPORT)             │
│  ├─ changed_fields (JSONB) {field: [old, new]}                                 │
│  └─ source (UI|IMPORT|M28_AUTO)                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Master data ER map

```
             ┌──────────┐                ┌────────────┐
             │   sku    │──(variants)──▶│ sku_variant │
             └──────────┘                └────────────┘
                  │
                  │ (single-source)
                  ▼
          ┌───────────────┐         ┌──────────────┐
          │sku_nm_mapping │────────▶│   supplier   │
          └───────────────┘         └──────────────┘
                  │                        │
                  │                        │
                  ▼                        ▼
          ┌──────────────┐         ┌──────────────────┐
          │sku_cn_mapping│         │hub_nm_assignment │
          └──────────────┘         └──────────────────┘
                  │                        │
                  ▼                        │
             ┌─────────┐              ┌────▼─────┐
             │ channel │◀─(cluster)──│   hub    │
             └─────────┘              └──────────┘
                  │                        │
                  │                        │
                  ▼                        │
             ┌──────────────┐              │
             │ customer_cn  │              │
             └──────────────┘              │
                  │                        │
                  ▼                        │
             ┌──────────┐                  │
             │ customer │                  │
             └──────────┘                  │
                                           │
   All locations ──────────────────────────┴─▶ transport_lane
                                              (NM×CN, NM×Hub, Hub×CN, CN×CN)
```

### 2.3 Master data consumers

| Table | Consumed by |
|---|---|
| `sku` + `sku_variant` | M11 M12 M13 M14 M15 M16 M17 M21 M22 M23 M24 M25 M26 M27 M28 |
| `channel` | M11 M12 M22 M23 M24 M25 M27 |
| `supplier` | M13 M14 M15 M16 M17 M21 M25 M26 M27 M28 |
| `hub` | M13 M16 M23 M24 M25 |
| `customer` | M11 (B2B deals) |
| `sku_nm_mapping.moq` | M13 (MOQ warning) |
| `sku_cn_mapping.ss_override, z_override` | M23 (SS CN calc) |
| `supplier.lead_time_days` | M13 (LT hub) · M23 (LT netting) · M26 (ATP) |
| `supplier.honoring_rate` | M17 (scenario risk) · M26 (urgency) |
| `supplier.price_tier_*` | M17 (scenario cost) · M27 (PO cost) |
| `transport_lane.distance_km` | M24 (LCNB NEAREST_FIRST) |
| `transport_lane.transit_lt_days` | M25 (hold-or-ship) · M27 (ETA) |

---

## 3. Layer 1b — Config Platform (M10)

### 3.1 `system_config` — 42 keys chia 10 group

```
┌──────────────────┬──────────────────────────────────────────────────────────────┐
│  GROUP           │  KEYS chính                                                   │
├──────────────────┼──────────────────────────────────────────────────────────────┤
│  PLANNING        │ max_stale_minutes, hub_available_mode, min_ss_floor_pct       │
│  LCNB            │ enabled, max_distance_km=500, ss_reduction_pct=25, fifo       │
│  Trust Score     │ window_weeks=12, auto_approve_threshold_pct=85                │
│  CN Adjustment   │ tolerance_pct=30, cutoff_time=18:00, reason_codes[]           │
│  Transport       │ min_fill_ratio=0.6, hold_max_days=2, hold_buffer_days=1       │
│  FC Commitment   │ hard=5, firm=15, soft=30, gap_alert=15, gap_escalate=10       │
│  B2B Pipeline    │ stage_prob (6 stages JSON), review_cadence_days=7             │
│  S&OP            │ deadline.day3/5/7/10, consistency_threshold_pct=10            │
│  NM Response     │ reminder_days=3, escalate_days=5, max_negotiation_rounds=3    │
│  Hub Virtual     │ nm_drop_alert_threshold_pct=10                                │
└──────────────────┴──────────────────────────────────────────────────────────────┘

Schema:
  system_config (key PK, value, value_type, group, description, default_value,
                 min_value, max_value, updated_by, updated_at)
```

### 3.2 `feature_flag` — 16 flags

```
m00_master_data_enabled           m13_prod_lot_sizing_enabled
m11_demand_v2_enabled             m14_fc_commitment_enabled
m12_saop_consensus_enabled        m15_nm_response_enabled
m21_data_sync_v2_enabled          m16_hub_virtual_enabled
m22_cn_demand_adjust_enabled      m16_hub_virtual_feeds_drp     ← cross-flow gate
m23_drp_netting_v2_enabled
m24_allocation_lcnb_enabled
m25_transport_v2_enabled
m26_nm_atp_enabled
m27_po_rebuild_enabled
m28_feedback_loop_enabled

Schema:
  feature_flag (flag_name PK, enabled, description, updated_by, updated_at)
```

---

## 4. Layer 2 — Snapshots (point-in-time inputs)

### 4.1 `demand_snapshot` + `demand_snapshot_line` (M11)

```
demand_snapshot                        demand_snapshot_line
├─ id PK                               ├─ id PK
├─ cycle_month                         ├─ snapshot_id → demand_snapshot
├─ level (TOTAL | CN)                  ├─ sku_id
├─ status (DRAFT|FROZEN|ARCHIVED)      ├─ cn_id (NULL nếu TOTAL)
├─ frozen_at / frozen_by               ├─ month (YYYY-MM)
├─ created_by                          ├─ qty
└─ source (IMPORT|MANUAL|B2B_CASCADE)  ├─ source_type (FORECAST|B2B)
                                       └─ unit_price
```
**Feeds:** M12 (consensus), M22 (phasing to weekly), M23 (demand input)

### 4.2 `b2b_deal` (M11, B2B pipeline)

```
b2b_deal
├─ id PK
├─ deal_code UK
├─ customer_id → customer
├─ cn_id → channel
├─ sku_id → sku
├─ qty / unit_price
├─ stage (LEAD|QUALIFIED|PROPOSAL|COMMITTED|CONFIRMED|LOST)
├─ probability (0–100, từ M10 b2b.stage_prob)
├─ weighted_qty = qty × probability/100
├─ expected_delivery_month
├─ stage_history (JSONB)
└─ updated_at

b2b_stage_change_log (audit)
├─ deal_id / from_stage / to_stage / changed_by / changed_at
```
**Feeds:** M11 demand_snapshot (cascade vào FC khi stage change ≥ 20%)

### 4.3 `supply_snapshot` + `supply_snapshot_line` + `lot_attribute` (M21)

```
supply_snapshot                          supply_snapshot_line
├─ id PK                                 ├─ snapshot_id
├─ synced_at                             ├─ location_type (NM | HUB | CN)
├─ source (NM_UPLOAD | ERP | MANUAL)     ├─ location_id
├─ nm_id (NULL nếu hub/cn)               ├─ sku_id / variant_id
├─ freshness_status (FRESH | STALE)      ├─ qty
└─ template_version                      ├─ is_estimated  (⚠ BUG-01 fix)
                                         └─ lot_ref

sync_log                                 lot_attribute
├─ sync_id PK                            ├─ lot_ref PK
├─ started_at / finished_at              ├─ production_date
├─ nm_id                                 ├─ expiry_date (NULL cho gạch)
├─ rows_in / rows_ok / rows_err          ├─ variant_suffix
├─ status (OK | FAIL | PARTIAL)          └─ received_at
└─ error_blob (JSONB)
```
**Feeds:** M23 (beginning inventory), M24 (hub lots), M26 (NM ATP), M16 (release actual)

### 4.4 `cn_demand_adjust` + `trust_score` (M22)

```
cn_demand_adjust                         trust_score
├─ id PK                                 ├─ cn_id PK
├─ cn_id → channel                       ├─ window_weeks
├─ sku_id                                ├─ accuracy_pct          (rolling 12w)
├─ month (YYYY-MM)                       ├─ trust_level
├─ original_qty (từ M11 locked)          │    AUTO (≥85) |
├─ adjusted_qty                          │    REVIEW (60–85) |
├─ delta_pct                             │    BLOCKED (<60)
├─ reason_code                           ├─ last_computed_at
├─ status                                └─ samples (qty)
│   PENDING | APPROVED | REJECTED
├─ auto_approved (bool)
├─ trust_at_submit (snap)
├─ submitted_at / submitted_by
└─ reviewed_by (nullable)
```
**Feeds:** M23 (adjusted_demand input), M28 (trust_score refresh)

### 4.5 `ss_cn` + `policy_run` (M23 — M3 extend)

```
policy_run                               ss_cn
├─ id PK (policy_run_id ⚠ PIN)           ├─ policy_run_id FK
├─ run_date                              ├─ cn_id / sku_id
├─ config_snapshot (JSONB)               ├─ z_used
├─ lcnb_enabled                          ├─ sigma_demand (seasonal)
├─ trigger (CRON | MANUAL)               ├─ lt_hub (days)
└─ created_at                            ├─ ss_raw = z × σ × √LT
                                         ├─ ss_after_lcnb   (if LCNB enabled)
                                         └─ ss_final
```
**Policy pinning:** `plan_run.policy_run_id = policy_run.id` để baseline không drift giữa các run.

---

## 5. Layer 3a — Run Artifacts: FLOW 2 (Nightly DRP)

### 5.1 M23 DRP output

```
plan_run (M23)                           drp_cn_line
├─ id PK (plan_run_id)                   ├─ plan_run_id FK
├─ run_date                              ├─ cn_id / sku_id / week (YYYY-W##)
├─ run_type (DAILY_DRP | MANUAL)         ├─ demand_qty     (từ M22)
├─ policy_run_id FK  ⚠ PIN               ├─ beginning_inv  (từ M21)
├─ supply_snapshot_id FK                 ├─ in_transit
├─ demand_snapshot_id FK                 ├─ ss_cn          (từ ss_cn)
├─ hub_source (SNAPSHOT | VIRTUAL)       ├─ net_requirement
│    ⚠ VIRTUAL khi m16 feeds_drp=TRUE    ├─ planned_order_release
├─ status (RUNNING | OK | FAIL)          ├─ pab (projected available balance)
└─ metrics (JSONB)                       └─ ss_violation (flag)
```
**Feeds:** M24 (planned_order_release list), M28 (kpi_link)

### 5.2 M24 Allocation output

```
allocation_run (M24)                     allocation_result
├─ id PK                                 ├─ allocation_run_id FK
├─ plan_run_id FK (từ M23)               ├─ cn_id / sku_id / variant_id
├─ lcnb_enabled (snap từ M10)            ├─ requested_qty
├─ max_distance_km (snap)                ├─ allocated_qty
└─ status                                ├─ priority_rank (NEAREST_FIRST output)
                                         ├─ shortage_qty
                                         └─ ss_guard_violation

allocation_leg  (BUG-02 fix, multi-source)
├─ id PK
├─ allocation_result_id FK
├─ source_type (HUB | CN_LCNB | NM_DIRECT)
├─ source_id (hub_id | cn_id | nm_id)
├─ lot_ref → lot_attribute
├─ leg_qty
├─ distance_km (lane lookup)
└─ leg_order (FIFO ordering)
```
**Feeds:** M25 (items per trip), M26 (per-NM ATP validate), M27 (draft PO lines)

### 5.3 M25 Transport output

```
transport_plan (M25)                     transport_trip
├─ id PK                                 ├─ transport_plan_id FK
├─ allocation_run_id FK                  ├─ trip_code UK
├─ run_date                              ├─ origin_location / dest_location
└─ status                                ├─ lane_id → transport_lane
                                         ├─ vehicle_type
                                         ├─ pallet_used / pallet_cap
                                         ├─ weight_used / weight_cap
                                         ├─ fill_ratio
                                         ├─ hold_decision (SHIP | HOLD_2D)
                                         ├─ hold_reason
                                         ├─ topup_suggestions (JSONB)
                                         └─ multi_drop_stops (JSONB)

transport_trip_line
├─ trip_id / allocation_result_id / qty
```
**Feeds:** M27 (draft PO/TO lines per trip)

### 5.4 M26 ATP output

```
atp_check_result (M26)
├─ id PK / plan_run_id FK
├─ cn_id / sku_id / nm_id
├─ atp_qty
├─ requested_qty
├─ status (PASS | PARTIAL | FAIL)
├─ urgency_rank  (CN HSTK-based)
├─ freshness_blocked (bool)
└─ checked_at

nm_honoring_snapshot  (rolling, fed to supplier.honoring_rate by M28)
├─ nm_id / window_start / window_end
├─ committed_qty / delivered_qty / honoring_rate_calc
```
**Feeds:** M27 (PO gate), M28 (supplier.honoring_rate update)

### 5.5 M27 PO/TO output (REBUILD)

```
po_header (NEW, 6 tables)                po_line
├─ po_code UK                            ├─ po_id FK
├─ nm_id → supplier                      ├─ sku_id / variant_id / qty
├─ status                                ├─ uom / unit_price
│   DRAFT|REVIEW|CONFIRMED|SENT|DELIVERED│ └─ line_no
├─ created_by / confirmed_by
├─ expected_delivery
├─ po_source (DRP | MANUAL | CARRY_FWD)
└─ plan_run_id FK

to_header (Hub → CN)                     to_line
├─ to_code UK                            ├─ to_id FK / allocation_result_id FK
├─ origin_hub_id / dest_cn_id            ├─ sku_id / qty
├─ status (same 5 states)                └─ lot_ref (FIFO traceability)
└─ trip_id → transport_trip

po_edit_log                              po_tracking
├─ po_id / field / old_value / new_value ├─ po_id / event_type
├─ reason_code ⚠ MANDATORY              │   (DISPATCHED|IN_TRANSIT|DELIVERED|DELAYED)
├─ edited_by / edited_at                 ├─ vehicle / driver / nvt
└─ override_type                         └─ eta / actual_at
```
**Feeds:** M28 (override analysis, actual LT from tracking), M9 (plan vs actual)

---

## 6. Layer 3b — Run Artifacts: FLOW 1 (Monthly Booking)

### 6.1 M12 S&OP output

```
saop_cycle                               saop_adjustment
├─ id PK                                 ├─ cycle_id FK
├─ cycle_month                           ├─ tier (TOTAL | CN)
├─ status                                ├─ sku_id / cn_id (nullable)
│   DRAFT|OPEN|TIER1_LOCKED|             ├─ original_qty / adjusted_qty
│   TIER2_LOCKED|VARIANCE_CHECK|LOCKED   ├─ reason_text ⚠ MANDATORY
├─ deadline_day3 / day5 / day7 / day10   ├─ adjusted_by
├─ locked_at / locked_by                 └─ delta_pct
├─ variance_pct (Σ CN vs Total)          
└─ fva_score  (Forecast Value Add)       consensus_variance
                                         ├─ cycle_id / sku_id
                                         ├─ total_fc / sum_cn_fc
                                         ├─ gap_pct / band (GREEN|YELLOW|RED)
                                         └─ explanation (text)
```
**Feeds:** M13 (locked_fc per SKU×month horizon T+1..T+3)

### 6.2 M13 Booking output

```
booking_plan
├─ id PK
├─ cycle_month / horizon_month (T+1, T+2, T+3)
├─ nm_id / sku_id
├─ fc_qty                  (từ M12 locked)
├─ hub_available           (step 1: Σ stock_cn + hub_inbound − Σ ss_cn)
├─ ss_hub                  (step 2: z × σ × √LT_hub)
├─ final_qty               (step 3: MAX(0, fc − hub_avail + ss_hub))
├─ moq                     (từ sku_nm_mapping)
├─ moq_warning (bool)
├─ carried_forward_qty     (từ M17 previous cycle)
└─ status (DRAFT | LOCKED | SENT_TO_M14)
```
**Feeds:** M14 (finalQty for tier split), M16 (ss_hub input)

### 6.3 M14 Commitment output

```
commitment_record                        commitment_version_log
├─ id PK                                 ├─ commitment_id FK
├─ cycle_month / nm_id / sku_id          ├─ version
├─ horizon_month                         ├─ tier_split (JSONB: {hard, firm, soft})
├─ hard_qty (±5% tol)                    ├─ changed_by / changed_at
├─ firm_qty (±15% tol)                   └─ change_reason
├─ soft_qty (±30% tol)
├─ total_qty  ⚠ SUM = M13.final_qty      commitment_penalty  (from M15 deviation)
├─ status                                ├─ nm_id / sku_id / cycle_month
│   DRAFT|LOCKED|SENT|ACK|VOID           ├─ tier / expected_qty / delivered_qty
├─ version (increments)                  ├─ deviation_pct / violation (bool)
├─ sent_at                               └─ penalty_amount
└─ confirmed_by (SC Manager)
```
**Feeds:** M15 (SENT trigger), M17 (committed_vs_demand gap input)

### 6.4 M15 Response output

```
response_record  (3-field model ⚠)
├─ id PK
├─ commitment_id FK
├─ round (multi-round, version++)
├─ response_type       PENDING | ACCEPTED | COUNTER | REJECTED
├─ sla_state           NONE | REMINDED | ESCALATED
├─ sc_decision         CONFIRM | OVERRIDE | SPLIT | ROLLOVER | NULL
├─ confirmed_qty       (khi ACCEPTED / sau sc_decision)
├─ counter_qty         (khi COUNTER)
├─ nm_reason_text
├─ sc_reason_text
├─ responded_at / response_by (NM contact)
└─ sla_last_reminded_at

negotiation_round_log
├─ response_record_id / round_no / event (REMINDED|ESCALATED|COUNTERED|ACCEPTED)
├─ event_at / actor
```
**Feeds:** M16 (confirmed_qty trigger recalc), M17 (nm_gap view)

### 6.5 M16 Hub Virtual output

```
virtual_inventory_snapshot
├─ id PK / computed_at
├─ hub_id (nullable — có thể cross-hub)
├─ sku_id
├─ confirmed_qty       (từ M15.confirmed_qty Σ cycle)
├─ released_qty        (từ supply_snapshot actual dispatch)
├─ hub_available       = confirmed − released
├─ ss_hub              (từ M13, KHÔNG Σ ss_cn)
├─ allocatable         = MAX(0, hub_available − ss_hub)
├─ trigger_source      (M15_RESPONSE | M13_SS | CRON)
└─ feature_flag_state  (snapshot at time of compute)
```
**Feeds (conditional):**
- `m16_hub_virtual_feeds_drp = TRUE` → M23 `plan_run.hub_source = VIRTUAL`, swaps `supply_snapshot.hub_qty` với `allocatable`
- M17 HUB gap view

### 6.6 M17 Gap + Scenario output

```
gap_snapshot                             scenario_option
├─ id PK / cycle_month / computed_at     ├─ gap_snapshot_id FK
├─ gap_view_type ⚠ discriminator:        ├─ scenario_code (A | B | C | D | E)
│   RELEASE | NM | HUB                   ├─ description
├─ nm_id / sku_id                        ├─ cost_estimate
├─ committed_qty                         ├─ risk_level (LOW|MED|HIGH)
├─ actual_qty                            ├─ source_nm_id (for A/B)
├─ gap_qty / gap_pct                     ├─ rollover_month (for C)
├─ status                                └─ hybrid_split (JSONB, for D)
│   NORMAL|ALERT|ESCALATED|
│   SCENARIO_REQUIRED|RESOLVED|          scenario_decision
│   CARRIED_FORWARD                      ├─ gap_snapshot_id FK
├─ alert_day (EOM−10/−5/−2)              ├─ selected_scenario  (A|B|C|D|E)
├─ escalation_level (SC | CEO)           ├─ decided_by (SC|CEO)
└─ carry_to_cycle_month                  ├─ decided_at
                                         ├─ custom_qty_override (for E)
                                         └─ reason_text
```
**Feeds:**
- `scenario_decision` chọn C/D với carry → ghi vào `gap_snapshot.carry_to_cycle_month`
- **Carry-forward:** `getCarriedForwardGaps()` → M13 next cycle: `booking_plan.carried_forward_qty`
- `commitment_penalty` (M14) = separate workflow, không chặn carry

---

## 7. Layer 4 — Feedback, Audit, KPI

### 7.1 M28 Feedback output

```
feedback_run                             feedback_ss_adjust
├─ id PK / run_date / run_type           ├─ feedback_run_id
│   WEEKLY_SS | DAILY_LT | WEEKLY_KPI    ├─ cn_id / sku_id
└─ status                                ├─ old_sigma / new_sigma
                                         ├─ old_ss_cn / new_ss_cn
                                         ├─ delta_pct
                                         └─ applied (bool; >30% → alert, not applied)

feedback_lt_update                       feedback_trust_refresh
├─ lane_id / nm_id                       ├─ cn_id
├─ old_lt / new_actual_lt                ├─ old_trust / new_trust
├─ sample_size / applied_at              ├─ window / samples

override_analysis                        feedback_kpi_report
├─ week / top_5_reasons (JSONB)          ├─ week
├─ total_overrides                       ├─ fc_mape / trust_avg / honoring_avg
└─ top_planner                           ├─ ss_accuracy / atp_pass_rate
                                         └─ report_blob (JSONB)
```
**Writes back to:**
- `supplier.lead_time_days` (M00)
- `transport_lane.transit_lt_days` (M00)
- `trust_score` (M22)
- `supplier.honoring_rate` (M00)
- `ss_cn` (M23 input for next policy_run)

### 7.2 Monitor & audit (M8, M9, cross-module)

```
kpi_link (M8)
├─ kpi_code (FILL_RATE | OTIF | HSTK | FC_MAPE | TRUST_AVG | HONORING | ATP_PASS)
├─ scope (GLOBAL | CN | NM | SKU)
├─ scope_id / period / value / target / status

alerts (M8)
├─ alert_type / severity / scope / message / triggered_at / resolved_at

plan_actual (M9)                         drift_detection (M8→M9)
├─ period / sku_id / cn_id               ├─ drift_type (FC | SS | LT)
├─ plan_qty / actual_qty                 ├─ scope / magnitude_pct / detected_at
├─ gap_pct / gap_band

master_data_audit_log (M00, cross)
├─ entity_type / entity_id / action / changed_fields (JSONB)
├─ changed_by / source (UI | IMPORT | M28_AUTO)
```

---

## 8. End-to-End Data Flow Diagrams

### 8.1 Flow 2 — Nightly DRP Data Chain

```
[M10 system_config] ──┐                                               feedback ▲
[M00 master data  ] ──┤                                                        │
                      ▼                                                         │
  ┌─────────────┐   [sku,supplier,channel,hub,sku_nm_mapping,transport_lane]   │
  │  CRON 23:00 │                                                               │
  └──────┬──────┘                                                               │
         ▼                                                                      │
  ┌──────────────┐        ┌─────────────────┐                                  │
  │ M21 DataSync │───────▶│ supply_snapshot │                                  │
  │  (2×/day +   │        │ supply_snap_line│                                  │
  │   nightly)   │        │ lot_attribute   │                                  │
  └──────┬───────┘        │ sync_log        │                                  │
         │                └─────────────────┘                                  │
         │                                                                      │
         ▼                                                                      │
  ┌──────────────┐   ┌────────────────────┐   ┌──────────────────────┐        │
  │ M22 CN Adj   │──▶│ cn_demand_adjust   │──▶│ adjusted demand      │        │
  │ cutoff 18:00 │   │ trust_score        │   │ per CN×SKU×week      │        │
  └──────────────┘   └────────────────────┘   └────────┬─────────────┘        │
                                                       │                       │
  [demand_snapshot M11] ───────────────────────────────┤                       │
                                                       ▼                       │
                              ┌──────────────────────────────────┐            │
                              │ M23 DRP Netting + SS CN          │            │
                              │ CREATE policy_run (PIN ID)       │            │
                              │ CREATE plan_run (policy_run_id)  │            │
                              │ WRITE  ss_cn per cn×sku          │            │
                              │ WRITE  drp_cn_line per week      │            │
                              │                                  │            │
                              │ hub_source?                      │            │
                              │   flag m16_feeds_drp=TRUE?       │            │
                              │     YES → read virtual_inv_snap  │            │
                              │     NO  → read supply_snapshot   │            │
                              └─────────────┬────────────────────┘            │
                                            │                                  │
                                            ▼                                  │
                              ┌──────────────────────────────────┐            │
                              │ M24 Allocation LCNB              │            │
                              │ WRITE allocation_run             │            │
                              │ WRITE allocation_result          │            │
                              │ WRITE allocation_leg (BUG-02)    │            │
                              └─────────────┬────────────────────┘            │
                                            │                                  │
                       ┌────────────────────┴───────────────────┐              │
                       ▼                                        ▼              │
        ┌──────────────────────────┐         ┌───────────────────────────┐    │
        │ M26 NM ATP Check         │         │ M25 Transport Lot Sizing  │    │
        │ WRITE atp_check_result   │         │ WRITE transport_plan      │    │
        │ WRITE nm_honoring_snap   │         │ WRITE transport_trip      │    │
        └──────────────────────────┘         │ WRITE transport_trip_line │    │
                       │                     └──────────────┬────────────┘    │
                       │                                    │                  │
                       └────────────────┬───────────────────┘                  │
                                        ▼                                      │
                     ┌──────────────────────────────────────────┐              │
                     │ M27 PO/TO Review (Human Gate)            │              │
                     │ WRITE po_header / po_line                │              │
                     │ WRITE to_header / to_line                │              │
                     │ WRITE po_edit_log (override + reason)    │              │
                     │ WRITE po_tracking (lifecycle events)     │              │
                     └──────────────────┬───────────────────────┘              │
                                        │                                      │
                                        ▼                                      │
                     ┌──────────────────────────────────────────┐              │
                     │ M28 Feedback (weekly cron)                │              │
                     │ READ po_edit_log, po_tracking, plan_actual│              │
                     │ COMPUTE new σ / new LT / new trust        │              │
                     │ WRITE feedback_ss_adjust                  │              │
                     │ WRITE feedback_lt_update                  │              │
                     │ WRITE feedback_trust_refresh              │              │
                     │ WRITE feedback_kpi_report                 │              │
                     │                                           │              │
                     │ WRITE BACK: supplier.lead_time_days       │─────────────┘
                     │            supplier.honoring_rate         │
                     │            transport_lane.transit_lt_days │
                     │            trust_score.accuracy_pct       │
                     │            ss_cn (next policy_run)        │
                     └──────────────────────────────────────────┘
```

### 8.2 Flow 1 — Monthly Booking Data Chain

```
[M10 system_config + feature_flag]  [M00 master data]
                   │                        │
                   └────────────┬───────────┘
                                ▼
       ┌──────────────────────────────────────────┐
       │ M11 Demand Aggregation v2                │
       │ WRITE demand_snapshot (level=TOTAL)      │
       │ WRITE demand_snapshot (level=CN)         │
       │ WRITE demand_snapshot_line               │
       │ WRITE b2b_deal + b2b_stage_change_log    │
       └────────────────────┬─────────────────────┘
                            ▼
       ┌──────────────────────────────────────────┐
       │ M12 S&OP Consensus (Day 3/5/7/10)        │
       │ WRITE saop_cycle                         │
       │ WRITE saop_adjustment (tier=TOTAL)       │
       │ WRITE saop_adjustment (tier=CN)          │
       │ WRITE consensus_variance                 │
       │ LOCK at Day 10 → status=LOCKED           │
       └────────────────────┬─────────────────────┘
                            ▼ locked_fc per SKU×month
       ┌──────────────────────────────────────────┐
       │ M13 Production Lot Sizing                │
       │ READ saop_cycle (LOCKED)                 │
       │ READ supply_snapshot (hub, cn stocks)    │
       │ READ carry_forward from M17 prev cycle   │
       │ WRITE booking_plan (final_qty per NM×SKU)│
       │ EXPORT ss_hub → M16                      │
       └────────────────────┬─────────────────────┘
                            ▼
       ┌──────────────────────────────────────────┐
       │ M14 FC Commitment 3-Tier                 │
       │ READ booking_plan.final_qty              │
       │ SPLIT → hard_qty / firm_qty / soft_qty   │
       │ WRITE commitment_record (status=DRAFT)   │
       │ WRITE commitment_version_log             │
       │ SC CONFIRM → status=SENT                 │
       └────────────────────┬─────────────────────┘
                            ▼ SENT trigger
       ┌──────────────────────────────────────────┐
       │ M15 NM Response & Negotiation            │
       │ WRITE response_record (round=1, type=PENDING)│
       │ SLA reminder Day+3 → sla_state=REMINDED   │
       │ SLA escalate Day+5 → sla_state=ESCALATED  │
       │ NM replies → response_type=ACCEPTED/COUNTER/REJECTED │
       │ COUNTER → SC sc_decision → round++        │
       │ WRITE negotiation_round_log               │
       └──────────┬──────────────────┬────────────┘
                  │                  │
                  ▼                  ▼ M15 event → recalc
   [M17 gap NM-view]    ┌──────────────────────────────────────────┐
                        │ M16 Hub ảo Virtual Inventory             │
                        │ READ confirmed_qty (M15)                 │
                        │ READ released_qty (supply_snapshot)      │
                        │ READ ss_hub (M13)                        │
                        │ WRITE virtual_inventory_snapshot         │
                        │                                          │
                        │ IF flag m16_hub_virtual_feeds_drp=TRUE:  │
                        │   → feeds M23 next plan_run (hub_source=VIRTUAL) │
                        └──────────┬──────────────────┬────────────┘
                                   │                  │
                                   ▼                  ▼ (to FLOW 2 M23)
       ┌──────────────────────────────────────────┐
       │ M17 Gap Monitor + Scenario               │
       │ WRITE gap_snapshot (3 views: RELEASE/NM/HUB)│
       │ EOM−10/−5 → status=ALERT/ESCALATED        │
       │ EOM−2 → status=SCENARIO_REQUIRED          │
       │ WRITE scenario_option (A/B/C/D)           │
       │ SC select or CEO escalate (→ E)           │
       │ WRITE scenario_decision                   │
       │                                           │
       │ UNRESOLVED at EOM:                        │
       │   status=CARRIED_FORWARD                  │
       │   getCarriedForwardGaps() → M13 next cycle│
       │     booking_plan.carried_forward_qty++    │
       │                                           │
       │ VIOLATED commitment → commitment_penalty  │
       │   (separate workflow, không block carry)  │
       └──────────────────────────────────────────┘
```

---

## 9. Cross-Flow Data Contracts (injectable APIs)

Mỗi module D8 expose **stable getter** để module khác tiêu thụ không coupling schema:

```
M13.getConfirmedBooking(cycleMonth)       → booking_plan[] (status=LOCKED)
M14.getCommittedVsDemand(cycleMonth)      → grain = nm × sku × horizon
M15.getResponseSummary(cycleMonth)        → {confirmed, pending, escalated}[]
M16.getVirtualInventory(date)             → {hub, sku, hub_available, allocatable, ss_hub}
M17.getGapStatus(cycleMonth, viewType)    → gap_snapshot rows filtered
M17.getCarriedForwardGaps(targetCycle)    → [{nm_id, sku_id, carry_qty}]
M22.getTrustScore(cn_id, at?)             → {trust_level, accuracy_pct}
M26.getAtpStatus(cn_id, sku_id, runId?)   → {status, atp_qty, urgency_rank}
M28.getKpiReport(week)                    → feedback_kpi_report
```

**Rule:** không module nào được đọc bảng của module khác trực tiếp — phải qua getter. Ngoại lệ: master data M00 được phép read trực tiếp entity (sku/supplier/channel/hub/transport_lane).

---

## 10. Data Lifecycle & Retention

```
DATA TYPE                       MUTABILITY            RETENTION
────────────────────────────────────────────────────────────────────────
Master Data (M00)              SOFT-DELETE only      Forever (audit)
  sku, supplier, channel, hub  active=false never drop
  mappings                      active=false

system_config, feature_flag    Mutable + audit       Forever

SNAPSHOTS
  demand_snapshot              IMMUTABLE after FROZEN 24 months hot, archive
  supply_snapshot              IMMUTABLE after sync   6 months hot, 18m cold
  b2b_deal                     Mutable (stage)        Forever (win/lose reason)

RUN ARTIFACTS
  plan_run + drp_cn_line       IMMUTABLE              12 months hot, archive
  policy_run                   IMMUTABLE              Forever (PIN reference)
  allocation_*                 IMMUTABLE              12 months
  transport_*                  IMMUTABLE              12 months
  po_header / po_line          Mutable lifecycle      Forever (compliance)
  po_edit_log / po_tracking    APPEND-ONLY            Forever

FLOW 1 (Monthly)
  saop_cycle                   Frozen after LOCK      Forever
  booking_plan                 Mutable → LOCKED        Forever
  commitment_record            Mutable → SENT/ACK      Forever (penalty ref)
  response_record              APPEND per round        Forever
  virtual_inv_snapshot         IMMUTABLE per compute   6 months hot
  gap_snapshot                 APPEND per compute      24 months
  scenario_decision            IMMUTABLE               Forever

FEEDBACK/AUDIT
  master_data_audit_log        APPEND-ONLY            Forever
  feedback_*                   IMMUTABLE per run       12 months
  kpi_link / alerts            APPEND-ONLY            12 months
```

---

## 11. Quick-lookup Table — Module ↔ Tables Written (CANONICAL, verified)

> Đã cross-check từng module với spec (`docs/specs/M*.md`) ngày 2026-04-20.
> Label: **NEW** = bảng mới · **EXT** = extend bảng cũ · **wrapper** = bảng wrapper run artifact.

| Module | Writes |
|---|---|
| **M00** | `sku`·`sku_variant`·`channel`·`supplier`·`hub`·`customer` (6 core NEW) · `sku_nm_mapping`·`sku_cn_mapping`·`hub_cn_cluster`·`hub_nm_assignment`·`customer_cn` (5 mapping NEW) · `transport_lane` (EXT từ M6) · `master_data_audit_log` (NEW) |
| **M10** | `system_config` (EXT, +~25 keys mới) · `feature_flag` (NEW, 16 flags) |
| **M11** | `demand_snapshot` (EXT, thêm `level`) · `demand_snapshot_line` (EXT, thêm `sku_group`, `cn_id`) · `b2b_deal` (NEW) · `b2b_deal_stage_history` (NEW) · `b2b_deal_split` (NEW) |
| **M12** | `saop_cycle` (NEW) · `saop_adjustment` (NEW, 2 grain qua partial unique: TOTAL/CN) · `saop_deadline` (NEW) · `fva_log` (NEW, Phase 2 backfill) |
| **M13** | `booking_run` (NEW wrapper) · `hub_snapshot` (NEW) · `ss_hub` (NEW) · `booking_plan` (NEW) |
| **M14** | `commitment_run` (NEW wrapper) · `fc_commitment` (NEW) · `commitment_penalty` (NEW, Phase 2 activate) |
| **M15** | `nm_response` (NEW, 3-field model: `response_type`/`sla_state`/`sc_decision`) · `nm_negotiation_round` (NEW) |
| **M16** | `hub_virtual_snapshot` (NEW) |
| **M17** | `gap_snapshot` (NEW, discriminator `gap_view_type` ∈ RELEASE/NM/HUB) · `gap_scenario_decision` (NEW) |
| **M21** | `supply_snapshot` (EXT, thêm `nm_id`, `synced_at`, `source`, `is_estimated`, `is_legacy_data`) · `sync_log` (NEW) |
| **M22** | `cn_demand_adjustment` (NEW) · `trust_score` (NEW, 1 row per CN) · `reason_code` (NEW lookup) |
| **M23** | `plan_run` (EXT, thêm `policy_run_id`, `is_stale_override`, `BLOCKED_STALE` status) · `policy_run` (NEW, Rule 14 snapshot) · `ss_cn` (NEW) · `drp_cn_line` (NEW) |
| **M24** | `allocation_run` (EXT từ M5, thêm `plan_run_id`) · `allocation_result` (EXT, thêm `planner_review_required`) · `allocation_leg` (NEW, BUG-02 fix; +`source_period_start`, `origin_top_up_id` cho M25 cross-link) |
| **M25** | `transport_trip` (EXT, thêm `fill_ratio`, `hold_decision`, `HELD` status) · `transport_trip_stop` (NEW, multi-drop UNLOAD) · `transport_trip_line` (EXT, thêm stop_id mapping) · `top_up_suggestion` (NEW) · `supply_snapshot_line.reserved_for_transport` (EXT reservation C1 fix) |
| **M26** | `atp_run` (NEW wrapper) · `atp_check` (NEW) · `nm_honoring_rate` (NEW, monthly metric) |
| **M27** | `po_run` (NEW wrapper) · `po_header` (NEW) · `po_line` (NEW) · `to_header` (NEW) · `to_line` (NEW) · `po_edit_log` (NEW) · `to_edit_log` (NEW) · `po_tracking` (NEW, 1-1 với po_header) |
| **M28** | `weekly_kpi_snapshot` (NEW wrapper) · `sigma_history` (NEW, single source of truth cho σ) · `ss_adjustment_log` (NEW) · `lt_actual_log` (NEW) · `override_analysis` (NEW) |
| **M8**  | `kpi_link` · `alerts` · `drift_detection` (giữ nguyên từ Phase 1) |
| **M9**  | `plan_actual` (giữ nguyên; Phase 3 thêm FC MAPE field) |

### 11.1 M28 Rule 14 ownership (CRITICAL)

M28 **KHÔNG** tự ghi `ss_cn`, `supplier.*`, `transport_lane.*`, `trust_score` trực tiếp. Ownership rule:

```
M28 writes own tables only:
  sigma_history, ss_adjustment_log, lt_actual_log, override_analysis, weekly_kpi_snapshot

M28 calls owner services (write-back):
  → M23.SsCnService.refresh(plan_run_id)           // M23 đọc sigma_history mới, write ss_cn
  → M00.LaneService.updateTransitLt(…)             // M00 handle audit + drift gate
  → M00.SupplierService.updateLeadTime(nmId, …)    // M00 handle audit + drift gate
  → M22.TrustService.refresh(cnId)                 // M22 backfill is_accurate → write trust_score
  → M26.HonoringRateService.recompute(month)       // M26 backfill nm_honoring_rate
```

Lý do: separation of concerns. Mỗi table có 1 owner service duy nhất. M28 = publisher σ, không phải writer ss_cn.

---

## 12. Accuracy Audit & Errata (v1.1)

**Audit date:** 2026-04-20 · **Method:** Grep toàn bộ `### \`[a-z_]+\`` trong `docs/specs/M*.md` + đối chiếu table name thực với phiên bản đầu của file này.

### 12.1 Verified CORRECT (match spec 100%)

- **§2 M00** — 13 tables, all fields, ER map ✅
- **§3 M10** — `system_config` (EXT), `feature_flag` (NEW) ✅
- **§4.5 + §5.1 M23** — `policy_run`, `ss_cn`, `plan_run` (EXT), `drp_cn_line` ✅
- **§5.2 M24** — `allocation_run/result/leg` ✅ (chỉ thiếu label EXT)
- **§5.5 M27** — 6 bảng core ✅ (thiếu `po_run` wrapper + `to_edit_log`)
- **§6.1 M12** — `saop_cycle`, `saop_adjustment` ✅
- **§6.6 M17** — `gap_snapshot` + discriminator `gap_view_type` ✅

### 12.2 Naming corrections (tên bảng sai trong §4-§7)

Code implementation phải dùng tên trong spec gốc, không dùng tên trong §4-§7:

| Module | Tên trong §4-§7 (SAI) | Tên đúng theo spec |
|---|---|---|
| M11 | `b2b_stage_change_log` | `b2b_deal_stage_history` |
| M11 | *(thiếu)* | `b2b_deal_split` |
| M12 | `consensus_variance` (invented) | Không tồn tại. Dùng `saop_deadline` + `fva_log` |
| M13 | Chỉ có `booking_plan` | Thêm: `booking_run` (wrapper), `hub_snapshot`, `ss_hub` |
| M14 | `commitment_record` | `fc_commitment` |
| M14 | `commitment_version_log` (invented) | Không tồn tại. Version qua cột `version` trong `fc_commitment` + unique (…, version) |
| M14 | *(thiếu)* | `commitment_run` (wrapper) |
| M15 | `response_record` | `nm_response` |
| M15 | `negotiation_round_log` | `nm_negotiation_round` |
| M16 | `virtual_inventory_snapshot` | `hub_virtual_snapshot` |
| M17 | `scenario_option` (invented) | Không tồn tại. Scenarios nằm trong `gap_scenario_decision` |
| M17 | `scenario_decision` | `gap_scenario_decision` |
| M21 | `supply_snapshot_line` + `lot_attribute` liệt kê như M21 output | `supply_snapshot_line` + `lot_attribute` là **legacy từ M2/Step 2**, KHÔNG do M21 tạo. M21 chỉ EXT `supply_snapshot` + NEW `sync_log`. |
| M22 | `cn_demand_adjust` | `cn_demand_adjustment` |
| M22 | *(thiếu)* | `reason_code` (lookup) |
| M25 | `transport_plan` (invented) | Không tồn tại. M25 EXT `transport_trip` (wrapper role). |
| M25 | `transport_trip_line` (NEW) | Thực tế là EXT (đã có từ M6), chỉ thêm `stop_id` mapping |
| M25 | *(thiếu)* | `transport_trip_stop` (NEW, multi-drop), `top_up_suggestion` (NEW) |
| M26 | `atp_check_result` | `atp_check` |
| M26 | `nm_honoring_snapshot` | `nm_honoring_rate` |
| M26 | *(thiếu)* | `atp_run` (wrapper) |
| M27 | *(thiếu)* | `po_run` (wrapper), `to_edit_log` |
| M28 | `feedback_run` | `weekly_kpi_snapshot` (wrapper) |
| M28 | `feedback_ss_adjust` | `ss_adjustment_log` |
| M28 | `feedback_lt_update` | `lt_actual_log` |
| M28 | `feedback_trust_refresh` | Không có table riêng. M28 gọi `M22.TrustService.refresh()`; trust state ghi vào `trust_score` (owner M22). |
| M28 | `feedback_kpi_report` | Gộp vào `weekly_kpi_snapshot` (wrapper) |
| M28 | `override_analysis` | ✅ Đúng |
| M28 | *(thiếu)* | `sigma_history` (single source of truth σ cho M23 consume) |

### 12.3 Semantic correction — M28 write-back (CRITICAL)

**Phiên bản đầu viết:** "M28 writes back to ss_cn, supplier.lead_time_days, transport_lane.transit_lt_days, trust_score."

**Thực tế theo spec M28 v1.2 (Rule 14 ownership):**

```
M28 Step 3  SS auto-adjust:
  - COMPUTE new σ_demand from M9 actual_sales (precedence) or demand_snapshot fallback
  - COMPUTE ss_new = M23.SsCnService.computeSsCnFormula(...)   ← PURE function
  - INSERT sigma_history {cn_id, sku_id, sigma=σ_new, source='M28_AUTO_WEEKLY'}
  - INSERT ss_adjustment_log {cn, sku, ss_old, ss_new, delta_pct, capped}
  - KHÔNG ghi ss_cn trực tiếp
  
M23 nightly D+1:
  - M23.SsCnService.refresh(plan_run_id) đọc sigma_history latest → write ss_cn row mới
```

Tương tự cho LT update, trust refresh, honoring: M28 gọi owner service, không UPDATE trực tiếp.

### 12.4 EXTEND labels bị thiếu

Các bảng sau là **EXTEND** của M1-M7 chứ không phải NEW (ảnh hưởng migration strategy):

- `demand_snapshot` (M1 → M11 EXT)
- `demand_snapshot_line` (M1 → M11 EXT)
- `supply_snapshot` (M2 → M21 EXT)
- `plan_run` (M4 → M23 EXT)
- `allocation_run`, `allocation_result` (M5 → M24 EXT)
- `transport_trip`, `transport_trip_line` (M6 → M25 EXT)
- `transport_lane` (M6 → M00 EXT)
- `system_config` (M10 → M10 EXT thêm ~25 keys)

### 12.5 Actions cho dev team

1. **Dùng §11 làm canonical reference** khi tạo migration/entity.
2. **Bỏ qua tên bảng trong §4-§7** nếu mâu thuẫn với §11 hoặc spec gốc.
3. **M28 ownership rule** là hard constraint — không cho phép M28 service UPDATE trực tiếp bảng ngoài scope của nó.
4. Các field chi tiết (cột, type, constraint) luôn tham chiếu spec `docs/specs/M*.md` §6 hoặc §7 Data Contract, không tham chiếu file này.

---

*DATA-FLOW.md v1.1 — UNIS SCP v2.0 — 2026-04-20 (accuracy audit pass)*
*Source of truth: specs/M00-master-data-platform.md · M10-M28 specs · GROUP-MODULE.md*
