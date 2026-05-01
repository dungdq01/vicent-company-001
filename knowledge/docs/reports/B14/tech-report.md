# Technical Report: Speech & Audio AI (B14)
## By Dr. Praxis (R-β) — Date: 2026-03-31

---

## 1. Architecture Overview

### 1.1 Simple — Batch Transcription Service

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Audio Files  │───>│ Whisper API   │───>│ Text Output │
│ (.wav/.mp3)  │    │ (batch queue) │    │ (.txt/.srt) │
└─────────────┘    └──────────────┘    └─────────────┘
```

- Upload audio files to a queue (S3/local)
- Process with OpenAI Whisper or `faster-whisper`
- Output: plain text, SRT subtitles, or JSON with timestamps
- No GPU required for `tiny`/`base` models; GPU recommended for `large-v3`

### 1.2 Intermediate — Real-time ASR + TTS Pipeline

```
┌──────────┐  WebSocket   ┌────────────────────────┐   WebSocket   ┌──────────┐
│  Client  │─────────────>│   FastAPI Gateway       │──────────────>│  Client  │
│ (mic in) │              │                        │               │ (speaker)│
└──────────┘              │  ┌──────────────────┐  │               └──────────┘
                          │  │ Streaming ASR     │  │
                          │  │ (faster-whisper)  │  │
                          │  └───────┬──────────┘  │
                          │          │ text         │
                          │  ┌───────▼──────────┐  │
                          │  │ NLP Processing    │  │
                          │  │ (intent/sentiment)│  │
                          │  └───────┬──────────┘  │
                          │          │              │
                          │  ┌───────▼──────────┐  │
                          │  │ TTS Engine        │  │
                          │  │ (XTTS / VITS)     │  │
                          │  └──────────────────┘  │
                          └────────────────────────┘
```

### 1.3 Advanced — Enterprise Speech Platform

```
┌─────────────────────────────────────────────────────────────────┐
│                    Enterprise Speech Platform                    │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ SIP/SRTP │  │ WebRTC   │  │ REST API │  │ File Upload   │  │
│  │ Gateway  │  │ Gateway  │  │ Gateway  │  │ (batch)       │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       └──────────────┼───────────┬─┘               │           │
│                      ▼           ▼                  ▼           │
│              ┌───────────────────────────────────────┐          │
│              │         Audio Router / VAD            │          │
│              │   (Silero VAD, energy-based gating)   │          │
│              └───────────────┬───────────────────────┘          │
│                              │                                  │
│       ┌──────────────────────┼──────────────────────┐          │
│       ▼                      ▼                      ▼          │
│  ┌─────────┐          ┌───────────┐          ┌───────────┐    │
│  │ ASR Pool│          │ Speaker   │          │ Emotion   │    │
│  │ Whisper │          │ Diarize + │          │ Detection │    │
│  │ Triton  │          │ Verify    │          │ (SER)     │    │
│  └────┬────┘          └─────┬─────┘          └─────┬─────┘    │
│       │                     │                      │           │
│       └─────────────────────┼──────────────────────┘           │
│                             ▼                                  │
│              ┌──────────────────────────┐                      │
│              │   Orchestration Layer     │                      │
│              │  (Redis Streams + Celery) │                      │
│              └─────────────┬────────────┘                      │
│                            │                                   │
│       ┌────────────────────┼────────────────────┐              │
│       ▼                    ▼                    ▼              │
│  ┌──────────┐      ┌────────────┐      ┌────────────┐        │
│  │ TTS Pool │      │ Analytics  │      │ Agent      │        │
│  │ XTTS/VITS│      │ Dashboard  │      │ Assist     │        │
│  └──────────┘      └────────────┘      └────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

### 2.1 Automatic Speech Recognition (ASR)

