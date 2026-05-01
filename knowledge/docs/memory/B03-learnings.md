# B03 Learnings — Computer Vision
Ngày: 2026-03-31

---

## Insights chính (cho các modules tương lai)

### 1. Rào cản gia nhập trong CV không phải thuật toán — mà là dữ liệu

Không giống như nhiều lĩnh vực AI khác, tooling và pretrained models của Computer Vision năm 2026 đã cực kỳ tốt và dễ tiếp cận. Khoảng cách cạnh tranh thực sự đến từ **dữ liệu có nhãn theo domain Việt Nam** — không ai có sẵn Vietnamese factory defect dataset, Vietnamese retail shelf dataset, hay Vietnamese medical imaging dataset đủ lớn. Điều này có nghĩa là:
- Chi phí thực của một dự án CV không phải GPU cost ($50-$150) mà là annotation cost ($5,000-$50,000)
- Domain-specific dataset là **competitive moat thực sự** — nếu build được trước, đối thủ phải mất 4-12 tuần và chi phí tương tự để bắt kịp
- MAESTRO nên coi việc xây dựng Vietnamese domain datasets (retail products, medical X-ray, factory defects) là **chiến lược đầu tư tài sản**, không chỉ là artifact của dự án

Áp dụng cho: mọi module B-series có domain-specific data requirement.

### 2. Khoảng cách "benchmark vs production" nguy hiểm hơn B01

Ở B01 (Forecasting), khoảng cách giữa M4 competition result và production performance là có thật nhưng có thể giải thích. Ở B03 (Computer Vision), khoảng cách này còn khó kiểm soát hơn: COCO mAP và ImageNet accuracy là Western-centric benchmarks, nhưng khách hàng Việt Nam sẽ deploy trên môi trường với **bao bì sản phẩm khác, cảnh đường phố khác, điều kiện ánh sáng khác, và đặc điểm nhân khẩu học khác**. Chênh lệch thường 5-25 điểm phần trăm.

**Quy tắc nghiêm ngặt từ module này:** Không bao giờ trích dẫn benchmark CV numbers (COCO mAP, ImageNet top-1) trong đề xuất cho khách hàng mà không có cảnh báo domain shift rõ ràng và cam kết chạy evaluation trên Vietnamese test set trước khi ký hợp đồng.

Áp dụng cho: bất kỳ module nào báo cáo benchmark performance như differentiation point.

### 3. Foundation model disruption trong CV nghiêm trọng hơn B01

Ở B01, foundation models (TimesFM, Chronos) là competitive threat nhưng có clear moat: enterprise deployment, MLOps integration, hierarchical forecasting. Ở B03, GPT-4o Vision và Gemini 2.0 Flash có thể **thực hiện object detection, classification và VQA qua single API call ở $0.00015-$0.001/ảnh**. Với nhiều Vietnamese SME use cases, đây đơn giản là câu trả lời đúng.

**Reconciled position (được đa số agents đồng thuận):** API-first cho prototype và SME với volume thấp (<500K ảnh/tháng); fine-tune cho production với Vietnamese-specific domain và volume cao. Không nên assume "build YOLO model" là default — phải explicitly justify tại sao không dùng API.

Áp dụng cho: B04 (NLP), B08 (Conversational AI), và bất kỳ module nào overlap với GPT-4 family capabilities.

### 4. Phần cứng Trung Quốc là competitive landscape quan trọng nhất bị bỏ qua

R-α và R-β phân tích competitive landscape theo cloud API providers (Google, AWS, Azure). R-γ chỉ ra điều này bỏ qua **đối thủ thực sự tại thị trường Việt Nam: Hikvision và Dahua** — đã chiếm >60% installed base camera thương mại và chính phủ, cung cấp AI features nhúng sẵn gần như miễn phí. Không có công ty phần mềm Việt Nam nào có thể cạnh tranh về giá cho surveillance, smart city hay access control với players này.

**Implication cho strategy:** Tập trung vào use cases mà hardware vendors **không** phục vụ tốt: custom domain adaptation (nhà máy specific, retail SKU Việt Nam), data privacy selling point, integration flexibility với existing enterprise systems.

Áp dụng cho: B07 (Anomaly Detection — visual anomaly is also CV), và bất kỳ module nào có Chinese vendor competition.

### 5. Regulatory dimension cần là section đầu tiên, không phải cuối cùng

R-α's research report đặt regulatory/ethics ở cuối, sau 8 sections kỹ thuật. R-γ chỉ ra Face Analysis được đặt ngang hàng với Object Detection như "technical capability trung lập." Điều này nguy hiểm trong bối cảnh Việt Nam: Nghị định 13/2023/NĐ-CP phân loại facial geometry là sensitive personal data.

