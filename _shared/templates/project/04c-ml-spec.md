---
file: 04c-ml-spec
project_id: {{PROJECT_ID}}
phase: P4c
filled_by: R-MLE / R-DLE / R-NLP / R-CVE (per task type)
last_updated: {{P4_DATE}}
status: draft | reviewed | signed
required: only if ML/AI in scope
---

# {{PROJECT_NAME}} — ML / AI Algorithm Specification

> P4c deliverable. **CEO + CTO sign-off mandatory** (R-EXE-09 · R-MAS-04 anti-FOMO). Skipped if no ML in scope.

---

## 0. Document Control

- **Author**: [Fill: R-MLE / R-DLE / R-NLP / R-CVE]
- **Reviewers**: CTO · CEO · R-D{{INDUSTRY}} (domain validation)
- **Eval**: [Fill ≥ 7.5]
- **CEO sign**: [Fill name · date] (anti-FOMO confirmation)

---

## 1. Task Definition

### 1.1 Business Goal
[Fill: 1 sentence · what business outcome ML enables]

### 1.2 ML Task Type
- [ ] Classification
- [ ] Regression
- [ ] Forecasting (time-series)
- [ ] Clustering
- [ ] Anomaly detection
- [ ] Recommendation
- [ ] NLP (extraction · summarization · classification · generation)
- [ ] Computer vision (detection · segmentation · classification · OCR)
- [ ] LLM application (RAG · agent · structured extraction)
- [ ] Other: [Fill]

### 1.3 Why ML (vs Rules / Heuristics)
[Fill: justify ML over simpler approach · per R-DLE card "need-check"]

💡 Hint: Default = simplest works. Use ML only when pattern complexity justifies.

---

## 2. Approach

### 2.1 Recommended Approach
[Fill: specific algorithm/model · with citation]

### 2.2 Alternatives Considered

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| [Fill] | ... | ... | rejected because ... |
| [Fill] | ... | ... | **selected** |

### 2.3 Foundation Model (if applicable)
- **Base model**: [Fill: e.g., Llama-3-8B · Claude Sonnet · CLIP · YOLO-v8]
- **Open vs proprietary**: [Fill rationale per R-DLE card]
- **Fine-tuning strategy**: [Fill: LoRA / QLoRA / full FT / prompt-only]

---

## 3. Data

### 3.1 Training Data
- **Source**: [Fill]
- **Volume**: [Fill: rows · time range · classes]
- **Labeling**: [Fill: existing labels · need new annotation? agreement κ?]
- **Splits**: train / val / test (e.g., 70/15/15) · time-aware split for forecasting

### 3.2 Data Quality
- **Completeness**: [Fill %]
- **Class imbalance**: [Fill ratio · mitigation strategy]
- **Outliers**: [Fill: detection + handling]
- **Drift potential**: [Fill: how data may shift over time]

### 3.3 Features (Classical ML)
| Feature | Type | Source | Engineering |
|---|---|---|---|
| [Fill] | numeric / categorical / text | [Fill] | [Fill: log · one-hot · embedding] |

### 3.4 Augmentation (if applicable)
[Fill: realistic distribution match per R-CVE-card]

### 3.5 Privacy / PII Handling
[Fill: per R-SEC-07 · masking · minimization]

---

## 4. Model Architecture

### 4.1 Architecture Description
[Fill: layer-by-layer if custom · or "fine-tuned [base model] with [head]"]

### 4.2 Hyperparameters
| Parameter | Value | Rationale |
|---|---|---|
| Learning rate | [Fill] | [Fill] |
| Batch size | [Fill] | [Fill] |
| Epochs | [Fill] | [Fill] |
| [Fill more] | ... | ... |

### 4.3 Compute Plan
- **Training compute**: [Fill: GPU type · hours · cost]
- **Inference compute**: [Fill: CPU vs GPU · per-request cost]

---

## 5. Evaluation

