# DevOps/MLOps Notes: B05 Recommendation Systems
## By R-DO — Date: 2026-03-31

### 1. Infrastructure for RecSys

Recommendation systems have distinct infrastructure profiles for training vs serving:

- **Training**: GPU-heavy (A100/H100 for deep learning models), burst workloads, tolerant of higher latency. Use spot/preemptible instances to cut costs 60-70%. Typical: 4x A100 for training a two-tower model on 1B interactions takes 2-4 hours.
- **Serving**: CPU-heavy for most ranking models (ONNX Runtime on CPU handles 1000 candidates in <50ms). GPU serving only needed for very large models or real-time embedding generation.
- **ANN index hosting**: memory-intensive. A FAISS index for 10M items with 128-dim embeddings requires ~5GB RAM (uncompressed). With IVF+PQ quantization, this drops to ~500MB. Host on high-memory instances with SSD for index loading.
- **Feature store**: Redis cluster for online store (3-node minimum for HA), sized by number of entities x features x value size. For 10M users x 50 features x 200 bytes average = ~100GB Redis.

Monthly cost breakdown for a mid-scale RecSys (10M users, 1M items):
| Component | Estimated Cost |
|-----------|---------------|
| Training (spot GPU, daily) | $800-1,500 |
| Serving (3x c5.2xlarge) | $900-1,200 |
| Redis feature store (3-node) | $600-900 |
| ANN index hosting (2x r5.2xlarge) | $500-700 |
| Kafka + streaming | $400-600 |
| Storage (S3, logs) | $200-400 |
| **Total** | **$3,400-5,300/mo** |

### 2. Deployment Patterns

Model updates in RecSys require careful rollout because bad recommendations directly impact revenue:

- **Blue/green deployment**: maintain two identical serving environments. Deploy new model to green, run validation tests (offline metrics on held-out data, sanity checks on known users), switch traffic. Rollback = switch back to blue. Works well for ranking model updates.
- **Shadow mode**: new model runs in parallel, receives real traffic, produces recommendations that are logged but NOT shown to users. Compare shadow model outputs against production model. Run for 24-48 hours before promoting. Essential for major model architecture changes.
- **Canary with metric gates**: route 5% of traffic to new model. Monitor key metrics for 2-4 hours: CTR delta (must be > -1%), revenue per user delta (must be > -2%), latency P99 (must be < 200ms). Automated promotion: if all gates pass, gradually increase to 25% -> 50% -> 100%. Automated rollback if any gate fails.

Use Argo Rollouts or Flagger on Kubernetes for automated canary progression. Define metric gates as AnalysisTemplate resources that query Prometheus.

### 3. Scaling RecSys Services

Scaling strategy per component:

- **Ranking service**: stateless, horizontally scalable. Each pod loads the model into memory on startup. Scale on CPU utilization (target 60%) or request queue depth. Use Kubernetes HPA. Pre-scale before known traffic spikes (flash sales, 11.11 events).
- **Retrieval/ANN service**: stateful (holds index in memory). Scale by replicating the index across pods. Each replica holds a full copy of the index. For very large indexes, shard by item partition. Use pod anti-affinity to spread replicas across nodes.
- **Feature store (Redis)**: scale reads via read replicas. Scale writes by adding shards (Redis Cluster). Monitor memory usage — eviction policies can silently degrade recommendations.
- **API gateway**: scale horizontally, stateless. Use connection pooling to backend services.

Load testing: use realistic traffic patterns, not uniform load. RecSys traffic is bursty — model the actual request distribution (high at 8-10 PM, low at 3-5 AM). Tools: Locust or k6 with custom user behavior scripts that simulate browsing sessions.

### 4. Model Retraining Pipeline

Automated retraining keeps recommendations fresh as user behavior evolves:

**Pipeline**: Airflow/Prefect DAG with stages:
1. **Data extraction**: pull last N days of interactions from event log (S3/Parquet). Typically 7-30 days for collaborative filtering, 1-3 days for session-based models.
2. **Feature engineering**: compute training features, join with feature store offline data. Output: train/validation/test Parquet files with time-based splits.
3. **Training**: launch training job on GPU cluster (Kubernetes Job or SageMaker Training). Log metrics to MLflow.
4. **Evaluation**: compute offline metrics (NDCG@10, Recall@50, AUC) on test set. Compare against current production model.
5. **Promotion gate**: if new model improves NDCG@10 by >0.5% AND does not degrade any metric by >1%, promote to staging.
6. **Deployment**: trigger canary deployment (see Section 2). If manual approval is configured, notify the ML team via Slack.

Schedule: daily retrain for e-commerce (user behavior changes fast), weekly for content platforms (preferences drift slower). Incremental retraining (fine-tune from last checkpoint on new data) saves 70-80% training time vs full retrain.

### 5. Monitoring for RecSys

Four layers of monitoring, each with distinct alerting thresholds:

**Model metrics (online)**:
- CTR (click-through rate): primary engagement metric. Alert if drops >10% from 7-day rolling average.
- NDCG@K (online): requires logging position of clicked items. Alert on sustained decline over 24 hours.
- Coverage: percentage of catalog shown in recommendations. Low coverage = popularity bias.

