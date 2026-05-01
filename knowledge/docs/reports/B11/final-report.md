# Báo cáo Tổng hợp: Knowledge Graph (B11)
## Bởi Ms. Scribe (R-σ) — Ngày: 2026-03-31

---

## Tóm tắt Điều hành

Knowledge Graph (KG) là công nghệ trưởng thành về mặt kỹ thuật, đóng vai trò mô liên kết chiến lược cho nền tảng MAESTRO — kết nối B04 (NLP), B10 (Agentic AI), và B12 (Search & RAG). Tuy nhiên, chi phí xây dựng và bảo trì KG thường bị đánh giá thấp hơn thực tế 3-5 lần, và hệ sinh thái KG cho tiếng Việt gần như chưa tồn tại. Kết luận là **CONDITIONAL GO** — chỉ tiến hành khi phạm vi được giới hạn chặt chẽ (1-2 ngành dọc cho Giai đoạn 1), có ngân sách bảo trì rõ ràng, và có ứng dụng tiêu thụ cụ thể (GraphRAG hoặc gợi ý giải thích được) trước khi bắt đầu xây dựng. Sự hội tụ giữa LLM và KG (GraphRAG) tạo ra cửa sổ chiến lược 12-18 tháng — hành động ngay hoặc bỏ qua.

---

## Phần 1: Tổng hợp Nghiên cứu (R-α)

### 1.1 Phân loại lĩnh vực

**Dòng dõi:** Trí tuệ Nhân tạo > Biểu diễn Tri thức & Suy luận > Đồ thị Tri thức

| Lĩnh vực con | Mô tả | Hội nghị chính |
|---|---|---|
| Kỹ thuật Bản thể học (Ontology Engineering) | Thiết kế lược đồ khái niệm hình thức dùng OWL/RDFS | ISWC, ESWC |
| Cơ sở Dữ liệu Đồ thị (Graph Databases) | Lưu trữ & truy vấn — đồ thị thuộc tính (Neo4j, TigerGraph) và kho RDF (Blazegraph, Virtuoso) | VLDB, SIGMOD |
| Nhúng Đồ thị Tri thức (KG Embedding) | Biểu diễn thực thể & quan hệ trong không gian véctơ liên tục | NeurIPS, ICLR |
| Xây dựng Đồ thị Tri thức (KG Construction) | Đường ống đầu cuối: NER, trích xuất quan hệ, liên kết thực thể | ACL, EMNLP |
| Hoàn thiện Đồ thị Tri thức (KG Completion) | Dự đoán liên kết và phân loại bộ ba để bổ sung sự kiện thiếu | AAAI, IJCAI |
| Đồ thị Tri thức Thời gian (Temporal KG) | Mô hình hóa sự kiện phụ thuộc thời gian | AAAI, WWW |
| Đồ thị Tri thức Đa phương thức (Multimodal KG) | Tích hợp hình ảnh, văn bản, và bộ ba có cấu trúc | ACM MM, AAAI |
| Trí tuệ Nhân tạo Thần kinh-Ký hiệu (Neuro-Symbolic AI) | Kết hợp học sâu với suy luận ký hiệu trên KG | NeSy, IJCAI |

**Liên kết chéo với các baseline khác:**
- **B04 (NLP):** Mô hình ngôn ngữ cung cấp xương sống cho xây dựng KG; KG ngược lại cung cấp nền tảng tri thức cho LLM.
- **B12 (Search & RAG):** GraphRAG tăng cường RAG bằng duyệt đồ thị cho suy luận đa bước.
- **B10 (Agentic AI):** Agent sử dụng KG làm mô hình thế giới bền vững và bộ nhớ cho lập kế hoạch.
- **B05 (Hệ thống Gợi ý):** KG-enhanced recommenders tận dụng đường dẫn thực thể-quan hệ cho gợi ý giải thích được.
- **B02 (Thị giác Máy tính):** Đồ thị cảnh (scene graph) là KG chuyên lĩnh vực.

### 1.2 Các khái niệm cốt lõi (≥10)

1. **Bộ ba (Triple):** Đơn vị nguyên tử `(chủ thể, vị từ, đối tượng)` — mọi sự kiện được mã hóa dưới dạng cạnh có nhãn trong đồ thị. Tái hóa (reification) xử lý quan hệ n-ngôi bằng cách tạo nút phát biểu.

2. **Thiết kế Bản thể học (Ontology Design):** Định nghĩa lớp (khái niệm), thuộc tính (quan hệ), ràng buộc miền/phạm vi, và tiên đề. Bao gồm bản thể học thượng tầng (SUMO, BFO), bản thể học chuyên lĩnh vực (SNOMED CT, FIBO), và mẫu thiết kế (CODP).

3. **Giải quyết Thực thể (Entity Resolution):** Xác định hai tham chiếu chỉ cùng một thực thể thế giới thực — sử dụng tương đồng chuỗi, khớp cấu trúc, hoặc nhúng (embedding-based).

4. **Trích xuất Quan hệ (Relation Extraction):** Nhận dạng quan hệ ngữ nghĩa giữa thực thể trong văn bản phi cấu trúc — nút thắt cổ chai chính của xây dựng KG tự động.

