# System Operational Flow — Agent Workspace

> Full walkthrough: khi có 1 project mới thì mọi thứ diễn ra như thế nào.  
> Áp dụng sau khi dev đã fix tất cả issues trong `DEV-ISSUES.md`.  
> Example: **PRJ-001 Mondelez Shipment Forecasting** — Scope B (P0 → P3).  
> See also: [SIMULATION-EXAMPLE.md](docs/SIMULATION-EXAMPLE.md) for simplified ASCII flow diagrams.

---

## ⚠️ Đây là BLUEPRINT canonical — KHÔNG per-project

File này mô tả **template cố định** áp dụng cho mọi project. Variations per project KHÔNG ghi tay vào đây — capture tự động qua project config:

| Cái gì CỐ ĐỊNH (file này) | Cái gì BIẾN THIÊN (per project, đọc từ config) |
|---|---|
| Phase order P0 → P1 → ... → P9 → P10 | `_meta.json.scope_tier` → phases nào invoke (A/B/C/D) |
| Step sequence trong P0 (0.1 → 0.5) + I/O contract mỗi step | `_meta.json.knowledge_match` → baselines/industries load |
| 4-tier KV-cache build order (W04 §2.5) | `_meta.json.team.agents_assigned` → agents nào dispatch |
| W04 dispatch SOP, harness primitives | `_meta.json.attachments[]` → skill addons · docs · repos |
| 11 rules constitution, DoD thresholds | `_state.json` → current phase + completed/blocked |
| H1→H5 build order | `harness/manifest.yaml` → profile L0/L1/L2 + cost cap + tools |
| Eval framework structure | `harness/permanent-fixes.md` → local rules cumulative |

**Agent KHÔNG hand-write SYSTEM-FLOW per project**. Template + config = đủ context để tự linh động:
- Phase nào skip / invoke
- Knowledge nào load
- Agent nào dispatch
- Attachment nào inject (filtered theo agent×phase tại W04 §2.6)
- Cost cap nào áp dụng
- Voice nào dùng client-facing

Nếu project cần override step ngoài template → ghi vào `_meta.json.phase_overrides[]` (W04 đọc), KHÔNG sửa file này.

---

## Hermes Engineer — 5 Levels

Trước khi đọc flow, hiểu rõ 5 levels này. **Mỗi agent dispatch phải đi qua H1→H2→H3→H4→H5 theo thứ tự.**

```
H1 — FOUNDATION        Đọc để HIỂU task là gì (phase spec, pipeline overview)
H2 — CONTEXT SELECT    Đọc để BIẾT load file nào cho agent này (context matrix + gap assessment)
H3 — PROMPT BUILD      Đọc để XÂY DỰNG prompt (pattern + per-agent CAN/CANNOT)
H4 — MEMORY INJECT     Đọc để NẠP bài học từ dự án trước vào prompt
H5 — FILESYSTEM OPS    SAVE output, checkpoint, validate files exist
```

---

## System Boot (Once, at Startup)

```
Orchestrator khởi động → đọc foundation docs (H1 load):

READ  docs/core/VISION.md               → hiểu system có 2 modes (A/B), scope A/B/C/D
READ  docs/core/ARCHITECTURE.md         → biết file structure, tech stack, phase W1-W5
READ  docs/core/DOCUMENT-MAP.md         → biết từng file ở đâu, dùng khi nào
READ  docs/pipeline/PIPELINE-OVERVIEW.md → biết 9 phases, sequential/parallel rules
READ  docs/agents/TEAM-ROSTER.md        → load danh sách 26 agents + assembly rules
READ  docs/quality/DECISION-GATES.md    → biết 4 gates + criteria

CACHE vào memory: agents[], phases[], scopeRules[], gateRules[]
```

---

## P0 — INTAKE & SCOPING (~5 min)

**Trigger:** User gửi raw client text → hệ thống bắt đầu.

```
USER INPUT:
  "Acme Consulting cần xây hệ thống dự báo khối lượng vận chuyển cho Mondelez Vietnam.
   FMCG, GT+MT. Dự báo theo tuyến, theo tuần. Budget $50K | 3 tháng | 2 ML + 1 BE
   Data: 2 năm TMS history, GPS tracking, weather API."
```

