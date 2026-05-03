# _shared/ — Tác Nhân & Kỹ Năng Chung (L2)

**Layer**: L2 — Agents & Skills | **Định nghĩa**: [`@../01-FRAMEWORK.md:L2`](../01-FRAMEWORK.md)

**Mục đích**: nơi chứa **mọi tài nguyên dùng chung** xuyên suốt mọi dự án, mọi quy mô — agents, prompts, eval, standards, templates. Đây là **toolbox** của studio.

**Owner**: P1 (LLMOps lead) primary. P3 cung cấp domain few-shot examples. P2 implement orchestrator integration.

---

## 🧰 Sub-folder

| Folder | Vai trò | Critical Path? |
|---|---|---|
| `rules/` | **Studio constitution** — **11 rule files** (00 master + 10 stack + 20 code + 30 exec + 40 docs + 50 comms + 60 sec + 70 qual + 80 harness + 90 lifecycle + 100 orchestration) | 🔴 **Yes — agent constitution** |
| `.agents/` | 57 skill cards across 6 tiers (T0 charters + **R-CoS concierge** / T1 research / T2 engineering / T3 domain / T4 delivery / T5 business) | 🔴 Yes — agents không chạy nếu thiếu |
| `prompts/` | **RULES-PREAMBLE** (auto-inject 11 rules + harness contract + orchestration contract) + KICKOFF + RE-RESEARCH + PROJECT-INTAKE + RETRO | 🔴 Yes — preamble mandatory |
| `eval/` | LLM-judge framework + golden sets + scoring rubric + Layer 3 harness compliance | 🔴 Yes — moat của studio |
| `standards/` | **8 standards**: DoD, memory hygiene, cost budgets, **knowledge curation, versioning-pinning, external dependencies, decision-log index, boundaries** | 🟡 Important |
| `templates/` | Project + baseline + industry skeleton + **harness/ folder template** | 🟡 Important |
| `decisions/` | Framework-level ADRs (rule changes, agent changes, knowledge structure) | 🟡 Important |

---

## 🎯 Nguyên Tắc

### 1. Single Source of Truth
Mỗi concept (skill card, prompt template, eval rubric) chỉ ở 1 chỗ duy nhất trong `_shared/`. Nơi khác chỉ link `@path:line`, không copy.

### 2. Reusable Across Project Sizes
Cùng skill card R-α dùng cho:
- $30 PDF MMO (1 invoke, scope A)
- $50K enterprise (10+ invokes, scope D)
→ Skill card không thay đổi theo project size, chỉ context input thay đổi.

### 3. Versioned + Eval-Gated
Mỗi update prompt/skill card phải:
- Bump version trong frontmatter (v1.0 → v1.1)
- Pass golden set eval ≥ 7.5
- Ghi changelog `_shared/.agents/CHANGELOG.md`

### 4. KHÔNG Chứa
- ❌ Knowledge content (→ `knowledge/`)
- ❌ Per-project artifact (→ `projects/{id}/`)
- ❌ Pipeline workflow (→ `experience/workspace/docs/pipeline/`)
- ❌ Strategic decisions (→ `business-strategy/`)
- ❌ App code (→ `experience/workspace/apps/`)

---

## 🔗 Cross-References

| Concept | Source location | Used by |
|---|---|---|
| Skill cards | `_shared/.agents/tier-{N}/R-{name}.md` | `experience/` engine, `knowledge/` research pipeline |
| Eval framework | `_shared/eval/SPEC.md` | Every agent invoke (gate before commit) |
| KICKOFF prompt | `_shared/prompts/KICKOFF.md` | New project intake (P0), new baseline research |
| Project template | `_shared/templates/project/` | `projects/{P-ID}/` scaffold |
| DoD standards | `_shared/standards/dod-per-deliverable.md` | Mirror của `business-strategy/17` |

---

## 📝 Update Cadence

| Asset | Trigger | Owner |
|---|---|---|
| Skill card v1.0 → v1.1 | Eval golden set + ≥30 production runs | P1 |
| Prompt template | Pattern across ≥3 projects | P1 |
| Eval rubric | Failure mode discovered | P1 + P3 |
| Standards | Strategic update (file 03 KPI) | P1 + CEO |
| Templates | Pipeline phase doc update | P2 |

---

## 🚫 Anti-Pattern

- Đặt project-specific prompt vào đây → đó là project context, không reusable
- Build skill card mà chưa có golden set test → khó eval, dễ drift
- Copy DoD từ `business-strategy/17` thành text độc lập → drift; dùng link reference

---

*Last updated: 2026-04-27 — v1.1 (added rules 80/90/100 + 5 new standards + harness template)*
