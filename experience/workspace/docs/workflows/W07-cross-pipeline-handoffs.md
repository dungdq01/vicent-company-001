# W07 — Cross-Pipeline Handoffs

> **Khi nào chạy**: Mỗi lúc 1 pipeline giao việc sang pipeline khác (Sales → Delivery, Delivery → CS, CS → Finance, etc.) · **Người chạy**: Outgoing owner + incoming owner · **Input**: Completed pipeline phase + handoff doc · **Output**: Incoming pipeline started, context fully transferred, no dropped ball · **Thời gian**: 15–60' mỗi handoff

---

## 0. Why Handoffs Matter

Trong studio 3 người + Agentic team, **phần lớn sự cố xảy ra ở rìa giữa các pipeline**, không phải trong từng pipeline. Ví dụ:

- Sales hứa client feature X → Delivery không biết → client thất vọng
- Delivery ship bug → CS không được brief → không handle ticket đúng
- CS renew conversation → Finance không update term → invoice sai
- Dispatch nhiều project parallel → cost-pool của một pipeline "ăn" pipeline khác

File này quy định **HĐ handoff tối thiểu** cho 7 transition phổ biến.

---

## 1. Handoff Map — 7 transitions chính

```
S2 Discovery ───► P0 Intake              (H1: Sales→Delivery engine)
S4 Close     ───► P3 Architecture        (H2: Sales→Delivery build)
P9 Delivery  ───► S5 Handoff / CS0       (H3: Delivery→CS+Sales)
CS3 Renew    ───► S3 Proposal (reopen)   (H4: CS→Sales loop)
P9 Delivery  ───► F0 Invoice (50%)       (H5: Delivery→Finance)
C4 Repurpose ───► S0 Prospect            (H6: Content→Sales lead)
Any          ───► H1 Hiring need         (H7: All→Hiring)
```

Plus:
- `Knowledge retro → L1 memory` (H8: Delivery→Knowledge, xem W02 §5.5)
- `Retro skill insight → Skill card → L2` (H9: Delivery→Shared)

---

## 2. Handoff Principles (universal)

Áp dụng MỌI handoff bất kể loại:

1. **Document handoff in writing** — không handoff qua verbal call alone. Phải có 1 file markdown ghi lại.
2. **Incoming owner acknowledges in writing** — reply "received, will act by {date}".
3. **No orphan**: mọi handoff phải có incoming owner rõ tên. Không có → outgoing giữ cho đến khi có.
4. **Context is complete when**: incoming có thể act mà không cần hỏi outgoing lại lần 2 trong 72h đầu.
5. **Timestamp everything** — mỗi handoff có `handed_off_at`, `received_at`, `first_action_at`.
6. **State machine update** — `_state.json.lifecycle.status` + `phase_history` ghi đúng transition.
7. **Slack announcement** vào `#studio-ops` — 1 dòng mỗi handoff, audit trail.

---

## 3. H1 — Sales (S2 Discovery) → Engine (P0 Intake)

**Outgoing**: Sales lead · **Incoming**: Driver / PM · **Time**: 15–30'

### Trigger
- S2 Discovery call done (`pipelines-business/sales/S2-DISCOVERY.md` DoD met)
- Client response "interested, let's move forward" (chưa sign SOW — bước này trước close)

### Handoff file
`projects/_prospects/{slug}/HANDOFF-S2-to-P0.md`

```markdown
# H1 Handoff: S2 Discovery → P0 Intake

## Meta
- From: {sales lead name}
- To: {driver name}
- Prospect: {company}
- Date: YYYY-MM-DD
- Project ID (tentative): P-{YYYYMM}-{NNN}

## Discovery output
- Link: `projects/_prospects/{slug}/02-discovery-notes.md`
- Key problem: {1 sentence}
- Key constraint: {budget, timeline, stack}

## Anything sales committed verbally
- [ ] {feature / approach / timeline that was discussed as "we can do that"}
- ⚠️ These are commitments — must NOT be dropped in intake.

## Red flags raised
- {scope risk / client behavior}

## Suggested scope tier
- {MMO / SMB / Mid / Enterprise}
- Suggested pricing range: ${low}–${high}

## Knowledge match
- Baselines: B{XX}, B{YY}
- Industry: I{ZZ}
- Existing memory: {paths}

## Next step (incoming owner)
- [ ] Copy `_shared/templates/project/` to `projects/{id}/`
- [ ] Fill `00-intake.md` + `_meta.json`
- [ ] Dispatch T1-intake agent within 48h
- [ ] Ack this handoff in Slack
```

