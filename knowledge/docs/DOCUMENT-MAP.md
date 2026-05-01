# DOCUMENT MAP — MAESTRO Knowledge Graph Platform

**Version:** 1.0
**Last Updated:** 2026-04-03
**Purpose:** H2 Context Loading reference. Tells every agent EXACTLY which files to load, when, and why. Manager uses this before dispatching any task.

> **Rule:** Never load an entire doc if only 1 section is needed. Load the minimum context required (H2 principle).

---

## 1. COMPLETE DOCUMENT REGISTRY

### 1.1 Root-Level Files

| File | What It Contains | Must Read | Optional |
|------|-----------------|-----------|---------|
| `FLOW.md` | Project overview, architecture, pipeline A1-A6, file map, dev commands, onboarding | **ALL agents on first session** | — |
| `KICKOFF-PROMPT.md` | Session start template, 8 project rules, tech constraints | **Manager** at session start | — |
| `AGENTS.md` | Referenced by CLAUDE.md — agent index | **Manager** | — |
| `CLAUDE.md` | Entry point for Claude — references AGENTS.md | Claude/Windsurf | — |
| `agent-team-config.md` | 46-agent catalog, role→module mappings, 7-stage pipeline coverage checklist | **Manager** when selecting team | Layer 2 agents |
| `README.md` | Project intro for new contributors | New contributors | — |

### 1.2 Core Architecture Docs (`docs/`)

| File | What It Contains | Must Read | When |
|------|-----------------|-----------|------|
| `docs/MASTER-ARCHITECTURE.md` | Vision, tech stack, project structure, phase plan (0-4), agent team, standards | **ALL agents** | First session + phase change |
| `docs/SOP-AGENT-PROCESS.md` | Universal rules, task lifecycle (7 steps), Workflows A/B/C, all agent step-by-step instructions, output templates (§9) | **Every agent** loads their specific section only | Before starting any task |
| `docs/DATA-SCHEMA.md` | Node types, depth level requirements, BaselineNode/IndustryNode/MatrixNode TypeScript interfaces, NormalizedNode schema, SubNode schema | **R-σ** (full), **R-BE** (§8 NormalizedNode), **R-α/β/γ** (§1.5 depth levels) | When creating/validating JSON |
| `docs/CONVENTIONS.md` | ID format, glossary, file naming, color palette, language policy (§9 Two-Phase Model) | **ALL agents** | On first session; §9 when language policy unclear |
| `docs/SYSTEM-PROMPTS.md` | Hermes 5 Pillars, per-agent system prompts, Prompt 0-6 | **Manager** loads per-agent prompt section only | When dispatching each agent |
| `docs/PHASE-PLAN.md` | Phase 0-5 detailed breakdown, task tracker, module priority matrix | **Manager, R-PM** | Phase planning + progress tracking |
| `docs/AI-CAPABILITY-TAXONOMY.md` | Taxonomy of all 15 AI capabilities, relationships, sub-fields | **R-α** | Research phase for context |
| `docs/AI-INDUSTRY-TAXONOMY.md` | Taxonomy of all 20 industries, pain points, AI maturity | **R-γ, R-D01-D20** | Market/domain research |
| `docs/MODULE-TEST-PROTOCOL.md` | 6-layer module quality testing protocol (L0–L5): Build Health, Data Integrity, Pipeline Completeness, Agent Output Quality, Cross-Reference, Display & UX | **Manager, R-σ, R-QA** | After module research complete |
| `docs/PIPELINE-OPTIMIZATION-PROPOSAL.md` | **ARCHIVED** — Proposal already applied to SOP. Do NOT treat as active. | — | For historical reference only |
| `docs/FE-FIXES-NOTES.md` | Frontend-specific fix notes, known issues | **R-FE** | When working on UI fixes |
| `docs/round-2-research-plan.md` | Round 2 tier assignments (A/B/C), gap lists per module, execution order, progress tracker, rollback plan | **Manager** when running Workflow D | Phase 2.5 re-research only |

### 1.3 Agent Skill Cards (`.agents/`)

