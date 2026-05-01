# E2E Testing Playbook — UNIS SCP với Real Data

> **Version:** 1.0 · **Created:** 2026-04-22 · **Owner:** Techlead (pair-programming Cascade + User)
> **Scope:** Quy cách từng bước để test **DATA → API → UI** toàn bộ 28 module bằng dữ liệu thật,
> có thể fix API / SQL / UI / Config ngay trong quá trình test.
> **Prerequisites:** Đọc `docs/DATA-FLOW.md`, `docs/PROJECT-STATUS.md`, `docs/report-*/README.md`.

---

## 1. Mục tiêu & Nguyên tắc

### 1.1 Mục tiêu
Playbook này không phải là unit test / e2e automation. Nó là **quy trình vận hành chung**
cho những buổi pair-programming test hệ thống với dữ liệu thật của khách hàng, trong đó:
- Lỗi phát sinh bất kỳ layer nào (API / SQL / UI / Config / Contract cross-module) đều được **fix ngay**.
- Dữ liệu được xử lý **incremental theo module** (test tới đâu mapping + import tới đó).
- Mỗi session có thể dừng và tiếp tục được qua file `progress.txt` ở root workspace.

### 1.2 Nguyên tắc vàng (HARD RULES)
1. **Wipe fake data trước khi test real data** — không trộn seed test với data thật.
2. **Giữ 7 bảng whitelist:** `users`, `roles`, `user_roles`, `system_config`, `feature_flag`, `config_audit_log`, `reason_code`.
3. **Thứ tự test = thứ tự dependency:** M00 (master) → M10 (config) → M21 (supply) → M22 → M23 → M24 → M25 / M26 → M27 → M28. Flow 1 (M11–M17) test song song sau khi M00 xong.
4. **Feature flag default FALSE** sau seed. Phải bật flag đúng module trước khi trigger.
5. **Rule 14 — Policy pinning:** không bao giờ UPDATE trực tiếp `policy_run` snapshot; nếu cần đổi policy → tạo run mới.
6. **M28 ownership:** M28 ghi `sigma_history` + gọi owner service, không UPDATE chéo bảng của module khác.
7. **Destructive commands (TRUNCATE, DROP, UPDATE không WHERE) luôn cần xác nhận 2 lần** — dry-run trước, execute sau.
8. **Idempotency-key bắt buộc** khi gọi endpoint mutate (M23 `POST /run`, M27 `POST /confirm`, v.v.).
9. **KHÔNG auto-round MOQ** — import cho phép warning nhưng không silently chỉnh số.
10. **Không đọc bảng cross-module** — chỉ gọi getter service public. Ngoại lệ duy nhất: M00 entities được read trực tiếp.

---

## 2. Roles & Responsibilities

| Role | Làm | Không làm |
|------|-----|-----------|
| **Techlead (Cascade)** | Đọc/sửa code BE+FE+SQL, chạy psql/curl/npm (cần user approve), viết helper scripts, verify kết quả, fix bug tại chỗ | Không auto-run destructive command, không đoán credential, không sửa spec khi chưa xác nhận |
| **User (CEO / PO / Dev owner)** | Cung cấp real data (CSV/XLSX/SQL dump), approve command, xác nhận business rule khi spec mơ hồ, quyết định priority khi fix bug | Không phải viết code (trừ khi muốn), không phải nhớ convention |

### Communication contract
- User chỉ approve command, không cần đọc hiểu code.
- Techlead chỉ viết code minimal để fix bug, không refactor ngoài scope.
- Khi uncertainty về business rule → Techlead hỏi trước khi code.

---

## 3. Environment Preflight Checklist

Phải verify đủ 6 mục dưới **mỗi khi mở session mới**, nếu thiếu cái nào thì fix trước khi import data.

### 3.1 Runtime alive
```bash
# 1. BE healthcheck
curl.exe -s -o NUL -w "BE: %{http_code}\n" http://localhost:3002/api/docs
# expect: BE: 200

# 2. FE healthcheck
curl.exe -s -o NUL -w "FE: %{http_code}\n" http://localhost:3001/login
# expect: FE: 200

# 3. DB connection (qua Node pg vì Windows có thể thiếu psql)
node backend/scripts/_db-inspect.js
# expect: output "Total public tables: XX"
```

### 3.2 Auth working
```bash
curl.exe -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
# expect: {"accessToken":"...","refreshToken":"...","user":{...}}
```

### 3.3 Config completeness (system_config ≥ 26 keys)
```bash
node backend/scripts/_db-check-config.js
# expect: system_config rows >= 26, feature_flag rows >= 14
# Nếu thiếu → re-apply migration:
node backend/scripts/_db-apply-m10-config.js
```

