# Deep Learning Notes: B04 NLP
## By R-DLE — Date: 2026-03-31

---

### 1. Transformer Architecture Deep Dive

The Transformer (Vaswani et al., 2017) fundamentally replaced RNN/LSTM sequence modeling with a fully attention-based architecture. Three architectural families exist:

**Encoder-only (BERT family)**: bidirectional attention, reads the full sequence simultaneously. Optimal for tasks requiring full-sequence understanding: classification, NER, semantic similarity. Cannot generate autoregressively.

**Decoder-only (GPT family)**: causal (left-to-right) masked attention. Each token attends only to previous tokens. Optimal for language generation; has become the dominant architecture for LLMs.

**Encoder-Decoder (T5/BART family)**: encoder processes input bidirectionally; decoder attends to encoder output via cross-attention and generates output autoregressively. Optimal for seq2seq tasks: translation, summarization, structured extraction.

**Core Components:**

**Multi-Head Attention (MHA)**
The attention mechanism computes: `Attention(Q, K, V) = softmax(QK^T / √d_k) V`
where Q (queries), K (keys), V (values) are linear projections of the input. Multi-head runs h independent attention heads in parallel, each with dimension d_k = d_model / h, then concatenates and projects: `MHA(Q,K,V) = Concat(head_1,...,head_h) W^O`. The √d_k scaling prevents vanishing gradients when d_k is large.

**Feed-Forward Network (FFN)**
Applied independently to each position: `FFN(x) = max(0, xW_1 + b_1)W_2 + b_2`. Typically d_ff = 4 × d_model. The FFN functions as a key-value memory store (Geva et al., 2020) — factual knowledge is largely stored in FFN weights, not attention.

**Layer Normalization**
Pre-LN (applied before attention/FFN sublayers) is now standard over Post-LN (original Transformer). Pre-LN stabilizes training at large scale by normalizing before the potentially high-variance attention output.

**Positional Encoding**
Original: fixed sinusoidal PE. GPT-2 era: learned absolute PE. Modern LLMs: RoPE (Rotary Position Embedding) — position information is injected at the attention QK multiplication stage, not added to the embedding.

---

### 2. Attention Variants

**Full Self-Attention O(n²)**
Standard attention requires O(n²) memory and compute with respect to sequence length n. For n=4096, this is 16M attention weight values per head per layer — manageable. For n=128K (Claude, GPT-4 context), it becomes 16B values — infeasible without optimization.

**Flash Attention (Dao et al., 2022 / 2023)**
Avoids materializing the full n×n attention matrix by computing attention in tiles that fit in SRAM (fast GPU memory), using online softmax normalization. Result: exact same output as standard attention, but 2–4x faster and O(n) memory (instead of O(n²)). Flash Attention 2 added parallelization across query blocks. Flash Attention 3 (2024) added further optimizations for H100 tensor cores. Required for any serious production LLM work — always enable with `attn_implementation="flash_attention_2"`.

**Sliding Window Attention (Mistral)**
Each token attends only to a local window of W preceding tokens instead of all n tokens. Complexity: O(n × W). Mistral-7B uses W=4096 with rolling buffer KV cache. Long-range dependencies are handled through layer stacking (information propagates W tokens per layer, so L layers cover W×L total range). Limitation: cannot retrieve information from beyond the window in a single layer.

**Grouped Query Attention (GQA) and Multi-Query Attention (MQA)**
Standard MHA: each head has its own Q, K, V projections. MQA: all heads share a single K and V projection (only Q is per-head). GQA: K and V are shared among groups of heads (e.g., 8 query heads share 2 KV heads). Impact: KV cache size is reduced by 4–8x, enabling longer context at the same VRAM. LLaMA-3 and Mistral use GQA. Inference throughput improves significantly due to reduced memory bandwidth for KV cache reads.

**MLA (Multi-head Latent Attention) — DeepSeek**
Introduced in DeepSeek-V2. Instead of caching full K and V matrices, MLA projects them to a low-dimensional latent vector c that is cached, then reconstructs K and V at inference time. Reduces KV cache size by ~5.5x compared to GQA while maintaining or improving model quality. The mathematical insight: `c_KV = W^{DKV} h_t` (compress), then `K = W^{UK} c_KV`, `V = W^{UV} c_KV` (decompress). Only c_KV needs to be cached.

