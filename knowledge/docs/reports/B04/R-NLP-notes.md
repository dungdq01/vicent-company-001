# NLP Engineering Notes: B04 Natural Language Processing
## By R-NLP — Date: 2026-03-31

---

### 1. NLP Engineering Perspective Summary

Natural Language Processing in production is not an academic exercise — it is an engineering discipline governed by latency budgets, cost constraints, data pipelines, and reliability requirements. The field has shifted dramatically since 2022: the dominant paradigm is no longer building task-specific models from scratch, but rather selecting the right strategy (fine-tuning, prompting, RAG) against a pre-trained foundation model, then wrapping it in a production-grade serving layer.

The four key axes a production NLP engineer must balance are: **task complexity** (is this a classification label or open-ended generation?), **latency requirements** (real-time API vs. async batch?), **data availability** (do we have 10K labeled examples or none?), and **cost envelope** (per-query cost at scale). Every architectural decision flows from these four axes. For MAESTRO's knowledge graph use case — multi-industry, multi-lingual (with Vietnamese), reasoning over graph structures — the stack must support embedding-based retrieval, instruction-tuned generation, and structured extraction simultaneously.

---

### 2. Task-to-Model Selection Framework

The selection decision tree for production NLP tasks:

```
Is the output a fixed label or score?
  YES → Classification / Regression
        Small dataset (<5K) → Few-shot prompt GPT-4o / Claude
        Moderate dataset (5K–100K) → Fine-tune BERT / RoBERTa / DeBERTa
        Large dataset (>100K) → Full fine-tune or distillation to smaller encoder

Is the output free-form text?
  YES → Generation
        Short-form structured (JSON extraction) → Prompt engineering + output parser
        Long-form (summarization, explanation) → T5 / BART / FLAN-T5 for controlled gen
        Open-ended dialogue / reasoning → Instruction-tuned LLM (LLaMA-3, Mistral, GPT-4o)

Is the task similarity / retrieval?
  YES → Semantic Search
        Bi-encoder (fast ANN) → sentence-transformers (all-MiniLM, BGE, E5)
        Re-ranking (precision) → Cross-encoder (ms-marco-MiniLM-L-6-v2)
        Multilingual (Vietnamese) → multilingual-e5-large or LaBSE

Is the task QA over a document corpus?
  YES → RAG Pipeline
        Chunking → Embedding → Vector DB → Retrieval → LLM generation with context
```

Key rule: **never use a generation model for a classification task in production** — it is 10–100x more expensive and adds latency with no accuracy benefit once a fine-tuned encoder exists.

---

### 3. Fine-tuning vs Prompting vs RAG Decision Matrix

| Scenario | Approach | When to Use | Cost | Latency |
|---|---|---|---|---|
| No labeled data, general task | Zero-shot prompting | Exploration, prototyping | High per query | Medium |
| Few examples available | Few-shot prompting | <50 labeled examples | High per query | Medium |
| Stable task, 1K+ labeled data | Fine-tune encoder (BERT/DeBERTa) | Classification, NER, tagging | Low at inference | Very low |
| Domain knowledge injection | RAG | Private corpora, frequent updates | Medium | Medium-high |
| Instruction following, no training data | Prompt + instruction-tuned LLM | Flexible outputs needed | High | Medium |
| Consistent domain, 10K+ examples | LoRA/QLoRA fine-tune LLM | Domain-specific generation | Low after training | Medium |
| Highly regulated / PII-sensitive | Self-hosted fine-tuned model | GDPR, data sovereignty | CAPEX only | Low |
| Latency < 50ms | Distilled encoder / ONNX | Real-time scoring | Very low | Very low |

RAG is the right default for MAESTRO's knowledge graph queries — the graph data changes frequently, facts are structured and retrievable, and we do not want the model to hallucinate graph relationships.

---

### 4. Production NLP Stack

A mature production NLP stack for 2025–2026:

