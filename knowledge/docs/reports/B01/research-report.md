# Báo cáo Nghiên cứu: B01 — Forecasting & Time Series (Dự báo & Chuỗi thời gian)
## Tác giả: Dr. Archon (R-α) — Ngày: 2026-03-30
## Trạng thái: CẦN ĐÁNH GIÁ
## Tiếp theo: Dr. Praxis (β) — tech-report.md

---

## 1. Tóm tắt tổng quan

Forecasting & Time Series (Dự báo & Chuỗi thời gian) là một trong những lĩnh vực con của AI có tác động thương mại lớn nhất, bao gồm các phương pháp thống kê cổ điển (ARIMA, Exponential Smoothing (Làm trơn hàm mũ)), các mô hình ensemble học máy (Gradient Boosting, Random Forests), và các kiến trúc deep learning (Học sâu) hiện đại (Transformers, N-BEATS, PatchTST). Một sự chuyển đổi mô hình đang diễn ra trong giai đoạn 2024–2026 được thúc đẩy bởi các foundation model (mô hình nền tảng) zero-shot (TimesFM, Moirai, Chronos, MOMENT) cho phép dự báo đa mục đích mà không cần huấn luyện lại cho từng tập dữ liệu, thu hẹp khoảng cách giữa tính khả diễn giải của phương pháp cổ điển và khả năng mở rộng của deep learning. Để thành thạo lĩnh vực này cần hiểu về stationarity (tính dừng), decomposition (phân rã), loss functions (hàm mất mát), probabilistic forecasting (dự báo xác suất), và cross-domain transfer (chuyển giao đa miền) — tất cả đều được trình bày chi tiết trong báo cáo này.

---

## 2. Phân loại lĩnh vực

### Hệ thống phân cấp lĩnh vực cha
```
Statistics & Machine Learning
└── Predictive Analytics
    └── Forecasting & Time Series Analysis
        ├── Statistical Forecasting
        │   ├── Exponential Smoothing Family (ETS)
        │   ├── ARIMA Family (AR, MA, ARMA, ARIMA, SARIMA, SARIMAX)
        │   ├── State Space Models (Structural Time Series)
        │   ├── VAR / VECM (Multivariate)
        │   └── GARCH / Volatility Models (Financial)
        ├── Machine Learning Forecasting
        │   ├── Tree-based (XGBoost, LightGBM, Random Forest)
        │   ├── Feature Engineering-driven (lag features, rolling stats)
        │   ├── Gaussian Process Regression
        │   └── Support Vector Regression (SVR)
        ├── Deep Learning Forecasting
        │   ├── Recurrent Networks (LSTM, GRU, TCN)
        │   ├── Convolutional Approaches (WaveNet, TimesNet)
        │   ├── Attention / Transformer-based (Informer, Autoformer, PatchTST, iTransformer)
        │   ├── MLP-Mixer-based (N-BEATS, N-HiTS, TiDE)
        │   └── Diffusion-based (TimeGrad, CSDI, TSDiff)
        ├── Probabilistic Forecasting
        │   ├── Quantile Regression
        │   ├── Conformal Prediction
        │   ├── Deep Ensembles
        │   └── Normalizing Flows / DeepAR
        ├── Foundation Models for Time Series (2023–2026)
        │   ├── Zero-shot Forecasting (TimesFM, Moirai, Chronos)
        │   ├── LLM-based Forecasting (GPT4TS, TEMPO, LLM-Time)
        │   └── Universal Pre-trained Models (MOMENT, Lag-Llama)
        └── Specialized Sub-domains
            ├── Demand Forecasting (Retail, Supply Chain)
            ├── Financial Forecasting (Price, Volatility, Risk)
            ├── Energy Forecasting (Load, Renewable Generation)
            ├── Healthcare Forecasting (Patient Arrivals, Epidemiology)
            ├── Anomaly Detection (cross-cut with B02)
            └── Nowcasting (real-time estimation of current state)
```

### Các lĩnh vực liên quan
- **Econometrics (Kinh tế lượng)** — mô hình nhân quả thống kê chặt chẽ
- **Signal Processing (Xử lý tín hiệu)** — FFT, wavelets cho phân tích miền tần số
- **Control Theory (Lý thuyết điều khiển)** — bộ lọc Kalman, ước lượng trạng thái
- **Bayesian Statistics (Thống kê Bayes)** — suy luận xác suất, mô hình phân cấp
- **Causal Inference (Suy luận nhân quả)** — nhân quả Granger, hiệu ứng can thiệp
- **Operations Research (Vận trù học)** — tối ưu hóa tồn kho sử dụng dự báo

---

## 3. Nền tảng Toán học

### 3.1 Tính dừng (Stationarity)

**Định nghĩa:** Một chuỗi thời gian {y_t} là dừng (yếu) nếu:
1. E[y_t] = μ (trung bình hằng số)
2. Var(y_t) = σ² (phương sai hằng số)
3. Cov(y_t, y_{t-k}) = γ(k) chỉ phụ thuộc vào độ trễ k, không phụ thuộc vào t

**Kiểm định Augmented Dickey-Fuller (ADF) — Giả thuyết không:**
```
H₀: y_t có nghiệm đơn vị (không dừng)
Thống kê kiểm định: t = (α̂ - 1) / SE(α̂)
Phương trình hồi quy: Δy_t = α·y_{t-1} + Σ βᵢ·Δy_{t-i} + ε_t
```
Bác bỏ H₀ nếu t < giá trị tới hạn → chuỗi là dừng.

**Giả định:** Nhiều mô hình cổ điển (ARIMA) yêu cầu tính dừng. Chuỗi không dừng được sai phân (d lần) cho đến khi dừng.

**Tài liệu tham khảo:** Dickey & Fuller (1979), "Distribution of the Estimators for Autoregressive Time Series with a Unit Root," JASA.

---

### 3.2 Hàm tự tương quan (ACF) & Tự tương quan riêng (PACF)

**ACF tại độ trễ k:**
```
ρ(k) = Cov(y_t, y_{t-k}) / Var(y_t)
      = γ(k) / γ(0)
```

**PACF tại độ trễ k:** Tương quan giữa y_t và y_{t-k} sau khi loại bỏ phụ thuộc tuyến tính vào y_{t-1}, ..., y_{t-k+1}.

**Ứng dụng thực tế:** Đồ thị ACF/PACF xác định bậc MA(q) và AR(p):
- AR(p): PACF cắt sau độ trễ p; ACF suy giảm
- MA(q): ACF cắt sau độ trễ q; PACF suy giảm

---

### 3.3 Mô hình ARIMA

**Công thức ARIMA(p, d, q):**
```
Φ(B) · (1-B)^d · y_t = Θ(B) · ε_t

trong đó:
  B = toán tử trễ (B·y_t = y_{t-1})
  Φ(B) = 1 - φ₁B - φ₂B² - ... - φₚBᵖ  (đa thức AR)
  Θ(B) = 1 + θ₁B + θ₂B² + ... + θ_qB^q  (đa thức MA)
  (1-B)^d = sai phân bậc d
  ε_t ~ WN(0, σ²)  (nhiễu trắng)
```

**SARIMA(p,d,q)(P,D,Q)[s]** bổ sung các thành phần mùa vụ tại độ trễ s:
```
Φ(B)·Φ_s(Bˢ) · (1-B)^d · (1-Bˢ)^D · y_t = Θ(B)·Θ_s(Bˢ) · ε_t
```

**Tài liệu tham khảo:** Box & Jenkins (1970), "Time Series Analysis: Forecasting and Control."

---

### 3.4 Làm trơn hàm mũ (ETS — Exponential Smoothing)

**Làm trơn hàm mũ đơn giản:**
```
ŷ_{t+1} = α·y_t + (1-α)·ŷ_t,   0 < α < 1
```

**Holt-Winters (Tính mùa vụ nhân):**
```
Level:    l_t = α · (y_t / s_{t-m}) + (1-α) · (l_{t-1} + b_{t-1})
Trend:    b_t = β · (l_t - l_{t-1}) + (1-β) · b_{t-1}
Season:   s_t = γ · (y_t / l_t) + (1-γ) · s_{t-m}
Forecast: ŷ_{t+h} = (l_t + h·b_t) · s_{t-m+h mod m}
```

**Phân loại ETS theo không gian trạng thái (Hyndman và cộng sự):**
```
ETS(Error, Trend, Seasonality)
  Error:    {A=Cộng, M=Nhân}
  Trend:    {N=Không, A=Cộng, Ad=Cộng tắt dần}
  Season:   {N=Không, A=Cộng, M=Nhân}
→ 30 mô hình khả thi, chọn tốt nhất bằng AIC
```

**Tài liệu tham khảo:** Hyndman và cộng sự (2008), "Forecasting with Exponential Smoothing: The State Space Approach."

---

### 3.5 Mô hình phân rã Prophet

**Công thức cộng:**
```
y(t) = g(t) + s(t) + h(t) + ε_t

trong đó:
  g(t) = xu hướng (tuyến tính từng đoạn hoặc tăng trưởng logistic)
  s(t) = tính mùa vụ (xấp xỉ chuỗi Fourier)
         s(t) = Σ_{n=1}^{N} [aₙ·cos(2πnt/P) + bₙ·sin(2πnt/P)]
  h(t) = hiệu ứng ngày lễ (biến chỉ thị với prior)
  ε_t  ~ N(0, σ²)
```

Các điểm thay đổi xu hướng được phát hiện tự động với prior Laplace trên biên độ điểm thay đổi:
```
δ ~ Laplace(0, τ)
```

**Tài liệu tham khảo:** Taylor & Letham (2018), "Forecasting at Scale," The American Statistician.

---

### 3.6 Hàm mất mát trong dự báo Deep Learning

**Hàm mất mát cho dự báo điểm:**
```
MSE:   L = (1/n) Σ (y_t - ŷ_t)²
MAE:   L = (1/n) Σ |y_t - ŷ_t|
MAPE:  L = (1/n) Σ |(y_t - ŷ_t) / y_t| × 100
SMAPE: L = (2/n) Σ |y_t - ŷ_t| / (|y_t| + |ŷ_t|)
```

**Hàm mất mát Quantile (Pinball) cho dự báo xác suất:**
```
L_q(y, ŷ) = q·(y - ŷ) nếu y ≥ ŷ
           = (1-q)·(ŷ - y) nếu y < ŷ
```

**CRPS (Continuous Ranked Probability Score)** — quy tắc tính điểm đúng đắn cho dự báo phân phối:
```
CRPS(F, y) = ∫_{-∞}^{∞} [F(z) - 1(z ≥ y)]² dz
```

---

### 3.7 Cơ chế Attention trong dự báo dựa trên Transformer

**Scaled Dot-Product Attention:**
```
Attention(Q, K, V) = softmax(Q·Kᵀ / √d_k) · V
```

Trong chuỗi thời gian, Q, K, V được tạo từ các patch thời gian hoặc embedding bước thời gian. Độ phức tạp bậc hai O(L²) theo chiều dài chuỗi L đã thúc đẩy các biến thể attention thưa (Informer, Autoformer).

**PatchTST** xử lý các patch không chồng lấp có kích thước P như các token:
```
Token_i = Patch[i·P : (i+1)·P]   →  giảm chiều dài chuỗi theo hệ số P
```

**Tài liệu tham khảo:** Nie và cộng sự (2023), "A Time Series is Worth 64 Words," ICLR 2023.

---

### 3.8 Bộ lọc Kalman (Mô hình không gian trạng thái)

**Không gian trạng thái tuyến tính Gauss:**
```
State:       x_t = F·x_{t-1} + q_t,    q_t ~ N(0, Q)
Observation: y_t = H·x_t + r_t,        r_t ~ N(0, R)

Predict:  x̂_{t|t-1} = F·x̂_{t-1|t-1}
          P_{t|t-1}  = F·P_{t-1|t-1}·Fᵀ + Q

Update:   K_t = P_{t|t-1}·Hᵀ · (H·P_{t|t-1}·Hᵀ + R)⁻¹
          x̂_{t|t} = x̂_{t|t-1} + K_t·(y_t - H·x̂_{t|t-1})
          P_{t|t} = (I - K_t·H)·P_{t|t-1}
```

