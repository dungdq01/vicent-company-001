# Báo cáo Tổng hợp: Tabular ML & Predictive Analytics (B13)
## Bởi Ms. Scribe (R-σ) — Ngày: 2026-03-31

---

## Tóm tắt Điều hành

**Tabular ML & Predictive Analytics (B13)** là baseline có điểm khả thi **cao nhất (8.5/10)** trong toàn bộ 12 baseline của nền tảng MAESTRO. Đây là lĩnh vực trưởng thành nhất, đã được triển khai thực tế hơn một thập kỷ, và mang lại tỷ lệ **giá trị kinh doanh trên độ phức tạp triển khai** vượt trội so với mọi khả năng AI khác.

Các thuật toán cây tăng cường gradient (Gradient Boosted Decision Trees — GBDT) như XGBoost, LightGBM, CatBoost thống trị phân tích dữ liệu dạng bảng. Không yêu cầu GPU, hoạt động trên dữ liệu doanh nghiệp sẵn có (ERP, CRM, cơ sở dữ liệu giao dịch), và có hệ sinh thái AutoML (AutoGluon, FLAML) giúp giảm thời gian từ ý tưởng đến mô hình xuống còn vài giờ.

**Thị trường Việt Nam** ước tính TAM **$100-165 triệu/năm**, tập trung vào ngân hàng (chấm điểm tín dụng), bảo hiểm (định giá rủi ro), bán lẻ (dự báo rời bỏ khách hàng), sản xuất (bảo trì dự đoán), và viễn thông. Rào cản chính không phải công nghệ mà là **chất lượng dữ liệu**, **văn hóa Excel**, và **thiếu nhân lực ML** tại doanh nghiệp Việt.

**Khuyến nghị:** Triển khai B13 đầu tiên trong danh mục MAESTRO. Nó tạo doanh thu nhanh nhất, chứng minh giá trị nền tảng, và là mô-đun kết nối (connective tissue) cho các baseline khác (B01, B05, B06, B07, B12).

---

## Phần 1: Tổng hợp Nghiên cứu (R-α)

*Nguồn: Báo cáo Nghiên cứu của Dr. Archon (R-α)*

### 1.1 Phân loại lĩnh vực

**Dòng dõi:** Trí tuệ Nhân tạo → Học Máy → Học Có Giám sát trên Dữ liệu Có Cấu trúc

| Lĩnh vực con | Mô tả |
|---|---|
| Phân loại nhị phân | Dự đoán một trong hai kết quả (rời bỏ, gian lận, nhấp chuột) |
| Phân loại đa lớp | Dự đoán trong K>2 danh mục rời rạc |
| Hồi quy | Dự đoán mục tiêu liên tục (giá cả, nhu cầu, điểm rủi ro) |
| Phân tích sống còn | Mô hình hóa thời gian đến sự kiện với kiểm duyệt (Cox PH) |
| Xếp hạng học tập | Sắp xếp mục theo mức độ liên quan (LambdaMART) |
| Suy luận nhân quả trên dữ liệu bảng | Ước lượng tác động can thiệp từ dữ liệu quan sát (meta-learners, Double ML) |
| AutoML cho dữ liệu bảng | Tự động hóa pipeline: kỹ thuật đặc trưng, chọn mô hình, tối ưu siêu tham số |
| Học sâu cho dữ liệu bảng | Kiến trúc mạng nơ-ron cho dữ liệu bảng hỗn hợp |
| AI Giải thích được (XAI) | Phương pháp giải thích nội tại và hậu kỳ cho mô hình bảng |

**Liên kết với các baseline khác:**
- **B01 (Dự báo):** Kỹ thuật đặc trưng dạng bảng làm xương sống cho dự báo chuỗi thời gian
- **B05 (Đề xuất):** Dự đoán tỷ lệ nhấp (CTR) về bản chất là phân loại dữ liệu bảng
- **B06 (Tối ưu hóa):** Mô hình dự đoán-rồi-tối ưu dùng Tabular ML làm tầng dự đoán
- **B07 (Phát hiện Bất thường):** Chấm điểm bất thường có giám sát dùng phân loại dạng bảng
- **B12 (Truy xuất Thông tin):** Feature Store phục vụ cả truy xuất và Tabular ML

### 1.2 Các khái niệm cốt lõi (≥10)

1. **Kỹ thuật Đặc trưng (Feature Engineering):** Biến đổi cột dữ liệu thô thành biểu diễn cải thiện hiệu suất mô hình — mã hóa biến phân loại (one-hot, target encoding), biến đổi số (log, binning), tương tác đặc trưng ($x_i \times x_j$), thống kê tổng hợp (group-by), và đặc trưng theo lĩnh vực chuyên môn.

2. **Xử lý Giá trị Thiếu (Missing Value Handling):** XGBoost/LightGBM xử lý native bằng cách học hướng chia tối ưu cho giá trị thiếu. Các phương pháp khác: imputation trung bình/trung vị, KNN, MICE, hoặc cờ chỉ báo thiếu.

3. **Kỹ thuật Mất Cân Bằng Lớp (Class Imbalance):** Trọng số lớp (`scale_pos_weight`), SMOTE, Focal Loss ($-(1-p_t)^\gamma \log(p_t)$), điều chỉnh ngưỡng, và lấy mẫu thiếu kết hợp ensemble.

4. **Chiến lược Kiểm chứng Chéo (Cross-Validation):** Stratified K-Fold, Group K-Fold (tránh rò rỉ từ nhóm tương quan), chia theo thời gian (temporal split), Nested CV (vòng ngoài đánh giá tổng quát hóa, vòng trong điều chỉnh siêu tham số).

