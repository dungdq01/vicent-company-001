# R-DE Notes — Industry Module I06: Logistics & Supply Chain
**Role:** R-DE (Data Engineer), MAESTRO Knowledge Graph Platform
**Date:** 2026-04-03
**Status:** Phase 0 — Baseline Knowledge Capture

---

## 1. Logistics Data Architecture

### 1.1 Core Data Entities

| Entity | Description | Primary Key | Key Attributes |
|---|---|---|---|
| **Shipment** | A single consignment moving from origin to destination | `shipment_id` | status, origin, destination, weight, volume, SLA deadline |
| **Vehicle** | Truck, motorbike, van, or container unit | `vehicle_id` | type, capacity_kg, capacity_cbm, license_plate, GPS device ID |
| **Route** | A planned or actual travel path for a vehicle | `route_id` | waypoints (JSON), distance_km, estimated_duration_min, date |
| **Warehouse** | A physical storage and fulfillment location | `warehouse_id` | name, lat, lon, province, capacity_sqm, zone_type |
| **Order** | A customer purchase that generates one or more shipments | `order_id` | customer_id, order_date, line_items (JSON), total_value |
| **Driver** | A human operator assigned to a vehicle | `driver_id` | name, license_class, assigned_vehicle_id, shift_start |
| **SKU** | A stock-keeping unit representing a product variant | `sku_id` | product_name, category, weight_kg, volume_cbm, storage_class |

---

### 1.2 Recommended Database Schema — Star Schema for Logistics Data Warehouse

The star schema separates transactional facts from slowly-changing dimensions. This is the recommended approach for analytics workloads (demand forecasting, KPI dashboards, SLA reporting).

```
                        dim_date
                           |
  dim_warehouse --- fact_shipment_event --- dim_vehicle
                           |
                        dim_route
                           |
                        dim_sku
                           |
                        dim_driver
```

#### fact_shipment_event (central fact table)

| Column | Type | Description |
|---|---|---|
| `event_id` | BIGINT PK | Surrogate key |
| `shipment_id` | VARCHAR(36) FK | References dim_shipment |
| `date_key` | INT FK | References dim_date (YYYYMMDD) |
| `vehicle_id` | VARCHAR(36) FK | References dim_vehicle |
| `warehouse_id` | VARCHAR(36) FK | Origin or destination warehouse |
| `route_id` | VARCHAR(36) FK | References dim_route |
| `driver_id` | VARCHAR(36) FK | References dim_driver |
| `sku_id` | VARCHAR(36) FK | References dim_sku |
| `event_type` | VARCHAR(50) | PICKUP, IN_TRANSIT, DELIVERED, FAILED, RETURNED |
| `event_ts` | TIMESTAMPTZ | Actual event timestamp (UTC) |
| `planned_delivery_ts` | TIMESTAMPTZ | SLA target timestamp |
| `quantity_units` | INT | Number of parcels/units |
| `weight_kg` | DECIMAL(10,3) | Actual shipment weight |
| `volume_cbm` | DECIMAL(10,4) | Actual shipment volume |
| `cod_amount_vnd` | BIGINT | Cash-on-delivery value (VND) |
| `is_sla_breach` | BOOLEAN | Derived: event_ts > planned_delivery_ts |
| `delay_minutes` | INT | Derived: difference in minutes |

#### dim_date

Standard date dimension with fiscal week, Vietnamese public holidays flag, Tet period flag, and day-of-week features.

| Column | Type |
|---|---|
| `date_key` | INT PK |
| `full_date` | DATE |
| `day_of_week` | SMALLINT |
| `week_of_year` | SMALLINT |
| `month` | SMALLINT |
| `quarter` | SMALLINT |
| `year` | SMALLINT |
| `is_vn_holiday` | BOOLEAN |
| `is_tet_period` | BOOLEAN |
| `is_weekend` | BOOLEAN |
| `lunar_month` | SMALLINT |
| `lunar_day` | SMALLINT |

---

### 1.3 Time-Series Data Storage — GPS Tracking & IoT Sensors

