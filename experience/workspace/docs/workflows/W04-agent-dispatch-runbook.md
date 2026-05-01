# W04 — Agent Dispatch Runbook

> **Khi nào chạy**: Mỗi lần cần gọi 1 agent (thủ công hoặc orchestrator trigger) · **Người chạy**: Driver của project · **Input**: Phase hiện tại + context ready · **Output**: Agent run đã complete, eval chấm, output committed vào repo · **Thời gian**: 5–15' chuẩn bị · 30''–10' agent chạy · 10–60' human review

---

## 0. Mục đích

1 agent call = 1 giao dịch có chi phí ($ + thời gian + risk hallucination). File này quy định **13 bước** phải theo mỗi lần, từ lúc quyết định gọi đến lúc commit output. Áp dụng cho:

- Manual dispatch (founder mở CLI/UI, gõ prompt)
- Orchestrator automated dispatch (P0-P9 scheduler)
- Retry sau eval fail

**Quy tắc thép**: *không dispatch agent nào nếu không đi qua runbook này*. Vi phạm → output bị revoke, không commit được.

---

## 1. Pre-dispatch Decision (30'', trước khi gõ gì)

### Hỏi 6 câu — phải trả lời "yes" cả 6

1. **Đã có phase doc rõ ràng?** → `experience/workspace/docs/pipeline/P{N}-*.md` có mô tả agent invoke của phase đang chạy? Nếu không → không dispatch, viết spec trước.
2. **Phase trước đã pass gate?** → `_state.json.gates.{previous_gate}.status == "approved"`. Nếu chưa → không được nhảy phase. `_shared/rules/30-execution-rules.md` §single-active-phase.
3. **Cost cap còn đủ?** → `_state.json.cost_burn.llm_spend_cap - spend_to_date ≥ estimated_cost_of_this_call × 3` (buffer cho retry). Nếu không → escalate COO.
4. **Skill card tồn tại và updated?** → `_shared/.agents/tier-{N}/{agent-id}.md` có `last_updated` trong vòng 90 ngày? Nếu stale → flag để review, vẫn chạy được nhưng ghi vào retro.
5. **Human review slot sẵn sàng?** → Driver có ≥ 1h trong 24h tới để review output? Nếu không → delay dispatch, không để output nằm trong inbox quá lâu (rot risk).
6. **Harness valid?** (R-HRN-05) →
   - `projects/{id}/harness/manifest.yaml` tồn tại + schema valid (control_loop + tools + memory + cache + cost cap fields present)
   - `projects/{id}/harness/guardrails.yaml` tồn tại (P5+ phases) + signed by COO
   - `_meta.json.harness_profile ∈ {L0, L1, L2}` set
   - Tool agent sẽ dùng nằm trong `manifest.yaml.tools.whitelist[]`
   - Cost-per-run cap từ manifest >= estimate of this call
   - Nếu thiếu manifest → BLOCK, escalate (P0 phải set up harness folder trước).

Nếu bất kỳ câu "no" → **stop**, fix gốc trước.

---

## 2. Context Loading (2–5')

Agent chỉ tốt bằng context nó nhận. Luôn load theo thứ tự sau (ưu tiên giảm dần):

### 2.1 Mandatory (bắt buộc mọi call)

1. **RULES-PREAMBLE.md** (`_shared/prompts/RULES-PREAMBLE.md`) — inject luôn ở đầu system prompt. Không bao giờ bỏ qua. Xem `_shared/.agents/README.md` §preamble-injection.
2. **Skill card của agent** (`_shared/.agents/tier-{N}/{agent-id}.md`) — entire content đưa vào system prompt.
3. **Phase spec** (`experience/workspace/docs/pipeline/P{N}-*.md`) — section "Input Contract" + "Output Contract" tương ứng.
4. **Harness manifest** (`projects/{id}/harness/manifest.yaml`) — agent runtime contract: tool whitelist, allowed_transitions, memory tier, cost cap. Inject as YAML block into system prompt. (R-HRN-02, R-HRN-05)
5. **Harness guardrails** (`projects/{id}/harness/guardrails.yaml`) — approval matrix, network whitelist, hard-deny actions. Inject for any agent that calls tools. (R-HRN-11)
6. **Local rules** (`projects/{id}/harness/permanent-fixes.md.local_rules[]` extracted) — project-specific rules from prior failures, injected after RULES-PREAMBLE. (R-HRN-06)

