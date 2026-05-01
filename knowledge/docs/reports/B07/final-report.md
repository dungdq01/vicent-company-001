# Bao cao Tong hop: Anomaly Detection & Monitoring (B07)
## Boi Ms. Scribe (R-sigma) — Ngay: 2026-03-31

---

## Tom tat Dieu hanh

B07 Anomaly Detection & Monitoring dat **7.3/10** — Verdict: **CONDITIONAL GO**. Day la linh vuc ky thuat da truong thanh voi thu vien ma nguon mo manh (PyOD 40+ thuat toan, Alibi Detect, River), nhu cau thi truong Viet Nam rat lon (ngan hang mat $200M+/nam vi gian lan, 8,000+ nha may can giam sat chat luong). Dieu kien GO la: (1) tim duoc 2-3 ngan hang trung binh lam pilot trong Q2 2026, (2) bat dau bang kien truc batch-first thay vi streaming de giam chi phi va do phuc tap, (3) xay dung bo du lieu bat thuong (anomaly dataset) dac thu Viet Nam tu khach hang pilot — day la rao can ky thuat lon nhat, khong phai thuat toan. Loi the canh tranh nam o ban dia hoa: canh bao tieng Viet, mo hinh cho VietQR fraud, trien khai on-premise dap ung yeu cau luu tru du lieu theo Thong tu 13/2023/TT-NHNN.

---

## Phan 1: Tong hop Nghien cuu (R-alpha)

### 1.1 Phan loai linh vuc

Anomaly Detection & Monitoring nam o giao diem cua **Statistical Learning** (Hoc thong ke), **Machine Learning** (Hoc may), va **Signal Processing** (Xu ly tin hieu). Thuoc nhanh Unsupervised/Semi-supervised Learning (Hoc khong giam sat / ban giam sat) trong AI.

**8 sub-fields (linh vuc con):**

| # | Sub-field | Mo ta |
|---|-----------|-------|
| 1 | Point Anomaly Detection | Phat hien diem du lieu don le bat thuong so voi toan bo tap du lieu |
| 2 | Contextual Anomaly Detection | Phat hien bat thuong phu thuoc ngu canh (thoi gian, vi tri) |
| 3 | Collective Anomaly Detection | Nhom diem du lieu bat thuong khi xet cung nhau, du tung diem rieng le binh thuong |
| 4 | Time-Series Anomaly Detection | Bat thuong trong chuoi thoi gian — dot bien, sai lech mua vu |
| 5 | Streaming Anomaly Detection | Phat hien thoi gian thuc tren luong du lieu lien tuc, xu ly concept drift |
| 6 | Graph Anomaly Detection | Bat thuong tren cau truc do thi / mang luoi |
| 7 | Image/Video Anomaly Detection | Phat hien loi san pham, su kien bat thuong qua hinh anh |
| 8 | Log & Event Anomaly Detection | Phan tich log he thong tim mau bat thuong |

**Linh vuc lien quan:** Outlier Analysis (Thong ke), Fault Detection & Diagnostics (Ky thuat), Intrusion Detection Systems (An ninh mang), Novelty Detection, Out-of-Distribution Detection, Change Point Detection, Statistical Process Control (San xuat).

### 1.2 Cac khai niem cot loi (8 concepts)

| # | Khai niem | Mo ta | Do kho |
|---|-----------|-------|--------|
| 1 | Point Anomaly | Diem du lieu don le lech khoi phan phoi chung. Vd: giao dich $50,000 khi binh thuong <$200 | Co ban |
| 2 | Contextual Anomaly | Bat thuong chi trong ngu canh cu the. Vd: nhiet do 35°C binh thuong vao he nhung bat thuong vao dong | Trung binh |
| 3 | Collective Anomaly | Nhom diem bat thuong khi xet chung, du rieng le binh thuong. Vd: tan cong DDoS — tung goi tin binh thuong nhung hang ngan goi cung luc thi bat thuong | Trung binh-Nang cao |
| 4 | Isolation Forest Principle | Nguyen ly co lap: bat thuong thi "it va khac biet", can it buoc chia de co lap. Dao nguoc tu duy tu "mo hinh binh thuong" sang "truc tiep co lap bat thuong" | Trung binh |
| 5 | Autoencoder Reconstruction Error | Mang neural hoc nen va giai nen du lieu binh thuong. Du lieu bat thuong cho sai so tai tao cao vi khong khop mau da hoc | Trung binh-Nang cao |
| 6 | Time-Series Anomaly Detection | Xu ly autocorrelation, trend, seasonality. Phuong phap chinh: model-residual (ARIMA/Prophet) + deep learning (LSTM-AE, Anomaly Transformer) | Trung binh-Nang cao |
| 7 | Streaming Anomaly Detection | Phat hien tren luong du lieu vo han voi bo nho gioi han, don pass. Thach thuc chinh: phan biet anomaly vs novelty vs concept drift | Nang cao |
| 8 | Multivariate Anomaly Detection | Bat thuong chi lo khi xet nhieu bien dong thoi. Vd: CPU cao + network I/O thap + disk I/O cao = malware, du tung chi so rieng le binh thuong | Nang cao |

