---
file: 50-communication-rules
version: v1.0
last_updated: 2026-04-26
owner: COO
status: production
---

# Communication Rules — Agent ↔ Agent · Agent ↔ Human

> Phối hợp nhịp nhàng đến từ rules truyền thông rõ ràng.

---

## R-COM-01 — Agent Output Format

Every agent output (markdown deliverable) MUST start with **structured header**:

```yaml
---
agent_id: R-MLE
phase: P4c
project_id: ACME-2026-01
task: "ML algorithm spec for demand forecasting"
input_hashes:
  - context_pack: a1b2c3...
  - skill_card: d4e5f6...
generated_at: 2026-04-26T10:00:00Z
model: claude-sonnet-4-20250514
tokens_in: 8123
tokens_out: 4567
cost_usd: 0.12
---
```

Engine consumes this header for: traceability · cost roll-up · re-run reproducibility.

---

## R-COM-02 — Inter-Agent Handoff Doc

When agent A's output feeds agent B, A MUST produce `handoff-{a}-to-{b}.md`:

```markdown
## Handoff Summary
- **Status**: ready / blocked / partial
- **Key decisions taken**: ...
- **Open questions**: ...
- **Required actions by {b}**: ...
- **Watch-outs**: ...
```

B MUST ack within its first turn before substantive work.

---

## R-COM-03 — Status Update Cadence

| Cadence | Who → Who | Format |
|---|---|---|
| Per agent step | Agent → Engine | event log + output header |
| Daily | Engine → Notion / Slack | digest summary per project |
| Weekly | R-PM → Client | status update per `13-product-delivery §4` |
| Weekly | R-CS → Internal | health score update |
| Weekly | R-BIZ → CEO | digest |
| Monthly | R-FIN → COO | close report |
| Quarterly | R-OPS → All | internal QBR |

MUST NOT skip cadence silently — gap = signal of issue.

---

## R-COM-04 — Status Update Template (Client-Facing)

Per `13-product-delivery §4`:

```markdown
## Last week
- Shipped: ...
- Blocked: ...

## This week
- Plan: ...

## Blockers
- ... (with owner + ETA)

## Cost & timeline
- Spend: $X (Y% of budget)
- Schedule: on-track / at-risk / behind

## Action needed from you
- ... (or "none — all good")
```

R-PM generates draft, COO reviews before send.

---

## R-COM-05 — Client Communication Channels

| Channel | Use for | Cadence |
|---|---|---|
| Shared Slack/Discord channel | Async daily | within 24h response |
| Notion project page | Deliverable tracking | live updates |
| Weekly sync call (30 min) | Status + decisions | every Tue or Thu |
| Email | Formal records (SOW, invoice, sign-off) | as needed |
| Phone (rare) | SEV-1 incident · churn save | immediate |

MUST NOT mix channel purposes (e.g., contract terms over Slack).

---

## R-COM-06 — Internal Communication Channels

| Channel | Use for |
|---|---|
| `#general` Slack | Studio-wide announcements |
| `#engineering` | CTO + engineering agents output |
| `#sales-cs` | COO + R-SDR/AM/CS coordination |
| `#alerts` | Eval drift · cost cap · SEV-1 |
| `#retros` | Post-project retro discussions |
| `#decisions` | ADR proposals + sign-offs |
| Notion | Long-form docs · tracking |
| Linear | Tasks · sprint board |

---

## R-COM-07 — Escalation Path

When agent / human encounters issue, escalate per:

```
Agent issue (T1-T5)
    ↓
Charter owner (CEO / COO / CTO per agent)
    ↓
Cross-charter consult (if multi-domain)
    ↓
All-founders sync (if strategic)
```

Escalation MUST include:
- Issue summary (1 paragraph)
- What was tried
- Recommended action
- Decision needed / decision authority

MUST NOT escalate without trying retry path first (per R-EXE-07).

---

## R-COM-08 — SEV Levels

| Level | Definition | Response | Notify |
|---|---|---|---|
| SEV-1 | Production down · data loss · security breach | < 1h | CTO + CEO immediately |
| SEV-2 | Major feature broken · eval drift > 0.5 · cost spike > 30% | < 4h | CTO + responsible agent owner |
| SEV-3 | Minor bug · single agent retry exceeds | < 24h | Slack channel |
| SEV-4 | Cosmetic · doc fix | next sprint | ticket only |

R-OPS maintains incident log. Per-incident retro after SEV-1/2.

---

## R-COM-09 — No Implicit Communication

- Decisions MUST be in `meta/decisions.md` (not Slack DM)
- Agreements MUST have written summary post-call
- Verbal commitments MUST be documented within 24h
- Memory MUST be in `knowledge/docs/memory/` (not in someone's head)

> "If it's not written, it didn't happen."

---

## R-COM-10 — Slack Hygiene

- Threading: use threads, don't fragment channels
- Mentions: `@here` only for SEV-1; `@channel` banned in non-emergency
- Off-hours: respect `15-ops §6` quiet hours; use Slack scheduled send
- DM: minimize for project work — post in channel for transparency

---

## R-COM-11 — Meeting Discipline

- Every meeting MUST have: agenda · time-box · note-taker
- Notes posted to `meta/decisions.md` within 24h
- No agenda → no meeting
- Async-first: prefer doc + comments over meeting when possible

---

## R-COM-12 — Crisis Comms

Per `business-strategy/16-brand §9` for external crisis (data leak · PR issue):

1. **Acknowledge**: within 1h public-facing
2. **Assess**: internal triage 4h
3. **Action**: customer notification per regulation
4. **After**: post-mortem public + private

CEO leads, R-LEG drafts, R-CONTENT executes.

---

## R-COM-13 — Tone with Client

- Direct over deferential
- Honest over reassuring (when bad news)
- Data over opinion
- Concrete over vague

MUST NOT:
- Apologize excessively
- Over-promise on uncertain
- Hide bad news till end
- Use jargon without explanation

---

## R-COM-14 — Agent Self-Reporting

Agent MUST self-report when:
- Confidence < 70% on critical decision (CTO sign needed)
- Hit context limit (request truncation strategy)
- Detect inconsistency in inputs (don't paper over)
- Cost > 80% of step budget (alert before exceed)

Engine logs `agent_self_report` event.

---

## Quick Reference

```
COMMS RULES (R-COM):
01 Output header · 02 Handoff doc · 03 Cadence
04 Status template · 05 Client channels · 06 Internal channels
07 Escalation path · 08 SEV levels · 09 Written or didn't happen
10 Slack hygiene · 11 Meeting discipline · 12 Crisis comms
13 Tone with client · 14 Agent self-report
```

---

## Cross-References

- Communication norms: [`@../../business-strategy/15-business-operations.md:386`](../../business-strategy/15-business-operations.md)
- Status template: [`@../../business-strategy/13-product-delivery-process.md:546`](../../business-strategy/13-product-delivery-process.md)
- Crisis playbook: [`@../../business-strategy/16-brand-content-kit.md:427`](../../business-strategy/16-brand-content-kit.md)

---
*v1.0*
