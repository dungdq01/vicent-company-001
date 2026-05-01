# Education Domain Expert Notes: Speech & Audio AI (B14)

## 1. Language Learning Apps (Pronunciation Scoring)

- Pronunciation scoring compares learner speech against native reference using phonetic alignment
- GOP (Goodness of Pronunciation): log-likelihood ratio of forced alignment vs free decoding; industry standard
- Phoneme-level scoring: score each phoneme on a 1-5 scale; aggregate to word and sentence scores
- Feedback types: correct/incorrect binary, numerical score, visual phonetic comparison, corrective audio
- Vietnamese learners of English: common errors in /r/-/l/, /th/, final consonant clusters, stress patterns
- English learners of Vietnamese: tones are the primary difficulty; provide F0 contour visualization
- Technology stack: forced alignment (Montreal Forced Aligner), GOP scoring, feedback generation
- Market leaders: ELSA Speak (Vietnamese-founded, strong in pronunciation), Duolingo (limited pronunciation)

## 2. Lecture Transcription

- Automatic transcription of university lectures and online courses in Vietnamese
- Challenges: academic vocabulary, code-switching (Vietnamese-English technical terms), speaker variability
- Domain adaptation: fine-tune ASR on academic lecture data; build custom vocabulary for each subject
- Output format: timestamped transcript synchronized with lecture video/slides
- Searchable transcripts: index transcription text for keyword search across entire course catalog
- Accessibility: provide transcripts for hearing-impaired students
- Integration with LMS: Moodle, Canvas, Google Classroom
- Cost model: approximately $0.01/minute for batch transcription; a 45-minute lecture costs under $0.50

## 3. Audiobook Generation

- Convert Vietnamese textbooks, literature, and educational materials to audio format
- TTS requirements: natural prosody, correct tone production, appropriate pacing for educational content
- Multi-voice: different voices for narrator, characters in stories, teacher vs student in dialogues
- Long-form challenges: maintain consistent voice quality over hours of content; chapter-based generation
- SSML markup: control pauses, emphasis, speed for educational effectiveness
- Vietnamese text challenges: proper noun pronunciation, loanwords, mathematical expressions
- Distribution: integrate with podcast platforms, LMS, or dedicated educational audio players
- Accessibility: audiobooks are essential for visually impaired students and those with reading difficulties

## 4. Vietnamese Education Landscape (MOET)

- MOET (Ministry of Education and Training): governs all levels of education in Vietnam
- K-12 system: 12 years of schooling; new curriculum (Chuong trinh GDPT 2018) emphasizes competency-based learning
- Higher education: 237 universities, approximately 2 million students; increasing technology adoption
- English education: mandatory from grade 3; strong demand for pronunciation training tools
- Digital transformation: Vietnam National Digital Transformation Program targets education technology
- MOET regulations: technology in education must comply with data protection for minors
- Budget: government education spending approximately 4.2% of GDP; increasing edtech allocation
- Private edtech: growing rapidly; Topica, ELSA, Marathon Education among notable Vietnamese companies

## 5. Pronunciation Assessment for Vietnamese Learners

- Vietnamese pronunciation assessment is uniquely challenging due to 6-tone system
- Tone scoring: compare learner F0 contour against reference using DTW or neural scoring
- Segmental scoring: evaluate consonant and vowel quality independently from tonal accuracy
- Common errors by L1: Chinese speakers confuse tones, English speakers miss tones, Korean speakers struggle with vowels
- Regional standard: Northern (Hanoi) is standard in education but Southern is widely spoken
- Progressive difficulty: single syllables, then words, then phrases, then sentences
- Feedback modality: visual F0 contour overlay, audio comparison, IPA transcription
- Assessment rubric: align with CEFR levels for standardized scoring

## 6. Speech-to-Text for Students with Disabilities

- Hearing-impaired students: real-time captioning during lectures on personal devices
- Motor-impaired students: voice-controlled input for assignments, exams, and computer interaction
- Dyslexic students: speech-to-text for writing; text-to-speech for reading; multimodal support
- Visual impairment: screen reader integration with all speech interfaces; voice navigation
- Classroom setup: far-field microphone for teacher, real-time ASR, display on student devices
- Accuracy requirements: higher than general ASR -- errors in educational content cause learning confusion
- Vietnamese-specific: limited assistive technology in Vietnamese language; significant market gap
- Policy: Vietnam Disability Law (2010) requires educational accommodation; speech technology enables compliance

## 7. Market Size and Opportunity

- Vietnam edtech market: estimated $3-5B total by 2025; speech-specific segment approximately $30-50M
- Pronunciation scoring: largest speech edtech segment; ELSA Speak alone valued at $100M+ globally
- Lecture transcription: growing with online education adoption; $5-10M addressable in VN
- Audiobook generation: nascent market in Vietnamese; $3-5M addressable
- Key demographics: 25 million K-12 students, 2 million university students, 5+ million adult English learners
- Competitive landscape: ELSA (pronunciation), Fonos (Vietnamese audiobooks), Viettel AI (general ASR)
- Growth drivers: English proficiency demand, digital transformation, accessibility requirements
- Revenue models: B2C subscription ($5-15/month), B2B licensing ($2-5/student/year), API pricing

## 8. Implementation Roadmap

- Phase 1 (0-3 months): Lecture transcription service -- lowest risk, immediate value, validates ASR quality
- Phase 2 (3-6 months): Pronunciation scoring for English learning -- high demand, proven market
- Phase 3 (6-12 months): Vietnamese pronunciation assessment -- differentiated, less competition
- Phase 4 (12-18 months): Audiobook generation and accessibility tools -- social impact, institutional sales
- Technical priorities: Vietnamese ASR WER below 10% on academic content, tone-aware pronunciation scoring
- Partnership strategy: MOET for institutional adoption, universities for pilots, edtech companies for API
- Data strategy: collect consented student speech data to improve Vietnamese ASR and pronunciation models
- Success metrics: WER on academic Vietnamese, pronunciation scoring correlation with expert ratings

## Recommendations

1. Start with lecture transcription -- lowest technical risk and immediate value to universities
2. Pronunciation scoring for English learning is the largest revenue opportunity in Vietnamese edtech speech
3. Vietnamese pronunciation assessment is a blue ocean -- very few competitors with good technology
4. Partner with MOET early for institutional distribution and government endorsement
5. Collect student speech data ethically (consent and parental approval for minors) for competitive advantage
6. Audiobook generation for Vietnamese educational content addresses accessibility and creates new markets
7. Price B2B products at $2-5/student/year -- affordable for Vietnamese schools while sustainable at scale
