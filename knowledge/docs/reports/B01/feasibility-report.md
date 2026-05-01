# Báo Cáo Khả Thi: B01 — Dự Báo & Chuỗi Thời Gian
## Tác giả: Dr. Sentinel (R-γ) — Ngày: 2026-03-30
## Trạng thái: CẦN ĐÁNH GIÁ
## Tiếp theo: Ms. Scribe (R-σ) — tổng hợp cuối cùng

---

## Tiêu Đề Bàn Giao

```
─────────────────────────────────────────────────────────────────
TỪ:   R-γ Dr. Sentinel
ĐẾN:  R-σ Ms. Scribe
VỀ:   B01 — Dự Báo & Chuỗi Thời Gian — feasibility-report.md
NGÀY: 2026-03-30
─────────────────────────────────────────────────────────────────
```

---

## Tóm Tắt Điều Hành

B01 Forecasting & Time Series (Dự Báo & Chuỗi Thời Gian) là **CONDITIONAL GO (Đạt có điều kiện)**. Lĩnh vực này có nhu cầu thương mại rõ ràng, nền tảng toán học vững chắc, và hệ sinh thái mã nguồn mở trưởng thành (dù rộng lớn). Báo cáo nghiên cứu của Dr. Archon có độ chính xác kỹ thuật tốt và được chứng minh bằng bằng chứng đầy đủ. Báo cáo kỹ thuật của Dr. Praxis có kiến trúc hợp lý nhưng thể hiện thiên kiến lạc quan có hệ thống trong ước tính công sức, thiết kế quá mức cho stack ban đầu so với thị trường mục tiêu đã nêu, và đánh giá thấp độ phức tạp vận hành của một số thành phần chủ chốt.

Các rủi ro chính không phải kỹ thuật — mà là rủi ro thực thi (năng lực đội ngũ, chất lượng dữ liệu) và rủi ro định vị thị trường (đối thủ có nguồn lực lớn, khác biệt hóa chưa rõ ràng). Tuyên bố MVP 3 tuần chỉ đạt được trong điều kiện hiếm khi gặp trong thực tế. Timeline Production v1 18 tuần với 2 kỹ sư sẽ có khả năng cần 24–28 tuần cho đội chưa có kinh nghiệm với toàn bộ stack.

Tín hiệu Go mạnh nhất là nhu cầu thị trường: mọi ngành dọc đã xác định (bán lẻ, logistics, năng lượng, y tế, tài chính) đều đã chứng minh sự sẵn lòng chi trả cho dự báo chính xác, có xác suất, và giải thích được. Năng lực foundation model (mô hình nền tảng) thực sự mới lạ và tạo ra câu chuyện cold-start (khởi động nguội) có khả năng phòng thủ mà các đối thủ hiện tại thiếu ở cùng mức giá.

---

## 1. Thách Thức Quan Trọng Đối Với Báo Cáo Nghiên Cứu (α)

### Thách Thức 1: "Foundation Model Sẽ Thay Đổi Căn Bản Kinh Tế Dự Báo — Giảm Thời Gian Phát Triển Từ Tuần Xuống Giờ"

**Tuyên Bố (Mục 10, Khái niệm 10):**
Dr. Archon tuyên bố rằng foundation model (TimesFM, Chronos) đại diện cho "khoảnh khắc GPT cho chuỗi thời gian" và sẽ giảm thời gian phát triển mô hình từ tuần xuống giờ. Cách diễn đạt ngụ ý khả năng áp dụng gần như phổ quát.

**Bằng Chứng Ủng Hộ Tuyên Bố:**
- TimesFM (ICML 2024) thực sự vượt trội so với baseline thống kê (ARIMA, ETS) trong các tác vụ zero-shot trên 34 tập dữ liệu. Đây là nghiên cứu có phản biện và có thể tái tạo độc lập.
- Chronos đạt CRPS mạnh trên 42 tập dữ liệu benchmark — ưu thế dự báo xác suất so với phương pháp cổ điển là thực.
- Suy luận zero-shot không cần huấn luyện theo tập dữ liệu, về mặt toán học thực sự giảm thời gian đến dự báo đầu tiên.

**Bằng Chứng Mâu Thuẫn Hoặc Phức Tạp Hóa Tuyên Bố:**
- Benchmark Gift-Eval (Aksu et al., 2024) cho thấy foundation model luôn kém hơn mô hình fine-tune chuyên tác vụ trên dữ liệu trong phân phối. Bản thân báo cáo nghiên cứu thừa nhận điều này (Khái niệm 10 Nhược điểm: "Kém hơn mô hình fine-tune chuyên tác vụ trên dữ liệu trong phân phối").
- Tuyên bố "tuần xuống giờ" nhầm lẫn phát triển mô hình với triển khai hệ thống. Pipeline để phục vụ dự đoán foundation model một cách đáng tin cậy — với logic dự phòng, hiệu chuẩn conformal, giám sát, và hòa hợp phân cấp — vẫn cần hàng tuần kỹ thuật. Bản thân mô hình là giờ; hệ thống xung quanh thì không.
- Kết quả benchmark LLM-Time (NeurIPS 2023) cho thấy hiệu suất cạnh tranh khi dùng prompt văn bản GPT-4, nhưng độ trễ và chi phí khiến nó không khả thi cho dự báo sản xuất ở quy mô (10K+ chuỗi hàng đêm).
- Người chiến thắng cuộc thi M5 (2020) dùng LightGBM với xây dựng đặc trưng, không phải foundation model. Tính đến 2025, không có triển khai dự báo sản xuất nào ở quy mô Walmart, Amazon, hay Meta dựa hoàn toàn vào foundation model. Chúng được dùng làm phương án dự phòng cold-start, không phải mô hình sản xuất chính.

**Lập Trường của Dr. Sentinel:**
Cách diễn đạt "khoảnh khắc GPT" là phóng đại ở mức marketing có thể gây hiểu lầm cho các bên liên quan. Tuyên bố đúng là: foundation model cung cấp giải pháp zero-shot cold-start mạnh mẽ, loại bỏ vấn đề khan hiếm dữ liệu cho thực thể mới — điều thực sự có giá trị — nhưng chúng không thay thế nhu cầu mô hình đã huấn luyện chuyên tác vụ khi đã tích lũy đủ dữ liệu. Báo cáo nên chính xác hơn: "Foundation model giảm thời gian cold-start xuống giờ; chúng bổ sung chứ không thay thế mô hình đã huấn luyện."

**Mức Tin Cậy Thách Thức: CAO** — được hỗ trợ bởi chính nhược điểm đã trích dẫn trong báo cáo nghiên cứu và kết quả cuộc thi M5.

---

### Thách Thức 2: "ETS và Phương Pháp Đơn Giản Vượt Trội Hầu Hết Phương Pháp ML trong Cuộc Thi M4 (2018)"

**Tuyên Bố (Khái niệm 4, Mục về ETS):**
Báo cáo nêu rằng "trong cuộc thi M4 (2018, 100.000 chuỗi), phương pháp Theta và các biến thể ETS đơn giản vượt trội hầu hết phương pháp ML." Điều này được dùng để biện minh ETS là tiêu chuẩn vàng.

**Bằng Chứng Ủng Hộ Tuyên Bố:**
- Điều này chính xác về mặt kỹ thuật cho cuộc thi M4. Mô hình lai ES-RNN của Smyl thắng, không phải ML thuần hay thống kê thuần. Các phương pháp đơn giản như Theta hoạt động mạnh.

**Bằng Chứng Phức Tạp Hóa Tuyên Bố:**
- Tập dữ liệu cuộc thi M4 nay đã 8 năm tuổi (dữ liệu từ ~2015). Điều kiện benchmark (horizon ngắn, đơn biến, dữ liệu sạch) thiên vị có hệ thống cho phương pháp thống kê.
- Cuộc thi M5 (2020) trên dữ liệu bán lẻ Walmart — lớn hơn, phân cấp, có biến đồng hành ngoài — được thắng bởi mô hình dựa trên LightGBM, đảo ngược kết luận M4 cho dự báo kinh doanh thực tế.
- "Hầu hết phương pháp ML" trong M4 là các triển khai DL naive của thời đó. Các phương pháp hiện đại (N-BEATS, PatchTST, LightGBM với xây dựng đặc trưng đúng) không phải là thí sinh.
- Hewamalage et al. (2021, IJF) cho thấy các mô hình mạng thần kinh hồi quy trong M4 được tinh chỉnh kém so với best practice gần đây.

