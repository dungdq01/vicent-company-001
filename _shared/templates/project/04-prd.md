---
file: 04-prd
project_id: {{PROJECT_ID}}
phase: P3-P4
filled_by: R-BA + R-PM
last_updated: {{P4_DATE}}
status: draft | reviewed | signed
---

# {{PROJECT_NAME}} — Product Requirements Document (PRD)

> Single source of truth for **WHAT** the product does. Bridges discovery (P1) and detailed design (P4a-d). Owned by R-BA.

---

## 0. Document Control

- **Author**: R-BA · {{COO_NAME}}
- **Reviewers**: CEO · CTO · Client Product Owner
- **Last reviewed**: [Fill]
- **Status**: [Fill]
- **Version**: v1.0

---

## 1. Product Overview

### 1.1 Vision Statement
[Fill: 1 sentence · what the product is for]

> Example: "A demand forecasting system that helps {{CLIENT_NAME}} planners reduce stockout from 12% to <5%."

### 1.2 Problem & Opportunity
[Fill: refined from discovery report §1]

### 1.3 Goals
[Fill: 3-5 measurable goals · matches intake §5 success criteria]

| # | Goal | Metric | Target |
|---|---|---|---|
| G1 | [Fill] | [Fill] | [Fill] |

### 1.4 Non-Goals
[Fill: explicit list of what this product does NOT do]

---

## 2. Personas

### 2.1 Primary
- **Name**: [Fill]
- **Role**: [Fill]
- **Goals**: [Fill]
- **Pain points**: [Fill]
- **Tech literacy**: [Fill: low/med/high]
- **Frequency of use**: [Fill]

### 2.2 Secondary
[Fill: 1-2 more if relevant]

💡 Hint: Per R-UX, ≤ 3 personas total. Focus.

---

## 3. User Stories

INVEST format (Independent · Negotiable · Valuable · Estimable · Small · Testable).

### 3.1 Epic: [Fill]

| ID | Story | Priority | Acceptance |
|---|---|---|---|
| US-001 | As [persona], I want [action], so that [outcome] | MUST | [Given/When/Then] |
| US-002 | ... | SHOULD | ... |

💡 Hint: MoSCoW priority. R-BA must verify INVEST per R-BA card.

### 3.2 Epic: [Fill]
[Fill]

---

## 4. Functional Requirements

For each major feature:

### 4.1 [Feature Name]
- **Description**: [Fill]
- **User stories**: US-001, US-002
- **Inputs**: [Fill]
- **Behavior**: [Fill: rules · validations · edge cases]
- **Outputs**: [Fill]
- **Errors**: [Fill: how each error path behaves]

### 4.2 [Feature Name]
[Fill same structure]

---

## 5. Non-Functional Requirements

→ See `03-architecture.md §6` for canonical NFRs. Cross-ref here:

| Category | Target |
|---|---|
| Performance | [Fill] |
| Scalability | [Fill] |
| Security | [Fill] |
| Reliability | [Fill] |
| Accessibility | WCAG AA |
| Internationalization | [Fill: VN-only · multi-locale] |

---

## 6. User Flows

### 6.1 Flow: [Critical flow name]
```
[Fill: ASCII or numbered steps]
1. User opens [page]
2. User does [action]
3. System responds [outcome]
...
```

### 6.2 Flow: [Critical flow name]
[Fill]

💡 Hint: ≥ 3 critical flows. Each maps to ≥ 1 user story.

---

## 7. Information Architecture (high-level)

[Fill: page list · nav structure · key screens]

```
- Home
  ├── Dashboard
  ├── [Feature] page
  │   └── Detail view
  └── Settings
```

→ Detailed UI spec in `04d-ui-spec.md`.

---

## 8. Data Requirements

### 8.1 Entities
[Fill: high-level entities · relationships]

→ Detailed schema in `04b-db-schema.md`.

### 8.2 Data Sources
[Fill: where data comes from · ingestion frequency · format]

### 8.3 Data Retention
[Fill: per category · compliance-driven]

---

## 9. AI / ML Requirements (if applicable)

### 9.1 ML Capability
[Fill: what ML does · why ML over rules]

### 9.2 Inputs to Model
[Fill]

### 9.3 Outputs
[Fill: format · range · interpretation]

### 9.4 Quality Targets
[Fill: accuracy · MAPE · F1 · per business need]

### 9.5 Failure Behavior
[Fill: what happens when model unsure · low confidence path]

→ Algorithm details in `04c-ml-spec.md`.

---

## 10. Integration Requirements

[Fill: external systems · sync direction · frequency]

| System | Direction | Trigger | Data |
|---|---|---|---|
| [Fill] | in/out | [Fill] | [Fill] |

---

## 11. Reporting & Analytics

[Fill: what stakeholders need to see · dashboards · exports]

---

## 12. Constraints & Dependencies

- **Hard constraints**: [Fill]
- **Soft constraints**: [Fill]
- **External dependencies**: [Fill: 3rd party · client team · vendor]
- **Compliance**: [Fill]

---

## 13. Acceptance Criteria (Project-Level)

[Fill: link to UAT script in `09-final-package.md`]

Each user story has its own AC in §3. Project-level acceptance:

- [ ] All MUST stories pass AC
- [ ] All SHOULD stories pass or deferred with sign-off
- [ ] Performance targets met (per §5)
- [ ] Security audit clear (per `08-deploy.md`)
- [ ] Documentation complete (per `09-final-package.md`)

---

## 14. Open Questions

[Fill: questions to resolve before P5 planning]

| # | Question | Owner | Due |
|---|---|---|---|
| Q1 | [Fill] | [Fill] | [Fill] |

---

## 15. Out of Scope (re-confirm)

[Fill: matches SOW §4.2 · re-confirm here for product team]

---

## 16. Future Roadmap (post-launch)

[Fill: items intentionally deferred · v2 candidates]

---

## 17. Sign-Off

- **Client Product Owner**: [Fill name · date]
- **Studio CEO**: [Fill]
- **Studio CTO**: [Fill]
- **R-BA eval**: [Fill ≥ 7.5]
- **Ready for P4 design**: [ ]

---

## Cross-References

- Discovery: [`01-discovery-report.md`](01-discovery-report.md)
- Architecture: [`03-architecture.md`](03-architecture.md)
- Design specs: [`04a-api-design.md`](04a-api-design.md) · [`04b-db-schema.md`](04b-db-schema.md) · [`04c-ml-spec.md`](04c-ml-spec.md) · [`04d-ui-spec.md`](04d-ui-spec.md)
- R-BA card: [`@../../.agents/tier-4-delivery/R-BA-business-analyst.md`](../../.agents/tier-4-delivery/R-BA-business-analyst.md)

---
*Template v1.0*