**System metrics**:
- Latency P50 target: <100ms. P99 target: <200ms. Alert if P99 exceeds 300ms for 5 minutes.
- Throughput: requests/second per service. Track against capacity ceiling.
- Error rate: 5xx responses. Alert if >0.1% over 5 minutes.

**Data metrics**:
- Feature freshness: time since last feature store update per feature group. Alert if real-time features are >5 minutes stale.
- Interaction volume: events/hour. Sudden drops indicate tracking failures.
- Feature distribution drift: monitor statistical properties of key features. Alert on KL-divergence exceeding threshold.

**Business metrics**:
- Revenue attributed to recommendations (tracked via impression -> click -> purchase funnel).
- Recommendation-driven GMV as percentage of total GMV.
- User engagement with recommendation widgets (impression-to-click ratio per placement).

Dashboarding: Grafana for system metrics, custom dashboards (Metabase/Superset) for business metrics. Weekly model performance review with the ML team.

### 6. Feature Store Operations

Deploying Feast on Kubernetes:

- **Feast server**: deployed as a Kubernetes Deployment with 2+ replicas. Exposes gRPC/HTTP API for online feature retrieval. Configure resource limits (1 CPU, 2GB RAM per pod typical).
- **Online store (Redis Cluster)**: 3-master, 3-replica configuration for production. Enable AOF persistence for durability. Memory sizing: allocate 1.5x expected data size to account for fragmentation and overhead.
- **Offline store (S3 + Parquet)**: partitioned by feature group and date. Lifecycle policy: archive data older than 90 days to Glacier, delete after 1 year.
- **Materialization jobs**: Kubernetes CronJobs that read from offline sources, compute latest feature values, and push to Redis. Schedule based on feature freshness SLAs. Real-time features bypass materialization — they are written directly by the streaming pipeline.
- **TTL management**: set per-feature-group TTL in Redis. User features: 30 days (inactive users' features expire). Item features: 7 days (stale items removed). Session features: 2 hours.

Monitor materialization job success rate, duration, and row counts. Alert on failures immediately — stale features silently degrade recommendation quality.

### 7. Cost Optimization

RecSys infrastructure costs grow with catalog size and traffic. Key optimization levers:

- **Embedding table compression**: quantize 32-bit float embeddings to 8-bit integers. 4x memory reduction with <1% recall loss. Use FAISS's `IndexIVFPQ` (Inverted File Index with Product Quantization) — reduces index memory by 10-20x compared to flat index. For 10M items with 128-dim: flat = 5GB, IVF+PQ = 300-500MB.
- **Batch precomputation during off-peak**: pre-compute recommendations for the top 20% most active users during night hours (2-6 AM). Store in Redis cache. These users generate 80% of traffic, so cache hit rate is very high. Compute cost shifts from expensive peak-hour serving to cheap off-peak batch jobs.
- **Spot instances for training**: training jobs are fault-tolerant (checkpoint every epoch). Use spot instances at 60-70% discount. Implement checkpoint-resume logic: if spot instance is reclaimed, restart from last checkpoint on a new instance.
- **Right-size serving instances**: profile actual CPU/memory usage. Many teams over-provision. Use Kubernetes VPA (Vertical Pod Autoscaler) recommendations as a starting point.
- **Model distillation**: train a smaller "student" ranking model from the full "teacher" model. 3-5x faster inference with minimal accuracy loss. Use the teacher model for offline candidate scoring and the student for real-time ranking.

### 8. Vietnamese Deployment

Considerations for serving Vietnamese users:

- **Latency**: Singapore (ap-southeast-1) is the closest major cloud region to Vietnam. Expect 30-50ms network latency from Ho Chi Minh City, 40-60ms from Hanoi. For the <200ms total budget, this leaves 140-170ms for processing. If targeting <100ms total, consider a Vietnam edge presence (Cloudflare Workers or AWS Local Zones if available).
- **CDN for static recommendations**: pre-computed recommendation widgets (trending, category-level) can be served from CDN edge nodes in Vietnam. Use Cloudflare or CloudFront with Vietnamese PoPs. TTL = 15-60 minutes. This handles anonymous users with near-zero latency.
- **Cost comparison at different scales**:
  - **Startup scale** (100K users, 50K items): full cloud, $1,500-2,500/month. No on-prem justification.
  - **Mid-scale** (5M users, 500K items): cloud at $5,000-8,000/month. Still cloud-favorable given operational overhead of on-prem.
  - **Shopee-scale** (50M+ users, 100M+ items): hybrid approach. Training on cloud GPU (burst capacity), serving on dedicated/on-prem hardware in Vietnamese data centers (Viettel IDC, FPT Telecom DC). On-prem serving saves 40-50% at this scale and eliminates cross-border latency.
- **Data residency**: Vietnam's Cybersecurity Law (2018) requires certain user data to be stored domestically. Ensure user interaction data and PII are stored in Vietnamese data centers or with compliant cloud regions. Use data classification: PII stays in-country, anonymized training data can be processed in Singapore.
- **Payment for cloud services**: Vietnamese companies often face friction with international cloud billing. Consider local cloud partners (Viettel Cloud, FPT Cloud) for non-critical workloads, with AWS/GCP for ML-specific services.
