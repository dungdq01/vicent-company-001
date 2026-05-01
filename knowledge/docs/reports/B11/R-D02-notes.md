# Finance Domain Expert Notes: Knowledge Graph (B11)
## By Phan Thanh Long (R-D02) — Date: 2026-03-31

### 1. Financial Knowledge Graph Overview

Financial KGs model relationships between corporate entities, individuals, financial instruments, transactions, and regulatory structures. They power use cases in due diligence, fraud detection, compliance, and investment analysis.

**Core entity types for financial KG**:
- Legal Entity (Company, Partnership, Sole Proprietorship)
- Person (Director, Shareholder, Beneficial Owner)
- Financial Institution (Bank, Insurance, Securities)
- Financial Instrument (Stock, Bond, Loan)
- Regulatory Body (State Bank, SSC, MOF)
- Transaction / Event
- License / Permit

### 2. Corporate Entity Graphs (Ownership and Subsidiaries)

The highest-value financial KG application: mapping who owns what.

**Relationship types**:
- OWNS_SHARES_IN {percentage, share_count, share_type}
- SUBSIDIARY_OF {ownership_percentage}
- CONTROLS {mechanism: "direct" | "indirect" | "agreement"}
- DIRECTOR_OF {role: "chairman" | "ceo" | "member", appointed_date}
- REGISTERED_AT {address, registration_date}

**Multi-level ownership resolution**:
- Direct ownership: Company A owns 60% of Company B
- Indirect ownership: Company A owns 60% of B, B owns 80% of C -> A indirectly owns 48% of C
- Beneficial ownership: Trace through chains to find ultimate human controllers
- Circular ownership: Detect loops (A owns B owns C owns A) which are red flags

**Graph query example** (Cypher):
```cypher
MATCH path = (person:Person)-[:OWNS_SHARES_IN*1..5]->(target:Company {name: "Target Corp"})
WHERE ALL(r IN relationships(path) WHERE r.percentage > 25)
RETURN person.name, [r IN relationships(path) | r.percentage] AS ownership_chain
```

### 3. Fraud Detection Networks

KGs excel at detecting fraud patterns invisible in tabular data:

**Common fraud patterns detectable via graph analysis**:
- **Shell company networks**: Clusters of companies with shared directors/addresses but no real operations
- **Circular transactions**: Money flowing in loops to inflate revenue
- **Identity fraud**: Same person registered under different names across entities
- **Related-party transactions**: Undisclosed relationships between transacting parties
- **Pump-and-dump networks**: Coordinated stock purchases by connected accounts

**Graph algorithms for fraud detection**:
- Community detection (Louvain): Find tightly connected clusters of suspicious entities
- PageRank: Identify central nodes in fraud networks
- Shortest path: Trace money flow between entities
- Triangle counting: High triangle density indicates collusion networks
- Anomaly detection: Entities with unusual graph metrics (degree, betweenness)

### 4. Regulatory Compliance Graphs (Beneficial Ownership)

Vietnam and international regulations require beneficial ownership transparency:

**Vietnamese regulations**:
- Law on Enterprises 2020 (Luat Doanh nghiep): Requires disclosure of beneficial owners (>25% ownership or control)
- Anti-Money Laundering Law 2022 (Luat Phong chong rua tien): Customer due diligence requirements
- State Bank Circular 09/2023: KYC requirements for financial institutions

**International standards**:
- FATF Recommendations 24-25: Beneficial ownership transparency
- EU Anti-Money Laundering Directives (AMLD 5/6)
- OECD Common Reporting Standard (CRS)

**KG for compliance**:
- Model ownership chains as directed weighted graphs
- Compute beneficial ownership automatically by traversing ownership paths
- Flag entities where beneficial owner cannot be determined (opacity risk)
- Generate compliance reports showing ownership structure visualizations

### 5. Vietnamese Corporate Registry (DangKyKinhDoanh)

**National Business Registration Portal** (dangkykinhdoanh.gov.vn):
- Contains registration data for all ~900,000 active enterprises in Vietnam
- Data fields: Company name, tax code (MST), legal representative, registered capital, industry codes (VSIC), address, establishment date
- **Access**: Partially public (basic search), detailed data requires account or partnership

**Data extraction for KG**:
- Company entities with properties from registration
- Legal representative relationships (Person-[:LEGAL_REP_OF]->Company)
- Industry classification (Company-[:IN_INDUSTRY]->IndustryCode)
- Address relationships (Company-[:LOCATED_AT]->Address)
- Capital contribution relationships for LLCs (Person-[:CONTRIBUTED_CAPITAL {amount, percentage}]->Company)

**Challenges**:
- No official bulk API — data collection requires web scraping or partnership
- Name variations: Same company may appear with slight name differences
- Historical data: Changes in ownership/directors not always reflected
- Data quality: Self-reported by companies, limited verification

### 6. Banking Relationship Graphs

