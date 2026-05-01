# Báo Cáo Kỹ Thuật: B01 — Dự Báo & Chuỗi Thời Gian
## Tác giả: Dr. Praxis (R-β) — Ngày: 2026-03-30
## Trạng thái: CẦN ĐÁNH GIÁ
## Tiếp theo: Dr. Sentinel (R-γ) — feasibility-report.md

---

## Tóm Tắt Triển Khai

B01 Forecasting & Time Series (Dự Báo & Chuỗi Thời Gian) là một lĩnh vực đa mô hình đòi hỏi một tech stack (ngăn xếp công nghệ) phân tầng: các phương pháp thống kê cổ điển cho baseline (đường cơ sở) có tính diễn giải, gradient boosting (tăng cường độ dốc) với LightGBM là công cụ chính cho dự báo bán lẻ/chuỗi cung ứng ngắn hạn, các kiến trúc Transformer (PatchTST, iTransformer, TFT) cho các bài toán đa biến dài hạn, và foundation models (mô hình nền tảng) như TimesFM, Chronos cho các tình huống zero-shot cold-start (khởi động nguội không cần dữ liệu huấn luyện). Hệ thống sản xuất phải hỗ trợ pipeline huấn luyện theo batch với walk-forward validation (xác nhận bước tiến), suy luận thời gian thực dưới một giây cho các trường hợp tần suất cao, đầu ra xác suất qua conformal prediction (dự đoán phù hợp), và đảm bảo tính nhất quán phân cấp thông qua MinT reconciliation (hòa hợp MinT). Kiến trúc thống nhất MLflow + feature store (kho đặc trưng) loại bỏ vấn đề "quản lý vườn mô hình" vốn làm chết các nền tảng dự báo ở quy mô lớn.

---

## 1. Ma Trận Quyết Định Tech Stack

### Tầng 1: Thu Nạp & Lưu Trữ Dữ Liệu

| Tầng | Công Nghệ | Phiên Bản | Lý Do Chọn | Các Phương Án Thay Thế & Đánh Đổi |
|------|-----------|-----------|-------------|-------------------------------------|
| Cơ sở dữ liệu chuỗi thời gian | TimescaleDB (phần mở rộng PostgreSQL) | 2.14+ | Phân vùng theo thời gian tự nhiên, continuous aggregates (tổng hợp liên tục), tương thích SQL, hệ sinh thái trưởng thành, không cần học ngôn ngữ truy vấn mới. Xử lý hơn 1M insert/giây với nén dữ liệu. | **InfluxDB 3.0** — chuyên dụng cho chuỗi thời gian, ghi nhanh hơn, nhưng ngôn ngữ Flux độc quyền và vận hành phức tạp hơn. **QuestDB** — benchmark thu nạp nhanh nhất, nhưng cộng đồng nhỏ hơn và ít tích hợp hơn. |
| Data Lake / Lưu trữ thô | Apache Parquet trên S3/MinIO | parquet + delta 3.x | Hướng cột, nén (10–50 lần so với CSV), predicate pushdown (đẩy điều kiện lọc xuống) cho quét phạm vi thời gian. Delta Lake thêm giao dịch ACID và schema evolution (tiến hóa lược đồ). Định dạng mở — không bị khóa nhà cung cấp. | **Apache Iceberg** — tốt hơn cho tiến hóa bảng quy mô lớn và hỗ trợ đa engine; thiết lập phức tạp hơn một chút. **Apache ORC** — tích hợp Hive tốt hơn, nhưng chậm hơn cho hệ sinh thái Python. |
| Feature Store (Kho đặc trưng) | Feast (tự lưu trữ) hoặc Hopsworks Community | feast 0.40+ | Truy xuất đặc trưng đúng thời điểm (point-in-time correct — quan trọng để tránh rò rỉ mục tiêu trong chuỗi thời gian), phân tách online + offline store, thuần Python. Feast nhẹ; Hopsworks thêm giao diện pipeline huấn luyện. | **Tecton** — feature store hàng đầu, SLA cấp doanh nghiệp, nhưng giá SaaS đắt. **Custom Redis + PostgreSQL** — kiểm soát hoàn toàn nhưng gánh nặng bảo trì lớn; chỉ khả thi cho đội nhỏ có nhu cầu cụ thể. |
| Thu nạp streaming | Apache Kafka + Faust (Python) | Kafka 3.7, Faust 1.10 | Khi dữ liệu cảm biến/IoT thời gian thực cần đưa vào dự báo, Kafka cung cấp nhật ký có thứ tự bền vững. Faust cho phép xử lý luồng Python không cần JVM. | **Redpanda** — tương thích Kafka, triển khai C++, độ trễ thấp hơn, vận hành nhẹ hơn; có thể thay thế trực tiếp nếu đội chưa quen Kafka. **AWS Kinesis** — quản lý hoàn toàn, không cần vận hành, nhưng bị khóa nhà cung cấp và chi phí mỗi shard cao hơn. |

### Tầng 2: Huấn Luyện Mô Hình

| Tầng | Công Nghệ | Phiên Bản | Lý Do Chọn | Các Phương Án Thay Thế & Đánh Đổi |
|------|-----------|-----------|-------------|-------------------------------------|
| Framework ML cốt lõi | PyTorch + PyTorch Lightning | torch 2.3+, lightning 2.2+ | Tiêu chuẩn thực tế cho nghiên cứu đến sản xuất. Lightning loại bỏ mã boilerplate (xử lý thiết bị, checkpointing, logging) mà không che giấu quyền kiểm soát. Hầu hết các repo dự báo (PatchTST, iTransformer, Chronos) đều thuần PyTorch. | **TensorFlow/Keras** — hỗ trợ TPU tốt hơn, hệ thống sản xuất TF Serving, nhưng đà phát triển cộng đồng đã chuyển sang PyTorch. **JAX** — lặp nghiên cứu thuần nhanh nhất, nhưng phục vụ sản xuất còn non. |
| Baseline thống kê/cổ điển | StatsForecast (Nixtla) + statsmodels | statsforecast 1.7+, statsmodels 0.14+ | StatsForecast fit AutoARIMA/AutoETS trên 10.000 chuỗi trong vài giây (Cython + thực thi song song). Thiết yếu cho baseline và như thành phần trong mô hình lai. | **R forecast package** — tiêu chuẩn vàng nhưng cần runtime R; thêm phức tạp hạ tầng. **Prophet** — tốt cho dự báo dễ tiếp cận cho nhà phân tích với ngày lễ; chậm hơn ở quy mô lớn so với StatsForecast. |
| Gradient Boosting | LightGBM | 4.3+ | Kiến trúc chiến thắng cuộc thi M5. Huấn luyện nhanh nhất trên dữ liệu chuỗi thời gian dạng bảng đã xây đặc trưng. Xử lý tự nhiên các đặc trưng phân loại (store_id, sku_id). Có hỗ trợ huấn luyện GPU. | **XGBoost** — hiệu suất tương đương, hơi chậm hơn, tích hợp SHAP tốt hơn. **CatBoost** — tốt nhất với biến phân loại cardinality cao; huấn luyện chậm hơn. |
| Foundation Models (Mô hình nền tảng) | Hugging Face Transformers + nixtla/TimesFM | transformers 4.40+, timesfm 1.x | HuggingFace hub cung cấp truy cập thống nhất đến Chronos (Amazon), MOMENT (autonlab), Moirai (Salesforce). TimesFM có gói pip riêng. Cho phép baseline zero-shot trong dưới 10 dòng code. | **GluonTS (AWS)** — bộ công cụ chuỗi thời gian xác suất tuyệt vời, nhưng nặng hơn và ít được bảo trì tích cực hơn. Repo mô hình trực tiếp — nên tránh; dễ hỏng khi cập nhật phụ thuộc. |
| Theo dõi thí nghiệm | MLflow | 2.13+ | Mã nguồn mở, tự lưu trữ được, tích hợp PyTorch Lightning qua autolog. Model Registry tích hợp sẵn cho quản lý champion/challenger (ứng viên chính/đối thủ). Không tính phí theo chỗ ngồi. | **Weights & Biases** — UX và trực quan hóa tốt nhất, tính năng cộng tác nhóm; giá SaaS tăng dần. **Neptune.ai** — kho metadata tốt; ít được áp dụng trong cộng đồng chuỗi thời gian. |
| Tối ưu siêu tham số | Optuna | 3.6+ | Thử nghiệm song song bất đồng bộ, pruning (cắt sớm các lần chạy kém qua MedianPruner), nhẹ, tích hợp trực tiếp với MLflow. Hỗ trợ bộ lấy mẫu Bayesian (TPE) và CMA-ES. | **Ray Tune** — tốt nhất cho HPO phân tán quy mô lớn; thiết lập nặng hơn, cần cluster Ray. **Hyperopt** — cũ hơn, bảo trì ít tích cực hơn. |

### Tầng 3: Phục Vụ Mô Hình

| Tầng | Công Nghệ | Phiên Bản | Lý Do Chọn | Các Phương Án Thay Thế & Đánh Đổi |
|------|-----------|-----------|-------------|-------------------------------------|
| Suy luận theo batch | Apache Spark MLlib connector + PySpark | Spark 3.5+ | Khi dự báo hơn 100K chuỗi: Spark phân tán các lệnh predict() qua các worker. Pandas UDFs cho phép tải mô hình một lần mỗi partition. | **Dask** — nhẹ hơn Spark, thuần Python, tốt cho quy mô trung bình (10K–100K chuỗi); không có khả năng chịu lỗi tích hợp cho các tác vụ dài. **Ray Serve** — tốt hơn cho phục vụ mô hình không đồng nhất; phức tạp hơn cho batch thuần túy. |
| Phục vụ thời gian thực | FastAPI + BentoML | FastAPI 0.111+, BentoML 1.2+ | FastAPI cho các endpoint REST tùy chỉnh với toàn quyền kiểm soát. BentoML để đóng gói mô hình + tiền xử lý vào container di động với health check và metrics tích hợp. Mục tiêu độ trễ P99: <100ms cho mô hình thống kê, <500ms cho mô hình DL. | **TorchServe** — chính thức của PyTorch, tốt cho phục vụ đa mô hình; vận hành thiên về Java hơn. **Triton Inference Server (NVIDIA)** — tốt nhất cho suy luận DL tăng tốc GPU ở quy mô; quá mức cho các mô hình thống kê CPU. |
| Model Registry (Sổ đăng ký mô hình) | MLflow Model Registry | 2.13+ | Tích hợp tự nhiên với theo dõi huấn luyện. Chuyển đổi giai đoạn (Staging → Production) với nhật ký kiểm toán. Hỗ trợ PyTorch, sklearn, mô hình Python tùy chỉnh qua `mlflow.pyfunc`. | **BentoML Model Store** — tốt cho quản lý phiên bản phía phục vụ; tích hợp theo dõi thí nghiệm yếu hơn. **DVC + Git** — tốt nhất cho quản lý phiên bản dataset; yếu hơn về metadata mô hình. |

