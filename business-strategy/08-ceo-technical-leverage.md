# CEO Technical Leverage — Khai thác stack Data/ML + LLMOps

**Bối cảnh:** CEO (P1) là Data/ML Engineer + LLMOps + web bổ trợ. Đây là **rare combo** ở thị trường VN — và là moat khác biệt với 99% AI agency/consultancy. File này chi tiết hoá cách stack của CEO biến thành sản phẩm + sales + content + moat.

**Quy tắc vàng:** *"CEO không phải coordinator. CEO là LLMOps moat in human form. Mọi quyết định 'CEO làm gì' phải tăng moat, không tiêu hao moat."*

---

## 1. Stack mapping — CEO covers gì trong file 07

File 07 (Agent Team Development) có 17 mục. CEO personally cover được ≥10 mục:

| File 07 mục | CEO depth | Tại sao |
|---|---|---|
| §1 Triết lý agent-as-coworker | ✅ Native | LLMOps mindset = treat AI như prod system, không phải tool |
| §2 Architecture 13 agents | ✅ Native | Multi-agent orchestration trong scope LLMOps |
| §3 Maturity tiers | ✅ Native | Tier 4 self-eval = LLMOps signature |
| §4 Eval framework | ⭐ **Lead** | Eval = core skill LLMOps; CEO build từ scratch |
| §5 Prompt versioning | ⭐ **Lead** | Git workflow + changelog = LLMOps; CEO own |
| §6 Cost optimization | ⭐ **Lead** | Cache + routing + token diet = LLMOps; CEO own |
| §7 Memory feedback loop | ⭐ **Lead** | Memory hygiene = LLMOps; CEO own |
| §8 New agent roadmap | ✅ Co-own | CEO design eval/cost agent; P3 design content/sale |
| §9 Failure modes | ⭐ **Lead** | Incident playbook = LLMOps; CEO own |
| §10 Operating manual | ✅ Co-own | Daily workflow = team-wide |
| §11 Agent vs Human boundary | ✅ Co-own | Strategic decision team-wide |
| §12 Decision gates health | ⭐ **Lead** | Eval/cost/failure metrics = LLMOps |
| §13 Tooling stack | ⭐ **Lead** | Claude API mastery, observability = LLMOps |
| §14 Phase 1 deliverables | ✅ Co-own | CEO ship eval+cost; P2 ship engine+UI |
| §15 Anti-patterns | ✅ Native | LLMOps đã thấy hết các trap này |
| §16 T18 vision | ⭐ **Lead** | 22 agent + 200 retro = CEO directly responsible |
| §17 Tóm tắt | – | (re-summary) |

→ **6 mục CEO LEAD**, 5 mục co-own. Không mục nào "P3 lead" như draft cũ. P3 vai trò Domain + Sales/Content, không phải LLMOps.

---

## 2. 5 đòn bẩy chiến lược

### 2.1 Đòn bẩy #1 — Sản phẩm/dịch vụ MỚI (LLMOps line)

Mở **line LLMOps** song song với MMO/B2B Logistic/E-com hiện có. Target ICP-E (file 02 mới thêm).

#### Sản phẩm Phase 1 (T0–T6)

| Sản phẩm | Effort | Pricing | Khả thi |
|---|---|---|---|
| **OSS `prompt-eval-framework`** | 4–6 tuần (P1) | $0 (lead-gen) | ⭐⭐⭐ |
| **LLMOps Audit (1 tuần delivery)** | Per-engagement | $3–8K | ⭐⭐⭐ T6+ |
| **"AI Cost Killer" PDF/course** | 1 tuần PDF, 1 tháng course | $19–299 | ⭐⭐⭐ T3 |
| **Cost optim sprint guarantee** | Per-engagement | $2–5K | ⭐⭐⭐ T6+ |
| **Eval-as-a-Service retainer** | Recurring | $500–2K/mo | ⭐⭐ T9+ |

#### Sản phẩm Phase 2+ (T6+)

- **ML model second-opinion** $1–3K (CEO validate Prophet vs NBEATS, RAG strategy, recommendation algo)
- **LLMOps consulting retainer** $2–5K/mo (embed 4h/tuần vào team client)
- **"Anthropic Prompt Caching Masterclass"** $99–299 niche course
- **Eval framework workshop** $2–5K/buổi cho team in-house

#### Differentiation messaging

