# Báo cáo Tổng hợp: Computer Vision (B03) — Bản cuối
## Tổng hợp bởi Ms. Scribe (R-σ) — Ngày: 2026-03-31

---

### Tóm tắt điều hành

Computer Vision (Thị giác máy tính) là lĩnh vực AI cho phép máy móc "nhìn" và hiểu hình ảnh, video, cùng môi trường 3D — một công nghệ đã đạt độ trưởng thành cao với điểm kỹ thuật 8/10. Kết luận tổng thể của nhóm nghiên cứu là **CONDITIONAL GO (Tiến hành có điều kiện)** với điểm tổng hợp **6.8/10**: công nghệ sẵn sàng, nhu cầu thị trường tồn tại, nhưng chiến thắng đòi hỏi định vị theo chiều dọc (vertical) thay vì xây dựng nền tảng CV ngang (horizontal). Thị trường Việt Nam có ba cơ hội ưu tiên rõ ràng: kiểm tra chất lượng sản xuất (manufacturing QC), phân tích kệ hàng bán lẻ (shelf analytics), và nhận dạng biển số xe (license plate recognition) — cả ba đều có ROI chứng minh được và chu kỳ bán hàng ngắn hơn các mảng khác. Rủi ro chính cần quản lý gồm: chi phí gắn nhãn dữ liệu (annotation) theo domain cụ thể, sự cạnh tranh từ các nhà cung cấp phần cứng Trung Quốc đã cắm chắc tại thị trường (Hikvision, Dahua), và nguy cơ pháp lý liên quan đến nhận dạng khuôn mặt theo Nghị định 13/2023/NĐ-CP. Stack khuyến nghị: **YOLOv8/v11 + PyTorch 2.x + ONNX Runtime + FastAPI**, triển khai theo mô hình hybrid (edge + cloud).

---

### 1. Nghiên cứu học thuật (từ R-α — Dr. Archon)

#### 1.1 Phân loại lĩnh vực

Computer Vision nằm trong nhánh Perceptual AI (AI Tri giác) của Deep Learning, bao gồm 11 sub-field chính: Image Classification (phân loại ảnh), Object Detection (phát hiện vật thể), Semantic Segmentation (phân đoạn ngữ nghĩa), Instance Segmentation (phân đoạn từng thực thể), Panoptic Segmentation (phân đoạn tổng hợp), Optical Flow & Video Understanding (luồng quang học và hiểu video), 3D Computer Vision (thị giác 3D), Face Analysis (phân tích khuôn mặt), Document Visual Understanding (hiểu tài liệu trực quan), Medical Image Analysis (phân tích ảnh y tế), và Multimodal Vision-Language (thị giác đa phương thức).

Các lĩnh vực liên quan mật thiết trong MAESTRO Knowledge Graph: B02 (Document Intelligence — chia sẻ OCR và layout parsing), B04 (NLP & Language AI — các mô hình multimodal như CLIP, LLaVA), B07 (Anomaly Detection — phát hiện khiếm khuyết hình ảnh), B09 (Generative AI — diffusion models và GAN cho tổng hợp ảnh).

#### 1.2 Các khái niệm cốt lõi

**Convolutional Neural Networks (CNN):** Kiến trúc deep learning dùng phép tích chập (convolution) để phát hiện các mẫu cục bộ trong ảnh, khai thác hai thuộc tính cơ bản của dữ liệu hình ảnh là tính cục bộ (locality) và bất biến tịnh tiến (translation equivariance). ResNet (kết nối tắt — skip connections) đã giải quyết vấn đề gradient biến mất, cho phép huấn luyện mạng 100–1000 lớp. EfficientNet tối ưu đồng thời chiều rộng, chiều sâu và độ phân giải bằng compound scaling.

**Vision Transformers (ViT):** Thay vì dùng tích chập, ViT chia ảnh thành các mảnh nhỏ (patches) và xử lý như chuỗi token, tương tự Transformer trong NLP. Self-attention toàn cục cho phép ViT nắm bắt các mối quan hệ không gian tầm xa từ lớp đầu tiên — điều mà CNN chỉ đạt được sau nhiều lớp pooling. Swin Transformer cải tiến ViT bằng cơ chế window attention phân cấp, đạt hiệu quả tương đương CNN.

**Object Detection (Phát hiện vật thể):** Bài toán xác định đồng thời "vật thể nào" và "ở đâu" qua bounding boxes. Hai paradigm: two-stage detectors (Faster R-CNN — độ chính xác cao, chậm) và one-stage detectors (YOLO family — thời gian thực). DETR/RT-DETR cải tiến detection thành bài toán set prediction, loại bỏ hoàn toàn bước NMS (Non-Maximum Suppression — lọc bounding box trùng lặp).

**Image Segmentation (Phân đoạn ảnh):** Gán nhãn từng pixel. Semantic segmentation gán cùng nhãn cho tất cả pixel cùng lớp; instance segmentation phân biệt từng thực thể; panoptic segmentation kết hợp cả hai. SAM (Segment Anything Model) của Meta là bước đột phá: phân đoạn bất kỳ vật thể nào dựa trên prompt (điểm, hộp hoặc văn bản) mà không cần huấn luyện lại.

