# H3 — Offer + Onboard

> Reference checks, offer letter, 30-day onboarding plan.

**Owner**: CEO + COO · **Agent**: R-HR + R-LEG (offer letter)

---

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| H3.1 | R-HR | Reference checks: 2+ refs, structured questions |
| H3.2 | Human (CEO) | Final offer decision |
| H3.3 | R-LEG | Offer letter draft (comp · start date · equity if any) |
| H3.4 | R-HR | Send offer; negotiate within rules |
| H3.5 | R-HR | If accepted → 30-day onboarding plan |
| H3.6 | COO + new hire | Day 0 — first call, expectations |
| H3.7 | R-HR | Day 30 — review + 30/60/90 plan |

## Onboarding Plan (30 days)
- **Week 1**: Setup + context loading (read framework + business strategy + agent docs)
- **Week 2**: Shadow (sit in calls, observe agent runs, Q&A)
- **Week 3**: Contribute (small tasks owned, mentor pair)
- **Week 4**: Full ownership of one area + 30/60/90 review

## Outputs
```
projects/_business/hr/roles/{role-id}/hire/{name}/
├── reference-checks.md
├── offer-letter.pdf
├── offer-acceptance.md
├── onboarding-day-0-to-30.md
├── 30-60-90-plan.md
└── 90-day-review.md
```

## Definition of Done
- ✅ ≥ 2 reference checks completed before offer
- ✅ Offer accepted within 7 days (else flag)
- ✅ Day 0 call recorded
- ✅ 30/60/90 plan signed by hire + COO
- ✅ 90-day retention check passed

## Failure Modes
- **Skip references** "available on request" → reject
- **Counter-offer without CEO sign** → blocked
- **Onboarding cliff** at week 4 → 30/60/90 review mandatory
- **Offer expiry confusion** → 7-day clear deadline

---
*v1.0*
