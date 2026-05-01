# W02 — Weekly Cadence

> **Khi nào chạy**: Mỗi tuần — Mon 09:00 (plan) · Wed 16:00 (mid-week checkpoint) · Fri 16:00 (retro) · **Người chạy**: 3 founder (full) + driver mỗi project · **Input**: W01 EOD logs + `_state.json` · **Output**: Weekly plan · mid-week adjustments · retro doc · **Thời gian**: Mon 60' · Wed 30' · Fri 90'

---

## 0. Weekly Rhythm Overview

```
Mon 09:00  📋 Week Planning (60')      → Week-Plan doc
Mon–Tue    🧠 Execute (daily W01)
Wed 16:00  📊 Mid-week Checkpoint (30') → adjust plan
Wed–Thu    🧠 Execute
Fri 16:00  🔄 Weekly Retro (90')       → Retro doc + memory promotion
Fri 17:30  🎉 Hard stop — weekend off  (trừ on-call)
```

**Nguyên tắc**: *Mon sets intent, Wed corrects course, Fri captures learning*. Không skip Fri retro — missed retro = missed compound learning.

---

## 1. Monday — Week Planning (09:00–10:00, 60 phút)

**Owner**: CEO chủ trì · CTO + COO + mọi driver tham gia.

**File output**: `projects/_ops/week-YYYY-WW/plan.md` theo skeleton `_shared/templates/weekly-plan.md` (nếu chưa có → tạo từ block dưới).

### 1.1 Pre-read (mỗi người tự làm trước 09:00, 10')

- Đọc EOD commits của tuần trước (`#studio-ops` filter → last 7 days).
- Đọc `_state.json` mọi project active — note phase hiện tại, health, open decisions.
- Chuẩn bị 1 số: "Tuần trước tôi shipped X, blocked bởi Y, tuần này tôi propose MIT = Z".

### 1.2 Agenda (60')

