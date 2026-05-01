# Feasibility Report: Search & RAG (B12)
## By Dr. Sentinel (R-gamma) -- MAESTRO Knowledge Graph
### Date: 2026-03-31 | Assessment: CONDITIONAL GO

---

## 1. Verdict: CONDITIONAL GO

**Overall Feasibility Score: 8.0 / 10**

Search & RAG is the single most deployable AI capability in 2026. Unlike speculative AI domains, RAG solves a problem every organization already has: finding the right information and generating answers from it. The tooling is mature, the pattern is proven, and enterprise demand is undeniable. The "conditional" qualifier exists solely because Vietnamese-language embedding quality and hallucination mitigation remain open engineering problems -- not blockers, but items requiring deliberate investment.

---

## 2. Feasibility Scoring Matrix

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Technical Feasibility** | 9 / 10 | Elasticsearch, Pinecone, Qdrant, Weaviate, LangChain, LlamaIndex -- the stack is battle-tested. BM25 is decades old; dense retrieval and hybrid search are production-grade. RAG patterns (naive, corrective, agentic, GraphRAG) have well-documented architectures. R-beta's tech report confirms three clear maturity tiers with working code. |
| **Market Feasibility** | 9 / 10 | 80%+ of enterprise GenAI projects use RAG as the primary pattern. Every company with documents needs search. Vietnam market specifically: legal search (Thu Vien Phap Luat), e-commerce product discovery, enterprise knowledge bases. This is not speculative demand -- it is existing, paying demand. |
| **Data Feasibility** | 7 / 10 | Documents exist in abundance. The challenge is not data availability but data preparation: chunking strategy sensitivity (fixed vs semantic vs recursive), metadata extraction, handling Vietnamese compound words in tokenization. R-alpha's research notes the ICU tokenizer approach but acknowledges it is a workaround, not a native Vietnamese NLP solution. |
| **Risk Level** | 6 / 10 | RAG hallucination is real and well-documented. Embedding quality degrades for low-resource languages. Cost scales linearly with corpus size (embedding compute + vector storage). Relevance drift over time requires re-indexing discipline. These are manageable but non-trivial. |
| **Overall** | **8.0 / 10** | Highest-confidence baseline for practical deployment. |

---

## 3. Competitive Landscape

A minimum of 10 significant competitors, confirming market maturity (not saturation):

| Competitor | Category | Strength | Weakness |
|------------|----------|----------|----------|
| **Google Vertex AI Search** | Cloud-native | Massive scale, grounding API, multimodal | Vendor lock-in, expensive at scale |
| **Azure AI Search** | Cloud-native | Hybrid search built-in, enterprise integration | Microsoft ecosystem dependency |
| **Elastic (Elasticsearch)** | Open-source/Commercial | BM25 gold standard, ESRE for vector search, massive adoption | Vector search still maturing vs purpose-built |
| **Pinecone** | Vector DB | Purpose-built, serverless, low-latency | Expensive per-vector pricing, no lexical fallback |
| **Weaviate** | Vector DB | Hybrid search native, open-source, multi-tenant | Smaller ecosystem than Elastic |
| **Cohere** | AI-native search | Rerank API is best-in-class, multilingual embeddings | Dependency on single vendor for core capability |
| **Glean** | Enterprise search | Turnkey enterprise knowledge search | Closed, expensive, US-focused |
| **Algolia** | Product search | Sub-10ms latency, developer experience | Not designed for RAG/generative use cases |
| **Coc Coc (Vietnam)** | Local search engine | Vietnamese language native, local market understanding | Limited API/platform offering for enterprise |
| **FPT.AI Search (Vietnam)** | Local enterprise | Vietnamese NLP, local compliance, government relationships | Smaller R&D budget, less advanced retrieval models |

**Assessment:** The competitive landscape validates the market. Differentiation in Vietnam comes from: (1) Vietnamese-optimized embedding and chunking, (2) connectors to local enterprise systems (MISA, Fast, SAP Vietnam), (3) cost-effective on-premise deployment for data-sensitive sectors (banking, government).

---

## 4. Risk Register

