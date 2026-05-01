# Chiến lược tổng thể — AI SaaS Venture

**Version:** 1.0 (draft cho meeting đầu tiên)
**Author:** CEO + 2 co-founders, refined với AI advisor
**Last updated:** 2026-04-26

---

## 1. Tóm tắt 1 dòng

> Tận dụng MMO content làm zero-CAC funnel + brand moat, đồng thời serve B2B Logistic & E-commerce với Sprint pipeline trên Engine. **MAESTRO Knowledge Graph + Agent Workspace Pipeline** là tài sản chung, được làm giàu sau mỗi project.

---

## 2. Cấu trúc 3 lớp

```
LỚP 1 — KNOWLEDGE (chung, là moat dài hạn)
  MAESTRO matrix
    9 baselines ưu tiên: B01 Forecasting, B02 Doc Intelligence, B05 Recommendation,
                          B06 Optimization, B07 Anomaly Detection, B08 Conversational AI,
                          B09 Generative AI, B10 Agentic AI, B12 Search & RAG
    3 industries deep:    I06 Logistic, I01 E-commerce, I-MMO (NEW node)
  Tăng trưởng: mỗi project trong Lớp 3 → +1 baseline node hoặc +1 industry sub-node

LỚP 2 — ENGINE (chung, là leverage thực thi)
  Agent Workspace Orchestrator (Scope A→D pipeline, 9 phases P0–P9)
  Mission Control Dashboard (real-time SSE, agent visibility)
  Build sequence: spec ở P1 (T1) → MVP ở P2 (T2-3) → prompt-tune ở P3 (T4-5)

LỚP 3 — VERTICAL (3 line song song, share Lớp 2)
  ─────────────────────────────────────────────────────────
  | Line       | Phase  | Pricing model       | Channel       |
  ─────────────────────────────────────────────────────────
  | MMO        | P1     | $19–299 product     | TikTok/YT VN  |
  | E-com      | P2     | $1.5K–8K sprint     | Founder net   |
  | Logistic   | P3     | $1.5K–15K sprint    | Employer + VLA|
  ─────────────────────────────────────────────────────────
  Khác nhau: pricing, channel, khách, deliverable
  Giống nhau: cùng dùng Engine ở Lớp 2 + ăn knowledge ở Lớp 1
```

---

## 3. Insight chiến lược cốt lõi

### MMO không phải "line song song" — MMO là **funnel đầu vào** của B2B

Đây là điểm khác biệt chiến lược (moat) mà 99% consultancy AI không có:

- Consultancy AI bình thường: CAC $500–2000/lead (LinkedIn ads, sales rep, hội thảo)
- **Chúng ta: CAC ~$0** vì content TikTok/YT vừa bán MMO products **vừa** drive B2B inbound
- Một video "AI agent forecast tồn kho cho shop Shopee" → MMO viewer mua $99 course **đồng thời** Head of Ops của 3PL DM hỏi consulting

**Điều kiện để play này work** (cả 3 phải có):
1. Founders technical → build được sản phẩm thật, không phải khoá rỗng
2. Founders produce content được → tự shoot, edit, post (hoặc 1 founder chuyên content)
3. Agentic execution → không bị drown khi viral

Nếu thiếu 1 trong 3 → quay lại consultancy truyền thống, mất lợi thế.

### Flywheel

```
   [TikTok/YT content "Build in Public"]
              ↓
        [MMO audience VN]
         /            \
        ↓              ↓
   [MMO products      [B2B inbound DM
    $19–299]           từ Head of Ops]
        ↓              ↓
   [Cash + reviews   [Sprint $1.5K–15K
    + testimonials]   + case study]
        ↓              ↓
        └──→ [MAESTRO + Workspace ←──┘
                  ↓
         (mạnh hơn cho vòng sau)
```

---

## 4. 18-month sequencing

### Phase 1 — Tháng 0–6: "Prove the engine + Build audience"

**Mục tiêu duy nhất:** Validate flywheel, không phải maximize cash.

**Lớp 1 — Knowledge:**
- T1–3: Hoàn thiện B01 (đã có L3) + ship B02 Doc Intelligence + B05 Recommendation L3
- T4–6: B07 Anomaly + B08 Conversational L3
- Tạo I-MMO industry node (NEW) — research 20+ MMO use cases trong VN

**Lớp 2 — Engine:**
- T1: spec P0–P4 done
- T2–3: Engine MVP (orchestrator + SSE + dashboard skeleton)
- T4–5: Prompt-tune trên 2–3 dự án thật
- T6: Engine v1 stable, automate ≥80% phase P1–P4

