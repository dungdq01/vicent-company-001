---
file: 08-deploy
project_id: {{PROJECT_ID}}
phase: P8
filled_by: R-DO + R-SE + R-CE (if cloud)
last_updated: {{P8_DATE}}
status: draft | reviewed | deployed
---

# {{PROJECT_NAME}} — Deployment & Operations

> P8 deliverable. Infra · CI/CD · monitoring · runbook · security checklist. **CTO sign-off mandatory** before production.

---

## 0. Document Control

- **Owner**: R-DO + R-SE
- **Reviewers**: CTO · COO · Client tech lead
- **Eval**: [Fill ≥ 7.5]
- **CTO production approval**: [Fill name · date] (R-EXE-09)

---

## 1. Deployment Overview

- **Hosting**: [Fill: Vercel · Railway · AWS · self-hosted]
- **Domain**: [Fill: app.{{client_domain}}]
- **CDN**: [Fill]
- **DB host**: [Fill]
- **Region(s)**: [Fill: per data residency requirement]

---

## 2. Environments

| Env | URL | Purpose | Auto-deploy from |
|---|---|---|---|
| Dev | localhost | Local dev | — |
| Preview | `pr-{n}.{{app}}.{{domain}}` | PR review | per PR |
| Staging | `staging.{{app}}.{{domain}}` | UAT + pre-prod | `develop` branch |
| Production | `app.{{domain}}` | Live | `main` branch (manual approve) |

---

## 3. CI/CD Pipeline

### 3.1 CI (every push)
1. Install deps (cached)
2. Lint (ESLint · Prettier check)
3. Typecheck (`tsc --noEmit`)
4. Unit + integration tests
5. SAST (semgrep)
6. SCA (snyk / trivy)
7. Build
8. Eval golden set (LLM components)

### 3.2 CD (per environment)
- **Preview**: auto-deploy on PR
- **Staging**: auto-deploy on merge to `develop`
- **Production**: manual approve after staging UAT pass

### 3.3 Quality Gates (block deploy)
- [ ] All CI checks green
- [ ] Eval golden sets pass per R-QAL-02
- [ ] No critical CVE
- [ ] Code review approved (≥ 1 per R-COD-12)
- [ ] No secrets detected (gitleaks)

### 3.4 Rollback Strategy
- **Vercel/Railway**: 1-click previous deployment
- **DB migrations**: down scripts ready (R-DBE-card)
- **Feature flags**: toggle to disable new feature
- **Time to rollback target**: ≤ 5 min

---

## 4. Infrastructure as Code (IaC)

Per R-CE-card: 100% IaC, no clickops.

- **Tool**: [Fill: Terraform · Pulumi · Vercel CLI · etc.]
- **Repo**: [Fill: same repo `infra/` · separate]
- **State**: [Fill: cloud-stored · locked]

```hcl
# Example structure
infra/
├── main.tf
├── variables.tf
├── outputs.tf
└── modules/
    └── [module]/
```

---

## 5. Secrets Management

Per R-SEC-01:

| Secret | Manager | Rotation | Scope |
|---|---|---|---|
| Database URL | [Fill: Doppler / Vault] | quarterly | per env |
| Anthropic API key | [Fill] | quarterly | per env |
| Auth provider keys | [Fill] | quarterly | per env |
| [Fill all] | ... | ... | ... |

- [ ] No secrets in git (gitleaks scan clean)
- [ ] Production keys never in dev / staging (per R-SEC-15)
- [ ] Masking in logs (last-4 only)

---

## 6. Monitoring & Observability

### 6.1 Logs
- **Provider**: [Fill: Vercel · Logflare · Datadog]
- **Retention**: [Fill: ≥ 30 days]
- **PII masking**: [Fill: regex applied]

### 6.2 Errors
- **Provider**: [Fill: Sentry]
- **Alert channels**: Slack `#alerts`
- **Severity routing**: per R-COM-08

### 6.3 Metrics
- **App metrics**: [Fill]
- **LLM telemetry**: Helicone (mandatory)
- **DB metrics**: [Fill: hosting provider built-in]

### 6.4 Dashboards
| Dashboard | Owner | Audience |
|---|---|---|
| Health overview | CTO | Founders |
| Cost tracking | COO | Founders |
| LLM eval drift | CTO | Studio |
| User analytics | CEO | Founders + Client |

### 6.5 Alerts

| Alert | Trigger | Channel | Severity |
|---|---|---|---|
| App down | Uptime miss > 2 min | Slack `#alerts` + SMS | SEV-1 |
| Error spike | > 50/min | Slack | SEV-2 |
| LLM cost spike | > 130% baseline | Slack | SEV-2 |
| Eval drift | Score drop > 0.5 | Slack | SEV-2 |
| DB CPU > 80% | sustained 5 min | Slack | SEV-3 |
| [Fill more] | ... | ... | ... |

---

## 7. Backup & Disaster Recovery

Per R-SEC-12:

