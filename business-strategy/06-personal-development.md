# Personal Development — Phát Triển Bản Thân 3 Founders

**Mục đích:** Trả lời câu hỏi *"Sau 18 tháng dự án, mỗi founder trở thành AI trên thị trường?"* — không chỉ là *"venture có tiền hay không"*. Đây là file quan trọng nhất nếu dự án fail (xác suất ~70%): nếu founder grow đúng, fail vẫn là win cá nhân. Nếu founder không grow, fail = mất 18 tháng.

**Quy tắc vàng:** *"Đo dự án bằng skill depth gained, không chỉ MRR."*

---

## 1. Triết lý phát triển

### 1.1 Asymmetric bet

Profile team hiện tại:
- 20-27 tuổi, chưa gia đình
- AI Developer / Tech FS / AI-ML — đều có tech foundation
- Có 6+ tháng tiết kiệm
- Thị trường VN thiếu AI engineer trầm trọng (2026 demand cao gấp 5 lần supply)

→ **Downside thấp hơn 95% founder khác**. Dù venture fail T18, mỗi founder vẫn kiếm được job AI Engineer $1.5–4K/tháng trong 2–4 tuần.

→ **Hàm ý chiến lược**: 18 tháng này không phải *"betting your life"*, mà là **mua khoá học AI Engineering không trường nào dạy được** với cost = opportunity cost lương junior.

### 1.2 Nguyên tắc

1. **Identity > MRR** — sau 18 tháng phải là *"ai đó cụ thể"*, không phải *"cựu founder không output visible"*
2. **Public > Private** — code, blog, talk đều public; chống "gap year invisible" trên CV
3. **Compound > Sprint** — học hằng ngày, ship hằng tuần, review hằng quý
4. **Anti-FOMO** — chọn stack, khoá nó, không chạy theo trend

---

## 2. Identity goals — Mỗi founder T18

### 2.1 P1 — CEO / LLMOps Lead / ML Baselines Owner

**Background hiện tại:** Data/ML Engineer + LLMOps + web bổ trợ. Đây là **rare combo** — combine ML model depth với production ops depth, cộng web để self-serve full-stack.

**Identity T18:** *"Technical CEO + LLMOps authority VN — đã ship multi-agent system production grade, OSS eval framework 500+ stars, 5+ technical talks (HN/PH/meetup AI VN), 30+ deep technical post bilingual EN/VI. Recognized as 'người thật làm AI ops, không phải vibe consultant'."*

**Skill depth target:**
- **Primary**: LLMOps full stack (eval framework, prompt versioning, cost optim, memory hygiene, failure mode analysis) — own toàn bộ file 07 §4–§9
- **Secondary**: ML baseline depth (B01 Forecasting, B05 Recommendation, B07 Anomaly, B12 RAG) — personal validation các model choice trong project
- **Tertiary**: Technical content production (YouTube long-form, deep blog) + B2B engineering buyer conversation

**Tránh trap**:
- ❌ Bị kéo vào MMO content production khi P3 hoặc co-founder khác làm tốt hơn — CEO time là LLMOps moat, không phải hook 3-giây
- ❌ Outsource eval/cost cho P3 vì "không có thời gian" — đó chính là moat, mất rồi venture chỉ là agency thường
- ❌ Web stack rabbit hole — web là bổ trợ, đừng compete với P2 ở đó

**Phân vai khác file 07 §17 cũ:** P1 OWN prompts + eval + memory + cost (không phải P3). P3 chuyển sang Domain depth + Sales/Content business voice. P2 vẫn Engine + tooling + integration.

### 2.2 P2 — E-commerce Vertical Lead / Engine Lead

**Identity T18:** *"Senior AI Engineer đã build multi-agent orchestration system production-grade từ scratch, 1 OSS project 500+ stars, 1 conference talk, integrate AI vào 5+ e-commerce stack."*

