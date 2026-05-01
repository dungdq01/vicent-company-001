# Bao cao Tong hop: Conversational AI & Chatbots (B08)
## Boi Ms. Scribe (R-sigma) — Ngay: 2026-03-31

---

## Tom tat Dieu hanh

B08 Conversational AI & Chatbots dat **7.0/10** — Verdict: **CONDITIONAL GO**. Thi truong chatbot Viet Nam uoc tinh $50-100M nam 2026, tang truong 25-35%/nam, voi nhu cau manh tu ngan hang (Vietcombank, MB Bank), thuong mai dien tu (Tiki, Shopee), vien thong (Viettel, VNPT) va chinh phu dien tu. Cong nghe da chin muoi — tu rule-based FAQ bot den RAG va agentic LLM — nhung thanh cong phu thuoc vao chien luoc san pham phan tang (tiered): Bot Lite cho SME ($99-199/thang, khong can LLM), Bot Smart cho mid-market ($499-1,999/thang, RAG + LLM nho), va Bot Enterprise cho doanh nghiep lon ($5,000+/thang, agentic + on-premise). Dieu kien GO la: (1) tich hop Zalo OA tu ngay dau tien, (2) xay dung Vietnamese evaluation benchmark 500+ mau truoc khi xay san pham, (3) bat dau voi 1 nganh doc (ngan hang trung binh hoac e-commerce) thay vi lam nen tang ngang, va (4) kiem soat chi phi LLM inference nghiem ngat de phu hop muc gia doanh nghiep Viet Nam san sang tra.

---

## Phan 1: Tong hop Nghien cuu (R-alpha)

### 1.1 Phan loai linh vuc

Conversational AI & Chatbots nam trong cay phan loai: **Artificial Intelligence > Natural Language Processing (Xu ly ngon ngu tu nhien) > Dialogue Systems (He thong doi thoai)**. Day la giao diem cua NLU (hieu ngon ngu), NLG (sinh ngon ngu), Information Retrieval (truy xuat thong tin), va Reinforcement Learning (hoc tang cuong).

**6 linh vuc con (sub-fields):**

| # | Sub-field | Mo ta |
|---|-----------|-------|
| 1 | Task-Oriented Dialogue (Doi thoai huong nhiem vu) | He thong thuc hien muc tieu cu the: dat lich, ho tro khach hang, IT helpdesk. Dung intent-slot framework va dialogue state tracking |
| 2 | Open-Domain Chat (Tro chuyen mo) | Hoi thoai tu do khong co muc tieu co dinh — tap trung vao su tu nhien, nhat quan, va an toan (Meena, BlenderBot, Character.AI) |
| 3 | Question Answering (Hoi dap) | QA trich xuat, tom tat, va sinh tu tai lieu hoac knowledge base. Bao gom conversational QA da luot |
| 4 | Retrieval-Augmented Generation (Sinh ket hop truy xuat) | Ket hop truy xuat tai lieu voi sinh van ban, giam hallucination va cap nhat kien thuc khong can re-train |
| 5 | Voice Assistants (Tro ly giong noi) | He thong doi thoai bang giong noi tich hop ASR, NLU, NLG, TTS. Xu huong 2025-2026 la speech-to-speech LLM |
| 6 | Multimodal Conversational AI (AI hoi thoai da phuong thuc) | Xu ly va sinh dong thoi van ban, hinh anh, am thanh trong hoi thoai (GPT-4o, Gemini 2.0, Claude) |

**Lien ket voi cac baseline khac:** B04 (NLP — nen tang), B02 (Document Intelligence — tai lieu), B09 (Generative AI — sinh noi dung), B10 (Agentic AI — agent tu dong), B11 (Knowledge Graphs — co so kien thuc), B12 (Search & RAG — tim kiem).

### 1.2 Cac khai niem cot loi (>=8)

