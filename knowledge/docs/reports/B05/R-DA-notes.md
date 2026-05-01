# Data Analysis Notes: B05 Recommendation Systems
## By R-DA — Date: 2026-03-31

### 1. RecSys Data Landscape

Recommendation systems consume two fundamental types of feedback data, each with different analytical implications.

**Explicit Feedback** includes ratings (1-5 stars), reviews, thumbs up/down, and user-curated lists. Explicit signals are high-quality but sparse — typically less than 1% of users leave ratings. The rating matrix for a platform with 10M users and 1M items might have only 100M ratings, yielding a density of 0.001%. Explicit feedback also suffers from self-selection bias: users who rate items are not representative of all users, and ratings tend to be bimodal (very positive or very negative).

**Implicit Feedback** includes clicks, page views, purchases, add-to-cart, dwell time, scroll depth, search queries, and wishlist additions. Implicit signals are abundant but noisy — a click does not necessarily mean interest (misclick, curiosity), and absence of a click does not mean disinterest (the user may not have seen the item). Dwell time is particularly informative: spending 3 minutes reading a product page signals stronger interest than a 2-second bounce. Purchase events are the strongest implicit signal but are the most sparse.

**Interaction Sparsity** is the central data challenge. Even with implicit feedback, the user-item interaction matrix is extremely sparse (typically 0.01%-0.1% density for large platforms). This sparsity drives most architectural decisions in RecSys — from matrix factorization's low-rank assumption to two-tower models' ability to generalize from limited observations.

### 2. Exploratory Data Analysis for RecSys

Before building any model, thorough EDA reveals the structural properties of the data that inform model choice and evaluation strategy.

**User Activity Distribution** follows a power law: a small fraction of users generate the majority of interactions. Typically, the top 10% of users account for 50-70% of all interactions. This has direct implications for evaluation — aggregate metrics are dominated by heavy users. Segment-based evaluation (light/medium/heavy users) provides a more nuanced picture.

**Item Popularity** follows a long-tail distribution: a small number of items receive the vast majority of interactions, while the "long tail" of items has very few interactions. Quantify this with Lorenz curves and Gini coefficients. A Gini coefficient above 0.8 indicates extreme popularity concentration. The long-tail items are where recommendation systems add the most value — users can discover popular items on their own, but need help finding relevant niche items.

**Interaction Matrix Density** should be computed overall and per segment. Density by user tenure (new vs established users) and by item age (new vs catalog items) reveals where cold-start is most severe. A density heatmap across user activity buckets and item popularity buckets shows where the model has enough signal to learn.

**Temporal Patterns** include: daily cycles (browsing peaks in evening hours), weekly patterns (weekend vs weekday behavior differs), seasonal trends (holiday spikes, back-to-school), and long-term trends (category preferences shifting). Plot interaction volume over time at multiple granularities. Sudden drops may indicate data pipeline issues rather than true behavior changes.

### 3. Key Metrics & KPIs

Recommendation metrics span engagement, conversion, and diversity dimensions. A healthy RecSys optimizes across all three.

**Engagement Metrics**: CTR (Click-Through Rate) = clicks / impressions, the most immediate feedback signal. Session length (time spent) and pages per session measure whether recommendations keep users engaged. Scroll depth on recommendation carousels indicates whether users find the suggestions worth exploring. Repeat visit rate measures long-term engagement.

**Conversion Metrics**: CVR (Conversion Rate) = purchases / clicks, measuring downstream business impact. AOV (Average Order Value) captures whether recommendations drive higher-value purchases. Revenue per session is the ultimate north-star metric for e-commerce — it combines engagement and conversion into a single business outcome. Attribution matters: did the recommendation directly lead to the purchase, or did the user find the item through search after seeing it in recommendations?

**Diversity Metrics**: Catalog coverage = fraction of items recommended to at least one user. Low coverage means the system is ignoring most of the catalog. The Gini coefficient of recommendation frequency measures how evenly items are recommended — a high Gini means a few items dominate recommendations. ILS (Intra-List Similarity) measures how similar items within a single recommendation list are — too high means the list is redundant, too low means it lacks coherence. A practical target: coverage above 30%, Gini below 0.7, and ILS calibrated per domain.

### 4. A/B Testing for Recommendations

A/B testing is the only reliable way to measure the true impact of a recommendation system change. It requires careful experimental design.

**Randomization Unit**: User-level randomization is standard — each user sees either control or treatment for the entire experiment duration. Session-level randomization introduces noise because the same user may see different experiences across sessions, making it harder to detect effects. For logged-out users or anonymous sessions, device-level or cookie-level randomization is the fallback.

**Metric Selection**: Define a primary metric (e.g., revenue per user per week), secondary metrics (CTR, CVR, session length), and guardrail metrics (metrics that must not degrade, e.g., return rate, customer support contacts). The primary metric should be a long-term business outcome, not a proxy like CTR.

**Statistical Significance**: Use a minimum detectable effect (MDE) analysis to determine sample size before the experiment starts. For revenue metrics with high variance, experiments may need 2-4 weeks of data. Apply corrections for multiple comparisons if testing multiple metrics. Sequential testing methods (like mSPRT) allow continuous monitoring without inflating false positive rates.

**Guardrail Metrics**: Cart-add rate ensures recommendations are not cannibalizing organic browsing. Revenue cannibalization checks whether recommendation-driven purchases replace purchases that would have happened anyway. Diversity guardrails ensure the new model does not collapse into recommending only popular items.

### 5. Bias Analysis

Biases in recommendation data lead to biased models, which generate biased recommendations, creating a self-reinforcing cycle. Identifying and measuring bias is essential.

