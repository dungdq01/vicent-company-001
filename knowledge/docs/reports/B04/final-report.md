# Báo cáo Tổng hợp: Natural Language Processing (B04) — Bản cuối
## Tổng hợp bởi Ms. Scribe (R-σ) — Ngày: 2026-03-31

---

### Tóm tắt điều hành

Natural Language Processing (Xử lý Ngôn ngữ Tự nhiên — NLP) là năng lực AI nền tảng và chiến lược nhất trong hệ sinh thái MAESTRO Knowledge Graph: hầu như mọi baseline khác đều có một tầng ngôn ngữ (B02 Document Intelligence, B08 Conversational AI, B09 Generative AI, B11 Knowledge Graph, B12 Search & RAG) đều phụ thuộc vào NLP để vận hành. Verdict tổng thể là **CONDITIONAL GO** với điểm 6.8/10 — nhu cầu thị trường mạnh, hệ sinh thái kỹ thuật trưởng thành, nhưng rủi ro chiến lược đến từ làn sóng LLM commoditization (thương phẩm hóa) đang diễn ra với tốc độ chưa từng có. GPT-4o-class đã đạt tiếng Việt thành thạo ở mức giá $0.15/1M token tính đến Q3 2025 — cánh cửa cho các sản phẩm NLP tiếng Việt chung chung đã đóng lại. Con đường khả thi duy nhất là **chuyên sâu theo chiều dọc**: sở hữu dữ liệu có nhãn tiếng Việt theo domain, tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, và xây dựng hệ thống NLP trên-cơ-sở (on-premise) cho các doanh nghiệp trong lĩnh vực được quản lý chặt (ngân hàng, y tế, chính phủ). Stack khuyến nghị trung tâm: **PhoBERT + LoRA fine-tune** cho tác vụ phân loại, **RAG với Vietnamese embedding model + Qdrant** cho hỏi-đáp tài liệu, và **vLLM + Vistral-7B hoặc Qwen2.5** cho môi trường yêu cầu data sovereignty. NLP tiếng Việt có những thách thức ngôn ngữ đặc thù — ngôn ngữ thanh điệu, phân đoạn từ đa âm tiết, text không chính thức — mà đòi hỏi engineering chuyên biệt vượt ra ngoài việc đơn giản sao chép giải pháp NLP tiếng Anh.

---

### 1. Nghiên cứu học thuật (từ R-α)

#### 1.1 Phân loại học (Taxonomy)

NLP là lĩnh vực con của AI → Machine Learning → Deep Learning, bao gồm hai nhánh lớn là **NLU** (Natural Language Understanding — hiểu ngôn ngữ) và **NLG** (Natural Language Generation — sinh ngôn ngữ), cùng với tầng **Retrieval & Search** (tìm kiếm và truy xuất). Các sub-field chính bao gồm:

- **Text Classification** — Phân loại văn bản: gán nhãn cho văn bản (phân tích cảm xúc, phát hiện ý định, phân loại chủ đề)
- **Named Entity Recognition (NER)** — Nhận dạng thực thể có tên: xác định và phân loại các thực thể (người, tổ chức, địa điểm, ngày tháng)
- **Machine Translation (MT)** — Dịch máy
- **Summarization** — Tóm tắt văn bản (trích xuất và tóm tắt trừu tượng)
- **Question Answering (QA)** — Hỏi đáp: open-domain, closed-domain, reading comprehension
- **Dialogue Systems** — Hệ thống đối thoại, Conversational AI
- **Text Generation** — Sinh văn bản với LLM
- **Semantic Search & Dense Retrieval** — Tìm kiếm ngữ nghĩa và truy xuất dày đặc
- **Sentiment Analysis** — Phân tích tình cảm và quan điểm
- **Information Extraction (IE)** — Trích xuất thông tin có cấu trúc từ văn bản phi cấu trúc
- **Coreference Resolution** — Phân giải đồng tham chiếu
- **RAG (Retrieval-Augmented Generation)** — Sinh có tăng cường truy xuất

#### 1.2 Các khái niệm cốt lõi (Core Concepts)

**Tokenization (Phân token):** Quá trình chuyển đổi chuỗi ký tự thành các đơn vị token. Hiện đại dùng Byte-Pair Encoding (BPE) hoặc WordPiece. Với tiếng Việt: khoảng trắng phân cách âm tiết chứ không phải từ — một từ như "học sinh" cần được tokenize đúng như một đơn vị, không phải hai.

**Word Embeddings (Word2Vec / GloVe):** Biểu diễn từ dưới dạng vector dày đặc trong không gian chiều cao. Tính chất nổi bật: `vec("vua") - vec("nam") + vec("nữ") ≈ vec("nữ hoàng")`. Giới hạn: embedding tĩnh, không phân biệt đa nghĩa theo ngữ cảnh.

**Contextual Embeddings (ELMo, BERT-style):** Giải quyết vấn đề đa nghĩa — mỗi lần xuất hiện của token tạo ra vector khác nhau tùy ngữ cảnh. ELMo dùng LSTM hai chiều; BERT dùng Transformer với self-attention đầy đủ.

**Attention Mechanism (Cơ chế chú ý):** Công thức cơ bản: `Attention(Q, K, V) = softmax(QKᵀ / √d_k) V`. Cho phép mỗi token "chú ý" đến tất cả token khác trong sequence, loại bỏ bottleneck thông tin của seq2seq truyền thống.

**Transformer Architecture:** Kiến trúc sequence-to-sequence xây dựng hoàn toàn từ lớp attention và feed-forward, không có recurrence. Encoder-only (BERT family), Decoder-only (GPT family), Encoder-Decoder (T5/BART family). Phức tạp tính toán O(n²d) là bottleneck với context dài.

**BERT / Masked Language Modeling (MLM):** BERT huấn luyện trước với hai mục tiêu: MLM (che giấu 15% token, dự đoán lại) và NSP (dự đoán có phải câu tiếp theo). Tạo ra paradigm pretraining → fine-tuning thống trị NLP.

