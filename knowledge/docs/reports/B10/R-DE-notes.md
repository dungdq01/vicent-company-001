# Data Engineer Notes: Agentic AI (B10)
## By Minh Tran (R-DE) — Date: 2026-03-31

### 1. Overview

Agentic AI systems generate massive, heterogeneous data streams that differ fundamentally from traditional ML pipelines. Every agent run produces conversation logs, tool call traces, intermediate reasoning steps, generated artifacts, and final outputs. The Data Engineer must build infrastructure that captures, stores, and serves this data for evaluation, debugging, replay, and continuous improvement.

### 2. Conversation and Action Logging

- Every agent turn must be logged with: timestamp, role (user/agent/tool), content, token count, latency, and run ID.
- Action logs must include: tool name, input parameters, raw output, success/failure status, and execution duration.
- Use append-only event stores (e.g., Apache Kafka, AWS Kinesis) for real-time ingestion.
- Schema design: normalize by `run_id > step_id > action_id` hierarchy.
- Retention policy: keep raw logs 90 days, aggregated metrics indefinitely.

### 3. Tool Call Tracing

- Implement OpenTelemetry-compatible spans for each tool invocation within an agent run.
- Trace parent-child relationships: agent decision -> tool call -> sub-tool calls.
- Store trace data in Jaeger or Tempo for visualization; export to columnar format (Parquet) for batch analysis.
- Critical fields: trace_id, span_id, parent_span_id, tool_name, input_hash, output_hash, error_type.

### 4. Agent Memory Storage

**Vector Database (Semantic Memory):**
- Use Qdrant, Weaviate, or Pinecone for storing agent long-term memory embeddings.
- Index by agent_id and session_id; support filtered similarity search.
- Embedding model: use the same model the agent uses for consistency.
- Implement TTL-based eviction and relevance decay for stale memories.

**Relational Database (Structured State):**
- PostgreSQL for agent configurations, user profiles, permission records, and task metadata.
- Store checkpoint snapshots as JSONB columns with version tracking.
- Foreign keys linking runs to users, tools, and cost records.

### 5. Data Pipelines for Agent Evaluation

- Build daily ETL pipelines that extract agent runs, compute success rates, average step counts, cost per task, and tool failure rates.
- Use dbt or Apache Airflow for orchestration.
- Materialized views for common queries: "success rate by agent type last 7 days," "most expensive runs," "most common failure modes."
- Feed evaluation datasets into a centralized evaluation store for ML Engineers to consume.

### 6. Synthetic Data for Agent Training

- Generate synthetic tool-call trajectories by replaying successful runs with parameter variations.
- Use LLM-based data augmentation: paraphrase user instructions, vary tool outputs.
- Build a curated dataset of (instruction, trajectory, outcome) triples for fine-tuning.
- Ensure diversity: cover edge cases, error recovery paths, multi-tool chains.
- Store synthetic data separately with lineage tracking back to source runs.

### 7. Managing Agent Artifacts

- Agents produce files (reports, code, images). Store in object storage (S3/MinIO) keyed by run_id.
- Maintain a metadata catalog: artifact_id, type, size, creating_agent, creating_step, checksum.
- Implement garbage collection for orphaned artifacts from failed runs.
- Version artifacts when agents iterate on outputs (e.g., code revision 1, 2, 3).

### 8. Data Quality and Governance

- Schema validation on all ingested events using JSON Schema or Avro.
- Monitor for data drift: unusual token counts, unexpected tool names, schema violations.
- PII detection pipeline: scan agent outputs for personal data before long-term storage.
- Data lineage tracking from raw logs through transformations to evaluation metrics.

### 9. Scale Considerations

- Agent systems can generate 10-100x more data than equivalent chatbot systems due to multi-step execution.
- Partition by date and agent_type for query performance.
- Use columnar storage (Parquet on S3) for analytical queries; row storage (Postgres) for operational queries.
- Budget for storage costs: a single complex agent run can generate 50-200 KB of trace data.

### 10. Vietnamese Market Considerations

- Ensure UTF-8 throughout all pipelines for Vietnamese text.
- Vietnamese tokenization affects token count logging — track both token count and character count.
- Comply with Vietnam's data localization requirements (Decree 13/2023) for data residency.

### Recommendations for B10

1. **Start with logging infrastructure first** — you cannot evaluate or improve agents without comprehensive run data.
2. **Adopt OpenTelemetry early** — standardized tracing will pay dividends as the agent system grows.
3. **Build the evaluation data pipeline in Week 1** — ML Engineers and QA Engineers depend on it.
4. **Use a hybrid storage strategy**: vector DB for semantic memory, Postgres for structured state, object storage for artifacts.
5. **Design schemas for multi-agent**: even if starting with single-agent, include agent_id in all schemas now.
6. **Implement cost tracking per run** — attach LLM token costs and tool execution costs to every run record.
