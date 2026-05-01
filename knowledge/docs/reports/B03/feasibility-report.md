# Feasibility Report: Computer Vision (B03)
## By Dr. Sentinel (R-γ) — Date: 2026-03-31

---

### 1. Verdict: CONDITIONAL GO

Computer Vision is technically mature and globally in high demand, but deploying it profitably in the Vietnamese market requires navigating material constraints: limited labeled domain-specific data, GPU infrastructure costs that are high relative to local revenue expectations, looming regulatory risk on facial recognition, and aggressive competition from both global API providers and Chinese hardware-embedded vendors. **Overall Score: 6.8 / 10.** Proceed — but only with a tightly scoped, use-case-first strategy that avoids the temptation to build generic CV infrastructure.

---

### 2. Feasibility Scoring Matrix

| Dimension | Score (1-10) | Justification |
|---|---|---|
| **Technical Feasibility** | 8 | Global tooling is excellent. PyTorch, Ultralytics, HuggingFace, ONNX are production-ready. Fine-tuning pretrained models is well-understood. No fundamental unsolved technical problem for the use cases relevant to Vietnam. |
| **Market Demand** | 7 | Genuine demand from manufacturing, retail, logistics, and smart city verticals. However, many Vietnamese enterprises are still in early digital transformation — they want outcomes, not CV APIs. Deal sizes are smaller than in comparable ASEAN markets. |
| **Data Availability** | 5 | This is the sharpest constraint. Public Vietnamese-specific labeled datasets are sparse. Vietnamese product catalogs, license plates, street scenes, and faces are underrepresented in COCO/ImageNet. Custom annotation is required for most real-world deployments — adding 4–12 weeks and $5,000–$50,000 in cost per project. |
| **Implementation Risk** | 6 | Medium-high. The gap between benchmark performance and production performance in Vietnamese-specific environments (motorbike density, low-light surveillance, dialect-mixed OCR, diverse product packaging) is routinely underestimated by both R-α and R-β. Edge deployment on Vietnam-grade hardware adds further complexity. |
| **Vietnam Market Fit** | 6 | Strong fit in manufacturing QC and retail; weaker fit for medical (regulatory/credentialing barriers) and autonomous driving (no active OEM ecosystem). Government smart city projects exist but procurement cycles are long (12–24 months) and dominated by integrated hardware vendors. |
| **Overall** | **6.8** | Viable if positioned as a vertical solution provider rather than a horizontal CV platform. Focus on 2–3 use cases with clear ROI, not CV-as-a-service. |

---

### 3. Market Analysis

#### 3a. Global CV Market

The global Computer Vision market was valued at approximately **USD 20.3 billion in 2024** (MarketsandMarkets, Grand View Research consensus range: $19–22B) and is projected to grow at a **CAGR of 18–22%** through 2030, reaching approximately **USD 57–70 billion**. Key growth drivers are generative AI integration, autonomous vehicles, industrial automation, and smart retail.

**Key segments by revenue (2024 estimates):**
- Hardware (cameras, edge AI chips, Jetson, Coral): ~35% of market
- Software & platforms: ~40%
- Services (integration, annotation, MLOps): ~25%

**Dominant vendors:** NVIDIA (hardware + CUDA ecosystem), Google (Vision AI, Vertex AI), Microsoft Azure (Computer Vision, Custom Vision), Amazon AWS (Rekognition, Panorama), Qualcomm (edge AI), Intel (OpenVINO, Movidius). In the application layer: Cognex (industrial), Zebra, Hikvision, Dahua, Huawei (surveillance and edge AI in hardware).

**Critical observation:** The market is increasingly bifurcating. Commodity tasks (face detection, object classification, OCR) are being commoditized by cloud APIs at $0.001–$0.003 per image. The profitable moat is in **domain-specific fine-tuning + deployment integration** — not generic CV capabilities.

#### 3b. Vietnam & SEA Market

