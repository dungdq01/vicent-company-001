# Solution Architect Notes: Knowledge Graph (B11)
## By Le Van Quang (R-SA) — Date: 2026-03-31

### 1. Reference Architecture for KG Platform

A production KG platform has four major subsystems:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  Graph Visualization │ Search UI │ Query Builder │ Admin Panel  │
├─────────────────────────────────────────────────────────────────┤
│                      SERVING LAYER                              │
│  GraphQL API │ REST API │ SPARQL Endpoint │ Embedding API       │
│  Cache (Redis) │ Auth (Keycloak) │ API Gateway                  │
├─────────────────────────────────────────────────────────────────┤
│                      STORAGE LAYER                              │
│  Neo4j (Primary Graph DB) │ Elasticsearch (Search Index)        │
│  FAISS (Embedding Index)  │ S3 (Document Store)                 │
├─────────────────────────────────────────────────────────────────┤
│                   CONSTRUCTION LAYER                            │
│  NLP Pipeline │ Entity Resolution │ Data Ingestion │ ML Models  │
│  Airflow (Orchestration) │ Kafka (Event Stream)                 │
├─────────────────────────────────────────────────────────────────┤
│                     DATA SOURCES                                │
│  Databases │ APIs │ Documents │ Web │ Government Registries     │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Technology Selection Matrix

| Component | Option A (Recommended) | Option B | Option C |
|-----------|----------------------|----------|----------|
| Graph DB | Neo4j Enterprise | Amazon Neptune | JanusGraph |
| Search | Elasticsearch | OpenSearch | Neo4j full-text |
| NLP Framework | PhoBERT + custom | spaCy + underthesea | LLM-only |
| KG Embeddings | PyKEEN | DGL-KE | Custom PyTorch |
| Orchestration | Apache Airflow | Prefect | Dagster |
| Event streaming | Apache Kafka | AWS Kinesis | Redis Streams |
| API layer | Next.js API + Apollo | FastAPI + Strawberry | Express + graphql-js |
| Cache | Redis | Memcached | Neo4j page cache only |
| Frontend | Next.js + react-force-graph | React + D3.js | Vue + Cytoscape.js |
| Auth | Keycloak | Auth0 | Custom JWT |

**Decision rationale**: Neo4j for graph DB (strongest ecosystem, Cypher productivity), Next.js for full-stack (aligns with MAESTRO platform), Airflow for orchestration (proven at scale).

### 3. Integration with Existing Data Infrastructure

**MAESTRO platform integration points**:
- KG serves as the knowledge backbone for multi-agent research system
- Agents query the KG via GraphQL API for entity lookup and relationship discovery
- Research findings from agents feed back into KG as new triples (with agent provenance)
- Next.js frontend shares component library with MAESTRO UI

**Integration patterns**:
- **Event-driven**: Kafka topics for KG updates consumed by downstream services
- **API-based**: GraphQL federation to combine KG API with other MAESTRO microservices
- **Embedding-based**: KG entity embeddings available via FAISS API for similarity and recommendation

### 4. KG + LLM Architecture (GraphRAG)

GraphRAG augments LLM responses with structured knowledge from the KG:

**Architecture**:
```
User Query → Query Understanding (LLM) → Entity Extraction → KG Subgraph Retrieval
    → Context Assembly (triples + text) → LLM Generation → Response with Citations
```

**Implementation details**:
- **Entity extraction from query**: Use NER or LLM to identify entities in the user question
- **Subgraph retrieval**: 1-2 hop neighborhood around identified entities, filtered by relevance
- **Context serialization**: Convert subgraph to natural language or structured format for LLM context
- **Hybrid retrieval**: Combine KG triples with vector-retrieved text chunks for comprehensive context
- **Citation**: Every fact in the response linked to its source triple and original document

**Advantages over pure vector RAG**:
- Structured relationships provide precise factual grounding
- Multi-hop reasoning is explicit (follow graph paths) vs implicit (hope LLM infers from text)
- Entity disambiguation is resolved before retrieval, reducing hallucination

### 5. Enterprise KG Deployment Patterns

**Pattern 1: Centralized KG**
- Single KG instance serving all domains and applications
- Pros: Single source of truth, cross-domain insights
- Cons: Schema complexity, governance bottleneck
- Best for: Smaller organizations, strong central data team