### 1.3 Thuat toan chinh (9 algorithms)

| # | Thuat toan | Loai | Tot nhat cho | Do truong thanh |
|---|------------|------|-------------|-----------------|
| 1 | **Isolation Forest** | Isolation-based, Ensemble | Tabular tong quat, du lieu lon | Cao — scikit-learn, Spark, H2O |
| 2 | **One-Class SVM** | Kernel-based | Du lieu nho-vua, lop binh thuong ro rang | Cao — phuong phap kinh dien |
| 3 | **Local Outlier Factor (LOF)** | Density-based | Du lieu co cum mat do khac nhau | Cao — 5,500+ citations |
| 4 | **DBSCAN/HDBSCAN** | Density clustering | Du lieu khong gian, cum hinh dang bat ky | Cao — KDD Test of Time Award |
| 5 | **Autoencoder** | Reconstruction, Deep Learning | Du lieu chieu cao (anh, sensor, chuoi thoi gian) | Cao — dung rong rai trong cong nghiep |
| 6 | **VAE** | Probabilistic, Deep Generative | Can diem bat thuong xac suat, phan phoi phuc tap | Cao — nghien cuu tich cuc 2014-nay |
| 7 | **Anomaly Transformer** | Attention-based | Chuoi thoi gian dai, mau thoi gian phuc tap | Trung binh — moi (2022-2025) |
| 8 | **ARIMA/Prophet Residuals** | Statistical/Decomposition | Chuoi thoi gian don bien, chi so kinh doanh | Rat cao — hang chuc nam su dung |
| 9 | **ADWIN + Half-Space Trees** | Streaming, Adaptive | Giam sat thoi gian thuc, IoT, concept drift | Trung binh-Cao |

**Luu y quan trong tu R-gamma:** Trong thuc te san xuat, phuong phap unsupervised thuan tuy thuong cho 30-50% false positive (FP). Cac he thong thanh cong (Stripe Radar, PayPal) deu dung semi-supervised voi du lieu bat thuong da gan nhan. Viet Nam thieu du lieu gan nhan — day la van de lon nhat, khong phai lua chon thuat toan.

### 1.4 Bai bao quan trong

| # | Bai bao | Nam | Dong gop chinh | Citations |
|---|---------|-----|-----------------|-----------|
| 1 | LOF (Breunig et al.) | 2000 | Dua ra khai niem outlier cuc bo — bat thuong la tuong doi, khong tuyet doi | 5,500+ |
| 2 | Isolation Forest (Liu et al.) | 2008 | Nguyen ly co lap — chuyen doi tu duy sang truc tiep co lap bat thuong | 5,000+ |
| 3 | One-Class SVM (Scholkopf et al.) | 2001 | Hoc mat phang sieu vien tren kernel space de tach binh thuong vs bat thuong | 8,000+ |
| 4 | Deep SVDD (Ruff et al.) | 2018 | Ket hop deep learning + one-class — anh xa binh thuong vao hypersphere | 2,500+ |
| 5 | Anomaly Transformer (Xu et al.) | 2022 | Association discrepancy — diem binh thuong co attention manh, bat thuong thi yeu | 800+ |
| 6 | TimesNet (Wu et al.) | 2023 | Chuyen chuoi 1D thanh 2D theo chu ky, 1 kien truc cho 5 task ke ca anomaly | 1,200+ |
| 7 | Unifying Review (Ruff et al.) | 2021 | Khung ly thuyet thong nhat shallow va deep anomaly detection | 1,500+ |
| 8 | USAD (Audibert et al.) | 2020 | Adversarial autoencoder 2 pha — khuech dai sai so tai tao cho bat thuong | 600+ |