**Skill depth target:**
- **Primary**: Backend orchestration (Next.js API, SSE streaming, state machine, queue, checkpoint)
- **Secondary**: Frontend dashboard real-time (React, Tailwind, shadcn, Zustand)
- **Tertiary**: E-commerce platform integration (Shopee API, TikTok Shop API, Shopify)

**Tránh trap**: over-engineer. Engine MVP **xấu nhưng chạy** > engine đẹp ship trễ T6.

### 2.3 P3 — COO / Business Solution Lead / Customer Success Lead

**Background hiện tại:** Business Solution + COO mindset. Hiểu sâu bài toán doanh nghiệp, sales process, project ops. KHÔNG phải prompt engineer (đó là CEO/P1).

**Identity T18:** *"COO + Business Solution authority B2B AI VN — đã đóng 12+ deal B2B Logistic/E-com, run delivery cho 6+ paying client, có 5+ case study published, 3 talk VLA/VECOM/founder event. Recognized là 'người hiểu vừa AI vừa business pain' — bridge giữa CEO technical và client decision maker."*

**Skill depth target:**
- **Primary**: Sales + Customer Success B2B (discovery call, scoping, contract, delivery PM, account expand)
- **Secondary**: Domain SME (Logistics + E-com + Employer ngành) — supply business context cho CEO instrumenting prompt
- **Tertiary**: Business operations (hire pipeline, billing, vendor, legal entity ops)
- **Quaternary**: B2B content voice (LinkedIn long-form, founder community, niche audit reports)

**Tránh trap**:
- ❌ Bị kéo vào prompt engineering systematic — đó là CEO; P3 supply business context, không tự ngồi tune prompt
- ❌ Bị kéo vào code review hay engine architecture — đó là P2/CEO
- ❌ MMO TikTok hook content — voice business không match niche MMO; phải hire freelance hoặc skip
- ❌ Làm research thuần lý thuyết về Logistics — phải translate domain knowledge thành sales pitch + business context cho agent

**Strategic value:** CEO + P2 đều technical → P3 là **bridge duy nhất tới khách hàng business**. Không có P3, B2B sales fail. P3 là người duy nhất có thể đóng deal $5K–15K với COO 3PL không hiểu LLM là gì.

---

## 3. Self-curriculum — Q1 → Q6

### Q1 (T1–3): Foundation — Agent Orchestration Patterns

| Founder | Topic | Output |
|---|---|---|
| P1 (CEO/LLMOps) | Eval framework design, prompt versioning Git workflow, cost optim (cache + routing), Anthropic agent patterns | Eval framework v1 + 3 technical blog post (EN+VI) + cost baseline doc |
| P2 (Engine) | Claude API mastery (streaming, tools, SSE), state machine impl, Next.js orchestrator | Engine MVP ship + 1 architecture post |
| P3 (COO/Business) | Sales playbook (discovery, scoping, objection handling), B2B content (LinkedIn, niche audit), domain SME for Logistic+E-com (supply context to CEO) | Sales playbook v1 + 1 niche audit report shipped + first paying B2B client |

**Reading list Q1 (chung)**:
- Anthropic "Building effective agents" (2024)
- "The Prompt Report" (Schulhoff et al, 2024)
- LangChain/LangGraph docs
- Sequoia agent talks

### Q2 (T4–6): Productionize — Eval + Cost

| Founder | Topic | Output |
|---|---|---|
| P1 | Agent eval framework (LLM-as-judge, golden dataset, regression test) | Eval suite for 3 agent (R-α, R-γ, R-σ) |
| P2 | Production patterns: caching, retry, idempotency, observability (Helicone/Langfuse) | Engine v1 with monitoring |
| P3 | Prompt cost optimization, model routing (Sonnet vs Haiku decision tree) | Reduce cost/run from $10 → $3 |

### Q3 (T7–9): Specialization