GPS and sensor data is high-frequency (1–30 second intervals per vehicle) and must be stored separately from the relational warehouse.

**Recommended storage:** TimescaleDB (PostgreSQL extension) or InfluxDB for on-premise; AWS Timestream or GCP BigQuery partitioned tables for cloud.

#### gps_ping table (TimescaleDB hypertable, partitioned by hour)

| Column | Type | Description |
|---|---|---|
| `ts` | TIMESTAMPTZ PK | Timestamp of GPS reading (UTC) |
| `vehicle_id` | VARCHAR(36) | FK to dim_vehicle |
| `lat` | DECIMAL(9,6) | Latitude |
| `lon` | DECIMAL(9,6) | Longitude |
| `speed_kmh` | DECIMAL(5,2) | Speed in km/h |
| `heading_deg` | SMALLINT | Compass heading 0–360 |
| `accuracy_m` | DECIMAL(6,2) | GPS accuracy in meters |
| `engine_on` | BOOLEAN | Engine status |
| `source` | VARCHAR(20) | Device type: TELEMATICS, MOBILE_APP |

**Retention policy:** Raw GPS pings retained 90 days; 5-minute aggregates retained 2 years; daily summaries retained indefinitely.

#### iot_sensor_reading table

| Column | Type | Description |
|---|---|---|
| `ts` | TIMESTAMPTZ PK | Reading timestamp |
| `device_id` | VARCHAR(36) | Sensor device ID |
| `vehicle_id` | VARCHAR(36) | FK |
| `sensor_type` | VARCHAR(30) | TEMPERATURE, HUMIDITY, DOOR_STATUS, SHOCK |
| `value` | DECIMAL(10,4) | Numeric reading |
| `unit` | VARCHAR(10) | degC, %, boolean, G-force |
| `alert_triggered` | BOOLEAN | Threshold breach flag |

---

### 1.4 Document Store — Unstructured Data

Waybills, proof-of-delivery photos, invoices, and customs documents require a document/object store alongside the relational system.

**Recommended:** MongoDB Atlas or AWS S3 + metadata catalog (AWS Glue / Apache Atlas)

#### MongoDB document structure — waybill_document

```json
{
  "_id": "wb_20260403_0012345",
  "shipment_id": "SHP-2026-789456",
  "document_type": "WAYBILL",
  "created_at": "2026-04-03T08:30:00Z",
  "scanned_at": "2026-04-03T09:15:22Z",
  "file_ref": "s3://maestro-logistics-docs/waybills/2026/04/03/wb_0012345.pdf",
  "ocr_extracted": {
    "sender_name": "Công ty ABC",
    "sender_address": "123 Nguyễn Huệ, Q1, TP.HCM",
    "receiver_name": "Nguyễn Văn B",
    "receiver_address": "45 Trần Phú, Đà Nẵng",
    "declared_weight_kg": 2.5,
    "cod_amount": 350000,
    "service_type": "EXPRESS"
  },
  "ocr_confidence": 0.91,
  "manual_verified": false,
  "tags": ["fragile", "cod"]
}
```

---

## 2. Data Pipeline Design

### 2.1 ETL/ELT Pipeline Architecture

```
[Sources]          [Ingestion]         [Processing]         [Serving]
TMS API      ---->  Kafka               Spark Structured     Data Warehouse
WMS API      ---->  (real-time)  ---->  Streaming        --> (Redshift/BigQuery)
ERP API      ---->                      dbt (batch)          Feature Store
GPS Devices  ---->  Kafka                                     ML Platform
Mobile Apps  ---->  (GPS topic)
Waybill Scan ---->  S3 Raw              OCR Pipeline
Manual CSV   ---->  S3 Landing          Pandas/Polars
```

**Pattern:** ELT preferred over ETL. Land raw data first (S3 or GCS), transform inside the warehouse using dbt. This preserves raw data for reprocessing and audit.

### 2.2 Real-Time Streaming — Kafka Topics