### 1.5 Dong thoi gian phat trien

| Giai doan | Nam | Su kien | Y nghia |
|-----------|-----|---------|---------|
| Statistical Process Control | 1920s-1930s | Shewhart control charts tai Bell Labs | Khung giam sat quy trinh dau tien |
| Classical Outlier Tests | 1950s-1960s | Grubbs' test, Dixon's Q-test | Kiem dinh bat thuong bang thong ke gia thuyet |
| Robust Statistics | 1960s-1980s | Tukey boxplot, Huber M-estimators | Uoc luong ben vung truoc nhiem bat thuong |
| Distance & Density | 1998-2002 | LOF, k-NN outlier | Outlier cuc bo va tuong doi |
| Kernel & Subspace | 2001-2006 | One-Class SVM | Ranh gioi phi tuyen trong khong gian kernel |
| Isolation Principle | 2008-2012 | Isolation Forest | Dao chinh paradigm — co lap thay vi mo hinh |
| Deep Learning I | 2014-2018 | VAE-AD, Deep SVDD, LSTM-AE | Deep learning cho du lieu phuc tap |
| Streaming & Scale | 2011-2018 | HS-Trees, xStream, RRCF | Thoi gian thuc, bo nho gioi han |
| Deep Learning II | 2020-2023 | USAD, Anomaly Transformer, TimesNet | Attention-based scoring, long-range dependencies |
| Foundation Models | 2023-2026 | LLM log detection, TimesFM, Chronos | Zero-shot reasoning, multi-modal, thong nhat |

---

## Phan 2: Kien truc Ky thuat (R-beta)

### 2.1 Kien truc tham chieu

R-beta de xuat kien truc **Hybrid** (Ket hop): batch train + stream infer. Ba pattern chinh:

| Pattern | Do tre | Throughput | Do phuc tap | Phu hop cho |
|---------|--------|------------|-------------|-------------|
| **Batch** | Phut-Gio | Rat cao | Thap | Phan tich lich su, bao cao, retrain model |
| **Streaming** | Ms-Giay | Cao | Cao | Fraud detection, sensor monitoring, security |
| **Hybrid** | Ca hai | Ca hai | Trung binh-Cao | Hau het he thong production |

**Dieu chinh tu R-gamma (quan trong):** Kien truc Hybrid voi Kafka + Flink la qua phuc tap cho giai doan dau tai Viet Nam. 70% use cases chi can batch (hourly/daily) voi 20% chi phi. **Khuyen nghi: Batch-first Phase 1, Streaming Phase 2 khi khach hang yeu cau <1 giay latency.**

### 2.2 Cong nghe de xuat

**Phase 1 — Batch-first (khuyen nghi bat dau):**

| Layer | Cong cu | Chi phi | Ghi chu |
|-------|---------|---------|---------|
| Database | PostgreSQL | Mien phi | Du cho batch processing |
| ML Library | PyOD (40+ algorithms) | Mien phi | POC va baseline |
| Production ML | Alibi Detect | Mien phi | Drift detection tich hop |
| Deep Learning | PyTorch | Mien phi | Autoencoder, VAE |
| Experiment Tracking | MLflow | Mien phi | Model registry, versioning |
| Dashboard | Grafana | Mien phi | Anomaly dashboards |
| API | FastAPI | Mien phi | Scoring service |
| Explainability | SHAP / LIME | Mien phi | BAT BUOC cho banking (xem 2.2.1) |

**Chi phi ha tang Phase 1:** $500-1,500/thang (cloud). Phu hop voi ngan sach SMB.

**Phase 2 — Streaming add-on (khi can):**

| Layer | Cong cu | Chi phi | Ghi chu |
|-------|---------|---------|---------|
| Message Broker | Apache Kafka | Mien phi (OSS) hoac Confluent Cloud | Event streaming |
| Stream Processing | Apache Flink | Mien phi | Real-time feature engineering |
| CDC | Debezium | Mien phi | Bat thay doi database |
| Feature Store | Feast | Mien phi | Online/offline serving |
| Model Serving | Triton / BentoML | Mien phi | GPU inference |
| Cache | Redis | Mien phi | Anomaly scores, features |
| Alerting | PagerDuty / Alertmanager | Co phi | Incident routing |

