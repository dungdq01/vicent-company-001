# QA Engineer Notes: Speech & Audio AI (B14)

## 1. ASR Accuracy Testing (WER by Accent/Dialect)

- Build test sets segmented by accent: Northern (Hanoi standard), Central (Hue, Da Nang), Southern (Ho Chi Minh City)
- Minimum 2 hours per dialect in the test set; balanced by gender, age group, and speaking style
- Compute WER/CER per segment; report as a matrix: dialect x domain (news, conversation, medical, technical)
- Track tone error rate separately: percentage of syllables where tone is incorrectly transcribed
- Regression threshold: any model update must not increase WER by >1% absolute on any dialect segment
- Automated test pipeline: run full evaluation suite on every model update; block deployment on regression
- Compare against baselines: Google Speech-to-Text (vi), Azure Speech (vi), and previous internal model version
- Edge cases to test: mumbling, fast speech (>200 wpm), whispered speech, elderly speakers, children

## 2. TTS Naturalness Evaluation (MOS Scores)

- **MOS testing protocol**: 20+ listeners rate samples on 1-5 scale; minimum 50 utterances per condition
- Categories: naturalness, intelligibility, speaker similarity (for voice cloning), prosody appropriateness
- Use DNSMOS or UTMOS for automated MOS estimation during development; human MOS for release decisions
- A/B testing: present two audio samples (current vs new model), ask listeners to prefer one
- Vietnamese-specific: evaluate tone correctness — a natural-sounding but tonally wrong utterance is a failure
- Test Vietnamese text normalization: numbers (1.234.567 vs one million two hundred...), dates, abbreviations
- Evaluate at multiple speaking rates: 0.8x, 1.0x, 1.2x speed should all sound natural
- Test long-form synthesis (>2 minutes): check for quality degradation, unnatural pauses, or repetition

## 3. Regression Testing for Model Updates

- Maintain a golden test set: 500-1000 utterances with verified ground truth transcriptions
- Automated regression suite runs on every model commit; results tracked in MLflow or W&B
- Test categories: accuracy (WER/CER), latency (inference time per second of audio), memory usage
- Side-by-side comparison: generate diff of transcription outputs between old and new model
- Flag utterances where new model is worse — manual review before deployment approval
- Performance benchmarks: track model size, VRAM usage, throughput (audio seconds per second)
- Integration tests: verify API contracts, WebSocket streaming behavior, error handling
- Canary deployment: route 5% of production traffic to new model, monitor for 24 hours before full rollout

## 4. Latency Testing for Real-Time ASR

- Define latency SLAs: time from audio chunk sent to transcription result received
- Targets: P50 < 300ms, P95 < 500ms, P99 < 1000ms for real-time streaming ASR
- Load testing: simulate 10, 50, 100, 500, 1000 concurrent streams; measure latency at each level
- Use tools: Locust or k6 with WebSocket plugin for load generation
- Test scenarios: ramp-up (gradual increase in streams), spike (sudden 10x increase), sustained load
- Measure component-wise: network latency, audio buffer time, inference time, post-processing time
- GPU saturation testing: find the breaking point where latency exceeds SLA under load
- Geographic latency: test from different regions if serving Vietnamese users (Hanoi, HCMC, Da Nang)

## 5. Noise Robustness Testing

- Prepare test sets at controlled SNR levels: clean, 20dB, 15dB, 10dB, 5dB, 0dB
- Noise types: white noise, office babble, street traffic, cafe, music, Vietnamese market sounds
- Report WER degradation curve: WER vs SNR for each noise type
- Acceptance criteria: WER at 10dB SNR should be within 2x of clean WER
- Test with real-world recordings, not just synthetically added noise
- Reverberant conditions: test in simulated rooms with RT60 = 0.3s, 0.6s, 1.0s
- Phone-quality audio: test with 8kHz G.711 codec simulation — common in call center applications
- Multi-talker scenarios: test with overlapping speech from 2-3 speakers

## 6. Vietnamese Dialect Coverage Testing

- **Northern (Bac)**: Standard Vietnamese; most training data available; baseline accuracy should be highest
- **Central (Trung)**: Distinct vowel system, different tonal patterns; often underrepresented in training data
- **Southern (Nam)**: Merged tones (hoi/nga), different consonant pronunciation; largest population
- Test pronunciation variants: "r" vs "g/z" (Northern vs Southern), "s" vs "x" distinction
- Evaluate proper noun recognition: Vietnamese names vary by region
- Test with speakers from multiple provinces within each region — not just major cities
- Track per-dialect improvement across model versions; ensure no dialect is left behind
- Recruit native speakers from each dialect region for test data collection and MOS evaluation

## 7. Edge Case Testing

- **Code-switching (Vietnamese-English)**: "Toi muon book mot phong" — ASR must handle mixed language
- **Numeric expressions**: phone numbers, currency (500.000 VND), dates (ngay 15 thang 3)
- **Proper nouns**: foreign names, brand names, technical terms not in Vietnamese vocabulary
- **Disfluencies**: "um", "ah", repeated words, false starts — should be transcribed or filtered based on config
- **Homophones with different tones**: ma (ghost), ma (mother), ma (horse), ma (grave), ma (but), ma (rice seedling)
- **Long utterances**: test with continuous speech >5 minutes without pauses
- **Silence handling**: long silences (>5s), intermittent speech, background-only audio
- **Adversarial inputs**: non-speech audio (music, animal sounds), extremely loud/quiet audio, corrupted files
- **Punctuation and capitalization**: verify correct sentence boundary detection and capitalization for Vietnamese

## Recommendations

1. Build dialect-segmented test sets as the foundation of all ASR quality evaluation
2. Automate regression testing in CI/CD — never deploy a model without passing the full evaluation suite
3. Human MOS evaluation is required for TTS release decisions — automated metrics are insufficient
4. Load test WebSocket streaming at 2x expected peak capacity to ensure headroom
5. Noise robustness at 10dB SNR is the minimum bar for production deployment
6. Vietnamese code-switching with English is extremely common — dedicate specific test coverage to it
7. Track per-dialect WER trends over time — ensure model improvements benefit all dialects equally