### Tầng 4: Điều Phối & Giám Sát

| Tầng | Công Nghệ | Phiên Bản | Lý Do Chọn | Các Phương Án Thay Thế & Đánh Đổi |
|------|-----------|-----------|-------------|-------------------------------------|
| Điều phối workflow | Apache Airflow | 2.9+ | Đã được kiểm chứng thực chiến, hệ sinh thái operator lớn (S3, Spark, Kubernetes, dbt), DAG-as-code. Tuyệt vời cho pipeline huấn luyện lại theo lịch. | **Prefect 2** — biên soạn thuần Python tốt hơn, DAG động, tích hợp retry/caching; mới hơn nhưng sẵn sàng sản xuất. **Dagster** — điều phối dựa trên asset tốt nhất; đường cong học dốc hơn. |
| Container hóa | Docker + Kubernetes (k8s) | Docker 26+, k8s 1.29+ | Tiêu chuẩn. K8s cho phép tự động mở rộng pod suy luận dựa trên lưu lượng yêu cầu. HPA (Horizontal Pod Autoscaler — Bộ tự động mở rộng pod ngang) cho lưu lượng đột biến. | **AWS ECS/Fargate** — điều phối container quản lý; bị khóa nhà cung cấp nhưng giảm gánh nặng vận hành k8s. **Nomad (HashiCorp)** — đơn giản hơn k8s cho workload hỗn hợp; ít hỗ trợ cộng đồng hơn. |
| Giám sát & Cảnh báo | Prometheus + Grafana + Evidently AI | prometheus 2.52+, grafana 10+, evidently 0.4+ | Prometheus thu thập metrics suy luận (độ trễ, tỷ lệ lỗi, lưu lượng yêu cầu). Bảng điều khiển Grafana. Evidently AI thêm phát hiện drift (trôi dạt) chuyên cho ML (data drift, target drift, suy giảm chất lượng mô hình). | **WhyLogs + WhyLabs** — giám sát ML cloud-native; chi phí SaaS. **Arize AI** — nền tảng quan sát tuyệt vời cho ML sản xuất; tính phí theo khối lượng dự đoán. |
| Chất lượng dữ liệu | Great Expectations | 1.0+ | Bộ expectation định nghĩa hợp đồng trên dữ liệu đầu vào (không null trong mục tiêu, cột ngày đơn điệu, ràng buộc phạm vi giá trị). Tạo tài liệu dữ liệu HTML. | **Soda Core** — kiểm tra dựa trên YAML đơn giản hơn; linh hoạt lập trình kém hơn. **dbt tests** — tích hợp với biến đổi dbt; không áp dụng được cho pipeline streaming. |

---

## 2. Kiến Trúc Pipeline (Chi Tiết)

### 2.1 Kiến Trúc End-to-End Chính

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NỀN TẢNG DỰ BÁO B01                                     │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Nguồn Dữ Liệu│    │  Tầng Thu    │    │  Tầng Lưu   │                  │
│  │              │───▶│  Nạp         │───▶│  Trữ         │                  │
│  │ • ERP/WMS    │    │ • Kafka      │    │ • TimescaleDB│                  │
│  │ • Sự kiện POS│    │ • REST APIs  │    │ • Parquet/S3 │                  │
│  │ • Bên ngoài  │    │ • Batch ETL  │    │ • Feature    │                  │
│  │   (thời tiết,│    │              │    │   Store      │                  │
│  │   lịch)      │    └──────────────┘    └──────┬───────┘                  │
│  └──────────────┘                               │                          │
│                                                 ▼                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                 TẦNG XÂY DỰNG ĐẶC TRƯNG                            │  │
│  │  đặc trưng trễ │ thống kê cuộn │ đặc trưng lịch │ nối dữ liệu ngoài│  │
│  │  phân rã │ chuẩn hóa/co giãn │ nhúng thực thể                      │  │
│  └───────────────────────────────────┬──────────────────────────────────┘  │
│                                      │                                     │
│                          ┌───────────┴───────────┐                        │
│                          │                       │                        │
│                          ▼                       ▼                        │
│              ┌───────────────────┐   ┌───────────────────┐               │
│              │  PIPELINE         │   │  ĐƯỜNG DẪN        │               │
│              │  HUẤN LUYỆN      │   │  FOUNDATION MODEL  │               │
│              │                   │   │  ZERO-SHOT        │               │
│              │ • Walk-forward CV │   │ • TimesFM         │               │
│              │ • LightGBM        │   │ • Chronos         │               │
│              │ • PatchTST/TFT    │   │ • Moirai          │               │
│              │ • StatsForecast   │   │                   │               │
│              │ • HPO (Optuna)    │   │ (chỉ cold-start)  │               │
│              └────────┬──────────┘   └─────────┬─────────┘               │
│                       │                        │                          │
│                       └────────────┬───────────┘                          │
│                                    ▼                                       │
│              ┌─────────────────────────────────────┐                      │
│              │         TẦNG ĐÁNH GIÁ               │                     │
│              │  • MASE, RMSSE, CRPS, Winkler Score │                     │
│              │  • Backtesting (walk-forward)        │                     │
│              │  • Kiểm tra hiệu chuẩn (conformal)  │                     │
│              │  • Hòa hợp MinT (phân cấp)          │                     │
│              └────────────────┬────────────────────┘                      │
│                               │                                            │
│                               ▼                                            │
│              ┌─────────────────────────────────────┐                      │
│              │      SỔ ĐĂNG KÝ MÔ HÌNH MLflow      │                     │
│              │  Staging → (phê duyệt) → Production  │                     │
│              │  Theo dõi Champion/Challenger         │                     │
│              └────────────────┬────────────────────┘                      │
│                               │                                            │
│                    ┌──────────┴───────────┐                               │
│                    │                      │                               │
│                    ▼                      ▼                               │
│         ┌──────────────────┐   ┌──────────────────┐                      │
│         │  PHỤC VỤ BATCH   │   │  PHỤC VỤ         │                      │
│         │  (Spark / Airflow│   │  THỜI GIAN THỰC  │                      │
│         │   chạy đêm)      │   │  (FastAPI /      │                      │
│         │                  │   │   BentoML)       │                      │
│         └────────┬─────────┘   └────────┬─────────┘                      │
│                  │                      │                                 │
│                  └──────────┬───────────┘                                 │
│                             ▼                                              │
│              ┌─────────────────────────────────────┐                      │
│              │   GIÁM SÁT & PHÁT HIỆN DRIFT        │                     │
│              │  Prometheus + Grafana + Evidently AI │                     │
│              │  → kích hoạt huấn luyện lại nếu     │                     │
│              │    drift > θ                         │                     │
│              └────────────────┬────────────────────┘                      │
│                               │                                            │
│                               └──────────▶ Kích Hoạt Huấn Luyện Lại      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Sub-Pipeline A: Thu Nạp Dữ Liệu → Xây Dựng Đặc Trưng → Huấn Luyện → Đánh Giá

```
[Dữ Liệu Nguồn Thô]
       │
       ▼
[Giai Đoạn Thu Nạp]
  Đầu vào:  Tải CSV, kéo qua REST API, luồng Kafka
  Đầu ra:   Các dòng chuỗi thời gian thô trong TimescaleDB + S3 Parquet
  SLA:      Batch: hàng ngày trước 02:00 UTC | Streaming: độ trễ <5 giây
  Schema:   {entity_id: str, timestamp: datetime, value: float, source: str}
  Lỗi:      Xác nhận schema qua Great Expectations → cách ly vào /bad-data/
             Timestamp null hoặc khóa trùng → cảnh báo + bỏ qua
       │
       ▼
[Cổng Chất Lượng Dữ Liệu]
  Đầu vào:  Các dòng thô
  Đầu ra:   Tập dữ liệu đã xác nhận hoặc báo cáo cách ly
  Kiểm tra: Không có giá trị mục tiêu null, timestamp đơn điệu theo thực thể,
            giá trị trong [min_expected, max_expected] theo loại chuỗi
  Lỗi:      Fail-fast khi tỷ lệ null >5%; cảnh báo khi lịch sử <2 năm
       │
       ▼
[Giai Đoạn Xây Dựng Đặc Trưng]
  Đầu vào:  Chuỗi thời gian thô đã xác nhận (entity_id, timestamp, value, covariates)
  Đầu ra:   Ma trận đặc trưng (Parquet, đúng thời điểm qua Feast)
  Thao tác chính:
    • Đặc trưng trễ: y_{t-1}, y_{t-7}, y_{t-28}, y_{t-52w}
    • Thống kê cuộn: mean/std/min/max trên cửa sổ [7, 14, 28, 90] ngày
    • Lịch: day_of_week, week_of_year, month, is_holiday, days_to_event
    • Nối dữ liệu ngoài: thời tiết (nhiệt độ, lượng mưa), chỉ số kinh tế
    • Mã hóa mục tiêu: entity_id, category_id (làm mịn, cross-validated)
    • Phân rã: phần dư STL như đặc trưng bổ sung
  SLA:      <30 phút cho 10K chuỗi
  Lỗi:      Nối đặc trưng thất bại → dùng giá trị dự phòng (zero/median impute) + ghi log
       │
       ▼
[Giai Đoạn Huấn Luyện]
  Đầu vào:  Ma trận đặc trưng + định nghĩa fold walk-forward
  Đầu ra:   Artifact mô hình đã huấn luyện (.pkl, .pt) + MLflow run
  Thao tác chính:
    • Walk-forward cross-validation (gap = forecast_horizon)
    • LightGBM: objective=tweedie (cho nhu cầu), n_estimators=2000, early_stopping
    • PatchTST/TFT: PyTorch Lightning trainer, max_epochs=50, ReduceLROnPlateau
    • Tìm siêu tham số: Optuna, 50 thử nghiệm, MedianPruner
  SLA:      LightGBM trên 1K SKU x 2 năm: <20 phút | PatchTST: <2 giờ trên GPU
  Lỗi:      OOM → giảm batch_size một nửa, thử lại 1 lần; nếu không → escalate
       │
       ▼
[Giai Đoạn Đánh Giá]
  Đầu vào:  Mô hình đã huấn luyện + holdout test fold
  Đầu ra:   JSON metrics + so sánh thí nghiệm MLflow + cổng đạt/không đạt
  Metrics:  MASE (chính), RMSSE, CRPS (xác suất), Coverage (cho PI)
  Cổng:     MASE < 1.0 so với baseline naive; nếu không thì từ chối ứng viên
  Phân cấp: Áp dụng hòa hợp MinT → đánh giá lại tính nhất quán
  Lỗi:      Tính metric thất bại → đánh dấu run là FAILED trong MLflow
```

