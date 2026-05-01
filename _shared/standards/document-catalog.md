---
file: document-catalog
version: v1.0
last_updated: 2026-04-27
owner: R-σ + COO
status: production
---

# Document Catalog — Studio Ships What

> **META-INDEX only**. Single source of truth for "studio ships gì khi 1 project Sprint A/B/C/D về". Each entry references canonical template + skill card + DoD — KHÔNG duplicate content (R-MAS-01).

When P3 sales receives lead → mở file này → biết Sprint X = ship N docs, owner agent X, template ở Y.

---

## Categories

1. **Client-facing deliverables** (DEL) — what client sees
2. **Internal artifacts** (INT) — studio operates with
3. **Sales / legal** (SAL) — pre-engagement
4. **CS / lifecycle** (CS) — post-engagement
5. **Operations** (OPS) — runtime ledgers

---

## DEL — Client-facing deliverables

| ID | Document | Phase | Owner agent | Template | Sprint |
|---|---|---|---|---|---|
| DEL-01 | Project brief | P0.4 | R-BA | [`00-intake.md`](../templates/project/00-intake.md) | A B C D |
| DEL-02 | Discovery report | P1 | R-α + R-β + R-γ + R-σ | [`01-discovery-report.md`](../templates/project/01-discovery-report.md) | A B C D |
| DEL-03 | Proposal | P2 | R-PM + R-AM + R-σ | [`02-proposal.md`](../templates/project/02-proposal.md) | A B C D |
| DEL-04 | SOW + DPA bundle | P2 (G1) | R-LEG + COO | [`02-sow.md`](../templates/project/02-sow.md) + [`legal/DPA-template.md`](../templates/legal/DPA-template.md) | B C D |
| DEL-05 | Architecture doc | P3 | R-SA + R-AE | [`03-architecture.md`](../templates/project/03-architecture.md) | B C D |
| DEL-06 | Tech stack doc | P3 | R-SA + CTO | [`03-tech-stack.md`](../templates/project/03-tech-stack.md) | B C D |
| DEL-07 | PRD | P3-P4 | R-BA + R-PM | [`04-prd.md`](../templates/project/04-prd.md) | C D |
| DEL-08 | API design | P4a | R-BE | [`04a-api-design.md`](../templates/project/04a-api-design.md) | C D |
| DEL-09 | DB schema | P4b | R-DBE / R-DE | [`04b-db-schema.md`](../templates/project/04b-db-schema.md) | C D |
| DEL-10 | ML spec | P4c | R-MLE / R-DLE | [`04c-ml-spec.md`](../templates/project/04c-ml-spec.md) | C D (if ML) |
| DEL-11 | UI spec | P4d | R-UX + R-FE | [`04d-ui-spec.md`](../templates/project/04d-ui-spec.md) | C D (if UI) |
| DEL-12 | Integration spec | P4e | R-SA + CTO | [`04e-integration.md`](../templates/project/04e-integration.md) | C D |
| DEL-13 | Project plan + RACI | P5 | R-PM | [`05-planning.md`](../templates/project/05-planning.md) | C D |
| DEL-14 | Dev guides | P6 | R-σ + R-TC | [`06-dev-guides.md`](../templates/project/06-dev-guides.md) | C D |
| DEL-15 | QA plan + golden sets | P7 | R-QA | [`07-qa-plan.md`](../templates/project/07-qa-plan.md) | C D |
| DEL-16 | Deploy doc | P8 | R-DO + R-SE | [`08-deploy.md`](../templates/project/08-deploy.md) | D |
| DEL-17 | Final package | P9 | R-PM + R-TC | [`09-final-package.md`](../templates/project/09-final-package.md) | D |
| DEL-18 | Case study (post-P9) | P9.4 | R-σ + CEO sign | [`case-study-template.md`](../templates/case-study-template.md) | A B C D (with consent) |

---

## INT — Internal artifacts

