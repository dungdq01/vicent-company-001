# Memory Runtime Spec — 3-Layer Memory Architecture

> **Vị trí**: L2 standards · **Áp dụng cho**: mọi project tạo từ ngày này trở đi · **Companion file**: [`@./memory-hygiene.md`](memory-hygiene.md) (long-term hygiene rules) · **Last updated**: 2026-04-26 · **v1.0**

**Tóm tắt 1 dòng**: Studio dùng **3 lớp memory** — **Semantic** (kiến thức cross-project, lâu dài) + **Episodic** (state của 1 project) + **Working** (scratchpad agent trong runtime). Mỗi lớp có path, owner, TTL, security rule riêng. Agent dispatch tuân theo W04 phải đọc/ghi đúng layer.

---

## 1. Tại Sao Cần 3 Lớp

Trước v1.0 (2026-04-26), studio chỉ có **Semantic** (`knowledge/docs/memory/`) + **Episodic** (`projects/{id}/_state.json` + `99-retro.md`). Thiếu **Working** memory dẫn tới:

- Agent multi-step (chain ≥ 3 call) phải re-load full context mỗi call → tốn 30–50% token
- Agent parallel (P4 design 4 agent) không thấy nháp của nhau → integration reviewer (T3-integration) gánh hết
- Retry sau eval fail không có "running notes" cho judge feedback → cùng lỗi lặp lại
- Multi-turn human-in-loop không có conversation buffer → mỗi turn driver phải copy-paste lại context

3-lớp giải quyết: tách **persistent** (Semantic + Episodic) khỏi **transient** (Working), với rule security + GC khác nhau.

---

## 2. 3-Layer Model

### 2.1 Layer S — Semantic (long-term, cross-project)

| Attribute | Value |
|---|---|
| **Mục đích** | Kiến thức tích lũy theo thời gian (baseline + industry learnings) |
| **Path** | `knowledge/docs/memory/B{XX}-learnings.md`, `I{YY}-learnings.md` |
| **Cũng có thể**: | `knowledge/baselines/B{XX}/memory/`, `knowledge/industries/I{YY}/memory/` (per-cell) |
| **Scope** | Cross-project · cross-time |
| **Lifetime** | Permanent (pruned quarterly per `memory-hygiene.md`) |
| **Owner write** | P3 (delivery PM) sau retro promotion ceremony (W02 §5.5) |
| **Owner read** | Bất kỳ agent / human |
| **Format** | Per `memory-hygiene.md` §format-template (1-line claim + confidence + source link) |
| **Sensitivity** | LOW — public-internal; KHÔNG chứa client PII |
| **Token cost agent load** | 2–5K tokens / file relevant |

### 2.2 Layer E — Episodic (per-project, persistent)

| Attribute | Value |
|---|---|
| **Mục đích** | Lịch sử + quyết định + trạng thái của **1 project** từ intake → close |
| **Path** | `projects/{id}/_state.json`, `_meta.json`, `decisions/`, `communication-log.md`, `99-retro.md` |
| **Scope** | Trong 1 project |
| **Lifetime** | Đến khi project close + 1 năm (retention per SOW), sau đó archive `_archive/projects/` |
| **Owner write** | Driver / agents (state) · Founder (decisions) · CS (comms) |
| **Owner read** | Tất cả agent dispatch trong project · auditor |
| **Format** | JSON (state, meta) + Markdown (decisions, comms, retro) |
| **Sensitivity** | MEDIUM — có thể chứa client business data; **KHÔNG được ghi PII raw** |
| **Token cost agent load** | 3–10K typical |

### 2.3 Layer W — Working (per-run, transient) — **NEW**

| Attribute | Value |
|---|---|
| **Mục đích** | Scratchpad / shared notes / multi-step state cho agent **trong khi đang chạy** |
| **Path** | `projects/{id}/.memory/` (folder mới, sẽ define §4) |
| **Scope** | Trong 1 dispatch run hoặc 1 phase, không bao giờ cross-project |
| **Lifetime** | TTL theo sub-folder: working 24h · shared = phase duration · episodic-buffer đến retro |
| **Owner write** | Agent (qua orchestrator API) · driver (manual rare) |
| **Owner read** | Agent cùng project · human review |
| **Format** | Markdown + JSONL (append-only) |
| **Sensitivity** | HIGH — có thể chứa thinking trace; **KHÔNG persist khỏi project, KHÔNG share cross-project** |
| **Token cost agent load** | 1–8K tuỳ scope (thường ít hơn S/E vì transient) |

