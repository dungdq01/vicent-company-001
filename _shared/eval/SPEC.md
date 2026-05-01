# OSS Spec — `prompt-eval-framework`

**Mục đích:** Spec build OSS repo CEO sẽ ship W1–W6, target 500–2K stars trong 12 tháng. Đây là **moat artifact** — instrument LLMOps depth của CEO thành code mà engineering buyer trust được.

**Tagline:** *"Eval framework for multi-agent pipelines — built on production runs, not theory."*

**Repo:** `github.com/{brand}/prompt-eval-framework`

---

## 1. Vì sao project này quan trọng

3 vai trò cùng lúc:
1. **Authority signal** — engineering buyer ICP-E thấy repo trước khi nghe pitch
2. **Top of funnel** — GitHub stars + HN/PH launch → email list growth
3. **Hire pipeline** — engineer giỏi muốn join shop có OSS chất lượng
4. **Internal tool** — chính venture cũng dùng để eval 13 agent

→ **KHÔNG phải hobby project.** Đây là sản phẩm marketing đầu tư bài bản.

---

## 2. Positioning vs alternatives

| Tool | Strength | Gap chúng ta fill |
|---|---|---|
| `promptfoo` | General-purpose, popular | Không chuyên multi-agent, ít VN locale support |
| `Langfuse` | Observability platform | Hosted SaaS, không local-first, không CI-friendly |
| `Helicone` | Logging proxy | Chỉ logging, không eval framework |
| `OpenAI Evals` | Standard | OpenAI-centric, ít flexible |
| `LangSmith` | Tied to LangChain | Lock-in |
| **Ours** | **Multi-agent pipeline focus + bilingual + lightweight + Anthropic-first** | Anthropic Claude native, multi-agent debate eval, golden test bilingual, file-based (Git-friendly) |

**Differentiation 1 dòng:** "If you run a multi-agent system on Claude, this is the eval suite designed for you."

---

## 3. Core features (v1.0 target)

### 3.1 MUST have (v0.1 → v1.0)

| Feature | Description | Phase |
|---|---|---|
| **YAML golden test format** | Define test cases declaratively | v0.1 (W1-2) |
| **LLM-as-judge** | Use Claude to score relevance + factuality | v0.1 |
| **Format compliance check** | Regex / parser-based assertions | v0.1 |
| **Cost tracking** | Per-run input/output tokens + USD | v0.2 (W3) |
| **CLI runner** | `pef run` command | v0.2 |
| **Multi-agent pipeline** | Chain agents, eval intermediate + final | v0.3 (W4-5) |
| **Regression detection** | Compare run vs baseline, alert if score drops | v0.5 (W6-7) |
| **Bilingual support** | EN + VI golden tests, LLM-judge cross-lingual | v0.5 |
| **CI/CD integration** | GitHub Action template | v0.7 (W8-9) |
| **Cost budget cap** | Per-run + per-suite USD cap, abort if exceeds | v0.7 |
| **HTML report** | Static dashboard for run results | v1.0 (W10-12) |
| **Parallel execution** | Run multiple agents concurrent | v1.0 |

### 3.2 NICE-to-have (post-v1.0)

| Feature | Phase |
|---|---|
| Helicone/Langfuse integration | v1.5 (M5+) |
| Plugin system (custom assertions) | v1.5 |
| Multi-model support (OpenAI, Gemini fallback) | v1.5 |
| Prompt diff visualization | v2.0 (M9+) |
| A/B test framework | v2.0 |

### 3.3 NEVER (out of scope)

- ❌ Hosted SaaS — local-first only
- ❌ GUI editor for prompts — markdown files Git-tracked, no GUI
- ❌ Lock to specific LLM framework (LangChain/LangGraph)
- ❌ Full observability (use Helicone/Langfuse for that)

---

## 4. Architecture

### 4.1 Stack

```yaml
language: Python 3.11+ primary
secondary: TypeScript port (v1.5 if traction)
deps:
  - anthropic >= 0.40
  - pyyaml
  - pydantic >= 2.0
  - rich (CLI output)
  - tiktoken (token counting)
  - pytest (test infra)
package_manager: uv (fast modern)
```

**Why Python first:** ML/eval ecosystem là Python. TS port khi có demand.

### 4.2 Repo structure

