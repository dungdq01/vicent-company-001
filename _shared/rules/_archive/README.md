# _shared/rules/_archive/ — Archived Rules

> Per R-LCY-01. Rules wrong in 2+ projects OR superseded → moved here. Read-only. ADR + CTO sign mandatory before move.

**Owner**: CTO.

---

## Format

When a rule is archived:
1. Move file: `_shared/rules/{NN}-{name}.md` → `_shared/rules/_archive/{date}-{NN}-{name}.md`
2. Add header to archived file:
   ```yaml
   ---
   archived_at: YYYY-MM-DD
   archived_reason: "1 sentence transferable lesson"
   superseded_by: {new rule path or "none — no replacement"}
   archived_by: CTO sign
   adr: ADR-{NNNN}
   ---
   ```
3. Update `_unlearn-list.md` if rule was harmful (active forgetting per R-LCY-02)
4. Update cross-references in active rules

---

## Anti-Patterns

- ❌ Resurrect from archive without ADR (could re-introduce known bad pattern)
- ❌ Edit archived content (immutable — audit trail)
- ❌ Delete archived files (compliance, retention)

---

## Cross-References

- Demote pathway: [`@../90-lifecycle-rules.md`](../90-lifecycle-rules.md) §R-LCY-01
- Unlearn list: [`@../_unlearn-list.md`](../_unlearn-list.md)

---
*v1.0 — created 2026-04-27. Empty (no rules archived yet).*
