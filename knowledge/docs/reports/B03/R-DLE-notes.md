# Deep Learning Notes: B03 Computer Vision
## By R-DLE — Date: 2026-03-31

---

### 1. Architecture Evolution: CNN → Transformer → Hybrid

The evolution of vision architectures from 2012 to 2026 is one of the most rapid progressions in applied mathematics. Understanding why each generation emerged is more valuable than memorizing their specifications.

**CNN Era (2012–2020):** AlexNet demonstrated that deep convolutional networks trained on large labeled datasets could dominate handcrafted feature methods. The key insight was inductive bias: convolutional weight sharing encodes translation invariance and locality, which are properties that hold for natural images. This bias made CNNs data-efficient but also limited them — long-range dependencies required very deep networks with many pooling stages, causing spatial information loss.

**Transformer Era (2020–2022):** Vision Transformer (ViT, Dosovitskiy et al., 2020) demonstrated that pure self-attention, without any convolutional inductive bias, could match or exceed CNN performance at scale. The critical requirement: ViT needs large data (JFT-300M or ImageNet-21K pretraining) to compensate for the absent locality bias. Self-attention computes all pairwise interactions between patches — O(n²) complexity — enabling the model to learn both local textures and global semantic structure from data rather than architecture constraints.

**Hybrid Era (2022–present):** The dichotomy dissolved. ConvNeXt demonstrated that modernizing CNNs with Transformer training recipes closes the gap with ViT. Meanwhile, architectures like Swin Transformer introduced hierarchical local windows into transformers, recovering the efficiency of CNNs. The field converged on a pragmatic conclusion: locality bias is useful at limited data scale; at massive scale, any sufficiently expressive architecture trained with the right recipe converges to similar representations.

**State Space Era (2024–present):** Mamba and its variants introduced sub-quadratic sequence modeling via selective state space models (SSMs), enabling efficient processing of very long sequences — relevant for high-resolution images where ViT's O(n²) cost is prohibitive.

---

### 2. CNN Architectures Deep Dive

**ResNet: Residual Connections**

The residual connection `y = F(x, {W_i}) + x` solved the degradation problem where adding more layers to a plain network increased training error. The identity shortcut allows gradients to flow directly through the network without passing through weight layers, enabling stable training of networks with 100+ layers. Formally, the network learns residual functions F(x) rather than the unreferenced mapping H(x), which is easier to optimize when the true function is close to identity.

Key variants: ResNet-50 (standard baseline, ~25M params), ResNet-101 (accuracy-throughput sweet spot), ResNet-152 (diminishing returns on most tasks). Wide ResNet (WRN) increases width rather than depth, often achieving better accuracy per FLOP.

**EfficientNet: Compound Scaling**

EfficientNet (Tan & Le, 2019) formalized compound scaling: simultaneously scaling depth (d), width (w), and resolution (r) under a computational budget constraint. Given a multiplier φ:

```
depth:      d = α^φ
width:      w = β^φ
resolution: r = γ^φ
subject to: α · β² · γ² ≈ 2
```

The baseline model EfficientNet-B0 was obtained via Neural Architecture Search (NAS). Scaling from B0 to B7 follows the compound coefficient. EfficientNetV2 improved training speed by using Fused-MBConv in early stages and adaptive regularization (progressive learning), achieving 4x faster training than V1.

**ConvNeXt: Modernized CNN**

ConvNeXt (Liu et al., 2022) applied Swin Transformer training improvements to a ResNet baseline through a systematic ablation: change training recipe (AdamW, cosine schedule, Mixup, RandAugment) → increase kernel size to 7×7 → invert bottleneck → replace ReLU with GELU → replace BatchNorm with LayerNorm → separate depthwise conv from pointwise. Each step improved accuracy. The final ConvNeXt-B matches Swin-B while being simpler and more friendly to deployment (no window partitioning logic).

The key insight: the performance gap between transformers and CNNs in 2021 was largely due to training recipe differences, not inherent architectural superiority.

---

### 3. Vision Transformer (ViT) Deep Dive

**Patch Embedding:**
An image `x ∈ R^{H×W×C}` is split into N non-overlapping patches of size P×P, giving `N = HW/P²` patches. Each patch is flattened and linearly projected to dimension D:

```
x_p ∈ R^{N × (P²·C)}  →  E·x_p ∈ R^{N × D}
```

A learnable `[CLS]` token is prepended, used as the image representation for classification. Patch size P=16 (ViT-16) is standard; P=32 (ViT-32) is faster but loses fine-grained spatial information.

