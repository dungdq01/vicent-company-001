# projects/ — Dự Án Cụ Thể (L4)

**Layer**: L4 — Projects | **Định nghĩa**: [`@../01-FRAMEWORK.md`](../01-FRAMEWORK.md) §L4

**Mục đích**: nơi chứa **per-client deliverable** từ A-Z. Mỗi project = 1 folder bounded scope, timeline, artifact, retro.

**Owner**: P3 (project PM, client interface). Engine auto-execute. P1 review gates.

---

## 📂 Convention Naming

```
projects/P-{YYYYMM}-{NNN}[-{client-slug}]/
```

`{client-slug}` suffix optional — improve discoverability. Sort vẫn theo P-YYYYMM-NNN prefix.

Ví dụ:
- `P-202604-001` = project đầu tiên tháng 4/2026 (no slug)
- `P-202605-007-mua-si-tot` = project thứ 7 tháng 5/2026 (with client slug)
- `D-202604-001-acme-3pl` = dry-run project (D- prefix)

`NNN` reset mỗi tháng. Tăng dần theo intake order.

---

## 📂 Per-Project Folder Structure

Theo `business-strategy/13-product-delivery-process.md` §3 + `_shared/templates/project/`:

```
projects/P-202604-001/
├── BRIEF-INTAKE.md                 # ⭐ ENTRY POINT — đề bài CEO/khách điền (copy từ root template)
├── _meta.json                      # ICP, scope, pricing, status, attachments[] schema
├── _state.json                     # Pipeline state (open/active/delivered)
├── _attachments/                   # ⭐ Per-project docs + repo refs (project-attachments.md)
│   ├── _index.md                   # human-readable manifest (mirror _meta.json.attachments)
│   ├── docs/                       # case 2: PDF/MD/codebase from client (PII-scanned)
│   └── repos/                      # case 3: GitHub repo refs
│       └── _refs.yaml              # commit-pinned, license-checked
├── .agents/                        # ⭐ Per-project skill addons (case 1)
│   ├── _overrides.yaml             # which addon overrides which base agent
│   └── R-{X}-{addon}.md            # addon skill cards (append/replace_sections/new_persona)
├── 00-intake.md                    # P0 — engine auto-fill từ BRIEF-INTAKE.md (BANT+Fit + R-Match output)
├── 01-discovery/                   # P1 — research + adapt
│   ├── discovery-report.md
│   └── _checkpoints/
├── 02-proposal/                    # P2 — Sprint A delivery
│   └── proposal.md
├── 03-architecture/                # P3 — Sprint B+ only
├── 04-design/                      # P4 — Scope C+ (parallel a/b/c/d/e)
├── 05-planning/                    # P5
├── 06-dev-guides/                  # P6
├── 07-qa/                          # P7
├── 08-deploy/                      # P8
└── 09-delivery-and-retro/          # P9
    ├── final-package.md
    ├── retro.md
    └── case-study-draft.md         # (anonymized, gated)
```

Phase nào không invoke (theo scope) → folder không tạo.

---

## 🎯 Standard Cho Mọi Quy Mô

Cùng skeleton dùng cho:

| Project type | Scope | Phases | Timeline | Budget | Agent count |
|---|---|---|---|---|---|
| MMO PDF $30 | A | P0-P2 only | 1 week | $0.30-0.50 API | 4-5 |
| B2B Audit $1.5K | A+ | P0-P3 | 2 weeks | $0.80-1.20 | 6-8 |
| Sprint B Architecture $5K | B | P0-P5 | 3-4 weeks | $2-4 | 12-15 |
| Sprint C Full Design $15K | C | P0-P7 | 6 weeks | $4-8 | 15-20 |
| Sprint D Enterprise $50K+ | D | P0-P9 | 10-14 weeks | $8-15 | 20+ |

→ Skeleton không đổi. Phase invoked + agent count khác. Đó là principle "standard cho mọi quy mô".

---

## 🔄 Lifecycle

| Status | Trigger | Folder location |
|---|---|---|
| `[OPEN]` | Intake done, awaiting kickoff | `projects/{P-ID}/` |
| `[ACTIVE]` | Pipeline running P1-P8 | `projects/{P-ID}/` |
| `[DELIVERED]` | P9 done + client signed acceptance | `projects/{P-ID}/` |
| `[ARCHIVED]` | > 6 tháng sau delivery | `_archive/projects/{P-ID}/` |

Status ghi trong `_meta.json`. Engine + dashboard UI đọc field này.

---

## 🔗 Khi Nào Refer Đâu

| Nhu cầu | Path |
|---|---|
| Template scaffold mới | `@../_shared/templates/project/` |
| Skill card cho R-α invoke | `@../_shared/.agents/tier-1-research/R-alpha-research.md` |
| Phase workflow chi tiết | `@../experience/workspace/docs/pipeline/P{N}-*.md` |
| DoD per deliverable | `@../_shared/standards/dod-per-deliverable.md` |
| Knowledge baseline cần load | `@../knowledge/data/baselines/B0X-*.json` |
| Customer comms playbook | `@../business-strategy/14-customer-success-playbook.md` |
| Pricing reference | `@../business-strategy/10-pricing-sheet.md` |

---

## 🚀 Khởi Tạo Project Mới

```
1. Tạo folder projects/P-{YYYYMM}-{NNN}-{slug}/
2. Copy ../BRIEF-INTAKE.md (root template) → projects/{id}/BRIEF-INTAKE.md
3. CEO/khách điền 6 block trong bản copy
4. Ra lệnh "Dispatch P0.1 với projects/{id}/BRIEF-INTAKE.md"
5. Engine: parse BRIEF → fill 00-intake.md → R-Match → team assembly → CEO duyệt → P1
```

KHÔNG bỏ qua BRIEF-INTAKE.md — đó là input chính thức của P0.1.

### Add Attachment cho project (sau khi tạo skeleton)

Per `_shared/standards/project-attachments.md` + `change-management.md` §5.5:

| Case | Cần làm | Process |
|---|---|---|
| **1. Skill addon cho agent** | Project có agent cần skill chuyên biệt | Tạo `.agents/R-{base}-{addon}.md` + update `.agents/_overrides.yaml` + declare `_meta.json.attachments.agent_addons[]` |
| **2. Doc / codebase** | Client gửi PDF, RFP, code legacy | Copy vào `_attachments/docs/` → R-σ extract `.txt` → PII scan → declare `_meta.json.attachments.docs[]` |
| **3. GitHub repo ref** | Reference architecture, OSS lib | Append vào `_attachments/repos/_refs.yaml` (commit SHA pin) → R-SEC license check → declare `_meta.json.attachments.repos[]` |

Attachment intake runs at **P0.2c** (`P0-INTAKE.md` Step 0.2c). Engine W04 §2.6 loads filtered by agent×phase per dispatch.

---

## 📝 Filing Rule

- 1 project = 1 folder. KHÔNG tạo file project ngoài folder của project đó.
- Per-project knowledge insight → ghi vào `09-delivery-and-retro/retro.md`. Sau ≥3 projects cùng pattern → P3 promote sang `knowledge/docs/memory/`.
- Anonymized case study draft (`case-study-draft.md`) → P3 polish + client approval → publish theo channel `business-strategy/05`.

---

## 🚫 Anti-Pattern

- Đặt template scaffold ở đây → đó là `_shared/templates/`
- Đặt agent skill card ở đây → đó là `_shared/.agents/`
- 1 client × nhiều project → folder riêng cho mỗi project, không nest
- Mix engine state với deliverable → engine state ở `experience/workspace/projects/{id}/`, deliverable ở đây

---

*Last updated: 2026-04-26*
