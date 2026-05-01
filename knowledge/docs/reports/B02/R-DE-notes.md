# Ghi chú Data Engineer: B02 — Document Intelligence
## Tác giả: R-DE — Ngày: 2026-03-31

---

## Góc nhìn chuyên môn

Từ góc nhìn Data Engineer, Document Intelligence đặt ra những thách thức đặc thù về data pipeline mà các hệ thống data truyền thống không gặp phải. Tài liệu không phải structured data — chúng là unstructured blobs (khối dữ liệu phi cấu trúc) dưới dạng PDF, ảnh scan, Word, Excel, thậm chí ảnh chụp điện thoại. Pipeline ingestion (thu nạp dữ liệu) phải xử lý được hàng chục format đầu vào, normalize chúng về format chuẩn, và đảm bảo traceability (khả năng truy vết) từ raw input đến extracted output.

Khối lượng dữ liệu trong Document Intelligence rất lớn nhưng có đặc thù riêng. Một doanh nghiệp vừa tại Việt Nam có thể xử lý 500-2,000 hóa đơn/ngày, mỗi hóa đơn là ảnh 1-5MB. Tổng cộng 1-10GB raw data/ngày, nhưng extracted structured data chỉ vài MB. Pipeline cần tối ưu cho use case "wide input, narrow output" này — storage cho raw documents rẻ (S3/MinIO), nhưng processing cần compute mạnh (GPU cho OCR).

Một thách thức quan trọng là data lineage (dòng đời dữ liệu). Khi một con số trên hóa đơn được extract sai, cần trace ngược lại xem lỗi ở bước nào: scan quality? OCR? Post-processing? Business rule? Mỗi bước trong pipeline phải log đầy đủ metadata — confidence scores, bounding boxes, intermediate results. Điều này tăng storage 3-5x nhưng cực kỳ quan trọng cho debugging và audit compliance (tuân thủ kiểm toán).

Data versioning (quản lý phiên bản dữ liệu) là yếu tố sống còn cho Document Intelligence. Khi model được retrain, kết quả extraction có thể thay đổi. Cần lưu trữ cả original document, extracted data theo từng model version, và human corrections. DVC (Data Version Control) hoặc LakeFS là công cụ phù hợp để quản lý dataset versions phục vụ retraining.

Thiết kế schema cho extracted data đòi hỏi sự linh hoạt cao. Mỗi loại tài liệu có cấu trúc khác nhau — hóa đơn VAT có mã số thuế, ngày, tổng tiền; hợp đồng có bên A, bên B, điều khoản; bảng lương có danh sách nhân viên, mức lương. Schema cần semi-structured (bán cấu trúc) — dùng JSON/JSONB trong PostgreSQL hoặc document store như MongoDB, kết hợp với typed fields cho common attributes.

## Khuyến nghị kỹ thuật

1. **Document Ingestion Pipeline với Apache Airflow**: Xây dựng DAG pipeline: Upload → Format Detection → Preprocessing → OCR → Post-processing → Validation → Storage. Mỗi bước là một task riêng, có retry logic và dead letter queue cho documents lỗi.

2. **Multi-format Parser Layer**: Sử dụng Apache Tika hoặc tự build parser layer hỗ trợ: PDF (PyMuPDF), Word (python-docx), Excel (openpyxl), Images (Pillow), Scanned PDF (pdf2image). Normalize tất cả về standardized image format trước khi đưa vào OCR.

3. **Object Storage cho Raw Documents**: MinIO (self-hosted) hoặc S3 cho raw document storage. Cấu trúc path: `/{tenant_id}/{year}/{month}/{doc_type}/{doc_id}/original.*`. Metadata stored trong PostgreSQL, binary trong object storage.

4. **Event-Driven Architecture**: Sử dụng message queue (RabbitMQ hoặc Apache Kafka) giữa các bước pipeline. Document upload trigger message → OCR worker consume → Result publish → Post-processing consume. Decoupling cho phép scale từng component độc lập.

5. **Data Quality Checks tại mỗi bước**: Implement data quality gates — image resolution check (reject < 150 DPI), OCR confidence threshold (flag < 80%), business rule validation (mã số thuế phải 10 hoặc 13 số). Dùng Great Expectations framework.

6. **CDC (Change Data Capture) cho real-time sync**: Khi extracted data thay đổi (human correction, re-extraction), CDC stream changes đến downstream systems. Debezium + Kafka Connect cho PostgreSQL CDC.

