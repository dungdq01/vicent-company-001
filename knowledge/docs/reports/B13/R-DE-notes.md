# Data Engineer Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

Tabular ML pipelines demand robust, repeatable data engineering. Unlike image or NLP workloads, tabular ML relies on structured data from SQL databases, CSV exports, APIs, and enterprise ERPs. The Data Engineer's role is to build pipelines that ingest, validate, transform, and serve clean feature-ready datasets to ML training and inference systems.

## 2. ETL from Core Sources

### SQL Databases
- Extract from PostgreSQL, MySQL, SQL Server using incremental queries (CDC via Debezium or timestamp-based).
- Use connection pooling (PgBouncer) to avoid overloading OLTP systems during extraction.
- Schedule off-peak extraction for large historical pulls.

### CSV and Flat Files
- Automate ingestion from SFTP drops, S3 buckets, or shared drives.
- Schema validation on arrival (column names, dtypes, row counts).
- Handle encoding issues common in Vietnamese data (UTF-8 BOM, Windows-1252 fallback).

### API Sources
- REST/GraphQL connectors for CRM (Salesforce, HubSpot), ERP (SAP, Oracle), and government APIs.
- Rate limiting, retry logic, pagination handling.
- Store raw API responses before transformation (bronze layer).

## 3. Feature Engineering Pipelines

- Build feature pipelines as DAGs (Airflow, Prefect, Dagster).
- Separate raw ingestion (bronze), cleaned data (silver), and feature-ready tables (gold).
- Common transformations: aggregations (rolling means, counts), categorical encoding (target encoding, frequency encoding), date feature extraction, interaction features.
- Use Spark or Polars for large-scale feature computation; pandas for smaller datasets.

## 4. Data Quality Validation

### Schema Checks
- Validate column presence, data types, and nullability on every pipeline run.
- Use Great Expectations or Pandera for declarative data contracts.
- Alert on schema drift (new columns, type changes).

### Distribution Drift Detection
- Monitor feature distributions between training and serving data.
- Statistical tests: KS test (continuous), chi-squared (categorical), PSI (Population Stability Index).
- Automate drift reports; trigger retraining when drift exceeds thresholds.

### Row-Level Validation
- Check for duplicate primary keys, orphan foreign keys, impossible values (negative ages, future dates).
- Quarantine bad rows rather than dropping silently.

## 5. Feature Stores

### Feast (Open Source)
- Offline store: BigQuery, Redshift, or file-based (Parquet).
- Online store: Redis, DynamoDB for low-latency serving.
- Point-in-time correct joins to prevent data leakage.

### Tecton (Managed)
- Real-time feature computation from streaming sources.
- Built-in monitoring and versioning.
- Higher cost but lower operational burden.

### Custom Feature Store
- Many Vietnamese enterprises start with a simple PostgreSQL + Redis pattern.
- Materialize features into tables with timestamps; serve latest via cache.

## 6. Data Versioning

- **DVC (Data Version Control)**: Track datasets alongside code in Git. Store large files in S3/GCS/Azure Blob.
- **LakeFS**: Git-like branching for data lakes. Good for experimentation.
- Tag training datasets with model version for full reproducibility.
- Maintain a data lineage graph: raw source to final feature to model.

## 7. Incremental Training Data Updates

- Append new data to training sets on a schedule (daily, weekly).
- Use watermark columns (created_at, updated_at) for incremental extraction.
- Validate that new data distributions are consistent with historical data before appending.
- Support sliding window training (e.g., last 24 months) to handle concept drift.

## 8. Vietnamese Data Sources

### Enterprise ERPs
- SAP, Oracle, and local ERP systems (Fast, Bravo, MISA) are common in Vietnamese enterprises.
- Data often requires significant cleaning: mixed Vietnamese/English column names, inconsistent date formats (DD/MM/YYYY vs YYYY-MM-DD).

### Government Statistics
- General Statistics Office (GSO) publishes economic indicators, demographics.
- State Bank of Vietnam (SBV) for financial data.
- Data quality varies; manual digitization errors are common.

### Telco and Banking Data
- Major sources for ML: Viettel, VNPT, MobiFone (telco); Vietcombank, Techcombank, VPBank (banking).
- PII handling is critical; anonymize before feature engineering.

## 9. Recommendations

1. Start with a simple medallion architecture (bronze/silver/gold) before adopting a full feature store.
2. Invest in data quality validation early; bad data is the top cause of ML model failures.
3. Use DVC for dataset versioning from day one; reproducibility saves weeks of debugging.
4. Build CDC pipelines for real-time use cases; batch ETL for daily/weekly prediction refreshes.
5. Handle Vietnamese text encoding explicitly in every pipeline step.
6. Document data lineage for regulatory compliance, especially in finance and insurance domains.
7. Monitor pipeline freshness: stale features are as dangerous as incorrect features.

## 10. Key Tools Summary

| Tool | Purpose | When to Use |
|------|---------|-------------|
| Airflow/Prefect | Pipeline orchestration | All projects |
| Great Expectations | Data validation | All projects |
| DVC | Data versioning | All projects |
| Feast | Feature store | Medium+ scale |
| Spark/Polars | Large-scale transforms | >1M rows |
| Debezium | CDC from databases | Real-time features |
