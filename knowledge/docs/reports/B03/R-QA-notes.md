# QA Engineering Notes: B03 Computer Vision
## By R-QA — Date: 2026-03-31

---

### 1. CV Model Testing Strategy

A robust CV testing strategy operates across three layers:

**Unit Tests — Preprocessing Pipeline**
Each preprocessing step must be tested in isolation: image resizing, normalization (mean/std subtraction), color space conversion (BGR to RGB), augmentation transforms, and DICOM-to-tensor conversion for medical pipelines. Use deterministic seeds for all augmentation tests. Assert output tensor shapes, value ranges (e.g., [0,1] or [-1,1]), and dtype consistency (float32 vs float16 for mixed-precision inference).

**Integration Tests — Inference Pipeline**
Test the full path: raw input → preprocessing → model forward pass → postprocessing → output struct. Mock the model to isolate preprocessing bugs. Use fixture images covering edge cases: single-object, crowded scenes, near-empty frames, and corrupted files. Assert that bounding box coordinates are within image bounds and that confidence scores sum to expected values for classification heads.

**Regression Tests — Model Updates**
Maintain a golden dataset of ~500 curated images with known ground-truth labels. On every model checkpoint promotion, run this dataset and assert that mAP does not drop more than 1% from the previous approved version. Store per-class performance diffs in CI artifacts for audit trails. This is especially critical in medical imaging where a regression in a specific pathology class (e.g., pneumothorax) must block deployment regardless of overall metric improvement.

---

### 2. Evaluation Metrics Guide

**Classification**
- Top-1 / Top-5 Accuracy: primary for single-label benchmarks (ImageNet-style)
- F1 Score (macro/weighted): essential for imbalanced classes — use weighted-F1 as the primary gate for Vietnamese retail SKU classification where long-tail products dominate
- AUC-ROC: threshold-independent; useful when operating point is not yet fixed (e.g., triage systems)
- Confusion Matrix: mandatory artifact — report per-class recall to detect demographic or product-category blind spots

**Object Detection**
- mAP@0.5: standard gate for most production systems
- mAP@0.5:0.95 (COCO metric): stricter; required for autonomous and safety-critical applications
- Precision-Recall Curve: evaluate at multiple operating points before selecting NMS threshold
- NMS Sensitivity Test: vary IoU threshold from 0.3 to 0.7 and report mAP variance — high variance signals fragile predictions

**Segmentation**
- IoU / Jaccard Index: primary metric; report both mean-IoU and per-class IoU
- Dice Coefficient: preferred in medical imaging; more sensitive to small structures (lesions, nodules)
- Pixel Accuracy: misleading on imbalanced datasets (background class dominates) — use only as secondary metric

**Face Recognition**
- FAR (False Accept Rate): fraction of impostors incorrectly accepted
- FRR (False Rejection Rate): fraction of genuine users incorrectly rejected
- EER (Equal Error Rate): operating point where FAR = FRR; lower is better
- For Vietnam deployments: test FAR/FRR separately across age groups and skin tone ranges to detect demographic skew

---

### 3. Robustness Testing

Generate a systematic corruption test suite using the ImageNet-C protocol (19 corruption types, 5 severity levels). Priority corruptions for Vietnamese deployment contexts:
- **Blur**: motion blur from handheld mobile cameras; defocus blur in warehouse scanning
- **Noise**: sensor noise in low-cost IoT cameras (common in wet markets and small retailers)
- **Occlusion**: partially blocked products on shelves; face masks (still prevalent in healthcare)
- **Lighting**: harsh shadows in outdoor markets; fluorescent flicker in hospitals
- **Compression artifacts**: JPEG artifacts from mobile uploads at low bandwidth

Report mPC (mean Performance under Corruption) alongside clean accuracy. A model with 92% clean accuracy but 60% mPC is not production-ready for Vietnam's diverse deployment environments.

**Adversarial Testing**: Run FGSM and PGD attacks at epsilon = 4/255 and 8/255. For safety-critical systems (medical, access control), report certified robustness radius using randomized smoothing.

---

### 4. Bias & Fairness Testing

**Demographic Parity — Face Recognition**
Partition the test set by gender, age bracket (18-30, 31-50, 51+), and skin tone (ITA score ranges). Report FAR and FRR per subgroup. Flag any subgroup where EER deviates more than 2 percentage points from the overall EER.

**Class Imbalance Detection**
Before training, generate a class frequency histogram. Flag classes with fewer than 50 samples as "low-confidence classes." Require separate per-class precision/recall reporting in all evaluation runs. In Vietnamese retail, imported product SKUs are frequently underrepresented relative to domestic brands.

**Geographic Bias**
For models trained on global datasets and deployed in Vietnam: test on a Vietnam-local holdout set. Models trained on Western retail shelf datasets show measurable mAP drops on Vietnamese packaging styles (different typography, color palette, product dimensions). Document this gap explicitly before recommending a base model.

---

### 5. Performance Benchmarking

Define SLOs per deployment tier:

| Tier | P50 Latency | P99 Latency | Throughput | GPU Util Target |
|------|------------|------------|-----------|----------------|
| Edge (Jetson Nano) | 80ms | 200ms | 5 fps | 85% |
| Cloud GPU (T4) | 15ms | 50ms | 60 fps | 70% |
| Mobile (on-device) | 120ms | 350ms | 8 fps | N/A |

Measure GPU memory high-water mark under maximum batch size. Report model size (MB), FLOPs, and parameter count as secondary artifacts. For Vietnam cloud deployments (typically AWS ap-southeast-1 or local providers like Viettel IDC), measure round-trip latency including network overhead.

---

### 6. CI/CD Quality Gates

Define hard gates that block promotion to staging:
- mAP must not drop more than 1% from the current production model
- P99 latency must not exceed the SLO for the target deployment tier
- No regression on any fairness subgroup metric beyond 2 percentage points
- Robustness mPC must be within 5% of baseline

Soft gates (trigger review but do not block):
- Confusion matrix shows a new class pair with >10% confusion
- GPU memory usage increases by more than 15%

Automate with GitHub Actions or GitLab CI. Store all evaluation artifacts (metrics JSON, confusion matrix PNG, PR curves) as CI artifacts with 90-day retention for audit.

---

### 7. Production Monitoring Checklist

**Data Drift Alerts**
- Monitor input image statistics (mean brightness, contrast, resolution distribution) with a sliding 24-hour window
- Alert if input distribution shifts more than 2 standard deviations from training distribution baseline

**Prediction Drift Alerts**
- Monitor confidence score distribution daily; a shift toward low-confidence predictions signals distribution shift
- Alert on sudden drops in detection rate (may indicate camera occlusion or lighting failure)

**Infrastructure Alerts**
- GPU utilization consistently above 90% for more than 5 minutes: scale trigger
- Inference queue depth exceeding 100 items: scale trigger or circuit-breaker
- Model serving pod OOM: immediate page with full memory profile

**Business Metric Correlation**
Link CV system metrics to downstream business KPIs (e.g., checkout throughput, diagnostic turnaround time) — alert when CV metrics are healthy but business KPIs degrade, as this signals a downstream integration failure.
