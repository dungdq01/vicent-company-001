# Memory: B09 — Generative AI
## Date: 2026-03-31

---

## Tong ket

B09 Generative AI hoan thanh nghien cuu L3 depth voi 16 agents (3 academic + 12 practical + 1 consolidation). Verdict: **CONDITIONAL GO** tai 7.0/10.

## Diem noi bat

1. **Market Demand rat cao (9/10):** GenAI la trend lon nhat AI 2023-2026. VN co 100M+ internet users, TikTok market #2 the gioi, content demand cuc lon
2. **Implementation Risk cao (5/10):** GPU cost, Vietnamese quality gap, IP/copyright legal vacuum, market commoditization
3. **Canh tranh cuc ky manh:** OpenAI, Anthropic, Google, Meta, Midjourney, FPT.AI, Viettel AI — san choi dong duc
4. **Chien luoc:** API-first (khong tu host LLM Phase 1), text-only truoc, Vietnamese language moat, vertical SaaS differentiation

## Bai hoc rut ra

1. **API-first, self-host-later:** R-gamma challenge dung — tu host LLM ton $5K-15K/thang GPU, khong hop ly cho VN startups Phase 1
2. **Text-only covers 80% use cases:** Multimodal la over-engineering cho da so khach hang VN. Marketing copywriting + customer service = P0
3. **Vietnamese language la moat duy nhat:** ChatGPT/Claude da rat tot tieng Viet nhung chua hieu context VN (Tet, dia phuong, van hoa). Fine-tune tren Vietnamese data = competitive advantage
4. **Copyright/legal la rui ro lon:** VN chua co khung phap ly cho AI-generated content. Can theo doi sat EU AI Act vi VN thuong follow
5. **Cost per generation la metric song con:** $0.01-0.03/request cho text, $0.02-0.05/image — phai optimize bang caching, model routing, batching

## Agent team (16 agents)

| Layer | Agents | Output |
|-------|--------|--------|
| Layer 1 | R-alpha, R-beta, R-gamma | research/tech/feasibility reports |
| Layer 2 | R-DE, R-MLE, R-NLP, R-DLE, R-BE, R-FE, R-DO, R-SE, R-QA, R-SA, R-D12, R-D18 | 12 practical notes |
| Layer 3 | R-sigma | final-report.md + B09-generative-ai.json |

## Agents moi so voi B08

- **R-D12 (Media):** Content creation, dubbing, Vietnamese media landscape
- **R-D18 (Marketing):** AI copywriting, SEO, Vietnamese digital marketing $500M+

## Lien ket cross-domain

- B09 ↔ B04: Text generation foundation (weight 9)
- B09 ↔ B03: Image/video generation
- B09 ↔ B08: Powers conversational AI (weight 9)
- B09 ↔ B10: Enables agentic AI
- B09 ↔ B12: RAG-augmented generation
- B09 ↔ B02: Document generation

## Files tao ra

```
docs/reports/B09/
  research-report.md        (R-alpha, EN)
  tech-report.md            (R-beta, EN)
  feasibility-report.md     (R-gamma, EN)
  final-report.md           (R-sigma, VI)
  R-DE-notes.md             (Layer 2, EN)
  R-MLE-notes.md            (Layer 2, EN)
  R-NLP-notes.md            (Layer 2, EN)
  R-DLE-notes.md            (Layer 2, EN)
  R-BE-notes.md             (Layer 2, EN)
  R-FE-notes.md             (Layer 2, EN)
  R-DO-notes.md             (Layer 2, EN)
  R-SE-notes.md             (Layer 2, EN)
  R-QA-notes.md             (Layer 2, EN)
  R-SA-notes.md             (Layer 2, EN)
  R-D12-notes.md            (Layer 2, EN)
  R-D18-notes.md            (Layer 2, EN)

data/baselines/B09-generative-ai.json     (VI, production-ready)
data/graph.json                            (updated: B09 node + 8 edges)
docs/memory/B09-learnings.md               (this file)
```
