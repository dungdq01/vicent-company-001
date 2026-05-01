# Backend Engineer Notes: Anomaly Detection & Monitoring (B07)
## By API Architect (R-BE) — Date: 2026-03-31

### 1. Real-Time Scoring Endpoints

**POST /api/v1/anomaly/score**
- Accepts a single event or entity feature vector
- Returns anomaly score, threshold comparison, contributing features
- Latency target: p95 < 50ms, p99 < 100ms
- Payload example:
```json
{
  "entity_id": "txn_12345",
  "features": {"amount": 5000, "hour": 3, "country": "VN", "merchant_category": "electronics"},
  "context": {"session_id": "sess_abc", "ip": "203.0.113.5"}
}
```
- Response:
```json
{
  "entity_id": "txn_12345",
  "anomaly_score": 0.87,
  "is_anomalous": true,
  "threshold": 0.75,
  "top_contributors": [
    {"feature": "amount", "contribution": 0.42},
    {"feature": "hour", "contribution": 0.31}
  ],
  "model_version": "v2.3.1",
  "scored_at": "2026-03-31T14:22:05Z"
}
```

**Design considerations:**
- Use gRPC for internal service-to-service calls (lower latency than REST)
- REST/JSON for external integrations
- Feature enrichment: endpoint should accept raw event, enrich with real-time features (from feature store) before scoring
- Idempotency: scoring the same event twice should return the same result (cache by entity_id + model_version)

### 2. Batch Processing APIs

**POST /api/v1/anomaly/batch-score**
- Accepts array of entities (max 10,000 per request)
- Returns job ID for async processing
- Webhook callback on completion

**GET /api/v1/anomaly/batch-jobs/{job_id}**
- Returns job status: queued, processing, completed, failed
- Includes progress (items processed / total)
- On completion: link to results (S3 presigned URL or paginated result endpoint)

**POST /api/v1/anomaly/backfill**
- Re-score historical data with a new model version
- Parameters: date range, model version, entity filter
- Essential for comparing model versions on historical data

**Implementation:**
- Use Celery/Redis or cloud-native queues (SQS, Cloud Tasks) for job management
- Partition large batches into chunks of 1000 for parallel processing
- Store results in object storage (S3/GCS) for large batches, database for small ones
- TTL on batch results: 7 days default, configurable

### 3. Alert Management System

**Data model:**
```sql
alerts (
  alert_id UUID PRIMARY KEY,
  entity_id VARCHAR(255),
  anomaly_score FLOAT,
  threshold FLOAT,
  alert_severity ENUM('low','medium','high','critical'),
  alert_status ENUM('new','acknowledged','investigating','resolved','false_positive'),
  model_version VARCHAR(50),
  feature_snapshot JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  assigned_to VARCHAR(255),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ
)
```

**Endpoints:**
- `GET /api/v1/alerts` — list with filtering (status, severity, time range, entity, assignee)
- `GET /api/v1/alerts/{id}` — detail with full context
- `PATCH /api/v1/alerts/{id}` — update status, assign, add notes
- `POST /api/v1/alerts/{id}/feedback` — analyst feedback (true_positive, false_positive, needs_review)
- `GET /api/v1/alerts/stats` — aggregate metrics (count by severity, mean resolution time, precision)

**Alert grouping logic:**
- Group alerts by entity within a configurable time window (default 1 hour)
- Prevents alert storms: 100 anomalous transactions from one entity = 1 alert group
- Expose both individual anomaly scores and group-level summary

**Severity mapping:**
- Score 0.75-0.85 -> low
- Score 0.85-0.92 -> medium
- Score 0.92-0.97 -> high
- Score 0.97+ -> critical
- Override: domain-specific rules can escalate (e.g., any anomaly involving PII = high minimum)

### 4. Webhook Integrations

**Outbound webhooks:**
- Fire on: new alert, alert status change, batch job completion, model drift detected
- Payload: standardized JSON with event type, timestamp, relevant data
- Retry policy: exponential backoff (1s, 2s, 4s, 8s, 16s), max 5 retries
- Dead letter queue for failed deliveries
- HMAC-SHA256 signature in X-Webhook-Signature header for verification

