# ML Engineering Notes: B03 Computer Vision
## By R-MLE — Date: 2026-03-31

---

### 1. Training Pipeline Architecture

A production-grade CV training pipeline is not a script — it is a reproducible system. The pipeline must be deterministic (fixed seeds), resumable (checkpoint every N epochs), and auditable (every run produces a full artifact manifest). Below is the canonical pipeline architecture I use across CV projects:

```
[Raw Data]
    → [Data Validation] (schema checks, label format, image integrity)
    → [Preprocessing & Augmentation] (deterministic transforms applied at load time)
    → [DataLoader] (multi-worker, prefetch buffer, pin_memory=True for GPU)
    → [Model Forward Pass]
    → [Loss Computation]
    → [Optimizer Step] (gradient clipping, LR scheduler step)
    → [Metric Logging] (per-batch + per-epoch to experiment tracker)
    → [Checkpoint Save] (best + periodic + final)
    → [Validation Loop] (no augmentation, full dataset pass)
    → [Model Export] (ONNX / TorchScript artifact)
```

Key engineering decisions in this pipeline:

**DataLoader configuration:** `num_workers` should equal number of CPU cores minus 2 (reserve for main process and OS). `pin_memory=True` eliminates CPU→GPU copy overhead. `persistent_workers=True` avoids re-spawning worker processes between epochs — critical for datasets with heavy preprocessing.

**Gradient clipping:** `torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)` is standard. For transformer-based vision models, use `max_norm=0.1` to stabilize attention layer gradients.

**Learning rate scheduling:** Cosine annealing with warm restart (CosineAnnealingWarmRestarts) is the most robust general-purpose scheduler. For fine-tuning, use a linear warmup for the first 5% of training steps followed by cosine decay.

**Checkpoint strategy:** Save top-3 checkpoints by validation metric, plus a checkpoint every 10 epochs regardless of performance. Always save optimizer state alongside model weights for resumable training.

---

### 2. Transfer Learning & Fine-tuning Strategy

Transfer learning is the default strategy for all CV tasks unless you have > 500K labeled images and a strong domain-specific reason to train from scratch.

**Pretrained model selection guide:**

| Model | Pretrained On | Best Used For |
|---|---|---|
| ImageNet weights (ResNet, EfficientNet) | 1.2M labeled images, 1000 classes | General classification, feature extraction for similar domains |
| CLIP (ViT-B/32, ViT-L/14) | 400M image-text pairs | Zero-shot classification, open-vocabulary detection, multimodal tasks |
| DINOv2 (ViT-S/B/L/G) | 142M curated images, self-supervised | Dense prediction, segmentation, retrieval, few-shot tasks |
| SAM / SAM2 | 11M images, 1B+ masks | Segmentation with minimal fine-tuning, interactive annotation |
| MAE (Masked Autoencoder) | ImageNet-21K | Tasks where understanding spatial structure is critical |

**Fine-tuning strategy by data volume:**

- **< 100 samples (few-shot):** Freeze backbone entirely, fine-tune only classification head. Use CLIP or DINOv2 as frozen feature extractor — their representations generalize extremely well. Consider prototypical networks or CoOp (context optimization) for CLIP.

- **100–1000 samples:** Freeze first 70% of backbone layers (early layers capture universal features). Fine-tune remaining layers + head. Use aggressive augmentation (CutMix, MixUp, RandAugment). Learning rate for backbone layers should be 10× lower than head layers (differential learning rates).

- **1000–10000 samples:** Fine-tune entire backbone with small learning rate (1e-4 to 1e-5 for backbone, 1e-3 for head). Layer-wise learning rate decay: each layer group's LR = base_LR × decay_factor^depth. Use cosine warmup.

- **> 10000 samples:** Full fine-tuning or training from scratch becomes viable. If domain is highly specific (medical imaging, satellite imagery, industrial defects), domain-adaptive pretraining (DAP) before task-specific fine-tuning outperforms direct fine-tuning.

**Catastrophic forgetting mitigation:**
- Elastic Weight Consolidation (EWC) when the model must retain multi-task capability
- LoRA (Low-Rank Adaptation) for parameter-efficient fine-tuning of large ViT-based models — adds < 1% parameter overhead, preserves pretrained representations

---

### 3. Evaluation Methodology

Choosing the right metric is as important as model architecture. Using the wrong metric hides real-world failure modes.

**Classification metrics:**
- **Accuracy:** Use only when classes are balanced. Misleading on imbalanced datasets.
- **F1-score (macro):** Standard for imbalanced multi-class. Report per-class F1 alongside macro average.
- **AUC-ROC:** Use for binary classification. Threshold-independent, good for ranking tasks.
- **Top-5 accuracy:** Use for large-vocabulary classification (> 100 classes).

