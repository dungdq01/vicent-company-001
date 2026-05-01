# ML Engineer Notes: Speech & Audio AI (B14)

## 1. Fine-Tuning Whisper for Vietnamese

- Start from `whisper-large-v3` — best multilingual baseline; Vietnamese is included but underperforms vs English
- Fine-tune on Vietnamese-specific data using LoRA or full fine-tuning depending on data volume
- For <100 hours: LoRA (rank 16-64) on attention layers, freeze encoder first 12 layers
- For >500 hours: full fine-tuning with lower learning rate (1e-5) and warm-up
- Use Whisper's built-in tokenizer — it handles Vietnamese diacritics but may need vocabulary expansion for domain terms
- Training setup: bf16, batch size 16-32 (gradient accumulation), AdamW, linear decay schedule
- Fine-tuning typically reduces WER from ~25% (base Whisper on Vietnamese) to ~10-12% on clean speech
- Key hyperparameters: learning rate (1e-5 to 5e-5), warmup steps (500-1000), max audio length (30s default)

## 2. ASR Evaluation Metrics

- **WER (Word Error Rate)**: Primary metric; computed as (S+D+I)/N where S=substitutions, D=deletions, I=insertions, N=reference words
- **CER (Character Error Rate)**: More appropriate for Vietnamese due to monosyllabic word structure; less sensitive to tokenization
- **SER (Sentence Error Rate)**: Percentage of sentences with any error — useful for user-facing quality assessment
- Vietnamese-specific: evaluate tone accuracy separately — a word with wrong tone is a different word entirely
- Segment by domain (news, conversation, medical), noise level (clean/noisy), and dialect (Northern/Central/Southern)
- Use `jiwer` library for WER/CER computation with proper Vietnamese text normalization

## 3. TTS Model Training

- Modern approach: end-to-end models (VITS, NaturalSpeech) that jointly learn alignment, acoustic model, and vocoder
- Data requirements: 10-20 hours of single-speaker clean speech for a good single-speaker TTS
- Multi-speaker TTS: 50-100 hours across 20+ speakers with speaker embeddings (d-vector or x-vector)
- Vietnamese TTS challenges: correct tone generation is critical — wrong tone = wrong word
- Training pipeline: text normalization → phoneme conversion (Vietnamese g2p) → acoustic model → vocoder
- Evaluate with MOS (Mean Opinion Score) from human listeners; target MOS > 4.0 for production quality
- Use Vietnamese-specific text normalization: number reading rules, abbreviation expansion, date/currency formats

## 4. Speaker Verification Model Training

- Architecture: ECAPA-TDNN or ResNet-based speaker encoders producing fixed-dimension embeddings (192 or 256-dim)
- Training with AAM-Softmax or Sub-center ArcFace loss on speaker classification task
- Data: VoxCeleb1+2 for pre-training (~7000 speakers), fine-tune on Vietnamese speaker data
- Evaluation metrics: EER (Equal Error Rate), minDCF; target EER < 2% for production
- Enrollment: collect 10-30 seconds of speech per speaker, compute average embedding
- Verification: cosine similarity or PLDA scoring between enrollment and test embeddings
- Augment training data with noise, RIR, and codec simulation to improve robustness

## 5. Transfer Learning: English to Vietnamese

- English ASR models (trained on 100K+ hours) provide strong feature extractors for Vietnamese
- Strategy: initialize encoder from English model, train decoder/head on Vietnamese data
- wav2vec 2.0 / HuBERT pre-trained on English still transfer well to Vietnamese — shared acoustic features
- Fine-tune progressively: first train only the linear head (CTC), then unfreeze top encoder layers
- Cross-lingual transfer works because low-level acoustic features (formants, energy, rhythm) are language-agnostic
- Vietnamese-specific adaptation needed primarily in the decoder/language model components
- Expect 30-50% relative WER reduction vs training from scratch with limited Vietnamese data (<50 hours)

## 6. Data Augmentation Techniques

- **Speed perturbation**: 0.9x, 1.0x, 1.1x — effectively triples training data; most impactful single augmentation
- **Noise injection**: Add noise at SNR 5-20 dB from diverse noise corpus; critical for real-world robustness
- **SpecAugment**: Mask time and frequency bands in spectrogram; 1-2 time masks (width 0-100), 1-2 freq masks (width 0-27)
- **Room simulation**: Convolve with room impulse responses (RIRs) from various room sizes
- **Codec augmentation**: Simulate telephone quality (8kHz, G.711 codec) for call center applications
- **Pitch shifting**: +/- 2 semitones; use cautiously for tonal languages like Vietnamese (may change meaning)
- Apply augmentations on-the-fly during training to maximize diversity without storage overhead
- Combination matters: speed perturbation + SpecAugment + noise injection is the standard winning combination

## 7. Model Distillation for Edge Deployment

- Distill Whisper-large (1.5B params) to Whisper-small (244M) or Whisper-tiny (39M) using knowledge distillation
- Teacher-student framework: minimize KL divergence between teacher and student output distributions
- Distilled Whisper-small can achieve 80-85% of Whisper-large quality at 6x faster inference
- Additional compression: INT8 quantization (minimal quality loss), INT4 (some quality loss, 4x smaller)
- Pruning: remove 30-50% of attention heads with minimal WER degradation
- Target platforms: mobile (ONNX Runtime, TensorFlow Lite), edge devices (Raspberry Pi, Jetson Nano)
- For Vietnamese specifically: a distilled model fine-tuned on Vietnamese often outperforms the general large model

## 8. Training Infrastructure

- Single-speaker TTS: 1x A100 for 2-3 days
- Whisper fine-tuning: 2-4x A100 for 1-2 days on 500 hours
- Speaker verification: 4x A100 for 3-5 days on VoxCeleb
- Use mixed precision (bf16) throughout; gradient checkpointing for memory-constrained setups
- Experiment tracking: W&B or MLflow — log WER curves, audio samples, loss curves

## Recommendations

1. Start with Whisper-large-v3 fine-tuning — it is the fastest path to production-quality Vietnamese ASR
2. Always evaluate WER segmented by dialect and domain; aggregate WER hides critical weaknesses
3. Speed perturbation + SpecAugment + noise injection should be the default augmentation stack
4. For TTS, invest in high-quality single-speaker recording (professional studio) — data quality beats quantity
5. Distill models early for edge deployment; do not wait until the end of the project
6. Build a Vietnamese-specific evaluation set covering all 3 major dialects with balanced representation
7. Track CER alongside WER for Vietnamese — CER is often more informative for tonal language evaluation
