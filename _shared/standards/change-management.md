---
file: change-management
version: v1.1
last_updated: 2026-04-28
owner: CTO + COO
status: production
---

# Change Management — Propagation Protocol

> **Vấn đề**: thêm/bớt agent / knowledge / harness rule / workflow step / pipeline phase = 5-10 chỗ phải update cùng. Miss 1 chỗ = orphan ref / conflict / silent drift.
>
> **Giải pháp**: 5 scenarios × concrete checklist. Follow checklist = 0 sót. KHÔNG depend vào memory.
>
> **Khi nào dùng**: TRƯỚC mọi structural change. KHÔNG mid-engagement (R-MAS-16). Batch ở W08 quarterly OR ad-hoc khi non-blocking.

---

## 0. Pre-flight (5 câu hỏi BẮT BUỘC, 2 phút)

```
1. Đây là mid-engagement? 
   YES → STOP. Đi vào projects/{id}/harness/permanent-fixes.md. KHÔNG framework write.
   NO  → tiếp Q2.

2. Change này thuộc scenario nào?
   1) Add/remove agent role          → §1
   2) Add/update knowledge node      → §2
   3) Modify harness rule            → §3
   4) Add/modify workflow step       → §4
   5) Update knowledge into pipeline → §5
   6) Add new folder/README/standard → §5.4 (sub of cross-reference)
   Other → ADR + escalate CTO

3. Authority sign?
   - Skill card / rule / standard → CTO
   - Knowledge → CEO + R-σ via K-review (W11)
   - Pipeline phase doc → CTO + CEO via W08
   - Strategic (business-strategy/) → all 3 founders
   - Engagement-specific override → permanent-fixes only

4. ADR cần không?
   - Structural (add/remove file, rename, schema change) → YES (R-MAS-14)
   - Content tweak (typo, clarify, link fix) → NO

5. Eval delta proof có không?
   - Skill card v1.0→v1.1 → R-MAS-08 mandatory (≥+0.3 mean, 0 regression, 3-project)
   - Rule add → KHÔNG cần eval delta
   - Knowledge promote → K-review citation verify
```

→ Pass 5 questions → execute scenario checklist below.
→ Fail Q1 (mid-engagement) → STOP, route khác.

---

## 1. Scenario: ADD/REMOVE AGENT ROLE (vd thêm R-Match, sunset R-X)

### 1.1 ADD new agent (R-X)

```yaml
checklist_add_agent:
  CREATE:
    - [ ] _shared/.agents/tier-{N}/R-X-{role-slug}.md           # skill card
    - [ ] _shared/eval/golden-sets/R-X.yaml                      # ≥5 cases MVP

  UPDATE (mandatory):
    - [ ] _shared/.agents/TEAM-CONFIG.md §I roster              # add row
    - [ ] _shared/.agents/tier-{N}/README.md                    # count + table + sequence diagram
    - [ ] _shared/.agents/README.md §Roster summary             # bump count
    - [ ] _shared/.agents/CHANGELOG.md                          # add entry
    - [ ] _shared/standards/document-catalog.md                 # if agent ships unique deliverable

  UPDATE (consider):
    - [ ] _shared/prompts/AGENT-MANUAL.md                       # if mandatory tier (e.g., R-Match like)
    - [ ] _shared/prompts/RULES-PREAMBLE.md                     # if affects acknowledgment line
    - [ ] experience/.../workflows/W04                          # if dispatch-critical
    - [ ] experience/.../pipeline/P{N}.md                       # if invoked at specific phase
    - [ ] START-HERE.md §6 reading branch                       # if newcomer relevant
    - [ ] PROJECT.md §5 routing                                 # if task pattern shifts

  RUN:
    - [ ] W09 Agent Onboarding 7-stage probation
        # 1. Skill card draft
        # 2. Golden set ≥20 cases
        # 3. Probation 3 internal projects
        # 4. Integration test với adjacent agents
        # 5. Cost calibration
        # 6. CTO sign + ADR
        # 7. Production deploy
```

### 1.2 REMOVE / SUNSET agent (R-X)

