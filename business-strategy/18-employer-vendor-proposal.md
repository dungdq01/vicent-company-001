# Employer Vendor Proposal Template (ICP-D)

**Mục đích:** Template + playbook đặc biệt cho ICP-D — employer hiện tại của 1 trong 3 founders. Đây là **anchor customer** quan trọng nhất Phase 1: 1 logo + 1 case study + 1 reference cho ICP-B/C.

**Rủi ro chính:** Conflict of interest với role full-time. File này hướng dẫn manage rủi ro + close deal.

---

## 1. Strategic context

### 1.1 Tại sao ICP-D quan trọng

- **Lowest-friction first contract:** founder đã có warm relationship, hiểu nội bộ pain
- **Anchor logo:** 1 enterprise/SMB client là proof point cho ICP-B/C outreach
- **Recurring potential:** vendor relationship có thể grow theo thời gian
- **Insider knowledge:** ramp time gần 0 → margin cao

### 1.2 Tại sao rủi ro

- **IP conflict** nếu employer không clear venture work khác với job duties
- **Time conflict** nếu work overlap giờ làm
- **Trust risk** nếu employer suspicions về moonlighting
- **Relationship risk** nếu deal break, có thể ảnh hưởng employment

---

## 2. Pre-flight checklist (BEFORE pitching)

### 2.1 Legal review

- [ ] Đọc lại employment contract employer hiện tại
  - Có "non-compete" clause không?
  - Có "moonlighting prohibition" không?
  - Có "IP assignment" cho mọi work của founder không?
- [ ] Confirm hệ thống máy riêng — tất cả venture code/doc trên hệ thống cá nhân
- [ ] Check work-product line — nếu employer đã trả lương cho task X, X không thể là venture sale point
- [ ] Tham khảo lawyer 30 phút (~$100) nếu uncertain

### 2.2 Disclosure decision

3 path:

**Path A — Full disclosure (recommended)**
- Founder thông báo employer về venture từ đầu
- Get written approval cho vendor relationship
- Pros: zero legal risk, can pitch openly
- Cons: employer có thể disapprove

**Path B — Disclose only at vendor pitch**
- Founder không nói về venture cho đến khi pitch
- Pros: maintain optionality nếu venture fail
- Cons: surprise factor có thể tạo distrust

**Path C — Stay anonymous (founder stays in background)**
- Pitch dưới tên brand, không reveal founder identity ban đầu
- Pros: cleanest separation
- Cons: lose warm relationship advantage

**Recommend:** Path A nếu employer culture open; Path B với người founder thân; Path C nếu employer culture rất strict.

### 2.3 Founder + Co-founder agreement

Đặt câu hỏi với 2 cánh tay (file 06 §6):
- Equity vs revenue split cho deal này có khác standard không?
- Nếu deal close, founder làm role gì (sales lead, delivery lead, observer)?
- Nếu employer challenge IP, defense plan thế nào?

Document ở `docs/decisions/employer-vendor-disclosure.md`.

---

## 3. Discovery (employer-specific)

### 3.1 Questions để hỏi (insider advantage)

| Standard discovery question | Employer-specific tweak |
|---|---|
| "Pain hiện tại?" | "Pain X mà em đã thấy team {team name} struggle 3 tháng qua" |
| "Đã thử giải pháp gì?" | "Em biết team thử {solution Y} hồi tháng {Z}, kết quả thế nào?" |
| "Decision maker?" | (Đã biết — pitch directly tới đúng người) |
| "Budget?" | "Quarter này anh {boss} có ngân sách CNTT bao nhiêu, cụ thể line nào?" |
| "Timeline?" | (Match with internal release calendar founder đã biết) |

### 3.2 Stakeholder mapping (founder đã có sẵn)

Document trước khi pitch:

```
Decision maker:    {Name, title, founder relationship strength 1-5}
Champion:          {Name, title, why support venture}
Influencer:        {Name, title, technical input}
Blocker (potential): {Name, title, reason concern, mitigation}
Budget approver:   {Name, title, approval threshold}
Procurement:       {Name, title, approval process}
```

---

## 4. Pitch deck (employer-specific)

