# QA Engineer Notes: Search & RAG (B12)

## 1. Relevance Testing with Golden Query Sets

The foundation of search quality assurance is a curated set of queries with known-good results.

### Building a Golden Query Set
- **Size**: Minimum 100 queries, ideally 300-500 for production systems
- **Coverage**: Include navigational, informational, and edge case queries
- **Labels**: Each query annotated with relevant document IDs and relevance grades (0-3 scale)
- **Vietnamese queries**: At least 30% of golden set must be Vietnamese language queries
- **Maintenance**: Review and update quarterly as corpus evolves

### Relevance Grading Scale
- **3 (Perfect)**: Directly answers the query with complete information
- **2 (Good)**: Relevant and useful, partially answers the query
- **1 (Fair)**: Tangentially related, provides some context
- **0 (Irrelevant)**: Not related to the query at all

### Automated Relevance Testing
- Run golden query set against search API nightly
- Compute MRR, NDCG@10, Recall@10 automatically
- Alert if any metric drops >5% from baseline
- Store historical metrics for trend analysis

## 2. RAG Answer Quality Evaluation

RAG answers require multi-dimensional evaluation beyond traditional search metrics.

### Evaluation Dimensions
- **Faithfulness**: Answer contains only claims supported by retrieved context
- **Completeness**: Answer addresses all aspects of the query
- **Relevance**: Answer directly addresses what was asked
- **Fluency**: Answer is grammatically correct and well-structured
- **Citation accuracy**: Cited sources actually support the claims made

### Automated Evaluation
- **RAGAS framework**: Automated scoring for faithfulness, relevance, context precision
- **DeepEval**: Additional metrics including hallucination score and toxicity
- **LLM-as-judge**: Use GPT-4/Claude to score answer quality (correlates well with human judgment)
- **Run weekly**: Evaluate 100+ RAG queries automatically; track trends

### Human Evaluation
- Monthly human evaluation of 50 randomly sampled RAG responses
- Use 3 evaluators per response for inter-annotator agreement
- Focus on faithfulness and factual correctness — hardest for automated tools

## 3. Regression Testing for Index and Model Changes

Any change to the search stack can silently degrade quality.

### What Triggers Regression Testing
- Index rebuild or schema change
- Embedding model update or fine-tuning
- Chunking strategy change
- Reranker model update
- LLM model change for RAG generation
- New document source added to corpus

### Regression Test Process
1. Run full golden query set against staging environment
2. Compare all metrics to production baseline
3. Flag any query where rank changes by >3 positions
4. Manual review flagged queries before deployment
5. Automated gate: block deployment if NDCG drops >3%

## 4. Performance Testing

### Latency Testing
- **Search endpoint**: Target P95 <500ms, P99 <1s
- **RAG endpoint**: Target P95 <3s (first token <500ms with streaming)
- **Autocomplete**: Target P95 <100ms
- **Test under load**: Latency at 10, 50, 100, 500 concurrent users

### Throughput Testing
- **Search QPS**: Measure maximum queries per second before degradation
- **RAG QPS**: Measure with realistic LLM latency (typically bottleneck)
- **Indexing throughput**: Documents per minute during bulk ingestion
- **Tools**: k6, Locust, or Apache JMeter for load testing

### Stress Testing
- Ramp up to 10x expected peak traffic
- Identify breaking points: which component fails first
- Test recovery: does the system self-heal after overload

## 5. A/B Testing Search Improvements

### Framework
- Route percentage of users to variant search configuration
- Track metrics: click-through rate, query abandonment, time to result, satisfaction
- Statistical significance: minimum 1000 queries per variant, p-value <0.05

### What to A/B Test
- Embedding model changes (e.g., e5-large vs BGE-M3)
- Hybrid search weight (alpha parameter)
- Chunk size variations
- Reranker on vs off
- RAG prompt template changes
- UI changes (result layout, answer card position)

### Interleaving
- For search result ranking: use interleaved comparison (Team Draft)
- Mix results from control and variant; measure which gets more clicks
- More statistically efficient than traditional A/B split

## 6. Hallucination Detection in RAG Answers

Hallucinations are the highest-severity RAG bug. Systematic detection is critical.

### Detection Methods
- **Claim extraction**: Break answer into individual claims; verify each against context
- **NLI-based**: Use Natural Language Inference model to check entailment between context and answer
- **Keyword matching**: Check that key facts (names, numbers, dates) in answer appear in context
- **Self-consistency**: Generate answer multiple times; flag inconsistent responses
- **Forbidden phrases**: Detect phrases like "As an AI..." that indicate model defaulting

### Hallucination Test Set
- Create 50+ queries where the answer is NOT in the corpus
- Verify the system responds with "I don't have information about this" (not hallucinated answer)
- Create 50+ queries with specific numerical answers; verify exact match

### Monitoring in Production
- Sample 5% of RAG responses for automated hallucination check
- Flag responses where faithfulness score <0.7 for human review
- Track hallucination rate as a key metric (target: <5%)

## 7. Vietnamese Query Testing

Vietnamese presents unique testing challenges:

- **Diacritics variations**: Test "Ho Chi Minh" vs "Ho Chi Minh" (with/without diacritics)
- **Word segmentation**: Verify "hoc sinh" and "hocsinh" both return relevant results
- **Mixed language**: Test Vietnamese queries with English terms ("chinh sach refund")
- **IME input**: Test with actual Telex/VNI input to catch composition bugs
- **Tone sensitivity**: "ma" vs "ma" vs "ma" (ghost vs but vs horse — different meanings)
- **Southern vs Northern vocabulary**: Test regional term variations

### Vietnamese-Specific Test Cases
- Abbreviations: "BHXH", "CMND", "TP.HCM"
- Legal terms: "Nghi dinh", "Thong tu", "Quyet dinh"
- Formal vs informal queries: "Lam the nao de..." vs "Cach..."
- Code-switching: "Deploy len production nhu the nao"

## 8. Recommendations

1. Build a golden query set of 300+ queries before any optimization work begins
2. Automate relevance testing in CI/CD — no search change deploys without regression check
3. Hallucination detection must run continuously in production, not just during testing
4. Vietnamese testing requires native speakers — automated tools miss diacritic and segmentation issues
5. A/B test every significant search change; do not rely on offline metrics alone
6. Track search quality metrics as production SLIs alongside latency and availability
7. Budget 20% of search engineering time for ongoing quality assurance and evaluation
