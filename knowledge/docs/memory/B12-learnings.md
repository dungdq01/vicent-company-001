# Memory: B12 — Search & RAG
## Ngày: 2026-03-31

---

## Tổng kết

B12 Search & RAG hoàn thành nghiên cứu L3 depth với 16 agents. Verdict: **CONDITIONAL GO** tại **8.0/10** — điểm cao nhất portfolio MAESTRO (vượt B06 Optimization 8.4 nếu tính riêng tech+market).

## Điểm nổi bật

1. **Tech Feasibility + Market Demand đều 9/10:** RAG là pattern AI phổ biến nhất 2024-2026, 80%+ enterprise AI projects dùng RAG
2. **Data Availability 7/10 (cao nhất nhóm B08-B12):** Documents đã tồn tại — chỉ cần chunking + embedding, không cần labeled data
3. **Vietnam market $50-100M:** Legal search (Thư viện Pháp luật), enterprise search, e-commerce product search
4. **Beachhead:** Legal search (Tier 1) → Enterprise search (Tier 2) → E-commerce (Tier 3)

## Bài học rút ra

1. **Elasticsearch + basic RAG covers 80% use cases:** Không cần GraphRAG cho đa số khách hàng VN
2. **Vietnamese embedding: BGE-M3 là best option hiện tại** nhưng cần fine-tune trên domain-specific Vietnamese data
3. **Enterprise connectors là moat thực sự:** Tích hợp với MISA, SAP VN, Fast — đây là rào cản mà Algolia/Elastic không có
4. **RAG evaluation chưa solved:** RAGAS metrics có limitations, cần human eval song song
5. **Cost per query ~$0.003 (search only) đến $0.05 (full RAG):** Rất hợp lý cho thị trường VN

## Agent team

R-α, R-β, R-γ, R-MLE, R-DE, R-NLP, R-DBE, R-BE, R-FE, R-DO, R-SE, R-QA, R-SA, R-D11, R-D09, R-σ

## Domain experts mới

- **R-D11 (Legal):** Vietnamese law search, document hierarchy (Luật→Nghị định→Thông tư), legal tech market $30-50M
- **R-D09 (Education):** EdTech platforms VN, curriculum-aligned RAG, market $100-150M

## Files tạo ra

```
docs/reports/B12/ (16 files: 3 academic + 12 Layer 2 + 1 final CÓ DẤU)
data/baselines/B12-search-rag.json (VI CÓ DẤU)
data/graph.json (B12 node + 8 edges)
docs/memory/B12-learnings.md (this file)
```
