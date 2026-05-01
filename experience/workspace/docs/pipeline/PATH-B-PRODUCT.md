# Path B — Internal Product (Product R&D)

> Path A serves clients. Path B builds **internal products** (PDF $19, course $99, tool $49). Closes lỗ hổng B5 (orphan path).

**Trigger**: Founder identifies opportunity (TikTok trending, customer pain pattern, competitor gap).
**Owner**: Founder propose → CEO approve → anyone build.
**Authority**: CEO (final scope + brand fit).

**Cross-ref**: `00-OPERATING-MANUAL.md §4` (was inline) — file này là canonical pipeline.

---

## Phase B0 — Idea Triage (10 min)

| Step | Action | Output |
|---|---|---|
| B0.1 | Capture idea in `business-strategy/04-capability-catalog.md` parking-lot | 1-line entry |
| B0.2 | CEO assess feasibility (⭐/⭐⭐/⭐⭐⭐) + strategic fit (🟢/🟡/🔴) | Score logged |
| B0.3 | Map to ICP (`02-customer-segments.md`) | ICP confirmed or "no ICP fit" → kill |
| B0.4 | Map to pricing tier (`10-pricing-sheet.md`) | Tier proposed |
| B0.5 | Knowledge dependency check — what baselines / industries needed | List |

**Gate to B1**: ⭐⭐+ + 🟢 + ICP fit + pricing tier ≥ $19. Else parking-lot.

---

## Phase B1 — Knowledge Audit (1h)

| Step | Action |
|---|---|
| B1.1 | Verify required knowledge nodes exist + at correct depth |
| B1.2 | If gap → trigger Path D (re-research) BEFORE proceeding |
| B1.3 | Check competing products / alternatives (R-β market scan) |

**Gate**: knowledge ready OR Path D fired with ETA. Else hold.

---

## Phase B2 — Capability Spec (2h)

R-PM (or CEO) writes:
- Product type (PDF / course / tool / SaaS)
- Outline / TOC / feature list
- ICP-specific value prop
- Pricing + refund policy (per `10-pricing-sheet.md`)
- Success criteria (sales target, retention, NPS)
- Capacity required (CEO hours, agent compute, design hours)

**Output**: `studio/products/{product-id}/01-spec.md`. ADR if new pricing tier.

---

## Phase B3 — Engine Production (variable)

**For PDF / written content**:
- R-α + R-σ generate per-chapter draft from baseline JSON
- CEO edit + Canva polish (4-6h)
- Cost: ~$3-5 LLM API for 15-chapter PDF

**For course**:
- B3 = produce slides + voiceover script + recording prep
- Engine: R-CONTENT (slides), R-σ (script polish)
- Cost: $5-10

**For tool**:
- Goes through P3-P9 like Path A but client = "self / studio"
- Probation period before public release

**Output**: ready-to-ship artifact in `studio/products/{product-id}/v1/`.

---

## Phase B4 — Pre-Launch Validation (1-3 days)

| Step | Action |
|---|---|
| B4.1 | Internal review (CEO + P3) |
| B4.2 | 3-5 beta testers (ICP-matched) — collect feedback via Notion form |
| B4.3 | Iterate based on feedback (max 2 rounds) |
| B4.4 | Pricing + landing page draft |
| B4.5 | Refund policy + terms reviewed |

**Gate to launch**: ≥3 beta tester rate ≥ 8/10 OR explicit "willing to recommend".

---

## Phase B5 — Launch (1 day)

| Channel | Action | Owner |
|---|---|---|
| Substack | Issue announcing | CEO |
| X/Twitter | Thread launch | CEO |
| LinkedIn | Long post | P3 |
| TikTok | Showcase video (if MMO product) | freelance Voice C |
| Gumroad / Substack / Stripe | Listing live | P3 |

**Output**: launched + tracking link per channel.

---

## Phase B6 — Measure & Iterate (30+ days)

KPI per `business-strategy/03-goals-and-roadmap.md`:
- Sales count + revenue
- Refund rate (target ≤ 5%)
- Email captured (lead gen value)
- Channel attribution

Weekly: P3 dashboards. Monthly: CEO retrospective.

**Iterate triggers**:
- Refund > 10% → review per `14-customer-success-playbook.md`, fix issue OR sunset
- Sales < 25% target by month 2 → re-position OR sunset
- High demand → expand (next tier product)

---

## Phase B7 — Sunset / Update (when applicable)

- Annually: review all products in catalogue
- Outdated content (model changes, market shifts) → update or sunset
- Sunset = stop sale, archive, refund policy honored 30 days post-sunset

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN, abbreviated)

Path B harness profile = **L0 Sandbox** for content; **L1 Standard** for tool/SaaS products.

Key items:
- Engine generation cost cap: $10 per content product, $50 per tool product first version
- KV-cache discipline same as Path A
- No PII handling (content products)
- Tool products → full harness/ folder per `_shared/templates/project/harness/`

---

## Cross-References

- Capability catalogue: [`@../../../../business-strategy/04-capability-catalog.md`](../../../../business-strategy/04-capability-catalog.md)
- Pricing: [`@../../../../business-strategy/10-pricing-sheet.md`](../../../../business-strategy/10-pricing-sheet.md)
- Channel playbook: [`@../../../../business-strategy/05-channel-playbook.md`](../../../../business-strategy/05-channel-playbook.md)
- Path A pipeline: [`@./P0-INTAKE.md`](P0-INTAKE.md)
- Path D (knowledge): [`@./PATH-D-RESEARCH.md`](PATH-D-RESEARCH.md)
- Operating manual: [`@../../../../00-OPERATING-MANUAL.md`](../../../../00-OPERATING-MANUAL.md) §4

---
*Pipeline Path B v1.0 — Adopted 2026-04-27.*
