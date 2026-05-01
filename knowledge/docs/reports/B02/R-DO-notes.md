# Ghi chú DevOps: B02 — Document Intelligence
## Tác giả: R-DO — Ngày: 2026-03-31

---

## Góc nhìn chuyên môn

Từ góc nhìn DevOps, Document Intelligence là một trong những workloads phức tạp nhất để deploy và operate vì nó kết hợp cả CPU-intensive (preprocessing, postprocessing), GPU-intensive (OCR, model inference), và I/O-intensive (document storage, database) workloads trong cùng một pipeline. Mỗi component có scaling characteristics khác nhau, resource requirements khác nhau, và failure modes khác nhau.

GPU serving là thách thức lớn nhất. OCR models và Vision-Language Models cần GPU inference, nhưng GPU instances đắt ($0.5-3/giờ trên cloud). Hiệu suất GPU utilization (tận dụng GPU) là yếu tố quyết định chi phí vận hành. Một GPU A10G idle 50% thời gian nghĩa là lãng phí $1,000/tháng. Dynamic batching, request queuing, và autoscaling dựa trên queue depth thay vì CPU utilization là cách tiếp cận đúng cho GPU workloads.

Container orchestration cho Document Intelligence pipeline cần thiết kế node pools riêng biệt: CPU node pool cho API servers, preprocessing workers; GPU node pool cho OCR và ML inference; High-memory node pool cho post-processing và data transformation. Kubernetes với node affinity và taints/tolerations cho phép schedule workloads lên đúng loại node. Không nên chạy CPU tasks trên GPU nodes — lãng phí tài nguyên quý.

Monitoring và observability cho Document Intelligence phải cover cả infrastructure metrics (CPU, GPU utilization, memory, disk I/O) và application metrics (documents/giây, processing latency, queue depth, error rate). GPU monitoring cần DCGM (Data Center GPU Manager) hoặc nvidia-smi exporter cho Prometheus. Alert rules phải phân biệt giữa infrastructure issues (node down) và application issues (model OOM).

CI/CD cho ML-heavy applications có đặc thù riêng. Model artifacts lớn (500MB-5GB), cần model registry riêng biệt (MLflow hoặc S3). Docker images chứa ML dependencies thường 5-10GB — cần multi-stage builds, layer caching, và base image strategy để giảm build time. Model deployment cần canary strategy — new model version serve 10% traffic trước, validate accuracy, rồi mới full rollout.

## Khuyến nghị kỹ thuật

1. **Kubernetes Cluster Architecture**:
```yaml
# Node pools
- name: api-pool
  machineType: c5.xlarge    # 4 vCPU, 8GB RAM
  minNodes: 2, maxNodes: 10

- name: worker-pool
  machineType: c5.2xlarge   # 8 vCPU, 16GB RAM
  minNodes: 2, maxNodes: 20

- name: gpu-pool
  machineType: g5.xlarge    # NVIDIA A10G, 24GB VRAM
  minNodes: 1, maxNodes: 8
  taints: [nvidia.com/gpu=present:NoSchedule]
```
HPA (Horizontal Pod Autoscaler) dựa trên custom metrics (queue depth).

2. **GPU Serving với Triton Inference Server**: Deploy OCR models qua NVIDIA Triton — hỗ trợ dynamic batching (gom nhiều requests thành batch), model versioning, multi-model serving trên cùng GPU. Giảm GPU cost 40-60% so với naive deployment.

3. **Docker Multi-stage Build cho ML Services**:
```dockerfile
# Stage 1: Build
FROM python:3.11 AS builder
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM nvidia/cuda:12.1-runtime-ubuntu22.04
COPY --from=builder /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY models/ /app/models/    # Pre-downloaded model weights
COPY src/ /app/src/
```
Base image với CUDA runtime, model weights baked in (không download lúc startup).

4. **Autoscaling Strategy**:
   - API pods: HPA on CPU (target 70%)
   - Worker pods: KEDA scaler on RabbitMQ queue length (1 pod per 50 messages)
   - GPU pods: Custom scaler on inference queue depth (scale up khi queue > 100, scale down khi idle > 10 min)
   - Scale-to-zero cho GPU pods ngoài giờ hành chính (tiết kiệm 60% cost)

5. **CI/CD Pipeline**:
```
Code Push → Lint/Test → Build Docker Image →
Push to Registry → Deploy to Staging →
Integration Tests → Accuracy Tests (nếu model change) →
Canary Deploy (10%) → Full Rollout
```
GitHub Actions hoặc GitLab CI. Separate pipeline cho model updates vs code updates.

6. **Infrastructure as Code (IaC)**: Terraform cho cloud infrastructure (VPC, EKS, RDS, S3). Helm charts cho Kubernetes deployments. ArgoCD cho GitOps-based deployment — mọi config change qua Git, auto-sync với cluster.

