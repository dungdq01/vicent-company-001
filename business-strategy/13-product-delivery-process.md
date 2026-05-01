# Product Delivery Process — A → Z

**Mục đích:** Quy trình chuẩn deliver 1 sản phẩm/dự án từ lúc nhận brief đến lúc handoff. **Bất kỳ ai trong team gặp project mới đều mở file này → biết next step.** Ngành/baseline/scope nào cũng cùng quy trình này.

**Quy tắc vàng:** *"Process đảm bảo consistency. Skip phase = skip safety net. Mọi phase đều có Definition of Done — file 17."*

**Reference:** Process này adapt từ `experience/PRODUCT-DEVELOPMENT-PIPELINE.md` cho company-specific use.

---

## 1. 9-Phase Pipeline

```
P0 INTAKE        — nhận brief, qualify, scope
  ↓
P1 DISCOVERY     — research, baseline match, industry depth
  ↓
P2 PROPOSAL      — feasibility, GO/NO-GO, scope confirm
  ↓ [Decision Gate G1: Customer signs SOW]
P3 ARCHITECTURE  — system design, tech stack, integration
  ↓
P4 DESIGN (parallel)
  P4a API design  | P4b DB schema  | P4c ML algo  | P4d UI/UX
  ↓ P4e Integration review
  ↓
P5 PLANNING      — sprint plan, milestones, RACI
  ↓
P6 DEV GUIDES    — code-level spec for client team OR our delivery
  ↓
P7 QA            — test plan, golden test set, regression
  ↓
P8 DEPLOYMENT    — deploy plan, runbook, monitoring
  ↓
P9 DELIVERY      — handoff, training, post-mortem
  ↓
[OPTIONAL] Retainer / Phase 2 / Add-on
```

**Scope mapping:**

| Scope | Phases included | Time | Price (per file 10) |
|---|---|---|---|
| **A — Feasibility Sprint** | P0–P2 | 2 tuần | $1.5–3K |
| **B — Architecture Sprint** | P0–P3 + P5 light | 3 tuần | $3–5K |
| **C — Full Blueprint** | P0–P6 | 6 tuần | $8–12K |
| **D — Turnkey Delivery** | P0–P9 (we deliver) hoặc P0–P8 (handoff) | 8 tuần | $12–25K |
| **LLMOps Audit** (ICP-E) | P0 + P1 + P2 (custom) | 1 tuần | $3–8K |
| **Cost Sprint** (ICP-E) | P0 + P1 cost + P3 implementation | 2 tuần | $2–5K |

---

## 2. RACI per phase

**Roles:**
- **CEO** = LLMOps + ML validation
- **P2** = Engine + technical execution
- **P3** = Sales + Customer Success + project management
- **Agents** = R-α, R-β, R-γ, R-D{N}, R-MLE, R-DE, R-DA, R-BE, R-FE, R-DO, R-QA, R-SA, R-σ
- **Client** = customer team

| Phase | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| P0 Intake | P3 | P3 | CEO (ICP-E only) | P2 |
| P1 Discovery | Agents (β, R-D{N}) | CEO | P3 | Client |
| P2 Proposal | Agents (γ, σ) + P3 polish | P3 | CEO, P2 | Client |
| P3 Architecture | Agents (R-SA) + CEO | CEO | P2, P3 | Client |
| P4a API | Agents (R-BE) + P2 | P2 | CEO | Client |
| P4b DB | Agents (R-DE) | P2 | CEO | Client |
| P4c ML | Agents (R-MLE) + CEO | CEO | P2 | Client |
| P4d UI | Agents (R-FE) + P2 | P2 | P3 (UX) | Client |
| P4e Integration | CEO + P2 | CEO | P3 | Client |
| P5 Planning | Agents + P3 | P3 | CEO, P2 | Client |
| P6 Dev guides | Agents (R-σ) | CEO | P2 | Client |
| P7 QA | Agents (R-QA) + CEO | CEO | P2 | Client |
| P8 Deploy | Agents (R-DO) + P2 | P2 | CEO | Client |
| P9 Delivery | P3 | P3 | CEO, P2 | Client |

