# R-DE Notes — Industry Module I13: Transportation & Mobility
**Role:** R-DE (Data Engineer), MAESTRO Knowledge Graph Platform
**Date:** 2026-04-03
**Status:** Phase 0 — Baseline Knowledge Capture
**Reference:** See [I06 R-DE-notes.md](../I06/R-DE-notes.md) for shared patterns (star schema, Kafka configuration, dbt transformation layer, Airflow orchestration, address normalization, data governance). This document describes what is NEW or DIFFERENT for Transportation & Mobility.

---

## 1. Transportation Data Architecture — What is New vs. I06

### 1.1 Architectural Contrast with I06

I06 Logistics data centers on shipment lifecycle events tied to warehouses and vehicles carrying freight. I13 Transportation introduces four qualitatively different data domains that require new schemas:

| Domain | I06 Equivalent | What is New in I13 |
|---|---|---|
| Geospatial demand heatmaps | Route waypoints in JSONB | H3 hexagonal grid indexing — spatial aggregation at hex resolution |
| Telematics (OBD-II + DTC) | IoT sensors (temp, humidity) | Engine diagnostics: RPM, coolant, O2, DTC fault codes |
| GTFS / public transit | No equivalent | Structured transit schedule + real-time vehicle positions |
| Traffic camera video pipeline | None | Video stream → frame extraction → CV inference → event storage |
| Ride-hailing matching events | Driver-shipment assignment | Real-time passenger-driver state machine, surge pricing inputs |

The GPS ping table from I06 (`gps_ping`) is reused directly. The I13 additions are additive schemas alongside it.

---

### 1.2 Geospatial Data — PostGIS + H3 Hexagonal Grid

**Why H3 over plain lat/lon?**

