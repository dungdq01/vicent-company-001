# BÁO CÁO TIẾN ĐỘ HỆ THỐNG UNIS SCP — TOÀN DỰ ÁN

**Ngày:** 24/04/2026
**Phạm vi báo cáo:** Toàn bộ hệ thống Supply Chain Planning v2.0 — bao gồm
- **Foundation:** M00 (Master Data) · M10 (System Config)
- **Flow 1 — S&OP tháng (M11 → M17):** Quy trình hoạch định nhu cầu và cam kết với nhà máy
- **Flow 2 — DRP đêm (M21 → M28):** Quy trình tái cấp hàng, phân bổ và vận chuyển hằng đêm
**Mục đích:** Cập nhật tiến độ vận hành và kết quả nghiệm thu với Ban Lãnh Đạo

---

## I. TÓM TẮT TIẾN ĐỘ

| Hạng mục | Trạng thái | Đánh giá |
|---|---|---|
| **Foundation (M00, M10)** | Hoàn thiện | Master data đã import; cấu hình hệ thống đầy đủ |
| **Flow 1 — S&OP tháng (7 module)** | Hoàn thiện logic & UI | Pipeline tháng đã chạy được 2 chu kỳ thử |
| **Flow 2 — DRP đêm (8 module)** | Hoàn thiện logic & UI | Pipeline đêm chạy thông end-to-end |
| Chạy thử toàn pipeline (E2E) | Đã chạy thành công | 2 luồng đều thông |
| Bug nghiệm thu nghiêm trọng | Đóng 3/3 | Đã có kiểm thử tự động bảo vệ |
| Cải tiến trải nghiệm người dùng | 14 form đã có gợi ý chọn nhanh | Người dùng không phải nhớ mã thủ công |
| Sẵn sàng demo cho khách | Phụ thuộc dữ liệu thật | Cần Bravo + delivery log từ nhà máy |

**Kết luận chung:** **15 module nghiệp vụ + 2 module nền** đã hoàn thiện logic, giao diện, và kết nối liên module. Hệ thống đã chạy thông toàn bộ 2 luồng trên dữ liệu giả lập. **Blocker duy nhất** để chuyển sang nghiệm thu chính thức là chưa có dữ liệu vận hành thật từ Bravo (tồn kho) và lịch sử giao hàng từ nhà máy.

---

## II. NỘI DUNG ĐÃ LÀM TRONG TỪNG MODULE

> Phần này mô tả **logic nghiệp vụ** của từng module — hệ thống thực sự làm gì cho doanh nghiệp.

### A. FOUNDATION

#### 🟣 M00 — Master Data (Dữ liệu nền)

**Logic nghiệp vụ:**
- Quản lý toàn bộ danh mục cốt lõi: **SKU (mã hàng), Channel (chi nhánh), Supplier (nhà máy), Hub (trung tâm trung chuyển), Customer (khách hàng)**.
- Cho phép import từ file CSV, audit log mọi thay đổi.
- Kiểm tra chất lượng dữ liệu: SKU không có mapping NM, chi nhánh thiếu lat/lng, NM không có SKU mapping, SKU không có supply gần đây.

**Đã hoàn thiện:** Import 5,617 SKU (1,679 active) + 71 chi nhánh + 73 nhà máy ACTIVE + bộ HUB. Audit trail đầy đủ.

#### 🟣 M10 — System Config (Cấu hình hệ thống)

**Logic nghiệp vụ:**
- Tập trung 91 tham số điều hành: ngưỡng tồn an toàn, tolerance commitment, thời gian SLA, ngày cắt chu kỳ S&OP, ngưỡng cảnh báo fill_rate, v.v.
- Quản lý 18 feature flag để bật/tắt module mà không cần deploy lại.
- Quản lý người dùng + phân quyền (RBAC).

**Đã hoàn thiện:** Toàn bộ tham số có giá trị mặc định. Giao diện có tab "Chu kỳ hoạch định" cho phép admin chỉnh nhanh các tham số quan trọng nhất.

⚠️ **Hạn chế hiện tại:** Tab cấu hình mới surface khoảng 11/91 tham số. Các nhóm còn lại (transport, ATP, feedback, lcnb, ...) admin phải nhờ kỹ sư SQL.

---

