# W10 — Cross-Path Priority + Resource Coordination

> When ≥2 paths active concurrently (per R-LCY-06 + R-LCY-07 + R-ORC-09). Capacity rule existed; mechanism didn't.

**Trigger**: Whenever Engine receives dispatch request with ≥1 path already active.
**Owner**: COO (or R-Dispatcher in Phase 2+).

---

## 1. Active Path Ledger

`projects/_ops/active-paths.json` — single source of truth.

```json
{
  "active_paths": [
    {
      "path": "A",
      "project_id": "P-202604-003",
      "phase": "P5",
      "priority": 1,
      "resources_locked": ["R-PM", "R-DO", "approval-slot-cto"],
      "blocking": [],
      "started_at": "2026-04-15T..."
    },
    {
      "path": "D",
      "research_id": "I-MMO-v2-refresh",
      "priority": 4,
      "resources_locked": ["R-alpha"],
      "blocking": ["P-202604-003 P5"],
      "started_at": "2026-04-26T..."
    }
  ]
}
```

Engine reads + writes atomically (file lock).

---

## 2. Priority Table (R-LCY-06 reference)

| Priority | Path / state | Reason |
|---|---|---|
| 1 | Path A in delivery (P5+) | Revenue + reputation |
| 2 | Path E (Sev 0/1 incident) | Production reliability |
| 3 | Path A in proposal (P0–P4) | Revenue at risk |
| 4 | Path D blocking active project | Unblocks #1 or #3 |
| 5 | Path B (internal product) | Strategic discretionary |
| 6 | Path C (content) | Marketing flex |

---

## 3. Resource Acquisition Protocol

When dispatch requests resource (agent slot, LLM quota, vendor service):

```
1. Query active-paths.json for current locks
2. Check if requested resource is locked
3. If free: acquire + log
4. If locked by same priority: queue (FIFO)
5. If locked by lower priority: PREEMPT
   - Preempted path saves checkpoint (per R-HRN-02)
   - Preempted path moves to "paused" state
   - Notify owner of preemption + ETA reschedule
6. If higher priority: WAIT (return position in queue)
7. If deadlock (A waits for B, B waits for A): ABORT, escalate COO
```

---

## 4. Preemption Mechanics

When higher-priority path preempts:

| Step | Action |
|---|---|
| 1 | Engine sends `preempt_signal` to active agent |
| 2 | Agent checkpoints state (R-HRN-02) — graceful within 30s |
| 3 | If agent doesn't respond in 30s → force kill (sub-optimal but prevents block) |
| 4 | Resource released to higher priority |
| 5 | Preempted state in `paused` — resumable from checkpoint |
| 6 | When higher priority done → preempted path auto-resume OR notify owner to re-dispatch |

**Preemption cost**: counted as wasted_tokens, accounted to higher-priority path's project budget (cost of expediting).

---

## 5. Daily Reconciliation

End of each day, COO reviews:
- Preemptions count
- Wasted tokens from preemption
- Paths still paused > 24h (red flag — not unblocked)
- Resource bottleneck identified (e.g., R-α is always locked = capacity request)

Output: `projects/_ops/daily-coordination-{YYYY-MM-DD}.md`.

---

## 6. Capacity Allocation (per phase per R-LCY-07)

```yaml
capacity_phase_1:                  # M1-M3 bootstrap
  max_concurrent_path_a: 2
  max_concurrent_path_b: 1
  max_concurrent_path_d: 1          # often blocking
  daily_llm_api_cap_usd: 50
  weekly_human_review_hours: 20

capacity_phase_2:                  # M4-M6
  max_concurrent_path_a: 4
  max_concurrent_path_b: 2
  max_concurrent_path_d: 2
  daily_llm_api_cap_usd: 100
  weekly_human_review_hours: 40

capacity_phase_3:                  # M6+
  max_concurrent_path_a: 10
  max_concurrent_path_b: 4
  max_concurrent_path_d: 3
  daily_llm_api_cap_usd: 250
  weekly_human_review_hours: 80
```

Engine reject NEW path dispatch if active count >= max for current phase.

---

## 7. Anti-Patterns

- ❌ "Just run them all in parallel" — leads to resource starvation
- ❌ "Let CEO ad-hoc decide each time" — doesn't scale
- ❌ Skip preemption checkpoint to save 30s — corrupts state
- ❌ Silently demote priority because "this client is annoying"
- ❌ Path B + C scheduled when Path A still in P5 — content can wait

---

## 8. Cross-References

- Lifecycle (priority + resource): [`@../../../../_shared/rules/90-lifecycle-rules.md`](../../../../_shared/rules/90-lifecycle-rules.md) §R-LCY-06, §R-LCY-07
- Orchestration (multi-path coord): [`@../../../../_shared/rules/100-orchestration-rules.md`](../../../../_shared/rules/100-orchestration-rules.md) §R-ORC-05, §R-ORC-09
- Operating manual paths: [`@../../../../00-OPERATING-MANUAL.md`](../../../../00-OPERATING-MANUAL.md) §2

---
*W10 v1.0 — Adopted 2026-04-27.*
