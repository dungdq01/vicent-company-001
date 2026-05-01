# P10 — Long-Term Client Lifecycle (post-30-day)

> Closes lỗ hổng B7 (post-Sprint vùng tối). After P9 + 30-day support, framework had no spec — clients silently churn or auto-renew without intent.

**Trigger**: Day 31 after P9 close.
**Owner**: R-CS / P3 (COO).
**Authority**: COO for retention; CEO for upsell beyond 2× original deal.
**Companion**: parallel to Operate stream (R-LLMOps / R-SRE / R-DataOps continuous).

---

## Cadence Map

```
P9 close → +30 day      [end of Sprint A support]
       ↓
P10.1 Day 60            CS check-in + NPS survey
       ↓
P10.2 Day 90            Expansion review (Sprint B / retainer / lost)
       ↓
[if retainer]
P10.3 Quarterly         QBR (Quarterly Business Review)
       ↓
P10.4 Annually          Contract renewal
```

---

## P10.1 — Day 60 CS Check-in

**Owner**: P3 (CS).

| Step | Action | Output |
|---|---|---|
| 60.1 | Send NPS survey (Notion form) | Score 0–10 |
| 60.2 | 30-min check-in call | Notes in `projects/{id}/cs/day-60.md` |
| 60.3 | Identify usage / non-usage signal | Health classification |
| 60.4 | If usage low → diagnostic call (free) | Find blocker |

**Health classification**:
- 🟢 Green: NPS ≥ 8, active usage, expansion signals
- 🟡 Yellow: NPS 6–7, sporadic usage, need re-engagement
- 🔴 Red: NPS < 6 OR no usage in 14 days, churn risk

---

## P10.2 — Day 90 Expansion Review

**Owner**: P3 + CEO (for scope ≥ $3K).

3-path decision:

| Path | When | Action |
|---|---|---|
| **Done** | Sprint A satisfied, no further need | Acknowledge, ask for case study + referral, archive |
| **Sprint B / next tier** | 🟢 health + identified next pain | New SOW, P0 enters Path A again (project ID continued) |
| **Retainer** | Recurring need, recurring usage | Retainer SOW (`14-customer-success-playbook §5`) — monthly $500–2000 |
| **Lost** | 🔴 health, no recovery | Exit interview + retro, save churn pattern memory |

---

## P10.3 — Quarterly Business Review (QBR)

**Trigger**: any retainer client OR Sprint B+ active.

**Format**: 60-min call + slide deck.

| Section | Content |
|---|---|
| Health metrics | Usage, cost, savings achieved, NPS trend |
| Project portfolio (theirs) | What's live, what's planned |
| AI / industry update | Relevant SOTA they should know |
| Risks / blockers | Honest discussion |
| Next quarter ask | Renew, expand, change |

**Output**: `projects/{id}/qbr/{YYYY-Qn}.md` with action items + next QBR booked.

---

## P10.4 — Annual Renewal

**Trigger**: T-60 days from contract anniversary.

| Step | Owner | Action |
|---|---|---|
| Pre-renewal audit | CEO | Margin analysis, fit re-assessment |
| Renewal proposal | P3 + CEO | Send T-30 with options (keep, upgrade, downgrade, exit gracefully) |
| Negotiation | P3 | Per `12-sales-playbook.md` |
| Sign or churn | both | New SOW or graceful exit (handoff doc + 30-day wind-down) |

---

## Churn Pattern Mining

Lost clients (P10.2 lost path OR P10.4 non-renewal):
1. Exit interview within 7 days (P3)
2. Retro with CEO + COO
3. Pattern → add to `studio/wisdom/churn-patterns.md`
4. If pattern recurs across 3+ clients → adjust ICP / pricing / delivery (likely ADR)

---

## Resurrect Path (lost client returns)

After ≥ 90 days post-loss, client re-engages:
1. NEW project ID (continuity false)
2. Path A from P0 — old context useful but treat as new opportunity
3. Knowledge pin: re-pin to current versions, NOT old project's pin
4. Special pricing TBD (loyalty discount or normal?) — per ADR

---

## Operate Stream (parallel to P10)

For clients with deployed AI products (post-P8):

| Cadence | Owner | Activity |
|---|---|---|
| Daily | R-SRE | Health check, alerts |
| Weekly | R-LLMOps | Prompt regression + cost + cache review |
| Weekly | R-DataOps | PII audit + retention enforcement |
| Monthly | P3 + R-SRE | Operational summary to client |
| Quarterly | CEO | Strategic AI advisory in QBR |

These stream parallel — KHÔNG separate from P10 cadence.

---

<!-- @harness-checkpoint -->
## Harness Profile

P10 profile inherited from P9 close. Typically L1 or L2.

Operate stream agents (R-LLMOps, R-SRE, R-DataOps) read same `harness/manifest.yaml` + `guardrails.yaml`. Permanent-fix log keeps growing (any incident logged → rule update).

---

## Cross-References

- CS playbook: [`@../../../../business-strategy/14-customer-success-playbook.md`](../../../../business-strategy/14-customer-success-playbook.md)
- Sales playbook (renewal, negotiation): [`@../../../../business-strategy/12-sales-playbook.md`](../../../../business-strategy/12-sales-playbook.md)
- Lifecycle rules (long-term): [`@../../../../_shared/rules/90-lifecycle-rules.md`](../../../../_shared/rules/90-lifecycle-rules.md) §R-LCY-09
- Operate-stream agents:
  - [`R-LLMOps`](../../../../_shared/.agents/tier-2-engineering/R-LLMOps-llm-operations.md)
  - [`R-SRE`](../../../../_shared/.agents/tier-2-engineering/R-SRE-site-reliability.md)
  - [`R-DataOps`](../../../../_shared/.agents/tier-2-engineering/R-DataOps-data-operations.md)
- P9 closure: [`@./P9-DELIVERY.md`](P9-DELIVERY.md)

---
*Pipeline P10 v1.0 — Adopted 2026-04-27. Closes post-Sprint vùng tối.*
