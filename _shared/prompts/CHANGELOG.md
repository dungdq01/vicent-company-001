# Prompts CHANGELOG

> Versioning RULES-PREAMBLE + KICKOFF + RE-RESEARCH + PROJECT-INTAKE + RETRO. Per `versioning-pinning.md`.

**Owner**: CTO.

---

## Format

Same as `_shared/.agents/CHANGELOG.md`. Each entry:
- date · file · old → new version
- type, changes, eval delta, regressions, ADR, sign

---

## Entries

### 2026-04-27 · RULES-PREAMBLE.md · v1.0 → v1.1

**Type**: structural addition

**Changes**:
- Rule list expanded: 8 → 11 (added R-HRN harness, R-LCY lifecycle, R-ORC orchestration)
- New section: `# HARNESS CONTRACT (R-HRN — runtime)` injected into every agent prompt
- New section: `# ORCHESTRATION CONTRACT (R-ORC — collaboration)` — handoff QA gate, receiver MUST quote 3+ inputs verbatim
- New section: `# LIFECYCLE CONTRACT (R-LCY — promote/demote/sunset)` — bidirectional flow rules
- Acknowledgment line: "Rules loaded: MAS · HRN · LCY · ORC · {domains}..."

**Eval delta**: N/A (new rule injection, not prompt regression — applies to all agents downstream)

**Regressions**: 0 (additive, no rule removed)

**Validated across**: N/A (framework-level — to be validated via first real project run)

**ADR**: ADR-0001 (placeholder — to be filled when first real ADR drafted)

**Signed**: CTO (P1) — 2026-04-27

---

### 2026-04-27 · KICKOFF-PROMPT, PROJECT-INTAKE, RE-RESEARCH, RETRO

**Status**: v1.0 unchanged. Will likely need v1.1 update when:
- KICKOFF: add harness profile selection step (currently in P0 phase doc, may move to template)
- PROJECT-INTAKE: align with `_meta.json.harness_profile` field
- RE-RESEARCH: align with PATH-D-RESEARCH.md staging gate
- RETRO: add "Harness Health" section per P9 phase doc

Each will be its own CHANGELOG entry when promoted.

---

## Cross-References

- Versioning + pin: [`@../standards/versioning-pinning.md`](../standards/versioning-pinning.md)
- Promote rule: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-08

---
*v1.0 — initialized 2026-04-27.*