**Chuẩn mực mới cho future modules:** Regulatory và ethical dimensions phải xuất hiện trong **Tóm tắt điều hành và Section 3 (Feasibility)**, không phải phần phụ. Bất kỳ use case nào liên quan đến biometric data, health data, hay financial data phải có regulatory flag rõ ràng từ đầu.

---

## Patterns tái sử dụng

### Pattern A: Ba tầng deployment architecture

```
MVP Stack (đội 3-5 người, 2-4 tuần):
  PyTorch + YOLOv8 + Albumentations + FastAPI + ONNX Runtime trên T4

Production v1 (đội 5-10 người, 3-6 tháng):
  Thêm Triton, DVC, Prometheus + Grafana, TensorRT FP16

Enterprise (đội 10+ người):
  Kubernetes GPU pools, Kafka streaming, Federated learning
```

Pattern này là direct parallel với B01's three-tier architecture. Áp dụng nhất quán cho mọi B-series module. **Quan trọng:** luôn chỉ rõ tại threshold nào mỗi component được justify (ví dụ: Triton chỉ khi >3 models đồng thời).

### Pattern B: Hybrid Edge-Cloud là default cho Việt Nam

Do kết nối internet không đều và vấn đề data sovereignty, **Hybrid Architecture (edge lightweight model + cloud heavy model chỉ cho flagged frames)** nên là default recommendation cho mọi deployment CV tại Việt Nam — thay vì cloud-only hoặc edge-only.

Áp dụng cho: B07 (Visual Anomaly Detection), và bất kỳ module nào có real-time inference requirement tại Việt Nam.

### Pattern C: "API-first prototype, fine-tune at scale" decision framework

Cho mọi module có model serving component:
1. **Volume <500K units/tháng, domain không specific:** Dùng API (Google, AWS, Azure, GPT-4o)
2. **Volume cao HOẶC domain Việt Nam specific:** Fine-tune pretrained model
3. **Không bao giờ:** Training from scratch cho team <10 ML engineers

### Pattern D: Annotation cost là first-class project cost

Trong bất kỳ estimate nào cho client:
- GPU compute: X
- Data collection: 10-100× X
- Annotation labor: 5-50× X
- Engineering overhead: 10-20× X
- **Total thực tế = 25-170× GPU cost**

---

## Điều cần làm khác đi cho module tiếp theo

1. **R-β nên bao gồm một section "Vietnam-Adjusted Stack"** song song với main tech stack recommendation. R-γ phải làm việc này trong feasibility report, nhưng lý tưởng là R-β cung cấp sẵn hai variant: full production stack cho well-funded team và simplified stack cho Vietnamese SME/startup context.

2. **R-α nên đặt "Vietnamese deployment challenges" như một dedicated section** (Section 7 hoặc 8), không phải footnotes trong taxonomy. Domain shift, annotation scarcity, và regulatory risk là first-class research concerns cho MAESTRO's target market.

3. **R-γ nên bao gồm một "Build vs. Buy vs. Fine-tune vs. API" decision matrix** trong mọi feasibility report (B03 làm tốt điều này) — đây là phân tích thực tế quan trọng nhất cho Vietnamese companies quyết định investment.

4. **Domain specialists (R-D03, R-D01) nên cross-reference Layer 1 claims explicitly.** R-D03's healthcare notes và R-D01's retail notes rất có giá trị nhưng không cite hoặc challenge Layer 1 claims trực tiếp. Yêu cầu explicit citations sẽ làm synthesis layer dễ hơn.

5. **Template contradiction register:** R-γ nên có một section chuẩn "Contradictions with R-α and R-β" với format thống nhất: [Claim] → [Challenge] → [Evidence] → [Recommended position]. B03 có 5 challenges nhưng format hơi khác nhau. Standardize cho các modules sau.

---

## Phát hiện quan trọng cho thị trường Việt Nam

### Tài sản chiến lược: Vietnamese CV Datasets

Không có Vietnamese retail product dataset công khai. Không có Vietnamese factory defect dataset. VinDr-CXR là dataset medical Việt Nam duy nhất đáng kể (công khai). **Đây vừa là barrier to entry vừa là competitive moat**: ai build và control Vietnamese domain-specific CV datasets đầu tiên sẽ có lợi thế bền vững 2-3 năm.

**Khuyến nghị cho MAESTRO:** Treat dataset creation as IP investment, not project cost. Budget riêng cho annotation infrastructure và có chiến lược data ownership rõ ràng với clients.

### WinMart/WinMart+ là beachhead account tốt nhất cho Retail CV

