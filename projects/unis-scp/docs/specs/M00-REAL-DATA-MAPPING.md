# M00 Real Data Mapping — UNIS Bravo ERP → UNIS SCP Schema

> **Version:** 1.3 · **Created:** 2026-04-22 · **Updated:** 2026-04-22 · **Status:** PROPOSED (chưa import)
> **Purpose:** Quy cách chính xác để map 5 file CSV thật (Bravo ERP + forecast model)
> sang 7 bảng master data + 1 bảng demand_snapshot của UNIS SCP.
> **Prerequisites:** Đã đọc `docs/specs/M00-master-data-platform.md`, `docs/DATA-FLOW.md`, và `E2E-TESTING-PLAYBOOK.md`.

> **Changelog v1.3 (2026-04-22):** Fix bug NM miền Bắc orphan + polish.
> - **Decision 2.9 fix BUG (HIGH)**: `HUB_NAME_TO_REGION` không có hub `MIEN_BAC` (19 hub Bravo đều miền Nam/MT-TNG). Rule cũ `sup.region='MIEN_BAC' AND h.region='MIEN_BAC'` → NM Bắc orphan. Thêm **nhánh B fallback**: NM không match coarse-region nào → assign vào **tất cả hub** (chấp nhận LT lớn, M00 quality WARN).
> - **Section 6.3**: thêm query *"NM orphan in hub_nm_assignment"* — validation từ phía supplier (query cũ từ phía hub che bug này).
> - **Section 6.3 pre-check**: note rõ CN-Bắc (nếu có) sẽ đi nhánh haversine-fallback → assign vào hub Nam gần nhất (khoảng 1,500km) → DRY_RUN phải alert.
> - **Section 8**: wording "9 decisions + 4 migrations (v1.3)".
> - Version header/footer bump 1.2 → 1.3.

