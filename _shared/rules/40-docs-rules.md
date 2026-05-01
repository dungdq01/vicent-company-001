---
file: 40-docs-rules
version: v1.0
last_updated: 2026-04-26
owner: CEO
status: production
---

# Documentation Rules — Conventions for All Docs

> Áp dụng cho mọi `.md` agent / human tạo ra trong workspace.

---

## R-DOC-01 — File Naming

- Convention: kebab-case · UPPER for top-level (`README.md`, `CHANGELOG.md`)
- Phases: `P0-INTAKE.md`, `S0-PROSPECT.md`, `CS0-ONBOARD.md`, `H0-NEED.md`, `F0-INVOICE.md`
- Skill cards: `R-{ID}-{role-slug}.md` (e.g., `R-MLE-ml-engineer.md`)
- Memory entries: `{Bxx,Ixx,Bxx-Iyy}-learnings.md`
- ADRs: `ADR-{NNNN}-{slug}.md`

MUST NOT use spaces · special chars · CamelCase in filenames.

---

## R-DOC-02 — Top-of-File Header

Skill cards + rule files + ADRs MUST start with YAML frontmatter:

```yaml
---
agent_id: R-MLE          # or file:, hat:, etc.
name: ML Engineer
tier: T2
version: v1.0
last_updated: YYYY-MM-DD
status: development | production | deprecated
---
```

Other docs MUST have:
- `# Title` (h1, single)
- 1-2 sentence purpose blockquote `> ...`
- `**Parent**: [`@path`](...)` if nested
- `**Canonical**: [`@path`](...)` if mirrors authoritative source

---

## R-DOC-03 — Cross-Reference Format

Links MUST use the citation format:

```
[`@/absolute/path/file.md:line`](relative/path)
```

- Absolute path inside backticks for citation
- Markdown link wrapper for navigation
- Optionally include line range `:1-3` or single `:30`

> Auto-check: link checker validates target exists.

MUST NOT use plain text paths or unlinked file mentions.

---

## R-DOC-04 — Single Source of Truth (Per R-MAS-01)

Every concept MUST live in one canonical doc:

| Concept | Canonical |
|---|---|
| Pipeline phase RACI + DoD | `business-strategy/13-product-delivery-process.md` |
| Per-deliverable DoD operational | `_shared/standards/dod-per-deliverable.md` |
| Eval framework spec | `_shared/eval/SPEC.md` |
| Agent roster | `_shared/.agents/TEAM-CONFIG.md` |
| Pricing | `business-strategy/10-pricing-sheet.md` |
| Stack allow-list | `_shared/rules/10-stack-rules.md` |
| Charter (CEO/COO/CTO) | `_shared/.agents/tier-0-executive/` |
| Master rules | `_shared/rules/00-MASTER-RULES.md` |

Other docs reference, MUST NOT copy.

---

## R-DOC-05 — Section Structure

Phase docs · skill cards MUST have sections (in order):
1. Title + box header (goal · duration · cost · human-involvement)
2. Trigger / Prev / Next
3. Engine Orchestration (table: step · agent · action)
4. Inputs
5. Outputs (with literal folder layout)
6. Definition of Done (✅ bullets)
7. Failure Modes (≥ 2)
8. Cross-References (footer table)

Deviation requires note in skill card.

---

## R-DOC-06 — Citation Discipline

When stating a fact / number / claim:
- MUST cite source (URL · file path · author)
- If no source available → say "no data" or "anecdotal"

Banned: vague citation phrases:
- ❌ "Studies show..."
- ❌ "Research suggests..."
- ❌ "Many companies..."
- ❌ "It is well known..."

---

## R-DOC-07 — Banned Words / Phrases (LLM Tells)

These trigger automated lint reject:

```
delve · tapestry · unleash · revolutionize · in today's fast-paced
moreover · furthermore · in conclusion · it is important to note
game-changer · paradigm shift · cutting-edge · next-generation · leveraging
seamless · synergy · holistic · robust solution · best-in-class
```

If concept genuinely needed → use plain Vietnamese / English equivalent.

---

## R-DOC-08 — Voice & Language

- **Vietnamese-first** for internal docs (per `business-strategy/16-brand §7`)
- Code-switch for technical terms when no clean VN equivalent (e.g., "deployment", "eval", "prompt")
- Anglicism avoided when VN exists ("mô hình" not "model" first reference)
- Tone: technical-direct (per CEO LLMOps voice)
- MUST NOT mix tone within doc

External / client-facing docs follow `16-brand-content-kit §2` voice variants.

---

## R-DOC-09 — Tables Over Prose

When listing structured info (≥ 3 items with same attributes) → use Markdown table.

```
✅ Right:
| Phase | Owner | Cost |
|---|---|---|
| P1 | CTO | $0.30 |

❌ Wrong:
P1 is owned by CTO and costs $0.30. P2 is owned by COO...
```

