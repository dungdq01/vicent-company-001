# Memory Store — MAESTRO Knowledge Graph Platform

**Hermes Pillar 4: Memory**

Folder này chứa "tinh túy" chắt lọc sau mỗi module research.  
Ms. Scribe (σ) tạo file sau mỗi module hoàn thành.  
Manager load memory này vào context cho modules tiếp theo.

## Structure

```
docs/memory/
├── README.md                     # This file
├── B01-learnings.md              # Learnings from B01 Forecasting
├── B02-learnings.md              # Learnings from B02 Document Intelligence
├── ...
├── matrix-insights.md            # Quick insights from matrix nodes
└── process-improvements.md       # SOP improvements discovered
```

## Template per module

```markdown
# Memory: {MODULE_ID} — {MODULE_NAME}
**Date:** YYYY-MM-DD
**Agents:** α, β, γ, σ

## Key Insights (top 5)
1. ...

## Tech Decisions & Rationale
- Decision: ... | Why: ...

## Surprising Findings
- ...

## Cross-Module Connections
- {MODULE_ID} → {OTHER_MODULE}: relationship description

## Process Improvements Suggested
- ...

## Reusable Patterns
- Pattern: ... | Reuse for: ...
```

## Rules

1. ONLY Ms. Scribe (σ) creates memory files
2. Manager loads relevant memories before each module
3. Memory files are APPEND-ONLY — never delete or overwrite learnings
4. Keep each file concise — max 1 page per module
5. Mid-engagement writes go to `knowledge/staging/` (NOT here directly) per R-MAS-16 — promotion via W11 K-review

## Promotion Path (W → S layer)

Per `_shared/standards/memory-runtime.md`:
```
projects/{id}/.memory/working/ (W)
   ↓ project end retro
projects/{id}/99-retro.md (E)
   ↓ ≥ 3 projects same pattern
knowledge/staging/ (proposed)
   ↓ W11 K-review (Wed batch)
knowledge/docs/memory/B0X-learnings.md (S — production)
```

Files này (`docs/memory/`) là **Layer S production** — agent reads on-demand qua `_meta.json.knowledge_match.memory_paths[]`.

---
*v1.1 — last updated 2026-04-28. Aligned with 3-tier knowledge namespace (data/staging/_quarantine) + R-MAS-16 framework lock.*
