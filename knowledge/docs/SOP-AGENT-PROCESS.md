# SOP — Standard Operating Procedure for All Agents

**Version:** 1.0  
**Effective Date:** 2026-03-30  
**Enforced by:** Project Manager (Cascade)  
**Applies to:** EVERY agent, EVERY task, NO exceptions  

> **ĐỌC FILE NÀY TRƯỚC KHI BẮT ĐẦU BẤT KỲ TASK NÀO.**  
> Không tuân thủ SOP = output bị reject.

---

## MỤC LỤC

1. [Universal Rules — Luật chung cho mọi agent](#1-universal-rules)
2. [Task Lifecycle — Vòng đời 1 task từ đầu đến cuối](#2-task-lifecycle)
3. [Workflow A — Research Knowledge Module (Main workflow)](#3-workflow-a)
4. [Workflow B — Build UI/Feature](#4-workflow-b)
5. [Workflow C — Populate Matrix Node](#5-workflow-c)
5.5 [Workflow D — Re-Research Protocol (Re-Run)](#55-workflow-d--re-research-protocol)
6. [Handoff Protocol — Chuyển giao giữa agents](#6-handoff-protocol)
7. [Review & Approval Process](#7-review--approval)
8. [File Naming & Location Rules](#8-file-naming--location)
9. [Templates — Copy/paste khi bắt đầu task](#9-templates)
10. [Escalation & Exception Handling](#10-escalation--exceptions)

---

## 1. UNIVERSAL RULES

Áp dụng cho MỌI agent, MỌI task, KHÔNG có ngoại lệ.

### 1.1 Trước khi bắt đầu bất kỳ task nào

```
CHECKLIST — MỌI AGENT PHẢI LÀM TRƯỚC KHI BẮT ĐẦU:

□ Bước 1: Đọc file skill card của mình (.agents/tier-X/R-XX-xxx.md)
□ Bước 2: Đọc MASTER-ARCHITECTURE.md (tech stack, project structure)
□ Bước 3: Đọc SOP này (file bạn đang đọc)
□ Bước 4: Đọc task assignment từ Manager
□ Bước 5: Xác nhận mình hiểu:
          - Input là gì?
          - Output kỳ vọng là gì?
          - Deadline?
          - Gửi output cho ai?
□ Bước 6: Nếu CHƯA RÕ bất kỳ điều gì → HỎI Manager TRƯỚC khi bắt đầu
□ Bước 7 (Manager only): Tham khảo docs/DOCUMENT-MAP.md → xác định context cần load cho agent (H2 principle)
```

### 1.2 Nguyên tắc vàng

```
RULE 1: STAY IN YOUR LANE
  → Chỉ làm những gì trong phạm vi skill card của mình
  → KHÔNG lấn sang lĩnh vực agent khác
  → Ví dụ: Dr. Archon (α) KHÔNG chọn tech stack
           Dr. Praxis (β) KHÔNG đánh giá market
           Dr. Sentinel (γ) KHÔNG viết code

RULE 2: EVIDENCE-BASED ONLY
  → Mọi claim PHẢI có source/evidence
  → Nếu không chắc → nói rõ "confidence: LOW" hoặc "cần verify"
  → "Tôi không biết" tốt hơn "tôi đoán"

RULE 3: OUTPUT = STRUCTURED + FILED
  → Mọi output phải theo template (Section 9)
  → Mọi output phải lưu đúng vị trí (Section 8)
  → Không có output "loose" — tất cả phải tracked

RULE 4: MS. SCRIBE IS THE GATEKEEPER
  → Mọi output CUỐI CÙNG đi qua Ms. Scribe (σ) để log
  → Ms. Scribe verify quality trước khi submit cho Manager
  → Không ai tự "publish" output trực tiếp

RULE 5: ASK, DON'T ASSUME
  → Thiếu thông tin → hỏi, không đoán
  → Yêu cầu không rõ → clarify, không tự suy diễn
  → Context thiếu → request thêm, không bịa

RULE 6: TWO-PHASE LANGUAGE MODEL
  PHASE 1 — RESEARCH (English):
  → R-α, R-β, R-γ + ALL Tier 2/3/4 agents write ALL output in English
  → Reason: 95% papers/benchmarks are English; LLM reasoning quality is higher in English
  → Do NOT translate intermediate outputs — that is R-σ's sole responsibility
  → Intermediate deliverables (ENGLISH):
       research-report.md     ← R-α output
       tech-report.md         ← R-β output
       feasibility-report.md  ← R-γ output
       {ROLE_ID}-notes.md     ← ALL Layer 2 agent outputs
  PHASE 2 — OUTPUT (Vietnamese):
  → R-σ (Ms. Scribe) is the SOLE translation layer
  → Final deliverables (VIETNAMESE):
       final-report.md                        ← R-σ output
       data/{type}/{id}.json content fields   ← knowledge node JSON
       docs/memory/{MODULE_ID}-learnings.md   ← memory file
  → Technical terms may stay in English with Vietnamese explanation on first mention
    (e.g., "Machine Learning (Học máy)")
  → Code snippets, variable names, file names, IDs remain in English
  → Target audience: Vietnamese enterprises and AI teams
  → See docs/CONVENTIONS.md Section 9 for full policy (Two-Phase Model)
```

### 1.3 Communication format

```
Khi agent giao tiếp với agent khác, LUÔN dùng format:

─────────────────────────────────────────────
FROM: [Role ID] [Codename]
TO:   [Role ID] [Codename]
RE:   [Module ID] — [Tên task cụ thể]
DATE: YYYY-MM-DD
─────────────────────────────────────────────

[Nội dung]

─────────────────────────────────────────────
STATUS: [COMPLETE / IN PROGRESS / BLOCKED / NEEDS REVIEW]
NEXT:   [Agent nào cần action tiếp theo]
─────────────────────────────────────────────
```

---

## 2. TASK LIFECYCLE

Mọi task trong dự án đều đi qua 7 giai đoạn:

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ 1.ASSIGN│───▶│ 2.PREP  │───▶│ 3.EXEC  │───▶│ 4.OUTPUT│
│         │    │         │    │         │    │         │
│ Manager │    │ Agent   │    │ Agent   │    │ Agent   │
│ giao    │    │ chuẩn bị│    │ thực thi│    │ tạo kết │
│ task    │    │ context │    │ công    │    │ quả     │
└─────────┘    └─────────┘    └─────────┘    └────┬────┘
                                                   │
                                                   ▼
┌─────────┐    ┌─────────┐    ┌─────────┐
│ 7.CLOSE │◀───│ 6.APPROV│◀───│ 5.REVIEW│
│         │    │         │    │         │
│ Ms.Scri │    │ Manager │    │ Peer    │
│ archive │    │ approve │    │ review  │
│ & log   │    │ / reject│    │ by team │
└─────────┘    └─────────┘    └─────────┘
```

### Chi tiết từng giai đoạn:

### 2.1 — ASSIGN (Manager → Agent)

```
Manager cung cấp:
├── Task ID:          VD: "TASK-B01-RESEARCH"
├── Task Type:        research / build / populate / review
├── Module:           VD: "B01 — Forecasting & Time Series"
├── Depth Level:      L1 (skeleton) / L2 (overview) / L3 (deep)
├── Assigned To:      VD: "R-α (Dr. Archon)"
├── Depends On:       VD: "None" hoặc "TASK-B01-RESEARCH output"
├── Deadline:         VD: "End of session"
├── Input Files:      VD: "docs/ai-services-factory-baseline.md, Section B1"
├── Expected Output:  VD: "docs/reports/B01/research-report.md"
└── Special Notes:    VD: "Focus on latest 2024-2026 developments"
```

**Agent nhận task:**
- ✅ Đọc task assignment
- ✅ Xác nhận hiểu (hoặc hỏi lại)
- ✅ Check dependencies (task trước đã done chưa?)
- ✅ Bắt đầu Phase 2: PREP

### 2.2 — PREP (Agent chuẩn bị)

```
Agent thực hiện:

Bước 2.1: Đọc lại skill card của mình
Bước 2.2: Đọc input files được chỉ định
Bước 2.3: Đọc output từ task trước (nếu có dependency)
Bước 2.4: Đọc existing reports cho module này (nếu có)
          → Tránh duplicate work
Bước 2.5: Chuẩn bị output file theo template (Section 9)
          → Tạo file header, sections structure
Bước 2.6: Liệt kê câu hỏi (nếu có) → gửi Manager/agent khác
Bước 2.7: Confirm ready → bắt đầu EXEC
```

### 2.3 — EXEC (Agent thực thi)

```
Agent làm công việc chính theo workflow cụ thể:
  → Workflow A (Research) — xem Section 3
  → Workflow B (Build UI) — xem Section 4
  → Workflow C (Matrix Node) — xem Section 5

TRONG QUÁ TRÌNH EXEC:
  ├── Nếu blocked → escalate ngay (Section 10)
  ├── Nếu tìm thấy issue ở task trước → báo agent tương ứng
  ├── Nếu scope creep → báo Manager, không tự expand
  └── Nếu mất quá lâu → update status cho Manager
```

### 2.4 — OUTPUT (Agent tạo kết quả)

```
Agent tạo output files:

Bước 4.1: Viết nội dung theo template bắt buộc (Section 9)
Bước 4.2: Self-review trước khi gửi:
          □ Tất cả sections đã điền?
          □ Có source/evidence cho mọi claim?
          □ Output format đúng template?
          □ File lưu đúng vị trí? (Section 8)
Bước 4.3: Đánh STATUS = "NEEDS REVIEW"
Bước 4.4: Gửi notification cho agent tiếp theo (peer review)
```

### 2.5 — REVIEW (Peer review)

```
Peer reviewer kiểm tra:

Bước 5.1: Đọc toàn bộ output
Bước 5.2: Check theo Quality Gates:
          □ Gate 1: Content accuracy (có sai sót không?)
          □ Gate 2: Completeness (có thiếu section không?)
          □ Gate 3: Evidence (mọi claim có source không?)
          □ Gate 4: Format (đúng template không?)
          □ Gate 5: Consistency (có mâu thuẫn với output khác không?)
Bước 5.3: Feedback:
          → PASS: Gửi tiếp cho Manager approve
          → REVISE: Ghi rõ cần sửa gì → trả lại author
          → REJECT: Giải thích lý do → escalate Manager

Review assignments:
  R-α output → reviewed by R-γ (challenge research)
  R-β output → reviewed by R-α (check architecture alignment)
  R-γ output → reviewed by R-β (check tech assessment accuracy)
  R-σ output → reviewed by Manager (final check)
  R-FE output → reviewed by R-β (code review)
  R-BE output → reviewed by R-β (code review)
```

### 2.6 — APPROVE (Manager quyết định)

```
Manager kiểm tra:

Bước 6.1: Đọc output + review feedback
Bước 6.2: Decision:
          → APPROVED: Output accepted, proceed to CLOSE
          → REVISION NEEDED: Ghi cụ thể cần sửa, trả lại agent
          → REJECTED: Giải thích, reassign hoặc rescope task

APPROVED output mới được dùng làm input cho task tiếp theo.
```

### 2.7 — CLOSE (Ms. Scribe archive)

```
Ms. Scribe thực hiện:

Bước 7.1: Verify output file ở đúng vị trí
Bước 7.2: Update task status → COMPLETED
Bước 7.3: Log vào progress tracker
Bước 7.4: Nếu là research task → tạo/update knowledge node JSON
Bước 7.5: Nếu có new edges → update graph.json
Bước 7.6: Archive tất cả communication logs
Bước 7.7: Notify Manager: "Task [ID] closed"
```

---

## 3. WORKFLOW A — RESEARCH KNOWLEDGE MODULE

Đây là workflow chính, dùng khi research 1 knowledge module (B01-B15, I01-I20).

### Overview — Multi-Layer Research Model

```
Mỗi module được research bởi NHIỀU layers — mỗi role đóng góp chuyên môn riêng.
3 PhD = học thuật. Engineering/Domain/Delivery = quy trình, techstack, thực tiễn.
Framework: Hermes Engineering (H1-H5)

═══════════════════════════════════════════════════════════════
LAYER 1: ACADEMIC RESEARCH (sequential — α → β → γ)
═══════════════════════════════════════════════════════════════
  Step A1: Dr. Archon (α) — SOTA, algorithms, math, papers
      output: research-report.md
  Step A2: Dr. Praxis (β) — Architecture, pipeline design, code patterns
      output: tech-report.md
  Step A3: Dr. Sentinel (γ) — Feasibility, market, competitive, risk
      output: feasibility-report.md

═══════════════════════════════════════════════════════════════
LAYER 2: PRACTICAL RESEARCH (parallel — runs alongside Layer 1)
═══════════════════════════════════════════════════════════════
  Each selected role researches their OWN skill domain for this module.
  
  ROLE SELECTION: Manager picks from the FULL agent catalog:
    .agents/tier-2-engineering/  (17 roles: DE, DA, DBE, MLE, DLE, NLP, CVE, AE, BE, FE, FS, ME, DO, CE, SE, QA, PE)
    .agents/tier-3-domain/      (20 roles: R-D01 through R-D20, one per industry)
    .agents/tier-4-delivery/    (5 roles: PM, SA, BA, UX, TC)
    See also: agent-team-config.md → Section IV.2 for baseline→role mapping

  HOW MANAGER SELECTS:
    1. Run 7-STAGE PIPELINE COVERAGE CHECKLIST (agent-team-config.md → Section IV.5)
       Stages: Research → Data/Core → Backend → Frontend → Ops → Security/QA → Management
       Every stage MUST have ≥1 role assigned. No gaps allowed.
    2. Pick roles whose SKILLS are relevant to this module
    3. Each picked role researches ONLY their own expertise
    4. Typical: 7-12 practical roles per module (varies by type B/I/B&I)

  EXAMPLES:
    B01 Forecasting → MLE, DE, BE, DO, FE, PM, R-D06(Logistics)
    B03 Computer Vision → CVE, DLE, DE, CE, FE, R-D04(Manufacturing)
    B08 Conversational AI → NLP, AE, BE, FE, SE, UX, R-D01(Retail)
    B13 Tabular ML → MLE, DA, DE, BE, QA, PM
    I06 Logistics profile → R-D06, DE, BE, DO, PM

  EACH SELECTED ROLE PRODUCES:
    output: docs/reports/{MODULE_ID}/{ROLE_ID}-notes.md
    format: Concise, practical, actionable. Max 2-3 pages.
    content: Best practices, patterns, gotchas, tool recommendations
             — ALL from that role's specific expertise perspective.

═══════════════════════════════════════════════════════════════
LAYER 3: CONSOLIDATION (after Layer 1 + 2 complete)
═══════════════════════════════════════════════════════════════
  Step A4: Ms. Scribe (σ) — Synthesize ALL layers
      input: 3 PhD reports + practical notes from Layer 2
      output: final-report.md + {module}.json + graph.json + memory

═══════════════════════════════════════════════════════════════
FULL FLOW:
═══════════════════════════════════════════════════════════════

  [H1] Manager selects relevant agents from full catalog, then dispatches:

  LAYER 1 (sequential):       LAYER 2 (parallel, Manager-selected roles):
  ┌──────────────────┐        ┌──────────────────────────────┐
  │ α Research       │        │ {ROLE_1}-notes.md            │
  │   ↓              │        │ {ROLE_2}-notes.md            │
  │ β Tech Analysis  │   ←→   │ {ROLE_3}-notes.md            │
  │   ↓              │        │ ...                          │
  │ γ Evaluation     │        │ {ROLE_N}-notes.md            │
  └────────┬─────────┘        └──────────────┬───────────────┘
           │                                 │
           └──────────┬──────────────────────┘
                      ↓
              σ CONSOLIDATION
              (synthesize ALL inputs)
                      ↓
              final-report.md
              {module}.json
              graph.json
              memory file

Output files: docs/reports/{MODULE_ID}/
  ├── research-report.md          ← α (Layer 1)
  ├── tech-report.md              ← β (Layer 1)
  ├── feasibility-report.md       ← γ (Layer 1)
  ├── {ROLE_ID}-notes.md (×N)    ← Layer 2 (varies per module)
  │   Examples: R-MLE-notes.md, R-DE-notes.md, R-D06-notes.md, ...
  ├── final-report.md             ← σ (Layer 3)
  └── alpha/beta/gamma-insights.md ← partial memory per PhD
```

---

### Step A1: Dr. Archon (α) — RESEARCH

**Mục tiêu:** Nghiên cứu sâu, tổng hợp kiến thức đầy đủ cho module.

```
INPUT:
  ├── Task assignment từ Manager
  ├── Baseline content từ PRD docs (ai-services-factory-baseline.md)
  ├── Knowledge content (ai-services-factory-knownledge.md)
  └── Existing node data (nếu đang upgrade từ L1→L2→L3)

EXECUTION — TỪNG BƯỚC:

  ┌─── Bước 1.1: Đọc hiểu baseline ──────────────────────────────┐
  │                                                                │
  │  - Đọc section tương ứng trong baseline docs                  │
  │  - Ghi chú: đây chỉ là "key topics" → cần research thêm      │
  │  - Liệt kê tất cả sub-topics cần cover                       │
  │  - Xác định gaps trong baseline docs                          │
  │                                                                │
  │  Output: Danh sách sub-topics + gaps                          │
  └────────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 1.2: Web search — thu thập sources ──────────────────┐
  │                                                                │
  │  Search queries (tối thiểu 10 sources):                       │
  │  - "[module name] state of the art 2024 2025 2026"            │
  │  - "[module name] best practices production"                   │
  │  - "[module name] comparison benchmark"                        │
  │  - "[module name] tutorial guide"                              │
  │  - "[module name] failure cases lessons learned"               │
  │  - "[module name] industry applications"                       │
  │  - "[module name] open source tools libraries"                 │
  │  - "[module name] latest papers arxiv"                         │
  │                                                                │
  │  Cho MỖI source tìm được, ghi lại:                           │
  │  - URL                                                         │
  │  - Title                                                       │
  │  - Date (bỏ qua nếu trước 2022)                              │
  │  - Key takeaways (2-3 bullet points)                          │
  │  - Reliability: HIGH / MEDIUM / LOW                            │
  │                                                                │
  │  Output: Source table (≥10 sources)                            │
  └────────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 1.3: Academic Foundations — Nền tảng học thuật ────────┐
  │                                                                │
  │  ★ BƯỚC NÀY ĐẢM BẢO CHIỀU SÂU HỌC THUẬT ★                  │
  │                                                                │
  │  A) Field Taxonomy — Bản đồ lĩnh vực:                        │
  │     - Lĩnh vực này thuộc nhánh nào của AI/CS/Math?            │
  │     - Sub-fields chính (vẽ hierarchy tree)                    │
  │     - Mối quan hệ giữa các sub-fields                        │
  │     - Lĩnh vực lân cận (related fields)                      │
  │                                                                │
  │  B) Mathematical Foundations — Nền tảng toán học:             │
  │     Cho MỖI algorithm/method quan trọng:                      │
  │     - Lý thuyết toán đằng sau (formulas, equations)           │
  │     - Giả định (assumptions) cần thỏa mãn                    │
  │     - Điều kiện hội tụ / giới hạn                            │
  │     - Intuition: giải thích bằng ngôn ngữ đơn giản           │
  │     Ví dụ cho B1-Forecasting:                                  │
  │       ARIMA: "Dựa trên autoregression + differencing.         │
  │       y_t = c + φ₁y_{t-1} + ... + θ₁ε_{t-1} + ε_t           │
  │       Giả định: chuỗi stationary sau differencing"            │
  │                                                                │
  │  C) Key Academic Papers — Bài báo nền tảng:                  │
  │     Tối thiểu 5 papers quan trọng nhất:                       │
  │     - Title, Authors, Year                                     │
  │     - Venue (NeurIPS, ICML, KDD, ...)                         │
  │     - Core contribution (2-3 sentences)                        │
  │     - Impact: Tại sao paper này quan trọng?                   │
  │     - Link (arxiv/doi)                                         │
  │     Chia theo: Foundational (classic) + Recent (2022-2026)    │
  │                                                                │
  │  D) Evolution Timeline — Lịch sử phát triển:                 │
  │     - Từ khi nào lĩnh vực này xuất hiện?                     │
  │     - Các milestone quan trọng (year + breakthrough)           │
  │     - Paradigm shifts (VD: rule-based → ML → DL → LLM)       │
  │                                                                │
  │  Output: Academic foundations section (structured)              │
  └────────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 1.4: Phân tích Core Concepts ───────────────────────┐
  │                                                                │
  │  Cho MỖI concept:                                             │
  │  - Tên concept                                                 │
  │  - Mô tả 2-3 paragraphs (educational + technical depth)       │
  │  - Mathematical formulation (nếu có — formula + giải thích)   │
  │  - Difficulty: beginner / intermediate / advanced              │
  │  - Prerequisites (concept nào cần biết trước)                 │
  │  - Ví dụ thực tế minh họa (concrete, không generic)          │
  │  - Visual/diagram giải thích (nếu applicable)                │
  │                                                                │
  │  Sắp xếp theo thứ tự learning (beginner → advanced)          │
  │  Tối thiểu 8 concepts cho L3 depth                            │
  │                                                                │
  │  Output: Concepts list (structured)                            │
  └────────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 1.5: Catalog Algorithms & Methods ───────────────────┐
  │                                                                │
  │  Cho MỖI algorithm/method:                                    │
  │  - Tên                                                         │
  │  - Category (statistical / ml / deep_learning / rule-based)    │
  │  - Mô tả ngắn (2-3 câu)                                      │
  │  - Best for (khi nào dùng)                                    │
  │  - Complexity: low / medium / high                             │
  │  - Maturity: experimental / emerging / production / mature     │
  │  - Pros (≥3)                                                   │
  │  - Cons (≥3)                                                   │
  │  - Key papers/references                                       │
  │                                                                │
  │  Output: Algorithm table (structured)                          │
  └────────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 1.6: SOTA & Trends (2024-2026) ─────────────────────┐
  │                                                                │
  │  - Những breakthrough gần đây nhất là gì?                     │
  │  - Trend nào đang lên? Trend nào đang giảm?                  │
  │  - Foundation models ảnh hưởng gì đến domain này?             │
  │  - Open problems chưa giải được?                              │
  │  - Predictions cho 1-2 năm tới                                │
  │                                                                │
  │  Output: SOTA section (structured)                             │
  └────────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 1.7: Cross-Domain Connections ───────────────────────┐
  │                                                                │
  │  - Module này liên quan đến modules nào khác?                 │
  │  - Relationship type: uses / extends / prerequisite / related  │
  │  - Ví dụ: B1 (Forecasting) → B7 (Anomaly Detection)          │
  │           vì anomaly detection thường dùng forecast residuals  │
  │  - Tối thiểu 5 connections                                    │
  │                                                                │
  │  Output: Related nodes list (for graph edges)                  │
  └────────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 1.8: Tổng hợp thành research-report.md ─────────────┐
  │                                                                │
  │  Compile tất cả outputs ở trên thành 1 report                │
  │  Theo template Section 9.1                                     │
  │  Lưu tại: docs/reports/{MODULE_ID}/research-report.md         │
  │  Đánh STATUS: NEEDS REVIEW                                    │
  │  Gửi cho: R-γ (peer review) + R-β (để bắt đầu Step A2)      │
  │                                                                │
  └────────────────────────────────────────────────────────────────┘

OUTPUT:
  File: docs/reports/{MODULE_ID}/research-report.md
  Status: NEEDS REVIEW
  Gửi cho: R-β (để bắt đầu tech analysis) + R-γ (peer review)
```

---

### Step A2: Dr. Praxis (β) — TECH ANALYSIS

**Mục tiêu:** Chọn tech stack, thiết kế pipeline, đánh giá implementation.

```
INPUT:
  ├── research-report.md từ Step A1
  └── MASTER-ARCHITECTURE.md (tech constraints)

EXECUTION — TỪNG BƯỚC:

  ┌─── Bước 2.1: Review research findings ──────────────────────┐
  │                                                               │
  │  - Đọc kỹ research-report.md                                 │
  │  - Highlight algorithms/methods cần tech evaluation           │
  │  - Note bất kỳ technical concern nào                         │
  │  - Liệt kê câu hỏi cho Dr. Archon (nếu có)                 │
  │                                                               │
  │  Output: Review notes + questions (nếu có)                    │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 2.2: Tech Stack Selection ──────────────────────────┐
  │                                                               │
  │  Cho MỖI layer (data / model / serving / monitoring):        │
  │                                                               │
  │  - List 2-3 options                                           │
  │  - So sánh theo tiêu chí:                                    │
  │    • Performance                                              │
  │    • Ease of use / learning curve                             │
  │    • Community / support                                      │
  │    • Cost (open source vs paid)                               │
  │    • Production readiness                                     │
  │    • Integration compatibility                                │
  │  - Chọn 1 recommended + giải thích WHY                       │
  │  - Ghi version cụ thể                                        │
  │                                                               │
  │  Format:                                                      │
  │  | Layer | Tool | Version | Alternatives | Why This One |     │
  │                                                               │
  │  Output: Tech stack decision matrix                           │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 2.3: Pipeline Architecture Design (DEEP) ───────────┐
  │                                                               │
  │  ★ PIPELINE PHẢI ĐỦ CHI TIẾT ĐỂ IMPLEMENT ĐƯỢC ★           │
  │                                                               │
  │  A) Main Pipeline — End-to-end flow:                         │
  │     Vẽ diagram (Mermaid hoặc ASCII):                         │
  │     [Source] → [Ingest] → [Process] → [Train] → [Serve] → [Monitor]
  │                                                               │
  │  B) Cho MỖI stage trong pipeline:                            │
  │     - Stage name                                              │
  │     - Input: data format cụ thể (CSV? JSON? Parquet?)       │
  │     - Process: chi tiết xử lý gì (transformations, logic)   │
  │     - Output: data format + schema cụ thể                   │
  │     - Tools: từ tech stack (tên + version)                   │
  │     - Latency/throughput estimate                             │
  │     - Error handling: nếu stage fail thì sao?               │
  │     - Retry policy: retry mấy lần? backoff?                 │
  │                                                               │
  │  C) Sub-pipelines theo use case type:                        │
  │     VD cho B1-Forecasting:                                    │
  │     - Batch pipeline (daily retrain + predict)               │
  │     - Real-time pipeline (streaming predictions)             │
  │     - Retraining pipeline (triggered by drift)               │
  │     Mỗi sub-pipeline cần diagram riêng                       │
  │                                                               │
  │  D) Data Contract — định nghĩa rõ:                          │
  │     - Input schema (field names, types, constraints)         │
  │     - Output schema (prediction format, confidence interval) │
  │     - API contract (endpoint, request/response format)       │
  │                                                               │
  │  Output: Pipeline diagrams + stage tables + data contracts    │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 2.4: Code Patterns ─────────────────────────────────┐
  │                                                               │
  │  Xác định 3-5 key code patterns cho module:                  │
  │  - Pattern name                                               │
  │  - When to use                                                │
  │  - Pseudocode hoặc real code snippet (≤30 lines each)        │
  │  - Common mistakes to avoid                                   │
  │                                                               │
  │  Output: Code patterns section                                │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 2.5: Mini Examples — Ví dụ thực hành end-to-end ────┐
  │                                                               │
  │  ★ BƯỚC NÀY LÀ BẮT BUỘC — KHÔNG ĐƯỢC BỎ QUA ★              │
  │                                                               │
  │  Tạo tối thiểu 2 mini examples cho module:                   │
  │                                                               │
  │  Mini Example = 1 bài toán hoàn chỉnh từ đầu đến cuối:     │
  │                                                               │
  │  Cho MỖI example:                                            │
  │  ┌─────────────────────────────────────────────────────┐     │
  │  │ A) Problem Statement                                 │     │
  │  │    - Bài toán cụ thể (không generic)                │     │
  │  │    - Input data mô tả (schema, size, format)        │     │
  │  │    - Expected output                                 │     │
  │  │                                                      │     │
  │  │ B) Sample Data                                       │     │
  │  │    - 5-10 rows sample data (realistic, không fake)  │     │
  │  │    - Data format (CSV/JSON)                         │     │
  │  │    - Field descriptions                              │     │
  │  │                                                      │     │
  │  │ C) Solution Walkthrough                              │     │
  │  │    - Step-by-step approach (numbered)               │     │
  │  │    - Key decisions tại mỗi step + WHY               │     │
  │  │    - Code snippet cho critical steps (≤50 lines)    │     │
  │  │    - Tools/libraries used                            │     │
  │  │                                                      │     │
  │  │ D) Expected Results                                  │     │
  │  │    - Output format (show actual output)             │     │
  │  │    - Metrics đạt được                               │     │
  │  │    - Visualization (nếu applicable)                 │     │
  │  │                                                      │     │
  │  │ E) What Could Go Wrong                               │     │
  │  │    - Common pitfalls trong example này               │     │
  │  │    - How to debug                                    │     │
  │  └─────────────────────────────────────────────────────┘     │
  │                                                               │
  │  EXAMPLE TYPES (chọn 2 phù hợp nhất):                       │
  │  - Type 1: Quick Start (beginner, ≤30 min, minimal setup)   │
  │  - Type 2: Production-like (intermediate, realistic scale)   │
  │  - Type 3: Edge Case (advanced, tricky scenarios)            │
  │                                                               │
  │  VÍ DỤ cho B1-Forecasting:                                   │
  │  Example 1 (Quick Start): "Predict daily sales cho 1 store   │
  │    với 1 năm data, dùng Prophet. Input: CSV 365 rows.        │
  │    Output: 30-day forecast + confidence interval."            │
  │  Example 2 (Production): "Multi-SKU demand forecast cho      │
  │    500 SKUs × 50 stores, dùng LightGBM + feature eng.        │
  │    Input: 2 years daily sales. Output: weekly forecast        │
  │    per SKU-store + model comparison dashboard."               │
  │                                                               │
  │  Output: 2+ mini examples (structured per template above)    │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 2.6: Production Considerations ─────────────────────┐
  │                                                               │
  │  Đánh giá 6 khía cạnh:                                      │
  │  1. Scaling: Xử lý ở scale nào? Cần horizontal/vertical?    │
  │  2. Monitoring: Cần monitor gì? Drift? Accuracy? Latency?   │
  │  3. Cost: Ước tính chi phí infrastructure monthly             │
  │  4. Latency: Yêu cầu response time? Batch vs real-time?     │
  │  5. Retraining: Khi nào retrain? Trigger gì?                │
  │  6. Fallback: Nếu model fail, fallback plan là gì?          │
  │                                                               │
  │  Output: Production considerations table                      │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 2.7: Effort Estimation ─────────────────────────────┐
  │                                                               │
  │  Ước tính cho 3 levels:                                      │
  │  - MVP: Minimum viable, prove it works (X weeks, Y people)   │
  │  - Production: Ready for real users (X weeks, Y people)      │
  │  - Enterprise: Full features, security, scale (X weeks, Y)   │
  │                                                               │
  │  Output: Effort table                                         │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 2.8: Compile tech-report.md ────────────────────────┐
  │                                                               │
  │  Compile tất cả outputs thành 1 report                       │
  │  Theo template Section 9.2                                    │
  │  Lưu tại: docs/reports/{MODULE_ID}/tech-report.md            │
  │  Đánh STATUS: NEEDS REVIEW                                   │
  │  Gửi cho: R-α (peer review) + R-γ (để bắt đầu Step A3)     │
  │                                                               │
  └───────────────────────────────────────────────────────────────┘