Per file 12 §5 + customizations:

### Slide 1 — Cover
```
{Brand}
AI Sprint Proposal for {Employer Name}
{Date}

Prepared by: {P3 + Founder name with employer-knowledge}
```

### Slide 2 — Why us, why now
```
3 reasons {Brand} is right for {Employer}:

1. INSIDER KNOWLEDGE
   {Founder name} đã 3+ năm tại {Employer}, hiểu sâu {specific systems / teams / pain}
   → Ramp time ZERO. Discovery quick.

2. TECHNICAL DEPTH
   CEO {Brand} = Data/ML + LLMOps full stack
   → Không phải vibe consulting. Eval framework + cost track + production-grade.

3. AGENT TEAM = SPEED
   13-agent pipeline ship Sprint A trong 2 tuần (vs 4-8 tuần truyền thống)
   → Less disruption, more value/$
```

### Slide 3 — The pain (specific to employer)
```
{Specific pain articulation — use insider knowledge}

Current cost / time / errors:
- {Quantified}

If solved (estimated):
- {Quantified gain — use insider data}
```

### Slide 4 — Proposed scope (Sprint A or B)
```
SPRINT {A/B} — 2-3 tuần

Phase 1: Discovery (week 1)
- Deep dive với team {X}
- Data review {dataset Y}
- Stakeholder interview ≥ 5

Phase 2: Architecture/Proposal (week 2-3)
- Recommended approach
- Technical architecture
- Cost-benefit analysis
- GO/NO-GO recommendation

DELIVERABLES:
- Discovery report (8-15 pages)
- Architecture doc
- Implementation roadmap (90-day)
- Final review meeting với leadership
```

### Slide 5 — Why this engagement, not in-house
```
INTERNAL TEAM:
- 6-12 weeks ramp + delivery (vs 2-3 tuần us)
- Opportunity cost — pull engineer khỏi current priorities
- No eval/LLMOps depth — risk ship bug to production

US:
- Pre-built MAESTRO matrix + 13 agent pipeline
- Eval framework + cost optim baked in
- Clean handoff — internal team can take over after Sprint

→ {Employer} owns the result, we own the process speed.
```

### Slide 6 — Founding Customer pricing
```
Standard list price (per file 10): $3,000-5,000

FOUNDING CUSTOMER PRICING for {Employer}:
$1,500-2,500 (50% off Sprint A)

In exchange:
- Case study quyền (anonymized OK)
- Testimonial cho website
- 6-month exclusivity trên niche của {Employer}
- 1-day in-person workshop tặng kèm

Investment: $1,500-2,500
Expected ROI: $X (savings) / $Y (revenue) per year
Payback: < 6 tuần
```

### Slide 7 — Team & accountability
```
Team:
- {P3} — Project Lead + Customer Success
- {CEO} — Technical + LLMOps
- 13 specialized agents

Working model:
- All work on {Brand}'s system (separate from {Employer}'s infra)
- All IP transfers to {Employer} on delivery (per SOW)
- Weekly status update
- Founder relationship managed transparently
```

### Slide 8 — Conflict of interest disclosure
```
TRANSPARENT DISCLOSURE:
- {Founder name} is co-founder of {Brand}
- This venture work is performed OUTSIDE work hours
- All work uses {Brand}'s separate systems and accounts
- {Employer}'s confidential information used only as needed for this project, under NDA
- Approval from {Employer leadership} obtained: {date} / {pending}

If {Employer} has any concerns, please raise immediately.
```

### Slide 9 — Next steps + Timeline
```
WEEK 1 (this week):
- Review proposal
- Q&A with team
- Approval decision

WEEK 2:
- SOW + NDA signed
- 50% deposit
- Kickoff call

WEEK 3-4:
- Sprint A delivery
- Final review
- 50% remaining + invoice

CONTACT:
- {P3 email}
- Calendly: {link}
```

---

## 5. Vendor contract structure

### 5.1 MSA (Master Service Agreement) — top-level umbrella

