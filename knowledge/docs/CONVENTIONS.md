# Conventions & Glossary — MAESTRO Knowledge Graph Platform

**Version:** 1.0  
**Rule:** ALL agents, ALL files MUST follow these conventions. No exceptions.

---

## 1. ID FORMAT — Always 2 Digits

```
CORRECT          INCORRECT
─────────────────────────────
B01              B1
B12              B_12
I01              I1
I12              IND_01
B01-I01          B1-I1
B01-I06          B01_I06
C01              C1
D01              D1
```

**Rule:** Always use 2-digit zero-padded IDs. `B01` not `B1`. `I06` not `I6`.

---

## 2. GLOSSARY — Term Definitions

| Term | Definition | Example | DO NOT confuse with |
|------|-----------|---------|-------------------|
| **Baseline** | 1 of 15 core AI capability modules | B01 Forecasting | "module" (too generic) |
| **Industry** | 1 of 20 target industry verticals | I01 Retail | "vertical" (same thing, use "industry") |
| **Matrix Node** | Intersection of Baseline × Industry | B01-I01 Retail Forecasting | "solution" (old term, deprecated) |
| **Node** | Any entity in the knowledge graph | B01, I01, B01-I01 | "card" or "page" |
| **Edge** | Connection between 2 nodes | B01 → B07 (related) | "link" or "relationship" (use "edge" for graph, "relationship" for meaning) |
| **Module** | Generic term for any researched unit | B01, I01, B01-I01 | Prefer specific: "baseline", "industry", "matrix node" |
| **Depth Level** | Research depth: L1 (skeleton), L2 (overview), L3 (deep) | "B01 at L3" | "phase" (phase = project timeline, depth = content quality) |
| **Pipeline** | Data/ML processing flow for a baseline | Ingest→Process→Train→Serve | "workflow" (workflow = agent work process) |
| **Workflow** | Agent work process (SOP steps) | α→β→γ→σ | "pipeline" (pipeline = technical data flow) |
| **Playbook** | Complete implementation guide for a module | B01 Forecasting Playbook | Deprecated in this project — use "knowledge node" |

---

## 3. FILE NAMING

### 3.1 Report Files
```
Pattern:  docs/reports/{MODULE_ID}/{report-type}.md
Examples:
  docs/reports/B01/research-report.md      ✅
  docs/reports/B01/tech-report.md          ✅
  docs/reports/B01-I01/final-report.md     ✅
  docs/reports/b01/research-report.md      ❌ (lowercase ID)
  docs/reports/B1/research-report.md       ❌ (missing zero)
```

### 3.2 Knowledge Node JSON
```
Pattern:  data/{category}/{MODULE_ID}-{slug}.json
Examples:
  data/baselines/B01-forecasting.json              ✅
  data/industries/I01-retail.json                   ✅
  data/matrix/B01-I01-retail-forecasting.json       ✅
  data/baselines/B1-forecasting.json                ❌ (B1 not B01)
  data/baselines/B01_forecasting.json               ❌ (underscore)
```

### 3.3 Memory Files
```
Pattern:  docs/memory/{MODULE_ID}-learnings.md
Examples:
  docs/memory/B01-learnings.md             ✅
  docs/memory/matrix-insights.md           ✅ (special aggregate file)
```

### 3.4 Code Files
```
Components:  PascalCase.tsx          KnowledgeGraph.tsx     ✅
Hooks:       camelCase.ts            useGraphStore.ts       ✅
Utils:       camelCase.ts            graphUtils.ts          ✅
Types:       camelCase.ts            node.ts                ✅
Styles:      lowercase.css           globals.css            ✅
```

---

## 4. WRITING STYLE

### In Reports
```
CORRECT:
- "B01 Forecasting & Time Series"         (ID + full name, first mention)
- "B01" or "Forecasting module"            (subsequent mentions)
- "LightGBM outperforms Prophet at scale"  (specific, evidence-based)

INCORRECT:
- "the forecasting thing"                  (vague)
- "it's probably better"                   (no evidence)
- "B1"                                     (wrong ID format)
```

### Technical Terms
```
Always use:              NOT:
─────────────────────────────────────
"time series"            "timeseries" or "Time Series" (unless title)
"machine learning"       "ML" (spell out first, then abbreviate)
"deep learning"          "DL" (spell out first, then abbreviate)
"state of the art"       "SOTA" (spell out first, then abbreviate)
"knowledge graph"        "KG" (spell out first)
```

### Abbreviation Rules
First mention in any document: spell out + abbreviation in parentheses.
```
"Machine Learning (ML) models are used..."
Then: "ML models perform..."
```

---

## 5. BASELINE REGISTRY (Canonical Names)

| ID | Canonical Name | Short Name |
|----|---------------|------------|
| B01 | Forecasting & Time Series | Forecasting |
| B02 | Document Intelligence | Doc Intelligence |
| B03 | Computer Vision | Computer Vision |
| B04 | NLP & Language AI | NLP |
| B05 | Recommendation Systems | Recommendation |
| B06 | Optimization & Operations Research | Optimization |
| B07 | Anomaly Detection & Monitoring | Anomaly Detection |
| B08 | Conversational AI & Chatbots | Conversational AI |
| B09 | Generative AI & Content | Generative AI |
| B10 | Agentic AI & Autonomous Systems | Agentic AI |
| B11 | Knowledge Graph & Semantic AI | Knowledge Graph |
| B12 | Search & RAG | Search & RAG |
| B13 | Tabular ML & Predictive Analytics | Tabular ML |
| B14 | Speech & Audio AI | Speech & Audio |
| B15 | Simulation & Digital Twin | Simulation |

