---
file: 07-qa-plan
project_id: {{PROJECT_ID}}
phase: P7
filled_by: R-QA
last_updated: {{P7_DATE}}
status: draft | reviewed | signed
---

# {{PROJECT_NAME}} — QA Plan

> P7 deliverable. Test strategy + golden sets + regression suite + a11y + performance benchmarks.

---

## 0. Document Control

- **Owner**: R-QA
- **Reviewers**: R-PM · CTO
- **Eval**: [Fill ≥ 7.5]

---

## 1. Test Strategy Overview

Per R-COD-07: pyramid (many unit · some integration · few e2e).

| Layer | Tools | Coverage target |
|---|---|---|
| Unit | [Fill: vitest · jest · pytest] | critical-path functions |
| Integration | [Fill: supertest · TestContainers] | API endpoints + DB |
| E2E | Playwright | top user flows (≤ 10) |
| LLM | Custom golden set runner | every prompt-touching component |
| Visual regression | [Fill: Chromatic · Percy · skip if MVP] | optional |
| a11y | axe-core | every page |
| Performance | k6 / Lighthouse | critical endpoints |
| Security | snyk · trivy · semgrep | CI per push |

---

## 2. Golden Sets (LLM Components)

Per R-QAL-03: ≥ 20 cases per LLM-touching component.

### 2.1 Golden Set: [Fill component name]
- **File**: [`./golden-sets/{{component}}.yaml`](./golden-sets/)
- **Cases**: [Fill: ≥ 20]
- **Categories**:
  - Standard distribution: [Fill: e.g., 12]
  - Edge cases: [Fill: e.g., 5]
  - Adversarial (injection · OOD): [Fill: ≥ 3]
- **Pass threshold**: [Fill ≥ 7.5 default · ≥ 8.0 for critical]
- **Judge model**: [Fill: different family from generator per R-QAL-13]

### 2.2 Golden Set: [Fill]
[Repeat]

---

## 3. Critical User Flows (E2E)

| # | Flow | Tool | Owner |
|---|---|---|---|
| 1 | [Fill] | Playwright | [Fill] |
| 2 | ... | ... | ... |

💡 Hint: ≤ 10 e2e tests. They're slow. Cover only critical happy + key unhappy paths.

---

## 4. Test Cases per User Story

For each PRD user story, ≥ 1 test case:

| US ID | Test type | Test case | Status |
|---|---|---|---|
| US-001 | unit + e2e | [Fill: scenario] | pending / pass / fail |
| US-002 | integration | [Fill] | ... |

→ Traceability matrix in [`./traceability.md`](./traceability.md).

---

## 5. Regression Suite

### 5.1 Suite Composition
- Unit tests: ALL run on every PR
- Integration: ALL run on every PR
- E2E: ALL run on every merge to main + nightly
- Golden sets: ALL run on every PR + before prompt promotion (per R-QAL-07)

### 5.2 CI Runtime Target
Per R-QA card: ≤ 10 min total. If > 10 min → split parallelize.

### 5.3 CI Provider
[Fill: GitHub Actions · etc.]

---

## 6. Performance Benchmarks

| Endpoint / flow | Target p95 | Tool | Frequency |
|---|---|---|---|
| [Fill] | [Fill ms] | Lighthouse / k6 | per release |
| [Fill] | ... | ... | ... |

### 6.1 Load Test Plan
[Fill: scenarios · ramp · expected RPS]

### 6.2 Baseline Numbers
[Fill: post-P3 architecture-projected · re-validated post-build]

---

## 7. Accessibility Tests

Per R-COD-14 + R-UX:

- [ ] axe-core in every CI run
- [ ] Manual test with keyboard-only nav (top flows)
- [ ] Manual test with screen reader (≥ 1 page per persona)
- [ ] Color contrast verified (WCAG AA 4.5:1)
- [ ] Focus indicators visible
- [ ] Reduced motion honored

---

## 8. Security Tests

Per R-SEC + P8 prep:

- [ ] SAST (semgrep) in CI
- [ ] SCA (snyk · trivy) in CI
- [ ] Secrets scan (gitleaks) in pre-commit + CI
- [ ] Auth tests (unauthorized access denied)
- [ ] IDOR tests (cross-tenant access denied)
- [ ] Prompt injection tests (LLM components)
- [ ] PII leak tests (logs · responses · errors)

For HIPAA / PCI / enterprise: 3rd-party pen-test (per R-SEC-13).

---

## 9. UAT Plan (P9)

→ Detailed in [`09-final-package.md`](09-final-package.md). Brief:

- **Who**: Client testers (≥ 2)
- **When**: After internal QA pass
- **Duration**: 10 business days
- **Pass criteria**: All MUST stories pass · No P0/P1 defects · Performance targets met

---

## 10. Defect Management

### 10.1 Severity Classification
| Sev | Definition |
|---|---|
| S1 (Critical) | Blocks core flow · data corruption · security |
| S2 (Major) | Blocks secondary flow · workaround painful |
| S3 (Minor) | Cosmetic · workaround easy |
| S4 (Trivial) | Nice-to-have · backlog |

### 10.2 Fix SLA
| Sev | Fix by |
|---|---|
| S1 | Same day · block release |
| S2 | Within sprint · block release |
| S3 | Next sprint |
| S4 | Backlog |

---

## 11. Test Environments

| Env | Purpose | Data |
|---|---|---|
| Local | Dev tests | Synthetic |
| CI | Automated suite | Fixtures |
| Staging | UAT + integration | Anonymized prod-like |
| Prod | Live | Real |

Per R-SEC-15: NO real customer data in non-prod environments.

---

## 12. Sign-Off

- **R-QA eval**: [Fill ≥ 7.5]
- **CTO**: [Fill]
- **Plan baselined**: [Fill date]

---

## Cross-References

- P7 phase doc: [`@../../../experience/workspace/docs/pipeline/P7-QA.md`](../../../experience/workspace/docs/pipeline/P7-QA.md)
- Quality rules: [`@../../rules/70-quality-rules.md`](../../rules/70-quality-rules.md)
- Eval framework: [`@../../eval/SPEC.md`](../../eval/SPEC.md)
- Failure modes: [`@../../eval/failure-modes.md`](../../eval/failure-modes.md)
- R-QA card: [`@../../.agents/tier-2-engineering/R-QA-qa-engineer.md`](../../.agents/tier-2-engineering/R-QA-qa-engineer.md)

---
*Template v1.0*
