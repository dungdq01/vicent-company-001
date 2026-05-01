# _shared/decisions/ — Framework-Level ADRs

> Per `_shared/standards/decision-log-index.md`. Strategic ADRs at framework level (rule changes, agent changes, knowledge structure changes, vendor migration).

**Owner**: CTO (technical) + CEO (strategic) + COO (delivery / process).

---

## Scope

3 ADR storage locations:

| Folder | Scope |
|---|---|
| `business-strategy/decisions/` | Studio-level strategic ADR (pricing, ICP, hiring) |
| **`_shared/decisions/`** (this) | Framework ADR (rules, agents, standards, knowledge structure) |
| `projects/{id}/decisions/` | Per-project ADR (architecture, scope changes) |

Single global counter — `ADR-0001` … incrementing across all 3 locations.

---

## Files

| File | Purpose |
|---|---|
| `README.md` | (this) |
| `INDEX.md` | Auto-generated index per `decision-log-index.md` §4 |
| `ADR-{NNNN}-{slug}.md` | Individual ADRs |

Generation script (planned): `_shared/scripts/build-adr-index.sh` reads frontmatter, builds INDEX.

---

## Conventions

Every ADR file MUST follow frontmatter spec per `decision-log-index.md` §2:

```yaml
---
adr_id: ADR-{NNNN}
title: "Short imperative title"
date: YYYY-MM-DD
status: proposed | accepted | superseded | deprecated
decision_type: architecture | tech-stack | pricing | hiring | scope | knowledge | rule | voice
authority: CTO | CEO | COO | "all-founders"
scope: "framework-wide" | "studio-wide" | "project-{id}"
tags: [from controlled vocabulary]
supersedes: ADR-{NNNN} (if applicable)
superseded_by: ADR-{NNNN} (filled when superseded)
---
```

Tags from controlled vocabulary in `decision-log-index.md` §3.

---

## Cross-References

- Decision log spec: [`@../standards/decision-log-index.md`](../standards/decision-log-index.md)
- Master rule mandating ADR: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-14
- ADR template: [`@../templates/project/ADR-template.md`](../templates/project/ADR-template.md)

---
*v1.0 — created 2026-04-27.*