| # | Khai niem | Mo ta ngan gon |
|---|-----------|----------------|
| 1 | **Intent Recognition** (Nhan dien y dinh) | Phan loai cau noi nguoi dung thanh hanh dong cu the (vd: "huy don hang" -> `cancel_order`). Truoc dung SVM/TF-IDF, nay dung BERT fine-tune hoac LLM implicit understanding |
| 2 | **Slot Filling / Entity Extraction** (Trich xuat thuc the) | Trich cac tham so tu cau noi: "Dat ve tu Ha Noi di Tokyo ngay 15/3" -> origin=Ha Noi, dest=Tokyo, date=15/3. Dung BIO tagging hoac LLM function calling |
| 3 | **Dialogue Management** (Quan ly hoi thoai) | Quyet dinh hanh dong tiep theo cua he thong. Ba cach tiep can: rule-based/state machine (du doan duoc, de audit), neural (hoc tu du lieu), va LLM-as-DM (linh hoat nhung kho dam bao tuan thu quy tac) |
| 4 | **Context Window & Memory** (Cua so ngu canh va bo nho) | Gioi han token LLM xu ly trong 1 lan (128K-2M tokens). Khi vuot gioi han, can chien luoc: truncation, summarization, hierarchical memory, hoac retrieval-based memory (kien truc MemGPT/Letta) |
| 5 | **RAG Pipeline** (Quy trinh sinh ket hop truy xuat) | Indexing (chunk tai lieu -> embedding -> vector DB) -> Retrieval (tim chunk lien quan) -> Reranking (cross-encoder) -> Generation (LLM sinh cau tra loi tu context). Phuong phap chuan cho chatbot doanh nghiep |
| 6 | **Prompt Engineering & ICL** (Thiet ke prompt va hoc trong ngu canh) | Thiet ke system prompt, few-shot examples, Chain-of-Thought, structured output. Day la giao dien chinh de dieu khien hanh vi chatbot ma khong can fine-tune |
| 7 | **Guardrails & Safety** (Rao chan an toan) | Input: phat hien prompt injection, loc PII, chan noi dung cam. Output: kiem tra toxicity, xac minh nguon trich dan. System: Constitutional AI, tool-use permissions, chuyen tiep nguoi that (human-in-the-loop) |
| 8 | **Hallucination Detection** (Phat hien thong tin bia dat) | LLM tao thong tin sai hoac khong co co so. Phat hien bang: self-consistency, source attribution, NLI verification, LLM-as-judge. Giam thieu bang RAG grounding, constrained decoding, confidence thresholds |
| 9 | **Multi-Turn Conversation** (Quan ly hoi thoai nhieu luot) | Giai quyet coreference ("no" chi gi?), theo doi topic, sua hieu lam, duy tri trang thai qua nhieu phien. LLM hien dai xu ly ngam qua causal attention tren lich su hoi thoai |
| 10 | **Fine-Tuning vs Few-Shot** (Tinh chinh vs hoc tu vi du) | Pho chua tinh: zero-shot (khong du lieu) -> few-shot (3-20 vi du) -> LoRA/QLoRA (500-10K mau) -> full fine-tune (1K-100K+ mau) -> RLHF/DPO (10K-100K cap uu tien). Phan lon chatbot doanh nghiep 2025-2026 bat dau bang zero/few-shot |

### 1.3 Thuat toan chinh (>=8)

| # | Thuat toan | Ban chat | Ung dung |
|---|------------|---------|----------|
| 1 | **Rule-Based / Decision Tree** | Pattern matching, regex, FSM. Du doan 100%, khong hallucination | FAQ bot, IVR, transactional flow. Van la lop dieu phoi trong he thong hybrid 2026 |
| 2 | **Seq2Seq with Attention** | Encoder-decoder voi co che attention (Bahdanau 2015). Lich su quan trong nhung da bi thay the | Gia tri lich su — la buoc dem den Transformer |
| 3 | **Transformer-Based LLMs** | Decoder-only Transformer + RLHF/DPO alignment. GPT-4o, Claude Opus 4, Llama 4, Gemini 2.0 | Xu ly moi loai hoi thoai — tu FAQ den suy luan phuc tap. Backbone cua moi chatbot hien dai |
| 4 | **RAG (Dense Retriever + Generator)** | Embed query -> ANN search -> hybrid retrieval -> rerank -> LLM generate tu context | Chatbot doanh nghiep can tra loi tu knowledge base noi bo. Giam hallucination, cap nhat kien thuc de dang |
| 5 | **ReAct / Tool-Use Agents** | LLM xen ke suy nghi (Thought) va hanh dong (Action: goi API/tool). MCP chuan hoa tool calling | Chatbot can thuc thi: tra cuu don hang, dat lich, truy van database. Xu huong agentic 2025-2026 |
| 6 | **RLHF / DPO Alignment** | RLHF: SFT -> reward model -> PPO. DPO: toi uu truc tiep tu cap preference, don gian hon | Dieu chinh LLM cho helpful, harmless, honest. DPO/KTO/ORPO la xu huong chinh vi don gian |
| 7 | **Dialogue State Tracking** | Duy tri belief state {domain, slot, value} qua cac luot hoi thoai | Task-oriented bot: dat phong khach san, mua ve. LLM-based DST dat >65% joint goal accuracy tren MultiWOZ |
| 8 | **Multi-Agent Systems** | Nhieu agent chuyen biet hop tac: router dinh tuyen, specialist xu ly, quality-checker kiem tra | Customer service phan phong ban, workflow phuc tap can nhieu tool-set. Framework: LangGraph, CrewAI, AutoGen |
| 9 | **Hybrid Rules + LLM** | Intent router -> known intent dung rule-based, unknown/complex dung LLM + RAG, safety trigger chuyen nguoi | Kien truc san xuat pho bien nhat 2025-2026. Can bang giua du doan duoc va linh hoat |

### 1.4 Bai bao quan trong

