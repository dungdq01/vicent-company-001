# Module Test Protocol — MAESTRO Knowledge Graph Platform

**Version:** 1.1
**Last Updated:** 2026-04-01
**Owned By:** Manager + R-σ + R-QA
**Triggered:** After Workflow A (Step A4) completes — before Manager sign-off

> **Purpose:** Định nghĩa tiêu chuẩn để xác định "1 module research được xem là HOÀN CHỈNH và ĐẠT CHẤT LƯỢNG."
> Quality checklist hiện rải rác trong SOP §4 và skill cards — file này gom lại thành protocol có cấu trúc, test-by-layer.

---

## OVERVIEW — 6 TEST LAYERS

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 0 — BUILD HEALTH            (R-BE + Manager)            │
│  LAYER 1 — DATA INTEGRITY          (R-σ runs, R-BE verifies)   │
│  LAYER 2 — PIPELINE COMPLETENESS   (Manager + R-σ runs)        │
│  LAYER 3 — AGENT OUTPUT QUALITY    (Per-agent acceptance tests) │
│  LAYER 4 — CROSS-REFERENCE CHECK   (R-σ runs)                  │
│  LAYER 5 — DISPLAY & UX VERIFY     (R-FE runs)                 │
└─────────────────────────────────────────────────────────────────┘

