# ONBOARDING.md — New Dev / New Founder / New Collaborator

> **Audience**: bất kỳ ai mới join (dev FT, contractor, founder co-opted) cần lên productive trong **3–7 ngày**. **AI agent**: dùng `PROJECT.md` thay vì file này.

**Last updated**: 2026-04-27 · **Version**: 1.1

---

## 0. Triết Lý Onboarding

- **Tối ưu token / thời gian**: KHÔNG yêu cầu đọc hết kho docs. Đọc theo lớp, dừng khi đủ.
- **Read → Do → Read more**: làm task thực tế sớm, đọc tiếp khi gặp khúc mắc.
- **Single entry point**: file `PROJECT.md` là router; mọi file khác load on-demand.
- **Pair với người trực**: 1 founder hiện tại làm "buddy", 30' / ngày × 5 ngày = 2.5h tổng — không hơn.

---

## 1. Trước Day 1 (giao trước cho người mới ≥ 24h)

Send qua email:

1. Link repo + access (`PROJECT.md` mở trước trang đầu)
2. Slack invite + channel: `#studio-ops`, `#personal-{name}`
3. 1 dòng: *"Trước Day 1 chỉ đọc `PROJECT.md` (~10 phút). Đừng đọc gì khác."*
4. Calendar 30' kickoff Day 1 09:00

---

## 2. Day 1 — Foundation (4h, ~12K tokens đọc)

### 2.1 Kickoff với buddy (09:00–09:30)

- Buddy giải thích context studio + role người mới
- Người mới nói lại bằng lời mình → buddy correct
- Output: 1 dòng người mới tự viết "tôi sẽ làm X cho studio".

### 2.2 Đọc layer (09:30–11:30, 2h)

| Order | File | Tokens | Why |
|---|---|---|---|
| 1 | `PROJECT.md` (đã đọc trước) — read again | 4K | Wrapper v1.1 |
| 2 | `01-FRAMEWORK.md` | 5K | Philosophy 5-layer + studio boundary |
| 3 | `00-OPERATING-MANUAL.md` | 6K | 5 paths A/B/C/D/E khi có input mới |
| 4 | `experience/workspace/docs/workflows/README.md` | 1K | Workflow index (W01-W12) |
| 5 | `experience/workspace/docs/pipeline/README.md` | 1K | Pipeline index (P0-P10 + Path A/B/C/D) |
| 6 | `_shared/rules/README.md` | 1K | 11 rules overview |

**Stop khi xong 4 file**. Không nhảy sang `business-strategy/01-08` ở day 1 (overflow).

### 2.3 Đọc role-specific (11:30–13:00, 1.5h)

Chọn 1 trong 4 role:

#### Role A: Dev (FT or contract)
- `_shared/rules/20-code-rules.md` (3K)
- `_shared/rules/10-stack-rules.md` (2K)
- `_shared/rules/80-harness-rules.md` (4K) — **runtime contract every agent follows**
- `experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md` (6K) — **gate enforcement**
- 1 skill card tier-2 / tier-4 dev gần nhất: `_shared/.agents/tier-{N}/{your-agent}.md` (2K)
- `_shared/standards/versioning-pinning.md` (2K) — reproducibility

#### Role B: Sales / Business Dev
- `business-strategy/02-customer-segments.md` (3K)
- `business-strategy/05-channel-playbook.md` (4K)
- `business-strategy/12-sales-playbook.md` (4K)
- `experience/workspace/docs/pipelines-business/sales/README.md` + `S0-S5` skim (3K)

#### Role C: Designer / Researcher
- `business-strategy/04-capability-catalog.md` (4K)
- `experience/workspace/docs/pipeline/P1-DISCOVERY.md` + `P4-DESIGN.md` (3K)
- `_shared/templates/project/04d-ui-spec.md` (2K)

#### Role D: COO / Ops / PM
- `business-strategy/15-business-operations.md` (3K)
- `business-strategy/13-product-delivery-process.md` (4K)
- `experience/workspace/docs/workflows/W01-daily-operating-rhythm.md` + `W02-weekly-cadence.md` (6K)
- `_shared/rules/100-orchestration-rules.md` (4K) — dispatcher, tiebreak, handoff QA, agent onboarding
- `_shared/rules/90-lifecycle-rules.md` (4K) — multi-path priority + concurrent resource lock
- `experience/workspace/docs/workflows/W10-cross-path-priority.md` (2K) — when ≥2 paths active

