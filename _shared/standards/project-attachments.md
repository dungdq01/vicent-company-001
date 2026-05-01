---
file: project-attachments
version: 1.0
last_updated: 2026-05-01
owner: P1 (engine config) + P3 (per-project enforcement)
parent: _shared/standards/README.md
related: change-management.md §6 · pii-redaction.md · cost-budgets.md · 60-security-rules.md · versioning-pinning.md
---

# Project Attachments — Standard

> **Mục đích**: cho phép mỗi project bổ sung **3 loại attachment** mà studio-level không có sẵn — **(1) skill addon cho agent**, **(2) tài liệu tham khảo (PDF/codebase/.md)**, **(3) GitHub repo reference**.

> **Read-only ngoài project**: attachments chỉ tồn tại trong scope `projects/{id}/` — không được push lên `_shared/` hoặc `knowledge/` mà không qua `change-management.md §1.1` (promotion gate).

---

## 0. 3 Use Cases

| Case | Folder | File pattern | Use case ví dụ |
|---|---|---|---|
| **1. Skill addon** | `projects/{id}/.agents/` | `R-{id}-{addon}.md` + `_overrides.yaml` | Project SaaS cần R-MLE biết "two-tower recsys"; project sales cần R-BA hiểu "VN PDPA SOW clause" |
| **2. Doc / codebase** | `projects/{id}/_attachments/docs/` | `*.pdf`, `*.md`, `*.txt`, code files | Client RFP, hợp đồng, legacy codebase, API doc |
| **3. GitHub repo ref** | `projects/{id}/_attachments/repos/` | `_refs.yaml` + optional cloned subfolder | Reference architecture, OSS library, prior art |

Khai báo TẤT CẢ trong `projects/{id}/_meta.json.attachments[]` → engine biết load gì cho agent nào ở phase nào.

---

## 1. Case 1 — Skill Addon for Agent

### 1.1 Folder structure

```
projects/{id}/.agents/
├── _overrides.yaml                  # manifest: which addon for which base agent
├── R-MLE-recsys-addon.md            # extra skill (append/replace/new persona)
└── R-BA-vn-pdpa-addon.md
```

### 1.2 Override strategy (frontmatter MANDATORY)

Mỗi addon `.md` phải có frontmatter:

```yaml
---
agent_id: R-MLE                      # base agent in _shared/.agents/
addon_id: R-MLE-recsys
strategy: append | replace_sections | new_persona
target_sections:                     # only if strategy=replace_sections
  - "Few-Shot Examples"
  - "Output Format"
parent_version_pin: v1.2             # base agent must be exactly this version (per versioning-pinning.md)
load_for_phases: ["P1", "P4c", "P6"] # filter — engine only injects when phase matches
created_at: 2026-05-01
created_by: P3
reason: "Two-tower recsys spec specific to affiliate ecommerce"
---
```

**Strategy semantics**:
- `append` — addon content nối vào cuối base skill card (most common; dùng để add few-shots, examples)
- `replace_sections` — addon thay thế sections liệt kê trong `target_sections`, phần còn lại giữ nguyên base
- `new_persona` — addon thay thế HOÀN TOÀN base prompt, chỉ kế thừa `agent_id` cho dispatch routing (rare; cần CEO sign-off)

### 1.3 _overrides.yaml manifest

```yaml
version: v1.0
overrides:
  - base_agent: R-MLE
    addon_file: R-MLE-recsys-addon.md
    strategy: append
    parent_version_pin: v1.2
    load_for_phases: ["P1", "P4c", "P6"]
  - base_agent: R-BA
    addon_file: R-BA-vn-pdpa-addon.md
    strategy: replace_sections
    target_sections: ["Compliance Checklist"]
    parent_version_pin: v1.1
    load_for_phases: ["P0", "P2"]
```

### 1.4 Engine load rule (W04 §2.6)

```
Khi dispatch agent X cho phase P:
  1. Load _shared/.agents/{X}.md (base, version per skill_overrides)
  2. Verify base version == parent_version_pin → else BLOCK
  3. Read projects/{id}/.agents/_overrides.yaml
  4. If override exists for X AND P ∈ load_for_phases:
     a. Apply strategy (append/replace_sections/new_persona)
     b. Inject merged prompt
  5. Cache T3 (per-project, per-phase)
```

---

## 2. Case 2 — Documents / Codebase

### 2.1 Folder structure

```
projects/{id}/_attachments/docs/
├── client-spec-v2.pdf               # original
├── client-spec-v2.txt               # extracted text (cache, no re-OCR)
├── legacy-codebase/                 # if codebase, subfolder
│   ├── README.md
│   └── src/...
└── _index.md                        # manifest declared in section 4
```

