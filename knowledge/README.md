# Knowledge — MAESTRO Domain Graph

**Phòng ban**: Knowledge & R&D
**Owner**: P3 (Domain lead) | **Co-owners**: P1 (curation review), P2 (retrieval API design)
**Mission**: WHAT — kho kiến thức 15 baseline AI × 20 ngành công nghiệp, là **nguyên liệu** cho mọi project.

> 📍 Folder này là **docs only**. Code app (Next.js MAESTRO viewer) đã được xoá khỏi đây — nếu cần build viewer trong tương lai, tạo project mới trong `projects/maestro-viewer/` consume data từ folder này.

---

## 📂 Cấu Trúc (3-tier namespace v1.1)

```
knowledge/
├── README.md                       ← (bạn đang ở đây)
├── FLOW.md                         ← Workflow knowledge research (Layer 1-3 pipeline)
├── INDEX.md                        ← ⭐ Lite index (~5KB) for R-Match classifier (P0.2)
│
├── data/                           ← Source of truth (production, READ-ONLY mid-engagement per R-MAS-16)
│   ├── graph.json                  ← Graph topology (15 nodes B + 20 nodes I + edges)
│   ├── baselines/                  ← B01-B15 (canonical taxonomy in CONVENTIONS.md §5)
│   ├── industries/                 ← I01-I20 + custom I-* (e.g., I-MMO via Path D)
│   ├── matrix/                     ← B×I cross-cell deep nodes (1/300 done: B01-I06)
│   └── raw/                        ← Source taxonomy reference
│
├── staging/                        ← ⭐ NEW: Path D writes here (NOT data/) — gated by W11 K-review
│   ├── README.md
│   └── _review-queue.yaml          ← Append-only review queue
│
├── _quarantine/                    ← ⭐ NEW: demoted artifacts awaiting fix or sunset
│   └── _quarantine-log.md
│
├── _archive/                       ← Historical versions, reference only
│
└── docs/                           ← Research artifacts + memory
    ├── memory/                     ← Cumulative retro learnings (B0X/I0X-learnings.md)
    └── reports/                    ← Raw research artifacts per module
```

**3-tier namespace boundary** (per `_shared/standards/knowledge-curation.md`):
- Agent writes to `staging/` ONLY → K-review (W11) gate → promote to `data/`
- `data/` directly mutable ONLY by W08 framework retro OR W11 promotion
- `_quarantine/` for post-promotion demotion (R-σ + CEO sign)

---

## 🧭 MAESTRO Matrix — 15 × 20

| | I01 Retail | I02 Finance | ... | I06 Logistics | ... | I20 Cyber |
|---|---|---|---|---|---|---|
| **B01 Forecasting** | L1 | L2 | | **L3 ✅** | | L1 |
| **B02 DocAI** | | | | | | |
| **B03 ComputerVision** | | | | | | |
| ... | | | | | | |
| **B15 Digital Twin** | | | | | | |

- **L1** = skeleton (industry-only or baseline-only summary)
- **L2** = enriched (with case studies, benchmarks)
- **L3** = full deep node (research + tech + feasibility + consolidated final report — Phase 1 Complete)

**Status hiện tại**:
- ✅ B01 Forecasting — L3 hoàn chỉnh (50KB JSON)
- ✅ B01 × I06 (Logistics) — matrix cell có data deep
- ✅ I04 Manufacturing, I06 Logistics, I13 Transportation — L2 (~30KB each)
- ⏳ B02-B15 — pending L3 build (Phase 1-2 priority: B02, B05, B07, B08, B12)
- ⏳ I01-I03, I05, I07-I12, I14-I20 — L1 skeleton chỉ (~3KB each)

---

## 🔄 Knowledge Pipeline — How Cells Built

### Path D — Knowledge research (offensive, builds new cells)

```
P0.2 R-Match classifier reads INDEX.md → classify-match.json
   ↓ (if cell missing OR stale → trigger Path D)
D0 Trigger → D1 Scope → D2 Research (R-α/β/γ to staging/)
   ↓
D3 K-review (W11) — R-σ + CEO sign
   ↓
D4 Promote staging/ → data/  (or reject → _rejected/)
```

### W11 K-review (gate from staging → production)

Daily triage 🔴/🟡/🟢 → weekly batch review (Wed) → citation verify + PII scan + conflict check.

