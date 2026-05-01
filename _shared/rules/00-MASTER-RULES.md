---
file: 00-MASTER-RULES
version: v1.0
last_updated: 2026-04-26
owner: CEO
status: production
---

# Master Rules — The Studio Constitution

> 1-page invariants. Every agent + human MUST follow. Other rule files extend these — never override.

**RFC 2119**: MUST · MUST NOT · SHOULD · SHOULD NOT · MAY (xem `README.md`).

---

## R-MAS-01 — Single Source of Truth (SoT)

Every concept (skill card · DoD · pricing · rule) lives in **exactly one** canonical location. Other docs **MUST reference**, never duplicate. Drift = bug.

> Violation example: copying DoD per phase into both `_shared/standards/dod-per-deliverable.md` AND `pipeline/Px.md` → fork in maintenance.
> Auto-check: Drift detection cron (compares hash of cited section vs source).

---

## R-MAS-02 — Rules Awareness Confirmation

Every agent invocation MUST produce internally a 1-line confirmation: *"Rules loaded: MAS · {domain1} · {domain2}"* before any task work. If preamble missing → agent MUST refuse and emit `rules_missing` event.

---

## R-MAS-03 — Layered Authority

Decisions follow charter authority (Tier 0): **CEO · COO · CTO** per `tier-0-executive/`. Agent MUST escalate (not decide) when:
- Decision impact > 1 quarter
- New framework / library
- Production deploy
- Pricing change > 20%
- Refund > $1K
- Hire / fire
- Eval threshold change

---

## R-MAS-04 — No FOMO

Tech stack, framework, tool additions MUST go through ADR (`15-ops §5`) with eval delta proof. "Trending on HN" is not a reason. CTO sign mandatory for any code dependency add.

---

## R-MAS-05 — Memory Promotion Path

Insights flow upstream: project retro (L4) → memory (L1 `knowledge/docs/memory/`) → skill card update (L2) → pipeline adjustment (L3). Skipping a layer = orphan knowledge.

See: [`@../../01-FRAMEWORK.md`](../../01-FRAMEWORK.md)

---

## R-MAS-06 — Anti-Hallucination

Agents MUST NOT fabricate:
- Statistics / numbers (cite URL or say "no data")
- Company facts (LinkedIn / news verifiable)
- Citations / references
- API behaviors not documented

Violation in production = SEV-2 incident.

---

## R-MAS-07 — Cost Discipline

Every agent run MUST stay within `cost-budgets.md` cap. Engine MUST hard-block at 100% cap (no soft-warnings until catastrophe). Per-project cumulative cap enforced.

See: [`@../standards/cost-budgets.md`](../standards/cost-budgets.md)

---

## R-MAS-08 — Eval Before Promote

Prompt v1.0 → v1.x ONLY when:
- ≥ +0.3 mean improvement on golden set
- 0 regressions
- Pattern across ≥ 3 projects
- CTO sign in `_shared/.agents/CHANGELOG.md`

No "ship the prompt, fix eval later" path exists.

---

## R-MAS-09 — Human-in-the-Loop Gates

Every Phase Px / Sx / CSx / Hx / Fx has **mandatory human checkpoints** documented in pipeline DoD. Engine MUST pause + emit `awaiting_human` event. Auto-skip = block + alert COO.

---

## R-MAS-10 — Retro is Non-Negotiable

Every closed project + every churned client → `99-retro.md` within 7 days. Skipping retro = block invoice closure (R-FIN enforces).

---

## R-MAS-11 — Forbidden Globally (across all agents)

Agents MUST NOT, regardless of role:

- ❌ Sign documents on behalf of company
- ❌ Send communications without human approval (sales · legal · finance · client-facing)
- ❌ Modify production prompts / configs without ADR
- ❌ Auto-run irreversible operations (delete data · refund · fire)
- ❌ Bypass eval gates ("just this one time")
- ❌ Approve own work (no self-review)
- ❌ Dump raw web search into output without synthesis
- ❌ Use `delve` / `tapestry` / `unleash` / `in today's fast-paced` (banned word list, see `40-docs-rules`)
- ❌ Promise outcomes (ROI %, "transformation", "revolutionary")

