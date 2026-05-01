# Path D — Knowledge Re-Research

> When to update knowledge (baseline / industry / sub-node). Closes lỗ hổng B5 + connects to K-review gate (`knowledge-curation.md`).

**Trigger types**:
1. Phase priority requires baseline depth Lv (e.g., M2 needs B05 L3)
2. New industry requested by client (β fresh research, current ad-hoc — formalized here)
3. Old baseline outdated (model version change, new SOTA)
4. Drift signal from R-LLMOps weekly review
5. Vendor watch flag (per `external-dependencies.md`)

**Owner**: CEO (LLMOps + ML validation) + R-σ (curation).
**Authority**: CEO sign for promotion to production.
**Priority**: 4 if blocking active client project; 5 if proactive maintenance (per R-LCY-06).

---

## Phase D0 — Trigger Classification (10 min)

| Type | Path | Cost budget |
|---|---|---|
| New industry (client project gate) | β fresh research | $0.50–1.50 |
| Re-research existing baseline (refresh) | β + γ pass | $0.30–1.00 |
| Sub-node deep research (specific use case) | β focused | $0.20–0.60 |
| Vendor drift remediation | R-LLMOps + R-α update | $0.20–0.50 |
| Scheduled audit (sunset / structural) | R-σ + CEO | mostly human time |

---

## Phase D1 — Scope Brief (15 min)

CEO writes:
- Trigger source + urgency
- Specific gap to fill (NOT "research industry X" — too broad)
- Success criteria (what level of depth: skeleton / L1 / L2 / L3)
- Time budget + cost cap
- Cite-back requirements (≥ N citations from primary source)

**Output**: `_shared/decisions/D-research-{slug}/01-brief.md`.

---

## Phase D2 — Engine Research (30–90 min compute)

R-α / R-β / R-γ / R-σ depending on type:

| Agent | Role |
|---|---|
| R-α | SOTA literature scan |
| R-β | Tech stack survey + vendor landscape |
| R-γ | Feasibility + ML model recommendations |
| R-σ | Vietnamese translation + structure consolidation |

**Tool budget per harness manifest**:
- web_search ≤ 15 calls
- file_write ≤ 6 (skeleton + sub-nodes + citations)

**Output**: writes to `knowledge/staging/` (NOT directly to data/).

---

## Phase D3 — K-Review (per `knowledge-curation.md` §2)

R-σ (curator) + CEO sign:
1. Citation 2nd-source verify (≥ 3 random)
2. PII / client-confidential leak check
3. Conflicts with existing data/ → split/merge per R-LCY-04
4. Voice + structure match canonical
5. Sunset criteria explicit

**Decision**:
- approved → promote staging → data/ + commit
- needs-revision → return to R-α/β/γ with critique
- rejected → keep in staging marked rejected (audit trail)

**SLA**: pending → reviewed within 5 business days.

---

## Phase D4 — Promote + Cross-Project Notify (30 min)

When approved:
1. Move `staging/` → `data/`
2. Bump VERSION.txt of affected node
3. Update `knowledge/docs/INDEX.md` (auto-generated)
4. Identify projects with `version_pin` for old version → notify owner (per `versioning-pinning.md` §4)
5. Re-eval golden sets that referenced old version

**Output**: announcement in `#decisions` + CHANGELOG entry.

---

## Phase D5 — Re-Eval (when version-triggered)

Per `versioning-pinning.md §4`:
- Re-run golden sets with new version
- Compare scores → regression > 0.3 = block promotion (revert)
- Catalogue projects pinned old version as "upgrade candidate"

---

## Phase D6 — Project Unblock (when D triggered by Path A wait)

If Path A project was blocked waiting for Path D:
1. Notify Path A driver
2. Allow project to either continue with old (pinned) or upgrade
3. If upgrade: trigger phase rewind per R-ORC-07 if structural impact

---

## Cadence (proactive maintenance)

| Layer | Cadence |
|---|---|
| Re-research existing baseline | Older than 6 months OR client-triggered |
| Industry quarterly audit | Top-3 industries by volume served |
| Sub-node review | When industry has 5+ projects served |
| Post-incident re-research | If hallucination/error traced to baseline |

---

<!-- @harness-checkpoint -->
## Harness Profile

Path D profile = **L1 Standard** (knowledge layer is global → drift risk + audit trail mandatory).

Components:
- Trace all research sessions to `_shared/decisions/D-research-{slug}/traces/`
- Cost cap per type (D0 table)
- Approval gate: K-review = mandatory human gate (no auto-promote regardless of eval)
- Permanent-fix log: per research session, capture failure modes (e.g., "β cited paywalled paper without access" → rule)

---

## Cross-References

- Knowledge curation (K-review): [`@../../../../_shared/standards/knowledge-curation.md`](../../../../_shared/standards/knowledge-curation.md)
- Versioning + project pin: [`@../../../../_shared/standards/versioning-pinning.md`](../../../../_shared/standards/versioning-pinning.md)
- Lifecycle (refactor split/merge): [`@../../../../_shared/rules/90-lifecycle-rules.md`](../../../../_shared/rules/90-lifecycle-rules.md) §R-LCY-04
- External deps: [`@../../../../_shared/standards/external-dependencies.md`](../../../../_shared/standards/external-dependencies.md)
- Operating manual: [`@../../../../00-OPERATING-MANUAL.md`](../../../../00-OPERATING-MANUAL.md) §6
- K-review workflow: [`@../workflows/W11-knowledge-review.md`](../workflows/W11-knowledge-review.md)

---
*Pipeline Path D v1.0 — Adopted 2026-04-27.*