### 2.2 Context-dependent (chọn thứ liên quan)

7. **Project meta** (Layer E): `projects/{id}/_meta.json` — client info, scope tier, stack, harness_profile.
8. **Project state** (Layer E): `projects/{id}/_state.json` — current phase, blockers, open decisions.
9. **Previous phase output** (Layer E): file phase trước (ví dụ P4 cần P3 `03-architecture.md`).
10. **Knowledge match** (Layer S): đọc `_meta.json.knowledge_match.memory_paths[]` → load các file `knowledge/docs/memory/B*-learnings.md` / `I*-learnings.md` đó.
11. **Relevant ADRs** (Layer E): `projects/{id}/decisions/ADR-*.md` mà liên quan đến phase.
12. **Working memory** (Layer W): nếu phase đã có shared pool, load `projects/{id}/.memory/shared/{phase}/pool.md` + `decisions-pending.md`. Nếu là retry, load `episodic-buffer/retry-feedback.md`. Nếu là multi-step chain, load `working/{run-id}/scratch.md` của step trước. Spec đầy đủ: `@../../../../_shared/standards/memory-runtime.md`.
13. **Harness long-term memory** (Layer H, conditional): `projects/{id}/harness/memory/{key}.md` — load nếu agent task liên quan domain key đó (transferable patterns only per R-QAL-10). (R-HRN-04)

### 2.3 Optional (chỉ khi cần thiết)

14. **Similar past project retros**: top-1 project cùng industry trong `knowledge/industries/I{NN}/memory/`.
15. **Golden set examples**: `_shared/eval/golden-sets/{skill}/` — 2–3 examples nếu cần tune.

### 2.4 Memory Layer Cheat-Sheet — agent đọc gì khi nào

| Layer | What | Path | Khi load |
|---|---|---|---|
| **Mandatory** | Preamble + skill card + phase spec + **harness manifest + guardrails + local_rules** | `_shared/prompts/`, `_shared/.agents/`, `experience/workspace/docs/pipeline/`, `projects/{id}/harness/` | Mọi run |
| **S — Semantic** | Cross-project learnings | `knowledge/docs/memory/B*-learnings.md`, `I*-learnings.md` | Khi `_meta.json.knowledge_match.memory_paths[]` non-empty |
| **E — Episodic** | This-project state + decisions + comms | `projects/{id}/_state.json`, `_meta.json`, `decisions/`, previous phase output | Mọi run trong project (sau P0) |
| **W — Working** | Scratchpad / shared pool / retry feedback | `projects/{id}/.memory/working/`, `shared/`, `episodic-buffer/` | Multi-step chain, parallel agents, retry attempt 2+ |
| **H — Harness long-term** (new) | Transferable patterns from prior runs in this project | `projects/{id}/harness/memory/{key}.md` | Khi agent task domain matches a key (R-HRN-04) |

**Quy tắc**:
- Mandatory + E luôn load. S load nếu memory_paths có path. W load conditional theo run type. H load nếu agent task khớp domain key.
- W + H KHÔNG cross-project. Sandbox enforce.
- KHÔNG persist PII vào bất kỳ layer (xem `memory-runtime.md` §5).
- **Harness mandatory** ngang Preamble/Skill/Phase — thiếu = block dispatch (R-HRN-05).

### 2.5 Build order for KV-cache (R-HRN-10 4-tier)

Loader MUST assemble prompt **bottom-up in 4 tiers, NO interleaving** to preserve Anthropic prompt cache prefix. Per `_shared/rules/80-harness-rules.md` §R-HRN-10:

