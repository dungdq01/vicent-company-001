# _shared/templates/ — Project + Baseline + Industry Scaffolds

**Parent**: [`@../README.md`](../README.md) (L2 toolbox)

**Mục đích**: skeleton files dùng để bootstrap **new project**, **new baseline research**, hoặc **new industry node**. Cùng template cho mọi quy mô — chỉ khác phase invoke.

---

## 📂 Sub-folders (Step 4 build)

```
_shared/templates/
├── README.md                          ← (file này)
│
├── project/                           ← New project scaffold (per business-strategy/13)
│   ├── 00-intake.md                   ← P0 brief + qualify
│   ├── 01-discovery-report.md         ← P1 output
│   ├── 02-proposal.md                 ← P2 (Sprint A delivery)
│   ├── 03-architecture.md             ← P3 (Scope B+)
│   ├── 04-design-{a,b,c,d,e}.md       ← P4 (Scope C+ parallel)
│   ├── 05-planning.md                 ← P5
│   ├── 06-dev-guides.md               ← P6
│   ├── 07-qa-plan.md                  ← P7
│   ├── 08-deploy.md                   ← P8
│   ├── 09-final-package.md            ← P9 deliverable
│   ├── 99-retro.md                    ← Post-delivery retro
│   ├── _meta.json                     ← Project metadata schema
│   └── _state.json                    ← Pipeline state schema
│
├── baseline/                          ← New baseline L3 scaffold
│   ├── research-report.md             ← R-α output (template với section)
│   ├── tech-report.md                 ← R-β output
│   ├── feasibility-report.md          ← R-γ output
│   ├── final-report.md                ← R-σ consolidate
│   ├── L3.json                        ← Machine-readable summary schema
│   └── summary.md                     ← 1-page exec summary
│
└── industry/                          ← New industry node scaffold
    ├── overview.md                    ← I0X.json companion doc
    └── sub-node.md                    ← Per-cell (B × I) deep node template
```

---

## 🎯 Khi Nào Dùng

| Scenario | Source template |
|---|---|
| New project intake | `project/` (full folder) |
| New baseline research | `baseline/` (full folder) |
| Industry skeleton needed | `industry/overview.md` |
| Per-cell B × I deep | `industry/sub-node.md` |

Engine orchestrator (`@../../experience/workspace/apps/orchestrator/`) khi spawn project/baseline → copy templates → inject `{{VAR}}` → save vào `projects/{id}/` hoặc `knowledge/data/{baseline,industry}/`.

---

## 📐 Standard Cho Mọi Quy Mô

Cùng `project/` template dùng cho:
- $30 PDF MMO → instantiate full folder, chỉ fill 00-intake + 02-proposal
- $50K enterprise → fill toàn bộ 00-99 (10+ files)

→ Skeleton fixed. Engine quyết định phase nào skip dựa trên scope.

---

## 🔄 Update Rule

- Pattern across ≥3 projects → adjust template (vd: thêm section "Risk Register" vào 02-proposal.md)
- Schema change (`_meta.json`, `_state.json`) → migration script + version bump

---

## 🔗 Cross-References

| Need | Path |
|---|---|
| Pipeline phase chi tiết | `@../../experience/workspace/docs/pipeline/P{N}-*.md` |
| DoD per artifact | `@../standards/dod-per-deliverable.md` |
| Project lifecycle | `@../../projects/README.md` |
| Strategic delivery process | `@../../business-strategy/13-product-delivery-process.md` |

---

*Last updated: 2026-04-26*