---

## 3. Phase-by-phase walkthrough

### P0 — INTAKE (Day 0–2)

**Trigger:** New lead reaches "SQL" stage (file 12 §2). Discovery call done.

**Activities:**
1. P3 fills `00-intake.md` — base form
2. P3 score BANT + Fit (file 12 §2)
3. If qualified → assign Project ID `P-{YYYYMM}-{NNN}`, create folder structure
4. P3 schedules 1-1 với CEO/P2 nếu cần technical input

**Folder structure created:**

```
docs/projects/P-{YYYYMM}-{NNN}/
├── 00-intake.md            ← brief + qualification
├── 01-discovery/
├── 02-proposal/
├── 03-architecture/
├── 04-design/
│   ├── api/
│   ├── db/
│   ├── ml/
│   └── ui/
├── 05-planning/
├── 06-dev-guides/
├── 07-qa/
├── 08-deployment/
├── 09-delivery/
├── retro.md
└── meta/
    ├── client-info.md
    ├── communication-log.md
    └── decisions.md
```

**`00-intake.md` template:**
```markdown
# Intake — {Client Name} — P-{YYYYMM}-{NNN}

## Client
- Company: ...
- Contact: ...
- Role: ...
- Industry: I0X
- Size: X employees, $Y revenue

## Problem statement
{1 paragraph from discovery}

## Quantified pain
- Current cost / time / errors: ...
- Estimated gain if solved: ...

## Constraints
- Budget: $X
- Timeline: by {date}
- Stack constraints: {existing system, languages, DB}
- Compliance: {GDPR, VN data law, etc.}

## Proposed scope
- Tier: A / B / C / D / Audit / Custom
- Baselines: B0X, B0Y
- Industry node: I0Z
- Estimated agents: ...

## BANT/Fit
- BANT: B/A/N/T = ?/3 each, total /12
- Fit: ICP/baseline/case-study = ?/3 each, total /9

## Decision
☐ Proceed to P1 Discovery
☐ Decline (reason: ...)
☐ Nurture (re-engage in: ...)

## Owner
- P3: P3 name
- Backup: CEO/P2

## Internal notes
{language barrier, NDA, special handling}
```

**Definition of Done (DoD):**
- ✅ Intake doc complete
- ✅ BANT ≥ 8 + Fit ≥ 6
- ✅ Project ID assigned + folder created
- ✅ SOW draft ready (if proceeding)

**Output:** Decision to proceed to P1 OR decline OR nurture.

---

### P1 — DISCOVERY (Day 3–7 for Sprint A; Day 3–10 for B+)

**Trigger:** P0 decision = proceed.

**Goal:** Deep understanding của problem space, gather all constraints, identify SOTA solutions.

**Activities:**

1. **Agent R-β industry research** (1–2h):
   - Web search: "AI in {industry} {country} {year}"
   - SOTA papers
   - Competing solutions in market
   - VN-specific constraints

2. **Agent R-α baseline research** (existing if available):
   - Pull MAESTRO baseline node (B0X)
   - If not L3 → trigger Re-research mode

3. **Agent R-D{N} domain context** (if industry has node):
   - Pull I0Z industry deep-node
   - Map pain to known patterns

4. **Optional: Client data review**:
   - Sample data anonymized
   - System architecture diagram (current state)
   - Stakeholder interview (P3 conducts, 30 min mỗi)

5. **CEO validation** (30–60 phút):
   - Sanity-check ML model recommendations
   - Cost estimate per Scope tier

**Deliverables in `01-discovery/`:**
- `discovery-report.md` (8–15 trang)
  - Problem deep-dive
  - SOTA landscape
  - Recommended approach
  - Risk + mitigation
  - Data requirements
  - Estimated effort + cost

