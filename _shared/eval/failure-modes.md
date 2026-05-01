# Failure Modes — 10 Common Patterns + Mitigation

**Used by**: All agents + R-eval | **Updated when**: pattern observed across ≥3 projects

**Mục đích**: catalogue known failure patterns. Mỗi mode có **detection signal**, **mitigation**, **retry rule**.

---

## 1. Hallucinated Citations

**Detection**: R-σ verifies each ref → URL doesn't resolve, paper title doesn't exist
**Triggered by**: R-α primarily; β/γ secondary
**Mitigation**: Force "verify each citation manually" prompt; web_search for each
**Retry rule**: 1 retry with explicit verification; fail → human review

## 2. Vague Recommendations

**Detection**: Output uses "X or Y or Z could work" without ranking
**Triggered by**: R-α, R-β
**Mitigation**: Force "rank top 2 with criteria" in prompt
**Retry rule**: 1 retry; fail → escalate

## 3. Score-Verdict Mismatch

**Detection**: R-γ score=4 but verdict=GO
**Triggered by**: R-γ
**Mitigation**: Auto-validate score → verdict mapping; reject inconsistency
**Retry rule**: Auto-retry with mapping rule reminder

## 4. Translation Drift

**Detection**: Technical term mistranslated VN; loses semantic precision
**Triggered by**: R-σ
**Mitigation**: P3 domain review of σ output; preserve EN term + VN explanation
**Retry rule**: Manual edit > re-run (σ runs are expensive)

## 5. JSON Schema Invalid

**Detection**: Validator fails against `@../../knowledge/docs/DATA-SCHEMA.md`
**Triggered by**: R-σ creating JSON node
**Mitigation**: Inline schema in prompt; auto-validate post-generation
**Retry rule**: Auto-retry with validation errors fed back

## 6. Stack Drift

**Detection**: R-β recommends ≥3 alternative stacks without commitment
**Triggered by**: R-β
**Mitigation**: Force "pick ONE stack with rationale" in prompt
**Retry rule**: 1 retry; fail → escalate

## 7. Microservices Premature

**Detection**: Sub-$10K project recommends microservices
**Triggered by**: R-BE, R-SA
**Mitigation**: Add scope guard rail in prompt: "monolith default"
**Retry rule**: Auto-retry with scope reminder

## 8. Generic Domain Response

**Detection**: R-D{XX} output could fit any industry (no industry-specific terms)
**Triggered by**: R-D{XX} template
**Mitigation**: Force industry-specific terminology table in output
**Retry rule**: 1 retry with "be specific to {INDUSTRY}"

## 9. Cost Estimation Outlier

**Detection**: Cost estimate > 1.5x or < 0.5x similar past projects
**Triggered by**: R-β, R-MLE, R-DO
**Mitigation**: Show similar project costs in context
**Retry rule**: 1 retry with anchor data

## 10. Synthesis Hallucination

**Detection**: R-σ final report has claim not in α/β/γ corpus
**Triggered by**: R-σ
**Mitigation**: Cross-check σ output against upstream corpus; reject inventions
**Retry rule**: 1 retry with "synthesize ONLY what is in inputs"

---

## When None of Above Match

→ Log to `experience/workspace/DEV-ISSUES.md` with:
- Symptom
- Project ID + agent
- Hypothesis
- Resolution path

If pattern across ≥3 projects → promote to this file as failure mode #11+.

---

## Cross-References

- Eval framework: `SPEC.md`
- Standards DoD: `@../standards/dod-per-deliverable.md`
- Incident playbook (process): `@../../experience/workspace/docs/quality/incident-playbook.md` (Step 5)

*Last updated: 2026-04-26*
