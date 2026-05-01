# Data Engineering Notes: B03 Computer Vision
## By R-DE — Date: 2026-03-31

---

### 1. CV Data Pipeline Architecture

A production-grade CV data pipeline follows a linear but branching flow:

```
[Ingestion] → [Validation] → [Preprocessing] → [Augmentation] → [Storage] → [Serving]
     ↑                                                                           ↓
[Source Systems]                                                        [Training / Inference]
```

**Ingestion layer:** Sources include cameras (RTSP streams), file uploads (S3 events, HTTP multipart), crawled web images, and partner data dumps. Use Apache Kafka or AWS Kinesis for streaming camera feeds. For batch ingestion, Apache Airflow DAGs triggered on S3 object creation work well. Always validate at the gate: check file integrity (MD5 hash), MIME type, resolution bounds, and channel count before writing to raw storage.

**Preprocessing layer:** Resize to model input resolution (e.g., 640x640 for YOLO, 224x224 for classification backbones). Normalize pixel values (ImageNet mean/std: `[0.485, 0.456, 0.406]` / `[0.229, 0.224, 0.225]`). Convert colorspace as needed (BGR→RGB for PyTorch). Reject corrupt files using Pillow's `ImageFile.LOAD_TRUNCATED_IMAGES = False` pattern.

**Augmentation layer:** Apply offline augmentations to increase dataset size; keep augmentation configs version-controlled. Online augmentation happens at training time via dataloader workers.

**Storage layer:** Raw images in object storage (S3/GCS). Processed/annotated datasets in structured format (COCO JSON, YOLO txt, Pascal VOC XML). Embeddings in vector databases (Qdrant, Weaviate). Metadata in PostgreSQL.

**Serving layer:** Model training reads from storage via PyTorch `DataLoader` with prefetch. Inference API reads from cache or object storage with signed URLs.

---

### 2. Image Data Formats & Storage

| Format | Compression | Alpha | Use Case |
|--------|-------------|-------|----------|
| JPEG | Lossy | No | Web photos, surveillance frames — small size |
| PNG | Lossless | Yes | Annotations, screenshots, medical — no artifacts |
| WebP | Lossy/Lossless | Yes | Web serving, CDN delivery — 25-35% smaller than JPEG |
| TIFF | Lossless | Yes | Satellite, medical imaging, archival — multi-page |
| HDF5 | Configurable | N/A | ML training batches — random access, stores arrays |

**Recommendations:**
- Store raw data as JPEG (quality 95) or PNG depending on source. Never re-compress already-compressed images.
- For large-scale training datasets, pack images into **HDF5** or **WebDataset (tar shards)** format. WebDataset is preferred for cloud training — it streams tar files directly from S3 with no random-access overhead: `wds.WebDataset("s3://bucket/shard-{000..999}.tar")`.
- LMDB is an alternative for fast local reads (used by MXNet-style pipelines).
- Tag images with EXIF metadata during ingestion. Strip EXIF before public serving (privacy).

**Cloud storage patterns:**
- Raw → `s3://bucket/raw/YYYY/MM/DD/`
- Annotated → `s3://bucket/annotated/dataset-v1.2/`
- Model-ready → `s3://bucket/processed/train/`, `val/`, `test/`
- Use S3 Intelligent-Tiering to move infrequently accessed data to cheaper storage automatically.

---

### 3. Data Annotation Pipeline

**Tool comparison:**

| Tool | Strengths | Best For | Pricing |
|------|-----------|----------|---------|
| Label Studio | Open source, flexible, AI-assisted | Multi-task, on-premise | Free / Enterprise |
| CVAT | Computer Vision focus, ONNX integration | Detection, segmentation | Open source |
| Roboflow | End-to-end, augmentation built-in | Fast iteration, small teams | Freemium |
| Scale AI | High quality, managed workforce | Large-scale production | Per-label |

**Recommended pipeline:**
1. Export raw images from object storage to Label Studio or CVAT (self-hosted on Kubernetes).
2. Pre-annotate using a base model (YOLO or SAM for segmentation) to reduce human effort by 60-70%.
3. Human annotators review and correct (human-in-the-loop).
4. Apply **inter-annotator agreement (IAA)** — use Cohen's Kappa for classification, IoU consensus for bounding boxes. Target Kappa > 0.8.
5. Export annotations to COCO JSON format as the canonical format. Convert to task-specific formats (YOLO, VOC) downstream.

**Quality control:**
- Keep 5% of each batch as "golden samples" with known ground truth. Annotators who fail golden samples below 90% accuracy are flagged.
- Track annotation velocity per user — sudden spikes indicate quality shortcuts.

---

### 4. Data Augmentation at Scale

**Library comparison:**

| Library | Speed | CPU/GPU | Flexibility |
|---------|-------|---------|-------------|
| Albumentations | Very fast | CPU (multiprocess) | High |
| torchvision.transforms v2 | Fast | CPU/GPU | Medium |
| imgaug | Moderate | CPU | High |
| NVIDIA DALI | Fastest | GPU | Medium |

**Albumentations — recommended default:**

