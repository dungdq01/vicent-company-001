# workflows/ — Step-by-Step Operating SOPs

**Parent**: [`@../README.md`](../README.md) · **Layer**: L3 Experience

---

## Purpose

Các file trong folder này trả lời câu hỏi **"đầu tuần/đầu ngày/khi có X xảy ra, tôi làm gì trước, làm gì sau?"** — tức là SOP *thao tác* cho con người + orchestrator, chứ không phải spec pipeline.

Khác biệt với các folder khác:

| Folder | Câu hỏi nó trả lời | Ví dụ |
|---|---|---|
| `pipeline/` (P0–P9) | Phase N này input/output/DoD là gì? | P4 design dispatch những agent nào |
| `pipelines-business/` | Business process này có các bước nào? | Sales S0→S5 |
| **`workflows/` (đây)** | **Thao tác cụ thể trong 1 ngày/tuần/sự cố** | Sáng mở máy làm gì đầu tiên? |
| `quality/` | Gate nào phải pass? | Eval ≥ 7.5 |
| `agents/` | Agent vận hành ra sao nội tại? | Context loading rule |

---

## File Index

| # | File | Dùng khi | Đọc/Review |
|---|---|---|---|
| W00 | `README.md` (this) | Navigate | — |
| W01 | [`W01-daily-operating-rhythm.md`](W01-daily-operating-rhythm.md) | Mỗi ngày làm việc | Hằng ngày |
| W02 | [`W02-weekly-cadence.md`](W02-weekly-cadence.md) | Đầu tuần / cuối tuần | Mon + Fri |
| W03 | [`W03-new-project-walkthrough.md`](W03-new-project-walkthrough.md) | Có lead/idea mới → giao hàng → thu tiền | Mỗi dự án |
| W04 | [`W04-agent-dispatch-runbook.md`](W04-agent-dispatch-runbook.md) | Trước khi gọi 1 agent bất kỳ | Mỗi lần dispatch |
| W05 | [`W05-incident-response.md`](W05-incident-response.md) | Khi có sự cố Sev 0/1/2 | Khi trigger |
| W06 | [`W06-first-90-days.md`](W06-first-90-days.md) | 90 ngày đầu launch studio | 1 lần, review w8/w12 |
| W07 | [`W07-cross-pipeline-handoffs.md`](W07-cross-pipeline-handoffs.md) | Khi pipeline A giao việc sang pipeline B | Khi handoff |
| W08 | [`W08-framework-retro.md`](W08-framework-retro.md) | Quarterly framework health check | Q1/Q2/Q3/Q4 |
| W09 | [`W09-agent-onboarding.md`](W09-agent-onboarding.md) | Mỗi khi tạo agent mới (R-LLMOps, R-DataOps, ...) | Per new agent |
| W10 | [`W10-cross-path-priority.md`](W10-cross-path-priority.md) | Khi ≥2 paths active concurrently | Per dispatch contention |
| W11 | [`W11-knowledge-review.md`](W11-knowledge-review.md) | K-review staging → production gate | Daily triage + weekly batch |
| W12 | [`W12-phase-rewind.md`](W12-phase-rewind.md) | Phát hiện phase trước sai sau khi đã sang phase sau | Khi trigger |

---

## Reading Order

**Lần đầu đọc** (founder / collaborator mới — 2h):
1. `@../../../../README.md` → `@../../../../01-FRAMEWORK.md` → `@../../../../00-OPERATING-MANUAL.md`
2. `W06-first-90-days.md` (nếu đang bootstrap) HOẶC `W01` + `W02` (nếu đã chạy)
3. `W03` (e2e walkthrough) — để thấy 1 dự án đi xuyên hệ thống
4. `W04` (agent dispatch) — trước lần gọi agent đầu tiên
5. `W05`, `W07` — khi tình huống phát sinh

**Reference hàng ngày**: W01 (sáng mở ra check) → W04 (khi cần dispatch).

---

## Convention

- File tên **`W{NN}-kebab-case.md`**.
- Mỗi file mở đầu bằng box header: *Khi nào chạy · Người chạy · Input · Output · Thời gian*.
- Các bước đánh số **1., 2., 3.** — KHÔNG dùng bullet lỏng lẻo.
- Mỗi bước có: **action + expected output + owner + link sang spec chi tiết**.
- Cross-reference sang pipeline docs bằng `@experience/workspace/docs/pipeline/...` — không lặp nội dung.
- Kết thúc bằng **Failure modes** + **Cross-references**.

---

## Relationship to Rules

Các workflow này BẮT BUỘC tuân thủ [`@../../../../_shared/rules/`](../../../../_shared/rules/). Đặc biệt:

- `30-execution-rules.md` — phase order, single active phase, human checkpoints
- `50-communication-rules.md` — status update cadence, escalation
- `70-quality-rules.md` — không self-approval, eval gates, DoD binary

Khi workflow mâu thuẫn rules → **rules thắng**; update workflow, log ADR.

---

## Update Cadence

| File | Trigger update | Owner |
|---|---|---|
| W01, W02 | Sau 2 tuần nếu rhythm đổi | P2 |
| W03 | Sau mỗi retro phát hiện pattern mới | P2 + P3 |
| W04 | Khi prompt preamble đổi hoặc tool mới | P1 |
| W05 | Sau mỗi postmortem | All |
| W06 | Chỉ 1 lần Day 0; review mốc w4/w8/w12 | CEO |
| W07 | Khi pipeline mới thêm vào | P2 |

---

## Adding / Sunsetting Workflow

Per `@../../../../_shared/standards/change-management.md` **§4 Add Workflow** — concrete checklist (create W{NN} doc + update README index + PROJECT.md routing + grep cite-check + document-catalog if produces named outputs). ADR mandatory if structural.

---

*Last updated: 2026-04-28 · v1.1 (W08 framework retro hooks M5/E3/BD4 outputs from 8 business pipelines)*
