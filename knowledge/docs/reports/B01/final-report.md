# Báo Cáo Cuối Cùng: B01 — Dự Báo & Chuỗi Thời Gian
## Tác giả: Ms. Scribe (R-σ) — Trưởng Phòng Tri Thức
## Ngày: 2026-03-30
## Trạng thái: HOÀN TẤT — SẴN SÀNG CHO QUẢN LÝ ĐÁNH GIÁ

---

## 1. Tóm Tắt Điều Hành

Forecasting & Time Series (Dự Báo & Chuỗi Thời Gian) là một lĩnh vực đã được chứng minh thương mại với nhu cầu mạnh mẽ, rộng rãi trên mọi ngành dọc lớn — bán lẻ, logistics, năng lượng, tài chính, và y tế — và sự sẵn lòng chi trả của tổ chức cho dự báo chính xác, có xác suất đã được ghi nhận đầy đủ. Lĩnh vực đã đạt điểm uốn thực sự trong giai đoạn 2024–2026 nhờ foundation models (mô hình nền tảng) như TimesFM, Chronos, Moirai giải quyết bài toán cold-start (khởi động nguội) cho thực thể mới, nhưng mô hình đã huấn luyện chuyên tác vụ vẫn là tiêu chuẩn sản xuất khi đã tích lũy đủ dữ liệu. Phương pháp xây dựng được đề xuất là nền tảng phân giai đoạn phù hợp quy mô: MVP tinh gọn trong 3–5 tuần, Production v1 trong 18–24 tuần, và nền tảng đa thuê bao đầy đủ trong khoảng 9 tháng — với phạm vi được kiểm soát chặt bởi yêu cầu khách hàng thực tế ở mỗi giai đoạn. Kết luận **Đạt Có Điều Kiện** (điểm có trọng số 6.90/10) là hợp lý với ba điều kiện tiên quyết phải đáp ứng trước khi cam kết đầu tư Production v1: khám phá khách hàng để xác nhận yêu cầu tầng và SLA, spike benchmark chi phí GPU cho foundation model, và ngăn rò rỉ walk-forward CV làm cổng CI/CD hạng nhất.

---

## 2. Phát Hiện Đồng Thuận

Các lập trường sau được α (Dr. Archon), β (Dr. Praxis), và γ (Dr. Sentinel) đồng thuận không có bất đồng đáng kể:

### 2.1 LightGBM + Xây Dựng Đặc Trưng Là Công Cụ Sản Xuất Chính (α, β, γ)
Cả ba tác nhân đều hội tụ về LightGBM với đặc trưng dạng bảng lag/cuộn là mô hình sản xuất chính cho dự báo bán lẻ và chuỗi cung ứng ở quy mô 10–100K chuỗi. Bằng chứng từ cuộc thi M5 (dữ liệu phân cấp Walmart, 2020) được cả ba trích dẫn là benchmark quyết định hỗ trợ lựa chọn này. Ghi chú chuyên viên R-MLE và R-SA xác nhận điều này một cách độc lập.

### 2.2 Foundation Model Giải Quyết Cold-Start, Không Thay Thế Mô Hình Đã Huấn Luyện (α, β, γ)
α xác định foundation model (TimesFM, Chronos) là "chuyển đổi mô hình." β tích hợp chúng như đường dẫn suy luận cold-start. γ thách thức cách diễn đạt "khoảnh khắc GPT" của α nhưng cả ba đồng ý định vị đúng là: foundation model loại bỏ rào cản khan hiếm dữ liệu cho thực thể mới (giá trị thương mại thực sự), và bị vượt qua bởi mô hình fine-tune khi có ≥60 quan sát lịch sử thực thể. Sự đồng thuận này giải quyết điều có vẻ là mâu thuẫn (xem Mục 3).

### 2.3 Walk-Forward Cross-Validation Với Khoảng Trống Là Không Thương Lượng (α, β, γ, R-MLE, R-QA)
Cả ba tác nhân Tầng 1 và cả ghi chú chuyên viên QA và MLE đều độc lập đánh cờ walk-forward CV đúng là kỷ luật triển khai quan trọng nhất. Tham số gap phải bằng max(forecast_horizon, max_lag_used). Đây không phải tối ưu hiệu suất — đây là yêu cầu tính đúng.

### 2.4 Dự Báo Xác Suất Là Khả Năng Khác Biệt (α, β, γ, R-DA, R-BE)
Tất cả tác nhân đồng ý rằng lượng hóa bất định (khoảng dự đoán, CRPS) là yếu tố khác biệt. Các bên liên quan kinh doanh cần phạm vi, không phải ước tính điểm, cho quyết định tồn kho, năng lực, và tài chính. Ghi chú R-DA và R-BE củng cố điều này ở cấp trình bày và thiết kế API.

### 2.5 MASE Là Metric Đánh Giá Chính (α, β, R-MLE, R-QA)
α ghi nhận MASE trong các khái niệm cốt lõi. β sử dụng MASE < 1.0 so với naive làm cổng triển khai. R-MLE và R-QA độc lập khuyến nghị MASE làm metric xuyên chuỗi chính. Đây là nhất trí.