### Outgoing DoD
- [ ] Handoff file written + committed
- [ ] `#studio-ops` post: `H1: {prospect} from {sales} to {driver} — action 48h`
- [ ] Calendar invite: 15' context call nếu scope complex

### Incoming DoD
- [ ] Reply acknowledge in Slack within 4 working hours
- [ ] First action within 48h (intake doc started)
- [ ] Any clarifying question → raise NOW, not 5 days later

### Failure mode
Sales hứa X verbally nhưng không ghi handoff → P0 không biết → P4 design miss X → client upset at delivery → escalation.  
**Prevention**: "verbal commitments" section là **REQUIRED**, checkbox audit Fri retro.

---

## 4. H2 — Sales (S4 Close) → Engine Build (P3 Architecture)

**Outgoing**: Sales lead + CEO · **Incoming**: CTO · **Time**: 30'

### Trigger
- SOW signed + 50% deposit received (G1 gate passed)

### Handoff file
`projects/{id}/HANDOFF-S4-to-P3.md`

```markdown
# H2 Handoff: S4 Close → P3 Architecture (Build kickoff)

## Meta
- Project: {id}
- SOW signed: YYYY-MM-DD
- Deposit received: YYYY-MM-DD amount $X
- From: CEO + Sales
- To: CTO (driver)

## Final scope
- Per signed SOW: {link}
- Deliverables agreed: {list from SOW}
- Out-of-scope explicit: {list}
- Success criteria: {from PRD / SOW}

## Negotiation concessions (IMPORTANT)
- What was removed during negotiation: {list}
- What was added during negotiation: {list}
- Any pricing discount justification: {for accounting}
- Payment terms if non-standard: {NET-X, milestones, ...}

## Client stakeholders
| Name | Role | Involvement | Channel |
|---|---|---|---|
| ... | decision maker | Day 20 design review | email |
| ... | tech lead | daily | Slack |
| ... | finance | invoices | email |

## Client relationship notes
- Communication style: {formal / casual}
- Response time expectation: {hrs}
- Time zone: {TZ}
- Decision-making: {fast / committee}
- Known concerns: {stability / team skills / integration}

## Kickoff meeting
- Scheduled: {date, time, attendees}
- Agenda link: ...

## Next step (CTO)
- [ ] Approve `_meta.json` stack section
- [ ] Dispatch T2-architect by Day 13
- [ ] Schedule Day 20 design review with client
- [ ] Acknowledge in Slack
```

### Slack post
`H2: {project-id} signed + cashed, CTO owns from now. Design kickoff {date}.`

### Failure mode
Sales nhận concession "we'll include X" nhưng không document → CTO architect không X → client tại design review bảo thiếu → cần rework.  
**Prevention**: concession section required + CEO sign-off trên handoff file (không chỉ SOW).

---

## 5. H3 — Engine (P9 Delivery) → Sales (S5) + CS (CS0)

**Outgoing**: Driver · **Incoming**: Sales lead (for upsell) + CS lead (for support) · **Time**: 60'

### Trigger
- P9 acceptance signed (G2 passed)
- Final invoice trigger ready

### Handoff file
`projects/{id}/HANDOFF-P9-to-S5-CS0.md`

```markdown
# H3 Handoff: P9 Delivery → S5 + CS0

## Meta
- Project: {id}
- Delivered: YYYY-MM-DD
- Accepted by client: {name, date}
- From: Driver
- To: Sales lead + CS lead

## What was delivered
- Summary: {1 paragraph}
- Artifacts: see `09-final-package.md §deliverables`
- Live system: {URLs, credentials vault path}

## Client satisfaction
- Acceptance sentiment: {thrilled / satisfied / grudging}
- Testimonial received: [ ] yes [ ] no (if no, ask CS to obtain)
- NPS indicator: {score}

## Ongoing support
- Support SLA (per SOW): {hrs response, hrs resolution}
- Support channel: {email / Slack / ticket}
- Covered issues: {list}
- NOT covered: {list — charged separately}
- Monthly retainer: {$/mo or none}

## Expansion opportunities
- Client mentioned interest in: {phase 2 ideas}
- Technical debt to productize: {list}
- Team skills useful elsewhere in client org: {list}

## Known issues / tech debt post-ship
- {bug / limitation / workaround}

## Retro pending
- Scheduled: {date for `99-retro.md` writing session}
- Memory promotion candidates noted: {count}

## Next steps
- **CS lead**: 
  - [ ] Onboarding call scheduled within 7 days (CS0)
  - [ ] Month 1 checkin scheduled (CS1)
  - [ ] QBR 1 scheduled Day 70 post-delivery (CS2)
- **Sales lead**: 
  - [ ] Request testimonial/case study permission within 14 days
  - [ ] Referral ask at QBR (CS2)
  - [ ] Lead qualification if expansion: feed into S1 as new deal
- **Finance (see H5 also)**: final invoice trigger
```

