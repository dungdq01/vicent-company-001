# Performance Engineer Notes: Simulation & Digital Twin (B15)

## 1. Overview

Simulation and digital twin workloads impose extreme performance demands: from batch simulations running hours on HPC clusters to real-time twins requiring sub-second updates. The Performance Engineer ensures these systems meet latency, throughput, and resource efficiency targets across all deployment scenarios.

## 2. Simulation Performance Profiling

### Key Metrics
- **Time-to-solution** — wall-clock time for a complete simulation run.
- **Throughput** — number of simulation scenarios processed per hour.
- **Latency** — time from sensor input to twin state update (real-time twins).
- **Resource utilization** — CPU, GPU, memory, I/O usage during simulation.
- **Scalability efficiency** — speedup achieved vs resources added.

### Profiling Tools
- **Intel VTune** — CPU profiling for simulation codes (hotspots, threading, memory access).
- **NVIDIA Nsight Systems** — GPU timeline analysis for neural surrogate inference.
- **NVIDIA Nsight Compute** — kernel-level GPU profiling.
- **perf** (Linux) — lightweight system-level profiling.
- **Py-Spy / cProfile** — Python-level profiling for orchestration code.
- Custom instrumentation with OpenTelemetry for end-to-end pipeline profiling.

### Common Bottlenecks
- I/O-bound: reading large mesh files, writing result datasets.
- Memory-bound: large simulation state arrays exceeding L3 cache.
- Compute-bound: iterative solvers, matrix operations.
- Communication-bound: MPI message passing in distributed simulations.

## 3. Parallelization Strategies

### CPU Parallelization
- **OpenMP** — shared-memory parallelism for loop-level parallelization in simulation codes.
- **MPI (Message Passing Interface)** — distributed-memory parallelism across nodes. Decompose simulation domain spatially.
- **Hybrid MPI+OpenMP** — MPI between nodes, OpenMP within nodes. Standard for HPC simulation.
- **Dask** — Python-native parallelism for data processing and parameter sweeps.

### GPU Parallelization
- **CUDA** — direct GPU programming for custom simulation kernels.
- **cuPy / CuDF** — GPU-accelerated NumPy/Pandas for data preprocessing.
- **PyTorch/JAX** — GPU-accelerated neural surrogate training and inference.
- **Multi-GPU** — data parallelism (DDP) for surrogate training, model parallelism for very large models.

### Parameter Sweep Parallelization
- Embarrassingly parallel: each scenario runs independently.
- Use job arrays (SLURM) or Kubernetes Jobs for batch execution.
- Target: 100-10,000 scenarios in parallel depending on cluster size.

## 4. Real-Time Simulation Requirements

| Twin Type | Update Frequency | Max Latency | Example |
|-----------|-----------------|-------------|---------|
| Monitoring twin | 1-10 Hz | 1 second | Factory floor overview |
| Control twin | 10-100 Hz | 100 ms | Process control loop |
| Predictive twin | 0.01-1 Hz | 10 seconds | Predictive maintenance |
| Planning twin | On-demand | Minutes | What-if scenario analysis |

### Achieving Real-Time Performance
- Use neural surrogates instead of full simulation for control and monitoring twins.
- Pre-compute lookup tables for known operating regions.
- Edge deployment for latency-critical twins (avoid cloud round-trip).
- Streaming architectures (Flink, Kafka Streams) for continuous twin updates.

## 5. Memory Optimization

- **Out-of-core computing** — process simulation data larger than RAM using memory-mapped files (NumPy memmap, HDF5).
- **Sparse data structures** — exploit sparsity in finite element matrices (scipy.sparse, PETSc).
- **Data type optimization** — use float32 instead of float64 where precision permits (50% memory savings).
- **Streaming processing** — process simulation output in chunks rather than loading entire results.
- **Memory pooling** — pre-allocate and reuse buffers for iterative simulation steps.
- Target: keep working set within L3 cache for hot loops.

## 6. Benchmarking Simulation Throughput

### Benchmark Design
- Define standard benchmark scenarios (small, medium, large scale).
- Measure: setup time, solve time, post-processing time, total time.
- Report: scenarios/hour, FLOPS utilization, memory bandwidth utilization.
- Compare: full simulation vs surrogate model (speedup ratio).

### Reference Targets
- Neural surrogate inference: < 1 ms per scenario (GPU), < 10 ms (CPU).
- Full CFD simulation: minutes to hours (acceptable for batch).
- Digital twin update: < 100 ms for real-time applications.
- Parameter sweep: 10,000 scenarios in < 1 hour.

## 7. Scaling: Single Machine to Cluster

### Scaling Path
1. **Single machine, single GPU** — prototyping and small simulations.
2. **Single machine, multi-GPU** — medium simulations, surrogate training.
3. **Multi-node cluster** — large-scale simulations, massive parameter sweeps.
4. **Cloud burst** — elastic scaling for peak workloads (AWS ParallelCluster, Azure CycleCloud).

### Scaling Considerations
- Network bandwidth between nodes (InfiniBand for HPC, 25Gbps+ Ethernet minimum).
- Shared storage: parallel file systems (Lustre, GPFS) or object storage (S3).
- Job scheduler: SLURM for HPC, Kubernetes for cloud-native.
- Cost model: on-demand vs reserved vs spot instances.

## 8. Latency Budget for Digital Twin Updates

```
Sensor → Edge Gateway:     5-20 ms
Edge → Cloud Ingestion:    10-50 ms
Stream Processing:         5-20 ms
Surrogate Inference:       1-5 ms
State Update + Storage:    5-10 ms
API Response:              5-10 ms
─────────────────────────────────
Total:                     31-115 ms
```

Optimize each stage; the budget is tight for real-time control applications.

## 9. Recommendations

1. Profile before optimizing — identify whether bottlenecks are compute, memory, I/O, or communication.
2. Neural surrogates are the primary tool for achieving real-time twin performance — invest in surrogate accuracy.
3. Use float32 as default precision; only use float64 when simulation accuracy requires it.
4. Design for cloud bursting from day one — peak simulation demand is unpredictable.
5. Establish latency budgets per pipeline stage and monitor continuously.
6. Benchmark regularly as models evolve — performance regression testing is essential.