Standard lat/lon coordinate storage (as used in I06 for warehouse geocoding) cannot aggregate spatial demand efficiently. H3 (Uber's open-source hexagonal hierarchical spatial index) assigns any GPS point a hexagon ID at configurable resolution. Resolution 8 hexagons cover approximately 0.74 km² — suitable for urban demand cells in HCMC or Hanoi.

**PostGIS extension setup:**

```sql
-- Enable PostGIS and H3 extensions (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS h3;  -- requires h3-pg package

-- Convert a lat/lon point to H3 index at resolution 8
SELECT h3_lat_lng_to_cell(ST_MakePoint(106.7009, 10.7769)::geometry, 8) AS hex_id;
-- Returns: '88268cd34bfffff' (example)
```

**dim_h3_zone table** — Dimension for all active hexagons in the service area:

| Column | Type | Description |
|---|---|---|
| `hex_id` | VARCHAR(20) PK | H3 cell ID at resolution 8 |
| `resolution` | SMALLINT | Always 8 for city-level; 6 for regional |
| `center_lat` | DECIMAL(9,6) | Hexagon center latitude |
| `center_lon` | DECIMAL(9,6) | Hexagon center longitude |
| `city_code` | VARCHAR(10) | HCMC, HAN, DAN, etc. |
| `district_name` | VARCHAR(100) | Overlapping administrative district (best-fit) |
| `zone_type` | VARCHAR(30) | RESIDENTIAL, COMMERCIAL, TRANSIT_HUB, AIRPORT, INDUSTRIAL |
| `poi_density_score` | DECIMAL(5,3) | Points-of-interest density (0–1), from OSM enrichment |
| `is_active` | BOOLEAN | Whether zone has had any trips in last 30 days |

**Spatial indexing for demand aggregation:**

```sql
-- Aggregate trip pickups into H3 hexagons per hour
SELECT
    h3_lat_lng_to_cell(ST_MakePoint(pickup_lon, pickup_lat)::geometry, 8) AS hex_id,
    DATE_TRUNC('hour', request_ts) AS hour_bucket,
    COUNT(*) AS trip_count,
    AVG(wait_time_sec) AS avg_wait_sec
FROM fact_trip
WHERE request_ts >= NOW() - INTERVAL '7 days'
GROUP BY 1, 2;
```

---

### 1.3 Telematics Data — OBD-II Schema + DTC Storage

The I06 `iot_sensor_reading` table captures generic sensor types. Transportation requires a dedicated telematics schema that captures OBD-II (On-Board Diagnostics) parameters and Diagnostic Trouble Codes (DTCs).

**vehicle_telemetry_event table** (TimescaleDB hypertable, partitioned by hour):

| Column | Type | Description |
|---|---|---|
| `ts` | TIMESTAMPTZ PK | UTC timestamp of reading |
| `vehicle_id` | VARCHAR(36) | FK to dim_vehicle |
| `lat` | DECIMAL(9,6) | GPS latitude |
| `lon` | DECIMAL(9,6) | GPS longitude |
| `speed_kmh` | DECIMAL(5,2) | Speed from GPS or OBD |
| `heading_deg` | SMALLINT | Compass bearing 0–360 |
| `gps_accuracy_m` | DECIMAL(6,2) | GPS fix accuracy |
| `engine_rpm` | SMALLINT | Engine revolutions per minute (OBD-II PID 0x0C) |
| `coolant_temp_c` | SMALLINT | Coolant temperature in °C (OBD-II PID 0x05) |
| `throttle_position_pct` | DECIMAL(5,2) | Throttle position 0–100% (PID 0x11) |
| `fuel_level_pct` | DECIMAL(5,2) | Fuel tank level 0–100% (PID 0x2F) |
| `o2_sensor_voltage_v` | DECIMAL(5,3) | Upstream O2 sensor (PID 0x14) — indicates combustion efficiency |
| `intake_air_temp_c` | SMALLINT | Intake manifold air temperature (PID 0x0F) |
| `mass_air_flow_g_s` | DECIMAL(7,3) | MAF sensor g/sec (PID 0x10) |
| `engine_load_pct` | DECIMAL(5,2) | Calculated engine load 0–100% (PID 0x04) |
| `odometer_km` | DECIMAL(10,1) | Cumulative odometer reading |
| `battery_voltage_v` | DECIMAL(5,2) | 12V system voltage (or HV pack voltage for EVs) |
| `harsh_brake_flag` | BOOLEAN | Deceleration > threshold (configurable, typically > 0.4g) |
| `harsh_accel_flag` | BOOLEAN | Acceleration > threshold |
| `source` | VARCHAR(20) | OBD2_DONGLE, CAN_BUS, MOBILE_APP |

**Retention:** Raw telemetry 90 days (same as I06 GPS); 5-min aggregates 2 years; odometer snapshots indefinitely (needed for maintenance mileage triggers).

**vehicle_dtc_event table** — Diagnostic Trouble Code storage:

| Column | Type | Description |
|---|---|---|
| `dtc_event_id` | BIGINT PK | Surrogate key |
| `vehicle_id` | VARCHAR(36) | FK to dim_vehicle |
| `detected_ts` | TIMESTAMPTZ | When DTC was first observed |
| `cleared_ts` | TIMESTAMPTZ | When DTC was cleared (null if still active) |
| `dtc_code` | VARCHAR(10) | SAE J1979 code, e.g. 'P0301' (cylinder 1 misfire) |
| `dtc_description` | VARCHAR(255) | Human-readable description from code lookup table |
| `severity` | VARCHAR(20) | CRITICAL, MODERATE, LOW (mapped from code category) |
| `odometer_at_detection_km` | DECIMAL(10,1) | Mileage when DTC appeared |
| `mil_status` | BOOLEAN | Malfunction Indicator Light ON/OFF |
| `freeze_frame_json` | JSONB | OBD-II freeze frame data at time of fault (speed, RPM, load) |
| `source_system` | VARCHAR(30) | OBD2_DONGLE, WORKSHOP_SCAN, FLEET_MGMT_APP |

**DTC code reference lookup (dim_dtc_code):**

| Column | Type | Description |
|---|---|---|
| `dtc_code` | VARCHAR(10) PK | SAE code |
| `system_category` | VARCHAR(30) | POWERTRAIN, CHASSIS, BODY, NETWORK |
| `fault_description_en` | VARCHAR(255) | English description |
| `typical_causes` | TEXT | Common causes for ML feature annotation |
| `severity_default` | VARCHAR(20) | Default severity classification |
| `avg_days_to_failure` | SMALLINT | Historical fleet average days from code to breakdown (train from data) |

---

### 1.4 GTFS Data — Static Schedule + GTFS-RT Real-Time

GTFS (General Transit Feed Specification) is the global standard format for public transit data used by Hanoi Metro, HCMC Metro, and bus systems. It has two layers:

**Static GTFS** is delivered as a ZIP of CSV files updated weekly or monthly. Load into PostgreSQL normalized tables:

| GTFS File | PostgreSQL Table | Key Columns |
|---|---|---|
| `agency.txt` | `gtfs_agency` | agency_id, agency_name, agency_url, agency_timezone |
| `routes.txt` | `gtfs_routes` | route_id, agency_id, route_short_name, route_type (0=tram,1=subway,3=bus) |
| `trips.txt` | `gtfs_trips` | trip_id, route_id, service_id, direction_id, shape_id |
| `stops.txt` | `gtfs_stops` | stop_id, stop_name, stop_lat, stop_lon, location_type |
| `stop_times.txt` | `gtfs_stop_times` | trip_id, stop_id, arrival_time, departure_time, stop_sequence |
| `calendar.txt` | `gtfs_calendar` | service_id, monday–sunday booleans, start_date, end_date |
| `shapes.txt` | `gtfs_shapes` | shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence |

**Note on `stop_times`:** This is the largest table — HCMC bus network has ~1,000+ routes × dozens of trips/day × many stops. Partition by `route_id` or use a composite index on `(trip_id, stop_sequence)`.

**GTFS-RT (Real-Time)** is a Protobuf feed published every 15–30 seconds by transit agencies. It provides three message types:

```
FeedMessage
  ├── TripUpdate     — arrival/departure delay predictions per stop
  ├── VehiclePosition — real-time GPS position of each vehicle
  └── Alert          — service disruptions, station closures
```

**Ingestion pipeline for GTFS-RT:**

```
Transit Agency API
    |
    | HTTP polling every 15s (or push via WebSocket)
    v
Python consumer (google.transit.gtfs_realtime_pb2)
    |
    | Deserialize Protobuf → convert to dict
    v
Kafka Topic: transit.gtfs_rt.vehicle_positions
             transit.gtfs_rt.trip_updates
             transit.gtfs_rt.alerts
    |
    v
Flink / Spark Structured Streaming consumer
    |
    v
TimescaleDB: gtfs_rt_vehicle_position (hypertable)
PostgreSQL: gtfs_rt_trip_update, gtfs_rt_alert
```

**gtfs_rt_vehicle_position table** (TimescaleDB hypertable):

| Column | Type | Description |
|---|---|---|
| `ts` | TIMESTAMPTZ PK | Observation timestamp |
| `vehicle_id` | VARCHAR(50) | Agency vehicle identifier |
| `trip_id` | VARCHAR(50) | FK to gtfs_trips |
| `route_id` | VARCHAR(50) | FK to gtfs_routes |
| `stop_id` | VARCHAR(50) | Current or next stop |
| `current_status` | VARCHAR(20) | IN_TRANSIT_TO, STOPPED_AT, INCOMING_AT |
| `lat` | DECIMAL(9,6) | GPS latitude |
| `lon` | DECIMAL(9,6) | GPS longitude |
| `bearing_deg` | SMALLINT | Direction of travel |
| `speed_mps` | DECIMAL(5,2) | Speed in meters/sec from GTFS-RT |
| `congestion_level` | VARCHAR(20) | UNKNOWN, RUNNING_SMOOTHLY, STOP_AND_GO, CONGESTION |
| `occupancy_status` | VARCHAR(30) | EMPTY, MANY_SEATS, FEW_SEATS, STANDING_ONLY, FULL (where available) |

---

### 1.5 Traffic Camera Data — Video Pipeline

I06 has no equivalent. Traffic cameras generate raw video streams that require a multi-stage pipeline before any structured data lands in the database.

**Pipeline architecture:**

```
IP Camera / CCTV Stream
    |
    | RTSP stream (H.264/H.265)
    v
Edge Node (NVIDIA Jetson or server at intersection)
    |
    | Frame extraction: 2 fps (configurable)
    | Pre-processing: resize to 640×640, normalize
    v
CV Inference Engine (YOLOv8 or RT-DETR)
    |
    | Outputs per frame: bounding boxes, class, confidence
    | Vehicle classes: MOTORBIKE, CAR, BUS, TRUCK, PEDESTRIAN
    v
Event aggregation (30-second windows)
    | — vehicle counts per class per lane
    | — speed estimates (optical flow or radar fusion)
    | — incident detection (stopped vehicle, wrong-way, accident)
    v
Kafka Topic: traffic.camera.frame_events
    v
Flink consumer → PostgreSQL/ClickHouse
```

**Frame rate justification:** 2 fps is sufficient for traffic counting and incident detection. Real-time tracking of individual vehicles across frames requires 10–15 fps but generates 5–7× more data. For Vietnam's 1,837 HCMC AI cameras, 2 fps at H3-aggregated output is cost-effective.

**traffic_camera_event table:**

| Column | Type | Description |
|---|---|---|
| `event_id` | BIGINT PK | Surrogate key |
| `camera_id` | VARCHAR(36) | FK to dim_camera |
| `ts` | TIMESTAMPTZ | Timestamp of aggregation window end |
| `window_sec` | SMALLINT | Aggregation window duration (30 seconds) |
| `hex_id` | VARCHAR(20) | H3 hex of camera location |
| `intersection_id` | VARCHAR(36) | FK to dim_intersection |
| `motorbike_count` | SMALLINT | Count in window |
| `car_count` | SMALLINT | Count in window |
| `bus_count` | SMALLINT | Count in window |
| `truck_count` | SMALLINT | Count in window |
| `pedestrian_count` | SMALLINT | Count in window |
| `avg_speed_kmh` | DECIMAL(5,2) | Average vehicle speed (radar fusion or optical flow) |
| `congestion_level` | VARCHAR(20) | FREE_FLOW, SLOW, CONGESTED, STANDSTILL |
| `incident_detected` | BOOLEAN | Any incident flag from CV model |
| `incident_type` | VARCHAR(30) | STOPPED_VEHICLE, WRONG_WAY, ACCIDENT, DEBRIS, null |
| `model_version` | VARCHAR(20) | CV model version for lineage |
| `inference_latency_ms` | SMALLINT | Edge inference time for SLA monitoring |

**Storage note:** Raw video frames are NOT stored in the database. Only the extracted events above are stored. Raw video is retained on edge storage with a 7-day rolling window for incident investigation, then purged. This is a key difference from a data lake approach — GDPR/PDPL compliance for public video mandates short retention.

---

### 1.6 Ride-Hailing Trip Data

**fact_trip table** (grain: one row per completed or cancelled trip):

| Column | Type | Description |
|---|---|---|
| `trip_id` | VARCHAR(36) PK | UUID |
| `request_ts` | TIMESTAMPTZ | When passenger requested ride |
| `match_ts` | TIMESTAMPTZ | When driver accepted |
| `pickup_ts` | TIMESTAMPTZ | When driver arrived at pickup |
| `dropoff_ts` | TIMESTAMPTZ | When passenger was dropped off |
| `cancel_ts` | TIMESTAMPTZ | If trip was cancelled (null otherwise) |
| `cancelled_by` | VARCHAR(20) | PASSENGER, DRIVER, SYSTEM, null |
| `passenger_id` | VARCHAR(36) | Hashed/pseudonymised passenger ID |
| `driver_id` | VARCHAR(36) | FK to dim_driver |
| `vehicle_id` | VARCHAR(36) | FK to dim_vehicle |
| `pickup_lat` | DECIMAL(9,6) | Pickup latitude |
| `pickup_lon` | DECIMAL(9,6) | Pickup longitude |
| `pickup_hex_id` | VARCHAR(20) | H3 hex at resolution 8 |
| `dropoff_lat` | DECIMAL(9,6) | Dropoff latitude |
| `dropoff_lon` | DECIMAL(9,6) | Dropoff longitude |
| `dropoff_hex_id` | VARCHAR(20) | H3 hex at resolution 8 |
| `trip_type` | VARCHAR(20) | STANDARD, POOL, EXPRESS, EV |
| `vehicle_class` | VARCHAR(20) | MOTORBIKE, CAR_4, CAR_7, VAN |
| `distance_km` | DECIMAL(7,3) | Actual trip distance from GPS trace |
| `duration_min` | SMALLINT | Actual trip duration |
| `wait_time_sec` | SMALLINT | Driver ETA to pickup (observed) |
| `base_fare_vnd` | BIGINT | Base calculated fare |
| `surge_multiplier` | DECIMAL(4,2) | Surge pricing multiplier (1.0 = no surge) |
| `final_fare_vnd` | BIGINT | Final charged fare |
| `payment_method` | VARCHAR(20) | CASH, MOMO, ZALO_PAY, CARD |
| `rating_by_passenger` | SMALLINT | 1–5 star rating |
| `rating_by_driver` | SMALLINT | 1–5 star rating |
| `promo_code` | VARCHAR(30) | Promotion code applied |
| `promo_discount_vnd` | BIGINT | Discount amount |
| `platform_fee_vnd` | BIGINT | Platform commission |
| `driver_earnings_vnd` | BIGINT | Driver payout |
| `date_key` | INT | FK to dim_date |
| `weather_condition` | VARCHAR(20) | CLEAR, RAIN, HEAVY_RAIN, STORM (joined at load time) |
| `created_at` | TIMESTAMPTZ | Record creation time |

**Matching event log** — separate table to track the matching state machine (distinct from the final trip record):

| Column | Type | Description |
|---|---|---|
| `event_id` | BIGINT PK | Surrogate key |
| `trip_id` | VARCHAR(36) | FK to fact_trip |
| `event_type` | VARCHAR(30) | REQUEST, DRIVER_OFFERED, DRIVER_ACCEPTED, DRIVER_REJECTED, DRIVER_CANCELLED, PASSENGER_CANCELLED, MATCHED |
| `event_ts` | TIMESTAMPTZ | Event timestamp |
| `driver_id` | VARCHAR(36) | Driver involved in this event |
| `offer_sequence` | SMALLINT | Which offer attempt (1st, 2nd, 3rd driver tried) |
| `driver_distance_m` | INT | Driver distance from pickup at time of offer |
| `driver_eta_sec` | SMALLINT | Predicted ETA at time of offer |

---

## 2. Real-Time Pipeline for Transportation

### 2.1 Kafka Topic Design for Transportation

The I06 Kafka topics handle shipment status and GPS at logistics scale. I13 requires higher-frequency topics with different partitioning strategies.

| Topic Name | Producer | Consumer | Retention | Partition Key | Message Format | Frequency |
|---|---|---|---|---|---|---|
| `transport.vehicle.telemetry` | OBD-II dongles, telematics units | TimescaleDB writer, maintenance AI (B07) | 24 hours | `vehicle_id` | Avro | 1 ping/5sec per vehicle |
| `transport.ridehail.request` | Passenger mobile app | Matching engine, demand model | 7 days | `pickup_hex_id` | JSON | Burst (demand spikes) |
| `transport.ridehail.matching` | Matching engine | Trip state DB writer, analytics | 7 days | `trip_id` | Avro | Per matching event |
| `transport.traffic.camera` | Edge CV nodes (per camera) | Congestion aggregator, incident alert | 6 hours | `camera_id` | Avro | 1 event/30sec per camera |
| `transport.gtfs_rt.positions` | Transit agency feed poller | GTFS-RT DB writer, OTP integration | 2 hours | `vehicle_id` | Protobuf | Every 15 sec per vehicle |
| `transport.dtc.alerts` | Fleet telematics gateway | Maintenance workflow, B07 pipeline | 30 days | `vehicle_id` | JSON | On DTC detection event |
| `transport.incident.alerts` | Incident detection service | Ops dashboard, response dispatch | 30 days | `hex_id` | JSON | On incident detection |

**Key difference from I06:** `transport.vehicle.telemetry` partitioned by `vehicle_id` (same as I06 GPS topic) to ensure per-vehicle ordering. However, at 10,000 vehicles × 12 pings/min, set partition count higher — recommend 60 partitions (vs. 12 for I06 typical fleet) to support parallel consumers.

---

### 2.2 Volume Estimates and Storage Design

**Scenario: 10,000 vehicles, GPS + telemetry at 1 ping per 5 seconds**

```
Events per second:   10,000 vehicles / 5 sec = 2,000 events/sec
Events per minute:   2,000 × 60 = 120,000/min
Events per hour:     120,000 × 60 = 7,200,000 events/hour (7.2M/hour)
Events per day:      7.2M × 24 = 172.8M events/day

Payload per event (Avro compressed): ~400 bytes
  (vehicle_id 36B + ts 8B + lat/lon 16B + OBD fields ~100B + overhead)

Storage per day (raw):  172.8M × 400B = ~69 GB/day
Storage per day (Parquet columnar compressed, ~6:1): ~11.5 GB/day
90-day raw retention:   ~1 TB (Parquet on S3)
```

**Tiered storage strategy:**

| Tier | Storage | Retention | Access Pattern |
|---|---|---|---|
| Hot (streaming) | Kafka (in-topic) | 24 hours | Real-time consumers |
| Warm (queryable) | TimescaleDB hypertable | 90 days | ML feature queries, anomaly detection |
| Cold (archival) | S3 Parquet, partitioned by vehicle_id/date | 2 years | Batch training, audit |
| Aggregated | ClickHouse or Redshift | Indefinite | Analytics dashboards |

**ClickHouse for traffic analytics:** Unlike I06 where Redshift handles shipment analytics, transportation aggregation workloads (count vehicles by hex by hour, compute average speeds) benefit from ClickHouse's columnar storage and vectorized query execution. A single ClickHouse node handles 1B+ rows analytics queries in seconds.

---

### 2.3 Matching Engine Data Flow — In-Memory vs. Stream

The ride-hailing matching engine is the most latency-sensitive component in I13. It differs fundamentally from I06's shipment dispatch:

| Aspect | I06 Dispatch | I13 Matching Engine |
|---|---|---|
| Latency requirement | Minutes (route planning) | <500ms (driver offer must be sent) |
| State location | PostgreSQL | In-memory (Redis / DynamoDB) |
| Algorithm | VRP solver (batch) | Online assignment (greedy bipartite or RL) |
| Update frequency | Per route plan cycle | Per GPS ping (continuous driver positions) |

**Matching state in Redis:**

```
Key pattern:  driver:<driver_id>:state
Value (JSON): {
  "driver_id": "DRV-001",
  "status": "AVAILABLE",  // AVAILABLE, EN_ROUTE_PICKUP, ON_TRIP, OFFLINE
  "lat": 10.7769,
  "lon": 106.7009,
  "last_ping_ts": "2026-04-03T08:30:05Z",
  "vehicle_class": "MOTORBIKE",
  "rating": 4.7,
  "hex_id": "88268cd34bfffff"
}
TTL: 30 seconds (driver marked offline if no GPS ping within 30s)

Key pattern:  hex:<hex_id>:available_drivers
Value: Sorted set, scored by distance from hex center
```

**Matching flow:**

```
1. Passenger request arrives (pickup_lat, pickup_lon)
2. Convert to H3 hex_id and neighboring hexagons (k-ring radius 2)
3. Redis GEORADIUS or hex-based lookup → candidate driver list
4. Score candidates: ETA + rating + acceptance rate + vehicle preference
5. Offer to top N drivers sequentially (or in parallel with timeout)
6. First acceptance → publish to transport.ridehail.matching Kafka topic
7. Kafka consumer writes matching event to PostgreSQL (async, non-blocking)
```

**State persistence:** Redis is the source of truth for live driver positions. PostgreSQL/DynamoDB is the durable event log. Never query PostgreSQL in the hot matching path — only Redis.

---

### 2.4 Traffic Incident Alert Pipeline

```
Camera CV Node
    | (incident_detected = true, incident_type = ACCIDENT)
    v
Kafka: transport.incident.alerts
    |
    v
Flink CEP (Complex Event Processing)
    | — Correlate incidents across neighboring cameras
    | — Deduplicate (same incident reported by 2 cameras)
    | — Enrich with hex_id, affected_routes (from GTFS data)
    v
Alert DB (PostgreSQL)
    |
    +---> Traffic control dashboard (WebSocket push)
    +---> GTFS-RT Alert feed (notify transit passengers)
    +---> Ride-hailing routing engine (route around incident)
```

**Flink CEP rule example (pseudo-code):**
```
Pattern: INCIDENT event from camera_A, followed by
         CONGESTION event from camera_B (adjacent hex),
         within 5 minutes
→ Classify as: CONFIRMED_INCIDENT
→ Trigger: dispatch alert, update affected hex congestion level
```

---

## 3. Feature Engineering for Transportation ML

### 3.1 B01 Demand Forecasting — Spatial-Temporal Features

The I06 demand forecast operates at SKU × warehouse × day granularity. I13 demand forecasting operates at H3 hexagon × hour granularity for ride-hailing and at stop × hour for transit.

**forecast_demand_input table** (ride-hailing, grain: hex × hour):

| Column | Type | Description |
|---|---|---|
| `forecast_input_id` | BIGINT PK | Surrogate key |
| `forecast_hour` | TIMESTAMPTZ | Hour being forecasted (UTC) |
| `hex_id` | VARCHAR(20) | H3 hex at resolution 8 |
| `city_code` | VARCHAR(10) | HCMC, HAN, etc. |
| `actual_trip_count` | INT | Filled after hour passes (label) |
| `trip_count_lag_1h` | INT | Trips in previous hour |
| `trip_count_lag_24h` | INT | Trips same hour yesterday |
| `trip_count_lag_168h` | INT | Trips same hour last week |
| `rolling_mean_7d_same_hour` | DECIMAL(10,2) | 7-day mean for this hour slot |
| `rolling_std_7d_same_hour` | DECIMAL(10,2) | 7-day std dev |
| `hour_of_day` | SMALLINT | 0–23 |
| `day_of_week` | SMALLINT | 0=Monday |
| `is_weekend` | BOOLEAN | Saturday or Sunday |
| `is_vn_holiday` | BOOLEAN | National holiday |
| `is_tet_period` | BOOLEAN | Tet window (T-14 to T+3) |
| `days_to_tet` | SMALLINT | Signed distance (negative = before Tet) |
| `is_payday` | BOOLEAN | 1st or 15th of month |
| `rain_intensity` | VARCHAR(20) | NONE, LIGHT, MODERATE, HEAVY (from weather API) |
| `rainfall_mm_last_1h` | DECIMAL(6,2) | Rainfall in preceding hour |
| `temperature_c` | DECIMAL(5,2) | Current temperature |
| `concert_event_nearby` | BOOLEAN | Major event within 2km of hex center |
| `football_match_nearby` | BOOLEAN | Football match within 3km |
| `event_attendance_estimate` | INT | Estimated attendance of nearby event |
| `metro_disruption_flag` | BOOLEAN | Metro line disruption active (pushes demand to ride-hail) |
| `zone_type` | VARCHAR(30) | From dim_h3_zone |
| `avg_driver_count_lag_1h` | INT | Online drivers in hex last hour |
| `surge_multiplier_lag_1h` | DECIMAL(4,2) | Previous hour's surge level |
| `pipeline_run_id` | VARCHAR(36) | Airflow DAG run ID |

**Vietnam-specific calendar features:**
- `is_tet_period`: critical — ride demand drops 60–70% as population travels home; airport/bus terminal demand spikes.
- `football_match_nearby`: Vietnam national team matches cause demand spikes at stadiums (My Dinh in Hanoi, Thong Nhat in HCMC).
- `concert_event_nearby`: Hoa Dang arena events, Phu Tho stadium concerts.
- `is_payday`: First and fifteenth of month show consistent demand uplift in Vietnam.

---

### 3.2 B06 Route Optimization — Road Network Graph

I06 uses route waypoints stored as JSONB and OSM for enrichment. I13 requires a fully materialized road network graph for real-time routing.

**OSM data for Vietnam — PostGIS representation:**

```sql
-- Road network nodes
CREATE TABLE osm_node (
    node_id     BIGINT PRIMARY KEY,
    geom        GEOMETRY(POINT, 4326),
    lat         DECIMAL(9,6),
    lon         DECIMAL(9,6),
    is_junction BOOLEAN,
    tags        JSONB  -- OSM tags: traffic_signals, stop_sign, etc.
);

-- Road network edges (directed)
CREATE TABLE osm_edge (
    edge_id          BIGINT PRIMARY KEY,
    source_node_id   BIGINT REFERENCES osm_node(node_id),
    target_node_id   BIGINT REFERENCES osm_node(node_id),
    way_id           BIGINT,  -- OSM way ID
    road_type        VARCHAR(30),  -- motorway, trunk, primary, secondary, residential, etc.
    name_vn          VARCHAR(255),
    length_m         DECIMAL(10,2),
    max_speed_kmh    SMALLINT,
    lanes            SMALLINT,
    oneway           BOOLEAN,
    surface          VARCHAR(20),  -- asphalt, concrete, gravel
    access           VARCHAR(20),  -- yes, no, private, motorbike
    toll             BOOLEAN,
    geom             GEOMETRY(LINESTRING, 4326)
);

-- Speed lookup table (historical avg speed by edge × hour × day_type)
CREATE TABLE edge_speed_profile (
    edge_id      BIGINT REFERENCES osm_edge(edge_id),
    hour_of_day  SMALLINT,         -- 0–23
    day_type     VARCHAR(10),      -- WEEKDAY, SATURDAY, SUNDAY, HOLIDAY
    speed_p50    DECIMAL(5,2),     -- median speed km/h
    speed_p85    DECIMAL(5,2),     -- 85th percentile (near free-flow)
    speed_p15    DECIMAL(5,2),     -- 15th percentile (congested)
    sample_count INT,              -- number of GPS pings used
    PRIMARY KEY (edge_id, hour_of_day, day_type)
);
```

**pgrouting extension** enables Dijkstra and A* shortest-path queries directly in PostgreSQL:

```sql
-- Install pgRouting
CREATE EXTENSION pgrouting;

-- Shortest path query with live speed weights
SELECT seq, node, edge, agg_cost
FROM pgr_dijkstra(
    'SELECT edge_id AS id, source_node_id AS source, target_node_id AS target,
            length_m / NULLIF(speed_p50, 0) * 3.6 AS cost  -- cost in seconds
     FROM osm_edge e
     JOIN edge_speed_profile esp USING (edge_id)
     WHERE esp.hour_of_day = EXTRACT(HOUR FROM NOW())
       AND esp.day_type = current_day_type()',
    source_node_id,
    target_node_id,
    directed := true
);
```

**Motorbike-specific routing consideration:** OSM `access=motorbike` tag filters applicable roads. Many highways in Vietnam prohibit motorbikes — the routing graph must apply these access restrictions, which car-only routing services (Google Maps default) do not always surface correctly.

---

### 3.3 B07 Predictive Maintenance — OBD-II Feature Engineering

I06 anomaly detection focuses on SLA breaches and route deviation. I13 predictive maintenance focuses on vehicle mechanical health prediction.

**Feature categories from OBD-II sensor stream:**

| Feature Group | Raw Signal | Engineered Feature | Engineering Method |
|---|---|---|---|
| Engine temperature | `coolant_temp_c` | `coolant_temp_rolling_max_10min` | Rolling max over 10-min window |
| Engine load | `engine_load_pct` | `engine_load_above_80pct_duration_min` | Time spent above threshold per trip |
| O2 sensor health | `o2_sensor_voltage_v` | `o2_voltage_variability_std` | Std dev over last 100 readings — low variability indicates sensor degradation |
| Vibration proxy | `harsh_brake_flag`, `harsh_accel_flag` | `harsh_event_count_per_100km` | Normalized per distance — detects suspension wear |
| Mileage degradation | `odometer_km` | `km_since_last_service` | Subtracted from service record timestamp |
| DTC history | `dtc_code` | `dtc_count_last_30d`, `recurrent_dtc_flag` | Count of codes; flag if same code appears >2 times |
| Battery health (EV) | `battery_voltage_v` | `soh_estimate_pct` | State-of-health from voltage degradation curve model |

**Vibration FFT features** (requires accelerometer data, available in higher-end telematics units):

```python
# Compute FFT on 10-second vibration window
import numpy as np

def compute_vibration_features(accel_z_series: np.ndarray, sample_rate_hz: int = 100) -> dict:
    fft_vals = np.abs(np.fft.rfft(accel_z_series))
    freqs = np.fft.rfftfreq(len(accel_z_series), d=1/sample_rate_hz)

    return {
        "peak_freq_hz": freqs[np.argmax(fft_vals)],
        "energy_0_10hz": np.sum(fft_vals[(freqs >= 0) & (freqs < 10)] ** 2),   # road surface noise
        "energy_10_50hz": np.sum(fft_vals[(freqs >= 10) & (freqs < 50)] ** 2), # engine/drivetrain
        "energy_50_100hz": np.sum(fft_vals[(freqs >= 50)] ** 2),               # bearing wear signature
        "rms_amplitude": np.sqrt(np.mean(accel_z_series ** 2))
    }
```

**Mileage-based degradation curves** (stored as reference table):

| Component | Service Interval (km) | Alert at | Source |
|---|---|---|---|
| Engine oil | 5,000 (motorbike) / 10,000 (car) | 500 km before | Manufacturer spec |
| Air filter | 15,000 | 2,000 km before | Manufacturer spec |
| Brake pads | 30,000–50,000 (varies) | 5,000 km before | Fleet historical data |
| Timing belt | 60,000–90,000 | 10,000 km before | Manufacturer spec |
| Tires | 50,000–80,000 | 5,000 km before | Fleet historical data |

---

### 3.4 B03 Computer Vision — Traffic Camera Inference

**Frame rate vs. latency budget:**

| Use Case | Minimum FPS | Latency Budget | Inference Hardware |
|---|---|---|---|
| Vehicle counting / density | 1–2 fps | <5 seconds | CPU (OpenVINO) or Jetson Nano |
| Incident detection (stopped vehicle) | 2–5 fps | <30 seconds | Jetson Xavier or T4 GPU |
| License plate recognition (LPR) | 10–15 fps | <2 seconds | Jetson Orin or A10 GPU |
| Driver behavior (dashcam) | 15–30 fps | <100ms | Jetson Orin, in-vehicle |

**Model serving latency budget for Vietnam's 1,837 HCMC cameras:**

```
Per camera inference load:
  - 2 fps × 640×640 × YOLOv8-S: ~12ms per frame on Jetson Xavier
  - Per camera: 2 inferences/sec → 2% of Xavier capacity
  - 1 Xavier (8 TOPS) handles ~50 cameras at 2 fps

Infrastructure for 1,837 cameras at 2 fps:
  - 1,837 / 50 = ~37 edge nodes (Jetson Xavier class)
  - Alternative: centralized GPU cluster with camera stream aggregation
    (requires low-latency fiber from all 195 intersections)

Recommended: Hybrid — edge inference at intersection level
  (1 Jetson per 10-camera intersection cluster = ~195 edge nodes)
```

**cv_model_inference_log table** (sampled, not every frame):

| Column | Type | Description |
|---|---|---|
| `log_id` | BIGINT PK | Surrogate key |
| `camera_id` | VARCHAR(36) | FK to dim_camera |
| `frame_ts` | TIMESTAMPTZ | Frame capture timestamp |
| `model_id` | VARCHAR(50) | Model version identifier |
| `inference_latency_ms` | SMALLINT | Time to run inference |
| `detection_count` | SMALLINT | Objects detected in frame |
| `confidence_min` | DECIMAL(4,3) | Lowest confidence score |
| `confidence_mean` | DECIMAL(4,3) | Average confidence score |
| `frame_quality_score` | DECIMAL(4,3) | Image quality (blur, occlusion) |

Sampled at 1% of frames for performance monitoring. Full detection results go to `traffic_camera_event` (aggregated).

---

## 4. Vietnam-Specific Data Challenges

### 4.1 Motorbike GPS Accuracy

Vietnam's 50M+ motorbikes present a data quality problem that does not exist in freight logistics.

| Device Type | Typical GPS Accuracy | Update Rate | Cost | Vietnam Context |
|---|---|---|---|---|
| Commercial truck telematics (I06) | ±3–5 meters | 30 seconds | USD 80–200/unit | Professional fleet; stable mount |
| OBD-II dongle (car) | ±5–10 meters | 5–30 seconds | USD 20–50/unit | Growing adoption |
| Smartphone GPS (ride-hailing driver app) | ±5–15 meters | 5 seconds | Free (uses driver phone) | Grab, Be, Xanh SM rely on this |
| Consumer-grade motorbike tracker | ±15–50 meters | 30–60 seconds | USD 10–30/unit | Low-cost trackers; common in VN |
| No dedicated GPS (manual position) | N/A | On-demand | Free | Small fleet operators |

**Problems from low-accuracy motorbike GPS:**

1. **Map-matching failures:** ±50m accuracy means a motorbike may appear to be on the wrong road — esp. in dense alley networks (hẻm) in HCMC/Hanoi. Standard map-matching algorithms (HMM-based) need accuracy < 20m to reliably snap to correct road segment.

2. **Speed calculation noise:** Speed derived from Δlat/Δlon with 15-second intervals and ±15m accuracy gives ±7 km/h noise — too noisy for congestion detection.

3. **H3 hex assignment errors:** At resolution 8 (hexagon radius ~500m), ±50m accuracy is acceptable. At resolution 9 (radius ~170m), misassignment rate becomes significant.

**Mitigations:**
- Use resolution 8 (not 9 or 10) for demand heatmaps in motorbike-dominant markets.
- Apply Kalman filter smoothing before map-matching: smooth GPS trace with speed and heading constraints.
- For fleet operators: mandate minimum accuracy_m threshold; filter pings with accuracy > 30m before aggregation.
- Use smartphone GPS with assisted A-GPS (faster fix, uses cell tower data) — delivers ±5m in open areas.

### 4.2 OpenStreetMap Coverage for Vietnam

OSM coverage in Vietnam is high for major cities (HCMC, Hanoi) but uneven for rural and suburban areas.

| Area Type | OSM Road Coverage | Accuracy | Notes |
|---|---|---|---|
| HCMC District 1–7 | ~95% | High | Well-maintained by local mappers |
| HCMC outer districts (Bình Chánh, Cần Giờ) | ~70% | Medium | Missing many residential alleys |
| Hanoi urban core | ~90% | High | Active mapping community |
| Provincial cities (Đà Nẵng, Cần Thơ) | ~80% | Medium | Main roads good; side streets patchy |
| Rural communes | ~40–60% | Low | Unpaved tracks often missing |

**Issues for routing:**

- **Hẻm (alley) coverage:** HCMC has ~15,000 km of alleys (hẻm) — not comprehensively mapped. Last-mile motorbike delivery and ride-hailing pickup depend on hẻm navigation.
- **Access restrictions outdated:** OSM one-way tags and motorbike restrictions are often not updated when traffic management changes.
- **2025 administrative mergers:** Vietnam merged/renamed provinces in 2025; OSM admin boundaries may lag official changes.

**Recommendation:** Supplement OSM with:
1. Vietmap SDK (Vietnamese commercial map provider) for routing — better hẻm coverage and updated traffic rules.
2. HERE Maps for HD map layers if deploying ADAS.
3. Contribute back to OSM (run OSM import from Ministry of Natural Resources data where licensed).

### 4.3 Vietmap vs. Google Maps for Vietnam Routing

| Provider | Coverage Quality | Update Frequency | API Cost | Routing API | Offline Support |
|---|---|---|---|---|---|
| **Google Maps Platform** | Excellent (major roads) | Near real-time | USD 5–7 per 1,000 requests | Yes (Directions API) | No |
| **Vietmap** | Best for Vietnam alleys | Monthly | Lower (VND-based pricing) | Yes (REST) | Yes (SDK) |
| **HERE Maps** | Good (global standard) | Regular | USD 1–10 per 1,000 | Yes (Routing v8) | Yes |
| **OpenStreetMap + OSRM** | Variable (see 4.2) | Community-driven | Free (self-hosted) | Yes (self-hosted) | Yes |
| **OpenTripPlanner** | Based on GTFS + OSM | Per GTFS update | Free (open-source) | Yes (REST/GraphQL) | Yes |

**Decision framework:**
- **Ride-hailing startup (Grab-competitor scale):** Vietmap for rider-facing maps + HERE for driver navigation (better real-time traffic). Budget: ~$5,000–15,000/month at scale.
- **Fleet management (50–500 vehicles):** Vietmap SDK (offline capable) + OSM/OSRM for routing engine. Budget: ~$500–2,000/month.
- **Public transit authority:** OpenTripPlanner + OSM + GTFS (zero cost, full control). Deploy on own infrastructure.
- **EV charging optimization (VinFast scale):** Google Maps + HERE for charging station location data, supplemented with VinFast proprietary charger network data.

### 4.4 Real-Time Traffic Data Availability

| City | Real-Time Traffic Data | Source | Coverage |
|---|---|---|---|
| HCMC | Moderate | 1,837 AI cameras, TomTom, HERE probe data | Major corridors; gaps in outer districts |
| Hanoi | Limited | Traffic management center cameras, HERE | Ring roads and major arteries only |
| Đà Nẵng | Minimal | City cameras only | Limited to city center |
| Other cities | Negligible | Sparse camera coverage | Not actionable |

**Waze comparison:** Waze's community reporting model requires critical mass of users in a corridor to generate useful real-time alerts. HCMC has sufficient density; Hanoi borderline; other cities insufficient.

**Implication for data engineering:** Outside HCMC and Hanoi, real-time traffic features cannot be reliably populated. Strategy:
- Use `historical_speed_p50` from edge_speed_profile as fallback when real-time data is absent.
- Flag features with `data_source = 'HISTORICAL'` vs. `'REALTIME'` in forecast input tables.
- Set `confidence_weight` lower for historical-only zones in model training.

---

## 5. Recommended Data Stack

### 5.1 Ride-Hailing / Mobility Startup — Cloud-Native (AWS)

Target: Startup competing with Grab/Be at city scale, 10,000–100,000 trips/day.

| Layer | Service | Justification |
|---|---|---|
| GPS + telemetry streaming | Amazon MSK (Managed Kafka) | Handles 7.2M events/hour; managed, no Kafka ops burden |
| Real-time processing | Apache Flink on Amazon KDA | Sub-second latency for matching engine feed, incident detection |
| Matching state | Amazon DynamoDB (single-digit ms) | Driver positions, trip state — replace Redis for serverless scale |
| Driver position cache | Amazon ElastiCache (Redis) | Hot path for matching; DynamoDB async sync |
| Trip & event storage | Amazon Aurora PostgreSQL + PostGIS | Transactional trips, spatial queries, PostGIS H3 |
| Analytics / feature compute | Amazon Redshift Serverless | Demand heatmaps, surge pricing inputs, BI |
| Time-series telemetry | Amazon Timestream | OBD-II sensor data |
| Geospatial enrichment | Amazon Location Service | Map matching, geocoding (backed by HERE) |
| ML feature store | Amazon SageMaker Feature Store | Demand forecast features, driver scoring |
| Model serving | Amazon SageMaker Endpoints | Surge pricing model, ETA model |
| Orchestration | Amazon MWAA (Airflow) | Batch feature pipelines |
| BI | Amazon QuickSight | Ops dashboards |

**Estimated monthly cost (10,000 active vehicles, 50,000 trips/day):** ~$8,000–15,000 USD/month.

---

### 5.2 Fleet Management Company — Cost-Effective Stack (50–500 Vehicles)

Target: Fleet operator (bus company, logistics motorbike fleet, taxi company) prioritizing low cost and operational simplicity.

| Layer | Technology | Why |
|---|---|---|
| Telemetry ingestion | MQTT broker (EMQX, self-hosted) | Lightweight IoT protocol; lower overhead than Kafka for <500 devices |
| Time-series storage | **InfluxDB OSS** | Native IoT/telemetry store; Flux query language for downsampling; free tier adequate |
| Relational / spatial | **PostgreSQL + PostGIS** | Trip records, driver data, H3 zone mapping; pgrouting for route analysis |
| DTC & maintenance | PostgreSQL (same instance) | Low volume; no need for separate system |
| Batch processing | Python + pandas / DuckDB | Scheduled jobs for maintenance alerts, driver scoring |
| Orchestration | Prefect Cloud (free tier) | Simple DAG scheduling |
| BI / dashboards | **Metabase Community** | Non-technical fleet managers can use it; connects to PostgreSQL + InfluxDB |
| Maps | Vietmap SDK | Better local coverage; offline capability for remote routes |

**InfluxDB schema for telemetry:**

```
Measurement: vehicle_telemetry
Tags:        vehicle_id, city_code, vehicle_type
Fields:      lat, lon, speed_kmh, engine_rpm, coolant_temp_c,
             fuel_level_pct, engine_load_pct, harsh_brake_flag
Timestamp:   nanosecond precision
```

**Estimated monthly cost (200 vehicles):** ~$300–800 USD/month (VPS or on-prem server).

---

### 5.3 Public Transit Authority — Open-Source Stack

Target: Hanoi/HCMC Metro, provincial bus authority. Prioritizes open standards, zero license cost, full data ownership.

| Layer | Technology | Notes |
|---|---|---|
| GTFS static hosting | Nginx + S3-compatible (MinIO) | Publish GTFS ZIP for public and app developer consumption |
| GTFS-RT feed | Custom Python publisher | Reads from on-board GPS units; publishes Protobuf |
| Trip planning | **OpenTripPlanner (OTP) 2.x** | Gold standard open-source multimodal trip planner; runs on JVM |
| Routing data | OSM (Vietnam extract) + GTFS | Pedestrian + transit multimodal routing |
| Database | **PostgreSQL** | GTFS schedule, ridership analytics, station data |
| Real-time positions | TimescaleDB (PostgreSQL extension) | GTFS-RT vehicle positions hypertable |
| Dashboards | **Grafana** | Connect to PostgreSQL/TimescaleDB; real-time ridership, headway monitoring |
| Ridership forecasting | Python (scikit-learn or Prophet) | GTFS trip history + weather + events → ridership model |
| Occupancy counting | OpenCV on Raspberry Pi (per station) | Low-cost computer vision for passenger count at fare gates |

**OTP configuration note:** OTP 2.x requires GTFS feed URL and OSM PBF extract as inputs. Vietnam OSM extract (~200MB PBF) available from Geofabrik. OTP builds a routing graph in ~5 minutes. Expose REST/GraphQL API to passenger apps.

**Estimated infrastructure cost:** ~$500–1,500 USD/month (2 VMs: OTP server + PostgreSQL server).

---

## 6. Sample Data Schemas

### 6.1 Vehicle Telemetry Event Table

```json
{
  "table": "vehicle_telemetry_event",
  "description": "Grain: one row per GPS+OBD-II reading per vehicle. TimescaleDB hypertable partitioned by hour.",
  "columns": [
    {"name": "ts",                    "type": "TIMESTAMPTZ",   "nullable": false, "pk": true},
    {"name": "vehicle_id",            "type": "VARCHAR(36)",   "nullable": false, "pk": true},
    {"name": "lat",                   "type": "DECIMAL(9,6)",  "nullable": false},
    {"name": "lon",                   "type": "DECIMAL(9,6)",  "nullable": false},
    {"name": "speed_kmh",             "type": "DECIMAL(5,2)",  "nullable": true},
    {"name": "heading_deg",           "type": "SMALLINT",      "nullable": true},
    {"name": "gps_accuracy_m",        "type": "DECIMAL(6,2)",  "nullable": true},
    {"name": "engine_rpm",            "type": "SMALLINT",      "nullable": true,  "note": "OBD-II PID 0x0C"},
    {"name": "coolant_temp_c",        "type": "SMALLINT",      "nullable": true,  "note": "OBD-II PID 0x05"},
    {"name": "throttle_position_pct", "type": "DECIMAL(5,2)",  "nullable": true,  "note": "OBD-II PID 0x11"},
    {"name": "fuel_level_pct",        "type": "DECIMAL(5,2)",  "nullable": true,  "note": "OBD-II PID 0x2F"},
    {"name": "o2_sensor_voltage_v",   "type": "DECIMAL(5,3)",  "nullable": true,  "note": "OBD-II PID 0x14"},
    {"name": "engine_load_pct",       "type": "DECIMAL(5,2)",  "nullable": true,  "note": "OBD-II PID 0x04"},
    {"name": "odometer_km",           "type": "DECIMAL(10,1)", "nullable": true},
    {"name": "battery_voltage_v",     "type": "DECIMAL(5,2)",  "nullable": true},
    {"name": "harsh_brake_flag",      "type": "BOOLEAN",       "nullable": false, "default": false},
    {"name": "harsh_accel_flag",      "type": "BOOLEAN",       "nullable": false, "default": false},
    {"name": "source",                "type": "VARCHAR(20)",   "nullable": false,
     "allowed_values": ["OBD2_DONGLE", "CAN_BUS", "MOBILE_APP", "STANDALONE_GPS"]}
  ],
  "indexes": [
    {"columns": ["vehicle_id", "ts"], "note": "Primary time-series access pattern"},
    {"columns": ["ts"],               "note": "TimescaleDB partition index — auto-created"}
  ],
  "retention": {
    "raw": "90 days",
    "5min_aggregate": "2 years",
    "daily_summary": "indefinite"
  }
}
```

---

### 6.2 Ride-Hailing Trip Table

```json
{
  "table": "fact_trip",
  "description": "Grain: one row per trip (completed, cancelled, or no-show). Star schema fact table.",
  "columns": [
    {"name": "trip_id",               "type": "VARCHAR(36)",   "nullable": false, "pk": true},
    {"name": "date_key",              "type": "INT",           "nullable": false, "fk": "dim_date"},
    {"name": "driver_id",             "type": "VARCHAR(36)",   "nullable": true,  "fk": "dim_driver"},
    {"name": "vehicle_id",            "type": "VARCHAR(36)",   "nullable": true,  "fk": "dim_vehicle"},
    {"name": "passenger_id",          "type": "VARCHAR(36)",   "nullable": false, "note": "Pseudonymized per PDPL 2025"},
    {"name": "request_ts",            "type": "TIMESTAMPTZ",   "nullable": false},
    {"name": "match_ts",              "type": "TIMESTAMPTZ",   "nullable": true},
    {"name": "pickup_ts",             "type": "TIMESTAMPTZ",   "nullable": true},
    {"name": "dropoff_ts",            "type": "TIMESTAMPTZ",   "nullable": true},
    {"name": "cancel_ts",             "type": "TIMESTAMPTZ",   "nullable": true},
    {"name": "cancelled_by",          "type": "VARCHAR(20)",   "nullable": true,
     "allowed_values": ["PASSENGER", "DRIVER", "SYSTEM", null]},
    {"name": "pickup_lat",            "type": "DECIMAL(9,6)",  "nullable": false},
    {"name": "pickup_lon",            "type": "DECIMAL(9,6)",  "nullable": false},
    {"name": "pickup_hex_id",         "type": "VARCHAR(20)",   "nullable": false, "note": "H3 resolution 8"},
    {"name": "dropoff_lat",           "type": "DECIMAL(9,6)",  "nullable": true},
    {"name": "dropoff_lon",           "type": "DECIMAL(9,6)",  "nullable": true},
    {"name": "dropoff_hex_id",        "type": "VARCHAR(20)",   "nullable": true,  "note": "H3 resolution 8"},
    {"name": "trip_type",             "type": "VARCHAR(20)",   "nullable": false,
     "allowed_values": ["STANDARD", "POOL", "EXPRESS", "EV", "MOTORBIKE"]},
    {"name": "vehicle_class",         "type": "VARCHAR(20)",   "nullable": false,
     "allowed_values": ["MOTORBIKE", "CAR_4", "CAR_7", "VAN"]},
    {"name": "distance_km",           "type": "DECIMAL(7,3)",  "nullable": true},
    {"name": "duration_min",          "type": "SMALLINT",      "nullable": true},
    {"name": "wait_time_sec",         "type": "SMALLINT",      "nullable": true,  "note": "Actual driver ETA observed"},
    {"name": "base_fare_vnd",         "type": "BIGINT",        "nullable": true},
    {"name": "surge_multiplier",      "type": "DECIMAL(4,2)",  "nullable": false, "default": 1.0},
    {"name": "final_fare_vnd",        "type": "BIGINT",        "nullable": true},
    {"name": "platform_fee_vnd",      "type": "BIGINT",        "nullable": true},
    {"name": "driver_earnings_vnd",   "type": "BIGINT",        "nullable": true},
    {"name": "payment_method",        "type": "VARCHAR(20)",   "nullable": true,
     "allowed_values": ["CASH", "MOMO", "ZALO_PAY", "VNPAY", "CARD"]},
    {"name": "rating_by_passenger",   "type": "SMALLINT",      "nullable": true,  "check": "1–5"},
    {"name": "rating_by_driver",      "type": "SMALLINT",      "nullable": true,  "check": "1–5"},
    {"name": "promo_code",            "type": "VARCHAR(30)",   "nullable": true},
    {"name": "promo_discount_vnd",    "type": "BIGINT",        "nullable": true},
    {"name": "weather_condition",     "type": "VARCHAR(20)",   "nullable": true,
     "allowed_values": ["CLEAR", "CLOUDY", "LIGHT_RAIN", "HEAVY_RAIN", "STORM"]},
    {"name": "created_at",            "type": "TIMESTAMPTZ",   "nullable": false, "default": "NOW()"},
    {"name": "source_platform",       "type": "VARCHAR(30)",   "nullable": false, "note": "GRAB, XANH_SM, BE, etc."}
  ],
  "indexes": [
    {"columns": ["date_key", "pickup_hex_id"], "note": "Demand heatmap queries"},
    {"columns": ["driver_id", "request_ts"],   "note": "Driver performance queries"},
    {"columns": ["request_ts"],                "note": "Time-range scan"},
    {"columns": ["pickup_hex_id", "request_ts"], "note": "Spatial-temporal demand"}
  ]
}
```

---

### 6.3 Demand Forecast Input Table (H3 Hexagon × Hour)

```json
{
  "table": "forecast_demand_input",
  "description": "Grain: one row per H3 hexagon (resolution 8) per forecast hour. Input to B01 demand model.",
  "columns": [
    {"name": "forecast_input_id",         "type": "BIGINT",        "nullable": false, "pk": true},
    {"name": "forecast_hour",             "type": "TIMESTAMPTZ",   "nullable": false, "note": "Truncated to hour, UTC"},
    {"name": "hex_id",                    "type": "VARCHAR(20)",   "nullable": false},
    {"name": "city_code",                 "type": "VARCHAR(10)",   "nullable": false},
    {"name": "actual_trip_count",         "type": "INT",           "nullable": true,  "note": "Label; filled after hour passes"},
    {"name": "trip_count_lag_1h",         "type": "INT",           "nullable": true},
    {"name": "trip_count_lag_24h",        "type": "INT",           "nullable": true},
    {"name": "trip_count_lag_168h",       "type": "INT",           "nullable": true},
    {"name": "rolling_mean_7d_same_hour", "type": "DECIMAL(10,2)", "nullable": true},
    {"name": "rolling_std_7d_same_hour",  "type": "DECIMAL(10,2)", "nullable": true},
    {"name": "hour_of_day",               "type": "SMALLINT",      "nullable": false},
    {"name": "day_of_week",               "type": "SMALLINT",      "nullable": false, "note": "0=Monday"},
    {"name": "is_weekend",                "type": "BOOLEAN",       "nullable": false},
    {"name": "is_vn_holiday",             "type": "BOOLEAN",       "nullable": false},
    {"name": "is_tet_period",             "type": "BOOLEAN",       "nullable": false},
    {"name": "days_to_tet",               "type": "SMALLINT",      "nullable": true,  "note": "Negative = before Tet"},
    {"name": "is_payday",                 "type": "BOOLEAN",       "nullable": false, "note": "1st and 15th of month"},
    {"name": "rain_intensity",            "type": "VARCHAR(20)",   "nullable": true,
     "allowed_values": ["NONE", "LIGHT", "MODERATE", "HEAVY"]},
    {"name": "rainfall_mm_last_1h",       "type": "DECIMAL(6,2)",  "nullable": true},
    {"name": "temperature_c",             "type": "DECIMAL(5,2)",  "nullable": true},
    {"name": "concert_event_nearby",      "type": "BOOLEAN",       "nullable": false, "default": false},
    {"name": "football_match_nearby",     "type": "BOOLEAN",       "nullable": false, "default": false},
    {"name": "event_attendance_estimate", "type": "INT",           "nullable": true},
    {"name": "metro_disruption_flag",     "type": "BOOLEAN",       "nullable": false, "default": false},
    {"name": "zone_type",                 "type": "VARCHAR(30)",   "nullable": true},
    {"name": "avg_driver_count_lag_1h",   "type": "INT",           "nullable": true,  "note": "Supply side signal"},
    {"name": "surge_multiplier_lag_1h",   "type": "DECIMAL(4,2)", "nullable": true},
    {"name": "traffic_speed_pct_normal",  "type": "DECIMAL(5,2)",  "nullable": true,  "note": "Current speed / historical normal × 100"},
    {"name": "data_source_realtime",      "type": "BOOLEAN",       "nullable": false, "default": false,
     "note": "true = real-time traffic available; false = historical fallback"},
    {"name": "created_at",               "type": "TIMESTAMPTZ",   "nullable": false, "default": "NOW()"},
    {"name": "pipeline_run_id",          "type": "VARCHAR(36)",   "nullable": true}
  ],
  "unique_constraint": ["forecast_hour", "hex_id"],
  "indexes": [
    {"columns": ["forecast_hour", "city_code"]},
    {"columns": ["hex_id", "forecast_hour"]}
  ]
}
```

---

## Summary: Key Design Decisions (I13 vs. I06)

| Decision | I06 Choice | I13 Adaptation | Rationale |
|---|---|---|---|
| Spatial indexing | `lat`/`lon` + province_code | H3 hexagonal grid (resolution 8) | Demand aggregation requires equal-area spatial cells, not administrative boundaries |
| Sensor storage | Generic `iot_sensor_reading` (type + value) | Typed `vehicle_telemetry_event` with OBD-II columns | OBD-II has ~20 structured PIDs; typed schema enables direct feature engineering |
| DTC faults | Not applicable | Dedicated `vehicle_dtc_event` table + DTC lookup | Diagnostic codes require severity lookup and recurrence tracking |
| Transit data | Not applicable | GTFS static + GTFS-RT (Protobuf ingestion) | Public transit operates on schedule-based data standards |
| Video data | Not applicable | Edge CV inference → event-only storage (no raw frames) | PDPL 2025 compliance; raw video storage cost prohibitive at 1,837+ cameras |
| Matching state | PostgreSQL (batch dispatch) | Redis (in-memory) + async PostgreSQL log | Ride-hailing matching requires <500ms; relational DB cannot serve hot path |
| Geospatial routing | JSONB waypoints | PostGIS + pgrouting + OSM edge graph with speed profiles | Transportation routing needs turn-by-turn graph traversal with live speed weights |
| Map provider | Google Maps / OSM (geocoding) | Vietmap (primary) + HERE (traffic) + OSM/OSRM (self-hosted fallback) | Hẻm coverage and motorbike routing require Vietnam-specific map data |
| Analytics engine | Redshift | ClickHouse (added option) | Traffic aggregation (billions of events) benefits from ClickHouse vectorized engine |
| Streaming volume | ~500K events/hour (I06 fleet) | 7.2M events/hour (10K vehicles × 12/min) | 14× higher; requires 5× more Kafka partitions and Flink parallelism |

---

*Document: R-DE-notes.md | Module: I13 Transportation & Mobility | MAESTRO Knowledge Graph Platform*
*Reference: I06 R-DE-notes.md for base patterns (star schema, Kafka config, dbt, Airflow, data governance, PDPL compliance)*