| Founder | Topic | Output |
|---|---|---|
| P1 | Content pipeline automation (script gen + B-roll + voiceover with AI) | TikTok automation 50% by AI |
| P2 | Multi-tenant architecture (auth, isolation, billing) | Engine v1.5 multi-tenant ready |
| P3 | RAG advanced (hybrid search, re-ranking, knowledge graph retrieval) | MAESTRO retrieval API spec |

### Q4 (T10–12): Distribution & Scale

| Founder | Topic | Output |
|---|---|---|
| P1 | Community building (Discord/Telegram), course delivery (cohort design) | Course launch v1 + 50 students |
| P2 | API design + developer experience (SDK, docs) | Public API beta |
| P3 | Industry depth — 1 vertical playbook (Logistic) | Industry Playbook subscription product |

### Q5–6 (T13–18): Public Authority

Mỗi founder chọn 1 trong 3 path tuỳ tình hình T12:
- **Path Subscription**: P1 lead, deep community + content
- **Path B2B Vertical**: P3 lead, deep Logistic + Playbook subscription
- **Path Platform**: P2 lead, white-label + API

Tất cả: 1 talk public + 1 blog viral + 1 OSS contribution.

---

## 4. Public output — Chống "Gap Year Invisible"

### 4.1 Quy tắc Public-by-Default

Mọi thứ build trong venture nên có **phiên bản public** (không lộ IP):
- Engine architecture → blog post (không show prompt cụ thể)
- Eval framework → OSS repo (skeleton, không có golden data thật)
- MAESTRO matrix structure → public read-only (không show Industry deep node)
- Pipeline learnings → memory file public (anonymized)

### 4.2 Output target per founder

| Output | T6 | T12 | T18 |
|---|---|---|---|
| Blog post (technical, EN+VI) | 3 | 12 | 30 |
| GitHub repo public | 1 | 2 | 3+ |
| GitHub stars (1 main repo) | 50 | 200 | 500+ |
| Meetup talk VN | 0 | 1 | 3 |
| Podcast appearance | 0 | 1 | 3 |
| LinkedIn followers | 1K | 3K | 8K |
| Twitter/X (T9+) | — | 500 | 3K |

### 4.3 OSS strategy

**Repo công khai** (1 main per founder, nhỏ nhưng deep):
- **P1 (CEO/LLMOps): `prompt-eval-framework`** — eval harness for multi-agent pipeline. ĐÂY LÀ REPO MOAT. Bilingual README EN/VI. Target 500–2K stars trong 12 tháng. Hacker News + Product Hunt launch khi v1.0.
- P2: `nextjs-agent-engine-skeleton` — open template orchestrator, không có MAESTRO data
- P3: `vietnamese-industry-prompt-pack` — case study few-shot patterns cho 3PL/E-com VN

→ Mỗi repo **chỉ subset của internal** — public 30%, giữ 70% IP. Đủ để build authority + dev hiring funnel, không leak moat.

---

## 5. Mental health protocol

### 5.1 Daily routine — Non-negotiable

| Time | Activity | Rationale |
|---|---|---|
| 06:30 | Wake | Founder ngủ loạn = quyết định tồi |
| 07:00 | Workout 30' | Endorphin chống depression |
| 08:00 | Deep work block 1 (3h) | Single-task, không Slack |
| 12:00 | Lunch + walk | Stop screen 1h |
| 13:00 | Deep work block 2 (3h) | |
| 17:00 | Standup async | |
| 18:00 | Stop work | Hard boundary |
| 22:30 | Sleep | 8h ngủ |

**Rule**: founder break routine 3 ngày liên tiếp → flag in standup, 1 founder khác kiểm tra.

### 5.2 Weekly rituals

- **Sunday — Win log**: viết 3 thứ tuần này làm tốt (dù nhỏ). Lưu file `06-memory/weekly-wins/{founder}/{date}.md`
- **Friday — Public progress**: post 1 update build-in-public (TikTok hoặc Threads). External accountability + content asset
- **Saturday — Off**: 1 ngày KHÔNG đụng laptop. Xem phim, chơi sport, gặp bạn ngoài venture

