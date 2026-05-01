---
file: compliance/vn
jurisdiction: Vietnam
version: v1.0
last_updated: 2026-04-27
owner: COO + R-DataOps
status: production
---

# VN Compliance Checklist — PDPA + NĐ 13/2023

> Vietnam Personal Data Protection Decree 13/2023/NĐ-CP (effective 2023-07-01) + Law on Cybersecurity 2018 + sector regulations. **Mandatory** for any project handling VN user data.
>
> ⚠️ **Disclaimer**: not legal advice. Studio engages legal counsel for client engagement. This file = operational checklist for studio + R-DataOps weekly audit.

---

## 1. Scope of Application

VN compliance applies if ANY of:
- Data subject is VN resident or citizen
- Data processing happens in VN territory
- Service is targeted to VN market (regardless of subject location)
- Project has VN client OR VN end-user

→ Most studio projects in Phase 1-2 trigger VN compliance.

---

## 2. Personal Data Categories (NĐ 13 Art. 2)

| Category | Examples | Handling |
|---|---|---|
| **Basic personal data** | Name, DOB, gender, nationality, ID #, phone, email, address, image | Standard processing rules |
| **Sensitive personal data** | Health, biometric, sexual orientation, criminal record, financial, location, web activity, racial/ethnic origin, religion | Stricter — explicit consent + DPA + retention limit |

→ For each project, R-DataOps inventories which categories are touched.

---

## 3. Mandatory Consent (NĐ 13 Art. 11)

Consent MUST be:
1. Explicit (opt-in, not pre-checked)
2. Specific to purpose (no blanket "for marketing")
3. Informed (data subject knows what + why + retention + 3rd parties)
4. Recordable (timestamp, version of notice consented to)
5. Withdrawable (UI must support, processed within 72 hours)

**Studio implementation**:
- Bot products → consent message at first interaction, button-click consent recorded
- Web products → checkbox + privacy notice link + consent log entry
- Always-on services → annual re-consent required

---

## 4. Data Subject Rights (NĐ 13 Art. 9-10)

System MUST support:

| Right | SLA | Handling |
|---|---|---|
| Right to know | 72h response | Auto-export from harness/memory + project DB |
| Right to access | 7 days | Self-service portal OR P3 email handling |
| Right to rectify | 7 days | Direct edit + audit log |
| Right to delete | 7 days | Hard delete + cascade to backups within 30 days |
| Right to restrict processing | 72h | Flag in DB, processing pipeline checks flag |
| Right to data portability | 7 days | Export JSON/CSV |
| Right to object | 72h | Stop processing, retain only what's required by law |

R-DataOps verifies all 7 rights operational before any production deploy.

---

## 5. Retention Limits (NĐ 13 Art. 4 + 12)

| Data type | Default retention | Override |
|---|---|---|
| Active user account data | While account active + 90 days post-deletion | — |
| Chat / message logs (Telegram, web chat) | 90 days max | Specific need + DPA |
| Transaction records | As required by tax/accounting law (typically 5-10 years) | — |
| Anonymized analytics | Indefinite | Must be truly anonymized (k-anon ≥ 5) |
| Sensitive data | Minimum needed only | DPA + R-DataOps audit |

R-DataOps weekly: identify records past retention SLA → propose purge per `harness/permanent-fixes.md` flow.

---

## 6. Cross-Border Transfer (NĐ 13 Art. 25-29)

Data leaving VN to foreign provider:

| Provider | Jurisdiction | Risk | Mitigation |
|---|---|---|---|
| Anthropic (US) | US | Cross-border | DPA in place; data minimization in prompt; no sensitive PII in prompt |
| OpenAI (US) | US | Cross-border | Same |
| Helicone (US) | US | Cross-border | DPA; trace data sanitized |
| Stripe (US/IE) | US/EU | Cross-border | DPA; PCI compliance — minimal data |
| Telegram (UAE/global) | non-EU | Cross-border | Per ToS; bot doesn't transmit sensitive PII |
| Fly.io SGN region | Singapore | APAC | DPA; SG PDPA jurisdiction |

**Documentation requirement**: every cross-border transfer logged in `projects/{id}/_meta/data-flow.md` with: data category, destination, purpose, lawful basis.

---

## 7. Notification of Breach (NĐ 13 Art. 23)

If breach occurs:
1. Internal Sev 0/1 incident per `incident-severity.md`
2. Notify Bộ Công an (A05) within 72 hours
3. Notify affected data subjects without undue delay
4. Postmortem + remediation log
5. Consider client comms per DPA terms

---

## 8. Cybersecurity Law (2018) Sectoral Hooks

If project is in regulated sector — additional requirements:

| Sector | Regulation | Studio impact |
|---|---|---|
| Financial / banking | NHNN regulations on AI use, KYC, AML | Likely defer until R-Compliance hired |
| Healthcare | Bộ Y tế data rules (HIPAA-equivalent) | Defer |
| Telecom | Bộ TT&TT licensing | Defer |
| E-commerce | Bộ Công Thương — invoice + tax | Standard for MMO TG seller — Stripe + invoice |

For Phase 1-2, studio focuses on E-commerce + Logistics + Education sectors (lower regulatory burden).

---

## 9. Studio Operational Checklist (per project)

```yaml
vn_compliance_check:
  - [ ] Identify if VN compliance applies (per §1)
  - [ ] Categorize personal data touched (basic vs sensitive, §2)
  - [ ] Implement consent flow (§3)
  - [ ] Implement 7 data subject rights (§4)
  - [ ] Set retention SLA per category (§5)
  - [ ] Document cross-border flows (§6)
  - [ ] Setup breach notification chain (§7)
  - [ ] Sector-specific items if applicable (§8)
  - [ ] DPA signed with client (`_shared/templates/legal/DPA-template.md`)
  - [ ] R-DataOps weekly audit configured
```

R-DataOps owns this checklist — verify before P8 production deploy.

---

## 10. Cross-References

- R-DataOps: [`@../../.agents/tier-2-engineering/R-DataOps-data-operations.md`](../../.agents/tier-2-engineering/R-DataOps-data-operations.md)
- Knowledge curation (PII in eval): [`@../knowledge-curation.md`](../knowledge-curation.md) §4
- DPA template: [`@../../templates/legal/DPA-template.md`](../../templates/legal/DPA-template.md)
- PII redaction: [`@../pii-redaction.md`](../pii-redaction.md)
- Security rules: [`@../../rules/60-security-rules.md`](../../rules/60-security-rules.md)

---
*v1.0 — Adopted 2026-04-27. Operational checklist; legal counsel engages per project.*
