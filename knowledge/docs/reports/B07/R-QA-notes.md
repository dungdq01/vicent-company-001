# QA Engineer Notes: Anomaly Detection & Monitoring (B07)
## By QA Engineer (R-QA) — Date: 2026-03-31

---

## 1. Testing Anomaly Detection Accuracy

Anomaly detection systems live or die by their precision and recall. A QA strategy must
define ground-truth datasets with labeled anomalies (true positives) and normal samples
(true negatives). Key metrics to track:

- **Precision**: Of all alerts raised, how many are real anomalies? Target >= 85%.
- **Recall**: Of all real anomalies, how many are caught? Target >= 95% for critical systems.
- **F1 Score**: Harmonic mean balancing both. Useful for single-number comparison.
- **False Positive Rate**: Must be minimized to prevent alert fatigue in operations teams.

Test datasets should include edge cases: seasonal spikes, maintenance windows, known
one-off events, and gradual drift scenarios. Maintain a golden dataset versioned alongside
the model for reproducibility.

## 2. Threshold Calibration Testing

Thresholds convert continuous anomaly scores into binary alerts. Testing must cover:

- **Static thresholds**: Validate against historical data windows (30/60/90 days).
- **Dynamic thresholds**: Test adaptive algorithms (e.g., rolling percentile, MAD-based)
  under regime changes such as holiday traffic or promotional campaigns.
- **Multi-level thresholds**: Verify that WARNING, CRITICAL, and EMERGENCY tiers trigger
  correct escalation paths and notification channels.
- **Hysteresis testing**: Confirm that rapid oscillation around a threshold does not
  generate a flood of open/close alerts (debounce logic).

Automate threshold sweep tests that generate precision-recall curves across a range
of threshold values and flag regressions compared to the previous release.

## 3. Streaming Pipeline Reliability

Real-time anomaly detection depends on reliable streaming infrastructure. QA must verify:

- **End-to-end latency**: Measure from event ingestion to alert delivery. SLA typically
  < 5 seconds for fraud detection, < 30 seconds for infrastructure monitoring.
- **Exactly-once processing**: Inject duplicate events and confirm no duplicate alerts.
- **Backpressure handling**: Simulate traffic spikes at 10x normal volume and verify
  graceful degradation without data loss.
- **Checkpoint and recovery**: Kill consumer processes mid-batch and confirm resumption
  from the last committed offset (Kafka) or checkpoint (Flink/Spark Streaming).
- **Schema evolution**: Publish events with added/removed fields and verify the pipeline
  handles schema changes without crashing.

## 4. Chaos Engineering for Anomaly Systems

Inject failures systematically to validate resilience:

| Failure Scenario             | Expected Behavior                        |
|------------------------------|------------------------------------------|
| Model serving pod crash      | Auto-restart, alerts buffer and replay   |
| Kafka broker loss (1 of 3)   | No data loss, replication takes over      |
| Redis cache eviction         | Fallback to database lookup, higher latency |
| Network partition             | Circuit breaker activates, stale model serves |
| Clock skew on scoring node   | Timestamps normalized, no false alerts   |

Use tools like Chaos Monkey, Litmus, or Gremlin. Run chaos experiments in staging
environments on a weekly cadence and before every major release.

## 5. Regression Testing After Model Updates

Every model retrain or algorithm change requires a regression gate:

1. Run the new model against the golden test dataset and compare metrics to baseline.
2. Perform shadow scoring: run new and old models in parallel on live traffic for 48-72
   hours and compare alert volumes and agreement rates.
3. Automated diff reports highlighting any anomaly reclassifications.
4. Rollback criteria: if precision drops > 5% or recall drops > 3%, block deployment.

Integrate regression checks into the CI/CD pipeline so that model artifacts cannot
be promoted to production without passing the test suite.

## 6. A/B Testing Framework for Threshold Changes

When tuning thresholds or switching algorithms in production:

- Route a percentage of traffic (e.g., 10%) to the candidate configuration.
- Collect metrics independently for control and treatment groups.
- Statistical significance: require p-value < 0.05 before declaring a winner.
- Guard rails: auto-revert if the candidate generates > 2x false positives or misses
  any known critical anomaly pattern from the test catalog.
- Duration: run A/B tests for a minimum of one full business cycle (typically 7 days).

## 7. Data Quality Validation

Anomaly detection is only as good as its input data. Validate continuously:

- **Completeness**: Alert if expected data sources stop sending within SLA windows.
- **Freshness**: Reject or flag data older than acceptable staleness (e.g., 5 minutes).
- **Schema conformance**: Validate field types, ranges, and enumerated values.
- **Distribution drift**: Compare incoming feature distributions against training
  baselines using KS-test or PSI (Population Stability Index). Trigger retraining
  alerts when PSI > 0.2.
- **Null/missing rate**: Fail fast if critical features exceed null thresholds.

## 8. Performance and Load Testing

Real-time scoring endpoints must meet strict latency and throughput targets:

- **Latency targets**: p50 < 10ms, p99 < 50ms for single-event scoring.
- **Throughput**: Sustain 10,000+ events/second per scoring instance.
- **Soak testing**: Run at 80% peak load for 24 hours to detect memory leaks.
- **Burst testing**: Ramp from idle to 5x normal in 30 seconds; confirm auto-scaling
  triggers and no request drops.
- **Resource profiling**: Track CPU, memory, GPU utilization, and GC pauses during load.

Use tools like k6, Locust, or Gatling. Integrate load test results into release
dashboards so teams can track performance trends across versions.

---

*End of QA Engineer notes for B07.*