| Topic Name | Producer | Consumer | Retention | Message Format |
|---|---|---|---|---|
| `logistics.gps.raw` | Telematics devices, mobile apps | GPS aggregator, anomaly detector (B07) | 24 hours | Avro |
| `logistics.shipment.status` | TMS, driver app | Warehouse, customer notification service | 7 days | JSON |
| `logistics.order.created` | E-commerce platform, ERP | WMS, demand forecasting input | 7 days | Avro |
| `logistics.iot.sensor` | Cold-chain sensors | Alert engine, time-series DB writer | 48 hours | Avro |
| `logistics.sla.breach` | SLA monitoring service | Ops dashboard, B07 anomaly pipeline | 30 days | JSON |

**Kafka configuration notes:**
- Partition key for `logistics.gps.raw`: `vehicle_id` (ensures ordering per vehicle)
- Partition key for `logistics.shipment.status`: `shipment_id`
- Replication factor: 3 for production
- Schema Registry (Confluent or Apicurio) mandatory for Avro topics

### 2.3 Batch Processing

| Job | Schedule | Tool | Input | Output |
|---|---|---|---|---|
| Daily shipment aggregation | 01:00 UTC | dbt + Airflow | fact_shipment_event | daily_shipment_summary |
| Weekly demand forecast input | Sunday 02:00 | Spark + Airflow | order history, SKU catalog | forecast_input_features |
| GPS dwell time calculation | Every 6 hours | Spark Structured Streaming | gps_ping (windowed) | vehicle_dwell_events |
| SLA compliance report | 06:00 UTC daily | dbt | fact_shipment_event + dim_date | sla_compliance_daily |
| Route efficiency batch | 03:00 UTC daily | Python + GeoPandas | GPS pings + planned routes | route_deviation_report |

### 2.4 Data Quality Checks

Applied at ingestion and post-transformation layers using Great Expectations or dbt tests.

| Check | Dimension | Target | Alert Threshold |
|---|---|---|---|
| Shipment has valid origin & destination | Completeness | fact_shipment_event | >0.5% null |
| GPS pings arrive within 60s of device timestamp | Freshness | gps_ping | Lag >5 min for >10% of vehicles |
| SLA deadline is always after order creation date | Consistency | fact_shipment_event | Any violation |
| Weight > 0 and < 30,000 kg | Validity | fact_shipment_event | >0.1% out of range |
| No duplicate shipment_id per day | Uniqueness | fact_shipment_event | Any duplicate |
| COD amount non-negative | Validity | fact_shipment_event | Any negative |
| Address geocoding success rate | Completeness | dim_route | <95% success triggers alert |

---

## 3. Feature Engineering for Logistics ML

### 3.1 Demand Forecasting Features (B01)

| Feature Group | Features | Engineering Notes |
|---|---|---|
| **Date features** | day_of_week, week_of_month, month, quarter, day_of_year | One-hot or cyclical encoding (sin/cos) |
| **Calendar events** | is_vn_holiday, is_tet_period, days_to_tet, is_payday (1st, 15th) | VN-specific: Tet window = T-14 to T+3 |
| **Lag features** | demand_lag_7d, demand_lag_14d, demand_lag_28d, demand_lag_365d | Align on same day-of-week |
| **Rolling statistics** | rolling_mean_7d, rolling_std_7d, rolling_mean_28d | Capture trend and volatility |
| **Customer segmentation** | customer_tier (A/B/C), region_code, channel (B2C/B2B) | Segment-specific models often outperform global |
| **SKU features** | category_encoded, weight_class, storage_class | Handle perishables vs. standard |
| **Promotional** | is_promotion_period, discount_pct | Requires marketing calendar integration |
| **External** | rainfall_mm, temperature_avg (province-level), fuel_price_vnd | Weather API + Ministry of Finance data |

**Target variable:** `order_quantity_units` or `shipment_volume_kg` at SKU × warehouse × day granularity.

### 3.2 Route Optimization Features (B06)

