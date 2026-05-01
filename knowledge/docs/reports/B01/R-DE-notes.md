# Ghi Chú Kỹ Thuật Dữ Liệu: B01 — Dự Báo & Chuỗi Thời Gian
## Bởi R-DE (Data Engineer — Kỹ sư Dữ liệu) — Ngày: 2026-03-30

---

### 1. Kiến Trúc Pipeline Dữ Liệu Cho Chuỗi Thời Gian

**Các mẫu thu thập dữ liệu:**

- **Thu thập theo lô (Batch ingestion)** — kéo từ CSDL quan hệ, CSV, xuất ERP theo lịch (hàng giờ/hàng ngày). Phù hợp khi tầm dự báo là ngày/tuần (ví dụ: lập kế hoạch nhu cầu hàng tháng).
- **Thu thập luồng (Streaming ingestion)** — Kafka, Kinesis, hoặc Pub/Sub cho cảm biến IoT, luồng nhấp chuột, giao dịch POS. Cần thiết khi yêu cầu độ tươi dưới phút (dự báo tải năng lượng, chấm điểm gian lận).
- **Kết hợp (Lambda/Kappa)** — lớp batch giữ dữ liệu lịch sử chính xác; lớp stream phục vụ N giờ gần nhất. Phổ biến trong dự báo nhu cầu bán lẻ khi doanh số hàng ngày đến theo lô nhưng sự kiện khuyến mại đến thời gian thực.

**Các nguồn dữ liệu điển hình cho chuỗi thời gian:**

| Loại Nguồn | Ví Dụ | Phương Pháp Thu Thập |
|---|---|---|
| CSDL giao dịch | PostgreSQL, MySQL | CDC (Debezium) hoặc trích xuất theo lịch |
| IoT / cảm biến | MQTT brokers, PLCs | MQTT → Kafka → sink |
| API bên ngoài | Thời tiết, chỉ số kinh tế | Kéo theo lịch (Airflow HTTP operator) |
| Tệp | CSV drops, xuất Excel | Vùng đích → thu thập kích hoạt bởi sự kiện |

**Hợp đồng pipeline quan trọng:** mỗi sự kiện phải mang `event_timestamp` (khi nó xảy ra) và `ingest_timestamp` (khi nó đến). Không bao giờ nhầm lẫn hai giá trị này — điều này gây rò rỉ dữ liệu âm thầm trong tập huấn luyện.

---

### 2. Các Mẫu Lưu Trữ

**Khung quyết định — chọn theo mẫu truy vấn:**

| Loại Kho | Phù Hợp Nhất Cho | Ví Dụ | Đánh Đổi |
|---|---|---|---|
| CSDL chuỗi thời gian | Ghi cảm biến tần suất cao, bảng điều khiển thời gian thực | InfluxDB, TimescaleDB, QuestDB | Đọc phạm vi thời gian nhanh; yếu với join tùy ý |
| OLAP cột | Phân tích lịch sử, tổng hợp quy mô lớn | ClickHouse, BigQuery, Redshift | Nén tuyệt vời trên cột thời gian; cần schema trước |
| Lakehouse (Parquet/Delta/Iceberg) | Tập dữ liệu huấn luyện ML, lưu trữ lạnh dài hạn | Delta Lake, Apache Iceberg | Hỗ trợ tiến hóa schema, time-travel; độ trễ đọc cao hơn so với TSDB chuyên dụng |
| Quan hệ (phân vùng) | Khối lượng vừa, hạ tầng CSDL sẵn có | TimescaleDB (phần mở rộng PostgreSQL) | SQL quen thuộc; tự động phân vùng theo khối thời gian |

**Quy tắc phân vùng:** luôn phân vùng theo thời gian (năm/tháng/ngày) làm khóa phân vùng chính. Phân vùng phụ theo ID thực thể (store_id, sensor_id) khi số lượng giá trị duy nhất có thể quản lý được. Truy vấn `WHERE date_col = '2025-01'` trên bảng 10 tỷ dòng không phân vùng sẽ gây sự cố.

