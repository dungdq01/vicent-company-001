# BD1 — Outreach

> Initial contact + exploratory call. Goal: confirm mutual interest before investing in BD2 terms negotiation.

**Owner**: R-BIZ + CEO sign on outreach message.
**Cost target**: $0.10-0.15 per candidate.

---

## Trigger

BD0 produced ≥ 1 candidate above 6.5 threshold + CEO approve outreach.

---

## Activities

| Step | Action | Owner |
|---|---|---|
| BD1.1 | Personalized outreach draft (KHÔNG generic) — cite specific evidence from BD0 scoring | R-BIZ |
| BD1.2 | Channel pick: warm intro > LinkedIn DM > email > cold call | R-BIZ |
| BD1.3 | CEO sign before send (relationship asset, brand-impacting) | CEO |
| BD1.4 | Schedule 30-min exploratory call | R-BIZ |
| BD1.5 | Conduct call: discuss potential value exchange (NOT terms yet) | CEO + R-BIZ |
| BD1.6 | Capture signal: interest level + mutual fit + next step appetite | R-BIZ |
| BD1.7 | Decision: proceed to BD2 OR park (revisit Q+1) OR drop | CEO |

---

## Outreach message template

```
Subject: {{specific_observation}} — partnership exploration

Hi {{name}},

Saw {{specific_signal — recent post / news / mutual customer mention}}. 

We're a {{1-line studio positioning}}. I noticed your {{specific_thing_they_do}} 
overlaps with our {{specific_capability}}. Specifically:
- {{evidence point 1}}
- {{evidence point 2}}

Would 30 min next week work to explore if there's a fit? Worst case: we both 
learn something. Best case: figure out a way to help mutual customers.

— {{CEO name}}
```

**Forbidden**:
- "Hope this finds you well" / generic openings
- Pitching terms in first message (premature)
- "Let's hop on a call" without specific time slot
- Mass-blast without personalization

---

## Exploratory call agenda (30 min)

```
0-5    Mutual intro + how each made it to this conversation
5-15   Each describes ICP + main challenges
15-25  Map overlap: where could we help each other's customers?
25-30  Decide: explore further (BD2) OR stay friendly (no formal partnership)
```

---

<!-- @outputs -->
## Outputs

```
business-strategy/decisions/partnership/{partner-slug}/
├── BD1-outreach-msg.md           ← message sent (CEO signed)
├── BD1-call-notes.md             ← exploratory call summary
└── BD1-decision.md               ← proceed BD2 / park / drop + reasoning
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Generic outreach** (no specific signal) → block + retry; require ≥ 2 specific evidence points
- **CEO bypass** (R-BIZ sends without CEO sign) → relationship asset risk; hard rule sign required
- **Premature terms** (talking revenue split in first call) → wait for BD2; redirect "let's first see if value exchange exists"
- **Vague next step** (call ends with "let's stay in touch") → either proceed BD2 or explicit park decision
- **No-show / ghosting** → 1 polite follow-up at T+7, then drop; KHÔNG harassment
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| Outreach approval gate (CEO sign) | R-HRN-11 — relationship asset, R-MAS-11 hard rule |
| Anti-spam outreach | KHÔNG mass-blast (R-MAS-11 + sales playbook §SDR); 1 outreach per candidate per Q |
<!-- /@harness-checkpoint -->

---

## Cross-References

- BD0 prev: [`@./BD0-IDENTIFY.md`](BD0-IDENTIFY.md)
- BD2 next: [`@./BD2-TERMS.md`](BD2-TERMS.md)
- Sales playbook outreach norms: [`@../../../../business-strategy/12-sales-playbook.md`](../../../../business-strategy/12-sales-playbook.md)

---
*v1.0 — 2026-04-27.*
