# DevOps Engineer Notes: Generative AI (B09)
## By InfraForge (R-DO) — Date: 2026-03-31

### GPU Infrastructure

GPU provisioning is the foundation of GenAI deployment:

- **GPU selection**: A100 80GB — the workhorse for most inference and fine-tuning. H100 80GB — 2-3x faster inference, required for large-scale training. L40S — cost-effective for inference-only workloads. T4 — budget option for small models (< 7B quantized).
- **Cloud providers**: AWS (p4d/p5 instances), GCP (a2/a3 instances), Azure (ND series). For Vietnam-proximate: AWS Singapore, GCP Taiwan, or Vietnamese cloud (Viettel Cloud, FPT Cloud with limited GPU options).
- **Spot/preemptible instances**: 60-70% cost savings. Suitable for fine-tuning and batch inference. Not suitable for real-time serving. Implement checkpointing and graceful interruption handling.
- **GPU allocation strategy**: Right-size based on model: 7B quantized = 1x T4/L4, 7B fp16 = 1x A100, 70B quantized = 1x A100 80GB, 70B fp16 = 2x A100 80GB. Over-provisioning GPUs is the most expensive mistake in GenAI ops.
- **Multi-GPU serving**: Tensor parallelism across GPUs within a node for large models. NVLink required for efficient inter-GPU communication.
- **On-prem considerations**: For Vietnam data residency, consider on-prem GPU servers. NVIDIA DGX or custom builds with A100/H100. Factor in power (2-5 kW per GPU), cooling, and 3-year amortization.

### Model Serving Frameworks

Specialized serving frameworks are essential for production GenAI:

- **vLLM**: Best open-source LLM serving engine. PagedAttention, continuous batching, tensor parallelism, speculative decoding. OpenAI-compatible API. Supports most popular models. Recommended as default choice.
- **TGI (Text Generation Inference)**: HuggingFace's serving solution. Solid performance, good HF ecosystem integration. Flash-decoding, quantization support. Slightly behind vLLM on raw throughput.
- **Triton Inference Server**: NVIDIA's multi-framework server. Supports LLMs via TensorRT-LLM backend. Best for mixed workloads (LLM + image model + embeddings on same infrastructure). More complex to configure.
- **TensorRT-LLM**: NVIDIA's optimized LLM runtime. Best raw performance on NVIDIA hardware. Requires model conversion to TRT format. Less flexible than vLLM but faster for supported models.
- **Ollama**: Simple local model serving. Good for development and small deployments. Not suitable for production multi-user serving.
- **Image serving**: ComfyUI (node-based, flexible), A1111 API (established ecosystem), or custom pipeline with diffusers library + FastAPI.

### Autoscaling for Bursty Workloads

GenAI workloads are inherently bursty — usage spikes during business hours and campaigns:

- **Scaling metrics**: GPU utilization (target 70-80%), request queue depth, p99 latency, tokens-per-second throughput. Do not scale on CPU — it is a misleading metric for GPU workloads.
- **Kubernetes + GPU**: Use NVIDIA GPU Operator for K8s GPU management. Node pools with GPU taints. Pod scheduling with GPU resource requests. Karpenter or Cluster Autoscaler for node provisioning.
- **Scale-up latency**: GPU node provisioning takes 2-10 minutes on cloud. Pre-warm a minimum pool. Use predictive scaling based on historical patterns (e.g., scale up at 8 AM, down at 10 PM).
- **Scale-to-zero**: For dev/staging environments, scale GPU pods to zero during off-hours. Saves 60-70% on non-production GPU costs. Accept cold-start latency (model loading: 30-120 seconds for large models).
- **Request queuing**: Buffer requests during scale-up. Return estimated wait time to users. Priority queue ensures paying users get served first during capacity constraints.
- **Serverless GPU**: Services like Modal, RunPod Serverless, Banana. Pay-per-second GPU billing. Good for variable workloads but higher per-second cost. ~10-30s cold start.

### Model Versioning and A/B Testing

Managing multiple model versions in production:

- **Model registry**: Use MLflow Model Registry, HuggingFace Hub (private), or S3 with metadata database. Track: model name, version, quantization, base model, fine-tune dataset, evaluation metrics.
- **Deployment strategies**: Blue-green (swap DNS between old and new model), canary (route 5-10% traffic to new model), shadow (run new model in parallel, compare but don't serve).
- **A/B testing infrastructure**: Route by user_id hash for consistent assignment. Track quality metrics per variant: user satisfaction rating, task completion, regeneration rate. Use Istio or Envoy for traffic splitting at the service mesh level.
- **Rollback**: Keep previous model version loaded and warm. Instant rollback via traffic routing change. Automated rollback on quality metric degradation.
- **Model storage**: Large model files (10-140 GB). Use shared NFS/EFS mount or object storage with local SSD caching. Model loading from NFS: ~2-5 min for 70B. From local SSD: ~30-60s.

### Cost Optimization

GPU compute is 70-90% of GenAI operational cost:

- **Quantization**: Serve 4-bit quantized models for 75% memory reduction and 2x throughput. Quality loss is minimal for models >= 7B.
- **KV-cache optimization**: PagedAttention (vLLM) reduces memory waste. Prefix caching for repeated system prompts. Reduces per-request memory by 20-40%.
- **Request batching**: Continuous batching improves throughput 3-5x vs sequential. Maximize batch size within GPU memory constraints.
- **Caching**: Cache responses for identical prompts (semantic cache with embedding similarity). Cache hit rates of 10-30% are common for production workloads. Use Redis with TTL.
- **Spot instances for batch**: Run non-real-time workloads (bulk generation, evaluation, fine-tuning) on spot instances.
- **Right-sizing**: Monitor actual GPU utilization. A model serving at 30% GPU utilization should be consolidated onto fewer, busier instances.
- **Cost benchmarks**: Self-hosted 7B model on A100: ~$0.50-1.00/hour, serving ~500-1000 requests/hour. API equivalent cost: $5-20/hour for same volume.

### Monitoring

GenAI-specific observability:

- **Key metrics**: Tokens per second (throughput), time-to-first-token (TTFT), inter-token latency, end-to-end latency, GPU utilization, GPU memory utilization, KV-cache utilization, request queue depth.
- **Cost metrics**: Cost per 1K tokens, cost per generation, daily/monthly spend by model, spend by user/tenant.
- **Quality metrics**: Average output length, regeneration rate (user clicked "regenerate"), content filter trigger rate, error rate by model.
- **Stack**: Prometheus + Grafana for metrics. vLLM and TGI expose Prometheus endpoints natively. Custom dashboards for token economics.
- **Alerting**: Alert on: TTFT > 5s, GPU utilization > 90% sustained, error rate > 5%, daily cost exceeding budget by 20%.
- **Logging**: Log request/response metadata (not full content for privacy). Sample 1-5% of full request/response for quality monitoring.

### Multi-Region Deployment

For Vietnamese market with global reach:

- **Primary region**: Singapore (AWS ap-southeast-1, GCP asia-southeast1) for lowest latency to Vietnam (~30ms).
- **Model replication**: Deploy same model version across regions. Use model registry for consistency. Sync via CI/CD pipeline, not manual deployment.
- **Data residency**: Vietnamese user data may need to remain in-region. Deploy MinIO/S3 in Vietnam-based infrastructure for generated assets. Inference can happen in Singapore with results stored locally.
- **CDN**: Use Cloudflare or CloudFront for generated asset delivery. Edge caching for frequently accessed images.
- **Failover**: Active-passive between regions. Health checks on model serving endpoints. Automatic DNS failover (Route53 health checks, Cloudflare load balancing).

### Recommendations for B09

1. Use vLLM as the default LLM serving framework — best throughput, active development, OpenAI-compatible API.
2. Implement autoscaling based on request queue depth and GPU utilization, not CPU metrics.
3. Quantize all production models to 4-bit — the cost savings are substantial with minimal quality impact.
4. Deploy to AWS/GCP Singapore for best latency to Vietnam while having access to GPU instances.
5. Implement semantic caching from day one — even 10% cache hit rate meaningfully reduces costs.
6. Monitor time-to-first-token as the primary latency metric — it determines perceived responsiveness.
7. Budget 30% above estimated compute costs for traffic spikes and experimentation.
