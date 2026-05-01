# S0 — Prospect

> Build target list + 3-touch outreach. Agent-driven, human-approved sends.

**Canonical**: [`@../../../../../business-strategy/12-sales-playbook.md:286`](../../../../../business-strategy/12-sales-playbook.md)
**Prev**: — · **Next**: [`S1-QUALIFY.md`](S1-QUALIFY.md)
**Owner**: COO · **Agent**: R-SDR

---

```
┌──────────────────────────────────────────────────────────┐
│  S0: PROSPECT                                            │
│  Goal: Targeted list + first touch                       │
│  Cadence: weekly batch (Monday morning)                  │
│  Engine cost: $3-5/week (50 leads)                       │
│  Human time: 30 min review + send approval               │
└──────────────────────────────────────────────────────────┘
```

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| S0.1 | R-SDR | Source 50 candidates from ICP A/B (LinkedIn + community + signal-based). |
| S0.2 | R-SDR | Per candidate: parse profile, infer pain, score signal strength 1-10. |
| S0.3 | R-SDR | Generate 3-touch sequence (D0 email · D3 follow-up · D7 breakup) per `12-sales §8`. |
| S0.4 | Human (COO/CEO) | Review 30 min Monday — approve / edit / reject. |
| S0.5 | R-SDR | Send via email tool, log in CRM. |

## Inputs
- ICP A/B definition (`02-customer-segments`)
- Signal sources: LinkedIn, GitHub, community Slacks, news (funding, hire)
- Past target list (avoid re-outreach within 90 days)

## Outputs

```
projects/_business/sales/leads/{LEAD_ID}/
├── lead-profile.md
├── outreach-msg-D0.md
├── outreach-msg-D3.md
└── outreach-msg-D7.md
```

## Definition of Done
- ✅ ≥ **30 leads/tuần** sourced (Phase 1)
- ✅ Every message has signal-specific reference (no generic)
- ✅ Human approval recorded before send
- ✅ CRM logged with status `Outreach-D0`
- ✅ 0 hallucinated company facts (audited 10% sample)

## Failure Modes
- **List quality drift**: ICP fit < 70% → re-tune sourcing query.
- **Generic copy slip**: signal-specific lint check before send.
- **Re-outreach within 90 days**: dedupe against past list.

## Cross-References
- R-SDR skill card: [`@../../../../../_shared/.agents/tier-5-business/R-SDR-sales-dev-rep.md`](../../../../../_shared/.agents/tier-5-business/R-SDR-sales-dev-rep.md)
- Outreach playbook: [`@../../../../../business-strategy/12-sales-playbook.md:286`](../../../../../business-strategy/12-sales-playbook.md)

---
*v1.0*
