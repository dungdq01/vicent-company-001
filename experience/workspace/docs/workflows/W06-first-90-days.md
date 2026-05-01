# W06 — First 90 Days Playbook

> **Khi nào chạy**: Day 0 khi launch studio · **Người chạy**: 3 founder (CEO/COO/CTO) · **Input**: Cả docs stack đã ready (L1–L5) + cá nhân ready · **Output**: Day 90 = studio đang chạy với ≥ 1 paying client, rhythm stable, 1 retro loop hoàn chỉnh · **Thời gian**: 90 ngày calendar

---

## 0. Target State @ Day 90

End state phải đạt được:

- ✅ **≥ 1 paying client** đã hoàn thành full Sprint A hoặc B (tiền về bank)
- ✅ **≥ 1 deal** $2K+ đang trong pipeline Sprint C/D
- ✅ **Daily rhythm** (W01) chạy ≥ 80% ngày làm việc
- ✅ **Weekly cadence** (W02) chạy 100% tuần, có retro docs
- ✅ **≥ 1 full retro loop** hoàn thành → ≥ 3 memory promotions thực thi
- ✅ **Engine MVP** dispatch được ≥ 1 agent end-to-end (orchestrator alive)
- ✅ **Content machine**: ≥ 8 piece xuất bản (2/tuần × 4 tuần gần nhất)
- ✅ **Financial**: runway ≥ 6 tháng, MRR/milestone trackable
- ✅ **No Sev 0 incident** pending
- ✅ **Rules compliance audit**: 1 project random ≥ 90%

Nếu Day 90 thiếu bất kỳ mục trên → tuần 13 = **re-plan session**, không vội sang Phase 2.

---

## 1. Phase breakdown

```
Day  0–14   Foundation      — setup infra, docs read-through, first content
Day 15–45   First revenue   — close first deal, deliver Sprint A/B, cash in
Day 46–75   Rhythm stable   — W01+W02 hàng tuần, second deal, engine MVP
Day 76–90   Compound        — retro loop complete, refine, prep Phase 2
```

---

## 2. Week-by-Week Plan

### Week 1 (Day 0–7) — Docs Read-Through + Infra

**Goal**: 3 founder cùng đọc + đồng ý 1 version truth của docs. Infra sẵn sàng.

| Day | Who | What | Output |
|---|---|---|---|
| 0 | All | Kickoff meeting 3h: đọc `README.md` + `01-FRAMEWORK.md` + `00-OPERATING-MANUAL.md` cùng nhau | meeting notes trong `projects/_ops/kickoff.md` |
| 1 | CEO | Đọc full `business-strategy/01-08` | comments inline |
| 1 | COO | Đọc full `business-strategy/09-18` | comments inline |
| 1 | CTO | Đọc full `_shared/rules/` + `_shared/.agents/README.md` | comments inline |
| 2 | All | Sync: tổng hợp comments, chốt open questions ≤ 10 | `kickoff.md §questions` |
| 3 | CTO | Setup infra: git repo, Linear/GitHub projects, Slack channels, Wave/Stripe, 1Password shared | checklist done |
| 3 | COO | Legal: studio entity, bank account, contract template review | entity registered |
| 4 | All | Setup monitoring + channels: `#studio-ops`, `#incidents`, `#personal-{each}` | channels live |
| 5 | All | **First Mon planning** theo W02 §1 cho Week 2 | `week-01.plan.md` |
| 6–7 | — | weekend off / buffer | — |

**Hard checkpoints**:
- Day 3: infra + legal done; nếu không → delay launch.
- Day 5: tất cả founder đọc xong docs core.

---

### Week 2 (Day 8–14) — First Content + Network Warming

**Goal**: xuất hiện public, warming pipeline.

| Day | Who | What | Output |
|---|---|---|---|
| 8 | CEO | Publish `#1` content piece (manifesto/intro post) | Substack/LinkedIn |
| 9 | All 3 | Mỗi người liệt kê 20 contacts cũ có thể là lead/referrer | contacts.csv |
| 10 | All 3 | Gửi "I'm starting X" message đến 60 contacts (20 × 3) | `pipelines-business/sales/S0-*.md` metrics |
| 11 | CTO | Deploy engine MVP skeleton: orchestrator Next.js app, 1 agent (T1-intake) working | repo + first dispatch test |
| 12 | CEO | Publish `#2` content piece (case thinking / teardown) | — |
| 13 | All | **First Fri retro** W02 §5 — rất ngắn vì ít data | `week-02.retro.md` |

