# 01 — Framework Philosophy: 5 Tầng Hoạt Động

**Mục đích**: file này giải thích **TẠI SAO chia 5 tầng** và **mỗi tầng có vai trò gì** trong workspace `my_learning/`. Đọc sau `README.md`, trước khi đọc bất kỳ folder nào.

**Đối tượng đọc**: founder, contractor, agent (system prompt context), tương lai khi codebase scale.

**Quy tắc vàng**:
> *"Knowledge feeds Skills. Skills, applied through Experience, become Projects. Strategy decides what Projects matter."*

**v1.1 update (2026-04-27)**: thêm `studio/wisdom/` boundary (studio-internal, separate from client knowledge). 11 rule files (00-100). Pipeline mở rộng Path A/B/C/D + P10 long-term. Xem cập nhật ở §2 (L2) + §6 (boundary).

---

## 1. Vấn Đề Cần Giải Quyết

Một AI studio điển hình thường rơi vào 1 trong 3 trap:

| Trap | Triệu chứng | Nguyên nhân |
|---|---|---|
| **Knowledge cathedral** | Viết 100KB research, 0 client, 0 dollar | Không phân biệt tri thức (passive) với kỹ năng (active) |
| **Project chaos** | Mỗi dự án tự viết prompt + eval + DoD lại từ đầu | Không có toolbox dùng chung |
| **Strategy drift** | Build random feature theo cảm hứng, mất focus ICP | Không có Layer 5 quyết định ưu tiên |

→ 5-layer model giải quyết bằng **separation of concerns** rõ ràng. Mỗi tầng có nhiệm vụ KHÔNG chồng lấn tầng khác.

---

## 2. Năm Tầng — Định Nghĩa Chính Xác

### L1 — KNOWLEDGE *("Tủ sách / kho tàng tri thức")*

**Folder**: `knowledge/`

**Bản chất**: passive — sách vở, taxonomies, research data, SOTA reports.

**Chứa**:
- 15 AI baselines (B01-B15) × 20 industries (I01-I20) — MAESTRO matrix
- Domain taxonomies (`AI-CAPABILITY-TAXONOMY.md`, `AI-INDUSTRY-TAXONOMY.md`)
- Conventions, schemas (`CONVENTIONS.md`, `DATA-SCHEMA.md`)
- Per-baseline research-report + L3.json (post research)
- Memory: cumulative learnings từ project (`memory/B0X-learnings.md`)

**KHÔNG chứa**:
- ❌ Code (đó là `experience/workspace/apps/` hoặc `projects/`)
- ❌ Agent prompts (đó là `_shared/.agents/`)
- ❌ Pricing hay business decisions (đó là `business-strategy/`)
- ❌ Per-client deliverable (đó là `projects/{P-ID}/`)

**Update cadence**: per-baseline batch (1 baseline L3 / tháng — Phase 1). Re-research khi outdated > 6 tháng hoặc client trigger.

**Owner**: P3 (domain validation) + R-α/β/γ agents (research generation) + P1 (LLMOps eval gate).

---

### L2 — AGENTS & SKILLS *("Tác nhân & kỹ năng chung")*

**Folder**: `_shared/`

**Bản chất**: active tools — reusable across mọi project, mọi scope, mọi industry.

**Chứa** (theo sub-folder):

| Sub-folder | Nội dung | Ví dụ file |
|---|---|---|
| `.agents/` | 25+ skill cards (tier 0-5) | `R-alpha-research.md`, `R-LLMOps-llm-operations.md`, `R-Dxx-template.md` |
| `prompts/` | Reusable prompt templates + RULES-PREAMBLE inject | `RULES-PREAMBLE.md`, `KICKOFF-PROMPT.md`, `RE-RESEARCH.md` |
| `eval/` | LLM-judge framework + golden sets per agent | `SPEC.md`, `golden-sets/R-alpha.yaml` |
| `rules/` | **11 rule files** (00 master → 100 orchestration) | `00-MASTER-RULES.md`, `80-harness-rules.md`, `90-lifecycle-rules.md`, `100-orchestration-rules.md` |
| `standards/` | DoD, memory hygiene, cost, **knowledge curation, versioning, vendor watch, ADR index, boundaries** | `knowledge-curation.md`, `versioning-pinning.md`, `external-dependencies.md`, `decision-log-index.md`, `boundaries.md` |
| `templates/` | Project + baseline + industry scaffolds + **harness/ folder** | `templates/project/00-intake.md`, `templates/project/harness/manifest.yaml` |
| `decisions/` | Framework-level ADRs | `ADR-{NNNN}-{slug}.md` |

