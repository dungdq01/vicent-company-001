# Technical Architecture Report: I06 — Logistics & Supply Chain
**Agent:** R-β (Dr. Praxis)  
**Date:** 2026-04-03  
**Module:** Phase 2 — Industry I06  
**Depth:** L2 (Technical Architecture)  
**Companion Report:** R-α Research Report (Dr. Archon, 2026-04-03)

---

## Executive Summary

This report translates the market and AI-adoption findings from R-α into actionable technical architecture recommendations for the MAESTRO I06 module. Vietnam's logistics sector operates at L1–L2 AI maturity, with structural data fragmentation, legacy ERP lock-in, and a COD-dominant last-mile landscape. The recommended architecture is event-driven at its core, microservices at the platform boundary, and ML-pipeline-first for AI workloads — designed to be deployable incrementally by Smartlog's engineering team without requiring a big-bang infrastructure overhaul.

---

## 1. AI Tech Stack for Logistics

### 1.1 Data Infrastructure Layer

The following table maps each infrastructure component to its role in a logistics AI platform, with recommendations weighted toward Vietnam deployment constraints (cost sensitivity, cloud vendor availability, and local engineering talent).

| Layer | Recommended Technology | Alternatives | Rationale |
|---|---|---|---|
| **Relational DB** | PostgreSQL 16+ (TimescaleDB extension) | MySQL 8, AWS Aurora PG | TimescaleDB turns Postgres into a time-series DB — ideal for shipment events, ETA history, demand series. Native JSON support handles semi-structured carrier data. |
| **Document Store** | MongoDB Atlas (M10+) or AWS DocumentDB | Elasticsearch for search-heavy workloads | Flexible schema for BOL, invoices, customs documents with varying structures across carriers. |
| **In-Memory Cache / Session** | Redis 7 (Redis Stack) | Memcached, DragonflyDB | Route cache (OSRM tiles), real-time driver location state, session tokens for TMS APIs. Redis Streams doubles as lightweight event bus for lower throughput scenarios. |
| **Message Queue / Event Bus** | Apache Kafka (MSK on AWS or Confluent Cloud) | RabbitMQ (AMQP) for simpler setups | Kafka is the industry standard for high-throughput shipment event streaming (GPS pings, status updates, IoT sensor readings). MSK removes operational overhead for a lean team. |
| **Object Storage** | AWS S3 (+ S3 Intelligent-Tiering) | Azure Blob Storage, MinIO (self-hosted) | Model artifacts, training datasets, document images, audit logs. S3 is most cost-effective for Vietnam-based AWS ap-southeast-1 (Singapore) region. |
| **Data Warehouse / OLAP** | Amazon Redshift Serverless or Google BigQuery | ClickHouse (self-hosted, cost-effective) | Analytical workloads: demand trend dashboards, carrier performance reports, ML feature stores. ClickHouse is increasingly popular for cost-sensitive SEA startups. |
| **Feature Store** | Feast (OSS) or AWS SageMaker Feature Store | Hopsworks, Tecton | Centralizes ML features (rolling demand windows, route embeddings, carrier reliability scores) for consistent train/serve parity. |
| **Data Lakehouse** | Delta Lake on S3 (via Apache Spark / AWS Glue) | Apache Iceberg, Hudi | ACID transactions on raw data lake — critical when merging GPS streams, ERP exports, and carrier APIs into a unified data lake. |

#### Vietnam-Specific Notes
- **AWS ap-southeast-1 (Singapore)** is the primary cloud region for Vietnamese logistics tech companies. Latency from HCMC to Singapore is typically 20–40ms — acceptable for most real-time use cases.
- **Azure Southeast Asia (Singapore)** is preferred by enterprises with Microsoft ERP (Dynamics 365) — relevant for integration with SAP/Oracle users like Hyundai Thanh Cong.
- **Self-hosted on-premise** remains necessary for some regulated clients (PTSC, government-linked entities) due to Decree 13/2023 data residency requirements.

### 1.2 ML Platform Layer

| ML Platform | Recommended Use | Logistics Fit |
|---|---|---|
| **MLflow** (OSS) | Experiment tracking, model registry, artifact storage | Best choice for Smartlog: free, integrates with all major frameworks, runs on any cloud. Used by Grab, Shopee, and most SEA tech companies. |
| **AWS SageMaker** | Managed training + endpoint hosting | Good for teams wanting managed infrastructure; higher cost. SageMaker Pipelines handles end-to-end MLOps. Well-suited for DeepAR forecasting models. |
| **Google Vertex AI** | AutoML, managed Pipelines, Model Garden (Gemini) | Best if using Google Cloud; Vertex AI Pipelines (Kubeflow-based) is production-grade. Strong LLM integration for document AI workloads. |
| **Azure ML** | MLOps for teams in Microsoft ecosystem | Preferred if clients run Azure Synapse / Dynamics 365. Azure ML + Azure OpenAI = strong document intelligence stack. |
| **Kubeflow** (OSS on K8s) | Self-managed MLOps on Kubernetes | For teams with K8s expertise who want full control; high operational burden but zero licensing cost. |

**MAESTRO Recommendation:** MLflow (experiment tracking) + AWS SageMaker (managed training/inference) for Smartlog's initial deployment. Rationale: MLflow is free and avoids vendor lock-in for model management; SageMaker provides managed endpoints that scale without DevOps overhead. This combination is used by companies like Ninja Van and Lazada for their logistics ML workloads.

### 1.3 Core AI Libraries by Domain

#### Forecasting
```
Prophet (Meta OSS)         — trend + seasonality decomposition; interpretable; good for Tet/promo spikes
LightGBM / XGBoost        — gradient boosting for tabular demand data; fast training; handles missing data
DeepAR (AWS SageMaker)    — probabilistic forecasting for multiple time series simultaneously
NeuralForecast (Nixtla)   — NHITS, TFT, TimesNet; state-of-art neural forecasting; OSS
statsforecast (Nixtla)     — fast ARIMA/ETS/Theta; production-ready; 1000× faster than statsmodels
```

#### Route Optimization
```
OR-Tools (Google OSS)     — VRP, VRPTW, TSP solvers; production-proven; Python API
OpenRouteService / OSRM   — open-source routing engine (OSM data); self-hostable; Vietnam road network
Valhalla (OSS)            — turn-by-turn routing with OSM; supports truck routing constraints
PyVRP                     — state-of-art VRPTW solver (2023 DIMACS winner); Python bindings
Gurobi / CPLEX            — commercial MIP solvers; required for complex network design (not last-mile)
```

#### NLP / Document Intelligence
```
Tesseract 5 (OSS)         — baseline OCR; good for printed text; Vietnamese language pack available
PaddleOCR (Baidu OSS)     — superior for Vietnamese/CJK text; better than Tesseract for handwritten/mixed
AWS Textract              — managed OCR + layout parsing; table extraction; key-value pair extraction
Azure Document Intelligence — forms recognition; pre-built invoice/receipt models; strong multilingual
LangChain / LlamaIndex    — RAG framework for logistics Q&A chatbots; document indexing
OpenAI GPT-4o / Claude 3.5 — LLM APIs for document extraction, classification, summarization
```

