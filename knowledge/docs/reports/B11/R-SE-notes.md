# Security Engineer Notes: Knowledge Graph (B11)
## By Truong Quang Hieu (R-SE) — Date: 2026-03-31

### 1. Threat Model for Knowledge Graph Systems

KG systems face unique security challenges because graph traversal can reveal information not explicitly stored:

- **Direct data exposure**: Unauthorized access to entity properties or relationships
- **Inference attacks**: Traversing the graph to infer sensitive information (e.g., discovering company ownership through multiple hops)
- **Query-based information leakage**: SPARQL/Cypher queries that extract bulk data
- **Provenance tampering**: Modifying source attribution to undermine trust in KG facts
- **Poisoning attacks**: Inserting false triples to corrupt downstream decisions

### 2. Access Control on Graph Data

**Node-level access control**:
- Assign security labels to nodes (e.g., PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED)
- User roles map to maximum security label they can access
- Neo4j Enterprise: Use security procedures to filter query results by role

**Edge-level access control**:
- Certain relationships may be sensitive even if both endpoints are public (e.g., INVESTIGATED_BY relationship between a person and a law enforcement entity)
- Implement edge-level filtering in the API layer (more flexible than database-level)

**Subgraph isolation**:
- Multi-tenant KGs: Each tenant can only see their own subgraph
- Enforce via query rewriting in middleware: inject `WHERE n.tenant_id = $tenant` into all queries

**Implementation approach for B11**:
```
Request → JWT validation → Role extraction → Query rewriting (add security filters) → Neo4j → Result filtering → Response
```

### 3. PII in Knowledge Graphs

Knowledge graphs frequently contain Personally Identifiable Information:

| PII Type | Example in KG | Risk Level |
|----------|--------------|------------|
| Full names | Person entity names | Medium |
| National ID (CCCD) | Property on Person node | High |
| Phone numbers | Contact relationship | High |
| Home address | LIVES_AT relationship | High |
| Financial data | OWNS_ACCOUNT relationship | High |
| Medical conditions | HAS_DIAGNOSIS relationship | Critical |
| Employment history | WORKS_AT relationships | Medium |

**Mitigation strategies**:
- **Pseudonymization**: Replace PII with pseudonyms in non-production environments
- **Encryption at rest**: Encrypt the entire graph database storage volume
- **Field-level encryption**: Encrypt specific sensitive properties (decrypt only for authorized roles)
- **Access logging**: Every access to PII-containing entities is logged with user identity
- **Data minimization**: Only store PII that is necessary for KG use cases

### 4. GDPR Compliance (Right to Be Forgotten in KG)

Vietnam's PDPD (Personal Data Protection Decree 13/2023) and international GDPR requirements:

**Challenges specific to KGs**:
- Deleting a person entity may break graph connectivity (orphaned relationships)
- The same person may appear as multiple entities (entity resolution complicates deletion)
- Cached/derived data (embeddings, search indexes) also contain personal data
- Provenance trails reference the deleted person

**Deletion procedure**:
1. Receive deletion request, verify identity
2. Find all entity nodes for the person (including duplicates from entity resolution)
3. Remove or anonymize all properties containing PII
4. Replace entity name with anonymized placeholder ("Person_DELETED_12345")
5. Optionally retain anonymized relationships for graph structure integrity
6. Purge from: search indexes, embedding vectors, Redis cache, backup rotation
7. Log the deletion action itself (with anonymized reference, not PII)
8. Confirm deletion to requester within 30 days

**Technical implementation**: Build a `DataDeletionService` that orchestrates across Neo4j, Elasticsearch, Redis, and S3 backups.

### 5. Secure SPARQL Endpoints

SPARQL endpoints are high-risk attack surfaces:

- **Query injection**: Malicious SPARQL can extract entire datasets
- **Denial of service**: Complex queries (Cartesian products, unbounded paths) consume all resources
- **Mitigation**:
  - Enforce query timeout (30 seconds max)
  - Limit result set size (10,000 triples max per query)
  - Restrict query complexity (max joins, max path length)
  - Require authentication for all SPARQL access (no anonymous queries)
  - Whitelist allowed query patterns for public endpoints
  - Rate limit: Max 10 queries per minute per user

### 6. Preventing Data Leakage Through Graph Traversal

The unique risk of graph databases: authorized users can discover unauthorized information through multi-hop traversal.

**Example attack**: User authorized to see Company and Person entities traverses Company->OWNS->Company->EMPLOYS->Person->HAS_DIAGNOSIS to reach medical data they should not access.

**Defense strategies**:
- **Hop-limited queries**: API enforces maximum traversal depth (e.g., 3 hops)
- **Relation type restrictions**: Users can only traverse specific relation types based on their role
- **Result-set filtering**: Post-query filter removes entities/relationships the user is not authorized to see
- **Query auditing**: Flag queries that cross security domains (e.g., financial to medical)
- **View-based access**: Pre-define allowed subgraph views per role; queries execute only within the view

### 7. Audit Logging for KG Modifications

Every modification to the KG must be logged:

**Log fields**:
- Timestamp (UTC)
- User ID and role
- Action type (CREATE, UPDATE, DELETE, MERGE)
- Target entity/relationship ID
- Before/after state (for updates)
- Source IP address
- API endpoint called

**Storage**: Append-only log in a separate database (not the KG itself). Retain for 3+ years for regulatory compliance.

**Alerting**: Real-time alerts for:
- Bulk deletions (> 100 entities in 1 hour)
- Schema modifications
- Access to RESTRICTED-labeled entities
- Failed authentication attempts (> 5 in 10 minutes)

### 8. Data Encryption

| Layer | Method | Tool |
|-------|--------|------|
| In transit | TLS 1.3 on all Bolt/HTTP connections | Neo4j TLS config |
| At rest (volume) | AES-256 volume encryption | AWS EBS encryption / LUKS |
| At rest (field) | Application-level encryption for PII fields | AWS KMS / Vault |
| Backups | Encrypted S3 buckets with SSE-KMS | AWS S3 encryption |

### 9. Authentication and Authorization Architecture

- **Authentication**: OAuth 2.0 / OpenID Connect (Keycloak or Auth0)
- **Authorization**: Role-Based Access Control (RBAC) with graph-specific permissions
- **Roles for B11**:
  - `kg_admin`: Full CRUD + schema changes
  - `kg_editor`: Create/update entities and triples
  - `kg_viewer`: Read-only access to PUBLIC and INTERNAL data
  - `kg_analyst`: Read access including CONFIDENTIAL data, query builder access
  - `kg_api`: Service account for automated pipelines

### Recommendations for B11

1. **Implement access control at the API layer, not just the database** — Neo4j's built-in security is insufficient for fine-grained graph access control
2. **Build the data deletion pipeline early** — retrofitting GDPR/PDPD compliance into an existing KG is extremely difficult
3. **Enforce traversal depth limits in all APIs** — unbounded graph traversal is both a performance risk and a data leakage risk
4. **Log every KG modification to an immutable audit trail** — this is a regulatory requirement and essential for debugging data quality issues
5. **Encrypt PII fields at the application level** — volume encryption alone does not protect against authorized users accessing data beyond their role
6. **Conduct regular access reviews** — quarterly review of who has access to what security levels in the KG
7. **Pen-test SPARQL endpoints specifically** — they are the most common attack vector for knowledge graph systems
