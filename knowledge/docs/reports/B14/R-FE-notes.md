# Frontend Engineer Notes: Speech & Audio AI (B14)

## 1. Audio Recording Interface

- Use `navigator.mediaDevices.getUserMedia({ audio: true })` for microphone access; handle permission denial gracefully
- Request specific audio constraints: `sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true`
- Use `MediaRecorder` API for simple recording or `AudioWorklet` for low-latency processing
- AudioWorklet replaces deprecated ScriptProcessorNode — runs in separate thread, no glitches
- Waveform display: use `AnalyserNode.getByteTimeDomainData()` and render on Canvas or WebGL
- Visual feedback during recording: animated waveform, recording duration timer, level meter
- Support pause/resume recording; store chunks in memory and concatenate on stop
- Export recorded audio as WAV (for quality) or Opus/WebM (for size); use `audiobuffer-to-wav` library
- Mobile considerations: iOS Safari requires user gesture to start audio; handle autoplay restrictions

## 2. Real-Time Transcription Display

- Connect to ASR WebSocket; display partial results with visual distinction (lighter color, italic)
- Replace partial results with final results as they arrive — smooth text transition without flicker
- Auto-scroll transcript container to keep latest text visible; allow user to scroll up to review
- Show confidence indicators: highlight low-confidence words in yellow/orange
- Paragraph segmentation: insert line breaks based on silence duration or punctuation
- Speaker labels: if diarization is active, show speaker tags with distinct colors
- Timestamp display: show timestamps at paragraph boundaries for navigation
- Performance: use virtual scrolling for long transcriptions (>1000 lines) to prevent DOM bloat
- Copy-to-clipboard and export (TXT, SRT, DOCX) functionality for completed transcriptions

## 3. Audio Player with Waveform Visualization

- Use Web Audio API (`AudioContext`, `AudioBuffer`) for precise playback control
- Waveform rendering: pre-compute peaks from audio buffer, render on Canvas with configurable zoom
- Libraries: `wavesurfer.js` (full-featured), `peaks.js` (BBC, production-grade), or custom Canvas implementation
- Features: play/pause, seek by clicking waveform, playback speed control (0.5x-2x), volume
- Synchronized highlighting: highlight current word/segment in transcript as audio plays
- Click-on-word-to-seek: click a word in the transcript to jump to that position in the audio
- Spectrogram view toggle: show frequency content alongside waveform for power users
- Minimap: show full waveform overview with viewport indicator for long recordings
- Responsive design: waveform must resize with container; handle window resize events

## 4. TTS Preview Player

- Text input area with character count and limit display
- Voice selection dropdown with audio preview samples for each voice
- Generate button with loading state; stream audio as it generates for long text
- Playback controls: play/pause, speed adjustment, download generated audio
- SSML editor mode for advanced users: syntax highlighting, tag insertion toolbar
- A/B comparison: play two voice options side by side for comparison
- History: keep last 10 generated audio clips for comparison and re-download
- Estimate generation time and display progress bar for long text inputs

## 5. Voice Selection UI

- Voice catalog with filterable cards: name, language, gender, style, sample audio
- One-click preview: play a standard sample sentence for each voice
- Custom sample: type custom text and hear it in any selected voice
- Favorites: allow users to star preferred voices for quick access
- Voice characteristics display: pitch range, speaking rate, naturalness score
- Regional accent tags: Northern Vietnamese, Southern Vietnamese, neutral
- Category filters: conversational, professional, narrative, child-friendly
- Voice comparison mode: hear same text in multiple voices sequentially

## 6. Speech-to-Text Input Mode

- Replace keyboard typing with voice input in any text field
- Microphone button in input fields: tap to start dictation, tap again to stop
- Interim results appear as user speaks; finalize on silence or manual stop
- Support voice commands: "new line", "period", "delete last word", "undo"
- Language switching: detect and handle Vietnamese-English code-switching
- Inline editing: tap a word to see alternatives or manually correct
- Dictation mode vs command mode toggle for different interaction patterns
- Visual microphone state: idle (gray), listening (red pulse), processing (spinner)

## 7. Mobile Voice Input

- Optimize for mobile-first: large touch targets for record buttons (min 48x48px)
- Handle mobile-specific audio constraints: varying microphone quality, background noise
- Use `touchstart`/`touchend` for push-to-talk interaction pattern
- Battery considerations: show warning when continuous recording may drain battery
- Network handling: buffer audio locally during poor connectivity, sync when connection restores
- Haptic feedback on recording start/stop using Vibration API
- Respect system-level microphone permissions; guide user to settings if denied
- Progressive Web App support: enable offline recording with sync-when-online

## 8. Accessibility

- **Screen reader compatibility**: ARIA labels for all audio controls; announce transcription updates with `aria-live="polite"`
- **Keyboard navigation**: all controls reachable via Tab; Space/Enter to activate; arrow keys for seek/volume
- **Voice navigation**: support voice commands for UI navigation ("go to settings", "play audio", "stop recording")
- **Visual accessibility**: high contrast mode for waveforms; colorblind-safe speaker color schemes
- **Captions**: display live captions for all audio playback; configurable font size and position
- **Motor accessibility**: adjustable click/hold durations for push-to-talk; switch access support
- Follow WCAG 2.1 AA guidelines minimum; target AAA for public-facing applications
- Test with actual screen readers (NVDA, JAWS, VoiceOver) — not just automated accessibility checkers

## Recommendations

1. Use AudioWorklet for all real-time audio processing — ScriptProcessorNode is deprecated and glitchy
2. wavesurfer.js is the best starting point for waveform visualization — customize rather than build from scratch
3. WebSocket connection management is critical: implement reconnection with audio buffering
4. Mobile voice input requires extensive testing across devices — microphone behavior varies significantly
5. Accessibility is not optional for speech interfaces — users with disabilities are a primary audience
6. Stream TTS audio to the player as it generates — do not make users wait for full synthesis
7. Virtual scrolling is essential for long transcription sessions — DOM performance degrades rapidly
