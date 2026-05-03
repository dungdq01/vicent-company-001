# PROJECT.md — Wrapper / Single-Page Context

> **Đọc file này ĐẦU TIÊN.** Mục tiêu: 1 lần đọc (~3,500 tokens) là đủ context cho 80% task. Phần còn lại load theo manifest §6.

**Last updated**: 2026-04-27 · **Version**: 1.1

---

## 1. What This Is (30 giây)

**AI Studio** — boutique consultancy + agentic engine. 3 founder (CEO/COO/CTO) × team Agentic AI giao hàng end-to-end từ research → ship cho client logistics / e-commerce / MMO.

**Standard skeleton mọi project size** từ MMO $30 PDF đến Enterprise $50K+ đều dùng chung khung; chỉ khác *phase nào được invoke*.

---

## 2. 5-Layer Map (1 dòng mỗi layer)

| Layer | Path | Vai | Đọc khi |
|---|---|---|---|
| L1 Knowledge | `knowledge/` | WHAT — 12 baseline × 20 industry MAESTRO + staging gate | task cần fact / domain / SOTA |
| L2 Shared | `_shared/` | HOW — 25+ agents · 11 rules · prompts · eval · standards · templates | task chạm agent / rule / template |
| L3 Experience | `experience/` | BRIDGE — pipeline P0–P10 + Path A/B/C/D · workflows W01–W12 | task chạm phase / quy trình |
| L4 Projects | `projects/` | DOING — per-client deliverable A→Z + harness/ folder | task thuộc 1 dự án cụ thể |
| L5 Strategy | `business-strategy/` | DECIDES — ICP · pricing · KPI · channels (18 file) | task chạm decision chiến lược |
| L (studio) | `studio/wisdom/` | INTERNAL — CEO opinions, ICP insights — separate from client knowledge | studio-internal calibration only |

**Quy tắc luồng**: L5 quyết → L4 thực thi → mượn L3 phương pháp → invoke L2 agents → đọc L1 knowledge. Retro L4 → cập nhật L1 + L2 + L3 (compound learning).

---

## 3. Critical Rules — 11 rule files in `_shared/rules/`

| File | Domain code | Owns |
|---|---|---|
| `00-MASTER-RULES` | R-MAS | Constitution — 15 invariants (single source, anti-FOMO, anti-hallucination, cost cap, human gate, retro mandatory) |
| `10-stack-rules` | R-STK | Approved tech stack only — ADR for additions |
| `20-code-rules` | R-COD | Coding conventions |
| `30-execution-rules` | R-EXE | Pipeline phase order, dispatch, retry budget |
| `40-docs-rules` | R-DOC | File naming, citations, banned words |
| `50-communication-rules` | R-COM | Output header, handoff, escalation |
| `60-security-rules` | R-SEC | Secrets, auth, prompt injection, PII |
| `70-quality-rules` | R-QAL | Eval thresholds, DoD, golden sets, drift |
| `80-harness-rules` | R-HRN | Agent runtime (17 rules v1.2): control loop, tool budget, memory tier, drift, permanent-fix, KV-cache, approval gate, observability, **iteration cap, sub-agent delegation, determinism, self-check, recall** |
| `90-lifecycle-rules` | R-LCY | Demote · sunset · vendor drift · multi-path priority · framework retro · long-term client |
| `100-orchestration-rules` | R-ORC | Dispatcher · tiebreak · handoff QA · agent onboarding · phase rewind · voice contract |

Vi phạm = output bị revoke. Conflict giữa rules → master thắng (R-MAS-12 precedence).
RULES-PREAMBLE auto-inject 11 rules vào mọi agent system prompt (`_shared/prompts/RULES-PREAMBLE.md`).

---

## 4. Current Operating State

**Phase studio**: bootstrap 90 ngày — xem `experience/workspace/docs/workflows/W06-first-90-days.md`.

**Active projects**: xem `projects/_ops/week-YYYY-WW/plan.md`. Khi không có file plan → studio chưa chính thức launch (Day 0 chưa qua).

**Daily / weekly rhythm**: `experience/workspace/docs/workflows/W01-daily-operating-rhythm.md` + `W02-weekly-cadence.md`.

---

## 5. Find by Task (token-saving routing)

> **Triết lý**: chỉ load doc bạn cần cho task hiện tại. Mặc định đọc PROJECT.md (file này) + 1–2 file leaf, KHÔNG đọc cả folder.

