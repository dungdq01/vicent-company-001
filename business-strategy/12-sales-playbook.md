# Sales Playbook — Discovery → Close

**Mục đích:** Quy trình sales chuẩn cho B2B (ICP-B/C/D/E). Owner chính: P3 (COO/Business Solution). CEO support cho ICP-E technical buyer.

**Quy tắc vàng:** *"Qualify ruthlessly. Better to lose deal early than waste 4 tuần với khách không fit."*

---

## 1. Sales funnel overview

```
TOP                           ATB (Awareness To Booking)
  ↓
[Top of Funnel]
  - MMO content (CEO/freelance) → MMO product sale (loop ICP-A)
  - Technical content (CEO) → engineer audience → ICP-E inbound
  - LinkedIn B2B (P3) → COO/Founder audience → ICP-B/C inbound
  - Niche audit reports (gated) → email list → nurture
  - Founder community DM (P3 direct) → warm intro
  - Employer warm relationship (P3/CEO) → ICP-D
  ↓ [Lead capture]

[Marketing Qualified Lead — MQL]
  Action: Form fill, audit DL, course buyer, X DM
  Owner: P3
  ↓ Score lead (BANT)

[Sales Qualified Lead — SQL]
  Action: 30-min discovery call booked
  Owner: P3 leads, CEO joins for ICP-E
  ↓ Discovery

[Opportunity]
  Action: Scope + proposal sent
  Stages: Scoping → Proposal → Negotiation → Verbal → Signed
  ↓ Close

[Customer]
  Action: Kickoff + delivery (handoff to file 14)
```

---

## 2. Lead qualification — BANT + Fit

### BANT score (mỗi yếu tố 0-3)

- **Budget:** Có ngân sách cho dự án này? (3 = đã approved, 2 = sẵn approve nếu show ROI, 1 = "let me check", 0 = không rõ)
- **Authority:** Người nói chuyện có quyết định? (3 = decision maker, 2 = champion w/ direct line to DM, 1 = influencer, 0 = unclear)
- **Need:** Pain rõ ràng và đau? (3 = active pain với cost rõ, 2 = aware nhưng chưa urgent, 1 = exploring, 0 = curious)
- **Timeline:** Khi nào cần ship? (3 = trong 30 ngày, 2 = trong 90 ngày, 1 = "this year", 0 = không rõ)

### Fit score (0-3)

- Thuộc 5 ICPs (file 02)? (3 = exact match, 2 = adjacent, 1 = stretch, 0 = không fit)
- Bài toán map ≥1 trong 9 baselines ưu tiên hoặc LLMOps? (3/2/1/0)
- Sẵn case study (anonymized OK)? (3 = yes named, 2 = anonymized OK, 1 = TBD, 0 = no)

### Threshold

- **BANT ≥ 8 + Fit ≥ 6** → SQL, schedule discovery
- **BANT 5–7** hoặc **Fit 3–5** → nurture (email drip, không call)
- **BANT < 5** hoặc **Fit < 3** → polite decline

**KHÔNG** đẩy thêm SQL chỉ vì pipeline trống. Bad-fit deal kill engine throughput.

---

## 3. Discovery call script (30 phút)

### Cấu trúc

| Phút | Phần | Mục tiêu |
|---|---|---|
| 0–3 | Rapport + agenda | Set expectation, không sell trước |
| 3–13 | Pain discovery | Hiểu deeply: hiện tại làm sao, đau ở đâu, đã thử gì |
| 13–20 | Constraints + criteria | Budget, timeline, decision process, success criteria |
| 20–25 | Sơ bộ giải pháp | Map vào MAESTRO baseline, gợi ý Sprint A/B/C |
| 25–28 | Q&A + objection | Trả lời, không defensive |
| 28–30 | Next step + commit | Schedule proposal review, không push close |

### Script — Pain discovery (10 phút quan trọng nhất)