---

## 3. Decision Tree — Agent Đọc Layer Nào

```
Agent dispatch task X 
│
├─ Cần fact / SOTA / industry context?
│   → Đọc Layer S (Semantic)
│   → Path: _meta.json.knowledge_match.memory_paths[]
│
├─ Cần phase trước, decision, blocker, scope đã chốt?
│   → Đọc Layer E (Episodic)
│   → Path: _state.json + _meta.json + decisions/ + previous phase output
│
├─ Đang multi-step trong cùng run? Đang retry? Đang parallel cần shared notes?
│   → Đọc Layer W (Working)
│   → Path: .memory/working/{run-id}/, .memory/shared/{phase}/
│
└─ Tất cả: luôn load RULES-PREAMBLE + skill card (mandatory, KHÔNG phải memory)
```

**Quy tắc thép**: Agent **không bao giờ đọc Layer W của project khác**. Cross-project knowledge phải đi qua promotion S → đảm bảo quality gate (memory-hygiene.md).

---

## 4. Layer W — `.memory/` Folder Spec (chi tiết)

### 4.1 Cấu trúc

```
projects/{P-id}/.memory/
├── README.md                          ← (auto-generated khi init project)
├── working/
│   ├── {run-id}/
│   │   ├── scratch.md                 ← agent ghi nháp khi reasoning multi-step
│   │   ├── thoughts.jsonl             ← append-only intermediate state (tool calls, sub-results)
│   │   └── env.json                   ← run-time env: model, temp, seed, tokens used
│   └── _index.json                    ← {run-id → started_at, ended_at, status}
├── shared/
│   ├── {phase}/                       ← e.g., "P4-design", "P6-dev-sprint-2"
│   │   ├── pool.md                    ← parallel agent shared notes
│   │   ├── decisions-pending.md       ← decisions cần consolidate trước commit
│   │   └── conflicts.md               ← integration reviewer pickup
│   └── _index.json
├── episodic-buffer/
│   ├── interactions.jsonl             ← append-only: who-said-what trong human-in-loop turn
│   ├── retry-feedback.md              ← judge feedback tích lũy qua các retry attempt
│   └── candidates-for-retro.md        ← agent đề xuất "đáng đưa vào retro"
└── .gitignore                         ← exclude tất cả khỏi git (transient)
```

### 4.2 TTL & Garbage Collection

| Sub-folder | TTL | GC trigger | Action |
|---|---|---|---|
| `working/{run-id}/` | 24h sau run end | Daily EOD job (W01 §10) hoặc khi run status=`done`+24h | Move sang `_archive/.memory/` 7 ngày, sau đó delete |
| `shared/{phase}/` | Đến hết phase | Khi `_state.json.lifecycle.current_phase` đổi | Promote `decisions-pending.md` items → `decisions/ADR-*.md` if accepted; delete pool/conflicts |
| `episodic-buffer/` | Đến retro của project | Khi `99-retro.md` complete | Extract candidates → ghi vào retro §learnings; flush JSONL |

GC implement bằng:
- Orchestrator cron (daily 18:00 local) cho `working/`
- Phase transition hook cho `shared/`
- Retro completion hook cho `episodic-buffer/`

### 4.3 Quy tắc viết / sửa

- **Append-only mặc định** cho `.jsonl` files (audit-friendly)
- **Markdown files** có thể edit nhưng **không được delete content** trong cùng run; chỉ append section mới
- **Agent KHÔNG được delete** file trong `.memory/` — chỉ orchestrator GC làm
- Mỗi entry trong JSONL phải có `{ts, run_id, agent_id, type, payload}` schema

### 4.4 Schema chuẩn

#### `working/{run-id}/scratch.md`

```markdown
# Scratch — run {run_id}
Agent: {agent_id} · Started: {ISO} · Phase: P{N}

## Step 1 — {what}
{free-form reasoning, draft, evidence collected}

## Step 2 — {what}
...

## Open questions for next step
- ...
```

#### `working/{run-id}/thoughts.jsonl`

```jsonl
{"ts":"2026-04-26T10:30:00Z","run_id":"r-abc","agent_id":"T2-architect","type":"tool_call","payload":{"tool":"read_file","args":{"path":"..."},"result_summary":"..."}}
{"ts":"2026-04-26T10:30:15Z","run_id":"r-abc","agent_id":"T2-architect","type":"intermediate_decision","payload":{"option":"Postgres","rationale":"..."}}
```

