# knowledge/_archive/ — Historical Versions

> Per R-LCY-01 + R-LCY-03 sunset cadence. Old/superseded knowledge moved here for audit trail. Read-only.

**Owner**: R-σ (curator).

---

## Purpose

When a `data/` artifact is sunset (per R-LCY-03 cadence) OR a quarantined entry is permanently archived (no fix path), it lives here forever for:
- Audit trail (compliance, regulatory)
- Historical reference (project archaeology)
- Re-pinning if archived project resurrects

---

## Convention

```
_archive/
├── YYYY-Q{n}-sunset/         ← batched per quarterly sunset cadence
│   ├── B0X-r{n}-snapshot/
│   ├── I-XX-r{n}-snapshot/
│   └── REASON.md             ← why sunset, who signed, date
└── YYYY-MM-DD-{slug}/        ← ad-hoc archive (e.g., from quarantine)
```

---

## Anti-Patterns

- ❌ Resurrect from archive without ADR
- ❌ Edit archived content (immutable)
- ❌ Delete archived content (audit trail required)

---

## Cross-References

- Lifecycle (sunset cadence): [`@../../_shared/rules/90-lifecycle-rules.md`](../../_shared/rules/90-lifecycle-rules.md) §R-LCY-03
- Curation: [`@../../_shared/standards/knowledge-curation.md`](../../_shared/standards/knowledge-curation.md)

---
*v1.0 — created 2026-04-27.*
