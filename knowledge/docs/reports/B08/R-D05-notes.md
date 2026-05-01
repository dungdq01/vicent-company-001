# Retail Domain Expert Notes: Conversational AI & Chatbots (B08)
## By Nga Hoang (R-D05) — Date: 2026-03-31

### Vietnamese E-commerce Landscape

**Major Platforms (2026)**
- Shopee Vietnam: dominant marketplace, ~45% market share; strong in-app chat (Shopee Chat)
- TikTok Shop: rapidly growing, especially Gen Z; live commerce + chat integration
- Lazada: Alibaba-backed, strong logistics; declining market share but still significant
- Tiki: premium positioning, "Vietnamese Amazon"; focus on authentic goods
- Sendo: budget segment, strong in tier-2/3 cities; declining

**Market Size**
- Vietnam e-commerce: ~$25B GMV in 2026, growing 18-20% YoY
- 70M+ internet users, 55M+ e-commerce buyers
- Mobile-first: >85% of transactions on mobile
- Social commerce: 30-40% of online purchases happen through social channels (Zalo, Facebook, TikTok)

**Chatbot Adoption**
- Most Vietnamese e-commerce still relies on human agents on Zalo/Facebook
- Opportunity: automate 60-70% of repetitive queries (order status, returns, product info)
- Barrier: Vietnamese consumers prefer human interaction; chatbot must feel "personal"

### Product Recommendation Chat

- Conversational product discovery: "Em muốn tìm áo khoác nam size L giá dưới 500k"
- Bot should ask clarifying questions: style, occasion, budget, size, color preference
- Integration with product catalog: real-time search by attributes, filter by availability
- Visual recommendations: show product cards with image, name, price, rating, buy link
- Personalization: use purchase history and browsing data to rank recommendations
- Vietnamese sizing: local brands use different sizing than international; bot must handle both
- Cross-sell: "Áo này hợp với quần này lắm" (This shirt goes well with these pants)

### Order Tracking & Status

Most common chatbot use case in Vietnamese e-commerce:
- User intent patterns: "đơn hàng ở đâu rồi", "bao giờ giao", "check đơn VN12345"
- Integration: query order management system (OMS) via API; return real-time status
- Status mapping to Vietnamese: pending → "Đang xử lý", shipped → "Đang giao", delivered → "Đã giao"
- Proactive notifications: bot sends shipping updates via Zalo OA message
- Logistics partners: GHN, GHTK, Viettel Post, J&T, Ninja Van — each has different tracking API
- Common frustration: "Sao giao chậm thế?" (Why is delivery so slow?) — bot should acknowledge, provide ETA, escalate if overdue

### Return & Refund Handling

- Vietnamese return rates: 5-10% (lower than Western markets; COD rejection is separate issue)
- Return flow via chat: verify order → check return eligibility (time window, condition) → generate return label → confirm refund method
- Refund methods: bank transfer (most common), e-wallet (MoMo, ZaloPay), store credit
- Bot should handle: policy explanation, return eligibility check, return initiation, status updates
- Emotional handling: returns often come with frustration; bot tone must be empathetic in Vietnamese
- "Sản phẩm bị lỗi" (product defective) vs "Không đúng mô tả" (not as described) — different policies

### FAQ Automation

Top FAQ categories for Vietnamese e-commerce:
1. Shipping: delivery time, shipping cost, coverage areas (rural Vietnam is challenging)
2. Payment: COD process, bank transfer instructions, installment options (trả góp)
3. Returns: policy, process, timeline
4. Product: specifications, availability, authenticity
5. Account: password reset, order history, address update
6. Promotions: voucher usage, flash sale rules, loyalty points

- RAG-based FAQ bot: maintain FAQ knowledge base, update weekly with seasonal content
- Vietnamese-specific: Tet holiday shipping cutoffs, 11/11 sale policies, back-to-school promotions

### COD (Cash on Delivery) Handling in Chat

COD is uniquely important in Vietnam — 60-70% of e-commerce transactions are COD:
- COD verification via chat: confirm order details, delivery address, contact phone before dispatch
- COD rejection is a major pain point: customer refuses to pay on delivery (5-15% rejection rate)
- Bot role in reducing COD rejection: pre-delivery confirmation message ("Đơn hàng sẽ giao hôm nay, bạn sẵn sàng nhận hàng chứ?")
- Post-rejection follow-up: bot contacts customer to understand reason, offer redelivery
- COD amount confirmation: avoid disputes by confirming total (product + shipping) before delivery
- Transition to prepayment: bot can offer small discount for online payment to reduce COD dependency

### Customer Behavior Patterns in Vietnamese Chat

- Consumers expect fast responses: <2 minutes acceptable; >5 minutes and they leave
- Informal tone preferred: "anh/chị" (polite) but conversational, not corporate-speak
- Zalo is the primary channel: 75M+ Vietnamese users; many prefer Zalo OA over website chat
- Facebook Messenger: still significant, especially for Facebook Shop sellers
- Voice messages: increasingly common on Zalo; need speech-to-text integration for full chatbot coverage
- Group buying: customers ask in group chats; chatbot may need to handle multi-user conversations
- Trust signals: Vietnamese consumers ask "Có uy tín không?" (Is this trustworthy?) — bot should provide reviews, ratings, return policy

### Zalo & Facebook as Primary Channels

**Zalo OA (Official Account)**
- Broadcast messages: send promotions to followers (limited to 4/month for free tier)
- OA Chat: primary customer service channel for many Vietnamese businesses
- Zalo Mini App: embed product catalog, order tracking, chat within Zalo
- ZNS (Zalo Notification Service): transactional messages (order confirmation, shipping updates)
- Advantage: push notifications delivered reliably in Vietnam; higher open rate than email/SMS

**Facebook**
- Facebook Shop + Messenger: integrated shopping experience
- Chatbot via Page: auto-reply, quick replies, persistent menu
- Comment-to-chat: auto-message users who comment on product posts
- Declining organic reach but still essential for brand presence

### Recommendations for B08

1. Build Zalo OA integration first — it is the highest-ROI channel for Vietnamese e-commerce chatbots
2. Order tracking is the killer use case — implement it first to prove value and drive adoption
3. COD confirmation via chatbot can reduce rejection rates by 20-30% — huge cost savings for merchants
4. Tone matters enormously: use warm Vietnamese ("Dạ", "Ạ") not robotic translated English
5. Product recommendation chat needs real-time catalog integration — stale data destroys trust
6. Plan for voice message support on Zalo — it is growing fast and text-only bots miss these interactions