#### Anomaly Detection
```
Isolation Forest (scikit-learn) — fast, scalable; good for freight fraud, billing anomalies
PyOD library               — 40+ anomaly detection algorithms in one package
LSTM-Autoencoder (PyTorch) — for time-series anomalies (GPS deviation, temperature excursion)
River (online ML)          — streaming anomaly detection for real-time event pipelines
```

#### Computer Vision
```
YOLOv10 / YOLOv11 (Ultralytics) — parcel detection, damage classification, barcode reading
OpenCV                    — image preprocessing, barcode decoding, label reading
AWS Rekognition           — managed image/video analysis; damage detection, label scanning
```

### 1.4 API Layer Patterns

#### REST vs gRPC in Logistics

| Dimension | REST/HTTP | gRPC (Protocol Buffers) |
|---|---|---|
| **Use case fit** | External integrations (TMS, WMS, ERP APIs), mobile apps, webhooks | Internal microservice-to-microservice calls (high-throughput, low-latency) |
| **Vietnam logistics reality** | 90%+ of TMS/WMS/ERP systems in Vietnam expose REST (or SOAP) APIs | gRPC used internally by GHN, Grab's fleet dispatch system |
| **Payload** | JSON (verbose, human-readable) | Protobuf (2–10× smaller, faster serialization) |
| **Streaming** | Server-Sent Events or WebSocket for real-time | gRPC streaming native (GPS tracking, order state machines) |
| **Recommendation** | **REST** for all external/partner integrations | **gRPC** for internal services (ML inference, route engine calls) |

**Pattern: API Gateway + Service Mesh**
```
External TMS/WMS/Client → API Gateway (Kong / AWS API GW)
                             ↓ REST/HTTPS
                       Internal Service Mesh (Istio / Linkerd)
                             ↓ gRPC
                    ML Inference Service | Route Engine | Event Consumer
```

---

## 2. Architecture Patterns

### 2.1 Event-Driven Architecture for Real-Time Shipment Tracking

The core pattern for logistics AI is event-driven: every state change in a shipment lifecycle emits an event that triggers downstream processing (ML inference, alerting, dashboard update).

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT PRODUCERS                          │
│  GPS Devices │ Driver App │ Carrier APIs │ WMS/TMS Webhooks │
└──────────────────────────┬──────────────────────────────────┘
                           │ Kafka Topics
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               KAFKA EVENT BUS (MSK)                         │
│  shipment.events   │  gps.tracks   │  inventory.changes     │
│  order.created     │  pod.uploaded │  customs.status        │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             ▼                           ▼
┌────────────────────┐     ┌─────────────────────────────────┐
│  Stream Processing │     │      Batch Processing           │
│  (Flink / Spark SS)│     │  (Spark / AWS Glue / dbt)       │
│  - ETA recalculation│    │  - Daily demand aggregation     │
│  - Anomaly alerts  │     │  - Feature engineering          │
│  - Route rerouting │     │  - Model training triggers      │
└────────────┬───────┘     └───────────────┬─────────────────┘
             │                             │
             ▼                             ▼
┌────────────────────┐     ┌───────────────────────────────┐
│  Redis (live state)│     │  Data Lake (S3 + Delta Lake)  │
│  - Current position│     │  - Historical events          │
│  - ETA estimates   │     │  - Training datasets          │
│  - Alerts queue    │     │  - Feature store              │
└────────────────────┘     └───────────────────────────────┘
```

**Key Kafka Topics for Logistics:**

| Topic | Producer | Consumer | Retention |
|---|---|---|---|
| `shipment.status.events` | TMS webhooks, driver app | ETA model, dashboard, notifications | 30 days |
| `gps.location.raw` | GPS devices, fleet telematics | Route deviation detector, geofence alerts | 7 days |
| `inventory.level.changes` | WMS, POS systems | Demand forecasting trigger, reorder alerts | 14 days |
| `document.uploaded` | Customs portal, email ingestion | OCR pipeline, compliance checker | 90 days |
| `pod.confirmed` | Driver app photo capture | Revenue recognition, analytics | 180 days |
| `iot.temperature` | Cold chain sensors | Temperature excursion alerting | 7 days |

### 2.2 Microservices vs. Monolith Tradeoffs

**For Smartlog's Context (50–200 engineers, growing platform):**

| Dimension | Monolith | Microservices |
|---|---|---|
| Development speed (early) | Fast (single codebase) | Slower (distributed complexity) |
| Deployment independence | None | High (per-service CI/CD) |
| Team scaling | Bottleneck at ~50 engineers | Enables independent teams |
| Operational complexity | Low | High (service mesh, distributed tracing) |
| AI/ML integration | Simple (in-process calls) | Requires ML inference APIs |
| Vietnam SME client integration | Easier (single API surface) | More flexible (selective integration) |

**Recommendation: Modular Monolith → Selective Microservices**

Start with a well-structured modular monolith for the core TMS/WMS platform, and extract only the AI/ML workloads as microservices from day one:

```
MAESTRO Platform (Modular Monolith Core)
├── /tms     — shipment management, carrier assignments
├── /wms     — inventory, picking, put-away
├── /billing — freight costing, invoicing
└── /api     — unified REST API gateway

AI Services (Microservices, independent deployment)
├── forecast-service      — demand & volume forecasting (Python/FastAPI)
├── route-optimizer       — VRP/VRPTW engine (Python + OR-Tools)
├── eta-predictor         — real-time ETA via ML (Python/FastAPI)
├── document-ai           — OCR + extraction pipeline (Python)
├── anomaly-detector      — fraud & anomaly scoring (Python)
└── chatbot-service       — RAG-powered logistics assistant (Python/LangChain)
```

This pattern is used by GHN, Ninja Van, and Lazada for their logistics platforms — a stable core with AI capabilities as independently deployable services.

### 2.3 Data Pipeline Patterns

#### Lambda vs. Kappa vs. Streaming-First

| Pattern | Description | Fit for Logistics |
|---|---|---|
| **Lambda Architecture** | Separate batch layer (historical accuracy) + speed layer (real-time approximation) + serving layer | Used by older logistics platforms; operationally complex (two codebases for same logic) |
| **Kappa Architecture** | Single streaming pipeline; reprocessing by replaying Kafka topic | Cleaner; Kafka log retention as the "batch" source; preferred by modern logistics platforms |
| **Streaming-First (Kappa+)** | Kafka as source of truth; Flink for stateful streaming; materialized views for serving | Best fit for logistics: GPS tracking, live ETA, real-time route optimization |

**Recommendation: Kappa Architecture with Flink**

```
RAW EVENTS (Kafka, 30–90 day retention)
    ↓
Apache Flink (Stateful Stream Processing)
    ├── Windowed aggregations (5min, 1hr, 1day)
    ├── ETA recalculation on new GPS event
    ├── Anomaly scoring (sliding windows)
    └── Feature generation → Feature Store
    ↓
Serving Layer
    ├── Redis (real-time: current positions, live ETAs)
    ├── PostgreSQL (transactional: shipment state, orders)
    └── Data Warehouse (analytical: dashboards, reports)