Template includes:
- Parties (Brand entity OR personal contractor name)
- Term: 1 year auto-renew
- Confidentiality: mutual
- IP assignment: deliverable IP transfers to Employer on payment
- Pre-existing IP: Brand retains pre-existing IP (MAESTRO, agents, eval framework)
- Subcontracting: allowed with notice
- Limitation of liability: cap at 12-month fees
- Indemnification: standard
- Termination: 30-day notice
- Jurisdiction: VN law (or applicable)

### 5.2 SOW (Statement of Work) — per project

Reference MSA, then specifics:
- Scope (deliverables enumerated)
- Timeline (milestones)
- Investment ($amount + currency + payment schedule)
- Acceptance criteria
- Project sponsor + team
- Out of scope explicit

### 5.3 NDA (Non-Disclosure Agreement) — mutual

Standard terms:
- Definition of confidential info
- Permitted uses
- Term: 3 years post-engagement
- Return / destroy data on termination
- Carve-out: information already public, independently developed

---

## 6. Conflict of interest playbook

### 6.1 Time boundary

**Rule:** Venture work TUYỆT ĐỐI không trong giờ làm của employer (e.g., 9–17h M–F).

- Venture meetings: outside hours
- Code/document: outside hours, on personal system
- If employer needs founder's time during day → it's employer's time, no venture work

### 6.2 Tool boundary

| Tool | Employer or Venture? |
|---|---|
| Laptop | Personal (venture) — separate device |
| Email | Personal email (e.g., {founder}@{brand}.com) for venture |
| Cloud storage | Brand's GitHub + Notion — separate from employer |
| Communication | Brand's Discord — separate from employer Slack |

### 6.3 Information boundary

- ❌ Employer's customer list / employee data / financial data NEVER used in venture
- ❌ Employer's proprietary tech NEVER replicated in venture
- ✅ Founder's general industry knowledge (e.g., 3PL operations) IS portable
- ✅ Founder's network connections (with their consent) IS portable

### 6.4 Decision boundary

If employer asks founder to do something at work that overlaps venture (e.g., "Can you build an AI eval framework for us internally?"):

1. Pause, do not auto-agree
2. Discuss với 2 co-founders within 24h
3. Decision: 
   - Build internal at employer (paid by employer salary, IP belongs employer)
   - OR pitch as venture vendor work (different SOW, different IP)
4. Document decision + share with employer transparency

### 6.5 If conflict arises

| Trigger | Action |
|---|---|
| Employer suspects moonlighting affecting work quality | Founder offers transparency meeting + show work hour log |
| Employer claims IP overlap | Stop venture work on that area, lawyer consult |
| Employer offers exclusivity contract | Discuss with co-founders; usually no, unless equity stake offered |
| Founder underperforming at job due to venture | Reduce venture hours, prioritize job |
| Employer terminates founder over venture | Likely venture-fail-back-to-job scenario; file 06 §8 exit plan |

---

## 7. Negotiation playbook (employer-specific)

### 7.1 Levers

Standard from file 12 §7 + employer-specific:

- **Founding Customer 50% off** (default offer)
- **Bundled retainer post-Sprint** (Sprint A + 3-month retainer = additional 10% off retainer)
- **Multi-department deal** (Sprint A for team 1 + team 2 + team 3 = volume discount 15%)
- **Annual upfront** (10% off if 12 months prepay)
- **Reference rights** (we get case study; they get exclusive niche)

### 7.2 Pushback responses

| Employer pushback | Response |
|---|---|
| "Why pay if {founder} already works here?" | "Sprint A uses {Brand}'s entire engine + agent team + 6 months of MAESTRO research, không chỉ {founder}. {Founder}'s salary chi paid for current job duties." |
| "Conflict of interest" | "Em đã prepare disclosure clear (slide 8). Có thể engage với HR/legal review nếu cần." |
| "Build in-house cheaper" | "Hiểu, em recommend Sprint A để decide build-vs-buy với data. Sau Sprint A, {Employer} có architecture + spec, in-house team có thể build. Win-win." |
| "Need procurement approval" | "Em prepare 1-page summary cho procurement (3 day turnaround typical). Hold pricing 30 days." |
| "Smaller scope first" | "Có Audit ($1K-3K) cho 1 specific use case. After Audit, decide Sprint A continue." |