---

### 2.3 Sub-Pipeline B: Suy Luận → Giám Sát → Kích Hoạt Huấn Luyện Lại

```
[Yêu Cầu Suy Luận]
  Batch: Airflow DAG lên lịch chạy đêm (02:30 UTC sau thu nạp dữ liệu)
  Thời gian thực: REST POST /forecast/{entity_id}?horizon=28
       │
       ▼
[Truy Xuất Đặc Trưng]
  Đầu vào:  entity_id + forecast_start_date
  Đầu ra:   Vector đặc trưng (tra cứu online store qua Feast Redis backend)
  SLA:      <10ms truy xuất đặc trưng (Redis)
  Lỗi:      Cache miss → dự phòng tra cứu offline Parquet (<200ms) + ghi log cache miss
       │
       ▼
[Tải Mô Hình & Dự Đoán]
  Đầu vào:  Vector đặc trưng + artifact mô hình đã tải (từ MLflow Registry)
  Đầu ra:   Dự báo điểm + khoảng dự đoán (phân vị dưới/trên)
  Thao tác chính:
    • Mô hình champion tải một lần mỗi pod (không mỗi request)
    • Wrapper conformal prediction áp dụng PI đã hiệu chuẩn
    • Hòa hợp MinT nếu yêu cầu phân cấp
  SLA:      LightGBM: <20ms P99 | TFT/PatchTST: <300ms P99 | Foundation: <800ms P99
  Lỗi:      Tải mô hình thất bại → dự phòng sang baseline thống kê (ETS) + cảnh báo
            Dự đoán NaN/Inf → giới hạn về [0, max_historical] + cảnh báo
       │
       ▼
[Ghi Log Dự Đoán]
  Đầu vào:  Dự đoán + metadata yêu cầu
  Đầu ra:   Ghi vào TimescaleDB (bảng predictions) để so sánh với thực tế
  Schema:   {entity_id, forecast_date, horizon, predicted, lower_80, upper_80,
             model_version, latency_ms, timestamp}
       │
       ▼
[Tầng Giám Sát — chạy bất đồng bộ, batch mỗi 1 giờ]
  Đầu vào:  Giá trị dự đoán so với thực tế (so sánh T+horizon)
  Đầu ra:   Bảng điều khiển metrics drift + trigger cảnh báo
  Kiểm tra:
    • Data drift: PSI (Population Stability Index — Chỉ số ổn định phân phối) trên đặc trưng đầu vào > 0.2
    • Target drift: KL divergence của phân phối thực tế gần đây > ngưỡng
    • Chất lượng mô hình: MASE cuộn 30 ngày gần nhất > 1.3 lần MASE baseline
    • Kiểm tra coverage: PI coverage < 0.75 (mục tiêu 0.80) kích hoạt hiệu chuẩn lại
  Công cụ: Evidently AI cho báo cáo drift, Prometheus cho metrics SLA
       │
       ▼
[Kích Hoạt Huấn Luyện Lại]
  Điều kiện (BẤT KỲ điều kiện nào kích hoạt):
    • Theo lịch: Huấn luyện lại toàn bộ hàng tuần (Airflow DAG, Chủ Nhật 00:00 UTC)
    • Dựa trên drift: Data drift PSI > 0.2 trên >10% thực thể
    • Dựa trên hiệu suất: MASE cuộn > 1.3 lần trong >48 giờ
    • Thủ công: Kỹ sư ghi đè qua Airflow UI
  Hành động: Kích hoạt Sub-Pipeline Huấn Luyện → nếu MASE vượt cổng → thăng lên Production
  Chính sách challenger: Chạy mô hình mới song song champion trong 72 giờ → so sánh trước khi chuyển hoàn toàn
```

---

### 2.4 Hợp Đồng Dữ Liệu Giữa Các Giai Đoạn

```
HỢP ĐỒNG: Thu Nạp Thô → Feature Store
  Schema:
    entity_id:   string, NOT NULL, tối đa 64 ký tự
    timestamp:   datetime, UTC, NOT NULL, đơn điệu theo thực thể (không có ngày tương lai)
    value:       float64, nullable (NaN = thiếu, xử lý qua imputation)
    series_type: enum [demand, shipment, price, other]
    source:      string (ERP, POS, manual)
  SLA: Giao trước 02:00 UTC hàng ngày cho ngày trước đó
  Vi phạm: Cách ly + cảnh báo Slack đến kênh data-engineering

HỢP ĐỒNG: Feature Store → Huấn Luyện Mô Hình
  Schema:
    Tất cả đặc trưng trễ/cuộn: float32 (tiết kiệm bộ nhớ)
    Đặc trưng lịch: int8 (cờ 0/1) hoặc float32 (week_of_year chuẩn hóa)
    Mục tiêu (y): float32, NOT NULL (các dòng NaN bị loại trước huấn luyện)
    entity_id: categorical (LightGBM xử lý dạng category mã hóa int)
    fold_id: int (phân bổ fold walk-forward, KHÔNG dùng làm đặc trưng)
  SLA: Ma trận đặc trưng sẵn sàng trong vòng 30 phút sau khi thu nạp hoàn tất
  Vi phạm: Tác vụ huấn luyện đợi với retry (tối đa 3 lần, khoảng cách 10 phút)

HỢP ĐỒNG: Huấn Luyện Mô Hình → MLflow Registry
  Artifact bắt buộc:
    model: đã serialize (mlflow.lightgbm / mlflow.pytorch)
    metrics.json: {mase, rmsse, crps, coverage, train_date, data_version}
    params.json: tất cả siêu tham số (khả năng tái tạo)
    feature_schema.json: các cột đầu vào kỳ vọng + dtypes
  SLA: Mô hình đăng ký trong vòng 15 phút sau khi đánh giá hoàn tất
  Vi phạm: Tác vụ huấn luyện đánh dấu FAILED; không thăng lên Staging

HỢP ĐỒNG: MLflow Registry → Phục Vụ
  Mô hình champion: chỉ phục vụ mô hình ở giai đoạn "Production" trong MLflow Registry
  Dự phòng: nếu mô hình Production không tải được, phục vụ "ETS baseline" (luôn sẵn có)
  Quản lý phiên bản: pod phục vụ tải lại mô hình khi có tín hiệu thay đổi phiên bản (Kubernetes ConfigMap)
```

---

### 2.5 Tóm Tắt Xử Lý Lỗi

| Giai Đoạn | Loại Lỗi | Chiến Lược Xử Lý | Escalation |
|-----------|---------|-------------------|------------|
| Thu nạp | Schema không khớp | Cách ly bản ghi, tiếp tục batch | Cảnh báo khi tỷ lệ cách ly >1% |
| Thu nạp | Nguồn không khả dụng | Thử lại 3 lần với exponential backoff, sau đó bỏ qua | Cảnh báo + dùng dữ liệu tốt gần nhất |
| Xây dựng đặc trưng | Thiếu dữ liệu ngoài | Impute bằng median (từ tập huấn luyện), đánh cờ đặc trưng | Ghi log tỷ lệ imputation theo chuỗi |
| Huấn luyện | OOM | Giảm batch_size × 0.5, thử lại 1 lần | Escalate nếu vẫn OOM — thêm bộ nhớ GPU |
| Huấn luyện | Không hội tụ | Kiểm tra LR, early stop kích hoạt quá sớm, ghi cảnh báo | Dự phòng sang baseline thống kê cho thực thể đó |
| Đánh giá | Không vượt cổng MASE | Mô hình bị từ chối; giữ champion Production hiện tại | Cảnh báo đội; điều tra feature drift |
| Phục vụ | Tải mô hình thất bại | Tự động phục vụ ETS baseline | Cảnh báo PagerDuty (P1 nếu >5% thực thể bị ảnh hưởng) |
| Phục vụ | Dự đoán NaN/Inf | Giới hạn về phạm vi hợp lệ, ghi log bất thường | Cảnh báo nếu >0.1% yêu cầu bị ảnh hưởng |
| Giám sát | Vượt ngưỡng drift | Tự động kích hoạt pipeline huấn luyện lại | Cảnh báo + yêu cầu phê duyệt con người trước khi thăng |

---

## 3. Mẫu Code

### Mẫu 1: Walk-Forward Cross-Validation với Khoảng Trống Horizon

