# R-PM Delivery Notes — I04 Manufacturing
**MAESTRO Knowledge Graph Platform**
**Role:** R-PM (Project Manager / Delivery Lead)
**Industry Module:** I04 — Manufacturing
**Date:** 2026-04-03
**Status:** Active Reference Document
**Reference:** I06/R-PM-notes.md is the baseline for lifecycle phases, team structure, and pricing taxonomy. I13/R-PM-notes.md documents OT/IoT hardware risk patterns. This document records what is MATERIALLY DIFFERENT for Manufacturing. Read I06 and I13 first; read this document for manufacturing-specific adaptations.

---

## Key Structural Differences vs. I06 and I13

Manufacturing AI is the most operationally constrained of the three modules:

- **I06 (Logistics):** Pure software integration into ERP/TMS/WMS. The factory floor is not involved. Data is in software systems. No hardware procurement. Sales cycle driven by COO/IT.
- **I13 (Transport):** Adds IoT hardware (OBD-II dongles, cameras on vehicles) but the assets move. Integration is telematics-level, not industrial control-level.
- **I04 (Manufacturing):** The AI system must interface with industrial control infrastructure — PLCs, SCADA, MES — operating 24/7 in a safety-critical environment. A misconfigured integration can stop a production line. The OT (Operational Technology) team is a veto power that neither logistics nor transport AI projects encounter.

The three defining differences:
1. **OT/IT boundary** — Manufacturing is the only module where the AI system must cross from the IT network into the OT/control network. This is a governance, security, and often a physical network separation problem.
2. **Hardware in the loop** — Visual inspection cameras and vibration sensors are fixed to production equipment, subject to factory floor conditions (heat, vibration, dust, electromagnetic interference). Hardware failure = AI failure.
3. **Defect annotation bottleneck** — Visual AI requires thousands of labeled defect images. Unlike logistics (data in ERP) or fleet telematics (data in OBD-II), manufacturing defect data often exists only as physical reject bins, not labeled datasets.

---

## 1. AI Project Complexity by Manufacturing Use Case

### 1.1 Complexity Rating Summary

| Use Case | MAESTRO Baseline | Complexity Rating | Primary Complexity Driver |
|---|---|---|---|
| Visual Quality Inspection | B03 (Computer Vision) | **6/10 — Medium** | Hardware procurement, annotation effort, line integration |
| Predictive Maintenance | B05/B07 (Anomaly + Process) | **7/10 — Medium-High** | Sensor installation, OT/IT integration, maintenance team change management |
| Production Scheduling | B06/B09 (Predictive + Optimization) | **8/10 — High** | ERP integration, planner buy-in, dynamic rescheduling requirements |

---

### 1.2 Visual Quality Inspection (B03) — Complexity 6/10

**Why 6, not higher:**
Visual QC is the most self-contained factory AI use case. The camera system can be physically isolated from the PLC/SCADA network — it does not need to send control signals back to the line (in a basic PoC). Data flows one way: camera → edge compute → alert/dashboard. This avoids the OT/IT crossing entirely in phase 1.

**Complexity drivers:**

| Driver | Detail |
|---|---|
| Hardware procurement | Industrial cameras, lighting rigs, edge compute (NVIDIA Jetson or equivalent). Lead time 2–6 weeks. On-site installation requires line stoppage window. |
| Annotation effort | This is the primary underestimate. A defect detection model needs 500–2,000+ labeled defect images per defect class. New factories typically have < 100 labeled defect images. Annotation sprint is required before training can start. |
| Integration with line | Basic PoC: alert only (camera + dashboard). Advanced: trigger automatic reject mechanism via PLC output. The latter crosses the OT boundary and adds 4–8 weeks of IT/OT negotiation. Recommend keeping PoC at alert-only. |
| Environment | Factory floor conditions. Vibration, heat, and cleaning chemicals degrade camera mounts and lens clarity. Lighting consistency is critical — changes in ambient light or production shift change lighting conditions cause model drift. |
| False alarm rate | A single false positive that stops a production line for 10 minutes is immediately visible. Tolerance for false alarms is near zero on high-throughput lines. This forces conservative recall/precision tuning before line integration. |

**I06/I13 contrast:** Neither logistics nor transport AI has an annotation bottleneck of this type. Logistics uses ERP history; fleet telematics uses sensor streams. Manufacturing visual QC requires human-labeled images of physical defects that often do not yet exist as a digital dataset.

---

### 1.3 Predictive Maintenance (B05/B07) — Complexity 7/10

**Why 7:**
PdM requires physical sensor installation on running equipment (often difficult to stop for sensor fitting), sensor data to flow through the OT network to the AI platform, and the maintenance team to trust and act on AI alerts. All three steps are contentious.

**Complexity drivers:**

| Driver | Detail |
|---|---|
| Sensor installation | Vibration sensors, thermal cameras, or current clamps must be physically installed on machinery — often during scheduled downtime. If the machine runs 24/7 (common in steel, chemicals, food processing), installation windows are rare (2–4 per year). Scheduling the installation window is itself a project management task. |
| OT/IT integration | Sensor data must travel from the PLC/SCADA level to the AI analytics platform. This crosses the OT/IT boundary. See Section 3 for full analysis. Timeline: 2–4 months of negotiation and configuration in typical Vietnam factory deployments. |
| Change management with maintenance team | The maintenance team has years of reactive repair experience. "The machine tells me when it breaks — I fix it." AI alerts that predict failure 2 weeks ahead require the team to plan maintenance proactively, reorder parts in advance, and schedule downtime they currently do not plan. This is a behavioral change, not a technical one. Resistance is the norm, not the exception. |
| Labeled failure data | Supervised failure prediction models need historical failure event records matched to sensor readings. Many Vietnam factories have maintenance logs in paper ledgers or informal Excel. Digitizing this backlog is a data engineering task unique to PdM — not present in logistics or transport AI (which use digital event logs). |
| Alert fatigue | If the model generates too many alerts (false positives), maintenance staff will ignore them within 2–3 weeks. Threshold calibration and alert volume management is a critical PM deliverable during pilot phase. |

**I06/I13 contrast:** I13 transport PdM (cold chain reefer, OBD-II vehicles) involves physical hardware but assets are mobile and the OT boundary does not exist. Industrial PdM involves stationary equipment embedded in a controlled production network with cybersecurity policies that specifically restrict external connections.

---

### 1.4 Production Scheduling (B06/B09) — Complexity 8/10

**Why 8 — the highest of the three:**
Scheduling AI sits at the intersection of the most sensitive business workflows: ERP (IT system of record), MES (shop floor control), and the production planner (a senior, experienced employee who has personal authority over the schedule). All three must be aligned simultaneously.

**Complexity drivers:**

