# Ghi chú Data Analyst: B02 — Document Intelligence
## Tác giả: R-DA — Ngày: 2026-03-31

---

## Góc nhìn chuyên môn

Từ góc nhìn Data Analyst, Document Intelligence cần được đánh giá qua lăng kính metrics-driven (dựa trên số liệu). Mọi hệ thống Document AI đều có thể "chạy được", nhưng câu hỏi quan trọng là: accuracy bao nhiêu phần trăm? Ở đâu model fail? Tại sao fail? Và business impact (tác động kinh doanh) của mỗi phần trăm accuracy là gì? Data Analyst đóng vai trò cầu nối giữa technical performance và business value.

Đo lường accuracy trong Document Intelligence phức tạp hơn nhiều so với các bài toán ML thông thường. Không chỉ đơn giản là "đúng hay sai" — cần đo ở nhiều cấp độ: Character-level accuracy (chính xác từng ký tự), Word-level accuracy, Field-level accuracy (đúng cả trường thông tin), và Document-level accuracy (toàn bộ tài liệu đúng hoàn toàn). Một hóa đơn có thể OCR đúng 98% ký tự nhưng sai số tiền — tức field-level accuracy cho amount = 0%, dù character accuracy rất cao.

Phân tích error patterns (mẫu lỗi) là công việc có giá trị nhất mà Data Analyst đóng góp. Thay vì chỉ báo "accuracy = 95%", cần phân tích sâu: lỗi tập trung ở loại tài liệu nào? Trường thông tin nào hay sai nhất? Điều kiện scan nào gây lỗi nhiều? Có pattern theo thời gian không (batch scan buổi chiều quality thấp hơn)? Insights này trực tiếp guide model improvement.

Business impact analysis (phân tích tác động kinh doanh) cho Document Intelligence cần định lượng rõ ràng. Ví dụ: một doanh nghiệp có 5 nhân viên nhập liệu hóa đơn, mỗi người xử lý 100 hóa đơn/ngày với chi phí ~15 triệu VNĐ/người/tháng. Nếu Document AI xử lý tự động 80% với accuracy 99%, tiết kiệm 60 triệu VNĐ/tháng nhân lực + giảm thời gian xử lý từ 2 ngày xuống 2 giờ. ROI (Return on Investment — tỷ suất hoàn vốn) phải được tính rõ cho từng use case.

Dashboard monitoring cho Document Intelligence production cần real-time visibility vào system health. Không chỉ technical metrics (throughput, latency) mà cả business metrics (documents processed per day, auto-approved rate, human review rate, error rate by category). Stakeholders cần nhìn thấy value liên tục, không chỉ khi có báo cáo quý.

## Khuyến nghị kỹ thuật

1. **Multi-level Accuracy Framework**: Thiết kế framework đo accuracy ở 4 cấp:
   - Character Error Rate (CER): Levenshtein distance / total characters
   - Word Error Rate (WER): Sai word / total words
   - Field Accuracy: Số trường extract đúng / tổng trường
   - Document Accuracy: Số document hoàn toàn đúng / tổng documents
   Mỗi level phục vụ stakeholder khác nhau.

2. **Confusion Matrix theo Document Type**: Xây dựng confusion matrix cho document classification — xem model phân loại nhầm hóa đơn thành phiếu thu ở tỷ lệ bao nhiêu. Đây là bước đầu tiên trong pipeline, sai ở đây cascade toàn bộ.

3. **Error Taxonomy (Phân loại lỗi)**: Phân loại lỗi extraction thành categories:
   - **OCR Error**: Ký tự sai do image quality (ví dụ: 0 → O, 1 → l)
   - **Layout Error**: Extract sai field vì hiểu nhầm layout
   - **Logic Error**: Extract đúng text nhưng sai mapping (nhầm seller thành buyer)
   - **Missing Error**: Không detect được field
   Mỗi category cần intervention khác nhau.

4. **Ground Truth Management System**: Xây dựng hệ thống quản lý ground truth — human-verified extracted data làm benchmark. Cần ít nhất 500 documents per type cho statistical significance. Update ground truth hàng tháng khi template thay đổi.