5. **Cây Tăng cường Gradient (GBDT):** Mô hình cộng dồn trong không gian hàm — mỗi cây khớp gradient âm của hàm mất mát. Xử lý đặc trưng hỗn hợp, bền vững với đặc trưng không liên quan, suy luận nhanh $O(M \cdot D)$.

6. **AutoML cho Dữ liệu Bảng:** Tự động hóa tiền xử lý, chọn mô hình, và HPO. AutoGluon dùng stacking đa tầng; FLAML dùng tìm kiếm tiết kiệm chi phí. Đạt hiệu suất gần chuyên gia với cấu hình tối thiểu.

7. **Giải thích Mô hình (Model Explainability):** Phương pháp toàn cục (feature importance, SHAP summary, PDP) và cục bộ (SHAP waterfall, LIME, giải thích phản thực). Bắt buộc trong ngành tài chính, y tế.

8. **Hiệu chuẩn Mô hình (Model Calibration):** Đảm bảo xác suất dự đoán phản ánh đúng xác suất thực. Platt scaling, hồi quy isotonic, ECE. Quan trọng khi xác suất lái quyết định hạ nguồn (định giá bảo hiểm, phân tầng rủi ro y tế).

9. **Kho Đặc trưng (Feature Store):** Tầng hạ tầng quản lý vòng đời đặc trưng: tính toán, lưu trữ, phiên bản, phục vụ. Kho offline (data warehouse) cho huấn luyện, kho online (Redis) cho suy luận thời gian thực. Giải quyết vấn đề lệch huấn luyện-phục vụ.

10. **Phòng ngừa Rò rỉ Dữ liệu (Data Leakage Prevention):** Rò rỉ mục tiêu, rò rỉ thời gian, nhiễm train-test, rò rỉ nhóm. Phòng ngừa bằng pipeline đóng gói tiền xử lý trong fold CV, sắp xếp thời gian, chia tách theo nhóm.

11. **Học sâu cho Dữ liệu Bảng (Tabular Deep Learning):** TabNet (chọn đặc trưng dựa trên attention), FT-Transformer (mỗi đặc trưng là token), TabPFN (suy luận trong ngữ cảnh, không cần huấn luyện), NODE (cây quyết định khả vi). Chỉ nên dùng khi dữ liệu >100K hàng hoặc đầu vào đa phương thức.

12. **Nhúng Thực thể (Entity Embeddings):** Ánh xạ biến phân loại thành vector dày đặc qua tầng nhúng học được. Chiều $d_j = \min(50, \lceil c_j/2 \rceil)$. Nhúng tiền huấn luyện có thể trích xuất làm đặc trưng cho GBDT.

### 1.3 Thuật toán chính (≥10)

| # | Thuật toán | Tác giả / Năm | Đặc điểm nổi bật |
|---|---|---|---|
| 1 | **XGBoost** | Chen & Guestrin, 2016 | Xấp xỉ Taylor bậc 2, weighted quantile sketch, xử lý thưa, GPU training |
| 2 | **LightGBM** | Ke et al. (Microsoft), 2017 | GOSS + EFB, phát triển theo lá, histogram splitting, nhanh gấp 2-10x XGBoost |
| 3 | **CatBoost** | Prokhorova et al. (Yandex), 2018 | Thống kê mục tiêu có thứ tự, cây đối xứng (oblivious trees), xử lý phân loại native |
| 4 | **Random Forest** | Breiman, 2001 | Bagging + lấy mẫu đặc trưng ngẫu nhiên, song song hóa, OOB error, bền vững |
| 5 | **Hồi quy Logistic / Tuyến tính** | Baseline | Nhanh, giải thích được, hiệu chuẩn tốt, làm sàn hiệu suất và meta-learner |
| 6 | **TabNet** | Arik & Pfister (Google), 2021 | Chọn đặc trưng dựa trên attention, tiền huấn luyện tự giám sát |
| 7 | **FT-Transformer** | Gorishniy et al., 2021 | Token hóa đặc trưng + Transformer encoder, cạnh tranh với GBDT trên nhiều benchmark |
| 8 | **TabPFN** | Hollmann et al., 2023 | Meta-training trên dữ liệu tổng hợp, suy luận một lần chuyển tiếp, xuất sắc trên dữ liệu nhỏ (<10K) |
| 9 | **AutoGluon** | Erickson et al., 2020 | Stacking đa tầng, đa mô hình, API một dòng, top AutoML benchmark |
| 10 | **H2O AutoML** | H2O.ai | Lưới mô hình + HPO ngẫu nhiên + ensemble tự động, huấn luyện phân tán |
| 11 | **FLAML** | Chi Wang et al. (Microsoft), 2021 | Tối ưu tiết kiệm chi phí, đạt hiệu suất cạnh tranh trong vài phút |
| 12 | **Stacking / Blending** | Ensemble meta | Kết hợp mô hình đa dạng qua meta-learner trên dự đoán out-of-fold |
| 13 | **NODE** | Neural Oblivious Decision Ensembles | Cây quyết định oblivious khả vi, huấn luyện end-to-end bằng backpropagation |

### 1.4 Bài báo quan trọng

