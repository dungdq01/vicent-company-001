# Memory: B07 — Anomaly Detection & Monitoring
## Date: 2026-03-31

---

## Tong ket

B07 Anomaly Detection & Monitoring hoan thanh nghien cuu L3 depth voi 15 agents (3 academic + 11 practical + 1 consolidation). Verdict: **CONDITIONAL GO** tai 7.3/10.

## Diem noi bat

1. **Market Demand cao nhat (9/10):** Fraud detection ngan hang ($200M+ ton that/nam), predictive maintenance (8,000+ nha may), e-commerce anomaly (2.5 ty buu kien/nam)
2. **Data Availability la thach thuc lon (6/10):** Du lieu anomaly co nhan cuc ky hiem tai VN. Phuong phap unsupervised la bat buoc nhung false positive rate 30-50%
3. **Tech stack hoan toan open-source:** PyOD (40+ algorithms), Alibi Detect (production), Kafka+Flink (streaming), PyTorch (deep models)
4. **Beachhead vertical:** Ngan hang — bat dau voi batch fraud detection cho 2-3 ngan hang trung binh Q2 2026

## Bai hoc rut ra

1. **Batch-first, streaming-later:** R-gamma challenge dung — streaming architecture phuc tap va dat, bat dau batch nightly la du cho 80% use cases
2. **Explainability tu ngay 1:** SHAP/LIME bat buoc — ngan hang VN khong chap nhan "hop den" cho fraud decisions (NHNN compliance)
3. **Feedback loop la critical:** Khong co human feedback → model degrade trong vai tuan. Can thiet ke feedback UI tu dau
4. **Alert fatigue la risk #1:** False positive qua nhieu → nguoi dung ignore alerts → bo lot true positive. Dynamic thresholds + severity levels la giai phap

## Agent team

| Layer | Agents | Output |
|-------|--------|--------|
| Layer 1 | R-alpha, R-beta, R-gamma | research/tech/feasibility reports |
| Layer 2 | R-DE, R-MLE, R-DLE, R-DA, R-BE, R-DO, R-SE, R-QA, R-SA, R-D02, R-D04 | 11 practical notes |
| Layer 3 | R-sigma | final-report.md + B07-anomaly-detection.json |
| Step A5 | R-BE (normalizer) | Production-ready JSON |

## Domain experts moi

- **R-D02 (Finance):** Fraud detection landscape VN, AML/KYC regulations, e-wallet fraud patterns
- **R-D04 (Manufacturing):** Predictive maintenance, sensor anomaly, IIoT integration challenges VN

## Lien ket cross-domain

- B07 ↔ B01: Forecast residual = anomaly signal
- B07 ↔ B03: Vision anomaly detection (defect, surveillance)
- B07 ↔ B04: Log/text anomaly detection
- B07 ↔ B13: Tabular features cho anomaly scoring
- B07 ↔ B06: Monitor optimization system health

## Files tao ra

```
docs/reports/B07/
  research-report.md        (R-alpha, EN)
  tech-report.md            (R-beta, EN)
  feasibility-report.md     (R-gamma, EN)
  final-report.md           (R-sigma, VI)
  R-DE-notes.md             (Layer 2, EN)
  R-MLE-notes.md            (Layer 2, EN)
  R-DLE-notes.md            (Layer 2, EN)
  R-DA-notes.md             (Layer 2, EN)
  R-BE-notes.md             (Layer 2, EN)
  R-DO-notes.md             (Layer 2, EN)
  R-SE-notes.md             (Layer 2, EN)
  R-QA-notes.md             (Layer 2, EN)
  R-SA-notes.md             (Layer 2, EN)
  R-D02-notes.md            (Layer 2, EN)
  R-D04-notes.md            (Layer 2, EN)

data/baselines/B07-anomaly-detection.json  (VI, production-ready)
data/graph.json                            (updated: B07 L3 + 6 edges)
docs/memory/B07-learnings.md               (this file)
```
