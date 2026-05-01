# W03 — New Project Walkthrough — INDEX/MAP

> **Bản đồ xuyên suốt** lead → cash → retro. Cross-pipeline navigation map.
> File này = **navigation only** (timeline + links + handoffs). Content lives in canonical modular docs (P0-P10 + S0-S5 + M0-M5 + ...).
> Per R-MAS-01 single source of truth — KHÔNG duplicate content here.

**Khi nào đọc**: có lead/idea/brief mới và muốn nắm flow toàn bộ.
**Người đọc**: human (newcomer onboard) + agent (cross-phase awareness).
**Time**: 5 phút đọc map → click vào step cụ thể khi đến phase đó.

---

## 1. Timeline + canonical doc per step

### Stage A — SALES (Day 0–12)

| Day | Phase | Owner | Canonical doc |
|---|---|---|---|
| 0 | S0 Prospect | R-SDR / P3 | [`S0-PROSPECT.md`](../pipelines-business/sales/S0-PROSPECT.md) |
| 1 | S1 Qualify (BANT+Fit) | R-SDR / P3 | [`S1-QUALIFY.md`](../pipelines-business/sales/S1-QUALIFY.md) |
| 3 | S2 Discovery call | R-AM / P3 | [`S2-DISCOVERY.md`](../pipelines-business/sales/S2-DISCOVERY.md) |
| 5 | **P0 Intake** (engine starts) | R-Match → R-BA | [`P0-INTAKE.md`](../pipeline/P0-INTAKE.md) |
| 6-8 | P1 Discovery | R-α/β/γ/D{Y}/σ | [`P1-DISCOVERY.md`](../pipeline/P1-DISCOVERY.md) |
| 9-10 | S3 Proposal + P2 Proposal | R-AM + R-σ | [`S3-PROPOSAL.md`](../pipelines-business/sales/S3-PROPOSAL.md) + [`P2-PROPOSAL.md`](../pipeline/P2-PROPOSAL.md) |
| 11-12 | S4 Close + F0 Invoice 50% | R-AM + R-LEG + R-FIN | [`S4-CLOSE.md`](../pipelines-business/sales/S4-CLOSE.md) + [`F0-INVOICE.md`](../pipelines-business/finance/F0-INVOICE.md) |

**🚪 GATE G1** (Day 12) — SOW signed + 50% deposit. Block phase B nếu chưa pass.

### Stage B — DESIGN (Day 13–22) — Sprint B+ only

| Day | Phase | Owner | Canonical doc |
|---|---|---|---|
| 13-15 | P3 Architecture (fill harness manifest) | R-AE + R-SA | [`P3-ARCHITECTURE.md`](../pipeline/P3-ARCHITECTURE.md) |
| 15-20 | P4 Design parallel (a/b/c/d/e) | R-BE + R-DBE + R-MLE + R-FE + R-SA | [`P4-DESIGN.md`](../pipeline/P4-DESIGN.md) |
| 21-22 | P5 Planning (lock guardrails) | R-PM + R-DO + COO sign | [`P5-PLANNING.md`](../pipeline/P5-PLANNING.md) |

### Stage C — BUILD (Day 23–42) — Sprint C+

| Day | Phase | Owner | Canonical doc |
|---|---|---|---|
| 23-35 | P6 Dev guides + build (envelope, cache, sandbox, traces) | R-AE + R-BE + R-FE + CEO/P2 code | [`P6-DEV-GUIDES.md`](../pipeline/P6-DEV-GUIDES.md) |
| 36-42 | P7 QA (Layer 1+2+3 eval, harness compliance) | R-QA + R-eval | [`P7-QA.md`](../pipeline/P7-QA.md) |

### Stage D — SHIP (Day 43–55) — Sprint D

| Day | Phase | Owner | Canonical doc |
|---|---|---|---|
| 43-48 | P8 Deploy (sandbox, trace sink, approval webhook) | R-DO + R-SE + R-SRE | [`P8-DEPLOYMENT.md`](../pipeline/P8-DEPLOYMENT.md) |
| 49-52 | P9 Delivery + Retro (Harness Health) | R-PM + R-σ + R-CS handoff | [`P9-DELIVERY.md`](../pipeline/P9-DELIVERY.md) |

**🚪 GATE G2** (Day 52) — Client acceptance signed.

| Day | Phase | Owner | Canonical doc |
|---|---|---|---|
| 53 | F0 Final invoice 50% balance | R-FIN | [`F0-INVOICE.md`](../pipelines-business/finance/F0-INVOICE.md) |
| 55 | S5 Handoff → CS0 Onboard | R-AM → R-CS | [`S5-HANDOFF.md`](../pipelines-business/sales/S5-HANDOFF.md) + [`CS0-ONBOARD.md`](../pipelines-business/customer-success/CS0-ONBOARD.md) |

