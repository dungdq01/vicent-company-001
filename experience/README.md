# experience/ — Phương Pháp & Trải Nghiệm (L3)

**Layer**: L3 — Experience | **Định nghĩa**: [`@../01-FRAMEWORK.md`](../01-FRAMEWORK.md) §L3

**Mục đích**: bridge giữa **knowledge (L1, lý thuyết)** và **projects (L4, thực hành)**. Chứa methodology, pipeline workflow, simulation patterns, anti-patterns, và (sau này) engine code.

**Owner**: P2 (engine + workflow). P1 (eval pipeline). P3 (domain workflow validation).

---

## 📂 Cấu Trúc

```
experience/
├── README.md                              ← (file này)
├── AGENT-WORKSPACE-PIPELINE.md            ← Engine orchestration blueprint
├── PRODUCT-DEVELOPMENT-PIPELINE.md        ← 9-phase pipeline blueprint
└── workspace/
    ├── README.md
    ├── SYSTEM-FLOW.md                     ← Data flow intake → delivery
    ├── KICKOFF-PROMPT.md                  ← (sẽ link sang _shared/prompts/)
    ├── DEV-ISSUES.md                      ← Known issues + ADR
    ├── docs/
    │   ├── SIMULATION-EXAMPLE.md          ← E2E walkthrough
    │   ├── agents/                        ← META docs (NOT skill cards)
    │   ├── pipeline/                      ← Pipeline docs:
    │   │     ├── P0-INTAKE.md … P9-DELIVERY.md     (Path A — customer brief)
    │   │     ├── P10-LONG-TERM.md                   (post-30-day client lifecycle)
    │   │     ├── PATH-B-PRODUCT.md                  (internal product B0-B7)
    │   │     ├── PATH-C-CONTENT.md                  (content C0-C7)
    │   │     └── PATH-D-RESEARCH.md                 (knowledge re-research D0-D6)
    │   ├── workflows/                     ← Operating SOPs W01-W12
    │   │     W01 daily, W02 weekly, W03 new-project, W04 dispatch, W05 incident,
    │   │     W06 90-day bootstrap, W07 cross-pipeline, W08 framework retro,
    │   │     W09 agent onboarding, W10 cross-path priority, W11 K-review, W12 phase rewind
    │   ├── pipelines-business/             ← Sales / Content / CS / Hiring / Finance
    │   └── quality/                       ← Quality gates + incident playbook
    ├── apps/                              ← (future) engine code
    │   ├── orchestrator/                  ← Next.js + Claude API
    │   └── dashboard/                     ← Mission Control UI
    └── projects/                          ← Engine RUNTIME workspace
                                             (KHÁC `my_learning/projects/`)
```

---

## 🎯 Vai Trò

### Methodology — HOW knowledge becomes deliverable

- L1 nói: "B01 baselines bao gồm Prophet, NBEATS, NHITS, TFT"
- L2 cho: "R-α agent biết research SOTA forecasting"
- **L3 nói**: "Trong P1 Discovery, invoke R-α + R-β + R-D{industry} parallel; cost target $0.50; eval gate ≥7.5; nếu fail → 1 retry rồi escalate manual"

### Workflow — Pipeline P0 → P9

`AGENT-WORKSPACE-PIPELINE.md` + `PRODUCT-DEVELOPMENT-PIPELINE.md` là blueprint monolith. `workspace/docs/pipeline/P{N}-{NAME}.md` là **decomposed actionable doc** mỗi phase 1 file:
- Trigger condition
- Input contract (từ phase trước)
- Agent invoked (link `_shared/.agents/`)
- Output contract (tới phase sau)
- DoD (link `_shared/standards/`)
- Cost + time target + failure/retry

---

## 🆚 Tách Bạch Tầng

| Concept | Đúng tầng | KHÔNG đặt ở |
|---|---|---|
| Skill card R-α | L2 `_shared/.agents/` | NOT `experience/` |
| "Khi nào invoke R-α" | L3 `experience/.../P1-DISCOVERY.md` | NOT `_shared/` |
| Research output B01 SOTA | L1 `knowledge/data/` | NOT `experience/` |
| Per-client deliverable | L4 `projects/{id}/` | NOT `experience/workspace/projects/` |
| Pricing | L5 `business-strategy/10` | NOT `experience/` |

**Note**: `experience/workspace/projects/` = engine **runtime** workspace (state machine, checkpoints). Per-client deliverable nằm ở `my_learning/projects/`.

---

## 🔗 Cross-References

| Concept | Source |
|---|---|
| Engine orchestrator | `AGENT-WORKSPACE-PIPELINE.md` |
| 9-phase pipeline detail | `PRODUCT-DEVELOPMENT-PIPELINE.md` |
| Skill cards (13 agents) | `@../_shared/.agents/` |
| Eval framework | `@../_shared/eval/SPEC.md` |
| Pipeline phase workflow | `workspace/docs/pipeline/P{N}-*.md` |
| 7-stage operating SOP | `@../00-OPERATING-MANUAL.md` |
| Strategic decisions | `@../business-strategy/01-strategy-overview.md` |

---

## 📝 Update Cadence

| Asset | Trigger | Owner |
|---|---|---|
| Phase doc P{N} | Pattern across ≥3 projects | P2 |
| Pipeline blueprint | Major engine version | P2 |
| Simulation example | Per-quarter refresh | P2 + P1 |
| DEV-ISSUES | Realtime when issue found | All |

---

## 🚫 Anti-Pattern

- Đặt skill card ở đây → duplicate với `_shared/.agents/`
- Đặt per-project state ở `experience/` root → đặt ở `workspace/projects/{id}/`
- Trộn engine code với docs → code đi `workspace/apps/`, docs đi `workspace/docs/`

---

*Last updated: 2026-04-27 — v1.1 (added Path B/C/D + P10 + W08-W12)*