**GPT / Causal Language Modeling (CLM):** Mô hình decoder-only huấn luyện dự đoán token tiếp theo từ trái sang phải: `L = -Σ_t log P(x_t | x_1, ..., x_{t-1}; θ)`. Paradigm sinh văn bản tự hồi quy.

**Fine-tuning (Tinh chỉnh):** Tiếp tục huấn luyện mô hình đã pretrain trên tập dữ liệu nhỏ hơn cho tác vụ cụ thể. LoRA (Low-Rank Adaptation) đông lạnh trọng số gốc, chỉ huấn luyện ma trận rank thấp, giảm 99%+ tham số cần train.

**Prompt Engineering (Kỹ thuật prompt):** Thiết kế input ngôn ngữ tự nhiên để kích hoạt hành vi mong muốn từ LLM mà không cập nhật trọng số. Chain-of-thought prompting ("Hãy suy nghĩ từng bước") cải thiện đáng kể suy luận đa bước.

**RAG (Retrieval-Augmented Generation — Sinh có tăng cường truy xuất):** Kiến trúc kết hợp tìm kiếm tài liệu real-time với sinh văn bản. Tách biệt kiến thức thực tế (trong index truy xuất) và năng lực suy luận (trong LLM), cho phép cập nhật tri thức mà không cần retrain.

**In-Context Learning (ICL — Học trong ngữ cảnh):** Khả năng của LLM lớn thích nghi với tác vụ mới chỉ từ ví dụ trong context window, không cập nhật trọng số. Xuất hiện tự nhiên ở quy mô ~GPT-3.

**Instruction Tuning (Tinh chỉnh theo chỉ thị):** Huấn luyện mô hình trên tập đa dạng các cặp (instruction, response) để mô hình tuân theo chỉ thị ngôn ngữ tự nhiên. InstructGPT mở rộng với RLHF (Reinforcement Learning from Human Feedback).

**LoRA / QLoRA:** LoRA inject ma trận rank thấp `W = W₀ + BA` vào các attention weights. QLoRA kết hợp quantization 4-bit cho base model với LoRA adapters, cho phép fine-tune 7B model trên một GPU 24GB. Đây là kỹ thuật fine-tune chuẩn mực cho team Việt Nam với ngân sách hạn chế.

#### 1.3 State of the Art (SOTA) 2024–2026

**LLM Leaderboards:** GPT-4o (~88% MMLU), Claude 3.7 Sonnet (~87%), Gemini 1.5 Pro (~86%), LLaMA 3.1 405B (~85%). Chuẩn benchmarks cũ gần như bão hòa, làm xuất hiện MMLU-Pro và GPQA Diamond.

**Multimodal NLP:** GPT-4o (text + vision + audio), Gemini 1.5 Pro (context 1M token), Claude 3.5/3.7 Sonnet (coding + vision). Multimodal NLP đã thành dòng chính.

**Efficient LLMs:** Mistral 7B, Phi-3 (3.8B), Qwen2.5, Gemma 2 — xu hướng "nhỏ nhưng mạnh" với dữ liệu huấn luyện chất lượng cao.

**Xu hướng lớn 2025–2026:**
- Long context windows (Gemini 1.5 Pro: 1M tokens; Claude 3.x: 200k tokens)
- Reasoning models (o1/o3, DeepSeek-R1, QwQ-32B) — chain-of-thought dài trước khi trả lời
- Agentic NLP — LLM như agent tự động dùng tools, code execution, web browsing
- Structured outputs (JSON mode, function calling, constrained decoding)
- MoE architectures (Mixtral, DeepSeek-V3)

#### 1.4 Hệ sinh thái NLP tiếng Việt

**Thách thức ngôn ngữ đặc thù:**
- Tiếng Việt là ngôn ngữ thanh điệu (6 thanh) — mỗi chữ cái có thể mang nghĩa khác nhau hoàn toàn tùy dấu: "ma" (ma quỷ), "má" (mẹ), "mà" (nhưng)
- Khoảng trắng phân cách âm tiết, không phải từ — "học sinh" (student) phải được tokenize là một đơn vị
- Không có hình thái học (no morphology) nhưng ngữ nghĩa phụ thuộc vào thứ tự và ngữ cảnh
- Tiếng Việt không chính thức và code-switching (pha trộn Việt-Anh) phổ biến trên mạng xã hội

**Ecosystem chính:**
- **PhoBERT** (VinAI, 2020): BERT tiền huấn luyện trên 20GB corpus tiếng Việt. State-of-the-art cho encoder tasks. Phiên bản base (135M) và large (370M).
- **PhoNLP**: pipeline kết hợp POS tagging + NER + dependency parsing trên nền PhoBERT
- **PhoGPT** (VinAI, 2023): mô hình sinh tiếng Việt đầu tiên (7.5B params)
- **Vistral-7B** (2024): fine-tune Mistral-7B cho tiếng Việt, mạnh về instruction following
- **underthesea**: thư viện NLP tiếng Việt toàn diện nhất (tokenization, POS, NER, sentiment)
- **Zalo AI**: mô hình LLM tiếng Việt proprietary, được deploy trên Zalo 100M+ users
- **FPT.AI**: bộ sản phẩm AI tiếng Việt thương mại (ASR, TTS, NLU, OCR) phục vụ 500+ doanh nghiệp
- **Qwen2.5 và SeaLLM**: multilingual model ngày càng cạnh tranh trên benchmarks tiếng Việt

**Datasets tiếng Việt công khai:**
- VLSP NER, ViQuAD (QA 23k+ cặp), UIT-VSFC (sentiment feedback 16k câu), UIT-ViSFD, PhoATIS (intent), PhoMT (machine translation)
- Tổng cộng ~15 datasets công khai — gấp 10-50 lần ít hơn tiếng Anh tương đương

---

### 2. Phân tích kỹ thuật (từ R-β)

#### 2.1 Tech Stack — Ma trận quyết định

