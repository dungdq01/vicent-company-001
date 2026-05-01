# Research Report: Computer Vision (B03)
## By Dr. Archon (R-α) — Date: 2026-03-31

---

### 1. Executive Summary

Computer Vision (CV) is the discipline of enabling machines to interpret and reason about visual information — images, video, and 3D scenes — by combining signal processing, deep learning, and geometric reasoning. Since the deep learning revolution of 2012, convolutional neural networks and, more recently, transformer-based architectures have elevated CV from narrow pattern recognition to general visual understanding rivaling human perception across many benchmarks. The field is now converging with language AI into multimodal foundation models (GPT-4V, Gemini, CLIP, LLaVA), creating a new paradigm where visual and linguistic reasoning are unified in a single system.

---

### 2. Field Taxonomy

#### Parent Field Hierarchy
```
Artificial Intelligence
  └── Machine Learning
        └── Deep Learning
              └── Perceptual AI
                    └── Computer Vision  [B03]
                          ├── (co-root) Signal Processing
                          └── (co-root) Computational Photography
```

#### Sub-fields (11 sub-fields)

| # | Sub-field | Core Task |
|---|-----------|-----------|
| 1 | Image Classification | Assign a semantic label to an image |
| 2 | Object Detection | Locate and classify objects with bounding boxes |
| 3 | Semantic Segmentation | Label every pixel with a class |
| 4 | Instance Segmentation | Distinguish individual object instances at pixel level |
| 5 | Panoptic Segmentation | Unified semantic + instance labeling |
| 6 | Optical Flow & Video Understanding | Estimate per-pixel motion between frames |
| 7 | 3D Computer Vision | Depth estimation, point cloud processing, NeRF, scene reconstruction |
| 8 | Face Analysis | Detection, recognition, landmark alignment, expression recognition |
| 9 | Document Visual Understanding | Layout analysis, table extraction, VQA on documents |
| 10 | Medical Image Analysis | Pathology detection, organ segmentation, radiology AI |
| 11 | Multimodal Vision-Language | Image captioning, VQA, visual grounding, text-to-image |

#### Related Fields

- **B02 Document Intelligence** — Shares OCR, layout parsing, visual document QA pipelines
- **B04 NLP & Language AI** — Multimodal models (CLIP, BLIP, LLaVA) fuse vision and text encoders
- **B07 Anomaly Detection** — Visual anomaly detection (defect inspection, surveillance)
- **B09 Generative AI** — Diffusion models and GANs for image synthesis
- **B14 Speech & Audio AI** — Audio-visual speech recognition, lip-reading

#### ASCII Taxonomy Tree

```
Computer Vision (B03)
├── 2D Understanding
│   ├── Image Classification (ResNet, ViT, EfficientNet)
│   ├── Object Detection (YOLO, DETR, RT-DETR)
│   ├── Semantic Segmentation (DeepLab, SegFormer)
│   ├── Instance Segmentation (Mask R-CNN, SAM)
│   └── Panoptic Segmentation (Panoptic FPN)
├── Video & Motion
│   ├── Optical Flow (RAFT, FlowNet)
│   ├── Video Classification (SlowFast, VideoMAE)
│   └── Multi-Object Tracking (ByteTrack, DeepSORT)
├── 3D Vision
│   ├── Monocular Depth Estimation (DepthAnything, DPT)
│   ├── Point Cloud Processing (PointNet, PointTransformer)
│   ├── 3D Object Detection (VoxelNet, CenterPoint)
│   └── Neural Radiance Fields (NeRF, 3D Gaussian Splatting)
├── Specialized Domains
│   ├── Face Recognition (ArcFace, InsightFace)
│   ├── Medical Imaging (nnU-Net, MedSAM)
│   ├── Remote Sensing (SkyScript, GeoSAM)
│   └── OCR & Document Vision (PaddleOCR, TrOCR, Donut)
└── Multimodal Vision-Language
    ├── Image-Text Contrastive (CLIP, SigLIP)
    ├── Visual Question Answering (LLaVA, InstructBLIP)
    └── Text-to-Image (Stable Diffusion, DALL·E 3, Flux)
```

---

### 3. Core Concepts (10 Concepts)

---

#### Concept 1: Convolutional Neural Networks (CNN)

**Description:**
A Convolutional Neural Network is a feed-forward deep learning architecture specifically designed to process grid-structured data such as images. Its distinguishing characteristic is the use of convolution operations — learnable filters that slide across spatial dimensions to detect local patterns. Unlike fully connected networks that treat each pixel independently, CNNs exploit two fundamental priors of visual data: **locality** (nearby pixels are related) and **translation equivariance** (the same pattern detected anywhere in an image should produce the same feature).

The architecture typically stacks convolutional layers (for feature extraction), followed by non-linear activations (ReLU), pooling layers (spatial downsampling), and fully connected layers (classification). Depth creates hierarchical representations: early layers detect edges and textures; middle layers detect parts (eyes, wheels); deep layers detect semantic entities (faces, cars). This inductive bias makes CNNs dramatically more parameter-efficient than dense networks for visual data.

Key variants include ResNets (residual connections allowing hundreds of layers), DenseNets (dense shortcut connections), and EfficientNets (compound scaling of width/depth/resolution). CNNs remain the workhorse backbone for production vision systems due to their hardware-friendliness and well-understood behavior.

**Mathematical Formulation:**
For a 2D convolution of input feature map `X` with kernel `K`:
```
(X * K)[i,j] = Σ_m Σ_n  X[i+m, j+n] · K[m, n]
```
With padding `p` and stride `s`, output spatial size: `⌊(H + 2p - k) / s⌋ + 1` where `H` is input height, `k` is kernel size.

Residual connection (ResNet block):
```
y = F(x, {W_i}) + x
```
where `F` is the stacked nonlinear layers, `x` is the identity shortcut.

- **Difficulty:** Intermediate
- **Prerequisites:** Linear algebra, calculus (backpropagation), basic neural networks

---

#### Concept 2: Image Segmentation