| # | Risk | Severity | Likelihood | Mitigation |
|---|------|----------|------------|------------|
| R1 | **RAG hallucination** -- LLM generates plausible but unsupported answers from retrieved context | High | High | Implement citation enforcement, faithfulness scoring (RAGAS), self-consistency checks, Corrective RAG patterns. Never deploy without source attribution. |
| R2 | **Vietnamese embedding quality** -- BGE-M3 and multilingual-e5 perform well on English benchmarks but Vietnamese retrieval accuracy is 10-15% lower | Medium | High | Benchmark BGE-M3 vs fine-tuned Vietnamese embeddings on domain-specific test sets. Consider VNCoreNLP preprocessing before embedding. Build Vietnamese retrieval evaluation dataset. |
| R3 | **Cost scaling with corpus size** -- Embedding + vector storage + LLM inference costs grow linearly | Medium | Medium | Implement tiered architecture: BM25 for broad recall (free), dense retrieval for precision (moderate cost), LLM generation only for final answers. Cache frequent queries. |
| R4 | **Chunking strategy sensitivity** -- RAG quality is highly sensitive to how documents are split | Medium | High | This is not a "set and forget" problem. Run systematic experiments: fixed-size vs recursive vs semantic chunking. Chunk size 512-1024 tokens with 20% overlap is a reasonable starting point, but domain-specific tuning is mandatory. |
| R5 | **Relevance degradation over time** -- As corpus grows and content ages, retrieval precision drops | Medium | Medium | Implement document freshness scoring, periodic re-indexing, embedding model version management. Monitor retrieval metrics (MRR, NDCG) continuously. |
| R6 | **Vendor lock-in (vector DB)** -- Migration between vector databases is painful | Low | Medium | Abstract vector DB behind a retrieval interface. Use open formats where possible. LlamaIndex and LangChain provide abstraction layers, but test migration paths early. |

---

## 5. Market Insight

### Global Context
- RAG is the dominant GenAI deployment pattern in 2026. Gartner, Forrester, and McKinsey all identify RAG as the most adopted enterprise AI architecture.
- The search market (traditional + AI-augmented) exceeds $10B globally.
- Vector database market alone projected at $3.5B by 2028 (growing 25%+ CAGR).

### Vietnam & Southeast Asia
- **Addressable market (Vietnam):** $50-100M for enterprise search and RAG solutions, growing rapidly as Vietnamese enterprises adopt GenAI.
- **Addressable market (SEA):** $500M+ across enterprise search, e-commerce discovery, legal/compliance search.
- **Key verticals in Vietnam:**
  - Legal search: Thu Vien Phap Luat (existing demand, high willingness to pay)
  - Banking & finance: Internal document search, regulatory compliance QA
  - E-commerce: Product discovery (Shopee, Tiki, Lazada all invest heavily)
  - Government: Public service information retrieval
  - Manufacturing: Technical documentation search (Samsung Vietnam, Foxconn)

### Timing Assessment
**Perfect timing.** RAG has crossed the "trough of disillusionment" and is in the "slope of productivity." Tools are mature, patterns are documented, and enterprise buyers understand what they are purchasing. The window for building Vietnamese-optimized RAG solutions is open now -- waiting risks ceding the market to global platforms that will eventually add Vietnamese support.

---

## 6. Challenges to R-alpha and R-beta

### To Dr. Archon (R-alpha) -- Research Report
1. **Vietnamese embedding benchmarks are missing.** The research report covers BM25, dense retrieval, and hybrid search mathematically but does not provide Vietnamese-specific retrieval benchmarks. What is the actual MRR@10 for BGE-M3 on Vietnamese legal text vs English? This gap must be closed before any production recommendation.
2. **RAGAS metrics have known limitations.** The field treats RAGAS (faithfulness, answer relevancy, context precision) as a solved evaluation framework. It is not. RAGAS faithfulness scoring itself uses an LLM as judge, introducing circular dependency. What alternative evaluation strategies exist for Vietnamese RAG?
3. **GraphRAG is over-represented.** R-alpha covers GraphRAG (Microsoft) as an advanced pattern, but real-world adoption is minimal compared to naive RAG + reranking. The knowledge graph construction cost is prohibitive for most Vietnamese enterprises. Recommend de-prioritizing GraphRAG until the basic RAG stack is proven in-market.

