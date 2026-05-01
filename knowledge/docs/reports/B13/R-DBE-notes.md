# Database Engineer Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

Tabular ML models consume structured data from databases. The Database Engineer ensures that data infrastructure supports efficient feature extraction, storage, and serving. This covers SQL databases as feature sources, data warehouses for historical analysis, feature store backends, and query optimization for ML workloads.

## 2. SQL Databases as Feature Sources

### PostgreSQL
- Most versatile open-source option. Strong support for JSON, arrays, window functions.
- Use materialized views for pre-computed features.
- Extensions: pg_stat_statements for query profiling, TimescaleDB for time-series features.
- Connection pooling via PgBouncer is mandatory for ML training jobs that run parallel queries.

### MySQL
- Common in Vietnamese enterprises (legacy systems, e-commerce platforms).
- Limited window function support in older versions; upgrade to 8.0+ for ML feature queries.
- Use read replicas for ML extraction to avoid impacting production OLTP.

### SQL Server
- Common in Vietnamese banking and insurance (legacy Microsoft stack).
- Good analytical functions, columnstore indexes for aggregation queries.
- Use linked servers or CDC for cross-database feature extraction.

## 3. Data Warehouses for ML

### BigQuery (Google Cloud)
- Serverless, pay-per-query. Excellent for ad-hoc feature exploration.
- BigQuery ML for in-database training (quick prototyping, not production).
- Nested/repeated fields reduce joins for denormalized feature tables.

### Snowflake
- Separation of compute and storage. Scale up for training data extraction, scale down after.
- Time travel (up to 90 days) for point-in-time feature reconstruction.
- Data sharing for cross-organization feature exchange.

### ClickHouse
- Best for real-time analytics on large volumes. Column-oriented.
- Excellent for aggregation-heavy feature computation (counts, sums, averages over windows).
- Growing adoption in Vietnamese tech companies (VNG, Tiki).

## 4. Feature Store Backends

### Offline Store (Historical Features)
- Parquet files on S3/GCS: cheapest, good for batch training.
- BigQuery/Snowflake tables: SQL-accessible, easy joins.
- Delta Lake/Iceberg: ACID transactions, time travel, schema evolution.

### Online Store (Real-Time Serving)
- Redis: sub-millisecond latency, key-value lookup by entity ID.
- DynamoDB: managed, auto-scaling, good for AWS-native stacks.
- PostgreSQL (with proper indexing): acceptable for <10ms latency requirements.

### Design Pattern
- Compute features in batch (warehouse), materialize to offline store.
- Sync latest values to online store for real-time inference.
- Ensure consistency between offline (training) and online (serving) features.

## 5. Query Optimization for ML Feature Extraction

### Common ML Query Patterns
- Window aggregations: rolling averages, cumulative sums, lag features.
- Self-joins for entity-level history (customer transaction history).
- Pivot/unpivot for wide feature tables.

### Optimization Techniques
- Partition tables by date for time-based feature extraction.
- Create covering indexes for frequently queried feature columns.
- Use CTEs and temp tables to break complex feature queries into stages.
- EXPLAIN ANALYZE every feature query; target <30s for daily feature refresh.

### Anti-Patterns to Avoid
- SELECT * from large tables; always specify needed columns.
- Correlated subqueries; replace with window functions or joins.
- Missing indexes on join keys and filter columns.

## 6. Materialized Views for Feature Computation

- Pre-compute expensive aggregations as materialized views.
- Refresh on schedule (REFRESH MATERIALIZED VIEW CONCURRENTLY in PostgreSQL).
- Example features: customer_transaction_count_30d, avg_order_value_90d, days_since_last_purchase.
- Layer materialized views: base aggregations, then derived features.
- Monitor refresh duration; optimize if exceeding SLA.

## 7. Data Lake vs Data Warehouse for ML

| Aspect | Data Lake | Data Warehouse |
|--------|-----------|----------------|
| Schema | Schema-on-read | Schema-on-write |
| Cost | Lower storage | Higher but optimized queries |
| Flexibility | Raw data preserved | Curated, quality-checked |
| ML Use | Training data storage | Feature computation |
| Best for | Experimentation, diverse data | Production features |

- **Recommendation**: Use both. Lake for raw data and experimentation, warehouse for production feature pipelines.
- Lakehouse pattern (Delta Lake, Iceberg) merges benefits of both.

## 8. Vietnamese Enterprise Database Landscape

### Common Setups
- Banks: Oracle DB, SQL Server (legacy core banking), PostgreSQL (newer systems).
- Insurance: SQL Server dominant, some Oracle.
- E-commerce: MySQL (Shopee, Tiki legacy), PostgreSQL (newer services).
- Telco: Oracle (Viettel, VNPT), some Hadoop/Hive for CDR data.

### Challenges
- Data silos: each department has separate databases with no unified schema.
- Legacy systems with poor documentation and inconsistent naming.
- Limited cloud adoption in regulated industries (banking, insurance).
- On-premise databases require VPN/bastion host access for ML pipelines.

### Recommendations for Vietnamese Market
- Start with read replicas or CDC to avoid impacting production systems.
- Build a centralized feature warehouse even before adopting a full feature store.
- Use Vietnamese cloud providers (Viettel Cloud, CMC Cloud) for regulated industries.

## 9. Recommendations

1. Use read replicas or CDC for ML feature extraction; never query production OLTP directly.
2. Pre-compute features as materialized views; refresh on schedule matching model retraining cadence.
3. Index all entity ID columns (customer_id, account_id) used in feature joins.
4. Adopt a lakehouse pattern for flexibility: raw data in lake, curated features in warehouse.
5. Plan for point-in-time correctness: features must reflect state at prediction time, not current state.
6. Start with PostgreSQL for small-medium scale; migrate to BigQuery/Snowflake for large-scale.
7. Document all feature SQL queries; they are as important as model code for reproducibility.
