# Technical Architecture Report: I04 — Manufacturing
**Agent:** R-β (Dr. Praxis)
**Date:** 2026-04-03
**Module:** Phase 2 — Industry I04
**Depth:** L2 (Technical Architecture)
**Companion Report:** R-α Research Report (Dr. Archon, 2026-04-03)

---

## Executive Summary

This report translates the market and AI-adoption findings from R-α into actionable technical architecture specifications for the MAESTRO I04 Manufacturing module. Vietnam's manufacturing sector operates at a bimodal AI maturity: FDI factories (Samsung, Intel, LG) deploy L2–L3 AI platforms inherited from global parent companies, while domestic SME manufacturers remain largely at L0–L1 with no sensor data and no ML baseline.

The recommended architecture is IIoT-first at the field layer, edge-AI at the factory floor, and cloud-native at the analytics and model-serving layer. It is designed for incremental deployment — a Vietnamese Tier 2/3 supplier can start with a single OPC-UA gateway and one vision inspection station and expand to a full predictive maintenance + digital twin + scheduling platform without re-architecting.

Key technology bets: OPC-UA as the universal protocol bridge, NVIDIA Jetson Orin as the preferred edge AI hardware, TimescaleDB for time-series storage, YOLOv11 for visual defect detection, OR-Tools CP-SAT for production scheduling, and MLflow + AWS SageMaker for MLOps.

---

## 1. AI Tech Stack for Manufacturing

### 1.1 IIoT Stack: Field to Cloud

The manufacturing data stack follows a strict hierarchy inherited from the ISA-95/Purdue model, extended with modern AI-serving capabilities at each layer.

```
┌─────────────────────────────────────────────────────────────────────┐
│  LEVEL 4 — ENTERPRISE (Cloud AI Platform)                           │
│  AWS IoT Core / Azure IoT Hub → Data Lake → ML Training → Dashboards│
├─────────────────────────────────────────────────────────────────────┤
│  LEVEL 3 — PLANT (MES + ERP Integration)                            │
│  SAP ME / Siemens Opcenter / Odoo Manufacturing → Production KPIs   │
├─────────────────────────────────────────────────────────────────────┤
│  LEVEL 2 — SUPERVISION (SCADA + Historian)                          │
│  Wonderware / Ignition SCADA → OPC-UA Server → Edge Gateway         │
├─────────────────────────────────────────────────────────────────────┤
│  LEVEL 1 — CONTROL (PLC + Edge AI)                                  │
│  Siemens S7-1500 / Mitsubishi FX5U / Delta DVP → NVIDIA Jetson Orin │
├─────────────────────────────────────────────────────────────────────┤
│  LEVEL 0 — FIELD (Sensors + Actuators)                              │
│  Vibration / Thermal / Current / Vision / Flow / Pressure sensors   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Protocol Stack by Layer

| Layer | Protocol | Justification |
|---|---|---|
| PLC → SCADA | Profinet (Siemens), EtherNet/IP (Rockwell), CC-Link (Mitsubishi) | Vendor-specific fieldbus — already installed in existing factories |
| PLC/SCADA → Edge Gateway | **OPC-UA** (primary), Modbus TCP (legacy fallback) | OPC-UA is IEC 62541 standard; unified namespace; security built-in |
| Edge Gateway → Cloud | **MQTT over TLS** (AWS IoT Core / Azure IoT Hub) | Lightweight, TLS secured, suitable for constrained uplinks |
| Cloud internal | Apache Kafka (MSK) | High-throughput event streaming; decouples ingestion from processing |
| MES ↔ ERP | REST API + SAP RFC/BAPI | Standard enterprise integration; CDC via Debezium for real-time sync |

#### Cloud Platform Selection for Vietnam

| Platform | Use Case Fit | Vietnam Advantage |
|---|---|---|
| **AWS IoT Core + SageMaker** | Full IIoT-to-ML stack; managed MQTT broker; SageMaker for model training | AWS ap-southeast-1 (Singapore) is primary; 20–40ms latency from HCMC |
| **Azure IoT Hub + Azure ML** | Preferred for SAP/Microsoft ERP clients; Azure OpenAI integration | Microsoft Vietnam active; Dynamics 365 users prefer Azure |
| **Siemens Insights Hub** | End-to-end Siemens ecosystem (MindSphere → Insights Hub) | Strong at FDI factories; expensive for domestic SMEs |
| **On-premise (self-hosted)** | Air-gapped factories, IP-sensitive FDI clients | Required when foreign clients restrict data egress (common at PCB factories) |

**MAESTRO Recommendation:** AWS IoT Core as primary (widest talent pool in Vietnam, cheapest at scale); Azure IoT Hub as secondary for SAP/Dynamics-anchored clients. On-premise MinIO + TimescaleDB for air-gapped deployments.

---

### 1.2 Computer Vision Pipeline

#### Camera Hardware Selection

| Type | Technology | Best For | Vietnam Price Point |
|---|---|---|---|
| **Line Scan Camera** | CCD linear array; captures one line per trigger | High-speed continuous web inspection (textiles, PCB strips, packaging film) | USD 2,000–15,000 (Basler raL series, Dalsa) |
| **Area Scan Camera** | Full 2D frame capture; global or rolling shutter | Discrete part inspection, assembly verification, label OCR | USD 500–8,000 (Basler ace2, Hikvision industrial) |
| **3D Vision (Structured Light)** | Depth map + 2D image | Complex geometry, solder joint inspection, BGA package | USD 5,000–25,000 (Cognex In-Sight L38, Keyence LJ-X8000) |
| **Thermal / IR Camera** | Heat signature imaging | PCB hot-spot detection, food processing, electrical inspection | USD 3,000–20,000 (FLIR A series) |
| **Smart Camera (embedded AI)** | Cognex In-Sight, Keyence IV3 | Edge-inference; no PC required; factory-floor rugged | USD 3,500–12,000 |

**Camera Brands Active in Vietnam:**

| Brand | Tier | Price Range (area scan) | Vietnam Presence |
|---|---|---|---|
| **Cognex** (US) | Premium | USD 4,000–12,000 | Active via resellers; strong in electronics MNCs |
| **Basler** (Germany) | Mid-premium | USD 800–5,000 | Popular for custom vision systems; open SDK |
| **Keyence** (Japan) | Premium | USD 3,500–10,000 | Dominant in Japanese-owned factories (Honda, Denso, Nidec) |
| **Hikvision Industrial** (China) | Budget-mid | USD 200–2,000 | Growing adoption in domestic SMEs; price advantage |
| **Daheng Imaging** (China) | Budget | USD 150–1,500 | Emerging; used in cost-sensitive automation |

**Rule:** For FDI clients (Samsung-standard supplier), use Basler or Cognex — these match global supplier qualification standards. For domestic SMEs, Hikvision industrial provides 80% of the capability at 30% of the cost.

#### Lighting Selection (Critical for AI Accuracy)

```
Defect Type          → Recommended Lighting
────────────────────────────────────────────────────
Surface scratches    → Dark field (oblique) illumination
Dimensional check    → Backlight (silhouette)
PCB solder joints    → Multi-angle ring light + dome
Label/OCR reading    → Diffuse dome or coaxial
Color defects        → White diffuse LED
Specular surfaces    → Structured light / polarized
```

#### Computer Vision Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    CV PIPELINE (EDGE-FIRST)                      │
│                                                                  │
│  Trigger Signal ──→ Camera (GigE Vision / USB3)                  │
│  (encoder, PLC)       │                                          │
│                       ▼                                          │
│               Frame Capture (10–200ms cycle)                     │
│                       │                                          │
│                       ▼                                          │
│               Edge AI Node (NVIDIA Jetson Orin NX)               │
│               ├── Preprocessing (OpenCV: resize, normalize)      │
│               ├── Inference (TensorRT-optimized YOLOv11)         │
│               ├── Result: {class, confidence, bounding_box}      │
│               └── Decision: PASS / FAIL / REVIEW                 │
│                       │                                          │
│               ┌───────┴────────┐                                 │
│               ▼                ▼                                 │
│        Pass signal         Reject signal                         │
│        (to PLC: OK)        (to PLC: divert) + log defect image   │
│                                │                                 │
│                                ▼                                 │
│                      Cloud Storage (S3)                          │
│                      ├── Defect image archive                    │
│                      ├── Inference metadata (timestamp, score)   │
│                      └── Traceability record (linked to work     │
│                          order, serial number, shift)            │
└──────────────────────────────────────────────────────────────────┘
```

**Latency Budget for Real-Time QC:**

| Step | Time Budget | Notes |
|---|---|---|
| Trigger → frame capture | 1–5 ms | Hardware trigger from encoder or PLC |
| Frame transfer (GigE) | 5–15 ms | Depends on resolution (2MP: ~8ms) |
| Preprocessing (OpenCV) | 2–5 ms | GPU-accelerated on Jetson |
| YOLOv11 inference | 8–25 ms | Jetson Orin NX (10W): ~15ms for 640×640 |
| Post-processing + decision | 1–2 ms | NMS, threshold check |
| Signal to PLC | 1–3 ms | Digital I/O or EtherNet/IP |
| **Total end-to-end** | **18–55 ms** | Typical conveyor at 0.3m/s → 150ms budget |

**Inference at Edge vs. Cloud:**

| Scenario | Edge Inference | Cloud Inference |
|---|---|---|
| Conveyor line (real-time) | Mandatory (< 50ms latency) | Not viable for inline rejection |
| Batch quality audit | Optional | Viable (post-process) |
| Model that rarely changes | Preferred (no round-trip) | Flexible redeployment |
| Multiple camera nodes | Jetson per node or shared Orin | Centralized GPU server |
| Training data collection | Edge captures images → S3 | Cloud trains updated model |

---

### 1.3 Time-Series ML Stack for Predictive Maintenance

#### Storage Layer

| Database | Use Case | Vietnam Deployment |
|---|---|---|
| **TimescaleDB** (PostgreSQL extension) | General-purpose time-series; SQL familiar to most teams; compression 90%+ | Best choice: runs on any Postgres instance; AWS RDS supports it |
| **InfluxDB 3.0 (OSS)** | Purpose-built TSDB; line protocol ingestion; fast writes | Good for pure-IoT sensor pipelines; Flux/SQL query support |
| **QuestDB** | Fastest write throughput (millions/sec); SQL-native | For high-frequency data (>1kHz vibration sampling) |
| **Amazon Timestream** | Fully managed; serverless; AWS-native | For cloud-first teams with no DB ops capacity |

**MAESTRO Recommendation:** TimescaleDB for its SQL compatibility (existing PostgreSQL knowledge in Vietnam teams), excellent compression, and Grafana integration. Use QuestDB if vibration sampling exceeds 1kHz per sensor.

#### Feature Engineering for PdM