---

### 3. Modern LLM Architecture Innovations

**RoPE (Rotary Position Embedding)**
RoPE encodes position m by rotating the query/key vectors at angle m × θ_i where θ_i = 10000^{-2i/d} for dimension i. The dot product QK^T then naturally encodes relative position (m - n) rather than absolute positions. Key property: the attention score depends only on the relative position of query and key tokens, not their absolute indices. This makes RoPE naturally extendable to longer contexts than seen during training (with techniques like YaRN, LongRoPE).

**SwiGLU Activation**
Introduced in PaLM and adopted by LLaMA family. Replaces ReLU in FFN layers: `SwiGLU(x) = Swish(xW_1) ⊗ (xW_2)` where `Swish(x) = x * σ(x)` and ⊗ is element-wise product. The gating mechanism allows the network to selectively pass information. In practice, SwiGLU requires expanding the FFN to 8/3 × d_model (not 4×) to maintain parameter count equivalent to ReLU FFN. Empirically outperforms ReLU and GELU by ~1% perplexity at the same parameter count.

**RMSNorm**
`RMSNorm(x) = x / RMS(x) * γ` where `RMS(x) = sqrt(mean(x²))`. Removes the mean-centering step of LayerNorm. Computationally cheaper and empirically equivalent. Used in LLaMA, Mistral, Gemma, and most modern LLMs.

**KV Cache Mechanics**
During autoregressive decoding, each new token must attend to all previous tokens' K and V values. Instead of recomputing these each step, they are stored in a cache. Cache size: 2 × n_layers × n_kv_heads × seq_len × d_head × bytes_per_element. For LLaMA-3-8B at fp16 with GQA (8 KV heads), 4096 seq length: 2 × 32 × 8 × 4096 × 128 × 2 bytes ≈ 0.54GB. At 128K context: ~17GB just for KV cache. PagedAttention (vLLM) manages KV cache as paged memory to avoid fragmentation across concurrent requests.

---

### 4. BERT Pretraining Deep Dive

**Masked Language Modeling (MLM)**
15% of input tokens are selected for masking. Of these: 80% replaced with [MASK], 10% replaced with random token, 10% kept unchanged. This noise prevents the model from trivially learning the identity function and forces deep contextual understanding. The model predicts the original token from context using a classification head over vocabulary.

**Next Sentence Prediction (NSP)**
BERT is also trained to predict whether sentence B follows sentence A. Later shown to be largely unhelpful (RoBERTa ablation study, 2019) — removing NSP and training with longer sequences improves downstream performance. PhoBERT and RoBERTa both drop NSP.

**WordPiece Tokenization**
BERT uses WordPiece: vocabulary built by iteratively merging frequent character pairs. Subword tokens representing word suffixes are prefixed with `##` (e.g., "tokenization" → ["token", "##ization"]). Vietnamese WordPiece: often splits Vietnamese words at syllable boundaries, which can destroy morphological units.

**Pretraining vs Fine-tuning Dynamics**
BERT pretraining creates general-purpose contextual representations. Fine-tuning adds a task head (linear layer) on top of the [CLS] token (classification) or all token representations (NER/span extraction). Fine-tuning dynamics: learning rate must be much smaller than pretraining (1e-5 to 5e-5 vs 1e-4); train for 3–10 epochs only; catastrophic forgetting can occur if fine-tuning LR is too high. Layer-wise learning rate decay (LLRD): lower layers (near embedding) use smaller LR than upper layers, since lower layers encode general features that should change less.

---

### 5. Autoregressive LM Deep Dive

**Causal Attention Mask**
In decoder-only models, the attention mask is a lower-triangular binary matrix: position i can attend to positions j ≤ i only. This is implemented as: `masked_score = score + (1 - mask) * (-1e9)` before softmax, effectively zeroing out future token attention weights. The mask is applied identically across all heads and layers.

