# Ghi Chú Chuyên Gia Lĩnh Vực Logistics: B01 — Dự Báo & Chuỗi Thời Gian
## Bởi R-D06 (Logistics Domain Expert — Chuyên gia Lĩnh vực Logistics) — Ngày: 2026-03-30

---

### 1. Các Trường Hợp Sử Dụng Dự Báo Trong Logistics & Chuỗi Cung Ứng

**Dự Báo Khối Lượng Vận Chuyển**
- Dự đoán khối lượng đến/đi tại cấp trung tâm phân phối (DC) (tầm ngày, tuần, tháng)
- Đặt chỗ năng lực vận chuyển — dự báo quá cao = lãng phí chi phí, dự báo quá thấp = lỗi dịch vụ
- Dự báo thông lượng cảng cho kế hoạch nhập khẩu (thời gian dẫn 30–90 ngày)

**Lập Kế Hoạch Năng Lực**
- Lập kế hoạch nhân công kho hàng (nhân viên lấy hàng, đóng gói, nhận hàng so với khối lượng dự kiến)
- Lập lịch bến và quản lý sân — phân bổ slot xe tải đến
- Định cỡ đội xe: cần bao nhiêu phương tiện trên mỗi tuyến mỗi ngày/tuần

**Nhu Cầu Tuyến & Làn**
- Dự báo khối lượng cấp làn để đàm phán giá vận chuyển trước
- Dự báo mật độ giao hàng chặng cuối (bưu kiện mỗi khu vực mỗi ngày)
- Dự báo sử dụng cross-dock (trung chuyển)

**Bổ Sung Tồn Kho**
- Tính toán điểm đặt hàng lại và tồn kho an toàn từ dự báo nhu cầu
- Định vị tồn kho đa cấp (DC → trung tâm khu vực → cửa hàng)
- Phát hiện sớm hàng tồn chậm / hàng lỗi thời

---

### 2. Đặc Điểm Dữ Liệu Trong Logistics

**Mẫu Mùa Vụ**
- Tính mùa vụ hàng năm mạnh: mùa cao điểm (Q4 bán lẻ), tựu trường (tháng 8–9), gián đoạn Tết Nguyên Đán (tháng 2)
- Tính mùa vụ hàng tuần chi phối ở chặng cuối: Thứ 2/Thứ 3 cao, Thứ 7/CN thấp trong B2B
- Mẫu trong ngày quan trọng cho vận hành kho (đợt nhận hàng sáng, thời hạn xuất hàng chiều)

**Ảnh Hưởng Ngày Lễ & Lịch**
- Ngày lễ công cộng tạo ra ngày khối lượng bằng không, theo sau bởi đột biến nhu cầu
- Ảnh hưởng lịch âm rất quan trọng cho chuỗi cung ứng Châu Á - Thái Bình Dương
- Lịch khuyến mại (11.11, Black Friday) tạo đột biến ngoại lai cực đoan — phải được mô hình hóa là sự kiện đã biết, không phải bất thường

**Gián Đoạn & Thay Đổi Cấu Trúc**
- Tắc nghẽn cảng, đình công, sự kiện thời tiết tạo thay đổi mức đột ngột
- COVID-19 là ví dụ điển hình: dữ liệu 2020 thường nên được loại trừ hoặc đánh dấu
- Biến động giá vận chuyển (phụ phí nhiên liệu) ảnh hưởng đến lựa chọn phương thức và do đó cơ cấu khối lượng

**Dữ Liệu Thưa**
- Phần đuôi dài của SKU/làn với rất ít giao dịch — nhu cầu gián đoạn (intermittent demand)
- Làn mới / khách hàng mới = vấn đề khởi động lạnh (cold-start) với lịch sử bằng không
- Dữ liệu tổng hợp thường trông mượt; dữ liệu cấp làn chi tiết thì nhiễu

---

### 3. Các Chỉ Số Giá Trị Kinh Doanh

| Chỉ Số | Định Nghĩa | Tác Động Của Dự Báo |
|---|---|---|
| Vòng Quay Tồn Kho (Inventory Turns) | COGS / Tồn kho TB | Dự báo tốt hơn → tồn kho gọn hơn → vòng quay cao hơn |
| Tỷ Lệ Đáp Ứng (Fill Rate) | Đơn giao đủ / Tổng đơn | Tránh hết hàng nhờ tín hiệu nhu cầu chính xác |
| OTIF | % đơn hàng Đúng Hạn Đủ Hàng (On Time In Full) | Dự báo năng lực cho phép sẵn sàng nguồn lực |
| Độ Chính Xác Dự Báo (MAPE) | Sai số % Tuyệt đối TB so với thực tế | KPI mô hình trực tiếp; mục tiêu <15% ở cấp SKU/tuần |
| Thiên Lệch Dự Báo (Forecast Bias) | Dự báo hệ thống cao/thấp hơn | Thiên lệch gây ra hoặc tồn kho thừa hoặc mất doanh số |
| Sử Dụng Vận Chuyển (Carrier Utilization) | Tải thực / Năng lực đã đặt | Dự báo khối lượng chính xác giảm quãng đường chạy rỗng |
| Năng Suất Lao Động | Đơn vị/giờ so với kế hoạch | Độ chính xác dự báo khối lượng quyết định chất lượng kế hoạch nhân công |

---

### 4. Nhu Cầu Dự Báo Của Các Bên Liên Quan

**Quản lý Kho**
- Cần: khối lượng 1–2 tuần tới theo luồng công việc (nhận hàng, xuất hàng, đổi trả)
- Chi tiết: hàng ngày, ưu tiên theo ca
- Định dạng: bảng điều khiển đơn giản với cảnh báo nếu dự báo lệch >20% so với kế hoạch

