# Ghi chú Backend Engineer: B02 — Document Intelligence
## Tác giả: R-BE — Ngày: 2026-03-31

---

## Góc nhìn chuyên môn

Từ góc nhìn Backend Engineer, Document Intelligence là bài toán thiết kế hệ thống xử lý bất đồng bộ (asynchronous processing) quy mô lớn. Khác với API thông thường response trong milliseconds, document processing mất từ vài giây đến vài phút per document. Kiến trúc backend phải handle long-running tasks, provide progress tracking, và deliver results reliably — tất cả qua API interface sạch sẽ cho frontend và third-party integrations.

Microservices architecture (kiến trúc vi dịch vụ) là lựa chọn tự nhiên cho Document Intelligence vì mỗi bước xử lý có scaling requirements khác nhau. Document Upload Service cần handle concurrent uploads và file validation. OCR Service cần GPU và scale riêng. Extraction Service chạy business logic trên OCR output. Validation Service kiểm tra kết quả. Storage Service quản lý documents và metadata. Mỗi service giao tiếp qua message queue, không gọi trực tiếp nhau.

API design cho Document Intelligence cần cân bằng giữa simplicity và flexibility. Client upload document → nhận job_id → poll hoặc webhook khi hoàn thành. Nhưng thực tế phức tạp hơn: client muốn biết đang ở bước nào (uploading? processing? extracting?), muốn cancel job, muốn re-process với config khác, muốn batch upload 1000 tài liệu. API phải support tất cả use cases này mà vẫn giữ interface đơn giản.

Multitenancy (đa thuê bao) là yêu cầu thiết yếu cho enterprise Document Intelligence platform. Mỗi tenant có document types riêng, extraction rules riêng, quality thresholds riêng, và data isolation hoàn toàn. Backend phải implement tenant-aware routing ở mọi layer — từ upload, processing queue priority, đến storage và access control. Shared infrastructure nhưng isolated data.

Error handling và retry logic trong document processing pipeline phức tạp vì mỗi failure mode cần strategy khác. OCR timeout → retry with smaller DPI. Format unsupported → reject với clear error message. Extraction confidence thấp → route to human review queue. System error → retry with exponential backoff. Dead letter queue cho documents fail sau N retries, với alerting cho operations team.

## Khuyến nghị kỹ thuật

1. **RESTful API Design**:
```
POST   /api/v1/documents              # Upload document
GET    /api/v1/documents/{id}          # Get document status & results
GET    /api/v1/documents/{id}/status   # Lightweight status check
DELETE /api/v1/documents/{id}          # Delete document
POST   /api/v1/documents/batch         # Batch upload
GET    /api/v1/documents?type=invoice  # List & filter
POST   /api/v1/documents/{id}/reprocess  # Re-process
PATCH  /api/v1/documents/{id}/extracted # Human correction
```
Versioned API, consistent error format, pagination cho list endpoints.

2. **Async Processing với Celery + Redis**: Document processing là background task. Upload API return 202 Accepted + job_id ngay lập tức. Celery workers xử lý async, update status trong Redis. Client poll hoặc subscribe WebSocket/SSE cho real-time updates.

3. **Webhook System cho Enterprise Integration**:
```python
# Webhook payload khi document processed
{
    "event": "document.processed",
    "document_id": "uuid",
    "status": "completed",  # or "failed", "needs_review"
    "extracted_data": {...},
    "confidence": 0.95,
    "timestamp": "2026-03-31T10:00:00Z"
}
```
Retry logic cho webhook delivery, signature verification, configurable per tenant.

4. **Rate Limiting & Quotas per Tenant**: Implement tiered quotas — Free: 100 docs/tháng, Standard: 5,000 docs/tháng, Enterprise: unlimited. Rate limiting per API key: 10 requests/second cho upload, 100 req/s cho status check. Redis-based sliding window counter.

5. **Document Processing Pipeline as State Machine**:
```
UPLOADED → QUEUED → PREPROCESSING → OCR_PROCESSING →
EXTRACTING → VALIDATING → COMPLETED/NEEDS_REVIEW/FAILED
```
State transitions logged, queryable. Mỗi state có timeout — nếu stuck quá N phút, auto-retry hoặc alert.

