---
file: glossary
version: v1.0
last_updated: 2026-04-27
owner: R-σ
status: production
---

# Studio Glossary — Authoritative Terminology

> Every term used across docs MUST be defined here OR cite to a canonical doc. Drift = bug.

---

## A

**ADR** — Architecture Decision Record. Doc capturing a decision + reasoning. Per R-MAS-14. Spec: `_shared/standards/decision-log-index.md`.

**Agent** — An automated system prompt + tools running on an LLM (Claude / GPT / etc.). Each agent has a skill card in `_shared/.agents/`. Naming: `R-{ID}` (R = Role).

**Approval gate** — Mandatory human checkpoint per `harness/guardrails.yaml`. Per R-HRN-11.

---

## B

**Baseline (B0X)** — One of 12 AI capability foundations (B01 Forecasting, B02 Document Intelligence, ..., B12). In `knowledge/data/baselines/`.

**BANT+Fit** — Sales qualification (Budget / Authority / Need / Timeline + Fit). Per `business-strategy/12 §3`.

---

## C

**Charter** — Tier-0 founder accountability doc (CEO / COO / CTO). Defines decision rights. In `_shared/.agents/tier-0-executive/`.

**Compaction** — Memory subsystem operation: summarize working memory at 70% context window using different model family from generator. Per R-HRN-04 + R-QAL-13.

**Control loop** — Agent state machine — ReAct, Plan-Execute, or stateful graph. Per R-HRN-02.

---

## D

**DPA** — Data Processing Agreement. Bilateral controller/processor doc. Template: `_shared/templates/legal/DPA-template.md`.

**Dispatcher** — Single entry point for path classification. Per R-ORC-01. Currently P3 manual; R-Dispatcher agent in Phase 2+.

**Drift** — Agent state transitions outside `manifest.yaml.allowed_transitions`. Detected per R-HRN-07 (every 20 turns) + R-QAL-08 (7-day rolling).

**DoD** — Definition of Done. Binary, per deliverable. Spec: `_shared/standards/dod-per-deliverable.md` + `business-strategy/17`.

---

## E

**Engine** — Studio's orchestrator + dashboard. Runs pipeline. Code in `experience/workspace/apps/`.

**Envelope (tool envelope)** — Structured tool return: `{success, data, error, cost_usd, latency_ms}`. Per R-HRN-08.

**Eval** — Quality scoring. 3 layers: structural (deterministic), content (LLM-as-judge), harness compliance. W04 §7. Threshold per `70-quality-rules.md` §R-QAL-02.

---

## G

**Golden set** — Canonical eval cases per agent. ≥ 20 cases per R-QAL-03. In `_shared/eval/golden-sets/`.

**Guardrails** — Approval matrix + denied actions + human-in-loop triggers per project. File: `projects/{id}/harness/guardrails.yaml`. Per R-HRN-11.

---

## H

**Handoff** — Output of one agent → input of next. QA gate per R-ORC-03 — receiver MUST quote 3+ inputs verbatim.

**Harness** — System wrapping the model: control loop + tool layer + memory + guardrails + recovery + observability. NOT a skill, an operating principle. Per `_shared/rules/80-harness-rules.md`.

**Harness profile** — L0 Sandbox / L1 Standard / L2 Critical. Set at P0. Per R-HRN-01.

---

## I

**ICP** — Ideal Customer Profile. A/B/C/D/E. Per `business-strategy/02-customer-segments.md`.

**IC (Incident Commander)** — Person responsible for incident response coordination. Per W05 + R-SRE.

**Industry (I0X)** — Industry node — I01..I20 + I-MMO etc. In `knowledge/data/industries/`.

---

## K

**KV-cache** — Anthropic prompt cache. Hit rate target ≥ 70%. Per R-HRN-10. Stable prefix discipline mandatory.

**K-review** — Knowledge review gate before staging → production promotion. Per `knowledge-curation.md` §2 + W11.

---

## L

**LCY** — Lifecycle rules domain code (file 90).

**Local rules** — Per-project rules added via permanent-fix loop. Auto-loaded into RULES-PREAMBLE for that project. Per R-HRN-06.