```

For early-stage deployment where Flink expertise is limited, **Apache Spark Structured Streaming on AWS EMR** is an acceptable intermediate step — lower learning curve, managed infrastructure.

### 2.4 MLOps Maturity Model for Logistics

| Level | Description | Typical Vietnam Player | Key Technologies |
|---|---|---|---|
| **L0 — Manual** | Notebooks, no tracking, manual deployment | Most Vietnam SME 3PLs | Jupyter, pandas, Excel |
| **L1 — Reproducible** | Version-controlled code, experiment tracking, scheduled batch retraining | Smartlog (target: immediate) | MLflow, Git, Airflow/Prefect, Docker |
| **L2 — Automated** | CI/CD for models, automated testing, feature store, model registry | GHN, Ninja Van | MLflow + SageMaker, Feast, GitHub Actions, Great Expectations |
| **L3 — Real-time** | Online feature serving, real-time inference, A/B testing, drift monitoring | Grab, Lazada | SageMaker Endpoints, Evidently AI, Seldon Core, Istio |
| **L4 — Agentic** | Self-optimizing pipelines, autonomous retraining triggers, agentic AI orchestration | DHL, Amazon | Ray, Kubeflow, custom agentic frameworks |

**MAESTRO Target:** Achieve L1–L2 in 6 months, L2–L3 in 18 months for core baselines (B01, B03, B06).

**MLOps Pipeline Template (L1–L2):**
```
[Data Ingestion]     → Airflow DAG pulls from TMS/WMS APIs + Kafka consumer
[Feature Engineering] → dbt transforms in warehouse; Feast writes to feature store
[Training]           → SageMaker Training Job triggered by Airflow; MLflow logs metrics
[Validation]         → Great Expectations data quality checks; model performance gates
[Registry]           → MLflow Model Registry; "Staging" → "Production" promotion
[Deployment]         → SageMaker Endpoint (real-time) or Batch Transform (batch scoring)
[Monitoring]         → Evidently AI for data drift; CloudWatch for endpoint latency/errors
[Retraining Trigger] → Drift detected → Airflow triggers new training run automatically
```

---

## 3. Integration Patterns

### 3.1 TMS Integration

Transportation Management Systems in Vietnam range from global platforms (SAP TM, Oracle TMS) to local SaaS (Smartlog TMS, EcoTruck) and legacy on-premise systems.

```
┌──────────────────────────────────────────────────────┐
│                  TMS Integration Layer               │
│                                                      │
│  Smartlog TMS ──REST API──→ Integration Hub          │
│  SAP TM       ──SOAP/REST──→ (Apache Camel / MuleSoft│
│  Oracle TMS   ──REST API──→  or custom middleware)   │
│  3PL TMS      ──FTP/EDI──→                           │
│                              │                       │
│                              ▼                       │
│                    Kafka Event Bus                   │
│                    (normalized events)               │
│                              │                       │
│              ┌───────────────┼───────────────┐       │
│              ▼               ▼               ▼       │
│       AI Route Engine  ETA Predictor  Anomaly Det.  │
└──────────────────────────────────────────────────────┘
```

**Key Integration Points:**
- **Shipment creation event** → trigger route optimization
- **Status update webhook** → trigger ETA recalculation
- **POD upload** → trigger document AI pipeline
- **Invoice generated** → trigger anomaly detection scoring

**API Pattern for TMS:** REST with OpenAPI 3.0 spec. For Smartlog's own TMS, expose a Kafka-native integration for internal AI services (avoids REST overhead on high-frequency GPS pings).

### 3.2 WMS Integration

| WMS Type | Integration Method | AI Touchpoints |
|---|---|---|
| **Smartlog WMS** | Direct DB / internal events | Demand forecast → replenishment triggers; pick path optimization |
| **Manhattan Associates** | REST API + EDI | Inventory level feeds for forecasting; slotting optimization |
| **SAP EWM** | SAP BAPIs / RFC → REST adapter | Inventory data extraction; ML-driven slotting |
| **Local WMS (Vietnam)** | CSV export → S3 → Glue ETL | Batch demand forecasting; no real-time integration initially |
| **No WMS (SME)** | Mobile scan app → Kafka | Custom light WMS as data capture layer before AI |

**Warehouse Slotting Optimization Pattern (B03/B09):**
```python
# Pseudo-code: ML-driven slot assignment
def optimize_slot_assignment(sku_velocity: pd.DataFrame, 
                              warehouse_layout: dict) -> dict:
    """
    Assign SKUs to warehouse slots based on:
    - Pick frequency (ABC analysis)
    - Weight/volume constraints
    - Ergonomic zones (A: waist-height near dock)
    - Co-pick affinity (frequently co-ordered SKUs cluster together)
    """
    abc_segments = compute_abc_analysis(sku_velocity)  # A: top 20% volume
    affinity_matrix = compute_co_pick_affinity(order_history)
    
    # Minimize total travel distance using assignment model
    solver = pywraplp.Solver('slotting', pywraplp.Solver.CBC_MIXED_INTEGER_PROGRAMMING)
    # ... constraint definition
    return optimized_assignments
```

### 3.3 ERP Integration

**Vietnam ERP Landscape:**

| ERP System | Prevalence in Vietnam | Integration Approach |
|---|---|---|
| **SAP S/4HANA** | Large enterprises (Hyundai Thanh Cong, manufacturing MNCs) | SAP API Hub (REST); BTP Integration Suite; or BW/HANA data extraction |
| **Oracle ERP Cloud** | Mid-large enterprises, PTSC | Oracle Integration Cloud (OIC); REST APIs; BI Publisher for data exports |
| **Microsoft Dynamics 365** | Growing mid-market adoption | Power Platform / Azure Logic Apps; Dataverse API |
| **MISA, FAST, Bravo** | Vietnam SME dominant | Custom REST adapters; CSV/Excel extraction → ETL |
| **No ERP (informal)** | >60% of SME 3PLs | Build data capture layer first; mobile app or web form → database |

**ERP Integration Anti-patterns to Avoid:**
1. Direct DB queries to ERP production database (causes performance issues, breaks with upgrades)
2. Point-to-point integrations without event bus (creates spaghetti architecture)
3. Batch-only ERP sync without change data capture (stale data breaks real-time AI)

**Recommended Pattern: Change Data Capture (CDC)**
```
SAP/Oracle ERP → Debezium (CDC) → Kafka → Stream Processor → Feature Store
                                            → Data Warehouse (for analytics)
                                            → AI Services (real-time features)
```

For Vietnam SMEs without CDC capability: scheduled pull via REST API every 15 minutes → Kafka producer → downstream consumers.

### 3.4 IoT/GPS Data Ingestion

**GPS data volume estimation:** A fleet of 1,000 vehicles pinging every 30 seconds = 2,880,000 events/day = ~33 events/second. This is well within Kafka's capacity (millions/sec) but requires proper partitioning strategy.

```
GPS Device / Mobile SDK
    ↓ MQTT (lightweight IoT protocol, TLS encrypted)
MQTT Broker (AWS IoT Core or EMQX self-hosted)
    ↓ Bridge / Lambda
Kafka Topic: gps.location.raw
    Partitioned by: vehicle_id (ensures ordering per vehicle)
    ↓
Flink Stream Processor
    ├── Geofence alerts (entered/exited zone)
    ├── Speed violation detection
    ├── Route deviation (compare vs planned route)
    ├── Idle time tracking
    └── Aggregated track → Redis (current position, last 10 points)
    ↓