| # | Bài báo | Hội nghị | Đóng góp chính |
|---|---|---|---|
| 1 | Random Forests (Breiman, 2001) | Machine Learning | Thuật toán Random Forest, OOB error, đo lường tầm quan trọng biến |
| 2 | XGBoost (Chen & Guestrin, 2016) | KDD 2016 | GBDT mở rộng được với tối ưu bậc 2, 25K+ trích dẫn |
| 3 | LightGBM (Ke et al., 2017) | NeurIPS 2017 | GOSS + EFB, tăng tốc 2-10x so với XGBoost |
| 4 | CatBoost (Prokhorova et al., 2018) | NeurIPS 2018 | Thống kê mục tiêu có thứ tự, xử lý phân loại không rò rỉ |
| 5 | SHAP (Lundberg & Lee, 2017) | NeurIPS 2017 | Thống nhất 6 phương pháp quy kết, TreeSHAP thời gian đa thức |
| 6 | TabNet (Arik & Pfister, 2021) | AAAI 2021 | Mạng nơ-ron cạnh tranh GBDT trên dữ liệu bảng |
| 7 | Tại sao GBDT vẫn hơn Deep Learning? (Grinsztajn et al., 2022) | NeurIPS 2022 | Benchmark 45 tập dữ liệu, GBDT vẫn vượt trội trên dữ liệu bảng điển hình |
| 8 | FT-Transformer (Gorishniy et al., 2021) | NeurIPS 2021 | Transformer trên token đặc trưng, kiến trúc neural hàng đầu cho dữ liệu bảng |
| 9 | TabPFN (Hollmann et al., 2023) | ICLR 2023 | Suy luận trong ngữ cảnh cho phân loại bảng, không cần huấn luyện |
| 10 | AutoGluon-Tabular (Erickson et al., 2020) | ICML 2020 Workshop | Stacking đa tầng đa mô hình, dân chủ hóa ML bảng chất lượng cao |

### 1.5 Dòng thời gian phát triển

| Giai đoạn | Năm | Cột mốc |
|---|---|---|
| Kỷ nguyên Tuyến tính | 1805-1958 | Hồi quy bình phương nhỏ nhất (Legendre/Gauss), Hồi quy logistic (Cox) |
| Cây Quyết định | 1984 | CART (Breiman et al.) — phân vùng đệ quy |
| Ensemble xuất hiện | 1995-1996 | AdaBoost (Freund & Schapire), Bagging (Breiman) |
| Random Forest & Gradient Boosting | 2001 | RF (Breiman), GBM (Friedman) — thống trị một thập kỷ |
| XGBoost thống trị | 2014-2016 | Thống trị Kaggle 2015-2019, triển khai công nghiệp quy mô lớn |
| Đa dạng hóa GBDT | 2017-2018 | LightGBM (nhanh hơn), CatBoost (phân loại tốt hơn), SHAP (giải thích) |
| AutoML & Deep Tabular | 2020-2021 | AutoGluon, FLAML, TabNet, FT-Transformer |
| Benchmark & Meta-Learning | 2022-2023 | Xác nhận GBDT vượt trội, TabPFN (ICL cho dữ liệu nhỏ) |
| Mô hình Nền tảng & LLM | 2024-2026 | Tabular foundation models, LLM sinh đặc trưng, kiến trúc lai GBDT + LLM |

---

## Phần 2: Kiến trúc Kỹ thuật (R-β)

*Nguồn: Báo cáo Kỹ thuật của Dr. Praxis (R-β)*

### 2.1 Kiến trúc tham chiếu

**Ba cấp độ kiến trúc:**

**Cấp 1 — Đơn giản (Mô hình đơn + Script batch):**
```
CSV/DB → train.py (XGBoost) → model.pkl → predict.py → CSV/DB output
```
Phù hợp khởi đầu nhanh, POC, đội ngũ nhỏ.

**Cấp 2 — Trung cấp (MLOps Pipeline):**
```
PostgreSQL → Feature Engineering → Feature Store (Feast)
  → Training Pipeline (Prefect) → Experiment Tracking (MLflow) → Model Registry
  → FastAPI Endpoint / Batch Scorer
  → Monitoring (Evidently) → Drift detected → Retrain
```
Phù hợp đội ngũ ML chuyên nghiệp, sản phẩm có SLA.

**Cấp 3 — Nâng cao (Nền tảng Dự đoán Doanh nghiệp):**
```
ERP/CRM → Kafka/CDC → Feature Engine (Spark + Feast)
  → AutoGluon (đa mô hình) + XGB/LGBM/CatBoost thủ công
  → Model Registry (MLflow + Cổng phê duyệt)
  → Real-time API (Seldon/BentoML) + Batch Pipeline (Spark)
  → Load Balancer (Canary/Shadow)
  → Monitoring (Evidently + whylogs) + Explainability (SHAP Server)
  → Dashboard (Streamlit/Grafana) + Auto-Retrain Trigger
```
Đa mô hình, đa khách thuê, AutoML, phục vụ thời gian thực + batch, quản trị mô hình.

### 2.2 Công nghệ đề xuất

| Tầng | Công cụ | Vai trò | Giấy phép |
|---|---|---|---|
| Lưu trữ Dữ liệu | PostgreSQL / BigQuery / Delta Lake | Giao dịch / Phân tích / Lakehouse | Mã nguồn mở / Thương mại |
| Kho Đặc trưng | Feast / Hopsworks | Phục vụ đặc trưng (online + offline) | Apache 2.0 / Thương mại |
| Huấn luyện | XGBoost, LightGBM, CatBoost, AutoGluon, scikit-learn | GBDT, AutoML, tiền xử lý | Apache 2.0 / MIT / BSD |
| Theo dõi Thí nghiệm | MLflow / Weights & Biases | Metrics, params, artifacts | Apache 2.0 / Thương mại |
| Phục vụ | FastAPI / BentoML / Seldon Core | REST API / K8s serving | MIT / Apache 2.0 |
| Giám sát | Evidently / whylogs | Drift dữ liệu/mô hình | Apache 2.0 |
| Giải thích | SHAP / LIME | Giá trị Shapley / giải thích cục bộ | MIT / BSD |
| Điều phối | Prefect / Airflow | Workflow orchestration | Apache 2.0 |

**Nguồn dữ liệu đặc thù Việt Nam:**