| Asset | Backup | Retention | Restore RPO/RTO |
|---|---|---|---|
| Database | Daily auto-snapshot | 30 days · cross-region | RPO 24h · RTO 4h |
| File storage | Versioning + replication | indefinite | RPO 1h · RTO 1h |
| Secrets | Manager backup | continuous | RPO 0 · RTO 30m |
| Code | Git (multiple remotes) | indefinite | RPO 0 · RTO 5m |

### 7.1 Restore Drill
- **Frequency**: quarterly
- **Last drill**: [Fill date]
- **Outcome**: [Fill: pass / issues]

---

## 8. Security Checklist (Pre-Launch)

Per R-SEC-05 OWASP Top 10:

- [ ] Auth flows tested (login · logout · password reset · MFA)
- [ ] Authorization tested (cross-tenant · IDOR)
- [ ] All inputs validated at boundary
- [ ] All outputs escaped (XSS prevention)
- [ ] Parameterized SQL only (SQLi prevention)
- [ ] CSRF protection enabled
- [ ] Security headers (CSP · HSTS · X-Frame-Options)
- [ ] Rate limiting per endpoint
- [ ] Audit logging on admin · auth · payment events
- [ ] Backup tested (restore drill)
- [ ] Secrets in manager, not env files in git
- [ ] HTTPS only · TLS 1.2+
- [ ] LLM-specific: prompt injection golden set passes (R-SEC-06)
- [ ] LLM-specific: PII not in prompts to 3rd party (R-SEC-07)
- [ ] Pen-test done (if HIPAA / PCI / enterprise per R-SEC-13)
- [ ] Dependency audit clean (no critical CVE)

---

## 9. Runbook

→ Companion file: [`./runbook.md`](./runbook.md). Required topics:

| Operation | Description | Owner |
|---|---|---|
| Deploy to prod | Step-by-step | R-DO |
| Rollback | Step-by-step | R-DO |
| Scale up DB | When and how | R-DBE |
| Rotate secrets | Quarterly + on-leak | R-SE |
| Restore from backup | Tested quarterly | R-DO |
| Enable maintenance mode | When and how | R-DO |
| Investigate SEV-1 | Decision tree | CTO |
| Investigate SEV-2 | Decision tree | CTO / R-DO |
| Cost spike investigation | Helicone + DB query patterns | CTO |
| LLM eval drift response | Pause prompt · investigate | CTO |
| Add new env var | Where + how | R-DO |
| Onboard new admin user | Steps + audit | R-DO |
| [Fill ≥ 10 ops] | ... | ... |

💡 Hint: Per P8 DoD (R-DO-card): runbook covers ≥ 10 operations.

---

## 10. Compliance Documentation (if applicable)

- **GDPR**: data subject rights flow · DPA · DPIA
- **HIPAA**: BAA · audit logs · PHI handling
- **SOC 2**: evidence collection ongoing
- **PCI**: scope minimization · ASV scan
- [Fill applicable]

---

## 11. Cost Monitoring

| Cost Category | Monthly Cap | Alert at | Action on breach |
|---|---|---|---|
| Cloud / hosting | [Fill USD] | 80% | COO review |
| LLM API | [Fill USD] | 80% | CTO review |
| Storage | [Fill] | 80% | COO review |
| **Total** | **[Fill]** | 80% | All-founders |

Per R-MAS-07: hard halt if project cumulative > 100% cap.

---

## 12. Production Launch Checklist

- [ ] Staging UAT pass
- [ ] Production secrets configured
- [ ] DNS configured + SSL active
- [ ] Monitoring active + tested
- [ ] Backup verified
- [ ] Runbook reviewed by R-DO
- [ ] Security checklist all green
- [ ] Performance baseline captured
- [ ] Stakeholders notified of go-live time
- [ ] Rollback plan rehearsed
- [ ] CTO production approval signed (R-EXE-09)
- [ ] Client tech lead notified

---

## 13. Sign-Off

- **R-DO eval**: [Fill]
- **R-SE security audit**: [Fill]
- **CTO production approval**: [Fill name · date]
- **Client tech lead**: [Fill]
- **Go-live date**: [Fill]

---

## Cross-References

- P8 phase doc: [`@../../../experience/workspace/docs/pipeline/P8-DEPLOYMENT.md`](../../../experience/workspace/docs/pipeline/P8-DEPLOYMENT.md)
- Security rules: [`@../../rules/60-security-rules.md`](../../rules/60-security-rules.md)
- Execution rules: [`@../../rules/30-execution-rules.md`](../../rules/30-execution-rules.md)
- R-DO card: [`@../../.agents/tier-2-engineering/R-DO-devops.md`](../../.agents/tier-2-engineering/R-DO-devops.md)
- R-SE card: [`@../../.agents/tier-2-engineering/R-SE-security-engineer.md`](../../.agents/tier-2-engineering/R-SE-security-engineer.md)

---
*Template v1.0*
