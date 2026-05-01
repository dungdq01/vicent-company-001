# R-SA Notes: Multi-Tenant SaaS Patterns
**Baseline:** B11 (Knowledge Graph & Semantic AI) — Supplementary Architecture Note  
**Date:** 2026-04-09  
**Source:** PRJ-SCP-001 learnings, generalized for reuse  
**Author:** R-SA (Solution Architect)

---

## 1. Shared Schema + Row-Level Security (RLS)

### Pattern

All tenants share a single database schema. Every table includes a `tenant_id` column. PostgreSQL Row-Level Security enforces isolation at the database level.

### Implementation

```sql
-- 1. Every table has tenant_id as part of composite PK
CREATE TABLE planning_object (
    tenant_id TEXT NOT NULL,
    object_id TEXT NOT NULL,
    ...
    PRIMARY KEY (tenant_id, object_id)
);

-- 2. Enable RLS
ALTER TABLE planning_object ENABLE ROW LEVEL SECURITY;

-- 3. Policy: rows visible only to current tenant
CREATE POLICY tenant_isolation ON planning_object
    USING (tenant_id = current_setting('app.current_tenant')::text);

-- 4. Set tenant context per request (in application middleware)
SET LOCAL app.current_tenant = 'TENANT_A';
-- SET LOCAL scopes to current transaction only (safer than SET)
```

### Safety Controls (Defense in Depth)

1. **RLS as primary gate** — database-level, cannot be bypassed by application bugs
2. **ORM interceptor as secondary gate** — application-level `WHERE tenant_id = :current` on every query
3. **CI/CD cross-tenant test** — automated test attempts to read Tenant A data with Tenant B context; must return 0 rows
4. **Admin bypass** — only `scp_admin` role can disable RLS via `SET ROLE`; all admin queries are audit-logged

### When to Use

- **Fewer than 20 tenants** with similar data volumes
- Team prefers **single migration path** (one schema, one Alembic/Flyway chain)
- Cross-tenant analytics needed (no UNION ALL required)
- Operational simplicity is a priority

### Risks

- RLS policy bugs can expose cross-tenant data — requires rigorous testing
- Performance degradation on very large tables without partitioning (see Section 2)
- `SET LOCAL` must be called in every transaction — missed calls = data leak

---

## 2. Partition Strategy for High-Volume Tables

### When to Partition

Partition by `tenant_id` (LIST partitioning) when a table exceeds ~50M rows across all tenants. Benefits:
- **Query performance:** PostgreSQL prunes partitions not matching the tenant, scanning only 1/N of data
- **Maintenance:** `VACUUM`, `REINDEX` per partition (smaller lock scope)
- **Tenant offboarding:** `DROP` the partition instead of bulk `DELETE`

### Implementation

```sql
CREATE TABLE high_volume_table (
    tenant_id TEXT NOT NULL,
    record_id TEXT NOT NULL,
    ...
    PRIMARY KEY (tenant_id, record_id)
) PARTITION BY LIST (tenant_id);

-- One partition per tenant
CREATE TABLE high_volume_table_tenant_a 
    PARTITION OF high_volume_table FOR VALUES IN ('TENANT_A');
CREATE TABLE high_volume_table_tenant_b 
    PARTITION OF high_volume_table FOR VALUES IN ('TENANT_B');
```

### Partition Threshold Guidelines

| Table Size (all tenants) | Recommendation |
|---|---|
| < 10M rows | No partition needed; RLS alone is sufficient |
| 10M - 50M rows | Optional; partition if query latency is an issue |
| 50M - 500M rows | **Strongly recommended** — partition by tenant_id |
| > 500M rows | Partition by tenant_id + time-based sub-partitioning |

### Indexing on Partitions

Indexes defined on the parent table are automatically created on each partition. Use **partial indexes** for common filter patterns:

```sql
-- Only index rows in active state (skip archived)
CREATE INDEX idx_active_records ON high_volume_table (record_id)
    WHERE status = 'ACTIVE';
```

---

## 3. Feature Toggle Governance

### Pattern

Per-tenant capability toggles control which features are enabled. This supports staggered rollouts, tenant-specific customization, and safe feature management.

### Data Model