**Chính sách lưu giữ:** xác định chiến lược lưu giữ theo tầng — nóng (30 ngày gần nhất, SSD nhanh), ấm (2 năm gần nhất, object storage), lạnh (lưu trữ, Parquet nén). Dữ liệu chuỗi thời gian tăng không giới hạn nếu không có chiến lược này.

---

### 3. Thách Thức Chất Lượng Dữ Liệu

**Dấu thời gian bị thiếu:**
- Phân biệt giữa *dữ liệu thiếu* (cảm biến offline, không có dòng) với *sự kiện giá trị bằng không* (không bán hàng = 0 đơn vị). Điền zero cho đọc cảm biến bị thiếu là lỗi chính xác.
- Phát hiện: tạo cột xương sống dấu thời gian hoàn chỉnh (`date_range`) và left-join dữ liệu thực tế. Khoảng trống trở thành NULL, không phải sự im lặng.

**Khoảng cách không đều:**
- Dữ liệu thô hiếm khi đến ở khoảng cách sạch. Nguồn cấp "hàng ngày" có thể có dòng lúc 23:58, 00:03, và đôi khi trùng lặp lúc 00:01 và 00:02.
- Chiến lược: xác định khoảng cách chuẩn tại thu thập; dùng `FLOOR(timestamp, interval)` để gom nhóm trước khi tiêu thụ hạ nguồn. Lưu trữ thô và đã gom riêng biệt.

**Ngoại lai (Outliers):**
- Phân biệt đột biến thoáng qua (nhiễu cảm biến — có thể nội suy) với sự kiện cực đoan hợp lệ (sụp đổ nhu cầu COVID — phải giữ, đánh dấu bằng cột ngữ cảnh `anomaly_flag`).
- Quy tắc tự động: đánh dấu giá trị > trung bình ± 3σ trong cửa sổ trượt 30 ngày. Không tự động xóa — đánh dấu và cách ly để xem xét.

**Vấn đề múi giờ:**
- Luôn lưu ở UTC. Chỉ chuyển đổi sang giờ địa phương ở lớp hiển thị.
- Chuyển đổi DST (giờ mùa hè) tạo ra ngày 23 giờ và 25 giờ — các bộ lấy mẫu lại hạ nguồn giả định 24 giờ/ngày sẽ âm thầm làm hỏng tổng hợp hàng giờ.

**Dữ liệu đến muộn:**
- Xác định watermark (mốc nước) (ví dụ: chấp nhận dữ liệu muộn đến 48 giờ). Sau watermark, pipeline bổ sung phải xử lý lại các phân vùng bị ảnh hưởng. Dùng `MERGE` của Delta Lake hoặc `overwrite` của Iceberg để xử lý dữ liệu muộn một cách idempotent (bất biến kết quả).

---

### 4. Các Mẫu Pipeline Tiền Xử Lý

Các bước pipeline chuẩn theo thứ tự thực hiện:

```
Thô → Loại trùng → Chuẩn hóa múi giờ → Căn chỉnh khoảng cách chuẩn
    → Xử lý giá trị thiếu → Đánh dấu ngoại lai → Lấy mẫu lại
    → Tạo đặc trưng → Ghi vào feature store / tập dữ liệu huấn luyện
```

**Lấy mẫu lại (Resampling):**
- Giảm mẫu (15 phút → hàng giờ): dùng tổng cho đếm/doanh số, trung bình cho tỷ lệ/nhiệt độ, giá trị cuối cho giá.
- Tăng mẫu (hàng ngày → hàng giờ): chỉ khi logic kinh doanh hỗ trợ (ví dụ: phân bổ ngân sách ngày đều). Tránh tăng mẫu cho huấn luyện mô hình — nó tạo ra độ chính xác giả.

