# projects/_ops/ — Studio-Level Operations Ledger

> Per R-LCY-07 (resource lock) + R-ORC-05 (acquisition) + R-ORC-09 (multi-path) + W10 (cross-path priority). **Single source of truth for cross-project state**.

**Owner**: COO (or R-Dispatcher in Phase 2+).

---

## Files

| File | Purpose | Update freq |
|---|---|---|
| `README.md` | (this) | rare |
| `active-paths.json` | Currently active paths (A/B/C/D) per project — single ledger | per dispatch event |
| `resource-lock.json` | Per-resource lock state (agent slot, LLM quota, vendor service) | per dispatch event |
| `dispatch-log.jsonl` | Append-only log of every path dispatch | per dispatch |
| `daily-coordination/` | Daily summaries by COO | daily EOD |
| `framework-action-items.md` | Framework retro action items + owner + ETA | quarterly + ad-hoc |
| `week-{YYYY-WW}/plan.md` | Weekly active project plan | weekly Monday |

---

## active-paths.json schema

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
      "started_at": "2026-04-15T10:00:00Z",
      "owner": "P3"
    }
  ]
}
```

Schema spec in W10 §1.

---

## resource-lock.json schema

```json
{
  "locks": {
    "R-alpha": {
      "held_by": "P-202604-003",
      "acquired_at": "2026-04-15T14:00:00Z",
      "duration_estimate_min": 30,
      "queue": []
    }
  },
  "daily_quota": {
    "anthropic_api_usd": {
      "cap": 50,
      "consumed_today": 12.34,
      "by_project": {"P-202604-003": 12.34}
    }
  }
}
```

---

## dispatch-log.jsonl schema (append-only)

```jsonl
{"ts":"2026-04-15T14:00:00Z","event":"dispatch","project":"P-202604-003","path":"A","phase":"P5","agent":"R-PM","cost_usd":0.10,"trace_id":"r-..."}
{"ts":"2026-04-15T14:30:00Z","event":"complete","trace_id":"r-...","cost_actual":0.08,"eval_score":8.2}
```

R-LLMOps reads daily for cost trend. R-SRE reads for incident correlation.

### ⚠️ PII redaction at write time (Tier S #6 enforce)

Per `_shared/standards/pii-redaction.md` §5.5 — dispatch-log writer MUST apply redaction BEFORE append:
- `client_email` / `client_phone` → SHA-256 hash
- `client_name` → first-initial only ("A. Hùng" not full name)
- `brief_excerpt` → truncate ≤ 200 chars + hash for dedup
- 0 plaintext customer-end-user PII

R-DataOps weekly audit: sample 100 entries → 0 PII detected. Daily cron `pii-scan.sh projects/_ops/dispatch-log.jsonl`.

Same rule applies to `active-paths.json` + `resource-lock.json`.

---

## Cross-References

- Lifecycle (priority + resource lock): [`@../../_shared/rules/90-lifecycle-rules.md`](../../_shared/rules/90-lifecycle-rules.md) §R-LCY-06, §R-LCY-07
- Orchestration (acquisition protocol): [`@../../_shared/rules/100-orchestration-rules.md`](../../_shared/rules/100-orchestration-rules.md) §R-ORC-05
- Cross-path workflow: [`@../../experience/workspace/docs/workflows/W10-cross-path-priority.md`](../../experience/workspace/docs/workflows/W10-cross-path-priority.md)

---
*v1.0 — created 2026-04-27.*