---

## R-MAS-12 — When Rules Conflict

Order of precedence:
1. **Master rules (this file)** — top
2. Domain rules (`10-` to `70-`)
3. Skill card "Forbidden" sections
4. Project-specific overrides (`projects/{id}/_metadata/rule-overrides.json` — requires ADR)

Conflict between rules of same level → escalate to **CEO** for arbitration.

---

## R-MAS-13 — Charter Compliance

Every agent action MUST be consistent with the charter of the Tier 0 owner of that agent's tier. E.g., R-CS owned by COO → R-CS actions MUST not violate `COO-charter.md` decision rights.

---

## R-MAS-14 — Documentation Required for Decisions

Every decision affecting:
- Architecture
- Pricing
- Scope (in/out)
- Stack
- Eval threshold
- Vendor selection

MUST produce ADR doc. Undocumented decisions = **doesn't exist** for future audits.

---

## R-MAS-15 — Honesty Bias

When uncertain, agent MUST say "I don't know" or "insufficient data" rather than confabulate. Confidence theater = trust killer with client + with future agent runs reading memory.

---

## R-MAS-16 — Framework Read-Only During Engagement

Framework folders MUST be **READ-ONLY** trong context của 1 active engagement:
- `_shared/` (rules, agents, prompts, standards, templates, eval, decisions)
- `knowledge/data/` (baselines + industries production)
  - **EXEMPT**: `knowledge/staging/` (Path D writes — gated by W11 K-review)
  - **EXEMPT**: `knowledge/_quarantine/` (R-σ demote action — operational, not engagement)
- `experience/` (pipeline + workflows)
- `business-strategy/`
- `studio/wisdom/`

Mid-engagement deviations MUST go to `projects/{id}/` (not framework).

**Engine runtime EXEMPT** (auto-write allowed during dispatch):
- `projects/_ops/active-paths.json` (dispatch tracking)
- `projects/_ops/dispatch-log.jsonl` (audit trail)
- `projects/_ops/resource-lock.json` (concurrency)
- `knowledge/staging/_review-queue.yaml` (Path D queue append)

Framework write-back ONLY via 3 paths:
1. **Path D** (knowledge re-research) → `knowledge/staging/` → K-review (W11) → promote
2. **W08 framework retro** (quarterly batch) → ADR + structural change
3. **W11 K-review** (memory promotion from project retro) — already-closed projects only

Mid-engagement write to framework = **BLOCK + escalate**. Engine enforce via path-prefix whitelist per dispatch context. Violation = R-MAS-16 violation, log to `projects/{id}/harness/permanent-fixes.md` + escalate CTO.

> **Why**: framework là wrapper. Engagement-specific deviation phải isolate in `projects/{id}/`. Vi phạm = framework drift mid-engagement = reproducibility vỡ + audit trail vỡ.

---

## Quick Reference Card (for agent prompt injection)

```
MASTER RULES (R-MAS):
01 Single Source of Truth · 02 Rules Awareness · 03 Layered Authority
04 No FOMO · 05 Memory Promotion · 06 No Hallucination
07 Cost Discipline · 08 Eval Before Promote · 09 Human Gates
10 Retro Mandatory · 11 Globally Forbidden · 12 Conflict Resolution
13 Charter Compliance · 14 Document Decisions · 15 Honesty Bias
16 Framework Read-Only During Engagement
```

---

## Cross-References

- Domain rules: [`10-stack-rules.md`](10-stack-rules.md) · [`20-code-rules.md`](20-code-rules.md) · [`30-execution-rules.md`](30-execution-rules.md) · [`40-docs-rules.md`](40-docs-rules.md) · [`50-communication-rules.md`](50-communication-rules.md) · [`60-security-rules.md`](60-security-rules.md) · [`70-quality-rules.md`](70-quality-rules.md)
- Charters: [`@../.agents/tier-0-executive/`](../.agents/tier-0-executive/)
- Framework: [`@../../01-FRAMEWORK.md`](../../01-FRAMEWORK.md)

---
*Studio Constitution v1.0 — amendments require all-founders sign + ADR*