```python
import numpy as np
from scipy.fft import fft, fftfreq
from scipy.signal import welch
import pywt  # PyWavelets

def extract_vibration_features(signal: np.ndarray, 
                                 fs: float = 12800.0) -> dict:
    """
    Extract frequency-domain and statistical features from vibration signal.
    
    Args:
        signal: Raw accelerometer time-series (1D array)
        fs: Sampling frequency in Hz (12.8 kHz is industry standard for bearing analysis)
    
    Returns:
        Feature dictionary for ML model input
    """
    n = len(signal)
    
    # --- Time Domain Features ---
    features = {
        "rms": np.sqrt(np.mean(signal**2)),        # Root Mean Square — overall vibration energy
        "peak": np.max(np.abs(signal)),             # Peak amplitude
        "crest_factor": np.max(np.abs(signal)) / (np.sqrt(np.mean(signal**2)) + 1e-9),
        "kurtosis": float(np.mean((signal - np.mean(signal))**4) / 
                         (np.std(signal)**4 + 1e-9)),  # Impulsiveness indicator
        "skewness": float(np.mean((signal - np.mean(signal))**3) / 
                         (np.std(signal)**3 + 1e-9)),
    }
    
    # --- FFT Frequency Domain ---
    fft_vals = np.abs(fft(signal))[:n//2]
    fft_freqs = fftfreq(n, 1/fs)[:n//2]
    
    features["dominant_freq_hz"] = float(fft_freqs[np.argmax(fft_vals)])
    features["spectral_entropy"] = float(-np.sum(
        (fft_vals / (np.sum(fft_vals) + 1e-9)) * 
        np.log2(fft_vals / (np.sum(fft_vals) + 1e-9) + 1e-9)
    ))
    
    # --- Bearing Fault Frequency Bands ---
    # Example: 6205 bearing at 1750 RPM → BPFO=107Hz, BPFI=163Hz, BSF=71Hz
    rpm = 1750.0
    shaft_freq = rpm / 60.0  # 29.17 Hz
    bearing_freqs = {
        "bpfo": 3.583 * shaft_freq,   # Ball Pass Freq Outer race
        "bpfi": 5.417 * shaft_freq,   # Ball Pass Freq Inner race
        "bsf":  2.357 * shaft_freq,   # Ball Spin Frequency
        "ftf":  0.398 * shaft_freq,   # Fundamental Train Frequency
    }
    
    for fault_name, center_freq in bearing_freqs.items():
        # Energy in ±20Hz band around each fault frequency
        band_mask = (fft_freqs >= center_freq - 20) & (fft_freqs <= center_freq + 20)
        features[f"energy_{fault_name}"] = float(np.sum(fft_vals[band_mask]**2))
    
    # --- Wavelet Features (Daubechies 4) ---
    coeffs = pywt.wavedec(signal, "db4", level=5)
    for i, coeff in enumerate(coeffs[1:]):  # skip approximation, take details
        features[f"wavelet_energy_d{i+1}"] = float(np.sum(coeff**2))
    
    return features


def compute_bearing_fault_frequencies(rpm: float, 
                                        n_balls: int = 9,
                                        ball_diameter: float = 7.94,   # mm
                                        pitch_diameter: float = 38.5,  # mm
                                        contact_angle_deg: float = 0) -> dict:
    """
    Compute theoretical bearing fault frequencies for given geometry.
    Standard formula per SKF/NTN bearing calculation.
    """
    shaft_freq = rpm / 60.0
    beta = np.radians(contact_angle_deg)
    d_D = ball_diameter / pitch_diameter  # ratio
    
    return {
        "shaft_freq_hz": shaft_freq,
        "BPFO": (n_balls / 2) * shaft_freq * (1 - d_D * np.cos(beta)),
        "BPFI": (n_balls / 2) * shaft_freq * (1 + d_D * np.cos(beta)),
        "BSF":  (pitch_diameter / (2 * ball_diameter)) * shaft_freq * (1 - (d_D * np.cos(beta))**2),
        "FTF":  (shaft_freq / 2) * (1 - d_D * np.cos(beta)),
    }
```

#### PdM ML Model Stack

| Model | Input | Target | Notes |
|---|---|---|---|
| **Isolation Forest** | Vibration feature vector | Anomaly score | Fast baseline; unsupervised; no labeled faults needed |
| **LSTM Autoencoder** | Raw vibration time-series window | Reconstruction error | Self-supervised; anomaly = high reconstruction error |
| **XGBoost Classifier** | Feature vector | Fault class (normal/BPFO/BPFI/imbalance) | Requires labeled fault data; highest accuracy when labeled data exists |
| **Transformer (TFT)** | Multi-sensor sequence | RUL (days to failure) | State-of-art for RUL estimation; data-hungry |
| **Prophet + LightGBM** | Temperature trend, OEE trend | Days-to-maintenance | Practical for early deployment; interpretable |

**Training Data Minimum Requirements:**

| Model Type | Minimum Data | Practical Timeline |
|---|---|---|
| Isolation Forest (anomaly) | 30 days normal operation | 1 month data collection |
| LSTM Autoencoder | 60–90 days normal operation | 2–3 months |
| XGBoost (fault classification) | 50+ examples per fault class | Often requires synthetic augmentation |
| Transformer RUL | Full failure cycle data (run-to-failure) | Rare — use transfer learning from NASA C-MAPSS dataset |

---

### 1.4 MES Integration

#### MES Platform Options for Vietnam

| MES | Type | Cost (annual) | Vietnam Fit |
|---|---|---|---|
| **SAP Manufacturing Execution (ME)** | Enterprise | USD 100K–500K+ | FDI factories with SAP backbone (Toyota, Hyundai) |
| **Siemens Opcenter Execution** | Enterprise | USD 80K–300K+ | Siemens-PLC-heavy factories; strong WIP tracking |
| **Rockwell Plex MES** | Cloud MES | USD 40K–150K | US OEM supplier factories; strong genealogy/traceability |
| **Odoo Manufacturing (+ MES extension)** | Open Core | USD 10–50/user/month | Best for Vietnam SMEs; covers production orders, BoM, QC |
| **OpenMES / Camstar (legacy)** | OSS / legacy | Free / low | Legacy install base; limited AI integration capability |
| **ERPNext Manufacturing** | Open Source | Free + implementation | Viable for sub-100 employee factories; community support |

**MAESTRO Recommendation for Vietnam SMEs:** Odoo Manufacturing as the MES layer — it is well-adopted in Vietnam (many local implementation partners), covers production orders + bill of materials + quality inspection + inventory, and exposes a clean REST API for AI integration.

#### MES-to-AI Integration Pattern

```
Production Order Created (Odoo MES)
    │
    ├──→ Kafka Topic: `mes.production.order.created`
    │       Payload: {order_id, product_sku, qty, planned_start, machine_id, shift}
    │
    ├──→ AI Scheduling Service: Can this order be optimized? (OR-Tools)
    │       Returns: revised_start_time, bottleneck_machine, buffer_recommendation
    │
    └──→ Quality Plan Service: Which inspection checkpoints apply?
            Returns: inspection_steps[], sampling_plan, critical_parameters[]

Work-In-Progress Update (PLC OPC-UA → MES)
    │
    └──→ Kafka Topic: `mes.wip.update`
            Payload: {order_id, op_step, qty_good, qty_reject, cycle_time, machine_state}
            → Feeds: OEE calculation, defect rate anomaly detection, yield prediction

Production Order Complete
    │
    └──→ Kafka Topic: `mes.order.completed`
            → Triggers: ERP goods receipt posting, quality certificate generation (B01)
```

---

### 1.5 ERP Integration for Production Scheduling

#### ERP Landscape — Manufacturing in Vietnam

| ERP | Market Segment | Integration Method for AI |
|---|---|---|
| **SAP S/4HANA** (SAP PP module) | Large FDI, large domestic (Hoa Phat, VinFast) | SAP BTP Integration Suite; OData APIs; BW/HANA data extraction |
| **SAP Business One** (SAP B1) | Mid-market domestic | DI API (COM-based); REST via SAP B1 Service Layer |
| **Oracle Manufacturing Cloud** | Large enterprises, PTSC | Oracle Integration Cloud (OIC); FBDI data loading |
| **Bravo** (Vietnamese ERP) | Vietnamese domestic mid-market | Custom REST adapter; CSV export → ETL (limited API maturity) |
| **MISA AMIS Manufacturing** | Vietnamese SMEs | REST API (MISA Open Platform); basic production tracking |
| **FAST Accounting** | Vietnamese SMEs | File-based exchange; very limited API |

**Vietnamese ERP Reality:** Bravo and MISA dominate the domestic SME manufacturing segment. Both have limited API maturity — REST APIs exist but are not production-grade for real-time AI integration. Practical approach: use scheduled pulls every 15–60 minutes, or implement a lightweight change-data-capture layer via database triggers.

#### SAP PP → AI Scheduling Integration

```python
# Pattern: Extract SAP planned orders → enrich with AI scheduling → write back
import requests
from datetime import datetime

class SAPProductionConnector:
    """
    Integrates SAP PP planned orders with AI scheduling service.
    Uses SAP S/4HANA OData API (Production Planning namespace).
    """
    
    def __init__(self, sap_base_url: str, client_id: str, client_secret: str):
        self.base_url = sap_base_url
        self.token = self._authenticate(client_id, client_secret)
    
    def get_planned_orders(self, plant: str, date_from: str, date_to: str) -> list:
        """Fetch open planned production orders from SAP PP."""
        endpoint = f"{self.base_url}/sap/opu/odata/sap/API_PLANNED_ORDERS/PlannedOrder"
        params = {
            "$filter": f"ProductionPlant eq '{plant}' and PlannedOrderOpeningDate ge datetime'{date_from}T00:00:00'",
            "$select": "PlannedOrder,Material,TotalQuantity,ProductionStartDate,ProductionEndDate,WorkCenter",
            "$format": "json"
        }
        response = requests.get(endpoint, params=params, headers={"Authorization": f"Bearer {self.token}"})
        return response.json()["d"]["results"]
    
    def write_back_schedule(self, order_id: str, revised_start: datetime, 
                             revised_end: datetime) -> bool:
        """Update SAP planned order with AI-optimized schedule."""
        endpoint = f"{self.base_url}/sap/opu/odata/sap/API_PLANNED_ORDERS/PlannedOrder('{order_id}')"
        payload = {
            "ProductionStartDate": f"/Date({int(revised_start.timestamp() * 1000)})/",
            "ProductionEndDate": f"/Date({int(revised_end.timestamp() * 1000)})/",
        }
        response = requests.patch(endpoint, json=payload,
                                   headers={"Authorization": f"Bearer {self.token}",
                                            "Content-Type": "application/json"})
        return response.status_code == 204
```