**Metrics**: 60 outreach messages sent; ≥ 5 reply; ≥ 2 discovery call scheduled cho Week 3.

---

### Week 3–4 (Day 15–28) — First Discovery Calls

**Goal**: chuyển reply → discovery → intake.

- **Daily W01** chạy đủ.
- **Content 2/tuần**: mỗi CEO publish 1 piece × 2 tuần = 2 more, thành tổng 4.
- **S1 + S2 cycles**: chạy 5+ discovery call trong 2 tuần. Dùng `pipelines-business/sales/S2-DISCOVERY.md` checklist.
- **Engine**: add agent T2-architect + T2-proposal → test với mock intake.
- **Knowledge seeding**: populate `knowledge/industries/I{vertical-chosen}/` tối thiểu 1 industry deep.

**Metrics Day 28**:
- ≥ 1 intake signed (P0 completed), kể cả MMO $30 để test pipeline.
- Engine dispatch được 3 agent end-to-end (T1, T2, T3).
- 4 content pieces live; tổng reach > 500 nếu lucky.

---

### Week 5–6 (Day 29–42) — First Delivery (Sprint A/B)

**Goal**: giao hàng dự án đầu, thử xuyên W03 walkthrough lần đầu.

- **Dự án 1** chạy theo W03: MMO $30 hoặc SMB $500–2K POC.
- **Sprint A**: P0 → P1 → P2 (PDF deliverable). Total 1–2 tuần real time.
- Mọi step phải tuân `W04` agent dispatch runbook. Ghi chép tỉ mỉ.
- **Day 35**: ship dự án 1, nhận cash.
- **Day 36–42**: retro dự án 1 (template `99-retro.md`) + áp dụng learning ngay.

**Human checkpoints**: CEO review output kỹ hơn bình thường (đây là lần đầu, cần calibrate).

**Metrics**:
- Dự án 1 delivered + invoice paid.
- Engine cost thực tế vs estimate: gap ≤ 30%.
- Eval pass rate ≥ 70% (mới, chấp nhận thấp hơn steady-state).
- ≥ 2 memory promotions từ retro.

---

### Week 7–8 (Day 43–56) — Second Deal + Cadence Lock-in

**Goal**: deal thứ 2 vào pipeline (larger), W01+W02 thành muscle memory.

- **Pipeline**: ≥ 2 SMB deal đang discovery, ≥ 1 Mid deal đang qualify.
- **Close deal 2** Day 50 target: $2–5K Sprint B (POC with proposal + architecture).
- **Engine v0.2**: add eval layer (LLM-as-judge), cost dashboard, basic monitoring.
- **Content**: maintain 2/tuần, đã có 8 pieces total.
- **First monthly rollup** (Day 30 tương đương nhưng rơi vào Week 8 nếu tính calendar): review `business-strategy/03-goals-and-roadmap.md`, bump OKR nếu cần.

**Failure modes thường gặp tuần này**:
- Founder exhausted → schedule 1 full day off / tuần cho mỗi người từ nay.
- Engine cost cao hơn expect → prompt revision sprint 1 tuần.
- Client 1 ask for more (scope creep) → practice SCR thật.

---

### Week 9–10 (Day 57–70) — First QBR + Process Tune

**Goal**: client 1 vào CS cycle; process refinement.

- **CS1 → CS2 QBR** cho client 1 (Day 65 tương đối): review outcome, ask testimonial, explore expand.
- **Deal 2 deliver**: Sprint B hoàn thành nếu đúng schedule.
- **Rules audit**: CTO audit 1 random project — compliance score target ≥ 85%.
- **Memory promotion ceremony** tuần 10 (W02 §5.5): mục tiêu ≥ 5 promotions.
- **Content**: thử 1 format mới (video / podcast / long-form teardown) để tìm fit.

---

### Week 11–12 (Day 71–84) — Compound

**Goal**: hiệu quả bắt đầu compound — agent tốt hơn, sales playbook refined, content reach tăng.

- **Deal 3** vào pipeline target: Mid-level $10–25K (Sprint C). Có thể chưa close nhưng phải là active conversation.
- **Engine v0.3**: multi-agent parallel dispatch (P4 design parallel test trên dự án 2 hoặc mock).
- **Skill card updates**: dựa trên 2 project đã chạy, update ≥ 3 skill card versions.
- **Content**: piece có ≥ 2K views → case study riêng.
- **Financial review**: COO compile `business-strategy/15` monthly → runway check, MRR project, cost trajectory.