**Kalman Gain K_t** cân bằng giữa độ bất định của dự đoán và nhiễu quan sát.

---

## 4. Các khái niệm cốt lõi (10 khái niệm ở mức độ L3)

---

### Khái niệm 1: Tính dừng & Sai phân (Stationarity & Differencing)

**Mô tả:**
Tính dừng là giả định nền tảng của hầu hết các mô hình chuỗi thời gian cổ điển. Một chuỗi dừng có các tính chất thống kê (trung bình, phương sai, tự tương quan) không thay đổi theo thời gian, giúp có thể mô hình hóa bằng các tham số cố định. Các chuỗi thực tế gần như luôn thể hiện tính không dừng — doanh số có xu hướng, dân số tăng trưởng, giá cả lạm phát — đòi hỏi phải biến đổi trước khi mô hình hóa thống kê.

Phép biến đổi phổ biến nhất là sai phân: tính sự thay đổi giữa các giá trị liên tiếp (Δy_t = y_t − y_{t-1}) loại bỏ xu hướng tuyến tính. Sai phân bậc hai loại bỏ xu hướng bậc hai. Sai phân mùa vụ (y_t − y_{t-s}) loại bỏ các mẫu mùa vụ. Số lần sai phân không mùa vụ cần thiết chính là tham số "d" trong ARIMA.

Ngoài sai phân, biến đổi logarit ổn định phương sai nhân, và biến đổi Box-Cox (y_t^λ) tổng quát hóa điều này. Nhận biết và xử lý đúng tính không dừng là rất quan trọng — áp dụng ARIMA cho chuỗi không dừng tạo ra các tương quan giả và dự báo không đáng tin cậy.

**Công thức toán học:**
```
First difference:    Δy_t = y_t - y_{t-1} = (1-B)·y_t
Seasonal difference: Δₛy_t = y_t - y_{t-s} = (1-Bˢ)·y_t
Box-Cox transform:   w_t = (y_t^λ - 1) / λ,  λ ≠ 0
                     w_t = log(y_t),           λ = 0
```

**Độ khó:** Cơ bản → Trung cấp
**Kiến thức tiên quyết:** Thống kê cơ bản, khái niệm trung bình/phương sai
**Tại sao quan trọng:** Vi phạm tính dừng là lỗi phổ biến nhất trong mô hình hóa chuỗi thời gian. Các công cụ tự động (auto_arima, StatsForecast) thực hiện kiểm định tính dừng tự động, nhưng người thực hành phải hiểu ý nghĩa của các kiểm định này để chẩn đoán lỗi mô hình.

---

### Khái niệm 2: Phân rã chuỗi thời gian (Xu hướng, Mùa vụ, Phần dư)

**Mô tả:**
Phân rã chia một chuỗi thời gian thành các thành phần cấu trúc có thể diễn giải được. Mô hình cộng giả định các thành phần cộng tuyến tính; mô hình nhân giả định chúng nhân với nhau. Phân rã phục vụ cả mục đích phân tích (hiểu các yếu tố thúc đẩy) và thực tiễn (điều chỉnh mùa vụ, phát hiện bất thường từ phần dư).

Phân rã cổ điển (trung bình trượt) đơn giản nhưng có hiệu ứng biên và không thể xử lý tính mùa vụ thay đổi. STL (Seasonal and Trend decomposition using Loess — Phân rã mùa vụ và xu hướng sử dụng Loess) là phương pháp mạnh mẽ, xử lý được bất kỳ chu kỳ mùa vụ nào, và chống nhiễu ngoại lai. X-13ARIMA-SEATS (được Cục Điều tra Dân số Hoa Kỳ sử dụng) là tiêu chuẩn vàng cho thống kê chính thức.

MSTL mở rộng STL cho nhiều chu kỳ mùa vụ (ví dụ: dữ liệu theo giờ với các mẫu ngày + tuần + năm), rất quan trọng cho dự báo phụ tải năng lượng và dữ liệu bán lẻ.

**Công thức toán học:**
```
Additive:        y_t = T_t + S_t + R_t
Multiplicative:  y_t = T_t × S_t × R_t

STL: tối thiểu hóa mất mát hồi quy cục bộ có trọng số (loess):
     min Σ w_i (y_i - T_i - S_i)²
     với ràng buộc tuần hoàn: Σ_{i=1}^{m} S_i = 0
```

**Độ khó:** Cơ bản
**Kiến thức tiên quyết:** Khái niệm tính dừng, trung bình trượt
**Tại sao quan trọng:** Phân rã cung cấp khả năng diễn giải mà các mô hình ML thuần túy không có. Loại bỏ xu hướng + mùa vụ là bước tiền xử lý cho nhiều mô hình phía sau. Xác định tính mùa vụ bất thường hoặc dịch chuyển giúp định hướng lựa chọn mô hình.

---

### Khái niệm 3: Mô hình tự hồi quy (AR, họ ARIMA)

**Mô tả:**
Các mô hình tự hồi quy dự đoán giá trị hiện tại dưới dạng tổ hợp tuyến tính của các giá trị trong quá khứ. Mô hình AR(p) sử dụng p quan sát gần nhất. Kết hợp với các thành phần trung bình trượt (MA) và sai phân (I), tạo thành họ ARIMA(p,d,q) — phương pháp dự báo cổ điển thống trị trong nửa sau thế kỷ 20.

Phương pháp Box-Jenkins (1970) cung cấp khung quy trình 3 bước có hệ thống: (1) xác định bậc p, d, q bằng ACF/PACF; (2) ước lượng tham số bằng maximum likelihood (hợp lý cực đại); (3) kiểm tra chẩn đoán phần dư xem có phải nhiễu trắng không. Quy trình thực nghiệm này vẫn là thực hành tốt nhất ngay cả khi sử dụng lựa chọn tự động.

SARIMAX mở rộng ARIMA với các thành phần mùa vụ (P, D, Q, s) và biến ngoại sinh X, giúp thực tế hóa cho chuỗi thực tế có tính mùa vụ và yếu tố bên ngoài (ví dụ: khuyến mãi, thời tiết).

**Công thức toán học:**
```
AR(p):   y_t = c + φ₁y_{t-1} + ... + φₚy_{t-p} + ε_t
MA(q):   y_t = μ + ε_t + θ₁ε_{t-1} + ... + θ_qε_{t-q}
ARMA(p,q): Φ(B)y_t = c + Θ(B)ε_t
ARIMA(p,d,q): Φ(B)(1-B)^d y_t = c + Θ(B)ε_t

Ước lượng tham số: MLE tối đa hóa log-likelihood
  L(θ) = -T/2 · log(2πσ²) - 1/(2σ²) Σ ε_t²
AIC = -2L(θ) + 2k   (dùng cho lựa chọn bậc)
```

**Độ khó:** Trung cấp
**Kiến thức tiên quyết:** Tính dừng, ACF/PACF, xác suất cơ bản
**Tại sao quan trọng:** ARIMA vẫn là một baseline mạnh và có thể diễn giải được. Nhiều người dùng doanh nghiệp tin tưởng nó hơn ML hộp đen. AutoARIMA của StatsForecast có thể fit hàng nghìn chuỗi mỗi giây, giúp nó cạnh tranh ở quy mô lớn.

---

### Khái niệm 4: Làm trơn hàm mũ & Mô hình không gian trạng thái

**Mô tả:**
Các phương pháp làm trơn hàm mũ gán trọng số giảm theo hàm mũ cho các quan sát quá khứ — dữ liệu gần đây quan trọng hơn. Họ phương pháp này bao gồm ES đơn giản (không có xu hướng/mùa vụ), Holt (xu hướng tuyến tính), và Holt-Winters (xu hướng + mùa vụ). Khung ETS (Error-Trend-Seasonality — Sai số-Xu hướng-Mùa vụ) thống nhất tất cả các biến thể dưới công thức không gian trạng thái xác suất, cho phép lựa chọn mô hình dựa trên AIC, khoảng dự báo, và ước lượng maximum likelihood.

Sự tinh tế của ETS nằm ở sự kết hợp giữa tính đơn giản (ít tham số) với hiệu suất thực nghiệm mạnh mẽ. Trong cuộc thi M4 (2018, 100.000 chuỗi), phương pháp Theta (tương đương ETS với xu hướng tắt dần) và các biến thể ETS đơn giản vượt trội hơn hầu hết các phương pháp ML. Mô hình ETS là khuyến nghị mặc định cho dự báo doanh nghiệp trong cuốn "Forecasting: Principles and Practice" của Hyndman & Athanasopoulos.

Công thức không gian trạng thái kết nối ETS với bộ lọc Kalman, cho phép xử lý dữ liệu thiếu, tích hợp hiệu ứng bên ngoài, và cập nhật trực tuyến.

**Công thức toán học:**
```
ETS(A,A,A) — Sai số cộng, Xu hướng cộng, Mùa vụ cộng:
  Level:    l_t = l_{t-1} + b_{t-1} + α·ε_t
  Trend:    b_t = b_{t-1} + αβ·ε_t
  Season:   s_t = s_{t-m} + γ(1-α)·ε_t
  Forecast: ŷ_{t+h} = l_t + h·b_t + s_{t-m+h mod m}
  Error:    ε_t ~ N(0, σ²)
```

**Độ khó:** Trung cấp
**Kiến thức tiên quyết:** Thống kê cơ bản, khái niệm trọng số hàm mũ
**Tại sao quan trọng:** ETS là tiêu chuẩn vàng cho dự báo doanh nghiệp đơn biến. Lựa chọn mô hình tự động (auto ETS) đã sẵn sàng cho sản xuất và có khả năng diễn giải cao. Holt-Winters được triển khai rộng rãi trong các hệ thống ERP doanh nghiệp.

---

### Khái niệm 5: LSTM & Mạng nơ-ron hồi quy cho chuỗi

**Mô tả:**
Mạng Long Short-Term Memory (LSTM — Bộ nhớ dài-ngắn hạn) giải quyết vấn đề gradient biến mất của RNN thông thường bằng cách giới thiệu trạng thái ô (bộ nhớ dài hạn) và ba cổng (input, forget, output) điều tiết luồng thông tin. Đối với chuỗi thời gian, LSTM có thể học các phụ thuộc thời gian phi tuyến phức tạp qua các chân trời dài mà không cần kỹ thuật đặc trưng thủ công.

Gated Recurrent Units (GRU — Đơn vị hồi quy có cổng) là biến thể đơn giản hơn với hai cổng (reset, update), ít tham số hơn, và hiệu suất tương đương. Temporal Convolutional Networks (TCN — Mạng tích chập thời gian) sử dụng tích chập nhân quả giãn nở để huấn luyện song song và kiểm soát trường tiếp nhận rõ ràng, thường vượt trội hơn LSTM trong thực tế.

LSTM thúc đẩy dự báo công nghiệp tại Google, Amazon, và Uber từ 2016–2021. Tuy nhiên, các mô hình dựa trên Transformer (2021+) phần lớn đã thay thế LSTM trên các bộ dữ liệu benchmark nhờ huấn luyện song song tốt hơn và ngữ cảnh hiệu quả dài hơn. LSTM vẫn cạnh tranh cho bộ dữ liệu nhỏ và triển khai trên thiết bị biên.

**Công thức toán học:**
```
Các cổng LSTM tại thời điểm t:
  Forget gate:  f_t = σ(W_f·[h_{t-1}, x_t] + b_f)
  Input gate:   i_t = σ(W_i·[h_{t-1}, x_t] + b_i)
  Cell cand.:   c̃_t = tanh(W_c·[h_{t-1}, x_t] + b_c)
  Cell state:   c_t = f_t ⊙ c_{t-1} + i_t ⊙ c̃_t
  Output gate:  o_t = σ(W_o·[h_{t-1}, x_t] + b_o)
  Hidden state: h_t = o_t ⊙ tanh(c_t)

trong đó σ = sigmoid, ⊙ = tích từng phần tử
```

