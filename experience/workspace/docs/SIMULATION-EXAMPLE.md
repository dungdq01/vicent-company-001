# Simulation Example — PRJ-001: Mondelez Shipment Forecasting

> ⚠️ **LEGACY v0.x — references pre-v1.1 pipeline structure (PIPELINE-OVERVIEW.md không tồn tại)**.
> **Canonical pipeline**: [`@./pipeline/P0-INTAKE.md`](pipeline/P0-INTAKE.md) … [`P10-LONG-TERM.md`](pipeline/P10-LONG-TERM.md) + Path B/C/D
> Conflict → v1.1 thắng (R-MAS-12). New simulation cần build sau dry-run thật.
>
> File này giữ làm reference flow / narrative example. **KHÔNG dùng làm execution guide**.

---

> Demo mô phỏng full pipeline Scope B (P0 → P3) cho bài toán thực tế.
> File này KHÔNG chạy thật — chỉ vẽ flow từng bước.
> Cross-ref: [PIPELINE-OVERVIEW.md](pipeline/PIPELINE-OVERVIEW.md) | [CONTEXT-LOADING.md](agents/CONTEXT-LOADING.md) | [MEMORY-PROTOCOL.md](agents/MEMORY-PROTOCOL.md)
> Detailed H1-H5 walkthrough: [SYSTEM-FLOW.md](../SYSTEM-FLOW.md)

---

## Client Input (raw)

```
"Acme Consulting cần xây hệ thống dự báo khối lượng vận chuyển cho Mondelez Vietnam.
 FMCG, phân phối GT + MT. Dự báo shipment volume theo tuyến, theo tuần.
 Budget: $50K | Timeline: 3 tháng | Team: 2 ML + 1 Backend
 Data: 2 năm TMS history, GPS tracking, weather API."
```

---

## PHASE 0 — INTAKE & SCOPING (~2 min, automated)

```
                          CLIENT INPUT
                              │
                              ▼
                    ┌─────────────────┐
                    │  STEP 0.1       │
                    │  Parse Request  │
                    │  (System auto)  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  STEP 0.2       │
                    │  Knowledge      │
                    │  Matching       │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼─────┐       ┌─────▼─────┐       ┌─────▼─────┐
   │ B01      │       │ I06       │       │ B01-I06   │
   │Forecast  │       │ Logistics │       │ Matrix    │
   │(matched) │       │ (matched) │       │ (exists!) │
   └──────────┘       └───────────┘       └───────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  STEP 0.2b      │
                    │  Load Project   │
                    │  Memories (H4)  │
                    └────────┬────────┘
                             │
                    Memory Prioritization:
                    ├ P1: Same B+I → (none, first B01×I06 project)
                    ├ P2: Same B, diff I → (none)
                    ├ P3: Same I, diff B → (none)
                    └ P4: Recent 3 projects → (none, first project)
                    Result: 0 tokens loaded (cold start)
                             │
                    ┌────────▼────────┐
                    │  STEP 0.3       │
                    │  Team Assembly  │
                    │  + 7-Stage      │
                    │  Coverage Check │
                    └────────┬────────┘
                             │
          ┌──────────────────▼──────────────────────┐
          │  7-STAGE PIPELINE COVERAGE CHECK         │
          │                                          │
          │  1. Research & Academic  → α, β, γ    ✅ │
          │  2. Data & Engineering  → R-MLE, R-DE ✅ │
          │  3. Backend & API       → R-BE        ✅ │
          │  4. Frontend & UX       → (Scope B:   -- │
          │                           no UI phase)   │
          │  5. Deployment & Ops    → (Scope B:   -- │
          │                           deferred)      │
          │  6. Security & Quality  → R-SE (P3)   ✅ │
          │  7. Management & Deliv  → R-BA, R-SA, ✅ │
          │                           R-D06, σ       │
          │                                          │
          │  RESULT: All required stages covered     │
          └──────────────────┬──────────────────────┘
                             │
                    ┌────────▼────────────────────────────────┐
                    │  SELECTED TEAM (Scope B):               │
                    │                                         │
                    │  Layer 1: α (Dr. Archon — Research)     │
                    │           β (Dr. Praxis — Engineering)  │
                    │           γ (Dr. Sentinel — Evaluation) │
                    │                                         │
                    │  Layer 2: R-D06 (Logistics Domain) ★    │
                    │           R-MLE (ML Engineer)           │
                    │           R-DE  (Data Engineer)         │
                    │           R-BE  (Backend Engineer)      │
                    │                                         │
                    │  Security: R-SE (Security Engineer)     │
                    │                                         │
                    │  Delivery: R-SA (Solution Architect)    │
                    │            R-BA (Business Analyst)      │
                    │            σ (Ms. Scribe)               │
                    └────────────────────┬───────────────────┘
                                        │
                    ┌───────────────────▼───────────────────┐
                    │  STEP 0.4 — R-BA generates brief      │
                    │                                       │
                    │  READS:                               │
                    │   • Client raw input                  │
                    │   • data/industries/I06.json (summary)│
                    │   • data/matrix/B01-I06.json (summary)│
                    │   • templates/project-brief.tpl.md    │
                    │                                       │
                    │  SANDBOX (see SYSTEM-PROMPTS.md):     │
                    │   CAN: parse input, formalize KPIs,   │
                    │        define scope boundaries        │
                    │   CANNOT: make tech decisions,        │
                    │           expand scope, web search    │
                    │                                       │
                    │  WRITES:                              │
                    │   → project-brief.md                  │
                    └───────────────────┬───────────────────┘
                                        │
                    ┌───────────────────▼───────────────────┐
                    │  STEP 0.5 — User Confirmation         │
                    │  User reviews brief → APPROVED ✓      │
                    └───────────────────────────────────────┘
```

