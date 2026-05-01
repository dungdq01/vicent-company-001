---
file: secrets-management
version: v1.0
last_updated: 2026-04-27
owner: CTO
status: production
---

# Secrets Management Standard

> Per R-SEC + closes lỗ hổng #14 (credential management vắng). Defines where secrets live, who has access, rotation cadence, leak response.

---

## 1. What is a Secret

Anything that grants access — and exposure causes incident. Examples:
- API keys (Anthropic, OpenAI, Helicone, Stripe, Wise, Telegram bot token)
- DB credentials (Postgres, vector store)
- OAuth client_secret + refresh_token
- Webhook signing secrets
- SSH keys
- Service account JSON
- Personal access tokens (GitHub, Notion)
- Internal JWT signing keys

**Cấm**: any secret in `git`, in `*.md`, in agent prompts, in chat logs, in client docs.

---

## 2. Storage Hierarchy

| Tier | What | Where | Access |
|---|---|---|---|
| **L0 Personal** | Founder's individual API keys, dev tokens | OS keychain (macOS Keychain / 1Password / Bitwarden) | Owner only |
| **L1 Studio** | Studio-shared (Helicone master, Anthropic org) | **Doppler** (or 1Password Teams) | All founders |
| **L2 Project** | Per-client project secrets (their Telegram token, their DB pass) | Doppler project namespace `studio/{project_id}/` | Project team only |
| **L3 Production** | Deployed env (Fly.io / Vercel / cloud) | Platform secret store (Fly secrets, Vercel env, AWS Secrets Manager) | Production access list |

**Default**: Doppler for L1+L2. Cloud platform native for L3.

---

## 3. Allowed Patterns

### In code
```typescript
// ✅ CORRECT
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

// ❌ NEVER
const apiKey = "sk-ant-api03-...";
```

### In docs
```markdown
✅ "API key in `ANTHROPIC_API_KEY` env var (Doppler `studio` project)"
❌ "API key: sk-ant-..."
```

### In agent prompts
- Inject secret references, NEVER values
- Engine substitutes at runtime, never at template authoring

### In `.env` files
- `.env` ALWAYS in `.gitignore`
- Use `.env.example` (committed) with placeholder values: `ANTHROPIC_API_KEY=<get-from-doppler>`

---

## 4. Rotation Cadence

| Secret type | Rotation cadence | Trigger event also |
|---|---|---|
| API keys (vendor) | Every 90 days OR on suspected leak | New team member onboards/offboards, vendor security incident |
| DB credentials | Every 180 days OR on access list change | Engineer leaves team |
| OAuth refresh tokens | Per provider's TTL | — |
| Webhook signing secrets | Every 180 days | Endpoint change |
| SSH keys | Annually | Ownership transfer |
| Bot tokens (Telegram, Discord) | On suspected compromise OR annually | Account takeover sign |

Rotation logged in `_shared/standards/secrets-rotation-log.md` (private — not committed publicly if studio repo open-source).

---

## 5. Access Provisioning

When new team member joins:
1. Doppler invite to `studio/` namespace (read-only initial)
2. Per-project access granted as project assigned (least-privilege)
3. Production access requires CTO sign + 24h waiting period (anti-impulse)

When team member leaves:
1. Revoke Doppler immediately
2. Rotate all secrets they had access to within 24h
3. Audit log of last 30 days actions
4. Cloud platform access removed

---

## 6. Leak Response

If secret leaked (in code, in chat, in client comm):
1. **Sev 1 incident** per `incident-severity.md`
2. Rotate leaked secret within 1h
3. Audit access logs for unauthorized use
4. Notify CTO + COO immediately
5. If client-impacting: notify client per W05 + DPA terms
6. Postmortem within 7 days
7. Permanent-fix: add detection (pre-commit hook, scanner)

---

## 7. Detection / Prevention

| Tool | Purpose |
|---|---|
| `pre-commit` hook scanning for secrets pattern | Block commit if secret pattern detected (regex: `sk-`, `Bearer `, `password=`, `AKIA`) |
| `gitleaks` or `truffleHog` in CI | Scan PR + main branch |
| Helicone / observability — alert on raw key in trace | Catch leaks via API call inspection |
| Quarterly access audit | Who has what — least-privilege check |

---

## 8. Cross-References

- Security rules: [`@../rules/60-security-rules.md`](../rules/60-security-rules.md)
- Master forbidden: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-11
- Incident playbook: [`@../../experience/workspace/docs/workflows/W05-incident-response.md`](../../experience/workspace/docs/workflows/W05-incident-response.md)
- DPA (client data handling): [`@../templates/legal/DPA-template.md`](../templates/legal/DPA-template.md)

---
*v1.0 — Adopted 2026-04-27. Closes lỗ hổng #14 from framework critique.*
