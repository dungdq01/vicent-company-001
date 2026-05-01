# Cost Budgets — Per Run, Project, Month

**Canonical source**: [`@../../business-strategy/07-agent-team-development.md`](../../business-strategy/07-agent-team-development.md) §6 + [`@../../business-strategy/10-pricing-sheet.md`](../../business-strategy/10-pricing-sheet.md)

**Mục đích**: hard caps để engine tự pause khi vượt budget; tránh runaway cost.

---

## Per-Agent Run Cap

| Agent | Input target | Output target | $/run cap | Hard kill |
|---|---|---|---|---|
| R-α | 8K | 5K | $0.30 | $0.50 |
| R-β | 10K | 5K | $0.40 | $0.60 |
| R-γ | 8K | 4K | $0.30 | $0.50 |
| R-σ | 25K | 8K | $0.80 | $1.20 |
| R-MLE/DE/BE/FE/DO/NLP/AE | 5-6K | 3-4K | $0.20 | $0.40 |
| R-D{XX} | 10K | 4K | $0.30 | $0.50 |
| R-PM | 8K | 3K | $0.25 | $0.40 |
| R-SA | 10K | 4K | $0.35 | $0.55 |

→ Hard kill = engine abort agent, error event, no retry.

---

## Per-Project Cap (theo Scope)

| Scope | Per-run avg | Project total cap | Hard kill | Action if exceeds |
|---|---|---|---|---|
| **A** (Sprint A: P0-P2) | $0.50 | $5 | $7 | Pause, P2 review prompts |
| **B** (Sprint B: P0-P5) | $1.50 | $15 | $25 | Pause + retro |
| **C** (Sprint C: P0-P7) | $2.50 | $50 | $80 | CEO sign-off |
| **D** (Sprint D: P0-P9) | $4.00 | $200 | $300 | CEO + P1 |

---

## Per-Month Cap (Phase 1)

- **Anthropic API total**: $500/mo (file 09 W1 task)
  - Hard cap qua console.anthropic.com (NOT just budget alert — actual usage limit)
  - Trip wire alerts: $250 (50%), $400 (80%)
- **Per-day burn rate** Phase 1: ~$15/day average
  - 1 active project + 2 internal R&D runs

---

## Cost Tracking Infrastructure (Phase 1 W1+)

| Tool | Purpose | Setup |
|---|---|---|
| Helicone proxy | Per-call logging + tag projects | W2 |
| Custom dashboard | Aggregate $ per project per agent | W3 |
| Slack alert | Hit 50%/80%/100% trigger | W2 |
| Weekly cost report | Friday standup item | Manual W1 → auto W4 |

---

## When Project Goes Over

1. Engine auto-pause at hard kill
2. P2 reviews orchestrator: prompt bloat? wrong model route?
3. If intentional (complex client) → CEO approve continuation, document overage in `_meta.json`
4. If unintentional → root cause to `experience/workspace/DEV-ISSUES.md` + retro

→ Default: do NOT auto-resume. Human decision required.

---

## Cross-References

- Strategic cost framework: `@../../business-strategy/07-agent-team-development.md` §6
- Pricing tier: `@../../business-strategy/10-pricing-sheet.md`
- Phase 1 W1 setup: `@../../business-strategy/09-phase1-execution-plan.md` §2

*Last updated: 2026-04-26*