### B. FLOW 1 — S&OP THÁNG (M11 → M17)

> **Nhịp chạy:** Hằng tháng. Đầu tháng chốt forecast → giữa tháng cam kết với nhà máy → cuối tháng theo dõi gap thực tế.

#### 🔵 M11 — Lập Forecast Nhu Cầu (Demand Forecast v2)

**Logic nghiệp vụ:**
- Tổng hợp **forecast baseline** từ lịch sử bán hàng + **B2B deal** từ pipeline kinh doanh (deal đang Lead/Qualified/Proposal/Committed/Confirmed) với xác suất tương ứng (10/40/65/85/100%).
- Hỗ trợ 2 cấp độ: **TOTAL** (tổng) và **CN-level** (chi tiết theo chi nhánh).
- Mỗi forecast được lưu thành **Snapshot** với scope (ALL / CN_LIST / REGION) và horizon (3-24 tháng).
- Snapshot có 3 trạng thái: **DRAFT → FROZEN → ARCHIVED**.

**Đã hoàn thiện:**
- Form nhập forecast với gợi ý chọn nhanh chi nhánh + SKU.
- Pivot view theo tháng, có search debounce.
- Quản lý B2B deal với form nhập thông tin đối tác, dòng SKU, milestone.
- Cảnh báo khi B2B deal có dấu hiệu lost > 500 triệu.

#### 🔵 M12 — S&OP Consensus (Hội đồng tháng)

**Logic nghiệp vụ:**
- Mỗi tháng có **1 chu kỳ S&OP** với các deadline cố định: ngày 3 (Trade chốt), ngày 5 (Demand chốt), ngày 7 (Supply chốt), ngày 10 (Tổng giám đốc duyệt).
- Cho phép các phòng ban (Sales, Marketing, Production, Supply) cùng đề xuất điều chỉnh forecast.
- Tự động **lock** vào ngày 7 nếu chưa có quyết định cuối → fallback v0 (forecast gốc).
- Tracking **variance** giữa các phiên bản → nếu lệch > 10% so với baseline phải có lý do.

**Đã hoàn thiện:**
- Workflow 4 deadline với cảnh báo khi sắp hết hạn.
- Tracking 2 chu kỳ S&OP đã chạy thử (1 LOCKED, 1 DRAFT).
- Tham số `aop.variance_threshold_pct = 10%`.

#### 🔵 M13 — Production Lot Sizing (Lập lô sản xuất)

**Logic nghiệp vụ:**
- Sau khi forecast được chốt ở M12, tính **lô sản xuất tối ưu** cho từng nhà máy:
  - Đảm bảo MOQ (số lượng tối thiểu).
  - Tính theo công thức Wagner-Whitin (tối ưu chi phí giữ tồn vs setup).
  - Phân bổ horizon sản xuất 4-12 tuần.

**Đã hoàn thiện:** Trang `/prod-lot-sizing` với input forecast → output lô sản xuất theo tuần. Admin có thể override.

#### 🔵 M14 — FC Commitment (Cam kết với nhà máy)

**Logic nghiệp vụ — module quan trọng nhất Flow 1:**
- Sau S&OP, tạo **3 tier cam kết** cho mỗi nhà máy:
  - **HARD** (~5% tolerance): cam kết chắc chắn, nhà máy phải giao đủ — gắn với Purchase Order chính thức.
  - **FIRM** (~15% tolerance): cam kết mạnh, có flex nhỏ.
  - **SOFT** (~30% tolerance): dự báo mềm, dùng để nhà máy chuẩn bị nguyên liệu.
- Mỗi commitment kèm **deadline phản hồi** (5 ngày SLA), reminder ngày thứ 3.
- Tracking **trust score** của mỗi nhà máy (dựa trên độ chính xác lịch sử).

**Đã hoàn thiện:**
- **1,702 commitment** đã tạo (567 HARD + 567 FIRM + 568 SOFT) trên data thử.
- UI hiển thị 3 tier với màu phân biệt, tolerance bar.
- Workflow generate → send → wait response → escalate.

#### 🔵 M15 — NM Response (Phản hồi từ nhà máy)

