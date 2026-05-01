---
file: versioning-pinning
version: v1.0
last_updated: 2026-04-27
owner: CTO
status: production
---

# Versioning & Project Pinning Standard

> Reproducibility is first-class. Every artifact agents touch (skill cards, knowledge nodes, prompts, models, rules) must be **versioned** + **project-pinnable**. Closes lỗ hổng C9 (knowledge pin), C10 (skill pin), and supports demote/rewind.

---

## 1. What Gets Versioned

| Artifact | Version scheme | Storage |
|---|---|---|
| Skill card | semver `v1.0.0` in frontmatter | `_shared/.agents/CHANGELOG.md` |
| Skill card prompt | sub-version `v1.0.x` per R-MAS-08 | Same |
| RULES-PREAMBLE | semver | `_shared/prompts/CHANGELOG.md` |
| Rule files (`00`–`100`) | semver per file | Each file frontmatter |
| Knowledge baseline (B0X) | depth + revision: `L2-r3` | `knowledge/data/baselines/B0X/VERSION.txt` |
| Knowledge industry (I0Y) | depth + revision: `L2-r5` | `knowledge/data/industries/I0Y/VERSION.txt` |
| Model | provider's tag: `claude-sonnet-4-6` | Manifest reference |
| Tool schema | semver per tool | Tool registry |

---

## 2. Project Pin Manifest

Every project pins versions at P0 Intake. Stored in `projects/{id}/_meta.json.version_pin`:

```json
{
  "version_pin": {
    "preamble": "v1.0",
    "rules": {
      "00-MASTER-RULES": "v1.0",
      "80-harness-rules": "v1.0",
      "90-lifecycle-rules": "v1.0",
      "100-orchestration-rules": "v1.0"
    },
    "skill_cards": {
      "R-alpha": "v1.0.2",
      "R-beta": "v1.0.0",
      "R-AE": "v1.0.0",
      ...
    },
    "knowledge": {
      "B08": "L2-r3",
      "B09": "L2-r5",
      "I-MMO": "L1-r1"
    },
    "models": {
      "primary": "claude-sonnet-4-6",
      "fallback": "claude-haiku-4-5"
    }
  }
}
```

Engine **MUST** load these exact versions for the project's lifetime, regardless of what's currently in production globally.

---

## 3. Pin Lifecycle

| Event | Pin behavior |
|---|---|
| P0 Intake | Pin to current production versions, freeze |
| Mid-flight global upgrade (skill v1.0 → v1.1) | Project keeps v1.0; CTO may offer optional re-pin if no risk |
| Mid-flight knowledge update (β re-research) | Project keeps original version; new version available for next project |
| Phase rewind (R-ORC-07) | Re-evaluate pin: stick with original OR upgrade with full re-eval |
| Project closed (P9) | Pin frozen permanently in retro for future audit |
| Project resurrected after archive | Re-pin to current; if can't (deprecated artifact) → migration ADR |

---

## 4. Version-Triggered Re-Eval

When global artifact upgraded (per R-MAS-08), **all golden sets** that referenced it MUST re-eval automatically:

```
Trigger: skill card v1.0 → v1.1 promoted
Action:
1. Identify all golden sets containing v1.0 references
2. Run each against v1.1
3. Compare scores: regression > 0.3 = block promotion
4. Catalogue which projects pinned v1.0 still — flag as "upgrade candidate"
```

---

## 5. Reproducibility Audit

Per quarter, sample 5 closed projects → re-run P1 Discovery with original pin → verify outputs reproducible (within 0.5 score variance).

Failure = artifact drift even at pinned version (e.g., model provider silently updated). Investigate + escalate vendor + pin model snapshot more tightly (specific snapshot ID where available).

---

## 6. Anti-Patterns

- ❌ "Just use latest" — silent breakage of pinned projects
- ❌ Pin only models, ignore skill cards / knowledge
- ❌ Pin without CHANGELOG entry
- ❌ Mid-flight re-pin without ADR
- ❌ "It worked when I tested it" without recording version triple (skill, knowledge, model)

---

## 7. Cross-References

- Promote gate: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-08, [`@../rules/70-quality-rules.md`](../rules/70-quality-rules.md) §R-QAL-07
- Lifecycle (demote): [`@../rules/90-lifecycle-rules.md`](../rules/90-lifecycle-rules.md)
- Knowledge curation: [`@./knowledge-curation.md`](knowledge-curation.md)
- Project meta template: [`@../templates/project/_meta.json`](../templates/project/_meta.json)
- Skill card CHANGELOG: [`@../.agents/CHANGELOG.md`](../.agents/CHANGELOG.md)

---
*v1.0 — Adopted 2026-04-27. Reproducibility as first-class.*