**Chi phi ha tang Phase 2:** $3,000-8,000/thang cho 10M events/ngay.

**2.2.1 Explainability (Giai thich duoc) — Yeu cau bat buoc:**

R-gamma chi ra mot thieu sot quan trong: ca R-alpha va R-beta deu khong de cap explainability. Doi voi ngan hang Viet Nam, SBV yeu cau quyet dinh phat hien gian lan phai giai thich duoc cho kiem toan vien. **Giai phap:** Tich hop SHAP tu ngay dau. Uu tien Isolation Forest + SHAP hon deep learning cho vertical ngan hang.

### 2.3 Pipeline xu ly

**Pipeline chinh 6 giai doan:**

```
Ingest → Feature Engineering → Model Training → Scoring → Threshold & Alert → Feedback Loop
```

| Giai doan | Dau vao | Dau ra | Cong cu | Luu y |
|-----------|---------|--------|---------|-------|
| 1. Thu thap | Sensor, logs, giao dich, metrics | Event stream + data lake | Kafka, Debezium (Phase 2); PostgreSQL (Phase 1) | Schema registry Avro/Protobuf |
| 2. Feature | Raw events | Feature vectors (online + offline) | Feast, tsfresh, Flink | Rolling stats, rate-of-change, lag features |
| 3. Training | Historical features + optional labels | Model artifacts | PyOD, PyTorch, MLflow | Unsupervised: train tren du lieu binh thuong; Retrain weekly-daily |
| 4. Scoring | Feature vectors moi | Anomaly score (0.0-1.0) + label + confidence | Triton/BentoML, Redis | Latency: <50ms (fraud), <500ms (sensor), <5min (batch) |
| 5. Threshold | Anomaly scores | Alerts | Custom engine, Alertmanager | 3 cap: Warning (0.85) → Critical (0.95) → Emergency (0.99) |
| 6. Feedback | Phan hoi nguoi dung (true/false positive) | Du lieu training cap nhat, threshold recalibrated | Label Studio, custom API, MLflow | **QUAN TRONG NHAT** cho chat luong dai han |

**Feedback Loop (Giai doan 6) — Can thiet ke chi tiet hon:**

R-gamma chi ra Feedback Loop bi under-specified. Can bo sung:
- UI gan nhan tich hop trong alert dashboard
- Phan biet "khong bat thuong" vs "bat thuong nhung khong can hanh dong"
- Trigger retrain khi du so luong nhan moi
- Ngan sach 30% effort ky thuat cho model maintenance

### 2.4 Vi du minh hoa

**Vi du 1 — Quick Start: Phat hien gian lan the tin dung bang Isolation Forest (30 phut)**

Su dung PyOD voi Kaggle Credit Card Fraud dataset (284,807 giao dich, 0.17% fraud). Buoc: load data → scale features → train Isolation Forest (200 trees, contamination=0.002) → score → danh gia. Ket qua: ROC-AUC ~0.93-0.95 ma khong can nhan nao trong training. Luu y: unsupervised chi la buoc sang loc ban dau, can tinh chinh threshold voi nhan tu pilot.

**Vi du 2 — Production: Giam sat bat thuong sensor thoi gian thuc voi Autoencoder + Kafka (4 gio)**

50 IoT sensors tren day chuyen san xuat, emit moi 1 giay. Kien truc: Sensors → Kafka → Flink → Feature Window (30s rolling) → PyTorch Autoencoder → Redis → Slack Alert. Phat hien trong <2 giay, recall >95% tren cac failure mode da biet, false positive <1% sau calibration.

**Model Selection Decision Tree:**
- Co nhan (>1000)? → Supervised: XGBoost/LightGBM
- Nhan it (<1000)? → Semi-supervised: Deep SAD / DevNet
- Khong nhan + Tabular? → Isolation Forest (scale tot den >1M rows)
- Khong nhan + Time series? → Univariate: ARIMA/Prophet; Multivariate: Autoencoder/USAD; Streaming: ADWIN + HS-Trees
- Khong nhan + Image? → Conv Autoencoder / f-AnoGAN

---

## Phan 3: Danh gia Kha thi (R-gamma)

### 3.1 Ket luan