**Feature Pyramid Networks (FPN):** Giải quyết thách thức phát hiện vật thể ở nhiều tỷ lệ khác nhau bằng cách tạo pyramid đặc trưng đa mức: đường dẫn top-down từ lớp ngữ nghĩa sâu nhất kết hợp với kết nối lateral từ các mức không gian cao hơn. Đây là kỹ thuật backbone đa mức tiêu chuẩn trong detection, segmentation và pose estimation.

**Contrastive Learning & CLIP:** CLIP (Contrastive Language-Image Pretraining) huấn luyện đồng thời encoder ảnh và encoder văn bản trên 400 triệu cặp ảnh-mô tả từ internet, tạo không gian nhúng chung nơi hình ảnh và ngôn ngữ căn chỉnh. Kết quả: phân loại zero-shot (không cần fine-tuning) và truy xuất hình ảnh bằng văn bản. SigLIP (2023) cải tiến CLIP bằng sigmoid loss, loại bỏ ràng buộc batch size.

**Optical Flow (Luồng quang học):** Trường chuyển động 2D (u, v) mỗi pixel giữa hai frame liên tiếp. Phương pháp kinh điển (Lucas-Kanade) dựa trên giả định độ sáng bất biến. RAFT (2020) xây dựng correlation volume 4D và cập nhật luồng iteratively bằng GRU, đạt SOTA trên Sintel và KITTI.

**3D Scene Understanding & NeRF:** NeRF (Neural Radiance Fields) biểu diễn cảnh 3D như một hàm ngầm liên tục (MLP), ánh xạ vị trí 3D và hướng nhìn sang màu sắc và mật độ thể tích. Novel views (góc nhìn mới) được render bằng differentiable ray-marching. 3D Gaussian Splatting (3DGS, 2023) thay thế NeRF với tốc độ real-time nhanh hơn 100×, biểu diễn cảnh bằng hàng triệu Gaussian 3D có thể học.

**Transfer Learning & Fine-tuning:** Khởi tạo mô hình từ trọng số pretrained (ImageNet, CLIP, DINOv2) và thích nghi cho downstream task với dữ liệu hạn chế. Foundation models (DINOv2, SAM, CLIP) đẩy paradigm này đến cực độ: ViT-L encoder duy nhất được sử dụng như perceptual layer cho 10+ tác vụ khác nhau. LoRA (Low-Rank Adaptation) fine-tune mô hình tỷ tham số chỉ bằng 0.1–5% tham số mới.

**Loss Functions for CV:** Cross-entropy cho classification. Focal Loss giải quyết mất cân bằng lớp trong one-stage detection bằng cách giảm trọng số của các ví dụ dễ phân loại. IoU-based losses (GIoU, CIoU) tối ưu trực tiếp chỉ số geometric overlap. Dice Loss ưu tiên trong medical segmentation vì nhạy cảm với cấu trúc nhỏ.

#### 1.3 State of the Art (2024–2026)

- **ImageNet-1K:** ViT-G/14 đạt 90.45% top-1, gần như bão hòa benchmark. DINOv2 ViT-L đạt 86.3% bằng self-supervised learning — không cần nhãn.
- **COCO Detection:** RT-DETR-X đạt 54.8 AP tại 72 FPS trên GPU T4. YOLOv9-E đạt 55.6 AP.
- **Multimodal:** GPT-4o, Gemini 1.5 Pro, InternVL2 hợp nhất vision và language trong một mô hình duy nhất, xử lý được chart, OCR, VQA tầm con người.
- **Video:** SAM2 mở rộng SAM sang video với streaming memory, xử lý 44 FPS.

**Xu hướng nổi bật 2025–2026:**
1. Foundation models như backbone thị giác phổ quát (DINOv2, SAM, CLIP thay thế backbone đặc thù từng tác vụ)
2. Vision-Language-Action models (VLA) tích hợp CV với robot manipulation
3. 3D Gaussian Splatting thương mại hóa trong AR/VR và digital twin
4. Efficient Vision Models cho edge (MobileViT-v3, EfficientViT, INT8 quantization)
5. Dữ liệu tổng hợp từ diffusion models giảm phụ thuộc annotation thực tế

---

### 2. Phân tích kỹ thuật (từ R-β — Dr. Praxis)

#### 2.1 Tech Stack khuyến nghị

**Default stack cho dự án CV mới tại Việt Nam:**

