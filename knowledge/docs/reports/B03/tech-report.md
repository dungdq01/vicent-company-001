# Tech Report: Computer Vision (B03)
## By Dr. Praxis (R-β) — Date: 2026-03-31

---

### 1. Implementation Summary

Computer Vision production systems in 2026 converge on three decision points: **backbone selection** (CNN vs. ViT), **task paradigm** (classification / detection / segmentation / multimodal), and **deployment target** (cloud GPU, edge device, or real-time video). The recommended starting point for any new CV project is **Ultralytics YOLOv8/v11 + PyTorch 2.x + HuggingFace Transformers**, deployed via **FastAPI + ONNX Runtime or NVIDIA Triton**, with **MLflow** for experiment tracking. This stack is battle-tested, has excellent documentation, runs well on A100/T4/L4 GPUs accessible from Singapore AWS/GCP regions, and requires minimal DevOps expertise to operationalize. For multimodal or embedding-based tasks, add **CLIP (ViT-L/14) + Qdrant** as the visual search layer. Teams should default to fine-tuning pretrained models rather than training from scratch — a 12-class Vietnamese product detector can reach production quality in under 40 GPU-hours from a COCO-pretrained YOLOv8m checkpoint.

---

### 2. Tech Stack Decision Matrix

| Layer | Technology | Version | Alternatives | Why This One | Cost |
|---|---|---|---|---|---|
| Data ingestion & labeling | Label Studio | 1.x (self-hosted) | Roboflow, CVAT, Scale AI | Open-source, REST API, supports bounding box / polygon / classification, runs on a $20/mo VPS | Free (self-hosted) |
| Preprocessing & augmentation | Albumentations | 1.4.x | torchvision transforms, Kornia, imgaug | Fastest augmentation library for CPU; 70+ transforms; first-class PyTorch DataLoader integration | Free |
| Training framework | PyTorch 2.x | 2.3+ | TensorFlow 2.x, JAX/Flax | Industry standard for research and production; torch.compile() gives 30–50% speedup; massive ecosystem | Free |
| Model zoo / pretrained | HuggingFace `timm` + Ultralytics | timm 1.x, YOLOv8/11 | TorchVision models, MMDetection | `timm` has 700+ classification backbones; Ultralytics covers detection/segmentation with one-line API | Free |
| Experiment tracking | MLflow | 2.x | Weights & Biases, Neptune, ClearML | Self-hostable, no per-seat pricing, native PyTorch integration, model registry built-in | Free (self-hosted) |
| Model serving / inference | NVIDIA Triton Inference Server | 24.x | TorchServe, BentoML, Ray Serve | Batching, multi-model, GPU utilization dashboard, supports ONNX/TensorRT/PyTorch backends | Free |
| API layer | FastAPI | 0.111+ | Flask, Django REST, gRPC | Async-native, OpenAPI docs auto-generated, Pydantic validation, ~3× throughput vs Flask | Free |
| Monitoring | Prometheus + Grafana | Latest stable | Datadog, New Relic, Arize | Self-hosted, no SaaS cost; Grafana dashboards for latency P99, GPU utilization, prediction drift | Free (self-hosted) |
| Edge deployment | ONNX Runtime / TensorRT | ORT 1.18, TRT 10.x | TFLite, OpenVINO, Core ML | ONNX is the universal export format; TensorRT gives 4–8× speedup on NVIDIA edge (Jetson Orin) | Free |
| Vector store (visual search) | Qdrant | 1.9+ | Weaviate, Pinecone, pgvector | Rust-based, Docker-deployable, HNSW index, built-in filtering, free self-hosted tier | Free (self-hosted) |
| Dataset versioning | DVC | 3.x | LakeFS, Pachyderm | Git-like CLI for large file versioning; works with S3/GCS remote; integrates with MLflow | Free |

---

### 3. Pipeline Architecture

#### 3a. Training Pipeline

```
Raw Images (S3/NFS)
       │
       ▼
┌─────────────────┐
│  Data Ingestion  │  ── Label Studio exports → COCO / YOLO format JSON
│  & Validation    │  ── Schema checks, duplicate hash removal
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Preprocessing  │  ── Resize to 640×640 (detection) or 224×224 (classification)
│  & Augmentation │  ── Albumentations: HorizontalFlip, RandomBrightnessContrast,
└────────┬────────┘     MixUp, Mosaic (YOLO), CutOut
         │
         ▼
┌─────────────────┐
│  DataLoader     │  ── PyTorch DataLoader, num_workers=4–8, pin_memory=True
│  (Train/Val)    │  ── Stratified split, class-balanced sampler
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Model Init     │  ── Load pretrained weights (HuggingFace Hub / Ultralytics)
│  (Backbone+Head)│  ── Freeze backbone for first N epochs, then unfreeze
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Training Loop  │  ── Mixed precision (torch.amp.autocast)
│  + Scheduler    │  ── OneCycleLR or CosineAnnealingWarmRestarts
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Evaluation     │  ── mAP50, mAP50-95 (detection); top-1/top-5 acc (classification)
│  & Checkpointing│  ── Save best checkpoint by val mAP; early stopping patience=10
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MLflow Logging │  ── Params, metrics, artifacts, model signature registration
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Export         │  ── torch.onnx.export → ONNX → trtexec (TensorRT FP16)
└─────────────────┘
```

**Per-stage breakdown:**

