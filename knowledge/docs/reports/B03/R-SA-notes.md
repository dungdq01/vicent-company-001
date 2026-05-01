# Solution Architecture Notes: B03 Computer Vision
## By R-SA — Date: 2026-03-31

---

### 1. CV System Architecture Patterns

Four primary deployment patterns for CV systems, each with distinct trade-offs:

**Batch Processing**
Suitable for non-time-critical tasks: overnight planogram compliance analysis, medical imaging report queues, e-commerce product image quality checks. Use object storage (S3-compatible) as input/output. Process with GPU worker pools. Enables cost optimization via spot/preemptible instances. Typical latency: minutes to hours. Best for Vietnam hospital PACS workflows where radiologist review happens in shifts, not real-time.

**Real-Time Streaming**
Event-driven pipeline: camera frame → message queue (Kafka/Kinesis) → inference workers → results store → dashboard. Targets sub-second end-to-end latency. Requires GPU auto-scaling and queue depth monitoring. Appropriate for: live checkout lanes, security surveillance, factory defect detection on a production line.

**Edge Deployment**
Model runs on the device (Jetson AGX, Raspberry Pi 5, mobile phone). Eliminates cloud round-trip latency. Critical for: locations with unreliable internet (rural Vietnam clinics, traditional markets), data sovereignty requirements (patient data cannot leave the facility), and cost reduction at high camera density. Requires model compression: quantization (INT8), pruning, or distillation to fit hardware constraints.

**Hybrid Architecture**
Edge device runs a lightweight model for coarse detection or triggering; cloud runs a larger, more accurate model for final inference only on flagged frames. This pattern is cost-effective and resilient: system degrades gracefully to edge-only mode if cloud connectivity drops. Recommended default for Vietnam deployments given variable connectivity.

---

### 2. Integration Patterns

**ERP Integration**
CV output (detected SKU, quantity, location) must map to ERP product master via product code. Use a middleware service that translates CV recognition results to ERP item codes. Handle the many-to-one mapping problem: the same product may appear under multiple visual variants (regional packaging) but must map to a single ERP SKU. Expose results via REST API; use message queue for async ERP write-back to avoid tight coupling.

**Mobile App Integration**
Two patterns: (1) Server-side inference — app sends image to API endpoint, receives JSON results. Simple to update models. Requires network. (2) On-device inference — model embedded in app bundle (TFLite, Core ML, ONNX Runtime Mobile). Works offline. Increases app size by 20-100MB. For Vietnamese retail apps (Shopee, Grab), server-side is standard due to model complexity. For healthcare field workers in rural areas, on-device is preferred.

**IoT Camera Integration**
Use RTSP streams from IP cameras → OpenCV or GStreamer frame extraction → inference service. Manage camera health (heartbeat pings, frame rate monitoring). In Vietnam, most deployed cameras are Hikvision or Dahua (RTSP supported) — validate codec compatibility (H.264/H.265) during integration planning.

**Web App Integration**
Expose inference as REST or gRPC endpoints behind an API gateway. For user-facing annotation tools, use WebSocket for streaming results on video uploads. Return structured JSON: bounding boxes, confidence scores, class labels, processing time metadata.

---

### 3. Scalability Design

**Horizontal Scaling for Inference**
Inference services are stateless — scale horizontally via Kubernetes HPA triggered by GPU utilization or queue depth. Use node pools with GPU instances separate from CPU workloads to optimize cost. Partition workloads: high-priority (real-time) and batch queues with separate worker pools.

**Load Balancing**
For GPU inference, session affinity is not required — route requests round-robin. Use gRPC load balancing with health checks that validate model warmup status (first inference after cold start is 3-5x slower due to CUDA initialization). Implement readiness probes that send a dummy inference request before marking a pod as ready.

**Queue-Based Decoupling**
Decouple camera ingestion from inference processing. A traffic spike (e.g., rush hour at a retail store) fills the queue; workers drain it at their own pace. This prevents cascade failures. Use dead-letter queues for frames that fail inference after 3 retries — store them for offline analysis and alerting.

---

### 4. Build vs Buy vs Fine-tune Decision Matrix

