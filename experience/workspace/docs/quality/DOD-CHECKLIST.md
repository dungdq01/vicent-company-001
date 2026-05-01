# DoD Checklist — Per Phase

> Run this checklist at the **end of every phase** before transitioning. Block transition on any unchecked item.

**Canonical DoD source**: [`@../../../../_shared/standards/dod-per-deliverable.md`](../../../../_shared/standards/dod-per-deliverable.md)

---

## P0 — Intake

- [ ] `00-intake.md` exists with all template sections filled
- [ ] Knowledge match: ≥1 Baseline + 1 Industry assigned
- [ ] Gap pre-scan complete (`gap-pre-scan.json`)
- [ ] Agent team roster confirmed by user
- [ ] Scope tier (A/B/C/D) recorded
- [ ] User signed off on brief

## P1 — Discovery

- [ ] `discovery-report.md` exists, 8–15 pages
- [ ] R-eval ≥ **7.5/10** (`eval-result-P1.json`)
- [ ] ≥ **3 SOTA citations** (verifiable URLs)
- [ ] ≥ **5 risks** with mitigation
- [ ] Cost estimate documented
- [ ] CEO signature in `meta/decisions.md`
- [ ] P3 readability review pass

## P2 — Proposal

- [ ] `proposal.pdf` + `executive-summary.pdf` generated
- [ ] Feasibility score **≥ 60** OR explicit NO-GO
- [ ] Pricing aligns with `business-strategy/10-pricing.md`
- [ ] All client constraints addressed
- [ ] Validity date present
- [ ] CEO + P3 sign-off recorded

### G1 — SOW Gate
- [ ] Client signed SOW
- [ ] 50% deposit received
- [ ] Linear/Notion project page created

## P3 — Architecture

- [ ] `architecture.md` + diagram exist
- [ ] R-SA eval ≥ **7.5/10**
- [ ] Every component has rationale (no FOMO)
- [ ] ≥ **5 failure modes** with mitigation
- [ ] Tech stack within company-approved list
- [ ] CEO sign-off

## P4 — Design (per sub-phase)

- [ ] P4a API: OpenAPI YAML valid
- [ ] P4b DB: SQL DDL executable
- [ ] P4c ML: algorithm rationale + CEO sign
- [ ] P4d UI: wireframes + flow diagram
- [ ] P4e integration review: **0 unresolved conflicts**
- [ ] Each sub-phase eval ≥ **7.5/10**

## P5 — Planning

- [ ] `project-plan.md` + RACI + dependency map
- [ ] Risk register ≥ **5 risks**
- [ ] Plan fits client timeline
- [ ] Every task has owner + DoD + estimate

## P6 — Dev Guides

- [ ] All guides present (setup, conventions, FE, BE, ML, code-review)
- [ ] External engineer setup test passed in **1 day**
- [ ] Skeletons compile / lint clean
- [ ] CEO LLMOps integration sign-off

## P7 — QA

- [ ] Test plan covers every P4 deliverable
- [ ] Golden test set ≥ **20 cases**
- [ ] Regression suite runs in CI
- [ ] Performance targets defined + measurable
- [ ] Accessibility WCAG AA (if UI)
- [ ] Eval pass rate ≥ threshold (`_shared/eval/SPEC.md`)

## P8 — Deployment

- [ ] Deploy plan: Day-0 / Day-1 / Day-7 milestones
- [ ] Monitoring alerts: cost, latency, error rate, **eval drift**
- [ ] Runbook ≥ **10 ops**
- [ ] Security checklist passes
- [ ] DR restore drill executed

## P9 — Delivery

- [ ] Acceptance form signed
- [ ] Final invoice paid
- [ ] KT recordings + handoff package delivered
- [ ] Internal retro completed within **7 days**
- [ ] Memory entries promoted to `knowledge/docs/memory/`
- [ ] Skill card version bump if pattern across ≥3 projects

---

## Engine Enforcement

The orchestrator runs `validateDoD(phase, project_id)` after the agent step completes. On any unchecked item → emit event `dod_failed` with the missing items list; phase remains in `BLOCKED` state until human resolves.

```javascript
// Pseudocode
const result = await validateDoD("P1", projectId);
if (!result.passed) {
  emit("dod_failed", { phase: "P1", missing: result.missing });
  state.transition(projectId, "BLOCKED");
  return;
}
state.transition(projectId, "P2");
```

---
*DoD checklist v1.0 — last updated 2026-04-26*
