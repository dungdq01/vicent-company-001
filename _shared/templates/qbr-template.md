# Quarterly Business Review — {{CLIENT_NAME}} {{YYYY-Qn}}

> Per P10.3. For retainer clients OR Sprint B+ active. 60-min call + slide deck.

---

## Metadata

| Field | Value |
|---|---|
| Client | {{CLIENT_NAME}} |
| Project ID | {{P-YYYYMM-NNN}} |
| Quarter | {{YYYY-Qn}} |
| Date | {{ISO}} |
| Studio attendees | {{e.g., CEO, P3 (CS owner)}} |
| Client attendees | {{e.g., COO, tech lead}} |
| Recorded? | yes (Loom link: {{...}}) |

---

## 1. Health Metrics

```yaml
quarter_metrics:
  uptime_pct: {{99.x}}
  ttfr_p50_seconds: {{n}}
  ttfr_p95_seconds: {{n}}
  sev_0_count: {{n}}
  sev_1_count: {{n}}
  sla_breaches: {{n}}
  cost_actual_usd: {{n}}
  cost_vs_baseline: {{+/- %}}
  savings_for_client_usd: {{n if measurable, e.g., reduced staff hours × hourly rate}}
  nps_score: {{0-10}}
```

Compare quarter-over-quarter trend (chart).

---

## 2. Project Portfolio (Client's)

What's live currently:
- {{product/service}} — status: {{green/yellow/red}}, next milestone: {{...}}

What's planned (this Q):
- {{...}}

What's in backlog:
- {{...}}

---

## 3. AI / Industry Update (relevant to Client)

Studio briefing:
- {{relevant SOTA they should know}}
- {{vendor / model changes affecting them}}
- {{regulatory updates if any}}

Don't dump research — curate to 3-5 items max, each with "so what for client".

---

## 4. Risks / Blockers (honest discussion)

| Risk | Likelihood | Impact | Mitigation in flight |
|---|---|---|---|
| {{risk}} | high/med/low | high/med/low | {{what's being done}} |

Cover both Studio-side risks (capacity, vendor) and Client-side (their team, market shift).

---

## 5. Voice of Customer (collected via Day 60 NPS + ad-hoc)

Direct quotes (anonymized when shared internally):
> "{{quote}}"

What client said worked:
- bullet

What client said could be better:
- bullet

What client wishes Studio would do:
- bullet

---

## 6. Next Quarter Ask

Path-decision (per P10.2 framework):
- ☐ **Continue retainer** as is
- ☐ **Expand** — new scope (proposed: {{...}}, $XX)
- ☐ **Reduce** — lower retainer ({{reason}})
- ☐ **Change** — different cadence / different team allocation
- ☐ **Wind down** — graceful exit (per P10.4 annual)

Decision authority: COO for ≤ existing scope; CEO for ≥ 2× existing or strategic pivot.

---

## 7. Action Items

| # | Action | Owner | ETA |
|---|---|---|---|
| 1 | | | |

Studio-side actions tracked in `projects/{id}/cs/qbr-actions-{YYYY-Qn}.md`.

---

## 8. Next QBR

Booked: {{date next Q + 60 days}} — same time slot, same attendees if possible.

---

## Cross-References

- P10 long-term lifecycle: [`@../../experience/workspace/docs/pipeline/P10-LONG-TERM.md`](../../experience/workspace/docs/pipeline/P10-LONG-TERM.md) §P10.3
- Lifecycle rule: [`@../rules/90-lifecycle-rules.md`](../rules/90-lifecycle-rules.md) §R-LCY-09
- CS playbook: [`@../../business-strategy/14-customer-success-playbook.md`](../../business-strategy/14-customer-success-playbook.md)

---
*Template v1.0 — 2026-04-27.*
