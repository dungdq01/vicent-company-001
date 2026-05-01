---
file: decision-log-index
version: v1.0
last_updated: 2026-04-27
owner: COO
status: production
---

# Decision Log Index — ADR Archaeology

> ADR template tồn tại (per R-MAS-14). Sau 12 tháng = 50-100 ADR scatter. Search = grep manual = nobody finds. File này = index + tagging convention.

---

## 1. ADR Storage Locations

```
business-strategy/decisions/      ← studio-level strategic ADR
projects/{id}/decisions/          ← per-project ADR
_shared/decisions/                ← framework-level ADR (rule changes, agent changes, knowledge structure)
```

Each ADR file: `ADR-{NNNN}-{slug}.md` numbered globally — single counter across all locations.

---

## 2. ADR Frontmatter Convention (mandatory)

```yaml
---
adr_id: ADR-0042
title: "Use NBEATS for VN sparse retail forecasting"
date: 2026-04-15
status: proposed | accepted | superseded | deprecated
decision_type: architecture | tech-stack | pricing | hiring | scope | knowledge | rule
authority: CTO | CEO | COO | "all-founders"
scope: project P-202604-003 | studio-wide
tags: [forecasting, B01, retail, I01, vn-market]
supersedes: ADR-0017      # if applicable
superseded_by: ADR-0089   # filled when superseded
---
```

Tags MUST come from controlled vocabulary (next section).

---

## 3. Controlled Tag Vocabulary

To enable search, tags must be from approved list — propose new via ADR-0000 (meta-ADR).

```yaml
tag_categories:
  baseline: [B01, B02, ..., B12]
  industry: [I01, I02, ..., I20, I-MMO]
  agent: [R-alpha, R-beta, R-AE, R-MLE, ...]
  rule_domain: [MAS, STK, COD, EXE, DOC, COM, SEC, QAL, HRN, LCY, ORC]
  region: [vn, sg, th, id, ph, my, jp, kr, global]
  decision_type: [architecture, tech-stack, pricing, hiring, scope, knowledge, rule, voice]
  outcome: [reverted, succeeded, partial, in-progress]
  blast_radius: [project-only, studio-wide, irreversible]
```

---

## 4. Index File

Auto-generated `_shared/decisions/INDEX.md`:

```markdown
# ADR Index (auto-generated 2026-04-27)

## By status
- accepted: 23
- proposed: 4
- superseded: 8
- deprecated: 3

## By decision_type
- architecture: 12
- tech-stack: 9
- ...

## By tag (top 10)
- B01: 7 ADR
- claude-sonnet: 5
- ...

## Search shortcuts
- Find ADR about model choice: tags=[claude-*, gpt-*, model] → 8 ADR
- Find architecture decisions for logistics: tags=[architecture, I06] → 4 ADR
```

Generation script: `_shared/scripts/build-adr-index.sh` (parse frontmatter, count, link).

---

## 5. ADR Lifecycle

| Stage | Owner | Action |
|---|---|---|
| Propose | Anyone | Draft ADR with `status: proposed`, post to `#decisions` |
| Review | Authority owner | Comment, request revisions, sign |
| Accept | Authority owner | `status: accepted` + commit |
| Implement | Project / studio | Reference ADR ID in commit messages, file links |
| Supersede | New ADR | Old ADR `status: superseded` + `superseded_by: {new_id}` |
| Deprecate | Authority owner | When context changes, mark `deprecated` (don't delete — audit trail) |

---

## 6. Repeat Decision Detection

R-LCY-08 framework retro tracks: same decision revisited 3+ times = systemic gap.

Quarterly query:
```
GROUP BY tags + decision_type
HAVING COUNT(distinct adr_id) ≥ 3 IN past_year
```

Surface to CTO: "We made decisions about Sonnet vs Haiku 5 times — should be a default policy, not per-project ADR."

---

## 7. Anti-Patterns

- ❌ Decision made in Slack thread, no ADR — "doesn't exist" per R-MAS-14
- ❌ ADR with `tags: []` — unsearchable
- ❌ Multiple ADR with conflicting status (one accepted, another superseded but the accepted one not updated)
- ❌ ADR-0000 hijack (meta-ADR for vocabulary updates only)
- ❌ Long-form essay without explicit decision — ADR is "we chose X over Y because Z", not a research report

---

## 8. Cross-References

- Master rule on documentation: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-14
- ADR template: [`@../templates/project/ADR-template.md`](../templates/project/ADR-template.md)
- Framework retro: [`@../../experience/workspace/docs/workflows/W08-framework-retro.md`](../../experience/workspace/docs/workflows/W08-framework-retro.md)

---
*v1.0 — Adopted 2026-04-27.*