PostgreSQL / TimescaleDB (compressed historical tracks)
```

**Cold Chain IoT Integration:**
```
Temperature Sensor (BLE/NB-IoT) → IoT Gateway → AWS IoT Core
    → Kafka topic: iot.temperature
    → Flink: threshold violation → alert event → notification service
    → TimescaleDB: time-series storage → dashboard
    → ML Model: predict temperature excursion before it happens (B06)
```

**Recommended IoT Stack for Vietnam:**
- **Protocol:** MQTT over TLS (most GPS devices support MQTT; lower bandwidth than HTTP)
- **Broker:** AWS IoT Core (managed, scales automatically) or EMQX (self-hosted, cost-effective for >10K devices)
- **Device SDK:** Supports Vietnamese OBD-II telematics units common in Vietnam truck fleet (Viettel IoT, VNPTepay GPS trackers)

### 3.5 EDI / Customs Document Exchange

**Vietnam Customs (VNACCS/VCIS) Integration:**

```
Shipment Data (TMS/ERP)
    → VNACCS XML Generator (per Ministry of Finance spec)
    → VNACCS Portal (electronic submission)
    → Status webhook → Document AI validation
    → Kafka event: customs.declaration.submitted
```

**EDI Standards in Vietnamese Logistics:**

| Standard | Use Case | Common in Vietnam |
|---|---|---|
| EDIFACT UN/CEFACT | Ocean B/L, customs declarations | Port operators, Maersk, large forwarders |
| ANSI X12 | US-bound shipment documents | US-facing exporters |
| VNACCS XML | Vietnam customs electronic declarations | All import/export players |
| JSON REST APIs | Modern carrier integrations (GHN, Ninja Van) | Tech-native CEP companies |
| PDF/email (informal) | SME carrier document exchange | Majority of Vietnam micro-carriers |

**Document AI Pipeline for Customs Documents:**
```
Document Received (email attachment / portal upload / photo)
    ↓
Ingestion Service → S3 (raw documents bucket)
    ↓ Kafka: document.uploaded
Document AI Pipeline (Flink consumer)
    ├── File type detection (PDF, image, email)
    ├── OCR (PaddleOCR for Vietnamese; AWS Textract for structured forms)
    ├── Layout Parser (extract tables, key-value pairs)
    ├── LLM Extraction (GPT-4o / Claude) → structured JSON
    ├── Validation (business rules: HS code format, required fields)
    └── Output: structured document → PostgreSQL + downstream TMS/ERP
```

---

## 4. Technology per Baseline (B01–B15 mapped to I06)

### B01 — Time Series Forecasting (CRITICAL for I06)

**Use Cases:** Demand forecasting, shipment volume prediction, inventory replenishment

**Recommended Stack:**
```
Data: TimescaleDB (historical demand) + Feature Store (external signals)
Training: AWS SageMaker (DeepAR for probabilistic, multi-product forecasting)
Framework: NeuralForecast (NHITS/TFT) for state-of-art; Prophet for interpretable baseline
Serving: SageMaker Batch Transform (daily forecasts) + FastAPI endpoint (on-demand)
Monitoring: Evidently AI (drift detection on forecast accuracy)
```

**Vietnam-Specific Features to Engineer:**
```python
# Key features for Vietnam logistics demand forecasting
features = {
    # Calendar features
    "is_tet_holiday": bool,          # Vietnamese Lunar New Year (major demand spike)
    "days_to_tet": int,              # Lead-up demand surge (10-14 days before)
    "is_double_day_sale": bool,      # 11/11, 12/12 Shopee/TikTok mega sales
    "is_national_holiday": bool,     # Sept 2, April 30, etc.
    
    # Demand signals
    "tiktok_shop_gmv_index": float,  # Proxy for viral demand spikes
    "weather_severity": float,       # Typhoon/flood impact on delivery capacity
    "fuel_price_index": float,       # Cost-side demand elasticity
    
    # Historical patterns
    "lag_7d_volume": float,
    "lag_28d_volume": float,
    "rolling_28d_std": float,        # Volatility measure
    "yoy_growth_rate": float,
}
```

**Model Benchmark (Logistics Demand Forecasting):**

| Model | MAPE (typical) | Training Time | Interpretability |
|---|---|---|---|
| ARIMA/SARIMA | 15–25% | Minutes | High |
| Prophet | 10–20% | Minutes | High |
| LightGBM | 8–15% | Minutes | Medium |
| DeepAR (AWS) | 7–13% | Hours (GPU) | Low |
| NHITS (NeuralForecast) | 6–12% | Hours (GPU) | Low |
| Ensemble (LGB + DeepAR) | 5–10% | Hours | Low |

**Recommendation:** Start with Prophet (interpretable, explainable to business) + LightGBM (accuracy), then graduate to DeepAR for multi-product probabilistic forecasting.

---

### B02 / B11 — Document Intelligence & NLP (HIGH for I06)

**Use Cases:** Bill of Lading (BOL) processing, customs declarations, invoice extraction, HS code classification

**OCR Engine Comparison for Vietnam Logistics:**

| Engine | Vietnamese Text | Table Extraction | Cost | Self-hostable |
|---|---|---|---|---|
| **Tesseract 5** | Fair (3–4 star) | Poor | Free | Yes |
| **PaddleOCR** | Excellent (5 star) | Good | Free | Yes |
| **AWS Textract** | Good (4 star) | Excellent | $1.5/1000 pages | No |
| **Azure DI** | Good (4 star) | Excellent | $1.5/1000 pages | No |
| **Google Vision AI** | Good (4 star) | Good | $1.5/1000 pages | No |

**Recommended Architecture:**
```
Tier 1 — Fast/Cheap: PaddleOCR (self-hosted on GPU instance)
    → for high-volume, structured documents (standard BOL forms)
    
Tier 2 — Accurate/Managed: AWS Textract
    → for complex layouts, handwritten forms, table-heavy customs docs
    
Tier 3 — LLM Extraction: GPT-4o / Claude Sonnet
    → for unstructured documents, extraction validation, HS code classification
    
Routing Logic:
    if document_confidence > 0.95 AND known_template: → Tier 1
    elif structured_form AND tables: → Tier 2
    else: → Tier 3 (LLM)
```

**HS Code Classification (Vietnam Customs):**
```python
# Pseudo-code: LLM-assisted HS code classification
def classify_hs_code(product_description: str, 
                     declared_material: str,
                     country_of_origin: str) -> dict:
    prompt = f"""
    Classify the following product for Vietnam customs (VNACCS):
    Product: {product_description}
    Material: {declared_material}
    Origin: {country_of_origin}
    
    Return: HS code (8-digit Vietnam tariff), confidence, duty rate, restricted flag.
    Reference: Vietnam Schedule of Tariff 2024.
    """
    response = llm_client.chat(prompt, temperature=0.1)
    return parse_hs_response(response)  # structured output with validation
