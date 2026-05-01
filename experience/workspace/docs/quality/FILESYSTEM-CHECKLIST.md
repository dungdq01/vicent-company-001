# Filesystem Checklist
Per-phase output verification — which files MUST exist after each phase completes.

Validation check for every file: file exists + not empty + follows template.

See [QUALITY-CHECKLIST.md](./QUALITY-CHECKLIST.md) for content-level quality checks.

---

## ❌ PATH ENFORCEMENT — Applies to ALL Phases

**ALL agent output files MUST be inside `projects/{PROJECT_ID}/`.**
Files created anywhere else are **INVALID** and must be moved or deleted before the phase closes.

| Forbidden Location | Example | Required Action |
|-------------------|---------|-----------------|
| Workspace root | `discovery-report.md` (at root) | MOVE → `projects/{PROJECT_ID}/discovery-report.md` |
| `docs/` folder | `docs/api-design.md` | MOVE → `projects/{PROJECT_ID}/design/api-design.md` |
| `reports/` folder | `reports/architecture.md` | MOVE → `projects/{PROJECT_ID}/architecture.md` |
| Any path not starting with `projects/{PROJECT_ID}/` | — | INVALID — reject and fix path |

**H5-FILESYSTEM check (mandatory after every agent dispatch):**
```
□ File path starts with projects/{PROJECT_ID}/
□ File is in the correct subfolder (design/, planning/, layer2/, etc.)
□ File is NOT at workspace root or in any system folder
```
If any check fails → **do not mark phase COMPLETE**. Fix path first.

---

## P0 — Intake & Scoping
Required files:
- [ ] projects/{PROJECT_ID}/project-brief.md
- [ ] projects/{PROJECT_ID}/_state.json

## P1 — Discovery & Research
Required files:
- [ ] projects/{PROJECT_ID}/discovery-report.md
- [ ] projects/{PROJECT_ID}/domain-brief.md
- [ ] projects/{PROJECT_ID}/_checkpoints/alpha.json
- [ ] projects/{PROJECT_ID}/_checkpoints/R-Dxx.json

## P2 — Proposal & Business Case
Required files:
- [ ] projects/{PROJECT_ID}/proposal.md
- [ ] projects/{PROJECT_ID}/_checkpoints/gamma.json

## P3 — Solution Architecture
Required files:
- [ ] projects/{PROJECT_ID}/architecture.md
- [ ] projects/{PROJECT_ID}/_checkpoints/beta.json

## P4 — Detailed Design (parallel branches)
Required files:
- [ ] projects/{PROJECT_ID}/design/api-design.md
- [ ] projects/{PROJECT_ID}/design/database-design.md
- [ ] projects/{PROJECT_ID}/design/algorithm-spec.md
- [ ] projects/{PROJECT_ID}/design/ui-design.md
- [ ] projects/{PROJECT_ID}/design/integration-review.md
- [ ] projects/{PROJECT_ID}/_checkpoints/layer2/R-BE.json
- [ ] projects/{PROJECT_ID}/_checkpoints/layer2/R-DBE.json
- [ ] projects/{PROJECT_ID}/_checkpoints/layer2/R-MLE.json
- [ ] projects/{PROJECT_ID}/_checkpoints/layer2/R-FE.json

## P5 — Implementation Planning
Required files:
- [ ] projects/{PROJECT_ID}/planning/project-plan.md

## P6 — Development Guides
Required files:
- [ ] projects/{PROJECT_ID}/guides/dev-guide.md
- [ ] projects/{PROJECT_ID}/guides/dev-guide-backend.md
- [ ] projects/{PROJECT_ID}/guides/dev-guide-frontend.md
- [ ] projects/{PROJECT_ID}/guides/dev-guide-ml.md

## P7 — QA & Testing Plan
Required files:
- [ ] projects/{PROJECT_ID}/operations/qa-plan.md

## P8 — Deployment & Operations
Required files:
- [ ] projects/{PROJECT_ID}/operations/deployment-plan.md

## P9 — Delivery Package

Required files (full delivery tree):
```
projects/{PROJECT_ID}/
├── README.md                    # Navigation + quick start
├── executive-summary.md         # For stakeholders
├── project-brief.md             # Problem definition
├── discovery-report.md          # Research findings
├── proposal.md                  # Feasibility + business case
├── architecture.md              # System design
├── design/
│   ├── api-design.md            # API specification
│   ├── database-design.md       # DB schema + ERD
│   ├── algorithm-spec.md        # ML/AI specification
│   ├── ui-design.md             # Frontend design
│   └── integration-review.md    # Cross-design consistency
├── planning/
│   ├── project-plan.md          # Sprint plan + WBS
│   └── risk-register.md         # Risks + mitigations
├── guides/
│   ├── dev-guide.md             # Overall dev standards
│   ├── dev-guide-backend.md     # Backend specifics
│   ├── dev-guide-frontend.md    # Frontend specifics
│   └── dev-guide-ml.md          # ML specifics
├── operations/
│   ├── qa-plan.md               # Testing strategy
│   └── deployment-plan.md       # DevOps + monitoring
└── _metadata/
    ├── pipeline-state.json      # Pipeline execution log
    ├── agent-log.json           # Who did what, when
    └── knowledge-feedback.md    # Insights for Knowledge Graph
```

---
*Agent Workspace v1.0*
