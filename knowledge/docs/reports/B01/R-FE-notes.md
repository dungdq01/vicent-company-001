# Ghi Chú Kỹ Thuật Frontend: B01 — Dự Báo & Chuỗi Thời Gian
## Bởi R-FE (Frontend Engineer — Kỹ sư Frontend) — Ngày: 2026-03-30

---

### 1. Các Loại Biểu Đồ Cho Chuỗi Thời Gian

**Biểu Đồ Đường (công cụ chính)**
- Giá trị thực là đường liền; dự báo là đường nét đứt — quy ước trực quan người dùng mong đợi
- Dải tin cậy là vùng tô mờ quanh đường dự báo (dải 80% + 95%)
- Dùng màu sắc riêng biệt: thực tế = xanh dương/đậm, dự báo = cam/nhạt hơn, dải = tô mờ trong suốt

**Trực Quan Hóa Tầm Dự Báo**
- Đường dọc "hôm nay" phân tách vùng lịch sử và vùng dự báo
- Tô nhạt nền vùng dự báo (ví dụ: xám rất nhạt) để báo hiệu vùng không chắc chắn
- Tránh làm vùng dự báo trông giống hệt giá trị thực — người dùng sẽ hiểu nhầm mức tin cậy

**Biểu Đồ Phân Rã (nâng cao)**
- Xếp chồng hoặc bảng riêng: Quan sát | Xu hướng | Mùa vụ | Phần dư
- Dùng bố cục small multiples — mỗi thành phần trong hàng biểu đồ riêng
- Quan trọng để xây dựng niềm tin của kế hoạch viên: "đây là lý do mô hình nghĩ Q4 sẽ tăng đột biến"

**Biểu Đồ Cột + Đường Kết Hợp (khối lượng + xu hướng)**
- Cột cho khối lượng thực (tuần/tháng), phủ đường cho dự báo
- Phổ biến trong bảng điều khiển logistics — quản lý kho đọc biểu đồ cột trực quan
- Hoạt động tốt ở chi tiết thấp hơn; tránh ở cấp ngày với >90 cột

**Bản Đồ Nhiệt — Heatmap (so sánh đa chuỗi)**
- Hàng = SKU/làn, cột = kỳ thời gian, màu = giá trị dự báo hoặc sai số
- Hữu ích để phát hiện dự báo hệ thống thấp/cao hơn xuyên suốt danh mục sản phẩm
- Không dành cho người dùng phổ thông — phù hợp cho chế độ xem phân tích sâu

---

### 2. Các Mẫu UX Bảng Điều Khiển Dự Báo

**Điều Khiển Cốt Lõi (luôn hiển thị)**
```
[ Chọn thực thể: SKU / Địa điểm / Làn ▼ ]  [ Chi tiết: Ngày | Tuần | Tháng ]
[ Phạm vi ngày: [bắt đầu] — [kết thúc] ]  [ Tầm: 4T | 13T | 26T ]  [ Làm mới ]
```

**Chuyển Đổi Thực Tế vs. Dự Báo**
- Mặc định: hiện cả hai; cho phép ẩn thực tế để tập trung vào góc nhìn tương lai
- "Chế độ chính xác": chuyển sang hiển thị thực tế so với dự báo quá khứ cho chế độ xem kiểm chứng mô hình
- Trạng thái nên được lưu trong tham số URL để chia sẻ được (`?view=accuracy&granularity=week`)

**Mẫu Ghi Đè Của Kế Hoạch Viên**
- Nhấp bất kỳ điểm dự báo nào → chỉnh sửa inline hoặc bảng bên nhập liệu
- Hiển thị delta: dự báo gốc vs. giá trị ghi đè một cách nổi bật
- Biểu tượng khóa trên các kỳ đã ghi đè — tín hiệu trực quan rằng phán đoán con người đã được áp dụng
- Nút "Đặt lại về mô hình" — không bao giờ xóa vĩnh viễn dự báo của mô hình

**Hiển Thị Cảnh Báo / Ngoại Lệ**
- Huy hiệu đếm trên các mục dự báo vượt ngưỡng năng lực
- Danh sách có thể sắp xếp: "Top 10 mục có thay đổi dự báo lớn nhất so với tuần trước"
- Mã màu đỏ/vàng/xanh trên dải MAPE (xanh <10%, vàng 10–20%, đỏ >20%)