**Độ khó:** Nâng cao
**Kiến thức tiên quyết:** Mạng nơ-ron, lan truyền ngược, gradient descent
**Tại sao quan trọng:** LSTM mở ra kỷ nguyên deep learning hiện đại cho chuỗi thời gian và vẫn được triển khai rộng rãi. Hiểu chúng là thiết yếu để chẩn đoán các kiến trúc Transformer, vốn là sự kế thừa về mặt khái niệm.

---

### Khái niệm 6: Dự báo dựa trên Transformer & Cơ chế Attention

**Mô tả:**
Transformers, ban đầu được thiết kế cho NLP (Vaswani và cộng sự, 2017), đã được điều chỉnh cho dự báo chuỗi thời gian bắt đầu với LogTrans (2019), Informer (2021), và Autoformer (2021). Chúng mô hình hóa phụ thuộc giữa bất kỳ hai bước thời gian nào trực tiếp thông qua attention, không giống RNN xử lý chuỗi từng bước. Điều này cho phép huấn luyện song song và mô hình hóa phụ thuộc tầm xa.

Tuy nhiên, áp dụng trực tiếp Transformers cho các bước thời gian thô gặp vấn đề — tokenization theo điểm mất đi tính cục bộ thời gian. PatchTST (2023) xử lý các patch thời gian như token, cải thiện đáng kể hiệu suất đồng thời giảm chi phí tính toán. iTransformer (2024) đảo ngược attention — áp dụng attention trên chiều biến số (đặc trưng) thay vì thời gian — để nắm bắt tương quan đa biến tốt hơn.

Insight quan trọng từ các benchmark gần đây (TimesNet 2023, iTransformer 2024): các mô hình tuyến tính đơn giản hơn (LTSF-Linear, DLinear) đôi khi vượt trội hơn Transformer phức tạp trên các benchmark chuẩn, đặt ra những câu hỏi quan trọng về thiết kế benchmark và inductive biases (thiên lệch quy nạp).

**Công thức toán học:**
```
Multi-Head Attention:
  head_i = Attention(Q·W_i^Q, K·W_i^K, V·W_i^V)
  MHA = Concat(head_1,...,head_h)·W^O

PatchTST tokenization (chiều dài patch P, bước nhảy S):
  Input L bước → ⌈(L-P)/S⌉ + 1 tokens
  Mỗi token: embedding P-chiều

iTransformer: attention trên chiều biến số D (không phải chiều thời gian T):
  Q,K,V ∈ ℝ^{D×d}  (thay vì ℝ^{T×d})
```

**Độ khó:** Nâng cao
**Kiến thức tiên quyết:** LSTM, cơ bản về attention, đại số tuyến tính
**Tại sao quan trọng:** Transformers thống trị bảng xếp hạng cho dự báo chân trời dài. PatchTST và iTransformer là các thực hành tốt nhất hiện tại cho dự báo đa biến trong sản xuất. Hiểu nguyên lý thiết kế "patch" được chuyển giao sang thiết kế foundation model.

---

### Khái niệm 7: Dự báo xác suất & Khoảng dự báo

**Mô tả:**
Dự báo điểm (giá trị dự đoán đơn lẻ) thường không đủ cho việc ra quyết định — nhà quản lý chuỗi cung ứng cần biết phạm vi bất định để đặt mức tồn kho an toàn. Dự báo xác suất tạo ra phân phối dự đoán đầy đủ, được biểu diễn dưới dạng quantile (phân vị), khoảng tin cậy, hoặc các đường mẫu.

Các phương pháp chính: (1) Conformal Prediction (Dự đoán tuân thủ) — đảm bảo phủ không phụ thuộc phân phối từ tập hiệu chuẩn; (2) Quantile Regression (Hồi quy phân vị) — trực tiếp tối thiểu hóa pinball loss cho các phân vị mong muốn; (3) DeepAR (Amazon, 2020) — RNN tự hồi quy với đầu ra xác suất (Gaussian, Nhị thức âm, Student-t); (4) Normalizing Flows — học các phép biến đổi khả nghịch sang phân phối phức tạp; (5) Mô hình khuếch tán (CSDI, TSDiff) — tạo nhiều quỹ đạo dự báo hợp lý.

Winkler Score và CRPS là các quy tắc tính điểm đúng đắn để đánh giá dự báo xác suất — chúng chỉ đạt cực tiểu khi phân phối dự đoán khớp với phân phối thực.

**Công thức toán học:**
```
Hồi quy phân vị (phân vị thứ q):
  ŷ_q = argmin_ŷ E[L_q(y, ŷ)]
  L_q(y, ŷ) = q·max(y-ŷ, 0) + (1-q)·max(ŷ-y, 0)

Khoảng dự đoán tuân thủ (phủ 1-α):
  CI = [ŷ - q̂_{(1-α)}, ŷ + q̂_{(1-α)}]
  trong đó q̂_{(1-α)} = phân vị (1-α) của phần dư hiệu chuẩn

DeepAR: p(y_t | y_{1:t-1}) = f_θ(y_{t-1}, h_t)
  h_t = LSTM(y_{t-1}, x_t, h_{t-1})
```

**Độ khó:** Trung cấp → Nâng cao
**Kiến thức tiên quyết:** Phân phối xác suất, phân vị, hàm mất mát
**Tại sao quan trọng:** Quyết định kinh doanh thực tế (tồn kho, công suất, phòng hộ tài chính) đòi hỏi lượng hóa bất định. Conformal prediction đang được áp dụng nhanh chóng vì cung cấp đảm bảo phủ mà không cần giả định phân phối — rất quan trọng cho các ngành được quản lý chặt chẽ.

---

### Khái niệm 8: Mô hình dự báo toàn cục vs. cục bộ

**Mô tả:**
Mô hình "cục bộ" được huấn luyện độc lập cho từng chuỗi thời gian riêng lẻ (ví dụ: một ARIMA cho mỗi SKU). Mô hình "toàn cục" được huấn luyện chung trên hàng nghìn hoặc hàng triệu chuỗi, học các mẫu chia sẻ. Đây là quyết định kiến trúc quan trọng nhất trong các hệ thống dự báo sản xuất.

Mô hình toàn cục tận dụng thông tin liên chuỗi: các mẫu học được từ tính mùa vụ của một sản phẩm có thể cải thiện dự báo cho sản phẩm khác. Chúng hiệu quả hơn về dữ liệu cho mỗi chuỗi và xử lý cold-start (khởi động lạnh — chuỗi mới với ít lịch sử) tốt hơn. Tuy nhiên, chúng có nguy cơ chuyển giao tiêu cực nếu các chuỗi quá không đồng nhất.

DeepAR của Amazon, Nbeats của Uber, và hầu như tất cả các hệ thống dự báo quy mô lớn trong sản xuất (Walmart, Amazon, Meta) sử dụng mô hình toàn cục. Foundation models (TimesFM, Chronos, Moirai) là cực điểm logic — được tiền huấn luyện trên hàng tỷ điểm dữ liệu chuỗi thời gian cho dự báo zero-shot đa năng.

**Công thức toán học:**
```
Mô hình cục bộ: θ_i = argmin Σ_t L(y_t^(i), f(y_{t-1:t-p}^(i); θ_i))
              (tham số riêng cho mỗi chuỗi i)

Mô hình toàn cục: θ = argmin Σ_i Σ_t L(y_t^(i), f(y_{t-1:t-p}^(i), z^(i); θ))
              (tham số chia sẻ, z^(i) = đặc trưng tĩnh riêng cho mỗi chuỗi)

Foundation model: θ_pretrain = argmin Σ_{D_j ∈ pretraining corpus} Σ_i Σ_t L(...)
                  Khi suy luận: zero-shot, không cần fine-tuning
```

**Độ khó:** Trung cấp
**Kiến thức tiên quyết:** Khái niệm huấn luyện mô hình, cơ bản về transfer learning (học chuyển giao)
**Tại sao quan trọng:** Sự chuyển dịch từ cục bộ sang toàn cục sang foundation model là xu hướng trung tâm thúc đẩy lĩnh vực (2020–2026). Người thực hành hiểu điều này có thể đưa ra lựa chọn kiến trúc phù hợp cho quy mô và khối lượng dữ liệu của mình.

---

### Khái niệm 9: Dự báo phân cấp & Hòa hợp (Hierarchical Forecasting & Reconciliation)

**Mô tả:**
Các tổ chức hiếm khi dự báo một chuỗi đơn lẻ riêng biệt. Nhà bán lẻ dự báo ở cấp SKU, cửa hàng, khu vực, và quốc gia đồng thời — tất cả các cấp phải nhất quán nội bộ (dự báo cấp SKU phải cộng lại bằng tổng cửa hàng). Dự báo phân cấp tạo dự báo ở tất cả các cấp và hòa hợp chúng để đảm bảo tính nhất quán.

Ba cách tiếp cận: (1) Top-Down (Trên xuống) — dự báo tổng hợp, sau đó phân bổ bằng tỷ lệ lịch sử; (2) Bottom-Up (Dưới lên) — dự báo cấp thấp nhất, tổng hợp lên; (3) Hòa hợp tối ưu (MinT, Wickramasuriya và cộng sự 2019) — chiếu các dự báo cơ sở lên không gian con nhất quán bằng cách tối thiểu hóa phương sai sai số dự báo.

Nghiên cứu gần đây (2022–2024) tích hợp hòa hợp vào quá trình huấn luyện nơ-ron đầu-cuối, cho phép gradient chảy qua bước hòa hợp. HierE2E (Rangapuram và cộng sự, 2021) và hòa hợp xác suất dựa trên ETS (Panagiotelis và cộng sự, 2023) mở rộng điều này sang dự báo phân phối.

**Công thức toán học:**
```
Ràng buộc phân cấp:  y_t = S · b_t
  trong đó S = ma trận tổng hợp, b_t = chuỗi cấp đáy

Hòa hợp MinT:
  ỹ_t = S · (SᵀW⁻¹S)⁻¹ · Sᵀ · W⁻¹ · ŷ_t

  trong đó W = ma trận hiệp phương sai của sai số dự báo cơ sở
  (hiệp phương sai mẫu, co rút đường chéo, hoặc xấp xỉ OLS)

Tính chất dự báo nhất quán: Σ ỹ_{SKU,t} = ỹ_{store,t}
```

**Độ khó:** Nâng cao
**Kiến thức tiên quyết:** Đại số tuyến tính, phép toán ma trận, cơ bản về dự báo
**Tại sao quan trọng:** Mọi hệ thống dự báo doanh nghiệp đều xử lý phân cấp. Hòa hợp MinT đã sẵn sàng cho sản xuất (có sẵn trong statsforecast, sktime, gói fable R). Bỏ qua tính nhất quán phân cấp dẫn đến các dự báo mâu thuẫn giữa các cấp báo cáo.

---

### Khái niệm 10: Foundation Models cho chuỗi thời gian (Dự báo Zero-Shot)

**Mô tả:**
Foundation models cho chuỗi thời gian là các mạng nơ-ron lớn được tiền huấn luyện trên kho dữ liệu chuỗi thời gian khổng lồ, đa dạng (hàng triệu chuỗi từ nhiều miền), cho phép dự báo zero-shot hoặc few-shot trên chuỗi mới chưa từng thấy mà không cần huấn luyện lại. Điều này phản ánh cuộc cách mạng NLP (GPT, BERT) và đại diện cho bước phát triển biến đổi nhất trong dự báo kể từ deep learning.