| Driver | Detail |
|---|---|
| ERP integration | AI scheduling requires real-time visibility into work orders, material availability, machine capacity, and delivery commitments — all in the ERP. API access to SAP/Oracle ERP is technically complex and politically sensitive (IT team controls access; finance team owns the data). Vietnamese domestic ERPs (FAST, MISA) have limited API capability — often require custom extract. |
| Planner buy-in | The production planner is the most important stakeholder after the factory director. The planner controls the sequence of production. If the planner does not trust the AI schedule, they will manually override every recommendation, and the AI has zero impact. Planner resistance is the #1 cause of scheduling AI project failure in manufacturing. |
| Dynamic rescheduling requirements | A static AI schedule generated overnight is insufficient for most factories. The real value is real-time replan when: a machine breaks down, a material delivery is late, a rush order arrives, or a quality hold disrupts the plan. Building real-time replan requires live data from MES/shop floor — this requires a deeper and more real-time data integration than demand forecasting in logistics. |
| MES integration | If the factory has a Manufacturing Execution System (MES), the AI schedule must interface with it. MES integration is typically the most complex IT integration in a manufacturing project — MES vendors use proprietary interfaces and often charge for integration API access. |
| Constraint complexity | Production scheduling constraints are factory-specific: machine changeover times, tooling availability, operator certifications, clean-room requirements, customer priority rules, minimum lot sizes. Every factory is different. The constraint mapping exercise alone is 3–4 person-weeks at discovery. |

**I06 contrast:** I06 logistics demand forecasting is complex but the data (ERP sales history) is a read-only extract — it does not need to write back to the ERP or integrate with a real-time shop floor control system. Manufacturing scheduling is a read-write integration that changes operational behavior in real time.

---

### 1.5 Fastest Win for a First Engagement with a Vietnam Manufacturer

**Recommendation: Visual QC pilot on one production line (B03)**

**Rationale:**

| Factor | Visual QC | Predictive Maintenance | Production Scheduling |
|---|---|---|---|
| Time to first demo | 4–6 weeks (camera + demo model) | 10–14 weeks (sensor install + data collection + model) | 12–16 weeks (ERP access + constraint mapping + model) |
| IT/OT crossing required | No (alert-only mode) | Yes (sensor data from OT to IT) | Yes (ERP integration + MES access) |
| ROI visibility | Immediate — defect rate metric is measured every shift | Medium — first predicted failure event may take 2–4 months | Delayed — schedule adherence improvement measured over weeks/months |
| Demo impact | High — a camera catching a defect live is visceral and compelling to any factory director | Low-medium — a maintenance alert is not visible until a failure event occurs | Low — a better schedule is abstract; ROI takes months to manifest |
| Buy-in stakeholder | Quality Manager (operational, close to the problem) | Maintenance Manager (operational but conservative) | Production Planner + Factory Director (senior, highly risk-averse) |
| Annotation risk | Yes — annotation bottleneck is real; budget 3–4 weeks | No | No |

**Visual QC wins fastest because the demo is visible.** A camera catching a defect on a moving production line — in real time, on a screen in the factory director's office — is the most compelling AI demonstration available in manufacturing. No other manufacturing AI use case demos this well in a 60-minute factory visit.

**Recommended pilot scope:** One production line, one defect type (e.g., surface scratch, label misalignment, color deviation), one shift. Do not attempt full-factory QC coverage in the first engagement. Contain scope aggressively to guarantee success.

---

## 2. Effort Estimation by Use Case

### 2.1 Visual QC MVP (B03) — Estimated 22–32 Person-Weeks

**Scope:** Detect one to three defect classes on one production line. Alert-only mode (no PLC integration). Camera + edge compute + dashboard.

| Phase | Tasks | Effort |
|---|---|---|
| Discovery | Line selection, defect taxonomy definition, existing reject rate baseline, camera placement assessment | 2–3 PW |
| Hardware Procurement & Installation | Camera specification, lighting rig, edge compute (NVIDIA Jetson or industrial PC), on-site installation during line stoppage | 3–4 PW |
| Data Collection & Annotation | Capture 1,000–3,000 images (good + defect), annotation tool setup, labeling sprint (requires factory QC staff participation) | 5–7 PW |
| Model Development | Defect classification model (CNN or edge learning), threshold calibration, false positive rate tuning | 4–6 PW |
| Integration & Dashboard | Alert API, production dashboard (defect rate trend, shift comparison), optional Zalo/email alert | 3–4 PW |
| Testing & Validation | On-line testing over 2 production weeks, comparison vs. manual inspection reject rate | 2–3 PW |
| Deployment & Handover | Documentation, operator training, retraining plan for new product types | 2 PW |
| PM | Planning, stakeholder reporting, risk management | 1–2 PW |

**Key Milestones:**
- Week 3: Hardware installed, camera stream live
- Week 6: 1,000 labeled images ready; baseline model trained
- Week 9: Model at < 5% false positive rate on validation set
- Week 12: Live on production line, defect rate dashboard operational
- Week 18–20: MVP accepted; comparison vs. manual baseline delivered

**Annotation is the critical path.** If the factory cannot provide QC staff time for labeling (typically 1–2 people, 2 hours/day for 3 weeks), the model training schedule slips. Address this in the project charter.

**Hardware cost (separate from labor):** USD 3,000–15,000 per camera station depending on camera type, lighting, and edge compute. This is a client-funded capital item, not an effort cost. Clarify ownership in contract.

---

### 2.2 Predictive Maintenance MVP (B05/B07) — Estimated 24–36 Person-Weeks

**Scope:** Monitor 3–5 critical machines using vibration and/or temperature sensors. Predict anomalous behavior. Alert maintenance team before failure. Dashboard for equipment health status.

| Phase | Tasks | Effort |
|---|---|---|
| Discovery | Machine criticality ranking, sensor type selection, existing maintenance log audit, OT network assessment | 3–4 PW |
| Data Access Sprint (Phase 0 — see Section 3) | IT/OT negotiation, network architecture agreement, data pipeline design approval | 3–5 PW |
| Sensor Installation | Physical sensor mounting, cable routing or wireless gateway setup, PLC data tap (if applicable), data flow verification | 4–6 PW |
| Data Engineering | Sensor stream ingestion, time-series feature engineering, maintenance event log digitization and ETL | 5–6 PW |
| Model Development | Anomaly detection baseline (Isolation Forest, Autoencoder), RUL regression (XGBoost on engineered features), threshold calibration | 5–7 PW |
| Alert & Dashboard | Maintenance alert API, equipment health dashboard, Zalo/SMS notification for maintenance team | 3–4 PW |
| Testing & Validation | 4-week monitoring window, maintenance team feedback, false alert rate tuning | 2–3 PW |
| Deployment & MLOps | Weekly automated retraining, alert suppression rules, monitoring | 2–3 PW |
| PM | Planning, OT/IT liaison, stakeholder management | 2 PW |