### 5.3 Monthly rituals

- **1-1 founder pair**: mỗi pair (P1-P2, P2-P3, P1-P3) 30 phút, không có founder thứ 3. Topic: relationship, không phải work
- **External mentor 1h**: 1 senior 5–10 năm exp (không bắt buộc cùng ngành). Trade: mentor ăn coffee, founder kể lại, mentor challenge

### 5.4 Quarterly retro

- **Self review** (mỗi founder, async): bản thân tuần này grow gì, dự án tuần này grow gì, mismatch nào
- **Team retro** (3 founders + optional advisor): keep / drop / try
- **Curriculum check**: Q hiện tại đã hoàn thành topic chưa? Q sau plan gì?

### 5.5 Red flag — Trigger to act

| Symptom | Action |
|---|---|
| Lo lắng mỗi sáng mở máy tính (1 tuần liên tiếp) | Báo team, lấy 2 ngày off |
| So sánh với bạn bè đi làm thuê (3 lần/tuần) | Stop reading startup news 1 tháng |
| Mọi pivot đều nghe hợp lý (3 ý tưởng pivot/tuần) | Lock decision với 2 founder kia, không pivot 4 tuần |
| Mất động lực content 2 tuần | Đổi format content hoặc lấy 1 founder khác làm thay 1 tuần |
| Đêm không ngủ vì project (3 đêm liên tiếp) | Pause Slack/Discord notifications sau 21:00 |
| Cãi nhau co-founder 2 lần/tuần | Trigger 1-1 ngay, không chờ lịch monthly |

### 5.6 Anti-comparison rules

- **KHÔNG đọc startup VN funding news** trong 6 tháng đầu (Base, VinAI, Sky Mavis announcements)
- **KHÔNG dùng** "X anh A đã có exit" làm benchmark
- Benchmark duy nhất: **bản thân 3 tháng trước** + **curriculum Q hiện tại**
- Nếu lỡ thấy news → 5 phút thiền, viết xuống "tôi đang build cho 18 tháng, không 18 ngày"

---

## 6. Personal finance per founder

### 6.1 Equity split — Chốt T0, không T6

**Đề xuất starting**:
- Founder hiện đang work full-time tại employer (sẽ nghỉ T9–12): 30%
- Founder hiện đang full-time venture (đốt tiết kiệm cá nhân): 35–40%
- Founder thứ 3: 25–30%

**Vesting**: 4 năm, cliff 1 năm, monthly vesting sau cliff. Standard Silicon Valley, bảo vệ cả 3 bên nếu 1 người quit T6.

**Founder agreement** ký giấy T1, có công chứng. KHÔNG verbal.

### 6.2 Tiền ăn 6 tháng đầu

**3 nguồn có thể**:
1. Mỗi founder tự ăn tiết kiệm cá nhân (default — nếu mỗi người có ≥6 tháng runway)
2. 1 founder fund tất cả + tăng equity
3. Hùn quỹ chung 50/30/20 theo equity → ăn quỹ này

**Khuyến nghị**: Option 1 — đơn giản, tránh xung đột tiền sớm. Tiền cá nhân cá nhân tự lo.

### 6.3 Khi nào founder rút lương

Trigger rút lương từ venture cash:
- **MRR > $5K**: founder dành full-time 100% có thể rút $500/tháng
- **MRR > $10K**: rút $1K/tháng
- **MRR > $20K**: rút $1.5–2K/tháng + 1 founder nghỉ employer
- **MRR > $40K**: 3 founders full-time + lương $2–3K/tháng

**KHÔNG** rút lương nếu MRR < $5K — bị kẹt cash flow.

### 6.4 Burn share