```
P3: "Để hiểu rõ tình huống của anh/chị, em hỏi 5 câu nhé.

1. Hiện tại anh/chị xử lý [bài toán] như thế nào?
2. Quy trình đó tốn bao nhiêu thời gian / tiền / nhân lực mỗi tháng?
3. Anh/chị đã thử giải pháp nào trước đây? Vì sao chưa work?
4. Nếu giải quyết được, công ty sẽ tiết kiệm hoặc thu thêm bao nhiêu?
5. Ai trong team đang chịu trách nhiệm? Decision của ai?"

[Lắng nghe, ghi note. KHÔNG sell trong phase này.]

[Nếu khách hỏi "giải pháp của bên em là gì?":]
"Em cần hiểu thêm trước đã. Sau khi nắm rõ pain, em sẽ recommend đúng tier.
 Có khi em recommend khách KHÔNG mua gì cả nếu chưa fit."
```

### Script — ICP-E technical (CEO joins)

```
CEO: "Bạn cho mình xem stack hiện tại?
- LLM provider gì? Volume bao nhiêu/tháng?
- Eval framework gì? Có golden set không?
- Prompt mgmt: Git? In-code? Notion?
- Cost trung bình $/feature?
- Latest incident liên quan AI ship đến user?"

[Trong 5 phút sẽ biết maturity LLMOps level 0-5.]

[Nếu maturity < 2 → LLMOps Audit fit; > 3 → Cost Sprint hoặc Eval setup fit]
```

---

## 4. Scoping document template

Sau discovery, P3 fill template này trong 24h:

```markdown
# Scoping Doc — {Client Name} — {Date}

## Pain summary
- Current state: ...
- Quantified impact: $X/month wasted / Y hours/week / Z% error rate
- Stakeholder: {names + roles}

## Proposed scope
- Tier: A / B / C / D / Audit / Custom
- Baselines used: B0X, B0Y
- Industry: I0Z
- Estimated agents involved: R-α + R-γ + R-D{N} + R-σ
- Estimated cost (us): $X (Engine) + Y h founder time
- Estimated price (client): $Z (per pricing sheet file 10)

## Success criteria
- {3-5 measurable outcomes}

## Out of scope
- {explicit list — important to manage expectation}

## Timeline
- Kickoff: {date}
- Milestones: {list}
- Delivery: {date}

## Pricing
- Tier: $X
- Payment: 50/50 or 30/30/40
- Currency: USD or VND

## Next step
- Send proposal: {date}
- Decision deadline: {date}
- Kickoff target: {date}

## Internal notes (NOT shared with client)
- BANT score: B/A/N/T
- Fit score: ICP/baseline/case-study
- Risk: {language barrier, decision lag, budget approval, etc.}
- Special handling: {NDA, employer relationship, etc.}
```

→ P3 reviews với CEO trong 1-1 (15 phút) trước send proposal.

---

## 5. Proposal template

```markdown
# AI {Tier} Sprint Proposal — {Client Name}

**Prepared by:** {Brand}
**Date:** {Date}
**Valid until:** {Date + 14 days}

## Executive summary

{Client} is facing {pain}. We propose {Tier} Sprint to deliver {primary deliverable}
in {timeline}, at {price}.

## The problem we will solve
{1-2 paragraph based on discovery}

## Our approach
{Brief — agents involved, methodology, file 13 reference}

### Phase 1 — {Phase name}
- Activities: ...
- Deliverable: ...
- Duration: X weeks

### Phase 2 — {Phase name}
...

## Deliverables
1. {Specific artifact 1} — {format: PDF/Notion/repo}
2. {Specific artifact 2}
3. {Specific artifact 3}

## What you'll need to provide
- {Data access / API keys / sample documents}
- {Stakeholder availability — Y hours/week}
- {Decision turnaround — 48-72h}

## Out of scope
{Explicit list}

## Investment
| Item | Price |
|---|---|
| {Tier} Sprint | $X |
| Add-on (if any) | $Y |
| **Total** | **$Z** |

**Payment:** {50/50 or 30/30/40}
**Currency:** {USD or VND}
**Validity:** 14 days from {date}

## Why us
- {1-2 differentiators based on ICP}
- For ICP-E: emphasize CEO LLMOps + OSS framework
- For ICP-B/C: emphasize 9-phase pipeline + speed (2 weeks)
- For ICP-D: emphasize insider knowledge + low ramp time

## Next steps
1. Review proposal — by {date}
2. Sign SOW + 50% deposit — by {date}
3. Kickoff call — {date}

## Appendix
- Case study (if any, anonymized OK)
- Team bio (CEO + relevant agent description)
- Detailed methodology (link to file 13)
```

---

## 6. Objection handling

### Common objections + responses

