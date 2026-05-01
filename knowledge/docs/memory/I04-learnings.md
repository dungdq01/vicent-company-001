# Memory: I04 — Manufacturing
**Module:** Phase 2 — Industry I04  
**Completed:** 2026-04-03  
**Status:** Draft (depthLevel 2)  
**Agents:** R-α, R-β, R-γ, R-D04, R-DE, R-PM, R-σ

---

## Key Findings

### Market
- Vietnam manufacturing = ~24–25% of GDP; FDI to manufacturing: record USD 25.58B in 2024 (66.9% of all FDI)
- Electronics exports: USD 72.6B; Samsung 6 plants → USD 54.4B exports (~14% of Vietnam total)
- Intel HCMC: the largest Intel AT plant globally
- China+1 strategy: Vietnam is primary beneficiary — BUT US 46% tariff risk in 2025 may pause FDI capex
- Overall AI maturity: **L2** (FDI leaders at L3, domestic SMEs at L1)

### AI Maturity by Sub-Sector
| Sub-Sector | AI Maturity | Feasibility Score |
|-----------|-------------|-------------------|
| Electronics FDI suppliers | L2–L3 | 7.5/10 ✅ BEST ENTRY |
| Food processing | L2 | 6.5/10 |
| Automotive (THACO) | L2 | 5.5/10 |
| Textiles/Footwear | L1 | 5.5/10 |
| Domestic SME | L1 | 3.5/10 ❌ not ready |

### Top Priority Baselines (confirmed)
- **HIGH**: B03 (Computer Vision QC), B07 (Predictive Maintenance), B06 (Production Scheduling)
- **MEDIUM**: B01 (Forecasting), B15 (Digital Twin), B02 (Document Intelligence)
- **LOW**: B08, B11, B09

### Quick Wins (distinct from I06/I13)
1. **Visual QC pilot — 1 production line (B03)**: fastest demo, no OT/IT crossing required, 2.4–4.3 month payback, entry price USD 200–600/camera/month
2. **Predictive Maintenance — 3-5 critical machines (B07)**: target PTSC/Baconco specifically, 12–18 month payback, 24–36 PW effort
3. **Batch Completion Alert (B01 light)**: zero AI model dev, just MES→logistics signal, deployable 3–4 weeks — unique cross-module I04↔I06 bridge

### Vietnam-Specific Insights (R-D04 PRIMARY findings)
- **Data desert**: only ~500 factories with IIoT out of 70,000+ registered — vast majority are paper-based
- **Factory tier data readiness**: FDI full (8/10), FDI mid (5/10), domestic mid (2-3/10), SME (1/10)
- **FDI factories are OUT OF SCOPE**: Samsung/Intel use global AI platforms decided by HQ — target their **Tier 2 suppliers** instead (300+ suppliers around Samsung with no AI vendor serving them)
- **PLC landscape Vietnam**: Mitsubishi FX ~30%, Siemens S7 ~25%, Delta DVP ~25% — all need different connectors
- **OT/IT integration = #1 risk**: takes 2–4 months of negotiation before any data flows — must do "Data Access Sprint" as paid Phase 0
- **False alarm risk**: if AI causes unnecessary line stops → immediate trust loss, project cancelled — set conservative thresholds first
- **Vietnam-specific scheduling constraints**: power outages, overtime law, Tet surge, supplier delivery variability from local SME suppliers

### Key Regulatory Context
- **Decree 08/2022** (Environmental Protection Law): EPR requirements, EIA — AI opportunity for compliance monitoring (Baconco entry point)
- **ISO 9001:2026**: AI integration trajectory for quality management systems
- **REACH/RoHS**: compliance documentation AI for electronics exporters
- **PDPL 2025**: applies to employee-linked manufacturing data (biometric, performance monitoring)

