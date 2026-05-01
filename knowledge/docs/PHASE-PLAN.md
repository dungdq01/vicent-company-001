# Phase Plan — MAESTRO Knowledge Graph Platform

**Managed by:** Project Manager (Cascade)  
**Updated:** 2026-04-01

---

## PHASE OVERVIEW

```
Phase 0:   Foundation          → Platform skeleton + sample data (2D)   → 1 session   ✅ DONE
Phase 0.5: Graph Overhaul      → Hybrid 3D galaxy + 2D enhanced        → 1 session   ✅ DONE
Phase 1:   First 3 Baselines   → B01, B02, B08 deep research + display → done in batch ✅ DONE
Phase 2:   All 15 Baselines    → Round 1 research complete (15/15)     → 1 batch run  🔄 IN PROGRESS
Phase 2.5: Quality Gate        → Bring ALL baselines to GO (≥7.0)       → Round 2 plan ⏳ PENDING
Phase 3:   Matrix Tier 1       → 12 high-priority matrix cells          → 3 sessions   ⏳ PENDING
Phase 4:   AI Chat + Advanced  → Chatbot, search, learning paths       → 3 sessions   ⏳ PENDING
Phase 5:   Matrix Complete     → Remaining 276 matrix cells             → Ongoing      ⏳ PENDING
```

---

## PHASE 0: FOUNDATION ✅ COMPLETE

> Completed 2026-03-30. See `docs/reports/phase-0-completion.md` and `docs/memory/phase-0-learnings.md`.

---

## PHASE 0.5: GRAPH VISUALIZATION OVERHAUL ✅ COMPLETE

> Completed 2026-03-30. See `docs/reports/phase-0.5-completion.md` and `docs/memory/phase-0.5-learnings.md`.

### Goal
Replace flat 2D graph with Hybrid 3D/2D architecture: Galaxy overview (3D) + Enhanced exploration (2D).

> Decision: See `docs/reports/architecture-decision-001-3d-hybrid.md`

### Architecture

```
Layer 1: GALAXY OVERVIEW (3D)
  ├── react-force-graph-3d + three.js
  ├── Star particle background (THREE.Points, 3000 stars)
  ├── Node glow shells (THREE.SphereGeometry, emissive material)
  ├── Fog for depth (THREE.FogExp2)
  ├── Camera on rails (auto-orbit, constrained — NOT free orbit)
  ├── Click cluster → animated zoom to Layer 2
  └── Mobile: disable 3D, show static hero or skip to Layer 2

Layer 2: EXPLORATION GRAPH (2D Enhanced)
  ├── react-force-graph-2d (existing, enhanced)
  ├── Neo4j-style drag & drop (grab, drag, physics re-simulate, release)
  ├── Obsidian physics (alphaDecay: 0.01, velocityDecay: 0.4, re-heat on drag)
  ├── Dim-on-select (selected node + neighbors bright, rest dimmed)
  ├── Progressive disclosure (click to expand neighbors)
  ├── Zoom-to-node animation (search result → fly camera)
  └── Full text readability, keyboard nav, accessibility
```

### Dependency Graph

```
0.5.1 Install 3D deps + create GalaxyOverview component (R-FE)
  ├──→ 0.5.2 Star field + fog + glow shells (R-FE)
  │     └──→ 0.5.4 Camera on rails + auto-orbit (R-FE)
  ├──→ 0.5.3 Enhance 2D: drag & drop + Obsidian physics (R-FE)
  │     └──→ 0.5.5 Dim-on-select + progressive disclosure (R-FE)
  └──→ 0.5.6 GraphShell: layer manager + transition animation (R-FE)
       └──→ 0.5.7 Mobile detection + fallback (R-FE)
            └──→ 0.5.8 Polish + performance test (R-FE + R-β review)
```

### Deliverables

