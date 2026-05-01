# What We Learned

> **STUDIO-INTERNAL ONLY**. Per `_shared/standards/boundaries.md` §1.
> Internal retro patterns — transferable lessons across project retros. Each entry = 1 lesson learned the hard way, documented so it doesn't repeat.

**Owner**: All founders append; R-σ curate quarterly.

---

## Format

```
## YYYY-MM-DD · {category: delivery | sales | tech | ops | finance | brand} · severity

**Lesson**: 1 sentence transferable description (NOT project-specific anecdote)
**Source**: project retro IDs OR incident IDs (anonymized)
**Why it happened**: 5-why down to system cause (not blame-tinged)
**What we changed**: rule / skill card / process / template update with link
**How to detect next time**: signal that would have caught this earlier
```

---

## Entries

### 2026-04-27 · architecture · medium

**Lesson**: Knowledge classification phải là **dedicated tier-1 agent với golden-set bias check**, KHÔNG ngầm assigned cho R-BA hay P3 manual. Implicit ownership = silent bias risk.

**Source**: framework v1.1 build — boss review caught classifier ambiguity.

**Why it happened**: original spec ngầm "someone classifies" → defaulted to R-BA. R-BA lệch business context (Logistics-mạnh qua P3 ICP-B ownership) → silent bias: projects ngành khác có thể bị mis-classify hoặc force-fit Logistics.

**What we changed**: created R-Match dedicated tier-1 classifier với:
- Golden set ≥7 cases balanced 5+ industries (Logistics + Healthcare + F&B + MMO + Education + adversarial)
- Eval threshold 8.0 (higher — classifier errors compound)
- Explicit "NO INDUSTRY BIAS" principle in system prompt
- Strict allowlist B01-B15 + I01-I20 + custom registered

**How to detect next time**: in framework retro ask "is this capability assigned to ANY explicit agent, or implicit?" If implicit → require explicit owner OR consolidate to existing card. Architectural pattern, not bug fix — surface as moat addition tại W08.

---

(more entries populated from project retros + incident postmortems)

---

## Promotion path

When 3+ entries cluster around same root cause → propose framework rule update at next quarterly W08 framework retro.

---

## Cross-References

- Quality rule (failure documented): [`@../../_shared/rules/70-quality-rules.md`](../../_shared/rules/70-quality-rules.md) §R-QAL-06
- Permanent-fix loop (project-level): [`@../../_shared/rules/80-harness-rules.md`](../../_shared/rules/80-harness-rules.md) §R-HRN-06
- Framework retro: [`@../../experience/workspace/docs/workflows/W08-framework-retro.md`](../../experience/workspace/docs/workflows/W08-framework-retro.md)
- Failure modes catalogue: [`@../../_shared/eval/failure-modes.md`](../../_shared/eval/failure-modes.md)

---
*v1.0 — created 2026-04-27.*
