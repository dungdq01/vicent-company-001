---
hat: CTO
owner: P1 (CEO co-hat) hoặc P2
tier: T0
version: v1.0
last_updated: 2026-04-26
status: production
---

# CTO Charter

## Identity

CTO có thể do **CEO kiêm** (Phase 1) hoặc **P2 đảm nhiệm** (Phase 2+).
Vertical owner (nếu P2): **E-commerce / Retail (I01)**.
**Phạm vi**: tech stack quyết định cuối, agent maturity progression, eval framework health, security baseline, infra cost discipline.

---

## Accountability (KPIs CTO own)

| KPI | Target | Source |
|---|---|---|
| Eval pass rate (production) | ≥ 90% | `_shared/eval/` |
| Eval drift weekly delta | ≤ 0.3 | Helicone/Langfuse |
| Cost per agent run vs target | ≤ 100% (no overrun) | `cost-budgets.md` |
| Skill card maturity (% v1+) | ≥ 80% Phase 1 active | `.agents/CHANGELOG.md` |
| Security incidents | 0 SEV-1 | runbook |
| Tech debt ratio | ≤ 20% sprint capacity | sprint retro |
| New framework adoption / quý | ≤ 1 (anti-FOMO) | ADR log |
| Production uptime | ≥ 99% | monitoring |

---

## Decision Rights (no escalation)

- Tech stack additions / deprecations (ADR-driven)
- Eval threshold per agent
- Prompt promotion v1.0 → v1.1+ (sau khi golden set pass +0.3)
- LLM model choice per task (Sonnet vs Haiku vs Opus)
- Architecture pattern adoption (microservice vs monolith vs serverless)
- Security baseline (auth, secrets, IAM)
- Tool integration (Helicone, Sentry, Arize, etc.)
- Code review standards
- Skill card v1.0 → production gate
- Failure mode catalogue updates

## Sign-off Authority

| Gate | File / artifact |
|---|---|
| P3 architecture sign | `03-architecture/architecture.md` |
| P4c ML algorithm CEO/CTO joint | `04-design/ml/algorithm-spec.md` |
| P4e integration review pass | `04-design/integration-review.md` |
| P6 dev guide LLMOps integration | `06-dev-guides/` |
| P7 eval pass-rate gate | `07-qa/` + `_shared/eval/SPEC.md` |
| P8 deploy → prod | deploy plan + runbook |
| Skill card v1.0 → production | `_shared/.agents/CHANGELOG.md` |
| ADR (any architecture decision) | `15-business-operations §5` ADR template |

---

## Escalation Path

**Vào CTO khi**:
- Eval drift > 0.5 (any agent, prod)
- Cost > 130% budget cap on any project
- Security finding (CVE in dependency, leaked secret)
- Production SEV-1 / SEV-2
- Failed deploy (rollback needed)
- Architecture conflict P4 không tự resolve
- New framework request từ team

**Ra CTO**:
- Business / pricing impact → CEO
- Client-visible incident → COO + CEO
- Legal / compliance → R-LEG

---

## Time Allocation (target tuần)

| Bucket | % | Hours / tuần |
|---|---|---|
| Eval framework maintenance + golden sets | **20%** | 8h |
| Skill card + prompt review (CHANGELOG) | 15% | 6h |
| ADR review + architectural sign-off | 10% | 4h |
| Production monitoring + incident triage | 10% | 4h |
| 1:1 với engineering agents (R-MLE/BE/FE/DO) | 10% | 4h |
| Vertical work (E-commerce nếu P2) | 15% | 6h |
| Personal learning (papers, OSS, courses) | 15% | 6h |
| Buffer / context-switch | 5% | 2h |

---

## Anti-Patterns

- ❌ Adopt framework mới chỉ vì hype — luôn yêu cầu ADR + eval delta proof.
- ❌ Skip prompt versioning — mọi production prompt MUST có version + changelog.
- ❌ Run prod without monitoring eval drift — non-negotiable per `EVAL-GATES.md`.
- ❌ Approve PR mà không enforce code review checklist.
- ❌ Allow agent skill card edit without bumping version.
- ❌ Personal review every PR — delegate sang R-QA + only review LLM-touching changes.
- ❌ Refuse to promote prompt v1.x khi golden set + eval đã pass — mature stuck.

---

## Engine Integration

CTO oversees:
- `R-α/β/γ/σ` (T1 research quality)
- `R-MLE/DE/BE/FE/DO/NLP/AE` (T2 engineering)
- `R-SA` (T4 architecture sign-off review)
- `R-QA` (T2 quality + eval)

Daily dashboard CTO review:
- Helicone cost + eval per agent
- Sentry / runbook alerts
- CHANGELOG diffs per skill card
- Failed retries (>2) escalated

Weekly:
- Eval drift trend per agent
- Golden set regression report
- Memory hygiene compliance (`_shared/standards/memory-hygiene.md`)

---

## Cross-References

- LLMOps moat: [`@../../../business-strategy/08-ceo-technical-leverage.md`](../../../business-strategy/08-ceo-technical-leverage.md)
- Agent team development: [`@../../../business-strategy/07-agent-team-development.md`](../../../business-strategy/07-agent-team-development.md)
- Eval framework: [`@../../eval/SPEC.md`](../../eval/SPEC.md)
- Cost budgets: [`@../../standards/cost-budgets.md`](../../standards/cost-budgets.md)
- Memory hygiene: [`@../../standards/memory-hygiene.md`](../../standards/memory-hygiene.md)
- ADR template: [`@../../../business-strategy/15-business-operations.md:321`](../../../business-strategy/15-business-operations.md)

---
*v1.0 — last updated 2026-04-26*