| # | Deliverable | Owner | Status |
|---|------------|-------|--------|
| 0.5.1 | Install react-force-graph-3d, three.js; create GalaxyOverview.tsx | R-FE | ✅ |
| 0.5.2 | Star field particles + fog + planet nodes (MeshPhong + atmosphere + rings) | R-FE | ✅ |
| 0.5.3 | Enhance ExplorationGraph: drag & drop + Obsidian physics + space theme | R-FE | ✅ |
| 0.5.4 | Camera on rails (constrained auto-orbit, smooth, fly-to-node) | R-FE | ✅ |
| 0.5.5 | Dim-on-select + neighbor highlighting | R-FE | ✅ |
| 0.5.6 | GraphShell: layer manager + fade transition animation | R-FE | ✅ |
| 0.5.7 | Mobile detection: WebGL2 check, serve 2D-only on mobile | R-FE | ✅ |
| 0.5.8 | Polish: node spacing fix, 2D visual consistency, R-β review | R-FE + R-β | ✅ |

### New Packages

```
npm install react-force-graph-3d three @types/three
```

### Exit Criteria

- [ ] Galaxy 3D overview renders with star field, glowing nodes, fog
- [ ] Camera auto-orbits smoothly (no manual navigation needed in 3D)
- [ ] Click cluster in 3D → smooth zoom transition to 2D exploration
- [ ] 2D exploration: nodes are draggable (grab, drag, settle with physics)
- [ ] Dim-on-select works (click node → neighbors highlighted, rest dimmed)
- [ ] Mobile: detects low-end/mobile → serves 2D-only
- [ ] `npx next build` passes with zero errors
- [ ] Performance: 60fps with 35+ nodes on standard laptop

---

## PHASE 0: FOUNDATION ✅ COMPLETE (archived below)

### Goal
Platform chạy được, graph đẹp dark theme, click node thấy detail panel

### Dependency Graph

```
0.1 Next.js init (R-β)
 ├──→ 0.2 Dark theme layout (R-FE)
 │     ├──→ 0.5 Node detail panel (R-FE)
 │     │     └──→ 0.8 Responsive polish (R-FE)
 │     └──→ 0.3 Graph component (R-FE)
 │           ├──→ 0.6 Basic search (R-FE)
 │           └──→ 0.7 Graph controls (R-FE)
 │
 └──→ 0.4 Sample data JSON (R-σ) ──→ [0.3, 0.5 need this data to render]

Critical path: 0.1 → 0.2 → 0.3 → 0.5 → 0.8
Parallel track: 0.4 (can start as soon as 0.1 done)
```

### Deliverables

| # | Deliverable | Owner | Depends On | Status |
|---|------------|-------|-----------|--------|
| 0.1 | Next.js project init (TS, Tailwind, shadcn/ui, deps) | R-β | — | ⬜ |
| 0.2 | Dark theme layout (Header + Main + Sidebar shell) | R-FE | 0.1 | ⬜ |
| 0.3 | Interactive graph component (react-force-graph-2d) | R-FE | 0.1, 0.4 | ⬜ |
| 0.4 | Sample graph data (5 baselines + 3 industries + edges) | R-σ | 0.1 (schema) | ⬜ |
| 0.5 | Node detail panel (click → sidebar shows info) | R-FE | 0.2, 0.4 | ⬜ |
| 0.6 | Basic search (filter nodes by name) | R-FE | 0.3 | ⬜ |
| 0.7 | Graph controls (zoom, pan, filter by category) | R-FE | 0.3 | ⬜ |
| 0.8 | Responsive polish (desktop-first) | R-FE | 0.5, 0.6, 0.7 | ⬜ |

### Agent Assignments
```
Manager (Cascade)  → Architecture, setup, review
R-β (Dr. Praxis)   → Next.js setup (0.1), code review (all)
R-FE               → Frontend implementation (0.2-0.8)
R-σ (Ms. Scribe)   → Sample data creation (0.4)
```

### Exit Criteria
- [ ] `npm run dev` starts without errors
- [ ] Graph renders with 8+ sample nodes
- [ ] Click node → detail panel opens with content
- [ ] Search filters nodes
- [ ] Dark theme looks professional

---

