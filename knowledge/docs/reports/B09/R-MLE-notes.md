# ML Engineer Notes: Generative AI (B09)
## By ModelForge (R-MLE) — Date: 2026-03-31

### Pre-training Infrastructure

Pre-training large generative models is the most compute-intensive ML workload:

- **Distributed training frameworks**: PyTorch FSDP (Fully Sharded Data Parallel) is now the default for most teams. DeepSpeed ZeRO Stage 3 remains competitive for very large models (100B+). Megatron-LM for tensor parallelism at scale.
- **Parallelism strategies**: Data parallelism (replicate model, split data), tensor parallelism (split layers across GPUs), pipeline parallelism (split layers sequentially), sequence parallelism (split long sequences). Most 7-70B training uses FSDP + tensor parallelism.
- **Hardware**: A100 80GB is the workhorse. H100 offers 2-3x throughput for training. A single H100 node (8 GPUs) can train a 7B model in ~2 weeks on 1T tokens. For 70B models, expect 32-128 H100 GPUs for 4-8 weeks.
- **Communication**: NVLink within nodes, InfiniBand across nodes. Network bandwidth is the bottleneck for distributed training — 400Gbps InfiniBand is standard for serious training clusters.
- **Checkpointing**: Save every 500-1000 steps. Use asynchronous checkpointing to avoid training stalls. Each checkpoint for a 70B model is ~140 GB (bf16).

### Fine-tuning Strategies

Fine-tuning adapts a pre-trained model to specific tasks or domains:

- **LoRA (Low-Rank Adaptation)**: Adds small trainable matrices to attention layers. Typical rank r=16-64. Reduces trainable parameters by 99%+. Memory: a 7B model can be LoRA fine-tuned on a single 24GB GPU.
- **QLoRA**: Combines 4-bit quantization with LoRA. Fine-tune a 70B model on a single 48GB GPU. Slight quality loss vs full LoRA but dramatically cheaper.
- **Full fine-tune**: All parameters updated. Best quality but requires the same hardware as pre-training. Justified only when domain shift is extreme (e.g., medical, legal Vietnamese).
- **RLHF (Reinforcement Learning from Human Feedback)**: Train reward model on human preferences, then use PPO to optimize policy. Complex, unstable, but produces the most aligned outputs. Requires 50K-100K human preference pairs minimum.
- **DPO (Direct Preference Optimization)**: Simplified RLHF — no reward model needed. Train directly on preference pairs. Increasingly preferred over RLHF for its stability. Works well with 10K-50K preference pairs.
- **ORPO / SimPO**: Newer alignment methods that combine SFT and preference optimization in one step. Simpler training loop, competitive results.

### Evaluation Metrics

Evaluating generative models requires multiple complementary metrics:

**Text models:**
- **Perplexity**: Standard LM metric; lower is better. Not meaningful across different tokenizers. Use only for comparing models with the same tokenizer.
- **MMLU / MMLU-Pro**: Multi-task accuracy benchmark. 57 subjects. Current SOTA: ~90%.
- **HumanEval / MBPP**: Code generation. Pass@1 and Pass@10.
- **MT-Bench**: Multi-turn conversation quality, scored by GPT-4. 80 questions across 8 categories.
- **LLM-as-judge**: Use a strong model (GPT-4, Claude) to evaluate outputs. Cheap, scalable, correlates well with human judgment for most tasks. Be aware of position bias and self-preference bias.
- **Human evaluation**: Gold standard but expensive. Use for final validation and for calibrating automated metrics.

**Image models:**
- **FID (Frechet Inception Distance)**: Lower is better. Measures distribution similarity. FID < 10 is strong.
- **CLIPScore**: Measures text-image alignment. Higher is better.
- **Aesthetic score**: LAION aesthetic predictor or similar. Measures visual appeal.
- **Human preference (ELO)**: Arena-style comparisons. Most reliable for image quality.

### Model Merging Techniques

Model merging combines multiple fine-tuned models without additional training:

- **Linear merge (SLERP)**: Spherical linear interpolation between two model weight sets. Simple, often effective.
- **TIES-Merging**: Trims redundant parameters, resolves sign conflicts, then merges. Better than naive averaging.
- **DARE**: Drop And REscale — randomly drops delta parameters before merging. Reduces interference.
- **MergeKit**: Open-source toolkit for model merging. Supports all common strategies. Can produce surprisingly strong models from complementary fine-tunes.
- **Practical use**: Merge a general-purpose fine-tune with a domain-specific fine-tune (e.g., Vietnamese legal) to get both capabilities.

### Hyperparameter Optimization

Key hyperparameters for generative model training:

- **Learning rate**: 1e-4 to 3e-4 for pre-training, 1e-5 to 5e-5 for fine-tuning. Cosine schedule with warmup (1-5% of total steps).
- **Batch size**: Larger is generally better for pre-training. Effective batch size of 2-4M tokens is common for LLMs. Use gradient accumulation to achieve large effective batch sizes.
- **Weight decay**: 0.1 for pre-training, 0.01-0.1 for fine-tuning.
- **LoRA-specific**: Rank r=16-64, alpha=2*r, dropout=0.05-0.1. Target modules: q_proj, k_proj, v_proj, o_proj minimum; add gate/up/down for better quality.
- **Context length**: Train at target context length. RoPE scaling (NTK-aware, YaRN) can extend context post-training.
- **Optimizer**: AdamW standard. 8-bit Adam (bitsandbytes) saves memory. Newer options: Sophia, SOAP showing promise.

### Cost Estimation for Training Runs

Rough cost guidelines (cloud pricing, 2026):

| Task | Hardware | Duration | Cost |
|------|----------|----------|------|
| LoRA fine-tune 7B (50K samples) | 1x A100 80GB | 2-4 hours | $10-20 |
| QLoRA fine-tune 70B (50K samples) | 1x A100 80GB | 8-16 hours | $40-80 |
| Full fine-tune 7B (1M samples) | 8x A100 80GB | 2-3 days | $2-3K |
| Pre-train 7B (1T tokens) | 64x H100 | 2-3 weeks | $150-300K |
| Pre-train 70B (2T tokens) | 512x H100 | 3-4 months | $3-5M |
| RLHF alignment (7B) | 8x A100 80GB | 1-2 days | $1-2K |

Use spot/preemptible instances for fine-tuning (50-70% savings). Pre-training requires reserved instances for stability.

### Recommendations for B09

1. Start with QLoRA fine-tuning of existing open models (Llama 3, Qwen 2.5) before considering pre-training. 90% of use cases are solved by fine-tuning.
2. Use DPO over RLHF for alignment unless you have a dedicated team for reward modeling.
3. Implement comprehensive evaluation early — automate MMLU, MT-Bench, and domain-specific benchmarks in CI/CD.
4. For Vietnamese-specific models, fine-tune multilingual base models rather than training from scratch.
5. Track all experiments in W&B or MLflow — generative model training has many moving parts.
6. Budget 3x your estimated compute cost for experimentation and failed runs.
7. Model merging is underutilized — experiment with merging domain-specific adapters before training monolithic models.
