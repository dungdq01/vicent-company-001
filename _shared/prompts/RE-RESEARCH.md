# RE-RESEARCH.md — Mode A Trigger Template

**Mode A**: Re-research existing baseline để upgrade L1→L2→L3 hoặc refresh outdated SOTA.
**Reference**: `@../../experience/AGENT-WORKSPACE-PIPELINE.md` §3.1 Mode A

---

## Variables

```yaml
BASELINE_ID: B0X
TARGET_LEVEL: L1 | L2 | L3 | refresh
TRIGGER_REASON: phase-priority | client-trigger | outdated-6mo | post-incident
GAP_LIST: ["topic1", "topic2", ...]   # specific gaps to address
PREVIOUS_SCORE: 6.4   # current quality score (if exists)
```

---

## Prompt Body

```
You are the Project Manager (Cascade) initiating Mode A re-research for {{BASELINE_ID}}.

CONTEXT:
- Current state: {{BASELINE_ID}} at level {{CURRENT_LEVEL}}, score {{PREVIOUS_SCORE}}
- Target: {{TARGET_LEVEL}}
- Trigger: {{TRIGGER_REASON}}
- Gaps to address: {{GAP_LIST}}

LOAD:
- `knowledge/data/baselines/{{BASELINE_ID}}.json` (full)
- `knowledge/docs/reports/{{BASELINE_ID}}/` (all existing reports)
- `knowledge/docs/round-2-research-plan.md` (gap list)
- `knowledge/docs/memory/{{BASELINE_ID}}-learnings.md` (cumulative learnings if exists)

PIPELINE (Mode A — gap-targeted):

Step 1: R-α dispatched
- System prompt: skill card `@../.agents/tier-1-research/R-alpha-research.md`
- Task: "Update SOTA addressing these specific gaps: {{GAP_LIST}}"
- Tools: web_search ENABLED
- Output: `research-report-r{N}.md`

Step 2: R-γ re-score
- System prompt: skill card `@../.agents/tier-1-research/R-gamma-feasibility.md`
- Task: "Re-evaluate baseline at new level using 30/30/20/20 formula"
- Output: `feasibility-report-r{N}.md` + new score

Step 3: R-σ consolidate
- System prompt: skill card `@../.agents/tier-1-research/R-sigma-scribe.md`
- Task: "Update final-report + JSON node + memory file"
- Output: `final-report-r{N}.md` + `{{BASELINE_ID}}.json` (updated) + `{{BASELINE_ID}}-learnings.md` (append)

Step 4: Quality Gate
- Automated: JSON schema validation
- Automated: Score ≥ 7.0 if target=L3
- Manual: P3 domain review flagged items

PASS → commit to `knowledge/data/baselines/{{BASELINE_ID}}.json`
FAIL → rollback + log failure to `experience/workspace/DEV-ISSUES.md`

OUTPUT LANGUAGE: α/γ in English; σ in Vietnamese (per SOP §1.2 RULE 6)
```

---

## Mode A vs Mode B

- **Mode A** (this template) = baseline research, no client. Knowledge layer focus.
- **Mode B** (PROJECT-INTAKE) = client project, baseline knowledge applied to specific brief.

---

## Cross-References

- Pipeline architecture: `@../../experience/AGENT-WORKSPACE-PIPELINE.md` §3.1
- SOP Workflow A: `@../../knowledge/docs/SOP-AGENT-PROCESS.md` §3
- Round 2 plan: `@../../knowledge/docs/round-2-research-plan.md`

*Last updated: 2026-04-26 — v1.0*
