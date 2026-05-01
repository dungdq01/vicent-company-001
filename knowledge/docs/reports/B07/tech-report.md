# Technical Report: Anomaly Detection & Monitoring (B07)
## By Dr. Praxis (R-β) — Date: 2026-03-31

---

## 1. Architecture Overview

Anomaly detection systems fall into three architectural patterns depending on latency requirements and data volume:

### 1.1 Reference Architecture — Hybrid (Recommended)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                                      │
│  [Sensors] [Logs] [Transactions] [Metrics] [Events] [APIs]          │
└──────────┬───────────────────────────────────────────────────────────┘
           │
    ┌──────▼──────┐         ┌──────────────┐
    │  Kafka /    │────────►│  Flink / Spark│──► Real-time Scoring
    │  Event Hub  │         │  Streaming    │       │
    └──────┬──────┘         └──────────────┘       │
           │                                        ▼
    ┌──────▼──────┐                          ┌─────────────┐
    │  Data Lake  │                          │  Alert       │
    │  (S3/GCS/   │                          │  Manager     │
    │   MinIO)    │                          │  (PagerDuty) │
    └──────┬──────┘                          └─────────────┘
           │                                        ▲
    ┌──────▼──────┐         ┌──────────────┐       │
    │  Feature    │────────►│  Batch        │──► Batch Scoring
    │  Store      │         │  Training     │
    │  (Feast)    │         │  (MLflow)     │
    └─────────────┘         └──────────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │  MONITORING LAYER                                            │
    │  Prometheus → Grafana → Alertmanager → Slack/PagerDuty      │
    │  Model Performance Dashboard │ Data Drift Dashboard          │
    └──────────────────────────────────────────────────────────────┘
```

### 1.2 Pattern Comparison

| Pattern | Latency | Throughput | Complexity | Best For |
|---------|---------|------------|------------|----------|
| **Batch** | Minutes–Hours | Very High | Low | Historical analysis, reporting, model retraining |
| **Streaming** | Milliseconds–Seconds | High | High | Fraud detection, sensor monitoring, security |
| **Hybrid** | Both | Both | Medium-High | Most production systems — batch train, stream infer |

---

## 2. Tech Stack Recommendation

### 2.1 Data Ingestion Layer

| Tool | Category | Description | Use Case | Alternatives | Link |
|------|----------|-------------|----------|--------------|------|
| **Apache Kafka** | Message Broker | Distributed event streaming platform | Real-time data ingestion from multiple sources | RabbitMQ, Amazon Kinesis, Azure Event Hubs | https://kafka.apache.org |
| **Apache Flink** | Stream Processing | Stateful computations over data streams | Real-time feature engineering & windowed aggregations | Spark Structured Streaming, Kafka Streams, Apache Beam | https://flink.apache.org |
| **Debezium** | CDC | Change data capture for databases | Capture database changes as events for anomaly detection | Maxwell, AWS DMS | https://debezium.io |

### 2.2 Feature Engineering Layer

| Tool | Category | Description | Use Case | Alternatives | Link |
|------|----------|-------------|----------|--------------|------|
| **Feast** | Feature Store | Open-source feature store for ML | Shared feature definitions, point-in-time joins, online/offline serving | Tecton, Hopsworks, Vertex AI Feature Store | https://feast.dev |
| **tsfresh** | Library | Automatic time-series feature extraction | Extract 700+ statistical features from time series | Featuretools, tsfel, Catch22 | https://tsfresh.readthedocs.io |
| **pandas + numpy** | Library | Data manipulation | Batch feature engineering | Polars, Dask | https://pandas.pydata.org |

### 2.3 Model Training Layer

| Tool | Category | Description | Use Case | Alternatives | Link |
|------|----------|-------------|----------|--------------|------|
| **PyOD** | Library | Python Outlier Detection — 40+ algorithms | Unified API for anomaly detection models | Alibi Detect, scikit-learn | https://pyod.readthedocs.io |
| **Alibi Detect** | Library | Algorithms for outlier, adversarial, drift detection | Production-grade detection with drift monitoring | PyOD, River | https://docs.seldon.io/projects/alibi-detect |
| **PyTorch** | Framework | Deep learning framework | Autoencoder, VAE, Transformer-based models | TensorFlow, JAX | https://pytorch.org |
| **MLflow** | Platform | ML lifecycle management | Experiment tracking, model registry, deployment | Weights & Biases, Neptune, ClearML | https://mlflow.org |
| **River** | Library | Online/streaming ML | Incremental learning for streaming anomaly detection | scikit-multiflow | https://riverml.xyz |

### 2.4 Model Serving Layer

| Tool | Category | Description | Use Case | Alternatives | Link |
|------|----------|-------------|----------|--------------|------|
| **Triton Inference Server** | Serving | High-performance model serving | GPU-accelerated batch + real-time inference | TorchServe, TF Serving, BentoML | https://developer.nvidia.com/triton-inference-server |
| **BentoML** | Serving | ML model serving framework | Package models as APIs with batching | Seldon Core, KServe, Ray Serve | https://bentoml.com |
| **Redis** | Cache | In-memory data store | Cache anomaly scores, feature values, recent predictions | Memcached, DragonflyDB | https://redis.io |

### 2.5 Monitoring & Alerting Layer

| Tool | Category | Description | Use Case | Alternatives | Link |
|------|----------|-------------|----------|--------------|------|
| **Prometheus** | Monitoring | Time-series metrics database | Collect model performance metrics, system health | InfluxDB, VictoriaMetrics | https://prometheus.io |
| **Grafana** | Visualization | Dashboards & alerting | Anomaly detection dashboards, threshold visualization | Kibana, Datadog | https://grafana.com |
| **PagerDuty** | Alerting | Incident management | Route anomaly alerts to on-call teams | OpsGenie, VictorOps | https://pagerduty.com |
| **ELK Stack** | Log Analysis | Elasticsearch + Logstash + Kibana | Log anomaly analysis, searchable alert history | Loki + Grafana, Splunk | https://elastic.co |

---

## 3. Pipeline Design

### 3.1 Main Pipeline

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Ingest  │───►│ Feature  │───►│  Model   │───►│  Score   │───►│ Threshold│───►│  Alert   │
│  & CDC   │    │  Engine  │    │  Train   │    │  & Infer │    │  & Route │    │  & Act   │
└─────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │              │               │               │               │               │
     ▼              ▼               ▼               ▼               ▼               ▼
  Raw Data    Feature Store    Model Registry   Score Store    Alert Rules     Dashboards
  (Lake)      (Feast)         (MLflow)         (Redis+PG)    (Config)        (Grafana)
```

