# FLOW 2 — Nightly DRP & Allocation Chain

**Date:** 2026-04-28 (rewrite sau sự cố mất docs)
**Cadence:** Daily nightly 23:00 · **Modules:** M21 → M22 → M23 → M24 → M25 → M26 → M27 → M28
**Mục tiêu:** Mỗi đêm tính lại nhu cầu CN → phân bổ hub → đóng container → review PO/TO → feedback.

---

## 1. Big picture

```
[Daily 18:00] CN cutoff M22       [2×/day] NM upload M21
                  ↓                          ↓
[Nightly 23:00]   ┌───────────────────────┐
                  │  M21 Freshness gate    │  block nếu >24h stale
                  └──────────┬─────────────┘
                             ▼
                  ┌───────────────────────┐
                  │  M23 DRP + SS CN       │  policy_run PIN
                  │  (per CN×SKU×week)     │  ← M16 hub_virtual nếu flag
                  └──────────┬─────────────┘
                             ▼
                  ┌───────────────────────┐
                  │  M24 Allocation LCNB   │
                  │  Hub→CN, NEAREST_FIRST │
                  └────┬────────────┬──────┘
                       ▼            ▼
               ┌──────────┐   ┌──────────────┐
               │ M26 ATP  │   │ M25 Transport│
               │ NM check │   │ Hold-or-ship │
               └────┬─────┘   └──────┬───────┘
                    └────────┬───────┘
                             ▼
                  ┌───────────────────────┐
                  │  M27 PO/TO Review     │  human gate
                  └──────────┬─────────────┘
                             ▼
[Weekly Mon 06:00]┌───────────────────────┐
                  │  M28 Feedback          │  publish σ, gọi owner services
                  └───────────────────────┘
                             ↓ feeds back: M23 ss_cn · M00 LT · M22 trust · M26 honoring
```

---

## 2. Trigger model

| When | Module | Action |
|------|--------|--------|
| 08:00, 14:00 daily | M21 | NM supply snapshot upload window |
| 02:00, 14:30 daily | M21 | Freshness check cron |
| 18:00 daily | M22 | **Hard cutoff** CN demand adjustment |
| 23:00 daily | M21→M27 | **Nightly DRP chain kickoff** |
| Mon 06:00 weekly | M28 | Feedback run (1× per week) |
| Manual | Planner | Re-run M23/M24, force override stale gate |

---

## 3. Module specs (gọn)

### M21 — Data Sync & Freshness Gate

**Input:** NM upload supply snapshot (template từ M00, 2×/day).
**Logic:**
- `freshness = NOW − last_sync_at` per (nm_id, location).
- ≤ 24h → FRESH, DRP tiếp tục.
- > 24h → STALE → block DRP (`plan_run.status=BLOCKED_STALE`), alert.
- SC Manager force override → `is_stale_override=TRUE` + audit.
- Grace period 3 ngày: rows pre-M21 (`is_legacy_data=TRUE`) không bị gate cho đến khi backfill xong.

**Output:** `supply_snapshot` (EXT, +`nm_id`, `synced_at`, `source`, `is_estimated`, `is_legacy_data`), `sync_log`.
**Contract:** `getFreshness(scope)` → {status, lastSyncAt, blockedItems}.

### M22 — CN Demand Adjustment & Trust Score

**Input:** M11 locked FC (phased weekly = monthly/4.33), CN adjustment submitted ≤ 18:00.
**Logic:**
1. CN submit `adjusted_qty` với `reason_code` (lookup `reason_code` table).
2. `delta_pct = |adjusted − original| / original`.
3. **Auto-approve gate** (M10):
   - `trust_score ≥ 85%` → auto-approve
   - `trust_score 60–85%` → SC Manager review
   - `trust_score < 60%` → BLOCKED, hard reject
4. `delta_pct > 30%` → hard reject bất kể trust.
5. Phase 1 grace: tất cả CN đều `is_grace_period=TRUE`, badge UI hiển thị "đang tích lũy data".

**Trust score formula (M28 refresh weekly):**
```
window = 12 tuần rolling
accuracy_pct = (rows is_accurate=TRUE) / total_samples × 100
is_accurate = TRUE nếu |adjusted − actual_sales| / actual_sales ≤ tolerance
```

**Output:** `cn_demand_adjustment`, `trust_score` (1 row per CN), `reason_code` (lookup).
**Contract:** `getEffectiveDemand(weekStart)` → adjusted nếu APPROVED, fallback FC raw.

### M23 — DRP Netting v2 + SS CN

