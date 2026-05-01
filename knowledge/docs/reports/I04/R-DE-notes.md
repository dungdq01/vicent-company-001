# R-DE Notes — Industry Module I04: Manufacturing
**Role:** R-DE (Data Engineer), MAESTRO Knowledge Graph Platform
**Date:** 2026-04-03
**Status:** Phase 0 — Baseline Knowledge Capture
**Reference:** Patterns from I06 (Logistics & Supply Chain) R-DE-notes.md are cited where shared; differences are explained explicitly.

---

## How Manufacturing Differs from I06 (Logistics)

I06 is a movement-centric domain: the core data is shipments, GPS pings, and delivery events — almost entirely operational IT data flowing from apps and APIs. Manufacturing adds a second entirely separate data world: **OT (Operational Technology)** — PLCs, SCADA systems, historians, and sensor networks on the factory floor — that predates cloud computing by decades and runs on industrial protocols (OPC-UA, Modbus, Profinet) rather than REST APIs and JSON.

| Dimension | I06 Logistics | I04 Manufacturing |
|---|---|---|
| Primary data type | Transactional events (shipment, GPS) | Time-series sensor streams + events |
| Source systems | TMS, WMS, ERP, mobile apps | PLC, SCADA, MES, ERP, historian |
| Connectivity | REST API / Kafka connectors | OPC-UA, MQTT, Modbus, Profinet |
| Data frequency | GPS: 1–30s; shipment events: discrete | Vibration: up to 50kHz; temperature: 1Hz |
| Image data | Proof-of-delivery photos (low volume) | Defect inspection images (high volume, structured) |
| IT/OT gap | Not applicable | Critical barrier: factory floor vs. cloud |
| Legacy problem | System fragmentation (TMS/WMS/ERP) | 10–20 year old PLCs, proprietary protocols |
| Physical environment | Roads, traffic, weather | Factory floor: dust, vibration, EM interference |

The data engineering challenge in manufacturing is not primarily pipeline scalability (as in logistics GPS ingestion) — it is **protocol translation, edge computing placement, and bridging the IT/OT gap** before any data can reach the lake.

---

## 1. Manufacturing Data Architecture

### 1.1 OT Data Stack

The classical OT stack follows the **Purdue Reference Model** (ISA-95), flowing upward through five layers:

```
[Level 0] Physical Process
    Sensors: accelerometers, thermocouples, pressure transducers, current clamps
    Actuators: motors, valves, conveyors
         |
[Level 1] Basic Control
    PLC (Programmable Logic Controller):
      - Siemens S7-1200/S7-1500 (most common in VN FDI factories)
      - Mitsubishi MELSEC (Japanese-owned: Honda, Denso)
      - Allen-Bradley/Rockwell (Automation) (US-owned, some FDI)
      - Scan cycle: 1–100ms; outputs digital/analog signals
         |
[Level 2] Supervisory Control
    SCADA (Supervisory Control and Data Acquisition):
      - Siemens WinCC, AVEVA (formerly Wonderware), Ignition (Inductive Automation)
      - Provides operator HMI, alarm management, tag historian
      - Data access: OPC-UA server exposed by SCADA system
         |
[Level 3] Manufacturing Operations
    Historian (process data archive):
      - OSIsoft PI System (now AVEVA PI) — dominant in FDI/large plants
      - Aveva Historian (formerly Wonderware Historian)
      - Open-source alternative: TimescaleDB as historian replacement
      - Stores: all tag values with timestamps at configured scan rate
         |
[Level 4] Business Planning
    MES (Manufacturing Execution System):
      - SAP ME/MII, Siemens Opcenter, Infor CloudSuite
      - Tracks: work orders, production counting, labor, quality results
    ERP (Enterprise Resource Planning):
      - SAP ECC/S4HANA (large FDI), SAP Business One (mid-market), FAST/MISA (domestic)
      - Tracks: orders, BOM, inventory, costing
         |
[Level 5] Enterprise / Cloud
    Data Lake / AI Platform (cloud or on-premise):
      - AWS IoT Core + S3 + SageMaker
      - Azure IoT Hub + ADLS + Azure ML
      - On-premise: MinIO + MLflow + Grafana
```

**Key distinction from I06:** In logistics, data is born digital and flows through APIs. In manufacturing, data is born analog (sensor voltages), converted to engineering units by PLCs, then must traverse multiple layers and protocol translations before reaching any cloud system. Every layer boundary is a potential data loss point.

### 1.2 IT/OT Convergence Architecture

Bridging factory floor OT to cloud AI is the defining challenge of Industry 4.0 data engineering.

```
[Factory Floor OT Network — Air-Gapped / Firewalled]
    PLC (Siemens S7)
        |
    OPC-UA Server (built into modern SCADA, or add-on for legacy)
        |
    OPC-UA → MQTT Bridge
    (e.g., Ignition Edge, AWS IoT Greengrass, or custom Python opcua library)
        |
    Industrial Edge Gateway (Siemens IPC / NVIDIA Jetson / Raspberry Pi 4)
    — Runs: edge inference models, data buffering, anomaly pre-filter
        |
    DMZ / OT-IT Firewall (one-way data diode recommended by IEC 62443)
        |
[Corporate IT Network]
    MQTT Broker (AWS IoT Core / Azure IoT Hub / HiveMQ on-premise)
        |
    Apache Kafka (manufacturing.sensors.raw, manufacturing.alarms, manufacturing.quality)
        |
[Cloud / Data Center]
    Stream Processing (Kafka Streams / Flink)
        |
    Time-Series DB (InfluxDB / TimescaleDB / AWS Timestream)
        |
    Data Lake (S3 / MinIO, Parquet format)
        |
    Feature Store → ML Training + Inference
```

**Security note:** The IT/OT boundary must be hardened. Production PLCs should NEVER be directly accessible from cloud networks. One-way data diodes (hardware) or strict firewall rules with DMZ staging zones are required per IEC 62443 industrial security standard.

**Contrast with I06:** Logistics data flows from internet-connected mobile apps and GPS devices via standard HTTPS/WebSocket to Kafka — no firewall bridging required. Manufacturing OT connectivity requires dedicated edge gateways and network segmentation expertise.

### 1.3 Computer Vision Data Architecture

Manufacturing computer vision (CV) is fundamentally different from the proof-of-delivery photos in I06. Defect inspection generates **high-volume, structured, labeled images** that must be managed as a machine learning asset, not just as files.

```
[Inspection Station]
    Industrial Camera (Cognex In-Sight, Keyence IV3, Basler, FLIR)
    — Triggering: encoder-based (part position), or continuous
    — Resolution: 1–12 MP; frame rate: 10–120 fps at inspection speed
        |
    Edge Inference Node (NVIDIA Jetson Orin / IPC)
    — Real-time defect classification (<30ms latency requirement)
    — Outputs: pass/reject signal → PLC → actuator (air jet, robotic arm)
    — Stores: image + inference result + confidence score
        |
    Image Storage:
      Cloud:      AWS S3 or GCP GCS, partitioned by date/line/product
      On-premise: MinIO (S3-compatible), preferred for VN factories with bandwidth limits
      Path pattern: s3://factory-vision/{plant_id}/{line_id}/{product_code}/{YYYY}/{MM}/{DD}/{image_id}.jpg
        |
    Annotation Pipeline (for model retraining):
      Label Studio (open-source, self-hosted) — annotation UI
      Roboflow or CVAT — annotation + augmentation
      Active Learning loop: select hard-negative samples (borderline confidence) for priority labeling
        |
    Model Registry:
      MLflow Model Registry — version tracking, A/B metadata, staging/production tags
      DVC (Data Version Control) — links model versions to dataset versions
      Model deployment: edge OTA update via AWS IoT Greengrass or manual USB if air-gapped
```

**Image data volume estimates:**
| Line Type | Camera Count | Images/Shift (8h) | Raw Storage/Day |
|---|---|---|---|
| PCB inspection line | 4–8 cameras | 200K–500K | 100–500 GB |
| Metal stamping QC | 2–4 cameras | 50K–150K | 20–80 GB |
| Textile/garment QC | 1–3 cameras | 20K–80K | 5–30 GB |
| Food processing QC | 2–6 cameras | 100K–300K | 30–150 GB |