**KHÔNG chứa**:
- ❌ Knowledge content (đó là L1)
- ❌ Per-project artifact (đó là L4)
- ❌ Pipeline workflow definition (đó là L3)
- ❌ Strategic decision (đó là L5)

**Update cadence**: per-prompt-version (file `business-strategy/07` §5 → eval-driven promotion). Skill card v1.0 → v1.1 sau eval pass + 30+ runs.

**Owner**: P1 (LLMOps) primary. P3 cung cấp domain few-shot examples.

**Critical**: đây là **moat** của studio. Skill card + eval framework + prompt versioning quyết định chất lượng output → quyết định pricing power.

---

### L3 — EXPERIENCE *("Phương pháp / trải nghiệm")*

**Folder**: `experience/`

**Bản chất**: bridge giữa knowledge (lý thuyết) và project (thực hành) — methodology, patterns, anti-patterns, simulation.

**Chứa**:
- Pipeline blueprint: `AGENT-WORKSPACE-PIPELINE.md` (orchestration), `PRODUCT-DEVELOPMENT-PIPELINE.md` (9-phase)
- Workflow definition: `workspace/SYSTEM-FLOW.md` — luồng dữ liệu từ intake → delivery
- **Path A pipeline** (customer brief): `workspace/docs/pipeline/P0-INTAKE.md` … `P9-DELIVERY.md` + `P10-LONG-TERM.md`
- **Path B pipeline** (internal product): `workspace/docs/pipeline/PATH-B-PRODUCT.md`
- **Path C pipeline** (content): `workspace/docs/pipeline/PATH-C-CONTENT.md`
- **Path D pipeline** (knowledge re-research): `workspace/docs/pipeline/PATH-D-RESEARCH.md`
- **Workflow SOPs W01-W12**: daily, weekly, dispatch, incident, 90-day bootstrap, cross-pipeline handoff, **framework retro (W08), agent onboarding (W09), cross-path priority (W10), knowledge review (W11), phase rewind (W12)**
- Quality gates: `workspace/docs/quality/quality-gates.md` (G0-G7 criteria)
- Simulation: `workspace/docs/SIMULATION-EXAMPLE.md` — example walkthrough
- Issues + lessons: `workspace/DEV-ISSUES.md`
- Engine code: `workspace/apps/orchestrator/`, `workspace/apps/dashboard/` (sẽ build từ Phase 1 Week 1+)

**KHÔNG chứa**:
- ❌ Skill cards (đó là L2 — agent definition is reusable, methodology is workflow)
- ❌ Per-project artifact (đó là L4)
- ❌ Knowledge content (đó là L1)

**Distinction quan trọng — Experience vs _shared**:
- `_shared/.agents/R-alpha-research.md` = **agent skill card** (WHO/HOW agent acts) — reusable atomic
- `experience/workspace/docs/pipeline/P1-DISCOVERY.md` = **phase workflow** (KHI nào invoke agents nào, theo thứ tự nào) — composition

→ `_shared/` = LEGO bricks. `experience/` = instruction manuals on how to assemble bricks into specific shapes.

**Update cadence**: per-pipeline-version. Khi ≥3 project chỉ ra cùng anti-pattern → update phase doc + lessons.

**Owner**: P2 (engine code + workflow) + P1 (eval pipeline).

---

### L4 — PROJECTS *("Dự án cụ thể, A-Z")*

**Folder**: `projects/{P-YYYYMM-NNN}/`

**Bản chất**: concrete execution — per-client work, bounded scope, timeline, deliverable.

**Chứa** (per project, theo `business-strategy/13` §3 + `_shared/templates/project/`):