| Tầng | Công nghệ khuyến nghị | Phiên bản | Lý do chọn |
|------|----------------------|-----------|------------|
| **Tokenization** | underthesea (tiếng Việt) + tiktoken (LLM) | 6.8.x / 0.7.x | underthesea: độ chính xác word-seg cao nhất; tiktoken: không phụ thuộc, nhanh nhất cho GPT family |
| **Embeddings** | bkai-foundation-models/vietnamese-bi-encoder | Latest HF | Recall cao nhất cho semantic search tiếng Việt; fallback: multilingual-mpnet |
| **Vector DB** | Qdrant | 1.9.x | Rust, Docker-native, filter metadata, tự host miễn phí |
| **LLM Serving** | vLLM + OpenAI API (fallback) | 0.5.x | PagedAttention throughput tốt nhất; OpenAI-compatible endpoint |
| **Fine-tuning** | PEFT + LoRA + TRL | transformers 4.44+ | LoRA fit trên 1×A100 cho 7B model; TRL cho SFT/DPO |
| **Orchestration** | LangChain / LlamaIndex | 0.3.x / 0.11.x | LangChain cho custom chains; LlamaIndex cho document-centric RAG |
| **Evaluation** | RAGAS + promptfoo | 0.1.x / 0.71.x | RAGAS không cần gold answers; promptfoo cho prompt regression |
| **Monitoring** | Langfuse (self-hosted) | 2.x | Trace-level visibility, latency/cost dashboard, Docker-deployable |

#### 2.2 Bốn pipeline kiến trúc chính

**Pipeline 1: RAG (Retrieval-Augmented Generation)**

```
Tài liệu (PDF/HTML/TXT)
    → Document Loader + underthesea tokenizer (phân từ tiếng Việt)
    → Chunker (chunk_size=512, overlap=64 tokens)
    → Embedding Model (vietnamese-bi-encoder, batch_size=64)
    → Qdrant Index (upsert với metadata: source, language, node_id)

── ONLINE QUERY PATH ──
User Query → Query Rewriter (optional HyDE)
    → Query Encoder (same embedding model)
    → Qdrant Retrieval (top-k=6, cosine similarity)
    → Re-ranker (bge-reranker-v2-m3, optional)
    → Context Assembly + Prompt Builder
    → LLM (vLLM/OpenAI API) → Final Answer + Citations
```

**Pipeline 2: LoRA Fine-tuning**

```
Raw Labeled Dataset (JSONL)
    → Data Preprocessing (underthesea + normalize)
    → Train/Val Split (80/20 stratified)
    → Base Model Load (PhoBERT hoặc Mistral/LLaMA, 4-bit QLoRA)
    → LoRA Config (r=16, alpha=32, target=q_proj/v_proj)
    → SFTTrainer/TRL (lr=2e-4, epochs=3, gradient_checkpointing)
    → Evaluation Loop (F1/accuracy per epoch)
    → Merge LoRA Weights → Save/Push
```

**Pipeline 3: Real-time Classification**

```
API Request → Input Validation (max 512 tokens, sanitize HTML)
    → Vietnamese Tokenization (underthesea fast mode)
    → PhoBERT Encoder (fine-tuned) → [CLS] embedding
    → Classification Head (softmax → label + score)
    → Response {label, score, latency_ms} + Async Logging
Latency target: P95 < 50ms (GPU)
```

**Pipeline 4: Batch NLP Processing**

```
Input: Thư mục tài liệu / DB Query
    → Job Queue (Redis/Celery)
    → Parallel Workers (N = số GPU/CPU cores)
    → NLP Worker: Load → Tokenize → Embed → Upsert Qdrant
    → NLP Worker: Load → Extract entities → Classify topics
    → Results Aggregator + Error Handler
    → Knowledge Graph Writer (Neo4j / custom DB)
Throughput: 10,000 docs/hour
```

#### 2.3 Starter stacks cho team Việt Nam

**Minimal Stack (Đội 2-3 người, 2-4 tuần, <$100/tháng):**
- underthesea + OpenAI text-embedding-3-small + Qdrant free tier + GPT-4o-mini
- Dùng cho: prototype RAG, phân loại ý định với few-shot prompting

**Mid-tier Stack (Đội 5-8 người, $600-$900/tháng, 1×A100):**
- vietnamese-bi-encoder + Qdrant self-hosted + Vistral-7B-Chat qua vLLM
- Fine-tuned PhoBERT cho classification tasks lặp lại
- Langfuse tự host cho monitoring

**Enterprise Stack (Đội 10+, on-premise, data sovereignty):**
- Toàn bộ infrastructure tự host (Qdrant cluster, vLLM multi-GPU, Langfuse)
- PhoBERT fine-tuned + Vistral/Qwen2.5 cho các domain khác nhau
- Kafka + Flink cho streaming NLP pipeline
- MLflow + W&B cho experiment tracking

---

### 3. Đánh giá khả thi (từ R-γ)

#### 3.1 Verdict và Ma trận điểm

| Chiều đánh giá | Điểm | Lý do |
|---------------|------|-------|
| **Technical Feasibility** | 8/10 | Ecosystem mã nguồn mở trưởng thành; PhoBERT, Vistral, underthesea, LangChain, Qdrant, vLLM đều production-viable. Rủi ro là khoảng cách chất lượng data training tiếng Việt và chi phí GPU tự host |
| **Market Demand** | 9/10 | Nhu cầu rõ ràng ở mọi cấp độ: toàn cầu ($50B+ NLP/LLM 2026), SEA doanh nghiệp, và đặc biệt doanh nghiệp Việt Nam dưới áp lực quy định phải địa phương hóa AI |
| **Data Availability** | 5/10 | Ràng buộc nghiêm trọng nhất: dataset có nhãn tiếng Việt nhỏ hơn 10-50× so với tiếng Anh. ~15 datasets công khai, chủ yếu trên văn bản báo chí và sinh viên — hầu như không có dataset banking, pháp lý, y tế tiếng Việt |
| **Implementation Risk** | 5/10 | Chi phí GPU cho LLM tự host đáng kể ($600-$15,000/tháng); LangChain API churn; tokenization tiếng Việt không chính thức; fallback API tạo mâu thuẫn data sovereignty |
| **Vietnam Market Fit** | 7/10 | Phù hợp mạnh cho banking NLP, dịch vụ chính phủ, tự động hóa contact center. Yếu với sản phẩm tiêu dùng (người dùng đã có ChatGPT, Gemini tiếng Việt miễn phí) |
| **Tổng thể** | **6.8/10** | **CONDITIONAL GO** |