```python
# code_verified: false
# Mẫu: Walk-forward (cửa sổ mở rộng) CV cho chuỗi thời gian
# Khoảng trống ngăn rò rỉ dữ liệu khi đặc trưng sử dụng thông tin tương lai

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Iterator, Tuple

@dataclass
class WalkForwardFold:
    train_end: pd.Timestamp
    val_start: pd.Timestamp
    val_end: pd.Timestamp
    fold_id: int

def walk_forward_folds(
    df: pd.DataFrame,
    timestamp_col: str,
    min_train_periods: int,     # vd. 52 tuần
    forecast_horizon: int,      # vd. 12 tuần
    gap: int,                   # số kỳ giữa train_end và val_start
    n_folds: int,               # số cửa sổ xác nhận
    step_size: int = None,      # mặc định = forecast_horizon
) -> Iterator[WalkForwardFold]:
    """
    Tạo các fold walk-forward cho CV chuỗi thời gian.

    Dòng thời gian:
    |-------- huấn luyện ---------|-- gap --|-- xác nhận --|
                                           ^               ^
                                       val_start         val_end

    Khoảng trống ngăn rò rỉ khi đặc trưng trễ nhìn ngược qua ranh giới xác nhận.
    Vd. Nếu mô hình dùng lag-4 và horizon=4, gap=4 đảm bảo không rò rỉ dữ liệu tương lai.
    """
    step = step_size or forecast_horizon
    dates = sorted(df[timestamp_col].unique())
    n = len(dates)

    # Điểm kết thúc huấn luyện sớm nhất có thể
    train_end_idx = min_train_periods - 1

    for fold_id in range(n_folds):
        # Tiến bước theo step_size mỗi fold
        current_train_end_idx = train_end_idx + fold_id * step

        val_start_idx = current_train_end_idx + gap + 1
        val_end_idx = val_start_idx + forecast_horizon - 1

        if val_end_idx >= n:
            break  # Không đủ dữ liệu cho fold này

        yield WalkForwardFold(
            train_end=dates[current_train_end_idx],
            val_start=dates[val_start_idx],
            val_end=dates[val_end_idx],
            fold_id=fold_id,
        )


def cross_validate_model(
    df: pd.DataFrame,
    model_class,
    feature_cols: list,
    target_col: str,
    timestamp_col: str,
    entity_col: str,
    cv_config: dict,
) -> pd.DataFrame:
    """
    Chạy walk-forward CV và trả về metrics theo từng fold.
    """
    fold_metrics = []

    for fold in walk_forward_folds(df, timestamp_col, **cv_config):
        # Chia tập
        train = df[df[timestamp_col] <= fold.train_end]
        val = df[
            (df[timestamp_col] >= fold.val_start) &
            (df[timestamp_col] <= fold.val_end)
        ]

        if len(train) == 0 or len(val) == 0:
            continue

        # Fit mô hình
        model = model_class()
        model.fit(train[feature_cols], train[target_col])

        # Dự đoán
        val = val.copy()
        val["predicted"] = model.predict(val[feature_cols])

        # Đánh giá — MASE cần dự báo naive trên tập huấn luyện
        naive_mae = _compute_naive_mae(train, target_col, entity_col)
        mase = _compute_mase(val[target_col], val["predicted"], naive_mae)

        fold_metrics.append({
            "fold_id": fold.fold_id,
            "train_end": fold.train_end,
            "val_start": fold.val_start,
            "val_end": fold.val_end,
            "mase": mase,
            "n_val": len(val),
        })

    return pd.DataFrame(fold_metrics)


def _compute_naive_mae(train: pd.DataFrame, target_col: str, entity_col: str) -> float:
    """MAE naive theo mùa (lag-7 hoặc lag-1) trên tập huấn luyện."""
    naive_lag = 7  # naive mùa vụ hàng tuần
    grouped = train.groupby(entity_col)[target_col]
    errors = []
    for _, series in grouped:
        s = series.values
        if len(s) > naive_lag:
            errors.append(np.mean(np.abs(s[naive_lag:] - s[:-naive_lag])))
    return np.mean(errors) if errors else 1.0  # dự phòng


def _compute_mase(actual, predicted, naive_mae: float) -> float:
    mae = np.mean(np.abs(actual.values - predicted.values))
    return mae / (naive_mae + 1e-8)
```

---

### Mẫu 2: Suy Luận Zero-Shot với Foundation Model

```python
# code_verified: false
# Mẫu: Suy luận zero-shot chuẩn hóa qua foundation model
# Hỗ trợ TimesFM, Chronos — hoán đổi được qua strategy pattern

from abc import ABC, abstractmethod
from dataclasses import dataclass
import numpy as np
import pandas as pd
from typing import Optional

@dataclass
class ForecastResult:
    entity_id: str
    forecast_dates: list
    point_forecast: np.ndarray
    lower_80: Optional[np.ndarray] = None   # Giới hạn dưới khoảng dự đoán 80%
    upper_80: Optional[np.ndarray] = None
    model_name: str = "unknown"
    is_zero_shot: bool = True


class FoundationForecaster(ABC):
    """Chiến lược trừu tượng — cho phép hoán đổi foundation model khi chạy."""

    @abstractmethod
    def load_model(self, model_size: str = "small") -> None:
        pass

    @abstractmethod
    def predict(
        self,
        context: np.ndarray,       # giá trị lịch sử, shape (T,)
        horizon: int,              # số bước dự báo
        freq: str,                 # chuỗi tần suất pandas vd. "W", "D", "M"
    ) -> ForecastResult:
        pass


class TimesFMForecaster(FoundationForecaster):
    """Dự báo zero-shot với Google DeepMind TimesFM."""

    def load_model(self, model_size: str = "small") -> None:
        import timesfm
        self.tfm = timesfm.TimesFm(
            hparams=timesfm.TimesFmHparams(
                backend="cpu",          # hoặc "gpu"
                per_core_batch_size=32,
                horizon_len=128,        # horizon tối đa được hỗ trợ
            ),
            checkpoint=timesfm.TimesFmCheckpoint(
                huggingface_repo_id="google/timesfm-1.0-200m-pytorch"
            ),
        )
        self.tfm.load_from_checkpoint(checkpoint=self.tfm.checkpoint)

    def predict(
        self,
        context: np.ndarray,
        horizon: int,
        freq: str = "W",
    ) -> ForecastResult:
        # TimesFM yêu cầu danh sách mảng 1D
        forecast_input = [context.astype(np.float32)]
        freq_map = {"D": 0, "W": 1, "M": 2, "Q": 3, "Y": 4}
        freq_int = [freq_map.get(freq, 1)]

        point_forecast, _ = self.tfm.forecast(
            forecast_input,
            freq=freq_int,
        )
        # shape point_forecast: (1, horizon)
        return ForecastResult(
            entity_id="",
            forecast_dates=[],
            point_forecast=point_forecast[0, :horizon],
            model_name="TimesFM-200M",
            is_zero_shot=True,
        )


class ChronosForecaster(FoundationForecaster):
    """Dự báo xác suất zero-shot với Amazon Chronos."""

    def load_model(self, model_size: str = "small") -> None:
        from chronos import ChronosPipeline
        model_id_map = {
            "tiny":   "amazon/chronos-t5-tiny",
            "small":  "amazon/chronos-t5-small",
            "base":   "amazon/chronos-t5-base",
            "large":  "amazon/chronos-t5-large",
        }
        self.pipeline = ChronosPipeline.from_pretrained(
            model_id_map.get(model_size, model_id_map["small"]),
            device_map="cpu",
            torch_dtype="float32",
        )
        self.model_size = model_size

    def predict(
        self,
        context: np.ndarray,
        horizon: int,
        freq: str = "W",
        num_samples: int = 100,
    ) -> ForecastResult:
        import torch
        context_tensor = torch.tensor(context, dtype=torch.float32)

        # Trả về tensor (n_samples, horizon)
        forecast = self.pipeline.predict(
            context=context_tensor,
            prediction_length=horizon,
            num_samples=num_samples,
        )
        samples = forecast[0].numpy()  # shape: (num_samples, horizon)

        point = np.median(samples, axis=0)
        lower = np.quantile(samples, 0.1, axis=0)
        upper = np.quantile(samples, 0.9, axis=0)

        return ForecastResult(
            entity_id="",
            forecast_dates=[],
            point_forecast=point,
            lower_80=lower,
            upper_80=upper,
            model_name=f"Chronos-T5-{self.model_size}",
            is_zero_shot=True,
        )


def zero_shot_forecast_batch(
    series_df: pd.DataFrame,
    entity_col: str,
    timestamp_col: str,
    value_col: str,
    horizon: int,
    freq: str,
    forecaster: FoundationForecaster,
    min_context_length: int = 64,
) -> pd.DataFrame:
    """
    Dự báo zero-shot theo batch cho nhiều thực thể.
    Bỏ qua các thực thể không đủ lịch sử.
    Dự phòng sang ETS nếu foundation model phát sinh lỗi.
    """
    results = []

    for entity_id, group in series_df.groupby(entity_col):
        context = group.sort_values(timestamp_col)[value_col].values
        last_date = group[timestamp_col].max()

        if len(context) < min_context_length:
            # Dùng context hiện có dù ngắn — foundation model xử lý được
            pass  # hoặc: continue để bỏ qua

        try:
            result = forecaster.predict(context=context, horizon=horizon, freq=freq)
            result.entity_id = entity_id
        except Exception as e:
            # Dự phòng: ETS qua statsforecast
            result = _ets_fallback(entity_id, context, horizon, last_date, freq)

        # Tạo ngày dự báo
        forecast_dates = pd.date_range(
            start=last_date,
            periods=horizon + 1,
            freq=freq,
        )[1:]
        result.forecast_dates = forecast_dates.tolist()

        for i, (date, pred) in enumerate(zip(forecast_dates, result.point_forecast)):
            row = {
                entity_col: entity_id,
                "forecast_date": date,
                "horizon_step": i + 1,
                "predicted": float(pred),
                "model": result.model_name,
                "is_zero_shot": result.is_zero_shot,
            }
            if result.lower_80 is not None:
                row["lower_80"] = float(result.lower_80[i])
                row["upper_80"] = float(result.upper_80[i])
            results.append(row)

    return pd.DataFrame(results)


def _ets_fallback(entity_id, context, horizon, last_date, freq):
    """Baseline ETS dự phòng khi foundation model thất bại."""
    from statsforecast import StatsForecast
    from statsforecast.models import AutoETS

    df = pd.DataFrame({
        "unique_id": entity_id,
        "ds": pd.date_range(end=last_date, periods=len(context), freq=freq),
        "y": context,
    })
    sf = StatsForecast(models=[AutoETS()], freq=freq)
    sf.fit(df)
    forecast_df = sf.predict(h=horizon)
    return ForecastResult(
        entity_id=entity_id,
        forecast_dates=[],
        point_forecast=forecast_df["AutoETS"].values,
        model_name="AutoETS-fallback",
        is_zero_shot=False,
    )
```

---

### Mẫu 3: Hòa Hợp Phân Cấp — Bản Phác Thảo Triển Khai MinT

