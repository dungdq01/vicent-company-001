# Manufacturing Domain Notes: Anomaly Detection & Monitoring (B07)
## By Manufacturing Domain Expert (R-D04) — Date: 2026-03-31

---

## 1. Vietnam Manufacturing Landscape

Vietnam's manufacturing sector is a cornerstone of its economy, contributing ~25% of
GDP. Key facts driving anomaly detection demand:

- **8,000+ factories** across the country, concentrated in industrial zones around
  Hanoi (Bac Ninh, Hai Phong), HCMC (Binh Duong, Dong Nai), and Da Nang.
- **FDI-driven growth**: Samsung, LG, Foxconn, Intel, and Canon operate major facilities.
  Samsung alone employs 100,000+ workers across its Vietnam operations.
- **Local manufacturers**: Vingroup (VinFast), Truong Hai Auto (THACO), Hoa Phat Steel,
  and Vinamilk represent growing domestic capability.
- **Industry 4.0 national strategy**: Government targets 100+ smart factories by 2030
  under Decision 749/QD-TTg, creating demand for AI-driven monitoring solutions.

## 2. Predictive Maintenance in Vietnam Factories

**Samsung Bac Ninh / Thai Nguyen**: Operates some of Southeast Asia's most advanced
electronics manufacturing lines. Uses vibration analysis and thermal imaging for
predictive maintenance on SMT (surface-mount technology) placement machines. Anomaly
detection models trained on 2+ years of sensor data predict bearing failures 48-72
hours in advance, reducing unplanned downtime by 35%.

**Foxconn Bac Giang**: Produces Apple components with strict quality requirements.
Deploys edge-based anomaly detection on CNC machines monitoring spindle vibration,
current draw, and tool wear. Challenge: high model variety means frequent retooling
and recalibration of anomaly baselines.

**Local manufacturers**: THACO and Hoa Phat are in earlier stages, typically using
rule-based threshold monitoring. Opportunity exists for ML-based solutions that can
learn normal operating ranges automatically rather than requiring manual threshold
configuration for each machine type.

## 3. Sensor Anomaly Detection for Equipment

Core sensor types and associated anomaly patterns:

| Sensor Type       | Normal Range (typical)  | Anomaly Indicators                    |
|-------------------|-------------------------|---------------------------------------|
| Vibration (mm/s)  | 0.5 - 4.5              | Bearing wear, imbalance, misalignment |
| Temperature (C)   | 40 - 85                 | Cooling failure, overload, friction   |
| Current (A)       | Within 10% of rated     | Motor degradation, mechanical binding |
| Pressure (bar)    | Process-specific        | Leaks, blockages, valve failures      |
| Acoustic (dB)     | Baseline +/- 6dB       | Cavitation, gear tooth damage         |

Detection approaches: Isolation Forest and autoencoders work well for multivariate
sensor streams. LSTM-based models capture temporal dependencies in sequential sensor
readings. For Vietnam deployments, lightweight models (< 50MB) that run on edge
gateways are preferred due to limited cloud connectivity in some industrial zones.

## 4. Production Line Quality Control

**Electronics sector**: Automated optical inspection (AOI) systems generate images that
anomaly detection models classify as pass/fail. Defect rates must stay below 50 DPMO
(defects per million opportunities) for Tier-1 supplier qualification. Anomaly detection
on AOI confidence scores catches borderline cases that need human review.

**Textiles sector**: Vietnam is the world's 3rd largest textile exporter. Fabric defect
detection via computer vision (cameras on looms and dyeing lines) identifies tears,
stains, and color inconsistencies. Challenge: high variety of fabric types requires
transfer learning or few-shot anomaly detection approaches.

**Food processing**: Vinamilk and Masan operate large-scale food processing with
strict HACCP requirements. Anomaly detection on fill levels, seal integrity, and
contamination sensors. Temperature chain monitoring from production through cold
storage to delivery using IoT sensors with anomaly alerting.

## 5. IIoT Integration Challenges in Vietnam

Practical barriers to deploying anomaly detection in Vietnamese factories:

- **Legacy equipment**: 40-60% of machines in local factories are 10-20 years old
  with no built-in connectivity. Retrofit solutions (vibration sensors, current
  clamps, edge gateways) add $500-2,000 per machine.
- **Connectivity**: Many industrial zones have inconsistent internet. Solutions must
  support offline/edge inference with periodic sync. 4G/5G industrial gateways from
  Viettel are improving coverage but are not yet universal.
- **Protocol fragmentation**: Machines speak Modbus RTU, OPC-UA, MQTT, Profinet, and
  proprietary protocols. An integration middleware layer (e.g., Kepware, Ignition, or
  open-source solutions like Node-RED) is essential.
- **Data standardization**: No common data model across factories. ISA-95 adoption is
  low. Each deployment requires custom data mapping and normalization effort.
- **Workforce skills**: Factory IT teams are often small (2-5 people) with limited
  data science expertise. Solutions must be operable by OT (operational technology)
  engineers, not just data scientists.

## 6. Relevant Standards and Frameworks

- **ISO 55000 (Asset Management)**: Provides the governance framework for condition-based
  maintenance programs that anomaly detection supports. Adoption is growing among
  FDI factories but rare in local SMEs.
- **TPM (Total Productive Maintenance)**: Widely adopted in Japanese and Korean factories
  in Vietnam (Toyota, Samsung). Anomaly detection augments TPM pillar 3 (planned
  maintenance) by providing data-driven failure predictions.
- **ISO 17359 (Condition Monitoring)**: Specifies vibration and thermal monitoring
  procedures. Useful as a reference for sensor placement and data collection standards.
- **IEC 62443 (Industrial Cybersecurity)**: Critical for IIoT deployments; anomaly
  detection on network traffic can identify intrusion attempts on OT networks.

## 7. Practical Deployment Recommendations for Vietnam

1. **Start with high-value equipment**: Focus on machines where 1 hour of downtime
   costs > $10,000. In electronics, this is SMT lines; in steel, it is blast furnaces.
2. **Edge-first architecture**: Deploy inference on industrial PCs or edge gateways
   (e.g., NVIDIA Jetson, Advantech). Send only anomaly events and summary statistics
   to cloud, not raw sensor data.
3. **Phased rollout**: Pilot on 5-10 machines for 3 months to build trust, then scale.
   Vietnamese factory managers are pragmatic and need to see ROI before expanding.
4. **Local partnerships**: Work with system integrators like FPT IS, CMC SI, or
   Viettel Solutions who have existing factory relationships and OT expertise.
5. **Bilingual dashboards**: Vietnamese language UI is essential for operator adoption.
   Alert messages in Vietnamese with clear recommended actions increase response rates.
6. **ROI metrics to track**: Unplanned downtime reduction (target 30-50%), spare parts
   inventory optimization (target 20% reduction), and OEE improvement (target 5-10%).

---

*End of Manufacturing Domain Expert notes for B07.*
