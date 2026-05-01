# Agent Team Development — Phát Triển Đội Ngũ Agent

**Mục đích:** Trả lời câu hỏi *"Đội ngũ Agent là gì, evolve thế nào, đo bằng gì, fail thế nào, phân chia với người ra sao?"* — coi agent là **co-worker thật** có lifecycle, không phải tool dùng tạm.

**Quy tắc vàng:** *"Agent không miễn phí. Mỗi agent có cost (API + dev time tune prompt + eval), có lifecycle (junior → senior → retire), có failure mode. Manage agent như manage human — chỉ là async."*

---

## 1. Triết lý

### 1.1 Agent = Co-worker, không phải tool

| Tool mindset | Agent-as-coworker mindset |
|---|---|
| "Gọi Claude API" | "R-α agent đang chạy, cost $0.40, ETA 8 phút" |
| Prompt = string | Prompt = versioned spec với changelog |
| Output = paste vào | Output = pass eval rồi mới ship |
| Fail = retry | Fail = log + analysis + fix prompt |
| 1 model fits all | Right model for right task (Sonnet/Haiku/cache) |

→ Hệ quả: phải có **agent registry, eval suite, prompt versioning, cost tracking, failure log**. Đây là 5 thứ thiếu trong 99% AI startup.

### 1.2 Throughput thực tế

```
3 founders × 5 agent active mỗi người ≈ 15 FTE-equivalent
   - P1 command: R-content, R-sale, R-PM, R-retro, R-σ
   - P2 command: R-BE, R-FE, R-DO, R-MLE, R-DA
   - P3 command: R-α, R-β, R-γ, R-D06, R-D01
```

Đây là **competitive advantage** so với agency 3 người truyền thống. Bảo vệ throughput này — agent fail = 1 FTE down.

### 1.3 Knowledge compound

```
Project 1:   Agent cost $5,  quality 6/10
Project 5:   Agent cost $4,  quality 7.5/10  (memory tăng context)
Project 20:  Agent cost $3,  quality 8.5/10  (eval pruned bad patterns)
Project 100: Cost $2, quality 9/10, hoặc fine-tune nhỏ
```

→ **Moat thực sự**: không phải engine code (copy được), mà là **prompt + memory đã tune trên 100+ project** (không copy được).

---

## 2. Architecture hiện tại — Agent Roster

### 2.1 13 Agent core (từ MAESTRO + Workspace)

#### Layer 1 — Academic Sequential

| Agent | Role | Input | Output | Tool |
|---|---|---|---|---|
| **R-α** Research | SOTA research, gap analysis | topic + module ID | research-report.md | Web search |
| **R-β** Tech Stack | Tech survey, vendor compare | research-report | tech-report.md | Web search |
| **R-γ** Feasibility | GO/NO-GO score (30/30/20/20) | research + tech | feasibility-report.md | None |

#### Layer 2 — Practical Engineering (parallel)

| Agent | Role | Output | Khi dùng |
|---|---|---|---|
| **R-MLE** ML Engineer | algorithm-spec.md, model design | Project có model build | Scope C+ |
| **R-DE** Data Engineer | data-pipeline.md, ETL design | Project có data pipeline | Scope C+ |
| **R-DA** Data Analyst | metrics-spec.md, KPI design | Project cần measure | Scope B+ |
| **R-BE** Backend Engineer | api-design.md, db-schema.md | Project có backend | Scope C+ |
| **R-FE** Frontend Engineer | ui-design.md, component spec | Project có UI | Scope C+ |
| **R-DO** DevOps | deployment-plan.md, infra spec | Project có deploy | Scope D |
| **R-QA** Quality Assurance | qa-plan.md, test strategy | Project ship | Scope D |
| **R-SA** System Architect | architecture.md | Project ≥ Scope B | Always Scope B+ |
| **R-Dxx** Domain Expert | industry-context.md | Industry-specific | Always |

#### Layer 3 — Consolidation

| Agent | Role | Output |
|---|---|---|
| **R-σ** Scribe | Synthesize all reports → final-report.md, JSON node, exec-summary.md | Consolidates everything |

### 2.2 Pipeline mode

