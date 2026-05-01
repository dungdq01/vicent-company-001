# Logistics Domain Notes: B06 Optimization × Logistics
## By R-D06 — Date: 2026-03-31

### 1. Optimization in Logistics: Use Case Landscape

Optimization touches every segment of the logistics value chain:

- **Vehicle Routing Problem (VRP)**: The foundational problem — assign deliveries to vehicles and sequence stops to minimize total distance/time/cost. Hundreds of academic variants exist, but real-world implementations require handling time windows, capacity, driver breaks, and dynamic order insertion simultaneously.
- **Warehouse Layout Optimization**: Slotting assignment (which SKU goes where), pick path optimization, zone design. A well-optimized warehouse layout reduces picker travel distance by 20-35%.
- **Load Optimization**: 3D bin packing for truck/container loading. Maximizes space utilization while respecting weight limits, stacking constraints, and unloading sequence.
- **Fleet Scheduling**: Assign vehicles to routes across days/weeks considering maintenance windows, driver availability, and demand patterns.
- **Network Design**: Strategic decisions — where to place warehouses, which lanes to operate, hub-and-spoke vs point-to-point. Typically solved as mixed-integer programs annually.
- **Last-Mile Delivery**: The most cost-intensive segment (53% of total shipping cost). Optimization here has the highest ROI per dollar invested.
- **Cross-Docking Optimization**: Minimize dwell time at transfer points by synchronizing inbound and outbound schedules.

### 2. Vietnamese Logistics Context

Vietnam's logistics sector presents unique optimization opportunities driven by structural inefficiencies:

**Cost Structure**: Logistics costs remain at 16-17% of GDP (vs 8-10% in developed economies), indicating massive room for optimization. Transportation accounts for 60% of this cost — routing optimization alone could save billions of VND nationally.

**Market Fragmentation**: Over 4,000 logistics companies operate in Vietnam, with most being small-scale. Major players include Viettel Post (leveraging military infrastructure), GHTK (Giao Hang Tiet Kiem — technology-first approach), GHN (Giao Hang Nhanh), J&T Express (Indonesian-backed), and Ninja Van. Each processes 1-3 million parcels daily in peak season.

**Motorbike-Dominant Last Mile**: Unlike Western markets where vans dominate, 70-80% of urban last-mile deliveries in Vietnam use motorbikes. This fundamentally changes the VRP: smaller capacity (5-8 parcels), faster navigation through traffic, ability to use alleys (hem/ngo), but weather vulnerability during monsoon season.

**E-Commerce Growth**: Vietnam's e-commerce market exceeded $20 billion in 2025, growing 25% YoY. Shopee, TikTok Shop, Lazada, and Tiki generate enormous parcel volumes. Flash sales (9.9, 11.11, 12.12) create 3-5x demand spikes requiring dynamic optimization.

### 3. High-Priority Optimization Use Cases for Vietnam

**Last-Mile Delivery Routing (Motorbike-Specific)**: The highest-impact use case. Standard VRP solvers assume cars/trucks — motorbike routing must account for one-way streets that motorbikes can partially ignore, alley accessibility, rain delays, and the COD (cash-on-delivery) collection pattern where 60-70% of orders are COD. COD adds a constraint: drivers must visit bank/collection points to deposit cash mid-route.

**Warehouse Slotting for E-Commerce Fulfillment**: Vietnamese e-commerce warehouses handle high SKU variety with small order sizes (1.2-1.8 items per order average). Optimization of pick paths and slotting based on co-purchase frequency can reduce pick time by 25-30%. Particularly impactful for dark stores serving same-day delivery.

**Cross-Border Logistics Vietnam-China**: The Lang Son and Mong Cai border gates handle billions in trade. Optimization of customs clearance sequencing, container consolidation, and cross-border truck scheduling reduces transit time from 3-5 days to 1-2 days. Growing importance as Vietnam becomes a manufacturing alternative to China.

### 4. Data Challenges

**Vietnamese Address Inconsistency**: The most critical data challenge. Vietnamese addresses use informal references: "hem" (alley in the South), "ngo" (alley in the North), "kiet" (alley in Central Vietnam). House numbering is inconsistent — "12/3/5" means house 5 in sub-alley 3 of alley 12. No standardized format exists. Geocoding accuracy for Vietnamese addresses is 60-75% compared to 95%+ in developed markets. Any optimization system must include a robust address normalization layer.