| # | Bai bao | Nam | Dong gop cho B08 |
|---|---------|-----|------------------|
| 1 | **Attention Is All You Need** (Vaswani et al.) | 2017 | Kien truc Transformer — nen tang cua moi he thong conversational AI hien dai |
| 2 | **BERT** (Devlin et al.) | 2018 | Mo hinh encoder chuan cho intent classification, slot filling, dense retrieval trong dialogue |
| 3 | **GPT-3** (Brown et al.) | 2020 | Chung minh in-context learning — 1 LLM thay the ca pipeline NLU/NLG/DM chuyen biet |
| 4 | **RAG** (Lewis et al.) | 2020 | Ket hop retrieval + generation — phuong phap chuan cho chatbot doanh nghiep, giai quyet hallucination |
| 5 | **InstructGPT / RLHF** (Ouyang et al.) | 2022 | Pipeline SFT -> Reward Model -> PPO bien LLM thanh chatbot that su huu ich. Nen tang ChatGPT |
| 6 | **Constitutional AI** (Bai et al.) | 2022 | RLAIF — huan luyen an toan qua tu phe binh theo nguyen tac, giam phu thuoc annotation con nguoi |
| 7 | **GPT-4 Technical Report** (OpenAI) | 2023 | Thiet lap nguong hieu suat frontier va multimodal conversation |
| 8 | **Llama 2 Chat** (Touvron et al.) | 2023 | Dan chu hoa conversational AI — open-weight cho self-hosting, Ghost Attention cho multi-turn |
| 9 | **DPO** (Rafailov et al.) | 2023 | Don gian hoa alignment khong can reward model rieng — mo cua cho team nho tuy chinh chatbot |
| 10 | **Tien bo 2025-2026** | 2025-26 | Extended thinking (o1/o3, Claude), agentic chatbot (MCP, computer use), speech-to-speech native, on-device LLM |

### 1.5 Dong thoi gian phat trien

| Giai doan | Moc quan trong |
|-----------|---------------|
| 1966-1995 | ELIZA (1966, pattern matching), PARRY (1972, rule-based), ALICE/AIML (1995, Loebner Prize) |
| 2011-2016 | Siri (2011), Seq2Seq dialogue (2014), Messenger Bot Platform & Dialogflow (2016) — chatbot platform bung no |
| 2017-2019 | Transformer (2017), BERT (2018) cach mang NLU — intent classification va entity extraction thay doi hoan toan |
| 2020-2021 | GPT-3 va RAG (2020) — in-context learning va knowledge-grounded chatbot |
| 2022 | ChatGPT ra mat (11/2022) — 100M user trong 2 thang. RLHF va Constitutional AI lam LLM tro thanh chatbot that su |
| 2023 | GPT-4 multimodal, Llama 2 open-weight, function calling/tool use chuan hoa, DPO don gian alignment |
| 2024 | GPT-4o (voice + vision real-time), Claude 3.5 Sonnet (computer use), Gemini 1.5 (1M context), MCP protocol, reasoning model o1 |
| 2025-2026 | Claude Opus 4 (agentic), Llama 4 MoE, Gemini 2.0 (2M context), DeepSeek-R1, speech-to-speech native, multi-agent production, on-device chatbot |

---

## Phan 2: Kien truc Ky thuat (R-beta)

### 2.1 Kien truc tham chieu (3 tiers)

**Tier 1 — Simple (Rule-Based / Intent Classifier):**
User Input -> Preprocessor (normalize) -> Intent Classifier (regex/keyword/ML nho) -> Response Template (theo intent) -> Output. **Khi nao dung:** FAQ bot <50 intent, IVR menu, transactional flow don gian. Chi phi LLM = 0. Phu hop Bot Lite ($99-199/thang) cho SME Viet Nam.

**Tier 2 — Intermediate (RAG-Based):**
User Message -> Embedding Model -> Vector Search (ChromaDB/Qdrant) -> Reranker (Cross-Encoder) -> Prompt Assembly (system prompt + context + history) -> LLM (Claude/GPT/Llama) -> Safety Filter -> Response. **Khi nao dung:** Knowledge-base Q&A, ho tro khach hang tren noi dung da biet. Chi phi ~$0.01-0.10/cuoc hoi thoai. Phu hop Bot Smart ($499-1,999/thang).

**Tier 3 — Advanced (Agentic):**
User Message -> Router/Orchestrator -> Intent Classification -> phan luong: FAQ (RAG Pipeline), Action (Tool Executor + External APIs/MCP), Complex (Planner Agent), Escalate (Human Handoff) -> LLM Generator -> Safety Guardrails -> Response + Actions. Co Conversation Memory va Vector DB Knowledge. **Khi nao dung:** Full customer service platform, enterprise assistant voi tool access. Chi phi ~$0.05-0.50/cuoc hoi thoai. Phu hop Bot Enterprise ($5,000+/thang).

**Luu y tu R-gamma:** 70-80% trien khai chatbot Viet Nam la FAQ bot <100 cau hoi. Tier 1 phuc vu phan khuc lon nhat. Bao cao ky thuat nen uu tien Tier 1-2 cho ngay 1, Tier 3 la upsell.

### 2.2 Cong nghe de xuat