| Feature Group | Features | Engineering Notes |
|---|---|---|
| **Traffic patterns** | avg_speed_by_hour_segment, congestion_index, historical_travel_time_p50 | Aggregate from GPS pings over 90 days |
| **Vehicle capacity** | remaining_capacity_kg, remaining_capacity_cbm, vehicle_type | Real-time from WMS load manifest |
| **Time windows** | delivery_window_start, delivery_window_end, window_width_min | Customer SLA constraints |
| **Historical delivery** | median_delivery_time_by_zone, on_time_rate_by_zone | Rolling 30-day by district/ward |
| **Stop sequence** | num_stops, avg_interStop_distance_km, cluster_id | Cluster stops by proximity (DBSCAN) |
| **Driver profile** | driver_avg_speed, driver_on_time_rate, driver_experience_days | Personalize routing per driver |
| **Road network** | road_type (highway/national/urban), toll_cost_vnd | OpenStreetMap or HERE Maps enrichment |

### 3.3 Anomaly Detection Features (B07)

| Feature Group | Features | Engineering Notes |
|---|---|---|
| **SLA deviation** | sla_breach_flag, delay_minutes, delay_ratio (actual/planned) | Derived from fact_shipment_event |
| **Route deviation** | off_route_distance_km, off_route_duration_min, deviation_ratio | Compare GPS trace to planned route polyline |
| **Dwell time** | dwell_time_at_stop_min, expected_dwell_time_min, dwell_anomaly_score | Detect unusually long stops (theft risk, breakdown) |
| **Speed anomaly** | speed_z_score_by_segment, sudden_stop_count, harsh_brake_count | Computed from GPS ping stream |
| **Sequence anomaly** | out_of_sequence_delivery, skipped_stop_flag | Compare actual stop sequence to planned |
| **Temporal anomaly** | delivery_at_unusual_hour, midnight_movement_flag | Flag activity outside expected shift hours |

---

## 4. Data Challenges in Vietnam Logistics

### 4.1 Address Normalization

Vietnam does not have a fully standardized postal code system. Many rural and suburban addresses are informal ("next to the old market," unnamed alleys).

**Challenges:**
- Administrative unit names change frequently (province mergers: e.g., 2025 consolidations)
- Multiple valid spellings: "TPHCM", "TP. HCM", "Ho Chi Minh City", "Thành phố Hồ Chí Minh"
- Ward/commune names repeat across provinces
- No authoritative geocoding API for all addresses

**Recommended solutions:**

| Approach | Implementation |
|---|---|
| Hierarchical normalization | Province → District → Ward → Street as separate fields, not free text |
| VN administrative code | Map to `province_code` (2-digit), `district_code` (3-digit), `ward_code` (5-digit) from VNDIVISION dataset |
| Fuzzy matching | Use rapidfuzz or phonetic algorithms adapted for Vietnamese diacritics |
| Geocoding fallback chain | Google Maps API → HERE Maps → OpenStreetMap Nominatim → manual centroid |
| Coordinate storage | Always store `lat`, `lon` after geocoding; treat text address as display-only |

### 4.2 Multi-System Fragmentation

Vietnam 3PLs typically operate with separate, often unintegrated systems:

| System | Typical Software in VN | Integration Challenge |
|---|---|---|
| TMS (Transport) | FAST, custom-built | No standard API; often CSV exports |
| WMS (Warehouse) | Acumatica, SAP B1, custom | Different field naming conventions |
| ERP | MISA, SAP, Odoo | Separate order and financial data |
| Driver App | Ahamove, custom | Real-time but limited historical export |
| Customer Portal | Proprietary | Manual status update common |

**Recommendation:** Implement a Logistics Data Hub (operational data store) that acts as the single integration layer. Use Apache Kafka Connect with custom connectors for each source system. Define a canonical data model (CDM) and map all source schemas to CDM on ingestion.

### 4.3 Data Governance Recommendations