```sql
CREATE TABLE feature_toggle (
    tenant_id TEXT NOT NULL,
    feature_key TEXT NOT NULL,     -- e.g., 'lateral_transfer', 'ai_copilot'
    enabled BOOLEAN DEFAULT FALSE,
    config JSONB DEFAULT '{}',     -- feature-specific parameters
    updated_by TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (tenant_id, feature_key)
);

-- Audit trail for toggle changes
CREATE TABLE feature_toggle_audit (
    audit_id SERIAL PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    feature_key TEXT NOT NULL,
    old_value BOOLEAN,
    new_value BOOLEAN,
    old_config JSONB,
    new_config JSONB,
    changed_by TEXT NOT NULL,
    changed_at TIMESTAMP DEFAULT NOW(),
    reason TEXT
);
```

### Propagation Architecture

```
Toggle Change (Admin UI or API)
  │
  ▼
Database Write (feature_toggle table)
  │
  ▼
Event Published (Kafka/Redis Pub-Sub)
  │
  ▼
All Application Instances Invalidate Cache
  │
  ▼
Next Request Reads Fresh Toggle Value
```

**Target propagation time:** <60 seconds from toggle change to all instances reflecting the new value.

### Toggle Categories

| Category | Examples | Change Frequency | Approval Required |
|---|---|---|---|
| **Release toggles** | new_ui_v2, beta_algorithm | Per release cycle | Product owner |
| **Ops toggles** | maintenance_mode, read_only | Emergency | On-call engineer |
| **Business toggles** | lateral_transfer, ai_suggestions | Per tenant contract | Account manager + tenant admin |
| **Experiment toggles** | ab_test_allocation_v2 | Weekly | Data scientist |

---

## 4. Tenant Lifecycle

### Onboarding Checklist

1. **Provision:** Create tenant record, assign `tenant_id`, create partitions for high-volume tables
2. **Configure:** Set default policies, feature toggles (all OFF except core), planning cycle parameters
3. **Integrate:** Configure ERP/WMS connection (API credentials, batch file paths, CDC connector)
4. **Migrate:** Import master data (items, locations, suppliers) with data quality validation gates
5. **Validate:** Run cross-tenant isolation test, data quality gates, end-to-end smoke test
6. **Activate:** Enable tenant in production, set up monitoring dashboards

### Offboarding Checklist

1. **Freeze:** Disable all write operations for tenant (feature toggle: maintenance_mode = ON)
2. **Export:** Generate tenant data export (all tables filtered by tenant_id)
3. **Archive:** Move tenant partitions to cold storage (or snapshot to S3)
4. **Purge:** DROP tenant partitions, remove tenant config, revoke credentials
5. **Audit:** Generate offboarding compliance report with data deletion confirmation

### Tenant Configuration Isolation

Each tenant can have independent settings for:
- Planning cycle (cutoff time, timezone, horizon length)
- Algorithm parameters (safety stock method, ABC thresholds, allocation priority weights)
- Integration endpoints (ERP type, API URL, auth method)
- Feature toggles (which capabilities are enabled)
- RBAC (role definitions, permission matrix)

---

## 5. When Schema-per-Tenant is Better

### Decision Matrix

| Factor | Shared Schema + RLS | Schema-per-Tenant |
|---|---|---|
| Tenant count | **< 20** | **> 20** (migration per-schema becomes manageable with automation) |
| Regulatory requirement | Standard compliance | **Hard data isolation mandate** (e.g., healthcare, government, banking) |
| Data volume variance | Similar across tenants | **10x+ difference** between largest and smallest tenant |
| Tenant-specific schema | All tenants same schema | Tenants need **custom columns or tables** |
| Operational team size | Small (< 5 engineers) | Larger team with **dedicated DBA** |
| Cross-tenant analytics | Required | Not required or done via separate analytics DB |
| Tenant offboarding | Partition DROP sufficient | **Schema DROP** cleaner and faster |

### Migration Path: RLS to Schema-per-Tenant

If you start with RLS and later need to migrate:

1. Create new schema per tenant
2. Copy data: `INSERT INTO tenant_schema.table SELECT * FROM shared.table WHERE tenant_id = 'X'`
3. Update application routing to direct tenant requests to their schema
4. Validate data integrity (row counts, checksums)
5. Drop shared table partitions for migrated tenants
6. This can be done **one tenant at a time** (rolling migration)

---

## References

- **PRJ-SCP-001** — Source of patterns (3-tenant SaaS with RLS + partitioning)
- **PostgreSQL Documentation** — Row Level Security, Declarative Partitioning
- **Martin Fowler** — Multi-Tenancy Patterns (shared database, shared schema, separate database)

---

*Supplementary note by R-SA (Solution Architect) | MAESTRO Knowledge Graph Platform*