| Stage | Input | Process | Output | Tools |
|---|---|---|---|---|
| Data ingestion | Raw images + label files | Format normalization, schema validation, dedup | Standardized COCO JSON + image dir | Label Studio export, Python scripts |
| Preprocessing | Raw images (varied size) | Resize, normalize (ImageNet mean/std), cache to disk | Normalized tensors, optional `.npy` cache | Albumentations, OpenCV |
| Augmentation | Normalized tensors | Geometric + color transforms; Mosaic/MixUp for detection | Augmented mini-batch | Albumentations, custom YOLO Mosaic |
| DataLoader | Disk images | Multi-process loading, collation, class balancing | PyTorch DataLoader batches | `torch.utils.data`, `WeightedRandomSampler` |
| Training | Batches + labels | Forward pass, loss, backward, optimizer step | Updated model weights | PyTorch 2.x, `torch.compile` |
| Evaluation | Val split | Inference → NMS → metric computation | mAP / accuracy scores | `torchmetrics`, Ultralytics val loop |
| Checkpointing | Best val metric | Save `.pth` + MLflow artifact | Model checkpoint + run ID | MLflow, `torch.save` |
| Export | `.pth` checkpoint | ONNX export, TensorRT conversion | `.onnx`, `.trt` engine | `torch.onnx`, `trtexec` |

---

#### 3b. Inference Pipeline (Production)

```
Client Request (HTTP / gRPC)
       │
       ▼
┌─────────────────┐
│  FastAPI Gateway │  ── Input validation (file type, size limit)
│                  │  ── Auth token check (API key / JWT)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Preprocessing  │  ── Decode image bytes → NumPy → resize → normalize
│  Microservice   │  ── GPU preprocessing with torchvision or PIL (CPU fallback)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Triton         │  ── Dynamic batching (max_batch_size=8, max_queue_delay=5ms)
│  Inference      │  ── Backend: TensorRT FP16 (GPU) or ONNX Runtime (CPU)
│  Server         │  ── Model ensemble support (backbone → head as DAG)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Postprocessing │  ── NMS for detection, argmax for classification
│                 │  ── Confidence threshold filter, class label mapping
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Response       │  ── JSON: {boxes, scores, labels} or {class, confidence}
│  Serialization  │  ── Optional: draw bounding boxes → return annotated image
└────────┬────────┘
         │
         ▼
   Client Response
```

**Per-stage breakdown:**

| Stage | Input | Process | Output | Tools |
|---|---|---|---|---|
| Gateway | HTTP multipart / JSON | Validation, auth, rate limiting | Validated image bytes | FastAPI, Pydantic, slowapi |
| Preprocessing | Raw bytes | Decode, resize, normalize, tensor conversion | Float32 tensor [B,C,H,W] | Pillow, OpenCV, torchvision |
| Batching | Individual requests | Dynamic batching queue (max wait 5ms) | Padded batch tensor | Triton built-in dynamic batcher |
| Inference | Batch tensor | TensorRT FP16 forward pass | Raw logits / feature maps | Triton + TensorRT engine |
| Postprocessing | Logits | NMS, threshold, label decode | Structured predictions | Python, `torchvision.ops.nms` |
| Serialization | Predictions dict | JSON serialization, optional visualization | HTTP response | FastAPI JSONResponse |

---

#### 3c. Real-time Video Pipeline

```
Video Source (RTSP / WebRTC / File)
       │
       ▼
┌─────────────────┐
│  Frame Capture  │  ── OpenCV VideoCapture or GStreamer pipeline
│  & Decoding     │  ── Hardware decode: NVDEC (NVIDIA) / VA-API (Intel)
└────────┬────────┘
         │  (frame queue, maxsize=30)
         ▼
┌─────────────────┐
│  Frame Sampler  │  ── Process every Nth frame (stride) OR keyframe detection
│                 │  ── Skip strategy: motion-based adaptive sampling
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Batch Assembly │  ── Accumulate K frames → send as batch to inference
│                 │  ── Async producer/consumer (asyncio Queue)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Inference      │  ── YOLOv8 (detection) or custom classifier
│  (GPU)          │  ── TensorRT engine, FP16, batch=4–8
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Tracker        │  ── ByteTrack / DeepSORT: associate detections across frames
│                 │  ── Maintain track IDs, track history, zone logic
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Event Engine   │  ── Rule engine: dwell time, line crossing, crowd density
│                 │  ── Emit events → Kafka / Redis Pub-Sub
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Output Sink    │  ── WebSocket push to frontend dashboard
│                 │  ── Write annotated frames to HLS stream or S3 clips
└─────────────────┘
```

**Per-stage breakdown:**

| Stage | Input | Process | Output | Tools |
|---|---|---|---|---|
| Frame capture | RTSP stream URL | Hardware decode, BGR frames | NumPy frames at native FPS | OpenCV, GStreamer, NVDEC |
| Frame sampling | Raw frames | Stride or motion-delta filter | Sampled frames subset | Custom Python, SSIM |
| Batch assembly | Individual frames | Async queue, batch collation | Tensor batch [B,3,H,W] | asyncio.Queue, torch.stack |
| Inference | Frame batch | TensorRT YOLOv8 forward | Detections per frame | Ultralytics, TensorRT |
| Tracking | Detections + frame | Kalman filter + IoU assignment | Tracked objects with IDs | ByteTrack, deep-sort-realtime |
| Event engine | Track state | Zone geometry checks, counters | Structured events | Shapely, custom rules |
| Output sink | Events + frames | Serialize, stream, store | WebSocket msgs, S3 clips | aiohttp, boto3, Kafka |

---

### 4. Key Code Patterns

#### 4a. Image Classification Fine-tuning (PyTorch + HuggingFace)