| Tool | Type | Language Support | Real-time | Notes |
|---|---|---|---|---|
| `faster-whisper` | Open-source, CTranslate2 | 99 languages incl. Vietnamese | Yes (chunked) | 4x faster than original Whisper, INT8 quantization |
| `openai-whisper` | Open-source, PyTorch | 99 languages | No (batch) | Reference implementation, `large-v3` best accuracy |
| `wav2vec2` (Meta) | Open-source, self-supervised | Fine-tune per language | Yes | Best for low-resource languages with fine-tuning |
| Conformer (Google) | Architecture pattern | Varies | Yes | State-of-art hybrid attention+convolution |
| Google Cloud STT | Cloud API | 125+ languages | Yes | Streaming API, pay-per-minute |
| Azure Speech | Cloud API | 100+ languages | Yes | Batch + real-time, custom models |
| FPT.AI Speech | Cloud API (Vietnam) | Vietnamese focus | Yes | Best Vietnamese-specific commercial option |

### 2.2 Text-to-Speech (TTS)

| Tool | Type | Voice Cloning | Streaming | Notes |
|---|---|---|---|---|
| VITS / VITS2 | Open-source, end-to-end | No (single-speaker training) | Yes | Fast inference, good quality |
| XTTS v2 (Coqui) | Open-source | Yes (6s reference) | Yes | Multilingual, zero-shot cloning |
| ElevenLabs | Cloud API | Yes | Yes | Best quality, expensive at scale |
| Google Cloud TTS | Cloud API | No | Yes | WaveNet/Neural2 voices |
| Azure TTS | Cloud API | Yes (custom neural) | Yes | SSML support, custom voice |
| Bark (Suno) | Open-source | Yes (prompt-based) | No | Non-speech audio too (laughter, music) |

### 2.3 Speaker Recognition & Diarization

| Tool | Purpose | Notes |
|---|---|---|
| ECAPA-TDNN | Speaker embedding extraction | State-of-art speaker verification |
| SpeechBrain | Full toolkit (verify, diarize, separate) | PyTorch, pretrained models |
| pyannote-audio | Speaker diarization | Best open-source diarization pipeline |
| Resemblyzer | Speaker embedding (d-vectors) | Lightweight, easy to use |

### 2.4 Audio Processing & Utilities

```
librosa          — Feature extraction (MFCC, mel spectrogram, chroma)
torchaudio       — PyTorch audio I/O, transforms, datasets
pydub            — Simple audio manipulation (cut, concat, convert)
soundfile        — Read/write WAV, FLAC, OGG
ffmpeg           — Universal audio/video transcoding (required by most tools)
noisereduce      — Spectral-gating noise reduction
Silero VAD       — Voice activity detection (fast, accurate, tiny model)
webrtcvad        — Google's VAD (C-based, very fast)
```

### 2.5 Serving Infrastructure

```
Triton Inference Server  — Multi-model GPU serving, batching, model versioning
FastAPI + WebSocket      — Real-time streaming gateway
Redis Streams            — Audio chunk buffering, pub/sub between services
Celery + RabbitMQ        — Batch job queue for file processing
gRPC                     — Low-latency inter-service communication
```

### 2.6 Vietnamese-Specific Resources

| Resource | Type | Details |
|---|---|---|
| VIVOS | Dataset | 15 hours Vietnamese read speech, free |
| VLSP ASR datasets | Dataset | Competition datasets, larger corpora |
| `vinai/PhoWhisper` | Model | Vietnamese Whisper fine-tuned by VinAI |
| `nguyenvulebinh/wav2vec2-base-vi` | Model | wav2vec2 fine-tuned on Vietnamese |
| FPT.AI Speech API | API | Commercial Vietnamese ASR + TTS |
| Zalo AI Speech | API/Model | Vietnamese speech from Zalo |

---

## 3. Pipeline Design

### 3.1 Full Speech Processing Pipeline

