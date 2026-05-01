# experience/workspace/ — Engine Workspace

**Parent**: [`@../README.md`](../README.md) (L3 Experience layer)

**Mục đích**: nơi chứa **runtime engine** + **decomposed phase docs** + (future) engine code (Next.js orchestrator + Mission Control dashboard).

---

## 📂 Files

| File | Vai trò |
|---|---|
| `SYSTEM-FLOW.md` (27KB) | Data flow từ intake → delivery, layer connections |
| `KICKOFF-PROMPT.md` (34KB) | Prompt template khi start new project/research (sẽ alias `@../../_shared/prompts/`) |
| `DEV-ISSUES.md` (16KB) | Known issues + design decisions (ADR-style) |
| `docs/SIMULATION-EXAMPLE.md` (38KB) | End-to-end walkthrough example, contractor đọc 1 lần |

---

## 📂 Sub-folders

### `docs/agents/` — META docs về agent (NOT skill cards)

| File | Vai trò |
|---|---|
| `CONTEXT-LOADING.md` | How agents load context (token-optimized strategy) |
| `ROLE-TASK-MATRIX.md` | Mapping role × task — agent nào làm phase nào |

**Skill cards 44 agents** (v1.1: T0:3 + T1:6 + T2:20 + T3:1tpl + T4:5 + T5:10) không ở đây — chúng ở `@../../_shared/.agents/` (L2).

### `docs/pipeline/` — Phase docs (Path A) + Path B/C/D + P10

- `P0-INTAKE.md` … `P9-DELIVERY.md` — Path A customer brief flow
- `P10-LONG-TERM.md` — post-30-day client lifecycle
- `PATH-B-PRODUCT.md` — internal product B0-B7
- `PATH-C-CONTENT.md` — content piece C0-C7
- `PATH-D-RESEARCH.md` — knowledge re-research D0-D6
- `README.md` — pipeline index

Mỗi file phase có: trigger, input, agents, output, DoD, cost target, failure/retry, **Harness Checkpoint**.

### `docs/workflows/` — Operating SOPs W01-W12

W01 daily, W02 weekly, W03 new-project E2E, W04 dispatch runbook, W05 incident response, W06 first-90-days, W07 cross-pipeline, W08 framework retro, W09 agent onboarding, W10 cross-path priority, W11 K-review, W12 phase rewind.

### `docs/pipelines-business/` — 8 business pipelines (NEW v1.1)

Decomposed phase docs cho 8 business categories:
- `marketing/` M0-M5 · `sales/` S0-S5 · `content/` C0-C4
- `customer-success/` CS0-CS3 · `expansion/` E0-E3 (offensive) · `partnership/` BD0-BD4
- `hiring/` H0-H3 · `finance/` F0-F2

Pipeline ratio: Path A delivery 11 phase docs : Business engine 38 phase docs (3.5×).

### `docs/quality/` — Quality gates + incident handling

- `DOD-CHECKLIST.md` (per-phase DoD)
- `EVAL-GATES.md` (eval threshold + drift)
- `FILESYSTEM-CHECKLIST.md` (project structure validation)
- Layer 3 harness compliance check post-eval (per R-HRN-* rules)

### `apps/` — Engine code (future, Phase 1 W2+)

- `orchestrator/` — Next.js + Claude API + state machine
- `dashboard/` — Mission Control UI (React + shadcn + SSE)

→ Chưa có code. Sẽ build từ Phase 1 Week 1+ theo `business-strategy/09-phase1-execution-plan.md`.

### `projects/` — Engine runtime workspace

Mỗi project active có folder `{P-ID}/` chứa:
- `_state.json` — pipeline state machine snapshot
- `_checkpoints/` — per-agent checkpoints để resume
- Reports streaming output

→ **KHÁC** `my_learning/projects/{P-ID}/` (per-client deliverable). Đây là **engine internal** workspace.

---

## 🔗 Cross-References

- Pipeline blueprint: `@../AGENT-WORKSPACE-PIPELINE.md`
- 9-phase pipeline detail: `@../PRODUCT-DEVELOPMENT-PIPELINE.md`
- Skill cards: `@../../_shared/.agents/`
- Templates: `@../../_shared/templates/`
- Eval: `@../../_shared/eval/`
- Per-client deliverables: `@../../projects/`

---

*Last updated: 2026-04-28 — v1.1 (added 8 business pipelines, updated agent count 44, harness compliance gate)*
