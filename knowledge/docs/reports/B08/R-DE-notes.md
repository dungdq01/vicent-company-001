# Data Engineer Notes: Conversational AI & Chatbots (B08)
## By Minh Tran (R-DE) — Date: 2026-03-31

### Conversation Log Collection & Storage

Raw conversation logs are the lifeblood of chatbot improvement. A robust ingestion pipeline must:
- Capture every turn: user message, bot response, timestamps, session ID, channel source (Zalo, Messenger, web widget)
- Store in append-only format — never mutate historical logs
- Schema: `session_id | turn_index | role (user/bot) | message_text | metadata_json | created_at`
- Use PostgreSQL with JSONB for metadata flexibility; partition tables by month for query performance
- For high-volume systems (>1M conversations/day), land raw logs in object storage (S3/MinIO) then ETL into structured tables
- Maintain a separate analytics layer using ClickHouse or BigQuery for aggregation queries

### Training Data Curation

Intent and entity labeling requires a structured annotation workflow:
- Use Label Studio or Prodigy for annotation UI — support both English and Vietnamese text
- Define intent taxonomy hierarchically: L1 (category) > L2 (specific intent), e.g., `order > order_status`, `order > order_cancel`
- Entity types for Vietnamese e-commerce: `product_name`, `order_id`, `phone_number`, `address`, `price`, `date_relative` (e.g., "hôm qua", "tuần trước")
- Inter-annotator agreement (Cohen's kappa) must be >0.8 before dataset is considered production-ready
- Maintain a golden test set (500+ examples) that is never used in training — only evaluation
- Version annotation guidelines alongside data; guideline drift is a real problem

### Data Versioning for Dialogue Datasets

- Use DVC (Data Version Control) to track dataset versions alongside code in Git
- Tag each dataset release: `v1.0-intents-2026Q1`, `v1.1-intents-2026Q1-hotfix`
- Track lineage: raw logs → filtered → annotated → augmented → train/val/test splits
- Store split assignments by ID, not by file — ensures reproducibility when data grows
- Maintain a dataset card (metadata file) for each version: size, label distribution, annotation source, known issues

### PII Handling in Chat Logs

Vietnamese chat logs contain dense PII — phone numbers (10-digit starting with 0), CMND/CCCD numbers, bank accounts:
- Build a PII detection pipeline: regex layer (phone, ID numbers) + NER model (names, addresses)
- Vietnamese names are tricky — "Nguyen Van A" patterns but also informal nicknames
- Apply pseudonymization, not deletion — replace with consistent tokens (`[PHONE_1]`, `[NAME_1]`) to preserve conversation structure
- Store PII mapping separately with encryption; delete after retention period (typically 90 days)
- For training data: always use pseudonymized version; never fine-tune on raw PII
- Log access to PII-containing tables with audit trail

### Multi-language Data Processing (Vietnamese + English)

- Vietnamese is a monosyllabic, tonal language with space-separated syllables but multi-syllable words (e.g., "học sinh" = student)
- Use underthesea or VnCoreNLP for word segmentation before any NLP task
- Code-switching is extremely common in Vietnamese tech/business chat: "Em muốn check order status" — build a language detection per-segment pipeline
- Normalize Vietnamese text: remove excessive diacritics errors, handle teencode ("ko" = "không", "dc" = "được", "ng" = "người")
- Maintain separate preprocessing pipelines for Vietnamese and English; detect language at message level then route
- Store both raw and normalized text — raw for audit, normalized for ML

### Synthetic Conversation Generation

- Use GPT-4 / Claude to generate synthetic conversations given intent templates and persona definitions
- Define personas: angry customer, confused first-time buyer, returning loyal customer
- Generate Vietnamese conversations with realistic teencode and informal speech patterns
- Validation: human review 10% of synthetic data; measure distribution alignment with real data
- Synthetic data is most valuable for rare intents (e.g., fraud report) where real data is sparse
- Mix ratio: start with 30% synthetic / 70% real; reduce synthetic as real data grows

### Data Quality for Fine-tuning

- Deduplication: exact match + fuzzy matching (Jaccard similarity > 0.85) on user messages
- Remove conversations where bot clearly failed (detected by user escalation to human agent)
- Balance intent distribution — undersample dominant intents, oversample or synthesize rare ones
- For instruction fine-tuning: format as `[INST] user message [/INST] ideal response` with system prompt
- Quality checklist before fine-tuning: no PII, balanced labels, no duplicates, correct language tags, valid JSON format
- Monitor data drift: compare monthly intent distributions; alert if any intent shifts >5%

### Recommendations for B08

1. Invest in PII detection early — retrofitting is painful and risky for compliance
2. Build the Vietnamese teencode normalizer as a shared library; every downstream task benefits
3. Use DVC from day one; "we'll version it later" never happens
4. Synthetic data generation should be a pipeline, not a one-off script — parameterize personas and scenarios
5. Partition conversation logs by channel (Zalo, Messenger, Web) — they have very different user behavior patterns
6. Establish a data quality dashboard: label distribution, PII detection rate, annotation velocity, inter-annotator agreement
