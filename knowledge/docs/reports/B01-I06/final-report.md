# Báo Cáo Matrix: B01-I06 — Dự Báo Khối Lượng Vận Chuyển cho Logistics
**Ngày:** 2026-04-03 | **Phiên bản:** 1.0 | **Tác nhân tổng hợp:** R-σ (Ms. Scribe)
**Nguồn:** R-α (intersection-report.md) × R-γ (feasibility-report.md) × B01-learnings.md × I06-learnings.md

---

## Tóm Tắt Điều Hành

- **Insight cốt lõi:** Dự báo khối lượng vận chuyển (Shipment Volume Forecasting) là ứng dụng AI có giá trị thực tế cao nhất trong nhóm B01 × I06, nhưng đây không phải một bài toán đơn — mà là một họ bài toán dự báo đa mục tiêu (shipment count, weight, CBM, revenue, route-level demand), mỗi mục tiêu phục vụ một quyết định vận hành khác nhau. Điểm khởi đầu thực tế nhất cho Smartlog là dự báo shipment count theo nhóm khách hàng × tuyến đường × tuần.
- **Điểm khả thi: 6.5/10** — Kỹ thuật đã chứng minh, ROI rõ ràng. Điểm bị kéo xuống bởi độ sẵn sàng dữ liệu I06 ở mức 4/10, đây là rào cản cấu trúc chính quyết định tier triển khai và khung thời gian thực hiện. Tier 1 MVP có thể hoàn thành trong 6–10 tuần; Tier 2 Production cần thêm 3–6 tháng sau đó.
- **Khuyến nghị pilot Smartlog:** Triển khai ngay Tier 1 MVP với Mondelez Vietnam làm khách hàng thí điểm đầu tiên — danh mục quà Tết, tuyến HCMC → Nam Bộ, horizon 7 ngày. Mục tiêu: WMAPE (Weighted Mean Absolute Percentage Error) < 30% trong 8–10 tuần. Thành công ở pilot này tạo case study thuyết phục để nhân rộng sang các khách hàng FMCG khác (Unilever, Nestlé distribution) và mở đường cho Tier 2.

---

## 1. Bài Toán Cụ Thể

### 1.1 Các Biến Mục Tiêu Cần Dự Báo

Logistics không chỉ có một bài toán dự báo. Smartlog cần xác định rõ biến mục tiêu (target variable) theo từng quyết định vận hành:

| Biến mục tiêu | Quyết định phục vụ | Người nhận kết quả |
|---|---|---|
| **Shipment count** (số lô hàng, đơn) | Lên lịch nhân sự hub, bố trí tài xế | Trưởng vận hành |
| **Weight (kg)** | Lập kế hoạch tải xe, năng lực linehaul | Dispatcher, planner |
| **Volume (CBM)** | Khu vực staging kho, lựa chọn loại xe | Giám sát kho |
| **Revenue (VND)** | Dòng tiền, tỷ lệ sử dụng hợp đồng | Tài chính, thương mại |
| **Route-level demand** | Phân bổ đội xe, tần suất linehaul | Network planning |

**Thứ tự triển khai khuyến nghị:** Bắt đầu với shipment count — tác động trực tiếp nhất đến lịch lao động và điều phối đội xe. Thêm weight_kg sau khi mô hình count ổn định. Revenue và CBM đưa vào giai đoạn sau khi xác nhận chất lượng dữ liệu khối lượng (thực tế tại nhiều 3PL Việt Nam, hơn 50% bản ghi CBM bị null hoặc là ước tính).

### 1.2 Ba Horizon Dự Báo và Kiến Trúc Mô Hình Tương Ứng

Logistics vận hành trên ba horizon lập kế hoạch hoàn toàn khác nhau, đòi hỏi kiến trúc mô hình riêng biệt:

| Horizon | Khung thời gian | Quyết định | Phương pháp mô hình |
|---|---|---|---|
| **Vận hành** | 1–7 ngày | Lịch tài xế, nhân sự hub, kế hoạch tải | ML tần suất cao (LightGBM + đặc trưng ngày trong tuần), phục vụ gần thời gian thực |
| **Chiến thuật** | 1–4 tuần | Thuê xe bổ sung, kích hoạt nhà thầu phụ | Ensemble LightGBM + thống kê, suy luận batch |
| **Chiến lược** | 1–3 tháng | Cam kết hợp đồng năng lực, điều chỉnh tuyến | Phân rã xu hướng + mùa vụ, mô hình kịch bản, planner overlay |

**Sai lầm phổ biến cần tránh:** Xây dựng một mô hình duy nhất phục vụ cả ba horizon. Cấu trúc lỗi khác nhau — dự báo vận hành phải tối thiểu hóa MAE trên các ngày cụ thể (rủi ro SLA); dự báo chiến lược phải nắm bắt xu hướng dài hạn mà không overfit theo nhiễu ngắn hạn.

