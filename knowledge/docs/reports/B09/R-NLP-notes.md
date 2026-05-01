# NLP Engineer Notes: Generative AI (B09)
## By LinguaGen (R-NLP) — Date: 2026-03-31

### Tokenizer Design

The tokenizer is the foundation of any text generative model:

- **BPE (Byte Pair Encoding)**: Used by GPT family, Llama. Learns merges from frequency statistics. Vocabulary sizes: 32K (Llama), 100K (GPT-4), 128K (Llama 3). Larger vocab = better compression but larger embedding matrix.
- **SentencePiece**: Google's unsupervised tokenizer. Supports BPE and Unigram modes. Language-agnostic, operates on raw bytes. Standard for multilingual models.
- **Tiktoken**: OpenAI's fast BPE implementation. Works on byte-level, handles any UTF-8 text.
- **Vietnamese tokenization challenges**: Vietnamese words are multi-syllable with space-separated syllables (e.g., "Hà Nội" is one word, two syllables). Standard BPE treats syllables as separate tokens, leading to poor compression. Solutions:
  - Pre-segment with VnCoreNLP or underthesea before tokenizer training so compound words become single units.
  - Train tokenizer on Vietnamese-heavy corpus to learn Vietnamese-specific merges.
  - Llama 3's 128K vocabulary includes better Vietnamese token coverage than earlier models.
- **Fertility rate**: Measure tokens-per-word for Vietnamese text. English averages ~1.3 tokens/word with GPT-4 tokenizer; Vietnamese can be 2-3x worse with English-centric tokenizers. This directly impacts effective context length and inference cost.

### Prompt Engineering Patterns

Prompt engineering is the primary interface for controlling generative output:

- **Zero-shot**: Direct instruction. Works for capable models on common tasks. "Translate the following to Vietnamese: ..."
- **Few-shot**: Provide 2-5 examples before the query. Critical for formatting control and style matching. Place examples in order of increasing difficulty.
- **Chain-of-thought (CoT)**: "Let's think step by step" or structured reasoning. Improves accuracy on math, logic, and multi-step tasks by 20-40% on average.
- **System prompts**: Set behavioral constraints, persona, output format. Keep under 500 tokens for efficiency. Front-load the most important instructions.
- **ReAct pattern**: Thought -> Action -> Observation loop. Enables tool use and grounded generation. Standard for agentic applications.
- **Self-consistency**: Generate N responses with temperature > 0, take majority vote. Improves accuracy at the cost of N-fold compute.
- **Structured prompting**: Use XML tags, markdown headers, or delimiters to organize complex prompts. Models trained on structured data respond better to structured prompts.

### Structured Output Generation

Generating valid structured output is critical for production systems:

- **JSON mode**: Most API providers now support constrained JSON generation. OpenAI's `response_format: json_object`, Anthropic's tool use. Guarantees syntactically valid JSON.
- **Function calling**: Define function schemas; model generates arguments. Enables reliable tool use. Supported by OpenAI, Anthropic, Mistral, and open models via Outlines/vLLM.
- **Constrained decoding**: Libraries like Outlines, LMQL, and Guidance enforce grammar constraints during generation. Can guarantee regex patterns, JSON schemas, or arbitrary CFGs.
- **Practical tips**:
  - Always provide a JSON schema with descriptions for each field.
  - Use enums for categorical fields — reduces hallucination.
  - For complex structures, break into multiple generation steps.
  - Validate output programmatically and retry on failure (typically <5% failure rate with good prompts).
- **Vietnamese structured output**: Models sometimes mix Vietnamese and English in structured fields. Explicitly specify language per field in the schema description.

### Vietnamese Text Generation Quality

Current state of Vietnamese generation across models (as of early 2026):

- **GPT-4 / Claude 3.5+**: Strong Vietnamese generation. Natural grammar, appropriate formality levels (tôi/mình/em/anh), correct diacritics. Occasional unnatural phrasing on specialized topics.
- **Llama 3 70B+**: Decent Vietnamese but noticeably less natural than proprietary models. 8B variant struggles with longer Vietnamese texts.
- **Qwen 2.5**: Surprisingly good Vietnamese due to CJK-heavy training. Better Vietnamese than Llama at equivalent sizes.
- **Vistral / PhoGPT**: Vietnamese-focused models. Better cultural context but smaller scale limits capability.

Key quality issues:
- **Formality/register**: Vietnamese has complex pronoun systems tied to social relationships. Models often default to neutral register, missing context-appropriate pronouns.
- **Diacritical accuracy**: Critical — wrong diacritics change meaning entirely (e.g., "ma" vs "mà" vs "má" vs "mả" vs "mạ" vs "mã"). Modern models rarely make diacritic errors but it must be monitored.
- **Southern vs Northern dialect**: Models tend toward Northern/standard Vietnamese. Southern dialect generation is less reliable.
- **Code-mixing**: Vietnamese internet text frequently mixes Vietnamese and English. Models handle this but may over- or under-code-mix depending on training data.

### Content Detection and Watermarking

Detecting and marking AI-generated text is an emerging requirement:

- **Statistical watermarking**: Modify token sampling to embed a signal (e.g., Kirchenbauer et al. "green list" method). Detectable with access to the watermarking key. Survives light paraphrasing.
- **SynthID (Google)**: Production watermarking system. Embeds signal in token probabilities. Available in Gemini outputs.
- **Detection without watermarking**: Tools like GPTZero, Originality.ai. Accuracy: 85-95% on English, significantly worse on Vietnamese and other lower-resource languages. High false positive rate on non-native English speakers' writing.
- **Practical limitations**: Paraphrasing, translation, and mixing human+AI text defeat most detectors. Watermarking is more robust but requires control of the generation process.
- **Regulatory trend**: EU AI Act requires disclosure of AI-generated content. Vietnam's draft AI regulations similarly require labeling.

### Summarization and Translation as Generation Tasks

These classic NLP tasks are now best approached as generation problems:

- **Summarization**: Prompt-based summarization with LLMs now outperforms dedicated models on most benchmarks. Key techniques: specify length, format (bullet points vs paragraph), and what to emphasize. For Vietnamese news summarization, 7B-class models achieve usable quality.
- **Translation**: LLMs are competitive with dedicated MT systems for high-resource language pairs. For English-Vietnamese:
  - GPT-4/Claude: Near-professional quality for general text.
  - Open models: Llama 3 70B is usable; smaller models produce frequent errors.
  - Specialized MT (Google Translate, NLLB): Still preferred for high-volume, cost-sensitive translation.
- **Document-level generation**: LLMs handle document context better than sentence-level MT. Improves consistency of terminology and style across paragraphs.

### Recommendations for B09

1. Invest in Vietnamese tokenizer evaluation — measure fertility rate across candidate models. A 2x worse tokenizer means 2x inference cost.
2. Build a prompt library with tested templates for each use case. Version and A/B test prompts like code.
3. Use constrained decoding (Outlines/Guidance) for any production structured output — prompt-only JSON generation has a non-trivial failure rate.
4. For Vietnamese generation quality, prefer Qwen 2.5 or GPT-4 class models. Smaller open models need Vietnamese-specific fine-tuning.
5. Implement output validation for Vietnamese text: diacritic completeness check, language detection, and formality consistency.
6. Do not rely on AI text detection tools for critical decisions — accuracy is insufficient, especially for Vietnamese.
7. For summarization and translation, benchmark LLM-based approaches against dedicated tools; the cost-quality tradeoff varies by use case.
