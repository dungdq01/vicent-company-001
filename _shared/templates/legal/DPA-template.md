# Data Processing Agreement (DPA) — Template

> Bilateral DPA between Studio (Processor) and Client (Controller). Append to SOW. Per VN PDPA + NĐ 13 + GDPR (when applicable).
>
> ⚠️ **Disclaimer**: this is a template, NOT legal advice. Studio engages legal counsel to customize per engagement. Variables `{{...}}` filled at signing.

---

## Parties

**Controller** (Client): {{CLIENT_LEGAL_NAME}}, {{CLIENT_ADDRESS}}, represented by {{CLIENT_REP_NAME}} ({{CLIENT_REP_TITLE}}).

**Processor** (Studio): {{STUDIO_LEGAL_NAME}}, {{STUDIO_ADDRESS}}, represented by {{STUDIO_REP_NAME}} ({{STUDIO_REP_TITLE}}).

**Effective date**: {{EFFECTIVE_DATE}}

**Project / SOW reference**: {{PROJECT_ID}} — {{SOW_REFERENCE}}

---

## 1. Subject Matter

Processor processes Personal Data on behalf of Controller for the purpose of delivering services per SOW {{SOW_REFERENCE}}, specifically:

- {{LIST_PROCESSING_PURPOSES — e.g., "AI bot reply automation for Telegram channel sales"}}

Categories of Data Subjects:
- {{e.g., "End users of Controller's Telegram channel"}}

Categories of Personal Data:
- Basic: {{e.g., "Telegram username, chat_id, message content"}}
- Sensitive (if any): {{e.g., "none" OR "purchase history"}}

---

## 2. Duration

This DPA effective from Effective Date until: {{EARLIEST OF: SOW termination + 90 days post-data-handling completion}}.

---

## 3. Lawful Basis (Controller's responsibility)

Controller represents that lawful basis for processing exists per VN PDPA / NĐ 13 / GDPR (as applicable):
- ☐ Consent (recorded per `compliance/vn.md` §3)
- ☐ Contract performance
- ☐ Legitimate interest (with assessment documented)
- ☐ Legal obligation
- ☐ Vital interest
- ☐ Public task

Controller provides documentation upon Processor request.

---

## 4. Processor Obligations

Processor shall:

1. **Process only on documented instructions** from Controller (SOW + this DPA) — no other processing
2. **Confidentiality** — all personnel with access bound by NDA
3. **Security measures** per `_shared/standards/secrets-management.md`:
   - Encryption in transit (TLS 1.2+)
   - Encryption at rest (AES-256 for sensitive)
   - Access controls (least-privilege per `secrets-management.md` §5)
   - Logging + monitoring (per R-SRE / R-DataOps)
4. **Subprocessor management** — list of subprocessors:

   | Subprocessor | Service | Location | DPA in place |
   |---|---|---|---|
   | Anthropic | Claude API | US | ✅ |
   | Helicone | Trace + cost dashboard | US | ✅ |
   | Fly.io | App hosting | SGN region (or per project) | ✅ |
   | {{ADD per project}} | | | |

   Adding new subprocessor: 30-day notice to Controller; right to object.

5. **Data subject rights support** — within SLA per `compliance/vn.md` §4 (typically 7 days for access/rectify/delete)
6. **Breach notification** — to Controller within 24h of detection (per VN: + Bộ Công an within 72h jointly with Controller)
7. **Data return / deletion** — at end of services: return or delete all Personal Data within 30 days unless legal retention required
8. **Audit** — Controller may audit Processor's compliance once per year (90-day notice; Processor may charge reasonable cost)

---

## 5. Cross-Border Transfer

If data leaves VN territory (e.g., to Anthropic in US):
- Controller acknowledges + consents
- Processor uses appropriate safeguards (DPA chain, standard contractual clauses where applicable)
- Cross-border flow logged in `projects/{id}/_meta/data-flow.md`

---

## 6. Data Subject Rights — Operational

Processor implements + supports:
- ☐ Right to know
- ☐ Right to access
- ☐ Right to rectify
- ☐ Right to delete
- ☐ Right to restrict
- ☐ Right to data portability
- ☐ Right to object

Controller is primary point of contact for data subject requests; Processor supports execution.

---

## 7. Use of Real Data in Studio Eval (PII Redaction)

Per `_shared/standards/pii-redaction.md`:

Processor MAY use anonymized samples of processing data for:
- Internal eval golden sets (improve Processor's services for all clients)
- Case studies (publication only with separate Client written consent)

Processor commits to:
- PII redaction per `pii-redaction.md`
- 0 direct identifiers in any sample retained
- k-anonymity ≥ 5 for quasi-identifiers
- Cross-project use only with redacted, non-identifying derivatives

Controller has right to opt out (entire engagement opts out by checking ☐ here: ___).

---

## 8. Liability

Processor liability capped per main SOW terms. Direct damages from Processor breach of this DPA: cap at 12 months of fees paid.

Indirect / consequential damages excluded.

Force majeure standard.

---

## 9. Termination

Either party may terminate:
- For cause (material breach): 30-day cure period, then terminate
- For convenience: per main SOW terms
- On insolvency / bankruptcy: immediate

Upon termination, §4.7 (data return / deletion) executes within 30 days.

---

## 10. Governing Law

This DPA governed by laws of {{JURISDICTION — typically Vietnam}}. Disputes resolved by {{ARBITRATION_BODY OR COURT}}.

---

## 11. Signatures

Controller:
**Name**: {{CLIENT_REP_NAME}}
**Title**: {{CLIENT_REP_TITLE}}
**Date**: ___________
**Signature**: ___________

Processor:
**Name**: {{STUDIO_REP_NAME}}
**Title**: {{STUDIO_REP_TITLE}}
**Date**: ___________
**Signature**: ___________

---

## Cross-References

- VN compliance: [`@../../standards/compliance/vn.md`](../../standards/compliance/vn.md)
- PII redaction: [`@../../standards/pii-redaction.md`](../../standards/pii-redaction.md)
- Secrets management: [`@../../standards/secrets-management.md`](../../standards/secrets-management.md)
- R-DataOps: [`@../../.agents/tier-2-engineering/R-DataOps-data-operations.md`](../../.agents/tier-2-engineering/R-DataOps-data-operations.md)
- SOW template: [`@../project/02-sow.md`](../project/02-sow.md)

---
*Template v1.0 — 2026-04-27. Customized per engagement; legal counsel review before sign.*
