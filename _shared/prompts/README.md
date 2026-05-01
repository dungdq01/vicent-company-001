# _shared/prompts/ — Reusable Prompt Templates

**Parent**: [`@../README.md`](../README.md) (L2 toolbox)

**Mục đích**: prompt template **dùng chung** xuyên project. Khác với skill card (system prompt per agent), đây là **task-level templates** kích hoạt mode/phase cụ thể.

---

## 📂 Files

| File | Vai trò | Status |
|---|---|---|
| **`RULES-PREAMBLE.md`** | **Claude skill v1.1 — auto-inject 11 rules + Harness/Orchestration/Lifecycle contracts vào MỌI agent (runtime)** | ✅ **MANDATORY (runtime)** |
| **`AGENT-MANUAL.md`** | **Single doc agent đọc 1 lần → hiểu toàn bộ operating model. Read-once-internalize.** | ✅ **MANDATORY (read-once)** |
| `KICKOFF-PROMPT.md` | Master kickoff khi start new project hoặc baseline research | ✅ |
| `PROJECT-INTAKE.md` | Path A trigger — new client project | ✅ |
| `RE-RESEARCH.md` | Path D trigger — re-research existing baseline (full pipeline at `pipeline/PATH-D-RESEARCH.md`) | ✅ |
| `RETRO.md` | Post-project retro generator (P9 + framework retro W08) | ✅ |
| `CHANGELOG.md` | Version history | ✅ |
| `README.md` | (file này) | ✅ |

**RULES-PREAMBLE vs AGENT-MANUAL** — quan trọng phân biệt:
- `RULES-PREAMBLE` = WHAT to obey (auto-inject mỗi run, ràng buộc agent)
- `AGENT-MANUAL` = HOW to operate (đọc 1 lần khi join, internalize toàn bộ model)
- Cả 2 đều mandatory nhưng phục vụ mục đích khác nhau

---

## 🎯 Khi Nào Dùng Cái Nào

| Scenario | Template |
|---|---|
| New client brief đến → start P0 | `PROJECT-INTAKE.md` |
| New baseline B0X cần L3 | `KICKOFF-PROMPT.md` |
| Existing baseline cần update SOTA | `RE-RESEARCH.md` |
| Project P9 done → generate retro | `RETRO.md` |

---

## 📐 Variable Convention

Templates dùng `{{VAR_NAME}}` placeholder:

| Variable | Value source |
|---|---|
| `{{PROJECT_ID}}` | `P-YYYYMM-NNN` từ intake |
| `{{BASELINE_ID}}` | B01..B15 |
| `{{INDUSTRY_ID}}` | I01..I20 |
| `{{SCOPE}}` | A/B/C/D từ proposal |
| `{{ICP}}` | A/B/C/D/E từ qualify |
| `{{AGENT_TEAM}}` | comma-separated agent IDs |

Engine orchestrator (`@../../experience/workspace/apps/orchestrator/`) inject runtime.

---

## 🔄 Update Rule

- Pattern across ≥3 projects → adapt template
- Eval-driven: nếu kickoff template tạo output low quality → tweak + version
- Diff KICKOFF-PROMPT v1 → v2 phải pass eval golden set kickoff cases

---

## 🔗 Cross-References

| Need | Path |
|---|---|
| Skill cards | `@../.agents/` |
| Pipeline phase docs (P0 invoke kickoff) | `@../../experience/workspace/docs/pipeline/P0-INTAKE.md` |
| Engine orchestrator | `@../../experience/workspace/apps/orchestrator/` |
| Strategic context | `@../../business-strategy/13-product-delivery-process.md` |

---

*Last updated: 2026-04-27 — v1.1 (RULES-PREAMBLE updated for 11 rules + harness/orchestration/lifecycle contracts)*
