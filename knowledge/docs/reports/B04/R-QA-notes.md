# QA Engineering Notes: B04 NLP
## By R-QA — Date: 2026-03-31

---

### 1. NLP Testing Strategy

A robust NLP testing strategy operates across three layers: unit, integration, and regression.

**Unit Tests for Preprocessing:** Every text normalization step should be independently testable. For Vietnamese text this means dedicated unit tests for diacritic normalization (e.g., ensuring "hoà" and "hòa" resolve consistently), tokenization boundary checks using underthesea or RDRsegmenter, and stopword removal verification. Tokenizer tests should cover edge cases: URLs, email addresses, numeric strings, and mixed-script tokens (e.g., "RAM 16GB" inside a Vietnamese sentence).

**Integration Tests for Pipeline:** End-to-end pipeline tests validate that preprocessing, embedding, classification, and output assembly work together correctly. For a RAG system this means testing: query → retrieval → context assembly → LLM call → parsed response. Mocking the LLM layer during CI runs keeps tests fast and deterministic. Contract tests between pipeline stages catch schema drift early.

**Regression Tests for Model Updates:** Any model swap (e.g., PhoBERT v1 → v2, or LLaMA 3.1 → 3.2) must be gated by a golden-set regression suite. Maintain a curated dataset of 200–500 representative inputs with known-good outputs. On each model update, run the suite and flag any accuracy delta above a defined threshold (e.g., F1 drop > 0.02).

---

### 2. LLM Evaluation Framework

Metric selection depends on the NLP task type:

- **BLEU / ROUGE:** Appropriate for summarization and translation tasks where reference outputs exist. ROUGE-L is preferred for longer Vietnamese text. Not suitable as the sole metric for open-ended generation.
- **BERTScore:** Semantic similarity metric using contextual embeddings. Useful for paraphrase detection and summarization. Use a multilingual BERT model (e.g., mBERT or XLM-RoBERTa) when evaluating Vietnamese outputs.
- **RAGAS (RAG Assessment):** For RAG systems, RAGAS provides four key metrics: Faithfulness (does the answer stay grounded in retrieved context?), Answer Relevancy, Context Precision, and Context Recall. Run RAGAS on a weekly sample of production queries.
- **LLM-as-Judge:** Use a strong LLM (GPT-4o or Claude 3.5 Sonnet) to score outputs on a rubric: factual accuracy, coherence, completeness, and tone appropriateness. This scales better than human evaluation for large sample sets. Validate the judge's scoring against human labels quarterly to detect judge drift.
- **Human Eval Rubrics:** Required for high-stakes outputs (customer-facing content, educational grading). Use a 5-point Likert scale across dimensions: fluency, accuracy, helpfulness, Vietnamese language quality.

---

### 3. Adversarial Testing for LLMs

LLMs deployed in production must be tested against a range of adversarial conditions before release.

**Prompt Injection:** Test for direct injection (user attempts to override system prompt via input) and indirect injection (malicious content embedded in retrieved documents that overrides LLM behavior). Maintain a library of known injection patterns and run automated scans on each release.

**Jailbreak Attempts:** Maintain a jailbreak test suite covering role-play exploits, base64-encoded instructions, multi-turn persuasion chains, and token smuggling. Track pass/fail rates per model version.

**Adversarial Inputs:** Inputs designed to degrade performance: homoglyph substitution (Cyrillic characters that look like Latin), excessive repetition, contradictory instructions within a single prompt, and intentional misspellings. The model should degrade gracefully rather than produce confident wrong output.

**Edge Cases:** Empty input (model must not crash or hallucinate a question), very long input exceeding context window (truncation strategy must be tested), multilingual mixed input (Vietnamese + English + emoji), and inputs containing PII that should be redacted before processing.

---

### 4. Vietnamese Language Quality Testing

Vietnamese presents unique QA challenges that require dedicated test coverage.

**Diacritic Handling:** Vietnamese has 5 tones plus multiple vowel modifications. Test that the system correctly distinguishes minimal pairs: "ma" (ghost) vs "má" (mother) vs "mà" (but). Diacritic stripping must only happen when explicitly intended (e.g., URL slugs), never silently during NLP preprocessing.