**Vietnam AI adoption context:**
- Vietnam's AI market was estimated at **USD 450–600 million in 2024** (Vietnam Ministry of Science and Technology; IDC SEA report), with CV-related applications representing roughly 20–30% of that figure (~$100–180M).
- The Vietnam AI Strategy (Decision 127/QD-TTg, updated targets to 2030) allocates VND 1.7 trillion (~$68M) to AI research, smart city pilots, and digital transformation — with computer vision named explicitly as a priority technology in manufacturing and smart governance.
- **Smart city projects** with CV components are active or piloted in Ho Chi Minh City (AI traffic monitoring, HCMC Smart City program), Hanoi (surveillance system upgrades), and Da Nang (public safety cameras). However, many of these have been awarded to Chinese vendors (Viettel/Huawei JVs, Dahua) or require government procurement relationships.
- **Manufacturing sector**: Vietnam is a major global production hub (Samsung, Intel, LG, Nike, Garmin manufacturing). Quality control vision systems are a genuine commercial opportunity — but most tier-1 factories already have deployed systems from Cognex, Keyence, or internal R&D teams from Korean/Taiwanese parent companies. Tier-2 and SME factories are underserved.
- **Local AI players with CV capability**: VinAI Research (face recognition, autonomous driving research, academic-grade outputs), FPT.AI (OCR, document intelligence, limited CV), Zalo AI (face/content moderation for Zalo platform), BKAV (face recognition, security cameras), VietIS, Rela (retail analytics).
- **SEA context**: Thailand and Indonesia have more mature CV service markets due to larger enterprise bases. Singapore is primarily a hub for regional deployment, not domestic CV demand. Philippines has growing BPO-driven data annotation capacity.

**Key gap**: There is no Vietnamese company that has achieved a commercially scalable, domain-general CV platform. VinAI produces world-class research but its commercialization arm is nascent. FPT.AI focuses on document AI, not visual AI. The market is wide open for a well-executed vertical CV product.

#### 3c. TAM/SAM/SOM for a Vietnamese AI Company

The following estimates are for a Vietnamese company with ~20–50 person AI team, focusing on B2B software + services.

| Market | Definition | Estimate (Vietnam, 2025–2026) |
|---|---|---|
| **TAM** | Total spend on CV software + services in Vietnam across all verticals | USD 80–120M/year |
| **SAM** | Serviceable subset: manufacturing QC + retail analytics + smart logistics (excludes hardware, government procurement requiring prior relationships, and healthcare requiring clinical certification) | USD 20–35M/year |
| **SOM** | Realistically capturable in 24 months with a 15–30 person sales + technical team | USD 2–5M ARR |

**SOM justification**: A realistic pipeline is 10–20 mid-market enterprise contracts at $100,000–$250,000 ACV (Annual Contract Value), plus 5–15 SME contracts at $20,000–$50,000 ACV. This is achievable but requires direct enterprise sales motion, not a self-serve API model.

---

### 4. Competitive Landscape

| Competitor / Solution | Type | Strengths | Weaknesses | Pricing | Vietnam Presence |
|---|---|---|---|---|---|
| **Google Vision AI** | Cloud API | Best-in-class zero-shot object detection, OCR, face analysis; multimodal (Gemini Vision); global infra | Latency from Vietnam to nearest region (Singapore) adds 30–60ms; data residency concerns for regulated customers; no on-premise | $1.50 per 1,000 units (detection); Vision API varies by feature | Indirect via Google Cloud resellers; no local office dedicated to CV |
| **AWS Rekognition** | Cloud API | Strong face detection/analysis, content moderation, celebrity recognition; PPE detection for industrial | Less competitive on custom model training vs. Google Vertex; Rekognition Custom Labels pricing steep | $1/1,000 images (object/scene); $0.001/image (face) | AWS ASEAN region (Singapore); local resellers in Vietnam |
| **Azure Computer Vision** | Cloud API | Deep Microsoft ecosystem integration; Custom Vision for fine-tuning; strong OCR (Document Intelligence) | Complex pricing tiers; performance on Vietnamese-specific content suboptimal | $1.50/1,000 calls (standard tier); Custom Vision training + prediction cost | Microsoft Vietnam office; Azure Government Cloud discussions underway |
| **Roboflow** | Data + training platform | Excellent data management, annotation, YOLOv8 training pipeline; generous free tier | Not an inference product; relies on user-deployed models; limited post-deployment support | Free tier; $249–$499/mo for teams | No local presence; used by individual developers in Vietnam |
| **Scale AI** | Data annotation | Highest-quality human annotation at scale; used by major AI companies | Expensive ($0.05–$0.30 per image annotation task); not an inference platform; slow for small clients | Project-based; enterprise contract | No Vietnam presence; annotation tasks sometimes outsourced to Vietnam workforce |
| **VinAI** | Local research + products | World-class research team; PhoBERT, VinDr-CXR; strong credibility with Vietnamese government | Primarily research-focused; commercial products (VinBrain) are in limited verticals; less focused on B2B CV platform | Not public / project-based | Strong — government research partnerships, Vingroup backing |
| **FPT.AI** | Local platform | Established enterprise sales, OCR/document AI, strong brand; bundled with FPT IT services | CV is not their core focus; limited custom model capabilities; product depth weaker than global alternatives | Enterprise contract / SaaS model | Very strong — 200+ enterprise clients, nationwide sales |
| **Zalo AI** | Internal + limited external | Strong face recognition and content moderation for VNG/Zalo platform; real production scale | Not a B2B product; closed ecosystem; talent not available externally | Not commercialized | Platform-internal only |
| **Hikvision / Dahua** | Hardware + embedded AI | Dominant in surveillance cameras; price-competitive; hardware + software bundled; already deployed in thousands of Vietnamese sites | Western market restrictions (US entity list); privacy concerns; AI quality variable; limited customization for non-surveillance use cases | Camera hardware + NVR + AI license (per channel); $50–$200 per camera for AI | Very strong — #1 and #2 market share in Vietnam security cameras |
| **Huawei / Atlas** | Hardware + cloud AI | Atlas 800/900 AI servers; Ascend NPU; OceanStor for data; bundled with Huawei telecom | US sanctions complicate international certifications; limited open ecosystem; requires Huawei stack commitment | Enterprise/government contract | Strong via Huawei Vietnam and carrier partnerships (Viettel, VNPT) |