```
Stage 1: Audio Capture & Preprocessing
───────────────────────────────────────
  Input Sources: Microphone, Phone (SIP), File Upload, WebRTC
       │
       ▼
  ┌─────────────────────────────────────┐
  │ • Resampling (→ 16kHz mono)         │
  │ • Normalization (peak / RMS)        │
  │ • Noise reduction (noisereduce)     │
  │ • VAD chunking (Silero VAD)         │
  └──────────────┬──────────────────────┘
                 │
Stage 2: Speech Recognition (ASR)
───────────────────────────────────────
                 │
  ┌──────────────▼──────────────────────┐
  │ • Model selection (language detect)  │
  │ • Decoding (beam search / greedy)    │
  │ • Timestamp alignment               │
  │ • Confidence scoring                 │
  └──────────────┬──────────────────────┘
                 │
Stage 3: Text Processing & NLP
───────────────────────────────────────
                 │
  ┌──────────────▼──────────────────────┐
  │ • Punctuation restoration           │
  │ • Sentence segmentation             │
  │ • Named entity recognition          │
  │ • Intent / sentiment analysis       │
  │ • Speaker label assignment          │
  └──────────────┬──────────────────────┘
                 │
Stage 4: TTS Generation (if needed)
───────────────────────────────────────
                 │
  ┌──────────────▼──────────────────────┐
  │ • Text normalization (numbers, abbr) │
  │ • Phoneme conversion                │
  │ • Acoustic model → mel spectrogram  │
  │ • Vocoder → waveform                │
  └──────────────┬──────────────────────┘
                 │
Stage 5: Audio Post-processing
───────────────────────────────────────
                 │
  ┌──────────────▼──────────────────────┐
  │ • Volume normalization              │
  │ • Format encoding (WAV/MP3/OGG)    │
  │ • Chunked streaming delivery       │
  └──────────────┬──────────────────────┘
                 │
Stage 6: Delivery
───────────────────────────────────────
                 ▼
  WebSocket stream │ REST response │ File storage (S3)
```

### 3.2 Key Design Decisions

| Decision | Recommendation | Rationale |
|---|---|---|
| Sample rate | 16 kHz mono | Standard for speech models; reduces bandwidth 6x vs 48kHz stereo |
| Audio format (internal) | PCM 16-bit or float32 | Avoid re-encoding overhead between stages |
| VAD strategy | Silero VAD before ASR | Reduces ASR compute by 30-60% (skip silence) |
| Chunk size (streaming) | 200-500ms | Balance between latency and accuracy |
| Buffer strategy | Ring buffer with overlap | Prevents word splits at chunk boundaries |

---

## 4. Mini Examples

### 4.1 Quick Start: Vietnamese Speech-to-Text with Whisper

**Level:** Beginner | **Time:** 30 minutes | **GPU:** Optional

```bash
# Setup
pip install faster-whisper pydub
# For GPU: pip install nvidia-cublas-cu12 nvidia-cudnn-cu12
```

```python
"""
vietnamese_stt.py — Transcribe Vietnamese audio with faster-whisper
"""
from faster_whisper import WhisperModel
import json
import sys

# ── Model Loading ──────────────────────────────────────────────
# Sizes: tiny, base, small, medium, large-v3
# Device: "cuda" for GPU, "cpu" for CPU
# Compute type: "int8" (fast, CPU), "float16" (GPU), "int8_float16" (GPU, fastest)
model = WhisperModel(
    "large-v3",
    device="cuda",        # change to "cpu" if no GPU
    compute_type="float16"  # change to "int8" for CPU
)

# ── Transcription ──────────────────────────────────────────────
audio_path = "meeting_recording.wav"  # any format ffmpeg supports

segments, info = model.transcribe(
    audio_path,
    language="vi",            # force Vietnamese (skip language detection)
    beam_size=5,              # higher = more accurate, slower
    vad_filter=True,          # skip silence → faster processing
    vad_parameters=dict(
        min_silence_duration_ms=500,
        speech_pad_ms=200,
    ),
    word_timestamps=True,     # word-level timing
)

# ── Output ─────────────────────────────────────────────────────
print(f"Detected language: {info.language} (prob: {info.language_probability:.2f})")
print(f"Duration: {info.duration:.1f}s\n")

results = []
for segment in segments:
    print(f"[{segment.start:.1f}s → {segment.end:.1f}s] {segment.text}")
    results.append({
        "start": round(segment.start, 2),
        "end": round(segment.end, 2),
        "text": segment.text.strip(),
        "words": [
            {"word": w.word, "start": round(w.start, 2), "end": round(w.end, 2), "prob": round(w.probability, 2)}
            for w in (segment.words or [])
        ]
    })

# Save as JSON
with open("transcript.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nSaved {len(results)} segments to transcript.json")
```

