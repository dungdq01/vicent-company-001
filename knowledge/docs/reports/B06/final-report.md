# Bao cao Tong hop: Optimization & Operations Research (B06)
## Boi Ms. Scribe (R-sigma) — Ngay: 2026-03-31

---

## Tom tat Dieu hanh

B06 Optimization & Operations Research dat **8.4/10** — diem cao nhat trong toan bo portfolio MAESTRO. Verdict: **CONDITIONAL GO**. Ba yeu to chinh tao nen diem so vuot troi nay:

1. **Tooling hoan toan mien phi**: OR-Tools (Apache 2.0) + HiGHS (MIT) + PuLP + OSRM bao phu 90% use cases ma khong can mot dong license. So voi B01-B05 deu can GPU/cloud compute dang ke, B06 chay tren CPU thuan tuy.

2. **Du lieu co cau truc, khong can training data**: Khac voi ML-heavy baselines (B01-B05) can hang trieu data points de train models, optimization chi can problem data — khoang cach, capacity, time windows, constraints — du lieu nay DA TON TAI trong moi ERP/TMS/WMS.

3. **Nhu cau thi truong Viet Nam cuc lon**: Chi phi logistics 16-17% GDP (gap doi nuoc phat trien). E-commerce 2.5 ty buu kien/nam. 8,000+ nha may san xuat trung va lon. Thi truong dang "khat" optimization.

Dieu kien GO: (1) it nhat 1 pilot client ky truoc khi build full, (2) tuyen toi thieu 1 ky su OR chuyen mon, (3) chap nhan 6 thang dau la custom consulting truoc khi productize.

---

## Phan 1: Tong hop Nghien cuu (R-alpha)

### 1.1 Phan loai linh vuc

Operations Research thuoc nhanh Toan ung dung, bao gom 14 sub-fields: Linear Programming, Integer Programming, Mixed-Integer Programming, Convex Optimization, Combinatorial Optimization, Metaheuristics (GA/SA/PSO/ACO/Tabu), Constraint Programming, Dynamic Programming, Stochastic Optimization, Robust Optimization, Multi-Objective Optimization, RL for Optimization, Bayesian Optimization, va Bilevel Optimization.

Cac linh vuc lien quan: Control Theory, Game Theory, Queueing Theory, Simulation, Decision Theory, Computational Complexity.

### 1.2 Cac khai niem cot loi (12 concepts)

| # | Khai niem | Mo ta | Do kho |
|---|-----------|-------|--------|
| 1 | Ham muc tieu & Rang buoc | min f(x) s.t. g_i(x) <= 0, h_j(x) = 0 — nen tang cua moi bai toan toi uu | Co ban |
| 2 | Vung kha thi & Dieu kien toi uu KKT | Tap nghiem hop le; KKT mo rong Lagrange multipliers cho constrained optimization | Trung binh |
| 3 | Quy hoach tuyen tinh & Simplex | Toi uu ham tuyen tinh voi rang buoc tuyen tinh; Simplex di qua dinh cua polyhedron | Co ban |
| 4 | Quy hoach nguyen & Branch-and-Bound | Bien nguyen (yes/no); LP relaxation cung cap bound; chia nhanh va cat tia | Trung binh |
| 5 | Toi uu loi & Gradient | Convex: moi cuc tri dia phuong la toan cuc; Interior Point O(n^1/2 log(1/eps)) | Trung binh |
| 6 | Toi uu to hop: TSP, VRP, Knapsack | TSP giai chinh xac den ~100K thanh pho (Concorde); VRP la workhorse logistics | Nang cao |
| 7 | Metaheuristics: GA, SA, PSO, ACO | Khong dam bao toi uu nhung cho loi giai chat luong cao khi exact methods khong scale | Trung binh |
| 8 | Constraint Programming (CP) | Tach biet mo hinh (khai bao) va solver (tim kiem + truyen ba); xuat sac cho scheduling | Nang cao |
| 9 | Dynamic Programming & Bellman | V(s) = max_a{R(s,a) + gamma*sum P(s'|s,a)V(s')} — nen tang DP va RL | Trung binh |
| 10 | Toi uu da muc tieu & Pareto | NSGA-II/III; Pareto frontier cho trade-offs (chi phi vs chat luong vs carbon) | Nang cao |
| 11 | Toi uu ngau nhien & Robust | Stochastic programming (scenarios), Robust (worst-case), DRO (ambiguity set) | Nang cao |
| 12 | RL cho Combinatorial Optimization | Attention Model, POMO; nhanh cho inference nhung chua thay the Gurobi/Concorde | Nang cao |

