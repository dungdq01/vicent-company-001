# H1 — JD + Outreach

> JD draft, public posting, passive sourcing.

**Owner**: CEO · **Agent**: R-HR

---

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| H1.1 | R-HR | JD draft per `15-ops §3` template |
| H1.2 | Human (CEO) | Review + approve JD |
| H1.3 | R-HR | Publish to channels (LinkedIn, communities, careers page) |
| H1.4 | R-HR | Passive sourcing: 20-50 candidates with outreach hook |
| H1.5 | Human | Approve outreach batch |
| H1.6 | R-HR | Send outreach + log applicant tracker |

## JD Required Sections
1. About us (≤ 1 paragraph, specific)
2. Role (1 paragraph)
3. You'll own (3-5 bullets, *concrete deliverables*)
4. You're a fit if (5-7 bullets, *skill-based not vague*)
5. Bonus
6. Compensation (band or "competitive + equity discussion")
7. How to apply (Tally form + 1 challenge question)
8. Process (5 stages)

## Outputs
```
projects/_business/hr/roles/{role-id}/
├── jd.md
├── jd-final.pdf
├── ideal-candidate.md         ← internal scoring rubric
├── outreach-list.md
└── outreach-sent-{batch}.md
```

## Definition of Done
- ✅ JD has all 8 sections, ≤ 1 generic sentence
- ✅ Compensation band public (transparency signal)
- ✅ Challenge question screens for fit (not just keyword filter)
- ✅ ≥ 30 candidates in outreach list
- ✅ Process stages match `15-ops §3` (5 stages)

## Failure Modes
- **Generic JD**: enforce ≥ 1 specific (project, tech, growth) sentence
- **Hidden comp**: transparency signals respect; require band
- **Spray outreach**: low signal → < 5% reply; require specific hook per candidate

---
*v1.0*
