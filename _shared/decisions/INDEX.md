# ADR Index — Framework-Level

> Auto-generated. Last update: 2026-04-27 (manual seed).
> Source: parses frontmatter of all `ADR-*.md` files across 3 ADR locations.
> Spec: `_shared/standards/decision-log-index.md` §4.

---

## By Status

| Status | Count |
|---|---|
| proposed | 0 |
| accepted | 0 |
| superseded | 0 |
| deprecated | 0 |
| **Total** | 0 |

---

## By Decision Type

| Type | Count |
|---|---|
| architecture | 0 |
| tech-stack | 0 |
| pricing | 0 |
| hiring | 0 |
| scope | 0 |
| knowledge | 0 |
| rule | 0 |
| voice | 0 |

---

## By Tag (top 10)

(empty — populated as ADRs are created)

---

## Search Shortcuts

Common queries to expect:
- ADRs about model choice: `tags=[claude-*, gpt-*, model]`
- Architecture decisions for logistics: `tags=[architecture, I06]`
- Pricing changes: `decision_type=pricing`
- Sunset / deprecation: `status=deprecated OR superseded`

---

## Repeat Decision Detection (R-LCY-08)

When same `decision_type + tag` group reaches **3+ ADRs in past year** → systemic gap. Surface to CTO at quarterly framework retro:

```
GROUP BY tags + decision_type
HAVING COUNT(distinct adr_id) >= 3 IN past_year
```

Action: convert ad-hoc decision pattern into default policy (rule or skill card guidance).

---

## Generation

When `_shared/scripts/build-adr-index.sh` is built (Tier 3 task):
- Cron: nightly
- Inputs: glob `**/ADR-*.md`
- Parses frontmatter → updates this INDEX.md
- Commits if changed

Until then: manually update this file when ADRs are added.

---
*Seed v1.0 — 2026-04-27. Replaced by auto-gen when script ready.*