### 3.4 Feature flag đúng trạng thái
Các flag quan trọng **phải enable** trước khi test module tương ứng:
- `m00_master_data_enabled` · `m00_csv_import_enabled` · `m00_audit_log_enabled`
- `m11_demand_v2_enabled` · `m12_saop_consensus_enabled` · `m13_prod_lot_sizing_enabled`
- `m14_fc_commitment_enabled` · `m15_nm_response_enabled` · `m16_hub_virtual_enabled`
- `m17_gap_scenario_enabled` · `m22_cn_demand_adjust_enabled` · `m23_drp_netting_v2_enabled`
- `m24_allocation_lcnb_enabled` · `m25_transport_v2_enabled` · `m26_nm_atp_enabled`
- `m27_po_rebuild_enabled` · `m28_feedback_loop_enabled`

Bật qua API (cần admin JWT):
```bash
curl.exe -X PATCH http://localhost:3002/api/v1/system-config/flags/m23_drp_netting_v2_enabled \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true}'
```
Hoặc qua UI `/system-config` tab **Feature Toggles**.

### 3.5 Reason_code lookup (M22)
```sql
SELECT code, label_vi, is_active FROM reason_code;
-- expect 6 rows: NEW_PROJECT, PROJECT_DELAY, COMPETITOR_PROMO, OWN_PROMO, WEATHER, OTHER
```

### 3.6 Policy snapshot readiness
Nếu sẽ chạy M23: verify bảng `policy_run` exist (schema; data rỗng là OK). Migration V004 phải apply xong.

---

## 4. Chiến lược xử lý Fake Data (Session 1 Bootstrap)

### 4.1 Inspect trước khi wipe
```bash
node backend/scripts/_db-inspect.js
```
In ra:
- `=== Tables WITH data ===` (bảng có rows)
- `=== Tables EMPTY ===`
- `=== Tables MISSING ===` (trong priority list nhưng schema không có)
- `=== OTHER non-empty tables ===` (bảng legacy hoặc rác)

### 4.2 Dry-run wipe
```bash
node backend/scripts/_db-wipe-fake.js
# không set CONFIRM_WIPE → chỉ in danh sách sẽ TRUNCATE
```

### 4.3 Execute wipe (destructive — cần user approve 2 lần)
```bash
$env:CONFIRM_WIPE='YES'; node backend/scripts/_db-wipe-fake.js
```
- TRUNCATE tất cả public tables KHÔNG thuộc whitelist 7 bảng.
- CASCADE để xử lý FK.
- RESTART IDENTITY để reset BIGSERIAL về 1.
- Trong 1 transaction BEGIN/COMMIT.

### 4.4 Verify post-wipe
Script tự động count lại và in `Wipe verified clean` nếu không còn bảng có data ngoài whitelist.

---

## 5. Vòng lặp chuẩn cho mỗi module — 3 Layer Loop

Với mỗi module Mxx, lặp 3 layer theo thứ tự cố định. Không bỏ qua layer.

```
┌─────────── LAYER 1: DATA ───────────┐
│ 5.1 Đọc spec M00/Mxx.md              │
│ 5.2 Xác định preconditions           │
│     (flags, master data, configs)    │
│ 5.3 User cung cấp real data          │
│ 5.4 Mapping real → CSV template      │
│ 5.5 Dry-run import (?dryRun=true)    │
│ 5.6 Fix validation errors tuần tự    │
│ 5.7 Commit import                    │
│ 5.8 Verify row count + quality       │
└──────────────┬───────────────────────┘
               ▼
┌─────────── LAYER 2: API ────────────┐
│ 5.9  Bật feature flag module         │
│ 5.10 Call trigger endpoint           │
│      (POST /run, POST /submit, ...)  │
│ 5.11 Check response status + body    │
│ 5.12 Query DB verify run artifact    │
│ 5.13 Call getter endpoints           │
│ 5.14 Check cross-module contract     │
│      (qua public getter service)     │
└──────────────┬───────────────────────┘
               ▼
┌─────────── LAYER 3: UI ─────────────┐
│ 5.15 Mở page /<module>               │
│ 5.16 Verify list / detail / action   │
│ 5.17 Test 3 tabs (review/hist/cfg)   │
│ 5.18 Test edge case (empty, error)   │
│ 5.19 Responsive + dark mode spot     │
└──────────────────────────────────────┘
```

### 5.1 Đọc spec
- Mỗi module có file `docs/specs/Mxx-*.md` + `docs/report-Mxx/README.md`.
- Lấy: mục tiêu BA, DB schema, API endpoints, UI pages, test coverage có sẵn.

