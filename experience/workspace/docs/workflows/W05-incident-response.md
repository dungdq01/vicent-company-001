# W05 — Incident Response

> **Khi nào chạy**: Bất cứ lúc nào có sự cố Sev 0/1/2 (prod down, data leak, client escalation, agent rogue, cost runaway) · **Người chạy**: On-call trực + escalation chain · **Input**: Trigger (alert, client email, eval anomaly) · **Output**: Resolved incident + postmortem + action items · **Thời gian**: Sev 0: phản hồi <15' · Sev 1: <1h · Sev 2: <4h

---

## 0. Scope

File này áp dụng cho **mọi loại sự cố vượt ngưỡng daily-ops**:

- **Production**: service down, degraded, data corruption
- **Security**: leak, breach, prompt injection exploit, auth bypass
- **Client**: escalation, legal notice, public complaint, NPS crash
- **Financial**: cost runaway, invoice dispute, overdue > 30d
- **Agent rogue**: agent output harmful/biased/non-compliant, eval mass-fail
- **People**: founder sick, key agent frozen, legal issue

Không áp dụng: daily blockers (xử lý trong W01), scope changes (SCR), routine bugs (dev sprint).

---

## 1. Severity Levels

### Sev 0 — CRITICAL (response < 15')

- Prod service down ảnh hưởng **đang trả tiền** paying customer
- Data breach / PII leak confirmed
- Legal notice (subpoena, cease-and-desist, regulator)
- Founder medical emergency
- Studio financial fraud phát hiện

**Action**: drop everything. Full team scrambled. Business hours irrelevant.

### Sev 1 — HIGH (response < 1h working hours, next morning off-hours)

- Prod degraded (slow but functional)
- Security vulnerability confirmed nhưng chưa exploit
- Client threatening cancel hoặc public complaint
- LLM cost runaway (>2× daily cap đã burn)
- Agent mass-fail (≥ 3 agent cùng lúc eval < 5.0)
- 1 agent output gây harm (biased, dangerous advice) đã committed vào deliverable

**Action**: pause non-essential work, triage trong 1h, fix trong 24h.

### Sev 2 — MEDIUM (response < 4h working hours)

- 1 agent eval fail pattern lặp lại 3 lần cùng skill
- Client escalation (professional, not threatening)
- Invoice dispute < $1K
- Prompt injection attempt detected nhưng không breach
- Tool/vendor outage partial (có workaround)

**Action**: vào weekly retro, không break deep-work nhưng assign trong ngày.

### Sev 3 — LOW (xử lý trong weekly cadence)

- Minor bug, UI glitch, typo in deliverable đã sent
- 1 bad eval score cá biệt
- Slack alert noise cần tune

**Action**: ticket thường, không dùng file này.

---

## 2. Detection Sources

| Source | Sev thường | Trigger |
|---|---|---|
| Monitoring alert (prod) | 0–1 | pager/slack bot |
| Security scanner | 1–2 | daily scan report |
| Client email/Slack | 0–2 | manual read |
| Eval dashboard anomaly | 1–2 | auto-flag score < threshold |
| Cost dashboard | 1 | burn > 2× cap |
| Agent output review | 1–2 | human review flag |
| Internal review/audit | 2–3 | weekly retro surface |

**On-call** chịu trách nhiệm monitor mọi kênh trên trong ca trực.

---

## 3. Roles during incident

- **Incident Commander (IC)**: 1 người, quyền quyết định cao nhất trong incident. Default = CEO nếu Sev 0, CTO nếu tech, COO nếu business. IC rotate theo trigger.
- **Ops lead**: người thực thi fix (có thể = IC với studio 3 người).
- **Comms lead**: người nói chuyện với client/public. Default = CEO.
- **Scribe**: log mọi action + timestamp vào `incidents/INC-{YYYYMMDD}-{NNN}/timeline.md`.

Với 3 founder, thường 1 người kiêm IC + Ops, 1 người comms + scribe, 1 người buffer cho work không dừng được.

---

## 4. Sev 0 — 15-Minute Break-Glass

### T+0 — DETECT

1. First responder nhận alert → xác nhận thực (không false alarm).
2. Post 1 dòng vào `#incidents`:  
   `🚨 SEV-0 {what} at {timestamp}, IC={name}, paging {names}.`
3. Gọi page các founder còn lại qua phone (không Slack — có thể bỏ qua).

### T+5 — ASSEMBLE

4. IC declare trên call/conf.
5. Create incident folder:
   ```
   incidents/INC-{YYYYMMDD}-{NNN}/
   ├── timeline.md       ← scribe writes realtime
   ├── comms-log.md      ← every outgoing message
   └── artifacts/        ← logs, screenshots, prompts
   ```
6. Scribe starts timeline: header + T+0 entry.

### T+10 — STABILIZE (priority: stop the bleeding)