**Lập Kế Hoạch Đội Xe & Vận Tải**
- Cần: khối lượng cấp làn 4–13 tuần tới cho đàm phán vận chuyển
- Chi tiết: hàng tuần theo cặp xuất phát-đích
- Định dạng: xuất được sang TMS; khoảng tin cậy quan trọng cho lập kế hoạch đệm

**Đội Mua Hàng / Thu Mua**
- Cần: nhu cầu 3–12 tháng tới cho tạo đơn đặt hàng
- Chi tiết: hàng tháng theo danh mục hoặc nhà cung cấp
- Quan tâm: hướng thiên lệch (dự báo thấp = hết hàng, dự báo cao = chi phí tồn kho thừa)

**Tài Chính / S&OP**
- Cần: dự báo doanh thu và chi phí 12–18 tháng cho ngân sách
- Chi tiết: hàng tháng tổng hợp
- Đối soát dự báo thống kê vs. dự báo kinh doanh vs. kế hoạch tài chính

**Dịch Vụ Khách Hàng / Quản Lý Tài Khoản**
- Cần: dự báo khối lượng cấp khách hàng để quản lý kỳ vọng và phân bổ

---

### 5. Các Nguồn Dữ Liệu Chính Trong Logistics

| Nguồn | Dữ Liệu Có Sẵn | Ghi Chú |
|---|---|---|
| TMS (Hệ thống Quản lý Vận tải) | Lịch sử vận chuyển, làn, trọng lượng, vận chuyển, chi phí | Lịch sử vận hành đáng tin cậy nhất |
| WMS (Hệ thống Quản lý Kho) | Đơn vị đến/đi, giờ lao động, sự kiện bến | Dữ liệu vận hành phong phú; thường bị cô lập |
| ERP / Quản Lý Đơn Hàng | Đơn hàng khách, PO, đơn tồn đọng | Tín hiệu nhu cầu thượng nguồn vận chuyển |
| EDI / API Vận Chuyển | Xác nhận đặt chỗ, sự kiện POD, ngoại lệ | Bên ngoài nhưng có giá trị cho tín hiệu gián đoạn |
| API Thời Tiết | Nhiệt độ, bão, mẫu mùa vụ | Biến đồng hành hữu ích cho chuỗi lạnh, chặng cuối |
| Lịch Ngày Lễ Công Cộng | Ngày lễ theo quốc gia/khu vực | Biến hồi quy ngoại sinh thiết yếu |
| Lịch Khuyến Mại / Sự Kiện | Khuyến mại bán hàng, sự kiện thương mại | Phải được thu thập dưới dạng sự kiện tương lai đã biết |
| Chỉ Số Thị Trường | Giá nhiên liệu, chỉ số vận tải (Baltic Dry, Freightos) | Chỉ báo dẫn đầu cho thay đổi nhu cầu |

---

### 6. Thách Thức Đặc Thù Logistics

**Phức Tạp Chặng Cuối (Last-Mile)**
- Chi tiết cấp địa chỉ tạo ra hàng triệu chuỗi thời gian thưa
- Giao hàng thất bại yêu cầu dự báo lại nhu cầu giao lại
- Thay đổi mật độ đô thị (micro-fulfillment) thay đổi mẫu lịch sử

**Chuỗi Lạnh (Cold Chain)**
- Sự kiện vượt nhiệt độ gây tổn thất không thể phục hồi — dự báo phải thận trọng
- Sản phẩm dễ hỏng có ràng buộc hết hạn cứng; dự báo quá cao = lãng phí, không chỉ tồn kho thừa
- Tầm nhu cầu ngắn hơn (ngày không phải tuần) tăng độ nhạy với sai số

**Tồn Kho Đa Cấp (Multi-Echelon)**
- Sai số dự báo ở một nút lan truyền và khuếch đại hạ nguồn (hiệu ứng roi da — bullwhip effect)
- Mỗi cấp cần mô hình riêng nhưng phải nhất quán (dự báo phân cấp — hierarchical forecasting)
- Tồn kho an toàn ở mỗi cấp phải tính đến sự không chắc chắn dự báo tích lũy

**Nhu Cầu Gián Đoạn (Intermittent Demand)**
- Phụ tùng chậm luân chuyển, SKU mùa vụ: nhiều giá trị zero trong lịch sử
- ARIMA/ETS tiêu chuẩn hoạt động kém; dùng phương pháp Croston, ADIDA, hoặc Bayesian
- Đánh giá dự báo gián đoạn yêu cầu chỉ số khác (MASE, không phải MAPE)

---

### 7. Phương Pháp Khuyến Nghị Cho Dự Án Logistics

1. **Bắt đầu với tổng hợp khối lượng** — dự báo ở cấp DC/tuần trước, sau đó phân tách
2. **Xây dựng lịch ngày lễ/khuyến mại** như đầu vào bắt buộc trước khi mô hình hóa
3. **Tách nhu cầu bình thường khỏi sự kiện ngoại lai** — làm sạch dữ liệu COVID 2020, đánh dấu sự kiện đỉnh
4. **Dùng đối soát phân cấp** (ví dụ: MinT) để đảm bảo dự báo DC + làn + SKU nhất quán
5. **Xác định tầm dự báo theo bên liên quan** — không dùng một mô hình cho tất cả trường hợp sử dụng
6. **Giám sát thiên lệch dự báo một cách nghiêm ngặt** — trong logistics, thiên lệch hệ thống gây hại nhiều hơn sai số ngẫu nhiên
7. **Dùng baseline với mô hình đơn giản** (trung bình trượt, naive mùa vụ) trước khi triển khai ML — đơn giản thường thắng ở cấp tổng hợp