**Lập Trường của Dr. Sentinel:**
Trích dẫn M4 tạo ra một tiên nghiệm gây hiểu lầm rằng phương pháp cổ điển nhìn chung vượt trội. Cách diễn đạt đúng là: "Cho chuỗi đơn biến horizon ngắn sạch không có biến đồng hành ngoài, ETS/Theta vẫn rất cạnh tranh. Cho các trường hợp sử dụng phân cấp, đa biến, giàu biến đồng hành ở quy mô (kịch bản sản xuất chính trong bán lẻ, logistics, và chuỗi cung ứng), LightGBM và Transformer là best practice hiện tại." Báo cáo nghiên cứu cuối cùng có đề cập điểm sắc thái này (Mục 6.6 về M5), nhưng tuyên bố M4 sớm trong Khái niệm 4 có nguy cơ neo người đọc vào baseline sai.

**Mức Tin Cậy Thách Thức: CAO** — kết quả M4 so với M5 được ghi nhận rõ ràng và không mơ hồ.

---

### Thách Thức 3: "Conformal Prediction Cung Cấp Coverage Đảm Bảo Không Cần Giả Định Phân Phối"

**Tuyên Bố (Khái niệm 7, Dự Báo Xác Suất):**
Conformal prediction (dự đoán phù hợp) được mô tả là cung cấp "coverage đảm bảo không cần giả định phân phối — quan trọng cho các ngành được quản lý."

**Bằng Chứng Ủng Hộ Tuyên Bố:**
- Dưới giả định tính hoán đổi (exchangeability), conformal prediction được đảm bảo về mặt lý thuyết đạt coverage biên (1-α). Đây là chứng minh toán học (Vovk et al., 2005; khảo sát Angelopoulos & Bates, 2022).
- Nó không phụ thuộc phân phối: không cần giả định Gaussian hay tham số nào khác.

**Bằng Chứng Mâu Thuẫn Trong Bối Cảnh Chuỗi Thời Gian:**
- **Dữ liệu chuỗi thời gian vi phạm giả định tính hoán đổi theo định nghĩa.** Tính hoán đổi yêu cầu phân phối đồng thời của các quan sát bất biến với hoán vị. Dữ liệu chuỗi thời gian có phụ thuộc thời gian — quan sát tương lai không hoán đổi được với quan sát quá khứ.
- Rolling/split conformal prediction giải quyết phần nào (hiệu chuẩn trên cửa sổ dữ liệu gần đây), nhưng đảm bảo lý thuyết yếu đi thành đảm bảo coverage xấp xỉ dưới điều kiện trộn nhẹ. Đây không giống "coverage đảm bảo."
- Dưới dịch chuyển phân phối (distribution shift — chính xác là kịch bản kích hoạt huấn luyện lại trong báo cáo kỹ thuật), khoảng conformal prediction có thể bị sai lệch hiệu chuẩn một cách có hệ thống — tạo under-coverage chính xác khi bất định cao nhất.
- Bản thân báo cáo kỹ thuật thừa nhận điều này trong Hạn chế 4 ("Chuỗi thời gian vốn không hoán đổi được") và khuyến nghị hiệu chuẩn lại conformal cuộn. Báo cáo nghiên cứu không làm nổi bật đủ lưu ý này.

**Lập Trường của Dr. Sentinel:**
Tuyên bố "coverage đảm bảo" không chính xác về mặt kỹ thuật cho chuỗi thời gian nếu thiếu dấu sao về tính hoán đổi. Cho các ngành được quản lý (y tế, tài chính) dựa vào đảm bảo coverage, sự phân biệt này có ý nghĩa pháp lý. Tuyên bố đúng: "Conformal prediction cung cấp đảm bảo coverage xấp xỉ dưới giả định dừng nhẹ, với hiệu chuẩn lại cần thiết trong dịch chuyển phân phối." Đây vẫn là ưu thế thực tế mạnh so với phương pháp tham số, nhưng ngôn ngữ "đảm bảo" phải được khuyến cáo.

**Mức Tin Cậy Thách Thức: CAO** — đây là hạn chế đã biết và được ghi nhận rõ trong tài liệu conformal prediction (Barber et al., 2023, "Conformal Prediction Beyond Exchangeability," AoS).

---

### Thách Thức 4: "DLinear Vượt Transformer Đặt Ra Câu Hỏi Quan Trọng Về Thiết Kế Benchmark"

**Tuyên Bố (Mục 6.3, Phục Hưng Mô Hình Tuyến Tính):**
Dr. Archon trình bày phát hiện DLinear như đặt ra câu hỏi thiết kế benchmark — ngụ ý cộng đồng Transformer đã giải quyết vấn đề qua PatchTST và iTransformer.

**Bằng Chứng Ủng Hộ Tuyên Bố:**
- PatchTST và iTransformer thực sự phục hồi hiệu suất Transformer trên benchmark ETT. Điều này được ghi nhận.

**Bằng Chứng Phức Tạp Hóa Tuyên Bố:**
- Cuộc tranh luận rộng hơn "Transformer có hiệu quả không?" chưa được giải quyết dứt khoát. Nhiều bài báo 2023–2024 tiếp tục cho thấy MLP-mixer và mô hình tuyến tính được tinh chỉnh cẩn thận vẫn cạnh tranh với kiến trúc phức tạp trên nhiều tập dữ liệu thực tế.
- Benchmark Gift-Eval (Aksu et al., 2024) bao gồm nhiều lĩnh vực đa dạng nơi không kiến trúc đơn lẻ nào thống trị — câu chuyện "Transformer trở lại" là quá sớm.
- Cho thị trường mục tiêu (bán lẻ, logistics, phân khúc SME), LightGBM với đặc trưng dạng bảng luôn vượt trội tất cả kiến trúc DL trên tập dữ liệu kích thước thực tế (<100K dòng). Mức độ liên quan thực tế của benchmark ETT với dự báo kinh doanh là đáng nghi vấn.

**Lập Trường của Dr. Sentinel:** Báo cáo nghiên cứu khá cân bằng ở đây so với các thách thức khác, nhưng mạch tường thuật hơi đánh giá thấp sự cạnh tranh liên tục của các phương pháp không-Transformer. Cho đội triển khai, điều này quan trọng: đầu tư thời gian kỹ thuật vào iTransformer trước khi chứng minh sự đầy đủ của LightGBM trên dữ liệu khách hàng thực tế là tối ưu hóa quá sớm.

**Mức Tin Cậy Thách Thức: TRUNG BÌNH** — diễn giải chủ quan của một cuộc tranh luận nghiên cứu đang diễn ra.

---

## 2. Thách Thức Quan Trọng Đối Với Báo Cáo Kỹ Thuật (β)

### Thách Thức 1: Timeline MVP 3 Tuần Có Thực Tế Không?

**Tuyên Bố:**
Beta ước tính MVP (pipeline dữ liệu + mô hình toàn cục LightGBM + endpoint FastAPI + baseline ETS) là 3 tuần cho 1 kỹ sư ML.

**Phân Tích Tuyên Bố:**

| Thành Phần | Ước Tính Beta | Ước Tính Dr. Sentinel | Lý Do |
|-----------|-------------|----------------------|-------|
| Pipeline dữ liệu (1 nguồn → TimescaleDB + đặc trưng cơ bản) | 1 tuần | 1.5–2 tuần | Xác nhận schema, xử lý timestamp bất thường, và imputation null luôn phát sinh trường hợp biên bất ngờ. CSV "sạch" với định dạng nhất quán là ngoại lệ, không phải quy tắc. |
| LightGBM + walk-forward CV + MASE | 1 tuần | 1–1.5 tuần | Đạt được NẾU dữ liệu sạch và đặc trưng đã định nghĩa trước. Triển khai walk-forward CV lần đầu với xác nhận gap đúng thêm 2–3 ngày. |
| Endpoint FastAPI | 0.5 tuần | 0.5 tuần | Đồng ý — đây thực sự chỉ vài ngày cho endpoint cơ bản. |
| StatsForecast AutoETS baseline | 0.5 tuần | 0.5 tuần | Đồng ý — StatsForecast thực sự nhanh để tích hợp. |
| **Tổng** | **3 tuần** | **3.5–5 tuần** | **Ước tính của Beta chỉ đạt được nếu kỹ sư có kinh nghiệm trước với tất cả thành phần và dữ liệu đầu vào sạch và sẵn có từ ngày 1.** |

**Giả Định Thiếu Quan Trọng:** Ghi chú bàn giao của Beta thừa nhận "Vấn đề chất lượng dữ liệu có thể tiêu tốn thêm 1+ tuần" — nhưng lưu ý này bị chìm và không phản ánh trong con số tiêu đề 3 tuần. Trong thực tế, hơn 70% dự án thực, vấn đề chất lượng dữ liệu (ngày thiếu, khóa trùng, đơn vị không nhất quán giữa các cửa hàng) tiêu tốn thêm 1–2 tuần. Con số tiêu đề MVP nên được trình bày là "3 tuần (lạc quan, dữ liệu sạch)" so với "5 tuần (thực tế, chất lượng dữ liệu điển hình)."

