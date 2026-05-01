---
file: sla-defaults
version: v1.0
last_updated: 2026-04-27
owner: COO + R-SRE
status: production
---

# SLA Defaults — Per Harness Profile

> Closes lỗ hổng #20 (no SLA in SOW). Default SLAs per profile L0/L1/L2 — used in SOW template + DPA + R-SRE monitoring.
>
> Defaults can be tightened per project (client pays more) but NOT loosened without ADR.

---

## SLA Matrix

| Metric | L0 Sandbox | L1 Standard | L2 Critical |
|---|---|---|---|
| **Uptime** | best-effort | 99% (≤7.2h downtime/month) | 99.5% (≤3.6h downtime/month) |
| **TTFR (time to first response)** | n/a | p50 < 60s · p95 < 5min | p50 < 30s · p95 < 2min |
| **Availability of human approval** | n/a | business hours (M-F 9-18 ICT) | 24/7 with on-call rotation |
| **Sev 0 ack** | n/a | best-effort | ≤ 15 min |
| **Sev 0 mitigation** | n/a | ≤ 4h | ≤ 1h |
| **Sev 1 ack** | n/a | ≤ 1h business hours | ≤ 30min |
| **Sev 1 mitigation** | n/a | ≤ 8h business hours | ≤ 4h |
| **Sev 2 resolution** | n/a | ≤ 5 business days | ≤ 3 business days |
| **Data subject right request** | n/a | 7 days | 5 days |
| **Postmortem (Sev 0/1)** | n/a | ≤ 7 days | ≤ 5 days |
| **Backup cadence** | n/a | daily | hourly |
| **DR (Disaster Recovery) RTO** | n/a | 24h | 4h |
| **DR RPO (data loss)** | n/a | 24h | 1h |
| **Support response (general)** | n/a | next business day | within 4 business hours |

---

## SLA in SOW Template

`02-sow.md` MUST include SLA section. Recommended language:

```markdown
## Service Level Agreement (SLA)

This engagement is **Harness Profile L{X}** — {profile name}.

| Metric | Commitment |
|---|---|
| Uptime | {{value}} |
| TTFR | {{p50/p95}} |
| Sev 0 mitigation | {{value}} |
| Sev 1 mitigation | {{value}} |
| Postmortem | {{value}} |
| Support response | {{value}} |

Excluded from uptime calc: scheduled maintenance (≤4h/month, 72h notice), force majeure, vendor outage (Anthropic, Telegram, etc.) beyond Studio control.

SLA breach remedy: per main SOW terms (typically service credit, NOT direct refund unless gross negligence).
```

Tighter SLA = upcharge. Looser SLA = ADR + client written acknowledgment.

---

## Monitoring + Reporting

R-SRE owns monitoring per SLA. Monthly client report includes:
- Uptime % (computed)
- Sev 0/1 incident count + MTTR
- TTFR p50/p95 actual
- SLA breaches (if any) + service credit if applicable

Report format: `projects/{id}/cs/sla-report-{YYYY-MM}.md`.

---

## SLA Disputes

If client claims breach:
1. R-SRE provides trace + monitoring data within 3 business days
2. COO + client review jointly
3. If breach confirmed: service credit per SOW (typically 5-25% of monthly fee)
4. If breach disputed: arbitration per main SOW terms

---

## Cross-References

- Harness profile: [`@../rules/80-harness-rules.md`](../rules/80-harness-rules.md) §R-HRN-01
- Incident severity: [`@./incident-severity.md`](incident-severity.md)
- R-SRE: [`@../.agents/tier-2-engineering/R-SRE-site-reliability.md`](../.agents/tier-2-engineering/R-SRE-site-reliability.md)
- SOW template: [`@../templates/project/02-sow.md`](../templates/project/02-sow.md)
- DPA template: [`@../templates/legal/DPA-template.md`](../templates/legal/DPA-template.md)

---
*v1.0 — Adopted 2026-04-27. Closes lỗ hổng #20.*