```
T1 (cache forever):       RULES-PREAMBLE + skill_card + AGENT-MANUAL excerpt
T2 (cache per agent×phase): phase_spec input/output contract (via @anchors)
T3 (cache per project):    manifest + guardrails + local_rules
↑ cache breakpoint set cache_control:ephemeral on last block of T3
T4 (no cache):             _state + previous_handoff + working_memory + task
```

**Critical**: 0 dynamic data (timestamp / run_id / task_id) in T1-T3. Dynamic ONLY in T4. Vi phạm = silent cost regression 5-10×.

Full spec + Anthropic API mechanic + TTL workaround: `_shared/rules/80-harness-rules.md` §R-HRN-10.

### 2.6 Project Attachment Loading (per project-attachments.md)

Áp dụng nếu `projects/{id}/_meta.json.attachments[]` có entry. Engine MUST execute trước khi build prompt T1-T4:

```
Step 1 — Read _meta.json.attachments
   ├─ agent_addons[] · docs[] · repos[]
   └─ Filter ALL by: load_for_agents includes current agent X
                   AND load_for_phases includes current phase P

Step 2 — Apply skill addon (if any)
   ├─ Resolve base agent _shared/.agents/{base}.md (per skill_overrides version)
   ├─ VERIFY base.version == addon.parent_version_pin
   │     └─ MISMATCH → BLOCK dispatch, surface error to P3
   ├─ Read .agents/{addon_file}
   ├─ Apply strategy:
   │   - append: concatenate addon body to base
   │   - replace_sections: substitute target_sections, keep rest
   │   - new_persona: replace ENTIRE base prompt (require new_persona_signoff)
   └─ Result → goes into T1 (cache forever) — same tier as base skill card

Step 3 — Inject docs (if any)
   ├─ For each doc passing filter:
   │   - Read .extracted (.txt cache, NOT raw PDF/DOCX)
   │   - Verify sha256 matches _meta.json — drift → re-extract
   │   - Token-count + cumulative budget check (warn @ 30%, block @ 50%)
   └─ Inject into T3 (cache per project) — wrap with provenance header

Step 4 — Inject repo refs (if any)
   ├─ Read _attachments/repos/_refs.yaml entries passing filter
   ├─ For each repo:
   │   - Verify cache_ttl_hours not exceeded → else refetch + R-SEC re-verify license
   │   - Load cherry_pick files OR manifest_only summary
   │   - Truncate to summary_max_tokens
   └─ Inject into T3

Step 5 — Verify compliance fields all green
   ├─ docs[].pii_scan_passed exists
   ├─ repos[].license_compatible == true
   ├─ repos[].allowlist_passed exists
   └─ ANY missing → BLOCK dispatch, P3 review

Step 6 — Build T1-T4 cache layout per §2.5
   Final order in cache:
     T1: RULES-PREAMBLE + (base skill ⊕ addon) + AGENT-MANUAL excerpt
     T2: phase spec
     T3: manifest + guardrails + local_rules + DOCS + REPO refs
     T4: state + handoff + task
```

**Critical**:
- Attachments inject vào T3, không phải T4 → cache reusable across dispatches trong cùng project.
- Skill addon merge vào T1 (cùng base skill) → cache lifetime maximal.
- Empty `attachments[]` = step 2-5 skip, dispatch as before. Backward compat.

Failure modes per `project-attachments.md` §8.

### Context budget rule

- Tổng context ≤ **60% context window** của model. Còn lại cho response.
- Nếu load xong > 60% → ưu tiên bỏ §2.3 trước, rồi §2.2 item cuối (optional ADR), rồi rút memory §2.2.7 xuống top-3.
- **KHÔNG rút** §2.1 items (mandatory).

### Context manifest

Tạo file tạm `.runs/{run-id}/context.json` ghi chính xác những gì đã load:

```json
{
  "run_id": "...",
  "skill_id": "T2-architect",
  "project_id": "P-202604-001",
  "loaded": [
    { "path": "_shared/prompts/RULES-PREAMBLE.md", "bytes": 5120 },
    { "path": "_shared/.agents/tier-2/T2-architect.md", "bytes": 8200 },
    { "path": "projects/.../_meta.json", "bytes": 1800 },
    ...
  ],
  "total_tokens_estimated": 42000
}
```