**DoD:**
- ✅ Discovery report passes R-eval ≥ 7.5/10
- ✅ ≥ 3 SOTA references cited (verifiable)
- ✅ Risk section includes ≥ 5 risks with mitigation
- ✅ Cost estimate +/- 20% accurate
- ✅ CEO signs off on technical recommendations
- ✅ P3 reviews readability for client

**Engine cost target:** $0.30–1.00

---

### P2 — PROPOSAL (Day 8–14 for Sprint A)

**Trigger:** P1 done.

**Goal:** Formal proposal client signs.

**Activities:**

1. **Agent R-γ feasibility scoring** (30 min):
   - GO/NO-GO score (30/30/20/20 = tech / market / cost / timeline)
   - Score < 60 → recommend client wait or pivot

2. **Agent R-σ proposal generation**:
   - Synthesize discovery + feasibility
   - Produce executive summary (1 page)
   - Detailed proposal (file 12 §5 template)
   - Investment table

3. **P3 polish + brand**:
   - Add company branding
   - Personalize tone for client
   - Add team bio

4. **CEO review** (30 min):
   - Technical accuracy
   - Pricing appropriate

5. **Send to client + 14-day validity**

**Deliverables in `02-proposal/`:**
- `executive-summary.pdf` (1 page)
- `proposal.pdf` (5–10 pages, client-facing)
- `feasibility-scoring.md` (internal)
- `sow-template.docx` (Statement of Work, ready to sign)

**DoD:**
- ✅ Feasibility score ≥ 60 OR explicit NO-GO recommendation
- ✅ Proposal addresses all client constraints from intake
- ✅ Pricing aligns with file 10
- ✅ Validity date + countersign instructions clear

**Engine cost target:** $0.20–0.50

---

### Decision Gate G1 — Client signs SOW + 50% deposit

If client doesn't sign in 14 days:
1. P3 follows up Day 7, Day 14
2. After 14 days no response → quote expires
3. Re-quote requires updated discovery (paid second time)

If signs → proceed P3 Architecture.

---

### P3 — ARCHITECTURE (Sprint B+)

**Trigger:** SOW signed (Sprint B+) OR P2 done (Sprint A delivery).

**Goal:** System design that engineering team can build.

**Activities:**

1. **Agent R-SA system architect**:
   - High-level architecture diagram
   - Component breakdown
   - Data flow
   - Integration points
   - Tech stack recommendation
   - Scaling considerations

2. **CEO validation**:
   - LLM choice (Sonnet vs Haiku per task)
   - Eval points in pipeline
   - Cost estimate for production
   - Failure modes addressed

3. **Optional: Client architecture review meeting** (60 min):
   - Walk through proposed
   - Get client team input
   - Adjust based on existing infra

**Deliverables in `03-architecture/`:**
- `architecture.md` — high-level
- `architecture-diagram.png` — Mermaid or draw.io
- `tech-stack.md` — components + rationale
- `scaling-considerations.md`
- `failure-modes.md`

**DoD:**
- ✅ Architecture passes R-SA eval ≥ 7.5
- ✅ All components have rationale
- ✅ Failure modes ≥ 5 documented + mitigation
- ✅ Client team confirms feasibility với existing infra
- ✅ CEO signs off

---

### P4 — DESIGN (parallel — Sprint C+)

**Trigger:** P3 done.

**Goal:** Detailed design at code level. 4 sub-phases run **parallel** to save wall time.

#### P4a — API Design

**Agent R-BE backend engineer:**
- Endpoint list (REST/GraphQL)
- Request/response schemas
- Auth + rate limiting
- Error codes

**Output:** `04-design/api/api-design.md` + OpenAPI spec YAML

#### P4b — DB Schema

**Agent R-DE data engineer:**
- ER diagram
- Table definitions (Postgres-first)
- Index strategy
- Migration plan from existing (if any)

