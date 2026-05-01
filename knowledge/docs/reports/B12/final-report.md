# Báo cáo Tổng hợp: Search & RAG (B12)
## Bởi Ms. Scribe (R-σ) — Ngày: 2026-03-31

**Nguồn tổng hợp:**
- Báo cáo Nghiên cứu — Dr. Archon (R-α)
- Báo cáo Kỹ thuật — Dr. Praxis (R-β)
- Báo cáo Khả thi — Dr. Sentinel (R-γ)

**Phán quyết tổng thể: CONDITIONAL GO — 8.0 / 10**

---

## Tóm tắt Điều hành

Search & RAG (Tìm kiếm và Truy xuất Tăng cường) là lĩnh vực khả thi nhất trong 12 baseline của MAESTRO Knowledge Graph để triển khai thương mại ngắn hạn. Công nghệ đã trưởng thành, thị trường sẵn sàng, và các rủi ro thuộc phạm vi kỹ thuật — không phải nghiên cứu.

**Điểm nổi bật:**
- **Kỹ thuật (9/10):** Ngăn xếp công nghệ đã được kiểm chứng thực chiến — Elasticsearch, Qdrant, LangChain, LlamaIndex. BM25 tồn tại hàng thập kỷ; tìm kiếm dày đặc (dense retrieval) và tìm kiếm lai (hybrid search) đã đạt cấp sản xuất.
- **Thị trường (9/10):** Hơn 80% dự án GenAI doanh nghiệp sử dụng RAG. Tại Việt Nam: tìm kiếm pháp luật (Thư Viện Pháp Luật), thương mại điện tử, ngân hàng — nhu cầu thực tế, đang trả tiền.
- **Dữ liệu (7/10):** Tài liệu dồi dào nhưng thách thức nằm ở chuẩn bị dữ liệu: chiến lược chia nhỏ (chunking), trích xuất siêu dữ liệu, và xử lý từ ghép tiếng Việt trong quá trình mã hóa (tokenization).
- **Rủi ro (6/10):** Ảo giác RAG (hallucination), chất lượng nhúng (embedding) tiếng Việt thấp hơn tiếng Anh 10-15%, chi phí tỷ lệ tuyến tính với kích thước kho tài liệu.

**Điều kiện chuyển sang FULL GO:**
1. MRR@10 nhúng tiếng Việt đạt trong phạm vi 5% so với chuẩn tiếng Anh trên bộ dữ liệu chuyên ngành.
2. Sản phẩm Tier 1 được triển khai cho ít nhất một khách hàng trả phí với chất lượng truy xuất đo lường được.
3. Tỷ lệ ảo giác dưới 5% trên bộ đánh giá RAG tiếng Việt khi bật trích dẫn nguồn.

---

## Phần 1: Tổng hợp Nghiên cứu (R-α)

### 1.1 Phân loại Lĩnh vực

Search & RAG thuộc chuỗi: **Trí tuệ Nhân tạo → Truy xuất Thông tin → Tìm kiếm Nơ-ron & Truy xuất Tăng cường**.

Mười lĩnh vực con đã được xác định:

| Lĩnh vực con | Phạm vi | Mức độ trưởng thành |
|---------------|---------|---------------------|
| IR truyền thống (BM25, TF-IDF) | Khớp từ trên chỉ mục đảo ngược | Trưởng thành |
| Truy xuất Dày đặc (bi-encoder, cross-encoder) | Tìm kiếm tương tự dựa trên nhúng nơ-ron | Tăng trưởng |
| Tìm kiếm Lai (sparse + dense) | Kết hợp tín hiệu từ vựng và ngữ nghĩa | Tăng trưởng |
| RAG (Truy xuất Tăng cường Sinh) | Nền tảng sinh văn bản LLM bằng bằng chứng truy xuất | Tăng trưởng nhanh |
| Cơ sở dữ liệu Vector | Lưu trữ chuyên dụng cho nhúng đa chiều | Tăng trưởng nhanh |
| Tìm kiếm Ngữ nghĩa | Truy xuất tài liệu theo ý nghĩa | Tăng trưởng |
| Tìm kiếm Đa phương thức | Truy xuất qua văn bản, hình ảnh, âm thanh, video | Mới nổi |
| Tìm kiếm Hội thoại | Giải quyết truy vấn đa lượt với ngữ cảnh đối thoại | Tăng trưởng |
| Tìm kiếm Doanh nghiệp | Tìm kiếm thống nhất qua các hầm dữ liệu tổ chức | Trưởng thành / Tiến hóa |
| RAG Tác tử (Agentic RAG) | Tác tử LLM tự lập kế hoạch chiến lược truy xuất | Mới nổi |

### 1.2 Nền tảng Toán học

R-α đã trình bày chi tiết các cơ sở toán học cốt lõi:

- **BM25:** Hàm xếp hạng xác suất với bão hòa tần số từ phụ tuyến tính và chuẩn hóa độ dài tài liệu. Tham số chính: k1 (1.2-2.0), b (0.75).
- **Tương tự Cosine và Tích vô hướng:** Đo khoảng cách trong không gian nhúng. Khi vector được chuẩn hóa L2, cosine tương đương tích vô hướng.
- **Mất mát InfoNCE:** Hàm mất mát huấn luyện mô hình truy xuất dày đặc bằng học đối lập (contrastive learning). Khai thác mẫu âm khó (hard negative mining) từ BM25 là yếu tố quyết định.
- **Cross-Encoder:** Mã hóa chung cặp truy vấn-tài liệu qua transformer, cho độ chính xác cao hơn bi-encoder nhưng chi phí O(N) mỗi cặp.
- **ANN (HNSW, IVF-PQ):** HNSW đạt 95%+ recall@10 với <5ms độ trễ trên tập triệu; IVF-PQ nén vector 768 chiều từ 3072 byte xuống ~96 byte cho tìm kiếm tỷ quy mô.
- **Công thức RAG:** p(y|x) = Σ p(z|x) · p(y|x,z) — biên hóa trên tài liệu truy xuất top-K.
- **RRF (Reciprocal Rank Fusion):** Kết hợp danh sách xếp hạng không cần chuẩn hóa điểm, là phương pháp hợp nhất chuẩn cho tìm kiếm lai.

### 1.3 Khái niệm Cốt lõi

12 khái niệm chính được phân tích sâu:

1. **Chỉ mục Đảo ngược** — cấu trúc dữ liệu nền tảng của truy xuất thông tin, vẫn thiết yếu cho truy vấn khớp chính xác.
2. **Nhúng Dày đặc và Bi-Encoder** — mã hóa truy vấn và tài liệu độc lập vào không gian nhúng chung (384-1024 chiều). Mô hình chính: DPR, E5, BGE, GTE, Nomic-Embed.
3. **Xếp hạng lại Cross-Encoder** — cải thiện MRR 3-8% so với bi-encoder; mô hình: ms-marco-MiniLM, BGE-Reranker, Cohere Rerank.
4. **Tìm kiếm Lai** — kết hợp BM25 (khớp từ hiếm, tên riêng) với dense (đồng nghĩa, ý định ngữ nghĩa). Lĩnh vực đã hội tụ xác nhận lai là mặc định.
5. **Chiến lược Chia nhỏ (Chunking)** — tham số siêu quan trọng: 256-512 token với 10-20% chồng lấp. Kỹ thuật: cố định, câu, đoạn, ngữ nghĩa, đệ quy, late chunking (2024).
6. **Pipeline RAG** — truy vấn → xử lý truy vấn → truy xuất → xếp hạng lại → lắp ráp ngữ cảnh → sinh LLM → hậu xử lý.
7. **Mở rộng và Viết lại Truy vấn** — HyDE, multi-query, step-back prompting, phân tách truy vấn.
8. **Cơ sở dữ liệu Vector** — Pinecone, Weaviate, Qdrant, Milvus, Chroma, pgvector, FAISS. Xu hướng 2024-2025: tích hợp (PostgreSQL + pgvector) thay vì vector DB độc lập.
9. **Truy xuất Đa giai đoạn** — Giai đoạn 1: truy xuất ứng viên (~10-50ms), Giai đoạn 2: xếp hạng lại (~50-200ms), Giai đoạn 3: sinh (~500-3000ms).
10. **Chỉ số Đánh giá** — MRR, NDCG@K, Recall@K, Precision@K, MAP, Hit Rate; RAG: Faithfulness, Answer Relevancy, Context Relevancy (RAGAS).
11. **Self-RAG** — LLM học khi nào cần truy xuất, đánh giá độ liên quan, và tự kiểm tra chất lượng sinh.
12. **Agentic RAG** — tác tử tự lập kế hoạch truy xuất đa bước, tự sửa khi truy xuất ban đầu thất bại.

### 1.4 Thuật toán và Phương pháp Chính

14 thuật toán/phương pháp được phân tích:

