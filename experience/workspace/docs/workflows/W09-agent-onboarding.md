# W09 — Agent Onboarding Workflow

> Per R-ORC-04. New agent (R-LLMOps, R-DataOps, R-SRE etc) đi qua 7-stage probation trước khi production. Ngăn agent mới ship straight = nguy cơ.

**Trigger**: Skill card draft proposed.
**Owner**: Agent author + R-PM (probation), CTO (sign).
**Duration**: ~3 weeks (3 internal projects).

---

## Stage 1 — Skill Card Draft (1 day)

Author writes per template style:
- Frontmatter: agent_id, name, tier, expertise, version v0.1, status: draft
- Required sections: Role · Inputs · Outputs · System Prompt · Tools · Cost Target · Eval · Failure Modes · Cross-Refs
- Distinction from existing agents (avoid R-MAS-01 duplication)

**Gate**: peer review by 1 existing agent owner. Approve format before Stage 2.

---

## Stage 2 — Golden Eval Set (2 days)

Author + R-QA build:
- ≥ 20 cases per R-QAL-03
- Inputs representing real distribution
- Expected outputs (criteria-based, not exact match for generative)
- ≥ 3 adversarial cases (edge / injection / OOD)
- Saved to `_shared/eval/golden-sets/{agent-id}.yaml`

**Gate**: R-QA sign on coverage + diversity.

---

## Stage 3 — Probation on 3 Internal Projects (1–2 weeks)

Author runs agent on 3 internal (not client) projects:
- Project 1: simplest case
- Project 2: representative case
- Project 3: edge / hardest case

Each run:
- Full harness compliance per W04 §7 Layer 3
- Eval scored against golden set
- Cost tracked

**Gate**: Pass rate ≥ 80% across 3 runs + cost within 1.2× target.

---

## Stage 4 — Integration Test (1 day)

R-PM coordinates:
- Adjacent tier agents (per skill card "pairs with") test handoff per R-ORC-03
- Verify receiver agents successfully quote ≥ 3 inputs from this agent's output
- Verify this agent successfully consumes upstream agents' handoffs

**Gate**: 0 handoff failures across upstream + downstream.

---

## Stage 5 — Cost Calibration (1 day)

CTO:
- 5 runs across diverse inputs
- Actual cost per run documented
- Cost target in skill card MUST be within 1.2× of measured median
- Flag if any single run > 2× target — investigate before proceeding

**Gate**: cost target updated to reflect reality, CTO sign.

---

## Stage 6 — CTO Sign + ADR (1 day)

CTO writes ADR:
```yaml
adr_id: ADR-{NNNN}
title: "Adopt agent R-{ID}"
decision_type: agent
authority: CTO
status: accepted
tags: [agent, R-{ID}, tier-{N}]
```

ADR includes:
- Why this agent (gap it fills)
- Distinction from existing agents
- Probation results (eval scores, costs)
- Sunset criteria (when to archive)

Update `_shared/.agents/CHANGELOG.md`. Bump skill card status to `production`.

---

## Stage 7 — Production Deploy + Monitor (ongoing)

- Skill card v0.1 → v1.0 (production tag)
- First 30 days = enhanced monitoring (R-LLMOps weekly review explicit, not just standard)
- After 30 days: if eval stable → standard cadence
- After 90 days: first formal review per `90-lifecycle-rules.md` quarterly cadence

---

## Failure Modes During Onboarding

| Failure | Action |
|---|---|
| Stage 2 golden set < 20 cases | Block Stage 3 |
| Stage 3 pass rate < 80% | Iterate skill card prompt OR archive proposal |
| Stage 4 handoff failure | Fix interface, may require adjacent agent update |
| Stage 5 cost > 2× target | Re-think model choice or scope |
| Stage 6 CTO reject | Archive proposal, retro on why |

---

## Cross-References

- Onboarding rule: [`@../../../../_shared/rules/100-orchestration-rules.md`](../../../../_shared/rules/100-orchestration-rules.md) §R-ORC-04
- Eval framework: [`@../../../../_shared/eval/SPEC.md`](../../../../_shared/eval/SPEC.md)
- Golden set spec: [`@../../../../_shared/eval/golden-sets/README.md`](../../../../_shared/eval/golden-sets/README.md)
- Promote rule (analogous for prompt versions): [`@../../../../_shared/rules/00-MASTER-RULES.md`](../../../../_shared/rules/00-MASTER-RULES.md) §R-MAS-08
- Skill card CHANGELOG: [`@../../../../_shared/.agents/CHANGELOG.md`](../../../../_shared/.agents/CHANGELOG.md)

---
*W09 v1.0 — Adopted 2026-04-27.*