### 1.3 Độ Phân Giải Dự Báo (Granularity)

Phân cấp dữ liệu logistics điển hình:

```
Tổng công ty
  └── Vùng (Bắc / Trung / Nam)
      └── Tỉnh / Thành phố
          └── Khách hàng (tài khoản shipper)
              └── Loại dịch vụ (express / standard / cold chain)
                  └── Tuyến OD (Origin-Destination lane)
                      └── Route (chuyến giao hàng cụ thể)
```

**Khuyến nghị thực tế cho Smartlog:** Bắt đầu ở độ phân giải **khách hàng × loại dịch vụ × tuần**. Chỉ phân giải xuống cấp tuyến đường khi mô hình tuần đạt WMAPE < 25%. Phân giải quá sớm sẽ phá vỡ độ ổn định của mô hình; phân giải quá muộn sẽ mất cơ hội khai thác giá trị vận hành.

### 1.4 Điều Hòa Phân Cấp (Hierarchical Reconciliation) trong Mạng Logistics

MinT (Minimum Trace) tiêu chuẩn — ghi nhận trong kiến thức nền B01 — áp dụng cho cấu trúc cây (tree hierarchy). Mạng logistics là **đồ thị có hướng**, không phải cây: một lô hàng từ HCMC đến Hà Nội có thể trung chuyển qua Đà Nẵng hoặc bay thẳng. Phương pháp FlowRec (arxiv 2505.03955, 2025) định nghĩa lại bài toán điều hòa dự báo như một bài toán tối ưu dòng mạng, cải thiện 3–40 lần so với MinT trên dữ liệu logistics. FlowRec là mục tiêu nâng cấp cho Tier 3 — không triển khai ở Tier 1 do yêu cầu đồ thị mạng có phiên bản ổn định.

---

## 2. Đặc Trưng Dữ Liệu Logistics (Domain Adaptation)

### 2.1 Sự Kiện Lịch Việt Nam — Không Có Trong Bộ Đặc Trưng B01 Tiêu Chuẩn

Các sự kiện sau **không thể xử lý bằng phân rã mùa vụ tiêu chuẩn** và yêu cầu feature engineering tường minh:

| Sự kiện | Tác động logistics | Cách xây dựng đặc trưng |
|---|---|---|
| **Tết Nguyên Đán** | Tắt hoạt động 5–7 ngày + đỉnh khối lượng 3–4x trong 7–10 ngày trước Tết | Đặc trưng đếm ngược Tết (days_until_tet, days_since_tet), hệ số mùa vụ nhân theo phân khúc khách hàng |
| **Double-day TikTok** (10/10, 11/11, 12/12) | Đỉnh 2–5x, tập trung trong 24–48 giờ, phụ thuộc mạnh vào danh mục hàng | Flag nhị phân + khối lượng trễ từ sự kiện cùng kỳ năm trước |
| **Mùa tựu trường** (Tháng 8–9) | Đỉnh vừa phải ở văn phòng phẩm, FMCG học đường | Đặc trưng mùa vụ có điều kiện theo danh mục |
| **Mùa bão** (Tháng 6–11) | Gián đoạn tuyến Miền Trung (Đà Nẵng, Huế, Quảng Nam) — khối lượng giảm rồi phục hồi | Flag đổ bộ bão theo tỉnh; hệ số phục hồi (trung bình lịch sử 1.3–1.8x tuần sau gián đoạn) |
| **Chu kỳ thu hoạch nông nghiệp** | Khách hàng agri-logistics: lúa (Tháng 12–1 Đồng bằng sông Cửu Long, Tháng 5–6 Miền Trung) | Lịch mùa vụ theo tỉnh, dự báo sản lượng từ dữ liệu Bộ NN&PTNT |

**Cảnh báo quan trọng về Tết:** Đỉnh trước Tết và sự sụp đổ sau Tết xảy ra trong một cửa sổ 14 ngày. Phân rã mùa vụ tuần tiêu chuẩn làm mịn hiệu ứng này, dẫn đến dự báo thấp hơn thực tế 40–60% ở giai đoạn đỉnh. Hiệu ứng Tết phải được mô hình hóa như một **thành phần cộng tách biệt** (kiểu Prophet) hoặc đặc trưng tường minh trong mô hình tree-based, không được để thuật toán tự học từ hạng mục mùa vụ chung.

### 2.2 Đặc Trưng Vận Hành Đặc Thù của Logistics

Các đặc trưng sau hiếm khi xuất hiện trong tài liệu dự báo thông thường nhưng mang tín hiệu giá trị cao cho mô hình ML logistics:

