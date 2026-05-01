# Ghi Chú Phân Tích Dữ Liệu: B01 — Dự Báo & Chuỗi Thời Gian
## Bởi R-DA (Data Analyst — Chuyên viên Phân tích Dữ liệu) — Ngày: 2026-03-30

---

### 1. EDA (Phân Tích Dữ Liệu Khám Phá) Cho Chuỗi Thời Gian

Trước khi đụng vào bất kỳ mô hình nào, luôn chạy các kiểm tra sau:

**Phân rã trước.**
Tách chuỗi thành Xu hướng + Mùa vụ + Phần dư (cộng hoặc nhân). Dùng `seasonal_decompose` (statsmodels) hoặc phân rã STL. Điều này cho bạn biết ngay liệu mẫu hình có tồn tại hay không và mạnh đến mức nào so với nhiễu.

**Kiểm tra tính dừng (Stationarity check).**
- Trực quan: vẽ trung bình trượt và độ lệch chuẩn trượt (cửa sổ = 12 cho dữ liệu hàng tháng). Nếu chúng trôi dạt, chuỗi là không dừng.
- Thống kê: kiểm định ADF (Augmented Dickey-Fuller). Nếu p-value > 0.05, chuỗi có nghiệm đơn vị — cần sai phân.
- Kiểm định KPSS để kiểm tra chéo (giả thuyết không ngược với ADF).

**Biểu đồ tự tương quan.**
- ACF (Hàm Tự tương quan): thể hiện tương quan với các giá trị trễ. Đỉnh mùa vụ ở khoảng cách đều xác nhận tính mùa vụ.
- PACF (ACF Riêng phần): dùng để xác định bậc trễ AR.
- Quy tắc tham khảo: nếu ACF cắt đột ngột và PACF suy giảm chậm → mô hình MA. Ngược lại → mô hình AR.

**Giá trị thiếu và ngoại lai.**
- Giá trị thiếu chuỗi thời gian không thể điền tiến một cách mù quáng — nội suy (tuyến tính hoặc spline) an toàn hơn.
- Xác định ngoại lai qua phần dư sau phân rã, không phải trên giá trị thô.

**Các câu hỏi chính cần trả lời trong EDA:**
1. Tần suất mùa vụ chi phối là gì? (Hàng tuần, hàng tháng, hàng năm?)
2. Xu hướng là tuyến tính, lũy thừa, hay phẳng?
3. Có thay đổi cấu trúc không (sự kiện, thay đổi chính sách, đột biến COVID)?
4. Nhiễu chiếm bao nhiêu phương sai so với tín hiệu?

---

### 2. Câu Hỏi Kinh Doanh Mà Dự Báo Trả Lời

Định khung đầu ra dự báo xung quanh quyết định, không phải độ chính xác mô hình.

| Bối Cảnh Kinh Doanh | Câu Hỏi Chính | Tầm Dự Báo |
|---|---|---|
| Lập Kế Hoạch Nhu Cầu | Cần đặt bao nhiêu tồn kho tháng tới? | 4–12 tuần |
| Lập Kế Hoạch Năng Lực | Cần bao nhiêu nhân sự quý tới? | 1–3 tháng |
| Ngân Sách & Tài Chính | Doanh thu dự kiến năm tài chính tới là bao nhiêu? | 12 tháng |
| Logistics / Chuỗi Cung Ứng | Khi nào xảy ra hết hàng? | 2–8 tuần |
| Marketing | Giai đoạn chiến dịch nào sẽ có nhu cầu đỉnh? | 4–8 tuần |
| Lập Kế Hoạch Nhân Sự | Khi nào nhu cầu tuyển dụng đạt đỉnh? | 1–2 quý |

**Mẹo định khung cho chuyên viên phân tích:** Luôn hỏi chủ sở hữu kinh doanh — "Bạn sẽ ra quyết định gì khác biệt dựa trên dự báo này?" Nếu câu trả lời mơ hồ, yêu cầu dự báo chưa sẵn sàng.

---

### 3. KPI & Chỉ Số Thành Công

"Chính xác" có nghĩa khác nhau trong các bối cảnh khác nhau. Xác định thành công trước khi xây dựng mô hình.