| Path | What It Contains | Must Read |
|------|-----------------|-----------|
| `.agents/tier-1-research/R-alpha-dr-archon.md` | α identity, skills, responsibilities, output format, MUST/MUST NOT | **R-α** at start of every task |
| `.agents/tier-1-research/R-beta-dr-praxis.md` | β identity, skills, responsibilities, output format (7 sections), scoring | **R-β** at start of every task |
| `.agents/tier-1-research/R-gamma-dr-sentinel.md` | γ identity, skills, **scoring formula (30/30/20/20)**, verdict thresholds, output format | **R-γ** at start of every task |
| `.agents/tier-1-research/R-sigma-ms-scribe.md` | σ identity, skills, **H4 memory**, **H5 filesystem checklist**, output format | **R-σ** at start of every task |
| `.agents/tier-2-engineering/R-{ROLE}.md` | Role-specific skills, constraints, sandbox, collaboration | **Each Tier-2 agent** loads only their own card |
| `.agents/tier-3-domain/R-D{XX}.md` | Industry domain expertise, pain points, data reality | **Each Tier-3 agent** loads only their own card |
| `.agents/tier-4-delivery/R-{ROLE}.md` | Delivery role skills, PM/SA/BA/UX/TC | **Each Tier-4 agent** loads only their own card |

### 1.4 Memory & Reports (`docs/memory/`, `docs/reports/`)

| Path | What It Contains | Must Read |
|------|-----------------|-----------|
| `docs/memory/{MODULE_ID}-learnings.md` | Top insights, tech decisions, market signals from previous module | **R-α** at start of related module; **Manager** for H2 loading |
| `docs/memory/matrix-insights.md` | Cross-cutting insights for matrix cells | **R-α, R-γ** when working on matrix nodes |
| `docs/reports/{MODULE_ID}/research-report.md` | R-α output (English) | **R-β** (input for tech analysis) |
| `docs/reports/{MODULE_ID}/tech-report.md` | R-β output (English) | **R-γ** (input for evaluation) |
| `docs/reports/{MODULE_ID}/feasibility-report.md` | R-γ output (English) | **R-σ** (input for consolidation) |
| `docs/reports/{MODULE_ID}/{ROLE_ID}-notes.md` | Layer 2 agent outputs (English) | **R-σ** (input for consolidation) |
| `docs/reports/{MODULE_ID}/final-report.md` | R-σ output (Vietnamese) | End users, Manager approval |

---

## 2. PER-AGENT CONTEXT LOADING GUIDE

> For Manager use: What to load into context before dispatching each agent (H2 rule).

### 2.1 Dispatching R-α (Step A1 — Research)

```
LOAD (in order of priority):
  1. .agents/tier-1-research/R-alpha-dr-archon.md        ← identity + constraints
  2. docs/SOP-AGENT-PROCESS.md → Step A1 (Bước 1.1–1.8)  ← execution steps ONLY
  3. Input data:
     - ai-services-factory-baseline.md → {MODULE_ID} section
     - ai-services-factory-knownledge.md → relevant section
  4. docs/memory/{PREVIOUS_MODULE_ID}-learnings.md        ← max 2000 tokens, 3 recent
  5. docs/SYSTEM-PROMPTS.md → Prompt 1 only              ← α system prompt

[Industry modules only — add to context]:
  +. docs/AI-INDUSTRY-TAXONOMY.md → relevant industry section  ← industry AI maturity + pain points
  +. docs/AI-CAPABILITY-TAXONOMY.md → relevant baselines for this industry  ← which Bxx apply here?

DO NOT LOAD: Full SOP, other agents' prompts, irrelevant memory files
```

### 2.2 Dispatching R-β (Step A2 — Tech Analysis)

```
LOAD:
  1. .agents/tier-1-research/R-beta-dr-praxis.md
  2. docs/SOP-AGENT-PROCESS.md → Step A2 (Bước 2.1–2.8) ONLY
  3. docs/reports/{MODULE_ID}/research-report.md           ← α output (REQUIRED input)
  4. docs/MASTER-ARCHITECTURE.md → §2 Tech Stack ONLY     ← tech constraints
  5. docs/SYSTEM-PROMPTS.md → Prompt 2 only

DO NOT LOAD: feasibility-report (doesn't exist yet), full SOP
```

### 2.3 Dispatching R-γ (Step A3 — Evaluation)

```
LOAD:
  1. .agents/tier-1-research/R-gamma-dr-sentinel.md       ← includes scoring formula
  2. docs/SOP-AGENT-PROCESS.md → Step A3 (Bước 3.1–3.7) ONLY
  3. docs/reports/{MODULE_ID}/research-report.md           ← α output
  4. docs/reports/{MODULE_ID}/tech-report.md               ← β output
  5. docs/AI-INDUSTRY-TAXONOMY.md → relevant industry section (if applicable)
  6. docs/SYSTEM-PROMPTS.md → Prompt 3 only

DO NOT LOAD: Stack tech comparison tools (β's job), full SOP
```

