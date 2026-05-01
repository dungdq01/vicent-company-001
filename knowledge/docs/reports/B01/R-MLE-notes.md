# Ghi Chú Kỹ Thuật ML: B01 — Dự Báo & Chuỗi Thời Gian
## Bởi R-MLE (ML Engineer — Kỹ sư Học máy) — Ngày: 2026-03-30

---

### 1. Các Mô Hình Lựa Chọn

**Cây quyết định để chọn mô hình dự báo:**

```
Chuỗi đơn, <500 dòng, cần khả năng giải thích?
  → Cổ điển: SARIMA / Exponential Smoothing (statsmodels)

Chuỗi đơn, tính mùa vụ mạnh, xu hướng phi tuyến, người dùng kinh doanh?
  → Prophet (Facebook/Meta) — xử lý ngày lễ, bền vững với dữ liệu thiếu

Nhiều chuỗi (>50), có đặc trưng dạng bảng, tốc độ quan trọng?
  → LightGBM / XGBoost với đặc trưng trễ — huấn luyện nhanh nhất, dễ gỡ lỗi nhất

Nhiều chuỗi, tương quan liên chuỗi quan trọng, đủ dữ liệu (>2 năm)?
  → Temporal Fusion Transformer (TFT) qua neuralforecast hoặc darts

Đơn biến, tần suất cao (giờ/ngày), tài nguyên tính toán tối thiểu?
  → AutoETS hoặc AutoTheta của statsforecast — nhanh gấp 10-100 lần Prophet
```

**Quy tắc tham khảo theo kích thước dữ liệu:**
| Số Lượng Chuỗi | Số Dòng/Chuỗi | Họ Mô Hình Khuyến Nghị |
|---|---|---|
| 1–10 | Bất kỳ | SARIMA / Prophet |
| 10–500 | >100 | LightGBM mô hình toàn cục |
| 500+ | >50 | LightGBM toàn cục hoặc N-BEATS |
| Bất kỳ | <30 | Chỉ dùng Exponential Smoothing |

**Tránh mạng nơ-ron** khi có ít hơn 500 quan sát mỗi chuỗi — chúng dễ bị overfitting (quá khớp) nghiêm trọng và hiếm khi thắng được LightGBM đã tinh chỉnh.

---

### 2. Kỹ Thuật Tạo Đặc Trưng Cho Chuỗi Thời Gian

Các đặc trưng thực sự tạo ra sự khác biệt trong thực tế:

**Đặc trưng trễ (Lag features)** — quan trọng nhất
- Sử dụng lag tại các chu kỳ mùa vụ: lag_7, lag_14, lag_28 cho dữ liệu ngày; lag_12, lag_24 cho dữ liệu giờ
- Thêm lag đúng bằng tầm dự báo: nếu dự báo H=7 bước trước, lag_7 là bắt buộc
- Tránh rò rỉ tương lai: luôn dịch ít nhất H bước

**Thống kê trượt (Rolling statistics)**
- `rolling_mean_7`, `rolling_std_7`, `rolling_max_28`
- Dùng `.shift(H)` trước `.rolling()` để tránh rò rỉ dữ liệu
- Trung bình có trọng số theo hàm mũ (EWM) thường tốt hơn trung bình trượt đơn giản

**Đặc trưng lịch (Calendar features)**
- `day_of_week`, `month`, `week_of_year`, `is_weekend`, `is_holiday`
- Mã hóa tuần hoàn cho mô hình nơ-ron: `sin(2π * day / 7)`, `cos(2π * day / 7)`
- Với mô hình cây: mã hóa số nguyên thô là đủ

**Mã hóa mục tiêu / thống kê theo nhóm (Target encoding)**
- Cho đa chuỗi: mã hóa trung bình lịch sử, độ lệch chuẩn, hệ số góc xu hướng ở cấp chuỗi làm đặc trưng tĩnh
- Giúp mô hình LightGBM toàn cục phân biệt hành vi giữa các chuỗi

**Những gì hiếm khi hữu ích (tiết kiệm công sức)**
- Dấu thời gian thô làm đặc trưng
- Tập lag quá chi tiết (lag_1 đến lag_100) không qua chọn lọc
- Đặc trưng ngoại sinh không có cơ sở từ lĩnh vực chuyên môn

---

### 3. Các Mẫu Pipeline Huấn Luyện

**QUAN TRỌNG: Không bao giờ xáo trộn dữ liệu chuỗi thời gian. Phải bảo toàn thứ tự thời gian.**

**Phân chia Train/Val/Test — sử dụng walk-forward (kiểm chứng tiến tới)**
```
|----Train----|----Val----|----Test----|
     70%           15%        15%

Cho dự báo H-bước-trước:
  Khoảng cách Val = H bước (mô phỏng độ trễ triển khai thực tế)
```

