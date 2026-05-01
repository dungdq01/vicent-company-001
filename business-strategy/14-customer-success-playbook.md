# Customer Success Playbook

**Mục đích:** Quy trình sau khi customer ký hợp đồng — onboarding, ongoing PM, expansion, churn handling. Owner: P3 (COO).

**Quy tắc vàng:** *"Customer renewal + expansion là 80% growth dài hạn. Acquisition mới là 20%. Đầu tư CS = đầu tư runway."*

---

## 1. Customer journey

```
[Signed] → Onboarding (Week 1) → Active Delivery (Sprint A-D)
   → Acceptance + Handoff (P9)
   → 30-day post-delivery support
   → Expansion (Sprint B → C, retainer add)
   → Quarterly Business Review (QBR)
   → Renewal OR Churn
```

---

## 2. Onboarding — First 7 days

### Day 0: Welcome

**P3 sends within 2h of SOW signed:**

```
Subject: Welcome to {Brand} — {Project Name} kickoff

Hi {Name},

Cảm ơn anh/chị đã trust {Brand}! Em là {P3}, primary contact của anh/chị.

3 việc cần action trong tuần này:
1. Discord/Slack channel: {link} — daily async, all team will be here
2. Notion project page: {link} — track all deliverables
3. Kickoff call: {Calendly link} — book trong 3 ngày

Tài liệu kèm:
- Welcome guide (5 phút đọc)
- Project plan
- What to expect by phase

Có câu hỏi gì DM em luôn nhé.

Cheers,
{P3}
```

### Day 1–3: Kickoff call (60 min)

**Agenda:**
- 0–5: Introductions (CEO joins for ICP-E + ICP-D)
- 5–15: Recap discovery — confirm pain understanding
- 15–30: Walk through project plan + RACI
- 30–40: Expectations — communication cadence, response time
- 40–50: Risk + concerns from client side
- 50–60: Next 7 days — what client needs to provide, what we deliver

**Output:**
- `meta/kickoff-notes.md` — decisions, action items, anyone added/removed from comms

### Day 4–7: Foundation

**P3 ensures:**
- Client has access to all data/systems we need
- Client team identified — DM, champion, technical SPOC
- Communication channel active (≥ 1 message/day from us showing progress)
- First deliverable on schedule

**Day 7 status:**
- P3 sends "End of Week 1" status update
- Internal: P3 + CEO 15-min check-in — anything off track?

---

## 3. Ongoing delivery — Project active phase

### Weekly cadence

| Day | Activity | Owner |
|---|---|---|
| Mon | Internal sprint planning | P3 + CEO + P2 |
| Tue | Async work — agents run, founders review output | All |
| Wed | Mid-week client touch (Slack message + 1 deliverable share) | P3 |
| Thu | Internal mid-sprint review | P3 + CEO |
| Fri | Client status update (template file 13 §4) + client weekly call (30 min) | P3 |

### Communication response time

| Source | Target | Max |
|---|---|---|
| Slack/Discord | < 4h business hours | < 24h |
| Email | < 24h | < 48h |
| Critical issue | < 1h | < 4h |

### Health score tracking

Track per active project (P3 weekly):

| Dimension | Score 1–5 | Definition |
|---|---|---|
| **Schedule** | 1–5 | 5 = on track, 1 = > 1 week behind |
| **Quality** | 1–5 | 5 = exceeds, 1 = client unhappy |
| **Stakeholder** | 1–5 | 5 = champion engaged, 1 = ghosted 2 weeks |
| **Scope** | 1–5 | 5 = within original, 1 = scope creep > 30% |
| **Cost** | 1–5 | 5 = under budget, 1 = > 50% over |

**Action triggers:**
- Any dimension = 1 → escalate to CEO same day
- Average < 3 → red flag, schedule recovery call within 3 days
- 2 dimensions = 2 → yellow flag, P3 reviews with CEO weekly

---

## 4. Post-delivery support (30 days after P9)

### What's included

- Slack/Discord channel stays open
- Response < 48h to questions
- 1 follow-up call (30 min) at Day 14 + Day 30
- Bug fixes if defect from our delivery (free)

### What's NOT included

