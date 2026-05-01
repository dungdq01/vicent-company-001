# P0 — Intake & Scoping

> Understand the problem, match knowledge, form the agent team.

---

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 0: INTAKE & SCOPING                              │
│  Goal: Understand problem → match knowledge → form team  │
│  Duration: ~5 min (mostly automated)                     │
│  Human involvement: HIGH (user confirms/modifies)        │
└─────────────────────────────────────────────────────────┘
```

---

## Step 0.1 — Receive Client Brief + Sanitize

- **Input:** `projects/{id}/BRIEF-INTAKE.md` (canonical, copied from root template `/BRIEF-INTAKE.md` and filled by CEO/client) — 6 blocks: Client · Problem · Current state · Constraints · KPI · Out-of-scope. Free-text fallback only if BRIEF-INTAKE.md missing (then R-BA reconstructs).
- **Agent:** System (automated parsing of BRIEF-INTAKE.md) + **input sanitization gate** per `_shared/standards/input-sanitization.md`
- **Output:** Structured brief object (sanitized) → fills `00-intake.md` §1-5, §7, §10. Raw `BRIEF-INTAKE.md` preserved as audit trail.

### Sanitization sub-steps (v1.1, Tier S #5)

1. **S1 Pattern detection** — regex scan for prompt injection (override / role-play / output-hijack / tool-abuse / reveal-attempts)
2. **S2 LLM scan** — lightweight different-family LLM-as-judge (~$0.02)
3. **S3 Structured re-format** — extract facts only, drop injection, log to `.runs/sanitize-flags-{date}.log`
4. **Halt + human review** if 3+ matches OR tool-abuse pattern (Sev-1 trigger)

→ Downstream agents (R-Match P0.2, R-BA P0.4) read SANITIZED brief only. Raw preserved for audit.

Cross-ref: [`@../../../../_shared/standards/input-sanitization.md`](../../../../_shared/standards/input-sanitization.md)

## Step 0.2 — Knowledge Matching (R-Match agent)

**Agent**: R-Match (tier-1 classifier) — single canonical owner.
**Distinct from**: R-BA (structures brief, NOT classifier), R-α (researches AFTER classification).

Process:
1. R-Match reads brief + `knowledge/INDEX.md` (lite, ~5KB — NOT full JSONs)
2. **Semantic match (LLM-based on INDEX.md keywords + use cases)** — vector DB embeddings deferred to engine MVP
3. Multi-select per dimension (most projects span 2-3 baselines + 1-2 industries)
4. Confidence score per match with **evidence quotes** from brief
5. Identify matrix cells (B0X × I0Y) + depth available per node
6. Flag `fresh_research_needed` if shallow node + complex project (Path D trigger)
7. If overall confidence < 0.70 OR ambiguity → `human_review_required: true`

**Output**: `classify-match.json` per A4 schema → `_meta.json.knowledge_match` after human approve.

**KHÔNG bias toward Logistics/MMO** — match purely on evidence. Framework supports all 15 baselines × 20 industries + custom (I-MMO etc.).

Cross-ref: [`@../../../../_shared/.agents/tier-1-research/R-Match-classifier.md`](../../../../_shared/.agents/tier-1-research/R-Match-classifier.md) + [`@../../../../knowledge/INDEX.md`](../../../../knowledge/INDEX.md)

## Step 0.2b — Gap Pre-Scan (automated, part of H2)

Runs immediately after knowledge matching, before team assembly.

Process:
1. Load `docs/agents/GAP-DETECTION.md` → gap taxonomy + budget rules
2. For each matched node (Bxx, Ixx, Bxx-Ixx):
   - Check report depth vs. client brief specificity
   - Check report age (>6 months on fast-moving fields = L3 candidate)
   - Scan brief for tools/products/regulations not present in baselines → L1/L2 candidates
   - Any topic absent from ALL matched nodes → L4 flag
3. Assign preliminary gap level (L0-L4) per topic
4. Estimate search budget needed per active agent
5. If ANY L4 detected → flag Manager immediately, add to Open Questions

**Output:**
- `projects/{PROJECT_ID}/_metadata/gap-pre-scan.json` — gap levels + budget per agent
- Summary appended to `project-brief.md § Knowledge Gaps` (generated in Step 0.4)

**Example:**

```
B01 Forecasting:  client mentions "LightGBM + Optuna" → L1 (1 search for α)
I06 Logistics:    covers routing/WMS → L0
B01-I06 Matrix:   age 4 months, fast-moving field → L0 (acceptable)
→ Budget: α: 1 pre-authorized L1 query
```

## Step 0.2c — Attachment Intake (NEW v1.1)

> Runs after R-Match + Gap Pre-Scan, BEFORE team assembly. Reason: attachments inform which agents need addons → team assembly must know.

**Input**: `projects/{id}/_meta.json.attachments[]` (declared by P3 from BRIEF block 7) + raw files in `_attachments/` + `.agents/` folders.

**Process**:
1. **Skill addon validation** (case 1):
   - For each `agent_addons[]` entry → verify `parent_version_pin` matches `_shared/.agents/{base}.md` current version
   - Verify `addon_file` exists in `projects/{id}/.agents/`
   - If `strategy=new_persona` → require `new_persona_signoff` (CEO)
   - BLOCK if any fail

2. **Doc ingestion** (case 2):
   - For each `docs[]` entry:
     - Extract PDF/DOCX → `.txt` (R-σ, cache forever)
     - Compute SHA256 → store in `_index.md` + `_meta.json.docs[].sha256`
     - **PII scan** per `pii-redaction.md` → if fail, redact OR BLOCK + P1 sev-2
     - **License/confidentiality** classify per `60-security-rules.md`
     - **Size check**: warn if extracted > 50KB; BLOCK if cumulative > 30% project budget per `cost-budgets.md`

3. **Repo ingestion** (case 3):
   - For each `repos[]` entry → read `_attachments/repos/_refs.yaml`:
     - **License check** by R-SEC (MIT/Apache/BSD OK; GPL/AGPL → BLOCK if proprietary deliverable)
     - **Allowlist check** — if URL novel, escalate CEO sign
     - **PII scan** even for OSS (test fixtures can leak)
     - Fetch per `fetch_method` (git_clone/manifest_only/download_zip) → `cache_path`
     - Set `license_compatible: true · allowlist_passed: <date> · pii_scan_passed: <date>`

4. **Manifest sync**:
   - R-σ updates `_attachments/_index.md` (human view) from `_meta.json.attachments[]` (source of truth)
   - Append entries to verification log §4

5. **Cost summary**:
   - R-σ totals attachment token estimate → write to `_index.md` §5
   - If > 30% budget → P1 review BEFORE proceed to 0.3

**Output**: Attachments verified + cached + ready for W04 §2.6 dispatch loading.

**Failure modes**:
- Addon `parent_version_pin` mismatch → BLOCK, P3 fix base agent or pin
- PII detected, cannot redact → quarantine + P1 sev-2
- License incompatible → BLOCK, find alternative repo OR escalate CEO
- Cumulative attachment > 30% budget → P1 consolidate (summarize raw)

Cross-ref: [`@../../../../_shared/standards/project-attachments.md`](../../../../_shared/standards/project-attachments.md)

## Step 0.3 — Team Assembly (automated + human confirm)

Process:
1. Load agent-team-config.md → Baseline→Role mapping
2. Select required agents based on matched Baselines
3. Add industry domain expert (R-Dxx)
4. Add standard roles: R-PM, R-SA, R-QA, σ
5. Run 7-Stage Pipeline Coverage Check → verify every stage has ≥1 agent
6. Present team roster to user for confirmation

**Output:** Confirmed team roster

## Step 0.4 — Generate Project Brief

- **Agent:** R-BA (Business Analyst)
- **Context:** Structured brief + matched B/I + team roster

Process:
1. Formalize problem statement
2. List explicit constraints (budget, timeline, team, data)
3. Define success criteria (measurable KPIs)
4. Identify assumptions + open questions
5. Define scope boundaries (what's IN, what's OUT)

**Output:** `projects/{PROJECT_ID}/project-brief.md`

## Step 0.5 — User Confirmation

- User reviews: project-brief.md + team roster + matched knowledge
- User can: modify scope, add constraints, change team, approve
- Status:
  - APPROVED → start P1
  - MODIFIED → regenerate brief → re-confirm

---

## Project Brief Template

```markdown
# Project Brief — {PROJECT_NAME}