**Storage strategy:** Raw images retained 30 days on hot storage; defective images and labeled samples retained permanently (they are training data assets); passed-with-high-confidence images archived to cold tier (S3 Glacier / MinIO lifecycle policy) after 30 days.

### 1.4 Time-Series Manufacturing Data

Manufacturing time-series is more complex than I06 GPS data because sampling rates span six orders of magnitude and different signals require different storage strategies.

| Signal Type | Typical Sampling Rate | Storage Strategy | Retention |
|---|---|---|---|
| Vibration (bearing analysis) | 5,000–50,000 Hz (50kHz) | Raw in S3/MinIO as .wav or HDF5; FFT features in InfluxDB | Raw: 7 days; features: 2 years |
| Current signature (motor) | 1,000–10,000 Hz | Same as vibration | Raw: 7 days; features: 2 years |
| Temperature (process) | 0.1–1 Hz | InfluxDB / TimescaleDB hypertable | 5 years |
| Pressure (hydraulic/pneumatic) | 1–10 Hz | InfluxDB | 5 years |
| Vibration (low-freq monitoring) | 10–100 Hz | InfluxDB | 2 years |
| Machine state (running/idle/fault) | Event-driven | PostgreSQL event log | Permanent |
| Alarm/fault events | Event-driven | PostgreSQL + Kafka topic | Permanent |
| Cycle count / part counter | Per-cycle | PostgreSQL | Permanent |

**Contrast with I06:** I06 GPS data is uniformly 1–30s interval per vehicle and all stored the same way (TimescaleDB hypertable). Manufacturing has heterogeneous sampling regimes requiring different storage formats for the same plant.

#### machine_sensor_reading table (InfluxDB / TimescaleDB)

| Column | Type | Description |
|---|---|---|
| `ts` | TIMESTAMPTZ PK | Measurement timestamp (UTC, microsecond precision) |
| `asset_id` | VARCHAR(36) | Machine/equipment identifier |
| `tag_name` | VARCHAR(100) | OPC-UA tag path or sensor name (e.g., `Line1.Motor3.Vibration_RMS`) |
| `value` | DOUBLE PRECISION | Numeric reading in engineering units |
| `unit` | VARCHAR(20) | mm/s, °C, bar, A, RPM, etc. |
| `quality_code` | SMALLINT | OPC-UA quality: 192=Good, 0=Bad, 64=Uncertain |
| `alarm_active` | BOOLEAN | True if value exceeds configured alarm threshold |
| `source` | VARCHAR(30) | PLC tag, historian tag, direct sensor |

**TimescaleDB hypertable config:** Partition by `ts` with 1-day chunks. Compress chunks older than 7 days (TimescaleDB native compression: ~10x ratio for manufacturing sensor data).

#### machine_event_log table (PostgreSQL)

| Column | Type | Description |
|---|---|---|
| `event_id` | BIGINT PK | Surrogate key |
| `asset_id` | VARCHAR(36) | Machine identifier |
| `event_ts` | TIMESTAMPTZ | Event timestamp (UTC) |
| `event_type` | VARCHAR(50) | MACHINE_START, MACHINE_STOP, ALARM_ACTIVE, ALARM_CLEAR, FAULT, MAINTENANCE_START, MAINTENANCE_END, PRODUCT_CHANGEOVER |
| `event_code` | VARCHAR(20) | PLC/SCADA event code |
| `description` | TEXT | Human-readable event description |
| `operator_id` | VARCHAR(36) | Operator who acknowledged (if applicable) |
| `duration_sec` | INT | For state-change pairs (computed by pipeline) |
| `shift_id` | VARCHAR(20) | Shift reference (A/B/C) |
| `created_at` | TIMESTAMPTZ | Pipeline ingestion timestamp |

### 1.5 Quality Data

Quality data is the manufacturing analog of I06's waybill documents — it proves that a product meets specification. But unlike a waybill (one document per shipment), quality data is multi-layered: raw material incoming quality, in-process inspection, and final product release.

#### defect_inspection_record table

| Column | Type | Nullable | Description |
|---|---|---|---|
| `inspection_id` | VARCHAR(36) | NO | UUID, primary key |
| `inspection_ts` | TIMESTAMPTZ | NO | When inspection occurred (UTC) |
| `line_id` | VARCHAR(36) | NO | Production line identifier |
| `workstation_id` | VARCHAR(36) | NO | Inspection station |
| `product_code` | VARCHAR(50) | NO | Product/part number |
| `batch_id` | VARCHAR(50) | NO | Production batch/lot number |
| `serial_number` | VARCHAR(100) | YES | Part serial number (if serialized) |
| `inspection_method` | VARCHAR(30) | NO | AUTOMATED_VISION, MANUAL, CMM, AOI |
| `result` | VARCHAR(20) | NO | PASS, FAIL, REWORK, SCRAP |
| `defect_type` | VARCHAR(50) | YES | Defect classification code |
| `defect_subtype` | VARCHAR(50) | YES | Sub-classification |
| `defect_severity` | VARCHAR(10) | YES | CRITICAL, MAJOR, MINOR |
| `defect_location_x` | DECIMAL(8,4) | YES | X coordinate on part (mm or normalized) |
| `defect_location_y` | DECIMAL(8,4) | YES | Y coordinate on part |
| `image_path` | TEXT | YES | S3/MinIO path to defect image |
| `bounding_box` | JSONB | YES | `{"x":100,"y":200,"w":50,"h":30}` |
| `confidence_score` | DECIMAL(5,4) | YES | Model confidence (0.0–1.0) for AI inspection |
| `inspector_id` | VARCHAR(36) | YES | Human inspector ID (null if fully automated) |
| `disposition` | VARCHAR(30) | YES | ACCEPT, REWORK, SCRAP, HOLD_FOR_REVIEW |
| `disposition_ts` | TIMESTAMPTZ | YES | When disposition was recorded |
| `ncr_id` | VARCHAR(36) | YES | Link to Non-Conformance Report if raised |
| `created_at` | TIMESTAMPTZ | NO | Record creation timestamp |

**Traceability chain:** `serial_number` / `batch_id` → `production_order_id` → `bom_version` → `material_lot_id`. Full forward and backward traceability (mandatory for automotive, pharma, electronics under ISO 9001/IATF 16949).

### 1.6 Production Order Data

Production orders (work orders) are the manufacturing equivalent of I06's shipment orders — they represent the unit of work. But manufacturing production orders carry significantly more complexity: Bill of Materials, routing (sequence of operations), and actual vs. planned cycle time tracking.

#### production_order table

| Column | Type | Nullable | Description |
|---|---|---|---|
| `order_id` | VARCHAR(36) | NO | Production order number (from ERP) |
| `product_code` | VARCHAR(50) | NO | Finished product code |
| `bom_version` | VARCHAR(20) | NO | Bill of Materials version used |
| `routing_version` | VARCHAR(20) | NO | Routing (operations sequence) version |
| `planned_qty` | INT | NO | Planned production quantity |
| `actual_qty_good` | INT | YES | Actual good units produced |
| `actual_qty_scrap` | INT | YES | Scrapped units |
| `actual_qty_rework` | INT | YES | Units sent to rework |
| `planned_start_ts` | TIMESTAMPTZ | NO | ERP planned start |
| `actual_start_ts` | TIMESTAMPTZ | YES | Actual start (from MES/sensor) |
| `planned_end_ts` | TIMESTAMPTZ | NO | ERP planned end |
| `actual_end_ts` | TIMESTAMPTZ | YES | Actual completion |
| `line_id` | VARCHAR(36) | NO | Assigned production line |
| `shift_id` | VARCHAR(20) | NO | Production shift |
| `planned_cycle_time_sec` | INT | YES | Standard cycle time per unit (seconds) |
| `actual_cycle_time_sec` | INT | YES | Measured average actual cycle time |
| `oee_score` | DECIMAL(5,4) | YES | OEE = Availability × Performance × Quality |
| `order_status` | VARCHAR(20) | NO | PLANNED, RELEASED, IN_PROGRESS, COMPLETED, CANCELLED |
| `priority` | SMALLINT | NO | 1=Emergency, 2=High, 3=Normal, 4=Low |
| `customer_order_id` | VARCHAR(36) | YES | Link to customer order (for make-to-order) |
| `due_date` | DATE | NO | Delivery commitment date |
| `created_at` | TIMESTAMPTZ | NO | Pipeline ingestion timestamp |
| `source_system` | VARCHAR(30) | NO | SAP, Oracle, FAST, MES, manual |

