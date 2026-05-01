# Ghi Chú DevOps/MLOps: B01 — Dự Báo & Chuỗi Thời Gian
## Bởi R-DO (DevOps Engineer — Kỹ sư DevOps) — Ngày: 2026-03-30

---

### 1. CI/CD Cho Mô Hình Dự Báo

**Các giai đoạn pipeline:**

```
Push Code → Lint/Unit Tests → Build Container → Integration Tests
         → Kiểm Chứng Mô Hình → Triển Khai Staging → Canary → Production
```

**Các cổng thăng cấp mô hình (phải đạt trước khi lên production):**
1. Unit test trên code kỹ thuật đặc trưng đạt (100%).
2. MAPE/RMSE kiểm tra hồi tố trên tập giữ lại không suy giảm > 5% so với mô hình production hiện tại.
3. Độ phủ khoảng dự báo nằm trong ±2% so với danh nghĩa (ví dụ: CI 80% nên phủ 78–82% giá trị thực).
4. Độ trễ suy luận P99 < ngưỡng trên tập dữ liệu benchmark.
5. Không có thay đổi phá vỡ schema trong hợp đồng đầu vào/đầu ra (kiểm tra bằng contract tests).

**Quản lý artifact:**
- Lưu model artifact trong model registry (MLflow, Vertex AI Model Registry, SageMaker).
- Gắn thẻ mỗi artifact: `model_name`, `version`, `training_date`, `dataset_hash`, `git_sha`.
- Không bao giờ triển khai artifact chưa đăng ký. Coi registry là nguồn sự thật duy nhất.

**Chiến lược quay lại (Rollback):**
- Giữ 2 phiên bản mô hình trước đó đã triển khai (blue/green hoặc chia lưu lượng có trọng số).
- Quay lại tự động: nếu tỷ lệ lỗi tăng > 2% trong vòng 10 phút sau thăng cấp, tự động chuyển lưu lượng về phiên bản trước qua bộ điều khiển triển khai (Argo Rollouts / Flagger).

---

### 2. Các Mẫu Container & Điều Phối

**Cấu trúc Docker image:**
```dockerfile
FROM python:3.11-slim
# Lớp 1: phụ thuộc hệ thống (hiếm khi thay đổi)
# Lớp 2: phụ thuộc Python (thay đổi khi cập nhật thư viện)
# Lớp 3: model artifact (thay đổi khi huấn luyện lại)
# Lớp 4: code phục vụ (thay đổi khi cập nhật code)
```
- Tách model artifact khỏi code. Mount model từ volume hoặc tải từ registry khi khởi động — tránh rebuild toàn bộ image mỗi lần huấn luyện lại.

**Mẫu triển khai Kubernetes:**
```yaml
Deployment:
  replicas: 3 (min), autoscale đến 20 dựa trên CPU/RPS
  resources:
    requests: cpu: 500m, memory: 2Gi
    limits:   cpu: 2000m, memory: 4Gi
  readinessProbe: GET /health (đợi model tải xong)
  livenessProbe:  GET /ping (khởi động lại khi treo)
```

**HPA (Horizontal Pod Autoscaler):** Mở rộng dựa trên `requests_per_second` (chỉ số tùy chỉnh qua KEDA) thay vì CPU — CPU là chỉ số trễ cho server mô hình giới hạn I/O.

**Mẫu sidecar:** Chạy container sidecar lấy đặc trưng bên cạnh server mô hình để làm nóng trước cache đặc trưng, tách biệt độ trễ feature store khỏi độ trễ suy luận mô hình.

**Cách ly namespace:** Chạy `forecasting-prod`, `forecasting-staging`, `forecasting-batch` trong các namespace riêng với hạn ngạch tài nguyên để ngăn vấn đề noisy-neighbor (hàng xóm ồn ào).

---

### 3. Giám Sát & Cảnh Báo

**Ba lớp giám sát:**

**Lớp 1 — Chỉ số hạ tầng (Prometheus + Grafana):**
- CPU/bộ nhớ pod, tốc độ yêu cầu, tỷ lệ lỗi, độ trễ P50/P95/P99.
- Cảnh báo: tỷ lệ lỗi > 1% trong 5 phút, độ trễ P99 > 2 lần baseline trong 10 phút.

**Lớp 2 — Phát hiện trôi dạt dữ liệu (Evidently AI / Whylogs):**
- Giám sát phân phối đặc trưng đầu vào hàng ngày. So sánh với phân phối huấn luyện.
- Cảnh báo: PSI (Population Stability Index — Chỉ số Ổn định Dân số) > 0.2 trên bất kỳ đặc trưng chính nào — kích hoạt xem xét huấn luyện lại.
- Giám sát tỷ lệ giá trị thiếu trong payload đặc trưng đến; tăng đột biến = vấn đề dữ liệu thượng nguồn.

**Lớp 3 — Trôi dạt mô hình/dự báo:**
- Theo dõi giá trị dự báo trung bình theo nhóm thực thể. Thay đổi lớn không có giá trị thực tương ứng báo hiệu trôi dạt mô hình.
- Theo dõi dự báo so với thực tế: khi giá trị thực đến, tính MAPE theo thực thể và MAPE trượt 7 ngày. Cảnh báo nếu MAPE trượt suy giảm > 15% so với baseline.
- Theo dõi độ phủ khoảng dự báo (tỷ lệ trúng thực nghiệm). Sụp đổ độ phủ báo hiệu thay đổi phân phối.