**Common integrations:**
- Slack/Teams: formatted alert notifications with action buttons
- PagerDuty: critical alerts -> incident creation
- Jira/Linear: auto-create tickets for investigation
- SIEM (Splunk, Sentinel): forward all anomaly events for correlation
- Custom downstream services: event-driven architecture via webhooks

**Webhook management endpoints:**
- `POST /api/v1/webhooks` — register new webhook (URL, events, secret)
- `GET /api/v1/webhooks` — list registered webhooks
- `DELETE /api/v1/webhooks/{id}` — remove webhook
- `POST /api/v1/webhooks/{id}/test` — send test payload

### 5. Result Storage Schema

**Primary storage (PostgreSQL):**
```sql
anomaly_scores (
  score_id BIGSERIAL PRIMARY KEY,
  entity_id VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50),
  anomaly_score FLOAT NOT NULL,
  is_anomalous BOOLEAN,
  model_version VARCHAR(50),
  feature_snapshot JSONB,
  contributing_factors JSONB,
  scored_at TIMESTAMPTZ NOT NULL,
  INDEX idx_entity_time (entity_id, scored_at),
  INDEX idx_anomalous (is_anomalous, scored_at)
) PARTITION BY RANGE (scored_at);
```

- Partition by month for efficient time-range queries and data lifecycle management
- JSONB for feature_snapshot enables flexible schema evolution
- Retain raw scores for 90 days in hot storage (PostgreSQL), archive to cold storage (S3 + Parquet) indefinitely

**Time-series storage (TimescaleDB or InfluxDB):**
- For high-volume streaming scores that need fast aggregation
- Hypertable on scored_at with chunk interval = 1 day
- Continuous aggregates for dashboard queries (hourly/daily anomaly rates)

**Caching layer (Redis):**
- Cache latest score per entity (TTL = 1 hour): `anomaly:score:{entity_id}`
- Cache alert status: `alert:status:{alert_id}`
- Cache model metadata: `model:current_version`, `model:threshold`

### 6. API Rate Limiting for Streaming

**Tiered rate limiting:**
- Real-time scoring: 10,000 req/sec per API key (burst: 15,000)
- Batch submission: 100 req/min per API key
- Alert management: 1,000 req/min per API key
- Webhook management: 60 req/min per API key

**Implementation:**
- Token bucket algorithm (Redis-based) for distributed rate limiting
- Use `redis-cell` module or custom Lua script for atomic token bucket operations
- Return `429 Too Many Requests` with `Retry-After` header
- Include rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Streaming-specific considerations:**
- For Kafka-connected services, rate limiting happens at the consumer level (consumer group lag monitoring)
- Backpressure: if scoring service is overwhelmed, slow down Kafka consumer (pause partitions)
- Circuit breaker: if model service is down, queue events for retry rather than dropping them
- Graceful degradation: fall back to rule-based scoring if ML model service is unavailable

**Connection management:**
- HTTP/2 for multiplexed real-time scoring connections
- WebSocket endpoint for clients that need continuous score streams
- Server-Sent Events (SSE) for dashboard real-time updates
- Connection pooling to model serving backend (maintain warm connections)

### Recommendations for B07

1. **Separate scoring from alerting**. Scoring is stateless and horizontally scalable. Alerting involves state (grouping, deduplication, status) and needs careful concurrency handling.
2. **Store feature snapshots with every score**. When investigating an alert weeks later, you need to see exactly what the model saw. Do not rely on reconstructing features from raw data.
3. **Build the feedback API before the scoring API**. The feedback loop drives model improvement and is the hardest integration to retrofit.
4. **Use gRPC for internal scoring, REST for external**. The latency difference matters at 10,000+ scores/second.
5. **Implement circuit breakers** between the scoring API and the model serving layer. ML model failures should not cascade to upstream services.
6. **Partition score storage by time** from day one. Anomaly score tables grow fast and will become unmanageable without partitioning.
