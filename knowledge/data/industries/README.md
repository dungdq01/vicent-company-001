# knowledge/data/industries/ — I01–I20 Industry JSONs

**Parent**: [`@../../README.md`](../../README.md) (knowledge layer)
**Schema**: [`@../../docs/DATA-SCHEMA.md`](../../docs/DATA-SCHEMA.md)

---

## Purpose

Machine-readable knowledge nodes for the **20 industry verticals** that form one axis of the MAESTRO matrix. Loaded when an agent needs industry context (regulations, KPIs, common pain points, data sources).

---

## Roster

| ID | File | Industry | Founder owner |
|---|---|---|---|
| I01 | `I01-retail.json` | Retail / E-commerce | P2 |
| I02 | `I02-finance.json` | Finance / Banking / FinTech | — |
| I03 | `I03-healthcare.json` | Healthcare / MedTech | — |
| I04 | `I04-manufacturing.json` | Manufacturing | — |
| I05 | `I05-agriculture.json` | Agriculture / AgriTech | — |
| I06 | `I06-logistics.json` | Logistics / Supply Chain | **P3** |
| I07 | `I07-energy.json` | Energy / Utilities | — |
| I08 | `I08-construction.json` | Construction / Real Estate | — |
| I09 | `I09-education.json` | Education / EdTech | — |
| I10 | `I10-telecom.json` | Telecom | — |
| I11 | `I11-legal.json` | Legal / RegTech | — |
| I12 | `I12-media.json` | Media / Entertainment | — |
| I13 | `I13-transportation.json` | Transportation / Mobility | — |
| I14 | `I14-food.json` | Food & Beverage | — |
| I15 | `I15-insurance.json` | Insurance | — |
| I16 | `I16-pharmaceutical.json` | Pharmaceutical | — |
| I17 | `I17-gaming.json` | Gaming | — |
| I18 | `I18-marketing.json` | Marketing / AdTech | **P1** (MMO) |
| I19 | `I19-hr.json` | HR / Talent | — |
| I20 | `I20-cybersecurity.json` | Cybersecurity | — |

**Triumvirate priority**: I06 (P3 Logistic), I01 (P2 E-commerce), I18 (P1 MMO/AdTech). Other industries opportunistic.

---

## File Schema

```json
{
  "id": "I0X",
  "name": "...",
  "level": 1-3,
  "regulations": [...],
  "kpis": [...],
  "commonPainPoints": [...],
  "dataSources": [...],
  "vnContext": {...},
  "lastReviewed": "YYYY-MM-DD"
}
```

Full schema: [`@../../docs/DATA-SCHEMA.md`](../../docs/DATA-SCHEMA.md).

---

## Level Definition

- **L1** — taxonomy stub only (name, brief description)
- **L2** — overview + key KPIs + 1–3 use cases
- **L3** — deep node: regulations, data sources, VN-specific context, ≥5 use cases

Triumvirate verticals (I01, I06, I18) target **L3**. Others opportunistic L1–L2.

---

## Update Rules

- **Re-research** when project retro identifies industry insight gap.
- **VN context** required for L3 (regulations, market size, local players).
- **Promote from project**: `projects/{id}/99-retro.md` → `knowledge/docs/memory/I0X-learnings.md` → JSON merge.

---

## Cross-References

| Need | Path |
|---|---|
| Schema | [`@../../docs/DATA-SCHEMA.md`](../../docs/DATA-SCHEMA.md) |
| Industry taxonomy | [`@../../docs/AI-INDUSTRY-TAXONOMY.md`](../../docs/AI-INDUSTRY-TAXONOMY.md) |
| Domain expert template | [`@../../../_shared/.agents/tier-3-domain/R-Dxx-template.md`](../../../_shared/.agents/tier-3-domain/R-Dxx-template.md) |
| Per-industry learnings | [`@../../docs/memory/`](../../docs/memory/) |
| Triumvirate strategy | [`@../../../business-strategy/`](../../../business-strategy/) |

---
*Last updated: 2026-04-26*
