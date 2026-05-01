# W12 — Phase Rewind Protocol

> Per R-ORC-07. Discover ở P5 Planning rằng P3 Architecture sai. Hiện framework chỉ đi forward — file này spec how to rewind without silent revert.

**Trigger**: Any phase N+ discovers phase N output structurally flawed.
**Owner**: Driver of current phase + Charter owner of impacted domain.
**Authority**: CTO (architecture rewind), CEO (scope rewind), COO (delivery timeline rewind).

---

## 1. When to Rewind vs Patch Forward

| Symptom | Rewind | Patch forward |
|---|---|---|
| Architecture fundamentally wrong (state machine, tech stack) | ✅ rewind to P3 | ❌ patches compound debt |
| Scope unclear / missed feature | depends on cost | ✅ if small, ⚠️ if structural |
| Wrong eval threshold | ❌ patch (just update threshold) | ✅ |
| Knowledge node version wrong | depends — may trigger Path D | ✅ if minor |
| Failed integration between agents | ✅ if reveals architectural flaw | ✅ if just handoff issue |

Rule of thumb: if patch costs > 30% of remaining project budget → rewind cheaper.

---

## 2. Rewind Request Protocol

```
1. Phase N+ driver writes phase_rewind_request:

   _state.json.rewind_requests[] += {
     "request_id": "rw-...",
     "current_phase": "P5",
     "rewind_to": "P3",
     "reason": "state machine has unreachable states discovered during P5 risk analysis",
     "evidence": ["link to P3 doc section X", "P5 analysis line Y"],
     "wasted_phases": ["P3", "P4"],
     "wasted_cost_usd": 0.45,
     "estimated_redo_cost_usd": 0.30,
     "requested_by": "R-PM",
     "requested_at": "2026-..."
   }

2. Charter owner approves OR rejects within 24h
   - Approve: ADR mandatory + commit
   - Reject: justify (continue forward despite known issue) → ADR + risk acceptance

3. If approved:
   a. Snapshot current state:
      _archive/{run_id}/pre-rewind-{timestamp}/
   b. Reset _state.json.lifecycle.current_phase = P3
   c. Append to _state.json.phase_history: { phase: "P3-redo", reason: "rewind from P5" }
   d. Re-dispatch P3 with critique injected:
      "Previous P3 output (link) failed at P5 because: X. Address by Y."
```

---

## 3. Cost Accounting

```yaml
project_cost_breakdown:
  forward_progress: 1.20 USD       # successful phases
  wasted_on_rewind: 0.45 USD       # P3+P4 redone
  rewind_redo_cost: 0.30 USD       # new P3+P4 attempt
  total: 1.95 USD
  
  rewind_overhead_pct: 38%         # wasted / total
```

**Hard rule**: cumulative `wasted_on_rewind` > 30% of project budget → halt project + retro. Continuing past 30% = throwing good money after bad.

---

## 4. State Snapshot Format

`_archive/{run_id}/pre-rewind-{timestamp}/`:
```
├── _meta.json (frozen at rewind)
├── _state.json (frozen)
├── 03-architecture.md (the failed version)
├── 04-design/ (the cascaded output)
├── harness/manifest.yaml (frozen)
├── harness/permanent-fixes.md (frozen)
└── REWIND-NOTE.md (why this snapshot exists)
```

Snapshot is **read-only** — for audit + retro learning.

---

## 5. Re-Dispatch Mechanics

After rewind approval, re-dispatch P3 (or whichever phase):

```
W04 §1 — 6 pre-checks include rewind context:
  Q5 modified: "Human review slot ready for redo + critique?"
  Q6 modified: "Harness manifest update needed?" (likely yes)

W04 §3 user message MUST include:
  ## Context: Phase rewind
  Previous attempt: link to _archive/...
  Why failed: ...
  Critique injected: ...
  Budget for redo: $X (per accounting)
  
W04 §7 eval increased rigor:
  Layer 1+2+3 all run as normal, BUT
  Layer 2 LLM judge MUST verify the previous failure mode is addressed
  (e.g., "does new architecture have all reachable states?")
```

---

## 6. Rewind in Multi-Path Context

If project paused due to rewind + other paths active:
- Rewinding project priority bumps to "in delivery rewind" — between priority 1 and 2 in R-LCY-06 table
- Other paths NOT auto-preempted (unless resource conflict)
- Rewind is contained to single project

---

## 7. Failure Modes

| Symptom | Action |
|---|---|
| Rewind without ADR | Block commit, force ADR creation |
| Snapshot not created | Block re-dispatch — must have audit trail |
| Multiple rewinds same project (3+) | Halt project — likely scoping issue, escalate CEO |
| Rewind to phase before P3 (P0/P1 redo) | Likely better to kill + restart project — discuss CEO |
| Rewind triggered by client objection (not internal flaw) | Different — handle via SCR per business-strategy/13 §5 (change management) |

---

## 8. Cross-References

- Orchestration rule: [`@../../../../_shared/rules/100-orchestration-rules.md`](../../../../_shared/rules/100-orchestration-rules.md) §R-ORC-07
- Execution + retry budget: [`@../../../../_shared/rules/30-execution-rules.md`](../../../../_shared/rules/30-execution-rules.md)
- Versioning + project pin (impacts after rewind): [`@../../../../_shared/standards/versioning-pinning.md`](../../../../_shared/standards/versioning-pinning.md)
- ADR mandatory: [`@../../../../_shared/rules/00-MASTER-RULES.md`](../../../../_shared/rules/00-MASTER-RULES.md) §R-MAS-14
- Change management (client-driven): [`@../../../../business-strategy/13-product-delivery-process.md`](../../../../business-strategy/13-product-delivery-process.md) §5

---
*W12 v1.0 — Adopted 2026-04-27.*