```python
# Fine-tuning ViT-base on a custom dataset with HuggingFace timm + PyTorch 2.x
# Assumes dataset structured as ImageFolder: data/train/{class_name}/*.jpg

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import timm
from torch.amp import autocast, GradScaler

# ── Config ──────────────────────────────────────────────────────────────
MODEL_NAME   = "vit_base_patch16_224.augreg_in21k_ft_in1k"  # timm model ID
NUM_CLASSES  = 12      # your class count
BATCH_SIZE   = 32
EPOCHS       = 20
LR           = 1e-4    # lower LR for pretrained backbone
FREEZE_EPOCHS = 5      # freeze backbone for first N epochs
DEVICE       = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ── Transforms ──────────────────────────────────────────────────────────
train_tfm = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.7, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])
val_tfm = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# ── Dataset & Loader ────────────────────────────────────────────────────
train_ds = datasets.ImageFolder("data/train", transform=train_tfm)
val_ds   = datasets.ImageFolder("data/val",   transform=val_tfm)
train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,
                          num_workers=4, pin_memory=True)
val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False,
                          num_workers=4, pin_memory=True)

# ── Model ────────────────────────────────────────────────────────────────
model = timm.create_model(MODEL_NAME, pretrained=True, num_classes=NUM_CLASSES)
model = model.to(DEVICE)
model = torch.compile(model)  # PyTorch 2.x: ~30% speedup on A100

# ── Optimizer & Scheduler ────────────────────────────────────────────────
# Separate LR for backbone vs head (differential LR)
backbone_params = [p for n, p in model.named_parameters() if "head" not in n]
head_params     = [p for n, p in model.named_parameters() if "head" in n]
optimizer = torch.optim.AdamW([
    {"params": backbone_params, "lr": LR * 0.1},  # slower for backbone
    {"params": head_params,     "lr": LR},
], weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.OneCycleLR(
    optimizer, max_lr=[LR * 0.1, LR],
    steps_per_epoch=len(train_loader), epochs=EPOCHS
)
criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
scaler    = GradScaler()  # for mixed precision

# ── Training Loop ────────────────────────────────────────────────────────
def freeze_backbone(model, freeze: bool):
    for name, param in model.named_parameters():
        if "head" not in name:
            param.requires_grad = not freeze

def run_epoch(loader, train=True):
    model.train() if train else model.eval()
    total_loss, correct = 0.0, 0
    ctx = torch.enable_grad() if train else torch.no_grad()
    with ctx:
        for imgs, labels in loader:
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
            with autocast(device_type="cuda"):
                logits = model(imgs)
                loss   = criterion(logits, labels)
            if train:
                optimizer.zero_grad()
                scaler.scale(loss).backward()
                scaler.unscale_(optimizer)
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                scaler.step(optimizer)
                scaler.update()
                scheduler.step()
            total_loss += loss.item() * imgs.size(0)
            correct    += (logits.argmax(1) == labels).sum().item()
    return total_loss / len(loader.dataset), correct / len(loader.dataset)

best_val_acc = 0.0
for epoch in range(EPOCHS):
    freeze_backbone(model, epoch < FREEZE_EPOCHS)
    train_loss, train_acc = run_epoch(train_loader, train=True)
    val_loss,   val_acc   = run_epoch(val_loader,   train=False)
    print(f"Epoch {epoch+1}/{EPOCHS} | "
          f"train_loss={train_loss:.4f} train_acc={train_acc:.4f} | "
          f"val_loss={val_loss:.4f} val_acc={val_acc:.4f}")
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), "checkpoints/best_vit.pth")
        print(f"  → Saved best model (val_acc={val_acc:.4f})")

# ── Export to ONNX ────────────────────────────────────────────────────────
model.load_state_dict(torch.load("checkpoints/best_vit.pth"))
model.eval()
dummy = torch.randn(1, 3, 224, 224, device=DEVICE)
torch.onnx.export(
    model, dummy, "exports/vit_classifier.onnx",
    input_names=["image"], output_names=["logits"],
    dynamic_axes={"image": {0: "batch"}, "logits": {0: "batch"}},
    opset_version=17
)
print("Exported to ONNX successfully.")
```

---

#### 4b. Object Detection with YOLOv8

```python
# YOLOv8 training + inference pattern using Ultralytics API
# Dataset must be in YOLO format: data/images/{train,val}/, data/labels/{train,val}/
# data.yaml defines class names and paths

from ultralytics import YOLO
import cv2
import numpy as np

# ── Training ─────────────────────────────────────────────────────────────
def train_detector():
    # Start from pretrained COCO checkpoint (recommended for most tasks)
    model = YOLO("yolov8m.pt")  # n/s/m/l/x variants — m is best default tradeoff

    results = model.train(
        data="data/data.yaml",
        epochs=100,
        imgsz=640,
        batch=16,              # adjust for GPU VRAM: 16GB → batch=16 for yolov8m
        device=0,              # GPU index
        workers=8,
        optimizer="AdamW",
        lr0=1e-3,
        lrf=0.01,              # final LR = lr0 * lrf
        momentum=0.937,
        weight_decay=5e-4,
        warmup_epochs=3,
        cos_lr=True,           # cosine LR schedule
        augment=True,          # built-in Mosaic, MixUp, copy-paste
        mixup=0.1,
        copy_paste=0.1,
        degrees=10.0,          # rotation augmentation
        translate=0.1,
        scale=0.5,
        fliplr=0.5,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        project="runs/detect",
        name="yolov8m_custom",
        save=True,
        save_period=10,        # save every 10 epochs
        patience=20,           # early stopping
        amp=True,              # mixed precision
        val=True,
        plots=True,
    )
    print(f"Best mAP50-95: {results.results_dict['metrics/mAP50-95(B)']:.4f}")
    return results

# ── Validation ────────────────────────────────────────────────────────────
def validate_detector(weights_path: str):
    model = YOLO(weights_path)
    metrics = model.val(data="data/data.yaml", imgsz=640, batch=32,
                        conf=0.001, iou=0.6, device=0)
    print(f"mAP50: {metrics.box.map50:.4f}")
    print(f"mAP50-95: {metrics.box.map:.4f}")
    print(f"Precision: {metrics.box.mp:.4f}")
    print(f"Recall: {metrics.box.mr:.4f}")
    return metrics

# ── Single-image Inference ────────────────────────────────────────────────
def infer_image(weights_path: str, image_path: str, conf_threshold=0.25):
    model = YOLO(weights_path)
    results = model.predict(
        source=image_path,
        conf=conf_threshold,
        iou=0.45,
        imgsz=640,
        device=0,
        verbose=False,
    )
    # Parse detections
    detections = []
    for r in results:
        boxes   = r.boxes.xyxy.cpu().numpy()    # [N, 4] in pixel coords
        scores  = r.boxes.conf.cpu().numpy()    # [N]
        classes = r.boxes.cls.cpu().numpy().astype(int)  # [N]
        names   = r.names                        # {0: 'cat', 1: 'dog', ...}
        for box, score, cls_id in zip(boxes, scores, classes):
            detections.append({
                "bbox": box.tolist(),   # [x1, y1, x2, y2]
                "score": float(score),
                "class_id": int(cls_id),
                "class_name": names[cls_id],
            })
    return detections

# ── Export to ONNX / TensorRT ─────────────────────────────────────────────
def export_detector(weights_path: str, format="onnx"):
    model = YOLO(weights_path)
    # format options: "onnx", "engine" (TensorRT), "tflite", "coreml"
    exported = model.export(
        format=format,
        imgsz=640,
        half=True,             # FP16 for TensorRT
        simplify=True,         # ONNX simplify
        opset=17,
        device=0,
    )
    print(f"Exported to: {exported}")
    return exported

# ── Batch inference on directory ──────────────────────────────────────────
def batch_infer(weights_path: str, images_dir: str):
    model = YOLO(weights_path)
    # Ultralytics handles batching internally
    results = model.predict(
        source=images_dir,    # dir, list of paths, or glob pattern
        conf=0.25,
        iou=0.45,
        imgsz=640,
        batch=32,
        stream=True,          # generator mode — low memory for large dirs
        device=0,
    )
    all_detections = {}
    for r in results:
        img_path = r.path
        dets = []
        for box, score, cls_id in zip(
            r.boxes.xyxy.cpu().numpy(),
            r.boxes.conf.cpu().numpy(),
            r.boxes.cls.cpu().numpy().astype(int)
        ):
            dets.append({"bbox": box.tolist(), "score": float(score),
                         "class_id": int(cls_id)})
        all_detections[img_path] = dets
    return all_detections
```

