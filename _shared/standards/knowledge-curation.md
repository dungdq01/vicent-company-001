---
file: knowledge-curation
version: v1.0
last_updated: 2026-04-27
owner: CEO + R-σ
status: production
---

# Knowledge Curation Standard — Staging · Review · Privacy

> Knowledge layer is shared global. 1 sai = mọi project tương lai pollute. File này define gate giữa "agent write" và "production knowledge". Closes lỗ hổng A1 (no K-review), A2 (demote 1 chiều), E2 (real data privacy in eval).

---

## 1. Three-Tier Knowledge Namespace

```
knowledge/
├── staging/           ← agent writes here first (β fresh research, project memory promotion candidates)
├── data/              ← production — read by all agents
│   ├── baselines/
│   └── industries/
├── _quarantine/       ← demoted artifacts, awaiting fix or sunset (R-LCY-01)
├── _archive/          ← historical versions, reference only
└── docs/memory/       ← cross-project learnings — also gated through staging
```

**Rule**: agent writes go to `staging/` ONLY. Production `data/` is **read-only** to agents. Promotion = human signed.

---

## 2. K-Review Gate

Every write to `staging/` triggers review queue entry:

```yaml
# staging/_review-queue.yaml (append-only)
- id: kr-{YYYYMMDD}-{nnn}
  source: "R-β fresh research" | "P9 project retro" | "R-LLMOps weekly"
  artifact_path: "staging/industries/I-MMO/L1-skeleton.md"
  triggering_project: P-202604-003
  size_words: 3210
  citations_count: 16
  cost_usd: 0.91
  submitted_at: 2026-04-29T15:42Z
  status: pending  # pending | approved | rejected | needs-revision
  reviewer: ""     # CEO / R-σ / domain expert
  review_notes: ""
```

**Review SLA**: pending → reviewed within **5 business days**. Beyond SLA → block source agent (β cannot research more until backlog cleared).

**Reviewer checklist**:
1. Citation 2nd-source verify (≥ 3 random citations: URL exists, content matches claim)
2. No PII / client-confidential leaked into knowledge (cross-project pollution risk)
3. Conflicts with existing `data/`: flag for split/merge per R-LCY-04
4. Voice + structure match canonical baselines/industries format
5. Sunset criteria explicit (when does this become stale?)

**Decision**:
- `approved` → move staging → data/ + commit + announce in `#decisions`
- `needs-revision` → return to source agent with critique
- `rejected` → keep in staging marked rejected (audit trail) + log failure mode

---

## 3. Citation Verification Protocol

R-MAS-06 anti-hallucination requires citation. K-review enforces:

| Citation type | Verification |
|---|---|
| Public URL | curl + grep (or fetch + LLM check) — content matches claim |
| Internal `@path` | Path exists, line range contains statement |
| Industry report (paywalled) | Reviewer access OR rejected |
| Personal communication / interview | Date + signer + reproducible context — else rejected |
| LLM-generated derivation | NEVER acceptable as standalone — must trace to primary source |

Tool: `_shared/eval/citation-verify.sh` (script that hits each URL + samples). Run automatically on staging entry.

---

## 4. Real Data in Eval Golden Sets

Per R-QAL-03 golden sets need real distribution. Privacy gate:

| Data type | Allowed in golden set? | Handling |
|---|---|---|
| Synthetic generated | ✅ Always | Document generation seed + method |
| Public domain (web scraped, OK by ToS) | ✅ | Cite source |
| Client real data (de-identified) | ⚠️ With DPA + client opt-in only | PII redacted via `_shared/standards/pii-redaction.md` |
| Client real data (raw with PII) | ❌ NEVER | Use synthetic stand-in |
| Cross-project data mixing | ❌ NEVER | Per-project golden sets only; promote pattern, not data |

DPA template: append to SOW (per `02-sow.md`) — explicit "client real data MAY be used in studio's eval golden set after de-identification".

---

## 5. Demote / Quarantine Path

When data/ entry found wrong:
1. Move to `_quarantine/{original-path}-{date}` immediately (don't wait for review)
2. Create entry `_quarantine/_quarantine-log.md`: who flagged, why, evidence
3. Update all `_meta.json.knowledge_match.memory_paths[]` references to mark quarantined
4. Active project pinned to wrong version → choose:
   - Continue with pinned (with caveat documented)
   - Trigger phase rewind (R-ORC-07) if structurally affected
5. Within 30 days: fix + return to data/ OR archive permanently

---

## 6. Knowledge Curator Role

R-σ owns curation workflow. Cadence:
- Daily: triage staging queue, tag for review
- Weekly: review batch with CEO sign for production promotion
- Monthly: hygiene — verify citations still resolve, sunset stale (per R-LCY-03)
- Quarterly: structural — split/merge candidates per R-LCY-04

Curator is the **single throat to choke** for knowledge quality.

---

## 7. Studio vs Client Knowledge Boundary

**Hard separation** (closes lỗ hổng D14):

```
knowledge/                  ← client-facing baselines + industries (shipped material)
studio/wisdom/              ← studio internal (CEO opinions, ICP insight, sales playbook supplement)
business-strategy/          ← strategic decisions (existing)
```

| Boundary rule | Why |
|---|---|
| Studio internal NEVER referenced in client deliverables | Brand bias, possible conflict of interest |
| Client baseline NEVER tinged with studio strategic opinion | Knowledge integrity |
| Crossing requires ADR | Boundary breach is intentional, not accidental |

`studio/wisdom/` schema mirror `knowledge/` but read-only to client-facing agents (R-α, R-β, R-σ in client delivery context). Engine enforce via context loader whitelist.

---

## 8. Cross-References

- Lifecycle rules (demote, sunset, refactor): [`@../rules/90-lifecycle-rules.md`](../rules/90-lifecycle-rules.md)
- Versioning + project pin: [`@./versioning-pinning.md`](versioning-pinning.md)
- Memory hygiene (quarterly review): [`@./memory-hygiene.md`](memory-hygiene.md)
- Anti-hallucination: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-06
- K-review workflow: [`@../../experience/workspace/docs/workflows/W11-knowledge-review.md`](../../experience/workspace/docs/workflows/W11-knowledge-review.md)

---
*v1.0 — Adopted 2026-04-27. Owner: CEO + R-σ.*