```python
# code_verified: false
# Mẫu: Hòa hợp MinT (Minimum Trace) cho dự báo phân cấp
# Dựa trên Wickramasuriya et al. (2019) — ước lượng co rút cho W

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple

def build_summing_matrix(
    hierarchy: Dict[str, List[str]],
    bottom_level_ids: List[str],
    all_level_ids: List[str],
) -> np.ndarray:
    """
    Xây dựng ma trận tổng S sao cho y_all = S @ y_bottom.

    Args:
        hierarchy: dict ánh xạ parent_id -> [child_id, ...]
                   vd. {"total": ["region_A", "region_B"],
                          "region_A": ["sku_001", "sku_002"],
                          "region_B": ["sku_003"]}
        bottom_level_ids: danh sách ID nút lá theo thứ tự cố định
        all_level_ids: tất cả ID nút từ trên xuống dưới, lá cuối cùng

    Returns:
        S: ma trận float (n_all, n_bottom)
    """
    n_all = len(all_level_ids)
    n_bottom = len(bottom_level_ids)
    S = np.zeros((n_all, n_bottom))

    bottom_index = {bid: i for i, bid in enumerate(bottom_level_ids)}

    def get_bottom_leaves(node_id: str) -> List[str]:
        """Thu thập đệ quy tất cả lá cấp dưới cùng của node_id."""
        if node_id in bottom_index:
            return [node_id]
        children = hierarchy.get(node_id, [])
        leaves = []
        for child in children:
            leaves.extend(get_bottom_leaves(child))
        return leaves

    for row_idx, node_id in enumerate(all_level_ids):
        leaves = get_bottom_leaves(node_id)
        for leaf in leaves:
            col_idx = bottom_index[leaf]
            S[row_idx, col_idx] = 1.0

    return S


def mint_reconcile(
    base_forecasts: np.ndarray,   # shape (n_all_levels, horizon)
    S: np.ndarray,                # shape (n_all_levels, n_bottom)
    residuals: np.ndarray,        # shape (n_all_levels, n_train) — phần dư trong mẫu
    method: str = "shrink",       # "ols", "wls_structural", "shrink"
) -> np.ndarray:
    """
    Áp dụng hòa hợp MinT cho dự báo cơ sở.

    Công thức MinT: ỹ = S (SᵀW⁻¹S)⁻¹ Sᵀ W⁻¹ ŷ

    Returns:
        Dự báo đã hòa hợp: (n_all_levels, horizon)
    """
    n_all, n_bottom = S.shape

    # Ước lượng W (hiệp phương sai của lỗi dự báo cơ sở)
    W = _estimate_W(residuals, method=method)

    # Tính ma trận hòa hợp MinT
    # P = (SᵀW⁻¹S)⁻¹ Sᵀ W⁻¹
    W_inv = np.linalg.inv(W + 1e-8 * np.eye(n_all))  # điều chuẩn hóa
    StW_inv = S.T @ W_inv
    StW_invS = StW_inv @ S

    try:
        StW_invS_inv = np.linalg.inv(StW_invS)
    except np.linalg.LinAlgError:
        # Dự phòng sang OLS nếu ma trận suy biến
        StW_invS_inv = np.linalg.pinv(StW_invS)

    P = StW_invS_inv @ StW_inv   # shape: (n_bottom, n_all)

    # Dự báo đã hòa hợp: ỹ = S P ŷ
    reconciled = S @ P @ base_forecasts  # shape: (n_all, horizon)

    return reconciled


def _estimate_W(residuals: np.ndarray, method: str = "shrink") -> np.ndarray:
    """
    Ước lượng ma trận hiệp phương sai W của lỗi dự báo cơ sở.

    residuals: (n_series, T) phần dư một bước trước trong mẫu
    """
    n_series, T = residuals.shape

    if method == "ols":
        # W = I (giả định lỗi bằng nhau, không tương quan)
        return np.eye(n_series)

    elif method == "wls_structural":
        # W = diag(S @ ones_bottom) — co giãn theo số chuỗi cấp dưới
        # Xấp xỉ phương sai dự báo theo cấp chuỗi
        variances = np.var(residuals, axis=1) + 1e-8
        return np.diag(variances)

    elif method == "shrink":
        # Ước lượng co rút Ledoit-Wolf — hiệp phương sai mẫu điều chuẩn hóa
        # Tốt hơn khi n_series >> T (phổ biến trong phân cấp bán lẻ)
        sample_cov = np.cov(residuals)  # (n_series, n_series)

        # Mục tiêu co rút: đường chéo (chỉ phương sai)
        target = np.diag(np.diag(sample_cov))

        # Cường độ co rút Ledoit-Wolf (đơn giản hóa)
        # LW đầy đủ: dùng sklearn.covariance.LedoitWolf
        try:
            from sklearn.covariance import LedoitWolf
            lw = LedoitWolf().fit(residuals.T)
            return lw.covariance_
        except ImportError:
            # Dự phòng co rút thủ công
            alpha = min(1.0, (n_series + 2) / (T * 0.5))
            return (1 - alpha) * sample_cov + alpha * target

    else:
        raise ValueError(f"Phương pháp ước lượng W không xác định: {method}")


def reconcile_forecasts_dataframe(
    forecasts_df: pd.DataFrame,
    hierarchy: Dict[str, List[str]],
    bottom_level_ids: List[str],
    all_level_ids: List[str],
    residuals_df: pd.DataFrame,
    entity_col: str = "entity_id",
    horizon_col: str = "horizon_step",
    forecast_col: str = "predicted",
) -> pd.DataFrame:
    """
    Wrapper thân thiện DataFrame cho hòa hợp MinT.
    Giả định forecasts_df có các dòng (entity_id, horizon_step, predicted).
    """
    S = build_summing_matrix(hierarchy, bottom_level_ids, all_level_ids)

    # Pivot thành ma trận: (n_all, horizon)
    pivoted = forecasts_df.pivot(index=entity_col, columns=horizon_col, values=forecast_col)
    pivoted = pivoted.loc[all_level_ids]  # đảm bảo thứ tự dòng đúng
    base_matrix = pivoted.values  # (n_all, horizon)

    # Ma trận phần dư: (n_all, T)
    res_pivoted = residuals_df.pivot(index=entity_col, columns="time_step", values="residual")
    res_pivoted = res_pivoted.loc[all_level_ids].fillna(0)
    residuals_matrix = res_pivoted.values

    # Hòa hợp
    reconciled_matrix = mint_reconcile(base_matrix, S, residuals_matrix, method="shrink")

    # Chuyển về DataFrame
    reconciled_df = pd.DataFrame(
        reconciled_matrix,
        index=all_level_ids,
        columns=pivoted.columns,
    ).reset_index().melt(id_vars=entity_col, var_name=horizon_col, value_name="reconciled")

    return reconciled_df
```

---

## 4. Ví Dụ Minh Họa

### Ví Dụ A: Dự Báo Nhu Cầu Bán Lẻ (Hàng Tuần, 1.000 SKU, Lịch Sử 2 Năm)

#### Thiết Lập Bài Toán
- **Thực thể:** 1.000 SKU trên 10 cửa hàng (tổng 10.000 chuỗi ở cấp SKU×Cửa hàng)
- **Tần suất:** Hàng tuần (bắt đầu Thứ Hai)
- **Lịch sử:** 2 năm (104 tuần mỗi chuỗi)
- **Horizon dự báo:** 12 tuần tới
- **Mục tiêu:** Giảm thiểu tồn kho thừa/thiếu; đầu ra dự báo điểm + PI 80% cho hoạch định tồn kho

#### Schema Dữ Liệu Mẫu
```
Bảng: retail_sales
┌─────────────────┬──────────────┬───────────────┬─────────────────────────────────────┐
│ Cột             │ Kiểu         │ Nullable      │ Mô Tả                               │
├─────────────────┼──────────────┼───────────────┼─────────────────────────────────────┤
│ sku_id          │ VARCHAR(32)  │ NOT NULL      │ Mã định danh SKU sản phẩm           │
│ store_id        │ VARCHAR(16)  │ NOT NULL      │ Mã định danh cửa hàng               │
│ week_start      │ DATE         │ NOT NULL      │ Thứ Hai của tuần dự báo              │
│ units_sold      │ FLOAT        │ NOT NULL      │ Biến mục tiêu (cắt tại 0)           │
│ price           │ FLOAT        │ NOT NULL      │ Giá bán trung bình tuần              │
│ is_promoted     │ BOOLEAN      │ NOT NULL      │ Cờ khuyến mãi đang hoạt động        │
│ category_id     │ VARCHAR(16)  │ NOT NULL      │ Danh mục sản phẩm                   │
│ region          │ VARCHAR(16)  │ NOT NULL      │ Vùng địa lý                          │
│ is_holiday_week │ BOOLEAN      │ NOT NULL      │ Chứa ngày lễ                         │
│ temp_avg        │ FLOAT        │ nullable      │ Nhiệt độ trung bình (dữ liệu ngoài) │
└─────────────────┴──────────────┴───────────────┴─────────────────────────────────────┘
Khóa chính: (sku_id, store_id, week_start)
```

#### Đặc Trưng Đã Xây Dựng
```
Đặc trưng trễ:     y_lag_1, y_lag_4, y_lag_8, y_lag_12, y_lag_52
Thống kê cuộn:     y_roll_mean_4w, y_roll_mean_12w, y_roll_std_4w, y_roll_max_12w
Lịch:              week_of_year, month, quarter, is_holiday_week, days_to_next_holiday
Giá:               price_lag_1, price_pct_change_4w, is_on_promotion
Mã hóa thực thể:  sku_category_target_enc (làm mịn, out-of-fold)
Phân rã:           Phần dư STL (nắm bắt các đột biến bất thường không giải thích bởi mùa vụ)
```

#### Lựa Chọn Mô Hình & Lý Do
**Mô hình chính: LightGBM mô hình toàn cục**
- 104 tuần × 10.000 chuỗi = 1,04M dòng huấn luyện (trước xây dựng đặc trưng)
- Bằng chứng từ cuộc thi M5: LightGBM + xây dựng đặc trưng vượt DL cho quy mô và horizon này
- Hỗ trợ tự nhiên biến phân loại cho sku_id, store_id, category_id
- Huấn luyện nhanh (<15 phút CPU) với hàm mất mát Tweedie (xử lý nhu cầu zero-inflated)
- Hỗ trợ SHAP cho giải thích ở cấp SKU

**Đầu ra xác suất: Hậu xử lý hồi quy phân vị**
- Huấn luyện 3 mô hình LightGBM: phân vị 0.1, 0.5 (trung vị), 0.9
- Hiệu chuẩn conformal prediction trên holdout để đảm bảo coverage 80%

**Baseline so sánh:** StatsForecast AutoETS theo chuỗi (song song hóa)

#### Hướng Dẫn Từng Bước
```
1. Tạo đặc trưng:    Script SQL + Python trong Airflow DAG, ~8 phút cho 10K chuỗi
2. Walk-forward CV:   5 fold, mỗi fold 12 tuần xác nhận, 4 tuần khoảng trống
3. Huấn luyện LightGBM: objective=tweedie, tweedie_variance_power=1.5
                        n_estimators=3000, early_stopping_rounds=100
                        categorical_feature=[sku_id, store_id, category_id]
4. HPO (Optuna):      Điều chỉnh learning_rate, num_leaves, min_child_samples
                        30 thử nghiệm, tổng 20 phút
5. Huấn luyện phân vị: Huấn luyện lại với objective=quantile cho q=0.1 và q=0.9
6. Hiệu chuẩn conformal: Thu thập phần dư trên fold cuối → đặt bán kính conformal
7. Hòa hợp:          Tổng hợp SKU×Cửa hàng → SKU, Cửa hàng, Danh mục, Tổng
                        Áp dụng MinT để đảm bảo nhất quán
```