---

#### 4c. Production Inference API (FastAPI + Triton)

```python
# Production CV inference API with dynamic batching, async processing,
# Prometheus metrics, and Triton backend integration

import asyncio
import time
import io
import numpy as np
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from PIL import Image
import tritonclient.http as httpclient
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CV Inference API", version="1.0.0")

# ── Prometheus Metrics ────────────────────────────────────────────────────
REQUEST_COUNT   = Counter("cv_requests_total", "Total inference requests",
                           ["model", "status"])
LATENCY_HIST    = Histogram("cv_latency_seconds", "Inference latency",
                             ["model"], buckets=[.01, .05, .1, .25, .5, 1, 2])
BATCH_SIZE_HIST = Histogram("cv_batch_size", "Request batch size", ["model"],
                             buckets=[1, 2, 4, 8, 16, 32])

# ── Config ────────────────────────────────────────────────────────────────
TRITON_URL       = "localhost:8000"       # Triton HTTP endpoint
MODEL_NAME       = "yolov8_detector"
INPUT_NAME       = "images"
OUTPUT_NAMES     = ["output0"]            # Triton model output tensor names
IMG_SIZE         = 640
MAX_BATCH        = 8
CONFIDENCE_THRES = 0.25
IOU_THRES        = 0.45
CLASS_NAMES      = {0: "person", 1: "car", 2: "motorbike"}  # load from config

# ── Triton Client (singleton) ─────────────────────────────────────────────
triton_client: Optional[httpclient.InferenceServerClient] = None

@app.on_event("startup")
async def startup():
    global triton_client
    triton_client = httpclient.InferenceServerClient(url=TRITON_URL, verbose=False)
    if not triton_client.is_server_ready():
        raise RuntimeError("Triton server not ready at startup")
    logger.info("Triton client connected.")

# ── Request / Response Models ─────────────────────────────────────────────
class Detection(BaseModel):
    bbox:       List[float] = Field(..., description="[x1,y1,x2,y2] in pixel coords")
    score:      float
    class_id:   int
    class_name: str

class InferenceResponse(BaseModel):
    image_id:     str
    detections:   List[Detection]
    inference_ms: float

# ── Preprocessing (CPU) ───────────────────────────────────────────────────
def preprocess_image(image_bytes: bytes, img_size: int = IMG_SIZE) -> np.ndarray:
    """Decode bytes → RGB numpy → resize with letterbox → normalize to [0,1]."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    orig_w, orig_h = img.size
    # Letterbox resize (preserve aspect ratio)
    scale = img_size / max(orig_w, orig_h)
    new_w = int(orig_w * scale)
    new_h = int(orig_h * scale)
    img = img.resize((new_w, new_h), Image.BILINEAR)
    # Pad to square
    canvas = Image.new("RGB", (img_size, img_size), (114, 114, 114))
    canvas.paste(img, (0, 0))
    arr = np.array(canvas, dtype=np.float32) / 255.0   # [H,W,3] in [0,1]
    arr = arr.transpose(2, 0, 1)                        # [3,H,W]
    return arr, (orig_w, orig_h), scale

# ── Postprocessing (NMS) ──────────────────────────────────────────────────
def postprocess_output(raw: np.ndarray, orig_size, scale: float,
                        conf_thres=CONFIDENCE_THRES, iou_thres=IOU_THRES):
    """Parse YOLOv8 output tensor [1, num_classes+4, num_anchors] → detections."""
    import torchvision
    import torch
    pred = torch.from_numpy(raw[0])                     # [num_classes+4, 8400]
    pred = pred.T                                        # [8400, num_classes+4]
    boxes_xywh = pred[:, :4]
    scores     = pred[:, 4:]                             # [8400, num_classes]
    # Convert xywh → xyxy
    x, y, w, h = boxes_xywh.unbind(-1)
    boxes_xyxy = torch.stack([x - w/2, y - h/2, x + w/2, y + h/2], dim=-1)
    # Filter by max class confidence
    max_scores, class_ids = scores.max(dim=-1)
    keep_mask = max_scores > conf_thres
    boxes_xyxy = boxes_xyxy[keep_mask]
    max_scores = max_scores[keep_mask]
    class_ids  = class_ids[keep_mask]
    # NMS
    keep_idx = torchvision.ops.nms(boxes_xyxy, max_scores, iou_thres)
    boxes_xyxy = boxes_xyxy[keep_idx].numpy()
    max_scores = max_scores[keep_idx].numpy()
    class_ids  = class_ids[keep_idx].numpy().astype(int)
    # Rescale to original image coordinates
    orig_w, orig_h = orig_size
    boxes_xyxy /= scale
    boxes_xyxy[:, [0, 2]] = np.clip(boxes_xyxy[:, [0, 2]], 0, orig_w)
    boxes_xyxy[:, [1, 3]] = np.clip(boxes_xyxy[:, [1, 3]], 0, orig_h)
    return boxes_xyxy.tolist(), max_scores.tolist(), class_ids.tolist()

# ── Core Inference (calls Triton) ─────────────────────────────────────────
def run_triton_inference(batch: np.ndarray) -> np.ndarray:
    """Send batch [B,3,H,W] to Triton, return raw output."""
    inp = httpclient.InferInput(INPUT_NAME, batch.shape, "FP32")
    inp.set_data_from_numpy(batch)
    out = httpclient.InferRequestedOutput(OUTPUT_NAMES[0])
    response = triton_client.infer(MODEL_NAME, inputs=[inp], outputs=[out])
    return response.as_numpy(OUTPUT_NAMES[0])

# ── API Endpoint: Single image ────────────────────────────────────────────
@app.post("/v1/detect", response_model=InferenceResponse)
async def detect_single(file: UploadFile = File(...)):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(400, "Unsupported image format")
    t0 = time.perf_counter()
    image_bytes = await file.read()
    if len(image_bytes) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(413, "Image too large (max 20MB)")
    try:
        arr, orig_size, scale = preprocess_image(image_bytes)
        batch = arr[np.newaxis, ...]             # [1,3,640,640]
        raw = await asyncio.get_event_loop().run_in_executor(
            None, run_triton_inference, batch    # run blocking call in thread pool
        )
        boxes, scores, class_ids = postprocess_output(raw, orig_size, scale)
        detections = [
            Detection(bbox=b, score=s, class_id=c,
                      class_name=CLASS_NAMES.get(c, "unknown"))
            for b, s, c in zip(boxes, scores, class_ids)
        ]
        inference_ms = (time.perf_counter() - t0) * 1000
        LATENCY_HIST.labels(model=MODEL_NAME).observe(inference_ms / 1000)
        REQUEST_COUNT.labels(model=MODEL_NAME, status="success").inc()
        return InferenceResponse(
            image_id=file.filename, detections=detections,
            inference_ms=round(inference_ms, 2)
        )
    except Exception as e:
        REQUEST_COUNT.labels(model=MODEL_NAME, status="error").inc()
        logger.error(f"Inference error: {e}")
        raise HTTPException(500, f"Inference failed: {str(e)}")

# ── Prometheus metrics endpoint ───────────────────────────────────────────
@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/health")
def health():
    ready = triton_client.is_server_ready() if triton_client else False
    return {"status": "ok" if ready else "degraded", "triton": ready}
```

