# knowledge/staging/ — Knowledge Review Queue

> Per `_shared/standards/knowledge-curation.md` §1 + W11. **Agent writes go here FIRST**, not directly to `knowledge/data/`.

**Owner**: R-σ (curator) + CEO (final sign).

---

## Purpose

3-tier knowledge namespace:
```
knowledge/
├── staging/          ← agent writes here (β fresh, project memory promotion)
├── data/             ← production — read by all client-delivery agents
├── _quarantine/      ← demoted artifacts awaiting fix or sunset
└── _archive/         ← historical versions, reference only
```

Agent writes to `staging/` ONLY. Promotion to `data/` requires K-review (W11).

---

## Files

| File | Purpose |
|---|---|
| `README.md` | (this) |
| `_review-queue.yaml` | Append-only review queue (every staging entry registered here) |
| `_rejected/` | Rejected entries (audit trail, NOT deleted — failure mode learning) |

Agent-written drafts live in mirror structure of `data/`:
```
staging/baselines/B0X/...
staging/industries/I-XX/...
staging/docs/memory/...
```

---

## Workflow (W11 summary)

1. Agent writes to `staging/{path}` + appends entry to `_review-queue.yaml`
2. R-σ daily triage: tag urgency 🔴/🟡/🟢
3. CEO + R-σ weekly batch review (Wednesdays)
4. Per entry: citation verify + PII scan + conflict check + voice check
5. Decision: approved → promote `data/`; needs-revision → return; rejected → `_rejected/`
6. Backlog SLA: pending > 10 for 7 days = block source agents

---

## Cross-References

- Curation standard: [`@../../_shared/standards/knowledge-curation.md`](../../_shared/standards/knowledge-curation.md)
- K-review workflow: [`@../../experience/workspace/docs/workflows/W11-knowledge-review.md`](../../experience/workspace/docs/workflows/W11-knowledge-review.md)
- Path D pipeline: [`@../../experience/workspace/docs/pipeline/PATH-D-RESEARCH.md`](../../experience/workspace/docs/pipeline/PATH-D-RESEARCH.md)

---
*v1.0 — created 2026-04-27.*
