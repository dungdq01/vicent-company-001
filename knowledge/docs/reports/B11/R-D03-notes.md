# Healthcare Domain Expert Notes: Knowledge Graph (B11)
## By Bui Thi Lan Anh (R-D03) — Date: 2026-03-31

### 1. Medical Knowledge Graph Overview

Medical KGs encode relationships between diseases, drugs, symptoms, procedures, patients, providers, and regulations. They enable clinical decision support, drug interaction checking, and patient journey analysis.

**Core entity types for healthcare KG**:
- Disease / Condition
- Drug / Medication
- Symptom / Clinical Finding
- Medical Procedure / Treatment
- Healthcare Provider (Hospital, Clinic, Doctor)
- Patient (anonymized)
- Insurance Plan / Coverage
- Regulation / Guideline

### 2. Drug-Drug Interaction (DDI) Graphs

One of the highest-value applications of medical KGs:

- **Data sources**: DrugBank, FDA Adverse Event Reporting System (FAERS), Vietnamese National Drug Formulary
- **Relationship types**: INTERACTS_WITH (severity: major/moderate/minor), CONTRAINDICATED_WITH, SYNERGISTIC_WITH
- **Graph structure**: Bipartite drug-interaction graph with severity and mechanism properties
- **Use cases**: Alert system for prescription checking, pharmacist decision support
- **Vietnamese context**: Ministry of Health drug registry (Duoc thu Quoc gia) as authoritative source

**Example triples**:
- (Warfarin)-[:INTERACTS_WITH {severity: "major", mechanism: "CYP2C9 inhibition"}]->(Fluconazole)
- (Metformin)-[:TREATS]->(Type 2 Diabetes)
- (Aspirin)-[:CONTRAINDICATED_WITH {reason: "bleeding risk"}]->(Warfarin)

### 3. Disease Ontologies

**SNOMED CT (Systematized Nomenclature of Medicine)**:
- Most comprehensive clinical terminology (~350,000 concepts)
- Hierarchical structure with IS-A relationships
- Used internationally for electronic health records
- Vietnam adoption: Limited but growing in tertiary hospitals

**ICD-10 (International Classification of Diseases)**:
- Standard for disease coding in Vietnam (required by BHXH - Vietnam Social Insurance)
- ~70,000 codes organized hierarchically
- Vietnamese translation available (ICD-10 ban dich tieng Viet)
- Every hospital in Vietnam uses ICD-10 for insurance claims

**ICD-11**: Latest version (2022), richer relationships, better for KG modeling. Vietnam adoption planned but not yet mandated.

**Mapping between ontologies**: SNOMED CT to ICD-10 mapping available from IHTSDO; essential for integrating clinical data with insurance/administrative data.

### 4. Clinical Knowledge Graphs

Building KGs from clinical data:

- **Sources**: Electronic Medical Records (EMR), lab results, imaging reports, discharge summaries
- **NLP challenges**: Vietnamese medical records mix Vietnamese, English medical terms, and abbreviations
- **Entity extraction**: Drug names, dosages, diagnoses, procedures from clinical text
- **Temporal modeling**: Disease progression over time (diagnosed -> treated -> remission -> relapse)
- **Privacy**: All patient data must be de-identified before KG construction (see Security notes)

### 5. Patient Journey Mapping

Model the typical path patients take through the healthcare system:

```
Symptom Onset → Primary Care Visit → Referral → Specialist Consultation
    → Diagnostic Tests → Diagnosis → Treatment Plan → Follow-up → Outcome
```

**KG representation**:
- Patient entity connected to sequence of healthcare events
- Each event linked to provider, diagnosis, procedures, medications
- Temporal ordering via event timestamps
- Aggregated patterns reveal: common pathways, bottlenecks, treatment variations

**Value**: Identify inefficiencies (unnecessary referrals), standard of care deviations, cost optimization opportunities.

### 6. Vietnamese Healthcare Landscape

**Hospital system tiers**:
| Tier | Description | Count | KG Relevance |
|------|-------------|-------|-------------|
| Central | Ministry of Health hospitals (Bach Mai, Cho Ray) | ~50 | Highest data quality, EMR adoption |
| Provincial | Provincial general hospitals | ~400 | Moderate EMR adoption |
| District | District hospitals | ~700 | Low EMR adoption, paper records |
| Commune | Health stations | ~11,000 | Minimal digital data |

