# Architecture Decision Record — ADR-001: Hybrid 3D/2D Graph Visualization

**Date:** 2026-03-30
**Status:** APPROVED
**Decided by:** Stakeholder + Manager (Cascade)
**Agents consulted:** Dr. Archon (α), Dr. Praxis (β), Dr. Sentinel (γ)

---

## Context

Stakeholder requested graph visualization overhaul:
- **Drag & drop** nodes (Neo4j Browser style)
- **3D visualization** with Galaxy/galactic aesthetic
- **Reference:** Neo4j Browser, Obsidian Graph View, Galaxy visualizations

## Decision

**HYBRID APPROACH** — 3D Galaxy Landing + 2D Enhanced Exploration.

Two-layer architecture:

```
LAYER 1: GALAXY OVERVIEW (3D)
├── 3D galaxy visualization (react-force-graph-3d + three.js)
├── Auto-rotate camera on rails (NOT free orbit)
├── Star particles, glow, fog for galaxy aesthetic
├── Click cluster → animated zoom transition to Layer 2
├── Purpose: engagement, orientation, brand identity
└── No drag & drop (not needed at overview level)

LAYER 2: EXPLORATION GRAPH (2D Enhanced)
├── 2D force-directed graph (react-force-graph-2d, enhanced)
├── Neo4j-style drag & drop (nodes draggable, physics re-simulate)
├── Obsidian-style smooth physics (slow alpha decay, re-heat on drag)
├── Full text readability, accessibility, keyboard nav
├── Mobile-responsive
├── Click node → sidebar detail panel
└── Progressive disclosure: expand neighbors on click
```

## Rationale

### Why NOT full 3D?
- No major knowledge graph tool ships 3D as primary interface (Neo4j, Obsidian, Roam all chose 2D)
- Critical UX risks: "lost in space" disorientation, text unreadable at angles, mobile broken
- Drag & drop in 3D is confusing (which plane?)
- Accessibility failures with 3D canvas

### Why Hybrid?
- Galaxy aesthetic has real brand/engagement value (α confirmed)
- 3D overview provides spatial clustering and immersion
- 2D exploration preserves readability, accessibility, mobile support
- Camera-on-rails in 3D eliminates disorientation
- Transition animation (zoom into cluster) maintains the galaxy metaphor

## Tech Stack Changes

```yaml
# NEW — 3D Galaxy Layer
galaxy_layer:
  renderer: "react-force-graph-3d (three.js WebGL)"
  effects: "Star particles (THREE.Points), fog (THREE.FogExp2), glow shells"
  camera: "Orbit on rails (constrained auto-rotate)"
  packages:
    - "react-force-graph-3d"
    - "three"
    - "@types/three"

# ENHANCED — 2D Exploration Layer
exploration_layer:
  renderer: "react-force-graph-2d (d3-force, enhanced)"
  drag: "Node drag with physics re-simulation (Neo4j style)"
  physics: "Slow alpha decay, re-heat on drag (Obsidian style)"
  features:
    - "Dim-on-select (Neo4j pattern)"
    - "Progressive disclosure (click to expand neighbors)"
    - "Zoom-to-node animation"
    - "Right-click context menu"

# FALLBACK
mobile_fallback: "2D-only on mobile/low-end (detect WebGL2 + device)"
```

## New Packages Required

```json
{
  "react-force-graph-3d": "^1.25.x",
  "three": "^0.170.x",
  "@types/three": "^0.170.x"
}
```

## Effort Estimation (Dr. Praxis β)

| Task | Hours |
|------|-------|
| 3D Galaxy layer (star field, glow, fog, camera rails) | 6-8 |
| 2D Enhanced (drag, physics tuning, dim-on-select) | 4-6 |
| Layer transition animation | 2-3 |
| Mobile detection + fallback | 1-2 |
| Testing & polish | 2-3 |
| **Total** | **15-22 hours** |

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| User disorientation in 3D | Camera on rails, not free orbit; "Reset View" button |
| Text readability in 3D | Billboard sprites for labels; reading happens in 2D layer |
| Mobile broken | 2D-only on mobile; 3D galaxy as static hero on small screens |
| Performance | Lazy-load three.js; code-split behind dynamic import |
| Bundle size (three.js ~400KB) | Dynamic import, tree-shaking |

## Files Affected

- docs/MASTER-ARCHITECTURE.md — Tech stack, UI reference, project structure
- docs/PHASE-PLAN.md — Add Phase 0.5 for 3D migration
- maestro-knowledge-graph-platform-c611c2.md — Summary tech stack
- .agents/tier-2-engineering/R-FE-frontend-engineer.md — Add 3D skills
- src/components/graph/ — New 3D components alongside existing 2D
