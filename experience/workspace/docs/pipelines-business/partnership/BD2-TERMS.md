# BD2 — Terms

> Mutual interest confirmed (BD1) → negotiate + sign partnership agreement. ADR mandatory.

**Owner**: CEO + R-LEG.
**Authority**: CEO sign mandatory; R-LEG drafts and reviews legal.
**Cost target**: $0.20-0.40 (drafting + iteration).

---

## Trigger

BD1 decision = "proceed BD2".

---

## Activities

| Step | Action | Owner |
|---|---|---|
| BD2.1 | Define partnership type per BD0 scoring (referral / co-sell / integration / reseller) | CEO + partner |
| BD2.2 | Draft revenue split + IP terms + exclusivity scope | R-LEG drafts |
| BD2.3 | Anti-channel-conflict spec (see §below) | R-LEG + R-AM |
| BD2.4 | Customer transition clause (90-day continuity if either party exits) | R-LEG |
| BD2.5 | Negotiate iteration (typically 2-3 rounds) | CEO + partner-side legal |
| BD2.6 | Sign + announce internally | CEO + COO |
| BD2.7 | ADR mandatory: ADR-{NNNN}-partnership-{slug} | author CEO sign |

---

## Anti-channel-conflict rules (mandatory in terms)

When studio + partner can both reach same prospect, prevent stepping on each other:

| Conflict scenario | Resolution rule |
|---|---|
| Reseller partner + studio direct sales | Tier separation by deal size (partner < $X, direct ≥ $X) — define $X in terms |
| 2 partners contact same prospect | First-touch attribution (90 days from first outreach), winner gets the deal |
| Partner customer asks studio direct | Studio refers back to partner UNLESS partner explicitly declines (written) |
| Studio's existing customer offered partner's service | Partner refers back UNLESS studio declines |
| Joint pitch wins → execution split | Per terms (typically: studio delivers technical, partner manages relationship; revenue split 50/50 or per pre-agreed) |

→ All resolution rules go INTO partnership agreement, NOT verbal.

---

## IP & confidentiality

| Asset | Default ownership | Transfer rules |
|---|---|---|
| Pre-existing studio assets (skill cards, framework, knowledge nodes) | Studio retains | License grant to partner ≤ scope of partnership |
| Pre-existing partner assets | Partner retains | Same |
| **Jointly-developed assets** (during partnership) | Default: studio retains, partner has perpetual license | Per terms — sometimes 50/50 |
| Customer data | Per separate DPA per customer | NEVER co-owned; data-controller is whoever has direct customer relationship |
| Marketing / case studies | Joint approval required for publication | Both parties sign each piece |

---

<!-- @outputs -->
## Outputs

```
business-strategy/decisions/partnership/{partner-slug}/
├── BD2-terms-draft.md              ← negotiation working doc
├── BD2-terms-final-signed.pdf      ← signed agreement
└── ADR-{NNNN}-partnership-{slug}.md ← decision record
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Skip ADR** → R-MAS-14; partnership decision = strategic, MUST have ADR
- **Verbal terms** (handshake deal) → not enforceable; ALL terms written
- **Anti-conflict rules missing** → channel conflict happens later, blame game; mandatory in BD2
- **Customer transition clause missing** → if partnership sunsets, customer continuity broken
- **Partner exclusivity over-promised** (forbid all competitors) → R-MAS-04 anti-FOMO sister; CEO question carefully
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| ADR mandatory + CEO sign | R-MAS-14 + R-MAS-03 charter authority |
| R-LEG involvement before sign | R-MAS-11 — no agent signs documents |
| Terms version controlled | versioning-pinning.md |
<!-- /@harness-checkpoint -->

---

## Cross-References

- BD1 prev: [`@./BD1-OUTREACH.md`](BD1-OUTREACH.md)
- BD3 next: [`@./BD3-EXECUTE.md`](BD3-EXECUTE.md)
- ADR template: [`@../../../../_shared/templates/project/ADR-template.md`](../../../../_shared/templates/project/ADR-template.md)
- DPA template (customer data): [`@../../../../_shared/templates/legal/DPA-template.md`](../../../../_shared/templates/legal/DPA-template.md)
- R-LEG card: [`@../../../../_shared/.agents/tier-5-business/R-LEG-legal.md`](../../../../_shared/.agents/tier-5-business/R-LEG-legal.md)

---
*v1.0 — 2026-04-27.*