---

## 2. IIoT Data Pipeline

### 2.1 Full OPC-UA → Kafka Pipeline

```
[PLC / SCADA OPC-UA Server]
    OPC-UA tags polled at configured intervals (e.g., 100ms for critical, 1s for process temps)
        |
    OPC-UA Client (Python asyncua library, or Kepware, or Ignition OPC-UA module)
        |
    MQTT Publisher (Eclipse Mosquitto / HiveMQ)
    Topic pattern: factory/{plant_id}/{line_id}/{asset_id}/{tag_name}
    Payload: {"ts": "2026-04-03T08:00:00.123Z", "v": 24.7, "q": 192}
        |
    [Edge Gateway — NVIDIA Jetson / Siemens IPC]
    - Local MQTT broker (Mosquitto)
    - Edge inference: anomaly pre-filter (saves bandwidth — only send anomalous + sampled normal)
    - Local buffer (SQLite or RocksDB): 48h of data if WAN link drops
        |
    [WAN / VPN to Cloud or Data Center]
        |
    Apache Kafka
    Topic: manufacturing.sensors.{plant_id}.raw
    Topic: manufacturing.alarms.{plant_id}
    Topic: manufacturing.quality.{plant_id}.inspection
    Topic: manufacturing.orders.{plant_id}.events
        |
    Kafka Streams / Apache Flink
    - Windowed aggregations (1min, 5min, 1h rolling stats)
    - Alarm deduplication (PLCs can emit same alarm 100x/second during fault)
    - Join sensor stream with production order context
        |
    [Sinks]
    InfluxDB / TimescaleDB  ← aggregated sensor readings (1min resolution)
    S3 / MinIO              ← raw sensor archives (Parquet, daily)
    PostgreSQL              ← machine events, alarms, production orders
    Feature Store           ← pre-computed ML features
```

**Contrast with I06 pipeline:** I06 sources are IT systems with REST APIs — straightforward Kafka Connect HTTP Source connectors. Manufacturing requires OPC-UA client code at the edge, MQTT brokering, and WAN buffering logic not needed in logistics.

### 2.2 Edge vs. Cloud Processing Decision

The edge/cloud split is the most critical architectural decision in manufacturing IIoT — and has no direct equivalent in I06.

| Decision | Process at Edge | Send to Cloud |
|---|---|---|
| **Latency requirement** | <30ms (real-time reject, safety interlock) | >100ms acceptable (analytics, training) |
| **Use case** | Vision inspection pass/reject → actuator | Model retraining on defect history |
| **Use case** | Vibration threshold alarm → PLC stop | RUL prediction (non-real-time) |
| **Use case** | Tool wear detection → operator alert | Yield trend analysis |
| **Use case** | Power anomaly → immediate shutdown | Production scheduling optimization |
| **Bandwidth** | Not suitable for 50kHz raw vibration (20MB/s per sensor) | FFT features only (100 bytes/s per sensor) |
| **Privacy/Security** | Production IP stays on-premise | Aggregated metrics and features are safe |

**Edge computing hardware options:**
| Tier | Hardware | Use Case | Cost |
|---|---|---|---|
| High-performance | NVIDIA Jetson AGX Orin | Multi-camera vision + vibration inference | ~$1,000–2,000 |
| Mid-range | NVIDIA Jetson Orin NX | Single camera vision or PdM inference | ~$400–700 |
| Low-power | Raspberry Pi 4 / 5 + accelerator | Temperature/pressure monitoring, simple ML | ~$80–200 |
| Industrial-grade | Siemens IPC 427E / Advantech AIR-300 | Harsh environments, -20°C to 70°C | $3,000–8,000 |

### 2.3 Data Sampling Strategies

Unlike I06 (uniform GPS ping rate), manufacturing sensors require deliberate sampling strategy design:

| Signal | Recommended Rate | Rationale | Storage per Sensor per Day |
|---|---|---|---|
| High-freq vibration (bearing FFT) | 25.6kHz burst, every 10min | Nyquist for bearing fault freq (BPFO up to 10kHz); burst mode saves storage | ~300 MB (raw), ~50 KB (features) |
| Low-freq vibration (overall RMS) | 1 Hz continuous | Trend monitoring; low frequency content sufficient | ~700 KB |
| Temperature (process) | 0.1–1 Hz | Thermal time constants are seconds to minutes | ~70–700 KB |
| Pressure (hydraulic) | 10 Hz | Pressure transients can be fast but not ultrasonic | ~7 MB |
| Current signature (motor) | 5kHz burst, every 30min | MCSA requires high freq for rotor slot harmonics | ~150 MB (raw) |
| Machine state (OEE) | Event-driven (state change) | Discrete state: running/idle/fault; no polling needed | ~1 KB (events) |
| Vision images | Trigger per part | One image per part at inspection point | 1–5 MB/image |

**Adaptive sampling:** When anomaly score exceeds threshold (e.g., vibration RMS > 2σ), increase sampling rate automatically (10x) and retain raw data for 48h for post-event analysis.

### 2.4 PLC Protocol Connector Strategies

| PLC Brand | Protocol | Connector Approach | Notes |
|---|---|---|---|
| **Siemens S7-1200/1500** | S7-Plus / OPC-UA native | Use built-in OPC-UA server (TIA Portal ≥V15); no gateway needed for modern | Most common in Vietnam FDI factories |
| **Siemens S7-300/400** (legacy) | S7-MPI / Profibus | Kepware KEPServerEX S7 driver → OPC-UA gateway, or python-snap7 library | 10–20 year old PLCs; common in older Vietnam plants |
| **Mitsubishi MELSEC Q/iQ-R** | SLMP / MC Protocol | Kepware Mitsubishi driver, or Ignition Mitsubishi tag driver | Japanese-owned factories (Honda, Denso, Canon) |
| **Allen-Bradley / Rockwell** | EtherNet/IP / CIP | Kepware Allen-Bradley driver, or python-cpppo (EtherNet/IP) | Some US-owned or global Tier 1 suppliers |
| **Modbus RTU/TCP** (generic) | Modbus | Direct: modbus-tk (Python), pymodbus; or Kafka Connect Modbus source | Legacy sensors, energy meters |
| **Unknown/proprietary** | OPC-DA or serial | OPC-DA → OPC-UA wrapper (Matrikon OPC Tunneller, or OPC Foundation migration tool) | Worst case: requires reverse engineering or vendor support |

**Recommended universal strategy:** Deploy **Kepware KEPServerEX** or **Ignition** as the OPC-UA aggregation layer — these support 150+ PLC drivers and expose a single OPC-UA endpoint to the MQTT bridge, abstracting all vendor-specific protocols. Kepware is the industry standard; Ignition is open and more cost-effective for mid-market.

---

## 3. Feature Engineering for Manufacturing ML

### 3.1 B03 Computer Vision — Defect Detection Features

Manufacturing vision feature engineering differs fundamentally from I06 (which has no CV component). The primary challenge is industrial visual variability: factory lighting fluctuates, part positioning varies, and defect classes are severely imbalanced (defect rate often 0.1–2%).

**Image preprocessing pipeline:**
```python
# Factory lighting normalization pipeline
transforms = [
    # Step 1: Normalize for factory lighting variation
    CLAHE(clipLimit=2.0, tileGridSize=(8,8)),  # Contrast Limited Adaptive Histogram Equalization
    # Step 2: Remove camera-specific noise
    GaussianBlur(kernel=(3,3)),                 # Reduces salt-and-pepper from vibration
    # Step 3: Standardize input range
    Normalize(mean=[0.485, 0.456, 0.406],       # ImageNet stats (transfer learning base)
              std=[0.229, 0.224, 0.225]),
    # Step 4: Resize to model input
    Resize(224, 224),                            # or 512x512 for fine defect detection
]

# Augmentation strategy for rare defects (imbalanced classes)
rare_defect_augmentation = [
    RandomRotation(degrees=180),        # Defects can appear at any orientation
    RandomFlip(horizontal=True, vertical=True),
    ColorJitter(brightness=0.3,         # Simulate lighting variation
                contrast=0.3,
                saturation=0.1),
    ElasticTransform(alpha=50, sigma=5), # Simulate surface texture variation
    CutMix(alpha=0.3),                   # Synthetic minority oversampling for rare classes
    # Synthetic defect generation (GAN or copy-paste augmentation)
    SyntheticDefectPaste(defect_library_path='s3://factory-vision/defect-library/'),
]
```