5. **Nhúng Đồ thị Tri thức (KG Embedding):** Biểu diễn thực thể và quan hệ dưới dạng véctơ liên tục cho dự đoán liên kết, phân loại bộ ba, và phân loại thực thể. Các họ mô hình: dịch chuyển (TransE), song tuyến (ComplEx), mạng nơ-ron (ConvE), GNN (R-GCN).

6. **Dự đoán Liên kết (Link Prediction):** Cho `(h, r, ?)`, xếp hạng tất cả thực thể ứng viên. Đánh giá bằng MRR và Hits@K. Hiện tại trên FB15k-237: MRR ~0.37 (nhúng), ~0.42 (LLM-augmented).

7. **Suy luận trên GNN (GNN-based Reasoning):** Mạng nơ-ron đồ thị tổng hợp thông tin từ vùng lân cận đa bước, cho phép suy luận quy nạp. Kiến trúc chính: R-GCN, CompGCN, NBFNet.

8. **Suy luận Thần kinh-Ký hiệu (Neuro-Symbolic Reasoning):** Kết hợp nhận dạng mẫu của mạng nơ-ron với tính chặt chẽ logic — Neural Theorem Provers, Logic Tensor Networks, DRUM/NeuralLP.

9. **Đồ thị Tri thức Thời gian (Temporal KG):** Mở rộng bộ ba thành bộ tư `(h, r, t, [t_start, t_end])`. Phương pháp: TTransE, HyTE, TNTComplEx, RE-GCN.

10. **GraphRAG (KG + LLM):** Microsoft (2024) — xây dựng KG phân cấp từ corpus văn bản bằng LLM, phát hiện cộng đồng (thuật toán Leiden), tạo tóm tắt đa cấp. Truy vấn cục bộ (duyệt vùng lân cận thực thể) và toàn cục (tổng hợp tóm tắt cộng đồng).

11. **Đồ thị Tri thức Liên bang (Federated KG):** KG phân tán được duy trì bởi các tổ chức khác nhau, truy vấn được mà không cần tập trung hóa — qua SPARQL Federation và giao thức Triple Pattern Fragments.

12. **Đồ thị Tri thức Đa phương thức (Multimodal KG):** Tích hợp văn bản, hình ảnh, video, âm thanh vào cấu trúc đồ thị thống nhất — MMKG, Visual Genome.

### 1.3 Thuật toán chính (≥10)

| # | Thuật toán | Loại | Mô tả ngắn |
|---|---|---|---|
| 1 | **TransE / TransR / RotatE** | Nhúng dịch chuyển | Quan hệ là phép dịch/quay trong không gian véctơ; `h + r ≈ t` (TransE), phép quay phức (RotatE) |
| 2 | **ComplEx / DistMult** | Nhúng song tuyến | Tích song tuyến trong không gian phức cho quan hệ bất đối xứng; ComplEx MRR ~0.34 trên FB15k-237 |
| 3 | **R-GCN** | GNN quan hệ | GCN mở rộng cho đồ thị đa quan hệ, ma trận trọng số theo quan hệ với phân rã cơ sở |
| 4 | **CompGCN** | GNN tổ hợp | Nhúng đồng thời thực thể và quan hệ qua toán tử tổ hợp (trừ, nhân, tương quan vòng) |
| 5 | **GraphSAGE (thích ứng KG)** | GNN quy nạp | Lấy mẫu-tổng hợp vùng lân cận; mở rộng đến đồ thị tỷ nút qua huấn luyện mini-batch |
| 6 | **SPARQL Query Execution** | Truy vấn | Phân tích cú pháp, tối ưu đại số, chọn thuật toán nối, thực thi trên chỉ mục RDF (SPO, POS, OSP) |
| 7 | **OWL Reasoning (Tableau)** | Suy luận | Thuật toán tableau cho suy luận OWL DL — mở rộng, phát hiện mâu thuẫn, chặn vô hạn |
| 8 | **NER + RE Pipeline** | Xây dựng KG | NER → Liên kết thực thể → Giải quyết đồng tham chiếu → Trích xuất quan hệ → Lọc độ tin cậy |
| 9 | **Entity Linking (BLINK, REFinED)** | Liên kết | Ánh xạ đề cập thực thể đến định danh KG; bi-encoder + cross-encoder |
| 10 | **GraphRAG Pipeline** | RAG có cấu trúc | Phân đoạn → Trích xuất LLM → Xây đồ thị → Phát hiện cộng đồng Leiden → Tóm tắt phân cấp → Truy vấn |
| 11 | **AMIE+ Rule Mining** | Khai thác quy tắc | Khai thác quy tắc Horn bậc nhất từ KG; đo bằng support và PCA confidence |
| 12 | **KG-BERT / LLM-based KG Completion** | Hoàn thiện KG | Chuyển phân loại bộ ba thành suy luận văn bản; mô hình hybrid nhúng + LLM reranker |

### 1.4 Bài báo quan trọng

