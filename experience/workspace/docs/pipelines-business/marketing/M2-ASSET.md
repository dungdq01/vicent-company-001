# M2 — Asset

> Channel mix decided → brief assets per channel + topic. R-MKT briefs, R-CONTENT executes via Path C C0-C4.

**Owner**: R-MKT (brief) → R-CONTENT (execute via Path C).
**Cadence**: weekly per channel.
**Cost target**: $0.05-0.10 per brief.

---

## Trigger

After M1 channel mix decided. Then weekly per active channel.

---

## Activities

| Step | Action | Owner |
|---|---|---|
| M2.1 | Pull M0 positioning + M1 channel mix + content calendar | R-MKT |
| M2.2 | Pick topic per channel per cadence (calendar-driven OR opportunistic trending) | R-MKT |
| M2.3 | Write brief: angle + audience + call to action + length + voice + format | R-MKT |
| M2.4 | Anti-banned-words check (per `40-docs-rules` §07) | R-MKT |
| M2.5 | Hand off to Path C C0 (Ideate → Draft → Review → Publish → Repurpose) | R-MKT → R-CONTENT |
| M2.6 | Track in calendar: planned date, status, channel | R-MKT |

---

## Brief template

```markdown
## Brief: {{topic-slug}}

### Channel + Format
- Primary: LinkedIn long post (1800 words)
- Repurpose targets: Substack issue + 1 X thread + 3 Threads carousel

### Angle
1-line stance: "Why X matters for Y audience"
Differentiation: how this differs from competitor takes (per M0 positioning)

### Audience
ICP-{X}, role={specific role}, pain={specific pain}

### Voice
voice_b_business (per voice-registry.yaml)

### Key points (3-5)
1. ...
2. ...

### Call to action
"Comment with your experience" / "DM for more" / "Subscribe to newsletter"

### Hooks (3 options for opening)
1. Counter-intuitive observation
2. Specific number/data
3. Personal story angle

### Anti-instructions
- KHÔNG dùng banned words (40-docs §07)
- KHÔNG promise % ROI
- Cite specific source for any number
```

---

<!-- @outputs -->
## Outputs

```
studio/content/{slug}/00-brief.md      ← M2 output
                                          ↓ handoff
                                       Path C C0 (Ideate)
```

Cross-pipeline handoff: M2 → Path C C0.

R-CONTENT picks brief from queue and executes per C0-C4. M2 doesn't write content itself.
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Vague brief** (no specific angle, no hook) → reject; require angle + 3 hooks + 5 key points
- **Banned words slip through** → linter + R-σ review at C2
- **Topic dup** (M2 brief topic already in published archive) → calendar check; flag if repeat within 6 months
- **Brief without channel match** (long article briefed for TikTok) → format check
- **Velocity overrun** (M2 briefs faster than R-CONTENT can execute) → respect capacity, queue
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| Voice contract per `voice-registry.yaml` | R-ORC-08 |
| Anti-banned-words | 40-docs-rules §R-DOC-07 |
| Capacity check (R-CONTENT queue depth) | R-LCY-07 resource lock |
<!-- /@harness-checkpoint -->

---

## Cross-References

- M1 prev: [`@./M1-CHANNEL-PICK.md`](M1-CHANNEL-PICK.md)
- M3 next: [`@./M3-CAMPAIGN.md`](M3-CAMPAIGN.md)
- Path C C0 (handoff): [`@../content/C0-IDEATE.md`](../content/C0-IDEATE.md)
- Brand voice: [`@../../../../business-strategy/16-brand-content-kit.md`](../../../../business-strategy/16-brand-content-kit.md)

---
*v1.0 — 2026-04-27.*