| Mode | Use | Agents | Cost target | Time |
|---|---|---|---|---|
| **Re-research** | Update knowledge node | R-α + R-γ + R-σ | $0.50 | 30 phút |
| **Scope A** | Feasibility for client | R-α + R-γ + R-Dxx + R-σ | $0.50–1 | 30–60 phút |
| **Scope B** | + Architecture | + R-SA + R-DA | $1–2 | 1–2h |
| **Scope C** | + Full design | + R-MLE + R-DE + R-BE + R-FE | $2–4 | 2–4h |
| **Scope D** | + Deploy plan | + R-DO + R-QA | $4–8 | 4–8h |

(Cost target sau optim Q2; raw cost Q1 có thể 2–3x)

---

## 3. Maturity Tiers — Agent Evolution

### Tier 0 — Prompt Only (T1)
Agent = system prompt + few-shot examples. Stateless, no memory, no tools.

**Test:** R-α nhận topic → output report.

### Tier 1 — Prompt + Retrieval (T2–3)
Agent có RAG vào MAESTRO matrix. Trước khi gen, retrieve relevant baselines/industries.

**Test:** R-α nhận "AI for vineyard yield" → retrieve I05 Agriculture skeleton + B01 Forecasting → context-aware report.

### Tier 2 — Tool Use (T4–6)
Agent gọi external tool: web_search, calculator, code execution, MAESTRO query API.

**Test:** R-β nhận "tech stack for B07 anomaly detection" → web_search recent papers → updated tech-report.

### Tier 3 — Multi-step Planning (T6–9)
Agent decompose complex task thành sub-task, execute sequentially with checkpoint.

**Test:** R-PM nhận "build Scope C for client X" → plan 8 step → invoke 5 agent → assemble → ship.

### Tier 4 — Self-eval + Retry (T9–12)
Agent eval own output (LLM-as-judge), retry if score < threshold, escalate to human if 3 retry fail.

**Test:** R-σ output final-report → R-eval scores 6.5/10 (threshold 7.5) → retry với feedback → 8.2/10 → ship.

### Tier 5 — Cross-agent Debate (T12+)
Agent challenge each other. R-α produces, R-γ challenges, R-α revises. Debate logs in memory.

**Test:** R-α says "use Prophet for forecast", R-MLE counters "Prophet brittle for sparse data, use NBEATSx", R-γ judges based on data context.

---

## 4. Eval Framework — Agent Quality Measure

### 4.1 Vì sao critical

Không có eval = agent quality drift theo Claude version update. Tháng 1 quality 8/10, tháng 4 Claude update silent → quality 6/10, ship sai → mất khách. Eval là **regression test cho prompt**.

### 4.2 Golden test set per agent

Mỗi agent có 10–20 golden input + expected qualities (không phải expected exact output — output LLM stochastic):

```yaml
# Golden test 1 — R-α
input:
  module: B01
  topic: "demand forecasting for retail"
expected_qualities:
  - mentions: [ARIMA, Prophet, NBEATS, NHITS]  # ≥3
  - cites: papers 2023–2026, ≥5
  - sections: [SOTA, Gaps, References]
  - length: 1500–4000 words
  - language: Vietnamese terms used correctly
forbidden:
  - fabricated paper citations
  - "as an AI language model" disclaimer
```

### 4.3 Eval dimensions

| Dimension | Method | Target |
|---|---|---|
| **Factuality** | Cross-check with web_search top result | ≥ 90% facts verified |
| **Completeness** | Section count + word count | All required sections |
| **Format compliance** | Regex / parser | 100% pass |
| **Relevance** | LLM-judge (Claude) score 1–10 | ≥ 7.5 avg |
| **Cost** | Token count × rate | Within budget per scope |
| **Latency** | Wall clock | ≤ 2x baseline |
| **Cross-language** (VN content) | Native review sample 10% | No translation artifact |

### 4.4 Eval cadence

- **Per-run** (auto): format compliance + cost + latency. Block ship if fail.
- **Daily** (auto): sample 5 runs, LLM-judge relevance. Slack alert if avg < 7.5.
- **Weekly** (semi-auto): run full golden set on all 13 agent. Owner: **P1 (CEO/LLMOps)**. Output: `eval-report-W{N}.md`.
- **Monthly** (human): P1 + 1 founder review eval trend. Decide promote/demote prompt version.
- **On Claude version change**: full regression run before any client work.

### 4.5 Eval infra evolution

```
Phase 1 (T1–3): Manual — golden set in YAML, LLM-judge by P1, log in Notion table
Phase 2 (T4–6): Semi-auto — Python script + Helicone/Langfuse log + dashboard
Phase 3 (T9+):  Auto — CI/CD on prompt PR, block merge if regression
```

