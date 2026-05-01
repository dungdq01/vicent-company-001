# Feasibility Report: Knowledge Graph (B11)
## By Dr. Sentinel (R-γ) — Date: 2026-03-31

---

### 1. Verdict: CONDITIONAL GO

Knowledge Graphs are technically mature and strategically valuable as a connective tissue for the MAESTRO platform (linking B04 NLP, B10 Agentic AI, B12 Search & RAG). However, the cost of KG construction and maintenance is routinely underestimated by 3-5x in the literature, and the Vietnamese-language KG ecosystem is effectively nonexistent. Proceed only with a narrow, domain-specific scope (e.g., one industry vertical) and a clear consumption use case (GraphRAG or explainable recommendations) — not as a general-purpose knowledge base.

**Conditions for GO:**
- Scope limited to 1-2 industry verticals for Phase 1 (not all 12)
- Budget explicitly includes ongoing curation (minimum 1 FTE per vertical)
- A concrete downstream consumer exists before KG construction begins
- Vietnamese NER/RE pipeline validated on real corpus before committing to full build

---

### 2. Feasibility Scoring Matrix

| Dimension | Score (1-10) | Justification |
|---|---|---|
| **Technical Feasibility** | 7 | Mature tooling (Neo4j, PyKEEN, LangChain GraphRAG). Graph databases are production-ready. However, automated KG construction from Vietnamese text remains unproven — spaCy Vietnamese models are weak, and LLM-based extraction is expensive at scale. |
| **Market Demand** | 6 | Growing interest driven by LLM+KG (GraphRAG) hype cycle. Enterprise KG adoption is real but concentrated in pharma, finance, and big tech. Vietnamese market demand is nascent — most local companies are still solving basic search and data integration problems. |
| **Data Availability** | 4 | This is the critical bottleneck. English-language KGs (Wikidata, DBpedia) are rich. Vietnamese structured knowledge sources are sparse: no Vietnamese DBpedia equivalent, limited Wikidata coverage for Vietnamese entities, government open data portals are incomplete and poorly maintained. |
| **Implementation Risk** | 5 | The "cold start" problem is severe — an empty or sparse KG delivers zero value. Ontology design requires rare domain + KG expertise. LLM-based extraction introduces non-determinism and hallucinated triples. R-β's enterprise architecture (Neo4j Causal Cluster + Kafka + Airflow) is sound but assumes a team of 4-6 engineers. |
| **ROI Clarity** | 5 | KG ROI is notoriously difficult to quantify. Benefits are indirect (better search, explainability, agent grounding). Most KG projects in industry take 12-18 months to show measurable value. Selling "knowledge infrastructure" to Vietnamese SMEs is a hard pitch. |
| **Talent Availability** | 4 | KG engineering sits at the intersection of ontology design, NLP, graph databases, and domain expertise. This combination is rare globally, rarer in Vietnam. Neo4j/Cypher skills are findable; ontology engineering skills are not. |
| **Overall Weighted** | 5.5 | Rounded to **6** with conditions. Viable if scoped tightly, risky if treated as a platform play from day one. |

---

### 3. Competitive Landscape

| Competitor | Type | Scale | Relevance to MAESTRO |
|---|---|---|---|
| **Google Knowledge Graph** | Proprietary, web-scale | 500B+ facts | Gold standard but closed. Sets user expectations impossibly high. |
| **Wikidata** | Open, community-curated | 100M+ items | Primary entity linking target. Vietnamese coverage is thin (~800K items with Vietnamese labels vs 100M+ total). |
| **Neo4j Aura** | Managed graph DB (DBaaS) | Enterprise | Direct infrastructure competitor. If MAESTRO uses Neo4j, Aura is the obvious hosting choice — not a differentiation layer. |
| **Amazon Neptune** | Managed graph DB (AWS) | Enterprise | Lock-in risk. Supports both RDF and property graph. Strong for AWS-native shops. |
| **Stardog** | Enterprise KG platform | Mid-market | Virtual graph / data fabric approach. Avoids full materialization — worth studying. |
| **Diffbot** | Automated KG from web | 10B+ entities | Closest to what R-β proposes (automated extraction). Their KG is English-centric. |
| **PoolParty** | Semantic AI platform | Enterprise | Taxonomy/ontology management. Strong in Europe, unknown in Vietnam. |
| **Microsoft GraphRAG** | Open-source LLM+KG | Research/early prod | Direct competitor to MAESTRO's GraphRAG approach. MIT-licensed, well-documented, backed by Microsoft Research. Hard to beat on resources. |
| **FPT.AI Knowledge** | Vietnamese AI platform | Local | FPT has Vietnamese NLP assets but no public KG offering. Potential partner or competitor. |
| **Coc Coc Search** | Vietnamese search engine | Local | Operates an internal KG for Vietnamese web search. Not available as a service. Proves Vietnamese KG is buildable but requires massive investment. |