**Description:**
Image segmentation is the task of partitioning an image into meaningful regions, assigning labels at the pixel level. Three levels of granularity exist: **semantic segmentation** assigns a class label to every pixel (all cars are labeled "car"), **instance segmentation** additionally differentiates individual object instances (car #1, car #2), and **panoptic segmentation** provides a unified representation combining both.

Technically, segmentation is modeled as a dense prediction problem: a fully convolutional network (FCN) maps input pixels `H×W×3` to an output label map `H×W×C` where `C` is the number of classes. U-Net-style encoder-decoder architectures with skip connections are the canonical design, as they recover spatial resolution lost during pooling by concatenating high-resolution encoder features with upsampled decoder features.

Modern transformer-based models like SegFormer, Mask2Former, and SAM reformulate segmentation as a query-based problem where learnable "mask tokens" attend to image features and predict masks. SAM (Segment Anything Model) generalizes further by accepting point/box/text prompts to segment arbitrary objects zero-shot.

**Mathematical Formulation:**
Pixel-wise cross-entropy loss for semantic segmentation:
```
L = -1/(H·W) Σ_{i,j} Σ_c  y_{i,j,c} · log(p_{i,j,c})
```
where `y_{i,j,c}` is the one-hot ground truth and `p_{i,j,c}` is the softmax probability for class `c` at pixel `(i,j)`.

Intersection over Union (IoU) per class:
```
IoU_c = |P_c ∩ G_c| / |P_c ∪ G_c|
```

- **Difficulty:** Advanced
- **Prerequisites:** CNN, image classification, dense prediction architectures

---

#### Concept 3: Object Detection

**Description:**
Object detection extends image classification to simultaneously answer "what objects are present?" and "where are they?" — outputting bounding boxes `[x, y, w, h]` plus class labels and confidence scores for each detected instance. It is arguably the most industrially applied CV task, powering autonomous driving perception, warehouse robotics, and video surveillance.

Detection architectures split into two paradigms: **two-stage detectors** (Faster R-CNN family) first propose candidate regions (Region Proposal Network), then classify each proposal — achieving high accuracy at the cost of latency. **One-stage detectors** (YOLO family, SSD, RetinaNet) directly predict boxes and classes from a single forward pass, achieving real-time performance. YOLO has undergone continuous evolution from YOLOv1 (2016) to YOLOv10/YOLOv11 (2024–2025), incorporating anchor-free heads, transformer necks, and knowledge distillation.

Transformer-based detectors (DETR, RT-DETR) reformulate detection as a set prediction problem: learnable object queries attend to image features and each query independently predicts one object, eliminating the need for post-processing (NMS). This end-to-end formulation has become the dominant paradigm in 2024–2025.

**Mathematical Formulation:**
Anchor-based detection loss (YOLOv3-style):
```
L = λ_coord · L_box + L_obj + λ_noobj · L_noobj + L_cls
L_box = Σ_{ij} 1^obj_{ij} [(x̂-x)² + (ŷ-y)² + (√ŵ-√w)² + (√ĥ-√h)²]
```
IoU-based box loss (CIoU, used in YOLOv7+):
```
L_CIoU = 1 - IoU + ρ²(b,b^gt)/c² + α·v
v = (4/π²)(arctan(w^gt/h^gt) - arctan(w/h))²
```

- **Difficulty:** Intermediate
- **Prerequisites:** CNN, classification, bounding box regression, NMS

---

#### Concept 4: Vision Transformers (ViT)

**Description:**
The Vision Transformer, introduced by Dosovitskiy et al. (2020), adapts the Transformer architecture from NLP to image understanding by treating an image as a sequence of fixed-size patches. An image of size `H×W` is divided into `N = HW/P²` patches of size `P×P`, each linearly projected to a `D`-dimensional embedding vector. These patch embeddings, augmented with positional encodings, are fed into a standard Transformer encoder with multi-head self-attention (MHSA) layers.

ViT's key insight is that self-attention is inherently global: every patch can attend to every other patch from the first layer, contrasting with CNN's local receptive fields that expand only with depth. This enables ViT to model long-range spatial dependencies more effectively — critical for tasks requiring holistic scene understanding. However, ViT requires large-scale pretraining (JFT-300M) to compete with CNNs when training data is limited.

Subsequent work has substantially improved ViT: DeiT introduced data-efficient training via knowledge distillation; Swin Transformer introduced hierarchical window attention achieving CNN-like efficiency; DINOv2 demonstrated that self-supervised ViTs learn universal visual features transferable across tasks without fine-tuning; and MAE (Masked Autoencoders) enabled scalable self-supervised pretraining by reconstructing randomly masked patches.

**Mathematical Formulation:**
Multi-head self-attention:
```
Attention(Q, K, V) = softmax(QK^T / √d_k) · V

Q = X·W_Q,   K = X·W_K,   V = X·W_V
```
Patch embedding:
```
z_0 = [x_class; x^1_p E; x^2_p E; ... ; x^N_p E] + E_pos
E ∈ R^{(P²·C) × D},   E_pos ∈ R^{(N+1) × D}
```

- **Difficulty:** Advanced
- **Prerequisites:** Transformer (NLP), self-attention, positional encoding, CNNs for comparison

---

#### Concept 5: Feature Pyramid Networks (FPN)

**Description:**
Feature Pyramid Networks, introduced by Lin et al. (2017), address a fundamental challenge in object detection: objects appear at wildly different scales in natural images. A small pedestrian at 20 pixels and a large truck at 400 pixels in the same scene cannot both be optimally detected by a single feature map resolution.

FPN creates a multi-scale feature pyramid by augmenting a standard CNN backbone with a top-down pathway and lateral connections. During the bottom-up forward pass, each stage of the backbone produces feature maps at progressively lower resolution but higher semantic richness. The top-down pathway then upsamples from the deepest (most semantic) layer back to higher resolutions, fusing in lateral connections from the bottom-up pass at each scale via element-wise addition after 1×1 convolutions. This yields a set of feature maps `{P2, P3, P4, P5}` that are simultaneously semantically rich (from top-down) and spatially precise (from lateral connections).

FPN is not just a detection technique — it has become a universal multi-scale representation backbone used in segmentation (Panoptic FPN, SegFPN), pose estimation, and 3D detection. PANet (Path Aggregation Network) extends FPN with a bottom-up augmentation path; BiFPN (EfficientDet) adds learnable weighted fusion.

**Mathematical Formulation:**
Top-down pathway and lateral fusion:
```
P_l = Conv_1x1(C_l) + Upsample(P_{l+1})
```
where `C_l` is the bottom-up feature at level `l`, `P_{l+1}` is the coarser pyramid level, and `Upsample` is 2× nearest-neighbor interpolation.

- **Difficulty:** Intermediate
- **Prerequisites:** CNN backbones, multi-scale learning, anchor-based detection

---

#### Concept 6: Contrastive Learning and CLIP

**Description:**
Contrastive learning is a self-supervised framework where a model learns representations by maximizing agreement between differently augmented views of the same data (positive pairs) while minimizing agreement with views from different samples (negative pairs). In CV, SimCLR, MoCo, and BYOL demonstrated that contrastive pretraining on unlabeled images can match supervised ImageNet performance on downstream tasks.

CLIP (Contrastive Language-Image Pretraining, Radford et al. 2021) extends this to the multimodal domain. Two encoders — one for images (ResNet or ViT), one for text (Transformer) — are jointly trained on 400 million image-text pairs from the web. The training signal is a contrastive loss that pulls together image and text embeddings of matching pairs and pushes apart non-matching pairs within each mini-batch. The result is a shared embedding space where visual and linguistic concepts align: "a photo of a dog" and an image of a dog map to nearby vectors.

This alignment enables **zero-shot classification**: given class names as text, CLIP scores an image against all class descriptions without any task-specific training — achieving remarkable generalization. CLIP embeddings have become foundational features for many downstream tasks: visual search, image generation conditioning (Stable Diffusion), and grounding. SigLIP (2023) improves CLIP with a sigmoid loss that decouples the batch size constraint.

**Mathematical Formulation:**
InfoNCE (CLIP) loss for a batch of N image-text pairs:
```
L_i = -log[ exp(sim(v_i, t_i)/τ) / Σ_{j=1}^{N} exp(sim(v_i, t_j)/τ) ]
```
where `sim(·,·)` is cosine similarity, `τ` is a learned temperature scalar, `v_i` is image embedding, `t_i` is text embedding.

- **Difficulty:** Advanced
- **Prerequisites:** Representation learning, self-supervised learning, Transformer, dot-product attention

---

#### Concept 7: Optical Flow

**Description:**
Optical flow is the apparent motion of visual content (pixels, objects, surfaces) between consecutive video frames, caused by relative motion of the camera or scene objects. Estimating optical flow — a dense 2D motion field `(u, v)` per pixel — is fundamental to video understanding, action recognition, video stabilization, and autonomous navigation.

Classical methods (Lucas-Kanade, Horn-Schunck) rely on the brightness constancy assumption and local gradient constraints. Modern deep learning approaches (FlowNet, PWCNet, RAFT) learn to estimate flow end-to-end. RAFT (Recurrent All-Pairs Field Transforms, Teed & Deng 2020) builds a 4D correlation volume by computing dot products between all pairs of features across two frames, then iteratively refines flow estimates using a GRU. RAFT set state-of-the-art on the Sintel and KITTI benchmarks with unprecedented accuracy.

For video transformers (VideoMAE, TimeSformer), explicit optical flow is increasingly replaced by implicit temporal attention — but flow remains a critical tool for fine-grained motion analysis and datasets where optical flow is used as a supervision signal.

**Mathematical Formulation:**
Brightness constancy constraint:
```
I(x, y, t) = I(x+u, y+v, t+1)
```
Taylor expansion yields the optical flow constraint equation:
```
I_x·u + I_y·v + I_t = 0
```
where `I_x, I_y, I_t` are spatial and temporal image derivatives.

RAFT correlation volume:
```
C(g^1, g^2)[i, j, k, l] = g^1[i,j]^T · g^2[k,l]
```

- **Difficulty:** Advanced
- **Prerequisites:** Image derivatives, CNNs, recurrent networks (GRU/LSTM)

---

#### Concept 8: 3D Scene Understanding and Neural Radiance Fields

**Description:**
3D computer vision encompasses the recovery of three-dimensional scene structure from 2D image observations. Classical approaches include Structure from Motion (SfM) for camera pose recovery and Multi-View Stereo (MVS) for dense reconstruction. LiDAR-based methods process point clouds directly, critical for autonomous driving where systems like PointNet and VoxelNet operate on irregular 3D point data.

Neural Radiance Fields (NeRF, Mildenhall et al. 2020) represented a paradigm shift: instead of reconstructing an explicit 3D mesh, a continuous implicit function (an MLP) maps a 3D point `(x,y,z)` and viewing direction `(θ,φ)` to color `(r,g,b)` and volume density `σ`. Novel views are rendered by differentiable ray-marching: rays are cast from a camera, sampled at points along the ray, colors and densities are predicted by the MLP, and composited using the volume rendering integral. The model is trained only on posed 2D images with photometric reconstruction loss.

3D Gaussian Splatting (3DGS, 2023) superseded NeRF in many practical applications: scenes are represented as millions of learnable 3D Gaussians (position, color, opacity, covariance), rendered via rasterization — achieving real-time rendering quality comparable to NeRF at 100× the speed. Depth Anything v2 (2024) provides monocular metric depth estimation from a single image using ViT encoders trained on a combination of labeled and pseudo-labeled data.

**Mathematical Formulation:**
NeRF volume rendering:
```
C(r) = ∫_{t_n}^{t_f} T(t) · σ(r(t)) · c(r(t), d) dt

T(t) = exp(-∫_{t_n}^{t} σ(r(s)) ds)
```
where `T(t)` is accumulated transmittance, `σ` is density, `c` is color, `d` is viewing direction.

- **Difficulty:** Advanced
- **Prerequisites:** Ray casting, implicit functions, MLP, differentiable rendering, linear algebra (rotation/translation)

---

#### Concept 9: Loss Functions for Computer Vision

**Description:**
Choosing the correct loss function is critical for CV tasks since the learning signal must be mathematically consistent with the task objective. Cross-entropy loss is the standard for classification tasks, penalizing log-probability of the correct class. For dense prediction (segmentation, detection), specialized losses address class imbalance and spatial accuracy.

**Focal Loss** (Lin et al., RetinaNet 2017) addresses the extreme foreground/background class imbalance in one-stage detection by down-weighting the loss on easy (well-classified) examples: `FL(p_t) = -(1-p_t)^γ log(p_t)` where `γ > 0` reduces the relative weight of easy negatives. **IoU-based losses** (GIoU, DIoU, CIoU) directly optimize the geometric overlap metric rather than bounding box coordinates independently — improving localization accuracy. **Contrastive and triplet losses** are used in metric learning for face recognition and re-identification.

For generative models, perceptual loss (VGG feature matching) and adversarial loss (GAN discriminator) supplement pixel-wise losses to produce visually sharper reconstructions. Diffusion models use a denoising score matching objective.

**Mathematical Formulation:**
Dice Loss (commonly used in medical segmentation):
```
L_Dice = 1 - (2|P∩G| + ε) / (|P| + |G| + ε)
```
Generalized IoU Loss:
```
L_GIoU = 1 - IoU + |C - (A∪B)| / |C|
```
where `C` is the smallest enclosing box.

- **Difficulty:** Intermediate
- **Prerequisites:** Probability, cross-entropy, bounding box geometry

---

#### Concept 10: Transfer Learning and Fine-Tuning in CV

**Description:**
Transfer learning is the practice of initializing a model with weights pretrained on a large source dataset (typically ImageNet or a web-scale dataset) and adapting it to a downstream task with limited labeled data. This is the dominant paradigm in production CV systems: training from scratch requires millions of labeled examples and weeks of compute, while fine-tuning a pretrained ViT on a custom defect detection dataset may require only hundreds of examples and minutes of GPU time.

The effectiveness of transfer learning stems from the hierarchy of learned representations: low-level features (edges, textures, gradients) generalize universally, while high-level semantic features are domain-specific and benefit from fine-tuning. Foundation models (DINOv2, CLIP, SAM) represent the extreme of this paradigm: massive models pretrained on web-scale data that can be adapted to virtually any downstream vision task with minimal supervision.

Parameter-efficient fine-tuning methods (LoRA, adapter layers, prompt tuning) allow adapting billion-parameter foundation models to new tasks by training only a small fraction (0.1–5%) of parameters, dramatically reducing compute and memory requirements. This is increasingly important for Vietnamese teams deploying large CV models on edge hardware.

- **Difficulty:** Beginner to Intermediate
- **Prerequisites:** CNN/ViT, supervised training, backpropagation, dataset concepts

---

### 4. Algorithm Catalog (12 Algorithms)

| Algorithm | Category | Best For | Time Complexity | Maturity | Key Insight |
|-----------|----------|----------|-----------------|----------|-------------|
| **ResNet-50/101** | CNN Backbone | Classification, universal feature extractor | O(N·K²·C_in·C_out) per layer | Mature (2016) | Residual skip connections enable training of 100+ layer networks |
| **EfficientNet-B0/B7** | CNN Backbone | Mobile/edge deployment, accuracy-efficiency tradeoff | Compound scaling: α·β²·γ² ≈ 2 | Mature (2019) | Joint scaling of depth, width, resolution via NAS-derived coefficients |
| **YOLOv8/v10/v11** | Object Detection | Real-time detection, edge deployment | O(1) single-pass, ~1–10ms on GPU | Mature+Active (2023–2025) | Anchor-free head + CSP backbone + task-aligned head — train-once deploy-everywhere |
| **DETR / RT-DETR** | Object Detection | End-to-end detection, no NMS required | O(N²) attention for N patches | Growing (2020/2023) | Reformulates detection as set prediction via cross-attention on object queries |
| **ViT / DeiT / Swin** | Vision Backbone | High-accuracy classification, large-scale pretraining | O(N²·D) for ViT; O(N·D·w²) for Swin | Mature (2020–2021) | Patch-based tokenization brings Transformer global attention to vision |
| **Mask R-CNN** | Instance Segmentation | Instance-level segmentation, baseline for panoptic | O(proposals × RoI) two-stage | Mature (2017) | Extends Faster R-CNN with a pixel-level mask branch via RoIAlign |
| **SAM / SAM2** | Universal Segmentation | Interactive/zero-shot segmentation, any domain | Near real-time with ViT-H encoder | New+Active (2023–2024) | Prompt-based (point/box/text) segmentation trained on SA-1B (1B masks) |
| **CLIP / SigLIP** | Multimodal Representation | Zero-shot classification, visual search, retrieval | O(N·D) for embedding lookup | Mature (2021/2023) | Contrastive image-text alignment over 400M+ web pairs creates zero-shot generalizer |
| **Stable Diffusion / Flux** | Generative CV | Text-to-image, image editing, inpainting | Iterative denoising, O(T·N²·D) | Mature+Active (2022–2024) | Latent diffusion in compressed VAE space + cross-attention on text conditioning |
| **RAFT** | Optical Flow | Dense optical flow estimation in video | Iterative refinement, O(H·W·H·W) correlation volume | Mature (2020) | All-pairs correlation volume + GRU-based iterative update operator |
| **PointNet / PointNet++** | 3D CV | Point cloud classification and segmentation | O(N·D) per point | Mature (2017–2018) | Order-invariant shared MLP + global max-pooling directly on raw point coordinates |
| **TrOCR / PaddleOCR** | OCR | Scene text recognition, document OCR | Encoder-decoder transformer | Mature (2021) | Vision encoder (ViT/ResNet-CTC) + language decoder (autoregressive Transformer) |

---

### 5. State of the Art (2024–2026)

#### Latest SOTA Models and Benchmarks

**ImageNet-1K Classification:**
- ViT-G/14 (22B parameters, Google) achieves 90.45% top-1 — essentially saturating the benchmark
- EfficientViT (2023) achieves 84%+ at 10ms latency — the new efficiency frontier
- DINOv2 ViT-L achieves 86.3% linear probing — remarkable for a self-supervised model

**COCO Object Detection (val2017 AP):**
- InternImage-H: 65.4 AP (CVPR 2023)
- RT-DETR-X: 54.8 AP at 72 FPS on T4 GPU
- YOLOv9-E: 55.6 AP — best anchor-free real-time detector as of 2024

**ADE20K Semantic Segmentation (mIoU):**
- Mask2Former (Swin-L): 57.7 mIoU — two-year-old model still competitive
- SegFormer-B5: 84.0% on Cityscapes — production-ready urban segmentation

**Depth Estimation (NYUv2 absolute relative error):**
- Depth Anything v2 (ViT-L): 0.041 — SOTA monocular metric depth, April 2024

#### Key Papers (2024–2026)

- **GPT-4V / GPT-4o** (OpenAI, 2023–2024): First commercially deployed multimodal LLM with vision; supports chart analysis, OCR, VQA, and spatial reasoning at human level on many benchmarks.
- **LLaVA-1.5 / LLaVA-NeXT** (Liu et al., 2023–2024): Open-source visual instruction tuning connecting CLIP encoders to LLaMA/Vicuna; democratized multimodal AI research. LLaVA-NeXT adds dynamic resolution and video support.
- **Gemini Vision / Gemini 1.5 Pro** (Google DeepMind, 2023–2024): Native multimodal model trained jointly on text, image, audio, video; 1M token context window with interleaved visual tokens. Demonstrates video understanding at minute-level granularity.
- **SAM2 (Segment Anything Model 2)** (Meta, 2024): Extends SAM to video with streaming memory, enabling interactive object tracking and segmentation across temporal sequences. Processes at 44 FPS.
- **DINOv2** (Oquab et al., Meta, 2023): Self-supervised ViT trained on curated 142M image dataset via self-distillation with no labels. Features transfer to depth estimation, segmentation, classification, retrieval without fine-tuning.
- **Depth Anything v2** (Yang et al., 2024): Monocular metric depth estimation using synthetic-to-real transfer; ViT-L encoder pretrained with DINOv2 weights. Surpasses all prior monocular depth models.
- **Florence-2** (Microsoft, 2024): Unified vision foundation model trained on 800M image-annotation pairs covering detection, captioning, grounding, OCR as a single sequence-to-sequence model.
- **InternVL2** (Shanghai AI Lab, 2024): Open-source multimodal model rivaling GPT-4V on MMBench; 26B parameters, achieves competitive scores across VQA, OCR, chart understanding.

#### Emerging Trends (2025–2026)

1. **Foundation Models as Universal Vision Backbones:** DINOv2, SAM, and CLIP encoders are replacing task-specific pretrained backbones. A single frozen ViT-L encoder is now used as the perceptual layer for 10+ downstream tasks.
2. **Vision-Language-Action Models (VLAs):** RT-2, OpenVLA integrate CV with language for robot manipulation — giving physical actions to visual understanding.
3. **Long-Video Understanding:** Models with streaming/compressed temporal memory (Gemini 1.5, SAM2, VideoAgent) extend beyond clip-level to hours-long content.
4. **3D Gaussian Splatting for Real-Time Reconstruction:** 3DGS is being adopted in AR/VR, robotics, and digital twin creation as it enables real-time novel view synthesis from 30–50 images.
5. **Efficient Vision Models for Edge:** MobileViT-v3, EfficientViT, and ViT quantization (QViT, SmoothQuant) enable deployment of transformer-quality models on NPU/mobile hardware.
6. **Synthetic Data and World Models:** Using diffusion models and simulators (CARLA, Isaac Sim) to generate labeled training data — reducing dependency on costly real-world annotation.

---

### 6. Key Papers (10 Papers)

---

**Paper 1**
- **Title:** Deep Residual Learning for Image Recognition
- **Authors:** Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun
- **Year:** 2016 — **Venue:** CVPR 2016 (Best Paper)
- **Contribution:** Introduced residual (skip) connections enabling training of networks with 100–1000+ layers without vanishing gradients. Demonstrated that identity mappings allow gradients to flow directly through the network, making optimization tractable. ResNet became the dominant vision backbone for half a decade.
- **Impact:** Most cited CV paper of the 2010s; backbone of production systems from face recognition to medical imaging; concept of skip connections influenced BERT, U-Net, and the Transformer FFN block.
- **arXiv:** https://arxiv.org/abs/1512.03385

---

**Paper 2**
- **Title:** An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale
- **Authors:** Alexey Dosovitskiy et al. (Google Brain)
- **Year:** 2021 — **Venue:** ICLR 2021
- **Contribution:** First demonstration that a pure Transformer applied directly to image patches (without CNN inductive biases) can achieve state-of-the-art performance on ImageNet when pretrained on large datasets (JFT-300M). Established the ViT architecture as a scalable vision paradigm.
- **Impact:** Triggered a complete rethinking of vision architecture design; foundation for all subsequent ViT variants (Swin, DeiT, MAE, DINOv2); enabled multimodal models (CLIP uses ViT image encoder).
- **arXiv:** https://arxiv.org/abs/2010.11929

---

**Paper 3**
- **Title:** Learning Transferable Visual Models From Natural Language Supervision
- **Authors:** Alec Radford, Jong Wook Kim, Chris Hallacy et al. (OpenAI)
- **Year:** 2021 — **Venue:** ICML 2021
- **Contribution:** Introduced CLIP — joint training of image and text encoders via contrastive loss on 400M web-scraped image-text pairs. Demonstrated zero-shot transfer to 30+ vision benchmarks without task-specific training, matching supervised ResNet-50 on ImageNet.
- **Impact:** Foundational paper for multimodal AI; CLIP encoders are embedded in Stable Diffusion, DALL·E, LLaVA, and hundreds of retrieval systems; defined contrastive image-text pretraining as a paradigm.
- **arXiv:** https://arxiv.org/abs/2103.00020

---

**Paper 4**
- **Title:** Segment Anything
- **Authors:** Alexander Kirillov, Eric Mintun, Nikhila Ravi et al. (Meta AI)
- **Year:** 2023 — **Venue:** ICCV 2023
- **Contribution:** Introduced SAM — a promptable segmentation foundation model trained on SA-1B, a dataset of 1 billion masks across 11 million images. SAM accepts point, box, or text prompts and produces high-quality masks in under 50ms. Demonstrated zero-shot generalization to medical images, satellite imagery, and artistic renderings.
- **Impact:** Redefined segmentation as an interactive, universal task; spawned MedSAM, GeoSAM, SAM-Track; SAM2 extended to video with streaming memory in 2024.
- **arXiv:** https://arxiv.org/abs/2304.02643

---

**Paper 5**
- **Title:** RAFT: Recurrent All-Pairs Field Transforms for Optical Flow
- **Authors:** Zachary Teed, Jia Deng
- **Year:** 2020 — **Venue:** ECCV 2020 (Best Paper)
- **Contribution:** Proposed RAFT, which builds a 4D all-pairs correlation volume between feature maps of two frames, then iteratively refines flow estimates using a GRU operating on local correlation lookups. Achieved state-of-the-art on Sintel (EPE 1.43) and KITTI (5.10% Fl-all) with a simple, elegant design.
- **Impact:** RAFT is now the standard baseline for optical flow; its correlation volume + iterative update design influenced depth estimation (RAFT-Stereo), 3D flow (SceneFlow), and video segmentation.
- **arXiv:** https://arxiv.org/abs/2003.12039

---

**Paper 6**
- **Title:** DINOv2: Learning Robust Visual Features without Supervision
- **Authors:** Maxime Oquab, Timothée Dassault et al. (Meta AI)
- **Year:** 2023 — **Venue:** TMLR 2023
- **Contribution:** Trained ViT models using self-supervised self-distillation (DINO loss + iBOT + SwAV) on a carefully curated 142M image dataset (LVD-142M). Demonstrated that the resulting features achieve state-of-the-art on linear probing, few-shot, depth estimation, and segmentation benchmarks without fine-tuning.
- **Impact:** DINOv2 ViT-L/14 has become the default frozen visual encoder for multimodal models (LLaVA-1.5, InternVL, SAM2) and robotic perception systems.
- **arXiv:** https://arxiv.org/abs/2304.07193

---

**Paper 7**
- **Title:** PointNet: Deep Learning on Point Sets for 3D Classification and Segmentation
- **Authors:** Charles R. Qi, Hao Su, Kaichun Mo, Leonidas J. Guibas
- **Year:** 2017 — **Venue:** CVPR 2017
- **Contribution:** Introduced a novel neural architecture that directly consumes unordered 3D point clouds by applying shared MLPs to each point independently and aggregating via global max pooling — achieving permutation invariance by design. Demonstrated competitive performance on ModelNet40 classification and ShapeNet segmentation.
- **Impact:** Foundational paper for 3D deep learning; enabled LiDAR-based autonomous driving (VoxelNet, PointPillars, CenterPoint all trace to PointNet); PointNet++ added hierarchical local aggregation.
- **arXiv:** https://arxiv.org/abs/1612.00593

---

**Paper 8**
- **Title:** Focal Loss for Dense Object Detection (RetinaNet)
- **Authors:** Tsung-Yi Lin, Priya Goyal, Ross Girshick, Kaiming He, Piotr Dollar
- **Year:** 2017 — **Venue:** ICCV 2017 (Best Student Paper)
- **Contribution:** Identified extreme foreground-background class imbalance as the primary obstacle preventing one-stage detectors from matching two-stage accuracy. Proposed Focal Loss — a reshaping of cross-entropy that down-weights easy (well-classified) examples. Also introduced RetinaNet, a one-stage detector surpassing two-stage detectors on COCO.
- **Impact:** Focal Loss is universally used in production detection systems; enabled deployment of real-time detectors with accuracy previously only achievable by slow two-stage methods.
- **arXiv:** https://arxiv.org/abs/1708.02002

---

**Paper 9**
- **Title:** EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks
- **Authors:** Mingxing Tan, Quoc V. Le
- **Year:** 2019 — **Venue:** ICML 2019
- **Contribution:** Proposed compound scaling — a principled method to jointly scale CNN width, depth, and resolution using a fixed set of scaling coefficients derived from a neural architecture search. EfficientNet-B7 achieved 84.4% ImageNet top-1 accuracy with 8.4× fewer parameters than the best existing CNN at the time.
- **Impact:** Set the standard for efficiency-accuracy tradeoffs in production; EfficientDet (detection) achieved similar gains; EfficientNetV2 (2021) improved training speed; widely deployed on mobile and edge.
- **arXiv:** https://arxiv.org/abs/1905.11946

---

**Paper 10**
- **Title:** End-to-End Object Detection with Transformers (DETR)
- **Authors:** Nicolas Carion, Francisco Massa et al. (Facebook AI)
- **Year:** 2020 — **Venue:** ECCV 2020
- **Contribution:** Reformulated object detection as a direct set prediction problem using a Transformer encoder-decoder with learned object queries. Eliminated hand-crafted components: anchor generation, NMS, and proposal networks. Matched Faster R-CNN on COCO with a fundamentally simpler pipeline.
- **Impact:** Sparked the "transformer for detection" wave (Deformable-DETR, DINO-DETR, RT-DETR); end-to-end detection is now the dominant paradigm for new research; queries-as-objects design influenced panoptic segmentation (Mask2Former) and 3D detection.
- **arXiv:** https://arxiv.org/abs/2005.12872

---

### 7. Mathematical Foundations (5 Topics)

---

#### Topic 1: The Convolution Operation

**Description:**
Discrete 2D convolution is the mathematical engine behind CNN feature extraction. A convolutional layer applies `K` learnable filters of size `k×k×C_in` to an input volume, producing `K` feature maps. The operation computes a local weighted sum — equivalent to cross-correlation in most deep learning frameworks (technically not convolution due to no kernel flip, but the nomenclature is standard).

Convolution is a linear, local, translation-equivariant operation. Its parameters are shared across spatial positions — a single filter detects the same pattern regardless of where it appears in the image. This weight-sharing dramatically reduces parameter count compared to fully connected layers: a 3×3 filter operating on 256→256 channels uses only 3×3×256×256 = 589,824 parameters versus 65,536² for a fully connected layer.

**Key Formulas:**
```
(I * K)[i,j] = Σ_{m=-⌊k/2⌋}^{⌊k/2⌋} Σ_{n=-⌊k/2⌋}^{⌊k/2⌋}  I[i+m, j+n] · K[m,n]

Output_size = ⌊(W - k + 2p) / s⌋ + 1

Receptive field after L layers with k×k kernels: RF_L = 1 + L(k-1)
```

**Assumptions:** Stationarity (patterns are position-independent), locality (relevant patterns are compact), hierarchical compositionality (complex features = combinations of simple features).

**References:** LeCun et al. (1998), Krizhevsky et al. (2012 — AlexNet), He et al. (2016 — ResNet).

---

#### Topic 2: Self-Attention Mechanism for Vision

**Description:**
Scaled dot-product attention computes weighted sums of value vectors where weights are determined by the compatibility (dot product) between query and key vectors, normalized by the softmax function and scaled by `1/√d_k` to prevent gradient saturation. In the vision context, each image patch is a token; the attention matrix captures pairwise spatial relationships — allowing the model to associate a patch in the upper-left with a semantically related patch in the lower-right within a single layer.

Multi-head attention parallelizes this across `h` attention heads with independent projections, each learning a different type of relationship (texture vs. semantics, local vs. global). The computational complexity `O(N²·D)` for sequence length `N` motivates efficient variants: Swin Transformer's window attention `O(N·w²·D)`, Performer's random feature approximation `O(N·D²)`, and Flash Attention's IO-aware exact computation.

**Key Formulas:**
```
Attention(Q,K,V) = softmax(QK^T / √d_k) · V

MultiHead(Q,K,V) = Concat(head_1,...,head_h) · W^O
head_i = Attention(Q·W_i^Q, K·W_i^K, V·W_i^V)

For N patches, d_k = D/h:
Complexity = O(N²·D)  [ViT global attention]
           = O(N·w²·D) [Swin window attention, w = window size]
```

**Assumptions:** Positional information must be explicitly injected (sinusoidal or learned positional encodings); attention is permutation-equivariant without positional encoding.

**References:** Vaswani et al. (2017 — Attention Is All You Need), Dosovitskiy et al. (2021 — ViT), Liu et al. (2021 — Swin).

---

#### Topic 3: Loss Functions (Cross-Entropy, IoU, Contrastive)

**Description:**
The choice of loss function determines what a model optimizes and directly affects behavior at inference time. Three families dominate CV:

**(a) Cross-Entropy** is the negative log-likelihood of the true label under the predicted categorical distribution. It is the standard for classification at all granularities (image, pixel, patch). Weighted cross-entropy and Focal Loss are extensions that handle class imbalance.

**(b) IoU-based losses** for detection directly optimize geometric overlap between predicted and ground-truth boxes — more consistent with the evaluation metric (mAP) than coordinate regression losses. CIoU adds center distance and aspect ratio terms for better gradient flow in all cases.

**(c) Contrastive/InfoNCE losses** push together similar embeddings and pull apart dissimilar ones in a learned metric space. Used in CLIP, SimCLR, and face recognition (ArcFace uses an angular margin in the softmax space).

**Key Formulas:**
```
Cross-Entropy: L_CE = -Σ_c y_c · log(p_c)

Focal Loss:    L_FL = -(1-p_t)^γ · log(p_t)     [γ=2 typical]

IoU Loss:      L_IoU = 1 - |P∩G| / |P∪G|

CIoU Loss:     L_CIoU = 1 - IoU + ρ²(b,b^gt)/c² + α·v

InfoNCE:       L = -log[ exp(sim(z_i,z_j)/τ) / Σ_k exp(sim(z_i,z_k)/τ) ]

ArcFace:       L = -log[ exp(s·cos(θ_{y_i}+m)) / (exp(s·cos(θ_{y_i}+m)) + Σ_{j≠y_i} exp(s·cos(θ_j))) ]
```

**References:** Lin et al. (2017 — Focal Loss), Zheng et al. (2020 — CIoU), Oord et al. (2018 — InfoNCE), Deng et al. (2019 — ArcFace).

---

#### Topic 4: Feature Pyramid Networks — Mathematical Basis

**Description:**
FPN is grounded in the observation that CNN feature maps form a natural scale-space pyramid: level `l` has resolution `1/2^l` of the input and semantic richness proportional to `l`. The problem is that deep, semantically rich features have poor spatial resolution (no fine-grained localization), while shallow, spatially precise features have poor semantics (can not distinguish classes). FPN solves this by building a bidirectional feature hierarchy.

The top-down pathway creates a new set of feature maps `{P_l}` that carry both semantic depth (from upsampled coarser levels) and spatial precision (from lateral connections to the backbone). After fusion, all pyramid levels share the same `D = 256` channel dimensionality via 3×3 convolutions, enabling detection heads to operate identically across scales.

**Key Formulas:**
```
Lateral connection:  L_l = Conv_{1×1}(C_l)           [channel reduction]
Top-down fusion:     P_l = L_l + Upsample_2x(P_{l+1}) [element-wise add]
Output level:        P_l = Conv_{3×3}(P_l)            [anti-aliasing]

Anchor scale at level P_l: s_l = 2^{l+2} · base_anchor   [e.g., P3=32px, P7=512px]
```

**Assumptions:** Deeper backbone features are more semantic; spatial resolution and semantic richness are inversely correlated; multi-scale predictions are independent.

**References:** Lin et al. (2017 — FPN), Tan et al. (2020 — BiFPN/EfficientDet), Liu et al. (2018 — PANet).

---

#### Topic 5: Diffusion Models for Computer Vision

**Description:**
Denoising Diffusion Probabilistic Models (DDPMs) define a two-process framework: a fixed forward process gradually adds Gaussian noise to data over `T` timesteps until the data becomes pure noise `x_T ~ N(0,I)`; a learned reverse process trains a neural network `ε_θ` to predict the noise at each step, effectively learning to denoise. Sampling proceeds by starting from random noise and iteratively applying the learned denoiser.

In practice, Latent Diffusion Models (LDM — Stable Diffusion) apply the diffusion process in the compressed latent space of a pretrained VAE encoder, dramatically reducing compute. Conditioning (on text, class labels, image) is injected via cross-attention in the U-Net denoiser backbone. This framework enabled text-to-image generation at unprecedented quality and has since been applied to video synthesis, 3D generation, super-resolution, inpainting, and image editing.

**Key Formulas:**
```
Forward process: q(x_t|x_{t-1}) = N(x_t; √(1-β_t)·x_{t-1}, β_t·I)

Closed form:     q(x_t|x_0) = N(x_t; √ᾱ_t·x_0, (1-ᾱ_t)·I)
                 ᾱ_t = Π_{s=1}^{t} (1-β_s)

Training objective: L_simple = E_{t,x_0,ε}[||ε - ε_θ(√ᾱ_t·x_0 + √(1-ᾱ_t)·ε, t)||²]

Classifier-free guidance:  ε̃_θ(x_t,c) = ε_θ(x_t,∅) + w·(ε_θ(x_t,c) - ε_θ(x_t,∅))
```

**References:** Ho et al. (2020 — DDPM), Rombach et al. (2022 — LDM/Stable Diffusion), Song et al. (2020 — DDIM), Peebles & Xie (2022 — DiT).

---

### 8. Evolution Timeline (15 Milestones)

| Year | Milestone | Significance |
|------|-----------|-------------|
| **1998** | **LeNet-5** (LeCun et al.) | First practical CNN for digit recognition; proved convolutional weight sharing on MNIST — laid the architectural blueprint for all future CNNs |
| **2012** | **AlexNet** (Krizhevsky, Sutskever, Hinton) | Won ImageNet LSVRC-2012 with 15.3% top-5 error (vs. 26.2% runner-up); catalyzed the deep learning revolution; introduced GPU training, ReLU, dropout, and data augmentation at scale |
| **2014** | **VGGNet & GoogLeNet/Inception** | VGG showed that depth with 3×3 filters is the key variable; Inception introduced multi-scale parallel branches and 1×1 bottlenecks — efficiency concepts still used today |
| **2015** | **Faster R-CNN** (Ren et al.) | Unified object proposal and classification in a single end-to-end network using a Region Proposal Network (RPN); set the two-stage detection paradigm |
| **2016** | **ResNet** (He et al.) | Residual connections solved the degradation problem; 152-layer networks possible; won ImageNet, COCO, ImageNet Detection, ImageNet Localization simultaneously |
| **2017** | **FPN + Mask R-CNN + Focal Loss/RetinaNet** | Simultaneous advances in detection scale handling (FPN), instance segmentation (Mask R-CNN), and one-stage accuracy (RetinaNet) — the "golden year" of detection |
| **2018** | **YOLOv3 + CornerNet** | YOLOv3 achieved 57.9 AP_{50} at 51 FPS; CornerNet introduced anchor-free detection via corner heatmaps — beginning of the anchor-free era |
| **2020** | **DETR + RAFT + NeRF** | Three paradigm shifts: end-to-end detection (DETR), state-of-the-art optical flow (RAFT), and neural implicit scene representation (NeRF) all published within months |
| **2021** | **ViT + CLIP + DeiT + Swin** | Vision Transformers went from curiosity to dominant architecture; CLIP demonstrated zero-shot transfer via language supervision; Swin made ViT efficient enough for dense prediction |
| **2022** | **MAE + Stable Diffusion + Segment-Anything (early)** | Masked Autoencoders proved ViT pretraining does not need labels; Stable Diffusion democratized image generation; visual AI entered mainstream creative tools |
| **2023** | **SAM + DINOv2 + LLaVA + GPT-4V** | Meta released universal segmentation (SAM) and universal visual features (DINOv2); OpenAI's GPT-4V and open LLaVA established multimodal LLM as the new CV interface paradigm |
| **2023** | **3D Gaussian Splatting** | Real-time photorealistic novel view synthesis without neural rendering; immediately adopted in AR/VR, robotics, and digital twin creation |
| **2024** | **SAM2 + Depth Anything v2 + Florence-2** | SAM extended to video; monocular depth estimation reached metric accuracy; Florence-2 demonstrated unified vision-language generation over 800M image annotations |
| **2024** | **InternVL2 + LLaVA-NeXT + Qwen-VL-Max** | Open-source multimodal models reached GPT-4V parity on most benchmarks; multimodal AI became deployable by any team |
| **2025** | **Vision-Language-Action (VLA) Models** | RT-2, OpenVLA, π0 combine CV + LLM for robotic manipulation; the "closed loop" from perception to action via language reasoning becomes production-viable |

---

### 9. Cross-Domain Connections

#### B03 Computer Vision ↔ B02 Document Intelligence

Computer Vision is the perceptual layer for Document Intelligence. All scanned document processing begins with image preprocessing (deskewing, binarization, noise removal) using classical CV techniques. Modern document AI pipelines use vision models at multiple stages: layout detection (DocLayNet, DiT, LayoutLMv3) uses object detection-style heads to identify text blocks, tables, figures, and headers from document page images. Table structure recognition uses grid-based instance segmentation. VQA-style models (Donut, Pix2Struct) consume document images end-to-end without explicit OCR. The shared technological base is ViT encoders pretrained on document images — both B02 and B03 benefit from DINOv2-style self-supervised pretraining.

**Shared algorithms:** ViT encoder, object detection (table/figure detection), OCR (TrOCR/PaddleOCR), document VQA (Donut, LLaVA for documents)

#### B03 Computer Vision ↔ B04 NLP & Language AI

The convergence of vision and language is the defining trend of 2023–2026. CLIP creates a shared embedding space between images and text — enabling zero-shot vision classification, cross-modal retrieval, and conditioning of generative models. LLaVA, InstructBLIP, and Gemini use vision encoders (DINOv2, CLIP-ViT) as "visual tokenizers" feeding into language model decoders, enabling image captioning, visual question answering, chart understanding, and spatial reasoning described in natural language. This creates a new interface paradigm: natural language becomes the universal API for visual analysis.

**Shared algorithms:** CLIP (contrastive vision-language pretraining), cross-attention (vision tokens attend to text context), multimodal instruction tuning (LLaVA), visual grounding (GLIP, Grounding DINO)

#### B03 Computer Vision ↔ B07 Anomaly Detection & Monitoring

Visual anomaly detection is a major CV application in manufacturing (defect inspection), infrastructure (crack/corrosion monitoring), and medical imaging (pathology detection). The challenge is unsupervised or few-shot learning: normal product appearances are abundant, defects are rare and diverse. Recent methods adapt self-supervised ViT features (PatchCore, PaDiM): extract patch-level features from a pretrained DINOv2 model, build a memory bank of normal feature distributions, and score new samples by nearest-neighbor distance to the memory bank. SAM enables fine-grained defect localization. Video CV connects to B07 via temporal anomaly detection in surveillance video.

**Shared algorithms:** PatchCore (feature-based anomaly), CFlow-AD (normalizing flows on visual features), reconstruction-based autoencoders, SAM for defect localization

#### B03 Computer Vision ↔ B08 Conversational AI

Conversational AI systems increasingly incorporate vision through multimodal LLMs. A user can upload a product photo and ask "what is wrong with this item?" or share a chart and ask "summarize the trend." The technical pipeline connects a vision encoder (frozen DINOv2/CLIP-ViT) to an LLM (Llama, Mistral, Qwen) via a projection layer (MLP or Q-Former), then instruction-tunes the system on multimodal conversation data. This creates a conversational interface for visual analysis — eliminating the need for task-specific CV model selection by end users.

**Shared algorithms:** Vision encoder + LLM integration (LLaVA-style), Q-Former (InstructBLIP), multimodal instruction following, RAG with visual embeddings (image → embedding → vector store retrieval)

---

### 10. Knowledge Structure Map

What a practitioner needs to know — organized by learning stage and specialization track.

```
COMPUTER VISION — PRACTITIONER KNOWLEDGE MAP
═══════════════════════════════════════════════

LEVEL 0 — PREREQUISITES (Before CV)
├── Python (NumPy, Matplotlib, PIL/OpenCV)
├── Linear Algebra (matrix multiply, eigenvalues, SVD)
├── Probability & Statistics (Bayes, distributions, MLE)
├── Calculus (partial derivatives, chain rule)
└── Neural Network Basics (MLP, backprop, SGD)

LEVEL 1 — CORE CV FUNDAMENTALS
├── Image Representation (RGB, grayscale, pixel operations)
├── Classical CV (edge detection, Hough, SIFT, ORB)
├── CNNs (convolution, pooling, activation, training)
├── Transfer Learning (pretrained models, fine-tuning)
└── Data: Augmentation, DataLoaders, standard benchmarks (ImageNet, COCO)

LEVEL 2 — APPLIED CV TRACKS
├── Track A: Detection & Segmentation
│   ├── Object Detection (YOLO, Faster R-CNN, DETR)
│   ├── Semantic Segmentation (DeepLab, SegFormer)
│   ├── Instance Segmentation (Mask R-CNN, SAM)
│   └── Evaluation (mAP, mIoU, NMS, COCO API)
│
├── Track B: Vision Transformers & Foundation Models
│   ├── ViT architecture (patches, positional encoding, MHSA)
│   ├── Swin Transformer (hierarchical windows)
│   ├── DINOv2 (self-supervised ViT features)
│   └── CLIP (contrastive image-text)
│
├── Track C: Video & Motion
│   ├── Optical Flow (RAFT, warping, temporal consistency)
│   ├── Video Classification (SlowFast, VideoMAE)
│   └── Multi-Object Tracking (ByteTrack, StrongSORT)
│
├── Track D: 3D Vision
│   ├── Monocular Depth (DepthAnything, DPT)
│   ├── Point Clouds (PointNet, Open3D)
│   └── NeRF / 3D Gaussian Splatting
│
└── Track E: Multimodal Vision-Language
    ├── CLIP & zero-shot classification
    ├── LLaVA / InstructBLIP (VQA)
    └── Text-to-Image (Stable Diffusion, ControlNet)

LEVEL 3 — PRODUCTION & MLOPS
├── Model Optimization (quantization INT8, TensorRT, ONNX)
├── Edge Deployment (ONNX Runtime, TFLite, OpenVINO)
├── Data Pipeline (labeling tools, CVAT, Label Studio)
├── Experiment Tracking (MLflow, Weights & Biases)
└── Serving (Triton Inference Server, FastAPI + UV)

LEVEL 4 — RESEARCH FRONTIER
├── Architecture Design (attention variants, sparse attention)
├── Self-Supervised Learning (MAE, DINO, contrastive)
├── Efficient Inference (flash attention, speculative decoding)
├── Synthetic Data & Sim-to-Real
└── Multimodal Foundation Models (GPT-4o, Gemini, InternVL)
```

---

### 11. Confidence Assessment

| Finding | Confidence | Evidence Source |
|---------|-----------|-----------------|
| ResNet, ViT, YOLO are production-ready and widely deployed | Very High (98%) | Extensive deployment literature, benchmark papers, open-source adoption metrics |
| CLIP's zero-shot transfer capabilities | Very High (97%) | Reproduced across hundreds of papers; public CLIP benchmarks well-documented |
| SAM's zero-shot generalization to new domains | High (90%) | Demonstrated on diverse datasets in original paper; some domain gap reported in narrow medical domains |
| DINOv2 features as universal visual encoder | High (88%) | Strong benchmark results; limitations in fine-grained recognition tasks with very specific domains (e.g., industrial defects) reported |
| NeRF/3DGS for real-time reconstruction | High (85%) | 3DGS achieves real-time synthesis; quality degrades with sparse input views; not all scenes reconstruct well |
| Depth Anything v2 SOTA for monocular depth | High (87%) | Published April 2024 with strong benchmark results; newer models (FoundationStereo 2025) may surpass in some metrics |
| Diffusion models for CV (segmentation, detection) | Medium-High (80%) | Active research; diffusion-based detection (DiffusionDet) shown but not yet production-dominant |
| VLA models (RT-2, OpenVLA) for robotics production readiness | Medium (65%) | Promising research results; real-world deployment reliability still being established as of early 2026 |
| SAM2 video performance across all domains | Medium-High (78%) | Strong on natural video; performance on industrial/medical video less established |
| Timeline of milestones (exact dates) | High (92%) | Cross-referenced against multiple publication venues and arxiv dates |

---

### 12. Open Questions and Research Gaps

#### 12.1 Fundamental Research Gaps

**1. Compositional Visual Reasoning**
Current models excel at pattern recognition but struggle with systematic compositional reasoning: given "a blue cube to the left of a red sphere above a green cylinder," models fail on novel compositions unseen in training. Neuro-symbolic integration remains an open problem — how to combine statistical visual features with structured logical reasoning.

**2. Robustness and Distribution Shift**
Even SOTA models show dramatic performance drops under natural distribution shifts (weather, lighting, camera model, resolution changes). Certified robustness for CV — provable guarantees that a model's prediction is invariant within a perturbation radius — scales only to small images and shallow networks. Production systems require extensive domain adaptation work for each deployment context.

**3. Sample Efficiency**
The human visual system learns to recognize new objects from 1–5 examples; modern CV models require hundreds to thousands of labeled examples even with strong pretrained backbones for fine-grained specialization (e.g., recognizing rare industrial defect types). True few-shot learning for visual recognition remains unsolved at human performance levels.

**4. Causal Visual Understanding**
Current models are fundamentally correlational: they learn that sky is usually at the top and grass at the bottom. They cannot reason about counterfactuals ("what would this scene look like if the lighting came from the left?") or perform intervention-based reasoning. Causal representation learning for vision is nascent.

#### 12.2 Engineering and Deployment Gaps

**5. Real-Time 3D Understanding at Scale**
3D Gaussian Splatting enables real-time rendering for pre-captured scenes but cannot reconstruct dynamic scenes in real time. Real-time continuous 3D scene understanding from monocular video — needed for augmented reality and robotics — remains computationally intractable without specialized hardware.

**6. Long-Video Understanding**
Most video models process clips of 1–30 seconds. Understanding events spanning hours (a full workday surveillance feed, a surgical procedure) requires temporal compression and hierarchical memory mechanisms that remain impractical. State space models (Mamba) and ring attention may partially address this.

**7. Multimodal Hallucination**
Vision-Language Models (LLaVA, GPT-4V) frequently hallucinate visual content — confidently describing objects not present in an image. Benchmarks (POPE, HallusionBench) reveal structured hallucination patterns correlated with language priors overwhelming visual evidence. Grounding mechanisms and uncertainty quantification for multimodal models are active research areas.

**8. Efficient On-Device Vision**
Deploying ViT-based models on edge devices (Raspberry Pi, microcontrollers) requires extreme compression (INT4 quantization, structured pruning, knowledge distillation) that often incurs 10–15% accuracy loss on specialized tasks. Efficient attention mechanisms for long sequences on hardware-constrained devices remain an active problem.

#### 12.3 Open Research Questions

- Can self-supervised pretraining fully replace supervised ImageNet pretraining for all downstream CV tasks?
- What is the "scaling law" for vision models — does performance continue to scale with data and parameters without saturation?
- Can a single universal visual foundation model (e.g., a 100B parameter visual model) serve all CV tasks without task-specific adapters?
- How should uncertainty be represented and communicated in visual predictions for safety-critical applications (medical diagnosis, autonomous driving)?
- Is there a theoretical basis for why ViT self-attention learns semantically meaningful spatial groupings (proto-segmentation) without explicit supervision?

---

*Report generated by Dr. Archon (R-α) — Chief Research & Architecture Strategist, MAESTRO Knowledge Graph Platform*
*Classification: Phase 1, Module B03 | Depth Level: L3 | Status: COMPLETE*
