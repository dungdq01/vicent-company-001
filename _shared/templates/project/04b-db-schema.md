---
file: 04b-db-schema
project_id: {{PROJECT_ID}}
phase: P4b
filled_by: R-DBE / R-DE
last_updated: {{P4_DATE}}
status: draft | reviewed | signed
---

# {{PROJECT_NAME}} — Database Schema

> P4b deliverable. Postgres-first DDL + indexes + migration plan.

---

## 0. Document Control

- **Author**: R-DBE / R-DE
- **Reviewers**: R-BE (consumer) · R-MLE (if ML uses) · CTO
- **Eval**: [Fill ≥ 7.5]
- **DDL file**: [`./schema.sql`](./schema.sql) (companion · authoritative)
- **ER diagram**: [`./er-diagram.mmd`](./er-diagram.mmd) (Mermaid)

---

## 1. Overview

- **Engine**: Postgres [Fill: 16]
- **Hosting**: [Fill: Supabase / Neon / RDS]
- **ORM**: [Fill: Drizzle · Prisma]
- **Migration tool**: [Fill: drizzle-kit · prisma migrate · Atlas]
- **Conventions**: snake_case tables (plural) · snake_case columns (singular) · `id` UUID primary key default

---

## 2. ER Diagram

```mermaid
erDiagram
  users ||--o{ projects : owns
  projects ||--o{ tasks : has
  [Fill more]
```

---

## 3. Tables

### 3.1 `users`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, default gen_random_uuid() | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | indexed |
| name | VARCHAR(255) | NOT NULL | |
| role | TEXT | NOT NULL, CHECK (role IN ('admin','user','viewer')) | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | trigger updates |
| deleted_at | TIMESTAMPTZ | NULL | soft delete (per policy §6) |

**Indexes**:
- `idx_users_email` (UNIQUE on email)
- `idx_users_role` (on role)

**RLS** (if Supabase): [Fill policy]

### 3.2 `[Table name]`
[Repeat structure]

---

## 4. Foreign Keys

| FK | From | To | On Delete |
|---|---|---|---|
| fk_projects_user | projects.user_id | users.id | RESTRICT |
| [Fill] | ... | ... | CASCADE / RESTRICT / SET NULL |

💡 Hint: Default RESTRICT (safe). CASCADE only with explicit rationale.

---

## 5. Indexing Strategy

Per R-DBE-card: 1 index per top-3 hot queries · avoid over-indexing (write cost).

| Index | Table | Columns | For query |
|---|---|---|---|
| `idx_projects_user_status` | projects | (user_id, status) | "list projects by user filtered by status" |
| [Fill ≥ 3] | ... | ... | ... |

**Vector index** (if RAG):
```sql
CREATE INDEX ON {{table}} USING ivfflat (embedding vector_cosine_ops);
```

---

## 6. Soft Delete & Retention

- **Soft delete columns**: `deleted_at TIMESTAMPTZ NULL` on [Fill: list tables]
- **Retention**: [Fill: hard-delete after N days for GDPR]
- **Audit**: [Fill: separate `audit_log` table or trigger-based]

---

## 7. Triggers & Functions

| Name | Type | Purpose |
|---|---|---|
| `set_updated_at` | trigger | Auto-update `updated_at` on UPDATE |
| [Fill] | ... | ... |

---

## 8. Constraints & Business Rules

[Fill: CHECK constraints · partial indexes · domain rules enforced at DB level]

---

## 9. Migrations

### 9.1 Initial Schema
File: `migrations/0001_init.sql`

### 9.2 Migration Strategy
- **Zero-downtime**: expand → backfill → contract pattern
- **Big-table ALTER**: [Fill: estimate cost · maintenance window if needed]
- **Rollback plan**: every migration has down script

### 9.3 Seed Data
File: `seeds/seed.sql` — for dev/staging only, NOT prod.

---

## 10. Performance Considerations

### 10.1 Expected Query Patterns
| Pattern | Frequency | Latency target | Index used |
|---|---|---|---|
| [Fill] | [hourly/per-request] | [Fill] | [Fill] |

### 10.2 Hot Tables
[Fill: identify N+1 risk · plan for read replicas if scale]

### 10.3 Partition Strategy (if needed)
[Fill: time-series partitioning · etc.]

---

## 11. Backup & DR

Per R-SEC-12:
- Daily backup · 30-day retention · cross-region · encrypted
- Restore drill: quarterly (R-OPS owns)
- RPO ≤ 24h · RTO ≤ 4h

---

## 12. Security

### 12.1 Data Classification per Column
| Table.column | Classification | Encryption |
|---|---|---|
| users.email | Internal | At rest + transit |
| users.password_hash | Confidential | Argon2id (no plaintext ever) |
| [Fill PII columns] | Confidential / PII | Column-level if highly sensitive |

### 12.2 Access Control
- **App role** (`{{APP_DB_USER}}`): least privilege per table (SELECT/INSERT/UPDATE only)
- **Migration role**: separate; only used by CI/CD
- **Read-only role**: for analytics

### 12.3 Audit Logging
[Fill: which tables/columns audited · how (trigger / app-side)]

---

## 13. ML / Analytics Tables (if applicable)

### 13.1 Feature Store Tables
[Fill]

### 13.2 Model Predictions Table
[Fill: track inputs · outputs · model version · timestamp · confidence]

### 13.3 Vector / Embeddings
[Fill: pgvector setup · dimension · index]

---

## 14. Sign-Off

- **R-DBE eval**: [Fill]
- **R-BE consumer review**: [Fill]
- **CTO**: [Fill]

---

## Cross-References

- PRD: [`04-prd.md`](04-prd.md)
- API: [`04a-api-design.md`](04a-api-design.md)
- ML: [`04c-ml-spec.md`](04c-ml-spec.md)
- Security rules: [`@../../rules/60-security-rules.md`](../../rules/60-security-rules.md)
- R-DBE card: [`@../../.agents/tier-2-engineering/R-DBE-database-engineer.md`](../../.agents/tier-2-engineering/R-DBE-database-engineer.md)

---
*Template v1.0*
