# B06 Learnings — Optimization & Operations Research
Ngay: 2026-03-31

---

## Insights chinh (cho cac modules tuong lai)

### 1. Diem cao nhat (8.4/10) vi free tooling + structured data + VN logistics demand

B06 dat 8.4/10 — cao hon B01 (7.6), B04 (7.0), B05 (6.6). Ba yeu to cot loi:
- **Zero license cost**: OR-Tools (Apache), HiGHS (MIT), PuLP, OSRM — toan bo stack mien phi. So voi B01-B05 can GPU compute, B06 chay CPU thuan tuy.
- **Structured data, khong can training data**: Optimization chi can problem data (distances, capacities, time windows) DA TON TAI trong ERP/TMS/WMS. Khong co van de "data chicken-and-egg" nhu B05 (5/10 data availability). B06 data availability 8/10.
- **Thi truong VN logistics bung no**: 16-17% GDP la logistics cost (gap doi nuoc phat trien). 2.5 ty buu kien/nam. 4,000+ cong ty logistics. Demand thuc va do duoc.

**Pattern tai su dung**: Khi danh gia baselines tuong lai, xet free tooling + data readiness + market demand cung luc. B06 thang vi CA BA deu manh, khong chi mot.

### 2. Nhan tai OR la bottleneck — KHONG PHAI cong nghe

R-gamma nhan dinh chinh xac: "OR engineers are rare globally and nearly nonexistent in Vietnam." ML engineers KHONG the "pick up" OR — mathematical foundations (LP duality, branch-and-bound, Lagrangian relaxation) can nam dao tao. Day la bottleneck thuc su cua B06, khong phai solver hay infrastructure.

**Hanh dong**: HUST Applied Mathematics la nguon chinh. Vietnamese diaspora voi PhD OR o nuoc ngoai. Hoac: dao tao ML engineers co nen toan manh (dai so tuyen tinh, toi uu, ly thuyet do phuc tap).

**Pattern**: Tuong tu B04 Vietnamese NLP talent scarcity — moi module co "talent bottleneck" cu the. Can xac dinh som va co ke hoach tuyen dung/dao tao truoc khi build.

### 3. Dia chi VN (address geocoding) la thach thuc #1 ve du lieu

- "hem" (Nam), "ngo" (Bac), "kiet" (Trung) — 3 tu khac nhau cho "alley"
- So nha "12/3/5" = nha 5 trong hem 3 cua hem 12
- Geocoding accuracy 60-75% vs 95%+ nuoc phat trien
- Khong co postal code chuan duoc su dung rong rai

R-DE va R-D06 deu confirm: xay distance matrix cho dia chi VN chiem 60-70% effort trien khai. Solver la phan DE — data pipeline la noi projects song hay chet.

**Hanh dong**: Dau tu vao Vietnamese address normalization pipeline nhu competitive moat. Dung Goong/Map4D thay vi chi Google Geocoding.

**Pattern**: Data preprocessing dominates effort — giong B05 (event tracking la prerequisite) va B04 (Vietnamese text normalization). Moi module can "data readiness" la Section 1 cua feasibility.

### 4. Neural Combinatorial Optimization la overhyped cho VN scale

R-alpha danh nhieu phan cho Attention Model, POMO, diffusion models cho CO. R-gamma challenge dung: **irrelevant cho MAESTRO VN deployment 2-3 nam toi.**

- OR-Tools guided local search tot hon cho <10,000 nodes (99% use cases VN)
- Neural solvers gap 2-5% cho constrained VRP — khong chap nhan cho logistics thuc
- Chi kha thi khi can sub-second inference tren repeated similar instances

**Quy tac cung**: Khong invest vao NCO cho production VN cho den khi (a) client co >10,000 stops VA (b) can real-time (<1 giay) VA (c) exact solvers da fail. Giu nhu "research watch item."

**Pattern**: Tuong tu B05 "deep learning overkill cho VN scale" — moi module co "overhyped technology" ma R-alpha covers nhung R-gamma rightfully de-prioritizes. Standardize nay.

### 5. R-gamma challenges la tot nhat — tiep tuc format nay

R-gamma B06 co 7 challenges ro rang (3 cho R-alpha, 4 cho R-beta) voi specific evidence. Format: [Claim] → [Challenge] → [Evidence] → [Alternative]. Day la lan thu BA co format challenge xuat sac (B04, B05, B06).

**Chuan muc cho future modules**: Format nay la MANDATORY. Moi feasibility report PHAI co "Challenges to Layer 1" section voi format standardized nay.

### 6. Vietnam Simplified Stack pattern — da fix tu B05 learning

B05 learnings yeu cau: "R-beta CAN co Vietnam simplified stack tu dau." B06 tech report VAN chua co explicit staged stack — nhung final report (R-sigma) DA bo sung Stage 1/2/3 nhu chuan muc.

**Ket qua**: Stage 1 (2-3 nguoi, <$500/thang): OR-Tools + PuLP + FastAPI + cron. Stage 2: them OSRM + Redis + Celery + Prometheus. Stage 3: them Gurobi + Kafka + multi-tenant.

**Cho B07+**: Dispatch instruction cho R-beta PHAI yeu cau 2 variants: full stack + VN SME staged stack.

---

## Patterns tai su dung

### Pattern A: Optimization Stack 3 tang (tuong tu RecSys Stack B05)

```
Stage 1 (2-4 tuan, <$500/thang):
  OR-Tools + PuLP + FastAPI + cron
  Batch-only: CSV/Excel input, nightly route planning
  Khong can GPU. 1-2 CPU instances du.

Stage 2 (2-4 thang, $1,500-3,000/thang):
  Them OSRM (distance matrices) + Redis (warm-start, caching)
  + Celery (async solver) + Prometheus monitoring
  Near-real-time incremental. API integration voi TMS/WMS.

Stage 3 (4-8 thang, $5,000-10,000/thang):
  Them Gurobi (neu can) + Kafka (event-driven) + multi-tenant
  Real-time dynamic dispatch. Constraint DSL cho productization.
```