### 5.1 Metrics
| Metric | Target | Why this metric |
|---|---|---|
| [Fill: e.g., MAPE] | [< 15%] | [business KPI alignment] |
| [Fill: F1] | [≥ 0.85] | [class imbalance handling] |

### 5.2 Eval Sets
- **Validation set**: [Fill]
- **Test set**: holdout · NOT seen during training
- **Adversarial set**: [Fill ≥ 3 cases per R-DLE card]
- **OOD (out-of-distribution) set**: [Fill]
- **Production drift set** (refreshed): [Fill]

### 5.3 Eval Pipeline
[Fill: how eval runs · CI integration · alerting on regression]

### 5.4 Human Eval (for generative tasks)
[Fill: per R-DLE card · golden set with human-verified outputs]

---

## 6. LLM-Specific (if applicable)

### 6.1 Prompt Strategy
[Fill: zero-shot · few-shot · CoT · structured output]

### 6.2 Prompt Versioning
- **System prompt**: [`./prompts/system-v1.md`](./prompts/system-v1.md)
- **Promotion gate**: per R-QAL-07 (≥ +0.3 · 0 regression · ≥ 3 projects)

### 6.3 Output Schema
[Fill: JSON schema · zod · pydantic]

### 6.4 Hallucination Guards
[Fill per R-MAS-06 + R-SEC-08]

### 6.5 Cost Per Inference
- **Token in**: [Fill]
- **Token out**: [Fill]
- **Cost / call**: [Fill USD]
- **Daily volume**: [Fill]
- **Monthly cost**: [Fill]

---

## 7. Inference

### 7.1 Latency Target
- **p50**: [Fill]
- **p95**: [Fill]
- **p99**: [Fill]

### 7.2 Serving
- **Runtime**: [Fill: vLLM · TGI · ONNX · API]
- **Batching**: [Fill: dynamic batching · batch size]
- **Quantization**: [Fill: 4-bit · 8-bit · none]
- **Edge deployment**: [Fill if mobile/IoT]

### 7.3 Caching
[Fill: where caching helps · invalidation strategy]

---

## 8. Failure Modes

| Mode | Likelihood | Detection | Mitigation |
|---|---|---|---|
| Class drift | M | weekly distribution check | retrain trigger |
| Adversarial input | L | input validation | reject + log |
| [Fill ≥ 5] | ... | ... | ... |

→ Cross-ref `@../../eval/failure-modes.md`.

---

## 9. Monitoring (Post-Launch)

### 9.1 Live Metrics
| Metric | Frequency | Alert threshold |
|---|---|---|
| Model accuracy (proxy) | daily | drop > 5% |
| Inference latency p95 | real-time | > target |
| Cost / day | daily | > 130% baseline |
| Output distribution | weekly | KS test alert |

### 9.2 Retraining Trigger
[Fill: data drift threshold · accuracy drop · time-based]

### 9.3 Rollback Plan
[Fill: how to revert to previous model version]

---

## 10. Anti-FOMO Confirmation

- [ ] Recommended approach is **simplest that meets target** (per R-MAS-04)
- [ ] Foundation model > from-scratch (per R-DLE-card)
- [ ] Eval set includes adversarial + OOD
- [ ] Cost projected at 10× volume — sane
- [ ] LLM model = cheapest passing (per R-STK-03)
- [ ] CEO + CTO sign on rationale

---

## 11. Sign-Off

- **R-MLE/DLE/NLP/CVE eval**: [Fill]
- **CTO**: [Fill]
- **CEO** (anti-FOMO): [Fill]
- **R-D{{INDUSTRY}} domain validation**: [Fill]

---

## Cross-References

- PRD §9: [`04-prd.md`](04-prd.md)
- DB tables (predictions): [`04b-db-schema.md`](04b-db-schema.md) §13
- API (ML endpoints): [`04a-api-design.md`](04a-api-design.md) §9
- QA golden set: [`07-qa-plan.md`](07-qa-plan.md)
- Cost budgets: [`@../../standards/cost-budgets.md`](../../standards/cost-budgets.md)

---
*Template v1.0*