#### Kết Quả Kỳ Vọng
| Metric | Mục Tiêu | Baseline (Naive) | AutoETS | LightGBM |
|--------|----------|-----------------|---------|----------|
| MASE | < 0.85 | 1.00 | ~0.90 | ~0.78 |
| RMSSE | < 0.90 | 1.00 | ~0.92 | ~0.80 |
| PI Coverage (80%) | 78–82% | không áp dụng | ~75% | ~80% (conformal) |

#### Các Bẫy Thường Gặp
1. **Rò rỉ mục tiêu qua đặc trưng trễ:** Đảm bảo đặc trưng trễ dùng `shift()` đúng — không bao giờ đưa thông tin tuần hiện tại vào đặc trưng dùng để dự đoán tuần hiện tại
2. **Nhu cầu zero-inflated:** SKU mới hoặc sản phẩm bán chậm có nhiều tuần bằng không — dùng hàm mất mát Tweedie, không phải MSE
3. **Nhiễu khuyến mãi:** Trong thời gian khuyến mãi lớn, nhu cầu tăng đột biến 3–10 lần; nếu không có `is_promoted` làm đặc trưng, các lag mang tín hiệu sai lệch
4. **Không nhất quán phân cấp:** Tổng dự báo SKU thô lên cấp cửa hàng sẽ khác với dự báo mô hình cấp cửa hàng — luôn hòa hợp
5. **Khoảng trống walk-forward:** Không có khoảng trống bằng horizon, mô hình có thể học từ đặc trưng chưa biết tại thời điểm dự đoán

---

### Ví Dụ B: Khối Lượng Vận Chuyển Logistics (Hàng Ngày, Đa Vùng, Đặc Trưng Bên Ngoài)

#### Thiết Lập Bài Toán
- **Thực thể:** 15 cặp gốc-đích (OD) theo vùng
- **Tần suất:** Hàng ngày
- **Lịch sử:** 3 năm (1.095 ngày)
- **Horizon dự báo:** 30 ngày tới (hoạch định vận hành)
- **Mục tiêu:** Hoạch định nhân sự và năng lực — cần dự báo khối lượng hàng ngày + dải bất định

#### Schema Dữ Liệu Mẫu
```
Bảng: shipment_volumes
┌────────────────────┬──────────────┬──────────────────────────────────────────────┐
│ Cột                │ Kiểu         │ Mô Tả                                        │
├────────────────────┼──────────────┼──────────────────────────────────────────────┤
│ od_pair_id         │ VARCHAR(32)  │ Cặp gốc-đích (vd. "HN-HCM")                 │
│ shipment_date      │ DATE         │ Ngày vận chuyển                               │
│ shipment_count     │ INTEGER      │ Số lượng vận chuyển (biến mục tiêu)          │
│ avg_weight_kg      │ FLOAT        │ Trọng lượng vận chuyển trung bình             │
│ origin_region      │ VARCHAR(16)  │ Vùng gốc                                     │
│ dest_region        │ VARCHAR(16)  │ Vùng đích                                    │
│ day_of_week        │ INTEGER      │ 0=T2...6=CN                                  │
│ is_public_holiday  │ BOOLEAN      │ Cờ ngày lễ Việt Nam                           │
│ weather_disruption │ FLOAT        │ Chỉ số gián đoạn thời tiết [0,1]             │
│ ecommerce_index    │ FLOAT        │ Chỉ số hoạt động thương mại điện tử quốc gia │
│ gdp_monthly_proxy  │ FLOAT        │ Proxy GDP hàng tháng (forward-fill theo ngày) │
└────────────────────┴──────────────┴──────────────────────────────────────────────┘
Khóa chính: (od_pair_id, shipment_date)
```

#### Đặc Trưng Đã Xây Dựng
```
Đặc trưng trễ:     y_lag_1, y_lag_7, y_lag_14, y_lag_28, y_lag_365
Thống kê cuộn:     y_roll_mean_7d, y_roll_mean_28d, y_roll_std_7d, y_roll_max_14d
Ngày trong tuần:   One-hot hoặc integer (mẫu hàng tuần mạnh trong logistics)
Lịch:              day_of_month, week_of_year, month_end_flag, is_holiday,
                    days_since_last_holiday, days_to_next_holiday
Bên ngoài:         weather_disruption_lag_0 (biết trước), ecommerce_index_lag_7
Xu hướng:          Hệ số góc xu hướng tuyến tính 90 ngày gần nhất (theo cặp OD)
Tương tác:         od_pair_id × day_of_week (nắm bắt mẫu ngày trong tuần theo OD)
```

#### Lựa Chọn Mô Hình & Lý Do
**Chính: Temporal Fusion Transformer (TFT) qua PyTorch Forecasting**
- 15 cặp OD × 3 năm hàng ngày = 16.425 dòng mỗi chuỗi — tập dữ liệu tương đối nhỏ
- TFT xử lý tốt các biến đồng hành biết trước tương lai (cờ ngày lễ tương lai, dự báo thời tiết tương lai) qua kiến trúc chọn biến + bộ mã hóa tương lai
- Đầu ra phân vị (0.1, 0.5, 0.9) tích hợp sẵn — không cần mô hình phân vị riêng
- Trọng số attention cung cấp khả năng diễn giải "những ngày quá khứ nào dẫn đến dự báo này"
- Hiệu suất benchmark mạnh trên các tập dữ liệu điện, giao thông, và logistics

**Phương án thay thế/Ensemble: Trung bình có trọng số LightGBM + TFT**
- Trọng số LightGBM (0.5) + TFT (0.5) sử dụng hiệu suất xác nhận theo cặp OD
- Phòng ngừa overfitting của TFT cho các cặp OD ít dữ liệu

**UQ xác suất: Phân vị tự nhiên TFT + hiệu chuẩn conformal trên holdout**

#### Hướng Dẫn Từng Bước
```
1. Tập hợp dữ liệu:
   - Nối số lượng vận chuyển + API thời tiết (lịch sử + dự báo 10 ngày)
   - Forward-fill proxy GDP hàng tháng sang hàng ngày
   - Tính lịch ngày lễ cho tất cả ngày lễ công cộng Việt Nam + Tết

2. Xây dựng đặc trưng:
   - Tất cả đặc trưng trễ/cuộn, đảm bảo đúng thời điểm
   - Cho future_covariates: cờ ngày lễ biết trước cho toàn bộ horizon 30 ngày
     weather_disruption: dùng dự báo cho h+1 đến h+10, ngoại suy sau đó

3. Chia tập huấn luyện/xác nhận:
   - Walk-forward: 4 fold, cửa sổ xác nhận 30 ngày, khoảng trống 14 ngày
   - Khoảng trống tính cho đặc trưng trễ 14 ngày nhìn ngược qua ranh giới

4. Huấn luyện TFT (PyTorch Forecasting):
   - max_encoder_length=90, prediction_length=30
   - hidden_size=64, attention_head_size=4, dropout=0.1
   - output_size=7 (7 phân vị: 0.02, 0.1, 0.25, 0.5, 0.75, 0.9, 0.98)
   - optimizer=Adam, lr=1e-3, reduce_on_plateau
   - ~1 giờ huấn luyện trên CPU; 15 phút trên GPU

5. Hiệu chuẩn conformal:
   - Thu thập |thực tế - dự đoán_trung vị| trên holdout fold cuối
   - Đặt bán kính = phân vị 90 của phần dư hiệu chuẩn
   - Áp dụng đối xứng để có khoảng coverage 80% đảm bảo

6. Phục vụ:
   - Airflow DAG hàng đêm lấy API dự báo thời tiết mới nhất
   - Tạo đặc trưng 30 ngày tới → đưa vào suy luận TFT
   - Kết quả lưu: (od_pair_id, date, predicted, lower_80, upper_80)
   - Bảng điều khiển kinh doanh đọc từ TimescaleDB
```

#### Kết Quả Kỳ Vọng
| Metric | Mục Tiêu | Baseline (lag 7 ngày) | LightGBM | TFT |
|--------|----------|----------------------|----------|-----|
| MASE | < 0.75 | 1.00 | ~0.72 | ~0.68 |
| RMSSE | < 0.80 | 1.00 | ~0.75 | ~0.70 |
| PI Coverage (80%) | 78–82% | không áp dụng | ~80% | ~80% (conformal) |

#### Các Bẫy Thường Gặp
1. **Tập trung Tết/ngày lễ:** Nhiều ngày lễ liên tiếp tạo ra sự sụt giảm nhu cầu theo sau bởi đỉnh — đảm bảo đặc trưng riêng cho Tết (days_to_tet, tet_week_flag) được đưa vào nếu không TFT sẽ thất bại với mẫu này
2. **Biến đồng hành biết trước vs không biết trước tương lai:** TFT yêu cầu phân tách đầu vào theo việc chúng có biết tại thời điểm dự đoán hay không — phân loại sai giá trị thực tế trễ làm "future covariates" gây rò rỉ dữ liệu
3. **Horizon dự báo thời tiết:** API thời tiết cung cấp dự báo đáng tin cậy ~10 ngày. Sau ngày 10, ngoại suy kém đi. Đánh cờ suy giảm độ tin cậy dự báo trong khoảng dự đoán cho ngày 11–30
4. **Cold-start cặp OD:** Các cặp OD mới (vd. tuyến logistics mới) không có lịch sử. Dùng Chronos zero-shot cho 30 ngày đầu, sau đó chuyển sang mô hình đã huấn luyện khi có 60+ ngày dữ liệu
5. **Nhiễm tập huấn luyện/xác nhận qua trung bình cuộn:** Trung bình cuộn 28 ngày tính qua cửa sổ trải trên tập xác nhận gây rò rỉ — luôn tính đặc trưng chỉ dùng dữ liệu đến thời điểm đặc trưng

---

## 5. Cân Nhắc Sản Xuất

### 5.1 Bài Toán Cold Start (SKU/Thực Thể Mới Không Có Lịch Sử)