**Devil's Advocate observation**: The Chinese hardware vendors (Hikvision, Dahua, Huawei) are a larger competitive threat than R-α and R-β acknowledge. They do not compete on a cloud API basis — they compete on a hardware-bundled, on-premise, already-deployed basis. Any Vietnamese CV company targeting surveillance, smart city, or access control is walking directly into their installed base.

---

### 5. Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Data annotation cost for custom domains** | High (9/10) | High | Budget $10,000–$50,000 per domain-specific dataset. Use Label Studio + semi-automated annotation (SAM2 for segmentation masks, model-assisted labeling). Partner with Vietnamese annotation providers (Vinbigdata, local freelancers). Build reusable dataset assets — annotation cost is a one-time capital expense if owned. |
| 2 | **GPU infrastructure cost** | Medium (6/10) | Medium-High | AWS/GCP Singapore spot instances are accessible but expensive for continuous inference. Use TensorRT FP16 quantization to reduce GPU requirements 4–8×. For on-premise clients, evaluate NVIDIA Jetson Orin NX (USD 500 per device) as the edge inference standard. Reserve cloud GPU only for training; use edge or CPU-ONNX for inference where latency SLA allows. |
| 3 | **Talent scarcity for CV engineers in Vietnam** | High (8/10) | High | Vietnam has limited experienced CV engineers (estimated <200 engineers with >3 years production CV experience nationally as of 2026). Most are absorbed by VinAI, VNG, Viettel, or have emigrated. Mitigation: hire junior ML engineers and train on CV stack; leverage transfer learning to reduce need for deep CV expertise; consider remote collaboration with diaspora. |
| 4 | **Foundation model disruption (off-the-shelf APIs improving)** | High (8/10) | Medium-High | GPT-4o, Gemini 2.0, and their successors are closing the performance gap on most standard CV tasks. An API-based Vietnamese competitor can potentially replicate a generic CV product using foundation model APIs within 3–6 months. Mitigation: own the vertical integration, the data, and the customer workflow — not just the model. A generic CV API is not a defensible business in 2026. |
| 5 | **Model accuracy in Vietnamese-specific scenarios** | Medium-High (7/10) | High | COCO/ImageNet pretrained models have degraded performance on: (a) Vietnamese motorbike-dense traffic, (b) Vietnamese product packaging (different fonts, colors, language), (c) Vietnamese faces (demographic underrepresentation in training data), (d) Vietnamese street signs and license plates (different format from Western/Chinese training sets). Mitigation: mandatory domain adaptation with local data; do not quote COCO mAP numbers to clients — run on representative local test sets. |
| 6 | **Regulatory risk: face recognition restrictions** | Medium (5/10) | Very High | Vietnam's Decree 13/2023/ND-CP (Personal Data Protection) came into effect September 2023 and classifies biometric data (including facial geometry) as sensitive personal data requiring explicit consent and strict storage/processing controls. Separately, the Ministry of Public Security is drafting stricter AI surveillance regulations (expected 2025–2026). Face recognition in public spaces without consent is legally ambiguous and trending toward restriction. Mitigation: focus on access control (consented use cases) not mass surveillance; obtain legal counsel before any face recognition deployment; avoid smart city face recognition contracts until regulatory clarity exists. |
| 7 | **Competition from Chinese CV vendors** | High (8/10) | High | Hikvision and Dahua have installed base in >60% of Vietnamese commercial and government surveillance infrastructure. They offer AI features (face recognition, crowd counting, license plate recognition) embedded in cameras at near-zero marginal cost. No Vietnamese software company can compete on price for these embedded use cases. Mitigation: compete on custom domain adaptation (their models do not adapt to factory defect inspection or specific retail SKU recognition), on data privacy selling points, and on integration flexibility. |
| 8 | **Overfitting to benchmark, underperforming in production** | Medium (6/10) | High | Both R-α and R-β report impressive benchmark numbers (YOLOv9-E at 55.6 AP on COCO, ViT-G at 90.45% ImageNet top-1). These numbers are achieved on curated, well-distributed test sets under controlled conditions. Real Vietnamese factory floors have motion blur, inconsistent lighting, dust, camera vibration, and product variations not seen in training. Mitigation: mandatory out-of-distribution evaluation on representative client data before contract signing; include model refresh cadence in contract terms; deploy confidence-based fallback to human review. |
| 9 | **Long enterprise sales cycles** | Medium-High (7/10) | Medium | Vietnamese enterprise procurement (especially SOEs and manufacturing JVs) typically requires 3–6 month pilot periods, multi-stakeholder sign-off, and often government approval for data-touching systems. Mitigation: structure pilots as fixed-fee proof-of-concept ($15,000–$30,000) that transitions to SaaS — do not do free pilots. |
| 10 | **Dependency on foreign GPU cloud during geopolitical disruption** | Low-Medium (3/10) | High | AWS, GCP, Azure infrastructure in Singapore is the practical GPU compute option for Vietnamese AI companies. In a severe geopolitical scenario, access could be restricted or costs could spike. Mitigation: design for multi-cloud portability; evaluate Viettel IDC as a domestic fallback for inference workloads; ONNX export enables runtime-agnostic deployment. |