| Hang muc | Cong nghe | Ly do chon |
|----------|-----------|------------|
| **LLM chinh** | Claude API (Anthropic) | 200K context, tool use, instruction following tot nhat. Dung cho response chat luong cao |
| **LLM tiet kiem** | GPT-4o-mini / DeepSeek API | Chi phi thap ($0.15-0.60/M token). Dung cho query don gian, model routing |
| **LLM self-host (Phase 2+)** | Llama 3.1/4 qua vLLM | Chi khi API spend >$5,000-10,000/thang. GPU tai VN dat va khan hiem |
| **Embedding** | BGE-M3 (BAAI) | Da ngon ngu bao gom tieng Viet, self-host duoc, ho tro dense+sparse+colbert |
| **Vector DB** | Qdrant (production), ChromaDB (prototype) | Qdrant: Rust, nhanh, multi-tenant. ChromaDB: zero-config cho prototype |
| **Orchestration** | LangChain + LangGraph | LangChain cho RAG pipeline, LangGraph cho agentic workflow stateful |
| **NLP tieng Viet** | underthesea (tach tu), PhoBERT (intent/NER) | underthesea: Python-native. PhoBERT: RoBERTa cho tieng Viet, do chinh xac cao |
| **Chat UI** | Vercel AI SDK (production), Chainlit (prototype) | Vercel AI SDK: React/Next.js streaming. Chainlit: nhanh cho demo |
| **Observability** | Langfuse | Open-source, self-host, vendor-agnostic, theo doi cost va trace |
| **Chatbot framework** | Botpress (low-code), Rasa (on-premise) | Botpress cho team khong chuyen ML. Rasa cho doanh nghiep can kiem soat du lieu |
| **Kenh giao tiep** | Zalo OA API, Messenger API, Web widget | Zalo OA bat buoc (75M+ user). Messenger la kenh so 1 cho SME thuong mai |

### 2.3 Pipeline xu ly

Pipeline 6 buoc cho he thong conversational AI hoan chinh:

**Buoc 1 — Input Processing:** Nhan tin nhan -> Detect ngon ngu (vi/en) -> Tien xu ly tieng Viet (underthesea word_tokenize) -> Intent classification nhanh (keyword/ML nho) -> Entity extraction (order ID, email, ngay thang).

**Buoc 2 — Safety & Guardrails (Input):** Phat hien PII (so the, CMND, SDT Viet Nam, email) -> Phat hien prompt injection (regex patterns) -> Redact PII truoc khi gui LLM API.

**Buoc 3 — Context Retrieval (RAG):** Query formulation -> Embed query (BGE-M3) -> Hybrid search (dense + BM25) tren Qdrant -> Rerank (bge-reranker-v2-m3) -> Lay top-5 context chunks.

**Buoc 4 — Response Generation:** Assembly prompt (system + context + chat history) -> LLM streaming call -> Xu ly tool calls (neu co, loop lai) -> Final response voi source citations.

**Buoc 5 — Safety & Delivery:** Kiem tra output (PII leak, toxicity) -> Format theo kenh (Web: markdown, Zalo OA: plain text <2000 ky tu, Messenger: <2000 ky tu) -> Stream ve client.

**Buoc 6 — Feedback & Learning:** Ghi log conversation (intent, resolved, escalated, latency, token, cost) -> Thu thap user rating (thumbs up/down) -> Analytics dashboard (escalation rate, top intents, unresolved rate) -> Du lieu cho prompt tuning/fine-tuning.

### 2.4 Vi du minh hoa

**Vi du 1 — FAQ Bot voi RAG (30 phut, Beginner):**
Stack: Python + LangChain + ChromaDB + Claude API. Chuan bi FAQ data (10+ cap Q&A) -> Tao vector store voi HuggingFace embeddings (mien phi) -> Xay RAG chain voi ChatAnthropic -> Chay va thu nghiem. Chi phi: chi API Claude (~$0.01/cau hoi). Phu hop SME Viet Nam muon bat dau nhanh.

**Vi du 2 — Agentic Customer Service (Intermediate):**
Stack: LangGraph + Claude + Qdrant + tools (query_order, process_refund, escalate_to_human). Router phan luong: FAQ -> RAG, action -> tool executor, phuc tap -> planner agent, nay sinh -> chuyen nguoi. Co conversation memory va conversation analytics.

---

## Phan 3: Danh gia Kha thi (R-gamma)

### 3.1 Ket luan

**CONDITIONAL GO.** Conversational AI la thi truong da duoc xac nhan voi nhu cau manh tai Viet Nam. Tuy nhien, chien luoc go-to-market phai phan tang: bat dau voi rule-based va RAG bot cho SME (80% volume), danh kien truc agentic cho hop dong enterprise co the chiu chi phi engineering va inference. Cach tiep can "xay he thong tien tien nhat" se that bai ve thuong mai tai thi truong Viet Nam.

### 3.2 Bang diem kha thi

| Chieu | Diem (1-10) | Giai thich |
|-------|-------------|------------|
| **Kha thi ky thuat** | 8 | Cong cu chin muoi tu moi tier. Open-weight LLM (Llama 3.1/4, DeepSeek-R1) cho self-host. Cong cu NLP tieng Viet (PhoBERT, underthesea) dap ung nhu cau. Lo hong: chat luong sinh tieng Viet cua model open-source van kem hon tieng Anh |
| **Nhu cau thi truong** | 9 | Moi nganh doc tai VN dang trien khai hoac danh gia chatbot. Cach mang LLM da thay doi nhan thuc tu "bot FAQ phien phuc" thanh "tro ly AI huu ich". Nhu cau khong the phu nhan |
| **Du lieu san co** | 6 | Nut that co chai. Du lieu hoi thoai tieng Viet it hon tieng Anh rat nhieu. Log khach hang ton tai nhung silo, nhieu PII, it cau truc. Dataset cong khai (UIT-ViQuAD, PhoATIS) nho. Can no luc lon de xay benchmark tieng Viet |
| **Rui ro trien khai** | 5 | Trung binh-cao. LLM hallucination trong nganh quy dinh, edge case tokenization tieng Viet, tich hop he thong cu, chi phi LLM cho khach hang nhay gia. Khoang cach demo vs production la lon |
| **Tong the** | **7** | Co hoi manh voi luc keo thi truong thuc, nhung can scoping ky luat va chien luoc san pham phan tang. Khong phai "xay roi se co nguoi dung" |

