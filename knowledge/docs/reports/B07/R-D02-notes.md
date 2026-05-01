# Finance Domain Notes: Anomaly Detection & Monitoring (B07)
## By Finance Domain Expert (R-D02) — Date: 2026-03-31

---

## 1. Fraud Detection Landscape in Vietnam Banking

Vietnam's banking sector has experienced rapid digitalization, with over 80% of
adults now holding bank accounts and digital transaction volumes growing 30-40% YoY.
This growth has attracted increasingly sophisticated fraud:

- **Vietcombank (VCB)**: Largest state-owned bank, processes 5M+ daily transactions.
  Invested in AI-based fraud detection since 2023, partnering with local fintechs.
- **VPBank**: Pioneer in digital banking (CAKE, VPBank NEO). High exposure to retail
  fraud due to aggressive digital acquisition. Reported 15% rise in fraud attempts 2025.
- **Techcombank (TCB)**: Strong technology stack, early adopter of real-time transaction
  monitoring. Invested $20M+ in fraud prevention infrastructure.
- **Overall market**: Estimated $200M+ in annual fraud losses across Vietnam's banking
  sector, with card fraud and social engineering being the top two categories.

## 2. Transaction Monitoring: Real-Time Detection

**Card Fraud Detection**: EMV chip adoption is high for physical cards, pushing fraud
to card-not-present (CNP) channels. Key signals: unusual merchant category, geographic
impossibility (transaction in HCMC 5 minutes after one in Hanoi), velocity checks
(multiple transactions in rapid succession), and device fingerprint changes.

**Wire/Transfer Fraud**: Domestic transfers via Napas network require real-time scoring.
Patterns include: mule account detection (new accounts receiving many small deposits
then large withdrawals), round-amount transfers to new beneficiaries, and transfers
timed outside business hours to accounts flagged in shared fraud databases.

**Scoring pipeline**: Events from core banking -> Kafka -> Flink scoring engine ->
decision (approve/hold/block) within 200ms SLA. False positive rate must stay below
0.5% to avoid customer friction, especially for mobile banking users.

## 3. AML Compliance: Vietnamese Regulatory Framework

**Key regulations**:
- **Law on Anti-Money Laundering (2022, amended)**: Requires financial institutions to
  implement customer due diligence, suspicious transaction reporting, and risk-based
  monitoring systems.
- **Circular 35/2013/TT-NHNN** (and subsequent amendments): Mandates reporting of
  suspicious transactions to the State Bank of Vietnam (SBV) Anti-Money Laundering
  Department. Threshold: cash transactions >= 300 million VND (~$12,000 USD).
- **Decree 116/2013/ND-CP**: Details AML implementation for non-bank financial entities.

**Anomaly detection for AML**: Transaction graph analysis to identify structuring
(smurfing), layering through shell companies, and unusual cross-border flows. Vietnam
is on the FATF "increased monitoring" follow-up list, making robust AML systems a
regulatory priority for all banks.

## 4. Credit Scoring Anomalies

Vietnam's credit bureau (CIC - Credit Information Center) coverage has improved but
data quality remains inconsistent. Anomaly detection applies to:

- **Application fraud**: Synthetic identities using fake CCCD (citizen ID) numbers,
  income inflation, and employer verification failures.
- **Behavioral scoring drift**: Detect when a borrower's spending pattern shifts
  dramatically (e.g., sudden cash advance spikes indicating financial distress).
- **First-party fraud**: Borrowers with no intent to repay; detected via network
  analysis linking applications sharing phone numbers, addresses, or device IDs.

## 5. Insurance Fraud Patterns

Vietnam's insurance market ($8B+ premiums annually) faces fraud estimated at 10-15%
of claims. Key patterns:

- **Health insurance**: Phantom claims, upcoding procedures, and organized fraud rings
  involving clinics submitting bulk false claims.
- **Motor insurance**: Staged accidents, inflated repair costs, and duplicate claims
  across multiple insurers. Anomaly detection on repair shop networks is effective.
- **Life insurance**: Early death claims on recently purchased high-value policies.

## 6. E-Wallet Fraud: MoMo, ZaloPay, VNPay

E-wallets process 500M+ transactions/month in Vietnam. Fraud vectors include:

- **Account takeover (ATO)**: SIM swap attacks exploiting Vietnam's easy SIM registration
  process. MoMo reported blocking 50K+ ATO attempts monthly.
- **Promotional abuse**: Bot farms creating thousands of accounts to exploit sign-up
  bonuses and cashback campaigns. Detection via device fingerprinting and behavioral
  biometrics.
- **Fake QR codes**: Physical QR code stickers placed over legitimate merchant codes at
  markets and street vendors. Losses concentrated in HCMC and Hanoi. Prevention requires
  merchant verification and transaction amount confirmation flows.
- **Social engineering**: Zalo messages impersonating bank officials requesting OTP codes.
  Vietnam ranks among the highest in Southeast Asia for social engineering fraud.

## 7. Vietnam-Specific Fraud Patterns

- **Tet (Lunar New Year) spikes**: Fraud attempts increase 3-5x during Tet season due
  to high transaction volumes and relaxed monitoring by understaffed teams.
- **Cross-border e-commerce fraud**: Fake seller accounts on Shopee/Lazada processing
  fraudulent transactions through Vietnamese payment gateways.
- **Loan shark digital migration**: Illegal lending apps (often Chinese-operated) using
  Vietnamese bank accounts for money movement; AML systems must detect these flows.
- **Cryptocurrency-related laundering**: OTC crypto trading via Telegram/Zalo groups
  converting fraud proceeds; banks must monitor unusual P2P transfer patterns.

## 8. Market Opportunity and Investment Outlook

The fraud detection and AML technology market in Vietnam is estimated at $50-80M
annually, growing at 25%+ CAGR. Key drivers: SBV regulatory pressure, digital banking
growth, and insurance sector modernization. Local players (FPT, CMC, Viettel Solutions)
compete with global vendors (NICE Actimize, SAS, Featurespace). Opportunity exists for
AI-native solutions that understand Vietnamese transaction patterns and regulatory
requirements at a competitive price point.

---

*End of Finance Domain Expert notes for B07.*