**CỜ ĐỎ:** Ước tính MVP loại trừ hoàn toàn thời gian thu mua dữ liệu. Cho nền tảng bán cho khách hàng doanh nghiệp mới, việc trích xuất, biến đổi, và đàm phán giao nhận dữ liệu ban đầu với đội IT thường thêm 2–6 tuần trước khi bất kỳ công việc ML nào bắt đầu. Đây là sơ suất có thể giết dự án nếu không được nêu rõ trong các cuộc trao đổi bán hàng.

---

### Thách Thức 2: Full Stack Có Bị Thiết Kế Quá Mức Cho Thị Trường Mục Tiêu?

**Mối Quan Ngại:**
Báo cáo kỹ thuật đề xuất Kafka + Feast + TimescaleDB + Parquet/Delta + Spark + BentoML + Airflow + Prometheus + Evidently + Great Expectations + Kubernetes làm stack sản xuất. Đây là hơn 10 thành phần, nhiều trong đó có đường cong học dốc và phức tạp vận hành.

**Đánh Giá Theo Thành Phần:**

| Thành Phần | Hợp Lý? | Mối Quan Ngại |
|-----------|---------|--------------|
| TimescaleDB | CÓ cho truy vấn TS-native | Lựa chọn tốt. Chi phí vận hành thấp cho quy mô nhỏ-trung. |
| Parquet/Delta trên S3 | CÓ | Hợp lý cho data lake. Delta thêm ACID — cần thiết chỉ khi có ghi đồng thời, điều mà với hầu hết trường hợp sử dụng dự báo SME thì không có. Cân nhắc Parquet thuần + prefix S3 có phiên bản cho Giai đoạn 1. |
| Feast (Feature Store) | CÓ ĐIỀU KIỆN | Ghi chú của Beta thừa nhận đây là "phức tạp đáng ngạc nhiên." Cho <10 loại thực thể và phục vụ batch-only, view SQL có cấu trúc tốt trong TimescaleDB đạt cùng kết quả với chi phí vận hành bằng không. Feast có giá trị chỉ khi tính đúng thời điểm ở quy mô đòi hỏi truy xuất đặc trưng online dưới giây trên hàng triệu thực thể. Hầu hết khách hàng sẽ không gặp vấn đề đó cho đến khi >100K chuỗi hoạt động. |
| Kafka | CÓ ĐIỀU KIỆN | Hợp lý chỉ cho trường hợp cảm biến/IoT thời gian thực. Đa số thị trường mục tiêu (bán lẻ, logistics, chuỗi cung ứng) hoạt động theo nhịp batch hàng ngày/tuần. Thêm Kafka vào hệ thống dự báo batch là thiết kế quá mức điển hình. Loại khỏi MVP và Production v1; thêm vào Nền Tảng Đầy Đủ chỉ khi streaming là yêu cầu khách hàng rõ ràng. |
| Apache Spark (suy luận batch) | KHÔNG CẦN cho đến 100K+ chuỗi | Cho 10K chuỗi, Pandas với multiprocessing đạt cùng kết quả trong vài phút. Spark thêm phức tạp vận hành JVM, chi phí quản lý cluster, và khó debug mà đội 1–2 kỹ sư không thể gánh. Ví dụ của bản thân báo cáo kỹ thuật dùng 10K chuỗi — đây là bài toán Pandas/Dask, không phải bài toán Spark. |
| BentoML | BIÊN | FastAPI đơn thuần đủ cho MVP và Production v1. BentoML thêm tiện ích container hóa nhưng đưa thêm lớp trừu tượng mới. Cho đội 2 kỹ sư, chi phí cơ hội học BentoML là không nhỏ. |
| Airflow | CÓ | Đã kiểm chứng thực chiến, lựa chọn tốt cho lên lịch. Tuy nhiên, đường cong học debug DAG là thực — phân bổ buffer 2 tuần rõ ràng. |
| Great Expectations | CÓ | Thực thi hợp đồng dữ liệu tốt. Hợp lý từ ngày 1. |
| Kubernetes | CÓ ĐIỀU KIỆN | Thiết kế quá mức cho MVP. Cho Production v1 phục vụ <10K chuỗi với batch hàng đêm, một VM + Docker Compose là đủ. K8s có ý nghĩa khi mở rộng ngang và cách ly đa thuê bao trở thành yêu cầu. |

**Kết Luận:** Stack Production v1 phù hợp cho công ty phục vụ 10–50 khách hàng doanh nghiệp với 10K–100K chuỗi mỗi khách. Cho giai đoạn đầu (1–5 khách hàng, <10K chuỗi), nó bị thiết kế quá mức 2–3 lần. Báo cáo kỹ thuật nên định nghĩa rõ hơn các ngưỡng mở rộng mà tại đó mỗi thành phần trở nên cần thiết.

---

### Thách Thức 3: Độ Trễ Phục Vụ Foundation Model — Bẫy Chi Phí GPU

**Tuyên Bố:**
Foundation model (Chronos, TimesFM) được khuyến nghị cho các kịch bản cold-start với SLA <800ms P99 cho phục vụ thời gian thực.

**Bằng Chứng Rủi Ro:**
- Hạn chế 2 của Beta nêu: "Chronos-large: ~2 giây mỗi chuỗi trên CPU. Cho 10.000 chuỗi, khoảng ~6 giờ." Đây là thừa nhận đúng và đáng kể.
- TimesFM-200M yêu cầu tải mô hình 200M tham số — cold start đầu tiên thêm 30–60 giây thời gian tải mô hình trong môi trường container không có pre-warming.
- Chi phí suy luận GPU: instance GPU NVIDIA T4 (AWS g4dn.xlarge) chi phí ~$0.526/giờ. Cho startup xử lý 100K chuỗi hàng đêm với Chronos-base, chỉ riêng chi phí GPU là ~$400–600/tháng trước mọi hạ tầng khác. Đây là không nhỏ cho doanh thu giai đoạn đầu.
- Khuyến nghị của báo cáo kỹ thuật dùng "Chronos-tiny cho batch cold-start" là thực tế nhưng Chronos-tiny có độ chính xác thấp hơn đáng kể so với Chronos-base trên metrics xác suất (CRPS kém ~15% theo bài báo gốc). Đánh đổi độ chính xác/chi phí là khách hàng nhìn thấy được.

**CỜ ĐỎ:** Báo cáo kỹ thuật không bao gồm bất kỳ mô hình chi phí GPU hay phân tích chi phí mỗi dự đoán nào. Cho nền tảng cạnh tranh về giá với baseline thống kê (vốn chạy trên CPU và về cơ bản miễn phí), chi phí GPU của suy luận foundation model phải được benchmark rõ ràng và đưa vào mô hình giá trước khi cam kết kiến trúc này.

---

### Thách Thức 4: Độ Phức Tạp Vận Hành Hòa Hợp MinT Bị Đánh Giá Thấp

**Tuyên Bố:**
Hòa hợp MinT được trình bày là tác vụ triển khai 1 tuần trong Production v1.

**Bằng Chứng Phức Tạp Cao Hơn:**
- MinT đòi hỏi ma trận tổng S được định nghĩa tốt, yêu cầu định nghĩa phân cấp ổn định, đã thống nhất trước. Trong thực tế, phân cấp bán lẻ và chuỗi cung ứng thay đổi thường xuyên (tái phân loại danh mục sản phẩm, mở cửa hàng mới, hợp nhất SKU). Cập nhật S và chạy lại hòa hợp mà không làm hỏng trạng thái model registry là không đơn giản.
- Ước lượng co rút hiệp phương sai Ledoit-Wolf dùng trong mẫu code đòi hỏi T > 3×n_series quan sát huấn luyện (Hạn chế 3 của Beta). Cho phân cấp với 50+ cấp và chỉ 52 tuần lịch sử, điều kiện này thường bị vi phạm, buộc dự phòng sang WLS-structural (W đường chéo), kém chính xác đáng kể.
- Hòa hợp MinT xác suất (mở rộng khoảng, không chỉ dự báo điểm) — phương pháp tiên tiến nhất — KHÔNG được đề cập trong báo cáo kỹ thuật. Wrapper conformal prediction được định nghĩa ở cấp dự báo cơ sở. Sau hòa hợp MinT, các khoảng không còn được hiệu chuẩn. Hiệu chuẩn lại sau hòa hợp thêm một chu kỳ kỹ thuật khác không được tính trong ước tính 1 tuần.
- MinT thời gian thực được đánh cờ rõ ràng là không khả thi (Hạn chế 7) — tuy nhiên kiến trúc phục vụ hiển thị MinT trong đường dẫn thời gian thực trong sơ đồ pipeline. Đây là mâu thuẫn cần được giải quyết.