**Key Milestones:**
- Week 4: Data Access Sprint complete; IT/OT pipeline approved
- Week 7: Sensors installed; clean data flowing to analytics platform
- Week 12: Baseline anomaly model live on sensor stream
- Week 18: First proactive maintenance alert issued and validated by maintenance team
- Week 24–28: MVP accepted; first maintenance event intercepted before failure

**The hardware installation phase is the most underestimated phase in PdM projects.** In Vietnamese factories, sensor installation typically requires:
- Written approval from the OT/maintenance manager (not just the factory director)
- A line stoppage window (may require waiting 4–8 weeks for the next scheduled maintenance window)
- An on-site technician from the sensor hardware vendor (lead time 1–3 weeks)
- Cable routing approval from the factory safety officer

Budget this explicitly. Do not assume "we install the sensors in week 1."

**% effort reuse from I06/I13:** The anomaly detection engine architecture, MLOps pipeline, and dashboard backend from I06 B07 (Anomaly Detection) or I13 Fleet PdM are directly reusable (30–40% effort reduction on infrastructure). The primary new investment is sensor integration (OT-specific), factory maintenance domain features, and the Data Access Sprint.

---

### 2.3 Production Scheduling MVP (B06/B09) — Estimated 28–40 Person-Weeks

**Scope:** AI-assisted daily production schedule for one factory / one product family. ERP integration for work orders and material availability. Schedule recommendation dashboard for planner review and override. No real-time MES integration in MVP.

| Phase | Tasks | Effort |
|---|---|---|
| Discovery | Constraint mapping workshop, planner interview series, ERP data audit, KPI baseline (OTD, WIP level, schedule adherence) | 4–5 PW |
| ERP Integration | API access negotiation, work order and BOM extraction, material availability feed, capacity master data capture | 6–8 PW |
| Data Engineering | Historical schedule data ETL, constraint encoding, machine capacity normalization, demand forecast input | 4–5 PW |
| Algorithm Development | Constraint-based scheduler (OR-Tools or custom heuristic), scenario simulation, override tracking | 7–9 PW |
| Planner Interface | Schedule recommendation dashboard, drag-and-drop override capability, KPI impact preview | 4–5 PW |
| Testing & Validation | 4-week shadow scheduling (AI schedule vs. planner schedule side-by-side), OTD comparison, planner feedback incorporation | 3–4 PW |
| Deployment | Production deployment, planner training, override logging for model improvement | 2–3 PW |
| PM | Planning, stakeholder management (IT + planner + factory director), reporting | 2 PW |

**Key Milestones:**
- Week 4: Constraint mapping complete and signed off by planner
- Week 8: ERP data pipeline delivering clean work orders and material availability daily
- Week 14: Scheduler producing valid schedules for test dataset
- Week 20: Shadow scheduling phase: AI schedule vs. manual — target 15%+ OTD improvement
- Week 28–32: Production deployment with planner-approved override workflow

**ERP integration is the long pole.** In Vietnam manufacturing projects, ERP access negotiations typically take 4–6 weeks even after project kick-off. Common blockers:
- SAP consultant who manages ERP is external, not employed by the factory — requires separate commercial engagement
- ERP data quality: BOM data, routing data, and machine capacity data are often wrong or outdated in Vietnamese domestic ERP systems
- IT team has never exposed ERP data via API — no existing integration middleware

Plan a dedicated ERP data sprint (2 weeks) in the first month of the project. If ERP API access is not confirmed by week 3, escalate immediately to the factory director — this is a project stopper.

**% effort reuse from I06/I13:** The demand forecasting infrastructure from I06 B01 and the optimization framework from I06 B06 (Route Optimization) are partially reusable — OR-Tools solver patterns and MLOps pipeline apply. Estimated 20–25% effort reduction on infrastructure. The manufacturing-specific constraint model (changeover, tooling, operator skills) is entirely new build.

---

## 3. OT/IT Integration Complexity

### 3.1 Why This Is the #1 Risk in Manufacturing AI

In logistics AI (I06), all data lives in IT systems (ERP, TMS, WMS). In transport AI (I13), telematics data comes from mobile assets via cellular networks. Neither involves a separation between IT and OT networks.

In manufacturing, the factory floor runs on an **Operational Technology (OT) network** — a separate, often air-gapped or firewalled network that controls physical production equipment. This network:

- Runs PLCs, SCADA systems, and MES on industrial protocols (OPC-UA, Modbus, Profinet, EtherNet/IP)
- Is managed by the **maintenance and production team**, not the IT team
- Is designed for **reliability and determinism**, not connectivity and data sharing
- Has **no tolerance for network latency, security vulnerabilities, or software updates** that could affect machine availability
- Is often managed by the **OEM of the machine** (Siemens, Fanuc, Mitsubishi) under warranty conditions that restrict third-party modifications

To feed AI analytics platforms, sensor and machine data must cross from the OT network to the IT/cloud network. This crossing is technically straightforward (OPC-UA gateway, MQTT broker) but organizationally very difficult because:

1. The OT team controls the OT network and does not report to IT
2. IT cybersecurity policy treats the OT network as a protected zone
3. Factory directors do not want external connectivity to machines for fear of cyberattack (Stuxnet-era concern remains real in industrial settings)
4. Machine OEM warranties may be voided by third-party connections
5. If the data connection causes any production disruption, the AI vendor bears the blame

**This is not a technical problem. It is a governance and trust problem.**

---

### 3.2 Typical Timeline for Getting PLC Data into a Cloud Pipeline

Based on industry benchmarks and Vietnam manufacturing context:

| Step | Activity | Typical Duration |
|---|---|---|
| 1 | Initial OT/IT assessment — map existing network architecture, PLC types, protocols | 1–2 weeks |
| 2 | Stakeholder alignment — factory director, IT manager, OT/maintenance manager sign off on data access scope | 2–4 weeks |
| 3 | Cybersecurity review — IT security team reviews data flow design, approves network zone crossing | 2–4 weeks |
| 4 | OEM consultation — check warranty conditions for PLC data tap; obtain OEM clearance or workaround design | 1–3 weeks |
| 5 | Gateway procurement and configuration — OPC-UA server or MQTT broker installation, edge device setup | 2–3 weeks |
| 6 | Network configuration — VLAN setup, firewall rules, DMZ architecture for data extraction | 1–2 weeks |
| 7 | Data flow testing — validate that sensor data reaches cloud platform correctly, no packet loss | 1–2 weeks |
| 8 | Security sign-off and go-live approval | 1–2 weeks |

**Total: 2–4 months, with 3 months being the most common outcome in Vietnam manufacturing engagements.**

