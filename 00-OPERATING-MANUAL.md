# Master Operating Procedure — Knowledge × Engine × Business

**Mục đích:** Khi 1 idea hoặc dự án mới xuất hiện, file này chỉ rõ **dữ liệu chảy qua 3 hệ thống như thế nào**. Đây là master file — đọc đầu tiên khi triage anything mới.

**Quy tắc vàng:** *"Knowledge feeds Engine. Engine produces outputs. Business decides what to feed and what to ship. Loop closes when output updates Knowledge."*

---

> **⚠️ v1.1 amendment (2026-04-27)**: file gốc viết theo 3-layer model (Knowledge / Engine / Business) trước khi codebase refactor sang **5-layer + studio boundary**. Tham khảo:
> - 5-layer chính thức: `01-FRAMEWORK.md` (canonical)
> - Path A pipeline P0-P9 + P10: `experience/workspace/docs/pipeline/P0-INTAKE.md` … `P10-LONG-TERM.md`
> - Path B (product) chi tiết: `experience/workspace/docs/pipeline/PATH-B-PRODUCT.md`
> - Path C (content) chi tiết: `experience/workspace/docs/pipeline/PATH-C-CONTENT.md`
> - Path D (knowledge re-research) chi tiết: `experience/workspace/docs/pipeline/PATH-D-RESEARCH.md`
> - Multi-path concurrent coordination: `experience/workspace/docs/workflows/W10-cross-path-priority.md`
> - Knowledge K-review staging gate: `_shared/standards/knowledge-curation.md` + `experience/workspace/docs/workflows/W11-knowledge-review.md`
> - Studio vs client boundary: `_shared/standards/boundaries.md`
>
> File này dưới đây giữ nguyên 3-layer narrative cho trường hợp triage nhanh; khi cần thực thi → dùng pipeline doc chi tiết.

---

## 1. The 3-layer architecture

```
┌───────────────────────────────────────────────────────────────┐
│ LAYER 3 — BUSINESS (this folder: business-strategy/)          │
│                                                                │
│ Strategy (file 01-08) — what to build, who to serve            │
│ Operations (file 09-18) — how to sell, deliver, operate        │
│ → DECIDES: priority, ICP, pricing, scope, channel              │
│                                                                │
│   ↓ feeds project briefs + content topics                      │
│   ↑ receives outputs + KPIs back                               │
└───────────────────────────────────────────────────────────────┘
        ↕
┌───────────────────────────────────────────────────────────────┐
│ LAYER 2 — ENGINE (experience/ folder)                          │
│                                                                │
│ Workspace orchestrator (Next.js + Claude API)                  │
│ 13 agent skill cards (.agents/)                                │
│ Mission Control dashboard                                      │
│ Pipeline P0-P9 (per file 13)                                   │
│ Eval framework (file 11)                                       │
│ → EXECUTES: turn brief into deliverables                       │
│                                                                │
│   ↓ reads Knowledge as context                                 │
│   ↑ writes back retros + memory updates                        │
└───────────────────────────────────────────────────────────────┘
        ↕
┌───────────────────────────────────────────────────────────────┐
│ LAYER 1 — KNOWLEDGE (maestro-knowledge-graph/ folder)          │
│                                                                │
│ 15 baselines (B01-B15) × 20 industries (I01-I20)              │
│ JSON matrix + research reports L1-L3                           │
│ Industry deep-nodes                                            │
│ Memory store (per-baseline, per-industry, per-project)         │
│ → PROVIDES: SOTA research, domain context, learnings           │
│                                                                │
│   ↑ read-only by Engine                                        │
│   ↑ updated by retros + re-research mode                       │
└───────────────────────────────────────────────────────────────┘
```

> **v1.1 note**: Business pipelines (marketing M0-M5, sales S0-S5, content C0-C4, customer-success CS0-CS3, expansion E0-E3, partnership BD0-BD4, hiring H0-H3, finance F0-F2) live in `experience/workspace/docs/pipelines-business/` — sub-flows hỗ trợ 5 paths above. Pricing decisions là trigger-based standards (`_shared/standards/pricing-decisions.md`), KHÔNG pipeline.

### 1.1 Why 3 separate layers