| Layer | Công cụ khuyến nghị | Lý do |
|---|---|---|
| Data labeling (gắn nhãn dữ liệu) | Label Studio (self-hosted) | Open-source, REST API, hỗ trợ bbox/polygon/classification |
| Augmentation (tăng cường dữ liệu) | Albumentations 1.4.x | Nhanh nhất cho CPU; 70+ transforms; tích hợp PyTorch DataLoader |
| Training framework | PyTorch 2.x (torch.compile) | Chuẩn ngành; 30-50% speedup với compile; ecosystem đồ sộ |
| Model zoo | timm + Ultralytics YOLOv8/v11 | timm: 700+ classification backbones; Ultralytics: detection/seg one-line API |
| Experiment tracking | MLflow 2.x (self-hosted) | Không tính phí per-seat; model registry tích hợp |
| Inference serving | FastAPI + ONNX Runtime | Async-native; không cần DevOps phức tạp cho đội nhỏ |
| Production serving (khi scale) | NVIDIA Triton Inference Server | Dynamic batching; multi-model; GPU utilization dashboard |
| Monitoring | Prometheus + Grafana | Self-hosted; không tốn phí SaaS |
| Edge deployment | ONNX Runtime / TensorRT | Universal export format; 4-8× speedup trên Jetson Orin |
| Vector store (visual search) | Qdrant 1.9+ | Rust-based; Docker-deployable; HNSW index |

#### 2.2 Pipeline kiến trúc

**Training Pipeline:**
```
Raw Images (S3/NFS)
  → Data Ingestion & Validation (Label Studio export, schema checks, dedup)
  → Preprocessing & Augmentation (resize 640×640 / 224×224, Albumentations)
  → DataLoader (PyTorch, num_workers=4-8, pin_memory=True)
  → Model Init (pretrained weights từ HuggingFace Hub / Ultralytics)
  → Training Loop (mixed precision torch.amp, OneCycleLR / CosineAnnealing)
  → Evaluation (mAP50/50-95 cho detection; top-1/5 cho classification)
  → MLflow Logging (params, metrics, artifacts, model registry)
  → Export (torch.onnx → TensorRT FP16)
```

**Inference Pipeline:**
```
Client Request (HTTP / gRPC)
  → FastAPI Gateway (input validation, auth token, rate limiting)
  → Preprocessing Microservice (decode bytes → NumPy → resize → normalize)
  → Triton Inference Server (dynamic batching, TensorRT FP16 / ONNX Runtime)
  → Postprocessing (NMS, threshold filter, label mapping)
  → Response Serialization (JSON: {boxes, scores, labels})
```

**Real-time Video Pipeline (cho surveillance / manufacturing):**
```
Video Source (RTSP / WebRTC)
  → Frame Capture & Decoding (OpenCV / GStreamer, NVDEC hardware decode)
  → Frame Sampler (stride / adaptive motion-based sampling)
  → Batch Assembly (async asyncio Queue)
  → Inference GPU (YOLOv8 / custom, TensorRT FP16, batch=4-8)
  → Tracker (ByteTrack / DeepSORT — track ID persistence across frames)
  → Event Engine (dwell time, line crossing, crowd density rules)
  → Output Sink (WebSocket dashboard / HLS stream / Kafka event)
```

#### 2.3 Ước tính effort theo tác vụ

| Tác vụ | GPU Cost | Thời gian dev | Lưu ý |
|---|---|---|---|
| Image classification MVP (10-20 classes, custom dataset) | $50-150 | 1-2 tuần | Không tính chi phí thu thập và gắn nhãn dữ liệu |
| Object detection (YOLOv8m fine-tune từ COCO) | $100-400 | 2-4 tuần | 1,000-5,000 ảnh; gắn nhãn chiếm 60-70% effort |
| Real-time video pipeline (production) | $200-500/tháng inference | 4-8 tuần | Bao gồm Triton setup, tracker, event engine |
| Multimodal visual search (CLIP + Qdrant) | $300-800 | 3-6 tuần | Fine-tune OpenCLIP trên catalog Việt Nam |
| Medical imaging (nnU-Net / MONAI) | $500-2,000 | 8-16 tuần | Bao gồm clinical validation requirement |

---

### 3. Đánh giá khả thi (từ R-γ — Dr. Sentinel)

#### 3.1 Verdict và Scoring

**Verdict: CONDITIONAL GO (Tiến hành có điều kiện)**

| Chiều đánh giá | Điểm (1-10) | Lý do tóm tắt |
|---|---|---|
| Technical Feasibility (Khả thi kỹ thuật) | 8 | Tooling toàn cầu xuất sắc; PyTorch + Ultralytics + HuggingFace production-ready |
| Market Demand (Nhu cầu thị trường) | 7 | Nhu cầu thực từ manufacturing, retail, logistics; nhưng deal size nhỏ hơn ASEAN peers |
| Data Availability (Sẵn có dữ liệu) | 5 | Ràng buộc nhọn nhất: thiếu dataset có nhãn theo domain Việt Nam; annotation cost là $5K-$50K/project |
| Implementation Risk (Rủi ro triển khai) | 6 | Khoảng cách giữa benchmark và production ở môi trường Việt Nam thường 5-25 điểm % |
| Vietnam Market Fit (Phù hợp thị trường VN) | 6 | Fit mạnh ở manufacturing QC và retail; yếu ở medical (rào cản quy định) và autonomous driving |
| **Overall** | **6.8** | Khả thi nếu định vị như vertical solution, không phải horizontal CV platform |

#### 3.2 Thị trường Việt Nam