Chi phí venture (API, hosting, tools, content gear) chia 3 đều **trừ khi** equity khác đáng kể (ai 40% trả 40%).

Track ở 1 file `00-memory/burn-tracker.md` — ai đã advance bao nhiêu, settle khi có cash.

### 6.5 Personal runway minimum

**Mỗi founder phải duy trì** runway cá nhân ≥ 3 tháng (tiền ăn + nhà + transport, không kể venture).

**Nếu cá nhân < 3 tháng runway** → trigger:
- Tìm 1–2 ngày/tuần freelance ($40–80/h AI dev VN)
- Hoặc xin loan từ family
- KHÔNG borrow cash từ co-founder (mix tiền = mix vai trò)

---

## 7. Anti-FOMO rules

### 7.1 Stack lock — 6 tháng đầu

```
Frontend:  Next.js 16 + React 19 + Tailwind + shadcn
Backend:   Next.js API + SSE
AI API:    Claude (Sonnet 4 default, Haiku for cheap tasks)
DB:        File system + JSON (Phase 1) → Postgres (Phase 2)
State:     Zustand (client) + in-memory (server)
Deploy:    Vercel
```

**Rule**: tháng 1–6 KHÔNG đổi 1 dòng nào ở stack này. Thấy framework mới hot → ghi `00-memory/parking-lot.md` "review tháng 7".

### 7.2 Feature lock — Mỗi sprint

- Sprint planning thứ 2: chốt 3 feature, không hơn
- Giữa sprint nếu thấy idea mới → ghi parking lot, không add vào sprint
- Sprint review thứ 6: ship hoặc cut, không carryover

### 7.3 Reading discipline

- **Allowed daily**: Anthropic blog, OpenAI changelog, 1 newsletter (chọn duy nhất, vd: TLDR AI hoặc Last Week in AI)
- **Not allowed daily**: Twitter (block tab 9-18h), VN startup news, "AI agent X just launched" content
- **Allowed weekly** (Saturday afternoon, 1h limit): scroll Twitter, đọc Substack, xem demo video — chỉ để aware, không action

### 7.4 Pivot lock

**KHÔNG pivot strategy** trong 4 tháng đầu trừ khi 1 trong 3 trigger:
1. Engine không build được sau 8 tuần (technical impossible)
2. 0 audience growth sau 8 tuần (>30 video, <100 followers)
3. 1 founder quit

Mọi "ý tưởng pivot" khác → ghi parking lot, review T4.

---

## 8. Exit plan — Nếu venture fail T18

### 8.1 Probability check

Realistic outcome distribution:
- **5%**: home run ($50K+ MRR T18, raise hoặc continue solo)
- **15%**: solid (≥$25K MRR, sustain 3 founders fulltime)
- **30%**: lifestyle (≥$5K MRR, 1–2 founder fulltime)
- **30%**: small win (1 founder làm side, 2 founder back to job)
- **20%**: total fail (close venture)

→ **65% trường hợp ≥1 founder phải back to job T18+**. Phải plan trước.

### 8.2 Re-employability checklist per founder

Khi apply job T18 (nếu fail), mỗi founder cần show được:

**Tier 1 — Must have**:
- [ ] 1 GitHub repo public ≥100 stars
- [ ] 5+ blog post technical (EN ưu tiên)
- [ ] LinkedIn updated với "Founder MAESTRO Studio (T0–T18) — built X, shipped Y, learned Z"
- [ ] 2–3 client testimonial / quote (anonymized OK)
- [ ] Concrete system shipped (engine, demo, OSS)

**Tier 2 — Bonus**:
- [ ] 1 talk public (meetup VN, online conference)
- [ ] 1 podcast appearance
- [ ] 1 OSS contribution to known project (Anthropic SDK, LangChain, etc.)

### 8.3 Job market positioning T18

