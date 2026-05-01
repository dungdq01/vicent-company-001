# NLP Engineer Notes: Conversational AI & Chatbots (B08)
## By Linh Nguyen (R-NLP) — Date: 2026-03-31

### Intent Classification Architectures

Intent classification is the backbone of task-oriented chatbots:

**Traditional Pipeline (still viable for small-scale)**
- TF-IDF + SVM/Logistic Regression: fast training, interpretable, works with 50-100 examples per intent
- Requires good feature engineering: word n-grams, char n-grams (important for Vietnamese teencode)

**Neural Approaches**
- PhoBERT (Vietnamese BERT): fine-tune classification head on intent data; F1 >0.92 on well-labeled data
- Multilingual models (XLM-RoBERTa): handles Vietnamese-English code-switching naturally
- Architecture: `[CLS] token → dropout(0.1) → linear(768, num_intents) → softmax`
- For hierarchical intents: multi-level classification or flat classification with hierarchical label encoding

**LLM-based Classification**
- Zero-shot with prompt: "Classify the following Vietnamese customer message into one of these intents: ..."
- Few-shot: include 2 examples per intent in the prompt
- Higher accuracy on ambiguous cases but 100x slower and more expensive than PhoBERT
- Hybrid: use PhoBERT for high-confidence (>0.9), fall back to LLM for low-confidence

**Practical Considerations**
- Out-of-scope detection: add a "fallback" intent trained on random/irrelevant messages
- Confidence thresholds: route to human agent if max softmax probability < 0.7
- Multi-intent: some messages contain two intents ("I want to cancel order and get refund") — use multi-label classification

### Named Entity Recognition for Vietnamese

Vietnamese NER has unique challenges:
- No capitalization cues (Vietnamese uses capitalization but inconsistently in chat)
- Multi-syllable entities: "Thành phố Hồ Chí Minh" (Ho Chi Minh City) is one entity, 5 syllables
- Word segmentation must happen before NER — errors propagate
- PhoBERT-based NER: fine-tune with BIO tagging; use VnCoreNLP for word segmentation
- Key entity types for chatbots: `PERSON`, `LOCATION`, `ORG`, `PRODUCT`, `ORDER_ID`, `PHONE`, `DATE`, `MONEY`
- Vietnamese dates are complex: "mùng 5 tết" (5th day of Lunar New Year), "thứ 2 tuần sau" (next Monday)
- Regex-based extraction for structured entities (phone: `0[0-9]{9}`, order ID: defined format) — more reliable than NER for these

### Dialogue State Tracking

Dialogue state tracking (DST) maintains what the system knows across turns:
- State = set of (slot, value) pairs: `{intent: order_status, order_id: VN12345, status: pending}`
- Rule-based DST: extract entities per turn, merge into state with overwrite rules — simple but brittle
- Neural DST: use a model to predict the full state at each turn given conversation history
- For Vietnamese chatbots, a hybrid approach works best: rule-based for structured slots (order_id, phone), neural for open slots (complaint description)
- State must handle corrections: "Không phải đơn đó, đơn VN67890 cơ" (Not that order, order VN67890)
- Implement state timeout: clear state after 30 minutes of inactivity

### Coreference Resolution in Multi-turn

Coreference is critical for natural multi-turn conversation:
- "Sản phẩm này có ship được không?" → "này" (this) refers to a product mentioned earlier
- "Nó bao nhiêu tiền?" → "nó" (it) refers to previously discussed item
- Vietnamese pronouns are context-dependent: "anh/chị/em" can be pronouns or titles
- Practical approach: maintain an entity memory per session; resolve pronouns by recency and type match
- For LLM-based chatbots: include last 5-10 turns in context; the model handles coreference implicitly
- For pipeline chatbots: build explicit coreference rules for common Vietnamese pronoun patterns

### Vietnamese Tokenization Challenges

Vietnamese tokenization is fundamentally different from English:
- Vietnamese is written with spaces between syllables, but words can be multi-syllable
- "học sinh" (student) = 1 word, 2 syllables; "học" alone means "learn", "sinh" alone means "born"
- Word segmentation changes meaning: "bàn phím" (keyboard) vs "bàn" (table) + "phím" (key)

**Tools**
- VnCoreNLP: Java-based, high accuracy (~97.5% F1), slow startup, robust
- underthesea: Python-native, slightly lower accuracy (~97% F1), easier integration, active development
- pyvi: lightweight, lower accuracy, good for quick prototyping

**Chat-specific Issues**
- Teencode breaks all tokenizers: "ko bít" (không biết = don't know) — need normalization first
- Emoji and stickers interleaved with text — strip or replace before tokenization
- Mixed-script: Vietnamese + English words in one sentence — segment Vietnamese portions only

### Sentiment Analysis in Customer Conversations

- Vietnamese sentiment has unique expressions: "Giao hàng nhanh phết" (delivered pretty fast — positive, colloquial)
- Sarcasm is common: "Dịch vụ tốt thật đấy" (The service is really good — often sarcastic)
- Use PhoBERT fine-tuned on Vietnamese review data (VLSP datasets) as baseline
- Aspect-based sentiment: separate sentiment for product, delivery, customer service
- In chatbot context: detect negative sentiment early to route to human agent or apply de-escalation prompt
- Combine sentiment score with intent: angry + complaint = high priority escalation

### Language Detection & Code-switching

Vietnamese-English code-switching is pervasive in digital communication:
- Common patterns: Vietnamese grammar + English nouns ("Em muốn check lại order")
- Technical terms often stay in English: "update", "feedback", "account", "app"
- Sentence-level switching: some turns fully Vietnamese, some fully English, some mixed
- Detection approach: character-level n-gram model or fastText language ID per segment
- For chatbot response: match the user's language pattern — if they code-switch, respond similarly
- Maintain separate NLU models is NOT recommended; use multilingual models that handle both naturally
- Vietnamese-specific: distinguish between Vietnamese with English loanwords vs actual code-switching

### Recommendations for B08

1. Use PhoBERT as the foundation for intent classification and NER — it is the most battle-tested Vietnamese NLP model
2. Build a teencode normalizer as the first preprocessing step; maintain a living dictionary of abbreviations
3. For dialogue state tracking, start rule-based and migrate to neural as conversation complexity grows
4. Invest in a high-quality Vietnamese NER training set specific to your domain — generic NER models miss domain entities
5. Language detection at message level is sufficient; per-word detection adds complexity without proportional value
6. Sentiment detection should trigger escalation workflows, not just analytics — make it actionable