### 2.6 Giám Sát và Phát Hiện Drift Là Yêu Cầu Hạng Nhất (β, γ, R-DO)
β chỉ định Evidently AI + Prometheus ở ngưỡng PSI > 0.2. γ liệt kê phát hiện drift là yêu cầu kiến trúc cốt lõi. R-DO chi tiết stack giám sát 3 tầng. Tất cả đồng ý rằng mô hình suy giảm thầm lặng nếu không có cảnh báo drift tự động, và trigger huấn luyện lại tự động là quan trọng cho sản xuất.

### 2.7 Thị Trường Việt Nam/Đông Nam Á Có Nhu Cầu Thực Với Lợi Thế Chậm 3–5 Năm (γ)
γ xác định riêng rằng thị trường logistics Đông Nam Á (Grab, Lalamove, J&T Express, Shopee) chậm 3–5 năm so với Mỹ/EU trong áp dụng, nghĩa là LightGBM + baseline thống kê có thể thắng giao dịch mà thị trường Mỹ đã coi là hàng hóa. Điều này mở ra bước đệm thực dụng không có sẵn ở thị trường bão hòa hơn. Ghi chú lĩnh vực logistics R-D06 xác nhận mật độ trường hợp sử dụng logistics trong khu vực.

---

## 3. Mâu Thuẫn Đã Giải Quyết

### Mâu Thuẫn 1: Foundation Model — "Khoảnh Khắc GPT" vs. "Phóng Đại Marketing"

**Lập trường của α:** Foundation model đại diện cho "khoảnh khắc GPT" cho chuỗi thời gian và sẽ "giảm thời gian phát triển mô hình từ tuần xuống giờ."

**Thách thức của γ (mức tin cậy CAO):** Tuyên bố "tuần xuống giờ" nhầm lẫn thời gian phát triển mô hình với thời gian triển khai hệ thống. Benchmark Gift-Eval cho thấy foundation model luôn kém hơn mô hình fine-tune chuyên tác vụ trên dữ liệu trong phân phối. Tuyên bố bị phóng đại.

**Giải Quyết:** Cả hai lập trường đều đúng ở phạm vi khác nhau. Tuyên bố "giờ" chính xác cho *thời gian đến dự báo đầu tiên* trên thực thể cold-start — foundation model tạo dự báo zero-shot có thể triển khai trong vài giờ mà không cần dữ liệu huấn luyện, điều thực sự mang tính cách mạng cho kịch bản cold-start. γ đúng rằng *hệ thống xung quanh* (giám sát, hiệu chuẩn, hòa hợp, logic dự phòng) vẫn cần hàng tuần kỹ thuật. Khuyến nghị tích hợp là: dùng foundation model cho đường dẫn cold-start (< 60 quan sát); dùng mô hình đã huấn luyện chuyên tác vụ cho đường dẫn trưởng thành (≥ 60 quan sát); không bao giờ trình bày "giờ" cho các bên liên quan mà không có giới hạn phạm vi cold-start. Cách diễn đạt "khoảnh khắc GPT" phù hợp cho định vị thị trường nhưng phải được khuyến cáo trong tài liệu kỹ thuật.

### Mâu Thuẫn 2: ETS — "Tiêu Chuẩn Vàng" vs. "Tiên Nghiệm Gây Hiểu Lầm"

**Lập trường của α:** Các biến thể ETS "vượt trội hầu hết phương pháp ML" trong cuộc thi M4 (2018).

**Thách thức của γ (mức tin cậy CAO):** Điều này tạo tiên nghiệm gây hiểu lầm. M4 kiểm thử dữ liệu sạch đơn biến horizon ngắn từ vintage 2015. M5 (2020, dữ liệu phân cấp Walmart có biến đồng hành) được thắng bởi LightGBM, đảo ngược kết luận M4 cho dự báo kinh doanh. Kết quả M4 neo người đọc vào baseline sai.

**Giải Quyết:** Cả hai tuyên bố đều chính xác về mặt dữ kiện trong bối cảnh tương ứng. Tổng hợp: phương pháp ETS và Theta vẫn là lựa chọn tốt nhất cho *chuỗi sạch đơn biến horizon ngắn không có biến đồng hành ngoài* — vốn mô tả thiểu số khối lượng công việc sản xuất doanh nghiệp. Cho *dự báo kinh doanh phân cấp, giàu biến đồng hành, đa chuỗi* (kịch bản sản xuất chính trong bán lẻ, logistics, và chuỗi cung ứng), LightGBM là best practice hiện tại. Nền tảng nên định vị ETS là benchmark cơ sở và LightGBM là mô hình sản xuất chính, với tài liệu rõ ràng về điều kiện ETS đủ.

### Mâu Thuẫn 3: Conformal Prediction — "Coverage Đảm Bảo" vs. "Không Chính Xác Kỹ Thuật cho Chuỗi Thời Gian"

**Lập trường của α:** Conformal prediction cung cấp "coverage đảm bảo không cần giả định phân phối — quan trọng cho các ngành được quản lý."

**Thách thức của γ (mức tin cậy CAO):** Dữ liệu chuỗi thời gian vi phạm giả định tính hoán đổi (exchangeability) cần thiết cho đảm bảo. Dưới dịch chuyển phân phối, khoảng conformal có thể bị sai lệch hiệu chuẩn một cách có hệ thống. Trong các ngành được quản lý (y tế, tài chính), ngôn ngữ "đảm bảo" có ý nghĩa pháp lý.