#### `shared/{phase}/pool.md`

```markdown
# Shared Pool — {phase}
Phase: {phase} · Agents active: [list] · Started: {ISO}

## From {agent_id} @ {ts}
{note / partial output / question for sibling agent}

## From {agent_id} @ {ts}
...
```

#### `episodic-buffer/interactions.jsonl`

```jsonl
{"ts":"...","turn":1,"actor":"agent","agent_id":"T2-architect","content":"..."}
{"ts":"...","turn":2,"actor":"human","name":"driver","content":"..."}
```

#### `episodic-buffer/retry-feedback.md`

```markdown
# Retry Feedback — {agent_id} @ phase {N}

## Attempt 1 — {ts} — score {X}/10 — FAIL
Judge feedback:
- {issue 1}
- {issue 2}

## Attempt 2 — {ts} — score {Y}/10 — PASS
Notes: {what changed}
```

---

## 5. Security & Privacy Rules

### 5.1 Hard prohibitions

- ❌ KHÔNG ghi raw PII (CCCD, số ĐT, email cá nhân, địa chỉ nhà) vào BẤT KỲ layer nào — kể cả Working
- ❌ KHÔNG ghi secret (API key, password, token) vào W
- ❌ KHÔNG share `.memory/` cross-project (cross-project = qua promotion S)
- ❌ KHÔNG commit `.memory/` vào git (đã có `.gitignore`)

### 5.2 Mandatory redaction

Trước khi agent ghi vào bất kỳ memory layer:

1. Run regex scrub: pattern PII (email, phone VN/SEA, credit card, CCCD, BHXH)
2. Replace bằng `<REDACTED:type>` token
3. Log occurrence count vào `_state.json.security.redactions_count`
4. Nếu count > threshold per phase → flag W05 incident type "PII near-leak"

### 5.3 Compliance với localization

- **NĐ 13/2023 VN** (xem `business-strategy/19-asia-localization.md` §1.1): nếu project chạm DLCN của user VN, `.memory/` BẮT BUỘC stay trên data residency VN. Hosting infra phải có DC tại VN cho project class này.
- **GDPR / PDPA SEA**: tương tự — `.memory/` không cross-border khỏi data residency của project.

### 5.4 Audit hook

- Mọi append vào `.memory/episodic-buffer/interactions.jsonl` log thêm 1 dòng tại `_state.json.memory_runtime.append_log[]` (timestamp + run_id + size)
- Quarterly audit: random sample 5 project, scan `.memory/` xem có PII residual không

---

## 6. Multi-Agent Coordination — Layer W Use Cases

### 6.1 Parallel agents (P4 design)

4 agent (T3-api/db/ml/ui) chạy song song:

```
Each agent đọc:
  S layer (mandatory): RULES-PREAMBLE, skill card, P4 spec
  E layer: _meta.json, _state.json, 04-prd.md, 03-architecture.md
  W layer: shared/P4-design/pool.md  ← NEW

Each agent ghi (incrementally trong khi reasoning):
  W layer: 
    - working/{their-run-id}/scratch.md (private nháp)
    - shared/P4-design/pool.md  (post key insight cho siblings)
    - shared/P4-design/decisions-pending.md (decision đề xuất, chờ consolidate)
```

T3-integration-reviewer (chạy sau) đọc:
- All 4 agent outputs (final)
- `shared/P4-design/pool.md` — biết đã có conversation gì
- `shared/P4-design/decisions-pending.md` — list decision cần chốt
- `shared/P4-design/conflicts.md` — pre-flagged conflicts

→ Integration reviewer làm việc nhanh hơn 30–40% vs no shared memory.

### 6.2 Multi-step single agent (chain reasoning)

Agent dispatch task phức tạp cần chain:

```
Step 1: Research SOTA (call 1)
  → ghi scratch.md §step1
  → ghi thoughts.jsonl tool calls
Step 2: Compare with constraints (call 2)
  → đọc lại scratch.md §step1
  → ghi §step2
Step 3: Recommend (call 3)
  → đọc full scratch.md
  → output final + commit
```

Mỗi step chỉ load `scratch.md` + step trước (vài KB), không re-load cả context window.

### 6.3 Retry với feedback

Eval fail attempt 1 → orchestrator:
1. Ghi judge feedback vào `episodic-buffer/retry-feedback.md` §attempt-1
2. Retry attempt 2 với context = original + retry-feedback.md (just feedback, không dup full context)
3. Nếu pass → giữ retry-feedback.md trong buffer cho retro; nếu fail → BLOCK (per W04 §7.4 retry policy)

