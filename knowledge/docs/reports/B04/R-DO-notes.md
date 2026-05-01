# DevOps/MLOps Notes: B04 NLP
## By R-DO — Date: 2026-03-31

---

### 1. Infrastructure for LLM Workloads

**GPU selection guide:**

| GPU | VRAM | Best Use Case | Approx. Cost |
|---|---|---|---|
| H100 SXM5 80GB | 80GB | Training 70B+ models, max throughput serving | $25,000–$35,000 |
| A100 40/80GB | 40/80GB | Production serving 13B–70B, fine-tuning | $10,000–$15,000 |
| RTX 4090 24GB | 24GB | Dev/test, serving 7B–13B quantized, small batch | $1,600–$2,000 |
| RTX 3090 24GB | 24GB | Budget serving, legacy setups | $700–$1,000 used |

**Rule of thumb:** A 7B model in FP16 requires ~14GB VRAM. A 70B model in FP16 requires ~140GB — minimum 2x A100 80GB with tensor parallelism. Quantized to INT4 (AWQ/GPTQ), a 70B model fits in ~40GB VRAM.

**CPU inference with llama.cpp:** For on-premise deployments without GPU, `llama.cpp` with GGUF-quantized models runs on CPU. Throughput is 10-30 tok/s on a modern 32-core server (AMD EPYC / Intel Xeon). Acceptable for low-concurrency internal tools, not for user-facing products.

**Cloud vs on-premise:** Cloud (AWS/GCP Singapore) offers flexibility and no capex but running an A100 instance 24/7 costs $2,000-$3,500/month. On-premise with 2x RTX 4090 costs ~$4,000 capex and pays off in 3-4 months for sustained workloads. Hybrid is common: cloud for burst capacity, on-premise for baseline.

---

### 2. LLM Deployment Patterns

**Single GPU:** Simplest deployment. One model, one GPU. Suitable for models that fit within VRAM (7B FP16 on 24GB, 13B in INT4 on 24GB). vLLM single-GPU mode handles concurrent requests via PagedAttention.

**Tensor parallelism (multi-GPU, single node):** Split model layers across multiple GPUs within one machine. vLLM supports `--tensor-parallel-size 2|4|8`. Requires NVLink for low-latency inter-GPU communication — PCIe multi-GPU setups suffer significant throughput degradation. Use for 70B models across 4x A100 or 2x H100.

**Pipeline parallelism (multi-node):** Split model stages across nodes. Higher latency than tensor parallelism due to network overhead. Use only for models too large for single-node (e.g., 405B parameter models). Requires InfiniBand or 400Gbps networking for acceptable throughput.

**Quantization options:**

| Format | Size Reduction | Quality Loss | Tooling |
|---|---|---|---|
| FP16 | Baseline | None | Native |
| GPTQ INT8 | ~50% | Minimal | `auto-gptq` |
| AWQ INT4 | ~75% | Low | `autoawq` |
| GGUF Q4_K_M | ~75% | Low-Medium | `llama.cpp` |
| GGUF Q8_0 | ~50% | Minimal | `llama.cpp` |

AWQ INT4 is the recommended default for production GPU deployments — best quality-per-VRAM tradeoff. GGUF Q4_K_M for CPU-only deployments.

---

### 3. Containerization for LLM

**vLLM Docker image:** Use the official `vllm/vllm-openai` image as base. Current images are ~15GB due to PyTorch + CUDA libraries. Pin the CUDA version explicitly — CUDA 12.1 and 12.4 have different driver requirements.

**CUDA dependencies:** The CUDA version in the container must be compatible with the host driver. CUDA 12.x containers require driver >= 525 on the host. Use `nvidia-smi` to check host driver version before building. Document the minimum driver version in your deployment runbook.

**Model weight caching strategies:**
- Mount a persistent volume (NFS or EBS) to `/models` inside the container. Never bake model weights into the Docker image — a 70B model weight file is 40-140GB.
- Use `huggingface-cli download` in an init container to pre-pull weights to the shared volume before the main container starts.
- For Kubernetes, use a PersistentVolumeClaim with `ReadOnlyMany` access mode for multi-pod weight sharing.

**Image size management:** Keep the application layer (your API code) separate from the base CUDA/PyTorch layer. Use multi-stage builds. A typical deployment image structure: `vllm-base` (15GB, rarely rebuilt) + `your-api-layer` (50-200MB, rebuilt on code changes). This dramatically reduces CI build times.

---

### 4. Kubernetes for LLM Serving

**GPU node pools:** Create dedicated node pools for LLM workloads with GPU-enabled nodes. Taint GPU nodes with `nvidia.com/gpu=present:NoSchedule` to prevent non-GPU workloads from landing there. Use node affinity rules in LLM deployment manifests to target these pools.

**GPU resource requests:**
```yaml
resources:
  limits:
    nvidia.com/gpu: 2
  requests:
    nvidia.com/gpu: 2
```
Always set requests equal to limits for GPUs — Kubernetes does not support fractional GPU allocation natively. For fractional GPU sharing, use NVIDIA MPS or Time-Slicing (configure via `nvidia-device-plugin` ConfigMap).

**Horizontal scaling limits:** LLM pods are not stateless in the traditional sense — each pod holds the full model in GPU VRAM. Scaling out means provisioning additional full GPU nodes, not lightweight container replicas. Set a realistic `maxReplicas` in your HPA based on available GPU capacity. Use KEDA for custom scaling metrics (e.g., request queue depth from Redis).