Reproducibility: run sau tái hiện được = audit trail.

---

## 3. Task Framing (2–3')

Viết rõ **user message** (khác system prompt) theo template:

```
## Task
{1 câu: mục tiêu phase này}

## Inputs provided
- {link file 1} — {why relevant}
- {link file 2} — {why}

## Expected output
{1 đoạn: format, sections cần có, reference template}

## Constraints
- Cost target: $X.XX (hard cap $Y.YY)
- Must cite facts with @path/line (anti-hallucination)
- Must follow `_shared/standards/dod-per-deliverable.md` §{phase}
- Must produce valid markdown matching template `_shared/templates/project/{file}.md`

## Non-goals
{những gì agent KHÔNG được làm — chống scope creep}
```

**Hard rule**: không dispatch với user message < 100 từ. Quá ngắn = context poverty = output kém.

---

## 4. Cost Pre-check (30'')

Trước khi click "Run":

1. Estimate tokens: `context_tokens + 2 × expected_output_tokens` (buffer cho reasoning).
2. Estimate cost: tokens × model rate (xem `_shared/rules/10-stack-rules.md` §llm-pricing-snapshot).
3. So với `skill-card.cost_target` — nếu estimate > 1.5× target → đổi model fallback hoặc slice task nhỏ hơn.
4. Log estimate vào `.runs/{run-id}/cost-estimate.json`.

Nếu vượt `_state.json.cost_burn.llm_spend_cap - spend_to_date` → **BLOCK**, escalate.

---

## 5. Dispatch (30'' setup, variable run time)

### 5.1 Single agent

```
Orchestrator (or CLI):
  POST /api/dispatch
  {
    "skill_id": "T2-architect",
    "project_id": "P-202604-001",
    "run_id": "r-...",
    "model": "claude-sonnet-4",
    "fallback_model": "gpt-4o-mini",
    "context_manifest": ".runs/r-.../context.json",
    "user_message_path": ".runs/r-.../user-message.md",
    "max_tokens": 8000,
    "temperature": 0.2,
    "timeout_sec": 300,

    // Harness binding (R-HRN-02, R-HRN-05) — orchestrator validates before dispatch
    "harness": {
      "manifest_path": "projects/P-202604-001/harness/manifest.yaml",
      "guardrails_path": "projects/P-202604-001/harness/guardrails.yaml",
      "profile": "L1",
      "trace_sink": "projects/P-202604-001/harness/traces/r-....jsonl",
      "permanent_fixes_path": "projects/P-202604-001/harness/permanent-fixes.md",
      "checkpoint_every_n_turns": 10,
      "drift_check_every_n_turns": 20,
      "tool_envelope_required": true,    // R-HRN-08
      "approval_webhook": "https://hooks.../approve"
    }
  }
```

### 5.2 Parallel multi-agent (e.g., P4 design)

Khi dispatch song song:

- **Đảm bảo các agent KHÔNG chia sẻ output** — mỗi agent independent, ghép ở §8 bằng integration-reviewer.
- Cost cap chung = tổng cap của phase, không phải sum individual cap.
- Nếu 1 agent fail → không kill pool, để các agent khác complete, retry riêng agent fail.

### 5.3 Sequential chain (e.g., retry with feedback)

- Output agent 1 → input agent 2, dùng `context chain` thay vì copy-paste, để audit trail rõ.
- Max chain depth = 3. Sâu hơn → tách phase.

---

## 6. Observation While Running (async)

- Không block driver — driver quay lại deep-work W01 §4.
- Orchestrator stream progress vào `.runs/{run-id}/stream.log`.
- Alert driver khi:
  - Timeout > 80% limit → preempt kill + retry
  - Cost actual > 120% estimate → kill, escalate
  - Output empty hoặc malformed JSON → kill, retry với prompt fix
  - **Drift detected** (state transition không nằm trong `manifest.yaml.allowed_transitions`) → halt + escalate, KHÔNG retry mù (R-HRN-07)
  - **Cache hit-rate < 50% sau 10 turn đầu** → halt + investigate (likely prompt non-determinism phá KV-cache prefix) (R-HRN-10)
  - **Tool return không envelope shape** (bare string error) → kill, fix wrapper trước (R-HRN-08)
  - **Approval timeout** (human không respond trong window đặt ở guardrails.yaml) → default DENY, halt (R-HRN-11)