**Giải Quyết:** γ đúng về mặt kỹ thuật. Lập trường tích hợp cho tất cả tài liệu nền tảng và giao tiếp khách hàng: "Conformal prediction cung cấp đảm bảo coverage *xấp xỉ* dưới giả định dừng nhẹ, với hiệu chuẩn lại cuộn cần thiết trong dịch chuyển phân phối. Cho các ngành được quản lý, trình bày coverage là đã xác nhận thực nghiệm (vd. 79.5% coverage thực nghiệm trên holdout 12 tháng) thay vì đảm bảo lý thuyết." Hạn chế 4 của β đã thừa nhận lưu ý tính hoán đổi. Nền tảng phải triển khai hiệu chuẩn lại conformal cuộn (hiệu chuẩn trên K quan sát gần nhất) làm mặc định, không phải cải tiến tùy chọn.

### Mâu Thuẫn 4: Timeline MVP — "3 Tuần" vs. "3.5–5 Tuần"

**Lập trường của β:** MVP đạt được trong 3 tuần cho 1 kỹ sư ML.

**Thách thức của γ (mức tin cậy TRUNG BÌNH):** Ước tính thực tế là 3.5–5 tuần với chất lượng dữ liệu điển hình. Thu mua dữ liệu hoàn toàn bị loại khỏi ước tính của β và thêm 2–6 tuần trong môi trường doanh nghiệp.

**Giải Quyết:** Cả hai đều đúng cho điều kiện giả định của mình. Trình bày tích hợp: timeline MVP tiêu đề là **3 tuần (dữ liệu sạch, kỹ sư có kinh nghiệm)** với lưu ý rõ ràng rằng **4–5 tuần là điển hình cho đội mới với stack hoặc gặp vấn đề chất lượng dữ liệu**. Các cuộc trao đổi bán hàng và phạm vi dự án phải coi thu mua dữ liệu là workstream riêng, rõ ràng không bao gồm trong timeline kỹ thuật ML. Điều này ngăn sự lệch kỳ vọng phổ biến nhất với khách hàng giai đoạn đầu.

### Mâu Thuẫn 5: Hòa Hợp MinT — "1 Tuần" vs. "2.5–3 Tuần"

**Lập trường của β:** Hòa hợp MinT là tác vụ triển khai 1 tuần.

**Thách thức của γ (mức tin cậy TRUNG BÌNH):** Xử lý phân cấp động, hiệu chuẩn lại khoảng sau hòa hợp, và ước lượng hiệp phương sai Ledoit-Wolf trong điều kiện lịch sử ngắn (< 3×n_series quan sát) cộng lại khiến 1 tuần không thực tế.

**Giải Quyết:** Ước tính 1 tuần của β áp dụng cho phân cấp tĩnh với lịch sử đầy đủ. Ước tính 2.5–3 tuần của γ áp dụng cho triển khai cấp sản xuất với quản lý phiên bản phân cấp động và hòa hợp xác suất. Lộ trình nền tảng nên dùng 2.5 tuần làm cơ sở lập kế hoạch cho MinT Production v1, và hoãn hòa hợp xác suất (hiệu chuẩn lại khoảng sau hòa hợp) sang cải tiến Giai đoạn 2. Ma trận tổng phải được quản lý phiên bản từ ngày 1 sử dụng bản ghi timestamp-effective.

---

## 4. Khuyến Nghị Tích Hợp

### 4.1 Kiến Trúc: Điều Chỉnh Stack Phù Hợp Theo Tầng Khách Hàng

Quyết định kiến trúc quan trọng nhất là phù hợp độ phức tạp stack với quy mô khách hàng thực tế. Báo cáo kỹ thuật mô tả nền tảng doanh nghiệp đầy đủ; γ đúng khi xác định đây là thiết kế quá mức cho khách hàng giai đoạn đầu. Khuyến nghị tích hợp:

**Tầng 1 — SME / Khách Hàng Giai Đoạn Đầu (< 10K chuỗi, chỉ batch):**
- TimescaleDB + Parquet/S3 (không Delta Lake ACID overhead)
- View SQL đúng thời điểm cho đặc trưng (không Feast)
- Mô hình toàn cục LightGBM + baseline StatsForecast AutoETS
- FastAPI + Airflow (không BentoML, không Spark, không Kubernetes)
- Giám sát Evidently AI + Prometheus
- Foundation model (Chronos-tiny) chỉ cho thực thể cold-start

**Tầng 2 — Mid-Market (10K–100K chuỗi, hỗn hợp batch/thời gian thực):**
- Thêm Feast chỉ khi truy xuất đặc trưng thời gian thực < 10ms là yêu cầu khách hàng đã xác nhận
- Thêm Dask (không phải Spark) cho suy luận batch ở 50K+ chuỗi
- Thêm Docker Compose → Kubernetes chỉ khi cần cách ly đa thuê bao
- Thêm TFT/PatchTST chỉ sau khi đã xác nhận sự đầy đủ của LightGBM trên dữ liệu khách thực

**Tầng 3 — Doanh Nghiệp (100K+ chuỗi, thời gian thực, đa thuê bao):**
- Full stack như mô tả trong báo cáo kỹ thuật của β
- Pod suy luận GPU cho foundation model (đã benchmark chi phí mỗi dự đoán trước)
- Hòa hợp MinT với phân cấp có phiên bản và điều chỉnh khoảng xác suất

### 4.2 Lựa Chọn Mô Hình: Cây Quyết Định Dựa Trên Bằng Chứng