**Logic nghiệp vụ:**
- Mỗi nhà máy phản hồi từng commitment: **ACCEPT / PARTIAL / REJECT** kèm lý do.
- Có cơ chế **negotiation rounds** (tối đa 3 vòng) — nếu sau 3 vòng vẫn chưa đồng thuận → tự động force-close.
- SLA: 5 ngày phản hồi, reminder ngày 3, escalate nếu quá hạn.
- Tự động bỏ qua SLA cho tier SOFT (`nm.sla_skip_soft_tier = true`).

**Đã hoàn thiện:**
- **1,702 phản hồi** đã được tạo (1:1 với commitment).
- Tracking trạng thái timeline: SENT → ACK → RESPONDED → CLOSED.
- Workflow negotiation với history audit.

#### 🔵 M16 — Hub Virtual (Trung tâm trung chuyển ảo)

**Logic nghiệp vụ:**
- Cho phép cấu hình các **HUB ảo** — điểm trung chuyển nhóm nhiều chi nhánh nhỏ thành cluster.
- Mỗi HUB có: cluster các CN trực thuộc, NM gán vào, snapshot tồn kho ảo.
- Dùng cho M24 LCNB: khi CN A thiếu, có thể lấy từ HUB chứ không phải từng CN khác.
- Có cảnh báo `nm_drop_alert_threshold_pct = 10%` khi NM giảm cấp đột ngột.

**Đã hoàn thiện:** UI cấu hình HUB + cluster + assignment NM. Snapshot tự động tính.

#### 🔵 M17 — Gap Scenario (Cảnh báo chênh lệch)

**Logic nghiệp vụ:**
- Theo dõi **gap giữa forecast và thực tế** trong tháng:
  - Ngày 20: cảnh báo nếu gap > 15%.
  - Ngày 25: escalate nếu gap > 10% (cảnh báo CEO).
  - Ngày 30: tự động đóng gap chưa giải quyết.
- Cho phép planner chọn **kịch bản xử lý** (scenario decision): tăng SS, đặt hàng emergency, redistribution, hoãn cam kết.

**Đã hoàn thiện:**
- **1,879 gap snapshot** đã tracking.
- UI có dashboard view theo ngày + filter theo nhà máy / chi nhánh.
- Workflow scenario decision với reason ≥ 20 ký tự.

---

### C. FLOW 2 — DRP ĐÊM (M21 → M28)

> **Nhịp chạy:** Hằng đêm. Sau khi data Bravo về → tính nhu cầu → phân bổ → lập xe → kiểm tra ATP → tạo TO → học từ kết quả tuần.

#### 🟢 M21 — Đồng bộ tồn kho thực tế (Data Sync)

**Logic nghiệp vụ:**
- Đêm nào hệ thống cũng kéo dữ liệu tồn kho thực tế từ Bravo (ERP) của từng nhà máy.
- Mỗi nhà máy tạo 1 "snapshot" — tấm ảnh chụp tồn kho tại thời điểm chốt sổ.
- Kiểm tra "độ tươi" của dữ liệu: nếu nhà máy nào chưa đồng bộ trong 24h → **chặn DRP đêm** không cho chạy (tránh tính nhu cầu bằng dữ liệu cũ → đặt hàng sai).
- Có **"Force Override"** cho Trưởng phòng kế hoạch trong trường hợp khẩn cấp, kèm lý do (audit log).

**Đã hoàn thiện:**
- Chốt snapshot mỗi đêm theo nhà máy.
- Cảnh báo nhà máy chưa đồng bộ, gửi nhắc tự động.
- Phân biệt 3 tầng độ tươi: NM-level / dòng tồn kho / lô hàng — đã có tooltip giải thích trên UI.

#### 🟢 M22 — Điều chỉnh nhu cầu cấp chi nhánh (CN Demand Adjust)

**Logic nghiệp vụ:**
- Forecast Trung tâm đôi khi không sát thực tế chi nhánh (vd: chi nhánh sắp khuyến mãi, hoặc dự án bị hoãn).
- Module cho phép **chi nhánh đề xuất điều chỉnh** với 6 mã lý do: NEW_PROJECT / PROJECT_DELAY / COMPETITOR_PROMO / WEATHER / OWN_PROMO / OTHER.
- Giới hạn dung sai ±30% — nếu vượt → cần Trung tâm phê duyệt.
- Cắt deadline 18:00 mỗi ngày.

