# DevOps Engineer Notes: Knowledge Graph (B11)
## By Nguyen Duc Anh (R-DO) — Date: 2026-03-31

### 1. Neo4j Cluster Deployment

**Causal Clustering Architecture**:
- **Core servers (3 minimum)**: Participate in Raft consensus for write operations. All cores hold full data copy.
- **Read replicas (2+ recommended)**: Asynchronous replication from cores. Handle read-heavy API traffic.
- **Routing driver**: Application uses `neo4j://` protocol — driver auto-routes writes to leader, reads to replicas.

**Deployment topology for B11**:
```
Production:
  3x Core Servers (write + read)    — 64GB RAM, 16 vCPU, 500GB NVMe SSD each
  2x Read Replicas (read only)      — 32GB RAM, 8 vCPU, 500GB NVMe SSD each

Staging:
  1x Core Server                    — 32GB RAM, 8 vCPU, 200GB SSD

Development:
  1x Neo4j Community (Docker)       — 16GB RAM, 4 vCPU
```

### 2. Containerized Graph DB Deployment

**Docker Compose (development)**:
```yaml
services:
  neo4j:
    image: neo4j:5-enterprise
    environment:
      NEO4J_AUTH: neo4j/${NEO4J_PASSWORD}
      NEO4J_ACCEPT_LICENSE_AGREEMENT: "yes"
      NEO4J_server_memory_heap_initial__size: 4g
      NEO4J_server_memory_heap_max__size: 8g
      NEO4J_server_memory_pagecache_size: 4g
    ports:
      - "7474:7474"  # Browser
      - "7687:7687"  # Bolt
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
```

**Kubernetes (production)**:
- Use Neo4j Helm chart (official) for cluster deployment
- StatefulSets for core servers with persistent volume claims
- Headless service for internal cluster discovery
- LoadBalancer service for external Bolt access
- Resource requests: Memory is critical — set requests = limits to avoid OOM kills

### 3. Graph Database Monitoring

**Key metrics to monitor**:

| Metric | Source | Alert Threshold |
|--------|--------|----------------|
| Heap usage | JMX / Prometheus | > 85% |
| Page cache hit ratio | Neo4j metrics | < 95% |
| Transaction commit rate | Neo4j metrics | Baseline deviation > 50% |
| Query execution time (p99) | Query log | > 5 seconds |
| Bolt connections active | Neo4j metrics | > 80% of max |
| Disk usage | OS metrics | > 80% |
| Cluster leader changes | Raft metrics | > 1 per hour |
| Replication lag (read replicas) | Neo4j metrics | > 10 seconds |

**Monitoring stack**:
- Neo4j Prometheus endpoint (built-in since 4.x)
- Grafana dashboards with Neo4j-specific panels
- Neo4j query log analysis for slow queries (> 1s)
- Custom alerts via Grafana Alerting to Slack/PagerDuty

### 4. Backup Strategies

**Automated backup pipeline**:

1. **Full backup**: Daily at 02:00 UTC via `neo4j-admin database backup`
2. **Transaction log archival**: Continuous shipping to S3 for point-in-time recovery
3. **Storage**: Backups to S3 (encrypted, versioned bucket)
4. **Retention**: 7 daily + 4 weekly + 12 monthly
5. **Restore testing**: Weekly automated restore to staging, run validation queries

**Backup commands (scripted in cron)**:
```bash
neo4j-admin database backup neo4j --to-path=/backup/full/$(date +%Y%m%d)
aws s3 sync /backup/full/ s3://kg-backups/neo4j/full/ --sse
```

**Recovery Time Objective (RTO)**: < 1 hour
**Recovery Point Objective (RPO)**: < 4 hours (with transaction log shipping: < 5 minutes)

### 5. CI/CD for Ontology Changes

Ontology changes (schema modifications) need the same rigor as code changes:

**Pipeline stages**:
1. **PR with ontology diff**: Ontology changes committed as Cypher migration scripts
2. **Validation**: Automated check that migration is backward-compatible (no dropping existing labels/properties in use)
3. **Test on staging**: Apply migration to staging KG, run integration tests
4. **Canary deployment**: Apply to one read replica first, verify query compatibility
5. **Production rollout**: Apply to all cores during maintenance window

**Migration tooling**:
- Store migrations as numbered Cypher scripts: `V001__add_industry_label.cypher`
- Use Neo4j Migrations (official tool) or custom script runner
- Track applied migrations in a `__migrations` node in the graph

### 6. Infrastructure Sizing

**Critical insight**: Graph databases are RAM-hungry. The entire active working set should fit in page cache for acceptable performance.

**Sizing formula**:
```
Page cache size = (Total graph store size on disk) * 1.2
Heap size = min(31GB, graph_size * 0.3)
Total RAM = Page cache + Heap + OS overhead (4GB)
```

**B11 sizing estimates**:

| Phase | Entities | Triples | Disk | Page Cache | Heap | Total RAM |
|-------|----------|---------|------|------------|------|-----------|
| Phase 0 | 100K | 1M | 2GB | 3GB | 4GB | 11GB |
| Phase 1 | 1M | 10M | 15GB | 18GB | 8GB | 30GB |
| Phase 2 | 10M | 100M | 120GB | 144GB | 31GB | 179GB |

**Disk**: NVMe SSD mandatory. IOPS matter more than capacity for graph workloads.
**CPU**: Graph traversals are single-threaded per query; high clock speed > many cores.

### 7. Networking and Security

- Neo4j Bolt (7687) and HTTP (7474) behind private subnet — no public exposure
- API servers in public subnet communicate to Neo4j via private network
- TLS encryption on all Bolt connections (configure server certificates)
- Network policies (Kubernetes) restricting access to Neo4j pods to only API service pods
- VPN or bastion host for developer access to staging/production databases

### 8. Disaster Recovery

- **Multi-AZ deployment**: Core servers across 3 availability zones (AWS Singapore)
- **Cross-region backup**: Daily backup replicated to a secondary region
- **Failover procedure**: Automatic leader election via Raft if a core server fails
- **Full cluster recovery**: Restore from backup + replay transaction logs
- **Runbook**: Documented step-by-step recovery procedures, tested quarterly

### 9. Log Management

- Neo4j logs shipped to ELK stack or CloudWatch
- **Query log**: All queries > 500ms logged with parameters (sanitized)
- **Security log**: Authentication attempts, role changes
- **Debug log**: Cluster events, garbage collection
- Log retention: 30 days hot (Elasticsearch), 1 year cold (S3)

### Recommendations for B11

1. **Start with Docker Compose for development, Kubernetes Helm chart for production** — the official Neo4j Helm chart handles StatefulSets and discovery correctly
2. **Allocate 70% of server RAM to Neo4j page cache** — this is the single most impactful performance configuration
3. **Use NVMe SSDs exclusively** — spinning disks or network-attached storage will cripple graph traversal performance
4. **Automate backup and test restores weekly** — graph data is expensive to reconstruct; never trust untested backups
5. **Implement CI/CD for ontology migrations** — treat schema changes as code with version control and staging validation
6. **Set up Grafana dashboards before going to production** — page cache hit ratio and query latency are the two metrics that predict problems
7. **Plan for 2x current RAM needs** — graph databases grow in memory requirements faster than expected as relationships multiply