| ID | Document | Trigger | Owner | Template / Spec |
|---|---|---|---|---|
| INT-01 | Project meta | P0 | Engine | [`_meta.json`](../templates/project/_meta.json) |
| INT-02 | Project state | P0 → ongoing | Engine | [`_state.json`](../templates/project/_state.json) |
| INT-03 | ADR (Architecture Decision Record) | Any phase, any time | Author | [`ADR-template.md`](../templates/project/ADR-template.md) |
| INT-04 | SCR (Scope Change Request) | Mid-engagement | R-PM + Client | [`SCR-template.md`](../templates/project/SCR-template.md) |
| INT-05 | Project retro (99-retro) | P9 close + 7 days | R-σ + R-PM | [`99-retro.md`](../templates/project/99-retro.md) |
| INT-06 | Harness manifest | P3 | R-AE | [`harness/manifest.yaml`](../templates/project/harness/manifest.yaml) |
| INT-07 | Guardrails | P5 | R-AE + COO sign | [`harness/guardrails.yaml`](../templates/project/harness/guardrails.yaml) |
| INT-08 | Permanent-fixes log | P0 → ongoing | All agents (write), CTO (review) | [`harness/permanent-fixes.md`](../templates/project/harness/permanent-fixes.md) |
| INT-09 | Postmortem | Sev 0/1 incidents | IC (R-SRE / CTO) | [`postmortem-template.md`](../templates/postmortem-template.md) |
| INT-10 | Framework retro (quarterly) | W08 cadence | CEO + CTO | [`framework-retro-template.md`](../templates/framework-retro-template.md) |
| INT-11 | Process map (BPMN-light) | P1 | R-BA | (within `01-discovery/`) |
| INT-12 | User stories (INVEST) | P1 | R-BA | (within `01-discovery/`) |
| INT-13 | Acceptance criteria (G/W/T) | P2 | R-BA | (within `02-proposal/`) |

---

## SAL — Sales / legal

| ID | Document | Trigger | Owner |
|---|---|---|---|
| SAL-01 | Inbound triage note | Lead inbound | P3 / R-SDR |
| SAL-02 | Discovery call notes | Pre-P0 | P3 / R-AM |
| SAL-03 | NDA | Pre-engagement (ICP-D/E) | R-LEG |
| SAL-04 | Proposal (DEL-03 above) | P2 | R-AM |
| SAL-05 | SOW + DPA (DEL-04 above) | P2 G1 | R-LEG + COO |

---

## CS — Customer Success / lifecycle

| ID | Document | Trigger | Owner | Template |
|---|---|---|---|---|
| CS-01 | Day-60 NPS survey + check-in | P10.1 | R-CS / P3 | (Notion form + cs/day-60.md) |
| CS-02 | Day-90 expansion review | P10.2 | P3 + CEO | (cs/day-90.md) |
| CS-03 | QBR (Quarterly Business Review) | P10.3 | P3 + CEO | [`qbr-template.md`](../templates/qbr-template.md) |
| CS-04 | Annual renewal proposal | P10.4 (T-30) | P3 + CEO | (cs/renewal-{year}.md) |
| CS-05 | Exit interview + churn doc | P10.2 lost / P10.4 non-renewal | P3 | (cs/exit-{date}.md → studio/wisdom/churn-patterns.md) |

---

## OPS — Operations ledgers

