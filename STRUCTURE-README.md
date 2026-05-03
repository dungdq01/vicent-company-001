---
file: STRUCTURE-README
version: v1.0
last_updated: 2026-04-28
owner: COO + CTO
status: production
location: ROOT (peer of START-HERE.md, PROJECT.md, README.md — top-tier navigator)
purpose: Single canonical map of all 43 framework READMEs. Agent loads this when needs to navigate folder structure fast — replaces 43 separate README reads with 1 file (~10KB vs ~150KB).
---

# Structure README — All 43 Framework READMEs Mapped

> **Purpose**: 1 file load → agent biết folder nào có README, README nào navigate được tới đâu, file nào canonical cho concept gì.
>
> **Replaces**: broad scan of 43 separate READMEs (~150KB) when agent only needs orientation. Load this instead → identify needed 2-3 READMEs → load only those.

---

## How To Use

### Agent context loading (Tier 4 dynamic, ~3KB)
- Load when task requires multi-folder navigation
- Skip when task scoped to single phase doc

### Human onboarding (referenced by `START-HERE.md` §8)
- Quick lookup which folder has what

### Maintenance
Update this file when:
- New README created → add row in correct layer table
- README significantly restructures → update purpose column
- Quarterly review at W08 framework retro

---

## Folder → README Map (43 files)

### ROOT (1 file + 7 entry docs)

| Path | Purpose | Read when |
|---|---|---|
| `README.md` | Navigation hub + role-based reading | First time anyone |
| `START-HERE.md` | 30' onboarding entry | New person Day 0 |
| `PROJECT.md` | Wrapper ngắn, token-optimal (~3.5K) | Quick context refresh |
| `01-FRAMEWORK.md` | 5-layer canonical philosophy | Architecture question |
| `00-OPERATING-MANUAL.md` | 5 paths input → output flow | Input routing decision |
| `ONBOARDING.md` | 5-day onboard plan | Newcomer Day 1+ |
| **`BRIEF-INTAKE.md`** | **⭐ Project entry template — đề bài CEO/khách điền 6 block. Copy → `projects/{id}/BRIEF-INTAKE.md` mỗi project mới** | **Khởi tạo project mới (Path A/B/C/D)** |
| **`HOW-TO.md`** | **⭐ Task-indexed cookbook — "tôi muốn làm X" → đọc file Y. 8 nhóm × 40 use cases.** | **Đã biết framework, cần lookup nhanh khi chạy việc** |
| **`CLAUDE.md`** | **⭐ Claude Code session bootstrap — auto-loaded mỗi session. R-CoS reading order 3 phase + activation. AI agent only.** | **Auto, AI agent (KHÔNG cần human đọc)** |

### L1 — knowledge/ (7 READMEs)

| Path | Purpose | When to load |
|---|---|---|
| `knowledge/README.md` | L1 overview, docs-only post-restructure | First time L1 |
| `knowledge/data/baselines/README.md` | 15 baselines roster + canonical taxonomy ref §5 | Adding/discovering B0X |
| `knowledge/data/industries/README.md` | 20 industries + triumvirate priority (I06/I01/I18) | Industry classification |
| `knowledge/data/matrix/README.md` | B×I cross-cell deep nodes | Matrix deep node creation |
| `knowledge/data/raw/README.md` | Source taxonomy reference | Re-derive taxonomy |
| `knowledge/docs/memory/README.md` | Cumulative retro learnings index | Pre-dispatch S-layer load |
| `knowledge/staging/README.md` | Path D queue + W11 K-review gate | Knowledge promotion flow |

**Bonus**: `knowledge/INDEX.md` (lite, ~5KB) — keywords + tags per baseline/industry. R-Match reads this first at P0.2.

### L2 — _shared/ (18 READMEs)