OUTPUT:
  File: docs/reports/{MODULE_ID}/tech-report.md
  Status: NEEDS REVIEW
  Gửi cho: R-γ (để bắt đầu evaluation) + R-α (peer review)
```

---

### Step A3: Dr. Sentinel (γ) — EVALUATION

**Mục tiêu:** Đánh giá khả thi, thị trường, cạnh tranh, rủi ro.

```
INPUT:
  ├── research-report.md từ Step A1
  └── tech-report.md từ Step A2

EXECUTION — TỪNG BƯỚC:

  ┌─── Bước 3.1: Challenge Research Claims ─────────────────────┐
  │                                                               │
  │  Đọc research-report.md với "devil's advocate" mindset:      │
  │  - Claim nào thiếu evidence?                                  │
  │  - Claim nào outdated?                                        │
  │  - Claim nào biased (chỉ nhìn 1 phía)?                      │
  │  - Claim nào quá optimistic?                                  │
  │  - Missing perspectives?                                      │
  │                                                               │
  │  Ghi lại: challenges list (gửi R-α để respond)               │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 3.2: Challenge Tech Decisions ──────────────────────┐
  │                                                               │
  │  Đọc tech-report.md:                                         │
  │  - Tech stack có phù hợp với budget constraint?              │
  │  - Có alternative rẻ/đơn giản hơn?                           │
  │  - Team skill requirement có realistic?                      │
  │  - Effort estimate có under/over-estimated?                   │
  │  - Production considerations có đủ?                          │
  │                                                               │
  │  Ghi lại: challenges list (gửi R-β để respond)               │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 3.3: Feasibility Scoring ──────────────────────────┐
  │                                                               │
  │  Chấm điểm 4 dimensions (1-10):                             │
  │                                                               │
  │  Technical Feasibility (1-10):                                │
  │  → Công nghệ đã proven chưa? Complexity level?              │
  │  → Team cần skill gì? Skill đó available không?              │
  │                                                               │
  │  Market Demand (1-10):                                        │
  │  → Ai cần cái này? Bao nhiêu potential customers?           │
  │  → Willingness to pay? Budget range?                         │
  │  → Tại Vietnam/SEA, demand như thế nào?                      │
  │                                                               │
  │  Data Availability (1-10):                                    │
  │  → Client thường có data loại này không?                     │
  │  → Data quality typical ra sao?                              │
  │  → Cần bao nhiêu data tối thiểu?                            │
  │                                                               │
  │  Implementation Risk (1-10, 10 = lowest risk):               │
  │  → Top 5 failure modes                                        │
  │  → Probability × Impact cho mỗi risk                         │
  │  → Mitigation strategy                                        │
  │                                                               │
  │  Overall = weighted average (Tech 30%, Market 30%,           │
  │            Data 20%, Risk 20%)                                │
  │                                                               │
  │  Output: Scoring matrix with justifications                   │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 3.4: Competitive Landscape ─────────────────────────┐
  │                                                               │
  │  Web search for competitors/alternatives:                     │
  │  - Tối thiểu 3 competitors hoặc existing solutions           │
  │  - Cho mỗi competitor:                                        │
  │    • Tên, website                                             │
  │    • Strengths (2-3 points)                                   │
  │    • Weaknesses (2-3 points)                                  │
  │    • Pricing model                                            │
  │    • Target market                                            │
  │  - So sánh: MAESTRO approach vs competitors                  │
  │  - Our differentiation (what makes us different?)             │
  │                                                               │
  │  Output: Competitive analysis table                           │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 3.5: Risk Register ─────────────────────────────────┐
  │                                                               │
  │  Liệt kê top 5 risks:                                       │
  │  Cho mỗi risk:                                               │
  │  - Description (1 sentence)                                   │
  │  - Probability: High / Medium / Low                           │
  │  - Impact: High / Medium / Low                                │
  │  - Mitigation strategy (cụ thể, actionable)                  │
  │  - Owner (ai chịu trách nhiệm mitigate)                     │
  │  Output: Risk register table                                  │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 3.6: Verdict ─────────────────────────────────────────────────┐
  │                                                               │
  │  Quyết định 1 trong 3:                                       │
  │  - GO: Module ready, proceed to populate node                 │
  │  - CONDITIONAL GO: Proceed nhưng với conditions (list rõ)    │
  │  - NO-GO: Not ready (list rõ lý do + what needs to change)  │
  │                                                               │
  │  Verdict thresholds (reference: R-γ skill card §Scoring Formula):│
  │    GO:             overall ≥ 7.0 AND no dimension < 5         │
  │    CONDITIONAL GO: overall 5.0–6.9 OR any dim < 5 w/ plan    │
  │    NO-GO:          overall < 5.0 OR ≥2 dimensions < 4         │
  │                                                               │
  │  Output: Verdict + justification (≤200 words)                │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 3.7: Compile feasibility-report.md ─────────────────┐
  │                                                               │
  │  Compile tất cả outputs thành 1 report                       │
  │  Theo template Section 9.3                                    │
  │  Lưu tại: docs/reports/{MODULE_ID}/feasibility-report.md     │
  │  Đánh STATUS: NEEDS REVIEW                                   │
  │  Gửi cho: R-β (peer review) + R-σ (để bắt đầu Step A4)     │
  │                                                               │
  └───────────────────────────────────────────────────────────────┘