**Files touched in P0:**

| Action | File | Agent | Hermes |
|--------|------|-------|--------|
| READ | `data/baselines/B01.json` (name, overview only) | System | H2 |
| READ | `data/industries/I06.json` (overview, painPoints only) | System | H2 |
| READ | `data/matrix/B01-I06.json` (overview only) | R-BA | H2 |
| READ | `templates/project-brief.tpl.md` | R-BA | H5 |
| SCAN | `projects/*/_ metadata/project-memory.md` (H4 memory search) | System | H4 |
| WRITE | `projects/PRJ-001/project-brief.md` | R-BA | H5 |
| WRITE | `projects/PRJ-001/_state.json` | System | H5 |

---

## PHASE 1 — DISCOVERY & RESEARCH (~15 min)

```
                     project-brief.md
                           │
                           ▼
              ┌─────────────────────┐
              │  STEP 1.1           │
              │  R-D06 Domain       │
              │  Briefing (FIRST)   │
              └────────┬────────────┘
                       │ domain-brief.md
                       ▼
              ┌─────────────────────┐
              │  STEP 1.2           │
              │  α Adapted Research │
              │  (AFTER R-D06)      │
              └────────┬────────────┘
              │                         │
              │   READS:                │   READS:
              │   ├ project-brief.md    │   ├ project-brief.md
              │   ├ I06.json (full)     │   ├ B01-I06.json (full)
              │   └ R-D06-notes.md ★    │   ├ B01.json (concepts, algo)
              │     (OWN previous       │   └ research-report.md ★
              │      report from I06    │     (OWN previous report
              │      research)          │      from B01 research)
              │                         │
              │   SANDBOX:              │   SANDBOX:
              │   CAN: domain pain pts, │   CAN: filter algo by
              │    data reality, jargon,│    constraints, adapt for
              │    real companies       │    Mondelez, recommend 2-3
              │   CANNOT: tech stack,   │   CANNOT: copy from baseline,
              │    override α, web srch │    broad web search, design
              │                         │
              │   KEY RULE (H2):        │   KEY RULE (H2):
              │   ADAPT for Mondelez    │   ADAPT for $50K/3mo
              │   DON'T re-research     │   FILTER for team skills
              │   logistics             │   DON'T re-research SOTA
              │                         │
              │   WRITES:               │   WRITES:
              │   → domain-brief.md     │   → adapted-research.md
              └────────┬────────────────┘
                       │
                       ▼ (merge)
              ┌─────────────────┐
              │  STEP 1.3       │
              │  R-DA (optional)│
              │  Data Assessment│
              │                 │
              │  READS:         │
              │  ├ brief        │
              │  └ R-DE-notes ★ │
              │    (OWN report) │
              │                 │
              │  APPENDS TO:    │
              │  → discovery-   │
              │    report.md    │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │  CONSOLIDATE    │
              │  → discovery-   │
              │    report.md    │
              │  (merged doc)   │
              └────────┬────────┘
                       │
                CHECKPOINT: alpha.json ✓
                (see ORCHESTRATION-ENGINE.md § Checkpoint)
```