---

## 7. Eval Scoring (auto, 1–3')

Ngay khi agent complete → **automated eval** chạy trước khi human nhìn:

### 7.0 Layer 0 — File-system existence (NEW v1.1, pre-eval gate)

Per `_shared/standards/output-validation.md` §2:
- File exists at expected path (anti-hallucination check vs trace.tools_called)
- File size: 200 bytes ≤ size ≤ 500KB
- UTF-8 valid + no null bytes
- Markdown parseable

L0 fail = re-dispatch with structured feedback. L0 catch BEFORE R-eval = cost saving.

### 7.1 Layer 1 — Structural check (deterministic, enhanced per output-validation §3)

- Markdown valid + frontmatter present with required fields (`agent_id, phase, project_id, generated_at`)
- Required sections per skill card `outputs.sections` (H2/H3 headings)
- Handoff section present + R-ORC-03 quote test (`required_inputs_to_quote` ≥ 3)
- Cross-refs (@path) resolve to existing files (skip external URLs)
- 0 banned words per `40-docs-rules` §R-DOC-07

Fail layer 1 → auto-retry 1 lần với structured critique. Nếu lại fail → BLOCK, escalate.

Full spec: [`@../../../../_shared/standards/output-validation.md`](../../../../_shared/standards/output-validation.md)

### 7.2 Layer 2 — Content eval (LLM-as-judge)

- Judge prompt: `_shared/eval/scoring-rubric.md` § {skill}
- Golden criteria 5 dimensions: correctness, completeness, clarity, actionability, citation-quality
- Score 1–10 mỗi dim → aggregate weighted

Threshold: `_shared/standards/cost-budgets.md §{skill}.eval_threshold` (thường ≥ 7.5).

### 7.3 Layer 3 — Harness compliance check (deterministic, R-HRN)

Cho mọi run, automated check trên trace:

| Check | Pass criteria | Fail action |
|---|---|---|
| **Tool envelope coverage** | 100% tool calls trong trace có envelope shape `{success, data, error, cost_usd, latency_ms}` | Block commit, fix wrapper |
| **Allowed transitions** | Mọi state transition ∈ `manifest.yaml.allowed_transitions` | Flag drift, retro-only |
| **Cache hit rate** | ≥ `manifest.yaml.cache.yellow_threshold` (default 50%) | Yellow alert nếu < target nhưng >= yellow; red block nếu < yellow |
| **Cost cap respected** | `actual_cost ≤ manifest.yaml.cost.per_run_usd_cap` | Block commit, escalate (R-MAS-07) |
| **Tool whitelist** | Mọi tool gọi ∈ `manifest.yaml.tools.whitelist[]` | Block commit, security review |
| **Observability triple** | Mọi turn có đủ 12 fields R-HRN-12 | Block commit, fix instrumentation |
| **Approval gate honored** | Mọi action class > read_only có corresponding approval log | Block commit, security review |

Layer 3 fail = **không thể bypass bằng human override** (vi phạm R-HRN structural). Phải fix wrapper / manifest / instrumentation trước, dispatch lại.

### 7.4 Log eval

```
_state.json.eval_scores.by_skill.{skill_id} = {
  "score": 8.2,
  "threshold": 7.5,
  "pass": true,
  "run_id": "r-...",
  "golden_set": "...",
  "judge_model": "claude-sonnet-4",
  "harness_compliance": {                 // Layer 3 (R-HRN)
    "envelope_coverage": 1.0,
    "drift_incidents": 0,
    "cache_hit_rate": 0.74,
    "cost_within_cap": true,
    "tool_whitelist_clean": true,
    "obs_triple_complete": true,
    "approval_log_present": true,
    "all_pass": true
  }
}
```