### 3.3 Canh quan canh tranh

| Doi thu | Loai | Diem manh | Diem yeu | Gia |
|---------|------|-----------|----------|-----|
| **FPT.AI** | Noi dia VN | Lon nhat VN, quan he sau ngan hang/vien thong/chinh phu, NLU tieng Viet | He sinh thai dong, cham adopt LLM, chi enterprise (khong co SME self-serve), gia cao | $500-5,000+/thang |
| **Zalo AI (VNG)** | Noi dia VN | 75M+ user Zalo, Zalo OA chatbot builder mien phi, phan phoi manh | Chi trong Zalo, chi rule-based/intent-based (chua co LLM), khong da kenh | Mien phi (co ban) |
| **ChatGPT / OpenAI** | Cloud toan cau | Brand nhan dien tot nhat, GPT-4o multimodal, Assistants API co RAG | Tieng Viet khong on dinh, khong luu tru du lieu noi dia, chi phi tang nhanh, khong Zalo | $0.15-10/M token |
| **Google Dialogflow CX** | Cloud toan cau | Flow builder chin muoi, tich hop telephony/GCP, Vietnamese ASR kha | Dat khi scale, cung nhac, Vertex AI Agent Builder dang phat trien | $0.002/request |
| **Rasa** | Open Source | Kiem soat hoan toan, on-premise, custom NLU | Hoc cong dong, can team ML, Rasa Pro dat ($50K+/nam), LLM integration muon | Open source mien phi; Pro $50K+/nam |
| **Yellow.ai** | Enterprise | Dynamic AI agents, 135+ ngon ngu, manh tai An Do/SEA | Moi vao VN, chat luong theo ngon ngu khong deu, lock-in nen tang | Enterprise $100K+/nam |

**Co hoi:** FPT.AI cham adopt LLM va chi tap trung enterprise. Zalo AI chi co rule-based trong Zalo. Co khoang trong lon o phan khuc mid-market ($200-2,000/thang) — ngan hang trung binh (VPBank, TPBank, HDBank) qua nho cho FPT.AI nhung san sang tra tien cho chatbot chat luong.

### 3.4 Rui ro chinh

| # | Rui ro | Xac suat | Tac dong | Giam thieu |
|---|--------|----------|---------|------------|
| 1 | **LLM hallucination trong nganh quy dinh** — Bot cung cap thong tin ngan hang/bao hiem/y te sai | Cao (70%) | Nghiem trong | RAG grounding bat buoc + trich dan nguon, nguong confidence + chuyen nguoi, han che LLM chi retrieval-only trong ngu canh quy dinh |
| 2 | **Chat luong tieng Viet giam** — LLM open-source sinh tieng Viet khong tu nhien, sai ngu phap | Trung binh (50%) | Cao | Dung commercial LLM (Claude, GPT-4o) khi can chat luong, fine-tune tren du lieu tieng Viet, danh gia fluency boi nguoi ban dia |
| 3 | **Chi phi LLM vuot muc** — Cost-per-conversation khien san pham khong co loi voi SME VN ($50-200/thang) | Cao (65%) | Cao | Kien truc phan tang (rule-based cho intent don gian = 0 chi phi LLM), cache query thuong gap (giam 40-60% LLM call), model routing, token budget moi cuoc hoi thoai |
| 4 | **Tich hop he thong cu phuc tap** — He thong legacy VN (core banking T24, Flexcube, SAP VN) thieu API hien dai | Trung binh (55%) | Trung binh | Danh 40-60% timeline cho tich hop, xay adapter layer, cung cap standalone mode khong can tich hop sau |
| 5 | **Khoa khach hang boi doi thu** — FPT.AI khoa ngan hang bang hop dong dai han, Zalo AI khoa SME trong Zalo | Trung binh (45%) | Trung binh | Khac biet hoa bang da kenh (Zalo + Messenger + Web), cam ket data portability, tap trung phan khuc FPT.AI bo qua |
| 6 | **Bao mat du lieu & tuan thu** — Nghi dinh 13/2023 ve bao ve du lieu ca nhan | Trung binh (40%) | Cao | Lua chon trien khai on-premise/hosting tai VN, pipeline an danh hoa du lieu, PII detection + redaction, khong gui PII qua LLM API nuoc ngoai |

### 3.5 Thi truong Viet Nam

**Quy mo:** $50-100M nam 2026, tang truong 25-35%/nam. Dong Nam A: $800M-1.2B. Toan cau: $15-20B.