### Step 0.0 — H1: Đọc phase spec

```
READ  docs/pipeline/P0-INTAKE.md        → H1: biết P0 có 5 steps
```

### Step 0.1 — Parse Input (System Automated)

```
PROCESS: Extract key terms từ raw text
  → problem_type: "demand forecasting"
  → domain: "logistics / FMCG"
  → constraints: { budget: 50000, timeline: "3 months", team: "2 ML + 1 BE" }
  → data: ["TMS history 2yr", "GPS tracking", "weather API"]
```

### Step 0.2 — Knowledge Matching (H2 + Knowledge Matcher)

```
READ  docs/operations/KNOWLEDGE-MATCHER-SPEC.md  → H2: matching algorithm
READ  data/baselines/*.json (name + description fields only)  → H2: 15 baseline summaries
READ  data/industries/*.json (name + description fields only) → H2: 20 industry summaries

PROCESS: knowledge-matcher.ts
  → LLM call: "Dựa vào client brief, match Baseline + Industry"
  → Result: B01 (Forecasting) ✅ | I06 (Logistics) ✅
  → Check matrix: data/matrix/B01-I06.json → EXISTS ✅

EMIT event: { type: "knowledge.matched", baselines: ["B01"], industry: "I06" }
```

### Step 0.2b — Gap Pre-Scan (H2, automated)

```
READ  docs/agents/GAP-DETECTION.md      → H2: gap taxonomy + budget rules

PROCESS: Assess coverage of matched nodes vs. client brief:
  B01 Forecasting → "LightGBM + Optuna" không có trong B01 → L1 flag (1 search for α)
  I06 Logistics   → routing, WMS covered → L0
  B01-I06 Matrix  → age: 4 months, acceptable → L0
  → No L4 flags → Manager approval NOT required

BUDGET ALLOCATION:
  α  → 1 pre-authorized L1 query (Optuna integration patterns)
  β  → 0 (L0 for tech stack coverage)
  R-D06 → 0 (industry context sufficient)

WRITE projects/PRJ-001/_metadata/gap-pre-scan.json  → H5
EMIT event: { type: "gap.pre_scan_complete", L4_flags: 0, total_budget: 1 }
```

### Step 0.2c — Attachment Intake (NEW v1.1)

```
READ  _shared/standards/project-attachments.md            → H2: 3-case spec
READ  projects/PRJ-001/_meta.json.attachments[]           → H4: declared attachments
READ  projects/PRJ-001/.agents/_overrides.yaml             → if any
READ  projects/PRJ-001/_attachments/repos/_refs.yaml       → if any

PROCESS:
  1. Skill addons → verify parent_version_pin == base agent current version
                  → BLOCK if mismatch
                  → require new_persona_signoff if strategy=new_persona
  2. Docs        → R-σ extract PDF/DOCX → .txt cache
                  → SHA256 + PII scan + license + size check
  3. Repos       → R-SEC license + allowlist + PII scan
                  → fetch per fetch_method (cherry_pick preferred)
  4. Manifest    → sync _attachments/_index.md from _meta.json
  5. Cost        → token budget summary; warn @30%, block @50%

WRITE projects/PRJ-001/_attachments/_index.md (verification log)
EMIT event: { type: "attachments.verified", count: N, blocked: 0 }

# If empty attachments[] → skip all 5 steps, no-op
```

Detail: [`P0-INTAKE.md`](docs/pipeline/P0-INTAKE.md) Step 0.2c.

### Step 0.3 — Team Assembly (H1 + H2)