---

### 6. Use Case Prioritization for Vietnam

| Use Case | Market Size (Vietnam, 2026) | Technical Complexity | Vietnam Readiness | Priority |
|---|---|---|---|---|
| **Manufacturing Quality Control (visual defect detection)** | USD 8–15M/year | Medium (YOLOv8 + custom dataset, 4–8 weeks) | High — Samsung, LG, Garmin factories actively buying | **P1 — Start here** |
| **Retail Shelf Analytics (planogram compliance, OOS detection)** | USD 4–8M/year | Medium | High — large retail chains (Vinmart, Co.opmart, Circle K) have budget | **P1** |
| **License Plate Recognition (parking, logistics gates)** | USD 5–10M/year | Low-Medium (mature tech, Vietnam plate format adaptation needed) | High — multiple cities, logistics parks, hospitals buying | **P1** |
| **Document / ID Card OCR and Verification** | USD 6–12M/year | Low (PaddleOCR + TrOCR; existing tools) | Very High — banks, fintech, KYC compliance are buying now | **P1** |
| **Warehouse / Logistics Computer Vision (barcode, pallet counting, damage detection)** | USD 3–6M/year | Medium | High — growth of e-commerce logistics (Giao Hang Nhanh, Giao Hang Tiet Kiem, VNPost) | **P2** |
| **Access Control + Face Recognition (consented, premises-only)** | USD 4–8M/year | Medium | Medium — regulatory clarity needed; office buildings and factories are viable | **P2** |
| **Smart Traffic Analytics (vehicle counting, speed, congestion)** | USD 3–7M/year | Medium-High (dense motorbike traffic is harder than Western benchmarks) | Medium — government procurement cycles are long | **P2** |
| **Agricultural Crop Disease Detection** | USD 1–3M/year | Medium (requires local crop + disease dataset) | Medium — MARD pilot programs; drone integration needed | **P3** |
| **Retail Customer Analytics (footfall, dwell time, heatmaps — non-face)** | USD 2–4M/year | Medium | Medium — privacy-sensitive but technically viable without face ID | **P3** |
| **Medical Image Analysis (X-ray, dermatology screening)** | USD 2–5M/year | High | Low-Medium — regulatory, clinical validation, hospital procurement barriers are very high | **P3** |
| **Construction Site Safety (PPE detection, zone compliance)** | USD 1–3M/year | Medium | Medium — growing awareness post labor accidents; insurance incentives possible | **P3** |
| **E-commerce Product Image QC (automated catalog audit)** | USD 1–2M/year | Low-Medium | High — Shopee/Lazada sellers and brand owners have clear pain point | **P3** |

