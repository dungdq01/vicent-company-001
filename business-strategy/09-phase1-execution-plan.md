# Phase 1 Execution Plan — T0 → T6 (6 tháng đầu)

**Mục đích:** Document này biến 8 file strategy trên thành **lịch thực thi cụ thể** — ngày nào ai làm gì, ship gì, review ở đâu. Mỗi tuần CEO + P2 + P3 mở file này, chốt task tuần, ship.

**Quy tắc vàng:**
- 1 task có owner duy nhất (không "cùng làm")
- 1 task có "Definition of Done" cụ thể (file path, URL, hoặc số đo)
- Ship lệch hơn perfect — 80% ship hôm nay > 100% ship tuần sau
- Mỗi cuối tuần: KPI review 30 phút, không hơn

---

## 1. Operating cadence

### Daily
- **08:00** — async standup trong Discord/Telegram own-channel (3 dòng: hôm qua / hôm nay / blocker)
- **08:30–11:30** — Deep work block 1 (single-task, không Slack)
- **12:00–13:00** — Lunch + walk
- **13:00–16:00** — Deep work block 2
- **16:00–17:00** — Async (review PR, comment, prompt eval)
- **17:00–18:00** — Buffer / call client / 1-1 founder
- **18:00** — STOP work (hard boundary, file 06 §5.1)

### Weekly
- **Monday 08:30** — Sprint planning 60 phút (chốt 3 deliverable/founder/tuần, không hơn)
- **Friday 16:00** — Sprint review 30 phút (ship hoặc cut, không carryover)
- **Sunday 21:00** — Personal win log (file 06 §5.2)

### Sprint = 1 tuần (không dùng 2-tuần sprint cho Phase 1 — quá chậm cho startup)

---

## 2. Day 0 — Preflight (TRƯỚC tuần 1)