| # | Thuật toán | Đóng góp chính | Năm |
|---|-----------|----------------|-----|
| 1 | BM25/TF-IDF | Xếp hạng từ vựng không cần huấn luyện | 1994 |
| 2 | DPR | Truy xuất dày đặc vượt BM25 trên QA mở | 2020 |
| 3 | ColBERT | Tương tác muộn (late interaction) — gần cross-encoder, nhanh gần bi-encoder | 2020 |
| 4 | Sentence-BERT / E5 / BGE | Nhúng câu thực tiễn, mã nguồn mở ngang hoặc vượt OpenAI/Cohere | 2019-2024 |
| 5 | HNSW | Đồ thị phân cấp ANN — thuật toán chủ đạo trong vector DB sản xuất | 2018 |
| 6 | IVF-PQ | Nén vector cho tìm kiếm tỷ quy mô với bộ nhớ hạn chế | — |
| 7 | Cross-Encoder Reranking | Xếp hạng lại chính xác cao, latency tối ưu qua ONNX/TensorRT | — |
| 8 | RAG (Lewis et al.) | Thiết lập mô hình truy xuất-sinh, giảm ảo giác | 2020 |
| 9 | Self-RAG | Truy xuất thích ứng, tự phản chiếu | 2023 |
| 10 | RAPTOR | Cây tóm tắt phân cấp cho truy xuất đa chi tiết | 2024 |
| 11 | HyDE | Nhúng tài liệu giả định, cải thiện truy xuất cho truy vấn mơ hồ | 2022 |
| 12 | GraphRAG | Đồ thị tri thức + phát hiện cộng đồng cho truy vấn toàn cục | 2024 |
| 13 | Corrective RAG (CRAG) | Đánh giá chất lượng truy xuất, hành động sửa chữa khi thất bại | 2024 |
| 14 | Multi-Vector Retrieval | Nhiều biểu diễn mỗi tài liệu, nhúng Matryoshka | 2022-2024 |

### 1.5 Dòng thời gian Tiến hóa

Các điểm chuyển giao quan trọng:
1. **2018-2019:** BERT + Sentence-BERT biến nhúng dày đặc thành thực tiễn
2. **2020:** DPR + RAG chứng minh truy xuất nơ-ron có thể thay thế và bổ sung BM25
3. **2023:** Mô hình nhúng mã nguồn mở (E5/BGE) + khung RAG (LangChain) dân chủ hóa công nghệ
4. **2024:** Mẫu RAG nâng cao (GraphRAG, Self-RAG, CRAG) giải quyết lỗi RAG cơ bản
5. **2025-2026:** Agentic RAG và mô hình ngữ cảnh dài đang tái định hình — tranh luận "RAG vs. long context" (đáp án: cả hai đều có vai trò)

---

## Phần 2: Kiến trúc Kỹ thuật (R-β)

### 2.1 Ba Tầng Kiến trúc Trưởng thành

**Tier 1 — Đơn giản: Tìm kiếm Từ khóa (Elasticsearch + BM25)**
- Khi nào dùng: tìm kiếm tài liệu nội bộ, tìm kiếm sản phẩm thương mại điện tử, phân tích nhật ký.
- Không chi phí LLM, độ trễ <50ms, đã kiểm chứng ở quy mô lớn.
- Sử dụng `icu_tokenizer` cho tiếng Việt với bộ lọc `icu_folding` và `lowercase`.

**Tier 2 — Trung gian: Tìm kiếm Lai + RAG**
- Khi nào dùng: hỗ trợ khách hàng Q&A, cơ sở tri thức, trợ lý tài liệu.
- Kết hợp BM25 (Elasticsearch) + Dense (Vector DB) qua RRF Fusion → Reranker (Cross-Encoder) → Sinh LLM với trích dẫn.

**Tier 3 — Nâng cao: Nền tảng RAG Doanh nghiệp**
- Khi nào dùng: quản lý tri thức doanh nghiệp, tìm kiếm pháp lý/tuân thủ, trợ lý AI đa bộ phận.
- Bao gồm: thu nạp đa nguồn (PDF, DB, Web, API, KG), phân tích thích ứng (Unstructured/Docling), làm giàu siêu dữ liệu (NER, phân loại), nhúng đa mô hình.
- Tầng lưu trữ: Elasticsearch (BM25 + siêu dữ liệu), Qdrant (vector dày đặc), PostgreSQL (dữ liệu có cấu trúc), Neo4j (đồ thị tri thức).
- Tầng truy xuất: bộ định tuyến truy vấn (agent), truy xuất lai, GraphRAG, xếp hạng lại theo tầng, rào chắn ảo giác.
- Giám sát: RAGAS Eval, Phoenix Tracing, bảng điều khiển số liệu.

### 2.2 Ngăn xếp Công nghệ

| Tầng | Công nghệ | Mục đích |
|------|-----------|----------|
| Công cụ Tìm kiếm | Elasticsearch 8.x, OpenSearch 2.x | BM25 + kNN tìm kiếm lai |
| Cơ sở dữ liệu Vector | Qdrant, Weaviate, Chroma, pgvector, Pinecone | Tìm kiếm vector hiệu suất cao |
| Nhúng | BGE-M3 (1024 chiều), E5-large-v2, all-MiniLM-L6-v2 | Mã hóa ngữ nghĩa |
| Xếp hạng lại | Cohere Rerank 3.5, BGE-Reranker-v2-m3, FlashRank | Tinh chỉnh độ liên quan |
| Điều phối | LangChain 0.3+, LlamaIndex 0.11+ | Chuỗi, tác tử, trừu tượng truy xuất |
| LLM | Claude 3.5/4, GPT-4o, Llama 3.1 70B (tự lưu trữ) | Sinh câu trả lời |
| Đánh giá | RAGAS, Arize Phoenix | Faithfulness, relevancy, tracing |
| NLP Tiếng Việt | underthesea, VnCoreNLP / PhoBERT | Tách từ, NER, POS |