> **Vibe consultancy nói:** "Chúng tôi giúp doanh nghiệp ứng dụng AI"
>
> **Bạn nói:** "CEO chúng tôi 5+ năm Data/ML + LLMOps. Mọi project có eval suite + cost track + version control prompt. Không phải vibe."

Engineering buyer (CTO, Head of AI) sniff out vibe consulting trong 5 phút. Bạn pass test này.

---

### 2.2 Đòn bẩy #2 — OSS marketing với credibility cao

#### `prompt-eval-framework` repo strategy

**Mục tiêu T18:** 500–2K stars, là 1 trong top 5 search "prompt eval" trên GitHub.

**Build sequence:**
- T1–2: Spec + golden test format (YAML schema)
- T3–4: Core eval engine (LLM-judge + format check + cost) Python + TypeScript variant
- T5: Bilingual README EN + VI, examples, docs
- T6: v0.1 quiet release, 5–10 friendly users
- T9: v1.0 — Hacker News + Product Hunt + Show on dev.to
- T12: v1.5 với plugins (Helicone, Langfuse integration)
- T18: v2.0 production-grade

**Marketing chiến thuật:**
- Show HN title: "Show HN: Eval framework for multi-agent pipelines (built on 200+ production runs)"
- Twitter/X thread khi launch — 8–12 tweet thread
- Reddit r/MachineLearning + r/LocalLLaMA + r/ChatGPT (giá trị, không spam)
- Submit to "Awesome Prompt Engineering", "Awesome LLMOps" lists
- Guest post dev.to, hackernoon, medium (cross-post)

**Why work:** OSS đem lại 3 thứ:
1. **Top of funnel** ICP-E — engineer tìm OSS rồi tìm về company
2. **Hire pipeline** — engineer giỏi muốn join shop có OSS
3. **Authority compound** — mỗi star + fork = social proof khi pitch B2B

**Why CEO làm được:** P3 không có Python eval depth, P2 không có ML/LLMOps depth. Chỉ CEO có cả ML + Ops + ship code production.

#### Repo phụ

- `awesome-vietnamese-llm` — curated list LLM resources tiếng Việt (low effort, viral chance)
- `claude-prompt-cache-cookbook` — recipes tiết kiệm 10x cost với prompt caching (1 tuần build)

---

### 2.3 Đòn bẩy #3 — Technical content track (luồng 2 song song MMO)

Venture có 2 content track không xung đột:

| Track | Voice | Audience | Channel chính | Format |
|---|---|---|---|---|
| **MMO Track** (P3 hoặc 1 founder face) | Business / energy | MMO Builder VN, ICP-A, low ACV | TikTok VN + Threads + FB group | Hook 3-15s, "AI kiếm tiền X" |
| **Technical Track** (CEO face) | Engineer / depth | AI engineer, ICP-E, high ACV | YouTube long-form + GitHub + X EN + Substack | 10–20 phút deep dive, code-along |

**Content ideas Technical Track (Q1):**
1. "Anthropic prompt caching — why we cut $X/mo" (case study, real numbers)
2. "Multi-agent eval framework from scratch" (build with me)
3. "Why your AI demo works but production fails" (eval gap explainer)
4. "Cost routing strategy: when Sonnet, when Haiku" (decision tree)
5. "Memory hygiene for long-running agents" (hands-on)
6. "Vietnamese LLM benchmarking — what nobody tells you" (original research)

**Cadence:** 1 long YouTube/2 tuần + 1 Substack post/tuần + 5–10 X tweet/ngày + 1 OSS commit/tuần

**Effort:** ~10h/tuần CEO (KHÔNG phải toàn bộ founder time — CEO vẫn làm LLMOps work khác 25h/tuần)

**ROI:** Khác MMO track (volume), Technical track build **authority** — 1 video viral 50K views = 5–10 LLMOps audit lead $3–8K. ARPU cao gấp 100x MMO.

---

### 2.4 Đòn bẩy #4 — ML baseline ownership (validation moat)

Trong 9 baseline ưu tiên (file 01 §2), CEO personally OWN technical depth:

| Baseline | CEO depth lý do | Output Phase 1 |
|---|---|---|
| **B01 Forecasting** | Native ML — biết Prophet/ARIMA/NBEATS/N-HiTS/TFT trade-off | Personal validation cho project Logistic |
| **B05 Recommendation** | Có thể implement collaborative filter, two-tower, sequence model | Validation cho project E-com |
| **B07 Anomaly Detection** | Isolation Forest, autoencoder, time-series anomaly đều quen | Validation logistic + fraud |
| **B12 Search & RAG** | Hybrid search, re-ranking, knowledge graph retrieval — overlap LLMOps | Direct ownership — MAESTRO retrieval API |

