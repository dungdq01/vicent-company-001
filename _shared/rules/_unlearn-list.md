---
file: _unlearn-list
version: v1.0
last_updated: 2026-04-27
owner: CTO
status: production
---

# Active Unlearn List — Negative Knowledge

> Per R-LCY-02. Rules / patterns that were applied in past but found harmful. Auto-injected into RULES-PREAMBLE so agents do NOT re-apply.

**Engine behavior**: this file's content prepended to every agent's system prompt as `# DO NOT APPLY (UNLEARNED)` section.

**Add criteria**: rule was wrong AND caused observable harm (incident, eval regression, client churn). Not just "not optimal" — actively harmful.

---

## Format

```
## YYYY-MM-DD · {pattern_id}

**Pattern (do NOT apply)**: prescriptive description — what NOT to do
**Why wrong**: 1-2 sentences root cause
**Evidence**: link to incident postmortem OR retro OR project ADR
**Replacement** (if any): pointer to correct approach
**Re-eval**: golden sets that previously passed with this pattern have been re-run; baseline updated
**Signed**: CTO + date
```

---

## Active unlearn entries

(empty — no harmful patterns documented yet)

---

## Lifecycle

- Add: requires ADR + CTO sign
- Review: quarterly — verify still relevant (R-LCY-08 framework retro)
- Remove: NEVER (audit trail). If pattern no longer relevant, mark `obsolete: true` but keep file.

---

## Cross-References

- Lifecycle (unlearn): [`@./90-lifecycle-rules.md`](90-lifecycle-rules.md) §R-LCY-02
- Rules archive: [`@./_archive/README.md`](_archive/README.md)
- Master conflict resolution (precedence): [`@./00-MASTER-RULES.md`](00-MASTER-RULES.md) §R-MAS-12

---
*v1.0 — initialized 2026-04-27.*
