---
file: 01-discovery-report
project_id: {{PROJECT_ID}}
phase: P1
filled_by: R-α (research) + R-β (technical) + R-γ (sentinel) + R-σ (consolidation)
last_updated: {{P1_DATE}}
status: draft | reviewed | final
---

# {{PROJECT_NAME}} — Discovery Report

> P1 deliverable. Deep problem understanding + SOTA + feasibility. Source for proposal (P2) and architecture (P3).

---

## 0. Executive Summary

[Fill: ½ page · what we learned · key decisions to make · go/no-go signal]

💡 Hint: 5 bullets max. CEO + client read this and only this for fast scan.

---

## 1. Problem Deep-Dive

### 1.1 Refined Problem Statement
[Fill: refined from intake §2 with discovery insights]

### 1.2 Why It Matters (Quantified)
[Fill: cost of doing nothing · ROI of solving · who benefits]

### 1.3 Root Causes
[Fill: ≥ 3 root causes investigated · evidence per cause]

💡 Hint: Don't confuse symptom with root cause. Use "5 whys" if needed.

---

## 2. Domain Context (R-Dxx)

### 2.1 Industry Landscape
[Fill: industry-specific context · regulations · norms]

### 2.2 Competitor / Reference Solutions
[Fill: ≥ 3 examples · what works · gaps]

### 2.3 Industry-Specific Pitfalls
[Fill: common failure modes in this industry]

---

## 3. Technical SOTA (R-α + R-β)

### 3.1 Approach Comparison

| Approach | Pros | Cons | Citation | Fit (1-5) |
|---|---|---|---|---|
| [Fill] | ... | ... | [URL] | ... |

💡 Hint: Cite real papers / blog posts. R-MAS-06: no "studies show" without source.

### 3.2 Recommended Approach
[Fill: 1 approach with rationale · why over alternatives]

### 3.3 Cost Estimate (Compute + License)
[Fill: API cost · compute · third-party licenses]

---

## 4. Feasibility (R-γ Sentinel)

### 4.1 Data Feasibility
- **Data available**: [Fill: matches need? gaps?]
- **Quality assessment**: [Fill: completeness · accuracy · freshness]
- **Volume vs need**: [Fill: enough for ML? need augmentation?]

### 4.2 Technical Feasibility
- **Stack fit**: [Fill: works with their existing tech?]
- **Performance feasibility**: [Fill: latency · throughput targets achievable?]
- **Integration feasibility**: [Fill: APIs / data pipelines available?]

### 4.3 Organizational Feasibility
- **Adoption risk**: [Fill: will users actually use it?]
- **Change mgmt need**: [Fill: training · process change required?]
- **Maintenance capacity**: [Fill: client team can run post-handoff?]

### 4.4 Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | [Fill] | L/M/H | L/M/H | [Fill] |

💡 Hint: ≥ 5 risks documented. Top 3 require explicit mitigation in proposal.

---

## 5. Knowledge Gaps Filled

[Fill: list L1-L4 gaps from intake's gap pre-scan + how each was resolved]

| Gap | Level | Resolution |
|---|---|---|
| [Topic] | L1-L4 | [Searched · cited · or flagged unresolved] |

---

## 6. Recommended Path Forward

### 6.1 Solution Sketch
[Fill: 1 paragraph · high-level solution shape]

### 6.2 Sprint Tier Recommendation
- **Recommended tier**: A · B · C · D
- **Rationale**: [Fill]

### 6.3 Engagement Model
- **Project type**: Fixed scope · Time-and-materials · Retainer
- **Rationale**: [Fill]

### 6.4 Timeline Estimate
[Fill: phase-by-phase weeks · with buffer]

### 6.5 Budget Estimate
[Fill: range USD · cost components · risk-adjusted]

---

## 7. Open Questions for Client

[Fill: questions that need answer before proposal · with priority]

1. **[High]** [Question] — needed for [decision]
2. **[Med]** [Question]
3. **[Low]** [Question]

---

## 8. Consolidation Notes (R-σ)

### 8.1 Cross-Agent Conflicts Resolved
[Fill: where R-α and R-β disagreed · how resolved]

### 8.2 Confidence Level
- **Overall**: [Fill: 1-10]
- **Areas of high confidence**: [Fill]
- **Areas of low confidence**: [Fill: flagged for proposal disclaimer]

---

## 9. Approval

- **R-σ eval score**: [Fill: ≥ 8.0 required per R-QAL-02]
- **CTO sign-off**: [Fill: name · date]
- **Ready for P2**: [ ] Yes [ ] No (rework)

---

## Cross-References

- P1 phase doc: [`@../../../experience/workspace/docs/pipeline/P1-DISCOVERY.md`](../../../experience/workspace/docs/pipeline/P1-DISCOVERY.md)
- Baselines: [`@../../../knowledge/data/baselines/`](../../../knowledge/data/baselines/)
- Industry node: [`@../../../knowledge/data/industries/{{INDUSTRY}}.json`](../../../knowledge/data/industries/)
- Failure modes: [`@../../eval/failure-modes.md`](../../eval/failure-modes.md)

---
*Template v1.0*
