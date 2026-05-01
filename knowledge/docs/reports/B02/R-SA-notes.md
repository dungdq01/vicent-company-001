# Ghi chú Solutions Architect: B02 — Document Intelligence
## Tác giả: R-SA — Ngày: 2026-03-31

---

## Góc nhìn chuyên môn

Từ góc nhìn Solutions Architect, Document Intelligence không tồn tại độc lập — nó là một capability (khả năng) được tích hợp vào enterprise workflows rộng hơn. Hóa đơn sau khi extract phải flow vào ERP system. Hợp đồng sau khi phân tích phải sync với CRM và legal management. Chứng từ kế toán phải đối soát với sổ sách. Thiết kế kiến trúc phải đặt Document Intelligence như một platform service, không phải standalone application.

Integration patterns (mẫu tích hợp) cho enterprise Document Intelligence cần xem xét kỹ hệ sinh thái phần mềm hiện có tại doanh nghiệp Việt Nam. Phần lớn doanh nghiệp vừa và lớn sử dụng SAP, Oracle ERP, hoặc các ERP nội địa (MISA, Fast, Bravo). Hệ thống Document Intelligence cần connectors hoặc adapters cho các ERP phổ biến này. Standard integration protocols: REST APIs, SOAP (cho legacy systems), file-based (CSV/Excel export), và database-level integration (cho MISA).

Kiến trúc tổng thể nên theo mô hình Platform-as-a-Service (PaaS) nội bộ. Document Intelligence Platform cung cấp core capabilities (OCR, extraction, validation) qua APIs. Các business applications (kế toán, nhân sự, pháp lý) consume APIs này và add domain-specific logic. Separation of concerns — platform team lo AI/ML, business teams lo workflows. Mô hình này scale tốt khi thêm use cases mới.

Quyết định build vs buy là critical ở cấp độ architect. Thị trường có nhiều Document AI SaaS — Google Document AI, AWS Textract, Azure Form Recognizer, và các vendor Việt Nam (FPT.AI, VinBigData). Tuy nhiên, với yêu cầu customization cao cho tài liệu Việt Nam, data sovereignty (chủ quyền dữ liệu), và long-term cost optimization, hybrid approach thường tối ưu: dùng cloud AI cho commodity tasks (general OCR), build custom cho domain-specific extraction.

High availability (HA — tính sẵn sàng cao) và disaster recovery (DR — khôi phục thảm họa) cho Document Intelligence platform cần thiết kế theo business criticality. Hóa đơn xử lý chậm 1 giờ không sao, nhưng mất dữ liệu hóa đơn đã extract là thảm họa. Kiến trúc cần: active-passive database replication, cross-AZ deployment, document storage replication, và tested recovery procedures. SLA target: 99.9% uptime (< 8.7 giờ downtime/năm).

## Khuyến nghị kỹ thuật

1. **Platform Architecture — Layered Design**:
```
┌─────────────────────────────────────────────┐
│  Business Applications Layer                 │
│  (Accounting, HR, Legal, Procurement)        │
├─────────────────────────────────────────────┤
│  Workflow & Orchestration Layer               │
│  (Document routing, approval flows, rules)   │
├─────────────────────────────────────────────┤
│  Document Intelligence Platform APIs          │
│  (Upload, OCR, Extract, Validate, Search)    │
├─────────────────────────────────────────────┤
│  AI/ML Engine Layer                           │
│  (OCR Models, NLP, Layout Analysis, VLMs)    │
├─────────────────────────────────────────────┤
│  Infrastructure Layer                         │
│  (K8s, GPU, Storage, Database, Queue)        │
└─────────────────────────────────────────────┘
```
Mỗi layer có API contract rõ ràng, deploy độc lập.

2. **Integration Hub Pattern**: Thay vì point-to-point integration với mỗi enterprise system, xây dựng integration hub:
   - Inbound adapters: Email inbox, FTP/SFTP, API upload, scan folder watching, mobile app
   - Outbound adapters: ERP connector (SAP RFC, MISA API), CRM sync, accounting software, email notification
   - Transformation layer: Map extracted data sang format target system yêu cầu

3. **Multi-tenant Architecture Decision**:
   - **Shared infrastructure, isolated data** (recommended cho SaaS)
   - Tenant-specific: extraction templates, business rules, user management, storage buckets
   - Shared: OCR models, processing infrastructure, platform services
   - Tenant isolation via: database schema separation (schema-per-tenant in PostgreSQL), storage path prefix, API key routing

4. **Document Workflow Engine**: Tích hợp workflow engine (Temporal hoặc Camunda) cho complex document processing flows:
   - Auto-classification → extraction → validation rules → human review (if needed) → approval → export to ERP
   - Configurable per tenant, per document type
   - Audit trail cho compliance

5. **Hybrid Cloud Strategy**:
   - Sensitive data processing: On-premises hoặc VN-based cloud (Viettel Cloud, VNPT Cloud)
   - GPU inference: Public cloud (AWS/GCP) nếu data residency cho phép
   - Object storage: Multi-cloud replicated
   - API gateway: Cloud-agnostic (Kong/Traefik)
   Cân nhắc kỹ regulation về data residency cho tài liệu tài chính.