> **Changelog v1.2 (2026-04-22):** Căn chỉnh theo PRD F0/F1-B1 sau cross-check.
> - **Decision 2.7 mở rộng**: seed cả **3 loại lane** Hub→CN (1,292) + NM→CN (~4,964) + CN→CN filter <500km (PRD F0.3.1 + F0.6.3 #18/19/20). Không seed đủ sẽ chặn M24 LCNB và M26 ATP.
> - **Decision 2.9 mới**: seed `hub_cn_cluster` + `hub_nm_assignment` (PRD F0.6.2 #11/#12) — 2 bảng đã tồn tại trong DB, một-nhiều theo region.
> - **Decision 2.8 mở rộng**: thêm 4 snapshot `level='TOTAL'` (PRD FR-F1B1-001) để FR-F1B1-003 consistency check chạy được.
> - **Decision 2.1 (sku.uom)**: chuẩn hóa sang `'m2'` + thêm `conversion_vien_per_m2` (PRD F0.2.1) — dữ liệu Bravo `VIEN` được ghi vào `uom_source`.
> - **Decision 2.4 (hub.hub_type)**: `'WAREHOUSE'` → `'PHYSICAL'` (PRD F0.2.4 enum + DTO validator).
> - **Decision 2.6**: MOQ=500 và LT=7|9 đánh dấu **PLACEHOLDER** rõ ràng; `supplier.lt_sigma=NULL` phải có fallback.
> - **Region normalization**: supplier `MIEN_BAC|MIEN_NAM|UNKNOWN` ↔ hub/CN `HCM|DNB|TNB|MT-TNG|MIEN_BAC` qua `REGION_COARSE` map để NM→CN lane compute được.
> - **Section 1**: ghi rõ Customer/User/Role **out-of-scope** M00 real-data import.
> - **Section 7**: thêm RISK-04 (không có bảng `route` — multi-drop lùi Phase 2), RISK-05 (MOQ placeholder), RISK-06 (uom conversion), cập nhật RISK-02 (σ_LT NULL).

> **Changelog v1.1 (2026-04-22):** Đồng bộ với schema thực của DB `unis_scp_flow1_test_20260421_01`.
> - `transport_lane`: đổi cột sang `source_location_code`/`dest_location_code`/`lead_time_days`/`rate_vnd_per_km`/`carrier_codes`/`is_active` (13-col thực).
> - `demand_snapshot`: bỏ `period`/`source`, dùng `snapshot_id UUID` + `horizon_start/end` + `horizon_months` + `status` + `source_type`.
> - `demand_snapshot_line`: đổi sang `item_code`/`location_code`/`qty`; giữ `tet_flag CHAR 'Y'/'N'`; xác nhận `confidence_lower/upper/segment/combo_class/branch_archetype` đã có → **huỷ migration 5.6**.
> - `channel`: bỏ hẳn `preferred_hub` (không có cột, không có consumer); quan hệ hub↔CN dùng `transport_lane`.
> - `hub`: đổi `status` → `active` bool, `capacity_m2` → `capacity`; migration 5.2 thêm cả `region` và `geo_source`.
> - `sku`: đổi `status` → `active` bool; migration 5.3 bổ sung `weight_kg`/`abc_class`.
> - `sku_variant`: bỏ migration 5.5, nhét `factory_sku`/`sale_sku` vào `attrs jsonb`; khoá FK là `sku_id` (resolve qua lookup).
> - `sku_nm_mapping`: INSERT theo `sku_id`/`nm_code` (+ post-UPDATE `nm_id`), không phải `sku_code`/`supplier_code`.
> - `supplier` migration 5.4: bỏ `factory_code` (đã tồn tại), giữ `brand`.

---

## 1. Context

Tập đoàn UNIS cung cấp real data dưới dạng 5 CSV để test E2E toàn bộ pipeline DRP + Allocation + Transport + PO. Data nằm tại `data/`:

| File | Rows | Entity UNIS | Ghi chú |
|------|------|-------------|---------|
| `[Masterdata] Warehouse - Sheet1.csv` | 19 | `hub` | Kho vật lý |
| `[Masterdata] Branch - Sheet1.csv` | 74 (68 sau filter) | `channel` | CN × kênh bán |
| `[Masterdata] Noi Keo - Sheet1.csv` | 73 | `supplier` | NM (pull source × factory) |
| `[Masterdata] Item - Sheet1.csv` | 14,935 (5,783 unique) | `sku` + `sku_variant` | SKU với variant (color_tail) |
| `demand-forecast/drp_export_dec25_q1_2026.csv` | 84,764 | `demand_snapshot_line` | Forecast T12/2025→T3/2026 |
| `demand-forecast/summary_accuracy_FINAL_vs_MA3.csv` | 1,660 | accuracy benchmark | Validate chỉ |
| `demand-forecast/full_accuracy_T10_T11_T12_T1_forecast_T2_T3.csv` | 1,660 | accuracy detail | Validate chỉ |

Mỗi CSV master có **2 dòng header**:
- Dòng 1: tên tiếng Việt (Bravo gốc)
- Dòng 2: tên tiếng Anh (đã normalize)
- Dòng 3 trở đi: data rows

Import script đọc từ dòng 3, dùng dòng 2 làm column name.

**Out-of-scope cho M00 real-data import (v1.2 clarification):**
- `customer` (8 cols), `customer_cn` (10 cols): đã tồn tại trong DB nhưng **không có CSV Bravo cung cấp**. Onboard thủ công qua API CRUD hoặc deferred sang Phase 2 (PRD F0.2.5).
- `users`, `roles`, `user_roles`, `refresh_tokens`: seed qua `backend/scripts/seed-admin.js` và API auth, không từ Bravo (PRD F0.2.6).
- `route` / tuyến giao hàng (PRD F0.3.2, F0.6.2 #15): **không có trong DB**, multi-drop M25 dùng distance-threshold (`transport.max_multidrop_distance_km`) thay route group. Xem RISK-04.

---

## 2. 8 Mapping Decisions (canonical)

### 2.1 Decision 1: SKU level = `item_code` canonical (5,783 rows) + `sku_variant` cho color_tail

**Chọn:** `sku.sku_code = item_code` (không phải `bravo_sku` 14,935 rows).

**Rationale:**
- File `drp_export` dùng `fsku_id = item_code` làm key → forecast đã ở level này
- File `summary_accuracy` + `full_accuracy` cũng dùng `fsku = item_code` (1,660 ≪ 14,935)
- Plan matrix `(cn × sku × week)` nhỏ hơn 2.6× → DRP/LCNB chạy nhanh hơn
- Color (đuôi màu) là thuộc tính vật lý, **không ảnh hưởng forecast**: khách hàng đặt pattern, không đặt màu cụ thể
- Spec M00 đã có bảng `sku_variant` sẵn — khớp canonical design

**Mapping:**
```sql
-- sku table (5,783 rows)
sku.sku_code          = item_code                       -- VD "01.L1.2540.2401T"
sku.sku_name          = item_name                       -- VD "Gạch 25x40 MS 2401T loại 1"
-- v1.2: PRD F0.2.1 quy ước SKU đơn vị m². Bravo ghi `VIEN` → normalize + conversion.
sku.uom                     = 'm2'                      -- canonical per PRD
sku.uom_source              = masterunit                -- audit: Bravo nguyên gốc "VIEN"|...
sku.conversion_vien_per_m2  = CASE transport_spec       -- quy đổi viên ↔ m²
                                 WHEN '20x20' THEN 25
                                 WHEN '25x25' THEN 16
                                 WHEN '25x40' THEN 10
                                 WHEN '30x30' THEN 11.11
                                 WHEN '30x60' THEN 5.55
                                 WHEN '40x40' THEN 6.25
                                 WHEN '50x50' THEN 4
                                 WHEN '60x60' THEN 2.78
                                 WHEN '80x80' THEN 1.5625
                                 ELSE NULL                -- SPPT (phụ kiện) → không cần conversion
                              END
sku.product_group     = category                        -- "GACH" | "SPPT"
sku.pattern_set       = pattern_set                     -- "END", "NEW", ...
sku.brand             = brand                           -- "UNIS", "VITTO", ...
sku.weight_kg         = CASE WHEN gross_weight > 0
                             THEN gross_weight
                             ELSE 4 END                 -- fallback từ system_config
sku.transport_spec    = transport_spec                  -- "25x40", "30x60"
sku.price_group       = price_group                     -- e.g. "2540"
sku.active            = (status NOT LIKE 'END-%')         -- DB dùng bool `active`, KHÔNG có cột `status`
sku.deploy_date       = deploy_date (parsed)
sku.sample_age        = sample_age
sku.abc_class         = NULL (sẽ lấy từ drp_export segment sau)

-- sku_variant table (14,935 rows) — DB dùng `sku_id` bigint FK, KHÔNG có `sku_code`
sku_variant.sku_id         = (lookup) SELECT id FROM sku WHERE sku_code = item_code
sku_variant.variant_code   = bravo_sku                    -- VD "01.L1.2540.2401T.0"
sku_variant.variant_suffix = color_tail                   -- NOT NULL; "0"|"2"|"CT4"|...
sku_variant.variant_name   = item_name || ' ' || color_tail
sku_variant.attrs          = jsonb_build_object(          -- gộp factory_sku + sale_sku
                                'factory_sku', factory_sku,
                                'sale_sku',    sale_sku)
sku_variant.active         = (status NOT LIKE 'END-%')
```

**Uniqueness guard:**
- Tại dòng duplicate `(item_code, color_tail)` → keep first, warn.
- Dedupe data dòng: 14,935 raw → ~12,000-14,000 unique sau khi dedup.

**Impact conversion (v1.2):** Demand giữ `qty` m² (PRD). Khi M21 sync inventory Bravo (đơn vị viên),
backend phải quy đổi `inventory_qty_m2 = inventory_qty_vien / conversion_vien_per_m2`. Fallback
4 nếu `transport_spec` lạ hoặc `conversion_vien_per_m2 IS NULL`.

---

### 2.2 Decision 2: Channel CN = `branch_code` raw Bravo (74 → 68 rows)

**Chọn:** `channel.cn_code = branch_code`. Không composite.

**Rationale:**
- `branch_code` Bravo đã là unique 3-digit identifier
- `drp_export.branch_id` map 1-1 sang `branch_code` → zero transform khi load demand
- 1 địa điểm vật lý có nhiều `branch_code` cho 5 thương hiệu (UNIS/UNIMAX/UNICHEMI/UNILUX/LOTINA) là cấu trúc kế toán P&L của Bravo — giữ nguyên

**Filter:** bỏ 6 rows "corporate holdings" (`branch_province` blank + `warehouseid` blank):
- branch_code: `000`, `067`, `070`, `093`, `111`, `222`
- Còn **68 channel rows**.

**Mapping:**
```sql
channel.cn_code          = branch_code                  -- "008", "076", "023"
channel.cn_name          = branch_name
channel.address          = branch_province              -- "Tp. HCM", "Lâm Đồng"
channel.region           = branch_area                  -- "HCM" | "MT-TNG" | "TNB" | "DNB"
-- NOTE: DB channel KHÔNG có cột `preferred_hub`. Quan hệ hub↔CN biểu diễn qua
-- `transport_lane(source_location_code=hub_code, dest_location_code=cn_code)` (Decision 2.7).
channel.brand_channel    = branch_channel               -- NEW COLUMN (migration 5.1)
channel.tenant_code      = branch_corporation           -- NEW COLUMN (migration 5.1)
channel.lat              = vn_province_centroid[branch_province].lat    -- NOT NULL
channel.lng              = vn_province_centroid[branch_province].lng    -- NOT NULL
channel.geo_source       = 'PROVINCE_CENTROID'          -- NEW COLUMN flag (migration 5.1)
channel.connectivity     = 'GOOD'                       -- default (DB default 'GOOD')
channel.active           = true
```

**Schema migration cần:** thêm 3 cột vào `channel`:
- `brand_channel VARCHAR(20)` — 5 giá trị UNIS/UNIMAX/UNICHEMI/UNILUX/LOTINA
- `tenant_code VARCHAR(10)` — 000/222
- `geo_source VARCHAR(30)` — flag đánh dấu nguồn geocode

**Guard tiên quyết:** `channel.lat` và `channel.lng` **NOT NULL** ở DB thực. Import phải
validate 100% `branch_province` resolve được centroid — nếu có row không resolve → abort
import, không cho fallback NULL.

---

### 2.3 Decision 3: Supplier NM = composite `pull_source_code + factory_code` (73 rows)

**Chọn:** supplier_code = composite. Giữ 73 physical supply sources.

**Rationale:**
- "VITTO - HUE" xuất hiện 5 lần với `factory_code ∈ {03, 04, 08, 10, 15}` → 5 nhà máy vật lý khác nhau cùng thương hiệu
- M26 NM ATP check tính `hstk_days < transit_lt_days` per physical factory, không per brand
- Mỗi factory có thể có LT khác nhau, capacity khác nhau

**Normalize function `sanitize()`:**
```js
sanitize(s) = s.trim().replace(/[\s\-]+/g, '-').toUpperCase()
// Examples:
//   "VITTO - HUE"       → "VITTO-HUE"
//   "HOAN MY - VINH PHUC" → "HOAN-MY-VINH-PHUC"
//   "A MY - VINH PHUC"  → "A-MY-VINH-PHUC"
```

**Mapping:**
```sql
supplier.supplier_code  = sanitize(pull_source_code) || '__' || factory_code
                          -- VD "VITTO-HUE__03"
supplier.supplier_name  = pull_source_name || ' (F' || factory_code || ')'
                          -- VD "VITTO - HUE (F03)"
supplier.factory_code   = factory_code
supplier.brand          = pull_source_name (dedupe unique)
                          -- Used for grouping multi-factory suppliers
supplier.region         = CASE
                            WHEN pull_source_area = 'MB'   THEN 'MIEN_BAC'
                            WHEN pull_source_area = ''     THEN 'MIEN_NAM'
                            WHEN pull_source_area = '?'    THEN 'UNKNOWN'  -- row "SH"
                            ELSE pull_source_area
                          END
supplier.lead_time_days = CASE                           -- ⚠ PLACEHOLDER (PRD #17 yêu cầu LT per NM)
                            WHEN pull_source_area = 'MB'   THEN 9
                            ELSE 7
                          END
supplier.lt_sigma       = NULL                          -- ⚠ PLACEHOLDER (PRD #17 yêu cầu σ_LT)
                                                        --    M23 SS Hub fallback: `system_config.default_lt_sigma_days=1`
supplier.status         = 'ACTIVE'                      -- DB cột `status VARCHAR(20) DEFAULT 'ACTIVE'` (supplier KHÁC các bảng dùng `active` bool)
```

**Uniqueness guard:**
- Có 4 rows với `factory_code = '00'` và 4 rows với `factory_code = 'UL'` → cần check collision sau sanitize.
- Đề xuất: nếu collision → append row_index: `VITTO-HUE__03__2`.

---

### 2.4 Decision 4: Hub = warehouse straight 1-1 (19 rows)

**Mapping:**
```sql
hub.hub_code    = warehouse_code                        -- "HUBR00001"
hub.hub_name    = warehouse_name                        -- "Kho HCM"
hub.hub_type    = 'PHYSICAL'                            -- PRD F0.2.4 enum virtual|PHYSICAL; entity/DTO validate @IsIn(['VIRTUAL','PHYSICAL'])
hub.capacity    = NULL                                  -- unknown; DB cột là `capacity` (không có `_m2`)
hub.region      = infer_from_name(warehouse_name)       -- NEW COLUMN (migration 5.2)
hub.lat         = vn_province_centroid[region].lat
hub.lng         = vn_province_centroid[region].lng
hub.geo_source  = 'PROVINCE_CENTROID'                   -- NEW COLUMN (migration 5.2)
hub.active      = true                                  -- DB dùng bool `active`, KHÔNG có `status`
```

**Region inference table:**
```js
const HUB_NAME_TO_REGION = {
  'Kho HCM': 'HCM',
  'Kho Lâm Đồng': 'MT-TNG',
  'Kho Vĩnh Long 1': 'TNB',  'Kho Vĩnh Long 2': 'TNB',
  'Kho An Giang': 'TNB',     'Kho Khánh Hòa': 'MT-TNG',
  'Kho Quảng Ngãi': 'MT-TNG','Kho Vũng Tàu': 'DNB',
  'Kho Đà Nẵng': 'MT-TNG',   'Kho Tiền Giang': 'TNB',
  'Kho Cà Mau': 'TNB',       'Kho Cần Thơ': 'TNB',
  'Kho Đồng Nai': 'DNB',     'Kho Bình Định': 'MT-TNG',
  'Kho Bình Dương': 'DNB',   'Kho Bình Thuận': 'MT-TNG',
  'Kho Bình Phước': 'DNB',   'Kho Tây Ninh': 'HCM',
  'Kho Kiên Giang': 'TNB',
};
```

---

### 2.5 Decision 5: Geocode bằng Province Centroid static table

**Chọn:** file `backend/scripts/import-real/_vn-province-centroid.json`.

**Rationale:**
- M24 LCNB (Haversine) + M25 multi-drop distance BẮT BUỘC cần lat/lng
- Google Maps API geocoding = external dependency + cost + rate limit → tránh
- Centroid tỉnh đủ chính xác cho Phase 1:
  - LCNB threshold `lcnb.max_distance_km=500` → sai số ±30km trong 1 tỉnh không ảnh hưởng
  - Multi-drop `transport.max_multidrop_distance_km=200` → có thể sai 1-2 cặp khi 2 điểm gần biên giới tỉnh, chấp nhận
- Mỗi row có `geo_source='PROVINCE_CENTROID'` → audit trail rõ → sau này refine từng CN bằng real address cũng dễ

**Provinces trong data (inferred từ Branch + Warehouse):**
```json
{
  "Tp. HCM":      { "lat": 10.762, "lng": 106.660 },
  "Lâm Đồng":     { "lat": 11.940, "lng": 108.440 },
  "Vĩnh Long":    { "lat": 10.253, "lng": 105.972 },
  "An Giang":     { "lat": 10.521, "lng": 105.126 },
  "Khánh Hòa":    { "lat": 12.238, "lng": 109.197 },
  "Quảng Ngãi":   { "lat": 15.120, "lng": 108.799 },
  "Đồng Tháp":    { "lat": 10.493, "lng": 105.633 },
  "Cà Mau":       { "lat": 9.176,  "lng": 105.152 },
  "Tp. Cần Thơ":  { "lat": 10.045, "lng": 105.746 },
  "Đồng Nai":     { "lat": 10.945, "lng": 106.824 },
  "Gia Lai":      { "lat": 13.983, "lng": 108.000 },
  "Tp. Đà Nẵng":  { "lat": 16.047, "lng": 108.206 },
  "Tây Ninh":     { "lat": 11.310, "lng": 106.098 }
}
```

Region-level centroid (cho hub và supplier):
```json
{
  "HCM":      { "lat": 10.762, "lng": 106.660 },
  "DNB":      { "lat": 10.945, "lng": 106.824 },   // Đồng Nai / Bình Dương / BRVT area
  "TNB":      { "lat": 10.045, "lng": 105.746 },   // Cần Thơ trung tâm Tây Nam Bộ
  "MT-TNG":   { "lat": 13.500, "lng": 108.500 },   // Trung / Tây Nguyên — approx
  "MIEN_BAC": { "lat": 21.028, "lng": 105.854 },   // Hà Nội
  // v1.2: supplier dùng coarse region → bắt buộc có 2 entry dưới để NM→CN lane không NaN.
  "MIEN_NAM": { "lat": 10.762, "lng": 106.660 },   // = HCM centroid
  "UNKNOWN":  { "lat": 10.762, "lng": 106.660 }    // fallback = HCM
}
```

---

### 2.6 Decision 6: `sku_nm_mapping` auto-generate từ Item file

Mỗi dòng Item có `(factory_code, pull_source_code)` → mapping SKU↔NM.

**DB reality check:** bảng `sku_nm_mapping` có cột `sku_id BIGINT NOT NULL`, `nm_id BIGINT NOT NULL`,
`nm_code VARCHAR(30)`, `moq`, `priority`, `active` — **không có** `sku_code` hay `supplier_code`.
INSERT phải resolve qua lookup.

**Mapping:**
```sql
-- Step 1: INSERT với sku_id (lookup) + nm_code (sanitize composite)
-- nm_id có thể tạm NULL nếu supplier chưa tồn tại, fill sau ở Step 2.
INSERT INTO sku_nm_mapping (sku_id, nm_id, nm_code, moq, priority, active)
SELECT DISTINCT
  sku.id                                              AS sku_id,
  sup.id                                              AS nm_id,
  sanitize(i.pull_source_code) || '__' || i.factory_code AS nm_code,
  500                                                 AS moq,       -- ⚠ PLACEHOLDER (PRD #16 yêu cầu MOQ per NM×SKU; chờ source Bravo)
  1                                                   AS priority,  -- single-source (BR-F0-003)
  (i.status NOT LIKE 'END-%')                         AS active
FROM item_raw i
JOIN sku ON sku.sku_code = i.item_code
JOIN supplier sup
  ON sup.supplier_code = sanitize(i.pull_source_code) || '__' || i.factory_code
WHERE i.factory_code <> '#N/A'
  AND i.pull_source_code IS NOT NULL;

-- Step 2 (safety): ensure nm_id filled khi supplier được tạo sau
UPDATE sku_nm_mapping snm
   SET nm_id = sup.id
  FROM supplier sup
 WHERE sup.supplier_code = snm.nm_code AND snm.nm_id IS NULL;
```

**Post-import validation (M00 quality check):**
```sql
-- Rule: mỗi SKU active PHẢI có ≥1 NM mapping
SELECT s.sku_code FROM sku s
WHERE s.active = true AND NOT EXISTS (
  SELECT 1 FROM sku_nm_mapping m WHERE m.sku_id = s.id AND m.active = true
);
```

---

### 2.7 Decision 7: `transport_lane` auto-seed — **3 loại lane** (PRD F0.3.1 + F0.6.3 #18/19/20)

**Chọn:** seed **cả 3 loại** Hub→CN / NM→CN / CN→CN trong cùng bảng `transport_lane`
(bảng không có cột `lane_type`; phân biệt qua prefix của `source_location_code`: `HUB*` / `NM-*` / CN 3-digit).

**Region code normalization (v1.2):**
```js
// supplier dùng coarse (MIEN_BAC/MIEN_NAM/UNKNOWN), hub/channel dùng fine (HCM/DNB/TNB/MT-TNG/MIEN_BAC).
// Mở rộng fine → coarse:
const FINE_TO_COARSE = {
  'HCM': 'MIEN_NAM', 'DNB': 'MIEN_NAM', 'TNB': 'MIEN_NAM', 'MT-TNG': 'MIEN_NAM',
  'MIEN_BAC': 'MIEN_BAC',
};
const coarse = r => FINE_TO_COARSE[r] ?? r;   // supplier region đã coarse → pass-through
```

**Generation rule (region-based transit LT):**
```
FOR EACH (src, dst):
  IF coarse(src) == coarse(dst) AND src.region == dst.region:
    transit_days = 1            // cùng region fine
  ELIF coarse(src) == coarse(dst):
    transit_days = 2            // cùng miền
  ELIF 'MIEN_BAC' IN {coarse(src), coarse(dst)}:
    transit_days = 5            // Bắc ↔ Nam
  ELSE:
    transit_days = 3            // fallback
```

**DB reality check (13 cột):** `source_location_code`, `dest_location_code`, `distance_km NUMERIC NOT NULL DEFAULT 0`,
`lead_time_days INT NOT NULL DEFAULT 1`, `rate_vnd_per_km NUMERIC NOT NULL DEFAULT 15000`,
`carrier_codes VARCHAR(200) NOT NULL DEFAULT ''`, `is_active BOOL NOT NULL DEFAULT true`, `note`,
`created_at`, `updated_at`, `lt_drift_count`, `lt_drift_last_at`.
**Không có** `hub_code`/`cn_code`/`transit_days`/`active`/`carrier_default`/`lane_type`.

**Supplier pseudo-location code** (vì `supplier` không có lat/lng, dùng region centroid):
```js
// NM source_location_code = 'NM-' || supplier_code. Lat/lng = region centroid.
// Để chắc chắn: thêm `SELECT 'NM-'||supplier_code AS code, <lat>, <lng> FROM supplier` để resolve.
// region_lat()/region_lng() PHẢI có entry cho MIEN_NAM, MIEN_BAC, UNKNOWN (xem Section 2.5).
```

**Mapping — 3 INSERT statements:**
```sql
-- LANE 1: Hub → CN (PRD #20, F2-B3 SS CN)
INSERT INTO transport_lane
  (source_location_code, dest_location_code,
   distance_km, lead_time_days, rate_vnd_per_km, carrier_codes, is_active, note)
SELECT h.hub_code, c.cn_code,
       haversine(h.lat, h.lng, c.lat, c.lng),
       compute_transit_days(h.region, c.region),
       15000, 'DEFAULT', true,
       'M00 seed Hub→CN (PRD #20)'
FROM hub h CROSS JOIN channel c;
-- Expect 19 × 68 = 1,292 rows

-- LANE 2: NM → CN (PRD #18, F2-B5/6/7 hold-or-ship / ATP / PO ETA)
-- Supplier region coarse → fine via centroid fallback; NM-NM lấy region centroid.
INSERT INTO transport_lane
  (source_location_code, dest_location_code,
   distance_km, lead_time_days, rate_vnd_per_km, carrier_codes, is_active, note)
SELECT 'NM-'||sup.supplier_code, c.cn_code,
       haversine(region_lat(sup.region), region_lng(sup.region), c.lat, c.lng),
       compute_transit_days(sup.region, c.region),  -- dùng coarse(c.region) bên trong
       15000, 'DEFAULT', true,
       'M00 seed NM→CN (PRD #18)'
FROM supplier sup CROSS JOIN channel c
WHERE sup.status = 'ACTIVE';
-- Expect 73 × 68 ≈ 4,964 rows

-- LANE 3: CN → CN (PRD #19, F2-B4 LCNB NEAREST_FIRST)
-- Filter distance < system_config.lcnb.max_distance_km (default 500) để giảm 4,624 → ~1,500-2,000.
INSERT INTO transport_lane
  (source_location_code, dest_location_code,
   distance_km, lead_time_days, rate_vnd_per_km, carrier_codes, is_active, note)
SELECT c1.cn_code, c2.cn_code,
       haversine(c1.lat, c1.lng, c2.lat, c2.lng),
       compute_transit_days(c1.region, c2.region),
       15000, 'DEFAULT', true,
       'M00 seed CN→CN LCNB (PRD #19)'
FROM channel c1 CROSS JOIN channel c2
WHERE c1.cn_code <> c2.cn_code
  AND haversine(c1.lat, c1.lng, c2.lat, c2.lng) < 500;
-- Expect ~1,500-2,000 rows sau filter
```

**Total expected `transport_lane` rows:** ~7,500-8,000 (1,292 + 4,964 + ~1,700).

---

### 2.8 Decision 8: `demand_snapshot` + `demand_snapshot_line` từ `drp_export`

**Chọn:** 4 snapshots per period, lines ở level CN.

**DB reality check:**
- `demand_snapshot`: PK `snapshot_id UUID DEFAULT gen_random_uuid()`; **không có** `period`, `source`. Dùng
  `horizon_start DATE`, `horizon_end DATE`, `horizon_months INT NOT NULL DEFAULT 12`, `level VARCHAR(10) NOT NULL DEFAULT 'TOTAL'`,
  `status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'`, `source_type VARCHAR(30) DEFAULT 'CSV_UPLOAD'`,
  `forecast_file_name`, `run_id`, `imported_from`, `snapshot_name`, `created_by`.
- `demand_snapshot_line`: dùng `item_code` (không `sku_code`), `location_code` (không `cn_code`), `qty` (không `forecast_qty`),
  `period_start DATE NOT NULL`, `reconciled_qty` tách riêng, `tet_flag CHAR(1)` 'Y'/'N' (KHÔNG bool),
  `segment CHAR(1)`, `combo_class`, `branch_archetype`, `confidence_lower/upper` — **tất cả đã tồn tại**.

**Snapshot structure:**
```
run_id=W9_20260406, horizon_start=2025-12-01, level=CN  → ~21,000 lines
run_id=W9_20260406, horizon_start=2026-01-01, level=CN  → ~21,000 lines
run_id=W9_20260406, horizon_start=2026-02-01, level=CN  → ~21,000 lines
run_id=W9_20260406, horizon_start=2026-03-01, level=CN  → ~21,000 lines
```

**Mapping:**
```sql
-- 4 snapshots phân biệt bằng horizon_start; horizon_months=1 mỗi snapshot.
INSERT INTO demand_snapshot
  (run_id, status, level, horizon_months, horizon_start, horizon_end,
   source_type, forecast_file_name, imported_from, snapshot_name, created_by)
VALUES
  ('W9_20260406','FROZEN','CN',1,'2025-12-01','2026-01-01','CSV_UPLOAD','drp_export_dec25_q1_2026.csv','BRAVO_ERP_DRP_EXPORT','W9_20260406 · 2025-12','importer@unis.local'),
  ('W9_20260406','FROZEN','CN',1,'2026-01-01','2026-02-01','CSV_UPLOAD','drp_export_dec25_q1_2026.csv','BRAVO_ERP_DRP_EXPORT','W9_20260406 · 2026-01','importer@unis.local'),
  ('W9_20260406','FROZEN','CN',1,'2026-02-01','2026-03-01','CSV_UPLOAD','drp_export_dec25_q1_2026.csv','BRAVO_ERP_DRP_EXPORT','W9_20260406 · 2026-02','importer@unis.local'),
  ('W9_20260406','FROZEN','CN',1,'2026-03-01','2026-04-01','CSV_UPLOAD','drp_export_dec25_q1_2026.csv','BRAVO_ERP_DRP_EXPORT','W9_20260406 · 2026-03','importer@unis.local');

-- Lines — dùng cột thực của DB.
INSERT INTO demand_snapshot_line
  (snapshot_id, item_code, location_code, period_start,
   qty, reconciled_qty,
   segment, combo_class, branch_archetype, tet_flag,
   confidence_lower, confidence_upper, demand_type)
SELECT
  s.snapshot_id,
  r.fsku_id                               AS item_code,
  r.branch_id::text                       AS location_code,
  r.forecast_date                         AS period_start,
  r.forecast_qty                          AS qty,
  NULLIF(r.reconciled_qty, 0)             AS reconciled_qty,
  r.segment, r.combo_class, r.branch_archetype,
  r.tet_flag,                             -- CHAR 'Y'/'N' — KHÔNG ép bool
  r.confidence_lower, r.confidence_upper,
  'FORECAST'                              AS demand_type
FROM drp_export_raw r
JOIN demand_snapshot s
  ON s.run_id = r.run_id
 AND s.horizon_start = date_trunc('month', r.forecast_date)::date
 AND s.level = 'CN'
WHERE r.branch_id <> 0                                 -- skip TOTAL rows
  AND r.combo_class <> 'DORMANT_DISCONTINUED'          -- skip dead SKUs
  AND r.fsku_id IN (SELECT sku_code FROM sku)          -- referential integrity
  AND r.branch_id::text IN (SELECT cn_code FROM channel);
```

**Secondary action 1 — tạo snapshot cấp Tổng (v1.2, PRD FR-F1B1-001 + FR-F1B1-003):**
```sql
-- 4 snapshots level='TOTAL' (no CN), derive từ rollup level='CN'.
INSERT INTO demand_snapshot
  (run_id, status, level, horizon_months, horizon_start, horizon_end,
   source_type, forecast_file_name, imported_from, snapshot_name, created_by)
VALUES
  ('W9_20260406','FROZEN','TOTAL',1,'2025-12-01','2026-01-01','CSV_UPLOAD','drp_export_dec25_q1_2026.csv','BRAVO_ERP_DRP_EXPORT','W9_20260406 · 2025-12 · TOTAL','importer@unis.local'),
  ('W9_20260406','FROZEN','TOTAL',1,'2026-01-01','2026-02-01','CSV_UPLOAD','drp_export_dec25_q1_2026.csv','BRAVO_ERP_DRP_EXPORT','W9_20260406 · 2026-01 · TOTAL','importer@unis.local'),
  ('W9_20260406','FROZEN','TOTAL',1,'2026-02-01','2026-03-01','CSV_UPLOAD','drp_export_dec25_q1_2026.csv','BRAVO_ERP_DRP_EXPORT','W9_20260406 · 2026-02 · TOTAL','importer@unis.local'),
  ('W9_20260406','FROZEN','TOTAL',1,'2026-03-01','2026-04-01','CSV_UPLOAD','drp_export_dec25_q1_2026.csv','BRAVO_ERP_DRP_EXPORT','W9_20260406 · 2026-03 · TOTAL','importer@unis.local');

-- Lines TOTAL: rollup từ level='CN' theo (item_code, period_start).
-- location_code NOT NULL → dùng sentinel 'TOTAL'.
INSERT INTO demand_snapshot_line
  (snapshot_id, item_code, location_code, period_start,
   qty, segment, combo_class, tet_flag, demand_type)
SELECT st.snapshot_id,
       dsl.item_code,
       'TOTAL'                                  AS location_code,
       dsl.period_start,
       SUM(dsl.qty)                             AS qty,
       MODE() WITHIN GROUP (ORDER BY dsl.segment)     AS segment,
       MODE() WITHIN GROUP (ORDER BY dsl.combo_class) AS combo_class,
       MAX(dsl.tet_flag)                        AS tet_flag,
       'FORECAST'                               AS demand_type
FROM demand_snapshot_line dsl
JOIN demand_snapshot sc ON sc.snapshot_id = dsl.snapshot_id AND sc.level = 'CN'
JOIN demand_snapshot st ON st.run_id = sc.run_id
                       AND st.horizon_start = sc.horizon_start
                       AND st.level = 'TOTAL'
GROUP BY st.snapshot_id, dsl.item_code, dsl.period_start;
```

**Consistency check (FR-F1B1-003):**
```sql
-- Expected: 0 rows (nếu > 0 → warning, không reject per PRD)
SELECT t.item_code, t.period_start, t.qty AS total_qty, COALESCE(SUM(c.qty),0) AS cn_sum
FROM demand_snapshot_line t
JOIN demand_snapshot ts ON ts.snapshot_id = t.snapshot_id AND ts.level = 'TOTAL'
LEFT JOIN demand_snapshot cs ON cs.run_id = ts.run_id AND cs.horizon_start = ts.horizon_start AND cs.level = 'CN'
LEFT JOIN demand_snapshot_line c ON c.snapshot_id = cs.snapshot_id
                                AND c.item_code = t.item_code AND c.period_start = t.period_start
GROUP BY t.item_code, t.period_start, t.qty
HAVING ABS(t.qty - COALESCE(SUM(c.qty),0)) > 0.01;
```

**Secondary action 2 — update `sku.abc_class` từ segment:**
```sql
-- CẦN migration 5.3 thêm cột abc_class trước. Infer ABC class per SKU dựa trên mode segment.
UPDATE sku s
SET abc_class = x.mode_segment
FROM (
  SELECT item_code, MODE() WITHIN GROUP (ORDER BY segment) AS mode_segment
  FROM demand_snapshot_line
  WHERE segment IS NOT NULL
  GROUP BY item_code
) x
WHERE s.sku_code = x.item_code;
```

---

### 2.9 Decision 9 (v1.2): Hub↔CN cluster + Hub↔NM assignment (PRD F0.6.2 #11, #12)

**Chọn:** seed 2 bảng quan hệ đã tồn tại trong DB (`hub_cn_cluster`, `hub_nm_assignment`).
Không seed → F1-B6 Hub ảo và M11 booking per-hub không aggregate đúng.

**DB reality check:**
- `hub_cn_cluster (id, hub_id BIGINT, cn_id BIGINT, active BOOL)`
- `hub_nm_assignment (id, hub_id BIGINT, nm_id BIGINT, active BOOL)`

**Rule hub_cn_cluster:** 1 CN thuộc hub **cùng region fine nhất**; nếu không có hub cùng region → hub gần nhất theo haversine.
```sql
INSERT INTO hub_cn_cluster (hub_id, cn_id, active)
SELECT DISTINCT ON (c.id)
       h.id, c.id, true
FROM channel c
JOIN hub h ON h.region = c.region   -- ưu tiên region match
ORDER BY c.id, haversine(h.lat, h.lng, c.lat, c.lng);

-- Fallback cho CN không có hub cùng region → hub gần nhất theo distance.
INSERT INTO hub_cn_cluster (hub_id, cn_id, active)
SELECT DISTINCT ON (c.id)
       h.id, c.id, true
FROM channel c
CROSS JOIN hub h
WHERE NOT EXISTS (SELECT 1 FROM hub_cn_cluster hcc WHERE hcc.cn_id = c.id)
ORDER BY c.id, haversine(h.lat, h.lng, c.lat, c.lng);
-- Expect: 68 rows (1 CN = 1 hub primary)
```

**Rule hub_nm_assignment:** NM→Hub theo coarse region (MIEN_BAC↔hub MIEN_BAC; MIEN_NAM↔hub HCM/DNB/TNB/MT-TNG).
Một NM có thể cung cấp cho nhiều hub cùng miền (many-to-many).

> **BUG đã fix v1.3:** data Bravo Warehouse (19 hàng) **không có kho miền Bắc** → không hub
> nào có `region='MIEN_BAC'`. Nếu chỉ chạy nhánh A, tất cả NM `pull_source_area='MB'` sẽ
> orphan. Nhánh B fallback bắt buộc.

```sql
-- Nhánh A: match coarse region
INSERT INTO hub_nm_assignment (hub_id, nm_id, active)
SELECT DISTINCT h.id, sup.id, true
FROM supplier sup
CROSS JOIN hub h
WHERE sup.status = 'ACTIVE'
  AND (
    (sup.region = 'MIEN_BAC' AND h.region = 'MIEN_BAC') OR
    (sup.region IN ('MIEN_NAM','UNKNOWN','') AND h.region IN ('HCM','DNB','TNB','MT-TNG'))
  );

-- Nhánh B (v1.3 fallback): NM chưa match hub nào (VD NM Bắc khi không có hub Bắc)
-- → assign NM đó vào TOÀN BỘ hub. M00 quality check log WARN cho NM fallback.
INSERT INTO hub_nm_assignment (hub_id, nm_id, active)
SELECT DISTINCT h.id, sup.id, true
FROM supplier sup
CROSS JOIN hub h
WHERE sup.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM hub_nm_assignment hna
     WHERE hna.nm_id = sup.id AND hna.active
  );
-- Expect: ~73 NM × (17 hub Nam) + fallback NM Bắc × 19 hub ≈ 1,300-1,500 rows
```

---

## 3. Data quality issues & handling

| Issue | File | Count | Handling |
|-------|------|-------|----------|
| `factory_code = '#N/A'` | Item | ~50 rows | SKIP import; log to `_import-errors.log` |
| `gross_weight = 0` | Item | ~70% rows | Fallback `system_config.sku.default_weight_kg=4` tại transport M25 |
| `status LIKE 'END-%'` | Item | ~20% rows | Import as `INACTIVE`; loại khỏi DRP filter active |
| Duplicate `(item_code, color_tail)` | Item | few | Keep first; warn |
| `branch_province = ''` + `warehouseid = ''` | Branch | 6 rows | SKIP — corporate holdings |
| `pull_source_area = '?'` | Nơi Kéo | 1 row (SH) | Assign `'UNKNOWN'`, manual review later |
| `factory_code` collision khi sanitize | Nơi Kéo | khả năng | Append row_index suffix |
| `branch_id = 0` trong drp_export | Forecast | ~4/snapshot | SKIP — TOTAL level |
| `combo_class = 'DORMANT_DISCONTINUED'` + `forecast_qty = 0` | Forecast | many | SKIP — noise |
| `fsku_id` in forecast không tồn tại ở sku | Forecast | unknown | SKIP + log (FK violation) |

---

## 4. Import order & dependencies

```
   centroid.json (static)
        │
        ├──────────────┬──────────────┐
        ▼              ▼              ▼
   ┌─────────┐    ┌─────────┐    ┌──────────┐
   │   hub   │    │ channel │    │ supplier │
   │  (19)   │    │  (68)   │    │  (73)    │
   └────┬────┘    └────┬────┘    └────┬─────┘
        │              │              │
        │              ├─► hub_cn_cluster       (v1.2: 68 rows, primary by region+haversine)
        │              │
        └──────────────┼──┬─► hub_nm_assignment (v1.2: ~1,200 rows, coarse-region m:n)
                       │  │
                       │  │           ┌──────────────┐
                       │  │           │     sku      │
                       │  │           │   (5,783)    │
                       │  │           │ sku_variant  │
                       │  │           │  (14,935)    │
                       │  │           └──┬───────────┘
                       │  │              │
                       │  │              ├─► sku_nm_mapping
                       │  │              │      (~9,000 rows, v1.1 lookup by sku_id+nm_code)
                       │  │              │
                       ▼  ▼              ▼
                   transport_lane (v1.2, 3 lanes, total ~7,500-8,000):
                     • Hub→CN  (1,292)
                     • NM→CN   (~4,964)
                     • CN→CN   (~1,500-2,000, haversine<500km)
                           │
                           ▼
                   demand_snapshot (8 rows: 4 CN + 4 TOTAL)
                           │
                           ├─► demand_snapshot_line level='CN'    (~84k)
                           └─► demand_snapshot_line level='TOTAL' (~20k rollup)
                                     │
                                     └─► UPDATE sku.abc_class
```

**Thứ tự import:**
1. `supplier` (73) — độc lập
2. `hub` (19) — độc lập (load centroid trước)
3. `channel` (68) — depends on hub (FK warehouseid)
4. `sku` (5,783) + `sku_variant` (14,935)
5. `sku_nm_mapping` — depends on sku + supplier
6. `transport_lane` — depends on hub + channel + supplier (seed **3 loại lane**: ~7,500-8,000 rows)
7. `hub_cn_cluster` + `hub_nm_assignment` (v1.2) — depends on hub + channel + supplier
8. `demand_snapshot` (4 CN + 4 TOTAL = 8) + `demand_snapshot_line` (~84k CN + ~20k TOTAL rollup)
9. UPDATE `sku.abc_class` from demand segment

---

## 5. Schema migrations cần

### 5.1 Migration `20260422_add_channel_bravo_columns.up.sql`
```sql
ALTER TABLE channel
  ADD COLUMN IF NOT EXISTS brand_channel VARCHAR(20),
  ADD COLUMN IF NOT EXISTS tenant_code   VARCHAR(10),
  ADD COLUMN IF NOT EXISTS geo_source    VARCHAR(30);

COMMENT ON COLUMN channel.brand_channel IS 'UNIS brand: UNIS/UNIMAX/UNICHEMI/UNILUX/LOTINA';
COMMENT ON COLUMN channel.tenant_code IS 'Bravo corporation code: 000=UNIS, 222=LOTINA';
COMMENT ON COLUMN channel.geo_source IS 'Geocode source: PROVINCE_CENTROID | GOOGLE_MAPS | MANUAL';
```

### 5.2 Migration `20260422_add_hub_geo_columns.up.sql`
```sql
ALTER TABLE hub
  ADD COLUMN IF NOT EXISTS region     VARCHAR(20),
  ADD COLUMN IF NOT EXISTS geo_source VARCHAR(30);
```

### 5.3 Migration `20260422_add_sku_bravo_columns.up.sql`
```sql
ALTER TABLE sku
  ADD COLUMN IF NOT EXISTS pattern_set              VARCHAR(20),
  ADD COLUMN IF NOT EXISTS transport_spec           VARCHAR(20),
  ADD COLUMN IF NOT EXISTS price_group              VARCHAR(20),
  ADD COLUMN IF NOT EXISTS brand                    VARCHAR(50),
  ADD COLUMN IF NOT EXISTS deploy_date              DATE,
  ADD COLUMN IF NOT EXISTS sample_age               INT,
  -- v1.1: 2 cột thêm do live-DB check cho thấy sku chỉ có 10 cols (active/created_by…).
  ADD COLUMN IF NOT EXISTS weight_kg                NUMERIC(10,3),
  ADD COLUMN IF NOT EXISTS abc_class                CHAR(1),
  -- v1.2: PRD F0.2.1 uom chuẩn là m². Giữ audit trail Bravo `VIEN` + conversion.
  ADD COLUMN IF NOT EXISTS uom_source               VARCHAR(20),
  ADD COLUMN IF NOT EXISTS conversion_vien_per_m2   NUMERIC(8,4);
  -- KHÔNG thêm `status` — DB đã có `active BOOLEAN`; mapping 2.1 dùng `active`.
  -- (Lưu ý: `supplier` bảng khác, vẫn dùng cột `status VARCHAR` — không gom chung ruột).

COMMENT ON COLUMN sku.uom_source IS 'Bravo ERP unit (VIEN|BO|TAM) trước khi normalize sang m²';
COMMENT ON COLUMN sku.conversion_vien_per_m2 IS 'Viên/m² theo transport_spec. NULL = SPPT không quy đổi';
```
> **Follow-up (không chặn import):** sau khi có `sku.weight_kg`, update
> `transport.top-up.service.ts` (L104-120) và `transport.lot-sizing.service.ts` (L530-545) để
> đọc trực tiếp từ cột thay vì fallback `system_config['sku.default_weight_kg']`.

### 5.4 Migration `20260422_add_supplier_bravo_columns.up.sql`
```sql
-- v1.1: `factory_code` đã tồn tại (DB thực có 15 cols). Chỉ cần `brand`.
ALTER TABLE supplier
  ADD COLUMN IF NOT EXISTS brand VARCHAR(50);
```

### 5.5 ~~Migration `20260422_add_sku_variant_bravo_columns.up.sql`~~ — **HUỶ ở v1.1**
`sku_variant` đã có `attrs jsonb`. Lưu `factory_sku`/`sale_sku` vào `attrs` (Decision 2.1),
tránh alter schema cho 2 cột ít consumer.

### 5.6 ~~Migration `20260422_add_demand_snapshot_line_bravo_columns.up.sql`~~ — **HUỶ ở v1.1**
Live-DB check confirm `confidence_lower`, `confidence_upper`, `segment CHAR(1)`, `tet_flag CHAR(1)`,
`combo_class VARCHAR(50)`, `branch_archetype VARCHAR(30)` **đã tồn tại**. Giữ `tet_flag` CHAR
('Y'/'N') — ép BOOLEAN sẽ break filter `= 'Y'` trong `demand.service.ts:454`.

---

## 6. Post-import validation queries

Chạy sau mỗi bước import để verify integrity.

### 6.1 Master data quality
```sql
-- Expected: 0
SELECT COUNT(*) AS sku_no_nm FROM sku s WHERE s.active = true
  AND NOT EXISTS (SELECT 1 FROM sku_nm_mapping m WHERE m.sku_id = s.id AND m.active);

-- Expected: 0
SELECT COUNT(*) AS channel_no_geo FROM channel WHERE lat IS NULL OR lng IS NULL;

-- Expected: 0
SELECT COUNT(*) AS hub_no_geo FROM hub WHERE lat IS NULL OR lng IS NULL;

-- v1.2: transport_lane breakdown 3 loại
-- Expected: HUB_CN=1,292 ; NM_CN≈4,964 ; CN_CN≈1,500-2,000 ; TOTAL≈7,500-8,000
SELECT CASE
         WHEN source_location_code LIKE 'HUB%' THEN 'HUB_CN'
         WHEN source_location_code LIKE 'NM-%' THEN 'NM_CN'
         ELSE 'CN_CN'
       END AS lane_type, COUNT(*)
FROM transport_lane GROUP BY 1
ORDER BY 1;

-- v1.2: Sanity distance_km > 0 cho tất cả lane (bảo vệ trường hợp thiếu region centroid)
-- Expected: 0
SELECT COUNT(*) FROM transport_lane WHERE distance_km = 0 OR distance_km IS NULL;
```

### 6.2 Demand snapshot integrity
```sql
-- v1.2: Expected 8 rows (4 CN + 4 TOTAL)
SELECT run_id, horizon_start, level, status, COUNT(*) AS n
FROM demand_snapshot GROUP BY run_id, horizon_start, level, status
ORDER BY horizon_start, level;

-- Expected: CN ~21,000 per horizon ; TOTAL ~5,000 per horizon (ít hơn vì không phân theo CN)
SELECT ds.level, ds.horizon_start, COUNT(dsl.*) AS lines,
       COUNT(DISTINCT dsl.item_code) AS skus,
       COUNT(DISTINCT dsl.location_code) AS locs,
       SUM(dsl.qty) AS total_qty
FROM demand_snapshot ds
JOIN demand_snapshot_line dsl ON dsl.snapshot_id = ds.snapshot_id
GROUP BY ds.level, ds.horizon_start
ORDER BY ds.horizon_start, ds.level;

-- v1.2: FK check — scope theo level='CN'; level='TOTAL' dùng sentinel 'TOTAL' nên không check channel.
-- Expected: 0
SELECT COUNT(*) FROM demand_snapshot_line dsl
JOIN demand_snapshot ds ON ds.snapshot_id = dsl.snapshot_id
WHERE ds.level = 'CN'
  AND (
    NOT EXISTS (SELECT 1 FROM sku     WHERE sku.sku_code  = dsl.item_code) OR
    NOT EXISTS (SELECT 1 FROM channel WHERE channel.cn_code = dsl.location_code)
  );

-- v1.2: TOTAL chỉ check item_code FK
-- Expected: 0
SELECT COUNT(*) FROM demand_snapshot_line dsl
JOIN demand_snapshot ds ON ds.snapshot_id = dsl.snapshot_id
WHERE ds.level = 'TOTAL'
  AND NOT EXISTS (SELECT 1 FROM sku WHERE sku.sku_code = dsl.item_code);
```

### 6.3 Hub cluster & NM assignment (v1.2, PRD F0.6.2 #11/#12)
```sql
-- Pre-check: channel.region ⊆ hub.region? Nếu có dư → CN đó sẽ qua nhánh haversine-fallback.
-- v1.3 note: CN `MIEN_BAC` (nếu Bravo có) sẽ assign vào hub Nam gần nhất (~1,500km) — DRY_RUN
-- PHẢI alert distance_km > 800 cho bất kỳ row nào trong hub_cn_cluster.
SELECT DISTINCT c.region AS channel_region FROM channel c
EXCEPT
SELECT DISTINCT h.region FROM hub h;
-- Expected: empty (nếu không empty → log WARN + cho qua → haversine fallback ở Decision 2.9)

-- Mỗi CN active PHẢI có đúng 1 primary hub
-- Expected: 68 = COUNT(DISTINCT cn_id) và COUNT(*) = 68
SELECT COUNT(DISTINCT cn_id) AS unique_cn, COUNT(*) AS total_rows
FROM hub_cn_cluster WHERE active;

-- CN chưa được assign hub
-- Expected: 0 rows
SELECT c.cn_code FROM channel c
WHERE c.active = true
  AND NOT EXISTS (SELECT 1 FROM hub_cn_cluster hcc WHERE hcc.cn_id = c.id AND hcc.active);

-- Mỗi hub phải có ≥1 NM (view từ phía hub)
SELECT h.hub_code, h.region, COUNT(hna.id) AS n_nm
FROM hub h
LEFT JOIN hub_nm_assignment hna ON hna.hub_id = h.id AND hna.active
GROUP BY h.hub_code, h.region
ORDER BY n_nm ASC;
-- Expected: min ≥ 1 cho tất cả 19 hub

-- v1.3: Mỗi NM active phải thuộc ≥1 hub (view từ phía supplier)
-- — query này phát hiện bug NM Bắc orphan mà query trên không thấy.
-- Expected: 0 rows
SELECT sup.supplier_code, sup.region
FROM supplier sup
WHERE sup.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM hub_nm_assignment hna
     WHERE hna.nm_id = sup.id AND hna.active
  );
```

### 6.4 ABC distribution sanity check
```sql
SELECT abc_class, COUNT(*) FROM sku WHERE abc_class IS NOT NULL GROUP BY abc_class;
-- Expected: A ≤ 20%, B ≈ 30%, C ≥ 50% (Pareto)
```

### 6.5 Consistency check ΣCN vs TOTAL (v1.2, FR-F1B1-003)
Xem Decision 2.8 — query consistency đã đặc tả tại mục "Secondary action 1".

---

## 7. Known risks & open questions

### 7.1 RISK-01: Color_tail sẽ mất trong forecast consumption
Khi M23 DRP đọc demand snapshot → nhận `forecast_qty` per `(cn_code, sku_code)`. Output variant_breakdown của M24 đề xuất split demand per variant — nhưng chỉ dựa trên tồn kho, không dựa trên preference. Chấp nhận limitation này cho Phase 1.

### 7.2 RISK-02: lead_time_days = 7 (placeholder)
Sẽ sai ±3 ngày cho nhiều NM. M26 NM ATP check có thể báo `CRITICAL` sai. **Acceptance criteria:** cho phép sai số LT 30% trong Phase 1; M28 feedback sẽ tự refine qua `lt_actual_log` sau khi có actual PO received.

### 7.3 RISK-03: transport_lane distance dùng centroid → multi-drop có thể merge sai
Sai số centroid ±30km có thể khiến 2 CN xa thực tế lại merge multi-drop. Chấp nhận vì test DRP flow, không test routing optimization chính xác.

### 7.4 RISK-04 (v1.2): Không có bảng `route` — F2-B5 multi-drop dùng distance-threshold
PRD F0.3.2 + F0.6.2 #15 quy định tuyến (route) cho multi-drop consolidation. DB `unis_scp_flow1_test_20260421_01` **không có** bảng `route`/`transport_route`. Hiện backend M25 dùng `system_config.transport.max_multidrop_distance_km=200` + haversine. Phase 1 chấp nhận. Phase 2: tạo bảng `route(route_code, region, vehicle_type)` + bridge `route_cn(route_id, cn_id, stop_order)`.

### 7.5 RISK-05 (v1.2): MOQ=500 + supplier.lt_sigma=NULL là PLACEHOLDER
- MOQ=500 m² fixed cho 5,783 SKU × 73 NM = ~9,000 mapping rows. Thực tế MOQ biến thiên 100-2,000 m². M13 prod-lot-sizing sẽ gợi ý lượng sai.
- `supplier.lt_sigma=NULL` → M23 SS Hub formula `SS = z·√(LT·σ²_demand + ADU²·σ²_LT)` mất thành phần σ_LT. Fallback: `system_config.default_lt_sigma_days=1` (khoảng 14% trung bình). M28 feedback sẽ refine qua `lt_actual_log`.
- **Acceptance criteria Phase 1:** chấp nhận sai số ss_cn hoặc ss_hub ±50%; M28 drift alert sẽ trigger sau 2-3 tuần có actual data.

### 7.6 RISK-06 (v1.2): uom `VIEN` vs m² — conversion buộc tại import
Trước v1.2 demand (m²) và inventory Bravo (viên) lệch đơn vị. v1.2 normalize `sku.uom='m2'` + thêm `conversion_vien_per_m2`. Conversion factor dựa `transport_spec` look-up bảng tĩnh (25x40 →10 viên/m²...). SPPT (phụ kiện nhựa/keo) → NULL, vẫn qty raw. Cảnh báo: nếu Bravo thêm kích thước mới (VD 15x90) mà bảng quy đổi không cập nhật → fallback 4 viên/m² âm thầm (cần log WARN tại import).

### 7.7 OPEN-01: `branch_corporation=222` (LOTINA) → có cần tenant isolation?
Hiện có 2 tổng công ty (000=UNIS, 222=LOTINA). UNIS schema chưa có tenant concept (single-tenant). Proposal: giữ `tenant_code` column nhưng không enforce isolation trong queries. Nếu cần multi-tenant sau → thêm middleware filter.

### 7.8 OPEN-02: Segment A/B/C từ drp_export vs `sku.abc_class`
1 SKU có thể có segment khác nhau ở CN khác nhau (A ở HCM, C ở Lâm Đồng). Mode-aggregation lấy giá trị phổ biến nhất → loss signal. Cân nhắc giữ segment ở level `demand_snapshot_line` và KHÔNG update `sku.abc_class`.

### 7.9 OPEN-03: `run_id=W9_20260406` — chỉ 1 version
Data chỉ có 1 forecast run. Khi test M28 feedback drift (cần nhiều run), sẽ phải mock thêm run_id cũ. Phase 1: test single-run flow. Phase 2: user cung cấp historical runs.

---

## 8. Next steps (không thực hiện trong lần viết spec này)

Theo `E2E-TESTING-PLAYBOOK.md` Section 5.4-5.8, các bước tiếp theo sẽ là:

1. **User review spec này** và duyệt 9 decisions + 4 migrations (v1.3; Decision 2.9 có nhánh B fallback cho NM Bắc)
2. **Tạo 4 migrations** ở Section 5.1-5.4 và apply (5.5/5.6 huỷ, không cần viết SQL)
3. **Tạo `backend/scripts/import-real/`** với 10 script tuần tự:
   - `00-geocode-lookup.js` — load centroid JSON, expose helpers
   - `01-import-supplier.js`
   - `02-import-hub.js`
   - `03-import-channel.js`
   - `04-import-sku.js` (kèm conversion_vien_per_m2)
   - `05-import-sku-nm-mapping.js`
   - `06-import-transport-lane.js` (3 loại lane)
   - `07-import-hub-cluster.js` (v1.2: hub_cn_cluster + hub_nm_assignment)
   - `08-import-demand-cn.js` (level='CN')
   - `09-import-demand-total.js` (v1.2: level='TOTAL' rollup)
4. **Mỗi script có 2 mode:** `DRY_RUN=true` (default, validate + count) và `CONFIRM_IMPORT=YES` (execute)
5. **Sau mỗi script:** chạy validation queries Section 6 tương ứng
6. **M00 quality check final:** `GET /api/v1/master-data/quality` expect tất cả fields = 0
7. **Bật feature flags cần test + commit import xong** → sang Section 6.2 (M21 Supply) của playbook

---

## 9. Related documents

- `docs/specs/M00-master-data-platform.md` — canonical M00 spec
- `docs/specs/E2E-TESTING-PLAYBOOK.md` — quy trình test tổng quát
- `docs/specs/M00-QA-testcases.md` — test cases có sẵn
- `docs/DATA-FLOW.md` — ownership rules
- `progress.txt` — live session tracking
- `backend/scripts/_data-inspect.js` — script đã dùng để analyze real data

---

*M00-REAL-DATA-MAPPING.md v1.3 — 2026-04-22*
*Status: PROPOSED — chờ user review trước khi implement.*
*Author: Cascade (techlead pair) + User (UNIS CEO).*
*v1.1: schema đồng bộ với live DB (9 bảng qua `information_schema`).*
*v1.2: căn chỉnh PRD F0/F1-B1 — 3 loại transport_lane, hub_cn_cluster/hub_nm_assignment, demand TOTAL, uom conversion, hub_type PHYSICAL, MOQ/LT placeholders rõ ràng; region centroid MIEN_NAM/UNKNOWN, validation queries 3-lane/8-snapshot, ASCII diagram redrawn, Section 6.3 cluster/assignment checks, typo fixes.*
*v1.3: fix BUG NM Bắc orphan trong hub_nm_assignment (thêm nhánh fallback + validation supplier-side); note CN-Bắc haversine fallback trong pre-check.*
