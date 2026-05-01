---
file: structure-readme-autogen
version: v0.1 (spec only)
last_updated: 2026-04-28
owner: CTO
status: spec — defer to engine MVP build
purpose: Specification for auto-generation script that maintains STRUCTURE-README.md by walking filesystem.
---

# Structure-README Auto-Generation Spec

> **Status**: SPEC ONLY. Code defer to engine MVP build. Hand-maintained `STRUCTURE-README.md` is canonical until script ships.

---

## Problem Solved

Currently `STRUCTURE-README.md` (root navigator, 43 README map) is **hand-maintained**. Drift risk:

| Drift trigger | Impact |
|---|---|
| New folder created → forget to add README row | Newcomer can't discover folder |
| README purpose changes → manual update missed | Stale Purpose column |
| Folder deleted → row not removed | Broken link |
| Quarterly W08 retro: 30 min audit each time | Founder time waste |

After 6 months: estimate 20-30% drift between `STRUCTURE-README.md` and reality.

## Solution: `studio refresh-structure` script

Engine command that walks filesystem, extracts README metadata, and auto-generates the navigator.

---

## Script Behavior Spec

### Input
- Repository root (default: `.`)
- Config: `_shared/standards/structure-readme-config.yaml` (NEW — list of folders to scan + ignore patterns)

### Output
- Generated `STRUCTURE-README.md` (root)
- Diff with current → propose update PR (CTO sign before merge)

### Steps

```
1. WALK filesystem rooted at config.scan_paths[]
   - Skip patterns: _archive/, node_modules/, .git/, projects/{legacy-engagement}/**
   - Find all README.md files

2. PARSE each README:
   a. If frontmatter exists → extract:
      - file, version, last_updated, owner, status, purpose
   b. Else → extract first H2 paragraph as "purpose" fallback
   c. Extract "When to load" hint from §How To Use OR derive from path

3. CATEGORIZE by layer:
   - L1 path matches knowledge/*
   - L2 path matches _shared/*
   - L3 path matches experience/*
   - L4 path matches projects/*
   - Studio path matches studio/*
   - ROOT path is root level

4. GENERATE table per layer with rows:
   | Path | Purpose | When to load |
   ↑ from frontmatter ↑ from purpose field ↑ from When-to-load hint

5. PRESERVE manual sections:
   - "Reading Order by Goal" (§Reading Order) — manual maintained
   - "Anti-Pattern" — manual
   - "Maintenance Triggers" — manual

6. WRITE to STRUCTURE-README.md with:
   - Auto-generated tables (between markers <!-- @autogen-start --> ... <!-- @autogen-end -->)
   - Manual sections preserved as-is

7. DIFF current vs new:
   - If no diff → exit 0, log "no changes"
   - If diff → write proposed STRUCTURE-README.md.new + emit diff to stdout
   - Engine creates PR (or async slack alert to CTO)

8. CTO REVIEW + MERGE
   - CTO reviews diff
   - If approved → mv .new → STRUCTURE-README.md
   - If rejected → log to permanent-fixes for adjustment
```

---

## Config Schema (`structure-readme-config.yaml`)

```yaml
version: v0.1

scan_paths:
  - "."                              # repo root
  
ignore_patterns:
  - "_archive/**"
  - "**/node_modules/**"
  - ".git/**"
  - "projects/{legacy-engagement-slug}/**"   # legacy engagement code subfolders
  - "**/_quarantine/**"
  - ".memory/**"
  - ".runs/**"
  - ".context-cache/**"

layer_routing:
  - prefix: "knowledge/"     → layer: "L1"
  - prefix: "_shared/"        → layer: "L2"
  - prefix: "experience/"     → layer: "L3"
  - prefix: "projects/"       → layer: "L4"
  - prefix: "studio/"         → layer: "Studio"
  - prefix: ""                → layer: "ROOT"  # fallback for root-level

purpose_extraction:
  primary: frontmatter.purpose
  fallback_1: first_paragraph_after_h1
  fallback_2: "(purpose missing — please add frontmatter)"

when_to_load_hints:
  # Path → hint mapping (manually curated, agent learns over time)
  "knowledge/data/baselines/README.md": "Adding/discovering B0X"
  "_shared/.agents/README.md": "Agent dispatch decision"
  "experience/.../pipeline/README.md": "Phase dispatch"
  # ... etc per current STRUCTURE-README content

manual_sections_preserve:
  - "## Reading Order by Goal"
  - "## Anti-Pattern"
  - "## Maintenance Triggers"
  - "## Cross-References"

output:
  path: "STRUCTURE-README.md"  # root level
  diff_threshold_alert: 5      # if > 5 row changes, require explicit CTO sign
```

