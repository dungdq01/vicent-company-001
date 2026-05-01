# Business Operations Handbook

**Mục đích:** Mọi thứ "non-product" cần để vận hành công ty: legal, finance, hiring, vendor, decision-making, communication norms.

**Owner:** P3 (COO) primary; CEO accountable for major decisions.

---

## 1. Legal foundation

### 1.1 Entity structure

**Phase 1 (T0–T6): Operate dưới hợp đồng cá nhân**
- Mỗi B2B project có SOW signed cá nhân giữa P3 và client
- Founder agreement + IP assignment đã ký T1 (file 06 §6.1)
- KHÔNG cần entity chính thức trong 6 tháng đầu — defer cost + complexity

**Phase 2 (T6+): Quyết định entity**

| Option | Pros | Cons | When |
|---|---|---|---|
| Hộ kinh doanh VN | Cheap, fast, simple tax | Limited liability, không scale | Nếu MRR < $10K, focus VN only |
| Công ty TNHH VN | Full liability protection, có VAT | Setup ~2-4 tuần, ~$300, ongoing accounting cost | Default cho VN B2B |
| Singapore Pte Ltd | Global SaaS friendly, banking, USD | $1-2K setup, $1K/year compliance | Nếu ICP-E global > 30% revenue |
| Delaware C-Corp | VC fundraising path, US ICP | $500-1K setup, complex tax | Nếu raise VC year 2+ |

**Recommend:** Công ty TNHH VN T7-T9 khi MRR > $5K → switch Singapore Pte Ltd nếu global scale T18+.

### 1.2 Required contracts (templates)

Maintain trong `docs/legal/templates/`:

1. **Founder agreement** — equity split + vesting + IP assignment + dispute resolution
2. **Master Service Agreement (MSA)** — umbrella terms cho B2B clients
3. **Statement of Work (SOW)** — per-project scope + price + timeline
4. **NDA — mutual** — bilateral confidentiality
5. **NDA — one-way** — when reviewing client's IP
6. **Independent Contractor Agreement** — cho freelance MMO + future contractors
7. **Privacy Policy** — for website + product (EN+VI)
8. **Terms of Service** — for digital products + SaaS later
9. **Refund Policy** — embedded trong ToS, link từ checkout
10. **Code of Conduct** — for OSS repo + Discord community

**Generation strategy:**
- Use AI (Claude) draft → lawyer review (1-2h consult ~$200) → finalize
- Template gốc: openly licensed (Stripe ATLAS, YC SAFE templates) → adapt VN

### 1.3 IP protection

- **Founder agreement** mandates ALL IP created during venture work belongs to venture
- **Hệ thống máy riêng** (đã confirm) → tránh xung đột với employer current
- **Document trail**: every commit, doc, design có author + date trong Git/Notion
- **Trademark filing**: T9+ khi brand traction (file 11 §8.3) — VN + Singapore

### 1.4 Data privacy

| Risk | Mitigation |
|---|---|
| Client data leak | Encrypt at rest (Phase 2+), limit access to need-to-know |
| Personal data VN (Decree 13/2023) | Privacy notice, consent capture, data residency thinking |
| GDPR (if EU client) | Data Processing Agreement template ready |
| Client confidential code/data sharing | Mutual NDA before any code/data shared |

**Phase 1 simple rule:** Don't store client PII unless absolutely needed; if needed, encrypt.

---

## 2. Financial operations

### 2.1 Accounts setup

| Account | Purpose | Provider |
|---|---|---|
| Bank VND business | Receive VND payments + expenses | TPBank / VPBank / Techcombank |
| Wise multi-currency | Receive USD, hold EUR/SGD, FX | Wise.com |
| Stripe (Atlas later) | Online payments USD | Stripe.com |
| Payoneer (backup) | Receive from clients on Payoneer | Payoneer |
| Crypto (optional, M6+) | Hedge VND + ICP-E global | USDC trên Coinbase / Kraken |

### 2.2 Invoicing