---

## R-DOC-10 — Code Blocks

- MUST tag language: ` ```typescript ` not ` ``` `
- Inline code with single backticks for: variable · function · file path · short code
- Long examples in fenced blocks, with comment explaining intent
- MUST NOT paste full files when ≥ 50 lines — use snippet + reference

---

## R-DOC-11 — Diagrams

- ASCII boxes acceptable for simple flow
- Mermaid for state machines · ER · sequence diagrams
- PNG / SVG for high-fidelity (commit alongside `.mmd` source)
- MUST include text alternative (alt text)

---

## R-DOC-12 — Last-Updated Discipline

Every doc MUST have:
- `last_updated: YYYY-MM-DD` in frontmatter (or footer `*Last updated: ...*`)
- Updated whenever content changes

> Auto-check: cron flags docs with last_updated > 90 days for review.

---

## R-DOC-13 — Versioning

- Files with `version: vX.Y` in frontmatter use semver-lite:
  - **Patch** (typo, clarify): no bump
  - **Minor** (added rule / section): `v1.1`
  - **Major** (breaking change to contract): `v2.0` + ADR
- Skill cards: bump on prompt change (per `_shared/.agents/CHANGELOG.md`)
- Rule files: bump on rule add/change

---

## R-DOC-14 — Anti-Patterns

- ❌ Walls of text > 5 paragraphs without heading
- ❌ Nested lists > 3 levels deep
- ❌ Inline lists when bullet would work
- ❌ "Click here" link text (use descriptive)
- ❌ Smiley emojis in technical docs (✅/❌/⚠️ for status OK)
- ❌ "TODO" without owner + date
- ❌ Rewriting entire doc when section update suffices

---

## R-DOC-15 — Memory Doc Specific

`knowledge/docs/memory/{Bxx,Ixx}-learnings.md` MUST follow `_shared/standards/memory-hygiene.md`:
- Each entry: timestamp · project · pattern · evidence · action taken · outcome
- MUST be transferable (not project-specific noise)
- Curated by R-σ, signed by CTO

---

## Quick Reference

```
DOCS RULES (R-DOC):
01 Naming kebab · 02 Frontmatter · 03 Citation format
04 SoT · 05 Section structure · 06 Citation discipline
07 Banned words · 08 Voice VN-first · 09 Tables over prose
10 Code blocks tagged · 11 Diagrams · 12 Last-updated
13 Versioning · 14 Anti-patterns · 15 Memory doc spec
16 Phase doc anchors (loader contract)
```

---

## R-DOC-16 — Phase Doc Anchors (Loader Contract)

Pipeline phase docs (`experience/workspace/docs/pipeline/*.md`) MUST use HTML comment anchors around key sections so loader extracts robustly, surviving heading rewording.

### Required anchor pattern

```html
<!-- @{anchor-id} -->
## Section Name
... content ...
<!-- /@{anchor-id} -->
```

### Anchors to apply (when section exists in doc)

| Anchor ID | Wraps section | Used by loader for |
|---|---|---|
| `@trigger` | "## Trigger" | When phase activates |
| `@outputs` | "## Outputs" or "## Output Contract" | What phase produces (handoff to next) |
| `@activities` | "## Activities" or "## Engine Orchestration" | Step-by-step what agents do |
| `@failure-modes` | "## Failure Modes" | Recovery patterns |
| `@harness-checkpoint` | "## Harness Checkpoint (R-HRN)" | Per-phase harness gates |

Other sections (Cross-References, examples) optional anchor.

### Loader fallback (graceful degradation)

Engine loader regex priority:
1. **Primary**: `<!-- @{id} -->(.+?)<!-- /@{id} -->` (multiline, non-greedy)
2. **Fallback**: heading regex `## {SectionName}\n(.+?)(?=\n## |\n---|\Z)`

If anchor missing → fall back to heading match, log warning to dispatcher (not error). Phase doc still loadable; anchor add = optimization, not requirement-breaking.

### Section names canonical

When writing new phase docs, prefer these section headers (more loader-friendly):
- `## Trigger` (not "When Activated")
- `## Outputs` (not "Deliverables")
- `## Failure Modes` (not "Edge Cases")
- `## Harness Checkpoint (R-HRN)` (mandatory section per harness rules)

Existing docs grandfather; new docs use canonical names.

---

---

## Cross-References

- Brand voice: [`@../../business-strategy/16-brand-content-kit.md`](../../business-strategy/16-brand-content-kit.md)
- Memory hygiene: [`@../standards/memory-hygiene.md`](../standards/memory-hygiene.md)
- Master rules: [`00-MASTER-RULES.md`](00-MASTER-RULES.md)

---
*v1.0*
