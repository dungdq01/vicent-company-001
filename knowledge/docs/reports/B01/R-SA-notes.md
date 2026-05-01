# Ghi Chú Kiến Trúc Giải Pháp: B01 — Dự Báo & Chuỗi Thời Gian
## Bởi R-SA (Solution Architect — Kiến trúc sư Giải pháp) — Ngày: 2026-03-30

---

### 1. Kiến Trúc Tham Chiếu Đầu-Cuối

```
┌─────────────────────────────────────────────────────────────────────┐
│                     LỚP THU THẬP DỮ LIỆU                           │
│  ERP / TMS / WMS → Pipeline ETL → Data Lake (vùng thô)             │
│  Nguồn bên ngoài: thời tiết, ngày lễ, khuyến mại → Feature Store   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                     LỚP CHUẨN BỊ DỮ LIỆU                          │
│  Chuẩn hóa chuỗi thời gian → Phát hiện ngoại lai → Điền thiếu      │
│  Xây dựng phân cấp (sản phẩm / địa lý / chi tiết thời gian)       │
│  Kỹ thuật đặc trưng: lag, thống kê trượt, đặc trưng lịch          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                        LỚP MÔ HÌNH                                 │
│  Baseline: Naive Mùa Vụ / Trung Bình Trượt (chuẩn so sánh)        │
│  Thống kê: ETS, ARIMA, TBATS (có thể giải thích)                   │
│  ML: LightGBM, XGBoost (đặc trưng bảng, đa chuỗi)                 │
│  Deep Learning: N-BEATS, TFT, Chronos (mẫu phức tạp)               │
│  Ensemble / Đối soát: MinT, bottom-up, top-down                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                       LỚP PHỤC VỤ                                   │
│  API Dự báo (REST/gRPC) → Cache kết quả (Redis)                    │
│  Xuất lô: CSV / Parquet sang data warehouse                        │
│  Webhook đẩy: ERP / TMS / BI kích hoạt khi có dự báo mới          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      LỚP TIÊU THỤ                                   │
│  Bảng Điều Khiển BI (Power BI / Tableau / Next.js tùy chỉnh)       │
│  Kích hoạt bổ sung tự động ERP                                     │
│  Bàn làm việc kế hoạch viên (ghi đè, phê duyệt, xuất bản)         │
└─────────────────────────────────────────────────────────────────────┘

      XUYÊN SUỐT: MLflow / theo dõi thí nghiệm | Airflow / Prefect điều phối
                   Prometheus chỉ số | Grafana giám sát | Data lineage
```

---

### 2. Các Mẫu Tích Hợp

**Tích Hợp ERP (SAP, Oracle, D365)**
- Kéo: trích xuất lô theo lịch qua BAPI/RFC (SAP) hoặc REST API (D365) vào bảng staging
- Đẩy: xuất bản dự báo đã phê duyệt trở lại module kế hoạch nhu cầu ERP qua API hoặc gửi tệp
- Mối quan tâm chính: căn chỉnh khóa dự báo — ánh xạ mã vật liệu ERP vs. mã SKU nội bộ phải được duy trì

**Tích Hợp WMS**
- Thường dựa trên tệp (CSV/EDI) hoặc REST; streaming sự kiện thời gian thực đang nổi lên (Kafka topics)
- Đến: xác nhận vận chuyển, thực tế nhận hàng để so sánh dự báo
- Đi: đầu vào lập kế hoạch đợt phát hàng (wave planning) từ dự báo ngắn hạn

**Công Cụ BI**
- Power BI / Tableau: kết nối đến bảng kết quả dự báo trong DWH; DirectQuery cho trực tiếp, Import cho hiệu năng
- Bảng điều khiển tùy chỉnh: API dự báo được gọi từ frontend Next.js với SWR / React Query
- Lớp ngữ nghĩa (dbt metrics, Cube.dev) được khuyến nghị để trừu tượng hóa các trường dự báo giữa các công cụ

**Mẫu Hướng Sự Kiện (khuyến nghị cho gần thời gian thực)**
```
Giá trị thực mới đến → Kafka topic → Kích hoạt job dự báo lại → Xuất bản kết quả → Thông báo người đăng ký
```
Tránh polling; cho phép làm mới dự báo trong ngày cho vận hành nhanh.

---

### 3. Phân Tích Xây Dựng vs Mua

| Lựa Chọn | Ưu Điểm | Nhược Điểm | Phù Hợp Nhất Cho |
|---|---|---|---|
| Tùy chỉnh (statsmodels, sktime, Darts) | Kiểm soát hoàn toàn, không phụ thuộc nhà cung cấp, giải thích được | Chi phí phát triển cao, gánh nặng MLOps | Đội có năng lực data science |
| AutoML (AWS Forecast, Azure AutoML, Vertex AI) | Triển khai nhanh, hạ tầng được quản lý, tự động tinh chỉnh | Hộp đen, chi phí theo lời gọi, phí truyền dữ liệu | PoC hoặc đội nhỏ |
| SaaS bên thứ ba (Relex, Kinaxis, o9) | Chuyên biệt lĩnh vực, tích hợp sẵn | Chi phí bản quyền cao, tùy chỉnh hạn chế | Doanh nghiệp lớn, trường hợp sử dụng tiêu chuẩn |
| API Foundation Model (TimeGPT, Chronos qua API) | Không cần dữ liệu huấn luyện ban đầu | Độ chính xác chưa được chứng minh cho lĩnh vực cụ thể, chi phí | Kịch bản khởi động lạnh, thử nghiệm nhanh |