**Files touched in P1:**

| Action | File | Agent | Hermes |
|--------|------|-------|--------|
| READ | `projects/PRJ-001/project-brief.md` | α, R-D06 | H2 |
| READ | `data/industries/I06.json` | R-D06 | H2 |
| READ | `data/matrix/B01-I06.json` | α | H2 |
| READ | `data/baselines/B01.json` (concepts, algorithms) | α | H2 |
| READ | `docs/reports/I06/R-D06-notes.md` ★ OWN | R-D06 | H2 |
| READ | `docs/reports/B01-I06/intersection-report.md` ★ OWN | α | H2 |
| READ | `docs/reports/B01/R-DE-notes.md` ★ OWN | R-DA | H2 |
| WRITE | `projects/PRJ-001/discovery-report.md` | α (lead) | H5 |
| WRITE | `projects/PRJ-001/_checkpoints/alpha.json` | System | H5 |

**Cost: ~$0.08 (no web search, reuse knowledge)**

---

## PHASE 2 — PROPOSAL & BUSINESS CASE (~10 min)

```
                   discovery-report.md
                          │
             ┌────────────┴────────────┐
             │                         │
    ┌────────▼────────┐       ┌────────▼────────┐
    │  STEP 2.1       │       │  STEP 2.2       │
    │  γ Feasibility  │       │  R-BA Business  │
    │  Evaluation     │       │  Case           │
    │  (PARALLEL)     │       │  (PARALLEL)     │
    └────────┬────────┘       └────────┬────────┘
             │                         │
             │   READS:                │   READS:
             │   ├ discovery-report    │   ├ project-brief.md
             │   ├ project-brief.md    │   └ discovery-report.md
             │   ├ feasibility-        │
             │   │ report.md ★         │   SANDBOX:
             │   │ (OWN B01 report)    │   CAN: ROI calc, timeline,
             │   └ I06.json (market)   │    resource plan, build/buy
             │                         │   CANNOT: tech decisions,
             │   SANDBOX:              │    feasibility score, web srch
             │   CAN: score 30/30/20/20│
             │    verdict, challenge,  │   PRODUCES:
             │    web search (market)  │   ├ ROI calculation
             │   CANNOT: design, code, │   ├ Timeline estimate
             │    override user        │   ├ Resource plan
             │                         │   └ Build vs Buy
             │   SCORING:              │
             │   Tech:   8/10         │
             │   Value:  9/10         │
             │   Data:   5/10 ← ⚠️    │
             │   Risk:   7/10         │
             │   ─────────────        │
             │   OVERALL: 7.4/10      │
             │   VERDICT: ✅ GO        │
             └────────┬───────────────┘
                      │
             ┌────────▼────────┐
             │  STEP 2.3       │
             │  γ Competitive  │
             │  Analysis       │
             │                 │
             │  READS:         │
             │  ├ B01.json     │
             │  │ (techStack)  │
             │  └ I06.json     │
             │   (competitive) │
             │                 │
             │  WEB SEARCH:    │
             │  ✅ ALLOWED      │
             │  (competitor    │
             │   pricing only) │
             └────────┬────────┘
                      │
             ┌────────▼────────┐
             │  STEP 2.4       │
             │  CONSOLIDATE    │
             │  → proposal.md  │
             │  (uses template:│
             │   proposal.     │
             │   tpl.md)       │
             └────────┬────────┘
                      │
        ┌─────────────▼──────────────┐
        │    ⚡ DECISION GATE 1 ⚡    │
        │    (see DECISION-GATES.md) │
        │                            │
        │  Score: 7.4/10 → ✅ GO     │
        │  Condition: Data cleaning  │
        │  phase (2-4 weeks) must    │
        │  be included in timeline   │
        │                            │
        │  User confirms → P3 ▶      │
        │                            │
        │  IF < 7.0 → CONDITIONAL GO │
        │  IF < 5.0 → NO-GO (stop)  │
        └────────────────────────────┘
```

