# Research Report: Natural Language Processing (B04)
## By Dr. Archon (R-α) — Date: 2026-03-31

---

### 1. Executive Summary

Natural Language Processing (NLP) is the subfield of Artificial Intelligence concerned with enabling machines to understand, generate, and reason about human language in all its forms. The field has undergone a paradigm shift from rule-based and statistical methods toward large-scale neural language models, with transformer-based architectures now dominating virtually every benchmark and application domain. This report provides a comprehensive L3-depth survey of NLP's taxonomy, core concepts, state-of-the-art models, foundational mathematics, and the Vietnamese NLP ecosystem — all framed for practitioners building AI-powered knowledge platforms.

---

### 2. Field Taxonomy

#### 2.1 Parent Field Hierarchy

```
Artificial Intelligence (AI)
└── Machine Learning (ML)
    ├── Deep Learning (DL)
    │   └── Natural Language Processing (NLP)
    │       ├── Core NLP Tasks (see 2.2)
    │       └── Large Language Models (LLMs)
    └── Statistical Learning
        └── Classical NLP (pre-neural)
```

#### 2.2 NLP Sub-fields (≥10)

1. **Text Classification** — assigning predefined categories to documents or sentences (sentiment analysis, topic labeling, intent detection).
2. **Named Entity Recognition (NER)** — identifying and classifying spans of text as persons, organizations, locations, dates, etc.
3. **Relation Extraction (RE)** — detecting semantic relationships between entities within text (e.g., "Apple [founded_by] Steve Jobs").
4. **Machine Translation (MT)** — mapping text from a source language to a target language while preserving meaning and fluency.
5. **Abstractive & Extractive Summarization** — condensing long documents into shorter representations either by selection (extractive) or generation (abstractive).
6. **Question Answering (QA)** — open-domain, closed-domain, and reading-comprehension tasks where a system answers natural-language questions.
7. **Dialogue Systems & Conversational AI** — multi-turn interaction management, including task-oriented dialogue (booking, FAQ) and open-domain chitchat.
8. **Text Generation & Creative NLP** — unconditional and conditional generation of coherent, fluent, and stylistically appropriate text.
9. **Semantic Search & Dense Retrieval** — encoding queries and documents into shared embedding spaces for relevance ranking beyond keyword overlap.
10. **Sentiment Analysis & Opinion Mining** — fine-grained detection of sentiment polarity, subjectivity, aspect-level opinions.
11. **Information Extraction (IE)** — structured knowledge extraction from unstructured text: events, facts, temporal relations.
12. **Coreference Resolution** — identifying all expressions in a text that refer to the same real-world entity.
13. **Dependency & Constituency Parsing** — grammatical analysis of syntactic structure.
14. **Text Entailment & Natural Language Inference (NLI)** — determining whether a hypothesis logically follows from a premise.

#### 2.3 Related Fields

- **Computational Linguistics** — formal linguistic theory (syntax, semantics, pragmatics) applied computationally.
- **Information Retrieval (IR)** — document indexing, ranking, and retrieval (BM25, inverted indices).
- **Speech Processing (ASR/TTS)** — acoustic modeling, speech recognition, synthesis; interfaces with NLP at the transcript level.
- **Knowledge Graphs & Ontologies** — structured representations of world knowledge; NLP provides extraction; KGs provide grounding.
- **Computer Vision + NLP** — multimodal models (CLIP, Flamingo, GPT-4V) fusing visual and textual representations.

#### 2.4 ASCII Taxonomy Tree

```
NLP
├── Understanding (NLU)
│   ├── Text Classification
│   │   ├── Sentiment Analysis
│   │   ├── Intent Detection
│   │   └── Topic Classification
│   ├── Sequence Labeling
│   │   ├── NER
│   │   ├── POS Tagging
│   │   └── Chunking
│   ├── Structure Analysis
│   │   ├── Dependency Parsing
│   │   ├── Constituency Parsing
│   │   └── Coreference Resolution
│   ├── Relation & Event Extraction
│   │   ├── Relation Extraction
│   │   ├── Event Detection
│   │   └── Temporal Reasoning
│   └── Semantic Tasks
│       ├── NLI / Textual Entailment
│       ├── Semantic Similarity
│       └── QA / Reading Comprehension
├── Generation (NLG)
│   ├── Machine Translation
│   ├── Summarization
│   ├── Dialogue / Conversation
│   ├── Text Generation (LLMs)
│   └── Data-to-Text
├── Retrieval & Search
│   ├── Semantic Search
│   ├── Dense Retrieval (DPR, ColBERT)
│   └── RAG (Retrieval-Augmented Generation)
└── Cross-Cutting
    ├── Tokenization & Preprocessing
    ├── Embeddings (static & contextual)
    ├── Prompt Engineering
    └── Evaluation & Benchmarking
```

---

### 3. Core Concepts (≥12)

---

#### 3.1 Tokenization

**Description.** Tokenization is the process of converting raw text strings into discrete units — tokens — that serve as the fundamental input elements for NLP models. The central challenge is that human writing systems vary dramatically: English uses spaces as weak word boundaries, Vietnamese uses spaces between syllables (not words), Chinese has no spaces at all, and all languages contain punctuation, numbers, and code-switching that complicate naive splitting.

Modern systems use subword tokenization algorithms such as Byte-Pair Encoding (BPE) or WordPiece. BPE begins with a character-level vocabulary and iteratively merges the most frequent adjacent symbol pair until a target vocabulary size is reached. This yields a vocabulary that can represent any string without out-of-vocabulary failures while keeping frequent words as single tokens and rare words decomposed. GPT-4 uses a variant called tiktoken (BPE over UTF-8 bytes), giving it a 100,277-token vocabulary that handles any Unicode character.

**Mathematical note.** For BPE, let `V` be the current vocabulary and `f(a,b)` be the bigram frequency of adjacent symbols `a,b`. Each iteration selects `(a*,b*) = argmax_{a,b} f(a,b)` and creates new symbol `ab`, updating `V` and all corpus occurrences.

**Difficulty:** L1 | **Prerequisites:** string processing, basic statistics.

---

#### 3.2 Word Embeddings (Word2Vec / GloVe)

**Description.** Before the transformer era, the dominant approach to representing words was to learn dense vector representations — embeddings — in a fixed-dimensional space (typically 100–300 dimensions) such that semantically similar words cluster together. Word2Vec (Mikolov et al., 2013) learns these vectors by training a shallow neural network on two proxy tasks: Skip-gram (predict surrounding context from center word) and CBOW (predict center word from context). GloVe (Pennington et al., 2014) achieves similar representations by factorizing a word co-occurrence matrix with a weighted least-squares objective.

The resulting geometry is remarkable: `vec("king") - vec("man") + vec("woman") ≈ vec("queen")`. This emerges not by design but as a consequence of optimizing distributional prediction objectives over large corpora — a vindication of the distributional hypothesis ("you shall know a word by the company it keeps," Firth 1957).

**Key limitation:** static embeddings assign a single vector per word type regardless of context. The word "bank" in "river bank" and "bank account" maps to one averaged representation, losing the polysemy that matters enormously for downstream tasks.

