# AI Capability Taxonomy — MAESTRO Knowledge Graph Platform

**Version:** 1.0  
**Date:** 2026-03-31  
**Authority:** Project Manager (Cascade)  
**Status:** SSOT for baseline classification and tier grouping

> Đây là tài liệu phân loại chính thức 15 AI Baselines (Năng lực AI) của MAESTRO.  
> Mọi agent phải sử dụng IDs và tên theo đúng registry này (xem thêm `docs/CONVENTIONS.md §5`).

---

## Tổng quan: 4 Tiers of AI Capability

```
TIER 1 — ANALYTICAL AI        (Dữ liệu có cấu trúc → Dự báo / Phát hiện)
TIER 2 — PERCEPTIVE AI        (Dữ liệu phi cấu trúc → Hiểu / Nhận dạng)
TIER 3 — GENERATIVE AI        (Nội dung + Tối ưu → Tạo ra / Đề xuất)
TIER 4 — AGENTIC AI           (Hành động tự động → Điều phối / Mô phỏng)
```

---

## TIER 1 — ANALYTICAL AI
> **Định nghĩa:** Phân tích dữ liệu có cấu trúc (bảng, chuỗi thời gian) để đưa ra dự báo số, phát hiện bất thường, hoặc phân loại.

| ID | Canonical Name | Short Name | Maturity | Vietnam Priority |
|----|---------------|------------|----------|-----------------|
| **B01** | Forecasting & Time Series | Forecasting | Mature (TRL 8-9) | 🔴 Rất cao |
| **B07** | Anomaly Detection & Monitoring | Anomaly Detection | Mature (TRL 8) | 🔴 Rất cao |
| **B13** | Tabular ML & Predictive Analytics | Tabular ML | Mature (TRL 9) | 🔴 Rất cao |

**Đặc điểm chung:**
- Input: dữ liệu bảng, time series, sensor data
- Output: số dự báo, nhãn phân loại, điểm rủi ro
- Yêu cầu: dữ liệu lịch sử đủ lớn (tối thiểu 1-2 năm)
- Thời gian POC: 4-8 tuần
- ROI: rõ ràng, đo lường được

**Cross-links:** B01 ↔ B07 (detect anomalies in forecasted metrics), B07 ↔ B13 (tabular features for anomaly scoring)

---

## TIER 2 — PERCEPTIVE AI
> **Định nghĩa:** Xử lý và hiểu dữ liệu phi cấu trúc (văn bản, hình ảnh, âm thanh, tài liệu) để trích xuất thông tin có cấu trúc.

| ID | Canonical Name | Short Name | Maturity | Vietnam Priority |
|----|---------------|------------|----------|-----------------|
| **B02** | Document Intelligence | Doc Intelligence | Mature (TRL 8) | 🔴 Rất cao |
| **B03** | Computer Vision | Computer Vision | Mature (TRL 8) | 🟠 Cao |
| **B04** | NLP & Language AI | NLP | Mature (TRL 9) | 🔴 Rất cao |
| **B14** | Speech & Audio AI | Speech & Audio | Growing (TRL 7) | 🟡 Trung bình |

**Đặc điểm chung:**
- Input: văn bản, PDF, hình ảnh, video, âm thanh
- Output: thông tin trích xuất, phân loại, tóm tắt
- Yêu cầu: dữ liệu nhãn (cho training) hoặc pre-trained models
- Thời gian POC: 6-12 tuần
- ROI: tiết kiệm lao động thủ công, tăng tốc quy trình

**Cross-links:** B02 ↔ B04 (NLP powers document text extraction), B03 ↔ B02 (vision for scanned docs)

---

## TIER 3 — GENERATIVE AI
> **Định nghĩa:** Tạo ra nội dung mới, đề xuất lựa chọn tối ưu, hoặc tìm kiếm thông minh từ kho kiến thức.

| ID | Canonical Name | Short Name | Maturity | Vietnam Priority |
|----|---------------|------------|----------|-----------------|
| **B05** | Recommendation Systems | Recommendation | Mature (TRL 8-9) | 🔴 Rất cao |
| **B06** | Optimization & Operations Research | Optimization | Mature (TRL 8) | 🔴 Rất cao |
| **B09** | Generative AI & Content | Generative AI | Emerging (TRL 7-8) | 🔴 Rất cao |
| **B12** | Search & RAG | Search & RAG | Growing (TRL 8) | 🔴 Rất cao |