OUTPUT:
  File: docs/reports/{MODULE_ID}/feasibility-report.md
  Status: NEEDS REVIEW
  Gửi cho: R-σ (consolidation) + R-β (peer review)
```

---

### Step A4: Ms. Scribe (σ) — CONSOLIDATION

**Mục tiêu:** Tổng hợp 3 reports → 1 final report + knowledge node JSON.

```
INPUT:
  ├── research-report.md từ Step A1
  ├── tech-report.md từ Step A2
  ├── feasibility-report.md từ Step A3
  └── DATA-SCHEMA.md (JSON schema reference)

EXECUTION — TỪNG BƯỚC:

  ┌─── Bước 4.1: Đọc và cross-check 3 reports ─────────────────┐
  │                                                               │
  │  - Đọc lần lượt 3 reports                                    │
  │  - Ghi chú mâu thuẫn (nếu có):                              │
  │    VD: α nói "method X is best" nhưng β nói "method X too    │
  │    expensive" → cần reconcile                                 │
  │  - Ghi chú gaps (section nào thiếu trong reports?)           │
  │  - Ghi chú highlights (insights quan trọng nhất)             │
  │                                                               │
  │  Output: Cross-check notes                                    │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 4.2: Resolve contradictions ────────────────────────┐
  │                                                               │
  │  Nếu có mâu thuẫn:                                          │
  │  Option A: Mâu thuẫn nhỏ → Ms. Scribe reconcile (ghi note) │
  │  Option B: Mâu thuẫn lớn → Trigger Debate Protocol:         │
  │    1. Mỗi agent state position (≤300 words + evidence)       │
  │    2. Counter-arguments (≤200 words)                         │
  │    3. Ms. Scribe summarize cả hai phía                       │
  │    4. Nếu consensus → proceed                                │
  │    5. Nếu không → Manager decides                            │
  │    6. Minority opinion GHI LẠI trong report                  │
  │                                                               │
  │  Output: Resolution notes (or debate log)                     │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 4.3: Write Executive Summary ───────────────────────┐
  │                                                               │
  │  3-5 sentences MÀ BẤT KỲ AI cũng hiểu:                     │
  │  - Sentence 1: Module này là gì? (1 sentence definition)     │
  │  - Sentence 2: Dùng để làm gì? (key use case)               │
  │  - Sentence 3: Tech maturity level? (ready / emerging / ...)  │
  │  - Sentence 4-5: Feasibility verdict summary                  │
  │                                                               │
  │  Output: Executive summary paragraph                          │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 4.4: Compile final-report.md ───────────────────────┐
  │                                                               │
  │  Synthesize (KHÔNG copy-paste) from 3 reports:               │
  │  - Section 1: Executive Summary (Bước 4.3)                   │
  │  - Section 2: Research Findings (synthesized from α)          │
  │  - Section 3: Technical Implementation (synthesized from β)   │
  │  - Section 4: Feasibility Assessment (synthesized from γ)     │
  │  - Section 5: Consolidated Recommendation                     │
  │  - Section 6: Debate Log (if any, Bước 4.2)                  │
  │  - Section 7: Open Questions                                  │
  │                                                               │
  │  Lưu tại: docs/reports/{MODULE_ID}/final-report.md           │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 4.5: Create Knowledge Node JSON ────────────────────┐
  │                                                               │
  │  Tạo JSON file theo DATA-SCHEMA.md:                          │
  │                                                               │
  │  Map từ reports → JSON fields:                                │
  │    research-report → overview, concepts, algorithms,          │
  │                      resources, relatedNodes                  │
  │    tech-report     → techStack, pipeline, bestPractices       │
  │    feasibility     → feasibility, useCases, caseStudies       │
  │                                                               │
  │  Cho MỖI field trong schema:                                 │
  │    □ Populated? (yes/no)                                      │
  │    □ Content quality? (skeleton/draft/complete)               │
  │                                                               │
  │  Lưu tại:                                                     │
  │    Baseline: data/baselines/{MODULE_ID}.json                 │
  │    Industry: data/industries/{MODULE_ID}.json                │
  │    Matrix:   data/matrix/{MODULE_ID}.json                    │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 4.6: Update graph.json ─────────────────────────────┐
  │                                                               │
  │  Thêm node mới (nếu chưa có):                               │
  │  {                                                            │
  │    "id": "{MODULE_ID}",                                       │
  │    "name": "{MODULE_NAME}",                                   │
  │    "category": "baseline" | "industry" | "matrix",           │
  │    "group": X,                                                │
  │    "size": X,                                                 │
  │    "depthLevel": 1|2|3,                                       │
  │    "color": "#XXXXXX"                                         │
  │  }                                                            │
  │                                                               │
  │  Thêm edges mới:                                              │
  │  {                                                            │
  │    "source": "{THIS_MODULE}",                                │
  │    "target": "{RELATED_MODULE}",                             │
  │    "relationship": "uses|extends|prerequisite|related",      │
  │    "weight": 1-10                                             │
  │  }                                                            │
  │                                                               │
  │  Lưu tại: data/graph.json                                    │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 4.7: Quality Checklist ─────────────────────────────┐
  │                                                               │
  │  NOTE: Checklist này là SUBSET của MODULE-TEST-PROTOCOL.md. │
  │  Nếu conflict → MODULE-TEST-PROTOCOL.md là authoritative.   │
  │                                                               │
  │  Chia 2 tầng: AUTO-CHECK (Ms. Scribe tự verify) +            │
  │               HUMAN-CHECK (Manager phải review)               │
  │                                                               │
  │  ═══ TIER 1: AUTO-CHECK (15 items) ═══                       │
  │  Ms. Scribe CÓ THỂ tự verify — objective, đếm được:         │
  │                                                               │
  │  Structural:                                                  │
  │  □ A01. JSON validates against DATA-SCHEMA.md                │
  │  □ A02. All fields required at target depth are populated    │
  │         (see DATA-SCHEMA Section 1.5)                        │
  │  □ A03. All 4 reports exist in docs/reports/{MODULE_ID}/     │
  │  □ A04. graph.json updated with node + edges                 │
  │  □ A05. Memory file created: docs/memory/{MODULE_ID}-*.md   │
  │                                                               │
  │  Quantitative:                                                │
  │  □ A06. Sources cited: ≥10                                   │
  │  □ A07. Concepts count: meets depth requirement              │
  │  □ A08. Algorithms count: meets depth requirement            │
  │  □ A09. Use cases: meets depth requirement                   │
  │  □ A10. Resources: meets depth requirement                   │
  │  □ A11. Related nodes: meets depth requirement               │
  │  □ A12. Key papers: meets depth requirement                  │
  │  □ A13. Mini examples: ≥2 (at L3), each has all 5 sections  │
  │  □ A14. Tech stack covers all layers (data/model/serve/mon.) │
  │  □ A15. Pipeline has diagram + stage table                   │
  │                                                               │
  │  AUTO-CHECK RESULT: __/15 PASS                               │
  │  → ALL 15 must pass. Fail → fix before submitting.           │
  │                                                               │
  │  ═══ TIER 2: HUMAN-CHECK (15 items) ═══                      │
  │  Manager PHẢI review — subjective, cần judgment:             │
  │                                                               │
  │  Academic Quality:                                            │
  │  □ H01. Field taxonomy is accurate and complete              │
  │  □ H02. Math foundations are correct (formulas, assumptions) │
  │  □ H03. SOTA section reflects genuine 2024-2026 landscape   │
  │  □ H04. Evolution timeline milestones are real events        │
  │                                                               │
  │  Content Quality:                                             │
  │  □ H05. Concepts are educational, not just bullet points     │
  │  □ H06. Examples are concrete and realistic, not generic     │
  │  □ H07. Algorithm pros/cons are balanced (not biased)        │
  │                                                               │
  │  Technical Quality:                                           │
  │  □ H08. Tech stack choices are justified (not just popular)  │
  │  □ H09. Pipeline is implementable (not theoretical)          │
  │  □ H10. Mini examples walkthrough makes logical sense        │
  │  □ H11. Code snippets are reasonable (pseudocode OK Phase 1) │
  │                                                               │
  │  Business Quality:                                            │
  │  □ H12. Case studies reference real companies/events         │
  │  □ H13. Feasibility scores align with evidence provided      │
  │  □ H14. Competitive landscape is current and fair            │
  │  □ H15. Cross-module connections are meaningful              │
  │                                                               │
  │  HUMAN-CHECK RESULT: __/15 PASS                              │
  │  → ≥12/15 to approve. Fail items → feedback to agent.       │
  │                                                               │
  │  COMBINED: Auto __/15 + Human __/15 = __/30                  │
  │                                                               │
  │  APPROVAL RULES:                                              │
  │  → Auto-check: ALL 15 must pass (objective, no exceptions)  │
  │  → Human-check: ≥12/15 to approve (Manager judgment)        │
  │  → Fail items: specific feedback → agent redo → recheck     │
  │                                                               │
  │  Output: Completed checklist (in final-report.md)             │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─── Bước 4.8: Submit for Manager Approval ───────────────────┐
  │                                                               │
  │  Gửi cho Manager:                                            │
  │  - final-report.md                                            │
  │  - {module}.json                                              │
  │  - Updated graph.json                                         │
  │  - Quality checklist status: ALL PASS / X items PENDING      │
  │                                                               │
  │  STATUS: AWAITING APPROVAL                                    │
  └───────────────────────────────────────────────────────────────┘

