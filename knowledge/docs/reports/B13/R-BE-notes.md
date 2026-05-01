# Backend Engineer Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

The Backend Engineer builds the serving layer that turns trained ML models into usable prediction services. This includes REST APIs for real-time scoring, batch prediction pipelines, feature retrieval at inference time, model versioning, and multi-tenant architectures for serving predictions to multiple clients or business units.

## 2. Model Serving APIs

### FastAPI
- Async Python framework; ideal for ML serving due to Python ecosystem compatibility.
- Load model at startup, serve predictions via POST endpoints.
- Pydantic models for request/response validation.
- Built-in OpenAPI docs for API consumers.
- Typical latency: 5-50ms for tabular models (model inference <5ms, overhead in serialization).

### BentoML
- ML-specific serving framework. Packages model + preprocessing into a "Bento".
- Adaptive batching: accumulates requests and runs inference in batches for throughput.
- Built-in model management, containerization, and deployment.
- Best for: teams that want opinionated ML serving without building from scratch.

### Other Options
- TensorFlow Serving / TorchServe: overkill for tabular (designed for deep learning).
- Seldon Core: Kubernetes-native, good for complex inference graphs.
- Ray Serve: scalable, good if already using Ray for training.

## 3. Batch Prediction Pipelines

- Run predictions on entire datasets on a schedule (daily, hourly).
- Architecture: read input from warehouse/lake, load model, predict, write results back.
- Use Spark or Dask for large-scale batch predictions (>1M rows).
- Store results in a predictions table with: entity_id, prediction, confidence, model_version, timestamp.
- Batch is simpler and cheaper than real-time; use it when latency >minutes is acceptable.

## 4. Real-Time Scoring Endpoints

### API Design
```
POST /v1/predict
{
  "customer_id": "C12345",
  "features": {
    "income": 50000,
    "age": 35,
    "tenure_months": 24
  }
}

Response:
{
  "prediction": 0.82,
  "label": "high_risk",
  "model_version": "v2.3.1",
  "feature_contributions": {...},
  "request_id": "uuid"
}
```

### Performance Considerations
- Pre-load model into memory at startup (avoid loading per request).
- Use connection pooling for feature store lookups.
- Target p99 latency <100ms for most enterprise use cases.
- Horizontal scaling via multiple replicas behind a load balancer.

## 5. Feature Retrieval at Inference Time

- Two patterns: client sends features vs server retrieves features.
- **Client-sends**: simpler, but client must know feature schema. Good for batch.
- **Server-retrieves**: API receives entity_id, fetches features from online store. Better for real-time.
- Feature retrieval adds 5-20ms latency (Redis) or 20-100ms (database).
- Cache frequently accessed entity features in application-level cache (LRU).
- Ensure feature computation logic is identical between training and serving (training-serving skew).

## 6. Model Versioning and A/B Routing

### Version Management
- Store model versions in a registry (MLflow, S3 with naming convention).
- Each version tagged with: training date, dataset version, metrics, status (staging/production/archived).
- API supports version parameter: `/v1/predict?model_version=v2.3.1`.

### A/B Routing
- Route traffic by percentage: 90% champion, 10% challenger.
- Implement via: request hash (deterministic per entity), random split, or feature flag service.
- Log both predictions for comparison; only serve champion's prediction to user.
- Shadow mode: run challenger in parallel, log results, but do not expose to users.

## 7. Caching Predictions

- Cache predictions for identical inputs (same entity_id + same features = same prediction).
- Use Redis with TTL matching model retraining frequency (e.g., 24h cache for daily retrained models).
- Cache key: hash of (model_version + sorted feature values).
- Cache hit rates of 30-70% are common for customer-level predictions.
- Invalidate cache on model version change.

## 8. Retraining Triggers

- Webhook endpoints to trigger model retraining pipelines.
- Triggers: scheduled (cron), data drift detected, performance decay below threshold, manual.
- POST /v1/admin/retrain with authentication and authorization.
- Retraining is async: return job_id, provide status endpoint.
- Integrate with Airflow/Prefect DAGs for orchestration.

## 9. Multi-Tenant Prediction Service

- Serve multiple clients/business units from a single service.
- Tenant isolation: separate model versions per tenant, tenant-specific feature stores.
- API key or JWT token identifies tenant; route to correct model.
- Resource isolation: rate limiting per tenant, separate compute pools for large tenants.
- Data isolation: predictions logged to tenant-specific tables.
- Common in Vietnamese SaaS: one prediction platform serving multiple bank branches or insurance agents.

## 10. Recommendations

1. Start with FastAPI for most tabular ML serving; move to BentoML if you need adaptive batching.
2. Default to batch predictions; add real-time endpoints only when business requires <1s latency.
3. Always return model_version and request_id in responses for debugging and auditing.
4. Implement feature retrieval on the server side to avoid training-serving skew.
5. Use shadow mode before A/B testing; validate challenger model behavior before exposing to users.
6. Cache aggressively for customer-level predictions; invalidate on model updates.
7. Build multi-tenant from day one if serving multiple clients; retrofitting isolation is painful.
