---
file: 04e-integration
project_id: {{PROJECT_ID}}
phase: P4e
filled_by: R-SA + CTO
last_updated: {{P4_DATE}}
status: draft | reviewed | signed
---

# {{PROJECT_NAME}} — Integration Review

> P4e deliverable (sequential consolidation after P4a-d parallel). Catches cross-discipline conflicts before P5 planning.

---

## 0. Document Control

- **Reviewer**: R-SA + CTO
- **Inputs reviewed**: `04a-api-design.md` · `04b-db-schema.md` · `04c-ml-spec.md` · `04d-ui-spec.md`
- **Date**: [Fill]
- **Status**: [Fill]

---

## 1. Cross-Discipline Consistency Checklist

### 1.1 API ↔ DB
- [ ] Every API field maps to a DB column or computed value
- [ ] Field names consistent (camelCase API ↔ snake_case DB documented)
- [ ] Data types compatible (e.g., DB `BIGINT` ↔ API `number` with overflow consideration)
- [ ] Pagination contract aligned (cursor vs offset)
- [ ] Foreign key relations match API resource nesting

### 1.2 API ↔ UI
- [ ] Every UI screen has API endpoints to back its data
- [ ] Loading / empty / error states match API behavior
- [ ] Pagination UX matches API pagination
- [ ] Optimistic UI patterns documented
- [ ] Real-time / streaming endpoints (if any) → UI strategy aligned

### 1.3 API ↔ ML (if applicable)
- [ ] ML inference endpoints follow general error format
- [ ] ML latency target consistent with UX expectation
- [ ] ML cost telemetry in API logs (Helicone)
- [ ] Confidence score returned in response when relevant

### 1.4 DB ↔ ML
- [ ] Feature store tables match ML pipeline expectations
- [ ] Predictions table receives all required outputs
- [ ] Model version tracked in predictions
- [ ] Vector indexes match embedding dimensions

### 1.5 DB ↔ UI
- [ ] All UI-displayed data has DB source
- [ ] No PII surfaces UI without auth check
- [ ] Sort/filter UI matches DB index strategy (no full-table scans)

### 1.6 Auth Consistency
- [ ] Auth provider same across API, UI, admin tools
- [ ] Role/scope model coherent end-to-end
- [ ] Session handling (cookie vs token) aligned

### 1.7 Error Handling
- [ ] Error codes consistent: API returns same codes as DB raises (mapped)
- [ ] UI surfaces errors with same messages user can act on
- [ ] Error logging consistent (request ID propagated)

### 1.8 Performance Coherence
- [ ] API p95 + DB query latency + ML inference + UI render = within end-to-end target
- [ ] Caching strategy consistent (no double-cache · no stale-stale)

### 1.9 Security Consistency
- [ ] Per R-SEC-05: OWASP top 10 audited at each layer
- [ ] PII flow traced end-to-end, classified consistently
- [ ] Audit logging captures cross-layer events

### 1.10 Cost Consistency
- [ ] Sum of layer costs matches projected total in `03-tech-stack.md §5`
- [ ] LLM cost ceiling enforced at API gateway

---

## 2. Conflicts Identified

| # | Conflict | Layers | Resolution | Status |
|---|---|---|---|---|
| 1 | [Fill: e.g., "API expects `userId`, DB column is `user_id`"] | API ↔ DB | Documented mapping in ORM layer | resolved |
| 2 | [Fill] | ... | ... | resolved · loop-back |

💡 Hint: 0 unresolved before P5 (per P4 DoD). If conflict cannot be resolved → loop back to P4a-d.

---

## 3. Shared Premises (Source of Truth)

### 3.1 Authentication Model
[Fill: definitive auth flow · all 4 layers must follow]

### 3.2 Data Model Authority
[Fill: who owns the canonical schema — typically DB; API/UI are projections]

### 3.3 Time / Timezone Handling
[Fill: UTC at storage · locale-display at UI · server-time as authoritative]

### 3.4 Currency / Number Handling
[Fill: integer cents at storage · locale-format at display]

### 3.5 ID Strategy
[Fill: UUID v4 default · prefix per resource type? `user_xxx`?]

---

## 4. End-to-End User Flow Validation

For each critical flow from PRD §6, trace through all layers:

### 4.1 Flow: [Fill name]

| Step | UI | API | DB | ML | Notes |
|---|---|---|---|---|---|
| 1 | [Fill] | [Fill] | [Fill] | — | [Fill] |
| 2 | ... | ... | ... | ... | ... |

💡 Hint: Trace ≥ 3 critical flows. Identify gaps where any layer doesn't support the flow.

---

## 5. Performance Budget (End-to-End)

For top 3 user-facing operations:

| Operation | Target p95 | UI render | Network | API | DB | ML | Buffer |
|---|---|---|---|---|---|---|---|
| [Fill] | [Fill ms] | [Fill] | [Fill] | [Fill] | [Fill] | [Fill] | [Fill] |

If sum exceeds target → redesign required (P4 loop-back).

---

## 6. Open Items

[Fill: items that survived integration review · who owns · due date]

| # | Item | Owner | Due |
|---|---|---|---|
| 1 | [Fill] | [Fill] | [Fill] |

---

## 7. Sign-Off

- **R-SA**: [Fill]
- **CTO**: [Fill]
- **Ready for P5 planning**: [ ] Yes [ ] No (loop back to P4)

---

## Cross-References

- API: [`04a-api-design.md`](04a-api-design.md)
- DB: [`04b-db-schema.md`](04b-db-schema.md)
- ML: [`04c-ml-spec.md`](04c-ml-spec.md)
- UI: [`04d-ui-spec.md`](04d-ui-spec.md)
- P4 phase doc: [`@../../../experience/workspace/docs/pipeline/P4-DESIGN.md`](../../../experience/workspace/docs/pipeline/P4-DESIGN.md)

---
*Template v1.0*
