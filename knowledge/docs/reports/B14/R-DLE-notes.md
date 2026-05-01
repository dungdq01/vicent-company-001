# Deep Learning Engineer Notes: Speech & Audio AI (B14)

## 1. Transformer vs Conformer for ASR

- **Transformer**: Self-attention captures long-range dependencies; standard architecture for sequence-to-sequence ASR
- **Conformer**: Combines convolution (local patterns) + self-attention (global patterns); state-of-the-art for ASR
- Conformer block: Feed-Forward → Multi-Head Self-Attention → Convolution → Feed-Forward (macaron structure)
- Conformer outperforms Transformer by 10-15% relative WER on most benchmarks
- Convolution module uses depthwise separable convolution with kernel size 31 for capturing local acoustic features
- For Vietnamese ASR: Conformer is preferred — tonal patterns benefit from local convolution features
- Model sizes: Conformer-S (10M), Conformer-M (30M), Conformer-L (118M) — scale based on data and compute budget
- Relative positional encoding (Rotary or Shaw) preferred over absolute for variable-length audio

## 2. CTC vs Attention vs RNN-T

- **CTC (Connectionist Temporal Classification)**: Monotonic alignment, fast decoding, no autoregressive dependency; good for streaming
- **Attention (Seq2Seq)**: Flexible alignment, handles non-monotonic mappings, slower decoding; best quality for offline
- **RNN-T (Recurrent Neural Network Transducer)**: Streaming-capable, models output dependencies, industry standard for on-device ASR
- **Hybrid CTC/Attention**: Use CTC loss as auxiliary (weight 0.3) during training, attention for decoding; best of both worlds
- CTC decoding is embarrassingly parallel — ideal for batch processing; RNN-T decoding is sequential
- For production Vietnamese ASR: RNN-T for streaming, hybrid CTC/Attention for offline batch processing
- CTC requires longer encoder output — typically use 4x subsampling (conv layers) to reduce sequence length
- Beam search with language model shallow fusion improves all approaches by 5-15% relative WER

## 3. Self-Supervised Pre-Training

- **wav2vec 2.0**: Contrastive learning on masked latent speech representations; pre-train on unlabeled audio
- **HuBERT**: Iterative clustering of hidden units as pseudo-labels; often outperforms wav2vec 2.0
- **WavLM**: Extends HuBERT with denoising objective; better for noisy/multi-speaker scenarios
- **data2vec 2.0**: Multi-modal framework, efficient pre-training with contextualized targets
- Pre-training on 10K+ hours of unlabeled Vietnamese audio dramatically reduces labeled data needs
- With self-supervised pre-training + 10 hours labeled data, can achieve WER comparable to 100 hours supervised
- Fine-tuning protocol: add CTC head, freeze feature extractor for first 10K steps, then unfreeze all
- Vietnamese unlabeled audio sources: YouTube (news, podcasts), radio broadcasts, audiobooks — easily 10K+ hours available

## 4. VITS / NaturalSpeech for TTS

- **VITS**: End-to-end TTS combining VAE, normalizing flows, and adversarial training; single-stage, no separate vocoder
- Architecture: text encoder → stochastic duration predictor → flow-based decoder → HiFi-GAN decoder
- VITS achieves near-human naturalness (MOS ~4.4) with fast inference
- **NaturalSpeech 2/3**: Diffusion-based, zero-shot voice cloning, superior prosody modeling
- NaturalSpeech 3 uses factorized codec-based diffusion for disentangled speech generation
- For Vietnamese: VITS is the practical choice — well-documented, efficient, good quality
- Vietnamese phonemizer is critical: must handle tone marks, consonant clusters, regional pronunciation variants
- Multi-speaker VITS: add speaker embedding lookup table; 20+ speakers for good generalization

## 5. HiFi-GAN Vocoder

