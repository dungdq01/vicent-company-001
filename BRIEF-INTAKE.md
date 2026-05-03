---
file: BRIEF-INTAKE
role: ROOT TEMPLATE — "đề bài" mẫu. Mỗi project copy file này thành `projects/{id}/BRIEF-INTAKE.md` riêng.
filled_by: CEO or Client (human, 5–15 phút) per project
consumed_by: P0.1 Brief Capture → P0.2 R-Match → assemble team
status: template (DO NOT fill at root — copy ra `projects/P-{YYYYMM}-{NNN}-{slug}/BRIEF-INTAKE.md` rồi điền)
last_updated: 2026-05-01
version: 1.0
---

# BRIEF-INTAKE — Đề Bài Dự Án

> **Form lite**, người điền (CEO hoặc khách) chỉ trả lời 6 block bên dưới. Engine sẽ tự fill phần còn lại (R-Match output, team roster, decision) ở `00-intake.md` (full intake) sau khi dispatch P0.1.

> **Nguyên tắc**: viết tiếng Việt hoặc Anh đều được. Càng cụ thể càng tốt — vague = engine guess sai = retro tốn cost.

---

## Cách dùng

### Path A — Via R-CoS Concierge (recommended, ~5')

```
1. Mở Claude Code session, invoke R-CoS:
   "Đóng vai R-CoS theo `_shared/.agents/tier-0-executive/R-CoS-chief-of-staff.md`."

2. CEO nói tiếng người: "Tạo project recsys affiliate, ngành ecommerce VN,
   budget $20k, deadline 8 tuần, client VietLog"

3. R-CoS Interview Mode:
   - Extract info từ message → fill block đã có
   - Hỏi block còn thiếu (Problem · Current state · KPI · Out-of-scope)
   - Validate (no fabrication, KPI measurable)

4. R-CoS draft projects/{id}/BRIEF-INTAKE.md → show preview

5. CEO confirm/edit/cancel

6. R-CoS auto: mkdir + cp templates + init _meta/_state + dispatch P0.1
```

### Path B — Manual (15')

```
1. Tạo folder projects/P-{YYYYMM}-{NNN}-{slug}/
2. Copy file ROOT/BRIEF-INTAKE.md → projects/{id}/BRIEF-INTAKE.md (giữ NGUYÊN tên)
3. CEO / khách điền 6 block (10–15 phút) trong BẢN COPY
4. Lưu file
5. Ra lệnh: "Dispatch P0.1 với projects/{id}/BRIEF-INTAKE.md"
6. Sau R-Match xong, CEO duyệt §11 trong 00-intake.md → P1 start
```

⚠️ KHÔNG điền vào file root — root là template read-only. Vi phạm = R-MAS-16 framework read-only.

---

## 1. Client Snapshot *(bắt buộc)*

