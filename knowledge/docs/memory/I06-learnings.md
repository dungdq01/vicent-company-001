# Memory: I06 — Logistics & Supply Chain
**Module:** Phase 2 — Industry I06  
**Completed:** 2026-04-03  
**Status:** Draft (depthLevel 2)  
**Agents:** R-α, R-β, R-γ, R-D06, R-DE, R-PM, R-σ

---

## Key Findings

### Market
- Vietnam logistics market: ~$80.65B (2024) → ~$150B (2034), CAGR 6.4%
- Logistics cost = 16–17% of GDP vs. 11.6% global avg — primary AI ROI driver
- SEA market: $211.5B (2024) → $349B (2033)
- AI logistics market globally: $20.1B (2024), 25.9% CAGR

### AI Maturity in Vietnam Logistics
- Global leaders (DHL, Maersk, Flexport): L3–L4
- Regional players (GHN, J&T, BEST): L2
- Vietnam mid-market 3PLs (Smartlog's clients): **L1** — pilot stage, data foundation gaps
- Overall industry scored: **L2** (growing, not yet mature)

### Top Priority Baselines (confirmed by research)
- **HIGH**: B01 (Forecasting), B02 (Document Intelligence), B06 (Optimization)
- **MEDIUM**: B07 (Anomaly Detection), B08 (Conversational AI), B12 (Search & RAG)
- **LOW**: B11 (Knowledge Graph), B13 (Tabular ML), B03 (Computer Vision)

### Quick Wins (Confirmed by R-γ + R-D06 + R-PM)
1. **Document AI (B02)** — Best quick win: 3–6 month payback, 150–300% year-1 ROI, lowest data dependency. Target: BOL/customs declaration OCR. Entry: Smartlog's existing Phú Mỹ/Baconco document workflows.
2. **Demand Forecasting (B01)** — 6–9 month payback, 15–35% MAPE improvement. Vietnam-specific: Tet seasonality, TikTok double-day peaks. Feature set well-defined.
3. **Route Optimization (B06)** — 8–18% fuel savings in Vietnam context (vs 15–25% globally — discounted for fleet size and road conditions). Requires clean GPS data first.

### Vietnam-Specific Insights (R-D06 PRIMARY findings)
- COD (Cash on Delivery) still ~50–70% of e-commerce volume — adds stop-duration premium to VRPTW models
- Address quality: no standardized postal codes in many areas — VN province/district/ward hierarchy + geocoding fallback needed
- Tet holiday creates data anomalies: 5–7 day shutdown + 3-4x volume spike before Tet — must be handled explicitly in ML features
- Data reality gap: Vietnam 3PLs think they have clean data — they don't. GPS gaps, manual override timestamps, missing return leg data are common.
- Budget window: October–December is the window for AI budget approvals in logistics companies

### Regulatory Flags (R-γ)
- **PDPL 2025** (effective Jan 1, 2026, supersedes Decree 13/2023): automated processing rules, PII consent — requires legal assessment for last-mile AI
- **Thông tư 121/2025**: e-transport documents, digital signature requirement — creates opportunity for B02
- **EU CBAM**: carbon border adjustment starting 2026 — ESG tracking use case for export logistics clients

### Competitive Threat
- **Project44** expanded China-Vietnam cross-border lane (April 2025) — HIGH threat for cross-border visibility
- Smartlog competitive moat: Vietnamese-language AI, domestic micro-carrier network visibility, industrial B2B 3PL at SME-accessible pricing

### Data Readiness Score: 4/10
- Strengths: GPS tracking, TMS transactional data, high shipment volumes
- Critical gaps: address normalization, unified data lake, document digitization, return leg data

---

## Implementation Roadmap

| Phase | Duration | Key Initiatives |
|-------|----------|----------------|
| Phase 1 | 0–6 months | Document AI MVP, Route Optimization upgrade, Demand Forecast pilot |
| Phase 2 | 6–18 months | Productize wins, Vietnamese AI Copilot (B08), PTSC predictive maintenance |
| Phase 3 | 18+ months | Agentic procurement (B10), Digital Twin (B15), ESG carbon tracking |

---

## Files Produced

| File | Path |
|------|------|
| Research Report (EN) | docs/reports/I06/research-report.md |
| Tech Report (EN) | docs/reports/I06/tech-report.md |
| Feasibility Report (EN) | docs/reports/I06/feasibility-report.md |
| R-D06 Domain Notes (EN) | docs/reports/I06/R-D06-notes.md |
| R-DE Data Notes (EN) | docs/reports/I06/R-DE-notes.md |
| R-PM Delivery Notes (EN) | docs/reports/I06/R-PM-notes.md |
| Final Report (VI) | docs/reports/I06/final-report.md |
| Production JSON | data/industries/I06-logistics.json |

---

## Quality Gate Results

| Check | Result |
|-------|--------|
| JSON valid (parseable) | ✅ |
| depthLevel == 2 | ✅ |
| painPoints >= 5 | ✅ (8) |
| regulations >= 3 | ✅ (6) |
| aiUseCases populated | ✅ (8) |
| dataReadiness populated | ✅ |
| implementationRoadmap | ✅ |
| metadata.version == 2.0 | ✅ |

---

## Open Questions / Next Steps

- [ ] Legal review: PDPL 2025 compliance requirements for logistics AI (automated processing of driver/customer PII)
- [ ] Client data audit: Run data quality assessment with Smartlog clients before B01 forecast pilot
- [ ] Matrix nodes: B01-I06, B02-I06, B06-I06 are highest priority for Phase 3
- [ ] Re-research trigger: if any baseline score < 7.0 after quality gate → Workflow D

---

*Memory by R-σ (Ms. Scribe) | MAESTRO Knowledge Graph Platform*

---

## Appendix: Additional Learnings from PRJ-SCP-001 (2026-04-09)

### A1. DRP/MRP Netting — APICS Standard Patterns

**Core Formula — Projected Available Balance (PAB):**

```
PAB(t) = PAB(t-1) + Scheduled_Receipts(t) + Planned_Receipts(t) - Gross_Demand(t)

If PAB(t) < Safety_Stock:
    Net_Requirement = SS - PAB(t) + Gross_Demand(t) - Scheduled_Receipts(t)
    Planned_Order = apply_lot_sizing(Net_Requirement)
    Planned_Receipt(t + lead_time) = Planned_Order
```

**Lot Sizing Rules:**

| Rule | Description | Best For |
|---|---|---|
| **L4L (Lot-for-Lot)** | Order exactly the net requirement | High-value items, short shelf-life, A-class items |
| **FOQ (Fixed Order Quantity)** | Round up to nearest fixed lot size (e.g., pallet qty) | Items with minimum order qty from supplier or production batch size |
| **POQ (Periodic Order Quantity)** | Accumulate demand over N periods into one order | Items with high setup/ordering cost, C-class items |

**BOM Explosion:**
- Single-level BOM: each finished good maps to components with a quantity-per ratio
- Multi-level BOM: recursive explosion (parent -> child -> grandchild). Must detect circular references (max depth guard, typically 10 levels)
- **Practical note:** Phase 1 implementations should start with single-level BOM. Multi-level adds significant complexity (lead time offset per level, lot sizing at each level)

**Time-Phased Horizon:**
- **Frozen zone** (typically 0-2 weeks): no automatic changes allowed; planner must manually approve any modification
- **Slushy zone** (2-8 weeks): system can suggest changes but requires planner confirmation
- **Free zone** (8+ weeks): system can auto-generate planned orders
- Horizon length varies by industry: FMCG (12-16 weeks), building materials (16-26 weeks), agriculture (26-52 weeks due to crop cycles)

---

### A2. RTM Sourcing Priority — Vietnam Distribution Patterns

**5-Level Distribution Pattern (common in Vietnamese FMCG/agriculture/building materials):**

| Priority | Source Type | Description | When Used |
|---|---|---|---|
| P1 | **Direct Warehouse** | Nearest warehouse to customer, owned/operated by company | Default first choice; lowest cost, fastest lead time |
| P2 | **Regional DC** | Regional distribution center serving multiple provinces | P1 stock insufficient; covers regional demand pooling |
| P3 | **Central DC / Factory WH** | National-level warehouse or factory-adjacent storage | Regional stock depleted; longer lead time but larger stock |
| P4 | **Partner / Cross-dock** | Third-party logistics partner or cross-docking facility | Network extension without owned infrastructure; common for remote provinces |
| P5 | **Factory Direct** | Ship directly from production line | Emergency fulfillment; highest cost, longest lead time; used when all warehouse stock exhausted |

**Key design considerations for RTM engines:**
- **Priority cascade:** Try P1 first; if insufficient stock, cascade to P2, then P3, etc. Do NOT skip levels unless explicitly configured
- **Split shipment policy:** Some customers accept split shipments (fulfilled from multiple sources); others require single-source. This is a per-customer configuration
- **Cost cap:** Even if P4/P5 can fulfill, the landed cost may exceed margin. Include a cost-cap check to flag uneconomical allocations
- **Vietnam-specific:** The NM (Nha May / Factory) -> DC (Distribution Center) -> CN (Chi Nhanh / Branch) hierarchy is the dominant pattern across FMCG, agriculture, and building materials. Branch networks can be large (20+ branches for national distributors like UNIS)

**RTM Rule Volume:** For a mid-size Vietnamese distributor, expect 10K customers x 5K SKUs x 3-5 priority levels = 150M-250M rules. This table requires LIST partitioning by tenant_id and composite indexing on (customer_id, item_id, priority).

---

### A3. Vietnam ERP Integration Patterns

**ERP Landscape in Vietnamese Industry:**

| ERP | Common In | API Capability | Integration Method | Notes |
|---|---|---|---|---|
| **SAP S/4 HANA** | Multinationals (MDLZ, Unilever, P&G) | Strong (BAPI, OData, IDoc) | REST API or IDoc-to-Kafka | Well-documented; standard integration patterns apply |
| **Oracle EBS / Cloud** | Large Vietnamese enterprises (TTC Group) | Good (REST API, FBDI) | REST API with batch polling | Requires Oracle Integration Cloud or custom middleware |
| **Bravo** | Building materials, mid-market Vietnamese companies (UNIS) | **Limited** — no public API documentation, minimal REST endpoints | **Batch file** (CSV/Excel export, scheduled FTP/SFTP) | Budget 4-6 extra weeks for integration. May require custom stored procedures on Bravo side. Vietnamese-only documentation. |
| **FAST** | SME accounting, light manufacturing | Minimal API | Batch file or direct DB read (with vendor permission) | Not designed for integration; treat as data source only |
| **MISA** | SME accounting, retail | Basic REST API (recent versions) | REST API for newer versions; batch file for legacy | Improving but API coverage is partial |

**Critical Integration Patterns:**

1. **Idempotency Key:** Every write operation to/from ERP must include an idempotency key (UUID or composite key). Vietnamese ERP environments frequently have network instability, causing duplicate POST requests. Without idempotency, duplicate orders/receipts are created.

   ```
   POST /api/v1/purchase-orders
   Header: X-Idempotency-Key: {tenant_id}:{order_type}:{hash_of_content}
   
   Server: IF idempotency_key EXISTS in processed_requests → return cached response
           ELSE → process request, store idempotency_key with response, return response
   ```

2. **Batch File Integration (Bravo/FAST pattern):**
   ```
   Schedule: Daily at 02:00 ICT
   1. Bravo exports CSV to SFTP folder (configured by Bravo admin)
   2. SCP picks up file, validates schema (column count, data types, encoding UTF-8)
   3. Parse + normalize to canonical schema
   4. Entity resolution: match Bravo item codes to canonical item_id
      (Bravo uses internal codes that differ from label/barcode)
   5. Upsert to SCP database with conflict resolution (latest timestamp wins)
   6. Archive processed file, log result (rows processed, errors, warnings)
   7. Alert on: file missing, schema mismatch, >5% error rate
   ```

3. **Staggered Go-Live:** When integrating with multiple ERPs simultaneously, go live one tenant at a time. This reduces blast radius and allows the team to learn from each integration before the next. Recommended order: start with the tenant that has the best API (e.g., SAP), then Oracle, then batch-file ERPs (Bravo) last.

---

*Appendix added from PRJ-SCP-001 knowledge close-loop | 2026-04-09*
