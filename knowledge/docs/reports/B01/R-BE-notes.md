# Ghi Chú Kỹ Thuật Backend: B01 — Dự Báo & Chuỗi Thời Gian
## Bởi R-BE (Backend Engineer — Kỹ sư Backend) — Ngày: 2026-03-30

---

### 1. Thiết Kế API Cho Dịch Vụ Dự Báo

**REST vs gRPC:**
- Dùng **REST** cho API dự báo hướng bên ngoài (dễ tích hợp khách hàng, công cụ, bộ nhớ đệm qua HTTP).
- Dùng **gRPC** cho gọi nội bộ giữa dịch vụ khi độ trễ thấp và hợp đồng chặt chẽ quan trọng (ví dụ: server mô hình đến lớp điều phối).

**Schema Yêu Cầu (REST POST /forecasts):**
```json
{
  "entity_id": "store_42",
  "target_metric": "demand_units",
  "horizon": 28,
  "horizon_unit": "days",
  "features": { "price": 9.99, "promo": true },
  "as_of_date": "2026-03-30"
}
```

**Schema Phản Hồi:**
```json
{
  "forecast_id": "uuid",
  "entity_id": "store_42",
  "generated_at": "2026-03-30T08:00:00Z",
  "predictions": [
    { "date": "2026-03-31", "value": 120.5, "lower_80": 105.0, "upper_80": 138.0 }
  ],
  "model_version": "v2.3.1",
  "status": "completed"
}
```

**Các quy tắc thiết kế chính:**
- Luôn bao gồm `as_of_date` để cho phép tái tạo theo thời điểm (point-in-time).
- Trả về khoảng dự báo (không chỉ ước tính điểm) — người tiêu dùng cần đánh giá rủi ro.
- Ghi phiên bản mô hình trong phản hồi, không chỉ phiên bản API.
- Dùng `forecast_id` cho tất cả tham chiếu hạ nguồn (dấu vết kiểm toán).

---

### 2. Các Mẫu Phục Vụ Mô Hình

**Mục tiêu độ trễ theo trường hợp sử dụng:**
| Trường Hợp Sử Dụng | Độ Trễ Mục Tiêu | Mẫu |
|---|---|---|
| Định giá thời gian thực | < 50ms | Cache tính trước, phục vụ từ Redis |
| Bảng điều khiển tương tác | < 500ms | REST đồng bộ, lô nhỏ |
| Lô qua đêm | Phút–giờ | Hàng đợi job bất đồng bộ |

**Gom lô (Batching):**
- Chấp nhận mảng entity ID trong một yêu cầu để phân bổ chi phí tải mô hình.
- Giới hạn kích thước lô (ví dụ: 500 thực thể) để tránh vi phạm timeout. Dùng chia nhỏ ở phía khách hàng.

**Chiến lược bộ nhớ đệm (Caching):**
- Cache kết quả dự báo theo khóa `(entity_id, as_of_date, horizon, model_version)`.
- TTL nên phù hợp với tần suất huấn luyện lại — nếu mô hình huấn luyện lại hàng ngày, cache TTL = 23 giờ.
- Vô hiệu hóa khi phiên bản mô hình thay đổi hoặc kích hoạt dự báo lại bắt buộc.
- Dùng Redis với mẫu write-through cho thực thể nóng.

**Tính trước (Pre-computation):**
- Cho tập thực thể đã biết (ví dụ: tất cả SKU đang hoạt động), chạy lô ban đêm và cache kết quả. Phục vụ 99% yêu cầu từ cache; gọi mô hình trực tiếp chỉ làm phương án dự phòng.

---

### 3. Job Dự Báo Bất Đồng Bộ

**Khi nào dùng bất đồng bộ:**
- Tầm dự báo > 90 ngày, tập đặc trưng lớn, hoặc mô hình ensemble vượt 1–2 giây.
- Job dự báo lại hàng loạt được kích hoạt bởi làm mới dữ liệu.

**Mẫu — Hàng Đợi Job (ví dụ: Celery + Redis, BullMQ, hoặc cloud-native):**
```
POST /forecasts/jobs        → trả về { job_id, status: "queued" }
GET  /forecasts/jobs/{id}   → trả về { status, progress, result_url }
```

**Vòng đời trạng thái:** `queued → running → completed | failed`

**Xử lý timeout:**
- Đặt timeout cứng cho mỗi job (ví dụ: 5 phút). Khi timeout: status = `failed`, ghi lý do.
- Dùng backoff theo hàm mũ cho thử lại (tối đa 3 lần) chỉ cho lỗi tạm thời.
- Phân biệt lỗi có thể thử lại (503, timeout) với lỗi không thể thử lại (đầu vào không hợp lệ, schema không khớp).