- **Tỷ lệ lấp đầy đội xe tuần trước:** Nếu đội xe chạy ở mức 95%+ lấp đầy, nhu cầu có thể bị ràng buộc bởi nguồn cung — số lô hàng thực tế quan sát được thấp hơn nhu cầu thực. Đây là phiên bản logistics của bài toán stock-out bias trong retail.
- **Tỷ lệ sử dụng khu vực staging kho:** Chỉ số dẫn đầu (leading indicator) cho đỉnh khối lượng — khu vực staging lấp đầy trước khi xe xuất phát.
- **Quy mô danh sách tài xế:** Ràng buộc phía cung; ảnh hưởng đến khối lượng thực sự có thể phục vụ.
- **Chỉ số mật độ tuyến đường:** Số điểm giao hàng hoạt động mỗi tuyến mỗi ngày — giảm khi khách hàng mới onboard hoặc khách hàng cũ rời đi.
- **Tỷ lệ đặt trước nhà thầu phụ:** Phần trăm năng lực xe nhà thầu đã đặt trước — tỷ lệ cao báo hiệu đỉnh khối lượng sắp tới.

### 2.3 Tín Hiệu Bên Ngoài (External Signals)

| Tín hiệu | Nguồn | Độ trễ | Giá trị |
|---|---|---|---|
| Xu hướng GMV thương mại điện tử | VECOM, khối lượng seller Shopee/Lazada (proxy) | 1–4 tuần | Chỉ số dẫn đầu cho khối lượng bưu kiện B2C |
| Số lượng vận đơn thông quan | Hải quan Việt Nam (dữ liệu công khai) | 1–2 tuần | Chỉ số dẫn đầu cho hàng hóa xuyên biên giới và công nghiệp |
| Cước vận tải đường bộ (spot rate VND/km) | Aggregator thị trường spot; giá thầu app tài xế | Thời gian thực | Chỉ báo áp lực nhu cầu; cước cao báo trước đỉnh khối lượng |
| Chỉ số sản xuất công nghiệp (IIP) | Tổng cục Thống kê (GSO) Việt Nam, hàng tháng | 4–6 tuần | Chỉ số dẫn đầu cho khách hàng 3PL công nghiệp |
| Dự báo thời tiết | API Trung tâm Khí tượng Thủy văn Quốc gia (NCHMF) | 3–7 ngày | Tín hiệu gián đoạn bão/lũ cho tuyến Miền Trung |

### 2.4 Đặc Trưng Hành Vi Khách Hàng theo Phân Khúc Ngành

**Đặc trưng có giá trị cải thiện cao nhất** trong dự báo logistics là **phân khúc ngành của khách hàng** — vì nó quyết định hoàn toàn hình dạng mẫu nhu cầu:

| Loại khách hàng | Mẫu nhu cầu | Đặc trưng chính |
|---|---|---|
| **FMCG** (kiểu Mondelez, Unilever) | Mùa vụ tuần, đỉnh theo khuyến mãi, hiệu ứng Tết mạnh | Lịch khuyến mãi, phân kênh MT/GT, đếm ngược Tết |
| **Công nghiệp / B2B** (PTSC, Baconco) | Không đều, theo dự án, theo lệnh mua hàng | Ngày phát hành PO, giai đoạn dự án, chu kỳ quý |
| **Thương mại điện tử** (TikTok Shop seller) | Theo sự kiện platform, nhu cầu viral, cực kỳ biến động | Lịch sự kiện platform, xu hướng GMV seller, tỷ lệ hoàn hàng |
| **Cold chain / Dược phẩm** | Ổn định, ràng buộc tuân thủ | Sự kiện vượt nhiệt độ, chu kỳ nộp hồ sơ pháp lý |

Xây dựng một mô hình chung cho tất cả phân khúc khách hàng sẽ tạo ra mô hình trung bình cho tất cả. Mô hình theo phân khúc hoặc mô hình với đặc trưng tương tác phân khúc khách hàng mạnh vượt trội hơn 15–25% WMAPE so với mô hình tổng quát trong bối cảnh logistics.

---

## 3. Kiến Trúc Giải Pháp 3 Tầng

### Tier 1 — MVP: Pilot 1 Khách Hàng, 1 Danh Mục

**Mục tiêu:** Chứng minh AI dự báo vượt baseline thủ công/naive với một khách hàng trên một cụm tuyến. Tạo câu chuyện thành công. Xây dựng niềm tin nội bộ.

