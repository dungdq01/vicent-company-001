# _shared/.agents/ — Agent Skill Cards Registry

**Parent**: [`@../README.md`](../README.md) (L2 toolbox)
**Authoritative roster**: [`TEAM-CONFIG.md`](./TEAM-CONFIG.md) — 57 agent roles + 3 exec hats, 6 tiers (T0-T5) — incl R-CoS concierge (T0)

**Mục đích**: nơi chứa **skill card** (system prompt + I/O contract + cost target + eval criteria) cho từng agent. Đây là **tác nhân thực thi** dùng cho mọi project, mọi quy mô.

---

## � MANDATORY: Rules Preamble Injection

**Mọi agent invocation MUST inject `_shared/prompts/RULES-PREAMBLE.md`** phía trước skill card system prompt. Đây là **"Claude skill"** để mọi agent ràng buộc vào studio constitution.

```
SYSTEM PROMPT = RULES_PREAMBLE + SKILL_CARD + (optional project overrides)
```

Engine MUST:
1. Load `_shared/prompts/RULES-PREAMBLE.md` và substitute placeholders ({agent_id}, {phase_id}, {project_id}, {model})
2. Append skill card tương ứng
3. Pass as `system` field cho Claude API
4. Log `preamble_version` + `preamble_hash` vào output header

Không inject preamble = agent refuse + emit `RULES_MISSING` event (per preamble § First Turn).

**Reference**: [`@../prompts/RULES-PREAMBLE.md`](../prompts/RULES-PREAMBLE.md)

---

## �📋 Roster (xem `TEAM-CONFIG.md` cho full detail)

| Tier | Count | Mục đích | Files |
|---|---|---|---|
| **T0 — Executive** | 3 + 1 | CEO · COO · CTO charters (human) + **R-CoS concierge agent** | `tier-0-executive/` |
| **T1 — Research** | 5 | R-α Archon, R-β Praxis, R-γ Sentinel, R-σ Scribe, R-eval Judge | `tier-1-research/` |
| **T2 — Engineering** | 20 | Build-time (17): DE, DA, DBE, MLE, DLE, NLP, CVE, AE, BE, FE, FS, ME, DO, CE, SE, QA, PE · Ops-stream (3): R-LLMOps, R-SRE, R-DataOps | `tier-2-engineering/` |
| **T3 — Domain** | 20 | R-D01 (Retail) ... R-D20 (Cybersecurity) | `tier-3-domain/` |
| **T4 — Delivery (Product)** | 5 | PM, SA, BA, UX, TC | `tier-4-delivery/` |
| **T5 — Business (Studio Ops)** | 10 | SDR, AM, MKT, CONTENT, CS, FIN, LEG, HR, OPS, BIZ | `tier-5-business/` |

**Total: 3 (T0 charters) + 1 (R-CoS) + 4 (T1) + 17 (T2) + 20 (T3) + 5 (T4) + 10 (T5) = 57 agent roles + 3 exec hats**

---

## 🎯 Phase 1 Active Agents (18 ưu tiên build skill card)

Theo `@../../business-strategy/07-agent-team-development.md` §3 + `09-phase1-execution-plan`:

**Product delivery (13)**:
- **T1** (5): R-α, R-β, R-γ, R-σ — luôn invoke + R-eval (auto-judge mọi output)
- **T2 critical** (5): R-MLE, R-DE, R-BE, R-FE, R-DO
- **T2 niche** (2): R-NLP (LLM/text-heavy), R-AE (agentic project)
- **T4** (2): R-PM, R-SA

**Studio ops (5 from T5)**:
- R-SDR, R-AM — sales (đem $$$ về)
- R-CONTENT — newsletter + 1 article/tuần (audience flywheel)
- R-CS — onboard + retain Founding Customers
- R-FIN — invoice + monthly close (cash discipline)

**Tier 0** (always-on charters): CEO, COO, CTO.

→ 18 cards build trước. T3 (20 domain) dùng template + load context per project. T5 phase-2 (R-MKT, R-LEG, R-HR, R-OPS, R-BIZ) ship khi MRR > $5K.

