---
file: 02-sow
project_id: {{PROJECT_ID}}
phase: P2 (G1 gate)
filled_by: R-LEG + R-AM + COO
last_updated: {{SOW_DATE}}
status: draft | legal-review | signed | active
---

# Statement of Work — {{PROJECT_NAME}}

> Legally-binding scope + terms. Signed at G1. Triggers project start (P3+).

---

## 1. Parties

- **Studio (Service Provider)**: [Studio legal name] · [registered address] · [tax ID]
- **Client**: {{CLIENT_NAME}} · [legal address] · [tax ID]

## 2. Effective Date

This SOW is effective from {{SOW_DATE}} and remains in force until project completion or termination per §11.

## 3. Project

- **Project name**: {{PROJECT_NAME}}
- **Project ID**: {{PROJECT_ID}}
- **Reference proposal**: v1.0 dated [Fill]

## 4. Scope of Services

### 4.1 In Scope
[Fill: itemized deliverables matching proposal §3.2]

### 4.2 Out of Scope
[Fill: explicit list — anything not listed is out of scope]

### 4.3 Assumptions
[Fill: client-provided data · access · responsiveness assumptions]

---

## 5. Deliverables & Milestones

| # | Deliverable | Acceptance criteria | Due date |
|---|---|---|---|
| 1 | [Fill] | [Fill measurable] | [Fill] |
| 2 | ... | ... | ... |

💡 Hint: Each acceptance criterion MUST be objective + verifiable.

---

## 6. Fees & Payment

### 6.1 Total Fee
USD [Fill] (excluding tax). VAT 10% applicable per Vietnam tax law if invoiced from VN entity.

### 6.2 Payment Schedule

| Milestone | Amount | Payable upon |
|---|---|---|
| Deposit | 50% | SOW signature |
| Final | 50% | Project acceptance (P9 sign-off) |

### 6.3 Payment Terms
- **Currency**: USD (or VND at official FX rate at invoice date)
- **Net**: 30 days from invoice date
- **Late fee**: 1.5% per month on overdue balance
- **Method**: Bank transfer · Wise · Payoneer (per invoice)

### 6.4 Out-of-Scope Costs
- Third-party software/licenses → pass-through, billed at cost +0% markup
- Cloud infrastructure → pass-through unless otherwise agreed

---

## 7. Schedule

- **Start**: {{START_DATE}}
- **Target completion**: {{TARGET_DATE}}
- **Force majeure**: [Fill clause]

---

## 8. Roles & Responsibilities

### 8.1 Studio Will
[Fill bullets]
- Provide qualified team (per proposal §5)
- Maintain weekly progress communication
- Deliver per spec on time
- Maintain confidentiality

### 8.2 Client Will
[Fill bullets]
- Provide timely access to data, systems, and stakeholders
- Make decisions within agreed SLA (default 3 business days)
- Pay invoices per §6.3
- Sign acceptance documents within 5 business days of UAT pass

### 8.3 Decision SLAs
- **Standard decisions**: 3 business days
- **Strategic decisions** (architecture · scope change): 5 business days
- **Failure to respond** beyond SLA may trigger schedule slip per §10

---

## 9. Change Management

### 9.1 Scope Change Request (SCR)
Any change to scope MUST follow `_meta/scope-changes/SCR-template.md`:
1. Either party submits SCR
2. Studio assesses impact (cost · timeline · risk) within 3 business days
3. Both parties sign or reject within 5 business days

### 9.2 Pricing Adjustments
Approved scope changes adjust fees per change order. Original SOW remains binding for unchanged scope.

---

## 10. Acceptance

### 10.1 UAT Process
- Studio delivers system + UAT script (per `09-final-package.md`)
- Client tests within 10 business days
- Pass: sign acceptance form · Final invoice issued
- Fail: written defect list · Studio fixes within agreed window · re-test

### 10.2 Deemed Acceptance
If Client does not respond within 10 business days of delivery (after written reminder), deliverable is deemed accepted.

---

## 11. Termination

### 11.1 For Convenience
Either party may terminate with 30 days written notice. Client pays for work completed up to termination date.

### 11.2 For Cause
Either party may terminate immediately for material breach uncured 14 days after written notice.

### 11.3 On Termination
- Studio delivers all completed work + work-in-progress
- Client pays all undisputed amounts
- IP transfer per §12 for paid-for deliverables

---

## 12. Intellectual Property

### 12.1 Pre-Existing IP
Each party retains ownership of its pre-existing IP (frameworks, tools, internal libraries).

### 12.2 Deliverable IP
Upon full payment, Client owns:
- Custom code written specifically for this project
- Deliverable documents (PRD, architecture, design specs)
- Trained models specific to Client's data

### 12.3 Studio Retains
- Generic frameworks, agent skill cards, eval methodology, internal templates
- Right to use anonymized learnings in future work (per §13)

---

## 13. Confidentiality

Both parties keep Confidential Information confidential for 3 years post-termination. Anonymized learnings (no PII, no identifiable data, no client name) may be referenced in Studio's internal memory and case studies (with Client written consent for case studies).

---

## 14. Warranties

### 14.1 Studio Warrants
- Service performed with professional skill and care
- Deliverables free from material defects for **30 days** post-acceptance (defect window)
- Original work, no third-party IP infringement

### 14.2 Limitations
- AI-generated content: Studio uses LLM-augmented workflows; outputs reviewed by humans but Client acknowledges generative AI inherent uncertainty
- Performance targets: best-effort; specific KPIs as in §10 acceptance criteria

---

## 15. Limitation of Liability

Total liability of either party under this SOW capped at the **Total Fee** paid in §6.1. Neither party liable for indirect/consequential damages.

---

## 16. Governing Law

This SOW governed by [Fill: laws of Vietnam / Singapore / etc. per client]. Disputes resolved through [Fill: mediation → arbitration → courts].

---

## 17. Signatures

**Studio**:
- Name: ____________________
- Title: ____________________
- Date: ____________________
- Signature: ____________________

**Client**:
- Name: ____________________
- Title: ____________________
- Date: ____________________
- Signature: ____________________

---

## Cross-References

- Proposal: [`02-proposal.md`](02-proposal.md)
- Sales S3 (legal terms): [`@../../../experience/workspace/docs/pipelines-business/sales/S3-PROPOSAL.md`](../../../experience/workspace/docs/pipelines-business/sales/S3-PROPOSAL.md)
- R-LEG card: [`@../../.agents/tier-5-business/R-LEG-legal.md`](../../.agents/tier-5-business/R-LEG-legal.md)
- SCR template: [`_meta/scope-changes/SCR-template.md`](_meta/scope-changes/SCR-template.md)

---
*Template v1.0 — MUST be reviewed by qualified legal counsel before first use*