### 5.2 Preconditions
- Master data cần có (ví dụ M23 cần ≥1 NM, ≥1 CN, ≥1 SKU, sku_nm_mapping).
- Feature flag phải ON.
- Config keys liên quan (ví dụ M22 cần `cn_adjust.tolerance_pct`, M24 cần `lcnb.max_distance_km`, v.v.).

### 5.4 Mapping real → template
Pattern chung:
```
Real column              → UNIS column
────────────────────────────────────────
"Mã NPP" / "MaKH"       → cn_code
"Tên chi nhánh"         → cn_name
"Miền"                   → region (Nam/Trung/Bắc)
"Kinh độ" / "Vĩ độ"     → lng / lat  (CRITICAL — thiếu sẽ fail LCNB)
"Mã NM"                  → supplier_code (VARCHAR, keep as string)
"LT ngày"                → lead_time_days (integer)
"MOQ m²"                 → moq (number, không auto-round)
```
Trường hợp data thật thiếu field:
- `lat/lng` → dùng Google Maps geocoding hoặc user cung cấp manual list.
- `region` → infer từ địa chỉ.
- `moq` → default 500 nếu không rõ + flag WARN.
- `product_group` → default `CERAMIC` nếu UNIS chỉ bán 1 nhóm.

### 5.5 Dry-run import
```bash
curl.exe -X POST "http://localhost:3002/api/v1/master-data/import/supplier?dryRun=true" \
  -H "Content-Type: text/csv" \
  -H "x-user-id: admin" \
  --data-binary "@sample-data/suppliers.csv"
```
Response:
```json
{ "total": 50, "valid": 45, "errors": [{"row": 3, "message": "supplier_code is required"}], "imported": 0 }
```
Sửa CSV cho đến khi `valid === total` và `errors === []`.

### 5.6 Commit
Bỏ `?dryRun=true`. Import thật. Ghi audit log tự động.

### 5.8 Verify post-import
```bash
# Row count
curl.exe "http://localhost:3002/api/v1/master-data/suppliers?page=1&pageSize=1" | jq '.total'

# Data quality
curl.exe http://localhost:3002/api/v1/master-data/quality
# { "skuNoNmMapping": 0, "channelNoLatLng": 0, "supplierNoSkuMapping": 5, "skuNoRecentSupply": 50 }
```
- `skuNoNmMapping > 0` → fix mapping.
- `channelNoLatLng > 0` → fix lat/lng.
- `supplierNoSkuMapping > 0` → chưa có SKU map, OK cho tới lúc import SKU.

---

## 6. Per-Module Test Sequence

Mỗi module dưới đây đưa ra **cụ thể**: preconditions, test data tối thiểu, trigger, verify, common failure.

### 6.1 M00 — Master Data (FOUNDATION)
**Preconditions:** chỉ cần config + feature flag m00_*_enabled.
**Thứ tự import (bắt buộc vì FK):**
1. `supplier` (NM)
2. `channel` (CN) — bắt buộc `lat/lng`
3. `hub` (≥1 hub `hub_type=VIRTUAL` cho Phase 1)
4. `sku` (kèm `nm_code` mapping 1-1) + `sku_variant` (optional)
5. Mapping phụ: `sku_cn_mapping` (SS override), `hub_cn_cluster`, `hub_nm_assignment`, `transport_lane`

**Minimum real data set:**
- ≥3 NM, ≥5 CN, 1 Hub, ≥10 SKU, transport_lane cho mọi cặp NM↔CN (và NM↔Hub nếu có).

**Verify:**
- `GET /master-data/quality` — tất cả 4 field = 0 hoặc có lý do business.
- `SELECT COUNT(*) FROM sku_nm_mapping WHERE active = true` = số SKU (single-source rule).

**Common failures:**
- `channel_no_lat_lng > 0` → LCNB sẽ fail → stop, fix trước.
- `supplier_code` trùng nhưng case khác → DB là case-sensitive, normalize trước khi import.
- `sku_nm_mapping` thiếu → M23 load requested qty sẽ rỗng.

**UI check:** `/master-data` — 4 tabs (SKU, CN, NM, Hub), search + filter, import CSV modal.

---

### 6.2 M10 — Config & Feature Flags
**Preconditions:** ADMIN JWT.
**Actions:**
- `PATCH /system-config` batch update — test cross-field (commit.hard < firm < soft).
- `PATCH /system-config/flags/:key` — toggle from TRUE↔FALSE.
- `GET /system-config/audit` — verify mỗi thay đổi ghi `config_audit_log`.

**Common failures:**
- Cross-field validation fail → 400 `commit.hard must be < commit.firm`.
- `value_type=json` nhưng string gửi không phải JSON hợp lệ → 400.

