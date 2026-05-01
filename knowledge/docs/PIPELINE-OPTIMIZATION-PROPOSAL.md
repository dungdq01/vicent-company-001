# Pipeline Optimization Proposal — MAESTRO [ARCHIVED]

> ⚠️ **FILE ARCHIVED** — This proposal has been applied and archived.
>
> **Archive path:** `docs/archive/PIPELINE-OPTIMIZATION-PROPOSAL.md`
>
> **Status:** ✅ APPLIED — Fully integrated into `SOP-AGENT-PROCESS.md`, `PHASE-PLAN.md`, `SYSTEM-PROMPTS.md`, and `KICKOFF-PROMPT.md`.
>
> Do NOT treat this as an active proposal. All content is now part of core architecture docs.

---

*Redirect stub — full content is at `docs/archive/PIPELINE-OPTIMIZATION-PROPOSAL.md`*

---

## Vấn đề hiện tại

### Problem 1: PhD Pipeline quá sequential — 75% idle time

```
HIỆN TẠI (1 module = 4 sequential steps):

Time:    T1        T2        T3        T4
α:       ██ WORK   ░░ idle   ░░ idle   ░░ idle
β:       ░░ idle   ██ WORK   ░░ idle   ░░ idle
γ:       ░░ idle   ░░ idle   ██ WORK   ░░ idle
σ:       ░░ idle   ░░ idle   ░░ idle   ██ WORK

→ Utilization: 25% mỗi agent
→ 3 modules × 4 steps = 12 time slots total
```

### Problem 2: Thiếu 4 roles quan trọng

| Missing Role | Impact |
|-------------|--------|
| **R-PM** | Không ai track progress, timeline, risk |
| **R-Dxx** (Domain Expert) | α research không có domain validation → use cases thiếu thực tế |
| **R-UX** | R-FE code UI mà không có UX design → redesign lại sau |
| **R-QA** | Không ai verify data quality, schema conformance, UI testing |

### Problem 3: R-FE quá passive trong Phase 1

R-FE chỉ "verify display" ở step cuối (1.8). Trong khi đó R-FE có thể:
- Build node detail tabs song song
- Improve graph interactions
- Prepare component library cho Phase 2

---

## Đề xuất 1: Overlapping PhD Pipeline

```
ĐỀ XUẤT — 3 modules chạy overlapping:

Time:    T1        T2        T3        T4        T5        T6
α:       B01-R     B02-R     B08-R     ·review·  ·review·   —
β:        —        B01-T     B02-T     B08-T     ·review·   —
γ:        —         —        B01-E     B02-E     B08-E      —
σ:        —         —         —        B01-C     B02-C     B08-C
R-FE:    UI prep   UI build  UI build  B01-show  B02-show  B08-show
R-Dxx:   B01-ctx   B02-ctx   B08-ctx   ·validate· ·validate· —

→ 6 time slots thay vì 12 → nhanh gấp 2x
→ Mỗi PhD utilization: ~60-80%
→ "review" slots = α review β's tech, β review γ's eval (cross-review)
```

### Điều kiện để overlap hoạt động

1. α output (research-report.md) PHẢI hoàn chỉnh trước khi β bắt đầu
2. Mỗi module vẫn giữ α→β→γ→σ order TRONG module đó
3. Overlap chỉ xảy ra GIỮA các modules (α làm B02 khi β làm B01)
4. Memory từ module trước feed vào module sau (σ viết memory → α đọc)

### Risk và Mitigation

| Risk | Mitigation |
|------|-----------|
| Context pollution (B01 insights leak vào B02) | Mỗi module có riêng folder reports/{MODULE_ID}/ |
| Quality drop do rush | Quality gate vẫn bắt buộc. Không pass = không move on |
| Memory chưa sẵn khi α cần | α B02 dùng partial insights từ α B01 (vẫn nhớ), σ memory đến sau |

---

## Đề xuất 2: Thêm Supporting Roles

### R-PM (Project Manager Agent)

```
Khi nào: Mọi phase từ Phase 1 trở đi
Nhiệm vụ:
  - Tạo task board cho phase (deliverables, owners, status)
  - Track progress: sau mỗi step → update status
  - Flag risks: nếu step chậm → escalate
  - Weekly summary: what done, what blocked, what next
  - Maintain PHASE-PLAN.md status dashboard
Output:
  - docs/reports/{PHASE}/progress-tracker.md (updated sau mỗi step)
```

### R-Dxx (Domain Expert) — Tham gia Research

```
HIỆN TẠI:
  α Research (alone) → β Tech → γ Evaluate → σ Consolidate

ĐỀ XUẤT:
  α Research + R-Dxx Review → β Tech → γ Evaluate + R-Dxx Validate → σ Consolidate
                ↑                                      ↑
         Domain context                         Use case validation
         (pain points,                          (are these real?
          data reality,                          would buyer pay?
          industry jargon)                       business rules correct?)

Cách hoạt động:
  1. Trước khi α bắt đầu → R-Dxx cung cấp "Domain Brief" (1 page):
     - Top 5 pain points in this industry for this capability
     - Data reality (what data actually exists vs theory)
     - Key terminology to use
     - 3 real companies that use this
  2. α incorporates domain brief vào research
  3. Sau khi γ evaluate → R-Dxx validate use cases:
     - "Use case X is realistic" / "Use case Y is theoretical"
     - Business rules check
     - KPI validation
```

### R-UX (UX Designer) — Design Before Build

