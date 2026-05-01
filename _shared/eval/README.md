# _shared/eval/ — Eval Framework (LLMOps Moat)

**Parent**: [`@../README.md`](../README.md) (L2 toolbox)
**Strategic context**: [`@../../business-strategy/11-prompt-eval-framework-spec.md`](../../business-strategy/11-prompt-eval-framework-spec.md) — full OSS spec

**Mục đích**: **moat** của studio. LLM-as-judge + golden test sets + scoring rubric. Mọi agent output phải pass eval ≥ 7.5 trước khi commit/ship.

**Owner**: P1 (LLMOps lead).

---

## 📂 Files

| File | Vai trò | Status |
|---|---|---|
| `SPEC.md` | OSS framework full spec, 12-month roadmap | ✅ exists (13KB) |
| `golden-sets/` | YAML test cases per agent (`R-{id}.yaml`) | ⏳ Step 4 build |
| `scoring-rubric.md` | 30/30/20/20 formula chi tiết | ⏳ Step 4 |
| `failure-modes.md` | 10 failure pattern + mitigation | ⏳ Step 4 |
| `README.md` | (file này) | ✅ |

---

## 🎯 Threshold Mặc Định

| Stage | Pass | Action if fail |
|---|---|---|
| Agent output | ≥ 7.5 | 1 retry → escalate human |
| Promote to production | ≥ 8.0 | Tinh chỉnh prompt |
| Skill card v1.0 → v1.1 | ≥ 8.5 + 30 runs stable | Keep at v1.0 |
| Public OSS commit | ≥ 8.5 | Hold |

→ Threshold có thể adjust per agent per project size (link `@../standards/cost-budgets.md`).

---

## 🧪 Golden Set Format (sẽ build Step 4)

```yaml
# golden-sets/R-alpha-research.yaml
agent: R-α
version: v1.0
test_cases:
  - id: B01-VN-3PL
    input:
      brief: "..."
      knowledge: ["B01-forecasting.json"]
    expected:
      must_cite: ["NBEATS", "Prophet"]
      must_address_constraints: true
      vietnamese_quality: ≥ 8
    eval_method: llm-judge + format-check
```

10-15 test cases per agent. Bilingual EN + VI.

---

## 🔄 Update Rule

- Per failure mode discovered → add 1 test case
- Quarterly review per agent — keep coverage ≥ 80% known patterns
- Score calibration check monthly (anchor cases)

---

## 🔗 Cross-References

| Need | Path |
|---|---|
| Public OSS spec | `SPEC.md` |
| Agent skill cards | `@../.agents/` |
| Failure modes general | `@../../experience/workspace/docs/quality/incident-playbook.md` (Step 5) |
| Strategic context | `@../../business-strategy/07-agent-team-development.md` §4 |

---

*Last updated: 2026-04-26*
