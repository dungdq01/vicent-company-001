# DevOps Engineer Notes: Anomaly Detection & Monitoring (B07)
## By Infrastructure Lead (R-DO) — Date: 2026-03-31

### 1. Model Serving: Real-Time vs Batch

**Real-time serving stack:**
- **Triton Inference Server**: Supports TensorFlow, PyTorch, ONNX, scikit-learn. Built-in dynamic batching, model versioning, health checks. First choice for multi-framework environments.
- **TorchServe / TF Serving**: Framework-specific, simpler setup if single framework.
- **Seldon Core / KServe**: Kubernetes-native model serving with canary deployments, A/B testing, explainability built in.
- **Custom FastAPI**: For simple models (Isolation Forest, XGBoost). Wrap with uvicorn + gunicorn. Fastest path to production.

**Deployment pattern for real-time:**
```
Load Balancer -> API Gateway -> Scoring Service (stateless, N replicas)
                                    |-> Feature Store (Redis)
                                    |-> Model Store (S3 + local cache)
```

**Batch serving:**
- Spark job or Flink batch mode reading from data lake
- Schedule via Airflow DAG: extract features -> load model -> score -> write results
- Use spot/preemptible instances for cost savings (batch is retry-friendly)

**Model artifact management:**
- Store in S3/GCS with versioned paths: `s3://models/anomaly-detector/v2.3.1/model.onnx`
- MLflow Model Registry for versioning, staging, promotion
- Pull model on container startup, cache locally, reload on version change signal
- ONNX conversion for framework-agnostic serving and faster inference

### 2. Kubernetes Autoscaling for Streaming Workloads

**Horizontal Pod Autoscaler (HPA):**
- Default CPU/memory metrics are insufficient for ML workloads
- Custom metrics to scale on:
  - Kafka consumer lag (via Prometheus + kafka-exporter)
  - Inference queue depth
  - Request latency p95
- KEDA (Kubernetes Event-Driven Autoscaling) is preferred for Kafka-based scaling: scales to zero when no events, scales up based on consumer group lag.

**KEDA ScaledObject example:**
```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: anomaly-scorer
spec:
  scaleTargetRef:
    name: anomaly-scorer-deployment
  minReplicaCount: 2
  maxReplicaCount: 50
  triggers:
  - type: kafka
    metadata:
      bootstrapServers: kafka:9092
      consumerGroup: anomaly-scorer
      topic: events-to-score
      lagThreshold: "1000"
```

**GPU autoscaling:**
- For deep learning models: use GPU node pools with cluster autoscaler
- Fractional GPU sharing: MIG (Multi-Instance GPU) on A100, or time-slicing on smaller GPUs
- Consider CPU inference for models under 50ms latency target — GPUs add scheduling complexity

**Resource limits:**
- Set memory limits 20% above observed peak (anomaly models can spike on unusual inputs)
- CPU requests = average usage, limits = 2x requests
- Use PodDisruptionBudget: minAvailable = 2 for scoring services

### 3. Monitoring the Monitor (Meta-Monitoring)

This is critical and often overlooked. An anomaly detection system that silently fails is worse than no system.

**What to monitor:**
- **Model health**: inference latency, error rate, score distribution statistics (mean, stddev, % above threshold)
- **Data health**: input feature distributions (detect upstream changes), null rates, volume rates
- **Pipeline health**: Kafka consumer lag, processing throughput, checkpoint status
- **Alert health**: alerts generated per hour, false positive rate (from feedback), mean time to acknowledge

**Score distribution monitoring:**
- If score distribution shifts dramatically, either the data changed or the model is degrading
- Track: hourly mean score, hourly stddev, hourly % above threshold
- Alert if any metric deviates >3 stddev from 7-day rolling average

**Dead man's switch:**
- If the anomaly system produces zero alerts for >24 hours (in an active system), alert the on-call
- Implement heartbeat checks: synthetic test events that should always score as anomalous

