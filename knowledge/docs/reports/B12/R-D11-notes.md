# Legal Domain Expert Notes: Search & RAG (B12)

## 1. Vietnamese Legal Search Landscape

Legal professionals in Vietnam spend significant time searching across fragmented legal databases. This represents a prime use case for Search & RAG.

### Existing Platforms
- **Thu Vien Phap Luat (TVPL)**: Largest legal database in Vietnam; 400K+ documents; subscription-based; keyword search with basic filtering
- **LuatVietnam**: Second major platform; bilingual (Vietnamese-English); strong in regulatory compliance
- **VanBanPhapLuat.co**: Free access to legal documents; less comprehensive
- **CSDL Quoc Gia ve Van Ban Phap Luat**: Official government legal database; authoritative but poor UX

### Pain Points (Opportunities for RAG)
- Keyword search misses semantically related regulations
- No cross-reference between related Nghi Dinh and Thong Tu
- Lawyers spend 2-4 hours/day searching for relevant legal provisions
- No natural language Q&A capability ("What are the penalties for late tax filing?")

## 2. Vietnamese Legal Document Structure

Understanding document hierarchy is critical for chunking and retrieval:

### Document Types (Hierarchy of Authority)
1. **Hien Phap** (Constitution): Supreme legal authority
2. **Luat / Bo Luat** (Law / Code): Passed by National Assembly
3. **Phap Lenh** (Ordinance): Passed by Standing Committee
4. **Nghi Dinh** (Decree): Issued by Government, implements Laws
5. **Quyet Dinh** (Decision): Issued by Prime Minister or Ministers
6. **Thong Tu** (Circular): Issued by Ministries, detailed guidance
7. **Cong Van** (Official Letter): Administrative guidance, less binding

### Document Structure
- Each document has: Number, issuing authority, date, subject, articles (Dieu), clauses (Khoan), points (Diem)
- Citation format: "Dieu 15, Khoan 2, Diem a, Nghi Dinh 123/2024/ND-CP"
- Documents frequently reference and amend each other — relationship tracking is essential

### Chunking Strategy for Legal Documents
- Chunk at Article (Dieu) level — each article is a self-contained legal provision
- Preserve metadata: document number, article number, effective date, issuing authority
- Include parent context: chapter/section heading in each chunk
- Track amendment chains: which articles replace or modify which

## 3. Contract Clause Search

### Use Cases
- Find similar clauses across contract templates
- Check clause compliance with current regulations
- Identify missing standard clauses in a contract draft
- Compare terms across vendor contracts

### RAG Application
- Index a corpus of standard contracts (NDA, service agreement, employment, lease)
- Query: "What are typical penalty clauses for late delivery in construction contracts?"
- RAG returns relevant clauses with source contracts cited
- Vietnamese legal language is formal and distinct from conversational Vietnamese

## 4. Regulatory Compliance Search

### Use Cases
- "What licenses do I need to operate a fintech company in Vietnam?"
- "What are the data localization requirements under Decree 13?"
- "Has the corporate tax rate changed for 2025?"
- Cross-referencing multiple Nghi Dinh and Thong Tu for complete compliance picture

### Challenges
- Regulations change frequently; index freshness is critical
- A single compliance question may span 5-10 different legal documents
- Need to distinguish current vs superseded provisions
- Effective dates matter: some provisions have future effective dates

## 5. Legal Precedent Search

Vietnam follows a civil law system (not common law), but precedent is gaining importance:

- **An Le** (Precedent Cases): Supreme Court publishes selected precedent cases since 2016
- ~70 published precedent cases to date; growing annually
- Court judgments from provincial and appellate courts are increasingly available
- RAG can help find relevant precedent: "Find cases about breach of land use rights contracts"

## 6. Legal Terminology Challenges

### Vietnamese Legal Language
- Highly formal, archaic phrasing distinct from modern Vietnamese
- Many Sino-Vietnamese compound terms: "dan su" (civil), "hinh su" (criminal), "to tung" (procedure)
- Same word different context: "hop dong" (contract) vs "hop dong lao dong" (labor contract)
- Abbreviations: BLDS (Bo Luat Dan Su), BLHS (Bo Luat Hinh Su), LTTTM (Luat Thuong Mai)

### Embedding Considerations
- Legal Vietnamese may require fine-tuned embeddings (general models miss legal nuances)
- Legal synonym mapping: "nguoi lao dong" = "cong nhan" = "nhan vien" in different contexts
- Cross-reference entity linking: "Nghi Dinh 123" should link to full document metadata

## 7. Market Size and Opportunity

### Vietnam Legal Tech Market
- Estimated market size: $30-50M (2025), growing 25-30% annually
- ~15,000 licensed lawyers in Vietnam; 5,000+ law firms
- 800,000+ businesses need regulatory compliance support
- Key segments: contract management, compliance monitoring, legal research, litigation support

### Competitive Landscape
- TVPL and LuatVietnam dominate basic legal search
- No strong RAG-based legal search product in Vietnam yet (as of early 2026)
- International players (Westlaw, LexisNexis) have minimal Vietnam presence
- Opportunity: Build Vietnamese-first legal RAG that understands document hierarchy

### Revenue Models
- SaaS subscription: $50-200/month per lawyer seat
- API access for enterprise compliance systems
- White-label search for legal publishers
- Freemium with basic search free, AI-powered features paid

## 8. Recommendations

1. Legal search is the highest-value B12 use case in Vietnam due to fragmented databases and high professional time cost
2. Chunk legal documents at the Article (Dieu) level with full metadata preservation
3. Track document amendment chains — users need to know if a provision is still in force
4. Legal Vietnamese requires domain-specific fine-tuning of embedding models
5. Freshness is critical: new Nghi Dinh and Thong Tu must be indexed within 24 hours of publication
6. Build citation linking: RAG answers must reference specific Dieu/Khoan/Diem with document numbers
7. Start with regulatory compliance search for businesses — larger addressable market than lawyer tools
8. Partner with TVPL or LuatVietnam for document corpus rather than building from scratch