---

### 1.6 MLOps for Manufacturing

Manufacturing AI has unique MLOps challenges: production shift changes, new product introductions, and seasonal demand patterns all cause model drift.

#### MLOps Maturity Model (Manufacturing-Specific)

| Level | Capability | Key Challenge | Technologies |
|---|---|---|---|
| **L0** | Notebook + manual deployment | No versioning, no monitoring | Jupyter, pandas |
| **L1** | MLflow tracking, Docker, batch retraining monthly | Manual trigger, no drift detection | MLflow, Docker, Airflow |
| **L2** | CI/CD for models, automated retraining, data quality gates | Shift-aware feature engineering | MLflow + SageMaker, Great Expectations, GitHub Actions |
| **L3** | Real-time drift detection, shadow mode, A/B testing | New product → model cold start | Evidently AI, Seldon Core, feature store |
| **L4** | Continual learning, synthetic data augmentation, agentic retraining | Edge model sync | Ray Train, Nvidia TAO toolkit, federated ML |

**Manufacturing-Specific Drift Triggers:**

```python
# Pattern: Manufacturing drift detection with shift awareness
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset
from evidently import ColumnMapping
import pandas as pd

def detect_manufacturing_drift(reference_data: pd.DataFrame,
                                 current_data: pd.DataFrame,
                                 shift_id: str) -> dict:
    """
    Detect drift accounting for shift effects (different operators,
    ambient temperature variations, raw material lot changes).
    
    Returns dict with {drifted: bool, drifted_features: list, severity: str}
    """
    # Remove shift-specific columns from drift detection 
    # (they legitimately change and should not trigger false drift alarms)
    exclude_columns = ["shift_id", "operator_id", "ambient_temp_c"]
    feature_columns = [c for c in reference_data.columns 
                       if c not in exclude_columns and c != "label"]
    
    column_mapping = ColumnMapping(
        target="label",
        numerical_features=[c for c in feature_columns if reference_data[c].dtype in ["float64", "int64"]],
        categorical_features=[c for c in feature_columns if reference_data[c].dtype == "object"]
    )
    
    report = Report(metrics=[DataDriftPreset(drift_share=0.2)])  # 20% feature drift = alert
    report.run(reference_data=reference_data[feature_columns + ["label"]],
               current_data=current_data[feature_columns + ["label"]],
               column_mapping=column_mapping)
    
    result = report.as_dict()
    drifted_features = [
        m["result"]["column_name"] 
        for m in result["metrics"][1]["result"]["drift_by_columns"].values()
        if m["result"]["drift_detected"]
    ]
    
    return {
        "shift_id": shift_id,
        "drifted": len(drifted_features) > 0,
        "drifted_features": drifted_features,
        "severity": "HIGH" if len(drifted_features) > 3 else "MEDIUM" if drifted_features else "NONE",
        "retraining_recommended": len(drifted_features) >= 2
    }
```

**New Product Introduction (NPI) Cold Start Solution:**

When a factory introduces a new product, the vision model has zero training data. Solutions:
1. **Few-shot learning** (Cognex ViDi, Landing AI): 5–20 images sufficient for edge learning models
2. **Synthetic data generation** (NVIDIA Omniverse + Blender): Render photorealistic defect images from 3D CAD model
3. **Transfer learning**: Fine-tune base YOLOv11 model on 50–200 new product images (2–4 hours GPU time on V100)
4. **Rule-based fallback**: Use dimensional checks while vision AI accumulates data

---

## 2. Architecture Patterns

### 2.1 Edge AI Hardware Comparison for Factory Floor

| Hardware | AI Performance | Power | Price (2025) | Best For |
|---|---|---|---|---|
| **NVIDIA Jetson Orin NX 16GB** | 100 TOPS | 10–25W | USD 500–700 | YOLOv11 real-time inspection, multi-camera (2–4 streams) |
| **NVIDIA Jetson Orin Nano 8GB** | 40 TOPS | 5–10W | USD 200–300 | Single-camera inspection, PdM anomaly scoring |
| **NVIDIA Jetson AGX Orin** | 275 TOPS | 15–60W | USD 1,000–1,200 | Multi-line inspection, digital twin edge node |
| **Intel Core i7 + OpenVINO** | ~15 TOPS (iGPU) | 65W | USD 400–600 | Moderate throughput; OpenVINO toolkit optimizes Intel NNs |
| **Google Coral TPU (Dev Board)** | 4 TOPS (USB) | 2W | USD 60–150 | Ultra-low power; limited to small models (MobileNet) |
| **ADLINK MXE-5500 (Atom)** | CPU-only | 15W | USD 800–1,200 | Industrial rugged; DIN-rail mount; OpenVINO; not GPU-class |

**Winner for Vietnam factories:** NVIDIA Jetson Orin NX 16GB. Reasons:
- Runs YOLOv11 at 640×640 in 15ms (2–4 camera streams simultaneously)
- TensorRT optimization gives 3–5× speedup over PyTorch baseline
- CUDA-accelerated OpenCV preprocessing
- NVIDIA Metropolis SDK for factory AI pipeline
- IP30 ruggedized carrier boards available (Seeed reComputer J4012, ConnectTech Photon)
- Wide availability in Vietnam (Hanoi/HCMC electronics distributors)

**OpenVINO use case:** Intel OpenVINO is the right choice when the factory already runs Intel industrial PCs (ADLINK, Advantech) and wants to avoid NVIDIA licensing. OpenVINO optimizes YOLOv11 for CPU + iGPU inference with minimal code change.

```python
# NVIDIA TensorRT deployment for Jetson — YOLOv11 optimized
from ultralytics import YOLO
import tensorrt as trt
import numpy as np

# Export to TensorRT engine once (done offline, not on production line)
model = YOLO("yolov11n.pt")  # nano variant: fastest inference
model.export(format="engine",  
             device=0,        # CUDA device
             half=True,       # FP16 quantization — 2× speedup, minimal accuracy loss
             imgsz=640,
             batch=1)         # batch=1 for real-time inference

# Production inference (runs on Jetson Orin)
engine_model = YOLO("yolov11n.engine")

def inspect_frame(frame: np.ndarray, conf_threshold: float = 0.45) -> dict:
    """Run defect detection inference on a single camera frame."""
    results = engine_model(frame, conf=conf_threshold, verbose=False)
    detections = results[0].boxes
    
    if len(detections) == 0:
        return {"verdict": "PASS", "defects": [], "inference_ms": results[0].speed["inference"]}
    
    defects = [
        {
            "class": engine_model.names[int(d.cls)],
            "confidence": float(d.conf),
            "bbox": d.xyxy[0].tolist()
        }
        for d in detections
    ]
    
    # Critical defects trigger immediate line stop
    critical_classes = {"crack", "hole", "missing_component", "solder_bridge"}
    is_critical = any(d["class"] in critical_classes for d in defects)
    
    return {
        "verdict": "FAIL",
        "severity": "CRITICAL" if is_critical else "MINOR",
        "defects": defects,
        "inference_ms": results[0].speed["inference"]
    }
```

---

### 2.2 Hierarchical Architecture: Full Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ENTERPRISE LEVEL (Cloud)                            │
│                                                                         │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  MAESTRO AI     │  │  ERP         │  │  Digital Twin            │   │
│  │  Platform       │  │  (SAP/Oracle │  │  (Siemens Tecnomatix     │   │
│  │  (AWS/Azure)    │  │  /Bravo)     │  │   / NVIDIA Omniverse)    │   │
│  │                 │  │              │  │                          │   │
│  │  - Model Train  │  │  - Prod Plan │  │  - Factory Simulation    │   │
│  │  - Analytics    │  │  - Finance   │  │  - Asset Models          │   │
│  │  - Dashboards   │  │  - HR/Payroll│  │  - What-If Scenarios     │   │
│  └────────┬────────┘  └──────┬───────┘  └────────────┬─────────────┘   │
└───────────┼─────────────────┼──────────────────────────┼───────────────┘
            │ REST/Kafka       │ RFC/OData               │ REST/MQTT
┌───────────┼─────────────────┼──────────────────────────┼───────────────┐
│                     PLANT LEVEL                         │               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              MES (Odoo Mfg / SAP ME / Opcenter)                 │   │
│  │  - Work Orders  - Quality Inspection  - OEE Tracking            │   │
│  │  - Genealogy/Traceability  - Shift Reports  - NCR/CAPA          │   │
│  └────────────────────────────┬────────────────────────────────────┘   │
│                               │ OPC-UA / MQTT                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │          Edge AI Gateway (Jetson Orin or Industrial PC)          │   │
│  │  - Local inference (CV, anomaly detection)                       │   │
│  │  - OPC-UA client + MQTT publisher                                │   │
│  │  - Data buffering (offline resilience)                           │   │
│  └────────────────────────────┬────────────────────────────────────┘   │
└───────────────────────────────┼─────────────────────────────────────────┘
                                │ Profinet / EtherNet/IP / Modbus
┌───────────────────────────────┼─────────────────────────────────────────┐
│                     FIELD LEVEL                         │               │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ PLC          │  │ Vision       │  │ Vibration    │                  │
│  │ Siemens S7   │  │ Camera       │  │ / Thermal    │                  │
│  │ Mitsubishi   │  │ (Basler/     │  │ Sensors      │                  │
│  │ Delta DVP    │  │  Hikvision)  │  │ (ICP DAS,    │                  │
│  │              │  │              │  │  Brüel&Kjær) │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2.3 Real-Time Quality Control Loop

**Full end-to-end flow from camera trigger to traceability record:**

```
1. TRIGGER
   └─ Rotary encoder signal OR PLC digital output → Camera external trigger input
      (Trigger synchronized to part position on conveyor — 1–5ms jitter)

2. CAPTURE
   └─ Camera acquires frame (global shutter prevents motion blur at conveyor speed)
      Frame → GigE Vision → Jetson Orin buffer (DMA transfer, ~8ms for 5MP)

3. PREPROCESS
   └─ OpenCV GPU pipeline:
      ├─ Debayer (if Bayer raw) → RGB
      ├─ Undistort (lens calibration matrix)  
      ├─ ROI crop (focus on inspection zone — reduces inference time 40%)
      └─ Normalize [0,1] + resize to 640×640

4. INFERENCE
   └─ TensorRT YOLOv11 engine:
      ├─ FP16 batch=1 inference (~15ms on Orin NX)
      ├─ NMS (Non-Maximum Suppression) post-processing
      └─ Defect classification + bounding box + confidence score

5. DECISION ENGINE
   └─ Business rules applied to inference output:
      ├─ PASS: confidence < threshold OR no defect class detected
      │   → PLC output bit: OK_SIGNAL (line continues)
      ├─ FAIL: defect class detected, confidence > threshold
      │   → PLC output bit: REJECT_SIGNAL (diverter activates)
      │   → Conveyor stop if CRITICAL defect class
      └─ REVIEW: confidence in [0.4, 0.6] → route to human inspection station

6. SIGNAL TO PLC
   └─ EtherNet/IP or digital I/O (24V signal) → PLC input:
      ├─ Reject diverter actuator (pneumatic or servo)
      └─ HMI display: defect image + class + confidence

7. TRACEABILITY LOGGING
   └─ Async write (does not block rejection decision):
      ├─ Defect image → AWS S3 (compressed JPEG, <50KB)
      ├─ Inference record → TimescaleDB:
      │   {timestamp, serial_no, product_sku, work_order_id, 
      │    defect_class, confidence, bbox, verdict, shift_id}
      └─ MES update → Odoo: qty_reject++ on work order operation

8. ALERTING
   └─ If defect rate > threshold in rolling 10-minute window:
      ├─ Telegram/LINE notification → shift supervisor
      └─ Kafka event → production scheduling service (consider line adjustment)
```