P3 (domain expert) viết content + L3 report drafts. CEO **validate technical correctness** trước ship.

**Why moat:** 99% agency VN deliver "use Prophet for forecasting" boilerplate. CEO catch được khi nên dùng N-HiTS thay (sparse retail data, hierarchical forecasting). Client engineering buyer thấy depth này → trust → close deal nhanh hơn.

---

### 2.5 Đòn bẩy #5 — Sales motion engineering-first

#### Customer journey ICP-E (engineering buyer)

```
Engineer thấy CEO YouTube technical "Anthropic prompt caching cut $X/mo"
   ↓ subscribe
Engineer xem 2-3 video kế (cost optim, eval framework)
   ↓ trust
Engineer ⭐ prompt-eval-framework repo
   ↓ social proof
Engineer share team Slack: "guys check this out"
   ↓ champion
CTO/Head of AI thấy framework → DM CEO
   ↓ inbound
30-min call (CEO talk-to-talk technical)
   ↓ qualification
LLMOps Audit $3–8K (entry-level)
   ↓ value-prove
Cost sprint OR retainer $2–5K/mo
```

**CEO không cần học sales** — engineering buyer chỉ cần engineering credibility. Pitch = "show framework + 2 case study + price".

**Time-to-close:** 1–3 tuần (so với ICP-B/C: 4–8 tuần). Sales cycle ngắn hơn vì:
1. Decision maker = technical, không cần convince through champion
2. Proof = OSS + content, không cần discovery deep
3. Pricing rõ ràng (audit fixed-fee)

#### Phase 1 ICP-E sales target

- T6: 2–3 LLMOps audit pilot ($3–5K floor) → $9–15K cumulative
- T9: 4–6 audit + 1–2 retainer ($1.5K/mo avg) → $3K MRR
- T12: 8 audit completed + 4 retainer → $6–8K MRR từ ICP-E alone

→ **ICP-E là path nhanh nhất tới $5K MRR** vs ICP-B (sales cycle dài) hoặc ICP-A (volume thấp ARPU).

---

## 3. CEO time allocation Phase 1

### Per week (40h, cap 25h focus block)

| Bucket | Hours | Detail |
|---|---|---|
| **LLMOps build** (engine §4-9) | 12h | Eval framework, prompt versioning, cost optim, memory infra |
| **Technical content** | 8h | 1 YouTube/2 tuần (4h prep + edit) + 1 Substack/tuần (2h) + X (2h) |
| **OSS repo work** | 4h | Commits, PR review, issue triage |
| **Sales + advisory** | 6h | ICP-E discovery call (3-4 calls/tuần × 1.5h) |
| **Strategic / team** | 6h | 1-1 với P2/P3, weekly KPI review, planning |
| **Learning curriculum** (file 06 §3) | 4h | Anthropic blog, ML papers, eval research |
| **Buffer** | _ | Slack, async messages, unexpected |

→ **Không có hour cho MMO content production.** P3 hoặc external freelance làm MMO. CEO time là moat, không tiêu vào hook 3 giây.

### What CEO DOESN'T do

- ❌ TikTok hook content production
- ❌ Frontend UI build (P2 own)
- ❌ Domain research Logistic case study (P3 own)
- ❌ Cold outreach DM mass send (P3 + agent automate)
- ❌ Vendor procurement employer hợp đồng (P3 hoặc shared)
- ❌ Customer support tier 1 (later: hire VA)

---

## 4. Stack lock cho CEO (file 06 §7.1 nhấn lại)

CEO có temptation rabbit-hole vào:
- ❌ **LangGraph / AutoGen** — abstraction tax + lock-in (file 07 §15 anti-pattern)
- ❌ **Fine-tune own model** trước khi có 1000+ production runs
- ❌ **Build own observability** thay vì dùng Helicone/Langfuse off-shelf
- ❌ **Migrate Postgres** trước Phase 2
- ❌ **Optimize prematurely** — eval first, optim later

**Stack CEO khoá 6 tháng đầu:**
```
LLM:           Claude API (Sonnet 4 + Haiku 4.5)
Eval infra:    Custom YAML golden + Python eval script (no framework)
Logging:       Helicone (off-shelf, $0–50/mo)
Prompt mgmt:   Markdown files in .agents/ Git-tracked
Memory:        Markdown files in docs/memory/ + grep retrieval
Code:          Python (eval, ML), TypeScript (orchestrator integration với P2)
```