**Key Takeaway:** The open-source KG tooling market is crowded and mature. MAESTRO's differentiation cannot be "we built a KG" — it must be "we built a KG for X domain in Y market that enables Z capability no one else offers."

---

### 4. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Cold start: KG is empty/sparse for months** | High | Critical | Pre-seed from Wikidata subgraphs + structured databases. Define minimum viable KG (MVK) threshold before exposing to users. |
| R2 | **KG maintenance costs exceed construction costs** | High | High | Budget 60% of KG lifecycle cost for maintenance, not construction. Automate conflict detection. Accept that some domains rot faster than others. |
| R3 | **Ontology drift / schema instability** | Medium | High | Version ontologies. Use SHACL constraints for validation. Assign ontology ownership to domain leads, not engineers. |
| R4 | **LLM extraction hallucinations poison the KG** | High | High | Mandatory confidence thresholds (>0.85) for auto-ingested triples. Human-in-the-loop for low-confidence extractions. Provenance tracking on every triple. |
| R5 | **Vietnamese NLP pipeline underperforms** | High | High | Benchmark Vietnamese NER/RE on real corpus before committing. Consider bilingual approach: extract from English sources, map entities to Vietnamese labels. |
| R6 | **Skilled KG engineers unavailable in Vietnam** | High | Medium | Train existing NLP engineers on graph modeling. Use Neo4j's relatively gentle learning curve. Outsource ontology design to consultants for Phase 1. |
| R7 | **ROI cannot be demonstrated within 12 months** | Medium | High | Attach KG to a concrete product feature (GraphRAG chat, entity-linked search) that users can experience in 3 months. Do not build KG in isolation. |
| R8 | **Microsoft GraphRAG commoditizes the approach** | Medium | Medium | Accept commoditization of the retrieval layer. Differentiate on domain-specific KG content, not the RAG mechanism. |
| R9 | **Neo4j licensing costs scale non-linearly** | Medium | Medium | Start with Community Edition. Evaluate ArangoDB (Apache 2.0) as fallback. Monitor triple count vs. license tier thresholds. |
| R10 | **Team builds KG nobody queries** | Medium | Critical | Demand-driven construction: only add entity types that a downstream consumer has requested. No speculative ontology expansion. |

---

### 5. Market Insight

**Global KG Market:**
- Estimated at $2.1B in 2025, projected $8.1B by 2030 (CAGR ~31%). Growth driven by LLM grounding, enterprise search, and regulatory compliance (financial KGs for KYC/AML).
- Major adopters: pharmaceutical (drug interaction KGs), financial services (entity resolution, fraud detection), e-commerce (product KGs), healthcare (clinical KGs).

**Vietnam-Specific Context:**
- **Government data:** Vietnam's open data portal (data.gov.vn) has ~20,000 datasets but quality is inconsistent, formats are heterogeneous (PDF-heavy), and update frequency is irregular. Not a reliable KG seed source without significant cleaning.
- **Business registry:** Vietnam's National Business Registration Portal contains structured company data — a viable seed for a business/corporate KG vertical.
- **Healthcare:** Vietnam's hospital system generates massive unstructured clinical notes in Vietnamese. A medical KG could serve drug interaction checking and clinical decision support — but regulatory barriers (data privacy, MoH approval) are steep.
- **E-commerce:** Tiki, Shopee, Lazada all operate internal product KGs. A domain-specific product ontology for Vietnamese e-commerce could have value if offered as infrastructure.
- **Timing:** The LLM+KG convergence (GraphRAG) creates a 12-18 month window where KG capability is seen as strategically important. After that, either KGs become commodity infrastructure (reducing differentiation) or the hype fades (reducing demand). Act now or don't act.

**Who Actually Needs This in Vietnam:**
1. Large enterprises with messy internal data (banks, telcos, conglomerates) — they need entity resolution and knowledge federation, not "a knowledge graph."
2. Government agencies attempting digital transformation — they need interoperability, which ontologies can provide.
3. AI companies building LLM-powered products — they need factual grounding, which KGs provide better than vector search alone.

**Who Does NOT Need This:**
- SMEs (99% of Vietnamese businesses) — they need better search, not a KG.
- Companies with clean, well-structured relational databases — a KG adds complexity without proportional value.
- Teams without dedicated data engineering capacity — a KG without maintenance is a liability.

---

### 6. Challenges to R-α & R-β

**To Dr. Archon (R-α):**

1. **KG construction cost is massively underestimated.** The research report covers embedding models, GNNs, and probabilistic KGs in mathematical depth — but the hardest problem in KG engineering is not algorithms. It is the grinding, iterative, domain-expert-dependent work of ontology design, entity normalization, and conflict resolution. This work does not scale with compute. Wikidata has 23,000+ active human editors. Google's Knowledge Graph was built by acquiring Freebase (which had thousands of contributors) and layering extraction on top. There is no shortcut.