### Slack post
`H3: {project-id} ACCEPTED 🎉 — support owned by {CS lead}, expansion by {Sales lead}. Final invoice: H5.`

---

## 6. H4 — CS (CS3 Renew) → Sales (S3 Proposal)

**Outgoing**: CS lead · **Incoming**: Sales lead · **Time**: 15'

### Trigger
- CS3 decision: client wants to renew/expand → reopen S3

### Handoff file
Append to `projects/{id}/communication-log.md` + create `projects/_prospects/{slug}-expand/HANDOFF-CS3-to-S3.md`

```markdown
# H4 Handoff: CS3 Renew → S3 Proposal (expansion)

## Meta
- Original project: {id}
- Expansion prospect ID: {new slug}
- From: CS lead
- To: Sales lead
- Date: YYYY-MM-DD

## What client wants
- {features / phase 2 / new scope}
- Budget range (from convo): ${low}–${high}
- Timeline: {by when}

## Why now
- Trigger: {QBR outcome / business event / pain reached}

## What worked in original
- {patterns to repeat in proposal}

## What to avoid
- {friction / complaints from CS log}

## Stakeholders (updated)
- {any changes from H2 table}

## Next step (Sales)
- [ ] Skip S0/S1 (already qualified from CS), go direct to S3 Proposal
- [ ] Use existing intake + discovery as base, add delta only
- [ ] Ack this handoff in 24h
```

### Note
- Since S1 qualification và S2 discovery đã có context, **skip lại** — không force client làm lại discovery.

---

## 7. H5 — Engine (P9) → Finance (F0 Invoice)

**Outgoing**: Driver · **Incoming**: COO (finance) · **Time**: 5'

### Trigger
- G2 gate passed (client acceptance)

### Handoff
Simple: 1 Slack message + 1 entry.

Slack to `@COO`:
```
H5: {project-id} accepted {date}. Trigger final invoice.
  - Balance: $X (50% of $Y total)
  - Client contact: {finance email}
  - Payment terms: NET-{X}
  - SOW ref: projects/{id}/02-sow.md §fees
Please invoice within 24h.
```

Update `_state.json`:
```json
"gates.client_acceptance": { "status": "approved", ... },
"deliverables_index": [{ ..., "status": "delivered" }]
```

### Incoming DoD
- [ ] Invoice sent within 24h (use template `pipelines-business/finance/F0-INVOICE.md`)
- [ ] Log in Wave/Stripe
- [ ] Calendar reminder Day 14 (check paid), Day 21 (overdue action)
- [ ] Reply Slack: `H5 ack, invoice sent {inv#}, due {date}`

### Failure mode
Driver quên Slack COO → invoice delay 1 tuần → client có thể "quên" → cashflow risk.  
**Prevention**: `_state.json.gates.client_acceptance.status=approved` tự động trigger Slack bot ping COO.

---

## 8. H6 — Content (C4 Repurpose) → Sales (S0 Prospect)

**Outgoing**: Content lead (often CEO) · **Incoming**: Sales lead · **Time**: 5' per lead

### Trigger
- Content piece generated inbound lead (form submit / DM / email reply citing specific piece)

### Handoff
Log vào CRM inbound + 1 line Slack:

```
H6: Lead from content piece "{title}" — {name, company}, message: "{quote}"
Assigning to: {vertical lead based on industry}
Context: piece URL, full reply thread
```

Handoff file = CRM row (not markdown, simpler). Sales lead takes over S0 cadence.

### Metric tracked
- **Content-to-lead rate**: leads per piece. Review W02 retro §3 content pipeline.

---

## 9. H7 — Any Pipeline → Hiring (H0 Need)

**Outgoing**: Any (driver / CEO / CTO recognizing gap) · **Incoming**: COO (hiring owner) · **Time**: 30'

### Trigger
- Capacity gap phát hiện: "project thứ 3 đang vào mà team không đủ hands"
- Skill gap: "cần chuyên gia X mà 3 founder không cover"
- Rotation gap: on-call burnout

### Handoff file
`pipelines-business/hiring/{YYYY-MM}-need-{role}.md` using `H0-NEED.md` template.

```markdown
# H7: Hiring need → {role}

## From: {who identified}
## To: COO

## Why
- Current capacity: {state}
- Expected demand: {pipeline projection}
- Gap: {what can't be covered}

## Role profile
- Type: {FT / contract / agent-build}
- Skills: {list}
- Seniority: {junior / mid / senior}
- Budget: ${range}
- Start by: {date}

## Alternative considered
- Build agent instead: {yes — link skill card / no — why}
- Outsource to partner: {yes — who / no}
- Defer: {yes — until when / no — critical}

## Next step (COO)
- [ ] Decision within 7 days: hire / build / defer
- [ ] If hire: trigger H1-JD-OUTREACH within 14 days
```