**Kiểm chứng chéo cho chuỗi thời gian — Cửa Sổ Mở Rộng (Expanding Window)**
```
Fold 1: Train [0:100]   → Val [100:120]
Fold 2: Train [0:120]   → Val [120:140]
Fold 3: Train [0:140]   → Val [140:160]
```
- Sử dụng `TimeSeriesSplit` từ sklearn hoặc `cross_validation` từ statsforecast
- Tối thiểu 3 fold; ưu tiên 5 nếu dữ liệu cho phép
- Luôn báo cáo chỉ số trung bình qua các fold, không chỉ fold cuối cùng

**Cho mô hình toàn cục (nhiều chuỗi)**
- Huấn luyện một mô hình trên tất cả chuỗi đồng thời
- Đưa `series_id` vào làm đặc trưng phân loại
- Phân tầng phân chia theo chuỗi, không theo dòng

**Danh sách kiểm tra rò rỉ dữ liệu (Data leakage checklist)**
- [ ] Đặc trưng trượt được tính với `.shift(H)` trước `.rolling()`
- [ ] Mục tiêu Val/Test không được nhìn thấy khi chia tỷ lệ đặc trưng (fit scaler chỉ trên train)
- [ ] Không sử dụng sự kiện lịch tương lai làm đặc trưng tại thời điểm huấn luyện trừ khi chúng thực sự đã biết trước

---

### 4. Các Chỉ Số Đánh Giá

| Chỉ Số | Công Thức (đơn giản hóa) | Khi Nào Sử Dụng |
|---|---|---|
| MAE | mean(\|y - ŷ\|) | Phụ thuộc tỷ lệ, dễ hiểu, bền vững với ngoại lai |
| RMSE | sqrt(mean((y - ŷ)²)) | Phạt sai số lớn; dùng khi sai số lớn gây tốn kém |
| MAPE | mean(\|y - ŷ\| / \|y\|) × 100 | **Tránh** — không xác định/bùng nổ khi y ≈ 0 |
| SMAPE | mean(2\|y - ŷ\| / (\|y\| + \|ŷ\|)) × 100 | Tốt hơn MAPE nhưng vẫn có trường hợp biên |
| MASE | MAE / MAE_naive | **Ưu tiên** — không phụ thuộc tỷ lệ, bền vững, so sánh được giữa các chuỗi |
| Winkler Score | Độ phủ khoảng + phạt độ rộng | Khi tạo khoảng dự báo |

**Khuyến nghị:**
- Chỉ số chính: **MASE** cho đánh giá sản xuất xuyên chuỗi
- Phụ trợ: **MAE** ở đơn vị gốc để báo cáo cho bên liên quan
- Dùng **RMSE** chỉ khi cần nhạy với ngoại lai một cách rõ ràng
- Báo cáo **tỷ lệ phủ** của khoảng dự báo (nên khớp danh nghĩa 80%/95%)

**Sai lầm phổ biến:** Tối ưu RMSE khi huấn luyện nhưng báo cáo MAPE cho bên liên quan — hai chỉ số này có thể kéo ngược hướng nhau.

---

### 5. Các Cân Nhắc MLOps

**Theo dõi thí nghiệm (dùng MLflow)**
```python
# Ghi lại những thông tin này cho mỗi lần huấn luyện:
mlflow.log_params({"model": "lgbm", "lags": 14, "horizon": 7})
mlflow.log_metrics({"val_mae": 12.3, "val_mase": 0.87})
mlflow.sklearn.log_model(model, "forecaster")
```

**Quản lý phiên bản mô hình**
- Gắn thẻ mô hình với: `series_group`, `horizon`, `training_cutoff_date`
- Không bao giờ ghi đè mô hình đang sản xuất — luôn đăng ký phiên bản mới
- Mẫu Champion/Challenger (Vô địch/Thách đấu): chạy mô hình mới ở chế độ ẩn 2 tuần trước khi thăng cấp

**Phát hiện trôi dạt (Drift detection) — hai loại cần giám sát:**
1. **Trôi dạt dữ liệu (Data drift)** (đặc trưng đầu vào thay đổi): giám sát trung bình/độ lệch chuẩn trượt của đặc trưng lag so với phân phối huấn luyện. Cảnh báo nếu PSI > 0.2
2. **Trôi dạt khái niệm (Concept drift)** (mối quan hệ thay đổi): giám sát MAE trực tiếp trên cửa sổ trượt 30 ngày. Cảnh báo nếu MAE vượt `train_MAE × 1.5`