**Thông báo Webhook:**
```json
POST {client_callback_url}
{
  "event": "forecast.completed",
  "job_id": "uuid",
  "entity_id": "store_42",
  "result_url": "https://api.example.com/forecasts/uuid"
}
```
- Ký payload webhook bằng HMAC-SHA256; bao gồm header `X-Signature`.
- Triển khai thử lại gửi với backoff theo hàm mũ (3 lần, 1 phút/5 phút/15 phút).

---

### 4. Lưu Trữ Kết Quả Dự Báo

**Mẫu schema (quan hệ):**
```sql
CREATE TABLE forecast_runs (
  forecast_id    UUID PRIMARY KEY,
  entity_id      VARCHAR(64) NOT NULL,
  model_version  VARCHAR(32) NOT NULL,
  as_of_date     DATE NOT NULL,
  generated_at   TIMESTAMPTZ NOT NULL,
  horizon_days   INT NOT NULL,
  status         VARCHAR(16) NOT NULL,
  metadata       JSONB
);

CREATE TABLE forecast_values (
  forecast_id    UUID REFERENCES forecast_runs(forecast_id),
  target_date    DATE NOT NULL,
  value          NUMERIC(14,4) NOT NULL,
  lower_80       NUMERIC(14,4),
  upper_80       NUMERIC(14,4),
  PRIMARY KEY (forecast_id, target_date)
);
```

**Lập chỉ mục:** `(entity_id, as_of_date, model_version)` cho tra cứu theo thời điểm; `(entity_id, target_date)` cho truy vấn phạm vi.

**Chính sách lưu giữ:** Giữ N phiên bản mô hình gần nhất cho mỗi thực thể. Lưu trữ các lần chạy cũ hơn sang cold storage (S3/GCS) sau 90 ngày. Không bao giờ xóa — cần cho kiểm toán mô hình.

**Phương án thay thế CSDL chuỗi thời gian:** Cho thực thể khối lượng cao, dùng TimescaleDB hoặc InfluxDB. Lưu `(entity_id, forecast_id, target_date, value)` dưới dạng hypertable.

---

### 5. SLA & Xử Lý Lỗi

**Định nghĩa SLA theo endpoint:**
| Endpoint | P50 | P99 | Ngân Sách Lỗi |
|---|---|---|---|
| Dự báo đồng bộ (cached) | 20ms | 100ms | 99.9% |
| Dự báo đồng bộ (trực tiếp) | 200ms | 1s | 99.5% |
| Hoàn thành job bất đồng bộ | 2 phút | 10 phút | 99% |

**Phân loại lỗi:**
- `400` — Đầu vào không hợp lệ (schema sai, thiếu thực thể, tầm dự báo không được hỗ trợ)
- `404` — Thực thể không tìm thấy trong feature store
- `422` — Lịch sử không đủ cho tầm dự báo yêu cầu
- `503` — Server mô hình không khả dụng (circuit breaker đã kích hoạt)
- `504` — Timeout thượng nguồn

**Circuit breaker (Bộ ngắt mạch):** Bọc các lời gọi server mô hình. Kích hoạt sau 5 lỗi 5xx liên tiếp trong 30 giây; bán mở sau 60 giây hạ nhiệt. Trả về dự báo cache cũ với header `X-Forecast-Stale: true` trong trạng thái mở.

**Suy giảm uyển chuyển (Graceful degradation):** Nếu mô hình trực tiếp không khả dụng, quay lại (1) kết quả cache, (2) baseline naive thống kê (giá trị cuối hoặc naive mùa vụ), (3) lỗi rõ ràng. Ghi lại phương án dự phòng trong metadata phản hồi.

---

### 6. Các Sai Lầm Backend Phổ Biến

- **Chỉ phục vụ ước tính điểm** — người tiêu dùng không thể đánh giá rủi ro nếu thiếu khoảng dự báo.
- **Không có tham số `as_of_date`** — khiến dự báo không tái tạo được và không kiểm thử được.
- **API đồng bộ cho mô hình tầm xa** — gây lỗi timeout dưới tải.
- **Vô hiệu hóa cache chỉ khi cập nhật thực thể** — quên rằng thay đổi phiên bản mô hình cũng vô hiệu hóa cache.
- **Lưu dự báo mà không có phiên bản mô hình** — không thể kiểm toán hoặc so sánh hồi tố.
- **Không giới hạn tốc độ trên endpoint hàng loạt** — một khách hàng có thể làm cạn kiệt server mô hình.
- **Bỏ qua khả dụng đặc trưng tại thời điểm suy luận** — mô hình huấn luyện trên đặc trưng T+1 nhưng phục vụ dùng đặc trưng T-7 cũ một cách âm thầm.
