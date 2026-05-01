# Technical Architecture Report: I13 — Transportation & Mobility
**Agent:** R-β (Dr. Praxis)
**Date:** 2026-04-03
**Module:** Phase 2 — Industry I13
**Depth:** L2 (Technical Architecture)
**Companion Report:** R-α Research Report (Dr. Archon, 2026-04-03)

---

## Executive Summary

This report translates the market and AI-adoption findings from R-α into actionable technical architecture for the MAESTRO I13 module. Transportation & Mobility is architecturally distinct from Logistics (I06) in one fundamental way: **the passenger is inside the system in real time**. This drives sub-100ms latency requirements for matching, surge pricing, and ETA that simply do not exist in freight. The architecture is event-driven at its core (inherited from I06's Kappa pattern) but extends into geospatial real-time processing, edge AI for in-vehicle inference, and domain-specific stacks for aviation GDS, public transit GTFS, and EV battery management that have no I06 equivalent. Vietnam's motorbike-dominated urban environment introduces additional ML challenges that require purpose-built adaptations of Western ride-hailing stacks.

---

## 1. AI Tech Stack

### 1.1 Real-Time Telemetry Stack: IoT → Streaming ML

The telemetry pipeline is the backbone of transportation AI. Every GPS ping, OBD-II reading, and sensor event feeds downstream ML models.

```
┌────────────────────────────────────────────────────────────────────┐
│                      TELEMETRY PRODUCERS                           │
│  Vehicle GPS  │  OBD-II Dongle  │  ADAS Camera  │  Phone App GPS  │
│  Motorbike IoT│  Traffic Camera │  Charging Sensor│ GTFS-RT Feed   │
└───────────────────────────┬────────────────────────────────────────┘
                            │ MQTT (lightweight, IoT-native)
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│              MQTT BROKER (EMQX or HiveMQ)                        │
│  Topics: vehicle/{id}/gps  │  vehicle/{id}/obd  │  cam/{id}/event │
│  QoS 1 (at-least-once) for GPS; QoS 2 for safety-critical events  │
└───────────────────────────┬───────────────────────────────────────┘
                            │ Kafka Connect (MQTT Source Connector)
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│              KAFKA EVENT BUS (MSK / Confluent)                   │
│  transport.gps.raw         │  transport.obd.raw                   │
│  transport.trips.events    │  transport.charging.events           │
│  transit.gtfs_rt           │  traffic.camera.detections           │
└─────────┬────────────────────────────────┬─────────────────────── ┘
          │ Flink (stateful, <50ms)         │ Spark (micro-batch, 1-5min)
          ▼                                ▼
┌──────────────────────┐     ┌──────────────────────────────────────┐
│  STREAM PROCESSING   │     │         BATCH PROCESSING             │
│  - Ride matching     │     │  - Daily demand model training       │
│  - Surge price calc  │     │  - OBD fault pattern extraction      │
│  - ETA recalculation │     │  - Driver behavior scoring           │
│  - Geofence triggers │     │  - Battery degradation modeling      │
└──────────┬───────────┘     └────────────────┬─────────────────────┘
           ▼                                  ▼
┌──────────────────────┐     ┌──────────────────────────────────────┐
│  Redis (live state)  │     │  Data Lake (S3 + Delta Lake)         │
│  - Driver positions  │     │  - Historical trips, trajectories    │
│  - Surge multipliers │     │  - OBD time-series, GTFS archives    │
│  - ETA cache (30s)   │     │  - Training datasets, feature store  │
└──────────────────────┘     └──────────────────────────────────────┘
```

**MQTT vs. HTTP for vehicle telemetry:**
- MQTT uses ~10× less bandwidth than HTTP polling — critical for 4G-connected motorbikes in Vietnam where data cost matters.
- EMQX supports 100M+ concurrent connections; suitable for a national ride-hailing fleet.
- For battery-constrained IoT (charging stations, remote sensors): MQTT over LTE-M or NB-IoT.

**GPS ping rate recommendations:**
| Vehicle Type | Ping Interval | Events/day (1,000 vehicles) | Kafka partition count |
|---|---|---|---|
| Ride-hailing car/bike (active) | 5 seconds | 17.3M | 32 |
| Fleet truck (en route) | 30 seconds | 2.9M | 8 |
| Parked/idle vehicle | 5 minutes | 288K | 4 |
| Charging station sensor | 1 minute | 1.4M | 8 |

### 1.2 Ride-Hailing Platform Architecture

The ride-hailing matching problem is a sub-100ms combinatorial optimization problem at scale. Uber processes millions of trips per day across geographically distributed systems.

```
PASSENGER APP                          DRIVER APP
    │ POST /trip/request                   │ WebSocket (driver state)
    ▼                                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                   RIDE-HAILING PLATFORM                          │
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────┐   ┌─────────────┐  │
│  │ Demand Forecast │    │  Matching Engine  │   │ Surge Price │  │
│  │ (spatial-temp.) │───▶│  (Hungarian Alg  │   │   Engine    │  │
│  │ DeepST/ST-ResNet│    │   + RL dispatch) │   │ (ML + rules)│  │
│  └─────────────────┘    └────────┬─────────┘   └──────┬──────┘  │
│                                  │                     │         │
│  ┌─────────────────┐    ┌────────▼─────────┐   ┌──────▼──────┐  │
│  │  ETA Predictor  │    │  Driver Supply   │   │ H3 Hex Grid │  │
│  │  (DeepETA-style)│    │  State Manager   │   │  Demand Map │  │
│  └─────────────────┘    └──────────────────┘   └─────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**Matching Engine — Key Design Decisions:**

| Decision | Choice | Rationale |
|---|---|---|
| **Matching algorithm** | Batched Hungarian Algorithm (every 2–5 seconds) | Globally optimal within batch; Uber's approach; avoids greedy local optima |
| **Optimization objective** | Multi-objective: min(ETA to pax) + min(driver idle) + max(trip acceptance probability) | Single-objective matching reduces driver earnings and increases cancellations |
| **State store** | Redis Geo commands (GEOADD, GEORADIUS) | O(N+M log M) spatial query; handles 100K+ concurrent drivers with <5ms lookup |
| **Matching latency target** | <100ms end-to-end | Above 100ms passenger experience degrades noticeably |
| **Fallback** | Greedy nearest-driver if Hungarian times out | Ensures availability over optimality under load |

**Surge Pricing ML Pipeline:**
```
Input features:
  - Current demand count (H3 hex, last 5min)        ← Flink window
  - Supply count (available drivers in hex radius)   ← Redis Geo
  - Historical demand (same hex, same hour/weekday)  ← Feature store
  - Weather conditions                               ← External API
  - Event flag (concert, football, holiday)          ← Event calendar DB

Model: Gradient Boosted Trees (LightGBM)
  - Train: weekly on 90-day rolling history
  - Inference: batch every 30 seconds per H3 hex
  - Output: surge_multiplier ∈ [1.0, 3.5] clipped by policy rules
  - Override: hard cap rules (Decree 10/2020 fare regulation compliance)

Output → Redis hash: surge:{hex_id} = {"multiplier": 1.8, "ttl": 30s}
```

**ETA Prediction — DeepETA-style Architecture:**
```python
# Feature vector for ETA model
features = {
    "origin_lat_lng": (float, float),          # H3-encoded to embedding
    "destination_lat_lng": (float, float),
    "road_network_embedding": np.array,         # GNN on road graph
    "current_traffic_speed": float,            # HERE/Vietmap real-time
    "hour_of_day": int,                         # cyclical encoding
    "day_of_week": int,
    "weather_condition": categorical,
    "historical_p50_eta": float,               # same O-D pair, same hour
}
# Model: Two-tower neural net → cross-attention → regression head
# Calibration: Conformal prediction for uncertainty intervals (P10/P50/P90)
# RMSE target: <2 minutes for trips under 10km
```

### 1.3 Fleet Telematics Stack — OBD-II to Cloud

OBD-II (On-Board Diagnostics) provides access to vehicle ECU data through the standardized CAN bus.

```
VEHICLE                    EDGE                           CLOUD
┌──────────┐    ┌─────────────────────┐    ┌───────────────────────────┐
│  OBD-II  │    │  OBD-II Dongle /    │    │  Telematics Ingestion     │
│  Port    │───▶│  Telematics Gateway │───▶│  Service                  │
│  (CAN bus│    │  (Calamp, Teltonika,│    │  - DTC parser             │
│  PIDs)   │    │  or embedded MCU)   │    │  - PID normalizer         │
└──────────┘    │  - Edge filtering   │    │  - Fleet event router     │
                │  - Local anomaly    │    └───────────┬───────────────┘
                │  - MQTT publish     │                │ Kafka
                └─────────────────────┘                ▼
                                            ┌──────────────────────────┐
                                            │  Predictive Maintenance   │
                                            │  ML Pipeline             │
                                            │  - DTC fault classifier  │
                                            │  - Vibration FFT → LSTM  │
                                            │  - Failure probability   │
                                            │  - Work order trigger    │
                                            └──────────────────────────┘
```

**Key OBD-II PIDs for Transportation AI:**

| PID (hex) | Parameter | AI Use Case |
|---|---|---|
| 0x04 | Calculated engine load | Driver behavior scoring, predictive maintenance |
| 0x05 | Engine coolant temperature | Overheating anomaly detection |
| 0x0C | Engine RPM | Harsh acceleration scoring, fuel waste |
| 0x0D | Vehicle speed | Speed compliance, journey reconstruction |
| 0x2F | Fuel tank level | Range calculation, refueling optimization |
| 0x03 | Fuel system status | Fuel efficiency anomaly |
| DTC | Diagnostic Trouble Codes | Failure prediction, maintenance scheduling |

**Vibration FFT for Bearing/Drivetrain Health:**
```python
import numpy as np
from scipy.fft import fft, fftfreq

def extract_vibration_features(accel_time_series: np.ndarray, 
                                sample_rate_hz: int = 200) -> dict:
    """
    Extract frequency-domain features from accelerometer data.
    Used for detecting bearing wear, tire imbalance, engine knock.
    """
    n = len(accel_time_series)
    freqs = fftfreq(n, d=1/sample_rate_hz)
    fft_magnitudes = np.abs(fft(accel_time_series))
    
    return {
        "dominant_freq_hz": freqs[np.argmax(fft_magnitudes[:n//2])],
        "energy_0_25hz": np.sum(fft_magnitudes[(freqs >= 0) & (freqs <= 25)]),
        "energy_25_100hz": np.sum(fft_magnitudes[(freqs > 25) & (freqs <= 100)]),
        "rms_amplitude": np.sqrt(np.mean(accel_time_series**2)),
        "kurtosis": float(pd.Series(accel_time_series).kurtosis()),  # >3 = impulsive faults
    }
# Features → LSTM autoencoder → anomaly score → maintenance alert
```

**DTC Code Processing:**
```
Raw DTC string (e.g., "P0301") 
    → OBD-II library decode (python-OBD or custom lookup table)
    → Structured: {"code": "P0301", "system": "powertrain", 
                   "description": "Cylinder 1 Misfire Detected"}
    → Severity classifier (Critical/Warning/Advisory) via rules + ML
    → Kafka topic: transport.obd.dtc_events
    → Maintenance work order system via webhook
```

### 1.4 Public Transit — GTFS Data Infrastructure

GTFS (General Transit Feed Specification) is the universal data standard for public transit schedules.

**GTFS Static (Schedule Data):**
```
gtfs_static/
├── agency.txt          # Transit operator metadata
├── routes.txt          # Route IDs, names, types (bus=3, metro=1)
├── trips.txt           # Trip schedules per route
├── stop_times.txt      # Arrival/departure times per stop per trip
├── stops.txt           # Stop lat/lng coordinates
├── calendar.txt        # Service patterns (weekday/weekend)
└── shapes.txt          # Geographic polylines of routes
```

**GTFS-RT (Real-Time Updates — Protobuf):**
```protobuf
// Three feed types
FeedEntity {
    TripUpdate    // Real-time arrival/departure predictions
    VehiclePosition  // Current vehicle GPS positions  
    Alert            // Service disruptions, delays
}
```

**Vietnam Transit AI Pipeline:**
```
Hanoi Metro / HCMC Metro GTFS-RT feed
    ↓ (polling every 30s or PUSH via webhook)
Kafka topic: transit.gtfs_rt.raw
    ↓ Flink deserializes Protobuf
Normalized transit events:
    - vehicle_position: {route_id, trip_id, lat, lng, timestamp}
    - trip_update: {stop_id, arrival_delay_seconds}
    ↓
Feature store:
    - rolling_delay_p50 (last 30 days per stop per hour)
    - ridership_index (tap-in counts from fare gates)
    ↓
ML Models:
    - Ridership forecasting (LSTM/DeepAR per stop)
    - Delay cascade prediction (XGBoost on upstream delays)
    - Dynamic headway optimization (RL agent)
```

**Open-Source Tools for GTFS Processing:**
- **OpenTripPlanner (OTP)** — multimodal journey planning (bus + metro + walking); Java; widely deployed
- **transitland** — GTFS feed aggregator API; covers 2,500+ agencies globally
- **gtfs-kit** (Python) — GTFS loading, validation, analysis library
- **Conveyal Analysis** — accessibility analysis on GTFS data

### 1.5 Traffic Management — Computer Vision Pipeline

```
Traffic Camera (RTSP stream)
    ↓ OpenCV VideoCapture / FFmpeg
Frame Extraction (5–10 fps sufficient for traffic)
    ↓
Object Detection (YOLOv11 custom-trained)
    ├── Vehicles: car, motorbike, bus, truck, bicycle
    ├── Violations: red-light running, wrong-way driving
    └── Incidents: stopped vehicle, pedestrian on road
    ↓
Tracking (ByteTrack / DeepSORT)
    ├── Vehicle count per lane per minute
    ├── Speed estimation (pixel displacement × calibration factor)
    └── Queue length estimation (stopped vehicle density)
    ↓
Kafka topic: traffic.camera.{intersection_id}.detections
    ↓ Flink aggregation (60-second windows)
    ↓
Signal Optimization Engine
    ├── Actuated control: extend green if queue > threshold
    ├── Adaptive signal control: PTV SCATS/SCOOT compatible
    └── RL-based: DQN/PPO agent optimizing throughput
    ↓
Traffic Controller API (NTCIP protocol)
```

**Vietnam-Specific Camera Context:**
- HCMC: 1,837 AI cameras at 195 key intersections (deployed 2024–2025)
- Key detection challenge: motorbike occlusion (dense packing makes counting and tracking difficult)
- Model training requirement: Vietnam-specific dataset with motorbike-dominant scenes
- License plate recognition: Vietnamese plates (2-letter province code + numbers)

**Vietnam Motorbike Detection Adaptations:**
```
Standard COCO-trained YOLO model:
  - car mAP: ~0.85  ✓
  - motorbike mAP: ~0.62  ✗ (insufficient for production)

Vietnam-adapted model (fine-tuned on VN traffic):
  - Requires: 50,000+ annotated motorbike images from Vietnam streets
  - Data sources: HCMC camera footage, Grab driver dashcams
  - Key annotations: partial occlusion, side view, helmet/no-helmet
  - Model: YOLOv11-m fine-tuned → target motorbike mAP: >0.82
```

### 1.6 Aviation Tech Stack

**Amadeus/Sabre GDS Integration:**
```
Airline Revenue Management System
    ↓ API calls
GDS Layer (Amadeus / Sabre)
    ├── Amadeus: REST APIs (NDC + legacy Edifact)
    │   - Shopping: /v2/shopping/flight-offers
    │   - Booking: /v1/booking/flight-orders  
    │   - Revenue: Amadeus Revenue Management (ARM) — separate enterprise contract
    └── Sabre: SynXis / AirVision — SOAP + REST hybrid

PNR (Passenger Name Record) Key Fields:
    - Itinerary segments (flight + date + class)
    - Passenger SSR (special service requests)
    - Ticketing details (fare basis, ticket number)
    - OSI elements (free-text operational notes)
    → AI use: delay risk scoring, upgrade propensity, no-show prediction
```

**Crew Scheduling Architecture (Set Covering Problem):**
```
Inputs:
  - Flight schedule (origin, destination, departure, arrival, aircraft type)
  - Crew qualifications (type ratings, recency requirements, base)
  - Regulatory constraints (FAR Part 117 / ICAO: max duty hours, rest minimums)
  - Soft constraints (crew preferences, training schedules)

Formulation: Crew Pairing → Crew Assignment
  Phase 1 (Crew Pairing): 
    Column Generation + Integer Programming
    - Enumerate feasible pairings (legal duty sequences)
    - LP relaxation + branch-and-price
    - Libraries: Google OR-Tools (CP-SAT), OptaPlanner, commercial (Carmen, Jeppesen)
  
  Phase 2 (Crew Assignment):
    Set Covering / Set Partitioning ILP
    - Assign pairings to individual crew members
    - Minimize cost, maximize preference satisfaction
  
  Disruption Recovery (ML-augmented):
    - Delay cascade predictor → proactive crew reassignment
    - RL agent for real-time recovery decisions
    - Airport gate assignment: bin-packing variant (minimize walking distance)
```

### 1.7 EV / Charging Intelligence Stack

```
VinFast EV Fleet
    ├── BMS (Battery Management System) data
    │   - Cell voltages (per cell, every second)
    │   - State of Charge (SoC) — coulomb counting + Kalman filter
    │   - State of Health (SoH) — capacity fade model
    │   - Temperature distribution (thermal runaway early warning)
    │   - Charge/discharge cycles, C-rate history
    └── CCS2 / CHAdeMO charging event data
            ↓ MQTT → Kafka
    ┌────────────────────────────────────────────────────────────┐
    │              EV AI Platform (V-Green / VinFast)            │
    │  ┌──────────────────┐  ┌─────────────────────────────────┐ │
    │  │ Battery SoH Model│  │  Charging Demand Forecast       │ │
    │  │ (degradation     │  │  (station × time-of-day × EV   │ │
    │  │  prediction)     │  │   count ML)                     │ │
    │  └──────────────────┘  └─────────────────────────────────┘ │
    │  ┌──────────────────┐  ┌─────────────────────────────────┐ │
    │  │ Load Balancing   │  │  Range Anxiety Routing          │ │
    │  │ (grid management)│  │  (EV-aware dispatch engine)     │ │
    │  └──────────────────┘  └─────────────────────────────────┘ │
    └────────────────────────────────────────────────────────────┘
```

**Battery SoH ML Model:**
```python
# State of Health prediction inputs (per vehicle, per charge cycle)
features = {
    "cycle_count": int,                     # Cumulative charge cycles
    "avg_discharge_rate_c": float,          # C-rate (1C = full discharge in 1hr)
    "avg_temperature_celsius": float,       # Operating temperature history
    "depth_of_discharge_pct": float,        # Average DoD per cycle
    "fast_charge_fraction": float,          # % cycles using DC fast charging
    "calendar_age_days": int,               # Calendar aging (even when parked)
    "delta_voltage_variance": float,        # Cell imbalance indicator
}
# Target: SoH (%) = current capacity / rated capacity × 100
# Model: LightGBM regressor → RMSE target < 2% SoH
# Threshold: SoH < 80% → battery replacement recommendation
```

---

## 2. Architecture Patterns

### 2.1 Event-Driven Real-Time Architecture for Ride-Hailing

The ride-hailing platform is defined by its sub-100ms end-to-end latency requirement from passenger request to driver notification. This is achievable only with a fully event-driven, in-memory architecture for the hot path.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COLD PATH (>1 minute)                            │
│  Historical trips → Feature engineering → Model training → Registry │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    WARM PATH (1s – 60s)                             │
│  Kafka → Flink → Surge multiplier → Redis                           │
│  GPS stream → H3 supply/demand aggregation → Redis heatmap          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    HOT PATH (<100ms)                                 │
│                                                                     │
│  Pax request → API GW → Trip Service                                │
│                              │                                      │
│         ┌────────────────────┼──────────────────────┐               │
│         ▼                    ▼                      ▼               │
│   Redis:GEORADIUS       Redis: surge         Redis: driver          │
│   (candidate drivers)   multiplier           availability           │
│         │                    │                      │               │
│         └────────────────────▼──────────────────────┘               │
│                     Matching Engine                                  │
│                    (in-process, Rust/Go)                             │
│                              │                                      │
│                     Driver WebSocket push                            │
│                         (<30ms total)                               │
└─────────────────────────────────────────────────────────────────────┘
```

**Technology choices for sub-100ms matching:**
- **Language:** Rust or Go for matching service (not Python — GIL and GC pauses exceed latency budget)
- **State store:** Redis 7 (sub-millisecond reads) — NOT a relational DB for the hot path
- **Serialization:** Protobuf/MessagePack (not JSON — 5–10× faster serialization)
- **Network:** gRPC between internal services (not REST)
- **Deployment:** Same AWS availability zone for matching engine + Redis (avoids cross-AZ latency)

**Latency Budget Breakdown (100ms target):**
| Step | Budget | Technology |
|---|---|---|
| API Gateway + auth | 5ms | Kong / AWS API GW |
| Driver candidate lookup (GEORADIUS) | 3ms | Redis Geo |
| Surge multiplier fetch | 1ms | Redis hash get |
| Matching algorithm (100 candidates) | 15ms | In-process Hungarian (Rust) |
| ETA fetch (cached) | 2ms | Redis + precomputed matrix |
| DB write (trip record) | 10ms | PostgreSQL async write |
| Driver WebSocket push | 5ms | WebSocket server |
| Network + serialization | 20ms | gRPC + Protobuf |
| **Total** | **~61ms** | Headroom for P99 spikes |

### 2.2 Geospatial Data Processing: H3 Hexagonal Indexing

Uber's H3 library (open-source since 2018) is the de facto standard for geospatial demand/supply aggregation in transportation platforms.

**Why H3 over standard lat/lng grids:**
- Uniform area cells (unlike lat/lng degrees which vary with latitude)
- Hierarchical resolution (0=coarsest to 15=finest; resolution 9 ≈ 174m² suits urban ride-hailing)
- Fast k-ring neighbor lookup for demand propagation
- Used by Grab, Lyft, DoorDash, and most modern mobility platforms

```python
import h3

# Encode GPS coordinate to H3 cell
def gps_to_h3(lat: float, lng: float, resolution: int = 9) -> str:
    return h3.geo_to_h3(lat, lng, resolution)

# Example: HCMC city center
h3_cell = gps_to_h3(10.7769, 106.7009, resolution=9)
# Output: "89383562003ffff" (H3 index)

# Get neighboring cells for demand spreading (k=2 ring = 18 cells)
neighbors = h3.k_ring(h3_cell, k=2)

# Demand heatmap: aggregate trips by H3 cell in Flink
# demand_map = {h3_cell: {"trips_last_5min": 23, "available_drivers": 12}}
```

**H3 Resolution Guide for Vietnam Transportation:**
| Resolution | Cell Area | Use Case |
|---|---|---|
| 7 | ~5.1 km² | City-level demand zones, macro surge pricing |
| 8 | ~0.74 km² | District-level supply monitoring |
| 9 | ~0.11 km² | Standard ride-hailing matching radius (HCMC/Hanoi urban) |
| 10 | ~0.015 km² | Traffic signal optimization, parking demand |
| 11 | ~2,200 m² | Pedestrian flow, metro station catchment |

**PostGIS for Persistent Geospatial Queries:**
```sql
-- Find available drivers within 2km of pickup, ordered by distance
SELECT driver_id, 
       ST_Distance(location::geography, 
                   ST_SetSRID(ST_Point(106.7009, 10.7769), 4326)::geography) AS dist_meters
FROM driver_locations
WHERE ST_DWithin(location::geography, 
                 ST_SetSRID(ST_Point(106.7009, 10.7769), 4326)::geography, 
                 2000)  -- 2km radius
  AND status = 'available'
ORDER BY dist_meters
LIMIT 20;
-- Use GIST index on location column for <5ms query time
```

### 2.3 Multi-Objective Vehicle Routing with Time Windows (VRPTW)

Fleet dispatch (not covered in I06's B2C last-mile context) in transportation involves time-critical constraints unique to passenger transport and transit.

**VRPTW Variants in Transportation:**

| Variant | Application | Key Constraint |
|---|---|---|
| VRPTW | Scheduled bus/shuttle service | Time windows at stops |
| DVRPTW (Dynamic) | On-demand ride-sharing | Requests arrive in real-time |
| PDPTW (Pickup/Delivery) | Carpooling, paratransit | Pickup before delivery, precedence |
| EVRPTW | EV-aware dispatch (Xanh SM) | Battery range + charging stop constraints |
| mTSP with crews | Airline crew scheduling | Pairing constraints, rest rules |

**OR-Tools PDPTW Implementation for Ride-Sharing:**
```python
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def solve_rideshare_dispatch(requests: list[dict], 
                              vehicles: list[dict]) -> dict:
    """
    Solve pickup-and-delivery with time windows for ride-sharing dispatch.
    requests: [{"pickup": (lat,lng), "delivery": (lat,lng), 
                "earliest": unix_ts, "latest": unix_ts, "passengers": int}]
    vehicles: [{"location": (lat,lng), "capacity": int, "id": str}]
    """
    manager = pywrapcp.RoutingIndexManager(
        len(requests) * 2 + len(vehicles),  # nodes: pickups + dropoffs + depots
        len(vehicles),
        [v["depot_node"] for v in vehicles],
        [v["depot_node"] for v in vehicles]
    )
    routing = pywrapcp.RoutingModel(manager)
    
    # Add time dimension
    routing.AddDimension(time_callback_index, 60, 3600, False, "Time")
    time_dimension = routing.GetDimensionOrDie("Time")
    
    # Add pickup-delivery pairs
    for i, req in enumerate(requests):
        pickup_idx = manager.NodeToIndex(req["pickup_node"])
        delivery_idx = manager.NodeToIndex(req["delivery_node"])
        routing.AddPickupAndDelivery(pickup_idx, delivery_idx)
        routing.solver().Add(
            routing.VehicleVar(pickup_idx) == routing.VehicleVar(delivery_idx)
        )
    
    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION
    )
    search_params.time_limit.seconds = 2  # 2-second solve budget for real-time
    
    solution = routing.SolveWithParameters(search_params)
    return extract_routes(manager, routing, solution)
```

**EV-Aware VRPTW (Xanh SM-specific):**
- Add energy dimension alongside time dimension
- Charging stops = additional nodes with recharge time as service time
- Battery SoC at each node must remain above safety threshold (e.g., 15%)
- Station availability (queue probability) as soft constraint

### 2.4 Digital Twin for Fleet Simulation (B15 Baseline)

A fleet digital twin mirrors the physical fleet state and enables scenario simulation.

```
PHYSICAL FLEET                    DIGITAL TWIN
VinFast EVs / Grab fleet  ──────▶ Fleet State DB (PostgreSQL)
  - GPS positions                   - Virtual vehicle positions
  - Battery SoC                     - Simulated battery levels
  - Driver status                   - Modeled demand patterns
  - Trip assignments    sync every  - Cloned route assignments
                        30 seconds
                                  SIMULATION ENGINE
                                  ┌─────────────────────────────┐
                                  │ Scenario: +20% demand surge  │
                                  │ → simulate matching latency  │
                                  │ → optimize fleet positioning │
                                  │                             │
                                  │ Scenario: 30% EV battery    │
                                  │ below 20% SoC at 18:00      │
                                  │ → pre-position charge runs   │
                                  │ → predict demand shortfall   │
                                  └─────────────────────────────┘
```

**SUMO (Simulation of Urban MObility) for Traffic Digital Twin:**
- Open-source microscopic traffic simulation (DLR)
- Supports: cars, motorbikes, buses, pedestrians
- Integration: TraCI (Traffic Control Interface) Python API for real-time control
- Vietnam application: model HCMC intersection signal timing, test adaptive control before deployment
- Input: OSM road network + GTFS bus schedules + historical OD demand matrix

```python
import traci

def run_signal_optimization_episode(sumo_config: str, 
                                     rl_agent) -> float:
    traci.start(["sumo", "-c", sumo_config, "--no-step-log"])
    total_wait_time = 0
    
    for step in range(3600):  # Simulate 1 hour
        traci.simulationStep()
        
        # Observe state: queue lengths at each approach
        state = get_intersection_state()
        
        # RL agent selects signal phase
        action = rl_agent.predict(state)
        traci.trafficlight.setPhase("intersection_1", action)
        
        total_wait_time += get_total_vehicle_wait()
    
    traci.close()
    return total_wait_time  # Minimize this reward signal
```

### 2.5 Edge AI for In-Vehicle Inference

Edge AI avoids cloud round-trip latency for safety-critical in-vehicle decisions. Key for ADAS and driver monitoring.

**Edge Hardware Options:**

| Hardware | TOPS | Power | Use Case | Vietnam Availability |
|---|---|---|---|---|
| NVIDIA Jetson Orin NX | 100 TOPS | 10–25W | Full ADAS suite, dashcam AI | Available via distributor |
| Qualcomm SA8295P | 30 TOPS | ~15W | Automotive-grade (ISO 26262) | Via VinFast embedded |
| Raspberry Pi 5 + Hailo-8 | 26 TOPS | 8W | Driver monitoring, basic CV | Low cost, prototyping |
| Mediatek Dimensity Auto | 20 TOPS | <10W | In-vehicle infotainment AI | Emerging 2025+ |

**Driver Monitoring System (DMS) Pipeline:**
```
Interior camera (IR, 30fps)
    ↓ Edge device (Jetson/Hailo)
Face landmark detection (MediaPipe or custom MobileFaceNet)
    ├── Eye aspect ratio → drowsiness detection
    ├── Head pose (yaw/pitch/roll) → distraction detection
    ├── Gaze direction → phone use detection
    └── Yawn frequency → fatigue scoring
    ↓
Real-time alert (beep + vibration) — no cloud needed
    + Edge buffer (1min rolling) → cloud upload on anomaly
    ↓ (background, non-critical)
Kafka: transport.driver.safety_events → driver scoring pipeline
```

---

## 3. Integration Patterns

### 3.1 Telematics Integration: OBD-II to Cloud Pipeline

```
OBD-II Device (Teltonika FMB920 / Calamp LMU-3030)
    │ CAN bus reads (500kbps)
    │ Filtered: speed, RPM, fuel, DTCs, accelerometer
    ↓ MQTT publish every 5s (active trip) / 5min (parked)
MQTT Broker (EMQX)
    ↓ Kafka Connect MQTT Source Connector
Kafka topic: transport.obd.raw
    Schema: {device_id, vehicle_id, timestamp_utc, pid_data{}, dtcs[], accel_xyz}
    ↓ Flink stream processor
Normalized events:
    - transport.trips.active (ongoing trip telemetry)
    - transport.dtc.alerts (fault codes → immediate notification)
    - transport.driver.behavior (harsh event detection)
    - transport.maintenance.triggers (predictive maintenance signals)
```

**Device Provisioning Pattern:**
- New OBD device → device certificate (mTLS) → EMQX ACL → provisioning topic
- Each vehicle gets unique MQTT topic namespace: `veh/{vin}/telemetry`
- Over-the-air firmware updates: MQTT-based OTA (topics: `veh/{vin}/ota/command`)

### 3.2 Maps API Integration

| Provider | Coverage | Vietnam Quality | Cost | Best Use Case |
|---|---|---|---|---|
| **Google Maps Platform** | Global | Excellent (HCMC/Hanoi urban) | USD 0.005/request (Routes API) | ETA calculation, geocoding, POI search |
| **HERE Routing & Traffic** | Global | Good | Enterprise contract | ADAS layers, fleet routing, real-time traffic |
| **Vietmap** | Vietnam-only | Best for rural VN | ~70% lower cost vs. Google | Vietnamese address geocoding, motorbike routing |
| **OpenStreetMap + OSRM** | Global | Variable (urban good) | Free (self-hosted) | Prototype, batch routing, non-real-time |
| **Mapbox** | Global | Good | Pay-per-use | Custom map rendering, visualization |

**Vietnam-Specific Routing Considerations:**
```
Google Maps API limitations for Vietnam:
  - No motorbike routing mode (only car/walking/cycling)
  - Rural road coverage gaps in mountainous provinces
  - Vietnamese address ambiguity (house numbers, alleys/hẻm)

Vietmap advantages:
  - Native Vietnamese address search (hẻm, ngõ, xóm)
  - Motorbike routing mode available
  - Lower latency (Vietnam-hosted servers)
  - Provincial road coverage more complete
  - Cost: ~$0.001–0.002/request (estimate based on market position)

Recommended hybrid strategy:
  - Urban ETA + matching: Google Maps (accuracy priority)
  - Vietnamese address geocoding: Vietmap
  - Batch route optimization: OSRM (self-hosted, cost)
  - Rural fleet tracking: Vietmap fallback
```

**HERE vs. Google for Fleet Telematics:**
- HERE: Better for commercial fleet routing (truck restrictions, ADAS map layers); preferred by Lytx
- Google: Better developer UX, broader language support, more Vietnam restaurant/POI data
- For Xanh SM's EV fleet: HERE EV Routing API supports charging stop optimization natively

### 3.3 GTFS / GTFS-RT Integration

```python
# GTFS-RT Feed Consumer
import requests
from google.transit import gtfs_realtime_pb2

def fetch_gtfs_rt_feed(feed_url: str) -> gtfs_realtime_pb2.FeedMessage:
    response = requests.get(feed_url, timeout=10)
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(response.content)
    return feed

def extract_trip_updates(feed: gtfs_realtime_pb2.FeedMessage) -> list[dict]:
    updates = []
    for entity in feed.entity:
        if entity.HasField("trip_update"):
            tu = entity.trip_update
            for stu in tu.stop_time_update:
                updates.append({
                    "trip_id": tu.trip.trip_id,
                    "route_id": tu.trip.route_id,
                    "stop_id": stu.stop_id,
                    "arrival_delay_seconds": stu.arrival.delay if stu.HasField("arrival") else None,
                    "departure_delay_seconds": stu.departure.delay if stu.HasField("departure") else None,
                })
    return updates

# Poll every 30 seconds → publish to Kafka topic: transit.gtfs_rt.updates
```

**Vietnam GTFS Data Status (2026):**
- Hanoi Metro: GTFS static available; GTFS-RT in development
- HCMC Metro (Line 1): GTFS-RT deployed post-Dec 2024 opening
- Hanoi/HCMC bus: Partial GTFS coverage; GTFS-RT limited
- Gap: No unified Vietnam national GTFS aggregator (unlike TransitLand for US/EU)

### 3.4 Aviation GDS/PSS Integration

```
Airline Reservation System (PSS)
    ├── Amadeus Altéa (Vietnam Airlines)
    │   - REST API: Amadeus for Developers (sandbox + production)
    │   - Auth: OAuth 2.0 (client credentials flow)
    │   - Key endpoints:
    │     GET /v2/shopping/flight-offers?origin=SGN&destination=HAN
    │     POST /v1/booking/flight-orders  (PNR creation)
    │     GET /v1/travel/analytics/air-traffic/traveled
    │   - Webhook: flight status changes → push to platform
    │
    └── Navitaire (Vietjet — LCC PSS)
        - NDC API (IATA standard, XML/JSON)
        - Direct connect for inventory management
        - Fare loading and yield management hooks

AI Integration Points:
    PNR data stream → ML pipeline:
        - No-show prediction (classification)
        - Upgrade propensity (revenue uplift)
        - Overbooking optimization (stochastic model)
        - Delay cascade prediction (graph propagation)
```

**PNR Data Schema for AI:**
```json
{
  "pnr_id": "ABC123",
  "booking_date": "2026-03-15T14:23:00Z",
  "segments": [
    {
      "flight": "VN123",
      "origin": "SGN",
      "destination": "HAN", 
      "departure": "2026-04-03T06:00:00+07:00",
      "cabin": "Y",
      "fare_basis": "YSAV14",
      "booking_class": "Y"
    }
  ],
  "passengers": [{"type": "ADT", "ffp_tier": "Gold"}],
  "payment": {"method": "CC", "currency": "VND"},
  "features_for_ml": {
    "days_before_departure": 19,
    "route_load_factor_historical": 0.87,
    "passenger_ffp_tier": "Gold",
    "booking_channel": "OTA"
  }
}
```

### 3.5 Traffic Camera RTSP Stream → CV Pipeline

```
IP Traffic Camera (Dahua/Hikvision/HCMC-deployed)
    │ RTSP stream: rtsp://camera-ip:554/stream1
    ↓
Frame Ingestion Service
    ├── OpenCV: cv2.VideoCapture("rtsp://...")
    ├── FFmpeg: frame extraction to JPEG buffer
    └── Frame rate: 10fps (traffic counting) / 25fps (incident detection)
    ↓
Object Detection Worker (GPU, YOLOv11)
    ├── Docker container with NVIDIA CUDA runtime
    ├── Model: YOLOv11-m fine-tuned for Vietnam traffic
    ├── Inference: ~15ms per frame on RTX 4090 (1080p)
    └── Output: [{class, confidence, bbox, track_id}]
    ↓
Kafka: traffic.camera.{cam_id}.detections
    ↓
Flink Aggregation (60s tumbling windows)
    ├── vehicle_count_by_lane
    ├── avg_speed_kmh
    ├── queue_length_vehicles
    └── incident_flags
    ↓
Traffic Management Dashboard (WebSocket push)
Signal Optimization Engine
Historical archive (S3 → model retraining)
```

---

## 4. Technology Deep-Dive per Baseline

### B01 — Demand Forecasting (Spatial-Temporal)

**Problem:** Predict ride-hailing demand (trip requests per H3 cell per 15-minute interval), transit ridership per station, EV charging demand per station.

**SOTA Models:**

| Model | Architecture | RMSE vs. Baseline | Notes |
|---|---|---|---|
| **DeepST** (Yao et al., 2018) | CNN on spatial grid + temporal closeness/period/trend | -23% vs. ARIMA | Good for regular grid; not H3-native |
| **ST-ResNet** (Zhang et al., 2017) | Deep residual nets on spatial grid (crowd flow) | -18% vs. ARIMA | Adapted from computer vision; handles urban patterns well |
| **DCRNN** (Li et al., 2018) | Graph conv + seq-to-seq (road network aware) | -31% vs. ARIMA | Captures road topology; more complex |
| **STAEFormer** (2023) | Transformer with adaptive spatial-temporal embedding | SOTA 2023; +15% vs. DCRNN | High compute; best accuracy |
| **LightGBM + H3 features** | Gradient boosting on H3 spatial features | Practical SOTA for production | Interpretable; fast retraining; used by Grab Vietnam |

**Feature Engineering for Vietnam Ride-Hailing Demand:**
```python
features = {
    # Temporal
    "hour_sin": np.sin(2 * np.pi * hour / 24),
    "hour_cos": np.cos(2 * np.pi * hour / 24),
    "day_of_week": int,          # 0=Mon, 6=Sun
    "is_tet_holiday": bool,      # Tet creates demand collapse (drivers leave city)
    "is_post_tet_day3": bool,    # Demand surge on return
    "is_payday": bool,           # 15th and last day of month
    
    # Spatial (H3-based)
    "h3_cell_id": str,           # Encoded as embedding
    "district_type": categorical, # CBD, suburban, airport, university
    "rain_intensity": float,     # Weather API (demand +40% in heavy rain)
    
    # Historical demand
    "demand_lag_1h": float,
    "demand_lag_1d": float,      # Same hour yesterday
    "demand_lag_7d": float,      # Same hour last week
    "demand_rolling_4h": float,
}
```

**Public Transit Ridership Forecasting:**
- Model: DeepAR (probabilistic, handles multiple series) on station-level daily ridership
- Input: Hanoi/HCMC metro tap-in counts + weather + holiday calendar + events
- Challenge: Short historical series (HCMC Metro opened Dec 2024) → cold-start with Bayesian priors from comparable Asian metro systems (MRT Singapore, Bangkok BTS)

### B06 — Optimization (VRPTW + Crew Scheduling)

**Fleet Dispatch VRPTW:**
- Library: **PyVRP** (state-of-art DIMACS 2022 winner; Python bindings over C++)
- Benchmark: VRPTW Solomon instances; PyVRP achieves <0.5% from optimal on 100-customer instances in <5 seconds
- Production constraint: 2-second solve time budget → warm-starting from previous solution

**Crew Scheduling — Set Covering:**
```
OR-Tools CP-SAT solver for crew pairing (Vietnam Airlines scale):
  ~500 daily flights × 200 crew members
  CP-SAT can solve in 60–180 seconds (acceptable for D-1 planning)
  
  For real-time disruption recovery (<5 minute target):
    - Pre-computed recovery templates (common delay scenarios)
    - Heuristic: greedy reserve crew assignment first, then optimize
    - RL agent (PPO) trained on historical disruption scenarios

Airport Gate Assignment (bin-packing variant):
  Input: flight schedule with arrival/departure times, aircraft type
  Constraint: gate compatible with aircraft size, turnaround buffer
  OR-Tools MIP → solve 200-flight schedule in <30 seconds
```

**Charging Station Load Balancing:**
- Objective: minimize peak grid load while satisfying all charging requests
- Approach: Rolling horizon optimization (1-hour window, 5-min intervals)
- Model: MILP with battery SoC state transitions as variables
- Solver: OR-Tools CP-SAT or HiGHS (open-source, fast)

### B07 — Anomaly Detection

**Driver Behavior Scoring:**
```
Sensor inputs (per trip):
  - Harsh braking events (accel < -0.4g)
  - Harsh acceleration (accel > 0.4g)
  - Sharp cornering (lateral accel > 0.35g)
  - Speeding (GPS speed vs. road limit from HERE API)
  - Phone use (DMS camera detection)
  - Drowsiness (DMS eye closure duration)

Scoring model:
  - Rule-based: immediate flags for critical events (phone at 80km/h)
  - ML: Isolation Forest on trip-level aggregated features
  - Score: 0-100 (100 = perfect; <60 = intervention required)
  - Calibration: isotonic regression to align scores with accident probability

Output:
  - Real-time: in-vehicle alert (edge inference, <50ms)
  - Batch: daily driver scorecard → insurance API / employer dashboard
```

**Predictive Maintenance — Anomaly Detection:**
```
Input streams:
  - Vibration FFT features (bearing frequencies: BPFI, BPFO, BSF, FTF)
  - OBD PIDs (coolant temp trend, fuel trim, misfire counts)
  - DTC code frequency patterns

Models:
  - LSTM-Autoencoder: learns normal vibration signature → flags deviation
  - Isolation Forest: multi-variate OBD anomaly detection
  - DTC sequence mining: frequent pattern mining on fault code sequences
    (e.g., "P0171 → P0300 within 3 days" predicts catalytic converter failure)

Failure prediction (classification):
  - XGBoost binary classifier: will this vehicle need unplanned maintenance 
    within 14 days?
  - Features: anomaly scores + DTC history + mileage + age + model type
  - Target: AUC > 0.85; recall > 0.75 (recall prioritized over precision)
```

**Traffic Incident Detection:**
```
Inputs:
  - Camera feed anomalies (stopped vehicle, wrong-way detection)
  - GPS trajectory anomalies (vehicles not moving in flowing traffic zone)
  - Social media signals (Twitter/Zalo NLP for reported incidents)
  - Waze/HERE incident reports API

Model: Ensemble
  - Rule: camera detects stopped vehicle on highway → immediate alert
  - ML: LSTM on speed time-series per road segment → anomaly = incident
  - Fusion: weighted majority vote across sources

Output:
  - Kafka topic: traffic.incidents.detected
  - ETA recalculation trigger for affected routes
  - Driver app rerouting suggestions
```

### B03 — Computer Vision

**Traffic Camera Analytics:**
- Primary model: YOLOv11-m (object detection) + ByteTrack (multi-object tracking)
- Secondary: DeepSORT for re-identification across camera network
- Density estimation: CSRNet (crowd counting adapted for motorbike density)
- Speed estimation: Optical flow (Lucas-Kanade) calibrated to camera geometry

**License Plate Recognition (ANPR) for Vietnam:**
```
Pipeline:
  1. YOLOv11 plate detection → bounding box crop
  2. Image preprocessing (perspective correction, contrast enhancement)
  3. OCR: PaddleOCR (Vietnamese/CJK superior; supports license plate format)
     OR: Custom CRNN (CNN + BiLSTM + CTC) trained on Vietnam plates
  4. Format validation: regex for Vietnam plate formats
     - Old format: 51A-123.45 (province code + series + number)
     - New format: 51A1-123.45 (5-character series)
  5. Database lookup → registered vehicle, owner, insurance status

Accuracy targets:
  - Detection mAP: >0.92 at IoU=0.5
  - OCR accuracy: >0.95 character accuracy on clean plates
  - End-to-end recognition: >0.88 on real-world HCMC conditions
```

**Vehicle Damage Inspection (Insurance AI):**
```
Input: customer-uploaded photos (5+ angles) via mobile app
Model: EfficientNet-B4 → multi-label classification
Labels: scratches, dents, cracked_windscreen, broken_lights, frame_damage
Severity: minor/moderate/severe per damage type
Output: damage report → claim pre-assessment → adjuster review

Training data: 
  - Labeled claim images from insurer (minimum 20,000 per damage type)
  - Augmentation: varied lighting, angles, resolutions
```

### B15 — Simulation

**SUMO Traffic Microsimulation:**
- Full microsimulation: each vehicle modeled individually with car-following model (IDM, Krauss)
- Motorbike-specific: SUMO supports dedicated motorbike vehicle type with different dynamics
- Key parameters for Vietnam: higher density, different gap acceptance, mixed-mode intersections
- Integration: Python TraCI API for RL-based signal optimization training

**Fleet Planning Simulation:**
```python
# Monte Carlo fleet sizing simulation for Xanh SM
import numpy as np

def simulate_ev_fleet_operations(n_vehicles: int,
                                  n_chargers: int,
                                  n_simulations: int = 10000) -> dict:
    results = []
    for _ in range(n_simulations):
        # Simulate 24-hour operation
        demand = np.random.poisson(lam=demand_rate, size=24*4)  # 15-min intervals
        
        # Track vehicle availability (factoring charge time, trips, maintenance)
        available = simulate_fleet_state(n_vehicles, n_chargers, demand)
        
        # KPIs
        unmet_demand = max(0, demand.sum() - available.sum())
        results.append({
            "service_rate": 1 - unmet_demand / demand.sum(),
            "charger_utilization": compute_charger_util(n_chargers),
            "avg_vehicle_soc_at_dispatch": compute_avg_soc(),
        })
    
    return {
        "p50_service_rate": np.percentile([r["service_rate"] for r in results], 50),
        "p10_service_rate": np.percentile([r["service_rate"] for r in results], 10),
        "optimal_charger_ratio": optimize_charger_count(results),
    }
```

---

## 5. Vietnam-Specific Tech Considerations

### 5.1 Motorbike-Specific ML Adaptations

Vietnam's 39M+ motorbikes create ML challenges that no off-the-shelf Western or Chinese model handles adequately.

**Routing Model Adaptations:**

| Standard Routing Model | Vietnam Motorbike Problem | Adaptation Required |
|---|---|---|
| OSM + OSRM (car profile) | No motorbike mode; misses hẻm (alley) shortcuts | Custom OSRM motorbike profile with hẻm edges tagged |
| Google Maps ETA | Car-optimized; motorbikes 30–40% faster in HCMC traffic | Fine-tune with Grab/Xanh SM motorbike trip GPS data |
| H3 demand cells (9) | ~110m radius; motorbike stops are hyper-local | Supplement with H3-11 cells near dense pickup clusters |
| Lane-changing model (IDM) | Motorbikes don't follow lane discipline | Use MOBIL with much lower politeness parameter for VN |

**Grab's GrabMaps Approach (relevant reference):**
- Grab built in-house mapping (GrabMaps) because Google Maps was insufficient for SEA motorbike routing
- Key innovations: hẻm indexing, motorbike-specific speed profiles, floating pickup point prediction
- Vietnam operators should study Grab's open-sourced mapping blog posts as implementation guide

**Motorbike Trajectory Prediction:**
```
Challenge: Motorbike trajectories are non-deterministic (lane splitting, sidewalk use)
Standard model: Constant Velocity + road-constrained (works for cars)
Vietnam model: 
  - Multi-modal trajectory prediction (CVAE or Social Force Model adapted for motorbikes)
  - Incorporate probabilistic sidewalk use (P(sidewalk) > 0 in congestion)
  - Training data: 10M+ GPS trips from Grab/Xanh SM (minimum viable dataset)
  - Output: distribution over next 30-second positions (not single trajectory)
```

### 5.2 Vietmap vs. Google Maps — Technical Comparison

```
GEOCODING ACCURACY (Vietnamese addresses):
┌─────────────────────────────────────────────────────────────────┐
│ Test: 10,000 Vietnamese addresses from HCMC/Hanoi delivery DB   │
├────────────────┬────────────────┬────────────────┬─────────────┤
│ Provider       │ Urban Accuracy │ Rural Accuracy │ Hẻm/Alley  │
├────────────────┼────────────────┼────────────────┼─────────────┤
│ Google Maps    │ ~94%           │ ~78%           │ ~65%        │
│ Vietmap        │ ~91%           │ ~85%           │ ~88%        │
│ HERE           │ ~88%           │ ~72%           │ ~55%        │
│ OSM/Nominatim  │ ~82%           │ ~68%           │ ~45%        │
└────────────────┴────────────────┴────────────────┴─────────────┘
Note: Estimated figures based on industry benchmarking patterns.
Actual figures require in-house validation with production address data.

COST COMPARISON (estimate, 2026):
  Google Maps Routes API:    ~USD 0.004–0.008/request
  Vietmap Routes API:        ~USD 0.001–0.002/request  (est.)
  HERE Routing API:          Enterprise contract (>$5K/month floor)
  OSRM (self-hosted):        Infrastructure cost only (~$200/month for 1M req/day)

RECOMMENDATION:
  - Primary ETA (urban): Google Maps (accuracy) with Vietmap fallback for rural
  - Address autocomplete: Vietmap (Vietnamese-native, cost-effective)
  - Batch routing (optimization): OSRM self-hosted
  - Fleet routing (trucks/EV): HERE (commercial fleet features)
```

### 5.3 4G/5G Coverage Gaps for Real-Time Telemetry

**Vietnam Mobile Coverage Reality (2026):**
- 4G population coverage: ~98% (urban/suburban)
- 4G geographic coverage: ~75% (significant rural gaps in Central Highlands, Northern Mountains)
- 5G: Commercial deployment in HCMC/Hanoi; sub-10% geographic coverage nationally

**Connectivity Resilience Architecture:**
```
Vehicle telemetry device (Teltonika/Calamp):
  Primary: 4G LTE (MQTT to cloud)
  Fallback 1: 3G (degraded ping rate: 30s → 120s to preserve data)
  Fallback 2: Local storage (SQLite on device) + batch upload on reconnect
  Gap handling: Store-and-forward buffer (typically 24–72 hours capacity)

For critical safety alerts (only):
  Consider: Iridium satellite SMS fallback (~$0.10/message; only for safety triggers)
  Vietnam coverage: full satellite coverage (mountainous route buses)

Offline-capable edge functions:
  - Driver safety scoring: runs fully on-device (no cloud needed)
  - Basic route adherence: local map tile cache + GPS comparison
  - Emergency SOS: standalone device-to-emergency service
```

**Data bandwidth budgeting:**
```
Standard GPS + OBD ping (30s interval, 1 vehicle):
  Payload: ~200 bytes (GPS + 10 PIDs + DTC flag)
  Monthly: 200B × 2/min × 60min × 8hr/day × 30 days = ~17MB/month/vehicle
  
Video telematics (dashcam AI events only, not streaming):
  Event clip upload (10s, H.264): ~2MB per event
  Assume 5 events/day: 10MB/day = 300MB/month/vehicle
  
Total data cost (Globe/Viettel SIM, ~50,000 VND/GB):
  Telemetry-only fleet: ~1,700 VND/month/vehicle (negligible)
  Video telematics fleet: ~15,000 VND/month/vehicle (acceptable)
```

### 5.4 VinFast Charging Network API Integration

**Opportunity:** V-Green (VinFast's charging subsidiary) operates 3,000 stations / 150,000 portals. No public API documented as of 2026 — an integration opportunity for MAESTRO platform.

**Proposed integration architecture:**
```
V-Green Charging Station (OCPP 2.0 compliant)
    ↓ OCPP WebSocket protocol (Open Charge Point Protocol)
OCPP Central System (open-source: steve, CitrineOS, or OCPP2.0 server)
    ↓
Charging Events Kafka topic:
    - ChargeStarted: {station_id, connector_id, vehicle_vin, soc_start, timestamp}
    - EnergyDelivered: {session_id, kwh_delivered, current_soc, power_kw}
    - ChargeStopped: {session_id, soc_end, reason, duration_min}
    ↓
AI Platform:
    - Demand forecasting: sessions per station × time-of-day
    - Load balancing: dynamic power allocation across connectors
    - EV-aware dispatch: Xanh SM integration (only dispatch vehicles with SoC > threshold)
    - Grid peak management: smart charging schedule optimization

OCPP 2.0 Key Advantages over OCPP 1.6:
  - Smart charging profiles (ISO 15118 PnC - Plug and Charge)
  - V2G (Vehicle-to-Grid) support for future grid services
  - Enhanced security (TLS mandatory)
```

---

## 6. Build vs. Buy

### 6.1 Decision Framework

For Vietnam transportation companies operating at L1–L2 AI maturity (majority) and Smartlog's MAESTRO platform:

**Core Principle:** Buy (or use open-source) everything that is not a competitive differentiator. Build only what creates a data moat or domain-specific accuracy advantage.

### 6.2 Component-Level Recommendations

| Component | Recommendation | Rationale | Option |
|---|---|---|---|
| **MQTT Broker** | BUY (managed) | Commodity infrastructure | EMQX Cloud or HiveMQ Cloud; ~$200-500/month |
| **Kafka / Event bus** | BUY (managed) | Ops complexity high; not differentiating | AWS MSK or Confluent Cloud |
| **Maps / Routing (urban)** | BUY | Google/HERE/Vietmap APIs | Vietmap for VN geocoding; Google for ETA |
| **GTFS routing engine** | OPEN-SOURCE | OpenTripPlanner (OTP2) | Community-maintained; runs on JVM |
| **Traffic simulation** | OPEN-SOURCE | SUMO (DLR) | Free; Python TraCI API; Vietnam-deployable |
| **VRP / Dispatch solver** | OPEN-SOURCE | OR-Tools (Google) + PyVRP | Production-ready; free; no license risk |
| **Demand forecasting models** | BUILD | Vietnam-specific patterns (Tet, motorbike) | LightGBM + Vietnam features beats generic DeepST |
| **Matching engine** | BUILD | Sub-100ms latency; competitive moat | Go/Rust + Redis Geo; 2–4 engineer-months |
| **Motorbike routing profile** | BUILD | No vendor covers Vietnam motorbike adequately | Custom OSRM profile + Vietmap data |
| **Driver scoring model** | BUILD | Vietnam driving behavior data moat | Train on local OBD + dashcam data |
| **ETA predictor** | BUILD (fine-tune) | Fine-tune on local GPS history | Start with Google Maps ETA; fine-tune delta |
| **Aviation crew scheduling** | BUY | Carmen/Jeppesen (large airlines); OptaPlanner OSS (smaller) | MIP complexity too high to build competitively |
| **Aviation revenue management** | BUY | Amadeus ARM, PROS, Navitaire | Requires years of airline-specific data; not buildable |
| **Battery SoH model** | BUILD | VinFast-specific battery chemistry and usage patterns | No public model trained on VinFast LFP/NMC data |
| **OBD predictive maintenance** | BUILD (semi) | Base models exist; fine-tune on Vietnam fleet | Start with open-source LSTM-AE; fine-tune on local data |
| **ANPR (license plate)** | BUILD | Vietnam plate formats; PaddleOCR fine-tune | 2-week fine-tuning project with 10K Vietnam plate images |
| **Traffic signal optimization** | OPEN-SOURCE + BUILD | SUMO for simulation; custom RL policy | RL policy = build; SUMO simulator = OSS |
| **Fleet digital twin** | BUILD | Platform-specific state model | PostgreSQL + simulation engine; 3–6 months |

### 6.3 Open-Source Stack Summary

```
Transportation AI Open-Source Toolkit:
┌────────────────────────────────────────────────────────────────────┐
│  ROUTING & NAVIGATION                                              │
│  OpenTripPlanner 2 (OTP2)     — multimodal transit routing        │
│  OSRM                          — fast car/custom routing engine    │
│  Valhalla                      — flexible routing with costing     │
│  pgRouting                     — PostGIS-based routing             │
│                                                                    │
│  OPTIMIZATION                                                      │
│  OR-Tools (Google)             — VRP, crew scheduling, MIP        │
│  PyVRP                         — state-of-art VRPTW solver        │
│  HiGHS                         — LP/MIP solver (fast, free)       │
│  OptaPlanner                   — constraint satisfaction (Java)   │
│                                                                    │
│  SIMULATION                                                        │
│  SUMO                          — microscopic traffic simulation    │
│  Mesa                          — agent-based simulation (Python)  │
│  CityFlow                      — large-scale traffic simulation   │
│                                                                    │
│  GEOSPATIAL                                                        │
│  H3 (Uber)                     — hexagonal spatial indexing       │
│  PostGIS                       — geospatial database extension    │
│  Shapely/GeoPandas             — Python geospatial processing     │
│  Folium / Kepler.gl            — geospatial visualization         │
│                                                                    │
│  ML / AI                                                           │
│  DCRNN, STAEFormer             — spatial-temporal forecasting     │
│  PyOD                          — anomaly detection toolkit        │
│  YOLOv11 (Ultralytics)         — object detection                 │
│  PaddleOCR                     — Vietnamese OCR/ANPR              │
│  MediaPipe                     — driver monitoring landmarks      │
│  python-OBD                    — OBD-II data parsing              │
│                                                                    │
│  TRANSIT STANDARDS                                                 │
│  gtfs-kit                      — GTFS static processing (Python) │
│  gtfs-realtime (protobuf)      — GTFS-RT parsing library          │
│  transitland                   — GTFS feed registry API           │
└────────────────────────────────────────────────────────────────────┘
```

### 6.4 Estimated Build Timeline for MAESTRO I13 Core

| Module | Complexity | Timeline | Team |
|---|---|---|---|
| Telemetry pipeline (MQTT → Kafka) | Medium | 4 weeks | 2 backend engineers |
| H3 demand heatmap + surge pricing | Medium | 6 weeks | 1 ML + 1 backend |
| Matching engine (ride-hailing) | High | 10 weeks | 2 backend (Go/Rust) |
| ETA predictor (baseline) | Low-Medium | 3 weeks | 1 ML engineer |
| Driver behavior scoring | Medium | 5 weeks | 1 ML engineer |
| OBD predictive maintenance | Medium | 6 weeks | 1 ML engineer |
| GTFS ingestion + ridership forecast | Medium | 5 weeks | 1 ML + 1 data engineer |
| Traffic CV pipeline (camera) | High | 8 weeks | 1 CV + 1 backend |
| Fleet digital twin (basic) | High | 10 weeks | 2 engineers |
| VinFast OCPP charging integration | Medium | 4 weeks | 1 backend engineer |

**Total (sequential estimate):** ~12 months for full I13 stack
**Parallel team (5–6 engineers):** ~5–6 months for production-ready MVP

---

## Shared Patterns with I06 (Logistics)

The following architectural patterns from the I06 tech-report apply directly to I13 without modification:

| Pattern | I06 Application | I13 Application |
|---|---|---|
| Kafka event bus (MSK/Confluent) | Shipment events, GPS streams | Ride events, vehicle telemetry, GTFS-RT |
| Kappa architecture (Flink streaming) | ETA recalculation, shipment tracking | Surge pricing, ride matching, traffic |
| Redis for real-time state | Driver locations, ETA cache | Driver supply, surge multiplier cache |
| MLflow + SageMaker MLOps | Demand forecasting, anomaly models | All I13 ML models |
| H3 for geospatial aggregation | Delivery zone clustering | Ride demand heatmaps, traffic zones |
| AWS ap-southeast-1 (Singapore) | Primary cloud region | Same — 20-40ms to Vietnam acceptable |
| Feature Store (Feast) | Rolling demand windows | Same, extended with mobility features |

**Key Divergences from I06:**
1. **Matching engine:** I13 requires sub-100ms matching; I06 route optimization runs in 2–5 seconds
2. **Edge AI:** I13 needs in-vehicle inference; I06 has no in-vehicle compute requirement
3. **Aviation GDS:** Completely absent from I06
4. **GTFS/transit:** No I06 equivalent
5. **Motorbike-specific ML:** I13 unique
6. **EV battery management:** I13 unique (VinFast ecosystem)
7. **WebSocket push:** I13 requires real-time push to driver/passenger apps; I06 is mostly pull/webhook

---

## Sources

1. Uber Engineering Blog — H3: Uber's Hexagonal Hierarchical Spatial Index. https://www.uber.com/blog/h3/
2. Uber Research — DeepETA: How Uber Predicts Arrival Times Using Deep Learning. https://www.uber.com/blog/deepeta-how-uber-predicts-arrival-times/
3. Uber Engineering — Marketplace Architecture at Uber. https://www.uber.com/blog/marketplace-architecture/
4. Google OR-Tools Documentation — Vehicle Routing with Time Windows. https://developers.google.com/optimization/routing/vrptw
5. PyVRP — A High-Performance VRP Solver (DIMACS 2022). https://pyvrp.org/
6. SUMO — Simulation of Urban MObility (DLR). https://eclipse.dev/sumo/
7. OpenTripPlanner 2 Documentation. https://docs.opentripplanner.org/
8. GTFS Reference — Google Developers. https://developers.google.com/transit/gtfs/reference
9. GTFS-Realtime Reference. https://developers.google.com/transit/gtfs-realtime/reference
10. Amadeus for Developers — Flight Offers API. https://developers.amadeus.com/self-service/category/flights
11. EMQX MQTT Broker — IoT documentation. https://www.emqx.io/docs/
12. OCPP 2.0.1 Specification — Open Charge Alliance. https://www.openchargealliance.org/protocols/ocpp-201/
13. PaddleOCR — Baidu open-source OCR. https://github.com/PaddlePaddle/PaddleOCR
14. ByteTrack — Multi-Object Tracking. https://github.com/ifzhang/ByteTrack
15. YOLOv11 — Ultralytics documentation. https://docs.ultralytics.com/
16. Optibus — AI-Powered Public Transit Platform. https://www.optibus.com/
17. Lytx DriveCam — Video Telematics. https://www.lytx.com/en-us/products/drivecam
18. HERE Routing API — EV Routing. https://developer.here.com/documentation/routing-api/dev_guide/topics/use-cases/ev-routing.html
19. Zhang J. et al. (2017) — Deep Spatio-Temporal Residual Networks for Citywide Crowd Flows Prediction. AAAI 2017.
20. Li Y. et al. (2018) — Diffusion Convolutional Recurrent Neural Network: Data-Driven Traffic Forecasting. ICLR 2018.
21. Liu X. et al. (2023) — STAEFormer: Spatio-Temporal Adaptive Embedding Makes Vanilla Transformer SOTA for Traffic Forecasting. ACM CIKM 2023.
22. HCMC AI Traffic Camera Deployment — VietnamPlus. https://en.vietnamplus.vn
23. VinFast Charging Infrastructure — Electrive. https://www.electrive.com/2025/08/25/vinfast-to-install-150000-battery-swapping-stations-in-vietnam/
24. Vietmap — Vietnam Map Platform. https://vietmap.vn/
25. python-OBD Library Documentation. https://python-obd.readthedocs.io/
26. IATA NDC Standard (NDC API). https://www.iata.org/en/programs/ndc/
27. IMO MASS Framework (2024). https://www.imo.org/en/MediaCentre/Pages/WhatsNew-1940.aspx
28. EU AI Act (2024) — High-Risk AI Systems Classification. https://artificialintelligenceact.eu/
29. Decree 10/2020/ND-CP — Vietnam Ride-Hailing Transport Business Regulations.
30. Vietnam PDPL 2025 (Law No. 91/2025/QH15) — Personal Data Protection Law.