**Tech Stack:**
- **Mô hình chính:** LightGBM với quantile regression (đầu ra P10/P50/P90)
- **Thành phần Tết:** Prophet additive seasonality layer, áp dụng như post-processing correction lên đầu ra LightGBM trong cửa sổ Tết (Ngày T-14 đến T+3)
- **Tuyến thưa thớt:** Croston-SBA qua thư viện Nixtla statsforecast, áp dụng cho tuyến có >40% ngày zero
- **Bộ đặc trưng:** Ngày trong tuần, tuần trong năm, đếm ngược Tết, flag cuối tháng, phân khúc khách hàng, loại dịch vụ, moving average 4 tuần, độ lệch chuẩn 4 tuần (đặc trưng biến động)
- **Đầu ra:** Google Sheets / Excel — dự báo 7 ngày phía trước, cập nhật hàng tuần bằng script Python chạy thủ công
- **Hạ tầng:** Môi trường Python đơn trên laptop analyst hoặc VM cloud cơ bản — không cần orchestration, không cần serving layer

**Timeline: 6–10 tuần**

| Tuần | Hoạt động |
|---|---|
| 1–3 | Trích xuất dữ liệu TMS, làm sạch, EDA, kiểm kê tuyến |
| 4–5 | Huấn luyện LightGBM MVP, đo WMAPE ban đầu |
| 6–7 | Tích hợp thành phần Tết, routing Croston cho tuyến thưa |
| 8–10 | Vận hành: giao dự báo tuần cho trưởng vận hành, thu thập phản hồi |

**Chỉ số thành công:** WMAPE < 30% trên horizon 7 ngày cho 5 tuyến có khối lượng cao nhất của khách hàng pilot.

---

### Tier 2 — Production: Pipeline Tự Động Đa Khách Hàng

**Mục tiêu:** Mở rộng MVP lên 3+ khách hàng với pipeline tuần tự động. Đạt mục tiêu WMAPE để biện minh cho mức giá thương mại.

**Tech Stack:**
- **Mô hình chính:** LightGBM cho tuyến lượng cao (>20 lô/tuần)
- **Tuyến trung bình:** DeepAR (mô hình chung đa tuyến, SageMaker hosted) — đưa vào tier này vì chi phí GPU đã được biện minh trên 3+ khách hàng
- **Tuyến thưa:** Croston/TSB qua Nixtla (mang từ Tier 1)
- **Pipeline:** Apache Airflow DAG — trigger hàng tuần, trích xuất đặc trưng tự động từ TMS, suy luận mô hình, đầu ra lên dashboard khách hàng
- **Feature store:** SQL views trên PostgreSQL (không dùng Feast — defer Feast đến Tier 3 theo hướng dẫn B01-learnings.md)
- **Đầu ra:** Dashboard khách hàng (Metabase hoặc Superset) + cảnh báo email khi dự báo vượt 20% trên mức trung bình

**Timeline:** 3–6 tháng từ khi hoàn thành Tier 1 MVP

**Chỉ số thành công:**
- WMAPE < 20% trên horizon 7 ngày
- WMAPE < 25% trên horizon 4 tuần
- Pipeline chạy tự động với < 2 giờ bảo trì hàng tuần

---

### Tier 3 — Platform: SaaS Đa Người Thuê

**Mục tiêu:** Triển khai dịch vụ dự báo cấp platform hỗ trợ nhiều khách hàng logistics với tự động tái huấn luyện, phát hiện drift, và điều hòa phân cấp.

**Tech Stack:**
- **Foundation model:** Chronos-2 fine-tuned trên dữ liệu logistics tích lũy của Smartlog
- **Điều hòa:** MinT trên tree hierarchy cho tổng hợp cấp tỉnh; nâng cấp FlowRec cho mạng trung chuyển hub
- **Feature store:** Feast (đưa vào đây, sau khi spike proof-of-concept xác nhận)
- **Tái huấn luyện:** Tự động hàng tháng với walk-forward cross-validation gate
- **Phát hiện drift:** Tích hợp Evidently AI (dùng chung hạ tầng với module B07 Anomaly Detection)
- **Đa người thuê:** Versioning mô hình theo khách hàng, pipeline đặc trưng riêng biệt, hạ tầng serving dùng chung

**Timeline:** 12+ tháng từ khi hoàn thành Tier 2

**Chỉ số thành công:**
- WMAPE < 15% trên horizon 7 ngày cho tuyến Tier 1 (lượng cao)
- Tái huấn luyện tự động không cần can thiệp thủ công
- Tỷ lệ cảnh báo drift false positive < 5%/tháng

---

## 4. KPI & Benchmark

### 4.1 Chỉ Số Chính: WMAPE

**Tại sao WMAPE, không phải MAPE:**