**Khuyến nghị cho hầu hết dự án logistics:**
- Bắt đầu với AutoML (AWS Forecast) để nhanh chóng tạo giá trị
- Chuyển sang mô hình tùy chỉnh cho chuỗi khối lượng cao / giá trị cao khi đã hiểu mẫu
- Không bao giờ mua SaaS cho năng lực là lợi thế cạnh tranh chiến lược

---

### 4. Các Cân Nhắc Về Khả Năng Mở Rộng

**Mở rộng theo khối lượng**
- 10K chuỗi: máy đơn, pandas/statsmodels đủ
- 100K–1M chuỗi: cần tính toán phân tán (Spark, Ray, Dask)
- 10M+ chuỗi: deep learning tăng tốc GPU hoặc cách tiếp cận mô hình toàn cục (một mô hình, tất cả chuỗi)

**Huấn luyện vs. Suy luận**
- Huấn luyện: job lô, có thể chậm (hàng đêm/hàng tuần) — tối ưu cho tính chính xác
- Suy luận: nhạy với độ trễ nếu kế hoạch viên đang đợi — cache kết quả, tính trước theo lịch
- Tách cụm tính toán riêng cho huấn luyện và phục vụ để tránh tranh chấp tài nguyên

**Chiến lược huấn luyện lại**
- Huấn luyện lại toàn bộ: hàng tuần (bắt trôi dạt khái niệm, tốn kém)
- Cập nhật tăng dần: hàng ngày (rẻ hơn, rủi ro tích lũy sai số)
- Huấn luyện lại kích hoạt: khi giám sát phát hiện MAPE suy giảm > ngưỡng (khuyến nghị)

**Quy mô phân cấp**
- Đối soát phân cấp (MinT) có độ phức tạp O(n²) theo số chuỗi — tính trước các nhóm
- Dùng biểu diễn ma trận thưa cho phân cấp lớn

---

### 5. Danh Sách Kiểm Tra NFR (Yêu Cầu Phi Chức Năng) Cho Hệ Thống Dự Báo

**Độ Chính Xác**
- [ ] Mô hình baseline (naive mùa vụ) được xác định và theo dõi làm mức tối thiểu
- [ ] Chỉ số chính xác được xác định theo trường hợp sử dụng (MAPE cho liên tục, MASE cho gián đoạn)
- [ ] Chỉ số thiên lệch được theo dõi riêng khỏi cường độ sai số

**Độ Tin Cậy**
- [ ] Dự báo sẵn sàng đúng giờ SLA (ví dụ: 06:00 hàng ngày cho lập kế hoạch kho)
- [ ] Dự phòng sang dự báo tốt biết gần nhất nếu pipeline thất bại
- [ ] Cảnh báo dead-man's-switch nếu không có dự báo nào được xuất bản trong cửa sổ SLA

**Khả Năng Giải Thích**
- [ ] Tầm quan trọng đặc trưng có sẵn cho mô hình ML
- [ ] Chế độ xem phân rã (xu hướng + mùa vụ + phần dư) cho kế hoạch viên tin tưởng
- [ ] Dấu vết kiểm toán ghi đè — ai đã thay đổi dự báo nào và khi nào

**Bảo Mật & Tuân Thủ**
- [ ] Dữ liệu nhu cầu được phân loại — có thể chứa tín hiệu khối lượng/giá nhạy cảm thương mại
- [ ] Truy cập theo vai trò: kế hoạch viên chỉ xem khu vực/sản phẩm của họ
- [ ] Chính sách lưu giữ dự báo được xác định (GDPR nếu bao gồm dữ liệu cấp khách hàng)

**Khả Năng Quan Sát**
- [ ] Giám sát độ tươi dữ liệu (dữ liệu nguồn có đến đúng lịch không?)
- [ ] Bảng điều khiển hiệu suất mô hình (MAPE trượt 4 tuần gần nhất)
- [ ] Phát hiện trôi dạt dữ liệu (cảnh báo thay đổi phân phối đặc trưng đầu vào)

---

### 6. Các Sai Lầm Kiến Trúc Phổ Biến

1. **Một mô hình cho tất cả chuỗi** — Mô hình toàn cục huấn luyện trên tất cả SKU sẽ khớp thiếu chuỗi khối lượng cao và khớp quá chuỗi thưa. Phân khúc theo khối lượng/biến đổi trước.

2. **Không so sánh baseline** — Triển khai ML mà không có chuẩn naive mùa vụ khiến không thể biết mô hình có tạo giá trị không. Luôn thiết lập baseline.

3. **Dự báo và giá trị thực ở chi tiết khác nhau** — So sánh dự báo tuần với thực tế ngày yêu cầu logic tổng hợp thường sai. Căn chỉnh chi tiết tại thời điểm thiết kế.

4. **Bỏ qua "chặng cuối" tiêu thụ dự báo** — Xây dựng mô hình tuyệt vời nhưng giao kết quả dưới dạng CSV thô mà kế hoạch viên bỏ qua. UX bàn làm việc kế hoạch viên quan trọng không kém độ chính xác mô hình.

5. **Huấn luyện lại trên giai đoạn ngoại lai mà không đánh dấu** — Đưa COVID-2020 hoặc đột biến khuyến mại vào huấn luyện mà không đánh dấu dạy mô hình rằng sự kiện cực đoan là bình thường. Làm sạch dữ liệu huấn luyện.

6. **Đánh giá thấp độ phức tạp MLOps** — Hệ thống dự báo không phải là mô hình một lần. Nó cần huấn luyện lại theo lịch, giám sát, quản lý phiên bản và khả năng quay lại. Lập ngân sách tương xứng.

7. **Nhầm lẫn tầm dự báo với tần suất cập nhật mô hình** — Tầm dự báo 13 tuần không có nghĩa là huấn luyện lại mỗi 13 tuần. Huấn luyện lại thường xuyên; mở rộng tầm khi cần.