```yaml
checklist_sunset_agent:
  CHECK FIRST:
    - [ ] Active projects pinning skill_overrides[R-X]?         # block until they migrate
    - [ ] Other agents handoff to R-X via R-ORC-03?             # update them first

  ARCHIVE:
    - [ ] mv _shared/.agents/tier-{N}/R-X-*.md → _shared/.agents/_archive/{date}-R-X-*.md
    - [ ] Add archived header (per _archive/README.md format)

  UPDATE:
    - [ ] _shared/.agents/TEAM-CONFIG.md §I — remove row
    - [ ] _shared/.agents/tier-{N}/README.md — count + table
    - [ ] _shared/.agents/README.md §Roster
    - [ ] _shared/.agents/CHANGELOG.md — sunset entry
    - [ ] document-catalog.md — remove rows
    - [ ] AGENT-MANUAL.md if listed
    - [ ] W04 if dispatch-listed
    - [ ] Phase docs if invoked

  GREP CHECK (manual lint):
    - [ ] grep -r "R-X" _shared/ experience/ business-strategy/ → 0 orphan references
    - [ ] grep -r "R-X" projects/ → identify pinned projects, notify

  ADR mandatory.
```

---

## 2. Scenario: ADD/UPDATE KNOWLEDGE NODE (baseline / industry / sub-node / matrix cell)

### 2.1 ADD new node (e.g., I-MMO industry node)

```yaml
checklist_add_knowledge:
  TRIGGER:
    - Path D fresh research OR project memory promotion candidate

  WRITE INITIALLY TO:
    - [ ] knowledge/staging/{path}/                             # NOT data/ directly!
    - [ ] APPEND knowledge/staging/_review-queue.yaml           # entry per K-review schema

  RUN W11 K-review:
    - [ ] Citation 2nd-source verify (≥3 random)
    - [ ] PII / client-confidential leak scan
    - [ ] Conflict with existing data/ → split/merge per R-LCY-04
    - [ ] Voice + structure match canonical
    - [ ] Sunset criteria explicit (when becomes stale?)
    - [ ] CEO + R-σ sign

  ON APPROVE:
    - [ ] mv knowledge/staging/{path}/ → knowledge/data/{path}/
    - [ ] CREATE/UPDATE knowledge/data/{path}/VERSION.txt        # e.g., L1-r1-2026-04-28
    - [ ] UPDATE knowledge/INDEX.md                              # add row + depth
    - [ ] UPDATE knowledge/data/baselines/README.md OR industries/README.md if structural

  PROPAGATE:
    - [ ] If new industry → R-Match next dispatch will auto-pick up via INDEX.md
    - [ ] If matrix cell new → projects with related baseline+industry pinning may benefit
    - [ ] Re-eval golden sets that referenced old version
    - [ ] _shared/.agents/CHANGELOG.md (if knowledge bump affects skill card behavior)

  ANNOUNCE:
    - [ ] #decisions Slack/Discord
    - [ ] Notify R-LLMOps for next weekly digest

  ADR if structural (new industry, split/merge baseline).
```

### 2.2 UPDATE existing node (e.g., B01 L2 → L3)

```yaml
checklist_update_knowledge:
  WRITE delta TO:
    - [ ] knowledge/staging/{path}/{file}-v2.md                  # NOT overwrite data/

  RUN W11 K-review (same as 2.1).

  ON APPROVE:
    - [ ] BUMP VERSION.txt (e.g., L2-r3-2026-04-28 → L3-r1-2026-04-28)
    - [ ] mv staging → data/ (overwrite OR archive old version trong _archive/)
    - [ ] UPDATE knowledge/INDEX.md depth column

  CHECK PROJECTS PINNED to old version:
    - [ ] grep `knowledge_pinning` in active projects
    - [ ] Notify owners — they CAN keep pinned (versioning-pinning §3) OR upgrade explicit
    - [ ] If upgrade needed → trigger phase rewind protocol (W12)
```

### 2.3 SUNSET / QUARANTINE knowledge