2,000+ stores, corporate decision-makers, Masan Group đã publicly commit to digital transformation. Retail CV pilot với WinMart có thể generate reference account mạnh nhất cho toàn bộ retail vertical.

### VinAI là partner chiến lược, không phải competitor

VinAI có world-class research nhưng commercialization arm nascent. VinDr-CXR dataset là tài sản Việt Nam quan trọng nhất cho medical CV. Nên tiếp cận với frame partnership/licensing hơn là competition.

### Regulatory pathway healthcare đang được xây dựng

Circular 22/2023/TT-BYT đặt framework nhưng AI diagnostic pathway chưa rõ ràng như FDA/CE. Companies engage với DAV và MoH trong giai đoạn pilot sẽ có lợi thế đáng kể khi pathway được finalize (ước tính 2026-2027).

---

## Kết nối với các modules khác

### B03 ↔ B02 (Document Intelligence)

Kết nối mạnh nhất: OCR là CV task; Document Visual Understanding (Donut, TrOCR) là thuần CV models. PaddleOCR là technology shared giữa hai modules. KYC use case (ID card + selfie verification) là intersection quan trọng của B02 và B03.

**Khuyến nghị:** B02 và B03 nên chia sẻ một shared OCR/document vision component trong platform architecture. Không xây dựng hai OCR pipelines riêng biệt.

### B03 ↔ B07 (Anomaly Detection)

Visual anomaly detection là use case quan trọng nhất trong manufacturing QC (factory defects) — nằm ở intersection B03 và B07. B07 cung cấp one-class learning framework; B03 cung cấp visual backbone. Embedding-space drift detection (đề cập trong B03 production monitoring) là exactly B07 methodology.

**Khuyến nghị:** Khi build B07, reuse visual feature extraction pipeline từ B03. Không reinvent visual backbone cho B07.

### B03 ↔ B04 (NLP & Language AI)

Multimodal convergence là xu hướng quan trọng nhất: CLIP, LLaVA, GPT-4V đã hợp nhất B03 và B04 trong một foundation model layer. B04 module cần phân tích rõ boundary giữa "text-only LLM" và "vision-language model" — đây không còn là hai categories riêng biệt.

**Khuyến nghị:** B04 module nên dành một section riêng cho Vision-Language Models (VLMs) thay vì chỉ focus vào pure text. CLIP encoder là component shared giữa B03 và B04.

### B03 ↔ B01 (Forecasting)

Weaker connection nhưng real: shelf camera analytics → inventory level time series → demand forecasting. Video analytics của retail traffic → foot traffic time series → demand signal. Khi build integrated retail intelligence platform, B01 và B03 outputs cần được designed để work together.

### B03 → B09 (Generative AI)

Diffusion models đang provide **synthetic data cho discriminative CV training** — điều này ngày càng quan trọng để giải quyết annotation scarcity problem tại Việt Nam. B09 module nên include "synthetic data generation cho CV training" như một explicit use case.

---

## Ghi chú về hiệu suất agents

**Điều hoạt động tốt:**
- R-γ (Dr. Sentinel) cung cấp concrete challenges với specific evidence — 5 challenges với numbered justification làm cho contradiction resolution trong synthesis layer rõ ràng và có thể audit được. Đây là template tốt nhất đã thấy.
- R-D03 và R-D01 cung cấp domain specifics (VinDr-CXR dataset, WinMart scale, DRE numbers) — không phải generic industry analysis. Level of specificity này là ideal.
- R-CVE (CV Engineer) với production experience cung cấp model selection decision tree và data volume thresholds cụ thể — quan trọng hơn R-β's full-stack architecture cho Vietnam context.
- Build vs. Buy vs. Fine-tune vs. API analysis của R-γ là framework quan trọng nhất trong toàn bộ research — nên là standard section trong mọi feasibility report.

**Cần điều chỉnh cho module tiếp theo:**
- R-β cần thêm một "Vietnam-simplified stack" variant cùng với full production stack.
- Domain specialists (R-D03, R-D01) cần explicitly cross-reference Layer 1 claims. Hiện tại họ hoạt động independent — một explicit "challenge/confirm/add" format với Layer 1 sections sẽ giảm synthesis effort.
- Regulatory dimension nên xuất hiện trong executive summary của tất cả reports, không phải chỉ feasibility report. R-α đặt regulatory ở cuối hoặc không đề cập — thiếu sót quan trọng cho Vietnam context.
- "Contradictions register" nên là structured template với format chuẩn trong R-γ report để synthesis layer không cần scan toàn bộ document.

---

*Ghi chú này được tổng hợp bởi Ms. Scribe (R-σ). Module B03 Computer Vision. Ngày: 2026-03-31.*
