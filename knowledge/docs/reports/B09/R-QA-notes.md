# QA Engineer Notes: Generative AI (B09)
## By TestForge (R-QA) — Date: 2026-03-31

### Output Quality Evaluation

Generative AI outputs are non-deterministic — traditional assertion-based testing is insufficient:

- **Automated evaluation**: LLM-as-judge is the most scalable approach. Use a strong model (GPT-4, Claude) to score outputs on dimensions: accuracy, relevance, coherence, helpfulness, safety. Provide scoring rubrics in the judge prompt. Cost: ~$0.01-0.05 per evaluation.
- **Human evaluation**: Gold standard. Use for calibrating automated metrics and for high-stakes quality assessments. Set up an evaluation platform (Argilla, Label Studio) with clear annotation guidelines. Inter-annotator agreement (Cohen's kappa > 0.6) validates guideline quality.
- **Reference-based metrics**: BLEU, ROUGE for translation/summarization (legacy but still used for benchmarking). BERTScore for semantic similarity. These correlate poorly with human judgment for open-ended generation.
- **Evaluation dimensions**: Factual accuracy (verifiable claims), relevance (answers the question), coherence (logical flow), fluency (natural language), safety (no harmful content), format compliance (follows instructions).
- **Vietnamese quality evaluation**: Recruit Vietnamese-speaking evaluators. Automated evaluation with LLM-as-judge works for Vietnamese but requires Vietnamese-language rubrics. Check for diacritic accuracy, register appropriateness, and cultural sensitivity.
- **Evaluation datasets**: Build domain-specific test sets with 200-500 examples. Include edge cases, adversarial inputs, and Vietnamese-specific scenarios. Version test sets alongside models.

### Regression Testing for Model Updates

Every model update can change output behavior unpredictably:

- **Golden test sets**: Maintain a curated set of 100-500 input-output pairs representing critical use cases. Run against every model update. Flag regressions where quality drops more than 10% on any dimension.
- **Automated regression pipeline**: New model -> run golden tests -> LLM-as-judge scoring -> compare against baseline scores -> generate regression report -> block deployment if critical regressions found.
- **Behavioral tests**: Beyond quality, test specific behaviors: "Model refuses harmful requests," "Model produces valid JSON when asked," "Model correctly handles Vietnamese diacritics." These are pass/fail, not scored.
- **Semantic drift detection**: Compare output embeddings between model versions. Large embedding distance on same inputs indicates behavioral change. Investigate manually.
- **Versioned baselines**: Store baseline scores per model version. Dashboard showing quality trends over time. Alert on degradation.

### Red-Teaming and Adversarial Testing

Proactive attack simulation is essential for GenAI systems:

- **Red team composition**: Mix of security engineers, domain experts, and creative adversarial thinkers. Rotate team members to bring fresh attack perspectives.
- **Attack categories**:
  - Jailbreaks: Bypass safety training (role-play, encoding tricks, multi-turn escalation).
  - Prompt injection: Override system instructions via user input.
  - Data extraction: Trick model into revealing training data, system prompts, or other users' data.
  - Harmful content elicitation: Get model to produce unsafe outputs.
  - Bias exploitation: Trigger discriminatory or stereotyping outputs.
- **Methodology**: Start with known attack catalogs (OWASP LLM Top 10, Anthropic's red-teaming dataset). Then develop custom attacks targeting your specific system prompt and tools. Document all successful attacks with reproduction steps.
- **Frequency**: Full red-team exercise before every major model or system prompt change. Continuous automated scanning with known jailbreak datasets.
- **Vietnamese-specific attacks**: Test with Vietnamese-language jailbreaks. Test code-mixed (Vietnamese + English) attacks. Verify Vietnamese cultural sensitivity handling.

### Benchmark Suites

Standard benchmarks provide objective quality measurement:

- **MMLU / MMLU-Pro**: 57-subject multiple-choice knowledge test. Baseline for general capability. Run full suite on every model update. Current SOTA: ~90%.
- **HumanEval / MBPP**: Code generation benchmarks. Pass@1 and Pass@10. Test with and without fine-tuning.
- **MT-Bench**: 80 multi-turn questions scored by GPT-4. 8 categories: writing, roleplay, reasoning, math, coding, extraction, STEM, humanities. Scores 1-10 per turn.
- **AlpacaEval**: Automated evaluation comparing model outputs to reference model. Win rate metric. Fast to run, good for relative comparisons.
- **Vietnamese-specific benchmarks**: VLSP shared tasks (NER, sentiment, QA), ViMMRC (reading comprehension), custom Vietnamese MMLU subset. Build internal Vietnamese benchmark with 500+ questions covering local knowledge, language quality, and cultural appropriateness.
- **Domain-specific benchmarks**: Create custom benchmarks for each target use case. 100-200 examples per domain. Include both easy and hard examples.

### A/B Testing Generation Quality

Compare model variants in production with real users:

- **Setup**: Hash user_id to assign variants consistently. Track per-variant metrics: user satisfaction rating, regeneration rate, task completion rate, engagement time, output length.
- **Statistical rigor**: Minimum 1000 generations per variant for meaningful comparison. Use Mann-Whitney U test for rating comparisons (non-normal distribution). Run for at least 1 week to capture daily patterns.
- **Quality metrics to track**: Explicit feedback (thumbs up/down), implicit signals (copy/use generated content, regenerate, edit output, abandon), task-specific success metrics.
- **Guardrails**: Monitor safety metrics per variant. Auto-stop variant if safety trigger rate exceeds threshold. Never A/B test safety — always use the safest available filter.
- **Multi-armed bandit**: For ongoing optimization, use Thompson Sampling to automatically shift traffic toward better-performing variants. Faster convergence than fixed-split A/B tests.

### Performance Testing

GenAI systems have unique performance characteristics:

- **Key metrics**: Time-to-first-token (TTFT) — target < 500ms. Inter-token latency — target < 50ms. End-to-end latency for full response. Throughput in tokens per second. Concurrent user capacity.
- **Load testing tools**: Locust or k6 with custom GenAI plugins. Simulate realistic request patterns: variable prompt lengths, mixed model usage, streaming connections.
- **Stress testing**: Gradually increase concurrent users until quality degrades. Identify the breaking point. Verify graceful degradation (queue overflow -> informative error, not crash).
- **Latency profiling**: Break down latency: network -> preprocessing -> queue wait -> model inference -> postprocessing -> response. Identify bottleneck per request.
- **GPU memory testing**: Monitor GPU OOM under load. Test with maximum context length inputs. Verify KV-cache eviction works correctly under memory pressure.
- **Image generation performance**: Test batch throughput, queue drain rate, and memory stability over long runs (detect GPU memory leaks).

### Safety Testing

Dedicated safety evaluation beyond red-teaming:

- **Jailbreak resistance**: Run known jailbreak datasets (AdvBench, HarmBench) against the system. Track attack success rate (ASR). Target ASR < 5% for known attacks, < 15% for novel attacks.
- **Bias testing**: Test for demographic biases in generation. Equal quality across genders, ethnicities, and nationalities. Use bias benchmarks (BBQ, WinoBias) adapted for Vietnamese context.
- **Toxicity testing**: Run RealToxicityPrompts or similar dataset. Measure toxicity probability of continuations. Target < 1% toxic completions for neutral prompts.
- **Information hazard testing**: Verify model refuses to provide dangerous information (weapons, drugs, cyberattacks). Test with paraphrased and obfuscated versions of harmful requests.
- **Compliance testing**: Verify content labeling requirements are met. Verify data handling meets privacy regulations. Automated compliance checks in CI/CD.

### Consistency Testing Across Runs

Non-determinism is inherent but controllable:

- **Temperature 0 consistency**: With temperature=0 and same seed, outputs should be identical. Test this across model serving instances to verify deterministic behavior. vLLM may produce slightly different outputs across restarts — document and accept.
- **Semantic consistency**: Same question rephrased should produce semantically equivalent answers. Generate paraphrases of test inputs and measure output similarity.
- **Format consistency**: If instructed to output JSON, compliance rate should be > 99% across 1000 runs. Test with various prompts and edge cases.
- **Cross-language consistency**: Same factual question in English and Vietnamese should produce consistent answers. Test knowledge and reasoning consistency across languages.
- **Temporal consistency**: Model should produce consistent quality over time (no silent degradation). Run daily consistency checks on golden test set.

### Recommendations for B09

1. Implement LLM-as-judge automated evaluation in CI/CD — block deployments with quality regressions.
2. Build a Vietnamese-specific golden test set of 500+ examples covering quality, safety, and cultural appropriateness.
3. Run red-team exercises before every model update. Maintain and evolve a jailbreak test suite.
4. Track both explicit (thumbs up/down) and implicit (regeneration rate, copy rate) quality signals in production.
5. Performance test with realistic concurrent loads — GPU serving has non-linear degradation under high concurrency.
6. Test consistency at temperature=0 across serving instances to catch non-determinism bugs.
7. Automate MMLU, MT-Bench, and custom Vietnamese benchmarks in the model evaluation pipeline.
