# ML Engineering Notes: B04 NLP
## By R-MLE — Date: 2026-03-31

---

### 1. Fine-tuning Pipeline Architecture

A robust NLP fine-tuning pipeline follows a strict sequential architecture where each stage is independently testable and reproducible. The pipeline for MAESTRO's use case (Vietnamese + English, knowledge graph extraction, instruction-following):

```
Raw Data Sources
    ↓
[Stage 1: Data Collection & Ingestion]
    - Web crawls, internal documents, labeled datasets
    - Format normalization → JSONL (one sample per line)
    ↓
[Stage 2: Data Preprocessing]
    - Language detection (langdetect / fastText LID)
    - Vietnamese tokenization (underthesea)
    - Deduplication (MinHash LSH, threshold 0.85 Jaccard)
    - Quality filtering (perplexity scoring, length filters)
    ↓
[Stage 3: Tokenization]
    - Load model-native tokenizer
    - Apply chat template (for instruction-tuned LLMs)
    - Truncation strategy: right-truncate, preserve system prompt
    - Output: input_ids, attention_mask, labels tensors
    ↓
[Stage 4: Model Initialization]
    - Load base model in target precision (bf16/fp16/8bit/4bit)
    - Apply PEFT config (LoRA / QLoRA adapter injection)
    - Freeze base weights if using PEFT
    ↓
[Stage 5: Training Loop]
    - Optimizer: AdamW with cosine LR scheduler + warmup
    - Gradient accumulation for effective large batch size
    - Mixed precision (bf16 preferred over fp16 for stability)
    - Gradient clipping: max_norm=1.0
    - Checkpoint every N steps to resume on failure
    ↓
[Stage 6: Evaluation]
    - Evaluate on held-out validation set every eval_steps
    - Log metrics: loss, perplexity, task-specific metrics
    - Early stopping on validation loss plateau
    ↓
[Stage 7: Export & Serving]
    - Merge LoRA adapters into base model (optional)
    - Convert to GGUF for llama.cpp / Ollama local inference
    - Export to ONNX for encoder models
    - Push to private HuggingFace Hub or model registry
```

The pipeline should be implemented in a framework that ensures reproducibility: fixed random seeds, logged hyperparameters, pinned library versions (`requirements.txt` with exact hashes).

---

### 2. LoRA/QLoRA Fine-tuning Guide

**When to Use LoRA vs Full Fine-tuning**

Full fine-tuning updates all model parameters. It yields the best possible performance but requires holding the entire model in GPU memory in fp32/bf16, which for a 7B model means ~56GB VRAM for training (optimizer states + gradients + activations). This is only feasible on A100-80GB or H100 setups with FSDP/DeepSpeed.

LoRA (Low-Rank Adaptation) injects trainable low-rank matrices into attention weight matrices while freezing the base model. It reduces trainable parameters by 99%+ and cuts VRAM requirements dramatically. QLoRA extends this by quantizing the frozen base model to 4-bit (NF4), enabling fine-tuning of 7B models on a single 24GB GPU.

**Practical Rule**: Use LoRA/QLoRA for all fine-tuning on hardware with <80GB VRAM per GPU. Use full fine-tuning only when absolute peak performance is needed and infrastructure supports it (multi-GPU with DeepSpeed ZeRO-3).

**Rank Selection Guidelines**

| Task Complexity | Recommended Rank (r) | Alpha (α) | Notes |
|---|---|---|---|
| Simple classification / style | 4–8 | 2r | Fewer trainable params |
| Domain adaptation | 16 | 2r | Good general default |
| Instruction following | 32–64 | 2r | More capacity needed |
| Complex reasoning / code | 64–128 | 2r | High rank for complex distributions |

Rule of thumb: set `lora_alpha = 2 * lora_r` for stable training. Higher rank = more capacity but also higher risk of overfitting on small datasets.

**Target Modules**
For LLaMA/Mistral family: target `q_proj`, `v_proj` at minimum; for better results add `k_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`.
For BERT family: target `query`, `value` matrices in attention layers.

**PEFT Library Setup**
```python
from peft import LoraConfig, get_peft_model, TaskType

config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=32,
    lora_alpha=64,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
)
model = get_peft_model(base_model, config)
model.print_trainable_parameters()
# Trainable params: ~20M / 7B = 0.3%
```

**Memory Requirements — QLoRA on 4-bit Base**

| Model Size | Base Model (4-bit) | Adapter + Optimizer | Total VRAM | Minimum GPU |
|---|---|---|---|---|
| 7B | ~4GB | ~6GB | ~10–12GB | RTX 3090/4090 |
| 13B | ~7GB | ~8GB | ~15–18GB | RTX 4090 / A10 |
| 34B | ~18GB | ~10GB | ~28–32GB | A100-40GB |
| 70B | ~35GB | ~15GB | ~50–60GB | A100-80GB or 2x40GB |

