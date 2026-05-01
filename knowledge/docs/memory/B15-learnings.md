# Memory: B15 — Simulation & Digital Twin
## Ngày: 2026-03-31

---

## Tổng kết

B15 Simulation & Digital Twin — **BASELINE CUỐI CÙNG** — hoàn thành nghiên cứu L3 depth với 16 agents. Verdict: **CONDITIONAL GO** tại 5.6/10.

## Điểm nổi bật

1. **Vietnam Industry 4.0 gap là rào cản lớn nhất:** Đa số nhà máy VN ở Step 1 (basic digitization), digital twin cần Step 5
2. **DES (SimPy) > Physics-based Twin:** Bắt đầu với discrete event simulation cho process optimization, KHÔNG phải physics/3D
3. **FDI factories là beachhead duy nhất:** Samsung, Foxconn có IoT infra — local manufacturers chưa sẵn sàng
4. **Services business, không phải SaaS:** Mỗi deployment là custom engineering project

## Bài học rút ra

1. **SimPy trong 4-6 tuần PoC:** Chứng minh giá trị nhanh, không phải 12-18 tháng physics twin
2. **IoT infra là prerequisite:** Không có sensors → không có digital twin. Cần assess IoT maturity trước
3. **R-PE (Performance Engineer) lần đầu dùng:** Simulation = compute-heavy, cần profiling + parallelization
4. **Energy (EVN) là vertical tiềm năng:** Hydropower optimization, solar forecasting — VN có nhu cầu thực

## Agent team

R-α, R-β, R-γ, R-MLE, R-DE, R-DLE, R-PE, R-BE, R-FE, R-DO, R-SE, R-QA, R-SA, R-D04, R-D07, R-σ

## Files tạo ra

```
docs/reports/B15/ (16 files: 3 academic + 12 Layer 2 + 1 final CÓ DẤU)
data/baselines/B15-simulation-digital-twin.json (VI CÓ DẤU)
data/graph.json (B15 node + 8 edges)
docs/memory/B15-learnings.md (this file)
```