```

---

### B03 / B06 (OR) — Route Optimization & Load Planning (CRITICAL for I06)

**Use Cases:** Last-mile route optimization, fleet load planning, vehicle routing with time windows (VRPTW)

**Solver Comparison:**

| Solver | Type | VRPTW Support | Scale | Cost |
|---|---|---|---|---|
| **OR-Tools (Google)** | OSS Constraint Programming | Yes | Up to ~1000 stops | Free |
| **PyVRP** | OSS (2023 DIMACS winner) | Yes (VRPTW) | High quality | Free |
| **OpenRouteService** | OSS Routing Engine | Via optimization layer | Needs combo | Free |
| **Vroom (OSS)** | VRP solver + ORS routing | Yes | Good for SME scale | Free |
| **Gurobi / CPLEX** | Commercial MIP | Yes (any VRP variant) | Unlimited | $10K+/yr |
| **RouteXL / OptiRoute** | SaaS | Basic | Limited | $30–200/mo |

**Recommended Stack for Smartlog:**
```
Routing Engine: OSRM (self-hosted on Vietnam OSM data) or Valhalla
VRP Solver: OR-Tools + PyVRP (benchmark both; use PyVRP for VRPTW)
Map Data: OpenStreetMap Vietnam (update monthly; supplement with HERE Maps for accuracy)
Real-time Traffic: Google Maps Platform Traffic API (cost: ~$5/1000 requests) or HERE Traffic
```

**VRPTW Pseudo-code:**
```python
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def solve_vrptw(depot: Location, 
                deliveries: List[Delivery],
                fleet: List[Vehicle],
                time_matrix: np.ndarray) -> List[Route]:
    """
    Vehicle Routing Problem with Time Windows
    Minimizes total distance while respecting:
    - Vehicle capacity (weight + volume)
    - Delivery time windows (customer-specified)
    - Driver shift hours (Vietnam labor regulations)
    - COD collection constraints
    """
    manager = pywrapcp.RoutingIndexManager(
        len(deliveries), len(fleet), depot.index
    )
    routing = pywrapcp.RoutingModel(manager)
    
    # Distance callback
    routing.SetArcCostEvaluatorOfAllVehicles(
        routing.RegisterTransitCallback(lambda i, j: time_matrix[i][j])
    )
    
    # Capacity constraints
    routing.AddDimensionWithVehicleCapacity(
        capacity_callback, 0, [v.capacity_kg for v in fleet], True, 'Capacity'
    )
    
    # Time window constraints
    time_dim = routing.AddDimension(time_callback, 30, 480, False, 'Time')
    for delivery in deliveries:
        time_dim.CumulVar(delivery.index).SetRange(
            delivery.time_window_start, delivery.time_window_end
        )
    
    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_params.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_params.time_limit.seconds = 30  # Real-time constraint
    
    solution = routing.SolveWithParameters(search_params)
    return extract_routes(manager, routing, solution, fleet)
```

---

### B07 — Anomaly Detection (MEDIUM-HIGH for I06)

**Use Cases:** Freight fraud detection, invoice billing anomalies, cargo theft patterns, cold chain temperature excursions, GPS spoofing detection

**Stack:**
```python
# Multi-signal anomaly detection pipeline
from pyod.models.iforest import IForest
from pyod.models.lof import LOF
from river import anomaly  # for streaming

# Batch anomaly detection (invoices, billing)
def detect_freight_fraud(invoice_features: pd.DataFrame) -> pd.Series:
    """
    Features: freight_rate, route_distance, declared_weight, carrier_id,
              rate_vs_market_benchmark, invoice_frequency_30d, ...
    """
    model = IForest(contamination=0.02, random_state=42)
    model.fit(train_features)
    scores = model.decision_function(invoice_features)
    return pd.Series(scores, name='anomaly_score')

# Streaming anomaly detection (GPS, temperature)
def streaming_gps_anomaly():
    """River: online learning for real-time GPS track anomalies"""
    model = anomaly.HalfSpaceTrees(n_trees=25, height=15)
    # Process GPS events from Kafka in real-time
    for event in kafka_consumer('gps.location.raw'):
        score = model.score_one(event.features)
        model.learn_one(event.features)
        if score > THRESHOLD:
            emit_alert(event, score)
```

---

### B08 — Conversational AI / RAG Chatbot (MEDIUM for I06)

**Use Cases:** Shipment tracking chatbot, freight quote assistant, compliance Q&A, logistics copilot for operations staff

**Architecture:**
```
User Query (web/mobile/Zalo/WhatsApp)
    ↓
Chat API (FastAPI + WebSocket)
    ↓
LangChain / LlamaIndex RAG Pipeline
    ├── Query Classification (shipment tracking vs. general Q&A)
    ├── Intent: "track shipment" → SQL query on PostgreSQL (live data)
    ├── Intent: "customs doc requirements" → Vector DB retrieval
    └── Intent: "freight rate quote" → Call route optimizer + rate engine
    ↓
LLM (GPT-4o / Claude Sonnet) — response generation
    ↓