### 3.2 Stage Details

#### Stage 1: Data Collection & Ingestion
- **Inputs:** Raw sensor data, transaction logs, system metrics, API events
- **Outputs:** Cleaned, timestamped event stream + batch data lake
- **Tools:** Kafka, Debezium, Flink (initial ETL)
- **Key decisions:** Schema registry (Avro/Protobuf), partitioning strategy, retention policy

#### Stage 2: Feature Engineering
- **Inputs:** Raw events from Stage 1
- **Outputs:** Feature vectors (online: real-time, offline: historical)
- **Tools:** Feast, tsfresh, Flink (streaming features)
- **Key patterns:**
  - Rolling statistics (mean, std, min, max over windows)
  - Rate-of-change features
  - Categorical encoding (entity embeddings for high-cardinality)
  - Lag features for temporal context

#### Stage 3: Model Training (Offline)
- **Inputs:** Historical feature vectors + optional labels
- **Outputs:** Trained model artifacts in MLflow registry
- **Tools:** PyOD, PyTorch, scikit-learn, MLflow
- **Training strategies:**
  - Unsupervised: Train on "normal" data only (Isolation Forest, Autoencoder)
  - Semi-supervised: Use small labeled set for threshold calibration
  - Retrain frequency: Weekly (stable domains) to daily (high-drift domains)

#### Stage 4: Inference & Scoring
- **Inputs:** New feature vectors (real-time or batch)
- **Outputs:** Anomaly score (0.0–1.0) + binary label + confidence
- **Tools:** Triton/BentoML (serving), Redis (caching)
- **Latency targets:** <50ms (fraud), <500ms (sensors), <5min (batch)

#### Stage 5: Threshold Management & Alerting
- **Inputs:** Anomaly scores from Stage 4
- **Outputs:** Alerts routed to appropriate channels
- **Tools:** Custom threshold engine, Alertmanager, PagerDuty
- **Threshold strategies:**
  - Static: Fixed percentile (e.g., score > 0.95)
  - Dynamic: Adaptive based on recent score distribution
  - Multi-level: Warning (0.85) → Critical (0.95) → Emergency (0.99)

#### Stage 6: Feedback Loop
- **Inputs:** Human feedback (true positive / false positive labels)
- **Outputs:** Updated training data, recalibrated thresholds
- **Tools:** Label studio, custom feedback API, MLflow
- **Critical:** Without feedback loop, model degrades within weeks