| # | Bài báo | Tác giả | Năm | Đóng góp chính |
|---|---|---|---|---|
| 1 | TransE | Bordes và cộng sự | 2013 | Nguyên lý dịch chuyển `h + r ≈ t`; khai sinh lĩnh vực nhúng KG; 15.000+ trích dẫn |
| 2 | Knowledge Vault | Dong và cộng sự (Google) | 2014 | Kết hợp nhúng KG + trích xuất đa nguồn cho xây dựng KG quy mô web |
| 3 | Wikidata | Vrandecic & Krotzsch | 2014 | Thiết kế KG mở cộng đồng đa ngôn ngữ; 100M+ mục (2026) |
| 4 | ComplEx | Trouillon và cộng sự | 2016 | Nhúng phức cho quan hệ bất đối xứng; chứng minh khả năng biểu diễn đầy đủ |
| 5 | R-GCN | Schlichtkrull và cộng sự | 2018 | GCN cho dữ liệu đa quan hệ; nền tảng cho GNN trên KG |
| 6 | RotatE | Sun và cộng sự | 2019 | Quan hệ là phép quay trong không gian phức; mẫu hình đối xứng/phản đối xứng/đảo/hợp thành |
| 7 | KG-BERT | Yao và cộng sự | 2019 | Kết nối cộng đồng NLP và KG; bộ ba dưới dạng chuỗi văn bản |
| 8 | GraphRAG | Edge và cộng sự (Microsoft) | 2024 | RAG có cấu trúc KG phân cấp; truy vấn cục bộ và toàn cục |
| 9 | LLM+KG Roadmap | Pan và cộng sự | 2024 | Khảo sát thống nhất 400+ bài báo; ba mô hình tích hợp LLM-KG |

### 1.5 Dòng thời gian phát triển

| Năm | Cột mốc | Ý nghĩa |
|---|---|---|
| 1998-2001 | Tầm nhìn Semantic Web và RDF | Tim Berners-Lee đặt nền tảng mô hình dữ liệu bộ ba |
| 2004 | OWL và SPARQL | Chuẩn hóa ngôn ngữ bản thể học và truy vấn |
| 2007-2008 | DBpedia và Linked Open Data | Chứng minh xây dựng KG quy mô lớn tự động khả thi |
| 2012 | Google Knowledge Graph | Thương mại hóa KG; "things, not strings" |
| 2013 | TransE | Khai sinh lĩnh vực nhúng KG; chuyển từ ký hiệu sang thống kê |
| 2014-2016 | Knowledge Vault, Wikidata trưởng thành | Xây dựng tự động và cộng đồng là hai chiến lược bổ sung |
| 2018-2019 | R-GCN, KG-BERT, RotatE | GNN và mô hình ngôn ngữ tiền huấn luyện hội tụ trên KG |
| 2024 | GraphRAG và thống nhất LLM+KG | KG trở thành hạ tầng thiết yếu cho nền tảng LLM |
| 2025-2026 | Agentic KG, liên bang KG mesh | KG làm bộ nhớ bền vững cho agent tự trị; KG doanh nghiệp liên kết qua giao thức liên bang |

---

## Phần 2: Kiến trúc Kỹ thuật (R-β)

### 2.1 Kiến trúc tham chiếu

Ba kiến trúc tham chiếu theo cấp độ:

**Cấp 1 — Đơn giản (Thủ công / Giám tuyển):**
- Nhập liệu thủ công (CSV/JSON-LD) → Cơ sở dữ liệu đồ thị (Neo4j) → API truy vấn (REST/GraphQL) → Trực quan hóa (Neo4j Browser)
- Phù hợp: nhóm nhỏ, KG dưới 1 triệu bộ ba, chứng minh khái niệm
- Độ trễ: < 50ms cho truy vấn 2-bước trên < 1 triệu nút

**Cấp 2 — Trung gian (Đường ống Xây dựng Tự động):**
- Corpus tài liệu → NER + RE (spaCy/LLM) → Liên kết thực thể (Wikidata) → Xác thực bộ ba → Neo4j/ArangoDB → API Cypher → Trực quan hóa
- Phù hợp: nhóm trung bình, 1-100 triệu bộ ba, xây dựng KG từ tài liệu
- Điểm tin cậy trên bộ ba trích xuất; xử lý theo lô với cập nhật gia tăng

**Cấp 3 — Nâng cao (Nền tảng KG Doanh nghiệp + GraphRAG):**
- Đa nguồn (SQL, tài liệu, API, Kafka) → Trích xuất LLM + ETL quy tắc + Xử lý luồng → Neo4j Causal Cluster + Vector Index → GraphRAG (LangChain + Claude) + API truy vấn + KG Embeddings (PyKEEN) → Tầng ứng dụng (Chat, Tìm kiếm, Phân tích)
- Phù hợp: tổ chức lớn, 100M+ bộ ba, đa nguồn, thời gian thực, tích hợp LLM

### 2.2 Công nghệ đề xuất

