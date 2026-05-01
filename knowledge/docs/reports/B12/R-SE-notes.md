# Security Engineer Notes: Search & RAG (B12)

## 1. Access Control on Documents

Search systems must enforce document-level access control — users should only find what they are authorized to see.

### Access Control Models
- **Role-based (RBAC)**: Users have roles; documents tagged with required roles
- **Attribute-based (ABAC)**: Fine-grained rules based on user/document attributes
- **Access Control Lists (ACL)**: Each document has explicit list of permitted users/groups

### Implementation in Search
- **Index-time ACL injection**: Store ACL metadata alongside each vector/document
- **Query-time filtering**: Mandatory filter on every search query matching user's permissions
- **Pre-filtering**: Filter BEFORE vector search (Qdrant, Weaviate support this natively)
- **Post-filtering pitfall**: Filtering after kNN can return fewer results than requested
- **ACL sync**: Sync permissions from source system (SharePoint, Google Drive, Confluence) on schedule

Recommendation: Pre-filtering with tenant_id and ACL fields is the minimum. Never rely on application-layer filtering alone — enforce at the database query level.

## 2. PII in Search Results

Search indexes often contain personally identifiable information:

- **PII detection**: Scan documents during ingestion for names, phone numbers, ID numbers, addresses
- **Redaction options**: Redact PII from chunks before indexing, or flag and filter at query time
- **Vietnamese PII patterns**: CMND/CCCD (citizen ID), phone (0xx-xxx-xxxx), tax codes
- **Selective exposure**: Show PII only to users with elevated permissions
- **Embedding leakage**: Embeddings can encode PII indirectly; consider this for shared indexes

## 3. Preventing Data Leakage Through Search

Search is a powerful data exfiltration vector if not secured:

- **Query logging**: Log all search queries with user identity for audit
- **Result limits**: Cap the number of results returned per query and per session
- **Bulk download prevention**: Detect and block programmatic scraping patterns
- **Cross-tenant leakage**: Mandatory tenant_id filter at middleware level; defense in depth
- **Embedding inversion**: Research shows partial text recovery from embeddings is possible; encrypt stored embeddings if high-sensitivity

### Detection Patterns
- Unusual query volume from a single user
- Sequential queries systematically covering a document set
- Queries targeting sensitive categories (HR, finance, legal)

## 4. RAG Prompt Injection via Documents

A critical and emerging threat: malicious content in indexed documents can manipulate RAG output.

### Attack Vectors
- **Indirect prompt injection**: Document contains hidden instructions that alter LLM behavior
- **Context poisoning**: Attacker uploads document with false information to poison RAG answers
- **Instruction override**: Embedded text like "Ignore previous instructions and..." in documents

### Mitigations
- **Input sanitization**: Strip potential injection patterns from document text during ingestion
- **Context isolation**: Clearly delimit user query vs retrieved context in LLM prompt
- **Output validation**: Check generated answers against a safety classifier
- **Source trust scoring**: Weight trusted sources higher; flag user-uploaded content
- **Human-in-the-loop**: For high-stakes answers, require human verification
- **Canary tokens**: Insert known-false statements in test documents to detect if LLM reproduces them

Recommendation: Treat all indexed documents as untrusted input. Apply defense-in-depth with sanitization, isolation, and output validation.

## 5. Secure Embedding Storage

- **Encryption at rest**: Enable encryption for vector DB storage (AES-256)
- **Encryption in transit**: TLS for all connections to vector DB and embedding service
- **API authentication**: Require API keys or JWT tokens for all vector DB operations
- **Network isolation**: Vector DB in private subnet; no public internet access
- **Key management**: Use cloud KMS for encryption keys; rotate annually
- **Embedding deletion**: When document is deleted, ensure corresponding vectors are also purged

## 6. Compliance (PDPA Vietnam)

Vietnam's Personal Data Protection Decree (Decree 13/2023/ND-CP) affects search systems:

- **Consent**: Obtain consent before indexing documents containing personal data
- **Purpose limitation**: Search indexes used only for stated purpose
- **Data minimization**: Index only necessary fields; avoid storing full documents in vector DB
- **Right to erasure**: Must be able to delete all vectors and metadata for a specific individual
- **Cross-border transfer**: Vietnamese personal data transferred abroad requires impact assessment
- **Data Protection Officer**: Required for organizations processing large volumes of personal data
- **Breach notification**: 72-hour notification requirement for data breaches

### Implementation Checklist
- Document what personal data enters the search index
- Implement individual data deletion capability (by person, not just by document)
- Maintain processing records as required by Decree 13
- Conduct Data Protection Impact Assessment for the search system

## 7. Audit Logging for Search Queries

Comprehensive audit logging is essential for compliance and security:

- **What to log**: User ID, timestamp, query text, filters, results returned, action taken
- **RAG-specific logging**: Retrieved context IDs, generated answer hash, model used
- **Storage**: Immutable append-only log (CloudWatch, BigQuery, or dedicated SIEM)
- **Retention**: Minimum 1 year for compliance; 3 years recommended
- **Access to logs**: Restrict log access to security team; logs themselves contain sensitive queries
- **Anomaly detection**: Automated alerts on unusual search patterns

## 8. Recommendations

1. Enforce document-level access control at the vector DB query level, not just application layer
2. RAG prompt injection via documents is a real and growing threat — implement sanitization and output validation
3. Scan all documents for PII during ingestion; redact or flag before indexing
4. Comply with Vietnam PDPA (Decree 13/2023) — implement right to erasure for search indexes
5. Encrypt embeddings at rest and in transit; treat them as sensitive derived data
6. Log all search queries to immutable audit log with minimum 1-year retention
7. Implement rate limiting and anomaly detection to prevent data exfiltration via search
8. Regularly pen-test the search system specifically for prompt injection and access control bypass