### 2.4 Dispatching Layer 2 Agents (Practical Research — parallel)

```
LOAD per agent:
  1. .agents/tier-{X}/{ROLE_ID}-*.md                      ← their own skill card ONLY
  2. docs/SOP-AGENT-PROCESS.md → Workflow A, Layer 2 section ONLY
  3. docs/SYSTEM-PROMPTS.md → Prompt 5 only

DO NOT LOAD: Layer 1 outputs (research-report, tech-report, feasibility-report).
  Layer 2 agents research from their OWN expertise domain only.

ROLE-SPECIFIC additions:
  R-D01-D20: docs/AI-INDUSTRY-TAXONOMY.md → their industry section
  R-MLE:     docs/DATA-SCHEMA.md → algorithms, techStack fields
  R-BE:      docs/DATA-SCHEMA.md → §8 NormalizedNode only
```

### 2.5 Dispatching R-σ (Step A4 — Consolidation)

```
LOAD:
  1. .agents/tier-1-research/R-sigma-ms-scribe.md
  2. docs/SOP-AGENT-PROCESS.md → Step A4 (Bước 4.1–4.8) ONLY
  3. docs/reports/{MODULE_ID}/research-report.md           ← α input
  4. docs/reports/{MODULE_ID}/tech-report.md               ← β input
  5. docs/reports/{MODULE_ID}/feasibility-report.md        ← γ input
  6. docs/reports/{MODULE_ID}/{ROLE_ID}-notes.md (×N)     ← Layer 2 inputs
  7. docs/DATA-SCHEMA.md → §1.5 Depth Levels + §2-4 Node schemas
  8. docs/CONVENTIONS.md → §9 Language Policy ONLY
  9. data/graph.json                                        ← for edge updates
  10. docs/SYSTEM-PROMPTS.md → Prompt 4 only

OUTPUT PATH — σ must write JSON to correct directory:
  Baseline module: data/baselines/{MODULE_ID}-name.json
  Industry module: data/industries/{MODULE_ID}-name.json
  Matrix module:   data/matrix/{BXX}-{IXX}-name.json

DO NOT LOAD: Full SOP, other modules' reports
```

### 2.6 Dispatching R-BE (Step A5 — Normalization)

```
LOAD:
  1. .agents/tier-2-engineering/R-BE-backend-engineer.md
  2. docs/SOP-AGENT-PROCESS.md → Step A5 ONLY
  3. data/baselines/{MODULE_ID}_draft.json    ← Baseline modules
     OR data/industries/{MODULE_ID}_draft.json ← Industry modules
     OR data/matrix/{BXX}-{IXX}_draft.json     ← Matrix modules
  4. docs/DATA-SCHEMA.md → §8 NormalizedNode ONLY
  5. src/lib/normalize-node.ts                              ← existing normalizer code
  6. src/types/node.ts                                      ← NormalizedNode interface
```

### 2.7 Dispatching R-FE (Step A6 — Display Verification)

```
LOAD:
  1. .agents/tier-2-engineering/R-FE-frontend-engineer.md
  2. docs/SOP-AGENT-PROCESS.md → Step A6 ONLY
  3. data/baselines/{MODULE_ID}.json                       ← just-normalized node
  4. docs/CONVENTIONS.md → §7 Color Palette ONLY
  5. docs/FE-FIXES-NOTES.md                               ← known UI issues
  6. src/components/graph/PlanetaryView.tsx                ← relevant component
```

---

## 3. TASK-BASED LOOKUP TABLE

> "I need to do X — which docs do I read?"

