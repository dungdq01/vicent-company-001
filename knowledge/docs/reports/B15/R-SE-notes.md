# Security Engineer Notes: Simulation & Digital Twin (B15)

## 1. Overview

Simulation and digital twin systems handle some of an organization's most sensitive assets: proprietary simulation models encode deep engineering knowledge, IoT data reveals operational details, and digital twins can be attack vectors to physical systems. The Security Engineer must protect intellectual property, ensure data integrity, and prevent simulation manipulation.

## 2. Intellectual Property Protection

### Simulation Models as Trade Secrets
- Simulation models encode years of R&D — treat them as crown jewels.
- Model encryption at rest (AES-256) and in transit (TLS 1.3).
- Access control: role-based permissions for model viewing, editing, and execution.
- Model obfuscation for deployed surrogates — prevent reverse engineering of neural network weights.
- Watermarking techniques for ML models to detect unauthorized copies.

### Code and Model Protection
- Encrypted model repositories with audit-logged access.
- No model downloads to personal devices — execution only in controlled environments.
- License management for commercial simulation software (ANSYS, COMSOL).
- NDAs and IP agreements for all personnel with model access.
- DLP (Data Loss Prevention) rules to block model file exfiltration.

## 3. Secure IoT Data Transmission

### Protocol Security
- **MQTT** — enforce TLS for all connections, use client certificates for device authentication.
- **OPC-UA** — use Security Mode: SignAndEncrypt with X.509 certificates.
- **HTTPS** — for REST-based device communication, enforce certificate pinning.

### Device Authentication
- Mutual TLS (mTLS) for device-to-cloud communication.
- Hardware security modules (HSM) or TPM for device identity and key storage.
- Device certificate rotation with automated renewal.
- Device provisioning with zero-touch onboarding (Azure DPS, AWS IoT Device Defender).

### Network Security
- Network segmentation: isolate OT (operational technology) network from IT network.
- DMZ between factory floor and cloud-connected systems.
- VPN or private connectivity (AWS Direct Connect, Azure ExpressRoute) for factory-to-cloud.
- IDS/IPS at OT-IT boundary for anomaly detection.

## 4. Access Control for Simulation Scenarios

### Permission Model
```
Roles:
  - Viewer:    Read scenario parameters and results
  - Analyst:   Create scenarios, run simulations, view results
  - Engineer:  Modify simulation models, calibrate parameters
  - Admin:     Manage users, configure system, delete data

Resources:
  - Simulation models (view, execute, modify)
  - Scenarios (create, read, update, delete, execute)
  - Results (read, export, delete)
  - Twin state (read, override)
```

- Attribute-based access control (ABAC) for fine-grained permissions (e.g., access only to specific asset twins).
- Project-based isolation: users see only their project's scenarios and results.
- Temporary elevated access with automatic expiration for troubleshooting.

## 5. Data Integrity for Digital Twin State

- **Immutable audit log** — every twin state change recorded with timestamp, source, and actor.
- **Hash chains** — cryptographic linking of sequential twin state updates for tamper detection.
- **Input validation** — reject sensor values outside physically plausible ranges.
- **Anomaly detection** — flag suspicious twin state changes (sudden jumps, impossible transitions).
- **Reconciliation** — periodic comparison of twin state with independent data sources.
- **Backup and recovery** — point-in-time recovery of twin state from time-series storage.

## 6. Compliance for Industrial Systems

### IEC 62443 (Industrial Cybersecurity)
- Zone and conduit model for network segmentation.
- Security levels (SL1-SL4) based on threat assessment.
- Secure development lifecycle for simulation software.
- Patch management for industrial control systems.
- Incident response plan specific to OT environments.

### Additional Standards
- **ISO 27001** — information security management system.
- **NIST Cybersecurity Framework** — identify, protect, detect, respond, recover.
- **Vietnam Cybersecurity Law (2018)** — data localization requirements for critical infrastructure.
- **Circular 09/2023/TT-BTTTT** — data protection requirements for Vietnamese digital services.

## 7. Preventing Simulation Manipulation

### Threat Scenarios
- Attacker modifies simulation parameters to produce misleading results (e.g., hide structural weakness).
- Compromised surrogate model returns incorrect predictions affecting physical operations.
- Manipulated twin state causes incorrect automated decisions (predictive maintenance false negatives).

### Countermeasures
- Digital signatures on simulation inputs, models, and outputs.
- Model integrity verification: hash comparison before every execution.
- Dual-execution: run critical simulations on independent systems and compare results.
- Human-in-the-loop for safety-critical decisions based on simulation results.
- Canary inputs: known test cases run periodically to verify model correctness.

## 8. Audit Logging

### Events to Log
- Simulation model uploads, modifications, deletions.
- Scenario creation, parameter changes, execution.
- Twin state overrides (manual interventions).
- Access to simulation results, especially exports.
- Authentication events (login, logout, failed attempts).
- Administrative actions (role changes, system configuration).

### Implementation
- Centralized logging with tamper-proof storage (append-only, write-once).
- Log forwarding to SIEM (Splunk, Elastic Security, Azure Sentinel).
- Retention: minimum 1 year for industrial compliance, 3+ years for critical infrastructure.
- Regular audit log review and automated alerting for suspicious patterns.

## 9. Recommendations

1. Classify simulation models as trade secrets and apply corresponding protection measures from day one.
2. Enforce mTLS for all IoT device communication — device identity is the foundation of twin data integrity.
3. Implement IEC 62443 zone model for any deployment in industrial environments.
4. Log every simulation execution with full parameter capture — reproducibility and accountability.
5. Deploy canary inputs for continuous model integrity verification.
6. Comply with Vietnamese Cybersecurity Law requirements for data localization when handling critical infrastructure data.
