# Deep Learning Engineer Notes: Conversational AI & Chatbots (B08)
## By Duc Le (R-DLE) — Date: 2026-03-31

### Transformer Variants for Dialogue

**Encoder-only (BERT-style)**
- PhoBERT, XLM-RoBERTa: best for classification tasks (intent, sentiment, NER)
- Fast inference, small footprint; use for the NLU pipeline component
- PhoBERT-large (370M params): ~5ms per inference on GPU, suitable for real-time

**Decoder-only (GPT-style)**
- Vistral-7B, Qwen2.5-7B/14B/32B, Llama 3.1: generative response models
- Autoregressive generation means latency scales with output length — plan for 1-5 seconds
- For Vietnamese: Qwen2.5 has strong multilingual performance; Vistral is Vietnamese-native

**Encoder-Decoder (T5-style)**
- ViT5, mT5: good for structured generation (slot filling, query rewriting)
- Less common in modern chatbot stacks but useful for specific subtasks

**Architecture Selection for B08**
- NLU pipeline: PhoBERT (intent + NER) — fast, accurate, cheap
- Response generation: Qwen2.5-7B with LoRA fine-tuning — good Vietnamese, manageable size
- Fallback/complex queries: API call to GPT-4 or Claude — quality ceiling

### RAG Architectures

**Naive RAG**
- Query → embed → vector search (top-k) → stuff into prompt → generate
- Simple to implement; works for FAQ-style knowledge bases
- Weaknesses: poor for multi-hop questions, retrieval noise degrades answers

**Advanced RAG**
- Query rewriting: rephrase user query for better retrieval ("đơn hàng tôi đâu" → "trạng thái đơn hàng")
- Hybrid search: dense (embedding) + sparse (BM25) with reciprocal rank fusion
- Reranking: cross-encoder scores top-50 → select top-5
- Context compression: extract only relevant sentences from retrieved chunks
- Pipeline: query rewrite → hybrid search → rerank → compress → generate

**Modular RAG**
- Routing: classify query type → route to appropriate retrieval source (FAQ DB, product catalog, order system)
- Adaptive retrieval: decide whether retrieval is even needed (chitchat doesn't need RAG)
- Iterative retrieval: if first retrieval insufficient, reformulate and retrieve again
- Tool-augmented: RAG + API calls (check order status, look up product price)

**Agentic RAG**
- LLM decides when to retrieve, what tools to call, whether to ask clarifying questions
- ReAct pattern: Thought → Action → Observation → repeat
- Most flexible but hardest to control; requires strong guardrails

### LLM Serving Optimization

**vLLM**
- PagedAttention: efficient KV cache management, near-zero memory waste
- Continuous batching: process multiple requests simultaneously, 2-4x throughput vs naive
- Supports AWQ, GPTQ, and GGUF quantization; speculative decoding for faster generation
- Production setup: vLLM server + nginx load balancer + health checks
- Benchmark: Qwen2.5-7B-AWQ on A100 → ~80 tokens/sec per request, ~500 concurrent users

**TGI (Text Generation Inference)**
- HuggingFace's serving solution; good integration with HF model hub
- Flash Attention 2 support; tensor parallelism for multi-GPU
- Watermarking built-in (useful for audit trails)

**Quantization**
- AWQ (4-bit): best quality-to-compression ratio; minimal quality loss on 7B+ models
- GPTQ (4-bit): slightly lower quality than AWQ but more widely supported
- GGUF (llama.cpp): CPU-friendly quantization; useful for edge deployment
- Rule of thumb: 4-bit quantized 14B model ≈ quality of fp16 7B model at similar memory cost

### Embedding Models for Vietnamese

| Model | Dims | Context | Vietnamese Quality | Notes |
|-------|------|---------|-------------------|-------|
| multilingual-e5-large | 1024 | 512 | Good | Solid baseline, well-tested |
| BGE-M3 | 1024 | 8192 | Very Good | Multi-granularity retrieval, best for long docs |
| jina-embeddings-v3 | 1024 | 8192 | Very Good | Task-specific LoRA adapters |
| gte-multilingual-base | 768 | 8192 | Good | Smaller, faster |

- Fine-tuning embeddings on Vietnamese domain data: collect (query, positive_doc, hard_negative_doc) triplets
- Use contrastive learning (InfoNCE loss); 5K-10K triplets typically sufficient for significant improvement
- Always evaluate on a held-out Vietnamese retrieval benchmark before deploying fine-tuned embeddings

### Attention Patterns for Long Conversations

Long conversations (50+ turns) challenge standard attention:
- Full attention: O(n^2) memory — impractical for very long contexts
- Sliding window attention (Mistral-style): attend to recent tokens + initial tokens; good for dialogue
- Conversation-aware truncation: keep system prompt + first turn + last N turns; summarize middle
- For 7B models with 32K context: ~20-30 conversation turns fit comfortably with RAG context
- Practical approach: summarize conversations exceeding 15 turns; store summary as a special "memory" turn
- KV cache optimization: vLLM's PagedAttention handles variable conversation lengths efficiently

### Knowledge Distillation from Large to Small Models

Step-by-step distillation pipeline:
1. Generate teacher responses: run production conversations through GPT-4/Claude (teacher)
2. Filter: remove low-quality responses (use LLM-as-judge to score teacher outputs)
3. Format: create instruction-tuning dataset from filtered (conversation_context, teacher_response) pairs
4. Train student: QLoRA fine-tune Qwen2.5-7B on 50K-100K examples
5. Evaluate: compare student vs teacher on held-out test set using automated metrics + human eval
6. Iterate: collect student failure cases, get teacher responses, add to training set, retrain

Expected quality retention: 85-92% of teacher quality at 10-30x lower inference cost.
Cost analysis: teacher API costs ~$5K for 100K examples; student inference saves ~$3K/month → ROI in 2 months.

### Recommendations for B08

1. Deploy Qwen2.5-7B-AWQ on vLLM as the primary serving stack — best cost-performance for Vietnamese
2. Implement Advanced RAG (hybrid search + reranking) before attempting agentic architectures
3. Use BGE-M3 for embeddings — its multi-granularity retrieval handles Vietnamese well
4. Quantize aggressively (4-bit AWQ) for 7B-14B models; quality loss is negligible for chatbot use cases
5. Build the conversation summarization component early — long conversations will degrade quality without it
6. Plan distillation as a quarterly cycle: collect failures, generate teacher data, retrain student