---

## 📐 Skill Card Format

Mỗi `.md` file format:

```markdown
---
agent_id: R-{id}
name: {Persona name}
tier: T{1-4}
version: v1.0
last_updated: YYYY-MM-DD
status: production | development | deprecated
---

# {Agent Name}

## Role
1-2 sentences

## Inputs
- What context to load (link to knowledge/_shared/etc)

## Outputs
- Deliverable spec + format

## System Prompt
(full prompt text)

## Tools
- web_search? code_execution? file_io?

## Cost Target
- Input/output tokens per run
- USD per run

## Eval Criteria
- Link to `@../eval/golden-sets/R-{id}.yaml`
- Pass threshold ≥ X

## Few-Shot Examples
- (optional, link to project examples)

## Failure Modes
- Known patterns + retry rule
```

---

## 🔄 Versioning Rule

- **v1.0** initial → 7-stage probation per W09 → production
- **v1.1+** when: pattern across ≥3 projects + eval +0.3 (per R-MAS-08)
- **Deprecate** when v2.0 stable for 1 phase
- **Sunset** per R-LCY-03 (quarterly audit)

Changelog: [`CHANGELOG.md`](CHANGELOG.md) (root of `.agents/`)
Onboarding flow for new agent: [`@../../experience/workspace/docs/workflows/W09-agent-onboarding.md`](../../experience/workspace/docs/workflows/W09-agent-onboarding.md)
Project version pin: [`@../standards/versioning-pinning.md`](../standards/versioning-pinning.md)

---

## ➕ Adding / Sunsetting Agent Roles

Per `@../standards/change-management.md` **§1 Add/Remove Agent Role** — concrete checklist 12 places (skill card + golden set + TEAM-CONFIG + tier-README + agents-README + CHANGELOG + document-catalog + AGENT-MANUAL + W04 + phase-docs + START-HERE branch + W09 probation). Skip checklist = orphan refs.

---

## 🔗 Cross-Reference

| Concept | Path |
|---|---|
| **Rules system (11 rules)** | `@../rules/` |
| **Rules preamble (Claude skill v1.1)** | `@../prompts/RULES-PREAMBLE.md` |
| **CHANGELOG** | `./CHANGELOG.md` |
| **Agent onboarding workflow** | `@../../experience/workspace/docs/workflows/W09-agent-onboarding.md` |
| Roster authoritative | `TEAM-CONFIG.md` |
| Executive charters | `tier-0-executive/` |
| Eval framework | `@../eval/SPEC.md` |
| Eval golden sets | `@../eval/golden-sets/R-{id}.yaml` |
| Kickoff invoke | `@../prompts/KICKOFF-PROMPT.md` |
| Product pipeline (P0-P10) | `@../../experience/workspace/docs/pipeline/` |
| Path B/C/D pipelines | `@../../experience/workspace/docs/pipeline/PATH-B-PRODUCT.md` etc. |
| Business pipelines (sales/content/CS/hiring/finance) | `@../../experience/workspace/docs/pipelines-business/` |
| Strategic agent plan | `@../../business-strategy/07-agent-team-development.md` |
| Personal dev plan | `@../../business-strategy/06-personal-development.md` |

---

## Skill Card Frontmatter — Required Fields (v1.2)

Per R-HRN-15 (determinism control), every skill card MUST declare:

```yaml
---
agent_id: R-{id}
tier: {0|1|2|3|4|5}
version: vX.Y
sampling:
  temperature: 0.3        # per role tier (R-HRN-15 default table)
  top_p: null
  seed: null              # MANDATORY number for golden-set runs
tool_loop:
  max_iterations: 10      # override R-HRN-13 default if needed
---
```

**Backfill policy**: existing skill cards add `sampling` + `tool_loop` block khi card được touch next time (R-HRN-17 SOFT recall — not forced migration). Eval golden runs without seed = blocked at R-eval Layer 3.

---

*Last updated: 2026-05-02 — v1.2 (sampling + tool_loop frontmatter required per R-HRN-13/15)*