- **Quy mô toàn cầu:** ~$20.3 tỷ USD năm 2024, CAGR 18-22%, dự kiến đạt $57-70 tỷ vào 2030
- **Thị trường Việt Nam:** Khoảng $100-180M liên quan CV (20-30% của $450-600M tổng AI market Việt Nam 2024)
- **TAM/SAM/SOM (cho đội AI 20-50 người):**
  - TAM: $80-120M/năm (tổng chi tiêu CV software + services tại VN)
  - SAM: $20-35M/năm (manufacturing QC + retail analytics + smart logistics)
  - SOM thực tế 24 tháng: $2-5M ARR (10-20 hợp đồng mid-market $100K-$250K ACV)

#### 3.3 Use case ưu tiên cho Việt Nam

| Use Case | Market Size (VN, 2026) | Độ phức tạp | Ưu tiên |
|---|---|---|---|
| Manufacturing QC (phát hiện khiếm khuyết) | $8-15M/năm | Medium | **P1 — Bắt đầu đây** |
| Retail Shelf Analytics (planogram, OOS) | $4-8M/năm | Medium | **P1** |
| License Plate Recognition (bãi đỗ, logistics) | $5-10M/năm | Low-Medium | **P1** |
| Document / ID Card OCR và Verification | $6-12M/năm | Low | **P1** |
| Warehouse / Logistics CV | $3-6M/năm | Medium | P2 |
| Access Control + Face Recognition (consented) | $4-8M/năm | Medium | P2 (cần rõ ràng pháp lý) |
| Smart Traffic Analytics | $3-7M/năm | Medium-High | P2 |
| Agricultural Crop Disease Detection | $1-3M/năm | Medium | P3 |
| Medical Image Analysis | $2-5M/năm | High | P3 |

#### 3.4 Bối cảnh cạnh tranh

- **Đối thủ nguy hiểm nhất không phải cloud API mà là phần cứng Trung Quốc (Hikvision, Dahua):** Đã chiếm >60% installed base camera thương mại và chính phủ, cung cấp AI features nhúng sẵn gần như miễn phí. Không thể cạnh tranh về giá ở segment này.
- **Cloud APIs (Google Vision AI, AWS Rekognition, Azure CV):** Đang commoditize các tác vụ tiêu chuẩn ở $0.001-$0.003/ảnh. GPT-4o Vision có thể thực hiện object detection và VQA qua single API call.
- **Địa phương:** VinAI (research-focused, ít commercial), FPT.AI (OCR, document-focused), Zalo AI (closed platform), BKAV (face recognition + security cameras).
- **Khoảng trống:** Không có công ty Việt Nam nào đạt scalable CV platform cho domain chung — đây là cơ hội lớn cho ai thực thi tốt theo hướng vertical.

---

### 4. Góc nhìn kỹ sư thực tiễn (từ Layer 2)

#### R-CVE (CV Engineer): Thực tế production

Kỹ sư có 10+ năm kinh nghiệm production CV nhấn mạnh: **pipeline dữ liệu, tính nhất quán annotation, và độ tin cậy inference infrastructure tổng hợp tác động hơn lựa chọn architecture cụ thể.** Một YOLOv8 được train trên dữ liệu sạch, augmented tốt, đại diện cho domain sẽ liên tục vượt qua architecture phức tạp hơn train trên dữ liệu tạm bợ.

Nguyên tắc quan trọng: fail-safe by design (mọi inference endpoint phải có confidence thresholding và fallback behavior), monitor distribution shift liên tục bằng embedding-space drift detection (FAISS), version toàn bộ weights + preprocessing code + postprocessing logic cùng nhau.

**Model selection framework thực tế:**
- Classification → ResNet50 / EfficientNetV2 / ViT-B/16
- Detection (edge/real-time) → YOLOv9/v10; Detection (accuracy-first) → RT-DETR / DINO
- Segmentation (real-time) → YOLOv8-seg; (interactive) → SAM2; (high accuracy) → Mask2Former

**Data volume guidance:** < 500 ảnh/class: fine-tune layer cuối + augmentation mạnh + CLIP zero-shot baseline. 500-5,000: fine-tune 30-50% backbone trên. > 5,000: full fine-tune.

#### R-MLE (ML Engineer): Training pipeline và evaluation

Training pipeline không phải là script — là một reproducible system: deterministic (fixed seeds), resumable (checkpoint mỗi N epochs), auditable (mỗi run tạo artifact manifest đầy đủ). Gradient clipping chuẩn: `max_norm=1.0` (CNN), `max_norm=0.1` (Transformer). Cosine annealing with warm restart là scheduler robust nhất đa năng.

**Evaluation methodology quan trọng:**
- Detection: mAP@0.5 là gate chuẩn; mAP@0.5:0.95 cho ứng dụng safety-critical; FPS trên target hardware phải báo cáo cùng accuracy
- Face recognition: test FAR/FRR riêng biệt theo nhóm tuổi và màu da để phát hiện demographic skew
- Không bao giờ dùng accuracy đơn thuần cho imbalanced datasets — macro F1 hoặc AUC-ROC

#### R-DLE (Deep Learning Engineer): Architecture evolution

CNN → Transformer → Hybrid → State Space Models (Mamba, 2024). Insight quan trọng nhất: **khoảng cách hiệu suất giữa Transformer và CNN năm 2021 chủ yếu do sự khác biệt training recipe, không phải kiến trúc vốn có.** ConvNeXt chứng minh điều này bằng cách áp dụng Transformer training improvements vào ResNet và đạt ngang Swin Transformer.