Model relationships between banks, customers, accounts, and transactions:

**Entity types**: Bank, Branch, Customer (Individual/Corporate), Account, Transaction, Loan
**Relationship types**: HAS_ACCOUNT, TRANSFERRED_TO, RECEIVED_FROM, GUARANTOR_FOR, COLLATERAL_FOR

**Use cases**:
- **Credit risk assessment**: Trace exposure through connected borrowers
- **Suspicious activity detection**: Identify transaction patterns matching money laundering typologies
- **Customer 360**: Unified view of customer across products and branches
- **Network risk**: If one entity defaults, trace impact through guarantee chains

### 7. AML (Anti-Money Laundering) Knowledge Graphs

KGs are becoming the standard tool for AML compliance:

**AML KG data sources**:
- Transaction monitoring alerts
- Sanctions lists (OFAC, EU, UN, Vietnam MOF sanctions)
- PEP (Politically Exposed Person) databases
- Adverse media screening
- Customer due diligence records
- STR (Suspicious Transaction Reports) filed with State Bank

**AML-specific graph patterns**:
- **Layering detection**: Multiple rapid transfers through intermediate accounts to obscure origin
- **Structuring (smurfing)**: Multiple deposits just below reporting thresholds
- **Trade-based laundering**: Over/under-invoicing in trade transactions between related parties
- **PEP network mapping**: Trace connections from PEPs to corporate entities and accounts

**Vietnamese AML landscape**:
- State Bank of Vietnam (NHNN) is the primary AML regulator
- Vietnam on FATF "grey list" follow-up — increased scrutiny on compliance
- Banks required to implement enhanced due diligence for high-risk customers
- Growing demand for technology solutions (KG-based AML) from Vietnamese banks

### 8. Vietnamese Financial Regulations

**Key regulatory bodies**:
| Body | Scope | Relevant Data |
|------|-------|--------------|
| State Bank of Vietnam (NHNN) | Banking, monetary policy | Licensed banks, payment providers |
| State Securities Commission (UBCKNN) | Securities markets | Listed companies, fund managers |
| Ministry of Finance (MOF) | Tax, fiscal policy | Tax registrations, budget data |
| Insurance Supervisory Authority | Insurance | Licensed insurers |
| Ministry of Planning & Investment (MPI) | Business registration | Enterprise registry |

**Regulations driving KG demand**:
- Circular 09/2023/TT-NHNN: AML/CFT customer due diligence
- Decree 13/2023/ND-CP: Personal data protection
- Law on Securities 2019: Disclosure requirements for listed companies
- Law on Credit Institutions 2024: Related-party lending limits

### 9. Market Size and Opportunity

**Vietnam financial services market**:
- Banking sector total assets: ~$800 billion (2025)
- Number of banks: 31 commercial banks + 2 policy banks + ~30 foreign bank branches
- Securities market capitalization: ~$250 billion
- Insurance market premiums: ~$8 billion

**KG-specific market opportunity**:
- AML compliance technology: $50-100M addressable market in Vietnam
- Credit risk analytics: $30-50M (connected-party risk analysis)
- Corporate due diligence: $20-40M (law firms, investment funds, consulting)
- RegTech (regulatory reporting): $10-20M

**Total addressable market for financial KG in Vietnam**: $100-200M annually

**Competitive landscape**:
- No Vietnam-specific financial KG provider exists today
- International players (Moody's, Bureau van Dijk) have limited Vietnam data
- Opportunity: Build the definitive Vietnamese corporate entity graph

### 10. Data Quality Challenges in Vietnamese Finance

- **Company name inconsistencies**: "Cong ty TNHH" vs "Cty TNHH" vs "Company Limited"
- **Tax code (MST) as primary key**: Most reliable identifier but not always available in all sources
- **Director name matching**: Vietnamese names with diacritics variations
- **Capital figures**: Registered capital vs actual paid-in capital (often different)
- **Industry classification**: VSIC codes sometimes outdated or incorrectly assigned
- **Cross-referencing**: No universal entity ID across government systems

### Recommendations for B11

1. **Build the Vietnamese corporate entity graph as the foundational financial KG** — ownership, directors, and industry relationships from DangKyKinhDoanh
2. **Use tax code (MST) as the primary entity identifier** — it is the most unique and widely used identifier across Vietnamese government systems
3. **Target AML compliance as the first commercial use case** — Vietnamese banks are under regulatory pressure and willing to pay for KG-based solutions
4. **Partner with a Vietnamese bank for pilot** — access to real transaction data and a paying customer validates the product
5. **Build sanctions and PEP list integration early** — these are table-stakes for any financial KG product
6. **Invest in Vietnamese company name normalization** — "Cong ty Co phan Tap doan Vingroup" vs "Vingroup JSC" must resolve to the same entity
7. **Map the Vietnamese corporate ownership network completely** — this dataset does not exist today and has enormous commercial value for due diligence, credit risk, and compliance
