---
file: 09-final-package
project_id: {{PROJECT_ID}}
phase: P9
filled_by: R-PM + R-TC
last_updated: {{P9_DATE}}
status: draft | client-review | accepted
---

# {{PROJECT_NAME}} — Final Package & Handoff

> P9 deliverable. Closes the project. Triggers final invoice + retro + memory promotion.

---

## 0. Document Control

- **Owner**: R-PM
- **Co-author**: R-TC (user-facing docs)
- **Client acceptance**: [Fill name · date]

---

## 1. Deliverables Summary

Map back to SOW §5 milestones. For each:

| # | Deliverable | Location | Status |
|---|---|---|---|
| 1 | Discovery report | [`01-discovery-report.md`](01-discovery-report.md) | ✅ |
| 2 | Architecture | [`03-architecture.md`](03-architecture.md) | ✅ |
| 3 | Design specs | [`04*.md`](.) | ✅ |
| 4 | Code repo | {{REPO_URL}} | ✅ |
| 5 | Deployed system | {{PROD_URL}} | ✅ |
| 6 | Runbook | [`./runbook.md`](./runbook.md) | ✅ |
| 7 | User docs | [`./user-manual.md`](./user-manual.md) | ✅ |
| 8 | Admin docs | [`./admin-guide.md`](./admin-guide.md) | ✅ |
| 9 | KT session recording | [Fill link] | ✅ |
| [Fill all per SOW] | ... | ... | ... |

---

## 2. UAT Script

→ Companion: [`./uat-script.md`](./uat-script.md). Skeleton:

### 2.1 UAT Setup
- **Environment**: {{STAGING_URL}}
- **Test accounts**: [Fill: provided to client]
- **Test data**: [Fill: anonymized prod-like or seeded]
- **Duration**: 10 business days
- **Daily check-in**: [Fill: optional sync]

### 2.2 Test Scenarios (per User Story)

| US ID | Scenario | Expected Result | Tester | Status |
|---|---|---|---|---|
| US-001 | [Fill: numbered steps] | [Fill] | [Fill] | pass / fail / blocked |
| ... | ... | ... | ... | ... |

### 2.3 Defect Log

| ID | Severity | Description | Reproduction | Status |
|---|---|---|---|---|
| D-01 | S1/S2/S3/S4 | [Fill] | [Fill] | open / fixed / verified |

### 2.4 Acceptance Criteria

- [ ] All MUST stories pass UAT
- [ ] No S1 (Critical) defects open
- [ ] No more than [N] S2 (Major) open with workaround
- [ ] Performance targets met
- [ ] Acceptance form signed

---

## 3. User Documentation

→ [`./user-manual.md`](./user-manual.md) — for end users (non-technical).

Required sections:
- Getting started (login · onboarding)
- How-to guides per persona
- Common tasks step-by-step (with screenshots)
- Troubleshooting
- Glossary
- Support contact

Per R-TC-card: scannable headers · numbered steps · examples mandatory.

---

## 4. Admin Documentation

→ [`./admin-guide.md`](./admin-guide.md) — for client tech administrators.

Required sections:
- User management
- Configuration / settings
- Reporting / data export
- Backup verification
- Common admin tasks
- When to escalate to studio

---

## 5. Knowledge Transfer (KT)

### 5.1 KT Session
- **Duration**: 2 hours (per SOW §5)
- **Date**: [Fill]
- **Attendees**: [Fill: client tech lead · client PO · studio R-PM + CTO]
- **Recording**: [Fill link]
- **Q&A log**: [Fill link]

### 5.2 KT Coverage
- [ ] System architecture walkthrough
- [ ] Code repo tour
- [ ] How to deploy / rollback
- [ ] How to monitor + alerts
- [ ] How to add features (within scope)
- [ ] Where things live (docs map)
- [ ] How to reach studio for support

### 5.3 Post-KT Verification
- [ ] Client team can independently deploy a small change
- [ ] Client team can read alerts + take action
- [ ] Client team has access to all systems

---

## 6. Source Code Handoff

