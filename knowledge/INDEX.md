# Knowledge INDEX — Lite Classifier Reference

> **Purpose**: Single-page lite index for R-Match classifier. Lists all 15 baselines + 20 industries với keywords + use cases + current depth. R-Match đọc file này (not full JSONs) để classify briefs.
>
> **R-MAS-01 single source**: full content trong `knowledge/data/{baselines,industries}/*.json`. Index này = derived metadata, regenerate khi data/ changes.

**Owner**: R-σ regenerate quarterly OR on major data/ change.
**Format**: machine-friendly (R-Match parse) + human-readable.

---

## Baselines (B01-B15) — 15 AI capability foundations

| ID | Name | Keywords (match brief against) | Common use cases | Depth |
|----|------|--------------------------------|------------------|-------|
| **B01** | Forecasting & Time Series | forecast, predict, demand, sales prediction, capacity planning, time series, seasonality, ARIMA, Prophet, NBEATS | demand forecasting, capacity planning, financial projection, weather, traffic | L3 |
| **B02** | Document Intelligence | OCR, document, invoice, contract extraction, form parsing, PDF, IDP, document AI, layout | invoice processing, contract analysis, KYC, document workflow | L2 |
| **B03** | Computer Vision | image, video, detection, segmentation, recognition, defect, surveillance, OCR-image, YOLO | quality inspection, surveillance, medical imaging, retail shelf | L2 |
| **B04** | NLP & Language AI | text classification, NER, sentiment, language model (non-LLM), embeddings, similarity, text mining | sentiment analysis, support ticket routing, content moderation | L2 |
| **B05** | Recommendation Systems | recommend, personalize, suggest, ranking, collaborative filtering, content-based, ranking | product recommendation, content feed, ad targeting | L2 |
| **B06** | Optimization & OR | optimize, schedule, route, allocate, linear programming, constraint solver, route planning, bin-packing | route optimization, scheduling, resource allocation | L2 |
| **B07** | Anomaly Detection | anomaly, outlier, fraud, intrusion, drift detection, monitoring, unusual pattern | fraud detection, system monitoring, quality alerts | L2 |
| **B08** | Conversational AI | chatbot, conversational, dialogue, intent classification, slot filling, FAQ, support bot | customer support bot, voice assistant, FAQ automation | L2 |
| **B09** | Generative AI | generate, content creation, synthesis, image gen, text gen, GAN, diffusion, creative AI | content generation, design assist, copy writing, image generation | L2 |
| **B10** | Agentic AI | agent, autonomous, multi-step, tool use, LLM agent, ReAct, AutoGPT, agent framework | autonomous task agents, RPA-AI, workflow automation | L1 |
| **B11** | Knowledge Graph | graph, ontology, semantic, triplets, RDF, knowledge graph, entity linking | enterprise search, recommendation, semantic search | L2 |
| **B12** | Search & RAG | search, retrieval, RAG, vector search, embeddings, semantic search, hybrid search | enterprise QA, document search, FAQ retrieval | L2 |
| **B13** | Tabular ML | tabular, classification, regression, XGBoost, LightGBM, random forest, structured data | credit scoring, churn prediction, conversion prediction | L1 |
| **B14** | Speech & Audio | speech-to-text, text-to-speech, audio classification, voice, ASR, TTS, audio processing | call center transcription, voice bots, audio analysis | L1 |
| **B15** | Simulation & Digital Twin | simulation, digital twin, monte carlo, agent-based modeling, what-if scenarios | supply chain simulation, urban planning, factory optimization | L1 |

---

## Industries (I01-I20) — 20 verticals