```
READ  docs/agents/TEAM-ROSTER.md        → H1: team assembly rules
READ  docs/agents/CONTEXT-LOADING.md    → H2: per-agent context needs

PROCESS: Auto-assemble team cho Scope B (P0→P3):
  Layer 1:  α (Research)  β (Engineering)  γ (Evaluation)
  Layer 2:  R-D06 (Logistics Domain)  R-MLE  R-DE  R-BE
  Support:  R-SE  R-SA  R-BA  σ

RUN 7-Stage Coverage Check:
  Stage 1 Research+Academic → α,β,γ ✅
  Stage 2 Data+Engineering  → R-MLE,R-DE ✅
  Stage 3 Backend+API       → R-BE ✅
  Stage 4 Frontend          → Scope B: deferred --
  Stage 5 Deployment+Ops    → Scope B: deferred --
  Stage 6 Security+Quality  → R-SE ✅
  Stage 7 Management+Deliv  → R-BA,R-SA,R-D06,σ ✅

RESULT: All required stages covered → proceed
```

### Step 0.4 — H4: Load Project Memories

```
READ  projects/*/_ metadata/project-memory.md (scan)  → H4: cross-project learning

PRIORITY SEARCH:
  P1 (Same B01+I06)   → none (first B01×I06 project) 0 tokens loaded
  P2 (Same B01, diff I) → none
  P3 (Same I06, diff B) → none
  P4 (Recent 3 any)   → none (first project)

RESULT: 0 tokens memory. Cold start.
NOTE: Sau PRJ-001 complete, PRJ-002 với B01+I06 sẽ được inject PRJ-001 memory.
```

### Step 0.5 — Generate Project Brief (Agent: R-BA)

```
READ  docs/agents/DISPATCH-FORMAT.md    → H1: dispatch template
READ  docs/agents/SYSTEM-PROMPTS.md §5 (R-BA, lines 138-164)  → H3: R-BA CAN/CANNOT sandbox
READ  docs/agents/PROMPT-PATTERNS.md    → H3: không dùng pattern cụ thể (parse task)
READ  docs/templates/project-brief.tpl.md → H5: output template

BUILD dispatch:
  To: R-BA | Phase: P0 | Task: formalize project brief
  Context: client raw input + B01 summary + I06 summary + B01-I06 summary
  Forbidden: no tech decisions, no scope expansion, no web search

CALL Claude API: R-BA → generates project-brief.md

WRITE projects/PRJ-001/project-brief.md   → H5: output
WRITE projects/PRJ-001/_state.json        → H5: pipeline state

VALIDATE (FILESYSTEM-CHECKLIST P0):
  ✅ project-brief.md exists + non-empty
  ✅ _state.json exists

EMIT event: { type: "agent.completed", agentId: "R-BA", outputPath: "..." }
```

### Step 0.6 — User Confirmation

```
→ UI displays project-brief.md + team roster + matched B01/I06
→ User reviews → APPROVED ✓
→ Pipeline proceeds to P1
```

**FILES TOUCHED IN P0:**

| Action | File | H Level |
|--------|------|---------|
| READ | `docs/pipeline/P0-INTAKE.md` | H1 |
| READ | `docs/operations/KNOWLEDGE-MATCHER-SPEC.md` | H2 |
| READ | `data/baselines/*.json` (summary) | H2 |
| READ | `data/industries/*.json` (summary) | H2 |
| READ | `data/matrix/B01-I06.json` | H2 |
| READ | `docs/agents/TEAM-ROSTER.md` | H1 |
| READ | `docs/agents/CONTEXT-LOADING.md` | H2 |
| READ | `docs/agents/GAP-DETECTION.md` | H2 |
| WRITE | `projects/PRJ-001/_metadata/gap-pre-scan.json` | H5 |
| READ | `projects/*/_metadata/project-memory.md` (scan) | H4 |
| READ | `docs/agents/SYSTEM-PROMPTS.md §5 (R-BA)` | H3 |
| READ | `docs/agents/PROMPT-PATTERNS.md` | H3 |
| READ | `docs/templates/project-brief.tpl.md` | H5 |
| WRITE | `projects/PRJ-001/project-brief.md` | H5 |
| WRITE | `projects/PRJ-001/_state.json` | H5 |

---

## P1 — DISCOVERY & RESEARCH (~15-20 min)

**2 agents chạy theo thứ tự:** R-Dxx trước (domain context) → α sau (research adaptation).

