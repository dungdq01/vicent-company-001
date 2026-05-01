# Memory: B11 — Knowledge Graph
## Ngày: 2026-03-31

---

## Tổng kết

B11 Knowledge Graph hoàn thành nghiên cứu L3 depth với 16 agents (3 academic + 12 practical + 1 consolidation). Verdict: **CONDITIONAL GO** tại 5.5/10.

## Điểm nổi bật

1. **Data Availability là bottleneck lớn nhất (4/10):** Vietnamese KG resources gần như không tồn tại, NER/RE pipeline cho tiếng Việt chưa production-ready
2. **KG construction cost bị underestimate 3-5x:** Maintenance cost vượt build cost — cần budget 1 FTE per vertical cho curation
3. **GraphRAG là trend nóng nhất:** Microsoft GraphRAG (2024) kết hợp KG + LLM, nhưng cũng là commoditization risk
4. **Corporate entity KG cho ngân hàng là use case P0:** Lowest risk, highest ROI, dữ liệu DangKyKinhDoanh.gov.vn sẵn có

## Bài học rút ra

1. **KG Lite trước:** Neo4j Community + manual curation cho 1 vertical, chứng minh giá trị trước khi automate
2. **Vietnamese NER là unsolved problem:** PhoBERT tốt cho basic NER nhưng relation extraction chưa đủ cho KG construction tự động
3. **Graph database = Neo4j cho VN:** Community Edition miễn phí, ecosystem lớn nhất, Cypher dễ học
4. **On-premise bắt buộc cho ngân hàng:** Không thể đưa dữ liệu khách hàng lên cloud KG

## Agent mới

- **R-DBE (Database Engineer):** Lần đầu sử dụng — chuyên về Neo4j, ArangoDB, RDF stores, query optimization

## Liên kết cross-domain

- B11 ↔ B04: NLP cho KG construction (weight 9)
- B11 ↔ B12: GraphRAG retrieval (weight 9)
- B11 ↔ B10: Agent memory/grounding
- B11 ↔ B08: Knowledge-grounded dialogue
- B11 ↔ B05: Graph-based recommendation
- B11 ↔ B02: Document KG extraction

## Files tạo ra

```
docs/reports/B11/
  research-report.md, tech-report.md, feasibility-report.md, final-report.md (CÓ DẤU)
  R-DE/MLE/NLP/DBE/BE/FE/DO/SE/QA/SA/D03/D02-notes.md (12 files, EN)

data/baselines/B11-knowledge-graph.json    (VI CÓ DẤU, production-ready)
data/graph.json                            (updated: B11 node + 8 edges)
docs/memory/B11-learnings.md               (this file)
```