### 7.5 Retry policy per `_shared/rules/30-execution-rules.md`

- Pass → §8 human review.
- Fail 1st run → auto-retry 1 lần với judge feedback injected.
- Fail 2nd → BLOCK, queue cho prompt revision, escalate CTO.
- KHÔNG retry lần 3 với cùng prompt — waste $.

---

## 8. Human Review (10–60')

**Driver review là compulsory — không được skip dù eval pass.** Xem `_shared/rules/70-quality-rules.md` §no-self-approval.

### Checklist

1. **Fact check** mọi claim có citation → verify `@path` thực sự chứa statement đó. Random sample 3 citations nếu dài.
2. **Rules compliance**:
   - Code rules (`20-code-rules.md`) nếu output là code
   - Docs rules (`40-docs-rules.md`) nếu output là markdown
   - Security rules (`60-security-rules.md`) — mọi output
   - **Harness rules (`80-harness-rules.md`)** — mọi run: spot-check trace có envelope, allowed_transitions không vi phạm, approval log có cho action > read_only
3. **Scope check**: output có vượt ngoài "Non-goals" ở §3? Cắt bỏ phần ngoài.
4. **Template conformance**: so với `_shared/templates/project/{file}.md` — section thứ tự đúng?
5. **Edit in place**: driver có thể chỉnh tay. Mọi edit của human ghi vào `.runs/{run-id}/human-edits.diff` (audit).
6. **Decide**:
   - `approved` → §9
   - `needs-revision` → back §3, re-dispatch với feedback (counts as retry, check budget)
   - `rejected` → escalate, viết failure note, coi phase là fail. **Nếu reject vì harness violation** (drift / envelope / unauthorized tool / approval skip) → mandatory entry vào `harness/permanent-fixes.md` (R-HRN-06) trước khi re-dispatch.

---

## 9. Commit & State Update (2')

1. Move output từ `.runs/` → final path (e.g., `projects/{id}/03-architecture.md`).
2. Git commit:
   ```
   git commit -m "{project-id} P{N}: {phase-name} via {agent-id} + human-edit (run={run-id})"
   ```
3. Update `_state.json`:
   ```
   deliverables_index += [{
     phase: "P3",
     path: "03-architecture.md",
     status: "approved",
     approved_by: "{driver-name}",
     approved_at: ISO,
     run_id: "r-...",
     eval_score: 8.2
   }]
   cost_burn.llm_spend_to_date += actual_cost
   ```
4. Nếu đây là last deliverable của phase → update `lifecycle.current_phase = next_phase` + log `phase_history`.

---

## 10. Memory & Learning (2', conditional)

Sau commit, quét output + Layer W của run để tìm candidates promote lên Layer E/S:

- **Agent performance insight**: prompt pattern nào giúp agent tốt hơn? → đề xuất skill card update, log vào `_state.json.memory_promotion_queue[].candidate_type = "skill_update"`.
- **Domain knowledge insight**: fact mới về industry/baseline? → promote lên `knowledge/docs/memory/B{XX}-learnings.md` hoặc `I{YY}-learnings.md` (Layer S).
- **Failure pattern**: nếu retry cần thiết, log vào `_shared/eval/failure-modes.md` — đề xuất golden set mới.
- **Layer W → E**: nếu trong run agent ghi vào `.memory/episodic-buffer/candidates-for-retro.md` → driver duyệt nhanh, append insight đáng giữ vào `99-retro.md` (sau khi project close), hoặc add vào `_state.json.memory_promotion_queue[]` ngay.
- **Harness permanent-fix review** (R-HRN-06): nếu run trigger entry mới vào `projects/{id}/harness/permanent-fixes.md` → đánh giá scope ngay:
  - `project-only` → auto-load vào `manifest.yaml.local_rules[]` cho run kế (Engine handle)
  - `promote-candidate` (lặp ở 3+ project) → propose lên `_shared/rules/` qua ADR
  - `industry-specific` → promote lên `knowledge/data/industries/I0X/harness-quirks.md`