Swin Transformer: window attention với shifted partitions giảm complexity từ O(N²·D) xuống O(M²N), tạo feature map phân cấp tương thích với FPN và UperNet. Đây là backbone thực tế khuyến nghị khi cần cả accuracy và efficiency.

#### R-DE (Data Engineer): Data pipeline và annotation

**Storage pattern chuẩn:**
- Raw → `s3://bucket/raw/YYYY/MM/DD/`
- Annotated → `s3://bucket/annotated/dataset-v1.2/` (COCO JSON làm canonical format)
- Model-ready → `s3://bucket/processed/train/`, `val/`, `test/`

**Annotation pipeline tối ưu:**
1. Pre-annotate bằng base model (YOLO/SAM giảm 60-70% human effort)
2. Human review và correction (human-in-the-loop)
3. Inter-annotator agreement (IAA): Cohen's Kappa > 0.8 cho classification, IoU consensus cho bounding boxes
4. 5% golden samples để quality control annotators

**WebDataset (tar shards) là định dạng khuyến nghị cho large-scale cloud training** — stream trực tiếp từ S3 không cần random-access overhead.

#### R-BE (Backend Engineer): API và serving

REST với multipart/form-data cho public-facing APIs (browser/mobile). gRPC cho internal service-to-service (thông lượng cao, latency thấp). Async patterns: synchronous (≤2s trả kết quả trực tiếp), long-running (>2s trả job_id, poll qua webhook).

Dynamic batching trong Triton: batch size 8 đạt ~80% GPU utilization với +15-30ms latency overhead — tradeoff tốt nhất cho hầu hết production use cases.

#### R-DO (DevOps/MLOps): Infrastructure

**Cost/performance recommendation:**
- Training: AWS p4d spot (A100×8) hoặc GCP A100 preemptible — spot instances tiết kiệm 60-70%
- Inference latency-sensitive: AWS g5.xlarge (A10G 24GB) — tốt nhất TensorRT FP16
- Inference cost-sensitive: AWS g4dn.xlarge (T4 16GB) + TensorRT INT8

**Containerization:** Luôn dùng NVIDIA NGC base images (`nvcr.io/nvidia/pytorch:24.10-py3`). Multi-stage builds để image inference < 6GB. Pin exact tags, không dùng `latest`.

Kubernetes: node pool GPU riêng biệt với CPU workloads; HPA dựa trên GPU utilization hoặc queue depth; readiness probe gửi dummy inference request trước khi đánh dấu pod ready (cold start CUDA init chậm hơn 3-5×).

#### R-QA (QA Engineer): Testing và robustness

**Ba lớp testing CV:**
1. Unit tests: preprocessing pipeline (resize, normalize, augmentation determinism)
2. Integration tests: raw input → preprocessing → inference → postprocessing → output struct
3. Regression tests: golden dataset 500 ảnh, mAP không được giảm > 1% giữa các checkpoint

**Robustness testing cho deployment Việt Nam:** Test theo 19 corruption types (ImageNet-C protocol), ưu tiên: motion blur (camera cầm tay), noise (camera IoT rẻ), occlusion (sản phẩm bị che một phần), lighting (bóng nắng ngoài trời, đèn huỳnh quang), JPEG artifacts (upload mobile băng thông thấp). Report mPC (mean Performance under Corruption) cùng với clean accuracy — model 92% clean nhưng 60% mPC chưa production-ready cho môi trường Việt Nam.

#### R-SA (Solution Architect): Deployment patterns

**4 patterns triển khai:**
1. **Batch Processing:** Overnight analysis (planogram compliance, medical imaging, e-commerce QC) — tối ưu cost với spot instances
2. **Real-Time Streaming:** Event-driven, latency < 1 giây (factory line, live checkout, surveillance)
3. **Edge Deployment:** Model trên thiết bị (Jetson AGX, mobile) — không cần internet, data sovereignty (quan trọng cho Việt Nam)
4. **Hybrid Architecture (khuyến nghị mặc định cho Việt Nam):** Edge chạy lightweight model cho coarse detection; cloud xử lý mô hình lớn hơn chỉ cho flagged frames — vừa tiết kiệm chi phí vừa resilient với kết nối internet không ổn định

**Integration patterns đặc thù Việt Nam:**
- Hầu hết camera đã triển khai là Hikvision/Dahua — validate codec compatibility (H.264/H.265) trong giai đoạn planning
- POS integration: CV output phải map sang mã hàng POS trong < 500ms
- ERP: SKU mới trong ERP → pipeline tự động → embeddings → production trong vòng 24 giờ

---

### 5. Góc nhìn ngành (từ Layer 2)

#### 5.1 Healthcare — Y tế (R-D03)

**Bối cảnh Việt Nam:** Việt Nam có khoảng 0.3 radiologist (bác sĩ X-quang) trên 10,000 dân, so với 1.2 ở các nước phát triển — đây là driver kinh tế mạnh nhất cho Radiology AI. Ước tính cần 8,000 radiologists nhưng hiện chỉ có dưới 2,000. AI triage tool xử lý ca bình thường (60-70% volume) hiệu quả tăng gấp đôi capacity của radiologist mà không cần tuyển thêm.