| Nguồn | Loại dữ liệu | Ứng dụng |
|---|---|---|
| MISA (phần mềm kế toán) | Doanh thu, chi phí, hóa đơn | Chấm điểm tín dụng SME |
| CIC (Trung tâm Thông tin Tín dụng) | Lịch sử tín dụng, dư nợ | Mô hình rủi ro cho vay |
| GSO (Tổng cục Thống kê) | Chỉ số vĩ mô theo tỉnh | Nhu cầu vùng, đặc trưng kinh tế |
| VNDirect / SSI | Dữ liệu thị trường chứng khoán | Mô hình rủi ro tài chính |

**Cài đặt khởi đầu:**
```bash
# ML cốt lõi
pip install xgboost lightgbm catboost scikit-learn pandas numpy
# Theo dõi + phục vụ
pip install mlflow fastapi uvicorn
# Giải thích + giám sát
pip install shap lime evidently
# Kho đặc trưng + AutoML (tùy chọn)
pip install feast autogluon.tabular
```

### 2.3 Pipeline xử lý

**Pipeline 6 giai đoạn:**

| Giai đoạn | Mô tả | Công cụ chính |
|---|---|---|
| 1. Trích xuất & Nhập liệu | Đọc từ DB/CSV, kết nối nguồn dữ liệu | pandas, SQLAlchemy |
| 2. Kiểm tra & EDA | Kiểm tra chất lượng, Great Expectations | great_expectations |
| 3. Kỹ thuật Đặc trưng | Tỷ lệ, tổng hợp, tương tác, log, binning | pandas, numpy, Feast |
| 4. Huấn luyện + Điều chỉnh | Stratified K-Fold CV, Optuna HPO | XGBoost/LightGBM, Optuna |
| 5. Triển khai & Phục vụ | REST API thời gian thực + batch scoring | FastAPI, MLflow, BentoML |
| 6. Giám sát & Tái huấn luyện | Drift detection, cảnh báo tự động | Evidently, Prefect |

**Tích hợp hệ thống doanh nghiệp:**
- **BI Tools (Power BI / Metabase):** Ghi dự đoán vào DB, truy vấn từ dashboard
- **CRM (HubSpot / Salesforce):** Đẩy điểm rủi ro rời bỏ vào CRM qua API
- **ERP (MISA / SAP):** CDC/API trích xuất hóa đơn, lịch sử thanh toán → Feature Store → Scoring
- **Core Banking:** Middleware ngồi giữa hệ thống ngân hàng lõi và API chấm điểm, áp dụng quy tắc kinh doanh lên điểm ML

### 2.4 Ví dụ minh họa

**Ví dụ 1: Chấm điểm Tín dụng với XGBoost (Người mới, 45 phút)**

Luồng: Đọc CSV → Xử lý giá trị thiếu → Chia train/test (stratified) → Huấn luyện XGBoost (`n_estimators=500`, `max_depth=5`, `scale_pos_weight` tự động) → Đánh giá AUC → Giải thích SHAP → Lưu model → Batch scoring. Kết quả mong đợi: AUC ~0.86, đặc trưng hàng đầu: `utilization`, `num_30_59_late`, `age`.

**Ví dụ 2: Nền tảng Dự đoán Rời bỏ Thời gian thực (Nâng cao, 4 giờ)**

Cấu trúc: Feature Store (Feast) → Training với MLflow + Optuna HPO → Real-time Serving (FastAPI + SHAP) → Docker Compose (MLflow + API + Monitoring) → Drift detection tự động (Evidently) → Trigger tái huấn luyện. Kết quả: p99 latency <15ms, kiểm tra drift hàng tuần, giải thích SHAP trên mỗi dự đoán.

**Hiệu năng tham khảo:**

| Kích thước | XGBoost | LightGBM | CatBoost | AutoGluon |
|---|---|---|---|---|
| 100K hàng, 50 đặc trưng | 15 giây | 8 giây | 45 giây | 20 phút |
| 1 triệu hàng, 50 đặc trưng | 2 phút | 1 phút | 6 phút | 3 giờ |
| 10 triệu hàng, 100 đặc trưng | 25 phút | 12 phút | 55 phút | 12+ giờ |

| Phương pháp phục vụ | Độ trễ p50 | Độ trễ p99 | Thông lượng |
|---|---|---|---|
| GBDT đơn (in-process) | 0.05ms | 0.2ms | 50,000 req/s |
| FastAPI + joblib | 1ms | 5ms | 3,000 req/s |
| FastAPI + SHAP | 3ms | 12ms | 800 req/s |
| BentoML (batch) | 0.5ms | 3ms | 10,000 req/s |

---

## Phần 3: Đánh giá Khả thi (R-γ)

*Nguồn: Báo cáo Khả thi của Dr. Sentinel (R-γ)*

### 3.1 Kết luận (8.5/10 — cao nhất portfolio!)

**Phán quyết: ĐI CÓ ĐIỀU KIỆN (CONDITIONAL GO)**

Tabular ML là khả năng trưởng thành nhất, đã được thử nghiệm thực chiến, và sẵn sàng sản xuất nhất trong tất cả 12 baseline MAESTRO. Từ "có điều kiện" chỉ xuất phát từ thách thức chất lượng dữ liệu doanh nghiệp Việt Nam và quản lý thay đổi tổ chức để vượt qua văn hóa ra quyết định bằng Excel. Bản thân công nghệ gần như không có rủi ro.

**Điều kiện để ĐI:**
1. Đánh giá và khắc phục chất lượng dữ liệu phải đi trước mọi nỗ lực mô hình hóa
2. Công cụ giải thích (SHAP, permutation importance) phải được nhúng từ ngày đầu — cơ quan quản lý ngân hàng Việt Nam yêu cầu
3. Định vị như bổ sung thực tế, ROI đã chứng minh cho cơn sốt GenAI — không phải đối thủ

