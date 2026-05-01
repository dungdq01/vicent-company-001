---
file: 100-orchestration-rules
version: v1.0
last_updated: 2026-04-27
owner: COO
status: production
---

# Orchestration Rules — Dispatcher · Tiebreak · Handoff QA · Agent Onboarding

> Authority chain previously assumed (CEO/CTO/COO ad-hoc handle). File này formalize: ai dispatch path nào, ai tiebreak conflict, handoff giữa tier có QA gate, agent mới ship qua probation.

---

## R-ORC-01 — Path Dispatcher (single entry point)

Mọi inbound (email, DM, content trigger, knowledge alert, ops issue) MUST đi qua dispatcher trước khi entry path. Dispatcher trách nhiệm:

1. Classify input → 1 trong 5 paths (A/B/C/D/E per `00-OPERATING-MANUAL.md`)
2. Set priority per R-LCY-06
3. Provision resource lock per R-LCY-07
4. Invoke entry phase doc của path đó
5. Log dispatch to `projects/_ops/dispatch-log.jsonl`

Dispatcher có thể là:
- **Human (P3 / COO)** for Phase 1 (low volume)
- **R-Dispatcher agent** when inbound > 5/day (Phase 2+)

Cả 2 follow same protocol. Skip dispatcher = orphan input = drop ball.

---

## R-ORC-02 — Tiebreak Authority Hierarchy

Khi 2+ agent same-tier output conflicting (e.g., R-NLP recommend Haiku, R-MLE recommend Sonnet trong P4 parallel):

| Conflict scope | Tiebreaker | Time budget |
|---|---|---|
| Tactical (which lib, which model variant) | **Integration reviewer** (T4 R-SA) per pre-defined rule in skill cards | 1 turn |
| Architectural (which approach entirely) | **Charter owner of impact domain** — tech → CTO, biz → COO, brand → CEO | 24h |
| Cross-charter (impacts 2+) | **Triage call** with all charter owners | 48h |
| Stuck > 48h | **Escalation = pause project** until resolved | — |

Integration reviewer MUST have explicit tiebreak rule in their skill card. If no rule exists for the conflict pattern → escalate to charter owner + propose new tiebreak rule (becomes part of skill card update).

---

## R-ORC-03 — Cross-Tier Handoff QA Gate

Information loss is the #1 failure pattern in agent systems (per harness research §3). Every handoff between tiers MUST pass QA:

**Sender (output side)** writes structured handoff per R-COM-02:
```yaml
handoff:
  from: {agent_id}
  to: {next_agent_id_or_phase}
  status: ready | blocked | partial
  key_decisions: [...]               # bullet list, ≤ 5
  open_questions: [...]
  required_actions_for_next: [...]
  watch_outs: [...]
  required_inputs_to_quote: [...]    # NEW — fields receiver MUST cite
```

**Receiver (input side)** MUST in their first turn:
1. Acknowledge handoff (per current W04 §collaboration-contract)
2. **Quote at least 3 items from `required_inputs_to_quote[]` verbatim**
3. Identify blockers — if blocking, `needs_clarification` + pause
4. If quote test fails → handoff incomplete → escalate sender, do NOT proceed

This is the QA gate that catches "agent skim, miss critical insight" pattern.

---

## R-ORC-04 — Agent First-Deploy Onboarding

When new agent (R-LLMOps, R-DataOps, etc.) created, MUST go through onboarding trước khi ship:

| Stage | Gate | Owner |
|---|---|---|
| **1. Skill card draft** | Includes Role, Inputs, Outputs, System Prompt, Tools, Cost Target, Eval, Failure Modes, Cross-Refs (template `R-Dxx-template.md` style) | Author |
| **2. Golden eval set** | ≥ 20 cases per R-QAL-03 | Author + R-QA |
| **3. Probation period** | Run on 3 internal projects (not client) — log eval scores | Author |
| **4. Integration test** | Verify handoff with adjacent tier agents (R-ORC-03) | R-PM |
| **5. Cost calibration** | Actual cost / 5 runs ≤ 1.2× target | CTO |
| **6. CTO sign** | ADR + entry to `_shared/.agents/CHANGELOG.md` | CTO |
| **7. Production deploy** | After all 6 gates pass | Engine |

Cấm: skill card created → straight production. Probation MANDATORY per R-MAS-08 spirit (eval before promote — applies to AGENTS, not just prompt versions).

---

## R-ORC-05 — Resource Lock Acquisition Protocol

Per R-LCY-07, agent dispatch MUST acquire lock:

```
acquire(resource_id, project_id, duration) →
  if lock_free OR same_project: return LOCK_GRANTED
  if higher_priority_project waiting: return WAIT_QUEUE_POSITION
  if deadlock detected (A→B, B→A): return ABORT, escalate COO
```