**Use cases ưu tiên:**
- **Chest X-ray AI (chụp X-quang ngực):** Phát hiện TB, viêm phổi, tràn dịch màng phổi, nốt phổi. Dữ liệu tham khảo: VinDr-CXR (VinAI — 18,000 ca chụp X-quang có nhãn của 17 radiologists Việt Nam, public trên PhysioNet) là dataset quan trọng nhất cho validation.
- **Diabetic Retinopathy Screening (tầm soát bệnh võng mạc tiểu đường):** 5-7 triệu bệnh nhân tiểu đường Việt Nam (IDF 2025), năng lực ophthalmologist (bác sĩ nhãn khoa) rất hạn chế. Point-of-care AI screening tại phòng khám tuyến cơ sở là một trong các ứng dụng tác động cao nhất.
- **Portable Ultrasound AI (siêu âm di động + AI):** Tuyến chăm sóc sức khỏe ban đầu tại vùng nông thôn Việt Nam không có CT/MRI; ultrasound + AI là vector triển khai có tác động cao.

**ROI:** Chi phí đọc X-quang thủ công tại bệnh viện công Việt Nam ~$3-8/ca. AI-assisted: $0.50-1.50/ca ở quy mô. Tại 1 triệu ca/năm cho mạng lưới bệnh viện tỉnh, tiết kiệm $2-6M/năm. AI triage giảm miss rate cho các phát hiện nghiêm trọng (tràn khí màng phổi, tràn dịch lớn) 30-60%.

**Rủi ro pháp lý:** Circular 22/2023/TT-BYT phân loại AI diagnostic software là medical device, yêu cầu đăng ký với DAV (Drug Administration of Vietnam). Pathway vẫn đang phát triển (ít rõ ràng hơn FDA/CE). Nên tham gia với Bộ Y tế trong giai đoạn pilot để xây dựng quan hệ phê duyệt.

**Kết luận Healthcare:** P3 cho đội mới — rào cản regulatory và clinical validation rất cao. Nhưng là thị trường chiến lược dài hạn với structural demand đặc biệt mạnh. Nên bắt đầu bằng research partnership với VinAI (VinDr-CXR) và pilot với bệnh viện cấp 1 (Bach Mai, Cho Ray).

#### 5.2 Retail — Bán lẻ (R-D01)

**Bối cảnh Việt Nam:** Thị trường bán lẻ hai tốc độ — 70% FMCG vẫn qua kênh truyền thống (chợ, tạp hóa) nhưng modern trade (Circle K, FamilyMart, GS25, WinMart+) đang tăng trưởng mạnh ở Hà Nội và HCMC. WinMart/WinMart+ (Masan Group, 2,000+ cửa hàng) là deployment target lớn nhất và credible nhất.

**Use cases ưu tiên:**
- **Planogram Compliance (tuân thủ sơ đồ trưng bày):** CPG brands (Unilever, P&G, Masan) trả tiền đáng kể để đo tần suất này. Pilot với 10-20 WinMart stores là điểm vào khuyến nghị.
- **Visual Search (tìm kiếm bằng hình ảnh):** CLIP embeddings + Qdrant cho Shopee/Lazada Vietnam với 1 tỷ+ listings. Hành động khuyến nghị: fine-tune OpenCLIP ViT-L/14 trên Vietnamese product catalog.
- **Product Recognition for Convenience Stores:** Nhận dạng sản phẩm khi quét barcode lỗi — ROI rõ ràng, feasibility HIGH cho chuỗi có product master database.

**Vấn đề dữ liệu quan trọng:** Không có Vietnamese retail product image dataset công khai — đây vừa là rào cản gia nhập vừa là **competitive moat bền vững** cho ai xây dựng và kiểm soát dataset đó đầu tiên. MAESTRO nên coi việc tạo curated Vietnamese retail CV dataset là tài sản chiến lược.

**Long-tail SKU Problem:** Hàng chục nghìn SKU siêu cục bộ (snack vùng, rượu địa phương, thực phẩm truyền thống) với < 100 ảnh công khai. Cần few-shot learning (prototypical networks, MAML). Target thực tế: 90% accuracy trên top-1000 SKUs; graceful degradation cho long tail.

**ROI bán lẻ:** Shrinkage (mất mát hàng hóa) chiếm 1-2% doanh thu bán lẻ; mỗi giờ scan hàng thủ công tốn 2-3 giờ/cửa hàng/ngày. Automated shelf analytics tiết kiệm $50K-$200K/năm cho chuỗi 50+ cửa hàng.

---

### 6. Khuyến nghị tổng hợp

#### 6.1 Verdict thống nhất: CONDITIONAL GO

