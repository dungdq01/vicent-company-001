# DevOps Engineer Notes: Conversational AI & Chatbots (B08)
## By Huy Tran (R-DO) — Date: 2026-03-31

### LLM Serving Infrastructure

**GPU Allocation**
- Qwen2.5-7B-AWQ (4-bit): requires 1x A10G (24GB) or 1x T4 (16GB with offloading)
- Qwen2.5-14B-AWQ: requires 1x A100 40GB or 2x A10G with tensor parallelism
- Qwen2.5-32B-AWQ: requires 1x A100 80GB or 2x A100 40GB
- Embedding model (BGE-M3): runs on CPU or a single T4; much lighter than generative models
- Reranker: similar to embedding; CPU-viable for low throughput, GPU for >100 req/s

**Autoscaling**
- Scale on GPU utilization (target 70%) and request queue length (target <10)
- Kubernetes: use NVIDIA GPU Operator + Karpenter for node provisioning
- Cold start for GPU instances: 2-5 minutes — maintain minimum 1 warm replica during business hours
- Scale-to-zero outside business hours to save cost (if acceptable latency on first request)
- Horizontal Pod Autoscaler with custom metrics from vLLM `/metrics` endpoint

**Infrastructure Options**
- Cloud: AWS (g5.xlarge for A10G, p4d for A100), GCP (a2-highgpu), Azure (NC series)
- Vietnam-based: FPT Cloud or Viettel Cloud for data residency compliance (limited GPU options)
- Hybrid: serve embedding/reranker locally, use cloud API for generative LLM

### Model Versioning & Blue-Green Deployment

- Tag every model artifact: `model-name:v1.2.3-20260331` — include date for quick identification
- Store model artifacts in S3/MinIO with DVC tracking; never store models in Git
- Blue-green deployment for model updates:
  1. Deploy new model version to "green" environment
  2. Run automated evaluation suite against green
  3. If metrics pass: shift 10% traffic → 50% → 100% with monitoring at each step
  4. Keep blue environment warm for 24 hours for quick rollback
- Canary deployment for prompt changes: route 5% traffic to new prompt, compare metrics
- Rollback trigger: if error rate >5% or latency p95 >10s or quality score drops >10%

### Monitoring Chatbot Performance

**Latency Tracking**
- Measure: time-to-first-token (TTFT), tokens-per-second (TPS), total response time
- Targets: TTFT <1s, total response <5s for 95th percentile
- Break down: retrieval latency + LLM inference latency + network overhead
- Alert if p95 latency exceeds 8 seconds

**Token Usage & Cost**
- Log input tokens and output tokens per request; compute cost per conversation
- Dashboard: daily token consumption, cost per channel (Zalo, Web, Messenger), cost per intent
- Budget alerts: warn at 80% of monthly budget, hard-stop at 100% (fall back to template responses)
- Track cost-per-resolved-conversation as the key business metric

**Quality Monitoring**
- Sample 1% of conversations for automated LLM-as-judge scoring
- Track: thumbs-up/down ratio, human escalation rate, conversation completion rate
- Drift detection: monitor intent distribution weekly; alert on >5% shift

### CI/CD for Prompt & Model Updates

**Prompt CI/CD**
- Prompts stored in Git alongside application code
- PR for prompt change triggers: linting, evaluation on test set (200+ cases), quality score comparison
- Automated gate: new prompt must score within 2% of current production prompt on evaluation suite
- Deploy prompt changes independently from model changes — different cadence

**Model CI/CD**
- Pipeline: train → evaluate → package → deploy to staging → automated tests → promote to production
- Use MLflow or Weights & Biases for experiment tracking and model registry
- Automated evaluation: run on standard test set; compare BLEU, semantic similarity, LLM-judge scores
- Human-in-the-loop gate for major model version changes

### Infrastructure Cost Optimization

**Spot/Preemptible Instances**
- Use spot instances for training and batch evaluation (60-70% savings)
- NOT for production serving — interruptions cause user-visible failures
- Exception: spot for overflow capacity with graceful degradation (queue requests, serve when available)

**Caching**
- Semantic cache: embed user query, check if similar query was recently answered (cosine >0.95)
- Exact cache: hash of (system_prompt + context + user_message) → cached response
- Cache hit rate for FAQ-heavy chatbots: 20-40% — significant cost savings
- Redis for cache storage; TTL of 1 hour for dynamic content, 24 hours for static FAQ

**Other Optimizations**
- Batch inference for non-real-time tasks (conversation summarization, quality scoring)
- Use smaller models for simple intents (FAQ → 1.5B model), larger models only for complex queries
- Optimize prompts for fewer tokens: shorter system prompts, compressed context
- Reserved instances for baseline GPU capacity (1-year commitment, 30-40% savings)

### Observability Stack

**LangSmith**
- Trace every LLM call: input, output, latency, token count, cost
- Visualize RAG pipeline: retrieval results, reranking scores, final context
- Run evaluation datasets through the pipeline with automated scoring
- Best for development and debugging; can be expensive at production scale

**Phoenix (Arize)**
- Open-source LLM observability; self-hostable
- Trace spans for each pipeline component; embedding drift detection
- Good for production monitoring without vendor lock-in

**Custom Stack**
- OpenTelemetry for distributed tracing across API → queue → LLM → response
- Prometheus + Grafana for metrics dashboards (latency, throughput, GPU utilization, cost)
- ELK or Loki for log aggregation; structured logging with conversation_id as correlation key
- Alert channels: PagerDuty/Opsgenie for critical (downtime), Slack for warning (latency spike)

### Recommendations for B08

1. Start with a single A10G GPU running vLLM + Qwen2.5-7B-AWQ — handles ~200 concurrent users
2. Implement semantic caching early — FAQ-heavy chatbots benefit enormously
3. Separate CI/CD for prompts and models — prompt changes are frequent and should ship fast
4. Use Phoenix for production observability and LangSmith for development — balance cost and capability
5. Set up cost tracking per conversation from day one — executives will ask about unit economics
6. Scale-to-zero overnight (11PM-6AM Vietnam time) unless serving international users — saves 30% GPU cost