**UI check:** `/system-config` — 4 tabs (Planning Params, Plugin Params, Feature Toggles, System).

---

### 6.3 M21 — Supply Sync & Freshness Gate
**Preconditions:** M00 done (supplier active + hub + sku).
**Test data:** 1 CSV supply per NM, format:
```
sku_code,sku_name,uom,available_qty,atp_qty,last_updated
SKU-001,Gạch 60x60 A4,m2,500,400,2026-04-22T08:00:00
```

**Test sequence:**
1. `GET /supply/sync/template/:nmCode` — download CSV template.
2. `POST /supply/nm-upload/:nmCode` — upload CSV.
3. `GET /supply/sync/dashboard` — per-NM status (FRESH/STALE/MISSING).
4. `GET /supply/freshness/gate` — expect `{canRun: true}` nếu mọi NM fresh.
5. Simulate stale: set `planning.max_stale_minutes=1` tạm thời → gate trả `canRun:false`.
6. `POST /supply/sync/override` với `reason ≥ 20 chars` → ghi `drp_override_log`.

**Common failures:**
- CSV header sai tên cột → 400.
- Supply row ghi nhưng `nm_code` FK invalid (NM chưa tồn tại) → 400.
- Cron 06:00/14:00 không chạy → check `data-sync.service.ts` `setTimeout` loop.

**UI check:** `/supply` — existing M2 page, M21 extend backend only.

---

### 6.4 M22 — CN Demand Adjustment + Trust Score
**Preconditions:** M00 done, M21 done, M10 config CN_ADJUST + TRUST_SCORE đủ.
**Test sequence:**
1. `GET /cn-adjust/reason-codes` — verify 6 rows lookup.
2. CN submit trước cutoff 18:00 VN:
   ```
   POST /cn-adjust
   { "cnId": 1, "skuId": 1, "periodDate": "2026-04-27",
     "fcQty": 100, "adjustedQty": 120, "reasonCode": "OWN_PROMO" }
   ```
   - `delta_pct = 20%` ≤ `tolerance_pct=30` và trust default=100 ≥ 85 → expect `AUTO_APPROVED`.
3. Test force submit (SC Manager bypass cutoff):
   ```
   POST /cn-adjust/force { ..., "reasonText": "Urgent promo change per CEO decision today 10am" }
   ```
4. Cutoff cron 18:05 → expire PENDING rows.
5. `GET /cn-adjust/effective-demand?weekStart=2026-04-27` — M23 consumes.

**Common failures:**
- `delta > tolerance` nhưng không có `reason_text` → 400.
- Submit sau cutoff mà không dùng `/force` → 400.
- Re-submit same (cn, sku, period) → partial unique index guard (expire old + insert new).

**UI check:** `/cn-demand-adjust` — 3 tabs (Queue/History/Trust), submit modal.

---

### 6.5 M23 — DRP Netting v2
**Preconditions:** M00+M21+M22 done, flag `m23_drp_netting_v2_enabled=true`.
**Test sequence:**
1. `POST /drp/run` header `Idempotency-Key: <uuid>` — trigger 10-step pipeline.
2. Expect response: `{ planRunId, policyRunId, status: "RUNNING" }`.
3. Poll `GET /drp/runs/:id` until `status ∈ {COMPLETED, BLOCKED_STALE, FAILED}`.
4. Query `drp_cn_line WHERE plan_run_id = X` — verify per (cn, sku, period).
5. `GET /drp/runs/:id/policy` — Rule 14 snapshot.

**Common failures:**
- FreshnessGate block vì M21 STALE → override với reason hoặc refresh supply.
- Plan_run có nhưng drp_cn_line rỗng → check M22.getEffectiveDemand contract.
- σ_final = 0 → M28 chưa publish sigma_history → fallback formula fail; sẽ dùng rolling demand thôi.
- LCNB disabled → ss_after_lcnb = ss_base (không giảm 25%).
- Variant suggestion rỗng → SKU chưa có variant → warning không fail.

**UI check:** `/drp-netting-v2` — DRP run list + detail matrix (cn × sku × week).

---

### 6.6 M24 — Allocation LCNB
**Preconditions:** M23 run COMPLETED, `lcnb.enabled=EXECUTE` (hoặc DETECT_ONLY).
**Test sequence:**
1. `POST /allocation/run` `{ planRunId: X }` — expect auto-fetch drp result với retry 5×30s.
2. Verify 3-tier waterfall:
   - `allocation_result.status ∈ {FULL, PARTIAL, PARTIAL_STOCKOUT, UNALLOCATED}`.
   - `allocation_leg` có >1 row nếu LCNB transfer xảy ra.