```
projects/P-202604-001/
├── BRIEF-INTAKE.md                 # ⭐ ENTRY — đề bài CEO/khách điền (copy từ root template)
├── 00-intake.md                    # P0 phase output (engine auto-fills từ BRIEF)
├── _attachments/                   # Per-project docs + repo refs (project-attachments.md)
│   ├── _index.md
│   ├── docs/                       # PDF/MD/codebase (case 2)
│   └── repos/_refs.yaml            # GitHub repo refs commit-pinned (case 3)
├── .agents/                        # Per-project skill addons (case 1)
│   ├── _overrides.yaml
│   └── R-{X}-{addon}.md
├── 01-discovery/                   # P1 phase outputs
│   ├── discovery-report.md
│   └── _checkpoints/alpha.json
├── 02-proposal/                    # P2 outputs
├── 03-architecture/                # P3 (Scope B+)
├── 04-design/                      # P4 (Scope C+) — parallel a/b/c/d/e
├── 05-planning/
├── 06-dev-guides/
├── 07-qa/
├── 08-deploy/
├── 09-delivery-and-retro/          # P9
│   ├── final-package.md
│   ├── retro.md
│   └── case-study-draft.md (anonymized, gated)
├── _state.json                     # Pipeline state machine
└── _meta.json                      # Project metadata: ICP, scope, pricing, KPI, attachments[]
```

**Project entry point**: `BRIEF-INTAKE.md` (copy từ root template `/BRIEF-INTAKE.md`). CEO/khách điền 6 block → engine parse ở P0.1 → R-Match P0.2 → attachment intake P0.2c → team assembly P0.3.

**KHÔNG chứa**:
- ❌ Reusable templates (đó là `_shared/templates/`)
- ❌ Generic knowledge (đó là L1)

**Standard cho mọi quy mô**: cùng skeleton dùng cho:
- MMO PDF $30 (Sprint A: P0-P2 only, ~1 week, 1 person)
- B2B Audit $1,500 (Sprint A+: P0-P3, ~2 weeks, 2 people)
- Sprint B Architecture $5K (P0-P5)
- Sprint C Full Design $15K (P0-P7)
- Sprint D Enterprise $50K+ (P0-P9 full)

→ Khác chỉ ở **phase invoked + agent count + timeline + budget**. Skeleton không đổi.

**Lifecycle**:
- `[OPEN]` — intake done, awaiting kickoff (file 12 §2 SQL → file 13 P0)
- `[ACTIVE]` — pipeline running (P1-P8)
- `[DELIVERED]` — handover done (P9 + file 14 §2)
- `[ARCHIVED]` — > 6 tháng sau delivery, move sang `_archive/projects/`

**Owner**: P3 (project PM, client interface) + Engine (auto execute) + CEO/P1 (review gates).

---

### L5 — BUSINESS STRATEGY *("Định hướng")*

**Folder**: `business-strategy/` (18 files, ✅ done)

**Bản chất**: strategic decisions — what to build, who to serve, how to price, where to channel.

**Chứa**: 18 files (01-18) covering strategy, ICP, KPI, capability catalog, channels, founder dev, agent dev, CEO leverage, execution plan, pricing, eval framework spec, sales, delivery, customer success, ops, brand, DoD, vendor proposal.

**KHÔNG chứa**:
- ❌ Implementation detail (đó là L2/L3/L4)
- ❌ Knowledge research (đó là L1)
- ❌ Daily ops execution log (đó là L4 retro hoặc L3 issues)

**Update cadence**: monthly KPI review (file 03 §6); quarterly strategy adjust; annual phase boundary review.

**Owner**: All 3 founders, CEO final sign-off on strategy pivots.

---

### Studio Boundary — `studio/wisdom/` (NEW v1.1)

**Folder**: `studio/wisdom/`

**Bản chất**: studio-internal knowledge — **separate** from client-facing `knowledge/`. Closes lỗ hổng "studio bias bleed vào client baseline".

**Chứa**:
- CEO opinions, hot takes, voice-of-customer notes
- ICP deeper insights (beyond `business-strategy/02`)
- Internal retro patterns ("what we learned about VN MMO seller psychology")
- Churn patterns archive
- High-performer hooks (content)
- Voice registry per `_shared/standards/boundaries.md`

