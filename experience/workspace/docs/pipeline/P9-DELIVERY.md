# P9 — Delivery (Handoff)

> Final review, knowledge transfer, handoff package, retro, memory promotion.

**Canonical**: [`@../../../../business-strategy/13-product-delivery-process.md:486-525`](../../../../business-strategy/13-product-delivery-process.md)
**Prev**: [`P8-DEPLOYMENT.md`](P8-DEPLOYMENT.md) — **Next**: project archive + memory promotion

---

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 9: DELIVERY                                      │
│  Goal: Sign-off, KT, retro, memory promotion             │
│  Engine cost target: $0.10–0.30 (mostly human time)      │
│  Human involvement: HIGH (sign-off + retro mandatory)   │
└─────────────────────────────────────────────────────────┘
```

---

## Trigger
All prior phases done; client tested in their environment; acceptance criteria met.

## Activities

| Step | Owner | Action |
|---|---|---|
| 9.1 | P3 + Client | **Final review meeting** (60 min) — walk through deliverables, Q&A, sign-off form. |
| 9.2 | CEO + P3 | **Knowledge transfer** — 1–2 training sessions (1h each), recorded. |
| 9.3 | P3 | **Handoff package** — all deliverables zipped + Notion view + recorded videos. |
| 9.4 | P3 | 30-day post-delivery support agreement (response < 48h). |
| 9.5 | P3 | Final invoice + payment collection. |
| 9.6 | All | **Internal retro** — `99-retro.md` (template: [`@../../../../_shared/prompts/RETRO.md`](../../../../_shared/prompts/RETRO.md)). |
| 9.7 | R-σ + CEO | **Memory promotion** — extract learnings to `knowledge/docs/memory/{Bxx,Ixx}-learnings.md`. |
| 9.8 | CEO | **Prompt version bump** if eval improved ≥ +0.3 across ≥ 3 projects. |
| 9.9 | P3 | **Case study** if Founding Customer (anonymized, published 4–8 weeks later). |

---

## Outputs

```
projects/{PROJECT_ID}/09-final-package/
├── acceptance-form.pdf         ← signed by client
├── handoff-package.zip
├── kt-recordings/              ← session videos
├── support-agreement.md
├── 99-retro.md                 ← internal post-mortem
└── memory-deltas/              ← entries promoted to knowledge layer
```

---

## Definition of Done

- ✅ Client signs **Acceptance form**
- ✅ Final invoice **paid**
- ✅ Recordings + handoff package delivered
- ✅ Internal retro completed within **7 days** post-handoff
- ✅ MAESTRO memory updated (`knowledge/docs/memory/`)
- ✅ Skill cards updated if pattern across ≥3 projects (per `_shared/.agents/README.md` versioning rule)

---

## Memory Promotion Path

```
project insight
    │
    ├─→ knowledge/docs/memory/B0X-learnings.md      (baseline-level pattern)
    ├─→ knowledge/docs/memory/I0Y-learnings.md      (industry-level pattern)
    ├─→ _shared/.agents/tier-X/R-{id}.md v1.x       (skill card update)
    └─→ _shared/eval/golden-sets/R-{id}.yaml        (new test cases)
```

See [`@../../../../01-FRAMEWORK.md`](../../../../01-FRAMEWORK.md) for full cross-layer memory promotion rules.

---

## Failure Modes
- **Retro skipped under deadline pressure**: enforce as gate before invoice closure.
- **Memory entries are dump, not curated**: R-σ must filter for *transferable* lessons (per `memory-hygiene.md`).
- **Client refuses sign-off post-acceptance**: escalate per `business-strategy/13 §5` change management.

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

**Phase responsibility — retro the harness itself, promote permanent-fixes, archive traces.**

| Action | Output | Rule |
|---|---|---|
| Review `permanent-fixes.md` | List entries this project. Mark each: `project-only` (stays local) / `promote-candidate` (lặp ở 3+ project → propose to `_shared/rules/`) / `industry-specific` (promote to `knowledge/data/industries/I0X/harness-quirks.md`) | R-HRN-06 + R-MAS-05 |
| Harness health summary in retro | Section in `99-retro.md`: cache hit-rate trend, drift incidents, error envelope failures, approval gate denials, cost vs cap | R-HRN-07, R-HRN-10, R-HRN-12 |
| Memory promotion | Long-term memory entries (R-HRN-04) reviewed for transferability — promote to baseline / industry per R-QAL-10 + R-MAS-05 | R-HRN-04 |
| Trace archive | If profile=L2: 90-day retention enforced (compliance). L0/L1: keep raw 30 days, summary forever | R-HRN-12 |
| Manifest version freeze | Tag `manifest.yaml` + `guardrails.yaml` final version → reference in case study + future-project starting point | R-HRN-05 |

**Gate to invoice closure**: retro MUST include "Harness Health" section with above items. R-FIN blocks invoice closure if missing (per R-QAL-09 retro-mandatory rule).

Cross-ref: [`@../../../../_shared/rules/80-harness-rules.md`](../../../../_shared/rules/80-harness-rules.md) §R-HRN-06, §R-HRN-04, §R-HRN-12

---

## Cross-References
- Retro template: [`@../../../../_shared/prompts/RETRO.md`](../../../../_shared/prompts/RETRO.md)
- Memory hygiene: [`@../../../../_shared/standards/memory-hygiene.md`](../../../../_shared/standards/memory-hygiene.md)
- Framework promotion path: [`@../../../../01-FRAMEWORK.md`](../../../../01-FRAMEWORK.md)
- Change management: [`@../../../../business-strategy/13-product-delivery-process.md:573-606`](../../../../business-strategy/13-product-delivery-process.md)

---
*Pipeline v1.0 — last updated 2026-04-26*
