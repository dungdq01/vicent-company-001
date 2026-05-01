# Deep Learning Engineer Notes: Agentic AI (B10)
## By Duc Le (R-DLE) — Date: 2026-03-31

### 1. Overview

Agentic AI imposes unique demands on model architecture and serving infrastructure. Unlike single-turn inference, agents require sustained multi-turn reasoning, efficient long-context handling, reliable structured output generation, and low-latency serving for interactive tool-calling loops. The Deep Learning Engineer must select, optimize, and serve models that meet these requirements.

### 2. LLM Selection for Agent Tasks

**Reasoning Capability vs Cost Matrix:**

| Model Tier | Examples | Agent Suitability | Cost (per 1M tokens) | Best For |
|------------|---------|-------------------|----------------------|----------|
| Frontier reasoning | Claude Opus, o3, Gemini 2.5 Pro | Excellent | $15-75 | Complex multi-step, planning |
| Strong general | Claude Sonnet, GPT-4o, Gemini 2.0 Flash | Good | $3-15 | Standard tool-calling agents |
| Fast/cheap | Claude Haiku, GPT-4o-mini | Adequate | $0.25-1 | Simple routing, classification steps |
| Open-source large | Llama 3.3 70B, Qwen 2.5 72B, DeepSeek-V3 | Good with fine-tuning | Self-hosted | Privacy-sensitive, high-volume |
| Open-source small | Llama 3.2 8B, Qwen 2.5 7B | Limited | Self-hosted | Sub-tasks, tool parameter extraction |

**Selection Criteria for Agents:**
- Instruction following fidelity (does it respect constraints?).
- Tool calling accuracy (correct function name, valid parameters).
- Multi-step coherence (does it maintain plan across 20+ turns?).
- Recovery from errors (can it adapt when a tool fails?).
- Context window size (128K minimum for complex agents).

### 3. Attention Mechanisms for Long-Context Agents

- Standard quadratic attention is the bottleneck for long agent sessions.
- Solutions deployed in modern agent-capable models:
  - **Grouped Query Attention (GQA)**: Reduces KV-cache memory by sharing KV heads. Used in Llama 3, Mistral.
  - **Sliding Window Attention**: Limits attention to recent tokens plus selected anchors. Used in Mistral.
  - **Ring Attention**: Distributes long sequences across devices for context windows beyond 1M tokens.
  - **Sparse Attention**: Attend to a subset of tokens based on learned or fixed patterns.
- For agents specifically: the attention pattern should prioritize the system prompt, current sub-task, and most recent tool results.

### 4. KV-Cache Management for Multi-Turn

- Multi-turn agent conversations accumulate large KV-caches that must persist between turns.
- Strategies:
  - **Prefix caching**: Cache the KV states for the system prompt and tool descriptions (shared across all turns). Saves 20-40% compute on subsequent turns.
  - **Paged attention (vLLM)**: Manage KV-cache like virtual memory pages. Enables efficient memory sharing and prevents fragmentation.
  - **KV-cache quantization**: Compress cached states to FP8 or INT4. Reduces memory 2-4x with minimal quality loss.
  - **KV-cache eviction**: For very long sessions, evict oldest turns while retaining system prompt and recent context.
- Size estimation: a 70B model with 128K context uses ~40 GB of KV-cache per request. Plan GPU memory accordingly.

### 5. Model Serving for Tool-Calling Workloads

- Agent workloads have a unique pattern: short bursts of generation (tool calls, ~50-200 tokens), followed by waiting for tool execution, then more generation.
- This means:
  - **High request frequency, low tokens per request** compared to chatbot workloads.
  - **Long-lived sessions** that tie up KV-cache memory.
  - **Variable latency tolerance**: tool call generation needs to be fast; final answer can be slower.
- Serving stack recommendations:
  - **vLLM**: Best for high-throughput self-hosted serving with paged attention.
  - **TensorRT-LLM**: Best latency on NVIDIA GPUs.
  - **SGLang**: Optimized for multi-turn and structured output workloads.
- Use continuous batching to handle the bursty nature of agent requests.

### 6. Speculative Decoding for Agent Speed

- Speculative decoding uses a small draft model to propose tokens, verified by the large model in parallel.
- Particularly effective for agent tool calls because:
  - Tool call outputs follow predictable patterns (JSON structure, known function names).
  - Draft acceptance rate is high for structured output (70-90% vs 50-70% for freeform text).
- Implementation: pair a 7B draft model with a 70B target model. Expected speedup: 2-3x for tool call generation.
- Alternative: prompt lookup decoding — use n-gram matching from the prompt to draft tokens. Free speedup for repetitive agent patterns.

### 7. Mixture-of-Experts for Diverse Agent Skills

- MoE models (e.g., Mixtral, DeepSeek-V3, Grok) activate only a subset of parameters per token.
- Benefits for agents:
  - Different experts can specialize in different tool types (code, search, math, language).
  - Lower inference cost per token compared to dense models of similar total parameter count.
  - DeepSeek-V3 (671B total, 37B active): strong agent performance at moderate cost.
- Challenges:
  - Memory footprint is still large (all experts must be loaded).
  - Expert routing can be unpredictable — no guarantee the "code expert" activates for code tasks.
- Fine-tuning MoE for agents: can steer expert specialization toward tool-specific skills.

### 8. Quantization for Agent Deployment

- Quantization reduces model size and speeds inference, critical for self-hosted agent systems.
- Recommended approaches:
  - **GPTQ/AWQ (4-bit)**: Standard for production deployment. 2-5% quality loss on agent tasks.
  - **FP8**: Minimal quality loss, supported natively on H100/H200. Best balance.
  - **GGUF (llama.cpp)**: For CPU/edge deployment of smaller agent models.
- Always evaluate quantized models on agent-specific benchmarks, not just perplexity.

### 9. Hardware Planning

- Agent serving is memory-bound, not compute-bound (due to KV-cache and multi-turn).
- Recommended GPUs:
  - **H100 80GB**: Standard for production. 1 GPU serves a 70B model in FP8.
  - **A100 80GB**: Budget option. Needs 2 GPUs for 70B in FP16.
  - **L40S 48GB**: Cost-effective for smaller models (7B-13B).
- Estimate: each concurrent agent session on a 70B model requires ~0.5-1 GB of KV-cache memory.

### Recommendations for B10

1. **Use API-based frontier models for complex agents** — self-hosting frontier-class reasoning is not cost-effective at low volume.
2. **Self-host for high-volume simple agents** — tool-calling with 7B-70B models is viable and cost-effective at scale.
3. **Deploy vLLM or SGLang** for self-hosted serving — they handle multi-turn agent patterns best.
4. **Implement prefix caching immediately** — it is the single highest-ROI optimization for agent serving.
5. **Plan for KV-cache memory** — it will be the primary constraint, not compute.
6. **Evaluate speculative decoding** for tool-call-heavy agents — structured output benefits most from it.
