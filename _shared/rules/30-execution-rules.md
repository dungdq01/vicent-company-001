---
file: 30-execution-rules
version: v1.0
last_updated: 2026-04-26
owner: COO
status: production
---

# Execution Rules — Pipeline & Agent Collaboration

> Mọi pipeline run (product P0-P9 + business S/C/CS/H/F) bám vào rules này.

---

## R-EXE-01 — Phase Order is Sacred

Pipeline phases MUST run in declared order. Skipping a phase requires:
- Scope tier waiver (e.g., Sprint A skips P3-P9 by design)
- ADR for any other skip
- COO sign

> Auto-check: state machine in engine refuses out-of-order transitions.

---

## R-EXE-02 — Phase Transition Gate

To advance from Px → Px+1, MUST:
1. All DoD items in `quality/DOD-CHECKLIST.md` ✅
2. Eval pass (per agent) ≥ threshold
3. Filesystem check pass (`FILESYSTEM-CHECKLIST.md`)
4. Required human sign-off recorded in `meta/decisions.md`

Block transition on any failure → emit `phase_blocked` event.

---

## R-EXE-03 — Single Active Phase

Each project MUST have **exactly one** active phase at a time (except P4 sub-phases which run parallel by design). Concurrent active phases = state corruption.

Engine state machine enforces.

---

## R-EXE-04 — Agent Dispatch Rule

Agent invocation MUST include:
- `agent_id` (per `TEAM-CONFIG.md` roster)
- `skill_card_path` (loaded as system prompt)
- `rules_preamble` (`_shared/prompts/RULES-PREAMBLE.md`) — injected
- `context_pack` (per `AGENT-WORKSPACE-PIPELINE §4.4` Smart Knowledge Loading)
- `task_brief` (specific deliverable expected)
- `phase_id` + `project_id`

Missing any → engine refuses dispatch.

---

## R-EXE-05 — Context Loading Discipline

Agent MUST receive **minimum context needed** (Hermes H2 principle):
- Don't dump entire knowledge base
- Load only relevant baseline + industry + previous-phase outputs
- Token budget per agent type defined in `AGENT-WORKSPACE-PIPELINE §4.4`

Over-loading = cost overrun + signal-to-noise loss.

---

## R-EXE-06 — Parallel vs Sequential

| Pattern | When | Example |
|---|---|---|
| **Sequential** | Output of A is input to B | P1 (R-α) → P2 (R-γ + R-σ) |
| **Parallel (fan-out)** | Independent research / design | P4 sub-phases (BE/DE/MLE/FE) · T2 Layer 2 in research mode |
| **Parallel (consensus)** | Same task, multiple agents, vote | rare; CTO sign required |

MUST document pattern in pipeline doc + skill card.

---

## R-EXE-07 — Retry Budget

Each agent step has retry budget:
- **Eval retry band**: 1 retry with critique injected
- **API failure retry**: 2 retries with exponential backoff (1s, 4s)
- **Rate limit**: wait per `Retry-After` header, then retry once

Beyond budget → escalate per `EVAL-GATES.md`. MUST NOT silently retry forever.

---

## R-EXE-08 — Checkpoint Every Phase

Engine MUST checkpoint at every phase end:
- Save full agent outputs to `projects/{id}/{phase}/`
- Update `_state.json` with phase status + timestamp
- Ability to resume from last checkpoint after crash

MUST NOT lose work due to engine restart.

---

## R-EXE-09 — Human Checkpoint Required

These phases REQUIRE human sign-off before proceeding (per pipeline DoD):

| Phase | Sign-off | Owner |
|---|---|---|
| P0 (intake) | Brief approval | User/COO |
| P2 → G1 | SOW signature | Client + COO |
| P3 (architecture) | LLM choice + stack | CTO |
| P4c (ML) | Algorithm rationale | CTO + CEO |
| P8 (deploy) | Production approval | CTO |
| P9 (acceptance) | Client acceptance | Client + COO |
| S4 (close) | Discount > 15% | COO/CEO |
| H3 (offer) | Hire decision | CEO + COO |