### 3.2 Bảng điểm khả thi

| Chiều đánh giá | Điểm | Lý giải |
|---|---|---|
| **Khả thi Kỹ thuật** | 9/10 | XGBoost/LightGBM là framework ML trưởng thành nhất. 10+ năm triển khai sản xuất. Không cần GPU. Hệ sinh thái scikit-learn vững chắc. AutoML giảm nỗ lực kỹ thuật gần bằng không. |
| **Nhu cầu Thị trường** | 8/10 | Mọi doanh nghiệp có cơ sở dữ liệu đều là khách hàng tiềm năng. Ngân hàng và bảo hiểm Việt Nam đang tích cực tìm kiếm khả năng này. |
| **Sẵn có Dữ liệu** | 8/10 | Dữ liệu bảng tồn tại trong mọi ERP, CRM. Thách thức tại Việt Nam là chất lượng, không phải sự tồn tại — thiếu giá trị, mã hóa không nhất quán, hệ thống phân mảnh. |
| **Hồ sơ Rủi ro** | 7/10 | Chế độ thất bại được hiểu rõ (overfitting, rò rỉ dữ liệu, concept drift). Rủi ro chính là tổ chức: quản trị dữ liệu kém, kháng cự quyết định dựa trên mô hình. |
| **Tổng thể** | **8.5/10** | Baseline có điểm cao nhất trong portfolio MAESTRO. Đây không phải AI tham vọng — mà là AI đã chứng minh, triển khai được, và tạo doanh thu ngay hôm nay. |

### 3.3 Cảnh quan cạnh tranh

**Đối thủ toàn cầu:**

| Đối thủ | Định vị | Mức đe dọa |
|---|---|---|
| DataRobot | AutoML doanh nghiệp end-to-end, mạnh ngân hàng/bảo hiểm | CAO — giá premium tạo khoảng trống phía dưới |
| H2O.ai | AutoML lõi mở (H2O-3, Driverless AI), cộng đồng OSS mạnh | CAO — bậc miễn phí cạnh tranh giá |
| Google Vertex AI AutoML Tables | AutoML cloud-native, tích hợp BigQuery | TRUNG BÌNH — khóa cloud hạn chế áp dụng tại VN |
| AWS SageMaker Autopilot | Hệ sinh thái AWS, rộng nhưng nông | TRUNG BÌNH — cùng lo ngại khóa cloud |
| Azure AutoML | Hệ sinh thái Microsoft, pipeline Excel-to-ML mạnh | TRUNG BÌNH — quan hệ FPT có thể khuếch đại |
| Dataiku | Nền tảng khoa học dữ liệu hợp tác, ML trực quan | TRUNG BÌNH — mạnh EU, hạn chế tại VN |

**Thị trường Việt Nam:**

| Đối thủ | Định vị | Mức đe dọa |
|---|---|---|
| FPT.AI | Nền tảng AI rộng, tập trung chatbot nhưng mở rộng sang phân tích dự đoán | TRUNG BÌNH — nhận diện thương hiệu nhưng chiều sâu ML nông |
| Công ty tư vấn nội địa | Dự án ML tùy chỉnh (credit scoring, churn). Đơn lẻ, không mở rộng được | THẤP — không có platform play |
| Đội nội bộ (Vietcombank, VPBank) | Đội data science nội bộ xây mô hình tùy chỉnh | THẤP — hạn chế tài nguyên, lặp chậm |

**Cơ hội khác biệt hóa:** Thị trường Việt Nam có khoảng trống rõ ràng: nền tảng toàn cầu đắt và khóa cloud; đối thủ nội địa thiếu chiều sâu. Nền tảng cung cấp Tabular ML cấp sản xuất với kết nối dữ liệu Việt Nam (SAP Vietnam, Bravo, MISA), giải thích tích hợp cho tuân thủ quy định, và tùy chọn triển khai on-premise chiếm vị trí phòng thủ được.

### 3.4 Rủi ro chính

| # | Rủi ro | Xác suất | Tác động | Giảm thiểu |
|---|---|---|---|---|
| R1 | Chất lượng dữ liệu doanh nghiệp VN — thiếu giá trị, mã hóa không nhất quán, văn hóa Excel-là-database | CAO | CAO | Giai đoạn kiểm tra dữ liệu bắt buộc. Chấm điểm chất lượng dữ liệu tự động. Từ chối mô hình hóa trên dữ liệu dưới ngưỡng. |
| R2 | Quy định giải thích mô hình — NHNN ngày càng yêu cầu giải thích được cho quyết định tín dụng | TRUNG BÌNH | CAO | Nhúng SHAP, PDP, feature importance. Dùng mô hình giải thích nội tại (EBM, logistic regression) cho trường hợp quy định. |
| R3 | Khan hiếm nhân tài ML tại Việt Nam | CAO | TRUNG BÌNH | AutoML-first. Đầu tư chương trình đào tạo. Hợp tác đại học (HUST, VNU-HCM). |
| R4 | Kháng cự văn hóa Excel — người ra quyết định tin bảng tính hơn đầu ra mô hình | CAO | TRUNG BÌNH | Gửi dự đoán VÀO Excel/Google Sheets. Xây add-in Excel. Định khung ML là "công thức tốt hơn". |
| R5 | Overfitting trên tập dữ liệu nhỏ — SME Việt thường có 100-10.000 hàng | TRUNG BÌNH | TRUNG BÌNH | Mặc định mô hình đơn giản cho dữ liệu nhỏ. Chọn độ phức tạp tự động theo kích thước. Cross-validation bắt buộc. |
| R6 | Concept drift trong sản xuất — mô hình xuống cấp khi phân phối dữ liệu thay đổi | TRUNG BÌNH | TRUNG BÌNH | Phát hiện drift tích hợp (PSI, KS-test). Trigger tái huấn luyện tự động. Dashboard giám sát. |
| R7 | Cơn sốt GenAI che khuất Tabular ML — bên liên quan muốn LLM, không phải gradient boosting "nhàm chán" | TRUNG BÌNH | THẤP | Định vị Tabular ML là động cơ doanh thu tài trợ thí nghiệm GenAI. Dẫn đầu bằng case study ROI. |