Các mô hình chính 2023–2025: TimesFM (Google DeepMind, 2024) — Transformer giải mã được huấn luyện trên 100 tỷ điểm dữ liệu, kích thước patch đầu vào 32, vượt trội hơn các baseline thống kê ở chế độ zero-shot; Chronos (Amazon, 2024) — tokenize giá trị chuỗi thời gian qua lượng tử hóa và fine-tune mô hình ngôn ngữ T5; Moirai (Salesforce, 2024) — tiền huấn luyện masked đa năng với mixture-of-experts output heads; MOMENT (CMU, 2024) — tiền huấn luyện masked kiểu BERT trên Time Series Pile (13 miền).

Cuộc tranh luận trung tâm: foundation model zero-shot vs. mô hình fine-tune chuyên biệt cho tác vụ. Trên dự báo chân trời ngắn, mô hình thống kê (ETS, ARIMA) vẫn cạnh tranh. Foundation models vượt trội ở: (a) zero-shot chân trời dài; (b) chuỗi cold-start; (c) chuyển giao liên miền.

**Công thức toán học:**
```
Mục tiêu tiền huấn luyện (TimesFM — masked autoregressive):
  L = -Σ log p_θ(patch_t | patch_{1:t-1})
  patch_t = normalize(y_{t·P : (t+1)·P})   (P = kích thước patch)

Chronos tokenization:
  bin_k = [μ - σ·z_{k/K}, μ - σ·z_{(k+1)/K}]  (K = kích thước từ vựng)
  token_t = argmin_k |y_t - center_k|
  Đầu ra: phân phối phân loại trên K bins → lấy mẫu quỹ đạo dự báo

Suy luận zero-shot: không cập nhật gradient, truyền xuôi trực tiếp trên chuỗi mới
```

**Độ khó:** Nâng cao
**Kiến thức tiên quyết:** Transformers, mô hình tiền huấn luyện/fine-tuning, dự báo xác suất
**Tại sao quan trọng:** Foundation models sẽ thay đổi căn bản kinh tế học của dự báo — giảm thời gian phát triển mô hình từ hàng tuần xuống hàng giờ. TimesFM và Chronos đã được triển khai sản xuất tại Google và Amazon tương ứng. Đây là "khoảnh khắc GPT" cho chuỗi thời gian.

---

## 5. Danh mục thuật toán

| Thuật toán | Danh mục | Phù hợp nhất cho | Độ phức tạp thời gian | Độ trưởng thành | Độ tin cậy |
|-----------|----------|----------|----------------|----------|------------|
| ARIMA / SARIMA | Thống kê | Đơn biến, lịch sử ngắn, cần khả năng diễn giải | O(n·p²) fitting | Trưởng thành | CAO |
| ETS / Holt-Winters | Thống kê | KPI doanh nghiệp, đơn biến tự động | O(n·m) | Trưởng thành | CAO |
| Prophet | Thống kê + Bayes | Chuỗi doanh nghiệp có ngày lễ, dữ liệu thiếu | O(n log n) | Sản xuất | CAO |
| XGBoost / LightGBM | ML (Gradient Boosting) | Nhiều đặc trưng, mẫu phi tuyến, kiểu bảng | O(n·d·log n) | Trưởng thành | CAO |
| N-BEATS | Deep Learning (MLP) | Chân trời dài, đơn biến, thi đấu | O(n·L·H) | Sản xuất | CAO |
| N-HiTS | Deep Learning (MLP + Nội suy) | Chân trời dài đa tốc độ | O(n·L) | Sản xuất | TRUNG BÌNH |
| DeepAR | Deep Learning (LSTM) | Xác suất, toàn cục, chuỗi thưa | O(n·T·H) | Sản xuất | CAO |
| PatchTST | Deep Learning (Transformer) | Chân trời dài đa biến, độc lập kênh | O(n·(L/P)²) | Sản xuất | CAO |
| iTransformer | Deep Learning (Transformer) | Đa biến chiều cao | O(n·D²) | Mới nổi | TRUNG BÌNH |
| TimesFM | Foundation Model | Zero-shot, cold-start, đa miền | O(1) suy luận | Mới nổi | TRUNG BÌNH |
| Chronos | Foundation Model | Zero-shot xác suất, lượng hóa bất định | O(1) suy luận | Mới nổi | TRUNG BÌNH |
| TFT (Temporal Fusion Transformer) | Hybrid DL | Đa biến có thể diễn giải, trọng số attention | O(n·T²) | Sản xuất | CAO |
| TBATS | Thống kê | Đa mùa vụ phức tạp, chu kỳ bất thường | O(n·m) | Sản xuất | CAO |

---

### Phân tích chi tiết thuật toán

#### ARIMA / SARIMA
**Ưu điểm:**
- Được hiểu rõ về mặt toán học; tham số có thể diễn giải
- Hiệu suất mạnh trên dự báo đơn biến chân trời ngắn
- Tạo khoảng dự báo hợp lệ dưới giả định Gauss
- AutoARIMA (pmdarima, StatsForecast) tự động hóa lựa chọn bậc

**Nhược điểm:**
- Giả định tuyến tính; không nắm bắt được các mẫu phi tuyến phức tạp
- Yêu cầu tiền xử lý tính dừng
- Mở rộng kém cho hàng triệu chuỗi (dù StatsForecast khá nhanh)
- Khó khăn với tính mùa vụ bất thường (cần TBATS hoặc MSTL)

**Bài báo chính:**
- Box, G.E.P. & Jenkins, G.M. (1970). *Time Series Analysis: Forecasting and Control.* Holden-Day.
- Hyndman, R.J. & Khandakar, Y. (2008). "Automatic Time Series Forecasting: The forecast Package for R." *Journal of Statistical Software*, 27(3).

---

#### N-BEATS (Neural Basis Expansion Analysis for Interpretable Time Series Forecasting)
**Ưu điểm:**
- Hoàn toàn dựa trên MLP, không có hồi quy hay tích chập — nhanh và song song hóa được
- Biến thể có thể diễn giải phân rã thành các khai triển cơ sở xu hướng + mùa vụ
- Thắng biến thể cuộc thi M4; kết quả benchmark mạnh
- Không yêu cầu biến ngoại sinh

**Nhược điểm:**
- Không tự nhiên xử lý đầu vào đa biến
- Yêu cầu dữ liệu đáng kể (khuyến nghị huấn luyện toàn cục)
- Biến thể có thể diễn giải áp đặt giả định cấu trúc không phải lúc nào cũng đúng

**Bài báo chính:**
- Oreshkin, B.N. và cộng sự (2020). "N-BEATS: Neural Basis Expansion Analysis for Interpretable Time Series Forecasting." *ICLR 2020.* [arXiv:1905.10437]

---

#### DeepAR (Amazon)
**Ưu điểm:**
- Đầu ra xác suất: phân phối dự đoán đầy đủ (phân vị, đường mẫu)
- Mô hình toàn cục: tận dụng mẫu từ hàng nghìn chuỗi liên quan
- Xử lý dữ liệu đếm (Nhị thức âm), dữ liệu liên tục (Gaussian/Student-t)
- Xử lý giá trị thiếu và chuỗi thời gian bất thường một cách tự nhiên

**Nhược điểm:**
- Suy luận tự hồi quy là tuần tự — chậm cho chân trời dài
- Huấn luyện yêu cầu kho dữ liệu lớn của các chuỗi liên quan
- Kém khả năng diễn giải hơn các phương pháp thống kê

**Bài báo chính:**
- Salinas, D. và cộng sự (2020). "DeepAR: Probabilistic Forecasting with Autoregressive Recurrent Networks." *International Journal of Forecasting*, 36(3). [arXiv:1704.04110]

---

#### PatchTST
**Ưu điểm:**
- Tokenization theo patch nắm bắt ngữ nghĩa thời gian cục bộ — mạnh ở chân trời dài
- Độc lập kênh: tránh nhiễu liên biến giả
- Có thể tiền huấn luyện qua mô hình patch masked (tự giám sát)
- Vượt trội tất cả Transformer trước đó trên 8 benchmark chuẩn (ETTh1/2, ETTm1/2, Exchange, Weather, ILI, Traffic)

**Nhược điểm:**
- Không mô hình hóa tương quan liên biến (độc lập kênh theo thiết kế)
- Yêu cầu dữ liệu huấn luyện đủ cho huấn luyện có giám sát
- Chưa zero-shot nếu không có tiền huấn luyện

**Bài báo chính:**
- Nie, Y. và cộng sự (2023). "A Time Series is Worth 64 Words: Long-term Forecasting with Transformers." *ICLR 2023.* [arXiv:2211.14730]

---

#### Temporal Fusion Transformer (TFT)
**Ưu điểm:**
- Xử lý biến tĩnh, biến tương lai đã biết, và biến tương lai chưa biết một cách gọn gàng
- Tạo trọng số attention có thể diễn giải (các bước thời gian quá khứ nào quan trọng)
- Đầu ra quantile cho dự báo xác suất
- Đạt giải hoặc top-3 trên nhiều benchmark dự báo doanh nghiệp thực tế

**Nhược điểm:**
- Kiến trúc phức tạp — nhiều siêu tham số cần tinh chỉnh
- Huấn luyện chậm hơn các phương pháp dựa trên MLP
- Yêu cầu kỹ thuật đặc trưng cẩn thận để đạt kết quả tốt nhất

**Bài báo chính:**
- Lim, B. và cộng sự (2021). "Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting." *International Journal of Forecasting*, 37(4). [arXiv:1912.09363]

---

#### TimesFM (Google DeepMind)
**Ưu điểm:**
- Dự báo zero-shot — không cần huấn luyện cho từng tập dữ liệu
- Huấn luyện trên 100 tỷ điểm dữ liệu thực tế (Google Trends, Wikipedia, tổng hợp)
- Vượt trội các baseline thống kê (ARIMA, ETS) trên các tác vụ zero-shot
- Mô hình 200M tham số: triển khai được trên phần cứng tiêu chuẩn

**Nhược điểm:**
- Bị vượt qua bởi mô hình fine-tune chuyên biệt trên dữ liệu trong phân phối
- Chủ yếu là dự báo điểm (phần mở rộng xác suất đang phát triển)
- Yêu cầu dữ liệu ở định dạng chuẩn hóa/patch

**Bài báo chính:**
- Das, A. và cộng sự (2024). "A Decoder-Only Foundation Model for Time-Series Forecasting." *ICML 2024.* [arXiv:2310.10688]

---

#### Chronos (Amazon)
**Ưu điểm:**
- Tokenize giá trị số — tận dụng đầy đủ kiến trúc mô hình ngôn ngữ (T5)
- Đầu ra xác suất thông qua lấy mẫu từ phân phối phân loại trên các bin
- Đạt CRPS mạnh trên 42 bộ dữ liệu benchmark
- Mã nguồn mở, nhiều kích cỡ (Tiny đến Large)

**Nhược điểm:**
- Lượng tử hóa tokenization gây lỗi rời rạc hóa
- Backbone T5 không chuyên biệt cho cấu trúc thời gian
- Chậm hơn phương pháp thống kê cho suy luận chuỗi đơn

**Bài báo chính:**
- Ansari, A.F. và cộng sự (2024). "Chronos: Learning the Language of Time Series." *TMLR 2024.* [arXiv:2403.07815]

---

## 6. Hiện trạng nghệ thuật (2024–2026)

### 6.1 Foundation Models — Chủ đề thống trị của 2024

Năm 2024 đánh dấu "khoảnh khắc foundation model" cho dự báo chuỗi thời gian. Nhiều mô hình tiền huấn luyện quy mô lớn được phát hành trong vòng vài tháng:

| Mô hình | Tổ chức | Tham số | Dữ liệu huấn luyện | Đổi mới chính | Công bố |
|-------|-------------|--------|---------------|----------------|-----------|
| TimesFM | Google DeepMind | 200M | 100 tỷ điểm dữ liệu | Decoder-only patches | ICML 2024 |
| Chronos | Amazon | 20M–710M | 84 tỷ tokens | Tokenization số qua T5 | TMLR 2024 |
| Moirai | Salesforce | 14M–311M | 27 tỷ điểm (tập LOTSA) | Tiền huấn luyện masked, MoE output | ICML 2024 |
| MOMENT | CMU | 385M | Time Series Pile (13 miền) | Patch masked kiểu BERT | ICML 2024 |
| Lag-Llama | Mila/ServiceNow | 24M | TS công khai đa dạng | Backbone LLM với đặc trưng trễ | arXiv 2024 |
| Timer | Tsinghua | — | UTSD (tập TS thống nhất) | Decoder-only, đa tác vụ | NeurIPS 2024 |

