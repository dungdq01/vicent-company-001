---
file: 05-planning
project_id: {{PROJECT_ID}}
phase: P5
filled_by: R-PM
last_updated: {{P5_DATE}}
status: draft | reviewed | active
---

# {{PROJECT_NAME}} — Planning (Sprints · RACI · Risks)

> P5 deliverable. Converts approved design into executable sprint plan.

---

## 0. Document Control

- **PM**: R-PM · {{COO_NAME}}
- **Reviewers**: CEO · CTO · Client PM
- **Plan baseline**: [Fill: locked at this version]
- **Eval**: [Fill ≥ 7.5]

---

## 1. Sprint Overview

- **Total sprints**: [Fill]
- **Sprint length**: [Fill: 1 week / 2 weeks]
- **Start date**: {{START_DATE}}
- **Target completion**: {{TARGET_DATE}}
- **Buffer**: [Fill: % buffer per `15-business-operations`]

---

## 2. Sprint Plan

### Sprint 1: [Fill theme]
- **Dates**: [Fill]
- **Goal**: [Fill: 1 sentence]
- **Deliverables**:
  - [ ] [Fill]
  - [ ] [Fill]
- **Stories**: US-001, US-002, US-005
- **Owner**: [Fill]
- **Demo**: [Fill: end-of-sprint demo target]

### Sprint 2: [Fill]
[Repeat]

### Sprint N: [Fill]
[Repeat]

💡 Hint: Each sprint has demo-able outcome. Avoid "infrastructure-only" sprints.

---

## 3. RACI Matrix

| Activity | R | A | C | I |
|---|---|---|---|---|
| Architecture decisions | R-SA | CTO | CEO · Client tech | All |
| Backend implementation | R-BE / dev | R-PM | R-SA | All |
| ML training | R-MLE | CTO | CEO | All |
| UI implementation | R-FE / dev | R-PM | R-UX | All |
| QA / testing | R-QA | R-PM | R-BE · R-FE | All |
| Deployment | R-DO | CTO | R-SE | All |
| Client comms | R-PM | COO | CEO | All |
| Sign-off | Client PO | CEO | COO | All |

💡 Hint: One A per row. R can be multi.

---

## 4. Resource Plan

### 4.1 Team Allocation
| Role | Hours/week | Sprints active |
|---|---|---|
| {{COO_NAME}} (PM) | [Fill] | All |
| {{CTO_NAME}} (Tech) | [Fill] | All |
| Dev 1 | [Fill] | [Fill] |
| Dev 2 (if any) | [Fill] | [Fill] |
| Agent runs | (cost cap) | All |

### 4.2 Agent Cost Budget
Per `_shared/standards/cost-budgets.md`:
- **Per-phase**: see phase docs
- **Project total cap**: [Fill USD]
- **Daily LLM cap**: $50
- **Hard halt at**: 100% project cap

---

## 5. Dependencies

### 5.1 Internal (between sprints)
| Sprint A | depends on | Sprint B |
|---|---|---|
| [Fill: e.g., S2 ML training] | depends on | [S1 data pipeline] |

### 5.2 External (client / vendor)
| Dependency | Owner | Needed by | Status |
|---|---|---|---|
| Client data dump | {{CLIENT_PO}} | Sprint 1 D3 | [Fill] |
| Vendor API access | [Fill] | Sprint 2 D1 | [Fill] |

### 5.3 Decision SLAs (per SOW §8.3)
- Standard: 3 business days
- Strategic: 5 business days

---

## 6. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R-01 | [Fill: data quality lower than discovery indicated] | M | H | [Fill: pre-Sprint-1 data audit] | R-MLE |
| R-02 | [Fill: client decision SLA missed] | M | M | [Fill: weekly check-in · escalate to CEO] | R-PM |
| R-03 | [Fill ≥ 5 risks] | ... | ... | ... | ... |

💡 Hint: Top 3 risks have explicit mitigation. Tracked weekly in status update.

---

## 7. Communication Plan

Per R-COM-03 + SOW §8:

| Cadence | What | Who |
|---|---|---|
| Daily (async) | Slack standup | All |
| Tue/Thu | Sync call (30m) | R-PM + Client PO |
| End of sprint | Demo + retro | R-PM + Client team |
| Weekly Fri | Status update doc | R-PM → COO → Client |
| Bi-weekly | Stakeholder readout | CEO + Client exec |

---

## 8. Quality Gates Per Sprint

- [ ] Sprint goal achieved (demo-able)
- [ ] All MUST stories pass AC
- [ ] Code review for all PRs
- [ ] Tests added (per pyramid)
- [ ] Eval golden set passes (LLM-touching code)
- [ ] No critical CVE introduced
- [ ] Status update sent

---

## 9. Definition of Done (Project-Level)

→ See [`@../../standards/dod-per-deliverable.md`](../../standards/dod-per-deliverable.md) + [`@../../../experience/workspace/docs/quality/DOD-CHECKLIST.md`](../../../experience/workspace/docs/quality/DOD-CHECKLIST.md).

Project-level:
- [ ] All sprints complete
- [ ] All MUST stories pass UAT
- [ ] Production deployed (per `08-deploy.md`)
- [ ] Documentation complete
- [ ] Knowledge transfer done
- [ ] Client signs P9 acceptance
- [ ] 99-retro.md filed within 7 days

---

## 10. Change Management

Any scope change → SCR per [`_meta/scope-changes/SCR-template.md`](_meta/scope-changes/SCR-template.md).

---

## 11. Sign-Off

- **R-PM eval**: [Fill ≥ 7.5]
- **CEO**: [Fill]
- **Client PO**: [Fill]
- **Plan baselined**: [Fill date]

---

## Cross-References

- P5 phase doc: [`@../../../experience/workspace/docs/pipeline/P5-PLANNING.md`](../../../experience/workspace/docs/pipeline/P5-PLANNING.md)
- R-PM card: [`@../../.agents/tier-4-delivery/R-PM-project-manager.md`](../../.agents/tier-4-delivery/R-PM-project-manager.md)
- Cost budgets: [`@../../standards/cost-budgets.md`](../../standards/cost-budgets.md)

---
*Template v1.0*