---

### 2.4 Predictive Maintenance Pipeline

```
SENSOR INGESTION PIPELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━
Vibration Sensor (MEMS accelerometer, 12.8kHz)
    │
    ├─ Local DAQ (NI CompactDAQ or ICP DAS I-7052D)
    │   Downsamples to feature vector every 10 seconds
    │
    └─ OPC-UA → Edge Gateway → MQTT → AWS IoT Core

FEATURE ENGINEERING (Spark Structured Streaming on EMR)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Raw 10s windows → FFT features (RMS, kurtosis, BPFO/BPFI energy)
                → Wavelet energy per sub-band (D1–D5)
                → Rolling statistics (1hr, 8hr, 24hr trends)
                → Asset context (machine_id, age_days, last_maintenance)

ANOMALY SCORING (Real-time, Flink)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature vector (every 10s) → Isolation Forest edge model
    Score > 0.7 → "Elevated" alert
    Score > 0.85 → "Critical" alert → trigger maintenance work order

RUL FORECASTING (Batch, nightly, SageMaker)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
24hr feature aggregates → XGBoost RUL model
    Output: {machine_id, rul_days_estimate, confidence_interval, 
              recommended_action, next_inspection_date}
    → Writes to TimescaleDB + triggers MES maintenance work order if RUL < 7 days

MAINTENANCE WORK ORDER TRIGGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI recommendation → MES/ERP integration:
    {machine_id: "CNC-07", failure_mode: "BPFO bearing fault", 
     urgency: "plan_within_7_days", parts_recommended: ["SKF 6205-2Z"],
     estimated_downtime_hours: 4}
    → SAP PM work order created via RFC
    → Spare parts availability check (ERP inventory)
    → Maintenance scheduler notified (mobile app push notification)
```

---

### 2.5 Digital Twin Architecture

#### Tiers and Platform Selection

| Tier | Scope | Platform Options | Entry Cost |
|---|---|---|---|
| **Asset Digital Twin** | Single machine (CNC, motor, press) | PTC ThingWorx + Vuforia, Node-RED + Grafana + 3D model | USD 10K–50K |
| **Process Digital Twin** | Production line simulation | Siemens Tecnomatix Plant Simulation, AnyLogic | USD 80K–300K |
| **Factory Digital Twin** | Entire plant floor | Siemens Tecnomatix + NX, NVIDIA Omniverse + Isaac Sim | USD 300K–1M |
| **Open-Source DT** | Research-grade asset model | OpenModelica, Modelica language, Eclipse Ditto | Free + implementation |

#### Digital Twin Data Sync Architecture

```
PHYSICAL ASSET ←────────────────────────────── VIRTUAL MODEL
(CNC Machine)                                  (Tecnomatix / Omniverse)
     │                                                  │
     │ Sensor data (real-time)                          │ Simulation state
     ▼                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     IoT DATA HUB                                │
│                                                                 │
│  OPC-UA → MQTT → AWS IoT Core → Kafka                          │
│                      │                                          │
│              ┌───────┴────────┐                                 │
│              ▼                ▼                                 │
│       TimescaleDB       Digital Twin                            │
│       (sensor history)  State Store (Redis)                     │
│                              │                                  │
│                              ▼                                  │
│                    DT Synchronization Service                   │
│                    ├── Physical → Virtual state update          │
│                    │   (every 1s for fast parameters,           │
│                    │    every 5min for slow/thermal)            │
│                    │                                            │
│                    ├── Virtual → Physical recommendations       │
│                    │   (parameter optimization, set-point adj.) │
│                    │                                            │
│                    └── Simulation runs (offline):               │
│                        "What if speed increases 10%?"           │
│                        "What if Machine 3 fails?"               │
└─────────────────────────────────────────────────────────────────┘
```

**Eclipse Ditto (OSS) — Recommended for Asset-Level DT:**
Eclipse Ditto provides a REST + WebSocket API for managing digital twin state. A machine becomes a "Thing" in Ditto with Properties (sensor readings) and Features (computed metrics). It is free, runs on Kubernetes, and integrates with Kafka/MQTT natively.

```json
// Eclipse Ditto — Thing definition for CNC machine
{
  "thingId": "smartlog.maestro:CNC-MACHINE-007",
  "policyId": "smartlog.maestro:policy-factory-floor",
  "attributes": {
    "manufacturer": "Mazak",
    "model": "QT-NEXUS 350-II",
    "installation_date": "2019-06-15",
    "plant": "Bac Ninh Factory 2"
  },
  "features": {
    "vibration": {
      "properties": {
        "rms_mm_s": 2.34,
        "dominant_freq_hz": 87.5,
        "anomaly_score": 0.23,
        "last_updated": "2026-04-03T08:32:15Z"
      }
    },
    "temperature": {
      "properties": {
        "spindle_bearing_celsius": 42.1,
        "ambient_celsius": 28.5,
        "thermal_trend_1hr": "+0.3C"
      }
    },
    "health": {
      "properties": {
        "rul_days_estimate": 34,
        "health_score": 0.78,
        "last_maintenance": "2026-02-10",
        "next_recommended_maintenance": "2026-05-07"
      }
    }
  }
}
```

---

## 3. Integration Patterns

### 3.1 OPC-UA Data Model and ML Pipeline Connection

OPC-UA (IEC 62541) is the cornerstone protocol for connecting factory floor data to AI systems. Its information model defines a hierarchical namespace that maps directly to machine ontology.

#### OPC-UA → Kafka Bridge (Python)

```python
from asyncua import Client, Node
from asyncua.common.subscription import SubHandler
import asyncio
import json
from kafka import KafkaProducer
from datetime import datetime, timezone

class OPCUAToKafkaBridge(SubHandler):
    """
    Subscribes to OPC-UA nodes on a PLC/SCADA server and 
    forwards data changes to Kafka as manufacturing events.
    """
    
    def __init__(self, kafka_producer: KafkaProducer, topic: str, plant_id: str):
        self.producer = kafka_producer
        self.topic = topic
        self.plant_id = plant_id
        self.node_metadata = {}  # node_id → {tag_name, unit, machine_id}
    
    def datachange_notification(self, node: Node, val, data):
        """Called by OPC-UA client on every subscribed node change."""
        node_id = str(node.nodeid)
        metadata = self.node_metadata.get(node_id, {})
        
        message = {
            "plant_id": self.plant_id,
            "machine_id": metadata.get("machine_id", "unknown"),
            "tag_name": metadata.get("tag_name", node_id),
            "value": float(val) if isinstance(val, (int, float)) else str(val),
            "unit": metadata.get("unit", ""),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "quality": "GOOD"  # OPC-UA quality codes: GOOD/BAD/UNCERTAIN
        }
        
        # Kafka key = machine_id for partition affinity (same machine → same partition)
        self.producer.send(
            self.topic,
            key=metadata.get("machine_id", "unknown").encode("utf-8"),
            value=json.dumps(message).encode("utf-8")
        )

async def connect_opcua_server(server_url: str, 
                                node_ids: list,
                                kafka_topic: str = "iiot.sensor.readings") -> None:
    """
    Main connection function.
    node_ids: list of OPC-UA NodeId strings to subscribe to
    Example NodeId: "ns=2;s=Siemens_S7.Machine01.SpindleSpeed"
    """
    producer = KafkaProducer(
        bootstrap_servers=["localhost:9092"],
        value_serializer=lambda v: json.dumps(v).encode("utf-8")
    )
    
    handler = OPCUAToKafkaBridge(producer, kafka_topic, plant_id="BacNinh-F2")
    
    async with Client(url=server_url) as client:
        # Verify server connection and browse namespace
        root = client.get_root_node()
        print(f"Connected to OPC-UA server. Root node: {root}")
        
        # Create subscription (1000ms publishing interval — adjust per use case)
        subscription = await client.create_subscription(1000, handler)
        
        # Subscribe to specific nodes
        nodes_to_subscribe = [client.get_node(nid) for nid in node_ids]
        await subscription.subscribe_data_change(nodes_to_subscribe)
        
        print(f"Subscribed to {len(nodes_to_subscribe)} OPC-UA nodes → Kafka topic: {kafka_topic}")
        
        # Keep connection alive
        while True:
            await asyncio.sleep(10)
```

**OPC-UA Unified Namespace (UNS) Architecture:**

The modern approach for large factories is the Unified Namespace — a single OPC-UA server that aggregates all plant data under a consistent hierarchical namespace:

```
Root
└── Enterprise (SmartlogMaestro)
    └── Site (BacNinh_Factory2)
        └── Area (Assembly_Line_3)
            └── WorkCell (Station_05)
                └── Machine (CNC_007)
                    ├── Status (Running/Idle/Fault)
                    ├── SpindleSpeed_RPM
                    ├── CuttingForce_N
                    ├── VibrationRMS_mm_s
                    └── PartCount_Total
```

This is enabled by MQTT-based brokers like HiveMQ or EMQX that support OPC-UA over MQTT (UADP encoding) and Kafka connectors.

---

### 3.2 MQTT for Constrained Devices

For older PLCs (Mitsubishi FX, Delta DVP) that lack OPC-UA support, MQTT is the pragmatic bridge:

```
Legacy PLC (Modbus RTU/TCP)
    │
    └─ Protocol Converter (Moxa MGate 5114 or Node-RED on RPi 4)
         ├─ Reads Modbus registers every 500ms
         └─ Publishes to MQTT broker (EMQX or HiveMQ)

MQTT Topic Structure:
factory/bac_ninh/line_3/station_05/machine_cnc007/vibration_rms
factory/bac_ninh/line_3/station_05/machine_cnc007/spindle_speed
factory/bac_ninh/line_3/station_05/machine_cnc007/status

MQTT → Kafka Bridge (Kafka MQTT Source Connector):
    MQTT topic pattern: factory/# → Kafka topic: iiot.sensor.readings
```

