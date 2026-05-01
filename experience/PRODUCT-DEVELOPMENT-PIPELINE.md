# PRODUCT DEVELOPMENT PIPELINE — Agent Workspace

> ⚠️ **LEGACY v0.x — superseded by v1.1 (2026-04-27)**.  
> Monolithic blueprint replaced by modular pipeline docs:
> - **Path A** (customer brief): [`@./workspace/docs/pipeline/P0-INTAKE.md`](workspace/docs/pipeline/P0-INTAKE.md) … [`P10-LONG-TERM.md`](workspace/docs/pipeline/P10-LONG-TERM.md)
> - **Path B / C / D**: [`PATH-B-PRODUCT.md`](workspace/docs/pipeline/PATH-B-PRODUCT.md), [`PATH-C-CONTENT.md`](workspace/docs/pipeline/PATH-C-CONTENT.md), [`PATH-D-RESEARCH.md`](workspace/docs/pipeline/PATH-D-RESEARCH.md)
> - **Strategic spec**: [`@../business-strategy/13-product-delivery-process.md`](../business-strategy/13-product-delivery-process.md)
>
> File này giữ làm reference history. **KHÔNG dùng làm source-of-truth**. Conflict với v1.1 → v1.1 thắng (R-MAS-12).

---

**Version:** 1.0 (legacy)  
**Created:** 2026-04-04  
**Superseded:** 2026-04-27 by modular v1.1  
**Status:** Reference only — do not execute from this file  
**Scope:** Quy trình chuẩn để AI Agent team phát triển sản phẩm thực tế  
**Prerequisite:** MAESTRO Knowledge Graph (Baselines B01–B15 + Industries I01–I20)

---

## 1. VISION

### 1.1 What This Pipeline Does

Nhận **bài toán kinh doanh thực tế** từ client → dispatch đội AI agents → agents **tái sử dụng kiến thức đã research** từ MAESTRO Knowledge Graph → produce **toàn bộ deliverables** cần thiết để build product: từ research, proposal, architecture, API design, database schema, algorithm spec, frontend design, cho đến deployment plan.

```
CLIENT BRIEF
    │
    ▼
┌─────────────────────────────────────────┐
│         AGENT WORKSPACE ENGINE          │
│                                         │
│  Knowledge Context     Agent Team       │
│  ┌──────────────┐    ┌──────────────┐   │
│  │ B01.json     │    │ α Research   │   │
│  │ B06.json     │    │ β Engineer   │   │
│  │ I06.json     │    │ γ Evaluate   │   │
│  │ reports/B01/ │    │ R-SA Archi   │   │
│  │ reports/B06/ │    │ R-BE Backend │   │
│  │ reports/I06/ │    │ R-FE Front   │   │
│  └──────────────┘    │ R-MLE ML     │   │
│        │             │ R-DBE DB     │   │
│        └──────┬──────│ R-DO DevOps  │   │
│               │      │ R-QA Test    │   │
│               ▼      │ R-PM Plan    │   │
│        Agent reads   │ R-Dxx Domain │   │
│        own reports   │ σ Scribe     │   │
│        + adapts      └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
    │
    ▼
DELIVERY PACKAGE
├── discovery-report.md
├── proposal.md
├── architecture.md
├── api-design.md
├── database-design.md
├── algorithm-spec.md
├── ui-design.md
├── project-plan.md
├── dev-guide.md
├── qa-plan.md
├── deployment-plan.md
└── executive-summary.md
```

### 1.2 Core Principle — Knowledge Reuse, Not Re-Research

```
MAESTRO pipeline (research):
  Agent receives TOPIC → searches web → produces NEW knowledge
  Cost: high (web search, long generation)
  Time: 15-20 min per agent

Product pipeline (adapt):
  Agent receives OWN PREVIOUS REPORT + CLIENT BRIEF
  → reads what they already know → adapts for this specific problem
  Cost: lower (no web search needed for most agents)
  Time: 5-10 min per agent

KEY DIFFERENCE:
  Prompt for research:  "Research SOTA forecasting methods"
  Prompt for product:   "Given your research on forecasting [attached],
                         design a solution for THIS client problem [brief]"
```

### 1.3 Scope Levels — Not Every Project Needs All 9 Phases

```
SCOPE A — Feasibility Only (P0 → P2):
  Client asks: "Is this AI project viable?"
  Output: discovery-report.md + proposal.md (GO/NO-GO)
  Agents: 4-5 (α, γ, R-BA, R-Dxx, σ)
  Time: ~30 min
  Cost: ~$0.30-0.50

SCOPE B — Architecture Proposal (P0 → P3):
  Client asks: "How would you build this?"
  Output: + architecture.md
  Agents: 6-8
  Time: ~1 hour
  Cost: ~$0.80-1.20

SCOPE C — Full Design (P0 → P5):
  Client asks: "Give me everything to start building"
  Output: + all design docs + project plan
  Agents: 12-15
  Time: ~2-3 hours
  Cost: ~$2.00-4.00

SCOPE D — Complete Blueprint (P0 → P9):
  Client asks: "Full product blueprint, ready to hand to dev team"
  Output: Complete delivery package
  Agents: 15-20
  Time: ~4-6 hours
  Cost: ~$4.00-8.00
```

---

## 2. PIPELINE OVERVIEW

### 2.1 Nine Phases

```
DISCOVERY (understand the problem)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P0  Intake & Scoping         → project-brief.md
P1  Discovery & Research      → discovery-report.md
P2  Proposal & Business Case  → proposal.md
    ▼ DECISION GATE: GO / NO-GO

DESIGN (solve the problem on paper)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P3  Solution Architecture     → architecture.md
    ▼ DECISION GATE: Architecture Review
P4  Detailed Design (parallel)
    ├── P4a API Design        → api-design.md
    ├── P4b Database Design   → database-design.md
    ├── P4c Algorithm Spec    → algorithm-spec.md
    ├── P4d Frontend Design   → ui-design.md
    └── P4e Integration Review→ integration-review.md
P5  Implementation Planning   → project-plan.md

BUILD GUIDES (tell humans how to build it)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P6  Development Guides        → dev-guide.md + code templates
P7  QA & Testing Plan         → qa-plan.md
P8  Deployment & Operations   → deployment-plan.md

DELIVERY (wrap it up)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P9  Delivery Package          → executive-summary.md + full package
```

### 2.2 Execution Flow