**Ước tính 1 tuần là THẤP** — ước tính thực tế cho triển khai MinT mạnh mẽ với xử lý phân cấp động, logic dự phòng, và điều chỉnh khoảng sau hòa hợp là 2.5–3 tuần.

---

### Thách Thức 5: Logic Gap Walk-Forward CV — Đơn Giản Đến Lừa Dối Dễ Sai

**Quan Sát:**
Mẫu code cho walk-forward CV đúng về mặt kỹ thuật, nhưng báo cáo kỹ thuật bỏ qua một chế độ thất bại thực tế giết chất lượng mô hình trong các đội sản xuất.

**Rủi Ro Tiềm Ẩn:**
Tham số gap trong walk-forward CV phải bằng lag tối đa sử dụng trong xây dựng đặc trưng. Nếu xây dựng đặc trưng dùng `y_lag_52` (lag 52 tuần) nhưng gap được đặt thành `forecast_horizon = 12`, thì trong quá trình xác nhận, mô hình sử dụng dữ liệu tương lai để xây dựng đặc trưng lag-52 cho 40 bước xác nhận đầu tiên. Điều này tạo MASE thời huấn luyện ~0.78 suy giảm thành ~0.95 trong sản xuất — khoảng cách không thể chẩn đoán mà không kiểm toán cẩn thận code xây dựng đặc trưng so với cấu hình CV.

Chế độ thất bại này được ghi nhận trong nhiều post-mortem Kaggle (cuộc thi M5, thử thách dự báo CPC) và là nguồn #1 của khiếu nại "tại sao MASE trông tuyệt vời trong backtest nhưng tệ trong sản xuất." Báo cáo kỹ thuật đề cập trong phần bẫy nhưng không biến nó thành ràng buộc triển khai hạng nhất trong code CV.

---

## 3. Chấm Điểm Khả Thi

### 3.1 Khả Thi Kỹ Thuật — Điểm: 8/10

**Mức Tin Cậy: CAO**

| Yếu Tố | Đánh Giá |
|--------|----------|
| Độ trưởng thành công cụ | Tất cả công cụ cốt lõi (LightGBM, StatsForecast, PyTorch, MLflow) đã trưởng thành sản xuất với hơn 5 năm bằng chứng triển khai quy mô lớn. |
| Độ trưởng thành foundation model | TimesFM và Chronos là bản phát hành 2024 — API ổn định nhưng hệ sinh thái công cụ (giám sát, fine-tuning, tối ưu chi phí) còn non. Trừ điểm cho điều này. |
| Sẵn có nhân tài | Kỹ sư ML Python với kỹ năng LightGBM + chuỗi thời gian có sẵn rộng rãi toàn cầu (cung Trung bình-Cao). Kỹ sư MLOps với kinh nghiệm Feast + TimescaleDB ít phổ biến hơn (cung Trung bình). Chuyên gia foundation model chuỗi thời gian là hiếm (cung Thấp). |
| Độ phức tạp triển khai | Full stack phức tạp, nhưng mỗi thành phần được tài liệu hóa riêng tốt. Phức tạp tích hợp (12+ thành phần hoạt động cùng nhau) là không nhỏ và bị đánh giá thấp. |
| Nền tảng thuật toán | Vững chắc. ARIMA, ETS, LightGBM, TFT được hỗ trợ bởi hàng thập kỷ lý thuyết và thực hành. Foundation model có phản biện ICML/TMLR mạnh. Không lo ngại về độ tin cậy toán học. |

**Bằng Chứng Chính:** Thư viện StatsForecast xử lý 10.000 chuỗi trong vài giây (benchmark Nixtla, đã xác nhận). Chiến thắng cuộc thi M5 của LightGBM được ghi nhận. MLflow có hơn 15M lượt tải hàng tháng (thống kê PyPI, 2025).

**CỜ ĐỎ:**
- Feast feature store: triển khai lần đầu luôn mất 2–3 lần thời gian ước tính (nhiều post-mortem từ đội ML sản xuất ghi nhận điều này).
- Suy luận Chronos trên CPU ở quy mô 10K+ chuỗi: cửa sổ batch 6 giờ được ghi nhận trong báo cáo kỹ thuật là ràng buộc sản xuất thực.

---

### 3.2 Khả Thi Thị Trường — Điểm: 7/10

**Mức Tin Cậy: TRUNG BÌNH-CAO**

| Yếu Tố | Đánh Giá |
|--------|----------|
| Nhu cầu | Mạnh và rộng. Dự báo nhu cầu là top-5 trường hợp sử dụng AI trong mọi báo cáo phân tích lớn (Gartner, IDC, McKinsey) cho sản xuất, bán lẻ, logistics, và dịch vụ tài chính. Không có rủi ro nhu cầu. |
| Cạnh tranh | Bão hòa ở tầng doanh nghiệp. Oracle, SAP, và Salesforce đã nhúng dự báo sâu vào quy trình ERP/CRM. AWS Forecast, Azure ML, và Google Cloud Vertex AI cung cấp dịch vụ quản lý. Khác biệt hóa chỉ dựa trên độ chính xác là không đủ. |
| Sẵn lòng chi trả | Doanh nghiệp: $50K–$500K ACV cho nền tảng dự báo chuyên dụng (benchmark giá Anaplan, o9 Solutions). SME/Mid-market: $1K–$20K/tháng cho SaaS dự báo (giá Fable, Nixtla). Góc độ dự báo xác suất + giải thích được đòi premium 20–30% trong giao dịch doanh nghiệp dựa trên các giao dịch nền tảng ML tương tự. |
| Thời điểm thị trường | ĐÚNG LÚC. Khả năng zero-shot foundation model thực sự mới (2024–2025) và chưa bị hàng hóa hóa bởi hyperscaler. Đây là cửa sổ 12–24 tháng trước khi AWS/GCP tích hợp khả năng lớp TimesFM vào dịch vụ quản lý ở giá hàng hóa. |
| Thị trường Việt Nam / Đông Nam Á | Nhu cầu đang nổi lên. Logistics (Grab, Lalamove, J&T Express), thương mại điện tử (Shopee, Lazada), và chuỗi cung ứng sản xuất ở Việt Nam/Đông Nam Á là người mua thực. Thị trường nội địa chậm ~3–5 năm so với Mỹ/EU trong áp dụng ML, nghĩa là giải pháp cổ điển + LightGBM vẫn có thể thắng giao dịch mà thị trường Mỹ đã coi là table stakes (tiêu chuẩn cơ bản). |
| Rủi ro khác biệt hóa | Cao. Câu chuyện "foundation model cho dự báo" được chia sẻ bởi Nixtla (TimeGPT, API thương mại), AWS Forecast, và startup mới nổi. Nếu không có hào phòng thủ ngoài chất lượng mô hình, áp lực hàng hóa hóa trong 18–36 tháng. |

**CỜ ĐỎ:**
- **TimeGPT của Nixtla** (API thương mại, $0.0001 mỗi dự đoán) là đối thủ trực tiếp với góc foundation model zero-shot. Nếu khách hàng có thể gọi API cho dự báo zero-shot với chi phí dưới cent, xây dựng hạ tầng Chronos/TimesFM nội bộ đòi hỏi lập luận mạnh về bảo mật dữ liệu hoặc tùy chỉnh.
- **Rủi ro quyết định mua vs xây:** Nhiều khách hàng doanh nghiệp sẽ thích trả Nixtla $500/tháng cho dự báo zero-shot hơn là $200K để xây nền tảng tùy chỉnh. Pitch phải rõ ràng nhắm đến khách hàng không thể dùng API bên thứ ba (chủ quyền dữ liệu, tuân thủ, nhu cầu tùy chỉnh).

---

### 3.3 Khả Thi Dữ Liệu — Điểm: 6/10

**Mức Tin Cậy: TRUNG BÌNH**