| Tầng | Công nghệ | Vai trò | Giấy phép |
|---|---|---|---|
| Cơ sở dữ liệu đồ thị | Neo4j (Community/Enterprise) | Lưu trữ đồ thị thuộc tính, truy vấn Cypher | GPL-3 / Thương mại |
| | ArangoDB | Đa mô hình (đồ thị + tài liệu + key-value) | Apache 2.0 |
| Xây dựng KG | spaCy + spacy-llm | NER, phân tích phụ thuộc, trích xuất LLM | MIT |
| | REBEL (Hugging Face) | Trích xuất quan hệ đầu-cuối | Apache 2.0 |
| | LlamaIndex PropertyGraphIndex | Đường ống trích xuất KG dựa trên LLM | MIT |
| Nhúng KG | PyKEEN | Thư viện nhúng KG (40+ mô hình) | MIT |
| | DGL-KE | Nhúng KG phân tán trên DGL | Apache 2.0 |
| Trực quan hóa | react-force-graph | Thành phần React cho đồ thị lực hướng | MIT |
| | D3.js | Kết xuất đồ thị SVG cấp thấp | ISC |
| Truy vấn | Cypher | Ngôn ngữ truy vấn khai báo của Neo4j | — |
| | SPARQL | Chuẩn W3C cho truy vấn RDF | W3C |
| Điều phối | Apache Airflow | Lập lịch ETL dạng DAG | Apache 2.0 |
| Tích hợp LLM | LangChain GraphCypherQAChain | Ngôn ngữ tự nhiên sang Cypher qua LLM | MIT |
| | Microsoft GraphRAG | Tìm kiếm toàn cục/cục bộ trên KG xây bằng LLM | MIT |

**Ngăn xếp đề xuất theo cấp:**
- **Khởi đầu:** Neo4j Community + spaCy + Python neo4j driver + D3.js
- **Sản xuất:** Neo4j Enterprise + Trích xuất LLM (Claude) + Airflow + LangChain GraphRAG + react-force-graph
- **Doanh nghiệp:** Neo4j Causal Cluster + Kafka + Airflow + PyKEEN + LangChain + tầng API tùy chỉnh

### 2.3 Pipeline xử lý

**Đường ống KG đầu cuối gồm 6 giai đoạn:**

| Giai đoạn | Chức năng | Chi tiết |
|---|---|---|
| 1. Thu nạp (Ingest) | Nhập dữ liệu đa nguồn | CSV, tài liệu (PDF/HTML/text), API, luồng dữ liệu |
| 2. Trích xuất (Extract) | NER + RE + Liên kết thực thể | spaCy cho quy tắc cơ bản; LLM (Claude) cho trích xuất chất lượng cao; trả về bộ ba có điểm tin cậy |
| 3. Xây dựng (Build) | Xây dựng & xác thực KG | Loại bỏ trùng lặp, xác thực tuân thủ bản thể học (kiểm tra ràng buộc miền/phạm vi), nhập hàng loạt vào Neo4j |
| 4. Làm giàu (Enrich) | Nhúng & dự đoán liên kết | Huấn luyện nhúng KG bằng PyKEEN (RotatE, ComplEx); dự đoán liên kết thiếu |
| 5. Phục vụ (Serve) | API truy vấn + GraphRAG | FastAPI: truy vấn vùng lân cận thực thể, tìm kiếm bộ ba, tìm đường ngắn nhất |
| 6. Bảo trì (Maintain) | Cập nhật gia tăng + Giải quyết xung đột | Chiến lược: tin cậy tối đa, gần nhất, ưu tiên nguồn; cắt tỉa bộ ba tin cậy thấp |

### 2.4 Ví dụ minh họa

**Ví dụ 1: Xây dựng KG công ty bằng Neo4j + Python**
- Mức độ: Người mới | Thời gian: 45 phút
- Khởi động Neo4j bằng Docker → Tạo ràng buộc duy nhất → Nhập bộ ba thủ công (CSV) → Truy vấn bằng Cypher → Trực quan hóa bằng Neo4j Browser

**Ví dụ 2: Trích xuất KG tự động bằng LLM**
- Sử dụng LLMExtractor (Claude) trích xuất bộ ba từ văn bản phi cấu trúc
- Liên kết thực thể đến Wikidata; xác thực tuân thủ bản thể học
- Nhập hàng loạt với phân giải xung đột

**Ví dụ 3: GraphRAG cho truy vấn toàn cục**
- Tích hợp LangChain GraphCypherQAChain để chuyển câu hỏi tiếng tự nhiên thành Cypher
- Kết hợp duyệt đồ thị KG với tóm tắt cộng đồng cho trả lời đa bước

---

## Phần 3: Đánh giá Khả thi (R-γ)

### 3.1 Kết luận

**CONDITIONAL GO** — Đồ thị Tri thức là khả thi về mặt kỹ thuật và có giá trị chiến lược, nhưng chỉ khi:

1. Phạm vi giới hạn 1-2 ngành dọc cho Giai đoạn 1 (không phải cả 12 ngành)
2. Ngân sách bao gồm bảo trì liên tục (tối thiểu 1 FTE cho mỗi ngành dọc)
3. Ứng dụng tiêu thụ cụ thể tồn tại trước khi bắt đầu xây dựng KG
4. Đường ống NER/RE tiếng Việt được xác thực trên corpus thực trước khi cam kết xây dựng đầy đủ

### 3.2 Bảng điểm khả thi

