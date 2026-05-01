# Finance Domain Expert Notes: Conversational AI & Chatbots (B08)
## By Phong Nguyen (R-D02) — Date: 2026-03-31

### Vietnamese Banking Landscape

**Digital Banking Leaders (2026)**
- VPBank NEO: aggressive digital transformation; AI-powered virtual assistant "VPBank NEO AI"
- Techcombank: strong digital banking; "Techcombank Mobile" with 10M+ users
- MB Bank: "App MBBank" leading in user growth; BizMB for SME banking
- TPBank: pioneer in LiveBank (unmanned branches); strong chatbot integration
- VietinBank: large state-owned bank digitizing; iPay mobile banking
- Vietcombank: largest by assets; VCB Digibank with growing digital user base

**Market Context**
- 70% of Vietnamese adults now have bank accounts (up from 30% in 2018)
- Mobile banking transactions: 13B+ in 2025, growing 40% YoY
- QR payments (VietQR): ubiquitous — even street vendors accept QR
- Interbank transfer: free via Napas 24/7 — high expectation for instant service
- Average Vietnamese consumer interacts with banking 15-20x/month via mobile app

### Account Inquiry Chatbot

Most frequent banking chatbot use case:
- Balance inquiry: "Số dư tài khoản em bao nhiêu?" — requires authenticated session
- Transaction history: "Cho em xem giao dịch tuần này" — parse Vietnamese date expressions
- Account details: account number, branch, account type, linked cards
- Multi-account: Vietnamese users often have 2-3 accounts (salary, savings, business) — bot must disambiguate
- Authentication flow: biometric (fingerprint/face) in-app → session token → chatbot has read-only API access
- Privacy: never display full account number in chat; mask as "***4567"
- Response format: structured (table for transactions) rather than narrative

### Transaction Dispute Handling

- Common disputes: unauthorized transaction, duplicate charge, wrong amount, failed transfer but money deducted
- Bot flow: identify disputed transaction → collect details (date, amount, merchant) → create dispute ticket → provide reference number
- Time sensitivity: Vietnamese regulations require bank acknowledgment within 48 hours
- Bot should explain process: "Ngân hàng sẽ xử lý trong 15 ngày làm việc. Mã khiếu nại: KN20260331-001"
- Escalation trigger: if disputed amount >5M VND or customer expresses urgency → route to human agent immediately
- Documentation: bot should guide user to upload evidence (screenshot, receipt) via chat attachment

### Loan Application Assistant

- Pre-qualification via chatbot: collect income, employment, loan amount, purpose → instant preliminary assessment
- Loan types popular in Vietnam: consumer loan (vay tiêu dùng), mortgage (vay mua nhà), auto loan, business loan
- Vietnamese salary patterns: base salary + allowances + bonuses; income verification is complex
- Bot collects: CCCD number, income proof type, employment status, desired amount, loan term
- Installment calculator: "Vay 500 triệu, 20 năm, lãi suất 8.5% → trả hàng tháng 4.3 triệu"
- Handoff: after pre-qualification, schedule appointment with loan officer or continue application online
- Compliance: bot must present terms clearly; "Lãi suất có thể thay đổi theo quy định ngân hàng"

### Financial Advisory Chatbot

- Savings advice: recommend savings products based on amount, term, risk appetite
- Vietnamese interest rate context: savings rates 4-6% for 12-month term deposits (2026)
- Investment education: explain products (chứng chỉ quỹ, trái phiếu, cổ phiếu) at basic level
- Bot must include disclaimer: "Thông tin này chỉ mang tính chất tham khảo, không phải tư vấn đầu tư"
- Insurance cross-sell: bancassurance is major revenue for Vietnamese banks; chatbot can introduce products
- Personal finance management: spending analysis from transaction data, budget suggestions
- Regulatory limit: chatbot cannot provide specific investment recommendations without proper licensing

### Regulatory Requirements (State Bank of Vietnam)

**SBV Regulations Affecting Chatbots**
- Circular 09/2020: e-banking security requirements; chatbot as an e-banking channel must comply
- Customer authentication: minimum 2-factor for transactions; chatbot for informational queries may use single factor
- Data localization: banking customer data must be stored in Vietnam (Decree 13/2023 + SBV requirements)
- Transaction records: must be retained for minimum 10 years
- Audit trail: every chatbot interaction involving account data must be logged and auditable

**Compliance Implementation**
- Chatbot must not execute financial transactions directly — can initiate but must route to secure transaction flow
- Session timeout: 5 minutes of inactivity in banking chat → require re-authentication
- IP/device tracking: flag if chatbot is accessed from unusual location or device
- Reporting: quarterly reports to SBV on digital channel usage and incidents

### KYC/eKYC via Chat

- Vietnam eKYC adoption: allowed by SBV since 2020 (Circular 16/2020); most banks now support
- Chat-based eKYC flow: capture CCCD (Citizen ID card) photos → OCR extraction → face matching → liveness check
- Bot guides user: "Vui lòng chụp mặt trước CCCD" → "Bây giờ chụp mặt sau" → "Quay video khuôn mặt"
- Integration: chat sends images to eKYC engine (FPT.AI eKYC, VNPT eKYC, or bank's own system)
- Vietnamese CCCD: chip-based ID with NFC; newer flow reads chip data via NFC on phone
- Common issues: poor image quality, glare on card, face not matching (weight change, glasses)
- Bot error handling: "Ảnh chưa rõ, bạn chụp lại giúp em nhé" — guide user patiently through retakes

### Vietnamese Financial Terminology Challenges

Vietnamese financial language has unique characteristics:
- Formal vs informal: "lãi suất" (interest rate) is formal; customers may say "lãi" or "tiền lời"
- Loan terms: "dư nợ" (outstanding balance), "gốc" (principal), "lãi" (interest), "kỳ hạn" (term)
- Numbers: Vietnamese uses dot for thousand separator ("1.000.000" = 1 million) — opposite of English
- Currency expressions: "500k" = 500,000 VND; "5 triệu" = 5,000,000 VND; "1 tỷ" = 1,000,000,000 VND
- Abbreviations: "TK" (tài khoản = account), "GD" (giao dịch = transaction), "STK" (số tài khoản = account number)
- Code-switching in finance: "check balance", "transfer", "statement" commonly used alongside Vietnamese
- NLU must handle: "Cho em check balance TK" = "Let me check my account balance"

### Market Size & Opportunity

- Vietnamese banking chatbot market: estimated $50-80M by 2027
- Current adoption: top 10 banks all have basic chatbots; most are rule-based with limited capability
- Opportunity gap: upgrade from rule-based FAQ bots to LLM-powered conversational assistants
- ROI for banks: reduce call center volume by 30-40%; each call costs bank $1.5-2.5
- Customer expectation: 24/7 availability (Vietnamese banks traditionally close at 5PM)
- Competition: FPT.AI, Kore.ai, and international platforms competing for Vietnamese banking chatbot market
- Differentiation: Vietnamese language quality and local regulatory compliance are key competitive advantages

### Recommendations for B08

1. Account inquiry and transaction history are the highest-volume, lowest-risk use cases — deploy these first
2. Vietnamese financial terminology NLU requires domain-specific training data — generic NLP models fail on "dư nợ", "sao kê"
3. Never let the chatbot execute transactions — information and initiation only; transaction completion must go through authenticated banking flow
4. Data must stay in Vietnam for banking clients — plan for on-premises or Vietnam-cloud deployment
5. eKYC via chat is a differentiator — banks are actively looking for conversational eKYC solutions
6. Partner with a Vietnamese bank early (TPBank or VPBank are most innovation-friendly) to build reference case