### Stage E — POST-DELIVERY (Day 55+)

| Day | Phase | Owner | Canonical doc |
|---|---|---|---|
| 60 | CS0 → CS1 ongoing delivery support | R-CS | [`CS1-DELIVER.md`](../pipelines-business/customer-success/CS1-DELIVER.md) |
| 60 | **E0 Health check** (Day-60 NPS) | R-CS | [`E0-HEALTH-CHECK.md`](../pipelines-business/expansion/E0-HEALTH-CHECK.md) |
| 70 | CS2 QBR (retainer only) | R-CS | [`CS2-QBR.md`](../pipelines-business/customer-success/CS2-QBR.md) |
| 90 | **🚪 GATE G3** — branch decision | R-CS + R-AM | — |

**🚪 GATE G3** (Day 90) — branch:
- 🟢 Healthy + signal → **E0-E3 expansion offensive** ([`expansion/`](../pipelines-business/expansion/))
- 🔴 Churn risk → **CS3 defensive** ([`CS3-RENEW-OR-CHURN.md`](../pipelines-business/customer-success/CS3-RENEW-OR-CHURN.md))
- ⚙️ Steady → renewal only via [`P10-LONG-TERM.md`](../pipeline/P10-LONG-TERM.md)

| Day | Phase | Branch | Canonical doc |
|---|---|---|---|
| 90+ | P10 Long-term lifecycle | all | [`P10-LONG-TERM.md`](../pipeline/P10-LONG-TERM.md) |
| 90-180 | E2-E3 Expansion pitch + close | offensive | [`expansion/`](../pipelines-business/expansion/) |
| 90-180 | CS3 Save / Churn doc | defensive | [`CS3-RENEW-OR-CHURN.md`](../pipelines-business/customer-success/CS3-RENEW-OR-CHURN.md) |
| Annual | P10.4 Renewal | all retainer | [`P10-LONG-TERM.md`](../pipeline/P10-LONG-TERM.md) §P10.4 |

---

## 2. Cross-pipeline handoff diagram

```
                         (M4 measure → S0 prospect — MQL feed)
                                          │
M0 ─ M1 ─ M2 ─ M3 ─ M4 ─ M5  (MARKETING — continuous funnel)
       │ M2 brief                   │
       ▼                            │
C0 ─ C1 ─ C2 ─ C3 ─ C4   (CONTENT — fed by M2 + P9 retro)
                                    │
                                    ▼
S0 ─ S1 ─ S2 ─ S3 ─ S4 ─ S5  (SALES)
                            │ S5 close → P0
                            ▼
P0 ─ P1 ─ P2 ─G1─ P3 ─ P4 ─ P5 ─ P6 ─ P7 ─ P8 ─ P9 (ENGINE)
                                                  │ P9 → CS0
                                                  ▼
                                  CS0 ─ CS1 ─ CS2 ─ CS3 (CUSTOMER SUCCESS)
                                                  ↑│
                                                  ││ Day 90 G3 branch
                                                  ││
                                  E0 ─ E1 ─ E2 ─ E3 (EXPANSION offensive if 🟢)
                                                  │
                                                  ▼
                                       (E3 expanded → P0 new project ID)

BD0 ─ BD1 ─ BD2 ─ BD3 ─ BD4  (PARTNERSHIP — referral feeds S0, co-sell)
                  │ BD3 → M3 co-branded campaigns
                  
F0 ─ F1 ─ F2  (FINANCE — per-project + monthly cycle)
H0 ─ H1 ─ H2 ─ H3  (HIRING — on-demand)
```

**Key handoffs**:
- `M2 → C0`: marketing brief → content ideate
- `M4 → S0`: MQL pipeline feed
- `S5 → P0`: deal becomes project
- `P9 → CS0`: delivery handoff to onboarding
- `P9 → C2`: project retro → case study draft
- `CS3 ↔ E0`: sister flows (defensive 🔴 vs offensive 🟢)
- `E3 expanded → P0`: new project ID
- `BD3 → S0 / M3`: partnership feeds sales + marketing
- `Quarterly: M5 + E3 + BD4 + project retros → W08 framework retro` consume

---

## 3. Gates summary

| Gate | Day | Owner | Block what |
|---|---|---|---|
| **G1** | 12 | All 3 founders | SOW signed + 50% deposit. Block P3 entry. |
| **G2** | 52 | CEO + Client | Client acceptance signed. Block final invoice. |
| **G3** | 90 | COO + R-CS + R-AM | Long-term branch decision (expand / renew / churn). Block P10 path. |

Plus per-phase Harness Checkpoints (G0 micro-gates) — see each P{N} doc §Harness Checkpoint.

---

## 4. Routing decision tree — "đến Day X, đọc file nào"