```
Khi nào: Phase 0.5 (Graph Overhaul) + bất kỳ phase nào có UI work
Nhiệm vụ:
  - Design node detail panel layout (tabs, content hierarchy)
  - Design graph interaction patterns (hover, click, drag, zoom)
  - Design 3D→2D transition experience
  - Create component specs cho R-FE
  - Accessibility review
Output:
  - Wireframe / mockup descriptions (text-based, Mermaid diagrams)
  - Interaction specs per component
Quy trình:
  R-UX designs → Manager approves → R-FE implements
```

### R-QA (Quality Assurance)

```
Khi nào: Sau mỗi deliverable (Phase 0+)
Nhiệm vụ:
  - Verify JSON schema conformance (DATA-SCHEMA.md)
  - Verify CONVENTIONS.md compliance (IDs, naming, colors)
  - Test UI interactions (click, search, filter work correctly)
  - Performance check (render time, node count capacity)
  - Accessibility check (keyboard nav, screen reader)
Output:
  - QA checklist per deliverable (pass/fail per item)
  - Bug list (if any) → assigned back to owner
```

---

## Đề xuất 3: R-FE Proactive Track

```
HIỆN TẠI:
  Phase 1: R-FE sits idle → only "verify display" at step 1.8

ĐỀ XUẤT — R-FE parallel track:

While α→β→γ→σ research B01:
  R-FE works on:
  ├── Improve NodeOverview.tsx (better content rendering)
  ├── Build NodeTechStack.tsx (tech stack tab with comparison table)
  ├── Build NodePipeline.tsx (pipeline diagram rendering)
  ├── Build NodeUseCases.tsx (use cases grid)
  ├── Build NodeResources.tsx (resources list with filters)
  └── Use sample/mock data until real L3 JSON arrives

When B01.json arrives:
  R-FE plugs real data into already-built components
  → Instant display, minimal integration work
```

---

## Đề xuất 4: Memory Checkpoints (không chỉ cuối)

```
HIỆN TẠI:
  Chỉ σ viết memory ở cuối (step A4)
  → Nếu session bị ngắt giữa chừng → mất context

ĐỀ XUẤT — Mỗi agent ghi partial memory:

  α completes → α ghi 3-5 bullet points vào:
    docs/reports/{MODULE_ID}/alpha-insights.md
    (top findings, surprising facts, cross-domain connections)

  β completes → β ghi vào:
    docs/reports/{MODULE_ID}/beta-decisions.md
    (tech choices + WHY, tradeoffs considered, rejected alternatives)

  γ completes → γ ghi vào:
    docs/reports/{MODULE_ID}/gamma-risks.md
    (top risks, market signals, competitive threats)

  σ consolidates ALL → final memory file:
    docs/memory/{MODULE_ID}-learnings.md
    (synthesized from alpha + beta + gamma insights)

Lợi ích:
  - Nếu session bị cut → đã có partial context
  - σ có structured input thay vì đọc 3 reports dài
  - Cross-module: α B02 có thể đọc alpha-insights.md của B01
```

---

## Đề xuất 5: Full Team Composition Per Phase

### Phase 0 (Foundation) — Giữ nguyên (đã complete)

```
Manager, R-β, R-FE, R-σ  (4 agents — đủ cho skeleton)
```

### Phase 0.5 (Graph Overhaul) — Thêm R-UX

```
Manager, R-β, R-FE, R-UX, R-σ  (5 agents)

R-UX: Design 3D galaxy + 2D exploration + transitions TRƯỚC khi R-FE code
R-β: Code review + performance review
R-σ: Document new graph architecture
```

### Phase 1 (First 3 Baselines) — Full research team

```
Manager, R-α, R-β, R-γ, R-σ, R-FE, R-PM, R-Dxx  (8 agents)

NEW: R-PM tracks progress across 3 modules
NEW: R-Dxx provides domain brief + validates use cases
NEW: R-FE builds UI components in parallel (proactive)
```

### Phase 2 (All 15 Baselines + Industries) — Same + QA

```
Manager, R-α, R-β, R-γ, R-σ, R-FE, R-PM, R-Dxx, R-QA  (9 agents)

NEW: R-QA verify data quality at scale (15 baselines = need systematic QA)
R-Dxx rotates per industry (R-D01 for I01, R-D02 for I02, etc.)
```

### Phase 3+ (Matrix) — Lighter team per cell

```
Per matrix cell: Manager, R-α, R-γ, R-σ, R-Dxx  (5 agents)
(β not needed unless novel tech — per SOP Workflow C)
```

---

## Summary: Trước vs Sau

| Aspect | Hiện tại | Đề xuất |
|--------|---------|---------|
| PhD utilization | 25% (sequential) | 60-80% (overlapping) |
| 3 modules completion | 12 time slots | 6 time slots |
| Domain validation | ❌ None | ✅ R-Dxx at step 1 + step 3 |
| UX design | ❌ None | ✅ R-UX before R-FE codes |
| Progress tracking | ❌ None | ✅ R-PM per phase |
| Quality assurance | ❌ None | ✅ R-QA per deliverable |
| Memory resilience | σ only at end | Partial at each step |
| R-FE during research | Idle | Proactive UI building |

---

## Docs cần sửa nếu approved

| Doc | Thay đổi |
|-----|---------|
| `docs/PHASE-PLAN.md` | Thêm agent assignments mới, overlapping timeline |
| `docs/SOP-AGENT-PROCESS.md` | Thêm Domain Expert steps, partial memory protocol |
| `docs/SYSTEM-PROMPTS.md` | Thêm prompts cho R-PM, R-UX, R-QA trong research context |
| `KICKOFF-PROMPT.md` | Update §7 agent team template, thêm R-PM/R-Dxx/R-UX |

---

*Proposal v1.0 — Awaiting approval before applying changes.*