**Node-RED as PLC Bridge (Zero-Code, Vietnam-Friendly):**

Node-RED is extremely popular for IIoT bridging in Vietnam due to its visual programming model (no deep coding required) and active community. A typical Node-RED flow:

```
[Modbus TCP Read] → [Function: parse registers] → [MQTT Out: publish to broker]
[OPC-UA Read]     → [Function: normalize units] → [MQTT Out]
[Timer: 1s]       → [HTTP Request: PLC REST API] → [Kafka Producer]
```

---

### 3.3 Computer Vision Integration with Conveyor Line

**Hardware wiring schematic:**

```
Conveyor Belt with Rotary Encoder
         │
         │ Encoder pulse (e.g., 1000 ppr)
         ▼
    ┌──────────┐
    │   PLC    │ ──── Digital Output (24VDC) ──→ Camera Trigger Input
    │          │      (fires when part in FOV based on encoder count)
    └──────────┘
         │
    Digital Input ←── Reject Signal (from Jetson: FAIL detected)
         │
    ┌──────────────────┐
    │ Diverter/Ejector │ (pneumatic cylinder, reject bin)
    └──────────────────┘

Camera ──GigE Vision──→ Jetson Orin NX ──→ PLC I/O
(Basler ace2 5MP)       (Edge inference)    (Pass/Fail signal)
                              │
                              └──→ S3 (defect images, async)
                              └──→ TimescaleDB (inspection records)
```

**Conveyor Speed vs. Latency Budget Calculation:**

```
Given:
  Conveyor speed: 0.5 m/s (30 m/min — typical electronics assembly)
  Part size: 100mm (minimum dimension to be inspected)
  Camera FOV at inspection station: 200mm

Time part is in FOV = 200mm / 500mm_per_sec = 0.4 seconds = 400ms

System latency budget:
  Trigger jitter:            5ms
  Frame transfer:           10ms (5MP @ GigE 1G)
  Edge preprocessing:        5ms
  YOLOv11 inference:        15ms (Orin NX, TensorRT FP16)
  Post-process + decision:   2ms
  PLC signal + actuator:    10ms (pneumatic ejector reaction time)
  ─────────────────────────────
  Total:                    47ms  ← Well within 400ms budget

Margin: 353ms (8.5× safety factor) → Can handle 4m/s conveyor
```

**Reject Mechanism Options:**

| Mechanism | Response Time | Cost | Best For |
|---|---|---|---|
| Pneumatic diverter gate | 20–50ms | USD 500–2,000 | Medium/large parts, high force |
| Pneumatic ejector (cylinder) | 10–30ms | USD 200–800 | Small-medium parts |
| Air jet ejector | 5–15ms | USD 100–300 | Lightweight parts (chips, tablets, labels) |
| Servo-driven sorting arm | 50–200ms | USD 2,000–8,000 | Fragile parts, precise placement needed |

---

### 3.4 ERP/MES Integration — AI Recommendations to Production Orders

The feedback loop from AI insights to production execution is critical for closing the loop between analytics and action:

```python
# Pattern: AI scheduling recommendation → MES production order update
import httpx
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class AISchedulingRecommendation:
    order_id: str
    current_machine: str
    recommended_machine: Optional[str]  # None = no change
    revised_start: datetime
    revised_end: datetime
    confidence: float
    reason: str  # e.g., "Machine CNC-07 PdM alert: bearing fault in 3 days"

async def apply_ai_recommendation_to_mes(
    rec: AISchedulingRecommendation,
    mes_base_url: str,
    auth_token: str
) -> dict:
    """
    Apply AI scheduling recommendation to MES.
    Includes human-in-the-loop check for low-confidence recommendations.
    """
    
    # Human-in-the-loop: high confidence → auto-apply; low confidence → send for approval
    if rec.confidence < 0.75:
        # Send to approval queue (Slack/Teams/mobile notification)
        await notify_production_supervisor(rec)
        return {"status": "PENDING_APPROVAL", "recommendation": rec}
    
    async with httpx.AsyncClient() as client:
        # Update Odoo MES production order (Odoo 17 REST API)
        response = await client.patch(
            f"{mes_base_url}/api/mrp.production/{rec.order_id}",
            headers={"Authorization": f"Bearer {auth_token}",
                     "Content-Type": "application/json"},
            json={
                "date_start": rec.revised_start.isoformat(),
                "date_deadline": rec.revised_end.isoformat(),
                "workcenter_id": rec.recommended_machine,
                "note": f"[AI-Rescheduled] {rec.reason} (confidence: {rec.confidence:.0%})"
            }
        )
        
        if response.status_code == 200:
            # Log AI intervention for audit trail and model feedback
            await log_ai_intervention({
                "order_id": rec.order_id,
                "action": "RESCHEDULE",
                "ai_reason": rec.reason,
                "confidence": rec.confidence,
                "timestamp": datetime.utcnow().isoformat(),
                "human_approved": False  # auto-applied
            })
            return {"status": "APPLIED", "order_id": rec.order_id}
        else:
            return {"status": "FAILED", "error": response.text}
```

---

## 4. Technology Deep-Dive per AI Baseline

### 4.1 B03 Computer Vision — Defect Detection

#### Model Architecture Comparison

| Architecture | Params | mAP@50 (COCO) | Inference (Jetson Orin) | Best For |
|---|---|---|---|---|
| **YOLOv11n** (nano) | 2.6M | 39.5 | 15ms | Real-time conveyor, single GPU stream |
| **YOLOv11s** (small) | 9.4M | 47.0 | 25ms | Balanced accuracy/speed |
| **YOLOv11m** (medium) | 20.1M | 51.5 | 45ms | Higher defect complexity |
| **EfficientDet-D2** | 8.1M | 43.0 | 60ms | Alternative; good TFLite export |
| **PatchCore** (ResNet50) | ~25M | N/A (anomaly) | 120ms | Anomaly detection (no defect label needed) |
| **WinCLIP / SPADE** | Large | N/A (zero-shot) | 250ms+ | Zero-shot anomaly (new products) |

*Sources: Ultralytics YOLOv11 benchmarks (2024); PatchCore: Roth et al., CVPR 2022*

#### Training Data Requirements

| Use Case | Minimum Images | Recommended | Notes |
|---|---|---|---|
| Binary (defect/OK) with simple defect | 100–200 defect | 500+ | Simple scratch, bubble, stain |
| Multi-class defect detection | 300–500 per class | 1,000+ per class | Multiple defect types (crack, missing, misaligned) |
| Anomaly detection (PatchCore) | 50–200 normal only | 500 normal | No defect labels needed; test with 20+ defect images |
| Edge learning (Cognex ViDi) | 5–20 total | 50–100 | Few-shot; proprietary algorithm |
| Transfer learning (fine-tune YOLO) | 50–100 defect | 200–500 | Pre-trained COCO backbone; fastest to production |

**Key insight for Vietnam electronics factories:** The hardest challenge is data collection for rare defect classes. Defects like "solder bridge" or "missing chip" may occur only 1 in 10,000 parts. Solutions:
1. Run model in detection-only mode for 1–2 weeks, human labels every defect image captured
2. Synthetic data augmentation (Albumentations: blur, noise, random crop, color jitter)
3. GAN-based defect synthesis: generate synthetic defect images from normal images + defect texture patches
4. Transfer learning from similar product defect datasets (public datasets: MVTec AD, DAGM)

**PatchCore Anomaly Detection — Code Pattern:**

```python
# PatchCore: works without any defect labels — ideal for new product lines
import torch
import torchvision.transforms as T
from torchvision.models import wide_resnet50_2, Wide_ResNet50_2_Weights
from sklearn.neighbors import NearestNeighbors
import numpy as np
from pathlib import Path
from PIL import Image

class PatchCoreDetector:
    """
    Memory-bank based anomaly detection.
    Training: only NORMAL images needed (50–500 images).
    Inference: computes distance from nearest normal patch.
    Reference: Roth et al., "Towards Total Recall in Industrial Anomaly Detection", CVPR 2022.
    """
    
    def __init__(self, backbone_layer: str = "layer2"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = wide_resnet50_2(weights=Wide_ResNet50_2_Weights.IMAGENET1K_V2)
        self.model = self.model.to(self.device).eval()
        self.layer = backbone_layer
        self.memory_bank = None
        self.knn = None
        
        self.transform = T.Compose([
            T.Resize((224, 224)),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Register hook to extract intermediate features
        self._features = {}
        self.model.layer2.register_forward_hook(
            lambda m, i, o: self._features.update({"layer2": o})
        )
    
    def _extract_patches(self, image_tensor: torch.Tensor) -> np.ndarray:
        """Extract patch features using ResNet backbone."""
        with torch.no_grad():
            _ = self.model(image_tensor.unsqueeze(0).to(self.device))
        feat = self._features["layer2"].squeeze().cpu().numpy()  # (C, H, W)
        # Reshape to (H*W, C) — each spatial location is a patch
        C, H, W = feat.shape
        return feat.reshape(C, -1).T  # (H*W, C)
    
    def fit(self, normal_image_paths: list, subsample_ratio: float = 0.1) -> None:
        """Build memory bank from normal images. subsample_ratio reduces memory."""
        all_patches = []
        for img_path in normal_image_paths:
            img = Image.open(img_path).convert("RGB")
            tensor = self.transform(img)
            patches = self._extract_patches(tensor)
            all_patches.append(patches)
        
        memory_bank = np.vstack(all_patches)
        # Random subsampling to keep memory manageable
        n_keep = max(1, int(len(memory_bank) * subsample_ratio))
        idx = np.random.choice(len(memory_bank), n_keep, replace=False)
        self.memory_bank = memory_bank[idx]
        
        # Fit k-NN index (k=1 sufficient for scoring)
        self.knn = NearestNeighbors(n_neighbors=1, algorithm="ball_tree", 
                                    metric="euclidean", n_jobs=-1)
        self.knn.fit(self.memory_bank)
        print(f"PatchCore memory bank: {len(self.memory_bank)} patches from {len(normal_image_paths)} images")
    
    def predict(self, image_path: str, threshold: float = 8.5) -> dict:
        """
        Returns anomaly score and verdict.
        Score > threshold → DEFECT (tune threshold on validation set).
        """
        img = Image.open(image_path).convert("RGB")
        tensor = self.transform(img)
        patches = self._extract_patches(tensor)
        
        distances, _ = self.knn.kneighbors(patches)
        anomaly_score = float(np.max(distances))  # max distance = worst patch
        
        return {
            "anomaly_score": anomaly_score,
            "verdict": "DEFECT" if anomaly_score > threshold else "NORMAL",
            "confidence": min(1.0, anomaly_score / (threshold * 1.5))
        }
```

