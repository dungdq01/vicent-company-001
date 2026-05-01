# Agent Team Configuration — Studio Roster

**Version:** 1.1
**Date:** 2026-04-27
**Authority:** CTO

> Authoritative roster cho dispatcher khi select agents.
> Referenced by: `RULES-PREAMBLE.md`, `AGENT-MANUAL.md`, `experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md`, `_shared/standards/document-catalog.md`.

---

## Section I — Full Agent Catalog

### Tier 0 — Executive (3 founder hats — human-owned, NOT agents)

| Hat | Owner | Charter file | Phạm vi |
|-----|-------|--------------|---------|
| **CEO** | P1 (bạn) | `tier-0-executive/CEO-charter.md` | Vision · LLMOps moat · pricing · brand · final tech sign-off |
| **COO** | P3 | `tier-0-executive/COO-charter.md` | Delivery · client · finance ops · vendor · hiring follow-through |
| **CTO** | P1 (kiêm) hoặc P2 | `tier-0-executive/CTO-charter.md` | Tech stack · agent maturity · eval framework · security · infra cost |

→ Tier 0 không phải agent. Đây là charter để define accountability + decision rights cho 3 founders. Mọi agent escalate vào Tier 0 khi vượt quyền.

### Tier 1 — Research (6 agents)

| ID | Name | Role |
|----|------|------|
| R-Match | Knowledge Classifier | Brief → baseline/industry classification (P0.2 + Path D trigger) |
| R-α | Dr. Archon | Research & Architecture (Layer 1, Step 1) |
| R-β | Dr. Praxis | Engineering & Implementation (Layer 1, Step 2) |
| R-γ | Dr. Sentinel | Evaluation & Feasibility (Layer 1, Step 3) |
| R-σ | Ms. Scribe | Consolidation & Documentation (Layer 3) |
| R-eval | Eval Judge | LLM-as-judge for Layer 2 content eval (every dispatch) |

### Tier 2 — Engineering (20 roles)

**Build-time agents** (P0–P9):

| ID | Role | Core Expertise |
|----|------|----------------|
| R-DE | Data Engineer | Data pipelines, ETL/ELT, streaming, Spark, Kafka |
| R-DA | Data Analyst | EDA, statistics, dashboards, business insights |
| R-DBE | Database Engineer | SQL/NoSQL design, indexing, query optimization |
| R-MLE | ML Engineer | Model training, evaluation, MLOps, serving |
| R-DLE | Deep Learning Engineer | Neural architectures, GPU training, fine-tuning |
| R-NLP | NLP Engineer | Text models, tokenization, embeddings, LLMs |
| R-CVE | Computer Vision Engineer | Image/video models, detection, segmentation |
| R-AE | Agent Engineer | Agentic AI, tool use, multi-agent orchestration |
| R-BE | Backend Engineer | APIs, microservices, auth, databases |
| R-FE | Frontend Engineer | React/Next.js, UI, visualization, UX |
| R-FS | Fullstack Engineer | End-to-end, rapid prototyping |
| R-ME | Mobile Engineer | iOS/Android, React Native, offline-first |
| R-DO | DevOps Engineer | CI/CD, containers, Kubernetes, monitoring |
| R-CE | Cloud Engineer | AWS/GCP/Azure, infrastructure, cost optimization |
| R-SE | Security Engineer | Auth, encryption, OWASP, compliance, pen-test |
| R-QA | QA Engineer | Test strategy, automation, regression, load testing |
| R-PE | Performance Engineer | Profiling, benchmarks, latency, throughput |

**Ops-stream agents** (P10 Operate, parallel to build):

| ID | Role | Core Expertise | Pairs with |
|----|------|----------------|------------|
| R-LLMOps | LLM Operations | Prompt versioning, eval regression, cache hit-rate, model upgrade, cost drift | R-MLE / R-NLP / R-AE |
| R-SRE | Site Reliability | SLO/SLI, error budget, incident command, postmortem, on-call | R-DO / R-BE |
| R-DataOps | Data Operations | PII enforcement, retention exec, lineage audit, access review, jurisdiction compliance | R-DE / R-DBE |

### Tier 3 — Domain Experts (20 roles)