### 3.5 Thị trường Việt Nam

**Quy mô thị trường ước tính (TAM hàng năm):**

| Phân khúc | TAM ước tính | Ứng dụng chính |
|---|---|---|
| Ngân hàng & Tài chính | $40-60 triệu | Chấm điểm tín dụng, phát hiện gian lận, AML, ưu tiên thu hồi |
| Bảo hiểm | $15-25 triệu | Định giá rủi ro, dự đoán yêu cầu bồi thường, dự đoán mất hợp đồng |
| Bán lẻ & Thương mại điện tử | $20-35 triệu | Dự đoán rời bỏ, giá trị khách hàng trọn đời, dự báo nhu cầu |
| Sản xuất | $15-25 triệu | Kiểm soát chất lượng, bảo trì dự đoán, tối ưu năng suất |
| Viễn thông | $10-20 triệu | Rời bỏ, quy hoạch dung lượng mạng, nhắm mục tiêu upsell |
| **Tổng cộng** | **$100-165 triệu** | |

**Đánh giá thời điểm: HOÀN HẢO.** Ba yếu tố hội tụ:
1. **Trưởng thành công nghệ:** XGBoost/LightGBM đã chứng minh sản xuất 10+ năm. AutoML loại bỏ nhu cầu chuyên môn cấp tiến sĩ. Công cụ miễn phí và mã nguồn mở.
2. **Sẵn sàng doanh nghiệp:** Ngân hàng và bảo hiểm Việt Nam đã số hóa đủ dữ liệu. VPBank, Techcombank, MoMo đang tích cực xây mô hình chấm điểm tín dụng.
3. **Đẩy mạnh quy định:** NHNN đang hiện đại hóa yêu cầu quản lý rủi ro, tạo nhu cầu cho ra quyết định dựa trên mô hình trong cho vay.

---

## Phần 4: Đóng góp từ Chuyên gia Thực hành

### 4.1 Data Engineering & Feature Store

**Vai trò trong Tabular ML:** Xây dựng và vận hành hạ tầng dữ liệu — từ trích xuất (CDC/API từ MISA, core banking) đến Feature Store (Feast) cho phục vụ đặc trưng online/offline.

**Khuyến nghị chính:**
- Triển khai Feature Store (Feast) từ giai đoạn trung cấp để tái sử dụng đặc trưng giữa các mô hình
- Xây pipeline kiểm tra chất lượng dữ liệu bắt buộc (Great Expectations) trước mọi huấn luyện
- Thiết kế kết nối dữ liệu đặc thù Việt Nam: MISA (kế toán), CIC (tín dụng), GSO (thống kê vĩ mô)
- Giải quyết vấn đề lệch huấn luyện-phục vụ bằng cùng mã biến đổi cho cả hai môi trường

### 4.2 ML Engineering & AutoML

**Vai trò:** Thiết kế, huấn luyện, điều chỉnh, và vận hành mô hình ML trong sản xuất.

**Khuyến nghị chính:**
- Mặc định XGBoost/LightGBM cho sản xuất; CatBoost khi nhiều biến phân loại
- AutoGluon cho benchmark và trường hợp cần độ chính xác tối đa không quan tâm thời gian
- FLAML cho tìm kiếm nhanh khi ngân sách tính toán hạn chế
- Optuna cho HPO thủ công (TPE hiệu quả trên không gian siêu tham số phân cấp)
- Luôn bắt đầu với baseline tuyến tính (logistic/linear regression) để thiết lập sàn hiệu suất
- Không đuổi theo deep tabular (TabNet, FT-Transformer) cho sản xuất trừ khi >1M hàng + GPU

### 4.3 Data Analysis & EDA

**Vai trò:** Khám phá dữ liệu, phát hiện vấn đề chất lượng, thiết kế đặc trưng theo lĩnh vực.

**Khuyến nghị chính:**
- Kiểm tra phân phối mọi đặc trưng, phát hiện giá trị thiếu ngụy trang (0, -1, chuỗi rỗng — phổ biến tại VN)
- Thiết kế đặc trưng tỷ lệ (debt_to_income, credit_utilization), tổng hợp (trung bình theo nhóm), tương tác
- Dùng SHAP summary plot và PDP cho hiểu biết toàn cục; SHAP waterfall cho giải thích cục bộ
- Xây reliability diagram để đánh giá hiệu chuẩn mô hình
- Đặc biệt chú ý class imbalance: fraud 0.1%, default 2-5% — dùng focal loss hoặc class weights

### 4.4 Database & Hạ tầng dữ liệu

**Vai trò:** Lưu trữ, truy xuất, và quản lý dữ liệu hỗ trợ pipeline ML.

**Khuyến nghị chính:**
- PostgreSQL cho dữ liệu giao dịch và dự đoán (ghi scores lại DB cho BI consumption)
- Delta Lake cho lakehouse storage khi quy mô lớn
- Redis/SQLite cho Feature Store online (<10ms latency)
- Thiết kế schema cho dự đoán: bảng scores liên kết với bảng khách hàng cho dashboard BI
- Chi phí cloud: từ $60/tháng (startup) đến $500/tháng (enterprise K8s), không cần GPU