**Đặc điểm chung:**
- Input: user context, knowledge base, constraints
- Output: nội dung sinh ra, lựa chọn đề xuất, câu trả lời
- Yêu cầu: foundation models hoặc training data lớn
- Thời gian POC: 4-10 tuần
- ROI: tăng trải nghiệm người dùng, tự động hóa content

**Cross-links:** B09 ↔ B12 (RAG enhances GenAI accuracy), B05 ↔ B06 (optimization of recommendation parameters)

---

## TIER 4 — AGENTIC AI
> **Định nghĩa:** Hệ thống AI tự động thực hiện chuỗi hành động, điều phối nhiều agents, hoặc mô phỏng môi trường phức tạp.

| ID | Canonical Name | Short Name | Maturity | Vietnam Priority |
|----|---------------|------------|----------|-----------------|
| **B08** | Conversational AI & Chatbots | Conversational AI | Mature (TRL 8) | 🔴 Rất cao |
| **B10** | Agentic AI & Autonomous Systems | Agentic AI | Emerging (TRL 6-7) | 🟠 Cao |
| **B11** | Knowledge Graph & Semantic AI | Knowledge Graph | Growing (TRL 7) | 🟡 Trung bình |
| **B15** | Simulation & Digital Twin | Simulation | Growing (TRL 7) | 🟡 Trung bình |

**Đặc điểm chung:**
- Input: user goals, environment state, historical data
- Output: actions, decisions, simulated outcomes
- Yêu cầu: LLMs + tool calling, complex orchestration
- Thời gian POC: 8-16 tuần
- ROI: dài hạn, transformational (không dễ đo ngắn hạn)

**Cross-links:** B10 ↔ B08 (agents use conversation interface), B11 ↔ B10 (knowledge graph grounds agent reasoning), B15 ↔ B06 (simulation validates optimization solutions)

---

## Capability Priority Matrix (cho Vietnam market)

| Priority | Baselines | Lý do |
|----------|----------|-------|
| 🔴 **Rất cao** | B01, B02, B04, B05, B06, B07, B08, B09, B12, B13 | Proven ROI, high market demand, strong data availability |
| 🟠 **Cao** | B03, B10 | Growing adoption, clear use cases, moderate complexity |
| 🟡 **Trung bình** | B11, B14, B15 | Specialized, longer POC, requires mature org |

---

## Cross-Tier Dependencies

```
B04 (NLP) ─────────────── enables ──→ B02 (Doc Intelligence)
B04 (NLP) ─────────────── enables ──→ B08 (Conversational AI)
B09 (GenAI) ────────────── enables ──→ B12 (Search & RAG)
B12 (Search & RAG) ───────── powers ──→ B10 (Agentic AI)
B11 (Knowledge Graph) ──── grounds ──→ B10 (Agentic AI)
B01 (Forecasting) ─────── feeds into ──→ B06 (Optimization)
B07 (Anomaly) ─────────── triggers ──→ B10 (Agentic response)
B05 (Recommendation) ─── variant of ──→ B06 (Optimization)
```

---

## Layer Architecture v2 — Functional Grouping (2026-03-31 Update)

> **Lưu ý:** Tier classification ở trên (Tier 1-4) vẫn giữ nguyên — đây là cách nhìn bổ sung dựa trên **chức năng thực tế** của mỗi baseline trong AI value chain.

### 4 Layers

```
LAYER 1 — ANALYTICAL FOUNDATION    (Dữ liệu cấu trúc → Dự báo / Phát hiện)
LAYER 2 — PERCEPTION & ANALYSIS    (Phi cấu trúc → Cấu trúc)
LAYER 3 — GENERATIVE & KNOWLEDGE   (Tạo nội dung, truy xuất, tối ưu)
LAYER 4 — ORCHESTRATION             (Điều phối, tự hành, mô phỏng)
```

### Layer Mapping

| Layer | Baselines | Chức năng chính |
|-------|-----------|----------------|
| **L1 — Analytical** | B01, B07*, B13 | Structured data → predictions, scores, forecasts |
| **L2 — Perception** | B02*, B03, B04, B14 | Unstructured (text/image/audio/doc) → structured signals |
| **L3 — Generative & Knowledge** | B05, B06, B09, B11*, B12 | Create content, retrieve knowledge, optimize decisions |
| **L4 — Orchestration** | B08*, B10, B15* | Compose multiple capabilities, autonomous multi-step |

### Cross-Layer Notes (quan trọng!)