| Chiều đánh giá | Điểm (1-10) | Nhận định |
|---|---|---|
| **Khả thi Kỹ thuật** | 7 | Công cụ trưởng thành (Neo4j, PyKEEN, LangChain GraphRAG). Tuy nhiên, xây dựng KG tự động từ văn bản tiếng Việt vẫn chưa được chứng minh — mô hình spaCy tiếng Việt yếu, trích xuất bằng LLM tốn kém ở quy mô. |
| **Nhu cầu Thị trường** | 6 | Tăng trưởng nhờ làn sóng LLM+KG (GraphRAG). Nhưng nhu cầu tại Việt Nam còn sơ khai — đa số công ty nội địa vẫn đang giải bài toán tìm kiếm cơ bản. |
| **Dữ liệu Sẵn có** | 4 | **Nút thắt cổ chai nghiêm trọng.** KG tiếng Anh (Wikidata, DBpedia) phong phú. Nguồn tri thức có cấu trúc tiếng Việt rất thưa: không có DBpedia tiếng Việt, Wikidata phủ ~800K mục có nhãn tiếng Việt trên 100M+ tổng. |
| **Rủi ro Triển khai** | 5 | Vấn đề "khởi động lạnh" nghiêm trọng. Thiết kế bản thể học đòi hỏi chuyên gia hiếm. Trích xuất LLM gây ra bộ ba ảo giác. Kiến trúc doanh nghiệp cần đội 4-6 kỹ sư. |
| **Rõ ràng ROI** | 5 | ROI của KG khét tiếng khó lượng hóa. Lợi ích gián tiếp. Hầu hết dự án KG mất 12-18 tháng để cho thấy giá trị đo được. |
| **Nhân lực Sẵn có** | 4 | Kỹ sư KG nằm ở giao điểm thiết kế bản thể học, NLP, cơ sở dữ liệu đồ thị, và chuyên gia lĩnh vực — hiếm toàn cầu, hiếm hơn tại Việt Nam. |
| **Tổng hợp Có trọng số** | **5.5 → 6** | Khả thi nếu phạm vi chặt, rủi ro nếu coi là nền tảng từ ngày đầu. |

### 3.3 Cảnh quan cạnh tranh

| Đối thủ | Loại | Quy mô | Liên quan đến MAESTRO |
|---|---|---|---|
| Google Knowledge Graph | Độc quyền, quy mô web | 500B+ sự kiện | Tiêu chuẩn vàng nhưng đóng. Đặt kỳ vọng người dùng rất cao. |
| Wikidata | Mở, cộng đồng | 100M+ mục | Mục tiêu liên kết thực thể chính. Phủ tiếng Việt mỏng (~800K mục). |
| Neo4j Aura | DBaaS đồ thị quản lý | Doanh nghiệp | Hạ tầng trực tiếp, không phải lớp khác biệt hóa. |
| Microsoft GraphRAG | Mã nguồn mở LLM+KG | Nghiên cứu/sản xuất sớm | Đối thủ trực tiếp với cách tiếp cận GraphRAG của MAESTRO. MIT, tài liệu tốt, hậu thuẫn Microsoft Research. |
| FPT.AI Knowledge | Nền tảng AI Việt Nam | Nội địa | Có tài sản NLP tiếng Việt nhưng không có sản phẩm KG công khai. Đối tác hoặc đối thủ tiềm năng. |
| Coc Coc Search | Tìm kiếm Việt Nam | Nội địa | Vận hành KG nội bộ cho tìm kiếm web tiếng Việt. Chứng minh KG tiếng Việt xây được nhưng cần đầu tư lớn. |
| Diffbot | KG tự động từ web | 10B+ thực thể | Gần nhất với đề xuất của R-β. KG thiên về tiếng Anh. |
| Stardog | Nền tảng KG doanh nghiệp | Trung bình | Đồ thị ảo / data fabric — đáng nghiên cứu. |

**Nhận định chính:** Thị trường công cụ KG mã nguồn mở đông đúc và trưởng thành. Sự khác biệt của MAESTRO không thể là "chúng tôi xây KG" — phải là "chúng tôi xây KG cho lĩnh vực X tại thị trường Y cho khả năng Z mà không ai khác cung cấp."

### 3.4 Rủi ro chính