| ID | Name | Keywords (match brief against) | Sub-industries / contexts | Depth |
|----|------|--------------------------------|---------------------------|-------|
| **I01** | Retail & E-commerce | retail, ecommerce, online store, omnichannel, Shopee, Lazada, Tiki, marketplace, SKU | online sellers, brick-and-mortar, omnichannel | L1 |
| **I02** | Finance & Banking | bank, fintech, payment, lending, credit, fraud, KYC, AML, NHNN, financial services | retail banking, lending, payment processing | L1 |
| **I03** | Healthcare | hospital, clinic, medical, patient, EHR, radiology, diagnosis, telemedicine, Bộ Y tế | hospital ops, telemedicine, medical imaging | L1 |
| **I04** | Manufacturing | factory, production, OEE, defect, predictive maintenance, MES, ERP-manufacturing | discrete + process manufacturing | L2 |
| **I05** | Agriculture & Agritech | farm, crop, yield, IoT-agri, livestock, irrigation, pest, planting | crop farming, livestock, vertical farming | L1 |
| **I06** | Logistics & Supply Chain | logistics, 3PL, shipping, fleet, warehouse, last-mile, COD, TMS, WMS, VNACCS | 3PL, freight, last-mile delivery | L2 |
| **I07** | Energy & Utilities | grid, power, renewable, EVN, oil, gas, energy consumption | electricity, renewables, oil & gas | L1 |
| **I08** | Construction & Real Estate | construction, BIM, real estate, property, valuation, project mgmt | building, infrastructure, property tech | L1 |
| **I09** | Education & EdTech | education, learning, tutor, course, LMS, adaptive learning, school | K-12, higher ed, corporate training | L1 |
| **I10** | Telecom | telco, mobile network, 5G, churn, network optimization, ARPU | telecom operators, ISPs | L1 |
| **I11** | Legal | legal, contract, litigation, compliance, law firm, case research | corporate legal, law firm, legaltech | L1 |
| **I12** | Media & Entertainment | media, content, streaming, news, recommendation, ad-tech, influencer | streaming, news, gaming-media | L1 |
| **I13** | Transportation | transport, traffic, fleet, autonomous vehicle, ride-share, logistics-passenger | road, rail, aviation, ride-share | L2 |
| **I14** | Food & Hospitality | restaurant, F&B, hotel, reservation, menu, food safety, hospitality | restaurants, hotels, café chains | L1 |
| **I15** | Insurance | insurance, underwriting, claims, premium, fraud-claims, actuarial | life, P&C, health insurance | L1 |
| **I16** | Pharma & Life Sciences | pharma, drug discovery, clinical trial, molecule, regulatory-pharma | drug discovery, clinical, regulatory | L1 |
| **I17** | Gaming | game, player, monetization, in-game, game AI, leaderboard, retention | mobile games, PC, console, VR | L1 |
| **I18** | Marketing & AdTech | marketing, advertising, attribution, campaign, segmentation, MarTech | brand marketing, performance, ad-tech | L1 |
| **I19** | HR & Talent | HR, recruiting, talent, performance, ATS, workforce | recruitment, performance mgmt, payroll | L1 |
| **I20** | Cybersecurity | security, threat, SOC, vulnerability, intrusion, SIEM | enterprise security, threat detection | L1 |

---

## Custom industries (added by Path D fresh research)

| ID | Name | Keywords | Status |
|----|------|----------|--------|
| **I-MMO** | Make Money Online VN (TikTok Shop, affiliate, drop-ship) | MMO, TikTok Shop, affiliate, drop-ship, side hustle, online seller VN | (created when first MMO project arrives — Path D trigger) |

> Add new I-{slug} via Path D → K-review → promote. Update this index file.

---

## Common matrix cells (B0X × I0Y) with memory files

Cells that have validated cross-context learnings (`knowledge/docs/memory/{B0X-I0Y}-learnings.md`):

| Cell | Memory file | Depth |
|------|-------------|-------|
| B01-I06 | `B01-I06-learnings.md` | L3 (sparse retail VN, Tết seasonality, multi-horizon) |

Other cells: discovered as projects emerge. Path D triggers on first project per cell.

---

## Tag vocabulary (controlled — for ADR + classifier)

Per `_shared/standards/decision-log-index.md` §3:
- Baseline tags: `B01..B15`
- Industry tags: `I01..I20`, `I-{custom}`
- Region tags: `vn, sg, th, id, ph, my, jp, kr, global`
- Decision types: `architecture, tech-stack, pricing, hiring, scope, knowledge, rule, voice`

---

## Regeneration rules

When to regenerate this INDEX.md:
- Any new B0X JSON added → add row + depth
- Any I0Y depth promotion (L1→L2→L3) → update Depth column
- New custom industry I-{slug} created via Path D → add to "Custom industries" section
- New cross-cell memory file → add to "Common matrix cells"

Cadence: quarterly (W08 framework retro) OR on-demand by R-σ.

---

## Cross-References

- Full baseline JSONs: [`@./data/baselines/`](data/baselines/)
- Full industry JSONs: [`@./data/industries/`](data/industries/)
- Memory files: [`@./docs/memory/`](docs/memory/)
- R-Match agent: [`@../_shared/.agents/tier-1-research/R-Match-classifier.md`](../_shared/.agents/tier-1-research/R-Match-classifier.md)
- ADR tag vocab: [`@../_shared/standards/decision-log-index.md`](../_shared/standards/decision-log-index.md) §3

---
*INDEX v1.0 — 2026-04-27. Lite reference for R-Match classifier. R-MAS-01: derived metadata, regenerate from data/ when sources change.*
