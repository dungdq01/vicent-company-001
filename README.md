# my_learning — AI Studio Workspace

**Mục đích**: workspace gốc cho 1 AI studio / agency vận hành end-to-end — từ kiến thức nền, tác nhân thực thi (agents), phương pháp luận, đến dự án cụ thể, được dẫn dắt bởi chiến lược kinh doanh rõ ràng.

**Standard cho mọi quy mô** — từ MMO product $30 đến enterprise contract $50K+ đều dùng chung khung này; chỉ khác scope invoke.

---------------------------------------------

## 🧭 Cấu Trúc 5 Tầng + Studio Boundary

```
┌─────────────────────────────────────────────────────────────┐
│  L1  knowledge/         "Tủ sách — CLIENT-FACING"           │
│      → WHAT: 12 baselines × 20 industries + staging gate    │
├─────────────────────────────────────────────────────────────┤
│  L2  _shared/           "Tác nhân & kỹ năng + 11 rules"     │
│      → HOW: 25+ agents + prompts + eval + standards + templ.│
├─────────────────────────────────────────────────────────────┤
│  L3  experience/        "Phương pháp / trải nghiệm"         │
│      → BRIDGE: P0-P10 + Path A/B/C/D, workflows W01-W12     │
├─────────────────────────────────────────────────────────────┤
│  L4  projects/          "Dự án cụ thể A→Z + harness/"       │
│      → DOING: per-client deliverable + retro + permanent-fix│
├─────────────────────────────────────────────────────────────┤
│  L5  business-strategy/ "Định hướng kinh doanh"             │
│      → DECIDES: ICP + pricing + KPIs + channels (18 files)  │
├─────────────────────────────────────────────────────────────┤
│  ⊕   studio/wisdom/     "STUDIO-INTERNAL only"              │
│      → CEO opinions, ICP insights — never in client deliver │
└─────────────────────────────────────────────────────────────┘
```

**Quy tắc luồng dữ liệu**:
- L5 quyết định → L4 thực thi → mượn từ L3 phương pháp → invoke L2 agents → đọc L1 knowledge
- L4 retro → cập nhật L1 memory + L3 patterns + L2 prompts (compound learning)

Chi tiết philosophy: [`01-FRAMEWORK.md`](./01-FRAMEWORK.md)
Operating procedure khi 1 input mới đến: [`00-OPERATING-MANUAL.md`](./00-OPERATING-MANUAL.md)

---

## 📂 Folder Map

| Path | Role | Owner | Status |
|---|---|---|---|
| **`START-HERE.md`** | **Người mới đọc 30' — philosophy + reading order + project start** | All | ✅ v1.0 |
| **`BRIEF-INTAKE.md`** | **⭐ Project entry template — đề bài CEO/khách điền 6 block. Copy → `projects/{id}/BRIEF-INTAKE.md` mỗi project mới** | CEO + Client | ✅ v1.0 |
| **`HOW-TO.md`** | **⭐ Task-indexed cookbook — "tôi muốn làm X" → đọc file Y. 40 use cases / 8 nhóm.** | All | ✅ v1.0 |
| `PROJECT.md` | Token-optimal wrapper (~4K) | All | ✅ v1.1 |
| `ONBOARDING.md` | Lộ trình 5 ngày role-specific (Dev/Sales/Designer/COO) | All | ✅ |
| `00-OPERATING-MANUAL.md` | Master flow: input → 5 paths (A/B/C/D/E) → output | All | ✅ |
| `01-FRAMEWORK.md` | 5-layer philosophy + studio boundary | All | ✅ |
| `README.md` | Navigation (file này) | All | ✅ |
| `knowledge/` | L1 — client-facing baselines + industries + staging | P3 lead, R-σ curate | ✅ data / ⏳ staging |
| `_shared/` | L2 — agents, 11 rules, prompts, eval, 5 standards, templates | P1 (LLMOps) + CTO | ✅ rules + standards / ⏳ skill cards |
| `experience/` | L3 — pipeline P0-P10 + Path A/B/C/D + 8 business pipelines (M/S/C/CS/E/BD/H/F) + workflows W01-W12 | P2 (engine) | ✅ specs / ⏳ runtime |
| `projects/` | L4 — per-client work folders + harness/ | P3 (delivery PM) | ⏳ template |
| `business-strategy/` | L5 — strategic decisions | All 3 | ✅ 18 files |
| `studio/wisdom/` | Studio-internal — CEO opinions, ICP insights, churn patterns | CEO + COO | ⏳ skeleton |
| `_archive/` | Deprecated/old docs | All | (archive policy in folder) |