| Task | Đọc file (theo thứ tự, dừng khi đủ) | ~tokens |
|---|---|---|
| **Hiểu tổng quan / onboarding** | `ONBOARDING.md` → `01-FRAMEWORK.md` | 4K |
| **1 ngày làm việc** | `experience/workspace/docs/workflows/W01-daily-operating-rhythm.md` | 3K |
| **Có lead mới → giao hàng end-to-end** | `experience/workspace/docs/workflows/W03-new-project-walkthrough.md` | 6K |
| **Sắp gọi 1 agent** | `experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md` + skill card riêng | 5K |
| **Xử lý sự cố Sev 0/1/2** | `experience/workspace/docs/workflows/W05-incident-response.md` | 5K |
| **Bootstrap Day 0** | `experience/workspace/docs/workflows/W06-first-90-days.md` | 6K |
| **Pipeline Path A 1 phase cụ thể (P{N})** | `experience/workspace/docs/pipeline/P{N}-*.md` | 1.5K |
| **Path B/C/D (product / content / re-research)** | `experience/workspace/docs/pipeline/PATH-{B\|C\|D}-*.md` | 1.5K |
| **Long-term client (post-30-day)** | `experience/workspace/docs/pipeline/P10-LONG-TERM.md` | 1.5K |
| **Quarterly framework retro** | `experience/workspace/docs/workflows/W08-framework-retro.md` | 1.5K |
| **Tạo agent mới (R-LLMOps, R-DataOps, ...)** | `experience/workspace/docs/workflows/W09-agent-onboarding.md` | 1.5K |
| **2 paths active concurrent** | `experience/workspace/docs/workflows/W10-cross-path-priority.md` | 1.5K |
| **Knowledge promote staging → production** | `experience/workspace/docs/workflows/W11-knowledge-review.md` + `_shared/standards/knowledge-curation.md` | 3K |
| **Phase rewind (P5 phát hiện P3 sai)** | `experience/workspace/docs/workflows/W12-phase-rewind.md` | 1.5K |
| **Sales / Content / CS / Hiring / Finance pipeline** | `experience/workspace/docs/pipelines-business/{type}/` | 2K |
| **Marketing campaign setup (lead gen funnel)** | `experience/workspace/docs/pipelines-business/marketing/M0-M5` | 2K |
| **Client expansion play (offensive upsell)** | `experience/workspace/docs/pipelines-business/expansion/E0-E3` | 2K |
| **Partnership / BD (referral, co-sell, integration, reseller)** | `experience/workspace/docs/pipelines-business/partnership/BD0-BD4` | 2K |
| **Pricing decision (trigger-based)** | `_shared/standards/pricing-decisions.md` | 2K |
| **Bắt đầu dự án mới** | `_shared/templates/project/README.md` + `harness/` template | 3–10K |
| **Skill 1 agent cụ thể** | `_shared/.agents/tier-{N}/{agent-id}.md` | 2K |
| **Ra decision kiến trúc / scope** | `_shared/templates/project/ADR-template.md` + `_shared/standards/decision-log-index.md` | 2K |
| **Pricing / SOW** | `business-strategy/10-pricing-sheet.md` + `_shared/templates/project/02-sow.md` | 4K |
| **Eval / quality gate** | `_shared/eval/SPEC.md` + `_shared/standards/dod-per-deliverable.md` | 3K |
| **Rule cụ thể** | `_shared/rules/{NN}-*.md` (chỉ file liên quan, 11 rules) | 2K mỗi rule |
| **Versioning / project pin** | `_shared/standards/versioning-pinning.md` | 2K |
| **Vendor watch / external deps** | `_shared/standards/external-dependencies.md` | 2K |
| **Voice / studio vs client / data privacy** | `_shared/standards/boundaries.md` | 2K |
| **Thêm/bớt agent / knowledge / rule / workflow (CHANGE PROTOCOL)** | `_shared/standards/change-management.md` | 4K |
| **Add project attachment (skill addon · doc · GitHub repo)** | `_shared/standards/project-attachments.md` + `change-management.md` §5.5 | 4K |
| **Knowledge baseline / industry** | `knowledge/data/baselines/B{XX}.json` hoặc `industries/I{YY}.json` | tuỳ |
| **Strategy / OKR / phase plan** | `business-strategy/01` + `03` + `09` | 6K |

**Quy tắc token**: nếu task hoàn thành được < 8K tokens load → KHÔNG load thêm. Nếu cảm thấy thiếu → load 1 file lá tiếp, không load cả folder.

---

## 6. Routing Manifest cho AI Agent

Khi 1 agent được dispatch, loader phải nạp theo thứ tự (xem `W04` §2 + spec `_shared/standards/memory-runtime.md`):

**Mandatory** (luôn luôn, ~10K tokens):
1. `_shared/prompts/RULES-PREAMBLE.md`
2. Skill card riêng: `_shared/.agents/tier-{N}/{agent-id}.md`
3. Phase spec: `experience/workspace/docs/pipeline/P{N}-*.md` (chỉ §Input/Output Contract)

**Context-dependent** (chọn theo task, ~5–20K):
4. **Layer E — Episodic** (this-project): `projects/{id}/_meta.json` + `_state.json` + previous phase output + relevant `decisions/ADR-*.md`
5. **Layer S — Semantic** (cross-project knowledge): theo `_meta.json.knowledge_match.memory_paths[]` → `knowledge/docs/memory/B*-learnings.md`, `I*-learnings.md` (đã có 22 file thật)
6. **Layer W — Working** (transient, runtime): `projects/{id}/.memory/shared/{phase}/pool.md` (parallel coordination), `working/{run-id}/scratch.md` (multi-step chain), `episodic-buffer/retry-feedback.md` (retry attempt 2+) — chỉ load khi run-type yêu cầu