**Mathematical note.** Skip-gram maximizes: `J = (1/T) Σ_t Σ_{-c≤j≤c, j≠0} log p(w_{t+j} | w_t)` where `p(w_O|w_I) = exp(v'_{w_O}ᵀ v_{w_I}) / Σ_w exp(v'_wᵀ v_{w_I})`.

**Difficulty:** L2 | **Prerequisites:** linear algebra, basic neural networks.

---

#### 3.3 Contextual Embeddings (ELMo, BERT-style)

**Description.** Contextual embeddings solve Word2Vec's polysemy limitation by producing a different vector for each token occurrence depending on its surrounding context. ELMo (Peters et al., 2018) was the first major success: it runs a deep bidirectional LSTM over the entire sentence and concatenates hidden states from multiple layers to produce token representations. The insight was that lower layers capture syntax while higher layers capture semantics, so a weighted combination provides richer features than any single layer.

BERT-style models take this further by using the transformer architecture instead of LSTMs, enabling full (non-sequential) bidirectional context through self-attention. The result is that "bank" in "river bank" and "bank account" now receive distinct vector representations despite sharing a surface form — a qualitative leap enabling much stronger performance on disambiguation-dependent tasks like NER, coreference, and QA.

**Difficulty:** L2 | **Prerequisites:** neural networks, sequence models.

---

#### 3.4 Attention Mechanism

**Description.** The attention mechanism, introduced to machine translation by Bahdanau et al. (2015), allows a decoder to selectively "attend" to different positions of the encoder's hidden states when generating each output token. Instead of compressing an entire source sentence into a single fixed-size vector (the information bottleneck of vanilla seq2seq), attention computes a weighted mixture of all encoder states, with weights (attention scores) reflecting relevance to the current decoding step.

The transformer generalized attention into the standalone building block of entire architectures, eliminating recurrence entirely. In self-attention, every token attends to every other token in the same sequence, computing relevance scores between all pairs simultaneously. This parallelism was the key engineering insight that made scaling to billions of parameters tractable on GPU/TPU hardware.

**Mathematical formulation.** Scaled dot-product attention:

```
Attention(Q, K, V) = softmax( QKᵀ / √d_k ) V
```

Where `Q` (queries), `K` (keys), `V` (values) are linear projections of the input, and `d_k` is the key dimension. The `√d_k` scaling prevents extremely small gradients when dot products grow large in high dimensions.

Multi-head attention runs `h` attention heads in parallel, concatenates outputs, and projects: `MultiHead(Q,K,V) = Concat(head_1,...,head_h) W^O`.

**Difficulty:** L2 | **Prerequisites:** linear algebra, softmax, neural networks.

---

#### 3.5 Transformer Architecture

**Description.** The transformer (Vaswani et al., 2017) is a sequence-to-sequence architecture built entirely from attention layers and feed-forward networks, with no recurrence or convolution. An encoder stack processes the input sequence into contextualized representations; a decoder stack generates output autoregressively, attending to both its own previous outputs (masked self-attention) and the encoder output (cross-attention). Each layer in both stacks has the form: `LayerNorm(x + Sublayer(x))` — residual connections and layer normalization are critical for training stability at depth.

The positional encoding injects information about token position (since attention is permutation-invariant) using sinusoidal functions: `PE(pos, 2i) = sin(pos/10000^{2i/d_model})`, `PE(pos, 2i+1) = cos(pos/10000^{2i/d_model})`. Modern variants use learned positional embeddings (BERT) or relative position encodings (RoPE, ALiBi) that generalize better to sequence lengths unseen during training.

The transformer's computational complexity for attention is `O(n² d)` in sequence length `n`, which becomes the bottleneck for very long sequences. This has spurred active research into linear-attention approximations (Performer, Mamba, RWKV) and hierarchical processing strategies.

**Difficulty:** L3 | **Prerequisites:** attention mechanism, feed-forward networks, residual networks, layer normalization.

---

#### 3.6 BERT Pretraining (MLM / NSP)

**Description.** BERT (Bidirectional Encoder Representations from Transformers; Devlin et al., 2018) demonstrated that deeply bidirectional pretraining on massive corpora, followed by task-specific fine-tuning, achieves state-of-the-art results across a wide range of NLP tasks with minimal architectural modification. The key pretraining objectives are Masked Language Modeling (MLM) and Next Sentence Prediction (NSP).

MLM randomly masks 15% of input tokens and trains the model to predict the original token from context — in both left-to-right and right-to-left directions simultaneously (unlike GPT which is left-to-right only). NSP trains the model to predict whether sentence B actually follows sentence A in a document, or is a random sentence. Together these objectives inject both local semantic knowledge and inter-sentence discourse understanding.

The BERT paradigm established transfer learning as the dominant methodology in NLP: pretrain once on large unlabeled corpora (Books + Wikipedia for original BERT), then fine-tune on small labeled datasets for specific tasks. This dramatically reduced the labeled data requirement for production systems.

**Difficulty:** L3 | **Prerequisites:** transformer architecture, cross-entropy loss, transfer learning.

---

#### 3.7 GPT Autoregressive Language Modeling

