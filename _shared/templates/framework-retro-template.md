# Framework Retro — {{YYYY-Qn}}

> Quarterly per W08 + R-LCY-08. Audit framework health: rules / agents / knowledge / pipeline / decisions / failure modes.

---

## Metadata

| Field | Value |
|---|---|
| Quarter | {{YYYY-Qn}} |
| Authors | {{CTO + CEO}} |
| Date workshop | {{ISO}} |
| Pre-workshop audit by | {{R-σ + CTO}} |

---

## 1. Numbers (from audit)

```yaml
audit_metrics:
  rules:
    total_files: {{n}}
    rules_added_this_quarter: {{n}}
    rules_archived: {{n}}
    rules_unlearned: {{n}}
  agents:
    total_skill_cards: {{n}}
    cards_updated_this_quarter: {{n}}
    cards_stale_90d: {{n}}
    new_agents_onboarded: {{n}}
  knowledge:
    baselines_active: {{n}}
    baselines_re_researched_this_q: {{n}}
    industries_active: {{n}}
    new_industry_nodes: {{n}}
    quarantined: {{n}}
    archived: {{n}}
  pipeline:
    paths_documented: {{n}}
    phase_rewinds_this_q: {{n}}
    rewind_cost_total_usd: {{n}}
  decisions:
    adrs_total: {{n}}
    adrs_this_q: {{n}}
    repeat_decisions_pattern: []
  failure_modes:
    catalogue_size: {{n}}
    new_modes_this_q: {{n}}
    accelerating: {{yes/no}}
  permanent_fixes:
    project_only: {{n}}
    promote_candidates: {{n}}
    promoted_this_q: {{n}}
```

---

## 2. Themes Surfaced

For each theme, fill:

### Theme {{N}}: {{name}}

**Evidence**:
- bullet
- bullet

**Impact**:
- {{operational / financial / quality / brand}}

**Proposed action**:
- rule update / agent change / process change / no-change

**Cross-references**:
- ADR-{{NNNN}} (if any)
- Failure modes: {{list}}

---

## 3. Repeat Decision Patterns (per `decision-log-index.md` §6)

Query: same `decision_type + tag` cluster ≥ 3 ADRs in past year.

| Cluster | Count | Pattern observed | Proposed default policy |
|---|---|---|---|
| {{decision_type + tags}} | {{n}} | {{recurring decision pattern}} | {{rule? skill card guidance? template?}} |

If any cluster reaches 3+, surface to CTO at workshop — convert to default policy (rule or skill card update).

---

## 4. Stale Asset Audit

| Asset | Stale > 90 days | Owner | Action |
|---|---|---|---|
| Skill card R-{{X}} | yes | CTO | review + freshen OR sunset |
| Knowledge node B0X | yes | R-σ | re-research trigger Path D |
| Rule {{NN}}-{{name}} | yes | CTO | review for relevance |

---

## 5. Failure Mode Trend

```
Quarter-over-quarter chart:
  Q-N-3: ?? new failure modes
  Q-N-2: ?? new
  Q-N-1: ?? new
  Q-N (this): ?? new

Trend: {{stable | accelerating | decelerating}}
```

If accelerating: framework break signal — DEEP investigation required.

---

## 6. Sunset Candidates

Per R-LCY-03 cadence:

| Asset | Reason | Decision |
|---|---|---|
| {{rule path}} | {{age / superseded / wrong}} | sunset / keep / refactor |

ADR for each sunset.

---

## 7. ADRs Spawned This Workshop

- ADR-{{NNNN}}: {{title}}
- ADR-{{NNNN}}: {{title}}

---

## 8. Action Items

| # | Action | Owner | ETA | Status |
|---|---|---|---|---|
| 1 | {{action}} | {{CTO/CEO/COO/R-X}} | {{YYYY-MM-DD}} | open |
| 2 | | | | |

Tracked in `projects/_ops/framework-action-items.md`.

---

## 9. Distribution

- ☐ All founders
- ☐ Public studio retro post (Voice A/B per topic) — optional
- ☐ Update `_shared/.agents/CHANGELOG.md` if agent changes
- ☐ Update `_shared/rules/_archive/` for sunset rules
- ☐ Update `studio/wisdom/what-we-learned.md` if transferable insight

---

## Cross-References

- W08 framework retro: [`@../../experience/workspace/docs/workflows/W08-framework-retro.md`](../../experience/workspace/docs/workflows/W08-framework-retro.md)
- Lifecycle (sunset cadence): [`@../rules/90-lifecycle-rules.md`](../rules/90-lifecycle-rules.md) §R-LCY-08
- ADR index: [`@../standards/decision-log-index.md`](../standards/decision-log-index.md)

---
*Template v1.0 — 2026-04-27.*