**Đã hoàn thiện:**
- Form đề xuất với gợi ý chọn nhanh chi nhánh + SKU.
- Workflow Submit → Approve/Reject với lý do.
- Tracking lịch sử các điều chỉnh đã phê duyệt.

#### 🟢 M23 — Tự động tính nhu cầu bổ sung (DRP Netting)

**Logic nghiệp vụ — "trái tim" của Flow 2:**
- Mỗi đêm, tính cho từng cặp **(Chi nhánh × SKU × Tuần)**:
  - **Nhu cầu hiệu lực** = forecast Trung tâm + điều chỉnh từ M22
  - **Tồn dự kiến** = tồn hiện tại + đang về (in-transit)
  - **Tồn an toàn** = `z × σ × √LT × (1 − LCNB%)` — tự động giảm tồn an toàn ở các CN có thể chia sẻ hàng cho nhau.
  - **Số cần đặt** = Nhu cầu − Tồn dự kiến + Tồn an toàn
- Phân loại 3 trạng thái: NORMAL / OVER_STOCK / STOCKOUT_RISK.

**Đã hoàn thiện:**
- Cron đêm tự động cho horizon 4 tuần.
- Force Rerun với lý do bắt buộc ≥ 20 ký tự.
- E2E thử: **37,138 ô tính, 4,232 đơn lập kế hoạch trong 30 giây.**

#### 🟢 M24 — Phân bổ tồn kho & cân đối liên chi nhánh (Allocation/LCNB)

**Logic nghiệp vụ:**
- Sau khi M23 ra danh sách "cần bao nhiêu", M24 quyết định **lấy hàng từ đâu**:
  - **Ưu tiên FIFO**: lô nhập trước, xuất trước.
  - **LCNB**: nếu CN A thiếu mà CN B (gần đó, ≤500km) đang dư → chuyển ngang giữa CN.
  - **HUB ảo fallback** nếu LCNB không đủ.
  - **Escalate Văn phòng tổng** nếu không có nguồn nào trong bán kính.
- Phân loại đơn: FULL / PARTIAL / UNALLOCATED.
- Tính **tỷ lệ đáp ứng (fill_rate)** cho từng dòng và toàn run.

**Đã hoàn thiện:**
- E2E thử: **3,562 đơn FULL, 658 chưa cấp được, 3,666 chuyến điều chuyển nội bộ.**
- Filter CN/SKU/loại đơn xử lý ở server → phân trang chính xác.
- Tỷ lệ đáp ứng tự động lưu vào DB (mới sửa trong sprint này).

#### 🟢 M25 — Lập kế hoạch vận chuyển (Transport)

**Logic nghiệp vụ:**
- Gom đơn cần xuất thành các **chuyến xe**:
  - Đầy tải ≥ 60%.
  - Multi-drop trong bán kính 200km.
  - Tối đa 20 pallet/xe.
- **Top-up** SKU khác cùng tuyến nếu xe còn chỗ.
- **Hold trip** tối đa 2 ngày để gom thêm hàng.

**Đã hoàn thiện:**
- Quản lý lane / carrier / giá cước.
- E2E thử: **184 chuyến / 191,652 kg, fill ratio trung bình ~60%.**

#### 🟢 M26 — Kiểm tra khả năng cam kết của nhà máy (NM-ATP)

**Logic nghiệp vụ:**
- Hỏi nhà máy: **"Có thể giao đúng hạn không?"**
- Tính ATP dựa trên: tồn nhà máy + đang sản xuất + **honoring rate** 3 tháng + lead time thực tế.
- Phân loại PASS / PARTIAL / FAIL → đơn FAIL phải tìm nhà máy thay thế.
- Xếp hạng **Critical CN** — chi nhánh sắp hết hàng, ưu tiên cấp.

**Đã hoàn thiện:**
- Pipeline chạy thông.
- Bảng xếp hạng Honoring cho ban giám đốc.
- ⚠️ **Bảng kết quả còn trống** vì cần dữ liệu lịch sử giao hàng thật. Đã thêm thông báo trên UI.

#### 🟢 M27 — Duyệt đơn chuyển kho (PO/TO Review)