| Khía Cạnh | Thách Thức | Giải Pháp |
|-----------|-----------|-----------|
| Không có lịch sử | Không có đặc trưng trễ; thống kê cuộn không xác định | Impute bằng median cấp danh mục cho đặc trưng trễ/cuộn; đánh cờ `is_new_entity=True` làm đặc trưng |
| Phạm vi mô hình | Mô hình toàn cục LightGBM ngoại suy kém cho mẫu thực thể chưa thấy | Dùng foundation model (Chronos, TimesFM) cho 60 ngày đầu — zero-shot không cần lịch sử |
| Chính sách khởi động | Chuyển đổi từ foundation model sang mô hình toàn cục đã fine-tune | Kích hoạt khi thực thể tích lũy ≥ 60 quan sát; chạy A/B challenger; thăng nếu MASE cải thiện |
| Phân cấp | SKU mới không có dòng trong ma trận tổng | Chèn với dòng cấp cơ sở toàn zero; loại khỏi MinT cho đến khi có lịch sử |
| Độ tin cậy | Khoảng dự đoán rộng hơn cho cold-start | Tăng bán kính conformal 2 lần cho thực thể mới; truyền đạt bất định cho người dùng hạ nguồn |

**Ghi chú triển khai:** Gắn thẻ mỗi thực thể với trường `data_maturity`: `cold` (< 30 quan sát), `warm` (30–90 quan sát), `mature` (> 90 quan sát). Định tuyến suy luận đến các endpoint mô hình khác nhau theo thẻ.

---

### 5.2 Quản Lý Phiên Bản Mô Hình và Champion/Challenger

```
Chính sách:
  - Champion: một mô hình duy nhất ở giai đoạn Production trong MLflow Registry cho mỗi loại mô hình
  - Challenger: triển khai ở chế độ shadow — nhận cùng yêu cầu, dự đoán được ghi log nhưng KHÔNG phục vụ
  - Cửa sổ đánh giá: tối thiểu 7 ngày (hoặc 2× horizon dự báo)
  - Tiêu chí thăng: MASE Challenger ≤ MASE Champion × 0.97 (tức cải thiện ≥3%)
    HOẶC MASE Challenger < MASE Champion VÀ PI width thấp hơn (khoảng hiệu quả hơn)
  - Rollback: nếu MASE mô hình Production suy giảm >20% trong 48 giờ sau thăng → tự động rollback
  - Thẻ phiên bản: model_type, training_date, data_version, feature_schema_version

Các giai đoạn MLflow:
  None → Staging (vượt cổng đánh giá) → Production (con người phê duyệt) → Archived

Triển khai canary:
  Giai đoạn 1: 5% lưu lượng cho challenger (1 ngày)
  Giai đoạn 2: 20% lưu lượng (2 ngày)
  Giai đoạn 3: 100% lưu lượng → thăng lên champion
```

---

### 5.3 Đánh Đổi Độ Trễ vs. Độ Chính Xác

| Kịch Bản | Mục Tiêu Độ Trễ | Mô Hình Đề Xuất | Chi Phí Độ Chính Xác |
|-----------|-----------------|-----------------|---------------------|
| API thời gian thực (làm mới bảng điều khiển, <100ms) | P99 < 100ms | StatsForecast ETS hoặc LightGBM (đặc trưng đã tính trước) | ~5–10% MASE so với TFT |
| Gần thời gian thực (UI vận hành, <500ms) | P99 < 500ms | LightGBM hoặc TFT (mô hình nhỏ) | ~2–5% MASE so với TFT đầy đủ |
| Batch hàng đêm (hệ thống hoạch định) | Không SLA | TFT / PatchTST + ensemble đầy đủ | MASE tốt nhất có thể đạt |
| Cold-start (thực thể mới, best-effort) | P99 < 1000ms | Chronos-tiny hoặc TimesFM-200M | ~15–20% MASE so với fine-tuned |

**Đòn bẩy tối ưu:**
- Tính trước dự báo batch hàng đêm → cache trong Redis cho đọc thời gian thực (đánh đổi độ tươi lấy độ trễ)
- Lượng tử hóa mô hình (INT8) cho mô hình DL trên CPU: tăng tốc 2–4 lần, mất ~1–2% độ chính xác
- Xuất ONNX cho LightGBM: loại bỏ overhead trình thông dịch Python, giảm ~30% P99
- Tính trước đặc trưng: tính và cache tất cả đặc trưng tại thời điểm thu nạp, không phải tại thời điểm suy luận

---

### 5.4 Trôi Dạt Phân Phối / Trôi Dạt Khái Niệm

```
Các loại liên quan đến dự báo:
  1. Covariate drift (trôi dạt biến đồng hành): phân phối đặc trưng đầu vào thay đổi
     (vd. chiến lược khuyến mãi mới thay đổi phân phối giá)
  2. Label drift (trôi dạt nhãn): phân phối mục tiêu dịch chuyển
     (mẫu nhu cầu hậu COVID so với baseline trước COVID)
  3. Concept drift (trôi dạt khái niệm): mối quan hệ giữa X và y thay đổi
     (vd. mẫu mùa vụ dịch chuyển do khí hậu)

Chiến lược phát hiện:
  • Data drift: PSI trên phân phối đặc trưng cuộn 30 ngày so với baseline huấn luyện
                Ngưỡng: PSI > 0.2 (drift vừa phải), PSI > 0.25 (drift nghiêm trọng)
  • Drift hiệu suất mô hình: MASE cuộn (30 ngày gần nhất thực tế so với dự đoán)
                               Ngưỡng: > 1.3× MASE baseline
  • Target drift: KS test trên phân phối thực tế gần đây so với phân phối huấn luyện
                  Ngưỡng: KS p-value < 0.05

Giao thức ứng phó:
  Cấp 1 (PSI 0.2–0.25): Tăng tần suất giám sát, không hành động
  Cấp 2 (PSI > 0.25 HOẶC MASE > 1.3×): Kích hoạt huấn luyện lại tăng dần trên 6 tháng dữ liệu gần nhất
  Cấp 3 (MASE > 1.5× trong >72 giờ): Huấn luyện lại khẩn cấp toàn bộ, escalate cho đội ML
  Cấp 4 (xác nhận đứt gãy cấu trúc): Thiết kế lại mô hình thủ công, cập nhật xây dựng đặc trưng

Biện pháp đối phó thực tế:
  • Trọng số suy giảm theo thời gian trong huấn luyện: quan sát gần đây được trọng số mẫu cao hơn
  • Cập nhật trực tuyến (ETS/ARIMA): hiệu chuẩn lại tham số mô hình không gian trạng thái hàng ngày
  • Đánh cờ drift đặc trưng: đưa đặc trưng drift_flag — mô hình có thể học điều chỉnh cho dịch chuyển phân phối đã biết
  • Chuẩn hóa biến đồng hành: chuẩn hóa theo thống kê cuộn 90 ngày thay vì thống kê thời điểm huấn luyện
```

---

### 5.5 Đa Thuê Bao và Cách Ly

| Mối Quan Tâm | Phương Pháp |
|-------------|-------------|
| Cách ly dữ liệu | Schema TimescaleDB riêng cho mỗi thuê bao, hoặc bảo mật cấp dòng với cột `tenant_id` |
| Cách ly mô hình | Thí nghiệm MLflow riêng cho mỗi thuê bao; artifact mô hình riêng trong S3 với prefix `tenant_id/` |
| Cách ly phục vụ | Namespace k8s riêng HOẶC dịch vụ chia sẻ duy nhất với định tuyến tenant_id + ghi log cấp yêu cầu |
| Feature store | Feature view Feast riêng cho mỗi thuê bao; cách ly namespace trong khóa Redis |
| Phân bổ chi phí | Gắn thẻ tất cả tài nguyên đám mây (S3, tính toán) với `tenant_id` để phân bổ chi phí |
| Rò rỉ xuyên thuê bao | Mô hình toàn cục huấn luyện trên nhiều thuê bao trộn lẫn cần che dữ liệu nghiêm ngặt — hoặc huấn luyện mô hình toàn cục riêng theo tầng thuê bao |
| Cách ly SLA | Hàng đợi ưu tiên: thuê bao doanh nghiệp có pod suy luận chuyên dụng; thuê bao tiêu chuẩn chia sẻ pool |

**Đề xuất cho Giai đoạn 1 (MVP):** Kiến trúc đơn thuê bao trước. Thiết kế với cột `tenant_id` xuyên suốt tầng dữ liệu từ ngày đầu, nhưng chỉ thực thi cách ly ở Giai đoạn 2. Thêm cách ly thuê bao vào schema không có kế hoạch sẵn sẽ rất tốn kém.

---

### 5.6 Yêu Cầu Giải Thích cho Người Dùng Kinh Doanh

| Loại Người Dùng | Nhu Cầu Giải Thích | Phương Pháp Kỹ Thuật |
|----------------|--------------------|-----------------------|
| Chuyên viên hoạch định nhu cầu | "Tại sao dự báo tăng đột biến ở tuần 12?" | Giá trị SHAP từ LightGBM — hiển thị top-3 đặc trưng mỗi dự đoán; khuyến mãi, lag, mùa vụ |
| Quản lý chuỗi cung ứng | "SKU nào có bất định dự báo cao nhất?" | Độ rộng khoảng dự đoán làm proxy bất định; xếp hạng SKU theo tỷ lệ PI width / dự báo điểm |
| Tài chính | "Rủi ro tồn kho trong kịch bản xấu nhất là gì?" | Phân vị 90 (giới hạn trên) từ conformal prediction; biểu đồ so sánh kịch bản |
| Vận hành | "Mô hình còn chính xác không?" | Bảng điều khiển giám sát: MASE cuộn, biểu đồ thực tế so với dự báo, cảnh báo drift |
| Lãnh đạo | "Hệ thống dự báo của chúng ta có hoạt động tốt không?" | Báo cáo độ chính xác hàng tháng: MASE so với baseline naive, % SKU dưới ngưỡng, ước tính tiết kiệm chi phí |

**Công cụ:**
- SHAP: `shap.TreeExplainer` cho LightGBM — tính toán O(n × features), nhanh và chính xác
- Trọng số attention TFT: trích xuất lớp đầu ra attention → ánh xạ tên đặc trưng → trực quan hóa heatmap
- Tóm tắt ngôn ngữ tự nhiên: dựa trên mẫu ("Dự báo cao hơn 12% so với năm trước, do hoạt động khuyến mãi (+8%) và đỉnh mùa vụ (+4%)")
- Bảng điều khiển Gradio / Streamlit: công cụ nội bộ nhẹ cho chuyên viên hoạch định truy vấn dự báo + giải thích

---

## 6. Ước Tính Công Sức

### MVP (Chứng Minh Khái Niệm)

