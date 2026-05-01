# Scoring Rubric — 30/30/20/20 Formula

**Used by**: R-γ feasibility scoring + R-eval LLM-judge | **Spec**: [`SPEC.md`](./SPEC.md)

**Mục đích**: rubric chuẩn cho mọi feasibility/quality eval. Consistent across modules + projects.

---

## The Formula

```
Total Score = 0.30 × Technical
            + 0.30 × Business
            + 0.20 × Resource
            + 0.20 × Risk

Each dimension scored 1-10.
```

---

## Dimension Definitions

### 1. Technical (30%)

- **10**: SOTA approach, proven at scale, solid theoretical basis
- **8**: Established methods, good production track record
- **6**: Workable but with known limitations
- **4**: Risky technical bet, unproven
- **2**: Fundamental technical issue
- **0**: Technically infeasible

**Anchors**:
- 8 = NBEATS for forecasting (proven, ops-friendly)
- 5 = Custom novel architecture (research-grade, ops unclear)
- 2 = Algorithm requires data we don't have

### 2. Business (30%)

- **10**: Clear ROI, large addressable market, strong WTP
- **8**: Good ROI, identified buyer, validated WTP
- **6**: ROI plausible, market exists but fragmented
- **4**: ROI unclear, market thin
- **2**: No buyer signal
- **0**: Solution looking for problem

**Anchors**:
- 9 = ICP-B 3PL forecasting (proven WTP $5K-15K Sprint B)
- 6 = LLMOps audit (emerging, fragmented)
- 3 = Generic AI consulting

### 3. Resource (20%)

- **10**: Fits within team + budget + timeline with buffer
- **8**: Fits with mild stretch
- **6**: Achievable but tight
- **4**: Requires stretch (overtime / scope cut)
- **2**: Beyond team capacity
- **0**: Need 5x current team

### 4. Risk (20%)

- **10**: Well-understood domain, low regulatory exposure, deliverable proven
- **8**: Manageable risk profile, mitigations clear
- **6**: Some unknowns, manageable
- **4**: Significant unknowns or regulatory complexity
- **2**: High regulatory + technical unknowns
- **0**: Existential risk to studio

---

## Verdict Mapping (R-γ)

| Total Score | Verdict | Action |
|---|---|---|
| ≥ 7.5 | **GO** | Proposal sent, full scope |
| 5.0 - 7.4 | **CONDITIONAL** | Send proposal with conditions explicit |
| < 5.0 | **NO-GO** | Polite decline, log decline-template |

---

## R-eval Pass Threshold (per deliverable)

Different from R-γ verdict — R-eval scores agent **output quality** not project feasibility.

| Deliverable | Min eval pass | Promote-to-prod |
|---|---|---|
| Default | ≥ 7.5 | ≥ 8.0 |
| R-σ output | ≥ 8.0 | ≥ 8.5 |
| Final report (P9) | ≥ 8.5 | — |

---

## Calibration

Quarterly review:
- Score 5 anchor cases per quarter
- If individual scorer drifts > 1 point from team average → re-calibrate
- Use `knowledge/docs/round-2-research-plan.md` historical anchors

---

## Cross-References

- Eval framework full: `SPEC.md`
- DoD: `@../standards/dod-per-deliverable.md`
- R-γ skill card: `@../.agents/tier-1-research/R-gamma-feasibility.md`

*Last updated: 2026-04-26*
