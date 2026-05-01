---
file: external-dependencies
version: v1.0
last_updated: 2026-04-27
owner: CTO + R-LLMOps
status: production
---

# External Dependencies — Vendor Watch List

> Per R-LCY-05. External providers (Anthropic, Telegram, Postgres host, payment) change every 2-4 weeks. Without watch = silent breakage. File này tracks dependencies + drift signals.

---

## 1. Watch List

```yaml
# Reviewed weekly by R-LLMOps; drift signals escalated to CTO

dependencies:

  # === LLM providers ===
  - vendor: Anthropic
    services: [Claude API, prompt cache, MCP, Files API, Batches]
    pinned_models:
      - claude-opus-4-7
      - claude-sonnet-4-6
      - claude-haiku-4-5-20251001
    deprecation_watch:
      - "Sonnet 3.5/3.7 sunset already (2025-Q4)"
      - "Sonnet 4.5/4.6 likely sunset 2026-Q4–Q1 2027"
    pricing_watch: "Cache pricing tier review quarterly"
    review_cadence: weekly
    owner: R-LLMOps
    fallback_if_outage: gpt-4o-mini (degraded mode)

  # === Messaging / channel ===
  - vendor: Telegram
    services: [Bot API 7.x, payment, channel]
    pinned_version: "Bot API 7.10"
    tos_watch: "AI bot disclosure rules updated 2025-Q3"
    owner: per-project R-AE
    review_cadence: monthly

  - vendor: TikTok
    services: [TikTok Shop API, business account]
    pinned_version: "v202511"
    tos_watch: "AI-generated content disclosure mandatory 2025-Q4"
    owner: project-specific

  # === Infrastructure ===
  - vendor: Fly.io
    services: [App hosting SGN region]
    pinned_version: machines v2 platform
    review_cadence: monthly
    owner: R-DO

  - vendor: Postgres (managed)
    services: [database, pgvector]
    pinned_version: "PG 16, pgvector 0.7"
    review_cadence: bi-monthly
    owner: R-DBE

  # === Observability + cost ===
  - vendor: Helicone
    services: [LLM trace + cost dashboard]
    review_cadence: monthly
    owner: R-LLMOps

  # === Payment ===
  - vendor: Stripe
    services: [payment, invoicing]
    pinned_version: API 2024-11-20
    review_cadence: bi-annually
    owner: COO

  - vendor: Wise
    services: [VND/USD remittance]
    review_cadence: bi-annually
    owner: COO

  # === VN-specific ===
  - vendor: MoMo / ZaloPay / VNPay
    services: [VN payment redirect]
    pinned_version: per-project
    review_cadence: per-project
    owner: project R-BE

  # === Compliance / regulatory ===
  - regulator: VN Bộ TT&TT (PDPA, NĐ 13)
    watch: "Decree updates, enforcement actions"
    review_cadence: monthly
    owner: COO + R-DataOps (when role active)

  - regulator: Singapore PDPC
    watch: "PDPA amendments — relevant when expand SG"
    review_cadence: bi-monthly
    owner: R-DataOps
```

---

## 2. Drift Signal Categories

| Signal | Severity | Action SLA |
|---|---|---|
| Vendor announces deprecation w/ EOL date | High | ADR + migration plan within 14 days |
| Pricing change > 20% | High | Cost recalc all active projects within 7 days |
| ToS change affecting our use | Critical | Legal review + project pause if non-compliant within 48h |
| Model deprecation (LLM) | Critical | Migration plan, all pinned projects audit within 7 days |
| Outage / SLA breach > 0.5% month | Medium | Document, evaluate fallback |
| Vendor security incident | Critical | Rotate credentials, security audit within 48h |
| Region availability change | Medium | Project-specific impact assessment |

---

## 3. Weekly Review Output

R-LLMOps writes `_shared/standards/external-deps-review-{YYYY-WW}.md`:

```markdown
# Vendor Watch — Week 2026-W18

## Diff vs last week
- Anthropic: cache TTL extended from 5min → 10min (positive, no action)
- Telegram: Bot API 7.11 released — ADR if features useful for active projects
- Stripe: announced v2025-04 — non-breaking, queue for next quarter

## Drift signals
- None this week

## Action items
- [ ] CTO ADR for Telegram 7.11 features (Hùng project candidate)
```

---

## 4. Migration Playbook (when EOL forced)

Per major migration (e.g., Sonnet 4.6 → 5.0):

1. **Discovery**: announcement received, EOL date logged
2. **Impact assessment**: list all pinned projects + golden sets affected
3. **Re-eval**: run new version against existing golden sets
4. **Per-project decision**:
   - Active client project → migrate with explicit re-test (cost charged to studio if no client benefit)
   - Closed archive project → leave at old version unless archive re-opened
5. **ADR**: document migration path, dates, owners
6. **Knowledge update**: skill cards bump version, CHANGELOG entry
7. **Sunset old**: per R-LCY-03

---

## 5. Cross-References

- Lifecycle vendor watch: [`@../rules/90-lifecycle-rules.md`](../rules/90-lifecycle-rules.md) §R-LCY-05
- Anti-FOMO: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-04
- R-LLMOps card: [`@../.agents/tier-2-engineering/R-LLMOps-llm-operations.md`](../.agents/tier-2-engineering/R-LLMOps-llm-operations.md)
- Versioning + project pin: [`@./versioning-pinning.md`](versioning-pinning.md)

---
*v1.0 — Adopted 2026-04-27.*
