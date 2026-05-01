# H0 — Need

> Confirm role need + runway gate + approval.

**Owner**: CEO · **Agent**: R-HR (analysis) + Human (decision)

---

## Engine Orchestration

| Step | Owner | Action |
|---|---|---|
| H0.1 | Requester (founder) | Submit need form: role · why · cost · expected impact |
| H0.2 | R-BIZ | Cost-benefit analysis + alternative (delegate to agent? contractor?) |
| H0.3 | R-FIN | Runway impact: post-hire runway months |
| H0.4 | Human (CEO + COO) | Joint decision: hire / delay / agent-substitute |

## Hard Gates
- ❌ Runway < 6 months → **no hire**
- ❌ Same role open > 3 months without progress → review need
- ❌ < $5K MRR → only contractor / agent, no FTE

## Outputs
```
projects/_business/hr/needs/
└── {role-id}/
    ├── need-brief.md
    ├── cost-benefit.md
    ├── runway-impact.md
    └── decision-record.md
```

## Definition of Done
- ✅ Decision recorded with CEO + COO sign
- ✅ Runway post-hire ≥ 6 months
- ✅ Alternative (agent/contractor) explicitly considered + rejected with rationale
- ✅ Quarterly OKR alignment confirmed

## Failure Modes
- **Hire under pressure** without need analysis → enforce form
- **"We need someone"** without specific role → reject; require concrete deliverable
- **Skip alternative**: every hire considers agent/contractor first per `07-agent-team-development`

---
*v1.0*