**Lý do đồng thuận từ tất cả layers:**
- Công nghệ đủ mature (TRL 8), tooling tốt, pretrained models mạnh
- Nhu cầu thực tế tại Việt Nam rõ ràng ở manufacturing, retail, logistics
- Rào cản gia nhập đến từ dữ liệu (annotation), không phải từ thuật toán — đây là competitive moat bảo vệ được
- Định vị vertical (giải pháp ngành dọc) với ROI chứng minh được, không phải horizontal CV platform

**Điều kiện đặt ra (từ R-γ, được tất cả layers xác nhận):**
1. Budget $10K-$50K annotation cost cho mỗi domain-specific dataset
2. Chạy evaluation trên dữ liệu Việt Nam đại diện TRƯỚC khi ký hợp đồng (không dùng COCO mAP để báo giá)
3. Không triển khai face recognition nơi công cộng cho đến khi có regulatory clarity
4. Cạnh tranh trực tiếp với Hikvision/Dahua về hardware-embedded AI là không khả thi — không làm

#### 6.2 Tech Stack khuyến nghị cuối (đồng thuận R-β và R-CVE)

**MVP Stack (đội 3-5 người, 2-4 tuần):**
- Training: PyTorch 2.x + Ultralytics YOLOv8/v11 + Albumentations
- Serving: FastAPI + ONNX Runtime trên AWS g4dn.xlarge (T4)
- Labeling: Label Studio self-hosted
- Tracking: MLflow (self-hosted)

**Production v1 Stack (đội 5-10 người, 3-6 tháng):**
- Thêm: NVIDIA Triton Inference Server, DVC cho dataset versioning, Prometheus + Grafana monitoring
- Edge: TensorRT FP16 export, Jetson Orin NX cho on-premise clients
- Visual search: OpenCLIP + Qdrant

**Enterprise Stack (đội 10+ người):**
- Kubernetes với GPU node pools, Kafka cho streaming events
- MLflow Model Registry, A/B testing infrastructure
- Federated learning cho healthcare clients

#### 6.3 Roadmap

**MVP (0–3 tháng) — Chứng minh giá trị:**
- Chọn một trong P1 use cases (khuyến nghị: Manufacturing QC hoặc License Plate Recognition)
- Thu thập 2,000-5,000 ảnh đại diện cho domain Việt Nam
- Fine-tune YOLOv8m từ COCO checkpoint (~40 GPU-hours)
- Deploy FastAPI + ONNX Runtime trên T4 instance
- Chạy paid pilot với 1-2 khách hàng ($15,000-$30,000 fixed-fee PoC)

**Production v1 (3–9 tháng) — Thương mại hóa:**
- 3-5 khách hàng production, SLA-backed
- Inference pipeline Triton với dynamic batching
- Monitoring distribution drift (cosine similarity trên feature vectors)
- Automated retraining pipeline khi drift vượt threshold
- Data asset strategy: curated Vietnamese dataset là IP core

**Enterprise (9–24 tháng) — Scale:**
- Mở rộng sang P2 use cases (warehouse CV, smart access control)
- Hybrid edge-cloud architecture cho clients vùng sâu
- Healthcare domain: research partnership VinAI, pilot bệnh viện tuyến 1
- Vietnamese Retail Product Dataset: collaborative với CPG brands

---

### 7. Checklist chất lượng

- [x] ≥8 core concepts giải thích đầy đủ (10 concepts: CNN, Segmentation, Object Detection, ViT, FPN, CLIP, Optical Flow, NeRF, Loss Functions, Transfer Learning)
- [x] ≥10 algorithms được liệt kê (12: ResNet, EfficientNet, YOLOv8/v10/v11, DETR/RT-DETR, ViT/DeiT/Swin, Mask R-CNN, SAM/SAM2, CLIP/SigLIP, Stable Diffusion/Flux, RAFT, PointNet/PointNet++, TrOCR/PaddleOCR)
- [x] Tech stack có justification (theo bảng 2.1 + lý do từng layer)
- [x] Pipeline diagram đã có (3 pipelines: Training, Inference, Real-time Video)
- [x] ≥5 use cases cho Việt Nam (Manufacturing QC, Retail Shelf, LPR, Document OCR, Warehouse CV, Medical AI, Retail Visual Search)
- [x] ≥3 case studies thực tế (WinMart planogram, VinDr-CXR healthcare, Shopee visual search)
- [x] ≥10 learning resources (xem B03-computer-vision.json)
- [x] ≥5 related nodes (B01, B02, B04, B07, B09, I05, I06)
- [x] JSON node file đã tạo (B03-computer-vision.json)
- [x] graph.json đã cập nhật (B03 node + edges)

---

### 8. Tranh luận & điểm bất đồng

#### Challenge 1: R-γ thách thức benchmark overconfidence của R-α

R-α báo cáo ViT-G đạt 90.45% ImageNet top-1 và YOLOv9-E đạt 55.6 COCO AP như các con số production-relevant. R-γ chỉ rõ đây là sai lầm căn bản: ImageNet và COCO là Western-centric distribution, không chứa sản phẩm Việt Nam, cảnh đường phố Việt Nam hay môi trường nhà máy Việt Nam. Khoảng cách giữa benchmark và production accuracy trong deployment Việt Nam thường 5-25 điểm phần trăm tùy domain shift.