2. **GraphRAG hype vs. reality.** Microsoft's GraphRAG paper (2024) generated enormous excitement, but production deployments reveal significant limitations: graph construction from LLMs is noisy, global search is slow and expensive, and the quality advantage over vanilla RAG is measurable but modest for most use cases. R-α's positioning of KG as essential infrastructure for B12 (Search & RAG) should be tempered with realistic benchmarks.

3. **Vietnamese KG resources are almost nonexistent.** R-α lists KG construction tools (spaCy, REBEL, DeepKE) — none of these have Vietnamese-language models that perform at production quality. Vietnamese NER is available (VnCoreNLP, PhoNER) but relation extraction in Vietnamese is an active research problem, not a solved one. The gap between English-language KG construction capability and Vietnamese-language capability is at least 3-4 years.

4. **Temporal and multimodal KG sub-fields are research-stage.** R-α correctly identifies Temporal KGs and Multimodal KGs as sub-fields, but both are firmly in academic territory. Including them in the baseline creates scope risk — they should be explicitly deferred to Phase 2+.

**To Dr. Praxis (R-β):**

5. **The enterprise architecture is aspirational for a Phase 0 team.** R-β's advanced architecture (Neo4j Causal Cluster + Kafka + Airflow + PyKEEN + LangChain + custom API) requires 4-6 experienced engineers operating continuously. If MAESTRO is in Phase 0, start with the "Simple" tier (Neo4j Community + manual curation + REST API) and prove value before investing in automation.

6. **Most Vietnamese companies do not need a custom KG — they need better search.** R-β's pipeline design assumes the existence of large document corpora that justify automated extraction. In practice, many Vietnamese organizations have small, manageable knowledge bases where a well-configured Elasticsearch instance with structured metadata would outperform a KG at 1/10th the cost and complexity.

7. **LLM-based extraction is a money pit without guardrails.** Using Claude/GPT for triple extraction (as R-β proposes in the enterprise tier) at scale means paying $0.01-0.05 per document for extraction. For a corpus of 1M documents, that is $10K-50K in LLM costs alone — recurring with each re-extraction. Add validation costs. Add correction costs. The total cost of automated KG construction often exceeds manual curation for corpora under 100K documents.

8. **No benchmarking methodology proposed.** R-β's tech report specifies tools and architectures but does not define how to measure KG quality (precision, recall, freshness), query performance (latency percentiles, throughput), or user impact (task completion rate, time-to-answer). Without metrics, the team cannot distinguish a working KG from an expensive graph database with data in it.

---

### 7. Recommendations

1. **Start with a "Knowledge Graph Lite" approach.** Use Neo4j Community Edition with manually curated triples for one domain vertical. Prove that graph-structured knowledge improves a concrete user-facing feature (search, chat, recommendations) before investing in automated construction.

2. **Pick the vertical with the best structured data.** Vietnamese business registry data (company names, ownership, industry codes) is relatively clean and structured — a corporate KG is the lowest-risk starting point. Avoid healthcare and government data in Phase 1 (regulatory complexity, data quality issues).

3. **Validate Vietnamese NER/RE before committing.** Run a formal benchmark: take 500 Vietnamese documents from the target domain, manually annotate entities and relations, and measure extraction quality with VnCoreNLP + LLM-based RE. If F1 < 0.70, the automated pipeline is not ready — fall back to semi-manual curation.

4. **Budget for maintenance from day one.** Allocate at least 1 FTE per vertical for ongoing KG curation, conflict resolution, and ontology evolution. If this budget is not available, do not start the KG project.

5. **Defer Temporal KG, Multimodal KG, and Neuro-Symbolic AI.** These are fascinating research directions but add no value in Phase 0-1. Focus on the core: entities, relations, attributes, basic reasoning.

6. **Define success metrics before writing code.** Minimum: (a) triple count and growth rate, (b) precision of auto-extracted triples (sampled), (c) query latency p50/p95, (d) downstream task improvement (e.g., RAG answer accuracy with KG vs. without).

7. **Watch Microsoft GraphRAG closely.** If Microsoft ships a production-grade, multilingual GraphRAG product, MAESTRO's KG play shifts from "build the KG infrastructure" to "build the domain-specific KG content." Prepare for both scenarios.

8. **Consider Wikidata as a bootstrap, not a foundation.** Extract the Vietnamese-relevant subset of Wikidata (~800K entities) as seed data. But do not depend on Wikidata's ontology — it is designed for general knowledge, not domain-specific applications. Build your own lightweight ontology.

---

*This report challenges the optimistic framing of both R-α and R-β. Knowledge Graphs are powerful when scoped correctly and maintained relentlessly. They are expensive failures when built speculatively. The difference is discipline, not technology.*