| Area | Recommendation |
|---|---|
| Data ownership | Assign data stewards per domain (shipment, warehouse, driver) |
| PII handling | Driver phone numbers, customer addresses are PII; encrypt at rest, mask in non-prod |
| Data lineage | Use Apache Atlas or OpenMetadata to track field-level lineage |
| Retention policy | GPS raw: 90 days; shipment events: 7 years (tax compliance); customer PII: per PDPD 2023 |
| Access control | Role-based access: ops analysts see aggregates; data scientists see masked data; engineers see raw |
| Vietnam PDPD compliance | Personal Data Protection Decree 13/2023/ND-CP requires consent tracking and breach notification within 72 hours |

---

## 5. Recommended Data Stack for Vietnam 3PL

### 5.1 Cloud-Native Option

**Recommended: AWS (most common in VN market)**

| Layer | Service | Notes |
|---|---|---|
| Ingestion | Amazon Kinesis Data Streams or MSK (Managed Kafka) | MSK preferred for large fleets |
| Storage (raw) | Amazon S3 (data lake) | Parquet format, partitioned by date/entity |
| Transformation | AWS Glue (Spark) + dbt Cloud | Glue for heavy ETL; dbt for SQL transformations |
| Warehouse | Amazon Redshift Serverless | Auto-scaling for variable analytics load |
| Time-series | Amazon Timestream | GPS and IoT sensor data |
| Document store | Amazon DocumentDB | Waybill metadata |
| Object store | Amazon S3 | Waybill PDFs and images |
| Orchestration | Amazon MWAA (Airflow) | Managed Airflow |
| BI | Amazon QuickSight or Metabase | Dashboard for ops team |
| Feature store | AWS SageMaker Feature Store | ML features for B01, B06, B07 |

**Estimated monthly cost for mid-size 3PL (500 vehicles, 20K shipments/day):** ~$3,000–6,000 USD

**GCP alternative:** BigQuery (warehouse) + Pub/Sub (streaming) + Dataflow (processing) + Vertex AI Feature Store — strong if using Google Maps API for geocoding.

### 5.2 On-Premise Option

For companies with data sovereignty concerns or government contracts.

| Layer | Technology | Notes |
|---|---|---|
| Ingestion | Apache Kafka (self-hosted) | 3-node cluster minimum |
| Storage (raw) | MinIO (S3-compatible) | On-prem object storage |
| Transformation | Apache Spark + dbt Core | Spark on YARN or Kubernetes |
| Warehouse | PostgreSQL + Citus (distributed) or ClickHouse | ClickHouse excellent for analytics |
| Time-series | TimescaleDB | PostgreSQL extension |
| Document store | MongoDB Community | Waybill metadata |
| Orchestration | Apache Airflow (self-hosted) | Kubernetes deployment |
| BI | Apache Superset | Open-source dashboards |

**Hardware guidance:** Minimum 3 data nodes (32 cores, 128GB RAM, 10TB NVMe each) + 1 orchestration node for production workloads.

### 5.3 Open-Source / Cost-Sensitive SME Option

For small 3PLs or startups with limited budget.

| Layer | Technology | Why |
|---|---|---|
| Ingestion | Redpanda (Kafka-compatible, lighter) | Lower ops overhead than Kafka |
| Storage | DuckDB + Parquet files on local disk | Surprisingly powerful for <10M rows/day |
| Transformation | dbt Core + DuckDB adapter | SQL-based, minimal infra |
| Warehouse | DuckDB or PostgreSQL | Single-node handles most SME loads |
| Time-series | TimescaleDB (free tier) | PostgreSQL-based |
| Orchestration | Prefect Cloud (free tier) or Dagster | Low-code pipeline orchestration |
| BI | Metabase Community | Simple dashboards, Vietnamese UI |

**Total infrastructure cost:** ~$200–500 USD/month on a small VPS or colocation server.

---

## 6. Sample Data Models

### 6.1 Shipment Event Table Schema

