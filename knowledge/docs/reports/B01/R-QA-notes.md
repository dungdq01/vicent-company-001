# Ghi Chú Kỹ Thuật QA: B01 — Dự Báo & Chuỗi Thời Gian
## Bởi R-QA (QA Engineer — Kỹ sư Đảm bảo Chất lượng) — Ngày: 2026-03-30

---

### 1. Tổng Quan Chiến Lược Kiểm Thử

**Kim tự tháp kiểm thử cho hệ thống dự báo:**

```
          [E2E / Smoke]            — ít, độ tin cậy cao, chậm
        [Integration Tests]        — hợp đồng API, feature store, ghi DB
    [Model Regression Tests]       — kiểm tra hồi tố, holdout, cổng chất lượng
  [Unit Tests]                     — biến đổi đặc trưng, tiền xử lý, tiện ích
```

**Phạm vi mỗi lớp:**
- **Unit:** Hàm kỹ thuật đặc trưng, biến đổi tiền xử lý, kiểm chứng schema, hàm tiện ích. Nhắm mục tiêu 80%+ code coverage trên code pipeline dữ liệu.
- **Integration:** Kiểm chứng yêu cầu/phản hồi API, ghi cơ sở dữ liệu, đọc feature store, vòng đời job bất đồng bộ (hàng đợi → hoàn thành → lấy kết quả).
- **Model regression:** Chỉ số chính xác trên tập dữ liệu lịch sử cố định. Chạy mỗi khi phiên bản mô hình thay đổi. Chặn triển khai nếu vi phạm ngưỡng.
- **E2E / Smoke:** Một yêu cầu dự báo đại diện đầu-cuối (hạ tầng thực). Chạy sau triển khai. Phải hoàn thành trong SLA.

**Quản lý dữ liệu kiểm thử:**
- Duy trì **tập dữ liệu fixture kiểm thử** được quản lý phiên bản (không bao giờ dùng dữ liệu production). Bao gồm trường hợp biên: chuỗi ngắn, kỳ toàn zero, chuỗi có khoảng trống, chuỗi có đột biến.
- Ghim phiên bản tập dữ liệu trong CI. Thay đổi tập dữ liệu yêu cầu xem xét rõ ràng — chúng thay đổi ý nghĩa của "đạt".

---

### 2. Các Mẫu Kiểm Thử Mô Hình

**Kiểm tra hồi tố — Backtesting (phương pháp kiểm chứng chính):**
- Mô phỏng dự báo lịch sử bằng cách huấn luyện trên dữ liệu đến thời điểm cắt T, dự báo tầm H, so sánh với giá trị thực đã biết.
- Chạy nhiều thời điểm cắt (ví dụ: 12 tháng gần nhất với thời điểm cắt hàng tháng) để có phân phối sai số — không chỉ một ảnh chụp.
- Báo cáo: MAPE, RMSE, MAE, thiên lệch (sai số trung bình — dấu quan trọng). Báo cáo theo nhóm thực thể, không chỉ tổng hợp.

**Kiểm chứng Walk-forward (cửa sổ mở rộng):**
```
Train: [t0 → t1]  Dự báo: [t1+1 → t1+H]  → tính sai số
Train: [t0 → t2]  Dự báo: [t2+1 → t2+H]  → tính sai số
...
Trung bình sai số qua tất cả cửa sổ.
```
Dùng khi mô hình có thể hoạt động khác nhau qua các giai đoạn thời gian (mùa vụ, thay đổi xu hướng).

**Kiểm chứng Holdout:**
- Giữ lại H kỳ gần nhất làm tập holdout không bao giờ đụng đến. Đánh giá mô hình cuối cùng chỉ một lần.
- Không dùng holdout cho tinh chỉnh siêu tham số — dùng kiểm chứng chéo cho việc đó.

**Kiểm tra độ phủ khoảng dự báo:**
- Với khoảng dự báo 80% được tuyên bố: thực nghiệm, 80% ± 3% giá trị thực nên nằm trong khoảng trên tập test.
- Đánh trượt mô hình nếu độ phủ dưới 70% hoặc trên 90% cho khoảng danh nghĩa 80% (cho thấy sự không chắc chắn bị hiệu chuẩn sai).