**PatchCore embedding approach for anomaly detection:**
- Train PatchCore on GOOD images only (no defect labels required) — critical for Vietnam factories where labeled defect data is scarce
- Extract patch embeddings from ResNet/WideResNet backbone at multiple scales
- Build a coreset memory bank of normal patch embeddings
- At inference: compare new image patches to memory bank; anomaly score = max nearest-neighbor distance
- Threshold calibration: use 95th percentile of validation normal images as reject threshold

| Feature | Description | Engineering Note |
|---|---|---|
| `patch_anomaly_score` | Max distance from normal memory bank | PatchCore output; primary decision feature |
| `region_anomaly_map` | Pixel-level anomaly heatmap (224×224) | Localize defect for operator review |
| `defect_class_logit` | Softmax outputs per defect class | Only if labeled training data available |
| `confidence_score` | Model confidence (max softmax or 1-anomaly_score) | Used to route borderline cases to human review |
| `image_brightness_mean` | Mean pixel value | Detect camera/lighting failures (sudden change = camera fault) |
| `image_sharpness_score` | Laplacian variance | Detect lens contamination / vibration blur |
| `inspection_trigger_lag_ms` | Time from encoder trigger to image capture | Data quality metric: lag > 5ms = image position error |

### 3.2 B07 Predictive Maintenance — Vibration and Multi-Sensor Features

Predictive maintenance (PdM) feature engineering has no I06 equivalent — it is the most computationally intensive feature pipeline in manufacturing.

**Vibration FFT feature extraction:**
```python
import numpy as np
from scipy import signal
from scipy.stats import kurtosis

def extract_vibration_features(raw_signal: np.ndarray, fs: float, 
                                shaft_rpm: float, bearing_geometry: dict) -> dict:
    """
    raw_signal: numpy array of acceleration readings (g), length N
    fs: sampling frequency (Hz), e.g., 25600
    shaft_rpm: current shaft speed (from tachometer or PLC)
    bearing_geometry: BPFI, BPFO, BSF, FTF from bearing datasheet
    """
    N = len(raw_signal)
    
    # --- Time-domain features ---
    rms = np.sqrt(np.mean(raw_signal**2))          # Root Mean Square (overall vibration level)
    peak = np.max(np.abs(raw_signal))               # Peak amplitude
    crest_factor = peak / (rms + 1e-10)            # Crest Factor (>6 indicates impulsive faults)
    kurt = kurtosis(raw_signal)                     # Kurtosis (>4 indicates bearing fault)
    skewness = np.mean(((raw_signal - raw_signal.mean())/raw_signal.std())**3)
    
    # --- Frequency-domain features (FFT) ---
    freqs = np.fft.rfftfreq(N, d=1/fs)
    fft_mag = np.abs(np.fft.rfft(raw_signal)) * 2 / N
    
    # Shaft frequency and harmonics
    shaft_freq = shaft_rpm / 60
    shaft_1x_energy = _band_energy(fft_mag, freqs, shaft_freq * 0.9, shaft_freq * 1.1)
    shaft_2x_energy = _band_energy(fft_mag, freqs, shaft_freq*1.9, shaft_freq*2.1)
    shaft_3x_energy = _band_energy(fft_mag, freqs, shaft_freq*2.9, shaft_freq*3.1)
    
    # Bearing fault frequencies (from geometry)
    bpfo_energy = _band_energy(fft_mag, freqs,
                               bearing_geometry['BPFO']*shaft_freq * 0.9,
                               bearing_geometry['BPFO']*shaft_freq * 1.1)  # Outer race fault
    bpfi_energy = _band_energy(fft_mag, freqs,
                               bearing_geometry['BPFI']*shaft_freq * 0.9,
                               bearing_geometry['BPFI']*shaft_freq * 1.1)  # Inner race fault
    bsf_energy  = _band_energy(fft_mag, freqs,
                               bearing_geometry['BSF']*shaft_freq * 0.9,
                               bearing_geometry['BSF']*shaft_freq * 1.1)   # Ball spin fault
    
    # --- Envelope analysis (for early bearing fault detection) ---
    # 1. Bandpass filter around resonance frequency (typically 2–10kHz)
    sos = signal.butter(4, [2000/(fs/2), 10000/(fs/2)], btype='band', output='sos')
    filtered = signal.sosfilt(sos, raw_signal)
    envelope = np.abs(signal.hilbert(filtered))
    env_freqs = np.fft.rfftfreq(N, d=1/fs)
    env_fft = np.abs(np.fft.rfft(envelope)) * 2 / N
    env_bpfo = _band_energy(env_fft, env_freqs,
                             bearing_geometry['BPFO']*shaft_freq*0.85,
                             bearing_geometry['BPFO']*shaft_freq*1.15)
    
    return {
        'rms': rms, 'peak': peak, 'crest_factor': crest_factor,
        'kurtosis': kurt, 'skewness': skewness,
        'shaft_1x_energy': shaft_1x_energy,
        'shaft_2x_energy': shaft_2x_energy,
        'shaft_3x_energy': shaft_3x_energy,
        'bpfo_energy': bpfo_energy, 'bpfi_energy': bpfi_energy, 'bsf_energy': bsf_energy,
        'envelope_bpfo_energy': env_bpfo,
    }
```

**Multi-sensor fusion feature table for PdM:**

| Feature | Source Sensor | Engineering Note |
|---|---|---|
| `vibration_rms` | Accelerometer | Overall health indicator; baseline established in first 2 weeks |
| `vibration_crest_factor` | Accelerometer | >6 indicates impulsive fault (bearing spalling) |
| `vibration_kurtosis` | Accelerometer | >4 = bearing fault indicator; sensitive to early-stage |
| `bpfo_energy` | Accelerometer + FFT | Outer race bearing fault; most common failure mode |
| `bpfi_energy` | Accelerometer + FFT | Inner race bearing fault; often causes higher harmonics |
| `motor_temperature` | Thermocouple / PT100 | >90°C = cooling issue or overload |
| `temp_gradient_per_hour` | Thermocouple | Rate of change; sudden gradient = cooling failure |
| `motor_current_rms` | Current clamp | Increased current at same load = mechanical friction |
| `current_thd` | Current clamp + FFT | Total Harmonic Distortion; >5% = winding fault developing |
| `oil_temperature` | Thermocouple | Gearbox oil temp > 80°C = overload or lubrication issue |
| `speed_deviation_pct` | Encoder / tachometer | Load-normalized speed drop = torque demand increase |
| `health_score` | Ensemble of above | Composite 0–100 score; RUL model input |
| `days_since_last_maintenance` | CMMS system | Critical maintenance scheduling context feature |
| `cumulative_operating_hours` | PLC hour counter | Degradation baseline normalization |

### 3.3 B06 Production Scheduling Features

| Feature Group | Features | Engineering Notes |
|---|---|---|
| **Machine state** | `machine_availability_pct`, `current_state` (running/setup/idle/fault), `setup_time_min` | Computed from event log; rolling 8h window |
| **Queue features** | `queue_length_units`, `queue_urgency_score` (weighted by due-date proximity), `wip_value_vnd` | Join production orders with machine assignment |
| **Job features** | `planned_cycle_time_sec`, `actual_vs_planned_ratio` (last 10 jobs), `changeover_time_min` | Historical per product-machine combination |
| **Priority** | `order_priority`, `days_to_due_date`, `customer_tier` (A/B/C), `penalty_per_day_delay_vnd` | From ERP; customer contracts |
| **Material availability** | `material_stock_days`, `material_shortage_risk_flag` | From ERP inventory; join to BOM |
| **Capacity** | `line_utilization_8h`, `bottleneck_station_flag`, `parallel_line_availability` | Computed from production order actuals |
| **Maintenance window** | `next_planned_maintenance_ts`, `hours_to_next_maintenance` | From CMMS; avoid scheduling through PM |
| **External** | `order_due_dates_next_48h_count`, `rush_order_flag` | From ERP; integrate with customer portal |

