# `harness/` — Per-Project Agent Runtime Configuration

> Mandatory subfolder per **R-HRN-05**. Every project MUST instantiate this skeleton at P0 Intake. Engine refuses agent dispatch if missing.

## Files

| File | Purpose | Owner | Created at |
|---|---|---|---|
| `manifest.yaml` | Control loop config, tool whitelist, memory tier sizes, harness profile (L0/L1/L2) | R-AE (P3) | P0 skeleton, P3 fill |
| `guardrails.yaml` | Approval gate matrix, denied actions, human-in-loop triggers | R-AE + COO (P5) | P0 skeleton, P5 lock |
| `permanent-fixes.md` | Append-only log of failures → prescriptive rules added (per R-HRN-06) | All agents (write), CTO (review monthly) | P0 empty |
| `memory/` | Long-term tier per R-HRN-04 (transferable patterns only, R-QAL-10) | R-σ curates | P0 empty |
| `traces/` | Control loop traces per R-HRN-02 + observability triple per R-HRN-12 | Engine writes | Auto |

## Lifecycle

- **P0 Intake**: copy this skeleton → `projects/{id}/harness/`. Set profile in `_meta.json.harness_profile` (L0/L1/L2 per R-HRN-01).
- **P3 Architecture**: R-AE fills `manifest.yaml` (control loop, allowed_transitions, tool whitelist).
- **P5 Planning**: R-DO + COO sign `guardrails.yaml` (approval matrix locked before P6 Dev).
- **P6–P9**: agents read manifest + guardrails on every dispatch (RULES-PREAMBLE auto-injects path).
- **P9 Retro**: review `permanent-fixes.md` — promote rules lặp ở 3+ project lên `_shared/rules/` (R-MAS-05 + R-QAL-06).

## Profile-driven mandatory components (R-HRN-01)

| Profile | manifest.yaml | guardrails.yaml | permanent-fixes.md | memory/ | traces/ |
|---|---|---|---|---|---|
| L0 Sandbox | minimal (loop + tools + cost) | optional | optional | optional | basic |
| L1 Standard | full | full | mandatory | mandatory | full |
| L2 Critical | full + sandbox spec | full + 2nd approver | mandatory | mandatory | full + 90-day retention |

## Cross-References

- Rules: [`@../../../rules/80-harness-rules.md`](../../../rules/80-harness-rules.md) (canonical R-HRN spec)
- Project meta: [`@../_meta.json`](../_meta.json) (profile field)
- Skill cards: [`@../../../.agents/tier-2-engineering/R-AE-agent-engineer.md`](../../../.agents/tier-2-engineering/R-AE-agent-engineer.md) (fills manifest)

*Template v1.0 — 2026-04-27*