#### 3.2 Điều kiện GO

1. Roadmap sản phẩm nhắm đến ít nhất hai trong số: NLP đặc thù tiếng Việt, NLP tuân thủ quy định ngành (ngân hàng/pháp lý/y tế), hoặc triển khai on-premise theo yêu cầu địa phương hóa dữ liệu Việt Nam
2. Đội cam kết sở hữu dữ liệu có nhãn tiếng Việt theo domain như tài sản chiến lược
3. Mô hình doanh thu gắn với kết quả (độ chính xác, tuân thủ, tiết kiệm chi phí) thay vì API access chung chung

**Nếu sản phẩm là chatbot tiếng Việt chung chung hoặc công cụ Q&A tài liệu không đáp ứng điều kiện trên: NO-GO.**

#### 3.3 Phân tích thị trường

**Thị trường NLP/LLM toàn cầu:** ~$29B (2024) → $50-65B (2026). Tăng trưởng chủ yếu ở tầng ứng dụng và giải pháp dọc, trong khi tầng API hàng hóa đang co lại nhanh chóng về biên lợi nhuận.

**Thị trường NLP Việt Nam và SEA:** SEA ~$1.2-1.8B (2024), tăng 35-40%/năm. Việt Nam chiếm ~15-18%.

**Cơ hội cụ thể tại Việt Nam:**
- Banking AML/KYC NLP: ~$80-120M TAM, 96 ngân hàng thương mại dưới quy định SBV
- Dịch vụ chính phủ điện tử: Chương trình chuyển đổi số quốc gia (Quyết định 749/QD-TTg) yêu cầu số hóa dịch vụ tất cả 63 tỉnh
- E-commerce: Shopee, Lazada, TikTok Shop, Tiki xử lý hàng trăm triệu giao tiếp tiếng Việt hàng tháng
- Telecom contact center: Viettel/VNPT/Mobifone: 20-30 triệu tương tác/tháng

**TAM/SAM/SOM:** TAM ~$200-300M/năm → SAM ~$60-90M → SOM (3 năm) ~$3-7M ARR

#### 3.4 Rủi ro chính

| # | Rủi ro | Mức độ | Biện pháp giảm thiểu |
|---|--------|--------|---------------------|
| R01 | **LLM Commoditization** — GPT-4o-class rẻ hơn 85% kể từ khi ra mắt | Critical | Phân biệt qua dữ liệu domain, tuân thủ quy định, tính năng sovereignty |
| R02 | **Hallucination trong ngành quản lý chặt** — ngân hàng, pháp lý, y tế | High | RAG với trích dẫn nguồn; RAGAS faithfulness gate; human-in-the-loop |
| R03 | **Khan hiếm dữ liệu tiếng Việt** — 10-50× ít hơn tiếng Anh | High | Hợp tác đại học (UIT/HUST/VNU); active learning; synthetic data |
| R04 | **Chi phí GPU tự host** | High | API-first cho <30M tokens/tháng; GPU cloud chỉ khi sovereignty là bắt buộc |
| R08 | **Luật An ninh mạng và Nghị định 13/2023** | High | Architecture hỗ trợ on-premise/hosted trong nước cho client được quản lý |
| R11 | **Distribution shift: tiếng Việt không chính thức** | High | Test trên corpus không chính thức trước production; normalize diacritics |

---

### 4. Góc nhìn kỹ sư thực tiễn (từ Layer 2)

#### 4.1 NLP Engineer (R-NLP) — Thực chiến quan trọng nhất

**Framework chọn model theo tác vụ:**
- Output là nhãn cố định → Classification → dữ liệu ít (<5K): few-shot GPT-4o; dữ liệu vừa (5K-100K): fine-tune BERT/RoBERTa/PhoBERT; dữ liệu nhiều (>100K): fine-tune đầy đủ
- Output là văn bản tự do → Generation → ngắn/cấu trúc: prompt engineering; dài: T5/FLAN; đa dạng/hỏi đáp: LLM instruction-tuned
- Tác vụ tìm kiếm → Bi-encoder (nhanh) → Cross-encoder (precision)

**Quy tắc quan trọng nhất:** Không bao giờ dùng mô hình sinh văn bản cho tác vụ phân loại trong production — đắt hơn 10-100×, thêm latency mà không tăng accuracy khi đã có encoder fine-tuned.

**Cạm bẫy NLP tiếng Việt:**
- Dùng stopword list tiếng Anh cho tiếng Việt
- Cắt tại 512 tokens mà không biết tiếng Việt tokenize ~1.5× token count tiếng Anh
- Đánh giá trên test set trùng nguồn website với training set

**Tối ưu chi phí LLM:** Semantic caching (GPTCache), prompt compression (LLMLingua 3-5× nén), request batching (512 doc/batch thay vì 1), smaller model routing (RouteLLM), KV cache prefix sharing.

#### 4.2 ML Engineer (R-MLE) — Fine-tuning Pipeline

Pipeline 7 giai đoạn chuẩn: Thu thập dữ liệu → Tiền xử lý → Tokenization → Khởi tạo model → Vòng lặp training → Đánh giá → Export & Serving. Tính tái tạo là bắt buộc: random seeds cố định, hyperparameters được log, phiên bản thư viện được pin.

**LoRA Rank Guidelines:**
- Phân loại đơn giản: r=4-8
- Domain adaptation: r=16 (mặc định tốt)
- Instruction following: r=32-64
- Suy luận phức tạp: r=64-128

**DPO (Direct Preference Optimization) cho LLM tiếng Việt:** Thu thập preference pairs (query, good response, bad response) từ so sánh Vistral vs GPT-4o. Không cần reward model riêng — tối ưu trực tiếp từ preference với `β=0.1-0.3`.

#### 4.3 Deep Learning Engineer (R-DLE) — Kiến trúc Transformer

