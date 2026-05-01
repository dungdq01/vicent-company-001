# Backend Engineer Notes: Simulation & Digital Twin (B15)

## 1. Overview

The backend for a simulation and digital twin platform must handle diverse workloads: managing long-running simulation jobs, serving real-time twin state, orchestrating what-if scenarios, and integrating with industrial IoT platforms. This demands a mix of synchronous APIs, asynchronous job processing, and real-time streaming.

## 2. Simulation Job Management API

### Core Endpoints
```
POST   /api/v1/simulations              — Submit new simulation job
GET    /api/v1/simulations/{id}         — Get simulation status and metadata
GET    /api/v1/simulations/{id}/results — Retrieve simulation results
DELETE /api/v1/simulations/{id}         — Cancel running simulation
GET    /api/v1/simulations?status=running — List simulations with filters
POST   /api/v1/simulations/{id}/restart — Restart failed simulation
```

### Job Lifecycle
```
SUBMITTED → QUEUED → PROVISIONING → RUNNING → POST_PROCESSING → COMPLETED
                                       ↓                            ↓
                                    FAILED                      ARCHIVED
```

### Implementation
- Use Celery (Python) or BullMQ (Node.js) for job queue management.
- Store job metadata in PostgreSQL; store results in object storage (S3/MinIO).
- Support job priorities: interactive (high) vs batch (low).
- Implement job timeouts and automatic cleanup of stale jobs.
- Idempotency keys to prevent duplicate simulation submissions.

## 3. Scenario Management (CRUD for What-If)

### Data Model
```json
{
  "scenario_id": "uuid",
  "name": "High Temperature Stress Test",
  "base_scenario_id": "uuid (parent)",
  "parameters": {
    "temperature": 450,
    "pressure": 12.5,
    "flow_rate": 0.8
  },
  "constraints": { "max_temperature": 500 },
  "tags": ["stress-test", "thermal"],
  "created_by": "user_id",
  "version": 3
}
```

### Features
- Scenario branching: create variants from a base scenario (Git-like).
- Scenario comparison: diff two scenarios to show parameter differences.
- Scenario templates: pre-defined starting points for common analyses.
- Batch scenario generation: parameter sweep API for generating hundreds of scenarios.
- Version history for each scenario with rollback capability.

## 4. Real-Time Twin State API

### WebSocket Interface
```
WS /api/v1/twins/{asset_id}/live

// Client subscribes to specific data channels
→ { "action": "subscribe", "channels": ["temperature", "vibration", "status"] }
← { "channel": "temperature", "value": 245.3, "unit": "C", "timestamp": "..." }
← { "channel": "vibration", "value": 0.45, "unit": "mm/s", "timestamp": "..." }
```

### REST Fallback
```
GET /api/v1/twins/{asset_id}/state          — Current snapshot
GET /api/v1/twins/{asset_id}/state/history  — Historical state with time range
GET /api/v1/twins/{asset_id}/health         — Health score and anomaly flags
```

### Implementation
- WebSocket server with Socket.IO or native WS (ws library).
- Redis Pub/Sub for distributing twin state updates across server instances.
- Connection heartbeat and automatic reconnection handling.
- Rate limiting per client to prevent resource exhaustion.
- State caching in Redis with TTL for fast REST reads.

## 5. Simulation Result Storage

- Raw results: HDF5 or Parquet files in object storage (S3/MinIO).
- Metadata and summaries: PostgreSQL with JSONB for flexible schema.
- Time-series results: TimescaleDB for queryable simulation output.
- Result indexing: enable search by parameter ranges, output metrics, tags.
- Retention policies: archive old results to cold storage after configurable period.
- Pre-computed visualizations: thumbnail previews stored alongside results.

## 6. Webhook for Simulation Completion

```
POST /api/v1/webhooks
{
  "event": "simulation.completed",
  "url": "https://client-system.example.com/callback",
  "secret": "hmac-secret-key",
  "filters": { "tags": ["production"] }
}
```

- HMAC signature verification for webhook payloads.
- Retry with exponential backoff (3 attempts, 1min/5min/30min).
- Dead letter queue for persistently failing webhooks.
- Webhook delivery logs with response status codes.
- Support events: simulation.completed, simulation.failed, twin.anomaly_detected, twin.threshold_exceeded.

## 7. Multi-Tenant Simulation Isolation

- **Compute isolation** — separate Kubernetes namespaces or dedicated node pools per tenant.
- **Data isolation** — schema-per-tenant (PostgreSQL) or bucket-per-tenant (S3).
- **Resource quotas** — limit concurrent simulations, storage, and compute per tenant.
- **Network isolation** — network policies preventing cross-tenant communication.
- **API key management** — tenant-scoped API keys with configurable permissions.

## 8. Integration with IoT Platforms

### Azure IoT Hub
- Device-to-cloud messages routed to Event Hubs, consumed by backend services.
- Device twin properties synchronized with digital twin state.
- Direct methods for sending commands to physical assets.

### AWS IoT Core
- MQTT topics mapped to backend Kafka topics via IoT Rules.
- Device Shadow for offline state synchronization.
- Greengrass for edge processing before cloud ingestion.

### Platform-Agnostic
- Abstract IoT platform behind an adapter interface.
- Support MQTT direct connection for non-cloud deployments.
- OPC-UA integration via open-source adapters (Eclipse Milo).

## 9. Recommendations

1. Use async job processing (Celery/BullMQ) for simulations — never block API threads on long-running compute.
2. Implement WebSocket with Redis Pub/Sub for scalable real-time twin state distribution.
3. Design scenario management with Git-like branching — engineers think in terms of variants and comparisons.
4. Plan for multi-tenancy from the start — retrofitting isolation is painful.
5. Store simulation results in object storage with metadata in PostgreSQL — separates hot metadata from cold bulk data.
6. Provide both webhook and polling mechanisms for simulation completion — different clients prefer different patterns.