Response with citation sources (for compliance Q&A)
```

**Vector Store Options:**
| Store | Fit | Cost |
|---|---|---|
| pgvector (PostgreSQL extension) | Best for teams already on Postgres; no new infra | Free |
| Pinecone | Managed, scales easily; good for large doc corpus | $70+/mo |
| Qdrant | OSS, self-hostable; good performance | Free (self-hosted) |
| Chroma | OSS, easy to start; not production-hardened | Free |

**Recommendation:** pgvector for Smartlog (leverages existing Postgres investment; sufficient for logistics document corpus of 100K–1M docs).

**Vietnam Channel Integration:**
- **Zalo OA (Official Account)** — primary B2C messaging in Vietnam; Zalo API for chatbot integration
- **WhatsApp Business API** — for international/B2B clients
- **Embedded web widget** — for TMS/WMS portal integration

---

## 5. Build vs. Buy Analysis

### 5.1 Component Decision Matrix

| Component | Build | Buy/SaaS | Rationale for Vietnam |
|---|---|---|---|
| **Core TMS/WMS** | Build (Smartlog already built) | — | Smartlog's core product; defensible moat |
| **Route Optimization Engine** | Build (OR-Tools wrapper) | Google Maps Platform Optimization API | Build: OR-Tools is free, customizable for Vietnam road conditions, COD constraints. Google API: $10/route — expensive at scale. Build wins. |
| **Demand Forecasting** | Build (Prophet + LightGBM) | AWS Forecast, Azure AI Forecasting | Build first (cost control); adopt managed service when model complexity grows. AWS Forecast: $0.60/1000 forecasts. |
| **OCR / Document AI** | Hybrid | AWS Textract / Azure DI | Use PaddleOCR (OSS) for standard templates; AWS Textract for complex docs. Full buy too expensive at scale. |
| **LLM APIs** | Buy (API) | OpenAI / Anthropic / Google | Build foundation model is not viable; API buy is the only rational choice. Budget: $0.01–0.06/1000 tokens. |
| **Real-time Tracking Map** | Buy | Google Maps / HERE Maps | Map rendering infrastructure too expensive to build. Google Maps: $7/1000 loads. |
| **ETL / Data Pipelines** | Build (Apache Airflow) | AWS Glue, Fivetran | Build: Airflow is free, flexible, widely understood. Fivetran: $500+/mo for many connectors — overkill for early stage. |
| **ML Experiment Tracking** | Build on MLflow OSS | Weights & Biases, Neptune | Build on MLflow: free, self-hosted, sufficient for team <50 data scientists. |
| **ML Serving / Endpoints** | Buy (SageMaker) | BentoML (self-hosted) | SageMaker: ~$0.10/hr for ml.t3.medium endpoint. BentoML: free but requires DevOps effort. SageMaker wins for lean team. |
| **Monitoring / Alerting** | Buy | AWS CloudWatch + Evidently AI (OSS) | CloudWatch: included with AWS. Evidently: free OSS. Combined cost: ~$50–200/mo. |
| **GPS/IoT Data Ingestion** | Buy (AWS IoT Core) | EMQX (self-hosted) | AWS IoT Core: $0.08/million messages. For >10M messages/day, EMQX self-hosted is cheaper. |
| **ERP Integration Middleware** | Build (simple) / Buy (complex) | MuleSoft, Apache Camel | For simple REST integrations: build custom adapters. For SAP/Oracle: use Apache Camel (OSS) as integration framework. MuleSoft: $100K+/yr — avoid. |

### 5.2 Cloud Cost Benchmarks (AWS ap-southeast-1, 2025–2026)

| Service | Spec | Monthly Cost (USD) |
|---|---|---|
| EC2 (API server) | c6i.xlarge (4vCPU, 8GB) | ~$110 |
| EC2 (ML training) | ml.g4dn.xlarge (GPU) | ~$380 (on-demand); ~$130 (spot) |
| SageMaker Endpoint | ml.t3.medium (real-time inference) | ~$65 |
| RDS PostgreSQL | db.t3.large, Multi-AZ | ~$200 |
| Amazon MSK (Kafka) | kafka.t3.small × 3 brokers | ~$270 |
| S3 Storage | 10TB + 1M requests/mo | ~$240 |
| CloudFront CDN | 10TB transfer | ~$850 |
| AWS IoT Core | 10M messages/mo | ~$8 |
| AWS Textract | 10,000 pages/mo | ~$15 |
| OpenAI GPT-4o API | 1M tokens/mo (input+output) | ~$10–25 |

**Estimated Monthly Infrastructure Cost for MAESTRO I06 MVP:**
- Lean setup (shared infra, dev/staging only): **$800–1,500/mo**
- Production with redundancy (HA, multi-AZ): **$3,000–6,000/mo**
- At scale (10K+ active shipments/day, real-time ML): **$8,000–15,000/mo**

### 5.3 Vietnam-Specific Build Decisions

**Build over Buy for Vietnam Context:**

1. **Vietnamese address parsing/geocoding:** Google Maps geocoding fails ~15–30% for rural/new addresses in Vietnam. Build a fuzzy-match address normalizer using known Vietnam administrative divisions (province/district/ward from GSO data) + ML-based geocoding correction. This is a critical competitive moat for last-mile.

2. **Vietnam-aware routing:** Standard OSRM/Google Maps routing does not account for Vietnam-specific constraints (truck bans on certain Ho Chi Minh City streets, weight limits on rural bridges, ferry crossings in Mekong Delta). Build constraint layers on top of standard routing engines.

3. **COD management flow:** No global SaaS addresses Vietnam's ~65% COD rate. Custom COD reconciliation logic (driver cash collection, failed delivery re-attempt scheduling, COD aging reports) must be built.

4. **Tet/holiday demand model:** Global forecasting services don't natively model Vietnamese lunar calendar holidays. Custom feature engineering required.

---

## 6. Code Patterns

### 6.1 Core Data Models

#### Shipment + Route + Event Data Model

```sql
-- Core shipment data model (PostgreSQL)

-- Master shipment record
CREATE TABLE shipments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(32) UNIQUE NOT NULL,
    status          shipment_status NOT NULL DEFAULT 'pending',
    
    -- Parties
    shipper_id      UUID NOT NULL REFERENCES accounts(id),
    consignee_id    UUID REFERENCES accounts(id),
    carrier_id      UUID REFERENCES carriers(id),
    
    -- Locations
    origin_address_id      UUID NOT NULL REFERENCES addresses(id),
    destination_address_id UUID NOT NULL REFERENCES addresses(id),
    origin_geo      GEOGRAPHY(POINT, 4326),      -- PostGIS
    destination_geo GEOGRAPHY(POINT, 4326),
    
    -- Cargo
    declared_weight_kg   NUMERIC(10, 2),
    actual_weight_kg     NUMERIC(10, 2),
    volume_cbm           NUMERIC(8, 4),
    cargo_type           VARCHAR(64),     -- 'general', 'dangerous', 'cold_chain', 'fragile'
    declared_value_usd   NUMERIC(14, 2),
    is_cod               BOOLEAN DEFAULT FALSE,
    cod_amount_vnd       BIGINT,
    
    -- Timing
    pickup_requested_at  TIMESTAMPTZ,
    pickup_completed_at  TIMESTAMPTZ,
    delivery_eta         TIMESTAMPTZ,     -- ML-predicted ETA (updated in real-time)
    delivery_committed   TIMESTAMPTZ,     -- SLA commitment to customer
    delivered_at         TIMESTAMPTZ,
    
    -- AI fields
    demand_forecast_id   UUID,           -- link to forecast that generated this shipment
    route_plan_id        UUID,           -- link to optimized route plan
    risk_score           NUMERIC(5, 4),  -- 0-1, ML-predicted delivery failure probability
    anomaly_score        NUMERIC(5, 4),  -- fraud/anomaly signal
    
    created_at           TIMESTAMPTZ DEFAULT now(),
    updated_at           TIMESTAMPTZ DEFAULT now()
);

-- Normalized address store (Vietnam administrative divisions)
CREATE TABLE addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_address     TEXT NOT NULL,              -- as-received
    normalized_text TEXT,                       -- standardized form
    geo             GEOGRAPHY(POINT, 4326),     -- geocoded coordinates
    
    -- Vietnam admin divisions
    province_code   CHAR(2),   -- GSO province code (01=Hanoi, 79=HCMC, etc.)
    district_code   CHAR(3),
    ward_code       CHAR(5),
    
    geocode_confidence NUMERIC(4, 3),           -- 0-1 confidence score
    geocode_source  VARCHAR(32),                -- 'google', 'vn_osm', 'ml_model'
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Route plan (output of VRP solver)
CREATE TABLE route_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
    driver_id       UUID REFERENCES drivers(id),
    planned_date    DATE NOT NULL,
    
    -- Sequence of stops (ordered JSONB array)
    stops           JSONB NOT NULL,
    -- [{"sequence": 1, "shipment_id": "...", "address_id": "...", 
    --   "eta": "09:30", "service_time_min": 5, "type": "pickup"}, ...]
    
    total_distance_km    NUMERIC(10, 2),
    total_duration_min   INTEGER,
    total_weight_kg      NUMERIC(10, 2),
    total_stops          INTEGER,
    
    solver_used          VARCHAR(32),    -- 'ortools', 'pyvrp'
    solve_time_ms        INTEGER,
    objective_value      NUMERIC(14, 4), -- minimized cost/distance
    
    status          VARCHAR(16) DEFAULT 'draft',  -- draft, assigned, active, completed
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Time-series shipment events (TimescaleDB hypertable)
CREATE TABLE shipment_events (
    id              UUID DEFAULT gen_random_uuid(),
    shipment_id     UUID NOT NULL REFERENCES shipments(id),
    event_type      VARCHAR(64) NOT NULL,
    -- 'status_changed', 'gps_ping', 'pod_captured', 
    -- 'exception_raised', 'eta_updated', 'customs_cleared'
    
    occurred_at     TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now(),
    
    -- Event payload (flexible)
    payload         JSONB,
    -- For gps_ping: {"lat": 10.762, "lng": 106.660, "speed_kmh": 45, "heading": 270}
    -- For status_changed: {"from": "in_transit", "to": "delivered", "reason": "pod_captured"}
    -- For eta_updated: {"old_eta": "14:30", "new_eta": "15:15", "reason": "traffic_delay"}
    
    -- Location snapshot
    geo             GEOGRAPHY(POINT, 4326),
    
    PRIMARY KEY (shipment_id, occurred_at, id)
);

