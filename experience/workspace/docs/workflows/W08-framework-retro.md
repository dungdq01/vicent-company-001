# W08 — Framework-Level Retro (Quarterly)

> Per R-LCY-08. Project retro exists. **Framework retro vắng** — nobody reviews 11 rule files, 6 tier agents, 14 pipeline docs (P0-P10 + Path B/C/D), 12 workflows (W01-W12), 15+ standards. Without this = silent drift to "v1.0 with 50 unwritten exceptions".

**Cadence**: Quarterly (Q1 mid-Mar, Q2 mid-Jun, Q3 mid-Sep, Q4 mid-Dec).
**Owner**: CTO + CEO.
**Duration**: 1 day prep + 4h workshop.
**Output**: `_shared/decisions/framework-retro-{YYYY-Qn}.md` + ADRs for any structural change.

---

## 1. Pre-Workshop Audit (1 day, CTO + R-σ)

### Quantitative metrics

```yaml
audit_metrics:
  rules:
    total_files: 10                # 00-100 + future
    rules_added_this_quarter: ?
    rules_archived: ?              # _archive/ growth
    rules_unlearned: ?              # _unlearn-list.md growth
  
  agents:
    total_skill_cards: 25
    cards_updated_this_quarter: ?
    cards_stale_90d: ?              # red flag
    new_agents_onboarded: ?         # per R-ORC-04
  
  knowledge:
    baselines_active: 12
    baselines_re_researched_this_q: ?
    industries_active: 20
    new_industry_nodes: ?
    quarantined: ?
    archived: ?
  
  pipeline:
    paths_documented: 5             # A/B/C/D + P10
    phase_rewinds_this_q: ?
    rewind_cost_total_usd: ?
  
  decisions:
    adrs_total: ?
    adrs_this_q: ?
    repeat_decisions_pattern: []    # per ADR-index §6
  
  failure_modes:
    catalogue_size: ?
    new_modes_this_q: ?
    accelerating: ?                  # quarterly trend
  
  permanent_fixes:
    project_only: ?
    promote_candidates: ?
    promoted_this_q: ?
```

### Qualitative themes

R-σ scans:
- Top 10 ADRs of quarter
- Top 5 incidents (Sev 1+) and their root causes
- Top 5 successful project retros (positive lessons)
- Pattern across permanent-fix logs

---

## 2. Workshop Agenda (4h)

### Hour 1 — Numbers review
Walk through audit metrics. Flag anything outlier.

**Quarterly business pipeline outputs to consume**:
- M5 monthly optimization reports (4 reports rolled up)
- E3 close-or-renew outcomes per client served this quarter
- BD4 partnership reviews (continue/renegotiate/sunset)
- Pricing-decisions ADRs triggered this quarter

These business pipeline outputs feed framework retro pattern detection (e.g., 3+ partners sunset same root cause = framework gap).

### Hour 2 — Pattern surfacing
- Repeat decisions (3+ times same topic) → systemic gap
- Failure modes accelerating → framework break
- Stale skill cards (>90 days) → owner accountability

### Hour 3 — Structural changes proposed
For each pattern surfaced:
- Decide: rule update / agent change / process change / no-change
- Each change → draft ADR

### Hour 4 — Action items + assignment
- Each ADR → owner + ETA
- Add to `projects/_ops/framework-action-items.md`

---

## 3. Output Template

`_shared/decisions/framework-retro-{YYYY-Qn}.md`:

```markdown
---
type: framework-retro
quarter: 2026-Q2
authors: [CEO, CTO]
date: 2026-06-15
---

## Numbers
{audit_metrics summary}

## Themes
1. [theme name]
   - Evidence: ...
   - Impact: ...
   - Proposed action: ...

## ADRs spawned
- ADR-0089: ...
- ADR-0090: ...

## Action items
| Item | Owner | ETA |
|---|---|---|
| ... | ... | ... |

## Sunset list
- {artifact} — reason — sunset date
```

---

## 4. Cross-Reference

- Lifecycle (sunset cadence): [`@../../../../_shared/rules/90-lifecycle-rules.md`](../../../../_shared/rules/90-lifecycle-rules.md) §R-LCY-08
- ADR index: [`@../../../../_shared/standards/decision-log-index.md`](../../../../_shared/standards/decision-log-index.md)
- Failure modes: [`@../../../../_shared/eval/failure-modes.md`](../../../../_shared/eval/failure-modes.md)

---
*W08 v1.0 — Adopted 2026-04-27. Quarterly meta-loop.*