**Positional Encoding:**
Unlike CNNs, transformers have no spatial awareness by design. ViT adds learnable 1D positional embeddings to patch embeddings. At inference on different resolutions than training, 2D interpolation of positional embeddings is required (bicubic interpolation). More recent models use Rotary Position Embeddings (RoPE) or 2D sinusoidal encodings for better resolution generalization.

**Multi-Head Self-Attention (MHSA) for Images:**
For each head h, queries, keys, and values are computed from patch embeddings:
```
Q = XW_Q,  K = XW_K,  V = XW_V
Attention(Q,K,V) = softmax(QK^T / √d_k) · V
```
With H heads operating in parallel on D/H dimensions each. The softmax term computes pairwise similarity between all patches — this is why ViT can capture global dependencies from the first layer, unlike CNNs which require deep stacking to build large receptive fields.

Computational complexity is O(N²·D) per layer — for a 224×224 image with P=16, N=196 patches, this is manageable. At N=2048 (high-res or video), it becomes expensive.

**Swin Transformer: Hierarchical Patches**

Swin partitions the image into non-overlapping local windows of M×M patches and applies self-attention within each window. Complexity drops to O(M²N) — linear in image size. Shifted Window (SW) attention alternates between regular and shifted partitions across layers to enable cross-window information exchange. Hierarchical feature maps are produced by patch merging operations (analogous to pooling), making Swin compatible with dense prediction heads (FPN, UperNet).

---

### 4. Detection Architecture Analysis

**Two-Stage: Faster R-CNN**

Stage 1 — Region Proposal Network (RPN): a sliding anchor-based head proposes candidate regions with objectness scores. Anchors at multiple scales and aspect ratios are predefined at each spatial location.

Stage 2 — RoI Head: proposed regions are cropped from the feature map via RoI Align (differentiable, avoids quantization artifacts of RoI Pooling), then classified and refined. The two-stage design achieves high accuracy but the serialized stages create latency. Typical throughput: 5–10 FPS on V100 GPU.

**One-Stage: YOLO Family**

YOLO predicts bounding boxes and class probabilities directly from feature maps in a single forward pass, achieving real-time performance. Key evolution:

- **YOLOv5:** CSP backbone, PANet neck, anchor-based detection head. 140 FPS on T4.
- **YOLOv8:** Anchor-free detection head (eliminates anchor hyperparameter sensitivity), C2f module replacing C3 for better gradient flow, decoupled head (separate classification and regression branches). Cleanest implementation in the family.
- **YOLOv9:** GELAN (Generalized Efficient Layer Aggregation Network) + PGI (Programmable Gradient Information) — information bottleneck principle applied to detection to prevent information loss through deep networks.
- **YOLOv10:** NMS-free end-to-end detection using dual label assignment, eliminating post-processing latency.
- **YOLO11 (2025):** Improved C3k2 block, attention in backbone, state-of-the-art on COCO with minimal parameter overhead.

**Transformer-Based: DETR and DINO**

DETR (DEtection TRansformer, Carion et al., 2020) reformulated detection as a set prediction problem. A fixed set of learned object queries attend to encoder features via cross-attention, directly outputting N (box, class) predictions. Hungarian matching assigns predictions to ground truth — no NMS required. Limitations: slow convergence (500 epochs to match Faster R-CNN at 36 epochs), poor small object detection.

DINO (DETR with Improved deNoising anchor boxes, Zhang et al., 2022) addressed DETR's convergence problem via:
1. Contrastive denoising training: adding noise to ground truth boxes and training the model to reconstruct them
2. Mixed query selection: initializing object queries from encoder output (anchor points)
3. Look forward twice: optimizing query positions across two decoder stages

Result: DINO-4scale with ResNet-50 backbone achieves 49.0 mAP on COCO in 12 training epochs, matching the best CNN-based detectors.

---

### 5. Foundation Models for Vision

**CLIP (Contrastive Language-Image Pretraining):**

Trained on 400M image-text pairs from the internet. Two encoders (image: ViT or ResNet; text: transformer) are trained to maximize cosine similarity of matching pairs and minimize it for non-matching pairs via contrastive loss (InfoNCE):

```
L = -log[ exp(sim(i,t)/τ) / Σ_k exp(sim(i,t_k)/τ) ]
```

Temperature τ is a learned parameter. CLIP learns visual concepts grounded in natural language, enabling zero-shot classification: compute similarity between image embedding and text embeddings of class names ("a photo of a {class}"). Practical zero-shot accuracy: ~76% on ImageNet with no fine-tuning — comparable to supervised ResNet-50.