| Objection | Response |
|---|---|
| "Quá đắt so với expectation" | "Hiểu. Cho em hỏi expectation là bao nhiêu và for what scope? Có thể em recommend Tier A nhỏ hơn để start." (KHÔNG discount; offer smaller tier) |
| "Chúng tôi muốn làm in-house" | "Hoàn toàn understandable. Sprint A của em chính là để giúp anh/chị decide build vs buy. Sau Sprint A, nếu in-house, anh/chị có architecture + spec để team build. Win-win." |
| "ChatGPT free chúng tôi tự làm được" | "Đúng cho POC. Nhưng production cần eval, cost track, prompt versioning, failure handling. Đó là đặc trưng của Sprint B+. Em show case study {X} pay $Y để giải đúng vấn đề này." |
| "Cần xin sếp" | "Em hiểu. Em prepare 1-page exec summary cho sếp, anh/chị share. Khi nào sếp xem xong, em book 15 phút Q&A trực tiếp với sếp được không?" |
| "Để 1-2 tháng nữa" | "Có lý do specific gì em hỗ trợ được? Hay budget cycle / approval / quarter end? Em hold pricing 30 ngày, sau đó re-quote." (Probe lý do thật) |
| "Đối thủ rẻ hơn 30%" | "Cho em hỏi đối thủ deliver gì cụ thể? Sprint của em có {eval + cost track + handoff doc} mà thường vendor khác skip. Nếu chỉ cần basic AI consult, em không phải fit; em sẵn sàng giới thiệu vendor khác." (Defend value, không match price) |
| "Cần thấy guarantee" | "Sprint A có 1 round revision miễn phí trong 14 ngày sau ship (file 10 §7). Cost Sprint ICP-E có refund 50% nếu không deliver $1K/mo savings. Em không guarantee outcome ROI vì depend on execution của team anh/chị, nhưng guarantee deliverable quality." |
| "Làm xong rồi tính tiền" | "Em hiểu, nhưng risk không balance. Sprint A em invest ~40h founder time. 50% deposit = commitment 2 chiều. 50% còn lại on delivery." |

---

## 7. Negotiation playbook

### Levers từ thấp đến cao

1. **Payment terms** (lever rẻ nhất) — 30/30/40 thay 50/50, NET-15 thay NET-7
2. **Scope adjustment** — descope features không quan trọng, downgrade tier
3. **Add-on miễn phí** — 1 buổi training $1K-2K tặng kèm Sprint C
4. **Founding Customer status** — 30-50% off but bắt buộc case study + testimonial
5. **Retainer commitment** — discount 15% nếu sign 6+ tháng retainer
6. **Annual upfront** — 10% discount

### Lever KHÔNG dùng

- ❌ "Vì em quý anh/chị" discount tùy tiện
- ❌ Lower scope nhưng giữ price (red flag, hủy giá trị brand)
- ❌ "Tặng kèm" nhiều add-on khiến deliverable bloat
- ❌ Free pilot không có upgrade path

### Walk-away rules

P3 **walk away** nếu:
- Khách offer < 50% list price (không thuộc Founding tier)
- Khách yêu cầu IP transfer toàn bộ (không tương xứng pricing)
- Khách đòi unlimited revision
- Khách không sign NDA mà muốn xem internal IP
- Sau 3 round negotiation chưa close → "Em hold pricing thêm 7 ngày, sau đó tái assess"

---

## 8. Outreach playbook

### Cold outreach (LinkedIn DM, email)

**Format DM 100-150 từ:**
```
Hi {Name},

Mình là {P3} từ {Brand}. Mình thấy {Company} đang {specific observation 
— recent news, hire post, public talk}. 

Bên mình vừa làm 1 audit cho {anonymous similar company} cho ra:
- {Metric 1}
- {Metric 2}

Tuần sau mình ship public report "Top 10 AI use case cho {industry} VN 2026" 
- gửi anh/chị xem trước nhé?

Không sell, chỉ giá trị — anh/chị reply 'yes' mình gửi link luôn.

{P3}
```

**Quality bar:**
- Specific observation (không generic)
- Value-first (offer report, không pitch)
- Easy ask ("yes" = lead capture)
- Không > 1 follow-up nếu không reply

### Warm outreach (qua intro)