### Pattern B: Use Case Prioritization cho VN

```
P0 (bat dau ngay): Last-mile delivery route optimization (xe may)
P1 (sau pilot): Production scheduling, cutting stock, inventory, fleet
P2 (scale): Workforce scheduling, container loading, energy, network design
P3 (KHONG theo duoi): Ride-hailing dispatch, energy grid, university timetable
```

### Pattern C: Build vs Buy Decision cho Solvers

```
Moi bai toan → bat dau OR-Tools (mien phi)
OR-Tools khong du cho LP lon → them HiGHS (mien phi MIT)
HiGHS khong du cho MIP lon → benchmark Gurobi ($12K+/nam)
Client se tra license → Gurobi
Bai toan dac biet khong solver nao fit → custom metaheuristic (hiem)
Simple routing only → Google Route Optimization API (benchmark)
```

### Pattern D: Vietnamese Address Pipeline (reusable cho moi module co geospatial)

```
1. Raw address input (free text, khong chuan)
2. Address normalization: hem/ngo/kiet → standard, P./Q./TX. → full name
3. Administrative boundary matching (phuong/xa, quan/huyen, tinh/thanh pho)
4. Geocoding via Goong/Map4D (VN-specific)
5. Fallback: Google Geocoding cho failures
6. Manual override queue cho geocoding failures (target: <10%)
7. Verified location master voi GPS coordinates
```

---

## Dieu can lam khac di cho module tiep theo

1. **R-beta CAN co "Vietnam simplified stack" tu dau (lan thu TU).** Dispatch instruction PHAI yeu cau. Khong de R-sigma phai bo sung.

2. **Data preprocessing effort estimation la Section 1 cua feasibility.** B06 cho thay 60-70% effort la data prep. R-gamma nen lead voi "thuc te bao nhieu effort la data, bao nhieu la model?"

3. **Regulatory nen o exec summary neu relevant.** B06 co transportation regulations (Decree 10/2020), labor law (Law 45/2019), data privacy (Decree 13/2023) — R-gamma dat o Section 9. Can lift regulatory flags len som hon.

4. **"Overhyped tech" section nen la standard output cua R-gamma.** B06: NCO overhyped. B05: DL RecSys overhyped cho VN scale. B04: LLM NLP overhyped cho VN data. Pattern ro rang — standardize nhu section rieng.

5. **Cross-baseline connections can specificity.** B06 → B01 (predict-then-optimize) la concrete va actionable. B06 → B03 (vision for inspection) con mo. Can cu the: input/output/API contract giua baselines.

---

## Phat hien quan trong cho thi truong Viet Nam

### Khoang trong thi truong lon nhat: Mid-tier 3PL (500-50,000 goi/ngay)

~200+ cong ty 3PL VN o quy mo nay chua co optimization technology. Qua lon cho manual dispatch, qua nhay gia cho Gurobi/Quintiq, qua phuc tap cho Routific. MAESTRO nham dung khoang trong nay voi OR-Tools + Vietnamese address handling + motorbike VRP.

### Cutting stock (det may) la fastest ROI trong manufacturing

Vai chiem 60-70% chi phi san xuat may mac. Waste 15-20%. Giam 3-5% waste = tiet kiem 6-10 ty VND/nam cho nha may trung binh. Payback 1-2 THANG. Day la "quick win" de xay credibility trong manufacturing.

### COD (Cash-on-Delivery) tao constraint VRP dac biet VN

60-70% giao dich VN la COD. Driver mang tien mat → can diem gui tien giua tuyen (security limit), failed delivery can re-optimization, COD reconciliation them complexity. Khong co global VRP solution nao address dieu nay — VN-specific differentiator.

### Willingness to pay van la au hoi

R-gamma canh bao dung: "Vietnamese companies prefer hiring more dispatchers over licensing software." Dinh gia theo ROI chung minh la con duong duy nhat. Khong ban "software" — ban "tiet kiem."

---

## Ghi chu ve hieu suat agents — B06

**Dieu hoat dong tot:**
- R-gamma B06 la report feasibility tot nhat portfolio (tiep tuc tu B04, B05): 7 challenges cu the, build-vs-buy chi tiet, risk register 10 items, regulatory comprehensive. Diem 8.4 duoc justify tot.
- R-DE: Vietnamese address challenges duoc cover sau — gia tri cao cho bat ky module nao co geospatial.
- R-D06 (Logistics): Motorbike VRP, COD constraints, multi-depot VN — VN-specific insights ma khong agent nao khac co.
- R-D04 (Manufacturing): Cutting stock ROI cuc nhanh (1-2 thang payback) — insight business quan trong.
- R-SA: Reference architectures (last-mile, scheduling), TCO comparison, migration path — actionable.
- R-BE: Async solver architecture, multi-tenant, error handling (IIS analysis) — production-ready design.

**Can dieu chinh:**
- R-beta van thieu explicit "Vietnam simplified stack" (lan thu 4 — PHAI fix cho B07)
- R-alpha regulatory section van o cuoi — pattern lap lai tu B04, B05
- R-MLE overlap voi R-alpha Section 5 (neural CO) — can clearer scope delineation
- R-DO Vietnamese deployment section can chi tiet hon (specific VN cloud providers, pricing)

---

*Ghi chu nay duoc tong hop boi Ms. Scribe (R-sigma), Chief Knowledge Officer. Module B06 Optimization & Operations Research. Diem: 8.4/10 — cao nhat portfolio MAESTRO. Ngay: 2026-03-31.*