### Competitive Landscape
- **Siemens/PTC/SAP**: non-addressable in FDI tier — they own it. Don't compete.
- **FPT Software**: MEDIUM-HIGH threat but services company, no pre-built baselines — MAESTRO 3x faster to deploy
- **Viettel**: partnership candidate for IIoT connectivity
- **Landing AI (Andrew Ng)**: benchmarked at 2.4-month payback for Vietnam electronics factory — price pressure reference
- **SME gap**: open — no affordable Vietnam-language manufacturing AI platform

### Smartlog-Specific Plays ⚡
**Baconco (fertilizer manufacturer):**
- Entry: Decree 08/2022 compliance monitoring (mandatory, non-discretionary spend)
- Step 2: Batch process predictive maintenance (rotary kilns, granulators)
- Step 3: Granule quality CV inspection
- Integration: Baconco production batch completion → Smartlog outbound logistics forecast

**PTSC (oil & gas services):**
- Entry: Inspection report automation (B01, zero infrastructure dependency)
- Step 2: PPE/safety CV monitoring (high ROI for offshore environment)
- Step 3: Heavy equipment predictive maintenance (6–12 month payback)
- Unique: PTSC not covered by GE APM or global platforms — open opportunity

**Revenue estimate**: USD 120–180K incremental ARR from Baconco + PTSC over 3 years (R-PM)

### Data Readiness: 3/10 overall (most factories are paper-based)
- Strengths: FDI factories have MES/ERP, high sensor data volume at modern facilities
- Critical gaps: paper-based QC records majority, PLC data in vendor silos, no unified data standard, shift handover gaps

---

## Implementation Roadmap

| Phase | Duration | Key Initiatives |
|-------|----------|----------------|
| Phase 1 | 0–6 tháng | Visual QC pilot (1 line), PdM 3-5 machines (Baconco/PTSC), Data Access Sprint |
| Phase 2 | 6–18 tháng | Production scheduling AI, expand QC to full factory, food safety compliance AI |
| Phase 3 | 18+ tháng | Digital twin (B15), autonomous quality loop, generative design (B09) |

**I06/I13 reuse**: 25–35% effort savings estimated. Shared components: PDPL compliance framework, Vietnamese-language AI stack, anomaly detection patterns (B07), MLOps pipeline.

---

## Files Produced

| File | Path |
|------|------|
| Research Report (EN) | docs/reports/I04/research-report.md |
| Tech Report (EN) | docs/reports/I04/tech-report.md |
| Feasibility Report (EN) | docs/reports/I04/feasibility-report.md |
| R-D04 Domain Notes (EN) | docs/reports/I04/R-D04-notes.md |
| R-DE Data Notes (EN) | docs/reports/I04/R-DE-notes.md |
| R-PM Delivery Notes (EN) | docs/reports/I04/R-PM-notes.md |
| Final Report (VI) | docs/reports/I04/final-report.md |
| Production JSON | data/industries/I04-manufacturing.json |

---

## Quality Gate Results

| Check | Result |
|-------|--------|
| JSON valid | ✅ |
| depthLevel == 2 | ✅ |
| painPoints >= 5 | ✅ (8) |
| regulations >= 3 | ✅ (6) |
| aiUseCases | ✅ (8) |
| dataReadiness + byTier | ✅ |
| implementationRoadmap | ✅ |
| smartlogOpportunity | ✅ (NEW field) |
| version == 2.0 | ✅ |

---

## Open Questions / Next Steps
- [ ] Primary research: OEE baselines for Vietnam domestic factories (no published data)
- [ ] Client data audit: Baconco equipment inventory + data availability assessment
- [ ] PTSC: confirm which assets NOT covered by GE APM
- [ ] Samsung Tier 2 supplier outreach: validate data readiness assumption
- [ ] Matrix nodes priority: B03-I04 (visual QC), B07-I04 (PdM), B06-I04 (scheduling)
- [ ] Consider I01 (Retail) next — completes demand-side of supply chain triad

---

*Memory by R-σ (Ms. Scribe) | MAESTRO Knowledge Graph Platform*