- New features / scope additions (=> SCR or new SOW)
- Production support / on-call
- Training new client team members beyond original handoff
- Multi-month coaching

### Day 30 transition

**P3 sends:**

```
Subject: 30-day post-delivery — let's review

Hi {Name},

Đã 30 ngày từ delivery, mình muốn check-in:
1. Project outcome so với expectation?
2. Có blocker gì cần address?
3. Continue work nào nên làm tiếp?

Em propose 3 path:
A. Done — close support channel, mời share testimonial nếu OK
B. Phase 2 SOW — extend scope (Architecture/Design/Build)
C. Retainer — ongoing strategy + monthly review

Pick 1 hoặc DM em discuss.
```

---

## 5. Expansion playbook

### Expansion paths

| From | To | Trigger | Effort to close |
|---|---|---|---|
| Sprint A | Sprint B | Client liked discovery, wants architecture | 1 conversation |
| Sprint B | Sprint C | Architecture approved, wants build spec | 1 conversation |
| Sprint A/B/C | Retainer | Project done, ongoing support need | 2 conversations |
| One project | Second project | Different department within same client | Warm intro internal |
| Audit | Cost Sprint | Audit found savings, want execution | 1 conversation |
| Audit | Retainer | Ongoing LLMOps maintenance | 2 conversations |

### Timing

- **DON'T** pitch expansion in middle of Sprint A delivery (focus on shipping)
- **DO** pitch in handoff meeting (P9) when client is happy
- **DO** pitch at Day 30 post-delivery check-in
- **DO** pitch at QBR (quarterly) if retainer active

### Pitch template (during P9 handoff)

```
"Sprint A done — {client} đã có discovery + proposal.
Next logical step:
- Sprint B (3 weeks, $X) → architecture spec + tech design
  → team kỹ thuật của anh/chị có document để build
- HOẶC retainer ($Y/month) → em làm AI advisor 4h/tuần,
  giúp team execute internally.

Anh/chị thấy nào fit hơn?"
```

---

## 6. Quarterly Business Review (QBR) — for retainer customers

**Trigger:** Retainer customer hits 3-month mark.

**Format:** 60-min call, P3 leads, CEO joins for technical depth.

**Agenda:**
- 0–10: Recap — past 3 months activities + outcomes
- 10–20: Metrics review — agreed KPIs từ retainer
- 20–35: Roadmap next 3 months
- 35–45: Strategic discussion — emerging opportunities, AI landscape changes
- 45–55: Asks from client (more support? different focus?)
- 55–60: Next 3-month commitment + adjustments

**Output:**
- `qbr-{client}-{date}.md` — decisions, new SOW (if any), updated retainer scope

---

## 7. Churn handling

### Churn definition

- Retainer cancelled with no replacement project
- Project NOT extended at Day 30 (acceptable for one-time engagements)
- Client ghosts → 2 follow-ups + 1 call attempt → mark inactive

### Pre-churn signals (act before cancellation)

- Health score average < 3 for 2 weeks
- Champion left/changed role
- Budget freeze announced
- Sentiment shift in messages (terse, formal, no emoji)
- Reduced engagement in calls (passive, no follow-up questions)

### Save play

When signal detected:

1. **P3 calls champion** within 48h — informal coffee, not pitch
2. **Listen** — what's going on internally?
3. **Adjust** — pause work, descope, switch focus, pause retainer 1 month
4. **CEO joins if technical concern** — give second opinion, technical assurance

### Graceful exit

If churn unavoidable:

1. **Don't fight** — accept, thank them
2. **Final delivery clean** — handoff package, transition doc
3. **Open door** — "When budget returns / new role / new initiative — we're here"
4. **Ask for**: testimonial OR referral OR feedback on why they left
5. **Internal retro** — root cause + product/process update

### Churn retro template

```markdown
# Churn — {Client} — {Date}

## Customer info
- Tier: ...
- LTV: $...
- Months active: ...

## Stated reason
- {client's stated reason}

## Real reason (P3 hypothesis)
- ☐ Pricing
- ☐ Outcome below expectation
- ☐ Better competitor
- ☐ Internal change (re-org, budget, key person)
- ☐ Lost champion
- ☐ Trust issue
- ☐ Wrong ICP — should have disqualified

## What we should've done
- {1-3 bullets}

## Action items
- {tag: pricing / messaging / delivery / qualification}

## Open door follow-up
- Date for next check-in: {6 months out}
```