**Nganh doc can chatbot:**
- **E-commerce:** Tiki, Sendo, Shopee sellers — tra cuu don hang, gioi thieu san pham, ho tro hau ban. Hang trieu query lap lai/ngay
- **Ngan hang/Tai chinh:** Vietcombank, Techcombank, MB Bank, VPBank — tra cuu tai khoan, pre-qualify khoan vay, dich vu the. Compliance cao nhung willing to pay cao
- **Vien thong:** Viettel, VNPT, Mobifone — hoi dap goi cuoc, hoa don, ho tro ky thuat. Da trien khai bot nhung chat luong kem
- **Chinh phu:** Cong DVC quoc gia, cong mot cua cap tinh — xu ly thu tuc hanh chinh, huong dan bieu mau
- **Y te:** Vinmec, FV Hospital — dat lich, phan loai trieu chung, tra ket qua xet nghiem

**Dac thu Viet Nam:**
- **Zalo OA** thong tri B2C messaging: 75M+ MAU, 500K+ official account. San pham chatbot khong co Zalo = chet
- **Facebook Messenger** la kenh so 1 cho SME thuong mai (seller tren Facebook). Messenger API la table stakes
- **Muc gia:** SME (<50 nhan vien): $50-200/thang. Mid-market (50-500): $500-3,000/thang. Enterprise (500+): $5,000-50,000/thang
- **Cua so co hoi:** LLM da thay doi nhan thuc — doanh nghiep VN dang hoi "lam sao dua ChatGPT vao CSKH?" Cua so nay se thu hep khi FPT.AI va cac player toan cau bat kip

---

## Phan 4: Dong gop tu Chuyen gia Thuc hanh

### 4.1 NLP & Xu ly tieng Viet

- **Tach tu (word segmentation)** la buoc bat buoc truoc moi xu ly tieng Viet: "Toi muon dat phong khach san" -> "Toi muon dat phong khach_san". Dung **underthesea** (Python) hoac **VnCoreNLP** (Java, do chinh xac cao hon)
- **PhoBERT** (VinAI) la mo hinh encoder chuan cho tieng Viet — fine-tune cho intent classification va NER dat ket qua tot nhat
- **PhoGPT** (4B) la mo hinh generative tieng Viet nhung qua nho cho hoi thoai phuc tap. Nen dung commercial LLM cho generation, PhoBERT cho understanding
- **Thach thuc tokenization:** LLM quoc te tokenize tieng Viet khong hieu qua (nhieu token hon tieng Anh 2-3x), tang chi phi va giam context window hieu dung
- **Xay Vietnamese evaluation benchmark** truoc khi xay san pham: 500+ mau kiem tra FAQ accuracy, fluency (1-5 boi nguoi ban xu), intent classification accuracy, hallucination rate

### 4.2 ML & Deep Learning

- **Phan tang model:** Query don gian -> rule-based/keyword (0 cost), query trung binh -> LLM nho (Llama-8B, DeepSeek-V3), query phuc tap -> frontier model (Claude, GPT-4o). Model routing giam chi phi 60-70%
- **Fine-tuning bang LoRA/QLoRA** tren 500-5,000 mau hoi thoai tieng Viet de cai thien tone va accuracy cho domain cu the. Chi can 1 GPU A100 trong vai gio
- **DPO** don gian hon RLHF nhieu lan — chi can cap "chosen/rejected" response, khong can train reward model rieng. Team nho co the tu tuy chinh alignment
- **Embedding da ngon ngu:** BGE-M3 ho tro tieng Viet tot cho RAG. Khong nen dung embedding chi tieng Anh cho noi dung tieng Viet

### 4.3 Backend & API

- **FastAPI** cho API server — ho tro streaming response (SSE), async, OpenAPI docs tu dong
- **Qdrant** cho vector DB production — Rust, nhanh, multi-tenant, ho tro hybrid search (dense + sparse)
- **LangChain/LangGraph** cho orchestration — LangChain cho RAG chain, LangGraph cho stateful agentic workflow voi human-in-the-loop
- **MCP (Model Context Protocol)** chuan hoa tool definition giua cac LLM provider — dau tu vao MCP-compatible tools de khong bi vendor lock-in
- **Response caching:** Cache query thuong gap (vd: "gio lam viec", "chinh sach hoan tien") de giam 40-60% LLM API calls. Dung Redis hoac in-memory cache voi TTL

### 4.4 Frontend & Chat UI

- **Vercel AI SDK** cho production web chat — React/Next.js streaming components, ho tro nhieu LLM provider
- **Chainlit** cho prototype nhanh — Python-native, tich hop LangChain/LlamaIndex
- **Zalo OA API:** Plain text, max 2000 ky tu, ho tro quick reply va rich message. Can strip markdown truoc khi gui
- **Messenger API:** Tuong tu Zalo, max 2000 ky tu. Can xu ly webhook verification va message format rieng
- **Streaming UX:** Nguoi dung ky vong thay response tung chu mot (nhu ChatGPT). Thiet ke UI de ho tro streaming tu dau

### 4.5 DevOps & Deployment

