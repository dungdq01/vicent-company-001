---
file: HOW-TO
version: v1.1
last_updated: 2026-05-01
owner: COO + CTO
status: production
location: ROOT — task-indexed cookbook (peer of START-HERE / PROJECT.md)
purpose: "Tra cứu nhanh: 'tôi muốn làm X' → đọc file Y, theo workflow Z."
audience: All — humans (CEO/COO/CTO/PM/Dev/Sales/...) + agents need lookup
---

# HOW-TO — Cookbook Theo Use Case

> **Mục đích**: bạn có 1 ý định → tìm 1 dòng → biết đọc file gì, theo workflow nào, không cần đọc cả framework.
>
> **Khác `START-HERE.md`**: START-HERE = onboard 30' học framework. **HOW-TO này = tra cứu khi đã biết framework, đang chạy việc.**
>
> **Quy tắc đọc**: tìm row khớp → đọc CANONICAL doc đầu tiên → nếu cần sâu thêm → mở DEEPER doc. Đừng đọc hết.

---

## Quick Index — 8 Nhóm

| Nhóm | Câu hỏi điển hình | Section |
|---|---|---|
| **A. Project Lifecycle** | "Tạo project mới", "Dispatch agent", "Duyệt phase", ... | [§A](#a-project-lifecycle-ceo--pm) |
| **B. Framework Evolution** | "Add agent mới", "Modify rule", "Sunset workflow" | [§B](#b-framework-evolution-cto) |
| **C. Daily / Weekly Ops** | "Sáng làm gì?", "Có incident", "2 path concurrent" | [§C](#c-daily--weekly-ops) |
| **D. Knowledge Research** | "Cell missing → research", "Promote staging → data" | [§D](#d-knowledge-research) |
| **E. Business Pipelines** | "Sales lead", "Marketing campaign", "Expansion", "BD" | [§E](#e-business-pipelines) |
| **F. Agent / Skill Ops** | "Build dispatch prompt", "Voice contract", "New agent" | [§F](#f-agent--skill-ops) |
| **G. Decisions / Compliance** | "Write ADR", "Pricing", "PII", "License", "VN PDPA" | [§G](#g-decisions--compliance) |
| **H. Lookup / Discovery** | "Skill X ở đâu?", "Rule R-Y file nào?" | [§H](#h-lookup--discovery) |

---

## A. PROJECT LIFECYCLE *(CEO / PM)*

### A1 — Tôi muốn tạo project mới

```
1. mkdir projects/P-{YYYYMM}-{NNN}-{slug}/
2. cp BRIEF-INTAKE.md (root template) → projects/{id}/BRIEF-INTAKE.md
3. CEO/khách điền 6 block + (optional) block 7 attachments
4. Ra lệnh "Dispatch P0.1 với projects/{id}/BRIEF-INTAKE.md"
   Engine: P0.1 parse → P0.2 R-Match → P0.2c Attach → P0.3 Team → P0.4 Brief → P0.5 CEO confirm
```

| Đọc | Path |
|---|---|
| Template | `BRIEF-INTAKE.md` (root) |
| Naming convention | `projects/README.md` |
| P0 phase spec | `experience/workspace/docs/pipeline/P0-INTAKE.md` |
| Project skeleton | `_shared/templates/project/README.md` |

### A2 — Tôi muốn add skill / doc / repo cho project cụ thể

| Tôi muốn... | File điều chỉnh | Spec |
|---|---|---|
| **Skill addon cho agent** (vd: R-MLE biết "two-tower recsys") | Tạo `projects/{id}/.agents/R-MLE-recsys-addon.md` + `.agents/_overrides.yaml` + declare `_meta.json.attachments.agent_addons[]` | `_shared/standards/project-attachments.md` §1 |
| **Doc/codebase từ client** (PDF/MD/code) | Copy → `projects/{id}/_attachments/docs/` → R-σ extract `.txt` → PII scan → declare `_meta.json.attachments.docs[]` | `_shared/standards/project-attachments.md` §2 |
| **GitHub repo reference** | Append `_attachments/repos/_refs.yaml` (commit SHA pin) → R-SEC license check → declare `_meta.json.attachments.repos[]` | `_shared/standards/project-attachments.md` §3 |

→ **Workflow**: `change-management.md §5.5a/b/c` (3 checklists). Engine load tại P0.2c + W04 §2.6.

### A3 — Tôi muốn dispatch 1 agent cho phase X

```
1. Đọc workflow: experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md
2. Build prompt theo §2.1 (mandatory) + §2.5 (4-tier KV-cache) + §2.6 (attachments)
3. Verify all mandatory layers loaded + harness compliance
4. Dispatch → output gắn header per R-COM-01
```

| Đọc | Path |
|---|---|
| Dispatch SOP | `experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md` |
| Skill card | `_shared/.agents/tier-{N}/{agent-id}.md` |
| Phase spec | `experience/workspace/docs/pipeline/P{N}-*.md` |
| Rules constitution | `_shared/prompts/RULES-PREAMBLE.md` |

### A4 — Tôi muốn duyệt phase advance (CEO sign)

| Đọc | Path |
|---|---|
| DoD per deliverable | `_shared/standards/dod-per-deliverable.md` |
| Eval threshold | `_shared/eval/SPEC.md` + rule `_shared/rules/70-quality-rules.md` |
| Phase gate criteria | Phase doc `experience/workspace/docs/pipeline/P{N}-*.md` §DoD |

### A5 — Tôi phát hiện phase trước sai (đang ở P5, P3 sai)

→ Theo W12 phase rewind protocol.

| Đọc | Path |
|---|---|
| Phase rewind workflow | `experience/workspace/docs/workflows/W12-phase-rewind.md` |
| Lifecycle rule | `_shared/rules/90-lifecycle-rules.md` (R-LCY-05) |

### A6 — Tôi muốn project handoff / final delivery

| Đọc | Path |
|---|---|
| P9 phase | `experience/workspace/docs/pipeline/P9-DELIVERY.md` |
| Handoff template | `_shared/templates/project/09-final-package.md` |
| CS playbook | `business-strategy/14-customer-success-playbook.md` |

### A7 — Long-term client (post-30-day, QBR, annual review)

| Đọc | Path |
|---|---|
| P10 phase | `experience/workspace/docs/pipeline/P10-LONG-TERM.md` |
| QBR template | `_shared/templates/qbr-template.md` |

### A8 — Run retro project

| Đọc | Path |
|---|---|
| Retro template | `_shared/templates/project/99-retro.md` |
| Postmortem template | `_shared/templates/postmortem-template.md` |
| Learning system loop | `_shared/standards/learning-system.md` |

---

## B. FRAMEWORK EVOLUTION *(CTO)*

> **MASTER**: TẤT CẢ thay đổi structure phải qua `_shared/standards/change-management.md` (5 scenarios + propagation matrix). Section này là quick lookup; checklist chi tiết ở change-management.

### B1 — Add agent mới (studio-level)

| Đọc | Path |
|---|---|
| Onboarding workflow | `experience/workspace/docs/workflows/W09-agent-onboarding.md` |
| Change protocol | `_shared/standards/change-management.md` §1.1 |
| Skill card template | `_shared/.agents/README.md` (frontmatter spec) |
| Eval golden set | `_shared/eval/golden-sets/README.md` |

### B2 — Sunset agent

→ `change-management.md §1.2` + `90-lifecycle-rules.md` (R-LCY-02).

### B3 — Add knowledge node (baseline / industry / matrix cell)

| Đọc | Path |
|---|---|
| Curation standard | `_shared/standards/knowledge-curation.md` |
| K-review gate workflow | `experience/workspace/docs/workflows/W11-knowledge-review.md` |
| Change protocol | `_shared/standards/change-management.md` §2.1 |
| INDEX update | `knowledge/INDEX.md` |

### B4 — Update existing knowledge node (L1→L2→L3)

→ `change-management.md §2.2` + eval delta ≥ +0.3 per R-MAS-08.

### B5 — Add / modify harness rule

| Đọc | Path |
|---|---|
| Harness rules | `_shared/rules/80-harness-rules.md` |
| Change protocol | `_shared/standards/change-management.md` §3 |
| Preamble inject | `_shared/prompts/RULES-PREAMBLE.md` |

### B6 — Add workflow `W{NN}`

→ `change-management.md §4.1` + update `experience/workspace/docs/workflows/README.md`.

### B7 — Add pipeline phase step

→ `change-management.md §4.2` + W04 mandatory load + skill card I/O.

### B8 — Add new standard / folder / README

→ `change-management.md §5.4` (≥3 inbound refs minimum).

### B9 — Quarterly framework retro (W08)

| Đọc | Path |
|---|---|
| Retro workflow | `experience/workspace/docs/workflows/W08-framework-retro.md` |
| Retro template | `_shared/templates/framework-retro-template.md` |

### B10 — Hire decision (FT vs freelance vs add agent)

| Đọc | Path |
|---|---|
| Business operations §3 hiring | `business-strategy/15-business-operations.md` §3 |
| Hiring pipeline H0-H3 | `experience/workspace/docs/pipelines-business/hiring/` |
| Add agent (instead of human) | `_shared/standards/change-management.md` §1 |
| Cost trade-off | `_shared/standards/cost-budgets.md` |

### B11 — Sunset / archive folder / file / agent / rule

| Đọc | Path |
|---|---|
| Sunset agent | `change-management.md §1.2` |
| Sunset knowledge | `change-management.md §2.3` |
| Sunset harness rule | `change-management.md §3.3` |
| Sunset workflow | `change-management.md §4.3` |
| Lifecycle rule (sunset triggers) | `_shared/rules/90-lifecycle-rules.md` |
| Archive convention | `_archive/README.md` |

---

## C. DAILY / WEEKLY OPS

### C1 — Sáng mở máy làm gì?

| Đọc | Path |
|---|---|
| Daily rhythm | `experience/workspace/docs/workflows/W01-daily-operating-rhythm.md` |

### C2 — Đầu/cuối tuần (Mon sync, Fri retro)

| Đọc | Path |
|---|---|
| Weekly cadence | `experience/workspace/docs/workflows/W02-weekly-cadence.md` |

### C3 — Có incident (Sev 0/1/2/3)

| Đọc | Path |
|---|---|
| Severity rubric | `_shared/standards/incident-severity.md` |
| Response workflow | `experience/workspace/docs/workflows/W05-incident-response.md` |
| Postmortem template | `_shared/templates/postmortem-template.md` |

### C4 — ≥2 paths active concurrent

| Đọc | Path |
|---|---|
| Priority workflow | `experience/workspace/docs/workflows/W10-cross-path-priority.md` |
| Lifecycle rule | `_shared/rules/90-lifecycle-rules.md` (R-LCY-06) |

### C5 — Cross-pipeline handoff (vd Sales → Delivery)

| Đọc | Path |
|---|---|
| Handoff workflow | `experience/workspace/docs/workflows/W07-cross-pipeline-handoffs.md` |

### C6 — Cost burn tracking (project hiện tại đốt bao nhiêu?)

| Đọc | Path |
|---|---|
| Cost cap per phase | `_shared/standards/cost-budgets.md` |
| Project budget | `projects/{id}/_meta.json.budget` + `_state.json.cost_burn` |
| Drift detection daily | `_shared/standards/drift-detection.md` |
| Engine cost spec | `experience/workspace/docs/pipeline/README.md` (Engine $ column) |

---

## D. KNOWLEDGE RESEARCH

### D1 — Cell knowledge missing / stale → research

| Đọc | Path |
|---|---|
| Path D pipeline | `experience/workspace/docs/pipeline/PATH-D-RESEARCH.md` |
| Curation standard | `_shared/standards/knowledge-curation.md` |
| 6 T1 research agents | `_shared/.agents/tier-1-research/` |

### D2 — Promote staging → production knowledge

| Đọc | Path |
|---|---|
| K-review workflow | `experience/workspace/docs/workflows/W11-knowledge-review.md` |
| Change protocol | `_shared/standards/change-management.md` §2.1 |

### D3 — Knowledge promotion: project → memory → baseline

| Đọc | Path |
|---|---|
| Learning system loop | `_shared/standards/learning-system.md` |
| Memory hygiene | `_shared/standards/memory-hygiene.md` |
| Promotion criteria | `_shared/rules/00-MASTER-RULES.md` (R-MAS-08 eval delta) |

---

## E. BUSINESS PIPELINES

### E1 — Sales lead intake → SQL → SOW

| Đọc | Path |
|---|---|
| Sales pipeline (S0–S5) | `experience/workspace/docs/pipelines-business/sales/` |
| BANT+Fit qualify | `business-strategy/12-sales-playbook.md` §2 |

### E2 — Marketing campaign

| Đọc | Path |
|---|---|
| Marketing M0–M5 | `experience/workspace/docs/pipelines-business/marketing/` |
| ICP / customer segments | `business-strategy/02-customer-segments.md` |
| Channels playbook | `business-strategy/05-channel-playbook.md` |
| Brand kit + voice | `business-strategy/16-brand-content-kit.md` |

### E3 — CS expansion / upsell

| Đọc | Path |
|---|---|
| Expansion E0–E3 | `experience/workspace/docs/pipelines-business/expansion/` |
| CS playbook | `business-strategy/14-customer-success-playbook.md` |

### E4 — Partnership / BD

| Đọc | Path |
|---|---|
| Partnership BD0–BD4 | `experience/workspace/docs/pipelines-business/partnership/` |

### E5 — Hiring / Finance

| Đọc | Path |
|---|---|
| Hiring pipeline | `experience/workspace/docs/pipelines-business/hiring/` |
| Finance pipeline | `experience/workspace/docs/pipelines-business/finance/` |

---

## F. AGENT / SKILL OPS

### F1 — Build dispatch prompt (mỗi call)

| Đọc | Path |
|---|---|
| W04 dispatch SOP | `experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md` |
| AGENT-MANUAL | `_shared/prompts/AGENT-MANUAL.md` |
| RULES-PREAMBLE (auto-inject) | `_shared/prompts/RULES-PREAMBLE.md` |

### F2 — Voice contract (client-facing voice)

| Đọc | Path |
|---|---|
| Voice registry | `studio/wisdom/voice-registry.yaml` |
| Boundaries standard | `_shared/standards/boundaries.md` |
| Orchestration rule | `_shared/rules/100-orchestration-rules.md` (R-ORC-08) |

### F3 — New agent onboarding (W09)

| Đọc | Path |
|---|---|
| Onboarding workflow | `experience/workspace/docs/workflows/W09-agent-onboarding.md` |

---

## G. DECISIONS / COMPLIANCE

### G1 — Write ADR

| Đọc | Path |
|---|---|
| ADR template | `_shared/templates/project/ADR-template.md` |
| ADR index spec | `_shared/standards/decision-log-index.md` |

### G2 — Pricing decision (trigger-based)

| Đọc | Path |
|---|---|
| Pricing decisions | `_shared/standards/pricing-decisions.md` |
| Pricing sheet | `business-strategy/10-pricing-sheet.md` |

### G3 — PII redaction

| Đọc | Path |
|---|---|
| PII redaction standard | `_shared/standards/pii-redaction.md` |

### G4 — License check repo

| Đọc | Path |
|---|---|
| Security rules | `_shared/rules/60-security-rules.md` |
| Project attachments §3.4 | `_shared/standards/project-attachments.md` |
| External deps allowlist | `_shared/standards/external-dependencies.md` |

### G5 — Secret rotation / leak

| Đọc | Path |
|---|---|
| Secrets management | `_shared/standards/secrets-management.md` |
| Incident response | `experience/workspace/docs/workflows/W05-incident-response.md` |

### G6 — VN PDPA compliance

| Đọc | Path |
|---|---|
| VN compliance | `_shared/standards/compliance/vn.md` |
| DPA template | `_shared/templates/legal/DPA-template.md` |

### G7 — Add vendor / external tool / dependency

| Đọc | Path |
|---|---|
| External deps allowlist + watch | `_shared/standards/external-dependencies.md` |
| Stack rules (approved tech) | `_shared/rules/10-stack-rules.md` |
| Vendor watch review (weekly) | `_shared/standards/external-deps-review-{YYYY-WW}.md` (OPS-07) |
| Cost impact | `_shared/standards/cost-budgets.md` |

### G8 — Crisis comm (negative review / public criticism / OSS issue)

| Đọc | Path |
|---|---|
| Crisis comms playbook | `business-strategy/16-brand-content-kit.md` §9 |
| Incident response (Sev 0/1/2) | `experience/workspace/docs/workflows/W05-incident-response.md` |
| Boundaries (studio voice) | `_shared/standards/boundaries.md` |

---

## H. LOOKUP / DISCOVERY

### H1 — "Skill card cho agent X ở đâu?"

→ `_shared/.agents/tier-{N}/{agent-id}.md`. Tier mapping: `_shared/.agents/TEAM-CONFIG.md`. Roster: `_shared/.agents/README.md`.

### H2 — "Rule R-XXX-NN file nào?"

→ Domain code → file. `R-MAS` → `00-MASTER-RULES.md` · `R-STK` → `10-stack-rules.md` · `R-COD` → `20` · `R-EXE` → `30` · `R-DOC` → `40` · `R-COM` → `50` · `R-SEC` → `60` · `R-QAL` → `70` · `R-HRN` → `80` · `R-LCY` → `90` · `R-ORC` → `100`. Index: `_shared/rules/README.md`.

### H3 — "Phase spec P{N} ở đâu?"

→ `experience/workspace/docs/pipeline/P{N}-*.md`. Index: `experience/workspace/docs/pipeline/README.md`.

### H4 — "Knowledge baseline B{XX} / industry I{YY} ở đâu?"

→ `knowledge/data/baselines/B{XX}.json` hoặc `knowledge/data/industries/I{YY}.json`. Lite index: `knowledge/INDEX.md`.

### H5 — "Studio thuật ngữ chuẩn cho từ X?"

→ `_shared/standards/glossary.md` (authoritative).

### H6 — "Studio ship deliverable nào khi Sprint X?"

→ `_shared/standards/document-catalog.md` (META-INDEX với MK/EX/PT/PR sections).

### H7 — "Folder Y có README không?"

→ `STRUCTURE-README.md` (1 file map 43+ READMEs).

### H8 — "Tôi quên cấu trúc 5-layer / philosophy"

→ `01-FRAMEWORK.md` (canonical) hoặc `PROJECT.md` §2 (rút gọn).

---

## I. DOM-CHECK trước khi hỏi tôi (anti-pattern)

❌ "File X ở đâu?" — check `STRUCTURE-README.md` trước
❌ "Rule này ở file nào?" — check `_shared/rules/README.md`
❌ "Có ai đã làm việc tương tự chưa?" — check `_shared/decisions/INDEX.md` (ADR archaeology)
❌ "Term này nghĩa là gì?" — check `_shared/standards/glossary.md`
❌ "Sprint A ship gì?" — check `_shared/standards/document-catalog.md`

---

## J. Khi Có Thay Đổi Cần Hỏi Ai?

| Loại thay đổi | Authority | Doc reference |
|---|---|---|
| Add/sunset agent | CTO + ADR + W09 | `change-management.md §1` |
| Add/update knowledge | CEO + R-σ + W11 | `change-management.md §2` |
| Modify rule | CTO + ADR | `change-management.md §3` |
| Add workflow / phase step | CTO + ADR + (CEO if structural) | `change-management.md §4` |
| Add project attachment | P3 (+R-SEC for repo, +CEO for new_persona) | `change-management.md §5.5` |
| Strategic file (L5) | All 3 founders | `change-management.md §5` |
| Pricing change | CEO + COO | `pricing-decisions.md` |
| Sunset / deprecate | CTO + ADR | `change-management.md §X.3 (per scenario)` |

---

## K. Cross-References

| Need | Path |
|---|---|
| 30' onboarding | `START-HERE.md` |
| Token-optimal wrapper | `PROJECT.md` |
| 5-layer philosophy | `01-FRAMEWORK.md` |
| Master operating flow | `00-OPERATING-MANUAL.md` |
| 5-day onboard plan | `ONBOARDING.md` |
| All READMEs map | `STRUCTURE-README.md` |
| Project entry template | `BRIEF-INTAKE.md` |
| Agent operating model | `_shared/prompts/AGENT-MANUAL.md` |
| Master change protocol | `_shared/standards/change-management.md` |
| Glossary | `_shared/standards/glossary.md` |

---

*HOW-TO v1.1 — task-indexed cookbook · 2026-05-01 · 8 nhóm + 45 use cases · last review: quarterly via W08*
*v1.1 changes: §E2 broken ref fixed (05-icp.md → 02-customer-segments.md + 05-channel-playbook.md). +5 use cases: B10 hire decision · B11 sunset · C6 cost burn · G7 vendor add · G8 crisis comm.*
