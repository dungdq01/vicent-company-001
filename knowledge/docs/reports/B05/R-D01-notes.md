# Retail Domain Notes: B05 Recommendation × Retail
## By R-D01 — Date: 2026-03-31

### 1. Recommendation in Retail: Use Case Landscape

Retail recommendation systems span the entire customer journey. **Product recommendations** on product detail pages ("customers also viewed") drive discovery. **"Frequently bought together"** on cart pages drives cross-sell and increases basket size. **Personalized homepage** curates the landing experience per user, increasing engagement and reducing bounce. **Search re-ranking** personalizes search results beyond pure text relevance. **Size recommendation** reduces returns — a critical cost driver in fashion e-commerce. **Price sensitivity-aware recommendations** adjust which products to surface based on a user's historical price elasticity, showing budget options to price-sensitive users and premium options to others.

The most impactful use cases by revenue attribution: homepage personalization (broadest reach), product page recommendations (highest conversion context), and cart-page cross-sell (highest AOV impact).

### 2. Vietnamese E-commerce Context

The Vietnamese e-commerce market in 2026 is shaped by several dominant forces. **Shopee** remains the market leader with over 60% market share, built on aggressive subsidies, gamification (Shopee coins, flash sales), and deep logistics integration. **Tiki** positions as the premium domestic alternative with Tiki NOW fast delivery and verified authentic goods. **Lazada**, backed by Alibaba, leverages cross-border supply chain but has lost ground to Shopee in user engagement.

**TikTok Shop** has emerged as a disruptive force, blending entertainment-driven discovery with commerce. Vietnamese consumers — among the highest TikTok usage globally — are increasingly purchasing through live-stream recommendations and short-video product showcases.

Key behavioral patterns: **flash sales culture** means users are trained to buy during time-limited promotions (9.9, 11.11, 12.12 campaigns), creating massive traffic spikes. **COD (cash on delivery)** remains dominant at 60-70% of transactions, creating unique challenges: high return rates (15-20%) and the need to recommend items with high purchase-completion probability. Vietnamese shoppers are highly price-comparative, often checking 3-4 platforms before buying.

### 3. High-Priority Recommendation Use Cases for Vietnam

**Cross-sell on Shopee-like platforms**: Given the marketplace model with millions of SKUs from thousands of sellers, cross-sell recommendations must balance relevance with seller diversity. Recommending complementary items from different sellers increases platform stickiness but requires careful seller-fairness constraints.

**Personalized push notifications for re-engagement**: Vietnamese users install multiple e-commerce apps but actively use only 1-2. Push notifications with personalized product recommendations (based on browse-but-not-buy behavior) are critical for re-engagement. Timing matters — send during lunch (11:30-13:00) and evening (20:00-22:00) peaks.

**Bundle recommendations for COD optimization**: Since COD has high fulfillment cost and return risk, recommending product bundles that increase AOV makes each COD order more economically viable. A bundle of phone case + screen protector + charging cable at a combined discount reduces per-item delivery cost and increases purchase completion rate.

### 4. Data Challenges in Vietnamese Retail

**Sparse data for long-tail sellers**: Small sellers with < 50 products and < 100 monthly orders produce insufficient interaction data for collaborative filtering. Content-based and knowledge-graph approaches must supplement. Seller cold-start is more severe than in mature markets.

**Product catalog inconsistency**: The same product appears with dozens of different titles, images, and descriptions across sellers. Entity resolution (deduplication) is essential before training — without it, the model treats the same physical product as unrelated items, fragmenting signal.

**Multi-language product titles**: Vietnamese sellers mix Vietnamese, English, and Chinese in product titles ("ao thun nam cotton 100% premium quality" mixing Vietnamese and English). NLP feature extraction must handle code-switching. Vietnamese-specific tokenization (VnCoreNLP, PhoBERT) is necessary for text understanding.

**Fake reviews and ratings**: Incentivized reviews and rating manipulation are prevalent. Recommendation models that rely on star ratings as features will inherit this noise. Use behavioral signals (purchase, repurchase, return rate) over explicit ratings.

### 5. KPIs for Retail RecSys

| KPI | Definition | Benchmark |
|---|---|---|
| CTR on rec widgets | Clicks / Impressions on recommendation slots | 3-8% (varies by placement) |
| Add-to-cart rate | Add-to-cart from rec click / Rec impressions | 1-3% |
| CVR from recommendations | Purchases attributed to rec clicks / Total purchases | 8-15% |
| Revenue attribution | Revenue from rec-driven purchases / Total revenue | 15-35% |
| AOV uplift | AOV with rec interaction - AOV without / AOV without | 5-15% |
| Catalog coverage | Unique items recommended / Total catalog items | > 30% (healthy) |

Track these segmented by user type (new vs returning), platform (web vs mobile), and recommendation placement (homepage vs PDP vs cart).

### 6. Integration with Retail Systems

**Marketplace seller APIs** (Shopee Open Platform, Tiki Seller Center): Pull product catalog, inventory levels, and pricing in near-real-time. Recommendations must filter out-of-stock items — recommending unavailable products destroys trust.

**POS systems**: For omnichannel retailers (Thegioididong, FPT Shop), integrate offline purchase history from POS with online browsing data. A user who bought a laptop in-store should see laptop accessories online, not another laptop.

**Inventory-aware recommendations**: Integrate inventory feed to boost items with excess stock (clearance) and suppress items with low stock (prevent overselling). Dynamic re-ranking by inventory health improves both user experience and business outcomes.

### 7. ROI & Business Case

Amazon attributes 35% of revenue to its recommendation engine — the gold standard. In Vietnamese e-commerce, current recommendation maturity is lower, suggesting **15-25% revenue uplift potential** from implementing modern RecSys versus rule-based or no-recommendation baselines.

Typical investment for a mid-size Vietnamese retailer (10M monthly visits): $50,000-100,000 initial build (3-person ML team for 4-6 months) plus $3,000-5,000/month infrastructure. Expected ROI timeline: **month 1-2** (popularity-based, 3-5% uplift), **month 3-4** (collaborative filtering, 8-12% uplift), **month 6+** (deep learning, 15-25% uplift). Break-even typically within 3-6 months for businesses with $1M+ monthly GMV.

### 8. Competitive Landscape

**Shopee** has a mature RecSys team (Singapore HQ) powering "Daily Discover" and "Similar Products." Their advantage is massive data scale across Southeast Asia. **Tiki** has invested in an AI team focused on search and recommendations, leveraging first-party product data. **TikTok Shop** uses the For You algorithm adapted for commerce — the most sophisticated content-to-commerce recommendation system in the market.

**The gap**: Mid-size Vietnamese retailers (Thegioididong, Cellphones, Con Cung, Hasaki) have growing online presence but limited or no personalized recommendation systems. They rely on manual merchandising or basic "bestseller" lists. This segment represents the primary opportunity for RecSys solution providers in Vietnam — companies with 1-10M monthly visits, sufficient data for ML, but no in-house ML team.