**Detection metrics:**
- **mAP@0.5:** Standard COCO metric. Report this as primary metric.
- **mAP@0.5:0.95:** Stricter, tests localization precision across IoU thresholds. Required for deployment where bounding box accuracy matters.
- **AR (Average Recall) by object size:** Small/medium/large split reveals whether model fails on small objects — common failure mode for real-world scenes.
- **FPS at target hardware:** Must be reported alongside accuracy metrics. A model with 0.5 mAP higher but 3x slower may not be the right choice.

**Segmentation metrics:**
- **mIoU (mean Intersection over Union):** Primary metric for semantic segmentation.
- **Panoptic Quality (PQ):** For panoptic segmentation combining semantic + instance.
- **Boundary F1:** Useful when segmentation boundary accuracy is operationally important (e.g., robotics grasping).

**Generative model metrics:**
- **FID (Frechet Inception Distance):** Standard for image generation quality. Lower is better.
- **SSIM (Structural Similarity Index):** For image restoration/enhancement tasks requiring pixel-level fidelity.
- **LPIPS (Learned Perceptual Image Patch Similarity):** Better correlates with human perceptual quality than SSIM.
- **CLIP Score:** For text-to-image generation, measures semantic alignment between prompt and generated image.

**Evaluation anti-patterns to avoid:**
- Evaluating only on validation set used during training (use a completely held-out test set released only once)
- Reporting single-threshold precision/recall without the full PR curve
- Using test-time augmentation (TTA) in evaluation but not disclosing it — makes benchmarks non-comparable

---

### 4. Experiment Tracking

Every training run must be fully reproducible and comparable. Experiment tracking is not optional overhead — it is the ML engineer's source of truth.

**MLflow setup for CV:**

```python
import mlflow
import mlflow.pytorch

mlflow.set_experiment("B03-CV-Detection-YOLOv9")

with mlflow.start_run(run_name="yolov9c-finetune-lr1e4"):
    mlflow.log_params({
        "model": "yolov9c",
        "lr": 1e-4,
        "epochs": 100,
        "batch_size": 32,
        "img_size": 640,
        "augmentation": "mosaic+mixup",
        "pretrained": "COCO"
    })
    # Log per-epoch
    mlflow.log_metric("val/mAP50", map50, step=epoch)
    mlflow.log_metric("val/mAP50-95", map5095, step=epoch)
    mlflow.log_metric("train/loss", loss.item(), step=epoch)
    # Log artifacts
    mlflow.log_artifact("confusion_matrix.png")
    mlflow.pytorch.log_model(model, "model")
```

**Weights & Biases (W&B) advantages over MLflow for CV:**
- Native image logging: `wandb.log({"predictions": wandb.Image(img, boxes=box_data)})` — visualize detection outputs directly in the dashboard
- Sweep integration for hyperparameter search (Bayesian optimization built-in)
- Better artifact lineage tracking for dataset versions

**Recommended W&B sweep config for detection fine-tuning:**
```yaml
method: bayes
metric:
  goal: maximize
  name: val/mAP50
parameters:
  lr:
    distribution: log_uniform_values
    min: 1e-5
    max: 1e-3
  weight_decay:
    values: [0.0001, 0.0005, 0.001]
  warmup_epochs:
    values: [3, 5, 10]
```

**Run naming convention:** `{model}-{dataset}-{date}-{run_id}` — e.g., `yolov9c-vn-retail-20260331-r7`. Enforce this as a team standard; searching through runs named "test" or "final_v2" is a significant productivity drain.

---

### 5. Dataset Management

**Data versioning:** DVC (Data Version Control) is the standard tool. Store raw data in cloud storage (S3/GCS), version with DVC, and link dataset versions to experiment runs via MLflow/W&B artifact references. Never train on raw data directly — always train on a versioned, validated dataset snapshot.

**Train/val/test split guidelines:**
- Stratified split by class label (critical for imbalanced datasets)
- For temporal data (video frames, time-series images), use temporal split — never random split
- Standard ratios: 70/15/15 for large datasets (> 10K); 60/20/20 for small datasets
- Test set must remain locked and untouched until final evaluation — create it first, never look at it

**Class imbalance handling strategies (in priority order):**

1. **Oversampling minority class** (ROS): Duplicate minority class samples. Simple and effective for mild imbalance (ratio < 10:1).
2. **SMOTE for CV:** Generate synthetic samples via interpolation in feature space (not pixel space). Use with care — interpolation in pixel space creates unrealistic images.
3. **Class-weighted loss:** `torch.nn.CrossEntropyLoss(weight=class_weights)` where class_weights are inversely proportional to class frequency. Zero overhead, always try first.
4. **Focal Loss:** Dynamically down-weights easy examples, forcing the model to focus on hard/rare samples. Standard for detection tasks. `FL(p_t) = -α_t(1-p_t)^γ * log(p_t)` with γ=2 as default.
5. **Balanced batch sampling:** Custom sampler that ensures each batch contains equal class representation. Slows training but often most effective for extreme imbalance (> 100:1).