5. **A/B Testing Framework cho Model Versions**: Khi deploy model mới, route 10% traffic qua new model, so sánh accuracy với production model trên cùng documents. Chi dùng statistical test (paired t-test hoặc McNemar's test) để xác nhận improvement có significant.

6. **Cost-per-Document Analysis**: Tính chi phí xử lý mỗi tài liệu — bao gồm compute cost (GPU time), storage cost, và human review cost (khi confidence thấp). Target: < 500 VNĐ/document cho high-volume processing.

7. **SLA Monitoring Dashboard**: Dashboard Grafana tracking:
   - Processing time P50, P95, P99
   - Accuracy by document type (daily/weekly trend)
   - Human review rate (target < 15%)
   - Queue depth và processing backlog
   - Cost per document over time

8. **Cohort Analysis cho Error Patterns**: Phân tích lỗi theo cohort — theo nguồn scan (máy scan A vs B), theo chi nhánh (Hà Nội vs HCM), theo thời gian (sáng vs chiều), theo template version. Phát hiện systematic issues thay vì random noise.

9. **Business Value Tracking**: Monthly report tracking:
   - Số giờ nhân công tiết kiệm
   - Số tài liệu xử lý tự động vs manual
   - Error rate trend (nên giảm dần)
   - Customer satisfaction score (nếu có)
   - Cost savings vs traditional process

10. **Anomaly Detection trên Extraction Results**: Set up alerts khi extraction results bất thường — ví dụ: tổng tiền hóa đơn đột ngột > 1 tỷ VNĐ, hoặc tỷ lệ empty fields tăng đột biến. Có thể là model degradation hoặc input data quality issue.

## Rủi ro & Thách thức

1. **Ground truth bias**: Nếu ground truth được tạo bởi nhóm annotator nhỏ, có thể chứa systematic bias. Ví dụ: annotator quen đọc hóa đơn của vùng miền này nhưng sai với vùng khác. Cần inter-annotator agreement measurement (Cohen's Kappa ≥ 0.85) và diverse annotator pool.

2. **Metric gaming**: Team ML có thể optimize cho metrics dễ đo (CER) mà bỏ qua metrics quan trọng hơn cho business (field accuracy trên key fields). Cần đảm bảo primary metric align với business objective — ví dụ: "accuracy trên trường Tổng tiền" quan trọng hơn "average CER".

3. **Insufficient sample size cho rare document types**: Một số loại tài liệu hiếm (hợp đồng đặc thù, chứng từ xuất nhập khẩu) có volume thấp, khó có đủ sample để đo accuracy reliable. Cần bootstrapping hoặc synthetic data generation cho evaluation.

4. **Real-time accuracy tracking lag**: Production accuracy chỉ biết được khi có human verification — thường delay 1-7 ngày. Proxy metrics (OCR confidence, extraction confidence) cần calibrated tốt để phản ánh actual accuracy.

## Công cụ & Thư viện đề xuất

| Công cụ | Mục đích | Ghi chú |
|---------|---------|---------|
| **Grafana** | Dashboard & monitoring | Real-time visualization |
| **Apache Superset** | BI & analytics | SQL-based exploration |
| **Great Expectations** | Data quality testing | Automated validation |
| **Pandas + NumPy** | Data analysis | Error pattern analysis |
| **Scikit-learn metrics** | Accuracy measurement | Precision, recall, F1 |
| **Weights & Biases** | Experiment tracking | Model comparison |
| **Metabase** | Business dashboards | Non-technical stakeholders |
| **dbt** | Data transformation | Analytics engineering |
| **Jupyter/Databricks** | Exploratory analysis | Ad-hoc deep dives |
| **Prometheus + AlertManager** | Metric collection & alerts | Real-time monitoring |

## Ghi chú cho R-σ (Consolidation)

- **Metrics framework**: 4 cấp độ accuracy (character → word → field → document). Primary metric cho business là field accuracy trên key fields.
- **Error taxonomy**: 4 loại lỗi (OCR/Layout/Logic/Missing) — mỗi loại cần intervention khác nhau. Đây là input quan trọng cho R-MLE.
- **Business case**: Với 5 nhân viên nhập liệu, ROI ước tính tiết kiệm 60 triệu VNĐ/tháng. Cost per document target < 500 VNĐ.
- **Dashboard**: Cần 2 dashboards — technical (cho ML team) và business (cho management). Grafana + Metabase.
- **Ground truth**: Cần 500+ verified samples per document type. Inter-annotator agreement ≥ 0.85.
- **Critical insight**: Accuracy 95% nghe tốt nhưng có thể không đủ cho financial documents. 99%+ cần cho trường Tổng tiền, Mã số thuế.