```yaml
checklist_sunset_knowledge:
  TRIGGER:
    - Citation broken / outdated SOTA / contradicted by 2+ projects (R-LCY-04)

  IMMEDIATELY:
    - [ ] mv data/{path}/ → _quarantine/{path}-{date}/           # don't wait for review
    - [ ] APPEND knowledge/_quarantine/_quarantine-log.md

  WITHIN 30 DAYS:
    - [ ] Fix + return to staging for re-review (W11)
    - [ ] OR archive permanently → knowledge/_archive/

  PROPAGATE:
    - [ ] UPDATE INDEX.md (mark quarantined / archived)
    - [ ] NOTIFY projects pinning this version → must re-pin OR phase rewind
    - [ ] CHANGELOG entry

  ADR mandatory.
```

---

## 3. Scenario: MODIFY HARNESS RULE (R-HRN-XX add/change/remove)

### 3.1 ADD new harness rule (R-HRN-XX)

```yaml
checklist_add_harness_rule:
  UPDATE rule canonical:
    - [ ] _shared/rules/80-harness-rules.md                     # add R-HRN-XX section
    - [ ] _shared/rules/80-harness-rules.md §Quick Reference    # add line

  UPDATE preamble (auto-inject):
    - [ ] _shared/prompts/RULES-PREAMBLE.md §HARNESS CONTRACT   # add bullet if runtime-relevant
    - [ ] _shared/prompts/CHANGELOG.md                          # entry

  UPDATE template (if config schema affected):
    - [ ] _shared/templates/project/harness/manifest.yaml       # add field
    - [ ] _shared/templates/project/harness/guardrails.yaml     # add if guardrails affected
    - [ ] _shared/templates/project/harness/README.md           # if structure changes

  UPDATE workflow:
    - [ ] experience/.../workflows/W04 §7 Layer 3 harness compliance  # add check if eval-relevant
    - [ ] experience/.../workflows/W04 §1 pre-checks            # add if dispatch-time check

  UPDATE phase docs (if checkpoint propagates):
    - [ ] P0-P10 phase docs §Harness Checkpoint                 # add row in relevant phases
    - [ ] PATH-B/C/D §Harness if applicable

  UPDATE active projects:
    - [ ] BUMP _meta.json.rules_version.harness in NEW projects
    - [ ] OLD projects continue at pinned version (versioning-pinning §3)

  GREP CHECK:
    - [ ] grep -r "R-HRN-XX" → all new refs resolve

  ADR mandatory.
```

### 3.2 MODIFY existing harness rule (e.g., R-HRN-10 cache threshold change)

```yaml
checklist_modify_harness:
  Same as 3.1 PLUS:
    - [ ] Identify affected projects (those using rule actively)
    - [ ] Re-eval golden sets if rule affects eval criteria
    - [ ] Sunset old rule → _archive/ if breaking change
    - [ ] Migration path documented (old → new behavior)
    - [ ] BUMP rule file version in frontmatter

  Breaking change → wider authority + W08 retro discussion.
```

### 3.3 SUNSET / UNLEARN harness rule

```yaml
checklist_unlearn_harness:
  TRIGGER:
    - Rule wrong in 2+ projects (R-LCY-01) OR actively harmful (R-LCY-02)

  ARCHIVE:
    - [ ] Move rule section → _shared/rules/_archive/{date}-R-HRN-XX.md
    - [ ] Add archived header

  IF HARMFUL (not just outdated):
    - [ ] APPEND _shared/rules/_unlearn-list.md                 # negative knowledge
    - [ ] Inject into RULES-PREAMBLE "DO NOT APPLY" section

  PROPAGATE:
    - [ ] Remove from §Quick Reference Card
    - [ ] Remove from RULES-PREAMBLE TOP invariants list
    - [ ] Update phase docs that referenced

  ADR + CTO sign mandatory + Re-eval golden sets that previously passed.
```

---

## 4. Scenario: ADD/MODIFY WORKFLOW STEP (W{NN} or pipeline phase)

### 4.1 ADD new workflow (W{NN})