**Định tuyến cảnh báo:**
| Loại Cảnh Báo | Mức Nghiêm Trọng | Hành Động Trực |
|---|---|---|
| Tăng đột biến tỷ lệ lỗi | P1 | Gọi trực ngay lập tức |
| Vi phạm P99 độ trễ | P2 | Cảnh báo Slack, SLA 30 phút |
| Phát hiện trôi dạt dữ liệu | P3 | Tạo ticket, ngày làm việc tiếp theo |
| Suy giảm độ chính xác mô hình | P2 | Thông báo đội ML, đánh giá huấn luyện lại |

---

### 4. Tự Động Hóa Huấn Luyện Lại

**Hai kích hoạt — luôn triển khai cả hai:**

1. **Huấn luyện lại theo lịch:** Dựa trên cron (ví dụ: hàng ngày lúc 02:00 UTC). Kéo dữ liệu mới nhất, huấn luyện lại, đánh giá, thăng cấp nếu đạt các cổng.

2. **Huấn luyện lại kích hoạt bởi sự kiện:** Được kích hoạt bởi:
   - Cảnh báo trôi dạt dữ liệu (PSI > ngưỡng).
   - Suy giảm thực tế so với dự báo vượt ngưỡng.
   - Thay đổi schema dữ liệu thượng nguồn.
   - Kích hoạt thủ công từ đội ML.

**Pipeline huấn luyện lại (Kubeflow / Airflow / Prefect):**
```
Kéo Dữ Liệu → Kiểm Chứng → Kỹ Thuật Đặc Trưng → Huấn Luyện → Đánh Giá
            → So Sánh vs Prod → Đăng Ký (nếu tốt hơn) → Triển Khai (nếu được duyệt)
```

**Cổng có sự tham gia con người:** Cho mô hình production, yêu cầu phê duyệt rõ ràng từ đội ML trước khi tự động thăng cấp nếu cải thiện độ chính xác ở mức biên (< 2%). Tự động thăng cấp nếu cải thiện > 5% và tất cả cổng đạt.

**Triển khai chế độ ẩn (Shadow mode):** Chạy mô hình mới ở chế độ ẩn (nhận cùng lưu lượng, dự báo được ghi log nhưng không phục vụ) trong 24–48 giờ trước khi thăng cấp. So sánh dự báo ẩn vs production và giá trị thực.

---

### 5. Tối Ưu Chi Phí Hạ Tầng

**CPU vs GPU:**
- Hầu hết mô hình chuỗi thời gian (ARIMA, Prophet, LightGBM, kể cả TFT) chạy hiệu quả trên CPU khi suy luận. GPU hiếm khi hợp lý cho phục vụ — dùng instance CPU.
- GPU hữu ích cho **huấn luyện** mô hình dự báo deep learning lớn (N-BEATS, PatchTST). Dùng instance GPU spot/preemptible cho job huấn luyện để giảm chi phí 60–80%.

**Chiến lược mở rộng:**
- **Scale to zero** (thu về không) cho endpoint lô không quan trọng: dùng Knative hoặc AWS Lambda cho endpoint nhận < 10 yêu cầu/phút. Cold start chấp nhận được cho trường hợp lô.
- **Đúng kích thước pod:** Đo lường sử dụng bộ nhớ thực tế; hầu hết đội cung cấp quá mức gấp 2 lần. Dùng khuyến nghị VPA (Vertical Pod Autoscaler) làm cơ sở.
- **Suy luận lô thay vì thời gian thực** khi có thể: tính trước tất cả dự báo ban đêm cho tập thực thể đã biết. Giảm tải server mô hình 80%+ so với phục vụ theo yêu cầu.

**Chi phí lưu trữ:**
- Nén bảng kết quả dự báo (định dạng cột, Parquet trên S3). Dữ liệu dự báo rất dễ nén (cấu trúc lặp lại).
- Lưu trữ theo tầng: nóng (PostgreSQL/Redis) cho 30 ngày gần nhất, ấm (S3 + Athena) cho 90 ngày, lạnh (Glacier) cho lưu trữ.

---

### 6. Các Sai Lầm DevOps Phổ Biến Trong Dự Báo

- **Triển khai mô hình mà không đăng ký** — không có khả năng truy vết, không thể quay lại đúng cách.
- **Rebuild toàn bộ image mỗi lần huấn luyện lại** — pipeline chậm; tách model artifact khỏi code image.
- **Không có readiness probe đợi model tải** — pod nhận lưu lượng trước khi model sẵn sàng, gây lỗi 500 trong quá trình rollout.
- **Chỉ giám sát hạ tầng, không giám sát dự báo** — mô hình có thể "khỏe mạnh" (độ trễ thấp, không lỗi) nhưng tạo ra dự báo tệ.
- **Huấn luyện lại theo lịch mà không có cổng đánh giá** — lần huấn luyện lại tệ với độ chính xác suy giảm tự động thăng cấp lên production.
- **Một bản sao duy nhất cho server mô hình** — một lần khởi động lại hạ toàn bộ API dự báo; luôn chạy tối thiểu 2 bản sao.
- **Bỏ qua feature pipeline trong CI/CD** — chỉ kiểm thử mô hình mà không kiểm thử code kỹ thuật đặc trưng cung cấp cho nó.