**Độ tin cậy: CAO** — Tất cả mô hình đều có sẵn công khai trên Hugging Face và kèm theo bài báo đã qua bình duyệt.

---

### 6.2 Dự báo dựa trên LLM (2023–2025)

Nghiên cứu đã khám phá việc tái sử dụng Large Language Models (Mô hình ngôn ngữ lớn) (GPT-4, LLaMA) cho chuỗi thời gian, với kết quả không đồng nhất:

- **LLM-Time (Gruver và cộng sự, 2023, NeurIPS):** Biểu diễn chuỗi thời gian số dưới dạng chuỗi văn bản (các giá trị cách nhau bằng dấu cách), nhắc GPT-4 cho các giá trị tiếp theo — hiệu suất zero-shot cạnh tranh, đáng ngạc nhiên vì không có tiền huấn luyện TS.
- **GPT4TS (Zhou và cộng sự, 2023, NeurIPS):** Đóng băng backbone GPT-2, chỉ huấn luyện lớp đầu vào/đầu ra — mô hình "một cho tất cả" cho nội suy, phát hiện bất thường, dự báo.
- **TEMPO (Cao và cộng sự, 2024):** Fine-tuning dựa trên prompt của GPT-2 với prompt nhận biết phân rã — phân rã chuỗi thời gian (xu hướng, mùa vụ, phần dư) thành các token prompt riêng biệt.
- **TIME-LLM (Jin và cộng sự, 2024, ICLR):** Lớp lập trình lại căn chỉnh patch chuỗi thời gian với không gian token mô hình ngôn ngữ mà không thay đổi trọng số LLM.

**Phát hiện chính:** LLM chứa các prior suy luận thời gian hữu ích nhưng không tối ưu về mặt kiến trúc cho chuỗi thời gian. Tiền huấn luyện chuyên miền (TimesFM, Chronos) vượt trội LLM tổng quát trên hầu hết benchmark. Tuy nhiên, LLM xuất sắc trong việc tích hợp ngữ cảnh văn bản (tin tức, mô tả thời tiết) với chuỗi số.

**Độ tin cậy: CAO** — Nhiều benchmark đã qua bình duyệt xác nhận mẫu này.

---

### 6.3 Sự phục hưng của mô hình tuyến tính (2022–2024)

Zeng và cộng sự (2023, AAAI) công bố "Are Transformers Effective for Time Series Forecasting?" — cho thấy mô hình tuyến tính một lớp đơn giản (DLinear = phân rã xu hướng-phần dư + chiếu tuyến tính) vượt trội Informer, Autoformer, và FEDformer trên 7/8 benchmark. Điều này gây ra cuộc tranh luận lớn và kích hoạt việc sửa đổi thiết kế benchmark.

Các nghiên cứu tiếp theo cho thấy:
- Benchmark TS chuẩn (tập ETT) có thể có rò rỉ thông tin hoặc quá đơn giản
- Transformers vượt trội khi chuỗi thực sự dài (>1000 lookback), chiều cao, hoặc cần mô hình hóa liên biến
- PatchTST, iTransformer, và TimeMixer khôi phục tính cạnh tranh của Transformer thông qua cải tiến kiến trúc

**Độ tin cậy: CAO** — Bài báo có sẵn công khai; kết quả được tái tạo độc lập.

---

### 6.4 Mô hình khuếch tán cho chuỗi thời gian (2023–2025)

Các mô hình khuếch tán sinh (lấy cảm hứng từ sinh ảnh) đang được áp dụng cho chuỗi thời gian:
- **CSDI (Tashiro và cộng sự, 2021, NeurIPS):** Khuếch tán dựa trên điểm số cho nội suy và dự báo xác suất
- **TSDiff (Kollovieh và cộng sự, 2023):** Tự hướng dẫn cho khuếch tán chuỗi thời gian
- **TimeDiff (Shen & Kwok, 2023):** Điều kiện trộn tương lai cải thiện dự báo khuếch tán
- **MG-TSD (Gao và cộng sự, 2024):** Hướng dẫn đa mức chi tiết cho dự báo khuếch tán chân trời dài

Mô hình khuếch tán xuất sắc trong việc tạo các quỹ đạo dự báo đa dạng, thực tế — đặc biệt có giá trị cho lập kế hoạch kịch bản trong tài chính và năng lượng. Tuy nhiên, tốc độ suy luận (nhiều bước khử nhiễu) hạn chế việc áp dụng trong sản xuất.

**Độ tin cậy: TRUNG BÌNH** — Kết quả học thuật mạnh; ít triển khai sản xuất được ghi nhận tính đến 2025.

---

### 6.5 Mamba (Mô hình không gian trạng thái với quét chọn lọc) cho TS (2024)

Kiến trúc Mamba (Gu & Dao, 2023) — dựa trên mô hình không gian trạng thái có cấu trúc với quét chọn lọc tối ưu cho phần cứng — đạt độ phức tạp tuyến tính O(n) đồng thời sánh hoặc vượt hiệu suất Transformer trên các tác vụ chuỗi. Nó nhanh chóng được điều chỉnh cho chuỗi thời gian:

- **S-Mamba (Wang và cộng sự, 2024):** Tương quan liên biến qua Mamba với các khối attention kiểu Transformer
- **TimeMachine (Ahamed & Cheng, 2024):** Cấu trúc Quadruple-Mamba cho dự báo dài hạn
- **MambaFormer (Park và cộng sự, 2024):** Kiến trúc lai Mamba + Transformer

Mamba hứa hẹn về mặt kiến trúc nhưng benchmark tính đến đầu 2025 cho thấy lợi thế cạnh tranh nhưng chưa quyết định so với PatchTST/iTransformer. Độ phức tạp tuyến tính có lợi thế cho chuỗi rất dài (>10.000 bước thời gian).

**Độ tin cậy: TRUNG BÌNH** — Lĩnh vực nghiên cứu phát triển nhanh; độ trưởng thành sản xuất chưa được thiết lập.

---

### 6.6 Tiến bộ Benchmark (2024–2025)

- **Gift-Eval (Aksu và cộng sự, 2024):** Benchmark toàn diện bao gồm 23 tập dữ liệu trên 7 miền, bao gồm các miền trước đó chưa được đại diện đủ (y tế, giao thông). Foundation models được đánh giá có hệ thống.
- **LOTSA (Salesforce, 2024):** Kho lưu trữ chuỗi thời gian mở quy mô lớn với 27 tỷ điểm dữ liệu, được sử dụng cho tiền huấn luyện Moirai và hiện là kho tiền huấn luyện chuẩn.
- **Bài học từ cuộc thi M5 (2020):** Gradient boosting (LightGBM) với kỹ thuật đặc trưng mạnh đã thắng. Các phương pháp lai thống kê-ML vượt trội DL thuần. Phát hiện này vẫn đúng cho dự báo bán lẻ chân trời ngắn.

---

## 7. Các bài báo quan trọng (≥10 với trích dẫn)

### Bài báo 1
**Tiêu đề:** "Time Series Analysis: Forecasting and Control"
**Tác giả:** George E.P. Box, Gwilym M. Jenkins
**Năm:** 1970 (ấn bản thứ 4 năm 2015)
**Nơi xuất bản:** Sách giáo khoa, Holden-Day (Wiley)
**Đóng góp chính:** Giới thiệu lớp mô hình ARIMA và phương pháp lặp 3 bước (xác định → ước lượng → kiểm tra chẩn đoán) đã định hình 30 năm thực hành chuỗi thời gian. Giới thiệu ACF/PACF như công cụ chẩn đoán. Thiết lập maximum likelihood làm khung ước lượng.
**Tác động:** Công trình có ảnh hưởng nhất trong dự báo chuỗi thời gian. "Box-Jenkins" vẫn đồng nghĩa với ARIMA trong tài liệu thực hành. Phương pháp này vẫn là baseline mặc định cho dự báo đơn biến.
**Độ tin cậy: CAO**

---

### Bài báo 2
**Tiêu đề:** "Forecasting with Exponential Smoothing: The State Space Approach"
**Tác giả:** Rob J. Hyndman, Anne B. Koehler, J. Keith Ord, Ralph D. Snyder
**Năm:** 2008
**Nơi xuất bản:** Springer Verlag (Sách giáo khoa)
**Đóng góp chính:** Thống nhất tất cả phương pháp làm trơn hàm mũ dưới khung không gian trạng thái xác suất (mô hình ETS), cho phép lựa chọn mô hình dựa trên AIC và khoảng dự báo đúng đắn. Chứng minh rằng mô hình ETS tương đương với mô hình không gian trạng thái cấu trúc cụ thể. Được triển khai dưới hàm `ets()` trong gói forecast R.
**Tác động:** Biến đổi phương pháp làm trơn hàm mũ từ ad-hoc thành khung thống kê có nguyên tắc. Auto-ETS trở thành phương pháp dự báo đơn biến sản xuất chuẩn.
**Độ tin cậy: CAO**

---

### Bài báo 3
**Tiêu đề:** "DeepAR: Probabilistic Forecasting with Autoregressive Recurrent Networks"
**Tác giả:** David Salinas, Valentin Flunkert, Jan Gasthaus, Tim Januschowski
**Năm:** 2020 (arXiv: 2017)
**Nơi xuất bản:** *International Journal of Forecasting*, 36(3), 1181–1191
**Đóng góp chính:** Mô hình dự báo xác suất toàn cục quy mô lớn đầu tiên sử dụng LSTM với likelihood tham số hóa (Gaussian, Nhị thức âm, Student-t). Chứng minh rằng huấn luyện trên hàng nghìn chuỗi liên quan cải thiện độ chính xác so với mô hình cục bộ. Cho phép dự báo xác suất quy mô sản xuất tại Amazon.
**Liên kết:** https://arxiv.org/abs/1704.04110
**Độ tin cậy: CAO**

---

### Bài báo 4
**Tiêu đề:** "N-BEATS: Neural Basis Expansion Analysis for Interpretable Time Series Forecasting"
**Tác giả:** Boris N. Oreshkin, Dmitri Carpov, Nicolas Chapados, Yoshua Bengio
**Năm:** 2020
**Nơi xuất bản:** *ICLR 2020* (International Conference on Learning Representations)
**Đóng góp chính:** Kiến trúc MLP thuần túy với xếp chồng phần dư. Biến thể có thể diễn giải sử dụng hàm cơ sở Fourier và đa thức cho phân rã xu hướng/mùa vụ tường minh. Vượt trội tất cả phương pháp cổ điển và lai trên dữ liệu cuộc thi M4. Chứng minh kiến trúc chỉ-MLP có thể đạt hiệu suất ngang LSTM mà không cần hồi quy.
**Liên kết:** https://arxiv.org/abs/1905.10437
**Độ tin cậy: CAO**

---

### Bài báo 5
**Tiêu đề:** "Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting"
**Tác giả:** Bryan Lim, Sercan O. Arik, Nicolas Loeff, Tomas Pfister
**Năm:** 2021
**Nơi xuất bản:** *International Journal of Forecasting*, 37(4)
**Đóng góp chính:** Thiết kế Transformer chuyên biệt cho dự báo với: (1) mạng lựa chọn biến để xử lý các loại đầu vào hỗn hợp; (2) mạng phần dư có cổng cho tính phi tuyến thích nghi; (3) khả năng diễn giải dựa trên attention. Đạt hiện trạng nghệ thuật trên nhiều bộ dữ liệu doanh nghiệp thực tế đồng thời cung cấp giải thích dựa trên attention.
**Liên kết:** https://arxiv.org/abs/1912.09363
**Độ tin cậy: CAO**