OUTPUT:
  Files:
    docs/reports/{MODULE_ID}/final-report.md
    data/baselines/{MODULE_ID}.json (or industries/ or matrix/)
    data/graph.json (updated)
  Status: AWAITING MANAGER APPROVAL
```

---

### Step A5: R-BE — Data Schema Normalization

**Agent:** R-BE (Backend Engineer)
**Input:** `{module}_draft.json` from R-σ + `docs/DATA-SCHEMA.md` NormalizedNode interface
**Output:** `data/baselines/{id}.json` or `data/industries/{id}.json` (PRODUCTION READY)

**Tasks:**
1. Validate all required fields against NormalizedNode interface
2. Remove duplicate/deprecated fields (e.g., `depth` → `depthLevel`, `techStack` → `tech_stack`)
3. Fix colors to approved palette from CONVENTIONS.md §7
4. Fill defaults for missing fields (empty arrays `[]`, empty strings `""`)
5. Set `metadata.status` based on depth level
6. Set `metadata.normalizedAt` and `metadata.normalizedBy`
7. Run TypeScript validation

**Exit criteria:** JSON conforms to NormalizedNode interface, all required fields populated, colors match palette.

**Implementation:** `src/lib/normalize-node.ts` — `normalizeNode()` function runs automatically in the API route (`src/app/api/nodes/[id]/route.ts`), ensuring all frontend consumers receive normalized data regardless of raw JSON shape.

---

## 4. WORKFLOW B — BUILD UI/FEATURE

Dùng khi build frontend/backend features.

```
  Step B1: Manager → define requirements (acceptance criteria)
      ↓
  Step B2: R-FE/R-BE → implement theo MASTER-ARCHITECTURE tech stack
      ↓
  Step B3: R-β → code review
      ↓
  Step B4: Self-test → verify acceptance criteria met
      ↓
  Step B5: R-σ → document changes
      ↓
  Step B6: Manager → approve

