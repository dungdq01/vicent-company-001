# DoD Per Deliverable — Operational Reference

**Canonical source**: [`@../../business-strategy/17-quality-standards-dod.md`](../../business-strategy/17-quality-standards-dod.md)
**This file**: operational shortcut — agents + engine consume từ đây. Khi conflict, file 17 thắng.

**Mục đích**: 1-page reference table — mỗi deliverable type có "Done" criteria rõ ràng, ngăn output chưa đạt ship đến client.

---

## Threshold Matrix

| Deliverable | Min eval | Format check | Citation | Sign-off |
|---|---|---|---|---|
| `discovery-report.md` (P1) | ≥ 7.5 | YAML metadata + 4 sections | ≥ 5 sources | R-σ + P3 review |
| `proposal.pdf` (P2) | ≥ 8.0 | Per file 12 §5 template | — | P1 (CEO) tech sign-off |
| `architecture.md` (P3) | ≥ 8.0 | C4 diagram + 5 sections | — | R-SA + P2 |
| `design-{a-e}.md` (P4) | ≥ 7.5 | Per design-type template | — | R-σ |
| `project-plan.md` (P5) | ≥ 7.5 | Sprint table + risk register | — | R-PM + P3 |
| `dev-guide.md` (P6) | ≥ 8.0 | Setup + run + test sections | code samples runnable | R-BE + R-FE |
| `qa-plan.md` (P7) | ≥ 8.0 | Test pyramid + automation plan | — | R-QA |
| `deploy.md` (P8) | ≥ 8.0 | Runbook + rollback + obs | — | R-DO |
| `final-package.md` (P9) | ≥ 8.5 | Executive summary + appendix | full | R-σ + P1 (CEO) |
| `retro.md` (P9) | ≥ 7.5 | What worked / didn't / next | — | All 3 founders |

---

## Universal DoD Checks

Mọi deliverable phải pass:

- ✅ Markdown render không lỗi (lint pass)
- ✅ Vietnamese fluency ≥ 8 (R-σ output)
- ✅ Technical terms preserved + VN explained first mention
- ✅ Cross-references valid (link không broken)
- ✅ R-eval score ≥ threshold trên golden set tương ứng
- ✅ Cost stays within scope budget cap (`@./cost-budgets.md`)

---

## When DoD Fails

1. R-eval score < threshold → 1 retry với feedback từ LLM-judge
2. Retry vẫn fail → escalate human (P3 domain hoặc P1 LLMOps)
3. Human reject → R-σ re-consolidate hoặc agent re-run
4. Sau 3 retry → pause project, root cause review trong `experience/workspace/DEV-ISSUES.md`

---

## Cross-References

- Canonical DoD: `@../../business-strategy/17-quality-standards-dod.md`
- Eval framework: `@../eval/SPEC.md`
- Scoring rubric: `@../eval/scoring-rubric.md`
- Failure modes: `@../eval/failure-modes.md`

*Last updated: 2026-04-26*
