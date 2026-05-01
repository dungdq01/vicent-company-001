# _shared/standards/ — Quality Standards (DoD + Memory + Cost)

**Parent**: [`@../README.md`](../README.md) (L2 toolbox)

**Mục đích**: standards dùng chung mọi deliverable, mọi agent — quy chuẩn chất lượng, vệ sinh memory, ngân sách chi phí.

**Owner**: P1 (eval enforcement) + CEO (strategic alignment).

---

## 📂 Files

### Quality + cost (canonical alias from business-strategy)
| File | Vai trò | Source |
|---|---|---|
| `dod-per-deliverable.md` | DoD chi tiết per artifact type | Mirror `@../../business-strategy/17-quality-standards-dod.md` |
| `memory-hygiene.md` | Memory entry rules: transferable patterns only | Extract `@../../business-strategy/07-agent-team-development.md` §7.3 |
| `cost-budgets.md` | Per-run + per-project + per-month cap | Extract `@../../business-strategy/07` §6 + `@../../business-strategy/10-pricing-sheet.md` |

### Framework operational standards (v1.1, originals — 2026-04-27)
| File | Vai trò | Closes lỗ hổng |
|---|---|---|
| `knowledge-curation.md` | 3-tier namespace (staging/data/quarantine) + K-review gate + citation verify + studio/client boundary + real data privacy | A1, A2, E2 |
| `versioning-pinning.md` | Skill cards + knowledge nodes + prompts + models versioned + project pin manifest | C9, C10 |
| `external-dependencies.md` | Vendor watch list (Anthropic, Telegram, Stripe, etc.) + drift signals + migration playbook | E1 |
| `decision-log-index.md` | ADR archaeology — frontmatter convention + tag vocabulary + repeat detection | A4 |
| `boundaries.md` | Studio (`studio/wisdom/`) vs client (`knowledge/`) + voice registry + inter-project data | D14, D17, E2 |
| `secrets-management.md` | Where secrets live, rotation, leak response | #14 critique |
| `pii-redaction.md` | PII categories + 5 redaction methods + verification | curation §4 op |
| `compliance/vn.md` | VN PDPA + NĐ 13 operational checklist | client requirement |
| `incident-severity.md` | Sev 0/1/2/3 classification + response | W05 op |
| `sla-defaults.md` | TTFR / uptime / response time per profile L0/L1/L2 | #20 critique |
| `glossary.md` | Authoritative terminology — single source | clarity |
| **`document-catalog.md`** | **META-INDEX what studio ships per Sprint tier** | "bật mode" routing |
| **`learning-system.md`** | **Continuous learning loop end-to-end (mid-flight gap + post-project sweep + cross-project pattern)** | framework as learning system |
| **`change-management.md`** | **5-scenario propagation protocol — add/remove agent/knowledge/rule/workflow without orphan refs or conflict** | propagation discipline |
| **`project-attachments.md`** | **Per-project attachments: 3 cases (skill addon · doc · GitHub repo) — `_meta.json.attachments[]` schema + W04 §2.6 load logic + P0.2c intake** | per-project extension without breaking studio-level |

### Index file
| `README.md` | (file này) | — |

---

## ⚙️ Adding / Removing standards

Per `change-management.md` §3 (rule-like) OR §4 (workflow-like) propagation pattern. New standards file = list above + cross-ref from PROJECT.md §5 + START-HERE.md §8 lookup table. Skip propagation = orphan reference.

---

## 🎯 Tại Sao Mirror/Alias?

Nguyên tắc **single source of truth**: 
- DoD chính thức ở `business-strategy/17` (Layer 5 strategic decision)
- File ở đây là **operational reference** cho engine + agents (Layer 2 toolbox)
- KHÔNG copy-paste content. Dùng `@reference:line` link.

→ Khi update DoD, sửa ở `business-strategy/17`. File ở đây tự "thấy" qua link.

---

## 🚦 DoD Threshold

| Deliverable | Min eval | Format check | Citation |
|---|---|---|---|
| Discovery report | ≥ 7.5 | YAML metadata + 4 sections | ≥ 5 sources |
| Proposal | ≥ 8.0 | Per `business-strategy/12` template | — |
| Architecture doc | ≥ 8.0 | Diagram + 5 sections | — |
| Code | passes CI + tests | linting + types | — |
| Final report | ≥ 8.5 | Executive summary + appendix | — |

Detail: `dod-per-deliverable.md` (Step 4).

---

## 💰 Cost Budget Cap

| Scope | Per-run cap | Per-project cap | Action if exceeds |
|---|---|---|---|
| A (Sprint A) | $1.50 | $5 | Pause, P2 review |
| B (Sprint B) | $4 | $15 | Pause + retro |
| C (Sprint C) | $10 | $50 | CEO sign-off |
| D (Sprint D) | $20 | $200 | CEO + P1 |

Plus **monthly Anthropic API hard cap** (file 09 W1 task = $500/mo Phase 1).

---

## 🔗 Cross-References

| Need | Path |
|---|---|
| DoD canonical | `@../../business-strategy/17-quality-standards-dod.md` |
| Pricing per scope | `@../../business-strategy/10-pricing-sheet.md` |
| Memory rules detail | `@../../business-strategy/07-agent-team-development.md` §7 |
| Cost framework | `@../../business-strategy/07` §6 |
| Eval framework | `@../eval/SPEC.md` |

---

*Last updated: 2026-04-27 — v1.1 (added 5 new standards: curation, versioning, vendor, ADR-index, boundaries)*
