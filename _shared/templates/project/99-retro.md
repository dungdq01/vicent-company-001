---
file: 99-retro
project_id: {{PROJECT_ID}}
phase: Post-P9
filled_by: R-σ + R-PM
last_updated: {{RETRO_DATE}}
status: draft | reviewed | filed
required: MANDATORY (R-MAS-10 · R-QAL-09 · blocked invoice closure if missing)
---

# {{PROJECT_NAME}} — Retrospective

> Filed within **7 days** of P9 acceptance. R-FIN blocks final invoice closure if missing.

---

## 0. Meta

- **Project ID**: {{PROJECT_ID}}
- **Outcome**: WON · LOST · CHURNED · COMPLETED
- **Sprint tier**: {{SCOPE_TIER}}
- **Duration**: [Fill: actual weeks vs planned]
- **Final cost**: [Fill USD vs budget]
- **Retro facilitator**: R-σ
- **Attendees**: [Fill: studio team + client if joint retro]

---

## 1. Numbers — Outcome vs Goal

### 1.1 Success Criteria (from intake §5)
| Goal | Target | Actual | Met? |
|---|---|---|---|
| [Fill] | [Fill] | [Fill] | ✅ / ❌ |

### 1.2 Project Metrics
| Metric | Plan | Actual | Δ |
|---|---|---|---|
| Timeline (weeks) | [Fill] | [Fill] | [Fill] |
| Cost (USD) | [Fill] | [Fill] | [Fill] |
| Engine cost ($) | [Fill from cost-budgets] | [Fill] | [Fill] |
| Stories delivered | [Fill] | [Fill] | [Fill] |
| Defects post-launch | [target] | [Fill] | [Fill] |
| Client NPS | — | [Fill 1-10] | — |

---

## 2. What Worked (Keep)

[Fill: 3-7 items · concrete · attributable]

- [Fill: e.g., "Parallel P4a-d saved 4 days; integration review caught 3 conflicts early"]
- [Fill: e.g., "Daily Slack standup with client kept SLA tight"]
- [Fill: e.g., "Helicone cost dashboard caught LLM cost spike on day 12 → optimization saved $200/mo"]

---

## 3. What Didn't (Stop / Fix)

[Fill: 3-7 items · root cause · NOT blame-driven (per blameless retro principle)]

| Issue | Root cause | Impact |
|---|---|---|
| [Fill] | [Fill] | [Fill] |
| [Fill] | [Fill] | [Fill] |

💡 Hint: Use "5 whys". E.g., "missed deadline" → "ML training took longer" → "data was dirtier than discovery showed" → "data audit shallow in P1" → "P1 DoD didn't require data quality scan" → **fix DoD**.

---

## 4. What to Try (Start)

[Fill: 3-5 experiments to try next project]

- [Fill: e.g., "Add data quality scan to P1 DoD"]
- [Fill: e.g., "Pre-record KT modules to reduce live KT to 1h"]
- [Fill: e.g., "Use Claude Haiku for log classification (saves 70% on that task)"]

---

## 5. Process Insights

### 5.1 Pipeline Phase Performance
| Phase | On time? | Quality (eval avg) | Cost vs target |
|---|---|---|---|
| P0 | [Fill] | [Fill] | [Fill] |
| P1 | ... | ... | ... |
| P2 | ... | ... | ... |
| ... | ... | ... | ... |

### 5.2 Agent Performance
| Agent | Eval avg | Failure modes hit | Notes |
|---|---|---|---|
| R-α | [Fill] | [Fill] | [Fill] |
| R-MLE | ... | ... | ... |
| ... | ... | ... | ... |

### 5.3 Tool / Stack
| Tool | Worked? | Notes |
|---|---|---|
| Claude Sonnet | [Fill] | [Fill] |
| Helicone | [Fill] | [Fill] |
| Vercel | [Fill] | [Fill] |
| ... | ... | ... |

---

## 6. Client Feedback

### 6.1 Direct Quotes
[Fill: 1-3 quotes · with permission · anonymize if needed]

### 6.2 NPS / Satisfaction
- **Score**: [Fill 1-10]
- **Reason**: [Fill]
- **Would refer?**: yes / no

### 6.3 Case Study Permission
- [ ] Client agrees to public case study (per SOW §13 confidentiality)
- [ ] Client wants logo redacted
- [ ] Client requires review before publish

→ If yes → trigger C5 (case study production) per content pipeline.

---

## 7. Memory Promotion Candidates

Per R-EXE-13 + R-MAS-05.

For each candidate insight, check transferability per `_shared/standards/memory-hygiene.md`:

| Candidate insight | Transferable? | Promote to | Status |
|---|---|---|---|
| [Fill: e.g., "When forecasting on sparse retail, NBEATS beats Prophet by 20%"] | YES (B01-I02) | `knowledge/docs/memory/B01-learnings.md` | proposed |
| [Fill: e.g., "Client tech maturity Level 2 needs more KT prep"] | YES (cross-project) | `knowledge/docs/memory/cross-project.md` | proposed |
| [Fill: project-specific not transferable] | NO | — | reject |

→ R-σ proposes; CTO reviews monthly; promote ≥ 3-project pattern → skill card update.

---

## 8. Skill Card Updates Triggered

[Fill: any agent skill cards needing update based on this retro]

| Skill card | Proposed change | Rationale (≥ 3 projects?) |
|---|---|---|
| [Fill] | [Fill] | [Fill] |

→ Per R-QAL-07 promotion gate: requires ≥ 3-project pattern + golden set proof.

---

## 9. Eval Golden Set Updates

[Fill: cases to add to golden sets based on what was learned]

| Golden set | Add case | Why |
|---|---|---|
| [Fill] | [Fill: failed case from this project] | [Fill: prevent regression] |

---

## 10. Action Items

| # | Action | Owner | Due | Status |
|---|---|---|---|---|
| 1 | [Fill] | [Fill] | [Fill] | open / done |
| 2 | ... | ... | ... | ... |

💡 Hint: Every action has owner + date. Track completion in next retro / monthly review.

---

## 11. Documentation Updates

- [ ] Pipeline doc updated (if process change identified)
- [ ] Skill card updated (if pattern recurrent)
- [ ] Templates updated (if structural improvement)
- [ ] Rules updated (if rule violation pattern)
- [ ] Memory entry added (per §7)

---

## 12. Final Status

- **Retro completed**: [Fill date]
- **R-FIN unblock invoice**: [ ] Yes [ ] No
- **CTO review of memory promotions**: [Fill date]
- **Action items tracked in**: [Fill: Linear / Notion link]

---

## Cross-References

- P9: [`09-final-package.md`](09-final-package.md)
- Memory hygiene: [`@../../standards/memory-hygiene.md`](../../standards/memory-hygiene.md)
- Memory promotion path: [`@../../../01-FRAMEWORK.md`](../../../01-FRAMEWORK.md) §L1
- Quality rules R-QAL-09: [`@../../rules/70-quality-rules.md`](../../rules/70-quality-rules.md)
- Master rule R-MAS-10: [`@../../rules/00-MASTER-RULES.md`](../../rules/00-MASTER-RULES.md)

---
*Template v1.0 — MANDATORY · blocks invoice closure if missing*
