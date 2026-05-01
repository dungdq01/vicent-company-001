# knowledge/data/baselines/ — B01–B15 Baseline JSONs

**Parent**: [`@../../README.md`](../../README.md) (knowledge layer)
**Schema**: [`@../../docs/DATA-SCHEMA.md`](../../docs/DATA-SCHEMA.md)

---

## Purpose

Machine-readable knowledge nodes for the **15 AI Baselines** that form one axis of the MAESTRO matrix. These are the canonical "What we know about each AI capability" — loaded by the engine when an agent needs baseline context.

---

## Roster

> **Canonical taxonomy**: [`@../../docs/CONVENTIONS.md`](../../docs/CONVENTIONS.md) §5. If this table disagrees with §5, §5 wins — open a PR to sync.

| ID | File | Canonical Name | Short |
|---|---|---|---|
| B01 | `B01-forecasting.json` | Forecasting & Time Series | Forecasting |
| B02 | `B02-document-intelligence.json` | Document Intelligence | Doc Intelligence |
| B03 | `B03-computer-vision.json` | Computer Vision | Computer Vision |
| B04 | `B04-nlp.json` | NLP & Language AI | NLP |
| B05 | `B05-recommendation.json` | Recommendation Systems | Recommendation |
| B06 | `B06-optimization.json` | Optimization & Operations Research | Optimization |
| B07 | `B07-anomaly-detection.json` | Anomaly Detection & Monitoring | Anomaly Detection |
| B08 | `B08-conversational-ai.json` | Conversational AI & Chatbots | Conversational AI |
| B09 | `B09-generative-ai.json` | Generative AI & Content | Generative AI |
| B10 | `B10-agentic-ai.json` | Agentic AI & Autonomous Systems | Agentic AI |
| B11 | `B11-knowledge-graph.json` | Knowledge Graph & Semantic AI | Knowledge Graph |
| B12 | `B12-search-rag.json` | Search & RAG | Search & RAG |
| B13 | `B13-tabular-ml.json` | Tabular ML & Predictive Analytics | Tabular ML |
| B14 | `B14-speech-audio.json` | Speech & Audio AI | Speech & Audio |
| B15 | `B15-simulation-digital-twin.json` | Simulation & Digital Twin | Simulation |

---

## File Schema

Each `B0X-*.json` follows the schema documented in [`@../../docs/DATA-SCHEMA.md`](../../docs/DATA-SCHEMA.md). Key sections:

```json
{
  "id": "B01",
  "name": "Forecasting & Time Series",
  "level": 3,
  "techStack": [...],
  "pipeline": [...],
  "sotaAlgorithms": [...],
  "useCases": [...],
  "antipatterns": [...],
  "references": [...],
  "lastReviewed": "YYYY-MM-DD"
}
```

---

## Update Rules

- **Re-research trigger**: `level < 3` OR `lastReviewed > 6 months` for fast-moving fields (LLM, agentic, generative).
- **Version bump**: append entry to `knowledge/docs/memory/B0X-learnings.md` then update JSON.
- **Source of new content**: project retros (`projects/{id}/99-retro.md`) → memory file → JSON merge.

---

## Cross-References

| Need | Path |
|---|---|
| Schema | [`@../../docs/DATA-SCHEMA.md`](../../docs/DATA-SCHEMA.md) |
| Capability taxonomy | [`@../../docs/AI-CAPABILITY-TAXONOMY.md`](../../docs/AI-CAPABILITY-TAXONOMY.md) |
| Per-baseline learnings | [`@../../docs/memory/`](../../docs/memory/) |
| Re-research prompt | [`@../../../_shared/prompts/RE-RESEARCH.md`](../../../_shared/prompts/RE-RESEARCH.md) |
| Industries axis | [`@../industries/README.md`](../industries/README.md) |
| Matrix nodes | [`@../matrix/README.md`](../matrix/README.md) |

---
*Last updated: 2026-04-27 — taxonomy synced with `docs/CONVENTIONS.md` §5 (was stale, fixed).*
