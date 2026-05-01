# Ghi chú QA Engineer: B02 — Document Intelligence
## Tác giả: R-QA — Ngày: 2026-03-31

---

## Góc nhìn chuyên môn

Từ góc nhìn QA Engineer, Document Intelligence là một trong những hệ thống khó test nhất vì output không deterministic (không tất định). Cùng một document, qua các model versions khác nhau, có thể cho kết quả khác nhau. Thậm chí cùng model, với preprocessing parameters hơi khác, kết quả OCR cũng thay đổi. QA cho Document AI không thể chỉ dùng unit tests truyền thống — cần kết hợp functional testing, accuracy testing, visual testing, và chaos testing.

Test data management cho Document Intelligence là bài toán riêng. Cần bộ test documents đa dạng — khác nhau về chất lượng scan (từ crisp 600 DPI đến blurry 72 DPI), loại tài liệu (hóa đơn, hợp đồng, chứng từ), ngôn ngữ (tiếng Việt có dấu, song ngữ Việt-Anh), và edge cases (document xoay nghiêng, bị che một phần, có watermark, nhiều trang). Mỗi test document cần ground truth annotation — giá trị đúng cho mọi trường cần extract.

Edge cases trong Document Intelligence cực kỳ đa dạng và khó lường trước. Một số ví dụ thực tế: hóa đơn in trên giấy nhiệt bị phai màu; scan 2 trang chồng lên nhau; chữ ký đè lên text quan trọng; stamp đỏ che số tiền; tài liệu có bảng phức tạp với merged cells; PDF có embedded fonts lạ; ảnh chụp bằng điện thoại có glare từ đèn. QA cần maintain một "museum of horrors" — bộ sưu tập các document khó nhất để regression testing.

Performance testing cho Document Intelligence cần simulate realistic workload patterns. Không chỉ "N documents/giây" mà phải test burst patterns (500 hóa đơn upload cùng lúc cuối tháng khi kế toán đối soát), large documents (hợp đồng 100 trang), và mixed workloads (hóa đơn đơn giản xen kẽ báo cáo tài chính phức tạp). GPU resource contention (tranh chấp tài nguyên GPU) dưới load cần đặc biệt lưu ý.

Security testing cho document processing cũng là trách nhiệm của QA. Malicious file upload (PDF chứa malware, zip bomb, polyglot files), path traversal qua filename, SSRF qua document URLs, và information leakage qua error messages đều là attack vectors cần test. Đặc biệt với enterprise system xử lý tài liệu nhạy cảm, penetration testing là bắt buộc.

## Khuyến nghị kỹ thuật

1. **Test Pyramid cho Document Intelligence**:
   - **Unit Tests (60%)**: Preprocessing functions, extraction rules, business logic validation, data transformation
   - **Integration Tests (25%)**: API endpoints, queue processing, database operations, service-to-service communication
   - **E2E/Accuracy Tests (15%)**: Full pipeline — upload document → verify extracted results match ground truth
   Tự động chạy trong CI/CD, block deploy nếu fail.

2. **Golden Dataset cho Regression Testing**: Maintain curated dataset 200+ documents với verified ground truth:
   - 50 hóa đơn VAT (đa dạng template)
   - 30 phiếu xuất/nhập kho
   - 30 hợp đồng (nhiều dạng)
   - 20 bảng lương/payslip
   - 20 báo cáo tài chính
   - 50 edge cases (low quality, rotated, handwritten, stamps)
   Mỗi model update phải pass regression trên toàn bộ dataset.

3. **Accuracy Threshold Gates trong CI/CD**:
```yaml
quality_gates:
  overall_field_accuracy: >= 0.95
  invoice_total_amount_accuracy: >= 0.99
  tax_id_accuracy: >= 0.99
  date_accuracy: >= 0.97
  regression_tolerance: -0.5%  # không cho phép accuracy giảm > 0.5%
```
Pipeline tự động so sánh accuracy của model mới vs production model.

4. **Visual Regression Testing**: Overlay extracted bounding boxes lên document images, compare với expected positions. Sử dụng pixel-diff tools (Percy, reg-suit) để detect layout understanding regressions. Đặc biệt quan trọng khi update preprocessing pipeline.

5. **Chaos Testing cho Pipeline Resilience**:
   - Kill OCR service mid-processing → document phải re-queue, không mất
   - Database unavailable 30 giây → queue buffer, process khi DB recovery
   - GPU OOM (Out of Memory) → graceful fallback sang CPU hoặc reject large doc
   - Message queue restart → no message loss
   - Storage full → clear error, no data corruption
   Dùng Chaos Monkey hoặc Litmus Chaos trên Kubernetes.