### 7.3 Walk-away conditions

P3 + founder walk away nếu employer:
- Demand 100% IP including pre-existing (file 18 §5.1)
- Refuse NDA (no protection cho both sides)
- Below 50% list price (Founding Customer floor) without commensurate value
- Mandate exclusivity > 12 months without equity

---

## 8. Post-deal management

### 8.1 Delivery phase

Run per file 13 + 14 standard. Bonus:

- **Don't over-deliver** — stick to SOW. Free additional work undermines vendor pricing.
- **Document EVERY decision** — for both legal protection và case study material
- **Keep founder relationship strong** — separate from venture relationship — don't let venture stress affect job

### 8.2 Case study extraction

After delivery + 4-8 weeks:

1. P3 interview employer team (30 min)
2. Agent R-σ draft case study, anonymize as agreed
3. Employer reviews + approves
4. Publish on website + LinkedIn + share with ICP-B/C outreach

**Case study angle:**
- "How {anonymized industry leader} cut $X/year using {Brand} Sprint"
- Avoid making employer-specific too obvious

### 8.3 Expansion path

After Sprint A delivered:
- Sprint B (architecture) — usually next step
- Retainer (advisory monthly) — if ongoing AI strategy needed
- Multi-department roll-out — same Sprint cho team 2, 3
- Annual playbook subscription

Track in CRM as ICP-D account, expansion playbook per file 14 §5.

---

## 9. Failure mode planning

### 9.1 Deal doesn't close

Possible reasons:
- Employer doesn't want IP-overlap risk — KHÔNG try to convince; respect, focus other ICPs
- Budget freeze — keep door open, re-pitch quarter later
- Champion left — find new champion or wait
- Unfavorable disclosure response — restructure as "Path C anonymous"

**Action:** Don't burn bridge. Continue good employment relationship. Re-engage Q2 hoặc Q3.

### 9.2 Deal closes, employer challenges later

If 6 months later employer claims venture infringes:

1. Don't panic
2. Pull all records (`docs/decisions/employer-vendor-disclosure.md`, NDA, MSA, work hour logs)
3. Lawyer consult
4. Settle if in our favor; defend if claim baseless

**Insurance:** Clean record + transparent disclosure = strongest defense.

### 9.3 Founder leaves employer mid-engagement

If founder quit employer trong middle Sprint:

1. Inform employer immediately
2. Honor SOW terms (deliver agreed work)
3. Adjust founder role on project (no longer insider, but still co-founder Brand)
4. Re-negotiate post-Sprint relationship

---

## 10. Tóm tắt 1 trang

```
ICP-D = anchor customer Phase 1. Lowest friction, highest care needed.

PRE-FLIGHT:
  ☐ Read employment contract (non-compete? IP? moonlighting?)
  ☐ Hệ thống máy riêng confirmed
  ☐ Disclosure path chosen (A full | B at-pitch | C anonymous)
  ☐ Co-founder alignment + decision logged

PITCH DECK 9 SLIDES:
  Cover | Why us | Pain specific | Scope Sprint A/B
  Why not in-house | Founding Customer pricing | Team | Disclosure | Next steps

CONTRACT STACK:
  MSA (umbrella) + SOW (per project) + NDA (mutual)

CONFLICT BOUNDARIES:
  Time:        Venture outside 9-17h M-F
  Tool:        Personal device, separate accounts
  Information: Employer data ONLY for this project under NDA
  Decision:    Always discuss with co-founders if overlap

NEGOTIATION:
  Default: Founding Customer 50% off
  Levers: bundled retainer | multi-dept | annual upfront | reference rights
  Walk away if: 100% IP (incl pre-existing) | no NDA | < 50% floor | exclusivity > 12mo

POST-DEAL:
  Don't over-deliver | document every decision | preserve founder relationship
  Case study extraction at 4-8 weeks | Expansion: Sprint B → Retainer → Multi-dept

FAILURE MODES:
  Deal doesn't close → respect, re-engage quarter later
  Challenge 6mo later → records + lawyer + settle/defend
  Founder quit employer mid-engagement → inform, honor SOW, adjust role
```
