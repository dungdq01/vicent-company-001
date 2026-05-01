# Data Engineer Notes: Speech & Audio AI (B14)

## 1. Audio Data Ingestion

- Support multi-format ingestion: WAV (uncompressed, best for training), MP3 (compressed, common in production), FLAC (lossless compressed, good balance), OGG Vorbis, M4A/AAC
- Use `ffmpeg` or `pydub` as the core transcoding layer to normalize all inputs to a canonical format (typically 16kHz 16-bit mono WAV for ASR training)
- Build format detection and validation at ingestion: check sample rate, channels, bit depth, duration, and file integrity
- Handle edge cases: corrupted headers, truncated files, DRM-protected audio, zero-length files
- Implement chunking for long-form audio (>30 min) at ingestion time with configurable overlap (e.g., 1-second overlap for sentence boundary recovery)

## 2. Transcription Data Management

- Store transcription data in structured formats: JSON with word-level timestamps, CTM (time-marked conversation) for alignment
- Maintain alignment between audio segments and transcription at utterance, word, and phoneme levels
- Version transcription labels alongside audio data — label corrections are frequent in speech projects
- Build annotation pipeline integration: Praat TextGrid, ELAN, Label Studio for human review
- Track inter-annotator agreement (IAA) metrics for transcription quality assurance

## 3. Audio Preprocessing Pipelines

- **Resampling**: Standardize to 16kHz for ASR (Whisper, wav2vec 2.0) or 22.05kHz/24kHz for TTS; use high-quality resampling (e.g., `librosa.resample` with `kaiser_best`)
- **Normalization**: Peak normalization to -1 dBFS or LUFS-based loudness normalization (EBU R128) for consistent volume
- **Silence trimming**: Use energy-based VAD or WebRTC VAD to trim leading/trailing silence; configurable threshold (e.g., -40 dB)
- **Channel handling**: Convert stereo to mono (average or select channel), handle multi-channel recordings (e.g., separate speakers in call center data)
- **DC offset removal**: Apply high-pass filter at 20Hz to remove DC bias
- Pipeline should be idempotent and reproducible — same input always produces same output

## 4. Dataset Versioning for Speech

- Use DVC (Data Version Control) or LakeFS for versioning large audio datasets (often 100GB-1TB+)
- Version both raw audio and derived features (spectrograms, embeddings) separately
- Track metadata: recording conditions, speaker demographics, language/dialect labels, SNR estimates
- Implement data splits (train/val/test) with speaker-disjoint splitting — never leak speakers across splits
- Maintain a manifest file (CSV/JSON) mapping audio paths to transcriptions, speaker IDs, durations, and split assignments

## 5. Vietnamese Speech Corpus Curation

- **VIVOS**: ~15 hours, 65 speakers, read speech, Northern Vietnamese accent — good starting point but limited
- **VLSP**: Annual shared task data, varies by year (2018-2024), includes broadcast news and conversational speech
- **Common Voice (vi)**: Mozilla project, community-contributed, variable quality, ~50 hours validated
- **FPT Open Speech Dataset**: ~25 hours, Northern accent, read speech from news articles
- Curate additional data from YouTube (Vietnamese news, podcasts) with semi-supervised labeling
- Critical: ensure dialect balance — Northern (Hanoi), Central (Hue), Southern (Ho Chi Minh City) representation
- Vietnamese tonal system (6 tones) requires careful transcription — diacritics must be preserved exactly

## 6. Noise Augmentation Pipelines

- Build a noise library: office noise, street noise, cafe chatter, vehicle noise, music, white/pink/brown noise
- Use SNR-controlled mixing: sample SNR uniformly from 5-20 dB for training augmentation
- Room impulse response (RIR) convolution: simulate different acoustic environments
- Implement augmentation as a streaming transform during training (on-the-fly) rather than pre-generating all variants
- Additional augmentations: speed perturbation (0.9x-1.1x), pitch shifting, codec simulation (simulate phone-quality audio)
- Vietnamese-specific: augment with typical Vietnamese environmental sounds (motorbike traffic, market noise)

## 7. Storage Optimization

- Use object storage (S3/MinIO/GCS) for raw audio with lifecycle policies (move old versions to cold storage)
- Store pre-computed features (Mel spectrograms, MFCCs) in efficient formats: NumPy `.npy`, HDF5, or WebDataset (tar-based)
- WebDataset format is optimal for training: sequential tar reads, no random access overhead, works well with PyTorch DataLoader
- Compression strategy: FLAC for archival (lossless, ~50% compression), Opus for production serving (lossy but excellent quality at low bitrate)
- Typical dataset sizes: 1000 hours of 16kHz mono WAV ~ 115 GB; plan storage accordingly
- Implement deduplication: hash-based detection of duplicate audio segments to avoid training bias

## 8. Pipeline Orchestration

- Use Airflow or Prefect for batch processing pipelines (ingestion, preprocessing, feature extraction)
- Streaming ingestion: Kafka or Redis Streams for real-time audio data flowing from production ASR
- Monitor pipeline health: track processing latency, failure rates, data quality metrics per batch
- Implement data quality gates: reject audio with SNR < 5 dB, duration < 0.5s, or missing transcription

## 9. Data Quality and Monitoring

- Implement automated data quality checks: SNR estimation, speaker count verification, language ID confirmation
- Track dataset statistics over time: total hours, speaker count, dialect distribution, domain coverage
- Flag anomalies: sudden changes in audio quality, unexpected language mixing, recording equipment changes
- Build a data dashboard: visualize dataset composition, identify gaps in coverage (e.g., underrepresented age groups)
- Feedback loop: integrate production ASR errors back into the data pipeline for targeted data collection

## Recommendations

1. Standardize on 16kHz 16-bit mono WAV as the canonical training format; transcode everything at ingestion
2. Invest heavily in Vietnamese dialect-balanced data collection — this is the primary bottleneck for Vietnamese ASR quality
3. Use WebDataset format for training data to maximize GPU utilization (I/O is often the bottleneck in speech training)
4. Implement speaker-disjoint splits from day one — retrofitting is painful
5. Build noise augmentation as a configurable, reproducible pipeline with version-controlled noise libraries
6. Plan for 2-5 TB storage for a production Vietnamese speech system (raw + features + augmented)
7. Track data lineage end-to-end: from raw recording to training sample, every transform must be logged
