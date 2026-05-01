# Memory: Phase 0.5 — Graph Visualization Overhaul (Hybrid 3D/2D)
**Date:** 2026-03-30
**Agents:** R-FE, R-β (review)

## Key Insights (top 5)
1. react-force-graph-3d exposes Three.js scene via `graphRef.current.scene()` — inject stars, fog, lights freely
2. Glow shell technique (BackSide sphere at 2x radius, opacity 0.08-0.15) looks 80% as good as real bloom at 0% complexity
3. Obsidian physics feel: alphaDecay=0.01, velocityDecay=0.3, d3AlphaTarget=0.005 (never fully stop)
4. Camera on rails: OrbitControls.autoRotate=true + polar angle constraint = cinematic, no disorientation
5. Node click in 3D: fly camera → wait 900ms → fade transition → 2D with node selected = seamless UX

## Planet Node Rendering (updated after visual polish)
- **3D planets**: MeshPhongMaterial (color + emissive 0.25 scalar) + 3 atmosphere shells (BackSide, AdditiveBlending, opacity 0.2/0.08/0.04) = looks like real planets
- **Rings for industry nodes**: RingGeometry at 1.5×-3.0× radius, tilted Math.PI×0.45, gives Saturn look
- **Proper lighting required**: MeshPhong is dark without lights — must add AmbientLight + PointLight (key) + DirectionalLight (rim)
- **2D planet look without Three.js**: canvas radial-gradient with highlight offset (top-left white) + shadow (bottom-right dark) + atmosphere ring = convincing sphere illusion
- **2D star background**: CSS radial-gradient deep space + repeating-radial-gradient tiled star field + nebula hints on container — no canvas needed

## Tech Decisions & Rationale
- **Glow shells over bloom**: UnrealBloomPass requires patching react-force-graph-3d render loop. Not worth it.
- **Pin-on-drag (Neo4j)**: node.fx/fy = node.x/y on dragEnd. Double-click to unpin (fx=undefined).
- **forceData must be memoized**: Without useMemo, new object reference every render resets d3 layout.
- **Transition timers must be tracked**: setTimeout in state transitions = memory leak if unmounted mid-transition.
- **d3Force charge=-500, link distance=200**: Default charge too weak (nodes cluster). Must override after sceneReady.
- **sceneReady via polling**: graphRef.current?.scene() — poll every 100ms, clear when truthy. Dynamic import means ref not available immediately.

## Surprising Findings
- Three.js FogExp2 with density 0.0015 gives perfect galaxy depth fade at radius ~1500
- 4000 star particles (THREE.Points) = essentially zero GPU cost (we use 8000+500+400+150 = 9050)
- `d3ReheatSimulation()` is the secret to Obsidian's "other nodes reorganize when you drag" feel
- 2D graph consistency matters: if Galaxy landing looks like space, Exploration must also look like space or transition feels broken
- Industry nodes with rings are immediately recognizable as a different "type" without any legend needed

## Reusable Patterns
- **Device capability hook**: WebGL2 + userAgent + deviceMemory + viewport width → canRender3D boolean
- **Layer transition**: opacity fade 500ms → swap component → fade in 500ms. Track timers for cleanup.
- **Neighbor map**: Build Map<string, Set<string>> from edges, handle d3-force object references (source can be object or string)
- **Star field factory**: addStarField(scene) returns cleanup fn — scene.remove + dispose all geo/mat
- **4-layer star field**: distant (8000, flattened disc), bright accent (400), nebula clouds (150, AdditiveBlending), galactic core (500, warm center glow)

## Bugs Fixed This Phase
1. **Nodes clustering in 3D**: Default d3Force charge too weak → override: charge=-500, link distance=200, center=0.03
2. **2D view visual inconsistency**: Flat white nodes on black BG jarring after galaxy → Added CSS star bg + planet gradient nodes + blue-tinted edges to ExplorationGraph