- **Phase 1: API-based LLM** — Khong tu host model. Dung Claude API/GPT-4o-mini API. Chi phi GPU tai VN dat ($2,000-4,000/thang cho 1 A100). Chi tu host khi API spend vuot $5,000-10,000/thang
- **Phase 2+: Self-host voi vLLM** — PagedAttention, continuous batching, OpenAI-compatible API. Dung Llama 3.1-8B/70B hoac DeepSeek-V3
- **Containerize** bang Docker, deploy bang Kubernetes hoac don gian hon la Docker Compose cho giai doan dau
- **Langfuse** cho observability — self-host, theo doi trace/cost/latency/quality. Bat buoc tu ngay 1 de debug va toi uu
- **Vietnam hosting:** Dung cloud VN (Viettel Cloud, CMC Cloud) hoac VN region cua cloud quoc te de tuan thu Nghi dinh 13/2023

### 4.6 Bao mat & Prompt Injection

- **PII detection bat buoc:** Regex pattern cho so the tin dung, CMND/CCCD (9 hoac 12 so), SDT VN (0xxxxxxxxx), email. Redact truoc khi gui LLM API
- **Prompt injection detection:** Regex cho cac pattern nhu "ignore previous instructions", "you are now", "new system prompt". Ket hop voi classifier ML cho phuc tap hon
- **Khong gui PII qua API nuoc ngoai:** Redact PII, gui qua LLM, ghep lai PII vao response neu can. Hoac dung on-premise LLM cho du lieu nhay cam
- **Nghi dinh 13/2023:** Du lieu ca nhan phai luu tru tai VN, co su dong y nguoi dung, audit log xuat duoc. Day la competitive advantage neu lam tot
- **Content safety:** Dung LlamaGuard hoac NeMo Guardrails cho output filtering. Trong nganh quy dinh (ngan hang, y te), bat buoc co confidence threshold + human handoff

### 4.7 Thuong mai dien tu (Retail)

- **Use case chinh:** Tra cuu don hang (order_id -> status/tracking), gioi thieu san pham (dua tren lich su mua), ho tro hoan tien/doi tra, FAQ (gio lam viec, phuong thuc thanh toan)
- **Volume play:** Hang trieu query lap lai/ngay -> rule-based cho 80%, LLM cho 20% phuc tap. Cache tra cuu don hang de giam tai database
- **Kenh:** Zalo OA + Messenger la bat buoc. Shopee/Lazada co chat rieng nhung API han che
- **KPI:** Resolution rate (muc tieu >80%), avg response time (<2 giay), escalation rate (<15%), CSAT (>4/5)
- **Tich hop:** VNPay, Momo, ZaloPay cho thanh toan. Carrier API (GHTK, GHN, Viettel Post) cho tracking

### 4.8 Ngan hang & Tai chinh

- **Use case:** Tra cuu so du/lich su giao dich, thong tin lai suat/phi, pre-qualify khoan vay, ho tro the (khoa/mo/han muc), huong dan thu tuc
- **Compliance nghiem ngat:** KHONG cho phep LLM tu sinh thong tin tai chinh. Chi RAG retrieval-only tu knowledge base da duyet. Moi response can trich dan nguon + disclaimer
- **Human handoff bat buoc:** Bat ky yeu cau giao dich (chuyen tien, mo tai khoan) -> chuyen nhan vien ngay. Bot chi ho tro thong tin, khong thuc hien giao dich
- **Bao mat cao:** On-premise hoac VN-hosted bat buoc. PII redaction 100%. Audit log cho moi cuoc hoi thoai. Tuan thu Thong tu 13/2023/TT-NHNN
- **Phan khuc muc tieu:** Ngan hang trung binh (VPBank, TPBank, HDBank) — qua nho cho FPT.AI ($500-5,000/thang), nhung san sang tra $2,000-10,000/thang cho giai phap chatbot chat luong
- **ROI:** 1 agent ngan hang xu ly ~50 cuoc goi/ngay. Bot xu ly 500-2,000 hoi thoai/ngay. Break-even trong 2-3 thang

---

## Phan 5: Khuyen nghi Tong hop

**Verdict: CONDITIONAL GO** — voi cac dieu kien cu the:

1. **San pham phan tang, khong phai nen tang.** Ba SKU ro rang:
   - **Bot Lite** ($99-199/thang): Rule-based FAQ, Zalo OA + Messenger, web widget, analytics co ban. Zero LLM cost. Muc tieu: SME, cua hang, phong kham
   - **Bot Smart** ($499-1,999/thang): RAG + LLM nho (Llama-8B/DeepSeek), upload knowledge base (PDF, crawl website), Vietnamese NLU, CRM webhook
   - **Bot Enterprise** ($5,000+/thang): Agentic, tich hop custom, on-premise, SLA, CSM rieng

2. **Zalo OA la non-negotiable ngay 1.** 75M+ user. San pham khong co Zalo = thua doi thu co Zalo. Danh 2-3 tuan engineering cho tich hop Zalo OA API (rich messages, quick replies, OA management).

3. **Xay Vietnamese evaluation benchmark truoc khi xay san pham.** 500+ mau kiem tra: FAQ accuracy, Vietnamese fluency (1-5), intent classification, hallucination rate. Khong co benchmark = khong do luong duoc tien bo.

4. **Chon 1 nganh doc, khong lam ngang.** De xuat: ngan hang trung binh (VPBank, TPBank, HDBank) — FPT.AI bo qua phan khuc nay, willing to pay $2,000-10,000/thang, co use case ro rang. Hoac e-commerce CSKH.

