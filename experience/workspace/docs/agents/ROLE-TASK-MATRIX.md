# Role-Task Matrix
**Manager pre-dispatch lookup table — MANDATORY before every dispatch.**

> Rule: Given a task, find the OWNER. If the agent you planned to dispatch is not in the OWNER column → REASSIGN before sending.
> Cross-reference: See `SYSTEM-PROMPTS.md` for per-agent CAN/CANNOT DO detail.
> Enforced by: RULE 9 in `KICKOFF-PROMPT.md`.

---

## How to Use

1. Identify the task type from the list below.
2. Check the OWNER column → that is the ONLY role you may dispatch.
3. If multiple tasks exist → create MULTIPLE dispatches (one per role), never combine.
4. If a task spans 2 roles (e.g. R-MLE + R-DE) → split into 2 sequential or parallel dispatches with explicit handoff.

---

## Section 1 — Research & Analysis (P0–P2)

| Task | Owner | ❌ NOT |
|------|-------|--------|
| Domain context, industry deep-dive | R-Dxx (domain expert) | R-MLE, α |
| Business problem analysis, requirements | R-BA | R-PM, α |
| ML approach research, algorithm selection research | α (Dr. Archon) | R-MLE, β |
| Feasibility scoring, risk assessment | γ (Dr. Sentinel) | R-BA, R-PM |
| Technical stack research | β (Dr. Praxis) | R-MLE, R-SA |
| Proposal writing | R-BA + R-PM | α, γ |
| Gap pre-scan (`gap-pre-scan.json`) | System (P0) | any sprint role |

---

## Section 2 — Architecture & Design (P3–P4)

| Task | Owner | ❌ NOT |
|------|-------|--------|
| System architecture design (`architecture.md`) | R-SA | R-MLE, R-BE, R-PM |
| Tech stack selection (`layer2/beta-tech-review.md`) | β | R-SA, R-MLE |
| API design (`api-design.md`) | R-BE | R-MLE, R-DE, R-SA |
| Database schema, ERD (`database-design.md`) | R-DBE | R-DE, R-BE |
| ML algorithm spec (`algorithm-spec.md`) | R-MLE | R-DE, R-SA, β |
| Data pipeline architecture (data flow in `algorithm-spec.md`) | R-DE (support R-MLE) | R-MLE alone, R-BE |
| UI/UX design, wireframes (`ui-design.md`) | R-FE | R-BE, R-DE |
| Integration consistency review (`integration-review.md`) | R-SA | R-MLE, R-PM |
| Cloud infrastructure design | R-CE | R-DO, R-SA |
| Security review | R-SE | R-CE, R-SA |
| Project plan, WBS, sprint breakdown (`project-plan.md`) | R-PM | R-SA, R-BA |

---

## Section 3 — ML Engineering (Sprint)

| Task | Owner | ❌ NOT |
|------|-------|--------|
| Model training / retraining | R-MLE | R-DE, R-PM |
| Beat rate / WMAPE evaluation | R-MLE | R-DE, R-SA |
| Walkforward cross-validation | R-MLE | R-DE |
| Feature engineering specification | R-MLE | R-DE alone |
| Model variant evaluation (A/B, champion/challenger) | R-MLE | R-SA, R-PM |
| Confidence / prediction interval logic | R-MLE | R-DE |
| Algorithm spec update (sprint discovery) | R-MLE | R-SA, R-PM |
| Evaluation report (`evaluation_report.md`) | R-MLE | R-DE, R-PM |
| Monitoring output files (beat rate JSON, WMAPE JSON, flags CSV) | R-MLE | R-DE, R-FE |
| F_SPPT / accessory forecast config | R-MLE | R-DE |
| Post-processing logic (`postprocessor.py`) | R-MLE | R-DE |
| MLOps: drift detection, retraining trigger logic | R-MLE | R-DE, R-DO |

---

## Section 4 — Data Engineering (Sprint)

| Task | Owner | ❌ NOT |
|------|-------|--------|
| ETL / ingestion pipeline code | R-DE | R-MLE, R-BE |
| Reconciliation logic (`reconciler.py`) | R-DE | R-MLE |
| Output builder / schema enforcer (`output_builder.py`) | R-DE | R-MLE |
| 22-field output schema, DRP adapter | R-DE | R-MLE |
| Data quality checks, validation rules | R-DE | R-MLE, R-SA |
| Feature store design and population | R-DE (with R-MLE spec) | R-MLE alone, R-DBE alone |
| Monthly production entry point (`run_monthly.py`) | R-DE | R-MLE, R-BE |
| Operational refresh procedure (`operational-refresh.md`) | R-DE | R-MLE, R-PM |
| **Data app embedded in Python codebase** (reads DataFrames, served via Python runtime) | **R-DE** | **❌ R-FE, R-MLE** |
| **Programmatically generated report file** (HTML/CSV/JSON from data pipeline) | **R-DE** | **❌ R-MLE, R-FE** |
| Data pipeline section of architecture notes | R-DE | R-MLE, R-SA |

---

## Section 5 — Frontend Engineering (Sprint / P4d / P6)

> ⚠️ **FE COLLABORATION RULE** — Frontend work on data-heavy systems requires a 3-step protocol before any UI code:
> 1. **R-FE MUST read** the API contract (`api-design.md`) and data schema from R-DE/R-BE first.
> 2. **R-FE MUST align** with R-UX on user flows before coding component structure.
> 3. **R-FE dispatches as LAST** in sequence after data layer (R-DE/R-BE) is confirmed — never in parallel with uncertain data contracts.
>
> Violation = wasted sprint. FE built on unconfirmed schema = rework.

