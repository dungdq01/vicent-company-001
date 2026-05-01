# Finance Domain Expert Notes: Agentic AI (B10)
## By Hung Ngo (R-D02) — Date: 2026-03-31

### 1. Overview

Banking and finance is a high-value domain for agentic AI, where autonomous agents can automate document-heavy compliance workflows, generate financial analyses, and streamline customer onboarding. However, the sector demands extreme accuracy, full auditability, and strict regulatory compliance. Vietnam's banking sector (48 commercial banks, $800B+ total assets) is actively digitizing, creating opportunities for AI agent deployment.

### 2. Compliance Automation Agents (KYC/AML)

**KYC Document Review Agent:**
- Workflow: receive customer documents (ID card, passport, business license) -> extract information (OCR + LLM) -> validate against government databases -> flag inconsistencies -> generate compliance report.
- Tools needed: OCR (Vietnamese ID cards), database lookup (national citizen database), document verification API, report generation.
- Agent handles: 80% of standard KYC cases autonomously. Flags the remaining 20% (missing documents, mismatched data, high-risk indicators) for human review.
- Key challenge: Vietnamese ID card formats vary (old 9-digit, new 12-digit CCCD with chip). Agent must handle all formats.

**AML Transaction Monitoring Agent:**
- Workflow: receive flagged transactions -> gather context (account history, customer profile, counterparty info) -> assess risk level -> generate Suspicious Activity Report (SAR) or clear the alert.
- Current state: AML systems generate massive alert volumes with 95%+ false positive rates. Agents can triage alerts, reducing human review burden by 60-70%.
- Tools: transaction database query, customer profile lookup, sanctions list check (OFAC, UN, Vietnam's own lists), news search for adverse media.
- Autonomy: agent clears low-risk false positives automatically; escalates medium and high-risk alerts with pre-filled investigation reports.

### 3. Financial Analysis Agents

**Report Generation Agent:**
- Capabilities: ingest financial data (CSV, Excel, database) -> compute metrics (ratios, trends, comparisons) -> generate narrative report in Vietnamese or English.
- Use cases: monthly portfolio reports, quarterly earnings analysis, credit risk assessments.
- Tools: Python data analysis (pandas), charting, database query, report template engine.
- Expected output: 80% draft quality; human analyst reviews and refines.

**Data Extraction Agent:**
- Extract structured data from unstructured financial documents: annual reports, prospectuses, loan agreements, financial statements.
- Use OCR + LLM pipeline: OCR converts document to text; LLM extracts specific fields into structured format.
- Vietnamese financial documents: mix of Vietnamese and English, inconsistent formatting across institutions.
- Accuracy target: 95%+ for key financial fields (revenue, profit, total assets).

### 4. Customer Onboarding Agents

- End-to-end onboarding: collect documents -> KYC check -> risk assessment -> account opening -> welcome communication.
- Agent orchestrates the full workflow, calling specialized tools at each step.
- Integration: core banking system API, KYC service, credit bureau (CIC - Vietnam Credit Information Center), SMS/email service.
- Current onboarding time: 3-7 days. Target with agent: same-day for standard cases.
- Must handle: individual accounts, business accounts (more complex), foreign nationals (additional document requirements).

### 5. Fraud Investigation Agents

- When fraud is detected, agents accelerate investigation:
  - Gather all related transactions across accounts.
  - Build a timeline of suspicious activity.
  - Identify connected accounts (network analysis).
  - Cross-reference with known fraud patterns.
  - Generate investigation report with evidence summary.
- Tools: transaction database, graph database for relationship mapping, pattern matching engine, report generator.
- Autonomy: agent prepares the investigation package; human fraud analyst makes the final determination.
- Time saving: reduce investigation time from 4-8 hours to 30-60 minutes.

### 6. Vietnamese Banking Landscape

**Market Overview:**
- 48 commercial banks, 4 state-owned (Vietcombank, VietinBank, BIDV, Agribank) dominating ~45% of assets.
- Private banks leading digital transformation: TPBank, Techcombank, VPBank, MBBank.
- Total banking assets: ~$800B+ (2025).
- Digital banking users: ~70 million (rapidly growing).
- Mobile banking penetration: ~65% of banked population.

**Digital Transformation Status:**
- Most large banks have core banking modernization underway.
- API ecosystems emerging but not standardized (no Vietnamese equivalent of Open Banking UK).
- Chatbots deployed at most major banks; agentic AI is the next evolution.
- Cloud adoption growing but many banks still run on-premises due to data sovereignty concerns.

### 7. Regulatory Considerations

**State Bank of Vietnam (SBV):**
- Circular 09/2020: Regulations on information technology in banking — requires risk assessment for AI/automation systems.
- SBV is developing an AI governance framework for financial services (expected 2026-2027).
- Banks must maintain human oversight for all automated decisions affecting customers.
- All AI systems must have audit trails and explainability.

**Data Protection:**
- Decree 13/2023 on Personal Data Protection: customer financial data is "sensitive personal data" requiring enhanced protection.
- Data localization: financial data must be stored within Vietnam (or with explicit SBV approval for cross-border transfer).
- Customer consent required for AI processing of personal financial data.

**Anti-Money Laundering:**
- Law on Anti-Money Laundering (2022): automated systems must still have human oversight for SAR filing.
- Agents can prepare SARs but a compliance officer must review and approve filing.

### 8. Market Size and Opportunity

- Vietnam banking IT spending: ~$1.5-2B annually (growing 15-20% YoY).
- Compliance automation market: estimated $100-200M in Vietnam by 2027.
- Customer onboarding automation: potential to save $5-15 per onboarding case; at 5M new accounts/year across the industry = $25-75M addressable market.
- AML alert triage: 60-70% reduction in analyst time = significant cost savings for banks processing 10K+ alerts/month.
- Financial report automation: 50-70% time saving for analyst teams.

### 9. Practical Deployment Challenges

- **Accuracy requirements**: Financial errors have legal and regulatory consequences. Agent outputs must be verified.
- **Explainability**: Regulators may ask why the agent made a specific decision. Build reasoning traces into every workflow.
- **Integration complexity**: Core banking systems are often legacy (COBOL, AS/400). API wrappers needed.
- **Change management**: Compliance teams are conservative. Deploy alongside (not replacing) existing processes initially.
- **Vietnamese document OCR**: Quality varies significantly; invest in fine-tuned OCR for Vietnamese financial documents.

### Recommendations for B10

1. **Target KYC/AML compliance first** — highest pain point (alert fatigue, manual document review) and clearest ROI.
2. **Build Vietnamese financial document OCR** as a core capability — it is a prerequisite for most finance agent use cases.
3. **Design for full auditability** — every agent decision must be traceable and explainable for regulatory review.
4. **Partner with a mid-tier digital bank** (TPBank, MBBank) for pilot — they are more agile than state-owned banks.
5. **Start in agent-assisted mode** — generate reports and recommendations for human decision-makers, not autonomous actions.
6. **Invest in SBV regulatory relationship** — proactive engagement with the regulator will accelerate approval for production deployment.