**Generate SRT subtitles:**

```python
"""
generate_srt.py — Convert transcript JSON to SRT subtitle file
"""
import json

def seconds_to_srt_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

with open("transcript.json", "r", encoding="utf-8") as f:
    segments = json.load(f)

with open("subtitles.srt", "w", encoding="utf-8") as f:
    for i, seg in enumerate(segments, 1):
        f.write(f"{i}\n")
        f.write(f"{seconds_to_srt_time(seg['start'])} --> {seconds_to_srt_time(seg['end'])}\n")
        f.write(f"{seg['text']}\n\n")

print(f"Generated subtitles.srt with {len(segments)} entries")
```

**Vietnamese-specific model (higher accuracy):**

```python
# Use VinAI's PhoWhisper for better Vietnamese accuracy
from faster_whisper import WhisperModel

model = WhisperModel("vinai/PhoWhisper-large", device="cuda", compute_type="float16")
segments, info = model.transcribe("audio.wav", language="vi", beam_size=5)
```

---

### 4.2 Production: Real-time Call Center Transcription + Agent Assist

**Level:** Advanced | **Time:** 4 hours | **GPU:** Required

**Architecture:**

```
Phone Call                         Agent Dashboard
    │                                    ▲
    ▼                                    │
┌────────┐   audio chunks    ┌───────────┴──────────┐
│ WebRTC │──────────────────>│  FastAPI + WebSocket  │
│ Client │<──────────────────│  Gateway              │
└────────┘   TTS response    └───────────┬──────────┘
                                         │
                              ┌──────────┼──────────┐
                              ▼          ▼          ▼
                         ┌────────┐ ┌────────┐ ┌────────┐
                         │  ASR   │ │  NLP   │ │  TTS   │
                         │Worker  │ │Worker  │ │Worker  │
                         └───┬────┘ └───┬────┘ └───┬────┘
                             │          │          │
                             └──────────┼──────────┘
                                        ▼
                                   ┌─────────┐
                                   │  Redis   │
                                   │ Streams  │
                                   └─────────┘
```

**Project structure:**

```
call_center/
├── server.py           # FastAPI gateway
├── asr_worker.py       # Streaming ASR processor
├── nlp_worker.py       # Intent + sentiment analysis
├── models.py           # Shared data models
├── config.py           # Configuration
└── requirements.txt
```

**requirements.txt:**

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
websockets==12.0
faster-whisper==1.1.0
redis==5.0.0
transformers==4.45.0
torch==2.4.0
pydantic==2.9.0
numpy==1.26.0
soundfile==0.12.1
```

**config.py:**

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    redis_url: str = "redis://localhost:6379"
    whisper_model: str = "large-v3"
    whisper_device: str = "cuda"
    whisper_compute: str = "float16"
    sample_rate: int = 16000
    chunk_duration_ms: int = 300
    vad_threshold: float = 0.5

settings = Settings()
```

**models.py:**

```python
from pydantic import BaseModel
from enum import Enum

class TranscriptSegment(BaseModel):
    text: str
    start: float
    end: float
    confidence: float
    speaker: str = "unknown"

class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class NLPResult(BaseModel):
    transcript: str
    intent: str
    sentiment: SentimentLabel
    sentiment_score: float
    entities: list[dict] = []
    suggested_response: str = ""

class AgentUpdate(BaseModel):
    session_id: str
    transcript: TranscriptSegment | None = None
    nlp: NLPResult | None = None
    alert: str | None = None
```

**asr_worker.py:**

