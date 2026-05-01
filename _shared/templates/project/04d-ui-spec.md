---
file: 04d-ui-spec
project_id: {{PROJECT_ID}}
phase: P4d
filled_by: R-UX + R-FE
last_updated: {{P4_DATE}}
status: draft | reviewed | signed
---

# {{PROJECT_NAME}} — UI / UX Specification

> P4d deliverable. Pages · components · flows · design tokens. Bridges PRD personas to FE implementation.

---

## 0. Document Control

- **Author**: R-UX (research + IA + flow) + R-FE (component breakdown)
- **Reviewers**: R-BA · CEO · Client stakeholder
- **Eval**: [Fill ≥ 7.5]
- **Wireframes**: [`./wireframes/`](./wireframes/) (Figma link or local files)

---

## 1. Design Principles

[Fill: 3-5 principles for this product]

- [Fill: e.g., "Information density over white space — power users"]
- [Fill: e.g., "Mobile-first" or "Desktop-first"]
- [Fill: e.g., "Accessibility-built-in: WCAG AA mandatory"]

---

## 2. Personas Recap

→ See [`04-prd.md §2`](04-prd.md). UX implications:

| Persona | UX implication |
|---|---|
| [Fill] | [Fill: e.g., "low tech literacy → big buttons, plain language"] |

---

## 3. Information Architecture

```
Site map:
├── Home / Dashboard
├── [Section]
│   ├── List
│   └── Detail
├── [Section]
│   └── ...
├── Settings
└── Help
```

### 3.1 Navigation Pattern
- **Primary nav**: [Fill: top bar · sidebar · bottom (mobile)]
- **Secondary nav**: [Fill]
- **Mobile pattern**: [Fill: hamburger · bottom tab · drawer]

---

## 4. User Flows

### 4.1 Critical Flow: [Fill name]
- **Goal**: [Fill]
- **Trigger**: [Fill: button click · scheduled · system event]
- **Steps**:
  1. [Fill]
  2. [Fill]
  3. [Fill]
- **Success state**: [Fill]
- **Error states**: [Fill ≥ 2 unhappy paths]
- **Wireframe**: [`./wireframes/flow-1.png`](./wireframes/)

### 4.2 Critical Flow: [Fill]
[Repeat]

💡 Hint: ≥ 3 critical flows mapped end-to-end. Each persona has ≥ 1 flow.

---

## 5. Pages / Screens

### 5.1 [Page name]
- **URL**: `/[path]`
- **Auth**: required / public
- **Persona(s)**: [Fill]
- **Goal**: [Fill: 1 sentence]
- **Components on page**: [Fill: list from §6]
- **Data displayed**: [Fill]
- **Actions available**: [Fill]
- **Empty state**: [Fill: copy + illustration]
- **Loading state**: [Fill]
- **Error state**: [Fill]
- **Wireframe**: [`./wireframes/page-{name}.png`](./wireframes/)

### 5.2 [Page name]
[Repeat]

---

## 6. Components

### 6.1 Reused Components (from shadcn/ui)
[Fill: which shadcn primitives this project uses]

- Button · Input · Form · Dialog · Table · DropdownMenu · ...

### 6.2 Custom Components
For each custom component:

#### `<DataTable>`
- **Purpose**: [Fill]
- **Props**: [Fill schema]
- **States**: default · loading · empty · error
- **Behavior**: [Fill: sorting · filtering · pagination · selection]
- **Accessibility**: keyboard nav · ARIA labels · focus management

#### `<{{ComponentName}}>`
[Repeat]

💡 Hint: Per R-FS · default to shadcn/ui composition. Custom components only when justified.

---

## 7. Design Tokens

→ Companion file: [`./design-tokens.md`](./design-tokens.md) or `./tokens.json`.

### 7.1 Colors
| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | [Fill] | [Fill] | base |
| `--foreground` | [Fill] | [Fill] | text |
| `--primary` | [Fill] | [Fill] | brand action |
| `--secondary` | [Fill] | [Fill] | supporting |
| `--destructive` | [Fill] | [Fill] | delete · error |
| `--muted` | [Fill] | [Fill] | de-emphasis |

💡 Hint: Use shadcn/ui token system. Match brand from `business-strategy/16-brand-content-kit.md`.

### 7.2 Typography
| Token | Font | Size | Weight | Line height |
|---|---|---|---|---|
| `text-h1` | [Fill] | [Fill] | [Fill] | [Fill] |
| `text-body` | [Fill] | 16px | 400 | 1.5 |
| ... | ... | ... | ... | ... |

### 7.3 Spacing
[Fill: scale e.g., 4 8 12 16 24 32 48 64]

### 7.4 Radius
[Fill: e.g., none · sm · md · lg]

### 7.5 Shadows
[Fill: subtle elevation system]

### 7.6 Motion
[Fill: timing · easing curves]

---

## 8. Responsive Strategy

### 8.1 Breakpoints
| Name | Min width | Devices |
|---|---|---|
| sm | 640px | small tablet |
| md | 768px | tablet |
| lg | 1024px | small laptop |
| xl | 1280px | desktop |

### 8.2 Layout Strategy
- **Mobile** (< sm): [Fill: stacked, single column, bottom nav]
- **Tablet** (sm-lg): [Fill]
- **Desktop** (lg+): [Fill: multi-column, sidebar nav]

---

## 9. Accessibility (WCAG AA)

Per R-COD-14 + R-UX card:

- [ ] Color contrast 4.5:1 on text (3:1 large text)
- [ ] Keyboard nav for all interactive elements
- [ ] Focus indicators visible
- [ ] ARIA labels on icon-only buttons
- [ ] Form errors associated with inputs
- [ ] Skip-to-content link
- [ ] Alt text on images
- [ ] Reduced motion respected (`prefers-reduced-motion`)
- [ ] Tested with screen reader (VoiceOver / NVDA)
- [ ] axe-core in CI

---

## 10. Internationalization

- **Locales**: [Fill: vi-VN only · vi-VN + en-US · etc.]
- **Date / number format**: locale-aware
- **RTL** (if Arabic): [Fill: yes/no]
- **Translation pipeline**: [Fill: i18next · react-intl · custom]

---

## 11. Empty / Loading / Error States

For every screen, MUST design:
- **Empty state**: helpful copy + primary action
- **Loading state**: skeleton over spinner where possible
- **Error state**: clear copy + recovery action + support link

---

## 12. Animation & Microinteractions

[Fill: where animation is used · purpose · spec]

💡 Hint: Subtle. Function over flair. Respect `prefers-reduced-motion`.

---

## 13. Sign-Off

- **R-UX eval**: [Fill]
- **R-FE feasibility**: [Fill: components implementable in stack]
- **CEO**: [Fill]
- **Client stakeholder**: [Fill]

---

## Cross-References

- PRD: [`04-prd.md`](04-prd.md)
- API (data shape): [`04a-api-design.md`](04a-api-design.md)
- Brand kit: [`@../../../business-strategy/16-brand-content-kit.md`](../../../business-strategy/16-brand-content-kit.md)
- R-UX card: [`@../../.agents/tier-4-delivery/R-UX-ux-designer.md`](../../.agents/tier-4-delivery/R-UX-ux-designer.md)
- Code rules a11y: [`@../../rules/20-code-rules.md`](../../rules/20-code-rules.md) §R-COD-14

---
*Template v1.0*