3. `GET /allocation/runs/:id/lcnb-review` — SC manager review queue (`planner_review_required=true`).

**Common failures:**
- Race: plan_run chưa flush → retry kicks in; nếu 5×30s still fail → check M23.
- Distance haversine fail do `channel.lat/lng` null → đã fix từ M00 quality.
- `max_transfer_pct=0.80` quá rộng → excess bị rút cạn → FIFO theo `is_critical` + `hstk_days`.
- Variant mismatch → `allocation_result.variant_breakdown` JSONB có flag.

**UI check:** `/allocation-lcnb` — tab Results / Legs / LCNB Review.

---

### 6.7 M25 — Transport Lot Sizing v2
**Preconditions:** M24 run COMPLETED, `vehicle_type` table có ≥1 row, `carrier` có ≥1 row.
**Test sequence:**
1. `POST /transport/plan` `{ allocationRunId: X }`.
2. Verify:
   - `transport_trip.fill_ratio = MAX(pallet_fill, weight_fill)`.
   - Nếu `fill_ratio < 0.6`: `hold_decision` ∈ {HELD, FORCE_SHIP_LOW_FILL}.
   - Multi-drop: `transport_trip_stop` >1 rows với same `trip_id`.
   - `top_up_suggestion` có row nếu trip HELD.
3. `supply_snapshot_line.reserved_for_transport` tăng sau reservation.
4. Cron 06:00: trip HELD quá `hold_max_days` → auto release.

**Common failures:**
- `vehicle_type` rỗng → NO_VEHICLE error → import vehicle_type trước.
- `carrier` rỗng → M27 AND gate sẽ BLOCKED_INCOMPLETE.
- Union-find multi-drop > `max_multidrop_distance_km=200` → không gộp.
- Reservation không release khi trip cancel → leak `reserved_for_transport`.

**UI check:** `/transport-v2` — trip list + stop breakdown + fill ratio visualization.

---

### 6.8 M26 — NM ATP Check
**Preconditions:** M24 COMPLETED. (M25 không là dependency của M26.)
**Test sequence:**
1. `POST /nm-atp/run` `{ allocationRunId: X }`.
2. Classification 4 loại:
   - `BLOCKED` = stale data (không phải zero stock).
   - `PASS` = atp ≥ requested.
   - `PARTIAL` = 0 < atp < requested → urgency ranking.
   - `FAIL` = atp = 0.
3. `is_atp_null_fallback=true` khi `atp_qty IS NULL` → dùng `allocatable_qty`.
4. Urgency CRITICAL khi `hstk_days < transit_lt_days` (days dimension, không phải qty).
5. `GET /nm-atp/honoring/leaderboard` — Phase 1 trả NULL vì M27 chưa có actual data.

**Common failures (C1-C4, H1-H6 đã fix):**
- BLOCKED ≠ FAIL (H1) — không được gộp.
- Urgency sort sai thứ tự — must be `is_critical DESC → hstk_days ASC → cn_code ASC`.
- Honoring rate denominator sai — must = `atp_at_check_total`, KHÔNG phải `requested` (C4).

**UI check:** `/nm-atp` — 3 tabs (Results/Critical/Leaderboard).

---

### 6.9 M27 — PO / TO Review Rebuild
**Preconditions:** M25 và M26 cùng COMPLETED cho cùng `allocationRunId` → AND gate pass.
**Test sequence:**
1. Auto-trigger qua event `m25_done ∧ m26_done` → `po_run_pending` consumed → `po_run` tạo.
   Hoặc manual `POST /po-review/run` `{ allocationRunId }`.
2. Verify hard gates:
   - NO_CARRIER → `po_run.status=BLOCKED_INCOMPLETE`.
   - M26 chưa COMPLETED → `po_run.status=BLOCKED_ATP`.
3. PO lifecycle 5 states: `DRAFT → CONFIRMED → SHIPPED → RECEIVED → CLOSED | CANCELLED`.
4. Edit: `PATCH /po-review/po/:id/line/:lineId` → ghi `po_edit_log` mandatory.
5. `POST /po-review/po/:id/confirm` header `Idempotency-Key` — double-click safe.
6. Cron 09:00: CONFIRMED > 7 days chưa SHIPPED → alert `PO_OVERDUE`.

**Common failures:**
- PO line duplicate SKU same variant → `ON CONFLICT` should increment `requested_qty`.
- ATP clamp sai: PARTIAL cell phải clamp `qty = min(requested, urgencyRanking.atpAlloc)`.
- Idempotency key reuse → 409 response (đúng spec).

