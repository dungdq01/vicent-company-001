---
file: 06-dev-guides
project_id: {{PROJECT_ID}}
phase: P6
filled_by: R-σ + R-TC + per-discipline agents
last_updated: {{P6_DATE}}
status: draft | reviewed | signed
---

# {{PROJECT_NAME}} — Dev Guides (Index)

> P6 deliverable. Code-level spec so a new engineer becomes productive in 1 day. This is the **index**; sub-guides linked.

---

## 0. Document Control

- **Compiler**: R-σ
- **Reviewers**: CTO · R-QA
- **Eval**: [Fill ≥ 7.5]

---

## 1. Sub-Guides

| Guide | File | Owner |
|---|---|---|
| Setup (local dev) | [`./guides/setup.md`](./guides/setup.md) | R-σ |
| Conventions (code style + patterns) | [`./guides/conventions.md`](./guides/conventions.md) | R-σ |
| Frontend guide | [`./guides/frontend-guide.md`](./guides/frontend-guide.md) | R-FE |
| Backend guide | [`./guides/backend-guide.md`](./guides/backend-guide.md) | R-BE |
| ML guide (if applicable) | [`./guides/ml-guide.md`](./guides/ml-guide.md) | R-MLE |
| Database guide | [`./guides/db-guide.md`](./guides/db-guide.md) | R-DBE |
| Code review checklist | [`./guides/code-review-checklist.md`](./guides/code-review-checklist.md) | R-QA |
| Skeletons | [`./guides/skeletons/`](./guides/skeletons/) | per-discipline |

---

## 2. Quick Start

A new engineer joining {{PROJECT_NAME}} should:

1. Read this index (5 min)
2. Follow `setup.md` to get local dev running (target: 1 hour)
3. Read `conventions.md` (15 min)
4. Read the discipline-specific guide for their area (15 min)
5. Pick up first task; submit PR; reviewer uses `code-review-checklist.md`

Total onboarding: **≤ 1 working day** (per P6 DoD).

---

## 3. Setup Guide Skeleton (`./guides/setup.md`)

> ⚠ Each project fills this. Template below:

### 3.1 Prerequisites
- Node.js [version]
- Python [version] (if ML)
- Docker
- [other tools]

### 3.2 Clone & Install
```bash
git clone {{REPO_URL}}
cd {{REPO_NAME}}
[install command]
```

### 3.3 Environment Setup
1. Copy `.env.example` to `.env.local`
2. Fill secrets (get from secret manager — see `03-tech-stack.md §4.2`)
3. [Other env steps]

### 3.4 Database Setup
```bash
[migration command]
[seed command for dev]
```

### 3.5 Run Locally
```bash
[run command]
```
Open http://localhost:3000

### 3.6 Common Issues
| Issue | Fix |
|---|---|
| [Fill] | [Fill] |

💡 Hint: P6 DoD requires *external* dev to run setup successfully.

---

## 4. Conventions Guide Skeleton (`./guides/conventions.md`)

→ Follows [`@../../rules/20-code-rules.md`](../../rules/20-code-rules.md). Project-specific overrides documented here.

### 4.1 File Organization
[Fill: per-stack folder layout]

### 4.2 Naming
- Per R-COD-02 + project specifics

### 4.3 Error Handling
- Per R-COD-05

### 4.4 Logging
- Per R-COD-06

### 4.5 Testing
- Per R-COD-07

### 4.6 Project-Specific Patterns
[Fill: any pattern unique to this project]

---

## 5. LLMOps Integration Points (CEO sign required per P6 DoD)

For projects with LLM components:

### 5.1 Prompt Files Location
[Fill: `prompts/` folder · versioning · how to update]

### 5.2 Eval Hooks
[Fill: where eval runs · golden set files · CI integration]

### 5.3 Cost Telemetry
[Fill: Helicone integration · cost cap enforcement]

### 5.4 Memory & Drift
[Fill: how memory feeds back · drift detection cadence]

---

## 6. Skeleton Code

`./guides/skeletons/` contains stub implementations:

```
skeletons/
├── api/[resource].route.ts        ← API endpoint stub
├── components/[Name].tsx          ← Component stub
├── lib/db/queries/[name].ts       ← Query stub
├── lib/llm/[task].ts              ← LLM call stub with eval hook
└── tests/[name].test.ts           ← Test stub
```

Each skeleton:
- Compiles / lints cleanly
- Has TODO comments for filling
- Demonstrates conventions

---

## 7. Code Review Checklist (`./guides/code-review-checklist.md`)

Skeleton — full per-project version in companion file.

**Functional**:
- [ ] Implements the user story / acceptance criteria
- [ ] Handles edge cases (empty · null · max)
- [ ] Errors handled per R-COD-05

**Quality**:
- [ ] Tests added (unit + integration as appropriate)
- [ ] No `any` (R-COD-08) · no console.log (R-COD-15)
- [ ] No magic numbers
- [ ] Function ≤ 40 lines (R-COD-03)

**Security**:
- [ ] Inputs validated at boundary (R-COD-08 · R-SEC-04)
- [ ] No secrets in code (R-COD-09)
- [ ] PII handled per data classification

**Performance**:
- [ ] No N+1 queries
- [ ] LLM calls batched where possible

**LLMOps** (if touches LLM):
- [ ] Prompt versioned
- [ ] Eval hook present
- [ ] Cost logged via Helicone

**Docs**:
- [ ] Public functions documented
- [ ] README updated if behavior changes
- [ ] CHANGELOG entry if user-visible

---

## 8. Sign-Off

- **R-σ compilation**: [Fill]
- **CTO LLMOps integration**: [Fill]
- **External dev test**: [Fill name · date · outcome]
- **Ready for P7**: [ ]

---

## Cross-References

- P6 phase doc: [`@../../../experience/workspace/docs/pipeline/P6-DEV-GUIDES.md`](../../../experience/workspace/docs/pipeline/P6-DEV-GUIDES.md)
- Code rules: [`@../../rules/20-code-rules.md`](../../rules/20-code-rules.md)
- Stack: [`03-tech-stack.md`](03-tech-stack.md)

---
*Template v1.0*
