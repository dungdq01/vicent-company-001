# DevOps/MLOps Notes: B03 Computer Vision
## By R-DO — Date: 2026-03-31

---

### 1. GPU Infrastructure for CV

**Cloud GPU comparison (as of early 2026):**

| Instance | GPU | VRAM | On-Demand $/hr | Spot $/hr | Best For |
|----------|-----|------|----------------|-----------|----------|
| AWS p3.2xlarge | V100 16GB | 16GB | $3.06 | ~$0.92 | Legacy training, budget inference |
| AWS p4d.24xlarge | A100 40GB × 8 | 320GB | $32.77 | ~$10.00 | Large model training |
| AWS g5.xlarge | A10G 24GB | 24GB | $1.006 | ~$0.30 | Inference, fine-tuning |
| AWS g4dn.xlarge | T4 16GB | 16GB | $0.526 | ~$0.16 | Cost-effective inference |
| GCP a2-highgpu-1g | A100 40GB | 40GB | $3.67 | ~$1.10 | Training workloads |
| GCP g2-standard-4 | L4 24GB | 24GB | $0.70 | ~$0.21 | Inference, preferred GCP |
| Azure NC4as T4 v3 | T4 16GB | 16GB | $0.526 | ~$0.16 | Azure ecosystem |

**Cost/performance recommendation:**
- **Training:** AWS p4d spot instances or GCP A100 preemptible. Use spot for up to 70% savings — always checkpoint every epoch.
- **Inference (latency-sensitive):** AWS g5.xlarge (A10G) — best price/performance ratio for TensorRT FP16 models.
- **Inference (cost-sensitive):** AWS g4dn.xlarge (T4) with TensorRT INT8 quantization.
- **On-premise:** If running >200 GPU-hours/day consistently, on-premise NVIDIA A100 or H100 servers break even vs. cloud within 18-24 months. Use cloud for burst capacity.

**Spot instance strategy:**
- Use Spot with checkpointing (save model state every N steps to S3).
- Implement `SIGTERM` handler to checkpoint before termination (2-minute warning on AWS Spot).
- Use mixed instance pools (Spot Fleet) across multiple instance types and AZs to reduce interruption rate.
- Set a maximum spot price at on-demand price — never pay more than on-demand.

---

### 2. Containerization for CV

**Base image selection:**

```dockerfile
# Multi-stage build for CV inference container
# Stage 1: Build dependencies
FROM nvcr.io/nvidia/pytorch:24.10-py3 AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Minimal runtime image
FROM nvcr.io/nvidia/tritonserver:24.10-py3

COPY --from=builder /root/.local /root/.local
COPY ./models /models
COPY ./app /app

ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000 8001 8002

CMD ["tritonserver", "--model-repository=/models"]
```

**Key practices:**
- Always use **NVIDIA NGC base images** (`nvcr.io/nvidia/...`) — they include optimized CUDA, cuDNN, TensorRT, and are tested together. Do not build your own CUDA stack.
- Use **multi-stage builds** to keep production images lean. Typical CV inference image: 4-8GB (CUDA runtime unavoidable, but avoid dev tools in production).
- Pin exact image tags (e.g., `pytorch:24.10-py3`) — `latest` is a deployment risk.
- **nvidia-docker2 / NVIDIA Container Toolkit:** Install on host nodes. Container accesses GPU via `--gpus all` flag or Kubernetes resource limits.

**Image size optimization:**
- Remove training-only packages (e.g., `tensorboard`, `jupyter`) from inference images.
- Use `--no-cache-dir` with pip.
- Combine RUN commands to reduce layers.
- Target inference image: <6GB total. Training image: size matters less.

---

### 3. Kubernetes for CV Workloads

**GPU node pool setup (EKS/GKE):**
```yaml
# Node pool configuration
nodePool:
  machineType: g5.xlarge        # AWS A10G
  accelerators:
    - type: nvidia-tesla-a10g
      count: 1
  taints:
    - key: nvidia.com/gpu
      value: "true"
      effect: NoSchedule
```

**Pod resource request for GPU inference:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cv-inference
spec:
  replicas: 3
  template:
    spec:
      tolerations:
        - key: nvidia.com/gpu
          operator: Exists
          effect: NoSchedule
      containers:
        - name: triton
          image: nvcr.io/nvidia/tritonserver:24.10-py3
          resources:
            requests:
              memory: "8Gi"
              cpu: "2"
              nvidia.com/gpu: "1"
            limits:
              memory: "16Gi"
              cpu: "4"
              nvidia.com/gpu: "1"   # GPU is not overcommitted — 1 GPU per pod