**Files touched in P2:**

| Action | File | Agent | Hermes |
|--------|------|-------|--------|
| READ | `projects/PRJ-001/discovery-report.md` | γ, R-BA | H2 |
| READ | `projects/PRJ-001/project-brief.md` | γ, R-BA | H2 |
| READ | `docs/reports/B01-I06/feasibility-report.md` ★ OWN | γ | H2 |
| READ | `data/industries/I06.json` (market, competitive) | γ | H2 |
| READ | `templates/proposal.tpl.md` | γ | H5 |
| WEB SEARCH | competitor pricing (Nixtla, AWS Forecast) | γ | H3 |
| WRITE | `projects/PRJ-001/proposal.md` | γ (lead) | H5 |
| WRITE | `projects/PRJ-001/_checkpoints/gamma.json` | System | H5 |

**Cost: ~$0.12 (γ web search adds cost)**

---

## PHASE 3 — SOLUTION ARCHITECTURE (~15 min)

```
              discovery-report.md + proposal.md
                          │
         ┌────────────────┼────────────────┐
         │                │                │
┌────────▼────┐  ┌────────▼────┐  ┌────────▼────┐
│ STEP 3.1    │  │ STEP 3.2    │  │  Layer 2    │
│ R-SA System │  │ β (Praxis)  │  │  (PARALLEL) │
│ Architecture│  │ Tech Stack  │  │             │
│ (sequential │  │ Selection   │  │ R-MLE: model│
│  — needs SA │  │ (after SA)  │  │  selection  │
│  first)     │  │             │  │ R-DE: data  │
│             │  │             │  │  pipeline   │
│ READS:      │  │ READS:      │  │ R-BE: API   │
│ ├ brief     │  │ ├ brief     │  │  endpoints  │
│ ├ discovery │  │ ├ discovery │  │             │
│ └ proposal  │  │ ├ SA output │  │ Each READS: │
│             │  │ └ tech-     │  │ ├ brief     │
│ SANDBOX:    │  │   report ★  │  │ ├ arch draft│
│ CAN: define │  │   (OWN B01 │  │ └ OWN notes │
│  components,│  │    report)  │  │   from B01/ │
│  data flow, │  │             │  │   I06 ★     │
│  integration│  │ SANDBOX:    │  │             │
│ CANNOT:     │  │ CAN: select │  │ Each agent  │
│  select tech│  │  specific   │  │ stays in    │
│  stack      │  │  tools      │  │ own lane    │
│             │  │ CANNOT:     │  │ (SYSTEM-    │
│ WRITES:     │  │  override SA│  │  PROMPTS.md)│
│ → arch.md   │  │ WRITES:     │  │             │
│   (draft)   │  │ → tech stack│  │ WRITES:     │
│             │  │   section   │  │ → layer2/   │
│ uses tpl:   │  │   of arch   │  │   notes per │
│ architecture│  │             │  │   agent     │
│ .tpl.md     │  │             │  │             │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
               ┌────────▼────────┐
               │  STEP 3.3       │
               │  R-SE Security  │
               │  Review         │
               │                 │
               │  READS:         │
               │  ├ arch.md      │
               │  └ brief        │
               │  (PDPL 2025!)   │
               │                 │
               │  SANDBOX:       │
               │  CAN: auth flow,│
               │   encryption,   │
               │   PII handling  │
               │  CANNOT:        │
               │   override arch │
               └────────┬────────┘
                        │
               ┌────────▼────────┐
               │  STEP 3.5       │
               │  γ Architecture │
               │  Review         │
               │                 │
               │  Checks:        │
               │  ☑ Fits $50K?   │
               │  ☑ 3-month OK?  │
               │  ☑ 2ML+1BE OK?  │
               │  ☑ Over-eng?    │
               │                 │
               │  (see QUALITY-  │
               │   CHECKLIST.md  │
               │   for criteria) │
               └────────┬────────┘
                        │
          ┌─────────────▼──────────────┐
          │    ⚡ DECISION GATE 2 ⚡    │
          │    (see DECISION-GATES.md) │
          │                            │
          │  γ verdict: PASS ✅         │
          │  "Architecture fits within │
          │   constraints. LightGBM +  │
          │   FastAPI + PostgreSQL is   │
          │   appropriate for $50K."   │
          │                            │
          │  IF FAIL → R-SA simplify   │
          │  → γ re-review (max 2x)    │
          │  → escalate to user        │
          │                            │
          │  → DELIVER PACKAGE (Scope B)│
          └────────────────────────────┘
```