- **Separation of concerns:** Strategy changes daily, Engine code changes weekly, Knowledge changes per-project
- **Independent evolution:** Switch LLM provider doesn't touch Knowledge; new ICP doesn't touch Engine code
- **Right tool per layer:** Markdown for Business, code for Engine, JSON+MD for Knowledge

### 1.2 Filesystem mapping (concrete)

```
~/Desktop/my_learning/
│
├── maestro-knowledge-graph/        ← LAYER 1 KNOWLEDGE
│   ├── data/baselines/B0X/
│   ├── data/industries/I0Y/
│   ├── docs/memory/
│   └── src/                        ← read-only frontend (Next.js)
│
└── experience/                     ← LAYER 2 ENGINE + LAYER 3 BUSINESS
    ├── AGENT-WORKSPACE-PIPELINE.md
    ├── PRODUCT-DEVELOPMENT-PIPELINE.md
    │
    └── workspace/
        ├── apps/orchestrator/      ← Engine code (P2 owns)
        ├── apps/dashboard/         ← Mission Control UI
        ├── packages/agents/        ← .agents/ skill cards
        ├── docs/projects/          ← per-project deliverables
        │   └── P-{YYYYMM}-{NNN}/
        ├── docs/memory/            ← Engine memory feedback
        ├── evals/                  ← golden tests
        │
        └── projects/
            └── business-strategy/  ← LAYER 3 (18 files this folder)
```

---

## 2. Decision tree — When something new arrives

```
NEW INPUT (idea, brief, request, opportunity)
    │
    ↓
[Q1: What kind?]
    │
    ├── Customer brief (B2B Sprint, Audit) ────→ PATH A: Sales-led
    │
    ├── Internal product idea (PDF, course, tool) ─→ PATH B: Product R&D
    │
    ├── Content piece (video, post, newsletter) ─→ PATH C: Content-led
    │
    ├── Knowledge update (new baseline, industry) → PATH D: Re-research
    │
    └── Operational issue (incident, hire, etc.) ─→ PATH E: Ops-led (no Engine)
```

Mỗi PATH có entry file + workflow riêng. Section §3 chi tiết.

---

## 3. PATH A — Customer brief arrives (Sales-led)

**Trigger:** Email/DM/inbound từ ICP-A/B/C/D/E. Discovery call booked.

**Owner:** P3 leads, CEO joins for ICP-E technical buyer.

### 3.1 End-to-end flow

```
[Inbound contact]
    ↓ qualify (file 12 §2 BANT+Fit)
[SQL — Discovery call 30 min] (file 12 §3)
    ↓ scope
[BRIEF-INTAKE.md] CEO/khách điền 6 block (root template → projects/{id}/BRIEF-INTAKE.md)
    ↓ HOẶC R-CoS Interview Mode: CEO nói tiếng người → R-CoS extract → draft BRIEF
    ↓ Dispatch trigger: "Dispatch P0.1 với BRIEF-INTAKE.md"
[P0 Intake] (file 13 §3, parse BRIEF → fill 00-intake.md)
    ├─ P0.1 Sanitize + parse
    ├─ P0.2 R-Match classify (baseline × industry)
    ├─ P0.2b Gap pre-scan
    ├─ P0.2c Attachment intake (skill addon · doc · repo per project-attachments.md)
    ├─ P0.3 Team assembly
    ├─ P0.4 Generate brief
    └─ P0.5 CEO confirm
    ↓ trigger Engine
[Mission Control: New Project] → assign P-{YYYYMM}-{NNN}
    ↓
[Engine loads context from Layer 1]
   ├─ Read baseline JSON: data/baselines/B0X/...
   ├─ Read industry deep-node: data/industries/I0Y/... (if exists)
   └─ If industry NOT in MAESTRO → β agent fresh research 30-60 min
                                   → cache to maestro-knowledge-graph/data/industries/I0Y/
    ↓
[P1 Discovery] → R-α + R-β + R-D{N} agents run (file 13 §3, file 07 §2)
   ├─ Output: discovery-report.md (Engine writes to docs/projects/P-{ID}/01-discovery/)
   └─ Eval: R-eval scores ≥ 7.5 (file 17 §3.1)
    ↓
[P2 Proposal] → R-γ + R-σ agents
   ├─ Output: proposal.pdf (per file 12 §5 template)
   └─ DoD: file 17 §3.2
    ↓
[Send to client + 14-day validity]
    ↓ Decision Gate G1
[Client signs SOW + 50% deposit]
    ↓
[P3-P9 if Sprint B+] (file 13 §3 each phase)
    ↓
[P9 Delivery + Retro]
   ├─ File 14 §2-§4 customer success handoff
   ├─ Engine writes retro.md to docs/projects/P-{ID}/
   ├─ Memory updates back to Layer 1 (per-baseline, per-industry insights)
   └─ Case study extracted (file 14 §8)
    ↓
[Layer 3 update]
   ├─ KPI dashboard updated (file 03)
   ├─ Pricing review if win/loss pattern (file 10 §9)
   └─ DoD updated if new failure mode (file 17 §9)
```

