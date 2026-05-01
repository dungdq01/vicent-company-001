# ML Engineer Notes: Conversational AI & Chatbots (B08)
## By Khoa Pham (R-MLE) — Date: 2026-03-31

### LLM Fine-tuning Strategies

The right fine-tuning approach depends on budget, data volume, and performance requirements:

**LoRA (Low-Rank Adaptation)**
- Insert trainable low-rank matrices into attention layers; freeze base model weights
- Typical rank: r=16 to r=64; alpha = 2x rank; target modules: q_proj, v_proj (minimum), all linear (maximum)
- Memory: fine-tune a 7B model on a single 24GB GPU (RTX 4090 / A5000)
- Best for: domain adaptation with 1K-50K examples, quick iteration cycles
- Vietnamese chatbot: LoRA on Vistral-7B or Qwen2.5-7B with Vietnamese conversation data

**QLoRA (Quantized LoRA)**
- 4-bit quantized base model + LoRA adapters in fp16/bf16
- Memory: fine-tune 13B models on 24GB, 70B models on 2x A100 80GB
- Use bitsandbytes NF4 quantization; paged optimizers to handle memory spikes
- Performance is 95-99% of full LoRA in most benchmarks; always validate on your specific task

**Full Fine-tune**
- Only justified when: (a) you have >100K high-quality examples, (b) the domain is very different from pretraining data, (c) you need maximum performance
- Use DeepSpeed ZeRO Stage 3 or FSDP for multi-GPU training
- Cost: 8x A100 for 7B model, days of training — budget $2K-5K per run on cloud

### RAG Pipeline Optimization

**Chunking Strategies**
- Recursive character splitting: start at 512 tokens, overlap 50 tokens — baseline
- Semantic chunking: split on topic boundaries using embedding similarity — better for long documents
- For Vietnamese: chunk after word segmentation to avoid splitting multi-syllable words
- Document-specific: FAQ pairs as atomic chunks, product specs as structured chunks

**Embedding Models**
- Multilingual-e5-large: strong Vietnamese support, 1024 dims, good baseline
- BGE-M3: supports dense + sparse + colbert retrieval, 8192 token context, state-of-art multilingual
- Fine-tune embeddings on your domain pairs (question, relevant_chunk) using sentence-transformers — typically 5-15% retrieval improvement
- Always benchmark on a held-out Vietnamese retrieval test set before deploying

**Reranking**
- Two-stage: fast retrieval (top-50) then cross-encoder reranking (top-5)
- Use bge-reranker-v2-m3 or jina-reranker-v2-base-multilingual for Vietnamese
- Reranking adds 100-300ms latency but improves answer relevance by 10-20%

### Prompt Engineering Patterns

- **System prompt structure**: role definition > constraints > output format > examples
- **Few-shot with Vietnamese examples**: include 2-3 conversation examples in the target language and style
- **Chain-of-thought for complex queries**: "First identify the customer's intent, then look up relevant info, then respond"
- **Guardrail prompts**: "If the user asks about competitors, politely redirect. Never share internal pricing."
- **Dynamic prompt assembly**: base system prompt + retrieved context + conversation history (last 5 turns) + user message
- Version control prompts in Git; treat prompt changes like code changes with review

### Evaluation Metrics

**Automated Metrics**
- BLEU/ROUGE: useful for FAQ-style responses where expected answers exist; poor for open-ended dialogue
- Semantic similarity (embedding cosine): compare response to reference answers; more flexible than BLEU
- Intent accuracy: for the NLU component, measure F1 per intent class
- Retrieval metrics: MRR@5, NDCG@10 for the RAG retrieval component

**LLM-as-Judge**
- Use a strong model (GPT-4, Claude) to score responses on: relevance (1-5), helpfulness (1-5), safety (1-5), language quality (1-5)
- Provide rubrics in the judge prompt to reduce variance
- Calibrate: have humans score 200 examples, compare with LLM-judge; expect Spearman correlation >0.7
- Cost-effective for large-scale evaluation; run on every prompt/model change

**Human Evaluation**
- Essential for launch decisions; sample 200-500 conversations per evaluation round
- Metrics: task completion rate, response appropriateness, factual accuracy
- Use Vietnamese native speakers for Vietnamese chatbot evaluation — nuance matters

### A/B Testing Chatbot Versions

- Route users randomly at session level (not message level) to avoid inconsistent experience
- Minimum sample: 1000 conversations per variant for statistical significance
- Primary metric: task completion rate; secondary: user satisfaction (thumbs up/down), escalation rate
- Test duration: minimum 7 days to capture day-of-week effects
- Use sequential testing (not fixed-horizon) to stop early if one variant is clearly better

### Model Distillation for Cost Reduction

- Train a smaller model (1.5B-7B) to mimic a larger model's (70B/GPT-4) responses
- Generate teacher outputs on your production conversation distribution — 50K-100K examples
- Student model achieves 85-95% of teacher quality at 10-20x lower inference cost
- Iterative distillation: deploy student, collect failure cases, get teacher responses, retrain
- For Vietnamese: distill from multilingual large model to Vietnamese-focused small model

### Recommendations for B08

1. Start with RAG on a strong base model (Qwen2.5-7B or Vistral) before fine-tuning — often sufficient for v1
2. Fine-tune with QLoRA for cost efficiency; only move to full fine-tune if QLoRA plateaus
3. Implement LLM-as-judge evaluation from day one — manual evaluation does not scale
4. Build an evaluation dataset of 500+ Vietnamese conversation pairs covering all intents; guard it carefully
5. A/B test every major prompt or model change; intuition about "better" is often wrong
6. Plan the distillation path early: prototype with GPT-4, distill to 7B for production cost targets