**DINOv2:**

Self-supervised ViT trained on 142M curated images using a combination of DINO (self-distillation with no labels) and iBOT (masked image modeling) objectives. The student network is trained to match teacher network (EMA of student) outputs on differently augmented views. Key property: DINOv2 features are semantically structured — principal components of the feature space correspond to meaningful visual concepts. Superior to supervised pretraining for dense prediction tasks (segmentation, depth estimation) when used as a frozen backbone.

**SAM / SAM2 (Segment Anything Model):**

SAM decouples segmentation into a promptable interface: given an image and a prompt (point, box, mask, or text), predict a valid segmentation mask. Architecture: heavyweight image encoder (ViT-H), lightweight prompt encoder, mask decoder with two-way attention. Trained on SA-1B dataset (11M images, 1B masks). SAM2 extends to video segmentation with a streaming memory architecture for temporal propagation.

Practical significance: SAM eliminates the need to train segmentation models from scratch for many tasks — it can be used directly as an annotation tool or zero-shot segmenter, with fine-tuning (SAM-HQ, MedSAM, EfficientSAM) for domain-specific improvement.

**LLaVA (Large Language and Vision Assistant):**

Connects a visual encoder (CLIP ViT-L/14) to a large language model (Llama/Vicuna/Mistral) via a projection layer. The projection learns to map visual tokens into the LLM's token embedding space. Trained in two stages: (1) freeze both encoders, train only projection on image-caption pairs; (2) end-to-end fine-tuning on instruction-following visual QA data. Enables visual question answering, detailed image description, OCR-based reasoning, and multimodal chain-of-thought.

---

### 6. Loss Functions Taxonomy

**Classification Losses:**

- **Cross-Entropy:** `L = -Σ y_c · log(p_c)`. Standard for multi-class. Gradient provides strong signal for correct class updates.
- **Label Smoothing CE:** Replaces hard targets y=1 with y=1-ε for true class, ε/(K-1) for others. Reduces overconfidence, improves calibration.
- **Focal Loss:** `FL(p_t) = -α_t(1-p_t)^γ · log(p_t)`. Down-weights easy examples (large p_t), up-weights hard/rare examples. γ=2, α=0.25 are standard values.
- **ArcFace (Additive Angular Margin):** For face/metric learning: `L = -log[ e^{s·cos(θ_{y_i}+m)} / (e^{s·cos(θ_{y_i}+m)} + Σ_{j≠y_i} e^{s·cos(θ_j)}) ]`. Enforces intra-class compactness and inter-class separation in angular space.

**Detection Losses:**

- **Classification head:** Focal Loss (standard for anchor-free) or BCE with class weights
- **Box regression:** `L1 Loss` is non-smooth at zero. `Smooth L1 (Huber)` avoids gradient explosion near zero.
- **IoU-based regression:** `GIoU = IoU - |C\(A∪B)|/|C|` (penalizes non-overlapping boxes via enclosing area). `CIoU` adds distance between centers and aspect ratio consistency terms — fastest convergence for box regression.
- **DFL (Distribution Focal Loss):** Used in YOLOv8+. Predicts a distribution over box edge locations rather than a point estimate, better modeling ambiguity in bounding box annotation.

**Segmentation Losses:**

- **Cross-Entropy per pixel:** Simple baseline, biased toward large objects.
- **Dice Loss:** `L = 1 - 2|X∩Y|/(|X|+|Y|)`. Directly optimizes overlap, handles class imbalance better than CE. Often combined: `L = CE + Dice`.
- **Lovász-Softmax:** Surrogate for IoU, directly optimizing the mean IoU metric.

**Contrastive / Self-supervised Losses:**

- **InfoNCE (NT-Xent):** `L = -log[ exp(z_i · z_j / τ) / Σ_{k≠i} exp(z_i · z_k / τ) ]`. Used in SimCLR, CLIP.
- **Barlow Twins:** `L = Σ_i (1-C_{ii})² + λ Σ_i Σ_{j≠i} C_{ij}²`. Minimizes redundancy in feature dimensions rather than relying on negative pairs.
- **VICReg:** Combines variance, invariance, and covariance regularization — avoids representation collapse without negative pairs.

---

### 7. Emerging Architectures 2024–2026

**Mamba for Vision (VMamba, Vision Mamba):**