**Popularity Bias Measurement**: Compare the popularity distribution of recommended items against the popularity distribution of user preferences. The Average Recommendation Popularity (ARP) metric computes the mean popularity of recommended items. A high ARP relative to user preference distributions indicates popularity bias. Segment this analysis: popularity bias often disproportionately affects users with niche tastes.

**Position Bias in Click Data**: Items shown in position 1 receive 2-10x more clicks than identical items in position 5, regardless of relevance. Measure this by analyzing CTR by position across randomized experiments or by using result randomization buckets. Position bias makes click data unreliable as a relevance signal without correction. Propensity models that estimate P(click | position) allow debiasing the training data.

**Selection Bias from Prior Recommendations**: Users can only interact with items they were shown. The existing recommendation model creates a filter over which items appear in the data. Items never recommended never receive feedback, creating a systematic blind spot. Quantify selection bias by measuring what fraction of the catalog has been shown to users in each segment.

**Exposure Fairness Analysis**: Across item groups (by seller, category, or demographic relevance), measure whether exposure is proportional to relevance. Disparate exposure can disadvantage sellers or content creators. Fairness metrics like equal opportunity of exposure and demographic parity in recommendations provide quantitative measures.

### 6. Vietnamese E-commerce Data Characteristics

The Vietnamese e-commerce market has distinct data patterns that affect recommendation system design and evaluation.

**Shopee/Tiki/Lazada User Behavior**: Vietnamese e-commerce is heavily mobile-first — over 85% of traffic comes from mobile apps. Sessions are shorter but more frequent compared to Western markets. Users heavily rely on search within the platform, making search-to-recommendation handoff a critical touchpoint. Social proof features (review counts, sold quantities) have outsized influence on conversion in Vietnamese markets.

**Vietnamese Buying Patterns**: Price sensitivity is high — users compare prices across platforms before purchasing. Flash sales and voucher-driven behavior means interaction patterns spike around promotional events. Livestream commerce is a major channel in Vietnam, generating bursty interaction data that does not follow typical browsing patterns. Free shipping thresholds drive basket-building behavior — recommendations that help users reach the threshold see higher conversion.

**Seasonal Patterns**: Tet (Lunar New Year, typically January-February) creates the largest spike, with gift-giving driving cross-category purchasing. The 11.11 and 12.12 mega-sales create massive traffic spikes — interaction volume can be 10-20x normal. Back-to-school (August-September) drives category-specific spikes. These seasonal events require special model handling: models trained on normal periods underperform during sales events, and vice versa. Maintaining separate seasonal models or dynamically reweighting training data around events improves performance.

### 7. Data Quality Issues in RecSys

Data quality problems in recommendation systems are both common and consequential — a model trained on corrupted data will produce corrupted recommendations.

**Bot Traffic**: Automated crawlers, price scrapers, and competitor monitoring bots generate fake interaction patterns. Bot sessions typically show inhuman browsing speeds (clicks within milliseconds), systematic category scanning, and no conversion. Filtering bots requires combining rule-based detection (velocity checks, user-agent analysis) with ML-based anomaly detection. On Vietnamese e-commerce platforms, bot traffic can represent 10-20% of total traffic.

**Fake Reviews**: Review manipulation is prevalent, especially for new sellers building reputation. Fake review patterns include burst reviews from new accounts, suspiciously uniform rating distributions, and reviews that do not match verified purchases. Fake reviews corrupt explicit feedback signals and any text-based features derived from reviews.

**Click Farms**: Organized operations that generate fake engagement to boost item visibility. Click farm traffic distorts popularity metrics and collaborative filtering signals. Detecting click farms requires network analysis — identifying clusters of accounts with coordinated behavior patterns.

**Data Sparsity in New Platforms**: Early-stage platforms face extreme sparsity where most user-item pairs have zero interactions. Content-based approaches and transfer learning from similar domains become essential. In the Vietnamese market, new vertical platforms (e.g., fresh grocery delivery) face this challenge acutely.

**Delayed Conversion Attribution**: A user may see a recommendation on Monday, browse organically on Tuesday, and purchase on Wednesday. Attributing this conversion to the recommendation requires multi-touch attribution models with configurable lookback windows. Standard last-click attribution undervalues recommendation influence. Typical lookback windows are 7-14 days for e-commerce.

### 8. Reporting Dashboards for RecSys

Effective monitoring ensures that recommendation quality does not silently degrade and that stakeholders have visibility into system performance.

**Daily Tracking**: CTR by recommendation surface (homepage, product page, cart page), catalog coverage (what fraction of items were recommended today), diversity metrics (Gini coefficient of item recommendation frequency), and system health (latency p50/p95/p99, error rates, fallback rates). Alert on sudden CTR drops or coverage collapses — these often indicate data pipeline failures or model serving issues rather than organic changes.

**Weekly Tracking**: Long-term engagement (7-day retention of users who engaged with recommendations), repeat purchase rate (are recommendations driving loyalty?), cold-start item performance (how quickly new items get their first recommendation-driven interaction), and revenue attribution (what fraction of total revenue can be attributed to recommendations).

**Ad-hoc Deep Dives**: Segment analysis by user cohort (new vs returning, high-value vs casual), new item performance analysis (how the cold-start pipeline is performing), category-level recommendation quality (are there categories where the model underperforms?), and competitor item analysis (are we recommending items that users then buy on competitor platforms?). These analyses are triggered by anomalies in daily/weekly metrics or by business stakeholder requests.

**Dashboard Design Principles**: Use consistent time ranges across all panels. Show year-over-year comparisons for seasonal context. Include confidence intervals on all metrics. Separate organic user behavior from recommendation-influenced behavior. Make the dashboard self-serve for product managers — they should not need to file analyst requests for standard questions.
