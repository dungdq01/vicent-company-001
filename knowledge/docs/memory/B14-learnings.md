# Memory: B14 — Speech & Audio AI
## Ngày: 2026-03-31

---

## Tổng kết

B14 Speech & Audio AI hoàn thành nghiên cứu L3 depth với 16 agents. Verdict: **CONDITIONAL GO** tại 6.4/10.

## Điểm nổi bật

1. **Data Availability là bottleneck (5/10):** Vietnamese speech data cực hiếm — VIVOS chỉ 15 giờ, FPT.AI có 10,000+ giờ nhưng không public
2. **FPT.AI là đối thủ 800-pound gorilla:** 10+ năm kinh nghiệm Vietnamese speech, data moat khổng lồ
3. **Chiến lược đúng: KHÔNG xây ASR engine** — xây speech analytics platform trên FPT.AI/PhoWhisper
4. **Call center AI là beachhead ($80-120M TAM):** Cao nhất willingness to pay

## Bài học rút ra

1. **Đừng cạnh tranh trực tiếp FPT.AI về ASR:** Dùng API của họ hoặc PhoWhisper, đầu tư vào vertical intelligence
2. **Vietnamese tonal system (6 thanh) = ASR khó hơn:** WER 15-25% vs English 5-8%
3. **Speech analytics > Speech recognition:** Giá trị ở insight (sentiment, compliance, intent), không phải transcription
4. **GPU bắt buộc cho real-time:** T4 minimum, ~$200-500/tháng — cần tính vào pricing

## Agent mới

- **R-AE (Audio Engineer):** Lần đầu sử dụng — codec, noise reduction, echo cancellation, audio quality metrics
- **R-D10 (Telecom):** Lần đầu — Viettel/VNPT/Mobifone landscape, call center AI

## Files tạo ra

```
docs/reports/B14/ (16 files: 3 academic + 12 Layer 2 + 1 final CÓ DẤU)
data/baselines/B14-speech-audio.json (VI CÓ DẤU)
data/graph.json (B14 node + 7 edges)
docs/memory/B14-learnings.md (this file)
```
