# MAESTRO — Project Flow Guide

> **Mục đích:** Tài liệu duy nhất cần đọc để hiểu dự án, onboard dev mới, và biết làm gì khi thêm/sửa bất kỳ thứ gì.
> **Ngôn ngữ:** Tiếng Việt (technical terms giữ tiếng Anh có giải thích lần đầu)
> **Cập nhật:** Mỗi khi thêm pipeline step, module, hoặc agent mới → cập nhật file này.

---

## MỤC LỤC

1. [Dự án là gì? (3 phút đọc)](#1-dự-án-là-gì)
2. [Đọc gì trước khi làm bất kỳ thứ gì](#2-đọc-gì-trước)
3. [Kiến trúc tổng quan](#3-kiến-trúc-tổng-quan)
4. [Pipeline hoàn chỉnh (A1 → A6)](#4-pipeline-hoàn-chỉnh)
5. [Thêm module mới (B01-B15 hoặc I01-I20)](#5-thêm-module-mới)
6. [Sửa hoặc thêm bước pipeline](#6-sửa-hoặc-thêm-bước-pipeline)
7. [Thêm agent mới](#7-thêm-agent-mới)
8. [File Map — "Tôi muốn làm X, đọc file Y"](#8-file-map)
9. [Checklist Onboarding Dev Mới](#9-checklist-onboarding-dev-mới)
10. [Lệnh Dev thường dùng](#10-lệnh-dev-thường-dùng)

---

## 1. Dự án là gì?

**MAESTRO** là một **Interactive AI Knowledge Graph Platform** — nền tảng web visualize kiến thức AI dưới dạng đồ thị tương tác.

```
Ma trận kiến thức: 15 AI Baselines × 20 Industries = 300 knowledge solutions

15 Baselines (B01-B15):
  B01 Forecasting | B02 Doc Intelligence | B03 Computer Vision | B04 NLP
  B05 Recommendation | B06 Optimization | B07 Anomaly Detection
  B08 Conversational AI | B09 Generative AI | B10 Agentic AI
  B11 Knowledge Graph | B12 Search & RAG | B13 Tabular ML
  B14 Speech & Audio | B15 Simulation & Digital Twin

20 Industries (I01-I20):
  I01 Retail | I02 Finance | I03 Healthcare | I04 Manufacturing
  I05 Agriculture | I06 Logistics | I07 Energy | I08 Construction
  I09 Education | I10 Telecom | I11 Legal | I12 Media
  I13 Transportation | I14 F&B | I15 Insurance | I16 Pharma
  I17 Gaming | I18 Marketing | I19 HR | I20 Cybersecurity
```

**3 tầng giao diện:**
- **Galaxy View** — 3D star field, mỗi node là hành tinh, dùng react-force-graph-3d + Three.js
- **Planetary View** — 2D Canvas, click vào 1 node → xem các sub-nodes theo quỹ đạo
- **Report Overlay** — Card carousel hiển thị nội dung research (markdown sections)

**Đối tượng người dùng:** Doanh nghiệp Việt Nam, AI team người Việt cần tham khảo AI solutions.

---

## 2. Đọc gì trước?

> **Quy tắc vàng:** Không làm gì trước khi đọc đủ docs. Docs là SSOT (Single Source of Truth — Nguồn sự thật duy nhất).

### Thứ tự đọc bắt buộc (theo độ ưu tiên):

| # | File | Đọc để biết gì | Thời gian |
|---|------|----------------|-----------|
| 1 | `FLOW.md` ← **bạn đang đọc** | Toàn cảnh, navigation | 10 phút |
| 2 | `docs/MASTER-ARCHITECTURE.md` | Tech stack, cấu trúc project, phase plan | 15 phút |
| 3 | `docs/SOP-AGENT-PROCESS.md` | Quy trình làm việc, workflows A/B/C | 20 phút |
| 4 | `docs/DATA-SCHEMA.md` | TypeScript interfaces, NormalizedNode | 10 phút |
| 5 | `docs/CONVENTIONS.md` | ID format, color palette, naming rules | 5 phút |
| 6 | `KICKOFF-PROMPT.md` | Template prompt dùng cho mỗi session | 10 phút |
| 7 | `agent-team-config.md` | Danh sách 46 agents + cách chọn team | 5 phút |

### Đọc thêm khi cần:
- `docs/PHASE-PLAN.md` — khi cần biết phase nào đang làm, task nào còn
- `docs/SYSTEM-PROMPTS.md` — prompts cho từng loại agent
- `docs/DOCUMENT-MAP.md` — H2 context loading guide: Manager dùng để biết load gì cho từng agent
- `docs/MODULE-TEST-PROTOCOL.md` — 6-layer quality gate sau mỗi module (Manager + R-σ chạy)
- `.agents/tier-X/R-XX-xxx.md` — skill card của agent cụ thể
- `docs/memory/` — lịch sử research của từng module đã làm

---

## 3. Kiến trúc tổng quan

### 3.1 Data Flow (luồng dữ liệu)

```
┌─────────────────────────────────────────────────────────┐
│                    RESEARCH PHASE                        │
│  Agents → docs/reports/{MODULE_ID}/*.md                 │
│  R-σ synthesizes → {module}_draft.json                  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              NORMALIZATION (Step A5)                     │
│  R-BE runs normalizeNode()                              │
│  Input:  {module}_draft.json (raw, inconsistent)        │
│  Output: data/baselines/{id}.json  (PRODUCTION READY)   │
│          data/industries/{id}.json (PRODUCTION READY)   │
│  Code:   src/lib/normalize-node.ts                      │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   API LAYER                              │
│  GET /api/nodes/[id]                                    │
│  → Reads file → normalizeNode() (safety net) → JSON     │
│  Code: src/app/api/nodes/[id]/route.ts                  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND                                │
│  Galaxy View (3D)  → react-force-graph-3d + Three.js    │
│  Planetary View    → Canvas 2D (orbital layout)         │
│  Report Overlay    → MarkdownRenderer card carousel     │
│  State:            Zustand (viewMode, selectedNode)     │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Cấu trúc thư mục quan trọng

```
maestro-knowledge-graph/
│
├── FLOW.md                    ← Bạn đang đọc
├── KICKOFF-PROMPT.md          ← Template prompt cho mỗi session mới
├── agent-team-config.md       ← Danh sách 46 agents
│
├── docs/
│   ├── MASTER-ARCHITECTURE.md ← Tech stack, project structure (SSOT)
│   ├── PHASE-PLAN.md          ← Phase dependencies, task list
│   ├── DATA-SCHEMA.md         ← TypeScript interfaces + NormalizedNode
│   ├── SOP-AGENT-PROCESS.md   ← Workflows A/B/C, quy trình agent
│   ├── CONVENTIONS.md         ← ID format, colors, naming
│   ├── SYSTEM-PROMPTS.md      ← Prompts cho từng loại agent
│   └── memory/                ← Learning notes sau mỗi module
│       ├── README.md
│       └── B01-learnings.md   ← Ví dụ
│
├── .agents/
│   ├── tier-1-research/       ← R-α, R-β, R-γ, R-σ (4 agents)
│   ├── tier-2-engineering/    ← R-BE, R-FE, R-MLE... (17 agents)
│   ├── tier-3-domain/         ← R-D01 → R-D20 (20 agents)
│   └── tier-4-delivery/       ← R-PM, R-SA, R-BA, R-UX, R-TC (5 agents)
│
├── data/
│   ├── graph.json             ← Toàn bộ nodes + edges cho graph
│   ├── baselines/             ← B01-B15 knowledge JSONs
│   └── industries/            ← I01-I20 knowledge JSONs
│
├── src/
│   ├── app/
│   │   ├── api/nodes/[id]/    ← API route (normalize + serve)
│   │   └── ...
│   ├── components/
│   │   ├── graph/             ← GalaxyView, PlanetaryView
│   │   ├── node/              ← NodeDetailPanel, ReportOverlay, SubNodeDetail
│   │   └── ui/                ← shadcn/ui + MarkdownRenderer
│   ├── lib/
│   │   └── normalize-node.ts  ← normalizeNode() function (Step A5)
│   ├── stores/
│   │   └── graph-store.ts     ← Zustand state (viewMode, selectedNode)
│   └── types/
│       └── node.ts            ← NormalizedNode interface
│
└── docs/reports/              ← Raw research output từ agents
    ├── B01/
    │   ├── research-report.md
    │   ├── tech-report.md
    │   ├── feasibility-report.md
    │   ├── R-MLE-notes.md
    │   ├── R-DE-notes.md
    │   └── final-report.md
    └── ...
```

---

## 4. Pipeline hoàn chỉnh

Mỗi knowledge module (B01-B15 hoặc I01-I20) đi qua **6 bước**:

```
┌──────────────────────────────────────────────────────────────┐
│  LAYER 1 — ACADEMIC (sequential: A1 → A2 → A3)              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step A1: R-α (Dr. Archon) — RESEARCH                       │
│    Input:  Task assignment + baseline docs                   │
│    Output: docs/reports/{ID}/research-report.md             │
│    Nội dung: SOTA algorithms, math foundations, papers       │
│                                                              │
│  Step A2: R-β (Dr. Praxis) — TECH ANALYSIS                  │
│    Input:  A1 output + task assignment                       │
│    Output: docs/reports/{ID}/tech-report.md                 │
│    Nội dung: Tech stack, pipeline architecture, code patterns│
│                                                              │
│  Step A3: R-γ (Dr. Sentinel) — EVALUATION                   │
│    Input:  A1+A2 output + task assignment                    │
│    Output: docs/reports/{ID}/feasibility-report.md          │
│    Nội dung: Feasibility score, market, risks, competitors  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  LAYER 2 — PRACTICAL (parallel, runs alongside Layer 1)     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Manager chọn 5-12 roles từ .agents/ catalog                │
│  (Tier 2 engineering + Tier 3 domain + Tier 4 delivery)     │
│  Mỗi role viết từ góc nhìn chuyên môn của mình             │
│  Output: docs/reports/{ID}/{ROLE_ID}-notes.md               │
│                                                              │
│  Ví dụ B01 Forecasting:                                     │
│    R-MLE-notes.md, R-DE-notes.md, R-BE-notes.md            │
│    R-DO-notes.md, R-FE-notes.md, R-D06-notes.md (Logistics)│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  LAYER 3 — CONSOLIDATION                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step A4: R-σ (Ms. Scribe) — CONSOLIDATION                  │
│    Input:  TẤT CẢ Layer 1 + Layer 2 outputs                 │
│    Output: docs/reports/{ID}/final-report.md                │
│            data/baselines/{id}_draft.json  ← còn raw       │
│            data/graph.json (cập nhật)                       │
│            docs/memory/{ID}-learnings.md                    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  NORMALIZATION (mới thêm)                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step A5: R-BE — NORMALIZATION                              │
│    Input:  {id}_draft.json + docs/DATA-SCHEMA.md §8         │
│    Process: Validate fields, fix colors, fill defaults,     │
│             chuẩn hóa field names, set metadata             │
│    Output: data/baselines/{id}.json (PRODUCTION READY)      │
│    Code:   src/lib/normalize-node.ts → normalizeNode()      │
│    Note:   API cũng chạy normalizeNode() tự động (safety)   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  VERIFICATION                                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step A6: R-FE — DISPLAY VERIFICATION                       │
│    Input:  Production JSON file                             │
│    Task:   Verify hiển thị đúng trên Galaxy → Planetary     │
│            → Report Overlay                                 │
│    Output: Sign-off hoặc bug report cho R-BE                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

> **Chi tiết đầy đủ:** `docs/SOP-AGENT-PROCESS.md` → Workflow A (Section 3)

---

## 5. Thêm module mới

### Khi nào dùng?
- Thêm 1 Baseline mới (B01-B15 hoặc B16+)
- Thêm 1 Industry mới (I01-I20 hoặc I21+)
- Upgrade depth level: L1 → L2 → L3

### Checklist từng bước:

```
□ BƯỚC 1 — CHUẨN BỊ
  □ Xác nhận MODULE_ID (VD: B01, I06)
  □ Đọc PHASE-PLAN.md → task nào cần làm cho module này
  □ Chạy 7-Stage Pipeline Coverage Check (agent-team-config.md §IV.5)
  □ Tạo thư mục: docs/reports/{MODULE_ID}/

□ BƯỚC 2 — KICKOFF
  □ Copy template từ KICKOFF-PROMPT.md
  □ Điền đầy đủ {{...}} placeholders
  □ Dùng prompt để bắt đầu conversation mới với Manager

□ BƯỚC 3 — LAYER 1 (Academic, sequential)
  □ Dispatch Step A1 → R-α → docs/reports/{ID}/research-report.md
  □ Review A1 output (R-γ reviews)
  □ Dispatch Step A2 → R-β → docs/reports/{ID}/tech-report.md
  □ Review A2 output (R-α reviews)
  □ Dispatch Step A3 → R-γ → docs/reports/{ID}/feasibility-report.md
  □ Review A3 output (R-β reviews)

□ BƯỚC 4 — LAYER 2 (Practical, parallel)
  □ Manager chọn 5-12 roles phù hợp (xem agent-team-config.md §IV.2)
  □ Dispatch tất cả → mỗi role tạo {ROLE_ID}-notes.md
  □ Chạy song song với Layer 1 nếu có thể

□ BƯỚC 5 — LAYER 3 (Consolidation)
  □ Dispatch Step A4 → R-σ
  □ R-σ tạo: final-report.md + {id}_draft.json + memory file
  □ Manager review final-report.md

□ BƯỚC 6 — NORMALIZATION (Step A5)
  □ Dispatch Step A5 → R-BE
  □ R-BE chạy normalizeNode() validate draft JSON
  □ Output: data/baselines/{id}.json hoặc data/industries/{id}.json
  □ Update: data/graph.json (thêm node + edges mới)
  □ Verify: JSON conforms to NormalizedNode (src/types/node.ts)

□ BƯỚC 7 — DISPLAY VERIFICATION (Step A6)
  □ R-FE kiểm tra node hiển thị đúng trên platform
  □ Galaxy: node xuất hiện với đúng icon + color
  □ Planetary: click vào → planetary view mở
  □ Report: content sections render đúng

□ BƯỚC 8 — CLOSE
  □ R-σ archive: update docs/memory/{ID}-learnings.md
  □ Manager update PHASE-PLAN.md status → ✅ DONE
  □ Git commit: "data: add {MODULE_ID} at L{X} depth"
```

### Files được tạo/cập nhật sau mỗi module:

| File | Action | Agent |
|------|--------|-------|
| `docs/reports/{ID}/research-report.md` | Tạo mới | R-α |
| `docs/reports/{ID}/tech-report.md` | Tạo mới | R-β |
| `docs/reports/{ID}/feasibility-report.md` | Tạo mới | R-γ |
| `docs/reports/{ID}/{ROLE_ID}-notes.md` | Tạo mới (×N) | Layer 2 roles |
| `docs/reports/{ID}/final-report.md` | Tạo mới | R-σ |
| `data/baselines/{id}.json` hoặc `data/industries/{id}.json` | Tạo mới | R-BE |
| `data/graph.json` | Cập nhật (thêm node + edges) | R-σ + R-BE |
| `docs/memory/{ID}-learnings.md` | Tạo mới | R-σ |
| `docs/PHASE-PLAN.md` | Cập nhật status | Manager |

---

## 6. Sửa hoặc thêm bước Pipeline

### Khi nào cần làm điều này?
- Thêm bước xử lý mới vào Workflow A/B/C
- Thay đổi thứ tự steps
- Thêm validation hoặc transformation mới

### Quy tắc: **Pipeline là distributed system** — định nghĩa nằm ở NHIỀU file. Sửa 1 chỗ = phải sửa TẤT CẢ chỗ sau:

```
KHI THÊM/SỬA PIPELINE STEP:

□ 1. docs/SOP-AGENT-PROCESS.md
      → Định nghĩa chính thức (Workflow A, B, hoặc C)
      → Thêm Step chi tiết: Input, Process, Output, Exit criteria
      → Cập nhật flow diagram (ASCII art)

□ 2. docs/MASTER-ARCHITECTURE.md
      → Section 6.3 "Agent Assignment Per Task Type"
      → Cập nhật summary steps A1→AN

□ 3. KICKOFF-PROMPT.md
      → §6b "Multi-Layer Research Model" (LAYER/STEP block)
      → Phase example: Ví dụ 2 dependency graph + deliverables list
      → §5 "Tech Constraints" nếu step liên quan đến code

□ 4. FLOW.md ← file này
      → Section 4 "Pipeline hoàn chỉnh" (diagram + bảng)
      → Section 5 checklist nếu thêm step cho Workflow A
      → Section 8 File Map nếu tạo file/folder mới

□ 5. docs/DATA-SCHEMA.md (nếu step thay đổi data format)
      → Cập nhật Section 8 NormalizedNode
      → Thêm/sửa TypeScript interface

□ 6. Code implementation (nếu step có code)
      → src/lib/ — utility functions
      → src/app/api/ — API changes
      → src/types/ — TypeScript types

□ 7. Agent skill cards (nếu step giao cho agent mới)
      → .agents/tier-X/{role}.md
      → Thêm vào Responsibilities section
```

### Ví dụ: Thêm Step A5.5 "Quality Gate tự động"

```
Scenario: Muốn thêm bước tự động check nội dung đủ độ sâu
          sau normalization, trước khi R-FE verify.

1. SOP-AGENT-PROCESS.md:
   → Thêm "Step A5.5: R-QA — Automated Quality Check"
   → Định nghĩa: Input = production JSON, Check = depthLevel vs content
   → Output: QA report + PASS/FAIL

2. MASTER-ARCHITECTURE.md §6.3:
   → Thêm "Step A5.5: R-QA — Quality check PRODUCTION JSON"

3. KICKOFF-PROMPT.md §6b:
   → Thêm "STEP A5.5 — QA" vào STEP block

4. FLOW.md (file này):
   → Cập nhật Section 4 pipeline diagram
   → Cập nhật Section 5 checklist (thêm □ Step A5.5)

5. Code:
   → src/lib/quality-gate.ts → checkNodeQuality()

6. agent-team-config.md (nếu thêm R-QA vào Layer 2 mandatory)
```

---

## 7. Thêm agent mới

### Khi nào?
- Thêm 1 industry mới ngoài I01-I20
- Thêm 1 engineering specialty mới
- Tách 1 role hiện tại thành 2 chuyên biệt hơn

### Checklist:

```
□ BƯỚC 1 — Tạo skill card
  □ Xác định tier phù hợp (1/2/3/4)
  □ Tạo file: .agents/tier-X/{ROLE_ID}-{name}.md
  □ Dùng skill card hiện tại làm template (VD: R-D01-retail-expert.md)
  □ Điền đầy đủ sections:
     - Identity (role, industry, seniority)
     - Domain Knowledge / Core Skills
     - AI Applications / Responsibilities
     - Constraints (BẮT BUỘC có ## LANGUAGE block)
     - Collaboration (reports_to, works_with, sends_output_to)

□ BƯỚC 2 — Đăng ký vào catalog
  □ agent-team-config.md → thêm vào bảng Section I (tier tương ứng)
  □ Mô tả ngắn gọn core expertise

□ BƯỚC 3 — Cập nhật docs liên quan
  □ docs/MASTER-ARCHITECTURE.md → cập nhật số lượng agents
  □ KICKOFF-PROMPT.md §6b → cập nhật số agents trong catalog reference
  □ FLOW.md (file này) → cập nhật Section 3.2 hoặc Section 8 nếu cần

□ BƯỚC 4 — Verify language policy
  □ Skill card PHẢI có "### LANGUAGE" block trong "## Constraints"
  □ Đọc CONVENTIONS.md §9 để copy đúng format
```

### LANGUAGE block bắt buộc cho mọi skill card:

> **Quy tắc 2-phase:** Research agents viết bằng tiếng Anh. Chỉ R-σ (Ms. Scribe) dịch sang tiếng Việt.
> See `docs/CONVENTIONS.md` §9 — Two-Phase Language Model.

**Cho Research/Engineering/Domain agents (Tier 1 R-α/β/γ, Tier 2, Tier 3, Tier 4):**

```markdown
## Constraints

### LANGUAGE
- **ALL output in English** — research, analysis, notes
- Do NOT translate — R-σ (Ms. Scribe) is the sole translation layer
- Technical terms, code, variable names remain in English
- See `docs/CONVENTIONS.md` Section 9 for full language policy

- ❌ KHÔNG [giới hạn phạm vi của role này]
- ✅ Focus on [trách nhiệm chính của role này]
```

**Chỉ dùng cho R-σ (Ms. Scribe):**

```markdown
## Constraints

### LANGUAGE
- **ALL final output MUST be in Vietnamese (Tiếng Việt)** — you are the sole translation layer
- Receives English inputs from α, β, γ and all Layer 2 agents — translate everything
- Technical terms may stay in English with Vietnamese explanation on first mention
- Code snippets and variable names remain in English
- Knowledge node JSON text fields MUST be in Vietnamese
- See `docs/CONVENTIONS.md` Section 9 for full language policy
```

---

## 8. File Map

> "Tôi muốn làm/biết X → Đọc file Y"

| Tôi muốn... | Đọc file |
|-------------|----------|
| Hiểu toàn bộ dự án | `FLOW.md` (file này) |
| Biết tech stack, project structure | `docs/MASTER-ARCHITECTURE.md` |
| Biết phase nào đang làm, task nào còn | `docs/PHASE-PLAN.md` |
| Làm research module | `docs/SOP-AGENT-PROCESS.md` §3 Workflow A |
| Build UI/feature | `docs/SOP-AGENT-PROCESS.md` §4 Workflow B |
| Điền data vào matrix cell | `docs/SOP-AGENT-PROCESS.md` §5 Workflow C |
| Biết format ID (B01, I06) | `docs/CONVENTIONS.md` §1 |
| Biết màu sắc theme | `docs/CONVENTIONS.md` §7 |
| Biết ngôn ngữ policy | `docs/CONVENTIONS.md` §9 |
| Biết TypeScript interfaces | `docs/DATA-SCHEMA.md` |
| Biết NormalizedNode (API output) | `docs/DATA-SCHEMA.md` §8 |
| Tìm prompt cho 1 agent cụ thể | `docs/SYSTEM-PROMPTS.md` |
| Chọn đúng agent cho task | `agent-team-config.md` §IV.2 |
| Bắt đầu session mới | `KICKOFF-PROMPT.md` (copy template) |
| Đọc lịch sử research B01 | `docs/memory/B01-learnings.md` |
| Xem raw JSON của 1 node | `data/baselines/B01-forecasting.json` |
| Xem graph structure | `data/graph.json` |
| Sửa normalization logic | `src/lib/normalize-node.ts` |
| Sửa API node endpoint | `src/app/api/nodes/[id]/route.ts` |
| Sửa Galaxy 3D view | `src/components/graph/GalaxyOverview.tsx` + `StarField.ts` + `GridFloor.ts` + `ShootingStars.ts` |
| Sửa Planetary view | `src/components/graph/PlanetaryView.tsx` |
| Sửa Report overlay | `src/components/node/ReportOverlay.tsx` |
| Sửa Markdown rendering | `src/components/ui/MarkdownRenderer.tsx` |
| Sửa global state | `src/stores/graph-store.ts` |
| Thêm agent mới | `FLOW.md` §7 + `.agents/` folder |
| Thêm pipeline step | `FLOW.md` §6 (danh sách files cần sửa) |
| Thêm module mới | `FLOW.md` §5 (checklist đầy đủ) |

---

## 9. Checklist Onboarding Dev Mới

> Copy checklist này, tick từng bước trước khi bắt tay vào làm bất kỳ task nào.

```
□ HIỂU DỰ ÁN (30 phút)
  □ Đọc FLOW.md từ đầu (bạn đang làm bước này)
  □ Đọc docs/MASTER-ARCHITECTURE.md §1-§3 (tech stack + structure)
  □ Đọc docs/CONVENTIONS.md §1, §7, §9 (ID format, màu, ngôn ngữ)
  □ Chạy: npm run dev → verify app chạy được

□ HIỂU QUY TRÌNH (20 phút)
  □ Đọc docs/SOP-AGENT-PROCESS.md §1 (Universal Rules)
  □ Đọc docs/SOP-AGENT-PROCESS.md §3 (Workflow A — Research)
  □ Đọc KICKOFF-PROMPT.md §4 Rules 1-7

□ HIỂU AGENTS (15 phút)
  □ Đọc agent-team-config.md §I (Tier 1-4 catalog)
  □ Đọc skill card của các agents mình sẽ làm việc cùng
     → .agents/tier-1-research/ (R-α, R-β, R-γ, R-σ)
     → .agents/tier-2-engineering/ (roles liên quan)

□ HIỂU DATA (10 phút)
  □ Đọc docs/DATA-SCHEMA.md §8 (NormalizedNode interface)
  □ Xem mẫu: data/baselines/B01-forecasting.json
  □ Xem mẫu: data/industries/I06-logistics.json
  □ Đọc src/types/node.ts (NormalizedNode TypeScript type)

□ HIỂU CODE (10 phút)
  □ Xem src/lib/normalize-node.ts (normalization logic)
  □ Xem src/app/api/nodes/[id]/route.ts (API endpoint)
  □ Xem src/stores/graph-store.ts (Zustand state)

□ SẴN SÀNG
  □ Đọc task assignment từ Manager
  □ Xác nhận hiểu Input/Output/Scope
  □ Nếu chưa rõ → HỎI trước, không đoán
```

---

## 10. Lệnh Dev thường dùng

```bash
# Chạy dev server
npm run dev

# Build production
npm run build

# Type check (PHẢI pass trước khi commit)
npx tsc --noEmit

# Lint
npm run lint

# Test (nếu có)
npm run test
```

### Git commit convention (`docs/CONVENTIONS.md` §7.3):

```bash
feat:  thêm tính năng mới
fix:   sửa bug
data:  thêm/cập nhật knowledge node JSON
docs:  cập nhật documentation
refactor: tái cấu trúc code (không thay đổi behavior)
style: chỉ thay đổi formatting
test:  thêm/sửa tests
chore: maintenance (deps, config)

# Ví dụ:
git commit -m "data: add B01-forecasting.json at L3 depth"
git commit -m "feat: add Step A5 normalization to API route"
git commit -m "docs: update FLOW.md with new pipeline step"
```

---

## Lịch sử thay đổi

| Ngày | Thay đổi | Người làm |
|------|----------|-----------|
| 2026-03-31 | Tạo file FLOW.md lần đầu | Manager (Cascade) |
| 2026-03-31 | Fix file paths cho đúng codebase thực tế | R-FE review |

> **Quy tắc:** Mỗi khi thêm pipeline step, module, hoặc agent → cập nhật bảng này và section liên quan.

---

*FLOW.md — MAESTRO Knowledge Graph Platform*
*Ngôn ngữ: Tiếng Việt. Technical terms giữ tiếng Anh.*
