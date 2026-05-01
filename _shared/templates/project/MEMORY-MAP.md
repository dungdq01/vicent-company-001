# {{PROJECT_ID}} — Memory Map

<!-- {{PROJECT_ID}}: replace at scaffold time. Engine bootstrap script (deferred to engine MVP) will auto-substitute. Manual fill OK if scaffolding by hand from `_shared/templates/project/`. -->

> Single page mapping for all storage locations within this project. Per-project isolation = framework wrapper philosophy. Each location has explicit lifetime + writer + reader + canonical spec.

---

## 9 Storage Locations

| Path | Lifetime | What goes here | Writer | Reader | Spec |
|------|----------|----------------|--------|--------|------|
| `_meta.json` | project | identity, ICP, tier, profile, version pin, knowledge match, skill/phase overrides, voice contract | P0 once | every agent (every dispatch) | E1 schema + `_shared/standards/versioning-pinning.md` |
| `_state.json` | project | phase + gates + blockers + cost burn + deliverables index | Engine | every agent | W04 §9 + `_shared/rules/30-execution-rules.md` |
| `.memory/working/{run_id}/` | per-run TTL 24h | scratchpad multi-step, retry feedback | agent self | next step in chain | W04 §2.4 + `_shared/standards/memory-runtime.md` §6 |
| `.memory/shared/{phase}/` | per-phase | parallel agent pool (P4 a/b/c/d collab) | parallel agents | integration reviewer | W04 §11 |
| `.memory/episodic-buffer/` | per-run | retry feedback + candidates-for-retro | agent self | driver review at commit | `memory-runtime.md` §7 |
| `harness/memory/{key}.md` | cross-session, project lifetime | transferable patterns from prior runs (frequent_questions, vn_slang_glossary, etc.) | post-retro promotion | future agents in this project | R-HRN-04 |
| `harness/permanent-fixes.md` | permanent project-only (append-only) | failure → rule log; rules auto-injected as `local_rules[]` | all agents on failure | RULES-PREAMBLE auto-load | R-HRN-06 |
| `.eval/` | permanent project-only | project-specific golden cases (real-data anchored) | author at P3+ as eval emerges | R-eval gate every dispatch | feedback_eval_layering.md + R-QAL-03 |
| `decisions/ADR-*.md` | permanent (audit trail) | architectural decisions specific to this project | author + authority sign | everyone forever | `_shared/standards/decision-log-index.md` |

---

## Engine runtime artifacts (NOT here — separate location)

The following are written by Engine to `projects/_ops/` (not project folder). Cross-project ledgers, NOT per-project memory:

- `projects/_ops/active-paths.json` — which paths active across all projects
- `projects/_ops/dispatch-log.jsonl` — append-only audit trail
- `projects/_ops/resource-lock.json` — concurrency state

Engine also maintains `.runs/{run_id}/` archive within this project for 30 days (trace + cost + handoff). After 30d → archive or summarize.

---

## Future engine artifact (not yet implemented)

When engine MVP builds (deferred per IMPORTANT set), it will create:

- `.context-cache/phase-{N}-bundle.md` — precomputed prompt bundles per phase (per A2 optimization). Auto-invalidated on skill/phase/_meta version bump. **Engine artifact, NOT config.**

→ Add this row when engine MVP ships.

---

## Cross-Project Boundary (R-MAS-16)

This project's memory is **isolated**. Per `_shared/standards/boundaries.md` §4 + R-MAS-16:
- Other projects' agents **CANNOT** read this folder
- This project's agents **CANNOT** read other projects' folders
- Cross-project knowledge promotion ONLY via `knowledge/staging/` → K-review (W11) → `knowledge/data/`
- Cross-project rule promotion ONLY via permanent-fixes promote-candidate → W08 framework retro

---

## Substitution checklist (P0 setup)

When P0 scaffolds this project from template:
- [ ] Replace `{{PROJECT_ID}}` everywhere in this file
- [ ] Verify `_meta.json` filled (id, client, profile, version pin)
- [ ] Verify `harness/manifest.yaml` profile set
- [ ] Init `_state.json.lifecycle.current_phase = "P0"`
- [ ] Confirm folder structure matches spec above

---

## Cross-References

- Project template: [`@./README.md`](README.md)
- Schema spec: [`@./_meta.json`](_meta.json)
- Harness spec: [`@./harness/README.md`](harness/README.md)
- Rules: [`@../../rules/80-harness-rules.md`](../../rules/80-harness-rules.md) (R-HRN-04, R-HRN-05, R-HRN-06)
- Boundaries: [`@../../standards/boundaries.md`](../../standards/boundaries.md) §4
- Versioning: [`@../../standards/versioning-pinning.md`](../../standards/versioning-pinning.md)
- Memory runtime: [`@../../standards/memory-runtime.md`](../../standards/memory-runtime.md)
- Dispatch loader: [`@../../../experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md`](../../../experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md) §2

---
*Template v1.0 — 2026-04-27. Per-project copy + substitute {{PROJECT_ID}}. Single-page reference for storage location semantics.*
