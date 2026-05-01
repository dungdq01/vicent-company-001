# Memory: B10 — Agentic AI
## Ngày: 2026-03-31

---

## Tổng kết

B10 Agentic AI hoàn thành nghiên cứu L3 depth với 16 agents (3 academic + 12 practical + 1 consolidation). Verdict: **CONDITIONAL GO** tại 5.1/10 — điểm thấp nhất trong portfolio MAESTRO, phản ánh khoảng cách lớn giữa hype và production readiness.

## Điểm nổi bật

1. **Market Demand rất cao (9/10):** Mọi doanh nghiệp đều muốn AI agents, nhưng ít ai sẵn sàng cho production
2. **Implementation Risk cực cao (3/10):** Hallucination cascades, cost explosion (10-100x single call), reliability compounds (90% per step = 35% over 10 steps)
3. **Đây là infrastructure play, không phải product play:** Xây nền tảng evaluation + sandboxing trước, sản phẩm sau
4. **Single-agent > Multi-agent:** 80% use cases chỉ cần 1 agent với tools tốt

## Bài học rút ra

1. **Simple-first:** Bắt đầu với single-agent + tool use, multi-agent chỉ khi chứng minh được cần thiết
2. **Evaluation infrastructure là ưu tiên #1:** Không thể cải thiện nếu không đo lường được
3. **Hard cost limits:** Agent task có thể explode cost — phải enforce budget per task
4. **Vietnamese reasoning yếu hơn English:** Agent accuracy giảm 15-25% khi reasoning bằng tiếng Việt
5. **Human-in-the-loop bắt buộc cho mission-critical:** Không để agent tự quyết định trong banking, healthcare

## Thay đổi quy trình từ B10

- **Final report viết tiếng Việt CÓ DẤU** (user yêu cầu từ B10 trở đi)
- JSON text values cũng nên chuyển sang có dấu

## Agent team (16 agents)

| Layer | Agents | Output |
|-------|--------|--------|
| Layer 1 | R-α, R-β, R-γ | research/tech/feasibility reports |
| Layer 2 | R-DE, R-MLE, R-NLP, R-DLE, R-BE, R-FE, R-DO, R-SE, R-QA, R-SA, R-D01, R-D02 | 12 practical notes |
| Layer 3 | R-σ | final-report.md + B10-agentic-ai.json |

## Liên kết cross-domain

- B10 ↔ B09: Powered by GenAI (weight 9)
- B10 ↔ B08: Extends conversational AI
- B10 ↔ B04: NLP reasoning foundation
- B10 ↔ B11: Knowledge Graph for agent memory
- B10 ↔ B12: RAG for agent knowledge
- B10 ↔ B06: Optimization for planning

## Files tạo ra

```
docs/reports/B10/
  research-report.md        (R-α, EN)
  tech-report.md            (R-β, EN)
  feasibility-report.md     (R-γ, EN)
  final-report.md           (R-σ, VI CÓ DẤU)
  R-DE/MLE/NLP/DLE/BE/FE/DO/SE/QA/SA/D01/D02-notes.md (12 files, EN)

data/baselines/B10-agentic-ai.json        (VI, production-ready)
data/graph.json                            (updated: B10 node + 8 edges)
docs/memory/B10-learnings.md               (this file)
```