| # | Rủi ro | Khả năng | Tác động | Giảm thiểu |
|---|---|---|---|---|
| R1 | KG trống/thưa trong nhiều tháng (khởi động lạnh) | Cao | Nghiêm trọng | Gieo trước từ tập con Wikidata + cơ sở dữ liệu có cấu trúc. Định nghĩa KG khả dụng tối thiểu (MVK). |
| R2 | Chi phí bảo trì vượt chi phí xây dựng | Cao | Cao | Phân bổ 60% ngân sách vòng đời cho bảo trì. Tự động phát hiện xung đột. |
| R3 | Trôi bản thể học / bất ổn lược đồ | Trung bình | Cao | Phiên bản hóa bản thể học. Dùng ràng buộc SHACL. Giao quyền sở hữu bản thể học cho trưởng lĩnh vực. |
| R4 | LLM trích xuất bộ ba ảo giác làm nhiễm độc KG | Cao | Cao | Ngưỡng tin cậy bắt buộc (>0.85). Con người xác nhận cho trích xuất tin cậy thấp. Theo dõi nguồn gốc mọi bộ ba. |
| R5 | Đường ống NLP tiếng Việt hoạt động kém | Cao | Cao | Đánh giá chuẩn NER/RE tiếng Việt trên corpus thực trước. Xem xét cách tiếp cận song ngữ: trích xuất từ nguồn tiếng Anh, ánh xạ thực thể sang nhãn tiếng Việt. |
| R6 | Kỹ sư KG có kỹ năng không sẵn có tại Việt Nam | Cao | Trung bình | Đào tạo kỹ sư NLP hiện có về mô hình đồ thị. Thuê chuyên gia tư vấn bản thể học cho Giai đoạn 1. |
| R7 | Không chứng minh ROI trong 12 tháng | Trung bình | Cao | Gắn KG vào tính năng sản phẩm cụ thể (chat GraphRAG, tìm kiếm liên kết thực thể) trong 3 tháng. Không xây KG riêng lẻ. |
| R8 | Microsoft GraphRAG thương mại hóa cách tiếp cận | Trung bình | Trung bình | Chấp nhận thương mại hóa tầng truy xuất. Khác biệt hóa bằng nội dung KG chuyên lĩnh vực. |
| R9 | Chi phí cấp phép Neo4j mở rộng phi tuyến | Trung bình | Trung bình | Bắt đầu Community Edition. Đánh giá ArangoDB (Apache 2.0) làm phương án dự phòng. |
| R10 | Xây KG mà không ai truy vấn | Trung bình | Nghiêm trọng | Xây dựng theo nhu cầu: chỉ thêm loại thực thể khi có ứng dụng tiêu thụ yêu cầu. |

### 3.5 Thị trường Việt Nam

**Thị trường KG toàn cầu:** Ước tính 2,1 tỷ USD (2025), dự kiến 8,1 tỷ USD vào 2030 (CAGR ~31%). Tăng trưởng nhờ LLM grounding, tìm kiếm doanh nghiệp, và tuân thủ quy định (KG tài chính cho KYC/AML).

**Bối cảnh Việt Nam:**

| Lĩnh vực | Tình trạng | Đánh giá |
|---|---|---|
| **Dữ liệu chính phủ** | Cổng data.gov.vn có ~20.000 bộ dữ liệu nhưng chất lượng không đồng nhất, nặng PDF, cập nhật không đều | Không đáng tin cậy làm nguồn gieo KG mà không làm sạch đáng kể |
| **Đăng ký doanh nghiệp** | Cổng Đăng ký Kinh doanh Quốc gia chứa dữ liệu công ty có cấu trúc | **Điểm khởi đầu rủi ro thấp nhất** cho KG doanh nghiệp |
| **Y tế** | Bệnh viện tạo ra lượng lớn ghi chú lâm sàng phi cấu trúc tiếng Việt | Giá trị cao (kiểm tra tương tác thuốc, hỗ trợ quyết định) nhưng rào cản pháp lý cao |
| **Thương mại điện tử** | Tiki, Shopee, Lazada vận hành KG sản phẩm nội bộ | Bản thể học sản phẩm chuyên biệt có thể có giá trị như hạ tầng |

**Ai thực sự cần KG tại Việt Nam:**
1. Doanh nghiệp lớn với dữ liệu nội bộ lộn xộn (ngân hàng, viễn thông, tập đoàn) — cần giải quyết thực thể và liên kết tri thức
2. Cơ quan nhà nước đang chuyển đổi số — cần khả năng tương tác mà bản thể học cung cấp
3. Công ty AI xây sản phẩm LLM — cần nền tảng tri thức thực tế mà KG cung cấp tốt hơn tìm kiếm véctơ đơn thuần

**Ai KHÔNG cần:**
- Doanh nghiệp vừa và nhỏ (99% doanh nghiệp Việt Nam) — cần tìm kiếm tốt hơn, không phải KG
- Công ty có cơ sở dữ liệu quan hệ sạch — KG thêm phức tạp không tương xứng
- Đội không có năng lực kỹ thuật dữ liệu chuyên dụng — KG không bảo trì là gánh nặng

---

## Phần 4: Đóng góp từ Chuyên gia Thực hành

### 4.1 NLP & Trích xuất Thực thể

- **Đường ống NER+RE tiếng Việt** là nút thắt cổ chai lớn nhất. VnCoreNLP và PhoNER có sẵn cho NER, nhưng trích xuất quan hệ tiếng Việt vẫn là bài toán nghiên cứu mở, không phải vấn đề đã giải.
- Khoảng cách giữa khả năng xây dựng KG tiếng Anh và tiếng Việt ít nhất 3-4 năm.
- **Đề xuất:** Chạy đánh giá chuẩn trên 500 tài liệu tiếng Việt từ lĩnh vực mục tiêu, gán nhãn thủ công, đo chất lượng trích xuất. Nếu F1 < 0.70, quay lại giám tuyển bán thủ công.
- Xem xét cách tiếp cận **song ngữ**: trích xuất từ nguồn tiếng Anh, ánh xạ thực thể sang nhãn tiếng Việt.

### 4.2 Cơ sở dữ liệu Đồ thị

- **Neo4j** là lựa chọn mặc định với đường cong học tập nhẹ nhàng (Cypher). Community Edition cho khởi đầu, Enterprise cho sản xuất.
- **ArangoDB** (Apache 2.0) là phương án dự phòng để tránh rủi ro cấp phép Neo4j mở rộng phi tuyến.
- Bắt đầu triển khai đơn nút; chỉ mở rộng sang Causal Cluster khi vượt 100M bộ ba.
- Tạo ràng buộc duy nhất (uniqueness constraints) và chỉ mục ngay từ đầu cho hiệu năng.

