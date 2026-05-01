# _archive/ — Deprecated / Archived Docs

**Mục đích**: nơi giữ lại docs/projects đã không còn hoạt động nhưng cần preserve cho audit / restore / lessons learned.

**KHÔNG xóa file** trực tiếp khỏi workspace — luôn move sang `_archive/` với reason note.

---

## 📂 Convention

```
_archive/
├── README.md                                  ← (file này)
├── docs/
│   └── {original-path}-{YYYYMMDD}/
│       ├── original-content.md
│       └── _archive-reason.md                 ← lý do archive
└── projects/
    └── {P-YYYYMM-NNN}-{YYYYMMDD}/
        ├── (full project folder)
        └── _archive-reason.md
```

---

## 📝 Archive Policy

### Khi nào archive

| Item | Trigger archive |
|---|---|
| Project folder | Delivered + 6 tháng inactive |
| Strategy doc | Replaced by new version (vd: file 09 Phase 1 → file 19 Phase 2) |
| Skill card | Deprecated by v2.0 (keep v1.x for 1 phase rồi archive) |
| Knowledge baseline | Re-researched, old report kept for diff |
| Engine code | Major refactor (v1 → v2), keep v1 reference |

### Khi nào KHÔNG archive

- Active project (any status `[OPEN/ACTIVE/DELIVERED-recent]`)
- Strategy doc đang valid Phase hiện tại
- Skill card đang production
- File template còn được tham chiếu

---

## 📋 Archive Reason Template

Mỗi archived item có file `_archive-reason.md`:

```markdown
# Archive: {original-name}

**Archived date**: YYYY-MM-DD
**Archived by**: P1/P2/P3
**Original location**: /path/to/original
**Reason**: (1 of: replaced / outdated / deprecated / project-closed / restructure)

## Replacement (nếu có)
- New location: /path/to/replacement
- Migration notes: ...

## Why kept
(Audit / legal / lessons / diff reference)

## Restore criteria
(Conditions under which to restore — usually never)
```

---

## 🔍 Restore Procedure

1. Identify archived item từ `_archive/`
2. Đọc `_archive-reason.md` xác nhận điều kiện restore match
3. Copy (KHÔNG move) folder/file về vị trí mới (path mới, không original)
4. Ghi note trong commit message: `restore from archive: {reason}`
5. Update referencing docs

→ Restore là exception, không phải rule. Default = leave archived.

---

## 🚫 Anti-Pattern

- Move file vào `_archive/` mà không có `_archive-reason.md` → audit nightmare
- Mix archived + active trong cùng folder → tách clean
- Restore archived item lên path cũ (overwrite) → nguy cơ break references
- Treat `_archive/` như "trash bin temporary" → nếu định xóa hẳn thì xóa, đừng nửa vời

---

*Last updated: 2026-04-26*
*Archive policy version: v1.0*