**Key difference from I06 Route Optimization (B06):** I06 scheduling optimizes vehicle-stop assignment in physical space using GPS features. Manufacturing scheduling optimizes job-machine assignment in time using PLC/MES features. The constraint solver structure is similar (both are variants of the Vehicle Routing Problem / Job Shop Problem), but the feature domains are entirely different.

### 3.4 B01 Production Forecasting Features

| Feature Group | Features | Engineering Notes |
|---|---|---|
| **Capacity** | `installed_capacity_units_per_shift`, `available_capacity_after_maintenance`, `oee_rolling_30d` | From production order actuals + maintenance calendar |
| **Yield history** | `first_pass_yield_pct_7d`, `first_pass_yield_pct_30d`, `scrap_rate_pct` | From defect inspection records |
| **Order book** | `confirmed_orders_next_30d`, `forecast_orders_next_30d`, `order_book_fill_pct` | From ERP + commercial forecast |
| **Maintenance windows** | `planned_downtime_hours_next_30d`, `pm_schedule_flag` | From CMMS |
| **Material constraints** | `material_shortage_risk_score`, `supplier_lead_time_days` | From ERP + procurement |
| **Seasonal** | `vn_holiday_flag`, `tet_period_flag`, `lunar_month` | Same as I06; shared dim_date dimension |
| **Operational** | `new_product_intro_flag`, `engineering_change_flag` | Yield typically drops 20–40% on new product/change |

**Shared pattern with I06:** Both modules use the same `dim_date` dimension with Vietnamese holiday flags. The MAESTRO shared dimension library (Tet period, VN public holidays, lunar calendar) applies here directly.

---

## 4. Vietnam Manufacturing Data Challenges

### 4.1 Legacy PLC Data Access

**Context:** Approximately 60–70% of domestic Vietnamese factories and many older FDI plants run PLCs that are 10–20 years old (Siemens S7-300, S7-400, Mitsubishi Q-series) without native OPC-UA support. These PLCs communicate via older protocols: S7-MPI, Profibus, or even RS-232 serial Modbus.

**Challenge tiers:**
| PLC Age | Protocol | OPC-UA Support | Engineering Approach |
|---|---|---|---|
| < 5 years | Native OPC-UA | Yes | Direct connection; no wrapper needed |
| 5–15 years | Profibus / ProfiNet / EtherNet/IP | Partial | Kepware or Ignition driver → OPC-UA |
| 15–25 years | S7-MPI, Modbus RTU, proprietary | No | python-snap7 (S7-300/400), pymodbus (Modbus), or hardware protocol converter |
| > 25 years | Serial RS-232, proprietary | No | Serial-to-Ethernet converter + custom parser; may require PLC vendor support |

**Recommended wrapper strategy for Vietnam:**
1. **Kepware KEPServerEX** (commercial, $2,000–5,000/server): Supports 150+ driver types; deploy one instance per plant; exposes single OPC-UA endpoint; lowest engineering risk
2. **Ignition by Inductive Automation** (commercial, ~$3,000 + module licenses): Open platform; strong community; Mitsubishi, Siemens, Allen-Bradley drivers; can also serve as SCADA replacement
3. **python-snap7** + custom service (open-source): Free; works for Siemens S7-300/400; requires Python developer; maintenance risk if developer leaves
4. **Hardware protocol converter** (e.g., Moxa, Advantech): For serial/Modbus legacy; $200–500/unit; transparent to software layer

**Vietnam-specific note:** Many domestic factories in Binh Duong, Dong Nai industrial zones have Mitsubishi MELSEC PLCs (Q-series, FX-series) from Japanese OEM equipment (injection molding machines, metal stamping presses). These require the Mitsubishi MC Protocol driver — not all OPC-UA gateways support it. Ignition's Mitsubishi driver is the most reliable option.

### 4.2 Paper-Based Quality Records

**Context:** SME domestic manufacturers and many mid-market factories still record quality inspection results on paper forms (phiếu kiểm tra chất lượng). This is the biggest single barrier to manufacturing AI in Vietnam — there is no digital quality history to train models on.

**Digitization roadmap (phased approach):**

**Phase 1: Structured paper capture (Month 1–3)**
- Design standardized paper forms with checkboxes, drop-down codes, and QR code printed on each form linking to production order
- Train inspectors on consistent form filling
- Scan forms daily using smartphone + app (e.g., Microsoft Lens → SharePoint, or custom Android app with camera capture)
- Store scans: S3/MinIO with naming: `{plant_id}/{line_id}/{date}/{form_id}.jpg`

**Phase 2: OCR extraction pipeline (Month 2–6)**
```
Scanned image (S3)
    → AWS Textract / Google Document AI / PaddleOCR (open-source)
    → Extracted fields (JSON): batch_id, inspector_id, defect_codes, quantities
    → Confidence scoring: flag low-confidence fields for manual verification
    → Write to defect_inspection_record table (with source='OCR_PAPER', ocr_confidence)
    → Human review queue for records with confidence < 0.85
```

**Phase 3: Digital-first input (Month 4–12)**
- Tablet or industrial touchscreen at each inspection station
- Simple form app (React Native or low-code: AppSheet / PowerApps) feeding directly to API
- Barcode/QR scan for product identification eliminates manual entry errors
- Voice input (Vietnamese STT) for defect description fields

**OCR challenges specific to Vietnamese manufacturing forms:**
- Handwritten Vietnamese with diacritical marks (ố, ứ, ẻ) is challenging for general OCR; fine-tune PaddleOCR with Vietnamese manufacturing vocabulary
- Inconsistent abbreviations: "KĐ" = không đạt (fail), "ĐẠT" = pass — build factory-specific vocabulary normalizer
- Table cell borders often incomplete after photocopying; use table structure detection (PaddleOCR Table Recognition)

### 4.3 Shift Handover Data Gaps

**Context:** Vietnamese factories typically run 2–3 shifts (ca sáng, ca chiều, ca đêm). At shift transitions (6:00, 14:00, 22:00), there is a systematic data quality degradation window of 15–30 minutes due to:
- Operators logging off production systems before transition complete
- Machines in ambiguous states (mid-cycle, warming up)
- Handover notes recorded on paper, not digitally
- Sensor data may continue but production context (operator, order) is unlinked

**Detection and handling strategy:**

```python
# Shift boundary detection and gap flagging
SHIFT_BOUNDARIES = ['06:00', '14:00', '22:00']  # VN standard shifts
HANDOVER_WINDOW_MINUTES = 30

def flag_shift_handover_records(df: pd.DataFrame, ts_col: str) -> pd.DataFrame:
    """Flag records within handover window for imputation/exclusion."""
    df['hour_minute'] = df[ts_col].dt.strftime('%H:%M')
    df['in_handover_window'] = False
    for boundary in SHIFT_BOUNDARIES:
        boundary_ts = pd.Timestamp(boundary)
        window_start = (boundary_ts - pd.Timedelta(minutes=5)).strftime('%H:%M')
        window_end   = (boundary_ts + pd.Timedelta(minutes=HANDOVER_WINDOW_MINUTES)).strftime('%H:%M')
        df.loc[df['hour_minute'].between(window_start, window_end), 'in_handover_window'] = True
    return df

# Imputation strategy for sensor data during handover
# Option 1: Forward-fill (appropriate for slow-changing signals: temperature, pressure)
# Option 2: Mark as NULL + interpolate later in feature engineering
# Option 3: Exclude handover window from training data (recommended for quality classification)
```

**Production count imputation during handover:** If cycle counter resets or pauses during shift change, use the previous shift's average cycle time to estimate missing unit count:
```
estimated_units = (gap_duration_sec / avg_cycle_time_sec_last_shift) × first_pass_yield
```

**Feature engineering note:** Add `shift_id` (A/B/C), `minutes_since_shift_start`, and `in_handover_window` as explicit features — models can learn that quality metrics are less reliable near shift boundaries.

### 4.4 Power Outage Data Gaps

**Context:** Vietnam's industrial zones, especially in northern provinces (Bac Ninh, Hai Phong, Hung Yen), experience unplanned power outages (mất điện) ranging from seconds to hours. These cause:
- Complete data loss during outage (no sensors, no PLC, no historian)
- Machine state is unknown during outage
- Production counts are inaccurate (mid-cycle parts lost)
- On restoration, some PLCs have boot-time initialization periods where sensor readings are invalid

