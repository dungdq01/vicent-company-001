# DevOps Engineer Notes: Agentic AI (B10)
## By Tuan Hoang (R-DO) — Date: 2026-03-31

### 1. Overview

Deploying agentic AI systems requires DevOps practices adapted for long-running, stateful, GPU-dependent workloads that execute arbitrary tool calls. Traditional web application deployment patterns are insufficient. The DevOps Engineer must build infrastructure for sandboxed execution, GPU management, deep observability, cost control, and reliable scaling.

### 2. Containerized Agent Execution and Sandboxing

- Every agent run should execute in an isolated container to prevent cross-contamination and contain damage from rogue agents.
- Use gVisor or Firecracker for lightweight sandboxing with strong isolation guarantees.
- Container configuration per agent type:
  - **Code execution agents**: Minimal base image, no network access by default, resource limits (1 CPU, 512MB RAM, 60s timeout).
  - **Web browsing agents**: Headless browser image (Playwright), restricted network access via proxy.
  - **Data analysis agents**: Python runtime with approved libraries, read-only database access.
- Pre-warm container pools for low-latency agent startup (cold start can add 5-15 seconds).
- Destroy containers after run completion; never reuse across runs.

### 3. GPU Allocation for LLM Serving

- Self-hosted LLM serving is the most resource-intensive component.
- GPU allocation strategy:
  - **Dedicated GPU pools** for production agent workloads (guaranteed capacity).
  - **Spot/preemptible instances** for development, testing, and batch evaluation.
  - **Auto-scaling** based on queue depth (pending agent LLM requests), not CPU utilization.
- Use NVIDIA MPS or MIG (Multi-Instance GPU) to share GPUs across smaller models.
- Monitor GPU utilization: agent workloads often have low utilization (30-50%) due to waiting for tool execution. Batch requests across agents to improve utilization.
- Cost comparison: H100 on-demand ~$3/hr (cloud) vs API calls at $3-15/M tokens. Break-even depends on volume.

### 4. Observability

**Tracing with OpenTelemetry:**
- Instrument the full agent execution path: user request -> orchestrator -> LLM call -> tool execution -> response.
- Use OpenTelemetry spans with agent-specific attributes: run_id, step_number, tool_name, model_name, token_count.
- Export traces to Jaeger, Grafana Tempo, or Datadog.

**LangSmith / LangFuse Integration:**
- Use LLM-specific observability platforms for prompt-level debugging.
- Track: prompt versions, token usage, latency per LLM call, tool call success rates.
- Enable trace comparison for A/B testing of prompt changes.

**Metrics and Dashboards:**
- Key metrics: agent success rate, avg steps per task, avg cost per task, p95 latency, tool failure rate, LLM error rate.
- Alerting: alert on agent success rate drop > 10%, cost per task spike > 2x, tool failure rate > 5%.
- Build Grafana dashboards for real-time monitoring.

**Logging:**
- Structured JSON logging for all components.
- Correlate logs across services using trace_id.
- Log retention: 30 days hot (Elasticsearch), 1 year cold (S3).

### 5. Cost Monitoring Per Agent Run

- Attach cost tracking to every agent run:
  - LLM costs: input tokens x input price + output tokens x output price, per model.
  - Tool execution costs: compute time, external API calls.
  - Infrastructure costs: allocated fraction of GPU/CPU time.
- Real-time cost accumulation: agents should be killed when they exceed budget.
- Daily cost reports by: agent type, tenant, task category.
- Implement cost anomaly detection: flag runs that cost 5x more than the historical average.

### 6. CI/CD for Agent Prompts and Tools

- Agent prompts and tool configurations are code and must be deployed through CI/CD.
- Pipeline stages:
  1. **Lint**: Validate prompt templates, tool schemas (JSON Schema validation).
  2. **Unit test**: Test individual tools in isolation with mocked inputs.
  3. **Integration test**: Run agent end-to-end on a benchmark suite.
  4. **Canary deploy**: Route 5% of traffic to the new version, monitor metrics.
  5. **Full rollout**: Promote if canary metrics are healthy.
- Support instant rollback: revert to previous prompt/tool version within seconds.
- Version all prompts, tool configs, and model selections in Git.

### 7. Scaling Agent Workers

- Agent workers are the processes that execute agent loops.
- Scaling dimensions:
  - **Horizontal**: Add more worker pods based on queue depth.
  - **Vertical**: Increase worker memory for agents with large context.
- Use Kubernetes HPA with custom metrics (pending_runs, queue_wait_time).
- Separate worker pools by agent type: lightweight agents on small instances, heavy agents on GPU-attached instances.
- Implement graceful shutdown: workers must checkpoint before terminating.

### 8. Disaster Recovery for Long-Running Agents

- Agents running for 30-60 minutes represent significant invested computation.
- DR requirements:
  - Checkpoint agent state to durable storage every N steps.
  - Resume from checkpoint on worker failure (handled by orchestrator like Temporal).
  - Multi-AZ deployment for checkpoint storage.
  - Idempotent tool execution: retrying a tool call after crash must not cause duplicate side effects.
- Test recovery scenarios regularly: kill workers mid-run and verify successful resumption.

### 9. Infrastructure as Code

- Use Terraform/Pulumi for all infrastructure.
- Key resources: Kubernetes cluster, GPU node pools, Redis, PostgreSQL, object storage, LLM API keys in Vault.
- Environment parity: dev, staging, production should differ only in scale, not architecture.

### Recommendations for B10

1. **Set up OpenTelemetry tracing on day one** — debugging agents without traces is nearly impossible.
2. **Implement per-run cost tracking early** — agent costs are unpredictable and can spike without warning.
3. **Use pre-warmed container pools** for tool execution — cold starts destroy agent UX.
4. **Build CI/CD for prompts** — treat prompt changes with the same rigor as code changes.
5. **Start with API-based LLM serving** and move to self-hosted only when volume justifies GPU investment.
6. **Deploy Temporal or equivalent** for durable agent execution — it solves checkpointing and recovery out of the box.
