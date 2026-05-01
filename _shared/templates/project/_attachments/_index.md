---
file: _attachments/_index
role: Manifest cho TẤT CẢ docs + repos của project
maintained_by: R-σ (auto-update on attach) + P3 (review)
mirror_of: _meta.json.attachments (single source = _meta.json; this = human-readable view)
last_updated: <YYYY-MM-DD>
---

# Attachments Manifest — {{PROJECT_ID}}

> **Source of truth**: `_meta.json.attachments[]`. File này là **human-readable mirror** + thêm summary/notes mà JSON không tiện ghi.
> **Cập nhật khi**: add/remove/refresh attachment. Engine NOT read this file — đọc `_meta.json`.

> **Spec**: `_shared/standards/project-attachments.md`

---

## 1. Documents (case 2)

<!-- Mỗi entry block, copy template dưới mỗi khi add doc mới -->

### {{doc_id_1}}
- **Path**: `_attachments/docs/{{filename}}`
- **Extracted to**: `_attachments/docs/{{filename}}.txt` (cached, no re-OCR)
- **SHA256**: `<hash>`
- **Size**: <bytes> bytes
- **Type**: pdf | docx | md | code-archive
- **Load for agents**: [R-BA, R-SA]
- **Load for phases**: [P0, P1, P3]
- **PII scan passed**: <YYYY-MM-DD>
- **License**: <if applicable, e.g., client-confidential | MIT | proprietary>
- **Summary** (1–3 câu): <what's in it, why it matters>
- **Source**: <client uploaded YYYY-MM-DD by {name} | URL | other>

---

## 2. GitHub Repos (case 3)

> Detail ở `_attachments/repos/_refs.yaml`. Đây là human view.

### {{repo_id_1}}
- **URL**: https://github.com/{owner}/{repo}
- **Commit pin**: `<sha>`
- **Purpose**: <1 dòng why we reference>
- **Load strategy**: cherry_pick | manifest_only | full_clone
- **Cherry-pick files**: `src/...`, `docs/...`
- **Cache**: `_attachments/repos/{repo_id}/` (TTL 30d)
- **License**: MIT (compatible: yes)
- **R-SEC verified**: <YYYY-MM-DD>
- **Load for agents**: [R-MLE]
- **Load for phases**: [P1, P4c]

---

## 3. Skill Addons (case 1)

> Detail ở `.agents/_overrides.yaml` + `.agents/R-{X}-{addon}.md` files.

### {{addon_id_1}}
- **Base agent**: R-MLE
- **Addon file**: `.agents/R-MLE-recsys-addon.md`
- **Strategy**: append
- **Parent version pin**: v1.2
- **Load for phases**: [P1, P4c, P6]
- **Reason**: <why studio-level R-MLE doesn't cover this>
- **Promotion candidate?**: no | yes (if used in ≥3 projects same pattern → see project-attachments.md §6)

---

## 4. Verification Log

| Date | Action | Item | Verified by | Status |
|---|---|---|---|---|
| 2026-05-01 | attach | client-spec-v2.pdf | R-σ + P3 | ✅ PII passed, hash pinned |
| 2026-05-01 | attach | auth-reference repo | R-SEC | ✅ License OK, allowlisted |

---

## 5. Total Cost Budget Impact

| Item | Tokens (est) | % project budget |
|---|---|---|
| client-spec-v2 (extracted) | ~3,200 | 4% |
| auth-reference (cherry-pick) | ~1,800 | 2% |
| **Total attachment overhead** | **~5,000** | **6%** |

> Warn threshold: 30% per `cost-budgets.md`. Hard cap: 50%.

---

## 6. Cross-References

- Spec: `_shared/standards/project-attachments.md`
- Schema: `_meta.json.attachments[]`
- W04 load logic: `experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md` §2.6
- P0 attachment intake: `experience/workspace/docs/pipeline/P0-INTAKE.md` Step 0.2c

---

*Manifest template v1.0 — copy + fill per project*
