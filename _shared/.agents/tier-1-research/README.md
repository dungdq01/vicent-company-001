# Tier 1 — Research Agents

**Parent**: [`@../README.md`](../README.md) | **Roster source**: [`@../TEAM-CONFIG.md`](../TEAM-CONFIG.md)

**Mục đích**: 6 agent invoke trong **mọi module/project**, bất kể scope. Gồm classifier (P0), academic quartet (P1), và judge (every dispatch).

| ID | Persona | Role | Phase invoked |
|---|---|---|---|
| R-Match | Knowledge Classifier | Brief → baseline + industry + matrix cells classification | P0.2 (and Path D trigger) |
| R-α | Dr. Archon | Research & Architecture (SOTA review) | P1 Step 1 |
| R-β | Dr. Praxis | Engineering & Implementation (tech stack) | P1 Step 2 |
| R-γ | Dr. Sentinel | Evaluation & Feasibility (scoring + risk) | P1 Step 3 |
| R-σ | Ms. Scribe | Consolidation & Documentation (client-ready) | P1 + P2 |
| R-eval | Eval Judge | LLM-as-judge Layer 2 content eval | every dispatch (post-output) |

---

## Sequence Trong Pipeline

```
P0.2:  R-Match (classify brief → knowledge_match)
       ↓
P1:    α (research SOTA) → β (tech design) → γ (eval + score) → σ (consolidate)
                            ↑                    ↑
                       (Layer 2 parallel)   (after all done)
       ↓
Every dispatch (P0-P9): R-eval (Layer 2 LLM-as-judge)
```

R-Match = **first agent invoked** trong project lifecycle (P0.2). Output (`knowledge_match`) drives ALL subsequent agent context loading.
R-α + R-β + R-γ = **Tier 1 mandatory cho P1** (TEAM-CONFIG §IV.4 — không thay bằng Tier 2).
R-σ = **Layer 3 always** — gatekeeper cho output cuối cùng.
R-eval = **post-output judge mọi dispatch** — different model family per R-QAL-13.

---

## Language Rule (SOP §1.2 RULE 6)

- α/β/γ output **English** (research/tech/eval reports)
- σ là **sole translation layer** → Vietnamese final-report.md + JSON nodes

---

## Cross-References

- Pipeline detail: `@../../../experience/AGENT-WORKSPACE-PIPELINE.md` §3
- SOP universal: `@../../../knowledge/docs/SOP-AGENT-PROCESS.md` §1
- Eval framework: `@../../eval/SPEC.md`

*Last updated: 2026-04-26*