**Sampling Strategies**
- Greedy: always select argmax token. Fast, deterministic, but repetitive.
- Temperature: divide logits by T before softmax. T < 1 sharpens distribution (more focused); T > 1 flattens it (more diverse). T = 0 approaches greedy.
- Top-k: sample from only the k highest-probability tokens. Prevents sampling very low-probability garbage tokens.
- Top-p (nucleus sampling): sample from the smallest set of tokens whose cumulative probability ≥ p. Adapts vocabulary size to context (high-entropy situations allow more options; low-entropy situations restrict to confident predictions). Standard in production: temperature=0.7, top-p=0.9.

**Speculative Decoding**
Autoregressive LLM decoding is memory-bandwidth bound (one forward pass per token). Speculative decoding uses a small draft model to generate K candidate tokens in parallel, then verifies all K tokens with the large target model in a single forward pass. If the large model agrees with the draft, all K tokens are accepted simultaneously. Speedup: 2–3x for greedy/low-temperature sampling. The acceptance criterion is based on rejection sampling to guarantee the output distribution equals the target model's distribution exactly.

**KV Cache and Its Limits**
During prefill (processing the full prompt), all K and V are computed and cached. During decode (generating tokens), only the new token's K and V are computed. Memory scales linearly with sequence length. At long contexts (100K+), KV cache dominates VRAM usage. Strategies: KV cache quantization (8-bit or 4-bit), KV cache eviction (only retain "important" tokens based on attention scores — H2O method), and MLA compression (DeepSeek approach).

---

### 6. Mixture of Experts (MoE)

**Router Mechanism**
MoE replaces the dense FFN in each Transformer layer with N expert FFNs, where only top-K experts are activated per token. The router is a learned linear transformation: `router_logits = h W_r`, followed by softmax to produce gate weights `g_i = softmax(router_logits)_i`. Top-K selection: only the K experts with highest gate weights receive the token; their outputs are weighted-summed.

**Load Balancing Loss**
Without explicit regularization, the router collapses: a few experts receive all tokens and the others are never trained (expert collapse). The auxiliary load balancing loss penalizes uneven distribution: `L_balance = α * N * sum(f_i * P_i)` where f_i is the fraction of tokens routed to expert i and P_i is the average router probability for expert i. Typical α = 0.01.

**Mixtral Architecture (Mistral MoE)**
Mixtral-8x7B: 8 experts per FFN layer, top-2 routing. Each expert is a full 7B-scale FFN. Active parameters per token: ~12B (2 experts × 7B / 4 layers shared). Total parameters: ~46B. Result: quality comparable to 70B dense model at the computational cost of a 12B model. Expert specialization: experts do not strongly specialize by domain/topic, but rather by syntactic context and token type.

**DeepSeek MoE Architecture**
DeepSeek uses a fine-grained MoE with many more smaller experts (e.g., 64 experts, top-8 routing) rather than few large experts. Also introduces shared experts (always activated for every token) alongside routed experts. Advantages: finer specialization, more flexible routing, better load balance. DeepSeek-V3 (671B total, 37B active per token) achieves GPT-4-level performance.

**When MoE Wins**
MoE provides better performance-per-FLOP than dense models at scale. Preferred when: serving at scale where throughput matters; parameter count matters more than active compute; memory bandwidth is the bottleneck. MoE loses to dense models when: fine-tuning on small datasets (routing instability with few examples); deployment on single-GPU consumer hardware (all expert weights must be in VRAM even if not all are activated).

---

### 7. Efficient Fine-tuning Architectures

**LoRA Mathematical Foundation**
Pre-trained weight matrix W₀ ∈ R^{d×k} is frozen. LoRA injects trainable decomposition: `W = W₀ + ΔW = W₀ + BA` where B ∈ R^{d×r}, A ∈ R^{r×k}, and rank r << min(d, k). A is initialized with random Gaussian; B is initialized to zero, so ΔW = 0 at the start of training. The forward pass becomes: `h = W₀x + (BA)x = W₀x + B(Ax)`. The scaling factor α/r is applied: `h = W₀x + (α/r) * B(Ax)`.