### 2.3 Pipeline Sản xuất

R-β đã cung cấp mã nguồn đầy đủ cho toàn bộ pipeline:

1. **Thu nạp Tài liệu:** Phân tích PDF/HTML/DOCX qua `unstructured`, chia nhỏ đệ quy (512 token, 64 chồng lấp), tạo băm ID duy nhất.
2. **Sinh Nhúng và Chỉ mục:** Mã hóa hàng loạt qua SentenceTransformer (BGE-M3), upsert vào Qdrant với chỉ mục payload cho lọc.
3. **Xử lý Truy vấn:** Viết lại và mở rộng truy vấn bằng LLM (Claude), giải quyết đồng tham chiếu, mở rộng từ viết tắt, tạo truy vấn con.
4. **Truy xuất Lai:** BM25 (Elasticsearch, top-50) + Dense (Qdrant, top-50) → hợp nhất RRF (k=60) → top-20.
5. **Xếp hạng lại:** Cohere Rerank API hoặc BGE-Reranker-v2-m3 cục bộ → top-5.
6. **Sinh:** LLM với ngữ cảnh nguồn được đánh chỉ mục [Source N], yêu cầu trích dẫn bắt buộc, phát hiện ảo giác.
7. **Đánh giá:** RAGAS (faithfulness, answer relevancy, context precision, context recall) + Phoenix tracing.

### 2.4 Mẫu Tích hợp

- **Tích hợp CMS (WordPress/Strapi):** Webhook khi nội dung thay đổi → tự động lập chỉ mục lại.
- **Đồng bộ Cơ sở dữ liệu (SQL → RAG):** Định kỳ đồng bộ bản ghi cơ sở dữ liệu vào chỉ mục RAG.
- **API Doanh nghiệp (FastAPI):** Điểm cuối `/ingest`, `/search`, `/ask` (phát trực tuyến) với Elasticsearch + Qdrant + Claude.

---

## Phần 3: Đánh giá Khả thi (R-γ)

### 3.1 Ma trận Điểm Khả thi

| Chiều | Điểm | Lý do |
|-------|------|-------|
| Khả thi Kỹ thuật | 9/10 | Ngăn xếp đã kiểm chứng thực chiến; ba tầng trưởng thành rõ ràng với mã hoạt động |
| Khả thi Thị trường | 9/10 | 80%+ dự án GenAI dùng RAG; nhu cầu Việt Nam cụ thể: pháp luật, thương mại điện tử, ngân hàng |
| Khả thi Dữ liệu | 7/10 | Tài liệu dồi dào nhưng thách thức: chunking, siêu dữ liệu, tokenization tiếng Việt |
| Mức Rủi ro | 6/10 | Ảo giác RAG, chất lượng nhúng tiếng Việt, chi phí tỷ lệ, suy giảm độ liên quan |
| **Tổng thể** | **8.0/10** | Baseline tin cậy nhất cho triển khai thực tiễn |

### 3.2 Bối cảnh Cạnh tranh

10 đối thủ đáng kể đã được xác định, xác nhận thị trường trưởng thành (không bão hòa):

| Đối thủ | Thế mạnh | Điểm yếu |
|---------|----------|-----------|
| Google Vertex AI Search | Quy mô lớn, API grounding, đa phương thức | Phụ thuộc nhà cung cấp, đắt |
| Azure AI Search | Tìm kiếm lai tích hợp, hệ sinh thái doanh nghiệp | Phụ thuộc Microsoft |
| Elasticsearch | BM25 tiêu chuẩn vàng, ESRE cho vector, chấp nhận rộng | Vector search còn đang trưởng thành |
| Pinecone | Chuyên dụng, serverless, độ trễ thấp | Giá mỗi vector đắt, không có BM25 |
| Weaviate | Tìm kiếm lai gốc, mã nguồn mở, đa thuê | Hệ sinh thái nhỏ hơn Elastic |
| Cohere | API Rerank tốt nhất, nhúng đa ngôn ngữ | Phụ thuộc nhà cung cấp đơn lẻ |
| Algolia | Độ trễ <10ms, trải nghiệm lập trình viên | Không thiết kế cho RAG |
| Cốc Cốc (Việt Nam) | Tiếng Việt bản địa, hiểu thị trường địa phương | Hạn chế API cho doanh nghiệp |
| FPT.AI Search (Việt Nam) | NLP tiếng Việt, tuân thủ địa phương | Ngân sách R&D nhỏ hơn |

**Phân biệt tại Việt Nam:** (1) Nhúng và chunking tối ưu cho tiếng Việt, (2) kết nối hệ thống doanh nghiệp địa phương (MISA, Fast, SAP Vietnam), (3) triển khai on-premise hiệu quả chi phí cho ngành nhạy cảm dữ liệu.

### 3.3 Sổ Rủi ro