-- Convert to TimescaleDB hypertable (partitioned by time)
SELECT create_hypertable('shipment_events', 'occurred_at', 
                          chunk_time_interval => INTERVAL '1 week');
SELECT add_compression_policy('shipment_events', INTERVAL '30 days');
```

### 6.2 ML Pipeline for Demand Forecasting

```python
# demand_forecasting_pipeline.py
# Typical MLOps pipeline for logistics demand forecasting
# Tools: Apache Airflow (orchestration), MLflow (tracking), 
#        LightGBM + Prophet (models), SageMaker (deployment)

import mlflow
import mlflow.lightgbm
import pandas as pd
import numpy as np
from prophet import Prophet
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_percentage_error
from prefect import flow, task  # or Airflow DAG equivalent

# ── Step 1: Feature Engineering ──────────────────────────────────────────────
@task
def engineer_features(raw_df: pd.DataFrame, 
                       location_id: str) -> pd.DataFrame:
    """
    Build feature matrix for demand forecasting.
    raw_df: daily shipment volumes per location, SKU, or route.
    """
    df = raw_df.copy().sort_values('date')
    
    # Lag features
    for lag in [7, 14, 21, 28, 35, 42, 56]:
        df[f'lag_{lag}d'] = df['volume'].shift(lag)
    
    # Rolling statistics
    for window in [7, 14, 28]:
        df[f'roll_mean_{window}d'] = df['volume'].rolling(window).mean()
        df[f'roll_std_{window}d']  = df['volume'].rolling(window).std()
    
    # Vietnamese calendar features
    df['day_of_week']   = df['date'].dt.dayofweek
    df['week_of_year']  = df['date'].dt.isocalendar().week.astype(int)
    df['month']         = df['date'].dt.month
    df['is_weekend']    = df['day_of_week'].isin([5, 6]).astype(int)
    df['is_tet']        = df['date'].apply(is_tet_period)        # custom function
    df['days_to_tet']   = df['date'].apply(days_until_tet)       # custom function
    df['is_double_day'] = df['date'].apply(is_shopee_double_day) # 11/11, 12/12
    df['is_public_holiday'] = df['date'].apply(is_vietnam_holiday)
    
    # External signals (if available)
    # df['fuel_price_idx'] = ...  # from MOF monthly fuel price data
    # df['weather_impact'] = ...  # from NCHMF weather API
    
    return df.dropna()


# ── Step 2: Model Training with MLflow Tracking ───────────────────────────────
@task
def train_lgbm_forecast(features_df: pd.DataFrame, 
                         horizon_days: int = 14) -> dict:
    """Train LightGBM demand forecasting model with time-series CV."""
    
    feature_cols = [c for c in features_df.columns 
                    if c not in ['date', 'volume', 'location_id']]
    X = features_df[feature_cols].values
    y = features_df['volume'].values
    
    # Time-series cross-validation (no future leakage)
    tscv = TimeSeriesSplit(n_splits=5, test_size=horizon_days)
    cv_mapes = []
    
    params = {
        'objective': 'regression_l1',  # MAE loss (robust to outliers)
        'learning_rate': 0.05,
        'num_leaves': 31,
        'feature_fraction': 0.8,
        'bagging_fraction': 0.8,
        'bagging_freq': 5,
        'min_child_samples': 20,
        'n_estimators': 500,
        'early_stopping_rounds': 50,
        'verbose': -1,
    }
    
    with mlflow.start_run(run_name=f"lgbm_demand_{location_id}"):
        mlflow.log_params(params)
        mlflow.log_param('horizon_days', horizon_days)
        mlflow.log_param('feature_count', len(feature_cols))
        
        for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]
            
            model = lgb.LGBMRegressor(**params)
            model.fit(X_train, y_train, 
                      eval_set=[(X_val, y_val)],
                      callbacks=[lgb.early_stopping(50), lgb.log_evaluation(0)])
            
            preds = model.predict(X_val)
            preds = np.maximum(preds, 0)  # Non-negative volumes
            fold_mape = mean_absolute_percentage_error(y_val, preds + 1)  # +1 avoids /0
            cv_mapes.append(fold_mape)
        
        mean_mape = np.mean(cv_mapes)
        mlflow.log_metric('cv_mean_mape', mean_mape)
        mlflow.log_metric('cv_std_mape', np.std(cv_mapes))
        
        # Final model on all data
        final_model = lgb.LGBMRegressor(**params)
        final_model.fit(X, y)
        
        # Feature importance
        importance_df = pd.DataFrame({
            'feature': feature_cols,
            'importance': final_model.feature_importances_
        }).sort_values('importance', ascending=False)
        mlflow.log_dict(importance_df.to_dict(), 'feature_importance.json')
        
        # Log model
        mlflow.lightgbm.log_model(final_model, 'model',
                                   registered_model_name='logistics_demand_lgbm')
        
        print(f"CV MAPE: {mean_mape:.2%} ± {np.std(cv_mapes):.2%}")
        return {'model': final_model, 'mape': mean_mape, 'features': feature_cols}


# ── Step 3: Inference Service ────────────────────────────────────────────────
# FastAPI endpoint for on-demand forecast (called by TMS/WMS)

from fastapi import FastAPI
import mlflow.pyfunc

app = FastAPI(title="MAESTRO Demand Forecast Service")

# Load model from MLflow registry at startup
model_uri = "models:/logistics_demand_lgbm/Production"
loaded_model = mlflow.pyfunc.load_model(model_uri)

@app.post("/forecast/{location_id}")
async def get_forecast(location_id: str, 
                        horizon_days: int = 14) -> dict:
    """
    Real-time demand forecast for a given location/route.
    Returns daily volume predictions with confidence intervals.
    """
    # Build feature vector for future dates
    features = build_future_features(location_id, horizon_days)
    
    predictions = loaded_model.predict(features)
    predictions = np.maximum(predictions, 0)
    
    # Add uncertainty bounds (±1.5× rolling std as simple CI)
    recent_std = get_recent_std(location_id)
    
    return {
        "location_id": location_id,
        "horizon_days": horizon_days,
        "forecasts": [
            {
                "date": str(features.iloc[i]['date'].date()),
                "predicted_volume": round(float(predictions[i]), 1),
                "lower_bound": round(max(0, float(predictions[i]) - 1.5 * recent_std), 1),
                "upper_bound": round(float(predictions[i]) + 1.5 * recent_std, 1),
            }
            for i in range(horizon_days)
        ],
        "model_version": "lgbm_v2",
        "generated_at": datetime.utcnow().isoformat()
    }