**Kích hoạt huấn luyện lại (chọn ít nhất 2):**
- Theo lịch: huấn luyện lại hàng tuần/tháng với cửa sổ huấn luyện mở rộng
- Dựa trên trôi dạt: cảnh báo MAE kích hoạt pipeline huấn luyện lại tự động
- Dựa trên sự kiện: thay đổi cấu trúc đã biết (ra mắt sản phẩm mới, sốc thị trường)

**Bảng điều khiển giám sát — mức tối thiểu khả dụng**
- Biểu đồ Dự báo so với Thực tế (30 ngày gần nhất)
- MAE trượt theo nhóm chuỗi
- Điểm PSI phân phối đặc trưng
- Tỷ lệ phủ khoảng dự báo

---

### 6. Các Bẫy Khi Triển Khai Sản Xuất

**Bẫy 1 — Rò rỉ tương lai vào đặc trưng trễ**
Trung bình trượt và lag được tính mà không dịch H bước. Điều này thổi phồng chỉ số val; mô hình sụp đổ khi suy luận. Sửa: luôn dùng `df['feat'] = df['target'].shift(H).rolling(7).mean()`.

**Bẫy 2 — Đánh giá trên một phân chia test duy nhất**
Chỉ số từ phân chia đơn có thể gây hiểu lầm do tính mùa vụ trong cửa sổ test. Luôn dùng walk-forward CV và báo cáo trung bình ± độ lệch chuẩn qua các fold.

**Bẫy 3 — Huấn luyện một mô hình riêng cho mỗi chuỗi ở quy mô lớn**
Huấn luyện 10.000 mô hình ARIMA riêng lẻ thì chậm và dễ hỏng. Dùng LightGBM toàn cục hoặc lớp `StatsForecast` của statsforecast với fitting vector hóa — nhanh gấp 100 lần.

**Bẫy 4 — Bỏ qua khoảng dự báo trong sản xuất**
Dự báo điểm đơn lẻ không đủ cho tồn kho/lập kế hoạch. Tạo khoảng 80% và 95% bằng conformal prediction (dự báo tuân thủ) hoặc hồi quy phân vị. Hiệu chuẩn độ phủ trên tập dữ liệu giữ lại.

**Bẫy 5 — Huấn luyện lại mà không quản lý phiên bản**
Ghi đè mô hình sản xuất mà không lưu trữ phiên bản trước khiến việc quay lại không thể thực hiện khi mô hình mới suy giảm. Luôn tạo phiên bản trước khi thăng cấp.

---

### 7. Các Công Cụ & Thư Viện Khuyến Nghị

| Thư Viện | Phù Hợp Nhất Cho | Tốc Độ | Dễ Dùng | Ghi Chú |
|---|---|---|---|---|
| **statsforecast** | Nhiều chuỗi, mô hình cổ điển (ETS, ARIMA, Theta) | Rất Nhanh | Trung Bình | Nhanh gấp 10–100 lần statsmodels; dùng cho baseline |
| **Prophet** | Chuỗi đơn/ít, thân thiện kinh doanh, mùa vụ | Chậm | Dễ | Tốt cho bên liên quan phi kỹ thuật; yếu ở quy mô lớn |
| **LightGBM + sktime** | Mô hình toàn cục, đặc trưng bảng, sản xuất | Nhanh | Trung Bình | Tốt nhất tổng thể cho đa chuỗi có đặc trưng |
| **darts** | API thống nhất cho mô hình cổ điển + nơ-ron | Trung Bình | Dễ | Tuyệt vời cho thử nghiệm nhanh; ít sẵn sàng sản xuất |
| **neuralforecast** | Mô hình nơ-ron (N-BEATS, TFT, PatchTST) | Chậm | Trung Bình | Chỉ dùng khi dữ liệu đủ phức tạp (>1K dòng/chuỗi) |
| **sktime** | CV, pipeline, API tương thích sklearn | Nhanh | Trung Bình | Tốt nhất cho xây dựng pipeline có thể tái tạo |
| **MLflow** | Theo dõi thí nghiệm, đăng ký mô hình | — | Dễ | Bắt buộc cho quy trình sản xuất |
| **Optuna** | Tinh chỉnh siêu tham số | Nhanh | Dễ | Tốt hơn GridSearch cho tất cả mô hình dự báo |

**Stack khuyến nghị cho sản xuất (đa chuỗi, 12 ngành):**
```
statsforecast  → baseline nhanh + AutoETS/AutoARIMA
LightGBM       → mô hình toàn cục với đặc trưng trễ
neuralforecast → TFT cho mô hình liên chuỗi phức tạp (tùy chọn)
MLflow         → theo dõi + đăng ký
sktime         → CV + pipeline
Optuna         → tinh chỉnh
```

---

*Kết quả được tạo bởi R-MLE cho Nền tảng Đồ thị Tri thức MAESTRO — Giai đoạn 1, Mô-đun B01, Lớp 2.*