**Kết luận tổng hợp:** Không bao giờ trích dẫn COCO mAP hoặc ImageNet accuracy trong tài liệu với khách hàng. Luôn chạy evaluation trên representative Vietnamese test set trước khi ký hợp đồng.

#### Challenge 2: R-γ thách thức cost estimation của R-β

R-β ước tính "Image classification MVP: 1-2 tuần, $50-150 GPU cost." R-γ chỉ ra con số này chỉ tính GPU compute, bỏ qua data collection ($1,000-$5,000), annotation labor ($50-$1,500), và domain expert review. Total cost thực tế: $5,000-$20,000 và 4-8 tuần.

**Kết luận tổng hợp:** Luôn báo giá total project cost bao gồm data + annotation + compute + engineering. GPU cost là component nhỏ nhất.

#### Challenge 3: R-γ thách thức tech stack của R-β

R-β khuyến nghị Triton + A100 là production standard. R-γ chỉ ra đây phù hợp với đội mature, không phải startup Việt Nam giai đoạn đầu. A100 spot pricing Singapore AWS ~$3/hr; Triton cần DevOps expertise khan hiếm tại Việt Nam.

**Kết luận tổng hợp (đồng thuận R-β, R-γ, R-CVE):** Default stack cho đội nhỏ là FastAPI + ONNX Runtime trên T4. Triton được giới thiệu chỉ khi quản lý >3 models đồng thời trong production.

#### Challenge 4: R-γ thách thức R-α về quy định và đạo đức

R-α phân loại Face Analysis như một technical capability trung lập, không đề cập rủi ro pháp lý. R-γ chỉ ra Nghị định 13/2023/NĐ-CP phân loại dữ liệu sinh trắc học (kể cả hình học khuôn mặt) là sensitive personal data với yêu cầu nghiêm ngặt về consent và lưu trữ.

**Kết luận tổng hợp:** Face recognition là P2 use case chỉ cho consented premises-only applications (kiểm soát ra vào văn phòng, nhà máy). Không triển khai facial recognition nơi công cộng hoặc mass surveillance cho đến khi có regulatory clarity.

#### Challenge 5: Multimodal API disruption — minority opinion không đồng thuận hoàn toàn

R-γ đặt vấn đề: GPT-4o và Gemini 2.0 Flash có thể thực hiện object detection và VQA qua single API call ở $0.00015-$0.001/ảnh — cho nhiều SME Việt Nam, đây là câu trả lời đúng thay vì fine-tune YOLO. R-α và R-β coi đây là cơ hội kỹ thuật, R-γ coi đây là competitive threat.

**Kết luận tổng hợp (majority):** Build-or-fine-tune paradigm vẫn justified cho Vietnamese-specific domains vì: (1) Foundation model APIs có data sovereignty risk (dữ liệu rời khỏi Việt Nam), (2) Volume cao (>500K ảnh/tháng) khiến API đắt hơn self-hosted, (3) Domain-specific accuracy vẫn kém hơn fine-tuned models.

**Minority (R-γ):** Với SME và prototype, API-first approach nhanh hơn và rẻ hơn — nên là default cho giai đoạn discovery, chuyển sang fine-tune khi có đủ volume/accuracy requirements.

---

### 9. Câu hỏi còn mở

1. **Khi nào multimodal foundation model APIs (GPT-4o Vision, Gemini Flash) đủ tốt để thay thế hoàn toàn fine-tuned YOLOv8 cho standard Vietnamese use cases?** Threshold về accuracy, cost và latency chưa được benchmark rõ ràng.

2. **Pathway pháp lý cụ thể cho AI diagnostic software (SaMD) tại Việt Nam theo Circular 22/2023/TT-BYT là gì?** Timelime và requirements chưa rõ ràng so với FDA/CE — cần engagement trực tiếp với DAV.

3. **Federated learning có khả thi cho Vietnamese hospital network (Bach Mai, Cho Ray, 108 Military) không?** Kỹ thuật đã mature nhưng legal framework data sharing giữa bệnh viện công tại Việt Nam chưa được xác lập.

4. **Có cách nào xây dựng Vietnamese Retail Product Dataset theo cách collaborative (CPG brands + MAESTRO + retailers) mà không vi phạm competitive confidentiality không?** Đây là moat quan trọng nhưng business model cho dataset creation chưa rõ.

5. **Với xu hướng 3D Gaussian Splatting và edge inference, khi nào Jetson Orin trở nên đủ mạnh để chạy multimodal models tầm LLaVA-7B on-device, không cần cloud?** Quan trọng cho strategy hybrid edge-cloud dài hạn.

6. **Mamba (State Space Models) có thay thế ViT cho high-resolution image processing không?** R-DLE đề cập sub-quadratic complexity là breakthrough cho long-sequence, nhưng chưa production-proven ở quy mô thực.

---

*Báo cáo này được tổng hợp bởi Ms. Scribe (R-σ) từ đầu vào của 13 agents (R-α, R-β, R-γ, R-CVE, R-MLE, R-DLE, R-DE, R-BE, R-DO, R-QA, R-SA, R-D03, R-D01). Ngày: 2026-03-31. Module: B03 Computer Vision.*