**Detection strategy:**
```python
# Gap detection in time-series data
def detect_data_gaps(df: pd.DataFrame, ts_col: str, asset_id: str,
                     expected_interval_sec: int = 60,
                     gap_threshold_sec: int = 300) -> pd.DataFrame:
    """
    Identify gaps larger than threshold in time-series data.
    Returns DataFrame of gap events.
    """
    df_sorted = df.sort_values(ts_col)
    df_sorted['next_ts'] = df_sorted[ts_col].shift(-1)
    df_sorted['gap_sec'] = (df_sorted['next_ts'] - df_sorted[ts_col]).dt.total_seconds()
    gaps = df_sorted[df_sorted['gap_sec'] > gap_threshold_sec].copy()
    gaps['gap_type'] = gaps['gap_sec'].apply(lambda x:
        'POWER_OUTAGE' if x > 3600 else
        'NETWORK_ISSUE' if x > 300 else
        'SHORT_INTERRUPTION'
    )
    gaps['asset_id'] = asset_id
    return gaps[['asset_id', ts_col, 'next_ts', 'gap_sec', 'gap_type']]
```

**Post-outage data handling:**
1. **Sensor readings during boot (0–5 min after restore):** Mark as `quality_code = 64` (OPC-UA Uncertain). Exclude from training. Forward-fill from last known good value or set to NULL.
2. **Production count recovery:** Query PLC batch counter at end of gap vs. start. If counter reset (power loss cleared PLC memory), use manual operator report or camera-based counting if available.
3. **Gap imputation for ML features:** For PdM models, interpolate slow signals (temperature) linearly across gap. For vibration features, insert NULL — do not interpolate high-frequency features across gaps.
4. **Gap metadata table:** Maintain `power_outage_log` table (start_ts, end_ts, affected_lines, estimated_units_lost) populated from UPS logs, utility company reports, or operator input.

**Contrast with I06:** I06 handles GPS gaps when trucks enter tunnels or have device failures — but these are vehicle-level, minutes-long gaps handled by interpolation. Manufacturing power outages can affect entire plants for hours and invalidate all production data during that window, requiring explicit gap governance, not just interpolation.

---

## 5. Recommended Data Stack by Factory Tier

### Tier 1: FDI / Large Domestic — Enterprise Stack

**Profile:** >2,000 workers; existing MES (SAP ME, Opcenter); established OT network; likely already has OSIsoft PI historian; IT team of 5+ people.

**Examples:** Samsung Bac Ninh, Intel HCMC, LG Display Hai Phong, VinFast Hai Phong.

| Layer | Recommended Service | Notes |
|---|---|---|
| OT connectivity | Kepware KEPServerEX + OSIsoft PI (existing) | PI already installed; add PI Connector to Kafka |
| Streaming | AWS IoT Core + Amazon MSK (Managed Kafka) | MSK for high-throughput multi-line ingestion |
| Edge computing | NVIDIA Jetson AGX Orin (per line) | Vision inference + PdM at edge |
| Raw storage | Amazon S3 (data lake) | Parquet, partitioned by plant/line/date |
| Time-series | Amazon Timestream | Managed; integrates with SageMaker |
| Image storage | Amazon S3 + CloudFront | Large image volumes; CDN for annotation UI |
| Annotation | Label Studio (self-hosted on EC2) | Keep data on-premise/VPC; labeling team in-house |
| Transformation | AWS Glue (Spark) + dbt Cloud | Heavy ETL + SQL transforms |
| Warehouse | Amazon Redshift Serverless | OEE analytics, production dashboards |
| ML platform | AWS SageMaker (Training + Endpoints) | PdM models, vision models, scheduling |
| Feature store | AWS SageMaker Feature Store | Prevent training-serving skew |
| Orchestration | Amazon MWAA (Managed Airflow) | DAG management for batch pipelines |
| BI/Dashboard | Amazon QuickSight + Grafana (OEE) | Grafana for real-time OEE; QuickSight for analytics |
| Model registry | SageMaker Model Registry | Version control + A/B deployment |

**Estimated monthly cost:** $8,000–25,000 USD (varies by data volume, number of lines, ML inference frequency)

**Contrast with I06 cloud stack:** Same AWS backbone as I06 logistics enterprise stack. Key additions for manufacturing: IoT Core (device management), Timestream (high-frequency sensor data), and edge inference nodes (not needed in logistics).

### Tier 2: Mid-Market Domestic — Self-Hosted Open-Source Stack

**Profile:** 500–2,000 workers; basic ERP (FAST, SAP B1, MISA); some PLCs with data access; small IT team (1–3 people); budget-conscious.

**Examples:** Mid-size garment factories in Binh Duong, food processors, auto parts Tier 2 suppliers.

| Layer | Technology | Monthly Cost | Notes |
|---|---|---|---|
| OT connectivity | Ignition Edge (per machine) + Ignition Gateway | ~$300–500/site | Ignition is affordable; supports all major PLCs |
| MQTT broker | HiveMQ Community (self-hosted) or Eclipse Mosquitto | Free | Single-node sufficient |
| Streaming | Apache Kafka (3-node cluster) | $0 (software) + ~$200 (VPS) | Redpanda as lighter alternative |
| Edge inference | NVIDIA Jetson Orin NX (1–2 per plant) | $400–700 one-time per device | PdM + simple vision |
| Time-series | InfluxDB OSS 2.x | Free | Single node handles <5 lines |
| Image storage | MinIO (on-premise server) | ~$50–100/month (server) | S3-compatible; 10TB NVMe sufficient |
| Transformation | dbt Core + Airflow (single node) | Free | SQL-based, manageable for small team |
| Warehouse/Analytics | ClickHouse (single node) or DuckDB | Free | ClickHouse excellent for OEE queries |
| ML platform | MLflow (self-hosted) + Python scripts | Free | Train locally; simple model serving |
| Annotation | Label Studio Community (self-hosted) | Free | 1–2 annotators |
| BI/Dashboard | Grafana OSS + Metabase Community | Free | Grafana for real-time; Metabase for reports |
| Orchestration | Apache Airflow (single node) | Free | Cron-based pipeline scheduling |

**Total estimated monthly cost:** $500–1,500 USD (cloud VPS/hosting + software licenses)

**Key constraint:** InfluxDB free tier has limited cluster support — use single-node for <1,000 tags at 1Hz. If scale exceeds this, upgrade to InfluxDB Cloud Dedicated (~$500/month) or migrate to TimescaleDB (PostgreSQL extension, more flexible).

### Tier 3: SME Domestic — Starter Stack

**Profile:** <200 workers; paper-based quality records; basic or no ERP; 1 or no IT staff; limited budget; likely first-time digitization.

**Examples:** Small garment workshops in the Mekong Delta, small plastic injection shops, family-run food processors.

| Layer | Technology | One-Time Cost | Monthly Cost | Notes |
|---|---|---|---|---|
| OT connectivity | pymodbus (Python) on Raspberry Pi | ~$80 (Pi 5) | ~$5 (electricity) | For simple Modbus sensors/PLCs |
| Edge device | Raspberry Pi 5 (8GB) | ~$100 per machine | — | General purpose edge |
| Sensors (if none) | Vibration: ADXL345 ($5); Temp: DS18B20 ($2) | $20–50 per machine | — | Retrofit on existing machines |
| Local storage | SQLite (on Pi) → sync to cloud | Free | ~$10 (cloud sync) | Simple; survives without internet |
| Time-series | SQLite WAL mode with Python time-series queries | Free | — | Sufficient for <10 sensors |
| Image storage | Raspberry Pi + USB drive → nightly S3 sync | $30 (USB HDD) | ~$10–20 (S3) | Low-cost camera: Raspberry Pi Camera v3 ($25) |
| Dashboard | Grafana OSS on Pi or Metabase on $5/month VPS | Free | $5–10 | Simple OEE + alarm dashboard |
| Quality digitization | Google Forms / AppSheet (mobile) | Free | Free | Digital quality forms on cheap Android tablet |
| ML | Pre-trained models from MLflow (downloaded from Tier 1/2) | — | — | No training at this tier; use shared models |
| Alerts | Telegram Bot API (Python) → factory group chat | Free | Free | Fastest adoption in Vietnam; everyone uses Zalo/Telegram |