Ba họ kiến trúc: Encoder-only (BERT — NLU), Decoder-only (GPT — NLG), Encoder-Decoder (T5 — seq2seq). Flash Attention 2 là bắt buộc cho production — giống kết quả nhưng 2-4× nhanh hơn và bộ nhớ O(n) thay vì O(n²). GQA/MQA giảm KV cache 4-8×, kích hoạt context dài. LoRA: nền tảng toán học là `W = W₀ + BA` — có thể merge về zero overhead sau training.

#### 4.4 Data Engineer (R-DE) — Pipeline dữ liệu

**Đặc thù tiếng Việt trong pipeline:**
- Chuẩn hóa Unicode NFC bắt buộc (tiếng Việt có 134 ký tự đặc biệt, dạng NFC vs NFD gây mismatch)
- underthesea cho word segmentation; pyvi nhẹ hơn nhưng kém chính xác hơn
- Code-switching cần classifier nhận diện đoạn pha trộn Việt-Anh trước khi tokenize

**Chunking strategies:** Fixed-size (đơn giản), semantic (tại ranh giới câu/đoạn), hierarchical (parent 1024 + child 128 tokens — chất lượng tốt nhất nhưng tốn lưu trữ gấp đôi).

#### 4.5 Backend Engineer (R-BE) — LLM API và Serving

Streaming Server-Sent Events (SSE) là chuẩn de facto cho chat UX — tránh người dùng chờ 10-30 giây không có phản hồi. OpenAI-compatible API spec (`/v1/chat/completions`, `/v1/embeddings`) cho phép hoán đổi backend không thay đổi client code.

Kiến trúc production đầy đủ:
```
Clients → API Gateway/Load Balancer (Nginx)
→ LiteLLM Gateway (rate limiting, auth, model routing, usage tracking)
→ vLLM Cluster (GPU) | Embedding Service (bge-m3)
→ Vector DB (Qdrant) | Prompt Registry | Redis Cache
→ Monitoring Stack (Prometheus + Grafana + Langfuse)
```

**Lỗ hổng bảo mật:** Prompt injection defense, output sanitization, PII redaction bằng presidio-analyzer với recognizers tùy chỉnh cho CCCD, số điện thoại Việt Nam (`(03|05|07|08|09)[0-9]{8}`).

#### 4.6 DevOps/MLOps (R-DO) — Infrastructure

**Lựa chọn cloud từ Việt Nam:**
- AWS ap-southeast-1 (Singapore): hệ sinh thái tốt nhất, p4d.24xlarge (8×A100), 15-25ms latency từ HN/HCM
- GCP asia-southeast1: A100 VMs, BigQuery/Dataflow mạnh
- Viettel Cloud: GPU trong nước (~1-5ms latency), phù hợp dữ liệu nhạy cảm không thể rời Việt Nam

**llama.cpp CPU không GPU:** Cho doanh nghiệp Việt Nam không có GPU, deploy Vistral-7B-Chat GGUF trên server 32-core (AMD EPYC), đạt 15-25 tok/s — đủ cho công cụ nội bộ 5-15 user đồng thời. Chi phí ~$3,000 used server.

#### 4.7 QA Engineer (R-QA) — Testing và Đánh giá

**Metrics theo loại tác vụ:**
- Classification: Macro F1 (xử lý class imbalance)
- Generation: BLEU (dịch), ROUGE-L (tóm tắt), BERTScore (ngữ nghĩa, dùng XLM-R cho tiếng Việt)
- RAG: RAGAS 4 chiều (Faithfulness, Answer Relevancy, Context Precision, Context Recall)
- LLM-as-Judge: GPT-4o hoặc Claude Opus làm judge với rubric cụ thể

**CI/CD Quality Gates:** F1 ≥ 0.88 trên test set chuẩn, RAGAS faithfulness ≥ 0.85, P95 latency ≤ SLA, BLEU không giảm >2 điểm so với baseline.

**Đặc thù QA tiếng Việt:** Test cặp tối thiểu thanh điệu ("ma" vs "má" vs "mà"), code-switching ("deploy lên server"), dialect testing (Bắc vs Nam).

#### 4.8 Solution Architect (R-SA) — Pattern kiến trúc

Bốn pattern kiến trúc doanh nghiệp:
1. **Classification Pipeline** — Đồng bộ, <100ms, horizontally scalable
2. **RAG System** — Grounded generation từ knowledge base nội bộ, 1-5s latency, pattern phù hợp nhất cho doanh nghiệp Việt Nam 2025-2026
3. **Conversational Chatbot** — Multi-turn với session management (Redis), tích hợp Zalo OA API (platform nhắn tin chủ đạo 70M+ user)
4. **Batch Processing Pipeline** — Async, Celery+Redis, cho tóm tắt báo cáo nightly, phân tích hợp đồng hàng loạt

---

### 5. Góc nhìn ngành (từ Layer 2)

#### 5.1 Manufacturing (D04) — NLP cho Sản xuất

Việt Nam là hub sản xuất hàng đầu Đông Nam Á. NLP tạo giá trị ngay lập tức bằng cách chuyển đổi văn bản phi cấu trúc — nhật ký bảo trì, báo cáo lỗi, tài liệu SOP, email nhà cung cấp — thành thông tin có cấu trúc và hành động.

**Ứng dụng ưu tiên cao nhất:**

1. **Phân tích báo cáo bảo trì (Maintenance Report Analysis):** Kỹ thuật viên viết mô tả tự do về sự cố thiết bị. NLP trích xuất: loại lỗi, ID thiết bị, nguyên nhân gốc, hành động sửa chữa. Dự đoán hỏng hóc từ lịch sử: giảm 15-25% downtime không lên kế hoạch.

2. **Phân loại lỗi (NCR/Defect Classification):** Báo cáo NCR tiếng Việt tự động phân loại theo taxonomy mã lỗi chuẩn. PhoBERT fine-tune trên dataset domain đạt 90-95% F1 với 20-class taxonomy. Loại bỏ 2-4 giờ/ngày phân loại thủ công mỗi quality engineer.