**CONDITIONAL GO** — Linh vuc ky thuat da truong thanh, nhu cau cao, tooling ma nguon mo tot. Dieu kien: (a) can du lieu bat thuong da gan nhan dac thu Viet Nam — chua co san o quy mo lon, (b) nhan luc streaming (Kafka/Flink) khan hiem tai Viet Nam (<200 ky su senior ca nuoc).

### 3.2 Bang diem kha thi

| Tieu chi | Diem (1-10) | Ly do |
|----------|-------------|-------|
| **Kha thi Ky thuat** | 8 | Thuat toan truong thanh (Isolation Forest, Autoencoder, Transformer). Thu vien production-grade (PyOD, Alibi Detect, River). Kien truc hybrid da duoc Netflix, Uber chung minh. Tru diem: do phuc tap streaming pipeline va model drift. |
| **Nhu cau Thi truong** | 9 | Ngan hang VN mat $200M+/nam vi gian lan. 8,000+ nha may can quality control. E-commerce 2.5 ty buu kien/nam. SBV yeu cau AI fraud detection truoc 2027. Thi truong anomaly detection toan cau $7.1B (2028). |
| **Du lieu San co** | 6 | Benchmark cong khai ton tai (KDD Cup, Credit Card Fraud, NAB, SWaT). Nhung du lieu gan nhan dac thu VN cuc ky hiem. Ngan hang giu du lieu rieng. Sensor nha may ket trong SCADA/PLC legacy. Can 3-6 thang hop tac pilot de xay dataset. |
| **Rui ro Trien khai** | 6 | Alert fatigue (30-50% FP cho unsupervised), streaming infra phuc tap, cold-start cho khach hang moi, feedback loop thuong bi danh gia thap. |
| **Tong** | **7.3** | Trong so: Ky thuat 25%, Thi truong 30%, Du lieu 25%, Rui ro 20%. Nhu cau manh bu dap cho thieu hut du lieu. |

### 3.3 Canh quan canh tranh

| Doi thu | Loai | The manh | Diem yeu | Gia |
|---------|------|----------|----------|-----|
| **Datadog** | SaaS (My) | Tich hop observability 750+ integrations | Chi IT/DevOps, khong business domain; dat; khong data residency VN | $23-34/host/thang, enterprise >$50K/thang |
| **AWS Lookout** | Cloud (My) | Native AWS, root cause tu dong | AWS lock-in; >=5 phut granularity; du lieu mua vu kem | $0.75/1K metrics, $500-5K/thang |
| **Azure Anomaly Detector** | API (My) | REST API don gian, multivariate | Microsoft lock-in; chi time-series; 300 bien max | $0.157/1K data points |
| **Anodot** | SaaS (Israel) | Chuyen business metrics, correlation engine | Dat cho SMB; chi structured metrics; ecosystem SEA nho | $50K-200K/nam |
| **Splunk ITSI** | On-prem/Cloud | Log/event manh, SIEM, ML Toolkit | Cuc dat; phuc tap; nang | $1,800/GB/nam, enterprise $100K-500K+ |
| **Alibaba Cloud SLS** | Cloud (Trung Quoc) | Gia canh tranh, manh o SEA | Lo ngai data sovereignty; ML chua bang AWS/Azure | ~60% re hon Datadog |

**Co hoi cua chung ta:** Khong doi thu nao cung cap nen tang phat hien bat thuong ban dia hoa Viet Nam ket hop: (1) canh bao va dashboard tieng Viet, (2) mo hinh san cho nganh VN (VietQR fraud, defect profiles, Tet seasonality), (3) trien khai on-premise dap ung Thong tu 13/2023/TT-NHNN, (4) gia phu hop SMB VN ($500-2,000/thang).

### 3.4 Rui ro chinh