5. **Kiem soat chi phi tu ngay 0.** Token budget (max 2,000 token/cuoc hoi thoai), response caching (giam 40-60% LLM call), model routing (query don gian -> model nho, phuc tap -> frontier), spending cap moi khach hang.

6. **KHONG tu host LLM trong Phase 1.** GPU tai VN dat va khan hiem. Bat dau voi API (Claude, GPT-4o-mini, DeepSeek API). Chi tu host khi API spend >$5,000-10,000/thang.

7. **Bao mat du lieu la tinh nang, khong phai checkbox.** "Vietnam data residency" la loi the canh tranh thuc su so voi platform toan cau. PII auto-redact, audit log, on-premise option.

**Ly do CONDITIONAL (khong phai unconditional):** (a) Du lieu hoi thoai tieng Viet khan hiem — can no luc lon de xay evaluation benchmark va fine-tuning data; (b) Chat luong tieng Viet cua LLM open-source chua du tot cho production; (c) Khoang cach demo-to-production lon — hallucination, tich hop he thong cu, chi phi inference can kiem soat ky luat.

---

## Phan 6: Quality Checklist

| # | Tieu chi | Trang thai |
|---|----------|------------|
| 1 | Tom tat dieu hanh co score, verdict, va dieu kien | DONE |
| 2 | Phan loai linh vuc day du (sub-fields, related fields, lien ket baseline) | DONE |
| 3 | >=8 khai niem cot loi voi giai thich | DONE (10) |
| 4 | >=8 thuat toan voi ban chat va ung dung | DONE (9) |
| 5 | Bai bao quan trong voi dong gop cu the cho B08 | DONE (10) |
| 6 | Dong thoi gian 1966-2026 | DONE |
| 7 | 3 tier kien truc tham chieu voi use case va chi phi | DONE |
| 8 | Cong nghe de xuat voi ly do chon | DONE (11 hang muc) |
| 9 | Pipeline xu ly 6 buoc | DONE |
| 10 | Vi du minh hoa thuc te | DONE (2 vi du) |
| 11 | Bang diem kha thi 5 chieu | DONE |
| 12 | Canh quan canh tranh voi doi thu VN va quoc te | DONE (6 doi thu) |
| 13 | Rui ro chinh voi xac suat, tac dong, giam thieu | DONE (6 rui ro) |
| 14 | Thi truong VN: quy mo, nganh doc, muc gia, dac thu | DONE |
| 15 | Dong gop 8 chuyen gia thuc hanh | DONE |
| 16 | Khuyen nghi tong hop voi rationale | DONE (7 khuyen nghi) |
| 17 | Toan bo tieng Viet (khong dau), thuat ngu ky thuat giu tieng Anh | DONE |
| 18 | Tong hop (synthesize), khong copy-paste | DONE |

---

## Phan 7: Cau hoi Mo

1. **Chat luong tieng Viet cua LLM open-source cai thien den dau trong 2026-2027?** Neu Llama 5 hoac DeepSeek the he moi sinh tieng Viet tot, self-hosting tro nen kha thi som hon va giam dependency vao API nuoc ngoai.

2. **Zalo AI co adopt LLM khong?** Neu VNG tich hop LLM vao Zalo OA chatbot builder (hien chi rule-based), ho se la doi thu cuc ky manh nho loi the phan phoi 75M+ user. Can theo doi sat.

3. **FPT.AI co chuyen sang LLM nhanh khong?** Ho co du lieu tieng Viet lon nhat (tu 15+ ngan hang) nhung kien truc legacy. Neu ho bat kip, co hoi o mid-market se thu hep.

4. **Nghi dinh 13/2023 se duoc thuc thi nghiem den dau?** Neu thuc thi chat, on-premise/VN-hosting tro thanh bat buoc va la loi the cho player noi dia. Neu long, doi thu toan cau co loi.

5. **Speech-to-speech AI co thay doi cuoc choi tai VN khong?** GPT-4o real-time voice va Gemini 2.0 Live cho phep hoi thoai giong noi <200ms. Neu tich hop vao tong dai CSKH Viet Nam, day la thi truong hoan toan moi.

6. **Chi phi GPU tai VN giam den dau?** Hien tai $2,000-4,000/thang cho 1 A100. Neu giam 50% trong 2027, break-even cua self-hosting thay doi va chien luoc Phase 2 can dieu chinh.

7. **Agentic AI co kha thi tai VN trong 2026?** Phan lon doanh nghiep VN chua co API on dinh cho he thong noi bo. Agentic chatbot (goi API tu dong) co the la cau chuyen 2027-2028, khong phai 2026.

---

*Bao cao nay tong hop tu nghien cuu cua Dr. Archon (R-alpha), kien truc cua Dr. Praxis (R-beta), va danh gia kha thi cua Dr. Sentinel (R-gamma). Cong nghe conversational AI da chin muoi — cau hoi khong phai "co xay duoc khong?" ma la "co xay duoc co loi nhuan tai thi truong Viet Nam, voi muc gia doanh nghiep Viet Nam san sang tra khong?" Cau tra loi la co — nhung chi voi scoping ky luat, gia phan tang, va kiem soat chi phi khong nhuong bo.*