```
prompt-eval-framework/
├── README.md                    ← bilingual EN+VI, hero example, quickstart
├── README.vi.md                 ← Vietnamese full version
├── LICENSE                      ← MIT
├── pyproject.toml
├── pef/                         ← package
│   ├── __init__.py
│   ├── core/
│   │   ├── runner.py            ← orchestrator
│   │   ├── golden.py            ← YAML loader + validator
│   │   ├── judge.py             ← LLM-as-judge
│   │   ├── assertions.py        ← format checks
│   │   ├── cost.py              ← token + cost tracking
│   │   └── report.py            ← HTML report generator
│   ├── pipeline/
│   │   ├── agent.py             ← agent abstraction
│   │   ├── chain.py             ← multi-agent chaining
│   │   └── debate.py            ← agent debate eval (v1.0)
│   ├── ci/
│   │   └── github_action.py     ← CI helpers
│   └── cli.py                   ← entrypoint (`pef`)
├── examples/
│   ├── 01-single-agent.yaml     ← simplest example
│   ├── 02-multi-agent.yaml      ← chain of 3 agents
│   ├── 03-bilingual.yaml        ← EN+VI golden test
│   ├── 04-regression-test.yaml  ← baseline comparison
│   └── 05-ci-integration/       ← GitHub Action workflow
├── docs/
│   ├── getting-started.md
│   ├── golden-test-format.md
│   ├── llm-judge-guide.md
│   ├── cost-optimization.md
│   ├── ci-cd-setup.md
│   └── case-studies/
│       └── maestro.md           ← internal case study
├── tests/                       ← unit tests
└── .github/
    └── workflows/
        ├── test.yml
        └── release.yml
```

### 4.3 Public API surface

```python
from pef import EvalSuite, GoldenTest, Pipeline

# Simple
suite = EvalSuite.from_yaml("evals/R-alpha.golden.yaml")
results = suite.run(model="claude-sonnet-4-20250514")
results.save_html("reports/")

# Multi-agent pipeline
pipeline = Pipeline([
    Agent("R-alpha", prompt_file=".agents/R-alpha.md"),
    Agent("R-gamma", prompt_file=".agents/R-gamma.md"),
    Agent("R-sigma", prompt_file=".agents/R-sigma.md"),
])
suite = EvalSuite.from_pipeline(pipeline, golden="evals/scope-a.golden.yaml")
results = suite.run(budget_usd=2.0)
assert results.score >= 7.5, "Regression detected"
```

### 4.4 YAML golden test format

```yaml
# evals/R-alpha.golden.yaml
name: R-alpha-research-agent
description: Tests for R-α research agent quality
model: claude-sonnet-4-20250514
budget_usd_per_case: 0.5

cases:
  - name: forecasting-retail
    input:
      module: B01
      topic: "demand forecasting for retail Vietnam"
    expected:
      qualities:
        mentions: [ARIMA, Prophet, NBEATS, NHITS]
        min_mentions: 3
        cites_papers: ">=5"
        sections: [SOTA, Gaps, References]
        word_count: [1500, 4000]
        language_correct_vi_terms: true
      forbidden:
        - fabricated_citations
        - "as an AI language model"
        - "I cannot..."
    judges:
      - type: llm
        model: claude-sonnet-4-20250514
        criterion: "Is this research SOTA, well-cited, and Vietnamese-context-aware?"
        threshold: 7.5
      - type: format
        rules: [valid_markdown, has_all_sections]

  - name: doc-intelligence-banking
    input:
      module: B02
      topic: "document intelligence for VN banking"
    expected: ...
```

---

## 5. Roadmap (12 tháng)

### Phase 1 — W1 to W6: Build v0.1 → v0.5 quietly

| Week | Milestone | CEO hours |
|---|---|---|
| W1 | Spec done + repo init + YAML schema + basic runner | 4 |
| W2 | LLM-judge + format assertions + first 5 example | 4 |
| W3 | Cost tracking + CLI runner + repo public skeleton | 4 |
| W4 | Multi-agent pipeline support + 3 examples + Hacker News quiet "Show HN" | 4 |
| W5 | Regression detection + bilingual support + dev.to writeup | 4 |
| W6 | v0.5 release with 5 examples + docs + first case study (MAESTRO internal) | 4 |

**Cumulative:** 24 hours (4h/tuần × 6 tuần). Khớp budget file 08 §3.

### Phase 1.5 — W7 to W12: v0.5 → v1.0 launch

| Week | Milestone |
|---|---|
| W7 | CI/CD integration + GitHub Action template |
| W8 | Cost budget cap + HTML report v1 |
| W9 | Parallel execution + benchmark example |
| W10 | Polish docs + add 5 more examples |
| W11 | v1.0 release prep — CHANGELOG + migration guide |
| W12 | **Hacker News + Product Hunt launch** + X thread + dev.to + Substack |

### Phase 2+ (M4–M12)

- Plugin system, multi-model, A/B testing
- Conference talk submissions (PyCon VN, AI Builders meetup)
- Integration với Helicone/Langfuse

---

## 6. Marketing strategy

### 6.1 Pre-launch (W1–W11)

- **Quiet release v0.1–v0.5** — share trong VN AI community, get 5–10 friendly users
- **Build in public X EN** — daily commit screenshots, learnings, progress
- **Substack** — write 2–3 deep posts về eval philosophy + technical decisions
- **YouTube** — 1 video walkthrough "How I built X"

### 6.2 Launch v1.0 (W12)

**Day 0 (Tuesday):**
- 06:00 GMT — Submit to **Hacker News** "Show HN: Eval framework for multi-agent Claude pipelines"
  - Title: "Show HN: Prompt-eval-framework — eval suite for multi-agent Claude pipelines"
  - Pre-write 3 best comments to seed quality discussion