## PHASE 1: FIRST 3 BASELINES ✅ COMPLETE

> Completed 2026-04-01. B01, B02, B08 researched as part of the full 15-module Round 1 batch.
> Round 1 reports: `docs/reports/B01/`, `docs/reports/B02/`, `docs/reports/B08/`

### Goal
3 baseline modules researched at L3 depth, displayed beautifully on platform

### Modules

| Module | Name | Why First |
|--------|------|-----------|
| B01 | Forecasting & Time Series | Most universal, Smartlog home turf |
| B02 | Document Intelligence | High demand, proven use cases |
| B08 | Conversational AI & Chatbots | AI chatbot trend, relevant to platform itself |

### Multi-Layer Research Model (per module)

```
PER MODULE (×3: B01, B02, B08):

  LAYER 1 (sequential):          LAYER 2 (parallel, same time):
  ┌──────────────────────┐       ┌─────────────────────────────┐
  │ 1.1 α Research       │       │ 1.P1  R-Dxx domain-brief   │
  │   ↓                  │       │ 1.P2  R-MLE ml-eng-notes   │
  │ 1.2 β Tech Analysis  │  ←→   │ 1.P3  R-DE  pipeline-notes │
  │   ↓                  │       │ 1.P4  R-FE  ui-notes       │
  │ 1.3 γ Evaluation     │       │ 1.P5  R-PM  project-notes  │
  └──────────┬───────────┘       └─────────────┬───────────────┘
             │                                 │
             └────────────┬────────────────────┘
                          ↓
                 LAYER 3: σ Consolidation
                 1.4 final-report.md
                 1.5 {module}_draft.json (L3)
                 1.6 graph.json update
                 1.7 memory file
                          ↓
                 STEP A5: R-BE Normalization
                 1.8 {module}.json (PRODUCTION READY)
                     normalizeNode() validates schema
                          ↓
                 1.9 R-FE verify display
                     Galaxy → Planetary → Report Overlay

MODULE SEQUENCE (overlapping):
  T1: α B01 + Layer2 B01
  T2: β B01 + α B02 + Layer2 B02
  T3: γ B01 + β B02 + α B08 + Layer2 B08
  T4: σ B01 + γ B02 + β B08
  T5: σ B02 + γ B08
  T6: σ B08
  → 6 time slots (not 12). PhDs and practical roles stay busy.
```

### Agent Assignments — Phase 1

```
LAYER 1 — Academic (3 PhDs, always present, sequential per module):
  R-α (Dr. Archon)    → SOTA, algorithms, math, papers
  R-β (Dr. Praxis)    → Architecture, pipeline design, code patterns
  R-γ (Dr. Sentinel)  → Feasibility, market, competitive, risk

LAYER 2 — Practical (Manager dynamically selects from FULL catalog):
  Source: .agents/ (47 roles across 4 tiers)
  Reference: agent-team-config.md → Section IV.2 (baseline→role mapping)
  Each selected role researches ONLY their own expertise for this module.
  Output: docs/reports/{MODULE_ID}/{ROLE_ID}-notes.md per role
  Typical: 3-8 roles per module (varies by module type)

LAYER 3 — Consolidation (always present):
  R-σ (Ms. Scribe)    → Synthesize ALL layers → report + JSON + memory
```

### Deliverables per Module

| # | Layer | Deliverable | Owner | Depends On |
|---|-------|------------|-------|-----------|
| 1.1 | L1 | research-report.md | α | Phase 0 complete |
| 1.2 | L1 | tech-report.md | β | 1.1 |
| 1.3 | L1 | feasibility-report.md | γ | 1.1 + 1.2 |
| 1.Px | L2 | {ROLE_ID}-notes.md (×N, varies) | Manager-selected roles | Phase 0 complete |
| 1.4 | L3 | final-report.md | σ | 1.1-1.3 + all L2 notes |
| 1.5 | L3 | {module}.json (L3) | σ | 1.4 |
| 1.6 | L3 | graph.json updated | σ | 1.5 |
| 1.7 | L3 | memory file | σ | 1.4 |
| 1.8 | — | Node renders on platform | R-FE | 1.5 |

