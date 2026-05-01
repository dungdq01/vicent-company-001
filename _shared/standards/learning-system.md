---
file: learning-system
version: v1.0
last_updated: 2026-04-27
owner: CTO + R-σ
status: production
---

# Learning System — Continuous Framework Improvement

> **Triết lý**: Studio = learning system, không phải static framework. Knowledge / rules / skill cards / standards GROW from each project. v1.0 → v1.1 → v1.x driven by **real data**, not speculation.
>
> File này = single coherent doc cho cách framework auto-update. Tie together memory promotion (R-MAS-05) + permanent-fix loop (R-HRN-06) + K-review (knowledge-curation) + framework retro (W08) + demote/sunset (R-LCY).

---

## 1. The Loop (one diagram)

```
┌──────────────────────────────────────────────────────────────┐
│                    PROJECT N RUNS                            │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ MID-FLIGHT: gap detected                             │    │
│  │   ├─ Knowledge gap → trigger Path D fresh research   │    │
│  │   │   → K-review staging gate → promote → continue   │    │
│  │   ├─ Skill gap → escalate, write ad-hoc system       │    │
│  │   │   prompt → log to skill_card_update_queue        │    │
│  │   ├─ Tool gap → ADR for new tool → propose whitelist │    │
│  │   └─ Rule gap → permanent-fix log → local_rules      │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ P9 RETRO: Post-Project Learning Sweep (5 categories) │    │
│  │   1. Skill update candidates                         │    │
│  │   2. Memory promotion candidates                     │    │
│  │   3. Rule promotion candidates                       │    │
│  │   4. Knowledge update candidates                     │    │
│  │   5. Vendor/external dependency drift                │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│              CROSS-PROJECT PATTERN DETECTION                  │
│  - Cron quét N projects in quarter                           │
│  - Surface patterns: 3+ projects same insight                │
│  - Promote (knowledge / rule / skill card update)            │
│  - ADR mandatory                                             │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│                   FRAMEWORK v1.x EMERGES                      │
│  - Rules updated (with CHANGELOG)                            │
│  - Skill cards bumped (golden set re-eval per R-MAS-08)      │
│  - Knowledge promoted (staging → data/, K-review)            │
│  - Standards refined (versioning-pinning marks all)          │
└──────────────────────────────────────────────────────────────┘
                          ↓
        Project N+1 inherits v1.x → cheaper, smarter
                          ↓
        After 4 quarters → W08 framework retro (meta-loop)
                          ↓
        Year-on-year: split/merge knowledge, sunset rules
```

---

## 2. Mid-Flight Gap Protocol

When project running discovers gap (information, skill, tool, or rule):

| Gap type | Trigger | Action | Time | Cost |
|---|---|---|---|---|
| **Knowledge gap** (industry/baseline missing) | β agent finds context empty | Path D fresh research → K-review staging gate → promote → continue project | 30-60 min compute + 1-3 day review SLA | $0.50-1.50 |
| **Skill gap** (no skill card for needed agent) | Phase doc invokes agent that doesn't exist | Escalate to CTO; write ad-hoc system prompt; log to `_shared/.agents/skill_update_queue.md`; agent gets card after project (per W09 onboarding) | 30 min ad-hoc | — |
| **Tool gap** (need tool not in whitelist) | Manifest validation fails | ADR for tool addition; CTO sign per R-MAS-04 anti-FOMO; project may pause if tool blocking | 24-48h | — |
| **Rule gap** (situation no rule covers) | Agent uncertain how to act | Escalate to charter owner; decision logged as ADR; rule proposed for next framework retro | per situation | — |
| **Failure pattern** (eval fail, repeats) | Agent fails twice on similar task | `harness/permanent-fixes.md` entry → auto-load to `local_rules[]` for this project's run | per failure | — |

**Critical**: gap KHÔNG được silent ignore. Every gap = data point for v1.x improvement.

---

## 3. Post-Project Learning Sweep (5-checklist)

After P9 close (within 7 days), R-σ + R-PM run sweep on project artifacts:

### 3.1 Skill update candidates
Scan: prompt patterns that worked unusually well, agent failure modes that recurred.

```yaml
checklist:
  - Did any agent's output exceed eval baseline by > 1.5? Why?
    → Pattern → propose skill card v1.x update
  - Did any agent fail twice in same way?
    → Failure mode → add to `_shared/eval/failure-modes.md`
  - Did `permanent-fixes.md` log entry that's promote-candidate (3+ project pattern)?
    → Promote to `_shared/rules/` per R-QAL-06
```

Output: append to `_shared/.agents/skill_update_queue.md` + flag CTO for next quarterly review.

### 3.2 Memory promotion candidates
Scan: insights transferable across projects (per R-MAS-05).