**Description.** GPT-style models (Radford et al., 2018 onward) use a decoder-only transformer trained with a causal (left-to-right) language modeling objective: predict the next token given all previous tokens. While this produces inherently unidirectional representations (seemingly inferior to BERT's bidirectionality for understanding tasks), it proved to be the more scalable paradigm when model and data scale increased dramatically.

The autoregressive objective is also the natural formulation for generation: at inference time, the model samples or greedily decodes one token at a time, appending each to the context window for the next step. GPT-3 (Brown et al., 2020) showed that with 175B parameters and enough in-context examples, autoregressive models can solve tasks they were never explicitly trained on — the famous "few-shot" and "zero-shot" capabilities that triggered the modern LLM era.

**Mathematical note.** The causal LM objective: `L = -Σ_t log P(x_t | x_1, ..., x_{t-1}; θ)`. Masked self-attention enforces causality by setting attention scores between position `i` and `j > i` to `-∞` before softmax.

**Difficulty:** L3 | **Prerequisites:** transformer architecture, autoregressive generation, temperature/nucleus sampling.

---

#### 3.8 Fine-tuning Paradigm

**Description.** Fine-tuning takes a pretrained model and continues training on a smaller, task-specific labeled dataset, adjusting all (or a subset of) model weights to specialize the model's representations for the target application. For classification tasks, a linear head is typically added atop the `[CLS]` token representation and trained end-to-end. For generation tasks, the entire decoder is fine-tuned on gold input-output pairs.

Full fine-tuning of large models is expensive in compute, memory, and the risk of catastrophic forgetting. Parameter-Efficient Fine-Tuning (PEFT) methods — most prominently LoRA (Hu et al., 2021) — address this by keeping the pretrained weights frozen and only training small adapter matrices. This allows fine-tuning a 7B-parameter model on a single consumer GPU while retaining most of the performance of full fine-tuning.

**Difficulty:** L2 | **Prerequisites:** pretraining concepts, transfer learning, gradient descent.

---

#### 3.9 Prompt Engineering

**Description.** Prompt engineering is the practice of crafting natural language inputs (prompts) to elicit desired behaviors from LLMs without updating model weights. Since large models encode broad capabilities, the right prompt can activate the right behavior: adding "Let's think step by step" (chain-of-thought prompting, Wei et al., 2022) dramatically improves multi-step arithmetic and reasoning accuracy. Few-shot prompting provides examples of the desired input-output format within the context window, leveraging in-context learning.

Advanced prompt techniques include: system prompts (persistent instructions shaping model persona and constraints), role prompting ("You are an expert in..."), structured output prompts (requesting JSON or XML format), self-consistency (sampling multiple reasoning chains and majority-voting), and tree-of-thought (exploring multiple reasoning branches simultaneously). Prompt engineering has become a practical engineering discipline in its own right, with significant impact on LLM product quality.

**Difficulty:** L1–L2 (practice is L1, theory is L2) | **Prerequisites:** LLM basics, understanding of context windows.

---

#### 3.10 Retrieval-Augmented Generation (RAG)

**Description.** RAG (Lewis et al., 2020) addresses a fundamental limitation of parametric LLMs: their knowledge is frozen at training time and bounded by context window length. RAG augments generation with a retrieval component that fetches relevant documents from an external corpus at inference time, injecting them into the model's context window before generation. This decouples factual knowledge (in the retrieval index) from reasoning capability (in the LLM), enabling up-to-date answers and transparent sourcing.

A standard RAG pipeline comprises: (1) an offline indexing phase where documents are chunked, embedded via a dense encoder, and stored in a vector database; (2) an online retrieval phase where the user query is embedded and top-k most similar document chunks are fetched (by cosine similarity); (3) a generation phase where the LLM conditions on the retrieved context to produce a grounded answer. Advanced RAG variants add query rewriting, re-ranking (cross-encoder), iterative retrieval, and self-reflection steps.

**Difficulty:** L2–L3 | **Prerequisites:** dense retrieval, vector databases, LLM generation, embedding models.

---

#### 3.11 In-Context Learning (ICL)

**Description.** In-context learning refers to the ability of large autoregressive models to adapt to new tasks solely from examples presented in the context window — no gradient updates occur. The model reads a few demonstrations formatted as `(input, output)` pairs, infers the task pattern, and applies it to a new input. This emergent capability appeared around GPT-3 scale and is not fully understood theoretically, though research suggests the model performs a form of gradient descent in its activation space at forward-pass time (Akyürek et al., 2022).

ICL is distinct from fine-tuning because it leaves model weights unchanged, making it extremely flexible and low-cost for rapid task prototyping. Its limitations include sensitivity to prompt formatting, example selection, and example ordering — performance can degrade significantly with suboptimal demonstrations. Retrieval-based approaches to example selection (selecting the most semantically similar few-shot examples dynamically) largely mitigate this.

**Difficulty:** L2 | **Prerequisites:** LLM architecture, attention, prompt engineering.

---

#### 3.12 Instruction Tuning

**Description.** Instruction tuning (Wei et al., 2021; Ouyang et al., 2022 via InstructGPT) is a fine-tuning approach where models are trained on a diverse collection of (instruction, response) pairs, making them reliably follow natural-language instructions rather than simply continuing text. Vanilla pretrained LLMs are poor instruction followers — they complete prompts statistically rather than executing the intent. Instruction tuning reshapes this behavior by supervising on task-formatted demonstrations across hundreds to thousands of diverse task types.

InstructGPT extended this with Reinforcement Learning from Human Feedback (RLHF): a reward model is trained on human preference judgments between model outputs, and the LLM is then optimized against this reward using PPO. This three-stage pipeline (SFT → RM training → PPO) produces models that are simultaneously helpful, harmless, and honest. RLHF is the core alignment technique behind ChatGPT, Claude, and Gemini.

**Difficulty:** L3 | **Prerequisites:** fine-tuning, reinforcement learning basics, preference modeling.

---

### 4. Algorithm & Model Catalog (≥12)

| Model / Algorithm | Category | Best For | Params Scale | Maturity | Key Innovation |
|---|---|---|---|---|---|
| **BERT** (Devlin et al., 2018) | Encoder LM | NER, classification, QA (extractive) | 110M–340M | Production-stable | Bidirectional MLM pretraining; transfer learning paradigm |
| **RoBERTa** (Liu et al., 2019) | Encoder LM | Robust NLU benchmarks | 125M–355M | Production-stable | Removed NSP, dynamic masking, larger batches; BERT done right |
| **GPT-3** (Brown et al., 2020) | Decoder LM | Few-shot generation, in-context learning | 175B | Superseded by GPT-4 | Scale unlocks emergent few-shot capabilities without fine-tuning |
| **GPT-4 / GPT-4o** (OpenAI, 2023–2024) | Decoder LM (multimodal) | Complex reasoning, coding, vision+text | ~1T (estimated) | Production (API) | RLHF + multimodal; near-human on professional exams |
| **T5 / mT5** (Raffel et al., 2019) | Encoder-Decoder | Summarization, MT, any seq2seq | 60M–11B | Production-stable | "Text-to-text" unification of all NLP tasks; multilingual mT5 |
| **LLaMA 2 / 3** (Touvron et al., Meta, 2023–2024) | Decoder LM | Open-source fine-tuning, research | 7B–70B | Active development | Open weights; grouped query attention; strong RLHF alignment |
| **Mistral 7B / Mixtral 8×7B** (Mistral AI, 2023) | Decoder LM / MoE | Efficient deployment, instruction following | 7B / 46.7B active | Production-ready | Sliding window attention; sparse MoE outperforms dense 7B |
| **Qwen2.5** (Alibaba, 2024) | Decoder LM | Multilingual (Chinese + EN), coding | 0.5B–72B | Active | Strong multilingual; long context (128k); open weights |
| **PhoBERT** (Nguyen & Tuan Nguyen, VinAI, 2020) | Encoder LM | Vietnamese NLU tasks | 135M | Stable, widely used | First large-scale pretrained model for Vietnamese; RoBERTa-based |
| **Sentence-Transformers (SBERT)** (Reimers & Gurevych, 2019) | Embedding model | Semantic search, clustering, RAG retrieval | 22M–560M | Production-stable | Siamese fine-tuning of BERT for sentence-level similarity |
| **BM25 + Hybrid Retrieval** | Sparse retrieval | Keyword-sensitive search, hybrid RAG | N/A (algorithmic) | Mature | Probabilistic term frequency with IDF; robust to sparse queries |
| **LoRA / QLoRA** (Hu et al., 2021; Dettmers et al., 2023) | Fine-tuning method | Cost-efficient model adaptation | Adds ~0.1% params | Industry standard | Low-rank decomposition of weight updates; 4-bit quantized variant |
| **RLHF / DPO** (Ouyang et al., 2022; Rafailov et al., 2023) | Alignment method | Instruction following, safety | N/A (training method) | Widely deployed | Human preference optimization; DPO eliminates explicit RM training |
| **ColBERT** (Khattab & Zaharia, 2020) | Late-interaction retrieval | High-recall dense retrieval | 110M | Research→production | Late interaction: per-token MaxSim scoring over compressed embeddings |

---

### 5. State of the Art (2024–2026)

#### 5.1 LLM Leaderboards

**MMLU (Massive Multitask Language Understanding):** As of early 2026, top-performing models include GPT-4o (~88%), Claude 3.7 Sonnet (~87%), Gemini 1.5 Pro (~86%), and Llama 3.1 405B (~85%). Performance has plateaued near human expert baselines (~89%) on the original benchmark, driving adoption of harder successors like MMLU-Pro and GPQA Diamond.

**HumanEval (Code Generation):** GPT-4o and Claude 3.5/3.7 achieve pass@1 scores above 90% on the original 164-problem benchmark. DeepSeek-Coder and Qwen2.5-Coder achieve competitive results among open-source models. HumanEval+ and LiveCodeBench now serve as harder alternatives.

**MT-Bench (Instruction Following):** GPT-4 class models consistently score 8.9–9.2/10 on MT-Bench's multi-turn conversation benchmark. Open models like LLaMA 3.1 70B-Instruct and Mistral Large have closed the gap to within ~5–10% of proprietary frontier models.

#### 5.2 Multimodal NLP

**GPT-4o** (May 2024) unified text, vision, and audio in a single end-to-end model with real-time voice conversation capabilities. **Gemini 1.5 Pro** extended context to 1 million tokens and demonstrated strong multimodal long-document understanding. **Claude 3.5 Sonnet / 3.7 Sonnet** (Anthropic, 2024–2025) achieved best-in-class performance on coding and vision tasks with improved instruction following. Multimodal NLP is now mainstream: OCR-free document understanding, chart reasoning, and visual QA are standard enterprise features.

#### 5.3 Efficient LLMs

The "small but mighty" trend accelerated through 2024–2025. **Mistral 7B** demonstrated that dense 7B models with architectural improvements (grouped-query attention, sliding window attention) can outperform GPT-3.5 on many benchmarks. **Phi-3** (Microsoft, 2024) showed that high-quality "textbook" training data allows a 3.8B model to rival much larger models on reasoning tasks. **Qwen2.5** established a new Pareto frontier for multilingual small models. **Gemma 2** (Google, 2024) offers strong performance with Apache 2.0 licensing, enabling broad commercial deployment.

#### 5.4 Vietnamese NLP (2024–2026)

The Vietnamese NLP ecosystem matured significantly. **PhoGPT** (VinAI, 2023) became the first openly available Vietnamese generative model (7.5B parameters). **Vistral-7B** (2024), a fine-tuned variant of Mistral for Vietnamese, demonstrated strong instruction-following capability. Zalo AI and FPT.AI continue to develop proprietary Vietnamese LLMs for enterprise chatbot deployments. Multilingual models like Qwen2.5 and SeaLLM are increasingly competitive on Vietnamese benchmarks due to large-scale multilingual pretraining.

#### 5.5 Key Trends (2024–2026)

- **Long context windows:** Gemini 1.5 Pro (1M tokens), Claude 3.x (200k tokens), LLaMA 3.1 (128k tokens). Long context enables whole-codebase reasoning, book-length summarization, and multi-document RAG without chunking.
- **Reasoning models:** OpenAI o1/o3, DeepSeek-R1, QwQ-32B demonstrate that training models to generate extended chain-of-thought reasoning before answering dramatically improves performance on math, coding, and logical reasoning tasks.
- **Agentic NLP:** LLMs as autonomous agents using tool-calling, code execution, web browsing, and multi-step planning (AutoGPT lineage, Claude computer-use, GPT-4o function calling). This transforms NLP from a batch processing task to a dynamic interactive capability.
- **Structured outputs:** JSON mode, function calling, and constrained decoding (outlines, guidance) are now production features enabling reliable integration of LLMs with downstream systems.
- **MoE architectures:** Mixtral 8×7B, DeepSeek-V2, and GPT-4 (alleged MoE) show that sparse mixture-of-experts models offer better compute efficiency at equivalent quality.

---

### 6. Key Papers (≥10)

---

**[P01] Attention Is All You Need**
- Authors: Vaswani, A., Shazeer, N., Parmar, N., et al. (Google Brain)
- Year: 2017 | Venue: NeurIPS 2017
- Contribution: Introduced the transformer architecture, replacing recurrence and convolution entirely with multi-head self-attention and position-wise feed-forward networks. Achieved new state-of-the-art on WMT English-German translation with dramatically faster training due to parallelizability. Became the foundational architecture for essentially all subsequent large language models.
- Impact: 100,000+ citations; defines the modern NLP era.
- arXiv: https://arxiv.org/abs/1706.03762

---

**[P02] BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding**
- Authors: Devlin, J., Chang, M.-W., Lee, K., Toutanova, K. (Google AI)
- Year: 2018 | Venue: NAACL 2019
- Contribution: Proposed masked language modeling (MLM) and next sentence prediction (NSP) for bidirectional pretraining of transformer encoders, then fine-tuned on 11 NLP benchmarks, setting new records on all of them simultaneously. Established the pretrain-then-fine-tune paradigm as the dominant NLP methodology.
- Impact: 50,000+ citations; birthed the BERT family (RoBERTa, ALBERT, DeBERTa, PhoBERT).
- arXiv: https://arxiv.org/abs/1810.04805

---

**[P03] Language Models are Few-Shot Learners (GPT-3)**
- Authors: Brown, T., Mann, B., Ryder, N., et al. (OpenAI)
- Year: 2020 | Venue: NeurIPS 2020
- Contribution: Scaled autoregressive language modeling to 175 billion parameters trained on 300B tokens. Demonstrated that with sufficient scale, LLMs exhibit in-context learning — solving new tasks from a handful of examples without gradient updates. Introduced the few-shot / zero-shot / one-shot taxonomy that now defines LLM capability evaluation.
- Impact: Triggered the modern LLM industry; 20,000+ citations.
- arXiv: https://arxiv.org/abs/2005.14165

---

**[P04] Training language models to follow instructions with human feedback (InstructGPT)**
- Authors: Ouyang, L., Wu, J., Jiang, X., et al. (OpenAI)
- Year: 2022 | Venue: NeurIPS 2022
- Contribution: Formalized the RLHF pipeline for aligning LLMs: supervised fine-tuning on demonstrations, reward model training from human preference comparisons, and PPO optimization. Showed that a 1.3B parameter InstructGPT model was preferred over the 175B GPT-3 by human raters, demonstrating that alignment quality can outweigh raw scale.
- Impact: Foundation of ChatGPT, Claude, and Gemini alignment; 10,000+ citations.
- arXiv: https://arxiv.org/abs/2203.02155

---

**[P05] LoRA: Low-Rank Adaptation of Large Language Models**
- Authors: Hu, E., Shen, Y., Wallis, P., et al. (Microsoft)
- Year: 2021 | Venue: ICLR 2022
- Contribution: Proposed decomposing weight update matrices as low-rank products `ΔW = BA` where `B ∈ R^{d×r}`, `A ∈ R^{r×k}`, `r << min(d,k)`, keeping pretrained weights frozen. Reduces trainable parameters by 10,000× for GPT-3-scale models while matching or exceeding full fine-tuning performance on several benchmarks.
- Impact: Standard PEFT method for all open-source LLM fine-tuning; enables commodity-hardware adaptation.
- arXiv: https://arxiv.org/abs/2106.09685

---

**[P06] Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks**
- Authors: Lewis, P., Perez, E., Piktus, A., et al. (Facebook AI Research)
- Year: 2020 | Venue: NeurIPS 2020
- Contribution: Proposed combining a dense retriever (DPR) with a seq2seq generator (BART) end-to-end, where retrieved documents are used as soft conditioning for generation. Demonstrated that this parametric-nonparametric hybrid outperforms pure parametric (closed-book) models on Open-Domain QA tasks, with the added benefit of interpretable sourcing.
- Impact: Foundational architecture for all modern RAG systems; 5,000+ citations.
- arXiv: https://arxiv.org/abs/2005.11401

---

**[P07] Llama 2: Open Foundation and Fine-Tuned Chat Models**
- Authors: Touvron, H., Martin, L., Stone, K., et al. (Meta AI)
- Year: 2023 | Venue: arXiv / Meta Technical Report
- Contribution: Released 7B, 13B, 34B, and 70B parameter open-weights models trained on 2T tokens, along with RLHF-aligned Llama 2-Chat variants. Provided detailed safety evaluation methodology. Enabled the open-source fine-tuning ecosystem (Alpaca, Vicuna, WizardLM, etc.) that democratized LLM research globally.
- Impact: Highest-impact open-source LLM release; enabled Vietnamese and other low-resource language fine-tuning.
- arXiv: https://arxiv.org/abs/2307.09288

---

**[P08] PhoBERT: Pre-trained Language Models for Vietnamese**
- Authors: Nguyen, D.Q., & Tuan Nguyen, A. (VinAI Research)
- Year: 2020 | Venue: EMNLP Findings 2020
- Contribution: Trained the first large-scale Vietnamese language model using RoBERTa architecture on 20GB of Vietnamese text data (news + Wikipedia), with a Vietnamese-specific BPE vocabulary of 64,000 tokens. Achieved new state-of-the-art on Vietnamese NLP benchmarks including NER and POS tagging, establishing the foundation for the Vietnamese NLP ecosystem.
- Impact: Most widely used Vietnamese NLP model; >1,000 citations; spawned PhoNLP, PhoGPT lineage.
- arXiv: https://arxiv.org/abs/2003.00744

---

**[P09] Chain-of-Thought Prompting Elicits Reasoning in Large Language Models**
- Authors: Wei, J., Wang, X., Schuurmans, D., et al. (Google Brain)
- Year: 2022 | Venue: NeurIPS 2022
- Contribution: Demonstrated that prompting LLMs with intermediate reasoning steps ("chain-of-thought") dramatically improves performance on multi-step arithmetic, commonsense reasoning, and symbolic reasoning tasks. The key finding was that this ability is an emergent property of sufficient model scale (>100B parameters), and that the simple phrase "Let's think step by step" elicits reasoning in zero-shot settings.
- Impact: Redefined how LLMs are evaluated and deployed; foundational for reasoning model research (o1, R1).
- arXiv: https://arxiv.org/abs/2201.11903

---

**[P10] Scaling Laws for Neural Language Models**
- Authors: Kaplan, J., McCandlish, S., Henighan, T., et al. (OpenAI)
- Year: 2020 | Venue: arXiv
- Contribution: Established empirical power-law relationships between model performance (cross-entropy loss) and three factors: model parameters N, dataset size D, and compute budget C. Found that performance scales predictably across 7 orders of magnitude and that optimal compute allocation should scale model size and data together. This provided a principled basis for resource allocation in LLM pretraining.
- Impact: Directly guided GPT-3 and all subsequent large model training decisions; updated by Chinchilla paper (2022).
- arXiv: https://arxiv.org/abs/2001.08361

---

**[P11] Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks**
- Authors: Reimers, N., & Gurevych, I. (UKP Lab, TU Darmstadt)
- Year: 2019 | Venue: EMNLP 2019
- Contribution: Showed that vanilla BERT produces poor sentence embeddings for semantic similarity tasks due to its token-pair input format. Proposed Siamese and triplet network fine-tuning with natural language inference data to produce semantically meaningful sentence vectors that can be compared via cosine similarity. Enabled efficient semantic search over millions of sentences.
- Impact: Powers most RAG embedding pipelines; Hugging Face sentence-transformers library has 500M+ downloads.
- arXiv: https://arxiv.org/abs/1908.10084

---

### 7. Mathematical Foundations (≥5 Topics)

---

#### 7.1 Scaled Dot-Product Attention (Full Derivation)

Given input matrix `X ∈ R^{n × d_model}`, compute projections:
```
Q = X W_Q,   W_Q ∈ R^{d_model × d_k}
K = X W_K,   W_K ∈ R^{d_model × d_k}
V = X W_V,   W_V ∈ R^{d_model × d_v}
```

Attention output:
```
A = softmax( Q Kᵀ / √d_k ) ∈ R^{n × n}
Output = A V ∈ R^{n × d_v}
```

The softmax is applied row-wise: `softmax(z)_i = exp(z_i) / Σ_j exp(z_j)`.

The `√d_k` scaling is necessary because for large `d_k`, random initialization produces dot products with variance `d_k`, pushing softmax into saturation regions with near-zero gradients. Dividing by `√d_k` restores unit variance.

For **causal (masked) attention** used in decoder/GPT models, a mask matrix `M` is applied:
```
A = softmax( (Q Kᵀ / √d_k) + M )
```
where `M_{ij} = 0` if `j ≤ i`, else `-∞`. This ensures token `i` cannot attend to future token `j > i`.

---

#### 7.2 Cross-Entropy Loss for Language Modeling

For a vocabulary of size `|V|` and a sequence of `T` tokens `(x_1, ..., x_T)`, the language model produces a probability distribution `p_θ(x_t | x_{<t})` over the vocabulary at each step. The cross-entropy loss is:

```
L(θ) = - (1/T) Σ_{t=1}^{T} log p_θ(x_t | x_1, ..., x_{t-1})
```

This is equivalent to negative log-likelihood of the true tokens under the model. The gradient `∇_θ L` is computed via backpropagation through time (BPTT) — though transformers avoid sequential dependency, allowing full parallelization across positions.

For **masked LM** (BERT), only the 15% masked positions contribute to the loss:
```
L_MLM(θ) = - (1/|M|) Σ_{i ∈ M} log p_θ(x_i | x_{masked})
```
where `M` is the set of masked positions.

---

#### 7.3 Byte-Pair Encoding (BPE) Algorithm

BPE tokenization operates in two phases:

**Training phase:**
```
Input: raw corpus C, target vocabulary size V_target
Initialize: vocabulary V = {all characters} ∪ {</w>}  # </w> marks word end
Repeat until |V| == V_target:
    count = count_bigram_frequencies(C)
    (a*, b*) = argmax_{(a,b)} count[(a,b)]
    V = V ∪ {a*b*}            # add merged token
    C = replace_all(a* b*, a*b*, C)   # update corpus
Return: V, merge_rules
```

**Inference phase:** Apply merge rules in order of training priority to tokenize new text. Example:
```
"unhappiness" → ["u","n","h","a","p","p","i","n","e","s","s"]
→ after merges: ["un", "happiness"] or ["un", "hap", "pi", "ness"]
```

BPE vocabularies for major models: GPT-4 uses ~100K BPE tokens, LLaMA 3 uses 128K, Qwen2.5 uses 152K (optimized for CJK and multilingual coverage).

---

#### 7.4 Contrastive Loss (SimCSE)

SimCSE (Gao et al., 2021) learns sentence embeddings via a contrastive objective. Given a batch of `N` sentences, two views of each sentence are created by passing the sentence twice through a dropout-augmented encoder (different dropout masks produce different representations). The objective is:

```
L = - (1/N) Σ_i log [ exp(sim(h_i, h_i⁺) / τ) / Σ_{j=1}^{N} exp(sim(h_i, h_j⁺) / τ) ]
```

Where:
- `h_i` = embedding of sentence `i` (first dropout mask)
- `h_i⁺` = embedding of same sentence `i` (second dropout mask) — positive pair
- `h_j⁺` for `j ≠ i` = negatives (other sentences in the batch)
- `sim(u,v) = uᵀv / (‖u‖‖v‖)` = cosine similarity
- `τ` = temperature hyperparameter (typically 0.05)

This encourages the model to produce consistent representations for the same semantic content despite stochastic dropout, while pushing apart representations of different sentences.

---

#### 7.5 Perplexity as LM Evaluation Metric

Perplexity (PPL) is the standard intrinsic evaluation metric for language models, measuring how well a model predicts a held-out test corpus. It is the exponentiated average negative log-likelihood:

```
PPL(W) = exp( - (1/N) Σ_{i=1}^{N} log p_θ(w_i | w_1,...,w_{i-1}) )
```

Intuitively, perplexity is the model's "surprise" — a perplexity of `k` means the model is as uncertain as if it had to choose uniformly among `k` options at each step. Lower perplexity = better model. Reference points: character-level models on English achieve ~1.5 PPL per character; word-level GPT-3 achieves ~20 PPL on Penn Treebank; frontier LLMs achieve <10 PPL on standard benchmarks.

An important caveat: perplexity is sensitive to tokenization scheme — models with larger vocabularies tend to have lower apparent perplexity simply due to fewer prediction steps, making cross-model comparison require normalization to bits-per-character (BPC).

---

### 8. Evolution Timeline (≥12 Milestones)

| Year | Milestone | Significance |
|---|---|---|
| **1950** | Turing Test (Alan Turing) | First formal framing of machine language understanding; set the goal for AI-NLP for decades |
| **1966** | ELIZA (Weizenbaum, MIT) | First conversational chatbot using pattern matching; revealed human anthropomorphization tendencies |
| **1986** | Backpropagation (Rumelhart et al.) | Enabled training of multi-layer neural networks; prerequisite for all deep NLP |
| **1997** | LSTM (Hochreiter & Schmidhuber) | Long Short-Term Memory solved vanishing gradient for sequence modeling; dominated NLP until 2018 |
| **2003** | Neural Language Models (Bengio et al.) | First neural LM with learned word embeddings; precursor to Word2Vec |
| **2013** | Word2Vec (Mikolov et al., Google) | Scalable word embeddings revealing linear semantic structure; democratized NLP feature engineering |
| **2015** | Attention Mechanism (Bahdanau et al.) | Soft alignment for MT; solved the bottleneck of fixed-size encoder vectors |
| **2017** | Transformer (Vaswani et al., Google) | Eliminated recurrence; fully parallel sequence modeling; foundation of all modern LLMs |
| **2018** | BERT + GPT (Google / OpenAI) | Established the pretrain-finetune paradigm; redefined NLP benchmarks across all tasks |
| **2020** | GPT-3 (175B, OpenAI) | Emergent few-shot learning at scale; triggered LLM industry and investment boom |
| **2020** | PhoBERT (VinAI Research) | First Vietnamese large-scale pretrained LM; marked maturation of Vietnamese NLP ecosystem |
| **2022** | ChatGPT / InstructGPT (OpenAI) | RLHF-aligned LLM; mass consumer adoption; transformed public perception of AI |
| **2023** | LLaMA 1/2 (Meta) + Open-Source Boom | Open weights models enabled global fine-tuning; democratized frontier-class NLP capabilities |
| **2024** | Reasoning Models: o1, DeepSeek-R1 | Extended chain-of-thought + RL training; models that "think" before answering; new capability frontier |
| **2025** | Agentic NLP (tool-use, computer-use) | LLMs as autonomous agents; NLP transitions from passive processing to active task execution |

---

### 9. Vietnamese NLP — Special Section

#### 9.1 State of the Vietnamese NLP Ecosystem

Vietnamese NLP has undergone a transformation from near-zero tooling in the early 2010s to a moderately mature ecosystem by 2025–2026. The key institutions and their contributions:

**VinAI Research** (Vietnam's leading AI lab):
- **PhoBERT** (2020): RoBERTa-based encoder, 135M parameters, trained on 20GB Vietnamese text. Achieves SOTA on NER, POS, dependency parsing, NLI. Two variants: PhoBERT-base and PhoBERT-large.
- **PhoNLP** (2021): Multi-task learning model for POS tagging, NER, and dependency parsing jointly, built on PhoBERT.
- **PhoGPT** (2023): Decoder-only generative model, 4B and 7.5B parameter variants, trained on 102GB of Vietnamese text. First openly available Vietnamese-language generative model.
- **PhoWhisper** (2023): Vietnamese speech recognition based on Whisper fine-tuning.

**Zalo AI** (VNG Corporation):
- ZaloAI Annual Challenges have produced datasets and baselines for Vietnamese NER, SA, machine reading comprehension.
- Proprietary Vietnamese chatbot models deployed in Zalo messaging platform (100M+ users).

**FPT.AI**:
- FPT OpenAI Lab: proprietary Vietnamese NLP models for enterprise; Vietnamese ASR, TTS, NLU for contact center automation.

**Multilingual models with Vietnamese coverage**:
- **SeaLLM** (SeaLLM, 2024): Specifically fine-tuned for Southeast Asian languages including Vietnamese.
- **Vistral-7B** (2024): Mistral 7B fine-tuned on Vietnamese instruction data; strong Vietnamese chat capability.
- **Qwen2.5** (Alibaba): Includes Vietnamese in multilingual training; competitive on Vi benchmarks.
- **mT5, XLM-R**: multilingual baselines with solid Vietnamese performance.

#### 9.2 Unique Linguistic Challenges

Vietnamese presents several NLP challenges that differ fundamentally from Indo-European languages:

**Tonal Language:** Vietnamese has 6 tones (ngang, huyền, sắc, hỏi, ngã, nặng) encoded as diacritical marks in written form. Tone affects meaning: "ma" (ghost), "mà" (but), "má" (cheek/mother), "mả" (tomb), "mã" (code/horse), "mạ" (rice seedling) are entirely different words. Tone-insensitive tokenizers and models systematically fail on Vietnamese text. Diacritic normalization (removing tones) is common in informal Vietnamese internet text, creating a distribution shift between formal and informal corpora.

**Word Segmentation:** Unlike English where spaces approximate word boundaries, Vietnamese spaces separate syllables (monosyllabic morphemes), not words. The phrase "học sinh" (student) consists of two syllables "học" + "sinh" that are jointly a single word, but each syllable has independent meanings (study + life). Vietnamese word segmentation requires explicit disambiguation — there is no universal gold standard tokenization, and different word segmenters produce conflicting outputs. This is the fundamental preprocessing challenge for all Vietnamese NLP pipelines. Tools: VnCoreNLP, UDPipe Vietnamese, RDRsegmenter.

**Code-switching:** Vietnamese internet text extensively mixes Vietnamese, English, and sometimes French (colonial legacy). A typical social media sentence: "Mình đang code một cái web app dùng React và deploy lên AWS nhé." (I'm coding a web app using React and deploying to AWS.) Handling code-switched text requires bilingual tokenization and models trained on mixed-language corpora.

**Morphological Simplicity:** Vietnamese is highly analytic (no inflection, no conjugation). This simplifies some tasks (no lemmatization needed) but eliminates morphological cues that help other languages with named entity recognition and syntactic parsing.

**Formal vs. Informal Text:** Vietnamese formal text (news, legal, academic) differs substantially from informal text (social media, chat) in vocabulary, diacritic usage, and syntax. Models trained primarily on formal text perform poorly on informal Vietnamese, which is practically important for social media monitoring and customer service NLP.

#### 9.3 Available Datasets

| Dataset | Task | Size | Source |
|---|---|---|---|
| **VLSP NER** (2016, 2018) | Named Entity Recognition | ~16K sentences | VLSP Workshop |
| **PhoNER COVID-19** | COVID-19 NER | 35K syllables | VinAI |
| **ViQuAD** | Vietnamese QA (SQuAD-style) | 23K QA pairs | HKUST + VNU |
| **UIT-VSFC** | Sentiment Analysis (student feedback) | 16K sentences | UIT |
| **ViNLI** | Natural Language Inference | ~30K pairs | Multiple authors |
| **PhoMT** | Machine Translation (En-Vi) | 3.02M sentence pairs | VinAI |
| **VLUE** | General NLU benchmark (8 tasks) | Multi-task | VinAI |
| **ViMMRC** | Machine Reading Comprehension | 2.8K questions | Multiple |
| **UIT-ViSFD** | Aspect-based Sentiment (smartphones) | 11K reviews | UIT |

#### 9.4 Vietnamese NLP Maturity Comparison

| Dimension | English NLP | Chinese NLP | Korean NLP | Vietnamese NLP |
|---|---|---|---|---|
| LLM availability | Frontier (GPT-4, Claude 3.7) | Strong (Qwen, Baichuan, Yi) | Moderate (HyperCLOVA, EXAONE) | Emerging (PhoGPT, Vistral) |
| Pretrained encoders | Extensive (100+ BERT variants) | Strong (ERNIE, RoBERTa-zh) | Good (KoBERT, KLUE-BERT) | Limited (PhoBERT, XLM-R) |
| Benchmark datasets | Extensive (100+ datasets) | Strong (CLUE, FewCLUE) | Moderate (KLUE) | Limited (~15 datasets) |
| Word segmentation | Trivial (spaces = words) | Challenging (no spaces) | Moderate | Challenging (syllable-spaced) |
| Commercial deployment | Mainstream | Mainstream | Growing | Emerging |
| Research publications | Dominant | Growing fast | Moderate | Small but increasing |

The gap between Vietnamese and Chinese NLP is narrowing rapidly due to: (1) multilingual LLMs including Vietnamese, (2) VinAI and Zalo investment, (3) growing Vietnamese NLP community at EMNLP/ACL venues. The primary bottleneck remains annotated dataset quantity — most Vietnamese datasets are 10-50× smaller than English equivalents.

---

### 10. Cross-Domain Connections (MAESTRO Knowledge Graph)

NLP is not an isolated module — it is deeply interconnected with other MAESTRO knowledge baselines:

**B01 — Time Series Forecasting:**
Textual signals (news articles, earnings call transcripts, social media sentiment, central bank statements) are powerful leading indicators for financial and demand forecasting. NLP pipelines extract sentiment scores, entity mentions, and topic signals that feed as features into time series models. Event detection (product launches, policy changes, supply disruptions) from news text is increasingly standard in enterprise forecasting.

**B02 — Document Intelligence:**
Document AI (invoice extraction, contract analysis, PDF parsing) is fundamentally an NLP problem: layout-aware transformers (LayoutLM, DocFormer) apply BERT-style pretraining to document image + text pairs. NER extracts key-value pairs from documents, relation extraction captures document structure, and summarization produces executive digests from long reports.

**B03 — Multimodal AI (CLIP/Vision):**
Vision-language models (CLIP, ALIGN, Flamingo, LLaVA) extend NLP encoders to align text and image representations in a shared embedding space. Contrastive pretraining on image-caption pairs produces encoders that support cross-modal search (find image by text query) and visual QA (answer questions about images). GPT-4o's unified multimodal architecture represents the convergence of B03 and B04.

**B08 — Conversational AI:**
Conversational AI is NLP's most visible application. Task-oriented dialogue systems require NLU (intent classification, slot filling), dialogue state tracking, and NLG (response generation). Open-domain chatbots built on instruction-tuned LLMs represent the current frontier. Vietnamese chatbot development relies directly on the Vietnamese NLP infrastructure surveyed in Section 9.

**B09 — Generative AI:**
LLMs are simultaneously the core of modern NLP and the core of generative AI. B09 covers the creative, content generation, and multi-modal generative aspects; B04 covers the linguistic understanding and task-specific NLP dimensions. The overlap is substantial — GPT-4, Claude 3.7, and Gemini 1.5 are both NLP systems and generative AI systems.

**B11 — Knowledge Graphs:**
Knowledge graph construction is a downstream NLP task: NER extracts entities, relation extraction populates edges, coreference resolution merges entity mentions, and entity linking maps surface forms to canonical knowledge base entries. Conversely, knowledge graphs ground LLMs — RAG can retrieve from structured KGs using SPARQL or graph embeddings, providing precise factual context that reduces hallucination.

**B12 — Search & Retrieval (RAG):**
Modern search is bi-encoders + cross-encoders built on NLP models. BM25 (lexical), DPR/ColBERT (dense), and hybrid rerankers combine NLP embeddings with IR techniques. RAG (Section 3.10) is the dominant architecture for combining retrieval with LLM generation, and B12 is the infrastructure layer that operationalizes it at scale.

---

### 11. Knowledge Structure Map — Practitioner Roadmap

```
L0 — PREREQUISITES (No ML background required)
├── Python programming (list, dict, file I/O, APIs)
├── Basic statistics (mean, variance, probability, Bayes theorem)
├── Linear algebra fundamentals (vectors, matrix multiply, dot product)
└── What is a neural network (perceptron, activation, loss)

L1 — NLP FOUNDATIONS (1–2 months)
├── Text preprocessing: tokenization, stopwords, stemming/lemmatization
├── Bag-of-words, TF-IDF, n-gram models
├── Classical NLP tasks: regex NER, rule-based systems
├── Word embeddings: Word2Vec, GloVe — concepts and usage
├── Sequence models: RNN, LSTM (conceptual understanding)
└── Using HuggingFace Transformers library for inference

L2 — CORE TRANSFORMER NLP (2–3 months)
├── Attention mechanism (mathematical derivation)
├── Transformer architecture: encoder, decoder, encoder-decoder
├── BERT fine-tuning for classification, NER, QA
├── GPT-style text generation, temperature/sampling strategies
├── Sentence embeddings (SBERT) + cosine similarity
├── Building a RAG pipeline (chunking → embedding → retrieval → generation)
├── Vietnamese NLP: PhoBERT usage, PhoNLP, VnCoreNLP word segmentation
└── Evaluation: F1, BLEU, ROUGE, perplexity

L3 — ADVANCED NLP (3–6 months)
├── Pretraining objectives: MLM, CLM, contrastive (SimCSE)
├── RLHF / DPO pipeline implementation
├── LoRA / QLoRA fine-tuning on domain-specific data
├── Advanced RAG: query rewriting, re-ranking, hybrid retrieval
├── Long-context models and chunking strategies
├── Prompt engineering: chain-of-thought, self-consistency, ReAct
├── Structured output generation (JSON mode, function calling)
├── Vietnamese LLM fine-tuning: Vistral, PhoGPT adaptation
└── Evaluation: LLM-as-judge, MT-Bench methodology

L4 — RESEARCH FRONTIER (ongoing)
├── Reasoning models: o1/R1-style process reward modeling
├── Mechanistic interpretability (attention patterns, circuits)
├── Efficient attention: flash attention, linear attention (Mamba, RWKV)
├── Multimodal NLP: vision-language alignment, audio-text
├── Agentic NLP: tool use, planning, multi-agent orchestration
├── Low-resource Vietnamese NLP: data augmentation, cross-lingual transfer
├── Hallucination mitigation: factuality training, uncertainty calibration
└── Constitutional AI / AI safety in LLM deployment
```

---

### 12. Confidence Assessment

| Finding | Confidence | Evidence Source |
|---|---|---|
| Transformer is the dominant architecture for all NLP tasks | Very High (95%) | NeurIPS/ACL 2023–2025 proceedings; benchmark results across all tasks |
| BERT pretrain-finetune paradigm is established and stable | Very High (95%) | 50,000+ citations; reproducible across multiple independent implementations |
| PhoBERT is the best open-source Vietnamese encoder (2024) | High (85%) | VLSP/VLUE benchmark results; VinAI technical reports |
| GPT-4/Claude 3.x near-human on MMLU | High (85%) | OpenAI/Anthropic technical reports; independent third-party evaluations |
| Reasoning models (o1, R1) represent a new capability tier | High (80%) | AIME/MATH/SWE-Bench results; multiple lab replications (DeepSeek-R1, QwQ) |
| Vietnamese NLP is ~5–7 years behind English NLP | Moderate (75%) | Dataset quantity comparison; benchmark availability; deployment maturity estimates |
| 1M token context is practically useful (vs. attention sink artifacts) | Moderate (70%) | Gemini 1.5 technical report; "lost in the middle" phenomenon is real at scale |
| LLM hallucination is an unsolved fundamental problem | High (85%) | FActScore evaluations; TruthfulQA benchmarks; consistent across all frontier models |
| BPE subword tokenization is near-optimal for Vietnamese | Moderate (65%) | PhoBERT paper; some evidence that syllable-level tokenization may be competitive |
| RLHF/DPO fully solves instruction following | Low (45%) | Jailbreak literature; alignment tax; DPO instability at scale; ongoing research |

---

### 13. Open Questions and Research Gaps

#### 13.1 Hallucination and Factual Grounding

The most critical unsolved problem in applied NLP. Current LLMs generate fluent, confident, plausible-sounding text that is factually incorrect at rates of 5–25% depending on task domain, model, and evaluation methodology. RAG reduces but does not eliminate hallucination (models hallucinate even with correct context in the context window). Proposed approaches — factuality fine-tuning (FActScore-guided), uncertainty calibration, retrieval-augmented verification, and Constitutional AI — all show partial improvements without systematic resolution. A fundamental tension exists between fluency optimization (next-token prediction) and factual accuracy (which may require retrieval or explicit verification).

#### 13.2 Reasoning vs. Pattern Matching

Chain-of-thought reasoning models (o1, R1) achieve impressive benchmark scores on math and logic problems, but it remains contested whether this represents genuine multi-step reasoning or highly sophisticated pattern matching over training data contamination. Models still fail systematically on novel logical structures that differ modestly from training examples, suggesting reasoning generalization is incomplete. The mechanistic question — how reasoning traces emerge and are executed — is an active interpretability research area.

#### 13.3 Long-Context Faithfulness

While Gemini 1.5 and Claude 3.x accept 200k–1M token contexts, empirical evidence consistently shows "lost in the middle" degradation: information in the middle of long contexts is retrieved less reliably than information at the beginning or end. The computational `O(n²)` attention cost is also a practical barrier for very long documents. Linear attention alternatives (Mamba, RWKV) sacrifice full attention recall for efficiency, with unclear practical tradeoffs.

#### 13.4 Vietnamese Low-Resource NLP Challenges

Several critical gaps remain in the Vietnamese NLP ecosystem:
- **No frontier-scale Vietnamese LLM** with truly competitive multilingual reasoning. PhoGPT-7.5B and Vistral-7B are useful but far below GPT-4 class on complex reasoning.
- **Limited dialectal coverage:** Southern vs. Northern Vietnamese dialects, regional vocabulary variation, and informal code-switching are poorly covered by existing datasets.
- **Low-resource specialized domains:** Vietnamese medical, legal, and scientific NLP lacks annotated datasets. A Vietnamese medical NER dataset with full ICD-10 coverage does not exist at comparable English scale.
- **Word segmentation gold standard:** Multiple Vietnamese word segmenters (VnCoreNLP, UDPipe, Underthesea) produce divergent tokenizations on identical input, complicating cross-system comparisons and model ensembling.
- **Evaluation infrastructure:** No Vietnamese equivalent to MMLU or MT-Bench with standardized methodology and leaderboard infrastructure.

#### 13.5 Multilinguality vs. Monolingual Quality Trade-off

Multilingual models (mBERT, XLM-R, Qwen2.5) achieve good Vietnamese performance without dedicated Vietnamese pretraining, but typically underperform monolingual Vietnamese models (PhoBERT) on Vietnamese-specific benchmarks. As multilingual model scale increases, this gap narrows — but the cross-lingual alignment may suppress language-specific nuances. The optimal strategy (multilingual foundation + Vietnamese fine-tuning vs. fully Vietnamese pretraining) remains empirically contested.

#### 13.6 Evaluation Contamination

As LLMs are trained on increasingly large fractions of the internet, benchmark contamination — where test set examples appear in training data — becomes a serious evaluation validity concern. MMLU, HumanEval, and GSM8K all show contamination signals for large models. The field is actively developing dynamic benchmarks (LiveBench, LiveCodeBench, BIG-Bench Hard variants) that use time-stamped data cutoffs, but no consensus solution exists.

#### 13.7 Energy and Efficiency

Training frontier LLMs requires megawatt-hour scale energy consumption. GPT-4 training was estimated at ~50 GWh; Llama 3 405B at ~30 GWh. Inference at scale (millions of queries per day) has comparable cumulative costs. Parameter-efficient methods (LoRA, quantization, distillation) address deployment efficiency, but pretraining costs remain a significant environmental and economic barrier for lower-resource research communities, including Vietnamese academic institutions.

---

*End of Research Report B04 — Natural Language Processing*
*Prepared by: Dr. Archon (R-α), Chief Research & Architecture Strategist, MAESTRO Knowledge Graph Platform*
*Date: 2026-03-31 | Classification: Internal Research — Phase 1 Module B04*
