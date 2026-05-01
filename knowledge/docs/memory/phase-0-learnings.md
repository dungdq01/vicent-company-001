# Memory: Phase 0 — Foundation
**Date:** 2026-03-30
**Agents:** R-β (Dr. Praxis), R-FE (Frontend Engineer), R-σ (Ms. Scribe)

## Key Insights (top 5)
1. `react-force-graph-2d` MUST use `dynamic(() => import(...), { ssr: false })` — no SSR, uses canvas/window
2. Next.js 16 uses `Response.json()` instead of `NextResponse.json()` for API routes
3. `@types/react-force-graph-2d` doesn't exist on npm — the package ships its own types
4. Tailwind v4 in Next.js 16 uses CSS theme variables (`@theme`) instead of `tailwind.config.ts` `extend`
5. Zustand store for graph state works well — single store handles selection, hover, sidebar, filters

## Tech Decisions & Rationale
- **react-force-graph-2d** over cytoscape/sigma: Best balance of performance + canvas customization for dark theme glow effects
- **JSON files** for data: Git-trackable, simple, no DB setup needed for Phase 0-2
- **Custom canvas node rendering**: Allows glow effects (shadowBlur), selection rings, and label positioning that CSS-based renderers can't do
- **Fuse.js** for search: Lightweight, client-side, fuzzy matching on node name + ID — good enough until Phase 3+
- **API routes for data**: Even though JSON files, using /api/graph and /api/nodes/[id] creates clean abstraction for future DB migration
- **Sidebar overlay** (not push): Better UX — graph doesn't reflow when sidebar opens

## Surprising Findings
- Next.js 16.2.1 is the installed version (not 14 as originally planned) — App Router API may differ
- shadcn/ui init creates `components.json` and `utils.ts` automatically
- Graph force layout needs tuning: charge=-200, linkDistance=120 gives good spread for 8 nodes; will need re-tuning at 35+ nodes

## Cross-Module Connections
- Phase 0 → Phase 1: Node detail panel tabs are ready to receive L3 deep content
- Phase 0 → Phase 3: API route pattern (/api/nodes/[id]) supports matrix nodes (B01-I01) with prefix-based file resolution
- Graph legend already includes "Matrix (blue)" category — ready for Phase 3 nodes

## Process Improvements Suggested
- Dispatch 0.4 (data) in parallel with 0.2 (layout) — both only depend on 0.1, saves time
- Dispatch 0.5 + 0.6 + 0.7 in parallel — no dependencies between them
- R-FE handles 6/8 tasks — consider splitting future phases if workload grows
- AGENTS.md warns Next.js has breaking changes vs training data — agents should read `node_modules/next/dist/docs/` before coding

## Reusable Patterns
- **Dynamic import pattern**: `const Component = dynamic(() => import('...'), { ssr: false })` — reuse for any canvas/WebGL library
- **API file resolver**: ID prefix → directory mapping (B→baselines, I→industries, B-I→matrix) — extensible for C/D nodes
- **Graph store pattern**: Single Zustand store with selection + hover + filter + sidebar state — reuse for Phase 4 chat store
- **Node detail tab system**: Modular tab components (Overview, Tech, Cases, Resources) — each can be enriched independently per depth level

## File Inventory — Phase 0 Output
```
Components (11):  graph/{KnowledgeGraph, GraphControls, NodeTooltip}
                  layout/{Header, Sidebar, SearchBar}
                  node/{NodeDetailPanel, NodeOverview, NodeTechStack, NodeUseCases, NodeResources}
API Routes (2):   api/graph/route.ts, api/nodes/[id]/route.ts
Store (1):        stores/graph-store.ts
Utils (1):        lib/graph-utils.ts
Types (2):        types/node.ts, types/graph.ts
Data (9):         graph.json + 5 baselines + 3 industries
```