MAPE tiêu chuẩn thất bại trong logistics theo hai cách: (1) Tuyến zero-volume: MAPE không xác định khi actual = 0; (2) Đỉnh khuyến mãi: một đỉnh 10x trên tuyến khối lượng thấp tạo ra giá trị MAPE cực đoan làm méo mó chỉ số tổng hợp.

WMAPE giải quyết cả hai bằng cách gia trọng lỗi theo khối lượng thực tế:

```
WMAPE = Σ|actual - forecast| / Σ|actual|
```

Các tuyến lượng cao chiếm ưu thế trong chỉ số — phù hợp với giá trị kinh doanh (lỗi 10% trên tuyến linehaul HCMC→Hà Nội tốn kém hơn nhiều so với lỗi 40% trên tuyến nông thôn tier 3).

**Chỉ số bổ sung:**
- **Bias (sai số có hướng):** Dự báo thiếu liên tục là lỗi vận hành nghiêm trọng hơn dự báo thừa — gây vi phạm SLA không thể phục hồi. Theo dõi bias định hướng riêng biệt.
- **Hiệu chỉnh phân vị (cho mô hình xác suất):** Dự báo P90 phải bao hàm nhu cầu thực tế 90% thời gian. Dùng reliability diagrams để xác minh.
- **Tỷ lệ bắt trúng sự kiện khuyến mãi:** % sự kiện Tết/double-day có dự báo trong ±20% so với thực tế.

### 4.2 Benchmark WMAPE Logistics Việt Nam

| Dải WMAPE | Đánh giá | Ngữ cảnh |
|---|---|---|
| **< 10%** | Xuất sắc — đẳng cấp thế giới | Đạt được bởi top CEP players (DHL, Amazon Logistics) trên tuyến trưởng thành lượng cao |
| **10–15%** | Tốt — sẵn sàng sản xuất | Mục tiêu cho tuyến Tier 1 của Smartlog (khách hàng lớn, tuyến thường xuyên) |
| **15–25%** | Chấp nhận được — tạo giá trị vận hành | Dải điển hình cho mô hình production 3PL Việt Nam trên horizon chiến thuật |
| **25–35%** | Biên giới — cần override thủ công | Phổ biến trong 6 tháng đầu sau triển khai; chấp nhận được cho tuyến Tier 3 thưa thớt |
| **> 35%** | Không chấp nhận — không tốt hơn baseline naive | Cần xem xét lại mô hình; kiểm tra chất lượng dữ liệu trước |

**Baseline cần vượt qua:**
- Dự báo naive (tuần trước): WMAPE thường 35–55% trong logistics (cao do biến động khuyến mãi)
- Moving average 4 tuần đơn giản: WMAPE thường 28–42%
- Ước tính thủ công của dispatcher: WMAPE thường 25–40%
- Mục tiêu AI/ML: WMAPE 15–25% cho horizon 7 ngày là dải cải thiện được ghi nhận từ triển khai AI trong 3PL

### 4.3 KPI Kinh Doanh — Chuyển Độ Chính Xác Dự Báo thành Giá Trị

| Cải thiện độ chính xác dự báo | Tác động KPI kinh doanh | Lượng hóa |
|---|---|---|
| Giảm WMAPE từ 35% → 20% | **Cải thiện tỷ lệ sử dụng năng lực** | Giảm 5–10% chuyến xe rỗng; ở mức VND 1.5–3M/xe-ngày, phục hồi biên lợi nhuận đáng kể |
| Dự báo đỉnh Tết trong ±15% | **Giảm chi phí lao động overtime** | Tránh phụ phí nhân sự khẩn cấp (1.5–2x lương cơ bản); giảm chi phí lao động giai đoạn Tết 15–25% |
| Tỷ lệ bắt trúng dự báo 7 ngày > 80% | **Cải thiện tỷ lệ giao đúng hạn OTD** | Bố trí nhân sự chủ động giúp tăng OTD 3–8 điểm phần trăm |
| Tín hiệu capacity gap hoạt động | **Giảm vi phạm SLA** | Mỗi lần tránh vi phạm SLA tiết kiệm 1–3% giá trị lô hàng tiền phạt |
| Demand shaping được kích hoạt | **Tăng tỷ lệ sử dụng đội xe** | Cải thiện 5–12% tỷ lệ sử dụng tài sản, giảm nhu cầu thuê nhà thầu phụ phí cao |

---

## 5. ROI & Khả Thi

### 5.1 Ước Tính ROI Năm 1 (3PL Quy Mô Smartlog)

**Giả định:** ~50,000 lô hàng/tháng, 30–80 xe tự có/thuê, chi phí xe-ngày bình quân VND 2,500,000, WMAPE cải thiện từ 40% → 20%.