**UI check:** `/po-review` — PO list + edit dialog + confirm modal + tracking drawer.

---

### 6.10 M28 — Feedback Closed Loop
**Preconditions:** M27 đã có ≥1 PO RECEIVED (có `actual_received_qty`). Lý tưởng ≥5 PO per (NM, route) cho LT rolling 6M.
**Test sequence:**
1. `POST /feedback/run` manual (thay vì chờ Mon 06:00).
2. 9-step pipeline — try/catch → COMPLETED_PARTIAL nếu step nào fail.
3. Verify:
   - `sigma_history` mới với `source=M28_AUTO_WEEKLY`.
   - `ss_adjustment_log` có `capped=true` nếu delta > ±50%.
   - `lt_actual_log` → nếu delta > 30% → `DRIFT_BLOCKED` + `drift_count++`.
   - `weekly_kpi_snapshot` có row mới.
4. M23 next night: đọc `sigma_history` latest → ghi `ss_cn` mới.

**Common failures:**
- M28 UPDATE trực tiếp `ss_cn` → VI PHẠM Rule 14 ownership. Fix: chỉ INSERT `sigma_history`.
- LT sample size < `lt_min_sample_size=5` → skip update.
- Drift count đã = 3 → auto FORCE_APPLY kể cả delta > 30%.

**UI check:** `/feedback-loop` — dashboard KPI + SS adjustment log + LT drift table.

---

### 6.11 Flow 1 — M11 → M17 (Monthly Booking)
Test song song với Flow 2 sau khi M00 xong. Thứ tự:
- **M11** Demand aggregation v2 → verify `demand_snapshot` (level=TOTAL + CN), `b2b_deal` stages.
- **M12** S&OP consensus → 2-tier (SC Manager TOTAL, CN Manager CN), lock cycle Day 10.
- **M13** Production lot sizing → `booking_plan.final_qty`, `ss_hub`.
- **M14** FC commitment → split Hard/Firm/Soft theo tolerance_pct, version++.
- **M15** NM response 3-field (response_type / sla_state / sc_decision), SLA Day+3/+5.
- **M16** Hub ảo → `hub_available = confirmed − released`, `allocatable = MAX(0, hub_available − ss_hub)`. Flag `m16_hub_virtual_feeds_drp` để cross-flow M23.
- **M17** Gap snapshot 3-view (RELEASE/NM/HUB), scenario A-D, carry forward.

Common failures chung Flow 1:
- Variance Σ(CN) vs TOTAL > ±10% → M12 block lock.
- `commit.hard/firm/soft` tolerance cross-field fail → M10 validation.
- NM không reply trước SLA Day+5 → auto ESCALATED.
- M16 allocatable âm → clamp về 0.

---

## 7. Bug Classification & Fix Protocol

Khi gặp bug, classify theo 5 loại, mỗi loại có fix protocol riêng:

### 7.1 BUG-API (NestJS controller / service / guard)
```
Symptoms: HTTP 4xx/5xx, DTO validation fail, business rule vi phạm.
Tool:     Read service + controller + DTO + spec → edit → hot-reload (npm run start:dev watch mode).
Verify:   curl lại endpoint → expected response.
Regression: thêm test case vào *.service.spec.ts nếu logic business.
```

### 7.2 BUG-SQL (schema / query / migration)
```
Symptoms: Column not exist, FK violation, unique constraint fail, query timeout.
Tool:     Viết migration UP + DOWN file mới (không sửa migration cũ). Apply qua Node pg.
Verify:   Query lại bằng Node script. Check index qua \d+ table_name equivalent.
Regression: Migration phải idempotent (IF NOT EXISTS, ON CONFLICT DO NOTHING).
```

### 7.3 BUG-UI (Next.js page / component / API client)
```
Symptoms: Render crash, type mismatch, data không hiển thị, dark mode sai.
Tool:     Read component + lib/api/xxx.ts + spec UI skill frontend/.claude/skills/unis-ui-scope-boundary.
Constraint (HARD): UI bug fix KHÔNG được đụng business logic, API endpoint, state management.
          Chỉ sửa render / style / type / fetch call shape.
Verify:   User screenshot, hoặc spin browser_preview + paste console log.
```

### 7.4 BUG-CONFIG (system_config / feature_flag)
```
Symptoms: Service fail vì `Cannot read property X of undefined`, flag chưa bật → 403.
Tool:     PATCH /system-config hoặc /flags/:key. Nếu key thiếu hoàn toàn → re-apply migration.
Verify:   GET /system-config/:group → key có mặt với đúng value_type.
Regression: Seed file migration phải chứa key mới.
```