**Tool:** Stripe (one-click for online), Wise (manual for B2B), Notion template (Vietnam VND clients).

**Invoice format:**

```
INVOICE — {Brand}
Invoice #: INV-2026-0001
Issue date: 2026-04-26
Due date: 2026-05-03 (NET-7)

Bill to:
{Client name}
{Address}
{Tax ID nếu VN}

For:
{Project name}
SOW signed: 2026-04-15

Item                                          Amount
----                                          ------
Sprint A — Deposit (50%)                     $1,500.00
                                              --------
Subtotal                                      $1,500.00
VAT (8%, VN clients only)                       $120.00
                                              --------
TOTAL                                         $1,620.00

Payment instructions:
- Wise: {account}
- VND bank: {account, branch, holder}
- Memo: INV-2026-0001

Late: 5% fee after 14 days (per file 10 §8)
```

### 2.3 Expense tracking

**Tool:** Notion table (Phase 1) → QuickBooks/Xero (Phase 2 when entity formed).

**Categories:**
- API costs (Anthropic, OpenAI fallback) — biggest variable cost
- Tools/subscriptions (Helicone, Beehiiv, Notion, GitHub, Claude Code)
- Content gear (camera, mic, lighting — one-time)
- Freelance (MMO content creator, occasional editor)
- Legal (lawyer consults, trademark, contract review)
- Marketing (paid ads Phase 2, sponsorships)
- Travel (founder community events, meetups)
- Office (none Phase 1 — work from home)

**Receipt rule:** Every expense > $20 → receipt scanned to Notion attachment. Below $20 → entry only.

### 2.4 Cash flow management

**Phase 1 monthly P&L target:**

| Item | M1 | M3 | M6 |
|---|---|---|---|
| Revenue | $200 | $1,000 | $4,500 |
| API costs | $300 | $400 | $500 |
| Tools | $100 | $150 | $200 |
| Freelance MMO | $0 | $400 | $400 |
| Other | $50 | $100 | $200 |
| **Net** | **-$250** | **-$50** | **+$3,200** |

**Cash position target T6:** +$2,000 (cumulative net positive after first 6 months).

**Burn allocation:**
- Founder personal money fund: equal split 1/3 each, OR 1 founder funds all + extra equity (file 06 §6.4)
- Track who advanced what trong `docs/finance/burn-tracker.md`
- Settle with revenue when cash positive

### 2.5 Tax obligations VN

**Personal income tax** (Phase 1, no entity):
- Each founder declares income from venture as personal income
- File annual VN PIT return; brackets 5–35%

**Corporate tax** (Phase 2, with entity):
- VN TNHH: 20% on profit
- Quarterly tax filings
- Hire bookkeeper/accountant ~$100-200/month when entity formed

**VAT:**
- VN B2B with company entity: 8% on services
- Issue VAT invoice (e-invoice required from 2026)
- Quarterly VAT filing

**International payments:**
- Wise/Stripe USD income: declare under foreign income
- 5% advance personal income tax on inflows

### 2.6 Founder compensation (file 06 §6.3 reference)

| MRR threshold | Action |
|---|---|
| < $5K | No salary; cumulative track for later payback |
| $5K–10K | $500/month per full-time founder (CEO if dedicated) |
| $10K–20K | $1K/month per full-time founder |
| $20K–40K | $1.5K/month + 1 founder full-time |
| > $40K | $2-3K/month + all 3 founders full-time |

---

## 3. Hiring playbook

### 3.1 When to hire (file 03 §7 reference)

| Trigger | Hire | Type |
|---|---|---|
| Founder content output < 5 video/tuần for 4 weeks | Part-time editor | Freelance $300-500/mo |
| TikTok MMO niche needs creation | Freelance MMO content creator | Retainer $300-500/mo |
| B2B inbound > 12 leads/month, 2/3 not replied < 48h | BD/Sales associate | Part-time $1K/mo or hourly |
| Engine WIP backlog > 4 weeks (T9+) | Junior dev | Full-time $1.5-2K/mo VN remote |
| MRR > $25K + 5+ active customer | Customer success specialist | Full-time $1-1.5K/mo |
| MRR > $40K | Senior engineer | Full-time $2.5-4K/mo |

