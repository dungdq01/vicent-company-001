# Frontend Engineer Notes: Knowledge Graph (B11)
## By Dang Minh Tuan (R-FE) — Date: 2026-03-31

### 1. KG Visualization Library Comparison

| Library | Rendering | React Support | Max Nodes (smooth) | License |
|---------|-----------|--------------|-------------------|---------|
| react-force-graph | WebGL (three.js) | Native | 10,000+ | MIT |
| D3.js (force layout) | SVG/Canvas | Manual integration | 2,000 (SVG), 5,000 (Canvas) | ISC |
| vis.js (vis-network) | Canvas | react-vis-network | 5,000 | Apache 2.0 |
| Cytoscape.js | Canvas | react-cytoscapejs | 5,000 | MIT |
| Sigma.js | WebGL | react-sigma | 50,000+ | MIT |
| G6 (AntV) | Canvas/SVG | Native React wrapper | 10,000 | MIT |

### 2. Force-Directed Graph Layout

The primary visualization for exploratory KG browsing.

**react-force-graph** (recommended):
- 2D and 3D modes out of the box
- WebGL rendering via three.js — handles large graphs smoothly
- Built-in physics simulation (d3-force under the hood)
- Node/link customization via callback props
- Supports click, hover, drag interactions natively

**Configuration for KG visualization**:
- Node size: Proportional to degree (number of connections)
- Node color: By entity type (Person=blue, Organization=green, Location=red)
- Link thickness: By confidence score
- Link color: By relation type
- Labels: Show on hover to reduce clutter; always show for high-degree nodes

### 3. Hierarchical and Tree Layouts

For ontology browsing and taxonomy exploration:

- **dagre** layout in Cytoscape.js — directed acyclic graph layout for class hierarchies
- **d3-hierarchy** — tree, treemap, and radial layouts for taxonomic structures
- **Use cases**: Browsing the ontology schema, viewing organizational hierarchies, disease classification trees
- Toggle between force-directed (exploration) and hierarchical (structure) views

### 4. Interactive Exploration Features

**Expand/collapse nodes**:
- Click node to expand: Fetch 1-hop neighbors from API, add to graph
- Double-click to collapse: Remove leaf nodes connected only to this node
- Progressive loading prevents overwhelming the user with full graph

**Filter by type**:
- Sidebar with entity type checkboxes (Person, Organization, Location, etc.)
- Relation type filter: Show/hide specific relationship types
- Confidence threshold slider: Hide low-confidence edges
- Temporal filter: Slider to show graph state at a point in time

**Search and navigate**:
- Search bar with autocomplete (debounced, fetching from /api/v1/entities?q=)
- Select search result to center and highlight that node in the graph
- Breadcrumb trail for navigation history

### 5. Entity Detail Panel

Side panel that appears when a node is selected:

```
+----------------------------------+
| [Entity Type Badge]              |
| Entity Name                      |
| -------------------------------- |
| Properties:                      |
|   Founded: 1993                  |
|   Industry: Technology           |
|   Headquarters: Ho Chi Minh City |
| -------------------------------- |
| Relationships (15):              |
|   → SUBSIDIARY_OF: Vingroup     |
|   → CEO: Nguyen Van A           |
|   → LOCATED_IN: District 1      |
|   [Show all...]                  |
| -------------------------------- |
| Sources:                         |
|   DangKyKinhDoanh (2026-01-15)  |
|   Wikipedia (2025-12-01)         |
| -------------------------------- |
| [Edit] [View History] [Export]   |
+----------------------------------+
```

### 6. Search and Autocomplete

- **Typeahead search**: Fetch entity suggestions as user types (min 2 characters, 300ms debounce)
- **Faceted results**: Group by entity type in dropdown
- **Fuzzy matching**: Handle Vietnamese diacritics variations (user may type without diacritics)
- **Recent searches**: Store in localStorage for quick re-access
- **Advanced search**: Modal with filters for entity type, properties, relation constraints

