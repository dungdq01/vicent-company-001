---
file: incident-severity
version: v1.0
last_updated: 2026-04-27
owner: CTO + COO
status: production
---

# Incident Severity Classification

> Per W05 + R-SRE. Sev 0/1/2/3 spec — drives paging, comms, postmortem requirement.

---

## Severity Levels

### Sev 0 — Critical (P0 page)

**Definition**: Total service outage OR data breach OR safety event affecting all users / multiple clients.

**Examples**:
- Production app fully down (>5 min)
- Data leak / breach (any PII exposed)
- Active security exploit (account takeover, prompt injection causing destructive action)
- Cost runaway (>$500/hour API spend, indicating compromise or bug)
- Subprocessor outage (Anthropic API down) impacting all active client products

**Response**:
- Pager: CTO + CEO + COO immediately (auto-page, no waiting)
- Status page update: ≤ 15 min from confirm
- Client comms: ≤ 30 min (per affected client) for active deployments
- IC (Incident Commander): CTO default, escalate to CEO if business decision needed
- Resolution SLA: best-effort but treat as #1 priority — pause all other work
- Postmortem: ≤ 7 days, blameless, published internally

### Sev 1 — High (page during business hours, alert after-hours)

**Definition**: Significant degradation affecting one client OR partial outage affecting multiple users.

**Examples**:
- One client product down or severely degraded (>50% error rate)
- Eval regression > 1.0 detected in production
- Approval gate broken (human can't approve, system blocked)
- Drift detected, harness/manifest mismatch
- Sensitive data near-miss (e.g., PII briefly logged, contained quickly)

**Response**:
- Pager (business hours): R-SRE on-call + CTO
- After-hours: alert to channel, page if not acknowledged in 30 min
- Status page: ≤ 1h
- Client comms: per DPA / SOW SLA terms
- IC: R-SRE / CTO
- Resolution SLA: per agreed SLA (typically 4-8h business hours)
- Postmortem: ≤ 7 days, blameless

### Sev 2 — Medium (next business day)

**Definition**: Bug or degradation with workaround, single feature impact.

**Examples**:
- One feature in client product not working (others fine)
- Cost overrun on single project (>2× cap, no immediate stop)
- Eval score below threshold but >5.0 (degraded, not broken)
- Knowledge node citation broken (not blocking active project)
- Vendor pricing change requiring review (not immediate impact)

**Response**:
- No paging — Slack channel + ticket
- Triage next business morning
- IC: R-SRE / project lead
- Resolution SLA: 2-5 business days
- Postmortem: optional unless pattern across 3+ Sev-2 same root cause

### Sev 3 — Low (queued backlog)

**Definition**: Minor issues, cosmetic, no service impact.

**Examples**:
- Documentation inaccuracy
- Slow response (within SLA but at upper end)
- Minor UI glitch
- Stale memory entry not yet reviewed (within hygiene cadence)

**Response**:
- Ticket only
- Resolved during normal sprint planning
- No postmortem unless pattern

---

## Sev Classification Rubric (decision tree)

```
1. Is service totally down OR data breached?         → Sev 0
2. Is one client / multiple users impacted with major degradation?  → Sev 1
3. Is one feature broken with workaround available?  → Sev 2
4. Cosmetic / minor / no impact?                     → Sev 3
```

If unsure between two levels → escalate UP. Better to over-respond once than miss critical.

---

## Sev Override

R-SRE may downgrade only after CTO sign — never silent downgrade.
R-SRE may upgrade unilaterally — always allowed.

---

## Postmortem Required

| Severity | Postmortem |
|---|---|
| Sev 0 | ALWAYS, ≤ 7 days, published internally + (if client-impacting) DPA-mandated client notice |
| Sev 1 | ALWAYS, ≤ 7 days, internal |
| Sev 2 | If pattern across 3+ same root cause, OR client requests |
| Sev 3 | Optional |

Template: `_shared/templates/postmortem-template.md`.

---

## Cross-References

- W05 incident response: [`@../../experience/workspace/docs/workflows/W05-incident-response.md`](../../experience/workspace/docs/workflows/W05-incident-response.md)
- R-SRE: [`@../.agents/tier-2-engineering/R-SRE-site-reliability.md`](../.agents/tier-2-engineering/R-SRE-site-reliability.md)
- Postmortem template: [`@../templates/postmortem-template.md`](../templates/postmortem-template.md)
- Master rules (escalation): [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-03

---
*v1.0 — Adopted 2026-04-27.*