### 3.2 JD template

```markdown
# {Role} — {Brand}

## About us
{1 paragraph — venture mission + traction}

## Role
{2-3 sentence what they'll do}

## You'll own
- {3-5 specific outcomes}

## You're a fit if
- {3-5 skills/experience}
- {culture fit — async, ownership, ship-fast}

## Bonus
- {2-3 nice-to-have}

## Compensation
- ${X-Y}/month (VND/USD remote VN)
- Equity (if full-time, 0.1-1% per file 06 §6.1)
- Tools + learning budget $100/month

## How to apply
- Email {address} với:
  1. 1-page intro (who you are, why interested)
  2. 1 example of your work (link)
  3. Earliest start date
- We respond within 7 days

## Process
1. Async writing test (paid, 4h, $50)
2. 1h call with P3
3. 1h technical with CEO/P2
4. Reference check
5. 30-day paid trial
```

### 3.3 Hiring filters

**Always require (no exception):**
- Async writing test paid (filter for clear writers)
- 30-day paid trial period
- Reference check

**Look for:**
- Ship history (GitHub, portfolio, link to actual shipped work)
- Self-direction (worked remote/async before)
- Vietnamese OR English fluent (depending on role)

**Red flags:**
- "Will do anything"
- No code/portfolio examples
- Asks for full salary upfront
- Not OK with paid trial

### 3.4 Onboarding new hire

**Day 0:**
- Equipment list (own laptop required Phase 1)
- Discord + Notion access
- Reading: file 01-08 + memory

**Day 1-7:**
- Pair với founder daily 1h
- Ship 1 small thing by Day 7 (tiny PR, draft post, etc.)
- Daily standup async like founders

**Day 30:**
- Trial review — keep / extend / part ways
- If keep, sign formal contract + equity (if applicable)

### 3.5 Performance review

**Cadence:** Quarterly for full-time, Monthly for trial period.

**Format (file 06 §9):** Self-review template + 1-1 with manager (CEO or P3).

**No PIP (Performance Improvement Plan) before T18** — cứ part ways gọn nếu không fit. Small team không kham PIP.

---

## 4. Vendor management

### 4.1 Vendor list Phase 1

| Vendor | Service | Cost | Owner |
|---|---|---|---|
| Anthropic | LLM API | $300-500/mo | CEO |
| OpenAI | Fallback LLM | $50/mo | CEO |
| Helicone | LLM observability | $0-50/mo | CEO |
| GitHub | Code + CI | $4/user (Pro) | P2 |
| Vercel | Hosting | $0-20/mo | P2 |
| Cloudflare | DNS, CDN | $0-20/mo | P2 |
| Notion | Wiki + project | $10-15/mo | P3 |
| Beehiiv/Substack | Newsletter | $0-30/mo | CEO |
| Wise | International payments | ~1% FX | P3 |
| Stripe | Online payments | 2.9% + $0.30 | P3 |
| Domain registrar | Namecheap/Cloudflare | $30/year | CEO |
| Calendly | Scheduling | $10/mo | P3 |
| Loom | Video record | $0-10/mo | All |
| Discord | Communication | $0 | P3 |
| Canva Pro | Design assets | $13/mo | P3 |

**Total Phase 1: ~$500-700/month** (heavy on API).

### 4.2 Vendor selection rules

- ❌ Never choose vendor that locks data (must allow export)
- ❌ Never sign annual upfront for new vendor (monthly first)
- ✅ Prefer vendors with VN local payment options
- ✅ Prefer open-source alternatives where viable (Helicone OSS option, Plausible vs GA)

### 4.3 Vendor review

Quarterly: P3 reviews vendor list, flag any with low usage, cancel.

---

## 5. Decision-making framework

### 5.1 Decision types