```
P0 ──▶ P1 ──▶ P2 ──▶ [GATE] ──▶ P3 ──▶ [GATE] ──▶ P4 ──▶ P5
  sequential    sequential   GO/NO-GO   sequential  review    ↓
                                                          parallel
                                                          branches
                                                              │
P9 ◀── P8 ◀── P7 ◀── P6 ◀───────────────────────────────────┘
  σ      R-DO   R-QA   β+engineers     sequential again

PARALLEL PHASES:
  P4a, P4b, P4c, P4d → all run simultaneously
  P6 agents (R-BE, R-FE, R-MLE) → write guides simultaneously
  P7 + P8 → CAN run in parallel (no dependency between QA and DevOps)

SEQUENTIAL DEPENDENCIES:
  P1 depends on P0 (need brief before research)
  P2 depends on P1 (need research before evaluation)
  P3 depends on P2 (need GO verdict before architecture)
  P4 depends on P3 (need architecture before detailed design)
  P5 depends on P4 (need designs before planning)
  P6 depends on P4 + P5 (need designs + plan before dev guides)
  P9 depends on ALL previous (consolidation reads everything)
```

---

## 3. KNOWLEDGE CONTEXT MODEL

### 3.1 What Each Agent Receives

Mỗi agent khi được dispatch nhận 3 loại context:

```
CONTEXT TYPE 1 — KNOWLEDGE BASE (from MAESTRO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Source: data/baselines/{BXX}.json + docs/reports/{BXX}/
  What:   Agent's OWN previous report for relevant Baseline(s)
  
  Example for α in B01×I06 project:
    • docs/reports/B01/research-report.md (α's own research on Forecasting)
    • docs/reports/B06/research-report.md (α's own research on Optimization)
    • data/baselines/B01.json (concepts, algorithms, SOTA — summary)
    • data/industries/I06.json (Logistics industry context)

  Example for R-BE:
    • docs/reports/B01/R-BE-notes.md (R-BE's own notes on Forecasting backend)
    • data/baselines/B01.json → techStack + pipeline sections only

  RULE: Each agent reads ONLY their own reports + relevant JSON sections.
        Never dump all reports into one agent's context.

CONTEXT TYPE 2 — PROJECT BRIEF (from P0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Source: projects/{PROJECT_ID}/project-brief.md
  What:   Client problem, constraints, data, budget, timeline, team

CONTEXT TYPE 3 — PREVIOUS PHASE OUTPUT (from pipeline)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Source: projects/{PROJECT_ID}/{previous-phase-output}.md
  What:   Output from the agent(s) that ran before this one

  Example for β in P3:
    • project-brief.md (P0)
    • discovery-report.md (P1 — α's output)
    • proposal.md (P2 — γ's output, contains GO verdict)
```

### 3.2 Context Loading Matrix

```
PHASE   AGENT    KNOWLEDGE BASE              PROJECT CONTEXT          PREVIOUS OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

P0      R-BA     B+I JSONs (summary only)    Client raw input         —
P0      System   All B+I JSONs (matching)    Client raw input         —

P1      α        α's reports for matched B   project-brief.md         —
P1      R-Dxx    I JSON (industry context)   project-brief.md         —

P2      γ        γ's reports for matched B   project-brief.md         discovery-report.md
P2      R-BA     —                           project-brief.md         discovery-report.md

GATE    γ        —                           —                        proposal.md (own)

P3      R-SA     β's reports for matched B   project-brief.md         discovery + proposal
P3      β        β's reports for matched B   project-brief.md         discovery + proposal
P3      R-SE     —                           project-brief.md         architecture (draft)

GATE    γ        —                           project-brief.md         architecture.md

P4a     R-BE     R-BE notes for matched B    project-brief.md         architecture.md
P4b     R-DBE    R-DBE notes (if exist)      project-brief.md         architecture.md
P4c     R-MLE    R-MLE notes for matched B   project-brief.md         architecture + discovery
P4d     R-FE     R-FE notes for matched B    project-brief.md         architecture.md
P4e     R-SA     —                           project-brief.md         ALL P4 outputs

P5      R-PM     —                           project-brief.md         ALL P3 + P4 outputs

P6      β        β's reports for matched B   project-brief.md         architecture + designs
P6      R-BE     R-BE notes for matched B    —                        api-design.md
P6      R-FE     R-FE notes for matched B    —                        ui-design.md
P6      R-MLE    R-MLE notes for matched B   —                        algorithm-spec.md

P7      R-QA     —                           project-brief.md         ALL designs + dev-guide
P7      R-SE     —                           project-brief.md         architecture + api-design

P8      R-DO     R-DO notes for matched B    project-brief.md         architecture + project-plan
P8      R-CE     —                           project-brief.md         architecture.md

P9      σ        —                           project-brief.md         ALL outputs from ALL phases
P9      R-TC     —                           project-brief.md         ALL outputs (for user docs)
```

### 3.3 Knowledge Reuse Rules

```
RULE 1: ADAPT, DON'T REPEAT
  Agent MUST NOT copy content from Baseline reports into project output.
  Agent reads Baseline knowledge as background → writes NEW content
  specific to THIS project.

  WRONG: "According to our B01 research, Prophet is a good tool..."
  RIGHT: "For this logistics demand forecasting problem, we recommend
          Prophet because [specific reasons tied to client constraints]"

RULE 2: CITE BASELINE AS FOUNDATION
  When agent's recommendation draws from Baseline knowledge,
  note the foundation briefly:
  "Based on established forecasting approaches (see B01 knowledge base),
   adapted for [client's specific data characteristics]..."

RULE 3: CLIENT CONSTRAINTS OVERRIDE BASELINE DEFAULTS
  Baseline may recommend PyTorch. But if client team only knows TensorFlow
  and budget doesn't allow retraining → agent must adapt.
  Always prioritize: client constraints > baseline defaults.

RULE 4: WEB SEARCH ONLY WHEN BASELINE IS INSUFFICIENT
  If Baseline knowledge covers the topic → no web search needed.
  If client problem involves something NOT in any Baseline → α can web search.
  If market data needed for proposal → γ can web search.
  All other agents: no web search, use existing knowledge only.
```

---

## 4. PHASE DETAILS

### 4.0 P0 — Intake & Scoping

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 0: INTAKE & SCOPING                              │
│  Goal: Understand problem → match knowledge → form team  │
│  Duration: ~5 min (mostly automated)                     │
│  Human involvement: HIGH (user confirms/modifies)        │
└─────────────────────────────────────────────────────────┘

STEP 0.1 — Receive Client Brief
  Input:   Free-text description of the problem
           OR structured form (problem, data, budget, timeline, team)
  Agent:   System (automated parsing)
  Output:  Structured brief object

STEP 0.2 — Knowledge Matching (automated)
  Process:
    1. Parse brief → extract key terms
    2. Similarity search against B01-B15 descriptions
       → rank Baselines by relevance (top 1-3)
    3. Classify industry → match to I01-I20
    4. Check if matrix node exists (B×I)
       → if yes, load additional context
    5. Determine project complexity:
       Single baseline → simple
       Multiple baselines → composite
       Novel combination → complex (flag for human review)
  Output:  Matched Baselines + Industry + complexity rating