### 1.3 Tien tien nhat 2024-2026

- **Learning to Optimize**: GNN cho branching decisions (2-5x speedup), ML-guided cutting planes, algorithm configuration (SMAC/irace)
- **LLM cho Optimization**: OptiMUS dat 80%+ accuracy tren NLP4LP; Chain-of-Thought 2025 dat 90%+; nhung 10% sai la KHONG CHAP NHAN cho production
- **Neural Combinatorial Optimization**: POMO <0.1% gap TSP-100; LEHD/ELG ~1% gap TSP-10000; nhung chua thay the classical solvers cho instances can chung minh optimality
- **Quantum-inspired**: Chua thuc tien cho production (R-gamma da dung khi noi "noise" — dong y)

### 1.4 Catalog 15 algorithms

Simplex, Interior Point, Branch & Bound, Branch & Cut, Column Generation, GA, SA, PSO, ACO, Tabu Search, NSGA-II/III, Bayesian Optimization, Attention Model/POMO, OR-Tools suite, ADMM. Tat ca duoc ghi nhan voi complexity, maturity, va best-for trong research report.

---

## Phan 2: Tong hop Cong nghe (R-beta)

### 2.1 Tech stack theo layer

| Layer | Cong cu | Chi phi | Ghi chu |
|-------|---------|---------|---------|
| Solver LP/MIP | OR-Tools (GLOP + SCIP) | Mien phi | Default cho moi van de |
| Solver LP backup | HiGHS 2.0 | Mien phi | Manh cho LP lon, sparse |
| Solver MIP premium | Gurobi 12 | $12K+/nam | Chi khi OR-Tools khong du |
| CP/Scheduling | OR-Tools CP-SAT | Mien phi | Thong tri scheduling benchmarks |
| Routing | OR-Tools Routing Library | Mien phi | CVRP/VRPTW/PDPTW production-grade |
| Metaheuristic | DEAP | Mien phi | GA, PSO, ES linh hoat |
| Multi-Objective | pymoo | Mien phi | NSGA-II/III, MOEA/D |
| Modeling | PuLP | Mien phi | Solver-agnostic LP/MIP |
| Distance Matrix | OSRM | Mien phi | Self-hosted, Vietnam OSM data |
| API | FastAPI | Mien phi | Async-native, Pydantic validation |
| Task Queue | Celery + Redis | Mien phi | Async solver jobs |
| Monitoring | Prometheus + Grafana | Mien phi | Solve time, queue depth, gap |
| Experiment Tracking | MLflow | Mien phi | Solver configs, objective tracking |

### 2.2 Bon pipeline chinh

1. **Batch Optimization** (Vd: lap tuyen nightly): Data Ingest → Geocode + Distance Matrix → Model Formulate → Solve (5-30 phut) → Post-Process → Dispatch. Trigger: cron 02:00 daily.

2. **Real-time Optimization** (Vd: dynamic dispatch): Event Stream → Micro-batch (100-500ms) → Warm-start Solve (1-5 giay hard limit) → Execute & Notify → Update State (Redis).

3. **Predict-then-Optimize** (Vd: inventory optimization): Historical Data → Forecast (B01) → Parameter Estimation → LP/MIP Formulation → Solve → Execute Purchase Orders.

4. **Multi-objective** (Vd: cost vs service vs carbon): Define Objectives → NSGA-II/III (pymoo) → Generate Pareto Front → Decision Maker chon → Execute.

### 2.3 Vietnam Simplified Stack (R-gamma yeu cau)

```
Stage 1 (2-3 nguoi, <$500/thang):
  OR-Tools + PuLP + FastAPI + cron
  Batch-only, CSV/Excel input, don gian

Stage 2 (5+ nguoi, $1,500-3,000/thang):
  Them OSRM + Redis warm-start + Celery + Prometheus
  Near-real-time, API integration

Stage 3 (8+ nguoi, $5,000-10,000/thang):
  Them Gurobi (neu can) + Kafka events + dashboard
  Real-time dynamic dispatch, multi-tenant
```

---

## Phan 3: Tong hop Kha thi (R-gamma)

### 3.1 Ma tran Diem so

