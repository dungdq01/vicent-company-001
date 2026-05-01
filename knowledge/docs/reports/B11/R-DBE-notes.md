# Database Engineer Notes: Knowledge Graph (B11)
## By Pham Van Thanh (R-DBE) — Date: 2026-03-31

### 1. Graph Database Comparison

| Feature | Neo4j | ArangoDB | Amazon Neptune | JanusGraph |
|---------|-------|----------|---------------|------------|
| Model | Property Graph | Multi-model (doc+graph+KV) | Property Graph + RDF | Property Graph |
| Query Language | Cypher | AQL | Gremlin, SPARQL | Gremlin |
| Scaling | Causal clustering | Sharded clusters | Managed, auto-scaling | Distributed (Cassandra/HBase) |
| License | Community (GPL) / Enterprise | Apache 2.0 | Proprietary (AWS) | Apache 2.0 |
| Maturity | Very high | Medium | High | Medium |
| Vietnam hosting | Self-hosted / Aura cloud | Self-hosted | AWS Singapore region | Self-hosted |
| Max nodes (practical) | Billions (Enterprise) | Hundreds of millions | Billions | Billions |
| ACID | Full | Full | Full | Eventual (tunable) |

### 2. RDF Stores

| Store | Strengths | Weaknesses |
|-------|-----------|------------|
| Blazegraph | Fast SPARQL, used by Wikidata | Single-node, development halted |
| GraphDB (Ontotext) | Enterprise reasoning, SHACL | Commercial license cost |
| Apache Jena Fuseki | Open source, standards compliant | Slower at scale |
| Stardog | Enterprise features, virtual graphs | Expensive licensing |
| Amazon Neptune | Managed, both RDF + property graph | AWS lock-in |

### 3. Property Graph vs RDF Tradeoffs

| Aspect | Property Graph | RDF |
|--------|---------------|-----|
| Schema flexibility | Schema-optional, very flexible | Ontology-based (RDFS/OWL) |
| Query language | Cypher (intuitive) | SPARQL (powerful, verbose) |
| Reasoning | Manual rules | Built-in inference (OWL) |
| Interoperability | Vendor-specific formats | W3C standards, linked data |
| Edge properties | Native support | Requires reification (verbose) |
| Learning curve | Lower | Higher |
| Ecosystem | Application-focused | Semantic web, academia |
| Best for | Application KGs | Data integration, reasoning |

**Recommendation for B11**: Start with property graph (Neo4j) for application layer; export to RDF for interoperability and reasoning when needed.

### 4. Schema Design for Knowledge Graphs

**Node types** (labels in Neo4j):
- Entity types from ontology: Person, Organization, Location, Product, Event, Document
- Domain-specific: Disease, Drug, BankAccount, LegalEntity, etc.

**Design principles**:
- Use fine-grained labels: `(:Company:Organization)` rather than just `(:Organization)` with type property
- Store frequently queried attributes as node properties, rare ones as connected nodes
- Use relationship types for semantics: `-[:FOUNDED_BY]->` not `-[:RELATED_TO {type: "founded"}]->`
- Temporal modeling: Add `valid_from`, `valid_to` properties on relationships
- Provenance: Every relationship carries `source`, `confidence`, `extracted_date` properties

### 5. Indexing Strategies

**Neo4j indexes**:
- **B-tree index**: Default for exact match and range queries on properties
- **Full-text index** (Lucene-backed): For text search on entity names and descriptions
- **Composite index**: For queries filtering on multiple properties simultaneously
- **Node label index**: Automatic, speeds up label-based scans

**Index recommendations**:
```cypher
CREATE INDEX entity_name FOR (n:Entity) ON (n.name);
CREATE INDEX entity_external_id FOR (n:Entity) ON (n.external_id);
CREATE FULLTEXT INDEX entity_search FOR (n:Entity) ON EACH [n.name, n.aliases, n.description];
CREATE INDEX rel_confidence FOR ()-[r:RELATED_TO]-() ON (r.confidence);
```

### 6. Query Optimization

**Cypher optimization**:
- Use `PROFILE` and `EXPLAIN` to analyze query plans
- Start traversals from the most selective node (use index hints with `USING INDEX`)
- Limit path length in variable-length patterns: `(a)-[:KNOWS*1..3]->(b)` not `*`
- Use `WITH` to reduce cardinality early in the query pipeline
- Avoid `OPTIONAL MATCH` in performance-critical paths

**SPARQL optimization**:
- Place most selective triple patterns first
- Use `FILTER EXISTS` instead of `OPTIONAL` + `BOUND`
- Leverage named graphs for partitioning
- Materialize frequently queried inferred triples

**Gremlin optimization**:
- Use `.has()` steps early to filter
- Prefer `.local()` scope for per-element operations
- Use `.barrier()` to force bulk processing

### 7. Scaling Graph Databases

**Neo4j Causal Clustering**:
- Core servers (3-5): Raft consensus, handle writes
- Read replicas (N): Scale read throughput horizontally
- Bookmarks for causal consistency across reads after writes

**Sharding strategies** (for JanusGraph/Neptune):
- Partition by entity type or domain
- Co-locate densely connected subgraphs on same shard
- Cross-shard traversals are expensive — design to minimize them

**Scaling benchmarks** (Neo4j Enterprise):
- 10M nodes, 100M relationships: Single instance, 32GB RAM
- 100M nodes, 1B relationships: 3-node cluster, 64GB RAM each
- 1B+ nodes: Consider JanusGraph on Cassandra or Neptune

### 8. Backup and Replication

**Neo4j backup strategy**:
- **Online backup**: `neo4j-admin backup` — consistent snapshot without downtime
- **Incremental backup**: Only changed transaction logs since last backup
- **Schedule**: Full backup daily, incremental every 4 hours
- **Retention**: 7 daily + 4 weekly + 3 monthly backups
- **Test restores**: Weekly automated restore to staging environment

**Replication**:
- Neo4j causal clustering provides automatic replication across core servers
- For disaster recovery: Async replication to a secondary data center
- Read replicas can serve as warm standby

### 9. Migration Path

For B11, the recommended progression:

1. **Phase 0-1**: Neo4j Community Edition, single instance, < 1M triples
2. **Phase 2**: Neo4j Enterprise, causal cluster (3 cores), 1-50M triples
3. **Phase 3**: Add read replicas for API serving, RDF export layer for interoperability
4. **Phase 4** (if needed): Evaluate Neptune or JanusGraph for billion-scale

### Recommendations for B11

1. **Choose Neo4j as the primary graph database** — strongest ecosystem, Cypher is most productive query language, best tooling
2. **Design schema around the ontology from day one** — retroactive schema changes in graph DBs are costly migrations
3. **Index all entity name fields and external IDs** — these are the most common query entry points
4. **Plan for 64GB+ RAM per graph server** — graph traversals are RAM-intensive; disk-based fallback is 10-100x slower
5. **Implement backup automation immediately** — graph data is hard to reconstruct; treat backups as critical infrastructure
6. **Keep an RDF export capability** — even if primary store is property graph, RDF export enables standards-based interoperability
7. **Monitor query performance continuously** — a single bad Cypher query (unbounded path) can bring down the entire database