Theo cây quyết định chọn mô hình R-MLE, tích hợp với danh mục thuật toán của α:
1. < 50 chuỗi hoặc < 100 dòng/chuỗi → ETS/SARIMA (StatsForecast)
2. 50–500 chuỗi, có đặc trưng dạng bảng → Mô hình toàn cục LightGBM (khuyến nghị chính)
3. < 60 quan sát (cold-start) → Foundation model (Chronos-tiny hoặc TimesFM-200M)
4. 500K+ chuỗi đa biến, horizon dài → PatchTST hoặc iTransformer
5. Đa biến có giải thích với biến đồng hành biết trước tương lai → TFT

**Không bao giờ đầu tư vào TFT/PatchTST trước khi thiết lập LightGBM là baseline** — nghịch lý benchmark DLinear (γ, Thách thức 4) có nghĩa là độ phức tạp kiến trúc không đảm bảo cải thiện độ chính xác trên dữ liệu kinh doanh thực.

### 4.3 Chiến Lược Foundation Model: Kỷ Luật Kinh Tế Trước Tiên

Trước khi cam kết hạ tầng phục vụ foundation model, spike benchmark chi phí GPU (Điều kiện 2 của γ) phải hoàn thành. Các ràng buộc thực tế:
- Chronos-large: ~2 giây/chuỗi trên CPU; 10K chuỗi = ~6 giờ (xác nhận bởi cả β và γ)
- Instance GPU T4: ~$0.526/giờ; 100K chuỗi hàng đêm ≈ $400–600/tháng chỉ riêng chi phí tính toán
- Chronos-tiny CRPS kém ~15% so với Chronos-base (chấp nhận cho cold-start; không chấp nhận cho mô hình chính)

**Khuyến nghị tích hợp:** Triển khai Chronos-tiny làm mô hình cold-start mặc định. Giới hạn sử dụng foundation model cho thực thể có lịch sử < 60 ngày. Tính trước và cache hàng đêm; không bao giờ chạy đồng bộ theo yêu cầu. Benchmark chi phí mỗi dự đoán theo kích thước mô hình trước cam kết sản xuất.

### 4.4 Chất Lượng Dữ Liệu: Coi Là Rủi Ro Dự Án, Không Phải Chi Tiết Kỹ Thuật

Ước tính của γ rằng vấn đề chất lượng dữ liệu ảnh hưởng 70%+ dự án thực (R-DE xác nhận với ghi chú về khoảng thời gian bất thường và dữ liệu đến trễ) có nghĩa là công việc pipeline dữ liệu phải được phân bổ ngân sách rõ ràng. Khuyến nghị tích hợp:
- Luôn tạo xương sống timestamp đầy đủ và left-join giá trị thực — coi khoảng trống là NULL, không phải im lặng
- Duy trì `event_timestamp` và `ingest_timestamp` là các cột riêng (R-DE)
- Không bao giờ nhầm lẫn sự kiện giá trị zero với dữ liệu thiếu (0 doanh số ≠ không có dòng dữ liệu)
- Triển khai bộ Great Expectations từ Tuần 1, không phải như cải tiến chất lượng sau
- Đánh cờ yêu cầu lịch sử tối thiểu 2 năm sớm trong khám phá khách hàng — ~30% khách SME sẽ không đủ điều kiện cho mô hình toàn cục đã huấn luyện và phải dựa vào cold-start foundation model (hình phạt độ chính xác: suy giảm MASE 15–20% so với fine-tuned)

### 4.5 Walk-Forward CV: Coi Là Yêu Cầu Tính Đúng, Không Phải Best Practice

Tham số gap giữa kết thúc huấn luyện và bắt đầu xác nhận phải bằng max(forecast_horizon, max_lag_used). Đây không phải tùy chọn. Rủi ro hỏng chất lượng thầm lặng (Rủi ro 2 của γ) — nơi MASE huấn luyện 0.78 suy giảm thành 0.95 trong sản xuất — là thất bại phổ biến nhất được quan sát trong dự án dự báo. Yêu cầu triển khai:
- Thêm assertion tại thời điểm tải cấu hình: `assert gap >= max(forecast_horizon, max_lag_features)`
- Thêm kiểm thử canary rò rỉ: huấn luyện với gap=0, xác nhận MASE < 0.5, đánh cờ là chỉ báo rò rỉ
- Thêm vào pipeline CI/CD như cổng chất lượng chặn trước khi bất kỳ mô hình nào tiến sang staging

### 4.6 Dự Báo Xác Suất: Công Bố Coverage Thực Nghiệm, Không Phải Đảm Bảo

Thay thế ngôn ngữ "coverage đảm bảo" ở mọi nơi bằng "coverage đã xác nhận thực nghiệm." Mặc định hiệu chuẩn lại conformal cuộn với cửa sổ hiệu chuẩn 90 ngày. Hiệu chuẩn lại hàng tuần. Khi coverage giảm dưới 75% (ngưỡng của γ: 0.75 cho PI danh nghĩa 80%), kích hoạt hiệu chuẩn lại và cảnh báo. Cho các ngành được quản lý (y tế, tài chính), ghi nhận tập dữ liệu hiệu chuẩn, kỳ hiệu chuẩn, và tỷ lệ coverage thực nghiệm trong thẻ mô hình.