```

**Important:** `nvidia.com/gpu` resources in Kubernetes are **not** overcommittable. Each pod gets exclusive GPU access. For multi-tenant scenarios, use **MIG (Multi-Instance GPU)** on A100/H100 to partition one physical GPU into up to 7 logical GPUs.

**Horizontal Pod Autoscaling for inference:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cv-inference-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cv-inference
  minReplicas: 1
  maxReplicas: 10
  metrics:
    - type: External
      external:
        metric:
          name: custom.googleapis.com/inference_queue_depth
        target:
          type: AverageValue
          averageValue: "5"
```
Scale on queue depth rather than CPU/memory — GPU pods often have low CPU utilization but high GPU contention.

---

### 4. CI/CD for ML Models

**GitHub Actions pipeline for CV model:**

```yaml
name: CV Model CI/CD

on:
  push:
    branches: [main]
    paths: ['models/**', 'src/**', 'tests/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: pip install -r requirements-dev.txt
      - name: Lint
        run: ruff check . && black --check .
      - name: Unit tests
        run: pytest tests/unit/ -v --cov=src
      - name: Integration tests (CPU, ONNX)
        run: pytest tests/integration/ -v -m "not gpu"

  model-validation:
    runs-on: [self-hosted, gpu]   # self-hosted GPU runner
    needs: test
    steps:
      - name: Download candidate model
        run: dvc pull models/candidate/
      - name: Evaluate on validation set
        run: python scripts/evaluate.py --model models/candidate/ --dataset data/val/
      - name: Performance gate
        run: |
          python scripts/check_metrics.py \
            --min-map50 0.82 \
            --max-latency-ms 25 \
            --fail-on-regression

  canary-deploy:
    needs: model-validation
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Register model in MLflow
        run: python scripts/register_model.py --stage Staging
      - name: Deploy canary (10% traffic)
        run: kubectl set image deployment/cv-inference triton=$NEW_IMAGE
        # Argo Rollouts handles traffic splitting
      - name: Monitor canary (15 min)
        run: python scripts/monitor_canary.py --duration 900 --max-error-rate 0.02

  production:
    needs: canary-deploy
    steps:
      - name: Promote to production
        run: python scripts/promote_model.py --from Staging --to Production
```

---

### 5. Model Registry & Versioning

**MLflow model registry workflow:**

```python
import mlflow

# Register model after training
with mlflow.start_run():
    mlflow.log_metrics({"mAP50": 0.847, "inference_ms": 18.3})
    mlflow.log_params({"architecture": "yolov8n", "input_size": 640})
    mlflow.pytorch.log_model(model, "model", registered_model_name="cv-detector")

# Transition stages: None → Staging → Production
client = mlflow.MlflowClient()
client.transition_model_version_stage(
    name="cv-detector", version=7, stage="Production"
)
```

**Blue/green deployment strategy:**
- **Blue** = current production model (100% traffic)
- **Green** = new candidate model (0% traffic)
- Deploy green alongside blue. Route 5% → 10% → 50% → 100% traffic to green over 30-60 minutes.
- Monitor error rate, latency P95, and prediction confidence distribution at each step.
- Use **Argo Rollouts** or **Flagger** on Kubernetes to automate the progressive rollout with automatic rollback on metric breach.

**Rollback strategy:**
```bash
# Instant rollback to previous version
kubectl rollout undo deployment/cv-inference

# Rollback MLflow model version
mlflow client.transition_model_version_stage("cv-detector", version=6, stage="Production")
mlflow client.transition_model_version_stage("cv-detector", version=7, stage="Archived")
```
Always keep the previous 2 production versions available for instant rollback.

---

### 6. Monitoring CV Models in Production

**Key metrics to track:**

| Category | Metric | Tool | Alert Threshold |
|----------|--------|------|-----------------|
| Latency | P50 / P95 / P99 inference time | Prometheus + Grafana | P99 > 200ms |
| Throughput | Requests per second | Prometheus | Drop > 20% baseline |
| GPU | Utilization, memory, temperature | DCGM Exporter | Util < 20% (idle waste) or > 95% (overload) |
| Prediction | Confidence score distribution | Evidently AI | Mean confidence drops > 0.1 |
| Data drift | Input pixel distribution shift | Evidently AI | KS test p-value < 0.05 |
| Errors | 4xx / 5xx error rate | Prometheus | > 1% error rate |
| Queue | Inference queue depth | Prometheus | > 20 queued requests |

**Evidently AI for model monitoring:**
```python
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, ClassificationPreset

report = Report(metrics=[DataDriftPreset(), ClassificationPreset()])
report.run(reference_data=baseline_df, current_data=production_df)
report.save_html("monitoring_report.html")
```

Run Evidently reports daily in a scheduled Airflow task. Alert via PagerDuty when drift is detected. Data drift often precedes accuracy degradation by days — catching it early allows proactive retraining.