| ID | Industry | Key Focus Areas |
|----|----------|-----------------|
| R-D01 | Retail & E-commerce | Demand, personalization, pricing, CX |
| R-D02 | Finance & Banking | Risk, fraud, compliance, trading |
| R-D03 | Healthcare | Clinical, diagnostics, patient data, regulations |
| R-D04 | Manufacturing | Defect detection, predictive maintenance, OEE |
| R-D05 | Agriculture & Agritech | Crop monitoring, yield forecasting, IoT |
| R-D06 | Logistics & Supply Chain | Route optimization, demand, tracking, warehousing |
| R-D07 | Energy & Utilities | Grid optimization, consumption forecasting |
| R-D08 | Construction & Real Estate | Project management, BIM, property valuation |
| R-D09 | Education & EdTech | Adaptive learning, assessment, tutoring bots |
| R-D10 | Telecom | Network optimization, churn, customer analytics |
| R-D11 | Legal | Contract analysis, compliance, case research |
| R-D12 | Media & Entertainment | Content recommendation, personalization, ad-tech |
| R-D13 | Transportation | Fleet management, traffic, autonomous vehicles |
| R-D14 | F&B & Hospitality | Menu optimization, reservations, food safety |
| R-D15 | Insurance | Underwriting, claims, fraud detection |
| R-D16 | Pharma & Life Sciences | Drug discovery, clinical trials, regulatory |
| R-D17 | Gaming | Game AI, player behavior, monetization |
| R-D18 | Marketing & AdTech | Attribution, segmentation, campaign optimization |
| R-D19 | HR & Talent | Recruiting, performance, workforce planning |
| R-D20 | Cybersecurity | Threat detection, SOC, vulnerability management |

### Tier 4 — Delivery (5 roles)

| ID | Role | Core Expertise |
|----|------|----------------|
| R-PM | Project Manager | Planning, risk, stakeholder communication |
| R-SA | Solution Architect | System design, integration, scalability patterns |
| R-BA | Business Analyst | Requirements, user stories, process mapping |
| R-UX | UX Designer | User research, wireframes, design systems |
| R-TC | Technical Writer | Documentation, API docs, user guides |

### Tier 5 — Business (10 roles — vận hành studio)

| ID | Role | Core Expertise | Owner (T0) | Operationalizes |
|----|------|----------------|------------|-----------------|
| R-SDR | Sales Dev Rep | Outbound, lead qualification (BANT) | COO | `12-sales §1-2, §8` |
| R-AM | Account Manager | Discovery → close → renewal | COO | `12-sales §3-7, 14-CS §6` |
| R-MKT | Marketing | Content calendar, SEO, channel mix | CEO | `16-brand §5-8, 05-channel` |
| R-CONTENT | Content Writer | Articles, social, newsletter, case studies | CEO | `16-brand §4` |
| R-CS | Customer Success | Onboarding, QBR, churn save | COO | `14-customer-success` |
| R-FIN | Finance Operations | Invoicing, AR/AP, P&L, runway | COO | `15-ops §2` |
| R-LEG | Legal Drafter | SOW/NDA drafts, risk flagging | COO | `15-ops §1` |
| R-HR | HR / Recruiting | JD, screening, onboarding | CEO | `15-ops §3` |
| R-OPS | Operations | Vendor mgmt, ADRs, SOPs, risk register | COO | `15-ops §4-7` |
| R-BIZ | Biz Strategy Advisor | Weekly digest, monthly review, QBR | CEO | `15-ops §9, 02-customer, 10-pricing` |

**Total: 4 (T1) + 17 (T2) + 20 (T3) + 5 (T4) + 10 (T5) = 56 agent roles**

**Phase 1 active priority** (cards built first):
- T1: 4/4 ✅ — R-α, R-β, R-γ, R-σ
- T2: 7/17 ✅ — R-MLE, R-DE, R-BE, R-FE, R-DO, R-NLP, R-AE
- T3: 1 template (covers 20 industries)
- T4: 2/5 ✅ — R-PM, R-SA
- T5: 5/10 active Phase 1 — R-SDR, R-AM, R-CONTENT, R-CS, R-FIN (others Phase 2 khi MRR > $5K)

---

## Section II — Baseline → Industry Mapping

Module ID format: `B01`–`B15` (Baseline), `I01`–`I20` (Industry)