---

### 4.2 B07 Predictive Maintenance — Technical Deep-Dive

#### Bearing Fault Frequencies (Reference Table)

For a common bearing (SKF 6205, 9 balls) at various speeds:

| RPM | BPFO (Hz) | BPFI (Hz) | BSF (Hz) | FTF (Hz) |
|---|---|---|---|---|
| 1,000 | 61.4 | 88.6 | 40.5 | 6.8 |
| 1,500 | 92.1 | 132.9 | 60.7 | 10.2 |
| 1,750 | 107.5 | 155.0 | 70.9 | 11.9 |
| 3,000 | 184.2 | 265.8 | 121.4 | 20.4 |

*Formulae: BPFO = (N_b/2) × f_s × (1 - d/D×cos β); BPFI = (N_b/2) × f_s × (1 + d/D×cos β)*

**Thermal Imaging ML for Electrical Inspection:**

```python
# Thermal anomaly detection on IR camera images
import cv2
import numpy as np
from typing import Tuple

def analyze_thermal_image(thermal_img_path: str,
                            reference_temp_celsius: float = 40.0,
                            critical_delta_celsius: float = 20.0) -> dict:
    """
    Detect thermal anomalies in electrical panels, motor bearings, PCBs.
    
    Args:
        thermal_img_path: Path to thermal camera image (16-bit TIFF or radiometric JPEG)
        reference_temp_celsius: Expected normal operating temperature
        critical_delta_celsius: Delta above reference that triggers alert
    
    Returns:
        Analysis dict with hotspot locations and severity
    """
    # Load thermal image (16-bit TIFF from FLIR/Hikvision thermal camera)
    img = cv2.imread(thermal_img_path, cv2.IMREAD_UNCHANGED)
    
    # Convert raw pixel values to Celsius (camera-specific calibration)
    # For FLIR cameras: temp_C = (raw_value / 100.0) - 273.15
    temp_map = (img.astype(np.float32) / 100.0) - 273.15
    
    # Find hotspots: pixels significantly above reference temperature
    hotspot_mask = temp_map > (reference_temp_celsius + critical_delta_celsius)
    
    # Find connected hotspot regions
    hotspot_uint8 = (hotspot_mask * 255).astype(np.uint8)
    contours, _ = cv2.findContours(hotspot_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    hotspots = []
    for contour in contours:
        if cv2.contourArea(contour) < 4:  # Ignore single-pixel noise
            continue
        x, y, w, h = cv2.boundingRect(contour)
        roi_temps = temp_map[y:y+h, x:x+w]
        max_temp = float(np.max(roi_temps))
        
        hotspots.append({
            "bbox": [x, y, w, h],
            "max_temp_celsius": max_temp,
            "delta_above_reference": max_temp - reference_temp_celsius,
            "severity": "CRITICAL" if max_temp > reference_temp_celsius + 40 
                       else "WARNING" if max_temp > reference_temp_celsius + 20 
                       else "ELEVATED"
        })
    
    return {
        "total_hotspots": len(hotspots),
        "max_temp_celsius": float(np.max(temp_map)),
        "mean_temp_celsius": float(np.mean(temp_map)),
        "hotspots": sorted(hotspots, key=lambda x: -x["max_temp_celsius"]),
        "alert": len([h for h in hotspots if h["severity"] == "CRITICAL"]) > 0
    }
```

---

### 4.3 B06 Production Scheduling — OR-Tools CP-SAT

```python
from ortools.sat.python import cp_model
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class Job:
    id: str
    operations: List[Tuple[str, int]]  # [(machine_id, duration_min)]
    due_date: int  # minutes from horizon start
    priority: int  # 1=urgent, 2=normal, 3=low

def solve_job_shop_scheduling(jobs: List[Job],
                               horizon_minutes: int = 480,  # 1 shift = 8hr
                               max_solve_seconds: float = 30.0) -> Dict:
    """
    Job Shop Scheduling with OR-Tools CP-SAT.
    Minimizes: weighted tardiness (late jobs × priority weight)
    
    Returns: {job_id: {machine_id: {start_min, end_min}}}
    """
    model = cp_model.CpModel()
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = max_solve_seconds
    solver.parameters.num_search_workers = 4  # parallel solving
    
    all_tasks = {}      # (job_id, op_idx) → interval variable
    machine_tasks = {}  # machine_id → list of interval variables (no overlap constraint)
    tardiness_vars = [] # per-job tardiness variables
    
    for job in jobs:
        for op_idx, (machine_id, duration) in enumerate(job.operations):
            # Create interval variable for each operation
            start_var = model.NewIntVar(0, horizon_minutes, f"start_{job.id}_{op_idx}")
            end_var = model.NewIntVar(0, horizon_minutes, f"end_{job.id}_{op_idx}")
            interval_var = model.NewIntervalVar(start_var, duration, end_var,
                                                 f"interval_{job.id}_{op_idx}")
            all_tasks[(job.id, op_idx)] = (start_var, end_var, interval_var)
            
            if machine_id not in machine_tasks:
                machine_tasks[machine_id] = []
            machine_tasks[machine_id].append(interval_var)
        
        # Job operations must execute in order (precedence constraint)
        for op_idx in range(len(job.operations) - 1):
            model.Add(all_tasks[(job.id, op_idx + 1)][0] >= 
                      all_tasks[(job.id, op_idx)][1])
        
        # Tardiness calculation: max(0, completion_time - due_date)
        last_end = all_tasks[(job.id, len(job.operations) - 1)][1]
        tardiness = model.NewIntVar(0, horizon_minutes, f"tardiness_{job.id}")
        model.AddMaxEquality(tardiness, [last_end - job.due_date, model.NewConstant(0)])
        tardiness_vars.append(tardiness * job.priority)  # weight by priority
    
    # No-overlap constraint: each machine can only run one operation at a time
    for machine_id, intervals in machine_tasks.items():
        model.AddNoOverlap(intervals)
    
    # Objective: minimize total weighted tardiness
    model.Minimize(sum(tardiness_vars))
    
    # Solve
    status = solver.Solve(model)
    
    if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        schedule = {}
        for job in jobs:
            schedule[job.id] = {}
            for op_idx, (machine_id, _) in enumerate(job.operations):
                start_var, end_var, _ = all_tasks[(job.id, op_idx)]
                schedule[job.id][machine_id] = {
                    "start_min": solver.Value(start_var),
                    "end_min": solver.Value(end_var),
                    "operation_index": op_idx
                }
        
        return {
            "status": "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE",
            "total_weighted_tardiness": solver.ObjectiveValue(),
            "solve_time_seconds": solver.WallTime(),
            "schedule": schedule
        }
    else:
        return {"status": "INFEASIBLE", "schedule": {}}
```

**Performance benchmarks for OR-Tools CP-SAT:**
- 10 jobs × 5 machines: solves to optimality in <0.1 seconds
- 50 jobs × 10 machines: near-optimal solution in <5 seconds
- 200 jobs × 20 machines: good feasible solution in 30–60 seconds
- For real factories (1,000+ jobs): use rolling-horizon approach (solve 4-hour windows)

*Source: OR-Tools CP-SAT documentation; Google Optimization Research 2023*

---

### 4.4 B01 Demand/Production Forecasting

#### Top-Down vs. Bottom-Up Forecasting

| Approach | Description | Best For | Limitation |
|---|---|---|---|
| **Top-Down** | Market demand forecast → disaggregate to SKU/line level | Fast-moving consumer goods, stable product mix | Disaggregation error; ignores production constraints |
| **Bottom-Up** | Machine capacity + cycle time → max output → aggregate | Capacity-constrained factories; job shop environments | Does not account for demand variability |
| **Middle-Out** | Core product forecasted directly; others derived | Electronics (hero product + variants) | Requires good product hierarchy |
| **Constrained Demand** (AI hybrid) | Demand forecast constrained by capacity model | Manufacturing planning | Requires MES/ERP integration; more complex |

```python
# Pattern: Production-constrained demand forecasting
# Combines NeuralForecast (demand) with capacity constraint model

from neuralforecast import NeuralForecast
from neuralforecast.models import NHITS
from neuralforecast.losses.pytorch import MAE
import pandas as pd

def build_production_forecast_pipeline(
    demand_history: pd.DataFrame,   # columns: ds (date), y (units), unique_id (sku)
    capacity_profile: dict,          # {machine_id: max_units_per_day}
    forecast_horizon_days: int = 30
) -> pd.DataFrame:
    """
    Top-down demand forecast constrained by production capacity.
    
    Step 1: Forecast unconstrained demand (NHITS neural model)
    Step 2: Apply capacity constraints per production line
    Step 3: Return achievable production plan with gap analysis
    """
    
    # Step 1: Unconstrained demand forecast
    nf = NeuralForecast(
        models=[NHITS(
            h=forecast_horizon_days,
            input_size=2 * forecast_horizon_days,
            loss=MAE(),
            max_steps=500,
            scaler_type='robust'  # robust to outliers (e.g., promo spikes, Tet holiday)
        )],
        freq='D'
    )
    nf.fit(demand_history)
    unconstrained_forecast = nf.predict().reset_index()
    
    # Step 2: Apply capacity constraints
    # Assume: each SKU maps to one production line; cycle time converts units → machine-hours
    constrained_plan = []
    
    for _, row in unconstrained_forecast.iterrows():
        sku = row["unique_id"]
        forecasted_demand = row["NHITS"]
        
        # Look up which machine produces this SKU and its capacity
        machine_id = get_machine_for_sku(sku)  # from product routing table
        max_capacity = capacity_profile.get(machine_id, float("inf"))
        
        achievable_qty = min(forecasted_demand, max_capacity)
        gap = max(0, forecasted_demand - achievable_qty)
        
        constrained_plan.append({
            "date": row["ds"],
            "sku": sku,
            "forecasted_demand": forecasted_demand,
            "achievable_production": achievable_qty,
            "capacity_gap": gap,
            "machine_id": machine_id,
            "action": "OVERTIME_REQUIRED" if gap > 0 else "NORMAL"
        })
    
    return pd.DataFrame(constrained_plan)
```

---

### 4.5 B15 Digital Twin — Platform Comparison

