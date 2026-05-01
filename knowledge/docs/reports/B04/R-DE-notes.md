# Data Engineering Notes: B04 NLP
## By R-DE — Date: 2026-03-31

---

### 1. NLP Data Pipeline Architecture

A production NLP pipeline follows a clear linear flow: **raw text → cleaning → tokenization → embedding or fine-tune data → vector store**. At each stage, data contracts matter. Raw text arrives in heterogeneous formats (HTML, PDF, plain text, database blobs). Cleaning normalizes encoding, strips boilerplate, and removes near-duplicates. Tokenization is model-specific — what goes into a BERT-based model differs from what feeds a GPT-4o-style decoder. Embedding pipelines produce fixed-size dense vectors and push them to a vector store. Fine-tuning pipelines produce JSONL instruction pairs and feed training jobs.

Use Apache Airflow or Prefect for orchestration. Airflow suits batch pipelines with clear DAG structure; Prefect 2.x is better for dynamic task graphs. For high-throughput streaming, Apache Kafka as the message bus with Apache Flink for stateful processing covers most real-time requirements.

---

### 2. Text Data Collection and Ingestion

**Web scraping for Vietnamese corpus:** Use Scrapy for large-scale structured crawling. Pair it with Playwright for JavaScript-heavy news portals (VnExpress, Tuoi Tre, Thanh Nien). Respect robots.txt. Implement crawl-delay and domain-level rate limiting. Store raw HTML in object storage (S3-compatible: MinIO for on-premise, AWS S3 for cloud) before any processing — raw data is gold.

**PDF and DOCX extraction:** PyMuPDF (fitz) outperforms pdfplumber for speed on large PDFs. Use pdfplumber when you need table extraction. For DOCX, python-docx handles structure well. For scanned PDFs, integrate Tesseract OCR (via pytesseract) with VietOCR for Vietnamese handwriting. Caution: OCR output quality degrades significantly with low-DPI scans — add a DPI check before OCR routing.

**Database text extraction:** Use SQLAlchemy with pandas for relational sources. For MongoDB, pymongo bulk read with projection. Always pull with a `created_at` or `updated_at` cursor to enable incremental ingestion — never full re-dump in production.

---

### 3. Text Preprocessing Pipeline

**Language detection:** Use `langdetect` or `fasttext`'s language identification model (lid.176.bin). fasttext is 10x faster and handles short texts better. Route non-Vietnamese text to separate pipelines rather than discarding — code-switched content is common in Vietnamese social media.

**Encoding normalization:** Vietnamese text must be in NFC Unicode form. Use `unicodedata.normalize('NFC', text)` as the first step. Common issue: text scraped from older Vietnamese websites uses TCVN3 or VNI encoding — detect with chardet and transcode to UTF-8 before any further processing.

**Deduplication:** MinHash LSH (via `datasketch` library) is the standard for near-duplicate detection at corpus scale. For exact duplicates, MD5 hash of normalized text suffices. SimHash is faster for very large streaming pipelines. Target deduplication threshold: Jaccard similarity > 0.8 considered near-duplicate for general corpus; > 0.95 for fine-tuning data (where slight paraphrases can be useful).

**Quality scoring:** Assign each document a composite quality score based on: character-to-word ratio, fraction of alphabetic characters, presence of Vietnamese diacritics, text length. Filter documents below threshold before downstream processing.

---

### 4. Dataset Formats for NLP

**Hugging Face datasets format:** Use `datasets` library with Arrow-backed files for efficient random access. Structure: `DatasetDict` with `train`, `validation`, `test` splits. Push to Hugging Face Hub for team sharing or save locally with `dataset.save_to_disk()`.

**JSONL for instruction tuning:** Each line is a JSON object. Standard schema for instruction tuning:
```json
{"instruction": "...", "input": "...", "output": "..."}
```
For chat-style fine-tuning (ChatML format):
```json
{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
```
Always validate JSONL files with a quick parse-all check before submitting to training jobs.

**Parquet for large corpora:** Use `pyarrow` or `pandas` to write Parquet. Enable Snappy compression for a good size/speed tradeoff. Partition by date or source domain for selective loading. A 10GB text corpus typically compresses to 2-3GB in Parquet with Snappy.