---

### Week 13 (Day 85–90) — Phase 2 Readiness Review

**Goal**: quyết định go/no-go cho Phase 2 (Day 91+).

- **Day 85**: ba founder off-site 4h (W02 §8 quarterly review style, tuy mới là Q1):
  - Review Target State §0 — hit được bao nhiêu?
  - Nếu hit ≥ 8/10 checkpoints → go Phase 2 focus (scale: deal flow, second vertical, hire #1?)
  - Nếu hit 5–7 → consolidate 1 tháng: fix weakest 2 mục trước khi scale
  - Nếu hit < 5 → root cause, có thể revise strategy, không scale premature
- **Day 88**: deliver Phase 2 plan doc → `business-strategy/09-phase2-execution-plan.md` (create nếu Phase 2 approved).
- **Day 90**: comms internal + public post "90 days in" — công khai lessons, build trust.

---

## 3. Day 0 Essentials Checklist

Trước Day 1 launch, những thứ này PHẢI tồn tại:

### Docs (L1–L5)
- [ ] `README.md`, `00-OPERATING-MANUAL.md`, `01-FRAMEWORK.md` đọc xong
- [ ] `_shared/rules/` 8 files đọc xong
- [ ] `_shared/.agents/README.md` + ≥ 5 skill card tier 1–4
- [ ] `_shared/prompts/RULES-PREAMBLE.md` ready để inject
- [ ] `_shared/templates/project/` 23 files có sẵn
- [ ] `experience/workspace/docs/pipeline/P0–P9` có sẵn
- [ ] `experience/workspace/docs/workflows/W00–W07` có sẵn (this file cluster)
- [ ] `experience/workspace/docs/pipelines-business/` có sẵn
- [ ] `business-strategy/` 18 files có sẵn
- [ ] `knowledge/` ít nhất 1 industry + 3 baseline có data

### Infra
- [ ] Git repos: workspace, engine app, knowledge
- [ ] Project tracker: Linear or GitHub Projects
- [ ] Slack workspace với channels: `#studio-ops`, `#incidents`, `#retro-temp`, `#personal-{each}`, `#client-{template}`
- [ ] Email: `hello@studio.com`, `accounts@studio.com`
- [ ] Hosting: Vercel/Railway account
- [ ] LLM API: Anthropic key + OpenAI fallback key
- [ ] Payment: Wave or Stripe invoicing setup
- [ ] Password manager: 1Password shared vault
- [ ] Monitoring: UptimeRobot / Better Stack free tier
- [ ] Docs hosting: Notion or GitHub wiki hoặc Obsidian Publish

### Legal / Finance
- [ ] Studio entity registered (LLC / cty TNHH)
- [ ] Bank account active
- [ ] SOW template reviewed by lawyer (1-time cost ~$500)
- [ ] NDA template ready
- [ ] Basic liability insurance (nếu enterprise target)
- [ ] Tax setup (per jurisdiction)

### People
- [ ] 3 founder aligned trên strategy, roles, equity
- [ ] Roster on-call (W05)
- [ ] Emergency contacts list (W05 §10)
- [ ] Personal runway ≥ 6 months xác nhận (CEO + COO + CTO)

---

## 4. Time Allocation (guideline per founder)

**Per week (40h working, không tính overtime)**:

| Activity | % | Hours |
|---|---|---|
| Deep-work (MIT) | 50% | 20 |
| Sales outreach + discovery calls | 15% | 6 |
| Agent dispatch + review | 10% | 4 |
| Content creation | 10% | 4 |
| Ops cadence (W01+W02) | 8% | 3 |
| Admin / finance / email | 5% | 2 |
| Learning / reading | 2% | 1 |

**Red flags**:
- Sales < 10% / tuần trong 90 ngày đầu → không đủ pipeline (Day 90 sẽ thiếu deal).
- Agent dispatch > 20% → quá thủ công; đầu tư orchestrator tự động.
- Content = 0 → pipeline dài hạn chết; reallocate từ deep-work.

---

## 5. Budget (guideline, $USD)

**Starting capital recommendation**: $15–25K cho 90 ngày (3 người, tiết kiệm mode).

| Bucket | $ budget Day 0–90 | Notes |
|---|---|---|
| Infra (hosting, domains, tools SaaS) | $300 | mostly free tier + $30/mo hosting |
| LLM API (test + dev + 2 projects) | $500 | eval cao vì test nhiều |
| Legal setup | $800 | 1-time SOW + NDA review + entity |
| Accounting / bank fees | $200 | |
| Marketing (content tools, none paid ads) | $100 | Canva/Buffer free → low |
| Founder stipend (if not 100% savings) | variable | depends on founder runway |
| **Buffer 20%** | $500 | incidents |
| **Total ex-stipend** | ~$2,400 | |

**Revenue target Day 90**: ≥ $3K collected (1 Sprint B deal). Ideally $5–8K.

---

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Không close deal nào Day 60 | Medium | High | Weekly pipeline review; if empty by Day 45 → drop pricing tier, go MMO $30 volume |
| Founder burnout | Medium | High | Mandatory 1 day off/week; Fri hard stop 17:30 |
| Engine blow up cost runaway | Low | Medium | Hard caps per project `_state.json.cost_burn.llm_spend_cap`; daily monitor |
| Client cancellation mid-delivery | Low | High | SOW kill fee 50% if cancel mid-delivery; practice in SOW review |
| Scope creep first deal | High | Medium | Practice SCR from project 1; don't absorb "just one more thing" |
| Conflict giữa 3 founder | Medium | Critical | Weekly 1-on-1 rotation; W02 retro blameless rule; 90-day equity cliff tránh anchor |
| Docs out-of-date Day 60 | High | Medium | Update rules require docs touch; CTO audit Day 60 |
| Sev 0 incident first month | Low | Critical | W05 preparation in Week 1 checklist |

---

## 7. Milestones Gate

| Milestone | Target day | Gate — nếu miss thì làm gì |
|---|---|---|
| Infra ready | 3 | Delay Week 2; không launch content |
| 60 outreach sent | 14 | Double Week 3 outreach; CEO ưu tiên 100% sales |
| First intake signed | 28 | Price drop sang MMO; push volume; no scope gt Sprint A |
| First $ collected | 42 | 3 founder emergency meeting; re-strategize sales |
| W01+W02 adherence ≥ 70% | 56 | Simplify cadence; cut meeting length |
| First retro loop complete | 70 | Fri retro focus; skip Mon planning if needed to catch up |
| Second deal in delivery | 80 | Aggressive discount day 85 to close if needed |
| Day 90 review | 90 | Go / consolidate / revise decision |

---

## 8. What NOT to do in first 90 days

Hard prohibitions (rút từ `_shared/rules/00-MASTER-RULES.md` §anti-FOMO):

- ❌ Hire full-time employee #4 (too early, cash burn)
- ❌ Switch tech stack mid-stream (commit to stack chosen Day 0)
- ❌ Add second service line (e.g., thêm "we also do data analytics") — stay focused
- ❌ Raise external funding (bootstrap 90 days trước khi evaluate)
- ❌ Build custom internal tool when SaaS exists (Linear > custom PM, etc.)
- ❌ Attend > 1 conference (distraction + cost)
- ❌ Take on >2 concurrent Sprint D projects (capacity lock)
- ❌ Change pricing sheet in first 60 days (need data points first)
- ❌ Skip W02 Fri retro even "just once" (compound broken)

---

## 9. Cross-References

- Strategy: `@../../../../business-strategy/01-strategy-overview.md`, `03-goals-and-roadmap.md`, `09-phase1-execution-plan.md`
- Ops SOP: `@../../../../business-strategy/15-business-operations.md`
- Daily rhythm: [`W01-daily-operating-rhythm.md`](W01-daily-operating-rhythm.md)
- Weekly cadence: [`W02-weekly-cadence.md`](W02-weekly-cadence.md)
- E2E project: [`W03-new-project-walkthrough.md`](W03-new-project-walkthrough.md)
- Agent dispatch: [`W04-agent-dispatch-runbook.md`](W04-agent-dispatch-runbook.md)
- Incident ready: [`W05-incident-response.md`](W05-incident-response.md) §10
- Sales pipeline: `@../pipelines-business/sales/`
- Rules master: `@../../../../_shared/rules/00-MASTER-RULES.md`

---

*Last updated: 2026-04-26 · v1.0 · Bootstrap playbook*
