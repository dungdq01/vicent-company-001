# Backend Engineering Notes: B03 Computer Vision
## By R-BE — Date: 2026-03-31

---

### 1. CV Inference API Design

**REST vs gRPC for image payloads:**

| Dimension | REST (HTTP/1.1) | REST (HTTP/2) | gRPC |
|-----------|-----------------|---------------|------|
| Payload encoding | JSON + base64 or multipart | Same | Protobuf binary |
| Image transfer overhead | ~33% size increase (base64) | Same | Minimal framing |
| Streaming | Limited (SSE) | Server push | Bidirectional streaming native |
| Client tooling | Universal | Universal | Needs generated stubs |
| Latency | Higher | Medium | Lowest |
| Best for | Public APIs, browser clients | Same | Internal microservices, high-throughput |

**Recommendation:** Expose REST with multipart/form-data for public-facing APIs (browser and mobile clients require no special tooling). Use gRPC for internal service-to-service calls — especially between API gateway and inference servers where payload volume is high and latency matters.

**Image payload options:**
- `multipart/form-data` — preferred for binary upload. No encoding overhead. Max file size controlled by nginx/gateway config.
- `application/json` with base64 body — acceptable for small images (<200KB), convenient for JSON-native clients.
- Pre-signed URL — client uploads to S3 directly, API receives only the URL. Decouples upload from inference, enables large file handling. Best for async batch workflows.

**Async patterns:**
- Synchronous (≤2s): Return prediction in response body.
- Long-running / batch (>2s): Accept job, return `job_id`, expose `GET /jobs/{id}` for polling or push result via webhook. Use Celery + Redis or AWS SQS for task queue.

---

### 2. Model Serving Frameworks Comparison

| Framework | Best For | Throughput | Latency | Complexity |
|-----------|----------|------------|---------|------------|
| **TorchServe** | PyTorch models, native integration | Medium-High | Medium | Low |
| **TF Serving** | TensorFlow/SavedModel, production-proven | High | Medium | Low-Medium |
| **Triton Inference Server** | Multi-framework, GPU batching, ensembles | Very High | Low | High |
| **BentoML** | Rapid deployment, flexible packaging, Python-first | Medium | Medium | Low |
| **vLLM (multimodal)** | LLM-based vision models (LLaVA, InternVL) | High | Medium-High | Medium |
| **Ray Serve** | Python-native, flexible pipeline composition | High | Medium | Medium |

**Detailed notes:**

**Triton Inference Server** is the gold standard for production CV at scale. It supports TensorRT, ONNX, PyTorch (TorchScript), TensorFlow, and Python backends. Key features: dynamic batching, concurrent model execution on multiple GPU instances, model ensemble pipelines (e.g., preprocess → detect → classify in one request), and the Perf Analyzer tool for benchmarking. Use when you need maximum GPU utilization.

**BentoML** wins for speed-to-production. Define a `@bentoml.service` class, package with `bentoml build`, deploy to BentoCloud or Kubernetes. Handles HTTP/gRPC serving, batching, and observability with minimal boilerplate. Best choice for teams without dedicated MLOps.

**TorchServe** is the natural choice if your entire stack is PyTorch. Supports custom handlers for preprocessing/postprocessing. Integrates with TorchScript and ONNX. Weaker GPU batching than Triton.

---

### 3. Batching Strategy

Batching is critical for GPU utilization — a GPU that processes 1 image takes nearly the same time as 8 images if memory allows.

**Dynamic batching (Triton):**
Triton collects requests arriving within a configurable time window and batches them automatically:
```json
{
  "dynamic_batching": {
    "preferred_batch_size": [4, 8, 16],
    "max_queue_delay_microseconds": 5000
  }
}
```
The `max_queue_delay_microseconds` controls the maximum wait for a batch to fill — a 5ms wait with good traffic gets you near-full batches.

**Micro-batching:**
For streaming video (frame-by-frame), group N consecutive frames into a micro-batch before sending to GPU. Effective batch size of 4-8 frames is typical for real-time pipelines.