### 3.2 Data flow points (Path A)

| Touchpoint | From | To | Format |
|---|---|---|---|
| Brief intake | Client (email/call) → `BRIEF-INTAKE.md` (6 block) | `projects/{id}/BRIEF-INTAKE.md` → engine parse → `00-intake.md` | Markdown |
| Attachment intake | CEO declares in BRIEF block 7 | `_meta.json.attachments[]` + `_attachments/` + `.agents/` | Multi-format (PDF/MD/code/repo refs) |
| Knowledge load | `maestro-knowledge-graph/data/` | Engine context | JSON + MD |
| Agent invocation | Engine orchestrator | Claude API | Streaming |
| Eval | Agent output | R-eval | Score 1-10 |
| Deliverable write | Engine | `docs/projects/P-{ID}/` | MD + PDF |
| Customer comms | P3 | Client Discord/Email | Plain text |
| Retro learnings | Engine | `maestro-knowledge-graph/docs/memory/` | Markdown |
| KPI update | Engine + P3 | Layer 3 dashboard | CSV/Notion |

### 3.3 Phase 1 simplified (M1-M3)

Chỉ chạy Sprint A (P0-P2). Skip P3+ trừ LLMOps Audit pilot.

```
Day 0: Intake (1 day, P3)
Day 1-3: Discovery (Engine, β + R-D{N}, 30-60 phút compute, $0.30-1.00 cost)
Day 4-5: Proposal (Engine, γ + σ, 30 phút compute, $0.20-0.50)
Day 6: Polish + send (P3 + CEO sign-off)
Day 7-14: Wait for sign + answer questions
Day 14+: If signed → Sprint B+ flow OR P9 deliver Sprint A package
```

### 3.4 Engine generalization for new industry

When client industry không có L3 trong MAESTRO (e.g., Agriculture):

```
β agent receives I-Agriculture context = empty/skeleton
    ↓
β triggers fresh research mode:
   - Web search: "AI in Vietnam {industry} 2026"
   - SOTA papers, market reports, regulatory landscape
   - 30-60 min compute, $0.50-1.50 extra cost
    ↓
β writes to maestro-knowledge-graph/data/industries/I-Agriculture/
   - L1 skeleton (overview)
   - Sub-node specific to client's pain (e.g., yield-forecast for coffee farm)
    ↓
Continue normal P1-P2 flow
    ↓
After project P9 retro:
   - Promote sub-node to L2 if quality good
   - I-Agriculture now exists for next project
```

→ **Sales messaging:** "Bạn làm ngành nông nghiệp à? Pipeline 2 tuần ra proposal, pricing giữ nguyên. Sau project Agriculture đầu tiên, ngành này cũng có deep-node trong MAESTRO."

---

## 4. PATH B — Internal product idea (Product R&D)

**Trigger:** Founder thấy opportunity (TikTok trending, customer pain, competitor gap).

**Owner:** Founder propose, CEO approve, anyone build.

### 4.1 Triage flow