**GPU memory isolation:** Use NVIDIA MPS (Multi-Process Service) for concurrent process sharing on a single GPU. For complete isolation between tenants, use separate physical GPUs per tenant. Never rely on process-level isolation alone for sensitive multi-tenant workloads.

---

### 5. CI/CD for LLM Applications

**Prompt regression testing:** For every prompt change, run a regression test suite: a fixed set of test inputs with expected output characteristics (not exact match — use LLM-as-judge scoring). Gate deployment on a minimum quality score. Store test results in a prompt evaluation database (Langfuse works well here).

**RAG pipeline testing:** Test the full pipeline end-to-end with a curated evaluation dataset of `(query, expected_answer, expected_source_document)` triples. Measure retrieval recall (did the right chunk get retrieved?) separately from generation quality (was the answer correct?). Use RAGAS library for automated RAG evaluation metrics.

**Model card validation:** Before deploying a new model version, validate: VRAM fit check, latency benchmark (P95 < SLA threshold), tokenizer compatibility test, safety evaluation on a red-team test set.

**Canary deployment for LLM updates:** Route 5% of traffic to the new model version. Monitor error rate, latency P95, and user feedback scores for 24-48 hours. Automated rollback if error rate increases by more than 1% or latency P95 exceeds SLA by 20%. Use Argo Rollouts for traffic splitting with custom analysis metrics.

---

### 6. Monitoring LLMs in Production

**Core metrics to track:**
- **Token usage:** prompt tokens, completion tokens, total tokens per request. Aggregate by `org_id`, `model`, `endpoint`. Feed into cost calculation.
- **Latency:** P50, P95, P99 time-to-first-token (TTFT) and total latency. TTFT is the user-perceived metric for streaming. Target: TTFT < 500ms for P95.
- **Cost per request:** calculate in real time using token counts × model pricing. Alert when daily cost exceeds budget threshold.
- **Hallucination rate:** use LLM-as-judge evaluation on a sampled 1-3% of production traffic. Score factual consistency against retrieved context.
- **User feedback loop:** implement thumbs up/down on responses. Log with the full request/response pair. Use as signal for fine-tuning data selection and prompt improvement.

**Tooling:** Prometheus + Grafana for infrastructure metrics. Langfuse for LLM-specific traces (prompt versions, latency per stage, token counts). OpenTelemetry for distributed tracing across the RAG pipeline.

---

### 7. Cost Optimization for LLM

**Quantization savings:**

| Precision | Model Size (70B) | VRAM Required | Throughput | Quality |
|---|---|---|---|---|
| FP16 | ~140GB | 2x A100 80GB | Baseline | Best |
| INT8 (GPTQ) | ~70GB | 1x A100 80GB | -5–10% | Near-identical |
| INT4 (AWQ) | ~35GB | 1x A100 40GB | -10–15% | Good |
| INT4 GGUF (CPU) | ~35GB | 128GB RAM | -80–90% | Good |

Switching from FP16 to INT4 AWQ on a 70B model cuts GPU hardware cost by ~50% (one A100 40GB vs two A100 80GB).

**Batch inference:** Accumulate requests in a queue and process in batches during off-peak hours for non-interactive tasks (document summarization, bulk classification). Batch size 16-32 improves GPU utilization from 30-40% to 70-85%.

**Prompt caching:** Cache the KV cache for long, repeated system prompts (vLLM prefix caching). If your system prompt is 2,000 tokens and it repeats across all requests, prefix caching eliminates re-computation — measurable throughput gain of 20-40% for prompt-heavy workloads.

**Smaller model routing:** Use a query complexity classifier to route simple requests (factual lookup, short summarization) to a 7B or 8B model at 1/5 the compute cost. Reserve 70B models for complex reasoning and generation tasks. A well-tuned router can send 40-60% of traffic to the small model with no perceptible quality difference for those tasks.

---

### 8. Vietnamese Deployment Context

**Cloud options from Vietnam:**
- **AWS ap-southeast-1 (Singapore):** Best ecosystem, p4d.24xlarge (8x A100) available, ~15-25ms latency from Hanoi/HCMC. Most enterprises use this.
- **GCP asia-southeast1 (Singapore):** A100 VMs via `a2-highgpu` series. Strong data engineering stack (BigQuery, Dataflow) for pipeline work.
- **Azure Southeast Asia (Singapore):** Available, but GPU VM availability can be limited compared to AWS/GCP.

**Viettel IDC GPU:** Viettel Cloud offers GPU instances in Vietnam (domestic latency ~1-5ms, no cross-border data transfer). Suitable for sensitive government/enterprise data that cannot leave Vietnam. GPU availability is more limited than hyperscalers — plan capacity well in advance.

**FPT Cloud / VNPT iCloud:** Domestic options, limited GPU inventory, better for CPU workloads and storage.

**llama.cpp on CPU for on-premise without GPU:** For Vietnamese enterprises with no GPU budget, deploy `llama.cpp` with a quantized 7B or 13B Vietnamese-capable model (Vistral-7B-Chat-GGUF or Llama3-8B-Instruct GGUF). A dual-socket 32-core server (AMD EPYC 7543, ~$3,000 used) achieves 15-25 tok/s — adequate for internal tools serving 5-15 concurrent users. This is a viable entry point before GPU investment is justified.

**Data residency consideration:** Vietnamese enterprises in regulated sectors (banking, healthcare, government) must keep data on-premise or in Vietnamese data centers per Cybersecurity Law 2018 and Decree 13/2023. Design the deployment architecture to support both cloud and on-premise targets from day one — use the same Docker images, just different infrastructure backends.
