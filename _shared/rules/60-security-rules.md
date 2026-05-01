---
file: 60-security-rules
version: v1.0
last_updated: 2026-04-26
owner: CTO
status: production
---

# Security Rules — Code · Data · LLM

> Tất cả MUST. Không có "soft" trong security.

---

## R-SEC-01 — Secrets Management

- MUST NOT commit secrets to git (`.env*` in `.gitignore`)
- MUST use secret manager in prod: Doppler · Vault · 1Password Connect · cloud KMS
- MUST mask secrets in logs (last 4 chars only)
- MUST rotate API keys quarterly
- MUST scope keys minimally (read vs write · per environment)

> Auto-check: `gitleaks` or `trufflehog` in pre-commit + CI.

---

## R-SEC-02 — Auth

- MUST NOT roll-your-own auth (use Clerk · NextAuth · Supabase Auth · Auth0)
- Passwords (if any): Argon2id, never MD5/SHA1
- Sessions: httpOnly cookies, SameSite=Lax, Secure in prod
- MFA required for: admin · payment · prod console
- JWTs: short-lived access (15 min), refresh tokens rotated

---

## R-SEC-03 — Encryption

- TLS 1.2+ everywhere (HTTPS strict)
- HSTS preload for all public domains
- Database at-rest encryption enabled (RDS / Supabase default)
- Sensitive PII column-level encryption (e.g., national ID)
- MUST NOT custom-implement crypto (use libsodium · WebCrypto)

---

## R-SEC-04 — Input Validation

- Validate at API boundary (zod · pydantic · valibot)
- Sanitize HTML output (DOMPurify · bleach)
- Parameterized SQL only (never concat)
- File uploads: MIME validation + size limit + AV scan if user-provided
- Rate limit per IP + per user (Upstash · Redis)

---

## R-SEC-05 — OWASP Top 10 Coverage

For every web project, R-SE MUST verify:
1. Broken Access Control → IDOR check + RBAC tests
2. Cryptographic Failures → all data classified + protected per class
3. Injection → parameterized + ORM
4. Insecure Design → threat model done (P3)
5. Security Misconfiguration → CSP + secure headers
6. Vulnerable Components → SCA in CI (snyk · trivy)
7. Auth/Session → Clerk-tier or equivalent
8. Software/Data Integrity → signed artifacts · SBOM
9. Logging/Monitoring → structured logs + alerting
10. SSRF → URL allow-list for fetch from user input

---

## R-SEC-06 — LLM-Specific: Prompt Injection

Prompts handling user input MUST:
- Separate **system instructions** from **user data** (XML tags or distinct sections)
- Never grant LLM tool execution on user-controlled prompt without confirmation
- Maintain instruction-data boundary in chains
- Test with prompt injection golden set: `_shared/eval/golden-sets/prompt-injection.yaml`
- Log + alert on suspected injection (e.g., "ignore previous instructions")

> See `_shared/eval/failure-modes.md` for catalogue.

---

## R-SEC-07 — LLM-Specific: PII / Data Leakage

- MUST NOT send: client raw PII · payment data · health records to third-party LLM without DPA
- MUST mask in logs (regex for emails · phones · IDs)
- Helicone / Langfuse: config to hash sensitive fields before storage
- For HIPAA/PCI client: use BAA-covered LLM service (Anthropic offers)
- Right-to-be-forgotten: trace which agent runs touched user data

---

## R-SEC-08 — LLM-Specific: Output Safety

Generated content MUST go through safety filter when:
- Public-facing (content publishing · email send)
- Touches money (invoice generation · refund)
- Touches contracts (R-LEG output)
- Touches code that auto-deploys

Filter checks: hallucinated PII · fabricated quotes · harmful instructions · disallowed claims.

---

## R-SEC-09 — Tool Use Safety

When agent uses tools (web_search · code_exec · file_io · email_send):
- Tool list MUST be in skill card
- Tools that modify state (send · delete · pay): require human confirmation step
- Sandboxed code execution only (Pyodide · Modal · isolated container)
- Web search results: cite source URL + don't auto-action on extracted data

---

## R-SEC-10 — Audit Logging

MUST log + retain (≥ 90 days):
- All admin actions (config change · user grant)
- All auth events (login · logout · MFA fail)
- All payment events (invoice · refund · charge)
- All LLM prompt + completion (sampled if cost-prohibitive)
- All agent escalations + decisions

Logs MUST be: append-only · timestamped · user-attributed · stored in dedicated index.

---

## R-SEC-11 — Dependency Hygiene

- CI MUST run: `npm audit` / `pip-audit` / `cargo audit` / `trivy`
- Critical CVE → block merge
- High CVE → patch within 7 days
- Quarterly dep review (R-OPS)
- MUST NOT use deprecated packages without sunset plan

---

## R-SEC-12 — Backup & DR

- DB backups: daily · retained 30 days · encrypted · stored cross-region
- Restore drill: quarterly (mandatory; logged in runbook)
- RPO ≤ 24h · RTO ≤ 4h for prod
- MUST document failure modes + recovery in P8 runbook

---

## R-SEC-13 — Pen-Testing

Before production launch (P8), MUST:
- Internal scan: OWASP ZAP / Burp
- For HIPAA / PCI / enterprise client: 3rd-party pen-test
- Findings categorized: critical (block) · high (fix before launch) · medium / low (backlog)
- Re-test after fix

---

## R-SEC-14 — Incident Response

Per `quality/EVAL-GATES` + this rule:
- SEV-1: < 1h response · CEO + CTO notified · runbook step-through
- Post-mortem within 5 days (blameless · written · public-internal)
- Memory entry in `knowledge/docs/memory/` if pattern
- Customer notification per regulation (GDPR 72h · etc.)

---

## R-SEC-15 — Forbidden Globally

- ❌ Production credentials in dev environment
- ❌ Customer data in dev / staging unless anonymized
- ❌ Personal API keys in shared services
- ❌ "We'll add auth later"
- ❌ Disabling security warnings without ADR
- ❌ HTTP (non-HTTPS) public endpoints
- ❌ Storing tokens in localStorage
- ❌ Console.log of full prompt with PII
- ❌ Auto-execute LLM-generated code without sandbox + human ✓

---

## Quick Reference

```
SECURITY RULES (R-SEC):
01 Secrets manager · 02 No roll-your-own auth · 03 Encryption
04 Input validation · 05 OWASP top 10 · 06 Prompt injection
07 PII / data leak · 08 Output safety · 09 Tool use safety
10 Audit logging · 11 Dep hygiene · 12 Backup DR
13 Pen-test · 14 Incident response · 15 Forbidden global
```

---

## Cross-References

- R-SE skill card: [`@../.agents/tier-2-engineering/R-SE-security-engineer.md`](../.agents/tier-2-engineering/R-SE-security-engineer.md)
- Failure modes (LLM): [`@../eval/failure-modes.md`](../eval/failure-modes.md)
- CTO charter: [`@../.agents/tier-0-executive/CTO-charter.md`](../.agents/tier-0-executive/CTO-charter.md)

---
*v1.0*
