# QA Engineer Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

Testing ML systems requires a different mindset from traditional software testing. Beyond functional correctness, QA must validate model quality, data quality, fairness, and system performance. This note covers testing strategies for the full tabular ML prediction pipeline — from data ingestion through model serving.

## 2. Model Quality Testing

### Metric Thresholds
- Define minimum acceptable metrics per use case:
  - Credit scoring: AUC >0.75, KS statistic >0.30.
  - Churn prediction: F1 >0.60, recall >0.70.
  - Fraud detection: precision >0.50 at recall >0.80.
- Gate deployments: model must pass all metric thresholds on holdout test set.
- Compare against baseline model (current production or simple heuristic).

### Metric Stability Testing
- Run model evaluation on multiple random seeds; metrics should not vary more than 2%.
- Cross-validation fold variance: if fold metrics vary widely, model may be unstable.
- Test on time-sliced holdouts: model should perform consistently across recent time periods.

### Overfitting Detection
- Compare training metrics vs validation metrics; gap >5% signals overfitting.
- Learning curves: plot metrics vs training set size to detect high variance.
- Feature importance stability: top features should be consistent across CV folds.

## 3. Data Quality Testing

### Great Expectations
- Define expectations as code: column types, value ranges, null rates, uniqueness.
- Run expectations on every data pipeline execution.
- Example expectations:
  - `expect_column_values_to_be_between("age", 18, 100)`
  - `expect_column_values_to_not_be_null("customer_id")`
  - `expect_column_distinct_values_to_be_in_set("gender", ["M", "F", "Other"])`

### Pandera
- Schema validation for pandas DataFrames in Python code.
- Type-safe, integrates with pytest.
- Define schemas as classes; validate at pipeline boundaries.

### Data Contract Testing
- Schema contracts between data producers and ML consumers.
- Break the build if schema changes without updating the contract.
- Monitor for silent schema changes (column added/removed upstream).

## 4. Regression Testing for Model Updates

### Model-Level Regression
- Compare new model predictions against previous version on a fixed test set.
- Metric regression test: new model must not be worse on any key metric by more than a tolerance.
- Prediction stability: for the same input, prediction should not change drastically between versions.
- Track "flipped" predictions: inputs that change class between model versions.

### Pipeline-Level Regression
- End-to-end test: push sample data through the full pipeline, verify output matches expected.
- Feature computation regression: same raw data should produce identical features across code changes.
- Use snapshot testing: save expected outputs, compare against actual.

## 5. Fairness Testing

- Test prediction rates across demographic groups (gender, age, region).
- Disparate impact ratio must be >0.8 across protected groups.
- Slice performance metrics by group: AUC, precision, recall per demographic.
- Vietnamese context: test across urban/rural, North/South/Central regions.
- Use Fairlearn or AIF360 for automated fairness testing in CI.
- Document fairness test results as deployment artifacts.

## 6. A/B Testing Framework

### Test Design
- Define primary metric (business KPI) and guardrail metrics (latency, error rate).
- Calculate required sample size for statistical significance (power analysis).
- Randomization unit: user-level or request-level depending on use case.
- Duration: typically 1-4 weeks for sufficient data.

### Monitoring During Test
- Real-time dashboard showing metric trends for control and treatment groups.
- Early stopping rules: halt if treatment is significantly worse on guardrail metrics.
- SRM (Sample Ratio Mismatch) check: verify traffic split matches intended ratio.

### Analysis
- Statistical significance: p-value <0.05 or Bayesian posterior probability >95%.
- Effect size: practical significance, not just statistical significance.
- Segment analysis: check if treatment effect varies across user segments.

## 7. Performance Testing Prediction APIs

### Load Testing
- Use Locust or k6 to simulate concurrent prediction requests.
- Test scenarios: sustained load, spike load, gradual ramp-up.
- Target benchmarks:
  - p50 latency <20ms for tabular model inference.
  - p99 latency <100ms including feature retrieval.
  - Throughput: >500 predictions/second per replica.

### Stress Testing
- Find breaking point: increase load until error rate exceeds 1%.
- Verify graceful degradation: queue overflow, connection exhaustion, memory limits.
- Test auto-scaling: does HPA spin up new replicas quickly enough under load?

### Soak Testing
- Run at moderate load for 24-48 hours.
- Check for memory leaks (model loading, feature caching).
- Verify no performance degradation over time.

## 8. Edge Case Testing

### Null and Missing Values
- Send predictions with all optional features as null.
- Send predictions with various combinations of missing features.
- Verify model handles missing values gracefully (GBDT models natively handle nulls).
- Test with empty strings, NaN, None, and "null" string.

### Extreme Inputs
- Minimum and maximum values for each numeric feature.
- Very long strings for categorical features.
- Unicode and Vietnamese characters in text features.
- Negative values where only positive are expected.

### Boundary Conditions
- Prediction at exact decision threshold.
- Feature values at exact bin boundaries.
- Timestamp features at day/month/year boundaries.
- New categories not seen during training.

### Malformed Inputs
- Wrong data types (string where number expected).
- Extra unexpected fields in request.
- Missing required fields.
- Very large request payloads (batch of 100K rows).

## 9. Test Automation Strategy

| Test Type | Frequency | Tool | Gate |
|-----------|-----------|------|------|
| Data quality | Every pipeline run | Great Expectations | Block training |
| Model quality | Every training | pytest + custom | Block deployment |
| Fairness | Every training | Fairlearn | Block deployment |
| API performance | Weekly + pre-deploy | Locust/k6 | Block deployment |
| Edge cases | Pre-deploy | pytest | Block deployment |
| A/B analysis | End of test period | Custom | Inform decision |

## 10. Recommendations

1. Treat model metric thresholds as hard gates; never deploy a model that fails quality checks.
2. Implement data quality validation at every pipeline boundary, not just at ingestion.
3. Run edge case tests with nulls, extremes, and malformed inputs before every deployment.
4. Performance test with realistic load patterns, not just peak throughput.
5. Automate fairness testing in CI; do not rely on manual review alone.
6. Use snapshot testing for feature pipelines to catch silent computation changes.
7. Monitor A/B tests for SRM before analyzing results; invalid splits invalidate conclusions.