---

### 7. Challenges to R-α Research & R-β Tech Reports

**Challenge 1: Benchmark overconfidence in R-α (Section 5)**

R-α states that ViT-G achieves 90.45% ImageNet top-1, "essentially saturating the benchmark," and that YOLOv9-E achieves 55.6 AP on COCO. These numbers are presented as production-relevant. They are not. ImageNet top-1 accuracy measures performance on a Western-centric image distribution. COCO contains zero images of Vietnamese market products, Vietnamese street scenes, or Vietnamese factory environments. The gap between reported benchmark performance and actual production accuracy in a Vietnamese deployment routinely ranges from 5–25 percentage points, depending on domain shift. R-α should have included a domain shift caveat as a primary risk, not a footnote.

**Challenge 2: R-β underestimates annotation infrastructure cost (Section 7, Effort Estimation)**

R-β estimates "Image classification MVP (10–20 classes, custom dataset): 1–2 weeks, $50–$150 GPU cost." This estimate is technically accurate for GPU compute cost in isolation but is dangerously misleading as a total project cost. It omits: (a) data collection cost ($1,000–$5,000 for a representative Vietnamese product dataset), (b) annotation labor ($0.05–$0.30 per image × 1,000–5,000 images = $50–$1,500), (c) domain expert review to validate annotation quality. For a truly production-ready classifier on a Vietnamese-specific domain, realistic total cost is $5,000–$20,000 and 4–8 weeks elapsed time. The $50–$150 GPU cost framing risks setting incorrect client expectations.

**Challenge 3: R-β's tech stack optimizes for global availability, not Vietnam constraints**

R-β recommends NVIDIA Triton Inference Server, A100 GPUs on AWS Singapore, and MLflow on self-hosted VPS as the production stack. This is technically sound for a well-funded team. However, for a Vietnamese SME customer or a startup building its first CV product: (a) A100 spot pricing in Singapore AWS is ~$3/hr — a 200-hour training run costs $600, which is significant relative to a $50,000 ACV contract; (b) Triton adds operational complexity that requires DevOps expertise that is scarce in Vietnam; (c) for most Vietnamese deployments, a simpler stack (FastAPI + ONNX Runtime on a T4 instance, or direct Ultralytics Python serving) delivers sufficient performance at 30–50% lower infrastructure cost and 50% lower engineering overhead. R-β presents an idealized production stack that suits a mature AI team, not an early-stage Vietnamese deployment.

**Challenge 4: R-α understates the regulatory and ethical dimension**

R-α's taxonomy and concept coverage is thorough, but Section 8 (Evolution Timeline) ends at 2026 technical milestones without any mention of the regulatory environment. Face analysis and recognition (Sub-field 8 in R-α's taxonomy) is categorized identically to object detection — as if it is a neutral technical capability. In the Vietnam context, facial recognition deployments carry material legal and reputational risk under Decree 13/2023/ND-CP. The research report should have flagged this as a primary contextual constraint.

**Challenge 5: Multimodal convergence threat to standalone CV products**

R-α notes the trend of "Foundation Models as Universal Vision Backbones" (Section 5, Emerging Trends) but treats it as a technical opportunity. From a business feasibility perspective, this is also a competitive threat. GPT-4o and Gemini 2.0 Flash can now perform object detection, image classification, and visual QA via a single API call at $0.00015–$0.001 per image. For many Vietnamese SME use cases, the correct answer is "call a multimodal API" rather than "build a fine-tuned YOLO model." R-α and R-β both assume the build-or-fine-tune paradigm without adequately questioning whether that paradigm is economically justified for commodity CV tasks in 2026.

---

### 8. Build vs Buy vs Fine-tune vs API Analysis