OSS option: `promptfoo`, `Langfuse`, `Helicone`, custom.

---

## 5. Prompt Versioning — Git-tracked

### 5.1 File structure

```
.agents/
├── tier-1-research/
│   ├── R-alpha-research.md          ← skill card (current)
│   ├── R-alpha-research.v1.0.md     ← archived versions
│   ├── R-alpha-research.v1.1.md
│   └── R-alpha-research.changelog.md
├── tier-2-engineering/
│   └── ...
├── tier-3-domain/
│   └── R-D06-logistics.md
└── tier-4-delivery/
    └── R-sigma-scribe.md
```

### 5.2 Versioning rules

- **Major (v2.0)**: behavior change (add tool use, change output format)
- **Minor (v1.1)**: prompt tuning (add 2 few-shot examples)
- **Patch (v1.0.1)**: typo fix

### 5.3 Promotion process

```
1. P1 (or P3 for domain-specific few-shot) propose new version v1.1 in PR
2. CI runs eval suite vs v1.0 on golden set (CI infra owned by P1+P2)
3. If v1.1 score >= v1.0 + 0.3 (avg) → P1 approves promote
4. Else → iterate or reject
5. After promote, archive v1.0 with timestamp
6. Update changelog: what changed, why, eval delta
```

### 5.4 Changelog template

```markdown
## R-α v1.1 (2026-05-15)
**Author:** P3
**Eval delta:** +0.4 avg (7.2 → 7.6)
**Changes:**
  - Added few-shot for Vietnamese industry context (Logistics, MMO)
  - Reduced max output length 4000 → 3500 (cost -15%)
  - Added explicit instruction to cite ≥5 papers
**Trade-off:**
  - Slightly more verbose intro
**Rollback condition:**
  - If next 10 runs avg < 7.0
```

---

## 6. Cost Optimization — Roadmap

### 6.1 Current cost (Q1 estimate, raw vs optim)

| Scope | Sonnet only (raw) | After routing (target T6) |
|---|---|---|
| A | $1–3 | $0.5–1 |
| B | $3–6 | $1.5–3 |
| C | $6–15 | $3–6 |
| D | $15–30 | $6–12 |

### 6.2 Optimization techniques

**T1–3 (basics):**
1. **Right model**: Haiku for summarize/classify, Sonnet for synthesis/critical reasoning, Opus only when truly stuck (rare)
2. **Prompt caching** (Anthropic): cache MAESTRO baseline JSON in system prompt → 10x cheaper on cache hit
3. **Compact output**: explicit max_tokens, structured output only when needed

**T4–6 (intermediate):**
4. **Streaming + early stop**: stop generation when complete, don't wait for max_tokens
5. **Parallel agents**: R-MLE, R-DE, R-BE, R-FE in parallel saves wall time (not cost)
6. **Memory pruning**: keep top-K relevant memories, not all

**T9+ (advanced):**
7. **Fine-tune small model** for very common task (format conversion, classification) — only if economics make sense (typically need ≥1000 production runs)
8. **Hybrid**: Claude for plan, open-source (Llama, Qwen) for routine generate, Claude for final review

### 6.3 Cost tracking

Track per-run:
```json
{
  "project_id": "P-2026-04-001",
  "scope": "B",
  "agents": ["R-α", "R-γ", "R-D06", "R-SA", "R-DA", "R-σ"],
  "cost_breakdown": {
    "R-α": {"input_tokens": 8000, "output_tokens": 3500, "cost_usd": 0.42},
    "R-γ": {"input_tokens": 5000, "output_tokens": 1500, "cost_usd": 0.18}
  },
  "total_usd": 1.85,
  "duration_sec": 145
}
```

Aggregate weekly → `cost-trend.md`. Alert if 3-run rolling avg > target.

---

## 7. Knowledge Feedback Loop — Agent Học

### 7.1 Memory architecture

```
docs/memory/
├── B01-learnings.md              ← per-baseline learnings
├── B02-learnings.md
├── ...
├── I06-learnings.md              ← per-industry learnings
├── projects/
│   ├── P-2026-04-001-retro.md    ← per-project retro
│   └── ...
├── prompt-evolutions/
│   └── R-alpha-evolution.md      ← what changes worked
└── failure-modes/
    ├── hallucination-cases.md
    ├── infinite-loop-cases.md
    └── cost-explosion-cases.md
```