6. **Load Testing Scenarios**:
```
Scenario 1: Steady load — 100 docs/giờ for 24 hours
Scenario 2: Burst — 500 docs in 5 minutes (month-end accounting)
Scenario 3: Large docs — 50 documents × 100 pages each
Scenario 4: Mixed — 70% invoices + 20% contracts + 10% reports
Scenario 5: Concurrent tenants — 10 tenants × 50 docs/giờ simultaneously
```
Target: P99 processing time < 60 giây cho single-page, < 5 phút cho 100-page.

7. **Security Test Cases**:
   - Upload .exe renamed to .pdf → reject
   - PDF with JavaScript → sanitize
   - Zip bomb (42.zip) → size limit enforcement
   - Filename with path traversal (../../etc/passwd) → sanitize
   - Oversized file (>100MB) → reject with proper error
   - Concurrent uploads exceeding quota → rate limit enforcement
   - Access document of different tenant → 403 Forbidden

8. **Contract Testing giữa Microservices**: Sử dụng Pact hoặc Spring Cloud Contract để verify API contracts giữa services. Khi OCR service thay đổi output format, consumer tests catch breaking changes trước khi deploy.

9. **Accessibility Testing cho Document Viewer UI**: Document viewer phải accessible — screen reader support cho extracted text, keyboard navigation, high contrast mode. WCAG 2.1 AA compliance. Test với NVDA/JAWS screen readers.

10. **Data Privacy Testing**: Verify PII masking trong logs, extracted data encrypted at rest, temporary files cleaned up after processing, no document content in error messages sent to client. Automated scan cho PII leakage trong log files.

## Rủi ro & Thách thức

1. **Test data maintenance cost**: Ground truth documents cần update khi template thay đổi, model expectations evolve. Với 200+ documents, mỗi lần update ground truth mất 2-3 ngày human effort. Cần automation tools cho annotation nhưng vẫn cần human verification.

2. **Flaky accuracy tests**: OCR results có thể vary slightly giữa runs (floating point, preprocessing randomness). Cần tolerance thresholds hợp lý — quá tight gây false failures, quá loose bỏ qua real regressions. Recommend: fixed random seed trong test environment.

3. **Lack of production-representative test data**: Test documents thường "sạch" hơn production data. Cần định kỳ sample production documents (anonymized) vào test suite. Nếu không, accuracy trong test có thể cao hơn production 3-5%.

4. **Testing GPU-dependent components locally**: Developers không có GPU trên local machine. Cần GPU-enabled CI runners hoặc mock layer cho GPU inference trong unit tests. Cloud-based GPU runners tăng CI cost.

5. **Regression detection delay**: Accuracy regression có thể subtle — 0.2% drop trên một document type cụ thể. Cần granular metrics per document type, not just overall accuracy. Dashboard với trend lines detect slow degradation.

## Công cụ & Thư viện đề xuất

| Công cụ | Mục đích | Ghi chú |
|---------|---------|---------|
| **Pytest** | Test framework | Fixtures, parametrize |
| **Locust** | Load testing | Python-based, distributed |
| **Pact** | Contract testing | Consumer-driven contracts |
| **Chaos Monkey / Litmus** | Chaos testing | K8s-native |
| **Percy** | Visual regression | Screenshot comparison |
| **OWASP ZAP** | Security testing | API security scan |
| **Allure** | Test reporting | Rich reports, trends |
| **Faker** | Test data generation | Vietnamese locale support |
| **Testcontainers** | Integration testing | Dockerized dependencies |
| **k6** | Performance testing | Scriptable, CI-friendly |
| **Label Studio** | Ground truth management | Annotation interface |
| **Selenium/Playwright** | E2E UI testing | Document viewer testing |

## Ghi chú cho R-σ (Consolidation)

- **Test strategy**: Test pyramid — 60% unit, 25% integration, 15% E2E/accuracy. Golden dataset 200+ documents.
- **Quality gates**: Field accuracy ≥ 95%, key fields (total, tax ID) ≥ 99%. Block deploy nếu regression > 0.5%.
- **Edge cases là critical**: Maintain "museum of horrors" — worst-case documents cho regression testing. Real production examples.
- **Performance targets**: P99 < 60s single-page, < 5min 100-page. Burst test 500 docs/5min.
- **Security**: File upload validation, PII leakage testing, tenant isolation verification. Penetration test annually.
- **Key risk**: Test data maintenance cost cao. Cần investment 2-3 days/tháng cho ground truth updates.