### Agent R-D06 — Domain Briefing

```
─── H1: Foundation ────────────────────────────────────
READ  docs/pipeline/P1-DISCOVERY.md    → Step 1.1 là domain briefing bởi R-Dxx

─── H2: Context Selection ─────────────────────────────
READ  docs/agents/CONTEXT-LOADING.md   → R-Dxx receives: I-JSON (industry) + project-brief
READ  data/industries/I06.json         → logistics industry context (full)
READ  projects/PRJ-001/project-brief.md

─── H3: Prompt Build ──────────────────────────────────
READ  docs/agents/SYSTEM-PROMPTS.md §13 (R-Dxx, lines 355-380)  → R-D06 CAN/CANNOT sandbox
                                         (xác định: top 5 pain points, data reality,
                                          terminology, real companies, compliance)
PATTERN: không dùng ADAPT/EVALUATE (R-Dxx dùng industry knowledge, không có baseline report)

─── H4: Memory ────────────────────────────────────────
Inject: memories đã load ở P0 → 0 tokens (cold start)

─── H5: Execute + Save ────────────────────────────────
CALL Claude API (streaming) → R-D06 generates domain-brief.md
WRITE projects/PRJ-001/domain-brief.md
WRITE projects/PRJ-001/_checkpoints/R-D06.json
  { agentId: "R-D06", phase: "P1", status: "completed", tokens: {...} }

EMIT event: { type: "agent.completed", agentId: "R-D06" }
EMIT event: { type: "handoff", from: "R-D06", to: "alpha" }
```

### Agent α (Dr. Archon) — Adapted Research

```
─── H1: Foundation ────────────────────────────────────
READ  docs/pipeline/P1-DISCOVERY.md   → Step 1.2: α adapts baseline research
READ  docs/agents/DISPATCH-FORMAT.md  → dispatch template for α

─── H2: Context Selection ─────────────────────────────
READ  docs/agents/CONTEXT-LOADING.md  → α receives:
                                         α's own reports + Baseline JSON + brief
READ  docs/reports/B01/research-report.md   → α's OWN previous research on Forecasting
READ  data/baselines/B01.json               → concepts, algorithms, SOTA sections only
READ  data/industries/I06.json              → summary only (α already has R-D06 output)
READ  projects/PRJ-001/project-brief.md
READ  projects/PRJ-001/domain-brief.md      → R-D06's output (previous step)
READ  docs/agents/KNOWLEDGE-REUSE.md        → H2: 4 rules (ADAPT, don't repeat, etc.)
READ  projects/PRJ-001/_metadata/gap-pre-scan.json → H2: load P0 gap pre-scan result

─── H3: Prompt Build ──────────────────────────────────
READ  docs/agents/SYSTEM-PROMPTS.md §1 (α, lines 20-45)  → α CAN: web search if gap, filter
                                         α CANNOT: make tech decisions, evaluate feasibility
PATTERN: ADAPT
  "You previously researched Demand Forecasting (report attached).
   Adapt your knowledge for THIS client: Mondelez Vietnam, FMCG logistics.
   Filter to what fits: $50K budget, 3 months, 2 ML devs, 2yr TMS data.
   Do NOT copy from your report. Write new content for THIS project."

─── H4: Memory Inject ─────────────────────────────────
(0 tokens — cold start, no previous B01×I06 projects)

─── H5: Execute + Save ────────────────────────────────
CALL Claude API (streaming, web_search tool enabled for gaps)
  → α reads B01 research → filters → adapts → writes discovery-report.md

TOKEN budget check: input ~12K tokens (within H2 limit)

WRITE projects/PRJ-001/discovery-report.md
WRITE projects/PRJ-001/_checkpoints/alpha.json

VALIDATE (FILESYSTEM-CHECKLIST P1):
  ✅ discovery-report.md exists
  ✅ domain-brief.md exists          (added after fix Mi-01)
  ✅ _checkpoints/alpha.json exists
  ✅ _checkpoints/R-D06.json exists  (added after fix Mi-01)

EMIT event: { type: "agent.completed", agentId: "alpha" }
```

