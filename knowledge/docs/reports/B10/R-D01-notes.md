# Retail Domain Expert Notes: Agentic AI (B10)
## By Lan Truong (R-D01) — Date: 2026-03-31

### 1. Overview

E-commerce is one of the most promising domains for agentic AI deployment. The combination of high transaction volumes, repetitive customer interactions, complex inventory management, and competitive pricing creates ideal conditions for autonomous agents. Vietnam's rapidly growing e-commerce market (projected $25-30B GMV by 2027) presents significant opportunities.

### 2. Autonomous Customer Service Agents

**Order Management Agent:**
- Capabilities: track orders, modify shipping addresses, cancel orders, process exchanges.
- Integration: connect to OMS (Order Management System) via API tools.
- Autonomy level: fully autonomous for status queries, human-approved for cancellations/modifications.
- Expected impact: handle 70-80% of order-related inquiries without human intervention.
- Key challenge: handling edge cases (lost packages, partial deliveries, cross-border shipments).

**Returns and Refunds Agent:**
- Capabilities: assess return eligibility, generate return labels, process refunds, offer alternatives.
- Decision logic: check return policy (product category, time since delivery, condition), approve/deny automatically for clear cases.
- Autonomy level: auto-approve returns within policy; escalate exceptions to human.
- Expected impact: reduce returns processing time from 24-48 hours to under 5 minutes.

**Complaint Resolution Agent:**
- Capabilities: analyze complaint, check order history, offer resolution (refund, replacement, credit, apology).
- Must handle emotional language and escalate angry customers to humans.
- Vietnamese language support critical: understand informal Vietnamese, regional expressions, abbreviations common in chat.
- Autonomy level: agent-supervised — propose resolution, execute after approval for high-value cases.

### 3. Product Research Agents

- Autonomous agents that research products, competitors, and market trends.
- Use cases:
  - Competitor price monitoring across Shopee, Tiki, Lazada, Sendo.
  - Product trend analysis from social media (TikTok Shop, Facebook Marketplace).
  - Supplier evaluation and comparison.
  - Product description generation optimized for Vietnamese SEO.
- Tools needed: web scraping, search API, price comparison API, social media API.
- Run as scheduled background agents (daily/weekly), not interactive.

### 4. Inventory Management Agents

- Monitor inventory levels and take autonomous actions:
  - Alert when stock drops below threshold.
  - Auto-generate purchase orders based on demand forecasting.
  - Optimize warehouse allocation across fulfillment centers.
  - Detect slow-moving inventory and recommend markdowns.
- Integration: connect to WMS (Warehouse Management System) and demand forecasting models.
- Autonomy level: fully autonomous for alerts and recommendations; human-approved for purchase orders above threshold.

### 5. Price Monitoring Agents

- Continuously monitor competitor prices and adjust pricing strategy.
- Agent workflow: scrape competitor prices -> compare to current prices -> calculate optimal price -> apply adjustment (within rules).
- Constraints: minimum margin, maximum discount, price matching rules, MAP (Minimum Advertised Price) compliance.
- Vietnamese market specifics: flash sales are extremely frequent on Shopee/Lazada; agent must react within minutes.
- Expected impact: 5-15% improvement in price competitiveness without sacrificing margins.

### 6. Vietnamese E-Commerce Landscape

**Major Platforms (2025-2026):**
- **Shopee**: Market leader (~45% market share). API access limited; scraping often needed.
- **TikTok Shop**: Fastest growing. Social commerce model with live-streaming integration.
- **Lazada** (Alibaba-backed): Strong in electronics and fashion. Better API ecosystem.
- **Tiki**: Domestic platform, premium positioning. Good API access for sellers.
- **Sendo**: Domestic, focused on value segment. Smaller market share.

**Market Characteristics:**
- Mobile-first: 85%+ of e-commerce transactions happen on mobile.
- Chat-commerce: Customers frequently negotiate via chat (Zalo, Facebook Messenger). Agents must handle this.
- COD (Cash on Delivery): Still 30-40% of transactions. Agents must handle COD-specific logistics.
- Flash sales and vouchers: Complex discount stacking rules. Agents need to understand promotion mechanics.
- Livestream selling: Emerging channel where agents could manage real-time Q&A and order processing.

**Market Size:**
- Vietnam e-commerce GMV 2025: ~$20-22B (estimated).
- Growth rate: 20-25% YoY.
- Number of online shoppers: ~55-60 million.
- Customer service automation market in Vietnam: nascent but growing rapidly.

### 7. Practical Deployment Challenges

- **Platform API limitations**: Shopee and TikTok Shop have restrictive APIs; many integrations require unofficial methods.
- **Vietnamese NLP quality**: Customer messages contain abbreviations ("dc" = duoc, "ko" = khong), regional dialect, and code-switching with English.
- **Trust**: Vietnamese consumers prefer human interaction for complex issues. Deploy agents gradually with clear human escalation.
- **Payment complexity**: Multiple payment methods (MoMo, ZaloPay, VNPay, bank transfer, COD). Agents must understand each.
- **Regulatory**: Consumer protection laws require clear disclosure of AI interaction. Decree 13 applies to customer data processing.

### 8. ROI Estimation

- Customer service agent: save $2-5 per resolved inquiry. At 1000 inquiries/day = $60-150K/year savings.
- Price monitoring agent: 5-10% revenue uplift from competitive pricing on high-volume products.
- Inventory agent: 10-20% reduction in stockouts and overstock costs.
- Implementation cost: $50-100K for initial deployment, $20-40K/year ongoing.
- Expected ROI timeline: 4-8 months to break even for mid-size e-commerce operations.

### Recommendations for B10

1. **Start with customer service agents** — highest volume, clearest ROI, most available training data.
2. **Build Vietnamese chat understanding first** — informal Vietnamese with abbreviations is the primary input format.
3. **Integrate with Shopee and TikTok Shop** as priority platforms — they represent the majority of Vietnamese e-commerce.
4. **Deploy in agent-supervised mode** — Vietnamese consumers expect human quality; do not go fully autonomous initially.
5. **Track resolution rate and CSAT** as primary metrics — cost savings mean nothing if customer satisfaction drops.
6. **Build price monitoring as a background agent** — it runs autonomously and has immediate, measurable impact on revenue.
