# E0 — Health Check

> Per P10.1 (Day-60 post-delivery) OR retainer monthly. **Classify client health → trigger E1 if 🟢, CS3 if 🔴, monitor if 🟡**.

**Owner**: R-CS.
**Cadence**: Day-60 once + monthly for retainer clients.
**Cost target**: $0.05-0.10 per check.

---

## Trigger

Auto-cron OR manual:
- T+60 days after P9 close (mandatory)
- Monthly for retainer clients (1st Monday)
- Ad-hoc when usage anomaly detected

---

## Activities

| Step | Action | Owner |
|---|---|---|
| E0.1 | Pull NPS survey (Notion form, last sent Day-60) | R-CS automated |
| E0.2 | Pull usage data (R-SRE health summary if production deploy) | R-CS |
| E0.3 | Pull comms log (Discord/email last 30 days) | R-CS |
| E0.4 | Compute health score (rubric §below) | R-CS |
| E0.5 | Classify 🟢/🟡/🔴 + flag signals | R-CS |
| E0.6 | If 🟢 + signal → trigger E1 | R-CS → R-AM |
| E0.7 | If 🔴 → trigger CS3 churn save (defensive) | R-CS → COO |
| E0.8 | If 🟡 → re-engagement plan | R-CS |

---

## Health rubric

```yaml
health_score:
  nps: 0-10                          # NPS survey result
  usage:                             # if production deploy
    active_users_pct_baseline: 0-1   # vs baseline at delivery
    error_rate_trend: -1 to 1        # negative = improving
  engagement:
    response_time_to_studio_msg_hours: int
    last_proactive_outreach_days_ago: int
  business_signal:
    expansion_hint_count: int        # client mentioned new pain / new use case
    referral_attempt: bool           # client referred someone

classification:
  green: nps >= 8 AND usage_active >= 0.7 AND expansion_hint >= 1
  yellow: nps 6-7 OR usage 0.4-0.7 OR no expansion signals but no churn signals
  red: nps < 6 OR usage < 0.4 OR no response > 14 days OR explicit dissatisfaction
```

---

<!-- @outputs -->
## Outputs

```
projects/{id}/cs/E0-health-{YYYY-MM}.md
```

Content:
```markdown
## Health Check {{YYYY-MM}} · {{client-id}}

**Classification**: 🟢 Green | 🟡 Yellow | 🔴 Red

### Scores
- NPS: 8/10 (last submitted: 2026-04-15)
- Usage: 78% baseline (production deploy)
- Engagement: response time 4h avg, last outreach 12 days ago
- Expansion signals: 2 mentioned ("could AI help with X?", "we're hiring more...")

### Decision
→ E1 trigger: yes (green + expansion hints)
→ Owner E1: R-AM (handoff Date: 2026-04-30)

### Watch-outs
- COO availability dropped vs baseline — verify still primary contact
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **NPS survey not sent** → R-CS Day-60 cron broken; alert
- **Usage data missing** (no production deploy) → use proxy: communication frequency
- **🟢 classification error** (false positive) → R-AM in E1 catches; re-classify; retro
- **Lost retainer client surface only at E0** (should be earlier signal) → strengthen weekly monitoring
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| Profile inheritance from main project | R-HRN-01 |
| PII handling (NPS responses may contain PII) | R-HRN-04 + pii-redaction |
| Cost cap E0 cron monthly all retainer clients | R-MAS-07 |
<!-- /@harness-checkpoint -->

---

## Cross-References

- P10.1 Day-60 spec: [`@../../pipeline/P10-LONG-TERM.md`](../../pipeline/P10-LONG-TERM.md)
- CS3 churn save (when 🔴): [`@../customer-success/CS3-RENEW-OR-CHURN.md`](../customer-success/CS3-RENEW-OR-CHURN.md)
- E1 next phase: [`@./E1-OPPORTUNITY-SCAN.md`](E1-OPPORTUNITY-SCAN.md)

---
*v1.0 — 2026-04-27.*