### 4.5 Backend & Model Serving

**Vai trò:** Triển khai mô hình ML như dịch vụ API, tích hợp với hệ thống doanh nghiệp.

**Khuyến nghị chính:**
- FastAPI + joblib cho phục vụ nhẹ (1ms p50, 3K req/s)
- BentoML cho batched serving hiệu suất cao (0.5ms p50, 10K req/s)
- Seldon Core cho K8s-native với canary/shadow deployment
- Middleware pattern cho tích hợp core banking: ML scoring + business rules
- Luôn bao gồm SHAP explanation trong response API (bắt buộc cho ngân hàng)
- Docker Compose cho triển khai: MLflow + API + Monitoring

### 4.6 Frontend & Dashboard

**Vai trò:** Trực quan hóa dự đoán, giải thích, và giám sát cho người dùng kinh doanh.

**Khuyến nghị chính:**
- Streamlit / Grafana cho dashboard giám sát drift và hiệu suất mô hình
- Power BI / Metabase kết nối DB chứa scores cho báo cáo kinh doanh
- Hiển thị SHAP waterfall cho từng dự đoán — người dùng kinh doanh cần hiểu TẠI SAO
- Tích hợp Excel: xuất kết quả dự đoán vào Excel/Google Sheets (giải quyết kháng cự văn hóa Excel)
- Dashboard drift: hiển thị PSI, tỷ lệ cột bị drift, trigger cảnh báo tái huấn luyện

### 4.7 Tài chính (Credit Scoring)

**Ứng dụng hàng đầu cho B13 tại Việt Nam.**

**Pipeline chấm điểm tín dụng:**
1. Trích xuất từ core banking + CIC: lịch sử tín dụng, dư nợ, thu nhập, hồ sơ thanh toán
2. Kỹ thuật đặc trưng: debt_to_income, credit_utilization, payment_to_income, số lần trễ hạn
3. XGBoost với `scale_pos_weight` cho class imbalance (default rate 2-5%)
4. SHAP bắt buộc — Thông tư 13/2018/TT-NHNN yêu cầu giải thích quyết định tín dụng
5. Quyết định 3 cấp: TỰ ĐỘNG DUYỆT (<0.3), XEM XÉT THỦ CÔNG (0.3-0.6), TỰ ĐỘNG TỪ CHỐI (>0.7)

**Mục tiêu:** Ngân hàng tầng 2 (TPBank, OCB, SHB) thiếu đội data science nội bộ. ROI: tiết kiệm hàng triệu đô la tổn thất vỡ nợ hàng năm từ mô hình xây trong 2 tuần.

### 4.8 Bảo hiểm (Risk Scoring)

**Ứng dụng chính:**
- **Định giá rủi ro:** Dự đoán xác suất yêu cầu bồi thường, tần suất, và mức độ nghiêm trọng
- **Dự đoán mất hợp đồng (Lapse prediction):** Phân loại khách hàng có nguy cơ không gia hạn
- **Phát hiện gian lận bảo hiểm:** Phân loại nhị phân với class imbalance cực độ

**Yêu cầu đặc biệt:**
- Hiệu chuẩn mô hình CỰC KỲ quan trọng — xác suất dự đoán trực tiếp thành phí bảo hiểm
- Platt scaling hoặc isotonic regression bắt buộc sau huấn luyện GBDT
- Survival analysis (Cox PH trên đặc trưng bảng) cho mô hình hóa thời gian đến sự kiện

---

## Phần 5: Khuyến nghị Tổng hợp

### Chiến lược

1. **Triển khai B13 đầu tiên trong portfolio MAESTRO.** Con đường ngắn nhất đến sản xuất và ROI đo lường được. Mọi baseline khác hưởng lợi khi Tabular ML hoạt động trước.
2. **Định vị "AI hoạt động hôm nay" so với "AI có thể hoạt động ngày nào đó."** Đặt cạnh cơn sốt GenAI — đã chứng minh, triển khai được, tự trả chi phí trong 3-6 tháng.
3. **Gói kèm công cụ chất lượng dữ liệu.** Thị trường Việt Nam cần khắc phục dữ liệu hơn cần thuật toán tốt hơn. Ai giải quyết chất lượng dữ liệu sẽ thắng thị trường Tabular ML.

### Kỹ thuật

1. **XGBoost/LightGBM là động cơ mặc định.** Không đuổi theo deep tabular cho sản xuất.
2. **Tầng AutoML (FLAML hoặc AutoGluon) cho người dùng không chuyên.** Giảm thời gian từ tuần xuống giờ.
3. **Tích hợp SHAP bắt buộc.** Mọi dự đoán phải đi kèm giải thích. Không thương lượng cho ngành quy định.
4. **Feature Store (Feast) cho tái sử dụng đặc trưng.** ROI của Tabular ML nhân lên khi đặc trưng được chia sẻ giữa các use case.
5. **Phát hiện drift từ ngày đầu.** Giám sát PSI, cảnh báo tự động, trigger tái huấn luyện.

### Tiếp cận Thị trường

1. **Bắt đầu với chấm điểm tín dụng ngân hàng.** Sẵn lòng chi trả cao nhất, ROI rõ nhất, thuận lợi quy định. Nhắm ngân hàng tầng 2 (TPBank, OCB, SHB).
2. **Xây 3 case study tham chiếu trong 6 tháng.** Chấm điểm tín dụng, dự đoán rời bỏ, dự báo nhu cầu. Doanh nghiệp Việt mua theo tham chiếu đồng nghiệp.
3. **Cung cấp "đánh giá sẵn sàng dữ liệu" miễn phí.** Kiểm tra dữ liệu, chấm điểm sẵn sàng ML, đề xuất dự án mô hình hóa.
4. **Định giá theo kết quả, không theo giấy phép.** Doanh nghiệp Việt kháng cự giá SaaS. Giá dựa trên hiệu suất (tỷ lệ vỡ nợ thu hồi, giảm rời bỏ).

