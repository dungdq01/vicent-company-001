# Media Domain Notes: B05 Recommendation × Media & Entertainment
## By R-D12 — Date: 2026-03-31

### 1. Content Recommendation in Media

Media recommendation differs fundamentally from retail: the "product" is consumed immediately, feedback is implicit (watch time, scroll depth, skip), and catalog freshness is critical. **Video platforms** need "watch next" to maintain session length and personalized feeds to drive daily active usage. **Music services** require playlist generation (contextual: workout, study, commute) and radio-style continuous play from a seed track. **News aggregators** must surface timely, relevant articles while balancing editorial diversity. **Gaming** recommendations span game discovery, in-game item suggestions, and matchmaking — each with distinct signals and objectives.

The core tension in media RecSys: **engagement optimization vs user wellbeing**. Maximizing watch time or session length can lead to addictive patterns and filter bubbles. Responsible media recommendation requires explicit diversity and quality constraints alongside engagement metrics.

### 2. Vietnamese Media Landscape

Vietnam has a vibrant and fragmented media ecosystem. **VTV/VTC streaming** platforms serve as the primary legitimate long-form video sources, competing with YouTube and increasingly with Netflix for premium content. **Zing MP3** (by VNG) dominates music streaming alongside NhacCuaTui and the growing presence of Spotify. **Bao Moi** aggregates news from 300+ Vietnamese publishers, while **VnExpress** leads as the highest-traffic news site with its own content recommendation.

**TikTok Vietnam** is the dominant short-video platform with over 50M users, fundamentally reshaping content consumption patterns toward short-form, algorithmically-driven discovery. Vietnamese users spend an average of 90+ minutes daily on TikTok, making its recommendation algorithm the most influential content curation system in the country.

**Zalo** (by VNG), Vietnam's dominant messaging app with 75M+ users, has expanded into content via Zalo articles and Zalo Official Accounts, creating another recommendation surface. The fragmentation across platforms means Vietnamese users consume content across 4-6 apps daily, making cross-platform understanding valuable but technically challenging.

### 3. Key Recommendation Challenges in Media

**Content cold-start** is more severe in media than retail. A news article has a useful lifespan of hours; a new video needs initial exposure to gather engagement signals. Solutions: use content features aggressively (NLP embeddings of title/body, thumbnail quality scores, creator history) for cold-start items, and use bandit-based exploration to allocate initial traffic.

**Diversity vs engagement tension**: Pure engagement optimization surfaces clickbait and sensational content. Users report higher long-term satisfaction with diverse recommendations even if per-item CTR is lower. Implement diversity as a hard constraint in slate optimization: no more than 3 items from the same category/creator in a feed of 20.

**Filter bubble / echo chamber**: In news specifically, showing users only content aligned with their existing views narrows perspective and can polarize. Vietnamese social media already faces misinformation challenges — recommendation algorithms must not amplify this.

**Recency requirements**: News feeds must surface articles from the last few hours. A 24-hour-old article is often stale. Time-decay functions in scoring are essential — exponential decay with a half-life of 4-8 hours for news, 7-14 days for entertainment video.

### 4. Sequential & Session-based Models for Media

User behavior in media is inherently sequential. What a user watched in the last 30 minutes is far more predictive than their historical profile. **Transformer-based sequential models** (SASRec, BERT4Rec) capture these patterns by treating the interaction sequence as a "sentence" and predicting the next item.

**Session-based recommendation** is critical for news browsing where sessions are short (5-10 minutes) and users may not be logged in. GRU4Rec and its attention-based variants model intra-session dynamics without requiring long-term user profiles.

Key architectural difference from e-commerce: in media, the **order and timing** of interactions carry strong signal. A user who watched three cooking videos in sequence has a different intent than one who watched one cooking video among diverse content. Attention weights naturally capture this, but explicit session segmentation improves performance.

### 5. Content Understanding for Recommendations

Rich content features are essential for media cold-start and quality filtering. **NLP for articles**: PhoBERT and multilingual models extract topic, sentiment, and named entities from Vietnamese text. Article embeddings enable content-based similarity and topic clustering. **Computer vision for video/thumbnails**: Thumbnail quality scoring (aesthetic model), scene classification, and visual similarity enable recommendations based on visual style. **Audio features for music**: Mel-frequency cepstral coefficients (MFCCs), tempo, key, energy, and learned audio embeddings (from models like CLAP) enable "sounds like" recommendations beyond collaborative filtering.

**Multimodal embeddings** combine text, visual, and audio features into a unified representation space. A music video can be recommended based on its audio similarity to liked songs AND its visual style similarity to watched videos. Vietnamese-language multimodal models are emerging but still behind English — transfer learning from multilingual models (mBERT, CLIP) with Vietnamese fine-tuning is the practical approach.

### 6. Ethical Considerations

**Filter bubbles in news** carry societal-level risk. When Bao Moi or VnExpress personalizes news feeds, they shape public discourse. Responsible design requires editorial diversity constraints: every user must see a minimum representation of major news categories (politics, economy, society, international) regardless of their click history.

**Addictive engagement optimization**: TikTok's infinite scroll and autoplay, optimized for maximum session length, raises concerns about digital wellbeing — particularly for Vietnamese youth. Ethical recommendation design includes session-length nudges ("you have been browsing for 60 minutes"), reduced recommendation quality after extended sessions, and user-controllable interest dials.

**Misinformation amplification**: Recommendation algorithms can inadvertently amplify misinformation by optimizing for engagement — sensational false claims generate clicks. Content quality scoring (source credibility, fact-check signals, engagement pattern analysis) must be integrated into the ranking pipeline as a hard filter, not just a soft signal.

### 7. Monetization Integration

**Ad-supported models** (YouTube, Bao Moi, Zing MP3 free tier): Recommendations must balance user satisfaction with ad revenue. Inserting ads between recommended content requires careful frequency capping — too many ads degrade engagement and increase churn. The recommendation system should predict both content engagement and ad receptivity, jointly optimizing a blended objective.

**Subscription models** (Netflix, Spotify Premium, VieON): The primary goal is churn reduction. Recommendations must demonstrate platform value by surfacing content the user would not have found alone. Track "recommendation-driven discovery" — content consumed that was not searched for. High discovery rates correlate with lower churn.

**Hybrid models** (Zing MP3 freemium): Free tier recommendations subtly showcase premium features (high-quality audio, exclusive content). The recommendation system becomes a conversion funnel — surface enough premium-only content to demonstrate value without frustrating free users.

### 8. Vietnamese Media RecSys Opportunity

**Zing MP3 personalized playlists**: Vietnam-specific music tastes (V-pop, bolero, Vietnamese indie) are underserved by global models. A Vietnamese-trained collaborative filtering model on Zing MP3's data could create "Discover Weekly" equivalent playlists that capture local taste graphs — connecting V-pop fans with emerging Vietnamese artists.

**VnExpress personalized news**: As Vietnam's highest-traffic news site, VnExpress can implement personalized article ordering and "For You" sections. The key challenge is balancing personalization with editorial integrity — the editorial team must retain override capability for breaking news and important public interest stories.

**Short-video recommendation for Vietnamese creators**: TikTok's algorithm is global and opaque. A Vietnamese-specific short-video recommendation engine (for Zalo or emerging local platforms) could better surface Vietnamese creators, local humor, and culturally relevant content that global algorithms may underweight. This represents both a product opportunity and a cultural preservation argument.

The overall opportunity: Vietnamese media companies have content and users but lack recommendation sophistication. The gap between TikTok's world-class algorithm and local platforms' basic recommendation systems is the market opportunity for RecSys expertise in Vietnamese media.