---

## Frontmatter Convention for READMEs

For auto-gen to work, every README MUST have frontmatter:

```yaml
---
file: <basename>
version: vX.Y
last_updated: YYYY-MM-DD
owner: <role>
status: production | dev | deprecated
purpose: <one-line description, NO trailing period>
---
```

**Migration plan** (when script ships):
1. Audit all 43 READMEs for frontmatter compliance
2. Add missing frontmatter (batch ~30 minutes)
3. Run script first time → diff against hand-maintained STRUCTURE-README
4. Reconcile differences → source of truth shift to autogen
5. Quarterly W08 retro: review + merge auto-PRs

---

## Failure Modes

| Failure | Detection | Recovery |
|---|---|---|
| README missing frontmatter | Parser warning | Emit "purpose missing" placeholder + log to permanent-fixes |
| New layer added (e.g., `studio/finance/`) | Routing fallback to "ROOT" | Update config.layer_routing → re-run |
| README intentionally absent (sub-folder doesn't need one) | Walker still scans contents | Add `.no-readme-needed` marker file → walker skips |
| Concurrent edits (CTO editing while script runs) | Lock conflict | Script acquires read-lock; CTO write blocks 30s timeout |
| Script bug produces invalid markdown | Lint check post-write | Reject + restore prior version |

---

## Cost Estimate

- Walk + parse 43 READMEs: ~50ms (filesystem)
- LLM call NOT needed (pure regex + YAML parse)
- Diff computation: ~200ms
- Total: < 1s per run

→ Cheap enough to run **on every commit** as Git pre-push hook (optional optimization).

---

## Implementation Triggers

Build this when:

| Condition | Why |
|---|---|
| Engine MVP exists (orchestrator code shipped) | Script integrates with engine command interface |
| Framework reaches 60+ READMEs | Hand-maintenance burden too high |
| 3+ drift incidents detected via W08 retro | Empirical evidence of need |

**Until then**: hand-maintain STRUCTURE-README.md per its §Maintenance Triggers.

---

## When NOT to Build This

| Counter-trigger | Reason |
|---|---|
| Framework stays < 50 READMEs | Hand-maintain is fine, complexity not warranted |
| Founders prefer manual review for navigability changes | Auto-gen reduces "review surface" for important nav decisions |
| Engine MVP delayed > 6 months | Defer further — focus on revenue, not optimization |

---

## Cross-References

- Hand-maintained navigator: [`@../../STRUCTURE-README.md`](../../STRUCTURE-README.md)
- Document catalog (related meta-docs): [`@./document-catalog.md`](document-catalog.md)
- W08 framework retro: [`@../../experience/workspace/docs/workflows/W08-framework-retro.md`](../../experience/workspace/docs/workflows/W08-framework-retro.md)
- Engine MVP scope: TBD (`experience/workspace/apps/orchestrator/` — not yet built)

---

## Maintenance

**Owner**: CTO (script + config) + COO (hand-maintained sections)

**Update cadence**:
- Spec evolves as engine MVP scope clarifies
- Config updates when new folder layer added
- Script implementation deferred per triggers above

---

*v0.1 spec — 2026-04-28. Implementation deferred to engine MVP. Until then, hand-maintain STRUCTURE-README.md per its §Maintenance Triggers.*
