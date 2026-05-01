# DevOps Engineer Notes: Simulation & Digital Twin (B15)

## 1. Overview

Simulation and digital twin workloads present unique DevOps challenges: HPC-class compute requirements, GPU scheduling, long-running jobs that span hours or days, and real-time services that demand always-on availability. The DevOps Engineer must build infrastructure that handles both batch simulation and real-time twin operations.

## 2. HPC Cluster Management

### Cluster Options
- **On-premises HPC** — SLURM-managed clusters for organizations with existing infrastructure.
- **AWS ParallelCluster** — managed HPC on AWS with auto-scaling, EFA networking, FSx Lustre.
- **Azure CycleCloud** — managed HPC on Azure with SLURM/PBS integration.
- **GCP HPC Toolkit** — Terraform-based HPC deployment on Google Cloud.

### Cluster Architecture
```
Login Nodes → Job Scheduler (SLURM) → Compute Nodes (CPU/GPU)
                                    → Shared Storage (Lustre/GPFS)
                                    → Network (InfiniBand/EFA)
```

### Key Configurations
- Partition design: separate queues for interactive (short, high priority) and batch (long, preemptible).
- Fair-share scheduling to balance resources across teams/projects.
- Pre-emption policies for high-priority simulation jobs.
- Node health checks: verify GPU, memory, and storage before job dispatch.

## 3. GPU Allocation for PINNs and Neural Surrogates

### GPU Resource Management
- NVIDIA GPU Operator for Kubernetes — automated driver, runtime, and monitoring setup.
- MIG (Multi-Instance GPU) on A100/H100 — partition one GPU for multiple small inference workloads.
- Time-slicing for shared GPU access during development and testing.
- Dedicated GPU nodes for training; shared GPU nodes for inference.

### GPU Types by Workload
| Workload | Recommended GPU | Reason |
|----------|----------------|--------|
| PINN training | A100/H100 (40-80GB) | Large models, mixed precision |
| Surrogate training | A100/V100 (32-40GB) | Standard DL training |
| Real-time inference | T4/L4 (16GB) | Cost-efficient, low latency |
| Development/testing | T4 or MIG slice | Sufficient for small models |

## 4. Containerized Simulation Environments

### Container Strategy
- Base images: NVIDIA NGC containers (PyTorch, TensorFlow, Modulus) with CUDA pre-configured.
- Simulation-specific images: add domain solvers (OpenFOAM, FEniCS, ANSYS) on top of base.
- Multi-stage builds: separate build dependencies from runtime for smaller images.
- Image registry: private registry (Harbor, ECR) with vulnerability scanning.

### Example Dockerfile Structure
```dockerfile
FROM nvcr.io/nvidia/modulus:24.01-py3
RUN pip install deepxde gpytorch botorch
COPY simulation_code/ /app/
ENTRYPOINT ["python", "/app/run_simulation.py"]
```

- Pin all dependency versions for reproducibility.
- Test containers with GPU access in CI before deployment.

## 5. Scheduling Long-Running Simulations

### Kubernetes Jobs
- Use Kubernetes `Job` with `backoffLimit` and `activeDeadlineSeconds`.
- `ttlSecondsAfterFinished` for automatic cleanup of completed job pods.
- Persistent Volume Claims for simulation data that survives pod restarts.
- Pod disruption budgets to protect running simulations from node maintenance.

### Workflow Orchestration
- **Argo Workflows** — DAG-based simulation pipelines (pre-process → simulate → post-process).
- **Apache Airflow** — schedule periodic simulation runs (daily recalibration, nightly batch sweeps).
- **Prefect** — Python-native orchestration with dynamic task generation for parameter sweeps.

### Checkpointing
- Long simulations (hours/days) must support checkpointing.
- Save state to persistent storage at configurable intervals.
- Auto-restart from last checkpoint on node failure or preemption.

## 6. Monitoring Simulation Queues

### Metrics to Track
- Queue depth: pending simulations by priority and type.
- Wait time: average time from submission to execution start.
- Utilization: CPU/GPU utilization across compute nodes.
- Job success/failure rate and failure reasons.
- Resource waste: allocated but unused CPU/GPU/memory.

### Monitoring Stack
- **Prometheus** — collect metrics from SLURM exporter, NVIDIA DCGM, Kubernetes.
- **Grafana** — dashboards for queue status, resource utilization, job history.
- **NVIDIA DCGM Exporter** — GPU utilization, memory, temperature, power.
- Alerting: queue depth exceeds threshold, GPU utilization below 50%, job failure rate spike.

## 7. Cost Optimization

### Spot/Preemptible Instances
- Use spot instances for batch parameter sweeps (60-90% cost savings).
- Implement checkpointing for spot instance interruption handling.
- On-demand instances for time-sensitive or interactive simulations.
- Reserved instances for always-on twin infrastructure.

### Cost Strategies
- Auto-scaling: scale compute nodes down to zero when queue is empty.
- Right-sizing: match instance types to actual workload requirements.
- Storage tiering: hot (SSD) for active simulations, cold (S3 Glacier) for archived results.
- Scheduled scaling: increase capacity during business hours, reduce overnight.
- Budget alerts and cost allocation tags by project/team.

## 8. Data Pipeline Orchestration

- **Airflow DAGs** for daily data pipelines: ingest sensor data → preprocess → update twin state → run predictions.
- **Argo Events** for event-driven triggers: new sensor data arrival triggers twin update.
- Pipeline monitoring: data freshness, processing latency, error rates.
- Retry policies with exponential backoff for transient failures.
- Data pipeline CI/CD: test DAGs in staging before production deployment.

## 9. Recommendations

1. Use Kubernetes for simulation orchestration with Argo Workflows — it handles both batch jobs and real-time services.
2. Implement checkpointing for any simulation expected to run longer than 1 hour.
3. Start with spot instances for parameter sweeps — the cost savings justify the checkpoint overhead.
4. Deploy NVIDIA GPU Operator and DCGM from day one — GPU visibility is essential.
5. Separate real-time twin infrastructure (always-on, auto-scaled) from batch simulation (job-based, spot-eligible).
6. Use Airflow for scheduled pipelines, Argo Events for event-driven triggers — different tools for different patterns.