| Chieu | Diem | Giai thich |
|-------|------|-----------|
| Kha thi ky thuat | 9 | OR-Tools mien phi, Apache license, production-proven. CP-SAT thong tri scheduling. Toan bo stack la open-source. Tru 1 diem cho real-time optimization kho hon expected. |
| Nhu cau thi truong | 9 | Supply chain optimization $9.4B 2028. Route optimization $7.5B. Moi cong ty logistics, moi nha may deu co van de optimization. Tru 1 diem vi nhieu client chua biet minh can. |
| Du lieu kha dung | 8 | LOI THE LON NHAT cua B06: khong can training data, chi can problem data (distances, capacities, time windows) — du lieu DA TON TAI trong moi ERP/TMS. Tru 2 diem cho dia chi VN khong chuan. |
| Rui ro trien khai | 7 | Solver chin muoi nhung integration + change management + constraint elicitation la kho. Moi client co "luat rieng" khong fit model chuan. Tru 3 diem. |
| Phu hop VN | 9 | Logistics 16-17% GDP, gap doi nuoc phat trien. Manufacturing 7-8% tang truong/nam. Last-mile 2.5 ty buu kien/nam. Tru 1 diem cho willingness to pay chua chung minh. |
| **Tong** | **8.4** | **Cao nhat portfolio MAESTRO** |

### 3.2 Tai sao 8.4 la cao nhat?

So sanh voi cac baselines khac:
- **B01 Forecasting (7.6)**: Can historical data dai, model training, GPU. B06 khong can.
- **B04 NLP (7.0)**: Vietnamese NLP data scarcity 5/10. B06 data availability 8/10.
- **B05 RecSys (6.6)**: Thi truong bi Shopee thong tri, data chicken-and-egg. B06 co thi truong phan manh voi 4,000+ cong ty logistics.

B06 thang vi: (1) zero license cost, (2) structured data thay vi training data, (3) thi truong VN logistics dang bung no.

### 3.3 TAM/SAM/SOM

| Metric | Gia tri | Co so |
|--------|---------|-------|
| TAM | $12B (2025) | Toan cau, moi vertical |
| SAM | $800M-$1.2B | SEA logistics + manufacturing |
| SOM (3 nam) | $5M-$15M | 5-15 clients VN o $300K-$1M/nam |
| SOM thuc te nam 1 | $500K-$1M | 2-3 pilot clients |

### 3.4 Canh tranh

Khoang trong thi truong: mid-market VN — qua tinh vi cho manual planning, qua nhay gia cho Gurobi/Quintiq, qua phuc tap cho SaaS nhu Routific. MAESTRO nham dung khoang trong nay. Google Route Optimization API la doi thu bong — phai benchmark lien tuc.

### 3.5 Challenges cua R-gamma den R-alpha va R-beta

**Den R-alpha:**
1. Neural Combinatorial Optimization la oversold cho VN 2-3 nam toi. OR-Tools guided local search tot hon cho <10K nodes.
2. LLM formulation (OptiMUS) 80-90% accuracy = 10-20% sai — khong chap nhan cho production.
3. Quantum-inspired la noise. Loai bo khoi priority.

**Den R-beta:**
1. Code examples gia dinh data sach — thuc te xay distance matrix cho dia chi VN chiem 60-70% effort.
2. Celery cho real-time co overhead 50-100ms — can benchmark truoc khi commit.
3. MLflow cho optimization experiments la mismatch — can tracking khac (constraint violations, solver gap progression).
4. Thieu monitoring solution quality degradation theo thoi gian.

**Danh gia cua R-sigma:** R-gamma challenges deu chinh xac va duoc evidence ro rang. Day la format challenge tot nhat trong cac modules — tiep tuc standardize.

---

## Phan 4: Tong hop Ky su Layer 2

### 4.1 R-MLE (ML Engineering)

- ML + Optimization intersection: Learning to Optimize (GNN branching, surrogate models), Predict-then-Optimize (SPO+ loss), RL cho combinatorial
- Neural CO: Attention Model/POMO tot cho medium-scale (<1000 nodes) va fast inference; thua classical solvers cho large-scale
- Bayesian Optimization: Optuna TPE + Ray Tune ASHA cho hyperparameter tuning
- Hardware: LP/MIP la CPU-bound; neural solvers can GPU; hybrid can pipeline CPU-GPU can than