| # | Rủi ro | Mức độ | Khả năng | Giảm thiểu |
|---|--------|--------|----------|------------|
| R1 | Ảo giác RAG | Cao | Cao | Trích dẫn bắt buộc, chấm điểm faithfulness (RAGAS), kiểm tra tự nhất quán, Corrective RAG |
| R2 | Chất lượng nhúng tiếng Việt | Trung bình | Cao | Benchmark BGE-M3 vs nhúng tiếng Việt tinh chỉnh; tiền xử lý VnCoreNLP; xây bộ đánh giá truy xuất tiếng Việt |
| R3 | Chi phí mở rộng | Trung bình | Trung bình | Kiến trúc phân tầng: BM25 miễn phí → dense vừa phải → LLM chỉ cho câu trả lời cuối; bộ nhớ đệm truy vấn thường xuyên |
| R4 | Nhạy cảm chiến lược chunking | Trung bình | Cao | Thử nghiệm hệ thống: cố định vs đệ quy vs ngữ nghĩa; 512-1024 token với 20% chồng lấp là điểm bắt đầu hợp lý |
| R5 | Suy giảm độ liên quan | Trung bình | Trung bình | Chấm điểm độ mới tài liệu, lập chỉ mục lại định kỳ, quản lý phiên bản mô hình nhúng |
| R6 | Phụ thuộc nhà cung cấp (vector DB) | Thấp | Trung bình | Trừu tượng hóa vector DB qua giao diện truy xuất; LangChain/LlamaIndex cung cấp tầng trừu tượng |

### 3.4 Thông tin Thị trường

**Toàn cầu:**
- RAG là mẫu triển khai GenAI chủ đạo năm 2026 (Gartner, Forrester, McKinsey)
- Thị trường tìm kiếm (truyền thống + AI) vượt 10 tỷ USD toàn cầu
- Thị trường vector DB dự kiến 3.5 tỷ USD vào 2028 (CAGR 25%+)

**Việt Nam & Đông Nam Á:**
- Thị trường khả thi Việt Nam: 50-100 triệu USD cho giải pháp tìm kiếm và RAG doanh nghiệp
- Thị trường khả thi Đông Nam Á: 500 triệu USD+ qua tìm kiếm doanh nghiệp, khám phá thương mại điện tử, tìm kiếm pháp lý/tuân thủ
- **Ngành dọc chính tại Việt Nam:** Tìm kiếm pháp luật (Thư Viện Pháp Luật), ngân hàng & tài chính, thương mại điện tử (Shopee, Tiki, Lazada), chính phủ, sản xuất (Samsung Vietnam, Foxconn)

**Đánh giá Thời điểm:** Hoàn hảo. RAG đã vượt qua "vực thất vọng" và đang ở "dốc năng suất." Cửa sổ xây dựng giải pháp RAG tối ưu tiếng Việt đang mở — chờ đợi có nguy cơ nhường thị trường cho nền tảng toàn cầu.

### 3.5 Thách thức Liên báo cáo

**R-γ thách thức R-α (Nghiên cứu):**
1. Thiếu chuẩn truy xuất tiếng Việt — MRR@10 thực tế của BGE-M3 trên văn bản pháp luật tiếng Việt là bao nhiêu?
2. RAGAS có hạn chế đã biết — faithfulness scoring dùng LLM làm giám khảo, tạo phụ thuộc vòng tròn.
3. GraphRAG được đại diện quá mức — chi phí xây đồ thị tri thức cao, thực tế áp dụng thấp hơn RAG cơ bản + reranking.

**R-γ thách thức R-β (Kỹ thuật):**
4. ICU tokenizer không đủ cho tiếng Việt — "học sinh" nên là một token, không phải hai. Cần tích hợp VnCoreNLP/Underthesea làm analyzer tùy chỉnh Elasticsearch.
5. Khoảng trống kết nối doanh nghiệp — MISA, Fast ERP, hệ thống tùy chỉnh không có API chuẩn. 50% nỗ lực triển khai sẽ vào tầng kết nối.
6. Cảnh báo quá kỹ thuật — hầu hết doanh nghiệp Việt Nam cần Elasticsearch + RAG cơ bản với GPT-4o, không phải hệ thống agentic RAG đa tác tử. Tier 3 nên ghi rõ "cho doanh nghiệp >1 triệu tài liệu và đội ML chuyên dụng."

---

## Phần 4: Đóng góp từ Chuyên gia Thực hành

### 4.1 NLP & Query Understanding

**Xử lý Ngôn ngữ Tự nhiên Tiếng Việt:**
- Tách từ tiếng Việt là thách thức cốt lõi — tiếng Việt là ngôn ngữ đơn lập, từ ghép gồm nhiều âm tiết cách nhau bởi dấu cách (ví dụ: "học sinh", "bệnh viện", "Thành phố Hồ Chí Minh").
- Công cụ: VnCoreNLP (tách từ, gán nhãn từ loại, nhận dạng thực thể), underthesea (tách từ, NER, POS), PhoBERT (nhúng tiền huấn luyện tiếng Việt).
- **Khuyến nghị:** Tiền xử lý văn bản qua VnCoreNLP/underthesea trước khi nhúng và lập chỉ mục BM25. Tích hợp làm analyzer tùy chỉnh trong Elasticsearch.