```yaml
checklist:
  - Did project surface insight applicable to ≥1 other project, same baseline?
    → propose to `knowledge/staging/docs/memory/B0X-learnings.md`
  - Did project surface insight applicable across industry?
    → propose to `knowledge/staging/docs/memory/I0Y-learnings.md`
  - Did project surface strategic insight (pricing, ICP, positioning)?
    → propose to `studio/wisdom/what-we-learned.md` (NOT client-facing)
```

Output: K-review queue entry per item.

### 3.3 Rule promotion candidates
Scan: `harness/permanent-fixes.md` for project-only rules.

```yaml
checklist:
  - Lặp pattern across 3+ projects? → promote to _shared/rules/{NN}-XXX
  - Industry-specific (only 1 industry) but recurring? → promote to knowledge/data/industries/I0X/harness-quirks.md
  - Genuine project-only quirk? → keep local
```

Output: ADR proposal cho promote-candidates.

### 3.4 Knowledge update candidates
Scan: did β fresh research happen? Did existing data get used + found wrong?

```yaml
checklist:
  - β created new node → already in K-review queue, just verify status
  - Existing node found inaccurate → quarantine per knowledge-curation.md §5
  - Existing node found incomplete → schedule re-research (Path D)
  - New sub-node naturally formed (deep dive within industry) → propose promotion
```

Output: queue items for Path D batch.

### 3.5 Vendor/external dependency drift
Scan: did vendor change behavior, pricing, or terms during project?

```yaml
checklist:
  - Anthropic model behavior change? → R-LLMOps weekly review picks up
  - Vendor SLA breach? → external-deps log + DPA review
  - New deprecation announcement? → migration plan ADR
  - New tool / vendor used (anti-FOMO check)? → ADR + add to vendor watch list
```

Output: append to `_shared/standards/external-deps-review-{YYYY-WW}.md`.

---

## 4. Cross-Project Pattern Detection

Quarterly per W08 (framework retro):

```python
# Pseudocode
patterns = []
for category in ["failure_mode", "permanent_fix", "decision_repeat", "memory_insight"]:
    items = aggregate_across_projects(category, window="last_4_quarters")
    clusters = cluster_by_similarity(items, threshold=0.7)
    for cluster in clusters:
        if cluster.size >= 3:
            patterns.append({
                "category": category,
                "pattern": cluster.summary,
                "evidence": cluster.project_ids,
                "proposed_action": determine_action(category)
            })

surface_to_framework_retro(patterns)
```

Each pattern at workshop → discuss → ADR → action item with owner + ETA.

---

## 5. Promotion Chain Detail

### Local insight → global rule

```
Project P-N permanent-fix entry
   ├─ scope: project-only       → stays in projects/P-N/harness/permanent-fixes.md
   ├─ scope: promote-candidate  → tracked in `_shared/.agents/skill_update_queue.md`
   │   └─ Quarter end: if 3+ projects same pattern → ADR + promote
   │       ↓
   │       _shared/rules/{NN}-XXX or skill card v1.x update
   └─ scope: industry-specific → knowledge/data/industries/I0X/harness-quirks.md (after K-review)
```

### Per-project insight → cross-project memory

```
Project insight surfaced in retro
   ├─ Transferable + cross-project applicable?
   │   YES → knowledge/staging/docs/memory/B0X- or I0Y-learnings.md → K-review → promote
   │   NO  → stays in project's 99-retro.md only (audit trail)
   └─ Strategic / studio-internal?
       YES → studio/wisdom/{file}.md (CEO + COO sign)
```

### Knowledge node depth promotion

```
β fresh research (L1 skeleton)
   ├─ Used in 1 project + retro positive
   │   → R-σ proposes L1 → L2 promotion (more detail added based on real use)
   ├─ Used in 3+ projects, validated across cases
   │   → R-σ proposes L2 → L3 promotion (matches B01 quality bar)
   └─ Validated quarterly per K-review monthly hygiene
```

---

## 6. Demote / Sunset (R-LCY chain)

Promotion is half. Demotion completes the loop.

| Trigger | Action |
|---|---|
| Rule wrong in 2+ projects | R-LCY-01 demote → `_shared/rules/_archive/` |
| Rule actively harmful | R-LCY-02 unlearn → `_shared/rules/_unlearn-list.md` (auto-injected as "DO NOT APPLY") |
| Skill card prompt regression vs baseline | R-MAS-08 reverse — rollback CHANGELOG |
| Knowledge node citation broken / outdated | R-LCY-04 → quarantine → fix or archive |
| Knowledge node phình > 200 entries | R-LCY-04 split |
| 2 baselines overlap > 40% | R-LCY-04 merge with namespace redirect |
| Industry < 5 entries after 12 months | R-LCY-03 archive |

