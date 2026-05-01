# Telecom Domain Expert Notes: Speech & Audio AI (B14)

## 1. Call Center AI (IVR, Agent Assist)

- IVR (Interactive Voice Response): replace DTMF menus with natural language voice interaction
- Intent recognition: "I want to check my balance" -> route to balance inquiry flow
- Vietnamese IVR challenges: dialect variation means IVR must handle Northern/Central/Southern accents
- Agent assist: real-time transcription displayed to agent, suggested responses, knowledge base lookup
- Real-time sentiment detection: alert supervisor when customer frustration is detected
- Call summarization: LLM-based post-call summary replacing manual after-call work (ACW)
- ROI metrics: 30-40% reduction in average handle time (AHT), 20-30% reduction in ACW time
- Deployment: start with agent assist (lower risk), then automate simple IVR flows, then complex self-service

## 2. Voice Biometrics for Authentication

- Replace knowledge-based authentication (KBA) with passive voice verification during conversation
- Passive verification: verify speaker identity from natural conversation (first 10-15 seconds)
- Active verification: prompt user to repeat specific phrase for higher security transactions
- Enrollment: collect voice print during first verified call; update incrementally with each interaction
- Vietnamese telecom context: reduce authentication time from 60-90s (KBA) to 10-15s (voice biometric)
- Fraud detection: flag calls where voice does not match account holder; escalate to fraud team
- Accuracy targets: FAR below 0.1% for financial transactions, below 1% for account inquiries
- Integration: SIP header enrichment with verification score for downstream routing decisions

## 3. Speech Analytics (Sentiment, Compliance Monitoring)

- Post-call analytics: transcribe all calls, extract insights at scale
- Sentiment analysis: classify customer sentiment (positive/neutral/negative) per utterance and overall
- Compliance monitoring: detect required disclosures ("this call is being recorded"), prohibited phrases
- Topic detection: automatically categorize calls by reason (billing, technical support, churn risk)
- Silence and hold analysis: track excessive silence (>5s), hold time, agent-customer talk ratio
- Quality scoring: automated scoring replacing manual QA sampling (typically only 2-5% of calls reviewed manually)
- Vietnamese NLP: sentiment and topic models must handle Vietnamese text; limited pre-trained models available
- Dashboard: real-time and historical analytics; drill-down from aggregate metrics to individual call recordings

## 4. Vietnamese Telecom Landscape

- **Viettel**: Largest operator, 50M+ mobile subscribers, military-owned, strong AI/tech investment (Viettel AI)
- **VNPT (VinaPhone)**: State-owned, 30M+ subscribers, VNPT Technology subsidiary for digital services
- **Mobifone**: State-owned, 20M+ subscribers, planning equitization
- **Vietnamobile, Reddi**: Smaller operators, 5-10M combined
- Total mobile subscribers: approximately 130M (>100% penetration due to dual-SIM)
- Fixed broadband: 22M+ subscribers; FPT Telecom, VNPT, Viettel dominate
- Call center operations: major telcos operate 1000-5000 seat call centers; outsourced centers growing
- Digital transformation: all major telcos investing in AI-powered customer service automation

## 5. Call Recording Analysis

- Vietnamese telcos record 100% of call center interactions -- massive untapped data source
- Storage: 1 hour of telephony audio (8kHz mono G.711) = approximately 28MB; 1M calls/month = 14TB
- Batch transcription pipeline: nightly processing of daily call recordings
- Redaction: mask PII (phone numbers, ID numbers, addresses) in transcriptions before storage
- Retention: Vietnamese regulations require call recording retention for specific durations (varies by type)
- Search and retrieval: full-text search across transcribed calls; filter by date, agent, topic, sentiment
- Training data: call recordings (with consent) are valuable for training Vietnamese ASR models
- Quality assurance: automated QA scoring on 100% of calls vs manual review of 2-5%

## 6. Regulatory Requirements

- Telecommunications Law (2023): updated regulations for telecom services including AI-powered services
- Call recording consent: operators must inform customers that calls are being recorded
- Data localization: Vietnamese telecom data must be stored in Vietnam (Cybersecurity Law 2018)
- Biometric data: voice prints subject to PDPA requirements for sensitive personal data
- Number portability: voice biometric enrollment must handle customers porting between operators
- Emergency services (113/114/115): ASR systems must not interfere with emergency call routing
- VNPT/Viettel licensing: AI services deployed on telecom infrastructure may require additional licensing
- Cross-border data: international call transcriptions may involve cross-border data transfer regulations

## 7. Market Size and Revenue Opportunity

- Total addressable market for telecom AI in Vietnam: estimated $80-120M by 2026
- Call center AI (IVR + agent assist): $30-50M -- largest segment, clear ROI, fastest adoption
- Speech analytics: $20-30M -- compliance and quality monitoring driving adoption
- Voice biometrics: $10-20M -- fraud prevention and authentication cost reduction
- Revenue models: per-seat licensing ($50-200/agent/month), per-minute processing ($0.01-0.03/min), platform fee
- Customer acquisition: top-down enterprise sales to 3 major telcos + banking sector
- Competitive landscape: Viettel AI (internal), FPT AI, international vendors (NICE, Verint, Genesys)
- Margin profile: 60-70% gross margin for SaaS speech analytics; lower for managed service deployments

## 8. Implementation Strategy for Telecom

- **Phase 1 (0-3 months)**: Agent assist for one telco call center -- real-time transcription + knowledge base
- **Phase 2 (3-6 months)**: Post-call speech analytics -- sentiment, topic, compliance scoring
- **Phase 3 (6-12 months)**: Voice IVR replacing DTMF menus for top 5 call reasons
- **Phase 4 (12-18 months)**: Voice biometrics for passive authentication
- Pilot strategy: start with 50-100 agents, prove ROI (AHT reduction, CSAT improvement), then expand
- Integration requirements: SIP/CTI integration with existing PBX (Avaya, Cisco, Genesys), CRM integration
- Data requirements: 1000+ hours of Vietnamese call center audio for domain-specific ASR fine-tuning
- Success metrics: AHT reduction >20%, first-call resolution improvement >10%, CSAT improvement >5 points

## Recommendations

1. Target Viettel first -- largest operator, strongest AI investment appetite, sets market standard
2. Agent assist is the lowest-risk entry point -- agents see value immediately, no customer-facing risk
3. Vietnamese call center ASR must handle 8kHz telephony audio -- fine-tune models specifically on this format
4. Speech analytics with compliance monitoring sells itself to regulated telcos -- audit trail is mandatory
5. Voice biometrics require careful regulatory navigation -- engage legal counsel before deployment
6. Price per-agent-per-month ($100-150) for call center AI -- aligns with telco procurement patterns
7. Build Vietnamese-specific sentiment and topic models -- general-purpose NLP models perform poorly on Vietnamese telecom conversations
