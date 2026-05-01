# SCR-{NNN}: {Short Change Title}

> **SCR** = Scope Change Request. Used when work deviates from the signed SOW / approved PRD / approved architecture. One change per file.

---

## Document Control

| Field | Value |
|---|---|
| **SCR ID** | SCR-{NNN} |
| **Title** | {Short, imperative} |
| **Status** | `draft` \| `submitted` \| `under-review` \| `approved` \| `rejected` \| `implemented` \| `withdrawn` |
| **Date raised** | YYYY-MM-DD |
| **Requested by** | {client / agent / internal role} |
| **Owner (driver)** | {name} |
| **Approver(s)** | {client signatory + internal CEO/CTO} |
| **Project** | {project-slug} |
| **Affected phase(s)** | {e.g., 04-prd, 04a-api, 05-planning} |
| **Priority** | `critical` \| `high` \| `medium` \| `low` |

---

## 1. Summary

> One paragraph. What is changing and why, in plain language a non-technical client can read.

---

## 2. Origin / Trigger

- **Source of request:** { client email / discovery finding / production incident / regulatory change / other }
- **Date observed / received:**
- **Reference (link, ticket, message):**

---

## 3. Current Baseline (As-Is)

> What does the signed SOW / approved doc say today? Quote or link the exact section.

- **SOW reference:** `02-sow.md#...`
- **PRD reference:** `04-prd.md#...`
- **Architecture reference:** `03-architecture.md#...`
- **Other:**

Verbatim or summary of the current commitment:
> ...

---

## 4. Proposed Change (To-Be)

> Precise description of the change. Include before/after for ambiguous areas.

- **Scope addition:**
- **Scope removal:**
- **Scope modification:**
- **Acceptance criteria delta:**

---

## 5. Justification

- **Business value / problem solved:**
- **Risk if not done:**
- **Alternatives considered (and why rejected):**

---

## 6. Impact Analysis

### 6.1 Schedule
| Item | Current | New | Delta |
|---|---|---|---|
| Phase end |  |  |  |
| Project end |  |  |  |
| Critical path? |  |  |  |

### 6.2 Cost
| Item | Current | New | Delta (USD) |
|---|---|---|---|
| Fixed fee |  |  |  |
| Monthly fee |  |  |  |
| LLM cost cap |  |  |  |
| Infra cost |  |  |  |
| Labor hours |  |  |  |

### 6.3 Resources / Team
- **Additional agents/skills required:**
- **Additional human time required:**
- **Re-prioritization of existing work:**

### 6.4 Technical
- **Affected components:**
- **New dependencies (link to stack rules check):**
- **Data model changes:**
- **API breaking changes:** { yes / no — if yes, versioning plan }
- **Performance impact:**
- **Security impact:**

### 6.5 Quality / Risk
- **New risks introduced:**
- **Existing risks affected:**
- **Eval / golden set updates required:** { yes / no — describe }
- **QA effort delta:**

### 6.6 Documentation
- **Docs to update:** {list paths}
- **ADRs needed:** {list}

---

## 7. Rules Compliance Check

- [ ] Stack rules (`_shared/rules/10-stack-rules.md`)
- [ ] Code rules (`_shared/rules/20-code-rules.md`)
- [ ] Execution rules (`_shared/rules/30-execution-rules.md`)
- [ ] Security rules (`_shared/rules/60-security-rules.md`)
- [ ] Quality rules (`_shared/rules/70-quality-rules.md`)
- [ ] Master rules / anti-FOMO (`_shared/rules/00-MASTER-RULES.md`)

Waivers requested: {none / list with justification}

---

## 8. Recommendation

> Internal recommendation before client review.

- **Recommended action:** `approve` / `approve with conditions` / `reject` / `defer`
- **Conditions (if any):**
- **Recommender:** {role}
- **Date:**

---

## 9. Decision

| Field | Value |
|---|---|
| **Decision** | `approved` / `rejected` / `deferred` / `withdrawn` |
| **Decided by (internal)** | {CEO/CTO} |
| **Decided by (client)** | {signatory} |
| **Decision date** | YYYY-MM-DD |
| **Effective date** | YYYY-MM-DD |
| **Conditions / amendments** |  |

### Signatures
- **Client:** ______________________  Date: __________
- **Studio (CEO):** _______________  Date: __________

---

## 10. Implementation Plan (post-approval)

- **Updated SOW addendum:** `02-sow.md` §{n} or `02-sow-addendum-{NNN}.md`
- **Updated PRD sections:**
- **Updated architecture / ADRs:**
- **Updated planning / sprint plan:**
- **Updated cost cap in `_meta.json`:**
- **Updated `_state.json` entries:**
- **Communication to team:** {date sent}
- **Implementation owner:**
- **Target completion:** YYYY-MM-DD

---

## 11. Cross-References

- Original SOW: `02-sow.md`
- Affected PRD: `04-prd.md`
- Affected architecture: `03-architecture.md`
- Related ADRs:
- Related SCRs:
- Communication log entry:

---

## 12. Changelog

| Date | Status | By | Note |
|---|---|---|---|
| YYYY-MM-DD | draft |  |  |
| YYYY-MM-DD | submitted |  |  |
| YYYY-MM-DD | approved/rejected |  |  |
| YYYY-MM-DD | implemented |  |  |
