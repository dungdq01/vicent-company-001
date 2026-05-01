# Mutual Non-Disclosure Agreement (NDA) — Template

> Bilateral / mutual NDA for pre-engagement (ICP-D/E enterprise OR sensitive ICP-A/B/C scenarios). Sign BEFORE discovery call when client shares business-confidential info.
>
> ⚠️ **Disclaimer**: not legal advice. Studio engages legal counsel for high-stakes agreements. Variables `{{...}}` filled at signing.
>
> **When NDA needed vs not**: NDA mandatory cho ICP-D (enterprise) + ICP-E (technical buyer). Optional cho ICP-A/B/C nhưng recommended nếu discovery call sẽ chạm trade secret / proprietary process / pricing strategy.

---

## Parties

**Party A**: {{STUDIO_LEGAL_NAME}}, {{STUDIO_ADDRESS}}, represented by {{STUDIO_REP_NAME}} ({{STUDIO_REP_TITLE}}).

**Party B**: {{CLIENT_LEGAL_NAME}}, {{CLIENT_ADDRESS}}, represented by {{CLIENT_REP_NAME}} ({{CLIENT_REP_TITLE}}).

**Effective Date**: {{EFFECTIVE_DATE}}

---

## 1. Purpose

Parties intend to discuss a potential business engagement related to {{ENGAGEMENT_DESCRIPTION — e.g., "AI consulting services for [Client]'s logistics operations"}}. To facilitate such discussions, each party may disclose Confidential Information to the other.

---

## 2. Confidential Information

"**Confidential Information**" means any non-public information disclosed by one party (Disclosing Party) to the other (Receiving Party) under this NDA, including but not limited to:

- Business plans, financial information, pricing strategy
- Customer lists, vendor relationships
- Technical specifications, source code, AI models, prompts, training data
- Trade secrets, proprietary processes
- Personnel information
- Marketing strategies, product roadmaps
- Any information marked "Confidential" or that would reasonably be understood as such

Confidential Information includes information disclosed verbally, in writing, electronically, or by observation.

---

## 3. Exclusions

Confidential Information does NOT include information that:
1. Was rightfully in Receiving Party's possession before disclosure (with documentary evidence)
2. Is or becomes publicly known through no fault of Receiving Party
3. Is independently developed by Receiving Party without use of Confidential Information (with documentary evidence)
4. Is rightfully received from a third party without confidentiality restriction
5. Is required by law, court order, or regulator to be disclosed (Receiving Party shall give prompt notice + cooperate to seek protective order)

---

## 4. Obligations of Receiving Party

Receiving Party shall:

1. **Hold in strict confidence** — protect Confidential Information with same degree of care as own confidential information (minimum: reasonable care)
2. **Use only for Purpose** — Confidential Information used solely to evaluate / pursue / perform the engagement contemplated in §1
3. **Limited access** — disclose only to employees, contractors, and advisors who:
   - Have legitimate need to know
   - Are bound by confidentiality obligations at least as strict as this NDA
4. **No unauthorized disclosure** — no public disclosure, press release, marketing reference without other party's prior written consent
5. **No reverse engineering** — not attempt to derive Confidential Information from products / services
6. **Secure storage** — physical, electronic, organizational measures per `_shared/standards/secrets-management.md` (when Studio is Receiving Party)
7. **Notify of breach** — within 24 hours of discovering any unauthorized disclosure / use, Receiving Party notifies Disclosing Party + cooperates to mitigate

---

## 5. Use of AI / LLM Tools (Studio-specific clause)

When Studio is Receiving Party processing Client's Confidential Information through AI tools:

- Confidential Information MAY be sent to approved AI providers (Anthropic, OpenAI per `_shared/standards/external-dependencies.md`) under existing DPA chains
- Confidential Information SHALL NOT be used for training third-party models (zero-retention agreements with vendors required)
- AI-derived analysis based on Confidential Information remains confidential
- Studio's own eval golden sets / case studies use redacted derivatives only per `_shared/standards/pii-redaction.md` + separate written consent (DPA §7)

