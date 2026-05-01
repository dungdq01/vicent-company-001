# Insurance Domain Expert Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

Insurance is a natural fit for tabular ML: the industry is fundamentally about predicting risk from structured data. Vietnam's insurance market is growing rapidly (15-20% annually) but remains underpenetrated compared to regional peers. ML-powered risk scoring, claims prediction, pricing optimization, and fraud detection represent significant opportunities, constrained by limited historical data and regulatory considerations.

## 2. Risk Scoring

### Motor Insurance
- Predict claim probability and severity for motor policies.
- Key features: vehicle type, age, engine capacity, driver age, driving history, location (province), usage (personal/commercial).
- Models: two-stage approach — frequency model (claim count, Poisson/GBDT) + severity model (claim amount, Gamma/GBDT).
- Vietnamese specifics: high motorbike density, mixed traffic, regional accident rate differences (HCMC vs rural).
- Data challenge: limited telematics data; most scoring relies on static policy features.

### Health Insurance
- Predict medical claim costs for individual and group health policies.
- Key features: age, gender, pre-existing conditions, occupation, geographic region, plan type.
- Models: GBDT for claim amount prediction, classification for high-cost claimant identification.
- Vietnamese context: growing private health insurance market alongside social insurance (BHXH).
- Data gap: limited standardized medical coding (ICD-10 adoption still in progress).

### Property Insurance
- Predict loss probability for commercial and residential property.
- Features: property type, construction, location, flood/storm zone, fire protection, occupancy.
- Vietnamese risks: typhoon exposure (Central region), flooding (Mekong Delta, HCMC).
- CAT modeling: catastrophe risk models increasingly important given climate change.

## 3. Claims Prediction

- Predict likelihood of claim within policy period at underwriting stage.
- Early claim detection: predict claims within first 90 days (higher fraud risk).
- Claims severity prediction: estimate expected claim amount for reserving.
- Claims development: predict ultimate claim cost from initial reported amount (long-tail lines).
- Vietnamese challenge: limited claims history for newer product lines (cyber insurance, liability).

## 4. Pricing Optimization

### Technical Pricing
- Actuarial models enhanced with ML: GLM baseline + GBDT residual modeling.
- Feature interactions that GLMs miss: GBDT captures non-linear relationships.
- Price elasticity modeling: predict demand response to price changes.
- Competitive pricing: adjust technical price based on market position.

### Dynamic Pricing
- Adjust premiums based on real-time risk factors (usage-based insurance).
- Motor: telematics-based pricing (driving behavior) — nascent in Vietnam.
- Health: wellness program integration (fitness data, health checkups).
- Regulatory constraint: Ministry of Finance must approve tariff structures; dynamic pricing limited.

## 5. Fraud Detection

- Claims fraud detection: identify suspicious claims for investigation.
- Application fraud: detect misrepresentation in policy applications.
- Key features: claim timing (soon after inception or renewal), claim amount patterns, claimant history, network analysis (related claims/parties).
- Models: classification (fraud/legitimate) with high precision focus (minimize false accusations).
- Vietnamese fraud patterns: staged accidents (motor), inflated medical claims (health), arson (property).
- Estimated fraud rate: 10-15% of claims contain some element of fraud (industry estimate).
- ROI: even detecting 1% additional fraud saves millions in claims costs.

## 6. Customer Segmentation

- Segment customers by risk profile, profitability, and behavior.
- Features: policy mix, claim history, payment behavior, channel preference, policy tenure.
- Models: clustering (K-means, DBSCAN) + classification for segment assignment.
- Use cases: targeted cross-sell, retention campaigns, service differentiation.
- Vietnamese market: young demographic, low penetration means most customers are first-time buyers.

## 7. Vietnamese Insurance Market

### Major Players
- **Life insurance**: Bao Viet Life (state-linked), Prudential, Manulife, Dai-ichi Life, AIA — dominate 85%+ of market.
- **Non-life insurance**: Bao Viet (largest), PVI, Bao Minh, PTI, PJICO.
- **Bancassurance**: growing channel — banks distribute insurance (Techcombank-Manulife, VPBank-AIA, MBBank-Prudential partnerships).
- **Insurtech**: Papaya, LIAN, Saladin — emerging digital insurance platforms.