### 4.7 Dự Báo Phân Cấp: Quản Lý Phiên Bản Ma Trận Tổng Từ Ngày 1

Triển khai bản ghi ma trận tổng timestamp-effective trước khi khách hàng đầu tiên đi vào sản xuất. Rủi ro bất ổn phân cấp bán lẻ/logistics (Rủi ro 5 của γ) không phải trường hợp biên — bất kỳ khách hàng nào có giới thiệu sản phẩm theo mùa sẽ kích hoạt thay đổi phân cấp trong 3–6 tháng. Mô hình dữ liệu cần: bảng `S_version` với `(valid_from, valid_to, hierarchy_definition)`. Hòa hợp MinT phải luôn tham chiếu phiên bản S có hiệu lực tại thời điểm tạo dự báo.

### 4.8 Định Vị Cạnh Tranh: Chuyển Hào Từ Mô Hình Sang Pipeline

Cửa sổ hàng hóa hóa 12–24 tháng (Rủi ro 4 của γ) có nghĩa "foundation model tốt hơn" không phải yếu tố khác biệt bền vững. Định vị tích hợp:
- Hào chính: **Chất lượng pipeline MLOps** — giám sát, trigger huấn luyện lại, hòa hợp phân cấp, giải thích (SHAP), và tích hợp ERP/TMS không dễ bị sao chép bởi API của Nixtla hay dịch vụ quản lý AWS Forecast
- Hào phụ: **Chủ quyền dữ liệu** — khách hàng không thể gửi dữ liệu cho API bên ngoài (chính phủ, ngành được quản lý, doanh nghiệp Việt Nam có yêu cầu PDPA) phải xây nội bộ
- Điều kiện thắng: **3 khách hàng tham chiếu với ROI được ghi nhận trong 9 tháng** trước khi cửa sổ hàng hóa hóa đóng

---

## 5. Tóm Tắt Rủi Ro Chính

### Rủi Ro 1: Vòng Xoáy Chi Phí GPU (Rủi ro 1 của γ) — Mức Nghiêm Trọng: CAO
Chi phí GPU foundation model tăng phi tuyến ở quy mô. Nếu không có mô hình chi phí và cấu trúc giá khách hàng tính đến GPU COGS, nền tảng có thể dương doanh thu nhưng âm biên lợi nhuận. **Giảm thiểu:** Spike benchmark chi phí GPU (2 tuần) trước khóa kiến trúc Production v1. Giới hạn foundation model cho đường dẫn cold-start. Tính trước hàng đêm; không bao giờ phục vụ đồng bộ. Đánh giá Chronos-tiny làm mặc định (hình phạt CRPS 15% chấp nhận được cho cold-start).

### Rủi Ro 2: Rò Rỉ Walk-Forward CV — Hỏng Chất Lượng Thầm Lặng (Rủi ro 2 của γ) — Mức Nghiêm Trọng: CAO
Cấu hình gap không đúng tạo MASE huấn luyện ~0.78 suy giảm thành ~0.95 trong sản xuất. Phát hiện thường cần 4–8 tuần giám sát trực tiếp. Lòng tin khách hàng bị phá hủy khi khoảng cách độ chính xác bị phát hiện. **Giảm thiểu:** Cổng phát hiện rò rỉ hạng nhất trong CI/CD từ Tuần 1. Assertion gap trong tất cả cấu hình CV. Checklist code review cho tất cả code xây dựng đặc trưng. Kiểm thử canary rò rỉ tự động.

### Rủi Ro 3: Feast Feature Store Thiết Kế Quá Mức (Rủi ro 3 của γ) — Mức Nghiêm Trọng: CAO
Feast luôn gây vượt timeline 2–4 lần trong triển khai lần đầu. Nếu Feast nằm trên đường tới hạn Production v1, timeline 18 tuần trở thành 24–28 tuần. **Giảm thiểu:** Triển khai đặc trưng dạng view SQL đúng thời điểm trong TimescaleDB cho Production v1. Giới thiệu Feast chỉ trong giai đoạn Nền Tảng Đầy Đủ, chỉ khi truy xuất đặc trưng online dưới 10ms là yêu cầu khách hàng đã xác nhận.

### Rủi Ro 4: Hàng Hóa Hóa Hyperscaler (Rủi ro 4 của γ) — Mức Nghiêm Trọng: CAO
AWS Forecast lịch sử đã áp dụng kiến trúc mô hình mới trong 12–18 tháng sau công bố. TimesFM là mô hình riêng của Google — tích hợp Google Cloud có khả năng trong 2025–2026. TimeGPT của Nixtla cung cấp dự báo API-first zero-shot ở $0.0001/dự đoán. Cửa sổ khác biệt hẹp. **Giảm thiểu:** Xây chiều sâu pipeline MLOps (giám sát, giải thích, hòa hợp phân cấp) làm hào chính. Thiết lập 3 khách hàng tham chiếu với ROI được ghi nhận trong 9 tháng.

