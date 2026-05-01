# Audio Engineer Notes: Speech & Audio AI (B14)

## 1. Sampling Rates and Bit Depth

- **8 kHz**: Telephony standard (G.711); sufficient for basic speech intelligibility but loses high-frequency consonants
- **16 kHz**: Standard for ASR training and inference; captures speech frequencies up to 8 kHz (Nyquist)
- **22.05 kHz / 24 kHz**: Common for TTS output; provides natural-sounding speech with full frequency range
- **44.1 kHz / 48 kHz**: Studio quality; unnecessary for speech AI but may be the source format
- **Bit depth**: 16-bit PCM is standard for speech; 24-bit for studio recording; 32-bit float for intermediate processing
- Always process internally at higher precision (float32) and quantize only at output
- Resampling must use anti-aliasing filters to prevent artifacts; librosa and sox handle this correctly
- Vietnamese speech: fundamental frequency ranges 80-400 Hz; tonal F0 contours well-captured at 16 kHz

## 2. Audio Codecs

- **PCM/WAV**: Uncompressed, lossless; use for training data and intermediate processing
- **FLAC**: Lossless compression, ~50-60% size reduction; ideal for archival and dataset distribution
- **Opus**: Best lossy codec for speech; excellent quality at 16-32 kbps; mandatory for WebRTC streaming
- **AAC**: Good quality at higher bitrates (64-128 kbps); widely supported on iOS/Android
- **MP3**: Legacy format; acceptable at 128+ kbps but Opus is strictly superior for speech
- **Speex**: Deprecated; was designed for speech but Opus replaced it entirely
- Codec artifacts can degrade ASR: train models with codec-augmented data for robustness
- For production streaming: Opus at 24 kbps mono provides excellent speech quality with minimal bandwidth

## 3. Noise Reduction Techniques

- **Spectral gating**: Estimate noise profile from silent segments, subtract from signal; simple but effective for stationary noise
- **RNNoise**: Mozilla real-time noise suppression using GRU neural network; runs on CPU, ~5% CPU per stream
- **DTLN (Dual-signal Transformation LSTM Network)**: Real-time, low-latency denoising; good for mobile
- **DeepFilterNet**: State-of-the-art deep learning noise suppression; better quality than RNNoise, higher compute
- **Wiener filtering**: Classical approach; optimal for stationary Gaussian noise, poor for non-stationary
- Apply noise reduction before ASR for best results, but train ASR on both clean and noisy data
- Aggressive noise reduction can remove speech components — tune suppression level based on downstream task
- Vietnamese-specific: tonal F0 contours must be preserved during denoising; overly aggressive suppression can flatten tones

## 4. Echo Cancellation (AEC)

- Echo occurs when speaker output feeds back into microphone — critical for duplex voice applications
- **Linear AEC**: Adaptive filter (NLMS, RLS) models the echo path; handles linear echo well
- **Non-linear AEC**: Neural network-based; handles speaker distortion and non-linear amplifier effects
- **WebRTC AEC3**: Google production AEC available in the WebRTC library; good baseline
- **SpeexDSP AEC**: Open-source, CPU-efficient; adequate for simple scenarios
- Key parameters: tail length (typically 128-512ms), adaptation rate, double-talk detection
- For voice assistants: AEC is mandatory — the device plays TTS while listening for wake word
- Test with diverse playback devices — echo characteristics vary dramatically between speakers

## 5. Microphone Array Processing

- **Beamforming**: Combine signals from multiple microphones to enhance target direction and suppress noise
- **Delay-and-sum**: Simplest beamformer; align signals by time delay, average; 3 dB SNR improvement per doubling of mics
- **MVDR (Minimum Variance Distortionless Response)**: Optimal beamformer; maximizes SNR while preserving target
- **GEV (Generalized Eigenvalue)**: Uses neural network mask estimation for steering; state-of-the-art
- Far-field ASR (>1m distance): requires 4-7 mic array; achieves 5-10 dB SNR improvement
- Near-field (phone, headset): single mic sufficient; focus on noise reduction and AEC instead
- Direction of arrival (DOA) estimation: enables speaker localization for multi-speaker scenarios

## 6. Audio Quality Metrics

- **PESQ (Perceptual Evaluation of Speech Quality)**: ITU-T P.862; score range 1.0-4.5; gold standard for telephony
- **POLQA**: ITU-T P.863; successor to PESQ; handles super-wideband and fullband audio
- **STOI (Short-Time Objective Intelligibility)**: Predicts human intelligibility; range 0-1; correlates well with listening tests
- **SI-SDR (Scale-Invariant Signal-to-Distortion Ratio)**: Used for source separation evaluation; in dB
- **MOS (Mean Opinion Score)**: Human subjective rating 1-5; essential for TTS evaluation; expensive to collect
- **DNSMOS**: Microsoft neural MOS predictor; approximates human MOS without listeners; useful for large-scale eval
- **SNR**: Basic metric; compute from VAD-segmented speech vs non-speech regions
- For production monitoring: track PESQ/STOI on a sample of audio; alert on degradation trends

## 7. Room Acoustics Impact on ASR

- **RT60 (Reverberation Time)**: Time for sound to decay by 60 dB; <0.5s ideal for ASR, >1.0s severely degrades WER
- **DRR (Direct-to-Reverberant Ratio)**: Higher is better for ASR; <0 dB means reverberant energy dominates
- Early reflections (0-50ms) generally help speech intelligibility; late reflections (>80ms) hurt
- Dereverberation algorithms: WPE (Weighted Prediction Error) is the standard approach
- Train ASR with RIR augmentation: simulate rooms with RT60 from 0.2-1.0s for robustness
- Practical impact: moving from a quiet office (RT60=0.3s) to a conference room (RT60=0.8s) can double WER
- For Vietnamese deployment: typical office environments have moderate acoustics (RT60 0.4-0.7s)

## 8. Vietnamese Tonal Characteristics Affecting Audio Processing

- Vietnamese has 6 tones: ngang (level), sac (rising), huyen (falling), hoi (dipping-rising), nga (rising glottalized), nang (falling glottalized)
- Tones are carried by F0 (fundamental frequency) contours over syllable duration (150-400ms)
- F0 range: male 80-200 Hz, female 150-400 Hz; tonal excursion can be 50-100 Hz
- Glottalized tones (nga, nang) have distinctive creaky voice quality — spectral features beyond F0
- Audio processing must preserve F0 with high fidelity — pitch-shifting must be used carefully
- Noise reduction that distorts F0 contours will cause tone confusion and word errors in ASR
- Regional tone differences: Southern Vietnamese merges hoi/nga tones — affects both ASR and TTS design

## Recommendations

1. Standardize on Opus codec for all real-time speech streaming — designed for speech, outperforms alternatives
2. Use RNNoise or DeepFilterNet as preprocessing before ASR — significant WER improvement in noisy conditions
3. Always augment ASR training with room impulse responses and codec simulation
4. Monitor audio quality metrics (PESQ, STOI) in production to detect degradation early
5. Vietnamese tone preservation must be validated in every audio processing step
6. For far-field applications, invest in mic array + neural beamforming; for near-field, focus on AEC and denoising
7. Profile the actual deployment environment acoustics — room acoustics are often the biggest uncontrolled variable