### 3.3 Streaming Sub-Pipeline

```
Kafka Topic ──► Flink CEP ──► Feature Calc ──► Model Score ──► Redis ──► Alert
    │               │              │                │              │
    │          Pattern Match   Rolling Stats    Anomaly Score   Cache TTL
    │          (rule-based)    (30s/5m/1h)      (0.0 - 1.0)    (5 min)
    │               │              │                │
    └───── Dead Letter Queue ◄─── Error Handler ◄──┘
```

---

## 4. Mini Examples

### 4.1 Quick Start: Detect Credit Card Fraud with Isolation Forest

**Type:** quick_start | **Difficulty:** beginner | **Estimated Time:** 30 minutes

#### Problem Statement
Detect fraudulent credit card transactions using unsupervised anomaly detection. Given a dataset of transactions with amount, time, and anonymized features, identify the ~0.17% that are fraudulent — without using labels during training.

#### Sample Data

**Format:** CSV
**Schema:** `Time (float), V1-V28 (float, PCA-transformed), Amount (float), Class (int, 0=normal, 1=fraud)`

```csv
Time,V1,V2,V3,V4,V5,...,V28,Amount,Class
0.0,-1.36,-0.07,2.54,1.38,-0.34,...,0.02,149.62,0
0.0,1.19,0.27,0.17,0.45,0.06,...,0.01,2.69,0
1.0,-1.36,-1.34,1.77,0.38,-0.50,...,0.01,378.66,0
1.0,-0.97,-0.19,1.79,-0.86,-0.01,...,0.00,123.50,0
2.0,-1.16,0.88,1.55,0.40,-0.41,...,0.00,69.99,0
2.0,-0.43,0.96,1.14,-0.17,0.42,...,-0.02,3.67,0
4.0,1.23,0.14,0.23,0.38,-0.01,...,-0.06,4.99,0
7.0,-0.64,1.42,1.07,-0.49,0.95,...,0.06,40.80,0
7.0,1.15,0.33,-0.12,0.36,-0.02,...,-0.05,93.20,0
9.0,0.67,-2.38,0.22,0.27,-0.30,...,-0.01,3.68,1
```
**Source:** Kaggle Credit Card Fraud Detection (ULB, public dataset)

#### Solution Walkthrough

**Step 1: Install dependencies**
```python
pip install pyod scikit-learn pandas matplotlib
```

**Step 2: Load and explore data**
```python
import pandas as pd
from pyod.models.iforest import IForest
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import StandardScaler

df = pd.read_csv('creditcard.csv')
print(f"Shape: {df.shape}")
print(f"Fraud ratio: {df['Class'].mean():.4f}")
# Output: Shape: (284807, 31), Fraud ratio: 0.0017
```

**Step 3: Prepare features**
```python
X = df.drop(['Class', 'Time'], axis=1)
y = df['Class']

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

**Step 4: Train Isolation Forest**
```python
clf = IForest(
    n_estimators=200,
    max_samples=0.8,
    contamination=0.002,  # estimated fraud rate
    random_state=42,
    n_jobs=-1
)
clf.fit(X_scaled)
```

**Step 5: Score and evaluate**
```python
scores = clf.decision_function(X_scaled)  # anomaly scores
preds = clf.predict(X_scaled)  # 0=normal, 1=anomaly