**Input:** M22.adjusted_demand, M21.supply_snapshot, M10 policy, optional M16.allocatable.
**Logic 10 step:**
```
1. Validate freshness (R2 — abort nếu BLOCKED_STALE)
2. Create policy_run snapshot (Rule 14 — pin all configs + overrides)
3. Create plan_run với policy_run_id FK
4. Foreach (cn, sku, week):
   - effective_demand = M22.getEffectiveDemand() ?? FC raw từ M11
5. Read hub_available:
   - Phase 1 default: Σ supply_snapshot.qty (gross)
   - IF flag m16_hub_virtual_feeds_drp=TRUE: read M16.allocatable
6. Compute SS_cn per cell:
   σ_final  = MAX(σ_rolling_12w, σ_seasonal_2yr)
   z        = sku_cn_mapping.z_override ?? M10 default 1.65
   LT_hub   = transport_lane.transit_lt_days WHERE lane HUB→CN
   SS_base  = z × σ_final × √LT_hub
   SS_final = lcnb_enabled ? SS_base × (1 − 0.25) : SS_base
   SS_floor = mean_demand_12w × 0.05    (C1 fix khi σ≈0)
   SS_final = MAX(SS_final, SS_floor)
   IF override explicit → SS_final = sku_cn_mapping.ss_override
7. Per-CN netting:
   net_demand = effective_demand − on_hand − in_transit + SS_final
   status = NORMAL | OVER_STOCK (net<0) | STOCKOUT_RISK (net>hub_available)
8. Variant breakdown suggestion (gợi ý, M27 final say)
9. Save drp_cn_line
10. Trigger M24
```

**Anti double-allocation:** trips status=HELD đã reserve qty → M23 KHÔNG alloc lại số đó (M25 reservation lifecycle).

**Output:** `plan_run` (EXT +`policy_run_id`, +`is_stale_override`, +`BLOCKED_STALE` status), `policy_run`, `ss_cn`, `drp_cn_line`.
**Contract:**
- `SsCnService.computeSsCnFormula(input): number` — PURE, M28 dùng để compute σ→ss_new
- `SsCnService.refresh(plan_run_id)` — write-back, M23 nightly tự gọi (đọc sigma_history mới)

### M24 — Allocation LCNB v2

**Input:** M23.drp_cn_line (planned_order_release).
**Logic:**
- **Source priority:**
  1. NEAREST_FIRST (distance ≤ M10 `lcnb.max_distance_km=500`)
  2. FIFO theo `lot_attribute.production_date`
  3. Fair-share proportional khi không đủ
  4. SS guard: không vi phạm `ss_cn_donor` (R7 BUG-02 fix)
  5. Variant match priority

- **`allocation_leg`** (multi-source per result, BUG-02 fix):
  - `source_type` ∈ HUB · CN_LCNB · NM · TOP_UP_NEXT_WEEK (M25 cross-link)
  - `source_period_start` cho top-up từ tuần forecast khác
  - `origin_top_up_id` audit link về suggestion gốc

- **Status:** FULL · PARTIAL · PARTIAL_STOCKOUT · UNALLOCATED
- **`planner_review_required=TRUE`** khi: variant mismatch / partial stockout / LCNB far donor.

**Output:** `allocation_run` (EXT +`plan_run_id`), `allocation_result` (EXT), `allocation_leg`.
**Contract:** `getAllocationByPlan(plan_run_id)` → results + legs.

### M25 — Transport Lot Sizing v2

**Input:** M24.allocation_result, M26.atp_check, M10 transport config.
**Logic:**
1. **Container packing** per pallet/weight cap → `fill_ratio = MAX(pallets_pct, weight_pct)`.
2. **Hold-or-ship decision:**
   ```
   IF fill_ratio ≥ 0.6 (M10):                SHIP
   ELSE IF HSTK > LT + buffer_days:          HOLD 2 days (top-up window)
   ELSE:                                     SHIP anyway (urgent)
   ```
3. **Top-up suggestion** khi HOLD: gợi ý items thêm vào để đạt ≥ 60% trước hold deadline. SC Manager accept → tạo allocation_leg mới với `source_type=TOP_UP_NEXT_WEEK`.
4. **Multi-drop** (Phase 1 UNLOAD only): 1 trip có nhiều `transport_trip_stop`, `transport_trip_line.stop_id` map item→stop.
5. **Reservation:** `supply_snapshot_line.reserved_for_transport` (line-level C1 fix). Trips HELD → reserve qty, daily 04:00 cron reconcile drift > 1% → alert.

**Output:** `transport_trip` (EXT +`fill_ratio`, +`hold_decision`, +HELD status), `transport_trip_stop`, `transport_trip_line` (EXT +stop_id), `top_up_suggestion`.
**Contract:** `getTripsByPlan(plan_run_id)`, `acceptTopUp(suggestionId)`.

