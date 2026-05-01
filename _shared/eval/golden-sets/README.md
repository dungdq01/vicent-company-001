# Golden Sets — YAML Test Cases Per Agent

**Parent**: [`@../README.md`](../README.md) (eval framework)

**Mục đích**: declarative test cases để measure agent output quality consistently. Mỗi file `R-{id}.yaml` chứa 10-15 cases.

---

## Format

```yaml
agent: R-{id}
version: v1.0
last_updated: YYYY-MM-DD
test_cases:
  - id: {unique-name}
    description: "1-line summary"
    input:
      brief: "..."
      knowledge: ["B01-forecasting.json", "I06.json"]
      constraints:
        budget: "$5K"
        timeline: "4 weeks"
    expected:
      must_cite: ["NBEATS", "Prophet"]
      must_address: ["sparse data", "VN locale"]
      score_threshold: 7.5
      format_check:
        - has_section: "SOTA Review"
        - has_section: "Recommended Algorithms"
        - min_citations: 5
    eval_method: 
      - llm-judge
      - format-parser
    notes: "Anchor case for B01 sparse retail VN context"
```

---

## Naming + File Structure

```
golden-sets/
├── README.md                                ← (file này)
├── R-alpha-research.yaml                    ← T1
├── R-beta-tech.yaml
├── R-gamma-feasibility.yaml
├── R-sigma-scribe.yaml
├── R-MLE.yaml R-DE.yaml ...                 ← T2 active
├── R-Dxx-template.yaml                      ← T3 generic
└── R-PM.yaml R-SA.yaml                      ← T4
```

---

## Build Sequence (Phase 1)

| Priority | Files | Trigger |
|---|---|---|
| P0 (W1-2) | R-alpha + R-gamma + R-sigma | Highest invoke frequency |
| P1 (W3-4) | R-beta + R-MLE + R-DE | Sprint A scope |
| P2 (W5-6) | R-BE + R-FE + R-DO | Sprint B+ scope |
| P3 (W7-8) | R-NLP + R-AE + R-PM + R-SA | LLM/agentic projects |
| P4 (M2+) | R-Dxx-template per common industry | After ≥3 projects in industry |

---

## Quality Bar Per Test Case

- ✅ Realistic input (from real or anonymized client brief)
- ✅ Expected outputs verifiable (not vague "good answer")
- ✅ Score threshold per dimension if multi-dimensional
- ✅ Edge case coverage: 60% normal + 30% edge + 10% adversarial

---

## Run Frequency

- Pre-commit: skill card change → run golden set, fail if score drop > 0.3
- Weekly: regression check (catch model drift if Anthropic updates Claude)
- Per-promotion: skill card v1.x → v1.x+1 must pass + ≥0.3 improvement

---

## Cross-References

- Eval framework: `@../SPEC.md`
- Scoring rubric: `@../scoring-rubric.md`
- Failure modes: `@../failure-modes.md`
- Strategic spec: `@../../../business-strategy/11-prompt-eval-framework-spec.md`

*Last updated: 2026-04-26 — files build per Phase 1 W1-W8.*
