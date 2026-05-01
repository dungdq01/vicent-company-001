# Data Engineer Notes: Knowledge Graph (B11)
## By Nguyen Minh Dat (R-DE) — Date: 2026-03-31

### 1. Data Pipeline Architecture for KG Construction

The KG data pipeline follows a multi-stage architecture:

1. **Ingestion Layer** — Collect raw data from structured (SQL databases, CSV, APIs) and unstructured (documents, web pages, PDFs) sources
2. **Parsing & Normalization** — Convert all inputs into a canonical intermediate format (JSON-LD or N-Triples)
3. **Entity Extraction & Resolution** — Identify entities, disambiguate, and merge duplicates
4. **Triple Generation** — Produce (subject, predicate, object) triples with provenance metadata
5. **Validation & Quality Check** — Enforce ontology constraints, detect anomalies
6. **Loading** — Bulk or incremental insert into the graph database

### 2. ETL from Structured Sources

- **Relational databases**: Use direct mapping (R2RML) or custom SQL-to-RDF transformers
- **CSV/Excel**: pandas preprocessing then mapping via column-to-predicate configuration
- **APIs**: REST/GraphQL polling with change detection for incremental updates
- **Key challenge**: Schema alignment — mapping relational schemas to ontology classes and properties

### 3. ETL from Unstructured Sources

- **Document processing pipeline**: PDF extraction (Apache Tika), OCR for scanned docs (Tesseract), HTML parsing (BeautifulSoup)
- **Text chunking**: Split documents into manageable passages for NLP processing
- **Metadata extraction**: Author, date, source URL, document type — all become provenance triples
- **Integration with NLP pipeline**: Pass cleaned text to NER/RE modules, receive triples back

### 4. Entity Resolution Pipelines

Entity resolution is critical for KG quality. Our pipeline:

1. **Blocking** — Reduce comparison space using locality-sensitive hashing (LSH) or sorted neighborhood
2. **Pairwise comparison** — String similarity (Jaro-Winkler, Levenshtein), phonetic matching for Vietnamese names
3. **Classification** — ML model (gradient boosted trees) to classify pairs as match/non-match
4. **Clustering** — Connected components or correlation clustering to merge transitive matches
5. **Canonical entity selection** — Pick the most complete record as the canonical representation

Tools: dedupe (Python library), Zingg, or custom Spark-based pipeline for scale.

### 5. Data Quality for Knowledge Graphs

Key quality dimensions:

| Dimension | Metric | Target |
|-----------|--------|--------|
| Completeness | % of expected properties filled per entity type | > 80% |
| Accuracy | Spot-check sample against gold standard | > 95% |
| Consistency | No contradictory triples (e.g., two birth dates) | 0 violations |
| Timeliness | Freshness of data vs source update frequency | < 24h lag |
| Provenance | % of triples with source attribution | 100% |

Automated quality checks run after each pipeline execution; violations trigger alerts.

### 6. Incremental KG Updates

- **Change Data Capture (CDC)** from source databases using Debezium or database triggers
- **Delta processing**: Only process changed/new records, not full reload
- **Versioning**: Each triple gets a valid-from/valid-to timestamp for temporal queries
- **Conflict resolution for updates**: Latest-timestamp-wins or source-priority rules
- **Tombstoning**: Mark deleted entities as deprecated rather than hard-deleting

### 7. Handling Multi-Source Conflicting Facts

When multiple sources disagree on a fact (e.g., company revenue from two databases):

- **Store all versions** with provenance (source, timestamp, confidence)
- **Source trust scoring**: Assign reliability weights to each data source
- **Voting/consensus**: For facts with 3+ sources, majority rules
- **Human-in-the-loop**: Flag high-impact conflicts for manual resolution
- **Materialized view**: Present the "best" fact to downstream consumers while retaining alternatives

### 8. Vietnamese Data Sources for KG

| Source | Data Type | Access Method |
|--------|-----------|---------------|
| DangKyKinhDoanh (National Business Registry) | Company registration, ownership | Web scraping, partial API |
| General Statistics Office (GSO) | Economic indicators, demographics | Published datasets |
| Ministry of Health portal | Healthcare facilities, regulations | Web scraping |
| State Bank of Vietnam | Banking regulations, licensed institutions | Published PDFs |
| Vietnam Social Insurance (VSS) | Hospital/clinic lists | Structured datasets |
| OpenStreetMap Vietnam | Geographic entities, addresses | Overpass API |
| Vietnamese Wikipedia | General knowledge entities | Wikidata SPARQL |

Challenges: Many government sources lack APIs, require OCR for scanned documents, and use inconsistent encoding (Unicode normalization issues with Vietnamese diacritics).

### 9. Pipeline Orchestration

- **Apache Airflow** for DAG-based pipeline scheduling
- DAGs: `source_ingestion` -> `parsing` -> `entity_extraction` -> `resolution` -> `triple_gen` -> `validation` -> `load`
- Retry policies with exponential backoff for API sources
- Data lineage tracking: Each triple traces back to its source record and pipeline run ID
- Monitoring: Pipeline latency, record counts at each stage, error rates

### 10. Scalability Considerations

- **Batch processing**: Apache Spark for initial bulk load (millions of records)
- **Stream processing**: Apache Kafka + Flink for real-time KG updates from CDC streams
- **Storage**: Intermediate data in Parquet on S3/MinIO; final triples in graph DB
- Target: Handle 10M+ entities and 100M+ triples with sub-hour incremental refresh

### Recommendations for B11

1. **Start with structured sources first** — business registries and databases yield cleaner triples faster than unstructured documents
2. **Invest heavily in entity resolution** — duplicate entities are the #1 quality killer in KGs
3. **Implement provenance from day one** — every triple must track its source; retrofitting is painful
4. **Use Airflow with clear DAG boundaries** — separate ingestion, processing, and loading stages for debuggability
5. **Plan for Vietnamese text normalization early** — diacritics, encoding variants, and name ordering will cause silent duplicates if not handled
6. **Build a data quality dashboard** — make completeness/accuracy metrics visible to all stakeholders
7. **Design for incremental updates** — full rebuilds do not scale past the prototype phase
