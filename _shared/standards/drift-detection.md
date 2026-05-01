---
file: drift-detection
version: v1.0
last_updated: 2026-04-28
owner: R-LLMOps + CTO
status: production
---

# Drift Detection — Operational Thresholds

> R-QAL-08 spec'd strategic-level drift (7-day rolling, > 0.5 alert). File này = **concrete operational thresholds**: sample size, cadence, alert routing, auto-pause action.
>
> Closes Tier A #3 from harness audit 2026-04-28.

---

## 1. Why drift detection critical

LLM providers (Anthropic, OpenAI, Google) silently update model behaviors:
- Quality may shift ±10% overnight without notice
- Skill cards unchanged + golden sets unchanged → drift undetected
- Mid-engagement = client outputs ship with degraded quality
- 3-5 outputs ship before human notices = **trust damage**

→ Need active surveillance, not reactive.

---

## 2. Three drift signals (concurrent monitoring)

### Signal A — Eval score drift on golden sets

```yaml
golden_set_drift_check:
  cadence: daily 00:30 UTC (after Anthropic typical update window)
  sample_per_agent: 5 cases (random from agent's golden set)
  agents_in_scope:
    - R-α (forecasting/research foundation)
    - R-σ (consolidation gatekeeper)
    - R-eval (judge — extra critical, see Gap #9)
    - top-3 most-invoked agents this quarter
  
  metric: weighted aggregate eval score per agent
  baseline: trailing 30-day mean for that agent
  
  thresholds:
    yellow: drop ≥ 0.3 vs baseline
    red: drop ≥ 0.5 vs baseline
    critical: drop ≥ 1.0 vs baseline
```

### Signal B — Production output anomaly

```yaml
production_anomaly_check:
  cadence: real-time on each dispatch
  metric: output eval score vs trailing 7-day mean for that (agent, phase)
  
  thresholds:
    yellow: single output drop ≥ 0.5 vs trailing mean
    red: 3 consecutive outputs drop ≥ 0.5 (= sustained signal, not noise)
```

### Signal C — Cache hit rate drop

```yaml
cache_drift_check:
  cadence: weekly digest by R-LLMOps
  metric: cache hit rate trend (per R-HRN-10 ≥ 70% target)
  
  thresholds:
    yellow: cache hit rate < 60% rolling 7-day
    red: cache hit rate < 50% rolling 7-day
  
  note: cache drift may indicate prompt structure pollution OR Anthropic cache mechanic change
```

---

## 3. Alert routing

```yaml
alert_routing:
  yellow:
    channel: Slack/Discord #studio-ops
    notify: R-LLMOps + CTO
    SLA_response: 24h business hours
    action: investigate, log to drift-log.md, no auto-pause
  
  red:
    channel: Slack/Discord #incidents + ping CTO
    notify: CTO + COO
    SLA_response: 4h business hours
    action: investigate root cause, may auto-pause new dispatches
    side-effect: dispatch-log entry with drift flag
  
  critical (drop ≥ 1.0):
    channel: pager (CTO + CEO immediately)
    SLA_response: 30 minutes
    action: AUTO-PAUSE all new dispatches OF AFFECTED AGENT
    require: human override before resume
    side-effect: Sev-1 incident per incident-severity.md
    customer impact: notify active client engagements per DPA SLA terms
```

---

## 4. Auto-pause mechanic

When critical threshold hit:

```python
# Engine logic (when implemented)
def on_drift_critical(agent_id, severity):
    # 1. Set agent to "paused" in TEAM-CONFIG
    set_agent_status(agent_id, "paused-drift")
    
    # 2. Block new dispatches OF THIS AGENT
    # (other agents continue normal)
    
    # 3. Active runs of this agent: complete current turn, halt next
    
    # 4. Page CTO + announce in #incidents
    page(["CTO", "CEO"], severity="critical")
    
    # 5. Open Sev-1 incident automatically
    create_incident(agent=agent_id, kind="drift", severity=1)
    
    # 6. Resume requires:
    #    - CTO sign that root cause identified
    #    - 5 fresh golden runs pass
    #    - ADR documenting drift incident + mitigation
```

---

## 5. Investigation playbook

When drift detected:

| Step | Action | Owner | Time |
|---|---|---|---|
| 1 | Verify drift signal not noise (re-run 5 more samples) | R-LLMOps | 15 min |
| 2 | Compare current model version vs trailing 30-day | R-LLMOps | 5 min |
| 3 | Check Anthropic status page + changelog | R-LLMOps | 5 min |
| 4 | Diff agent skill card v vs production v (in case bug self-introduced) | R-LLMOps | 10 min |
| 5 | Test alternative model (if Sonnet drift → try Opus) | CTO | 30 min |
| 6 | If confirmed external drift → ADR + temporary fallback model OR roll back skill v | CTO | 1h |
| 7 | If skill card cause → revert skill v + retest | CTO | 30 min |
| 8 | Resume after sign | CTO | — |

---

## 6. Drift log

`_shared/eval/drift-log.md` (append-only):

```markdown
## YYYY-MM-DD · {agent_id} · {severity}

**Signal**: {A/B/C} · {threshold breach detail}
**Investigation**: {root cause finding}
**Mitigation**: {model swap / skill rollback / wait + retry}
**Resolution time**: {hours}
**Customer impact**: {none / N clients notified}
**Cross-ref**: incident ID, ADR ID

**Pattern**: {transferable lesson — what to add to drift-detection.md}
```

Promote pattern to W08 framework retro if recurs.

---

## 7. Cross-References

- Strategic drift rule: [`@../rules/70-quality-rules.md`](../rules/70-quality-rules.md) §R-QAL-08
- Harness drift checkpoint: [`@../rules/80-harness-rules.md`](../rules/80-harness-rules.md) §R-HRN-07
- R-LLMOps card: [`@../.agents/tier-2-engineering/R-LLMOps-llm-operations.md`](../.agents/tier-2-engineering/R-LLMOps-llm-operations.md)
- R-eval card: [`@../.agents/tier-1-research/R-eval-judge.md`](../.agents/tier-1-research/R-eval-judge.md)
- Incident severity: [`@./incident-severity.md`](incident-severity.md)
- External deps: [`@./external-dependencies.md`](external-dependencies.md)
- Vendor watch (Anthropic): [`@./external-dependencies.md`](external-dependencies.md) §1

---
*v1.0 — 2026-04-28. Tier A #3 fix from harness audit.*