### 4.3 ML & Graph Embeddings

- Sử dụng **PyKEEN** (40+ mô hình) cho huấn luyện nhúng KG. Mô hình khuyến nghị: RotatE cho đa năng, ComplEx cho đơn giản.
- Huấn luyện nhúng sau khi KG có ít nhất 10K bộ ba đã xác thực.
- Dự đoán liên kết phục vụ hai mục đích: (a) bổ sung tri thức thiếu, (b) phát hiện bộ ba sai/mâu thuẫn.
- **Không nên** triển khai Temporal KG, Multimodal KG, hay Neuro-Symbolic AI trong Giai đoạn 0-1 — chúng thuộc lãnh thổ học thuật.

### 4.4 Backend & API

- **FastAPI** cho tầng API truy vấn: truy vấn vùng lân cận thực thể (đến 3 bước), tìm kiếm bộ ba (lọc theo tin cậy), tìm đường ngắn nhất.
- Tích hợp **LangChain GraphCypherQAChain** cho chuyển ngôn ngữ tự nhiên sang Cypher qua LLM.
- Định nghĩa rõ ràng phương pháp đánh giá chuẩn: (a) số bộ ba và tốc độ tăng trưởng, (b) độ chính xác bộ ba trích xuất tự động (mẫu), (c) độ trễ truy vấn p50/p95, (d) cải thiện tác vụ hạ nguồn (ví dụ: độ chính xác câu trả lời RAG có KG so với không có).

### 4.5 Frontend & Trực quan hóa

- **react-force-graph** (MIT) cho khám phá đồ thị tương tác trong ứng dụng React.
- **D3.js** cho trực quan hóa SVG tùy chỉnh cấp thấp.
- **Neo4j Bloom** (thương mại) cho khám phá nội bộ trong quá trình phát triển.
- Trực quan hóa KG nên tập trung vào truy vấn vùng lân cận (2-3 bước) — không hiển thị toàn bộ đồ thị.

### 4.6 Bảo mật

- Suy luận KG bảo toàn quyền riêng tư: học liên bang trên nhúng KG mà không chia sẻ bộ ba thô — liên quan cho y tế (dữ liệu bệnh nhân) và tài chính (đồ thị giao dịch).
- Theo dõi nguồn gốc (provenance) trên mọi bộ ba để kiểm toán.
- Kiểm soát truy cập cấp thực thể/quan hệ khi KG chứa dữ liệu nhạy cảm.

### 4.7 Y tế (Healthcare KG)

- KG y tế phục vụ kiểm tra tương tác thuốc và hỗ trợ quyết định lâm sàng.
- **Rào cản:** Quyền riêng tư dữ liệu, phê duyệt Bộ Y tế, ghi chú lâm sàng phi cấu trúc tiếng Việt.
- Bản thể học y tế có sẵn: SNOMED CT, FIBO — nhưng cần bản địa hóa cho Việt Nam.
- **Khuyến nghị:** Hoãn lại Giai đoạn 2+ do phức tạp pháp lý và chất lượng dữ liệu.

### 4.8 Tài chính (Financial KG)

- KG tài chính cho giải quyết thực thể, phát hiện gian lận, và KYC/AML.
- Dữ liệu đăng ký doanh nghiệp Việt Nam (tên công ty, quyền sở hữu, mã ngành) tương đối sạch và có cấu trúc — **điểm khởi đầu rủi ro thấp nhất** cho KG doanh nghiệp.
- Đồ thị sở hữu công ty → phát hiện mối quan hệ ẩn, đánh giá rủi ro tín dụng.

---

## Phần 5: Khuyến nghị Tổng hợp

1. **Bắt đầu với "Knowledge Graph Lite."** Neo4j Community Edition với bộ ba giám tuyển thủ công cho một ngành dọc. Chứng minh rằng tri thức có cấu trúc đồ thị cải thiện tính năng cụ thể (tìm kiếm, chat, gợi ý) trước khi đầu tư vào xây dựng tự động.

2. **Chọn ngành dọc có dữ liệu có cấu trúc tốt nhất.** Dữ liệu đăng ký doanh nghiệp Việt Nam là điểm khởi đầu rủi ro thấp nhất. Tránh y tế và dữ liệu chính phủ trong Giai đoạn 1.

3. **Xác thực NER/RE tiếng Việt trước khi cam kết.** Đánh giá chuẩn trên 500 tài liệu tiếng Việt. Nếu F1 < 0.70, quay lại giám tuyển bán thủ công.

4. **Lập ngân sách bảo trì từ ngày đầu.** Tối thiểu 1 FTE mỗi ngành dọc cho giám tuyển, giải quyết xung đột, và phát triển bản thể học. Không có ngân sách này thì không nên bắt đầu.

5. **Hoãn Temporal KG, Multimodal KG, và Neuro-Symbolic AI.** Tập trung vào cốt lõi: thực thể, quan hệ, thuộc tính, suy luận cơ bản.