**Total estimated monthly cost:** <$200 USD

**Upgrade path:** Tier 3 → Tier 2 when: (a) factory adds >5 machines, (b) inspection data accumulates >6 months, (c) management requests production analytics beyond what Grafana provides.

**Vietnam-specific note:** Zalo (Vietnamese messaging app, 74M users) has a Bot API similar to Telegram. For maximum adoption in SME factories, use Zalo Bot for alerts instead of or in addition to Telegram — operators are more likely to respond to Zalo notifications than email.

---

## 6. Sample Data Schemas

### 6.1 Machine Sensor Event Table (Full Schema)

```json
{
  "table": "machine_sensor_reading",
  "description": "Grain: one row per sensor reading at configured sampling interval. Stored as TimescaleDB hypertable partitioned by ts (1-day chunks).",
  "storage": "TimescaleDB / InfluxDB / AWS Timestream",
  "partition_key": "ts",
  "compression": "Enabled after 7 days (TimescaleDB native, ~10x ratio)",
  "columns": [
    {"name": "ts",            "type": "TIMESTAMPTZ",      "nullable": false, "pk": true,
     "note": "UTC timestamp, microsecond precision. Primary partition column."},
    {"name": "asset_id",      "type": "VARCHAR(36)",      "nullable": false,
     "note": "FK to dim_asset. Identifies the machine or equipment."},
    {"name": "tag_name",      "type": "VARCHAR(100)",     "nullable": false,
     "note": "OPC-UA tag path or sensor label. E.g.: Line1.Press3.Vibration_X_RMS"},
    {"name": "value",         "type": "DOUBLE PRECISION", "nullable": true,
     "note": "Numeric reading in engineering units. NULL if quality_code indicates bad/uncertain."},
    {"name": "unit",          "type": "VARCHAR(20)",      "nullable": false,
     "note": "Engineering unit: mm/s, degC, bar, A, RPM, g, Hz, kW"},
    {"name": "quality_code",  "type": "SMALLINT",         "nullable": false, "default": 192,
     "note": "OPC-UA quality: 192=Good, 64=Uncertain (handover/boot), 0=Bad (sensor fault)"},
    {"name": "alarm_active",  "type": "BOOLEAN",          "nullable": false, "default": false,
     "note": "True if value breaches configured high/low alarm threshold in SCADA"},
    {"name": "alarm_level",   "type": "VARCHAR(10)",      "nullable": true,
     "note": "NULL, WARNING, ALARM, CRITICAL — from SCADA alarm configuration"},
    {"name": "shift_id",      "type": "VARCHAR(20)",      "nullable": true,
     "note": "Shift identifier: A (06:00-14:00), B (14:00-22:00), C (22:00-06:00)"},
    {"name": "in_handover_window", "type": "BOOLEAN",     "nullable": false, "default": false,
     "note": "True if within 30min of shift boundary — flag for imputation/exclusion"},
    {"name": "source",        "type": "VARCHAR(30)",      "nullable": false,
     "note": "Data origin: OPC_UA_POLL, MQTT_DIRECT, HISTORIAN_BACKFILL, MANUAL_ENTRY"},
    {"name": "pipeline_run_id","type": "VARCHAR(36)",     "nullable": true,
     "note": "Airflow DAG run ID or edge batch ID for lineage tracking"}
  ],
  "indexes": [
    {"columns": ["asset_id", "ts"], "note": "Primary query pattern: asset history"},
    {"columns": ["tag_name", "ts"], "note": "Tag-specific queries for feature extraction"},
    {"columns": ["alarm_active", "ts"], "note": "Alarm dashboards"},
    {"columns": ["ts"], "type": "BRIN", "note": "Auto-created by TimescaleDB chunk indexing"}
  ],
  "retention_policies": {
    "raw_1s_resolution": "90 days on hot storage",
    "1min_aggregates": "2 years",
    "1hour_aggregates": "10 years",
    "alarm_events": "permanent"
  }
}
```

### 6.2 Defect Inspection Record Table (Full Schema)

```json
{
  "table": "defect_inspection_record",
  "description": "Grain: one row per part inspection event. Covers automated vision inspection and manual inspection results.",
  "columns": [
    {"name": "inspection_id",      "type": "VARCHAR(36)",    "nullable": false, "pk": true,
     "note": "UUID generated at inspection time"},
    {"name": "inspection_ts",      "type": "TIMESTAMPTZ",    "nullable": false,
     "note": "Inspection timestamp (UTC). For automated: image capture time. For manual: form submission time."},
    {"name": "line_id",            "type": "VARCHAR(36)",    "nullable": false,
     "note": "Production line identifier"},
    {"name": "workstation_id",     "type": "VARCHAR(36)",    "nullable": false,
     "note": "Specific inspection station on the line"},
    {"name": "product_code",       "type": "VARCHAR(50)",    "nullable": false},
    {"name": "production_order_id","type": "VARCHAR(36)",    "nullable": false,
     "note": "FK to production_order. Links quality to production context."},
    {"name": "batch_id",           "type": "VARCHAR(50)",    "nullable": false,
     "note": "Lot/batch number for traceability"},
    {"name": "serial_number",      "type": "VARCHAR(100)",   "nullable": true,
     "note": "Individual part serial (serialized products only: electronics, automotive)"},
    {"name": "inspection_method",  "type": "VARCHAR(30)",    "nullable": false,
     "allowed_values": ["AUTOMATED_VISION", "MANUAL_VISUAL", "CMM", "AOI", "X_RAY", "ULTRASONIC"]},
    {"name": "result",             "type": "VARCHAR(20)",    "nullable": false,
     "allowed_values": ["PASS", "FAIL", "REWORK", "SCRAP", "HOLD"]},
    {"name": "defect_type",        "type": "VARCHAR(50)",    "nullable": true,
     "note": "Standardized defect code: SCRATCH, DENT, CRACK, DELAMINATION, CONTAMINATION, DIMENSION_OOT, SOLDER_BRIDGE, etc."},
    {"name": "defect_subtype",     "type": "VARCHAR(50)",    "nullable": true},
    {"name": "defect_severity",    "type": "VARCHAR(10)",    "nullable": true,
     "allowed_values": ["CRITICAL", "MAJOR", "MINOR"]},
    {"name": "defect_location_x",  "type": "DECIMAL(8,4)",  "nullable": true,
     "note": "X coordinate on part surface (mm from reference point, or normalized 0.0–1.0)"},
    {"name": "defect_location_y",  "type": "DECIMAL(8,4)",  "nullable": true},
    {"name": "image_path",         "type": "TEXT",           "nullable": true,
     "note": "S3/MinIO path: s3://factory-vision/{plant_id}/{line_id}/{product_code}/{YYYY}/{MM}/{DD}/{inspection_id}.jpg"},
    {"name": "thumbnail_path",     "type": "TEXT",           "nullable": true,
     "note": "Resized 224x224 thumbnail for fast retrieval in dashboards"},
    {"name": "bounding_box",       "type": "JSONB",          "nullable": true,
     "note": "Defect bounding box: {\"x\": 120, \"y\": 340, \"w\": 45, \"h\": 30} — pixel coordinates"},
    {"name": "segmentation_mask_path", "type": "TEXT",       "nullable": true,
     "note": "S3 path to pixel-level segmentation mask (for advanced models)"},
    {"name": "confidence_score",   "type": "DECIMAL(5,4)",  "nullable": true,
     "note": "AI model confidence 0.0–1.0. NULL for manual inspection."},
    {"name": "model_version",      "type": "VARCHAR(50)",    "nullable": true,
     "note": "MLflow model version that produced this result"},
    {"name": "inspector_id",       "type": "VARCHAR(36)",    "nullable": true,
     "note": "Human inspector employee ID. NULL if fully automated."},
    {"name": "shift_id",           "type": "VARCHAR(20)",    "nullable": false},
    {"name": "disposition",        "type": "VARCHAR(30)",    "nullable": true,
     "allowed_values": ["ACCEPT", "REWORK", "SCRAP", "HOLD_FOR_REVIEW", "CONCESSION_ACCEPTED"]},
    {"name": "disposition_ts",     "type": "TIMESTAMPTZ",   "nullable": true},
    {"name": "ncr_id",             "type": "VARCHAR(36)",    "nullable": true,
     "note": "FK to non_conformance_report table. Raised when defect batch triggers formal NCR."},
    {"name": "source",             "type": "VARCHAR(30)",    "nullable": false,
     "allowed_values": ["AUTOMATED_INLINE", "AUTOMATED_OFFLINE", "MANUAL_TABLET", "OCR_PAPER", "API_MES"]},
    {"name": "ocr_confidence",     "type": "DECIMAL(5,4)",  "nullable": true,
     "note": "OCR confidence if source=OCR_PAPER. Below 0.85 = sent to human review queue."},
    {"name": "created_at",         "type": "TIMESTAMPTZ",   "nullable": false, "default": "NOW()"}
  ],
  "indexes": [
    {"columns": ["production_order_id", "inspection_ts"]},
    {"columns": ["batch_id"]},
    {"columns": ["product_code", "defect_type", "inspection_ts"]},
    {"columns": ["result", "inspection_ts"]},
    {"columns": ["line_id", "shift_id", "inspection_ts"]}
  ]
}
```