### Path D detail
- Pipeline: [`@../experience/workspace/docs/pipeline/PATH-D-RESEARCH.md`](../experience/workspace/docs/pipeline/PATH-D-RESEARCH.md)
- Workflow: [`@../experience/workspace/docs/workflows/W11-knowledge-review.md`](../experience/workspace/docs/workflows/W11-knowledge-review.md)
- Curation standard: [`@../_shared/standards/knowledge-curation.md`](../_shared/standards/knowledge-curation.md)

Skill cards 6 T1 agents (R-Match + R-α + R-β + R-γ + R-σ + R-eval): [`@../_shared/.agents/tier-1-research/`](../_shared/.agents/tier-1-research/)

Kickoff prompt cho cell research mới: [`@../_shared/prompts/KICKOFF-PROMPT.md`](../_shared/prompts/KICKOFF-PROMPT.md)

---

## 🔗 Cross-References

| Nội dung | Link |
|---|---|
| Skill cards (R-α, R-β, ...) | `@../_shared/.agents/` |
| Kickoff prompt cho cell research | `@../_shared/prompts/KICKOFF-PROMPT.md` |
| Pipeline chi tiết (P0-P9) | `@../experience/AGENT-WORKSPACE-PIPELINE.md` |
| Eval framework cho agent output | `@../_shared/eval/SPEC.md` |
| ICP nào dùng baseline nào (commercial mapping) | `@../business-strategy/02-customer-segments.md` |
| Pricing tier per scope | `@../business-strategy/10-pricing-sheet.md` |
| Quality DoD cho deliverable | `@../business-strategy/17-quality-standards-dod.md` |
| 7-stage SOP | `@../00-OPERATING-MANUAL.md` |

---

## 📊 Data Schema

Mỗi `baselines/B0X.json` chứa:
- `id`, `name`, `category`, `level` (L1/L2/L3)
- `summary`, `description`
- `subNodes[]` — Layer 1, 2, 3 agent reports inline
- `useCases[]`, `techStack[]`, `references[]`
- `industryApplications[]` — links to industry nodes
- `lastUpdated`, `qualityScore` (eval result)

Mỗi `industries/I0X.json` chứa:
- `id`, `name`, `level`
- `domainContext`, `keyPainPoints[]`, `regulations[]`
- `applicableBaselines[]` — links back to baseline nodes
- `caseStudies[]`

Mỗi `matrix/{B}-{I}.json` (cross-cell) chứa:
- Reference back to baseline + industry
- `domainSpecificResearch` (R-α output specific to combo)
- `verticalSolutions[]`
- Industry-specific feasibility + cost

---

## 🚀 Khi Project Mới Cần Knowledge

```
1. Project intake identifies relevant baselines + industry
   → projects/{id}/00-dossier.md ghi link tới @../knowledge/data/baselines/B0X.json
   
2. Pipeline (experience/) load context từ knowledge/data/
   → R-α reads B0X.json → enriches with project-specific brief
   
3. Sau project xong (S7 Retro):
   → New learnings update lại baseline JSON (P3 review trước commit)
   → Memory file /docs/memory/B0X-learnings.md update
   → Eval golden set có thể add 1 case mới (in `_shared/eval/golden-sets/`)
```

---

## 📝 Sửa Folder Này — Quy Tắc

1. **Source of truth** — JSON data files chỉ sửa qua P3 + LLM-judge eval pass
2. **Versioning** — mỗi major update bump `lastUpdated` + ghi changelog trong `docs/CHANGELOG.md`
3. **Không thêm baseline** ngoài 15 cells và industry ngoài 20 cells trong Phase 1-2
4. **L3 chỉ build sau khi có ≥1 paying project chạm cell đó** — tránh research thuần lý thuyết
5. **Propagation** — adding/updating/sunsetting knowledge nodes → follow `@../_shared/standards/change-management.md` **§2 Knowledge Node** checklist (staging → W11 K-review → promote → INDEX bump → notify pinned projects). KHÔNG ghi trực tiếp `data/` (vi phạm R-MAS-16 + curation gate).

---

## 🚫 Anti-Pattern

- ❌ Đặt code app trong folder này — code đi vào `projects/`
- ❌ Đặt skill cards → `_shared/.agents/`
- ❌ Đặt pipeline workflow → `experience/`
- ❌ Đặt commercial pricing per baseline → `business-strategy/10`
- ❌ Build L3 cho ngành chưa có buyer interest

---

*Last updated: 2026-04-28 — v1.1 (added staging/ + _quarantine/ + INDEX.md + R-Match P0.2 classifier integration + W11 K-review gate)*