## Problem Statement
[1-2 paragraphs: what client needs, why it matters]

## Client Context
- **Company:** [name, size, industry]
- **Current state:** [how they handle this today]
- **Pain points:** [specific problems]

## Constraints
- **Budget:** [amount or range]
- **Timeline:** [target delivery date]
- **Team:** [available developers, their skills]
- **Data:** [what data exists, format, volume, quality]
- **Tech:** [existing tech stack, infrastructure, preferences]
- **Compliance:** [regulatory requirements if any]

## Success Criteria
1. [Measurable KPI 1]
2. [Measurable KPI 2]
3. [Measurable KPI 3]

## Scope
- **In scope:** [what we will deliver]
- **Out of scope:** [what we explicitly won't do]
- **Assumptions:** [things we assume to be true]

## Knowledge Context
- **Baselines matched:** B01 (Forecasting), B06 (Optimization)
- **Industry matched:** I06 (Logistics)
- **Matrix node:** B01-I06 (if exists)
- **Pipeline scope:** [A/B/C/D — how many phases]

## Agent Team
| Role | Agent | Phases |
|------|-------|--------|
| ... | ... | ... |
```

See [P1-DISCOVERY.md](P1-DISCOVERY.md) for the next phase.

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

**Phase responsibility — establish project harness foundation.** Engine MUST refuse P1 dispatch if any item below missing.

| Action | Output | Rule |
|---|---|---|
| Set harness profile | `_meta.json.harness_profile = "L0"` (Sandbox) / `"L1"` (Standard client) / `"L2"` (Critical — production / regulated) | R-HRN-01 |
| Initialize harness folder | Copy [`_shared/templates/project/harness/`](../../../../_shared/templates/project/harness/) → `projects/{id}/harness/` | R-HRN-05 |
| Confirm cost cap aligned with profile | `harness/manifest.yaml.cost.per_run_usd_cap` matches Sprint tier in [`cost-budgets.md`](../../../../_shared/standards/cost-budgets.md) | R-HRN-01 + R-MAS-07 |
| Identify jurisdiction (if data-touching) | Set `_meta.json.client_jurisdiction` (VN / SG / TH / EU / etc.) — drives R-DataOps later | R-HRN-01 |

**Gate to P1**: phase BLOCKED if `harness/` absent OR profile unset OR cost cap missing.

**Profile selection rule of thumb**:
- L0 if internal R&D, throwaway, < $500 budget
- L1 if client-paid Sprint A/B, no PII at scale, no production deploy
- L2 if production deploy OR regulated (Healthcare/Finance/Insurance) OR PII volume > 10K records

Cross-ref full spec: [`@../../../../_shared/rules/80-harness-rules.md`](../../../../_shared/rules/80-harness-rules.md)
<!-- /@harness-checkpoint -->

---
*Agent Workspace v1.0*