**Điều Hướng Phân Cấp**
- Breadcrumb: Tất Cả → Khu Vực → DC → SKU
- Nhấp điểm biểu đồ ở cấp tổng hợp đi sâu xuống con
- Nút "Cuộn lên" để quay lại; giữ nguyên ngữ cảnh bộ lọc khi điều hướng

---

### 3. Truyền Đạt Sự Không Chắc Chắn Trong UI

**Với người dùng phi kỹ thuật, tránh dùng từ "khoảng tin cậy"**
- Dùng: "Phạm vi dự kiến" hoặc "Nhiều khả năng nằm giữa X và Y"
- Tooltip khi rê chuột: "Có 80% khả năng giá trị thực sẽ nằm trong phạm vi này"
- Cân nhắc định khung "Tốt nhất / Dự kiến / Xấu nhất" cho lập kế hoạch vận hành

**Mã Hóa Trực Quan Sự Không Chắc Chắn**
- Dải rộng hơn = không chắc chắn hơn; làm rõ điều này với chú thích legend
- Làm mờ/nhòe đường dự báo nhẹ khi kéo dài xa hơn vào tương lai
- Không hiển thị dải nếu người dùng thấy rối — "dự báo ± phần trăm đệm" đơn lẻ có thể rõ ràng hơn

**Chú Thích Ngữ Cảnh**
- Đánh dấu sự kiện tương lai đã biết trên biểu đồ: "Tết Nguyên Đán", "Khuyến mại dự kiến"
- Giải thích tại sao mô hình dự báo đột biến — giảm sự nghi ngờ của kế hoạch viên
- Dùng đường tham chiếu dọc với tooltip nhãn; tránh làm rối với quá nhiều đánh dấu

**Chỉ Báo Thiên Lệch**
- Widget nhỏ cố định: "Mô hình đã dự báo cao hơn X% trung bình trong 4 tuần qua"
- Mã màu: xám (trung tính), cam (>5% thiên lệch), đỏ (>15% thiên lệch)
- Liên kết đến báo cáo độ chính xác chi tiết cho kế hoạch viên muốn tìm hiểu

---

### 4. Hiệu Năng Cho Tập Dữ Liệu Lớn

**Ngưỡng Khối Lượng Dữ Liệu**
- <10K điểm: render tất cả, không cần tối ưu
- 10K–100K điểm: giảm mẫu để hiển thị; giữ dữ liệu đầy đủ để xuất
- 100K+ điểm: tổng hợp phía server bắt buộc; không bao giờ gửi điểm thô đến trình duyệt

**Chiến Lược Giảm Mẫu**
- LTTB (Largest Triangle Three Buckets): tối ưu về mặt tri giác; bảo toàn hình dạng trực quan
- Tổng hợp min/max theo cột pixel: bảo toàn cực trị (tốt cho khả năng nhìn thấy bất thường)
- Tránh trung bình đơn giản — nó ẩn đột biến quan trọng về mặt vận hành

**Ảo Hóa (Virtualization)**
- Dùng render theo cửa sổ cho bảng lớn đi kèm biểu đồ (react-virtual, TanStack Virtual)
- Phân trang hoặc ảo hóa danh sách chọn thực thể khi >500 chuỗi

**Bộ Nhớ Đệm & UX Tải**
- Cache kết quả dự báo trong React Query / SWR với stale-while-revalidate
- Hiển thị skeleton loader (không phải spinner) cho vùng biểu đồ — duy trì ổn định bố cục
- Tải trước cửa sổ thời gian liền kề khi nhàn rỗi: nếu người dùng đang xem tháng 1, tải trước tháng 12 và tháng 2

**Hiệu Năng Xuất**
- Không bao giờ tạo CSV lớn trong trình duyệt — kích hoạt job xuất phía server, tải xuống streaming
- Cho xuất hình ảnh biểu đồ, dùng render dựa canvas (không phải SVG) cho tập dữ liệu lớn

---

### 5. So Sánh Thư Viện