| Baseline | ID | Primary Industries | Secondary Industries |
|----------|----|--------------------|---------------------|
| Forecasting & Time Series | B01 | I06 Logistics, I01 Retail, I07 Energy | I02 Finance, I05 Agriculture |
| Document Intelligence | B02 | I02 Finance, I11 Legal, I06 Logistics | I03 Healthcare, I16 Pharma |
| Computer Vision | B03 | I04 Manufacturing, I05 Agriculture | I13 Transport, I03 Healthcare |
| NLP | B04 | I11 Legal, I12 Media, I09 Education | I02 Finance, I03 Healthcare |
| Recommendation | B05 | I01 Retail, I12 Media, I17 Gaming | I09 Education, I18 Marketing |
| Optimization | B06 | I06 Logistics, I07 Energy, I04 Manufacturing | I08 Construction, I13 Transport |
| Anomaly Detection | B07 | I02 Finance, I04 Manufacturing, I20 Cybersecurity | I07 Energy, I10 Telecom |
| Conversational AI | B08 | I03 Healthcare, I09 Education, I01 Retail | I02 Finance, I14 F&B |
| Generative AI | B09 | I12 Media, I18 Marketing, I09 Education | I11 Legal, I16 Pharma |
| Agentic AI | B10 | I06 Logistics, I20 Cybersecurity, I02 Finance | I11 Legal, I04 Manufacturing |
| Knowledge Graph | B11 | I11 Legal, I16 Pharma, I02 Finance | I03 Healthcare, I09 Education |
| Search & RAG | B12 | I11 Legal, I09 Education, I12 Media | I02 Finance, I03 Healthcare |
| Tabular ML | B13 | I02 Finance, I15 Insurance, I01 Retail | I05 Agriculture, I16 Pharma |
| Speech & Audio | B14 | I03 Healthcare, I10 Telecom, I09 Education | I14 F&B, I13 Transport |
| Simulation & Digital Twin | B15 | I04 Manufacturing, I07 Energy, I08 Construction | I06 Logistics, I13 Transport |

---

## Section III — Tier 3 Domain → Industry Cross-Reference

Which domain expert (Tier 3) covers which industry node:

| Industry Node | Domain Expert Role |
|--------------|-------------------|
| I01 Retail | R-D01 |
| I02 Finance | R-D02 |
| I03 Healthcare | R-D03 |
| I04 Manufacturing | R-D04 |
| I05 Agriculture | R-D05 |
| I06 Logistics | R-D06 |
| I07 Energy | R-D07 |
| I08 Construction | R-D08 |
| I09 Education | R-D09 |
| I10 Telecom | R-D10 |
| I11 Legal | R-D11 |
| I12 Media | R-D12 |
| I13 Transportation | R-D13 |
| I14 F&B / Hospitality | R-D14 |
| I15 Insurance | R-D15 |
| I16 Pharma | R-D16 |
| I17 Gaming | R-D17 |
| I18 Marketing | R-D18 |
| I19 HR | R-D19 |
| I20 Cybersecurity | R-D20 |

---

## Section IV — Manager Selection Guidelines

### IV.1 Layer 2 Selection Process

When starting a new module, Manager selects Layer 2 agents by:

1. Run **7-Stage Pipeline Coverage Checklist** (Section IV.5) — mandatory first step
2. Pick roles whose SKILLS match the module's technical domain
3. Include the relevant domain expert (Tier 3) if module is industry-specific
4. Keep team to 3–8 roles for manageability (more is not better)
5. Confirm every stage has ≥1 role before dispatching

### IV.2 Baseline → Recommended Layer 2 Roles

Typical selections per baseline type. Manager may deviate based on context.

| Module Type | Core Roles (almost always) | Add if relevant |
|-------------|---------------------------|-----------------|
| **B01 Forecasting** | R-MLE, R-DE, R-DA | R-D06(Logistics), R-BE, R-DO |
| **B02 Doc Intelligence** | R-NLP, R-MLE, R-BE | R-D02(Finance), R-D11(Legal), R-SE |
| **B03 Computer Vision** | R-CVE, R-MLE, R-DLE | R-D04(Manufacturing), R-PE |
| **B04 NLP** | R-NLP, R-DLE, R-MLE | R-D11(Legal), R-D12(Media) |
| **B05 Recommendation** | R-MLE, R-DE, R-BE | R-D01(Retail), R-DA |
| **B06 Optimization** | R-MLE, R-DE, R-BE | R-D06(Logistics), R-SA |
| **B07 Anomaly Detection** | R-MLE, R-DE, R-DA | R-D02(Finance), R-SE, R-PE |
| **B08 Conversational AI** | R-NLP, R-AE, R-BE, R-FE | R-D03(Healthcare), R-UX |
| **B09 Generative AI** | R-DLE, R-NLP, R-AE | R-BE, R-SE, R-CE |
| **B10 Agentic AI** | R-AE, R-BE, R-MLE | R-SE, R-SA, R-DO |
| **B11 Knowledge Graph** | R-DBE, R-BE, R-MLE | R-D11(Legal), R-SA |
| **B12 Search & RAG** | R-NLP, R-DBE, R-BE | R-MLE, R-PE |
| **B13 Tabular ML** | R-MLE, R-DA, R-DE | R-D02(Finance), R-D15(Insurance) |
| **B14 Speech & Audio** | R-DLE, R-MLE, R-BE | R-D03(Healthcare), R-PE |
| **B15 Simulation** | R-MLE, R-BE, R-CE | R-D04(Manufacturing), R-SA |
| **Industry node** | relevant R-Dxx, R-BA, R-SA | R-PM, R-TC |
| **Matrix B×I** | roles from both B + I | R-BA (business fit) |