**Chiến lược điền giá trị thiếu (Imputation) — mối quan tâm của DE là tính tái tạo, không phải độ chính xác mô hình:**
- Điền tiến (Forward-fill): giá, trạng thái biết gần nhất.
- Điền zero: đếm giao dịch khi vắng mặt = không hoạt động.
- Nội suy (Interpolation): nhiệt độ, tín hiệu cảm biến liên tục.
- Luôn ghi lại dòng nào đã được điền với cột boolean đi kèm `_imputed`.

**Chuẩn hóa (Normalization):** không chuẩn hóa ở lớp pipeline. Chuẩn hóa thuộc về feature store hoặc bước tiền xử lý mô hình — chuẩn hóa trong ETL khiến việc phục vụ đặc trưng thô cho nhiều loại mô hình không thể thực hiện.

---

### 5. Feature Store Cho Chuỗi Thời Gian

Đặc trưng chuỗi thời gian (lag, tổng hợp trượt) tốn chi phí tính toán lại và dễ sai (rò rỉ dữ liệu). Feature store (kho đặc trưng) giải quyết cả hai vấn đề.

**Những gì cần tính trước và lưu trữ:**

| Loại Đặc Trưng | Ví Dụ | Tần Suất Tính Toán |
|---|---|---|
| Đặc trưng trễ | sales_lag_7d, sales_lag_28d | Lô hàng ngày |
| Tổng hợp trượt | sales_ma_7d, sales_std_28d | Lô hàng ngày |
| Đặc trưng lịch | is_holiday, day_of_week, week_of_year | Một lần (tra cứu tĩnh) |
| Đặc trưng ngoại sinh | weather_temp, promo_active | Theo sự kiện / kéo hàng ngày |

**Mô hình lưu trữ:** dùng khóa join đúng thời điểm (point-in-time) = `(entity_id, as_of_date)`. Không bao giờ lưu một giá trị "hiện tại" duy nhất — lưu toàn bộ lịch sử để tập dữ liệu huấn luyện có thể được tái tạo tại bất kỳ ngày nào trong quá khứ mà không bị rò rỉ.

**Mẫu phục vụ:**
- Huấn luyện: đọc hàng loạt từ kho offline (Delta/Parquet) — join theo `as_of_date <= label_date`.
- Suy luận: kho online (Redis, DynamoDB) phục vụ vector đặc trưng mới nhất cho chấm điểm thời gian thực. Đồng bộ offline → online qua job theo lịch.

**Quan trọng: tính toán đặc trưng phải có tính xác định và idempotent.** Đặc trưng lag-7 cho `store_1, 2025-01-15` phải luôn bằng cùng một giá trị bất kể khi nào nó được tính.

---

### 6. Luồng Dữ Liệu Dự Báo Thời Gian Thực vs Lô

**Dự báo theo lô (hầu hết các trường hợp dự báo nhu cầu):**

```
Bộ lập lịch (Airflow) → Trích xuất (DB/warehouse) → Tiền xử lý → Join đặc trưng
→ Job chấm điểm mô hình → Ghi bảng dự báo → BI/API đọc
```
- Độ trễ: từ phút đến giờ. Chấp nhận được cho lập kế hoạch hàng ngày/tuần.
- Hạ tầng: đơn giản hơn, rẻ hơn, dễ gỡ lỗi hơn.
- Độ tươi dữ liệu: T-1 ngày thường là đủ.

**Dự báo thời gian thực / gần thời gian thực:**

```
Luồng sự kiện (Kafka) → Bộ xử lý luồng (Flink/Spark Streaming)
→ Tra cứu đặc trưng (Redis) → Phục vụ mô hình (REST/gRPC endpoint)
→ Luồng đầu ra → Người tiêu dùng hạ nguồn
```
- Độ trễ: dưới giây đến giây.
- Cần cho: định giá động, tồn kho thời gian thực, gian lận.
- Chi phí kỹ thuật dữ liệu: cao — cần duy trì độ tươi đặc trưng trong kho online, xử lý sự kiện đến không đúng thứ tự, giám sát độ trễ người tiêu dùng.