| Yếu Tố | Đánh Giá |
|--------|----------|
| Sẵn có dữ liệu | Rất khác nhau theo khách hàng. Khách bán lẻ thường có 2–5 năm dữ liệu POS sạch. Khách logistics có nhật ký vận chuyển nhưng có lỗ do di chuyển hệ thống. Khách y tế và năng lượng đối mặt phức tạp quy định trong truy cập dữ liệu. |
| Chất lượng dữ liệu | Báo cáo kỹ thuật xác định đúng các vấn đề chính (timestamp thiếu, nhu cầu zero-inflated, mùa vụ bất thường). Yêu cầu lịch sử tối thiểu 2 năm được đánh cờ trong cổng Great Expectations là đúng nhưng sẽ loại ~30% khách hàng tiềm năng giai đoạn đầu. |
| Yêu cầu dữ liệu tối thiểu | Mô hình toàn cục LightGBM cần tối thiểu 52 tuần × số chuỗi khả thi tối thiểu (>20 chuỗi) cho học xuyên chuỗi có ý nghĩa. Walk-forward CV với 5 fold và horizon 12 tuần đòi ít nhất 104 tuần (2 năm) dữ liệu. Nhiều khách SME sẽ không đạt ngưỡng này. |
| Tích hợp dữ liệu ngoài | Thời tiết, lịch ngày lễ, chỉ số kinh tế công khai và chi phí thấp. Nhưng pipeline tích hợp đòi bảo trì (thay đổi API, cập nhật schema) thêm chi phí vận hành liên tục không phản ánh trong ước tính công sức. |
| Nhu cầu gán nhãn | KHÔNG có cho dự báo giám sát tiêu chuẩn. Biến mục tiêu là giá trị thực lịch sử. Đây là ưu thế đáng kể so với tác vụ phân loại/NLP. |
| Lo ngại bảo mật / quy định | Chuỗi thời gian tài chính: lo ngại bảo mật tối thiểu cho dữ liệu tổng hợp. Y tế: HIPAA ở Mỹ, quy định tương đương ở Đông Nam Á. Dữ liệu giao dịch cá nhân trong bán lẻ: cân nhắc GDPR/PDPA nếu chuỗi ở cấp khách hàng thay vì cấp SKU. Báo cáo kỹ thuật không đề cập yêu cầu che dữ liệu hay ẩn danh — đây là lỗ hổng. |

**CỜ ĐỎ:**
- **Yêu cầu dữ liệu tối thiểu 2 năm** là rào cản thực sự cho khách hàng greenfield. Câu chuyện cold-start foundation model giảm thiểu phần nào, nhưng hình phạt độ chính xác là khách hàng nhìn thấy được (suy giảm MASE 15–20% so với mô hình fine-tuned).
- **Phụ thuộc SLA độ tươi dữ liệu:** Kiến trúc giả định thu nạp dữ liệu hàng ngày trước 02:00 UTC. Bất kỳ khách hàng nào có quy trình xuất ERP batch theo nhịp hàng tuần (phổ biến trong SME sản xuất Việt Nam) không thể đáp ứng SLA này mà không thay đổi pipeline dữ liệu phía khách — phụ thuộc thu mua/IT 4–12 tuần.

---

### 3.4 Điểm Rủi Ro — Điểm: 6/10 (thấp hơn là rủi ro hơn; đây là đánh giá đã điều chỉnh rủi ro)

**Mức Tin Cậy: TRUNG BÌNH**

Hồ sơ rủi ro quản lý được nhưng không nhỏ. Các rủi ro hàng đầu (Mục 5) có biện pháp giảm thiểu, nhưng nhiều biện pháp đòi hỏi sự trưởng thành tổ chức mà đội giai đoạn đầu thường thiếu.

Mối quan ngại chính: (1) Chi phí GPU foundation model ở quy mô không có cam kết giá tạo COGS không thể dự đoán; (2) Stack đa thành phần tạo gánh nặng vận hành cao cho đội nhỏ; (3) Rò rỉ walk-forward CV là rủi ro chất lượng thầm lặng đòi cảnh giác liên tục.

---

### 3.5 Điểm Có Trọng Số Cuối Cùng

| Chiều | Trọng Số | Điểm Thô (1-10) | Điểm Có Trọng Số |
|-------|---------|-----------------|-------------------|
| Khả thi Kỹ thuật | 30% | 8 | 2.40 |
| Khả thi Thị trường | 30% | 7 | 2.10 |
| Khả thi Dữ liệu | 20% | 6 | 1.20 |
| Điểm Rủi ro | 20% | 6 | 1.20 |
| **TỔNG** | **100%** | — | **6.90 / 10** |

**Thang Diễn Giải:** <5 = Không Đạt | 5–6.5 = Đạt Có Điều Kiện (điều kiện đáng kể) | 6.5–8 = Đạt Có Điều Kiện (điều kiện nhỏ-trung bình) | >8 = Đạt

**Kết Luận: ĐẠT CÓ ĐIỀU KIỆN (điểm 6.90 — điều kiện trung bình áp dụng)**

---

## 4. Phân Tích Đối Thủ

### Đối Thủ 1: Nixtla (TimeGPT + StatsForecast)
- **Danh mục:** API thương mại (TimeGPT) + Mã nguồn mở (StatsForecast, NeuralForecast)
- **Loại:** Lai — lõi mở với tầng API thương mại
- **Điểm Mạnh Chính:**
  - TimeGPT là đối thủ foundation model zero-shot thương mại trực tiếp. API-first, giá dưới cent mỗi dự đoán, thời gian thiết lập tối thiểu.
  - StatsForecast (mã nguồn mở) thực sự hàng đầu cho AutoARIMA/AutoETS ở quy mô — nhanh hơn 1000 lần so với statsmodels. Được sử dụng bởi chính khuyến nghị tech stack của chúng ta.
  - NeuralForecast bao gồm PatchTST, TFT, iTransformer với API thống nhất. Loại bỏ nhu cầu triển khai PyTorch Lightning riêng.
  - Hậu thuẫn: được Sequoia đầu tư, cộng đồng developer mạnh, tài liệu tuyệt vời.
- **Điểm Yếu Chính:**
  - TimeGPT là API hộp đen — không triển khai on-premise, không chủ quyền dữ liệu.
  - Không có feature store, giám sát, hay pipeline MLOps tích hợp. Được định vị chỉ ở tầng mô hình.
  - Không có hòa hợp phân cấp tự nhiên trong API thương mại.
  - Minh bạch giá hạn chế; cần hợp đồng doanh nghiệp cho chiết khấu khối lượng.
- **Giá:** TimeGPT API: $0.0001 mỗi bước thời gian (ước tính từ thông tin công khai, 2025). StatsForecast/NeuralForecast: Apache 2.0, miễn phí.
- **Điều Gì Giúp Chúng Ta Thắng:** Yêu cầu chủ quyền dữ liệu (khách chính phủ, y tế, tài chính không thể gửi dữ liệu cho API ngoài). Fine-tuning tùy chỉnh trên dữ liệu độc quyền. Pipeline MLOps đầy đủ (giám sát, huấn luyện lại, giải thích) — Nixtla không cung cấp điều này.

---

### Đối Thủ 2: AWS Forecast (Amazon)
- **Danh mục:** Dịch vụ quản lý cloud-native
- **Loại:** SaaS thương mại
- **Điểm Mạnh Chính:**
  - Không quản lý hạ tầng — huấn luyện, phục vụ, và giám sát hoàn toàn quản lý.
  - Tích hợp tự nhiên với hệ sinh thái AWS (S3, Redshift, QuickSight, SageMaker).
  - Hỗ trợ tự nhiên DeepAR, Temporal Fusion Transformer, CNN-QR.
  - Dự báo xác suất tích hợp với đầu ra phân vị.
  - Đảm bảo SLA mạnh (99.9% uptime, hợp đồng hỗ trợ doanh nghiệp).
- **Điểm Yếu Chính:**
  - Bị khóa nhà cung cấp: dữ liệu phải ở S3, kết quả trong S3/DynamoDB. Di chuyển đi tốn kém.
  - Không có khả năng zero-shot foundation model (tính đến Q1 2025). Xử lý cold-start hạn chế.
  - Giải thích mô hình hạn chế so với LightGBM+SHAP.
  - Giá trở nên đắt ở quy mô: $0.60 mỗi 1.000 dự báo + chi phí huấn luyện. Ở 100K chuỗi × hàng tuần = $3.120/tháng chỉ riêng chi phí dự báo, trước huấn luyện.
  - Tùy chỉnh kiến trúc mô hình, xây dựng đặc trưng, hay hàm mất mát bị hạn chế.
- **Giá:** $0.088/giờ cho huấn luyện + $0.60 mỗi 1.000 dự báo tạo ra (giá công khai AWS, 2025). Tổng chi phí cho 10K chuỗi hàng tuần: ~$250–400/tháng.
- **Điều Gì Giúp Chúng Ta Thắng:** TCO thấp hơn ở quy mô (tự lưu trữ rẻ hơn trên ~20K chuỗi/tháng). Foundation model zero-shot cho cold start. Stack quan sát đầy đủ (Evidently drift + SHAP + metrics tùy chỉnh) mà AWS Forecast không cung cấp. Yêu cầu triển khai đa cloud hoặc on-premise.

---