CHI TIẾT:

Step B1 — Requirements:
  Manager cung cấp:
  - Feature name
  - User story: "As a [user], I want [action], so that [benefit]"
  - Acceptance criteria (numbered list, testable)
  - UI mockup/reference (if applicable)
  - Affected files/components
  - Dependencies

Step B2 — Implementation:
  Developer (R-FE hoặc R-BE):
  □ Read requirements + acceptance criteria
  □ Read MASTER-ARCHITECTURE.md (tech stack, folder structure)
  □ Read existing code (understand patterns used)
  □ Implement feature
  □ Self-test against acceptance criteria
  □ Commit with proper message (Section 8)

Step B3 — Code Review:
  R-β (Dr. Praxis) reviews:
  □ Code quality (clean, readable, maintainable)
  □ Follows project conventions (TypeScript strict, Tailwind, etc.)
  □ No security issues
  □ Performance acceptable
  □ Edge cases handled
  → APPROVE / REQUEST CHANGES (with specific feedback)

Step B4 — Verification:
  □ All acceptance criteria met
  □ No console errors
  □ Responsive design works
  □ Dark theme consistent

Step B5 — Documentation:
  R-σ logs:
  □ Feature description
  □ Files changed
  □ Any new patterns introduced

Step B6 — Manager Approval:
  → APPROVED: Feature merged
  → REVISION: Specific changes requested
```

---

## 5. WORKFLOW C — POPULATE MATRIX NODE

Dùng khi tạo Matrix nodes (Baseline × Industry).

```
Lighter workflow — không cần full 4-step research.

  Step C1: Dr. Archon (α) — research industry-specific adaptation
      ↓ output: adaptation notes
  Step C2: Dr. Sentinel (γ) — market fit assessment (quick)
      ↓ output: market fit score
  Step C3: Ms. Scribe (σ) — create matrix node JSON
      ↓ output: {BXX-IXX}.json + graph.json update
  Step C4: Manager — approve

