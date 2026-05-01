# Backend Engineer Notes: Speech & Audio AI (B14)

## 1. Real-Time ASR API (WebSocket Streaming)

- Use WebSocket for bidirectional streaming: client sends audio chunks, server returns partial transcriptions
- Protocol design: binary frames for audio (Opus-encoded at 16kHz), text frames for JSON transcription results
- Message types: `partial` (interim results, updated frequently), `final` (stable result after endpoint detection)
- Chunk size: 100-320ms audio per WebSocket message; smaller = lower latency, higher overhead
- Server-side buffering: accumulate 500-1000ms before running inference for better accuracy
- Connection lifecycle: open → configure (language, model) → stream audio → receive results → close
- Handle reconnection gracefully: client should buffer audio during disconnection and resend
- Backpressure: if server cannot keep up, signal client to reduce send rate or buffer

## 2. Batch Transcription Pipeline

- Accept audio file upload, return job ID, process asynchronously, notify on completion
- Pipeline stages: upload → validate → preprocess (resample, normalize) → chunk → transcribe → merge → post-process
- Chunking strategy: split at silence boundaries (VAD-based) with 1s overlap; merge with overlap resolution
- Use a job queue (Redis Queue, Celery, or Bull) for managing transcription jobs
- Priority queues: real-time requests > interactive batch > bulk batch
- Parallelism: process chunks concurrently on GPU; a single A100 can handle 50-100x real-time for Whisper-large
- Output formats: JSON (with timestamps), SRT/VTT (subtitles), plain text
- Webhook or polling for job status; include progress percentage for long files

## 3. TTS API (Text to Audio)

- Endpoint: POST /api/tts with body containing text, voice_id, speed, format parameters
- Response: audio file (WAV, MP3, Opus) or streaming audio chunks for long text
- For long text (>500 chars): stream audio in chunks as they are generated — do not wait for full synthesis
- Streaming TTS: use chunked transfer encoding or server-sent events for progressive audio delivery
- SSML support: allow markup for pauses, emphasis, pronunciation overrides, phoneme specification
- Vietnamese text normalization must happen server-side: numbers, dates, abbreviations, currency
- Cache frequently requested phrases (greetings, IVR menus) — TTS inference is expensive
- Rate limit by character count, not request count — a 10,000-character request costs 100x more than 100 characters

## 4. Audio File Upload and Processing Queue

- Accept multipart/form-data uploads; support chunked upload for large files (>100MB)
- Validate at upload: file format, duration limits (e.g., max 4 hours), file size limits (e.g., max 1GB)
- Store uploaded files in object storage (S3/MinIO) with pre-signed URLs for retrieval
- Generate unique job IDs (UUID v4) for tracking; store metadata in PostgreSQL
- Processing queue priorities: use separate queues for real-time, interactive, and batch workloads
- Dead letter queue for failed jobs with configurable retry policy (3 retries, exponential backoff)
- Clean up temporary files after processing; archive results based on retention policy
- Support resumable uploads using tus protocol for unreliable network conditions

## 5. Speaker Verification API

- **Enrollment**: POST /api/speakers/enroll — upload 10-30s of reference audio, compute and store embedding
- **Verification**: POST /api/speakers/verify — upload test audio + speaker_id, return similarity score + decision
- **Identification**: POST /api/speakers/identify — upload test audio, return top-N matching speakers
- Store speaker embeddings encrypted at rest; these are biometric data subject to privacy regulations
- Threshold tuning: expose configurable threshold per application (stricter for banking, relaxed for convenience)
- Anti-spoofing: integrate liveness detection to prevent replay attacks with recorded audio
- Response time target: <1 second for verification (embedding extraction ~200ms + comparison ~10ms)
- Audit logging: log all verification attempts (success/failure) with timestamps for security compliance

## 6. Caching Audio Outputs

- Cache TTS outputs keyed by hash(text + voice_id + speed + format) — deterministic synthesis enables caching
- Use CDN (CloudFront, Cloudflare) for serving cached audio files close to users
- Cache tiers: L1 in-memory (hot phrases, <100MB), L2 Redis (recent requests, <10GB), L3 object storage (all)
- Invalidation: cache TTS output for 30-90 days; invalidate when model is updated
- For ASR: cache is less useful (unique audio inputs), but cache language model and model weights in GPU memory
- Pre-generate common TTS outputs: IVR menus, standard greetings, system notifications
- Estimate cache hit rate: typically 20-40% for customer-facing TTS, 60-80% for IVR systems

## 7. Rate Limiting for Compute-Heavy Models

- Speech models are 10-100x more expensive than text APIs — rate limiting is essential
- Limit dimensions: requests per minute, concurrent streams, audio minutes per hour, characters per minute (TTS)
- Token bucket algorithm with per-user and per-organization quotas
- GPU-aware rate limiting: track GPU utilization, reject requests when utilization >85%
- Graceful degradation: fall back to smaller/faster model under load rather than rejecting requests
- Cost tracking: log GPU-seconds per request for billing and capacity planning
- Burst allowance: allow 2-3x normal rate for short bursts (10-30 seconds)
- Return 429 with Retry-After header; include queue position for queued requests

## 8. Multi-Tenant Isolation for Voice Data

- Voice data is sensitive biometric information — strict tenant isolation is required
- Data isolation: separate object storage buckets or prefixes per tenant; never co-mingle audio data
- Compute isolation: per-tenant GPU allocation or fair-share scheduling with preemption
- Model isolation: support per-tenant fine-tuned models loaded on demand
- Network isolation: TLS for all audio transmission; encrypt audio at rest with per-tenant keys
- Audit trail: log all access to audio data with tenant context; support data export and deletion (GDPR/PDPA)
- Tenant-specific configuration: language, model version, vocabulary, custom vocabulary
- Data residency: some tenants may require audio to stay in specific geographic regions

## Recommendations

1. WebSocket is the only viable option for real-time ASR streaming — HTTP request/response is too slow
2. Implement batch transcription as an async job queue from day one — synchronous processing does not scale
3. Cache TTS outputs aggressively — synthesis is expensive and often repetitive
4. Rate limit by GPU-seconds, not just request count — one long audio file can consume 100x the resources
5. Treat voice data as biometric PII — encrypt at rest, audit all access, support deletion
6. Build the speaker verification API with anti-spoofing from the start — adding it later is a security risk
7. Use separate processing queues for real-time and batch to prevent batch jobs from starving real-time requests