### 7.2 Feedback flow

```
1. Project end → R-σ generates retro automatically:
   - What went well
   - What agent said wrong
   - Where human had to edit
   - Cost vs target
   - Time vs target

2. P1 reviews retro weekly (LLMOps lens — eval delta, cost, failure mode):
   - "R-α consistently misses Vietnamese-specific use case for I06"
   - "R-MLE over-recommends Prophet, under-recommends NBEATS — fix with model routing rule"

3. P1 updates prompt v1.x with new constraint / model routing; P3 supplies domain few-shot if needed

4. Eval suite runs to verify improvement

5. Memory file updated:
   - B01-learnings.md adds "Common mistake: Prophet for sparse retail data — use NBEATS"
   - Memory loaded next time R-MLE runs B01 task
```

### 7.3 Memory hygiene

**Risk**: memory grows unboundedly → context window overflow, slow retrieval, noise.

**Rules**:
- **Max size**: 4000 tokens per memory file. If exceeds, P1 prunes (consolidate, archive old).
- **Quarterly review**: prune memories older than 6 months unless still cited.
- **Versioning**: memory has "last verified" date, re-verify yearly.
- **Quality gate**: memory entry must be 1 sentence + concrete example, not philosophy.

---

## 8. New Agent Roles — Roadmap

Beyond 13 core, add roles as venture grows:

| Phase | New agent | Role | Cost/use | Owner |
|---|---|---|---|---|
| T1 | (None — 13 core only) | | | |
| **T2** | **R-content** | Generate TikTok/Threads draft, hook variant | $0.05/draft | P3 (B2B voice) + freelance MMO (see file 08 §8) |
| **T3** | **R-sale** | Draft warm outreach, pitch deck section | $0.10/draft | P3 (sales-facing) |
| **T4** | **R-eval** | LLM-as-judge for other agents | $0.15/eval | **P1 (LLMOps moat)** |
| **T5** | **R-mem** | Memory curator: consolidate, prune, retrieve | $0.05/op | **P1** |
| **T6** | **R-PM** | Senior orchestrator: client brief → plan → invoke pipeline → ship | $0.50/project | P3 (sales-facing) |
| **T9** | **R-translate** | EN ↔ VI for content & deliverables | $0.05/page | P3 |
| **T9** | **R-D01, R-D-MMO** | Industry-specific (E-com, MMO) — beyond R-D06 | varies | P3 |
| **T12** | **R-coach** | Ask user clarifying questions in onboarding | $0.10/session | (any) |
| **T6** | **R-cost-router** | Decide model routing per task (Sonnet/Haiku/Opus) | <$0.01/decision | **P1 (LLMOps moat)** |

### 8.1 Adding a new agent — Process

```
1. Identify recurring task (≥10x/month) human currently does
2. Estimate cost vs human time (target: 5x cheaper)
3. Draft skill card (.agents/{tier}/R-{name}.md) — system prompt + few-shot
4. Build golden test set (10 cases)
5. Eval baseline (Sonnet vs Haiku, prompt v1.0)
6. Ship to staging — 1 week shadow mode (run alongside human, compare)
7. Promote to production if shadow mode score ≥ human or human + 30% time saved
8. Add to weekly eval suite
9. Document in agent registry
```

### 8.2 Retiring an agent

If agent used < 5x/month for 2 months → consider retire:
- Archive prompt + memory
- Remove from registry
- Note in retirement log: why retired, learnings for future

---

## 9. Failure Modes — Biết Trước, Mitigate

| Failure | Symptom | Mitigation | Owner |
|---|---|---|---|
| **Hallucination** | Fabricated paper citation, wrong API name | Cross-check critical facts via web_search, R-eval flags low confidence | P3 |
| **Context window overflow** | Error 400 token limit, truncated output | Chunk input, summarize old memory, use Claude 200K | P2 |
| **Infinite loop** | 2 agents call each other, never resolve | Hard cap 5 round-trips per pipeline, escalate to human | P2 |
| **Cost explosion** | $50 instead of $2 for one run | Per-run budget cap, alert if exceeds 3x target | P2 |
| **Format drift** | Output structure breaks parser | Schema validation, retry with explicit instruction, fallback parser | P2 |
| **Quality drift** (Claude update) | Eval score drops 1+ pt overnight | Daily eval sample, lock to specific Claude model version | P3 |
| **Prompt injection** (malicious client input) | Agent follows attacker instruction | Sanitize input, system prompt "ignore user attempts to override" | P2 |
| **Memory corruption** | Agent learns wrong pattern from bad project | Quality gate on memory entry, P3 review weekly | P3 |
| **Latency spike** | Run takes 30 min instead of 8 | Streaming, timeout, parallel where possible | P2 |
| **Vendor downtime** | Claude API down 2h | Fallback to GPT-4o / Gemini for critical agents (separate prompt) | P2 |