### 4.2 R-DE (Data Engineering)

- Pipeline optimization khac pipeline analytics: raw data → parameter estimation → constraint assembly → solver input → solve → solution extraction → feedback loop
- Distance matrix la bottleneck lon nhat: n locations = n*(n-1) queries. Can cache va batch
- **Dia chi Viet Nam** la thach thuc #1: "hem" (Nam), "ngo" (Bac), "kiet" (Trung); so nha "12/3/5"; geocoding accuracy 60-75% vs 95%+ nuoc phat trien. Can Goong/Map4D chuyen biet
- Constraint management: database constraints voi version control, conflict detection (IIS), soft constraint weighting
- Solution logging: problem instance ID, solver version, constraint version, objective, solve time, gap — can cho audit

### 4.3 R-DA (Data Analysis)

- Baseline measurement la bat buoc: 4-8 tuan actual data (GPS traces, delivery timestamps, fuel) truoc optimization
- Key metrics: cost reduction %, service level %, utilization %, makespan, route efficiency, inventory turnover
- Shadow prices (dual variables) cho sensitivity analysis: "Them 1 xe tiet kiem $2,300/ngay"
- Dashboard: real-time KPIs, constraint violation monitor, Pareto visualization, what-if simulator
- ROI benchmarks VN: routing 10-15% fuel reduction, scheduling 5-10% makespan, inventory 15-20% reduction

### 4.4 R-BE (Backend Engineering)

- API: POST /api/v1/optimize — sync cho bai nho (<5s), async (202 + job_id) cho bai lon
- SolverInterface abstraction: OR-Tools, Gurobi, PuLP, custom — solver-agnostic
- Async pipeline: FastAPI → Redis → Celery worker pool → PostgreSQL → webhook/SSE
- Solution caching: content hash → Redis LRU cache; warm-start cho near-duplicate problems
- Multi-tenant: priority queues, resource limits per tenant, Gurobi license token management
- Error handling: infeasibility → IIS analysis, timeout → return best feasible, unbounded → model error flag

### 4.5 R-DO (DevOps/MLOps)

- LP/MIP: CPU-bound (c7i.8xlarge cho Gurobi); neural solvers: GPU (T4/A10G). Tach node pools
- Docker: multi-stage build, solver version pinned, health check giai LP 2 bien
- Scaling: KEDA tren Redis queue depth; spot instances cho batch (60-70% tiet kiem); scale-down cooldown 10 phut
- CI/CD: constraint unit tests → benchmark solve → canary production-scale → blue-green deploy
- Monitoring: solve time p50/p95/p99, optimality gap, infeasibility rate, queue depth. Alert khi p95 vuot SLA
- Vietnam: on-premise cho manufacturing nhay cam; AWS ap-southeast-1 cho logistics startups; offline mode cho rural

### 4.6 R-QA (QA Engineering)

- Testing pyramid: constraint unit tests (hang tram) > integration > regression benchmarks (nightly) > E2E
- Solution validation: feasibility check (substitute back), optimality gap, dominance vs heuristic, business rule compliance
- Benchmarks: TSPLIB, CVRPLIB, MIPLIB — track qua thoi gian, solution quality gate fail build neu degrade >1%
- Edge cases: empty input, infeasible, unbounded, degenerate (1 order 1 vehicle), numerical precision, duplicates
- Solver upgrades (Gurobi 10→11): regression suite ca/cu, no benchmark degrade >0.5%

### 4.7 R-SA (Solution Architecture)

- 4 patterns: Batch Engine, Real-time Service, Embedded in SaaS, Optimization-as-a-Service
- Reference architecture last-mile: Order API → Geocoding → Distance Matrix → VRP Solver → Route Assignment → Driver App → GPS → Re-optimizer
- Reference architecture scheduling: MES/ERP → Job Extractor → Machine Constraints → Scheduling Engine → Gantt → MES Writeback
- Scalability: geographic clustering (5000-stop → 50 x 100-stop), time decomposition (rolling horizon), hierarchical (strategic → tactical → operational)
- TCO 3 nam (500 routes/ngay): OR-Tools+cloud $144K, Gurobi+dedicated $204K, Google API $210K. OR-Tools thang khi co OR talent VN
- Migration path: Manual → Spreadsheet (1-2 thang) → OR-Tools prototype (2-3 thang) → Production (3-6 thang) → Real-time (6-12 thang)

---