### IV.3 Minimum Team Size by Module Type

| Module Type | Min Roles (Layer 2) | Notes |
|-------------|---------------------|-------|
| Baseline (B) — L3 depth | 4–6 | Must cover data + ML + deploy + QA |
| Industry (I) — L2 depth | 3–4 | Domain expert + architect + analyst |
| Matrix (B×I) — L2 depth | 3–5 | Lightweight: α + γ + σ covers most |
| Matrix (B×I) — L3 depth | 5–7 | Full team like Baseline |

### IV.4 Role Conflict Rules

- R-α and R-β **cannot** be replaced by Tier 2 roles — PhDs are mandatory
- R-D0x domain expert for an industry **does not replace** R-α academic research
- R-σ is always Layer 3 — never Layer 2
- R-FE is for platform build (Workflow B), not research (Workflow A) — unless module has UI deliverables

---

## Section IV.5 — 7-Stage Pipeline Coverage Checklist

**MANDATORY before starting any module. Manager runs this check. No gaps allowed.**

```
7-STAGE PIPELINE COVERAGE CHECKLIST
====================================
For module: ____________  Date: ____________

Stage 1: Research & Academic
  Required: α, β, γ (always mandatory, non-negotiable)
  □ R-α assigned
  □ R-β assigned
  □ R-γ assigned

Stage 2: Data & Core Engineering
  Covers: Data pipelines, ML models, core algorithm implementation
  Candidates: R-DE, R-DA, R-DBE, R-MLE, R-DLE, R-NLP, R-CVE, R-AE
  □ ≥1 role assigned: ___________

Stage 3: Backend & API
  Covers: API design, service integration, data access layer
  Candidates: R-BE, R-FS
  □ ≥1 role assigned: ___________
  (Waiver allowed if module is pure research with no API output)

Stage 4: Frontend & UX
  Covers: Dashboard, visualization, user-facing components
  Candidates: R-FE, R-UX, R-FS
  □ ≥1 role assigned: ___________
  (Waiver allowed if module has no UI deliverable)

Stage 5: Deployment & Operations
  Covers: CI/CD, containerization, cloud, monitoring
  Candidates: R-DO, R-CE, R-PE
  □ ≥1 role assigned: ___________

Stage 6: Security & Quality
  Covers: Auth, encryption, test coverage, compliance
  Candidates: R-SE, R-QA
  □ ≥1 role assigned: ___________

Stage 7: Management & Delivery
  Covers: Business alignment, documentation, knowledge synthesis
  Candidates: R-PM, R-SA, R-BA, R-Dxx (domain), R-TC, R-σ
  Note: R-σ (Ms. Scribe) always covers Layer 3 consolidation
  □ ≥1 role assigned (R-σ counts): ___________

VALIDATION RESULT:
  □ All 7 stages covered → PROCEED
  □ Gap found in stage(s): ___ → RESOLVE before dispatching
```

### Minimum Compositions by Module Type

| Module Type | Typical minimum passing team |
|-------------|------------------------------|
| Baseline L3 | α, β, γ, R-MLE, R-DE, R-BE, R-DO or R-CE, R-QA, R-SA, R-σ |
| Industry L2 | α, β, γ, R-Dxx, R-BA, R-BE, R-DO, R-QA, R-σ |
| Matrix B×I L2 | α, γ, R-Dxx, R-BA, R-σ (lightweight — β optional) |

---

## Section V — Phase Assignments

### Phase 1 — Layer 2 Team Selections

**B01: Forecasting & Time Series**
- Stage 2: R-MLE, R-DE, R-DA
- Stage 3: R-BE
- Stage 4: R-FE (for chart/viz notes)
- Stage 5: R-DO
- Stage 6: R-QA
- Stage 7: R-D06 (Logistics domain), R-SA, R-σ

**B02: Document Intelligence**
- Stage 2: R-NLP, R-MLE, R-CVE
- Stage 3: R-BE
- Stage 4: R-FE
- Stage 5: R-DO
- Stage 6: R-SE, R-QA
- Stage 7: R-D02 (Finance), R-D11 (Legal), R-σ

**B08: Conversational AI & Chatbots**
- Stage 2: R-NLP, R-AE, R-DLE
- Stage 3: R-BE
- Stage 4: R-FE, R-UX
- Stage 5: R-DO
- Stage 6: R-SE, R-QA
- Stage 7: R-D03 (Healthcare), R-SA, R-σ