---

### Bài báo 6
**Tiêu đề:** "Forecasting at Scale"
**Tác giả:** Sean J. Taylor, Benjamin Letham
**Năm:** 2018
**Nơi xuất bản:** *The American Statistician*, 72(1), 37–45
**Đóng góp chính:** Giới thiệu Facebook Prophet — hệ thống dự báo thực tiễn, dễ tiếp cận cho nhà phân tích sử dụng phân rã cộng với xu hướng tuyến tính từng đoạn/logistic, tính mùa vụ dựa trên Fourier, và hiệu ứng ngày lễ. Được thiết kế bền vững với dữ liệu thiếu và ngoại lai, với phát hiện điểm thay đổi tự động qua prior Laplace. Dân chủ hóa dự báo chuỗi thời gian cho người không chuyên thống kê.
**Liên kết:** https://doi.org/10.1080/00031305.2017.1380080
**Độ tin cậy: CAO**

---

### Bài báo 7
**Tiêu đề:** "A Time Series is Worth 64 Words: Long-term Forecasting with Transformers"
**Tác giả:** Yuqi Nie, Nam H. Nguyen, Phanwadee Sinthong, Jayant Kalagnanam
**Năm:** 2023
**Nơi xuất bản:** *ICLR 2023*
**Đóng góp chính:** Giới thiệu PatchTST với hai đổi mới: (1) tokenization dựa trên patch nắm bắt ngữ cảnh thời gian cục bộ; (2) độc lập kênh (mỗi chuỗi đơn biến được xử lý độc lập trong thiết lập đa biến). Vượt trội tất cả mô hình Transformer trước đó và cạnh tranh với N-BEATS/N-HiTS trên benchmark chuẩn. Cho phép tiền huấn luyện tự giám sát qua mô hình patch masked.
**Liên kết:** https://arxiv.org/abs/2211.14730
**Độ tin cậy: CAO**

---

### Bài báo 8
**Tiêu đề:** "Are Transformers Effective for Time Series Forecasting?"
**Tác giả:** Ailing Zeng, Muxi Chen, Lei Zhang, Qiang Liu
**Năm:** 2023
**Nơi xuất bản:** *AAAI 2023*
**Đóng góp chính:** Chứng minh rằng phép chiếu tuyến tính đơn giản (DLinear) với phân rã xu hướng-phần dư vượt trội Informer, Autoformer, FEDformer, và Pyraformer trên 7/8 benchmark. Lập luận rằng phụ thuộc thời gian trong benchmark TS chuẩn quá ngắn để Transformer thể hiện lợi thế. Kích hoạt việc đánh giá lại đáng kể nghiên cứu TS dựa trên Transformer.
**Liên kết:** https://arxiv.org/abs/2205.13504
**Độ tin cậy: CAO**

---

### Bài báo 9
**Tiêu đề:** "A Decoder-Only Foundation Model for Time-Series Forecasting"
**Tác giả:** Abhimanyu Das, Weihao Kong, Andrew Leach, Shaan Mathur, Rajat Sen, Rose Yu
**Năm:** 2024
**Nơi xuất bản:** *ICML 2024*
**Đóng góp chính:** TimesFM — Transformer giải mã 200M tham số huấn luyện trên 100 tỷ điểm dữ liệu thực tế. Hiệu suất zero-shot cạnh tranh hoặc vượt trội mô hình thống kê chuyên biệt (ARIMA, ETS) trên 34 tập dữ liệu đánh giá. Giới thiệu kích thước patch đầu vào 32 với độ phân giải thời gian đa tỷ lệ. Được triển khai nội bộ tại Google.
**Liên kết:** https://arxiv.org/abs/2310.10688
**Độ tin cậy: CAO**

---

### Bài báo 10
**Tiêu đề:** "Chronos: Learning the Language of Time Series"
**Tác giả:** Abdul Fatir Ansari, Lorenzo Stella, Caner Turkmen, và cộng sự (Amazon)
**Năm:** 2024
**Nơi xuất bản:** *Transactions on Machine Learning Research (TMLR)*, 2024
**Đóng góp chính:** Tokenize chuỗi thời gian số qua chuẩn hóa trung bình và lượng tử hóa thành từ vựng cố định 4096 bin, sau đó fine-tune mô hình ngôn ngữ tiền huấn luyện (T5) làm dự báo tự hồi quy. Dự báo xác suất qua lấy mẫu token. Đánh giá trên 42 bộ dữ liệu benchmark; hiệu suất zero-shot mạnh đặc biệt trên chỉ số xác suất (CRPS). Mã nguồn mở trên Hugging Face.
**Liên kết:** https://arxiv.org/abs/2403.07815
**Độ tin cậy: CAO**

---

### Bài báo 11
**Tiêu đề:** "Unified Training of Universal Time Series Forecasting Transformers"
**Tác giả:** Gerald Woo, Chenghao Liu, Akshat Kumar, Caiming Xiong, Silvio Savarese, Doyen Sahoo
**Năm:** 2024
**Nơi xuất bản:** *ICML 2024*
**Đóng góp chính:** Moirai — mô hình dự báo đa năng sử dụng tiền huấn luyện masked encoder trên LOTSA (27 tỷ điểm dữ liệu từ 9 miền). Giới thiệu mixture-of-experts output heads để xử lý các loại phân phối khác nhau (Gaussian, Student-t, Nhị thức âm, Log-Normal) và any-variate attention cho chuỗi đa biến. Chứng minh khả năng vượt trội zero-shot và few-shot so với mô hình chuyên miền trên 17 benchmark.
**Liên kết:** https://arxiv.org/abs/2402.02592
**Độ tin cậy: CAO**

---

### Bài báo 12
**Tiêu đề:** "iTransformer: Inverted Transformers Are Effective for Time Series Forecasting"
**Tác giả:** Yong Liu, Tengge Hu, Haoran Zhang, và cộng sự
**Năm:** 2024
**Nơi xuất bản:** *ICLR 2024*
**Đóng góp chính:** Đề xuất đảo ngược cơ chế attention của Transformer — áp dụng attention trên các biến số (đặc trưng) thay vì các bước thời gian. Mỗi token biến đại diện cho toàn bộ chuỗi thời gian của nó. Self-attention học tương quan đa biến; FFN mã hóa các mẫu thời gian cho mỗi biến độc lập. Đạt kết quả tốt nhất trên ETTH1/2, ETTm1/2, Weather, Traffic, Solar, PEMS datasets.
**Liên kết:** https://arxiv.org/abs/2310.06625
**Độ tin cậy: CAO**

---

## 8. Dòng thời gian phát triển

| Năm | Cột mốc | Ý nghĩa |
|------|-----------|-------------|
| 1927 | Yule giới thiệu mô hình Autoregressive (AR) cho dữ liệu vết đen mặt trời | Khai sinh mô hình hóa chuỗi thời gian tham số |
| 1970 | Box & Jenkins xuất bản "Time Series Analysis: Forecasting and Control" | Định nghĩa khung ARIMA và phương pháp Box-Jenkins — mô hình thống trị 30 năm |
| 1957–1963 | Brown, Holt, Winters phát triển làm trơn hàm mũ | Phương pháp dự báo doanh nghiệp thực tiễn; vẫn được sử dụng rộng rãi trong hệ thống ERP |
| 1986 | Engle đoạt giải Nobel (2003) cho mô hình ARCH về biến động tài chính | Mở rộng TS để mô hình hóa phương sai biến đổi theo thời gian; sinh ra họ GARCH, EGARCH |
| 1987 | Engle & Granger giới thiệu đồng tích hợp (Nobel 2003) | Cho phép mô hình hóa dài hạn chuỗi đa biến không dừng (VAR, VECM) |
| 1994 | Harvey: "Structural Time Series Models" / Phổ biến bộ lọc Kalman | Khung không gian trạng thái thống nhất ETS, ARIMA, hồi quy |
| 2000 | Cuộc thi M3 — Makridakis và cộng sự | Cho thấy phương pháp đơn giản (Theta, ETS) vượt ML phức tạp trên benchmark đơn biến |
| 2002 | Scott Taylor phát triển phương pháp Theta | Phân rã chuỗi thành hai đường theta; cơ sở của ForecastPro |
| 2008 | Hyndman và cộng sự — Khung không gian trạng thái ETS | Thống nhất làm trơn hàm mũ dưới khung xác suất; gói forecast cho R |
| 2012–2014 | Sự phục hưng deep learning; LSTM cho mô hình chuỗi | Graves (2012) chứng minh LSTM cho giọng nói; cộng đồng bắt đầu áp dụng cho TS |
| 2017 | DeepMind WaveNet | Tích chập nhân quả giãn nở cho âm thanh; khuôn mẫu cho TCN áp dụng cho TS |
| 2017 | Vaswani và cộng sự — "Attention Is All You Need" | Kiến trúc Transformer; kích hoạt cuộc cách mạng NLP cuối cùng lan sang TS |
| 2017 | Salinas và cộng sự — DeepAR (Amazon) | Mô hình TS xác suất toàn cục quy mô lớn đầu tiên; LSTM + likelihood tham số hóa |
| 2018 | Cuộc thi M4 (100.000 chuỗi) | ES-RNN lai thắng; ML thuần không đạt; gây tranh luận về DL cho TS |
| 2018 | Facebook Prophet công bố | Dân chủ hóa dự báo TS; phân rã cộng với điểm thay đổi tự động |
| 2019 | N-BEATS — Oreshkin và cộng sự (ICLR 2020) | MLP thuần thắng tất cả phương pháp cổ điển; khai triển cơ sở có thể diễn giải |
| 2020 | Informer — Zhou và cộng sự (AAAI 2021) | Transformer đầu tiên cho TS chân trời dài (ProbSparse attention, O(n log n)) |
| 2021 | Autoformer — Wu và cộng sự (NeurIPS 2021) | Cơ chế Auto-Correlation; phân rã + attention thưa |
| 2021 | Temporal Fusion Transformer (IJF) | Transformer đa biến có thể diễn giải; lựa chọn biến + attention |
| 2021 | N-HiTS — Challu và cộng sự (AAAI 2023) | Lấy mẫu tín hiệu đa tốc độ cho dự báo MLP chân trời dài |
| 2022 | LTSF-Linear (DLinear) — Zeng và cộng sự | Mô hình tuyến tính thắng Transformers; kích hoạt suy nghĩ lại kiến trúc |
| 2023 | PatchTST — Nie và cộng sự (ICLR 2023) | Tokenization patch; độc lập kênh; tiền huấn luyện tự giám sát |
| 2023 | TimesNet — Wu và cộng sự (ICLR 2023) | Chuyển đổi TS 1D sang không gian 2D; tích chập 2D cho biến thiên thời gian |
| 2023 | LLM-Time — Gruver và cộng sự (NeurIPS 2023) | GPT-4 làm dự báo zero-shot; kết nối LLM và TS |
| 2024 | TimesFM (Google, ICML 2024) | Foundation model giải mã 200M tham số; tiền huấn luyện 100 tỷ điểm |
| 2024 | Chronos (Amazon, TMLR 2024) | Dự báo TS tokenize dựa trên T5; đánh giá 42 tập dữ liệu |
| 2024 | Moirai (Salesforce, ICML 2024) | Encoder masked đa năng; đầu ra MoE; phát hành tập LOTSA |
| 2024 | iTransformer (ICLR 2024) | Attention đảo ngược trên biến; SOTA trên nhiều benchmark đa biến |
| 2024 | Mô hình TS dựa trên Mamba | SSM độ phức tạp tuyến tính cho TS; cạnh tranh với Transformers |
| 2025 | TimesFM 2.0, Moirai 2.0 (được báo cáo) | Foundation models cải tiến với hỗ trợ fine-tuning và chân trời dài hơn |
| 2025–2026 | Kết hợp TS + LLM đa phương thức | Kết hợp văn bản, thời tiết, ngữ cảnh kinh tế với chuỗi số cho dự báo phong phú hơn |