For Vietnamese companies, the decision framework is as follows:

**Use off-the-shelf API (Google Vision AI, AWS Rekognition, Azure CV, GPT-4o):**
- When: standard tasks (face detection, object classification, OCR on clean documents, content moderation, celebrity recognition)
- When data privacy is not a concern (data leaves Vietnam to foreign cloud)
- When volume is <500,000 images/month (below which API cost < infrastructure cost)
- When accuracy on Western-distributed data is sufficient for the task
- Cost: $0.001–$0.003/image; ~$500–$1,500/month at 500K images
- Risk: no control over model updates; data sovereignty; vendor lock-in

**Fine-tune a pretrained model (YOLOv8, ViT, CLIP):**
- When: task is standard but the domain is Vietnam-specific (Vietnamese products, license plates, factory defects, local faces)
- When labeled data can be collected at 500–5,000 images (feasible in 2–4 weeks)
- When inference must run on-premise or on edge hardware (data privacy, latency, connectivity)
- When volume is high enough that API cost exceeds model hosting cost (~$2,000–$5,000/month threshold)
- Cost: $200–$2,000 training + $200–$500/month inference hosting
- Recommended approach for most P1 and P2 use cases in Vietnam

**Build custom architecture from scratch:**
- Almost never justified for a Vietnamese company in 2026
- Exception: novel task with no relevant pretrained model (very rare); or a company with a 10+ year research mandate (VinAI-type)
- Cost: prohibitive (6–18 months, 5–10 senior ML engineers, $100K–$1M GPU spend)
- Not recommended

**Hybrid (API + fine-tune):**
- Use a large foundation model (GPT-4o, Claude Vision, Gemini) for zero-shot or few-shot tasks during prototyping
- When production accuracy or cost requires it, distill to a smaller fine-tuned model
- This is the optimal path for most Vietnamese product companies: fast iteration with APIs, cost optimization with fine-tuning at scale
- Practical example: prototype a retail shelf detection product using GPT-4o Vision → generate pseudo-labels for 10,000 images → fine-tune YOLOv8m → deploy on-premise at $0.0001/image instead of $0.003/image

---

### 9. Regulatory & Compliance Landscape

**Vietnam:**

- **Decree 13/2023/ND-CP (Personal Data Protection Decree)**: In effect since September 2023. Classifies facial geometry, iris, fingerprint, and genetic data as **sensitive personal data** (nhom du lieu nhay cam). Requires explicit written consent for collection; designates a Data Protection Officer for data controllers processing sensitive data; mandates breach notification within 72 hours. Any CV product capturing and storing facial recognition data must comply. Violation penalties: administrative fines up to VND 100 million (~$4,000) — low by global standards but reputational risk is higher. This decree is actively enforced.

- **Cybersecurity Law (Law 24/2018/QH14)**: Requires localization of data about Vietnamese users within Vietnam for certain categories of services. Impacts cloud-based CV systems that store biometric data on foreign cloud infrastructure.

- **Draft AI Law (2025 consultation)**: Vietnam is drafting an AI governance framework (expected finalization 2026–2027). Early drafts include provisions on high-risk AI systems (including face recognition in public spaces) requiring conformity assessment. This mirrors the EU AI Act approach. Any face recognition product deployed today should be designed to comply with this coming framework.

- **Ministry of Public Security regulations**: Public surveillance systems in Vietnam must be approved and potentially connected to government monitoring infrastructure in certain use cases. This creates a procurement dependency — a pure software vendor cannot deploy city-scale surveillance independently.

**GDPR (if exporting to EU customers):**
- Any Vietnamese AI company processing personal data of EU residents (e.g., providing CV services to EU-based clients) must comply with GDPR.
- Biometric data under GDPR Article 9 is a special category requiring explicit consent or a specific legal basis (not just legitimate interest).
- Standard Contractual Clauses (SCCs) required for data transfers from EU to Vietnam (Vietnam is not an adequacy decision country).
- Practical impact: if building a product for EU export, data architecture must separate Vietnamese and EU data processing pipelines.

**PCI-DSS (if integrating with retail payment flows):**
- Retail CV use cases (checkout automation, product recognition linked to payment) may intersect with cardholder data environments.
- PCI-DSS v4.0 requires that any system in scope maintains strict access control and audit logging.
- Practical advice: keep CV inference pipeline architecturally separated from payment processing; do not log raw images in PCI-in-scope systems.

