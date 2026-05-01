---
file: 90-lifecycle-rules
version: v1.0
last_updated: 2026-04-27
owner: CTO
status: production
---

# Lifecycle Rules — Promote · Demote · Sunset · Drift

> Memory + skill + knowledge promotion path đã có (R-MAS-05, R-QAL-07). Chiều ngược lại (demote, unlearn, sunset) **chưa có**. File này close 360° loop. Cũng cover external dependency drift + multi-path priority.

---

## R-LCY-01 — Demote Pathway Mandatory

Mọi promoted artifact (rule, skill version, knowledge node) MUST có demote condition:

| Artifact | Demote trigger | Action |
|---|---|---|
| Rule promoted to `_shared/rules/` | Wrong in 2+ projects OR superseded by new evidence | Move to `_shared/rules/_archive/` + reference replacement rule |
| Skill card prompt v1.x | Eval regression vs v1.0 OR new failure mode catalogued | Roll back via `_shared/.agents/CHANGELOG.md`, lock version per project pin (§versioning-pinning) |
| Knowledge node Lv | Citation broken OR outdated SOTA OR contradicted by 2 newer projects | Demote depth (L3→L2→L1) OR quarantine to `knowledge/_quarantine/` |
| Project memory entry | Project archived AND no transferable insight | Compress per `memory-hygiene.md` retention policy |

> **No artifact lives forever**. Each promotion ships with sunset criteria. Untracked = framework bloat = silent drift.

---

## R-LCY-02 — Unlearn (Active Forgetting)

Rule sai gây harm phải UN-LEARN, không chỉ archive:
1. Add to `_shared/rules/_unlearn-list.md` (negative knowledge)
2. Inject vào RULES-PREAMBLE: "DO NOT apply rule X — superseded reason Y"
3. CTO sign + ADR
4. Re-eval all golden sets that referenced it

Ví dụ: nếu rule "use NBEATS for sparse retail" sau 6 tháng wrong (data shift) → unlearn list block agent từ recommend NBEATS by default.

---

## R-LCY-03 — Sunset Cadence

| Layer | Audit cadence | Auditor |
|---|---|---|
| `_shared/rules/` | Quarterly | CTO |
| `_shared/.agents/` skill cards | Quarterly | CTO + agent owner |
| `knowledge/data/baselines/` | Bi-annually | CEO + R-α |
| `knowledge/data/industries/` | When 6+ projects served — re-research full | R-β |
| `knowledge/docs/memory/` | Monthly hygiene | R-σ (R-QAL-10) |
| `_shared/rules/_archive/` | Annually — verify still archived (no resurrection by accident) | CTO |
| Marketing channels (per M1 channel mix) | Quarterly via M5 + 2-quarter-below-threshold sunset rule | R-MKT + CEO |
| Partnership relationships | Quarterly BD4 review — continue/renegotiate/sunset; sunset playbook in BD4 | CEO + COO |

---

## R-LCY-04 — Knowledge Refactor (Split / Merge)

Knowledge nodes phình to OR overlap → restructure mandatory:

| Trigger | Action |
|---|---|
| Baseline > 200 entries → split | Sub-baseline (e.g., B01 → B01a Forecasting Time-series + B01b Forecasting Sparse) |
| 2 baselines overlap > 40% content → merge | Re-namespace, redirect old refs |
| Industry < 5 entries after 12 months → archive or merge into parent | Move to `_archive/` or merge with related industry |

ADR mandatory for split/merge. Project pinning (§versioning-pinning) prevents in-flight project broken.

---

## R-LCY-05 — External Dependency Drift Watch

Studio MUST maintain `_shared/standards/external-dependencies.md` (vendor watch list):

```yaml
dependencies:
  - vendor: Anthropic
    services: [Claude API, prompt cache]
    pinned_version: "claude-sonnet-4-6"
    deprecation_watch: "API v1 sunset 2026-Q4"
    owner: R-LLMOps + CTO
    review_cadence: weekly
  - vendor: Telegram
    services: [Bot API, payment]
    pinned_version: "Bot API 7.x"
    tos_watch: "ToS update 2025-09"
    owner: project-specific R-AE
  ...
```