### 7.5 BUG-CONTRACT (cross-module getter mismatch)
```
Symptoms: M24 nhận drp result rỗng dù M23 COMPLETED, M27 không nhận atp result, v.v.
Root cause: Cell key format khác nhau giữa module; DTO shape không match; Map vs Array.
Tool:     Check common/drp-utils.ts, common/allocation-constants.ts, common/atp-utils.ts.
          Đảm bảo cả producer và consumer dùng chung cellKey builder.
Verify:   Console.log cell key trong cả 2 service khi chạy.
Regression: Contract snapshot test — freeze DTO shape.
```

### Bug fix discipline (HARD)
1. Identify **root cause** trước khi code. Không fix symptom.
2. Ưu tiên fix **upstream** (service) hơn workaround downstream (controller/FE).
3. Fix minimal — 1 bug = 1 change nhỏ nhất có thể. Không refactor ngoài scope.
4. Test case regression nếu bug business-critical.
5. Commit message: `fix(Mxx): <root cause>` — không describe symptom.
6. Update `progress.txt` với bug-id + fix summary.

---

## 8. Helper Scripts Registry

Đặt tại `backend/scripts/_*.js` (underscore prefix = non-production, safe để xoá).

| Script | Purpose | Destructive? |
|--------|---------|--------------|
| `_db-inspect.js` | Đếm rows priority tables + missing + extras | No (read-only) |
| `_db-wipe-fake.js` | TRUNCATE 101 bảng non-whitelist CASCADE | **Yes** — cần `CONFIRM_WIPE=YES` |
| `_db-check-config.js` | Liệt kê system_config + feature_flag + reason_code | No |
| `_db-apply-m10-config.js` | Re-apply M10 extend 26-key migration | Partial — idempotent INSERT ON CONFLICT |
| `_db-audit-config.js` | Tìm duplicate config_key cross-group + legacy pollution | No |
| `_db-fix-trust-duplicates.js` | Xóa group `TRUST` legacy duplicate với `TRUST_SCORE` canonical (safety check value bằng nhau trước) | **Yes** — cần `CONFIRM_FIX=YES` |

**Template cho script mới:**
```js
const { Client } = require('pg');
(async () => {
  const c = new Client({
    host: 'localhost', port: 5432,
    database: 'unis_scp_flow1_test_20260421_01',
    user: 'postgres', password: 'postgres',
  });
  await c.connect();
  // ... read-only queries hoặc BEGIN/COMMIT nếu mutate
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
```

**Rule:** script nào mutate DB → **bắt buộc** có `CONFIRM_*` env guard + BEGIN/COMMIT transaction.

---

## 9. Progress Tracking (`progress.txt`)

Đặt ở root workspace. Cập nhật sau mỗi step hoàn tất.

### Template
```
# UNIS SCP — E2E Test Progress
# Started: YYYY-MM-DD HH:MM UTC+07

## Session N — <Short title>

### Done
- [x] Step description (link to endpoint/file nếu cần)

### Bug phát hiện & fix
- BUG-ID-XX: <symptom>
  Root cause: <1 line>
  Fix: <file.ts:line hoặc SQL migration>
  Status: FIXED | PENDING | WONTFIX

### Next Steps (pending)
- [ ] Step

## Testing checklist per module
- [ ] M00 Master Data ...
```

### Cập nhật khi nào
- Sau mỗi helper script chạy xong.
- Sau mỗi bug fix (ghi ID + root cause 1 dòng).
- Sau mỗi module pass checklist.
- Trước khi session kết thúc — ghi "Next Steps" rõ để session sau tiếp tục.

---

## 10. Session Handoff Protocol

Khi 1 session kết thúc (user nghỉ / Cascade timeout / bug quá lớn cần discuss):

### 10.1 Cascade phải ghi
1. `progress.txt` — cập nhật Done + Next Steps.
2. Nếu tạo migration mới → note tên file + lý do trong `progress.txt`.
3. Nếu tạo helper script mới → thêm vào Section 8 của playbook này.
4. Nếu phát hiện bug chưa fix → ghi BUG-ID + scope để session sau priority.

### 10.2 User phải cung cấp khi quay lại
1. State của real data (file mới / file đã sửa).
2. Logs nếu có lỗi runtime (browser console / BE stdout).
3. Quyết định business nếu session trước pending.

### 10.3 Cascade phải đọc khi mở session mới
1. `progress.txt` đầu tiên.
2. Bất kỳ helper script nào được reference.
3. Bất kỳ migration mới nào trong `backend/src/*/migrations/` sau timestamp session trước.

---

## 11. Appendix — Quick Command Reference

