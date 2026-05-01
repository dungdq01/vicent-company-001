# QA Engineer Notes: Simulation & Digital Twin (B15)

## 1. Overview

Quality assurance for simulation and digital twin systems goes beyond traditional software testing. QA must verify that simulations accurately represent physical reality, that surrogate models maintain acceptable accuracy, and that the platform reliably handles complex computational workloads. Testing spans physics validation, numerical accuracy, and software correctness.

## 2. Simulation Validation (Sim vs Reality)

### Validation Framework
- **Verification** — does the code solve the equations correctly? (math correctness)
- **Validation** — do the equations represent reality? (physics correctness)
- **Uncertainty Quantification (UQ)** — how confident are we in the results?

### Validation Methodology
1. Collect real-world measurement data from physical assets.
2. Run simulation with matching initial/boundary conditions.
3. Compare simulation output to measured data quantitatively.
4. Compute validation metrics and assess against acceptance criteria.

### Validation Metrics
| Metric | Formula | Acceptable Range |
|--------|---------|-----------------|
| RMSE | sqrt(mean((sim - real)^2)) | < 5% of measurement range |
| MAPE | mean(abs(sim - real) / real) | < 10% |
| Correlation (R) | pearson(sim, real) | > 0.95 |
| Feature-specific error | domain-dependent | domain-dependent |
| Bias | mean(sim - real) | near zero |

### Data Requirements
- Minimum 3-5 independent validation datasets per operating regime.
- Cover normal operating conditions AND boundary/extreme conditions.
- Include uncertainty estimates for measurement data (sensor accuracy specs).

## 3. Verification of Physics Constraints

### Conservation Laws
- **Mass conservation** — total mass in/out balanced within numerical tolerance.
- **Energy conservation** — energy input = output + stored + losses.
- **Momentum conservation** — for mechanical and fluid systems.
- Verify conservation at every time step for transient simulations.

### Physical Constraints
- Temperature cannot be negative (in Kelvin).
- Pressure cannot be negative (absolute).
- Material properties remain within physically valid ranges.
- Outputs respect known monotonicity (e.g., higher temperature = higher expansion).
- Symmetry preservation where geometry is symmetric.

### Automated Constraint Checking
```python
def verify_physics_constraints(results):
    assert results['temperature_K'].min() > 0, "Negative temperature detected"
    assert results['pressure_Pa'].min() >= 0, "Negative pressure detected"
    assert abs(results['mass_in'] - results['mass_out']) < TOLERANCE
    assert results['stress_MPa'].max() < MATERIAL_YIELD_STRENGTH
```

## 4. Regression Testing for Model Updates

### Test Suite Design
- **Golden dataset** — curated set of simulation inputs with validated expected outputs.
- Run golden dataset after every model update; compare results to baseline.
- Tolerance-based comparison: allow small numerical differences, flag significant deviations.
- Version-tagged baselines: each model version has its own golden results.

### Regression Triggers
- Simulation code changes (solver updates, bug fixes).
- Surrogate model retraining.
- Calibration parameter updates.
- Infrastructure changes (library updates, hardware migration).

### CI/CD Integration
- Automated regression tests in pipeline before model deployment.
- Block deployment if regression metrics exceed thresholds.
- Nightly full regression suite; quick subset on every commit.

## 5. Performance Testing

### Simulation Speed
- Benchmark standard scenarios: measure wall-clock time, CPU/GPU utilization.
- Regression alerts if simulation time increases by > 10%.
- Compare surrogate inference time vs full simulation (expect 1000x+ speedup).

### Scalability Testing
- Increase mesh resolution: verify linear or sub-linear scaling.
- Increase number of concurrent simulations: verify queue management.
- Load test real-time twin API: target 1000+ concurrent WebSocket connections.
- Stress test parameter sweep: submit 10,000 scenarios simultaneously.

### Accuracy Under Load
- Verify simulation results are identical regardless of parallelization level.
- Check that real-time twin updates maintain accuracy under high sensor data rates.
- Ensure no data loss during peak ingestion periods.

## 6. Edge Case Testing

### Extreme Parameters
- Run simulations at parameter boundaries (min/max of valid ranges).
- Test with physically extreme but plausible scenarios (thermal shock, power surge).
- Verify graceful behavior at parameter limits (convergence, stability).

### Failure Scenarios
- Sensor data dropout: how does the twin behave with missing inputs?
- Corrupted input data: does validation catch invalid values?
- Simulation divergence: is non-convergence detected and reported?
- Network interruption during real-time twin operation.
- Disk full during simulation output writing.

### Boundary Conditions
- Zero-value inputs where applicable.
- Maximum scale (largest supported mesh, longest time horizon).
- Rapid parameter changes (step functions in boundary conditions).

## 7. Calibration Testing

- Verify calibration process converges to known parameters on synthetic test cases.
- Test calibration stability: small changes in input data should not cause large parameter shifts.
- Cross-validation: calibrate on subset, validate on holdout.
- Sensitivity analysis: verify calibrated parameters are identifiable (not degenerate).
- Document calibration uncertainty bounds.

## 8. Acceptance Criteria for Surrogate Model Accuracy

### Tiered Acceptance
| Application | Max RMSE | Max MAPE | Min R-squared | Required Coverage |
|-------------|----------|----------|---------------|-------------------|
| Monitoring (visualization) | 10% | 15% | 0.90 | 90% of operating range |
| Predictive maintenance | 5% | 10% | 0.95 | 95% of operating range |
| Process optimization | 3% | 5% | 0.98 | 99% of operating range |
| Safety-critical | 1% | 2% | 0.99 | 100% of operating range |

### Surrogate Validation Process
1. Train surrogate on training simulation data.
2. Evaluate on holdout simulation data (in-distribution).
3. Evaluate on out-of-distribution test scenarios.
4. Compare against real-world measurement data.
5. Verify physics constraint satisfaction.
6. Sign off by domain expert before deployment.

## 9. Recommendations

1. Establish a golden dataset early — it becomes the foundation for all regression testing.
2. Automate physics constraint verification — run on every simulation output, not just during testing.
3. Define surrogate accuracy acceptance criteria per use case before development starts.
4. Include edge case testing in standard test suites — extreme conditions reveal model weaknesses.
5. Perform validation against real-world data quarterly, not just at initial deployment.
6. Require domain expert sign-off for any surrogate model deployed to production.