| Hạng mục tác động | VND/tháng | VND/năm |
|---|---|---|
| Tỷ lệ sử dụng năng lực (giảm xe rỗng) | 137,500,000 | 1,650,000,000 |
| Giảm chi phí lao động overtime | 20,000,000 | 240,000,000 |
| Tránh tiền phạt vi phạm SLA | 75,000,000 | 900,000,000 |
| Tránh phí premium nhà thầu phụ | 24,000,000 | 288,000,000 |
| **Tổng lợi ích** | **256,500,000** | **~3,078,000,000** |

**Chi phí triển khai Year 1:**
- Nhân lực: 2–3 FTE × 9 tháng = VND 600,000,000–900,000,000
- Hạ tầng (AWS/GCP Tier 2): VND 30,000,000–60,000,000/năm
- **Tổng đầu tư Year 1: VND 700,000,000–1,000,000,000**

**Thời gian hoàn vốn: 6–9 tháng** từ khi Tier 2 đi vào sản xuất.
**ROI Year 1: ~200–350%** tùy theo hiệu quả vận hành thực tế được nắm bắt.

**Độ tin cậy: MEDIUM** — chính xác về mặt cỡ độ lớn; con số chính xác cần kiểm tra với dữ liệu vận hành thực tế của Smartlog (chi phí xe-ngày, chi phí overtime, điều khoản phạt SLA theo hợp đồng khách hàng).

### 5.2 Ràng Buộc Chính: Sẵn Sàng Dữ Liệu

Điểm sẵn sàng dữ liệu I06 ở mức **4/10** phản ánh các khoảng cách cấu trúc cụ thể:

| Khoảng cách dữ liệu | Tác động đến dự báo B01 |
|---|---|
| Không có data lake thống nhất — dữ liệu trong TMS, spreadsheet, app tài xế | Feature engineering yêu cầu 2–4 tuần ETL trước khi bắt đầu xây dựng mô hình |
| Chuẩn hóa địa chỉ chưa hoàn thiện | Định nghĩa tuyến OD không ổn định — tổng hợp cấp tỉnh là độ phân giải đáng tin cậy duy nhất ở MVP |
| Khoảng trống GPS và timestamp nhập thủ công | Đặc trưng vận hành (tỷ lệ lấp đầy xe, sử dụng staging) không đáng tin — defer sang Tier 2 |
| Thiếu dữ liệu hành trình chiều về | Dự báo weight/CBM không đáng tin — bắt đầu chỉ với shipment count |
| Khoảng trống số hóa tài liệu | Đặc trưng lịch khuyến mãi phải lấy thủ công từ khách hàng ở MVP |

**4/10 KHÔNG có nghĩa là dữ liệu không phù hợp cho dự báo.** 3PL Việt Nam có hồ sơ giao dịch lô hàng — họ không bắt đầu từ zero. Các khoảng cách nằm ở dữ liệu đặc trưng vận hành bổ sung, không phải bảng fact lô hàng cốt lõi. Dự báo khả thi tối thiểu có thể xây dựng chỉ từ lịch sử TMS.

### 5.3 Rủi Ro Cần Chú Ý

**Rủi ro over-engineering:** Khuyến cáo DeepAR + Feast + Airflow + probabilistic quantile serving cho khách hàng có người ra quyết định nhìn whiteboard mỗi sáng là sai lầm nghiêm trọng. Áp dụng cứng nguyên tắc:
- Đầu ra Tier 1 phải là CSV hoặc Google Sheet — không API serving, không dashboard
- Không GPU trước khi Tier 2 được xác nhận
- DeepAR chỉ ở Tier 2; FlowRec chỉ ở Tier 3

---

## 6. Kế Hoạch Pilot Smartlog

### 6.1 Lựa Chọn Khách Hàng Pilot: Mondelez Vietnam

**Khách hàng pilot đầu tiên được khuyến nghị: Mondelez Vietnam**

**Lý do Mondelez là lựa chọn đúng:**
- Mẫu nhu cầu FMCG là dạng dễ xử lý nhất bằng ML trong danh mục khách hàng logistics — mùa vụ tuần, chu kỳ Tết mạnh, đỉnh khuyến mãi đều được LightGBM + Prophet mô hình hóa tốt
- Bài toán phân phối 200K điểm bán lẻ của Mondelez Vietnam tạo mật độ giá trị dự báo cao
- Khách hàng FMCG quen thuộc với dự báo nhu cầu từ hoạt động lập kế hoạch supply chain của họ — họ hiểu khái niệm và có thể cung cấp lịch khuyến mãi (đặc trưng đầu vào quan trọng)
- Đỉnh SKU quà Tết Mondelez (3–5x baseline) là bài toán cụ thể, rõ ràng mà dự báo AI thành công có thể chứng minh cải thiện
- Thành công với Mondelez tạo case study thuyết phục các khách hàng FMCG khác (Unilever, Nestlé distribution)