6. **gRPC cho Internal Service Communication**: RESTful cho external API, gRPC cho internal microservice communication. Protobuf serialization giảm payload size 5-10x so với JSON, critical khi truyền OCR results (bounding boxes, confidence per character).

7. **File Upload Handling**:
   - Multipart upload cho files < 50MB
   - Presigned URL + chunked upload cho files > 50MB
   - Virus scanning (ClamAV) trước processing
   - File type validation (magic bytes, không chỉ extension)
   - Max file size: 100MB per document, 1GB per batch

8. **Caching Strategy**:
   - Redis cache cho document status (TTL 5 min, invalidate on state change)
   - CDN cache cho processed document previews (thumbnails)
   - Application cache cho extraction templates per document type
   - Cache extracted results cho repeated queries (TTL 1 hour)

9. **Health Check & Circuit Breaker**: Implement circuit breaker pattern cho OCR service calls — nếu OCR service fail 5 lần liên tiếp trong 1 phút, circuit opens, queue documents thay vì call tiếp. Auto-recovery khi service healthy lại. Health endpoint `/health` cho load balancer.

10. **Audit Trail**: Mọi action trên document phải logged — who uploaded, when processed, who reviewed, what corrected. Immutable audit log trong separate database table. Compliance requirement cho financial documents tại Việt Nam.

## Rủi ro & Thách thức

1. **Long-running request handling**: Document processing có thể mất 30 giây đến 5 phút. HTTP connection timeout, load balancer timeout, client timeout — tất cả cần configured đúng. Webhook/SSE là giải pháp nhưng tăng complexity. Client-side polling là fallback reliable nhất.

2. **File storage security**: Documents chứa thông tin nhạy cảm. Cần server-side encryption, signed URLs với expiry, access control per document/tenant. Data breach có thể gây hậu quả pháp lý nghiêm trọng. Không bao giờ log document content vào application logs.

3. **Backward compatibility khi API evolve**: Khi thêm document types mới hoặc extraction fields mới, API response schema thay đổi. Cần versioned API, deprecation policy rõ ràng (minimum 6 tháng notice), và backward-compatible changes only trong minor versions.

4. **Message queue reliability**: Nếu queue mất message, document "biến mất" — user upload nhưng không bao giờ nhận kết quả. Cần persistent queue, acknowledgment mechanism, và reconciliation job chạy hàng ngày kiểm tra orphaned documents.

5. **Concurrent processing conflicts**: Hai users cùng edit extracted data của một document, hoặc human correction submit trong khi reprocessing đang chạy. Cần optimistic locking (version field) và clear UX cho conflict resolution.

## Công cụ & Thư viện đề xuất

| Công cụ | Mục đích | Ghi chú |
|---------|---------|---------|
| **FastAPI** | API framework | Async, OpenAPI auto-docs |
| **Celery** | Task queue | Distributed processing |
| **Redis** | Cache + queue broker | Fast, reliable |
| **RabbitMQ** | Message queue | Durable, routing |
| **PostgreSQL** | Primary database | JSONB, full-text search |
| **MinIO** | Object storage | S3-compatible |
| **gRPC + Protobuf** | Internal communication | Low latency |
| **SQLAlchemy** | ORM | Type-safe queries |
| **Alembic** | DB migrations | Version-controlled schema |
| **Pydantic** | Data validation | Request/response models |
| **ClamAV** | Virus scanning | File upload security |
| **Sentry** | Error tracking | Real-time alerts |
| **OpenTelemetry** | Distributed tracing | Request flow visibility |

## Ghi chú cho R-σ (Consolidation)

- **Kiến trúc**: Microservices, event-driven, async processing. FastAPI + Celery + Redis + PostgreSQL core stack.
- **API pattern**: Upload → 202 Accepted + job_id → Poll/Webhook → Results. RESTful external, gRPC internal.
- **Multitenancy**: Tenant-aware routing, isolated data, configurable quotas. Thiết kế từ đầu, không retrofit.
- **State machine**: 7 states cho document processing lifecycle. Timeout và auto-recovery cho mỗi state.
- **Security**: Encryption, signed URLs, virus scanning, audit trail. Non-negotiable cho enterprise.
- **Scale target**: 10K documents/ngày với 4 API instances + 8 Celery workers. Horizontal scaling ready.