---

## P2 — PROPOSAL & BUSINESS CASE (~10-15 min)

**2 agents:** γ (feasibility) chạy trước → R-BA (business case) song song → consolidate.

### Agent γ (Dr. Sentinel) — Feasibility Evaluation

```
─── H1 ────────────────────────────────────────────────
READ  docs/pipeline/P2-PROPOSAL.md    → feasibility scoring 30/30/20/20

─── H2 ────────────────────────────────────────────────
READ  docs/agents/CONTEXT-LOADING.md  → γ receives: γ's own reports + discovery + brief
READ  docs/reports/B01/feasibility-report.md  → γ's OWN baseline feasibility for B01
READ  projects/PRJ-001/discovery-report.md    → α's output (summarized if >4K tokens)
READ  projects/PRJ-001/project-brief.md

─── H3 ────────────────────────────────────────────────
READ  docs/agents/SYSTEM-PROMPTS.md §3 (γ, lines 77-106)  → γ CAN: score, verdict, web search
PATTERN: EVALUATE
  "Score feasibility for Mondelez problem:
   Tech (30%) | Value (30%) | Data (20%) | Risk (20%)
   Verdict: GO ≥7.0 / CONDITIONAL 5-6.9 / NO-GO <5.0"

─── H4 ────────────────────────────────────────────────
Inject memories (0 tokens cold start)

─── H5 ────────────────────────────────────────────────
CALL Claude API (streaming, web_search for competitor data)
  → γ scores: Tech=7.5 | Value=8.0 | Data=5.5 | Risk=7.0
  → Overall: 7.5×0.30 + 8.0×0.30 + 5.5×0.20 + 7.0×0.20 = 7.35 → GO ✅

WRITE projects/PRJ-001/proposal.md     (feasibility section)
WRITE projects/PRJ-001/_checkpoints/gamma.json
EMIT event: { type: "agent.completed", agentId: "gamma" }
```

### DECISION GATE 1 — After P2

```
─── H1 ────────────────────────────────────────────────
READ  docs/quality/DECISION-GATES.md  → Gate 1: score ≥ 7.0 = GO

CHECK:
  Overall score: 7.35 ≥ 7.0 → VERDICT: GO ✅

EMIT event: { type: "quality_gate.result", passed: true, score: 7.35 }

UI: Hiển thị proposal.md cho user → User confirms → PROCEED TO P3
```

---

## P3 — SOLUTION ARCHITECTURE (~15-20 min)

**5 agents:** R-SA → β (sequential, β needs SA draft) → R-CE ∥ R-SE (parallel) → γ (gate review).

```
─── H1 ────────────────────────────────────────────────
READ  docs/pipeline/P3-ARCHITECTURE.md → 4 steps (SA, tech stack, infra, security, gate)

DEPENDENCY CHECK: P3 needs P0+P1+P2 outputs
  ✅ project-brief.md
  ✅ discovery-report.md
  ✅ proposal.md
```

### R-SA → β chạy sequential (Bước 3.1 → 3.2)

β cần architecture draft từ R-SA làm input → KHÔNG thể parallel.

```
SEQUENTIAL DISPATCH:

── R-SA (Solution Architect) — chạy TRƯỚC ─────────────
H2: READ docs/reports/B01/tech-report.md (β's baseline as context for SA)
    READ discovery-report.md + proposal.md
H3: READ docs/agents/SYSTEM-PROMPTS.md §6 (R-SA)
    PATTERN: DESIGN
    "Design system components, data flow, integration points"
H5: CALL Claude API (streaming)
    WRITE architecture.md (system architecture section)
    WRITE _checkpoints/R-SA-1.json

── β (Dr. Praxis) — chạy SAU R-SA ─────────────────────
H2: READ architecture.md (R-SA draft)  → β reads SA's system design first
    READ docs/reports/B01/tech-report.md → β's OWN tech research on Forecasting
    READ discovery-report.md
    READ docs/agents/CONTEXT-LOADING.md → β reads: tech sections of B01 only
    LOAD data/baselines/B01.json → techStack + pipeline sections ONLY (not full)
H3: READ docs/agents/SYSTEM-PROMPTS.md §2 (β)
    PATTERN: ADAPT
    "You researched the tech stack for Forecasting systems.
     Adapt for Mondelez: Python team, AWS available, budget $50K.
     Choose specific tools per component with justification."
H5: CALL Claude API (streaming)
    WRITE architecture.md (tech stack section, merge with R-SA output)
    WRITE _checkpoints/beta.json
```