**KHÔNG chứa**:
- ❌ Client deliverable content (đó là L4)
- ❌ Industry baseline used in client work (đó là L1 `knowledge/`)
- ❌ Strategic decisions (đó là L5 `business-strategy/`)

**Crossing rule** (per `_shared/standards/boundaries.md` §1):
- `studio/wisdom/` → client deliverable: ❌ default, requires ADR + CEO sign
- Client deliverable retro insight → `studio/wisdom/`: ✅ with anonymization

**Engine enforcement**: client-delivery agents (R-α, R-β, R-σ in P1-P9) cannot read `studio/wisdom/`. Strategic agents (R-CONTENT, R-MKT) can — for tone calibration.

**Owner**: CEO + COO.

---

## 3. Tại Sao Tách 5 Tầng?

### Argument 1 — Independent evolution

| Change | Touches | Doesn't touch |
|---|---|---|
| Switch Claude → GPT-5 | L2 (`_shared/.agents/`) + L3 engine code | L1, L4, L5 |
| New ICP (e.g., F: solo developer) | L5 file 02 | L1-L4 |
| Outdated baseline B05 | L1 only (re-research) | L2-L5 |
| New phase G2 quality gate | L3 + L2 standards | L1, L5 |
| New project | L4 only | L1-L3, L5 (already decided) |

→ Mỗi loại change touch ít nhất số tầng. Hệ thống dễ scale.

### Argument 2 — Right tool per layer

| Layer | Format | Tool |
|---|---|---|
| L1 Knowledge | Markdown + JSON | Markdown editor + Git |
| L2 Skills | Markdown skill cards + YAML golden sets | Promptfoo + Git |
| L3 Experience | Markdown + diagrams + code | Code IDE + Mermaid |
| L4 Projects | Per-template Markdown + artifacts | Notion/Markdown + Engine UI |
| L5 Strategy | Markdown decision docs | Markdown + Git |

→ Cùng workspace, không cùng workflow. Tách thư mục giúp công cụ phù hợp.

### Argument 3 — Compounding through promotion

```
Project insight (L4)
    ↓ promote when pattern across ≥3 projects
Memory file in baseline (L1)
    ↓ promote when validated by R-eval ≥ 8.5
Skill card update (L2 v1.x → v1.x+1)
    ↓ promote when 30+ production runs stable
Pipeline phase doc update (L3)
    ↓ promote when KPI gate trigger
Strategy adjustment (L5)
```

→ Compound learning có path rõ. Không insight nào bị "rơi mất".

### Argument 4 — Standard cho mọi quy mô

Cùng 5-layer dùng cho:
- 1 founder làm $99 PDF (chỉ invoke L1 + L4 minimal, skip L3 deep)
- 3 founder làm $50K enterprise SaaS (full L1-L5 active)
- 10-people studio M12+ (cùng skeleton, agent count + parallel project tăng)

→ Workspace KHÔNG cần restructure khi scale. Chỉ thêm folder con + tăng concurrent projects.

---

## 4. Cross-Layer Memory & Promotion Path

```
┌──────────────────────────────────────────────────────────┐
│ L4 Project retro                                          │
│   "B01 forecasting + 3PL VN: NBEATS beats Prophet sparse" │
└────────────┬─────────────────────────────────────────────┘
             │ if ≥3 projects same pattern
             ▼
┌──────────────────────────────────────────────────────────┐
│ L1 Memory: knowledge/docs/memory/B01-learnings.md         │
│   "VN sparse retail 3PL: prefer NBEATS over Prophet"     │
└────────────┬─────────────────────────────────────────────┘
             │ if R-eval validates ≥ 8.5 on golden set
             ▼
┌──────────────────────────────────────────────────────────┐
│ L2 Skill card update: _shared/.agents/R-alpha v1.1        │
│   System prompt now includes "Prefer NBEATS for sparse"   │
└────────────┬─────────────────────────────────────────────┘
             │ if 30+ production runs stable
             ▼
┌──────────────────────────────────────────────────────────┐
│ L3 Phase doc: experience/.../P1-DISCOVERY.md              │
│   Add "Sparse retail check" to discovery checklist        │
└────────────┬─────────────────────────────────────────────┘
             │ if KPI improves visibly (eval +0.5, win-rate +5%)
             ▼
┌──────────────────────────────────────────────────────────┐
│ L5 Strategy: business-strategy/04 catalog                 │
│   Highlight "Sparse retail forecasting" as differentiator │
└──────────────────────────────────────────────────────────┘
```