---

### 3. Instruction Tuning & RLHF Overview

**The Alignment Pipeline: SFT → RM → PPO/DPO**

**Stage 1 — Supervised Fine-tuning (SFT)**
Train on (instruction, response) pairs. The model learns to follow instructions and adopt the desired output format. Dataset size: 10K–100K high-quality examples. Quality beats quantity: 10K carefully curated examples outperform 200K noisy scraped pairs.

**Stage 2 — Reward Model (RM)**
Train a separate model to score responses by human preference. Dataset: pairs of (prompt, response_A, response_B, human_preference). Binary cross-entropy loss on the preference signal. The RM outputs a scalar reward for any (prompt, response) pair.

**Stage 3 — PPO (Proximal Policy Optimization)**
Use the RM as a reward signal to further optimize the SFT model via RL. Complex to implement stably: requires KL penalty against the SFT reference to prevent reward hacking, careful reward normalization, and separate actor/critic models. Practical issue: PPO is computationally expensive (4 forward passes per step) and has high variance.

**DPO (Direct Preference Optimization) — Practical Alternative**

DPO eliminates the reward model and RL training loop entirely. It directly optimizes the policy using preference pairs via a reparameterized objective that implicitly maximizes reward:

```
L_DPO = -E[ log σ( β * (log π_θ(y_w|x)/π_ref(y_w|x) - log π_θ(y_l|x)/π_ref(y_l|x)) ) ]
```

Where `y_w` is the preferred response, `y_l` the rejected response, `β` controls KL divergence from reference.

**DPO Workflow for Vietnamese LLM (MAESTRO)**
1. Collect preference pairs: (Vietnamese query, good response, bad response)
2. Sources: human annotators comparing Vistral vs GPT-4o outputs; AI-generated pairs filtered by quality
3. Start from SFT checkpoint (not raw base model)
4. β = 0.1–0.3 for standard DPO; lower β = closer to reference, higher = more aggressive optimization
5. Evaluate with win-rate against SFT baseline using LLM-as-judge in Vietnamese

---

### 4. Evaluation Methodology

**Dataset Splits**
Never evaluate on validation set for final reporting — validation is used for hyperparameter tuning and early stopping. Report all final numbers on a held-out test set touched only once. For small datasets (<10K), use stratified k-fold cross-validation and report mean ± std.

**Benchmark Suites for NLP**
- GLUE / SuperGLUE — English NLU benchmarks (classification, inference, QA)
- ViGLUE — Vietnamese equivalent; use for cross-model comparison on Vietnamese tasks
- MMLU — multiple-choice knowledge benchmark; 57 subjects; good proxy for factual knowledge
- MT-Bench — multi-turn conversational evaluation; LLM-as-judge scoring

**LLM-as-Judge Protocol**
Use a strong judge model (GPT-4o, Claude Opus) to compare two model outputs on the same prompt. Randomize left/right position to avoid position bias. For pairwise comparison, compute win rate. For absolute scoring, use a 5-point rubric with explicit anchors for each score level.

**Human Evaluation Rubrics**
- Correctness (1–5): factual accuracy verified against ground truth or authoritative source
- Fluency (1–5): grammatical correctness, natural language flow (critical for Vietnamese)
- Coherence (1–5): logical consistency of multi-sentence responses
- Helpfulness (1–5): whether the response fully addresses the user's intent
- Safety (binary): flag any harmful, biased, or policy-violating content

For Vietnamese evaluation: recruit native Vietnamese speakers; English-proficient evaluators rating Vietnamese text introduce systematic errors.

---

### 5. Dataset Curation for Vietnamese NLP

**Data Collection Pipeline**
1. Web crawl: `trafilatura` for HTML-to-text extraction; target Vietnamese news sites, Wikipedia, government documents
2. API sources: Common Crawl WET files filtered by language ID (fastText LID with threshold > 0.85)
3. Existing datasets: VLSP datasets (NER, dependency parsing), UIT-VSFC (sentiment), PhoATIS (intent)

**Quality Filtering**
- Length filter: discard documents < 100 words or > 100K words
- Language score: fastText Vietnamese probability > 0.85
- Perplexity filter: use KenLM 5-gram model trained on clean Vietnamese corpus; discard documents with perplexity > 1000 (likely garbled text)
- Symbol ratio: discard if ratio of non-Vietnamese characters > 15%
- Duplicate URL and boilerplate detection

**Deduplication**
- Exact deduplication: SHA256 hash of normalized text (lowercase, remove whitespace)
- Near-deduplication: MinHash with 128 hash functions, LSH bands; Jaccard threshold 0.8
- Semantic deduplication (for small high-value sets): embed with multilingual model, cluster, keep one per cluster