| Phút | Nội dung | Output |
|---|---|---|
| 0–10 | **Numbers review** (tuần trước) — revenue, pipeline, LLM burn, hrs | bảng số vào plan.md §1 |
| 10–25 | **Project-by-project status** — mỗi driver 3': phase · health · MIT tuần này | plan.md §2 |
| 25–40 | **Business pipelines status** — S/C/CS/H/F (1' mỗi pipeline) | plan.md §3 |
| 40–50 | **Cross-cutting decisions** — ADR/SCR pending, hiring, hạng mục chiến lược | plan.md §4 + decisions queue |
| 50–60 | **Commit** — mỗi founder đọc thành tiếng MIT + cost cap + checkpoint cam kết | plan.md §5 sign-off |

### 1.3 Plan.md skeleton

```markdown
# Week Plan — YYYY-WW
Dates: Mon YYYY-MM-DD → Fri YYYY-MM-DD
Attendees: CEO, COO, CTO, +drivers

## 1. Last week numbers
- Revenue recognized: $X
- Active pipeline: $Y
- LLM burn: $Z (cap $W)
- Hrs: CEO{a} COO{b} CTO{c}
- Projects shipped to phase: [list]

## 2. Projects this week
| Project | Phase start → target | Driver | MIT | Cost cap | Checkpoint due |
|---------|----------------------|--------|-----|----------|---------------|

## 3. Business pipelines
- Sales: {top 3 deals, next action}
- Content: {pieces shipping, topics queue}
- CS: {at-risk accounts, QBRs scheduled}
- Hiring: {open roles}
- Finance: {invoices out, collections, runway}

## 4. Decisions this week
- [ ] ADR-{NN}: {title} — owner {X} — decide by {day}
- [ ] SCR-{NN}: ...

## 5. Commitments
- CEO MIT: ...
- COO MIT: ...
- CTO MIT: ...
- Shared target: {e.g., close deal ABC, ship project XYZ to P7}

## 6. Risks & watch items
- ...

Signed off: [✓] CEO [✓] COO [✓] CTO @ {timestamp}
```

### 1.4 Rules during planning

- **Max 1 founder talk at a time** (timebox bật ra 1'30" mỗi người).
- **No deep tech debate** → park vào "decisions queue", xử lý async qua ADR.
- **KHÔNG commit >3 MIT/người** — focus > volume.

---

## 2. Tuesday–Wednesday — Execute (daily W01)

Mọi ngày chạy theo `W01`. Không có cadence meeting thêm.

---

## 3. Wednesday — Mid-week Checkpoint (16:00–16:30, 30 phút)

**Owner**: COO chủ trì.

**Mục đích**: phát hiện sớm deviation — nếu Mon commit mà Wed đã trượt ≥ 20% thì chỉnh lại trước Fri, không đợi retro.

### Bước

1. Mỗi driver trả lời 3 câu (1' mỗi người):
   - MIT tuần này tiến độ % đến đâu?
   - Có blocker mới nào chưa có trong `_state.json.blockers`?
   - LLM burn % cap đã dùng? (nếu > 60% → cảnh báo)
2. COO tổng hợp → 1 trong 3 action:
   - **GREEN**: on-track → không làm gì, tiếp tục.
   - **YELLOW**: trượt 10–25% → chỉnh scope hoặc xin giúp; update `plan.md §2` inline.
   - **RED**: trượt >25% hoặc blocker critical → trigger mini-planning (Thu 09:00) hoặc descope SCR.
3. Post outcome vào `#studio-ops`:  
   `[MID-WEEK YYYY-WW] GREEN/YELLOW/RED — summary — action`.

**Hard rule**: nếu RED → CEO BẮT BUỘC vào cuộc trong 2h.

---

## 4. Thursday — Execute + Writing

Theo W01. Thường Thu là ngày **writing-heavy** (proposals, content, ADR/SCR finalize).

---

## 5. Friday — Weekly Retro (16:00–17:30, 90 phút)

**Owner**: CTO chủ trì tuần lẻ · CEO chủ trì tuần chẵn (rotation tránh thiên vị).

**File output**: `projects/_ops/week-YYYY-WW/retro.md`.

### 5.1 Pre-read (trước 16:00, 15')

Mỗi founder tự trả lời 4 câu, paste vào channel `#retro-temp`:
1. 1 điều tôi thấy tuần này **đã work** (giữ làm)
2. 1 điều **chưa work** (dừng hoặc đổi)
3. 1 điều tôi muốn thử **tuần sau**
4. 1 lời cảm ơn / ghi nhận 1 đồng đội

### 5.2 Agenda (90')

| Phút | Nội dung | Output |
|---|---|---|
| 0–10 | **Numbers vs plan** — so plan.md §1 + §5 với thực tế | retro.md §1 |
| 10–25 | **Project retros** — mỗi project 2': đã ship phase gì, phase tới, learning | retro.md §2 |
| 25–40 | **Process retro** — W01/W02 có chỗ nào ma sát? Rules nào cản? | retro.md §3 |
| 40–55 | **Agent & eval retro** — eval pass rate tuần này, skill card nào cần update | retro.md §4 + skill update queue |
| 55–70 | **Memory promotion ceremony** — quét `_state.json.memory_promotion_queue[]` tất cả project → chốt promote/reject | retro.md §5 + knowledge/memory/ updates |
| 70–80 | **Action items** — 4W1H (What/Who/When/Why/How) ≤ 5 items | retro.md §6 |
| 80–90 | **Appreciation round** — mỗi người 1 câu | retro.md §7 |

### 5.3 Retro.md skeleton

```markdown
# Weekly Retro — YYYY-WW

## 1. Plan vs actual
| Metric | Planned | Actual | Delta |
|---|---|---|---|

## 2. Project retros
### {project-id}
- Shipped: ...
- Learned: ...
- Next week: ...

## 3. Process
### What worked
- 
### What didn't
- 
### Experiments for next week
- 

## 4. Agent / eval
- Eval pass rate: X%
- Skill cards to update: [list with paths]
- Prompt revisions queued: [list]

## 5. Memory promotion
| Candidate | From | To | Decision | Owner |
|---|---|---|---|---|

## 6. Action items
- [ ] A1 — owner — by date — why
- [ ] A2 — ...

## 7. Appreciations
- ...

Signed off: [✓] CEO [✓] COO [✓] CTO
```

### 5.4 Rules

- **Blameless**: tấn công vấn đề, không tấn công người. Xem `_shared/rules/70-quality-rules.md` §continuous-improvement.
- **Convert insight to action** — mọi "chưa work" PHẢI sinh ra ≥ 1 action item hoặc được note explicit "accept & monitor".
- **Memory promotion ≥ 1 mục / tuần** — nếu 0 thì team đang không học; flag.
- **Close by 17:30** — không kéo dài retro.

---

## 6. Friday 17:30 — Hard Stop

- Laptop đóng, Slack notifications mute.
- On-call (theo roster `business-strategy/15`) vẫn available cho Sev 0/1 (xem W05).
- **Không agent dispatch mới** sau 17:30 Fri đến 08:30 Mon (trừ cron job scheduled).

---

## 7. Monthly Rollup (cuối tuần cuối tháng)

Retro Fri cuối tháng mở rộng +30':
- Compile 4 tuần retro → `business-strategy/15-business-operations.md §monthly review` update
- Review `business-strategy/03-goals-and-roadmap.md` — OKR on track?
- Review rules version có cần bump? (xem `_shared/rules/README.md` §update cadence)
- Check rules compliance score (audit 1 project random) — threshold ≥ 90%.

---

## 8. Quarterly (cuối tuần cuối quý)

Retro Fri mở rộng thành off-site 3h:
- Strategy review `business-strategy/01` + `03` + `09`
- Phase transition (Phase 1 → Phase 2 etc.)
- Skill card mass update nếu pattern mới rõ
- Budget review next quarter

---

## 9. Failure Modes

| Lỗi | Dấu hiệu | Xử lý |
|---|---|---|
| Skip Mon planning | Không có `plan.md` tuần đó | Tuần đó auto-RED; MIT = compile planning ngay Tue 09:00 |
| Skip Fri retro | Không có `retro.md` | Mon tuần sau retro double-session; memory promotion queue fill đầy |
| Retro toxic (đổ lỗi cá nhân) | Ai đó feel attacked | Facilitator dừng ngay, quay lại rules §blameless; nếu tái diễn → CEO intervene |
| Action items từ retro không ai làm | % completion < 60% 2 tuần liên | Retry: giảm số action/tuần xuống 3, tăng specificity |
| Mid-week checkpoint bị skip | Không có post `[MID-WEEK]` | COO chịu trách nhiệm; recur → đổi chair rotation |
| Cadence meeting vượt time | Mon > 75' hoặc Fri > 105' | Timebox chair cắt thẳng; parking lot cho phần còn lại |

---

## 10. Metrics

Track trong `business-strategy/15` + auto-dashboard:

- **Plan → actual accuracy**: |delta| trung bình mỗi MIT (target ≤ 20%)
- **Retro attendance**: 100% founder
- **Action item close rate**: ≥ 80% trước retro kế tiếp
- **Memory promotion volume**: ≥ 4/tháng
- **Skip rate của cadence**: = 0

---

## 11. Cross-References

- Daily: [`W01-daily-operating-rhythm.md`](W01-daily-operating-rhythm.md)
- Project-level retro template: `@../../../../_shared/templates/project/99-retro.md`
- Memory promotion rules: `@../../../../_shared/rules/30-execution-rules.md` §memory-promotion
- OKR & roadmap: `@../../../../business-strategy/03-goals-and-roadmap.md`
- Ops SOP (roster, on-call): `@../../../../business-strategy/15-business-operations.md`

---

*Last updated: 2026-04-26 · v1.0*