| Task | Primary Docs | Sections |
|------|-------------|---------|
| Start a new session | `FLOW.md`, `KICKOFF-PROMPT.md`, `docs/MASTER-ARCHITECTURE.md` | All |
| Research a new baseline module | `docs/SOP-AGENT-PROCESS.md` §3 Workflow A | Step A1-A4 |
| Research an industry module | `docs/SOP-AGENT-PROCESS.md` §3 Workflow A + `docs/AI-INDUSTRY-TAXONOMY.md` | Step A1-A5; see §2.1 industry notes |
| Research a matrix cell | `docs/SOP-AGENT-PROCESS.md` §5 Workflow C | Full |
| Re-research a module (Workflow D) | `docs/SOP-AGENT-PROCESS.md` §5.5 Workflow D + `docs/round-2-research-plan.md` | D.0–D.7 |
| Select agent team for a module | `agent-team-config.md` | §IV.2 baseline mapping + §IV.5 checklist |
| Create/validate a knowledge node JSON | `docs/DATA-SCHEMA.md` | §1.5 depth levels + §2/3/4 schema |
| Normalize draft JSON to production | `docs/DATA-SCHEMA.md` §8, `src/lib/normalize-node.ts` | §8 only |
| Write a research-report.md | `docs/SOP-AGENT-PROCESS.md` §3 Step A1, template §9.1 | Bước 1.1-1.8 |
| Write a tech-report.md | `docs/SOP-AGENT-PROCESS.md` §3 Step A2, template §9.2 | Bước 2.1-2.8 |
| Write a feasibility-report.md | `docs/SOP-AGENT-PROCESS.md` §3 Step A3, template §9.3 | Bước 3.1-3.7 |
| Write a final-report.md | `docs/SOP-AGENT-PROCESS.md` §3 Step A4, template §9.4 | Bước 4.1-4.8 |
| Build a UI component | `docs/SOP-AGENT-PROCESS.md` §4 Workflow B | Full |
| Test a completed module | `docs/MODULE-TEST-PROTOCOL.md` | All 6 layers (L0–L5) |
| Resolve language policy question | `docs/CONVENTIONS.md` | §9 Two-Phase Model |
| Track phase progress | `docs/PHASE-PLAN.md` | Current phase section |
| Understand color palette | `docs/CONVENTIONS.md` | §7 only |
| Add a new agent to catalog | `agent-team-config.md`, `FLOW.md` §7 | §7 Thêm agent mới |
| Load memory for previous module | `docs/memory/{MODULE_ID}-learnings.md` | Full (≤2000 tokens) |

---

## 4. HERMES H2 QUICK-LOAD RULES

```
RULE 1: Minimum context principle
  → Load the SMALLEST set of files that gives the agent what they need.
  → Never load a file "just in case" — it bloats context and reduces focus.

RULE 2: Section-level loading
  → When a doc has clear sections, load ONLY the relevant section.
  → Example: SOP has 9+ sections — load Step A1 only, not the full 1700-line file.

RULE 3: Memory recency window
  → Load max 3 most-recent memory files.
  → Total memory context ≤ 2000 tokens.
  → Priority: same-domain modules first (B01 memory helps B07, not I01).

RULE 4: Never load archived docs as active
  → docs/PIPELINE-OPTIMIZATION-PROPOSAL.md = ARCHIVED. Skip.
  → docs/archive/* = historical only.

RULE 5: Agent card + task SOP = minimum viable context
  → If unsure what to load: start with agent's skill card + relevant SOP step.
  → Add other files only if task specifically requires them.
```

---

## 5. FILE DEPENDENCY GRAPH

```
FLOW.md
  └── MASTER-ARCHITECTURE.md
        ├── SOP-AGENT-PROCESS.md
        │     ├── .agents/tier-1/ (R-α, R-β, R-γ, R-σ skill cards)
        │     ├── .agents/tier-2/ (17 engineering roles)
        │     ├── .agents/tier-3/ (20 domain experts)
        │     └── .agents/tier-4/ (5 delivery roles)
        ├── DATA-SCHEMA.md
        │     └── src/types/node.ts (TypeScript implementation)
        │         └── src/lib/normalize-node.ts (normalization)
        ├── CONVENTIONS.md → §9 Two-Phase Language Model
        │     (referenced by: SOP Rule 6, KICKOFF Rule 7, SYSTEM-PROMPTS, all skill cards)
        └── PHASE-PLAN.md

SYSTEM-PROMPTS.md → references SOP-AGENT-PROCESS.md (no duplication)
KICKOFF-PROMPT.md → entry prompt, references all above
MODULE-TEST-PROTOCOL.md → quality gate after Workflow A complete
round-2-research-plan.md → Workflow D execution plan (Phase 2.5 module tier assignments)
```

---

*DOCUMENT-MAP v1.0 — MAESTRO Knowledge Graph Platform*
*Update this file whenever a new doc is added or a doc's purpose changes.*