**Các chỉ số sai số chuẩn:**
- **MAE** (Mean Absolute Error — Sai số Tuyệt đối Trung bình) — trực quan, cùng đơn vị với mục tiêu. Tốt nhất để giao tiếp với doanh nghiệp.
- **MAPE** (Mean Absolute Percentage Error — Sai số Phần trăm Tuyệt đối Trung bình) — hữu ích để so sánh giữa các tỷ lệ. Tránh khi giá trị thực có thể bằng không.
- **RMSE** — phạt sai số lớn nhiều hơn. Dùng khi sai số lớn gây tốn kém (ví dụ: hết hàng tồn kho).
- **MASE** (Mean Absolute Scaled Error — Sai số Tỷ lệ Tuyệt đối Trung bình) — so sánh với dự báo naive. Tốt nhất cho tính chặt chẽ học thuật và so sánh liên chuỗi.

**Ngưỡng cấp doanh nghiệp (quy tắc tham khảo):**
| Ngành | MAPE Chấp Nhận Được |
|---|---|
| Bán lẻ / FMCG | < 10–15% |
| Tiện ích | < 5% |
| Dự báo tài chính | < 5–8% |
| Sản phẩm mới / khối lượng thấp | < 25–30% |

**KPI phi sai số mà chuyên viên phân tích thường bỏ qua:**
- Thiên lệch dự báo (Forecast bias) — dự báo hệ thống cao hoặc thấp hơn — kiểm tra bằng Sai số Trung bình (ME), không chỉ MAE.
- Độ phủ dự báo: % thời gian giá trị thực nằm trong khoảng tin cậy.
- Tác động kinh doanh: Dự báo có giảm hết hàng không? Cải thiện độ chính xác ngân sách không? Lượng hóa bằng tiền, không chỉ MAPE.

---

### 4. Truyền Đạt Độ Không Chắc Chắn Của Dự Báo

Các bên liên quan phi kỹ thuật không muốn p-value. Họ muốn câu trả lời có thể hành động được.

**Ba cách tiếp cận thực tế:**

1. **Dải tin cậy trên biểu đồ** — vẽ khoảng dự báo 80% và 95%. Ghi nhãn "phạm vi có khả năng" và "phạm vi ngoài." Tránh thuật ngữ "khoảng tin cậy" trong bài trình bày lãnh đạo.

2. **Lập kế hoạch kịch bản (Thấp / Cơ sở / Cao):**
   - Kịch bản thấp: giả định bi quan (nhu cầu giảm 10%)
   - Kịch bản cơ sở: ước tính trung tâm của mô hình
   - Kịch bản cao: giả định lạc quan (nhu cầu tăng 10%)
   - Gắn mỗi kịch bản với câu chuyện kinh doanh, không chỉ một con số.

3. **Định khung "Điều gì cần đúng":** Thay vì hiển thị thanh sai số, hỏi "Để nhu cầu vượt dự báo 20%, X cần phải xảy ra." Điều này làm cho sự không chắc chắn trở nên cụ thể.

**Sai lầm phổ biến:** Trình bày một dự báo điểm đơn lẻ cho lãnh đạo mà không có bất kỳ phạm vi nào. Điều này ngụ ý độ chính xác giả và phá hủy niềm tin khi mô hình sai (và nó sẽ sai).

**Quy tắc tham khảo:** Tầm dự báo càng xa, dải không chắc chắn càng rộng. Hiển thị trực quan điều này — biểu đồ quạt rất hiệu quả.

---

### 5. Các Mẫu Trực Quan Hóa

**Các biểu đồ cốt lõi mà mọi chuyên viên phân tích chuỗi thời gian cần tạo:**

1. **Biểu đồ chuỗi thời gian thô** — luôn bắt đầu từ đây. Đánh dấu các sự kiện quan trọng (khuyến mại, COVID, thay đổi chính sách) dưới dạng đường tham chiếu dọc.

2. **Biểu đồ phân rã** — 4 bảng: gốc, xu hướng, mùa vụ, phần dư. Kiểm tra nhanh tín hiệu vs. nhiễu.

3. **Dự báo vs. Thực tế (giai đoạn giữ lại)** — vẽ dự báo mô hình trên giai đoạn test đã giữ bên cạnh giá trị thực. Tô bóng khoảng dự báo. Đây là slide uy tín mô hình của bạn.

4. **Biểu đồ phần dư** — vẽ phần dư theo thời gian. Nên trông như nhiễu trắng (không có mẫu hình). Nếu bạn thấy xu hướng hoặc mẫu mùa vụ trong phần dư, mô hình đang thiếu gì đó.

5. **Biểu đồ ACF của phần dư** — xác nhận không còn tự tương quan. Nếu phần dư có tự tương quan, mô hình chưa khớp đầy đủ.