The hypothesis: weight updates during fine-tuning have low intrinsic rank, i.e., the update matrix ΔW can be well-approximated by a low-rank decomposition. This has been empirically validated across many tasks and model families.

**Adapter Layers**
Insert small bottleneck modules (down-project → activation → up-project) after attention or FFN sublayers. Adapter: `h → h + f(hW_down)W_up` where W_down ∈ R^{d×m}, W_up ∈ R^{m×d}, m << d. Adds ~2 sequential linear layers per transformer sublayer — introduces inference latency. LoRA is preferred over adapters because LoRA can be merged into W₀ at inference time (zero added latency): `W_merged = W₀ + BA`.

**Prefix Tuning**
Prepend K learnable virtual tokens (prefix) to the key and value sequences of each attention layer. Only the prefix embeddings are trained. The prefix provides a soft prompt that conditions all attention operations. Memory-efficient but can be unstable to train; outperformed by LoRA in most benchmarks.

**Prompt Tuning**
Learnable token embeddings prepended to the input layer only (not per-layer like prefix tuning). Simpler than prefix tuning; requires large models (>10B) to work competitively. Used for soft prompt optimization without modifying model weights.

**Comparison Summary**

| Method | Trainable Params | Inference Overhead | Merge into Base | Stability |
|---|---|---|---|---|
| LoRA | Very low (~0.3%) | Zero (after merge) | Yes | High |
| QLoRA | Very low | Zero (after merge) | Yes | Medium |
| Adapters | Low (~1–5%) | Yes (+latency) | No | High |
| Prefix Tuning | Very low | Yes | No | Medium |
| Prompt Tuning | Minimal | Yes | No | Low |
| Full Fine-tune | 100% | Zero | N/A | High |

---

### 8. Emerging Architectures 2024-2026

**Mamba (State Space Models)**
Mamba (Gu & Dao, 2023) replaces attention with a selective state space model (SSM). The key innovation: selective state spaces where the SSM parameters (A, B, C, Δ) are functions of the input, allowing the model to decide what information to propagate through the hidden state. Complexity: O(n) in sequence length (vs O(n²) for attention). Inference: O(1) per token (constant hidden state, no KV cache growth). Limitation: in practice, Mamba struggles with in-context retrieval tasks where attention excels. Hybrid models (Jamba: Mamba + attention layers) outperform pure Mamba.

**RWKV (Receptance Weighted Key Value)**
RWKV reformulates attention as a linear recurrence, enabling both parallel training (like Transformer) and sequential inference (like RNN) via a mathematical equivalence. RWKV-6 (2024) achieves competitive performance with Transformer models at the same parameter count, with O(1) inference memory (no KV cache). Particularly efficient for long-context inference at edge devices. Weakness: limited ability to do precise token retrieval from arbitrary positions — attention is fundamentally better at needle-in-haystack tasks.

**RetNet (Microsoft)**
RetNet introduces retention — a mechanism with a dual form: parallel (for training) and recurrent (for inference). The parallel form is similar to attention but with a decay factor γ^{n-m} that attenuates older tokens. This creates O(n) parallel training and O(1) sequential inference. The decay factor means RetNet is inherently better at local context (recent tokens weighted more) — a different inductive bias from attention.

**Hybrid Architectures (2025-2026 Dominant Pattern)**
The emerging consensus: pure attention, pure SSM, and pure linear RNN all have blind spots. Hybrid architectures alternate between full attention layers (for global retrieval) and SSM/linear-attention layers (for cheap sequence processing). Pattern: 1 attention layer per 4–8 SSM layers. Examples: Jamba (Mamba + Transformer), Zamba, Falcon Mamba hybrids. For MAESTRO's use case (knowledge graph traversal requires precise token retrieval → attention layers needed; long document processing benefits from SSM efficiency): a hybrid architecture is likely optimal for a custom fine-tuned model. However, given the rapid pace of development, leveraging existing instruction-tuned LLMs via prompting/RAG remains more pragmatic than training custom architectures until the hybrid paradigm stabilizes.