```python
import albumentations as A
from albumentations.pytorch import ToTensorV2

train_transform = A.Compose([
    A.RandomResizedCrop(height=640, width=640, scale=(0.5, 1.0)),
    A.HorizontalFlip(p=0.5),
    A.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1, p=0.8),
    A.GaussNoise(var_limit=(10, 50), p=0.3),
    A.MotionBlur(blur_limit=7, p=0.2),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
], bbox_params=A.BboxParams(format='coco', label_fields=['class_labels']))
```

**Augmentation strategies by task:**
- **Classification:** Heavy geometric + color transforms. Use MixUp and CutMix at training time.
- **Object detection:** Mosaic augmentation (YOLOv5/v8 default) — combines 4 images. Careful with scale — don't make objects too small.
- **Segmentation:** Must apply identical transforms to image AND mask. Use `A.Compose` with `additional_targets={'mask': 'mask'}`.
- **Medical imaging:** Minimal color augmentation (clinical meaning). Focus on flips, rotation, elastic transforms.

For GPU-side augmentation at scale, use **NVIDIA DALI** — processes augmentation pipeline on GPU, eliminating CPU bottleneck for high-resolution images.

---

### 5. Video Data Processing

**Frame extraction:**
```bash
# Extract at 5 fps with ffmpeg
ffmpeg -i input.mp4 -vf fps=5 frames/%06d.jpg -hide_banner

# Extract keyframes only (scene changes)
ffmpeg -i input.mp4 -vf "select=eq(pict_type\,I)" -vsync vfr keyframes/%06d.jpg
```

Use **decord** library for Python-native random-access video reading — much faster than OpenCV for seeking: `vr = VideoReader(path, ctx=cpu(0)); frames = vr.get_batch([0, 15, 30])`

**Optical flow computation:**
- Classical: Farneback (OpenCV) — fast, good for simple motion
- Deep learning: RAFT (state-of-art) — better accuracy, GPU required
- For production temporal models (action recognition): pre-compute TVL1 optical flow and store alongside RGB frames as separate dataset

**Temporal sampling strategies:**
- **Uniform sampling:** Fixed interval — simple, misses fast motion
- **Dense sampling:** Every frame — storage expensive, high redundancy
- **Event-based sampling:** Extract frames only on scene change (PySceneDetect)
- **Random temporal crop:** During training, randomly sample a T-frame clip from the video

---

### 6. Dataset Versioning & Lineage

Use **DVC (Data Version Control)** alongside Git for full reproducibility:

```bash
dvc init
dvc add data/train/  # creates data/train.dvc pointer file
git add data/train.dvc .gitignore
git commit -m "Add training dataset v1.2"
dvc push  # push to S3/GCS remote
```

**Data Cards** — document every dataset version with:
- Source, collection method, date range
- Class distribution histogram
- Annotation tool and annotator count
- Known biases and limitations
- Train/val/test split sizes and split strategy (random vs. stratified vs. time-based)

**Split reproducibility:** Always use a fixed random seed and record it. For time-series video data, split by video ID (not frame ID) to prevent data leakage between splits.

---

### 7. Streaming Inference Pipeline

**Latency budget for real-time (30 FPS = 33ms per frame):**

```
Camera capture:        2ms
Network/decode:        3ms
Preprocessing:         3ms  ← keep tight, use GPU where possible
Model inference:      15ms  ← dominates; target with TensorRT
Postprocessing (NMS):  3ms
Result delivery:       5ms
Buffer:                2ms
Total:                33ms
```

**Architecture:**
```
[RTSP Camera] → [GStreamer/FFmpeg decoder] → [Frame Queue (Redis/ZMQ)]
    → [Preprocessing Worker] → [Inference Engine (TensorRT/ONNX)]
    → [Postprocessing Worker] → [Result Publisher (Redis Pub/Sub)]
    → [Consumer: Dashboard / Alert / Storage]
```

Use **ZeroMQ (ZMQ)** for inter-process communication — lower latency than Redis for pure messaging. Drop frames rather than queue them when inference falls behind: use a ring buffer of size 2-3 frames.

---

### 8. Vietnamese Dataset Landscape

**Publicly available Vietnamese CV datasets:**

| Dataset | Task | Size | Source |
|---------|------|------|--------|
| VinDr-CXR | Chest X-ray diagnosis | 18,000 scans | VinBigData / PhysioNet |
| VinDr-Mammo | Mammography screening | 20,000 scans | VinBigData |
| VNFOOD | Food recognition | ~15,000 images | Research papers |
| UIT-VFSC | Face spoofing | ~17,000 | UIT Vietnam |
| VHR10 (Vietnam subset) | Aerial/satellite | Limited | Academic |

**Known gaps:**
- Street scene / traffic detection datasets specific to Vietnamese road conditions (motorbike density, lane behaviors) — most existing datasets use Western or Chinese traffic.
- Vietnamese text OCR in natural scenes (signboards, menus) — limited coverage.
- Agricultural datasets (rice disease, crop monitoring specific to Mekong Delta crops).
- Retail product recognition for Vietnamese SKUs.

**Synthetic data generation options:**
- **DALL-E 3 / Stable Diffusion** with Vietnamese scene prompts for classification bootstrapping.
- **BlenderProc** for photorealistic synthetic object detection training data with automatic annotation.
- **CARLA simulator** adapted for Vietnamese traffic scenarios.
- Consider **data flywheel** strategy: deploy model early, collect real production data, re-annotate with active learning to target gap classes first.