### 2.4 Lunch + reflect (13:00–14:00)

Người mới viết `_personal/{name}/day-1-notes.md`: 3 bullet **đã hiểu**, 3 bullet **còn confused**.

### 2.5 First task — shadow mode (14:00–17:00, 3h)

- Buddy chia sẻ màn hình làm task thực
- Người mới quan sát, hỏi 5 câu max
- KHÔNG tự làm task hôm nay

### 2.6 EOD (17:00–17:15)

- Người mới EOD post `#personal-{name}` theo W01 §10
- Buddy trả lời 3 câu confused từ §2.4 hoặc point sang doc đúng

**Day 1 token spend**: ~12K đọc + 1 task shadow.

---

## 3. Day 2 — Apply (5h thực, ~5K tokens đọc thêm)

### 3.1 Sáng — Morning sync với team (08:30–08:45)

Theo W01 §1. Người mới chỉ quan sát.

### 3.2 First micro-task (09:00–12:00, 3h)

Buddy giao 1 task **scope ≤ 3h**, ví dụ:
- Dev: implement 1 small ticket trong project active (≤ 100 LOC, có test)
- Sales: review 5 inbound replies, draft 5 follow-up email theo template
- Designer: redesign 1 page section dựa trên existing UI spec
- COO: compile weekly metrics from raw data

**Quy tắc**:
- Mở `PROJECT.md` §5 (routing) khi không biết tìm doc nào
- Hỏi buddy max 3 lần. Lần 4 → tự đọc thêm doc trước

### 3.3 Review với buddy (13:00–14:00)

Buddy review output, chỉ rule nào bị miss, point sang file rule.

### 3.4 Đọc thêm dựa trên gap (14:00–16:00, 2h)

Người mới đọc các rule + doc bị buddy point sang ở §3.3 — typically 2–3 file leaf.

### 3.5 Second micro-task (16:00–17:00, 1h)

Smaller task. Người mới hoàn thành **không hỏi buddy**, tự dùng doc.

### 3.6 EOD (17:00–17:15)

EOD theo W01.

**Day 2 spend**: ~5K đọc + 2 task tự làm.

---

## 4. Day 3–5 — Productive Drift

### Day 3
- Tham gia daily W01 đầy đủ (sync, dispatch wave, deep-work)
- Làm 2–3 task size tăng dần
- Đọc thêm khi gặp doc reference (≤ 5K / ngày)

### Day 4
- Đầu tiên dispatch 1 agent (Role A/D) hoặc gửi 1 outbound thật (Role B) hoặc deliver 1 design slice (Role C)
- **Nếu role A (PM) khởi tạo project mới**: copy `BRIEF-INTAKE.md` (root template) → `projects/{id}/BRIEF-INTAKE.md`, hướng dẫn CEO/khách điền 6 block, sau đó dispatch P0.1. Spec: `_shared/standards/project-attachments.md` cho per-project attachment (skill addon · doc · GitHub repo).
- Người mới chủ động propose 1 cải thiện docs (typo / unclear) → PR

### Day 5
- Tham gia Fri retro W02 đầy đủ — đóng góp 1 mục §3 "what didn't work" (kể cả từ góc người mới)
- Cuối ngày: `_personal/{name}/week-1-retro.md`: gì đã hiểu, gì còn mờ, đề xuất 1 thay đổi onboarding cho người tới sau

---

## 5. Week 2 — Independent

- Người mới có project / pipeline owned riêng
- Buddy giảm xuống 15' / ngày, sau Week 2 → on-demand
- Đọc còn lại của docs **chỉ khi task yêu cầu** — không bao giờ "đọc cho biết"

---

## 6. Reading Budget Summary

| Day | Tokens đọc | Task làm |
|---|---|---|
| 1 | ~12K (Foundation + role-specific) | Shadow |
| 2 | ~5K (gap-fill) | 2 micro-task tự làm |
| 3 | ~5K (on-demand) | 3 task |
| 4 | ~3K | 1 real dispatch / outbound / deliver |
| 5 | ~2K + retro | Fri retro participate |