3. **SOP Document QA:** Worker hỏi: "Thông số momen lực cho bước 7 dây chuyền 3 là bao nhiêu?" — RAG system trên thư viện SOP trả lời trong vài giây, giảm thời gian tìm trong PDF.

4. **ERP Document Extraction:** Purchase orders, delivery notes tiếng Việt tự động parse để trích xuất trường cấu trúc vào SAP/Oracle. Giảm lỗi nhập liệu, từ giờ xuống giây.

**Thách thức dữ liệu đặc thù:**
- Thuật ngữ và viết tắt nội bộ công ty ("KCS", "BTP") không có trong model chung
- Văn bản nhà máy pha trộn Việt/Anh/Hoa trong một tài liệu
- OCR noise từ tài liệu scan — diacritics tiếng Việt bị mất

**ROI ước tính** cho nhà máy vừa (1,000 nhân viên): ~$88,000/năm (phân loại lỗi + phân tích bảo trì + SOP bot + trích xuất ERP), chi phí triển khai $30,000-$60,000, hoàn vốn 6-12 tháng.

#### 5.2 Education (D09) — NLP cho Giáo dục

Thị trường edtech Việt Nam tăng trưởng mạnh với nhu cầu đặc biệt từ kỳ thi THPTQG (~1 triệu học sinh/năm) và thị trường học tiếng Anh lớn nhất Đông Nam Á.

**Ứng dụng ưu tiên cao nhất:**

1. **Chấm bài luận tiếng Việt (Vietnamese Essay Grading Assistant):** Bài Ngữ văn kỳ thi quốc gia chấm hoàn toàn thủ công — tốn thời gian. LLM-based assistant (không hoàn toàn tự động) cung cấp điểm nháp + phản hồi theo rubric cho giáo viên xem xét và ghi đè. Giảm 60-70% thời gian chấm. Chain-of-thought prompting với few-shot examples từ bài chấm của con người. Human-in-the-loop là bắt buộc cho chấp nhận của giáo viên và Bộ GD&ĐT.

2. **Chatbot học tiếng Anh:** AI tutor hội thoại cho người học ở trình độ A2-B2 CEFR: sửa lỗi ngữ pháp với giải thích, luyện từ vựng trong ngữ cảnh, mô phỏng hội thoại (phỏng vấn xin việc, du lịch). GPT-4o/Claude 3.5 với system prompt tiếng Việt-aware. ELSA Speak (30M+ users) là mô hình thành công. Tiềm năng doanh thu: ~$200,000/năm từ nâng cấp premium cho nền tảng 100,000 học sinh.

3. **Sinh câu hỏi thi (Exam Question Bank Generation):** Tự động sinh câu hỏi trắc nghiệm và tự luận phong cách THPTQG từ chủ đề, lớp và tham số độ khó. Quality filter bằng LLM pass thứ hai. Giảm chi phí sản xuất nội dung 40%.

4. **Phân tích phản hồi học sinh (Student Feedback Sentiment):** UIT-VSFC dataset (16k câu feedback) cho sentiment analysis tiếng Việt, phân loại chủ đề (giảng dạy, nội dung, thi cử), tracking xu hướng theo thời gian.

**Thách thức:**
- Văn phong học thuật tiếng Việt khác biệt đáng kể so với corpus web crawl
- Không có dataset công khai chấm điểm bài luận tiếng Việt (tương đương ASAP trong tiếng Anh)
- Rủi ro hallucination trong AI tutor — AI gia sư trả lời sai còn tệ hơn không có AI tutor
- Quyền riêng tư dữ liệu học sinh vị thành niên theo Nghị định 13/2023

---

### 6. Phần đặc biệt: NLP tiếng Việt

#### 6.1 Thách thức ngôn ngữ học

Tiếng Việt tạo ra những thách thức kỹ thuật đặc thù mà không thể giải quyết bằng cách sao chép giải pháp NLP tiếng Anh:

**Thanh điệu (Tones):** 6 thanh điệu thay đổi hoàn toàn nghĩa của từ. Diacritics trong Unicode có dạng NFC (precomposed) và NFD (decomposed) — mismatch âm thầm phá hủy tokenization. Quy tắc cứng: luôn normalize về NFC trước tất cả NLP processing.

**Phân đoạn từ (Word Segmentation):** Khoảng trắng phân cách âm tiết, không phải từ. "học sinh" (2 âm tiết, 1 từ). underthesea word_tokenize: 95%+ accuracy trên văn bản chính thức, nhưng giảm xuống 80-85% trên tiếng Việt không chính thức mạng xã hội — đây là **distribution shift thầm lặng nguy hiểm** trong production.

**Code-switching:** Tiếng Việt kinh doanh và kỹ thuật pha trộn Việt-Anh: "deploy lên server", "fix bug trong module thanh toán". Tokenizer thuần tiếng Việt thất bại trên các đoạn tiếng Anh. Cần classifier nhận diện code-switching.

**Tiếng Việt không chính thức:** Teencode, viết tắt, ngữ điệu vùng miền trên mạng xã hội khác hoàn toàn với văn bản học thuật/báo chí mà hầu hết models được train. Đây là **vấn đề nghiêm trọng nhất bị đánh giá thấp** trong nhiều triển khai thực tế.

#### 6.2 Hệ sinh thái công cụ

**underthesea** (open-source):
- Word segmentation, POS tagging, NER, dependency parsing, sentiment
- Khuyến nghị: `word_tokenize(text, format="text")` với `use_threads=True`
- Cảnh báo: train trên corpus chính thức — hiệu suất giảm đáng kể với informal Vietnamese

**PhoBERT** (VinAI):
- Model: `vinai/phobert-base-v2` (135M params) và `vinai/phobert-large` (370M)
- PhoBERT-base cho classification; PhoBERT-large cho NER/QA
- Fine-tune với LoRA: r=16, lora_alpha=32, target modules: `query`, `value`
- Break-even với GPT-4o-mini: ~500,000 classification requests/tháng

**PhoNLP**: Joint model cho POS + NER + dependency trên nền PhoBERT

**Vietnamese bi-encoder** (`bkai-foundation-models/vietnamese-bi-encoder`):
- Tốt nhất cho semantic search tiếng Việt
- Fallback: `intfloat/multilingual-e5-large` hoặc `BAAI/bge-m3`