7. Actions per incident type:
   - **Prod down**: revert deploy / failover / kill-switch
   - **Data leak**: rotate credentials, revoke access, enable audit logs
   - **Legal**: do not delete anything, preserve all, call lawyer
   - **Cost runaway**: kill all LLM jobs, disable orchestrator auto-dispatch
   - **Agent rogue**: freeze skill card (`_shared/.agents/...`), pull all pending outputs, block merges
8. Log every action with T+ timestamp in `timeline.md`.

### T+15 — COMMUNICATE

9. Comms lead drafts client message (nếu client-facing):
   - Ack the issue
   - Scope of impact
   - ETA for update (not fix, just update)
   - Apology (không admit liability chi tiết)
10. CEO approves before send. Log vào `comms-log.md`.
11. Internal: update `#studio-ops` every 15' cho đến khi resolved.

### T+? — FIX & VERIFY

12. Apply root-cause fix khi đã xác định (có thể sau nhiều giờ).
13. Verify fix in staging trước khi prod.
14. Monitor 1 giờ post-fix trước khi declare resolved.

### T+? — RESOLVE

15. Declare incident resolved trong `#incidents`.
16. Send follow-up comms to client.
17. Schedule **blameless postmortem** trong 72h (§7).

---

## 5. Sev 1 — 1-Hour Response

Rút gọn §4:

1. **T+0–15'**: detect, declare, open `INC-*` folder, start timeline.
2. **T+15–30'**: stabilize (same playbook by type).
3. **T+30–60'**: comms if client-facing + root-cause investigation.
4. **Fix trong 24h** (không phải ngay).
5. Postmortem trong 1 tuần (vào Fri retro OK).

Không cần phone page; Slack + email đủ.

---

## 6. Sev 2 — 4-Hour Response

Rút gọn hơn:

1. Log vào `incidents/INC-*` nhẹ (timeline + brief).
2. Assign 1 owner trong 4h.
3. Fix trong 1 tuần.
4. Retro lite trong Fri weekly (W02).

---

## 7. Postmortem (Sev 0/1 bắt buộc · Sev 2 optional)

**File**: `incidents/INC-*/postmortem.md`. Template dưới.

**Timing**: Sev 0 trong 72h; Sev 1 trong 1 tuần.

### Postmortem template