### R-SE + R-CE chạy song song (Bước 3.3 + 3.4)

```
WAIT for R-SA to complete (architecture draft needed)

PARALLEL DISPATCH:

── R-CE (Cloud Engineer) ──────────────────────────────
H2: READ architecture.md (draft) + project-brief.md
H3: READ docs/agents/SYSTEM-PROMPTS.md §16 (R-CE)
    PATTERN: DESIGN "Design AWS infrastructure, cost estimate, scaling"
H5: CALL Claude API → WRITE architecture.md (infra section)

── R-SE (Security Engineer) ───────────────────────────
H2: READ architecture.md (draft) + project-brief.md
H3: READ docs/agents/SYSTEM-PROMPTS.md §17 (R-SE)
    PATTERN: DESIGN "Auth, encryption, PII handling, compliance"
H5: CALL Claude API → WRITE architecture.md (security section)
```

### γ Architecture Review (Gate 2)

```
─── H1 ────────────────────────────────────────────────
READ  docs/quality/DECISION-GATES.md  → Gate 2: architecture fits constraints?

─── H2 ────────────────────────────────────────────────
READ  architecture.md (complete) + proposal.md (constraints)

─── H3 ────────────────────────────────────────────────
PATTERN: EVALUATE
  Check 6 questions:
  ✅ System diagram with all components named?
  ✅ Tech stack decided for every component?
  ✅ Data flow clear?
  ✅ Integration points identified?
  ✅ MVP vs full scope separated?
  ✅ Cost estimate within $50K budget?

RESULT: PASS → proceed to P4 (Scope B stops here)

─── H5 ────────────────────────────────────────────────
WRITE _checkpoints/gamma-gate2.json
EMIT event: { type: "quality_gate.result", passed: true }
```

**FILES TOUCHED IN P3:**

| Action | File | Agent |
|--------|------|-------|
| READ | `docs/reports/B01/tech-report.md` | β |
| READ | `data/baselines/B01.json` (techStack only) | β |
| READ | `discovery-report.md`, `proposal.md` | R-SA, β, γ |
| WRITE | `architecture.md` (4 sections merged) | R-SA, β, R-CE, R-SE |
| WRITE | `_checkpoints/R-SA-1.json`, `beta.json`, etc. | H5 |

---

## Scope B — Pipeline Kết Thúc

Scope B (P0→P3) kết thúc sau P3 Architecture Review PASS.

```
WRITE projects/PRJ-001/_state.json   → status: "COMPLETE" (Scope B)
EMIT event: { type: "pipeline.completed", scope: "B", reports: [...] }

UI: Hiển thị completion banner
    Download links: project-brief.md, discovery-report.md, proposal.md, architecture.md
```

---

## P9 — DELIVERY (Áp Dụng Cho Scope C/D)

Scope C/D thêm P4-P8 rồi kết thúc bằng P9. Đây là bước quan trọng nhất vì đóng loop H4.

### σ (Ms. Scribe) — Consolidation + Memory