**Optional** (nếu vẫn còn budget):
7. 1 retro project tương tự trong `knowledge/industries/I{NN}/memory/`
8. 2–3 examples từ `_shared/eval/golden-sets/{skill}/`

**Hard cap**: tổng ≤ **60% context window**. Vượt → cắt optional trước, rồi Layer W, rồi memory paths trong S, không bao giờ cắt mandatory hoặc Layer E core.

### Memory Layer Quick Map

| Layer | Lifetime | Path | Khi đọc | Khi ghi |
|---|---|---|---|---|
| **S — Semantic** | Permanent (cross-project) | `knowledge/docs/memory/` | Khi cần fact / SOTA / industry context | Sau Fri retro promotion ceremony |
| **E — Episodic** | Project lifetime + 1Y archive | `projects/{id}/_state.json`, `_meta.json`, `decisions/`, `99-retro.md` | Mọi run trong project | Phase transition, decision, retro |
| **W — Working** | TTL 24h–phase | `projects/{id}/.memory/` (gitignored) | Multi-step / parallel / retry | Trong run, append-only |

W → E → S = promotion path. Spec đầy đủ: `_shared/standards/memory-runtime.md`.

---

## 7. Convention nhanh

- File path luôn dùng **absolute từ workspace root**, format `@path/to/file.md` hoặc `@path/to/file.md:LINE`.
- Markdown: H1 1 cái, H2 chia section, table cho data, code fence cho lệnh.
- Frontmatter (nếu có): YAML keys `last_updated`, `version`, `owner`.
- File mới → kebab-case + extension đúng. Phase doc: `P{N}-NAME.md`. Workflow: `W{NN}-name.md`.
- Commit message: `{project-id} P{N}: {what} via {agent-id} + human-edit`.

---

## 8. When in Doubt

| Tình huống | Action |
|---|---|
| Không biết rule nào áp dụng | Đọc `_shared/rules/00-MASTER-RULES.md` rồi quay lại |
| Không biết phase nào kế tiếp | `_state.json.lifecycle.current_phase` + `experience/workspace/docs/pipeline/README.md` |
| Output mâu thuẫn doc cũ | Doc mới hơn (`last_updated` lớn hơn) thắng. Update doc cũ ngay. |
| Cần thay đổi scope | Viết SCR (`_shared/templates/project/SCR-template.md`), không edit SOW |
| Cảm thấy thiếu doc | Hỏi vào `#studio-ops`; KHÔNG tạo doc mới mà không bàn |

---

## 9. Top-Level Files (root)

| File | Khi đọc | Đối tượng |
|---|---|---|
| **`BRIEF-INTAKE.md`** | **⭐ ROOT TEMPLATE — đề bài project. Copy ra `projects/{id}/BRIEF-INTAKE.md` mỗi project mới, CEO/khách điền 6 block, engine consume ở P0.1** | **CEO / Client / Engine** |
| **`HOW-TO.md`** | **⭐ Task-indexed cookbook — "tôi muốn làm X" → đọc file Y. 40 use cases / 8 nhóm.** | **All — daily lookup** |
| **`_shared/.agents/tier-0-executive/R-CoS-chief-of-staff.md`** | **⭐ R-CoS concierge agent — automation lễ tân thay user thao tác mkdir/cp/dispatch/track. Bootstrap "Đóng vai R-CoS" đầu Claude Code session** | **CEO / CTO daily driver** |
| **`START-HERE.md`** | **Người mới — đọc 30' hiểu toàn bộ + reading order + project start steps** | **Human (mới)** |
| `PROJECT.md` (this) | Token-optimal wrapper, nhanh hơn START-HERE | Human + AI |
| `ONBOARDING.md` | 5-day plan role-specific (Dev/Sales/Designer/COO) | Human |
| `README.md` | Navigation folder map chi tiết | Human |
| `01-FRAMEWORK.md` | Hiểu sâu philosophy 5-layer + studio boundary | Human |
| `00-OPERATING-MANUAL.md` | Master flow input → output (5 path + multi-path coordination) | Human |
| `_shared/prompts/AGENT-MANUAL.md` | **AI agent đọc 1 lần → hiểu toàn bộ operating model** | **AI agent** |
| `_shared/standards/document-catalog.md` | Studio ship gì khi Sprint X về (META-INDEX) | Both |
| `_shared/standards/learning-system.md` | Cách framework học từ mỗi project (continuous loop) | Both |
| `_shared/standards/glossary.md` | Authoritative terminology | Both |

Mọi file khác đều nằm trong 6 folder `knowledge/`, `_shared/`, `experience/`, `projects/`, `business-strategy/`, `studio/wisdom/`.

---

## 10. Update Rule

File này = wrapper. Update khi:

- Thêm/bớt 1 layer (rare)
- Đổi top-level convention
- Thêm task pattern phổ biến mới vào §5

KHÔNG update khi: chỉ đổi nội dung 1 file leaf — chỉ cập nhật `last_updated` của file leaf đó.

Update cadence kỳ vọng: **≤ 1 lần / tháng**. Nếu update nhiều hơn → wrapper đang bị bloat, cần refactor.

---

*Wrapper v1.0 · ~3,500 tokens · designed for token-optimal context loading*