- **Tên đơn vị**: _____________________
- **Người liên hệ chính**: tên · vai trò · email/phone
- **Ngành**: _____________________ (vd: e-commerce, logistics, F&B, healthcare, MMO/affiliate, …)
- **Quy mô**: _____________________ (số nhân viên · doanh thu band · GMV nếu là e-com)
- **Loại dự án**:
  - [ ] External client (Path A — sales-led)
  - [ ] Internal product (Path B — studio's own)
  - [ ] Content / Audit (Path C)
  - [ ] Knowledge research (Path D)

💡 *Hint*: nếu internal R&D thì điền studio name làm client.

---

## 2. Problem Statement *(bắt buộc, 3–6 câu)*

> Họ đang gặp vấn đề gì? Tại sao cần giải quyết NGAY BÂY GIỜ? Đo lường được không?

```
[Điền ở đây]
```

💡 *Hint*: tránh "muốn dùng AI". Phải nêu pain cụ thể: "stockout 12% mỗi tháng → mất $50k revenue" hoặc "CTR affiliate đang 0.8%, cạnh tranh top 3 đang 2.4%".

---

## 3. Current State *(bắt buộc)*

- **Hiện tại họ làm sao?** _____________________
- **Tools/systems đang dùng**: _____________________
- **Data có sẵn**:
  - [ ] CSV/Excel xuất được
  - [ ] API có sẵn
  - [ ] DB access trực tiếp
  - [ ] Chưa có gì
  - [ ] Không biết
  - **Mô tả**: _____________________ (loại · format · volume · history depth)
- **Team họ có**: _____________________ (ai sẽ dùng · ai sẽ maintain)

---

## 4. Constraints *(bắt buộc)*

| Loại | Giá trị |
|---|---|
| **Budget** | $ ___________ (range OK: vd $10k–20k) |
| **Timeline** | Start: ___ · Target delivery: ___ · Hard deadline: yes / no |
| **Data residency** | cloud OK · on-prem required · geography: ___ |
| **Compliance** | none · GDPR · HIPAA · PCI · SOC2 · VN PDPA · khác: ___ |
| **Existing stack phải tích hợp** | ___________ |
| **Team họ dành bao nhiêu giờ/tuần collab** | ___ h/tuần |

---

## 5. Success Criteria *(bắt buộc, 3–5 KPI đo được)*

> Sau X tuần, làm sao biết là thành công? KPI phải **đo lường được + có deadline**.

1. ___________ (vd: "MAPE forecast < 15% trên holdout 3 tháng")
2. ___________ (vd: "p95 inference < 200ms")
3. ___________ (vd: "≥ 5 user adopt trong tuần đầu sau launch")
4. *(optional)* ___________
5. *(optional)* ___________

💡 *Hint*: R-BA sẽ enforce ở P0.4 — KPI mơ hồ = block phase advance.

---

## 6. Out-of-Scope *(bắt buộc, explicit)*

> Cái gì **KHÔNG** làm trong dự án này? Tránh scope creep ở P2.

- ___________
- ___________
- ___________

💡 *Hint*: ví dụ "không xây mobile app", "không migrate data cũ", "không train model from scratch — chỉ fine-tune".

---

## 7. *(Optional)* Attachments — Tài liệu / Repo / Skill kèm theo

> **KHÔNG paste content thẳng vào file này** — chỉ declare path/URL. Engine sẽ ingest qua P0.2c (`P0-INTAKE.md`) per `_shared/standards/project-attachments.md`.

Anh/chị có gửi kèm:

- [ ] **Code / specs / PDFs** (sẽ copy vào `projects/{id}/_attachments/docs/`)
  - **Path / link**: ___________
  - **Mô tả ngắn**: ___________ (vd: "Client RFP v2, 18 trang")

- [ ] **GitHub repos cần tham khảo** (sẽ pin vào `_attachments/repos/_refs.yaml`)
  - **URL**: ___________
  - **Commit hash** (NEVER branch): ___________
  - **License**: ___________
  - **Lý do reference**: ___________

- [ ] **Skill addon mong đợi cho agent** (sẽ tạo `.agents/R-{X}-{addon}.md`)
  - **Agent nào**: ___________ (vd: R-MLE, R-BA, R-SA)
  - **Skill addon describe**: ___________ (vd: "two-tower recsys", "VN PDPA SOW clause")
  - **Lý do studio-level chưa cover**: ___________

💡 *Hint*: nếu không có attachment, để trống section này. Engine sẽ skip P0.2c.

⚠️ **Compliance**: docs phải pass PII scan, repos phải compatible license, addon `new_persona` cần CEO sign-off. Detail: `project-attachments.md`.

---

## 8. *(Optional)* Open Questions / Risk Pre-Flags

- ___________
- ___________

---

## Footer

- **Filled by**: ___________ · **Date**: ___________
- **CEO sign-off** (cho phép engine khởi động): ___________

---

## Engine Flow Sau Khi BRIEF Submitted

```
BRIEF.md (file này)
   │
   ▼
P0.1 Brief Capture (R-PM + R-BA)
   ├─ parse 6 block → fill 00-intake.md §1-5, §7, §10
   ├─ flag missing/vague fields → block hoặc clarify request
   └─ tạo project skeleton folder
   │
   ▼
P0.2 R-Match Classifier
   ├─ đọc Problem + Current State + Industry
   ├─ map → baseline (B01-B15) + industry (I01-I20 hoặc I-custom)
   ├─ output classify-match.json
   └─ fill 00-intake.md §6
   │
   ▼
P0.3 Team Assembly
   ├─ TEAM-CONFIG.md → pick agents per matched baseline×industry
   └─ fill 00-intake.md §9
   │
   ▼
P0.4 KPI + Scope Tier
   ├─ R-BA enforce KPI measurability
   ├─ scope tier (A/B/C/D) per budget+timeline
   └─ fill 00-intake.md §8
   │
   ▼
CEO duyệt §11 → P1 Discovery starts
```

---

## Cross-References

| Need | Path |
|---|---|
| Full intake (engine-filled) | `_shared/templates/project/00-intake.md` |
| P0 phase spec | `experience/workspace/docs/pipeline/P0-INTAKE.md` |
| R-Match agent | `_shared/.agents/tier-1-research/R-Match-classifier.md` |
| Project naming convention | `projects/README.md` |
| Pricing per scope tier | `business-strategy/10-pricing-sheet.md` |

---

*BRIEF-INTAKE v1.0 — root-level entry point · 2026-05-01*