| Type | Owner | Process |
|---|---|---|
| **Strategic** (pivot, hire senior, new ICP) | CEO | All 3 founders consensus, written |
| **Product** (new feature, product line) | CEO | CEO + 1 cánh tay opinion, written |
| **Operations** (vendor, tool, process) | P3 | P3 owns, CEO informed |
| **Finance** (>$1K spend, equity grant) | All 3 | Written approval all 3 |
| **Sales** (deal terms, custom pricing) | P3 | P3 owns, CEO consult if outside file 10 |
| **Engineering** (stack, architecture) | P2 | P2 owns, CEO consult if AI/LLMOps |
| **Hiring** (full-time) | All 3 | Written approval all 3 |
| **Hiring** (freelance/contract <3mo) | P3 | P3 owns, informed others |

### 5.2 Disagree-and-commit rule

If 2 founders disagree:
1. State positions written (in `meta/decisions.md`)
2. Each gives strongest argument (10 min limit)
3. Discuss 30 min
4. **CEO has final tiebreaker** (CEO is decider, not voter)
5. After decision: both commit fully, no second-guessing for 4 weeks

### 5.3 Decision log

`docs/decisions/` directory với 1 file per significant decision:

```markdown
# Decision: {Title}
Date: 2026-04-26
Owner: {founder}
Status: Decided / Pending / Reversed

## Context
{What's the situation requiring decision}

## Options considered
1. ...
2. ...
3. ...

## Decision
{What we chose}

## Rationale
{Why}

## Consequences (positive)
{Expected upsides}

## Consequences (negative)
{Accepted downsides}

## Reversal trigger
{What would make us reconsider}

## Sign-off
- CEO: {date}
- P2: {date} (if applicable)
- P3: {date} (if applicable)
```

---

## 6. Communication norms

### 6.1 Channels

| Channel | Purpose |
|---|---|
| Discord #standup | Daily 3-line update |
| Discord #ship-log | When you ship something |
| Discord #general | Casual chat, links |
| Discord #ai-news | AI news (1 founder posts max 3/week — anti-FOMO file 06 §7.3) |
| Discord #client-{name} | Per-client async |
| Notion | All deliverables, project tracking |
| Email | Formal (SOW, invoice, sign-off) |
| Calls | Weekly Friday 30 min internal + 30 min per active client |

### 6.2 Response time SLA (internal)

| Type | Response |
|---|---|
| Standup | Daily 09:00 |
| Slack/Discord question | Same day business hours |
| Decision needed | Within 48h |
| Critical (P0 incident) | Within 1h |

### 6.3 Async writing standards

- **Write decisions, not chat** — important info goes in Notion, not Discord
- **Default to writing** — only call when truly needed
- **Use code blocks for code/technical** — formatting matters
- **Headers for posts > 200 words**
- **Voice notes OK** for casual/exploratory (Discord supports)

### 6.4 Meetings

- **Default no meeting** — every meeting must have agenda + outcome
- **Max 60 min** — beyond that, split into 2
- **Cameras on** — for human connection
- **Record + summarize** — anyone absent can catch up

---

## 7. Tool usage standards

### 7.1 Notion structure

```
Notion workspace:
├── 🏠 Home (dashboard, key links)
├── 📋 Projects (per-customer page)
├── 📊 KPIs (weekly + monthly tracker)
├── 👥 CRM (sales pipeline)
├── 💰 Finance (invoices, expenses)
├── 📚 Wiki (this folder = files 01-18 imported)
├── 🤝 Vendors (list + status)
├── 📝 Decisions (log)
└── 🔄 Retros (weekly + monthly + project)
```

### 7.2 GitHub structure

```
github.com/{brand}/
├── maestro-monorepo (private)
│   ├── apps/orchestrator
│   ├── apps/dashboard
│   ├── packages/agents
│   ├── data/baselines
│   ├── data/industries
│   ├── docs/projects
│   ├── docs/memory
│   └── evals
├── prompt-eval-framework (public, OSS)
└── awesome-vietnamese-llm (public, optional)
```

