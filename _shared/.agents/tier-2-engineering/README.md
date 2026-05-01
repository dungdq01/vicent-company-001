# Tier 2 — Engineering Agents

**Parent**: [`@../README.md`](../README.md) | **Roster**: [`@../TEAM-CONFIG.md`](../TEAM-CONFIG.md) §I

**Mục đích**: 20 engineering agents — chọn theo module type (TEAM-CONFIG §IV.2). Phase 1 build skill card cho 7 agents critical/niche; Phase 2 mở rộng thêm 3 ops-stream agents.

## Phase 1 Skill Cards (build-time, P0–P9)

| ID | Role | Why Phase 1 |
|---|---|---|
| R-MLE | ML Engineer | Forecasting/recommendation/anomaly = 80% Phase 1 baselines |
| R-DE | Data Engineer | Mọi project cần data pipeline |
| R-BE | Backend Engineer | API là deliverable phổ biến |
| R-FE | Frontend Engineer | Dashboard/viz cho client demo |
| R-DO | DevOps Engineer | Deploy + monitor production |
| R-NLP | NLP Engineer | LLM/text projects (chiếm 40% Phase 1) |
| R-AE | Agent Engineer | Agentic AI projects (chiếm 30%) |

## Phase 2 Skill Cards (run-time, P10 Operate stream)

| ID | Role | Why Phase 2 | Distinct from |
|---|---|---|---|
| R-LLMOps | LLM Operations | Prompt regression + cost drift + model upgrade = CEO bottleneck | R-MLE (design-time only) |
| R-SRE | Site Reliability | SLO/error-budget/incident command — gap "Day 30+" production | R-DO (build-time only) |
| R-DataOps | Data Operations | PII enforcement + retention + jurisdiction compliance — mandatory cho ICP-D/E + Asia expansion | R-DE (build-time only) |

→ Phase 2 agents chạy **parallel ops-stream** từ P5 (provisioned at planning) đến P12 (sunset). Không thay thế Phase 1, chỉ kế thừa artifact và govern runtime.

**Còn lại 10 agents (R-DA, R-DBE, R-DLE, R-CVE, R-FS, R-ME, R-CE, R-SE, R-PE, R-QA)** dùng TEAM-CONFIG entry + ad-hoc skill card khi cần.

## Layer 2 Selection Rule

Theo SOP §1.2 RULE 1 — Manager dispatch Tier 2 dựa trên:
- TEAM-CONFIG §IV.2 baseline → recommended roles
- §IV.5 7-stage coverage checklist (mandatory)
- §IV.3 minimum team size by module type

## Parallel Execution
Tier 2 invoke **parallel** (không sequential như T1). Output independent → R-σ consolidate.

*Last updated: 2026-04-26*