**Prometheus metrics to export:**
```
anomaly_score_histogram (le buckets: 0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95, 0.99)
anomaly_inference_duration_seconds (histogram)
anomaly_alerts_total (counter, labels: severity)
anomaly_feedback_total (counter, labels: true_positive/false_positive)
anomaly_model_version_info (gauge, labels: version)
anomaly_feature_null_rate (gauge, labels: feature_name)
anomaly_kafka_consumer_lag (gauge, labels: topic, partition)
```

### 4. CI/CD for Model Updates

**Pipeline stages:**
1. **Train**: Triggered by schedule or drift alert. Runs on GPU node pool or cloud training service.
2. **Validate**: Run model on holdout test set. Check metrics gates: PR-AUC > X, latency < Y ms, score stability.
3. **Package**: Convert to ONNX, build Docker image with model artifact baked in (or reference to S3 path).
4. **Shadow deploy**: Deploy new model alongside current. Score same traffic, compare results. Duration: 24-48 hours.
5. **Canary**: Route 5% of traffic to new model. Monitor error rates and score distributions.
6. **Promote**: If canary passes, shift 100% traffic. Keep previous version as rollback target.
7. **Rollback**: Automated if error rate spikes or latency exceeds threshold. < 60 second rollback.

**GitOps for model deployment:**
- Model version pinned in Helm values or Kustomize overlay
- PR to update model version triggers shadow/canary pipeline
- ArgoCD or Flux syncs desired state to cluster

**Model rollback criteria (automated):**
- Inference error rate > 1%
- p95 latency > 2x baseline
- Score distribution KL divergence from baseline > 0.5
- Alert volume > 5x normal (potential false positive storm)

### 5. Infrastructure for Streaming (Kafka, Flink)

**Kafka cluster sizing:**
- Partitions per topic = max expected throughput (msg/sec) / throughput per partition (~10K msg/sec)
- Replication factor: 3 for production
- Retention: 7 days for event topics (allows replay for reprocessing)
- Use Strimzi operator for Kafka on Kubernetes

**Kafka topic design for anomaly pipeline:**
```
raw-events           -> raw incoming events (source of truth)
enriched-events      -> events with computed features
anomaly-scores       -> scored events
anomaly-alerts       -> alerts for downstream consumers
model-feedback       -> analyst feedback for retraining
```

**Flink deployment:**
- Use Flink Kubernetes Operator for native K8s deployment
- Checkpointing interval: 60 seconds to S3/GCS
- Exactly-once semantics: enable Kafka transaction-based sink
- State backend: RocksDB for large state (rolling windows), HashMapStateBackend for small state
- Savepoints before any Flink job update for clean restart

**Flink resource planning:**
- Task slots = parallelism of most demanding operator
- Memory: 2-4GB per task manager for typical anomaly detection workloads
- Network buffers: increase for high-throughput Kafka source/sink operators

### 6. Disaster Recovery

- Kafka: multi-AZ deployment, MirrorMaker 2 for cross-region replication
- Flink: savepoints stored in S3 (durable), restore from latest savepoint on failure
- Model artifacts: versioned in S3 with cross-region replication
- Scoring service: multi-AZ deployment, health-check-based failover
- RTO target: < 5 minutes for scoring service, < 15 minutes for streaming pipeline
- RPO target: zero data loss (Kafka durability guarantees)

### Recommendations for B07

1. **Use KEDA for autoscaling** Kafka-based anomaly scoring. HPA with CPU metrics is too slow and imprecise for event-driven workloads.
2. **Implement meta-monitoring from day one**. A dead anomaly detector is the worst kind of failure — silent and invisible.
3. **Bake shadow deployment into the CI/CD pipeline**. Never promote a model to production without at least 24 hours of shadow scoring.
4. **Use Strimzi + Flink Kubernetes Operator** for a fully Kubernetes-native streaming stack. Avoid managing VMs for Kafka/Flink.
5. **Export model-specific Prometheus metrics** (score distribution, feature null rates) alongside standard infrastructure metrics. Grafana dashboards should show model health next to infra health.
6. **Design for rollback speed**. A bad model in production for 1 hour generates hundreds of false alerts or misses real anomalies. Target < 60 second automated rollback.