6. **MAE / MAPE trượt theo thời gian** — cho thấy liệu độ chính xác dự báo có đang suy giảm không. Hữu ích cho giám sát trong sản xuất.

**Khuyến nghị công cụ:** Dùng Plotly hoặc Altair cho biểu đồ chuỗi thời gian tương tác trong bảng điều khiển cho bên liên quan. Matplotlib/seaborn cho báo cáo tĩnh.

---

### 6. Các Chuẩn Tham Chiếu Baseline

Luôn chạy các baseline này trước khi trình bày kết quả mô hình ML. Nếu mô hình ML không thắng được chúng, nó không tạo thêm giá trị.

| Mô Hình Baseline | Mô Tả | Khi Nào Dùng |
|---|---|---|
| Dự Báo Naive | Kỳ tiếp theo = giá trị quan sát gần nhất | Bất kỳ chuỗi nào |
| Naive Mùa Vụ | Kỳ tiếp theo = cùng kỳ năm/tuần trước | Chuỗi có tính mùa vụ mạnh |
| Trung Bình Trượt Đơn Giản | Trung bình N kỳ gần nhất | Chuỗi ổn định, không có xu hướng |
| San Mũ Đơn Giản (SES) | Trung bình có trọng số, trọng số lớn hơn cho gần đây | Chuỗi có xu hướng không có mùa vụ |
| Holt-Winters | ETS với xu hướng + mùa vụ | Hầu hết chuỗi thời gian kinh doanh |

**Quy trình so sánh chuẩn:**
1. Chia dữ liệu: 80% huấn luyện, 20% kiểm tra (hoặc N kỳ cuối làm tập giữ lại).
2. Khớp tất cả baseline trên tập huấn luyện.
3. Tính MAE / MAPE trên tập kiểm tra.
4. Ghi lại kết quả trong bảng so sánh.
5. Trình bày mô hình ML chỉ khi nó vượt trội có ý nghĩa (cải thiện > 10–15% trên MAPE).

**Thông điệp chính cho bên liên quan:** "Mô hình của chúng tôi vượt trội hơn dự báo naive mùa vụ đơn giản 18% — đó là giá trị chúng tôi đang mang lại."

---

### 7. Các Sai Lầm Phổ Biến Của Chuyên Viên Phân Tích

1. **Tin tưởng mô hình quá mức.** Mô hình có MAPE 5% trên dữ liệu huấn luyện không phải là mô hình MAPE 5% trong sản xuất. Luôn kiểm chứng trên giai đoạn giữ lại thực sự, không chỉ kiểm chứng chéo.

2. **Bỏ qua mùa vụ trong EDA.** Nhảy thẳng vào mô hình mà không phân rã chuỗi trước. Kết quả: mô hình học sai tín hiệu.

3. **Đối xử mọi sai số như nhau.** MAPE 10% trên dòng doanh thu $10 triệu rất khác với 10% trên dòng sản phẩm $10 nghìn. Đánh trọng số sai số theo tác động kinh doanh.

4. **Không kiểm tra rò rỉ dữ liệu.** Sử dụng thông tin tương lai (ví dụ: cờ khuyến mại chỉ biết sau thực tế) làm đặc trưng. Mô hình trông tuyệt vời trong kiểm tra hồi tố và thất bại khi chạy thực.

5. **Nhầm lẫn tương quan với nhân quả.** Doanh số kem tương quan với tử vong do đuối nước (cả hai đạt đỉnh mùa hè). Tương quan đặc trưng trong mô hình chuỗi thời gian không ngụ ý đặc trưng đó điều khiển dự báo.

6. **Trình bày dự báo điểm đơn lẻ.** Luôn kèm theo phạm vi. Dự báo không có giới hạn không chắc chắn không phải là dự báo — nó là phỏng đoán có mô hình đi kèm.

7. **Bỏ qua phân tích phần dư.** Tuyên bố mô hình "xong" sau khi kiểm tra MAE. Phần dư có cấu trúc là tín hiệu rõ ràng mô hình sai, bất kể chỉ số sai số tổng hợp.

8. **Bỏ qua thay đổi cấu trúc.** Khớp mô hình trên dữ liệu trước COVID và triển khai sau COVID mà không huấn luyện lại hoặc thêm chỉ báo chế độ.

---

*Ghi chú được biên soạn cho Nền tảng Đồ thị Tri thức MAESTRO — Mô-đun B01, Giai đoạn 1 Lớp 2 Nghiên Cứu Thực Hành.*