```
[Idea] → "Build product X cho audience Y"
    ↓
[Q1: Đã có trong file 04 capability catalog chưa?]
    ├─ Có → kiểm tra cấp độ + feasibility rating + Phase mapping
    │      → nếu Phase 1/2 → proceed; nếu Phase 3+ → defer
    │
    └─ Chưa → propose adding to file 04
              → CEO assess feasibility ⭐/⭐⭐/⭐⭐⭐
              → strategic fit 🟢/🟡/🔴
              → if ⭐⭐+ và 🟢 → proceed
              → else → log in parking-lot
    ↓
[Q2: Map vào ICP nào? (file 02)]
    ├─ Identify ICP A/B/C/D/E
    ├─ Confirm pain match
    └─ Confirm pricing tier (file 10)
    ↓
[Q3: MAESTRO knowledge cần gì?]
    ├─ Baselines: B0X, B0Y
    ├─ Industries: I0Z
    ├─ Already L3? → reuse content
    └─ Not L3? → trigger Re-research mode (Engine Mode A)
    ↓
[Q4: Engine có làm được không?]
    ├─ Có (existing pipeline) → start build
    └─ Không (new capability) → spec + ship Engine update FIRST
    ↓
[BUILD]
    ↓ ship → distribute (file 05 channel) → measure (file 03 KPI)
    ↓
[Update file 04 status: shipped]
[Update MAESTRO if learning]
```

### 4.2 Example: AI Roadmap PDF (file 04 §3 #1.1)

```
Idea: "Ship PDF — 15 baselines × MMO use case"
    ↓
File 04 lookup: ✅ Cấp 1, ⭐⭐⭐, 🟢, Phase 1 T1
File 02 lookup: ICP-A MMO Builder VN
File 10 lookup: $19 launch / $49 list, 7-day refund
    ↓
Knowledge needed:
   - B01-B15 baseline summaries (Layer 1)
   - I-MMO use cases (Layer 1, NEW node — needs research)
    ↓
Engine task: Generate L1 content for B01-B15 mapped to MMO use cases
   → R-α agents iterate through 15 baselines
   → R-σ consolidates per-baseline into 1 chapter
   → Output: 15 chapters + intro + outro
   → Cost: ~$3-5 total Claude API
    ↓
CEO: design + edit + Canva polish (4-6h)
    ↓
P3: Gumroad listing + landing copy (2h)
    ↓
Distribute:
   - CEO Substack issue announcing
   - X thread
   - LinkedIn post (P3)
   - Freelance MMO TikTok video showcasing (T3+)
    ↓
Measure:
   - Sales (file 03 KPI)
   - Email captured
   - Refund rate
    ↓
Memory update:
   - Per-baseline learning if any chapter struggle
   - I-MMO node now has 15 first-pass use cases
```

---

## 5. PATH C — Content piece (Content-led)

**Trigger:** Content calendar (file 16 §5) hoặc opportunity (trending topic).

**Owner:** Voice owner per file 16 §2 (CEO/P3/freelance).

### 5.1 Flow

```
[Topic decided] (from file 16 monthly theme + opportunity)
    ↓
[Q1: Voice match?]
   ├─ Technical → CEO (Voice A)
   ├─ Business B2B → P3 (Voice B)
   └─ MMO Energetic → freelance (Voice C)
    ↓
[Q2: Format?]
   - Long YouTube | Substack | LinkedIn long | TikTok hook | Audit report
    ↓
[Q3: Knowledge source?]
   - MAESTRO baseline (Layer 1)
   - Project case study (Layer 2 retros, anonymized)
   - Original research (CEO conducts)
    ↓
[Engine assist (optional)]
   - R-content agent draft (cost <$0.10)
   - Owner edit + polish (file 16 §4 templates)
    ↓
[DoD check] (file 17 §4 per content type)
    ↓
[Publish + repurpose] (file 16 §6)
   - 1 YT → 12-15 content units across 6 channel
    ↓
[Measure] (file 03 channel KPI)
    ↓
[Memory: high-performing hooks/topics save for future]
```

### 5.2 Example: CEO YouTube "Anthropic prompt cache cut $5K/mo"

```
Topic: M2 theme "Cost optim" + real internal data ($5K saved on prompt cache)
    ↓
Voice: A (CEO technical)
Format: YouTube long-form 12-15 min + Substack expanded version + X thread
    ↓
Knowledge:
   - Internal cost data (anonymized)
   - Anthropic prompt cache docs
   - Comparison vs no-cache baseline
    ↓
Engine assist:
   - R-content drafts script outline
   - CEO records (4h prep + record + edit)
    ↓
DoD: file 17 §4.3
   - Hook 0-60s strong
   - Bilingual subs reviewed
   - Pinned comment with OSS link + Substack link
   - Voice A consistency check
    ↓
Publish Friday 10am VN time
Repurpose:
   - 4 TikTok shorts (freelance edit)
   - 5 Threads (CEO write)
   - 1 LinkedIn long post (P3 adapt to business voice)
   - 1 Substack issue (CEO expand)
   - 1 X thread launch (CEO)
    ↓
Measure: views, watch time, comments, click-through to OSS/Substack
    ↓
Memory: if viral, save hook formula to "high-performer-hooks.md"
```