**Output:** `04-design/db/db-schema.md` + SQL DDL

#### P4c — ML Algorithm

**Agent R-MLE + CEO validation:**
- Algorithm choice with rationale (e.g., NBEATS over Prophet for sparse retail)
- Training data requirements
- Eval metrics
- Inference latency target

**Output:** `04-design/ml/algorithm-spec.md`

#### P4d — UI/UX

**Agent R-FE frontend engineer:**
- Page list
- Component breakdown
- User flow diagram
- Wireframes (low-fi)

**Output:** `04-design/ui/ui-design.md` + Figma link (if invest in design)

#### P4e — Integration Review (consolidation)

**CEO + P2 review:**
- Cross-check API ↔ DB ↔ ML ↔ UI consistency
- Identify integration points + risks
- Adjust based on conflicts

**Output:** `04-design/integration-review.md`

**DoD per sub-phase:**
- ✅ Each sub-phase passes its agent's eval
- ✅ Output is implementable (engineer can start coding)
- ✅ Integration review identifies ≥ 0 conflicts (if conflicts, resolve before P5)

**Time:** Wall 3–5 ngày (parallel) vs sequential 8–12 ngày.

---

### P5 — PLANNING

**Goal:** Sprint plan that client team (or our delivery team) can execute.

**Agent + P3 co-create:**
- Sprint breakdown (2-week sprints)
- Milestones (M1 = MVP, M2 = beta, M3 = GA)
- RACI matrix
- Dependency map
- Risk register

**Output:** `05-planning/project-plan.md` + Gantt or Linear board

**DoD:**
- ✅ Plan fits within client timeline
- ✅ Each task has owner + DoD
- ✅ Dependency map traceable
- ✅ Risk register ≥ 5 risks

---

### P6 — DEV GUIDES (Sprint C+)

**Goal:** Code-level spec for engineers to build without re-discussing.

**Agent R-σ + CEO:**
- Per-component setup guide
- Code conventions
- Local dev environment setup
- Testing requirements
- Code review checklist
- Sample stub implementations (skeleton code)

**Output:** `06-dev-guides/` directory với:
- `setup.md`
- `conventions.md`
- `frontend-guide.md`
- `backend-guide.md`
- `ml-guide.md`
- `code-review-checklist.md`

**DoD:**
- ✅ New engineer onboard with guide trong 1 ngày
- ✅ Conventions cover formatting, naming, error handling, logging
- ✅ Code review checklist actionable

---

### P7 — QA (Sprint D)

**Agent R-QA + CEO eval:**
- Test plan (unit + integration + e2e)
- Golden test set for ML/AI components
- Regression suite
- Manual test scripts
- Performance benchmarks
- Accessibility check (if UI)

**Output:** `07-qa/` directory với:
- `test-plan.md`
- `golden-tests/`
- `regression-suite/`
- `performance-benchmarks.md`

**DoD:**
- ✅ Test plan covers all P4 deliverables
- ✅ Golden test set ≥ 20 cases
- ✅ Regression suite runnable in CI
- ✅ Performance targets defined + measurable

---

### P8 — DEPLOYMENT (Sprint D)

**Agent R-DO + P2:**
- Infrastructure spec (Vercel/Railway/AWS depending scale)
- CI/CD pipeline (GitHub Actions)
- Monitoring + alerting (Helicone/Sentry/CloudWatch)
- Backup + DR
- Runbook for common operations
- Security checklist

**Output:** `08-deployment/`:
- `deploy-plan.md`
- `runbook.md`
- `monitoring.md`
- `security-checklist.md`
- `disaster-recovery.md`

**DoD:**
- ✅ Deploy plan has Day-0 + Day-1 + Day-7 milestones
- ✅ Monitoring alerts on cost, latency, error rate, eval drift
- ✅ Runbook covers ≥ 10 common ops
- ✅ Security checklist passes

---

### P9 — DELIVERY (handoff)

**Trigger:** All prior phases done, client accepted.

