---
file: 80-harness-rules
version: v1.0
last_updated: 2026-04-27
owner: CTO
status: production
---

# Harness Rules — Agent Runtime Operating Principles

> **Triết lý**: `Agent = Model + Harness`. Model là não, Harness là **môi trường vận hành** (control loop, tools, memory, guardrails, recovery, observability) bao quanh model. Đây là rule cho **runtime của mọi agent**, áp dụng cross-cutting tới mọi phase, mọi tier, mọi project. Không phải skill riêng — là cách mọi thứ vận hành.
>
> **Quan hệ với rule khác**: 70-quality nói "phải đạt threshold gì" (output side). 80-harness nói "loop phải vận hành thế nào để đạt được" (process side). 60-security nói "không được làm gì". 80-harness nói "khi làm thì cấu trúc loop ra sao".

---

## R-HRN-01 — Harness Profile Mandatory at P0

Mỗi project P0 Intake MUST gán **harness profile**:

| Profile | Stakes | Mandatory components |
|---|---|---|
| **L0 Sandbox** | Internal R&D, throwaway | control loop + tool whitelist + cost cap |
| **L1 Standard** | Sprint A/B client | + memory tier + drift checkpoint + permanent-fix log |
| **L2 Critical** | Production / regulated (Healthcare/Finance) | + sandbox isolation + structured error envelope + approval gates explicit + observability full trace |

Profile ghi vào `projects/{id}/_meta.json.harness_profile`. Engine MUST validate components present trước khi cho dispatch agent đầu tiên.

> Why: harness over-engineered cho throwaway = waste; under-engineered cho production = incident. Stakes-aware.

---

## R-HRN-02 — Control Loop Explicit (No Black Box)

Mọi agent run MUST có state machine có thể serialize + resume:

- State transitions logged: `{from_state, to_state, action, timestamp, agent_id, turn_n}` → `projects/{id}/harness/traces/{run_id}.jsonl`
- Checkpoint mỗi N turn (default N=10, override per profile)
- Resumable: nếu kill mid-run, restart từ checkpoint cuối, KHÔNG replay từ đầu

Loop pattern: **Observe → Plan → Act → Evaluate → Reflect**. Mỗi bước có entry trong trace. Skip 1 bước = skipped step alert.

> Why: long-running agents (>30 phút, >50 turns) fail silently nếu không observable. Đây là precondition cho mọi recovery.

---

## R-HRN-03 — Tool Budget Strictly Bounded

Mỗi agent skill card MUST khai báo + Engine MUST enforce:

| Bound | Default cap | Override via |
|---|---|---|
| Tool whitelist size | ≤ 20 tools | ADR + harness profile L2 |
| Calls per turn | ≤ 5 | ADR per skill card |
| Cost per turn | per skill card | R-MAS-07 |
| **Progressive cost alert** (v1.1, Tier A #8) | 50% info / 75% warn / 90% halt-ask / 100% block | `manifest.yaml.cost.alert_thresholds` |
| Tool schema validation | **mandatory** (Pydantic/Zod or equivalent) | — |

**Progressive cost alert** (v1.1): Engine MUST emit alerts at 50% (info log), 75% (driver notify), 90% (halt next dispatch + ask "continue?"), 100% (hard block per R-MAS-07). Catches cost runaway BEFORE breach instead of after-the-fact.

Tool sprawl > 20 = tool selection accuracy giảm (production data từ harness research §2). Cấm bypass bằng "wrapper tool gọi 5 sub-tool".

> Cross-ref: 60-security R-SEC (auth on tool calls) · 10-stack-rules (approved tool list).

---

## R-HRN-04 — Memory Tiered (3 layers mandatory)

Mọi agent run MUST vận hành 3 tier memory rõ ràng:

| Tier | Scope | Storage | Compaction trigger |
|---|---|---|---|
| **Scratchpad** | Within turn | Conversation | Reset every turn |
| **Working** | Within run | Conversation accumulator | Compact at **70% context window** (mandatory) |
| **Long-term** | Across runs / sessions | `projects/{id}/harness/memory/{key}.md` (append-only) hoặc vector store | Promote per R-MAS-05 |

Compaction = summarize working memory bằng eval-judge model (per R-QAL-13 eval independence), KHÔNG cùng model đang chạy.

Long-term memory MUST be **transferable** (R-QAL-10) — không lưu "fixed bug X in project Y", lưu pattern.

> Cross-ref: R-MAS-05 (memory promotion path L4 → L1) · R-QAL-10 (memory hygiene).

---

## R-HRN-05 — Per-Project Harness Folder Mandatory

Mỗi project MUST có structure:

```
projects/{id}/harness/
├── manifest.yaml          # control loop config, tool whitelist, memory tier sizes, profile L0/L1/L2
├── guardrails.yaml        # approval gates, denied actions, human-in-loop triggers
├── permanent-fixes.md     # append-only log of failures → rules added (R-HRN-06)
├── memory/                # long-term tier per R-HRN-04
│   └── {key}.md
└── traces/                # control loop traces per R-HRN-02
    └── {run_id}.jsonl
```

Engine MUST refuse dispatch nếu folder không tồn tại (P0 setup gen từ template `_shared/templates/project/harness/`).

> Why: harness must be **explicit + versionable** like code. Drift trong harness = drift trong agent behavior.

---

## R-HRN-06 — Permanent-Fix Loop (Failure → Rule)

Khi agent fail (eval < threshold OR exception OR human reject):

1. Diagnose root cause (1× retry với critique theo R-EXE-07 trước)
2. Nếu vẫn fail → write 1 entry vào `projects/{id}/harness/permanent-fixes.md`:
   ```
   ## YYYY-MM-DD · {failure_id}
   **Pattern**: {what went wrong, transferable description}
   **Rule added**: {prescriptive rule, e.g., "before tool X, must check Y"}
   **Scope**: project-only / promote-candidate
   **Owner**: {agent_id or human}
   ```
3. Rule auto-loaded vào RULES-PREAMBLE cho mọi agent run TRONG project này (per `_meta.json.harness.local_rules[]`)
4. Promote path:
   - Lặp ở 3+ project → promote vào `_shared/rules/` (theo R-QAL-06 + R-MAS-05)
   - Industry-specific → promote vào `knowledge/data/industries/I0X/harness-quirks.md`

Cấm: retry mù không write rule. "Failure without learning = failure twice" (R-QAL-06).

> Cross-ref: R-QAL-06 (failure mode catalogue) · R-MAS-05 (promotion path) · R-EXE-07 (retry budget).

---

## R-HRN-07 — Drift Checkpoint Every 20 Turns

Long-running agents MUST tự re-ground:

| Turn count | Action |
|---|---|
| Every 20 turns | Re-inject original task spec + structured todo list status |
| Every 50 turns | Mandatory eval re-check vs original DoD |
| Drift signal detected (state machine state ∉ planned states) | Halt + escalate |

Drift signal = trace shows state transition not in allowed set per `harness/manifest.yaml.allowed_transitions`. Engine MUST flag, không phải agent tự flag (agent ít khả năng tự nhận drift — R-QAL-13 eval independence).

> Cross-ref: R-QAL-08 (drift detection production-level) — R-HRN-07 là run-level, R-QAL-08 là 7-day rolling.

---

## R-HRN-08 — Structured Error Envelope (No Bare Strings)

Mọi tool call return MUST theo schema:

```typescript
type ToolResult = {
  success: boolean;
  data: unknown | null;
  error: {
    code: string;         // enumerated, e.g., "TOOL_TIMEOUT", "INVALID_INPUT"
    message: string;
    recoverable: boolean; // can agent retry?
    retry_after_ms?: number;
  } | null;
  cost_usd: number;
  latency_ms: number;
}
```

Cấm: tool trả `"Error: something"` text. Cấm: tool trả null mà agent đoán nghĩa. Engine wrap mọi tool legacy bằng adapter envelope.

Lý do: silent failure (agent "ảo giác" success rồi tiếp tục) là failure mode #3 phổ biến nhất theo harness research. Envelope buộc agent phải check `success` flag explicit.

---

## R-HRN-09 — Sandbox by Default for Code Execution

Mọi tool có ability execute code (`code_execution`, `bash`, `shell`) MUST:

- Chạy trong container/VM riêng — KHÔNG shared filesystem với host
- Network egress whitelist (default deny, allow-list per project)
- Filesystem mount read-only trừ designated workspace dir
- Timeout cứng 5 phút per call (override với ADR)

Profile L2 (Critical) thêm: ephemeral sandbox (destroy after run), network full deny trừ approved API endpoints.

> Cross-ref: 60-security-rules R-SEC (broader security policy).

---

## R-HRN-10 — KV-Cache Hit Rate Target ≥ 70% (4-Tier Build Order)

Production agent runs MUST build prompt **bottom-up in 4 tiers, NO interleaving** — preserves cache prefix:

```
TIER 1 (cache forever — invalidate only on skill card v++):
  RULES-PREAMBLE + skill_card + AGENT-MANUAL excerpt
  ≈ 8K tokens stable

TIER 2 (cache per agent×phase — invalidate on phase doc v++):
  phase_spec.input_contract + phase_spec.output_contract
  (extract via HTML anchors per E5 / 40-docs-rules)
  ≈ 4K tokens stable

TIER 3 (cache per project — invalidate on _meta.json change):
  manifest.yaml inline + guardrails.yaml inline + local_rules
  ≈ 3K tokens stable per project

TIER 4 (per dispatch — no cache):
  _state.json snapshot + previous_phase_handoff + working_memory + task_instruction
  ≈ variable

PROMPT = T1 + T2 + T3 + T4   (in this exact order, NO shuffling)
Cache breakpoint: AFTER T3 (T1+T2+T3 = 1 cache prefix unit)
```

### Anthropic API mechanic

Set `cache_control: {"type": "ephemeral"}` on the **LAST content block of T3**. Engine reference:

```python
messages = [
  {"role": "system", "content": [
    {"type": "text", "text": tier_1_text},                # cache (skill card)
    {"type": "text", "text": tier_2_text},                # cache (phase spec)
    {"type": "text", "text": tier_3_text,
     "cache_control": {"type": "ephemeral"}}              # ← breakpoint here
  ]},
  {"role": "user", "content": tier_4_text}                # no cache
]
```

### TTL warning (5 phút Anthropic)

Anthropic prompt cache TTL = **5 phút idle** → cache expired → next call miss + full input cost.

**Async engagement pattern**:
- Continuous dispatch (< 4 phút gap) → cache stays warm
- Long idle (> 5 phút) → first call after idle = cache miss, accept it
- Warm-up workaround: dispatch dummy ping mỗi 4 phút (overhead acceptable cho long-running orchestration)

### Anti-pattern (cache pollution — common bug)

❌ **NEVER inject dynamic content into T1/T2/T3**:
- timestamp / current_date
- run_id / dispatch_id
- task_id / job_id
- random nonce
- "current phase" if loaded from state (use phase NAME from spec, not state.current_phase)

→ Tất cả dynamic data ONLY trong T4. Vi phạm = cache hit rate 0%, **invisible silent cost regression** (cost up 5-10×, eval pass nhưng bill explode).

### Hit rate monitoring

| Metric | Target | Action |
|---|---|---|
| KV-cache hit rate (stable prompts) | ≥ 70% | — |
| Hit rate 50–70% | 🟡 yellow | R-LLMOps investigate (prompt structure suspect) |
| Hit rate < 50% | 🔴 red | halt deploy + investigate (likely T1-T3 pollution) |

> Why: cache miss = 5-10× cost. Manus published KV-cache hit rate là metric #1 cho production agent (harness research §3).

---

## R-HRN-11 — Approval Gate Matrix (Stakes-Aware)

Mỗi action có potential blast radius MUST classify per `harness/guardrails.yaml`:

| Action class | L0 Sandbox | L1 Standard | L2 Critical |
|---|---|---|---|
| Read-only (file, query) | auto | auto | auto |
| Write to project workspace | auto | auto | auto |
| Write to shared / global | auto | human approve | human approve + ADR |
| External call (API write) | mock | human approve first run | always approve |
| Destructive (delete, refund, deploy prod) | blocked | human + 2nd approver | CTO + CEO |
| Communication external | blocked | always blocked (R-MAS-11) | always blocked |

Matrix mặc định, project có thể tighten (KHÔNG loosen) qua `guardrails.yaml`.

> Cross-ref: R-MAS-09 (human gates) · R-MAS-11 (forbidden globally).

---

## R-HRN-12 — Observability Triple (Trace + Cost + Latency)

Mọi turn của mọi agent MUST emit:

```yaml
turn_id: {uuid}
run_id: {uuid}
project_id: {id}
agent_id: {id}
timestamp: {iso8601}
input_tokens: {n}
output_tokens: {n}
cache_read_tokens: {n}
cache_write_tokens: {n}
cost_usd: {n}
latency_ms: {n}
tools_called: [{name, success, latency_ms}]
state_before: {state_id}
state_after: {state_id}
```

Sink: `projects/{id}/harness/traces/{run_id}.jsonl` + Helicone (per [`@../standards/cost-budgets.md`]).

Missing field = trace incomplete = R-SRE alert.

---

## Quick Reference

```
HARNESS RULES (R-HRN):
01 Harness profile mandatory at P0 (L0/L1/L2)
02 Control loop explicit + checkpointable
03 Tool budget ≤ 20 whitelist, ≤ 5 calls/turn, schema validated
04 Memory tiered (scratchpad / working compact 70% / long-term transferable)
05 Per-project harness/ folder mandatory
06 Permanent-fix loop: failure → rule → promote
07 Drift checkpoint every 20 turns, eval re-check every 50
08 Structured error envelope (no bare strings)
09 Sandbox by default for code execution
10 KV-cache hit rate ≥ 70%
11 Approval gate matrix stakes-aware
12 Observability triple (trace + cost + latency)
```

---

## Cross-References

- Master rules: [`@./00-MASTER-RULES.md`](00-MASTER-RULES.md) (R-MAS-05 memory · R-MAS-09 human gate · R-MAS-11 forbidden)
- Quality rules: [`@./70-quality-rules.md`](70-quality-rules.md) (R-QAL-06 failure mode · R-QAL-08 drift · R-QAL-10 memory hygiene)
- Security rules: [`@./60-security-rules.md`](60-security-rules.md) (sandbox + auth detail)
- Execution rules: [`@./30-execution-rules.md`](30-execution-rules.md) (R-EXE-07 retry budget)
- Stack rules: [`@./10-stack-rules.md`](10-stack-rules.md) (approved tool list)
- Preamble: [`@../prompts/RULES-PREAMBLE.md`](../prompts/RULES-PREAMBLE.md) (auto-load)
- Project template: [`@../templates/project/harness/`](../templates/project/harness/) (skeleton)

---

*v1.0 — Adopted 2026-04-27. Source: practitioner consensus 2025-2026 (Anthropic Building Effective Agents, Cognition "Don't build multi-agents", Manus Context Engineering, LangGraph state graphs). Adapt to studio context, do NOT copy verbatim.*