### Tích hợp với các Baseline khác

Tabular ML là mô tô kết nối của nền tảng MAESTRO:
- **B01 (Dự báo):** Kỹ thuật đặc trưng bảng nuôi mô hình chuỗi thời gian
- **B05 (Đề xuất):** Dự đoán CTR là bài toán phân loại bảng
- **B06 (Tối ưu hóa):** Dự đoán-rồi-tối ưu cần Tabular ML làm tầng dự đoán
- **B07 (Phát hiện Bất thường):** Chấm điểm bất thường có giám sát dùng phân loại bảng
- **B12 (Truy xuất Thông tin):** Feature Store phục vụ cả truy xuất và Tabular ML

---

## Phần 6: Quality Checklist

| # | Tiêu chí | Trạng thái |
|---|---|---|
| 1 | Phân loại lĩnh vực đầy đủ (taxonomy, sub-fields, liên kết baseline) | ✅ Hoàn thành |
| 2 | ≥10 khái niệm cốt lõi được mô tả chi tiết | ✅ 12 khái niệm |
| 3 | ≥10 thuật toán chính với tác giả, năm, đặc điểm | ✅ 13 thuật toán |
| 4 | ≥8 bài báo quan trọng với trích dẫn và đóng góp | ✅ 10 bài báo |
| 5 | Dòng thời gian phát triển từ nền tảng đến hiện tại | ✅ 1805-2026 |
| 6 | Kiến trúc tham chiếu 3 cấp độ | ✅ Đơn giản / Trung cấp / Nâng cao |
| 7 | Công nghệ đề xuất đầy đủ theo tầng | ✅ 8 tầng, bao gồm nguồn dữ liệu VN |
| 8 | Pipeline xử lý 6 giai đoạn | ✅ Trích xuất → Giám sát |
| 9 | Ví dụ minh họa thực tế | ✅ 2 ví dụ (người mới + nâng cao) |
| 10 | Điểm khả thi với lý giải | ✅ 8.5/10, bảng 4 chiều |
| 11 | Cảnh quan cạnh tranh toàn cầu + Việt Nam | ✅ 6 toàn cầu + 3 Việt Nam |
| 12 | Sổ đăng ký rủi ro đầy đủ | ✅ 7 rủi ro với xác suất, tác động, giảm thiểu |
| 13 | Phân tích thị trường Việt Nam (TAM, thời điểm) | ✅ $100-165M, 5 phân khúc |
| 14 | Đóng góp từ 8 góc nhìn chuyên gia | ✅ 8 phần chuyên gia |
| 15 | Khuyến nghị tổng hợp (chiến lược, kỹ thuật, GTM) | ✅ 3 mảng khuyến nghị |
| 16 | Toàn bộ tiếng Việt có dấu đầy đủ | ✅ |

---

## Phần 7: Câu hỏi Mở

1. **Mô hình Nền tảng cho Dữ liệu Bảng (Tabular Foundation Models) sẽ thay thế GBDT điều chỉnh thủ công đến mức nào?** TabPFN cho thấy tiềm năng trên dữ liệu nhỏ, nhưng liệu có mở rộng được cho dữ liệu doanh nghiệp quy mô lớn (>1M hàng)?

2. **LLM-augmented Tabular ML sẽ trưởng thành đến đâu?** Hệ thống lai GBDT + đặc trưng do LLM sinh (2025-2026) là tiên phong — liệu có trở thành tiêu chuẩn hay chỉ là thí nghiệm?

3. **Quy định NHNN về giải thích mô hình sẽ thắt chặt hay nới lỏng?** Nếu thắt chặt, mô hình giải thích nội tại (EBM, GAM) có thể thay thế GBDT đen hộp + SHAP hậu kỳ trong lĩnh vực ngân hàng.

4. **Chất lượng dữ liệu doanh nghiệp Việt Nam cải thiện nhanh đến mức nào?** Nếu chậm, phần lớn nỗ lực sẽ tiêu tốn vào tiền xử lý và làm sạch dữ liệu thay vì mô hình hóa. Liệu có nên xây nền tảng chất lượng dữ liệu riêng?

5. **Federated learning cho dữ liệu bảng có khả thi tại Việt Nam?** Ngân hàng không muốn chia sẻ dữ liệu khách hàng, nhưng mô hình liên bang có thể cho phép xây mô hình chấm điểm tín dụng tốt hơn từ dữ liệu đa ngân hàng mà không vi phạm quyền riêng tư.

6. **Khi nào deep tabular thực sự vượt qua GBDT?** Benchmark 2022 xác nhận GBDT vẫn hơn trên dữ liệu điển hình. Điều kiện cụ thể nào (kích thước, cấu trúc, đa phương thức) sẽ lật cán cân?

7. **Chiến lược giá nào hiệu quả nhất cho thị trường Việt Nam?** Giá theo kết quả (outcome-based) lý tưởng nhưng khó đo lường. Giá SaaS đơn giản hơn nhưng bị kháng cự. Mô hình lai nào tối ưu?

---

*Báo cáo tổng hợp bởi Ms. Scribe (R-σ) — MAESTRO Knowledge Graph System*
*Baseline: B13 — Tabular ML & Predictive Analytics*
*Phiên bản: 1.0 | Ngày: 2026-03-31*
*Nguồn: R-α (Dr. Archon), R-β (Dr. Praxis), R-γ (Dr. Sentinel)*
