# W01 — Daily Operating Rhythm

> **Khi nào chạy**: Mỗi ngày làm việc (Mon–Fri) · **Người chạy**: Founder trực (CEO/COO/CTO luân phiên) + mọi thành viên · **Input**: `_state.json` của projects active · **Output**: Dispatch plan đã chạy + EOD log · **Thời gian**: 7 khung × tổng ~2h của founder trực; còn lại asynchronous

---

## 0. Overview — 1 ngày trong studio

```
08:30  🌅 Sync-up (15')          ──── check _state.json tất cả projects active
08:45  🧠 Deep-work block 1 (2h) ──── 1 founder cầm cờ, 2 người còn lại độc lập
10:45  ☕ Dispatch wave 1 (30')  ──── orchestrator gọi batch agent đầu
11:15  🧠 Deep-work block 2 (2h)
13:15  🍱 Lunch + reading (45')
14:00  📊 Mid-day review (15')   ──── check dispatch output, eval gate
14:15  🧠 Deep-work block 3 (2h) ──── review/fix agent output, human-in-loop
16:15  ☕ Dispatch wave 2 (30')
16:45  ✍️  Writing/async (1h)
17:45  📝 EOD commit (15')       ──── commit docs, update _state, Slack status
18:00  🌙 Close
```

**Quy tắc vàng**: *mỗi phase chỉ có 1 người là "driver"; 2 người còn lại là "support khi được hỏi"*. Xem `_shared/rules/30-execution-rules.md` §"Single active driver".

---

## 1. Morning Sync-up (08:30–08:45, 15 phút)

**Owner**: Founder trực hôm nay (theo roster trong `@../../../../business-strategy/15-business-operations.md`).

### Bước

1. Mở `projects/` — list mọi project có `_state.json.lifecycle.status != closed|cancelled`.
2. Với mỗi project, đọc nhanh:
   - `_state.json.lifecycle.current_phase` + `expected_phase_end`
   - `_state.json.blockers[]` — blocker nào critical/high?
   - `_state.json.human_checkpoints[]` — có checkpoint nào `status=pending` quá deadline?
3. Điền bảng **Today's Board** (trong channel `#studio-ops`):

   ```
   | Project | Phase | Health | Top blocker | Today's goal | Driver |
   |---------|-------|--------|-------------|--------------|--------|
   ```
4. Flag **escalation** nếu:
   - Có blocker `severity=critical` chưa assign
   - Có project `health=red` ≥ 2 ngày liên tiếp
   - Có checkpoint quá hạn > 24h
5. Post bảng lên `#studio-ops` + tag driver mỗi project.

**DoD của bước 1**: Bảng đã post < 08:45. Mọi project active có driver.

**Link chi tiết**: escalation path → `_shared/rules/50-communication-rules.md` §"Escalation".

---

## 2. Deep-work Block 1 (08:45–10:45, 2h)

**Quy tắc**: *không meeting, không Slack, không dispatch agent*. Founder làm việc sâu — code, viết docs, nghiên cứu.

Mỗi founder có 1 **Most Important Task (MIT)** cho block này — viết vào `#personal-{name}` lúc 08:45.

**Ngoại lệ** (được phép break): incident Sev 0/1 (xem `W05`).

---

## 3. Dispatch Wave 1 (10:45–11:15, 30 phút)

**Owner**: Driver mỗi project (có thể parallel nếu nhiều founder cùng dispatch).

### Bước — áp dụng `W04-agent-dispatch-runbook.md`

1. Với mỗi project có phase hiện tại cần agent output:
   - Chọn agent (theo `pipeline/P{N}-*.md` → bảng Engine Orchestration).
   - Load context (W04 §2).
   - Check cost cap còn lại: `_state.json.cost_burn.llm_spend_cap - spend_to_date`.
   - Nếu cap sắp cạn (<20%) → dừng, escalate COO.
2. Submit batch dispatch. Ghi `dispatch_id` + timestamp vào `_state.json.last_orchestrator_tick`.
3. **KHÔNG chờ sync** — để orchestrator chạy async, quay lại deep-work block 2.

**Cost gate**: tổng spend wave 1 ≤ 40% daily LLM budget.

---

## 4. Deep-work Block 2 (11:15–13:15, 2h)

Cùng quy tắc Block 1. Agent chạy song song nền; kết quả sẵn sàng cho 14:00 review.

---

## 5. Lunch + Reading (13:15–14:00, 45 phút)

- 20' ăn
- 25' đọc: 1 paper / 1 industry report / 1 competitor teardown. Note vào `knowledge/inbox/YYYY-MM-DD.md`.
- **KHÔNG đọc** email / Slack / news feed.

---

## 6. Mid-day Review (14:00–14:15, 15 phút)

**Owner**: Driver từng project.

### Bước

1. Mở output của dispatch wave 1 (từ orchestrator log hoặc folder `projects/{id}/.runs/`).
2. Với mỗi output:
   - Đọc `eval_score` từ `_state.json.eval_scores.by_skill.{skill_id}`.
   - Nếu `score < threshold` → mark **fail**, schedule re-run với prompt revision (max 1 retry theo `30-execution-rules.md` §retry budget).
   - Nếu `score ≥ threshold` → mark **pass**, đưa vào deep-work block 3 để human review.
3. Update `_state.json.deliverables_index[].status` (`draft` → `ready_for_review` hoặc `failed`).
4. Post 1 dòng status vào `#studio-ops`:  
   `[{project}] wave1: 3 pass, 1 fail (re-run), cost $X.XX`.