Resource categories:
- LLM API quota (daily $ allocation per project)
- Specific agent slot (R-α can run 2 concurrent max — same-tier serialize)
- Vendor service (Helicone trace volume, Postgres connection pool)
- Human review slot (Driver capacity per W01)

Engine maintains `projects/_ops/resource-lock.json` ledger. COO audit weekly.

---

## R-ORC-06 — Handoff Failure Recovery

Khi receiver phát hiện handoff incomplete (R-ORC-03 quote test fail):

1. Emit `handoff_incomplete` event with: missing_field, sender_id, receiver_id
2. Re-dispatch sender với feedback "missing X, please re-output"
3. Counts as 1 retry against R-EXE-07 retry budget
4. If sender fail 2× → escalate per skill card failure mode

NOT: receiver papers over missing info → silent drift.

---

## R-ORC-07 — Phase Rewind Protocol

Khi phase N+ phát hiện phase N output sai (e.g., P5 finds P3 architecture flawed):

1. Log `phase_rewind_request` in `_state.json` với: which_phase, why, evidence
2. Cost accounting: spent on N..current = "wasted_on_rewind", tracked separate
3. Charter owner approve rewind (CTO for arch, CEO for scope, COO for delivery timeline)
4. After approve:
   - Snapshot current state to `_archive/{run_id}-pre-rewind/`
   - Reset `_state.json.lifecycle.current_phase = N`
   - Re-dispatch phase N with critique injected (similar to retry)
5. Cumulative wasted_on_rewind > 30% project budget → halt + retro

Cấm: silent revert without ADR.

---

## R-ORC-08 — Voice Contract per Deliverable

Output cuối cùng tới client/audience phải consistent voice. Each deliverable type pinned to voice:

| Deliverable | Voice owner | Style guide |
|---|---|---|
| Discovery report (client) | P3 — formal business VN | `16-brand-content-kit.md` Voice B |
| Architecture doc (technical) | CTO — technical EN/VN bilingual | Voice A |
| SOW / proposal | P3 — formal business | Voice B |
| Bot reply (Telegram, e-com) | Per project — usually friendly VN | Project-specific in `harness/manifest.yaml.voice` |
| Content (TikTok, Threads, Substack) | Per channel — `16` Voice A/B/C | `16-brand-content-kit.md` |
| Internal Slack / Discord | Direct, terse | Studio internal |

R-σ + integration reviewer verify voice consistency before output ships. Voice contract injected into agent prompt automatically (extension to RULES-PREAMBLE).

---

## R-ORC-09 — Multi-Path Concurrent Orchestration

When ≥2 paths active per R-LCY-06:
- Each path has own state machine, KHÔNG share `_state.json`
- Dispatcher coordinates via `projects/_ops/active-paths.json`:

```yaml
active_paths:
  - path: A
    project_id: P-202604-003
    phase: P5
    priority: 1
    resources_locked: [R-PM, R-DO]
  - path: D
    research_id: I-MMO-v2-refresh
    priority: 4
    resources_locked: [R-α]
    blocking: [P-202604-003 P5]    # explicit dependency
  - path: C
    content_id: ceo-substack-2026-W18
    priority: 6
    resources_locked: []
```

Path D blocking Path A → D get bumped priority temporarily until unblocks.

---

## Quick Reference

```
ORCHESTRATION RULES (R-ORC):
01 Path dispatcher = single entry point
02 Tiebreak hierarchy (tactical / architectural / cross-charter / stuck)
03 Cross-tier handoff QA — receiver MUST quote 3+ inputs verbatim
04 Agent first-deploy onboarding — 7-stage probation
05 Resource lock acquisition protocol
06 Handoff failure recovery
07 Phase rewind protocol — never silent revert
08 Voice contract per deliverable
09 Multi-path concurrent state coordination
```

---

## Cross-References

- Master conflict: [`@./00-MASTER-RULES.md`](00-MASTER-RULES.md) §R-MAS-12
- Communication: [`@./50-communication-rules.md`](50-communication-rules.md) §R-COM-02
- Execution + retry: [`@./30-execution-rules.md`](30-execution-rules.md) §R-EXE-07
- Lifecycle (priority, resource lock): [`@./90-lifecycle-rules.md`](90-lifecycle-rules.md) §R-LCY-06, §R-LCY-07
- Brand voice: [`@../../business-strategy/16-brand-content-kit.md`](../../business-strategy/16-brand-content-kit.md)
- Dispatch runbook: [`@../../experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md`](../../experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md)

---
*v1.0 — formalizes authority chain + handoff QA + agent onboarding. Adopted 2026-04-27.*