Thực thi promotion lên Layer S vào Fri retro (W02 §5.2 memory ceremony), KHÔNG promote ngay (tránh bias từ 1 data point).

**Promotion path đầy đủ**: Layer W → Layer E (retro) → Layer S (knowledge). Spec: `@../../../../_shared/standards/memory-runtime.md` §10. Hygiene: `@../../../../_shared/standards/memory-hygiene.md`.

---

## 11. Parallel Dispatch Coordination

Khi phase có nhiều agent song song (P4 design):

1. **Lock file** trong `.runs/{phase}/LOCK` — 1 driver điều phối, tránh double-dispatch.
2. **Shared cost budget** tracked ở `.runs/{phase}/cost-pool.json` — mỗi agent "trừ" budget trước khi start.
3. **Shared working pool** (Layer W): `projects/{id}/.memory/shared/{phase}/pool.md` — agent post key insight cho siblings; `decisions-pending.md` — propose decisions chờ consolidate. Spec: `@../../../../_shared/standards/memory-runtime.md` §6.1.
4. **Integration reviewer** (T3-integration) dispatch **sau khi tất cả agent khác done + human-approved**. Integration đọc shared pool + outputs, check conflicts.
5. Nếu integration phát hiện conflict → loop lại agent cụ thể (max 1 retry), không loop toàn bộ. Phase transition BLOCKED nếu `shared/{phase}/conflicts.md` non-empty.

---

## 12. Failure Modes

| Failure | Dấu hiệu | Xử lý |
|---|---|---|
| Context > 60% window | Agent trả về "context overflow" | Rút §2.3 → §2.2, restart |
| Agent hallucinate citation | Review phát hiện `@path` không tồn tại | Auto-fail eval, retry với rule "verify-before-cite" |
| Cost vượt 2× estimate | Stream log cảnh báo | Kill, escalate COO, prompt refactor |
| Eval pass nhưng human reject | Eval judge mềm quá | Log vào judge tuning queue, siết threshold retro |
| Agent loop infinite | Output tự trích dẫn tự ref | Timeout hit, blacklist prompt pattern |
| Parallel agent conflict | Integration reviewer flag | Loop agent cụ thể, không loop tất cả |
| Retry ≥ 3 cùng prompt | Pipeline stalled | Freeze skill, CTO rewrites prompt, log ADR |
| Human review skip | `deliverables_index.approved_by = "agent"` | Revert commit, block merge, retro flag |
| **Harness manifest missing/invalid** (R-HRN-05) | §1 Q6 fail | BLOCK, không dispatch — P0 phải set up trước. Escalate driver. |
| **Drift detected mid-run** (R-HRN-07) | State transition ∉ allowed_transitions | Halt + checkpoint snapshot. Driver review trace, đặt rule mới vào permanent-fixes.md, dispatch lại từ checkpoint. |
| **Tool not in whitelist** (R-HRN-03) | Trace flag tool unauthorized | Block commit. Nếu tool legit → ADR + add vào whitelist. Nếu không → security review. |
| **Envelope violation** (R-HRN-08) | Tool returns bare string | Block commit. Wrap tool ngay (KHÔNG retry agent — vấn đề ở wrapper). |
| **Cache hit-rate < 50%** (R-HRN-10) | Layer 3 eval red | Halt deploy. R-LLMOps phân tích prompt prefix tìm timestamp/UUID làm vỡ cache. |
| **Approval timeout** (R-HRN-11) | Webhook không respond trong window | Default DENY → halt. Driver check approver online, dispatch lại sau khi confirm SLA. |
| **Permanent-fix log skipped** sau reject | `harness/permanent-fixes.md` không có entry mới | Block re-dispatch (R-HRN-06 buộc author entry trước khi retry). |

---

## 13. Post-dispatch Hygiene (30'', mỗi EOD)

Trong EOD commit (W01 §10):