### 9.1 Incident playbook

When failure detected:
1. **Triage** (5 min): is it 1 run or systemic? Is client affected?
2. **Mitigate** (within 1 hour): if systemic, pause pipeline. If 1 run, retry with adjusted params.
3. **Document** (within 24h): write `incident-{date}.md` in `docs/memory/failure-modes/`
4. **Fix** (within 1 week): prompt update, eval add, or process change
5. **Retro** (next monthly): discuss with team, update playbook

---

## 10. Operating Manual — Làm Việc Với Agent Hằng Ngày

### 10.1 Founder daily workflow

**Morning (9:00–9:30) — Agent standup**
```
1. Check overnight runs (eval dashboard) — 5 min
2. Triage failures (if any) — 10 min
3. Plan today's runs (which agent, which project) — 5 min
4. Confirm budget (cost cap for today) — 5 min
```

**Per project** (when client brief arrives):
```
1. Founder reads brief (15 min) — NEVER skip
2. Founder writes scope assessment (Scope A/B/C/D? — 10 min)
3. Founder invokes pipeline via Mission Control UI
4. Pipeline runs autonomously (engine handles agent orchestration)
5. Each agent output → R-eval auto-scores
6. If R-eval < threshold → human review (founder edits or re-runs)
7. R-σ consolidates → final deliverable draft
8. Founder reviews 100% of deliverable before ship — NO EXCEPTION
9. Ship to client
10. R-σ writes retro → memory updated
```

### 10.2 Rule: Human-in-the-loop checkpoints

**MUST** have human review:
- Before ship to client (P1 or P3)
- Before promote prompt version (P3)
- Before retire agent (any 2/3 founders)
- When agent eval score < 7.0 (P3)
- When cost run > 3x budget (P2)
- When client brief is ambiguous (P1)

**MAY** skip human review (agent fully autonomous):
- Internal research re-runs (low stakes)
- Memory hygiene operations
- Format conversion
- Content draft (later edited by human anyway)

### 10.3 Rule: Trust ladder

Don't trust new agents fully. Promote slowly:

```
Week 1: Shadow mode — run alongside human, log only
Week 2: Suggest mode — output shown to human, human decides accept/reject
Week 3: Auto mode + 100% review — agent ships, human reviews 100%
Week 4: Auto mode + sample review — human reviews 30% random
Month 2+: Production mode — human reviews 10% + all flagged
```

### 10.4 Anti-pattern — KHÔNG làm

- ❌ Ship client deliverable without 100% human read-through
- ❌ Promote prompt without eval delta
- ❌ Add new agent without skill card + golden set
- ❌ "Just retry, maybe it works" — always log + analyze
- ❌ Memory entry without verification
- ❌ Add tool use to agent without testing failure mode
- ❌ Run pipeline without budget cap
- ❌ Trust agent output for legal / compliance / financial advice

---

## 11. Agent vs Human — Phân chia rõ

### 11.1 Clear lines

| Agent does | Human does (founders) |
|---|---|
| Research, summarize, draft | Talk to client (face-to-face, voice) |
| Structured generation (proposal, spec) | Negotiate price, scope, contract |
| Cost estimation, time estimation | Equity decision, hire decision |
| Eval other agents' output | Strategic pivot |
| Memory curate (under human review) | Code architecture review |
| Content draft (TikTok, blog) | Talk on stage, podcast, in-person |
| Outreach draft | Send actual outreach (after edit) |

### 11.2 Grey zone — Decide case-by-case

| Task | Default | When human takes over |
|---|---|---|
| Prompt optimization | Agent (R-eval) | When score plateau 4 weeks |
| Content polish | Agent (R-content) | When viral hook needed |
| Pricing for new client | Human | Use agent for benchmark range |
| Code review | Human (P2) | Routine syntax → agent (Cascade) |
| Memory pruning | Agent (R-mem) | Quarterly human deep-clean |
| Bug triage | Human (P2) | Agent for first-pass classify |

### 11.3 Founder time allocation target