| ID | File | Update freq | Owner | Spec |
|---|---|---|---|---|
| OPS-01 | Active paths | per dispatch | Engine / COO | [`projects/_ops/active-paths.json`](../../projects/_ops/active-paths.json) |
| OPS-02 | Resource lock | per dispatch | Engine / COO | [`projects/_ops/resource-lock.json`](../../projects/_ops/resource-lock.json) |
| OPS-03 | Dispatch log | per dispatch | Engine | [`projects/_ops/dispatch-log.jsonl`](../../projects/_ops/dispatch-log.jsonl) |
| OPS-04 | Daily coordination summary | EOD | COO | (projects/_ops/daily-coordination/{date}.md) |
| OPS-05 | Weekly project plan | Mon | P3 | (projects/_ops/week-{YYYY-WW}/plan.md) |
| OPS-06 | Framework action items | from W08 + retro | CTO | (projects/_ops/framework-action-items.md) |
| OPS-07 | Vendor watch review | weekly | R-LLMOps | (`_shared/standards/external-deps-review-{YYYY-WW}.md`) |
| OPS-08 | ADR INDEX (auto-gen) | nightly | R-σ / cron | [`_shared/decisions/INDEX.md`](../decisions/INDEX.md) |
| OPS-09 | Knowledge review queue | per write to staging | R-σ | [`knowledge/staging/_review-queue.yaml`](../../knowledge/staging/_review-queue.yaml) |
| OPS-10 | CHANGELOG (skill cards) | per change | CTO | [`_shared/.agents/CHANGELOG.md`](../.agents/CHANGELOG.md) |
| OPS-11 | CHANGELOG (prompts) | per change | CTO | [`_shared/prompts/CHANGELOG.md`](../prompts/CHANGELOG.md) |
| OPS-12 | Permanent-fixes log | per project failure | All agents | (projects/{id}/harness/permanent-fixes.md) |
| OPS-13 | Structure-README map | on README create/restructure | COO + CTO | [`@../../STRUCTURE-README.md`](../../STRUCTURE-README.md) — ROOT navigator, 43 framework READMEs single-load |
| OPS-14 | Structure-README auto-gen spec | when engine MVP triggers build | CTO | [`@./structure-readme-autogen.md`](structure-readme-autogen.md) — script spec for auto-maintain (deferred) |
| OPS-15 | HOW-TO cookbook | per use case discovery + quarterly W08 review | COO + CTO | [`@../../HOW-TO.md`](../../HOW-TO.md) — task-indexed cookbook, 8 nhóm × 40+ use cases |

---

## MK — Marketing pipeline (M0-M5)

| ID | Document | Phase | Owner | Template / location |
|---|---|---|---|---|
| MK-01 | Positioning doc | M0 | CEO + R-BIZ | `business-strategy/decisions/marketing/positioning-{YYYY-Qn}.md` |
| MK-02 | Channel mix decision | M1 | R-MKT + CEO | `business-strategy/decisions/marketing/channel-mix-{YYYY-Qn}.md` |
| MK-03 | Asset brief (handed to Path C C0) | M2 | R-MKT | `studio/content/{slug}/00-brief.md` |
| MK-04 | Campaign plan + UTM config | M3 | R-MKT | `business-strategy/decisions/marketing/campaigns/{YYYY-Qn-slug}/M3-*.md` |
| MK-05 | Performance report | M4 | R-MKT + R-DA | `business-strategy/decisions/marketing/reports/weekly-{YYYY-Wnn}.md` + `campaigns/.../M4-final-report.md` |
| MK-06 | Optimization log | M5 | R-MKT + CEO | `business-strategy/decisions/marketing/optimization-{YYYY-Mnn}.md` |

---

## EX — Expansion playbook (E0-E3)

| ID | Document | Phase | Owner | Template / location |
|---|---|---|---|---|
| EX-01 | Health classification | E0 | R-CS | `projects/{id}/cs/E0-health-{YYYY-MM}.md` |
| EX-02 | Opportunities ranked | E1 | R-CS + R-AM | `projects/{id}/cs/E1-opportunities-{YYYY-MM}.md` |
| EX-03 | Pitch draft | E2 | R-AM | `projects/{id}/cs/E2-pitch-{YYYY-MM}/proposal-draft.md` + objection-prep.md |
| EX-04 | Outcome (expanded/renewed/lost) | E3 | R-AM + R-LEG | If expanded: new project P0; if lost: `cs/exit-{date}.md` + cooldown-tracker |

---

## PT — Partnership pipeline (BD0-BD4)

| ID | Document | Phase | Owner | Template / location |
|---|---|---|---|---|
| PT-01 | Candidates list ranked | BD0 | R-BIZ + CEO | `business-strategy/decisions/partnership/candidates-{YYYY-Qn}.md` |
| PT-02 | Outreach + exploratory call notes | BD1 | R-BIZ + CEO | `business-strategy/decisions/partnership/{partner-slug}/BD1-*.md` |
| PT-03 | Terms draft + signed agreement + ADR | BD2 | CEO + R-LEG | `business-strategy/decisions/partnership/{partner-slug}/BD2-*.md` + `ADR-{NNNN}-partnership-{slug}.md` |
| PT-04 | GTM plan + execution log | BD3 | R-BIZ + R-MKT | `business-strategy/decisions/partnership/{partner-slug}/BD3-gtm-{YYYY-Qn}.md` |
| PT-05 | Quarterly review + sunset (if applicable) | BD4 | CEO + COO | `business-strategy/decisions/partnership/{partner-slug}/BD4-review-{YYYY-Qn}.md` + sunset playbook docs |