---

#### 4d. Embedding-based Visual Search (CLIP + Qdrant)

```python
# Build a visual search engine using CLIP embeddings indexed in Qdrant
# Use case: product catalog search, similar image retrieval, content moderation

import io
import uuid
from pathlib import Path
from typing import List, Optional
import numpy as np
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct,
    Filter, FieldCondition, MatchValue, SearchParams
)

# ── Config ────────────────────────────────────────────────────────────────
CLIP_MODEL_ID   = "openai/clip-vit-large-patch14"   # 768-dim embeddings
QDRANT_URL      = "http://localhost:6333"
COLLECTION_NAME = "product_images"
VECTOR_DIM      = 768
BATCH_SIZE      = 64      # images per CLIP forward pass
DEVICE          = "cuda" if torch.cuda.is_available() else "cpu"

# ── Initialize CLIP ────────────────────────────────────────────────────────
def load_clip():
    model     = CLIPModel.from_pretrained(CLIP_MODEL_ID).to(DEVICE)
    processor = CLIPProcessor.from_pretrained(CLIP_MODEL_ID)
    model.eval()
    # torch.compile for inference speedup (PyTorch 2.x)
    # model = torch.compile(model, mode="reduce-overhead")
    return model, processor

# ── Compute image embeddings ──────────────────────────────────────────────
@torch.no_grad()
def embed_images(images: List[Image.Image], model, processor) -> np.ndarray:
    """Return L2-normalized CLIP image embeddings [N, 768]."""
    inputs = processor(images=images, return_tensors="pt",
                       padding=True).to(DEVICE)
    feats  = model.get_image_features(**inputs)  # [N, 768]
    feats  = feats / feats.norm(dim=-1, keepdim=True)  # L2 normalize
    return feats.cpu().numpy().astype(np.float32)

@torch.no_grad()
def embed_text(texts: List[str], model, processor) -> np.ndarray:
    """Return L2-normalized CLIP text embeddings [N, 768]."""
    inputs = processor(text=texts, return_tensors="pt",
                       padding=True, truncation=True).to(DEVICE)
    feats  = model.get_text_features(**inputs)
    feats  = feats / feats.norm(dim=-1, keepdim=True)
    return feats.cpu().numpy().astype(np.float32)

# ── Initialize Qdrant collection ──────────────────────────────────────────
def init_collection(client: QdrantClient):
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_DIM,
                                        distance=Distance.COSINE),
        )
        print(f"Created collection '{COLLECTION_NAME}'")
    else:
        print(f"Collection '{COLLECTION_NAME}' already exists")

# ── Index images from a directory ────────────────────────────────────────
def index_image_directory(
    images_dir: str,
    model, processor,
    client: QdrantClient,
    metadata_fn=None   # optional: callable(path) → dict of extra payload fields
):
    """Index all .jpg/.png images in a directory into Qdrant."""
    paths = list(Path(images_dir).rglob("*.jpg")) + \
            list(Path(images_dir).rglob("*.png"))
    total_indexed = 0
    for i in range(0, len(paths), BATCH_SIZE):
        batch_paths = paths[i:i + BATCH_SIZE]
        images, valid_paths = [], []
        for p in batch_paths:
            try:
                images.append(Image.open(p).convert("RGB"))
                valid_paths.append(p)
            except Exception as e:
                print(f"  [WARN] Could not open {p}: {e}")
        if not images:
            continue
        embeddings = embed_images(images, model, processor)
        points = []
        for emb, path in zip(embeddings, valid_paths):
            payload = {"filename": path.name, "path": str(path)}
            if metadata_fn:
                payload.update(metadata_fn(path))
            points.append(PointStruct(
                id=str(uuid.uuid4()),
                vector=emb.tolist(),
                payload=payload,
            ))
        client.upsert(collection_name=COLLECTION_NAME, points=points)
        total_indexed += len(points)
        print(f"  Indexed {total_indexed}/{len(paths)} images...")
    print(f"Done. Total indexed: {total_indexed}")
    return total_indexed

# ── Query: image-to-image search ──────────────────────────────────────────
def search_by_image(
    query_image: Image.Image,
    model, processor,
    client: QdrantClient,
    top_k: int = 10,
    category_filter: Optional[str] = None,
) -> List[dict]:
    """Find the top_k most visually similar images."""
    query_emb = embed_images([query_image], model, processor)[0]
    filt = None
    if category_filter:
        filt = Filter(must=[FieldCondition(
            key="category",
            match=MatchValue(value=category_filter)
        )])
    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_emb.tolist(),
        query_filter=filt,
        limit=top_k,
        search_params=SearchParams(hnsw_ef=128),  # higher ef → more accurate
        with_payload=True,
    )
    return [{"score": r.score, **r.payload} for r in results]

# ── Query: text-to-image search (zero-shot) ───────────────────────────────
def search_by_text(
    query_text: str,
    model, processor,
    client: QdrantClient,
    top_k: int = 10,
) -> List[dict]:
    """Find images matching a text description — no training required."""
    query_emb = embed_text([query_text], model, processor)[0]
    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_emb.tolist(),
        limit=top_k,
        with_payload=True,
    )
    return [{"score": r.score, **r.payload} for r in results]

# ── Example usage ────────────────────────────────────────────────────────
if __name__ == "__main__":
    model, processor = load_clip()
    client = QdrantClient(url=QDRANT_URL)
    init_collection(client)

    # Index a product catalog
    index_image_directory("data/products/", model, processor, client,
                          metadata_fn=lambda p: {"category": p.parent.name})

    # Text search
    hits = search_by_text("red running shoes", model, processor, client, top_k=5)
    for h in hits:
        print(f"  score={h['score']:.3f}  file={h['filename']}")

    # Image search
    query_img = Image.open("query_shoe.jpg").convert("RGB")
    hits = search_by_image(query_img, model, processor, client, top_k=5)
    for h in hits:
        print(f"  score={h['score']:.3f}  file={h['filename']}")
```

