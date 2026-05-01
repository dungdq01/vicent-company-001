# Solution Architect Notes: Anomaly Detection & Monitoring (B07)
## By Solution Architect (R-SA) — Date: 2026-03-31

---

## 1. Reference Architectures

Three canonical patterns for anomaly detection systems:

**Batch Architecture**: Events collected into a data lake (S3/MinIO), processed on
schedule (hourly/daily) via Spark or Dask, results written to a reporting database.
Best for: compliance reporting, historical analysis, cost-sensitive workloads.

**Streaming Architecture**: Events flow through Kafka/Pulsar into a stream processor
(Flink, Kafka Streams) that scores in real-time via an embedded or sidecar model.
Alerts route to PagerDuty/Opsgenie/Zalo OA. Best for: fraud detection, security
monitoring, industrial safety.

**Hybrid Architecture** (recommended for most Vietnam deployments): Streaming layer
handles critical real-time detection; batch layer performs deeper analysis, model
retraining, and reconciliation. Lambda or Kappa architecture depending on team maturity.
Start with Kappa (single streaming path) and add batch only when needed.

## 2. Technology Selection for Vietnam Market

| Layer              | Recommended                     | Alternative            |
|--------------------|---------------------------------|------------------------|
| Ingestion          | Apache Kafka (MSK or self-hosted) | RabbitMQ, Pulsar      |
| Stream Processing  | Apache Flink                    | Spark Structured Streaming |
| Model Serving      | Triton Inference Server         | TF Serving, BentoML   |
| Feature Store      | Feast (open-source)             | Tecton (if budget allows) |
| Storage            | MinIO (on-prem), S3 (cloud)     | HDFS                  |
| Monitoring         | Prometheus + Grafana            | Datadog (cloud-only)  |
| Alerting           | Alertmanager + Zalo OA webhook  | PagerDuty             |

Vietnam-specific considerations: prefer open-source stacks to minimize licensing costs.
Local cloud options (Viettel Cloud, FPT Cloud) offer lower latency and data residency
compliance but have smaller service catalogs than AWS/GCP.

## 3. Scalability Patterns

**Horizontal Scaling**: Stateless scoring services scale via Kubernetes HPA based on
CPU/request-rate metrics. Target: 50ms p99 latency at 10K events/second per pod.

**Sharding Strategies**:
- Shard by entity (customer_id, device_id) to keep related events on the same partition.
- Shard by time window for batch workloads to enable parallel processing.
- Consistent hashing for stateful aggregations (session windows, count-based features).

**Caching**: Redis cluster for feature lookups and recent score caching. TTL aligned
with feature freshness requirements (60s for real-time, 1h for near-real-time).

**Auto-scaling policy**: Scale out at 70% CPU sustained for 2 minutes; scale in at
30% CPU sustained for 10 minutes. Maintain minimum 2 replicas for availability.

## 4. Integration Patterns with Enterprise Systems

Vietnam enterprises commonly run SAP, Oracle EBS, or local ERPs (Fast, Bravo, MISA).

- **SAP Integration**: Use SAP OData APIs or RFC connectors to extract transaction data.
  CDC (Change Data Capture) via Debezium for real-time event streaming from SAP HANA.
- **Oracle EBS**: Golden Gate or Debezium for CDC. REST APIs for master data lookup.
- **Local ERPs (MISA, Fast, Bravo)**: Often lack APIs. Use database CDC (Debezium on
  MySQL/PostgreSQL) or file-based integration (SFTP CSV exports on schedule).
- **E-commerce platforms**: Shopee, Lazada, Tiki provide webhook/API integrations.
  Normalize event schemas using Apache Avro with a central Schema Registry.

Design an integration hub (API Gateway + message broker) to decouple anomaly detection
from source system changes. Use the Adapter pattern per source system.

## 5. Multi-Tenant Anomaly Detection Design

For SaaS deployments serving multiple Vietnam enterprises:

- **Data isolation**: Tenant data separated at the Kafka topic level (topic-per-tenant
  for large tenants, shared topic with tenant-id header for small tenants).
- **Model isolation**: Each tenant gets its own model artifact trained on their data.
  Shared base model with tenant-specific fine-tuning reduces training cost.
- **Threshold isolation**: Per-tenant threshold configurations stored in a config service.
- **Resource isolation**: Kubernetes namespaces with resource quotas per tenant tier.
- **Noisy neighbor prevention**: Rate limiting per tenant at the API gateway level.

## 6. Cost Optimization Strategies

Vietnam market is highly cost-sensitive. Key strategies:

- **Right-size Kafka**: Use tiered storage (hot on SSD, warm on HDD/S3) to reduce
  broker costs by 40-60%. Typical deployment: 3 brokers for < 50K events/second.
- **Spot/preemptible instances**: Use for batch retraining jobs (70% cost savings).
- **Model compression**: Quantize models (INT8) for inference; reduces GPU requirements.
  Many anomaly models (Isolation Forest, autoencoders) run efficiently on CPU only.
- **Sampling for low-risk events**: Score 100% of high-value transactions but only
  10-20% of low-value events, with periodic full-scan reconciliation.
- **Estimated monthly cost** for a mid-scale deployment (50K events/sec):
  - Cloud (AWS AP-Southeast-1): $8,000-12,000/month
  - Hybrid (on-prem compute + cloud storage): $5,000-8,000/month
  - Full on-prem: $3,000-5,000/month (after initial CapEx)

## 7. Deployment Topology for Vietnam

**On-Premises** (banks, government): Required by State Bank of Vietnam for core banking
data. Deploy on VMware/OpenStack with Kubernetes (Rancher or OpenShift). Data centers
in Hanoi and HCMC for DR.

**Cloud** (startups, e-commerce): AWS ap-southeast-1 (Singapore) is closest region.
FPT Cloud and Viettel Cloud offer in-country hosting with lower latency (~5ms vs ~30ms).

**Hybrid** (recommended for most enterprises): Sensitive data processing on-prem,
model training and non-sensitive analytics in cloud. Connect via dedicated link
(Viettel, VNPT leased line) or VPN. This balances compliance with cost efficiency.

Network considerations: Vietnam's international bandwidth can be inconsistent.
Keep all real-time scoring paths within the same data center or region. Use cloud
only for batch workloads tolerant of higher latency.

---

*End of Solution Architect notes for B07.*
