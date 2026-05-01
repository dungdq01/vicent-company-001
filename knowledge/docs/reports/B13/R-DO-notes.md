# DevOps Engineer Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

MLOps for tabular ML focuses on automating the lifecycle of model training, evaluation, and deployment. Unlike deep learning workloads, tabular ML rarely requires GPU infrastructure, making it more cost-effective but introducing unique challenges around data pipeline orchestration, model monitoring, and scheduled retraining.

## 2. CI/CD for ML Pipelines

### Training Pipeline CI
- Trigger on: code changes to feature engineering or model training scripts, data schema changes.
- Steps: lint code, run unit tests, train model on sample data, validate metrics meet thresholds.
- Use GitHub Actions, GitLab CI, or Jenkins for pipeline orchestration.
- Store trained model artifacts in S3/GCS with unique version tags.

### Evaluation Pipeline
- Automated evaluation on holdout test set after each training run.
- Compare new model metrics against current production model.
- Gate: new model must beat production model by a configurable margin (e.g., AUC +0.5%).
- Generate evaluation report as CI artifact (metrics, plots, feature importance).

### Deployment Pipeline
- Promote model from staging to production via approval gate (manual or automated).
- Blue-green deployment: spin up new model server, switch traffic, keep old version warm.
- Canary deployment: route 5-10% traffic to new model, monitor, then increase.
- Rollback: automated if error rate or latency exceeds threshold within first hour.

## 3. Model Registry Management

- MLflow Model Registry as the source of truth for model versions.
- Lifecycle stages: None, Staging, Production, Archived.
- Automated promotion pipeline: training completes, evaluation passes, model moves to Staging.
- Manual approval for Staging to Production (or automated if metrics exceed threshold).
- Retention policy: keep last 5 production versions, archive older ones.
- Tag models with: git commit hash, training data version, feature set version.

## 4. Scheduled Retraining

### Airflow
- DAGs for: data extraction, feature computation, model training, evaluation, deployment.
- Sensor tasks to wait for data availability before starting training.
- Schedule: daily for high-frequency data (transactions), weekly/monthly for slower data (demographics).
- Retry logic with exponential backoff for transient failures.

### Prefect
- More Pythonic alternative to Airflow. Better for ML teams comfortable with Python.
- Flow runs as Python functions; easier to test locally.
- Built-in caching of task results to avoid re-computation on retries.

### Retraining Strategy
- **Sliding window**: Train on last N months of data. Simpler, handles concept drift.
- **Expanding window**: Train on all historical data. Better for stable domains.
- **Triggered**: Retrain when drift detection exceeds threshold (reactive, not scheduled).

## 5. Monitoring

### Model Performance Monitoring
- Track prediction accuracy using delayed ground truth labels.
- Dashboard: AUC/F1/RMSE over time, prediction volume, latency percentiles.
- Alert when metrics drop below threshold for N consecutive days.
- Tools: Evidently AI, Fiddler, WhyLabs, or custom Grafana dashboards.

### Data Drift Monitoring
- Compare incoming feature distributions against training data baseline.
- Metrics: PSI (Population Stability Index), KS statistic, Jensen-Shannon divergence.
- Monitor per-feature drift and overall dataset drift.
- Alert levels: warning (PSI 0.1-0.2), critical (PSI >0.2).

### Feature Drift
- Track individual feature statistics: mean, std dev, null rate, cardinality.
- Detect sudden shifts (data pipeline bug) vs gradual drift (real distribution change).
- Missing value rate spikes often indicate upstream pipeline failures.

### Infrastructure Monitoring
- Standard metrics: CPU, memory, request latency, error rate, throughput.
- Model-specific: inference time per prediction, batch processing duration, model load time.
- Use Prometheus + Grafana or cloud-native monitoring (CloudWatch, GCP Monitoring).

## 6. GPU vs CPU Deployment

- Tabular ML (GBDT models) runs on CPU. GPU provides no benefit for XGBoost/LightGBM inference.
- GPU only needed if using deep learning tabular models (TabNet, FT-Transformer) — rare in practice.
- Cost savings: CPU instances are 3-10x cheaper than GPU instances.
- Typical instance: 2-4 vCPU, 4-8GB RAM is sufficient for most tabular model serving.
- Scale horizontally (more replicas) rather than vertically for throughput.

## 7. Cost Optimization

- Use spot/preemptible instances for training (save 60-80%); training is fault-tolerant with checkpointing.
- Right-size serving instances: tabular models are lightweight (10-100MB), do not need large machines.
- Schedule training during off-peak hours for cheaper compute.
- Auto-scale serving replicas based on request volume (HPA in Kubernetes).
- Turn off dev/staging environments outside business hours.
- Monitor cloud spend per model/pipeline; allocate costs to business units.

## 8. Containerized Model Serving

### Docker Setup
- Base image: python:3.11-slim (keep images small, 200-500MB).
- Install only required packages (no Jupyter, no dev tools in production image).
- Multi-stage builds: build dependencies in one stage, copy artifacts to slim runtime stage.
- Health check endpoint: /health returns model version and status.

### Kubernetes Deployment
- Deployment with readiness/liveness probes.
- Resource limits: 500m-2000m CPU, 512Mi-2Gi memory for tabular models.
- HPA based on CPU utilization (target 70%) or custom metrics (requests per second).
- Use init containers to download model artifacts from S3/GCS at startup.

### Helm Charts
- Parameterize: model version, replica count, resource limits, feature store connection.
- Separate values files for dev, staging, production.
- Version Helm charts alongside model code.

## 9. Recommendations

1. Tabular ML does not need GPU; optimize for CPU-based serving to reduce costs by 5-10x.
2. Implement blue-green deployment for zero-downtime model updates.
3. Monitor data drift proactively; model performance decay is a lagging indicator.
4. Use Airflow for complex multi-step pipelines; Prefect for simpler ML team workflows.
5. Automate the full lifecycle: data arrives, features compute, model trains, evaluates, deploys.
6. Keep Docker images lean; tabular model containers should be <500MB.
7. Set up cost allocation tags from day one; ML infrastructure costs can grow quietly.