### Exit Criteria
- [ ] 3 modules at L3 depth (full checklist passed)
- [ ] Each module has BOTH academic reports AND practical notes in docs/reports/
- [ ] Graph shows enriched nodes with depth indicator
- [ ] Detail panel shows all tabs (overview, tech, pipeline, cases, resources)
- [ ] Memory files created per module

---

## PHASE 2: ALL 15 BASELINES + INDUSTRY PROFILES 🔄 IN PROGRESS

> **Baselines (Round 1):** All 15 modules researched 2026-04-01. 6 at GO (≥7.0), 9 need Round 2.
> **Industry nodes:** Not started. Begins after Phase 2.5 complete.
> See `docs/round-2-research-plan.md` for baseline quality status.

### Goal
Complete baseline coverage + basic industry profiles

### Modules

| Batch | Modules | Priority |
|-------|---------|----------|
| 2A | B03 (Computer Vision), B04 (NLP), B07 (Anomaly Detection) | High |
| 2B | B05 (Recommendation), B06 (Optimization), B12 (Search & RAG) | High |
| 2C | B09 (Generative AI), B10 (Agentic AI), B11 (Knowledge Graph) | Medium |
| 2D | B13 (Tabular ML), B14 (Speech & Audio), B15 (Simulation) | Medium |

Plus 20 Industry Profile nodes at L2 depth.

### Agent Assignments
```
Same as Phase 1 per module
+ Additional: Ms. Scribe (σ) creates Industry nodes (L2) in parallel
```

### Exit Criteria
- [x] All 15 baselines researched at Round 1
- [ ] All 15 baselines at GO (score ≥7.0) ← Phase 2.5
- [ ] All 20 industries at L2 depth
- [ ] 35 nodes total on graph
- [ ] Navigation between related nodes works
- [ ] All reports filed

---

## PHASE 2.5: QUALITY GATE — ROUND 2 RE-RESEARCH ⏳ PENDING

> **Goal:** Bring all 9 under-7.0 baseline modules to GO (≥7.0) using Workflow D.
> **Protocol:** `docs/SOP-AGENT-PROCESS.md §5.5 (Workflow D)`
> **Module assignments:** `docs/round-2-research-plan.md`

### Scope

| Tier | Modules | Count | Status |
|------|---------|-------|--------|
| Tier A (full re-run) | B10 (5.1), B11 (5.5), B15 (5.6) | 3 | ⏳ Pending |
| Tier B (targeted) | B14 (6.4), B05 (6.6) | 2 | ⏳ Pending |
| Tier C (score-only) | B01 (6.9), B02 (bug), B03 (6.8), B04 (6.8) | 4 | ⏳ Pending |
| No re-run needed | B06 (8.4), B07 (7.3), B08 (7.0), B09 (7.0), B12 (8.0), B13 (8.5) | 6 | ✅ GO |

### Execution Order
```
Phase 1: Tier C quick wins — B02 (weight fix) → B01, B03, B04 (re-score)
Phase 2: Tier B targeted  — B14, B05
Phase 3: Tier A full run  — B15, B11, B10
```

### Exit Criteria
- [ ] All 15 baselines at score ≥7.0
- [ ] MODULE-TEST-PROTOCOL passes per tier scope (Workflow D §D.7)
- [ ] `docs/round-2-research-plan.md` progress tracker fully checked
- [ ] All JSON scores updated in `data/baselines/`

---

## PHASE 3: MATRIX NODES (Tier 1)

### Goal
12 high-priority intersection nodes (Baseline × Industry)

### Priority Matrix Cells

