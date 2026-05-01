# knowledge/data/matrix/ — Bxx × Iyy Cell Nodes

**Parent**: [`@../../README.md`](../../README.md) (knowledge layer)
**Schema**: [`@../../docs/DATA-SCHEMA.md`](../../docs/DATA-SCHEMA.md)

---

## Purpose

Per-cell deep nodes for the **15 × 20 = 300 baseline-industry intersections**. Each cell answers: *"How does this AI baseline apply to this specific industry?"*

These are the highest-leverage knowledge artifacts — they unlock fast project intake by precomputing matched context.

---

## Naming Convention

`B{XX}-I{YY}.json` — e.g. `B01-I06.json` (Forecasting × Logistics).

---

## Filing Strategy (300 cells, can't do all)

| Priority | Cells | Reason |
|---|---|---|
| **Tier 1** | B01-I06, B06-I06, B13-I06 | P3 logistic — used in real client work |
| **Tier 1** | B01-I01, B03-I01, B07-I01 | P2 e-commerce — recommendation, forecasting, NLP |
| **Tier 1** | B10-I18, B13-I18, B07-I18 | P1 MMO — generative, agentic, NLP for AdTech |
| Tier 2 | Top-3 cells per Triumvirate vertical (extending L2) | depth-on-demand |
| Tier 3 | Other cells | created lazily when project demands |

→ Don't pre-generate all 300. Build cells **as projects pull them**.

---

## File Schema

```json
{
  "id": "B01-I06",
  "baseline": "B01",
  "industry": "I06",
  "level": 3,
  "useCases": [...],
  "vnSpecific": {...},
  "techStackAdaptations": [...],
  "knownAntipatterns": [...],
  "referenceProjects": ["SupplyChain-Planning-System"],
  "lastReviewed": "YYYY-MM-DD"
}
```

Full schema: [`@../../docs/DATA-SCHEMA.md`](../../docs/DATA-SCHEMA.md).

---

## Promotion Rule (project → cell)

After P9 retro:
1. Patterns referenced in ≥ 2 projects → promote to cell node.
2. R-σ generates first draft from project deliverables.
3. CEO reviews + signs.
4. Cell published; subsequent intakes auto-load it (P0.2 knowledge match).

---

## Cross-References

| Need | Path |
|---|---|
| Schema | [`@../../docs/DATA-SCHEMA.md`](../../docs/DATA-SCHEMA.md) |
| Baselines axis | [`@../baselines/README.md`](../baselines/README.md) |
| Industries axis | [`@../industries/README.md`](../industries/README.md) |
| Per-cell learnings | [`@../../docs/memory/`](../../docs/memory/) |
| Memory promotion path | [`@../../../01-FRAMEWORK.md`](../../../01-FRAMEWORK.md) |

---
*Last updated: 2026-04-26*