### 11.1 Login lấy JWT
```bash
$response = curl.exe -X POST http://localhost:3002/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"Admin@123"}'
$token = ($response | ConvertFrom-Json).accessToken
```

### 11.2 Bật 1 feature flag
```bash
curl.exe -X PATCH http://localhost:3002/api/v1/system-config/flags/m23_drp_netting_v2_enabled `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"enabled":true}'
```

### 11.3 Batch update config
```bash
curl.exe -X PATCH http://localhost:3002/api/v1/system-config `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"updates":[{"configKey":"lcnb.enabled","configValue":"EXECUTE"}],"actor":"admin"}'
```

### 11.4 Import CSV dry-run
```bash
curl.exe -X POST "http://localhost:3002/api/v1/master-data/import/supplier?dryRun=true" `
  -H "Content-Type: text/csv" `
  -H "x-user-id: admin" `
  --data-binary "@sample-data/suppliers.csv"
```

### 11.5 Trigger DRP run với idempotency
```bash
$uuid = [guid]::NewGuid().ToString()
curl.exe -X POST http://localhost:3002/api/v1/drp/run `
  -H "Authorization: Bearer $token" `
  -H "Idempotency-Key: $uuid" `
  -H "Content-Type: application/json" `
  -d '{}'
```

### 11.6 Query DB nhanh
```bash
node backend/scripts/_db-inspect.js          # overview
node backend/scripts/_db-check-config.js     # verify config
```

### 11.7 Apply migration UP/DOWN
Dùng Node pg đọc file SQL rồi exec trong transaction. Template xem `_db-apply-m10-config.js`.

---

## 12. Appendix — FAQ / Common Pitfalls

| Vấn đề | Nguyên nhân thường gặp | Cách xử lý |
|--------|------------------------|------------|
| `psql: command not found` | Windows không cài psql hoặc không trong PATH | Dùng Node `pg` script thay thế |
| BE start fail port 3002 in use | Process cũ chưa kill | `Get-NetTCPConnection -LocalPort 3002` rồi `Stop-Process` |
| FE 500 khi gọi BE | CORS hoặc auth token expired | Check `backend/.env CORS_ORIGIN`; re-login |
| DRP run BLOCKED_STALE dù mới sync | `planning.max_stale_minutes` quá nhỏ hoặc CN `synced_at` chưa update | Check sync_log, rerun `POST /supply/sync/trigger-all` |
| Allocation không thấy LCNB transfer | `lcnb.enabled=DETECT_ONLY` | `PATCH` thành `EXECUTE`; re-run allocation |
| M27 không tự trigger | `po_run_pending` chưa đủ cả m25_done và m26_done | Check event handler log, trigger manual |
| UI hiển thị 0 rows dù DB có | API client cache / filter stale | Hard reload (Ctrl+Shift+R), check Network tab |
| Feature flag OFF nhưng endpoint vẫn chạy | Guard chưa apply hoặc flag name sai | Check decorator `@FeatureFlag('...')` vs DB `flag_name` |
| `system_config` tăng rows bất thường sau BE restart | Legacy seeds `002_seed_unis_defaults.sql` + V*.up.sql auto-apply; nhiều group chứa key giống nhau | Chạy `_db-audit-config.js` để phát hiện duplicate. Nếu có TRUE duplicate (cùng key khác group) → dùng pattern của `_db-fix-trust-duplicates.js` (verify value bằng nhau trước khi DELETE legacy group) |
| `SystemConfigService.getValue(key)` trả value sai | Query `WHERE config_key=$1 LIMIT 1` không filter group; DB có duplicate key giữa nhiều group | Fix upstream: hoặc xóa legacy duplicates, hoặc sửa query thành `WHERE config_group=$1 AND config_key=$2`. Đừng dùng workaround FE/controller. |
| FEATURE_TOGGLE group trong system_config (15 rows như `feature.m11_demand_v2_enabled`) | Phase 1 legacy approach trước khi có bảng `feature_flag` | Dead data — không ai đọc. Không cần xóa (không gây bug), nhưng đừng nhầm là source of truth cho flags. Chỉ `feature_flag` table là canonical. |

---

## 13. Related documents
- `docs/DATA-FLOW.md` — canonical data flow & ownership rules
- `docs/PROJECT-STATUS.md` — module completion status
- `docs/report-Mxx/README.md` — per-module BA + schema + API + source files
- `docs/specs/Mxx-*.md` — deep spec per module
- `progress.txt` (root) — live session progress
- `backend/scripts/_db-*.js` — DB helper scripts

---

*E2E-TESTING-PLAYBOOK.md v1.0 — 2026-04-22*
*Cùng viết bởi: User (CEO Kurt) + Cascade (Techlead pair)*