---

### 5. Production Considerations

| Aspect | Requirement | Approach | Cost Estimate |
|---|---|---|---|
| GPU requirements | Classification fine-tune (ViT-B) | 1× A100 40GB or 2× RTX 3090 24GB | AWS `p3.2xlarge` ~$3/hr (Singapore) |
| GPU requirements | YOLOv8m detection training | 1× A100 or T4 16GB (batch=16) | GCP `n1-standard-8` + T4 ~$0.80/hr |
| GPU requirements | Production inference | T4 16GB handles 60 req/s @640px | T4 reserved ~$0.35/hr on GCP |
| Latency SLA | Interactive API (web/mobile) | < 100ms p99 per image | TensorRT FP16 + Triton batching |
| Latency SLA | Async batch processing | < 5s per batch of 32 images | ONNX Runtime or PyTorch batch |
| Latency SLA | Real-time video (CCTV) | < 33ms/frame (30 FPS) | TensorRT engine on edge GPU |
| Throughput | API production target | 100 req/s sustained | 2× T4 behind load balancer |
| Throughput | Batch ETL pipeline | 10,000 images/hr | 1× A100, batch=64, ONNX |
| Model versioning | A/B testing new models | MLflow Model Registry + feature flags | MLflow free (self-hosted) |
| A/B testing | Gradual traffic splits | NGINX `split_clients` or Istio weight | Infrastructure cost only |
| Fallbacks | GPU failure / OOM | CPU ONNX Runtime fallback path in FastAPI | Latency degrades 5–10× |
| Fallbacks | Low-confidence predictions | Return "unknown" + log for human review | Human review queue (Label Studio) |
| Data drift | Input distribution shift | Log prediction confidence histogram | Prometheus + Grafana alert |
| Security | Adversarial inputs | Input validation, file type check, size limit | Code-level, no extra cost |

---

### 6. Framework Comparison

| Framework | Best For | Learning Curve | Community | Production Readiness |
|---|---|---|---|---|
| **PyTorch 2.x** | Research, custom architectures, fine-tuning | Medium | Huge (dominant in 2026) | High — `torch.compile`, TorchServe, ONNX export |
| **TensorFlow 2.x** | Legacy enterprise, TFX pipelines, TFLite | Medium-High | Large (declining) | High — but ecosystem fragmentation is a concern |
| **JAX/Flax** | Large-scale research, TPU training, custom optimizers | High | Growing (Google teams) | Medium — deployment tooling less mature than PyTorch |
| **HuggingFace Transformers** | ViT, CLIP, BLIP, LLaVA, any pretrained model | Low-Medium | Enormous | High — Hub + Inference API + Spaces ecosystem |
| **Ultralytics (YOLOv8/v11)** | Real-time detection, segmentation, pose, tracking | Low | Large (very active) | Very High — CLI + Python API, one-line export to 10+ formats |
| **MMDetection** | Research-grade detection benchmarks, paper reproduction | High | Medium | Medium — production deployment requires extra work |
| **Detectron2** | Facebook-style detection/segmentation research | High | Medium (Pytorch-native) | Medium — strong for Mask R-CNN family, less so for YOLO |