ALL 6 layers must PASS before module is signed off.
ANY CRITICAL failure = block sign-off, return to responsible agent.
Run layers in order — LAYER 0 must pass before proceeding.
```

### Severity Classification

| Level | Symbol | Meaning | Action |
|-------|--------|---------|--------|
| CRITICAL | 🔴 | Blocks sign-off entirely | Fix before any other layer |
| HIGH | 🟠 | Must fix before sign-off | Fix + re-test affected layer |
| MEDIUM | 🟡 | Should fix; can conditionally pass | Log in open questions, fix next update |
| LOW | 🟢 | Nice-to-have | Log, no blocking |

### Who Runs What (in practice)

| Layer | Primary Owner | Secondary Owner | Notes |
|-------|--------------|-----------------|-------|
| Layer 0 | R-BE | Manager | Runs before everything |
| Layer 1 | R-σ | R-BE (JSON schema) | After Step A4 |
| Layer 2 | Manager | R-σ (input confirm) | After Layer 1 passes |
| Layer 3 | Manager | (per-agent review) | After Layer 2 passes |
| Layer 4 | R-σ | Manager (spot check) | After Layer 3 passes |
| Layer 5 | R-FE | Manager (UX review) | After Layer 4 passes |

**Without R-QA (default):** Manager runs L0–L3, R-σ runs L4, R-FE runs L5.  
**With R-QA:** R-QA runs L1–L4; Manager reviews results and approves sign-off.

---

## LAYER 0 — BUILD HEALTH

**Owner:** R-BE (runs), Manager (verifies)
**When:** BEFORE Layer 1. If it fails, stop — do not proceed to other layers.

```
□ npm run build exits code 0 (no build errors)                               🔴
□ No TypeScript compiler errors (npx tsc --noEmit passes)                    🔴
□ No console.log in production code (per KICKOFF Rule 6)                     🟠
□ Dev server starts (npm run dev, no crash within 5s)                        🟠
□ /api/nodes/B01 returns valid JSON (basic API health check)                 🟡
```

**Pass condition:** Both 🔴 items pass.  
**Why first?** A broken build means L5 display tests give false negatives and JSON API tests are unreliable.

---

## LAYER 1 — DATA INTEGRITY

**Owner:** R-σ (runs check), R-BE (validates JSON schema)
**When:** After R-σ creates all output files (Step A4 complete)

### L1.1 Filesystem Completeness (H5 Check)

```
□ docs/reports/{MODULE_ID}/research-report.md     EXISTS  🔴
□ docs/reports/{MODULE_ID}/tech-report.md         EXISTS  🔴
□ docs/reports/{MODULE_ID}/feasibility-report.md  EXISTS  🔴
□ docs/reports/{MODULE_ID}/final-report.md        EXISTS  🔴
□ docs/reports/{MODULE_ID}/{ROLE_ID}-notes.md ×N  EXISTS  🟠  (all Layer 2 agents that were dispatched)
□ data/{category}/{MODULE_ID}.json                EXISTS  🔴
□ data/graph.json                                 UPDATED 🔴  (new node + edges present)
□ docs/memory/{MODULE_ID}-learnings.md            EXISTS  🟠
```

**Pass condition:** All 🔴 items present. At least 5 of N Layer-2 notes present.

### L1.2 JSON Schema Validation

```
□ {MODULE_ID}.json validates against DATA-SCHEMA.md for declared depthLevel  🔴
□ All REQUIRED fields at target depth populated (not empty string "" or [])   🔴
□ ID format correct: "B01", "I06", "B01-I06" (never "B1", "b01")             🔴
□ category field = "baseline" | "industry" | "matrix" (matches node type)    🔴
□ color field = value from CONVENTIONS.md §7 approved palette                🟠
□ depthLevel = 1 | 2 | 3 (integer, not string)                               🟠
□ metadata.status = "draft" | "reviewed" | "published" (not empty)           🟡
□ metadata.researchedBy lists all agents who contributed                      🟡
□ relatedNodes references use valid existing node IDs (B01-B15, I01-I20)     🟠
□ All URLs in resources[] return non-404 (spot check ≥3)                     🟡
□ academicFoundations.keyPapers has ≥2 entries at L2, ≥5 entries at L3         🟠
□ academicFoundations.mathematicalFoundations non-empty at L3 depth            🟠
□ concepts[] length ≥3 at L1, ≥5 at L2, ≥8 at L3                              🟠
```

### L1.3 Language Policy (Two-Phase Model)

```
□ research-report.md written in English                                       🔴
□ tech-report.md written in English                                           🔴
□ feasibility-report.md written in English                                    🔴
□ {ROLE_ID}-notes.md written in English                                       🟠
□ final-report.md written in Vietnamese                                       🔴
□ {MODULE_ID}.json content fields written in Vietnamese                       🔴
□ {MODULE_ID}-learnings.md written in Vietnamese                              🟠
□ Technical terms in final-report have Vietnamese explanation on first mention 🟡
□ docs/reports/{MODULE_ID}/alpha-insights.md exists (if partial memory enabled)  🟢
□ docs/reports/{MODULE_ID}/beta-decisions.md exists (if partial memory enabled)  🟢
□ docs/reports/{MODULE_ID}/gamma-risks.md exists (if partial memory enabled)     🟢
```

---

## LAYER 2 — PIPELINE COMPLETENESS

**Owner:** Manager
**When:** After Layer 1 passes

### L2.1 All Dispatched Agents Delivered

```
□ R-α: research-report.md submitted + status NEEDS REVIEW resolved           🔴
□ R-β: tech-report.md submitted + received research-report as input          🔴
□ R-γ: feasibility-report.md submitted + received both α+β reports as input  🔴
□ R-σ: final-report.md submitted + all inputs present                        🔴
□ All Layer-2 dispatched agents submitted notes                               🟠
□ 7-stage pipeline coverage satisfied — document which role covers which stage:  🟠
   Stage 1 Research:  R-α, R-β, R-γ (always present)
   Stage 2 Data:      R-DE, R-DA, R-DBE (≥1 required)
   Stage 3 Backend:   R-BE, R-DBE (≥1 required)
   Stage 4 Frontend:  R-FE (if UI work involved)
   Stage 5 Ops/Infra: R-DO, R-CE (≥1 if deploying)
   Stage 6 Security:  R-SE, R-QA (≥1 if security-sensitive domain)
   Stage 7 Mgmt:      R-PM, R-SA, R-BA (≥1) OR Manager covers
   → Min required: Stages 1–3 covered. Stages 4–7: 2+ stages relevant to module.
   → See agent-team-config.md §IV.5 for full checklist
```

### L2.2 Sequential Order Respected

```
□ tech-report.md references ≥3 specific findings from research-report.md       🟠
   (proxy for β read α — look for specific algorithm names, source citations)
□ feasibility-report.md challenges ≥2 specific claims from α+β reports         🟠
   (proxy for γ read both — look for "Archon claims X, however..." type challenges)
□ final-report.md cites traceable contributions from each of α, β, γ           �
   (proxy for σ synthesized — all 3 must be traceable in final-report sections)