---

## 6. PATH D — Knowledge update (Re-research mode)

**Trigger:**
- Phase priority requires baseline L3 (e.g., M2 needs B05 L3)
- New industry requested by client
- Old baseline outdated (Claude version change, new SOTA)

**Owner:** CEO (LLMOps + ML validation).

### 6.1 Flow

```
[Trigger]
    ↓
[Q1: Type?]
   ├─ Re-research existing baseline (e.g., B01 v2 with 2026 SOTA)
   ├─ New baseline L3 (e.g., B05 first time)
   └─ Industry deep-node (e.g., I05 Agriculture)
    ↓
[Engine Mode A — Re-research]
   - α agent: SOTA research current
   - γ agent: feasibility + gap analysis
   - σ agent: synthesize + Vietnamese translation
   - Cost: $0.30-1.50 per node
   - Time: 30-60 min compute
    ↓
[CEO validation] (1-2h human review)
   - Sanity-check ML model recommendations
   - Verify citations
   - Eval pass ≥ 7.5
    ↓
[Write to maestro-knowledge-graph/]
   - data/baselines/B0X/research-report.md (replace if v2)
   - data/baselines/B0X/L3.json (machine-readable summary)
   - docs/memory/B0X-learnings.md (cumulative)
    ↓
[Available for next project]
```

### 6.2 Cadence

- Phase 1: 1 baseline L3 per month (M1=B01 already, M2=B05, M3=B07, etc.)
- Phase 2+: re-research existing baseline if older 6 months OR client triggers
- Post-incident: re-research if hallucination/error traced to baseline

---

## 7. PATH E — Operational issue (Ops-led, no Engine)

**Trigger:** Hire, vendor, billing, legal, decision, incident.

**Owner:** P3 primary; CEO if strategic.

**No Engine involvement.** Pure Layer 3 ops per file 15.

```
Issue → File 15 lookup → Resolve OR escalate → Document in decisions.md
```

---

## 8. Integration touchpoints — Where layers connect

### 8.1 Knowledge → Engine (read)

**Files Engine reads:**
- `maestro-knowledge-graph/data/baselines/B0X/L3.json` — structured summary
- `maestro-knowledge-graph/data/baselines/B0X/research-report.md` — full report
- `maestro-knowledge-graph/data/industries/I0Y/*.md` — industry context
- `maestro-knowledge-graph/docs/memory/B0X-learnings.md` — cumulative learnings

**Loaded by:** R-α (full baseline), R-β (tech sections only), R-D{N} (industry only), R-σ (consolidates).

**Smart context loading:** Each agent only loads what it needs (file 07 §2 + AGENT-WORKSPACE-PIPELINE.md). Don't load 100K tokens for an agent needing 5K.

### 8.2 Engine → Knowledge (write back)

**When Engine writes:**
- After P9 project retro: append to `maestro-knowledge-graph/docs/memory/{B0X|I0Y}-learnings.md`
- Re-research mode: replace `research-report.md` + `L3.json`
- New industry research: create `data/industries/I-{NEW}/...`

**Quality gate:** CEO reviews before commit (file 07 §7.3 memory hygiene).

### 8.3 Engine → Business (output)

**Engine writes outputs to:**
- `experience/workspace/docs/projects/P-{ID}/` — per-project deliverables
- `experience/workspace/evals/reports/` — eval results
- `experience/workspace/docs/cost/` — cost trend

**Business consumes:**
- KPI dashboard pulls from `experience/workspace/docs/cost/` + project metadata
- Sales playbook (file 12) win/loss tracks per project
- Customer Success (file 14) reads project status from project folder

### 8.4 Business → Engine (input)

**Business decides + feeds:**
- Project briefs (file 13 P0 intake) → Engine starts
- Content topic priorities (file 16 calendar) → R-content agent
- Pricing changes (file 10) → invoice templates + Stripe
- DoD updates (file 17) → eval criteria