```
Anh đang ở Day ?
   │
   ├─ Day 0-12 (sales motion)?
   │    → Open S0-S5 + P0-P2 + F0
   │    → If question về scope tier → 10-pricing-sheet
   │
   ├─ Day 13-22 (architecture/design)?
   │    → Open P3-P5 + harness/manifest fill
   │    → If question về anti-FOMO stack → 10-stack-rules
   │
   ├─ Day 23-55 (build/ship)?
   │    → Open P6-P9 + 80-harness-rules
   │    → If question về eval gate → 70-quality-rules + R-eval card
   │
   ├─ Day 55-90 (post-delivery)?
   │    → Open CS0-CS2 + P10
   │    → If question về expansion → E0-E3
   │
   ├─ Day 90+ (long-term)?
   │    → Open P10 + 14-customer-success
   │    → If 🟢 signal → E0-E3
   │    → If 🔴 risk → CS3
   │    → If churn → studio/wisdom/churn-patterns + W08 retro queue
   │
   └─ Quarterly?
        → W08 framework retro
        → Consume: M5 + E3 + BD4 + permanent-fixes
        → Output: framework v1.x update via ADR
```

---

## 5. Sprint tier × stages

| Sprint | Stages active | Days | Phase docs invoked |
|---|---|---|---|
| **A** ($500-1.5K POC) | A only | 0-12 | S0-S5 + P0-P2 + F0 + (P9 quick wrap) |
| **B** ($3-5K + arch) | A + B | 0-22 | + P3 + P5 (P4 light) |
| **C** ($10-15K full design) | A + B + C | 0-42 | + P4 full + P6 + P7 |
| **D** ($25-50K+ build & ship) | A + B + C + D | 0-55 | full P0-P9 |

All tiers continue Stage E (post-delivery) per CS playbook.

---

## 6. Per-phase compliance gates (cross-pipeline)

Every phase has these enforce regardless of pipeline:

| Compliance | Rule | Where enforced |
|---|---|---|
| Single source of truth | R-MAS-01 | Each modular doc canonical |
| Harness profile (L0/L1/L2) | R-HRN-01 | P0 sets, P3-P9 honors |
| Tool whitelist + envelope | R-HRN-03 + R-HRN-08 | Each dispatch via W04 |
| 4-tier cache discipline | R-HRN-10 | W04 §2.5 + manifest |
| Output validation pre-eval | output-validation.md | Every dispatch L0+L1+L2+L3 |
| Input sanitization | input-sanitization.md | P0.1 only (1 gate) |
| Framework read-only | R-MAS-16 | Every write attempt |
| Permanent-fix loop | R-HRN-06 | Every failure trigger |
| Cross-tier handoff QA | R-ORC-03 | Every agent-to-agent transition |

→ KHÔNG duplicate detail here — see canonical rule files.

---

## 7. When to use this file

- Onboarding day 1: scan timeline §1 + handoff diagram §2 (5 min)
- Có 1 lead mới: jump to §1 Stage A links
- Mid-engagement Day X: routing tree §4 → click canonical doc
- Quarterly retro: §6 compliance gate review

→ **Đây là MAP, KHÔNG phải tutorial**. Tutorial = canonical modular docs.

---

## 8. What this file is NOT

- ❌ Tutorial / how-to (use canonical phase docs)
- ❌ Full content per phase (use P{N}-*.md)
- ❌ Agent dispatch detail (use W04)
- ❌ Eval rubric (use 70-quality-rules + R-eval card)
- ❌ Pricing detail (use 10-pricing-sheet)

✅ ONLY: timeline + cross-pipeline handoff + gates + routing.

---

## 9. Cross-References

- Pipeline canonical: [`@../pipeline/`](../pipeline/) (P0-P10 + Path B/C/D)
- Business pipelines: [`@../pipelines-business/`](../pipelines-business/) (sales, marketing, content, CS, expansion, partnership, hiring, finance)
- Pricing decisions: [`@../../../../_shared/standards/pricing-decisions.md`](../../../../_shared/standards/pricing-decisions.md)
- Document catalog (everything studio ships): [`@../../../../_shared/standards/document-catalog.md`](../../../../_shared/standards/document-catalog.md)
- W04 dispatch (per-agent invoke): [`./W04-agent-dispatch-runbook.md`](W04-agent-dispatch-runbook.md)
- W08 framework retro (consume this map's outputs quarterly): [`./W08-framework-retro.md`](W08-framework-retro.md)
- Operating manual (5 paths context): [`@../../../../00-OPERATING-MANUAL.md`](../../../../00-OPERATING-MANUAL.md)

---

*W03 v2.0 — refactored 2026-04-28 from monolithic 565-line content → thin INDEX/MAP per R-MAS-01 SSOT. Previous v1.x content was duplicate of modular phase docs — content lives in canonical files now.*
