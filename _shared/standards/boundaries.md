---
file: boundaries
version: v1.0
last_updated: 2026-04-27
owner: CEO + CTO
status: production
---

# Boundaries — Studio vs Client · Voice · Data

> 3 boundary lines that the framework has been treating as fuzzy. Closes lỗ hổng D14 (studio vs client knowledge), D17 (voice cross-agent), E16 (real data privacy in eval — covered also in `knowledge-curation.md`).

---

## 1. Studio Knowledge vs Client Knowledge

### Hard separation

```
knowledge/           ← CLIENT-FACING
  data/baselines/    ← used in client deliverables
  data/industries/
  docs/memory/

studio/wisdom/       ← STUDIO-INTERNAL  (NEW namespace)
  voice-of-customer.md   ← CEO observations
  icp-insights.md         ← deeper analysis than 02-customer-segments
  what-we-learned.md      ← internal retro patterns
  hot-takes.md            ← CEO opinion essays

business-strategy/    ← STRATEGIC DECISIONS (existing — operational)
  01..18 files
```

### Crossing rules

| Direction | Allowed? | Mechanism |
|---|---|---|
| `knowledge/` → client deliverable | ✅ Default | Standard P0–P9 path |
| `studio/wisdom/` → client deliverable | ❌ Default | ADR + CEO sign |
| `business-strategy/` → client deliverable | ❌ Default | Pricing/SOW yes; opinion docs no |
| Client deliverable insight → `studio/wisdom/` | ✅ With anonymization + retro signoff | Per `knowledge-curation.md` |
| Client deliverable → `knowledge/` | ✅ Standard memory promotion | Through staging gate |

**Engine enforcement**: agent context loader has whitelist per agent role:
- Client-delivery agents (R-α, R-β, R-σ in P1-P9) → can read `knowledge/`, NOT `studio/wisdom/`
- Strategic agents (R-CONTENT, R-MKT, R-SDR) → can read `studio/wisdom/` for tone calibration
- Boundary breach attempt → log + block + alert COO

---

## 2. Voice Contract

Per R-ORC-08. Operationalize:

### Voice registry

```yaml
# studio/wisdom/voice-registry.yaml
voices:
  voice_a_technical:
    description: "CEO technical, English/Vietnamese bilingual"
    audience: ["dev", "CTO buyer", "ICP-E"]
    tone: ["concise", "evidence-led", "direct"]
    style_guide: "business-strategy/16-brand-content-kit.md §Voice A"
    avoid: ["jargon without definition", "buzzwords"]
    
  voice_b_business:
    description: "P3 formal business Vietnamese"
    audience: ["client COO", "ICP-A/B/C"]
    tone: ["professional", "warm", "specific"]
    style_guide: "business-strategy/16-brand-content-kit.md §Voice B"
    avoid: ["over-formal", "passive"]
    
  voice_c_energetic:
    description: "Freelance MMO TikTok"
    audience: ["MMO seller", "TikTok creator"]
    tone: ["energetic", "VN slang OK", "FOMO-aware"]
    style_guide: "business-strategy/16-brand-content-kit.md §Voice C"
    avoid: ["fake hype", "broken promises"]
    
  voice_d_bot_friendly:
    description: "Bot reply in client product (per project)"
    audience: ["end user of client product"]
    tone: per project — set at P3, recorded in `harness/manifest.yaml.voice`
```

### Per-deliverable pin

Every deliverable type pinned to ONE voice in pipeline doc:
- Discovery report → voice_b_business
- Architecture doc → voice_a_technical
- Bot reply → voice_d (per-project)
- Substack issue → voice_a or voice_b per topic
- TikTok caption → voice_c

Engine inject voice descriptor into agent system prompt automatically (extension to RULES-PREAMBLE — tier-specific).

### Cross-agent consistency

When 2+ agents contribute to same deliverable (parallel dispatch):
- ALL agents same voice (R-σ enforces in consolidation)
- Voice mismatch = R-σ rewrite section, log to `permanent-fixes.md` if pattern recurs

---

## 3. Real Data in Eval (cross-ref)

Full spec: [`@./knowledge-curation.md`](knowledge-curation.md) §4.

Summary:
- Synthetic generated → ✅ default
- Public domain → ✅ with cite
- Client real (de-identified + DPA) → ⚠️ with PII redacted
- Client real (raw with PII) → ❌ never
- Cross-project mixing → ❌ never

DPA append to SOW template `02-sow.md`: explicit "client real data MAY be used in studio's eval golden set after de-identification".

---

## 4. Inter-Project Data Boundary

Per project `harness/memory/` is sandboxed. KHÔNG cross-project access:
- Project A's `frequent_questions.md` invisible to Project B's agents
- Memory promotion to `knowledge/` is the ONLY cross-project path (and goes through K-review)
- Eval golden sets per-project unless explicit promotion

**Engine enforcement**: file system permission OR namespace check in context loader.

---

## 5. Anti-Patterns

- ❌ "Just put it in `knowledge/` for now" — staging exists for that reason
- ❌ Voice mixing in same deliverable (research report 80% voice_b + 20% voice_a — schizophrenic)
- ❌ Reusing client A's golden set examples for client B without explicit ADR
- ❌ Studio CEO opinion injected as "industry fact" in client baseline
- ❌ ICP profile from `02-customer-segments.md` cited as evidence in client deliverable

---

## 6. Cross-References

- Knowledge curation (K-review, data privacy): [`@./knowledge-curation.md`](knowledge-curation.md)
- Voice contract rule: [`@../rules/100-orchestration-rules.md`](../rules/100-orchestration-rules.md) §R-ORC-08
- Brand kit: [`@../../business-strategy/16-brand-content-kit.md`](../../business-strategy/16-brand-content-kit.md)
- Memory promotion path: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-05
- Master single source rule: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-01

---
*v1.0 — Adopted 2026-04-27. Studio + client + voice + data — boundary lines.*