STEP 0.3 — Team Assembly (automated + human confirm)
  Process:
    1. Load agent-team-config.md → Baseline→Role mapping
    2. Select required agents based on matched Baselines
    3. Add industry domain expert (R-Dxx)
    4. Add standard roles: R-PM, R-SA, R-QA, σ
    5. Run 7-Stage Pipeline Coverage Check
       → verify every stage has ≥1 agent
    6. Present team roster to user for confirmation
  Output:  Confirmed team roster

STEP 0.4 — Generate Project Brief
  Agent:   R-BA (Business Analyst)
  Context: Structured brief + matched B/I + team roster
  Process:
    1. Formalize problem statement
    2. List explicit constraints (budget, timeline, team, data)
    3. Define success criteria (measurable KPIs)
    4. Identify assumptions + open questions
    5. Define scope boundaries (what's IN, what's OUT)
  Output:  projects/{PROJECT_ID}/project-brief.md

STEP 0.5 — User Confirmation
  User reviews: project-brief.md + team roster + matched knowledge
  User can: modify scope, add constraints, change team, approve
  Status:  APPROVED → start P1
           MODIFIED → regenerate brief → re-confirm
```

**Project Brief Template:**

```markdown
# Project Brief — {PROJECT_NAME}

## Problem Statement
[1-2 paragraphs: what client needs, why it matters]

## Client Context
- **Company:** [name, size, industry]
- **Current state:** [how they handle this today]
- **Pain points:** [specific problems]

## Constraints
- **Budget:** [amount or range]
- **Timeline:** [target delivery date]
- **Team:** [available developers, their skills]
- **Data:** [what data exists, format, volume, quality]
- **Tech:** [existing tech stack, infrastructure, preferences]
- **Compliance:** [regulatory requirements if any]

## Success Criteria
1. [Measurable KPI 1]
2. [Measurable KPI 2]
3. [Measurable KPI 3]