### §5.1 Layer Architecture
Baselines are functionally grouped into 4 layers (L1 Analytical, L2 Perception, L3 Generative/Knowledge, L4 Orchestration). See `docs/AI-CAPABILITY-TAXONOMY.md` → "Layer Architecture v2" for full mapping, cross-layer notes, and decision boundaries.

---

## 6. INDUSTRY REGISTRY (Canonical Names)

| ID | Canonical Name | Short Name |
|----|---------------|------------|
| I01 | Retail & E-commerce | Retail |
| I02 | Finance & Banking | Finance |
| I03 | Healthcare & Hospital | Healthcare |
| I04 | Manufacturing | Manufacturing |
| I05 | Agriculture & AgriTech | Agriculture |
| I06 | Logistics & Supply Chain | Logistics |
| I07 | Energy & Utilities | Energy |
| I08 | Construction & Built Environment | Construction |
| I09 | Education | Education |
| I10 | Telecom | Telecom |
| I11 | Legal & Government | Legal |
| I12 | Media & Entertainment | Media |
| I13 | Transportation & Mobility | Transportation |
| I14 | Food & Beverage / Hospitality | F&B / Hospitality |
| I15 | Insurance | Insurance |
| I16 | Pharmaceutical & Life Sciences | Pharma |
| I17 | Gaming & Interactive | Gaming |
| I18 | Marketing & Advertising | Marketing |
| I19 | HR & Workforce Management | HR |
| I20 | Cybersecurity & IT Operations | Cybersecurity |

---

## 7. COLOR PALETTE (Graph Visualization — Neon Sci-Fi Theme)

| Category | Color | Hex | Usage |
|----------|-------|-----|-------|
| Accent Green (primary) | Neon Green | `#00FF88` | Primary accent, glow effects, active states |
| Accent Cyan | Cyan | `#00E5FF` | Secondary accent, section labels |
| Accent Gold | Gold | `#FFD700` | Consolidation nodes, warnings |
| Background | Dark Green-Black | `#010A05` | Page/scene background |
| Card Background | Dark Forest | `#081210` | Card/panel backgrounds |
| Text Primary | White-Green | `rgba(232,245,255,0.92)` | Headings, important text |
| Text Secondary | Dim Green | `rgba(200,240,220,0.55)` | Body text |
| Text Dim | Muted | `rgba(180,220,200,0.30)` | Labels, placeholders |
| Border | Green Glow | `rgba(0,255,136,0.10)` | Card borders |
| Border Hover | Green Bright | `rgba(0,255,136,0.35)` | Hover borders |
| Glow | Green Shadow | `0 0 12px rgba(0,255,136,0.35)` | Box-shadow glow effects |
| Edge default | Green | `rgba(0,255,136,0.30)` | Graph edges |
| Edge particles | Neon Green | `rgba(0,255,136,0.60)` | Link directional particles |

### Sub-Node (Planetary View) Colors
| Layer | Color | Usage |
|-------|-------|-------|
| Academic (α,β,γ) | `#00FF88` / `#00E5FF` / `#FFD700` | Inner orbit nodes |
| Practical (R-*) | `#00E5FF` variants | Outer orbit nodes |
| Consolidation (σ) | `#FFD700` | Bottom special node |
| Complete status | Full brightness + glow | Active nodes |
| Pending status | `#333333` dim + dashed edges | Inactive nodes |

---

## 8. DOCUMENT CROSS-REFERENCES

When referencing another doc, use relative path from project root:

```
CORRECT:
  "See docs/SOP-AGENT-PROCESS.md → Step A1"
  "Per docs/DATA-SCHEMA.md Section 1.5"
  "As defined in docs/CONVENTIONS.md Section 2"

INCORRECT:
  "See the SOP"                    (which SOP? be specific)
  "Check the schema"               (which schema? link it)
  "As mentioned earlier"           (where? be explicit)
```

---

## 9. LANGUAGE POLICY

### 9.1 Two-Phase Language Model

**Research Phase (English) → Translation Phase (Vietnamese)**

Pipeline uses a two-phase language model to maximize research quality:

| Phase | Who | Language | Reason |
|-------|-----|----------|--------|
| Research & Analysis | R-α, R-β, R-γ, all Tier 2/3/4 agents | **English** | 95% of papers, benchmarks, docs are English. LLM reasoning depth is higher in English. |
| Final Output | R-σ (Ms. Scribe) only | **Vietnamese** | End users are Vietnamese enterprises — final reports MUST be in Vietnamese. |

### 9.2 Rules Per Agent Type

**Research Agents (R-α, R-β, R-γ) and all Tier 2/3/4 agents:**
- Write ALL intermediate output (reports, notes, analysis) in **English**
- Do NOT translate — that is R-σ's job
- Technical terms, code, variable names remain in English
- Output quality > Output language at this stage

**R-σ (Ms. Scribe) — sole translation layer:**
- Receives English inputs from all agents, outputs Vietnamese final deliverables
- Final deliverables (VIETNAMESE): `final-report.md`, JSON content fields, memory files
- Intermediate deliverables in `docs/reports/` remain in English (research-report, tech-report, feasibility-report, {ROLE_ID}-notes)
- Technical terms may stay in English with Vietnamese explanation on first mention: e.g., "Machine Learning (Học máy)"
- Knowledge node JSON fields (description, overview, concepts, etc.) MUST be in Vietnamese
- Code snippets and variable names remain in English
- File names, IDs, structural elements remain in English (B01, R-alpha, etc.)

**Target audience:** Vietnamese enterprises and AI teams
**Tone:** Professional, educational, accessible to Vietnamese business stakeholders

---

*Conventions v1.0 — MAESTRO Knowledge Graph Platform*
*All agents MUST follow. Violations = output rejected.*