---

## 6. Term

This NDA is effective from Effective Date and continues for {{TERM — typically 3 years}}, unless:
- Parties enter a definitive engagement (DPA + SOW) — superseded by those agreements as to engagement-specific data
- Earlier termination by mutual written agreement
- Either party gives 30-day written notice (only ends future obligations; survives for already-disclosed Confidential Information)

Confidentiality obligations for trade secrets continue indefinitely as long as such information remains a trade secret under applicable law.

---

## 7. Return / Destruction

Upon written request OR termination, Receiving Party shall, within 30 days:
- Return all tangible Confidential Information
- Permanently delete all electronic copies (including from AI provider caches where technically feasible)
- Provide written certification of destruction
- May retain ONE copy for legal compliance / dispute resolution (subject to continuing confidentiality)

---

## 8. No License or Warranty

Disclosure of Confidential Information does NOT grant Receiving Party any license, ownership, or rights in Confidential Information. All Confidential Information remains property of Disclosing Party.

Disclosing Party makes no warranty as to accuracy or completeness of Confidential Information disclosed.

---

## 9. No Obligation to Engage

This NDA does not obligate either party to:
- Disclose any specific Confidential Information
- Enter any further business relationship
- Refrain from competing or pursuing other opportunities (except as to use of Confidential Information)

---

## 10. Equitable Relief

Parties acknowledge that breach of this NDA may cause irreparable harm not adequately compensable by monetary damages. Disclosing Party may seek injunctive / equitable relief in addition to other remedies, without need to post bond.

---

## 11. Liability Cap

Aside from breach of confidentiality (no cap on damages from confidentiality breach):
- Indirect, consequential, special damages excluded
- Cap on direct damages: {{e.g., "$10,000 OR 12 months of fees paid (when applicable)"}}

---

## 12. Governing Law + Disputes

This NDA governed by laws of {{JURISDICTION — typically Vietnam OR Singapore for international clients}}. Disputes resolved by:
- ☐ Negotiation (30 days) → Mediation → {{Court / Arbitration body}}
- Specific arbitration body: {{e.g., "VIAC Vietnam International Arbitration Centre" OR "SIAC Singapore"}}

---

## 13. General

- **Assignment**: neither party may assign without other's written consent
- **Amendment**: only in writing signed by both parties
- **Severability**: if any clause invalid, remainder enforceable
- **Entire agreement**: this NDA is entire agreement between parties on subject matter; supersedes prior NDAs
- **Counterparts**: signed in counterparts (electronic signatures valid per VN Law on Electronic Transactions)

---

## 14. Signatures

**Party A — Studio**:
Name: {{STUDIO_REP_NAME}}
Title: {{STUDIO_REP_TITLE}}
Date: ___________
Signature: ___________

**Party B — Client**:
Name: {{CLIENT_REP_NAME}}
Title: {{CLIENT_REP_TITLE}}
Date: ___________
Signature: ___________

---

## Cross-References

- DPA template (post-engagement): [`@./DPA-template.md`](DPA-template.md)
- VN compliance: [`@../../standards/compliance/vn.md`](../../standards/compliance/vn.md)
- External dependencies / AI vendors: [`@../../standards/external-dependencies.md`](../../standards/external-dependencies.md)
- Secrets management: [`@../../standards/secrets-management.md`](../../standards/secrets-management.md)
- PII redaction (eval golden sets): [`@../../standards/pii-redaction.md`](../../standards/pii-redaction.md)
- Sales playbook (when NDA needed): [`@../../../business-strategy/12-sales-playbook.md`](../../../business-strategy/12-sales-playbook.md) §3 discovery
- Document catalog: [`@../../standards/document-catalog.md`](../../standards/document-catalog.md) SAL-03

---
*Template v1.0 — 2026-04-27. Customized per engagement; legal counsel review for ICP-D/E.*