**Logic nghiệp vụ:**
- Tổng hợp M24 + M25 + M26 → tạo **Transport Order (TO)** chuyển kho nội bộ.
- Workflow planner: Duyệt nháp → Xác nhận → Theo dõi → Đóng đơn.
- Cho phép chỉnh tay (audit log).
- Theo dõi đơn quá hạn 7 ngày.

**Lưu ý quan trọng:**
- M27 **chỉ tạo Transport Orders (TO)** cho vận chuyển nội bộ.
- **Purchase Orders (PO)** với nhà máy do **M14 — FC Commitment (Flow 1)** đảm nhiệm.
- → Đã làm rõ ngay tiêu đề trang.

**Đã hoàn thiện:** E2E thử: **1,029 TO DRAFT** sẵn sàng cho planner duyệt.

#### 🟢 M28 — Vòng tự học (Feedback Loop)

**Logic nghiệp vụ — module "thông minh":**
- Mỗi sáng thứ Hai 06:00, chạy 9 bước phản hồi tự động:
  1. **SS Auto-Adjust**: tự điều chỉnh tồn an toàn nếu sigma demand thay đổi >20%, cap ±50%.
  2. **LT Auto-Update**: cập nhật lead time nếu lệch >30% và có ≥5 mẫu.
  3. **Trust Score Refresh** cho NM/CN.
  4. **Honoring Backfill** cập nhật xếp hạng NM.
  5. **Override Analysis**: phân tích pattern can thiệp tay của planner.
  6. **KPI Snapshot**: chốt fill_rate, MAPE, transport fill, system accuracy.
  7. **Alerts**: cảnh báo nếu fill_rate < 85% trong 2 tuần liên tiếp.
- Idempotency: 1 tuần = 1 snapshot. Force-rerun cần lý do.

**Đã hoàn thiện:**
- Cron tự động Monday 06:00 (timezone Việt Nam, không bị drift DST).
- E2E thử: **18,569 cặp được auto-adjust SS** trong 1 lần chạy, transport fill avg 59.8%.
- Debug panel cho tester recompute thủ công 1 cặp bất kỳ.

---

## III. TRẠNG THÁI DỮ LIỆU

### Master data đã có (M00)
| Thực thể | Số lượng | Nguồn |
|---|---:|---|
| Mã hàng (SKU) | 5,617 (1,679 active) | Đã import |
| Chi nhánh (CN) | 71 | Đã import |
| Nhà máy (NM) | 73 đang hoạt động | Đã import |
| Mapping SKU × CN | 18,569 cặp active | Đã seed |

### Flow 1 — Dữ liệu đã chạy
| Bảng | Số liệu | Ghi chú |
|---|---:|---|
| Demand Snapshot (M11) | 2 snapshot, 83,524 dòng FROZEN | Q4/2025 + Q1/2026 |
| B2B Deal (M11) | 1 deal mẫu | Đã có UI tạo mới |
| S&OP Cycle (M12) | 2 chu kỳ (1 LOCKED, 1 DRAFT) | Workflow đã chạy |
| FC Commitment (M14) | **1,702 commitment** | 567 HARD / 567 FIRM / 568 SOFT |
| NM Response (M15) | **1,702 phản hồi** | 1:1 với commitment |
| Hub Virtual (M16) | 4 bảng cấu hình | UI đã có |
| Gap Snapshot (M17) | **1,879 gap tracking** | Workflow scenario decision sẵn sàng |

### Flow 2 — Dữ liệu đã chạy E2E
| Bảng | Số liệu | Ghi chú |
|---|---:|---|
| Snapshot Supply (M21) | 146 snapshot | **Synthetic seed** — chưa có Bravo thật |
| Plan Run (M23) | 7 lần COMPLETED | Latest: 37,138 ô / 4,232 đơn |
| Allocation Run (M24) | 7 lần COMPLETED | Latest: 3,562 FULL / 658 chưa cấp / 3,666 LCNB legs |
| Transport Plan (M25) | 7 plan COMPLETED | Latest: 184 chuyến / 191,652 kg |
| ATP Run (M26) | 7 lần | Bảng kết quả còn trống — chờ data thật |
| PO Run (M27) | 7 lần | 0 PO / **1,029 TO** sẵn sàng |
| Weekly KPI (M28) | 3 snapshot COMPLETED | 18,569 SS auto-adjust |

### Dữ liệu CHƯA có (blockers cho nghiệm thu)