### 7. Graph Query Builder UI

Visual interface for constructing graph queries without writing Cypher:

- **Pattern builder**: Drag-and-drop node and edge elements to build a graph pattern
- **Node constraints**: Click node to add type filter and property conditions
- **Edge constraints**: Click edge to specify relation type and direction
- **Results view**: Toggle between graph visualization and table view of results
- **Save/share queries**: Store named queries for reuse

Implementation: Custom React component with a simplified visual query language that translates to GraphQL on submission.

### 8. Mobile-Responsive Graph Visualization

- **Responsive canvas**: Graph container uses 100% viewport width with touch event handlers
- **Touch gestures**: Pinch-to-zoom, pan with single finger, tap to select node
- **Simplified mobile view**: List-based entity exploration instead of full force graph on small screens
- **Progressive enhancement**: Show graph on tablets and desktops, card-based navigation on phones
- **Breakpoints**: < 768px (card view), 768-1024px (simplified graph), > 1024px (full graph + panels)

### 9. Performance for Large Graphs

**WebGL rendering** (react-force-graph, Sigma.js):
- Renders nodes/edges as GPU-accelerated sprites
- Handles 10,000-50,000 nodes at 60fps
- Custom WebGL shaders for node appearance

**Optimization techniques**:
- **Level of Detail (LOD)**: Show labels only when zoomed in; simplify node shapes when zoomed out
- **Viewport culling**: Only render nodes visible in the current viewport
- **Edge bundling**: Aggregate parallel edges between node clusters
- **Clustering**: Auto-cluster nodes by community; expand on click
- **Lazy loading**: Start with seed entities; load neighbors on demand via API
- **Web Workers**: Run force simulation in a worker thread to keep UI responsive

**Benchmarks** (react-force-graph 2D, WebGL):
- 1,000 nodes: Instant rendering, smooth interaction
- 10,000 nodes: < 2s initial render, smooth interaction
- 50,000 nodes: 5-10s initial render, acceptable interaction
- 100,000+ nodes: Requires clustering/aggregation

### 10. Component Architecture

```
src/
  components/
    graph/
      GraphCanvas.tsx        — Main graph visualization (react-force-graph)
      GraphControls.tsx      — Zoom, layout toggle, filter buttons
      NodeTooltip.tsx        — Hover tooltip for nodes
      EdgeTooltip.tsx        — Hover tooltip for edges
    panels/
      EntityDetailPanel.tsx  — Side panel for selected entity
      SearchPanel.tsx        — Search bar + autocomplete
      FilterPanel.tsx        — Entity/relation type filters
      QueryBuilder.tsx       — Visual query builder
    shared/
      EntityBadge.tsx        — Type-colored badge component
      ConfidenceBar.tsx      — Visual confidence indicator
  hooks/
    useGraphData.ts          — Fetch and manage graph state
    useGraphExpansion.ts     — Handle node expand/collapse
    useEntitySearch.ts       — Search with debounce
  utils/
    graphLayout.ts           — Layout algorithm wrappers
    colorScheme.ts           — Entity type color mapping
```

### Recommendations for B11

1. **Use react-force-graph as the primary visualization** — WebGL rendering, React-native, best performance-to-effort ratio
2. **Implement progressive loading from the start** — never load the full graph; always start from a seed entity and expand on demand
3. **Build the entity detail panel before the graph** — users need to read entity data even before graph exploration is polished
4. **Support diacritics-insensitive search** — Vietnamese users may search with or without diacritics; normalize both query and index
5. **Cluster nodes by community for large graphs** — showing 10,000 individual nodes is useless; show 50 clusters that expand on click
6. **Test on real KG data early** — synthetic data hides layout and performance problems that only appear with real-world graph structures
7. **Add keyboard navigation** — power users need Tab/Arrow keys to traverse the graph without mouse