7. **Document Deduplication Pipeline**: Hash-based dedup (perceptual hash cho images, content hash cho PDFs) để phát hiện duplicate documents trước khi xử lý. Tiết kiệm compute và tránh duplicate entries trong database.

8. **Batch Processing cho Historical Data**: Design batch pipeline riêng cho backfill — xử lý hàng triệu tài liệu lịch sử. Spark hoặc Dask cho distributed processing, với priority queue thấp hơn real-time pipeline.

9. **Metadata-rich Storage Schema**:
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    doc_type VARCHAR(50),
    original_path TEXT,
    processed_path TEXT,
    ocr_model_version VARCHAR(20),
    extraction_confidence FLOAT,
    extracted_data JSONB,
    human_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ
);
CREATE INDEX idx_doc_type ON documents(tenant_id, doc_type);
CREATE INDEX idx_extracted ON documents USING GIN(extracted_data);
```

10. **Data Retention Policy**: Thiết lập policy rõ ràng — raw documents giữ 7 năm (theo luật kế toán VN), extracted data giữ vĩnh viễn, intermediate processing artifacts giữ 90 ngày. Lifecycle rules trên S3/MinIO tự động archive/delete.

## Rủi ro & Thách thức

1. **Data Privacy & Compliance**: Tài liệu doanh nghiệp chứa thông tin nhạy cảm — CMND/CCCD, mã số thuế, thông tin tài chính. Cần encryption at rest (AES-256) và in transit (TLS 1.3). GDPR/PDPA compliance nếu phục vụ khách hàng quốc tế. PII detection pipeline cần chạy trước khi log bất kỳ extracted text nào.

2. **Scale bottleneck tại OCR step**: OCR là bước chậm nhất trong pipeline (2-10 giây/trang với GPU, 10-30 giây với CPU). Với 10,000 tài liệu/ngày, cần queue management cẩn thận để tránh backlog. Auto-scaling GPU workers phức tạp và tốn kém.

3. **Schema Evolution**: Khi thêm document type mới hoặc trường extraction mới, schema phải evolve mà không break downstream consumers. Cần schema registry (Confluent Schema Registry) và backward-compatible migrations.

4. **Data Consistency giữa raw và extracted**: Race conditions khi document được re-process trong khi downstream đang đọc old version. Cần optimistic locking hoặc versioned reads để đảm bảo consistency.

5. **Network bandwidth cho document upload**: Upload hàng nghìn ảnh/ngày từ các chi nhánh về central processing. Cần compression, chunked upload, và edge caching nếu có nhiều locations.

## Công cụ & Thư viện đề xuất

| Công cụ | Mục đích | Ghi chú |
|---------|---------|---------|
| **Apache Airflow** | Pipeline orchestration | DAG-based, extensive monitoring |
| **Apache Kafka** | Message queue / streaming | High throughput, durable |
| **MinIO** | Object storage (self-hosted) | S3-compatible, free |
| **PostgreSQL + JSONB** | Metadata + extracted data | Semi-structured, indexable |
| **Redis** | Cache, job queue | Celery broker, result cache |
| **Great Expectations** | Data quality validation | Automated quality checks |
| **DVC** | Data version control | Track training datasets |
| **Apache Tika** | Format detection & parsing | 1000+ file formats |
| **PyMuPDF (fitz)** | PDF processing | Fast, feature-rich |
| **Debezium** | CDC connector | Real-time data sync |
| **LakeFS** | Data lake versioning | Git-like for data |
| **Celery** | Task queue | Distributed workers |
| **Docker + K8s** | Container orchestration | Scale OCR workers |

## Ghi chú cho R-σ (Consolidation)

- **Kiến trúc pipeline**: Event-driven, decoupled — Upload → Queue → OCR → Queue → Post-process → Store. Mỗi bước scale độc lập.
- **Storage strategy**: Object storage cho raw docs, PostgreSQL+JSONB cho extracted data, Redis cho cache. Tách biệt hot/warm/cold tiers.
- **Data quality là ưu tiên hàng đầu**: Quality gates tại mỗi bước pipeline. Không có data quality → không có model quality.
- **Compliance bắt buộc**: Encryption, access control, audit logging, retention policy. Đặc biệt quan trọng với tài liệu tài chính.
- **Scale estimate**: 10K docs/ngày cần ~4 GPU workers, 50GB storage/tháng cho raw, 500MB cho extracted data.
- **Integration point**: Pipeline output feed vào Knowledge Graph (B01) và các module downstream khác.