Mamba replaces attention with Selective State Space Models (S6). State space models compute output as: `y = Cx + Du` where x evolves as `x' = Ax + Bu`. The "selective" mechanism makes A, B, C, D functions of the input, enabling the model to filter or retain information dynamically. Complexity is O(N·D) rather than O(N²·D), enabling efficient processing of high-resolution images treated as long sequences.

VMamba (Liu et al., 2024) introduced the Visual State Space (VSS) block with a 2D selective scan mechanism that traverses image features in four directions (top-left to bottom-right, and three other traversals) to capture spatial dependencies without quadratic cost. Achieves ViT-level accuracy on ImageNet with 40% lower computational cost at high resolutions.

**Efficient Attention Variants:**

- **Flash Attention (v1/v2/v3):** Hardware-aware exact attention computation that tiles Q, K, V to minimize HBM memory reads/writes. Does not approximate attention — achieves identical output to standard attention but 2–4x faster and O(N) memory instead of O(N²). Now the default in all serious transformer training.
- **Linear Attention:** Approximates softmax attention via kernel trick `exp(q·k) ≈ φ(q)·φ(k)` for O(N) attention. Loses expressivity but enables constant memory inference — relevant for streaming/video applications.
- **Deformable Attention (DAT):** Learns to attend to a sparse set of relevant spatial locations rather than all locations. Used in Deformable DETR and DAT backbone. Efficient for high-resolution feature maps.

**Diffusion Models for Perception (2024–2026):**

Beyond generation, diffusion models are being applied to discriminative CV tasks. DiffusionDet (Chen et al., 2023) treats object detection as a denoising process from noisy boxes to ground truth boxes. Marigold uses latent diffusion models for monocular depth estimation, achieving state-of-the-art zero-shot depth estimation by leveraging diffusion priors from large-scale image pretraining.

---

### 8. Architecture Selection Guide

Decision matrix combining task type, dataset size, and latency requirements into concrete recommendations:

| Task | Data Volume | Latency | Recommended Architecture | Rationale |
|---|---|---|---|---|
| Classification | < 1K | Any | CLIP zero-shot or frozen DINOv2 + linear | Fine-tuning underperforms at this scale |
| Classification | 1K–10K | < 50ms | EfficientNetV2-S fine-tuned | Efficient, strong pretrained representations |
| Classification | 1K–10K | Any | ViT-B/16 fine-tuned | Best accuracy at this scale |
| Classification | > 100K | < 50ms | ConvNeXt-B | CNN efficiency, transformer-level accuracy |
| Classification | > 100K | Any | ViT-L or DINOv2-L fine-tuned | Maximum accuracy |
| Detection | < 5K | < 20ms | YOLOv8n/s COCO pretrained | Fastest convergence, real-time capable |
| Detection | < 5K | < 100ms | YOLOv8m/l | Accuracy-speed balanced |
| Detection | > 10K | Any | DINO or YOLOv9 | SOTA accuracy, fine-tuning at scale |
| Segmentation | Any | < 20ms | YOLOv8-seg | Real-time instance segmentation |
| Segmentation | Any | < 200ms | Mask2Former | Panoptic/semantic, high accuracy |
| Segmentation | Zero-shot | Any | SAM2 | No training required, interactive |
| Depth Estimation | Few samples | Any | Marigold (diffusion) | Zero-shot generalization |
| OCR / VQA | Any | < 500ms | LLaVA-1.6 or InternVL2 | Multimodal understanding |
| High-res (> 2K px) | Any | < 500ms | Swin-L or VMamba | Linear complexity, preserves spatial detail |
| Video Understanding | Any | Real-time | SlowFast or VideoMAE | Temporal modeling at inference speed |
| Anomaly Detection | Normal images only | Any | PatchCore + DINOv2 features | No anomaly labels required |

**Critical selection factors often overlooked:**

1. **Deployment target hardware** overrides accuracy considerations. A ViT-L achieving 87% accuracy that cannot run at target FPS is the wrong choice compared to EfficientNetV2-S at 84% that meets latency.

2. **Label acquisition cost** should bias toward zero-shot (CLIP, SAM) or few-shot (DINOv2) architectures when annotation budget is limited.

3. **Interpretability requirements** in regulated domains (healthcare, finance) favor CNNs and spatial attention visualization over opaque transformer representations.

4. **Training data diversity** matters more than architecture for generalization. A simpler model trained on diverse, high-quality data outperforms a sophisticated model trained on narrow data in production deployment.

---

*Notes reflect architecture analysis current as of Q1 2026. The field moves quickly — treat specific accuracy numbers as directional rather than definitive; always validate against your specific dataset and hardware.*
