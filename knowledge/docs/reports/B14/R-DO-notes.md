# DevOps Engineer Notes: Speech & Audio AI (B14)

## 1. GPU Allocation for ASR/TTS Inference

- ASR (Whisper-large): ~2GB VRAM per concurrent stream; A100 40GB handles ~15-20 concurrent streams
- TTS (VITS): ~1.5GB VRAM per model instance; can serve 30-50 concurrent synthesis requests on A100
- Use NVIDIA MPS (Multi-Process Service) to share a single GPU across multiple inference processes
- GPU memory fragmentation: use memory pools (PyTorch CUDA caching allocator) to prevent OOM errors
- GPU selection: A10G (cost-effective, 24GB) for production, T4 (budget, 16GB) for development, A100 for high-throughput
- Monitor GPU utilization: target 70-85% utilization; below 50% means over-provisioned, above 90% means latency risk
- Reserve GPU memory headroom (15-20%) for batch size variability and model loading
- Multi-model deployment: co-locate ASR + TTS on same GPU if total VRAM fits; reduces infrastructure cost

## 2. Real-Time Streaming Infrastructure

- **WebSocket**: Primary protocol for browser-based streaming ASR; use nginx or Envoy as WebSocket proxy
- **gRPC**: Preferred for server-to-server communication; bidirectional streaming with protobuf efficiency
- gRPC streaming: define service with `stream` keyword for both request and response
- Load balancing: WebSocket requires sticky sessions (L7 load balancer); gRPC supports client-side load balancing
- Connection limits: plan for 1000-10000 concurrent WebSocket connections per server; tune OS ulimits
- Keepalive: configure WebSocket ping/pong (30s interval) and gRPC keepalive to detect dead connections
- Message queuing: use Redis Streams or Kafka for decoupling audio ingestion from inference workers
- Network bandwidth: 16kHz Opus mono ~32kbps per stream; 10K concurrent streams = ~320 Mbps

## 3. Model Serving

- **Triton Inference Server**: NVIDIA's production serving; supports PyTorch, ONNX, TensorRT; dynamic batching
- **CTranslate2**: Optimized specifically for Transformer models; 4-8x faster than PyTorch for Whisper
- **Custom FastAPI/gRPC**: Maximum flexibility; use when Triton overhead is not justified
- **vLLM**: Not designed for speech but emerging support for multimodal models
- Dynamic batching in Triton: accumulate requests for up to 50ms, batch inference; 2-3x throughput improvement
- Model warmup: pre-load models and run dummy inference on startup to avoid cold-start latency spikes
- Model versioning: support A/B testing and canary deployments with version-tagged model endpoints
- Health checks: implement readiness probe (model loaded) and liveness probe (inference functional)

## 4. Latency Optimization (<500ms for Real-Time ASR)

- Latency budget breakdown: network (50-100ms) + audio buffering (200-300ms) + inference (100-200ms) + post-processing (20-50ms)
- Reduce audio buffer size: 200ms chunks give ~400ms total latency; 100ms chunks give ~300ms but higher overhead
- Use streaming/chunked inference: process audio as it arrives, not wait for full utterance
- TensorRT or CTranslate2 compilation: 2-5x inference speedup over raw PyTorch
- Quantization: INT8 reduces inference time by 30-50% with minimal quality loss
- CPU affinity: pin inference processes to specific CPU cores to avoid context switching
- NUMA-aware scheduling: ensure GPU and CPU are on same NUMA node to minimize memory access latency
- Measure P50, P95, P99 latency — P99 matters most for user experience

## 5. Auto-Scaling for Concurrent Streams

- Scale on GPU utilization (>75%) and concurrent connection count rather than CPU
- Horizontal pod autoscaler (HPA) with custom metrics: active_streams, gpu_utilization, request_queue_depth
- Scale-up time: GPU instances take 2-5 minutes to provision; pre-warm a buffer pool of 1-2 standby instances
- Scale-down cautiously: wait 10-15 minutes of low utilization before removing instances (avoid flapping)
- Predictive scaling: use time-of-day patterns (call centers peak 9-17h) for proactive scaling
- Maximum concurrent streams per GPU pod: set hard limit to prevent overload (e.g., 20 streams per A10G)
- Queue overflow strategy: return 503 with retry-after when all instances are at capacity
- Cost optimization: use spot/preemptible instances for batch transcription (not real-time)

## 6. Monitoring

- **WER tracking**: Run evaluation on test set after each model deployment; alert on WER regression >2%
- **Latency percentiles**: Dashboard showing P50, P95, P99 for ASR and TTS response times
- **GPU metrics**: Utilization, memory usage, temperature, power draw per GPU (DCGM exporter for Prometheus)
- **Stream metrics**: Active connections, connection duration, audio seconds processed per minute
- **Error rates**: Failed transcriptions, WebSocket disconnects, timeout rates
- **Audio quality**: Sample-based PESQ/STOI monitoring on production audio
- Alert thresholds: P99 latency >1s, GPU utilization >90% for >5min, error rate >1%
- Logging: structured logs with request_id, duration, audio_length, model_version for debugging

## 7. Edge Deployment (Mobile, IoT)

- **Mobile**: ONNX Runtime Mobile or TensorFlow Lite; Whisper-tiny (39M params) runs on modern phones
- **IoT**: Raspberry Pi 5 handles Whisper-tiny at ~0.5x real-time; Jetson Orin Nano handles Whisper-small real-time
- Edge-cloud hybrid: run wake word detection and VAD on device, stream to cloud for full ASR
- Model updates: OTA (over-the-air) model deployment with fallback to previous version
- Offline mode: support fully offline ASR for environments without internet connectivity
- Power management: disable GPU inference when on battery; use CPU-only mode for power saving
- Testing: maintain a device lab with representative hardware for performance regression testing
- Model size constraints: <50MB for mobile app bundle, <200MB for IoT devices with storage

## Recommendations

1. Start with CTranslate2 for Whisper serving — simpler than Triton and faster for single-model deployment
2. Budget 200-300ms for audio buffering in latency calculations — this is the largest fixed cost
3. Pre-warm GPU instances and maintain a standby pool — cold start kills real-time speech experiences
4. Monitor P99 latency, not just P50 — speech users are very sensitive to occasional delays
5. Use spot instances for batch transcription but never for real-time streaming
6. Edge deployment requires a separate optimization track — do not try to shrink server models at the last minute
7. Invest in GPU monitoring from day one — speech workloads are GPU-bound and hard to debug without visibility