**Pattern 2: Federated KGs**
- Domain-specific KGs with a federated query layer
- Each domain team owns their KG schema and data
- Central ontology alignment for cross-domain queries
- Pros: Team autonomy, manageable complexity
- Cons: Alignment overhead, cross-domain queries slower
- Best for: Large organizations, multiple domain teams

**Pattern 3: Knowledge Mesh**
- Inspired by data mesh — domain-oriented, self-serve KG infrastructure
- Each domain publishes KG APIs as "knowledge products"
- Shared ontology standards but decentralized ownership
- Best for: Very large organizations with mature data culture

**Recommendation for B11**: Start with Pattern 1 (centralized), plan migration path to Pattern 2 (federated) as domains grow.

### 6. Migration from Relational to Graph

Many organizations have existing data in relational databases. Migration strategy:

**Phase 1: Shadow graph**
- Build KG alongside existing relational DB
- ETL pipeline populates KG from relational sources
- Applications continue to use relational DB; KG used for new graph-specific features

**Phase 2: Dual read**
- New graph-native features read from KG
- Existing features gradually migrated to read from KG
- Relational DB remains source of truth

**Phase 3: Graph-first**
- KG becomes primary data store for graph-native domains
- Relational DB retained for tabular/transactional workloads
- Event-driven sync between systems

**Anti-pattern**: Do NOT attempt a "big bang" migration. Coexistence is the realistic path.

### 7. Scalability Architecture

**Horizontal scaling strategy**:
- **Read scaling**: Neo4j read replicas behind load balancer
- **Write scaling**: Single leader (Neo4j Raft) — writes are typically lower volume
- **Search scaling**: Elasticsearch cluster scales independently
- **API scaling**: Stateless API servers auto-scale based on request volume
- **Pipeline scaling**: Airflow workers scale with Celery/Kubernetes executor

**Performance architecture**:
- Hot data (frequently accessed entities) cached in Redis with 15-minute TTL
- Search queries served by Elasticsearch, not Neo4j
- KG embeddings pre-computed and served via FAISS (sub-millisecond similarity search)
- Heavy graph algorithms (PageRank, community detection) run as batch jobs, results stored as node properties

### 8. Cost Estimation

| Component | Monthly Cost (Phase 1) | Monthly Cost (Phase 2) |
|-----------|----------------------|----------------------|
| Neo4j Enterprise (3 cores + 2 replicas) | $3,000 | $6,000 |
| Elasticsearch (3-node cluster) | $1,500 | $3,000 |
| Kubernetes cluster (API + pipeline) | $2,000 | $4,000 |
| Kafka (managed) | $500 | $1,000 |
| S3 storage | $200 | $500 |
| Monitoring (Grafana Cloud) | $300 | $500 |
| **Total** | **$7,500/mo** | **$15,000/mo** |

Alternative: AWS Neptune + managed services reduces ops cost but increases vendor lock-in.

### 9. Technology Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Neo4j license cost increase | Medium | High | Maintain JanusGraph migration path |
| Vietnamese NLP accuracy insufficient | Medium | High | Hybrid approach: ML + LLM + human-in-the-loop |
| Graph DB performance at scale | Low | High | Right-size infrastructure, query optimization |
| Team skill gap (graph technology) | High | Medium | Training program, hire graph DB specialist |
| Data source access restrictions | Medium | Medium | Diversify sources, build relationships with data providers |

### Recommendations for B11

1. **Adopt the four-layer reference architecture** (construction, storage, serving, presentation) — it provides clear team boundaries and independent scaling
2. **Choose Neo4j + Elasticsearch + Redis as the core stack** — proven combination with strong community support
3. **Build GraphRAG as the primary LLM integration pattern** — this is the highest-value differentiator for MAESTRO
4. **Start centralized, plan for federation** — centralized KG is simpler to build; federation adds complexity that is premature at Phase 0
5. **Budget for Neo4j Enterprise from Phase 1** — Community Edition lacks clustering and security features needed for production
6. **Invest in team training on graph technologies** — Cypher, graph data modeling, and KG concepts are unfamiliar to most engineers
7. **Maintain a technology migration path** — no vendor lock-in; keep data export capabilities and standard APIs (SPARQL, GraphQL)