R-LLMOps weekly review compares pinned vs latest → flag deprecation 60 days before EOL → ADR-driven migration plan.

---

## R-LCY-06 — Multi-Path Priority (when paths concurrent)

00-OPERATING-MANUAL has 5 paths (A/B/C/D/E). When ≥2 paths active simultaneously:

| Priority | Path | Reason |
|---|---|---|
| 1 (highest) | Path A in delivery (P5+) — client paid | Revenue + reputation locked |
| 2 | Path E (Sev 0/1 incident) | Production reliability |
| 3 | Path A in proposal (P0–P4) — client unsigned | Revenue at risk |
| 4 | Path D (knowledge re-research) — blocking active project | Unblocks #1 or #3 |
| 5 | Path B (internal product) | Strategic but discretionary |
| 6 (lowest) | Path C (content) | Marketing — flex schedule |

Resource contention → preempt lower priority. Engine queue per priority. Driver MUST log preemption + ETA reschedule.

---

## R-LCY-07 — Concurrent Project Resource Lock

Phase 1: 1-2 concurrent. Phase 2: 3-4. Phase 3: 6-10 (per `00-OPERATING-MANUAL §12`).

Mechanism (was missing):
- `projects/_ops/resource-lock.json` — global resource ledger
- Each project request agent → check ledger → wait or proceed
- Lock granularity: agent-id × time-window (e.g., R-α 14:00–15:00)
- LLM API rate limit budget shared — daily cap allocated per active project
- Postgres / Helicone / vendor quota — shared, allocated by project priority

R-OPS-01 (or COO) holds the ledger.

---

## R-LCY-08 — Framework-Level Retro (Meta-Loop)

Quarterly: framework health check, owner CTO + CEO.

Audit:
- Number of rules total, archive ratio
- Skill cards updated vs stale (>90 days untouched flag)
- Knowledge node distribution (split / merge candidate)
- Unlearn list size (signal of accumulating wrong)
- ADR repeat patterns (same decision revisited 3+ times = systemic gap)
- Failure modes catalogue trend (accelerating = framework break)

Output: `framework-retro-{YYYY-Qn}.md` + ADR for any structural change.

---

## R-LCY-09 — Long-Term Client Lifecycle (post-30-day)

`14-customer-success-playbook.md` covers 30-day. Beyond:
- 60-day touchpoint (CS check-in, NPS)
- 90-day expansion review (Sprint A→B upsell or retainer offer)
- Quarterly business review (QBR) for retainer clients
- Annual contract renewal

→ Pipeline doc P10-LONG-TERM details (§pipeline-paths-section).

---

## Quick Reference

```
LIFECYCLE RULES (R-LCY):
01 Demote pathway mandatory
02 Unlearn (active forgetting) for harmful rules
03 Sunset cadence per layer
04 Knowledge refactor (split/merge) at threshold
05 External dependency drift watch (weekly)
06 Multi-path priority (1=A delivery → 6=C content)
07 Concurrent project resource lock
08 Framework-level retro quarterly
09 Long-term client lifecycle post-30-day
```

---

## Cross-References

- Promotion path: [`@./00-MASTER-RULES.md`](00-MASTER-RULES.md) §R-MAS-05
- Memory hygiene: [`@./70-quality-rules.md`](70-quality-rules.md) §R-QAL-10
- Quality promote gate: [`@./70-quality-rules.md`](70-quality-rules.md) §R-QAL-07
- Versioning + pin: [`@../standards/versioning-pinning.md`](../standards/versioning-pinning.md)
- External deps: [`@../standards/external-dependencies.md`](../standards/external-dependencies.md)
- Path pipeline orchestration: [`@../../experience/workspace/docs/pipeline/README.md`](../../experience/workspace/docs/pipeline/README.md)
- Framework retro workflow: [`@../../experience/workspace/docs/workflows/W08-framework-retro.md`](../../experience/workspace/docs/workflows/W08-framework-retro.md)

---
*v1.0 — closes promote→demote→sunset loop. Adopted 2026-04-27.*
