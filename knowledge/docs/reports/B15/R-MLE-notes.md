# ML Engineer Notes: Simulation & Digital Twin (B15)

## 1. Overview

Machine learning in the simulation and digital twin domain focuses on building surrogate models that approximate expensive physics-based simulations at a fraction of the computational cost. The ML Engineer bridges traditional simulation with data-driven approaches, enabling real-time prediction and optimization.

## 2. Surrogate Model Training

### Why Surrogates
- Full physics simulations (FEM, CFD) can take hours to days per run.
- Surrogates (trained neural networks) approximate simulation output in milliseconds.
- Enable real-time digital twin updates, interactive what-if analysis, and optimization loops.

### Neural Network Surrogates
- **Feedforward networks** — simplest approach for mapping parameters to scalar outputs.
- **Convolutional networks** — for spatial output fields (temperature distribution, stress maps).
- **Encoder-decoder architectures** — for mapping input parameters to full simulation fields.
- Training data: 1,000-100,000 simulation runs depending on input dimensionality.
- Active sampling strategies to minimize required training simulations.

### Training Pipeline
```
Design of Experiments → Run Simulations → Collect Results → Train Surrogate → Validate → Deploy
     (LHS, Sobol)        (parallel batch)    (Parquet/HDF5)    (PyTorch)      (holdout)   (ONNX)
```

## 3. Gaussian Process Emulators

- Gold standard for small-data surrogate modeling (< 1,000 training points).
- Provide uncertainty estimates naturally — critical for knowing when to trust the surrogate.
- Libraries: GPyTorch, GPflow, scikit-learn GaussianProcessRegressor.
- Kernel selection: Matern 5/2 is a robust default for physical systems.
- Scalability challenge: cubic complexity O(n^3) — use sparse GPs or inducing points for > 5,000 samples.
- Multi-output GPs for correlated simulation outputs.

## 4. Transfer Learning: Simulation to Real Data

### Sim-to-Real Gap
- Simulations are idealized; real systems have unmodeled effects (wear, contamination, environment).
- Transfer learning bridges this gap by fine-tuning simulation-trained models on limited real data.

### Strategies
- **Pre-train on simulation, fine-tune on real data** — most common, effective with 50-500 real samples.
- **Domain adaptation** — align feature distributions between simulated and real domains (MMD, CORAL, adversarial).
- **Multi-fidelity learning** — combine low-fidelity (fast) and high-fidelity (accurate) simulations with real data.
- **Physics-informed fine-tuning** — constrain fine-tuning to respect known physical laws.

## 5. Calibration of Simulation Parameters

- **Bayesian calibration** — infer simulation parameters that best match observed real data (using MCMC or variational inference).
- **ABC (Approximate Bayesian Computation)** — for simulators without tractable likelihoods.
- **Optimization-based calibration** — minimize discrepancy between simulation output and measurements (Nelder-Mead, CMA-ES, Bayesian optimization).
- Key challenge: identifiability — multiple parameter combinations may produce similar outputs.
- Use sensitivity analysis (Sobol indices) to identify which parameters matter most.

## 6. Active Learning for Simulation Experiments

- Simulations are expensive — choose next simulation runs intelligently.
- **Bayesian optimization** — select parameters that maximize expected improvement or information gain.
- **Uncertainty-guided sampling** — run simulations where the surrogate is most uncertain.
- **Query-by-committee** — use ensemble disagreement to identify informative regions.
- Budget allocation: balance exploration (uncertain regions) vs exploitation (promising regions).
- Batch active learning for parallel simulation execution.

## 7. Evaluation Metrics for Surrogate Accuracy

| Metric | Purpose | Target |
|--------|---------|--------|
| RMSE / MAE | Point prediction accuracy | < 5% of output range |
| R-squared | Variance explained | > 0.95 |
| MAPE | Relative error | < 5-10% |
| Coverage probability | Uncertainty calibration | 95% CI covers 95% |
| Maximum absolute error | Worst-case guarantee | Application-dependent |
| Prediction time | Speedup over full simulation | > 1000x |

### Validation Strategy
- Holdout test set (20% of simulation runs).
- Cross-validation for small datasets.
- Out-of-distribution testing: evaluate on parameter regions not seen during training.
- Physics consistency checks: does the surrogate respect conservation laws, monotonicity, symmetry?

## 8. Tools and Frameworks

- **SMT (Surrogate Modeling Toolbox)** — Python library for surrogate models with active sampling.
- **BoTorch** — Bayesian optimization built on PyTorch and GPyTorch.
- **Emukit** — decision-making under uncertainty with emulators.
- **ONNX Runtime** — deploy trained surrogates with consistent cross-platform inference.
- **MLflow** — track surrogate training experiments, register validated models.

## 9. Recommendations

1. Start with Gaussian Processes for low-dimensional problems (< 10 input parameters) — interpretable and uncertainty-aware.
2. Move to neural network surrogates when dimensionality or data volume grows.
3. Always validate surrogates on out-of-distribution inputs — simulation coverage defines surrogate reliability.
4. Implement active learning from the start — it can reduce required simulations by 50-80%.
5. Track the sim-to-real gap quantitatively; plan for periodic recalibration as physical systems age.
6. Use multi-fidelity approaches when coarse simulations are available — leverage cheap approximations.