- 14:00 GMT — Submit to **Product Hunt**
  - Pre-built hunter network 2 tháng prior (file 05 §3.4)
- 16:00 GMT — **X (Twitter) thread** — 12-15 tweet, code snippet + GIF demo
- 18:00 GMT — **Reddit r/MachineLearning + r/LocalLLaMA** — value-first post

**Day 1–7:**
- Babysit comments on HN/PH (response within 1h)
- DM 20 AI startup founders với "I built X, would love feedback" — top of funnel
- **Substack issue** dedicated to launch
- **dev.to crosspost** — same content, different audience
- **YouTube launch video** — "Why I OSS'd this + walkthrough"

### 6.3 Post-launch (M4–M12)

- **Awesome lists submission:** Awesome LLMOps, Awesome Prompt Engineering, Awesome Claude
- **Conference CFPs:** PyCon VN (Spring), Anthropic events, AI Builders meetup VN
- **Customer case studies** — anonymized data từ B2B project + LLMOps audit work
- **Newsletter mention swaps** với related OSS authors (Anthropic, LangChain ecosystem)

---

## 7. Success metrics

| Metric | M3 | M6 | M12 |
|---|---|---|---|
| GitHub stars | 50 | 150 | 500–2,000 |
| Forks | 5 | 25 | 100+ |
| Contributors (non-CEO) | 0 | 2 | 10+ |
| Issues opened | 5 | 25 | 100+ |
| PRs merged from external | 0 | 3 | 20+ |
| Mentions on Awesome lists | 0 | 1 | 3+ |
| Inbound LLMOps audit lead/tháng | 0 | 1 | 5+ |
| Conference talks accepted | 0 | 0 | 1–2 |

**Failure trigger:** < 50 stars sau M6 → repositioning README + try different launch channel.

---

## 8. Operating principles cho repo

### 8.1 Quality bar

- ❌ KHÔNG ship feature mà không có test
- ❌ KHÔNG break public API trong patch version
- ❌ KHÔNG accept PR mà không review trong 7 days (respect contributor time)
- ✅ Bilingual examples (mỗi major feature có ví dụ VN)
- ✅ Type hints everywhere (mypy strict)
- ✅ README hero example phải copy-paste chạy được

### 8.2 Issue/PR cadence

- CEO trả lời issue trong 48h
- PR review: trong 7 days hoặc decline polite
- Release cadence: minor version mỗi 2–4 tuần (v0.x → v0.x+1)
- Major release: mỗi 6 tháng

### 8.3 License + IP

- **MIT license** — permissive, max adoption
- Contributor License Agreement (CLA) — automated qua CLA assistant bot
- Logo + brand: trademark sẽ filed sau v1.0 (~$300 VN)

### 8.4 Internal vs public split

**70/30 rule:** OSS public chứa 70% capability, giữ 30% IP nội bộ:
- ✅ Public: framework, runner, judge, golden format, examples
- 🔒 Internal: 13 agent skill cards của venture, MAESTRO data, customer-specific golden sets, fine-tuned eval rubrics

→ Đủ để build authority + dev hire pipeline, không leak moat thật.

---

## 9. Risks specific cho OSS

| Risk | Mitigation |
|---|---|
| Anthropic deprecates SDK API | Pin version trong pyproject; major version migration as PR |
| `promptfoo` fast-follow our features | Differentiation: multi-agent + bilingual + Anthropic-first |
| Spam issues / drive-by users | Issue templates + automated label bot; close stale 30 days |
| CEO không có thời gian respond | Cap commits 4h/tuần; nếu lag, hire 1 contributor M9+ |
| Trademark dispute với "pef" name | Search USPTO + EU TM database trước v1.0; fallback name ready |
| Security vuln in deps | Dependabot enabled; weekly review |

---

## 10. Tóm tắt 1 trang

```
PROJECT: prompt-eval-framework
TAGLINE: Eval suite for multi-agent Claude pipelines — built on production runs

ROADMAP:
  W1-W6  v0.1-v0.5 build + quiet release | 24h CEO total
  W7-W12 v1.0 polish + Hacker News + Product Hunt LAUNCH
  M4-M12 plugins, multi-model, conference talks

CORE FEATURES v1.0:
  YAML golden format | LLM-judge | Format check | Cost tracking | CLI
  Multi-agent pipeline | Regression detect | Bilingual | CI/CD integration
  Budget cap | HTML report | Parallel exec

DIFFERENTIATION:
  Multi-agent focused (vs promptfoo general)
  Anthropic-first (vs OpenAI Evals)
  File-based, local-first (vs Langfuse SaaS)
  Bilingual EN+VI (unique)

70/30 SPLIT:
  Public 70% — framework + examples + docs
  Internal 30% — agent cards, MAESTRO data, customer golden

TARGET M12: 500-2K stars | 10+ contributors | 1-2 conf talks | 5+ inbound lead/mo

LICENSE: MIT
LANGUAGE: Python 3.11+ (TS port v1.5 if traction)
```