| Thư Viện | Điểm Mạnh | Điểm Yếu | Phù Hợp Nhất Cho |
|---|---|---|---|
| **Recharts** | React-native, dễ tùy chỉnh, tài liệu tốt | Khó khăn >50K điểm, chú thích tích hợp hạn chế | Bảng điều khiển tiêu chuẩn, tập dữ liệu trung bình |
| **Plotly.js** | Giàu tính năng, dải tin cậy tích hợp, xuất | Bundle lớn (~3MB), kiểu dáng cứng nhắc | Công cụ phân tích, thử nghiệm nhanh |
| **D3.js** | Linh hoạt không giới hạn, kiểm soát hiệu năng tốt nhất | Đường cong học tập rất cao, code dài dòng | Trực quan hóa doanh nghiệp tùy chỉnh, tương tác phức tạp |
| **Chart.js** | Nhẹ, API đơn giản, dựa canvas (nhanh) | Ít thân thiện React (dùng react-chartjs-2), tính năng chuỗi thời gian hạn chế | Bảng điều khiển đơn giản, yêu cầu hiệu năng cao |
| **Apache ECharts** | Hiệu năng tuyệt vời, hỗ trợ chuỗi thời gian phong phú, mobile tốt | Ít phổ biến trong hệ sinh thái React, tài liệu thiên tiếng Trung | Dữ liệu khối lượng lớn, bảng điều khiển logistics quy mô lớn |
| **Vega-Lite / Observable Plot** | Khai báo, tuyệt vời cho chế độ xem phân tích | Không thân thiện UI production, tích hợp UX dốc | Công cụ phân tích nội bộ |

**Khuyến nghị cho bảng điều khiển dự báo logistics:**
- Ứng dụng production: **Recharts** cho chế độ xem tiêu chuẩn + **ECharts** cho chuỗi khối lượng cao
- PoC / công cụ nội bộ: **Plotly** để giao tính năng nhanh nhất
- Sản phẩm doanh nghiệp có thương hiệu tùy chỉnh: **D3** (chấp nhận chi phí, đạt kiểm soát hoàn toàn)

---

### 6. Các Sai Lầm Frontend Phổ Biến

1. **Hiển thị số dự báo thô không làm tròn** — "1.247,3 đơn vị" gây rối kế hoạch viên. Làm tròn đến độ chính xác có ý nghĩa kinh doanh (chục hoặc trăm gần nhất cho khối lượng cao, đơn vị gần nhất cho khối lượng thấp).

2. **Không có trạng thái tải cho lấy dự báo dài** — Dự báo có thể mất 2–10 giây. Biểu đồ trống không có phản hồi khiến người dùng nghĩ hệ thống hỏng. Luôn hiển thị skeleton hoặc chỉ báo tiến trình.

3. **Tự động co trục biểu đồ ẩn ngữ cảnh** — Nếu thực tế là 1.000 đơn vị và dự báo giảm xuống 950, tự động co khiến nó trông như vực thẳm. Cân nhắc zero-baseline hoặc khóa trục do người dùng kiểm soát.

4. **Bỏ qua mobile cho người dùng sàn kho** — Quản lý kho thường kiểm tra bảng điều khiển trên tablet. Kiểm thử ở chiều rộng 768px. Thu gọn điều khiển vào drawer; phóng to vùng chạm trên biểu đồ.

5. **Quá tải một biểu đồ** — Thực tế + dự báo + dải trên + dải dưới + năm trước + ngân sách trên một biểu đồ trở nên không đọc được. Cung cấp chuyển đổi "Đơn giản / Chi tiết"; mặc định là đơn giản.

6. **Không có khả năng xuất / chia sẻ** — Kế hoạch viên cần đưa dự báo vào email và slide. Xuất PNG và tải CSV là yêu cầu tối thiểu. Xây dựng từ ngày đầu, không phải bổ sung sau.

7. **Dữ liệu ghi đè dự báo không được lưu vào URL hoặc state cục bộ** — Kế hoạch viên ghi đè, rồi vô tình điều hướng đi và mất tất cả thay đổi. Lưu ghi đè debounce vào server hoặc ít nhất vào localStorage ngay lập tức.