#### 🔴 Bắt buộc — module không thể chạy đầy đủ nếu thiếu

| Loại dữ liệu | Tình trạng | Module bị ảnh hưởng | Tác động |
|---|---|---|---|
| **Tồn kho thực tế từ Bravo** | Đang dùng synthetic seed (`avg_demand × 4 tuần`) | M21, M23, M24 | Số liệu E2E không phản ánh thực tế |
| **Lịch sử giao hàng (lt_actual_log)** | 0 dòng | M28 LT auto-update | Module chạy nhưng không học được lead time |
| **Tỷ lệ giao đúng hẹn (nm_honoring_rate)** | 0 dòng | M26 ATP, M28 trust refresh | Bảng kết quả ATP và xếp hạng NM trống |
| **Master data nhà xe (carrier)** | 0 nhà xe | M25 gán xe vào trip | Không gán được trip dù lane có 10,102 tuyến |

#### 🟡 Nice-to-have — không blocking nhưng cần để demo đẹp

| Loại dữ liệu | Tình trạng | Tác động |
|---|---|---|
| **Forecast Q2-Q3/2026** | Không có. Demand hiện tại Q4/2025-Q1/2026 đã qua hạn | Phải dịch +20 tuần khi demo (đã có script seed) |
| **B2B Deal pipeline** | 1 deal mẫu | Không đủ để demo phần forecast B2B |
| **Trust score backfill** | 1 record | Cần backfill cho 73 NM |
| **PO header (M14 generate)** | 0 dòng | Đã có 1,702 commitment + 1,702 NM response, nhưng PO chưa được tạo từ chuỗi này. Cần verify M14 có generate PO không |

---

## IV. CÁC VẤN ĐỀ ĐÃ XỬ LÝ TRONG SPRINT GẦN NHẤT

### Bug nghiệm thu nghiêm trọng đã đóng
1. **Trigger Run đôi khi báo lỗi nhưng pipeline thực sự chạy thành công** — gây người dùng bấm Run nhiều lần tạo run trùng. Đã có cơ chế tự xác minh kết quả qua helper poll.
2. **Filter danh sách ở M24 mất dữ liệu khi phân trang** — đã chuyển toàn bộ filter sang server-side (4 tham số: itemCode, destLocationCode, sourceLocationCode, abcClass).
3. **Naming sai giữa frontend và backend ở M27** — đã thống nhất `forceRerunReason` 1:1, có contract test bảo vệ.

### Cải tiến trải nghiệm người dùng
- **14 input "gõ mã thủ công" → gợi ý chọn nhanh** trên 7 form (M22, M23, M25, M28, M11 B2B, demand override, ...).
- Tooltip giải thích 3 tầng "độ tươi dữ liệu" ở M21.
- Thông báo rõ ràng ở M26 khi chưa có data: "Cần dữ liệu từ M15 delivery log".
- Subtitle M27 làm rõ: "M27 tạo TO; PO từ M14".

### Đồng bộ cấu hình hệ thống
- Sửa 1 mismatch tên flag giữa code và database (`m24_allocation_lcnb_enabled`).
- Seed thêm 1 tham số bị thiếu (`po.overdue_days = 7`) → cron M27 không còn log warning.

### Tính tỷ lệ đáp ứng đầy đủ
- `fill_rate_overall` (run-level) và `fill_rate` (row-level) đều được tự động tính khi allocation run COMPLETED. Frontend không phải compute client-side nữa.

---

## V. CÁC CÂU HỎI CẦN BAN LÃNH ĐẠO QUYẾT ĐỊNH

1. **Khi nào có thể kéo dữ liệu Bravo thật?**
   Cần phối hợp phòng IT-ERP để mở connector. Đây là blocker duy nhất cho nghiệm thu Flow 2 thực sự.

2. **Có thể yêu cầu nhà máy báo cáo lịch sử giao hàng 3 tháng gần nhất?**
   M26 (ATP) và M28 (LT auto-update) cần dữ liệu này để có ý nghĩa. Không có → 2 module chỉ "chạy được" chứ không "thông minh".

3. **Forecast Q2-Q3/2026 đã có chưa?**
   Nếu có → demo trên data thật. Nếu chưa → vẫn dùng được data Q1 nhưng phải dịch chuyển +20 tuần khi demo.

