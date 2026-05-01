# _shared/templates/project/ — Project Skeleton

**Parent**: [`@../README.md`](../README.md)

---

## Mục đích

Skeleton **mức overview** dùng cho **mọi dự án** (Sprint A → D). Engine khi intake (P0):

1. Copy toàn bộ folder này → `projects/{PROJECT_ID}/`
2. Substitute `{{VAR}}` placeholders từ intake form
3. Theo scope tier, agent fill từng file qua các phase P0-P9
4. Mỗi project sẽ **đào sâu hơn** từ skeleton tùy nhu cầu

> Nguyên tắc: skeleton này là **contract khung** (mọi section cần có). Nội dung detail là per-project.

---

## File Inventory

### Phase Deliverables

| File | Phase | Filled by | Scope tier |
|---|---|---|---|
| `00-intake.md` | P0 | R-PM + Human | All |
| `01-discovery-report.md` | P1 | R-α/β/γ + R-σ | All |
| `02-proposal.md` | P2 | R-AM + R-PM | All |
| `02-sow.md` | P2 (G1) | R-LEG + R-AM | B+ |
| `03-architecture.md` | P3 | R-SA | B+ |
| `03-tech-stack.md` | P3 | R-SA + CTO | B+ |
| `04-prd.md` | P3-P4 | R-BA + R-PM | C+ (recommended) |
| `04a-api-design.md` | P4a | R-BE | C+ |
| `04b-db-schema.md` | P4b | R-DBE / R-DE | C+ |
| `04c-ml-spec.md` | P4c | R-MLE / R-DLE | If ML in scope |
| `04d-ui-spec.md` | P4d | R-UX + R-FE | C+ |
| `04e-integration.md` | P4e | R-SA + CTO | C+ |
| `05-planning.md` | P5 | R-PM | C+ |
| `06-dev-guides.md` | P6 | R-σ + R-TC | C+ |
| `07-qa-plan.md` | P7 | R-QA | C+ |
| `08-deploy.md` | P8 | R-DO + R-SE | D |
| `09-final-package.md` | P9 | R-PM + R-TC | D |
| `99-retro.md` | Post-P9 | R-σ + R-PM | All |

### Meta Files

| File | Purpose |
|---|---|
| `_meta.json` | Project metadata schema (filled at intake) — includes `harness_profile` (L0/L1/L2) + `version_pin` (per `versioning-pinning.md`) |
| `_state.json` | Pipeline state machine (engine-managed) |
| `ADR-template.md` | Architecture Decision Record (per `_shared/standards/decision-log-index.md`) |
| `SCR-template.md` | Scope Change Request |

### Harness folder (mandatory per R-HRN-05)

| File | Purpose |
|---|---|
| `harness/manifest.yaml` | Control loop, tools, memory tier, cache, cost cap (filled at P3 by R-AE) |
| `harness/guardrails.yaml` | Approval matrix, network whitelist, hard-deny (locked at P5 by COO sign) |
| `harness/permanent-fixes.md` | Append-only failure → rule log (R-HRN-06) |
| `harness/memory/` | Long-term tier per R-HRN-04 (transferable patterns only) |
| `harness/traces/` | Control loop traces R-HRN-02 + observability triple R-HRN-12 |

---

## Variable Convention

Templates use `{{VAR_NAME}}` placeholders:

| Variable | Source |
|---|---|
| `{{PROJECT_ID}}` | `P-YYYYMM-NNN` from intake |
| `{{PROJECT_NAME}}` | Client-friendly project name |
| `{{CLIENT_NAME}}` | Client company |
| `{{INDUSTRY}}` | I0X identifier (e.g., I06 Logistics) |
| `{{BASELINES}}` | Comma-list e.g., "B01, B06" |
| `{{SCOPE_TIER}}` | A / B / C / D |
| `{{START_DATE}}` | ISO 8601 |
| `{{TARGET_DATE}}` | ISO 8601 |
| `{{BUDGET_USD}}` | Numeric |
| `{{AGENT_TEAM}}` | List of agent IDs |
| `{{CTO_NAME}}` · `{{CEO_NAME}}` · `{{COO_NAME}}` | From `_shared/.agents/tier-0-executive/` |

Engine substitutes at instantiation. Unsubstituted `{{VAR}}` after P0 = block.

---

## How to Use Per Scope Tier

| Scope tier | Active files |
|---|---|
| **Sprint A** (POC, $30 PDF MMO) | `00-intake.md`, `01-discovery-report.md`, `02-proposal.md`, `99-retro.md`, `harness/` (always) |
| **Sprint B** (proposal+arch) | A + `02-sow.md`, `03-architecture.md`, `03-tech-stack.md` |
| **Sprint C** (full design) | B + `04-prd.md`, `04a-d`, `04e`, `05-planning.md`, `06-dev-guides.md`, `07-qa-plan.md` |
| **Sprint D** (build+ship) | C + `08-deploy.md`, `09-final-package.md` |

**Note**: `harness/` folder is **always copied** regardless of tier (per R-HRN-05). Profile L0/L1/L2 controls how rigorously its components are filled.

Files khác giữ skeleton (unfilled) — không xoá để traceability.

---

## Filling Guidance

Mỗi template có 3 loại marker:

- `{{VAR}}` — Engine auto-fill at instantiation
- `[Fill: ...]` — Agent fill during phase work
- `💡 Hint:` — Guidance for what content goes here

Khi filling:
- ✅ Replace `[Fill: ...]` with concrete content
- ✅ Remove `💡 Hint:` lines once content finalized
- ❌ Don't delete sections — mark "N/A — not in scope" if not applicable

---

## Cross-References

- Phase docs (workflow): [`@../../../experience/workspace/docs/pipeline/`](../../../experience/workspace/docs/pipeline/)
- DoD per deliverable: [`@../../standards/dod-per-deliverable.md`](../../standards/dod-per-deliverable.md)
- Skill cards: [`@../../.agents/`](../../.agents/)
- Rules system: [`@../../rules/`](../../rules/) (11 rules)
- Harness rules: [`@../../rules/80-harness-rules.md`](../../rules/80-harness-rules.md) (R-HRN-01..12)
- Harness folder: [`@./harness/README.md`](./harness/README.md)
- Versioning + project pin: [`@../../standards/versioning-pinning.md`](../../standards/versioning-pinning.md)
- ADR conventions: [`@../../standards/decision-log-index.md`](../../standards/decision-log-index.md)

---
*v1.1 — last updated 2026-04-27 (added harness folder + versioning + ADR conventions)*