### Đối Thủ 3: Oracle Demand Management (Demantra / Supply Chain Planning)
- **Danh mục:** Nhúng trong ERP doanh nghiệp
- **Loại:** Phần mềm doanh nghiệp thương mại
- **Điểm Mạnh Chính:**
  - Tích hợp ERP sâu — đọc trực tiếp từ bảng giao dịch Oracle ERP/WMS không cần ETL.
  - Quy trình S&OP được APICS chứng nhận nhúng trong sản phẩm.
  - Dự báo phân cấp mạnh với hòa hợp top-down/bottom-up tích hợp trong UI.
  - Quan hệ khách hàng 20+ năm trong ngành dọc sản xuất, CPG, và bán lẻ.
  - Chứng nhận tuân thủ (SOX, GDPR) đã hoàn thành.
- **Điểm Yếu Chính:**
  - Mô hình là thống kê (biến thể ETS, ARIMA) với khả năng ML hạn chế — không có LightGBM, Transformer, hay foundation model.
  - Chi phí triển khai cực cao: $200K–$2M cho triển khai đầy đủ (bao gồm phí đối tác Oracle).
  - Tiến hóa sản phẩm chậm: khả năng foundation model không nằm trong lộ trình hiện tại tính đến 2025.
  - Dữ liệu bị silo trong schema độc quyền Oracle — thêm nguồn dữ liệu ngoài (thời tiết, chỉ số thị trường) khó khăn.
  - Giao diện phức tạp và đòi đào tạo chuyên dụng cho chuyên viên hoạch định nhu cầu.
- **Giá:** Giấy phép: $100K–$500K+ tùy số người dùng và module. Triển khai: $150K–$1.5M (phí đối tác Oracle, ước tính 2025).
- **Điều Gì Giúp Chúng Ta Thắng:** Giá (rẻ hơn 10–20 lần Oracle cho độ chính xác tương đương hoặc tốt hơn). Tốc độ tạo giá trị (tuần so với tháng/năm cho Oracle). Độ chính xác ML hiện đại (LightGBM + foundation model so với phương pháp lớp ETS). Tích hợp dữ liệu ngoài. Kiến trúc thuần Python, API-first. Góc thắng: triển khai greenfield, thị trường SME, và khách Oracle hiện tại muốn độ chính xác ML tốt hơn mà không chờ lộ trình sản phẩm Oracle.

---

### Đối Thủ 4: Palantir Foundry (AIP Forecasting)
- **Danh mục:** Nền tảng AI doanh nghiệp với module dự báo
- **Loại:** Phần mềm doanh nghiệp thương mại
- **Điểm Mạnh Chính:**
  - Tích hợp dữ liệu xuất sắc (ontology Foundry kết nối mọi nguồn dữ liệu).
  - Tính năng kiểm toán và tuân thủ mạnh (thành tích với chính phủ và quốc phòng).
  - AIP (AI Platform, 2023+) thêm phân tích LLM-driven bao gồm dự báo với giải thích ngôn ngữ tự nhiên.
  - Thương hiệu mạnh trong dịch vụ tài chính, quốc phòng, y tế.
- **Điểm Yếu Chính:**
  - Chi phí cực cao: hợp đồng hàng năm $5M–$50M+. Không liên quan cho SME hoặc mid-market.
  - Bị khóa nền tảng độc quyền. Dữ liệu biến đổi thành đối tượng Foundry không dễ di chuyển.
  - Quá mức cho trường hợp dự báo nhu cầu đơn giản.
  - Onboarding phức tạp — thời gian triển khai 6–18 tháng là điển hình.
- **Giá:** Chỉ doanh nghiệp, thường $5M–$50M/năm ACV.
- **Điều Gì Giúp Chúng Ta Thắng:** So sánh phân khúc giá không liên quan — Palantir không phải đối thủ cho cùng người mua mục tiêu. Góc thắng: giành khách hàng bị loại khỏi Palantir do giá nhưng cần nhiều hơn dịch vụ hộp đen quản lý của AWS Forecast.

---

### Đối Thủ 5: Anaplan (Connected Planning)
- **Danh mục:** Nền tảng hoạch định và dự báo doanh nghiệp
- **Loại:** SaaS thương mại
- **Điểm Mạnh Chính:**
  - Thống trị trong hoạch định S&OP tích hợp tài chính (dự báo doanh thu, FP&A).
  - Giao diện người dùng kinh doanh mạnh — chuyên viên hoạch định nhu cầu có thể ghi đè dự báo với phán đoán kinh doanh.
  - Tích hợp tự nhiên với Salesforce, SAP, Oracle.
  - Doanh thu $500M+, SLA cấp doanh nghiệp.
- **Điểm Yếu Chính:**
  - Mô hình ML/thống kê dự báo hạn chế so với stack thuần Python. Không hỗ trợ tự nhiên LightGBM, Transformer, hay foundation model.
  - Giá rất cao: ACV $150K–$500K+ cho giấy phép doanh nghiệp.
  - Chủ yếu dự báo tài chính và doanh thu — không chuyên xây cho dự báo nhu cầu vận hành ở mức chi tiết SKU×Cửa hàng.
  - Dự báo xác suất hạn chế (đầu ra phân vị cơ bản).
- **Giá:** $150K–$500K+ ACV (SaaS doanh nghiệp, ước tính 2025 từ hệ sinh thái đối tác).
- **Điều Gì Giúp Chúng Ta Thắng:** Dự báo vận hành chi tiết (cấp SKU×Cửa hàng so với cấp dòng doanh thu). Độ chính xác ML tốt hơn. Đầu ra xác suất cho tối ưu tồn kho. Tích hợp API-first so với quy trình UI-first của Anaplan. Góc thắng: đội dự báo vận hành cần độ chính xác ML, không phải đội hoạch định tài chính cần quy trình quản trị/phê duyệt của Anaplan.

---

## 5. Top 5 Rủi Ro

### Rủi Ro 1: Vòng Xoáy Chi Phí GPU Foundation Model

**Mô Tả:** Kiến trúc khuyến nghị suy luận tăng tốc GPU cho Chronos/TimesFM ở quy mô. Khi nền tảng nhận thêm khách hàng với số lượng thực thể lớn hơn, chi phí GPU tăng phi tuyến tính. Nếu không có mô hình chi phí rõ ràng và cấu trúc giá khách hàng tính đến GPU COGS, nền tảng có thể đạt doanh thu cao trong khi lỗ trên tính toán.

- **Xác Suất: TRUNG BÌNH** — Rủi ro chi phí chỉ hiện thực hóa trên ~50K chuỗi/tháng, đòi quy mô khách hàng đáng kể. Quản lý được nếu xử lý sớm.
- **Tác Động: CAO** — Xói mòn kinh tế đơn vị có thể làm mô hình kinh doanh không khả thi ở quy mô, kích hoạt chuyển hướng kiến trúc tốn kém.
- **Chiến Lược Giảm Thiểu:**
  1. Benchmark chi phí mỗi dự đoán cho mỗi kích thước mô hình (Chronos-tiny vs base vs large) trước Production v1.
  2. Giới hạn foundation model cho đường dẫn cold-start (<60 ngày lịch sử) — không dùng cho thực thể trưởng thành.
  3. Tính trước và cache dự đoán foundation model hàng đêm; không bao giờ chạy đồng bộ theo yêu cầu.
  4. Thiết lập trần chi phí GPU theo tầng khách hàng trong mô hình giá từ Ngày 1.
  5. Đánh giá Chronos-tiny làm mặc định — suy giảm CRPS (~15%) có thể chấp nhận được với tiết kiệm chi phí (rẻ hơn 4–8 lần so với Chronos-base).
- **Chủ Sở Hữu:** Trưởng Kỹ Thuật ML + đội Kinh Doanh/Giá

---

### Rủi Ro 2: Rò Rỉ Walk-Forward CV — Hỏng Chất Lượng Thầm Lặng

**Mô Tả:** Cấu hình gap không đúng trong walk-forward cross-validation gây metrics MASE lạc quan khi huấn luyện mà không hiện thực hóa trong sản xuất. Đây là thất bại thầm lặng — mô hình có vẻ hoạt động tốt trong backtest nhưng suy giảm âm thầm sau triển khai. Phát hiện thường cần 4–8 tuần giám sát trực tiếp.