### M26 — NM ATP Check & Honoring

**Input:** M21.supply_snapshot (NM side), M24.allocation_result (planned PO to NM).
**Logic:**
- **ATP per (nm_id, sku_id, period_start):**
  ```
  atp_qty = nm_on_hand + nm_inbound − reserved_other
  status = atp_qty ≥ requested_qty ? PASS
         : atp_qty > 0             ? PARTIAL
         :                           FAIL
  ```
- **Urgency rank** dựa HSTK_cn (CN nào tồn thấp nhất → ưu tiên cao).
- **NM honoring rate** (monthly metric, M28 backfill):
  ```
  honoring = Σ delivered_qty / Σ atp_at_check_time   (rolling 3 months)
  Threshold < 80% → flag NM unreliable badge
  ```

**Output:** `atp_run` (wrapper), `atp_check`, `nm_honoring_rate`.
**Contract:** `getAtpStatus(cn_id, sku_id, plan_run_id)`, `HonoringRateService.recompute(month)`.

### M27 — PO/TO Review (REBUILD)

**Input:** M25.transport_trip, M26.atp_check.
**Lifecycle:** DRAFT → REVIEW → CONFIRMED → SENT → DELIVERED · CANCELLED.
**Tách rõ:**
- **PO** (Purchase Order): NM → Hub
- **TO** (Transfer Order): Hub → CN (link tới `transport_trip`)

**Logic:**
- 1 `po_run` wrapper → nhiều `po_header`/`to_header` per NM/route.
- `po_line` composite unique `(po_header_id, sku_id, COALESCE(variant_code,''))` (H5 CTO fix — vì PG NULL≠NULL).
- **Planner override:** mọi edit phải có `reason_code` → ghi `po_edit_log` / `to_edit_log`.
- **PO tracking 1-1:** `po_tracking` (lifecycle events: DISPATCHED → IN_TRANSIT → DELIVERED → DELAYED). `lt_actual_days` từ tracking → M28 feedback.
- Soft-delete khi qty=0 → `status=CANCELLED` (không DROP row).

**Output:** `po_run`, `po_header`, `po_line`, `to_header`, `to_line`, `po_edit_log`, `to_edit_log`, `po_tracking`.
**Contract:** `getPoFulfillment(poId)`, `getActualLtPerNmRoute()`.

### M28 — Feedback & Closed Loop

**Cadence:** Weekly Mon 06:00 VN (sau khi tuần trước Mon-Sun đã close).
**9-step pipeline (try/catch per step, 1 fail không kill toàn run):**

```
1. Validate week boundary (idempotent: 1 weekly_kpi_snapshot per week_start_date)
2. Fetch actual_sales từ M9.plan_actual + ATP/honoring từ M26 + edit log từ M27
3. SS auto-adjust:
   - σ_new = recompute σ_demand 12w từ M9 actual (precedence) hoặc demand_snapshot fallback
   - ss_new = M23.SsCnService.computeSsCnFormula(...)   ← PURE
   - delta_pct = |ss_new − ss_old| / ss_old × 100
   - IF delta_pct > 50% → CAP ở ±50%, log capped=TRUE (R12 stability)
   - IF delta_pct > 20% → alert WARNING
   - INSERT sigma_history {cn, sku, sigma=σ_new, source='M28_AUTO_WEEKLY'}
   - INSERT ss_adjustment_log
   - ⚠ KHÔNG ghi ss_cn trực tiếp. M23 nightly D+1 gọi SsCnService.refresh() đọc sigma_history latest và ghi ss_cn row mới.
4. LT auto-update (R3 safety gate qua M00):
   - lt_actual_avg = rolling 6 tháng từ po_tracking.lt_actual_days
   - delta > 30% → KHÔNG auto-apply, increment supplier.lt_drift_count
   - drift_count ≥ 3 lần liên tiếp → force apply + alert
   - delta ≤ 30% → auto-apply, reset drift counter
   - Gọi M00.LaneService.updateTransitLt() / SupplierService.updateLeadTime() (KHÔNG UPDATE trực tiếp)
   - INSERT lt_actual_log
5. Trust score refresh:
   - Backfill cn_demand_adjustment.actual_qty + is_accurate cho rows tuần trước
   - Gọi M22.TrustService.refresh(cnId) (M22 owner, M22 ghi trust_score)
   - Khi đủ 12w samples → set trust_score.is_grace_period=FALSE
6. NM honoring backfill:
   - Gọi M26.HonoringRateService.recompute(month)
   - M26 ghi nm_honoring_rate.fulfilled_total
7. Override analysis:
   - Top 5 reason_code từ po_edit_log tuần qua → INSERT override_analysis
8. Weekly KPI report:
   - Compute fill_rate, OTIF, FC_MAPE, trust_avg, honoring_avg, ss_accuracy, atp_pass_rate
   - Aggregate vào weekly_kpi_snapshot.report_blob (JSONB)
9. Alerts:
   - fill_rate < 85% liên tục 2 tuần → alert SC Manager
   - NM honoring < 80% over 12w → flag NM unreliable badge cho M26 UI
```