```
─── H1 ────────────────────────────────────────────────
READ  docs/pipeline/P9-DELIVERY.md    → 4 steps (exec summary, doc index, feedback, package)

─── H2 ────────────────────────────────────────────────
READ  docs/agents/CONTEXT-LOADING.md  → σ receives ALL outputs (full, not summarized)
READ  ALL project outputs: brief + discovery + proposal + architecture + design/* + ...

─── H3 ────────────────────────────────────────────────
READ  docs/agents/SYSTEM-PROMPTS.md §4 (σ)
READ  docs/templates/executive-summary.tpl.md  → H5 (after fix H-02)
PATTERN: INTEGRATE
  "Review all documents for consistency. Write executive summary."

─── H4 — CRITICAL (Knowledge Feedback Loop) ───────────
READ  docs/agents/MEMORY-PROTOCOL.md  → σ must write 2 things:

  1. PROJECT MEMORY (for future Workspace projects):
     WRITE projects/PRJ-001/_metadata/project-memory.md
     → Key insights, tech decisions, client patterns, surprising findings
     → HARD LIMIT: 2000 tokens
     → Format: YAML per MEMORY-PROTOCOL.md §1

  2. KNOWLEDGE FEEDBACK (for MAESTRO Knowledge Graph updates):
     WRITE projects/PRJ-001/_metadata/knowledge-feedback.md
     → New techniques found (queue for B01 update)
     → Invalidations (B01 recommendations proven wrong)
     → Industry insights (queue for I06 update)
     → Manager reviews this queue separately

─── H5 ────────────────────────────────────────────────
WRITE projects/PRJ-001/executive-summary.md
WRITE projects/PRJ-001/README.md       → R-TC writes navigation doc
WRITE projects/PRJ-001/_metadata/pipeline-state.json
WRITE projects/PRJ-001/_metadata/agent-log.json

VALIDATE (FILESYSTEM-CHECKLIST P9 full delivery tree):
  ✅ All required files exist
  ✅ No empty files
  ✅ Template sections filled (QUALITY-CHECKLIST)

EMIT event: { type: "pipeline.completed", scope: "D", allReports: [...] }
```

---

## Full H1→H2→H3→H4→H5 Compliance Matrix

> Sau khi dev fix tất cả issues trong DEV-ISSUES.md

```
STEP                    H1    H2    H3    H4    H5    COMPLIANCE
────────────────────────────────────────────────────────────────────
System Boot             ✅    ─     ─     ─     ─     ✅
P0.0.2 Knowledge Match  ─     ✅    ─     ─     ─     ✅ (after C-02 fix)
P0.0.2b Gap Pre-Scan    ─     ✅    ─     ─     ✅    ✅
P0.0.3 Team Assembly    ✅    ✅    ─     ─     ─     ✅
P0.0.4 Load Memories    ─     ─     ─     ✅    ─     ✅
P0.0.5 Brief (R-BA)     ✅    ✅    ✅    ✅    ✅    ✅ (after H-01, H-02 fix)
P1 R-Dxx Domain         ✅    ✅    ✅    ✅    ✅    ✅
P1 α Research           ✅    ✅    ✅    ✅    ✅    ✅
P2 γ Feasibility        ✅    ✅    ✅    ✅    ✅    ✅
Gate 1                  ✅    ─     ─     ─     ✅    ✅
P3 R-SA + β             ✅    ✅    ✅    ✅    ✅    ✅
P3 R-CE + R-SE          ✅    ✅    ✅    ─     ✅    ✅
Gate 2                  ✅    ✅    ✅    ─     ✅    ✅
P4 Parallel branches    ✅    ✅    ✅    ✅    ✅    ✅ (after H-02: templates)
P4e Integration         ✅    ✅    ✅    ─     ✅    ✅ (after H-02: template)
Gate 3                  ✅    ✅    ─     ─     ✅    ✅
P9 σ Delivery           ✅    ✅    ✅    ✅    ✅    ✅ (after H-02: templates)
────────────────────────────────────────────────────────────────────
BEFORE FIXES:  13/17 steps fully compliant (76%)
AFTER FIXES:   17/17 steps fully compliant (100%) ✅
```

**Điểm thất bại trước khi fix:**
- H2 fail tại Knowledge Match (C-02 không có spec)
- H3 fail: SYSTEM-PROMPTS.md load toàn bộ 24KB thay vì per-agent (H-01)
- H5 fail tại P4/P4e/P9: thiếu templates (H-02)

---

## Mode A — Re-Research Flow (Brief)

> Sau khi tạo `docs/pipeline/MODE-A-PIPELINE.md` (DEV-ISSUES C-01)