| Path | Purpose | When to load |
|---|---|---|
| `_shared/README.md` | L2 toolbox overview | First time L2 |
| `_shared/.agents/README.md` | 44 cards across 6 tiers + dispatch contract | Agent dispatch decision |
| `_shared/.agents/tier-0-executive/README.md` | CEO/COO/CTO charters + **R-CoS concierge** | Authority decision OR automation lễ tân |
| `_shared/.agents/tier-1-research/README.md` | 6 cards: α/β/γ/σ/Match/eval | Research phase |
| `_shared/.agents/tier-2-engineering/README.md` | 20 build + ops-stream roles | Engineering phase |
| `_shared/.agents/tier-3-domain/README.md` | R-Dxx template (parameterized 20 industries) | Domain context load |
| `_shared/.agents/tier-4-delivery/README.md` | PM/SA/BA/UX/TC | Delivery phase |
| `_shared/.agents/tier-5-business/README.md` | 10 business cards (SDR/AM/MKT/CONTENT/CS/FIN/LEG/HR/OPS/BIZ) | Business pipeline |
| `_shared/decisions/README.md` | Framework-level ADRs index | ADR write/read |
| `_shared/eval/README.md` | Eval framework spec + scoring rubric | Eval gate config |
| `_shared/eval/golden-sets/README.md` | Contribution guide for golden cases | Add golden cases |
| `_shared/prompts/README.md` | RULES-PREAMBLE auto-inject + invokes | Build dispatch prompt |
| `_shared/rules/README.md` | 11 rule files index (00 master → 100 orchestration) | Rule lookup |
| `_shared/standards/README.md` | 18 standards files index | Standards lookup |
| `_shared/templates/README.md` | All template scaffolds index | Project bootstrap |
| `_shared/templates/project/README.md` | Project skeleton spec + harness | New project P0 |
| `_shared/templates/project/harness/README.md` | Harness manifest + guardrails spec | Harness profile setup |
| `_shared/templates/project/.agents/_overrides.yaml` | **Skill addon manifest** — per-project agent extension (case 1) | Add project-scoped skill |
| `_shared/templates/project/_attachments/_index.md` | **Attachment manifest** — docs + repos human view (case 2+3) | Add project doc/repo |
| `_shared/templates/project/_attachments/repos/_refs.yaml` | **GitHub repo refs** — commit-pinned, license-checked | Reference OSS repo |

### L3 — experience/ (13 READMEs)

| Path | Purpose | When to load |
|---|---|---|
| `experience/README.md` | Methodology overview | First time L3 |
| `experience/workspace/README.md` | Engine workspace + SYSTEM-FLOW | Engine work |
| `experience/workspace/docs/pipeline/README.md` | Path A P0-P10 + B/C/D index | Phase dispatch |
| `experience/workspace/docs/workflows/README.md` | W01-W12 operating SOPs | Workflow trigger |
| `experience/workspace/docs/quality/README.md` | Quality gates G0-G7 + harness compliance | Eval gate config |
| `experience/workspace/docs/pipelines-business/README.md` | 8 business pipelines + cross-wiring diagram | Business path dispatch |
| `experience/workspace/docs/pipelines-business/sales/README.md` | S0-S5 (prospect → handoff) | Sales phase |
| `experience/workspace/docs/pipelines-business/marketing/README.md` | M0-M5 (positioning → optimize) | Marketing phase |
| `experience/workspace/docs/pipelines-business/content/README.md` | C0-C4 (ideate → repurpose) | Content phase |
| `experience/workspace/docs/pipelines-business/customer-success/README.md` | CS0-CS3 (onboard → renew/churn) | CS phase |
| `experience/workspace/docs/pipelines-business/expansion/README.md` | E0-E3 (offensive expansion, sister to CS3 defensive) | 🟢 health + signal |
| `experience/workspace/docs/pipelines-business/partnership/README.md` | BD0-BD4 (4 types: referral/co-sell/integration/reseller) | Partnership flow |
| `experience/workspace/docs/pipelines-business/hiring/README.md` | H0-H3 (need → onboard) | Hire trigger |
| `experience/workspace/docs/pipelines-business/finance/README.md` | F0-F2 (invoice → close → runway) | Finance ops |

### L4 — projects/ (3 READMEs)

| Path | Purpose | When to load |
|---|---|---|
| `projects/README.md` | Convention `P-{YYYYMM}-{NNN}/` + lifecycle (OPEN/ACTIVE/DELIVERED/ARCHIVED) | New engagement |
| `projects/_ops/README.md` | Operational ledgers spec (active-paths + dispatch-log + resource-lock) | Engine state |
| `projects/_templates/README.md` | **DEPRECATED** → canonical at `_shared/templates/project/` | AVOID (legacy redirect) |

### Studio Boundary (1 README)