print(classification_report(y, preds, target_names=['Normal', 'Fraud']))
print(f"ROC-AUC: {roc_auc_score(y, scores):.4f}")
```

**Step 6: Visualize results**
```python
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 6))
plt.hist(scores[y==0], bins=100, alpha=0.7, label='Normal', density=True)
plt.hist(scores[y==1], bins=100, alpha=0.7, label='Fraud', density=True)
plt.xlabel('Anomaly Score')
plt.ylabel('Density')
plt.legend()
plt.title('Anomaly Score Distribution: Normal vs Fraud')
plt.savefig('anomaly_scores.png')
```

#### Expected Results
- ROC-AUC: ~0.93–0.95 (without any labels used in training)
- Precision@Recall=0.80: ~0.05–0.10 (many false positives — expected for unsupervised)
- Key insight: Unsupervised methods are great for initial screening but need threshold tuning

#### Common Pitfalls
- Not scaling features — Isolation Forest is somewhat scale-invariant, but Amount has huge range
- Setting contamination too high — leads to excessive false positives
- Evaluating with accuracy — misleading due to extreme class imbalance; use ROC-AUC, PR-AUC
- Ignoring temporal leakage — in production, train only on past data

---

### 4.2 Production: Real-time Sensor Anomaly Detection with Autoencoder + Kafka

**Type:** production | **Difficulty:** advanced | **Estimated Time:** 4 hours

#### Problem Statement
Monitor 50 IoT sensors on a manufacturing production line in real-time. Detect equipment anomalies within 5 seconds of occurrence to prevent unplanned downtime. Sensors emit readings every 1 second.

#### Sample Data
**Format:** JSON (Kafka messages)
**Schema:** `timestamp (ISO8601), sensor_id (str), temperature (float), vibration (float), pressure (float), rpm (float), power_consumption (float)`

```json
{"timestamp": "2026-03-31T10:00:01Z", "sensor_id": "S-001", "temperature": 72.3, "vibration": 0.45, "pressure": 101.2, "rpm": 1500, "power_consumption": 45.2}
{"timestamp": "2026-03-31T10:00:02Z", "sensor_id": "S-001", "temperature": 72.5, "vibration": 0.44, "pressure": 101.1, "rpm": 1502, "power_consumption": 45.1}
{"timestamp": "2026-03-31T10:00:03Z", "sensor_id": "S-001", "temperature": 73.1, "vibration": 0.48, "pressure": 100.9, "rpm": 1498, "power_consumption": 45.5}
{"timestamp": "2026-03-31T10:00:04Z", "sensor_id": "S-001", "temperature": 89.7, "vibration": 1.82, "pressure": 95.3, "rpm": 1650, "power_consumption": 78.9}
```
Row 4 = anomaly (temperature spike + vibration surge + pressure drop)

#### Architecture
```
Sensors ──► Kafka ──► Flink ──► Feature Window ──► Autoencoder ──► Score ──► Alert
  (50)      Topic     (CEP)    (30s rolling)       (PyTorch)     (Redis)   (Slack)
                                                       │
                                                  Model Registry
                                                    (MLflow)
```

#### Solution Walkthrough

**Step 1: Define Autoencoder model**
```python
import torch
import torch.nn as nn

class SensorAutoencoder(nn.Module):
    def __init__(self, input_dim=25, latent_dim=8):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, latent_dim)
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Linear(64, input_dim)
        )

    def forward(self, x):
        z = self.encoder(x)
        return self.decoder(z)
```

**Step 2: Train on normal data**
```python
from torch.utils.data import DataLoader, TensorDataset

# X_normal: historical normal sensor data (30-day window features)
dataset = TensorDataset(torch.FloatTensor(X_normal))
loader = DataLoader(dataset, batch_size=256, shuffle=True)

model = SensorAutoencoder(input_dim=X_normal.shape[1])
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.MSELoss()

for epoch in range(100):
    for (batch,) in loader:
        recon = model(batch)
        loss = criterion(recon, batch)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
```

**Step 3: Compute threshold from training data**
```python
model.eval()
with torch.no_grad():
    recon = model(torch.FloatTensor(X_normal))
    errors = ((recon - torch.FloatTensor(X_normal)) ** 2).mean(dim=1)

threshold = errors.mean() + 3 * errors.std()  # 3-sigma rule
print(f"Threshold: {threshold:.6f}")
```

**Step 4: Scoring service (FastAPI)**
```python
from fastapi import FastAPI
import numpy as np

app = FastAPI()

@app.post("/score")
async def score(features: list[float]):
    x = torch.FloatTensor([features])
    with torch.no_grad():
        recon = model(x)
        error = ((recon - x) ** 2).mean().item()
    is_anomaly = error > threshold
    return {"score": error, "is_anomaly": is_anomaly, "threshold": threshold}
```

#### Expected Results
- Detection latency: <2 seconds end-to-end
- Recall on known failure modes: >95%
- False positive rate: <1% after threshold calibration
- Memory footprint: ~50MB for model + feature buffer per sensor group

#### Common Pitfalls
- Training on data that contains anomalies — corrupts the "normal" baseline
- Static threshold — must adapt to seasonal patterns (day/night, weekday/weekend)
- Feature window too short — misses slow degradation patterns
- Not monitoring the model itself — autoencoder performance degrades with distribution shift

---

## 5. Integration Patterns

### 5.1 With Prometheus/Grafana (Most Common)
```
App Metrics ──► Prometheus ──► Anomaly Detector ──► Custom Exporter ──► Grafana Alert
                                                          │
                                                  Anomaly annotations
                                                  on existing dashboards