**Recommended decision path:**
- New project (detection): **Ultralytics YOLOv8/v11** — fastest time to production
- New project (classification / embedding): **timm + HuggingFace Transformers**
- Research reproduction: **MMDetection or Detectron2**
- Multimodal: **HuggingFace Transformers (CLIP, LLaVA, InstructBLIP)**
- Edge/mobile: **PyTorch → ONNX → TensorRT / TFLite**

---

### 7. Effort Estimation

| Scope | Duration | Team Size | GPU Cost | Notes |
|---|---|---|---|---|
| Image classification MVP (10–20 classes, custom dataset) | 1–2 weeks | 1 ML engineer | $50–150 (A100 spot, 20–40 hrs) | Fine-tune EfficientNet-B4 or ViT-B/16; labeled dataset of 500–2000 images per class |
| Object detection — production (5–20 classes, COCO-pretrained) | 3–5 weeks | 2 ML engineers + 1 DevOps | $200–500 (training + labeling iteration) | Label 2000–5000 images; YOLOv8m; 3 training iterations; Triton deployment |
| Real-time video analytics (CCTV, multi-camera) | 6–10 weeks | 2 ML + 1 backend + 1 DevOps | $300–800 (T4 × 2 reserved 1 month) | Detector + tracker + rule engine + dashboard; latency tuning; streaming infra |
| Foundation model fine-tuning (SAM, CLIP, ViT-L) | 4–8 weeks | 2 ML engineers | $500–2000 (A100 × 2–4, 100–200 hrs) | LoRA/adapter fine-tuning reduces cost; SAM2 fine-tune for domain-specific segmentation |
| Medical / industrial defect detection (regulated domain) | 3–6 months | 3 ML + 1 domain expert + 1 DevOps | $1000–3000 | Data collection, annotation quality, compliance, shadow deployment, clinical validation |

---

### 8. Recommended Starter Stack for Vietnamese Teams

#### Minimal Viable Stack (Low budget — < $200/month total infra)

Suitable for: startup proof-of-concept, freelance projects, university labs.

- **Training:** Google Colab Pro ($12/mo) or Kaggle free T4 notebooks
- **Labeling:** Label Studio (free, self-hosted on $5/mo Vultr VPS or localhost)
- **Framework:** Ultralytics YOLOv8 (classification + detection in one library) + timm
- **Experiment tracking:** MLflow (localhost or free-tier Railway.app deployment)
- **Inference API:** FastAPI + ONNX Runtime on CPU ($10/mo DigitalOcean droplet)
- **Model storage:** HuggingFace Hub free private repo (5GB) or Cloudflare R2 (free 10GB)
- **Vector search:** Qdrant Docker on local machine or free cloud tier
- **Total infra cost:** ~$30–60/month (no GPU inference — batch or async acceptable)
- **Bottleneck:** No persistent GPU → training must be done in short Colab sessions; export to ONNX for CPU inference

#### Growth Stack (Series A company — $1,000–5,000/month cloud budget)

Suitable for: product teams shipping CV features to 10k–100k users.

- **Training:** AWS `p3.2xlarge` (V100 16GB) spot instances, ~$1/hr; or GCP Spot A100 ~$1.5/hr
- **Labeling:** Label Studio Enterprise self-hosted OR Roboflow Teams ($249/mo)
- **Framework:** PyTorch 2.x + timm + Ultralytics + HuggingFace Transformers
- **Experiment tracking:** MLflow on EC2 t3.small + S3 artifact store (~$30/mo)
- **Inference:** 1–2× AWS `g4dn.xlarge` (T4 16GB) reserved, ~$0.35–0.70/hr; Triton Inference Server
- **API layer:** FastAPI behind AWS ALB, ECS Fargate for horizontal scaling
- **Monitoring:** Prometheus + Grafana on EC2 t3.micro (~$10/mo)
- **Vector search:** Qdrant on EC2 r6g.large (~$100/mo) or Qdrant Cloud (managed)
- **CI/CD:** GitHub Actions → ECR → ECS Blue/Green deployment
- **AWS Singapore region** (`ap-southeast-1`): ~50ms latency from Vietnam; no data sovereignty issues for most use cases

#### Enterprise Stack (Large org — >$10,000/month, 1M+ images/day)

Suitable for: banks, telcos, large retailers with compliance requirements.

- **Training cluster:** AWS `p4d.24xlarge` (8× A100 80GB) or SageMaker Training Jobs with spot (70% cost reduction)
- **Labeling:** Scale AI or Labelbox with QA workflow and workforce management
- **Data platform:** AWS S3 + DVC + Apache Spark for large-scale preprocessing
- **Experiment tracking:** Weights & Biases Teams ($50/user/mo) or self-hosted MLflow on EKS
- **Inference:** NVIDIA Triton on EKS with Karpenter GPU node autoscaling; Kubernetes HPA on custom GPU utilization metrics
- **Model registry:** SageMaker Model Registry + approval workflows
- **A/B testing:** AWS CloudWatch + custom feature flag service (LaunchDarkly)
- **Monitoring:** Arize AI or Evidently AI for model drift + Prometheus/Grafana for infra
- **Security:** Private VPC, VPN-only model endpoints, AWS Macie for PII in images
- **Compliance:** AWS Artifact for SOC2/ISO27001; model cards and audit logs for regulated industries (banking, healthcare)

---

### 9. Known Limitations & Workarounds