**Vistral-7B-Chat**: Instruction-tuned Vietnamese Mistral-based, phù hợp data sovereignty deployments. GGUF quantized cho CPU inference trên-cơ-sở.

**Qwen2.5**: Multilingual open-weights, cạnh tranh trên benchmarks tiếng Việt, hỗ trợ 128k context, phiên bản 0.5B-72B.

#### 6.3 Datasets công khai tiếng Việt

| Dataset | Tác vụ | Kích thước | Nguồn |
|---------|--------|-----------|-------|
| ViQuAD | Question Answering | 23,000+ cặp Q&A | Wikipedia tiếng Việt |
| UIT-VSFC | Sentiment (feedback sinh viên) | 16,000 câu | UIT |
| VLSP NER | Named Entity Recognition | 16,861 câu | VLSP Workshop |
| UIT-ViSFD | Sentiment (sản phẩm) | ~11,000 đánh giá | UIT |
| PhoATIS | Intent Detection | 4,478 câu | ATIS tiếng Việt |
| PhoMT | Machine Translation | 3.02M cặp Vi-En | VinAI |
| VLSP Parsing | Dependency Parsing | ~10,000 câu | VLSP Workshop |

**Tình trạng:** Chủ yếu tập trung vào văn bản tin tức và phản hồi sinh viên. **Không có** dataset chất lượng cao cho banking compliance, hợp đồng pháp lý, hay hồ sơ y tế tiếng Việt — đây là khoảng trắng chiến lược.

---

### 7. Khuyến nghị tổng hợp

#### 7.1 Stack theo 3 tầng

```
─── Minimal Stack (MVP) ───────────────────────────────────
Đội: 2-3 người | Timeline: 2-4 tuần | Chi phí: <$100/tháng
underthesea + OpenAI text-embedding-3-small + Qdrant (free)
+ GPT-4o-mini API + LangChain + Langfuse cloud
Dùng cho: prototype RAG, PoC phân loại ý định

─── Mid-tier Stack ────────────────────────────────────────
Đội: 5-8 người | Timeline: 1-3 tháng | Chi phí: $600-$900/tháng
vietnamese-bi-encoder + Qdrant self-hosted + vLLM + Vistral-7B
+ PhoBERT fine-tuned (LoRA) cho classification
+ Langfuse self-hosted + RAGAS evaluation
Dùng cho: production NLP, data sensitivity vừa, volume cao

─── Enterprise Stack ──────────────────────────────────────
Đội: 10+ người | Timeline: 3-6 tháng | Chi phí: $5,000-$15,000/tháng
Full on-premise: Qdrant cluster + vLLM multi-GPU + Langfuse
+ PhoBERT domain fine-tune + Qwen2.5-7B/72B hoặc Vistral-7B
+ Kafka + Flink cho streaming + MLflow + W&B
+ LiteLLM gateway cho model routing
Dùng cho: banking/gov/healthcare, data sovereignty bắt buộc
```

#### 7.2 Roadmap khuyến nghị

**MVP (0-3 tháng):**
- Kiểm tra dữ liệu: kiểm kê dataset tiếng Việt hiện có theo domain
- Deploy Minimal Stack: RAG trên tài liệu nội bộ, validate chất lượng tiếng Việt
- Chọn một vertical đi sâu (khuyến nghị: banking NLP compliance)
- Xây dựng posture tuân thủ pháp lý cho Nghị định 13/2023

**Production v1 (3-12 tháng):**
- Thu thập 5,000-20,000 ví dụ có nhãn theo domain đã chọn
- Fine-tune PhoBERT-LoRA cho tác vụ phân loại cốt lõi
- Triển khai infrastructure data sovereignty (Qdrant + vLLM + Langfuse tự host)
- Tích hợp RAGAS automated evaluation vào CI/CD pipeline

**Enterprise (12+ tháng):**
- Multi-domain instruction tuning khi datasets đủ 2-3 ngành
- Xây dựng flywheel monitoring → retraining: log production → human review (2%) → annotation failures → model update hàng quý
- Đánh giá mở rộng multimodal (LayoutLMv3/Donut cho tài liệu Việt Nam hỗn hợp)
- Chuẩn bị AI impact assessment documentation theo dự thảo Nghị định AI (2025)

#### 7.3 Điểm mạnh và rủi ro cần theo dõi

**Điểm mạnh:**
- PhoBERT + LoRA là điểm ngọt nhất cho NLP tiếng Việt với ràng buộc ngân sách — vượt trội GPT-4o-mini cho tác vụ phân loại hẹp ở 1/10 chi phí inference khi volume đủ lớn
- Data sovereignty requirements tạo **moat tự nhiên** chống lại OpenAI/Anthropic cho banking và government clients
- Ecosystem mã nguồn mở đã đủ trưởng thành — không cần huấn luyện từ đầu

**Rủi ro cần theo dõi chặt chẽ:**
- Tốc độ giảm giá LLM API: GPT-4o-mini ~$0.15/1M token (2026), có thể $0.02/1M (2028) — mọi business case dựa trên giá API hiện tại cần được xem xét lại thường xuyên
- Vietnamese informal text distribution shift: underthesea accuracy 80-85% trên social media — test trên corpus thực trước khi cam kết với client
- LangChain API churn: phiên bản thay đổi nhanh, abstraction layer có thể phá vỡ production code

---

### 8. Checklist chất lượng

- [x] ≥10 core concepts (12 đã được ghi lại)
- [x] ≥12 algorithms/models (14 trong catalog)
- [x] Tech stack justified theo tầng và use case
- [x] ≥4 pipeline diagrams (RAG, Fine-tuning, Classification, Batch)
- [x] ≥5 Vietnamese use cases (banking, manufacturing, education, e-commerce, government)
- [x] ≥3 case studies (Manufacturing NCR, Education Essay Grading, Banking AML/KYC)
- [x] ≥10 resources (documented trong B04-nlp.json)
- [x] ≥5 related nodes (B02, B03, B08, B09, B11, B12)
- [x] JSON draft created (B04-nlp.json)
- [x] graph.json updated (B04 node + 7 edges)