- Converts mel-spectrograms to raw waveforms; state-of-the-art neural vocoder
- Architecture: transposed convolution upsampling + multi-receptive field fusion (MRF) blocks
- Generator + multi-period discriminator (MPD) + multi-scale discriminator (MSD)
- Real-time factor: ~10x faster than real-time on GPU, ~0.5-1x on CPU (sufficient for most applications)
- Training: ~500K steps on 200+ hours of audio, LSGAN loss + mel-spectrogram reconstruction loss
- HiFi-GAN V1 (largest), V2 (medium), V3 (smallest) — V1 for quality, V3 for speed
- Fine-tune universal HiFi-GAN on target speaker for best quality; 1-2 hours of speaker data sufficient
- Alternative vocoders: BigVGAN (better quality, slower), Vocos (faster, competitive quality)

## 6. Streaming ASR with Chunked Attention

- Standard self-attention sees full sequence — incompatible with streaming (requires full utterance)
- **Chunked attention**: Process audio in fixed-size chunks (e.g., 640ms) with limited left context
- **Emformer**: Efficient memory transformer with memory bank for streaming; used in torchaudio
- **Zipformer**: Optimized architecture with temporal downsampling at multiple scales; strong streaming results
- Latency-quality tradeoff: larger chunks = better quality, higher latency; 320-960ms is the practical range
- Look-ahead: allow 1-2 future chunks for better accuracy at the cost of added latency
- Endpointer integration: detect end-of-utterance to finalize partial hypotheses
- For Vietnamese: chunk boundaries should respect syllable boundaries (~200-400ms per syllable)

## 7. Quantization for Real-Time Inference

- **INT8 quantization**: 2-4x speedup, <1% WER degradation; use dynamic quantization for attention, static for conv
- **INT4 / GPTQ**: 4x memory reduction; acceptable for Whisper-medium and larger models
- **ONNX Runtime**: Best cross-platform inference engine; supports INT8/FP16 on CPU and GPU
- **TensorRT**: NVIDIA-specific, best GPU performance; 2-5x faster than PyTorch for Conformer models
- **CTranslate2**: Optimized for Transformer models; excellent Whisper inference performance (4-8x faster)
- Quantization-aware training (QAT) recovers most quality loss compared to post-training quantization
- Profile inference: encoder is compute-bound (benefits from quantization), decoder is memory-bound (benefits from batching)
- For edge deployment: INT8 ONNX on mobile, INT4 for IoT devices with <1GB RAM

## 8. GPU vs CPU Deployment Tradeoffs

- **GPU**: Required for real-time streaming ASR with >10 concurrent users; batch inference 10-50x faster
- **CPU**: Viable for small-scale deployment (<5 concurrent streams) with optimized models (INT8, CTranslate2)
- Cost comparison: 1x A10G GPU (~$0.75/hr) handles ~50 concurrent ASR streams; equivalent CPU cost ~$5/hr
- CPU advantages: no GPU driver management, wider hardware availability, easier containerization
- Whisper-small INT8 on CPU: real-time factor ~0.3x (processes 1s audio in 0.3s) — sufficient for batch
- Whisper-large on GPU: real-time factor ~0.05x (processes 1s audio in 50ms) — required for streaming
- Hybrid approach: GPU for real-time streaming, CPU for batch transcription (cost-optimized)
- Edge devices: Jetson Orin Nano handles Whisper-small in real-time; Raspberry Pi 5 handles Whisper-tiny only

## Recommendations

1. Use Conformer architecture for new ASR projects — the convolution module is critical for tonal language features
2. Hybrid CTC/Attention for offline, RNN-T for streaming — do not try to use one architecture for both
3. Invest in self-supervised pre-training on unlabeled Vietnamese audio — 10K hours is achievable and transformative
4. VITS is the pragmatic TTS choice for Vietnamese; NaturalSpeech for research or when zero-shot cloning is needed
5. CTranslate2 or TensorRT for production Whisper inference — raw PyTorch is 4-8x slower
6. Quantize to INT8 as default for deployment; INT4 only for edge devices where memory is the constraint
7. Profile your workload carefully before choosing GPU vs CPU — batch workloads often do not justify GPU cost