### Rule
- **Default is "build agent" not "hire human"** (cost + flexibility). Must prove agent can't cover before hiring.
- Reference `business-strategy/07-agent-team-development.md`.

---

## 10. H8 — Delivery Retro → Knowledge (L1 memory)

**Outgoing**: Driver writing `99-retro.md` · **Incoming**: P3 (Knowledge owner per roster)

Mostly handled by W02 §5.5 memory ceremony, but per-project trigger:

### Handoff
`_state.json.memory_promotion_queue[]` populated at retro writing. At Fri ceremony:
- Each candidate evaluated
- Approved → P3 writes to `knowledge/baselines/{B}/memory/` or `knowledge/industries/{I}/memory/`
- `_state.json.memory_promotion_queue[i].status = "promoted"`

### Rule
- **No auto-promotion** — must pass ceremony review (avoid 1 bad data point corrupting knowledge).
- Minimum 3 candidates reviewed per week OR flag "team not learning".

Link: [`W02-weekly-cadence.md`](W02-weekly-cadence.md) §5.5

---

## 11. H9 — Retro → Skill Card Update (L2)

**Outgoing**: Driver / CTO from retro · **Incoming**: P1 (LLMOps owner, skill card custodian)

### Trigger
- Retro identifies: "T{N}-{agent} consistently produces X issue"

### Handoff
1. Issue logged in `_state.json.memory_promotion_queue[]` with `candidate_type: "skill_update"`
2. Fri retro approves → P1 updates `_shared/.agents/tier-{N}/{agent-id}.md`:
   - Version bump
   - Changelog entry
   - Updated prompt if needed
   - Updated eval threshold if calibration off
3. Eval re-run on golden set before unfreeze
4. Announce in `#studio-ops`: `H9: {agent-id} updated v{X} → v{Y} — change: {summary}`

### Rule
- Skill card change = prompt change = MUST eval → MUST announce. No silent updates.

---

## 12. Handoff Audit Checklist (Fri retro)

Quarterly or when red flag:

- [ ] Every project active has recent handoff record in `_state.json.phase_history`?
- [ ] Each handoff file exists + committed?
- [ ] Incoming owner acknowledged in Slack within SLA?
- [ ] No orphan project (no owner)?
- [ ] Failure modes §12 of this doc: any happened? Why?

---

## 13. Failure Modes (cross-handoff)

| Failure | Dấu hiệu | Xử lý |
|---|---|---|
| Silent handoff (verbal only) | No file, incoming lost context | Demand retro; force write retro |
| Delayed ack (>4h sales hours) | Outgoing doesn't hear back | Escalate via `#studio-ops`, flag retro |
| Incomplete context | Incoming asks "what about X?" next day | Complete outgoing responsibility — amend file, not blame |
| Orphan project | No current owner in `_meta.json.team.human.lead` | Project auto-paused in `_state.json` until owner assigned |
| Handoff skipped entirely | Phase jumped without transition doc | Revert state, force handoff; retro learn |
| Handoff file out of date | Realities shift, file not updated | Amend file at event, not fix at retro |
| Concession lost in H2 | Design doesn't reflect negotiation | CEO sign-off on H2 file is mandatory gate |
| Invoice delay (H5) | G2 passed but no F0 trigger | Auto-ping COO 24h after G2; escalate if still miss |

---

## 14. Cross-References

- Pipeline docs: `@../pipeline/` + `@../pipelines-business/`
- Rules: `@../../../../_shared/rules/30-execution-rules.md` §cross-pipeline-handoffs
- Communication rules: `@../../../../_shared/rules/50-communication-rules.md` §inter-agent-handoff
- Daily + weekly: [`W01`](W01-daily-operating-rhythm.md) + [`W02`](W02-weekly-cadence.md)
- E2E walkthrough: [`W03-new-project-walkthrough.md`](W03-new-project-walkthrough.md)
- Agent dispatch (agent handoffs): [`W04-agent-dispatch-runbook.md`](W04-agent-dispatch-runbook.md) §11
- Incident escalation (handoff-related incidents): [`W05-incident-response.md`](W05-incident-response.md) §8.5
- Hiring pipeline: `@../pipelines-business/hiring/`
- Finance pipeline: `@../pipelines-business/finance/`
- Project state schema: `@../../../../_shared/templates/project/_state.json`

---

*Last updated: 2026-04-26 · v1.0*
