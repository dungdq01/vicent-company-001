---
file: output-validation
version: v1.0
last_updated: 2026-04-28
owner: CTO + R-eval
status: production
---

# Output Validation Standard

> Pre-eval gate. **Before** content scoring (R-eval Layer 2), Engine MUST verify file-system level claims. Catches "agent hallucinates wrote file" + "file empty/garbage" + "missing required sections".
>
> Closes Tier S #2 from harness audit 2026-04-28.

---

## 1. Validation pipeline (sequential)

```
Agent claims completion
   ↓
[L0] File-system existence check
   ↓ pass
[L1] Structural validation (W04 §7.1 enhanced)
   ↓ pass
[L2] Content eval (R-eval LLM-as-judge)
   ↓ pass
[L3] Harness compliance (R-HRN trace)
   ↓ pass
Commit to projects/{id}/
```

If ANY layer fails → block commit, structured retry feedback. NEVER skip a layer.

---

## 2. L0 — File-system existence (NEW pre-eval gate)

**Mandatory before invoking R-eval**:

```yaml
file_existence_check:
  - path: projects/{id}/{expected_output_path}
    must_exist: true
    error_if_missing: "Agent claimed wrote file but FILE NOT FOUND. Retry with explicit write tool call."
  
  - file_size_bytes:
      min: 200          # tighter than vague "size hợp lý" — 50-byte garbage caught
      max: 500000       # 500KB cap (Markdown text, not images)
      error_if_below: "Output suspiciously small (< 200 bytes). Likely placeholder/error."
      error_if_above: "Output suspiciously large (> 500KB). Likely runaway content."
  
  - file_readable:
      utf8_valid: true
      no_null_bytes: true
      error_if_invalid: "File encoding broken — likely binary noise."
  
  - md_parseable:
      try_parse: true
      error_if_unparseable: "Markdown malformed — frontmatter or syntax error."
```

**Implementation note**: Engine runs these checks BEFORE dispatching to R-eval. Saves R-eval cost when output is structurally broken.

---

## 3. L1 — Structural validation (W04 §7.1 enhanced)

Per skill card output contract:

```yaml
structural_check:
  - required_sections:
      source: skill_card.outputs.sections
      check: each section heading must exist (H2 or H3 level)
      error: list missing sections by name
  
  - required_frontmatter:
      check: YAML frontmatter present at top
      required_fields: [agent_id, phase, project_id, generated_at]
      error: list missing fields
  
  - required_handoff_section:
      if: skill_card.outputs.has_handoff (most agents)
      check: ## Handoff section present + YAML block + required_inputs_to_quote ≥ 3
      error: handoff missing or under-specified per R-ORC-03
  
  - cross_refs_resolve:
      pattern: '@path|\[.+\]\(.+\)'
      check: each @path or markdown link resolves to existing file
      error: list dangling refs
      note: Skip external URLs (no fetch); only verify local path refs
  
  - banned_words:
      source: 40-docs-rules §R-DOC-07
      check: 0 banned words
      error: list banned words found with line numbers
```

L1 fail = auto-retry 1× with structured critique injected.

---

## 4. Failure response per layer

| Layer fail | Action | Cost |
|---|---|---|
| L0 file missing | Re-dispatch with "MUST use write_file tool, KHÔNG just claim wrote" | 1× retry, $0.05-0.15 |
| L0 file too small | Re-dispatch with min byte requirement explicit | 1× retry |
| L0 unparseable | Re-dispatch with "valid markdown" emphasis | 1× retry |
| L1 sections missing | Re-dispatch with template reference + missing sections list | 1× retry |
| L1 frontmatter missing | Re-dispatch with frontmatter schema | 1× retry |
| L1 handoff missing | Re-dispatch with R-ORC-03 quote rule | 1× retry |
| L1 cross-ref dangling | Drop ref OR fix path; KHÔNG just hallucinate target | 1× retry |
| L1 banned words | Lint + rewrite section (cheaper than full retry) | $0.02-0.05 |

If 2 retries still fail → escalate (W04 §7.5 retry policy).

---

## 5. Anti-hallucination specifically

Common pattern: agent says "I have written discovery-report.md" but **never invoked write_file tool**. Detection:

```python
# Engine-side check
declared_output = agent_response.parse_claimed_outputs()  # parse "wrote file X" claims
actual_outputs = trace.tools_called.filter(name="file_write").results

for claim in declared_output:
    if claim.path not in actual_outputs.paths:
        raise OutputHallucination(f"Claim {claim} not in actual tool calls")
```

→ Mandatory check. Alternative: trust agent → file existence check (L0) catches it post-hoc, but wastes 1 dispatch cost.

---

## 6. Cross-References

- W04 §7 Eval gate: [`@../../experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md`](../../experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md)
- Harness envelope: [`@../rules/80-harness-rules.md`](../rules/80-harness-rules.md) §R-HRN-08
- Quality rules: [`@../rules/70-quality-rules.md`](../rules/70-quality-rules.md) §R-QAL-01
- R-eval card: [`@../.agents/tier-1-research/R-eval-judge.md`](../.agents/tier-1-research/R-eval-judge.md)
- 40-docs banned words: [`@../rules/40-docs-rules.md`](../rules/40-docs-rules.md) §R-DOC-07
- ORC handoff QA: [`@../rules/100-orchestration-rules.md`](../rules/100-orchestration-rules.md) §R-ORC-03

---
*v1.0 — 2026-04-28. Tier S #2 fix from harness audit.*