| # | Rui ro | Xac suat | Tac dong | Giam thieu |
|---|--------|----------|----------|------------|
| 1 | **Alert fatigue / FP cao** — 30-50% false positive khien operator bo qua moi alert | 70% | Cao | Threshold 3 cap (warning/critical/emergency). Uu tien semi-supervised. Muc tieu <10% FP truoc khi production. |
| 2 | **Cold-start** — Khach hang moi khong du du lieu lich su | 80% | Trung binh | Transfer learning theo nganh. Rule-based lam cau noi 2-4 tuan dau. Pre-train tren du lieu cong khai/tong hop. |
| 3 | **Thieu nhan luc streaming** — <200 ky su Kafka/Flink senior o VN | 50% | Cao | Phase 1 chi batch. Xem xet Confluent Cloud (managed). Tuyen som 2 ky su streaming cho Phase 2. |
| 4 | **Concept drift** — Phan phoi du lieu thay doi (fraud patterns moi, mua vu) lam model suy giam | 75% | Cao | Drift detection (Alibi Detect). Retrain tu dong trong 24h khi phat hien drift. Ngan sach 30% effort cho maintenance. |
| 5 | **Phap ly & bao mat du lieu** — SBV, PDPD 13/2023, han che chuyen du lieu xuyen bien gioi | 40% | Cuc ky cao | On-premise va private cloud tu ngay dau. Anonymization trong feature engineering. Tu van phap ly fintech VN. Chung chi PCI-DSS. |
| 6 | **Ky vong khach hang** — Khach muon "cam la chay" nhung thuc te can tuan cau hinh | 65% | Trung binh | Onboarding 4-6 tuan ro rang. Template theo nganh giam xuong 1-2 tuan. Professional services trong hop dong. |

### 3.5 Thi truong Viet Nam

**Ai can?**
- **Ngan hang & Fintech (Uu tien 1):** 47 ngan hang thuong mai + ~80 fintech. Gian lan >$200M/nam, tang 25%/nam. VietQR 180M+ giao dich/thang tao vector gian lan moi. Ra quyet dinh: CTO, CISO, Head of Risk.
- **San xuat (Uu tien 2):** 8,000+ nha may (Samsung, Foxconn, cong ty noi dia). Giam ty le loi 15-30%. Downtime ngoai ke hoach mat $50K-500K/su co.
- **E-commerce & Logistics (Uu tien 3):** 2.5 ty+ buu kien/nam. Can cho: du doan giao hang, bat thuong gia, review gia, ton kho.
- **Vien thong:** Viettel, VNPT, Mobifone — network anomaly, fraud SIM swap.

**San sang chi tra:**
- Ngan hang VN: $20K-100K/nam (SaaS); $200K-500K (on-premise + consulting)
- Nha may FDI lon: $50K-200K/nam
- SMB san xuat VN: $500-2,000/thang (can chung minh ROI trong 3 thang)
- E-commerce: $10K-50K/nam moi use case

**Quy mo thi truong:** TAM Viet Nam $80-120M (2027), tang 28% CAGR. SEA: $400-600M (2027). Hien tai under-served — da so doanh nghiep VN dung rule-based hoac giam sat thu cong.

**Thoi diem:** Toi uu. SBV yeu cau AI fraud detection truoc 2027. So hoa nha may tang toc hau COVID. Nhung cua so dang thu hep — Datadog va AWS tang ban hang SEA (AWS mo van phong TPHCM 2024).

---

## Phan 4: Dong gop tu Chuyen gia Thuc hanh

### 4.1 Data Engineering

- **Thu thap du lieu:** Pha 1 dung PostgreSQL + batch ingestion (cron). Pha 2 them Kafka + Debezium (CDC) khi can real-time. Schema registry (Avro/Protobuf) tu ngay dau de dam bao tuong thich phien ban.
- **Feature Store:** Feast cho online/offline serving. Dac biet quan trong khi nhieu model chia se features.
- **Data quality:** Du lieu sensor nha may VN thuong ket trong SCADA/PLC legacy — can middleware OPC-UA Gateway. Du lieu ngan hang sach hon nhung phan manh giua core banking systems.
- **Retention policy:** Giu raw data 90 ngay, features 1 nam, anomaly scores vinh vien (cho audit).

### 4.2 ML Engineering

- **Bat dau bang PyOD:** 40+ thuat toan, API thong nhat, tot cho POC va baseline. Isolation Forest la default cho tabular.
- **Production chuyen sang Alibi Detect:** Tich hop drift detection, production-grade.
- **Semi-supervised la muc tieu:** Unsupervised chi la buoc dau. Thu thap nhan tu pilot de chuyen sang semi-supervised (threshold calibration) va supervised (XGBoost) khi du nhan.
- **Model registry:** MLflow cho experiment tracking, model versioning, A/B testing.
- **Retrain tu dong:** Weekly (domain on dinh) den daily (domain thay doi nhanh). Trigger boi drift detection hoac so luong nhan moi dat nguong.

### 4.3 Deep Learning