---

## 9. Kết nối liên miền (7 Kết nối)

### Kết nối 1: Dự báo ↔ Phát hiện bất thường (B02)
**Mối quan hệ:** Phát hiện bất thường dựa trên sai số dự đoán — một điểm là bất thường nếu phần dư dự báo vượt ngưỡng (|y_t - ŷ_t| > k·σ). Phần dư ARIMA, sai số tái tạo LSTM, và likelihood mô hình khuếch tán đều được sử dụng để chấm điểm bất thường. Phân rã STL chia chuỗi thành xu hướng, mùa vụ, và phần dư — thành phần phần dư chính là tín hiệu bất thường. Ngược lại, huấn luyện chống bất thường (loại bỏ ngoại lai trước khi fit) rất quan trọng cho dự báo chính xác.

**Bằng chứng:** Phát hiện bất thường dựa trên LSTF (Anomaly Transformer, NeurIPS 2022); phần dư SARIMA cho phát hiện gian lận trong TS tài chính.

---

### Kết nối 2: Dự báo ↔ Tối ưu hóa & Vận trù học
**Mối quan hệ:** Dự báo là đầu vào chính cho các bài toán tối ưu. Dự báo nhu cầu đưa vào tối ưu tồn kho (mô hình newsvendor, lập trình ngẫu nhiên). Dự báo phụ tải đưa vào cam kết đơn vị và điều phối kinh tế trong hệ thống điện. Dự báo nhu cầu tuyến đường đưa vào tối ưu định tuyến xe. Sai số dự báo lan truyền thành bất định ngẫu nhiên vào tối ưu, thúc đẩy lập trình ngẫu nhiên và tối ưu bền vững.

**Bằng chứng:** Hệ thống tồn kho Amazon sử dụng dự báo DeepAR làm đầu vào cho tối ưu chuỗi cung ứng (Xin và cộng sự, 2021, Amazon Science Blog). Các nhà vận hành lưới điện (ISO-NE, CAISO) sử dụng dự báo phụ tải xác suất cho lập lịch dự trữ.

**Công thức chính — Newsvendor với dự báo:**
```
Order quantity* = F⁻¹(Cu / (Cu + Co))   [lượng đặt hàng tối ưu cho phân phối dự báo F]
trong đó Cu = chi phí thiếu hàng, Co = chi phí thừa hàng
```

---

### Kết nối 3: Dự báo ↔ Phân tích tài chính
**Mối quan hệ:** Dự báo tài chính là miền chuyên biệt với thách thức đặc thù: thị trường gần hiệu quả, phân phối đuôi nặng (fat tails, cụm biến động), và thay đổi chế độ. Mô hình GARCH nắm bắt cụm biến động trong lợi suất. LSTM dự báo chuỗi giá nhiều bước. Tối ưu danh mục sử dụng dự báo lợi suất và dự báo hiệp phương sai đồng thời (Black-Litterman, mô hình nhân tố). Giao dịch tần số cao sử dụng dự báo luồng lệnh ở cấp micro giây.

**Bằng chứng:** Họ mô hình GARCH là tiêu chuẩn trong quản lý rủi ro (khung rủi ro thị trường Basel III). DeepLOB (Ntakaris và cộng sự, 2020, IEEE Access) dự báo giá trung bình sổ lệnh giới hạn.

---

### Kết nối 4: Dự báo ↔ Quản lý chuỗi cung ứng
**Mối quan hệ:** Dự báo nhu cầu là năng lực nền tảng trong quản lý chuỗi cung ứng. Các chu kỳ S&OP (Sales & Operations Planning — Lập kế hoạch Bán hàng & Vận hành) xoay quanh dự báo nhu cầu cuốn chiếu 12 tháng. Dự báo phân cấp (SKU → danh mục → khu vực → quốc gia) là kiến trúc chuẩn. Nhu cầu gián đoạn (phụ tùng, hàng xa xỉ) yêu cầu phương pháp Croston hoặc phân phối Nhị thức âm. Dự báo thời gian giao hàng cho phép tính toán tồn kho an toàn động.

**Bằng chứng:** Walmart và Amazon vận hành hệ thống dự báo nhu cầu ML toàn cầu xử lý hàng triệu chuỗi hàng ngày. Cuộc thi M5 (Makridakis và cộng sự, 2022) sử dụng dữ liệu bán hàng phân cấp Walmart với các phương pháp dựa trên LightGBM thắng giải.

---

### Kết nối 5: Dự báo ↔ Hệ thống năng lượng
**Mối quan hệ:** Dự báo phụ tải điện ngắn hạn (1h–48h) rất quan trọng cho cân bằng lưới điện. Dự báo phát điện mặt trời và gió trở nên quan trọng không kém với tỷ lệ thâm nhập năng lượng tái tạo. Dự báo xác suất (phân vị, cây kịch bản) đưa vào cam kết đơn vị ngẫu nhiên. Dự báo giá cung cấp thông tin cho giao dịch năng lượng. Tất cả đều yêu cầu đặc trưng chuyên miền: thời tiết (nhiệt độ, bức xạ mặt trời, tốc độ gió), mẫu sử dụng theo thời gian, chỉ số hoạt động kinh tế.

**Bằng chứng:** GEFCom (Global Energy Forecasting Competition) theo dõi SOTA từ 2012. Dự báo phụ tải xác suất có sai số <2% MAPE đạt được với Transformer+đặc trưng thời tiết. Các nhà vận hành lưới EU công bố dự báo phụ tải hàng giờ.

---

### Kết nối 6: Dự báo ↔ Y tế & Dịch tễ học
**Mối quan hệ:** Dự báo lượng bệnh nhân đến thúc đẩy quyết định nhân sự bệnh viện (Cấp cứu, ICU). Dự báo dịch bệnh (COVID-19, cúm) sử dụng mô hình ngăn (SIR, SEIR) kết hợp với hiệu chỉnh ML cho yếu tố hành vi. Dự báo nhu cầu dược phẩm đảm bảo ổn định chuỗi cung ứng thuốc. Dự báo xu hướng dấu hiệu sinh tồn (giám sát ICU) sử dụng LSTM/Mamba cho hệ thống cảnh báo sớm.

**Bằng chứng:** Cuộc thi CDC FluSight theo dõi SOTA dự báo cúm hàng năm. Dự báo COVID-19 của IHME sử dụng mô hình dịch tễ + hiệu chỉnh TS. Duke Health sử dụng deep learning cho dự báo lượng bệnh nhân (NEJM Catalyst, 2019).

---

### Kết nối 7: Dự báo ↔ NLP & Mô hình ngôn ngữ (Liên ngành 2023–2026)
**Mối quan hệ:** Cuộc cách mạng LLM đang ảnh hưởng đến dự báo TS theo ba cách: (1) Dự báo TS zero-shot qua biểu diễn văn bản của số (LLM-Time); (2) Dự báo đa phương thức tích hợp tin tức/mạng xã hội làm chỉ báo dẫn dắt (ví dụ: tâm lý Twitter dự đoán biến động cổ phiếu, sự kiện tin tức dự đoán đột biến nhu cầu); (3) Chuyển giao kiến trúc — kỹ thuật tiền huấn luyện LLM (mô hình masked, dự đoán token tiếp theo) được điều chỉnh cho TS (Chronos, MOMENT, TimesFM).

**Bằng chứng:** TIME-LLM (ICLR 2024) lập trình lại trọng số LLM cho TS sử dụng "lớp lập trình lại." Chronos fine-tune T5 trên token số. LLM-Time (NeurIPS 2023) cho thấy GPT-4 đạt hiệu suất zero-shot cạnh tranh mà không cần huấn luyện chuyên biệt TS.

---

## 10. Bản đồ cấu trúc kiến thức

### Đồ thị kiến thức tiên quyết để thành thạo Dự báo & Chuỗi thời gian

```
CẤP 0 — Nền tảng Toán học
  ├── Xác suất & Thống kê (phân phối, kỳ vọng, phương sai)
  ├── Đại số tuyến tính (phép toán ma trận, trị riêng)
  ├── Giải tích (tối ưu hóa, gradient)
  └── Lập trình Python/R cơ bản

CẤP 1 — Phương pháp Thống kê Cổ điển
  ├── [Yêu cầu C0] Cấu trúc dữ liệu chuỗi thời gian & trực quan hóa
  ├── [Yêu cầu C0] Tính dừng & sai phân → kiểm định ADF
  ├── [Yêu cầu C0] Phân tích ACF / PACF
  ├── [Yêu cầu C0] Phân rã (cộng/nhân, STL)
  ├── [Yêu cầu C1-tính dừng] AR, MA, ARMA, ARIMA, SARIMA
  ├── [Yêu cầu C1-phân rã] ETS / Holt-Winters
  └── [Yêu cầu C0] Chỉ số đánh giá (MAE, RMSE, MAPE, SMAPE, MASE)

CẤP 2 — Dự báo Machine Learning
  ├── [Yêu cầu C1] Đặc trưng trễ, thống kê cuốn, đặc trưng thời gian
  ├── [Yêu cầu C1] Gradient Boosting (XGBoost, LightGBM) cho TS
  ├── [Yêu cầu C1] Prophet (xu hướng từng đoạn + mùa vụ Fourier)
  ├── [Yêu cầu C1] Kiểm chứng chéo cho chuỗi thời gian (cửa sổ mở rộng/cuốn)
  └── [Yêu cầu C1] Dự báo phân cấp & hòa hợp MinT

CẤP 3 — Dự báo Deep Learning
  ├── [Yêu cầu C2 + Mạng nơ-ron] TCN / WaveNet cho TS
  ├── [Yêu cầu C2 + Mạng nơ-ron] LSTM / GRU cho chuỗi
  ├── [Yêu cầu C3-LSTM] DeepAR (mô hình xác suất toàn cục)
  ├── [Yêu cầu C3-LSTM] N-BEATS / N-HiTS (chồng MLP)
  └── [Yêu cầu C3-LSTM + Transformers] PatchTST, TFT, iTransformer

CẤP 4 — Xác suất & Bất định
  ├── [Yêu cầu C3] Hồi quy phân vị & pinball loss
  ├── [Yêu cầu C3] Conformal prediction cho TS
  ├── [Yêu cầu C3] Đầu ra xác suất DeepAR
  └── [Yêu cầu C3] Mô hình khuếch tán cho TS (CSDI, TSDiff)

CẤP 5 — Foundation Models & Biên giới Nghiên cứu
  ├── [Yêu cầu C4 + Tiền huấn luyện] TimesFM, Chronos, Moirai, MOMENT
  ├── [Yêu cầu C4 + LLMs] LLM-Time, GPT4TS, TIME-LLM, TEMPO
  ├── [Yêu cầu C4] Mamba / SSM cho TS
  └── [Yêu cầu C5] Dự báo đa phương thức (văn bản + TS kết hợp)

HƯỚNG SONG SONG (có thể bắt đầu từ C2):
  ├── Chuyên biệt miền: Nhu cầu bán lẻ / Tài chính / Năng lượng / Y tế
  ├── MLOps cho dự báo: huấn luyện lại mô hình, phát hiện trôi dạt, giám sát
  └── Phương pháp đánh giá: quy tắc tính điểm đúng đắn, thực hành benchmark tốt nhất
```

### Trình tự Học tập Khuyến nghị cho Người Thực hành trong Ngành

1. **Tuần 1–2:** Tính dừng, ACF/PACF, phân rã, ARIMA (C1)
2. **Tuần 3–4:** ETS, Prophet, chỉ số đánh giá (C1-C2)
3. **Tuần 5–6:** Kỹ thuật đặc trưng, XGBoost/LightGBM cho TS (C2)
4. **Tuần 7–8:** LSTM, TCN, DeepAR (C3)
5. **Tuần 9–10:** N-BEATS, TFT, PatchTST (C3)
6. **Tuần 11–12:** Dự báo xác suất, conformal prediction (C4)
7. **Tuần 13–16:** Foundation models, dự báo phân cấp, triển khai sản xuất (C4-C5)