| Task | Owner | ❌ NOT | Prerequisite |
|------|-------|--------|-------------|
| **User-facing web UI** (dedicated frontend, component-based, served via browser) | **R-FE** | **❌ R-DE, R-MLE** | api-design.md locked |
| Component architecture, state management | R-FE | R-BE, R-DE | ui-design.md approved |
| User flow diagrams, page inventory | R-FE (with R-UX) | R-BE, R-PM | business requirements |
| API integration map (FE side) | R-FE | R-BE | api-design.md + ui-design.md |
| Frontend dev guide (`dev-guide-frontend.md`) | R-FE | R-TC, R-BE | P6 sequence |
| Accessibility requirements | R-FE | R-UX alone | ui-design.md |
| UX research, user journey mapping | R-UX | R-FE | P2/P3 phase |

**Boundary: R-FE vs R-DE — decision is based on OUTPUT TYPE, not framework name**

> ⚠️ Framework choice (e.g. which JS library, which Python viz tool) is a **recommendation** made by β or R-SA at P3, not a hardcoded rule. The boundary below is about *who owns the output*, not which tool they use.

| Output Type | Owner | Decision Criteria |
|-------------|-------|------------------|
| Dedicated user-facing web application | R-FE | Has component tree, routing, browser-first UX |
| Data app embedded in Python stack | R-DE | Lives inside Python codebase, data team operates it |
| Notebook / exploratory visual output | R-MLE or R-DE | For internal analysis, not user-facing |
| Programmatically generated report files | R-DE | Auto-generated from pipeline runs |
| Interactive visualization in web app | R-FE | Part of user-facing product, needs API contract |

> When unclear which type applies → Manager escalates to R-SA to classify before dispatching.

---

## Section 6 — Backend Engineering

| Task | Owner | ❌ NOT |
|------|-------|--------|
| REST / GraphQL API endpoints | R-BE | R-MLE, R-DE |
| Model serving wrapper (API around ML model) | R-BE (with R-MLE spec) | R-MLE alone |
| Auth, rate limiting, middleware | R-BE | R-SE alone, R-DO |
| Backend dev guide (`dev-guide-backend.md`) | R-BE | R-TC, R-DE |
| Webhook specs, data contracts | R-BE | R-DE, R-SA |

---

## Section 7 — DevOps, Cloud, Security

| Task | Owner | ❌ NOT |
|------|-------|--------|
| CI/CD pipeline config | R-DO | R-CE, R-BE |
| Container / Docker / K8s config | R-DO | R-CE, R-BE |
| VPC, networking, managed services | R-CE | R-DO, R-SA |
| Cloud cost estimate | R-CE | R-SA alone |
| Security threat model, PDPL / GDPR review | R-SE | R-CE, R-SA |
| Performance testing, load testing | R-PE | R-QA, R-DO |
| Test plan, QA checklists | R-QA | R-SE, R-PM |

---

## Section 8 — Management, Documentation, Delivery

| Task | Owner | ❌ NOT |
|------|-------|--------|
| Sprint log (`wN-sprint-log.md`) | R-PM | R-MLE, R-DE, R-SA |
| Gate verdict (PASS / FAIL / CONDITIONAL) | R-PM + γ | R-MLE, R-DE |
| Client-facing document (data request, gap doc) | R-PM | R-DE, R-MLE |
| Project memory update (`project-memory.md`) | R-PM | R-MLE, R-DE |
| State file update (`_state.json`) | R-PM | anyone else |
| Handoff package (`handoff-package.md`) | R-PM + R-DE | R-MLE alone, R-TC alone |
| Technical documentation / user manual | R-TC | R-PM, R-BE |
| Data analysis report (EDA, business insights) | R-DA | R-MLE, R-DE |
| Deep learning specific tasks | R-DLE | R-MLE (unless spec overlap) |
| NLP pipeline tasks | R-NLP | R-MLE (unless B04 in scope) |
| Computer vision pipeline tasks | R-CVE | R-MLE (unless B03 in scope) |
| Agentic / multi-agent system design | R-AE | R-SA, R-MLE |

---

## Section 9 — Sprint Task Quick Reference (W1–W8 common patterns)

> For sprint phases — copy-paste reference for Manager dispatch.

| Sprint Task | Role | Notes |
|-------------|------|-------|
| Model training run | R-MLE | Load project-memory.md |
| Beat rate calculation | R-MLE | From monitoring CSV data |
| Walkforward CV | R-MLE | One dispatch per segment group if large |
| Pipeline code change | R-DE | Separate dispatch from model work |
| Schema / output validation | R-DE | After R-MLE produces model outputs |
| Tet / seasonal coefficient | R-MLE | POST-reconciliation logic |
| Reconciliation pipeline | R-DE | After R-MLE spec is confirmed |
| Monitoring output (JSON/CSV) | R-MLE | Separate from dashboard |
| Dashboard (Streamlit) | R-DE | AFTER R-MLE monitoring outputs are ready |
| Evaluation report | R-MLE | Based on monitoring outputs |
| Handoff docs (technical) | R-DE | Operational procedures |
| Handoff docs (delivery) | R-PM | Stakeholder-facing package |
| Sprint log | R-PM | After R-MLE + R-DE dispatches complete |
| Gate review | R-PM (+ γ if major gate) | Last dispatch of sprint |

---

## Enforcement Checklist (Manager must verify before EVERY dispatch)

```
□ Task type identified → matched to OWNER in this matrix
□ One role only in this dispatch (RULE 9)
□ Prerequisite completed? (e.g. api-design.md locked before R-FE dispatched)
□ project-memory.md included in Context to load (sprint only)
□ No pre-filled output data in dispatch prompt
□ FE dispatches: data contract confirmed from R-DE/R-BE first
□ Output file path starts with projects/{PROJECT_ID}/
```