```yaml
checklist_add_workflow:
  CREATE:
    - [ ] experience/.../workflows/W{NN}-{slug}.md              # full doc

  UPDATE indexes:
    - [ ] experience/.../workflows/README.md                    # add row to file index
    - [ ] PROJECT.md §5 routing                                 # add row if newcomer relevant

  UPDATE rules referencing:
    - [ ] grep -r "W{NN}" _shared/rules/ → ensure cited correctly
    - [ ] If workflow operationalizes a rule → cross-ref in rule file

  UPDATE phase docs (if cross-cutting):
    - [ ] P0-P10 phase docs that depend on workflow

  UPDATE catalog:
    - [ ] _shared/standards/document-catalog.md                 # if workflow produces named outputs

  CONSIDER:
    - [ ] _shared/prompts/AGENT-MANUAL.md if workflow agent-relevant

  ADR if structural.
```

### 4.2 ADD step into existing pipeline phase

```yaml
checklist_add_pipeline_step:
  UPDATE phase doc:
    - [ ] experience/.../pipeline/P{N}-*.md                     # add step (preserve anchors!)
    - [ ] BUMP version in frontmatter
    - [ ] Update §Harness Checkpoint if relevant
    - [ ] Update §Failure Modes if new failure surface

  UPDATE dependencies:
    - [ ] W04 dispatch runbook §2.1 mandatory load             # if new file added to mandatory
    - [ ] Document catalog if step produces new doc type

  UPDATE skill card OF AGENT INVOKED:
    - [ ] Skill card §Inputs (if new input)
    - [ ] Skill card §Outputs (if new output)
    - [ ] Skill card §System Prompt (if behavior change)
    - [ ] Skill card BUMP version (R-MAS-08 eval delta required if behavior changes)

  PROPAGATE:
    - [ ] W03 walkthrough INDEX timeline if step adds Day
    - [ ] START-HERE §4 E2E flow if step visible in newcomer narrative

  ADR if structural.
```

### 4.3 SUNSET workflow / phase

```yaml
checklist_sunset_workflow:
  ARCHIVE:
    - [ ] mv workflow/phase doc → _archive/

  UPDATE indexes:
    - [ ] Remove from workflows/README.md or pipeline/README.md
    - [ ] Mark legacy header in archive

  GREP CHECK:
    - [ ] grep -r "W{NN}" / "P{N}" → identify orphan refs
    - [ ] Update or remove orphan refs

  ADR mandatory.
```

---

## 5. Scenario: UPDATE KNOWLEDGE INTO PIPELINE (cross-reference)

> "Tôi học được pattern X từ project, muốn nhúng vào quy trình. Đặt đâu?"

### Decision tree:

```
Pattern relevant to:
   ├─ 1 specific agent → update that skill card §System Prompt + bump version
   ├─ 1 specific phase → update phase doc §Activities or §Harness Checkpoint
   ├─ Cross-phase / runtime universal → propose new RULE (R-XXX-NN)
   ├─ Knowledge fact (industry / baseline) → memory file (B0X-learnings.md / I0Y-learnings.md)
   ├─ Strategic insight → studio/wisdom/{appropriate-file}.md (internal-only)
   ├─ New folder OR README OR standard file → §5.4 below
   └─ Decision pattern → ADR + decision-log-index categorize
```

### Per location, follow corresponding checklist:

```yaml
update_per_target:
  skill_card:
    - Apply scenario §1.1 partial (UPDATE, not CREATE)
    - R-MAS-08 eval delta proof required
  
  phase_doc:
    - Apply scenario §4.2
  
  new_rule:
    - Apply scenario §3.1
  
  memory_file:
    - Apply scenario §2.2 (knowledge node update)
    - Per R-MAS-05 promotion path: project retro → memory → maybe rule
  
  studio_wisdom:
    - File internal — KHÔNG inject vào client deliverable (R-MAS-16 + boundaries.md)
    - Append to relevant file with format per studio/wisdom/{file}.md header
    - CEO sign for hot-takes / churn-patterns
  
  ADR:
    - Apply decision-log-index.md format
    - Authority sign per change category
```

### 5.4 ADD New Folder / README / Standard File