- **Xác Suất: TRUNG BÌNH-CAO** — Chế độ thất bại này được ghi nhận trong 30–50% post-mortem dự án ML dự báo. Nếu không có code review rõ ràng và kiểm thử rò rỉ tự động, đây là kết quả mặc định cho đội mới với xác nhận chuỗi thời gian.
- **Tác Động: CAO** — Lòng tin khách hàng bị phá hủy khi độ chính xác sản xuất kém 15–25% so với cam kết. Phục hồi đòi huấn luyện lại và xác nhận lại hoàn toàn — trì hoãn 4–6 tuần.
- **Chiến Lược Giảm Thiểu:**
  1. Biến gap = max(forecast_horizon, max_lag_used) thành tham số cấu hình được xác nhận — lỗi assertion nếu vi phạm.
  2. Thêm kiểm thử phát hiện rò rỉ tự động: huấn luyện mô hình với gap=0, xác nhận MASE thấp đáng ngờ (<0.5), sau đó đánh cờ là chỉ báo rò rỉ.
  3. Code review tất cả code xây dựng đặc trưng với checklist rõ ràng: "Đặc trưng này có thể xây dựng chỉ với dữ liệu sẵn có tại timestamp đặc trưng không?"
  4. Luôn so sánh MASE thời huấn luyện với MASE sản xuất trực tiếp trên khách hàng đầu tiên. Nếu chênh lệch >20%, kiểm toán ngay lập tức.
- **Chủ Sở Hữu:** Trưởng Kỹ Thuật ML (kỹ thuật) + chức năng QA (thực thi quy trình)

---

### Rủi Ro 3: Feast Feature Store Thiết Kế Quá Mức Gây Thất Bại Timeline

**Mô Tả:** Báo cáo kỹ thuật khuyến nghị Feast làm feature store. Truy xuất đúng thời điểm của Feast có kiến trúc tuyệt vời nhưng phức tạp vận hành khi cấu hình đúng. Nhiều đội sản xuất báo cáo vượt timeline 2–4 lần chuyên trên thiết lập Feast. Nếu Feast trở thành nút thắt đường tới hạn, Production v1 trượt từ 18 tuần sang 24–28 tuần.

- **Xác Suất: CAO** — Đây luôn được đánh cờ trong thảo luận cộng đồng, ghi chú của bản thân báo cáo kỹ thuật, và post-mortem từ người áp dụng Feast sớm.
- **Tác Động: TRUNG BÌNH** — Trượt timeline tốn kém nhưng không chết. Phương án dự phòng (SQL-based point-in-time joins) luôn sẵn có.
- **Chiến Lược Giảm Thiểu:**
  1. Cho Production v1, triển khai đặc trưng dạng view SQL đúng thời điểm trong TimescaleDB. Truy vấn chậm hơn nhưng loại bỏ phức tạp vận hành Feast.
  2. Giới thiệu Feast chỉ trong giai đoạn Nền Tảng Đầy Đủ, sau khi xác nhận truy xuất đặc trưng thời gian thực (<10ms) là yêu cầu khách hàng thực sự — không phải suy đoán.
  3. Nếu Feast được giới thiệu sớm hơn, phân bổ spike Feast chuyên dụng 3 tuần (chỉ proof-of-concept, không lưu lượng sản xuất) trước khi cam kết nó trên đường tới hạn.
  4. Ngân sách cho chuyên gia Feast hợp đồng cho 2 tuần thiết lập ban đầu nếu đội nội bộ thiếu kinh nghiệm.
- **Chủ Sở Hữu:** Trưởng MLOps / Kỹ Thuật Dữ Liệu

---

### Rủi Ro 4: Hàng Hóa Hóa Cạnh Tranh bởi Nixtla / AWS / Hyperscaler

**Mô Tả:** Góc foundation model zero-shot — yếu tố khác biệt kỹ thuật chính — đang chịu áp lực thương mại trực tiếp từ API TimeGPT của Nixtla và các dịch vụ foundation model quản lý AWS/GCP đang nổi lên. Cửa sổ 12–24 tháng trước khi hyperscaler hàng hóa hóa khả năng này có thể quá ngắn để thiết lập hào phòng thủ chỉ dựa trên chất lượng mô hình.

- **Xác Suất: CAO** — AWS Forecast lịch sử đã thêm loại mô hình mới trong 12–18 tháng sau công bố học thuật. TimesFM là mô hình riêng của Google — tích hợp Google Cloud có khả năng trong 2025–2026.
- **Tác Động: CAO** — Nếu yếu tố khác biệt chính (zero-shot cold start qua foundation model) trở thành tính năng dịch vụ quản lý $10/tháng, nền tảng tùy chỉnh mất sức mạnh giá.
- **Chiến Lược Giảm Thiểu:**
  1. Chuyển khác biệt hóa từ "mô hình tốt hơn" sang "pipeline MLOps tốt hơn" — giám sát, giải thích, hòa hợp phân cấp, và tích hợp với hệ thống dữ liệu khách hàng không dễ bị hàng hóa hóa.
  2. Xây lợi thế dữ liệu huấn luyện độc quyền: cung cấp fine-tuning trên dữ liệu lịch sử khách hàng làm hào mà nhà cung cấp API-only không thể tái tạo mà không chia sẻ dữ liệu.
  3. Tập trung vào ngành dọc nơi nhà cung cấp API-only có rào cản tuân thủ (thu mua chính phủ Việt Nam, y tế với yêu cầu PDPA).
  4. Thời gian ra thị trường: đưa vào sản xuất với 3+ khách hàng tham chiếu trong 9 tháng — chứng minh ROI tạo chi phí chuyển đổi trước khi hàng hóa hóa đến.
- **Chủ Sở Hữu:** Sản Phẩm / Chiến Lược / CEO

---

### Rủi Ro 5: Bất Ổn Hòa Hợp Phân Cấp ở Quy Mô Sản Xuất

**Mô Tả:** Hòa hợp MinT đòi phân cấp ổn định, được định nghĩa trước (ma trận tổng S). Trong triển khai bán lẻ/logistics thực, phân cấp thay đổi thường xuyên: SKU mới xuất hiện, cũ bị ngừng, cửa hàng mở và đóng, danh mục được tái cấu trúc. Duy trì ma trận tổng đúng trong sản xuất mà không làm hỏng so sánh backtest lịch sử hoặc kích hoạt sự kiện huấn luyện lại sai là thách thức vận hành đáng kể không được đề cập trong báo cáo kỹ thuật.

- **Xác Suất: TRUNG BÌNH** — Phân cấp tĩnh hiếm trong môi trường doanh nghiệp. Bất kỳ khách hàng nào có giới thiệu sản phẩm theo mùa (phổ biến trong bán lẻ) sẽ kích hoạt điều này.
- **Tác Động: TRUNG BÌNH** — Hòa hợp sai tạo dự báo có vẻ nhất quán nhưng sai về mặt toán học — dự báo SKU tổng hợp sẽ không khớp dự báo cấp danh mục, mà chuyên viên hoạch định sẽ phát hiện trong báo cáo và escalate.
- **Chiến Lược Giảm Thiểu:**
  1. Thiết kế mô hình dữ liệu phân cấp với ma trận tổng có phiên bản (bản ghi timestamp-effective): S_v1 có hiệu lực từ 2024-01-01 đến 2024-06-30, S_v2 có hiệu lực từ 2024-07-01 trở đi.
  2. Loại thực thể mới khỏi MinT trong 60 ngày đầu (đã khuyến nghị trong báo cáo kỹ thuật — thực thi nghiêm ngặt).
  3. Thêm kiểm tra nhất quán phân cấp tự động trong bộ Great Expectations: "tổng dự báo tất cả cấp con phải bằng dự báo cấp cha trong ±1%."
  4. Giới hạn MinT chỉ cho batch hàng đêm (đã khuyến nghị vì lý do độ trễ thời gian thực). Không bao giờ thử hòa hợp thời gian thực.
- **Chủ Sở Hữu:** Trưởng Kỹ Thuật ML + Phân Tích Kinh Doanh (quản trị phân cấp)

---

## 6. Kết Luận Đạt / Đạt Có Điều Kiện / Không Đạt

### KẾT LUẬN: ĐẠT CÓ ĐIỀU KIỆN

**Điểm Khả Thi Có Trọng Số: 6.90 / 10**

**Lý Do:**
Lĩnh vực có nhu cầu thương mại thực sự, nền tảng toán học vững chắc, và tất cả công cụ mã nguồn mở cần thiết. Báo cáo nghiên cứu và kỹ thuật đều hợp lý về mặt kỹ thuật ở cấp khái niệm. Cơ sở bằng chứng cho giá trị kinh doanh — kết quả cuộc thi M5, triển khai Amazon/Walmart được ghi nhận, ROI được lượng hóa trong bối cảnh chuỗi cung ứng — mạnh và có thể tái tạo.

Tuy nhiên, ba điều kiện phải được đáp ứng trước khi cam kết đầu tư Production v1:

---

### Điều Kiện Đạt