### 8.5 Cross-layer memory

**Memory lives in 3 places:**
1. **Conversation memory** (Claude session) — ephemeral
2. **Project memory** (`docs/memory/`) — per project, persistent
3. **MAESTRO memory** (`maestro-knowledge-graph/docs/memory/`) — global, persistent

**Promotion path:**
- Project insight (e.g., "Prophet bad for sparse retail") → save to project retro
- Pattern across 3+ projects → promote to MAESTRO baseline memory
- Repeat domain insight → promote to MAESTRO industry memory
- LLMOps insight → save to `business-strategy/.claude/memory/` (this folder, file-level)

---

## 9. Owner per touchpoint

| Touchpoint | Owner | Backup | Note |
|---|---|---|---|
| Project intake → Engine trigger | P3 | CEO | File 13 §3 P0 |
| Engine code (orchestrator) | P2 | CEO | Next.js codebase |
| Agent skill cards | CEO | P3 (domain few-shot supply) | `.agents/` |
| Eval framework | CEO | (none — moat) | File 11 OSS + internal |
| MAESTRO baselines | CEO + R-α/β/γ | P3 (domain validation) | Layer 1 |
| MAESTRO industries | R-D{N} + R-β + P3 (Logistic/E-com SME) | CEO | Layer 1 |
| Project deliverables | Engine + agents | CEO review | Layer 2 outputs |
| Customer comms | P3 | CEO (technical) | File 14 |
| Memory updates | CEO (validate) | P3 (input) | Cross-layer |
| KPI tracking | P3 | All weekly review | File 03 |
| Strategy updates | CEO (final) + all input | — | File 01-08 |
| Ops (hire/finance) | P3 | CEO | File 15 |

---

## 10. Concrete example — End-to-end one project

**Scenario:** ICP-B inbound — 3PL VN logistics company asks about AI demand forecast.

### Day 0 — Inbound

- LinkedIn DM to P3: "Saw your audit report Top 10 AI use case 3PL VN. Can we chat?"
- P3 books Calendly 30-min discovery (file 12 §3)

### Day 1 — Discovery call

- 30 min, P3 leads, asks 5 pain questions
- Pain identified: demand forecast accuracy 68% (target 85%), $50K/year overstock cost
- Client: 200-employee 3PL, COO is decision maker

**Output:** P3 fills `docs/projects/P-202604-001/00-intake.md`
- BANT: 3+3+3+2 = 11/12 ✅
- Fit: ICP-B ✅, B01 baseline ✅, case study TBD ⚠️
- Recommend: Sprint A $1,500 Founding Customer

### Day 2 — Engine triggered

P3 opens Mission Control UI:
```
New Project P-202604-001
Tier: Sprint A
Industry: I06 Logistics
Baselines: B01 Forecasting (primary), B07 Anomaly (secondary)
Trigger: Run P1 Discovery
```

Engine orchestrator:
1. Loads `maestro-knowledge-graph/data/baselines/B01/research-report.md` (Layer 1)
2. Loads `maestro-knowledge-graph/data/industries/I06/...` (Layer 1)
3. Spawns R-α agent: "Research SOTA demand forecasting for retail+3PL VN, sparse data"
4. Spawns R-β agent: "Tech stack survey for B01 in VN context"
5. Spawns R-D06 agent: "Domain context Logistics VN, 3PL specifics"
6. Runs in parallel ~30 minutes, $0.50 cost
7. Output saved to `experience/workspace/docs/projects/P-202604-001/01-discovery/`
8. R-eval scores: 7.8 ✅

### Day 3 — CEO validation (LLMOps + ML)

CEO reviews `discovery-report.md`:
- ✅ Cited NBEATS, NHITS, TFT, Prophet trade-offs (file 08 §2.4 ML baseline ownership)
- ⚠️ Caught: agent recommended Prophet first; CEO knows sparse retail → swap to NBEATS
- Updates report + memory: `docs/memory/B01-learnings.md` += "VN sparse retail 3PL prefer NBEATS over Prophet"
- Eval re-run: 8.5 ✅

### Day 4 — Engine generates Proposal (P2)

