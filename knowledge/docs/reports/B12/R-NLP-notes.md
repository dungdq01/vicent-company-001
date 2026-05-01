# NLP Engineer Notes: Search & RAG (B12)

## 1. Query Understanding

Effective search starts with understanding what the user actually wants.

### Intent Classification
- **Navigational**: User wants a specific document ("employee handbook 2025")
- **Informational**: User wants an answer ("what is the refund policy")
- **Transactional**: User wants to do something ("submit leave request")
- Classify intent to route: navigational -> keyword search, informational -> RAG, transactional -> action

### Entity Extraction
- Extract key entities: dates, people, product names, document types, departments
- Use NER models (PhoBERT-NER for Vietnamese) or LLM-based extraction
- Entities enable filtered search: "Q1 2025 revenue report" -> filter by date + type

### Query Classification
- Short vs long queries require different handling
- Keyword queries (1-3 words) -> boost BM25 weight
- Natural language questions -> boost semantic search weight
- Use a lightweight classifier or rule-based system for routing

## 2. Query Expansion and Rewriting

Users often write incomplete or ambiguous queries. Expansion improves recall.

- **Synonym expansion**: "AI" -> "AI OR artificial intelligence OR machine learning"
- **Acronym resolution**: "BHXH" -> "Bao hiem xa hoi" (Vietnamese social insurance)
- **LLM-based rewriting**: Use GPT/Claude to rewrite vague queries into precise ones
- **HyDE (Hypothetical Document Embeddings)**: Generate a hypothetical answer, embed that instead of the query; improves semantic retrieval by 5-15%
- **Multi-query expansion**: Generate 3-5 query variations, retrieve for each, merge results
- **Step-back prompting**: For complex queries, generate a broader query first

Recommendation: HyDE and multi-query expansion give the best ROI. LLM rewriting adds latency (~500ms) but significantly improves complex query handling.

## 3. Vietnamese Tokenization for Search

Vietnamese word segmentation is critical because Vietnamese is an isolating language where words can be multi-syllable.

### Impact on BM25
- Without segmentation: "hoc sinh" matches "hoc" and "sinh" independently (noise)
- With segmentation: "hoc_sinh" matches as a single term (precise)
- BM25 performance improves 15-25% with proper Vietnamese segmentation

### Segmentation Tools
- **VnCoreNLP**: Most accurate (F1 ~97.7%), Java-based, requires JVM
- **Underthesea**: Python-native, slightly less accurate (F1 ~96.5%), easier to deploy
- **PyVi**: Lightweight, dictionary-based, fastest but least accurate
- **PhoBERT tokenizer**: Subword tokenization, not word-level; suitable for neural models

### Practical Considerations
- Apply same segmentation at both index time and query time
- Handle mixed Vietnamese-English text (common in tech domains)
- Proper nouns and abbreviations need special handling

## 4. Vietnamese Stop Words

Vietnamese stop words removal improves BM25 precision:

Common stop words: cua, la, va, trong, cho, den, nhung, cac, mot, nhu, co, se, da, dang, duoc, voi, tai, theo, ve, tu, boi, nay, do, thi, ma

Recommendation: Maintain a curated stop word list (50-100 words). Do NOT remove stop words for embedding models — they handle this internally.

## 5. Multilingual Search Challenges

For Vietnamese enterprise search, multilingual handling is essential:

- **Code-switching**: Vietnamese text often mixes English terms ("deploy len server")
- **Transliteration**: Vietnamese names in English documents and vice versa
- **Cross-lingual retrieval**: Query in Vietnamese, retrieve English documents (and vice versa)
- **Solution**: Use multilingual embedding models (e5, BGE-M3) that project all languages into shared space
- **BM25 challenge**: Keyword search fails across languages; must use translation or multilingual sparse models

## 6. Summarization for RAG Context

Retrieved chunks often need processing before feeding to the LLM:

- **Context compression**: Summarize long retrieved passages to fit context window
- **Extractive summarization**: Pull key sentences from each chunk
- **LLM-based compression**: Use LLMLingua or similar to compress context 2-4x with minimal information loss
- **Contextual chunk headers**: Prepend document title and section hierarchy to each chunk
- **Chunk fusion**: Merge adjacent retrieved chunks from the same document

## 7. Prompt Engineering for RAG Generation

The generation prompt is crucial for RAG answer quality:

### Key Principles
- Instruct the model to ONLY use provided context
- Require citation of source documents
- Tell the model to say "I don't know" if context is insufficient
- Specify output format (bullet points, paragraph, table)

### Vietnamese RAG Prompting
- Instruct response language explicitly: "Tra loi bang tieng Viet"
- Vietnamese prompts often yield better Vietnamese answers than English prompts
- Handle honorifics and formality level appropriate to domain

### Anti-Hallucination Techniques
- "Only use information from the provided documents"
- "Quote relevant passages to support your answer"
- "If the documents do not contain the answer, state that clearly"
- Chain-of-thought: Ask model to first identify relevant passages, then synthesize

## 8. Recommendations

1. Implement query classification (keyword vs semantic) to route to appropriate search mode
2. HyDE is the single most impactful NLP technique for improving semantic search
3. Vietnamese word segmentation is mandatory for BM25; use VnCoreNLP in production
4. Build an acronym/synonym dictionary for your domain (especially for Vietnamese abbreviations)
5. Invest heavily in RAG prompt engineering — it has outsized impact on answer quality
6. Always include source attribution instructions in RAG prompts
7. Test with real Vietnamese queries early — synthetic English test sets miss critical issues
