# Data Engineer Notes: Simulation & Digital Twin (B15)

## 1. Overview

Digital twin and simulation workloads demand robust data pipelines that bridge the physical world (sensors, PLCs, SCADA) with virtual models. The Data Engineer ensures that real-time and batch data flows are reliable, versioned, and optimized for both simulation input and output consumption.

## 2. IoT Sensor Data Ingestion

### Protocols
- **MQTT** — lightweight pub/sub for high-frequency sensor streams (vibration, temperature, pressure). Use Eclipse Mosquitto or EMQX as broker.
- **OPC-UA** — industrial standard for machine-to-machine communication. Use Prosys or open62541 for integration with PLCs and SCADA systems.
- **Kafka Connect** — bridge MQTT/OPC-UA into Apache Kafka topics for durable, replayable ingestion.
- **Edge gateways** — aggregate and pre-filter at the edge before cloud ingestion (AWS IoT Greengrass, Azure IoT Edge).

### Ingestion Architecture
```
Sensors → MQTT Broker → Kafka Connect → Kafka Topics → Stream Processing → Storage
PLC/SCADA → OPC-UA Server → OPC-UA Connector → Kafka Topics → ...
```

### Vietnamese Manufacturing Context
- Samsung factories in Bac Ninh/Thai Nguyen use proprietary protocols — require custom adapters.
- Local manufacturers often have legacy equipment with Modbus RTU — need protocol converters.
- Network reliability in industrial zones can be inconsistent — design for intermittent connectivity.

## 3. Time-Series Storage for Twin State

### Technology Options
| Solution | Best For | Compression | Query Speed |
|----------|----------|-------------|-------------|
| TimescaleDB | SQL-familiar teams, moderate scale | Good | Fast |
| InfluxDB | High-write IoT workloads | Excellent | Fast |
| Apache IoTDB | Industrial IoT, native time-series | Very Good | Fast |
| QuestDB | Ultra-low latency queries | Good | Fastest |
| ClickHouse | Analytical queries on sensor data | Excellent | Very Fast |

### Schema Design
- Partition by asset ID and time window (hourly/daily).
- Use hypertables (TimescaleDB) or shards (InfluxDB) for automatic partitioning.
- Store twin state snapshots at configurable intervals (1s, 10s, 1min).
- Retain raw data for 30-90 days, downsample to 1-min/5-min aggregates for long-term.

## 4. Simulation Input Data Preparation

- **Feature engineering pipelines** — compute rolling statistics, FFT features, lag variables from raw sensor data.
- **Data alignment** — synchronize multi-sensor streams with different sampling rates using interpolation.
- **Missing data handling** — forward-fill for slow-changing parameters, interpolation for continuous signals, flag gaps exceeding thresholds.
- **Normalization** — standardize inputs to simulation models (unit conversion, scaling).
- **Scenario packaging** — bundle initial conditions, boundary conditions, and parameters into versioned input packages (Parquet/HDF5).

## 5. Synthetic Data Output Pipelines

- Simulation runs produce large volumes of synthetic data — store in columnar formats (Parquet, Arrow).
- Tag synthetic data with simulation metadata (model version, parameters, run ID).
- Maintain lineage: which input data produced which synthetic output.
- Export pipelines for downstream ML training: synthetic data catalog with filtering by scenario type.

## 6. Data Versioning for Simulation Scenarios

- **DVC (Data Version Control)** — version large simulation datasets alongside code in Git.
- **LakeFS** — Git-like branching for data lakes; ideal for managing simulation scenario variants.
- **Delta Lake** — ACID transactions and time-travel on simulation data stored in object storage.
- Each simulation scenario = a versioned snapshot of inputs + parameters + outputs.
- Enable reproducibility: any historical simulation can be re-executed with exact same inputs.

## 7. Real-Time Data Integration (Sensor to Digital Twin)

- Stream processing with Apache Flink or Kafka Streams for sub-second sensor-to-twin updates.
- Materialized views of current twin state in Redis or Memcached for fast API reads.
- Change Data Capture (CDC) patterns for propagating twin state updates to downstream consumers.
- Backpressure handling when simulation processing lags behind sensor input rate.

## 8. Data Quality and Monitoring

- Anomaly detection on incoming sensor streams (statistical bounds, ML-based).
- Data freshness monitoring — alert if sensor data stops arriving.
- Schema validation for simulation inputs (Great Expectations, Pandera).
- Lineage tracking with Apache Atlas or OpenLineage.

## 9. Recommendations

1. Start with MQTT + Kafka + TimescaleDB as the foundational stack — mature, well-supported.
2. Implement DVC or LakeFS from day one; simulation reproducibility is non-negotiable.
3. Design for edge-first ingestion to handle Vietnamese factory network constraints.
4. Use Parquet as the standard exchange format between pipeline stages.
5. Build data quality gates before simulation input — garbage in, garbage out applies doubly to simulations.
6. Plan for 10-100x data growth as twin fidelity and sensor density increase.