**Activities:**

1. **Final review meeting** (60 min):
   - Walk through all deliverables
   - Q&A
   - Sign-off form

2. **Knowledge transfer**:
   - 1–2 training sessions (1h each)
   - Recorded for client team archive
   - Decision log review (`meta/decisions.md`)

3. **Handoff package**:
   - All deliverables zipped + Notion view
   - Recorded videos
   - 30-day post-delivery support agreement (response < 48h)

4. **Final invoice + payment**

5. **Post-mortem** (internal):
   - File `retro.md` — what worked, what didn't, learnings
   - Update MAESTRO memory with project insights
   - Promote prompt versions if eval improved

6. **Case study request**:
   - If Founding Customer → required (per file 10 §3)
   - Anonymized version published 4–8 weeks post-delivery

**DoD:**
- ✅ Client signs Acceptance form
- ✅ Final invoice paid
- ✅ Recordings + handoff package delivered
- ✅ Internal retro completed
- ✅ MAESTRO memory updated

---

## 4. Communication standards (per project)

### Channels per project

- **Slack/Discord shared channel** với client (for daily async)
- **Notion project page** (for deliverable tracking)
- **Weekly sync call** (30 min, P3 host)
- **Email** for formal items (SOW, invoice, sign-off)

### Cadence

| Event | Frequency | Owner |
|---|---|---|
| Status update | Weekly Friday | P3 |
| Phase milestone notification | Per phase end | P3 |
| Issue escalation | Within 24h | P3 → CEO |
| Invoice | Per payment milestone | P3 |
| Office hours (retainer) | Weekly 30 min | P3 + agent |

### Status update template

```markdown
# Status Update — {Project} — Week {N}

## Last week
- ✅ {milestone done}
- ✅ {milestone done}

## This week
- 🔵 {next milestone}
- 🔵 {next milestone}

## Blockers
- ⚠️ {if any, with ask}

## Cost & timeline
- Days remaining: X
- Budget remaining: $Y
- On track: yes / amber / red

## Action needed from you
- {list}
```

---

## 5. Change management

### Scope change request (SCR)

If client wants change mid-project:

1. **P3 receives request, fills SCR form:**
   ```
   Original scope: ...
   Requested change: ...
   Impact:
   - Time: + X days
   - Cost: + $Y
   - Risk: ...
   ```

2. **CEO/P2 review** technical feasibility (within 48h)

3. **Send revised SOW** to client (within 72h of original request)

4. **If approved → update plan, milestones, invoices**

5. **If rejected → log in `meta/decisions.md`**, continue original scope

### Escalation path

| Severity | Definition | Escalation |
|---|---|---|
| P0 critical | Project blocked, client unhappy | CEO immediate |
| P1 high | Phase milestone slip > 2 days | P3 → CEO same day |
| P2 medium | Quality concern, minor delay | P3 weekly review |
| P3 low | Process improvement | Logged in retro |

---

## 6. Tool stack per phase

| Phase | Primary tool | Secondary |
|---|---|---|
| P0 Intake | Notion form | Calendly |
| P1 Discovery | Engine (R-α/β) + Notion | MAESTRO retrieval |
| P2 Proposal | Engine (R-γ/σ) + DocuSign | Stripe (deposit) |
| P3 Architecture | Engine (R-SA) + draw.io | Figma (if UI) |
| P4 Design | Engine (R-MLE/DE/BE/FE) | OpenAPI editor, dbdiagram.io |
| P5 Planning | Linear or Notion | Gantt |
| P6 Dev guides | Markdown in repo | Loom (video) |
| P7 QA | promptfoo / pef framework | GitHub Actions |
| P8 Deploy | GitHub Actions | Helicone, Sentry |
| P9 Delivery | DocuSign + Loom | Notion handoff |

---

## 7. Quality gates summary (file 17 details)