```python
"""
Streaming ASR worker — processes audio chunks from Redis, publishes transcripts.
"""
import asyncio
import json
import numpy as np
import redis.asyncio as redis
from faster_whisper import WhisperModel
from config import settings

class StreamingASR:
    def __init__(self):
        self.model = WhisperModel(
            settings.whisper_model,
            device=settings.whisper_device,
            compute_type=settings.whisper_compute,
        )
        self.redis = None
        # Buffer per session: accumulate audio until silence detected
        self.buffers: dict[str, list[np.ndarray]] = {}
        self.BUFFER_MAX_SECONDS = 15  # force-flush after 15s

    async def start(self):
        self.redis = redis.from_url(settings.redis_url)
        print("ASR Worker ready. Listening for audio chunks...")

        while True:
            # Block-read from Redis stream
            result = await self.redis.xread(
                {"audio_chunks": "$"}, count=10, block=1000
            )
            for stream, messages in result:
                for msg_id, data in messages:
                    await self.process_chunk(data)

    async def process_chunk(self, data: dict):
        session_id = data[b"session_id"].decode()
        audio_bytes = data[b"audio"]
        is_speech = data.get(b"is_speech", b"1") == b"1"

        audio_np = np.frombuffer(audio_bytes, dtype=np.float32)

        if session_id not in self.buffers:
            self.buffers[session_id] = []

        if is_speech:
            self.buffers[session_id].append(audio_np)

        # Flush buffer on silence or max length
        buffer = self.buffers[session_id]
        total_samples = sum(len(chunk) for chunk in buffer)
        total_seconds = total_samples / settings.sample_rate

        if (not is_speech and buffer) or total_seconds >= self.BUFFER_MAX_SECONDS:
            await self.transcribe_buffer(session_id)

    async def transcribe_buffer(self, session_id: str):
        buffer = self.buffers.pop(session_id, [])
        if not buffer:
            return

        audio = np.concatenate(buffer)
        if len(audio) < settings.sample_rate * 0.3:  # skip < 300ms
            return

        # Run transcription (CPU-bound → run in executor)
        loop = asyncio.get_event_loop()
        segments, info = await loop.run_in_executor(
            None,
            lambda: self.model.transcribe(
                audio,
                language="vi",
                beam_size=3,           # lower beam for speed
                best_of=1,
                without_timestamps=False,
            )
        )

        for segment in segments:
            result = {
                "session_id": session_id,
                "text": segment.text.strip(),
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "confidence": round(segment.avg_logprob, 3),
            }
            # Publish to NLP processing stream
            await self.redis.xadd("transcripts", result)
            print(f"[{session_id}] {segment.text.strip()}")

if __name__ == "__main__":
    worker = StreamingASR()
    asyncio.run(worker.start())
```

**nlp_worker.py:**

```python
"""
NLP worker — reads transcripts, produces intent/sentiment/suggestions.
"""
import asyncio
import json
import redis.asyncio as redis
from transformers import pipeline
from config import settings

class NLPProcessor:
    def __init__(self):
        self.redis = None
        # Load sentiment model (Vietnamese-capable)
        self.sentiment = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
            device=0,
        )
        # Simple intent keywords (replace with trained classifier in production)
        self.intent_keywords = {
            "complaint": ["không hài lòng", "tệ", "chán", "phàn nàn", "lỗi", "hỏng"],
            "inquiry": ["hỏi", "thông tin", "giá", "bao nhiêu", "khi nào"],
            "cancel": ["hủy", "trả lại", "hoàn tiền", "cancel"],
            "purchase": ["mua", "đặt", "order", "thanh toán"],
        }

    async def start(self):
        self.redis = redis.from_url(settings.redis_url)
        print("NLP Worker ready. Listening for transcripts...")

        last_id = "0"
        while True:
            result = await self.redis.xread(
                {"transcripts": last_id}, count=10, block=1000
            )
            for stream, messages in result:
                for msg_id, data in messages:
                    last_id = msg_id
                    await self.process(data)

    async def process(self, data: dict):
        session_id = data[b"session_id"].decode()
        text = data[b"text"].decode()

        if not text.strip():
            return

        # Sentiment
        sent_result = self.sentiment(text[:512])[0]
        stars = int(sent_result["label"][0])  # "1 star" → 1
        sentiment = "negative" if stars <= 2 else "positive" if stars >= 4 else "neutral"

        # Intent detection (keyword-based, swap for ML model in production)
        intent = "general"
        text_lower = text.lower()
        for intent_name, keywords in self.intent_keywords.items():
            if any(kw in text_lower for kw in keywords):
                intent = intent_name
                break

        # Suggested response
        suggestions = {
            "complaint": "Acknowledge the issue. Offer escalation to supervisor.",
            "cancel": "Ask for reason. Offer retention incentive.",
            "inquiry": "Provide requested information clearly.",
            "purchase": "Confirm order details. Upsell if appropriate.",
            "general": "",
        }

        result = {
            "session_id": session_id,
            "transcript": text,
            "intent": intent,
            "sentiment": sentiment,
            "sentiment_score": round(stars / 5.0, 2),
            "suggestion": suggestions.get(intent, ""),
        }

        # Publish to agent dashboard stream
        await self.redis.xadd("agent_updates", {k: str(v) for k, v in result.items()})

        # Alert on negative sentiment
        if sentiment == "negative":
            await self.redis.xadd("alerts", {
                "session_id": session_id,
                "level": "warning",
                "message": f"Negative sentiment detected: {text[:100]}",
            })
            print(f"⚠ ALERT [{session_id}]: Negative sentiment")

        print(f"[{session_id}] intent={intent} sentiment={sentiment} | {text[:60]}")

if __name__ == "__main__":
    worker = NLPProcessor()
    asyncio.run(worker.start())
```