### Market Characteristics
- Total premium: ~$8B (2025), growing 15-20% annually.
- Life insurance: ~65% of premium; non-life: ~35%.
- Penetration rate: ~3% of GDP (vs 5-8% in mature Asian markets).
- Distribution: agency-dominant for life; bancassurance growing fastest.
- Digital adoption: accelerating post-COVID; online purchase of simple products (travel, motor).

### Data Landscape
- Established insurers have 10-20 years of claims data (life) but often in legacy systems.
- Non-life data: 5-10 years, better structured due to shorter policy terms.
- Data quality issues: inconsistent coding, manual entry errors, paper-based legacy records.
- Limited industry-wide data sharing (no equivalent of CIC for insurance).

## 8. Regulatory Landscape

### Ministry of Finance (MOF)
- Insurance business law (amended 2022, effective 2023): modernized framework.
- MOF approves insurance product designs and tariff structures.
- Increasing focus on consumer protection and fair pricing.
- Solvency requirements: risk-based capital framework being implemented.

### Data Regulations
- Decree 13/2023 on personal data protection applies to insurance data.
- Health data: additional protections under health information regulations.
- Cross-border data transfer: restrictions may affect cloud-based ML deployments.
- Customer consent: required for data collection, processing, and sharing.

### ML-Specific Considerations
- No explicit regulation on ML in insurance pricing (yet), but fair pricing principles apply.
- Explainability: insurers should be prepared to explain ML-driven pricing decisions.
- Anti-discrimination: pricing cannot discriminate on prohibited grounds (though Vietnamese law is less prescriptive than EU on this).
- Expect increasing regulatory attention as ML adoption grows in insurance.

## 9. Market Size for Insurtech ML

### Total Addressable Market: $50-80M annually (Vietnam, 2025-2026)
- Risk scoring and underwriting: $15-25M.
- Claims management and fraud detection: $10-20M.
- Pricing optimization: $10-15M.
- Customer analytics and distribution: $10-15M.
- Process automation (document processing, chatbot): $5-10M.

### Growth Drivers
- Insurance penetration growth (3% to 5% of GDP target by 2030).
- Digital distribution growth (online, bancassurance, embedded insurance).
- Regulatory modernization encouraging innovation.
- Competition driving need for ML-powered efficiency.
- Climate risk increasing demand for sophisticated risk models.

## 10. Data Challenges

- **Limited claims history**: newer products and younger market mean less data than mature markets.
- **Data quality**: legacy systems with inconsistent coding and manual entry.
- **No industry data pool**: unlike banking (CIC), no shared insurance data repository.
- **Small sample sizes**: rare events (large property claims, critical illness) have few examples.
- **Feature availability**: limited telematics, IoT, and digital behavioral data compared to mature markets.

### Mitigation Strategies
- Transfer learning from regional markets (Thailand, Indonesia) with similar demographics.
- Synthetic data augmentation for rare events (with careful validation).
- Start with simpler models (GLMs) and add ML complexity as data accumulates.
- Partner with telcos and e-wallets for alternative data (with consent).
- Industry consortium for anonymized data sharing (long-term goal).

## 11. Recommendations

1. Start with motor and health risk scoring — most data available, clearest ROI.
2. Build claims fraud detection early — even basic models deliver significant savings.
3. Combine actuarial GLMs with ML (GBDT) for pricing: regulatory acceptability + predictive power.
4. Invest in data quality improvement before advanced modeling; clean data beats complex models.
5. Partner with bancassurance channels for data enrichment (banking behavior predicts insurance risk).
6. Plan for data residency requirements; use Vietnamese or regional cloud infrastructure.
7. Target insurtech startups (Papaya, LIAN) and forward-thinking incumbents (Bao Viet, PVI) as early adopters.