```json
{
  "table": "fact_shipment_event",
  "description": "Grain: one row per shipment status change event",
  "columns": [
    {"name": "event_id",            "type": "BIGINT",         "nullable": false, "pk": true},
    {"name": "shipment_id",         "type": "VARCHAR(36)",    "nullable": false},
    {"name": "date_key",            "type": "INT",            "nullable": false},
    {"name": "event_type",          "type": "VARCHAR(50)",    "nullable": false,
     "allowed_values": ["ORDER_CREATED","PICKUP_SCHEDULED","PICKED_UP","IN_TRANSIT",
                        "AT_HUB","OUT_FOR_DELIVERY","DELIVERED","FAILED_DELIVERY","RETURNED","CANCELLED"]},
    {"name": "event_ts",            "type": "TIMESTAMPTZ",    "nullable": false},
    {"name": "planned_delivery_ts", "type": "TIMESTAMPTZ",    "nullable": true},
    {"name": "vehicle_id",          "type": "VARCHAR(36)",    "nullable": true},
    {"name": "driver_id",           "type": "VARCHAR(36)",    "nullable": true},
    {"name": "warehouse_id",        "type": "VARCHAR(36)",    "nullable": true},
    {"name": "route_id",            "type": "VARCHAR(36)",    "nullable": true},
    {"name": "origin_province_code","type": "CHAR(2)",        "nullable": false},
    {"name": "dest_province_code",  "type": "CHAR(2)",        "nullable": false},
    {"name": "dest_ward_code",      "type": "CHAR(5)",        "nullable": true},
    {"name": "weight_kg",           "type": "DECIMAL(10,3)",  "nullable": true},
    {"name": "volume_cbm",          "type": "DECIMAL(10,4)",  "nullable": true},
    {"name": "cod_amount_vnd",      "type": "BIGINT",         "nullable": true},
    {"name": "service_type",        "type": "VARCHAR(30)",    "nullable": false,
     "allowed_values": ["STANDARD","EXPRESS","SAME_DAY","COLD_CHAIN","OVERSIZE"]},
    {"name": "is_sla_breach",       "type": "BOOLEAN",        "nullable": false, "default": false},
    {"name": "delay_minutes",       "type": "INT",            "nullable": true},
    {"name": "failure_reason_code", "type": "VARCHAR(20)",    "nullable": true},
    {"name": "created_at",          "type": "TIMESTAMPTZ",    "nullable": false, "default": "NOW()"},
    {"name": "source_system",       "type": "VARCHAR(30)",    "nullable": false}
  ],
  "indexes": [
    {"columns": ["shipment_id", "event_ts"]},
    {"columns": ["date_key"]},
    {"columns": ["vehicle_id", "event_ts"]},
    {"columns": ["dest_province_code", "date_key"]}
  ]
}
```

---

### 6.2 Route Table Schema

| Column | Type | Nullable | Description |
|---|---|---|---|
| `route_id` | VARCHAR(36) | NO | UUID, primary key |
| `route_date` | DATE | NO | Operational date |
| `vehicle_id` | VARCHAR(36) | NO | Assigned vehicle |
| `driver_id` | VARCHAR(36) | NO | Assigned driver |
| `origin_warehouse_id` | VARCHAR(36) | NO | Departure depot |
| `planned_stops` | JSONB | NO | Array of stop objects with sequence, address, lat, lon, time_window |
| `actual_stops` | JSONB | YES | Recorded after route completion |
| `total_planned_distance_km` | DECIMAL(8,2) | YES | Sum of planned segment distances |
| `total_actual_distance_km` | DECIMAL(8,2) | YES | From GPS trace |
| `planned_start_ts` | TIMESTAMPTZ | YES | Scheduled departure |
| `actual_start_ts` | TIMESTAMPTZ | YES | Recorded departure |
| `planned_end_ts` | TIMESTAMPTZ | YES | Scheduled return |
| `actual_end_ts` | TIMESTAMPTZ | YES | Recorded return |
| `num_planned_shipments` | SMALLINT | NO | Load count at departure |
| `num_delivered` | SMALLINT | YES | Successful deliveries |
| `num_failed` | SMALLINT | YES | Failed delivery attempts |
| `route_efficiency_score` | DECIMAL(5,4) | YES | planned_distance / actual_distance |
| `deviation_km` | DECIMAL(8,2) | YES | Total off-route distance |
| `status` | VARCHAR(20) | NO | PLANNED, IN_PROGRESS, COMPLETED, CANCELLED |
| `created_at` | TIMESTAMPTZ | NO | Record creation time |