### To Dr. Praxis (R-beta) -- Technical Report
4. **ICU tokenizer is insufficient for Vietnamese.** The tech report uses `icu_tokenizer` for Elasticsearch Vietnamese analysis. This handles Unicode but does not perform Vietnamese word segmentation (e.g., "hoc sinh" should be one token, not two). VnCoreNLP or Underthesea tokenization must be integrated as a custom Elasticsearch analyzer. This is a non-trivial engineering task.
5. **Enterprise connector gap.** The architecture tiers (simple, intermediate, advanced) are well-structured but assume document ingestion is solved. Vietnamese enterprises use MISA accounting, Fast ERP, and custom systems with no standard APIs. The connector layer is where 50% of implementation effort will go -- it deserves its own architecture section.
6. **Over-engineering warning.** Most Vietnamese companies asking for "AI search" need Elasticsearch + a basic RAG pipeline with GPT-4o, not a multi-agent agentic RAG system. The advanced tier should be explicitly labeled as "for enterprises with >1M documents and dedicated ML teams."

---

## 7. Recommendations

### Immediate Actions (0-3 months)
1. **Build a Vietnamese RAG evaluation dataset.** 500+ question-answer-context triples across legal, e-commerce, and general domains. Without this, all quality claims are anecdotal.
2. **Benchmark Vietnamese embeddings systematically.** BGE-M3 vs multilingual-e5-large vs fine-tuned PhoBERT-based embeddings on the evaluation dataset. Publish results internally.
3. **Ship a Tier 1 product first.** Elasticsearch + ICU/VnCoreNLP analyzer + basic RAG with GPT-4o. Target: legal search or internal enterprise search. Do not attempt Tier 3 (agentic RAG) before Tier 1 is revenue-generating.

### Medium-term (3-6 months)
4. **Develop Vietnamese enterprise connectors.** MISA, Fast, SAP Vietnam, Google Workspace (Vietnamese orgs), Zalo internal. This is the moat, not the model.
5. **Implement hybrid search (BM25 + dense).** R-alpha's research confirms hybrid outperforms either alone. Use Elasticsearch ESRE or a dedicated vector DB alongside BM25.
6. **Establish RAG monitoring.** Track retrieval precision, faithfulness scores, user satisfaction, and cost-per-query in production. Set alert thresholds.

### Long-term (6-12 months)
7. **Explore domain-specific fine-tuning.** Fine-tune embedding models on Vietnamese legal, financial, and technical corpora once sufficient data is collected.
8. **Evaluate Agentic RAG selectively.** Only for clients with complex multi-source retrieval needs and budget to support it. This is a premium offering, not the default.

### What Would Change This to FULL GO
- Vietnamese embedding MRR@10 reaches within 5% of English benchmarks on domain-specific test sets.
- A working Tier 1 product deployed to one paying customer with measured retrieval quality.
- Hallucination rate below 5% on the Vietnamese RAG evaluation dataset with citation enforcement enabled.

---

## 8. Cross-Baseline Dependencies

| Baseline | Dependency Type | Notes |
|----------|----------------|-------|
| B04 (NLP) | Critical | Vietnamese tokenization, named entity recognition for metadata extraction |
| B02 (Document Intelligence) | Critical | PDF/image parsing before documents enter the retrieval pipeline |
| B09 (Generative AI) | Critical | The "G" in RAG -- LLM generation quality directly impacts output |
| B11 (Knowledge Graph) | Optional | GraphRAG is interesting but not essential for initial deployment |
| B10 (AI Agents) | Optional | Agentic RAG is a future enhancement, not a launch requirement |
| B08 (Conversational AI) | Moderate | Conversational search interfaces increase adoption but are not core |

---

*Dr. Sentinel (R-gamma) confirms: Search & RAG (B12) is the most feasible baseline for near-term commercial deployment. The technology is mature, the market is ready, and the risks are engineering problems -- not research problems. Proceed with Tier 1 implementation immediately while addressing Vietnamese-specific gaps in parallel.*