Quarterly W08 retro audit drives sunset cadence.

---

## 7. Learning Velocity KPI

**Leading indicator** framework đang học (vs static):

```yaml
quarterly_metrics:
  promotions_to_data_layer: int       # K-review approved count
  rule_updates: int                    # rules added / archived / unlearned
  skill_card_updates: int              # CHANGELOG entries
  knowledge_depth_increases: int       # L1→L2 + L2→L3 promotions
  failure_modes_documented: int        # new entries in failure-modes.md
  permanent_fixes_promoted: int        # local → global rules
  
target_phase_1: 5+ promotions/quarter (early — projects rare, learning slow)
target_phase_2: 15+ promotions/quarter
target_phase_3: 30+ promotions/quarter

# Tracked in business-strategy/03-goals-and-roadmap.md as KPI
```

If quarterly velocity < target for 2 quarters → flag at W08 framework retro: framework không học = bottleneck somewhere.

---

## 8. Owner Map

| Layer | Promote owner | Demote owner | Cadence |
|---|---|---|---|
| `_shared/rules/` | CTO sign + ADR | CTO + R-LCY-08 quarterly | Quarterly |
| `_shared/.agents/` skill cards | CTO + CHANGELOG | CTO + W09 sunset | Per change |
| `_shared/standards/` | CEO + CTO | per quarterly retro | Quarterly |
| `knowledge/data/baselines/` | CEO sign K-review | R-σ + CEO quarantine | Bi-annually |
| `knowledge/data/industries/` | R-σ + CEO sign | R-σ quarantine | Quarterly |
| `knowledge/docs/memory/` | R-σ daily triage + CEO weekly | R-σ + R-QAL-10 hygiene | Weekly |
| `studio/wisdom/` | CEO + COO | CEO | Ad-hoc |
| `_shared/decisions/` ADRs | Author + Authority sign | (never delete; mark superseded) | Per change |

---

## 9. Anti-Patterns

- ❌ "Just promote insight to rule because feels right" — needs 3+ project evidence
- ❌ "Skip K-review because deadline" — pollutes shared knowledge permanently
- ❌ Demote without ADR — audit trail vỡ
- ❌ Promote without re-eval golden sets — regressions undetected
- ❌ Cross-project data leakage in golden sets — privacy violation
- ❌ "Quick fix in production" without permanent-fix log entry — failure repeats
- ❌ Framework retro skipped — learning loop not closed
- ❌ Velocity hits target via shallow fluff entries — promote-volume gaming

---

## 10. Implementation Notes

### Phase 1 (M1-M3, current)
- Manual checklist execution
- Bash scripts (when ready) automate aggregation
- CEO + R-σ run weekly K-review + monthly hygiene + quarterly retro
- Velocity will be low (1-2 projects/quarter), that's OK

### Phase 2 (M4-M6)
- Cron scheduled jobs (build-adr-index, citation-verify, pii-scan)
- R-LLMOps weekly cron live (vendor watch + cost drift)
- Velocity target 15+ promotions/quarter

### Phase 3 (M6+)
- Engine code automates large portion
- R-σ supervises, doesn't execute manually
- Velocity 30+/quarter
- Yearly knowledge structural refactor (R-LCY-04)

---

## 11. Cross-References

- Master rules: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-05, §R-MAS-08
- Quality rules: [`@../rules/70-quality-rules.md`](../rules/70-quality-rules.md) §R-QAL-06, §R-QAL-07, §R-QAL-10, §R-QAL-12
- Harness rules: [`@../rules/80-harness-rules.md`](../rules/80-harness-rules.md) §R-HRN-06
- Lifecycle rules: [`@../rules/90-lifecycle-rules.md`](../rules/90-lifecycle-rules.md) §R-LCY-01..08
- Knowledge curation: [`@./knowledge-curation.md`](knowledge-curation.md)
- Versioning + project pin: [`@./versioning-pinning.md`](versioning-pinning.md)
- Framework retro workflow: [`@../../experience/workspace/docs/workflows/W08-framework-retro.md`](../../experience/workspace/docs/workflows/W08-framework-retro.md)
- K-review workflow: [`@../../experience/workspace/docs/workflows/W11-knowledge-review.md`](../../experience/workspace/docs/workflows/W11-knowledge-review.md)
- Path D pipeline: [`@../../experience/workspace/docs/pipeline/PATH-D-RESEARCH.md`](../../experience/workspace/docs/pipeline/PATH-D-RESEARCH.md)
- Strategic KPI: [`@../../business-strategy/03-goals-and-roadmap.md`](../../business-strategy/03-goals-and-roadmap.md)

---
*v1.0 — Adopted 2026-04-27. Closes "framework học từ data thực" loop end-to-end.*