Mọi "hot framework mới" → ghi `parking-lot.md` review T7+.

---

## 5. Risks specific cho CEO role

| Risk | Trigger | Mitigation |
|---|---|---|
| **CEO làm hết, P2/P3 không grow** | CEO code 30+ h/tuần while team < 15h | Weekly review: nếu CEO output > P2+P3 combined → delegate or pause CEO |
| **Technical perfectionism delay launch** | Eval framework 8+ tuần chưa ship | Hard cap T6: ship "ugly v0.1" out, polish later |
| **Burnout từ 2 luồng content** | CEO miss content 2 tuần liên tiếp | Reduce technical content cadence to 1/3 tuần. Hire editor T9+ |
| **CEO bị kéo vào ops cổ điển** | CEO làm sales call 15+ h/tuần | Hire 1 BD T9 hoặc P3 take over ICP-B/C sales |
| **Bị tuyển sang công ty AI khác** | CEO nhận offer $8K+/mo | Equity vesting đã ký T1 cliff bảo vệ. Re-discuss cap table T9 nếu cần |
| **Conflict với role full-time current employer** | Employer phát hiện và challenge IP | Đã confirm có hệ thống máy riêng (không xung đột); maintain document trail |

---

## 6. Decision gates cho CEO role

### T3 gate
- ✅ Pass: Eval framework v0.5 + 5 golden tests/agent + 3 technical post + 1 YouTube
- ⚠️ Caution: Eval không chạy → freeze new agent intake, focus eval first

### T6 gate
- ✅ Pass: Eval v1 + cost ≤ $1/Scope-A + OSS repo public + 1 LLMOps audit pilot delivered
- ❌ Stop: 0 ICP-E inbound sau 3 tháng OSS public → reposition (có thể content quá technical, cần entry-level content thêm)

### T12 gate
- ✅ Pass: 6+ ICP-E audits + $5K+ MRR retainer + OSS 200+ stars
- ⚠️ Caution: ICP-E < target nhưng B2B Logistic strong → CEO support B2B sales 30% time, vẫn LLMOps lead

---

## 7. Content allocation — Ai làm content gì? (resolve voice clash)

### 7.1 Vấn đề

3 founders, 3 voice rất khác nhau:
- **CEO (P1)** — Technical depth voice. Audience: engineer, AI startup founder, CTO.
- **P2** — Web full-stack voice. Audience: dev community.
- **P3 (COO/Business)** — Business/operations voice. Audience: founder D2C, COO 3PL, Head of Ops.

**Không ai có "MMO TikTok hook" voice tự nhiên.** Niche MMO yêu cầu năng lượng đặc thù: hyper-energetic, claim "kiếm $X trong Y ngày", visual hook fast-cut. Forcing P3 (mature business voice) vào niche này → voice clash → audience không trust → fail.

### 7.2 Đề xuất 3 luồng content + 1 hire

| Luồng | Owner | Channel chính | Audience | Cadence T1-T6 |
|---|---|---|---|---|
| **Technical Authority** | CEO (P1) | YouTube long-form + Substack EN/VI + GitHub OSS + X EN | ICP-E (AI engineer, CTO) | 1 YT/2 tuần + 1 Substack/tuần + 5-10 X/ngày |
| **Business B2B** | P3 | LinkedIn VN long-form + niche audit report PDF + founder community DM | ICP-B/C/D (COO, Head of Ops, D2C founder) | 2-3 LinkedIn/tuần + 1 audit report/2 tháng |
| **Engine Deep Dives** (optional) | P2 | Dev.to + GitHub README + occasional YT | Dev community | Light (1 post/tháng) |
| **MMO Hook** ⚠️ | **External hire** (T3+) | TikTok VN + Threads VN + FB Group | ICP-A (MMO Builder) | 5-10 TikTok/tuần |

### 7.3 MMO content — 3 options đánh giá

**Option A — Hire freelance MMO content creator T3** (RECOMMEND)
- Profile: 22-28 tuổi, đã có audience nhỏ MMO/AI personal (1-5K followers), tự nhận voice MMO
- Compensation: $300-500/mo retainer + 10-20% commission từ MMO product sale
- Output: 5-10 TikTok/tuần (script + shoot + edit)
- CEO/P3 supply talking points + product link, không animate
- Effort founder: 2h/tuần review + 1h coaching
- Risk: cần 1-2 attempt để tìm đúng người (test 2 tuần)