**Output:** `weekly_kpi_snapshot` (wrapper), `sigma_history`, `ss_adjustment_log`, `lt_actual_log`, `override_analysis`.
**Contract:** `getKpiReport(week)` → snapshot + KPI breakdown.

---

## 4. Rule 14 — Ownership (CRITICAL)

```
M28 writes own tables ONLY:
  sigma_history · ss_adjustment_log · lt_actual_log · override_analysis · weekly_kpi_snapshot

M28 calls owner services for write-back:
  → M23.SsCnService.refresh(plan_run_id)             // M23 ghi ss_cn
  → M00.LaneService.updateTransitLt(...)             // M00 ghi transport_lane
  → M00.SupplierService.updateLeadTime(nmId, ...)    // M00 ghi supplier
  → M22.TrustService.refresh(cnId)                   // M22 ghi trust_score
  → M26.HonoringRateService.recompute(month)         // M26 ghi nm_honoring_rate
```

**Lý do:** mỗi table có 1 owner duy nhất → audit log + drift gate + validation tập trung. M28 = publisher σ, không phải writer ss_cn.

---

## 5. Rule 14 cũng áp cho policy_run pinning (M23)

Tất cả config M10 + sku_cn_mapping override + LT + σ tại thời điểm run đều snapshot vào `policy_run.config_snapshot` (JSONB). M23/M24/M25 đọc từ snapshot này, KHÔNG đọc active runtime → tránh baseline drift giữa các run cùng ngày.

---

## 6. Feature flags

```
m21_data_sync_v2_enabled           m25_transport_v2_enabled
m22_cn_demand_adjust_enabled       m26_nm_atp_enabled
m23_drp_netting_v2_enabled         m27_po_rebuild_enabled
m24_allocation_lcnb_enabled        m28_feedback_loop_enabled

m16_hub_virtual_feeds_drp          ← cross-flow gate (Flow 1 → Flow 2)
```

---

## 7. Data tables (canonical)

| Module | Tables |
|--------|--------|
| M21 | `supply_snapshot` (EXT), `sync_log` |
| M22 | `cn_demand_adjustment`, `trust_score`, `reason_code` |
| M23 | `plan_run` (EXT), `policy_run`, `ss_cn`, `drp_cn_line` |
| M24 | `allocation_run` (EXT), `allocation_result` (EXT), `allocation_leg` |
| M25 | `transport_trip` (EXT), `transport_trip_stop`, `transport_trip_line` (EXT), `top_up_suggestion` |
| M26 | `atp_run`, `atp_check`, `nm_honoring_rate` |
| M27 | `po_run`, `po_header`, `po_line`, `to_header`, `to_line`, `po_edit_log`, `to_edit_log`, `po_tracking` |
| M28 | `weekly_kpi_snapshot`, `sigma_history`, `ss_adjustment_log`, `lt_actual_log`, `override_analysis` |

---

## 8. Key business rules (đừng quên)

1. **Freshness gate là hard gate:** > 24h stale → DRP block, không silent run.
2. **Policy pinning Rule 14:** Mỗi plan_run có policy_run_id snapshot. Đừng đọc active config runtime.
3. **σ_demand 2 nguồn:** rolling 12w + seasonal 2yr → MAX. Buffer cho seasonality.
4. **SS_cn floor 5%:** Khi σ≈0 (Phase 1 thiếu actual) → SS = mean_demand × 0.05 tránh over-alloc.
5. **LCNB SS reduction 25%:** Khi LCNB enabled, SS_cn giảm 25% vì có thể vay từ CN gần.
6. **Anti double-allocation:** Trips HELD đã reserve → M23 không alloc lại số đó.
7. **M27 PO line unique trick:** `COALESCE(variant_code, '')` trong unique index vì NULL≠NULL trong PG.
8. **M28 ownership Rule 14:** KHÔNG UPDATE trực tiếp bảng ngoài scope. Dùng owner service.
9. **SS adjustment cap 50%/tuần:** R12 stability — không tăng/giảm > 50% trong 1 weekly run.
10. **LT update drift gate 30%:** Delta > 30% → drift count, ≥ 3 lần → force apply.

---

*FLOW-2-SPEC.md — 2026-04-28*