7. **Monitoring Stack**:
   - **Prometheus**: Metrics collection (application + infrastructure)
   - **Grafana**: Dashboards — separate dashboards cho: Infrastructure, Pipeline Health, GPU Utilization, Business Metrics
   - **Loki**: Log aggregation
   - **Jaeger**: Distributed tracing (trace document qua toàn bộ pipeline)
   - **PagerDuty/OpsGenie**: Alerting on-call rotation

8. **Backup & Disaster Recovery**:
   - PostgreSQL: Automated daily backup, point-in-time recovery, cross-region replica
   - MinIO/S3: Cross-region replication cho raw documents
   - Kubernetes: Velero backup cho cluster state
   - RPO (Recovery Point Objective): 1 giờ
   - RTO (Recovery Time Objective): 4 giờ

9. **Security Hardening**:
   - Network policies: Isolate namespaces, restrict pod-to-pod communication
   - Pod security standards: Non-root containers, read-only filesystem
   - Secrets management: HashiCorp Vault hoặc AWS Secrets Manager
   - Image scanning: Trivy trong CI pipeline, reject images với critical CVEs
   - RBAC: Least privilege cho mọi service account

10. **Cost Optimization**:
    - Spot/Preemptible instances cho worker pools (save 60-70%)
    - Reserved instances cho always-on components (API, database)
    - GPU time-based scheduling (scale down nights/weekends)
    - S3 lifecycle rules: Infrequent Access after 30 days, Glacier after 90 days
    - Right-sizing: Monthly review resource requests vs actual usage

## Rủi ro & Thách thức

1. **GPU availability và cost**: GPU instances có thể hết capacity trong peak hours hoặc spot instances bị reclaim. Cần fallback strategy — queue documents khi GPU unavailable, process khi capacity available. Cost có thể spike 2-3x trong peak periods nếu không có reserved capacity.

2. **Docker image size**: ML Docker images thường 5-10GB với CUDA + model weights. Pull time 2-5 phút, ảnh hưởng scaling speed. Cần pre-pull images trên nodes, hoặc dùng container image streaming (Soci Index on AWS).

3. **Stateful GPU workloads**: GPU pods load model vào VRAM khi start — mất 30-60 giây. Scale-up không instant như CPU pods. Cần predictive scaling (dựa trên historical patterns) thay vì reactive scaling.

4. **Cross-service debugging**: Một document đi qua 5-6 services. Khi fail, trace root cause khó nếu không có distributed tracing. OpenTelemetry integration từ ngày đầu là must-have, không phải nice-to-have.

5. **Compliance & data residency**: Tài liệu tài chính Việt Nam có thể yêu cầu data residency trong nước. Cloud provider nào có region Việt Nam? Hiện chỉ có AWS (dự kiến) và một số provider local. Cần hybrid strategy nếu dùng cloud.

## Công cụ & Thư viện đề xuất

| Công cụ | Mục đích | Ghi chú |
|---------|---------|---------|
| **Kubernetes (EKS/GKE)** | Container orchestration | GPU node pools |
| **NVIDIA Triton** | Model serving | Dynamic batching |
| **Terraform** | Infrastructure as Code | Multi-cloud support |
| **Helm** | K8s package manager | Templated deployments |
| **ArgoCD** | GitOps deployment | Auto-sync, rollback |
| **Prometheus + Grafana** | Monitoring & dashboards | Full observability |
| **Loki** | Log aggregation | Grafana ecosystem |
| **Jaeger** | Distributed tracing | OpenTelemetry compatible |
| **KEDA** | Event-driven autoscaling | Queue-based scaling |
| **Velero** | Cluster backup | Disaster recovery |
| **Trivy** | Container security | CVE scanning |
| **HashiCorp Vault** | Secrets management | Dynamic secrets |
| **GitHub Actions** | CI/CD | Workflow automation |
| **DCGM Exporter** | GPU monitoring | Prometheus metrics |

## Ghi chú cho R-σ (Consolidation)

- **Kiến trúc deploy**: Kubernetes với 3 node pools (API, Worker, GPU). KEDA cho queue-based autoscaling.
- **GPU cost optimization**: Triton dynamic batching, scale-to-zero ngoài giờ, spot instances. Target: GPU utilization > 70%.
- **CI/CD**: Separate pipelines cho code vs model. Canary deployment cho model updates. ArgoCD GitOps.
- **Monitoring**: Prometheus + Grafana + Loki + Jaeger. GPU monitoring với DCGM. 4 dashboard tiers.
- **Cost estimate**: ~$3,000-5,000/tháng cho production cluster (2 GPU nodes, 4 CPU nodes, managed DB).
- **DR**: RPO 1h, RTO 4h. Cross-region backup cho critical data.
- **Key risk**: GPU availability và startup latency (30-60s model loading). Cần predictive scaling.