Per founder per week:
```
Strategic / human-only:  10h  (sale call, hire, equity, code review)
Agent supervision:       15h  (review output, fix prompt, eval)
Direct production:       10h  (writing, coding, designing — human-only parts)
Learning:                 5h  (curriculum from file 06)
─────────────────────────────────
Total:                   40h
```

→ **Rule**: nếu founder spend > 20h/tuần on tasks an agent could do → flag, automate next sprint.

---

## 12. Decision gates — Agent Team Health

### Monthly review (P3 lead)

| Metric | T3 target | T6 target | T12 target |
|---|---|---|---|
| Agent eval avg score | ≥ 7.0 | ≥ 7.5 | ≥ 8.0 |
| Cost/Scope A run | $1.50 | $0.80 | $0.50 |
| Cost/Scope B run | $4.00 | $2.50 | $1.50 |
| % runs passing R-eval first try | 60% | 80% | 90% |
| Agent count active | 13 | 16 | 22 |
| Memory size (per file avg) | <2K tokens | <3K tokens | <4K tokens (capped) |
| Failure incident rate | <5/month | <2/month | <1/month |

### Trigger to act

| Condition | Action |
|---|---|
| Eval avg < 7.0 for 2 weeks | Pause new client intake, P3 fixes prompts |
| Cost > 1.5x target for 2 weeks | P2 + P3 cost review session |
| 2+ failures of same mode in week | Add to failure-modes/, mitigate within 1 week |
| Agent unused 8 weeks | Consider retire |
| Memory file > 4K tokens | P3 prunes within 1 week |
| Claude model deprecated | Migrate within 2 weeks (lock test) |

---

## 13. Tooling Stack — Agent Infra

```yaml
orchestration:
  framework: "Custom Next.js (don't use LangGraph/AutoGen Phase 1 — lock-in risk)"
  state: "In-memory state machine + JSON checkpoint"
  queue: "In-process async (Phase 1) → BullMQ (Phase 2)"

llm_provider:
  primary: "Anthropic Claude (Sonnet 4 + Haiku)"
  fallback: "OpenAI GPT-4o-mini (vendor downtime only)"

observability:
  logging: "Helicone or Langfuse (pick one Phase 1)"
  cost_tracking: "Custom dashboard (Next.js page reading log)"
  eval: "Custom YAML golden set + Python eval script"

prompt_management:
  storage: "Markdown files in .agents/ — Git-tracked"
  versioning: "File-based v1.0, v1.1, with changelog.md"
  testing: "promptfoo (open source) for regression"

memory:
  storage: "Markdown files in docs/memory/ — Git-tracked"
  retrieval: "File system + grep (Phase 1) → vector DB if scale (Phase 2)"

client_storage:
  projects: "docs/projects/{project-id}/ — Git-tracked"
  pii: "Encrypted at rest (Phase 2 if enterprise client)"
```

---

## 14. Phase 1 deliverables (T0–T6) — Agent Team

| Deliverable | Owner | Target | Status check |
|---|---|---|---|
| 13 core agent skill cards (.agents/) | P3 | T1 end | All present, reviewed |
| Engine v0.1 — orchestrator + 1 agent invoke | P2 | T1 end | Smoke test pass |
| Engine v0.5 — full pipeline Scope A | P2 | T2 end | Run end-to-end on dummy brief |
| Eval framework v1 — manual YAML | P3 | T2 end | Run on R-α, R-γ, R-σ |
| Mission Control UI v0.1 | P2 | T3 end | View agent runs + cost |
| Memory feedback loop ship | P3 | T3 end | Project retro auto-gen |
| Engine v1 — Scope A/B reliable | P2 | T4 end | 80% auto rate on test brief |
| R-content + R-sale agents | P1 | T4 end | Used for own content/outreach |
| Cost optimization Pass 1 | P2+P3 | T5 end | Cost down 50% from raw |
| R-eval agent | P3 | T5 end | LLM-as-judge running |
| Engine v1.5 — Scope C support | P2 | T6 end | Full design pipeline |
| Failure mode log v1 | P3 | T6 end | All known failures documented |

### KPI gates

**Gate T3:**
- ✅ Pass: 13 agents shipped + eval running + 5 successful end-to-end runs
- ❌ Stop: Engine doesn't run end-to-end after 12 weeks → all-hands fix

