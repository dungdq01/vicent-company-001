# Memory: B08 — Conversational AI & Chatbots
## Date: 2026-03-31

---

## Tong ket

B08 Conversational AI & Chatbots hoan thanh nghien cuu L3 depth voi 16 agents (3 academic + 12 practical + 1 consolidation). Verdict: **CONDITIONAL GO** tai 7.0/10.

## Diem noi bat

1. **Market Demand cao nhat (9/10):** E-commerce chatbot (Shopee/Tiki), banking assistant (VPBank/Techcombank), telco customer service
2. **Implementation Risk cao (5/10):** LLM hallucination trong regulated domains, chi phi inference, Vietnamese language quality cua open-source models
3. **Canh tranh manh:** FPT.AI va Zalo AI la doi thu local truc tiep; ChatGPT/Dialogflow la doi thu global
4. **Beachhead:** Tiered product — Lite ($99-199/mo FAQ bot) → Smart ($499-1,999/mo RAG) → Enterprise ($5K+/mo agentic)

## Bai hoc rut ra

1. **Simple-first, agentic-later:** R-gamma challenge dung — 80% doanh nghiep VN chi can FAQ bot, khong can agentic system phuc tap
2. **Zalo OA la kenh bat buoc:** 50M+ users, khong the bo qua — tich hop Day 1
3. **Vietnamese NLP van la thach thuc:** PhoBERT tot cho intent/NER nhung LLM open-source (Llama, Mistral) yeu tieng Viet. Claude/GPT-4 tot hon nhieu nhung dat
4. **Prompt injection la risk #1 ve bao mat:** Can guardrails + content filtering tu ngay dau
5. **Cost per conversation la metric quan trong nhat:** Phai track va optimize — SME VN khong chap nhan >$0.05/conversation

## Agent team (16 agents)

| Layer | Agents | Output |
|-------|--------|--------|
| Layer 1 | R-alpha, R-beta, R-gamma | research/tech/feasibility reports |
| Layer 2 | R-DE, R-MLE, R-NLP, R-DLE, R-BE, R-FE, R-DO, R-SE, R-QA, R-SA, R-D05, R-D02 | 12 practical notes |
| Layer 3 | R-sigma | final-report.md + B08-conversational-ai.json |

## Agents moi so voi B07

- **R-NLP** (moi): Vietnamese tokenization, intent/NER, dialogue state tracking
- **R-FE** (moi): Chat UI widget, Zalo Mini App, streaming display
- **R-D05 (Retail)** (moi): E-commerce chatbot use cases VN

## Lien ket cross-domain

- B08 ↔ B04: NLP la foundation (weight 10 — cao nhat)
- B08 ↔ B12: RAG retrieval cho knowledge-grounded responses
- B08 ↔ B09: Generative AI cho response generation
- B08 ↔ B10: Agentic orchestration cho tool-use chatbots
- B08 ↔ B11: Knowledge Graph cho grounding/factuality
- B08 ↔ B02: Document Intelligence cho RAG knowledge base

## Files tao ra

```
docs/reports/B08/
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
  R-D05-notes.md            (Layer 2, EN)
  R-D02-notes.md            (Layer 2, EN)

data/baselines/B08-conversational-ai.json  (VI, production-ready)
data/graph.json                            (updated: B08 L3 + 7 edges)
docs/memory/B08-learnings.md               (this file)
```