# ── Step 4: Monitoring (Airflow DAG trigger) ─────────────────────────────────
@task
def monitor_forecast_drift(location_id: str, 
                             lookback_days: int = 7) -> dict:
    """
    Compare recent actuals vs. forecasts.
    Trigger retraining if MAPE exceeds threshold.
    """
    from evidently.report import Report
    from evidently.metric_preset import RegressionPreset
    
    actuals = fetch_actuals(location_id, lookback_days)
    forecasts = fetch_forecasts(location_id, lookback_days)
    
    report = Report(metrics=[RegressionPreset()])
    report.run(reference_data=forecasts, current_data=actuals)
    
    mape = compute_mape(actuals['volume'], forecasts['predicted_volume'])
    
    if mape > 0.20:  # >20% MAPE triggers retraining
        trigger_retraining.submit(location_id)
        return {"status": "retrain_triggered", "mape": mape}
    
    return {"status": "ok", "mape": mape}
```

### 6.3 Architecture Diagram Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MAESTRO I06 — Full Architecture                  │
├─────────────────────────────────────────────────────────────────────┤
│  DATA SOURCES                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Smartlog  │ │ GPS/IoT  │ │  ERP     │ │ Carrier  │ │ E-comm   │ │
│  │TMS/WMS   │ │ Devices  │ │SAP/Oracle│ │   APIs   │ │ Platform │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │            │            │             │            │       │
├───────┴────────────┴────────────┴─────────────┴────────────┴───────┤
│  INTEGRATION LAYER                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  API Gateway (Kong)  │  CDC (Debezium)  │  IoT Core (MQTT) │   │
│  └──────────────────────────────┬──────────────────────────────┘   │
│                                 │                                   │
├─────────────────────────────────▼───────────────────────────────────┤
│  EVENT BUS                                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Apache Kafka (MSK) — 8 core topics             │   │
│  └────────────────────────┬────────────────────────────────────┘   │
│               ┌───────────┴──────────────┐                         │
├───────────────▼──────────────────────────▼─────────────────────────┤
│  PROCESSING LAYER                                                   │
│  ┌───────────────────────┐  ┌─────────────────────────────────┐   │
│  │  Apache Flink         │  │  Apache Airflow (Orchestration) │   │
│  │  (Real-time Streaming)│  │  (Batch ETL + ML Pipeline DAGs) │   │
│  └──────────┬────────────┘  └────────────────┬────────────────┘   │
│             │                                 │                    │
├─────────────▼─────────────────────────────────▼────────────────────┤
│  STORAGE LAYER                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │Postgres  │ │  Redis   │ │  S3 +    │ │Redshift/ │             │
│  │+Timescale│ │ (Cache + │ │Delta Lake│ │ClickHouse│             │
│  │(OLTP+GPS)│ │ Streams) │ │ (Raw/ML) │ │(Analytics│             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  AI/ML LAYER                                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Forecast  │ │  Route   │ │ Document │ │ Anomaly  │ │  RAG     │ │
│  │Service   │ │Optimizer │ │   AI     │ │Detector  │ │ Chatbot  │ │
│  │(B01)     │ │(B03)     │ │(B11/B02) │ │(B07)     │ │(B08)     │ │
│  │Prophet+  │ │OR-Tools+ │ │PaddleOCR │ │IForest+  │ │LangChain │ │
│  │LightGBM  │ │PyVRP     │ │+GPT-4o   │ │LSTM-AE   │ │+pgvector │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                                     │
│  MLflow (Experiment Tracking + Registry) │ SageMaker (Endpoints)  │
│  Evidently AI (Drift Monitoring)         │ Feast (Feature Store)  │
├─────────────────────────────────────────────────────────────────────┤
│  APPLICATION LAYER                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Smartlog TMS/WMS Portal (Next.js)                         │   │
│  │  Mobile Driver App │ Operations Dashboard │ Client Portal  │   │
│  │  Zalo OA Chatbot   │ REST API for Partners                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Sources

### Technical Architecture & Infrastructure
- [Apache Kafka Documentation — Confluent](https://docs.confluent.io/platform/current/kafka/introduction.html)
- [TimescaleDB for Time-Series Workloads — Timescale](https://docs.timescale.com/timescaledb/latest/overview/)
- [Delta Lake Documentation — Linux Foundation](https://docs.delta.io/latest/index.html)
- [MLflow Documentation — Databricks/LF](https://mlflow.org/docs/latest/index.html)
- [OR-Tools VRPTW Guide — Google Developers](https://developers.google.com/optimization/routing/vrptw)
- [PyVRP — State-of-Art VRPTW Solver](https://pyvrp.org/)
- [AWS SageMaker MLOps — Amazon](https://docs.aws.amazon.com/sagemaker/latest/dg/mlops.html)
- [Feast Feature Store Documentation](https://docs.feast.dev/)
- [Evidently AI Monitoring](https://docs.evidentlyai.com/)

### AI Libraries & Benchmarks
- [NeuralForecast — Nixtla OSS](https://nixtla.github.io/neuralforecast/)
- [Prophet Documentation — Meta](https://facebook.github.io/prophet/docs/quick_start.html)
- [PaddleOCR — Baidu Research](https://github.com/PaddlePaddle/PaddleOCR)
- [LangChain Documentation](https://python.langchain.com/docs/get_started/introduction)
- [pgvector — PostgreSQL Vector Extension](https://github.com/pgvector/pgvector)
- [PyOD: Python Outlier Detection Toolkit](https://pyod.readthedocs.io/)
- [River — Online Machine Learning](https://riverml.xyz/)

### Architecture Patterns
- [Event-Driven Architecture for Logistics — Confluent Blog](https://www.confluent.io/blog/event-driven-architecture-for-logistics/)
- [Kappa Architecture — O'Reilly](https://www.oreilly.com/radar/questioning-the-lambda-architecture/)
- [gRPC vs REST for Microservices — Google Cloud](https://cloud.google.com/blog/products/api-management/understanding-grpc-openapi-and-rest-and-when-to-use-them)
- [MLOps Maturity Model — Microsoft Azure](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/mlops-maturity-model)
- [Microservices Patterns — Chris Richardson](https://microservices.io/patterns/)

### Integration & IoT
- [AWS IoT Core Documentation](https://docs.aws.amazon.com/iot/latest/developerguide/what-is-aws-iot.html)
- [EMQX MQTT Broker](https://www.emqx.io/docs/en/latest/)
- [Debezium CDC Documentation](https://debezium.io/documentation/reference/stable/)
- [VNACCS Electronic Customs — Vietnam General Department of Customs](https://www.customs.gov.vn/index.jsp?pageId=5)

### Vietnam Market Context
- [OpenStreetMap Vietnam Data](https://download.geofabrik.de/asia/vietnam.html)
- [Vietnam GSO Administrative Divisions](https://www.gso.gov.vn/)
- [Zalo OA Developer Documentation](https://developers.zalo.me/docs/zalo-official-account)
- [AWS Pricing — ap-southeast-1 (Singapore)](https://aws.amazon.com/pricing/)

### Research Papers
- [Leveraging LLMs in Logistics Tech — IJCTT 2025](https://www.ijcttjournal.org/2025/Volume-73%20Issue-5/IJCTT-V73I5P117.pdf)
- [A systematic analysis of generative AI for supply chain transformation — ScienceDirect 2025](https://www.sciencedirect.com/science/article/pii/S2949863525000883)
- [AI-enhanced Digital Twin systems for warehouse logistics — ScienceDirect 2026](https://www.sciencedirect.com/science/article/pii/S2405959526000093)
- [PyVRP: A High-Performance VRP Solver — INFORMS 2024](https://pubsonline.informs.org/doi/10.1287/ijoc.2023.1296)