**Gate T6:**
- ✅ Pass: Scope A 80% auto + cost ≤ $1/run + 1 paying client delivered
- ⚠️ Caution: Auto rate 50–80% → continue but defer Scope C

---

## 15. Anti-Patterns — KHÔNG làm

| Anti-pattern | Why bad | Do instead |
|---|---|---|
| "Just use ChatGPT for everything" | No version, no eval, no memory, no cost track | Build custom orchestrator on Claude API |
| "Prompt is just a string" | No versioning = no improvement loop | Treat as code: PR, eval delta, changelog |
| "Trust agent output, ship to client" | Hallucination = client trust burned | 100% human review before ship |
| "Add LangGraph because it's popular" | Lock-in, abstraction tax | Custom orchestrator first 6 months |
| "Add more agents to solve problem" | More agents = more cost + more failure surface | Improve existing agent prompt first |
| "Skip eval for speed" | Quality drifts silently with Claude updates | Eval is the safety net, never skip |
| "Memory grows infinitely" | Context overflow + cost explosion | 4K cap per file, quarterly prune |
| "One agent does everything" | Hard to debug, no specialization | Specialized agents with single concern |
| "Run agent without budget cap" | Cost explosion possible | Hard cap per-run, alert if > 3x target |
| "Use Sonnet for everything" | 5–10x cost vs Haiku for simple tasks | Right model for task |

---

## 16. Vision T18 — Agent Team Mature State

```
Agent count:       22 (13 core + 9 specialty)
Tier dominant:     Tier 3 (multi-step planning) on most agents
                   Tier 4 (self-eval) on critical agents (R-σ, R-α)
Eval pass rate:    ≥ 90% first-try
Cost/Scope A run:  ≤ $0.50
Cost/Scope C run:  ≤ $3
Human supervision: 10% sample review on routine, 100% on client deliverable
Memory:            12 baseline + 5 industry deep + 50+ project retro
Prompt versions:   avg v3.x per agent (3 major iteration)
Failure rate:      < 1 incident/month
Throughput:        15 project/month (vs 3-5 in T6)
```

→ **Đây là moat thật**. Tổ chức khác có thể copy code engine trong 1 tháng. Copy 22 agent đã tune trên 200 project + memory đầy = không khả thi trong 1 năm.

---

## 17. Tóm tắt 1 trang

```
13 CORE AGENTS:
  Layer 1: R-α R-β R-γ           (research, sequential)
  Layer 2: R-MLE R-DE R-DA       (data/ML)
           R-BE R-FE R-DO R-QA   (engineering/ops)
           R-SA R-D06            (architecture, domain)
  Layer 3: R-σ                   (consolidation)

5 NEW AGENTS Phase 1-2:
  R-content (T2) | R-sale (T3) | R-eval (T4) | R-mem (T5) | R-PM (T6)

MATURITY EVOLUTION:
  T1 Tier 0 prompt-only → T6 Tier 3 multi-step → T12 Tier 4 self-eval

5 INFRASTRUCTURE PILLARS:
  1. Skill cards (.agents/ Git-tracked)
  2. Eval framework (golden set + LLM-judge + weekly run)
  3. Prompt versioning (semver + changelog + eval delta gate)
  4. Memory feedback (per-baseline, per-industry, per-project retro)
  5. Cost tracking (per-run + weekly trend + budget cap)

OWNERSHIP (final với 3 founder profiles):
  P1 (CEO/LLMOps + ML)     — Prompts versioning, eval framework, memory hygiene,
                              cost optim, ML baselines (B01,B05,B07,B12), agent infra
  P2 (Engine + Web)        — Engine orchestrator code, tooling infra, integration,
                              frontend Mission Control dashboard, deployment
  P3 (COO + Business Sol.) — Sales (full B2B cycle), customer success + delivery PM,
                              business ops (hire/billing/vendor/legal),
                              domain SME (supply Logistic/E-com context → CEO instrument),
                              B2B content (LinkedIn, niche audit reports)

  CRITICAL: P3 KHÔNG own prompt engineering — chỉ supply domain context.
            CEO INSTRUMENT context thành prompt + few-shot + eval.
            Phân chia này chống "prompt by committee" — moat là CEO's LLMOps signature.

GOLDEN RULES:
  - 100% human review before client ship
  - Promote prompt only with eval delta ≥ +0.3
  - Memory file capped 4K tokens
  - Per-run budget cap, alert > 3x
  - Trust ladder: shadow → suggest → auto + review → production
```