**server.py:**

```python
"""
FastAPI gateway — WebSocket for audio ingestion + agent dashboard.
"""
import asyncio
import json
import uuid
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis
import torch
from config import settings

# Silero VAD for server-side voice activity detection
vad_model, vad_utils = torch.hub.load(
    "snakers4/silero-vad", "silero_vad", trust_repo=True
)
(get_speech_timestamps, _, _, _, _) = vad_utils

app = FastAPI(title="Call Center Speech API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

redis_pool = redis.ConnectionPool.from_url(settings.redis_url)

@app.websocket("/ws/audio/{session_id}")
async def audio_stream(ws: WebSocket, session_id: str = None):
    """Receive audio chunks from client, push to Redis for ASR processing."""
    await ws.accept()
    session_id = session_id or str(uuid.uuid4())
    r = redis.Redis(connection_pool=redis_pool)

    print(f"Audio session started: {session_id}")

    try:
        while True:
            # Receive raw PCM float32 audio chunk
            audio_bytes = await ws.receive_bytes()
            audio_np = np.frombuffer(audio_bytes, dtype=np.float32)

            # VAD check
            audio_tensor = torch.from_numpy(audio_np)
            speech_prob = vad_model(audio_tensor, settings.sample_rate).item()
            is_speech = speech_prob > settings.vad_threshold

            # Push to Redis stream for ASR worker
            await r.xadd("audio_chunks", {
                "session_id": session_id,
                "audio": audio_bytes,
                "is_speech": "1" if is_speech else "0",
            }, maxlen=10000)

    except WebSocketDisconnect:
        print(f"Audio session ended: {session_id}")
    finally:
        await r.aclose()


@app.websocket("/ws/dashboard/{session_id}")
async def agent_dashboard(ws: WebSocket, session_id: str):
    """Stream real-time transcripts + NLP results to agent dashboard."""
    await ws.accept()
    r = redis.Redis(connection_pool=redis_pool)

    last_id = "$"
    try:
        while True:
            # Read agent updates for this session
            result = await r.xread({"agent_updates": last_id}, count=5, block=500)
            for stream, messages in result:
                for msg_id, data in messages:
                    last_id = msg_id
                    msg_session = data.get(b"session_id", b"").decode()
                    if msg_session == session_id:
                        update = {k.decode(): v.decode() for k, v in data.items()}
                        await ws.send_json(update)

            # Also check alerts
            alerts = await r.xread({"alerts": "$"}, count=5, block=100)
            for stream, messages in alerts:
                for msg_id, data in messages:
                    msg_session = data.get(b"session_id", b"").decode()
                    if msg_session == session_id:
                        alert = {k.decode(): v.decode() for k, v in data.items()}
                        await ws.send_json({"type": "alert", **alert})

    except WebSocketDisconnect:
        print(f"Dashboard disconnected: {session_id}")
    finally:
        await r.aclose()


@app.get("/health")
async def health():
    return {"status": "ok", "model": settings.whisper_model}
```

**Running the system:**

