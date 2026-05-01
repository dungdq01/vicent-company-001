# pipeline/ — Phase-by-Phase Engine Specs

**Parent**: [`@../../README.md`](../../README.md) (engine workspace)
**Canonical phase doc** (RACI + DoD source of truth): [`@../../../../business-strategy/13-product-delivery-process.md`](../../../../business-strategy/13-product-delivery-process.md)

---

## Purpose

These docs describe **how the engine orchestrates each phase** — agent assignments, inputs, outputs, eval gates. They are the *runtime* counterpart to the *strategic* phase doc in `business-strategy/13`.

| Layer | Source | Contains |
|---|---|---|
| Strategy | `business-strategy/13-product-delivery-process.md` | RACI · timeline · pricing tier · DoD canonical |
| **Engine (here)** | `pipeline/P{N}-*.md` | Agent dispatch · I/O contracts · failure modes · cross-refs |

Single source of truth: **DoD lives in business-strategy/13 + `_shared/standards/dod-per-deliverable.md`**. These pipeline docs *reference*, do not duplicate.

---

## Phase Index

### Path A — Customer brief (Sales-led, P0–P9 + P10)

| # | File | Goal | Engine $ |
|---|---|---|---|
| P0 | [`P0-INTAKE.md`](P0-INTAKE.md) | Brief + match knowledge + assemble team + harness profile | $0.05–0.20 |
| P1 | [`P1-DISCOVERY.md`](P1-DISCOVERY.md) | Deep problem understanding + SOTA | $0.30–1.00 |
| P2 | [`P2-PROPOSAL.md`](P2-PROPOSAL.md) | Client-ready proposal + feasibility | $0.20–0.50 |
| **G1** | (gate) | Client signs SOW + 50% deposit | — |
| P3 | [`P3-ARCHITECTURE.md`](P3-ARCHITECTURE.md) | High-level system design + harness manifest | $0.40–1.20 |
| P4 | [`P4-DESIGN.md`](P4-DESIGN.md) | Detailed design (parallel API/DB/ML/UI) | $0.80–2.50 |
| P5 | [`P5-PLANNING.md`](P5-PLANNING.md) | Sprints + RACI + risk + harness guardrails lock | $0.10–0.30 |
| P6 | [`P6-DEV-GUIDES.md`](P6-DEV-GUIDES.md) | Code-level spec + harness primitives impl | $0.30–0.80 |
| P7 | [`P7-QA.md`](P7-QA.md) | Test plan + golden sets + harness compliance | $0.30–0.80 |
| P8 | [`P8-DEPLOYMENT.md`](P8-DEPLOYMENT.md) | Infra + CI/CD + monitoring + sandbox provision | $0.30–0.80 |
| P9 | [`P9-DELIVERY.md`](P9-DELIVERY.md) | Sign-off + KT + retro + memory promotion | $0.10–0.30 |
| P10 | [`P10-LONG-TERM.md`](P10-LONG-TERM.md) | Day-60/90/QBR/annual — long-term lifecycle | mostly human time |

**Total engine cost (full Sprint D)**: ~$3–9 per project. See [`@../../../../_shared/standards/cost-budgets.md`](../../../../_shared/standards/cost-budgets.md) for hard caps.

### Other paths (B / C / D)

| Path | File | Use case |
|---|---|---|
| **B** Internal product | [`PATH-B-PRODUCT.md`](PATH-B-PRODUCT.md) | PDF $19, course $99, tool — studio's own catalogue |
| **C** Content piece | [`PATH-C-CONTENT.md`](PATH-C-CONTENT.md) | YouTube / Substack / TikTok / Threads / Audit |
| **D** Knowledge re-research | [`PATH-D-RESEARCH.md`](PATH-D-RESEARCH.md) | β fresh research, baseline refresh, vendor drift |

**Path E** Operational issue: no Engine — pure ops per `business-strategy/15`. See `00-OPERATING-MANUAL.md §7`.

---

### Multi-path coordination

When ≥2 paths active concurrently → workflow [`W10-cross-path-priority.md`](../workflows/W10-cross-path-priority.md). Priority table in [`90-lifecycle-rules.md`](../../../../_shared/rules/90-lifecycle-rules.md) §R-LCY-06.

---

## Scope Tiers (which phases run)

| Tier | Phases | Use case | Pricing |
|---|---|---|---|
| **Sprint A** (POC / discovery) | P0–P2 | $30 PDF MMO; quick scoping | low |
| **Sprint B** (proposal+arch) | P0–P3 | enterprise pre-sales | mid |
| **Sprint C** (design+guides) | P0–P6 | full design package, no impl | mid-high |
| **Sprint D** (full delivery) | P0–P9 | end-to-end build + ship | high |

Engine reads scope tier from `00-intake.md → scope` and skips/runs phases accordingly.

---

## Common Conventions

- Each phase doc opens with a **box header** (goal, duration, cost, human involvement).
- **Engine Orchestration** table = step / agent / action / skill-card link.
- **Outputs** block shows the literal `projects/{id}/0X-...` folder layout.
- **DoD** section bullets reference `_shared/standards/dod-per-deliverable.md`.
- **Failure Modes** ≥ 3 per phase, mapped to `_shared/eval/failure-modes.md`.
- **Cross-References** at footer.

## Loader Contract (R-DOC-16)

Phase docs use HTML comment anchors for robust loader extraction:

```
<!-- @input-contract --> ... <!-- /@input-contract -->
<!-- @output-contract --> ... <!-- /@output-contract -->
<!-- @harness-checkpoint --> ... <!-- /@harness-checkpoint -->
<!-- @failure-modes --> ... <!-- /@failure-modes -->
```

P0/P1/P2 fully anchored. P3-P10 + Path B/C/D have open-anchor on harness checkpoint; loader **fallback to heading regex** (graceful degradation per R-DOC-16). Full anchors will be added when recipe YAML Sprint B/C/D ships.

---

## Adding / Modifying Pipeline Step

Per `@../../../../_shared/standards/change-management.md` **§4.2 Add Pipeline Step** — concrete checklist (update phase doc with anchors preserved + W04 mandatory load + skill card I/O + skill version bump + R-MAS-08 eval delta if behavior change + W03 timeline + START-HERE §4 if newcomer-visible). ADR mandatory if structural.

---

## Cross-References

| Need | Path |
|---|---|
| Strategic phase spec | [`@../../../../business-strategy/13-product-delivery-process.md`](../../../../business-strategy/13-product-delivery-process.md) |
| Engine architecture | [`@../../AGENT-WORKSPACE-PIPELINE.md`](../../AGENT-WORKSPACE-PIPELINE.md) |
| Quality gates | [`@../quality/`](../quality/) |
| Agent skill cards | [`@../../../../_shared/.agents/`](../../../../_shared/.agents/) |
| Project templates | [`@../../../../_shared/templates/project/`](../../../../_shared/templates/project/) |
| **Change management protocol** | [`@../../../../_shared/standards/change-management.md`](../../../../_shared/standards/change-management.md) |

---
*Pipeline index v1.1 — last updated 2026-04-28 (added Loader Contract R-DOC-16 anchor pattern)*