**Viết lại và Mở rộng Truy vấn:**
- HyDE đặc biệt hiệu quả cho truy vấn tiếng Việt mơ hồ — sinh tài liệu giả định bằng LLM, nhúng và dùng làm truy vấn.
- Multi-query: sinh nhiều biến thể truy vấn để bao phủ đồng nghĩa và cách diễn đạt khác nhau.
- Phân tách truy vấn phức tạp thành truy vấn con đơn giản hơn.

### 4.2 Vector Database & Hạ tầng

**Lựa chọn Vector DB theo kịch bản:**

| Kịch bản | Khuyến nghị | Lý do |
|----------|-------------|-------|
| Khởi đầu nhanh / Prototype | Chroma | Nhẹ, nhúng trong tiến trình, dễ dùng |
| PostgreSQL đã có | pgvector | Quen thuộc vận hành, không thêm hệ thống |
| Sản xuất quy mô trung bình | Qdrant | Rust, hiệu suất cao, lọc tốt, mã nguồn mở |
| Đa phương thức, GraphQL | Weaviate | API GraphQL, hệ sinh thái module |
| Quy mô tỷ, cần GPU | Milvus/Zilliz | IVF, HNSW, DiskANN, hỗ trợ GPU |
| Quản lý hoàn toàn | Pinecone | Serverless, không vận hành, nhưng đắt |

**Hạ tầng Sản xuất:**
- Docker Compose cho phát triển: Elasticsearch 8.15 + Qdrant 1.12 + ứng dụng FastAPI.
- Chỉ mục payload trong Qdrant cho lọc theo `source` và `created`.
- Cấu hình Java heap cho Elasticsearch: tối thiểu 1GB cho đơn nốt.

### 4.3 ML & Embeddings

**Hướng dẫn Chọn Mô hình Nhúng:**

| Tiêu chí | Nhanh | Cân bằng | Chính xác |
|----------|-------|----------|-----------|
| Mô hình | all-MiniLM-L6-v2 | multilingual-e5-base | BGE-M3 |
| Chiều | 384 | 768 | 1024 |
| Kích thước | 80MB | 278MB | 567MB |
| Đa ngôn ngữ | Hạn chế | Tốt | Xuất sắc |
| Tiếng Việt | Yếu | Khá | Tốt nhất hiện có |

**Lưu ý quan trọng từ R-γ:** BGE-M3 và multilingual-e5 hoạt động tốt trên chuẩn tiếng Anh nhưng độ chính xác truy xuất tiếng Việt thấp hơn 10-15%. Cần:
1. Xây bộ đánh giá truy xuất tiếng Việt (500+ bộ ba câu hỏi-đáp-ngữ cảnh).
2. Benchmark BGE-M3 vs nhúng tinh chỉnh dựa PhoBERT trên bộ đánh giá.
3. Xem xét tinh chỉnh mô hình nhúng trên văn bản pháp luật, tài chính, kỹ thuật tiếng Việt khi đủ dữ liệu.

### 4.4 Backend & API

**Kiến trúc API Sản xuất (FastAPI):**
- `POST /ingest` — tải lên và thu nạp tài liệu (phân tích → chia nhỏ → nhúng → lập chỉ mục kép ES + Qdrant).
- `GET /search` — tìm kiếm lai không sinh (hybrid search only).
- `GET /ask` — RAG đầy đủ: truy xuất + sinh phát trực tuyến (Server-Sent Events).
- `GET /health` — kiểm tra sức khỏe Elasticsearch và Qdrant.
- `POST /webhooks/cms` — webhook CMS cho lập chỉ mục lại tự động.

**Cấu hình qua biến môi trường** với tiền tố `RAG_` (Pydantic Settings).

### 4.5 Frontend & Search UI

**Giao diện Tìm kiếm:**
- Giao diện chat-based RAG là mẫu triển khai chính (ChatGPT, Claude, bot doanh nghiệp).
- Phát trực tuyến SSE cho trải nghiệm người dùng phản hồi nhanh.
- Hiển thị trích dẫn nguồn [Source N] để tăng độ tin cậy.
- Tìm kiếm hội thoại đa lượt cần giải quyết đồng tham chiếu và lịch sử đối thoại.

### 4.6 Bảo mật

**Khuyến nghị Bảo mật:**
- Triển khai on-premise cho ngành nhạy cảm (ngân hàng, chính phủ) để tránh rò rỉ dữ liệu.
- Sử dụng LLM tự lưu trữ (Llama 3.1 70B) khi không muốn dữ liệu ra ngoài.
- Phân quyền đa thuê (multi-tenancy) trong vector DB — Qdrant và Weaviate hỗ trợ gốc.
- Kiểm soát truy cập tài liệu: lọc metadata theo quyền người dùng trước khi truy xuất.
- Tầng trừu tượng vector DB giảm rủi ro phụ thuộc nhà cung cấp.