**Files touched in P3:**

| Action | File | Agent | Hermes |
|--------|------|-------|--------|
| READ | `projects/PRJ-001/discovery-report.md` | R-SA, β | H2 |
| READ | `projects/PRJ-001/proposal.md` | R-SA, β, γ | H2 |
| READ | `projects/PRJ-001/project-brief.md` | All | H2 |
| READ | `docs/reports/B01/tech-report.md` ★ OWN | β (Dr. Praxis) | H2 |
| READ | `docs/reports/B01/R-MLE-notes.md` ★ OWN | R-MLE | H2 |
| READ | `docs/reports/B01/R-DE-notes.md` ★ OWN | R-DE | H2 |
| READ | `docs/reports/B01/R-BE-notes.md` ★ OWN | R-BE | H2 |
| READ | `templates/architecture.tpl.md` | R-SA | H5 |
| WRITE | `projects/PRJ-001/architecture.md` | R-SA + β (Dr. Praxis) | H5 |
| WRITE | `projects/PRJ-001/layer2/R-MLE-notes.md` | R-MLE | H5 |
| WRITE | `projects/PRJ-001/layer2/R-DE-notes.md` | R-DE | H5 |
| WRITE | `projects/PRJ-001/layer2/R-BE-notes.md` | R-BE | H5 |
| WRITE | `projects/PRJ-001/_checkpoints/beta.json` | System | H5 |

**Cost: ~$0.25 (multiple agents, but no web search)**

---

## DELIVERY (Scope B stops here)

```
┌───────────────────────────────────────────────────────┐
│  FINAL OUTPUT — Scope B Package                        │
│                                                        │
│  projects/PRJ-001-mondelez-forecast/                   │
│  ├── project-brief.md          ← P0 (R-BA)           │
│  ├── domain-brief.md           ← P1 (R-D06)          │
│  ├── discovery-report.md       ← P1 (α Dr. Archon)   │
│  ├── proposal.md               ← P2 (γ + R-BA)       │
│  ├── architecture.md           ← P3 (R-SA + β Praxis)│
│  ├── layer2/                                           │
│  │   ├── R-MLE-notes.md        ← P3 (R-MLE)         │
│  │   ├── R-DE-notes.md         ← P3 (R-DE)          │
│  │   └── R-BE-notes.md         ← P3 (R-BE)          │
│  ├── _state.json               ← Pipeline state      │
│  ├── _checkpoints/                                     │
│  │   ├── ba.json                                       │
│  │   ├── alpha.json                                    │
│  │   ├── gamma.json                                    │
│  │   └── beta.json                                     │
│  └── _metadata/                                        │
│      └── project-memory.md     ← H4 (σ, if Scope≥C) │
│                                                        │
│  TOTAL COST:  ~$0.45                                   │
│  TOTAL TIME:  ~52 min (wall clock)                     │
│  AGENTS USED: 11 (α, β, γ, R-BA, R-SA, R-SE,        │
│               R-D06, R-MLE, R-DE, R-BE, σ*)           │
│                                                        │
│  *σ only runs in Scope C+ for consolidation.           │
│   In Scope B, package is assembled by orchestrator.    │
└───────────────────────────────────────────────────────┘
```

