# Backend Engineer Notes: Knowledge Graph (B11)
## By Vo Hoang Nam (R-BE) — Date: 2026-03-31

### 1. API Architecture for KG Access

The backend serves as the access layer between the graph database and consumers (frontend, external systems, LLM agents).

**Layered architecture**:
```
Clients → API Gateway → KG Service Layer → Graph Database
                              ↓
                        Cache Layer (Redis)
```

Two API paradigms to support:
- **GraphQL API** — Primary interface for frontend and application consumers
- **SPARQL Endpoint** — Standards-based interface for data integration and federated queries

### 2. GraphQL API for Knowledge Graphs

GraphQL is a natural fit for KGs because both are graph-structured.

**Schema design**:
```graphql
type Entity {
  id: ID!
  name: String!
  type: EntityType!
  properties: JSON
  relationships(type: String, limit: Int): [Relationship!]!
  incomingRelationships(type: String, limit: Int): [Relationship!]!
}

type Relationship {
  id: ID!
  type: String!
  source: Entity!
  target: Entity!
  properties: JSON
  confidence: Float
  source_provenance: String
}

type Query {
  entity(id: ID!): Entity
  searchEntities(query: String!, types: [EntityType], limit: Int): [Entity!]!
  shortestPath(fromId: ID!, toId: ID!): [Entity!]!
  neighbors(entityId: ID!, depth: Int, relationTypes: [String]): SubGraph!
}
```

**Implementation**: Use Apollo Server (Node.js) or Strawberry (Python) with custom resolvers that translate GraphQL queries to Cypher.

### 3. REST API Endpoints

For simpler integrations and backward compatibility:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/entities/{id} | Get entity by ID |
| GET | /api/v1/entities?q={query} | Search entities |
| GET | /api/v1/entities/{id}/relationships | Get entity relationships |
| GET | /api/v1/paths?from={id}&to={id} | Shortest path |
| POST | /api/v1/entities | Create entity |
| PUT | /api/v1/entities/{id} | Update entity |
| DELETE | /api/v1/entities/{id} | Soft-delete entity |
| POST | /api/v1/triples | Add triple |
| DELETE | /api/v1/triples/{id} | Remove triple |
| GET | /api/v1/subgraph?center={id}&depth={n} | Get neighborhood subgraph |

### 4. SPARQL Endpoint Management

- Deploy SPARQL endpoint via Apache Jena Fuseki or GraphDB
- Sync property graph data to RDF store via scheduled ETL (or use Neo4j-to-RDF mapping plugin neosemantics/n10s)
- Rate limiting on SPARQL endpoint to prevent expensive queries from overloading
- Query timeout: 30 seconds max for interactive queries, 5 minutes for batch
- Whitelist allowed SPARQL query patterns in production to prevent abuse

### 5. Graph Traversal APIs

Specialized endpoints for common graph operations:

- **Neighborhood expansion**: Given entity, return N-hop neighborhood with configurable depth and relation type filters
- **Shortest path**: Dijkstra or BFS between two entities, with optional edge weight
- **Community detection**: Return cluster/community for a given entity
- **Similarity**: Find entities most similar based on graph structure (Jaccard, Adamic-Adar) or embeddings (cosine similarity)

Implementation: Translate to Cypher queries using Neo4j APOC procedures for graph algorithms.

### 6. Caching Strategies

Graph queries can be expensive. Multi-layer caching:

| Layer | Technology | What to Cache | TTL |
|-------|-----------|---------------|-----|
| Application | In-memory (LRU) | Parsed query plans | Session |
| Distributed | Redis | Entity lookups, search results | 15 min |
| CDN | Cloudflare/CloudFront | Static subgraph exports | 1 hour |
| Database | Neo4j page cache | Graph data pages | Auto-managed |

**Cache invalidation**:
- Entity update triggers cache eviction for that entity and its 1-hop neighbors
- Use Redis pub/sub for distributed cache invalidation across API instances
- Search cache: Invalidate on any entity create/update (or use short TTL)

### 7. KG Update APIs (CRUD for Triples)

**Create triple**:
- Validate entity types and relation type against ontology schema
- Check for duplicate triples
- Assign provenance metadata (source, timestamp, user)
- Publish change event to Kafka topic

**Update entity/triple**:
- Version the previous state before updating
- Validate constraints (e.g., cardinality restrictions from ontology)
- Update indexes and invalidate caches

**Delete**:
- Soft delete by default (mark as deprecated with timestamp)
- Hard delete only via admin API with audit trail
- Cascade rules: Deleting an entity marks its relationships as deprecated

### 8. Webhook for KG Change Notifications

Enable external systems to react to KG changes:

- **Event types**: `entity.created`, `entity.updated`, `entity.deleted`, `triple.created`, `triple.deleted`
- **Payload**: Entity/triple data, change type, timestamp, user
- **Delivery**: HTTP POST to registered webhook URLs with retry (3 attempts, exponential backoff)
- **Subscription management**: REST API for registering/unregistering webhooks with filters (entity type, relation type)
- **Implementation**: Kafka consumer that dispatches webhook calls asynchronously

### 9. Multi-Tenant KG Isolation

For serving multiple clients/domains from one platform:

- **Namespace isolation**: Each tenant gets a labeled subgraph (e.g., `tenant_id` property on all nodes)
- **Query enforcement**: Middleware injects tenant filter into every Cypher query
- **Separate databases**: Neo4j 5+ supports multiple databases per instance — strongest isolation
- **API key per tenant**: Authentication layer maps API keys to tenant scopes
- **Resource quotas**: Rate limiting and query complexity limits per tenant

### 10. Technology Stack

- **Runtime**: Node.js (Next.js API routes) or FastAPI (Python) for ML-heavy endpoints
- **GraphQL**: Apollo Server 4
- **Graph driver**: neo4j-driver (official Node.js driver)
- **Cache**: Redis 7 with RedisJSON for structured cache entries
- **Message queue**: Apache Kafka for change events and webhook dispatch
- **Auth**: JWT tokens with role-based access control

### Recommendations for B11

1. **Lead with GraphQL API** — it maps naturally to graph data and gives frontend maximum flexibility
2. **Implement Cypher injection prevention** — never interpolate user input into Cypher strings; use parameterized queries exclusively
3. **Add query complexity analysis** — reject GraphQL queries that would trigger unbounded graph traversals (depth > 5, no limit)
4. **Cache aggressively at the entity level** — entity lookups are the most common operation and highly cacheable
5. **Publish all KG changes to Kafka** — this enables webhooks, search index updates, cache invalidation, and audit logging from a single event stream
6. **Version the API from day one** — KG schemas evolve; /api/v1/ prefix allows non-breaking evolution
7. **Build a SPARQL endpoint as secondary** — most consumers prefer GraphQL/REST, but SPARQL is essential for interoperability with semantic web tools