---

### 5. Vector Database Pipelines

**Chunking strategies:**
- Fixed-size: split every N tokens (typically 256-512) with overlap (10-15%). Simple, predictable, works well for homogeneous documents.
- Semantic: split at sentence or paragraph boundaries detected by spaCy or `nltk.sent_tokenize`. Better for heterogeneous content.
- Hierarchical: store parent chunk (1024 tokens) and child chunks (128 tokens); retrieve child chunks, return parent for context. Best retrieval quality but doubles storage.

**Embedding generation at scale:** Use `sentence-transformers` with batched inference (batch size 64-128 on GPU). For Vietnamese, `bge-m3` (BGE multilingual) or `intfloat/multilingual-e5-large` outperform English-only models. Pre-generate and cache embeddings — re-embedding a large corpus is expensive.

**Upsert pipelines for Qdrant/pgvector:**
- Qdrant: use `qdrant-client` Python SDK. Batch upsert with `upsert(collection_name, points=[...], batch_size=256)`. Use named vectors for multi-vector setups (sparse + dense hybrid search).
- pgvector: use `psycopg2` with `COPY` for bulk insert. Create HNSW index after bulk load, not before — indexing during insert is 5-10x slower.

---

### 6. Vietnamese Text Specifics

**Tokenization options:** `underthesea` is the most accurate Vietnamese NLP toolkit — supports word segmentation, POS tagging, NER, and sentiment. `pyvi` is lighter and faster but less accurate. For LLM-based pipelines, subword tokenizers (BPE via `sentencepiece`) handle Vietnamese adequately without explicit word segmentation.

**UTF-8 encoding issues:** Vietnamese has 134 distinct characters including tonal diacritics. Precomposed (NFC) vs decomposed (NFD) forms cause silent mismatches. Always normalize to NFC. Watch for zero-width joiners and invisible Unicode characters in scraped web text.

**Code-switching handling:** Vietnamese social media mixes Vietnamese, English, and Teencode (informal Vietnamese abbreviations). Build a code-switching classifier to tag mixed segments. Do not force-tokenize English segments with a Vietnamese tokenizer.

---

### 7. Data Quality for LLM Training

**Perplexity filtering:** Train a small KenLM model on a clean Vietnamese reference corpus. Score all candidate documents; discard the top and bottom 10-15% by perplexity. High perplexity = garbled text; low perplexity = repetitive templated text.

**Toxic content filtering:** Use a fine-tuned classifier (e.g., `cardiffnlp/twitter-roberta-base-offensive` adapted for Vietnamese). Maintain a custom blocklist for Vietnamese profanity and politically sensitive terms relevant to deployment context.

**PII detection and redaction:** Use `presidio-analyzer` with a custom Vietnamese recognizer for phone numbers (10-digit Vietnamese mobile patterns), national ID numbers, and full names combined with addresses. Redact with typed placeholders: `[PHONE]`, `[ID_NUMBER]`, `[PERSON_NAME]`.

**N-gram deduplication:** Apply sentence-level n-gram deduplication (n=13 as per CCNet/RedPajama methodology) to remove boilerplate repeated across documents (cookie banners, legal footers, news agency taglines).

---

### 8. Streaming Text Pipelines

**Architecture:** Kafka as message bus (topics: `raw-text`, `cleaned-text`, `embedded-vectors`) → Flink for stateful transformations (dedup within a sliding window, language detection, quality scoring) → embedding service (gRPC call to sentence-transformer server) → Qdrant upsert → downstream alert/notification service.

**Real-time news and social media monitoring:** Use Kafka Connect with custom source connectors for RSS feeds and social APIs. Process with Flink, embed on the fly, and store in Qdrant with timestamp metadata. Run a similarity search against a "watch list" of key topics — if cosine similarity > 0.85, trigger an alert via webhook.

**Throughput benchmarks:** A single GPU (RTX 4090) running `bge-m3` can embed approximately 2,000-3,000 short passages per second with batching. Plan Kafka partition count and Flink parallelism to match embedding throughput as the bottleneck.
