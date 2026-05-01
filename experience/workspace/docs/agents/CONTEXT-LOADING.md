# Context Loading
How context is loaded for each agent — what they receive, what they skip, and why.

See [PIPELINE-OVERVIEW.md](../pipeline/PIPELINE-OVERVIEW.md) for phase execution order.

---

## Three Context Types

Every agent dispatched in the pipeline receives up to 3 types of context:

### Context Type 1 — Knowledge Base (from MAESTRO)

```
Source: data/baselines/{BXX}.json + docs/reports/{BXX}/
What:   Agent's OWN previous report for relevant Baseline(s)

Example for α in B01×I06 project:
  • docs/reports/B01/research-report.md (α's own research on Forecasting)
  • docs/reports/B06/research-report.md (α's own research on Optimization)
  • data/baselines/B01.json (concepts, algorithms, SOTA — summary)
  • data/industries/I06.json (Logistics industry context)

Example for R-BE:
  • docs/reports/B01/R-BE-notes.md (R-BE's own notes on Forecasting backend)
  • data/baselines/B01.json → techStack + pipeline sections only

RULE: Each agent reads ONLY their own reports + relevant JSON sections.
      Never dump all reports into one agent's context.
```

### Context Type 2 — Project Brief (from P0)

```
Source: projects/{PROJECT_ID}/project-brief.md
What:   Client problem, constraints, data, budget, timeline, team
```

### Context Type 3 — Previous Phase Output (from pipeline)

```
Source: projects/{PROJECT_ID}/{previous-phase-output}.md
What:   Output from the agent(s) that ran before this one

Example for β in P3:
  • project-brief.md (P0)
  • discovery-report.md (P1 — α's output)
  • proposal.md (P2 — γ's output, contains GO verdict)
```

---

## Context Loading Matrix

The definitive table showing what each agent receives at each phase:

```
PHASE   AGENT    KNOWLEDGE BASE              PROJECT CONTEXT          PREVIOUS OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

P0      R-BA     B+I JSONs (summary only)    Client raw input         —
P0      System   All B+I JSONs (matching)    Client raw input         —

P1      α        α's reports for matched B   project-brief.md         —
P1      R-Dxx    I JSON (industry context)   project-brief.md         —

P2      γ        γ's reports for matched B   project-brief.md         discovery-report.md
P2      R-BA     —                           project-brief.md         discovery-report.md

GATE    γ        —                           —                        proposal.md (own)

P3      R-SA     β's reports for matched B   project-brief.md         discovery + proposal
P3      β        β's reports for matched B   project-brief.md         discovery + proposal
P3      R-SE     —                           project-brief.md         architecture (draft)

GATE    γ        —                           project-brief.md         architecture.md

P4a     R-BE     R-BE notes for matched B    project-brief.md         architecture.md
P4b     R-DBE    R-DBE notes (if exist)      project-brief.md         architecture.md
P4c     R-MLE    R-MLE notes for matched B   project-brief.md         architecture + discovery
P4d     R-FE     R-FE notes for matched B    project-brief.md         architecture.md
P4e     R-SA     —                           project-brief.md         ALL P4 outputs

P5      R-PM     —                           project-brief.md         ALL P3 + P4 outputs

P6      β        β's reports for matched B   project-brief.md         architecture + designs
P6      R-BE     R-BE notes for matched B    —                        api-design.md
P6      R-FE     R-FE notes for matched B    —                        ui-design.md
P6      R-MLE    R-MLE notes for matched B   —                        algorithm-spec.md

P7      R-QA     —                           project-brief.md         ALL designs + dev-guide
P7      R-SE     —                           project-brief.md         architecture + api-design

P8      R-DO     R-DO notes for matched B    project-brief.md         architecture + project-plan
P8      R-CE     —                           project-brief.md         architecture.md

P9      σ        —                           project-brief.md         ALL outputs from ALL phases
P9      R-TC     —                           project-brief.md         ALL outputs (for user docs)
```

---

## Context Loading Strategy per Agent Type

From the Hermes H2 principle: load MINIMUM context needed. Claude API has token limits — don't dump everything.

### For α (Research)

```
LOAD:  Baseline JSON (full), Industry JSON (summary only),
       Gap list (if re-research), project brief,
       gap-pre-scan.json (from P0 gap pre-scan)
SKIP:  Previous tech-report, Layer 2 notes
TOOLS: web_search (max 5 queries — L1 Shallow, L2 Adjacent, L3 Stale, L4 Mini-sprint)
       L4 requires Manager approval before executing
       See GAP-DETECTION.md §4
```

### For β (Engineering)

```
LOAD:  α output (full), Baseline JSON (techStack + pipeline sections),
       project brief (constraints section)
SKIP:  Industry JSON (α already synthesized), full research-report
TOOLS: web_search (max 3 queries — L1 Shallow, L2 Adjacent gaps only)
       No L3/L4 — tech stack staleness handled by α
       See GAP-DETECTION.md §4
```

### For γ (Evaluation)

```
LOAD:  α output (summary), β output (summary),
       Industry JSON (market section), project brief
SKIP:  Full research details (γ evaluates, not researches)
TOOLS: web_search (max 4 queries — L1 Shallow, L2 Adjacent, L3 Stale)
       Use cases: market data, competitor lookup, stale benchmarks
       See GAP-DETECTION.md §4
```

### For Layer 2 (Practical roles)

```
LOAD:  Project brief, role-specific skill card,
       Baseline JSON (section relevant to that role only)
SKIP:  Other Layer 2 outputs, Layer 1 full reports
TOOLS: varies by role (see GAP-DETECTION.md §4):
       R-Dxx              → 3 queries (L1 Shallow, L2 Adjacent)
       R-SE               → 2 queries (L3 Stale only — regulations, security updates)
       R-MLE, R-BE, R-DE  → 2 queries (L1 Shallow only)
       R-FE, R-DBE, R-DO  → 1 query  (L1 Shallow only)
       R-SA, R-PM, R-BA   → 0 (no search — use synthesis from Layer 1)
```

### For σ (Consolidation)

```
LOAD:  ALL outputs (α, β, γ, Layer 2) — full
SKIP:  Raw baseline/industry JSONs (already synthesized by others)
TOOLS: none (σ consolidates, does not research gaps)
```

> **Note:** Gap detection runs during H2 (context loading). After loading the knowledge base,
> each agent assesses coverage vs. project requirements using the L0-L4 taxonomy and consumes
> search queries within per-role limits above. Gaps must be declared in output header.
> See [GAP-DETECTION.md](GAP-DETECTION.md) for full protocol.

---

## Token Budget Guidelines

| Agent Type | Typical Context Size | Max Recommended |
|-----------|---------------------|-----------------|
| α Research | Baseline JSON + Brief | ~12K tokens input |
| β Engineering | α output + Brief + tech sections | ~10K tokens input |
| γ Evaluation | Summaries of α + β + market data | ~8K tokens input |
| Layer 2 roles | Brief + role-specific section | ~6K tokens input |
| σ Consolidation | ALL outputs (summarized where possible) | ~15K tokens input |
| R-SA Integration | ALL P4 outputs (full) | ~15K tokens input |

**Rule of thumb:** If context exceeds 15K tokens, summarize upstream outputs before passing. σ and R-SA are the only agents that may receive near-full context from multiple sources.

See [KNOWLEDGE-REUSE.md](KNOWLEDGE-REUSE.md) for rules on how agents should use the knowledge they receive.

---
*Agent Workspace v1.0*