### 6.1 Repo Access
- **Repo URL**: {{REPO_URL}}
- **Access**: [Fill: granted to client team · IDs]
- **Branches**: `main` (prod) · `develop` (staging) · `feature/*`
- **Tags**: `v1.0.0` for prod release

### 6.2 IP Transfer (per SOW §12)
- [ ] Custom code → Client owns (upon final payment)
- [ ] Pre-existing IP → Studio retains
- [ ] Documentation → Client owns
- [ ] Trained models → Client owns
- [ ] Studio frameworks / templates → Studio retains

### 6.3 Repo Contents
- [ ] All commits clean (no secrets · no debug)
- [ ] README explains purpose + quick start
- [ ] LICENSE file present
- [ ] CONTRIBUTING (if open source intent)
- [ ] CHANGELOG up to date

---

## 7. Operational Handoff

### 7.1 Hosting Accounts
- [ ] Client owns hosting account (Vercel / AWS / etc.)
- [ ] Studio admin access removed (or kept per support contract)
- [ ] Billing transferred to client

### 7.2 Domain & DNS
- [ ] Domain owned by client
- [ ] DNS configured + verified

### 7.3 SaaS Subscriptions
- [ ] Client owns subscriptions (Anthropic · Helicone · etc.)
- [ ] API keys rotated to client-owned

### 7.4 Monitoring Access
- [ ] Client tech lead has Sentry / Helicone / hosting dashboard access
- [ ] Slack alert channel configured (or client equivalent)

---

## 8. Support Period

Per SOW §14 warranty:
- **Defect window**: 30 days post-acceptance
- **Studio fixes**: defects in delivered scope · no charge
- **Out-of-scope**: change request via SCR

### 8.1 Support Channels
- **Email**: [Fill]
- **Slack**: [Fill: shared channel · stays open 90 days]
- **Response SLA**: [Fill: 24h business hours · S1 same-day]

### 8.2 Post-30-Day Options
- **Retainer offer**: [Fill: monthly hours · pricing] — see CS pipeline
- **Time-and-materials**: [Fill: rate]
- **Project-based**: new SOW for new scope

---

## 9. Final Invoice Trigger

Per SOW §6.2 + sales pipeline S5:
- [ ] All MUST deliverables accepted
- [ ] Acceptance form signed
- [ ] R-FIN generates final invoice (50% balance)
- [ ] Net 30 starts from invoice date

→ Cross-pipeline handoff to CS pipeline (CS0 onboard) per R-EXE-12.

---

## 10. Memory & Learnings (Internal Trigger)

Per R-EXE-13 + R-MAS-05:
- [ ] R-σ flags retro candidates from this project
- [ ] Patterns posted to `99-retro.md`
- [ ] Memory promotion to `knowledge/docs/memory/{B,I}-learnings.md` reviewed by CTO

---

## 11. Acceptance Form

**Project**: {{PROJECT_NAME}} ({{PROJECT_ID}})
**SOW**: dated {{SOW_DATE}}

The undersigned confirms that:
- All deliverables in §1 have been received
- UAT scenarios in §2 have passed (with defect log noted)
- KT session in §5 was completed satisfactorily
- Source code + IP transfer in §6 is complete
- The project is hereby **ACCEPTED**

**Client signature**:
- Name: ____________________
- Title: ____________________
- Date: ____________________
- Signature: ____________________

**Studio signature**:
- {{COO_NAME}}, COO: ____________________
- Date: ____________________

---

## Cross-References

- P9 phase doc: [`@../../../experience/workspace/docs/pipeline/P9-DELIVERY.md`](../../../experience/workspace/docs/pipeline/P9-DELIVERY.md)
- SOW: [`02-sow.md`](02-sow.md)
- Sales S5 (close): [`@../../../experience/workspace/docs/pipelines-business/sales/S5-CLOSE.md`](../../../experience/workspace/docs/pipelines-business/sales/S5-CLOSE.md)
- CS handoff: [`@../../../experience/workspace/docs/pipelines-business/customer-success/CS0-ONBOARD.md`](../../../experience/workspace/docs/pipelines-business/customer-success/CS0-ONBOARD.md)
- Retro: [`99-retro.md`](99-retro.md)

---
*Template v1.0*