Monthly: P3 aggregates churn → identify patterns → update playbook.

---

## 8. NPS + testimonial

### NPS request

Send at:
- Day 30 post-delivery (one-time projects)
- Quarterly (retainer)

**Format (1 question + 1 follow-up):**

```
Trên thang 0–10, anh/chị có recommend {Brand} cho colleague không?

[score]

Vì sao?
[free text]
```

### Testimonial request

**When:** NPS 9–10 OR client unprompted positive feedback.

**Ask:**
```
"Cảm ơn anh/chị! Em có thể quote phần này lên website + LinkedIn không?
Có thể anonymize tên/công ty nếu anh/chị thích."
```

### Case study request (Founding Customer required, others nice-to-have)

**Ask after** ≥ 3 months of measurable outcome:

```
"Anh/chị có 30 phút share lại process + outcome — em viết case study 
{anonymized | named}. Win-win: anh/chị được showcase lãnh đạo, em có 
proof point cho khách khác."
```

**Process:**
1. P3 interview client (30 min)
2. Agent R-σ draft case study (1500-2000 từ)
3. Send draft to client for approval
4. Publish on website + LinkedIn + share with client team

---

## 9. Customer health dashboard

P3 maintains 1 Notion table với mọi customer:

| Field | Note |
|---|---|
| Customer | Name |
| ICP | A/B/C/D/E |
| Stage | Active / 30-day / Churned / Renewal / QBR due |
| Health score (1-5) | weekly update |
| LTV | Cumulative paid |
| MRR (if retainer) | |
| Last touch | Date |
| Next touch | Date + action |
| Risk flags | Health < 3, champion change, etc. |
| Expansion potential | Notes on next opportunity |

**Weekly review (15 min):** P3 scans table, flags 1–2 customer cần action.

---

## 10. Anti-patterns

- ❌ Disappear after delivery — kills expansion + referral pipeline
- ❌ Promise things outside scope to keep client happy — sets bad precedent
- ❌ Free additional work để "make up for delay" — eats margin
- ❌ Reactive only, no proactive check-in — customer feels forgotten
- ❌ Skip QBR vì "thấy ổn" — chính lúc đó champion đang lên kế hoạch chuyển sang vendor khác
- ❌ Not asking for testimonial vì ngại — tự cắt brand asset
- ❌ Churn retro shallow ("they don't have budget") — không learn

---

## 11. Tóm tắt 1 trang

```
JOURNEY: Signed → Onboard W1 → Delivery → P9 Handoff → 30-day support
         → Expansion OR QBR OR Churn

ONBOARDING:
  Day 0: Welcome email + Discord + Notion + Calendly
  Day 1-3: Kickoff call 60 min
  Day 4-7: Foundation + first deliverable + Day 7 status

WEEKLY: Mon plan | Tue work | Wed touch | Thu mid-review | Fri status + call

HEALTH SCORE: Schedule + Quality + Stakeholder + Scope + Cost (1-5 each)
  Average < 3 → red flag, recovery call < 3 days

POST-DELIVERY (30d):
  Free: Slack open, < 48h response, 2 calls (Day 14, 30), bug fix
  Day 30: A done | B Phase 2 SOW | C Retainer

EXPANSION TIMING:
  P9 handoff (best) | Day 30 check-in | QBR (retainer)
  Ratio target: 40% one-time → expansion within 90 days

QBR (retainer M3+): 60 min, P3 leads + CEO joins, every 3 months

CHURN SAVE: Detect signal → call within 48h → listen → adjust
CHURN GRACEFUL: Accept → clean handoff → open door → ask testimonial/feedback

NPS: Day 30 (one-time), Quarterly (retainer)
TESTIMONIAL: NPS 9-10 → ask → quote on web/LI
CASE STUDY: Founding required, all encouraged

DASHBOARD: Notion table, weekly P3 scan 15 min
```