### Rủi Ro 5: Rào Cản Sẵn Có Dữ Liệu cho Khách Giai Đoạn Đầu (Khả thi Dữ liệu của γ) — Mức Nghiêm Trọng: TRUNG BÌNH
~30% khách hàng tiềm năng giai đoạn đầu sẽ không có lịch sử tối thiểu 2 năm cần cho walk-forward CV với 5 fold. Xuất ERP batch hàng tuần (phổ biến trong SME sản xuất Việt Nam) không thể đáp ứng SLA thu nạp hàng ngày mà không có thay đổi IT phía khách (phụ thuộc thu mua 4–12 tuần). **Giảm thiểu:** Foundation model cold-start giảm thiểu yêu cầu lịch sử. Cho khách trên nhịp batch hàng tuần, cung cấp tầng dự báo tần suất tuần với SLA điều chỉnh. Đánh giá độ trưởng thành dữ liệu trong cuộc khám phá khách hàng đầu tiên.

### Rủi Ro 6: Sai Lệch Hiệu Chuẩn Coverage Conformal Dưới Dịch Chuyển Phân Phối (Thách thức 3 của γ, Hạn chế 4 của β) — Mức Nghiêm Trọng: TRUNG BÌNH
Khoảng conformal prediction có thể under-cover một cách có hệ thống trong chính kịch bản kích hoạt huấn luyện lại (dịch chuyển phân phối). Trong ngành được quản lý, đây là rủi ro có ý nghĩa. **Giảm thiểu:** Hiệu chuẩn conformal cuộn (K quan sát gần nhất) làm triển khai mặc định. Hiệu chuẩn lại hàng tuần. Cảnh báo coverage giảm tại 75% thực nghiệm (danh nghĩa 80%). Ghi nhận lưu ý tính hoán đổi trong tất cả tài liệu khách hàng ngành được quản lý.

---

## 6. Lộ Trình Triển Khai

### Giai Đoạn Trước Xây Dựng (Tuần 1–3): Khám Phá và Khóa Kiến Trúc

**Tuần 1–2: Khám Phá Khách Hàng (5 phỏng vấn)**
- Xác nhận: số chuỗi trung bình, yêu cầu suy luận batch vs thời gian thực, chủ quyền dữ liệu, sẵn lòng chi trả
- Đầu ra: lựa chọn tech stack sửa đổi theo tầng khách hàng (SME / Mid-Market / Doanh Nghiệp)
- Chủ sở hữu: Sản Phẩm + Phát Triển Kinh Doanh

**Tuần 2–3: Spike Benchmark Chi Phí GPU**
- Kiểm thử Chronos-tiny, Chronos-small, TimesFM-200M trên 3 tập dữ liệu thực (CPU + GPU)
- Tạo bảng chi phí mỗi dự đoán theo kích thước mô hình và cấu hình phần cứng
- Đầu ra: mô hình chi phí tích hợp vào các tầng giá khách hàng
- Chủ sở hữu: Kỹ Thuật ML

**Tuần 1: Thiết Lập Cổng Chất Lượng CI/CD**
- Triển khai assertion gap walk-forward CV như kiểm thử CI/CD chặn
- Triển khai kiểm thử canary rò rỉ (gap=0 → MASE < 0.5 đánh cờ rò rỉ)
- Phải thực hiện trước khi bất kỳ phát triển ML nào bắt đầu — không thương lượng
- Chủ sở hữu: Kỹ Thuật ML + QA

---

### Giai Đoạn 1 — MVP (Tuần 3–6, 1 Kỹ Sư ML)
*Dựa trên ước tính của β, điều chỉnh tăng theo đánh giá thực tế của γ cho chất lượng dữ liệu điển hình*

| Thành Phần | Mục Tiêu Giao | Lịch Trình |
|-----------|---------------|-----------|
| Pipeline dữ liệu | 1 nguồn → TimescaleDB + đặc trưng SQL-based | Tuần 3–4 |
| Mô hình | Mô hình toàn cục LightGBM + walk-forward CV (có assertion gap) + cổng MASE | Tuần 4–5 |
| Phục vụ | Endpoint FastAPI, một mô hình | Tuần 5 |
| Baseline | So sánh StatsForecast AutoETS | Tuần 5 |
| Foundation model | Đường dẫn cold-start Chronos-tiny (thực thể < 60 quan sát) | Tuần 6 |
| **Mốc** | **Demo dự báo đầu tiên cho khách với MASE < 1.0 so với naive** | **Tuần 6** |

**Điều kiện chính:** Không Feast, không Kafka, không Spark, không Kubernetes, không BentoML trong MVP. Thêm thành phần chỉ khi quan sát thấy nút thắt thực tế.

---

### Giai Đoạn 2 — Production v1 (Tuần 7–24, 2 Kỹ Sư: 1 ML + 1 MLOps/DE)
*Ước tính 18 tuần của β điều chỉnh thành 18–24 tuần theo đánh giá thực tế của γ; Feast hoãn lại*

| Thành Phần | Mục Tiêu Giao | Công Sức |
|-----------|---------------|---------|
| Thu nạp đa nguồn | Great Expectations + TimescaleDB + Parquet/S3 | 3 tuần |
| Xây dựng đặc trưng | View SQL đúng thời điểm (Feast hoãn) | 2 tuần |
| Huấn luyện mô hình | LightGBM + TFT (sau khi xác nhận baseline LightGBM) + Optuna HPO | 3 tuần |
| Đầu ra xác suất | Wrapper conformal prediction cuộn + hiệu chuẩn PI + hiệu chuẩn lại hàng tuần | 1.5 tuần |
| Hòa hợp phân cấp | MinT với ma trận tổng có phiên bản + dự phòng WLS-structural | 2.5 tuần |
| MLflow | Theo dõi thí nghiệm + Model Registry + champion/challenger | 1 tuần |
| Phục vụ | FastAPI + batch DAG Airflow + Docker Compose → k8s (khi cần) | 2 tuần |
| Giám sát | Prometheus + Grafana + phát hiện drift Evidently AI + trigger huấn luyện lại | 2 tuần |
| Cold-start | Chronos-tiny + định tuyến độ trưởng thành thực thể (cold/warm/mature) | 1 tuần |
| Kiểm thử và QA | Unit, tích hợp, hồi quy mô hình, load test | 2 tuần |
| **Mốc** | **Khách doanh nghiệp đầu tiên trong sản xuất; MASE < 0.85, coverage PI 80% ở 78–82%** | **Tuần 24** |

