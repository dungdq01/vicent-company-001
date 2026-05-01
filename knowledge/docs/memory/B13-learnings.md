# Memory: B13 — Tabular ML & Predictive Analytics
## Ngày: 2026-03-31

---

## Tổng kết

B13 Tabular ML hoàn thành nghiên cứu L3 depth với 16 agents. Verdict: **CONDITIONAL GO** tại **8.5/10** — điểm cao nhất portfolio MAESTRO, vượt B06 (8.4) và B12 (8.0).

## Điểm nổi bật

1. **Tech Feasibility 9/10 + Vietnam Fit 9/10:** XGBoost/LightGBM mature 10+ năm, KHÔNG cần GPU, chạy trên mọi laptop
2. **Data Availability 8/10 (cao nhất):** Dữ liệu bảng tồn tại trong mọi ERP/CRM/database — không cần thu thập đặc biệt
3. **"Boring but effective":** Khó bán hơn GenAI hype nhưng ROI chứng minh được ngay
4. **Revenue foundation:** Deploy B13 trước — nó de-risk và accelerate mọi baseline khác

## Bài học rút ra

1. **Data quality > model complexity:** Dữ liệu doanh nghiệp VN thường kém — cleaning chiếm 70% effort
2. **SHAP bắt buộc:** NHNN yêu cầu explainability cho credit scoring (Circular 13/2018)
3. **AutoGluon là default choice:** Stacking ensemble tự động, beat single model 95% trường hợp
4. **Small data common:** Nhiều DN VN chỉ có 100-10K rows — GBDT vẫn work, deep tabular không
5. **Excel culture:** Rào cản lớn nhất không phải tech mà là change management

## Agent team

R-α, R-β, R-γ, R-MLE, R-DE, R-DA, R-DBE, R-BE, R-FE, R-DO, R-SE, R-QA, R-SA, R-D02, R-D15, R-σ

## Domain experts

- **R-DA (Data Analyst):** Lần đầu sử dụng — EDA, statistical profiling, visualization
- **R-D15 (Insurance):** Lần đầu sử dụng — risk scoring, claims prediction, VN insurance market

## Files tạo ra

```
docs/reports/B13/ (16 files: 3 academic + 12 Layer 2 + 1 final CÓ DẤU)
data/baselines/B13-tabular-ml.json (VI CÓ DẤU)
data/graph.json (B13 node + 8 edges)
docs/memory/B13-learnings.md (this file)
```