| Platform | Type | Strengths | Weaknesses | Vietnam Availability |
|---|---|---|---|---|
| **Siemens Tecnomatix Plant Simulation** | Commercial | Industry-standard for discrete manufacturing; DES engine; tight Siemens ecosystem integration | Expensive (USD 50K+/license); complex to configure | Siemens Vietnam sells/supports |
| **NVIDIA Omniverse + Isaac Sim** | Commercial/SDK | Physics-accurate simulation; USD scene graph; GenAI integration; robot simulation | GPU-heavy (RTX 4090 recommended); USD 9K/yr enterprise | Cloud/API-based; NVIDIA SEA distributes |
| **Dassault 3DEXPERIENCE (DELMIA)** | Commercial | Full lifecycle (design → manufacturing → maintenance); aerospace-proven | Very expensive; long implementation | Via local partners (Intercad, CADviet) |
| **AnyLogic** | Commercial | Best multi-method simulation (DES + Agent + System Dynamics); Python/Java API | USD 5K–20K/license | Via online license; no Vietnam direct office |
| **OpenModelica** | Open Source | Equation-based (Modelica language); continuous process simulation; energy systems | Not suited for discrete manufacturing; steep learning curve | Free; community support |
| **Eclipse Ditto** | Open Source | Asset twin state management; Kafka/MQTT native; REST API | Not a simulation engine — state store only | Free; Kubernetes deployment |

**MAESTRO Recommendation:** For Vietnam mid-market manufacturers, the pragmatic DT stack is:
1. **Eclipse Ditto** — asset state management (free, self-hosted)
2. **Grafana + TimescaleDB** — real-time monitoring dashboard (free)
3. **AnyLogic (cloud)** — production line simulation for what-if analysis (USD 5K/yr)

Full Siemens/NVIDIA Omniverse digital twins are aspirational for L2-stage factories; recommend as Phase 2 after data maturity is established.

---

## 5. Vietnam Manufacturing Tech Realities

### 5.1 PLC Brands in Vietnam Factories

| PLC Brand | Market Segment | Estimated Vietnam Share | OPC-UA Support |
|---|---|---|---|
| **Siemens S7-300/400** | Legacy large industry (steel, automotive) | ~25% (large factories) | Via CP 343/443 modules or Kepware OPC server |
| **Siemens S7-1200/1500** | Modern installations, FDI factories | Growing; ~20% new installs | Native OPC-UA server built-in (S7-1500) |
| **Mitsubishi FX series** (FX3U, FX5U) | Mid-size domestic factories, Japanese-owned | ~30% | FX5U has built-in OPC-UA; FX3U needs converter |
| **Delta DVP/AS series** | Cost-driven domestic factories, SMEs | ~25% | Limited native OPC-UA; use Modbus TCP + gateway |
| **Allen-Bradley (Rockwell)** | US-standard FDI factories (some automotive) | ~5% | EtherNet/IP native; OPC-UA via FactoryTalk |
| **Omron** | Food processing, packaging | ~10% (food sector) | OPC-UA via NX/NJ series |
| **Fatek, Vigor** (Taiwanese) | Ultra-budget SME | ~5% | No OPC-UA; Modbus RTU only |

**Key insight:** Mitsubishi FX3U and Delta DVP PLCs dominate the domestic SME segment due to price (~USD 200–800 for base unit vs. Siemens S7-1500 at USD 2,000–5,000). These older PLCs lack native OPC-UA, requiring a protocol converter layer (Moxa MGate, Kepware, or Node-RED on Raspberry Pi 4 at ~USD 80) to bridge to the AI stack.

**Protocol Converter Cost Comparison:**

| Converter | Protocol Support | Price | Best For |
|---|---|---|---|
| **Moxa MGate 5114** | Modbus RTU/TCP → OPC-UA | USD 450 | Production-grade; DIN rail; wide temp range |
| **Kepware KEPServerEX** | 150+ drivers → OPC-UA | USD 1,500–3,000 | All PLC brands; Windows server required |
| **Node-RED on RPi 4** | Modbus + many others → MQTT/HTTP | USD 80 + free | Budget; great for pilots; not hardened |
| **Inductive Automation Ignition** | All major PLCs → MQTT Sparkplug B | USD 0 (edge license free) | Full SCADA + OPC-UA; growing in Vietnam |

---

### 5.2 Camera Brands for QC in Vietnam

| Brand | Model | Type | Price (Vietnam) | Target |
|---|---|---|---|---|
| **Cognex** | In-Sight 9000 series | Smart camera (embedded AI) | USD 6,000–12,000 | Samsung/Intel tier suppliers, FDI |
| **Keyence** | IV-3 series, XG-X | Smart camera / vision system | USD 4,000–10,000 | Japanese factories (Honda, Denso) |
| **Basler** | ace2 Pro, dart | GigE/USB3 camera (PC-based) | USD 800–4,000 | Custom vision systems, integrators |
| **Hikrobot** (Hikvision Industrial) | MV-CS series | GigE industrial camera | USD 200–1,500 | Domestic SMEs, cost-sensitive |
| **Daheng Imaging** | MER2 series | GigE/USB3 | USD 150–1,000 | Ultra-budget; growing adoption |
| **Sony Industrial** | XCG, XCI series | CCD/CMOS GigE | USD 2,000–8,000 | High-precision electronics |

**Price vs. Performance Trade-Off:**
- Cognex/Keyence: Higher software integration value (built-in AI, edge learning), factory-hardened, excellent local support. Cost premium justified for FDI suppliers with zero-defect requirements.
- Basler: Best open-platform camera for custom AI pipelines (YOLOv11, PatchCore). Standard GenICam driver, active community, competitive pricing.
- Hikrobot: 80% of Basler's optical performance at 40% of the price. Growing fast in Vietnam domestic manufacturing. HALCON and OpenCV compatible.

---

### 5.3 Factory Connectivity in Vietnam

| Connectivity Type | Reliability | Latency | Cost | Vietnam Adoption |
|---|---|---|---|---|
| **Wired Ethernet (Cat6/Cat6A)** | 99.99% | <1ms LAN | Infrastructure: USD 5–20/m installed | Dominant in FDI factories; preferred for machine control |
| **Industrial WiFi (IEEE 802.11ax)** | 99.5–99.9% | 2–10ms | USD 500–2,000/AP | Growing; used for AGVs, mobile scanners; still secondary |
| **Industrial 5G (SA Private Network)** | 99.9% | 1–5ms (factory) | USD 100K+ network infrastructure | Pilot stage; Viettel/VinaPhone piloting industrial 5G at some industrial parks |
| **LoRaWAN** | 99%+ | 1–5s (not real-time) | Very low cost (USD 20–50/node) | Appropriate for energy/environmental monitoring; not for control |
| **Fiber Optic (plant backbone)** | 99.99%+ | Sub-millisecond | USD 10–30/m installed | Used in large plants (Hoa Phat, VinFast) for backbone |