---

### Giai Đoạn 3 — Nền Tảng Đầy Đủ (Tháng 7–12, 4 Kỹ Sư: 2 ML + 1 MLOps + 1 FE)
*Ước tính 37 tuần của β; có điều kiện dựa trên thành công Giai đoạn 2 và cơ sở khách doanh nghiệp đã xác nhận*

| Thành Phần | Mục Tiêu Giao | Công Sức |
|-----------|---------------|---------|
| Đa thuê bao | Cách ly schema + mô hình theo thuê bao + phân bổ chi phí | 4 tuần |
| Giới thiệu Feast | Chỉ khi truy xuất đặc trưng thời gian thực < 10ms là yêu cầu đã xác nhận | 3 tuần (spike trước) |
| Mô hình nâng cao | Fine-tuning TimesFM + Moirai + ensemble mô hình + tự chọn | 4 tuần |
| Spark cho batch | Chỉ khi số chuỗi > 50K (chuyển từ Dask) | 2 tuần |
| Giao diện kinh doanh | Bảng điều khiển Next.js: dự báo + giải thích SHAP + quy trình ghi đè chuyên viên hoạch định | 4 tuần |
| Tự huấn luyện lại | Huấn luyện lại theo drift + tự động triển khai canary | 3 tuần |
| Phục vụ GPU foundation model | Pod suy luận GPU cho Chronos/TimesFM ở quy mô doanh nghiệp | 2 tuần |
| Tài liệu và đào tạo | Hướng dẫn sử dụng, tài liệu API, đào tạo đội ngũ | 2 tuần |
| **Mốc** | **3 khách tham chiếu, ROI được ghi nhận, nền tảng sản xuất đa thuê bao** | **Tháng 12** |

---

## 7. Checklist Chất Lượng

### Xác Nhận Tiêu Chí Chấp Nhận Tầng 1

**Dr. Archon (α) — Báo Cáo Nghiên Cứu:**
- [x] Tất cả 10 khái niệm cốt lõi ghi nhận với công thức toán học
- [x] ≥12 bài báo chính được phân loại với venue và đóng góp
- [x] Danh mục thuật toán ≥13 thuật toán bao gồm ưu/nhược điểm
- [x] Mục SOTA 2024–2026 bao gồm foundation model (TimesFM, Chronos, Moirai, MOMENT)
- [x] 7 kết nối xuyên lĩnh vực được ghi nhận
- [x] Dòng thời gian tiến hóa đầy đủ từ 1927 đến 2025–2026
- [x] Câu hỏi mở và lỗ hổng nghiên cứu được xác định
- [x] Phân loại lĩnh vực với phân cấp cha/con

**Dr. Praxis (β) — Báo Cáo Kỹ Thuật:**
- [x] Ma trận quyết định tech stack 4 tầng với phương án thay thế và lý do
- [x] Kiến trúc pipeline end-to-end với sơ đồ ASCII
- [x] Sub-pipeline A (Huấn luyện) và Sub-pipeline B (Suy luận → Giám sát) được chỉ định
- [x] Hợp đồng dữ liệu giữa tất cả giai đoạn pipeline được định nghĩa
- [x] Ma trận xử lý lỗi (8 giai đoạn × 4 loại lỗi)
- [x] 3 mẫu code: walk-forward CV, suy luận foundation model, hòa hợp MinT
- [x] 2 ví dụ minh họa: bán lẻ (10K SKU) và logistics (15 cặp OD)
- [x] Ước tính công sức MVP (3 tuần) + Production v1 (18 tuần) + Nền Tảng Đầy Đủ (37 tuần)
- [x] 7 hạn chế đã biết với giải pháp được ghi nhận

**Dr. Sentinel (γ) — Báo Cáo Khả Thi:**
- [x] 4 thách thức với báo cáo nghiên cứu kèm đánh giá tin cậy CAO/TRUNG BÌNH
- [x] 5 thách thức với báo cáo kỹ thuật kèm đánh giá tin cậy CAO/TRUNG BÌNH
- [x] Chấm điểm khả thi 4 chiều: Kỹ thuật (8/10), Thị trường (7/10), Dữ liệu (6/10), Rủi ro (6/10)
- [x] Điểm có trọng số tổng: 6.90/10 — kết luận ĐẠT CÓ ĐIỀU KIỆN
- [x] 5 đối thủ được phân tích (Nixtla, AWS Forecast, Oracle, Palantir, Anaplan)
- [x] Top 5 rủi ro với xác suất, tác động, giảm thiểu, và chủ sở hữu
- [x] 3 điều kiện Go rõ ràng trước cam kết Production v1
- [x] Bước tiếp theo đề xuất với nhịp hàng tuần