6. **API Gateway & Service Mesh**:
   - Kong hoặc AWS API Gateway cho external APIs — rate limiting, authentication, quota management
   - Istio hoặc Linkerd cho internal service mesh — mTLS, traffic management, observability
   - API versioning strategy: URL-based (/v1/, /v2/) cho major versions

7. **Search & Discovery Layer**: Elasticsearch cho full-text search trên extracted document content. Cho phép users tìm "hóa đơn từ Công ty ABC tháng 3/2026 trên 10 triệu". Vector search (embedding similarity) cho semantic search — tìm hợp đồng tương tự, clause matching.

8. **Event-Driven Integration**:
```
Document Processed → Event Published →
  ├── ERP Adapter consumes → Create accounting entry
  ├── Notification Service → Email user
  ├── Analytics Service → Update dashboards
  ├── Knowledge Graph (B01) → Update relationships
  └── Audit Service → Log for compliance
```
Loose coupling, mỗi consumer xử lý independently.

9. **Scalability Projection**:
   | Phase | Users | Docs/Day | Storage/Month | GPU Nodes |
   |-------|-------|----------|---------------|-----------|
   | MVP | 50 | 500 | 25 GB | 1 |
   | Growth | 500 | 5,000 | 250 GB | 2-4 |
   | Scale | 5,000 | 50,000 | 2.5 TB | 8-16 |
   | Enterprise | 50,000 | 500,000 | 25 TB | 32+ |

10. **Technology Radar cho Document AI**:
    - **Adopt**: PaddleOCR, LayoutLMv3, FastAPI, PostgreSQL, Kubernetes
    - **Trial**: Donut (OCR-free), Qwen-VL, Temporal workflows
    - **Assess**: GPT-4V for complex documents, on-device OCR (mobile)
    - **Hold**: Tesseract standalone (accuracy thấp), monolithic architecture

## Rủi ro & Thách thức

1. **Vendor lock-in**: Nếu dùng cloud-specific AI services (AWS Textract, Google Document AI), migration cost rất cao. Recommend: abstract AI layer behind internal API, cho phép swap underlying provider. Tuy nhiên, abstraction layer cũng có maintenance cost.

2. **Integration complexity**: Mỗi enterprise customer có ERP/accounting software khác nhau. Custom integration cho mỗi customer tốn 2-4 tuần dev effort. Cần investment vào connector framework và low-code integration tools để giảm marginal cost per customer.

3. **Data sovereignty requirements**: Luật Việt Nam (Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân) yêu cầu certain data phải lưu trữ tại Việt Nam. Cloud provider options limited. On-premises deployment cần investment lớn vào infrastructure và operations team.

4. **Scope creep từ business stakeholders**: "Document Intelligence" dễ bị expand thành "everything document" — từ OCR → workflow → approval → archival → compliance → audit. Cần clear product boundary và phased roadmap. Platform layer chỉ lo AI/ML, workflow layer riêng.

5. **Legacy system integration**: Nhiều doanh nghiệp Việt Nam vẫn dùng systems cũ (MISA 2015, Excel-based accounting). Integration với legacy cần đặc biệt cẩn thận — file-based (CSV/Excel export) hoặc database-level integration, không có API.

## Công cụ & Thư viện đề xuất

| Công cụ | Mục đích | Ghi chú |
|---------|---------|---------|
| **Kong** | API Gateway | Rate limiting, auth |
| **Temporal** | Workflow orchestration | Durable workflows |
| **Elasticsearch** | Full-text search | Document search |
| **Istio** | Service mesh | mTLS, traffic mgmt |
| **Keycloak** | Identity management | SSO, RBAC, OIDC |
| **Apache Camel** | Integration framework | 300+ connectors |
| **Debezium** | CDC for sync | Real-time data sync |
| **Terraform** | IaC | Multi-cloud deploy |
| **Minio** | Object storage | S3-compatible, self-hosted |
| **Redis** | Cache & pub/sub | Event distribution |
| **Grafana** | Observability | Unified dashboards |

## Ghi chú cho R-σ (Consolidation)

- **Kiến trúc**: 5-layer platform design. Document Intelligence là platform service, không phải standalone app.
- **Integration**: Hub pattern — inbound adapters (email, API, scan) → processing → outbound adapters (ERP, CRM, accounting).
- **Build vs Buy**: Hybrid — cloud AI cho general OCR, custom build cho Vietnamese-specific extraction. Abstract AI layer.
- **Multi-tenancy**: Schema-per-tenant PostgreSQL, shared compute, isolated storage. Configurable per tenant.
- **Data sovereignty**: Nghị định 13/2023/NĐ-CP cần review. On-prem hoặc VN-based cloud cho sensitive data.
- **Scale path**: MVP 500 docs/day → Enterprise 500K docs/day. Architecture phải support từ đầu.
- **Key integration targets**: SAP, MISA, Fast, Bravo (ERP Việt Nam). File-based fallback cho legacy.