6. **Định nghĩa chỉ số thành công trước khi viết mã.** Tối thiểu: (a) số bộ ba và tốc độ tăng trưởng, (b) độ chính xác bộ ba tự trích xuất, (c) độ trễ truy vấn p50/p95, (d) cải thiện tác vụ hạ nguồn.

7. **Theo dõi sát Microsoft GraphRAG.** Nếu Microsoft phát hành sản phẩm GraphRAG đa ngôn ngữ sản xuất, chiến lược KG của MAESTRO chuyển từ "xây hạ tầng KG" sang "xây nội dung KG chuyên lĩnh vực."

8. **Sử dụng Wikidata làm hạt giống, không phải nền tảng.** Trích xuất tập con tiếng Việt (~800K thực thể) làm dữ liệu khởi đầu. Xây bản thể học nhẹ riêng cho ứng dụng chuyên lĩnh vực.

9. **Xây dựng theo nhu cầu (demand-driven).** Chỉ thêm loại thực thể khi ứng dụng tiêu thụ hạ nguồn yêu cầu. Không mở rộng bản thể học đầu cơ.

10. **Gắn KG vào tính năng sản phẩm trong 3 tháng.** Chat GraphRAG hoặc tìm kiếm liên kết thực thể — để người dùng trải nghiệm giá trị sớm. Không xây KG riêng lẻ.

---

## Phần 6: Quality Checklist

| # | Tiêu chí | Trạng thái |
|---|---|---|
| 1 | Phân loại lĩnh vực đầy đủ (8 lĩnh vực con, 6 liên kết chéo) | ✅ |
| 2 | Khái niệm cốt lõi ≥ 10 | ✅ (12 khái niệm) |
| 3 | Thuật toán chính ≥ 10 | ✅ (12 thuật toán) |
| 4 | Bài báo quan trọng với tác giả, năm, đóng góp | ✅ (9 bài báo) |
| 5 | Dòng thời gian phát triển 1998-2026 | ✅ |
| 6 | Kiến trúc tham chiếu 3 cấp | ✅ |
| 7 | Bảng công nghệ đầy đủ với giấy phép | ✅ |
| 8 | Pipeline xử lý 6 giai đoạn | ✅ |
| 9 | Bảng điểm khả thi 6 chiều | ✅ (Tổng: 5.5 → 6) |
| 10 | Cảnh quan cạnh tranh ≥ 8 đối thủ | ✅ (8 đối thủ) |
| 11 | Đăng ký rủi ro ≥ 10 rủi ro | ✅ (10 rủi ro) |
| 12 | Phân tích thị trường Việt Nam | ✅ |
| 13 | Đóng góp từ 8 góc chuyên gia | ✅ |
| 14 | Khuyến nghị tổng hợp ≥ 8 | ✅ (10 khuyến nghị) |
| 15 | Toàn bộ tiếng Việt có dấu đầy đủ | ✅ |

---

## Phần 7: Câu hỏi Mở

1. **Đường ống NER/RE tiếng Việt đã đủ sẵn sàng chưa?** Cần đánh giá chuẩn trên corpus thực trước khi cam kết. Nếu F1 < 0.70, toàn bộ chiến lược xây dựng tự động phải thay đổi.

2. **Ngành dọc nào cho Giai đoạn 1?** Đăng ký doanh nghiệp (KG doanh nghiệp) được đề xuất là rủi ro thấp nhất, nhưng liệu có đủ giá trị kinh doanh để biện minh đầu tư?

3. **Microsoft GraphRAG sẽ thương mại hóa đến mức nào?** Nếu trở thành sản phẩm đa ngôn ngữ sản xuất, chiến lược MAESTRO cần chuyển hướng sang nội dung KG chuyên lĩnh vực thay vì hạ tầng.

4. **Chi phí thực sự của trích xuất LLM ở quy mô?** $0.01-0.05/tài liệu cho trích xuất; $10K-50K cho 1 triệu tài liệu, lặp lại mỗi lần tái trích xuất. Liệu giám tuyển thủ công có hiệu quả hơn cho corpus dưới 100K tài liệu?

5. **Làm sao đo lường chất lượng KG ngoài dự đoán liên kết?** Tiện ích KG thực tế (độ chính xác QA, chất lượng gợi ý, thành công tác vụ agent) tương quan kém với MRR trên benchmark chuẩn.

6. **Ai sẽ thiết kế bản thể học?** Kỹ năng thiết kế bản thể học hiếm toàn cầu, gần như không có tại Việt Nam. Thuê chuyên gia tư vấn hay đào tạo nội bộ?

7. **KG-native LLM architectures (kiến trúc LLM gốc KG) — nên theo dõi hay đầu tư?** Mô hình với cơ chế chú ý đồ thị rõ ràng trên KG đang nổi lên nhưng còn thử nghiệm.

---

*Báo cáo tổng hợp bởi Ms. Scribe (R-σ) cho Nền tảng MAESTRO Knowledge Graph. Tài liệu này hợp nhất báo cáo nghiên cứu (R-α), báo cáo kỹ thuật (R-β), và báo cáo khả thi (R-γ) cho baseline B11 (Đồ thị Tri thức). Sự khác biệt giữa thành công và thất bại của KG là kỷ luật, không phải công nghệ.*
