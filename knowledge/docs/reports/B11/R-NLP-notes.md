# NLP Engineer Notes: Knowledge Graph (B11)
## By Le Thi Thanh Hoa (R-NLP) — Date: 2026-03-31

### 1. NLP Pipeline for KG Construction

The end-to-end NLP pipeline extracts structured triples from unstructured text:

```
Raw Text → Preprocessing → NER → Coreference Resolution → Relation Extraction → Entity Linking → Triple Generation
```

Each stage feeds the next. Errors compound, so each component must achieve high precision.

### 2. Named Entity Recognition for Vietnamese

**PhoBERT-based NER** (recommended primary model):
- PhoBERT is pre-trained on 20GB of Vietnamese text (Wikipedia + news)
- Fine-tune on PhoNER_COVID19 or VLSP NER datasets
- Supports entity types: PER, ORG, LOC, MISC (extendable to domain-specific types)
- Token-level classification with BIO/BIOES tagging scheme
- Expected F1: 90-93% on standard Vietnamese NER benchmarks

**underthesea NER**:
- Open-source Vietnamese NLP toolkit with built-in NER
- Simpler to deploy, lower accuracy (~85% F1)
- Good for rapid prototyping before investing in PhoBERT fine-tuning

**VinAI PhoNLP**:
- Joint POS tagging, NER, and dependency parsing
- Multi-task learning improves NER through shared representations

### 3. Vietnamese NER Challenges

- **Proper noun ambiguity**: Vietnamese names overlap with common words (e.g., "Mai" = name or "tomorrow", "Long" = name or "dragon")
- **No capitalization signal**: Vietnamese uses capitalization inconsistently in digital text
- **Address parsing**: Vietnamese addresses follow a nested structure (so nha, duong, phuong, quan, thanh pho) that requires specialized models
- **Compound entities**: Organization names often embed location (e.g., "Benh vien Da khoa Tinh Binh Duong")
- **Abbreviated forms**: "TP.HCM", "Cty TNHH", "UBND" require normalization
- **Diacritics variation**: Same entity written with and without diacritics ("Nguyen" vs "Nguyễn")

Mitigation: Build a Vietnamese entity gazetteer from Wikidata + government registries for dictionary-based pre-annotation.

### 4. Relation Extraction (RE)

**Approaches for Vietnamese RE**:

1. **Supervised RE**: Fine-tune PhoBERT for relation classification between entity pairs
   - Input: "[E1] Vingroup [/E1] la tap doan do [E2] Pham Nhat Vuong [/E2] sang lap"
   - Output: FOUNDED_BY relation
   - Requires labeled Vietnamese RE dataset (limited availability)

2. **Distant supervision**: Align Wikidata triples with Vietnamese text to auto-generate training data
   - High recall, noisy labels — use noise-aware training (e.g., DSGAN)

3. **LLM-based RE**: Prompt GPT-4 or Claude with few-shot examples for relation extraction
   - Most flexible, handles novel relation types
   - Cost considerations for large-scale processing

4. **Dependency-based patterns**: Use dependency parse trees to extract relations via syntactic patterns
   - Low recall but high precision; good for augmenting ML approaches

### 5. Entity Linking

Link extracted mentions to canonical entities in a reference KG:

- **Candidate generation**: String matching (fuzzy), alias lookup, abbreviation expansion
- **Candidate ranking**: Context similarity between mention context and entity description
- **Target KGs**: Wikidata (broad coverage), DBpedia (structured), domain-specific KGs
- **Vietnamese challenges**: Wikidata coverage for Vietnamese entities is incomplete; many local companies and people have no Wikidata entry
- **Fallback**: Create new entity nodes for mentions that cannot be linked — these become KG expansion candidates

Tools: mGENRE (multilingual entity linking), REL, or custom BLINK-based models.

### 6. Coreference Resolution

Essential for connecting mentions across sentences to the same entity:

- **Vietnamese coreference**: Limited tooling; adapt multilingual models (e.g., based on XLM-R)
- **Pronoun resolution**: Vietnamese pronouns are context-dependent ("anh", "chi", "ong", "ba" carry age/gender info)
- **Zero anaphora**: Vietnamese frequently drops subjects — requires inference from context
- **Practical approach**: Use simple heuristics (nearest compatible antecedent) combined with PhoBERT-based scoring

### 7. Open Information Extraction (OpenIE)

Extract triples without predefined relation schemas:

- **Stanford OpenIE**: English-focused, limited Vietnamese support
- **LLM-based OpenIE**: Prompt LLMs to extract all (subject, relation, object) triples from text
- **Post-processing**: Normalize extracted predicates to canonical relation types via clustering or manual mapping
- **Use case**: Discovery phase — identify new relation types before defining ontology

### 8. LLM-Based Triple Extraction

Using large language models for end-to-end KG construction:

**Prompt template**:
```
Extract all factual relationships from the following Vietnamese text as (subject, relation, object) triples.
Output as JSON array. Only extract explicitly stated facts.

Text: {input_text}
```

**Advantages**: No training data needed, handles complex sentences, adapts to new domains instantly
**Disadvantages**: Hallucination risk, cost at scale, latency
**Mitigation**: Verify LLM-extracted triples against source text with a separate validation model

### 9. Pipeline Integration

- **Batch processing**: Process document corpus offline with Airflow orchestration
- **Confidence scoring**: Each extracted triple gets a confidence score from the extraction model
- **Human-in-the-loop**: Low-confidence triples routed to human annotators for verification
- **Feedback loop**: Corrected triples become additional training data for model improvement

### 10. Evaluation Metrics for NLP Pipeline

| Component | Metric | Target |
|-----------|--------|--------|
| NER | Entity-level F1 | > 90% |
| RE | Relation F1 (macro) | > 75% |
| Entity Linking | Accuracy@1 | > 85% |
| End-to-end triple extraction | Triple-level F1 | > 65% |

### Recommendations for B11

1. **Use PhoBERT as the backbone** for all Vietnamese NLP tasks — it provides the best Vietnamese language understanding
2. **Build a Vietnamese entity gazetteer early** — it dramatically improves NER and entity linking accuracy
3. **Combine supervised RE with LLM-based extraction** — use LLMs for discovery and supervised models for high-throughput processing
4. **Address diacritics normalization as a preprocessing step** — inconsistent diacritics cause duplicate entities downstream
5. **Invest in annotation tooling** — tools like Label Studio with pre-annotation from models accelerate dataset creation
6. **Plan for domain-specific fine-tuning** — generic NER models miss domain entities (drug names, financial instruments)
7. **Implement confidence-based human-in-the-loop** — route uncertain extractions to humans rather than accepting noise