### Xác Nhận Tiêu Chí Chấp Nhận Tầng 2

- [x] R-MLE: Cây quyết định chọn mô hình, checklist xây dựng đặc trưng, mẫu pipeline huấn luyện, metrics đánh giá với MASE là chính
- [x] R-DE: Mẫu thu nạp, framework quyết định lưu trữ, thách thức chất lượng dữ liệu (múi giờ, dữ liệu đến trễ, khoảng bất thường), mẫu phục vụ feature store
- [x] R-DA: Checklist EDA cho chuỗi thời gian, đóng khung bối cảnh kinh doanh, định nghĩa KPI, truyền đạt bất định cho bên liên quan không kỹ thuật
- [x] R-BE: Thiết kế REST API với as_of_date cho khả năng tái tạo, mẫu tác vụ async với webhook, chiến lược caching, mục tiêu độ trễ theo trường hợp sử dụng
- [x] R-DO: Các giai đoạn pipeline CI/CD với cổng thăng mô hình, chiến lược rollback, giám sát 3 tầng, tự động huấn luyện lại (theo lịch + theo sự kiện)
- [x] R-QA: Kim tự tháp kiểm thử, phương pháp backtesting, kiểm thử coverage khoảng dự đoán (78–82% cho PI danh nghĩa 80%), cổng chất lượng mô hình với ngưỡng
- [x] R-D06: Trường hợp sử dụng logistics (khối lượng vận chuyển, hoạch định năng lực, nhu cầu tuyến, bổ sung tồn kho), mẫu mùa vụ, nhu cầu bên liên quan, nguồn dữ liệu
- [x] R-SA: Kiến trúc tham chiếu end-to-end, mẫu tích hợp ERP/WMS, phân tích mua vs xây, ngưỡng khả năng mở rộng
- [x] R-FE: Loại biểu đồ (đường với dải tin cậy, phân rã, heatmap), UX ghi đè chuyên viên hoạch định, truyền đạt bất định cho người dùng không kỹ thuật, downsampling LTTB

### Mâu Thuẫn Đã Giải Quyết (từ Mục 3)
- [x] Phạm vi foundation model: "khoảnh khắc GPT" được giới hạn cho bối cảnh cold-start
- [x] ETS vs LightGBM: giải quyết bằng phân tách bối cảnh cuộc thi M4 vs M5
- [x] Coverage "đảm bảo" conformal: sửa thành "xấp xỉ" với lưu ý tính hoán đổi
- [x] MVP 3 vs 5 tuần: giải quyết là ước tính lạc quan vs thực tế, cả hai được công bố
- [x] MinT 1 vs 2.5 tuần: giải quyết là triển khai phân cấp tĩnh vs động

### Kết Luận Cuối Cùng Xác Nhận
- [x] ĐẠT CÓ ĐIỀU KIỆN — 6.90/10 — ba điều kiện tiên quyết phải đáp ứng trước đầu tư Production v1
- [x] Điều kiện 1: Khám phá khách hàng (5 phỏng vấn, số chuỗi / SLA / chủ quyền / WTP)
- [x] Điều kiện 2: Spike benchmark chi phí GPU (2 tuần, trước khóa kiến trúc)
- [x] Điều kiện 3: Cổng rò rỉ walk-forward CV triển khai như kiểm thử CI/CD chặn

---

## Bàn Giao cho Quản Lý

```
─────────────────────────────────────────────────────────────────
TỪ:   R-σ Ms. Scribe — Trưởng Phòng Tri Thức
ĐẾN:  Quản Lý / Trưởng Nền Tảng
VỀ:   B01 — Dự Báo & Chuỗi Thời Gian — BÁO CÁO CUỐI CÙNG HOÀN TẤT
NGÀY: 2026-03-30
─────────────────────────────────────────────────────────────────

Tất cả 4 đầu ra đã tạo:
  1. docs/reports/B01/final-report.md  (tài liệu này)
  2. data/baselines/B01-forecasting.json  (chiều sâu L3, tất cả trường bắt buộc)
  3. data/graph.json  (đã cập nhật — cạnh B01 đến I01, I02, I05, I06, I07 đã thêm)
  4. docs/memory/B01-learnings.md  (bài học pipeline cho module tương lai)

KẾT LUẬN: ĐẠT CÓ ĐIỀU KIỆN (6.90/10)

Ba điều kiện tiên quyết bắt buộc trước Production v1:
  1. Khám phá khách hàng (Tuần 1–2)
  2. Spike benchmark chi phí GPU (Tuần 2–3)
  3. Cổng rò rỉ walk-forward CV trong CI/CD (Tuần 1 của mọi công việc ML)

Các mục tổng hợp nghiêm trọng cao cần sự chú ý điều hành:
  - Ngôn ngữ "coverage đảm bảo" conformal phải được sửa trong tất cả tài liệu khách
  - Feast hoãn sang giai đoạn Nền Tảng Đầy Đủ — loại bỏ rủi ro timeline #1
  - Cửa sổ khác biệt foundation model là 12–24 tháng — cần 3 khách tham chiếu

TRẠNG THÁI: HOÀN TẤT — SẴN SÀNG CHO KÝ DUYỆT B01
TIẾP THEO:  Module B02 — Document Intelligence
─────────────────────────────────────────────────────────────────
```