```bash
# Terminal 1: Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Terminal 2: API Gateway
uvicorn server:app --host 0.0.0.0 --port 8000

# Terminal 3: ASR Worker
python asr_worker.py

# Terminal 4: NLP Worker
python nlp_worker.py
```

**Client-side audio capture (browser):**

```javascript
// connect_audio.js — Capture mic and stream to server
const session_id = crypto.randomUUID();
const ws = new WebSocket(`ws://localhost:8000/ws/audio/${session_id}`);

const audioCtx = new AudioContext({ sampleRate: 16000 });

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
        const pcm = e.inputBuffer.getChannelData(0); // Float32Array
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(pcm.buffer);
        }
    };

    source.connect(processor);
    processor.connect(audioCtx.destination);
});

// Dashboard connection
const dashboard = new WebSocket(`ws://localhost:8000/ws/dashboard/${session_id}`);
dashboard.onmessage = (e) => {
    const update = JSON.parse(e.data);
    console.log("Agent update:", update);
    // Render to UI: transcript, intent, sentiment, suggestions
};
```

---

## 5. Integration Patterns

### 5.1 Call Center Integration (SIP/WebRTC)

```
PSTN ──> SIP Gateway (Asterisk/FreeSWITCH) ──> Media fork ──> Speech API
                                                    │
                                              RTP audio stream
                                              (G.711 → PCM 16kHz)
```

- Use **Asterisk** `MixMonitor` or **FreeSWITCH** `mod_shout` for audio forking
- Decode G.711 (μ-law/A-law) to PCM before ASR
- Separate channels for caller vs agent (stereo recording)

### 5.2 Voice Assistant Integration (B08 Conversational AI)

```python
# Pattern: ASR → Dialogue Manager → TTS loop
async def voice_assistant_turn(audio_input: bytes) -> bytes:
    # 1. Speech to text
    text = await asr_service.transcribe(audio_input)

    # 2. Dialogue (B08 Conversational AI)
    response_text = await dialogue_manager.process(text)

    # 3. Text to speech
    response_audio = await tts_service.synthesize(response_text, voice="vi-female-01")

    return response_audio
