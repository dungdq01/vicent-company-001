# MAESTRO Knowledge Graph Platform — Master Architecture

**Version:** 1.0  
**Role:** Manager / Project Lead  
**Date:** 2026-03-30  
**Status:** Active Blueprint  

> **Mọi Agent PHẢI đọc file này trước khi bắt đầu bất kỳ task nào.**  
> Đây là Single Source of Truth cho toàn bộ dự án.

---

## 1. VISION & SCOPE

### 1.1 What We're Building

Một **Interactive Knowledge Graph Platform** — web app cho phép user:

1. **Explore** toàn bộ kiến thức AI thông qua visual graph (nodes + edges)
2. **Click vào node** → xem dashboard chi tiết: concepts, tech stack, pipeline, use cases, case studies
3. **Navigate** giữa các nodes liên quan (related knowledge)
4. **Chat với AI** để hỏi đáp về bất kỳ node/topic nào
5. **Drill down** khi cần làm dự án thực tế

### 1.2 What We're NOT Building

- ❌ Không phải production AI system (chưa cần deploy models)
- ❌ Không phải project management tool
- ❌ Không phải code generator

### 1.3 Core Concept — 300 Matrix

```
15 AI Capabilities (B01-B15) × 20 Industries (I01-I20) = 300 Knowledge Nodes

Mỗi node = 1 "knowledge card" chứa:
├── Overview & Concepts
├── Algorithms & Methods  
├── Tech Stack & Tools
├── Pipeline Architecture
├── Industry Use Cases
├── Case Studies & References
├── Learning Resources
└── Related Nodes (edges trong graph)
```

### 1.4 UI Reference — Three-Layer View Architecture

**Three view modes (drill-down navigation):**

**View 1 — Galaxy View (3D, Three.js):**
- 3D galaxy-inspired visualization (WebGL, Three.js)
- Auto-rotate camera on rails (constrained, NOT free orbit)
- Star particle background (ShootingStars), GridFloor, glow shells on nodes, fog for depth
- Nodes as luminous spheres, clusters as constellations
- Click node → transition to Planetary View
- Purpose: engagement, orientation, brand identity

**View 2 — Planetary View (Canvas 2D orbital):**
- PlanetaryView component: 2D orbital layout using Canvas
- Parent node at center, sub-nodes orbiting in layers:
  - Inner orbit: 3 academic sub-nodes (α Research, β Tech, γ Feasibility)
  - Outer orbit: 9 practical sub-nodes (R-MLE, R-DE, R-DA, R-BE, R-DO, R-QA, R-D06, R-SA, R-FE)
  - Bottom: 1 consolidation sub-node (σ Final Report)
- Each module has **13 sub-nodes** (3 academic + 9 practical + 1 consolidation)
- Click sub-node → opens SubNodeDetail panel / Report Overlay
- Back button → returns to Galaxy View

**View 3 — Report Overlay (center card carousel):**
- ReportOverlay component: center-screen card with markdown content
- MarkdownRenderer for rich report display
- Navigate between reports within a module
- Close → returns to Planetary View