**Bảng so sánh đánh đổi:**

| Khía Cạnh | Lô | Thời Gian Thực |
|---|---|---|
| Độ phức tạp hạ tầng | Thấp | Cao |
| Độ tươi đặc trưng | T-1 hoặc T-0 | Dưới phút |
| Chi phí | Thấp | Cao |
| Gỡ lỗi | Dễ (tệp tĩnh) | Khó (luồng tạm thời) |
| Trường hợp điển hình | Lập kế hoạch nhu cầu, dự báo ngân sách | Định giá động, phát hiện bất thường |

**Khuyến nghị:** mặc định chọn lô trừ khi SLA kinh doanh yêu cầu dự báo dưới hàng giờ. Streaming thêm chi phí vận hành đáng kể.

---

### 7. Các Sai Lầm Phổ Biến Trong Kỹ Thuật Dữ Liệu

1. **Nhầm lẫn thời gian sự kiện và thời gian xử lý** — dùng `ingest_timestamp` làm trục thời gian tạo dữ liệu huấn luyện giả định tương lai đã biết sớm hơn thực tế. Luôn dùng `event_timestamp`.

2. **Không có cột xương sống dấu thời gian / khoảng trống âm thầm** — các dòng thiếu không hiển thị. Luôn tạo chuỗi thời gian dự kiến đầy đủ và outer-join để tìm khoảng trống một cách rõ ràng.

3. **Rò rỉ dữ liệu tương lai vào đặc trưng trễ** — tính `lag_7d` bằng dữ liệu vượt quá `as_of_date`. Xảy ra khi feature store được xây dựng lại hồi tố trên dữ liệu lịch sử đã cập nhật. Sửa: snapshot dữ liệu thô tại thời điểm tính hoặc dùng truy vấn point-in-time.

4. **Lưu trữ múi giờ lẫn lộn** — lưu một số bản ghi ở UTC, một số ở giờ địa phương, không có cột phân biệt. Kết quả là đột biến ảo 1-2 giờ tại ranh giới DST trông như tín hiệu nhu cầu thực.

5. **Không có chiến lược phân vùng** — ghi tất cả chuỗi thời gian vào một bảng duy nhất không có phân vùng ngày. Quét toàn bộ bảng trở thành bình thường; pipeline chậm lại và chi phí tăng vọt khi dữ liệu lớn lên.

6. **Chuẩn hóa trong ETL** — nhúng chuẩn hóa (min-max, z-score) vào lớp pipeline nghĩa là người tiêu dùng hạ nguồn không thể truy cập giá trị thô, và tham số chuẩn hóa bị mất hoặc xung đột phiên bản giữa các lần lặp mô hình.

7. **Ghi đè dữ liệu lịch sử tại chỗ** — cập nhật giá trị quá khứ mà không duy trì lịch sử (ví dụ: điều chỉnh doanh số). Tập dữ liệu huấn luyện hạ nguồn âm thầm thay đổi. Dùng phân vùng chỉ-thêm hoặc có phiên bản; áp dụng điều chỉnh dưới dạng dòng mới với `correction_flag`.

8. **Bỏ qua số lượng giá trị duy nhất trong lưu trữ thực thể × thời gian** — feature store với 10.000 SKU × 5 năm dữ liệu hàng ngày = 18 triệu dòng. Mẫu truy vấn lặp tuần tự theo thực thể sẽ không mở rộng được. Thiết kế cho đọc hàng loạt theo phạm vi ngày trước, lọc thực thể sau.

---

*Ghi chú giới hạn trong lớp kỹ thuật dữ liệu. Lựa chọn mô hình ML, phương pháp thống kê và chỉ số độ chính xác dự báo nằm ngoài phạm vi tài liệu này.*
