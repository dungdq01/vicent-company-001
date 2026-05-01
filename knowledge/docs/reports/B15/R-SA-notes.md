# Solution Architect Notes: Simulation & Digital Twin (B15)

## 1. Overview

The Solution Architect designs the end-to-end architecture for digital twin platforms, making technology choices that balance capability, cost, and integration complexity. This role defines reference architectures, selects between build vs buy, and ensures the platform integrates with existing industrial systems (SCADA, MES, ERP).

## 2. Digital Twin Taxonomy

### Twin Types (by Scope)
- **Asset Twin** — single machine or component (motor, pump, turbine). Focused on condition monitoring and predictive maintenance.
- **Process Twin** — production line or business process. Models material flow, throughput, quality.
- **System Twin** — entire facility or interconnected systems. Factory-wide optimization, energy management.
- **Network Twin** — supply chain or distributed infrastructure. Multi-site coordination.

### Twin Types (by Capability)
| Level | Capability | Data Flow | Example |
|-------|-----------|-----------|---------|
| L1: Descriptive | Mirror physical state | One-way (physical→digital) | 3D visualization + sensor overlay |
| L2: Informative | Analytics and insights | One-way + analytics | Anomaly detection, KPI dashboards |
| L3: Predictive | Forecast future states | Bidirectional analysis | Predictive maintenance, what-if |
| L4: Prescriptive | Recommend actions | Bidirectional + optimization | Process optimization, scheduling |
| L5: Autonomous | Self-optimizing | Closed-loop control | Autonomous process control |

## 3. Reference Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│   3D Visualization │ Dashboards │ Mobile │ Alerts │ Reports │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
│   Twin State API │ Scenario Mgmt │ Simulation Engine │ ML  │
├─────────────────────────────────────────────────────────────┤
│                    Platform Layer                           │
│   Data Ingestion │ Stream Processing │ Job Scheduler │ Auth│
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│   Time-Series DB │ Object Storage │ Model Registry │ Cache │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                     │
│   Kubernetes │ GPU Nodes │ IoT Gateway │ Edge Computing    │
├─────────────────────────────────────────────────────────────┤
│                    Physical Layer                           │
│   Sensors │ PLCs │ SCADA │ Actuators │ Edge Devices        │
└─────────────────────────────────────────────────────────────┘
```

## 4. Technology Selection

### Platform Options
| Platform | Type | Strengths | Limitations | Cost |
|----------|------|-----------|-------------|------|
| Azure Digital Twins | Managed PaaS | Graph-based modeling, DTDL, Azure integration | Azure lock-in, limited simulation | $$$ |
| NVIDIA Omniverse | Simulation platform | Photorealistic, USD, physics simulation | GPU-heavy, learning curve | $$$$ |
| AWS IoT TwinMaker | Managed PaaS | S3/IoT integration, Grafana plugin | Less mature, limited 3D | $$ |
| Eclipse Ditto | Open-source | No vendor lock-in, lightweight | DIY integration, no simulation | $ |
| Custom (open-source stack) | Build | Full control, no license cost | Engineering effort | $-$$ |

### Recommended Stack by Scenario
- **Enterprise with Azure ecosystem** — Azure Digital Twins + IoT Hub + Synapse.
- **High-fidelity visualization needed** — NVIDIA Omniverse + custom backend.
- **Cost-sensitive / startup** — Eclipse Ditto + custom simulation + Three.js frontend.
- **Vietnamese market entry** — custom open-source stack for flexibility and cost control.

## 5. Integration with Existing Systems

### SCADA Integration
- Read process variables via OPC-UA from SCADA historians (OSIsoft PI, Wonderware).
- Unidirectional data flow (SCADA → Twin) for safety; bidirectional only for L5 autonomous twins.
- Protocol translation layer to normalize diverse SCADA vendor formats.

### MES (Manufacturing Execution System)
- Integrate production orders, batch records, quality data via REST APIs or message queues.
- Map MES work orders to simulation scenarios for production planning twins.
- Vendors: Siemens Opcenter, Rockwell Plex, MPDV.

### ERP Integration
- SAP/Oracle integration for asset master data, maintenance orders, inventory.
- Use middleware (MuleSoft, Dell Boomi) or direct API integration.
- Sync asset hierarchy: ERP asset structure → twin model structure.

### Data Historian
- Connect to existing historians (OSIsoft PI, Honeywell PHD, GE Proficy) for historical sensor data.
- Backfill twin state from historian for training and validation.

## 6. Edge vs Cloud Architecture

### Edge Processing (Factory Floor)
- Real-time twin updates with < 100ms latency.
- Operates during cloud connectivity loss.
- Limited compute: lightweight surrogates, rule-based logic.
- Hardware: NVIDIA Jetson, Intel NUC, industrial PCs.

### Cloud Processing
- Heavy simulation workloads (FEM, CFD, parameter sweeps).
- Long-term storage and analytics.
- Multi-site aggregation and comparison.
- ML training and surrogate model development.

### Hybrid Pattern
```
Edge: Sensor ingestion → Local twin state → Real-time alerts → Buffered upload
Cloud: Historical analysis → Simulation → ML training → Model deployment to edge
```

## 7. Scalability Patterns

- **Horizontal scaling** — each asset twin runs as independent microservice; add instances as assets grow.
- **Event-driven architecture** — Kafka/EventBridge for decoupling producers and consumers.
- **CQRS** — separate read (twin state queries) and write (sensor ingestion) paths.
- **Sharding** — partition by facility or asset group for multi-site deployments.
- **Caching** — Redis for current twin state; CDN for 3D model assets.
- Target: support 10,000+ asset twins with 100,000+ sensor streams.

## 8. Cost Architecture

### Cost Drivers
- Compute: GPU instances for simulation and ML (50-70% of cost).
- Storage: time-series data retention (10-20%).
- Networking: IoT data ingestion, edge-cloud communication (5-10%).
- Licensing: commercial simulation software, if used (variable).

### Cost Optimization
- Tiered compute: spot for batch, reserved for real-time, on-demand for burst.
- Data lifecycle: hot → warm → cold storage policies.
- Right-size GPU instances: T4 for inference, A100 only for training.
- Open-source simulation tools (OpenFOAM, FEniCS) vs commercial licenses.

## 9. Recommendations

1. Start with Asset Twins (L2-L3) for a single production line — prove value before scaling to system twins.
2. Choose open-source stack for Vietnamese market — flexibility, cost control, no vendor lock-in.
3. Design hybrid edge-cloud from the start — Vietnamese factories may have unreliable connectivity.
4. Integrate with existing SCADA/MES before building new sensors — leverage existing data sources.
5. Plan for multi-site from architecture phase — even if starting with one factory.
6. Budget 60-70% of platform cost for compute (GPU) — this is the dominant cost driver.