---

## 7. Deep-work Block 3 (14:15–16:15, 2h) — Human-in-loop

**Focus**: review agent output đã pass eval, chỉnh tay, merge vào deliverable chính.

### Bước cho MỖI output

1. So với rules: `@_shared/rules/20-code-rules.md` (code), `40-docs-rules.md` (docs), `60-security-rules.md` (security).
2. Fact-check mọi citation/number agent trích dẫn (xem `_shared/rules/00-MASTER-RULES.md` §Anti-hallucination).
3. Edit trong chỗ → commit với message format:  
   `{project-id} P{N}: {what} via {agent-id} + human-edit`
4. Update `_state.json.deliverables_index[].status = approved`, `approved_by`, `approved_at`.
5. Nếu phát hiện insight đáng promote → thêm vào `_state.json.memory_promotion_queue[]`.

**Hard rule**: *không commit output agent chưa qua human review* (xem `70-quality-rules.md` §No self-approval).

---

## 8. Dispatch Wave 2 (16:15–16:45, 30 phút)

Lặp §3 cho phase tiếp theo (nếu deliverable wave 1 đã approved) hoặc cho projects khác.

**Budget**: wave 2 + wave 1 ≤ 75% daily LLM budget. Còn 25% cho khẩn cấp tối.

---

## 9. Writing / Async (16:45–17:45, 1h)

Các task con người phải làm, không agent thay được:

- Email khách hàng (xem `pipelines-business/sales/` template)
- Content (`pipelines-business/content/C1-DRAFT.md`)
- Client call follow-up
- ADR/SCR draft nếu hôm nay có decision nặng
- 1:1 internal founder sync (nếu cần)

---

## 10. EOD Commit (17:45–18:00, 15 phút) — BẮT BUỘC

**Owner**: Driver + mỗi founder.

### Bước — checklist

1. Với mỗi project đã chạm hôm nay:
   - [ ] Update `_state.json.last_updated`, `last_updated_by`.
   - [ ] Đảm bảo `lifecycle.current_phase` + `overall_health` phản ánh đúng thực tế.
   - [ ] Mọi blocker mới đã log vào `_state.json.blockers[]`.
2. `git add -A && git commit -m "eod YYYY-MM-DD {name}"` trong mỗi repo chạm.
3. Post EOD status vào `#studio-ops`, format:

   ```
   [EOD {name} YYYY-MM-DD]
   - Shipped: {bullet}
   - Blocked: {bullet or "none"}
   - Tomorrow MIT: {1 dòng}
   - Burn: LLM $X (cap $Y), hrs Z
   ```
4. Close laptop. **Không check Slack sau 18:00** trừ on-call (xem W05).

**Rule thép**: *không có EOD = ngày đó coi như chưa xảy ra*. Retro W02 sẽ kiểm EOD coverage.

---

## 11. Roster & Rotation

- **Founder trực** (người chạy §1 và §6 mỗi ngày) luân phiên theo tuần:
  - Tuần 1 CEO · Tuần 2 COO · Tuần 3 CTO · Lặp lại.
- **Driver mỗi project** cố định theo `_meta.json.team.human.lead`; không đổi giữa tuần trừ khi có SCR.
- **On-call nights/weekends**: theo bảng `@../../../../business-strategy/15-business-operations.md` §on-call.

---

## 12. Daily Failure Modes

| Lỗi | Dấu hiệu | Xử lý |
|---|---|---|
| Không sync-up đúng 08:30 | Bảng Today's Board đến muộn / thiếu | Founder trực trả "late fee": làm EOD compile W02 cuối tuần |
| Deep-work bị gián đoạn > 30' | MIT không xong | Ghi vào retro; tuần sau cắt 1 meeting để bảo vệ deep-work |
| Dispatch vượt cost cap | `spend_to_date > 80% cap` | Tự động kill pending jobs; escalate COO; switch model fallback |
| Eval fail > 2 lần cho cùng skill | Retro bất thường | Log `_state.json.eval_scores`, freeze skill, kickoff prompt revision (W04 §7) |
| Không EOD 2 ngày liên tiếp | Missing `_state.json.last_updated` | Driver bị đẩy sang support; người khác cover |
| Blocker critical quá 24h | `raised_at + 24h < now` và `resolved_at = null` | Auto-escalate CEO qua Slack bot |

---

## 13. Metrics Tracked

Tự động compile vào `business-strategy/15` weekly:

- **Dispatch latency**: từ "phase ready" → lần dispatch đầu (target < 4h)
- **Eval pass rate**: target ≥ 80% pass lần 1
- **Human review turnaround**: output eval-pass → approved (target < 24h)
- **Daily LLM burn** vs cap (target ≤ 75%)
- **EOD coverage**: % ngày có EOD commit của mỗi founder (target 100%)

---

## 14. Cross-References

- Pipeline phase specs: `@../pipeline/P{N}-*.md`
- Business pipelines (sales/content/...): `@../pipelines-business/`
- Agent dispatch detail: [`W04-agent-dispatch-runbook.md`](W04-agent-dispatch-runbook.md)
- Weekly cadence: [`W02-weekly-cadence.md`](W02-weekly-cadence.md)
- Incident break-glass: [`W05-incident-response.md`](W05-incident-response.md)
- Rules: `@../../../../_shared/rules/30-execution-rules.md`, `50-communication-rules.md`
- Ops SOP: `@../../../../business-strategy/15-business-operations.md`

---

*Last updated: 2026-04-26 · v1.0*