---

## 7. Initialization & Lifecycle

### 7.1 Khi tạo project mới (P0 intake)

Driver (hoặc orchestrator) chạy:

```bash
# init script (pseudocode)
mkdir -p projects/{id}/.memory/{working,shared,episodic-buffer}
cp _shared/templates/project/.memory-README.md projects/{id}/.memory/README.md
echo "*" > projects/{id}/.memory/.gitignore  # transient, KHÔNG commit
echo "!.gitignore" >> projects/{id}/.memory/.gitignore
echo "!README.md" >> projects/{id}/.memory/.gitignore
```

Update `_state.json`:

```json
"memory_runtime": {
  "enabled": true,
  "version": "1.0",
  "created_at": "ISO",
  "redactions_count": 0,
  "last_gc": null,
  "active_runs": []
}
```

### 7.2 Trong dispatch (W04)

Add vào W04 §2 context loading: load `.memory/shared/{current-phase}/pool.md` nếu exists.

Add vào W04 §5 dispatch: orchestrator tạo `working/{run-id}/` ngay khi run start, pass path vào agent context.

Add vào W04 §9 commit: orchestrator GC `working/{run-id}/` 24h sau (job).

### 7.3 Khi phase transition

Orchestrator hook:
1. Đọc `shared/{old-phase}/decisions-pending.md`
2. Surface lên driver review (15' trong daily W01 §6 mid-day review)
3. Driver promote → ghi vào `decisions/ADR-*.md` hoặc reject
4. Delete `shared/{old-phase}/`

### 7.4 Khi project close (P9 → retro)

1. Đọc `episodic-buffer/candidates-for-retro.md` + `interactions.jsonl`
2. Surface vào `99-retro.md §learnings`
3. High-confidence candidates → vào `_state.json.memory_promotion_queue[]` để Fri retro promote sang S
4. Sau retro complete → archive `.memory/` toàn bộ folder vào `_archive/projects/{id}/.memory/` (giữ 90 ngày, sau đó delete)

---

## 8. Token Budget Implication

Layer W giúp giảm token re-load. Budget guideline:

| Scenario | Without W | With W | Saving |
|---|---|---|---|
| Single agent single call | 25K context | 25K context | 0 (W không kích hoạt) |
| Single agent 3-step chain | 75K (3×25) | 35K (25 + 5 + 5) | 53% |
| 4-agent parallel với integration | 25K × 4 + 50K = 150K | 25K × 4 + 25K = 125K | 17% |
| Retry sau fail (with feedback) | 25K + 25K = 50K | 25K + 7K = 32K | 36% |

→ ROI cao nhất ở multi-step + retry. Parallel có saving khiêm tốn nhưng quality boost (less integration conflict).

Hard cap (per W04 §2): tổng context vào 1 call ≤ **60% context window**. Layer W KHÔNG tăng cap; chỉ giảm consumption per call.

---

## 9. Disable / Opt-Out

Project có thể disable Layer W nếu:

- Sprint A (MMO PDF) — single phase, single call, không cần W
- Compliance cực cao (regulated industry, mọi thinking trace bị audit) — fall back stateless

Disable bằng `_state.json.memory_runtime.enabled = false`. Khi disable, orchestrator skip §7.2 hooks; agent runs stateless như pre-v1.0.

---

## 10. Promotion Path — W → E → S

```
Layer W (.memory/episodic-buffer/candidates-for-retro.md)
  ↓ at retro (W02 §5.5)
Layer E (projects/{id}/99-retro.md §learnings + memory_promotion_queue)
  ↓ if pattern across ≥3 projects + confidence HIGH
Layer S (knowledge/docs/memory/B{XX}-learnings.md hoặc I{YY}-learnings.md)
  ↓ if eval validates ≥ 8.5 + 30+ runs stable
Skill card update (_shared/.agents/...) hoặc rule update (_shared/rules/...)
```

→ Đảm bảo working memory không trực tiếp pollute knowledge — phải qua human review 2 tầng (retro + promotion ceremony).

Cùng path đã định trong `memory-hygiene.md` §promotion-path; file này chỉ thêm Layer W ở đầu.

---

## 11. Failure Modes

| Lỗi | Dấu hiệu | Xử lý |
|---|---|---|
| `.memory/` chưa init khi P0 | Agent dispatch lỗi "path not found" | Orchestrator init trước run, không assume tồn tại |
| Working folder không GC, đầy disk | `working/` size > 100MB / project | GC daily job; alert > 50MB |
| PII leak vào working/scratch.md | Audit phát hiện regex hit | W05 incident "PII near-leak"; rotate run, retrain prompt với rule §5.2 |
| Shared pool conflict không resolve | `conflicts.md` accumulate qua phase boundary | Hard rule: phase transition BLOCKED nếu conflicts.md không empty; driver phải resolve |
| Agent ghi vào project khác | Path traversal `../` | Orchestrator sandbox: chỉ cho phép write trong `projects/{current-id}/.memory/` |
| Retry feedback bị overwrite | `retry-feedback.md` lost attempt 1 | Append-only enforce; mỗi attempt là §section mới, không edit cũ |
| `.memory/` accidentally committed | Git history có thinking trace | `.gitignore` strict; pre-commit hook check |
| Cross-project read | Agent ở project B đọc project A | Orchestrator block; log `_state.json.security` |
| Episodic-buffer không flush sau retro | `interactions.jsonl` accumulate vô hạn | Retro completion hook bắt buộc flush, archive |
| Disable bị quên enable lại | Sprint A→B nâng cấp scope nhưng W still off | Phase transition hook check `enabled` vs scope tier mismatch, alert |

---

## 12. Implementation Phases (cho engine team)

Engine code sẽ implement theo 3 phase:

### Phase 1 — Storage + GC (target: trước Project 1)
- [ ] `.memory/` folder spec init script
- [ ] `.gitignore` template
- [ ] Daily GC job cho `working/`
- [ ] Phase transition hook cho `shared/`
- [ ] Retro completion hook cho `episodic-buffer/`

### Phase 2 — Read/Write API (target: trước project multi-step thật)
- [ ] Orchestrator API: `read_memory(layer, path)` + `append_memory(layer, path, content)`
- [ ] Sandbox: agent chỉ write được trong `projects/{current-id}/.memory/`
- [ ] PII redaction middleware (§5.2)
- [ ] Schema validator cho JSONL files

### Phase 3 — Smart loading (target: optimization quarter)
- [ ] Auto-suggest pool.md to load based on phase + agent role
- [ ] Compression: tóm tắt scratch.md nếu > 5K tokens trước khi pass next step
- [ ] Cross-run learning: phát hiện pattern thinking trace lặp lại → propose skill card update

Phase 1 = MUST trước Project 0 dogfood. Phase 2-3 sau khi có data từ ≥ 3 project.

---

## 13. Cross-References

- Long-term hygiene: `@./memory-hygiene.md`
- Knowledge memory files: `@../../knowledge/docs/memory/`
- Project state schema: `@../templates/project/_state.json`
- Project meta schema: `@../templates/project/_meta.json`
- Agent dispatch runbook: `@../../experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md` §2 (context loading) + §11 (parallel coordination)
- Daily GC trigger: `@../../experience/workspace/docs/workflows/W01-daily-operating-rhythm.md` §10 (EOD)
- Phase transition: `@../../experience/workspace/docs/workflows/W03-new-project-walkthrough.md`
- Retro promotion ceremony: `@../../experience/workspace/docs/workflows/W02-weekly-cadence.md` §5.5
- Security rules: `@../rules/60-security-rules.md`
- Localization compliance (data residency): `@../../business-strategy/19-asia-localization.md` §1.1
- Incident response (PII leak): `@../../experience/workspace/docs/workflows/W05-incident-response.md` §8.2

---

## 14. Update Cadence

| Trigger | Action |
|---|---|
| Schema thay đổi (sub-folder structure, JSONL schema) | Bump version, update §4 + migration note |
| Phase implementation milestone | Update §12 checklist |
| Failure mode mới phát hiện qua retro | Add §11 row + link postmortem |
| TTL / GC rule cần điều chỉnh | Update §4.2, log ADR |

Major version bump (2.0) khi: thêm layer thứ 4 hoặc đổi sandbox model. Minor (1.x) khi: add sub-folder, schema field.

---

## 15. Update Log

| Date | Version | Change | By |
|---|---|---|---|
| 2026-04-26 | 1.0 | Initial 3-layer spec, define Layer W `.memory/` | (this session) |

---

*v1.0 · ~8K tokens · canonical spec for runtime memory · MUST be followed by all projects post-2026-04-26*