```
TRIGGER: User chọn "Re-Research" mode → chọn module B14

H1: READ docs/pipeline/MODE-A-PIPELINE.md (cần tạo)
H1: READ docs/round-2-research-plan.md → biết B14 tier + gap list

Step 0: Score validation
  READ _state.json of B14 module → current score: 6.2
  Tier assignment: 6.0-6.4 → TIER B (full re-run)

H2: Load B14 context
  READ docs/reports/B14/research-report.md
  READ data/baselines/B14.json
  READ gap_list: ["edge cases", "unsupervised methods"]

H3: Build Mode A dispatch (ADAPT pattern, gap-focused)
  READ docs/agents/SYSTEM-PROMPTS.md §1 (α)
  READ docs/agents/DISPATCH-FORMAT.md → Mode A example (after fix H-04)

H4: No project memory (Mode A not a client project)

H5: Run agents (Tier B: α → β → γ → σ)
  α: OVERWRITE docs/reports/B14/research-report.md
  β: OVERWRITE docs/reports/B14/tech-report.md (if needed)
  γ: OVERWRITE docs/reports/B14/feasibility-report.md
  σ: OVERWRITE data/baselines/B14.json (updated score + nodes)

Quality Gate: MODULE-TEST-PROTOCOL check
  new score ≥ 7.0? → DONE
  still < 7.0? → attempt 2 or DEFERRED
```

---

## SSE Event Stream (Frontend View)

Toàn bộ flow trên được mirror ra frontend qua SSE events theo thứ tự:

```
GET /api/workspace/PRJ-001/events

→ {"type":"pipeline.started","agents":["R-BA","R-D06","alpha","gamma","R-SA","beta"],"mode":"project"}
→ {"type":"agent.state_changed","agentId":"R-BA","from":"idle","to":"loading_context"}
→ {"type":"agent.state_changed","agentId":"R-BA","from":"loading_context","to":"working"}
→ {"type":"agent.output_chunk","agentId":"R-BA","chunk":"# Project Brief — Mon..."}
→ {"type":"agent.output_chunk","agentId":"R-BA","chunk":"## Problem Statement..."}
... (streaming chunks until complete)
→ {"type":"agent.completed","agentId":"R-BA","outputPath":"projects/PRJ-001/project-brief.md"}
→ {"type":"handoff","from":"R-BA","to":"alpha","documentPath":"project-brief.md"}
→ {"type":"agent.state_changed","agentId":"alpha","from":"idle","to":"loading_context"}
→ {"type":"agent.state_changed","agentId":"alpha","from":"loading_context","to":"working"}
... (alpha streaming)
→ {"type":"agent.completed","agentId":"alpha"}
→ {"type":"quality_gate.result","passed":true,"score":7.35}
→ {"type":"pipeline.completed","totalTime":3240000,"reportPaths":[...]}

Dashboard: nhận events → update pipeline progress + agent cards + activity log
3D Office: nhận events → animate avatars (walk to desk → type → handoff document)
```

---

## Error Path Example

Nếu γ tạo ra low quality output (score section bị thiếu):

```
H5 Quality check fails:
  WRITE _checkpoints/gamma.json → { retryCount: 1, status: "retry" }
  EMIT { type: "agent.error", agentId: "gamma", error: "Missing score section", retryCount: 1 }

Orchestrator:
  → Reload γ context (H2)
  → Rebuild prompt với specific feedback (H3):
     "Your previous output was missing the 4-dimension score table.
      REQUIRED: Tech score, Value score, Data score, Risk score with justification."
  → Re-call Claude API (attempt 2)

If attempt 2 also fails:
  → EMIT { type: "agent.error", retryCount: 2 }
  → Escalate to user (max 2 attempts reached per ERROR-HANDLING.md)
  → UI: "γ could not produce valid output. Action required: [Accept as-is] [Edit manually] [Skip]"
```

---

*SYSTEM-FLOW v1.0 — Agent Workspace*  
*Based on docs/ review + DEV-ISSUES.md recommendations*  
*Updated: 2026-04-04*