CHI TIẾT:

Step C1 — Dr. Archon:
  □ Read baseline node JSON (parent baseline)
  □ Read industry node JSON (parent industry)
  □ Research: How is this baseline adapted for this industry?
  □ Output: domain features, data schema, business rules, KPIs
  □ Output: 2-3 reference solutions (real companies)
  Duration: 30-60 min

Step C2 — Dr. Sentinel:
  □ Quick market assessment (≤30 min):
    - Who specifically needs this combination?
    - Existing solutions?
    - Market readiness?
  □ Output: Market fit score (1-10) + brief justification

Step C3 — Ms. Scribe:
  □ Create matrix node JSON per DATA-SCHEMA.md (MatrixNode type)
  □ Update graph.json (add node + edges to parent baseline & industry)
  □ Quick quality check

Step C4 — Manager approves
```

---

## 5.5 WORKFLOW D — RE-RESEARCH PROTOCOL

Dùng khi module đã có Round 1 output (Workflow A complete) và cần cải thiện chất lượng hoặc score.

### D.0 Trigger Conditions

```
Workflow D áp dụng khi Manager quyết định re-run bất kỳ module nào, vì bất kỳ lý do nào.
Không yêu cầu score < 7.0 hay test failure.

COMMON TRIGGERS (không giới hạn):

  a) QUALITY FIX — Score < 7.0, CRITICAL failures, content gaps, formula bugs
     Scope: Tier A / B / C tùy severity

  b) QUALITY UPGRADE — Module đã GO nhưng muốn improve
     Ví dụ: B06 score 8.4 nhưng muốn thêm SOTA mới, deep hơn
     Scope: Thường Tier B hoặc Tier D (single-agent)

  c) CONTENT REFRESH — SOTA outdated, industry context thay đổi
     Ví dụ: 6 tháng sau, cần update B09 Generative AI với latest models
     Scope: α re-research → σ re-consolidate (Tier B)

  d) TARGETED UPDATE — Chỉ muốn 1 agent cụ thể re-research
     Ví dụ: Muốn R-MLE re-research B01 từ góc ML Engineer mới
     Scope: Tier D (single-agent)

  e) SPOT CHECK — Verify quality bất kỳ lúc nào
     Ví dụ: Trước demo client, muốn kiểm tra B01 quality
     Scope: Chạy MODULE-TEST-PROTOCOL only → trigger Tier nếu fail

  f) CROSS-MODULE UPDATE — Insight từ module khác ảnh hưởng module này
     Ví dụ: B13 research phát hiện technique applicable cho B01
     Scope: α update cross-domain section → σ update (Tier D)

KHÔNG dùng Workflow D khi:
  - Module chưa có Round 1 output → dùng Workflow A
  - Chỉ cần fix typo/formatting → Manager direct edit, không cần workflow
  - Language issues only → dispatch σ single task:
    σ rewrite final-report.md + JSON content fields (theo Two-Phase language policy)
    Không trigger α/β/γ re-run. Direct σ task (Workflow B style).

MANAGER CÓ TOÀN QUYỀN:
  - Trigger Workflow D cho bất kỳ module nào, bất kỳ lúc nào
  - Chọn bất kỳ scope nào (Tier A / B / C / D)
  - Không cần justify bằng score hay test failure
```

### D.1 Dependency Model

```
Layer 1 (sequential):     Layer 2 (parallel, zero cross-dependency):
α ──→ β ──→ γ             MLE | DE | BE | DO | FE | Dxx | QA | SA | DA | ...

Layer 1 ↔ Layer 2: KHÔNG dependency.
  Layer 2 agents KHÔNG đọc Layer 1 output.
  Mỗi Layer 2 agent chỉ research từ expertise domain của mình.

Layer 3 (sau tất cả):
  σ phụ thuộc vào TẤT CẢ Layer 1 + Layer 2.
  σ đọc Layer 2 cũ (Round 1) nếu Layer 2 không re-run — INTENDED BEHAVIOR.
```

### D.2 Re-Run Cascade Rules

```
α re-run  →  β (nếu cần) →  γ (nếu cần) →  σ ✅
β re-run  →               →  γ (nếu cần) →  σ ✅
γ re-run  →               →               →  σ ✅
L2 re-run →               →               →  σ ✅

RULE 1: σ LUÔN re-run sau BẤT KỲ agent nào re-run.
RULE 2: "nếu cần" = Manager quyết định. KHÔNG auto-cascade.
RULE 3: L2 re-run KHÔNG trigger Layer 1 re-run.
RULE 4: σ PHẢI scan old Layer 2 notes khi α re-runs (Tier A + Tier B).
        → Conflict found: flag trong Debate Log. KHÔNG discard L2. KHÔNG hide.
        → Tier C (γ only): skip scan vì content không thay đổi.
```

### D.3 "Nếu cần" — Manager Decision Heuristic

```
β re-run sau α:
  ✅ α thêm/bỏ algorithms ảnh hưởng tech stack
  ✅ α thay đổi pipeline architecture fundamentals
  ❌ α chỉ update SOTA citations, thêm papers

γ re-run sau β:
  ✅ β thay đổi tech stack (cost model bị ảnh hưởng)
  ✅ β thay đổi implementation complexity estimate
  ❌ β chỉ thêm mini examples, code patterns

Layer 2 re-run:
  ✅ Chỉ khi Manager explicitly dispatch
  ❌ KHÔNG auto-trigger từ Layer 1 re-run

σ re-run scope per tier:
  Tier A: Full rewrite — final-report.md từ đầu
  Tier B: Partial — update Layer 1 sections + verdict; giữ Layer 2 sections từ Round 1
  Tier C: Minimal — chỉ update Feasibility Assessment + verdict + quality checklist
```

### D.4 Scope Tiers

```
"Score" = γ's overall_score field (weighted: Tech×0.30 + Market×0.30
          + Data×0.20 + Risk_inv×0.20). Xem R-γ skill card §Scoring Formula.

TIER A — Full re-research:
  Primary trigger: Missing content (SOTA, algorithms, core concepts absent/severely outdated)
  Score indicator: typically < 6.0
  Run: α (full) → β (full) → γ (full) + ALL Layer 2 agents + σ (full rewrite)

TIER B — Targeted re-research:
  Primary trigger: Specific identifiable content gaps, partially outdated
  Score indicator: typically 6.0–6.7
  Run: α (update gap sections) → γ (re-score) → σ (partial update)
  Layer 2: re-run only roles with directly outdated notes (Manager decides per role)
  Note: Score ≥ 6.8 vẫn có thể là Tier B nếu có content gaps — score is indicator only

TIER C — Score recalculation only:
  Primary trigger: Formula/weight error ONLY. No content gaps.
  Score indicator: typically ≥ 6.8, dưới GO do scoring bug (not content issue)
  Run: γ only (re-score với corrected formula) → σ (Feasibility section + verdict only)
  Upgrade to Tier B nếu phát hiện bất kỳ content gaps nào.

TIER D — Single-Agent Re-Run (Manager-initiated, bất kỳ lý do):
  Primary trigger: Manager muốn 1 hoặc vài agents cụ thể re-research
  Score requirement: KHÔNG CÓ — áp dụng cho mọi score level

  Run: Manager chọn agent(s) cụ thể → σ (update affected sections only)

  Cascade: Workflow D cascade rules vẫn áp dụng:
    - Nếu re-run α → Manager quyết định β/γ có cần re-run không (D.3 heuristic)
    - Nếu re-run Layer 2 agent → KHÔNG trigger Layer 1
    - σ LUÔN re-run sau bất kỳ agent nào

  Ví dụ:
    "B06 GO nhưng muốn R-MLE deep hơn về ML engineering practices"
    → dispatch R-MLE only → σ update Layer 2 section

    "B01 GO nhưng SOTA đã 6 tháng, cần refresh"
    → dispatch α only (SOTA section) → σ update Research Findings section

    "B09 GO nhưng muốn thêm domain expert R-D01 Retail perspective"
    → dispatch R-D01 only → σ integrate new notes
```

> Module assignments cho từng Round cụ thể → xem file riêng (ví dụ: `docs/round-2-research-plan.md`)

### D.5 File Handling

```
OVERWRITE in-place (git history = backup, không tạo v2 files).

TIER A (full):
  docs/reports/{MODULE_ID}/research-report.md       ← α overwrites
  docs/reports/{MODULE_ID}/tech-report.md            ← β overwrites
  docs/reports/{MODULE_ID}/feasibility-report.md     ← γ overwrites
  docs/reports/{MODULE_ID}/{ROLE_ID}-notes.md (×N)  ← each L2 role overwrites own file
  docs/reports/{MODULE_ID}/final-report.md           ← σ full rewrite
  data/baselines/{id}.json                           ← σ updates all content fields
  data/graph.json                                    ← σ updates edges (if changed)
  docs/memory/{MODULE_ID}-learnings.md               ← σ full rewrite

TIER B (targeted):
  docs/reports/{MODULE_ID}/research-report.md       ← α overwrites gap sections
  docs/reports/{MODULE_ID}/feasibility-report.md     ← γ overwrites
  docs/reports/{MODULE_ID}/{ROLE_ID}-notes.md       ← only re-run roles overwrite
  docs/reports/{MODULE_ID}/final-report.md           ← σ partial update (L1 sections + verdict)
  data/baselines/{id}.json                           ← σ updates per D.6 Rule 4
  data/graph.json                                    ← σ updates edges (if changed)
  docs/memory/{MODULE_ID}-learnings.md               ← σ APPENDS round-N section

TIER C (score only):
  docs/reports/{MODULE_ID}/feasibility-report.md     ← γ overwrites
  docs/reports/{MODULE_ID}/final-report.md           ← σ updates Feasibility section only
  data/baselines/{id}.json                           ← σ updates feasibility_score + verdict
  docs/memory/{MODULE_ID}-learnings.md               ← σ APPENDS score correction note