```markdown
# Postmortem — INC-{YYYYMMDD}-{NNN}

## Meta
- Severity: Sev {0/1/2}
- Detected: {ISO}
- Resolved: {ISO}
- Duration: {hh:mm}
- IC: {name}
- Scribe: {name}
- Impact: {users affected, revenue, reputation}

## Summary (≤ 5 câu)
{Plain-language: what happened, impact, how resolved}

## Timeline
{copy from timeline.md, cleaned up, T+ format}
- T+0: ...
- T+5: ...
- T+resolved: ...

## Root cause
### What actually caused this
{the technical / process / human root — 1 cause, not a list}

### 5 Whys
1. Why X? — because Y
2. Why Y? — because Z
3. ...

## What went well
- ...

## What went poorly
- ...

## Where we got lucky
- ... (near-misses that didn't happen thanks to luck, not process)

## Action items (SMART)
| ID | Action | Owner | Due | Category |
|---|---|---|---|---|
| AI-1 | ... | ... | ... | prevent |
| AI-2 | ... | ... | ... | detect |
| AI-3 | ... | ... | ... | mitigate |

## Rule/process changes
- [ ] Update `_shared/rules/*.md` §...
- [ ] Update `_shared/.agents/{agent}.md` ...
- [ ] Update this workflow (W05) §...
- [ ] Update monitoring/alerting

## Memory promotion
- Baseline memory: {path updates}
- Failure mode added: `_shared/eval/failure-modes.md` §...

## Attended postmortem
- [ ] CEO [ ] COO [ ] CTO [ ] others

## Sign-off
- IC: __________ Date: ______
- CEO: __________ Date: ______
```

### Blameless rule

- Focus on **system** not individuals.
- Language: *"Step X failed because information Y was not available"*, not *"{Name} forgot"*.
- Nếu postmortem bất kỳ dùng tên người làm attribution lỗi → facilitator dừng ngay.

---

## 8. Incident-Type Playbooks

### 8.1 Prod down

1. Check health endpoint + monitoring dashboard
2. Last deploy trong 2h? → revert
3. Not deploy-related? → check vendor status (hosting, DB, LLM API)
4. Vendor down? → failover hoặc post maintenance page
5. Own code? → hotfix, deploy via emergency pipeline (CI skip non-critical tests)

### 8.2 Security (data leak / auth bypass)

1. **Không delete logs** — forensics cần.
2. Rotate ALL credentials touch system đó (API keys, DB passwords, OAuth tokens).
3. Revoke active sessions nếu có.
4. Enable audit logging verbose nếu chưa.
5. Notify client trong 24h (hoặc shorter per regulation — GDPR 72h).
6. Engage legal counsel nếu PII/PHI involved.
7. External: consider public disclosure per policy.
8. Run full security audit trong 2 tuần.

### 8.3 Cost runaway (LLM or infra)

1. **Kill switch**: disable orchestrator auto-dispatch (env var `ORCH_PAUSE=1`).
2. Cancel active LLM jobs via API (if supported).
3. Check `_state.json.cost_burn` mọi project → find which consumed.
4. Identify root: runaway loop, prompt injection, wrong model selected, cap mis-set.
5. Fix root + re-enable with stricter per-call cap.
6. Bill review: nếu client project → SCR nếu cần adjust, hoặc absorb nếu bug ta.

### 8.4 Agent rogue (harmful/biased output)

1. **Pull** all pending outputs của agent đó — block merges.
2. Check `_state.json.deliverables_index[]` — output nào của agent đó đã approved+committed? Review manually.
3. Freeze skill card: add `status: frozen` vào `_shared/.agents/{agent}.md` header.
4. Write ADR về freeze reason.
5. Prompt revision → test on golden set → eval pass ≥ 8.5 (siết hơn bình thường) trước khi unfreeze.
6. Nếu output đã ship đến client → comms lead notify, retract, replace.

### 8.5 Client escalation

1. CEO nhận handoff từ người detect (KHÔNG để non-CEO trả lời escalation).
2. CEO call trong 24h (Sev 1) hoặc ngay (Sev 0).
3. Listen > speak (rule 2:1 minimum).
4. Never admit liability ngay trên call; say "we'll investigate and revert trong X".
5. Internal: triage xem là lỗi ta hay client, scope creep hay legit bug.
6. Follow-up email trong 24h với plan.
7. Nếu go legal → lawyer first, then respond.

### 8.6 Founder incapacitated

1. Remaining founders cover critical paths per roster `business-strategy/15`.
2. 1 founder khác tạm thời kiêm role.
3. On-call chuyển 100% sang người khỏe.
4. Tạm dừng new work commitment (không intake mới).
5. Nếu > 7 ngày → client notification + descope / pause SOW.

---

## 9. Comms Templates

### 9.1 Client Sev 0 first message (within 15')

```
Subject: Issue affecting {service} — [INC-{id}]

Hi {client},

We detected an issue affecting {service} at {time}. Current impact: {scope}. 
We're actively working on it. Next update by {time + 30min}.

{IC name}, Incident Commander
```

### 9.2 Client update (every 30' until resolved)

```
Update [INC-{id}] — {time}

Status: {investigating / mitigating / verifying}
What we know: {1–2 sentences}
Impact now: {scope}
Next update: {time}
```

### 9.3 Client resolved

```
Resolved [INC-{id}] — {time}

Issue resolved at {time}. Impact duration: {hh:mm}.
Brief cause: {plain-language, avoid blame others}
Full postmortem: attached in 72h.
We sincerely apologize for the disruption.

{CEO name}
```

---

## 10. Pre-incident Preparation (xong trong W06 Day 0–30)

- [ ] Monitoring dashboard live cho: uptime, latency, error rate, LLM cost, eval pass rate
- [ ] Pager / phone number từng founder ghi trong `business-strategy/15`
- [ ] Slack `#incidents` + `#studio-ops` channel tồn tại
- [ ] On-call rotation defined
- [ ] Template files (`timeline.md`, `postmortem.md`) trong `_shared/templates/`
- [ ] Emergency contacts list: lawyer, hosting vendor, payment processor, insurance
- [ ] Backup credentials stored offline (1Password emergency kit)
- [ ] Runbook test: quarterly "game day" — simulate Sev 1 để test response

---

## 11. Metrics (track, review quarterly)

| Metric | Target | Source |
|---|---|---|
| Mean time to detect (MTTD) | < 15' for Sev 0 | monitoring logs |
| Mean time to respond (MTTR) | < 15' Sev 0, < 1h Sev 1 | timeline |
| Mean time to resolve | < 4h Sev 0, < 24h Sev 1 | timeline |
| Postmortem on-time rate | 100% Sev 0/1 | audit |
| Action item close rate | ≥ 80% within due | audit |
| Repeat incidents (same root cause) | 0 | postmortems |

---

## 12. What Incident Response is NOT

- Không phải blame session
- Không thay thế cho daily W01 blockers
- Không ticket system tổng quát — chỉ dành cho **sự cố vượt ngưỡng**
- Không dùng để escalate personal disagreement giữa founders (đi qua W02 retro)

---

## 13. Cross-References

- Security rules: `@../../../../_shared/rules/60-security-rules.md`
- Quality rules (eval gates): `@../../../../_shared/rules/70-quality-rules.md`
- Communication rules (crisis): `@../../../../_shared/rules/50-communication-rules.md` §crisis
- Ops roster / on-call: `@../../../../business-strategy/15-business-operations.md`
- Cost caps: `@../../../../_shared/standards/cost-budgets.md`
- Failure modes catalog: `@../../../../_shared/eval/failure-modes.md`
- Daily ops: [`W01-daily-operating-rhythm.md`](W01-daily-operating-rhythm.md) §12
- Weekly retro: [`W02-weekly-cadence.md`](W02-weekly-cadence.md)

---

*Last updated: 2026-04-26 · v1.0*
