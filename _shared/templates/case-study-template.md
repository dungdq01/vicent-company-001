# Case Study — {{CLIENT_OR_ANONYMIZED_NAME}}

> Per P9.4 (case study extraction at delivery) + `business-strategy/14 §8`. Client written approval BEFORE publish.

---

## Metadata

| Field | Value |
|---|---|
| Client | {{name OR "ICP-{X} {Industry} VN seller, anonymized"}} |
| Anonymization level | "named with consent" / "anonymized — industry only" / "fully anonymized" |
| Industry | {{I0X}} |
| Project tier | {{Sprint A/B/C/D}} |
| Project duration | {{e.g., "26 days from inbound to delivery"}} |
| Engagement value | {{$X — disclosed or anonymized as range}} |
| Publish date | {{ISO}} |
| Client written approval | {{yes — date}} |
| Voice | voice_b_business |

---

## 1. The Headline (1 sentence)

What outcome was achieved. NOT promise-y — measurable.

> "{{e.g., "VN Telegram channel seller automated 8h/day of customer reply with AI bot, saving 240h/month."}}"

---

## 2. The Client (1 paragraph)

Who they are (industry, scale, ICP context — anonymized as needed). Why they need an AI solution.

---

## 3. The Challenge (1-2 paragraphs)

What pain they came in with. Quantified where possible.

> "Before engagement, manually replying 200-500 messages/day, peak hours overwhelmed, losing 30% of orders due to slow response."

---

## 4. The Approach (technical but accessible)

Stack chosen + why. **Honest about tradeoffs**.
- Why this baseline (B0X)
- Why this stack (with link to ADR if interesting)
- What was out-of-scope (Sprint A boundary)

Avoid AI alphabet soup. Translate to client-language.

---

## 5. The Outcome (numbers, not promises)

Measurable results:

| Metric | Before | After | Delta |
|---|---|---|---|
| {{e.g., reply time}} | {{e.g., 15 min avg}} | {{e.g., 28 sec avg}} | {{−96%}} |
| {{operational hours saved}} | 8h/day | 1.5h/day | {{−81%}} |
| {{order conversion}} | {{X%}} | {{Y%}} | {{+Z%}} |

**Honest disclaimer**: results from this engagement, not guaranteed to replicate. Industry context matters.

---

## 6. What Was Hard / Surprising

Real lessons (not marketing).
- {{e.g., "VN slang in product Q&A required few-shot 50+ examples — out-of-the-box LLM missed these."}}
- {{e.g., "Approval gate UX took 2 iterations — first design interrupted owner's real chat flow."}}

---

## 7. Client Quote (with permission)

> "{{quote — verbatim, with permission}}"
> — {{NAME}}, {{TITLE}}, {{COMPANY}}

---

## 8. Replicability for Reader

If you're thinking "could this work for me?":
- ☐ Industry: similar fit if {{conditions}}
- ☐ Scale: viable from {{lower bound}} to {{upper bound}}
- ☐ Budget: starting from {{$X}}
- ☐ Time to first value: {{N weeks}}

Contact CTA — link to discovery call booking.

---

## 9. Authoring Process

- Drafted by R-σ from project retro + interviews
- Anonymization per `_shared/standards/pii-redaction.md`
- Client review + sign-off before publish
- Voice contract per `voice-registry.yaml` — voice_b_business

---

## 10. Distribution

- ☐ Studio website
- ☐ LinkedIn long post (P3)
- ☐ Substack issue (CEO)
- ☐ Sales playbook reference (`business-strategy/12 §casestudy`)
- ☐ Saved for next 5 outreach to similar ICP (sales asset)

---

## Cross-References

- P9 delivery + case study: [`@../../experience/workspace/docs/pipeline/P9-DELIVERY.md`](../../experience/workspace/docs/pipeline/P9-DELIVERY.md)
- CS playbook: [`@../../business-strategy/14-customer-success-playbook.md`](../../business-strategy/14-customer-success-playbook.md) §8
- PII redaction: [`@../standards/pii-redaction.md`](../standards/pii-redaction.md)
- Voice contract: [`@../standards/boundaries.md`](../standards/boundaries.md) §2

---
*Template v1.0 — 2026-04-27.*