**Tokenization Layer**
- `tokenizers` (HuggingFace Rust library) — 100x faster than Python-side tokenization
- Always use the model's native tokenizer; never mix tokenizers across model families
- Batch tokenization with padding strategies: `longest` for training, `max_length` for inference

**Embedding Layer**
- `sentence-transformers` — primary library for bi-encoder embeddings
- Models: `BAAI/bge-m3` (multilingual, 1024-dim), `intfloat/multilingual-e5-large`
- Normalization: always L2-normalize embeddings before cosine similarity

**Serving Layer**
- `vLLM` — PagedAttention-based continuous batching; 3–24x throughput vs naive serving
- `TGI` (Text Generation Inference by HuggingFace) — alternative with tensor parallelism
- `ONNX Runtime` — for encoder models requiring sub-10ms latency

**Orchestration Layer**
- `LangChain` — chain construction, tool calling, agent loops (heavy but feature-rich)
- `LlamaIndex` — document indexing, retrieval, query engines (better for RAG-heavy pipelines)
- `DSPy` — programmatic prompt optimization (emerging, strongly recommended for MAESTRO)

**Vector Databases**
- `Qdrant` — recommended for MAESTRO: Rust-based, high-performance, payload filtering, named vectors
- `Weaviate` — good for hybrid keyword+vector search
- `pgvector` — acceptable for <1M vectors when PostgreSQL is already in stack
- `Chroma` — development only, not production-grade

---

### 5. Vietnamese NLP Engineering

Vietnamese is a tonal, analytic language with no inflection but significant tokenization complexity due to multi-syllable words represented as space-separated syllables.

**Tokenization**
- `underthesea` — most mature Vietnamese NLP library; includes tokenizer, POS tagger, NER, dependency parser
- `pyvi` — lighter alternative tokenizer
- Critical rule: Vietnamese tokenizers segment "học sinh" (student) as one token, not two. Standard whitespace splitting destroys meaning.
- For LLMs: BPE tokenizers in multilingual models (mBERT, XLM-R) handle Vietnamese but are suboptimal — they over-segment Vietnamese syllables.

**Pre-trained Models**
- `PhoBERT` (VinAI) — BERT pre-trained on 20GB Vietnamese corpus; state-of-the-art for encoder tasks
- `PhoBERT-base` (135M params) vs `PhoBERT-large` (370M): use large for NER/QA, base for classification
- `PhoNLP` — joint POS tagging + NER + dependency parsing pipeline on top of PhoBERT
- `ViT5` — Vietnamese T5 variant for generation tasks
- For LLM generation: `Vistral-7B-Chat` (Mistral-based Vietnamese instruction-tuned) or Qwen2.5 with Vietnamese data

**Corpus Building**
- Sources: CommonCrawl (vi subset), VNExpress, Tuổi Trẻ crawls, Wikipedia vi, OSCAR corpus
- Deduplication with MinHash LSH before training — Vietnamese web data has 30–50% near-duplicate rate
- Diacritics normalization: Vietnamese uses Unicode combining diacritics (NFD) vs precomposed (NFC) — always normalize to NFC before tokenization

**Common Pitfalls**
- Using English stopword lists on Vietnamese text — Vietnamese stopwords are entirely different
- Truncating at 512 tokens without understanding that Vietnamese sentences tokenize to ~1.5x English token count
- Evaluating on test sets that include data from the same website as training (content overlap)

---

### 6. Common Production Failures

**1. Hallucination in RAG pipelines** — LLM generates plausible but incorrect facts not present in retrieved context. Mitigation: faithfulness scoring with RAGAS, self-consistency sampling, citation-grounding prompts.

**2. Context window overflow** — Input exceeds model's context limit causing silent truncation or API error. Mitigation: always count tokens before API call using `tiktoken` or model-native counter; implement chunking with overlap.

**3. Prompt injection** — Malicious user input overwrites system prompt instructions. Mitigation: input sanitization, separate system/user turn boundaries, output validation layer, never interpolate raw user input into privileged prompt sections.