□ R-BE normalization ran AFTER R-σ produced draft JSON                       🔴
□ R-FE verified display AFTER normalization complete                         🟠
```

### L2.3 Quality Gates Were Applied

```
□ Manager reviewed R-α output before dispatching R-β                        🟡
□ Manager reviewed R-γ output (verdict documented)                           🟠
□ R-σ contradictions noted (not hidden) if α/β/γ disagreed                  🟠
□ Any REJECTED agent output was revised before acceptance                    🟠
```

---

## LAYER 3 — AGENT OUTPUT QUALITY

**Owner:** Manager (runs against acceptance criteria per agent)
**When:** After Layer 2 passes

### L3.1 R-α Acceptance Criteria (research-report.md)

```
□ ≥10 sources cited with URL + reliability rating                            🔴
□ Academic foundations section present: field taxonomy, math formulas, ≥5 papers, timeline  🔴
□ ≥8 core concepts with: description, difficulty, prerequisites             🟠
□ Mathematical formulation present for key concepts (L3 depth)              🟠
□ Algorithm catalog: ≥5 algorithms with pros/cons                           🟠
□ SOTA section covers 2024-2026 (not just historical)                       🔴
□ ≥5 cross-domain connections with specific examples                        🟡
□ All claims have evidence (paper, benchmark, or production case)            🔴
□ Confidence level stated for each major finding                             🟡
□ No tech stack decisions made (that’s β’s job)                             🟠
□ No market/business feasibility judgment made (that’s γ’s job)              🟠
□ No code written (implementation is β/R-FE/R-BE’s job)                     🟠
□ Boundary rules for concepts are clear (not just "this is a thing")         🟠
□ Boundary rules for algorithms are clear (not just "this is an algorithm")  🟠
```

### L3.2 R-β Acceptance Criteria (tech-report.md)

```
□ Tech stack decision matrix: all layers covered (data/model/serving/monitoring)  🔴
□ Every tool choice has: version + alternatives + reason (not just "popular")     🔴
□ Pipeline architecture diagram present (ASCII or Mermaid)                        🔴
□ Per-stage breakdown: input format, process, output format, tools                🟠
□ ≥3 key code patterns (pseudocode acceptable, mark codeVerified: false)          🟠
□ ≥2 mini examples with: problem + sample data + walkthrough + pitfalls           🟠
□ Production considerations: scaling, monitoring, cost, latency (≥4 aspects)      🔴
□ Effort estimation: MVP / Production / Enterprise                                🟡
□ No SOTA research (α's job), no market assessment (γ's job)                     🟠
□ Cost implications included for tech choices                                     🟡
```

### L3.3 R-γ Acceptance Criteria (feasibility-report.md)

```
□ Feasibility scoring: all 4 dimensions scored (Tech, Market, Data, Risk)         🔴
□ Overall score calculated with correct formula:                                   🔴
    Overall = (Tech × 0.30) + (Market × 0.30) + (Data × 0.20) + (Risk_inv × 0.20)
    Risk_inv = 10 - Risk_score
□ Verdict explicit: GO / CONDITIONAL GO / NO-GO                                   🔴
□ Verdict consistent with overall score (GO ≥ 7.0, COND 5.0–6.9, NO-GO < 5.0)   🔴
□ ≥3 competitors analyzed with: strengths, weaknesses, pricing                    🟠
□ Risk register: ≥5 risks with probability + impact + mitigation + owner          🟠
□ Market insight includes Vietnam-specific context                                 🟠
□ Challenges to α/β reports are evidence-based (not opinion)                      🟠
□ CONDITIONAL GO conditions are explicit and actionable                            🟠
□ Score justification present (not just the number)                                🔴
```

### L3.4 R-σ Acceptance Criteria (final-report.md + JSON)

```
□ Executive summary: 3-5 sentences, non-technical, anyone can understand          🔴
□ Synthesizes (not copy-pastes) from α, β, γ reports                              🔴
□ Contradictions between agents documented in Debate Log                           🟠
□ Consolidated GO/NO-GO verdict consistent with R-γ scoring                        🔴
□ Quality checklist in final-report passed (all auto-check items)                  🔴
□ JSON node file conforms to DATA-SCHEMA.md at declared depthLevel                 🔴
□ graph.json updated: new node present + edges from relatedNodes populated         🔴
□ Memory file created with structured insights per agent                           🟠
□ Minority opinions preserved (not hidden if team disagreed)                       🟡
□ JSON content fields in Vietnamese                                                🔴
□ Technical terms in final-report have Vietnamese explanation on first mention     🟡
□ Vietnamese text reads naturally (not mechanical English sentence structure)       🟡
□ Consistent Vietnamese terminology throughout (same term for same concept)        🟡
```

### L3.5 Layer 2 Agents Acceptance Criteria ({ROLE_ID}-notes.md)

```
□ Output is from role's expertise domain ONLY (no scope creep)                    🟠
□ Format: concise, practical, actionable (max 2-3 pages)                           🟡
□ Recommendations are evidence-based with WHY                                      🟠
□ Best practices specific to this module (not generic advice)                      🟠
□ Production gotchas mentioned (at least 2)                                        🟡
□ Output in English                                                                🟠
```

---

## LAYER 4 — CROSS-REFERENCE CHECK

**Owner:** R-σ
**When:** After Layer 3 passes

### L4.1 Inter-Report Consistency

```
□ Tech stack in tech-report.md consistent with JSON techStack field               🔴
□ Algorithm list in research-report matches JSON algorithms field                  🟠
□ Feasibility score in feasibility-report matches JSON feasibility field           🔴
□ Verdict in final-report consistent with feasibility-report verdict               🔴
□ relatedNodes in JSON match cross-domain connections in research-report           🟡
□ No factual contradictions between reports (or contradictions are documented)     🟠
```

### L4.2 Graph Consistency

```
□ New node appears in data/graph.json nodes[]                                      🔴
□ All relatedNodes have bidirectional edges (A→B AND B→A) in graph.json           �
□ Edge relationship labels match CONVENTIONS.md §2 glossary                        🟡
□ Node color in graph.json matches CONVENTIONS.md §7 palette                       🟠
```

### L4.3 Depth Level Consistency

```
□ depthLevel in JSON matches actual content completeness                           🔴
□ L3 node has all REQUIRED fields per DATA-SCHEMA.md §1.5                         🔴
□ L2 node has all REQUIRED fields per DATA-SCHEMA.md §1.5                         🟠
□ No L1 node claims L3 depth                                                       🟠
```

### L4.4 Cross-Module Consistency

```
□ relatedNodes reference only nodes already in graph.json (no broken references)  🟠
□ No duplicate node ID introduced (new ID not already in graph.json)              🔴
□ Edges use approved relationship labels per CONVENTIONS.md §2 Glossary           🟡
   Valid: "uses", "extends", "alternative_to", "prerequisite", "related_to"
