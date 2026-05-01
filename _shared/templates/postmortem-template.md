# Postmortem — {{INCIDENT_TITLE}}

> Blameless. Action-oriented. 5-why down to system cause.
> Spec: `_shared/standards/incident-severity.md` + W05.

---

## Metadata

| Field | Value |
|---|---|
| Incident ID | INC-{{YYYYMMDD}}-{{NNN}} |
| Severity | Sev {{0\|1\|2\|3}} |
| Detected at | {{ISO 8601}} |
| Resolved at | {{ISO 8601}} |
| Duration | {{e.g., 2h 14min}} |
| IC | {{name}} |
| Author | {{name}} |
| Affected client(s) | {{list or "internal-only"}} |
| Affected service(s) | {{list}} |
| Distribution | {{internal\|client\|public}} |

---

## TL;DR (3 sentences max)

What happened, what was affected, what was done.

---

## Timeline

| Time (UTC) | Event |
|---|---|
| HH:MM | First signal (e.g., alert fired) |
| HH:MM | First responder acknowledged |
| HH:MM | Incident declared Sev {{N}} |
| HH:MM | First mitigation attempted |
| HH:MM | Mitigation effective |
| HH:MM | Service restored |
| HH:MM | Incident closed |
| HH:MM | Postmortem started |

---

## Impact

| Dimension | Impact |
|---|---|
| Users affected | {{count or %}} |
| Duration | {{e.g., 2h 14min}} |
| Data integrity | {{impacted\|intact}} |
| Data exposed | {{yes/no — if yes, breach notification triggered}} |
| Cost | {{$ — extra API spend, refund obligations}} |
| Trust / reputation | {{qualitative}} |
| SLA breach | {{yes/no — quantify}} |

---

## Root Cause Analysis (5-why)

**1. Why did the symptom occur?**
{{e.g., "Bot stopped replying to user messages."}}

**2. Why?**
{{e.g., "Anthropic API returned 429 rate limit, code didn't retry."}}

**3. Why?**
{{e.g., "Retry policy was disabled in this code path due to earlier debug session."}}

**4. Why?**
{{e.g., "Disable was committed without ADR + no test caught it."}}

**5. Why? (system-level)**
{{e.g., "PR review checklist didn't include 'verify retry policy intact for production paths'."}}

→ **System cause**: {{e.g., "PR review process gap, not individual mistake."}}

---

## Detection

| Question | Answer |
|---|---|
| How was it detected? | {{e.g., "User complaint via Telegram"}} |
| Should have been detected by what? | {{e.g., "R-SRE alert on error rate spike"}} |
| Why wasn't it? | {{e.g., "Alert threshold too lenient"}} |
| Time to detect from cause | {{minutes}} |

---

## Response

| Question | Answer |
|---|---|
| What worked well? | bullet |
| What didn't work? | bullet |
| Where did time get lost? | bullet |
| Communication clarity? | bullet |

---

## Action Items

| # | Action | Owner | ETA | Type | ADR? |
|---|---|---|---|---|---|
| 1 | {{e.g., "Re-enable retry policy + add test"}} | R-BE | 2026-XX-XX | code-fix | no |
| 2 | {{e.g., "Add 'retry policy intact' to PR checklist"}} | CTO | 2026-XX-XX | process | yes ADR-XXXX |
| 3 | {{e.g., "Lower alert threshold + simulate"}} | R-SRE | 2026-XX-XX | obs | no |
| 4 | {{e.g., "Add to harness/permanent-fixes.md if pattern"}} | R-SRE | 2026-XX-XX | rule | maybe |

Each action MUST have:
- Owner (named individual or agent)
- ETA (date)
- Type (code-fix / process / obs / rule)
- ADR if structural change

---

## Permanent-Fix Candidate

If root cause is a pattern likely to recur:
- ☐ Add to project's `harness/permanent-fixes.md` (R-HRN-06)
- ☐ Promote to `_shared/rules/` if recurs across 3+ projects
- ☐ Add to `_shared/rules/_unlearn-list.md` if revealed harmful past pattern

Cross-ref: ADR-XXXX (if rule change).

---

## Lessons (transferable)

What anyone (future agent, future engineer, future client) should learn:
- bullet
- bullet

NOT: "we made mistake X" (specific, blame-tinged).
YES: "in similar situation, watch for Y; verify Z first." (transferable, system).

---

## Distribution

- ☐ Internal (#incidents Slack)
- ☐ All hands review (Friday retro per W02)
- ☐ Affected client(s) — if Sev 0/1, per DPA + W05 client comms
- ☐ Public status page update — if external visibility
- ☐ ADR drafted for any structural change

---

## Cross-References

- Severity classification: [`@../standards/incident-severity.md`](../standards/incident-severity.md)
- W05 incident response: [`@../../experience/workspace/docs/workflows/W05-incident-response.md`](../../experience/workspace/docs/workflows/W05-incident-response.md)
- R-SRE: [`@../.agents/tier-2-engineering/R-SRE-site-reliability.md`](../.agents/tier-2-engineering/R-SRE-site-reliability.md)
- Failure mode catalogue: [`@../eval/failure-modes.md`](../eval/failure-modes.md)
- Permanent-fix loop: [`@../rules/80-harness-rules.md`](../rules/80-harness-rules.md) §R-HRN-06

---
*Template v1.0 — 2026-04-27. Customize per incident.*
