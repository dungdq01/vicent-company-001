# Security Engineer Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

Prediction systems handle sensitive data (financial records, personal information, health data) and produce consequential outputs (credit decisions, insurance pricing, fraud flags). The Security Engineer must address model fairness, adversarial robustness, data privacy, secure serving, and regulatory compliance — especially critical in Vietnam's finance and insurance sectors.

## 2. Model Fairness and Bias Auditing

### Sources of Bias in Tabular ML
- Historical bias: training data reflects past discriminatory decisions.
- Representation bias: underrepresented groups in training data (rural populations, ethnic minorities).
- Proxy variables: features like postal code or education level may correlate with protected attributes.
- Label bias: ground truth labels may themselves be biased (e.g., loan defaults reflect past lending criteria).

### Fairness Metrics
- Demographic parity: prediction rates equal across groups.
- Equal opportunity: true positive rates equal across groups.
- Predictive parity: precision equal across groups.
- Disparate impact ratio: should be >0.8 (four-fifths rule).

### Auditing Tools
- Fairlearn (Microsoft): bias detection and mitigation algorithms.
- AIF360 (IBM): comprehensive fairness toolkit.
- Conduct audits before deployment and on ongoing predictions.
- Document fairness metrics in model cards.

## 3. Adversarial Attacks on Tabular Models

### Attack Types
- **Feature manipulation**: adversaries alter input features to change predictions (e.g., inflating income on a loan application).
- **Model evasion**: crafting inputs that fall on the decision boundary to evade detection.
- **Data poisoning**: injecting malicious training data to corrupt model behavior.

### Defenses
- Input validation: range checks, consistency checks (income vs employment status).
- Anomaly detection on inputs: flag inputs that are statistical outliers.
- Rate limiting: prevent automated probing of the model API.
- Robust training: adversarial training, feature perturbation during training.
- Cross-referencing: validate self-reported features against external data sources.

## 4. PII in Training Data

### Identification
- Scan training datasets for PII: names, national IDs (CCCD/CMND), phone numbers, addresses, emails.
- Use automated PII detection tools (Presidio, custom regex for Vietnamese ID formats).
- Vietnamese national IDs: 9-digit (old CMND) and 12-digit (new CCCD) formats.

### Protection
- Anonymization: remove direct identifiers before training.
- Pseudonymization: replace IDs with hashed tokens (reversible only with key).
- Differential privacy: add noise during training (limited practical use for tabular GBDT).
- Feature engineering should not create re-identifiable features.
- Data minimization: only include features necessary for the prediction task.

## 5. Model Inversion Attacks

- Attackers use model outputs to infer training data or sensitive features.
- Tabular models are vulnerable: feature importance + prediction probing can reveal individual records.
- Mitigation: limit API response information (do not expose raw probabilities with high precision).
- Round predictions to 2 decimal places; do not expose SHAP values to unauthenticated users.
- Rate limit prediction API calls per user/IP.
- Membership inference: attacker determines if a specific record was in the training data.

## 6. Secure Model Serving

### API Security
- Authentication: API keys or OAuth2/JWT tokens for all prediction endpoints.
- Authorization: role-based access (who can predict, who can retrain, who can view explanations).
- TLS encryption for all API traffic (mandatory, no exceptions).
- Input sanitization: prevent SQL injection via feature values (if features are used in DB queries).

### Model Artifact Security
- Encrypt model files at rest (S3 server-side encryption, KMS-managed keys).
- Access control on model registry (only ML engineers can push, only CI/CD can deploy).
- Sign model artifacts to detect tampering.
- Audit log for model downloads and deployments.

### Infrastructure Security
- Run model serving in private subnets; expose only through API gateway.
- Network segmentation: model servers should not have direct database access.
- Container scanning: scan Docker images for vulnerabilities before deployment.

## 7. Compliance

### Credit Scoring Regulations (Vietnam)
- State Bank of Vietnam (SBV) regulations on credit scoring and lending decisions.
- CIC (Credit Information Center) provides official credit reports; ML models supplement, not replace.
- Explainability requirement: borrowers may request reasons for credit denial.
- Data retention: credit data must be retained for regulated periods.

### PDPA (Vietnam's Personal Data Protection Decree)
- Decree 13/2023/ND-CP on personal data protection.
- Consent required for data collection and processing.
- Data subject rights: access, correction, deletion.
- Cross-border data transfer restrictions.
- Data processing impact assessment required for high-risk processing.

### Industry-Specific
- Insurance: Ministry of Finance regulations on pricing and risk assessment.
- Healthcare: patient data protection under health information regulations.
- Banking: Basel II/III compliance for risk models; model validation requirements.

## 8. Audit Logging for Predictions

### What to Log
- Every prediction: input features, output prediction, model version, timestamp, user/tenant ID.
- Explanation requests: who accessed SHAP values and when.
- Model changes: version promotions, retraining triggers, configuration changes.
- Data access: who accessed training data, feature stores.

### Log Requirements
- Immutable: use append-only storage (S3, write-once database).
- Retention: minimum 5 years for financial predictions, 7 years for insurance.
- Searchable: index by entity_id, date range, model version for regulatory inquiries.
- Tamper-evident: hash chains or signed log entries.

### Finance and Insurance Specifics
- Credit decisions must be fully reproducible: same input + same model version = same output.
- Regulators may request prediction audit for specific customers.
- Insurance pricing decisions must be justifiable and non-discriminatory.

## 9. Recommendations

1. Conduct fairness audits before every production deployment; document results in model cards.
2. Implement strict PII scanning in data pipelines; block training if PII is detected in feature columns.
3. Never expose raw SHAP values or high-precision probabilities to unauthenticated users.
4. Log every prediction immutably; this is a regulatory requirement in finance and insurance.
5. Follow Vietnam's Decree 13/2023 on personal data protection; ensure consent and data subject rights.
6. Validate inputs at the API layer to defend against feature manipulation attacks.
7. Encrypt model artifacts at rest and in transit; control access via IAM policies.