**Real-Time Traffic Data Quality**: Google Maps traffic data covers major roads but misses the alley network where most deliveries occur. Motorbike-specific travel time estimation requires historical GPS data from driver fleets — companies like GHTK and GHN have this data but do not share it.

**COD Collection Complexity**: Cash-on-delivery adds a financial constraint layer. Drivers carry cash that must be deposited, creating security constraints (max cash carried), route constraints (deposit point visits), and reconciliation complexity. Failed deliveries (customer not home) require re-optimization of remaining routes.

### 5. VRP Variants for Vietnam

**Capacitated VRP (CVRP) with Motorbike Constraints**: Vehicle capacity of 5-8 parcels (vs 100+ for trucks). This means more routes with fewer stops each — the problem structure differs fundamentally from Western VRP. Solver performance is actually better because each sub-problem is smaller, but fleet coordination across 200+ motorbike drivers is complex.

**VRP with Time Windows (VRPTW)**: Essential for scheduled deliveries. Vietnamese consumers increasingly expect 2-hour delivery windows. Combined with COD, the driver must arrive when the customer is home to collect payment.

**Multi-Depot VRP**: Major cities have multiple micro-hubs. Ho Chi Minh City alone may have 20-50 last-mile hubs. Assigning parcels to the nearest hub and then optimizing routes per hub, with load balancing across hubs, is a two-stage optimization problem.

**Dynamic VRP**: Real-time order insertion is critical for same-day and instant delivery services (GrabMart, Baemin, ShopeeFood). New orders arrive continuously and must be inserted into existing routes with minimal disruption. Requires fast heuristics (cheapest insertion, regret-based) rather than exact solvers.

### 6. Integration with Logistics Systems

**TMS/WMS Integration**: Route optimization must plug into existing Transportation Management Systems. Data flow: WMS releases pick-complete shipments to TMS, TMS calls optimization service, optimized routes push to driver mobile app. Standard APIs (RESTful) with webhook callbacks for status updates.

**Driver App GPS Tracking**: Continuous GPS from driver smartphones feeds the dynamic re-optimizer. Average ping interval: 15-30 seconds. Data pipeline: GPS → Kafka → real-time processor → deviation detector → re-optimization trigger.

**E-Commerce Platform APIs**: Shopee Open Platform, Lazada Seller Center API, and TikTok Shop API provide order data including buyer addresses, product dimensions, and delivery SLAs. Integration enables automatic order ingestion into the optimization pipeline.

**Customs Integration for Cross-Border**: Vietnam Customs (VNACCS/VCIS system) electronic declaration can be sequenced to optimize clearance throughput at border gates.

### 7. ROI & Business Case

Quantified impact from Vietnamese logistics optimization deployments:

- **Route Optimization**: 10-20% fuel savings, 15% more deliveries per driver per day, 8-12% reduction in failed deliveries through better time-window adherence. For a fleet of 500 motorbike drivers, this translates to 1.5-3 billion VND annual savings.
- **Warehouse Slotting**: 20-30% faster picking, 10% reduction in mis-picks, enabling same-day SLA compliance. A mid-size fulfillment center (50,000 sqm) saves 500M-1B VND annually.
- **Load Optimization**: 5-10% improvement in truck utilization for linehaul, reducing the number of inter-city trips. For a 3PL operating 100 linehaul trucks, savings reach 2-4 billion VND annually.

**Payback Period**: A well-scoped optimization project targeting last-mile routing for a mid-tier 3PL (processing 50,000 parcels/day) typically achieves payback within 4-6 months, with ongoing annual savings of 2-5 billion VND.

### 8. Competitive Landscape

**Domestic Players with Optimization**: GHTK leads in technology adoption — their in-house routing engine handles 2M+ parcels/day. GHN has invested in automated sorting and route optimization. Viettel Post leverages geographic coverage but lags in optimization sophistication.

**International Platforms**: Grab Express uses Grab's core routing technology. Lalamove and Ahamove optimize for on-demand delivery with real-time matching algorithms. Ninja Van brings Southeast Asian regional optimization expertise.

**SaaS Solutions**: Routific, OptimoRoute, and Route4Me serve international markets but lack Vietnamese address handling and motorbike routing models. This represents a clear gap.

**Market Opportunity**: Mid-tier 3PLs (500-50,000 parcels/day) currently lack access to optimization technology. They are too small for custom development but too specialized for generic SaaS. An optimization platform tailored to Vietnamese logistics — handling motorbike VRP, COD constraints, and Vietnamese address normalization — addresses a gap serving potentially 200+ companies.
