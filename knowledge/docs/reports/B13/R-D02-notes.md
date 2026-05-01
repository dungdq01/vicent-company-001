# Finance Domain Expert Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

Financial services is the largest consumer of tabular ML in Vietnam. Credit scoring, churn prediction, loan default prediction, customer lifetime value, and fraud scoring are mature use cases with proven ROI. This note covers the Vietnamese banking landscape, key use cases, regulatory constraints, and market sizing.

## 2. Credit Scoring

### Traditional Credit Scoring (CIC)
- CIC (Credit Information Center) under State Bank of Vietnam provides credit reports.
- Coverage: ~50M individuals with credit history, but many Vietnamese lack formal credit records.
- CIC score range: 300-900 (similar to FICO).
- Limitations: thin-file customers (young, rural, informal economy) have no CIC history.

### Alternative Credit Scoring (ML-Powered)
- Data sources: mobile phone usage (call/SMS patterns, app usage, top-up behavior), e-wallet transactions (MoMo, ZaloPay), social data, device data.
- Models: LightGBM/XGBoost on 200-500 engineered features.
- Target: probability of default within 30/60/90 days.
- Vietnamese players: FE Credit, Home Credit Vietnam, Lotte Finance pioneered alternative scoring.
- Accuracy: AUC 0.72-0.85 depending on data richness and customer segment.

### Alternative Data Sources
- Telco data: Viettel, VNPT, MobiFone partnerships for call/recharge patterns.
- E-commerce: Shopee, Tiki transaction history.
- Utility payments: electricity (EVN), water bill payment patterns.
- Social insurance: BHXH records for employment verification.
- Psychometric scoring: personality-based credit assessment (experimental in VN).

## 3. Churn Prediction (Banking)

- Predict customers likely to close accounts or reduce balances within 30-90 days.
- Key features: transaction frequency decline, balance drop, customer service complaints, competitive product inquiries.
- Models: binary classification (churn/no churn) or survival analysis (time to churn).
- Intervention: targeted retention offers, relationship manager outreach, improved service.
- ROI: retaining a banking customer is 5-7x cheaper than acquiring a new one.
- Vietnamese context: high switching rates among digital-savvy urban customers; loyalty lower than mature markets.

## 4. Loan Default Prediction

- Predict probability of default at origination and during loan lifecycle.
- Origination model: used at application stage; features include application data, CIC score, alternative data.
- Behavioral model: used for existing borrowers; features include payment patterns, account behavior, macro-economic indicators.
- Collection model: predict recovery likelihood for defaulted loans; prioritize collection efforts.
- Vietnamese NPL rates: 1.5-3% officially, 5-8% including sold NPLs (VAMC).
- Regulatory requirement: banks must maintain internal credit risk models per Basel II/III.

## 5. Customer Lifetime Value (CLV)

- Predict total revenue a customer will generate over their banking relationship.
- Components: product holdings prediction, transaction revenue, fee income, cross-sell probability.
- Models: regression for revenue prediction, classification for product adoption.
- Use cases: acquisition channel optimization, service tier assignment, resource allocation.
- Vietnamese banking: CLV models are emerging; most banks still use simple segmentation (balance tiers).

## 6. Fraud Scoring (B07 Overlap)

- Real-time transaction fraud scoring for card payments, transfers, e-wallet.
- Features: transaction amount, time, location, device, merchant category, behavioral patterns.
- Models: XGBoost with real-time feature computation; ensemble with rule-based systems.
- Latency requirement: <100ms for real-time authorization decisions.
- Vietnamese fraud landscape: card fraud growing with e-commerce; social engineering scams prevalent.
- Refer to B07 (Anomaly Detection & Fraud) for detailed fraud architecture.

## 7. Vietnamese Banking Landscape

### Major Banks
- **State-owned**: Vietcombank, VietinBank, BIDV, Agribank (dominant market share, slower ML adoption).
- **Private/Joint-stock**: Techcombank, VPBank, MBBank, TPBank (faster ML adoption, digital-first).
- **Digital banks**: Timo (VPBank), TNEX (MSB), Cake (VPBank) — built for ML from inception.

### Fintech Ecosystem
- Lending: FE Credit, Home Credit, Lotte Finance (consumer finance with ML scoring).
- E-wallets: MoMo, ZaloPay, VNPay (data-rich, ripe for ML).
- P2P lending: Tima, Vaymuon (high-risk, heavy ML dependence for risk scoring).
- Buy-now-pay-later: Fundiin, Kredivo VN (emerging, ML-scored credit limits).

### Technology Readiness
- Top-tier banks (Techcombank, MBBank, TPBank): dedicated data science teams, cloud infrastructure.
- Mid-tier banks: building ML capabilities, often with vendor support.
- State-owned banks: legacy systems, slower adoption, but massive data volumes.

## 8. State Bank Regulations on Credit Scoring

- Circular 11/2021/TT-NHNN: regulations on credit information activities.
- Credit scoring models must be validated and documented.
- Explainability requirement: reasons for credit denial must be provided to applicants.
- Data usage: consent required for credit scoring data; cross-selling restrictions.
- Model risk management: banks must have model validation frameworks (independent review).
- Anti-discrimination: scoring models must not discriminate based on protected characteristics.
- SBV is increasingly focused on AI governance in banking; expect more regulations.

## 9. Market Sizing

### Financial ML Market in Vietnam
- Total addressable market: $100-150M annually (2025-2026 estimate).
- Credit scoring: $30-50M (largest segment, driven by consumer lending growth).
- Fraud detection: $20-30M (regulatory pressure and e-commerce growth).
- Customer analytics (churn, CLV, segmentation): $15-25M.
- Risk management (Basel compliance, stress testing): $15-25M.
- Operational ML (process automation, document processing): $10-20M.

### Growth Drivers
- Consumer lending growth: 15-20% annually.
- Digital banking adoption: 70%+ of urban population using mobile banking.
- Regulatory push: Basel II/III compliance requiring advanced risk models.
- Competition: banks competing on digital experience and personalization.

### Competitive Landscape
- Global vendors: FICO, SAS, Experian (expensive, established).
- Regional: CredoLab (Singapore), Advance.AI (Singapore) — strong in SEA alternative scoring.
- Local: emerging Vietnamese ML companies; most banks building in-house capabilities.

## 10. Recommendations

1. Start with credit scoring (highest ROI, most data available, clear regulatory framework).
2. Build alternative data partnerships early (telco, e-wallet, utility) for thin-file scoring.
3. Invest in model explainability from day one; SBV regulations will tighten.
4. Combine CIC data with alternative data for best scoring accuracy.
5. Address model fairness for rural and thin-file populations; avoid urban bias.
6. Plan for Basel II/III model validation requirements; document model development rigorously.
7. Target private/digital banks first; they have budget, data infrastructure, and urgency.
