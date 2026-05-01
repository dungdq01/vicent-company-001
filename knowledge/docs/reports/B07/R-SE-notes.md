# Security Engineer Notes: Anomaly Detection & Monitoring (B07)
## By Security Architect (R-SE) — Date: 2026-03-31

### 1. Anomaly Detection FOR Security (SIEM, IDS/IPS)

**SIEM integration (Splunk, Microsoft Sentinel, Elastic SIEM):**
- Anomaly detection models augment rule-based SIEM detection with behavioral baselines
- Feed ML anomaly scores as enrichment fields into SIEM events
- Use cases: impossible travel detection, abnormal data exfiltration volumes, lateral movement patterns, anomalous authentication sequences
- Integration pattern: anomaly scoring microservice consumes SIEM event stream via Kafka, enriches events with scores, writes back to SIEM index

**Network IDS/IPS:**
- ML-based anomaly detection catches zero-day attacks that signature-based IDS misses
- Feature engineering: packet size distributions, protocol usage patterns, connection frequency, DNS query patterns
- Zeek (formerly Bro) + ML pipeline: Zeek generates structured network logs, ML scores them
- Challenge: extremely high throughput (10Gbps+ networks generate millions of events/sec). Use pre-filtering with lightweight statistical checks, then deep-score suspicious traffic.

**User and Entity Behavior Analytics (UEBA):**
- Build per-user behavioral baselines: login times, accessed resources, data volumes, peer group comparison
- Anomaly = deviation from personal baseline AND deviation from peer group
- Composite risk scoring: aggregate multiple weak signals into a unified risk score per user
- Critical for insider threat detection

**Endpoint Detection and Response (EDR):**
- Process behavior anomalies: unusual parent-child process relationships, rare executables, anomalous system call sequences
- File system anomalies: mass file encryption (ransomware), unusual file access patterns
- ML models deployed at edge (on endpoint) for low-latency detection

### 2. Adversarial Attacks on Anomaly Detectors

**Evasion attacks:**
- Attacker crafts inputs that are anomalous but score as normal
- Gradient-based evasion: if model is differentiable, compute gradient of anomaly score and perturb input to minimize it
- Mimicry attacks: attacker studies normal patterns and disguises malicious activity to match

**Poisoning attacks:**
- Attacker injects carefully crafted data during training to shift the normal baseline
- Particularly dangerous for online/incremental learning systems that continuously ingest data
- Slow poisoning: gradually shift baseline over weeks so anomalous behavior becomes "normal"

**Model inversion/extraction:**
- Attacker queries scoring API repeatedly to reverse-engineer the model
- With enough queries, can approximate the decision boundary and craft evasion strategies

**Defenses:**
- **Ensemble diversity**: Harder to evade multiple models simultaneously. Use models from different families.
- **Input validation**: Reject inputs outside physically plausible ranges before scoring.
- **Rate limiting on scoring API**: Prevents model extraction via exhaustive querying.
- **Robust training**: Adversarial training (include perturbed examples), trimmed statistics (ignore extremes during training).
- **Training data validation**: Detect and quarantine suspicious training samples. Use robust statistics (median-based rather than mean-based).
- **Model watermarking**: Embed identifiable patterns to detect if model is stolen.
- **Canary inputs**: Inject known-anomalous test points periodically; if they stop being detected, the model may be compromised.

### 3. Data Privacy in Anomaly Systems

**PII handling:**
- Anomaly detection often requires sensitive data (transaction amounts, locations, behavior patterns)
- Implement data minimization: only ingest features necessary for detection, not raw PII
- Pseudonymization: replace entity IDs with consistent pseudonyms. Reversible only by authorized key holders.
- Feature engineering on raw data, then discard raw data. Store only derived features.

**Differential privacy:**
- Add calibrated noise to aggregate statistics used in anomaly detection
- Tradeoff: privacy budget vs detection accuracy. For most enterprise use cases, epsilon = 1-10 is practical.
- Apply to training data, not inference (inference on individual events needs precision).

**Data residency:**
- Vietnam data localization: Decree 13/2023/ND-CP requires certain categories of data to be stored in-country
- Multi-region anomaly systems must respect data residency: train models locally or use federated learning
- Log and audit all cross-border data transfers

**Right to erasure (GDPR, PDPA):**
- Must be able to delete individual's data from training sets and retrain
- Design feature stores with entity-level deletion capability
- Machine unlearning: retrain model excluding deleted data, or use approximate unlearning techniques

### 4. Secure Model Deployment

**Model artifact security:**
- Sign model artifacts with GPG or Sigstore/Cosign
- Verify signatures before loading models in serving infrastructure
- Store models in access-controlled registries (not public S3 buckets)
- Encrypt model artifacts at rest (S3 SSE-KMS)

**Serving infrastructure hardening:**
- Run model serving containers as non-root, read-only filesystem
- Network policies: scoring service only communicates with feature store and API gateway
- No SSH access to model serving pods; use kubectl exec with RBAC for debugging
- Secrets management: model API keys, database credentials via Vault or cloud KMS

**Supply chain security:**
- Pin all ML library versions (PyTorch, scikit-learn, numpy)
- Scan container images for CVEs (Trivy, Grype)
- Use distroless or minimal base images
- SBOM (Software Bill of Materials) for model serving containers

**Access control:**
- RBAC on model management: data scientists can deploy to staging, only CI/CD can promote to production
- Audit log all model version changes, threshold adjustments, alert rule modifications
- MFA required for any production model management action

### 5. Compliance Requirements

**SOC 2 Type II:**
- Logging: all anomaly detection decisions must be auditable (who was flagged, why, what action taken)
- Change management: model updates follow documented change control process
- Monitoring: continuous monitoring of the anomaly detection system itself
- Access controls: role-based access to anomaly data and alert management

**ISO 27001:**
- Risk assessment: document threats to the anomaly detection system itself
- Asset management: model artifacts, training data, feature stores as information assets
- Incident management: anomaly alerts feed into incident response process
- Business continuity: DR plan for anomaly detection infrastructure

**PCI DSS (if processing payment data):**
- Requirement 10: logging and monitoring of all access to cardholder data
- Anomaly detection on payment systems must not store full PAN in feature snapshots
- Network segmentation: scoring service handling payment data in CDE (Cardholder Data Environment)
- Quarterly vulnerability scans of scoring infrastructure

**Vietnam Cybersecurity Law (2018) and Decree 13/2023:**
- Data localization requirements for specific data categories
- Mandatory cybersecurity incident reporting within 24 hours
- Anomaly detection systems processing Vietnamese citizen data must comply with local storage requirements

### Recommendations for B07

1. **Assume adversarial environment**. Any internet-facing anomaly detector will be probed. Design defenses from the start, not as an afterthought.
2. **Ensemble models are a security feature**, not just an accuracy feature. Diverse models are harder to simultaneously evade.
3. **Implement canary inputs** — synthetic known-anomalies injected periodically to verify the system is working. If canaries pass undetected, investigate immediately.
4. **Separate PII from features** in storage. Feature stores should contain derived values, not raw PII. This simplifies compliance and reduces breach impact.
5. **Sign and verify model artifacts**. An attacker who can replace your anomaly detection model owns your security monitoring.
6. **Audit everything**: model changes, threshold changes, alert dismissals, feedback labels. SOC 2 and ISO 27001 require it, and it is essential for trust in the system.