---

## PR — Pricing decisions (standards reference, NOT pipeline)

| ID | Document | Trigger | Owner | Location |
|---|---|---|---|---|
| PR-01 | Pricing decision flow + matrix + custom exception | Trigger-based per `pricing-decisions.md` §1 | COO + CEO | `_shared/standards/pricing-decisions.md` (canonical) + `business-strategy/10-pricing-sheet.md` (canonical prices) + ADRs per change |

---

## Path B — Internal product (different deliverable set)

| ID | Document | Phase | Template / location |
|---|---|---|---|
| PB-01 | Product idea triage | B0 | `business-strategy/04-capability-catalog.md` parking-lot |
| PB-02 | Product spec | B2 | `studio/products/{product-id}/01-spec.md` |
| PB-03 | Product artifact (PDF/course/tool) | B3 | `studio/products/{product-id}/v{n}/` |
| PB-04 | Beta tester feedback | B4 | (Notion form + per-tester notes) |
| PB-05 | Launch tracking | B6 | `business-strategy/03-goals-and-roadmap.md` KPI |

---

## Path C — Content piece (different)

| ID | Document | Phase | Template / location |
|---|---|---|---|
| PC-01 | Content brief | C0-C1 | `studio/content/{slug}/00-brief.md` |
| PC-02 | Draft (engine + owner edit) | C2-C3 | `studio/content/{slug}/02-final.md` |
| PC-03 | Published distribution | C5 | `studio/content/{slug}/03-published.md` |
| PC-04 | High-performer hook (if viral) | C7 | `studio/wisdom/high-performer-hooks.md` |

---

## Path D — Knowledge research

| ID | Document | Phase | Owner |
|---|---|---|---|
| PD-01 | Research scope brief | D1 | CEO |
| PD-02 | β fresh research output (staging) | D2 | R-α/β/γ/σ → `knowledge/staging/` |
| PD-03 | K-review decision | D3 | R-σ + CEO sign |
| PD-04 | Promoted knowledge (to data/) | D4 | (auto from approved staging) |

---

## Sprint Tier × Documents

Quick reference: which DELs ship per Sprint tier.

| Sprint | DEL ships | Internal artifacts always | Lifecycle |
|---|---|---|---|
| **A** ($500-1.5K, POC, P0-P2) | DEL-01, 02, 03 | INT-01, 02, 06, 08; OPS-01-03 | CS-01 (Day-60) |
| **B** ($3-5K, +arch, P0-P3) | A + DEL-05, 06 | + INT-07 (P5 if reach) | + CS-02 (Day-90) |
| **C** ($10-15K, full design, P0-P7) | B + DEL-07, 08, 09, 10, 11, 12, 13, 14, 15 | + INT-09 (postmortem) | + CS-03 (QBR for retainer) |
| **D** ($25-50K+, build+ship, P0-P9) | C + DEL-16, 17, 18 | + INT-10 (framework retro touchpoint) | + CS-04 (annual) |

→ "Bật mode" cho Sprint X = pick rows + invoke owner agents. Engine has the manifest.

---

## Cross-References

- Master rule single-source: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-01
- Pipeline phase docs: [`@../../experience/workspace/docs/pipeline/`](../../experience/workspace/docs/pipeline/)
- All templates: [`@../templates/`](../templates/)
- Skill cards (owners): [`@../.agents/`](../.agents/)
- DoD per deliverable: [`@./dod-per-deliverable.md`](dod-per-deliverable.md)
- Glossary: [`@./glossary.md`](glossary.md)

---
*v1.0 — Adopted 2026-04-27. META-INDEX only — references canonical, no duplicates.*