---

## 11. Câu hỏi mở & Khoảng trống nghiên cứu

### 11.1 Giới hạn tổng quát hóa của Foundation Model
**Câu hỏi:** Foundation models (TimesFM, Chronos) tổng quát hóa tốt đến mức nào cho chuỗi chuyên miền cao (sóng y tế, chuỗi thời gian ảnh vệ tinh, dữ liệu cảm biến công nghiệp)?
**Hiện trạng:** Benchmark tập trung vào chuỗi tương đối chuẩn (kinh tế, năng lượng, giao thông). Hiệu suất trên dữ liệu công nghiệp bất thường, tần số cao chưa được nghiên cứu đầy đủ.
**Hướng nghiên cứu:** Giao thức fine-tuning thích ứng miền; phương pháp thích ứng few-shot.
**Độ tin cậy: TRUNG BÌNH**

### 11.2 Dự báo ngữ cảnh dài
**Câu hỏi:** Liệu chúng ta có thể tận dụng hiệu quả ngữ cảnh lịch sử rất dài (>10.000 bước thời gian) cho dự báo mà không có độ phức tạp attention bậc hai?
**Hiện trạng:** Mamba đạt O(n) tuyến tính nhưng lợi thế benchmark còn khiêm tốn. Transformer attention thưa/tuyến tính tồn tại nhưng chưa giải quyết dứt điểm.
**Hướng nghiên cứu:** Mô hình không gian trạng thái phân cấp; kiến trúc đa phân giải; mạng tăng cường bộ nhớ.
**Độ tin cậy: CAO**

### 11.3 Dự báo nhân quả vs. Dựa trên tương quan
**Câu hỏi:** Khi nào nên sử dụng mô hình nhân quả thay vì dự báo thống kê dựa trên tương quan? Làm thế nào để vận hành dự báo chuỗi thời gian nhân quả trong sản xuất?
**Hiện trạng:** Nhân quả Granger là công cụ thực tiễn thống trị, nhưng chỉ nắm bắt nhân quả tuyến tính, có độ trễ. PCMCI+, DoWhy-TS, và mô hình nhân quả cấu trúc đang ở giai đoạn nghiên cứu.
**Hướng nghiên cứu:** Dự báo can thiệp (điều gì xảy ra nếu chạy khuyến mãi?); tạo kịch bản phản thực.
**Độ tin cậy: TRUNG BÌNH**

### 11.4 Chất lượng Benchmark đánh giá
**Câu hỏi:** Benchmark dự báo TS hiện tại (ETT, Exchange, ILI, Traffic) có đại diện cho độ khó thực tế không?
**Hiện trạng:** Bài báo DLinear cho thấy mô hình tuyến tính đơn giản thắng Transformers trên benchmark chuẩn, gợi ý benchmark có thể quá đơn giản hoặc có rò rỉ dữ liệu. Cộng đồng đang phát triển benchmark tốt hơn (Gift-Eval, Monash Archive, LOTSA).
**Hướng nghiên cứu:** Benchmark đa dạng, đa miền với tập kiểm tra giữ lại; đánh giá trên bài toán quy mô sản xuất.
**Độ tin cậy: CAO**

### 11.5 Dự báo đa phương thức + Ngữ cảnh
**Câu hỏi:** Làm thế nào để sử dụng đồng thời văn bản, hình ảnh, và kiến thức miền có cấu trúc với chuỗi thời gian số?
**Hiện trạng:** LLM cung cấp giao diện tự nhiên cho kết hợp đa phương thức. TIME-LLM, TEMPO, và Unified-TS khám phá điều này. Nhưng phương pháp đánh giá cho dự báo đa phương thức chưa trưởng thành.
**Hướng nghiên cứu:** Dự báo tăng cường truy xuất; dự báo có điều kiện sự kiện; tích hợp đồ thị tri thức với TS.
**Độ tin cậy: TRUNG BÌNH**

### 11.6 Khả năng diễn giải ở quy mô lớn
**Câu hỏi:** Liệu chúng ta có thể đạt khả năng diễn giải ngang TFT (tầm quan trọng đặc trưng dựa trên attention) cho các foundation model lớn?
**Hiện trạng:** TFT cung cấp khả năng diễn giải cho thiết lập quy mô vừa. Foundation models là hộp đen. Phương pháp post-hoc SHAP/LIME áp dụng được nhưng tốn kém về tính toán.
**Hướng nghiên cứu:** Diễn giải cơ chế cho TS Transformers; mô hình nút thắt khái niệm cho dự báo.
**Độ tin cậy: TRUNG BÌNH**

### 11.7 Chuỗi không dừng & Dịch chuyển phân phối
**Câu hỏi:** Mô hình dự báo nên xử lý thế nào với chuỗi có đứt gãy cấu trúc, trôi dạt khái niệm, và thay đổi chế độ?
**Hiện trạng:** Prophet xử lý điểm thay đổi tường minh. ADIDA/TSB xử lý nhu cầu gián đoạn. Phương pháp tốc độ học thích nghi tồn tại. Nhưng dịch chuyển phân phối đột ngột (hiệu ứng COVID-19 lên bán lẻ) vẫn là thách thức.
**Hướng nghiên cứu:** Học trực tuyến cho TS; meta-learning cho thích ứng nhanh; phát hiện điểm thay đổi trực tuyến Bayes tích hợp với dự báo.
**Độ tin cậy: CAO**

---

## 12. Đánh giá Độ tin cậy

| Phát hiện | Độ tin cậy | Nguồn bằng chứng |
|---------|-----------|----------------|
| ARIMA vẫn là baseline cạnh tranh cho đơn biến chân trời ngắn | CAO | Kết quả cuộc thi M4; Makridakis và cộng sự 2020 (IJF) |
| ETS là phương pháp đơn biến tự động tốt nhất cho dự báo doanh nghiệp | CAO | Kết quả cuộc thi M4, M3; Hyndman & Khandakar 2008 |
| N-BEATS vượt trội phương pháp cổ điển với đủ dữ liệu | CAO | Bài báo ICLR 2020; đánh giá M4 cho N-BEATS |
| PatchTST là Transformer tốt nhất hiện tại cho dự báo chân trời dài | CAO | Benchmark ICLR 2023 trên 8 tập dữ liệu |
| iTransformer đạt SOTA trên dự báo đa biến chiều cao | CAO | Benchmark ICLR 2024; 6+ tập dữ liệu |
| DLinear đôi khi vượt trội Transformers trên benchmark chuẩn | CAO | AAAI 2023; được tái tạo độc lập |
| TimesFM đạt hiệu suất zero-shot cạnh tranh | CAO | ICML 2024; 34 tập dữ liệu đánh giá |
| Chronos có hiệu suất zero-shot xác suất mạnh | CAO | TMLR 2024; 42 tập dữ liệu đánh giá; chỉ số CRPS |
| Moirai — mô hình đa năng hoạt động trên 9+ miền | CAO | ICML 2024; kho tiền huấn luyện LOTSA |
| LLM có thể dự báo chuỗi thời gian qua biểu diễn văn bản | TRUNG BÌNH | NeurIPS 2023 (LLM-Time); phạm vi tập dữ liệu hạn chế |
| Mô hình khuếch tán xuất sắc trong tạo kịch bản cho TS | TRUNG BÌNH | CSDI (NeurIPS 2021); ít trường hợp sản xuất được ghi nhận |
| Mamba cạnh tranh với Transformers cho TS | TRUNG BÌNH | Nhiều bài báo 2024; chưa quyết định so với PatchTST/iTransformer |
| Foundation models sẽ thay thế mô hình chuyên biệt cho cold-start | TRUNG BÌNH | Bằng chứng xu hướng từ TimesFM/Chronos; thay thế hoàn toàn chưa được chứng minh |
| Hòa hợp MinT là tối ưu cho dự báo phân cấp | CAO | Wickramasuriya và cộng sự 2019 (JASA); đã chứng minh lý thuyết và thực nghiệm |
| Conformal prediction cung cấp đảm bảo phủ không phụ thuộc phân phối | CAO | Chứng minh toán học (Vovk và cộng sự 2005); đã xác nhận thực nghiệm |
| LightGBM + kỹ thuật đặc trưng tốt nhất cho bán lẻ chân trời ngắn | CAO | Cuộc thi M5 2020; tất cả giải pháp hàng đầu đều gradient boosting |
| Benchmark TS chuẩn có thể đánh giá thấp mô hình đơn giản | CAO | AAAI 2023 DLinear; phân tích Gift-Eval 2024 |

---

## Nguồn & Tài liệu tham khảo

1. Box, G.E.P. & Jenkins, G.M. (1970/2015). *Time Series Analysis: Forecasting and Control.* Wiley.
2. Hyndman, R.J. và cộng sự (2008). *Forecasting with Exponential Smoothing.* Springer.
3. Hyndman, R.J. & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice, ấn bản thứ 3.* OTexts. https://otexts.com/fpp3/
4. Salinas, D. và cộng sự (2020). "DeepAR: Probabilistic Forecasting with Autoregressive Recurrent Networks." *IJF* 36(3). https://arxiv.org/abs/1704.04110
5. Oreshkin, B.N. và cộng sự (2020). "N-BEATS: Neural Basis Expansion Analysis." *ICLR 2020.* https://arxiv.org/abs/1905.10437
6. Lim, B. và cộng sự (2021). "Temporal Fusion Transformers." *IJF* 37(4). https://arxiv.org/abs/1912.09363
7. Taylor, S.J. & Letham, B. (2018). "Forecasting at Scale." *The American Statistician* 72(1). https://doi.org/10.1080/00031305.2017.1380080
8. Nie, Y. và cộng sự (2023). "A Time Series is Worth 64 Words." *ICLR 2023.* https://arxiv.org/abs/2211.14730
9. Zeng, A. và cộng sự (2023). "Are Transformers Effective for Time Series Forecasting?" *AAAI 2023.* https://arxiv.org/abs/2205.13504
10. Das, A. và cộng sự (2024). "A Decoder-Only Foundation Model for Time-Series Forecasting." *ICML 2024.* https://arxiv.org/abs/2310.10688
11. Ansari, A.F. và cộng sự (2024). "Chronos: Learning the Language of Time Series." *TMLR 2024.* https://arxiv.org/abs/2403.07815
12. Woo, G. và cộng sự (2024). "Unified Training of Universal Time Series Forecasting Transformers." *ICML 2024.* https://arxiv.org/abs/2402.02592
13. Liu, Y. và cộng sự (2024). "iTransformer: Inverted Transformers Are Effective for Time Series Forecasting." *ICLR 2024.* https://arxiv.org/abs/2310.06625
14. Gruver, N. và cộng sự (2023). "Large Language Models Are Zero-Shot Time Series Forecasters." *NeurIPS 2023.* https://arxiv.org/abs/2310.07820
15. Makridakis, S. và cộng sự (2020). "The M4 Competition: 100,000 time series and 61 forecasting methods." *IJF* 36(1). https://doi.org/10.1016/j.ijforecast.2019.04.014
16. Wickramasuriya, S.L. và cộng sự (2019). "Optimal Forecast Reconciliation." *JASA* 114(526). https://doi.org/10.1080/01621459.2018.1448825
17. Goyal, A. và cộng sự (2024). "MOMENT: A Family of Open Time-series Foundation Models." *ICML 2024.* https://arxiv.org/abs/2402.03885

---

*Báo cáo Nghiên cứu: B01 — Forecasting & Time Series (Dự báo & Chuỗi thời gian)*
*Dr. Archon (R-α) — Nền tảng Đồ thị Tri thức MAESTRO*
*Tạo ngày: 2026-03-30 | Phiên bản: 1.0 | Trạng thái: CẦN ĐÁNH GIÁ*