- **Autoencoder:** Workhorse cho multivariate time-series (sensor, metrics). Kien truc: input → 64 → 32 → latent (8) → 32 → 64 → output. BatchNorm giua cac lop.
- **VAE:** Khi can diem anomaly xac suat. 3 loai score: reconstruction probability, ELBO, KL divergence latent.
- **Anomaly Transformer:** SOTA tren benchmarks, nhung phuc tap (minimax training). Dung cho use cases lon voi du du lieu.
- **Luu y:** Deep learning khong nen la lua chon dau tien cho ngan hang VN vi thieu explainability. Dung Isolation Forest + SHAP truoc.
- **Model quantization:** INT8 cho Autoencoder → 2-4x nhanh hon inference.

### 4.4 DevOps & Deployment

- **Inference serving:** BentoML cho don gian, Triton cho GPU-accelerated high-throughput.
- **Latency targets:** <50ms (fraud), <500ms (sensor), <5min (batch).
- **Throughput benchmarks:**
  - Isolation Forest: ~50,000 events/giay (CPU)
  - Autoencoder nho: ~20,000 CPU, ~200,000 GPU
  - Anomaly Transformer: ~2,000 CPU, ~50,000 GPU
- **Monitoring stack:** Prometheus → Grafana → Alertmanager → Slack/PagerDuty. Push anomaly scores lam custom Prometheus metrics.
- **Multi-tenant:** De phuc vu SMB VN o $500-2K/thang, can shared infrastructure: Kafka cluster chung, model isolation theo tenant, Grafana row-level security.

### 4.5 Bao mat

- **Data residency:** On-premise va private cloud tu ngay dau cho ngan hang (Thong tu 13/2023/TT-NHNN).
- **Anonymization:** Thuc hien trong feature engineering pipeline, TRUOC khi du lieu vao model.
- **PCI-DSS:** Can thiet cho use case thanh toan gian lan.
- **PDPD 13/2023:** Nghi dinh Bao ve Du lieu Ca nhan — ap dung cho moi du lieu khach hang.
- **Access control:** RBAC tren Grafana dashboards, API keys cho scoring endpoints, audit log cho moi truy van.

### 4.6 Tai chinh (Fraud Detection)

- **Beachhead vertical:** Ngan hang gian lan la diem khoi dau tot nhat — WTP cao nhat, ROI ro rang ($200M+ losses/nam), tailwind phap ly (SBV mandates).
- **VietQR fraud patterns:** 180M+ giao dich/thang, vector gian lan moi chua co trong mo hinh quoc te. Co hoi tao moat.
- **Mo hinh:** Isolation Forest + SHAP (explainable) → semi-supervised khi co nhan → XGBoost supervised khi du nhan.
- **Threshold:** Dynamic 3 cap, adaptive theo gio/ngay/mua (Tet surge).
- **Target pilot:** 2-3 ngan hang trung binh Q2 2026.

### 4.7 San xuat (Predictive Maintenance)

- **Use case:** 50 IoT sensors/day chuyen, detect bat thuong trong <5 giay de ngan downtime ngoai ke hoach ($50K-500K/su co).
- **Mo hinh:** Autoencoder cho multivariate sensor data (nhiet do, rung dong, ap suat, RPM, dien nang). Train tren du lieu "binh thuong" 30 ngay.
- **Threshold:** 3-sigma rule lam baseline, dynamic adaptive theo mua/ngay-dem/cuoi tuan.
- **Tich hop:** OPC-UA Gateway → Kafka → Anomaly Pipeline → MES Alert API → Work order trigger.
- **Luu y:** Training data PHAI sach (khong chua anomaly), neu khong baseline bi nhiem.

---

## Phan 5: Khuyen nghi Tong hop

### Verdict: CONDITIONAL GO

**Ly do GO:**
1. **Nhu cau thi truong cuc lon** (9/10): $200M+ ton that gian lan/nam, 8,000+ nha may, SBV mandate 2027. TAM $80-120M tai VN.
2. **Ky thuat da truong thanh** (8/10): Open-source stack (PyOD + Alibi Detect + MLflow + Grafana) bao phu 90% use cases. Khong can license dat.
3. **Khoang trong canh tranh ro rang:** Khong doi thu nao ban dia hoa VN (tieng Viet, VietQR patterns, on-premise, gia SMB).