| # | Task | Owner | Deadline | Definition of Done |
|---|---|---|---|---|
| 0.1 | Brand + domain đăng ký | CEO | D-3 | `.com` + `.vn` registered, trỏ về placeholder |
| 0.2 | Founder agreement ký công chứng | P3 (COO) | D-2 | Equity split + vesting + IP clause + signed PDF |
| 0.3 | Mở quỹ chung venture (bank account hoặc TransferWise) | P3 | D-2 | Account number + 3 founder access |
| 0.4 | Anthropic API key + budget cap $500/mo | CEO | D-1 | Console.anthropic.com working, billing alert set |
| 0.5 | Helicone hoặc Langfuse account (observability) | CEO | D-1 | Account + 1 test API call logged |
| 0.6 | GitHub org + private monorepo skeleton | P2 | D-1 | `github.com/{brand}/maestro-monorepo` init |
| 0.7 | Discord server own (3 channel: #general, #standup, #ship-log) | P3 | D-1 | Server URL + 3 founder joined |
| 0.8 | Notion / Linear workspace (project tracking) | P3 | D-1 | Workspace + Phase 1 board imported từ file này |
| 0.9 | Beehiiv hoặc Substack newsletter setup | CEO | D-1 | Domain `newsletter.{brand}.com` working |
| 0.10 | LinkedIn company page + 3 founder profile updated | P3 | D-1 | Page live + bio "Co-founder @ {Brand}" |
| 0.11 | TikTok account brand + 3 founder personal | P3 | D-1 | 4 accounts created (chưa post) |
| 0.12 | YouTube channel + brand banner | CEO | D-1 | Channel `@{brand}` + banner uploaded |
| 0.13 | Gear check (mic, camera, light, capcut/descript license) | CEO | D-3 | Test 1 video 60 giây quay xong |
| 0.14 | Đọc lại file 01-08 + memory | All 3 | D-1 | Mỗi founder note 3 điểm họ disagree |
| 0.15 | Sprint 1 planning meeting | All 3 | D-1 | Tuần 1 task list locked |

**Day 0 budget:** ~$200 (domain + tools + design fee). Không hơn.

---

## 3. WEEK 1 (T1) — Foundation

### Sprint goal
> Engine spec done + 13 agent skill cards drafted + first content piece + first sales action.

### Daily breakdown

| Day | CEO (P1) | P2 (Engine) | P3 (COO/Biz) |
|---|---|---|---|
| **Mon** | Spec eval framework v0.1 (YAML schema golden set) | Engine architecture doc (state machine, SSE flow, file structure) | Sales playbook v0.1 outline (discovery script, scoping form, pricing tiers) |
| **Tue** | Draft 5 agent skill cards: R-α, R-β, R-γ, R-D06, R-σ (`.agents/`) | Setup Next.js 16 monorepo, install deps, hello-world API route | LinkedIn post #1 — "Why we're building MAESTRO" (founder story angle) |
| **Wed** | Draft 5 agent skill cards: R-MLE, R-DE, R-DA, R-BE, R-FE | Implement orchestrator skeleton + invoke 1 agent (R-α) end-to-end | Outreach 10 warm contact (Logistic/E-com network) — coffee chat ask |
| **Thu** | Draft 3 agent skill cards: R-DO, R-QA, R-SA + golden test set 10 cases for R-α | SSE streaming test + Mission Control UI page skeleton | Niche audit report outline — "Top 10 use case AI cho 3PL VN 2026" |
| **Fri** | Run R-α with golden set, log baseline cost + score | Wire up Helicone logging on test runs | Sprint review + week 1 retro |

### Outputs by Friday EOD

| Output | Location | Owner |
|---|---|---|
| 13 agent skill cards v1.0 | `.agents/tier-{N}/R-{name}.md` | CEO |
| Eval golden test (R-α only) | `evals/R-alpha.golden.yaml` | CEO |
| Engine architecture doc | `docs/engine/architecture.md` | P2 |
| Engine MVP (R-α invoke working) | `apps/orchestrator/src/...` | P2 |
| Mission Control UI skeleton | `apps/dashboard/src/...` | P2 |
| Sales playbook v0.1 | `docs/sales/playbook.md` | P3 |
| LinkedIn post #1 published | LinkedIn URL | P3 |
| 10 warm outreach DM | tracked in Notion | P3 |
| Audit report outline | `docs/content/audit-3pl-vn-outline.md` | P3 |

### Decision gate end of Week 1
- ✅ Pass: 13 cards + Engine R-α invoke working + 1 LinkedIn post + 10 DM sent
- ⚠️ Caution: Engine không invoke được agent → debug ưu tiên Week 2, defer agent cards 6-13
- ❌ Stop: Founder agreement chưa ký → freeze tất cả task, ưu tiên ký

---

## 4. WEEK 2 (T1+1) — First Ship

### Sprint goal
> Ship AI Roadmap PDF + Engine Scope A end-to-end + first YouTube video + audit report draft 50%.

### Daily breakdown

| Day | CEO | P2 | P3 |
|---|---|---|---|
| **Mon** | Build B01 Forecasting baseline content (PDF source) — chương 1-3 | Wire R-β + R-γ vào pipeline (Scope A skeleton) | Audit report 3PL VN — chương 1-2 (intro + use case 1-3) |
| **Tue** | PDF chương 4-7 + design canva/affinity | Pipeline Scope A end-to-end test với dummy brief | Audit report chương 3-4 (use case 4-6) |
| **Wed** | YouTube video #1 — "Vì sao tôi build prompt-eval-framework" (record + edit) | Eval framework integration vào pipeline (auto-score per agent run) | Audit report chương 5-6 (use case 7-10) |
| **Thu** | PDF final + landing page Gumroad/Lemon Squeezy + Substack issue #1 | Mission Control UI v0.2 — show agent runs + cost + status | Outreach 10 contact mới + 5 follow-up tuần trước |
| **Fri** | YouTube video #1 publish + X (Twitter) launch thread + Sprint review | Demo Scope A pipeline cho team + Sprint review | Audit report final draft → CEO review |

### Outputs by Friday EOD

| Output | Location/URL | Owner | Price |
|---|---|---|---|
| AI Roadmap PDF v1 (15 baselines × MMO use case) | Gumroad URL | CEO | $19 launch / $49 list |
| Substack issue #1 published | newsletter URL | CEO | Free |
| YouTube video #1 (4-8 min) | YouTube URL | CEO | — |
| X launch thread (10-12 tweet) | X URL | CEO | — |
| Engine Scope A end-to-end working | Demo video | P2 | — |
| Eval auto-scoring integrated | Code + log | P2 | — |
| Mission Control UI v0.2 | Localhost demo | P2 | — |
| Niche audit report 50% draft | `docs/content/audit-3pl-vn.md` | P3 | — |
| 20 cumulative DM outreach | Notion CRM | P3 | — |

### Decision gate end of Week 2
- ✅ Pass: PDF on sale + Scope A pipeline working + 1 YouTube + audit 50%
- ⚠️ Caution: PDF zero sale 48h → review hook + landing copy, không panic
- ❌ Stop: Engine Scope A không chạy → all-hands debug, freeze content 1 tuần

---

## 5. WEEK 3 (T1+2) — Pipeline + First B2B Action

### Sprint goal
> Ship niche audit report (lead-gen) + Prompt Pack v1 + start ICP-D vendor contract + 30 outreach cumulative.

### Daily breakdown

| Day | CEO | P2 | P3 |
|---|---|---|---|
| **Mon** | Prompt Pack v1 cho MMO use case — 30 prompts + Notion template | Eval golden set cho R-β + R-γ + R-σ (3 agents) | Audit report final + design + landing gated PDF |
| **Tue** | Substack issue #2 + X content batch | Cost tracker dashboard (per-run breakdown) | Audit report publish + LinkedIn announcement post |
| **Wed** | YouTube video #2 — "Anthropic prompt caching: cut $X/mo" (record) | Engine Scope B skeleton (add R-SA + R-DA) | Vendor contract draft cho employer (ICP-D) |
| **Thu** | OSS repo `prompt-eval-framework` skeleton public (README + example) | Scope B end-to-end test trên dummy brief | Discovery call attempt với 3 warm contact (book 1-2 calls) |
| **Fri** | YouTube #2 publish + Sprint review | Demo Scope B + Sprint review | Vendor contract send to employer + Sprint review |

### Outputs by Friday EOD

| Output | Location/URL | Owner | Price |
|---|---|---|---|
| Prompt Pack v1 | Gumroad URL | CEO | $29 launch / $79 list |
| Substack issue #2 | newsletter URL | CEO | Free |
| YouTube video #2 | YouTube URL | CEO | — |
| OSS repo public skeleton | github.com/{brand}/prompt-eval-framework | CEO | $0 (lead-gen) |
| Eval golden set 3 agents | `evals/*.golden.yaml` | P2/CEO | — |
| Engine Scope B working | Demo + git tag `scope-b-mvp` | P2 | — |
| Cost dashboard | UI page | P2 | — |
| Niche audit report PUBLISHED | landing URL gated PDF | P3 | $0 → email |
| Vendor contract draft sent | Email thread | P3 | — |
| 1-2 discovery call booked | Calendar | P3 | — |
| 30 cumulative DM outreach | Notion CRM | P3 | — |

### Decision gate end of Week 3
- ✅ Pass: Audit report >100 download + Prompt Pack on sale + Scope B working + vendor contract sent
- ⚠️ Caution: Audit < 30 download → review distribution (LinkedIn, Threads, group share), boost
- ⚠️ Caution: 0 discovery call booked → P3 pivot outreach script

---

## 6. WEEK 4 (T1+3) — First Paying Activity

### Sprint goal
> First paid activity (employer vendor contract OR LLMOps audit pilot) + Engine v0.5 + 50 TikTok followers (freelance start hiring) + audience momentum.

### Daily breakdown

| Day | CEO | P2 | P3 |
|---|---|---|---|
| **Mon** | OSS repo: ship 3 example pipeline + docs | Engine Scope A 80% auto rate test (rerun 5 dummy brief) | Discovery calls 1-2 (record, follow-up note) |
| **Tue** | Substack issue #3 + ML baseline B05 Recommendation L3 draft | Eval auto-block on regression (pre-commit hook) | Vendor contract negotiation round 2 + scoping doc |
| **Wed** | YouTube video #3 — "Eval framework cho multi-agent từ 0" | Engine Scope C skeleton (add R-MLE, R-DE, R-BE, R-FE) | Freelance MMO creator screening (post job listing + 5 candidates) |
| **Thu** | OSS launch quiet — share Hacker News "Show HN" hoặc r/MachineLearning | Scope C end-to-end test | Freelance interview 3 candidates + sample post test |
| **Fri** | YouTube #3 publish + Month 1 retro | Sprint review + Month 1 retro | Vendor contract LOI ký + Month 1 retro |

### Outputs by Friday EOD (= Month 1 EOD)

| Output | Location | Owner |
|---|---|---|
| OSS repo + 3 examples + Hacker News post | github + HN URL | CEO |
| Substack issue #3 | newsletter URL | CEO |
| B05 Recommendation L3 draft | `data/baselines/B05/...` | CEO |
| YouTube video #3 | YouTube URL | CEO |
| Engine Scope A 80% auto verified | metrics doc | P2 |
| Engine Scope C skeleton | git tag `scope-c-mvp` | P2 |
| Freelance MMO creator interviewed | shortlist 1-2 | P3 |
| Vendor contract LOI signed | PDF | P3 |
| Month 1 retro doc | `docs/retros/month-1.md` | All 3 |

### Decision gate end of Month 1 (T1)
- ✅ Pass: ≥1 LOI ký + Engine Scope A 80% auto + 3 YouTube + 3 Substack + OSS public + Prompt Pack/PDF có sale
- ⚠️ Caution: 0 LOI nhưng Engine + content ổn → tiếp tục Month 2 với +20% sales focus
- ❌ Stop & rethink: Engine fail, content zero traction, 0 LOI cùng lúc → 1 tuần off + retro deep

### KPI gate Month 1

| Metric | Target T1 EOD | Actual |
|---|---|---|
| TikTok followers | 100 (freelance start) | _ |
| YouTube subs | 50 | _ |
| Substack subs | 30 | _ |
| LinkedIn followers (P3) | 200 | _ |
| Email list | 100 | _ |
| Cumulative DM outreach | 40 | _ |
| Discovery call booked | 3 | _ |
| LOI/vendor contract | 1 | _ |
| Cumulative cash | $200–500 (PDF + Prompt Pack) | _ |
| MAESTRO baselines L3 | 1 (B01) → 1.5 (B05 draft) | _ |

---

## 7. MONTH 2 (T2) — Scale audience + first paying B2B

### Goals
- 1 paying B2B Sprint A delivered (employer or warm contact) — $1.5–3K
- Freelance MMO creator hired + first 20 TikTok video shipped
- Engine Scope B → Scope C full working
- 5 baseline L3 (B01, B02, B05, B07 partial)
- Audit report #2 (E-com angle) shipped

### Weekly themes

| Week | Theme | Critical ship |
|---|---|---|
| W5 | First B2B kickoff | Engine runs first paying project Scope A |
| W6 | Content scale | Freelance creator ship 5 TikTok/tuần stable |
| W7 | Engine Scope C | Full design pipeline working |
| W8 | Second audit report | E-com niche launched |

### Per founder allocation Month 2

| Founder | Primary | Secondary |
|---|---|---|
| CEO | Engine eval refinement + cost optim pass 1 + B05/B07 baselines | YouTube + Substack + OSS PRs |
| P2 | Engine Scope C ship + Mission Control v1 | Cost dashboard polish |
| P3 | First B2B project delivery (with CEO support) + freelance onboarding | Niche audit #2 + LinkedIn cadence |

### Outputs Month 2 EOD

- ✅ 1 B2B project delivered (deliverable PDF + invoice $1.5–3K)
- ✅ Freelance MMO creator on retainer, 20 TikTok shipped
- ✅ Engine Scope C working
- ✅ 5 baseline L3
- ✅ 4 YouTube + 4 Substack + ~80 X tweet + ~12 LinkedIn + 1 audit report
- ✅ Cumulative cash: $2K–4K

---

## 8. MONTH 3 (T3) — Course launch + Audit pilot for ICP-E

### Goals
- Ship Course "AI Agent đầu tiên kiếm tiền" (cohort 1, 30-50 students)
- First LLMOps Audit pilot (ICP-E) — $3K Founding Customer
- OSS repo v0.5 with traction signals (50+ stars)
- Second B2B Sprint A
- Cost optim pass 1 done — Scope A ≤$1/run

### Critical ships M3

- Course landing + Stripe + 4 module recorded
- LLMOps Audit page on website (offer + pricing)
- B2B Sprint A #2 delivered
- OSS v0.5 với 5+ examples + bilingual README

### KPI gate end of M3

| Metric | Target T3 EOD |
|---|---|
| TikTok followers | 1,500 |
| YouTube subs | 300 |
| Substack subs | 200 |
| Email list | 800 |
| OSS stars | 50 |
| B2B logos cumulative | 2 |
| Course students | 30 |
| MMO MRR | $1,000 |
| B2B revenue cumulative | $3–5K |
| Cumulative cash | $5–8K |
| MAESTRO baselines L3 | 4 |
| Engine cost/Scope A | ≤$1 |

**Decision gate T3:**
- ✅ Pass T3: continue Phase 1 plan
- ⚠️ Caution: TikTok < 800 → review freelance creator, có thể đổi
- ❌ Stop: Engine cost > $3/Scope A → freeze new agents, optim pass

---

## 9. MONTHS 4–6 (T4–T6) — Productize + Scale

### Month 4 (T4) — Architecture sprint + content compound

**Ships:**
- 1 B2B Architecture Sprint (Scope B) — $3–5K
- LLMOps Audit #2 — $3–5K
- Course iteration (cohort 2 hoặc evergreen)
- 6 baseline L3 (B08, B10 added)
- Engine v1 (Scope A 80% auto verified)

### Month 5 (T5) — Throughput + Engine v1.5 spec

**Ships:**
- 2-3 B2B Sprint deliveries (mix Scope A/B)
- Course cohort 2 (50 students)
- OSS v1.0 launch — Hacker News + Product Hunt
- Engine v1.5 spec (multi-tenant ready)
- 7 baseline L3

### Month 6 (T6) — Phase 1 close + Phase 2 spec

**Ships:**
- 3 B2B logos cumulative (file 03 KPI target)
- $4–6K MRR cumulative (PDF + Prompt Pack + Course + Sprints + Audit)
- Engine Scope C reliable
- Phase 2 plan documented (next-quarter sprint plan)
- Month 6 retro + decision gate

### KPI gate end of M6 (Phase 1 close)

| Metric | Target T6 |
|---|---|
| Total followers (TT+YT+Threads+LI) | 5,000 |
| Email list | 1,500 |
| OSS stars | 100–200 |
| MMO MRR | $2,500 |
| B2B revenue cumulative | $12K |
| Course students cumulative | 80 |
| Total MRR | $4–6K |
| MAESTRO baselines L3 | 5 |
| Engine phase auto rate | 80% |
| B2B inbound leads/tháng | 8 |

---

## 10. Per-Founder Phase 1 Roadmap (1 page each)

### CEO (P1) — LLMOps + Content

| Month | Build | Content | Customer |
|---|---|---|---|
| M1 | 13 agent cards + eval v1 + Engine support | 3 YT + 3 Substack + 80 X tweet + OSS skeleton | Backstop tech for P3 sales |
| M2 | Cost optim pass 1 + B05/B07 baselines | 4 YT + 4 Substack + OSS + B05 deep dive | Tech support B2B project 1 |
| M3 | Course recording + LLMOps Audit playbook | 4 YT + 4 Substack + OSS v0.5 (50 stars) | LLMOps Audit pilot delivery |
| M4 | Engine v1 + B08 baseline | 4 YT + 4 Substack + 1 podcast guest appearance | Audit #2 + tech for Sprint B |
| M5 | OSS v1.0 launch + B10 baseline | OSS launch HN/PH + 4 YT + 4 Substack | Tech for 2-3 B2B sprints |
| M6 | Engine Scope C reliable + Phase 2 spec | 4 YT + 4 Substack + retro post | Tech for ongoing |

**CEO content Phase 1 cumulative:** 23 YouTube + 23 Substack + ~600 X tweet + OSS public 100-200 stars

### P2 — Engine + Web

| Month | Build | Side |
|---|---|---|
| M1 | Engine MVP (R-α invoke) + Mission Control UI v0.2 | — |
| M2 | Engine Scope B + Scope C skeleton + cost dashboard | — |
| M3 | Engine v1 (Scope A 80% auto) + course platform setup | 1 dev.to post (optional) |
| M4 | Engine v1 polish + memory feedback loop ship | — |
| M5 | Engine v1.5 spec (multi-tenant ready) | OSS contribute (engine skeleton) |
| M6 | Engine Scope C reliable + Phase 2 architecture | — |

### P3 — Sales/CS/Ops

| Month | Sales/CS | Content | Ops |
|---|---|---|---|
| M1 | 40 outreach + 1 LOI vendor contract employer | LinkedIn 8 post + audit report 1 (3PL) | Founder agreement, bank, brand |
| M2 | First B2B project kickoff + delivery PM | LinkedIn 12 post + audit report 2 (E-com) + freelance hire | Onboard freelance |
| M3 | LLMOps Audit pilot + course launch sales | LinkedIn 12 + niche audit follow-up | Course platform + Stripe |
| M4 | 2 B2B sprints (Scope A/B) | LinkedIn 12 + 1 in-person event (VLA) | Hire freelance editor (if scaling) |
| M5 | 3 B2B sprints + 1 retainer signed | LinkedIn 12 + speaking attempt | — |
| M6 | Phase 1 close + Phase 2 sales pipeline | LinkedIn 12 + retro post | Annual review, taxes prep |

---

## 11. Decision gates summary (consolidated từ files 03 + 06 + 07)

| Gate | When | Pass criteria | Action if fail |
|---|---|---|---|
| **G1 — Foundation** | End W1 | 13 agents + Engine R-α + LOI in flight | Freeze content, all-hands fix |
| **G2 — First ship** | End W2 | PDF on sale + Scope A working | Debug Scope A, defer agents 6–13 |
| **G3 — Pipeline** | End W3 | Audit report 100+ DL + vendor contract sent | Boost distribution, không panic |
| **G4 — Month 1** | End W4 | LOI signed + Engine 80% auto + content traction | 1 week off + retro deep nếu 3 fail cùng lúc |
| **G5 — T2** | End M2 | 1 paying B2B + freelance shipping + Scope C working | Pause new agents, refine engine |
| **G6 — T3** | End M3 | Course launched + Audit pilot delivered + 50 OSS stars | Reposition content nếu OSS < 20 stars |
| **G7 — T4** | End M4 | Engine v1 stable + 2 B2B logos + cost ≤$1/Scope-A | Cost optim pass 2 nếu cost > $1.5 |
| **G8 — T5** | End M5 | 5+ B2B logos + OSS v1.0 launched | Sales motion review nếu < 4 logos |
| **G9 — T6 (Phase close)** | End M6 | $4–6K MRR + 3 B2B + 5 baselines + Engine 80% | Phase 2 strategy revisit |

---

## 12. Risks & recovery plays

| Risk | Probability | Recovery play |
|---|---|---|
| Engine không build được Scope A trong M1 | 30% | Đơn giản hoá: Scope A = 3 agent thôi (R-α, R-γ, R-σ). Defer R-β. |
| TikTok freelance đầu tiên flop | 50% | Test 2 candidate parallel, không lock 1 người |
| Vendor contract employer bị đẩy lùi | 40% | Pivot ICP-E (LLMOps audit) làm anchor customer thay |
| OSS repo zero traction (< 20 stars trong 8 tuần) | 40% | Reposition README + dùng X EN viral hơn + dev.to crosspost |
| CEO burnout content cadence | 30% | Cắt YouTube xuống 1/3 tuần (3 tuần per video) — không bỏ kênh |
| P3 không close được B2B deal nào trong M2 | 25% | CEO join discovery call, technical credibility close gap |
| Cost API > $500/mo M1 | 20% | Switch Haiku cho 80% task, lock Sonnet cho synthesis only |
| 1 founder muốn quit | 10% | Vesting cliff bảo vệ; equity re-discuss; 1 tuần off founder + retro |
| Claude version update breaks eval | 60% | File 07 §4.4 — daily eval sample alert, lock version trong code |
| Content + sales lệch — content viral nhưng zero sale | 25% | Add CTA mạnh hơn cuối content, landing page A/B test |

---

## 13. Tracking — File + tool nào ghi gì

### Daily
- **Standup** — Discord #standup channel (3 dòng/founder)
- **Cost log** — Helicone dashboard auto

### Weekly
- **Sprint planning** — `docs/sprints/W{N}-plan.md`
- **Sprint review** — `docs/sprints/W{N}-review.md` (ship/cut/carry)
- **KPI snapshot** — `docs/kpi/weekly.csv` (manual update)
- **Eval report** — `evals/reports/W{N}.md` (auto-gen by R-eval khi available)

### Monthly
- **Month retro** — `docs/retros/month-{N}.md`
- **KPI vs target** — `docs/kpi/month-{N}.md`
- **Cost trend** — `docs/cost/month-{N}.md`
- **Pipeline review** — Notion CRM filter "this month"

### Quarterly (T3, T6)
- **Self review per founder** — `docs/personal/{founder}-Q{N}.md`
- **Team retro** — `docs/retros/Q{N}-team.md`
- **Strategy update** — update file 01-08 nếu có pivot

### Tools
- **Project board:** Notion hoặc Linear (P3 own)
- **Code:** GitHub private monorepo (P2 own)
- **Knowledge:** Markdown trong monorepo `docs/` (CEO+P3 own)
- **CRM:** Notion table (P3 own) — name, company, ICP, stage, next action, value
- **Cost:** Helicone (CEO own)
- **Eval:** YAML in `evals/` Git-tracked (CEO own)
- **Communication:** Discord async + 1 weekly call Friday
- **Newsletter:** Beehiiv (CEO)
- **Course:** Teachable / Podia (P3) hoặc Notion + Stripe (P3) cheaper Phase 1

---

## 14. Anti-patterns Phase 1 (KHÔNG làm)

- ❌ "Hire 1 dev nữa cho nhanh" trong M1–M3 — wait until MRR > $20K (file 03 §7)
- ❌ Free pilot không có roadmap convert → Founding Customer 50% off thay
- ❌ Pivot strategy 4 tháng đầu trừ 3 trigger trong file 06 §7.4
- ❌ "Tuần này thử thêm Reddit" — không, lock 4 channel (file 05 §5)
- ❌ Carryover task sang tuần sau quá 1 lần — cut hoặc descope
- ❌ "Đợi hoàn hảo rồi ship" — 80% ship hôm nay > 100% next week
- ❌ Skip standup async vì "không có gì mới" — vẫn post 1 dòng "no blockers"
- ❌ Founder nào đó làm > 50h/tuần liên tục 2 tuần → flag, cap
- ❌ Đổi stack lock (file 06 §7.1) trong 6 tháng đầu
- ❌ Take outsource ngoài 5 ICPs để cứu cash (đã confirm không cần cash)

---

## 15. Tóm tắt 1 trang

```
PHASE 1 = 6 tháng (T0-T6) — VALIDATE FLYWHEEL

WEEK 1: 13 agent cards + Engine R-α invoke + 1 LinkedIn post + 10 DM
WEEK 2: PDF $19 ship + Scope A pipeline + YT video #1 + audit 50%
WEEK 3: Prompt Pack ship + Audit report publish + Vendor contract sent
WEEK 4: LOI signed + Scope C skeleton + OSS public + 50 TikTok followers

MONTH 2 (T2): First B2B paid + Freelance MMO + Engine Scope C + 5 baselines partial
MONTH 3 (T3): Course launch + LLMOps Audit pilot + OSS 50 stars + cost ≤$1/A
MONTH 4 (T4): 2 B2B sprints + Engine v1 stable + 6 baselines + Audit #2
MONTH 5 (T5): 2-3 sprints + OSS v1.0 launch HN/PH + 7 baselines + Engine v1.5 spec
MONTH 6 (T6): Phase 1 close — $4-6K MRR + 3 B2B + 5 baselines + Engine 80%

CADENCE:
  Daily standup async | Weekly sprint Mon plan / Fri review
  Monthly KPI + retro | Quarterly strategy review

OWNERSHIP:
  CEO — LLMOps + ML + technical content (12h content/tuần locked)
  P2  — Engine + frontend + integration
  P3  — Sales + CS + Ops + B2B content + freelance MMO mgmt

DECISION GATES: 9 gates W1→M6, mỗi gate có go/no-go criteria

BUDGET PHASE 1: ~$5K (API $1.5K + tools $300 + freelance MMO $1.6K + content gear $500 + buffer)
EXPECTED RETURN PHASE 1: $7-10K cumulative cash → net +$2-5K positive

KPI EXIT T6:
  5K followers | 1.5K email | $4-6K MRR | 3 B2B logos | 5 baselines | Engine 80% auto
```