□ If B01 lists B07 in relatedNodes → verify B07.json also lists B01 back           🟡
   (full bidirectional consistency — spot check ≥2 pairs)
```

---

## LAYER 5 — DISPLAY & UX VERIFICATION

**Owner:** R-FE
**When:** After Layer 4 passes (node JSON + graph.json finalized)

### L5.1 Galaxy View

```
□ New node appears in Galaxy View (correct position/cluster)                       🔴
□ Node color matches CONVENTIONS.md §7 palette                                    🟠
□ Node tooltip shows: name, category, tagline                                      🟡
□ Click on node → transitions to Planetary View                                   🔴
```

### L5.2 Planetary View

```
□ Parent node renders at center                                                    🔴
□ Sub-nodes orbit correctly: inner (α,β,γ) + outer (Layer 2) + bottom (σ)        🔴
□ Completed agents (report file exists) show bright + glow                         🔴
□ Pending agents (no report file) show dim + dashed edge                          🔴
□ Sub-node count = agents with completed notes in docs/reports/{MODULE_ID}/        🔴
   (derived from: α+β+γ always + all dispatched Layer-2 agents + σ)
□ Click sub-node → opens Report Overlay                                           🔴
□ No ghost sub-nodes (agents not in selectedAgents)                               🔴
```

### L5.3 Report Overlay

```
□ Report content loads within 500ms                                                🟠
□ Markdown renders correctly (headers, tables, code blocks, lists)                 🔴
□ Sections display as cards in carousel (h2 = section titles)                      🔴
□ Accordion for h3 subsections works                                               🟠
□ Navigation between reports within module works                                   🟠
□ Vietnamese text renders without encoding issues                                  🟠
□ Technical terms display correctly (no broken characters)                         🟠
```

### L5.4 Performance

```
□ Galaxy View renders with new node < 2s total load                               🟡
□ Report Overlay markdown parse < 500ms                                            🟡
□ No console errors in browser DevTools                                            🟠
□ No TypeScript errors (npm run build passes)                                      🔴
```

### L5.5 Search & Filter

```
□ Search by module name returns this node in results                          🔴
□ Search by module ID (e.g., "B01") returns correct node                     🔴
□ Category filter includes this node under correct category                  🟠
□ Search result link/click opens Report Overlay correctly                     🟠
□ If depth filter exists: node appears under correct depthLevel filter        🟡
```

---

## ACCEPTANCE CRITERIA SUMMARY

### Module Sign-Off Requirements

| Condition | Requirement |
|-----------|-------------|
| **PASS (Full Sign-Off)** | All 🔴 CRITICAL items pass in all 6 layers |
| **CONDITIONAL PASS** | All 🔴 pass; ≤3 🟠 HIGH items flagged with fix deadline |
| **FAIL — Revision Required** | Any 🔴 CRITICAL fails; or >3 🟠 HIGH items fail |

### Per-Agent Minimum Bar

| Agent | Minimum to PASS |
|-------|-----------------|
| R-α | ≥10 sources, academic foundations present, ≥8 concepts, SOTA 2024-2026, evidence for all claims |
| R-β | Tech stack decision matrix complete, pipeline diagram, ≥2 mini examples, production considerations |
| R-γ | Scoring formula applied correctly, verdict explicit + justified, ≥3 competitors, ≥5 risks |
| R-σ | Synthesized (not copy-pasted), JSON valid, graph.json updated, final-report in Vietnamese |
| Layer 2 | In-lane output only, actionable, in English |

---

## TEST REPORT TEMPLATE

When running this protocol, use this template to record results:

```markdown
# Module Test Report: {MODULE_ID} — {MODULE_NAME}
**Date:** YYYY-MM-DD
**Tested by:** Manager + R-σ + R-QA (if available)
**Module depth:** L1 / L2 / L3