```
- Push anomaly scores as custom Prometheus metrics
- Use Grafana alerting rules on anomaly score thresholds
- Overlay anomaly markers on existing operational dashboards

### 5.2 With SIEM (Security)
```
Security Logs ──► SIEM (Splunk/ELK) ──► Anomaly Detection API ──► SOAR Playbook
                                              │
                                        Enriched alerts with
                                        anomaly context + score
```

### 5.3 With ERP/MES (Manufacturing)
```
MES Sensors ──► OPC-UA Gateway ──► Kafka ──► Anomaly Pipeline ──► MES Alert API
                                                                        │
                                                              Work order trigger
                                                              (predictive maintenance)
```

### 5.4 With Data Warehouse (Batch)
```
DWH (BigQuery/Snowflake) ──► dbt model ──► Batch Scoring Job ──► Anomaly Table ──► BI Tool
                                                                        │
                                                              Daily anomaly digest email
```

---

## 6. Performance Considerations

### 6.1 Latency Requirements by Domain

| Domain | Target Latency | Architecture | Model Type |
|--------|---------------|--------------|------------|
| Fraud Detection | <100ms | Streaming | Isolation Forest / lightweight NN |
| Sensor Monitoring | <5s | Streaming | Autoencoder |
| Log Analysis | <1min | Micro-batch | Statistical + rules |
| Quality Control | <10s | Streaming | CNN (vision) or tabular |
| Batch Reporting | Hours OK | Batch | Any (deep models OK) |

### 6.2 Throughput Benchmarks

| Model | Events/sec (CPU) | Events/sec (GPU) | Memory |
|-------|-------------------|-------------------|--------|
| Isolation Forest (PyOD) | ~50,000 | N/A | ~200MB |
| One-Class SVM | ~10,000 | N/A | ~500MB |
| LOF | ~5,000 | N/A | ~1GB |
| Autoencoder (small) | ~20,000 | ~200,000 | ~50MB |
| Anomaly Transformer | ~2,000 | ~50,000 | ~500MB |

### 6.3 Optimization Strategies
- **Model quantization:** INT8 for Autoencoder → 2-4x faster inference
- **Feature caching:** Redis for pre-computed rolling statistics
- **Batch inference:** Accumulate 100-1000 samples, score together (GPU efficient)
- **Model distillation:** Train lightweight student from complex teacher model
- **Approximate methods:** Streaming sketches (Count-Min, HyperLogLog) for feature engineering

---

## 7. Technology Selection Matrix

| Criteria | PyOD | Alibi Detect | Amazon Lookout | Azure Anomaly Detector | Datadog |
|----------|------|-------------|----------------|----------------------|---------|
| **Algorithms** | 40+ | 15+ | Proprietary | Proprietary | Proprietary |
| **Streaming** | No (batch) | Yes (drift) | Yes | Yes | Yes |
| **Customization** | Full | Full | Limited | Limited | None |
| **Self-hosted** | Yes | Yes | No | No | No |
| **GPU Support** | Partial | Yes | N/A | N/A | N/A |
| **Cost** | Free (OSS) | Free (OSS) | ~$0.75/1K inferences | ~$0.30/1K points | $23+/host/mo |
| **Vietnam Deployment** | ✅ Any | ✅ Any | ⚠️ Singapore region | ⚠️ SE Asia region | ⚠️ SaaS only |
| **Best For** | Research, POC | Production, drift | Managed time-series | Simple API integration | APM-integrated |
| **Recommendation** | POC + Baseline | **Production Pick** | Enterprise (AWS shop) | Enterprise (Azure shop) | Ops teams |

**Verdict:** Start with PyOD for rapid prototyping → Alibi Detect for production → consider managed services only for enterprise clients already on that cloud.

---

## 8. Appendix: Decision Matrix for Model Selection

```
Is data labeled?
├── Yes (>1000 labels) → Supervised: XGBoost / LightGBM classifier
├── Partial (<1000 labels) → Semi-supervised: Deep SAD / DevNet
└── No labels
    ├── Tabular data?
    │   ├── <10K rows → Statistical (Z-score, IQR, Grubbs)
    │   ├── 10K-1M rows → Isolation Forest or LOF
    │   └── >1M rows → Isolation Forest (scales well)
    ├── Time series?
    │   ├── Univariate → ARIMA residuals / Prophet
    │   ├── Multivariate → Autoencoder / USAD
    │   └── Streaming → ADWIN + Half-Space Trees
    ├── Image/Video? → Autoencoder / f-AnoGAN (→ see B03)
    └── Graph/Network? → Graph Autoencoder / GNN-based
```