| Scenario | Recommendation | Rationale |
|----------|---------------|-----------|
| General object/scene tagging | Buy (Google Vision / AWS Rekognition) | Commodity task; APIs are accurate; low engineering cost |
| Vietnamese product SKU recognition | Fine-tune (YOLO/EfficientDet base) | No off-the-shelf model covers Vietnamese retail; custom data required |
| Medical imaging (X-ray, CT) | Fine-tune (MONAI / BioViL base) | Regulatory requires domain-specific validation; general APIs inadequate |
| Face recognition (access control) | Buy (AWS Rekognition / Azure Face) | Mature APIs; reduces liability; adequate for standard use cases |
| Face recognition (demographic fairness critical) | Build with fairness constraints | APIs show known demographic bias; regulated contexts require auditability |
| Video surveillance anomaly detection | Fine-tune | Scene-specific; general models have high false-positive rates |
| Document / invoice OCR | Buy (AWS Textract / Google Document AI) | High accuracy on standard docs; cost-effective below 10M pages/month |
| Defect detection (manufacturing) | Build | Highly domain-specific; no public datasets; proprietary quality standards |

---

### 5. Reference Architecture: Retail CV System

```
[IP Cameras] ──RTSP──► [Edge Device: Jetson AGX]
                              │
                    [Frame Sampler + Lightweight Detector]
                              │
                    (Trigger on relevant frames only)
                              │
                    ──── HTTPS/gRPC ────►
                                        [API Gateway]
                                              │
                                    [Inference Service Pool]
                                    [GPU Workers: YOLO / CLIP]
                                              │
                                    [Result Enrichment Service]
                                    (SKU mapping → ERP codes)
                                              │
                              ┌───────────────┴───────────────┐
                              ▼                               ▼
                    [Time-Series DB]               [Event Stream: Kafka]
                    (shelf occupancy,               (POS integration,
                     dwell time, counts)             inventory triggers)
                              │
                    [Analytics Dashboard]
                    (store manager view,
                     planogram compliance %)
```

---

### 6. Reference Architecture: Medical Imaging System

```
[Imaging Device: CT/MRI/X-ray]
        │
        ▼
[DICOM Receiver / PACS Worklist]
        │
[Preprocessing Service]
(DICOM → NIfTI/PNG, windowing,
 normalization, anonymization)
        │
[AI Inference Service]
(MONAI Deploy App Server)
(Pathology detection, segmentation,
 severity scoring, confidence)
        │
        ├──► [DICOM SR / Structured Report]
        │    (attached back to PACS)
        │
        └──► [Radiologist Review UI]
             (AI overlay on DICOM viewer,
              accept/reject/modify workflow)
              │
        [Audit Log DB]
        (regulatory compliance,
         model version tracking,
         radiologist decision capture)
```

---

### 7. Total Cost of Ownership

Comparison at three volume levels (images/month):

| Volume | Cloud API (AWS Rekognition) | Custom Model (GPU server) | Custom Model (Cloud GPU) |
|--------|----------------------------|--------------------------|--------------------------|
| 100K | ~$100 | $800+ (fixed infra) | ~$150 |
| 1M | ~$1,000 | $800 (same infra) | ~$1,200 |
| 10M | ~$10,000 | $1,500 (scale slightly) | ~$8,000 |
| 100M | ~$100,000 | $4,000 (3 GPU servers) | ~$60,000 |

**Crossover point**: Custom model TCO becomes favorable at approximately 2-5M images/month depending on model complexity. For Vietnamese SME retailers processing under 500K images/month, cloud APIs are almost always the right economic choice. For hospital networks processing millions of scans annually, custom or fine-tuned models on owned infrastructure are justified.

---

### 8. Migration Path

**Stage 1: Rule-Based Image Processing**
OpenCV thresholding, contour detection, template matching. Fast to implement. Brittle — breaks with lighting changes or product variations. Suitable for highly controlled environments (fixed camera, fixed product, controlled lighting).

**Stage 2: Traditional ML on Hand-Crafted Features**
HOG + SVM for detection, SIFT/SURF for matching. More robust than rule-based. Still requires feature engineering expertise. Rarely the right choice for new projects in 2026 — skip directly to Stage 3.

**Stage 3: Deep Learning (Task-Specific Models)**
YOLO for detection, ResNet/EfficientNet for classification, U-Net for segmentation. Requires labeled dataset (500-10K samples depending on task). Current standard for production CV systems. Recommended entry point for most Vietnam enterprise projects.

**Stage 4: Foundation Models + Fine-tuning**
CLIP for zero-shot/few-shot classification, SAM (Segment Anything) for segmentation, Grounding DINO for open-vocabulary detection. Dramatically reduces labeled data requirements. Fine-tune with 50-200 examples for new classes. Recommended for projects with frequent product catalog changes (retail) or rare condition detection (medical). This is the current frontier as of 2026 for Vietnamese enterprise AI adoption.