**Tránh làm pilot đầu với:** Baconco (nông nghiệp, lumpy — phức tạp hơn), PTSC (theo dự án, công cụ sai), khách hàng SME thương mại điện tử (quá biến động, cần API platform).

### 6.2 Phạm Vi Pilot

| Yếu tố | Chi tiết |
|---|---|
| **Khách hàng** | Mondelez Vietnam (FMCG, Smartlog hiện đang phục vụ) |
| **Phạm vi** | 1 danh mục: hàng quà Tết (bánh quy/chocolate gift pack) — đỉnh Tết cao nhất, mẫu mùa vụ rõ ràng nhất |
| **Tuyến** | HCMC Distribution Center → Nam Bộ GT (general trade) channels — lượng cao nhất, mẫu giao hàng dự đoán được nhất |
| **Horizon dự báo** | 7 ngày rolling, cập nhật hàng tuần |
| **Đầu ra** | Bảng dự báo tuần trong Google Sheets chia sẻ với trưởng vận hành Smartlog và liên hệ supply chain Mondelez |
| **Thời gian** | **8 tuần** |
| **Tiêu chí thành công** | WMAPE < 30% trên horizon 7 ngày |

### 6.3 Định Giá Pilot

**Mô hình khuyến nghị:** Platform fee phẳng trong giai đoạn pilot.

| Giai đoạn | Cấu trúc | Mức giá |
|---|---|---|
| Pilot (3–6 tháng đầu) | Flat fee platform | VND 15,000,000–25,000,000/tháng |
| Sau pilot (Tier 2 thương mại) | Per-lane pricing | VND 500,000–2,000,000/tuyến OD hoạt động/tháng |

**Lý do:** Trong MVP, số lượng tuyến và chi phí làm sạch dữ liệu cao so với độ phức tạp mô hình. Platform fee phẳng bao gồm chi phí triển khai. Khi pipeline ổn định và khách hàng thấy giá trị, định giá per-lane căn chỉnh doanh thu theo tăng trưởng mạng.

### 6.4 Điều Kiện Tiên Quyết Trước Khi Bắt Đầu Dự Án

- [ ] Kiểm toán chất lượng dữ liệu 2 tuần trên dữ liệu TMS Smartlog cho tài khoản Mondelez
- [ ] Xác nhận có thể trích xuất tối thiểu 12 tháng lịch sử lô hàng sạch
- [ ] Xác định analyst vận hành logistics nội bộ Smartlog làm đối tác domain (không tùy chọn)
- [ ] Xác nhận có ít nhất một chu kỳ Tết đầy đủ trong dữ liệu huấn luyện
- [ ] Ngân sách VND 700,000,000–1,000,000,000 cho triển khai 9 tháng Tier 1 + Tier 2

---

## 7. Rủi Ro Chính

### 7.1 Rủi Ro Khởi Đầu Lạnh Tết (Tet Cold-Start) — NGHIÊM TRỌNG

**Rủi ro:** Nếu một khách hàng có ít hơn 2 năm dữ liệu lô hàng với Smartlog, tập huấn luyện chứa nhiều nhất một chu kỳ Tết — có thể không có. Mô hình huấn luyện không có chu kỳ Tết đầy đủ **không thể dự báo đáng tin cậy cho giai đoạn Tết.** Phân rã mùa vụ tiêu chuẩn sẽ thấp hơn thực tế 40–60%.

**Biện pháp giảm nhẹ (xếp theo độ tin cậy):**
1. Yêu cầu khách hàng mới cung cấp 24 tháng dữ liệu từ nhà vận chuyển trước — đây là giải pháp thương mại, không phải kỹ thuật
2. Hệ số nhân Tết từ khách hàng tương tự cùng phân khúc ngành — giả định có hiệu chỉnh
3. Học trong ngữ cảnh Chronos-2 từ các chuỗi logistics tương tự — tốt hơn không có gì

**Đánh giá rủi ro: CAO** nếu khách hàng có < 2 năm dữ liệu. TRUNG BÌNH nếu khách hàng cung cấp lịch sử từ nhà vận chuyển trước.

### 7.2 Rủi Ro Tuyến Thưa Thớt — CAO cho Tuyến Nông Thôn/Tier 3

**Rủi ro:** Nhiều cặp OD trong mạng 3PL Việt Nam có nhu cầu gián đoạn — zero lô hàng trong 50–70% ngày. Mô hình LightGBM tiêu chuẩn huấn luyện trên mục tiêu WMAPE hoặc MAE sẽ dự báo gần zero cho các tuyến này một cách có hệ thống.