| Founder | Role target | Lương expect (VN remote) | Lương expect (global remote) |
|---|---|---|---|
| P1 | AI Product Manager / AI Lead | $2–4K/mo | $4–8K/mo |
| P2 | Senior AI Engineer / Tech Lead | $2.5–5K/mo | $5–10K/mo |
| P3 | AI/ML Engineer Specialist (Logistics or Prompt Eng) | $2.5–5K/mo | $5–10K/mo |

→ **Nếu output public ở §4.2 đủ**, mỗi founder kiếm offer trong 2–4 tuần.

### 8.4 Anti-pattern khi fail

KHÔNG làm:
- Giấu founder gap, edit CV thành "consultant"
- Làm tiếp 6 tháng nữa "biết đâu vực dậy" — sunk cost fallacy
- Cắt equity rẻ cho 1 acquirer chỉ để "escape" — đốt 18 tháng cho < 5K

NÊN làm:
- Open source toàn bộ engine + content → maximum public asset
- Viết 1 post mortem detailed (1500–3000 từ) public
- Apply 5 job concurrent, take best offer trong 1 tháng
- Hold 1 ngày holiday giữa fail và start new job — reset

---

## 9. Quarterly self-review template

Mỗi founder fill async cuối quý, share team:

```markdown
# Q{N} Self-Review — {Founder Name}

## Identity progress
- Identity goal T18: [paste from §2]
- Where I am Q{N}: [3-5 bullet]
- Gap to T18 identity: [list]

## Curriculum progress
- Topics planned this Q: [from §3]
- Completed: [%, list]
- Output produced: [blog/repo/talk]

## Public output
- Blog posts: X (target: Y)
- Stars on main repo: X (target: Y)
- LinkedIn followers: X (target: Y)

## Mental health
- Routine adherence: %
- Red flags hit: [list]
- 1-1 with co-founders done: Y/N

## Personal finance
- Personal runway remaining: X months
- Burn share: $X
- Salary withdrawn: $X (if any)

## What I'd change
- Stop: [...]
- Start: [...]
- Continue: [...]

## Ask team
- I need help with: [...]
- I want to give: [...]
```

---

## 10. Tóm tắt 1 trang per founder

```
P1 (CEO/LLMOps + ML Baselines):
  Background: Data/ML Eng + LLMOps + web bổ trợ (rare combo)
  Identity T18: Technical CEO + LLMOps authority VN
  Skill primary: Eval/prompt versioning/cost optim/memory + ML baselines
  Q1 focus: Eval framework v1 + 3 technical post + cost baseline
  Public T18: prompt-eval-framework OSS 500-2K stars, 30 deep tech post
  Watch: bị kéo vào MMO hook content; outsource eval/cost cho P3

P2 (Engine + Web):
  Identity T18: Senior orchestration engineer multi-agent production
  Skill primary: Next.js orchestrator + SSE + state machine + integration
  Q1 focus: Engine MVP ship T3
  Public T18: 500+ stars engine skeleton OSS
  Watch: over-engineer, ship trễ T6

P3 (COO + Business Solution + Customer Success):
  Background: Business Solution + COO mindset (NOT prompt engineer, NOT coder)
  Identity T18: B2B AI Business authority VN — bridge tech↔client
  Skill primary: Sales + customer success + domain SME + business ops
  Q1 focus: Sales playbook v1 + 1 niche audit report + first paying B2B client
  Public T18: 5 case study published, 3 VLA/VECOM/founder talk
  Watch: bị kéo vào prompt engineering hoặc code; bị ép làm MMO hook content

ANTI-FOMO COMMON:
  Stack lock 6 tháng | KHÔNG read startup news | KHÔNG pivot 4 tháng
  Saturday off | Routine non-negotiable | 1-1 monthly

EXIT PLAN:
  65% trường hợp ≥1 founder back to job T18+
  Required: 1 OSS, 5 blog, 2 testimonial, updated LinkedIn
  Expected offer: $2.5–5K/mo VN remote, 2–4 tuần
```