```

### 5.3 Video Conferencing

- Capture per-participant audio tracks (WebRTC `getReceivers()`)
- Run speaker diarization + ASR per track
- Merge into unified timestamped transcript
- Real-time captions via WebVTT over data channel

### 5.4 Vietnamese Platform Integration

| Platform | Method | Audio Format |
|---|---|---|
| Zalo OA | Webhook (voice messages) | AAC/MP4 |
| FPT.AI | REST API | WAV/MP3 |
| VNPT | SIP trunk | G.711 |
| ViettelAI | gRPC stream | PCM 16kHz |

---

## 6. Performance & Cost

### 6.1 ASR Performance Benchmarks

| Model | RTF (GPU) | RTF (CPU) | Vietnamese WER | VRAM |
|---|---|---|---|---|
| `whisper-tiny` | 0.02x | 0.3x | ~35% | 1 GB |
| `whisper-base` | 0.03x | 0.5x | ~28% | 1 GB |
| `whisper-small` | 0.05x | 1.2x | ~20% | 2 GB |
| `whisper-medium` | 0.10x | 3.0x | ~15% | 5 GB |
| `whisper-large-v3` | 0.15x | 8.0x | ~10% | 10 GB |
| `PhoWhisper-large` | 0.16x | 8.5x | ~7% | 10 GB |
| `faster-whisper large-v3` (INT8) | 0.04x | 1.5x | ~10% | 4 GB |

**RTF** = Real-Time Factor. RTF < 1.0 means faster than real-time. Lower is better.

### 6.2 TTS Latency

| Engine | Time-to-First-Audio | Full Sentence (20 words) | VRAM |
|---|---|---|---|
| VITS | ~50ms | ~200ms | 1 GB |
| XTTS v2 | ~150ms | ~800ms | 3 GB |
| ElevenLabs API | ~300ms | ~600ms | 0 (cloud) |
| Google TTS API | ~100ms | ~300ms | 0 (cloud) |

### 6.3 GPU Requirements

| Workload | Minimum GPU | Recommended | Concurrent Streams |
|---|---|---|---|
| Batch transcription | T4 (16GB) | A10G (24GB) | 4-8 files |
| Real-time ASR (large-v3) | T4 (16GB) | L4 (24GB) | 2-4 streams |
| Real-time ASR (small) | RTX 3060 (12GB) | T4 (16GB) | 8-16 streams |
| ASR + TTS combined | A10G (24GB) | A100 (40GB) | 4-8 streams |

### 6.4 Cost Comparison (1,000 hours/month transcription)

| Solution | Monthly Cost | Notes |
|---|---|---|
| Google Cloud STT | ~$960 | $0.016/15s ($0.96/hr) |
| Azure Speech | ~$1,000 | $1.00/hr standard |
| AWS Transcribe | ~$960 | $0.024/15s |
| ElevenLabs (TTS) | ~$330 | $0.30/1K chars, ~1.1K chars/hr |
| Self-hosted (1x A10G) | ~$550 | Cloud GPU instance + ops overhead |
| Self-hosted (1x T4) | ~$350 | Handles ~500 hrs/mo real-time |
| FPT.AI Speech | Contact | Vietnamese-focused pricing |

**Break-even:** Self-hosting beats cloud APIs at roughly **500+ hours/month** of transcription, assuming you have ML ops capability.

---

## 7. Technology Selection Matrix

### 7.1 ASR Selection

| Criteria | faster-whisper | Google STT | Azure STT | FPT.AI | wav2vec2-VN |
|---|---|---|---|---|---|
| **Vietnamese Accuracy** | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| **Multilingual** | ★★★★★ | ★★★★★ | ★★★★★ | ★☆☆☆☆ | ★☆☆☆☆ |
| **Real-time Streaming** | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| **Self-hosted** | ★★★★★ | ☆☆☆☆☆ | ☆☆☆☆☆ | ☆☆☆☆☆ | ★★★★★ |
| **Cost at Scale** | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ | ★★★☆☆ | ★★★★★ |
| **Setup Complexity** | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★★ | ★★☆☆☆ |
| **Custom Vocabulary** | ★★☆☆☆ | ★★★★☆ | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| **Speaker Diarization** | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★☆☆☆ | ☆☆☆☆☆ |

### 7.2 TTS Selection

| Criteria | XTTS v2 | VITS | ElevenLabs | Google TTS | Azure TTS |
|---|---|---|---|---|---|
| **Voice Quality** | ★★★★☆ | ★★★☆☆ | ★★★★★ | ★★★★☆ | ★★★★☆ |
| **Vietnamese** | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ★★★★☆ |
| **Voice Cloning** | ★★★★★ | ☆☆☆☆☆ | ★★★★★ | ☆☆☆☆☆ | ★★★★☆ |
| **Latency** | ★★★☆☆ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★☆ |
| **Self-hosted** | ★★★★★ | ★★★★★ | ☆☆☆☆☆ | ☆☆☆☆☆ | ☆☆☆☆☆ |
| **Cost at Scale** | ★★★★★ | ★★★★★ | ★☆☆☆☆ | ★★★☆☆ | ★★★☆☆ |
| **Streaming** | ★★★★☆ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★★ |

### 7.3 Recommendation Summary

| Scenario | ASR Pick | TTS Pick | Rationale |
|---|---|---|---|
| **Startup / MVP** | faster-whisper (small) | Google TTS API | Low cost, fast setup, no GPU needed for small model |
| **Vietnamese Focus** | PhoWhisper-large or FPT.AI | Azure TTS (vi-VN) | Best Vietnamese accuracy |
| **Enterprise Self-hosted** | faster-whisper (large-v3) on Triton | XTTS v2 | Full control, no API costs, voice cloning |
| **Call Center** | Google STT Streaming | ElevenLabs | Real-time diarization, best voice quality |
| **Budget Batch** | faster-whisper (large-v3) INT8 | VITS | CPU-capable, zero API cost |

---

*Report generated by Dr. Praxis (R-β) for the MAESTRO Knowledge Graph.*
*Baseline B14 — Speech & Audio AI — Technical Implementation Guide.*