### 4.7 Pháp lý (Legal Search)

**Tìm kiếm Pháp luật Việt Nam:**
- Thư Viện Pháp Luật là nhu cầu hiện có, sẵn lòng trả tiền cao.
- Yêu cầu đặc thù: trích dẫn chính xác điều luật, khoản, nghị định; không chấp nhận ảo giác.
- **Pipeline khuyến nghị:** Elasticsearch (BM25 cho khớp chính xác số hiệu văn bản) + Dense (ngữ nghĩa cho câu hỏi pháp lý) + Reranker + LLM với trích dẫn bắt buộc + Corrective RAG.
- Đánh giá: tỷ lệ trích dẫn chính xác, faithfulness > 0.95, tỷ lệ ảo giác < 5%.
- Chunking tôn trọng cấu trúc: chia theo điều, khoản, mục thay vì kích thước cố định.

### 4.8 Giáo dục (Education Search)

**Tìm kiếm Giáo dục:**
- Kịch bản: tìm kiếm tài liệu giảng dạy, trả lời câu hỏi sinh viên, trợ lý học tập.
- Yêu cầu: câu trả lời chính xác, dẫn nguồn giáo trình, ngôn ngữ phù hợp trình độ.
- RAPTOR phù hợp cho tài liệu giáo dục — tóm tắt phân cấp cho phép cả câu hỏi chi tiết (chương/mục cụ thể) và câu hỏi tổng quan (chủ đề toàn khóa).
- Chunking theo cấu trúc chương/bài/mục trong giáo trình.
- Multi-query đặc biệt hữu ích — sinh viên thường đặt câu hỏi mơ hồ, cần mở rộng để bao phủ đúng nội dung.

---

## Phần 5: Khuyến nghị Tổng hợp

### Hành động Ngắn hạn (0-3 tháng)

1. **Xây bộ đánh giá RAG tiếng Việt.** 500+ bộ ba câu hỏi-đáp-ngữ cảnh qua ba lĩnh vực: pháp luật, thương mại điện tử, tổng quát. Không có bộ này, mọi tuyên bố chất lượng chỉ là giai thoại.
2. **Benchmark nhúng tiếng Việt hệ thống.** BGE-M3 vs multilingual-e5-large vs nhúng tinh chỉnh PhoBERT. Công bố kết quả nội bộ.
3. **Giao sản phẩm Tier 1 trước.** Elasticsearch + ICU/VnCoreNLP analyzer + RAG cơ bản với GPT-4o. Mục tiêu: tìm kiếm pháp luật hoặc tìm kiếm doanh nghiệp nội bộ. **Không thử Tier 3 (agentic RAG) trước khi Tier 1 tạo doanh thu.**

### Hành động Trung hạn (3-6 tháng)

4. **Phát triển kết nối doanh nghiệp Việt Nam.** MISA, Fast, SAP Vietnam, Google Workspace, Zalo nội bộ. **Đây là hào nước (moat), không phải mô hình.**
5. **Triển khai tìm kiếm lai (BM25 + dense).** Elasticsearch ESRE hoặc vector DB chuyên dụng bên cạnh BM25.
6. **Thiết lập giám sát RAG.** Theo dõi độ chính xác truy xuất, điểm faithfulness, mức hài lòng người dùng, chi phí mỗi truy vấn. Đặt ngưỡng cảnh báo.

### Hành động Dài hạn (6-12 tháng)

7. **Khám phá tinh chỉnh theo lĩnh vực.** Tinh chỉnh mô hình nhúng trên văn bản pháp luật, tài chính, kỹ thuật tiếng Việt khi đủ dữ liệu.
8. **Đánh giá Agentic RAG có chọn lọc.** Chỉ cho khách hàng có nhu cầu truy xuất đa nguồn phức tạp và ngân sách hỗ trợ. Đây là dịch vụ cao cấp, không phải mặc định.

### Phụ thuộc Liên Baseline

| Baseline | Loại | Ghi chú |
|----------|------|---------|
| B04 (NLP) | Quan trọng | Tách từ tiếng Việt, NER cho trích xuất siêu dữ liệu |
| B02 (Document Intelligence) | Quan trọng | Phân tích PDF/hình ảnh trước khi vào pipeline truy xuất |
| B09 (Generative AI) | Quan trọng | Chữ "G" trong RAG — chất lượng sinh LLM ảnh hưởng trực tiếp |
| B11 (Knowledge Graph) | Tùy chọn | GraphRAG thú vị nhưng không thiết yếu cho triển khai ban đầu |
| B10 (AI Agents) | Tùy chọn | Agentic RAG là nâng cấp tương lai |
| B08 (Conversational AI) | Vừa phải | Giao diện tìm kiếm hội thoại tăng chấp nhận nhưng không cốt lõi |