**Filesystem Check (see FILESYSTEM-CHECKLIST.md):**

| Phase | Required File | Status |
|-------|--------------|--------|
| P0 | `project-brief.md` | ✅ |
| P0 | `_state.json` | ✅ |
| P1 | `discovery-report.md` | ✅ |
| P1 | `domain-brief.md` | ✅ |
| P1 | `_checkpoints/alpha.json` | ✅ |
| P2 | `proposal.md` | ✅ |
| P2 | `_checkpoints/gamma.json` | ✅ |
| P3 | `architecture.md` | ✅ |
| P3 | `layer2/*.md` (3 files) | ✅ |
| P3 | `_checkpoints/beta.json` | ✅ |

---

## TIMELINE — Wall Clock

```
TIME   PHASE    AGENTS ACTIVE                           STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0:00   P0       System (auto-match + H4 memory scan)    ⚡ auto
0:02   P0       R-BA (generate brief, sandbox: no tech) ▶ working
0:05   P0       User (review brief)                     ⏸ human
0:06   P1       R-D06 (domain brief, reads OWN ★)         ▶ working
0:12   P1       α (adapted research, reads R-D06 output) ▶ working
0:18   P1       R-DA (data assessment, append)           ▶ working
0:22   P2       γ ∥ R-BA (parallel)                      ▶▶ parallel
0:30   P2       γ (competitive + web search + consolidate) ▶ working
0:32   P2       ⚡ GATE 1 — Score 7.4 → GO              ✅ pass
0:33   P3       R-SA (system architecture, uses tpl)     ▶ working
0:38   P3       β ∥ R-MLE ∥ R-DE ∥ R-BE (parallel)     ▶▶▶▶ parallel
0:48   P3       R-SE (security review — PDPL 2025)       ▶ working
0:50   P3       γ (architecture review)                  ▶ working
0:52   P3       ⚡ GATE 2 — PASS                        ✅ done
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ~52 min wall clock | $0.45 API cost | 11 agents
```

---

## KNOWLEDGE FLOW — What reads what (★ = OWN report from MAESTRO)