## Layer 0 — Build Health
- Status: PASS / FAIL
- npm run build: PASS / FAIL
- TypeScript errors: 0 / [N errors]

## Layer 1 — Data Integrity
- Status: PASS / FAIL
- Issues:
  - 🔴 [item]: [description] → Assigned to: [agent]
  - 🟠 [item]: [description] → Target fix: [date/next module]

## Layer 2 — Pipeline Completeness
- Status: PASS / FAIL
- Issues: [...]

## Layer 3 — Agent Output Quality
- R-α: PASS / FAIL — Issues: [...]
- R-β: PASS / FAIL — Issues: [...]
- R-γ: PASS / FAIL — Verdict: [GO/COND/NO-GO], Score: [X.X]
- R-σ: PASS / FAIL — Issues: [...]
- Layer 2 (N agents): PASS / FAIL — Notes: [...]

## Layer 4 — Cross-Reference Check
- Status: PASS / FAIL
- Issues: [...]

## Layer 5 — Display & UX
- Status: PASS / FAIL
- Issues: [...]

## FINAL VERDICT
- [ ] FULL PASS → Module signed off ✅
- [ ] CONDITIONAL PASS → Open issues: [list] → Fix by: [date]
- [ ] FAIL → Return to: [agent] for: [specific revision]

## Open Questions (carry to next module)
- [question 1]
- [question 2]
```

---

## WHEN TO RUN FULL vs QUICK-RUN

| Situation | Protocol | Layers |
|-----------|----------|--------|
| First 3 modules of any phase | **Full** | All 6 layers |
| R-γ verdict = CONDITIONAL GO or NO-GO | **Full** | All 6 layers |
| Post-fix re-verify after CRITICAL failure | **Full L0–L3** | Layers 0–3 only |
| Routine module, stable process (Phase 2+) | **Quick-Run** | Condensed checklist |
| Matrix nodes (lightweight, Workflow C) | **Quick-Run** | Condensed checklist |
| Emergency hotfix to JSON/graph only | **Targeted** | L0 + L1 + L4.2 only |

**Rule:** When in doubt, run Full. Quick-Run is only for repetitive routine work.

---

## QUICK-RUN CHECKLIST (1-page version)

For fast verification after each module, run this condensed checklist:

```
LAYER 0 — BUILD HEALTH (1 min)
□ npm run build passes
□ No TypeScript errors

LAYER 1 — FILESYSTEM (1 min)
□ 7 required files exist
□ JSON validates (no schema errors)
□ English reports + Vietnamese final

LAYER 2 — PIPELINE (2 min)
□ All dispatched agents delivered
□ Proxy checks: tech-report refs α findings, γ challenges α+β
□ 7-stage coverage documented

LAYER 3 — QUALITY (7-10 min)
□ α: sources ≥10, SOTA 2024-2026 present, no scope creep
□ β: pipeline diagram + tech matrix + ≥2 mini examples
□ γ: formula applied (GO ≧7.0), verdict justified, ≥3 competitors
□ σ: synthesized + JSON valid + graph updated + Vietnamese output

LAYER 4 — CROSS-REFS (2 min)
□ Tech stack consistent α↔β↔JSON
□ Feasibility score consistent γ↔σ↔JSON
□ Graph edges bidirectional (🔴 CRITICAL)
□ No duplicate node IDs

LAYER 5 — DISPLAY (3-5 min)
□ Node visible in Galaxy View
□ Planetary View shows correct sub-nodes (no ghosts)
□ Report Overlay loads + renders correctly
□ Search returns node by name and ID

TOTAL: ~15-20 min per module
```

---

*MODULE-TEST-PROTOCOL v1.1 — MAESTRO Knowledge Graph Platform*
*Maintained by Manager. Update when SOP workflow or acceptance criteria change.*
*Reference: docs/SOP-AGENT-PROCESS.md (workflow) | docs/DATA-SCHEMA.md (schema) | docs/CONVENTIONS.md (standards)*