### 2.2 Pre-commit checklist

| Check | Rule | Action if fail |
|---|---|---|
| **PII scan** | `pii-redaction.md` | Redact + log → if cannot redact, BLOCK + escalate to P1 |
| **License** | `60-security-rules.md` | Reject if license unclear or incompatible (e.g., GPL for proprietary client deliverable) |
| **Size cap** | `cost-budgets.md` | Warn if doc > 50KB extracted text per single attachment; BLOCK if > 30% project budget |
| **Hash pin** | `versioning-pinning.md` | SHA256 hash stored in `_index.md` to detect drift |

### 2.3 Format extraction

PDF/DOCX must be extracted to `.txt` once (P0.2c step), cached forever (T3). Engine reads `.txt`, NEVER re-OCR per dispatch.

```
client-spec-v2.pdf  → R-σ extract once → client-spec-v2.txt (cache)
                                          + sha256 hash in _index.md
```

---

## 3. Case 3 — GitHub Repo Reference

### 3.1 Folder structure

```
projects/{id}/_attachments/repos/
├── _refs.yaml                       # source of truth (REQUIRED)
└── auth-reference/                  # optional: cloned content (gitignored if > 1MB)
    ├── README.md
    └── {cherry-picked files only}
```

### 3.2 _refs.yaml schema

```yaml
version: v1.0
refs:
  - id: auth-reference
    url: https://github.com/{owner}/{repo}
    commit_pin: a3f2c1b                    # MANDATORY — exact SHA, not branch
    branch_at_pin: main                    # for human readability
    purpose: "OAuth2 PKCE reference"
    load_strategy: cherry_pick             # cherry_pick | manifest_only | full_clone
    cherry_pick:                           # if load_strategy=cherry_pick
      - src/oauth/pkce.ts
      - docs/architecture.md
    fetch_method: git_clone                # git_clone | manifest_only | download_zip
    cache_path: _attachments/repos/auth-reference/
    cache_ttl_hours: 720                   # 30 days; refetch if exceed
    license: MIT
    license_compatible: true               # set TRUE only after R-SEC check
    allowlist_passed: 2026-05-01           # ISO date when allowlisted
    pii_scan_passed: 2026-05-01
    load_for_agents: ["R-MLE", "R-SA"]
    load_for_phases: ["P1", "P3", "P4a"]
    summary_max_tokens: 2000               # engine truncates if exceeds
```

### 3.3 fetch_method semantics

| Method | When | What loads |
|---|---|---|
| `git_clone` | Full reference, want browse | Clone full repo to cache_path; cherry_pick determines what loads to prompt |
| `manifest_only` | Cost-sensitive | NO clone; engine fetches only files in `cherry_pick[]` via raw.githubusercontent.com |
| `download_zip` | Frozen archive | Download zip at commit_pin, extract to cache_path |

### 3.4 Compliance gates (one-time at attach)

1. **License check** — R-SEC verifies license (MIT/Apache/BSD OK; GPL/AGPL → BLOCK if studio ships proprietary)
2. **Allowlist** — repo URL must be in studio allowlist OR explicit CEO approval (avoid supply-chain risk)
3. **PII scan** — even OSS repo can leak (test fixtures, env samples) — scan via `pii-redaction.md`
4. **Commit pin** — NEVER use branch reference; commit SHA only (drift protection)

---

## 4. _attachments/_index.md (manifest)

Bắt buộc maintain manifest cho TẤT CẢ docs+repos. Template trong `_shared/templates/project/_attachments/_index.md`.

Mỗi entry:
```markdown
- **id**: client-spec-v2
  **type**: doc-pdf
  **path**: docs/client-spec-v2.pdf
  **extracted**: docs/client-spec-v2.txt
  **sha256**: abc123...
  **size_bytes**: 245000
  **load_for_agents**: [R-BA, R-SA]
  **load_for_phases**: [P0, P1, P3]
  **pii_scan_passed**: 2026-05-01
  **summary**: "Client RFP v2, 18 pages — recsys requirements + KPI"
```

---

## 5. _meta.json schema (declares all 3 cases)

