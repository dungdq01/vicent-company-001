# Data Engineer Notes: Generative AI (B09)
## By DataFlow Prime (R-DE) — Date: 2026-03-31

### Training Data Curation at Scale

Large generative models require web-scale datasets. The primary sources include:

- **Common Crawl**: ~250 billion pages; must be filtered aggressively. Raw CC is roughly 400 TB compressed. Typical usable fraction after filtering: 5-15%.
- **LAION-5B**: 5.85 billion image-text pairs scraped from the web. Subject to takedown requests and legal challenges (LAION faced GDPR complaints in 2023-2024).
- **The Stack v2**: 67 TB of permissively-licensed code from Software Heritage for code generation models.
- **RedPajama v2**: 30 trillion tokens with quality signals pre-computed, a practical starting point for text model training.

Pipeline architecture for ingestion typically follows: crawl/download -> language detection -> deduplication -> quality filtering -> tokenization -> sharding.

Use Apache Spark or Dask for distributed processing. For datasets exceeding 10 TB, prefer cloud-native pipelines (AWS Glue, Dataflow) over self-managed clusters.

### Data Quality Filtering

Quality filtering is the single most impactful step in training data preparation:

- **Deduplication**: MinHash LSH at document level (remove near-duplicates), exact substring dedup at paragraph level. Tools: `text-dedup`, `deduplicate-text-datasets`. Dedup typically removes 30-50% of web crawl data.
- **Toxicity filtering**: Use Jigsaw Perspective API or self-hosted classifiers (detoxify). Set thresholds pragmatically — overly aggressive filtering removes minority-language content disproportionately.
- **PII removal**: Regex-based for structured PII (emails, phone numbers, SSN). NER-based (spaCy, presidio) for names and addresses. For Vietnamese PII, standard NER models underperform; fine-tune on Vietnamese data.
- **Quality scoring**: Perplexity-based filtering (train a small LM on Wikipedia, score all documents). Documents with perplexity outside 2 standard deviations are candidates for removal.
- **Porn/NSFW filtering**: For image datasets, use CLIP-based NSFW classifiers. For text, keyword lists plus classifier ensemble.

### Synthetic Data Generation Pipelines

Synthetic data has become a first-class training strategy:

- **Instruction tuning data**: Use a strong model (GPT-4, Claude) to generate instruction-response pairs. Self-Instruct pipeline: seed tasks -> generate instructions -> generate responses -> filter.
- **Evol-Instruct**: Iteratively increase complexity of instructions. Used successfully in WizardLM.
- **Distillation pipelines**: Run a large teacher model on diverse prompts, collect outputs, train a smaller student. Cost: ~$5-15K for a high-quality 100K-sample distillation dataset from GPT-4 class models.
- **Rejection sampling**: Generate N responses, score with reward model, keep top-k. Effective for math/code tasks.
- **For Vietnamese**: Generate Vietnamese instructions by translating from English and having native speakers validate 10-20% sample for quality. Direct Vietnamese generation from multilingual models is improving but still inconsistent.

### Data Versioning for Large Datasets

Traditional Git-based versioning fails at dataset scale. Practical approaches:

- **DVC (Data Version Control)**: Track large files via content hashes, store in S3/GCS. Works well up to ~1 TB.
- **Delta Lake / Apache Iceberg**: Table-format versioning for structured datasets. Support time travel and schema evolution.
- **LakeFS**: Git-like branching for object storage. Recommended for datasets in the 1-100 TB range.
- **Metadata-first approach**: Store dataset manifests (file lists, hashes, filter configs) in Git. Actual data lives in immutable object storage with content-addressed naming.

Always version the filtering pipeline code alongside the data. A dataset is defined by (source + pipeline version + config).

### Copyright and Licensing Issues

This is the most volatile area in GenAI data engineering as of 2026:

- **Legal landscape**: NYT v. OpenAI ongoing; EU AI Act requires training data transparency. Multiple jurisdictions ruling differently.
- **Practical approach**: Maintain provenance metadata for all training data. Tag each document/image with source URL, crawl date, detected license.
- **Safe sources**: Wikipedia (CC BY-SA), Project Gutenberg (public domain), permissively-licensed GitHub repos, government publications.
- **Risky sources**: News articles, copyrighted books, commercial photography. Even "publicly available" does not mean "legally trainable."
- **Opt-out compliance**: Respect robots.txt `ai-training` directives. Maintain blocklists and be prepared to re-filter datasets.

### Vietnamese Corpus Curation Challenges

- **Scale**: Vietnamese web content is ~0.3-0.5% of Common Crawl. Total high-quality Vietnamese text available: estimated 50-100 billion tokens after filtering.
- **Language detection**: Vietnamese is generally well-detected by fastText langid, but code-mixed content (Vietnamese + English) is often misclassified.
- **Tokenization artifacts**: Vietnamese is a tonal language with space-separated syllables. Word segmentation (VnCoreNLP, underthesea) is needed before quality filtering.
- **Sources**: VnExpress, Bao Moi, Vietnamese Wikipedia (~1.3M articles), Vietnamese government publications, academic papers from Vietnamese universities.
- **Diacritics**: Some Vietnamese web text has missing diacritics (telex input issues). Filter or normalize these entries.
- **Synthetic augmentation**: Given limited Vietnamese data, synthetic data generation and translation-based augmentation are essential for competitive Vietnamese generative models.

### Recommendations for B09

1. Build a modular data pipeline with pluggable filters — quality requirements change as models and legal landscapes evolve.
2. Invest heavily in deduplication; it yields the highest quality-per-token improvement.
3. Track data provenance from day one — retrofitting is extremely expensive.
4. For Vietnamese-focused models, plan for 10x more effort per token compared to English curation.
5. Budget $2-5K/month for cloud storage and processing of a 10TB-class training dataset.
6. Implement automated data quality dashboards — monitor language distribution, toxicity scores, and dedup rates per pipeline run.
7. Establish a synthetic data generation pipeline early; it is now a competitive necessity, not a luxury.
