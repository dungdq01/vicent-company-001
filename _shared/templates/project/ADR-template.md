# ADR-{NNN}: {Short Decision Title}

> **ADR** = Architecture Decision Record. One decision per file. Immutable once accepted; supersede via a new ADR rather than editing.

---

## Document Control

| Field | Value |
|---|---|
| **ADR ID** | ADR-{NNN} |
| **Title** | {Short, imperative: "Use Postgres for primary store"} |
| **Status** | `proposed` \| `accepted` \| `superseded by ADR-{NNN}` \| `deprecated` \| `rejected` |
| **Date** | YYYY-MM-DD |
| **Deciders** | {names / agent IDs} |
| **Consulted** | {names / agent IDs} |
| **Informed** | {names / agent IDs} |
| **Project** | {project-slug} |
| **Phase** | {e.g., 03-architecture} |
| **Supersedes** | {ADR-{NNN} or none} |
| **Superseded by** | {ADR-{NNN} or none} |

---

## 1. Context

> What is the issue motivating this decision? Describe the forces at play (technical, business, political). 3–8 sentences. Be factual; avoid recommending here.

- **Problem statement:**
- **Triggering event / observation:**
- **Constraints (hard):**
- **Constraints (soft / preferences):**
- **Assumptions:**
- **Related requirements:** {link to PRD section, NFR, or rule ID}

---

## 2. Decision Drivers

> The criteria used to evaluate options. Order by importance.

1. {e.g., Time-to-market < 6 weeks}
2. {e.g., LLM cost cap $X / request}
3. {e.g., Team familiarity}
4. {e.g., Compliance: PII residency}
5. {e.g., Operational simplicity}

---

## 3. Options Considered

### Option A: {Name}
- **Summary:**
- **Pros:**
  - 
- **Cons:**
  - 
- **Cost / effort estimate:**
- **Risk:**

### Option B: {Name}
- **Summary:**
- **Pros:**
- **Cons:**
- **Cost / effort estimate:**
- **Risk:**

### Option C: {Name}
- **Summary:**
- **Pros:**
- **Cons:**
- **Cost / effort estimate:**
- **Risk:**

> Minimum 2 options. Include "Do nothing / status quo" if relevant.

---

## 4. Decision

> The chosen option, stated clearly and unambiguously. One sentence ideal.

**We will {Option X} because {primary reason tied to drivers}.**

### Rationale
- 
- 
- 

### Decision against alternatives
- **Why not Option A:**
- **Why not Option B:**

---

## 5. Consequences

### Positive
- 
- 

### Negative / Trade-offs accepted
- 
- 

### Neutral
- 

### Risks introduced
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
|  |  |  |  |

---

## 6. Compliance with Rules

> Confirm alignment with `_shared/rules/`. Note any waivers.

- [ ] Stack rules (`10-stack-rules.md`): { compliant / waiver: ... }
- [ ] Security rules (`60-security-rules.md`): { compliant / waiver: ... }
- [ ] Cost rules (in `30-execution-rules.md` / `70-quality-rules.md`): { compliant / waiver: ... }
- [ ] Anti-FOMO check (`00-MASTER-RULES.md`): { compliant / waiver: ... }

If any waiver: link to approving authority and expiry date.

---

## 7. Implementation Notes

- **Owner:** {who executes}
- **Target phase / sprint:** 
- **Action items:**
  - [ ] 
  - [ ] 
- **Affected components / files:**
- **Migration / rollback plan:** 
- **Validation:** {how we will know decision is working}

---

## 8. Follow-ups

- **Re-evaluate by:** {YYYY-MM-DD or trigger condition}
- **Metrics to watch:**
- **Open questions:**

---

## 9. Cross-References

- PRD section: `04-prd.md#...`
- Architecture: `03-architecture.md#...`
- Tech stack: `03-tech-stack.md#...`
- Related ADRs: 
- Related SCRs: 
- Rules cited: 

---

## 10. Changelog

| Date | Status change | By | Note |
|---|---|---|---|
| YYYY-MM-DD | proposed → accepted |  |  |
