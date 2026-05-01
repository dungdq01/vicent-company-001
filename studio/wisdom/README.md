# studio/wisdom/ — Studio-Internal Knowledge

> **STUDIO-INTERNAL ONLY**. Separate from client-facing `knowledge/`. Per `_shared/standards/boundaries.md` §1.

**Owner**: CEO + COO.
**Boundary**: client-delivery agents (R-α, R-β, R-σ in P1-P9 client work) **CANNOT** read this folder. Strategic agents (R-CONTENT, R-MKT, R-SDR) can — for tone calibration only.

---

## Purpose

Capture studio's accumulated wisdom that doesn't belong in:
- `knowledge/` (client-facing baselines + industries)
- `business-strategy/` (formal strategic decisions, ICP/pricing/KPI)

This folder = unfiltered, opinion-rich, internal-only context.

---

## Files

| File | Purpose |
|---|---|
| `README.md` | (this) |
| `voice-of-customer.md` | Raw quotes, observations from sales calls, NPS feedback |
| `icp-insights.md` | Deeper ICP analysis beyond `business-strategy/02` |
| `what-we-learned.md` | Internal retro patterns (transferable lessons) |
| `hot-takes.md` | CEO opinion essays (raw, unpolished) |
| `high-performer-hooks.md` | Content viral hooks library (per W08 + Path C) |
| `churn-patterns.md` | Lost client patterns (per P10.2) |
| `voice-registry.yaml` | Voice contract registry per R-ORC-08 |

Stub files có header + format pattern + cross-refs sẵn. Content populated as studio operates. `voice-registry.yaml` đã production-grade với 4 voices.

---

## Crossing rules (boundaries.md §1)

| Direction | Allowed? |
|---|---|
| `studio/wisdom/` → client deliverable | ❌ default, requires ADR + CEO sign |
| Client deliverable insight → `studio/wisdom/` | ✅ with anonymization |

Engine context loader has whitelist per agent role — boundary breach attempt logged + blocked.

---

## Cross-References

- Boundary spec: [`@../../_shared/standards/boundaries.md`](../../_shared/standards/boundaries.md)
- Knowledge curation: [`@../../_shared/standards/knowledge-curation.md`](../../_shared/standards/knowledge-curation.md)

---
*v1.0 — created 2026-04-27.*