**Total Week 1**: ~27K tokens reading + 8 task. KHÔNG cần đọc hết kho.

**So với "đọc hết everything"**: kho docs ~500K tokens. Onboarding theo file này = 5% kho × 5 ngày = productive trong 1 tuần thay vì 1 tháng.

---

## 7. Token-Saving Rules cho Người Mới

1. **Mặc định mở `PROJECT.md` trước mọi task** — dùng §5 routing để biết file nào cần.
2. **Không đọc folder, đọc file leaf** — `_shared/rules/` có 8 file, mỗi task chỉ chạm 1–2.
3. **Không đọc 2 file cùng concept** — nếu thấy 2 file nói cùng thứ, hỏi buddy file nào canonical (likely 1 file là alias / cross-ref).
4. **Skim → drill** — đọc heading + first sentence mỗi section. Drill chỉ section liên quan.
5. **Đọc `_state.json` thay vì lịch sử commits** — state là current truth.
6. **Khi confused về rule, đọc rule trước, không đọc workflow** — rules ngắn hơn, authoritative.
7. **Dùng search (Ctrl+Shift+F) thay vì đọc** — tìm keyword trong workspace nhanh hơn read-through.

---

## 8. Anti-Patterns Người Mới Hay Mắc

| Anti-pattern | Vì sao tệ | Fix |
|---|---|---|
| Đọc hết `business-strategy/01–18` ngay Day 1 | Overflow, quên hết, mất 1 ngày | Đọc 3 file role-specific (§2.3) |
| Tạo doc mới khi không hiểu | Bloat docs, duplicate truth | Hỏi `#studio-ops`, mở issue |
| Sửa file khác mà không đọc rule | Vi phạm convention, PR bị reject | Đọc `_shared/rules/40-docs-rules.md` 1 lần |
| Dispatch agent mà không đọc W04 | Skip preamble / human review → output bị revoke | Đọc W04 trước lần dispatch đầu |
| "Tôi sẽ đọc thêm cuối tuần" | Overcommit, burnout | Strict 5K tokens / day cap reading |
| Không EOD post | Mất audit trail, buddy không biết blocker | EOD bắt buộc dù 1 dòng |
| Sửa rule trước khi hiểu | Đập constitution của studio | Bất kỳ rule change → PR + 2 founder approve |

---

## 9. Buddy Responsibilities

Người buddy (1 founder hiện tại) cam kết:

- 30' / ngày × 5 ngày Week 1 (kickoff Day 1, review Day 2, sync mỗi ngày)
- Trả lời ≤ 3 câu / ngày từ người mới (lần 4 → buddy point sang doc)
- Review task output Day 2–4
- Tham gia Fri retro Week 1 cùng người mới
- Sau Week 2 → on-demand, không cần block calendar

Buddy KHÔNG phải:
- Code/làm thay người mới
- Trả lời ngoài giờ làm việc (trừ Sev 0/1)
- Review mọi commit (tự code review trong PR)

---

## 10. Onboarding Completion Criteria

Người mới được coi là "onboarded" khi (Day 5 EOD):

- [ ] Đã làm ≥ 8 task có buddy review pass
- [ ] EOD post 5/5 ngày Week 1
- [ ] Tham gia ≥ 1 W01 daily đầy đủ
- [ ] Tham gia Fri W02 retro Week 1
- [ ] Đã dispatch / send / deliver 1 thứ thật (không sandbox)
- [ ] Đã viết `week-1-retro.md` cá nhân
- [ ] Đã đề xuất ≥ 1 doc improvement

Nếu thiếu ≥ 2 mục → extend thêm 3 ngày, không tăng buddy time.

---

## 11. Cross-References

- Wrapper: `PROJECT.md`
- Daily: `experience/workspace/docs/workflows/W01-daily-operating-rhythm.md`
- Weekly: `experience/workspace/docs/workflows/W02-weekly-cadence.md`
- Agent dispatch (cho Role A/D): `experience/workspace/docs/workflows/W04-agent-dispatch-runbook.md`
- Rules summary: `_shared/rules/00-MASTER-RULES.md`
- Communication rules: `_shared/rules/50-communication-rules.md`

---

*Onboarding v1.0 · target: productive trong 5 ngày · token budget: 27K Week 1*