**PII Removal**
- Phone numbers: Vietnamese format `0[3-9]\d{8}`
- CMND / CCCD: 9 or 12 digit national ID patterns
- Email, URLs: standard regex
- Names: harder — use PhoBERT NER to tag PERSON entities, replace with `[TÊN]` placeholder
- Never store raw PII in training artifacts; apply removal before any GPU-side processing

**Format Standardization**
- Store as JSONL with fields: `{"text": "...", "source": "...", "lang": "vi", "quality_score": 0.92}`
- For instruction datasets: `{"messages": [{"role": "system", ...}, {"role": "user", ...}, {"role": "assistant", ...}]}`
- Apply HuggingFace `datasets` library for streaming large corpora to avoid RAM overflow

---

### 6. Hardware Requirements Table

**Inference (serving, no training)**

| Model Size | Precision | VRAM Required | Recommended GPU |
|---|---|---|---|
| 7B | fp16 | 14GB | RTX 4080/4090, A10G |
| 7B | 4-bit (GPTQ/AWQ) | 5–6GB | RTX 3080, T4 |
| 13B | fp16 | 26GB | A100-40GB, 2x RTX 4090 |
| 34B | fp16 | 68GB | A100-80GB, 2x A100-40GB |
| 70B | fp16 | 140GB | 2x A100-80GB, H100 |
| 70B | 4-bit | 40GB | A100-40GB x2 |

**Fine-tuning (LoRA/QLoRA)**

| Model Size | Method | VRAM Required | Min GPU Setup |
|---|---|---|---|
| 7B | QLoRA (4-bit) | 12–16GB | RTX 3090/4090 |
| 7B | LoRA (bf16) | 24–28GB | RTX 4090, A100-40GB |
| 13B | QLoRA (4-bit) | 18–24GB | RTX 4090, A100-40GB |
| 34B | QLoRA (4-bit) | 30–40GB | A100-40GB |
| 70B | QLoRA (4-bit) | 48–60GB | A100-80GB |
| 70B | Full fine-tune | 300GB+ | 4x A100-80GB + DeepSpeed |

---

### 7. Common Training Problems

**Gradient Explosion with Long Sequences**
Training with sequences > 2048 tokens using full attention causes O(n²) memory growth and numerical instability. Gradients can explode on the first backward pass. Fix: gradient clipping (`max_norm=1.0`), use Flash Attention 2 to handle long sequences efficiently, enable `use_reentrant=False` in gradient checkpointing.

**Catastrophic Forgetting**
Fine-tuning on a narrow domain causes the model to forget general capabilities. Symptoms: model performs well on fine-tune task but fails on basic instruction following. Fix: include 5–10% general instruction data mixed with domain data (replay); use LoRA (freezes base weights, preventing forgetting); monitor perplexity on general benchmark during training.

**Reward Hacking in RLHF**
Model learns to game the reward model by producing outputs with surface features that score high (verbose, sycophantic) without being genuinely better. Fix: KL penalty term in PPO objective constrains deviation from SFT policy; use multiple diverse reward models; include red-teaming examples in evaluation.

**Data Contamination**
Test set examples appear in pre-training or fine-tuning data, inflating benchmark scores. Particularly dangerous for MMLU/ViGLUE evaluations. Fix: n-gram overlap deduplication between train and test; use held-out temporal splits (train on data before date X, test on data after); document data provenance.

---

### 8. Experiment Tracking for NLP

**W&B Integration for LLM Training**
```python
import wandb
wandb.init(project="maestro-b04-nlp", config=training_args.__dict__)

# Log during training
trainer.add_callback(WandbCallback())

# Log custom metrics
wandb.log({"eval/ragas_faithfulness": 0.87, "eval/bertscore_f1": 0.79})
```

**Prompt Versioning**
Store prompt templates in a versioned registry (Git-tracked YAML files, not hardcoded strings). Tag each experiment with the prompt version used. Critical for reproducibility: a prompt change is equivalent to a hyperparameter change and must be tracked.

**Model Comparison Dashboard**
Key metrics to surface per model version in W&B or MLflow:
- Training loss curve (detect instability or underfitting)
- Validation loss curve (detect overfitting)
- Task-specific metrics: F1, BERTScore-F1, RAGAS scores
- Generation samples: log 20 random validation outputs per checkpoint for qualitative review
- Latency benchmark: P50/P95 inference time on standardized hardware
- Cost per query estimate: tokens_in + tokens_out × price_per_token

Use W&B Artifacts to version datasets and model checkpoints. Link each training run to the exact dataset artifact version used, enabling full lineage tracing — critical for debugging regressions and compliance auditing in production ML systems.
