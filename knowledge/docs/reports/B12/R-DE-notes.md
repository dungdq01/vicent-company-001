# Data Engineer Notes: Search & RAG (B12)

## 1. Document Ingestion Pipelines

Search systems begin with reliable data ingestion. A production pipeline must handle:

- **Source connectors**: PDF, DOCX, HTML, Confluence, Notion, Google Drive, S3
- **Format extraction**: Apache Tika, Unstructured.io, or PyMuPDF for PDF parsing
- **Metadata extraction**: title, author, date, source URL, document type
- **Pipeline orchestration**: Airflow, Prefect, or Dagster for scheduling and monitoring
- **Dead letter queues**: failed documents route to DLQ for retry/manual review

Recommendation: Use Unstructured.io for multi-format parsing — it handles tables, images, and nested structures better than Tika for RAG use cases.

## 2. Chunking Strategies

Chunking quality directly determines retrieval quality. Three main approaches:

### Fixed-size chunking
- Split by token/character count (e.g., 512 tokens with 50-token overlap)
- Fastest, simplest, works as baseline
- Risk: cuts mid-sentence, loses semantic coherence

### Semantic chunking
- Split at topic/meaning boundaries using embedding similarity
- LangChain SemanticChunker or custom implementation
- Better retrieval relevance but slower processing

### Recursive chunking
- Split by document structure: heading > paragraph > sentence
- Respects document hierarchy (H1, H2, lists, tables)
- Best for structured documents (legal, technical)

Recommendation: Start with recursive chunking (LangChain RecursiveCharacterTextSplitter) at 512 tokens, 10% overlap. Tune chunk size based on retrieval metrics.

## 3. Embedding Generation Pipelines

- **Batch embedding**: Process documents in batches (32-128 items) via GPU
- **Model selection**: multilingual-e5-large or BGE-M3 for Vietnamese support
- **Throughput**: A100 GPU processes ~10K chunks/minute with e5-large
- **Incremental updates**: Only embed new/modified documents, track via content hash
- **Embedding versioning**: Store model version alongside vectors; re-embed on model change

Pipeline flow:
```
Source -> Extract -> Clean -> Chunk -> Embed -> Index -> Validate
```

## 4. Index Management

- **Index versioning**: Blue-green index deployment — build new index, swap atomically
- **Incremental updates**: Upsert by document ID; delete stale vectors on source removal
- **Index rebuilds**: Schedule full rebuild weekly or on model change
- **Metadata indexing**: Store filterable metadata (date, source, category) alongside vectors
- **Compaction**: Periodic compaction for vector DBs to reclaim space

## 5. Vietnamese Text Preprocessing

Vietnamese requires special handling due to multi-syllable words:

- **Word segmentation**: VnCoreNLP or Underthesea for tokenization ("hoc sinh" -> "hoc_sinh")
- **Normalization**: Unicode NFC normalization, diacritics consistency (hòa vs hoà)
- **Tone mark normalization**: Standardize old-style vs new-style Vietnamese diacritics
- **Stop words**: Remove common Vietnamese stop words (cua, la, va, trong, cho)
- **Compound words**: "Thanh pho Ho Chi Minh" must tokenize as a single entity

Recommendation: Always apply VnCoreNLP segmentation before BM25 indexing. For embedding models, raw text (unsegmented) often works better with multilingual models.

## 6. Data Quality for RAG

Poor data quality causes hallucinations and irrelevant retrieval:

- **Deduplication**: MinHash/SimHash to detect near-duplicate documents; deduplicate before indexing
- **Freshness tracking**: Timestamp each document; flag stale content (>6 months for news, >2 years for policy)
- **Content validation**: Detect and filter garbled OCR text, empty sections, boilerplate headers/footers
- **Source authority scoring**: Weight official sources higher than user-generated content
- **Completeness checks**: Ensure chunks retain enough context to be independently useful

## 7. Pipeline Monitoring

- **Ingestion metrics**: documents processed/hour, failure rate, average processing time
- **Embedding metrics**: vectors generated/hour, embedding latency, batch utilization
- **Quality metrics**: chunk size distribution, duplicate detection rate, empty chunk rate
- **Alerting**: Alert on ingestion failures >5%, embedding service downtime, index staleness

## 8. Recommendations

1. Start with Unstructured.io + RecursiveCharacterTextSplitter + multilingual-e5-large
2. Implement content hashing for incremental updates from day one
3. Vietnamese preprocessing is critical for BM25 but less so for neural embeddings
4. Build blue-green indexing early — reindexing without downtime is a common need
5. Monitor chunk quality metrics; bad chunks are the #1 cause of poor RAG answers
6. Budget 60% of pipeline development time on data cleaning and preprocessing