---

## M

**MAS** — Master rules domain code (file 00).

**Manifest (harness manifest)** — `projects/{id}/harness/manifest.yaml`. Control loop + tools + memory + cost cap. Per R-HRN-05.

**MMO** — "Make Money Online" — Vietnam side-hustler / TikTok seller / affiliate marketer ICP. Not "Massively Multiplayer Online".

---

## O

**ORC** — Orchestration rules domain code (file 100).

**Observability triple** — trace + cost + latency emitted per turn. Per R-HRN-12.

---

## P

**PII** — Personally Identifiable Information. Direct + quasi + sensitive. Per `pii-redaction.md` + `compliance/vn.md`.

**Path** — Top-level orchestration route — A (customer brief), B (internal product), C (content), D (knowledge re-research), E (ops). Per `00-OPERATING-MANUAL.md`.

**Permanent-fix** — Rule appended to `harness/permanent-fixes.md` after agent failure. Per R-HRN-06.

**Phase** — Step in pipeline P0..P10. Each gated.

**Phase rewind** — Discover phase N+ that phase N output flawed, revert to N. Per R-ORC-07 + W12.

**Profile** — see Harness profile.

**Project pin** — Versioned artifact references frozen at P0. Per `versioning-pinning.md`.

---

## R

**R-{ID}** — Agent naming convention. R = Role. Examples: R-α (alpha research), R-MLE (ML engineer), R-D06 (Logistics domain expert), R-LLMOps.

**R-LCY**, **R-ORC**, **R-MAS**, etc. — Rule IDs by domain.

**RULES-PREAMBLE** — Auto-injected prefix in every agent system prompt. File: `_shared/prompts/RULES-PREAMBLE.md`. Loads 11 rules + harness/orchestration/lifecycle contracts.

---

## S

**SCR** — Scope Change Request. Template in `_shared/templates/project/`.

**Sev (0/1/2/3)** — Incident severity. Per `incident-severity.md`.

**Skill card** — Agent definition file. In `_shared/.agents/tier-{N}/`. Format frontmatter + Role + Inputs + Outputs + System Prompt + Tools + Cost Target + Eval + Failure Modes + Cross-Refs.

**SOW** — Statement of Work. Template `_shared/templates/project/02-sow.md`. Bilateral with Client.

**Sprint A/B/C/D** — Tier of project scope. A = POC ($500-1.5K), B = Architecture ($3-5K), C = Full Design ($10-15K), D = Build+Ship ($25-50K+).

**Staging** — `knowledge/staging/`. Where agent writes go BEFORE K-review approval. Per `knowledge-curation.md`.

**Studio wisdom** — `studio/wisdom/`. Internal-only knowledge separate from client-facing `knowledge/`. Per `boundaries.md` §1.

---

## T

**Tier-{N}** — Agent hierarchy. T0 charter (humans), T1 research, T2 engineering, T3 domain, T4 delivery, T5 business.

**Trace** — Per-turn observability data. Stored in `projects/{id}/harness/traces/`. Per R-HRN-02 + R-HRN-12.

---

## U

**Unlearn list** — Active forgetting list. `_shared/rules/_unlearn-list.md`. Rules previously applied found harmful — DO NOT re-apply. Per R-LCY-02.

---

## V

**Voice (A/B/C/D)** — Brand voice contract. Per `boundaries.md` §2 + `studio/wisdom/voice-registry.yaml`.

**Version pin** — see Project pin.

---

## W

**W{NN}** — Workflow doc number — W01..W12. In `experience/workspace/docs/workflows/`.

---

## Cross-References

- Master rules: [`@../rules/00-MASTER-RULES.md`](../rules/00-MASTER-RULES.md)
- Operating manual: [`@../../00-OPERATING-MANUAL.md`](../../00-OPERATING-MANUAL.md)
- Framework philosophy: [`@../../01-FRAMEWORK.md`](../../01-FRAMEWORK.md)

---
*v1.0 — Adopted 2026-04-27. Add new term via PR + R-σ sign.*
