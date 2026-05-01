# unis-scp — Legacy Engagement (Pre-Framework)

> **Status**: Pre-framework engagement (started before v1.1 restructure 2026-04-27). Follows ad-hoc structure, NOT framework template.
>
> **Active**: M00 imported 2026-04-23 (35K cells E2E), M11-M28 in flight per memory `project_unis_v2_migration`.

---

## Why this folder doesn't follow framework

This engagement preceded the framework v1.1 restructure. It uses:
- ad-hoc folder structure (`SmartlogSCP.Backend/`, `SmartlogSCP.Frontend/`, `tests/`, `docs/`)
- direct code + docs co-located
- naming `unis-scp/` instead of `P-{YYYYMM}-{NNN}/`
- no `_meta.json` / `_state.json` / harness/ folder

Framework grandfathers existing engagements — retrofit risky for in-flight work (M23 done, M11-M28 active).

## Dual-location clarification

This project has **2 folders** by design (per L3 README distinction):

| Folder | Role |
|---|---|
| `projects/unis-scp/` (this) | **Per-client deliverable home** — code, docs, deliverable artifacts |
| `experience/workspace/projects/SupplyChain-Planing-System/` | **Engine runtime workspace** — orchestrator state, checkpoints, traces (when engine code exists) |

Memory record `project_unis_scp_v2_path` references engine-runtime path; this folder is deliverable home. Not duplicate — different purposes.

## When to retrofit

Retrofit to framework structure when:
- New module starts (M29+) → opt-in: scaffold `projects/P-{YYYYMM}-{NNN}-unis-{module}/` từ `_shared/templates/project/`
- Engagement closes → archive as-is, don't retrofit closed work
- DO NOT retrofit M00-M28 in-flight work (high risk, low benefit)

## Cross-References

- Framework template: [`@../../_shared/templates/project/`](../../_shared/templates/project/)
- Memory references: `project_unis_scp_v2_path`, `project_unis_v2_migration`, `project_unis_m00_complete`, `project_unis_m23_findings`
- Engine runtime workspace: [`@../../experience/workspace/projects/SupplyChain-Planing-System/`](../../experience/workspace/projects/SupplyChain-Planing-System/)

---
*Created 2026-04-27. Marks legacy engagement explicitly để future agents biết KHÔNG apply framework rules to this folder structure.*