**Shared:**
- **Neon green sci-fi dark theme** (background #010A05)
- **Color palette:** Neon Green `#00FF88` (primary), Cyan `#00E5FF` (secondary), Gold `#FFD700` (consolidation)
- **Search + Filter** capabilities
- **Zoom/Pan** controls
- **AI Chat panel** cho Q&A (Phase 4)
- **Mobile fallback**: 2D-only on mobile/low-end devices

> **Decision:** See `docs/reports/architecture-decision-001-3d-hybrid.md` for full rationale.

---

## 2. TECH STACK — QUYẾT ĐỊNH CUỐI CÙNG

```yaml
frontend:
  framework: "Next.js 16 (App Router, Turbopack)"
  language: "TypeScript"
  styling: "Tailwind CSS"
  ui_components: "shadcn/ui"
  graph_3d_galaxy: "Three.js (3D galaxy overview, ShootingStars, GridFloor)"
  graph_2d_planetary: "Canvas 2D (PlanetaryView — orbital sub-node layout)"
  graph_effects: "Three.js — star particles, glow shells, fog, shooting stars (galaxy aesthetic)"
  icons: "Lucide React"
  state_management: "Zustand"
  markdown_rendering: "react-markdown + rehype-raw"
  
backend:
  api: "Next.js API Routes (App Router)"
  database: "JSON files (Phase 1) → PostgreSQL + pgvector (Phase 3+)"
  ai_chat: "OpenAI API / Claude API (via Vercel AI SDK)"
  search: "Fuse.js (client-side Phase 1) → Elasticsearch (Phase 3+)"

data:
  knowledge_nodes: "JSON/YAML files in /data directory"
  graph_structure: "JSON adjacency list"
  
deployment:
  platform: "Vercel (Phase 1) → Docker + K8s (Phase 4)"
  ci_cd: "GitHub Actions"

dev_tools:
  package_manager: "npm"
  linting: "ESLint + Prettier"
  testing: "Vitest + Playwright"
```

### 2.1 Why These Choices

| Decision | Rationale |
|----------|-----------|
| Next.js 16 | SSR + API routes in one, Turbopack fast dev, App Router |
| Three.js | Galaxy 3D overview + effects: star field, shooting stars, grid floor, glow shells, fog |
| Canvas 2D | PlanetaryView: orbital sub-node layout, click-to-drill-down to reports |
| JSON files for data | Simple start, easy to migrate later, Git-trackable |
| Zustand | Lightweight state management, perfect for graph state |
| shadcn/ui | Beautiful, accessible, customizable components |
| Tailwind | Rapid UI development, consistent design system |

---

## 3. PROJECT STRUCTURE

```
maestro-knowledge-graph/
├── docs/                           # Architecture & standards
│   ├── MASTER-ARCHITECTURE.md      # THIS FILE — master blueprint
│   ├── AGENT-WORKFLOW.md           # Agent work standards
│   ├── DATA-SCHEMA.md              # Knowledge node schema
│   ├── PHASE-PLAN.md               # Detailed phase breakdown
│   └── reports/                    # Agent reports per module
│       └── {module-id}/
│           ├── research-report.md  # Dr. Archon output
│           ├── tech-report.md      # Dr. Praxis output
│           ├── feasibility.md      # Dr. Sentinel output
│           └── final-report.md     # Ms. Scribe consolidated
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (dark theme)
│   │   ├── page.tsx                # Home — full graph view
│   │   ├── node/[id]/page.tsx      # Node detail page
│   │   ├── chat/page.tsx           # AI Chat page
│   │   └── api/                    # API routes
│   │       ├── nodes/route.ts      # GET nodes, search
│   │       ├── graph/route.ts      # GET graph structure
│   │       └── chat/route.ts       # POST AI chat
│   │
│   │       ├── nodes/[id]/
│   │       │   └── reports/
│   │       │       ├── route.ts        # GET /api/nodes/[id]/reports → file list
│   │       │       └── [filename]/
│   │       │           └── route.ts    # GET /api/nodes/[id]/reports/[filename] → content
│   │
│   ├── components/
│   │   ├── graph/                  # Graph visualization (3-layer views)
│   │   │   ├── GalaxyOverview.tsx  # View 1: 3D galaxy (Three.js)
│   │   │   ├── PlanetaryView.tsx   # View 2: 2D orbital sub-node layout (Canvas)
│   │   │   ├── ReportOverlay.tsx   # View 3: center card carousel for reports
│   │   │   ├── SubNodeDetail.tsx   # Sub-node detail panel
│   │   │   ├── GraphShell.tsx      # View manager + transition animation
│   │   │   ├── GraphControls.tsx   # Zoom, filter, search
│   │   │   ├── NodeTooltip.tsx     # Hover tooltip
│   │   │   ├── GridFloor.tsx       # 3D grid floor effect
│   │   │   ├── ShootingStars.tsx   # Shooting star particle effect
│   │   │   └── MarkdownRenderer.tsx# Rich markdown display for reports
│   │   ├── node/                   # Node detail views
│   │   │   ├── NodeDetailPanel.tsx # Left sidebar detail
│   │   │   ├── NodeOverview.tsx    # Overview tab
│   │   │   ├── NodeTechStack.tsx   # Tech stack tab
│   │   │   ├── NodePipeline.tsx    # Pipeline tab
│   │   │   ├── NodeUseCases.tsx    # Use cases tab
│   │   │   └── NodeResources.tsx   # Resources tab
│   │   ├── chat/                   # AI Chat
│   │   │   ├── ChatPanel.tsx
│   │   │   └── ChatMessage.tsx
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── SearchBar.tsx
│   │   └── ui/                     # shadcn/ui components
│   │
│   ├── lib/                        # Utilities
│   │   ├── graph-utils.ts          # Graph data processing
│   │   ├── search.ts               # Search logic
│   │   └── ai-client.ts            # AI chat client
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── graph-store.ts          # Graph state (viewMode, activeParentNode,
│   │   │                           #   selectedSubNodeId, enterPlanetaryView,
│   │   │                           #   exitPlanetaryView)
│   │   └── chat-store.ts           # Chat state
│   │
│   ├── types/                      # TypeScript types
│   │   ├── node.ts                 # KnowledgeNode type
│   │   ├── graph.ts                # Graph types
│   │   └── chat.ts                 # Chat types
│   │
│   └── styles/
│       └── globals.css             # Global styles + Tailwind
│
├── data/                           # Knowledge content (JSON/YAML)
│   ├── graph.json                  # Graph structure (nodes + edges)
│   ├── baselines/                  # B01-B15 baseline modules
│   │   ├── B01-forecasting.json
│   │   ├── B02-document-intelligence.json
│   │   └── ...
│   ├── industries/                 # I01-I20 industry profiles
│   │   ├── I01-retail.json
│   │   └── ...
│   └── matrix/                     # 300 intersection nodes
│       ├── B01-I01-retail-forecasting.json
│       └── ...
│
├── public/                         # Static assets
│   └── images/
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

---

## 4. PHASE PLAN — CHIA NHỎ ĐỂ LÀM

### Phase 0: Foundation (COMPLETE)
**Goal:** Platform skeleton chạy được, có graph đẹp với sample data

```
Deliverables:
├── Next.js project initialized + all configs
├── Dark theme layout (header, sidebar, main area)
├── Interactive graph component (react-force-graph-3d + Canvas 2D)
├── Sample data: 3 baseline nodes + 2 industry nodes + edges
├── Click node → detail panel (basic)
├── Search bar (basic)
└── Responsive design

Agent Team:
├── Manager (YOU/Cascade) — architecture, setup
├── R-β Dr. Praxis — tech implementation
└── R-σ Ms. Scribe — document setup

Duration: 1 session
```

### Phase 1: First 3 Baselines Deep Knowledge
**Goal:** 3 baselines đầu tiên có kiến thức sâu, research kỹ

```
Modules to research:
├── B1: Forecasting & Time Series
├── B2: Document Intelligence
└── B8: Conversational AI & Chatbots

For EACH module:
├── Dr. Archon (α) — Deep research: SOTA, algorithms, papers, trends
├── Dr. Praxis (β) — Tech stack, pipeline design, code patterns
├── Dr. Sentinel (γ) — Feasibility, market analysis, competitive landscape
├── Ms. Scribe (σ) — Consolidate report + populate knowledge node JSON
└── R-FE — Implement node detail views with rich content

Duration: ~3 sessions (1 per module)
```

### Phase 2: Expand to All 15 Baselines
**Goal:** Tất cả 15 baselines có knowledge nodes

```
Modules: B3-B7, B9-B12, B13-B15
Same agent workflow as Phase 1
+ Add industry nodes (I01-I20) basic profiles

New baselines in this phase:
├── B13: Tabular ML & Predictive Analytics
├── B14: Speech & Audio AI
└── B15: Simulation & Digital Twin

Duration: ~5 sessions
```

### Phase 3: Industry × Baseline Matrix
**Goal:** Populate matrix nodes (high-priority intersections first)

```
Priority matrix cells:
├── Tier 1 (12 cells): High-demand combinations
│   ├── B1×I1 (Retail Forecasting)
│   ├── B1×I6 (Logistics Forecasting)
│   ├── B2×I2 (Banking KYC/OCR)
│   ├── B2×I6 (Logistics Documents)
│   ├── B3×I4 (Manufacturing Defect Detection)
│   ├── B7×I2 (Banking Fraud Detection)
│   ├── B8×I3 (Healthcare Chatbot)
│   ├── B8×I9 (Education Tutoring)
│   ├── B5×I1 (Retail Recommendation)
│   ├── B6×I6 (Logistics Route Optimization)
│   ├── B12×I11 (Legal RAG Search)
│   └── B10×I6 (SC Autopilot)
├── Tier 2 (30 cells): Medium demand
└── Tier 3 (138 cells): Complete coverage

Duration: Ongoing (Tier 1 = ~3 sessions)
```

### Phase 4: AI Chat & Advanced Features
**Goal:** AI chatbot, advanced search, user features

```
Features:
├── AI Chat (ask questions about any node)
├── Advanced search + filters
├── Compare nodes side-by-side
├── Learning paths (suggested node sequences)
├── Export/share nodes
└── Database migration (JSON → PostgreSQL)

Duration: ~3 sessions
```

---

## 5. KNOWLEDGE NODE DEPTH LEVELS

Mỗi node sẽ được research theo levels — KHÔNG phải tất cả cần deep research ngay:

```
LEVEL 1 — SKELETON (auto-generated from docs)
├── Name, category, short description
├── Key topics (bullet points)
├── Basic tech stack
└── Related nodes list
→ Effort: 30 min/node | Agent: Ms. Scribe solo

LEVEL 2 — OVERVIEW (light research)  
├── Everything in L1
├── Expanded concepts (1-2 paragraphs each)
├── Complete tech stack with reasons
├── Basic pipeline diagram
├── 3-5 use cases
└── 5-10 learning resources
→ Effort: 2 hours/node | Agent: α + σ

LEVEL 3 — DEEP KNOWLEDGE (full research cycle)
├── Everything in L2
├── SOTA analysis (latest papers, trends)
├── Detailed algorithm explanations
├── Complete pipeline with code patterns
├── Industry-specific adaptations
├── Case studies with benchmarks
├── Competitive landscape
├── Best practices & anti-patterns
├── Feasibility scores
└── Production considerations
→ Effort: 1 day/node | Agent: Full team (α + β + γ + σ)
```

---

## 6. AGENT TEAM — ROLES & RESPONSIBILITIES

### 6.1 Permanent Research Team

| Agent | Role | Primary Focus |
|-------|------|--------------|
| **Dr. Archon (α)** | Research Lead | SOTA research, algorithms, concepts, cross-domain insights |
| **Dr. Praxis (β)** | Engineering Lead | Tech stack, pipeline design, code patterns, production readiness |
| **Dr. Sentinel (γ)** | Evaluation Lead | Feasibility, market analysis, competitive landscape, risk assessment |
| **Ms. Scribe (σ)** | Documentation Lead | Consolidate reports, populate node data, maintain quality |

### 6.2 Engineering Team (Phase 0-1)

| Agent | Role | Focus |
|-------|------|-------|
| **R-FE** | Frontend Engineer | Graph UI, node detail views, chat UI |
| **R-BE** | Backend Engineer | API routes, data layer, search |

### 6.3 Agent Assignment Per Task Type

```
TASK: Research a new knowledge module (L3 depth)
═══════════════════════════════════════════════
Step A1: Dr. Archon (α) — SOTA, algorithms, math, papers → research-report.md
Step A2: Dr. Praxis (β) — Tech stack, pipeline, code patterns → tech-report.md
Step A3: Dr. Sentinel (γ) — Feasibility, market, risk → feasibility-report.md
  [Layer 2 runs in parallel: Manager-selected roles → {ROLE_ID}-notes.md]
Step A4: Ms. Scribe (σ) — Consolidate ALL → final-report.md + draft.json
Step A5: R-BE — Normalize draft.json → data/{type}/{id}.json (PRODUCTION READY)
         Implementation: src/lib/normalize-node.ts → normalizeNode()
         API safety net: src/app/api/nodes/[id]/route.ts (auto-runs on every response)
Step A6: R-FE — Verify display on platform (Galaxy → Planetary → Report)

TASK: Build a new UI component
═══════════════════════════════
Step 1: Manager — Define requirements
Step 2: R-FE — Implement
Step 3: Dr. Praxis (β) — Code review
Step 4: Ms. Scribe (σ) — Document

TASK: Populate matrix cell (Baseline × Industry)
═════════════════════════════════════════════════
Step 1: Dr. Archon (α) — Research industry-specific adaptation
Step 2: Dr. Sentinel (γ) — Market fit & feasibility
Step 3: Ms. Scribe (σ) — Write node JSON
```

---

## 7. STANDARDS & CONVENTIONS

### 7.1 File Naming
```
Baselines:  B{XX}-{slug}.json        → B01-forecasting.json
Industries: I{XX}-{slug}.json        → I01-retail.json
Matrix:     B{XX}-I{XX}-{slug}.json  → B01-I01-retail-forecasting.json
Reports:    {module-id}/report.md     → B01/final-report.md
```

### 7.2 Code Style
- **TypeScript** strict mode
- **Components**: PascalCase, one component per file
- **Hooks/Utils**: camelCase
- **CSS**: Tailwind utility classes, no custom CSS unless necessary
- **Imports**: absolute paths via `@/` alias

### 7.3 Git Commit Convention
```
feat: add knowledge graph component
fix: resolve node click handler
data: add B01 forecasting knowledge node
docs: update architecture document
style: improve dark theme colors
refactor: extract graph utils
```

### 7.4 Report Requirements

Sau mỗi module research (L3 depth), team PHẢI produce:

```markdown
# Module Report: {MODULE_NAME}
## Date: YYYY-MM-DD
## Agents Involved: α, β, γ, σ

### 1. Research Summary (Dr. Archon)
- SOTA findings
- Key algorithms & methods
- Emerging trends

### 2. Technical Implementation (Dr. Praxis)
- Recommended tech stack
- Pipeline architecture
- Code patterns & templates
- Production considerations

### 3. Feasibility Assessment (Dr. Sentinel)
- Technical feasibility: X/10
- Market demand: X/10
- Data availability: X/10
- Risk factors
- Competitive landscape

### 4. Consolidated Knowledge Node (Ms. Scribe)
- Final node JSON created: YES/NO
- Quality checklist:
  - [ ] All sections populated
  - [ ] Tech stack verified
  - [ ] Pipeline diagram included
  - [ ] Use cases with real examples
  - [ ] Resources with valid links
  - [ ] Related nodes mapped

### 5. Open Questions / Next Steps
```

---

## 8. DATA FLOW

```
Research Process:
  Web Search + Docs → Dr. Archon (α) analyzes
                    → Dr. Praxis (β) validates tech
                    → Dr. Sentinel (γ) evaluates
                    → Ms. Scribe (σ) consolidates
                    → JSON knowledge node file
                    → Platform displays in graph

User Flow:
  User opens platform → Sees interactive graph
                     → Clicks node → Detail panel opens
                     → Reads knowledge (tabs: overview, tech, pipeline, cases)
                     → Navigates to related nodes
                     → Uses AI chat for Q&A
```

---

## 9. SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Phase 0 completion | Graph renders with 5+ sample nodes |
| Phase 1 completion | 3 baselines at L3 depth, viewable on platform |
| Node quality score | Each L3 node passes full checklist |
| Platform performance | Graph renders < 2s for 50+ nodes |
| Search relevance | Top 3 results contain target node |
| User experience | Click-to-detail < 500ms |

---

*Master Architecture — MAESTRO Knowledge Graph Platform*  
*Maintained by Project Manager (Cascade)*  
*All agents MUST follow this blueprint.*