**`planned_stops` JSONB example:**
```json
[
  {
    "sequence": 1,
    "shipment_id": "SHP-2026-001",
    "address": "45 Lê Lợi, Q1, TP.HCM",
    "lat": 10.7769,
    "lon": 106.7009,
    "time_window_start": "09:00",
    "time_window_end": "12:00",
    "estimated_arrival": "09:35",
    "service_time_min": 5
  }
]
```

---

### 6.3 Demand Forecast Input Table Schema

| Column | Type | Nullable | Description |
|---|---|---|---|
| `forecast_input_id` | BIGINT | NO | Surrogate PK |
| `forecast_date` | DATE | NO | Date being forecasted |
| `sku_id` | VARCHAR(36) | NO | SKU identifier |
| `warehouse_id` | VARCHAR(36) | NO | Fulfillment warehouse |
| `province_code` | CHAR(2) | NO | Delivery destination province |
| `channel` | VARCHAR(20) | NO | B2C, B2B, MARKETPLACE |
| `actual_demand_units` | INT | YES | Filled in after date passes (training label) |
| `demand_lag_7d` | INT | YES | Demand 7 days prior |
| `demand_lag_14d` | INT | YES | Demand 14 days prior |
| `demand_lag_28d` | INT | YES | Demand 28 days prior |
| `demand_lag_365d` | INT | YES | Demand same day last year |
| `rolling_mean_7d` | DECIMAL(10,2) | YES | 7-day rolling average |
| `rolling_std_7d` | DECIMAL(10,2) | YES | 7-day rolling std dev |
| `rolling_mean_28d` | DECIMAL(10,2) | YES | 28-day rolling average |
| `day_of_week` | SMALLINT | NO | 0=Monday, 6=Sunday |
| `day_of_month` | SMALLINT | NO | 1–31 |
| `week_of_year` | SMALLINT | NO | ISO week number |
| `month` | SMALLINT | NO | 1–12 |
| `is_vn_holiday` | BOOLEAN | NO | National holiday flag |
| `is_tet_period` | BOOLEAN | NO | Tet festival window flag |
| `days_to_nearest_holiday` | SMALLINT | YES | Proximity to holiday |
| `is_payday_week` | BOOLEAN | NO | 1st and 15th of month week |
| `is_promotion` | BOOLEAN | NO | Active promotion flag |
| `discount_pct` | DECIMAL(5,2) | YES | Promotion discount percentage |
| `avg_temperature_c` | DECIMAL(5,2) | YES | Province daily avg temp (weather API) |
| `rainfall_mm` | DECIMAL(6,2) | YES | Province daily rainfall |
| `fuel_price_vnd_liter` | DECIMAL(10,0) | YES | National fuel price |
| `customer_tier` | VARCHAR(10) | YES | A, B, C segmentation |
| `created_at` | TIMESTAMPTZ | NO | Pipeline run timestamp |
| `pipeline_run_id` | VARCHAR(36) | YES | Airflow DAG run ID for lineage |

---

## Summary: Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Warehouse schema | Star schema | Best for analytics queries; allows fast aggregation across dimensions |
| GPS storage | TimescaleDB / Timestream | Native time-series partitioning, automatic compression |
| Streaming backbone | Apache Kafka | De facto standard; handles GPS ping volume; integrates with Spark |
| Batch orchestration | Apache Airflow | Best ecosystem for complex DAG dependencies |
| Transformation layer | dbt | SQL-based, version-controlled, testable transformations |
| Address normalization | Ward code + lat/lon | Handles VN address inconsistencies; coordinate is ground truth |
| Data format | Avro (streaming) + Parquet (batch) | Schema evolution support; columnar compression |
| ML feature storage | Feature store (SageMaker / Feast) | Prevents training-serving skew; reusable across B01, B06, B07 |

---

*Document: R-DE-notes.md | Module: I06 Logistics & Supply Chain | MAESTRO Knowledge Graph Platform*
