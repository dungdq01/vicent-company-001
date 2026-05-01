# _shared/rules/ — Rules System (Agent Constitution)

**Parent**: [`@../README.md`](../README.md) (L2 toolbox)

---

## Mục đích

Hệ thống **rules** mà **mọi agent** (T1-T5) MUST bám vào khi thực thi. Đây là **hiến pháp** của studio — không có rule = không có collaboration nhịp nhàng giữa các agent + người.

Rules ≠ Suggestions. Vi phạm rule = **eval fail** (tự động retry hoặc escalate per `quality/EVAL-GATES.md`).

**TOP 16 INVARIANTS** (R-MAS-01 → R-MAS-16) auto-injected vào mọi agent system prompt qua `RULES-PREAMBLE.md`. R-MAS-16 (Framework Read-Only During Engagement) added 2026-04-27 closes mid-engagement framework write loophole.

---

## Cách Agent Load Rules

**Mọi agent system prompt** MUST inject `_shared/prompts/RULES-PREAMBLE.md` ở đầu. Preamble này:
1. Tham chiếu master rules + domain-specific rules
2. Yêu cầu agent confirm rules awareness ở turn đầu
3. Set escalation behavior khi rule conflict với task

→ Engine orchestrator (Layer 2 of `experience/AGENT-WORKSPACE-PIPELINE`) tự inject preamble.

---

## Rules Stack (11 layers)

| File | Domain | RFC2119 mix | Owner |
|---|---|---|---|
| [`00-MASTER-RULES.md`](00-MASTER-RULES.md) | Constitution — top invariants | All MUST | CEO |
| [`10-stack-rules.md`](10-stack-rules.md) | Tech stack & framework | Strong | CTO |
| [`20-code-rules.md`](20-code-rules.md) | Coding conventions | Mix | CTO |
| [`30-execution-rules.md`](30-execution-rules.md) | Pipeline & agent collaboration | Strong | COO |
| [`40-docs-rules.md`](40-docs-rules.md) | Documentation conventions | Mix | CEO |
| [`50-communication-rules.md`](50-communication-rules.md) | Agent ↔ agent · agent ↔ human | Mix | COO |
| [`60-security-rules.md`](60-security-rules.md) | Security + LLM safety | All MUST | CTO |
| [`70-quality-rules.md`](70-quality-rules.md) | Eval & DoD as rules | Strong | CTO |
| [`80-harness-rules.md`](80-harness-rules.md) | Agent runtime: control loop, tool budget, memory tiers, drift, permanent-fix, sandbox, KV-cache, approval gates | All MUST | CTO |
| [`90-lifecycle-rules.md`](90-lifecycle-rules.md) | Demote · sunset · vendor drift · multi-path priority · framework retro · long-term client | All MUST | CTO |
| [`100-orchestration-rules.md`](100-orchestration-rules.md) | Dispatcher · tiebreak · handoff QA · agent onboarding · phase rewind · voice contract | All MUST | COO |

---

## Rule ID Convention

Format: **`R-{domain}-{NN}`**
- domain: `MAS` master · `STK` stack · `COD` code · `EXE` execution · `DOC` docs · `COM` comms · `SEC` security · `QAL` quality · `HRN` harness · `LCY` lifecycle · `ORC` orchestration
- NN: zero-padded 2-digit

Example: `R-EXE-03` = "Phase transition gate must pass DoD checklist".

→ Mọi violation trong eval report cite rule ID. Mọi exception cần ADR (`15-business-operations §5`) reference rule ID being waived.

---

## RFC 2119 Keywords

| Keyword | Meaning |
|---|---|
| **MUST** / SHALL | Hard constraint. Violation = block. |
| **MUST NOT** | Hard prohibition. |
| **SHOULD** | Strong default. Deviation requires ADR. |
| **SHOULD NOT** | Strong avoidance. Deviation requires ADR. |
| **MAY** | Optional. |

---

## Update Cadence

- **Patch** (typo, clarify): anytime, COO sign
- **Minor** (new rule, soft-enforce): monthly, CTO/CEO sign per domain
- **Major** (rule change with breaking impact): quarterly, all-founders sign + ADR

Every rule change → bump version in file header → diff posted to `CHANGELOG.md` (rules root).

---

## Adding / Modifying / Sunsetting Rules

Per `_shared/standards/change-management.md` **§3 Modify Harness Rule** (or analogous for non-harness rules). Concrete checklist 5-9 places to update including: rule canonical file + RULES-PREAMBLE + skill cards referencing + manifest template + W04 dispatch + phase docs Harness Checkpoint + project re-eval. ADR mandatory + CTO sign.

Skip checklist = orphan refs + silent drift.

---

## Cross-References

| Need | Path |
|---|---|
| Master rules (1-page constitution) | [`00-MASTER-RULES.md`](00-MASTER-RULES.md) |
| System prompt preamble | [`@../prompts/RULES-PREAMBLE.md`](../prompts/RULES-PREAMBLE.md) |
| Eval gates (rule enforcement) | [`@../../experience/workspace/docs/quality/EVAL-GATES.md`](../../experience/workspace/docs/quality/EVAL-GATES.md) |
| Failure modes catalogue | [`@../eval/failure-modes.md`](../eval/failure-modes.md) |
| Standards (DoD, memory, cost) | [`@../standards/`](../standards/) |
| ADR template (rule waivers) | [`@../../business-strategy/15-business-operations.md:321`](../../business-strategy/15-business-operations.md) |

---
*v1.1 — last updated 2026-04-28 (TOP 16 invariants — R-MAS-16 Framework Read-Only added)*