| Gate | When | Pass criteria | Owner |
|---|---|---|---|
| G0 | End of P0 | BANT/Fit threshold | P3 |
| G1 | End of P2 | Client signs SOW + 50% deposit | P3 |
| G2 | End of P3 | CEO + Client confirm architecture | CEO |
| G3 | End of P4 | Integration review passes (no conflict) | CEO |
| G4 | End of P6 | New engineer onboard test passes | CEO |
| G5 | End of P7 | All tests pass + golden eval ≥ 7.5 | CEO |
| G6 | End of P8 | Deploy on staging successful | P2 |
| G7 | End of P9 | Client sign Acceptance + final invoice paid | P3 |

---

## 8. Project retro template (post-P9)

```markdown
# Retro — {Project} — {Date}

## Outcome
- Tier: ...
- Value: $...
- Time: actual vs estimate
- Cost (Engine): actual vs estimate
- Quality: client NPS, eval scores

## What worked
- 1-3 specific things to keep

## What didn't
- 1-3 specific things to stop

## Learnings (extract to MAESTRO memory)
- {Domain insight} → save to docs/memory/I0X-learnings.md
- {Baseline insight} → save to docs/memory/B0Y-learnings.md
- {Failure mode} → save to docs/memory/failure-modes/{type}.md
- {Prompt improvement} → propose v_{N+1}.x in PR

## Action items
- ☐ Update file 17 with new DoD criterion (if any)
- ☐ Update file 12 sales playbook (if learning re sales)
- ☐ Update prompt version (if regression detected)
- ☐ Add case study to portfolio (if Founding Customer)

## Memory entries created
- [...]
```

---

## 9. Phase 1 simplification (Sprint A only — first 3 months)

**Trong M1–M3, chỉ chạy Scope A** để chứng minh pipeline. Skip P3+ phases ngoại trừ pilot LLMOps audit.

**Sprint A simplified:**
- P0 Intake (1 day)
- P1 Discovery (3 days)
- P2 Proposal (1 day) → SOW + 50% deposit
- *(if signed, deliver Sprint A complete in 2 weeks total)*
- P9 Delivery (1 day) → handoff Discovery + Proposal report

**Engine target:** ≤ $1.50 cost/Sprint A. Founder time ≤ 8h/Sprint A (mostly P3 client + CEO 2h validation).

→ Nếu pipeline chạy được Sprint A 80% auto trong M3 → unlock Sprint B+ M4.

---

## 10. Tóm tắt 1 trang

```
9 PHASES: P0 Intake → P1 Discovery → P2 Proposal → [G1: SOW signed]
          → P3 Architecture → P4 Design (parallel a/b/c/d/e)
          → P5 Planning → P6 Dev Guides → P7 QA → P8 Deploy
          → P9 Delivery + Retro

SCOPE MAPPING:
  A Feasibility   = P0-P2          | 2 tuần | $1.5-3K
  B Architecture  = P0-P3 + P5     | 3 tuần | $3-5K
  C Full Blueprint = P0-P6         | 6 tuần | $8-12K
  D Turnkey       = P0-P9          | 8 tuần | $12-25K
  Audit (ICP-E)   = P0+P1+P2 custom| 1 tuần | $3-8K

RACI:
  CEO: P1 validate, P3 own arch, P4c ML, P4e integration, P7 QA, P9 sign
  P2:  P4a/b/d, P5 tech, P6 guides, P8 deploy
  P3:  P0 intake, P2 polish, P5 plan, P9 client-side

7 QUALITY GATES G0-G7

PHASE 1 SIMPLIFIED: Sprint A only M1-M3
  → unlock Sprint B+ when 80% auto rate hit

PROJECT FOLDER STRUCTURE: docs/projects/P-{YYYYMM}-{NNN}/

TEMPLATES per phase output: 00-intake → 09-delivery
COMMUNICATION: weekly status Friday | escalation < 24h | scope change SCR

RETRO every project → update MAESTRO memory + DoD + sales playbook
```