---

## 🚀 Đọc Theo Vai Trò

### Bạn là **founder mới đọc lần đầu** (≤ 2h)
1. `README.md` (file này) — 5 phút
2. `01-FRAMEWORK.md` — 15 phút
3. `00-OPERATING-MANUAL.md` — 30 phút (master flow)
4. `business-strategy/01-strategy-overview.md` — 20 phút
5. `business-strategy/03-goals-and-roadmap.md` — 15 phút
6. `business-strategy/09-phase1-execution-plan.md` — 30 phút

### Bạn là **collaborator/contractor** join phase 1 (≤ 4h)
+ Đọc trên + `business-strategy/15-business-operations.md`, `16-brand-content-kit.md`, `17-quality-standards-dod.md`
+ `_shared/.agents/README.md` (khi có)
+ `experience/workspace/docs/pipeline/README.md`

### Bạn là **AI agent** sắp được invoke
+ Skill card riêng của bạn ở `_shared/.agents/tier-{N}/R-{name}.md`
+ Context loading rules: `experience/workspace/docs/agents/CONTEXT-LOADING.md`
+ Eval criteria: `_shared/eval/scoring-rubric.md`

### Bạn là **client / paying customer**
→ Bạn sẽ không đọc folder này. Bạn nhận deliverables ở `projects/{P-ID}/` qua kênh giao hàng (file 14).

---

## 🔄 Khi Có Input Mới

| Loại input | Path xử lý | Pipeline doc |
|---|---|---|
| Customer brief (ICP A-E) | PATH A — Sales-led, P0-P9 + P10 long-term | `experience/workspace/docs/pipeline/P0-INTAKE.md` … `P10-LONG-TERM.md` |
| Internal product idea | PATH B — Product R&D, B0-B7 | `experience/workspace/docs/pipeline/PATH-B-PRODUCT.md` |
| Content piece | PATH C — Content-led, C0-C7 | `experience/workspace/docs/pipeline/PATH-C-CONTENT.md` |
| Knowledge re-research | PATH D — Re-research, D0-D6 | `experience/workspace/docs/pipeline/PATH-D-RESEARCH.md` |
| Operational issue | PATH E — Ops-led (no Engine) | `business-strategy/15-business-operations.md` |

**Multi-path coordination** when ≥ 2 paths active: `experience/workspace/docs/workflows/W10-cross-path-priority.md`.

**Master orchestration**: `00-OPERATING-MANUAL.md` §3-§7.

**Project entry**: copy root `BRIEF-INTAKE.md` template → `projects/{id}/BRIEF-INTAKE.md`, fill 6 block, dispatch P0.1. Engine reads BRIEF + auto-fills `00-intake.md`. Per-project attachments (skill addon · doc · GitHub repo) per `_shared/standards/project-attachments.md`.

**⭐ Automation shortcut**: Claude Code session → invoke **R-CoS** (Chief of Staff concierge) — `_shared/.agents/tier-0-executive/R-CoS-chief-of-staff.md`. Nói tiếng người, R-CoS map intent → action chain (mkdir/cp/dispatch/track) auto. Đỡ thao tác thủ công 5-10 bước/dispatch.

---

## ⚙️ Quy Tắc Vận Hành (rút gọn từ 01-FRAMEWORK)

1. **Single source of truth per concept** — skill card 1 chỗ duy nhất (`_shared/.agents/`); pricing 1 chỗ (`business-strategy/10`); DoD 1 chỗ (`business-strategy/17` + alias trong `_shared/standards/`)
2. **Cross-reference thay vì duplicate** — link bằng `@path/to/file:line`, không copy paste
3. **Memory promotion path** — project insight → baseline memory → industry memory → strategic update
4. **Layer độc lập tiến hoá** — đổi LLM provider không chạm L1; đổi ICP không chạm L2 code
5. **Standard skeleton mọi project size** — file 13 9-phase pipeline áp dụng cho mọi scope A/B/C/D, chỉ khác phase invoke

---

## 📝 Versioning

- Top-level docs (00, 01, README) có header `Last updated: YYYY-MM-DD`
- Per-folder README có `Last updated` trong header
- Major restructure → ghi `_archive/RESTRUCTURE-{date}.md`
- File business-strategy mỗi tuần monthly review (file 03 §6)

---

*Last updated: 2026-04-27*
*Created: 2026-04-26 — post-restructure foundation*
*v1.1 (2026-04-27): added Path B/C/D pipelines, P10 long-term, W08-W12 workflows, rules 80/90/100, studio/wisdom boundary*