**Quality gate per promotion** — mỗi level lên cần evidence:
- L4 → L1: ≥3 projects + manual P3 review
- L1 → L2: R-eval golden set pass ≥ 8.5
- L2 → L3: 30+ runs production stable, no regression
- L3 → L5: KPI +0.5 eval point hoặc +5% conversion / win-rate

---

## 5. Anti-Pattern — Sai Lầm Phổ Biến

| Anti-pattern | Triệu chứng | Đúng cách |
|---|---|---|
| Đặt skill card vào `experience/` | Duplicate khi `_shared/.agents/` có | Skill card chỉ ở L2 |
| Đặt pricing vào `_shared/standards/` | Pricing là chiến lược, không phải standard | Pricing chỉ ở L5 file 10 |
| Per-project tự viết prompt riêng | Drift, không version, không eval | Mọi prompt từ L2 templates |
| Update knowledge giữa project chạy | Race condition, project lock baseline version | Lock at intake; new version áp dụng project sau |
| Build L1 knowledge cho ngành chưa có buyer | Theory cathedral, no $ | Build L3 chỉ sau ≥1 paying project chạm cell |
| Strategy doc dài 30 trang về vision | Không actionable | L5 mỗi file có decision rule + numeric trigger |
| Code in `knowledge/` | L1 là docs only | Code in `experience/workspace/apps/` hoặc `projects/` |

---

## 6. Khi Add Tầng Mới — Quyết Định Logic

Nếu bạn nghĩ cần thêm tầng (vd: "Tầng 6 — Community"), hỏi 5 câu:

1. **Reusable across projects?** → có thì L2; không thì L4
2. **Strategic decision?** → có thì L5
3. **Passive reference data?** → L1
4. **Workflow / methodology?** → L3
5. **Per-client execution?** → L4

→ Hầu như mọi case fit 1 trong 5. Resist adding new layer.

---

## 7. Mapping với 00-OPERATING-MANUAL

`00-OPERATING-MANUAL.md` định nghĩa "3-layer" (Knowledge / Engine / Business). Đó là **simplification cũ** — giờ refactor thành 5-layer:

| 00-OPERATING-MANUAL gọi | 01-FRAMEWORK refine thành |
|---|---|
| Layer 1 KNOWLEDGE | L1 KNOWLEDGE *(không đổi)* |
| Layer 2 ENGINE | L2 AGENTS & SKILLS + L3 EXPERIENCE *(tách 2)* |
| Layer 3 BUSINESS | L5 BUSINESS STRATEGY *(không đổi)* |
| (implicit) | L4 PROJECTS *(làm rõ)* |

→ 5-layer trong file này là **canonical**. Khi xung đột với 00-OPERATING-MANUAL, file này thắng.

`00-OPERATING-MANUAL.md` vẫn giữ vai trò master flow doc (5 PATHs xử lý input mới), nhưng terminology refer đến 5-layer chứ không phải 3-layer cũ. Sẽ update §1 của manual trong Step tiếp theo nếu cần.

---

## 8. Check List Cuối — Trước Khi Add 1 File Mới

Before tạo file mới ở bất kỳ đâu, trả lời:

- [ ] File này thuộc tầng nào (L1/L2/L3/L4/L5)?
- [ ] Có file/folder tương tự đã có chưa? (search trước, không duplicate)
- [ ] Có cross-reference từ file này sang 1+ tầng khác? (link bằng `@path:line`)
- [ ] Owner rõ?
- [ ] Update cadence rõ?
- [ ] Có "KHÔNG chứa" rule để tránh feature creep?

→ Nếu trả lời tất cả "có" mà file vẫn thiếu → đặt đúng tầng đúng folder. Else → reconsider.

---

*Last updated: 2026-04-26*
*This file is canonical for layer terminology. Override conflicting docs.*