| # | Cell | Name | Why Priority |
|---|------|------|-------------|
| 1 | B01×I01 | Retail Demand Forecasting | Highest demand |
| 2 | B01×I06 | Logistics Shipment Forecasting | Smartlog core |
| 3 | B02×I02 | Banking KYC Document Processing | High value |
| 4 | B02×I06 | Logistics Bill of Lading OCR | Smartlog core |
| 5 | B03×I04 | Manufacturing Defect Detection | Classic CV use case |
| 6 | B07×I02 | Banking Fraud Detection | Critical industry need |
| 7 | B08×I03 | Healthcare Patient Chatbot | Growing market |
| 8 | B08×I09 | Education Tutoring Bot | High demand |
| 9 | B05×I01 | Retail Product Recommendation | Proven ROI |
| 10 | B06×I06 | Logistics Route Optimization | Smartlog core |
| 11 | B12×I11 | Legal RAG Search | Emerging market |
| 12 | B10×I06 | SC Autopilot (Agentic) | Moonshot |

### Workflow (lighter than full baseline)
```
For each matrix cell:
  Dr. Archon (α)   → Industry-specific adaptation research
  Dr. Sentinel (γ)  → Market fit assessment
  Ms. Scribe (σ)    → Create matrix node JSON
  (Dr. Praxis β not needed unless novel tech required)
```

### Exit Criteria
- [ ] 12 matrix nodes created
- [ ] Graph shows baseline→matrix→industry connections
- [ ] Click matrix node shows industry-specific adaptation details

---

## PHASE 4: AI CHAT & ADVANCED FEATURES

### Goal
AI chatbot, advanced search, UX improvements

### Features

| # | Feature | Owner |
|---|---------|-------|
| 4.1 | AI Chat panel (RAG over knowledge nodes) | R-BE + R-FE |
| 4.2 | Advanced search with filters | R-FE |
| 4.3 | Node comparison (side-by-side) | R-FE |
| 4.4 | Learning paths (suggested sequences) | R-α + R-FE |
| 4.5 | Node depth indicator on graph | R-FE |
| 4.6 | Export node as PDF/Markdown | R-FE |
| 4.7 | Graph legend & tutorial | R-FE |

### Agent Assignments
```
R-BE              → AI chat API (Vercel AI SDK + RAG)
R-FE              → Chat UI, advanced search, comparison
Dr. Archon (α)    → Design learning paths
Dr. Praxis (β)    → RAG architecture review
Ms. Scribe (σ)    → User documentation
```

---

## PHASE 5: MATRIX COMPLETE (Ongoing)

### Goal
Fill remaining 276 matrix cells (Tier 2 + Tier 3)

### Approach
```
Tier 2 (24 cells): L2 depth — moderate research
Tier 3 (108 cells): L1 depth — skeleton with key points
Prioritize by: Market demand × Smartlog relevance
```

---

## TRACKING

### Phase Status Dashboard

| Phase | Status | Progress | Nodes Created |
|-------|--------|----------|--------------|
| Phase 0 | ✅ Complete | 100% | 8 |
| Phase 0.5 | ✅ Complete | 100% | — (viz only) |
| Phase 1 | ✅ Complete | 100% | 3 (B01, B02, B08 at L3 R1) |
| Phase 2 | 🔄 In Progress | 50% (baselines R1 done) | 15 (all baselines at L3 R1) |
| Phase 2.5 | ⏳ Pending | 0% | 0 (waiting Round 2) |
| Phase 3 | ⬜ Not Started | 0% | 0 |
| Phase 4 | ⬜ Not Started | 0% | 0 |
| Phase 5 | ⬜ Not Started | 0% | 0 |

### Node Count Target

| Phase | Baselines | Industries | Matrix | Total |
|-------|-----------|------------|--------|-------|
| Phase 0 | 5 (skeleton) | 3 (skeleton) | 0 | 8 |
| Phase 1 | 3 (L3) | 0 | 0 | 11 |
| Phase 2 | 15 (L3) | 20 (L2) | 0 | 35 |
| Phase 3 | 15 | 20 | 24 (L2) | 59 |
| Phase 4 | 15 | 20 | 24 | 59 + features |
| Phase 5 | 15 | 20 | 300 | 335 |

---

*Phase Plan — MAESTRO Knowledge Graph Platform*  
*Updated by Project Manager after each phase completion*