**Distributed tracing:**
Instrument with OpenTelemetry. Trace the full path: API gateway → preprocessing → model inference → postprocessing. Jaeger or Tempo for trace storage. Helps isolate whether latency regression is in preprocessing, model, or postprocessing.

---

### 7. Cost Optimization

**Model quantization savings:**

| Precision | Model Size | Inference Speed | Accuracy Drop | GPU Memory |
|-----------|------------|-----------------|---------------|------------|
| FP32 | 1x baseline | 1x | 0% | 1x |
| FP16 | 0.5x | 1.5-2x | <0.1% | 0.5x |
| INT8 | 0.25x | 2-4x | 0.5-1% | 0.25x |
| INT4 | 0.125x | 3-6x | 1-3% | 0.125x |

Always use FP16 TensorRT in production — free accuracy with 2x speedup. INT8 requires calibration dataset but saves significantly on cost.

**Auto-shutdown idle GPU:**
```python
# Lambda function triggered by CloudWatch
def handler(event, context):
    cw = boto3.client('cloudwatch')
    metrics = cw.get_metric_statistics(
        Namespace='DCGM', MetricName='DCGM_FI_DEV_GPU_UTIL',
        Period=300, Statistics=['Average'],
        StartTime=datetime.now() - timedelta(minutes=30),
        EndTime=datetime.now()
    )
    avg_util = metrics['Datapoints'][0]['Average']
    if avg_util < 5.0:  # Less than 5% utilization for 30 min
        ec2.stop_instances(InstanceIds=[GPU_INSTANCE_ID])
```

**Spot instances for training:**
- Set up SageMaker Managed Spot Training or use the EC2 Spot interruption handler pattern.
- Checkpoint to S3 every 10 minutes during training.
- Expected savings: 60-70% vs on-demand.

**ARM for edge/CPU inference:**
AWS Graviton3 (ARM) instances provide 40% better price/performance vs x86 for CPU-bound ONNX inference tasks. Use `onnxruntime` with the `MLAS` execution provider on ARM.

---

### 8. Edge Deployment

**Export path for edge deployment:**

```
PyTorch (.pt / .pth)
    → TorchScript (.torchscript)
    → ONNX (.onnx)           ← universal intermediate format
        → TensorRT (.trt)    ← NVIDIA GPU edge (Jetson)
        → OpenVINO (.xml/.bin) ← Intel CPU/iGPU/VPU (NUC, NCS2)
        → NCNN (.param/.bin) ← Mobile (Android/iOS ARM)
        → CoreML (.mlpackage) ← Apple Silicon (Mac, iPhone)
        → TFLite (.tflite)   ← Android, microcontrollers
```

**ONNX export (PyTorch):**
```python
import torch

model.eval()
dummy_input = torch.randn(1, 3, 640, 640)
torch.onnx.export(
    model, dummy_input, "model.onnx",
    opset_version=17,
    input_names=["images"],
    output_names=["output"],
    dynamic_axes={"images": {0: "batch_size"}}
)
# Validate
import onnx
onnx.checker.check_model("model.onnx")
```

**TensorRT for NVIDIA Jetson (Orin):**
```bash
# On Jetson device
trtexec --onnx=model.onnx \
        --saveEngine=model_fp16.trt \
        --fp16 \
        --workspace=4096 \
        --best
```
Jetson AGX Orin achieves ~200 TOPS INT8. YOLOv8n runs at 120+ FPS on Orin with TensorRT INT8.

**OpenVINO for Intel (x86 CPU / integrated graphics):**
```bash
mo --input_model model.onnx \
   --output_dir openvino_model/ \
   --data_type FP16
```

**Raspberry Pi 4 benchmarks (practical reference):**

| Model | Framework | Precision | FPS (Pi 4, 4-core) |
|-------|-----------|-----------|---------------------|
| MobileNetV3 | ONNX Runtime | FP32 | ~12 FPS |
| YOLOv8n | NCNN | FP16 | ~8 FPS |
| EfficientDet-D0 | TFLite | INT8 | ~5 FPS |
| NanoDet | NCNN | INT8 | ~15 FPS |

For Pi 4 deployments, prefer **NCNN** (Tencent) — most optimized for ARM Cortex-A72. Use INT8 quantization and input resolution of 320x320 or smaller. For real-time requirements on Pi, target NanoDet or YOLOv8n-320 with NCNN INT8.

**Coral TPU (Edge AI accelerator):**
For deployments requiring higher throughput than Pi CPU allows, add a Coral USB Accelerator (~$60). Runs TFLite INT8 models at 4 TOPS. MobileNetV2 SSD runs at ~200 FPS on Coral — order of magnitude faster than Pi CPU.