**So sánh baseline naive:**
- Luôn so sánh mô hình ứng viên với naive mùa vụ (cùng kỳ năm trước) và trung bình trượt đơn giản.
- Mô hình không thắng được naive trên tập dữ liệu chuẩn thì chưa sẵn sàng cho production.

---

### 3. Kiểm Thử Chất Lượng Dữ Liệu

**Kiểm chứng schema (chạy trên mỗi lần thu thập dữ liệu):**
- Có đầy đủ các cột bắt buộc và đúng kiểu dữ liệu.
- Không có tổ hợp `(entity_id, date)` trùng lặp.
- Cột ngày phân tích được và nằm trong phạm vi dự kiến (không có ngày tương lai trong dữ liệu huấn luyện, không có ngày cũ hơn N năm).

**Kiểm tra phạm vi:**
- Biến mục tiêu (ví dụ: nhu cầu) >= 0 (không có nhu cầu âm).
- Giá trị đặc trưng nằm trong min/max lịch sử ± đệm 20%. Đánh dấu ngoại lai > 3 độ lệch chuẩn.
- Từ chối hoặc cách ly bản ghi có NaN trong đặc trưng bắt buộc.

**Kiểm tra độ tươi:**
- Xác minh ngày bản ghi mới nhất nằm trong độ trễ dự kiến. Ví dụ: dữ liệu bán hàng hàng ngày nên có bản ghi trong vòng 2 ngày kể từ hôm nay.
- Cảnh báo nếu độ trễ dữ liệu vượt ngưỡng — dữ liệu cũ tạo ra dự báo cũ một cách âm thầm.

**Kiểm tra đầy đủ:**
- Cho mỗi thực thể đang hoạt động, xác minh số lượng bản ghi dự kiến trong cửa sổ huấn luyện (ví dụ: 365 bản ghi cho chuỗi hàng ngày trong 1 năm).
- Đánh dấu thực thể có > 10% kỳ thiếu — hành vi mô hình trên chuỗi thưa là không dự đoán được.

**Phát hiện trôi dạt (thống kê):**
- So sánh phân phối đầu vào hiện tại với phân phối huấn luyện bằng PSI hoặc kiểm định KS.
- Chạy như một phần của kiểm chứng trước suy luận cho endpoint thời gian thực.
- Ghi log và cảnh báo; không âm thầm phục vụ dự báo trên đầu vào bị trôi dạt nghiêm trọng.

---

### 4. Các Cổng Chất Lượng Mô Hình

**Cổng 1 — Độ chính xác so với baseline:**
| Chỉ Số | Ngưỡng | Hành Động Khi Không Đạt |
|---|---|---|
| MAPE so với baseline naive | Mô hình phải thắng naive > 5% | Chặn triển khai |
| RMSE so với mô hình prod trước | Suy giảm < 5% | Chặn triển khai |
| Thiên lệch (sai số trung bình) | Abs(thiên lệch) < 2% giá trị thực trung bình | Cảnh báo, cần xem xét |

**Cổng 2 — Hiệu chuẩn khoảng dự báo:**
- Độ phủ thực nghiệm PI 80%: 75%–85% (không đạt ngoài phạm vi này).
- Độ phủ thực nghiệm PI 95%: 92%–97%.

**Cổng 3 — Phạm vi bao phủ giữa các nhóm:**
- Không nhóm thực thể nào (ví dụ: danh mục sản phẩm, khu vực) có MAPE > 2 lần MAPE tổng thể.
- Đảm bảo mô hình không che giấu hiệu suất kém ở phân khúc thiểu số đằng sau trung bình tổng hợp.

**Cổng 4 — Kiểm tra hành vi hợp lý:**
- Dự báo không âm cho mục tiêu đếm/số lượng.
- Giá trị dự báo không vượt quá giới hạn bất khả thi về mặt vật lý (ví dụ: > tổng quy mô thị trường).
- Không có giá trị NaN hoặc Inf trong bất kỳ đầu ra nào.
- Dự báo cho đầu vào giống hệt nhau tạo ra đầu ra giống hệt nhau (kiểm tra tính xác định, trừ khi mô hình rõ ràng là ngẫu nhiên).

