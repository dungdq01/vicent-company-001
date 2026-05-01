# Deep Learning Engineer Notes: Generative AI (B09)
## By ArchNeuron (R-DLE) — Date: 2026-03-31

### Transformer Variants

The Transformer remains the dominant architecture for generative AI:

- **Decoder-only (GPT-style)**: Causal autoregressive. Used by GPT-4, Llama, Mistral, Qwen. Dominant for text generation. Simple, scales well, benefits from next-token prediction pretraining. Architecture: token embedding -> N x (masked self-attention + FFN) -> LM head.
- **Encoder-decoder (T5-style)**: Separate encoder and decoder with cross-attention. Used by T5, BART, Flan. Better for seq2seq tasks (translation, summarization) but largely superseded by decoder-only models at scale.
- **Mixture of Experts (MoE)**: Each FFN layer replaced by N experts with a router. Only K experts active per token. Mixtral 8x7B: 46.7B total parameters, ~13B active per token. Benefits: more capacity at same inference cost. Challenges: load balancing, memory (all experts must be loaded), training instability. Deepseek-V3 used MoE with 256 experts to reach frontier performance.
- **State-space models (Mamba, RWKV)**: Linear-time alternatives to attention. Mamba-2 shows competitive results up to 7B scale. Hybrid architectures (Jamba = Mamba + attention layers) hedge both approaches. Not yet proven at 70B+ scale.

### Diffusion Model Architectures

Diffusion models dominate image (and increasingly video) generation:

- **U-Net based**: Original architecture for Stable Diffusion 1.x-2.x. Encoder-decoder with skip connections. Cross-attention layers inject text conditioning. Proven, well-understood, extensive community tooling.
- **DiT (Diffusion Transformer)**: Replace U-Net with a Transformer operating on patched latent representations. Used by Stable Diffusion 3, DALL-E 3, Sora. Scales better than U-Net — follows LLM scaling laws more closely. Architecture: patchify latent -> N x (self-attention + cross-attention + FFN) -> unpatchify.
- **Flux**: Black Forest Labs' architecture. Flow matching (rectified flow) instead of DDPM/DDIM noise scheduling. Faster convergence, fewer sampling steps needed. Flux.1 Dev achieves high quality in 20-30 steps.
- **Latent diffusion**: All modern image models operate in latent space (VAE-encoded). 8x or 16x spatial compression. Dramatically reduces compute vs pixel-space diffusion.
- **Video architectures**: Temporal attention layers added to DiT. Sora, Kling, and Runway Gen-3 use spatiotemporal DiT variants. Key challenge: temporal consistency across frames.

### Attention Optimization

Attention is the computational bottleneck — O(n^2) in sequence length:

- **FlashAttention (v1/v2/v3)**: Fused CUDA kernel that computes exact attention without materializing the N x N attention matrix. 2-4x speedup, significant memory savings. FlashAttention-3 (Hopper GPUs) uses asynchronous operations for additional speedup. Now the default in all serious training and inference frameworks.
- **PagedAttention**: Used by vLLM. Manages KV-cache memory like OS virtual memory with paging. Eliminates memory fragmentation during serving. Enables near-optimal memory utilization for variable-length sequences in a batch. Increases serving throughput by 2-4x.
- **KV-cache**: Stores key/value tensors from past tokens to avoid recomputation during autoregressive generation. Size per token: 2 x num_layers x hidden_dim x 2 bytes (bf16). For Llama 70B at 4096 context: ~2.5 GB per sequence. This is often the memory bottleneck in serving.
- **Grouped Query Attention (GQA)**: Share KV heads across multiple query heads. Llama 2 70B uses 8 KV heads with 64 query heads. Reduces KV-cache by 8x with minimal quality loss.
- **Multi-Query Attention (MQA)**: Extreme case — single KV head. Used by Falcon. Maximum KV-cache savings.
- **Ring Attention**: Distribute attention computation across devices for very long sequences (1M+ tokens). Each device holds a chunk of KV and passes to neighbors in a ring.

### Model Quantization

Quantization reduces model size and speeds inference with manageable quality loss:

- **GPTQ**: Post-training quantization using second-order information (Hessian). 4-bit and 3-bit variants. Quality: 4-bit GPTQ is nearly lossless for models > 7B. Requires calibration dataset (128-256 samples). GPU-optimized inference via AutoGPTQ or ExLlama.
- **AWQ (Activation-Aware Weight Quantization)**: Identifies salient weights via activation magnitudes, quantizes less important weights more aggressively. Slightly better quality than GPTQ at same bit-width. Good tooling support.
- **GGUF (GGML Universal Format)**: llama.cpp's quantization format. Supports CPU inference and mixed CPU/GPU. Multiple quantization levels: Q4_K_M (4.8 bits avg, good quality), Q5_K_M (5.3 bits, near-lossless), Q2_K (2.6 bits, significant quality loss). Ideal for edge deployment and Mac inference.
- **FP8**: Native on H100/4090. Minimal quality loss, 2x throughput vs FP16. Increasingly the standard inference dtype for larger deployments.
- **Practical guidance**: For production serving, use AWQ or GPTQ 4-bit on GPUs, GGUF Q4_K_M for CPU/edge. For models < 3B, quantization below 8-bit causes noticeable degradation.

### Speculative Decoding

Speculative decoding accelerates autoregressive generation:

- **Concept**: Use a small draft model to generate K candidate tokens quickly. Verify all K tokens in parallel with the large target model. Accept tokens that match target distribution, reject and resample from the first mismatch.
- **Speedup**: 2-3x for typical text generation. Higher acceptance rate = higher speedup. Works best when draft model is a good approximation of the target.
- **Draft model options**: Smaller model from same family (Llama 8B drafts for Llama 70B), or self-speculative (early exit from the target model's own layers).
- **Medusa**: Adds multiple prediction heads to the target model itself. Each head predicts a future token. No separate draft model needed. 2x speedup typical.
- **EAGLE**: Trains a small autoregressive head on top of the target model's hidden states. 3x speedup reported.

### Multimodal Architectures

Vision-language models (VLMs) combine visual and textual understanding:

- **Architecture patterns**: (1) Vision encoder (ViT/SigLIP) + projector + LLM decoder. Used by LLaVA, Qwen-VL. (2) Early fusion — interleave image tokens with text tokens from the start. Used by Gemini, Fuyu.
- **Vision encoders**: SigLIP (Google) and InternViT are current best options. Typical resolution: 384x384 to 768x768. Higher resolution = more tokens = more compute.
- **Projector**: MLP or cross-attention layer that maps vision encoder outputs to LLM embedding space. Simplest effective approach: 2-layer MLP.
- **Any-resolution handling**: Partition high-res images into tiles, encode each tile separately. LLaVA-NeXT and Qwen-VL2 support dynamic resolution.
- **Video understanding**: Sample frames, encode each as image, add temporal position embeddings. Current models handle 30-60 frames effectively.

### Training Stability Techniques

Large generative model training is prone to instability:

- **Loss spikes**: Common in LLM pre-training. Caused by bad data batches or gradient explosions. Mitigate with gradient clipping (max_norm=1.0), learning rate warmup, and data quality filtering.
- **bf16 vs fp32**: Train in bf16 (bfloat16) for speed, keep optimizer states in fp32 for stability. Mixed precision is standard.
- **Z-loss**: Add auxiliary loss to stabilize logit magnitudes. Prevents attention entropy collapse. Used in PaLM and subsequent large models.
- **QK-norm**: Normalize query and key vectors before attention computation. Prevents attention logit growth. Used in Gemma, Llama 3.
- **Mu-parametrization (muP)**: Hyperparameter transfer from small to large models. Train small proxy model, transfer optimal hyperparameters. Reduces costly large-scale hyperparameter search.
- **Gradient accumulation checkpointing**: Trade compute for memory. Recompute activations during backward pass instead of storing them. Reduces memory by ~60% at ~30% compute overhead.

### Recommendations for B09

1. Default to decoder-only Transformer for text generation. Consider MoE only if you need large capacity with constrained inference budget.
2. Use FlashAttention and GQA as non-negotiable baselines — they are free performance.
3. For image generation, adopt DiT/Flux architectures over U-Net for new projects — better scaling properties.
4. Quantize all production models to 4-bit (AWQ/GPTQ) or FP8. The quality tradeoff is minimal for models >= 7B.
5. Implement speculative decoding for any latency-sensitive text generation endpoint — 2-3x speedup with no quality loss.
6. For multimodal, start with LLaVA-style architecture (vision encoder + projector + LLM) — simplest to implement and debug.
7. Invest in training stability from the start: gradient clipping, QK-norm, bf16 mixed precision, and proper warmup schedules.