## Scope
- **In scope:** [what we will deliver]
- **Out of scope:** [what we explicitly won't do]
- **Assumptions:** [things we assume to be true]

## Knowledge Context
- **Baselines matched:** B01 (Forecasting), B06 (Optimization)
- **Industry matched:** I06 (Logistics)
- **Matrix node:** B01-I06 (if exists)
- **Pipeline scope:** [A/B/C/D — how many phases]

## Agent Team
| Role | Agent | Phases |
|------|-------|--------|
| ... | ... | ... |
```

---

### 4.1 P1 — Discovery & Research

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: DISCOVERY & RESEARCH                          │
│  Goal: Deep dive into problem space using existing       │
│        knowledge + domain context                        │
│  Duration: ~15-20 min                                    │
│  Lead: Dr. Archon (α)                                   │
│  Support: R-Dxx (Domain Expert), R-DA (Data Analyst)    │
└─────────────────────────────────────────────────────────┘

STEP 1.1 — Domain Briefing (R-Dxx)
  Context: project-brief.md + I{XX}.json
  Process:
    1. Identify top 5 domain-specific pain points for this problem
    2. Assess data reality (what data clients in this industry ACTUALLY have)
    3. List industry terminology and jargon relevant to the solution
    4. Name 3-5 real companies that solved similar problems
    5. Flag regulatory/compliance requirements
  Output:  domain-brief.md (1-2 pages, concise)

STEP 1.2 — Adapted Research (α)
  Context:
    • α's own research-report.md for matched Baseline(s)
    • Baseline JSON(s) — concepts, algorithms, SOTA sections
    • project-brief.md
    • domain-brief.md (from step 1.1)
  Process:
    1. Re-read own Baseline research
    2. FILTER: which algorithms/approaches fit client's constraints?
       - Budget constraint → eliminate expensive approaches
       - Team skill constraint → eliminate approaches needing rare expertise
       - Data constraint → eliminate approaches needing data client doesn't have
       - Timeline constraint → eliminate approaches with long dev cycles
    3. ADAPT: for remaining approaches, detail HOW they apply to THIS problem
       - Input data: what specifically from client's data feeds each approach
       - Expected output: what predictions/results client gets
       - Accuracy expectations: realistic for this data quality/volume
    4. IDENTIFY GAPS: anything in client's problem NOT covered by Baseline?
       → if yes, do targeted web search for ONLY the gap
    5. Recommend top 2-3 approaches with pros/cons for THIS project
  Output:  discovery-report.md

  WEB SEARCH POLICY:
    DEFAULT: No web search. Use existing Baseline knowledge.
    EXCEPTION 1: Client problem involves technique not in any Baseline
    EXCEPTION 2: Client names specific tool/product α hasn't researched
    EXCEPTION 3: Very recent development (last 3 months) may be relevant

STEP 1.3 — Data Assessment (R-DA, optional)
  Context: project-brief.md + data description from client
  Process:
    1. Assess data sufficiency (enough for recommended approaches?)
    2. Identify data quality risks (missing values, bias, format issues)
    3. Estimate data preparation effort
    4. Recommend data collection if gaps exist
  Output:  Appended to discovery-report.md as "Data Assessment" section
```

**Discovery Report Template:**

```markdown
# Discovery Report — {PROJECT_NAME}

## 1. Problem Analysis
[Restate problem in technical terms, tied to specific AI capabilities]

## 2. Domain Context
[Key insights from R-Dxx: industry reality, data landscape, terminology]

## 3. Recommended Approaches
### Approach A: {name}
- **What:** [1 paragraph description]
- **Why for this project:** [specific fit with client constraints]
- **Algorithms:** [specific models/methods]
- **Data requirements:** [what client data feeds this]
- **Expected performance:** [realistic accuracy/speed estimate]
- **Risks:** [what could go wrong]

### Approach B: {name}
[same structure]

### Approach C: {name} (optional)
[same structure]

## 4. Comparison Matrix
| Criterion | Approach A | Approach B | Approach C |
|-----------|-----------|-----------|-----------|
| Accuracy potential | ... | ... | ... |
| Dev effort | ... | ... | ... |
| Data requirement | ... | ... | ... |
| Team skill fit | ... | ... | ... |
| Time to MVP | ... | ... | ... |

## 5. Data Assessment
- **Available data:** [what client has]
- **Data gaps:** [what's missing]
- **Preparation effort:** [estimated time]
- **Quality risks:** [identified issues]

## 6. Recommendation
[Clear recommendation: which approach, why, what's needed to start]

## 7. Open Questions
[Questions that need client answers before proceeding]
```

---

### 4.2 P2 — Proposal & Business Case

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: PROPOSAL & BUSINESS CASE                      │
│  Goal: Determine if project is viable + estimate value   │
│  Duration: ~10-15 min                                    │
│  Lead: Dr. Sentinel (γ)                                 │
│  Support: R-BA (Business Analyst)                       │
│  DECISION GATE AT END                                    │
└─────────────────────────────────────────────────────────┘

STEP 2.1 — Feasibility Evaluation (γ)
  Context:
    • γ's own feasibility-report.md for matched Baseline(s)
    • discovery-report.md (P1 output)
    • project-brief.md (constraints)
  Process:
    1. Re-read own Baseline feasibility assessment
    2. ADAPT scoring for THIS project's specific constraints:

       Technical Feasibility (1-10):
         Baseline score adjusted for:
         → Client team skill level (downgrade if team is junior)
         → Client infrastructure (downgrade if legacy systems)
         → Integration complexity (downgrade if many touchpoints)

       Market/Business Value (1-10):
         → ROI estimate for THIS client (not general market)
         → Competitive advantage gained
         → Cost of NOT doing this (opportunity cost)

       Data Readiness (1-10):
         → Based on R-DA assessment (P1.3)
         → Client's actual data vs theoretical requirements

       Implementation Risk (1-10, inverted):
         → Timeline risk (can it be done in client's timeline?)
         → Budget risk (can it be done within budget?)
         → Team risk (does team have enough expertise?)
         → Dependency risk (external systems, data sources)

    3. Calculate overall score:
       Score = Tech×0.30 + Value×0.30 + Data×0.20 + RiskInv×0.20

    4. Determine verdict:
       ≥ 7.0 → GO
       5.0–6.9 → CONDITIONAL GO (list conditions)
       < 5.0 → NO-GO (explain why, suggest alternatives)

  Output: Feasibility section of proposal.md

STEP 2.2 — Business Case (R-BA)
  Context: project-brief.md + discovery-report.md
  Process:
    1. ROI calculation (estimated cost vs estimated value)
    2. Timeline estimate (based on recommended approach complexity)
    3. Resource requirements (team composition, infrastructure)
    4. Build vs Buy analysis (are there existing solutions?)
    5. Risk register with mitigations
  Output: Business case section of proposal.md

STEP 2.3 — Competitive Analysis (γ)
  Context: Baseline knowledge + project-brief.md
  Process:
    1. List existing solutions that solve similar problems
    2. Compare: build custom vs use existing (≥3 alternatives)
    3. Pricing comparison
    4. Strengths/weaknesses of each alternative
    5. Justify custom build (or recommend buying)
  Web search: ALLOWED for current competitor pricing/features
  Output: Competitive analysis section of proposal.md

STEP 2.4 — Consolidate Proposal (γ + R-BA)
  Output: proposal.md (complete document)
```

**Decision Gate:**

```
AFTER P2 COMPLETES:

IF verdict = GO (score ≥ 7.0):
  → Present proposal.md to user
  → User confirms → proceed to P3
  → User modifies → update brief, re-run P2

IF verdict = CONDITIONAL GO (score 5.0–6.9):
  → Present proposal.md + conditions list
  → User decides: accept conditions → proceed to P3
                   reject → STOP pipeline
                   modify → update brief, re-run P1+P2

IF verdict = NO-GO (score < 5.0):
  → Present proposal.md + reasons
  → Suggest alternatives (different approach, reduce scope, buy instead)
  → STOP pipeline (user can restart with different brief)

USER ALWAYS HAS FINAL SAY.
System recommends, human decides.
```

---

### 4.3 P3 — Solution Architecture

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 3: SOLUTION ARCHITECTURE                         │
│  Goal: High-level system design                          │
│  Duration: ~15-20 min                                    │
│  Lead: R-SA (Solution Architect)                        │
│  Support: Dr. Praxis (β), R-SE (Security), R-CE (Cloud)│
│  DECISION GATE AT END                                    │
└─────────────────────────────────────────────────────────┘

STEP 3.1 — System Architecture (R-SA)
  Context:
    • project-brief.md
    • discovery-report.md (recommended approach)
    • proposal.md (constraints, budget, timeline)
  Process:
    1. Define system components (services, databases, queues, APIs)
    2. Draw component diagram (which talks to which)
    3. Define data flow (how data moves through system)
    4. Identify integration points (client's existing systems)
    5. Define scalability approach (horizontal/vertical, when to scale)
  Output: System architecture section of architecture.md

STEP 3.2 — Tech Stack Selection (β)
  Context:
    • β's own tech-report.md for matched Baseline(s)
    • project-brief.md (team skills, existing tech)
    • discovery-report.md (recommended approach)
  Process:
    1. Re-read own Baseline tech recommendations
    2. ADAPT for client constraints:
       → Team knows Python but not Go → choose Python-based tools
       → Client runs on AWS → choose AWS-native services
       → Budget is tight → choose open-source over paid
    3. For each component, recommend specific tool:
       - ML framework: [choice + why]
       - Backend framework: [choice + why]
       - Database: [choice + why]
       - Message queue: [choice + why]
       - Frontend framework: [choice + why]
       - Deployment platform: [choice + why]
    4. Decision matrix: for non-obvious choices, compare 2-3 options
  Output: Tech stack section of architecture.md

STEP 3.3 — Infrastructure Design (R-CE, if cloud deployment)
  Context: architecture (draft) + project-brief.md
  Process:
    1. Cloud architecture (VPC, subnets, services)
    2. Cost estimate (monthly infrastructure cost)
    3. Scaling policy (auto-scale triggers)
    4. Network topology (load balancers, CDN, API gateway)
  Output: Infrastructure section of architecture.md

STEP 3.4 — Security Architecture (R-SE)
  Context: architecture (draft) + project-brief.md
  Process:
    1. Authentication & authorization design
    2. Data encryption (at rest, in transit)
    3. PII handling (if applicable)
    4. Compliance requirements mapping
    5. API security (rate limiting, input validation)
  Output: Security section of architecture.md

STEP 3.5 — Architecture Review (γ)
  Context: complete architecture.md + proposal.md
  Process:
    1. Does architecture fit within budget?
    2. Can the team build this in the timeline?
    3. Are there simpler alternatives for any component?
    4. Is the architecture over-engineered for MVP?
    5. Score: Implementation Complexity (1-10)
  Output: Review notes appended to architecture.md
```

**Decision Gate:**

```
AFTER P3 COMPLETES:

γ reviews architecture against proposal constraints:
  PASS:     Architecture fits budget + timeline + team → proceed to P4
  REVISE:   Architecture too complex → R-SA simplifies → re-review
  ESCALATE: Architecture conflicts with constraints → user decides

Architecture must answer THESE questions before P4:
  □ System diagram with all components named?
  □ Tech stack decided for every component?
  □ Data flow from input to output clear?
  □ Integration points with client systems identified?
  □ MVP vs full scope clearly separated?
  □ Cost estimate within client budget?
```

---

### 4.4 P4 — Detailed Design (Parallel Branches)

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 4: DETAILED DESIGN                               │
│  Goal: Specification-level design for every component    │
│  Duration: ~20-30 min (parallel reduces wall time)       │
│  Branches: 4 parallel + 1 integration review             │
│  All branches receive: architecture.md + project-brief   │
└─────────────────────────────────────────────────────────┘

═══ P4a — API Design ═══════════════════════════════════════

  Lead: R-BE (Backend Engineer)
  Support: R-SA (for consistency with architecture)
  Context:
    • R-BE's own notes for matched Baselines
    • architecture.md (components + data flow)
    • project-brief.md (integration requirements)

  Deliverables:
    1. API endpoint list (RESTful or GraphQL)
       - Path, method, description
       - Request schema (with types + validation)
       - Response schema (with error codes)
       - Authentication requirement
    2. Data contracts
       - Input/output schemas for every endpoint
       - Versioning strategy
    3. Error handling specification
       - Error code taxonomy
       - Retry policies
       - Circuit breaker patterns
    4. Rate limiting & throttling rules
    5. Webhook/event specifications (if applicable)
    6. API documentation outline (for R-TC in P9)

  Output: api-design.md

═══ P4b — Database Design ══════════════════════════════════

  Lead: R-DBE (Database Engineer)
  Support: R-DE (Data Engineer)
  Context:
    • architecture.md (database choice + data flow)
    • api-design.md (data schemas from API contracts)
    • project-brief.md (data volume, query patterns)

  Deliverables:
    1. Entity-Relationship Diagram (ERD)
       - All entities with attributes + types
       - Relationships with cardinality
       - Primary/foreign key definitions
    2. Table schemas
       - Column names, types, constraints
       - Indexes (with justification)
       - Partitioning strategy (if large data)
    3. Migration plan
       - Schema versioning approach
       - Seed data requirements
       - Data migration from client's existing system (if applicable)
    4. Query patterns
       - Most common queries (with expected frequency)
       - Performance considerations per query
    5. Data retention policy
    6. Backup strategy

  Output: database-design.md

═══ P4c — Algorithm & ML Specification ═════════════════════

  Lead: R-MLE (ML Engineer)
  Support: R-DLE (Deep Learning), R-DE (Data Engineer)
  Context:
    • R-MLE's own notes for matched Baselines
    • discovery-report.md (recommended approach from α)
    • architecture.md (ML component placement)
    • project-brief.md (data description, accuracy requirements)

  Deliverables:
    1. Model selection (specific model, not just category)
       - Model name + version
       - Why this model for THIS data/problem
       - Alternatives considered + why rejected
    2. Feature engineering plan
       - Input features (from client data)
       - Feature transformations
       - Feature store design (if applicable)
    3. Training pipeline specification
       - Data split strategy (train/val/test)
       - Hyperparameter search approach
       - Training infrastructure (GPU/CPU, memory)
       - Expected training time
    4. Inference pipeline specification
       - Batch vs real-time
       - Latency requirements
       - Model serving approach (API, embedded, edge)
       - Input preprocessing steps
       - Output postprocessing steps
    5. Evaluation plan
       - Metrics (primary + secondary)
       - Baseline to beat
       - A/B testing approach
    6. MLOps considerations
       - Model versioning
       - Drift detection
       - Retraining triggers
       - Monitoring dashboard

  Output: algorithm-spec.md

═══ P4d — Frontend & UI Design ═════════════════════════════

  Lead: R-FE (Frontend Engineer)
  Support: R-UX (UX Designer)
  Context:
    • R-FE's own notes for matched Baselines
    • architecture.md (frontend framework + components)
    • api-design.md (endpoints to integrate)
    • project-brief.md (user types, use cases)

  Deliverables:
    1. User flow diagrams
       - Main user journeys (step by step)
       - Decision points and branches
    2. Page/screen inventory
       - List of all pages/views
       - Purpose of each
       - Data displayed on each
    3. Wireframes (text description or ASCII art)
       - Layout for key screens
       - Component placement
       - Responsive breakpoints
    4. Component architecture
       - Component tree (what contains what)
       - Shared components (design system elements)
       - State management approach
    5. Frontend-API integration map
       - Which page calls which API endpoint
       - Data flow from API to UI
       - Loading states and error handling
    6. Accessibility requirements
       - WCAG level target
       - Keyboard navigation plan
       - Screen reader considerations

  Output: ui-design.md

═══ P4e — Integration Review ═══════════════════════════════

  Lead: R-SA (Solution Architect)
  Support: β (Dr. Praxis)
  Context: ALL P4a-P4d outputs + architecture.md
  
  Runs AFTER all parallel branches complete.
  
  Process:
    1. Cross-reference API design ↔ Database design
       → Do API request/response schemas match DB tables?
       → Are all needed queries covered by indexes?
    2. Cross-reference API design ↔ Algorithm spec
       → Does ML inference output match API response schema?
       → Does training pipeline input match data pipeline output?
    3. Cross-reference API design ↔ Frontend design
       → Does every frontend data need have a corresponding API endpoint?
       → Are error codes handled in frontend error states?
    4. Cross-reference Database ↔ Algorithm
       → Does feature engineering query existing DB tables correctly?
       → Is training data accessible from the DB efficiently?
    5. Identify inconsistencies → create fix list
    6. Verify all designs support architecture's scalability approach

  Output: integration-review.md
    - Consistency check results (PASS/FAIL per pair)
    - Inconsistencies found + resolution for each
    - Design gaps (anything missing across all docs)
    - Sign-off: all designs are internally consistent
```

---

### 4.5 P5 — Implementation Planning

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 5: IMPLEMENTATION PLANNING                       │
│  Goal: Turn designs into actionable development plan     │
│  Duration: ~10-15 min                                    │
│  Lead: R-PM (Project Manager)                           │
│  Support: R-BA                                          │
└─────────────────────────────────────────────────────────┘

  Context: ALL P0-P4 outputs

  Deliverables:
    1. Work Breakdown Structure (WBS)
       - Epics (major workstreams)
       - Stories (deliverable units)
       - Tasks (implementable items, 1-3 days each)
    2. Sprint plan
       - Sprint 0: setup, scaffolding, CI/CD
       - Sprint 1-N: feature development
       - Sprint N+1: integration testing
       - Sprint N+2: deployment + monitoring
    3. Dependency graph
       - What must be built before what
       - Critical path identification
       - Parallel workstreams
    4. Team assignment
       - Which developer works on which workstream
       - Skill requirements per workstream
    5. Risk mitigation plan
       - Top 5 risks from proposal.md
       - Mitigation actions assigned to sprints
    6. Definition of Done
       - Per-story acceptance criteria
       - Quality gates between sprints
    7. Milestones + demo points
       - When client sees progress
       - What is demoed at each milestone

  Output: project-plan.md
```

---

### 4.6 P6 — Development Guides

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 6: DEVELOPMENT GUIDES                            │
│  Goal: Everything a developer needs to start coding      │
│  Duration: ~15-20 min (parallel)                         │
│  Lead: Dr. Praxis (β)                                   │
│  Parallel: R-BE, R-FE, R-MLE write their own guides     │
└─────────────────────────────────────────────────────────┘

STEP 6.1 — Overall Development Guide (β)
  Deliverables:
    1. Project structure (folder organization)
    2. Coding standards (naming, formatting, patterns)
    3. Git workflow (branching strategy, PR process)
    4. Environment setup (local dev, staging, production)
    5. Shared utilities and common patterns
    6. Error handling conventions
    7. Logging standards
    8. Configuration management
  Output: dev-guide.md

STEP 6.2 — Backend Development Guide (R-BE)
  Deliverables:
    1. API implementation patterns (controller/service/repository)
    2. Authentication middleware setup
    3. Database connection and ORM configuration
    4. Validation patterns
    5. Starter code templates (1 complete endpoint as example)
  Output: dev-guide-backend.md

STEP 6.3 — Frontend Development Guide (R-FE)
  Deliverables:
    1. Component architecture guidelines
    2. State management patterns
    3. API integration patterns (hooks, data fetching)
    4. Routing structure
    5. Starter code templates (1 complete page as example)
  Output: dev-guide-frontend.md

STEP 6.4 — ML Development Guide (R-MLE)
  Deliverables:
    1. Experiment setup (notebook structure, tracking)
    2. Data loading and preprocessing patterns
    3. Training script template
    4. Evaluation script template
    5. Model serving integration guide
  Output: dev-guide-ml.md
```

---

### 4.7 P7 — QA & Testing Plan

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 7: QUALITY ASSURANCE PLAN                        │
│  Goal: Comprehensive testing strategy                    │
│  Duration: ~10-15 min                                    │
│  Lead: R-QA (QA Engineer)                               │
│  Support: R-SE (Security), R-PE (Performance)           │
│  CAN run parallel with P8                               │
└─────────────────────────────────────────────────────────┘

  Deliverables:
    1. Test strategy overview
       - Test levels (unit, integration, e2e, performance)
       - Coverage targets per level
       - Test environments required
    2. Test case specifications
       - Per API endpoint: happy path + error cases
       - Per ML model: accuracy, fairness, robustness tests
       - Per UI flow: functional + usability cases
    3. Performance testing plan
       - Load testing scenarios
       - Expected throughput + latency targets
       - Stress test limits
    4. Security testing plan
       - OWASP Top 10 checklist
       - Penetration testing scope
       - Data privacy validation
    5. ML-specific testing
       - Model behavioral tests (does it handle edge cases?)
       - Fairness tests (bias detection)
       - Drift detection test setup
    6. Acceptance criteria
       - Per-feature sign-off checklist
       - Go-live quality gates

  Output: qa-plan.md
```

---

### 4.8 P8 — Deployment & Operations

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 8: DEPLOYMENT & OPERATIONS                       │
│  Goal: How to ship and keep it running                   │
│  Duration: ~10-15 min                                    │
│  Lead: R-DO (DevOps Engineer)                           │
│  Support: R-CE (Cloud Engineer), R-SE (Security)        │
│  CAN run parallel with P7                               │
└─────────────────────────────────────────────────────────┘

  Deliverables:
    1. CI/CD pipeline specification
       - Build steps (lint, test, build, deploy)
       - Branch-to-environment mapping
       - Automated test gates
       - Rollback procedure
    2. Infrastructure as Code templates
       - Terraform/Pulumi skeleton (or Docker Compose for simple projects)
       - Environment-specific configurations
       - Secrets management approach
    3. Monitoring & alerting setup
       - Metrics to track (latency, error rate, throughput)
       - Dashboard design (key panels)
       - Alert thresholds and escalation
       - Log aggregation setup
    4. Scaling strategy
       - Auto-scaling triggers and limits
       - Database scaling approach
       - ML model scaling (horizontal serving)
    5. Disaster recovery plan
       - Backup frequency and retention
       - Recovery Time Objective (RTO)
       - Recovery Point Objective (RPO)
       - Failover procedure
    6. Operational runbook
       - Common issues and fixes
       - On-call procedures
       - Incident response template

  Output: deployment-plan.md
```

---

### 4.9 P9 — Delivery Package

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 9: DELIVERY PACKAGE                              │
│  Goal: Consolidate everything into client-ready package  │
│  Duration: ~10-15 min                                    │
│  Lead: Ms. Scribe (σ)                                   │
│  Support: R-TC (Technical Writer), R-PM                 │
└─────────────────────────────────────────────────────────┘

STEP 9.1 — Executive Summary (σ)
  1-2 page overview for client stakeholders (non-technical):
    - Problem statement (1 paragraph)
    - Recommended solution (1 paragraph)
    - Key numbers: timeline, budget, team, expected ROI
    - GO/NO-GO verdict + confidence level
    - Top 3 risks with mitigations
    - Recommended next steps

STEP 9.2 — Full Documentation Index (R-TC)
  Create navigation document listing all deliverables:
    - Phase, document, purpose, audience
    - Reading order recommendation
    - Quick-start guide (what to read first)

STEP 9.3 — Knowledge Feedback (σ)
  IF project produced new insights not in Baseline:
    1. Extract insights → create feedback notes
    2. Flag which Baseline(s) should be updated
    3. Queue for next Knowledge Graph update cycle
  This closes the loop: projects enrich the knowledge base.

STEP 9.4 — Package Assembly
  Final deliverable structure:
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

## 5. AGENT ROSTER — FULL REFERENCE

### 5.1 Core Team (Always Present)

| Agent | Role | Primary Phases | Knowledge Reuse From |
|-------|------|----------------|---------------------|
| α Dr. Archon | Research Lead | P1 | research-report.md per Baseline |
| β Dr. Praxis | Engineering Lead | P3, P6 | tech-report.md per Baseline |
| γ Dr. Sentinel | Evaluation Lead | P2, P3 gate, P4e | feasibility-report.md per Baseline |
| σ Ms. Scribe | Documentation Lead | P9 | final-report.md per Baseline |
| R-BA | Business Analyst | P0, P2 | — |
| R-SA | Solution Architect | P3, P4e | — |
| R-PM | Project Manager | P5 | — |

### 5.2 Engineering Team (Selected Based on Project Type)

| Agent | Role | Primary Phases | When Needed |
|-------|------|----------------|-------------|
| R-BE | Backend Engineer | P4a, P6 | Always (every project has API) |
| R-FE | Frontend Engineer | P4d, P6 | If project has user interface |
| R-DBE | Database Engineer | P4b | If project has persistent storage |
| R-DE | Data Engineer | P4b, P4c | If significant data processing |
| R-MLE | ML Engineer | P4c, P6 | If project involves ML/AI models |
| R-DLE | Deep Learning Eng | P4c | If deep learning models needed |
| R-NLP | NLP Engineer | P4c | If NLP-specific project |
| R-CVE | Computer Vision Eng | P4c | If CV-specific project |
| R-AE | Agent Engineer | P4c | If agentic AI project |

### 5.3 Operations Team (Selected Based on Scale)

| Agent | Role | Primary Phases | When Needed |
|-------|------|----------------|-------------|
| R-DO | DevOps Engineer | P8 | If deployment planning needed |
| R-CE | Cloud Engineer | P3, P8 | If cloud deployment |
| R-SE | Security Engineer | P3, P7 | If security/compliance requirements |
| R-QA | QA Engineer | P7 | If testing plan needed |
| R-PE | Performance Eng | P7 | If performance-critical system |

### 5.4 Domain & Delivery (Selected Based on Industry)

| Agent | Role | Primary Phases | When Needed |
|-------|------|----------------|-------------|
| R-D01–D20 | Domain Expert | P0, P1, P2 | Matched to project industry |
| R-UX | UX Designer | P4d | If user-facing product |
| R-TC | Technical Writer | P9 | If client needs user documentation |
| R-DA | Data Analyst | P1 | If data assessment needed |

### 5.5 Team Assembly Quick Reference

```
PROJECT TYPE             MINIMUM TEAM                    TYPICAL SIZE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feasibility check        α, γ, R-BA, R-Dxx, σ            5 agents
(Scope A, P0-P2)

Architecture proposal    + β, R-SA                        7 agents
(Scope B, P0-P3)

Full design              + R-BE, R-DBE, R-MLE,            12-15 agents
(Scope C, P0-P5)           R-FE, R-PM, R-DO

Complete blueprint       + R-QA, R-SE, R-CE,              15-20 agents
(Scope D, P0-P9)           R-UX, R-TC, R-PE
```

---

## 6. DECISION GATES

### 6.1 Gate Rules

```
GATE 1 — After P2 (Proposal):
  Evaluator: γ (Dr. Sentinel)
  Criteria:  Overall score ≥ 7.0 for GO
  Actions:   GO → proceed to P3
             CONDITIONAL GO → user decides (accept conditions or stop)
             NO-GO → stop pipeline, deliver proposal only
  User override: YES (user can force proceed even if NO-GO, at own risk)

GATE 2 — After P3 (Architecture):
  Evaluator: γ (Dr. Sentinel) reviews R-SA output
  Criteria:  Architecture fits within constraints (budget, timeline, team)
  Actions:   PASS → proceed to P4
             REVISE → R-SA simplifies, γ re-reviews (max 2 iterations)
             FAIL → escalate to user with specific conflicts

GATE 3 — After P4e (Integration Review):
  Evaluator: R-SA (Solution Architect)
  Criteria:  All 4 design branches are internally consistent
  Actions:   PASS → proceed to P5
             FIX → specific agents revise inconsistencies (targeted, not full redo)
             FAIL → escalate to user (fundamental design conflict)

GATE 4 — After P9 (Final Delivery):
  Evaluator: σ (Ms. Scribe) + user
  Criteria:  All deliverables present and internally consistent
  Actions:   ACCEPT → deliver package
             REVISE → specific phases re-run with targeted fixes
```

### 6.2 Early Termination

```
Pipeline can stop early at any gate. Partial output is still valuable:

Stop after P2:  Client gets feasibility assessment + competitive analysis
                Use case: "Should we even do this?"

Stop after P3:  Client gets + architecture proposal
                Use case: "How would you build this?" (for RFP response)

Stop after P5:  Client gets + full design + project plan
                Use case: "We'll build it ourselves with these specs"

Full P9:        Client gets complete blueprint
                Use case: "Give us everything, we'll follow the plan"
```

---

## 7. PROMPT ENGINEERING — AGENT INSTRUCTIONS

### 7.1 Prompt Template Structure

Mỗi agent nhận prompt theo cấu trúc thống nhất:

```
SYSTEM PROMPT:
  [Agent skill card content — identity, skills, constraints]
  [Phase-specific instructions — what to do in THIS phase]
  [Output template — exact format expected]

USER MESSAGE:
  === PROJECT CONTEXT ===
  [project-brief.md content]

  === KNOWLEDGE BASE ===
  [Agent's own Baseline report(s) — relevant sections only]
  [Industry JSON — relevant sections only]

  === PREVIOUS PHASE OUTPUT ===
  [Output from previous agent in pipeline]

  === YOUR TASK ===
  [Specific instructions for this phase + this agent]
  [Explicit constraints and quality criteria]
```

### 7.2 Key Prompt Patterns

```
PATTERN: ADAPT (for knowledge reuse)
"You previously researched {BASELINE_NAME}. Your research report is attached.
 Now, adapt your knowledge for THIS specific project:
 - Client problem: {problem_summary}
 - Client constraints: {constraints_summary}
 Filter your research to what's relevant. Add project-specific details.
 Do NOT copy from your previous report. Write NEW content for THIS project."

PATTERN: EVALUATE (for decision gates)
"Review the {DOCUMENT_NAME} against these criteria:
 - Budget: {budget}
 - Timeline: {timeline}
 - Team: {team_description}
 Score each dimension 1-10 with justification.
 Verdict: GO (≥7.0) / CONDITIONAL GO (5.0-6.9) / NO-GO (<5.0)
 If CONDITIONAL, list specific conditions that must be met."

PATTERN: DESIGN (for detailed design phases)
"Design the {COMPONENT} for this project.
 Architecture decisions already made: [attached architecture.md]
 Your constraints:
 - Must be consistent with {related_component} design
 - Must work within {tech_stack} decisions
 - Must handle {scale_requirement}
 Output using the template below. Be specific enough that a developer
 can implement directly from your specification."

PATTERN: INTEGRATE (for cross-cutting review)
"Review ALL design documents for internal consistency:
 [attached: api-design.md, database-design.md, algorithm-spec.md, ui-design.md]
 For each pair of documents, check:
 1. Data schemas match across boundaries
 2. Naming conventions are consistent
 3. Error handling is compatible
 4. No missing connections
 List all inconsistencies found, with specific fix recommendations."
```

---

## 8. QUALITY STANDARDS

### 8.1 Per-Document Quality Checklist

```
EVERY document produced by an agent MUST pass:

□ COMPLETENESS
  - All template sections filled (no empty sections)
  - All decisions have justification (no "we chose X" without why)
  - All references to other documents are accurate

□ SPECIFICITY
  - Names specific tools, not categories ("PostgreSQL 16" not "a database")
  - Includes concrete numbers ("200ms p99 latency" not "fast")
  - Code examples are runnable, not pseudocode (where templates requested)

□ CONSISTENCY
  - Terminology matches across all documents
  - Tech stack choices don't contradict between documents
  - Data schemas referenced correctly across API/DB/ML/UI docs

□ CLIENT-FIT
  - Every recommendation considers client's specific constraints
  - No recommendations that exceed budget or timeline
  - No recommendations requiring skills client team doesn't have
  - Alternatives provided for high-risk recommendations

□ ACTIONABILITY
  - Developer can start implementing from this document
  - No ambiguous "TBD" or "to be decided" items (decide or flag as open question)
  - Clear acceptance criteria for every deliverable
```

### 8.2 Cross-Document Consistency Rules

```
api-design.md ↔ database-design.md:
  - Every API entity has a corresponding DB table (or explicit reason why not)
  - API field names match DB column names (or mapping is documented)
  - API query parameters have supporting DB indexes

api-design.md ↔ algorithm-spec.md:
  - ML model input format matches API request preprocessing output
  - ML model output format matches API response schema
  - Inference latency target is achievable with chosen model + serving approach

api-design.md ↔ ui-design.md:
  - Every UI data need has a corresponding API endpoint
  - API error codes are handled in UI error states
  - Loading states designed for actual API response times

database-design.md ↔ algorithm-spec.md:
  - Training data queries work with DB schema
  - Feature engineering SQL is valid against defined tables
  - Data volume estimates are consistent

architecture.md ↔ all design docs:
  - Component names match across all documents
  - Tech stack choices are respected in all designs
  - Scaling approach is consistent
```

---

## 9. ORCHESTRATION RULES

### 9.1 Execution Rules

```
RULE 1: SEQUENTIAL phases cannot be skipped or reordered.
  P0 → P1 → P2 → [Gate] → P3 → [Gate] → P4 → P5 → P6 → P7/P8 → P9

RULE 2: PARALLEL branches within a phase are independent.
  P4a, P4b, P4c, P4d have NO cross-dependency.
  Each receives same context (architecture.md + project-brief.md).
  Integration review (P4e) runs AFTER all branches complete.

RULE 3: DECISION GATES are hard stops.
  Pipeline does NOT proceed past a gate until gate criteria are met.
  Max 2 revision cycles per gate. After 2 fails → escalate to user.

RULE 4: CHECKPOINT after every agent.
  Every agent output is saved immediately.
  Pipeline can resume from any checkpoint if interrupted.

RULE 5: USER INTERVENTION allowed between any phases.
  User can: modify brief, add constraints, skip phases, force proceed.
  System logs all user overrides for traceability.

RULE 6: CONTEXT MINIMIZATION.
  Each agent receives ONLY context they need (see §3.2 matrix).
  Never dump all documents into one agent's context.
  Summarize long documents when passing downstream.
```

### 9.2 Error Handling

```
AGENT PRODUCES LOW-QUALITY OUTPUT:
  1. Quality check fails → return to same agent with specific feedback
  2. Agent retries (max 2 attempts)
  3. After 2 fails → escalate to user with what was produced
  4. User decides: accept as-is, modify manually, or skip section

AGENT CONTRADICTS PREVIOUS AGENT:
  1. Log contradiction in integration-review.md
  2. Present both perspectives to user
  3. User decides which direction to follow
  4. Downstream agents use the decision

PIPELINE INTERRUPTED (timeout, API error):
  1. Load last checkpoint
  2. Resume from next incomplete step
  3. If same step fails 3 times → notify user, wait for action

SCOPE CREEP DETECTED:
  Agent discovers project needs capability not in any Baseline:
  1. Agent flags gap in output
  2. System can optionally trigger α web search for ONLY the gap
  3. Or: flag as "future research needed" and continue with available knowledge
```

### 9.3 Feedback Loop to Knowledge Graph

```
After project completes, σ extracts learnings:

  NEW TECHNIQUE DISCOVERED:
    α found approach not in Baseline → queue for Baseline update

  BASELINE RECOMMENDATION INVALIDATED:
    Project proved a Baseline recommendation doesn't work in practice
    → flag Baseline for revision

  NEW INDUSTRY INSIGHT:
    Domain expert provided insight not in Industry JSON
    → queue for Industry update

  MATRIX NODE CREATION:
    If B×I combination didn't exist and project was successful
    → create new matrix node from project outputs

These are queued, NOT applied immediately.
Manager reviews feedback queue periodically and decides what to incorporate.
```

---

## 10. IMPLEMENTATION ROADMAP

### Sprint 1: Engine Core (P0-P2)

```
Build the simplest viable pipeline:
  □ Project creation + brief generation
  □ Knowledge matching (B+I auto-detect)
  □ Agent executor (single agent → Claude API)
  □ P0 → P1 → P2 sequential pipeline
  □ Decision gate after P2
  □ SSE events for real-time monitoring
  □ Basic dashboard (pipeline progress + agent output stream)

Test with: 2-3 real project briefs → verify feasibility output quality
```

### Sprint 2: Architecture Phase (P3)

```
  □ R-SA agent execution with architecture template
  □ β tech stack adaptation (reuse from Baseline reports)
  □ γ architecture review gate
  □ Architecture output quality validation
```

### Sprint 3: Parallel Design (P4)

```
  □ Parallel agent execution (Promise.all for P4a-P4d)
  □ R-SA integration review (P4e)
  □ Cross-document consistency checker (automated)
  □ Dashboard: show parallel branches + completion status
```

### Sprint 4: Planning + Guides (P5-P8)

```
  □ R-PM project planning agent
  □ Parallel dev guide generation (P6)
  □ QA + Deployment plan agents (P7, P8)
  □ Full pipeline end-to-end test
```

### Sprint 5: Delivery + 3D (P9 + Visualization)

```
  □ σ consolidation agent
  □ Full delivery package assembly
  □ Knowledge feedback loop
  □ 3D virtual office visualization layer
  □ Agent avatar animations
  □ View toggle (Dashboard ↔ 3D Office)
```

---

*Product Development Pipeline v1.0*  
*Agent Workspace — MAESTRO Knowledge Graph Ecosystem*  
*Created: 2026-04-04*
