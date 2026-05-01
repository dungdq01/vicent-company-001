# W11 — Knowledge Review (K-Review Gate)

> Operationalize `knowledge-curation.md`. Every write to `knowledge/staging/` triggers review queue. Production `knowledge/data/` only after curator + CEO sign.

**Trigger**: agent writes to `knowledge/staging/`.
**Owner**: R-σ (curator) + CEO (final sign).
**Cadence**: triage daily, batch review weekly.

---

## 1. Trigger Sources

| Source | Frequency | Volume |
|---|---|---|
| β fresh research (Path D) | Per new industry / re-research | 1-2 entries / week |
| Project memory promotion (P9 retro candidates) | Per project close | 2-5 entries / project |
| R-LLMOps weekly insight | Weekly | 0-2 entries |
| External dependency drift remediation | Ad-hoc | 0-1 entries / month |

---

## 2. Daily Triage (15 min, R-σ)

R-σ:
1. Check `knowledge/staging/_review-queue.yaml` for new entries
2. For each: verify metadata complete (source, citations count, cost, submitted_at)
3. Tag urgency:
   - 🔴 Blocking active project (Path D triggered) → review within 48h
   - 🟡 Standard new entry → review within 5 business days
   - 🟢 Optional / proactive → batch in monthly review

---

## 3. Weekly Review Batch (1.5h, CEO + R-σ)

Wednesdays.

### Per entry checklist (per `knowledge-curation.md §2`)

```yaml
review_checklist:
  - citation_2nd_source_verify:        # ≥3 random citations URL-checked
      sample_size: 3
      tool: "_shared/eval/citation-verify.sh"
      threshold: 100% pass
  - pii_leak_scan:
      pattern_check: ["phone", "email", "national_id", "name+address"]
      tool: "_shared/eval/pii-scan.sh"
  - conflict_with_existing_data:
      action: "if conflict → flag for split/merge per R-LCY-04"
  - voice_structure:
      compare_against: "knowledge/data/baselines/B01/" (canonical structure)
  - sunset_criteria_explicit:
      required: true
      example: "re-research if claude version changes OR > 6mo old"
```

### Decision

| Decision | Action |
|---|---|
| ✅ Approved | `mv staging/{path} data/{path}` + commit + announce `#decisions` + bump VERSION.txt |
| ⚠️ Needs revision | Note in queue + return to source agent with critique |
| ❌ Rejected | Keep in `staging/_rejected/{path}` (audit trail) + log to failure-modes |

---

## 4. Promotion Side-Effects

When `staging/` → `data/`:

```yaml
side_effects:
  1. update knowledge/docs/INDEX.md (auto-generated)
  2. bump VERSION.txt for affected node
  3. notify projects with version_pin to old version
     - per `versioning-pinning.md §4`
  4. trigger re-eval of golden sets that referenced node
  5. if structural change (new sub-node, split, merge) → cross-project notify
  6. announce to #decisions channel
```

---

## 5. Quarantine + Demote Workflow

When data/ entry found wrong (post-promotion):

| Step | Action |
|---|---|
| 1 | Move `data/{path}` → `_quarantine/{path}-{date}` immediately |
| 2 | Add entry to `_quarantine/_quarantine-log.md` (who flagged, why, evidence) |
| 3 | Update active project version_pin references to mark quarantined |
| 4 | Within 30 days: fix + return to staging for re-review OR archive permanently |
| 5 | If fix: re-promote through full K-review |
| 6 | If archive: ADR + sunset entry + update INDEX.md |

---

## 6. Monthly Hygiene (1h, R-σ)

End of each month:
1. Verify all data/ citations still resolve (run `citation-verify.sh` over corpus)
2. Sunset stale entries (per R-LCY-03)
3. Memory hygiene per R-QAL-10 (≤ 100 baseline / ≤ 50 industry)
4. Promote candidates from `_review-queue.yaml status: needs-revision` if author re-submitted

---

## 7. Quarterly Structural Review (4h, CEO + R-σ + R-α)

1. Identify split candidates (baseline > 200 entries) per R-LCY-04
2. Identify merge candidates (baselines overlapping > 40%)
3. Identify archive candidates (industry < 5 entries after 12 mo)
4. ADR for each structural change
5. Execute changes + cross-project notify

---

## 8. Curator Backlog SLA

If `_review-queue.yaml.pending > 10` for > 7 days → block source agents (β cannot research more, project memory promotion paused) until backlog cleared. Forces curator capacity discipline.

---

## 9. Cross-References

- Curation standard: [`@../../../../_shared/standards/knowledge-curation.md`](../../../../_shared/standards/knowledge-curation.md)
- Lifecycle rules (sunset, refactor): [`@../../../../_shared/rules/90-lifecycle-rules.md`](../../../../_shared/rules/90-lifecycle-rules.md)
- Versioning + project pin: [`@../../../../_shared/standards/versioning-pinning.md`](../../../../_shared/standards/versioning-pinning.md)
- Memory hygiene: [`@../../../../_shared/rules/70-quality-rules.md`](../../../../_shared/rules/70-quality-rules.md) §R-QAL-10
- Path D pipeline: [`@../pipeline/PATH-D-RESEARCH.md`](../pipeline/PATH-D-RESEARCH.md)

---
*W11 v1.0 — Adopted 2026-04-27.*