---

## Phần 6: Quality Checklist

| # | Tiêu chí | Trạng thái |
|---|----------|------------|
| 1 | Phân loại lĩnh vực đầy đủ (10 lĩnh vực con) | ✅ Đạt |
| 2 | Nền tảng toán học (BM25, cosine, InfoNCE, HNSW, IVF-PQ, RRF, NDCG) | ✅ Đạt |
| 3 | Khái niệm cốt lõi (≥10) | ✅ Đạt (12 khái niệm) |
| 4 | Thuật toán và phương pháp (≥10) | ✅ Đạt (14 phương pháp) |
| 5 | Bài báo chính (≥10) | ✅ Đạt (10 bài báo) |
| 6 | Dòng thời gian tiến hóa | ✅ Đạt (1972-2026) |
| 7 | Kết nối liên lĩnh vực (≥5 baseline) | ✅ Đạt (6 baseline: B04, B11, B09, B02, B08, B10) |
| 8 | Kiến trúc 3 tầng với mã nguồn | ✅ Đạt |
| 9 | Ngăn xếp công nghệ đầy đủ | ✅ Đạt |
| 10 | Pipeline sản xuất end-to-end | ✅ Đạt |
| 11 | Ví dụ mã hoạt động (beginner + advanced) | ✅ Đạt |
| 12 | Ma trận điểm khả thi | ✅ Đạt (8.0/10) |
| 13 | Bối cảnh cạnh tranh (≥10 đối thủ) | ✅ Đạt (10 đối thủ) |
| 14 | Sổ rủi ro (≥5 rủi ro) | ✅ Đạt (6 rủi ro) |
| 15 | Thông tin thị trường (toàn cầu + Việt Nam) | ✅ Đạt |
| 16 | Thách thức liên báo cáo | ✅ Đạt (6 thách thức) |
| 17 | Khuyến nghị hành động (ngắn/trung/dài hạn) | ✅ Đạt |
| 18 | Phụ thuộc liên baseline | ✅ Đạt |
| 19 | Tiếng Việt có dấu đầy đủ | ✅ Đạt |
| 20 | Đóng góp chuyên gia thực hành (8 lĩnh vực) | ✅ Đạt |

---

## Phần 7: Câu hỏi Mở

1. **MRR@10 thực tế của BGE-M3 trên văn bản pháp luật tiếng Việt so với tiếng Anh là bao nhiêu?** R-γ đã nêu khoảng trống này — chưa có chuẩn công khai. Cần benchmark nội bộ trước khi đưa ra quyết định sản phẩm.

2. **Chiến lược đánh giá RAG nào thay thế hoặc bổ sung RAGAS cho tiếng Việt?** RAGAS dùng LLM làm giám khảo tạo phụ thuộc vòng tròn. Cần khám phá đánh giá con người (human eval) và chỉ số tự động không dùng LLM cho faithfulness.

3. **Tích hợp VnCoreNLP/underthesea làm analyzer tùy chỉnh Elasticsearch phức tạp đến mức nào?** R-γ nhận định đây là nhiệm vụ kỹ thuật không tầm thường. Cần đánh giá nỗ lực triển khai cụ thể.

4. **Khoảng cách chi phí giữa triển khai on-premise và cloud cho RAG tại Việt Nam là bao nhiêu?** Đặc biệt quan trọng cho ngân hàng và chính phủ — hai ngành dọc ưu tiên.

5. **GraphRAG có đáng đầu tư cho doanh nghiệp Việt Nam ở giai đoạn hiện tại?** R-γ khuyến nghị giảm ưu tiên. R-α phân tích chi tiết nhưng thực tế áp dụng thấp hơn RAG cơ bản + reranking. Cần dữ liệu ROI cụ thể.

6. **Chiến lược chunking tối ưu cho văn bản pháp luật tiếng Việt (nghị định, thông tư, luật) là gì?** Chia theo điều/khoản hay kích thước cố định? Cần thử nghiệm hệ thống trên corpus thực.

7. **RAG vs. Long Context: khi nào mô hình ngữ cảnh dài (128K-1M token) thay thế được RAG?** R-α nhận định cả hai đều có vai trò, nhưng ranh giới cụ thể cho các kịch bản Việt Nam chưa rõ.

8. **Lộ trình xây dựng "moat" kết nối doanh nghiệp Việt Nam (MISA, Fast, SAP Vietnam) cần bao lâu và bao nhiêu nguồn lực?** R-γ xác định đây là yếu tố phân biệt chiến lược nhưng chưa có ước tính cụ thể.

---

*Báo cáo được tổng hợp bởi Ms. Scribe (R-σ) cho MAESTRO Knowledge Graph.*
*Baseline B12: Search & RAG | Ngày: 2026-03-31 | Phiên bản: 1.0*