| Baseline | Layer chính | Cross-layer note |
|----------|-------------|-----------------|
| **B07** Anomaly Detection | L1 | Core methods (Isolation Forest, statistical) = L1. Khi consume L2 features (image/text/audio anomaly) → hoạt động cross-layer |
| **B02** Document Intelligence | L2 | Cross-modal internally (dùng B03 Vision + B04 NLP techniques), nhưng purpose = perception (unstructured → structured) |
| **B11** Knowledge Graph | L3 | Dual role: (1) KG creation = L3, (2) Memory infrastructure cho L4 agents (persistent structured knowledge) |
| **B08** Conversational AI | L4 | LLM-powered conversational AI with RAG/tool-use = L4. Simple rule-based chatbots = implementation pattern within B04 NLP |
| **B15** Simulation & DT | L4 | Digital Twin composing multiple capabilities = L4. Pure simulation methods (Monte Carlo, DES, ABM) = standalone mathematical tools usable at L1/L3 |

### Decision Boundaries — Khi nào chọn B nào?

**Layer 1 (Structured Data):**
- Time là driver chính? → **B01** Forecasting
- Time chỉ là 1 feature? → **B13** Tabular ML
- Detect bất thường, không có labels? → **B07** Anomaly (unsupervised)
- Classify có labels? → **B13** Tabular ML (supervised)

**Layer 2 (Unstructured Input):**
- Text → **B04** NLP
- Image/Video → **B03** Computer Vision
- Audio/Speech → **B14** Speech & Audio
- Document (text + layout + bảng) → **B02** Document Intelligence

**Layer 3 (Create / Retrieve / Optimize):**
- Tạo nội dung mới standalone → **B09** Generative AI
- Q&A trên existing documents → **B12** Search & RAG
- Gợi ý items từ catalog → **B05** Recommendation
- Quyết định tối ưu có constraints → **B06** Optimization
- Structured entity relationships → **B11** Knowledge Graph

**Layer 4 (Compose / Automate / Simulate):**
- Chat interface (text/voice) → **B08** Conversational AI
- Autonomous multi-step tasks → **B10** Agentic AI
- What-if simulation / Digital Twin → **B15** Simulation

### Composition Patterns

```
Pattern 1 (Perception → Analytical):
  B14 Speech → B04 NLP → B13 Predict churn from call sentiment

Pattern 2 (Analytical → Generative):
  B01 Forecast demand → B06 Optimize inventory → B09 Generate report

Pattern 3 (Full Stack Voice Assistant):
  B14 Voice input → B08 Conversation → B12 RAG search → B09 Generate → B14 TTS

Pattern 4 (Digital Twin Loop):
  B15 Simulate factory → B07 Detect anomaly → B06 Optimize → B15 Validate → Deploy
```

---

## Mapping: Baselines → Agent Skill Cards

| Baseline | Primary Research Role | Domain Expert Reference |
|----------|----------------------|------------------------|
| B01 Forecasting | R-MLE, R-DE | R-D01 (Retail), R-D06 (Logistics) |
| B02 Doc Intelligence | R-NLP, R-MLE | R-D02 (Finance), R-D11 (Legal) |
| B03 Computer Vision | R-CVE, R-DLE | R-D04 (Manufacturing), R-D03 (Healthcare) |
| B04 NLP | R-NLP, R-DLE | All industries |
| B05 Recommendation | R-MLE, R-DE | R-D01 (Retail), R-D12 (Media) |
| B06 Optimization | R-MLE, R-DA | R-D06 (Logistics), R-D07 (Energy) |
| B07 Anomaly Detection | R-MLE, R-DE | R-D02 (Finance), R-D04 (Manufacturing) |
| B08 Conversational AI | R-NLP, R-AE, R-BE | R-D01 (Retail), R-D09 (Education) |
| B09 Generative AI | R-DLE, R-NLP | R-D12 (Media), R-D18 (Marketing) |
| B10 Agentic AI | R-AE, R-NLP | R-D20 (Cybersecurity), R-D06 (Logistics) |
| B11 Knowledge Graph | R-DE, R-DBE | R-D11 (Legal), R-D02 (Finance) |
| B12 Search & RAG | R-NLP, R-BE | All industries |
| B13 Tabular ML | R-MLE, R-DA | R-D02 (Finance), R-D01 (Retail) |
| B14 Speech & Audio | R-NLP, R-DLE | R-D09 (Education), R-D14 (F&B) |
| B15 Simulation | R-MLE, R-DA | R-D07 (Energy), R-D04 (Manufacturing) |

---

*AI Capability Taxonomy v1.0 — MAESTRO Knowledge Graph Platform*  
*Cross-reference: `docs/CONVENTIONS.md §5` (canonical names) · `agent-team-config.md §I` (full agent catalog)*