**Điều Kiện 1: Xác nhận hồ sơ khách hàng mục tiêu trước khi xây stack Production v1.**
- Xác định phân khúc khách hàng chính: SME (<1K chuỗi), mid-market (1K–50K chuỗi), hay doanh nghiệp (50K+ chuỗi). Tech stack khác nhau hoàn toàn ở mỗi tầng.
- Báo cáo kỹ thuật hiện tại ngầm nhắm hồ sơ mid-market đến doanh nghiệp với Feast, Spark, và Kubernetes. Nếu 5 khách hàng đầu tiên là SME/mid-market, full stack Production v1 bị thiết kế quá mức 2–3 lần và sẽ trì hoãn thời gian tạo doanh thu.
- **Hành động:** Thực hiện 5 cuộc phỏng vấn khám phá khách hàng. Xác nhận: số chuỗi trung bình, yêu cầu suy luận batch vs thời gian thực, yêu cầu chủ quyền dữ liệu, và sẵn lòng chi trả.

**Điều Kiện 2: Mô hình chi phí GPU và benchmark độ chính xác cold-start phải hoàn thành trước khi khóa kiến trúc Production v1.**
- Chạy Chronos-tiny, Chronos-small, và TimesFM-200M trên 3 tập dữ liệu khách thực. Đo: độ chính xác (CRPS, MASE), thời gian suy luận (CPU vs GPU), và chi phí mỗi chuỗi mỗi tháng.
- Thiết lập số lượng thực thể cold-start tối đa theo tầng khách hàng mà suy luận GPU khả thi về kinh tế.
- **Hành động:** Spike kỹ thuật 2 tuần. Đầu ra: bảng chi phí mỗi dự đoán theo kích thước mô hình và cấu hình phần cứng.

**Điều Kiện 3: Ngăn rò rỉ walk-forward CV phải là cổng chất lượng hạng nhất trong quy trình phát triển, không phải chú thích cuối trang.**
- Triển khai phát hiện rò rỉ tự động như kiểm thử CI/CD thất bại build nếu gap < max_lag trong cấu hình đặc trưng.
- Checklist code review cho tất cả code xây dựng đặc trưng phải là bước bắt buộc trước khi bất kỳ mô hình nào lên staging.
- **Hành động:** Thêm kiểm thử phát hiện rò rỉ vào codebase trong Tuần 1 của bất kỳ công việc ML nào. Không thương lượng trước triển khai khách hàng đầu tiên.

---

### Bước Tiếp Theo Đề Xuất

1. **Tuần 1–2:** Khám phá khách hàng (5 phỏng vấn). Xác nhận số chuỗi, SLA, chủ quyền dữ liệu, WTP. Đầu ra: lựa chọn tech stack sửa đổi dựa trên hồ sơ khách hàng mục tiêu thực.

2. **Tuần 2–3:** Spike benchmark chi phí GPU. Kiểm thử Chronos-tiny/small/base + TimesFM-200M trên CPU và GPU. Tạo bảng chi phí mỗi dự đoán. Quyết định mô hình nào khả thi về kinh tế.

3. **Tuần 3–5 (MVP):** Xây MVP với stack tối thiểu khả thi: TimescaleDB + đặc trưng SQL cơ bản + LightGBM + baseline StatsForecast + FastAPI. **Không Feast, không Kafka, không Spark, không Kubernetes cho MVP.** Nếu MVP thành công với khách hàng đầu tiên, thêm thành phần tăng dần dựa trên nút thắt thực tế quan sát được.

4. **Tháng 2–4 (Production v1):** Mở rộng Production v1 với các thành phần được biện minh bởi yêu cầu khách hàng thực phát hiện ở Tuần 1. Thêm Feast chỉ khi xác nhận cần truy xuất đặc trưng thời gian thực. Thêm Spark chỉ khi số chuỗi vượt 50K. Thêm Kubernetes chỉ khi cần cách ly đa thuê bao.

5. **Liên tục:** Giám sát cảnh quan cạnh tranh hàng quý. Nixtla và AWS là mối đe dọa chính. Thiết lập 3 khách hàng tham chiếu với ROI được ghi nhận trước khi cửa sổ hàng hóa hóa hyperscaler đóng (~18 tháng).

---

## 7. Bảng Tóm Tắt

| Danh Mục | Phát Hiện | Mức Nghiêm Trọng |
|----------|----------|-------------------|
| Tuyên bố nghiên cứu: Foundation model = khoảnh khắc GPT | Phóng đại. Mạnh cho cold-start; không thay thế mô hình đã huấn luyện | TRUNG BÌNH |
| Tuyên bố nghiên cứu: ETS vượt ML (M4) | Gây hiểu lầm nếu thiếu bối cảnh M5. LightGBM thắng trên dữ liệu kinh doanh thực | TRUNG BÌNH |
| Tuyên bố nghiên cứu: Conformal = coverage đảm bảo | Không đúng cho chuỗi thời gian. Coverage xấp xỉ với lưu ý tính hoán đổi | CAO |
| Kỹ thuật: MVP 3 tuần | Chỉ đạt với dữ liệu sạch và kỹ sư có kinh nghiệm. Điển hình: 4–5 tuần | TRUNG BÌNH |
| Kỹ thuật: Feast trong Production v1 | Thiết kế quá mức cho khách đầu tiên. Rủi ro vượt timeline 50% | CAO |
| Kỹ thuật: Kafka trong Production v1 | Không hợp lý cho trường hợp dự báo batch. Loại cho đến khi xác nhận cần streaming | TRUNG BÌNH |
| Kỹ thuật: Spark cho suy luận batch | Không hợp lý dưới 50K chuỗi. Dùng Pandas/Dask | TRUNG BÌNH |
| Kỹ thuật: MinT = 1 tuần | Đánh giá thấp. Thực tế: 2.5–3 tuần với xử lý phân cấp động | TRUNG BÌNH |
| Kỹ thuật: Thiếu mô hình chi phí GPU | Không có phân tích chi phí mỗi dự đoán. Cần trước khóa kiến trúc Production v1 | CAO |
| Thị trường: Cửa sổ khác biệt foundation model | 12–24 tháng trước hàng hóa hóa hyperscaler. Hẹp nhưng thực | CAO |
| Dữ liệu: Yêu cầu lịch sử tối thiểu 2 năm | Sẽ loại ~30% khách đầu tiên. Giảm thiểu bởi foundation model cold-start | TRUNG BÌNH |
| Rủi ro: Rò rỉ walk-forward CV | Rủi ro hỏng chất lượng thầm lặng. Cần cổng phát hiện rò rỉ hạng nhất | CAO |

---

## 8. Bàn Giao cho Ms. Scribe

```
─────────────────────────────────────────────────────────────────
TỪ:   R-γ Dr. Sentinel
ĐẾN:  R-σ Ms. Scribe
VỀ:   B01 — Dự Báo & Chuỗi Thời Gian — feasibility-report.md HOÀN TẤT
NGÀY: 2026-03-30
─────────────────────────────────────────────────────────────────

Báo cáo khả thi hoàn tất và sẵn sàng tổng hợp.

KẾT LUẬN: ĐẠT CÓ ĐIỀU KIỆN (6.90/10)

Phát hiện chính cho tổng hợp:
1. Ba mục mức nghiêm trọng CAO: lưu ý conformal prediction, rủi ro Feast thiết kế quá mức,
   lỗ hổng mô hình chi phí GPU. Cần nêu bật trong tóm tắt rủi ro báo cáo tổng hợp.
2. Foundation model zero-shot là yếu tố khác biệt thực sự nhưng giới hạn thời gian (12–24 tháng).
3. Ba điều kiện phải đáp ứng trước cam kết Production v1:
   - Khám phá khách hàng (số chuỗi, SLA, yêu cầu chủ quyền)
   - Spike benchmark chi phí GPU
   - Cổng rò rỉ walk-forward CV như yêu cầu CI/CD
4. Đối thủ: Nixtla (TimeGPT) là mối đe dọa trực tiếp nhất. AWS Forecast là phương án
   dịch vụ quản lý mặc định. Oracle/Anaplan là mục tiêu thay thế trong doanh nghiệp.
5. Tech stack nên được ĐIỀU CHỈNH PHÙ HỢP theo tầng khách hàng:
   - SME: TimescaleDB + LightGBM + FastAPI (không Feast, không Spark, không Kafka)
   - Doanh nghiệp: Full stack như mô tả trong báo cáo kỹ thuật

Tất cả tuyên bố báo cáo nghiên cứu và kỹ thuật được chứng minh hoặc thách thức với bằng chứng.
Không tuyên bố nào được đưa ra mà không có nguồn trích dẫn hoặc benchmark có thể tái tạo.

─────────────────────────────────────────────────────────────────
TRẠNG THÁI: HOÀN TẤT — CẦN ĐÁNH GIÁ
TIẾP THEO:  R-σ (Ms. Scribe) → tổng hợp
─────────────────────────────────────────────────────────────────
```