---

### 9. Tranh luận & điểm bất đồng

**Thách thức 1 (R-γ vs R-α): Mô tả "emerging" về khoảng cách dữ liệu tiếng Việt quá lạc quan**

R-α ghi nhận khoảng cách dữ liệu tiếng Việt đang thu hẹp nhờ multilingual models. R-γ phản bác: điều này đúng cho model coverage nhưng sai cho domain-specific supervised NLP. 15 datasets công khai tiếng Việt tập trung vào tin tức và feedback sinh viên — **không có** dataset chất lượng cao cho banking compliance, pháp lý hay y tế. Building production NLP cho các vertical này bắt đầu từ zero annotation data — là vấn đề $200,000-$500,000 và 12-18 tháng, không phải vấn đề chọn thư viện.

**Thách thức 2 (R-γ vs R-β): Ước tính chi phí giả định load liên tục mà hầu hết SME Việt Nam không có**

R-β đề xuất mid-tier stack $600-$900/tháng hợp lý ở 50,000+ requests/ngày. R-γ chỉ ra: hầu hết Vietnamese enterprise NLP deployment đầu tiên xử lý 500-5,000 requests/ngày — dưới điểm hòa vốn GPU self-hosting. Ở volume này, GPT-4o-mini API tốn $3-30/tháng so với A100 server 20-300× đắt hơn. R-β nên cung cấp khung quyết định chỉ định ngưỡng volume khi tự host trở nên hợp lý kinh tế (~30-50M tokens/tháng với giá API hiện tại).

**Thách thức 3 (R-γ vs R-β): Kiến trúc fallback tạo mâu thuẫn data sovereignty**

Pattern "vLLM → OpenAI API fallback" của R-β là thanh lịch về mặt kỹ thuật nhưng tạo vấn đề nghiêm trọng: client chọn self-hosted để tuân thủ yêu cầu địa phương hóa dữ liệu Việt Nam. Khi infrastructure tự host lỗi, fallback tự động gửi dữ liệu khách hàng Việt Nam đến server Mỹ — đây là vi phạm tiềm năng Luật An ninh mạng 2018 và Nghị định 13/2023. **Giải pháp:** Client sovereignty phải có local fallback (model nhỏ hơn on-premise, degraded service mode) thay vì API fallback.

**Thách thức 4 (R-γ vs R-α): Understate vấn đề informal Vietnamese text trong production**

R-α đề cập thách thức ngôn ngữ tiếng Việt như vấn đề preprocessing với giải pháp đã biết. R-γ phản bác: distribution shift tiếng Việt không chính thức là **quality killer thầm lặng** trong production. underthesea accuracy giảm từ 95%+ (văn bản chính thức) xuống 80-85% (social media tiếng Việt). Degradation này lan truyền qua toàn bộ pipeline. None of the 15 Vietnamese public datasets đủ lớn để đại diện cho tiếng Việt không chính thức ở quy mô có ý nghĩa.

**Thách thức 5 (R-γ): Cảnh báo về agentic NLP quá sớm**

R-α và R-β đề cập agentic NLP như xu hướng quan trọng 2025. R-γ cảnh báo: agentic NLP trong production có profile rủi ro hoàn toàn khác (unintended side effects, compound hallucination chains, tool injection vulnerabilities). Với doanh nghiệp Việt Nam cần xây dựng niềm tin AI từng bước, **khuyến nghị ở augmented-human mode ít nhất 18 tháng** trước khi chuyển sang autonomous agent deployment.

**Vị trí được hòa giải:** Không tranh luận nào chưa được giải quyết — R-γ challenges được tích hợp vào stack recommendations (quyết định API-first cho volume thấp, segmentation sovereignty trong architecture, informal text testing protocol).

---

### 10. Câu hỏi còn mở

1. **Ngưỡng volume tự host cụ thể cho 2026:** Với tốc độ giảm giá API 40-60%/năm, ngưỡng 30-50M tokens/tháng có thể di chuyển lên 100M+ vào năm 2027. Team nên tạo spreadsheet tracking chi phí cập nhật định kỳ mỗi quý thay vì dùng ước tính tĩnh.

2. **Xử lý tiếng Việt chuẩn của Qwen2.5 so với PhoBERT fine-tuned:** Cần benchmark thực nghiệm head-to-head trên Vietnamese domain tasks cụ thể (banking intent classification, NCR categorization). Khuyến nghị của R-γ: chạy benchmark 100 sample Việt Nam từ target domain trước bất kỳ quyết định kiến trúc nào.

3. **Khi nào dữ liệu domain đủ để justify fine-tune LLM generative:** PhoBERT encoder cho classification rõ ràng ở 500K+ requests/tháng. Nhưng fine-tune LLM generative (Vistral/LLaMA-3) cho generation tasks có break-even ít rõ ràng hơn — phụ thuộc nhiều vào chất lượng dataset, complexity của tác vụ, và khoảng cách giữa zero-shot prompting và chất lượng cần thiết.

4. **Khung pháp lý AI (Dự thảo Nghị định MOST 2025):** Khi finalized, điều này có thể áp đặt yêu cầu conformity assessment trước khi deploy NLP trong healthcare/finance/education. Team nên có người theo dõi quy trình lập pháp và chuẩn bị tài liệu AI impact assessment ngay từ bây giờ.

5. **Multimodal Vietnamese NLP:** Tài liệu hỗn hợp Việt Nam (form chính phủ scan tay, hợp đồng Việt-Anh với con dấu) là niche chưa được phục vụ — LayoutLMv3/Donut cho tài liệu Việt Nam kết hợp vision + language. Đây là extension tự nhiên nhưng cần đánh giá thêm về dataset availability.

---

*Báo cáo này được tổng hợp bởi Ms. Scribe (R-σ), Chief Knowledge Officer, MAESTRO Knowledge Graph Platform. Tổng hợp từ 13 input reports của Layer 1 và Layer 2 agents. Phase 1 — Module B04 Natural Language Processing. Ngày: 2026-03-31.*
