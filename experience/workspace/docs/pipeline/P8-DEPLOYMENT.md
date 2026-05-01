# P8 — Deployment

> Infrastructure, CI/CD, monitoring, runbook, security.

**Canonical**: [`@../../../../business-strategy/13-product-delivery-process.md:461-484`](../../../../business-strategy/13-product-delivery-process.md)
**Prev**: [`P7-QA.md`](P7-QA.md) — **Next**: [`P9-DELIVERY.md`](P9-DELIVERY.md)

---

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 8: DEPLOYMENT                                    │
│  Goal: Ship to prod with monitoring + DR + runbook       │
│  Scope: Sprint D                                         │
│  Engine cost target: $0.30–0.80                         │
└─────────────────────────────────────────────────────────┘
```

---

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| 8.1 | R-DO | Infrastructure spec — Vercel / Railway / AWS per scale. |
| 8.2 | R-DO | CI/CD pipeline (GitHub Actions YAML). |
| 8.3 | R-DO + CEO | Monitoring + alerting on cost, latency, error rate, **eval drift**. |
| 8.4 | R-DO | Backup + disaster recovery plan. |
| 8.5 | R-DO + R-σ | Runbook for ≥ 10 common ops (deploy, rollback, scale, incident). |
| 8.6 | R-DO + CEO | Security checklist (secrets, IAM, OWASP top 10 if web). |

---

## Outputs

```
projects/{PROJECT_ID}/08-deployment/
├── deploy-plan.md              ← Day-0, Day-1, Day-7 milestones
├── runbook.md                  ← ≥10 common ops
├── monitoring.md               ← dashboards + alert rules
├── security-checklist.md
├── disaster-recovery.md
└── ci-cd/
    └── *.yaml                  ← GitHub Actions or equivalent
```

---

## Definition of Done

- ✅ Deploy plan has **Day-0 + Day-1 + Day-7** milestones
- ✅ Monitoring alerts on **cost, latency, error rate, eval drift** (LLMOps-specific)
- ✅ Runbook covers ≥ **10 common ops**
- ✅ Security checklist passes (no hardcoded secrets, IAM least-privilege)
- ✅ DR plan tested (at least one restore drill before P9)

---

## Failure Modes
- **Eval drift unmonitored**: model regression in prod undetected. *Mitigation*: Helicone/Arize integration mandatory per `_shared/standards/cost-budgets.md`.
- **Runbook copy-paste from template**: not project-specific. *Mitigation*: enforce ≥1 incident-replay scenario per project.
- **Cost monitoring missing**: prod LLM costs run away. *Mitigation*: hard cap from `cost-budgets.md` enforced at API gateway.

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

**Phase responsibility — provision harness in production environment, verify live instrumentation.**

| Action | Output | Rule |
|---|---|---|
| Sandbox provisioned | If profile=L2: ephemeral container per run, network whitelist enforced at gateway, fs mount ro outside workspace | R-HRN-09 |
| Trace sink connected | Helicone live + `harness/traces/` writable from production. Sample first 50 prod turns to confirm fields complete | R-HRN-12 |
| Approval gate webhook | Webhook endpoint for human approver (Discord/Slack/email) live + test alarm fires | R-HRN-11 |
| Cache hit-rate baseline | Measure first 24h prod traffic — establish baseline for R-LLMOps weekly review | R-HRN-10 |
| Drift monitor active | Production drift checker running (every 20 turns re-ground, every 50 re-eval DoD) | R-HRN-07 |
| Cost cap enforcement | API gateway hard-blocks at 100% cap (R-MAS-07 + R-QAL-04) — test with synthetic spike | R-HRN-03 |
| Permanent-fix log tail-watched | R-SRE / R-LLMOps subscribed to log appends — new entry triggers next-day review | R-HRN-06 |

**Gate to P9**: deploy BLOCKED if approval gate webhook untested OR trace sink not connected OR cost cap enforcement not verified.

Cross-ref: [`@../../../../_shared/rules/80-harness-rules.md`](../../../../_shared/rules/80-harness-rules.md) §R-HRN-09, §R-HRN-11, §R-HRN-12

---

## Cross-References
- Cost budgets: [`@../../../../_shared/standards/cost-budgets.md`](../../../../_shared/standards/cost-budgets.md)
- R-DO skill card: [`@../../../../_shared/.agents/tier-2-engineering/R-DO-devops.md`](../../../../_shared/.agents/tier-2-engineering/R-DO-devops.md)

---
*Pipeline v1.0 — last updated 2026-04-26*