```json
"attachments": {
  "agent_addons": [
    {
      "base_agent": "R-MLE",
      "addon_file": ".agents/R-MLE-recsys-addon.md",
      "strategy": "append",
      "parent_version_pin": "v1.2",
      "load_for_phases": ["P1", "P4c", "P6"]
    }
  ],
  "docs": [
    {
      "id": "client-spec-v2",
      "path": "_attachments/docs/client-spec-v2.pdf",
      "extracted": "_attachments/docs/client-spec-v2.txt",
      "sha256": "abc123...",
      "load_for_agents": ["R-BA", "R-SA"],
      "load_for_phases": ["P0", "P1", "P3"],
      "pii_scan_passed": "2026-05-01"
    }
  ],
  "repos": [
    {
      "id": "auth-reference",
      "refs_yaml": "_attachments/repos/_refs.yaml",
      "load_for_agents": ["R-MLE"],
      "load_for_phases": ["P1", "P4c"]
    }
  ]
}
```

---

## 6. Promotion Path (Anti-Silo)

Khi 1 addon/repo/doc được dùng ở **≥3 projects cùng pattern** → candidate for framework promotion.

### 6.1 Skill addon promotion
- Detection: `_shared/standards/learning-system.md` cross-project pattern sweep (W08 quarterly)
- Action: addon `R-MLE-recsys-addon.md` → studio agent `R-MLE-recsys.md` (or fold vào base R-MLE if generic)
- **Process**: follow `change-management.md §1.1 ADD AGENT` (skill card → TEAM-CONFIG → eval golden set → CHANGELOG → propagate refs)
- **Sunset**: sau promote, addon bị remove khỏi tất cả projects pinning (auto-migrate via skill_overrides bump)

### 6.2 Repo promotion
- Reference repos hiếm khi promote (project-specific). Nếu pattern lặp → cân nhắc add vào `_shared/standards/external-dependencies.md` allowlist + reference architecture doc.

### 6.3 Doc promotion
- Project-specific docs (client RFP, contract) **KHÔNG promote** — privacy.
- Nếu doc chứa **domain pattern reusable** (e.g., 3 client cùng F&B đều có churn pattern X) → promote sang `knowledge/staging/` qua W11 K-review (NOT raw doc — extracted insight only).

---

## 7. Cost & Budget

Attachment tokens **count vào project budget** per `cost-budgets.md`:

- Per dispatch: nếu attachment + base prompt > token cap → engine warn, drop low-priority attachment
- Per project: nếu cumulative attachment tokens > 30% project budget → P1 review (có thể consolidate/summarize attachment thay vì raw inject)
- Cache T3 (per project) → attachment chỉ tính token 1 lần đầu, sau đó cached (per `R-HRN-10` 4-tier cache rules)

---

## 8. Failure Modes

| Mode | Detect | Mitigate |
|---|---|---|
| Addon parent_version_pin mismatch | W04 §2.6 step 2 BLOCK | Bump base agent OR update pin |
| Repo commit drift (cache TTL exceed) | `cache_ttl_hours` | Engine refetch, R-SEC re-verify license |
| Doc bloat (> 50KB extracted) | `cost-budgets.md` warn | R-σ summarize, replace raw with summary |
| PII leak in attachment | `pii-redaction.md` post-check | Quarantine doc, P1 sev-2 trigger |
| License conflict | R-SEC at attach time | BLOCK, find alternative ref |
| Addon used in only 1 project for >6 months | learning-system sweep | Sunset OR promote |

---

## 9. Anti-Patterns

❌ Paste content thẳng vào `BRIEF-INTAKE.md` (bloat intake) → declare path/URL only
❌ Skip `_meta.json.attachments[]` declaration (engine không thấy) → BLOCK at W04 §2.6
❌ Reference repo by branch (drift risk) → MUST commit SHA pin
❌ Push project-specific addon lên `_shared/.agents/` → vi phạm R-MAS-16 framework read-only
❌ Re-OCR PDF mỗi dispatch → extract once to `.txt`, cache T3
❌ Skill addon `new_persona` không có CEO sign → BLOCK
❌ Clone full repo > 100MB không cherry_pick → use `manifest_only` thay thế

---

## 10. Cross-References

| Need | Path |
|---|---|
| Add attachment workflow | `change-management.md` §6 |
| W04 dispatch loading | `experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md` §2.6 |
| P0 attachment intake step | `experience/workspace/docs/pipeline/P0-INTAKE.md` Step 0.2c |
| PII scan procedure | `pii-redaction.md` |
| License check | `_shared/rules/60-security-rules.md` |
| Cost budget | `cost-budgets.md` |
| Version pin syntax | `versioning-pinning.md` |
| BRIEF declaration | `BRIEF-INTAKE.md` block 7 |
| Templates | `_shared/templates/project/_attachments/`, `.agents/` |

---

*project-attachments v1.0 — 2026-05-01*