R-γ + R-σ:
- Feasibility scoring: 78/100 (GO recommended)
- Generates `02-proposal/proposal.pdf` per file 12 §5 template
- P3 polish + brand
- CEO final tech sign-off

### Day 5 — Send to client

- P3 sends proposal via email (DocuSign template)
- 14-day validity
- Investment: $1,500 (Founding Customer 50% off)
- Followup Day 7, Day 14

### Day 12 — Client signs SOW + 50% deposit

- Stripe deposit received: $750
- P3 books Sprint A kickoff call
- Communication: shared Discord channel + Notion project page
- Sprint A delivery in 2 weeks (Day 26)

### Day 13-25 — Sprint A delivery

Wait — Sprint A = P0-P2 + delivery. P0-P2 already done. Day 13-25 is just **client review + Q&A + final polish**.

- Day 14: Final review meeting với COO + tech lead
- Day 18: COO requests 1 modification (different forecast horizon — quarterly vs monthly)
- Day 20: Engine re-runs P1+P2 with revised parameters (cost $0.30, 1 hour)
- Day 22: Updated proposal sent
- Day 25: COO signs Acceptance form

### Day 26 — Final invoice + handoff

- Final 50% invoice $750 sent
- P9 delivery package: Notion view + PDF + recordings of 2 review calls
- 30-day post-delivery support active

### Day 30+ — Customer Success

- Day 14 (post-delivery): P3 check-in call. COO happy, asks about Sprint B (architecture)
- Day 30: P3 sends "30-day review" email — 3 paths (done / Sprint B / retainer)
- Day 35: COO chooses Sprint B → new SOW $3,000

### Day 30 — Internal retro

CEO + P3 + P2 retro:
- ✅ Engine ran $1.10 total cost (target $1.50, beat by 27%)
- ✅ R-α NBEATS catch saved face — promote to baseline memory
- ⚠️ Modification request handled OK but ate 1 day buffer

**Memory updates:**
- `maestro-knowledge-graph/docs/memory/B01-learnings.md` += sparse retail VN insight
- `maestro-knowledge-graph/docs/memory/I06-learnings.md` += 3PL forecast horizon preferences
- `business-strategy/.claude/memory/` += "ICP-B 3PL often want Sprint B after A"

**File updates:**
- File 03 KPI: B2B revenue +$1,500 cumulative
- File 12 sales playbook: win/loss retro added
- File 17 DoD: no change (all passed)

### Day 56 (4 weeks later) — Case study

- P3 interview COO 30 min
- Agent R-σ drafts case study (anonymized)
- COO approves
- Published on website + LinkedIn + shared with next 5 ICP-B outreach
- → next project P-202605-002 closes in 2 weeks (referral effect)

---

## 11. When workflow breaks — Recovery plays

| Scenario | Recovery |
|---|---|
| Engine fails to run agent (API timeout) | Retry with smaller context; if 3 retries → manual fallback (CEO drafts directly) |
| MAESTRO baseline outdated | Trigger Re-research mode (PATH D); pause project max 1 day |
| Industry node missing | β agent fresh research (file 07 generalization); +30-60 min, +$0.50-1.50 cost |
| Customer brief ambiguous | P3 schedules 30-min clarification call before P0 close |
| Eval score < 7.5 | R-eval feedback → agent retry; if 3 retries fail → CEO manual edit |
| Cost > 2x target on a project | Pause, P2 reviews orchestrator; check for prompt bloat or model misroute |
| Deliverable rejected by client | 1 round revision free (per file 17 §3.12); root cause to retro |
| Two projects conflict for same agent slot | Queue per priority; LLMOps audit + B2B Sprint can run parallel (different agents) |
| Knowledge update conflicts with active project | Active project locks baseline version at intake; new version applies next project |

---

## 12. Capacity planning — How many concurrent projects?

### Phase 1 (M1-M3) — 1-2 active project max

- Engine maturity = MVP, manual fallback common
- CEO LLMOps validation bottleneck (2-4h/project)
- P3 sales + delivery PM bottleneck

### Phase 2 (M4-M6) — 3-4 active project

- Engine v1 stable, 80% auto rate
- CEO validation 1-2h/project
- P3 manages 4 customer relationships

### Phase 3 (M6-M12) — 6-10 active project