**Dieu kien GO:**
1. **Pilot truoc khi build full:** Ky 2-3 ngan hang trung binh lam pilot Q2 2026. Khong build nen tang day du khi chua co khach hang thuc te.
2. **Batch-first:** Bat dau voi PostgreSQL + PyOD + MLflow + Grafana ($500-1,500/thang). Streaming chi khi khach hang yeu cau <1 giay latency.
3. **Xay du lieu VN:** Hop tac pilot tao anonymized, labeled anomaly dataset cho 3 nganh (ngan hang, san xuat, e-commerce). Day la competitive moat — khong doi thu quoc te nao dau tu vao training data dac thu VN.
4. **Explainability tu ngay 1:** SHAP cho moi anomaly score. Bat buoc cho ngan hang.
5. **Multi-tenant SaaS:** Thiet ke tu dau de phuc vu SMB VN co loi o $500-2K/thang.
6. **Tuyen 2 streaming engineers som:** Du Phase 1 la batch, Kafka/Flink talent mat 3-6 thang de recruit. Bat dau tuyen cho Phase 2 (Q4 2026).
7. **Hop tac system integrators:** FPT Software, CMC, Viettel Solutions co quan he san voi ngan hang va nha may. Channel partner model tang toc market access.

---

## Phan 6: Quality Checklist

- [x] Tom tat dieu hanh co verdict ro rang (CONDITIONAL GO) va dieu kien cu the
- [x] Phan loai linh vuc day du: 8 sub-fields, 7 related fields
- [x] >= 8 khai niem cot loi (8 concepts voi do kho va vi du)
- [x] >= 8 thuat toan chinh (9 algorithms voi maturity va best-for)
- [x] >= 5 bai bao quan trong (8 papers voi citations va dong gop)
- [x] Dong thoi gian phat trien (10 era tu 1920s den 2026)
- [x] Kien truc tham chieu voi so sanh patterns
- [x] Tech stack day du voi chi phi va alternatives
- [x] Pipeline 6 giai doan chi tiet
- [x] Vi du minh hoa (quick start + production)
- [x] Bang diem kha thi co trong so va ly do
- [x] Canh quan canh tranh >= 5 doi thu voi gia
- [x] Rui ro >= 5 voi xac suat, tac dong, giam thieu
- [x] Thi truong VN: segments, WTP, TAM, timing
- [x] Dong gop chuyen gia thuc hanh >= 7 linh vuc
- [x] Khuyen nghi tong hop co GO/NO-GO va dieu kien
- [x] Toan bo tieng Viet (non-diacritical), thuat ngu ky thuat giu English
- [x] Tong hop — khong copy-paste, ke cau chuyen mach lac
- [x] Phan hoi challenges cua R-gamma duoc tich hop (explainability, batch-first, feedback loop, chi phi)

---

## Phan 7: Cau hoi Mo

1. **Du lieu gan nhan:** Lam sao thu thap du labeled anomaly data tu ngan hang VN khi ho e ngai chia se? Can khung phap ly va ky thuat anonymization nao?

2. **Explainability vs Accuracy trade-off:** Isolation Forest + SHAP de giai thich nhung do chinh xac thap hon deep learning. Muc do giai thich nao la "du" cho SBV audit?

3. **Multi-tenant vs On-premise:** Ngan hang lon muon on-premise, SMB muon SaaS re. Lam sao duy tri 1 codebase cho ca 2 mo hinh trien khai?

4. **Feedback loop design:** Chua co thiet ke chi tiet. Can prototype UI gan nhan tich hop trong alert dashboard — ai la nguoi gan nhan? Analyst hay operator?

5. **Transfer learning across verticals:** Mo hinh fraud detection ngan hang co the chuyen giao cho fintech/e-commerce khong? Muc do nao?

6. **Competitive response:** Khi Datadog/AWS tang cuong ban hang SEA, strategy phong thu la gi ngoai ban dia hoa?

7. **Thoi gian den doanh thu:** Voi batch-first approach, thoi gian tu pilot den doanh thu thuc te la bao lau? Du kien 6-9 thang hay lau hon?

---

*Bao cao tong hop boi Ms. Scribe (R-sigma), Chief Knowledge Officer, MAESTRO Platform.*
*Tong hop tu: R-alpha (Dr. Archon — Research), R-beta (Dr. Praxis — Technical), R-gamma (Dr. Sentinel — Feasibility).*