## Phan 5: Tong hop Domain Layer 2

### 5.1 R-D06 (Logistics Domain)

- **Use case #1 (P0): Last-mile delivery routing cho xe may** — 70-80% giao hang VN bang xe may. Capacity 5-8 goi, di hem/ngo, COD 60-70%. VRP motorbike khac hoan toan VRP xe tai phuong Tay.
- Dia chi VN la thach thuc lon nhat: "hem" (Nam) vs "ngo" (Bac) vs "kiet" (Trung); geocoding 60-75% accuracy
- COD them constraint: driver mang tien mat → can diem gui tien giua tuyen, security limit
- Multi-Depot VRP: HCMC co 20-50 micro-hubs. Two-stage: phan bo buu kien → toi uu tuyen tung hub
- Dynamic VRP cho same-day delivery: cheapest insertion, regret-based heuristics
- ROI: 10-20% tiet kiem nhien lieu, 15% tang so giao/ngay, 8-12% giam giao that bai. Fleet 500 xe may → 1.5-3 ty VND/nam
- Thi truong: 200+ cong ty 3PL trung binh (500-50,000 goi/ngay) chua co optimization technology

### 5.2 R-D04 (Manufacturing Domain)

- **Production scheduling**: Nha may may 50 style x 20 chuyen may → combinatorial explosion. Hien tai: Excel + kinh nghiem = 15-25% mat capacity. OR-Tools CP-SAT + GA giam changeover 20-30%, tang throughput 10-15%.
- **Cutting stock (det may)**: Vai chiem 60-70% chi phi san xuat. Waste 15-20%. Nesting algorithms tiet kiem 3-5% → nha may 200 ty VND vai/nam tiet kiem 6-10 ty VND/nam. **ROI nhanh nhat** (payback 1-2 thang).
- **Inventory optimization**: Nha may VN giu safety stock qua nhieu do supplier lead time bien dong. Multi-echelon optimization giam 15-25% von luu dong.
- **Energy optimization**: Gia dien theo gio (peak 1.5-2x off-peak). Scheduling may nang off-peak tiet kiem 5-10%.
- Du lieu: nhieu nha may van paper/Excel → can so hoa truoc khi optimize. Barcode scanning tai checkpoints la 80/20 approach.
- Stack: OR-Tools CP-SAT (scheduling) + column generation (cutting) + GA (multi-objective) — hybrid approach dat 90% chat luong commercial solver voi 10% chi phi.

---

## Khuyen nghi

### Khuyen nghi chien luoc (tu R-gamma, duoc R-sigma dong thuan)

1. **Bat dau voi last-mile route optimization (P0)**: CVRPTW tren OR-Tools + Vietnamese address normalization + OSRM. Target: cong ty giao hang 100-500 xe.

2. **Dau tu manh vao data preprocessing layer**: Geocoding dia chi VN, distance matrix, constraint elicitation chiem 70% effort. Day la competitive moat.

3. **Tuyen it nhat 1 ky su OR**: ML engineers KHONG the debug infeasible models, hieu dual variables, hay formulate cutting planes. Tim tu HUST Toan ung dung hoac Vietnamese diaspora.

4. **Batch truoc, real-time sau**: Lap tuyen nightly don gian, re, de validate. Dynamic dispatch la Phase 2 voi 5-10x infrastructure cost.

5. **Xay constraint configuration DSL**: JSON/YAML rule definitions cho common constraints. Khac biet giua consulting shop va product company.

6. **Ket noi B06 voi B01 (forecasting) va B04 (NLP)**: Predict-then-optimize (demand forecast → inventory optimization) la cross-baseline integration tu nhien. B04 NLP cho natural-language constraint specification.

7. **Dinh gia theo ROI, khong theo license**: "Chung toi giam fleet ban tu 200 xe xuong 170" → $50K/nam. Khong ban "optimization software."

8. **Khong theo duoi ride-hailing dispatch hay energy grid**: Bi incumbents thong tri (Grab, EVN) voi proprietary data.

9. **Benchmark lien tuc voi Google Route Optimization API**: Neu MAESTRO khong vuot Google ve solution quality + constraint handling → clients chon Google.

10. **Gurobi: chuan bi upgrade path nhung chua commit**: OR-Tools xu ly 90% use cases. Document chinh xac khi nao can Gurobi. Upgrade la config change, khong phai rewrite.

---