Auto-skip = `MUST NOT`. Engine pauses + emits `awaiting_human`.

---

## R-EXE-10 — Cost Cap Enforcement

Per `_shared/standards/cost-budgets.md`:
- Engine MUST estimate cost before agent dispatch
- Project cumulative cap enforced at 100% (hard halt)
- Soft warning at 80% to COO + CTO

MUST NOT continue execution past cap. Escalation only.

---

## R-EXE-11 — Eval Gate Per Step

After every agent step:
- Run eval (LLM-as-judge per `_shared/eval/SPEC.md`)
- Apply threshold (`EVAL-GATES.md`)
- Decision: pass / retry / escalate
- Log to `eval-result-{step}.json`

MUST NOT skip eval to save cost.

---

## R-EXE-12 — Cross-Pipeline Handoff

Handoffs between pipelines (e.g., S5 → P0, P9 → CS0) MUST:
1. Produce structured handoff doc (`handoff-to-{target}.md`)
2. Trigger target pipeline P0 with handoff as input
3. Receiver agent ack within 24h
4. Source agent stays warm (escalation contact) for 30 days

Cliff handoffs banned.

---

## R-EXE-13 — Memory Promotion Trigger

After every phase end:
- Insights candidate for memory → R-σ flags in retro doc
- After P9 retro → R-σ proposes promotion to `knowledge/docs/memory/{B,I}-learnings.md`
- CTO/CEO review monthly memory deltas
- Promote ≥ 3-project pattern → skill card update + golden set add

MUST NOT skip retro = MUST NOT lose institutional knowledge.

---

## R-EXE-14 — Failure Escalation

When eval / retry budget exhausted:
1. Engine emits `agent_failed` event
2. Include: agent_id · phase_id · error mode (per `failure-modes.md`)
3. Tag charter owner per agent tier (T1-T2-T4 = CTO; T3 = COO; T5 = COO/CEO per `tier-5-business/README.md`)
4. Slack alert + Notion task created
5. Project state → `BLOCKED` until human resolves

---

## R-EXE-15 — Concurrent Project Limit

Engine concurrency caps (Phase 1):
- Active projects: ≤ 5
- Concurrent agent calls: ≤ 10
- Daily LLM cost: ≤ $50/day

Beyond → queue (BullMQ Phase 2). Hard limits per `cost-budgets.md`.

---

## R-EXE-16 — Cross-Layer Sync

Engine MUST sync writes to:
- `knowledge/docs/memory/` (read-only by agents but updated by retro promotion)
- `_shared/.agents/CHANGELOG.md` (prompt versions)
- `projects/{id}/_state.json` (phase state)

Inconsistency between these = blocker.

---

## Quick Reference

```
EXECUTION RULES (R-EXE):
01 Phase order sacred · 02 Transition gate · 03 Single active phase
04 Dispatch contract · 05 Min context · 06 Parallel pattern documented
07 Retry budget · 08 Checkpoint every phase · 09 Human gates
10 Cost cap hard · 11 Eval gate every step · 12 Handoff structured
13 Memory promotion · 14 Failure escalation · 15 Concurrency cap
16 Cross-layer sync
```

---

## Cross-References

- Pipeline (product): [`@../../experience/workspace/docs/pipeline/`](../../experience/workspace/docs/pipeline/)
- Pipelines (business): [`@../../experience/workspace/docs/pipelines-business/`](../../experience/workspace/docs/pipelines-business/)
- DoD checklist: [`@../../experience/workspace/docs/quality/DOD-CHECKLIST.md`](../../experience/workspace/docs/quality/DOD-CHECKLIST.md)
- Eval gates: [`@../../experience/workspace/docs/quality/EVAL-GATES.md`](../../experience/workspace/docs/quality/EVAL-GATES.md)
- Engine spec: [`@../../experience/AGENT-WORKSPACE-PIPELINE.md`](../../experience/AGENT-WORKSPACE-PIPELINE.md)

---
*v1.0*