**Key institutions for KG data**:
- Ministry of Health (Bo Y Te): Regulations, drug formulary, treatment guidelines
- Vietnam Social Insurance (BHXH): Claims data, provider networks, coverage rules
- Drug Administration of Vietnam (DAV): Drug registration, safety alerts
- Medical universities: Research publications, clinical trials

**Insurance system**:
- BHXH covers ~90% of population
- Tiered coverage based on hospital level (tuyen)
- Referral system: Patients must start at registered facility
- Claims data is the richest structured healthcare dataset in Vietnam

### 7. Regulatory Requirements

**Ministry of Health regulations relevant to KG**:
- Circular 46/2018/TT-BYT: Electronic health record standards
- Circular 54/2017/TT-BYT: Medical record data elements
- Decree 13/2023/ND-CP: Personal data protection (includes health data as sensitive)
- Health data classified as "sensitive personal data" — highest protection level

**Compliance requirements for medical KG**:
- De-identification mandatory before any analytics use
- Patient consent required for secondary data use
- Data localization: Health data of Vietnamese citizens must be stored in Vietnam
- Audit trail for all access to patient-related data
- Ministry of Health approval for health data platforms

### 8. Medical Terminology in Vietnamese

Challenges for NLP and KG construction:

- **Dual terminology**: Vietnamese medical professionals use both Vietnamese and English/Latin terms interchangeably
  - "Viem phoi" = Pneumonia
  - "Dai thao duong" = Diabetes mellitus
  - "Ung thu" = Cancer (but "Carcinoma" also used)
- **Abbreviations**: "HA" (huyet ap / blood pressure), "XN" (xet nghiem / lab test), "BN" (benh nhan / patient)
- **Drug names**: Mix of generic names (English), brand names (various languages), and Vietnamese transliterations
- **Solution**: Build a comprehensive medical terminology mapping table (Vietnamese - English - ICD-10 - SNOMED CT)

### 9. Market Size and Opportunity

**Vietnam healthcare market**:
- Total healthcare expenditure: ~$20 billion (2025), growing 10% annually
- Digital health market: ~$1.5 billion (2025), growing 20% annually
- Hospital IT spending: ~$300 million (2025)
- Key pain points: Drug interactions (limited checking), care coordination (fragmented records), insurance fraud detection

**KG-specific opportunities**:
- Drug interaction alert system: Every hospital needs this; current solutions are basic
- Clinical decision support: Treatment guideline compliance checking
- Insurance fraud detection: Network analysis of provider-patient-claim relationships
- Medical research: Literature-based discovery from Vietnamese medical publications

**Competitive landscape**: No established medical KG provider in Vietnam. International solutions (IBM Watson Health, Google Health) have limited Vietnamese language support.

### 10. Data Availability Assessment

| Data Source | Accessibility | Quality | Coverage |
|-------------|--------------|---------|----------|
| ICD-10 Vietnamese | Public | High | Full |
| Drug formulary (Duoc thu QG) | Public | High | Full |
| BHXH claims data | Restricted (partnership needed) | Medium | 90% population |
| Hospital EMR data | Very restricted | Variable | Tier 1-2 hospitals |
| Drug interaction databases | Licensed (DrugBank) | High | Global coverage |
| Medical literature (Vietnamese) | Public (PubMed, journal sites) | Medium | Limited scope |

### Recommendations for B11

1. **Start with drug-drug interaction KG** — it has the clearest data sources (DrugBank + Vietnamese drug formulary), highest clinical value, and lowest privacy risk
2. **Build the Vietnamese medical terminology mapping as foundational infrastructure** — every downstream NLP task depends on it
3. **Use ICD-10 as the backbone ontology for diseases** — it is the mandated standard in Vietnam and ensures interoperability with insurance data
4. **Partner with a central hospital for EMR access** — Bach Mai or Cho Ray have the most mature EMR systems and research orientation
5. **Prioritize de-identification infrastructure** — Vietnamese health data regulations are strict; build compliance into the architecture from day one
6. **Target BHXH partnership for claims data** — this is the single richest structured healthcare dataset in Vietnam
7. **Position the medical KG as a clinical decision support tool** — this framing aligns with Ministry of Health digital health priorities and improves partnership prospects