## Checklist Phase 1 Complete

- [x] Research report (R-alpha): 12 core concepts, 15 algorithms, state-of-art 2024-2026, key papers
- [x] Tech report (R-beta): 10+ tools by layer, 4 pipeline architectures, code patterns
- [x] Feasibility report (R-gamma): 8.4/10 CONDITIONAL GO, competitive landscape, risk register 10 items
- [x] R-MLE: ML+Optimization intersection, neural CO, Bayesian optimization, hardware
- [x] R-DE: Data pipeline, distance matrix, Vietnamese address challenges, constraint management
- [x] R-DA: Baseline measurement, KPIs, what-if analysis, dashboard design, ROI analysis
- [x] R-BE: API design, solver integration, async architecture, caching, multi-tenant, error handling
- [x] R-DO: Infrastructure, containerization, scaling, CI/CD, monitoring, VN deployment
- [x] R-QA: Testing strategy, solution validation, benchmarks, edge cases, solver regression
- [x] R-SA: 4 architecture patterns, reference architectures, scalability, TCO, migration path
- [x] R-D06: VN logistics context, motorbike VRP, COD constraints, ROI quantified
- [x] R-D04: VN manufacturing, cutting stock, scheduling, energy optimization, ROI quantified
- [x] Final report (R-sigma): Tong hop day du
- [x] B06-optimization.json: Draft knowledge node
- [x] B06-learnings.md: Key insights va patterns
- [x] graph.json: B06 node + 5 edges

---

## Tranh luan va Giai quyet

### Tranh luan 1: Neural Combinatorial Optimization — co nen prioritize?

**R-alpha** danh nhieu phan cho Attention Model, POMO, diffusion models cho CO.
**R-gamma** challenge: "irrelevant for MAESTRO Vietnam deployment in 2-3 years."
**R-MLE** trung lap: neural solvers "excel at generating fast initial solutions" nhung khong thay the classical.

**Giai quyet (R-sigma):** Dong y voi R-gamma. De-prioritize NCO trong knowledge graph. Giu nhu "research watch item" — chi invest khi client co >10,000 stops can sub-second inference. 99% use cases VN OR-Tools guided local search la du.

### Tranh luan 2: MLflow cho optimization experiment tracking

**R-beta** de xuat MLflow.
**R-gamma** challenge: "mismatch — optimization can track constraint violations, solver gap progression, warm-start effectiveness, khong phai ML metrics."

**Giai quyet (R-sigma):** R-gamma dung ve ly thuyet nhung pragmatically MLflow van dung duoc (custom metrics). Compromise: dung MLflow cho Phase 1 (da quen thuoc, zero setup), xay custom tracking khi co 3+ clients va hieu ro tracking needs thuc te.

### Tranh luan 3: Celery cho real-time

**R-beta** de xuat Celery + Redis.
**R-gamma** challenge: "Celery overhead 50-100ms, khong du cho sub-second dynamic dispatch."

**Giai quyet (R-sigma):** R-gamma dung. Batch dung Celery. Real-time dung Redis pub/sub hoac asyncio truc tiep. Phan tach ro trong architecture.

---

## Cau hoi mo (cho Phase 2+)

1. **Gurobi academic license cho MAESTRO?** Neu MAESTRO hop tac voi truong dai hoc (HUST, Bach Khoa), co the dung Gurobi academic license cho R&D. Ranh gioi commercial/academic can lam ro.

2. **Abivin la doi thu hay doi tac?** Abivin (Hanoi) lam route optimization cho VN. Co nen canh tranh truc tiep hay partnership/acquisition?

3. **VinFast supply chain la flagship client?** Tiem nang khong lo nhung enterprise sales cycle co the mat 12-18 thang. Co nen theo duoi?

4. **OSRM voi Vietnam road data — quality du khong?** OSM coverage ngoai thanh pho lon con yeu. Can dau tu bao nhieu de xay distance matrix dang tin cay cho VN?

5. **Constraint DSL design — JSON/YAML hay visual builder?** Cho non-technical dispatchers, visual constraint builder co the can thiet hon YAML files. Dau tu UX bao nhieu?

---

*Bao cao nay duoc tong hop boi Ms. Scribe (R-sigma), Chief Knowledge Officer. Module B06 Optimization & Operations Research. Diem: 8.4/10 — cao nhat portfolio MAESTRO. Ngay: 2026-03-31.*