4. **Có cần admin tự edit cấu hình hệ thống qua giao diện Web không?**
   Hiện tại 91 tham số chỉ có 11 surface trên giao diện. Còn lại admin phải nhờ kỹ sư SQL.
   Mở rộng giao diện cấu hình mất khoảng 1-2 ngày.

5. **Có cần phân quyền chi tiết hơn theo vai trò không?**
   Hiện chỉ có ADMIN / PLANNER / VIEWER. Có cần tách Trưởng phòng vùng / Manager nhà máy / SC Manager riêng?

6. **Khi nào tổ chức nghiệm thu nội bộ?**
   Đề xuất sau khi có data Bravo + 1 tuần data forecast Q2 → mất ~1-2 tuần để set up.

---

## VI. NEXT STEPS ĐỀ XUẤT

### 🟢 Ưu tiên 1 — Tuần này (đưa lên data thật)
- Phối hợp IT-ERP **mở connector Bravo** (1-2 ngày).
- Yêu cầu phòng cung ứng cung cấp **lịch sử giao hàng 3 tháng** từ các nhà máy chính.
- Phòng vận chuyển cung cấp danh sách **carrier + giá cước**.
- Nếu có forecast Q2/2026 → import thay thế data Q4/2025-Q1/2026.
- Re-run Flow 1 + Flow 2 trên data thật, ghi báo cáo + screenshot để nghiệm thu nội bộ.

### 🟡 Ưu tiên 2 — 2 tuần tới (sẵn sàng go-live)
- Mở rộng giao diện cấu hình M10 cho tất cả nhóm tham số Flow 2 (transport, ATP, feedback, lcnb).
- Đào tạo planner chính + chi nhánh trưởng (~2 buổi).
- Chuẩn bị tài liệu vận hành (SOP) cho các tình huống force-override, force-rerun, scenario decision.
- Phân quyền chi tiết theo phòng ban.
- Verify chuỗi M14 → PO header generation (hiện 0 PO dù có 1,702 commitment).

### 🔵 Ưu tiên 3 — Tháng tiếp theo (cải tiến liên tục)
- Mở rộng kiểm thử tự động sang tất cả module Flow 1 (hiện đã có cho Flow 2).
- Theo dõi KPI tuần đầu, tinh chỉnh ngưỡng (SS cap, alert threshold, fill rate target).
- Mở rộng pattern UI gợi ý nhanh sang các form còn lại.
- Kết nối với Dashboard Cockpit (M9) để quản lý view tổng hợp KPI.

---

## VII. KẾT LUẬN

Toàn bộ **15 module nghiệp vụ** thuộc Flow 1 (S&OP tháng) và Flow 2 (DRP đêm), cùng **2 module nền** (M00 Master Data + M10 System Config) đã **hoàn thiện về logic nghiệp vụ và giao diện người dùng**.

- **Flow 1** đã chạy 2 chu kỳ S&OP, sinh 1,702 commitment với nhà máy, theo dõi 1,879 gap.
- **Flow 2** đã chạy thông end-to-end với 37,138 ô tính nhu cầu, 184 chuyến vận chuyển, 1,029 đơn chuyển kho, 18,569 cặp tự điều chỉnh tồn an toàn.

Hệ thống **sẵn sàng vận hành thử ngay** khi có 4 đầu vào quan trọng:
1. Tồn kho thực tế từ Bravo (M21).
2. Lịch sử giao hàng từ nhà máy (cho M15 ↔ M26 ↔ M28 có dữ liệu để học).
3. Master data carrier (cho M25 gán xe vào trip).
4. Forecast Q2/2026 (hoặc dịch +20 tuần khi demo).

Mọi bug nghiêm trọng đã được đóng và bảo vệ bằng kiểm thử tự động. Các findings non-blocking đã được xử lý hoặc làm rõ trên giao diện cho người dùng cuối.

**Đề xuất Ban Lãnh Đạo phê duyệt** khởi động giai đoạn **import dữ liệu thật** để chuyển sang nghiệm thu chính thức trong 2-3 tuần tới.

---

*Báo cáo được tạo từ kết quả test E2E và truy vấn database hệ thống ngày 24/04/2026. Toàn bộ số liệu trích xuất trực tiếp từ production data store.*