**Cổng 5 — Cổng độ trễ:**
- Thời gian suy luận cho yêu cầu đơn thực thể < SLA đã thỏa thuận (ví dụ: 500ms P99 trên phần cứng kiểm thử).
- Lô 100 thực thể hoàn thành trong 10 lần thời gian đơn thực thể (không có tỷ lệ mở rộng siêu tuyến tính).

---

### 5. Kiểm Thử Hiệu Năng & Tải

**Kiểm thử hiệu năng cơ bản (chạy trong CI trên staging):**
- Gửi 100 yêu cầu đơn thực thể tuần tự. Ghi lại P50/P95/P99 độ trễ. Không đạt nếu P99 > SLA.
- Gửi lô 500 thực thể. Xác minh phản hồi trong timeout.

**Kiểm thử tải bền vững (hàng tuần, trước phát hành):**
- Dùng k6 hoặc Locust. Tăng đến RPS đỉnh dự kiến trong 5 phút, duy trì 15 phút, giảm dần.
- Khẳng định: tỷ lệ lỗi < 0.1%, P99 độ trễ trong SLA xuyên suốt.
- Giám sát tăng trưởng bộ nhớ — server mô hình có thể rò rỉ bộ nhớ khi suy luận lặp lại; phát hiện với kiểm thử bền vững 15 phút.

**Kiểm thử đột biến (Spike test):**
- Mô phỏng 10 lần RPS bình thường trong 60 giây. Hệ thống nên suy giảm uyển chuyển (xếp hàng, không sập).
- Khẳng định: không hỏng dữ liệu, hàng đợi job rút cạn sau đột biến, hệ thống trở về độ trễ bình thường trong 2 phút.

**Kiểm thử thông lượng job bất đồng bộ:**
- Gửi 1.000 job dự báo đồng thời. Đo: thời gian đến hoàn thành đầu tiên, thời gian đến 95% hoàn thành, tỷ lệ thất bại.
- Khẳng định: không job nào bị mất (tất cả cuối cùng `completed` hoặc `failed` có lý do), không có mất âm thầm.

**Kiểm thử căng thẳng (Stress test — điểm phá vỡ):**
- Tăng tải cho đến khi tỷ lệ lỗi > 5%. Ghi lại điểm phá vỡ.
- Xác minh suy giảm uyển chuyển tại điểm phá vỡ: trả về 503 với header retry-after, không làm hỏng kết quả đã lưu.

---

### 6. Các Sai Lầm QA Phổ Biến

- **Chỉ kiểm thử "đường hạnh phúc" (happy path)** — hệ thống dự báo thất bại ở trường hợp biên: thực thể mới không có lịch sử, thực thể với kỳ toàn zero, ngoại lai cực đoan trong đặc trưng đầu vào.
- **Đánh giá mô hình trên một thời điểm cắt holdout duy nhất** — một thời điểm cắt có thể gây hiểu lầm tốt hoặc xấu; dùng nhiều thời điểm cắt.
- **Chấp nhận MAPE tổng hợp mà không phân tích theo nhóm** — MAPE tổng thể mạnh có thể che giấu thất bại thảm khốc ở phân khúc quan trọng.
- **Không ghim tập dữ liệu kiểm thử** — thay đổi tập dữ liệu âm thầm thay đổi ý nghĩa của "đạt", phá vỡ tín hiệu hồi quy.
- **Không có cổng độ trễ** — mô hình có thể rất chính xác nhưng quá chậm để phục vụ; kiểm thử độ chính xác đơn thuần bỏ sót điều này.
- **Bỏ qua so sánh baseline naive** — triển khai mô hình không thắng được naive mùa vụ là lãng phí hạ tầng.
- **Không kiểm tra đầu ra NaN/Inf** — mô hình xuất ra NaN sẽ gây thất bại âm thầm hạ nguồn (bảng điều khiển hiển thị trống, cảnh báo không kích hoạt).