The range compresses to 2 months when: the factory has a progressive IT manager, existing OPC-UA infrastructure, and a factory director who sets a clear deadline. It expands beyond 4 months when: the OT team is resistant, the OEM warranty is unclear, or the factory has multiple legacy PLC types requiring different gateways.

**Vietnam-specific accelerants:**
- Factories that have participated in Samsung's Smart Factory Cooperation Project already have OPC-UA gateways and internal OT/IT protocols — these can cut integration timeline to 3–4 weeks
- FDI factories (Samsung Tier 1 suppliers, LG suppliers) have global IT governance that is more structured — faster to navigate than ad-hoc domestic setups
- Newer factories (post-2018) more likely to have OPC-UA-compatible PLCs

---

### 3.3 Structuring a "Data Access Sprint" as Phase 0

The Data Access Sprint is a dedicated phase before model development begins — its sole purpose is to establish a stable, approved data pipeline from the factory floor to the analytics platform. No AI model work starts until the Sprint is complete.

**Why Phase 0, not part of Discovery:**
Discovery identifies what data is needed. The Data Access Sprint actually secures it. These are different activities requiring different stakeholders and different deliverables. Combining them into one phase creates a dangerous false assumption — that because discovery confirmed data exists, it will be available when model development starts.

**Phase 0 Structure (3–5 weeks):**

| Week | Activity | Owner | Output |
|---|---|---|---|
| Week 1 | OT network architecture mapping — with OT team, document PLC types, protocols, existing historian | Data Engineer + OT Lead | Network diagram, protocol inventory |
| Week 1–2 | Data access scope agreement — exactly which tags/sensors are in scope; what data can leave the OT network | PM + Factory Director | Signed data scope document |
| Week 2–3 | Cybersecurity design review — proposed data flow architecture reviewed by IT security | IT Manager + PM | Approved architecture document |
| Week 3–4 | Gateway installation and configuration — OPC-UA or MQTT setup, edge device deployment | Data Engineer + OT Technician | Live data stream to staging environment |
| Week 4–5 | Data quality validation — verify data completeness, timestamp accuracy, engineering units, sampling rate | Data Engineer | Data quality report |
| Week 5 | Phase 0 sign-off — factory director, IT manager, OT manager confirm pipeline is live and approved | PM | Phase 0 completion certificate |

**Phase 0 Go/No-Go Gate:**
- Minimum 14 days of clean, continuous sensor data in the analytics platform
- Data completeness > 90% (< 10% missing readings)
- IT/OT approval documented in writing
- Model development team confirms data is suitable for the defined use case

**If Phase 0 fails (data cannot be secured within 5 weeks):** Do not proceed to model development. Reframe the engagement as a Visual QC project (which does not require OT crossing) or pause the project until the factory resolves the OT access barrier.

---

### 3.4 Change Management: OT Team vs. IT Team — Who Owns the AI Project?

**The classic conflict:**

| Dimension | OT Team (Maintenance / Production) | IT Team |
|---|---|---|
| Primary concern | Production uptime — nothing must stop the line | Data security — the OT network must not be compromised |
| View of AI | "More sensors = more things that can fail" | "More connections = more attack surface" |
| Change tolerance | Very low — changes to production equipment require formal change control | Low — network changes require security review |
| Who controls the data | OT team controls PLC/SCADA access | IT team controls network access and data residency |
| Who benefits from AI | OT team (maintenance cost reduction, uptime improvement) | IT team does not directly benefit |

**Resolution model:**
Neither team should own the AI project alone. The effective governance structure is:

```
Factory Director (executive sponsor — the only person with authority over both OT and IT)
        |
AI Project Steering Committee
        ├── OT Lead (Maintenance Manager) — approves sensor scope, installation, alert logic
        ├── IT Manager — approves network architecture, data residency, cybersecurity
        └── AI Vendor PM — accountable for delivery, manages interface between OT and IT
```

The Factory Director must be engaged as executive sponsor from Day 1. Without top-down authority, OT/IT conflicts will deadlock the project.

**Practical tactics for Vietnam manufacturing clients:**
- Hold a joint OT/IT kick-off session in week 1 — get both teams in the same room with the factory director present
- Assign a "plant AI champion" — ideally a senior maintenance engineer who is enthusiastic about technology; this person becomes the internal advocate in the OT team
- Never present AI as "IT team's project" to the OT team — position it as the maintenance team gaining a new tool, not an IT tool being imposed on them
- Provide the OT team with a "no-blame" escape valve: "If the sensor data connection causes any production issue, we disconnect it immediately — your line comes first"

---

## 4. Go-to-Market for Manufacturing AI

### 4.1 Entry Point — Which Use Case Closes Fastest

**Visual QC closes fastest.** It is the only manufacturing AI use case where the demo and the first deployment are essentially the same activity. A camera on a production line showing a defect in real time is a complete proof of concept.

| Use Case | Typical Sales Cycle (Factory Decision) | Primary Buyer | Demo Power |
|---|---|---|---|
| Visual QC (B03) | 4–8 weeks to pilot approval | Quality Manager / Factory Director | Very high — live defect detection is visceral |
| Predictive Maintenance (B05/B07) | 8–16 weeks to pilot approval | Maintenance Manager / Factory Director | Low — no visible event during demo; must rely on historical examples |
| Production Scheduling (B06/B09) | 12–24 weeks to pilot approval | Factory Director / COO | Very low — abstract benefit; planner political dynamics extend cycle |