**Batch size vs. latency tradeoff:**

| Batch Size | GPU Utilization | Latency | Throughput |
|------------|-----------------|---------|------------|
| 1 | ~20% | Lowest | Low |
| 4 | ~60% | +5-15ms | 3-4x |
| 8 | ~80% | +15-30ms | 6-7x |
| 16 | ~90% | +30-60ms | 12-14x |
| 32 | ~95% | +60-120ms | 22-26x |

For latency-sensitive applications (≤50ms SLA), batch sizes of 4-8 are the sweet spot. For throughput-optimized batch jobs, push to 32+.

---

### 4. API Endpoint Design

**Synchronous single image prediction:**
```
POST /v1/predict
Content-Type: multipart/form-data

Body:
  image: <binary file>
  model_id: "yolov8n-detection" (optional)
  confidence_threshold: 0.5 (optional)

Response 200:
{
  "predictions": [
    {"label": "person", "confidence": 0.97, "bbox": [x, y, w, h]},
    {"label": "car",    "confidence": 0.89, "bbox": [x, y, w, h]}
  ],
  "inference_time_ms": 12.4,
  "model_version": "yolov8n-v2.1.0"
}
```

**Streaming for video (Server-Sent Events):**
```
POST /v1/predict/stream
Content-Type: multipart/form-data
Body: video file

Response: text/event-stream
data: {"frame": 0, "predictions": [...]}
data: {"frame": 1, "predictions": [...]}
...
data: {"done": true, "total_frames": 300}
```

**Async webhook for long jobs:**
```
POST /v1/jobs
Body: {"video_url": "s3://...", "webhook_url": "https://your-app/callback"}

Response 202:
{"job_id": "j_abc123", "status": "queued", "estimated_seconds": 45}

GET /v1/jobs/j_abc123
→ {"status": "processing", "progress": 0.42}
→ {"status": "done", "result_url": "s3://results/j_abc123.json"}

Webhook POST to your-app/callback:
{"job_id": "j_abc123", "status": "done", "result_url": "..."}
```

**Batch endpoint for multiple images:**
```
POST /v1/predict/batch
Body: multipart with files[] array (up to 32 images)
```

---

### 5. Caching & Performance

**Result caching for identical images:**
Hash the input image bytes using SHA-256. Check Redis before sending to inference engine:
```python
import hashlib, redis

def get_image_hash(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()

async def predict_with_cache(image_bytes: bytes):
    key = f"cv:pred:{get_image_hash(image_bytes)}"
    cached = await redis.get(key)
    if cached:
        return json.loads(cached)
    result = await inference_engine.predict(image_bytes)
    await redis.setex(key, 3600, json.dumps(result))  # TTL: 1 hour
    return result
```

Cache hit rate is surprisingly high in production — surveillance cameras repeat similar frames, and product catalog images are queried repeatedly.

**CDN for model artifacts:**
Host ONNX/TensorRT models on S3 + CloudFront. Inference nodes pull from CDN on cold start — dramatically faster than pulling from a single S3 region when deploying globally.

**Response compression:**
Enable gzip/brotli compression in nginx for JSON responses. Prediction JSON with 50 bounding boxes compresses from ~4KB to ~600 bytes. For base64 image responses, compression is ineffective (already compressed binary).

**Connection pooling:**
Use a connection pool for the database and Redis clients. Avoid re-connecting on every request. In FastAPI + async context, use `aioredis` with a shared pool initialized on startup.

---

### 6. Error Handling & Fallbacks

**Model timeout:**
Set an inference timeout (e.g., 5 seconds). If exceeded, return `503 Service Unavailable` with a `Retry-After` header. Do not let clients wait indefinitely.

```python
try:
    result = await asyncio.wait_for(model.infer(image), timeout=5.0)
except asyncio.TimeoutError:
    raise HTTPException(503, "Inference timeout", headers={"Retry-After": "2"})
```

