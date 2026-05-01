# Solution Architect Notes: Speech & Audio AI (B14)

## 1. Reference Architecture: Transcription Service

- **Components**: Audio ingestion API → preprocessing → ASR engine → post-processing (punctuation, NER) → output API
- Ingestion: REST API for file upload (batch), WebSocket for streaming; audio stored in object storage
- ASR engine: GPU-backed inference cluster running Whisper or Conformer models behind a load balancer
- Post-processing: punctuation restoration, capitalization, PII redaction, speaker diarization
- Output: JSON with word-level timestamps, SRT/VTT subtitles, plain text; webhook notification for batch
- Storage: PostgreSQL for metadata and job tracking, object storage (S3/MinIO) for audio files and results
- Scale: each A10G GPU handles ~50 concurrent batch streams or ~15 real-time streaming sessions
- Cost estimate: ~$0.01-0.03 per minute of transcribed audio (GPU + infrastructure)

## 2. Reference Architecture: Voice Assistant

- **Components**: Wake word → VAD → streaming ASR → NLU → dialog manager → TTS → audio output
- Wake word detection: lightweight on-device model (Porcupine, custom keyword spotting); always listening
- Streaming ASR: RNN-T or chunked Conformer for low-latency speech-to-text
- NLU pipeline: intent classification + entity extraction; can use LLM for complex understanding
- Dialog manager: state machine or LLM-based; maintains conversation context
- TTS: VITS or cloud TTS for response generation; cache common responses
- End-to-end latency target: <1.5s from end of speech to start of TTS response
- Edge-cloud hybrid: wake word + VAD on device, ASR + NLU + TTS on cloud

## 3. Reference Architecture: Call Center AI

- **Components**: telephony gateway → AEC/noise reduction → real-time ASR → analytics engine → agent assist UI
- Telephony integration: SIP trunk from PBX, WebRTC for browser-based agents, SRTP for encryption
- Dual-channel recording: separate customer and agent audio for diarization-free processing
- Real-time analytics: sentiment detection, topic classification, compliance keyword detection
- Agent assist: real-time transcription display, suggested responses, knowledge base lookup
- Post-call processing: full transcription, summary generation (LLM), quality scoring, compliance audit
- Integration points: CRM (Salesforce, Zoho), ticketing (Zendesk), workforce management
- Scale: 100-500 concurrent calls typical for Vietnamese enterprise; plan for 1000+ for telcos

## 4. Technology Selection: Whisper vs Cloud ASR vs On-Premise

- **Whisper (self-hosted)**: Best for Vietnamese customization, data privacy, cost at scale (>100K min/month)
- **Google Speech-to-Text**: Good Vietnamese support, managed service, pay-per-use; best for low volume (<10K min/month)
- **Azure Speech**: Strong enterprise integration, custom speech models, good Vietnamese; best for Microsoft shops
- **AWS Transcribe**: Vietnamese support added 2024; good for AWS-native architectures
- **On-premise (self-hosted)**: Required for data sovereignty, air-gapped environments, latency-sensitive edge
- Decision matrix: volume (>100K min/month favors self-hosted), customization needs, data sensitivity, team capability
- Hybrid approach: cloud ASR for development/prototyping, migrate to self-hosted for production cost savings
- Vietnamese-specific: self-hosted Whisper fine-tuned on Vietnamese typically outperforms cloud APIs for domain-specific content

## 5. Streaming vs Batch Tradeoffs

- **Streaming**: Real-time results, higher infrastructure cost, requires persistent connections, latency-constrained
- **Batch**: Higher throughput, lower cost, simpler infrastructure, no latency requirement
- Streaming use cases: live captioning, voice assistants, real-time call analytics, dictation
- Batch use cases: podcast transcription, meeting recordings, media archival, compliance review
- Cost difference: streaming is 3-5x more expensive per audio minute due to GPU reservation
- Architecture difference: streaming requires WebSocket/gRPC infrastructure; batch uses job queue + worker pattern
- Quality: batch mode can use bidirectional models (see full context) → 5-10% better WER than streaming
- Recommendation: build batch pipeline first (simpler, validates model quality), add streaming when needed

## 6. Integration with Telephony (SIP, WebRTC)

- **SIP (Session Initiation Protocol)**: Standard for enterprise telephony; integrate via SIP trunk
- Use FreeSWITCH or Asterisk as media gateway: terminate SIP, extract audio stream, forward to ASR
- **WebRTC**: Browser-based real-time communication; use for web-based call center agents
- WebRTC audio: Opus codec, 48kHz (downsample to 16kHz for ASR), built-in AEC and noise suppression
- Media forking: duplicate audio stream from PBX to ASR pipeline without disrupting the call
- SRTP: encrypted media stream; decrypt at the media gateway before forwarding to ASR
- DTMF handling: detect and process touch-tone inputs alongside speech recognition
- Vietnamese telecom integration: Viettel, VNPT, Mobifone SIP trunks; standard SIP protocols supported

## 7. Enterprise Deployment Patterns

- **Multi-tenant SaaS**: Shared infrastructure, tenant-isolated data, per-tenant model customization
- **Dedicated deployment**: Single-tenant infrastructure for large enterprise; full data isolation
- **Hybrid cloud**: ASR inference on-premise (data sensitivity), management plane in cloud
- **Edge + cloud**: Edge devices handle VAD/wake word, cloud handles full ASR/TTS
- Model management: version control, A/B testing, gradual rollout, rollback capability
- API gateway: authentication, rate limiting, usage tracking, billing integration
- High availability: multi-AZ deployment, automatic failover, 99.9% uptime SLA target
- Disaster recovery: warm standby in secondary region, RPO <1 hour, RTO <4 hours

## 8. Capacity Planning and Cost Modeling

- GPU cost dominates: 60-80% of total infrastructure cost for speech services
- A10G (~$0.75/hr) handles: 50 batch streams OR 15 real-time streams OR 30 TTS requests concurrent
- Cost per minute of transcription: $0.006-0.01 (self-hosted at scale) vs $0.016-0.024 (cloud API)
- Break-even for self-hosted vs cloud: typically at 50K-100K minutes/month
- Storage cost: negligible compared to compute; ~$23/TB/month for S3
- Network cost: ~$0.09/GB egress; audio is small (~2MB per minute of WAV)
- Team cost: self-hosted requires 2-3 ML engineers + 1-2 DevOps; factor into total cost comparison
- Vietnamese market pricing: enterprise customers expect $0.01-0.02/minute for ASR; margin requires scale

## Recommendations

1. Start with batch transcription architecture — it validates model quality and is simpler to build and operate
2. Use Whisper fine-tuned on Vietnamese for any deployment processing >50K minutes/month
3. For call center AI, dual-channel recording eliminates the need for speaker diarization — design for it from the start
4. Build telephony integration on FreeSWITCH — it is the most flexible open-source media gateway
5. Plan GPU capacity for 2x expected peak — speech workloads are bursty and GPU procurement has lead times
6. Offer both cloud API and on-premise deployment options — Vietnamese enterprises increasingly require data sovereignty
7. Price Vietnamese ASR services at $0.01-0.015/minute to be competitive while maintaining margin at scale