- Engine v1.5 multi-tenant
- LLMOps Audit recurring batch
- Hire 1 BD/CS specialist when > 5 active customer

**Rule:** Don't accept new project if current capacity > 80%. Better to lose a deal than fail delivery.

---

## 13. Tooling per touchpoint

| Touchpoint | Primary tool | File reference |
|---|---|---|
| Lead intake | Notion form | file 12 §9 CRM |
| Discovery call | Calendly + Google Meet/Zoom | file 12 §3 |
| Project folder | GitHub monorepo `docs/projects/` | file 13 §3 |
| Engine UI | Mission Control (Next.js localhost) | file 09 W1-W3 |
| Agent prompts | `.agents/` Markdown Git-tracked | file 07 §5 |
| Eval | YAML golden tests + R-eval LLM-judge | file 11, file 17 |
| Cost tracking | Helicone + custom dashboard | file 07 §6.3 |
| Memory | Markdown in `docs/memory/` Git-tracked | file 07 §7 |
| Customer comms | Discord (async) + email (formal) + Loom (recorded) | file 14 §3 |
| Invoicing | Stripe + Wise + Notion VND template | file 15 §2.2 |
| KPI tracking | Notion CSV + monthly dashboard | file 03 |

---

## 14. Quick reference — "When X, open file Y"

| When | Open file |
|---|---|
| New customer brief arrives | 19 §3 (this file) → 12 §3 → 13 §3 |
| New product idea | 19 §4 → 04 → 02 → 10 |
| New content piece | 19 §5 → 16 → 05 |
| Update knowledge / re-research | 19 §6 → 07 §7 |
| Operational issue | 19 §7 → 15 |
| Pricing question | 10 |
| DoD question per deliverable | 17 |
| Sales objection | 12 §6 |
| Customer churning signal | 14 §7 |
| Hire decision | 15 §3 |
| Strategy pivot consideration | 06 §7.4 (rules) → 01-03 |
| Brand voice question | 16 §2 |
| New ICP coverage | 02 + 04 (capability fit) |
| OSS repo work | 11 |
| Phase 1 daily execution | 09 |

---

## 15. Tóm tắt 1 trang

```
3 LAYERS:
  L1 KNOWLEDGE  — maestro-knowledge-graph/  (15 baselines × 20 industries)
  L2 ENGINE     — experience/workspace/      (orchestrator + agents + Mission Control)
  L3 BUSINESS   — business-strategy/ (this)  (18 files: strategy + ops)

5 PATHS WHEN NEW INPUT:
  A — Customer brief    → File 12 → 13 → Engine runs P0-P9 → File 14 handoff
  B — Internal product  → File 04 → 02 → 10 → Engine assist build → File 05 distribute
  C — Content piece     → File 16 voice/format → 05 channel → Engine draft + owner edit
  D — Knowledge update  → Engine Mode A re-research → CEO validate → Layer 1 commit
  E — Ops issue         → File 15 lookup → resolve → log decisions.md (no Engine)

INTEGRATION POINTS:
  L1→L2 read: agent context loading (smart, partial)
  L2→L1 write: retro learnings + new industry research
  L2→L3: project deliverables + cost trend + KPI
  L3→L2: project briefs + content topics + DoD criteria
  Cross: memory promotion (project → baseline → industry → strategic)

CONCRETE EXAMPLE: 3PL ICP-B Sprint A
  Day 0 inbound → Day 1 discovery → Day 2-4 Engine P1+P2 ($1.10 cost)
  Day 5 send proposal → Day 12 sign + 50% → Day 26 delivery + 50%
  Day 30 retro + memory update → Day 35 Sprint B upsell → Day 56 case study published

CAPACITY:
  Phase 1: 1-2 concurrent | Phase 2: 3-4 | Phase 3: 6-10

QUICK REFERENCE FILE 19 §14:
  Customer brief? → 19§3 → 12§3 → 13§3
  Product idea?  → 19§4 → 04 → 02 → 10
  Content?       → 19§5 → 16 → 05
  Knowledge?     → 19§6
  Ops?           → 19§7 → 15

OWNER MAP:
  CEO    LLMOps + ML + Knowledge validate + Engine moat
  P2     Engine code + tooling + integration
  P3     Sales + CS + Ops + project PM client-side
```