**Option B — Pause MMO niche, focus Business B2B + Technical**
- Phase 1 ship MMO products (PDF, template) **không có TikTok content**
- Distribute qua: SEO blog + LinkedIn business spillover + email list từ Technical track
- Risk: MMO product không bán mà không có MMO content (audience mismatch)
- Cash impact: mất ~30-40% revenue MMO product Phase 1, nhưng founder time saved

**Option C — P3 thử voice MMO 4 tuần**
- P3 post 5 TikTok/tuần thử nghiệm
- Nếu sau 4 tuần > 500 followers organic → continue
- Nếu < 500 → switch Option A
- Risk: P3 burn time không tự nhiên, voice clash với LinkedIn business persona

**Recommend: Option B** (T0-T2) → Option A (T3+).
- T0-T2: ship MMO product + nurture qua SEO/LinkedIn/email
- T3: hire freelance MMO creator, test 2 tuần
- T6: scale nếu work, switch nếu không

### 7.4 Content allocation table — Phase 1 (T0-T6)

| Channel | Owner | Hours/tuần | KPI T6 |
|---|---|---|---|
| YouTube technical | CEO | 4h (1 video/2 tuần) | 500 subs |
| Substack EN+VI | CEO | 2h | 500 sub |
| X EN | CEO | 2h | 1K followers |
| GitHub OSS | CEO | 4h | OSS public + 50 stars |
| LinkedIn VN | P3 | 3h | 1K followers |
| Niche audit report | P3 + agents | 5h/2 tuần | 2 reports shipped |
| TikTok MMO | Freelance T3+ | $400/mo | 3K followers |
| Threads MMO | Freelance T3+ | (cùng freelance) | 2K followers |
| Email list | P3 | 1h | 1.5K subs |
| Dev.to (P2) | P2 | 1h | Optional |

**Tổng founder content time:** ~18h/tuần (CEO 12h + P3 9h, P2 1h optional). Dưới cap 25h/founder. Fit.

### 7.5 Voice rules — Protect brand integrity

- ❌ CEO không post MMO hook video — mất technical authority với ICP-E
- ❌ P3 không post technical deep dive — không match expertise, audience confused
- ❌ Freelance MMO không nói thay CEO/P3 về business strategy — chỉ promote product MMO niche
- ✅ Mỗi voice có **disclaimer riêng** trong bio: "Technical track" / "Business B2B" / "MMO products by [Brand]"
- ✅ Cross-promote allowed: CEO mention "Business team chúng tôi serve B2B" trên technical track, P3 mention "tech team build framework" trên business track

---

## 8. Tóm tắt 1 trang

```
CEO STACK: Data/ML Eng + LLMOps + web bổ trợ (rare combo VN)

LLMOps OWNERSHIP (file 07):
  ⭐ §4 Eval | §5 Prompt versioning | §6 Cost optim | §7 Memory | §9 Failure modes
  ⭐ §12 Decision gates | §13 Tooling | §16 T18 vision

5 ĐÒN BẨY CHIẾN LƯỢC:
  1. LLMOps line — sản phẩm mới (audit, sprint, retainer) cho ICP-E
  2. OSS marketing — prompt-eval-framework, target 500-2K stars
  3. Technical content track — YouTube/Substack/X bilingual, parallel với MMO
  4. ML baseline validation — own B01/B05/B07/B12 technical correctness
  5. Engineering-first sales — CEO talk-to-talk, sales cycle ngắn

CEO TIME (40h/tuần):
  12h LLMOps build | 8h technical content | 4h OSS | 6h sales | 6h team | 4h learn

DOESN'T DO:
  TikTok hook | Frontend UI | Domain research | Cold DM mass | Tier 1 support

ICP-E TRAJECTORY:
  T6: 2-3 audit ($9-15K) | T9: $3K MRR | T12: $6-8K MRR

OSS TRAJECTORY:
  T1-2 spec | T6 v0.1 quiet | T9 v1.0 HN+PH launch | T18 500-2K stars

MOAT:
  6 mục file 07 CEO LEAD = LLMOps depth không copy được
  + ML baseline depth = không bị "Prophet for everything" trap
  + OSS authority = engineering buyer trust signal
  + Technical content track = inbound channel zero CAC cho ICP-E
```