```
               MAESTRO Knowledge Graph (H2 — context source)
               ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
               ┌──────────┐ ┌──────────┐ ┌──────────┐
               │ B01.json │ │ I06.json │ │B01-I06   │
               │          │ │          │ │.json     │
               └────┬─────┘ └────┬─────┘ └────┬─────┘
                    │            │             │
                    │  docs/reports/ (★ OWN reports per agent)
                    │  ┌────────────────────────────────────────┐
                    │  │ B01/research-report.md         → α     │
                    │  │ B01/tech-report.md             → β     │
                    │  │ B01-I06/intersection-report.md → α     │
                    │  │ B01-I06/feasibility-report.md  → γ     │
                    │  │ I06/R-D06-notes.md             → D06   │
                    │  │ B01/R-DE-notes.md              → R-DE  │
                    │  │ B01/R-BE-notes.md              → R-BE  │
                    │  └────────────────────────────────────────┘
                    │
         ┌─────────┼────────────┼─────────────┼───────────┐
         │         │            │             │           │
         ▼         ▼            ▼             ▼           ▼
    ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ ┌────────┐
    │ α       │ │ β      │ │ γ      │ │ R-D06    │ │ R-MLE  │
    │ reads:  │ │ reads: │ │ reads: │ │ reads:   │ │ reads: │
    │ B01.json│ │ B01    │ │ B01-I06│ │ I06.json │ │ B01/   │
    │ B01-I06 │ │ tech ★ │ │ feas ★ │ │ R-D06  ★ │ │ R-MLE ★│
    │ inter ★ │ │        │ │ I06.mkt│ │ notes    │ │ notes  │
    └────┬────┘ └───┬────┘ └───┬────┘ └────┬─────┘ └───┬────┘
         │          │          │           │            │
         ▼          ▼          ▼           ▼            ▼
    ┌──────────────────────────────────────────────────────────┐
    │                   PROJECT OUTPUT (H5)                      │
    │                                                          │
    │  brief → discovery → proposal → architecture             │
    │  (P0)    (P1)        (P2)       (P3)                    │
    │                                                          │
    │  Each phase output becomes INPUT for next phase          │
    │                                                          │
    │  H4 MEMORY (after project completes):                    │
    │  σ extracts → project-memory.md (for future projects)    │
    │  σ extracts → knowledge-feedback.md (for MAESTRO update) │
    └──────────────────────────────────────────────────────────┘
```

---

## SO SÁNH: Research mode vs Product mode

```
RESEARCH (Phase 1 MAESTRO — đã làm):
  α nhận topic "Forecasting" → web search → generate 4000 words NEW
  Cost: ~$0.20/agent | Time: ~15 min | Output: research-report.md

PRODUCT (Phase 2 Workspace — mô phỏng trên):
  α nhận OWN research-report + client brief → ADAPT → write 2000 words
  Cost: ~$0.05/agent | Time: ~8 min | Output: discovery-report.md
  
  KEY DIFFERENCES:
  ┌──────────────────────┬─────────────┬──────────────┐
  │                      │ Research    │ Product      │
  ├──────────────────────┼─────────────┼──────────────┤
  │ Web search           │ YES (heavy) │ NO (reuse)   │
  │ Input knowledge      │ None        │ OWN reports  │
  │ Output type          │ Generic     │ Client-fit   │
  │ Cost per agent       │ $0.15-0.30  │ $0.03-0.08   │
  │ Time per agent       │ 10-20 min   │ 5-10 min     │
  │ Token input          │ ~2K         │ ~15K (richer)│
  │ Token output         │ ~4K         │ ~2K (focused)│
  │ Agent sandbox        │ Loose       │ Strict (H3)  │
  │ H4 memory input      │ None        │ Prev projects│
  │ Quality gate         │ Score ≥ 7.0 │ Gate 1-4     │
  │ Templates used       │ No          │ Yes (*.tpl)  │
  └──────────────────────┴─────────────┴──────────────┘
  
  SAVINGS: 70% cost, 50% time — because knowledge already exists.
```

---

## H4 MEMORY — What happens AFTER project completes

```
PROJECT COMPLETE
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  σ (Ms. Scribe) extracts TWO separate outputs:       │
│                                                      │
│  1. project-memory.md (H4 — project → project)      │
│     ┌────────────────────────────────────────┐       │
│     │ key_insights:                          │       │
│     │  - "Prophet+LightGBM > either alone"   │       │
│     │  - "Data cleaning took 3 weeks not 1"  │       │
│     │ tech_decisions:                        │       │
│     │  - "FastAPI over Django for ML serving" │       │
│     │  - "Skipped Feast for MVP"             │       │
│     │ client_patterns:                       │       │
│     │  - "VN 3PLs overestimate data quality" │       │
│     │ what_worked:                           │       │
│     │  - "SHAP charts for ops manager trust" │       │
│     │ what_didnt_work:                       │       │
│     │  - "Weather API: <0.5% WMAPE lift"     │       │
│     └────────────────────────────────────────┘       │
│     → Loaded by System for FUTURE B01×I06 projects   │
│     → Budget: 2000 tokens max                        │
│     → Priority: same B+I > same B > same I > recent  │
│                                                      │
│  2. knowledge-feedback.md (feedback → MAESTRO)       │
│     ┌────────────────────────────────────────┐       │
│     │ [TECHNIQUE] Prophet+LightGBM → B01     │       │
│     │ [INVALIDATION] Weather API lift → B01   │       │
│     │ [INDUSTRY] Data quality caveat → I06    │       │
│     └────────────────────────────────────────┘       │
│     → Queued for Manager review (NOT auto-applied)   │
│     → Accepted items update MAESTRO Knowledge Graph  │
└──────────────────────────────────────────────────────┘
```