**Export Control:**
- Some CV models trained on US military/defense-funded datasets carry export control implications (EAR99 or ECCN classification). Standard commercial models (CLIP, YOLO, ViT) have no export restrictions, but any model fine-tuned for weapons detection, military target recognition, or drone guidance may fall under dual-use controls. Vietnamese companies should review export control status before deploying CV in defense-adjacent applications.

---

### 10. Recommendations

#### Short-term (0–6 months): Prove value in one vertical

1. **Select one P1 use case** — the strongest recommendation is Manufacturing Quality Control or License Plate Recognition. Both have clear ROI ($X saved per defect caught; $Y saved per manual gate check eliminated), well-defined technical scope, and buyers with budget.
2. **Run one paid proof-of-concept** at $15,000–$30,000 fixed fee on a real client's data. Do not do free pilots — they attract poor-quality clients and devalue the product.
3. **Build a Vietnamese-specific dataset for that vertical** from day one. This dataset becomes a proprietary asset. Invest $5,000–$15,000 in professional annotation. Use Label Studio for workflow, SAM2 for assisted annotation.
4. **Do not build an API platform yet.** Build a focused solution — a single model, a single deployment pipeline, a single client dashboard. Complexity kills early-stage AI products.
5. **Evaluate the Build vs API decision honestly per task.** For tasks where GPT-4o Vision achieves >90% of required accuracy, ship that first. Reserve fine-tuning for where the accuracy or data privacy gap justifies the investment.

#### Medium-term (6–18 months): Productize and expand

1. **Productize the first vertical** into a repeatable deployment. Create a standard onboarding process: data collection template, annotation playbook, deployment checklist, model retraining SLA. Reduce time-to-production from 8 weeks to 3 weeks.
2. **Expand to a second vertical** — if started in manufacturing, add retail or logistics. The technical stack is largely shared; the value is in vertical-specific datasets and domain knowledge.
3. **Build a data flywheel**: structure client contracts to retain anonymized, aggregate inference data (with consent) for model improvement. Each deployment generates training data for the next. This is the key moat against API competitors — they do not own Vietnamese domain-specific data.
4. **Invest in edge deployment capability**: ONNX + TensorRT on Jetson Orin NX. Many Vietnamese factory and retail clients want on-premise deployment for data privacy and connectivity reasons. Edge deployment also eliminates ongoing cloud cost, enabling better SaaS margin.
5. **Do not enter face recognition in public spaces until the regulatory framework is finalized.** Track the AI Law consultation process. Position access-control face recognition (consented, premises-only) as separate from surveillance.

#### Long-term (18+ months): Strategic positioning

1. **The defensible position for a Vietnamese CV company is the data layer, not the model layer.** Models will continue to be commoditized by foundation models. What is not commoditized is: (a) proprietary Vietnamese domain datasets, (b) deep integration into client workflows, (c) local support and customization capacity that foreign vendors cannot provide cost-effectively.
2. **Consider vertical SaaS over horizontal infrastructure.** A "CV platform" is competing with Google, AWS, and Azure — a war a Vietnamese company cannot win. A "quality control intelligence system for Vietnamese electronics manufacturers" or a "smart retail analytics platform for Vietnamese FMCG" is a different and winnable competition.
3. **Monitor foundation model capabilities quarterly.** The GPT-4o and Gemini trajectory means that in 24–36 months, many fine-tuning use cases will be replaced by prompt engineering on sufficiently powerful APIs. Position to be the integration layer, workflow layer, and data layer — not purely the model layer.
4. **Pursue government smart city contracts cautiously.** The revenue opportunity is large but: procurement cycles are 12–24 months, requirements often favor hardware-bundled Chinese vendors, and regulatory risk (especially face recognition) is highest in this segment. Do not build your business model around government contracts as primary revenue.
5. **Invest in talent development now.** The CV talent gap is the most structural constraint identified in this analysis. A company that builds a systematic program for training mid-level engineers into CV specialists — through internal knowledge sharing, conference participation, and structured mentorship — will have a 12–18 month advantage over competitors relying solely on external hiring.

---

*Feasibility Report completed by Dr. Sentinel (R-γ), Chief Evaluation & Feasibility Analyst, MAESTRO Knowledge Graph Platform. Phase 1, Module B03, Task 1.3. Date: 2026-03-31.*