**4. Tokenization bugs** — Off-by-one errors in token-to-character span alignment for NER/extraction tasks; using wrong tokenizer for a model. Mitigation: always use `return_offsets_mapping=True` for span tasks; unit test tokenizer alignment.

**5. Embedding drift** — Embedding model updated (e.g., provider silently rolls new version) causing similarity scores to shift; vectors in DB incompatible with new model. Mitigation: version-pin embedding models; include model version in vector collection name; monitor similarity score distributions.

**6. LLM latency spikes** — Time-to-first-token (TTFT) variance of 200ms–5s depending on server load. Mitigation: implement streaming responses; set timeout + fallback to smaller model; use vLLM with continuous batching for self-hosted.

**7. Cascade failures in multi-agent chains** — One agent's output feeds the next; error propagates silently. Mitigation: validate outputs at each agent boundary; implement retry with exponential backoff; log intermediate outputs.

**8. Label leakage in fine-tuning** — Test documents appear in training corpus through indirect overlap (same source, similar date range). Mitigation: document-level splitting, not random row splitting; temporal splits for time-series NLP tasks.

---

### 7. LLM Cost Optimization

**Token Counting First** — Always profile token usage before optimizing. For GPT-4o at $5/1M input tokens, a 2000-token system prompt at 100K queries/day = $1,000/day in system prompt alone.

**Prompt Compression**
- `LLMLingua` / `LLMLingua-2` — compress prompts by 3–5x with <5% quality degradation using a small perplexity-based filtering model
- Structured formats (JSON/XML) are more token-efficient than verbose English instructions

**Semantic Caching**
- Cache LLM responses by embedding the query; return cached response if cosine similarity > 0.95
- `GPTCache` library or custom implementation with Qdrant
- Hit rate 20–40% for FAQ-style queries; near-zero for generation tasks with high diversity

**Request Batching**
- Batch embedding requests: 512 documents per batch vs 1 per call = 50x API throughput
- For fine-tuned models on vLLM: continuous batching handles this automatically

**Smaller Model Routing**
- Route simple queries (intent classification, keyword extraction) to 7B models or encoders
- Reserve 70B/GPT-4o for complex reasoning tasks
- `RouteLLM` framework — learned routing based on query complexity score

**KV Cache Prefix Sharing**
- Place static system prompt content at the start; vLLM caches the KV states for repeated prefixes
- Savings: 20–40% latency reduction for long system prompts in chat applications

---

### 8. Evaluation Framework

**Classification Tasks**
- Primary: Macro F1 (handles class imbalance); report per-class precision/recall
- For multilabel: F1-micro, F1-macro, Hamming loss
- Always report on held-out test set, never validation set

**Generation Tasks**
- `BLEU` — n-gram precision; good for translation; poor for abstractive summarization
- `ROUGE-L` — longest common subsequence; standard for summarization
- `BERTScore` — semantic similarity via BERT embeddings; correlates better with human judgment than n-gram metrics
- `METEOR` — better than BLEU for morphologically rich languages including Vietnamese

**RAG-Specific Evaluation**
- `RAGAS` framework: Context Precision, Context Recall, Faithfulness, Answer Relevancy
- Faithfulness score < 0.7 indicates hallucination problem; Context Recall < 0.6 indicates retrieval failure
- Run RAGAS evaluation on 200–500 golden QA pairs per domain

**LLM-as-Judge**
- Use GPT-4o or Claude Opus as judge for open-ended generation quality
- Provide explicit rubric: fluency (1–5), factual accuracy (1–5), completeness (1–5)
- Calibrate: collect human ratings on 100 samples and correlate with LLM judge scores; target Pearson r > 0.8

**Human Evaluation Criteria (for production sign-off)**
- Factual correctness rate: minimum 95% for customer-facing applications
- Harmful output rate: < 0.1% on adversarial test set
- Task completion rate: defined per business use case (e.g., correct extraction 90%+)
- Latency P95: defined SLA (e.g., < 2s for interactive, < 30s for async)