TIER D (single-agent):
  docs/reports/{MODULE_ID}/{AGENT}-report.md         ← re-run agent overwrites own file
  OR docs/reports/{MODULE_ID}/{ROLE_ID}-notes.md     ← Layer 2 agent overwrites own file
  docs/reports/{MODULE_ID}/final-report.md           ← σ updates affected section only
  data/baselines/{id}.json                           ← σ updates per D.6 Rule 4
  docs/memory/{MODULE_ID}-learnings.md               ← σ APPENDS "Tier D update" note
```

### D.6 σ Consolidation Rules — Mixed Inputs

```
σ nhận mixed-vintage inputs (Tier B/C): some Round N, some Round N-1.

RULE 1 — Source awareness:
  Manager notes in task dispatch which inputs are from which round.
  σ KHÔNG tự suy đoán.

RULE 2 — Section mapping (Tier B):
  § Research Findings (từ α)          → update với new α content
  § Technical Implementation (từ β)    → giữ từ Round N-1 nếu β không re-run
  § Feasibility Assessment (từ γ)      → update với new γ score
  § Practical Notes (từ Layer 2)       → giữ từ Round N-1 as-is
  § Consolidated Recommendation        → update verdict theo new γ
  § Quality Checklist                  → re-check items affected by changes only
  § Debate Log                         → append Round N update note

RULE 3 — Conflict detection (Tier A + Tier B khi α re-runs):
  σ đọc old L2 notes và check contradictions với new α findings.
  Nếu conflict → flag trong Debate Log. KHÔNG discard L2. KHÔNG hide conflict.
  Nếu không conflict → giữ old L2 as-is.

RULE 4 — JSON field updates (agent-specific):
  σ updates feasibility_score ALWAYS (mọi tier).
  σ updates content fields khi agent tương ứng re-run:
    α re-run → update: concepts, algorithms, academicFoundations, relatedNodes
    β re-run → update: techStack, pipeline, miniExamples
    γ re-run → update: feasibility_score, useCases (nếu market insight thay đổi)
    L2 re-run → KHÔNG update JSON (L2 notes stay in reports only, không vào JSON)

RULE 5 — Tier D consolidation:
  σ chỉ update section tương ứng với agent re-run:
    α re-run → update § Research Findings
    β re-run → update § Technical Implementation
    γ re-run → update § Feasibility Assessment + verdict
    Layer 2 re-run → update § Practical Notes (chỉ sub-section của role đó)
  σ KHÔNG re-write sections không bị ảnh hưởng.
  σ APPENDS note trong Debate Log: "Tier D update: {agent} re-researched on {date}"
```

### D.7 Verification Step

```
Sau khi Workflow D hoàn thành, Manager chạy MODULE-TEST-PROTOCOL
trên layers bị ảnh hưởng (Layer 0 + Layers 1–5, tổng 6 layers):

Tier A: Full check — Layer 0 + Layers 1–5
Tier B: Layer 0 + Layer 1 + Layer 3 (α §L3.1 + γ §L3.3 + σ §L3.4) + Layer 4
Tier C: Layer 0 + Layer 1 + Layer 3 (γ §L3.3 + σ §L3.4) + Layer 4.2
Tier D: Layer 0 + Layer 1 (affected files only) + Layer 3 (affected agent §L3.x) + Layer 4.2
  Chỉ verify agent đã re-run + σ output. Không re-check toàn bộ module.

Pass criteria: MODULE-TEST-PROTOCOL PASS conditions.
Fail → return to responsible agent với specific failure details.

MAX ATTEMPTS (all tiers):
  Attempt 1: Workflow D re-run theo assigned tier
  Attempt 2: Fix specific failures from attempt 1 only
  Attempt 3: KHÔNG CÓ. Manager manual fix hoặc defer to next round.
  Rationale: 2 lần fail cùng chỗ = root cause là prompt/skill card,
  không phải agent effort. Fix root cause thay vì retry.
```

---

## 6. HANDOFF PROTOCOL

Khi 1 agent hoàn thành task và chuyển giao cho agent tiếp theo:

```
HANDOFF CHECKLIST — AGENT GIAO:

□ Output file saved tại đúng vị trí (Section 8)
□ Output theo đúng template (Section 9)
□ Status updated: NEEDS REVIEW hoặc READY FOR NEXT
□ Notification message gửi cho agent nhận:

  ────────────────────────────────────────────
  HANDOFF NOTIFICATION
  FROM:   [Role ID] [Name]
  TO:     [Role ID] [Name]
  MODULE: [Module ID]
  TASK:   [Task description]
  ────────────────────────────────────────────
  OUTPUT FILE: [exact file path]
  STATUS: [COMPLETE / PARTIAL — explain]
  NOTES:  [Anything agent nhận cần biết]
  ISSUES: [Any known issues or concerns]
  ────────────────────────────────────────────

HANDOFF CHECKLIST — AGENT NHẬN:

□ Đọc notification message
□ Đọc output file
□ Confirm received (hoặc raise issues)
□ Bắt đầu task của mình
```

---

## 6.5 MEMORY MANAGEMENT (Hermes Pillar 4)

### How Memory Works in a Stateless System

Mỗi Claude API call là stateless. Memory files trên filesystem là bridge giữa các sessions.

```
MECHANISM:
  1. Ms. Scribe tạo memory file sau mỗi module
  2. Manager EXPLICITLY loads memory vào context trước khi dispatch agent tiếp
  3. Mỗi agent nhận memory như 1 phần của context (Hermes H2)
  4. Agent KHÔNG tự đọc memory — Manager chọn và inject
```

### Memory Budget

```
MAX MEMORY LOADED PER AGENT: ~2000 tokens (~500 words)

Rationale: Context window có limit. Memory phải concise, không phải full reports.
```

### Memory Prioritization

```
Khi load memory cho 1 agent, Manager chọn theo thứ tự ưu tiên:

PRIORITY 1: Same module (nếu upgrading L1→L2→L3)
  → Load: docs/memory/{SAME_MODULE}-learnings.md

PRIORITY 2: Most recent 3 modules
  → Load: 3 files mới nhất trong docs/memory/

PRIORITY 3: Same-category modules (nếu researching B05, load B01-B04 memories)
  → Load: relevant memories cùng category

PRIORITY 4: Cross-module insights
  → Load: docs/memory/matrix-insights.md (nếu doing matrix nodes)

CUT-OFF: Tổng memory loaded KHÔNG vượt quá 2000 tokens.
Nếu quá → chỉ giữ Priority 1 + 2, bỏ 3 + 4.
```

### Memory Entry Format (STRUCTURED, không free-form)

```yaml
# docs/memory/{MODULE_ID}-learnings.md
module: B01
name: "Forecasting & Time Series"
date: 2026-03-30
depth: L3

key_insights:
  - insight: "LightGBM outperforms Prophet for multi-series at scale"
    confidence: HIGH
    reuse_for: [B05, B07]  # which modules benefit

tech_decisions:
  - decision: "Chose LightGBM as default ML model"
    rationale: "Best speed/accuracy tradeoff for tabular time series"
    reuse_for: [B01-I01, B01-I06]  # matrix nodes inherit this

surprising_findings:
  - "Foundation models (TimesFM, Chronos) approaching LightGBM accuracy with zero-shot"

cross_connections:
  - from: B01
    to: B07
    insight: "Forecast residuals are key input for anomaly detection"

process_notes:
  - "Web search for SOTA took longer than expected — bookmark arxiv.org/list/cs.LG"

reusable_patterns:
  - pattern: "Walk-forward validation"
    applicable_to: [B01, B07, B05]
```

### Memory Lifecycle

```
CREATE:  Ms. Scribe creates after Workflow A completion (Step A4, Bước 4.8)
READ:    Manager loads into agent context before dispatch (Hermes H2)
UPDATE:
  - Workflow D Tier A: Ms. Scribe FULL REWRITE (content changed significantly)
  - Workflow D Tier B: Ms. Scribe APPENDS round-N section
  - Workflow D Tier C: Ms. Scribe APPENDS score correction note
  - Workflow D Tier D: Ms. Scribe APPENDS "Tier D update" note
DELETE:  Never explicitly. Tier A full-rewrite replaces content.
         Git history preserves all previous versions.
ARCHIVE: After 20+ modules, Manager may create summary-memory.md
```

---

## 7. REVIEW & APPROVAL

### 7.1 Peer Review Matrix

```
AUTHOR          →  REVIEWER         →  REVIEW FOCUS
──────────────────────────────────────────────────────
R-α (Research)  →  R-γ (Sentinel)   →  Evidence quality, bias check
R-β (Tech)      →  R-α (Archon)     →  Architecture alignment
R-γ (Feasibility)→ R-β (Praxis)     →  Technical accuracy of assessments
R-σ (Final)     →  Manager          →  Completeness, quality
R-FE (Frontend) →  R-β (Praxis)     →  Code quality, conventions
R-BE (Backend)  →  R-β (Praxis)     →  Code quality, security
```

### 7.2 Review Feedback Format

```markdown
## Review: {FILE_NAME}
**Reviewer:** [Role ID] [Name]
**Date:** YYYY-MM-DD
**Verdict:** PASS / REVISE / REJECT

### What's Good
[≤3 bullets — positive feedback]

### Issues Found
| # | Issue | Severity | Location | Suggestion |
|---|-------|----------|----------|-----------|
| 1 | ...   | HIGH/MED/LOW | Line/Section | ... |

### Summary
[1-2 sentences overall assessment]
```

### 7.3 Manager Approval Criteria

> **Full quality gate:** `docs/MODULE-TEST-PROTOCOL.md` (6 layers). Summary below:

```
Module output được APPROVED khi:

□ LAYER 0: npm run build passes, no TypeScript errors
□ LAYER 1: All required files exist, JSON validates, language policy correct
□ LAYER 2: All dispatched agents delivered, sequential order respected
□ LAYER 3: Per-agent acceptance criteria met (α→L3.1, β→L3.2, γ→L3.3, σ→L3.4)
□ LAYER 4: Cross-references consistent (α↔β↔γ↔JSON↔graph.json)
□ LAYER 5: Node renders correctly (Galaxy→Planetary→Report Overlay→Search)

Module output REJECTED khi:

□ Bất kỳ 🔴 CRITICAL item fail trong MODULE-TEST-PROTOCOL.md
□ Hoặc >3 🟠 HIGH items fail
```

Xem đầy đủ tại `docs/MODULE-TEST-PROTOCOL.md` (Quick-Run: ~15-20 min/module).

---

## 8. FILE NAMING & LOCATION

### 8.1 Report Files

```
docs/reports/{MODULE_ID}/
├── research-report.md       ← Dr. Archon (α)
├── tech-report.md           ← Dr. Praxis (β)
├── feasibility-report.md    ← Dr. Sentinel (γ)
└── final-report.md          ← Ms. Scribe (σ)

MODULE_ID format:
  Baselines:  B01, B02, ..., B15
  Industries: I01, I02, ..., I20
  Matrix:     B01-I01, B01-I02, ... (up to B15-I20)
```

### 8.2 Knowledge Node JSON Files

```
data/
├── graph.json                          ← Graph structure (ALL nodes + edges)
├── baselines/
│   ├── B01-forecasting.json
│   ├── B02-document-intelligence.json
│   └── ...
├── industries/
│   ├── I01-retail.json
│   └── ...
└── matrix/
    ├── B01-I01-retail-forecasting.json
    └── ...
```

### 8.3 File Naming Convention

```
Reports:     lowercase, hyphens, .md
JSON data:   {ID}-{slug}.json (lowercase, hyphens)
Components:  PascalCase.tsx
Utilities:   camelCase.ts
Styles:      lowercase.css
```

---

## 9. TEMPLATES

### 9.1 Research Report Template (Dr. Archon α)

```markdown
# Research Report: {MODULE_ID} — {MODULE_NAME}

**Author:** Dr. Archon (α)  
**Date:** YYYY-MM-DD  
**Module:** {MODULE_ID}  
**Depth:** L1 / L2 / L3  
**Status:** DRAFT / NEEDS REVIEW / APPROVED  

---

## 1. Executive Summary
[≤3 sentences]

## 2. Source Table
| # | Title | URL | Date | Reliability | Key Takeaway |
|---|-------|-----|------|-------------|-------------|
| 1 | ... | ... | ... | HIGH/MED/LOW | ... |

## 3. Core Concepts
### 3.1 {Concept Name}
- **Difficulty:** beginner / intermediate / advanced
- **Prerequisites:** [list]
- **Description:** [1-2 paragraphs]
- **Example:** [concrete example]

### 3.2 {Next Concept}
...

## 4. Algorithms & Methods
| Algorithm | Category | Best For | Complexity | Maturity | Pros | Cons |
|-----------|----------|----------|-----------|----------|------|------|

## 5. State of the Art (2024-2026)
### 5.1 Recent Breakthroughs
### 5.2 Emerging Trends
### 5.3 Open Problems

## 6. Cross-Domain Connections
| Related Module | Relationship | Description |
|---------------|-------------|-------------|

## 7. Confidence Assessment
| Finding | Confidence | Evidence |
|---------|-----------|----------|

## 8. Open Questions
- [ ] ...
```

### 9.2 Tech Report Template (Dr. Praxis β)

```markdown
# Tech Report: {MODULE_ID} — {MODULE_NAME}

**Author:** Dr. Praxis (β)  
**Date:** YYYY-MM-DD  
**Module:** {MODULE_ID}  
**Status:** DRAFT / NEEDS REVIEW / APPROVED  

---

## 1. Implementation Summary
[≤5 sentences]

## 2. Tech Stack Decision Matrix
| Layer | Tool | Version | Alternatives Considered | Why This One |
|-------|------|---------|------------------------|-------------|

## 3. Pipeline Architecture
### 3.1 Diagram
[Mermaid or ASCII]

### 3.2 Stage Breakdown
| Stage | Input | Process | Output | Tools | Latency |
|-------|-------|---------|--------|-------|---------|

## 4. Key Code Patterns
### Pattern 1: {Name}
- **When to use:** ...
- **Code:**
[pseudocode or real snippet ≤30 lines]
- **Common mistakes:** ...

## 5. Production Considerations
| Aspect | Requirement | Approach | Est. Cost |
|--------|-----------|---------|----------|
| Scaling | ... | ... | ... |
| Monitoring | ... | ... | ... |
| Cost | ... | ... | ... |
| Latency | ... | ... | ... |
| Retraining | ... | ... | ... |
| Fallback | ... | ... | ... |

## 6. Effort Estimation
| Scope | Duration | Team | Notes |
|-------|---------|------|-------|
| MVP | ... | ... | ... |
| Production | ... | ... | ... |
| Enterprise | ... | ... | ... |

## 7. Known Limitations
- ...
```

### 9.3 Feasibility Report Template (Dr. Sentinel γ)

```markdown
# Feasibility Report: {MODULE_ID} — {MODULE_NAME}

**Author:** Dr. Sentinel (γ)  
**Date:** YYYY-MM-DD  
**Module:** {MODULE_ID}  
**Verdict:** GO / CONDITIONAL GO / NO-GO  
**Status:** DRAFT / NEEDS REVIEW / APPROVED  

---

## 1. Verdict
[1-2 sentences]

## 2. Scoring Matrix
| Dimension | Score (1-10) | Weight | Justification |
|-----------|-------------|--------|--------------|
| Technical Feasibility | X | 30% | ... |
| Market Demand | X | 30% | ... |
| Data Availability | X | 20% | ... |
| Implementation Risk | X | 20% | ... |
| **Weighted Overall** | **X.X** | | |

## 3. Competitive Landscape
| Competitor | Type | Strengths | Weaknesses | Pricing |
|-----------|------|-----------|------------|---------|

## 4. Risk Register
| # | Risk | Probability | Impact | Mitigation | Owner |
|---|------|------------|--------|-----------|-------|

## 5. Market Insight
- **Target customer:** ...
- **Willingness to pay:** ...
- **Market size (Vietnam):** ...
- **Market size (SEA):** ...
- **Market timing:** Early / Right time / Late

## 6. Challenges to Other Reports
### To Research (α):
- ...
### To Tech (β):
- ...

## 7. Conditions (if CONDITIONAL GO)
- ...

## 8. Recommendations
- ...
```

### 9.4 Final Report Template (Ms. Scribe σ)

```markdown
# Final Module Report: {MODULE_ID} — {MODULE_NAME}

**Consolidated by:** Ms. Scribe (σ)  
**Date:** YYYY-MM-DD  
**Module:** {MODULE_ID}  
**Depth Level:** L1 / L2 / L3  
**Agents:** α, β, γ, σ  
**Status:** AWAITING APPROVAL / APPROVED  

---

## Executive Summary
[3-5 sentences, non-technical]

---

## 1. Research Findings (from Dr. Archon α)
[SYNTHESIZED — not copy-paste]

## 2. Technical Implementation (from Dr. Praxis β)
[SYNTHESIZED — not copy-paste]

## 3. Feasibility Assessment (from Dr. Sentinel γ)
[SYNTHESIZED — not copy-paste]

## 4. Consolidated Recommendation
[Unified view from all 3 agents]

## 5. Quality Checklist
### Content
- [ ] Core concepts fully explained (≥5)
- [ ] All major algorithms listed (≥5)
- [ ] SOTA covers 2024-2026
- [ ] Examples are concrete

### Technical
- [ ] Tech stack justified
- [ ] Pipeline diagram included
- [ ] Code patterns included (≥3)
- [ ] Effort estimation included

### Business
- [ ] ≥5 use cases
- [ ] ≥3 case studies
- [ ] Feasibility scores justified
- [ ] Competitive landscape included

### Data
- [ ] JSON validates against schema
- [ ] All required fields populated
- [ ] ≥10 learning resources
- [ ] ≥5 related nodes mapped
- [ ] graph.json updated

**Checklist: X/20 PASS**

## 6. Debate Log
[If any disagreements — both sides + resolution]

## 7. Open Questions
- [ ] ...

## 8. Artifacts
- research-report.md: [COMPLETE/PARTIAL]
- tech-report.md: [COMPLETE/PARTIAL]
- feasibility-report.md: [COMPLETE/PARTIAL]
- {MODULE_ID}.json: [CREATED/UPDATED]
- graph.json: [UPDATED]
```

---

## 10. ESCALATION & EXCEPTION HANDLING

### 10.1 Khi nào escalate lên Manager

```
ESCALATE NGAY khi:
1. Blocked > 30 phút (không thể tiến tiếp)
2. 2 agents bất đồng không resolve được (sau Debate Protocol)
3. Phát hiện lỗi nghiêm trọng ở output của agent khác
4. Task scope thay đổi so với assignment
5. Thiếu critical information mà không ai có
6. Quality gate FAIL và không biết cách fix
```

### 10.2 Exception cases

```
CASE: Baseline docs thiếu thông tin cho module
→ Action: Dr. Archon research từ scratch (web search heavy)
→ Note trong report: "Baseline docs gaps identified"

CASE: No existing competitor found
→ Action: Dr. Sentinel ghi "Blue ocean — no direct competitor"
→ Note: Higher risk nhưng higher potential

CASE: Agent output quality quá thấp
→ Action: Manager reassign hoặc pair agent
→ Note: Log reason trong progress tracker

CASE: Debate kéo dài không resolution
→ Action: Manager makes final call
→ Note: Both opinions preserved in final report

CASE: JSON schema needs new fields
→ Action: Propose to Manager → update DATA-SCHEMA.md → notify all agents
→ Note: Schema changes affect ALL future nodes
```

### 10.3 Continuous Improvement

```
Sau MỖI module hoàn thành:
1. Ms. Scribe ghi "lessons learned" (2-3 bullets)
2. Nếu process bottleneck → propose SOP update
3. Nếu template thiếu → propose template update
4. Manager review & approve SOP changes

SOP changes:
→ Version bump (1.0 → 1.1)
→ Notify ALL agents
→ Changes effective NGAY
```

---

*Standard Operating Procedure v1.0 — MAESTRO Knowledge Graph Platform*  
*This is a LIVING document. Updated after each phase completion.*  
*Enforced by Project Manager (Cascade)*