```yaml
checklist_add_folder_or_readme:
  CREATE:
    - [ ] Folder (mkdir) with intended structure
    - [ ] README.md with MANDATORY frontmatter:
          ---
          file: <basename-without-ext>
          version: v1.0
          last_updated: YYYY-MM-DD
          owner: <CEO|COO|CTO|R-x>
          status: production | dev | deprecated
          purpose: <one-line, NO trailing period>
          ---

  UPDATE indexes (mandatory — discoverability):
    - [ ] STRUCTURE-README.md (root)                            # add row to correct layer table
          # Until engine MVP: hand-add per its §Maintenance Triggers
          # After engine MVP: autogen script handles via Git pre-push
          # Spec: _shared/standards/structure-readme-autogen.md
    - [ ] Parent layer's index README (e.g., _shared/standards/README.md if new standard)
    - [ ] PROJECT.md §5 routing table (if newcomer-relevant task pattern)
    - [ ] START-HERE.md §8 lookup (if entry-tier discoverable concept)

  UPDATE catalog (if file produces shippable output):
    - [ ] _shared/standards/document-catalog.md                 # add doc ID (DEL/INT/SAL/CS/OPS)

  CROSS-REF:
    - [ ] Cite from at least 1 existing canonical doc (READMEs above OR rule files)
    - [ ] Avoid orphan: file referenced from 0 places = invisible = silent waste

  GREP CHECK:
    - [ ] grep -r "{new-filename}" → references resolve correctly
    - [ ] No duplicate concept already exists (R-MAS-01 — search before create)

  ADR if structural (new top-level folder, new layer, new standards category).

# Special case: new standard in _shared/standards/
checklist_new_standard_file:
  Same as above PLUS:
    - [ ] _shared/standards/README.md §Roster                   # add row + 1-line description
    - [ ] Cite from ≥2 places to avoid orphan (e.g., relevant rule + relevant phase doc)

# Special case: deprecating old folder/file
checklist_deprecate_folder:
  - [ ] mv old → _archive/{date}-{name}/
  - [ ] Add deprecation header in stub at old path:
        "MOVED → @new-canonical-path"
  - [ ] Update STRUCTURE-README.md (remove row OR mark deprecated)
  - [ ] Update parent README.md
  - [ ] Grep all references to old path → update to new
```

**Why important**: silent feature trap = ship spec without discovery hooks = 0 adoption. Every new artifact MUST have ≥3 inbound references (one of: STRUCTURE-README, layer README, START-HERE/PROJECT.md routing, or rule citation).

### 5.5 ADD Project Attachment (skill addon · doc · repo ref)

> **Spec**: `_shared/standards/project-attachments.md`
> **Scope**: changes inside `projects/{id}/` only — NOT studio-level. Promotion to studio = follow §1.1 ADD AGENT.

