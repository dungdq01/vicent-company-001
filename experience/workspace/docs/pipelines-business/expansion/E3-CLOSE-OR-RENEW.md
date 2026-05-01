# E3 — Close-or-Renew

> Outcome of E2 pitch. Three decision branches: expanded SOW / renewed only / lost. Each has handoff path. **Includes cooldown rule for lost cases**.

**Owner**: R-AM + R-LEG.
**Cost target**: $0.10-0.15 (drafting + finalize).

---

## Trigger

Client decision received from E2 pitch (verbal call OR written response).

---

## Decision branches

### Branch 1 — Expanded SOW ✅

| Step | Action | Owner |
|---|---|---|
| 1 | Generate expanded SOW + DPA addendum (R-LEG) | R-LEG + R-AM |
| 2 | New project ID `P-{YYYYMM}-{NNN}-{client-slug}-expansion` | Engine |
| 3 | Bootstrap new project folder (P0 phase) | P3 |
| 4 | Notify R-CS for handoff continuity | R-AM → R-CS |
| 5 | Update business-strategy/03 KPI: expansion revenue tracking | R-FIN |

→ Handoff to **Path A P0** with new project ID.

### Branch 2 — Renewed only (no expansion) ⚙️

| Step | Action | Owner |
|---|---|---|
| 1 | Renewal SOW per existing tier (no scope change) | R-LEG |
| 2 | Continue retainer / extend support | R-CS |
| 3 | Schedule next E0 health check (T+30 or quarterly) | R-CS |

→ Continue P10 lifecycle.

### Branch 3 — Lost ❌

| Step | Action | Owner |
|---|---|---|
| 1 | Exit interview within 7 days (gentle, non-confrontational) | R-CS + P3 |
| 2 | Write `cs/exit-{date}.md` with structured retro | R-CS |
| 3 | Append to `studio/wisdom/churn-patterns.md` (anonymized pattern) | R-CS + R-σ |
| 4 | If pattern recurs ≥ 3 clients → flag for W08 framework retro | R-σ |
| 5 | **Apply re-engagement cooldown** (§below) | R-CS automated tracker |

---

## Re-engagement cooldown rule

After lost expansion:

| Scenario | Rule |
|---|---|
| **Default** | No re-pitch trong 90 ngày kể từ lost date |
| **Exception** | Client-initiated inbound (DM, intro, RFP invite) → reset cooldown immediately |
| **Re-pitch attempt 2** (if happens) | MUST be different angle (NOT retry same pitch with discount) |
| **3 lost attempts cùng 12 tháng** | Mark client "saturated" → quarterly review only, no proactive pitch |

Reasoning:
- Avoid harassment (3 unsolicited pitches in 6 months = damaged relationship)
- Avoid missing inbound signal (client may have new pain after time)
- Track ROI of re-pitch (different angle = real attempt; same angle = wishful thinking)

Track in: `projects/{id}/cs/cooldown-tracker.md`.

---

<!-- @outputs -->
## Outputs

Branch 1 (expanded):
```
projects/{NEW_id}/00-intake.md      ← seeded from E2 pitch + existing client context
SOW + DPA addendum signed
```

Branch 2 (renewed):
```
projects/{id}/cs/renewal-{YYYY-Qn}.md
```

Branch 3 (lost):
```
projects/{id}/cs/exit-{date}.md
projects/{id}/cs/cooldown-tracker.md
+ append to studio/wisdom/churn-patterns.md (anonymized)
```
<!-- /@outputs -->

---

<!-- @failure-modes -->
## Failure Modes

- **Skip exit interview** (lost case) → mandatory; CS playbook §exit
- **Pattern not promoted to studio/wisdom** → 3+ same root cause = systemic gap, must surface
- **Cooldown bypassed** ("just one more pitch") → R-CS hard enforce; alert if violated
- **Same-angle re-pitch** (lazy) → R-AM card check: must be different value prop
- **Permanent saturation** (3 lost in 12mo) → respect mark, don't override per CEO sentiment
<!-- /@failure-modes -->

---

<!-- @harness-checkpoint -->
## Harness Checkpoint (R-HRN)

| Action | Rule |
|---|---|
| New project ID isolation | R-MAS-16 — expanded SOW = new project, NEW _meta.json + harness/ folder |
| Cooldown tracker permanent record | append-only audit trail |
| Churn pattern promotion | per learning-system.md §3.2 + R-MAS-05 memory promotion |
<!-- /@harness-checkpoint -->

---

## Cross-References

- E2 prev: [`@./E2-PITCH.md`](E2-PITCH.md)
- P10 long-term continues: [`@../../pipeline/P10-LONG-TERM.md`](../../pipeline/P10-LONG-TERM.md)
- Path A P0 (if expanded): [`@../../pipeline/P0-INTAKE.md`](../../pipeline/P0-INTAKE.md)
- Churn patterns: [`@../../../../studio/wisdom/churn-patterns.md`](../../../../studio/wisdom/churn-patterns.md)
- Pricing decisions: [`@../../../../_shared/standards/pricing-decisions.md`](../../../../_shared/standards/pricing-decisions.md)

---
*v1.0 — 2026-04-27. Includes cooldown rule per boss feedback Gap 2.*