### 7.3 File naming

- **Markdown:** `kebab-case.md`
- **Folders:** `kebab-case/`
- **Per-project:** `P-{YYYYMM}-{NNN}/`
- **Date in filename:** `YYYY-MM-DD-{topic}.md`
- **Versions:** `v1.0`, `v1.1` (semver)

---

## 8. Risk management

### 8.1 Risk register

P3 maintains `docs/risks/register.md`:

| Risk | Likelihood | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|---|
| Anthropic API outage > 4h | Low | High | OpenAI fallback ready | CEO | Active |
| Lose key client | Med | High | Diversify ICP, no single client > 30% revenue | P3 | Active |
| Founder burnout | Med | High | Saturday off, monthly 1-1 (file 06 §5) | All | Active |
| Founder quit | Low | Critical | Vesting cliff, founder agreement | All | Active |
| Employer challenge IP | Low | Critical | Hệ thống riêng, document trail | CEO | Active |
| OSS repo zero traction | Med | Med | Reposition, dev.to crosspost | CEO | Active |

### 8.2 Incident response

**P0 incident:** Service outage, data loss, security breach, key client unhappy

1. **Detect** — alert from monitoring OR direct report
2. **Triage** — within 15 min, severity assigned
3. **Mitigate** — within 1h, take action to stop bleeding
4. **Communicate** — within 2h, message to affected stakeholders
5. **Resolve** — within 24h
6. **Post-mortem** — within 7 days, written, learnings → MAESTRO memory

### 8.3 Backup + DR

- Code: GitHub (cloud)
- Documents: Notion (cloud) + monthly Markdown export to local
- Customer data: Encrypted at rest (Phase 2)
- Disaster: If 1 founder loses laptop → can recover from cloud within 1 day

---

## 9. Quarterly business review (internal)

End of each quarter (M3, M6, M9, M12, M15, M18):

**P3 facilitates 2-hour session:**

1. **Numbers review** (30 min) — KPI vs target từ file 03
2. **Wins** (15 min) — celebrate top 3
3. **Losses** (15 min) — name top 3 + lessons
4. **Strategy check** (30 min) — file 01 still right?
5. **Process check** (15 min) — file 13/14/15 working?
6. **Next quarter top 3 priorities** (15 min)

**Output:** `docs/retros/Q{N}.md`

---

## 10. Tóm tắt 1 trang

```
ENTITY: Phase 1 personal contract → Phase 2 (T7+) TNHH VN → Phase 3+ Singapore Pte Ltd if global

LEGAL TEMPLATES needed: Founder Agreement | MSA | SOW | NDA mutual/one-way | 
                        Contractor Agreement | Privacy Policy | ToS | Refund | Code of Conduct

FINANCE:
  Accounts: VND bank + Wise + Stripe + Payoneer
  Invoicing: NET-7, late fee 5% after 14 days
  Tax: Personal PIT Phase 1 → Corp tax + VAT 8% Phase 2
  Founder salary trigger: $5K MRR=$500/mo, $10K=$1K, $20K=$1.5K, $40K=$2-3K

HIRING TRIGGERS:
  Content output low → freelance editor $300-500/mo
  B2B inbound > 12/mo unmanaged → BD part-time
  Engine backlog > 4 weeks → junior dev (T9+)
  MRR > $25K → CS specialist
  MRR > $40K → senior engineer

DECISION FRAMEWORK:
  Strategic → CEO + consensus
  Product → CEO + 1 opinion
  Ops → P3 owns
  Finance > $1K → all 3 written approval
  Disagree → 30-min discuss → CEO tiebreaker → commit 4 weeks

VENDOR PHASE 1: ~$500-700/mo (Anthropic biggest)

RISK REGISTER + INCIDENT RESPONSE: P3 owns, quarterly review

QUARTERLY BUSINESS REVIEW: 2h, numbers + wins + losses + strategy + next-quarter priorities
```
