# Permanent-Fix Log — Project {PROJECT_ID}

> Append-only. Per **R-HRN-06**: every agent failure that survives 1× retry MUST land here as a prescriptive rule. Lặp ở 3+ project → promote to `_shared/rules/`. Industry-specific → promote to `knowledge/data/industries/I0X/harness-quirks.md`.
>
> **Cấm**: retry mù không ghi rule. Failure without learning = failure twice (R-QAL-06).

---

## Format

```
## YYYY-MM-DD · {failure_id} · {agent_id}
**Pattern**: {transferable description — what went wrong, not project-specific anecdote}
**Trigger**: {observable signal — eval score / exception / human reject reason}
**Rule added**: {prescriptive — "before X, must Y", or "if Z, do W"}
**Scope**: project-only | promote-candidate
**Owner**: {agent_id or human signing}
**Cross-ref**: {related rule R-XXX-NN if extending}
```

---

## Entries

<!-- New entries appended below. Engine auto-loads `Rule added` field into `manifest.yaml.local_rules[]` when scope=project-only. Promote-candidate entries reviewed monthly by CTO. -->

(empty — no failures recorded yet for this project)

---

## Cross-References

- Spec: [`@../../../rules/80-harness-rules.md`](../../../rules/80-harness-rules.md) §R-HRN-06
- Failure mode catalogue: [`@../../../eval/failure-modes.md`](../../../eval/failure-modes.md)
- Memory promotion path: [`@../../../rules/00-MASTER-RULES.md`](../../../rules/00-MASTER-RULES.md) §R-MAS-05