- `.runs/` folder > 30 ngày → archive sang `.runs/_archive/YYYY-MM/`.
- `.runs/{run-id}/` giữ lại: context.json, user-message, output, eval.json, human-edits.diff. Xóa intermediate streams.
- Metrics tổng hợp daily → `projects/_ops/metrics/YYYY-MM-DD.json`: dispatch count, pass rate, cost, avg review time.

---

## 14. Quick Reference Card (in ra dán gần máy)

```
┌──────────────────────────────────────────────┐
│ BEFORE DISPATCH                              │
│  1. 6 pre-checks ✓ (incl. harness valid)     │
│  2. Load context (mandatory + harness)       │
│  3. Write task framing ≥ 100 words           │
│  4. Cost estimate ≤ cap remaining / 3        │
├──────────────────────────────────────────────┤
│ DURING                                       │
│  5. Don't block — deep-work continue         │
│  6. Alert: timeout/cost/malformed/DRIFT/CACHE│
├──────────────────────────────────────────────┤
│ AFTER                                        │
│  7. Auto-eval 3 layers:                      │
│       L1 structural · L2 content · L3 HARNESS│
│  8. Human review MANDATORY                   │
│  9. Commit + update _state.json              │
│ 10. Memory + permanent-fix promotion review  │
├──────────────────────────────────────────────┤
│ NEVER                                        │
│  ✗ Skip RULES-PREAMBLE injection             │
│  ✗ Skip harness manifest/guardrails load     │
│  ✗ Skip human review                         │
│  ✗ Retry 3rd with same prompt                │
│  ✗ Retry after harness violation w/o p-fix   │
│  ✗ Let agent self-approve                    │
│  ✗ Bypass Layer 3 eval (structural rule)     │
└──────────────────────────────────────────────┘
```

---

## 15. Cross-References

- Rules preamble: `@../../../../_shared/prompts/RULES-PREAMBLE.md`
- Rules stack: `@../../../../_shared/rules/`
- Agent catalog: `@../../../../_shared/.agents/README.md`
- Eval spec: `@../../../../_shared/eval/SPEC.md` + `scoring-rubric.md` + `failure-modes.md`
- Cost budgets: `@../../../../_shared/standards/cost-budgets.md`
- DoD: `@../../../../_shared/standards/dod-per-deliverable.md`
- **Memory runtime spec (3-layer S/E/W)**: `@../../../../_shared/standards/memory-runtime.md`
- **Memory hygiene (long-term)**: `@../../../../_shared/standards/memory-hygiene.md`
- Context loading rule: `@../agents/CONTEXT-LOADING.md`
- Execution rules: `@../../../../_shared/rules/30-execution-rules.md`
- Quality rules: `@../../../../_shared/rules/70-quality-rules.md`
- **Harness rules**: `@../../../../_shared/rules/80-harness-rules.md` (R-HRN-01..12)
- **Lifecycle rules** (priority, demote, vendor): `@../../../../_shared/rules/90-lifecycle-rules.md` (R-LCY-01..09)
- **Orchestration rules** (dispatcher, tiebreak, handoff QA, rewind): `@../../../../_shared/rules/100-orchestration-rules.md` (R-ORC-01..09)
- **Harness template**: `@../../../../_shared/templates/project/harness/` (manifest.yaml + guardrails.yaml + permanent-fixes.md)
- **Cross-path coordination**: [`W10-cross-path-priority.md`](W10-cross-path-priority.md) (when ≥2 paths active)
- **Phase rewind**: [`W12-phase-rewind.md`](W12-phase-rewind.md) (when phase N+ finds phase N flawed)
- **Knowledge review**: [`W11-knowledge-review.md`](W11-knowledge-review.md) (staging → production gate)
- **Agent onboarding**: [`W09-agent-onboarding.md`](W09-agent-onboarding.md) (new agent first-deploy)
- Daily ops (where this sits in day): [`W01-daily-operating-rhythm.md`](W01-daily-operating-rhythm.md) §3, §8
- E2E project walkthrough: [`W03-new-project-walkthrough.md`](W03-new-project-walkthrough.md)

---

*Last updated: 2026-04-27 · v1.1 (harness integration)*