**Vietnam Industrial 5G Status (2026):**
- Viettel has pilot programs in Bac Ninh (Samsung's home province) and VSIP industrial parks
- Private 5G networks for manufacturing remain expensive; mostly FDI factories in electronics
- For most Vietnam manufacturers: wired Ethernet for control-critical (Level 0–1) + WiFi 6 for monitoring and mobile use (Level 2–3)
- Industrial 5G will accelerate with VinFast EV factory as a showcase use case (targeting 2026–2027)

---

### 5.4 Cloud vs. On-Premise for Vietnam Manufacturers

| Factor | Cloud | On-Premise |
|---|---|---|
| **Upfront cost** | Low (OPEX) | High (CAPEX: USD 50K–200K server room) |
| **Data sovereignty** | Risk: data leaves Vietnam | Full control |
| **FDI client IP concerns** | High risk: most FDI factories prohibit sending production data to public cloud | Acceptable: client factory owns hardware |
| **Internet dependency** | Factory AI stops if internet cuts → unacceptable for inline QC | Zero internet dependency |
| **Scalability** | Unlimited | Constrained by hardware |
| **Vietnamese regulatory** | Decree 13/2023: personal data requires VN residency. Production data: no explicit requirement but FDI clients' parent-company policies often prohibit | Always compliant |

**Decision Framework for Vietnam Factories:**

```
Is this a Samsung/Intel/LG Tier 1 supplier?
    YES → On-premise mandatory (global parent company policy; IP restriction)
    NO → Continue ↓

Does factory floor inline control require AI? (vision inspection, real-time rejection)
    YES → Edge AI node (Jetson Orin) + local data storage
         Analytics and model training CAN be cloud (separate from control plane)
    NO → Cloud-first acceptable ↓

Is factory in industrial park with reliable internet (>100Mbps, SLA)?
    YES → Hybrid: edge for real-time inference, cloud for analytics/training
    NO → On-premise or edge-only
```

**Recommended MAESTRO Deployment Architecture for Vietnam SME:**

```
Factory Floor (On-Premise / Air-Gapped)
├── Jetson Orin NX: Real-time vision inference
├── TimescaleDB (NUC or mini server): Local sensor history (30 days)
├── Eclipse Ditto (on-prem Docker): Asset twin state
└── EMQX MQTT Broker: Local sensor aggregation

Hybrid Cloud (AWS ap-southeast-1)
├── S3: Defect image archive, model artifacts
├── SageMaker: Model training (triggered weekly or on drift)
├── MLflow: Model registry, experiment tracking  
└── Grafana Cloud / AWS QuickSight: Management dashboards

Data Transfer:
├── Defect images: Upload asynchronously (not on inference critical path)
├── Sensor summaries: Hourly aggregates (not raw data) → cloud
└── Model updates: Download new model to edge device → swap atomically
```

---

## 6. Build vs. Buy Analysis

### 6.1 Computer Vision Inspection

| Option | Description | Cost (Annual) | Time to Deploy | Vietnam Mid-Market Fit |
|---|---|---|---|---|
| **Build Custom (YOLO + Jetson)** | OpenCV + YOLOv11 + custom training pipeline | USD 5K–20K (engineering) | 3–6 months | Best long-term; requires ML talent |
| **Landing AI LandingLens** | SaaS platform; label → train → deploy; no ML expertise needed | USD 20K–80K/yr | 4–8 weeks | High: Andrews Ng's platform for factory AI; excellent UX |
| **Cognex ViDi** | Edge learning on Cognex In-Sight camera; 5–20 images sufficient | USD 6K–15K/camera + USD 2K–5K/yr software | 1–3 weeks | High: fastest to production; no ML team needed |
| **Keyence Vision System + AI** | Integrated lighting + camera + AI classifier | USD 8K–20K per station | 2–4 weeks | High for Japanese-affiliated factories |
| **AWS Lookout for Vision** | Cloud-based CV for batch inspection; not suitable for inline | USD 0.0065/image inspected | Days to deploy | Medium: batch quality audit only |
| **Microsoft Azure Cognitive (Vision)** | General-purpose CV; customizable | USD 1.5/1000 images | Days | Low for specialized industrial defects |

**ROI Analysis for Vietnam Mid-Market Manufacturer (1,000 employees, electronics assembly):**

```
CURRENT STATE (Manual inspection):
  - 10 inspectors × USD 350/month = USD 3,500/month = USD 42,000/year
  - Defect escape rate: 3% (customer returns, rework cost)
  - Annual rework cost: 3% × USD 5M revenue = USD 150,000/year
  - Total annual quality cost: USD 192,000

WITH AI INSPECTION (Custom YOLO build):
  - Engineering cost (one-time): USD 30,000 (3 months, 2 engineers)
  - Jetson Orin hardware: USD 3,000 × 3 stations = USD 9,000 (one-time)
  - Camera + lighting per station: USD 5,000 × 3 = USD 15,000 (one-time)
  - Annual maintenance/retraining: USD 8,000
  - Remaining inspectors (review queue): 2 × USD 350/month = USD 8,400/year
  - Defect escape rate: 0.5% → rework cost: USD 25,000/year

NET ANNUAL SAVING: USD 192,000 - (USD 8,400 + USD 25,000 + USD 8,000) = USD 150,600
PAYBACK PERIOD: (USD 54,000 one-time) / USD 150,600 = 4.3 months

WITH LANDING AI:
  - Platform cost: USD 40,000/year
  - Hardware: USD 24,000 (one-time, same cameras/lighting)
  - Zero ML engineering required
  - Annual total: USD 40,000 + USD 8,400 (inspectors) + USD 25,000 (rework) = USD 73,400
  - Saving vs. current: USD 192,000 - USD 73,400 = USD 118,600/year
  - Payback: (USD 24,000) / USD 118,600 = 2.4 months
```

**Recommendation for Vietnam mid-market:**
- 1–2 inspection stations, no ML team → **Cognex ViDi or Landing AI** (buy)
- 3+ stations, engineering team available → **Build custom (YOLO + Jetson)** (build)
- Pilot phase → **Landing AI LandingLens** (fastest POC, then transition to custom build)

---

### 6.2 Predictive Maintenance

| Option | Vendor | Annual Cost | Capabilities | Vietnam Fit |
|---|---|---|---|---|
| **Build Custom** | OSS (scikit-learn, PyTorch, MLflow) | USD 20K–50K (engineering) | Full control; tailored to specific assets | Best for 50+ machines; requires data science team |
| **PTC ThingWorx + Analytics** | PTC | USD 50K–200K/yr | IIoT platform + ML; AR overlay | FDI factories; overpowered for domestic SME |
| **Siemens MindSphere (Insights Hub)** | Siemens | USD 30K–150K/yr | Best if Siemens PLCs dominate; integrated DT | Siemens-heavy factories; limited local support |
| **Augury** | Augury (SaaS) | USD 800–2,000/machine/yr | Vibration ML SaaS; installs in days; mobile app | High: no ML expertise needed; API-first |
| **IBM Maximo + Monitor** | IBM | USD 100K–500K/yr | Enterprise asset management + ML | Large enterprises (PTSC, Hoa Phat) |
| **Samsara** | Samsara | USD 300–600/machine/yr | IoT + basic PdM; strong mobile UX | Medium: best for fleet/vehicle, not factory |

**Cost Comparison for 100-Machine Factory:**

| Solution | Year 1 Cost | Year 3 Cost | Capabilities |
|---|---|---|---|
| Build Custom | USD 70,000 (eng.) + USD 15,000 (hardware) | USD 20,000/yr maintenance | Full custom; all sensor types |
| Augury SaaS | USD 120,000/yr subscription | USD 120,000/yr | Vibration-only; instant deploy |
| PTC ThingWorx | USD 180,000 (license + impl.) | USD 80,000/yr | Full platform; complex deploy |
| Siemens MindSphere | USD 150,000 (impl.) | USD 100,000/yr | Best with Siemens PLCs |

**Recommendation:**
- <20 machines, no data science team → **Augury** (pay per machine, zero implementation)
- 20–100 machines, basic Python team → **Build custom** (Isolation Forest baseline → LSTM upgrade)
- 100+ machines, SAP/Siemens environment → **PTC ThingWorx or Siemens Insights Hub**

---

## 7. MAESTRO Platform Architecture for I04

### 7.1 Manufacturing AI Platform Stack

```
┌───────────────────────────────────────────────────────────────────────┐
│                     MAESTRO I04 MANUFACTURING PLATFORM                │
├───────────────────────────────────────────────────────────────────────┤
│  BASELINE SERVICES (AI Engines — Python/FastAPI Microservices)         │
│                                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  B03     │ │  B07     │ │  B06     │ │  B01     │ │  B08     │   │
│  │  Vision  │ │  PdM     │ │  Sched   │ │  DocAI   │ │  IoT     │   │
│  │  Quality │ │  Engine  │ │  Engine  │ │  CAPA/   │ │  Intel.  │   │
│  │  Inspect │ │  (vib+IR)│ │  (OR-    │ │  NCR     │ │  (sensor │   │
│  │          │ │          │ │  Tools)  │ │  auto    │ │  fusion) │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  B05     │ │  B09     │ │  B10     │ │  B12     │ │  B13     │   │
│  │  Anomaly │ │  Optim.  │ │  TimeSer │ │  Quality │ │  DT      │   │
│  │  Detect  │ │  Engine  │ │  Analysis│ │  Mgmt    │ │  Sim.    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├───────────────────────────────────────────────────────────────────────┤
│  DATA & ML PLATFORM                                                   │
│  Kafka (MSK) │ TimescaleDB │ S3 Data Lake │ MLflow │ Feast            │
│  Airflow     │ Great Expectations │ Evidently AI (drift monitoring)   │
├───────────────────────────────────────────────────────────────────────┤
│  INTEGRATION LAYER                                                    │
│  OPC-UA Connector │ MQTT Bridge │ SAP RFC Adapter │ Odoo REST         │
│  Bravo/MISA CSV Adapter │ Modbus TCP │ GigE Vision Driver             │
├───────────────────────────────────────────────────────────────────────┤
│  EDGE TIER (Factory Floor — On-Premise)                               │
│  NVIDIA Jetson Orin NX (Vision AI + PdM edge)                        │
│  EMQX MQTT Broker │ Eclipse Ditto │ TimescaleDB Local (30-day buffer) │
└───────────────────────────────────────────────────────────────────────┘
```

### 7.2 Phase-by-Phase Deployment Roadmap

**Phase 0 (Weeks 1–4): Data Foundation**
- Deploy OPC-UA/MQTT bridge for existing PLCs (Node-RED on RPi 4 for budget; Moxa MGate for production)
- Set up TimescaleDB on-premise; configure Grafana dashboards for OEE, production counts
- Camera installation + Basler/Hikvision + basic OpenCV frame capture (no AI yet)
- MQTT → AWS IoT Core pipeline; S3 data lake setup
- Deliverable: Live sensor data flowing, first OEE dashboard

**Phase 1 (Months 2–3): AI Baselines**
- Deploy YOLOv11 vision inspection on Jetson Orin NX (B03)
- Train PatchCore anomaly detector on 3 months of normal vibration data (B05/B07)
- Integrate demand forecast (NeuralForecast NHITS) with MES/ERP data (B01/B06)
- Deliverable: First AI defect detection live; first anomaly alerts; first demand forecast report

**Phase 2 (Months 4–6): Closed-Loop AI**
- OR-Tools CP-SAT production scheduling with capacity constraints (B09)
- AI recommendation → MES work order feedback loop (B06 → MES integration)
- PdM work order automation: AI anomaly → SAP PM / Odoo maintenance request (B07)
- Drift detection + automated retraining pipeline (MLOps L2)
- Deliverable: Full predictive + prescriptive AI loop operational

**Phase 3 (Months 7–12): Advanced**
- Eclipse Ditto asset digital twin (B13)
- LLM-based operator troubleshooting copilot in Vietnamese (B04, B14)
- Multi-line scheduling with constraint learning (B11)
- Synthetic defect data generation for NPI cold start (B03 advanced)
- Deliverable: MAESTRO I04 full-stack demo; 3 production-grade client deployments

---

## 8. Sources & References

1. **Ultralytics YOLOv11 Documentation & Benchmarks** (2024). https://docs.ultralytics.com/models/yolo11/
2. **Roth, K. et al.** "Towards Total Recall in Industrial Anomaly Detection" (PatchCore), CVPR 2022. https://arxiv.org/abs/2106.08265
3. **OR-Tools CP-SAT Documentation**, Google Optimization Team (2024). https://developers.google.com/optimization/reference/python/sat/python/cp_model
4. **Evidently AI Documentation** — Data Drift Detection (2024). https://docs.evidentlyai.com/
5. **NVIDIA Jetson Orin NX Product Brief** — 100 TOPS, 10–25W TDP (2023). https://developer.nvidia.com/embedded/jetson-orin
6. **OPC Foundation** — OPC Unified Architecture, IEC 62541. https://opcfoundation.org/about/opc-technologies/opc-ua/
7. **Nixtla NeuralForecast** — NHITS for Production Forecasting (2024). https://github.com/Nixtla/neuralforecast
8. **Siemens Tecnomatix Plant Simulation** product page (2024). https://www.plm.automation.siemens.com/global/en/products/manufacturing-planning/plant-simulation.html
9. **Eclipse Ditto** — Open-Source Digital Twin Framework. https://eclipse.dev/ditto/
10. **AWS IoT Core Documentation** — MQTT, rules engine, IoT Analytics (2024). https://docs.aws.amazon.com/iot/latest/developerguide/
11. **TimescaleDB Documentation** — Time-Series PostgreSQL (2024). https://docs.timescale.com/
12. **Landing AI LandingLens** — Industrial Visual Inspection Platform. https://landing.ai/landinglens/
13. **SKF Bearing Technical Handbook** — Bearing Fault Frequency Calculation (2023). https://www.skf.com/group/products/rolling-bearings/principles-of-rolling-bearing-selection/bearing-failure-and-life
14. **Augury Predictive Maintenance Platform** — Machine Health as a Service (2024). https://www.augury.com/
15. **IMARC Group** — Vietnam Industry 4.0 Market Report (2024). USD 658.8M market size, CAGR 25.7%.
16. **Inductive Automation Ignition** — SCADA + OPC-UA + MQTT Sparkplug. https://inductiveautomation.com/
17. **PyWavelets Documentation** — Wavelet transforms for vibration analysis. https://pywavelets.readthedocs.io/
18. **asyncua** — Python OPC-UA client/server library. https://github.com/FreeOpcUa/opcua-asyncio
19. **NI CompactDAQ** — Data acquisition hardware for vibration/sensor applications. https://www.ni.com/en/shop/data-acquisition/compactdaq.html
20. **Moxa MGate 5114** — Industrial Protocol Gateway (Modbus → OPC-UA). https://www.moxa.com/en/products/industrial-edge-connectivity/protocol-gateways/modbus-gateways/mgate-5114-series

---

*Report generated by R-β (Dr. Praxis) | MAESTRO Knowledge Graph Platform | 2026-04-03*
*Companion: R-α Research Report (Dr. Archon) — I04 Manufacturing, same date*
