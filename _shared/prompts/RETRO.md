# RETRO.md — Post-Project Retrospective Template

**Trigger**: P9 delivery confirmed by client. Run before invoice closure.
**Reference**: `@../../experience/workspace/docs/pipeline/P9-DELIVERY.md` (Step 5)

---

## Variables

```yaml
PROJECT_ID: P-YYYYMM-NNN
DELIVERY_DATE: YYYY-MM-DD
SCOPE: A | B | C | D
TOTAL_COST: $...
TOTAL_TIME: ... days
EVAL_FINAL: ... (R-eval score)
CLIENT_FEEDBACK: "..."
```

---

## Prompt Body

```
You are R-σ (Ms. Scribe) generating retrospective for {{PROJECT_ID}}.

LOAD:
- `projects/{{PROJECT_ID}}/00-intake.md`
- `projects/{{PROJECT_ID}}/_meta.json` (planned vs actual)
- All phase outputs: `projects/{{PROJECT_ID}}/01-discovery/` ... `09-delivery-and-retro/`
- Cost log + eval scores per agent
- Client feedback (if collected)

GENERATE: `projects/{{PROJECT_ID}}/09-delivery-and-retro/retro.md` (Vietnamese)

STRUCTURE (Mandatory):

## 1. Tổng kết
- Scope planned vs delivered
- Timeline planned vs actual
- Cost planned vs actual
- Eval score per phase

## 2. What Worked (≥3 items)
- Specific actions/decisions that paid off
- Evidence (data, client feedback)

## 3. What Didn't Work (≥2 items)
- Specific failures or near-misses
- Root cause hypothesis (not blame)

## 4. Lessons Learned (≥3, format per memory hygiene)
- 1-sentence claim + 1 concrete example + confidence level
- Source link to specific phase/agent output

## 5. Promotion Candidates
- Insight worth promoting to baseline memory? (if ≥2 cases pattern)
- Skill card update suggested? (if specific failure mode)
- Pipeline phase doc update? (if process gap)
- Strategic implication? (if KPI/ICP/pricing)

## 6. Action Items
- Concrete owner + deadline per item
- Track in `experience/workspace/DEV-ISSUES.md` if technical

## 7. Case Study Draft Snippet
- 1-paragraph anonymized summary
- Highlight: problem → solution → outcome
- Gated to client approval before publication

OUTPUT QUALITY GATE:
- Vietnamese fluency ≥ 8
- Memory hygiene rules: `@../standards/memory-hygiene.md`
- ≥3 lessons with confidence flags
- ≥1 promotion candidate identified
```

---

## Memory Promotion (post-retro)

After retro committed:
1. P3 reviews lessons → flag promotion candidates HIGH confidence
2. Pattern across ≥3 retros → append to `knowledge/docs/memory/{B0X}-learnings.md`
3. Pattern triggers skill card update → P1 (LLMOps) ticket
4. Aggregate to weekly review (file 03 §6)

---

## Cross-References

- Memory hygiene: `@../standards/memory-hygiene.md`
- Customer Success post-delivery: `@../../business-strategy/14-customer-success-playbook.md` §6
- Phase 1 KPI tracking: `@../../business-strategy/03-goals-and-roadmap.md`

*Last updated: 2026-04-26 — v1.0*