**Biện pháp giảm nhẹ:**
- Triển khai Croston/TSB từ thư viện Nixtla statsforecast làm mô hình tuyến thưa tiêu chuẩn
- Định nghĩa ngưỡng tuyến thưa: nếu tuyến có >40% ngày zero trong 90 ngày vừa qua, route về Croston; ngược lại về LightGBM
- Không cố cải thiện độ chính xác tuyến thưa bằng mô hình phức tạp hơn (DeepAR, N-BEATS) ở Tier 1

**Đánh giá rủi ro: TRUNG BÌNH** — có thể quản lý với routing mô hình tường minh

### 7.3 Rủi Ro Chất Lượng Dữ Liệu — CAO trước khi làm sạch

| Vấn đề chất lượng dữ liệu | Xác suất xảy ra | Tác động | Biện pháp |
|---|---|---|---|
| Đơn đã hủy trong xuất thô TMS | CAO (>70% 3PL) | Tín hiệu nhu cầu phồng 5–15% | Filter is_cancelled = TRUE trước huấn luyện |
| Khoảng trống GPS tuyến nông thôn | CAO | Đặc trưng vận hành không đáng tin | Defer đặc trưng GPS sang Tier 2 |
| Nhập timestamp thủ công (trễ 2–4 giờ) | CAO | Méo mẫu ngày trong tuần | Dùng timestamp quét barcode đầu tiên tại điểm đến |
| OD đếm đôi do trung chuyển hub | TRUNG BÌNH | Thổi phồng khối lượng cặp OD | Xây lớp chuẩn hóa OD dùng bản đồ hub transit |
| Suy giảm chất lượng nhập liệu dịp Tết | TRUNG BÌNH | Tỷ lệ lỗi cao nhất trong giai đoạn lập kế hoạch quan trọng nhất | Flag rõ cửa sổ Tết; áp dụng Huber loss trong giai đoạn Tết |

**Budget 2–4 tuần làm sạch dữ liệu chuyên dụng trước khi huấn luyện mô hình. Không bỏ qua bước này để đẩy nhanh timeline.**

### 7.4 Rủi Ro Kháng Cự Từ Người Dùng — Khoảng Cách Niềm Tin Trưởng Vận Hành

**Rủi ro:** Trưởng vận hành logistics tại 3PL Việt Nam đã xây dựng hệ thống heuristic qua nhiều năm. Mô hình AI đạt WMAPE 22% vẫn có thể bị override 40–60% thời gian nếu trưởng vận hành không tin tưởng, triệt tiêu giá trị vận hành của khoản đầu tư.

**Chiến lược giảm thiểu:**
1. **Explainability trước tiên:** Dùng SHAP values từ LightGBM để cho trưởng vận hành thấy chính xác tại sao mô hình dự báo lượng cao tuần tới — "vì Mondelez luôn giao 20–30% trên mức trung bình vào thứ Ba đầu tiên sau cuối tháng"
2. **Theo dõi kết quả override thủ công:** Mỗi lần trưởng vận hành override mô hình và mô hình đúng, ghi lại. Sau 8 tuần, trình bày độ chính xác override vs. độ chính xác mô hình
3. **Không thay thế — bổ sung:** Định vị mô hình là "kinh nghiệm của bạn + dữ liệu". Loại bỏ nhận thức thay thế
4. **Thắng tuần đầu tiên:** Đảm bảo dự báo vận hành 7 ngày đầu tiên rõ ràng tốt hơn ước tính của trưởng vận hành ít nhất 3/7 ngày. Bắt đầu pilot trong tuần "bình thường" — không phải tuần lễ, không phải tuần khuyến mãi

---

## Kết Luận

Matrix Node B01-I06 đại diện cho một cơ hội AI có giá trị thực tế cao và rõ ràng cho Smartlog. Kỹ thuật đã được chứng minh. ROI có thể lượng hóa. Con đường triển khai 3 tầng đã được xác định.

**Quyết định được khuyến nghị: Tiến hành Tier 1 MVP. Bắt đầu với pilot Mondelez Vietnam. Cửa sổ ngân sách mục tiêu: Tháng 10–12 để phê duyệt thương mại.**

Khoản đầu tư duy nhất nhất định phải thực hiện trước: kiểm toán chất lượng dữ liệu 2 tuần trên dữ liệu TMS Smartlog cho tài khoản Mondelez — kết quả kiểm toán này xác định timeline và phạm vi thực tế hơn bất kỳ tài liệu kế hoạch nào.

---

*Báo cáo tổng hợp bởi R-σ (Ms. Scribe) | MAESTRO Knowledge Graph Platform | Matrix Node B01 × I06*
*Nguồn: R-α (intersection-report.md) | R-γ (feasibility-report.md) | B01-learnings.md | I06-learnings.md*
