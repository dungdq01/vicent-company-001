# Memory: ADR-001 — Hybrid 3D/2D Graph Visualization Decision
**Date:** 2026-03-30
**Agents:** α (Research), β (Engineering), γ (Evaluation)

## Key Insights (top 5)
1. No major knowledge graph tool ships 3D as primary interface — Neo4j, Obsidian, Roam all chose 2D after testing 3D
2. Galaxy aesthetic has real brand/engagement value but must NOT be the working interface
3. react-force-graph-3d exposes Three.js scene/camera/renderer via ref — can inject star particles, fog, glow without hacking
4. Node drag in 3D constrains to camera-facing plane by default (same as Neo4j Desktop) — built-in, zero custom code
5. Obsidian's smooth feel comes from: alphaDecay ~0.01, velocityDecay ~0.4, re-heat alpha to 0.3 on drag

## Tech Decisions & Rationale
- **react-force-graph-3d** over R3F custom: 90% visual impact at 30% effort. Built-in drag, camera, force engine.
- **Hybrid over full 3D**: γ identified 5 CRITICAL UX risks with full 3D. Hybrid captures aesthetic without sacrificing usability.
- **Camera on rails** over free orbit: eliminates "lost in space" — the #1 failure mode of 3D graph UIs.
- **Fake glow shells** over real bloom: SphereGeometry with BackSide material + opacity 0.12 = 80% visual of bloom at 0% complexity.
- **Star particles**: Single THREE.Points with 3000 vertices = essentially free GPU cost.

## Surprising Findings
- three.js is a peer dependency of react-force-graph-3d — importing THREE for effects adds zero extra bundle
- The galaxy metaphor maps naturally: stars=nodes, constellations=clusters, nebulae=dense regions, dark space=sparse
- Performance at 335 nodes is trivial for both 2D and 3D — concern only starts at 5000+
- Bloom post-processing is the hardest effect to integrate (react-force-graph-3d owns render loop) — skip it, use glow shells

## Cross-Module Connections
- ADR-001 → Phase 0.5: New phase for 3D migration
- ADR-001 → R-FE skill card: Added 3D/WebGL skills
- ADR-001 → MASTER-ARCHITECTURE: Tech stack expanded, UI reference rewritten
- ADR-001 → Phase 1: Research content display unaffected (sidebar stays same)

## Reusable Patterns
- **Hybrid layer pattern**: 3D for overview/engagement + 2D for work — applicable to any data visualization project
- **Glow shell technique**: Outer sphere with BackSide material + low opacity = cheap glow on any THREE.Mesh
- **Mobile detection**: Check WebGL2 context + navigator.deviceMemory + userAgent → serve appropriate layer
- **Camera on rails**: OrbitControls with autoRotate=true, maxPolarAngle constrained = smooth, no disorientation