**Low-confidence fallback:**
Define a minimum confidence threshold per use case. If top prediction confidence is below threshold:
- Return `predictions: []` with `low_confidence: true` flag.
- Optionally route to a larger, more accurate model (fallback model chain).
- Queue the image for human review annotation.

**Graceful degradation:**
- Primary: Full GPU inference with TensorRT.
- Fallback 1: ONNX Runtime on CPU (slower but always available).
- Fallback 2: Return cached result from last successful inference for the same camera/source.
- Fallback 3: Return `503` with clear error — do not return fake data.

Use a circuit breaker pattern (e.g., `pybreaker` library) to stop sending requests to a failing inference server and route to fallback automatically.

---

### 7. Security for CV APIs

**Input validation — first line of defense:**
```python
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB

async def validate_image(file: UploadFile):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(400, "Unsupported image type")
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(413, "File too large")
    # Verify actual file magic bytes, not just Content-Type header
    import imghdr
    if imghdr.what(None, h=content[:32]) not in ('jpeg', 'png', 'webp'):
        raise HTTPException(400, "File content does not match declared type")
    return content
```

**Additional security measures:**
- **Strip EXIF data** before processing — can contain GPS coordinates, device info.
- **Scan for adversarial inputs** — validate image dimensions are within expected bounds (e.g., max 4096x4096).
- **Rate limiting:** Use `slowapi` (FastAPI) or API Gateway throttling. Set per-IP and per-API-key limits. CV inference is expensive — protect against accidental or malicious flooding.
- **Authentication:** Require API key or JWT for all endpoints. Never expose inference endpoints publicly without auth.
- **Input sanitization for URL-based payloads:** If accepting image URLs, validate the URL is not pointing to internal network resources (SSRF protection). Use an allow-list of trusted domains.

---

### 8. Production Architecture Diagram

```
                         ┌─────────────────────────────────────────────────┐
                         │                  CLIENT TIER                     │
                         │   Browser / Mobile App / IoT Camera / Partner   │
                         └────────────────────┬────────────────────────────┘
                                              │ HTTPS
                         ┌────────────────────▼────────────────────────────┐
                         │              API GATEWAY                         │
                         │   (AWS API GW / Kong / nginx)                   │
                         │   Auth · Rate Limit · SSL Termination            │
                         └────────────────────┬────────────────────────────┘
                                              │
                   ┌──────────────────────────┼──────────────────────────┐
                   │                          │                          │
        ┌──────────▼──────────┐  ┌───────────▼──────────┐  ┌───────────▼──────────┐
        │  SYNC PREDICT API   │  │  ASYNC JOB MANAGER   │  │  STREAM PREDICT API  │
        │  (FastAPI pods)     │  │  (FastAPI + Celery)   │  │  (FastAPI SSE)       │
        └──────────┬──────────┘  └───────────┬──────────┘  └───────────┬──────────┘
                   │                          │                          │
                   └──────────────────────────┼──────────────────────────┘
                                              │
                         ┌────────────────────▼────────────────────────────┐
                         │           INFERENCE SERVER CLUSTER               │
                         │   Triton Inference Server / TorchServe           │
                         │   GPU nodes (A10G / T4 / A100)                  │
                         │   Dynamic batching · Multi-model · Ensembles     │
                         └────────┬──────────────────────┬─────────────────┘
                                  │                      │
               ┌──────────────────▼───┐      ┌──────────▼──────────────────┐
               │    MODEL REGISTRY    │      │      CACHE LAYER            │
               │  MLflow / S3         │      │   Redis (result cache)      │
               │  TensorRT engines    │      │   TTL-based by image hash   │
               │  Version tracking    │      └─────────────────────────────┘
               └──────────────────────┘
                                  │
               ┌──────────────────▼──────────────────────────────────────┐
               │                  OBSERVABILITY                           │
               │   Prometheus + Grafana · Latency P50/P95/P99            │
               │   GPU utilization · Prediction confidence distribution   │
               │   Jaeger distributed tracing · PagerDuty alerts         │
               └─────────────────────────────────────────────────────────┘
```