### 6.3 Production Order Tracking Table (Full Schema)

```json
{
  "table": "production_order",
  "description": "Grain: one row per production order. Source of truth for production execution tracking. Fed by ERP (SAP/FAST/MISA) and updated in real-time by MES or sensor pipeline.",
  "columns": [
    {"name": "order_id",              "type": "VARCHAR(36)",   "nullable": false, "pk": true,
     "note": "ERP production order number. Natural key from source system."},
    {"name": "product_code",          "type": "VARCHAR(50)",   "nullable": false},
    {"name": "product_description",   "type": "TEXT",          "nullable": true},
    {"name": "bom_version",           "type": "VARCHAR(20)",   "nullable": false},
    {"name": "routing_version",       "type": "VARCHAR(20)",   "nullable": false},
    {"name": "line_id",               "type": "VARCHAR(36)",   "nullable": false},
    {"name": "shift_id",              "type": "VARCHAR(20)",   "nullable": true},
    {"name": "planned_qty",           "type": "INT",           "nullable": false},
    {"name": "actual_qty_good",       "type": "INT",           "nullable": true, "default": 0},
    {"name": "actual_qty_scrap",      "type": "INT",           "nullable": true, "default": 0},
    {"name": "actual_qty_rework",     "type": "INT",           "nullable": true, "default": 0},
    {"name": "first_pass_yield_pct",  "type": "DECIMAL(5,4)", "nullable": true,
     "note": "Computed: actual_qty_good / planned_qty"},
    {"name": "planned_start_ts",      "type": "TIMESTAMPTZ",  "nullable": false},
    {"name": "actual_start_ts",       "type": "TIMESTAMPTZ",  "nullable": true},
    {"name": "planned_end_ts",        "type": "TIMESTAMPTZ",  "nullable": false},
    {"name": "actual_end_ts",         "type": "TIMESTAMPTZ",  "nullable": true},
    {"name": "schedule_adherence_pct","type": "DECIMAL(5,4)", "nullable": true,
     "note": "Actual end vs planned end ratio. <1.0 = late."},
    {"name": "planned_cycle_time_sec","type": "INT",           "nullable": true,
     "note": "Standard cycle time per unit from routing (seconds)"},
    {"name": "actual_cycle_time_sec", "type": "INT",           "nullable": true,
     "note": "Measured: (actual_end - actual_start) / actual_qty_good"},
    {"name": "cycle_time_ratio",      "type": "DECIMAL(5,4)", "nullable": true,
     "note": "actual_cycle_time / planned_cycle_time. >1.2 triggers performance alert."},
    {"name": "oee_availability",      "type": "DECIMAL(5,4)", "nullable": true,
     "note": "Planned time - downtime / planned time"},
    {"name": "oee_performance",       "type": "DECIMAL(5,4)", "nullable": true,
     "note": "Actual output / theoretical max output"},
    {"name": "oee_quality",           "type": "DECIMAL(5,4)", "nullable": true,
     "note": "Good units / total units started"},
    {"name": "oee_score",             "type": "DECIMAL(5,4)", "nullable": true,
     "note": "OEE = availability × performance × quality. World class = 0.85+"},
    {"name": "order_status",          "type": "VARCHAR(20)",  "nullable": false,
     "allowed_values": ["PLANNED", "RELEASED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "ON_HOLD"]},
    {"name": "priority",              "type": "SMALLINT",     "nullable": false, "default": 3,
     "note": "1=Emergency, 2=High, 3=Normal, 4=Low"},
    {"name": "customer_order_id",     "type": "VARCHAR(36)",  "nullable": true},
    {"name": "due_date",              "type": "DATE",         "nullable": false},
    {"name": "days_late",             "type": "SMALLINT",     "nullable": true,
     "note": "Computed: actual_end_ts::date - due_date. Negative = early."},
    {"name": "has_power_outage_gap",  "type": "BOOLEAN",      "nullable": false, "default": false,
     "note": "True if a power outage gap was detected during this order's execution window"},
    {"name": "has_handover_gap",      "type": "BOOLEAN",      "nullable": false, "default": false,
     "note": "True if shift handover occurred during execution"},
    {"name": "source_system",         "type": "VARCHAR(30)",  "nullable": false,
     "note": "SAP, SAP_B1, FAST, MISA, MANUAL_CSV"},
    {"name": "created_at",            "type": "TIMESTAMPTZ",  "nullable": false, "default": "NOW()"},
    {"name": "updated_at",            "type": "TIMESTAMPTZ",  "nullable": false, "default": "NOW()"},
    {"name": "pipeline_run_id",       "type": "VARCHAR(36)",  "nullable": true}
  ],
  "indexes": [
    {"columns": ["line_id", "planned_start_ts"]},
    {"columns": ["product_code", "planned_start_ts"]},
    {"columns": ["due_date", "order_status"]},
    {"columns": ["customer_order_id"]},
    {"columns": ["order_status", "priority"]}
  ]
}
```

---

## Summary: Key Design Decisions

| Decision | Choice | Rationale | Contrast with I06 |
|---|---|---|---|
| OT connectivity | OPC-UA → MQTT bridge (Kepware/Ignition) | Industry-standard protocol translation; supports 150+ PLC types | I06 uses REST API connectors — no protocol bridge needed |
| Sensor storage | TimescaleDB hypertable + S3 Parquet archive | Handles heterogeneous sampling rates; native compression | I06 GPS uses same pattern; manufacturing adds 50kHz vibration (different retention) |
| Image storage | MinIO/S3 partitioned by plant/line/date/product | High-volume structured storage; MLflow linked for model versioning | I06 POD photos: S3 + MongoDB metadata. Manufacturing: purpose-built CV pipeline |
| Edge computing | NVIDIA Jetson per line (vision) + Pi (PdM sensors) | <30ms latency for quality reject; bandwidth savings for vibration | No edge compute in I06 — all processing cloud-side |
| Quality data | Tabular inspection records + JSONB bounding box + S3 images | Supports both manual and automated inspection; traceability chain | I06 has no inspection data model |
| Feature store | SageMaker / MLflow (same as I06) | Shared infrastructure; prevents training-serving skew | Same pattern as I06 — shared MAESTRO infrastructure |
| Gap handling | power_outage_log + quality_code OPC-UA flags + handover window flags | Manufacturing-specific data gaps require explicit governance | I06 GPS gaps: vehicle-level, minutes-long — simpler interpolation |
| Starter stack | Raspberry Pi + SQLite + Telegram/Zalo bot | <$200/month; proven hardware; Vietnam messaging app adoption | I06 SME: Redpanda + DuckDB. Manufacturing SME: simpler due to local sensor focus |
| OCR pipeline | PaddleOCR fine-tuned for Vietnamese + human review queue | Paper-based quality records are reality for SME factories | I06 has OCR for waybills (same technology, different document type) |

---

*Document: R-DE-notes.md | Module: I04 Manufacturing | MAESTRO Knowledge Graph Platform*
*Cross-reference: I06 R-DE-notes.md (shared patterns: dim_date, Kafka backbone, dbt transformation, SageMaker feature store, star schema, Airflow orchestration)*