```yaml
# ─────────────────────────────────────────
# 5.5a — ADD Skill Addon for Agent
# ─────────────────────────────────────────
checklist_add_skill_addon:
  PRE-FLIGHT:
    - [ ] Studio-level _shared/.agents/{base}.md genuinely insufficient (NOT lazy duplicate)
    - [ ] If strategy=new_persona → CEO sign required

  CREATE:
    - [ ] projects/{id}/.agents/R-{base}-{addon-id}.md with frontmatter:
          agent_id, addon_id, strategy, target_sections (if replace),
          parent_version_pin, load_for_phases, reason
    - [ ] projects/{id}/.agents/_overrides.yaml — append entry per template

  DECLARE:
    - [ ] projects/{id}/_meta.json.attachments.agent_addons[] — add entry
    - [ ] projects/{id}/_attachments/_index.md §3 — add human-readable entry

  VERIFY:
    - [ ] parent_version_pin == current _shared/.agents/{base}.md version (else BLOCK)
    - [ ] load_for_phases not empty (else orphan)
    - [ ] grep base agent name in addon body — confirm references coherent
    - [ ] Test dispatch in dry-run: W04 §2.6 merge produces valid prompt

  PROMOTION WATCH:
    - [ ] If 3rd project pinning same addon pattern → flag candidate (learning-system.md sweep)
    - [ ] Promotion to studio = §1.1 ADD AGENT (full process)

# ─────────────────────────────────────────
# 5.5b — ADD Document / Codebase
# ─────────────────────────────────────────
checklist_add_doc:
  PRE-FLIGHT:
    - [ ] Source confirmed (client uploaded · public domain · licensed reference)
    - [ ] Size estimate < 30% project budget (else summarize first)

  PROCESS:
    - [ ] Copy source file → projects/{id}/_attachments/docs/{filename}
    - [ ] Extract to text (PDF/DOCX → .txt) via R-σ — cache, no re-OCR
    - [ ] Compute SHA256 of original file
    - [ ] PII scan per pii-redaction.md → if fail, redact OR BLOCK
    - [ ] License/confidentiality classify per 60-security-rules.md

  DECLARE:
    - [ ] _meta.json.attachments.docs[] — add entry with sha256 + load filter
    - [ ] _attachments/_index.md §1 — add human-readable entry + summary
    - [ ] Verification log §4 — append row

  VERIFY:
    - [ ] Engine W04 §2.6 dry-run loads .txt for declared agents/phases
    - [ ] Token estimate added to §5 cost budget table

# ─────────────────────────────────────────
# 5.5c — ADD GitHub Repo Reference
# ─────────────────────────────────────────
checklist_add_repo:
  PRE-FLIGHT:
    - [ ] URL is in studio allowlist OR explicit CEO approval (supply-chain risk)
    - [ ] License compatible with project deliverable (R-SEC verifies — GPL→BLOCK if proprietary)
    - [ ] Commit SHA pin known (NEVER branch reference)

  PROCESS:
    - [ ] Choose load_strategy: cherry_pick (preferred) | manifest_only | full_clone
    - [ ] Append entry to _attachments/repos/_refs.yaml per template
    - [ ] Fetch per fetch_method (git_clone | manifest_only | download_zip) → cache_path
    - [ ] PII scan per pii-redaction.md (test fixtures, env samples can leak)
    - [ ] Set license_compatible: true · allowlist_passed: <date> · pii_scan_passed: <date>

  DECLARE:
    - [ ] _meta.json.attachments.repos[] — add entry pointing to _refs.yaml
    - [ ] _attachments/_index.md §2 — add human-readable entry

  VERIFY:
    - [ ] cache_ttl_hours set (default 720h = 30d)
    - [ ] cherry_pick files exist in cloned/fetched content
    - [ ] summary_max_tokens set (avoid prompt bloat)

# ─────────────────────────────────────────
# 5.5d — REMOVE / SUNSET attachment
# ─────────────────────────────────────────
checklist_remove_attachment:
  - [ ] Remove entry from _meta.json.attachments[]
  - [ ] Remove from _attachments/_index.md
  - [ ] Move file to _archive/{project-id}/{date}/ (NOT delete — audit trail)
  - [ ] Note in retro: why removed (irrelevant · superseded · PII issue · license change)
```

### Anti-pattern: scatter pattern across files

❌ Same insight written in skill card + phase doc + memory + ADR = 4 sources of truth = drift.
✅ ONE canonical location, others link to it (R-MAS-01).

→ Decision tree above tells which is canonical.

---

## 6. Master propagation matrix (quick lookup)

