# Memory Hygiene Rules

**Canonical source**: [`@../../business-strategy/07-agent-team-development.md`](../../business-strategy/07-agent-team-development.md) §7

**Mục đích**: rules để memory entries không bloat, không drift, không trở thành "philosophy graveyard".

---

## Quality Gate (Mandatory)

Mỗi memory entry phải pass:

- ✅ **1 sentence statement** — khẳng định cụ thể, không waffle
- ✅ **1 concrete example** — case/project/data point làm evidence
- ✅ **Source link** — link tới project retro hoặc eval result
- ✅ **Confidence level** — HIGH (≥3 cases) / MEDIUM (1-2) / LOW (anecdotal)

❌ Reject nếu:
- Vague philosophy ("be careful with X")
- Restate of common knowledge
- Anecdote without confidence flag

---

## Format Template

```markdown
## {YYYY-MM-DD} — {1-line claim}

**Confidence**: HIGH | MEDIUM | LOW
**Source**: `@projects/P-YYYYMM-NNN/09-delivery-and-retro/retro.md:line`
**Pattern observed**: {N} projects

**Detail**:
{2-3 sentence example with data}

**Implication for prompts/skill cards** (if any):
{What changes downstream}
```

---

## Promotion Path

```
Project retro insight (LOW)
    ↓ if pattern across ≥3 projects
Memory file in baseline (MEDIUM → HIGH)
    ↓ if R-eval validates ≥ 8.5 on golden set
Skill card update (v1.x → v1.x+1)
    ↓ if 30+ runs stable
Pipeline phase doc update
    ↓ if KPI gate trigger
Strategy adjustment
```

---

## File Locations

| Memory type | Path | Owner |
|---|---|---|
| Per-baseline learnings | `knowledge/docs/memory/B0X-learnings.md` | P3 (validate) + R-σ (input) |
| Per-industry learnings | `knowledge/docs/memory/I0X-learnings.md` | P3 + R-σ |
| Per-project retro | `projects/{P-ID}/09-delivery-and-retro/retro.md` | P3 + All |
| Cross-project pattern | `experience/lessons/{topic}.md` (Phase 2+) | P1 |
| LLMOps insights | `business-strategy/.claude/memory/` (file-level) | P1 (CEO) |

---

## Anti-Pattern

- ❌ Add to memory mid-project ("we just learned X") — wait for retro
- ❌ Copy retro into baseline memory wholesale — extract 1-2 high-confidence claims
- ❌ Memory file > 50 entries — split or prune
- ❌ Entry without source link — un-auditable

---

## Pruning Rule

Quarterly review:
- Entries CONFIDENCE=LOW that haven't promoted in 2 quarters → archive
- Entries contradicted by newer evidence → mark "superseded by {date}"
- Entries with broken source link → fix or remove

*Last updated: 2026-04-26*
