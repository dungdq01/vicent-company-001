# Skill Card CHANGELOG

> Per R-MAS-08 + W09 (agent onboarding) + `versioning-pinning.md`. Every skill card promote v1.0 → v1.x logged here. CTO sign mandatory. ADR cross-ref required.

**Owner**: CTO.
**Cadence**: per change.

---

## Format

```
## YYYY-MM-DD · {agent_id} · v{old} → v{new}

**Type**: prompt revision | new agent (first deploy) | tier change | sunset

**Changes**:
- bullet 1
- bullet 2

**Eval delta**: golden set mean +0.X (per R-MAS-08 ≥ +0.3 for prompt promotion)

**Regressions**: 0 (per R-MAS-08 mandatory)

**Validated across**: N projects (per R-MAS-08 ≥ 3)

**ADR**: ADR-{NNNN}

**Signed**: CTO (name) — date
```

---

## Entries

### 2026-04-27 · Initial agent roster — production sign

**Type**: bootstrap

**Roster signed at v1.0**:
- Tier 1 Research: R-Match, R-α, R-β, R-γ, R-σ, R-eval
- Tier 2 Engineering (build-time): R-MLE, R-DE, R-BE, R-FE, R-DO, R-NLP, R-AE, R-DA, R-DBE, R-DLE, R-CVE, R-FS, R-ME, R-CE, R-SE, R-QA, R-PE
- Tier 2 Engineering (ops-stream, NEW): R-LLMOps, R-SRE, R-DataOps
- Tier 3 Domain: R-D01..R-D20 via template + JSON injection (R-Dxx-template.md)
- Tier 4 Delivery: R-PM, R-SA, R-BA, R-UX, R-TC
- Tier 5 Business: R-SDR, R-AM, R-MKT, R-CONTENT, R-CS, R-FIN, R-LEG, R-HR, R-OPS, R-BIZ

**Status**: bootstrap roster. Per W09 (agent onboarding), formal probation track will apply to NEXT new agent. Existing agents grandfathered with status=development → moved to production via first real-project use + retro.

**Signed**: CTO (P1) — 2026-04-27

---

## v1.1 — 2026-05-03 — R-CoS Chief of Staff (Tier 0 concierge)

**Added**:
- `tier-0-executive/R-CoS-chief-of-staff.md` v1.0 — front-desk concierge agent

**Why**: user pain mỗi action manual 5-10 bước (mkdir + cp + edit + paste + save). R-CoS = conversational layer convert "user nói tiếng người" → chuỗi file-ops + sub-agent dispatches đúng W04 SOP.

**Boundaries enforced**:
- KHÔNG approve phase gates (R-HRN-09 + R-MAS-09)
- KHÔNG mod `_shared/`, knowledge, experience, business-strategy, studio/wisdom (R-MAS-16)
- KHÔNG bypass cost cap, sandbox, tool whitelist
- Sub-agent depth ≤ 3 (R-HRN-14)
- Profile L1, temperature 0.2

**Tools whitelist**: Read, Write, Edit (chỉ projects/{id}/ + studio/.cos/), Bash (no destructive), Grep, Glob.

**Eval golden set**: TODO — `_shared/eval/golden-sets/R-CoS.yaml` (10 sample dialogs, build sau khi probation).

**Probation**: 30-day per W09 §3 — status=development → production sau 1 project test pass + CEO sign.

**Signed**: CTO (P1) — 2026-05-03

---

## Cross-References

- Promote rule: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md) §R-MAS-08
- Quality promote gate: [`@../rules/70-quality-rules.md`](../rules/70-quality-rules.md) §R-QAL-07
- Versioning + pin: [`@../standards/versioning-pinning.md`](../standards/versioning-pinning.md)
- Agent onboarding: [`@../../experience/workspace/docs/workflows/W09-agent-onboarding.md`](../../experience/workspace/docs/workflows/W09-agent-onboarding.md)

---
*v1.0 — initialized 2026-04-27.*