| Path | Purpose | When to load |
|---|---|---|
| `studio/wisdom/README.md` | Internal-only knowledge + boundary rules per `_shared/standards/boundaries.md` §1 | Strategic agents only (R-CONTENT/MKT/SDR allowed) |

### L5 — business-strategy/ (NO README)

19 numbered files (01-strategy-overview.md → 19-asia-localization.md) self-index. Navigate via `PROJECT.md §5` routing OR `business-strategy/README.md` (TODO if needed).

---

## Reading Order by Goal

### Goal A — Onboard new person (30 phút)
```
1. README.md (root) — 5'
2. START-HERE.md — 30'
```
→ Done. 95% comprehension.

### Goal B — Run 1 dispatch (target: 21 phút context load)
```
1. structure-readme.md (this file) — 3'
2. experience/.../pipeline/README.md (find target phase) — 5'
3. _shared/.agents/tier-{N}/README.md (find target agent) — 3'
4. experience/.../workflows/W04-agent-dispatch-runbook.md — 10'
```
→ Ready dispatch.

### Goal C — Add new agent (W09 onboarding)
```
1. _shared/.agents/README.md (skill card format)
2. Target tier README (e.g., tier-2-engineering/README.md)
3. experience/.../workflows/W09-agent-onboarding.md
```
→ 30' context load.

### Goal D — Add new pipeline phase
```
1. experience/.../pipeline/README.md OR pipelines-business/README.md
2. Adjacent existing phase docs (P{N-1}, P{N+1})
3. _shared/rules/30-execution-rules.md (phase order rules)
4. _shared/standards/document-catalog.md (assign new doc IDs)
```

### Goal E — New project bootstrap (P0)
```
1. projects/README.md (convention + lifecycle)
2. _shared/templates/project/README.md (scaffold)
3. _shared/templates/project/harness/README.md (manifest spec)
4. experience/.../pipeline/P0-INTAKE.md (P0 phase doc)
```

### Goal F — Knowledge promotion (Path D + W11)
```
1. knowledge/README.md (L1 overview)
2. knowledge/staging/README.md (queue + review gate)
3. experience/.../workflows/W11-knowledge-review.md
4. _shared/standards/knowledge-curation.md
```

---

## Anti-Pattern

❌ Loading all 43 READMEs at once = ~150KB token waste, cache pollution.
✅ Load this file (~3KB) → identify needed 2-3 READMEs → load only those.

Per W04 §2.3 — context budget rule (≤ 60% context window).

---

## Cross-References

- Wrapper: [`@PROJECT.md`](PROJECT.md) §5 routing table
- Document catalog (everything studio ships): [`@_shared/standards/document-catalog.md`](_shared/standards/document-catalog.md)
- Glossary thuật ngữ: [`@_shared/standards/glossary.md`](_shared/standards/glossary.md)
- Onboarding entry: [`@START-HERE.md`](START-HERE.md)
- Dispatch runbook: [`@experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md`](experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md)

---

## Maintenance Triggers

| Trigger | Action | Tool |
|---|---|---|
| New README created in framework folder | Add row to correct layer table | Hand (current) → autogen (engine MVP) |
| README significantly restructures | Update Purpose column | Hand (current) → autogen |
| README deprecated/removed | Move row to "Deprecated" section OR remove | Hand (current) → autogen |
| New top-level entry doc (e.g., NEW-CHARTER.md) | Add to ROOT section | Hand always (manual review needed) |
| Quarterly W08 framework retro | Audit all rows for staleness | Hand (CTO+COO) |

**Owner**: COO (operational source) + CTO (technical accuracy).

### Tool roadmap

- **Now (hand-maintain)**: when adding folder/README → follow [`@_shared/standards/change-management.md`](_shared/standards/change-management.md) §5.4 checklist
- **After engine MVP**: autogen script handles routine row sync via Git pre-push hook. Spec: [`@_shared/standards/structure-readme-autogen.md`](_shared/standards/structure-readme-autogen.md)
- **Always hand-reviewed**: top-tier ROOT additions (philosophy/strategic docs) — autogen proposes, CTO signs

---

*v1.0 — 2026-04-28. Single map for 43 framework READMEs. Replaces broad scan with targeted load. Per R-MAS-01 single source of truth + W04 §2.3 context budget.*