| Change type | Files touched (typical) | Authority | Eval delta? |
|---|---|---|---|
| Add agent role | 6-12 | CTO + W09 | After 30-day prod monitor |
| Sunset agent role | 8-10 + grep | CTO + ADR | — |
| Add knowledge node | 4-6 + K-review | CEO + R-σ | Citation verify |
| Sunset knowledge | 5 + projects pinned notify | CEO + ADR | — |
| Add harness rule | 5-9 | CTO + ADR | — |
| Modify harness rule | 5-9 + project re-eval | CTO + ADR + W08 | If criteria change |
| Sunset harness rule | 6 + unlearn list if harmful | CTO + ADR | Re-eval impact |
| Add workflow | 4-7 | CTO + ADR | — |
| Add pipeline step | 6-10 | CTO + CEO via W08 | R-MAS-08 if skill behavior |
| Sunset workflow | 4 + grep | CTO + ADR | — |
| Add folder/README | 3-5 (STRUCTURE-README + layer index + 1 cross-ref min) | COO + CTO | — |
| Add new standard file | 4-6 + ≥2 inbound refs | CTO + ADR | — |
| Add project skill addon | 3-4 (per project) + W04 dry-run | P3 + CEO if new_persona | — |
| Add project doc/codebase | 3 (per project) + PII + license | P3 + R-SEC | — |
| Add project repo ref | 3-4 (per project) + R-SEC license | P3 + CEO if novel allowlist | — |
| Update strategic file | 1 + cross-refs | All 3 founders | — |

→ Number files touched approximate. Always run grep check post-change.

---

## 7. Verify post-change (lint pass)

After ANY change:

```bash
# 1. Cross-ref check (manual until script exists)
grep -r "R-X" _shared/ experience/ business-strategy/ projects/_ops/
# → 0 orphan references expected

# 2. Markdown link rot
# Check @path refs in changed files resolve to existing files

# 3. CHANGELOG entries present
# - Per-layer CHANGELOG (.agents OR prompts) entry exists
# - ADR cross-referenced if structural

# 4. Eval re-run if applicable
# - Skill card change → run that agent's golden set
# - Rule change affecting threshold → re-eval baseline

# 5. Project version pin reconciliation
# - Active projects with pin to old version → owner notified
```

---

## 8. Anti-Patterns (forbidden)

- ❌ Mid-engagement framework write (R-MAS-16)
- ❌ Skip ADR for structural change (R-MAS-14)
- ❌ Update file without version bump
- ❌ Sunset without `_archive/` move (loses audit trail)
- ❌ Skip propagation checklist ("quick fix")
- ❌ "Just one more place" loop — if find 5+ refs, prob rule change too broad → split
- ❌ Promote skill card v++ without R-MAS-08 eval delta proof
- ❌ Knowledge promote without K-review (W11)
- ❌ Update workflow without grep check
- ❌ Multiple "canonical" copies of same concept (R-MAS-01)

---

## 9. When in doubt — escalate

Stuck on which checklist applies? Multi-scenario change?

→ Default escalate CTO. Better 5-min delay than 5-month drift.

→ Quarterly W08 framework retro = batch consolidate complex changes.

---

## 10. Cross-References

- Master rule (ADR mandatory): [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-14, §R-MAS-16, §R-MAS-08
- Lifecycle (sunset cadence): [`@../rules/90-lifecycle-rules.md`](../rules/90-lifecycle-rules.md)
- Versioning + project pin: [`@./versioning-pinning.md`](versioning-pinning.md)
- ADR format: [`@./decision-log-index.md`](decision-log-index.md)
- Knowledge curation (K-review): [`@./knowledge-curation.md`](knowledge-curation.md)
- W08 framework retro: [`@../../experience/workspace/docs/workflows/W08-framework-retro.md`](../../experience/workspace/docs/workflows/W08-framework-retro.md)
- W09 agent onboarding: [`@../../experience/workspace/docs/workflows/W09-agent-onboarding.md`](../../experience/workspace/docs/workflows/W09-agent-onboarding.md)
- W11 knowledge review: [`@../../experience/workspace/docs/workflows/W11-knowledge-review.md`](../../experience/workspace/docs/workflows/W11-knowledge-review.md)
- W12 phase rewind: [`@../../experience/workspace/docs/workflows/W12-phase-rewind.md`](../../experience/workspace/docs/workflows/W12-phase-rewind.md)
- Learning system overall: [`@./learning-system.md`](learning-system.md)
- Boundaries: [`@./boundaries.md`](boundaries.md)

---
*v1.1 — 2026-04-28. Closes "propagation discipline" gap. Follow checklist = 0 sót, 0 conflict. v1.1 added §5.4 Add Folder/README/Standard with ≥3 inbound refs rule (silent feature trap fix).*