**Always honor the intro:**
```
Hi {Name},

Cảm ơn {Mutual} đã connect. {Mutual} có nói về {context}.

{Brand} bên mình đang serve {ICP} với {service}. Mình hold 1 slot 30-min 
discovery cho người được intro — share thêm nhé?

Calendly: {link}
```

### Follow-up cadence

| Touch | Khi | Channel | Content |
|---|---|---|---|
| 1 | Day 0 | DM/Email | Initial value offer |
| 2 | Day 4 | Same channel | "Just checking — quick yes/no" |
| 3 | Day 14 | Different channel (LinkedIn → email) | "Bumping with new resource: {link audit report}" |
| 4 | Day 45 | Email only | "Quarterly check-in — still relevant?" |
| Stop | After 4 | — | Add to long-term nurture (newsletter only) |

---

## 9. Pipeline management

### CRM (Notion table) columns

| Field | Required | Note |
|---|---|---|
| Company | yes | |
| Contact name | yes | |
| Role | yes | DM / Champion / Influencer |
| ICP | yes | A/B/C/D/E |
| Source | yes | TikTok / LinkedIn / Warm intro / Audit DL / X DM |
| Stage | yes | Lead / MQL / SQL / Proposal / Verbal / Signed / Lost |
| Value | yes | USD est |
| Probability | yes | % (per stage default) |
| Next action | yes | + due date |
| BANT | yes | / 12 |
| Fit | yes | / 9 |
| Notes | optional | |

### Stage probability defaults

| Stage | Prob | Action if stuck > X days |
|---|---|---|
| Lead | 5% | Move to MQL or drop after 14 days |
| MQL | 15% | Discovery booked or drop after 7 days |
| SQL | 30% | Discovery completed within 7 days |
| Proposal | 50% | Decision within 14 days post-send |
| Verbal | 80% | Sign within 7 days |
| Signed | 100% | Kickoff within 14 days |

### Weekly pipeline review (Friday 30 phút)

P3 + CEO review:
- New leads tuần này
- Stuck deals (> threshold) — decide nudge / drop
- Forecast next 30 days (weighted pipeline)
- Win/loss analysis cho deal close tuần qua

---

## 10. Win/loss analysis

Sau MỖI deal close (win or lose), P3 fill 5-min retro:

```markdown
# Deal retro — {Client} — {Won/Lost} — {Date}

## Outcome
- Value: $X
- Stage closed at: {Signed / Verbal / Proposal / etc.}
- Cycle time: X days from MQL

## What worked
- {1-3 bullets}

## What didn't work
- {1-3 bullets}

## Root cause (if lost)
- ☐ Pricing
- ☐ Trust / brand new
- ☐ Competing vendor
- ☐ Internal change (re-org, budget freeze)
- ☐ Wrong ICP — should've disqualified earlier
- ☐ Scope mismatch
- ☐ Timing

## Action items
- {Tag: pricing review / messaging / discovery script / outreach}
```

Monthly: P3 aggregate retros → identify patterns → update playbook.

---

## 11. Tóm tắt 1 trang

```
FUNNEL: Lead → MQL → SQL → Proposal → Verbal → Signed

QUALIFY:
  BANT ≥ 8/12 + Fit ≥ 6/9 → SQL
  Lower → nurture or decline

DISCOVERY (30 min):
  3' rapport | 10' pain | 7' constraints | 5' solution | 3' Q&A | 2' next step
  Listen > sell

OBJECTIONS:
  Price → smaller tier (no discount)
  ChatGPT free → eval/cost/versioning differentiator
  Need to ask boss → exec summary + Q&A with boss
  Competitor cheaper → defend value, never match price

NEGOTIATION:
  Payment terms → scope → add-on → Founding Customer → retainer commit → annual
  Walk away if: < 50% list, IP transfer, unlimited revision, 3 rounds no close

OUTREACH:
  Cold DM 100-150 từ, value-first
  Follow-up: Day 0/4/14/45 then stop
  Different channel between touches

CRM: Notion 12 cols. Weekly pipeline review Friday 30 phút.
RETRO: Every deal closed, 5-min template.

ICP SPLIT:
  ICP-A MMO → e-commerce sale flow, không cần discovery call (digital)
  ICP-B/C VN B2B → P3 leads
  ICP-D Employer → P3 + 1 founder w/ relationship
  ICP-E AI startup → P3 books, CEO joins call (technical credibility)
```