**Tonal Accuracy:** For generative outputs (summaries, answers), evaluate tonal correctness using native speaker review panels. An automated proxy: use a Vietnamese spell checker to flag missing or incorrect tone marks in LLM outputs.

**Code-Switching:** Vietnamese business and technical documents frequently mix Vietnamese with English technical terms. Test that the tokenizer handles phrases like "deploy lên server" or "fix bug trong module thanh toán" without breaking on the language boundary.

**Dialect Detection:** Northern (Hà Nội) vs Southern (Hồ Chí Minh City) dialect differences affect vocabulary and pronunciation. For voice-adjacent NLP pipelines, test dialect robustness. For text-only systems, flag if outputs consistently use one dialect when the input was in another.

---

### 5. Hallucination Detection & Measurement

Hallucination is the primary quality risk for LLM-based systems in enterprise contexts.

**Fact-Checking Pipeline:** For RAG systems, implement a post-generation verification step: extract factual claims from the LLM output, cross-reference each claim against the retrieved source documents, and flag claims with no grounding. Tools: LangChain's hallucination checkers, custom claim extraction with GPT-4o.

**Consistency Checks:** Run the same query multiple times (5–10 samples) and measure semantic variance. High variance in factual claims signals low confidence and potential hallucination. Use cosine similarity of BERTScore embeddings to measure consistency.

**Confidence Calibration Testing:** For classification tasks, test that model confidence scores (logit probabilities) are well-calibrated: a claim labeled 80% confident should be correct 80% of the time. Use Expected Calibration Error (ECE) as the metric.

---

### 6. Performance Benchmarking

**Tokens/Second (throughput):** Measure under realistic batch sizes. For a Vietnamese customer service bot, benchmark at 50, 100, and 500 concurrent requests. Target: >= 50 tokens/sec per request on the inference host.

**TTFT (Time-to-First-Token):** Critical for chat UX. Target: < 500ms at P95 under normal load. TTFT degrades with long system prompts and large context — test both short and long context scenarios.

**Latency Under Load:** Use a load testing tool (Locust or k6) to simulate realistic traffic patterns. Capture P50, P95, P99 latency. Identify the throughput inflection point where latency begins to grow non-linearly.

**Concurrent User Testing:** For Vietnamese edtech or customer service deployments, simulate peak traffic (e.g., exam season for education, Tết holiday for retail). Verify that the system maintains quality and latency SLAs.

---

### 7. CI/CD Quality Gates for NLP

Every PR that touches the NLP pipeline must pass automated gates before merge:

- **Minimum F1 threshold:** Intent classification F1 >= 0.88 on the golden test set.
- **BLEU regression gate:** Summarization BLEU score must not drop more than 2 points vs the main branch baseline.
- **Prompt regression suite:** A library of 50 curated prompts with expected output patterns (regex or semantic similarity checks) must all pass. New model versions require full suite execution.
- **Latency gate:** P95 latency for the NLP pipeline must stay below the defined SLA (e.g., 2 seconds for synchronous API, 30 seconds for batch).
- **Hallucination rate gate:** On the RAGAS faithfulness metric, score must stay >= 0.85.

---

### 8. Production Monitoring Checklist

Ongoing production monitoring for an NLP system should alert on the following signals:

| Signal | Alert Threshold | Action |
|---|---|---|
| Latency spike (P95 TTFT) | > 2x baseline for 5 min | Page on-call, check GPU/API quota |
| Cost anomaly | > 30% daily token spend increase | Review prompt changes, check for runaway loops |
| Output quality degradation | RAGAS faithfulness < 0.80 (sampled) | Rollback model or prompt version |
| Token limit breaches | > 5% of requests hitting context limit | Review chunking strategy |
| Hallucination rate increase | > 10% increase week-over-week | Audit retrieval quality and prompt grounding |
| Error rate | > 1% 5xx from NLP API | Escalate to infra team |
| Vietnamese diacritic corruption | Any detected in 1000-sample daily audit | Bug in encoding pipeline — hotfix |

Log all LLM inputs and outputs (with PII scrubbing) for a minimum 30-day rolling window to enable offline quality audits and incident post-mortems.