---

## NẾU SCOPE D (full P0→P9) thì tiếp tục:

```
P3 xong
  │
  ├── P4a: R-BE  → api-design.md         ┐
  ├── P4b: R-DBE → database-design.md    │ PARALLEL
  ├── P4c: R-MLE → algorithm-spec.md     │ (~10 min)
  ├── P4d: R-FE  → ui-design.md          ┘
  │         (R-UX supports R-FE)
  │
  ├── P4e: R-SA  → integration-review.md   (after P4a-d, cross-checks all 4)
  │         ⚡ GATE 3: all designs consistent?
  │
  ├── P5:  R-PM  → project-plan.md         (WBS, sprints, milestones)
  │
  ├── P6a: β (Praxis) → dev-guide.md        ┐
  ├── P6b: R-BE  → dev-guide-backend.md     │ PARALLEL
  ├── P6c: R-FE  → dev-guide-frontend.md    │ (~10 min)
  ├── P6d: R-MLE → dev-guide-ml.md          ┘
  │
  ├── P7:  R-QA + R-SE + R-PE → qa-plan.md  ┐ PARALLEL
  ├── P8:  R-DO + R-CE → deployment-plan.md  ┘ (~8 min)
  │
  └── P9:  σ → executive-summary.md + full package
  │         R-TC → README.md navigation index
  │         σ → _metadata/project-memory.md (H4)
  │         σ → _metadata/knowledge-feedback.md
  │         ⚡ GATE 4: all deliverables present + consistent?
  
  ADDITIONAL: ~50 min | ~$3.00 | 8+ more agents
  SCOPE D TOTAL: ~100 min | ~$3.50 | 17-20 agents
```

---

## CROSS-REFERENCE TO DOCS

| What you need to know | Read this file |
|-----------------------|----------------|
| Full pipeline phases | [PIPELINE-OVERVIEW.md](pipeline/PIPELINE-OVERVIEW.md) |
| What context each agent gets | [CONTEXT-LOADING.md](agents/CONTEXT-LOADING.md) |
| Agent CAN/CANNOT rules | [SYSTEM-PROMPTS.md](agents/SYSTEM-PROMPTS.md) |
| Knowledge reuse rules | [KNOWLEDGE-REUSE.md](agents/KNOWLEDGE-REUSE.md) |
| Gate criteria | [DECISION-GATES.md](quality/DECISION-GATES.md) |
| Project memory format | [MEMORY-PROTOCOL.md](agents/MEMORY-PROTOCOL.md) |
| Required output files | [FILESYSTEM-CHECKLIST.md](quality/FILESYSTEM-CHECKLIST.md) |
| Error handling | [ERROR-HANDLING.md](quality/ERROR-HANDLING.md) |
| State machine | [ORCHESTRATION-ENGINE.md](operations/ORCHESTRATION-ENGINE.md) |
| Output templates | [templates/](templates/) |
| All docs index | [DOCUMENT-MAP.md](core/DOCUMENT-MAP.md) |

---

*Agent Workspace v1.0 — Simulation Example*
*Project: PRJ-001 Mondelez Shipment Forecasting*
*Scope: B (P0 → P3) — Architecture Proposal*