**Why Visual QC closes faster in Vietnam specifically:**
- Quality rejection rates from export customers (Samsung's Tier 1 suppliers, Nike/Adidas footwear factories) are immediate business pain — a quality hold can delay shipment and trigger contractual penalties
- Every factory director knows their defect rate; it is measured every shift
- The investment is physically visible — hardware on the line, not software in a server room
- Export compliance pressure (ISO 9001, SA8000 audits) creates a "due diligence" motivation even before ROI is calculated

---

### 4.2 Pricing Models for Manufacturing AI

Manufacturing AI pricing differs from logistics (per-shipment, per-user) and transport (per-vehicle/month). The factory is a fixed physical asset, so pricing anchors to the production unit.

**Model A: Per-Camera / Per-Station SaaS (Visual QC)**
- Monthly SaaS fee per camera station
- Vietnam factory pricing range: USD 200–600/camera/month for software license + model hosting
- Add hardware amortization if you own the camera hardware: USD 50–150/camera/month over 3-year depreciation
- Total per-camera range: USD 250–750/camera/month all-in
- Advantage: scalable (add cameras = add revenue); client sees incremental cost vs. QC labor saving
- Upsell path: basic defect detection → multi-defect classification → defect analytics → predictive quality

**Model B: Per-Machine / Per-Month SaaS (Predictive Maintenance)**
- Monthly SaaS fee per monitored machine
- Vietnam factory pricing range: USD 150–500/machine/month depending on sensor complexity and alert sophistication
- Include hardware in initial PoC (client-funded capital) and charge software separately
- Advantage: recurring revenue anchored to the machine count; factories do not decommission machines
- Note: Frame as "cheaper than one unplanned downtime event per year" — a single unplanned stop on a high-utilization line costs USD 5,000–50,000+ in lost production

**Model C: Project-Based (Production Scheduling)**
- AI scheduling is harder to price as SaaS because it is deeply integrated with ERP and requires ongoing constraint updates
- Recommended model: Implementation project fee (USD 30,000–100,000 depending on factory size and ERP complexity) + annual SaaS license (USD 15,000–40,000/year for platform access + model hosting)
- Outcome-linked pricing is possible if OTD baseline is documented: gain-share on schedule adherence improvement
- Vietnam domestic manufacturers are price-sensitive — anchor at USD 30,000 implementation + USD 1,500/month SaaS for a single-factory MVP

**Model D: Outcome-Based / ROI-Linked (All Use Cases)**
- Refer to I06/R-PM-notes.md Section 6.1 for full taxonomy
- In manufacturing, the most credible outcome metric is: defect rate reduction (QC), unplanned downtime reduction (PdM), or OTD improvement (scheduling)
- Use only when baseline KPIs are documented at contract signature
- Structure: fixed implementation fee + 20–30% of measured annual savings, capped at 2× fixed fee
- Vietnam manufacturer caution: most domestic factories do not have documented baselines — outcome pricing requires an additional 2–3 weeks of baseline measurement at project start

---

### 4.3 Proof of Concept Structure for Factory AI

Factory AI PoC structure is fundamentally different from logistics AI PoC because it has a physical on-site requirement.

**Key difference from I06/I13:** You cannot run a manufacturing AI PoC remotely. The camera must be on the line. The sensor must be on the machine. On-site presence is mandatory.

**Recommended PoC Structure:**

| Element | Recommendation |
|---|---|
| Duration | 6–8 weeks (shorter than I06's 4–8 week PoC because scope is more physically constrained) |
| Scope | One production line, one defect type (for Visual QC) OR three machines, one sensor type (for PdM) |
| On-site requirement | AI engineer + data engineer on-site for hardware installation week (1 week); remote monitoring thereafter; on-site return for final demo week |
| Data requirement | For Visual QC: 2 weeks on-site camera capture + annotation before model training. For PdM: 4 weeks sensor data collection before anomaly model calibration. |
| Pilot line selection | Choose a line with: (a) documented quality problems, (b) cooperative line supervisor, (c) physical space for camera installation, (d) regular production schedule (not a seasonal/intermittent line). Never pick the factory's most critical line for the first PoC — pick a "safe" line where a pause for hardware installation will not cause crisis. |
| PoC fee | VND 150–300 million (approximately USD 6,000–12,000) as a paid PoC to establish commercial seriousness. Include hardware rental in this fee. |
| Success criteria | Define contractually before start: defect detection accuracy > 95%, false positive rate < 3%, dashboard showing shift-level defect trend. Not subjective. |

---

### 4.4 How to Demo to a Factory Director vs. Quality Manager vs. IT Manager

**Factory Director:**
- **Primary concern:** Production uptime and revenue impact. They think in VND/shift.
- **Demo approach:** Lead with cost of current defect rate in VND/month (use their numbers if available). Show one live defect being detected — keep it to 2 minutes. Then jump to the financial slide: "At your current throughput, a 30% defect reduction saves you approximately [X] VND/month."
- **Language:** Business outcomes only. Do not show model accuracy metrics — say "catches 97 defects in every 100" not "F1 score 0.97."
- **Time:** 20 minutes maximum. They will leave early if it is longer.
- **Key question to answer:** "Can this run without stopping my line?" Answer: yes, camera-only mode, line never stops.

**Quality Manager:**
- **Primary concern:** Defect escape rate, customer complaints, and the personal pain of manual inspection. The Quality Manager's team is doing 8 hours of manual visual inspection per shift — they know the problem intimately.
- **Demo approach:** Show the detection of a defect type that their team commonly misses. Show the defect image gallery — annotated, classified, trended by shift. Ask them: "What percentage of defects do your inspectors catch on the night shift?" Then show how the camera does not get tired.
- **Language:** QC metrics — defect per million opportunities (DPMO), false escape rate, inspection coverage.
- **Time:** 45 minutes; they will engage deeply on defect taxonomy. Allow Q&A time.
- **Key question to answer:** "How do we handle new defect types?" Answer: we add them to the model — show the annotation workflow.

**IT Manager:**
- **Primary concern:** Integration complexity, data security, who maintains the system, and whether it will cause problems on the production network.
- **Demo approach:** Do not show the AI demo at all. Show the architecture diagram: camera → edge compute → cloud analytics. Emphasize: the system does not touch the PLC network in phase 1. Show the data residency: all data stored on [cloud provider] in [Singapore/Vietnam region]. Show the security model: one-way data flow, no external access to factory network.
- **Language:** Technical — network architecture, data residency, security protocols, SLA, incident response.
- **Time:** 30–45 minutes; expect detailed technical questions.
- **Key question to answer:** "What happens if your system causes a network issue?" Answer: edge compute is isolated; if it fails, the production line is unaffected. Show the failsafe architecture.

**Practical note for Vietnam:** Factory decisions in Vietnam are made by the Factory Director. The Quality Manager is the champion. The IT Manager is the gatekeeper who can block or delay. Always secure the Factory Director's interest first — the IT Manager is much easier to work with if the Factory Director has already committed.

---

## 5. Smartlog Manufacturing Extension

### 5.1 Extending Smartlog's Logistics AI Platform into Factory Clients

Smartlog's existing client base includes Baconco (fertilizer manufacturer) and PTSC (oil & gas services/manufacturing). Both are industrial clients, not pure logistics clients — the manufacturing extension is an organic expansion of existing relationships.

**Baconco — Manufacturing AI Extension:**
- Current Smartlog use: logistics/distribution tracking for fertilizer delivery
- Manufacturing extension opportunity:
  - **Batch production tracking:** Connect production batch records to outbound logistics — when a batch is released from QC, automatically trigger logistics planning for that batch's dispatch
  - **Quality inspection (B03):** Granule size uniformity and coating inspection for fertilizer pellets — a visual inspection use case with clear product quality ROI (export rejection risk)
  - **Process optimization (B09):** Yield optimization per batch (raw material to finished product ratio) — reducible by 3–5% with AI process parameter tuning
  - **Emissions monitoring (B05):** Continuous monitoring of ammonia/NOx emissions under Decree 08/2022 — compliance-driven AI with mandatory regulatory pressure

**PTSC — Manufacturing AI Extension:**
- Current Smartlog use: likely supply chain and procurement tracking
- Manufacturing extension opportunity:
  - **Predictive maintenance (B05/B07):** PTSC operates offshore platforms and heavy manufacturing equipment. Equipment failure is extremely high cost (offshore downtime = USD 100,000+/day). PdM ROI is the clearest case in Vietnam manufacturing.
  - **Inspection documentation AI (B01):** PTSC performs routine inspections of industrial equipment and offshore structures — mandatory for HSE compliance. AI-assisted inspection report generation from sensor data and visual inputs reduces documentation time by 40–60%.
  - **Digital twin for offshore structures (B13):** Longer-term play — PTSC's offshore platform maintenance could benefit from digital twin simulation for maintenance planning and structural integrity assessment.

**Transition path for Smartlog:**
```
Existing: Logistics AI (demand forecasting, route optimization, document extraction)
        ↓
Step 1: Add factory data integration (production batch → logistics handoff)
        ↓
Step 2: Sell Visual QC or PdM as a factory add-on to existing industrial clients
        ↓
Step 3: Build "Factory-to-Delivery" integrated product (Section 5.2)
```

---

### 5.2 Factory-to-Delivery AI: Integrating Production Scheduling with Outbound Logistics Forecast

This is the unique value proposition that neither a pure logistics AI vendor nor a pure manufacturing AI vendor can offer — only a platform that spans both.

**The problem it solves:**
A fertilizer manufacturer (Baconco example) produces in batches. The logistics team is planning delivery schedules based on a demand forecast. But the production schedule is managed separately — in the factory's ERP, by the production planner, without visibility into the logistics demand signal. The result:
- Production completes a batch for Market A while Market B has urgent demand
- Logistics team is waiting for a batch that production delayed due to raw material shortage — but logistics was not notified
- Outbound logistics fleet is sized for average throughput, not actual production completion schedule

**Integrated AI architecture:**

```
Production Scheduling AI (B09)
    → Production completion forecast: "Batch X will be ready Wednesday, not Tuesday"
            ↓
Logistics Demand Forecast AI (B06/I06)
    → Updated delivery schedule: reroute fleet for Wednesday dispatch
            ↓
Route Optimization AI (B06/I06)
    → Optimized delivery routes based on confirmed batch availability
            ↓
Outbound Fleet Management (I13)
    → Driver assignments, vehicle dispatch, ETA prediction
```

**Business value:**
- Reduce "waiting at the factory gate" — trucks dispatched only when batch is confirmed ready
- Reduce stockout at distribution point — production completion visibility allows pre-positioning of transport before batch is released
- Reduce expediting cost — logistics team stops chartering emergency trucks because they now have 48–72 hour production visibility

**Why this is a MAESTRO competitive advantage:**
No current Vietnamese SaaS vendor offers this integrated factory-to-delivery signal. It requires deep integration with both manufacturing (ERP/MES data) and logistics (TMS/route optimization). Smartlog has the logistics half. The manufacturing extension adds the factory half. The integration layer is the proprietary value.

---

### 5.3 Revenue Model for Manufacturing AI Add-on to Logistics Platform

**Recommended commercial structure:**

| Tier | Product Scope | Monthly Price |
|---|---|---|
| Smartlog Core (existing) | Demand forecasting, document AI, route optimization for logistics | Existing pricing |
| Factory Connect | Production batch → logistics handoff integration only (API + dashboard) | +USD 500–1,000/month per factory connected |
| Factory QC Module | Visual QC for 1–3 camera stations on one production line | +USD 600–1,800/month (per camera pricing) |
| Factory PdM Module | Predictive maintenance for 3–10 machines | +USD 900–3,000/month |
| Factory Intelligence Suite | Full factory AI (QC + PdM + scheduling + factory-to-delivery integration) | Custom, USD 3,000–8,000/month |

**Revenue expansion model (Baconco example):**
- Year 1: Factory Connect + Visual QC (2 cameras) = +USD 1,700/month = +USD 20,400 ARR on existing client
- Year 2: Add PdM (5 machines) = +USD 2,000/month = +USD 24,000 incremental ARR
- Year 3: Factory Intelligence Suite upgrade = +USD 5,000/month = +USD 60,000 ARR

**Net expansion revenue from two existing industrial clients (Baconco + PTSC), assuming both convert to Factory Intelligence Suite by Year 3:**
Approximately USD 120,000–180,000 ARR incremental from manufacturing modules, on top of existing logistics contract value.

---

## 6. Quick Wins (Distinct from I06/I13)

The I06 quick wins (Demand Forecasting, Document Extraction, Route Optimization) and I13 quick wins (Driver Behavior Scoring, Cold Chain PdM, EV Charging Forecast) are logistics and transport-specific. The three manufacturing quick wins below target different buyers, different data types, and different OT contexts.

---

### MFG-QW1 — Visual QC Pilot on One Production Line (Fastest Path to Factory AI)

**Why this wins:**
- Fastest time-to-demo: 4–6 weeks from camera installation to live detection
- Lowest IT/OT complexity: alert-only mode, no OT network crossing required
- Clearest ROI: defect rate is measured every shift — before/after comparison is immediate

**Target factories:** Export-oriented manufacturers with active quality pressure — electronics assembly suppliers, footwear T1 suppliers, food processors with export certification requirements (ISO 22000, HACCP). These factories have the most acute pain (export rejection penalties) and the fastest approval cycles.

**Recommended scope:**
- One production line
- One defect class (e.g., surface scratch, label misalignment, color deviation — pick the highest-frequency defect type)
- Alert-only mode (no PLC integration)
- 2-week annotation sprint with factory QC staff
- 6-week total PoC

**ROI profile:**
- Labor: 1–2 fewer manual inspectors per shift = VND 8–15 million/month saved
- Defect escape reduction: 30–50% reduction in customer returns/complaints — hard to quantify until pilot, but significant for export-oriented clients
- Speed: manual inspection is a bottleneck for many high-throughput lines; camera inspection is inline and continuous
- Payback: 6–12 months at typical Vietnam factory scale

**Annotation bottleneck mitigation:**
Use synthetic defect image generation (Generative AI / B14) to augment the real defect dataset. Requires only 50–100 real defect images; GAN or diffusion-based augmentation can produce 500–2,000 labeled synthetic examples. This compresses the annotation sprint from 3–4 weeks to 1–2 weeks. This is a manufacturing-specific technique not used in I06 or I13.

---

### MFG-QW2 — Predictive Maintenance for 3–5 Critical Machines (PTSC / Industrial Clients)

**Why this wins:**
- For industrial clients (PTSC, Hoa Phat-type heavy industry), the cost of one unplanned equipment failure justifies the entire annual PdM subscription
- No annotation required — PdM uses unsupervised anomaly detection on sensor streams; labeled failure events are beneficial but not required for an initial baseline model
- Clear ROI narrative: "Your last unplanned downtime on Machine X cost you VND Y. Our system would have detected the anomaly 3 weeks before failure."

**Target machines for first pilot:** Select the 3–5 machines with highest downtime cost and most accessible sensor data (machines that already have a historian or OPC-UA output). Do NOT start with the most critical safety-critical machine — start with a high-cost but non-safety-critical machine to build trust before expanding.

**Entry point for PTSC:** Position as HSE compliance enhancement — predictive maintenance alerts reduce the risk of sudden equipment failure that could cause safety incidents. PTSC's HSE obligations (IOGP standards, international operator requirements) create a compelling compliance driver.

---

### MFG-QW3 — Production Batch Completion Alert (Fastest Factory-to-Logistics Integration)

**This is the manufacturing quick win with zero OT/IT complexity.**

**What it is:** A lightweight alert system that notifies the logistics team when a production batch passes QC and is released for dispatch. Not full production scheduling AI — just a reliable, automated signal that replaces the current process ("QC manager calls the logistics coordinator on Zalo").

**Why this wins:**
- No AI model required — it is a workflow integration (ERP QC release status → webhook → Smartlog logistics platform)
- No OT network crossing — reads from the ERP quality module, not the factory floor
- Immediate value: logistics team stops waiting for ad-hoc Zalo messages; dispatch planning starts automatically when batch is released
- Bridge to full factory AI: once the ERP integration is live, it is the foundation for more sophisticated production scheduling and demand forecasting integration

**Time to deploy:** 3–4 weeks (pure integration sprint, no model development)
**Who signs off:** Factory IT Manager (ERP access) + Logistics Manager. No Factory Director required for this scope.
**Revenue:** Included in "Factory Connect" tier (USD 500–1,000/month) — positions Smartlog as the integration layer, justifying future manufacturing module upsell.

---

## 7. Risk Register — Manufacturing-Specific

The I06 risk register (Section 5, 10 risks) covers general AI delivery risks that apply to manufacturing. The following risks are manufacturing-specific or materially higher severity in manufacturing than in logistics or transport.

---

### MFG-R01 — OT/IT Integration Delays

| Attribute | Detail |
|---|---|
| Risk | Data access from PLC/SCADA delayed or blocked by OT/IT governance dispute, cybersecurity concern, or OEM warranty restriction |
| Probability | **High** — this is the most common cause of manufacturing AI project delays in Vietnam |
| Impact | **High** — no sensor data = no model; entire project timeline shifts |
| Mitigation | Conduct Data Access Sprint as a standalone Phase 0 before any model development starts. Include explicit language in the project charter: "Phase 0 is a prerequisite for Phase 1; if Phase 0 cannot be completed within 5 weeks, the project scope will be reframed." Escalate to Factory Director if IT/OT conflict deadlocks in week 3. For initial engagements, default to Visual QC (no OT crossing) to avoid this risk entirely. |
| I06/I13 contrast | I06 logistics: ERP data access can be delayed but is an IT-to-IT negotiation — no OT team involved. I13 transport: OBD-II data comes from mobile assets via cellular — no factory network. Manufacturing is the only module where the OT/IT structural conflict exists. |

---

### MFG-R02 — Defect Annotation Bottleneck

| Attribute | Detail |
|---|---|
| Risk | Insufficient labeled defect images to train the visual inspection model; factory has < 100 labeled defect samples; annotation takes longer than planned because QC staff are not available |
| Probability | **High** — in 80%+ of first-time Visual QC engagements in Vietnam, the factory does not have a labeled defect dataset |
| Impact | **High** — without 500+ labeled defect images per class, model training cannot start; project enters a waiting state |
| Mitigation | (1) Budget a dedicated annotation sprint in project plan: 3–4 weeks with 1–2 QC staff committed 2 hours/day. This commitment must be in the project agreement, not assumed. (2) Use synthetic image generation (GAN augmentation) to amplify limited real defect samples — requires only 50–100 real defects to train a synthetic generator. (3) Consider hiring a temporary annotation contractor (readily available in Vietnam via TopDev/Upwork) — 500 images can be annotated in 1 week at low cost (USD 200–500). (4) Use edge learning models (Cognex ViDi, NVIDIA TAO) that require as few as 5–10 samples per class for initial training. |
| Vietnam context | Most domestic Vietnamese factories track defect rates as aggregate percentages — they do NOT store photos of individual defects. The photos must be captured from the production line as part of the PoC setup. This is a data collection exercise, not a data retrieval exercise. |

---

### MFG-R03 — False Alarm Rate Causing Production Line Stops

| Attribute | Detail |
|---|---|
| Risk | Visual QC model generates false positive alerts (good parts flagged as defective). If the system is integrated with an automatic reject mechanism, false positives cause good parts to be rejected — reducing yield and potentially stopping the line for investigation. |
| Probability | **Medium-High** — false positives are inevitable in early model iterations; tuning precision/recall takes 2–4 weeks of production data |
| Impact | **Critical** — a production line stop caused by AI has immediate business impact (lost throughput) and causes immediate trust loss with the factory director and line supervisor. Trust loss from one false alarm incident can terminate the project. |
| Mitigation | (1) **NEVER integrate with automatic reject mechanism in the PoC phase.** Alert-only mode only — the camera flags a defect, a human confirms, a human rejects. Only after 4+ weeks of < 2% false positive rate demonstrated in alert-only mode should PLC integration be proposed. (2) Set precision-first thresholds: tune the model to prioritize false negative reduction (missing a real defect) over false positive reduction in early deployment — factories tolerate missed defects more than they tolerate good-part rejection. (3) Define the "false alarm SLA" in the project charter: if false positive rate exceeds X% in any production shift, the system automatically reverts to alert-only mode. (4) Include the line supervisor in weekly model review sessions — their feedback on "false calls" is the most valuable tuning signal available. |

---

### MFG-R04 — Factory Floor Environment: Hardware Failure

| Attribute | Detail |
|---|---|
| Risk | Camera hardware, edge compute, or sensor equipment fails due to factory floor conditions: vibration, heat, dust, humidity, chemical exposure, electromagnetic interference from high-power equipment |
| Probability | **Medium** — Vietnam factories (especially food processing, chemicals, heavy industry) have challenging environments; consumer-grade hardware fails within 1–3 months |
| Impact | **Medium** — hardware failure halts the AI system; if the client paid for the system, hardware failure is a trust and commercial issue |
| Mitigation | (1) Specify industrial-grade hardware from the start: cameras rated IP65+ (dust/water resistant), edge compute in ventilated industrial enclosures, sensors with vibration-resistant mounting. Industrial-grade components cost 2–3× consumer grade but last 5–10× longer. (2) Include hardware maintenance SLA in the contract: 48-hour replacement response for critical components. Maintain 1 spare camera and 1 spare edge compute unit on-site during the first year. (3) Conduct a site environment assessment during Discovery: measure ambient temperature, vibration levels, and IP rating requirements before specifying hardware. (4) For chemical environments (Baconco fertilizer plant): specify cameras with chemical-resistant housings and sealed cable glands. (5) Plan monthly hardware inspection visits during the first 3 months of production deployment. |
| I06/I13 contrast | I06 logistics: no hardware in the delivery scope. I13 transport: OBD-II dongles in vehicle engine bays face heat and vibration but are consumer-grade devices designed for that environment. Manufacturing cameras and sensors face far more extreme and varied conditions than vehicle-mounted hardware. |

---

### MFG-R05 — Maintenance Team Resistance to Predictive Alerts

| Attribute | Detail |
|---|---|
| Risk | The maintenance team receives AI-generated maintenance alerts but chooses to ignore them, citing experience, distrust of the AI, or workload. If a predicted failure then occurs and the team had received an alert, the AI system gets blamed regardless. If the team acts on a false alert and no failure occurs, they conclude the AI is crying wolf. |
| Probability | **High** — behavioral resistance to AI-generated maintenance recommendations is near-universal in the first 4–8 weeks of deployment in Vietnam manufacturing |
| Impact | **High** — if the maintenance team does not act on alerts, the AI has zero business impact regardless of model accuracy |
| Mitigation | (1) Involve the maintenance team lead in defining the alert logic during the model development phase — they must co-author the rules they will act on. (2) Start with advisory alerts only: "Machine X shows unusual vibration signature — recommend inspection at next scheduled maintenance." Not: "Machine X will fail in 3 days — stop it now." (3) Run a 4-week "shadow mode" before live alerts: show the maintenance team historical predictions vs. actual failures. Let them see the model was right before they have to act on it live. (4) Celebrate the first successful prediction publicly within the factory — when the AI correctly predicts a failure 2 weeks before it would have occurred, make sure the factory director knows. This is the social proof event that converts skeptics. (5) Assign a "maintenance AI champion" — the most technically curious person on the maintenance team. Give them access to the model dashboard and make them responsible for reporting alert outcomes. |

---

## Appendix A — Phase Gate Adaptations for Manufacturing

| Phase | I06 Benchmark | I04 Manufacturing Adaptation |
|---|---|---|
| Discovery | 3–6 weeks; COO/IT stakeholders | 3–5 weeks; add Factory Director + OT Lead + Quality Manager; include on-site factory walk; add environment assessment for hardware spec |
| Phase 0 (Data Access Sprint) | Not applicable in I06 | 3–5 weeks; mandatory for PdM and Scheduling; not required for Visual QC alert-only mode |
| Proof of Concept | 4–8 weeks; model accuracy threshold | Add hardware installation window (1–2 weeks on-site); add annotation sprint for Visual QC (3–4 weeks); PoC total: 6–10 weeks |
| Pilot | 8–16 weeks; single system integration | Add line supervisor in weekly review; include false alarm tuning period (weeks 1–4 of pilot); add maintenance team change management for PdM |
| Production | 8–12 weeks | Add hardware reliability testing at 30/60/90 days; add OT network stability monitoring; MLOps includes model retraining for new product types (Visual QC) or seasonal equipment wear patterns (PdM) |
| Scale | 3–6 months/wave | Expand by production line (Visual QC) or machine class (PdM); each expansion requires a mini Data Access Sprint for the new line/machine group |

---

## Appendix B — Team Additions vs. I06 Core Team

The I06 core team (Data Engineer + ML Engineer + Domain Expert + Backend Developer + DevOps + PM) applies. Manufacturing adds:

| Role | Scope | FTE | Not in I06/I13? |
|---|---|---|---|
| Computer Vision Engineer | Camera feed processing, defect classification model, annotation pipeline | 1.0 FTE | New role (not needed in logistics or fleet AI) |
| IoT / OT Integration Engineer | OPC-UA/MQTT gateway setup, PLC data tap, sensor hardware commissioning | 0.5–1.0 FTE | Partially in I13 (OBD-II); manufacturing OT integration is more complex |
| Manufacturing Domain Expert | Production process knowledge, defect taxonomy, scheduling constraints | 0.5 FTE | Replace logistics domain expert; equivalent role, different domain |
| Hardware Technician (on-site) | Camera installation, sensor mounting, cable routing | Contract, 1–2 weeks on-site | New; no hardware deployment in logistics AI |

**Vietnam talent note:** Computer Vision engineers with manufacturing experience are scarce in Vietnam. Most CV engineers have experience in consumer applications (face recognition, retail analytics), not industrial inspection. Budget 4–6 weeks to find and onboard a CV engineer with relevant experience, or plan to train a capable CV engineer on industrial inspection specifics during the PoC phase. Expect to pay a 20–30% premium over standard CV engineer rates for manufacturing experience.

---

## Appendix C — Manufacturing AI Glossary (for Client Communication)

| Term | Plain English Explanation |
|---|---|
| OT (Operational Technology) | The computer systems that control factory machines — PLCs, SCADA. Separate from the office IT network. |
| PLC (Programmable Logic Controller) | The computer brain inside a factory machine. Controls what the machine does and records what it is doing. |
| SCADA | The software dashboard that monitors many PLCs and machines across a factory. Like a control room for the whole production floor. |
| OPC-UA | The standard "language" that industrial machines use to share data with other systems. Like USB for factories. |
| MES (Manufacturing Execution System) | The software that tracks what is being produced on the shop floor in real time — work orders, quality holds, machine status. |
| Digital Twin | A virtual model of a machine or factory that is updated with real data. Used to simulate and predict behavior without touching the real machine. |
| RUL (Remaining Useful Life) | AI's estimate of how long a machine component will last before it needs replacement. |
| OEE (Overall Equipment Effectiveness) | A measure of how much of a factory's capacity is being used productively. 100% OEE = perfect; most factories run at 60–85%. |
| CAPA | Corrective Action / Preventive Action — the formal process for investigating a quality defect, fixing the root cause, and preventing recurrence. |
| DPMO (Defects Per Million Opportunities) | The standard quality metric. Lower is better. Six Sigma standard = 3.4 DPMO. |

---

*Document Owner: R-PM, MAESTRO Platform*
*Next Review: 2026-07-01*
*Related Documents: I04/research-report.md, I06/R-PM-notes.md, I13/R-PM-notes.md, B03/B05/B06/B07/B09 baseline reports*