| Issue | Symptom | Root Cause | Workaround |
|---|---|---|---|
| **GPU OOM during training** | `RuntimeError: CUDA out of memory` | Batch size too large, gradients accumulating | Reduce batch size; use `torch.cuda.empty_cache()`; gradient accumulation: `loss = loss / accum_steps` before `.backward()` |
| **BatchNorm in production** | Model behaves differently in eval vs. train | `model.eval()` freezes BN running stats; BN sensitive to small batch sizes | Always call `model.eval()` before inference; for small-batch training, replace BN with GroupNorm or LayerNorm |
| **ONNX export fails** | `torch.onnx.export` traceback on control flow | Dynamic shapes, Python loops, non-exportable ops | Use `torch.jit.script` first; set `dynamic_axes`; avoid Python conditionals inside `forward()`; use `opset_version=17` |
| **Model versioning conflicts** | `timm` or `transformers` version mismatch loads wrong config | Checkpoint saved with different library version | Pin exact versions in `requirements.txt`; save full config dict alongside `.pth`; use MLflow model signatures |
| **Letterbox vs. crop preprocessing mismatch** | Inference accuracy lower than training benchmark | Training used random crop; inference uses letterbox (or vice versa) | Ensure `val_tfm` and production preprocessing are identical; save preprocessing config as artifact |
| **NMS threshold tuning** | Too many / too few detections in production | IOU threshold not tuned for domain | Always validate NMS params on production sample data; expose as API parameter; default `iou=0.45, conf=0.25` for general use |
| **Class imbalance in training** | Model ignores rare classes | Dataset heavily skewed | Use `WeightedRandomSampler` in DataLoader; focal loss (`gamma=2`); oversample rare classes via augmentation |
| **CLIP embedding drift** | Visual search returns irrelevant results after domain shift | CLIP pretrained on web images; domain-specific images (medical, industrial) are out-of-distribution | Fine-tune CLIP with domain images + text using SigLIP loss; or use DINOv2 features which generalize better |
| **Triton model cold start** | First request has 2–5s latency | TensorRT engine compiles on first load | Pre-warm model by sending dummy requests at container startup; `model_warmup` config in Triton `config.pbtxt` |
| **Real-time video frame drops** | Tracker loses IDs, detections skip frames | Inference latency > frame interval | Reduce model size (YOLOv8n/s for edge); increase frame stride; use async frame queue with drop policy |

---

### 10. Vietnam-Specific Considerations

#### Cloud Availability

| Provider | Nearest Region | Latency from Hanoi/HCM | GPU Instances Available | Notes |
|---|---|---|---|---|
| **AWS** | Singapore (`ap-southeast-1`) | ~20–40ms | p3 (V100), p4d (A100), g4dn (T4), g5 (A10G) | Most complete CV instance portfolio; SageMaker available |
| **GCP** | Singapore (`asia-southeast1`) | ~25–45ms | T4, A100, L4 | Vertex AI good for managed training; Spot VMs save 60–80% |
| **Azure** | Singapore (`southeastasia`) | ~20–40ms | NC (T4/V100), ND (A100) | Less popular in Vietnam startup ecosystem |
| **Viettel IDC / VNPT IDC** | Hanoi/HCM (on-premise) | <5ms | Typically no GPU, custom contracts only | Only for regulated data (banking, government) requiring on-prem |
| **FPT Cloud** | Vietnam | <5ms | Limited GPU catalog; contact sales | Useful for data sovereignty requirements |

#### Local GPU Rental

- **vast.ai** — International but accessible from Vietnam; community-owned H100/A100/3090 rigs from $0.25–$1.50/hr; good for training runs where latency does not matter
- **RunPod.io** — Similar to vast.ai; GPU pod pricing $0.20–$2/hr; community cloud option is cheapest
- **Colab Pro/Pro+** — Most Vietnamese ML engineers start here; $12–50/mo; reliable A100 access in Pro+
- **Local GPU workstations** — RTX 3090 24GB (~30M VND, ~$1,200 USD) is the recommended first local GPU investment for a CV team; handles YOLOv8x training and ViT-B fine-tuning

#### VRAM Budget Guide for Common Tasks

| Task | Min VRAM | Recommended VRAM | GPU Option (Vietnam budget) |
|---|---|---|---|
| YOLOv8n/s training (batch=16) | 4GB | 8GB | RTX 3060 12GB or T4 (cloud) |
| YOLOv8m training (batch=16) | 8GB | 16GB | RTX 3090 or T4 16GB (cloud) |
| ViT-B/16 fine-tuning (batch=32) | 10GB | 16–24GB | RTX 3090 or A10G (cloud) |
| CLIP ViT-L/14 embedding (batch=64) | 12GB | 16GB | T4 or RTX 3090 |
| YOLOv8x training (batch=8) | 14GB | 24GB | RTX 3090 24GB or A100 |
| SAM / SAM2 fine-tuning | 24GB | 40–80GB | A100 40GB or A100 80GB (cloud) |
| LLaVA-13B visual instruction tuning | 40GB | 80GB | A100 80GB × 2 (cloud only) |

#### Cost Optimization for Vietnam Teams

1. **Use Spot/Preemptible instances for all training** — GCP Spot A100 is 60–80% cheaper than on-demand; save checkpoints every 10 epochs to restart if preempted.
2. **Export to ONNX for inference** — CPU ONNX Runtime on a $20/mo VPS can handle 2–5 req/s; sufficient for early-stage products.
3. **Free tiers** — HuggingFace Hub (model hosting), Qdrant Cloud (free tier: 1 collection, 1M vectors), Railway.app (MLflow hosting), GitHub Actions (CI/CD).
4. **Batch async processing** — Avoid real-time GPU endpoints for non-interactive workloads; queue images, process in batch on a scheduled Lambda or Cloud Run job.
5. **Knowledge distillation** — Fine-tune YOLOv8x (teacher) → distill to YOLOv8n (student) for 10× inference cost reduction with <5% mAP loss; Ultralytics supports built-in distillation in v11.
6. **Vietnamese tax and billing** — AWS/GCP bill in USD; factor in ~23% VAT for business accounts in Vietnam; GCP provides official invoicing for Vietnamese entities via Google Vietnam distributors.

---

*End of Tech Report B03 — Dr. Praxis (R-β)*