**Lớp 3 — Vertical:**
- **MMO line:** T1 ship PDF roadmap; T2 ship Template Pack; T3 ship MAESTRO read-only ($99 lifetime); T4–5 ship Course "AI Agent đầu tiên kiếm tiền"
- **B2B Logistic:** T1–2 negotiate vendor contract với employer; T3 deliver dự án 1 (Sprint A); T4–6 dự án 2–3
- **B2B E-commerce:** T4–6 nhận 1 dự án pilot từ founder network (Founding Customer pricing 50% off)

**KPI exit Phase 1:**
- ✅ MMO followers ≥ 5,000 tổng (TikTok+YT+Threads)
- ✅ MMO MRR ≥ $1,500
- ✅ B2B revenue cumulative ≥ $10,000 từ 2–3 logos
- ✅ MAESTRO ≥ 5 baselines L3 + I-MMO node ra mắt
- ✅ Engine v1 ship được, có 1 video demo public

### Phase 2 — Tháng 6–12: "Productize + Scale revenue"

**Lớp 1:** Ship B06 Optimization, B09 Generative, B10 Agentic, B12 RAG L3 → đủ 9 baselines ưu tiên

**Lớp 2:** Engine v1.5 — multi-tenant ready ở backend (chưa public), self-serve project intake form

**Lớp 3:**
- MMO: launch Course tier 2 ($299–499), affiliate program (cho học viên giới thiệu)
- B2B: ship Scope C/D — Full Blueprint $8–15K/deal
- Niche audit reports làm lead-gen ("Top 10 AI use case cho 3PL VN", "AI cho TikTok Shop seller VN")

**KPI exit Phase 2:**
- MMO followers ≥ 20K, MRR ≥ $8K
- B2B 6–8 logos cumulative, MRR ≥ $15K
- Total MRR ≥ $25K

### Phase 3 — Tháng 12–18: "Decide the bet"

Đến đây 1 trong 3 line sẽ vượt trội. Quyết định concentration:

- **Nếu MMO Subscription scale tốt** (audience 50K+, MRR $20K+): launch MAESTRO Pro multi-tenant SaaS public, 1 founder full-time content + community
- **Nếu B2B Logistic vượt trội** (5+ logos, $30K+ MRR): hire 1 BD, đi sâu vertical 3PL/Logistics, build Industry Playbook subscription
- **Nếu cả 2 đều ổn**: White-label Engine cho agency/consultancy ($500–2K/tháng), partner play

**KHÔNG ĐI** enterprise sale lớn ($50K+ deal, 6–12 month cycle) trong Phase 3 — kill founder time, không scale.

---

## 5. Tài sản (Assets) tích luỹ qua 18 tháng

| Asset | T6 | T12 | T18 |
|---|---|---|---|
| MAESTRO baselines L3 | 5/15 | 9/15 | 12/15 |
| Industry deep nodes | 2 (I06, I-MMO) | 3 (+I01) | 5 |
| Workspace Engine | v1 | v1.5 multi-tenant ready | v2 public |
| MMO content library | 60–80 video | 200+ video | 500+ video |
| Email list | 500 | 3K | 10K |
| Case studies B2B | 2 | 6 | 12 |
| Course students | 50 | 300 | 1.5K |

---

## 6. Risks & decision gates

| Risk | Trigger to act | Action |
|---|---|---|
| MMO audience không grow (< 1K T3) | T3 < 1K followers | Đổi format/niche, không tăng investment vào course |
| Engine không stable | T4 < 60% phase auto | Pause B2B intake, focus refine engine |
| B2B churn (client không continue) | 2/3 dự án không có Phase 2 | Review delivery quality, tăng founder involvement |
| Burnout founder content | 1 founder ngừng post 2 tuần | Hire 1 part-time editor, không bỏ kênh |
| Competitor copy MAESTRO | Bất kỳ lúc nào | Tăng tốc industry depth (I-MMO advantage), license content |

---

## 7. Quyết định cần CEO chốt sớm

1. **Phân vai 3 founders:** CEO chốt content + sales B2B; Cánh tay phải = Engine lead; Cánh tay trái = Knowledge/MAESTRO lead. Đúng/sai?
2. **Ngân sách Phase 1:** Mỗi tháng đốt bao nhiêu cho Claude API + tools + content? Đề xuất $500–800/tháng × 6 = $3–5K total. Tự bỏ tiền đều 3 founders hay 1 người fund?
3. **Domain + brand:** Tên công ty, domain, GitHub org → cần đăng ký T1
4. **Legal entity:** LLC VN (nhanh, tiền VN) hay Singapore (cho global SaaS sau này)? Đề xuất delay đến T6 — operate dưới personal contract đến khi cash chứng minh viability
