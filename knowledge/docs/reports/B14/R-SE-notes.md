# Security Engineer Notes: Speech & Audio AI (B14)

## 1. Voice Data Privacy (Biometric Data Regulations)

- Voice is classified as biometric data in most jurisdictions — subject to stricter privacy requirements than text
- GDPR (EU): voice recordings are personal data; voice biometric templates are special category data (Article 9)
- PDPA Vietnam (Decree 13/2023): biometric data is sensitive personal data requiring explicit consent
- Data minimization: do not store raw audio longer than necessary; delete after transcription if possible
- Right to erasure: must be able to delete all voice recordings and derived embeddings for a specific user
- Purpose limitation: voice data collected for transcription cannot be repurposed for speaker profiling without consent
- Data inventory: maintain a register of all voice data assets, storage locations, and retention periods
- Cross-border transfer: Vietnamese voice data may require in-country storage under PDPA

## 2. Voice Cloning Risks and Deepfake Detection

- Modern TTS can clone a voice from 3-10 seconds of audio — any leaked voice sample is a cloning risk
- Threat scenarios: CEO fraud (cloned voice for wire transfer), identity theft, fake evidence
- **Detection approaches**: spectral analysis (cloned voices lack micro-variations), watermarking, artifact detection
- **Audio watermarking**: embed imperceptible watermark in all generated TTS audio for provenance tracking
- **Deepfake detection models**: train classifier on real vs synthesized speech (ResNet on mel-spectrogram features)
- ASVspoof challenge provides standardized evaluation for anti-spoofing systems
- Implement voice liveness detection: challenge-response (repeat random phrase), breathing detection, lip-sync verification
- Policy: clearly label all AI-generated audio; maintain audit trail of all TTS generation requests

## 3. Speaker Authentication Security

- Speaker verification replaces or supplements traditional authentication (passwords, OTP)
- **Enrollment security**: verify identity through other means before enrolling voice biometric
- **Template protection**: never store raw voice embeddings; use cancelable biometrics or encrypted templates
- **Threshold management**: set false accept rate (FAR) based on risk level; banking: FAR < 0.1%, general: FAR < 1%
- **Replay attack prevention**: detect pre-recorded audio playback using channel analysis and liveness detection
- **Multi-factor**: combine voice biometric with another factor (PIN, device, location) for high-security applications
- **Failure handling**: lock account after 3-5 failed verification attempts; require alternative authentication
- **Template aging**: voice changes over time; prompt re-enrollment every 6-12 months
- **Environmental robustness**: test verification accuracy in noisy environments; set minimum audio quality threshold

## 4. PII in Transcriptions

- ASR transcriptions often contain PII: names, phone numbers, addresses, credit card numbers, health information
- Implement real-time PII detection and redaction in transcription output
- Use NER (Named Entity Recognition) fine-tuned for Vietnamese to detect PII entities
- Redaction modes: mask (replace with [REDACTED]), pseudonymize (replace with fake values), remove
- Credit card / phone number detection: regex-based detection is reliable for structured PII
- Health information in medical transcription: HIPAA-equivalent protections required
- Log redaction: ensure PII does not leak into application logs, error messages, or monitoring systems
- Retain redaction mapping securely for cases where original content must be recovered (legal requirement)

## 5. Compliance (PDPA Vietnam for Biometric Data)

- Vietnam PDPA (effective July 2023): biometric data processing requires explicit, informed consent
- Consent must be specific: what data, what purpose, how long, who has access
- Data processor obligations: security measures, breach notification within 72 hours
- Data subject rights: access, correction, deletion, restriction of processing, data portability
- Impact assessment: required for large-scale biometric data processing
- Appointment of data protection officer (DPO) for organizations processing biometric data at scale
- Record keeping: maintain processing records for at least 5 years
- International context: if serving global users, comply with GDPR, CCPA, and local regulations simultaneously

## 6. Secure Audio Transmission

- All audio transmission must use TLS 1.3 (WebSocket over WSS, gRPC with TLS)
- End-to-end encryption for sensitive applications (medical, legal): encrypt audio before transmission
- Certificate pinning for mobile apps to prevent MITM attacks
- DTLS for WebRTC-based audio streaming (peer-to-peer voice applications)
- Audio stream integrity: detect tampering using HMAC on audio chunks
- Network security: restrict ASR/TTS API access to VPN or private network for internal applications
- DDoS protection: rate limit audio streams; audio upload is a vector for resource exhaustion attacks
- Secure WebSocket upgrade: validate Origin header, use authentication token in handshake

## 7. Consent Management for Voice Recording

- Obtain explicit consent before any voice recording; display clear notice and record consent event
- Two-party consent: in many jurisdictions, all parties must consent to being recorded
- Consent granularity: separate consent for recording, transcription, voice profiling, and storage
- Consent withdrawal: user must be able to revoke consent; trigger data deletion workflow on revocation
- Call center scenario: play consent announcement at call start; record timestamp of consent acknowledgment
- Consent audit trail: log who consented, when, to what, and how (click, voice, written)
- Minors: additional protections required for voice data from children under 16 (GDPR) or 13 (COPPA)
- Vietnamese market: consent should be in Vietnamese; ensure users understand what they are consenting to

## 8. Adversarial Attacks on ASR

- **Audio adversarial examples**: imperceptible perturbations that cause ASR to produce attacker-chosen text
- **Targeted attacks**: force ASR to transcribe specific malicious commands (e.g., "transfer money to account X")
- **Over-the-air attacks**: adversarial audio played through speakers can attack nearby ASR devices
- **Backdoor attacks**: poisoned training data causes specific trigger phrases to be misrecognized
- **Defense: input validation**: check audio for unusual spectral patterns, detect synthetic or manipulated audio
- **Defense: ensemble models**: use multiple ASR models and flag disagreements for review
- **Defense: output validation**: sanity-check transcription output against expected patterns (e.g., no financial commands in casual conversation)
- **Defense: monitoring**: track unusual transcription patterns, sudden accuracy drops, or unexpected outputs
- For Vietnamese: adversarial attacks are less studied but equally feasible; do not assume security through obscurity

## Recommendations

1. Classify all voice data as biometric PII from day one — retrofitting privacy controls is extremely costly
2. Implement audio watermarking on all TTS output to enable deepfake provenance tracking
3. Never store raw voice embeddings — use encrypted or cancelable biometric templates
4. Build PII redaction into the transcription pipeline as a core feature, not an afterthought
5. Comply with Vietnam PDPA requirements for biometric data — explicit consent, breach notification, deletion rights
6. Implement voice liveness detection for any speaker verification system to prevent replay attacks
7. Monitor for adversarial attacks on ASR — input validation and output sanity checking are practical first defenses