| Thành Phần | Tác Vụ | Công Sức |
|-----------|--------|---------|
| Pipeline dữ liệu | Thu nạp 1 nguồn dữ liệu → TimescaleDB → xây dựng đặc trưng cơ bản | 1 tuần |
| Mô hình | Mô hình toàn cục LightGBM + walk-forward CV + đánh giá MASE | 1 tuần |
| Phục vụ | Endpoint FastAPI, một mô hình, không giám sát | 0.5 tuần |
| Baseline | StatsForecast AutoETS để so sánh | 0.5 tuần |
| **Tổng** | | **3 tuần, 1 kỹ sư ML** |

**Rủi ro chính:**
- Vấn đề chất lượng dữ liệu (giá trị thiếu, timestamp bất thường) có thể tiêu tốn thêm 1+ tuần
- Lặp xây dựng đặc trưng thường bị đánh giá thấp — lên kế hoạch cho 2 vòng thử nghiệm
- Timeline giả định dữ liệu huấn luyện sạch, sẵn có — không bao gồm thời gian thu mua dữ liệu

---

### Production v1

| Thành Phần | Tác Vụ | Công Sức |
|-----------|--------|---------|
| Pipeline dữ liệu | Thu nạp đa nguồn + xác nhận Great Expectations + TimescaleDB + Parquet/S3 | 3 tuần |
| Feature store | Thiết lập Feast + đặc trưng đúng thời điểm + Redis online store | 2 tuần |
| Huấn luyện mô hình | LightGBM + TFT/PatchTST + walk-forward CV + Optuna HPO | 3 tuần |
| Đầu ra xác suất | Wrapper conformal prediction + hiệu chuẩn PI | 1 tuần |
| Phân cấp | Hòa hợp MinT + định nghĩa ma trận tổng | 1 tuần |
| MLflow | Theo dõi thí nghiệm + Model Registry + chính sách champion/challenger | 1 tuần |
| Phục vụ | Đóng gói BentoML + FastAPI + batch Spark + Airflow DAG | 2 tuần |
| Giám sát | Prometheus + Grafana + phát hiện drift Evidently + cảnh báo | 2 tuần |
| Cold-start | Tích hợp foundation model (Chronos) + logic định tuyến | 1 tuần |
| Kiểm thử & QA | Unit test, integration test, load test | 2 tuần |
| **Tổng** | | **18 tuần, 2 kỹ sư (1 ML + 1 MLOps/DE)** |

**Rủi ro chính:**
- Ổn định huấn luyện TFT đòi hỏi điều chỉnh siêu tham số cẩn thận — phân bổ thêm 1 tuần buffer
- Thiết lập Feast với tính đúng thời điểm phức tạp đáng ngạc nhiên — đội mới thường đánh giá thấp 50%
- Điều phối Airflow DAG cho pipeline đa giai đoạn có chi phí debug cao
- Độ trễ suy luận foundation model trên CPU có thể vượt SLA — kiểm thử sớm trên phần cứng mục tiêu

---

### Nền Tảng Đầy Đủ (Đa Mô Hình, Giám Sát, Giao Diện)

| Thành Phần | Tác Vụ | Công Sức |
|-----------|--------|---------|
| Tất cả thành phần Production v1 | (như trên) | 18 tuần |
| Đa thuê bao | Cách ly schema + mô hình theo thuê bao + phân bổ chi phí | 4 tuần |
| Mô hình nâng cao | Fine-tuning TimesFM, Moirai + ensemble mô hình + tự chọn mô hình | 4 tuần |
| Giao diện kinh doanh | Bảng điều khiển Streamlit/Next.js: trực quan dự báo + giải thích SHAP + cảnh báo | 4 tuần |
| Tự huấn luyện lại | Huấn luyện lại theo drift + tự động triển khai canary | 3 tuần |
| Phục vụ foundation model | Pod suy luận GPU cho Chronos/TimesFM ở quy mô | 2 tuần |
| Tài liệu & đào tạo | Hướng dẫn sử dụng, tài liệu API, đào tạo đội ngũ | 2 tuần |
| **Tổng** | | **37 tuần (~9 tháng), 4 kỹ sư (2 ML + 1 MLOps + 1 FE)** |

**Rủi ro chính:**
- Yêu cầu giao diện kinh doanh có xu hướng mở rộng phạm vi — đóng băng tính năng nghiêm ngặt sau tháng 5
- Chi phí suy luận GPU cho foundation model có thể cao ở quy mô — benchmark chi phí/độ chính xác trước khi cam kết
- Kiểm toán bảo mật đa thuê bao cần thiết trước triển khai doanh nghiệp — thêm buffer 2–3 tuần
- Logic tự huấn luyện lại có lỗi tinh vi (race condition, cache cũ) — cần kiểm thử kỹ lưỡng

---

## 7. Hạn Chế Đã Biết & Giải Pháp

```
HẠN CHẾ 1: LightGBM đòi hỏi chuyên môn xây dựng đặc trưng
→ Chất lượng mô hình phụ thuộc vào chất lượng đặc trưng lag/cuộn. Xây dựng đặc trưng kém (rò rỉ,
  lag sai) cho kết quả vô nghĩa. Giải pháp: chuẩn hóa thư viện xây dựng đặc trưng,
  code review tất cả định nghĩa đặc trưng, luôn xác nhận với walk-forward CV (không phải chia ngẫu nhiên).

HẠN CHẾ 2: Foundation model (Chronos, TimesFM) chậm trên CPU
→ Chronos-large: ~2 giây mỗi chuỗi trên CPU. Cho 10.000 chuỗi, khoảng ~6 giờ.
  Giải pháp: Dùng Chronos-tiny cho batch cold-start; GPU cho trường hợp tương tác;
  tính trước hàng đêm và cache kết quả.

HẠN CHẾ 3: Hòa hợp MinT đòi hỏi phần dư trong mẫu
→ Nếu dữ liệu huấn luyện ngắn (<52 tuần), ước lượng hiệp phương sai bị nhiễu.
  Giải pháp: Dùng WLS-structural (W đường chéo) cho chuỗi ngắn; co rút chỉ khi T > 3×n_series.

HẠN CHẾ 4: Conformal prediction giả định tính hoán đổi
→ Chuỗi thời gian vốn không hoán đổi được. Conformal prediction tiêu chuẩn có thể under-cover
  trong dịch chuyển phân phối. Giải pháp: Dùng conformal cuộn (hiệu chuẩn trên K quan sát gần nhất);
  hiệu chuẩn lại hàng tuần.

HẠN CHẾ 5: TFT phức tạp và dễ vỡ khi huấn luyện
→ Nhiều siêu tham số, nhạy cảm với learning rate, đòi hỏi xây batch cân bằng.
  Giải pháp: Dùng mặc định PyTorch Forecasting làm điểm khởi đầu; đóng băng kiến trúc
  cho Giai đoạn 1; chỉ điều chỉnh learning_rate, hidden_size, dropout.

HẠN CHẾ 6: Nghịch lý benchmark DLinear
→ Phát hiện nghiên cứu (Zeng et al., 2023): mô hình tuyến tính đơn giản đôi khi vượt Transformer.
  Không bao giờ giả định TFT/PatchTST vượt LightGBM hoặc thậm chí DLinear mà không đo trên dữ liệu thực.
  Giải pháp: Luôn chạy DLinear và LightGBM làm baseline trước khi đầu tư vào kiến trúc phức tạp.

HẠN CHẾ 7: Nhất quán phân cấp tại thời điểm suy luận
→ Phản hồi API thời gian thực không thể chạy hòa hợp MinT đầy đủ (đảo ma trận tốn kém).
  Giải pháp: Cho thời gian thực, trả về tổng hợp bottom-up (nhanh); áp dụng MinT chỉ trong
  batch hàng đêm cho hệ thống hoạch định cần phân cấp nhất quán.
```

---

## 8. Ghi Chú Bàn Giao cho Dr. Sentinel (R-γ)

```
─────────────────────────────────────────────────────────────────
TỪ:   R-β Dr. Praxis
ĐẾN:  R-γ Dr. Sentinel
VỀ:   B01 — Dự Báo & Chuỗi Thời Gian — tech-report.md hoàn tất
NGÀY: 2026-03-30
─────────────────────────────────────────────────────────────────

Tech stack và kiến trúc đã được định nghĩa. Các điểm chính cho đánh giá khả thi:

1. ĐIỂM NÓNG CHI PHÍ:
   - Suy luận GPU cho foundation model (Chronos, TimesFM ở quy mô) — đánh giá
     liệu độ chính xác zero-shot có xứng đáng chi phí GPU so với baseline thống kê
   - Thiết lập Feast feature store đòi công sức kỹ thuật cao — đánh giá giải pháp
     đơn giản hơn (custom Redis + PostgreSQL) có khả thi cho thị trường mục tiêu
   - Nền tảng đầy đủ (9 tháng, 4 kỹ sư) là đầu tư đáng kể — đánh giá ngưỡng ROI

2. CÂU HỎI MỞ CHO ĐÁNH GIÁ KHẢ THI:
   - Môi trường triển khai mục tiêu là gì? Đám mây quản lý (AWS/GCP) vs on-prem?
     Điều này thay đổi đáng kể chi phí hạ tầng.
   - Khách hàng mục tiêu thường có bao nhiêu thực thể (SKU/chuỗi)?
     1K so với 100K so với 10M thay đổi đáng kể các quyết định kiến trúc.
   - Suy luận thời gian thực (<100ms) có thực sự cần thiết, hay batch-then-cache đủ?

3. RỦI RO KIẾN TRÚC TÔI ĐÃ ĐÁNH CỜ:
   - Độ trễ phục vụ foundation model trên CPU là ràng buộc thực
   - Tính đúng thời điểm Feast bị đánh giá thấp công sức bởi hầu hết các đội
   - Walk-forward CV với khoảng trống đúng rất quan trọng — các đội thường cắt ngắn
     và có kết quả backtest tốt gây hiểu lầm

4. NHỮNG GÌ TÔI CHƯA ĐÁNH GIÁ (lĩnh vực của bạn):
   - Mức sẵn sàng thị trường cho tính năng foundation model
   - Sự sẵn lòng chi trả của khách hàng cho dự báo xác suất so với dự báo điểm
   - So sánh công nghệ cảnh quan cạnh tranh

─────────────────────────────────────────────────────────────────
TRẠNG THÁI: HOÀN TẤT — CẦN ĐÁNH GIÁ
TIẾP THEO:  R-γ (Dr. Sentinel) → feasibility-report.md
─────────────────────────────────────────────────────────────────
```