**Dataset quality checks before training:**
- Image integrity check (truncated files, zero-byte files)
- Label format validation (bounding boxes within image bounds, no negative dimensions)
- Duplicate detection using perceptual hashing (pHash) — duplicates between train and val sets inflate reported accuracy
- Class distribution visualization — always plot before training

---

### 6. Common Training Problems

**Overfitting (training loss drops, val loss plateaus or rises):**
Diagnosis: train/val loss divergence after early epochs.
Solutions: increase dropout (0.2 → 0.5), add weight decay (1e-4 → 1e-3), use stronger augmentation (add CutMix/MixUp), reduce model capacity, apply early stopping with patience=10.

**Catastrophic Forgetting (multi-task or sequential learning):**
Diagnosis: performance on task A degrades when fine-tuning for task B on the same model.
Solutions: EWC penalty on important weights, progressive neural networks, LoRA adapters per task, knowledge distillation from the old model during new task training.

**Domain Shift (model degrades after deployment):**
Diagnosis: production accuracy consistently lower than validation accuracy; embedding drift detected.
Solutions: Implement a monitoring pipeline with embedding distribution checks (cosine similarity to reference set); trigger retraining when drift score exceeds threshold; use online learning or periodic retraining on fresh production data.

**Training Instability (loss spikes, NaN gradients):**
Diagnosis: sudden loss spikes, gradient norms exploding.
Solutions: gradient clipping (max_norm=1.0), reduce learning rate, check for corrupted training samples, use mixed precision with dynamic loss scaling (`torch.cuda.amp.GradScaler`).

**Slow Convergence:**
Diagnosis: validation metric improves very slowly across many epochs.
Solutions: increase learning rate (if not oscillating), switch optimizer (SGD → AdamW for transformers), verify batch normalization is not disabled in fine-tuning, check that pretrained weights are actually loaded.

---

### 7. Hardware Requirements

| Model / Task | Min GPU VRAM | Recommended | Batch Size (Training) |
|---|---|---|---|
| ResNet50 classification | 4 GB | 8 GB | 64–128 |
| EfficientNetV2-M | 6 GB | 12 GB | 32–64 |
| YOLOv8m detection (640px) | 8 GB | 16 GB | 32–64 |
| YOLOv9c detection (640px) | 10 GB | 24 GB | 16–32 |
| ViT-B/16 fine-tuning | 12 GB | 24 GB | 16–32 |
| ViT-L/16 fine-tuning | 24 GB | 40 GB | 8–16 |
| CLIP ViT-L/14 fine-tuning | 24 GB | 40 GB | 8–16 |
| DINOv2 ViT-L fine-tuning | 24 GB | 40 GB | 8–16 |
| SAM fine-tuning | 32 GB | 80 GB | 4–8 |
| Stable Diffusion fine-tuning (DreamBooth) | 24 GB | 40 GB | 1–4 |
| Mask2Former segmentation | 16 GB | 32 GB | 8–16 |

Multi-GPU training: use PyTorch DDP (DistributedDataParallel) over DataParallel — DDP has lower communication overhead. For models exceeding single-GPU memory, use DeepSpeed ZeRO-2/3 or PyTorch FSDP.

---

### 8. Fine-tuning Cookbook

**Image Classification (transfer learning):**
1. Load pretrained EfficientNetV2-M or ViT-B/16 with `pretrained=True`
2. Replace final classification head with `nn.Linear(in_features, num_classes)`
3. Freeze backbone: `for param in model.features.parameters(): param.requires_grad = False`
4. Train head only for 5 epochs with LR=1e-3
5. Unfreeze top 30% of backbone, reduce LR to 1e-4, train 15 epochs
6. Unfreeze full model, LR=1e-5 for backbone / 1e-4 for head, train 10 epochs
7. Apply cosine LR schedule + warmup across all phases

**Object Detection (YOLOv8/v9 fine-tuning):**
1. Start from COCO pretrained weights (best.pt from official release)
2. Prepare dataset in YOLO format: `images/`, `labels/`, `data.yaml`
3. Freeze backbone for first 10 epochs: `freeze=[0,1,2,...,9]` in config
4. Train with `imgsz=640`, `batch=16`, `epochs=100`, `lr0=0.01`
5. Enable mosaic augmentation for first 90% of training, disable for last 10%
6. Validate with `conf=0.25, iou=0.7`; tune these thresholds on validation set before deploying

**Semantic Segmentation (fine-tuning SegFormer):**
1. Load `nvidia/mit-b2` encoder with Semantic FPN or SegFormer head from HuggingFace
2. Set encoder LR = 6e-5, decoder LR = 6e-4 (10x differential)
3. Use `AdamW` optimizer with `weight_decay=0.01`
4. Loss: `CrossEntropyLoss` with class weights for imbalanced categories
5. Train for 40K iterations with poly LR schedule (power=0.9)
6. Evaluate with sliding window inference for high-resolution images (> 1024px)

---

*Notes reflect production ML engineering practices for CV systems. Hardware requirements are based on FP16 mixed precision training unless otherwise noted.*
