# Capability Catalog — Tất cả mọi thứ có thể làm

**Mục đích:** Liệt kê **toàn bộ** sản phẩm/dịch vụ khả thi mà venture có thể chào ra thị trường, organize theo 5 cấp độ + thang feasibility. Khi 1 cơ hội xuất hiện (ví dụ khách hàng hỏi AI nông nghiệp, hoặc cần làm Telegram bot), check catalog này trước → đã có template/playbook hay chưa.

**Cách dùng:**
1. Khi nhận đề bài mới → tìm sản phẩm gần nhất trong catalog
2. Nếu đã có ở cấp ≤ Engine v1 (cấp 1–2) → thực thi ngay
3. Nếu cấp 3+ → đánh giá vs Phase hiện tại (xem file 03)
4. Nếu chưa có → ghi nhận vào catalog, đánh dấu cấp + feasibility, lên kế hoạch

---

## 1. Triết lý: Vì sao moat KHÔNG phải là số node MAESTRO đã build

Câu hỏi của các bạn: "Khi khách hàng làm AI nông nghiệp thì xử lý thế nào, vì I-Agriculture chưa có L3 trong MAESTRO?"

**Trả lời:** Moat không phải các node đã build. Moat là **3 thứ có thể generalize:**

1. **MAESTRO matrix là framework, không phải dataset cố định** — 15 baselines × N industries. Khi gặp ngành mới (Agriculture, Pharma, Insurance...), Workspace pipeline tự **adapt baseline knowledge** vào context ngành đó. Cụ thể:
   - α agent đọc baseline JSON (ví dụ B01 Forecasting) — đây là kiến thức **ngành-agnostic**
   - β agent (industry researcher) chạy fresh research cho ngành mới (Agriculture) trong 30–60 phút bằng web search + domain knowledge
   - γ agent dựng final adaptation cho project cụ thể
   - Sau project → sub-node mới được lưu vào MAESTRO → ngành mới có entry

2. **Workspace Engine là pipeline general-purpose** — 9 phases P0–P9 không hard-code cho industry nào. Bất kỳ bài toán nào fit vào pattern "client brief → discovery → proposal → architecture → design → planning → guides → QA → deploy" đều chạy được.

3. **Agent team config là pluggable** — 17 Layer 2 roles có thể swap (ví dụ: thay "Logistics Engineer" bằng "Agronomist + Farm Operations Engineer" cho project nông nghiệp)

**Kết luận:** Với 1 ngành mới (chưa có node), thời gian xử lý chỉ tăng thêm ~30–60 phút research. Không phải 30 ngày build node trước. **Đây là điểm sales chính** — pitch khách hàng "agriculture, mining, gaming, gì cũng làm được trong 2 tuần".

---

## 2. Thang đánh giá

### Cấp độ
| Cấp | Tên | Vốn liếng cần | Thời gian launch | Ghi chú |
|---|---|---|---|---|
| **1** | Knowledge products | $0–500 | 1–4 tuần | Tài sản trí tuệ — PDF, course, template |
| **2** | Service products | Engine MVP | 1–3 tháng | Bán thời gian + brain + Engine |
| **3** | Software products | $1–5K + dev hours | 2–6 tháng | Tool/app cụ thể, single feature |
| **4** | Platform/Infra | $5–30K + 1+ năm | 6–18 tháng | Multi-tenant, API, white-label |
| **5** | Ecosystem | $50K+ hoặc 2+ năm | Năm 2+ | Community, partner network, M&A |

### Feasibility (cho venture cụ thể của các bạn — 3 founders + agentic + VN market)
- ⭐⭐⭐ **CAO** — có thể launch trong 1–3 tháng, market clear, channel có sẵn, fit MAESTRO+Engine
- ⭐⭐ **TRUNG** — cần 3–6 tháng, cần validation, cần thêm tool/skill
- ⭐ **THẤP** — cần năm 2+, hoặc cần capital/team lớn, hoặc xa core
- ❌ **KHÔNG NÊN** — distraction, trap, hoặc anti-pattern cho stage hiện tại

### Strategic fit (cột riêng)
- 🟢 Nuôi MAESTRO/Engine (compound)
- 🟡 Neutral — đem cash nhưng không nuôi engine
- 🔴 Drain — tốn thời gian, không compound

---

## 3. CẤP 1 — Knowledge products

| # | Sản phẩm | Mô tả | Effort | Giá | Khả thi | Fit | Phase đề xuất |
|---|---|---|---|---|---|---|---|
| 1.1 | AI Roadmap PDF (15 baselines × use case) | Bản đồ tổng thể MAESTRO cho người mới | 1 tuần | $19–49 | ⭐⭐⭐ | 🟢 | T1 |
| 1.2 | Notion template "AI Project Tracker" | Template quản lý dự án AI | 1 tuần | $19–39 | ⭐⭐⭐ | 🟡 | T2 |
| 1.3 | Excel/Sheets template "AI ROI Calculator" | Tính ROI dự án AI cho doanh nghiệp | 3 ngày | $9–29 | ⭐⭐ | 🟡 | T3 |
| 1.4 | Prompt Pack (Claude/GPT) per niche | 50–100 prompts cho 1 use case (e.g., MMO, ecom) | 1 tuần | $29–79 | ⭐⭐⭐ | 🟢 | T1–T3 |
| 1.5 | Cheat sheet 1-page (per baseline) | "Khi nào dùng B01 vs B05" | 2 ngày | $0 (lead-gen) | ⭐⭐⭐ | 🟢 | T1 |
| 1.6 | Industry use-case workbook | 30 use case ngành X + worksheet | 2 tuần | $49–99 | ⭐⭐ | 🟢 | T4–T6 |
| 1.7 | Email course 7-day (free → upsell) | Drip email, autoresponder | 1 tuần | $0 (lead) | ⭐⭐⭐ | 🟢 | T2 |
| 1.8 | Audio course / podcast series | 10–15 tập | 3 tuần | $49–99 | ⭐⭐ | 🟡 | T6+ |
| 1.9 | Self-paced video course | "AI Agent đầu tiên kiếm tiền" | 1 tháng | $99–299 | ⭐⭐⭐ | 🟢 | T4–T6 |
| 1.10 | Cohort live course | 4 buổi live + community | 1 tháng prep | $299–599 | ⭐⭐ | 🟢 | T7+ |
| 1.11 | Mastermind program (6 tháng) | Group coaching + accountability | 2 tuần prep | $1,500–3K | ⭐ | 🟡 | Năm 2 |
| 1.12 | 1-1 coaching (hourly) | Mentorship cho founder | 0 prep | $100–300/h | ⭐⭐ | 🔴 | Tránh — không scale |
| 1.13 | Group coaching (10 người) | Bi-weekly call | 1 tuần prep | $99/mo | ⭐⭐ | 🟡 | T7+ |
| 1.14 | Live workshop (paid, 4h) | Online workshop chuyên đề | 1 tuần prep | $99–199 | ⭐⭐⭐ | 🟢 | T3+ |
| 1.15 | Free webinar (lead-gen) | 1h online → upsell | 3 ngày | $0 | ⭐⭐⭐ | 🟢 | T2+ |
| 1.16 | Niche audit report (gated) | "Top 10 AI use case cho 3PL VN" | 2 tuần | $0 (email) | ⭐⭐⭐ | 🟢 | T2 |
| 1.17 | Industry trend report (paid) | Quarterly $99 PDF | 2 tuần | $99 | ⭐⭐ | 🟢 | T6+ |
| 1.18 | Case study collection (bundle) | 10 case studies anonymized | 1 tuần | $49–99 | ⭐⭐ | 🟢 | T9+ |
| 1.19 | Localization service EN→VI | Dịch + adapt content AI EN sang VN | Per project | $200–1K/project | ⭐⭐ | 🔴 | Tránh — drain time |
| 1.20 | Ghost-write white-paper for hire | Viết whitepaper AI cho doanh nghiệp | 2 tuần | $1–3K | ⭐ | 🔴 | Tránh — không compound |

**Tổng nhóm 1:** Phase 1 chốt 5 món: 1.1, 1.4, 1.5, 1.7, 1.9, 1.16. Còn lại defer.

---

## 4. CẤP 2 — Service products

| # | Sản phẩm | Mô tả | Effort | Giá | Khả thi | Fit | Phase |
|---|---|---|---|---|---|---|---|
| 2.1 | AI Feasibility Sprint (Scope A) | 2 tuần → discovery + proposal | Engine MVP | $1.5–3K | ⭐⭐⭐ | 🟢 | T3+ |
| 2.2 | AI Architecture Sprint (Scope B) | 3 tuần → +architecture + tech spec | Engine v1 | $3–5K | ⭐⭐⭐ | 🟢 | T4+ |
| 2.3 | Full Blueprint (Scope C) | 6 tuần → full design + dev guide | Engine v1 | $8–12K | ⭐⭐ | 🟢 | T6+ |
| 2.4 | Turnkey Delivery (Scope D) | 8 tuần → +QA + deploy plan | Engine v1.5 | $12–25K | ⭐⭐ | 🟢 | T9+ |
| 2.5 | Paid Discovery Call (45 phút) | Pre-sales paid filter | 0 | $99–199 | ⭐⭐⭐ | 🟢 | T2+ |
| 2.6 | AI Strategy Retainer (monthly) | 4h/tháng + Slack access | Engine | $1.5–3K/mo | ⭐⭐ | 🟢 | T6+ |
| 2.7 | Industry Playbook subscription | Quarterly playbook + 1h Q&A/tháng | 5 case studies | $1–3K/mo | ⭐ | 🟢 | T9+ |
| 2.8 | Done-for-you agent build | Build custom agent + handover | Per project | $3–8K | ⭐⭐ | 🟢 | T6+ |
| 2.9 | Migration / integration service | Tích hợp AI vào hệ thống có sẵn | Per project | $3–10K | ⭐⭐ | 🟡 | T9+ |
| 2.10 | In-house training workshop | 1–2 ngày training tại doanh nghiệp | 1 tuần prep | $2–5K/buổi | ⭐⭐ | 🟢 | T6+ |
| 2.11 | AI Office Hours subscription | 30 phút/tuần Q&A async | Light | $99–299/mo | ⭐⭐ | 🟡 | T7+ |
| 2.12 | Hourly consulting | Ad-hoc | 0 | $100–300/h | ⭐⭐ | 🔴 | Tránh — không scale |
| 2.13 | Outsourced AI team (T&M) | Cho thuê team theo giờ/sprint | Heavy ops | $20–50/h × 160h/mo | ⭐ | 🔴 | Tránh — agency trap |
| 2.14 | Fractional CAIO (Chief AI Officer) | Part-time exec role | Senior founder | $5–15K/mo | ⭐ | 🟡 | Năm 2 |
| 2.15 | AI implementation oversight | QA cho team in-house client | Light | $1–3K/mo | ⭐ | 🟡 | T9+ |
| 2.16 | 2nd opinion / audit | Đánh giá architecture AI client đã có | 1 tuần | $1–3K | ⭐⭐ | 🟢 | T6+ |
| 2.17 | RFP response service | Helping vendor respond RFP | Per RFP | $1–5K | ⭐ | 🔴 | Tránh — niche |
| 2.18 | Vendor selection consulting | Chọn AI vendor cho client | 2–4 tuần | $2–5K | ⭐ | 🔴 | Tránh — conflict interest sau này |
| 2.19 | Compliance / AI governance setup | Setup AI ethics, data privacy framework | 4 tuần | $3–8K | ⭐ | 🟡 | T12+ (khi enterprise có nhu cầu) |
| 2.20 | Data labeling pipeline setup | Setup quy trình label data + tool | 2–3 tuần | $2–5K | ⭐ | 🟡 | T9+ |
| 2.21 | Prompt engineering workshop in-house | 1 ngày training prompt eng cho client team | 2 ngày prep | $2–4K | ⭐⭐ | 🟢 | T6+ |
| 2.22 | AI hackathon/sprint hosting | Run innovation sprint cho enterprise | 1 tuần | $5–15K | ⭐ | 🟡 | T12+ |
| 2.23 | AI POC build (ngắn 1 tuần) | Quick POC để client demo nội bộ | 1 tuần | $2–5K | ⭐⭐ | 🟢 | T4+ |

**Tổng nhóm 2:** Phase 1 chốt 2.1, 2.2, 2.5. Phase 2 mở 2.3, 2.6, 2.10, 2.21, 2.23. Phase 3 mở 2.4, 2.7.

---

## 5. CẤP 3 — Software products

### 3A. Browser/Editor extensions
| # | Sản phẩm | Effort | Giá | Khả thi | Fit |
|---|---|---|---|---|---|
| 3.1 | Chrome ext "Claude Helper" cho Shopee/TikTok seller | 2 tuần | $9–19/mo | ⭐⭐ | 🟢 |
| 3.2 | Chrome ext "Research Assistant" (highlights + AI summarize) | 3 tuần | $9/mo | ⭐⭐ | 🟡 |
| 3.3 | VS Code extension "MAESTRO Knowledge" | 1 tuần | Free + Pro $9/mo | ⭐ | 🟡 |
| 3.4 | Figma plugin (AI design helper) | 3 tuần | $9–19/mo | ⭐ | 🔴 (xa core) |

### 3B. Custom GPT / Claude Project (sell access)
| # | Sản phẩm | Effort | Giá | Khả thi | Fit |
|---|---|---|---|---|---|
| 3.5 | "MMO Agent Builder GPT" — guided agent build | 3 ngày | $19/mo or $99 lifetime | ⭐⭐⭐ | 🟢 |
| 3.6 | "Logistics Optimizer GPT" | 3 ngày | $29/mo | ⭐⭐ | 🟢 |
| 3.7 | "Ecom Ad Creative GPT" | 3 ngày | $19–29/mo | ⭐⭐⭐ | 🟢 |

### 3C. Bots (messaging platforms)
| # | Sản phẩm | Effort | Giá | Khả thi | Fit |
|---|---|---|---|---|---|
| 3.8 | Telegram bot — broadcast + auto-reply cho MMO | 2 tuần | $19–49/mo | ⭐⭐ | 🟢 |
| 3.9 | Telegram bot — AI signal/trading (CẨN THẬN compliance) | 1 tháng | $19–99/mo | ⭐ | 🔴 (rủi ro pháp lý) |
| 3.10 | Discord bot — community moderation + AI Q&A | 2 tuần | Free + Pro $19/mo | ⭐⭐ | 🟡 |
| 3.11 | Slack bot — daily AI digest cho team | 2 tuần | $5/user/mo | ⭐ | 🟡 |
| 3.12 | Zalo OA bot (VN-specific) | 3 tuần | $29–99/mo | ⭐⭐ | 🟢 (VN moat) |
| 3.13 | Messenger / WhatsApp Business bot | 2 tuần | $19–49/mo | ⭐⭐ | 🟢 |

### 3D. Marketplace integrations (VN ecom)
| # | Sản phẩm | Effort | Giá | Khả thi | Fit |
|---|---|---|---|---|---|
| 3.14 | Shopee seller AI tool (auto reply + listing) | 1.5 tháng | $19–99/mo | ⭐⭐⭐ | 🟢 (audience MMO + ICP-C dùng được) |
| 3.15 | TikTok Shop AI tool (livestream prompt + creative) | 1.5 tháng | $29–99/mo | ⭐⭐⭐ | 🟢 |
| 3.16 | Lazada seller tool | 1 tháng | $19–49/mo | ⭐⭐ | 🟡 |
| 3.17 | Haravan/Sapo plugin | 3 tuần | $19/mo | ⭐ | 🟡 |

### 3E. Productivity tools
| # | Sản phẩm | Effort | Giá | Khả thi | Fit |
|---|---|---|---|---|---|
| 3.18 | n8n/Make pre-built workflow templates | 2 tuần | $29–79 each | ⭐⭐⭐ | 🟢 |
| 3.19 | Notion AI integration template + onboarding | 2 tuần | $49–99 | ⭐⭐ | 🟡 |
| 3.20 | Google Sheets AI add-on | 3 tuần | $5–15/mo | ⭐⭐ | 🟡 |
| 3.21 | Excel add-in (pivot AI) | 3 tuần | $9–19/mo | ⭐ | 🔴 |
| 3.22 | Wordpress plugin (AI SEO content) | 1 tháng | $99/year | ⭐ | 🔴 (red ocean) |
| 3.23 | Shopify app (Vietnamese language pack + AI) | 1.5 tháng | $19/mo | ⭐ | 🟡 |

### 3F. Generators / standalone web apps
| # | Sản phẩm | Effort | Giá | Khả thi | Fit |
|---|---|---|---|---|---|
| 3.24 | AI ad creative generator (TikTok format) | 1.5 tháng | $19–49/mo | ⭐⭐ | 🟢 |
| 3.25 | SEO content generator VN | 1 tháng | $19–49/mo | ⭐ | 🔴 (red ocean) |
| 3.26 | AI script generator cho TikTok creator | 3 tuần | $9–19/mo | ⭐⭐ | 🟢 |
| 3.27 | AI customer support chatbot (white-label) | 2 tháng | $99–499/mo | ⭐⭐ | 🟢 |
| 3.28 | Voice agent / call center automation | 3 tháng | $0.05–0.20/call | ⭐ | 🟡 (phức tạp tech) |
| 3.29 | Video automation tool (mass TikTok producer) | 2 tháng | $49–199/mo | ⭐ | 🔴 (TOS rủi ro) |
| 3.30 | AI invoice/document parser (B2B) | 1.5 tháng | $99–499/mo | ⭐⭐ | 🟢 (B02 baseline) |
| 3.31 | AI demand forecast tool standalone | 2 tháng | $99–499/mo | ⭐⭐ | 🟢 (B01 baseline) |

### 3G. Mobile / desktop apps
| # | Sản phẩm | Effort | Giá | Khả thi | Fit |
|---|---|---|---|---|---|
| 3.32 | Mobile app "AI Productivity" iOS+Android | 3 tháng | Free + Pro $9/mo | ⭐ | 🔴 (high churn) |
| 3.33 | Electron app (offline AI tool) | 2 tháng | $49 lifetime | ⭐ | 🔴 |

**Tổng nhóm 3:** Phase 1 ship 3.5/3.7/3.18 (low effort, fit MMO). Phase 2 ship 3.14/3.15/3.30/3.31 (medium effort, fit ICP-B/C). Phase 3 mới đụng 3.27/3.28.

---

## 6. CẤP 4 — Platform / Infrastructure

| # | Sản phẩm | Mô tả | Effort | Giá | Khả thi | Fit | Phase |
|---|---|---|---|---|---|---|---|
| 4.1 | MAESTRO Pro multi-tenant SaaS | Public version, $20–50/user/mo | 6+ tháng | $20–50/u/mo | ⭐⭐ | 🟢 | T12+ |
| 4.2 | MAESTRO API (per-call) | API access knowledge graph | 3 tháng | $0.01–0.10/call | ⭐⭐ | 🟢 | T9+ |
| 4.3 | Workspace Engine as a Service | Self-serve project intake → deliverables | 4 tháng | $99–499/project | ⭐⭐ | 🟢 | T9+ |
| 4.4 | White-label Engine cho agency | Agency rebrand sells to their clients | 4 tháng | $500–2K/mo | ⭐⭐ | 🟢 | T12+ |
| 4.5 | Marketplace (templates, prompts) | Creator economy platform | 6 tháng | 20% transaction | ⭐ | 🟡 | Năm 2 |
| 4.6 | Plugin store cho Engine | Third-party agents extend engine | 8 tháng | 30% rev share | ⭐ | 🟡 | Năm 2 |
| 4.7 | Embed widget cho partner sites | "Powered by MAESTRO" embed | 2 tháng | $99–299/mo | ⭐ | 🟡 | T12+ |
| 4.8 | Affiliate program platform | Học viên/community refer | 3 tuần (off-shelf tool) | 20–30% commission | ⭐⭐⭐ | 🟢 | T6+ |
| 4.9 | Reseller / partner program | Agencies bán Sprint cho client của họ | 2 tháng | 30% margin share | ⭐⭐ | 🟢 | T9+ |
| 4.10 | Data licensing (anonymized industry insights) | Sell aggregated insight tới VC, research firm | 2 tháng | $5K–50K/dataset | ⭐ | 🟡 | Năm 2 |
| 4.11 | Talent marketplace (AI consultants) | Match clients ↔ certified consultants | 6 tháng | 15–20% transaction | ⭐ | 🔴 (xa core) |
| 4.12 | Compute resale / private cloud | Resell GPU + setup | 3 tháng | Margin 20% | ⭐ | 🔴 |
| 4.13 | Knowledge graph API for AI training data | Bán raw KG data cho AI lab | 1 tháng | $1–10K license | ⭐ | 🟡 (sau khi MAESTRO sâu) |

---

## 7. CẤP 5 — Ecosystem

| # | Sản phẩm | Mô tả | Khả thi | Fit | Phase |
|---|---|---|---|---|---|
| 5.1 | Paid community (mastermind) | $50–200/mo, 100–500 members | ⭐⭐ | 🟢 | T9+ |
| 5.2 | Free community (Discord/Telegram public) | Top of funnel, 5K+ members | ⭐⭐⭐ | 🟢 | T3+ |
| 5.3 | Paid newsletter (Beehiiv/Substack) | Weekly insight, $9–29/mo or sponsored | ⭐⭐ | 🟢 | T6+ |
| 5.4 | Online conference / summit | 1–2 ngày online, $99–299 ticket | ⭐ | 🟡 | Năm 2 |
| 5.5 | Offline conference (HN/HCM) | Yearly event, $199–499 ticket | ⭐ | 🟡 | Năm 2+ |
| 5.6 | Awards / certification | "Certified AI Consultant — MAESTRO" | ⭐ | 🟢 (moat dài hạn) | Năm 2+ |
| 5.7 | Partner network (system integrators) | Co-sell với SI Việt | ⭐ | 🟢 | T12+ |
| 5.8 | VC/incubator partnership | Advisory equity cho startup AI | ⭐⭐ | 🟡 | T9+ |
| 5.9 | M&A — acquire competing solo creator | Buy audience + content | ⭐ | 🟡 | Năm 2+ |
| 5.10 | Acqui-hire team | Hire entire small team | ⭐ | 🟡 | Năm 2+ |
| 5.11 | Spin-out vertical brands | LogiAI, EcomAI, AgriAI sub-brands | ⭐ | 🟡 | Năm 2+ |
| 5.12 | JV với industry association (VLA, VECOM) | Co-branded report/training | ⭐⭐ | 🟢 | T9+ |
| 5.13 | Government / public sector contract | MoLISA, MoIT digital transformation | ⭐ | 🟡 | Năm 2+ |
| 5.14 | Educational partnerships (FPT, RMIT, BKHN) | Curriculum + intern pipeline | ⭐⭐ | 🟢 | T12+ |
| 5.15 | Open-source project (lead-gen) | OSS engine subset → GitHub stars | ⭐⭐ | 🟢 | T9+ |
| 5.16 | Research publication / academic paper | Co-author paper với university | ⭐ | 🟡 | Năm 2+ |
| 5.17 | YouTube channel monetization (ad rev) | $1–5K/mo passive khi 50K+ subs | ⭐⭐ | 🟢 | T9+ |
| 5.18 | Sponsorship / brand deals | Tools tài trợ video/newsletter | ⭐⭐ | 🟢 | T6+ |
| 5.19 | Affiliate income (third-party tools) | Refer ChatGPT, Claude, Cursor, etc. | ⭐⭐⭐ | 🟢 | T1+ |
| 5.20 | Book deal / publish | "Cuốn sách AI cho doanh nghiệp Việt" | ⭐ | 🟡 | Năm 2+ |
| 5.21 | Speaking / keynote engagements | $1–5K/talk | ⭐⭐ | 🟢 | T9+ |
| 5.22 | Podcast (own) | Top of funnel + sponsorship | ⭐⭐ | 🟢 | T6+ |

---

## 8. Industry coverage — đảm bảo "đề bài bất kỳ ngành nào" đều xử lý được

### 20 industries của MAESTRO + status

| Code | Ngành | VN market size | MAESTRO L3 status | Vào market khi |
|---|---|---|---|---|
| I01 | E-commerce | Lớn ($20B+ GMV VN 2026) | T6 (Phase 1) | T4–6 |
| I02 | Finance / Banking | Rất lớn, regulated | Defer (T18+) | Năm 2 |
| I03 | Healthcare | Lớn, regulated | Defer (T18+) | Năm 2 |
| I04 | Manufacturing | Lớn (FDI heavy) | T12+ | T9+ |
| I05 | Agriculture | Trung, gov-supported | **On-demand** (xem dưới) | Khi có inbound |
| I06 | Logistics | Lớn (3PL, ecom-driven) | T1 (Phase 1) | T0–T6 |
| I07 | Energy | Trung, regulated | Defer | Năm 2+ |
| I08 | Construction | Lớn nhưng AI-late | Defer | Năm 2+ |
| I09 | Education | Trung, đông consumer | T9+ | T9+ |
| I10 | Telecom | Trung, oligopoly | Defer | Năm 2+ |
| I11 | Legal | Nhỏ VN, regulated | Defer | Năm 2+ |
| I12 | Media / Content | Trung, MMO overlap | T6+ | T6+ |
| I13 | Transportation | Overlap với I06 | Cùng I06 | T6+ |
| I14 | F&B | Lớn (chuỗi F&B + delivery) | T9+ | T9+ |
| I15 | Insurance | Trung, regulated | Defer | Năm 2+ |
| I16 | Pharma | Nhỏ VN, regulated | Defer | Năm 2+ |
| I17 | Gaming | Trung, growing | T12+ | T12+ |
| I18 | Marketing / Advertising | Lớn (overlap MMO) | T3+ | T3+ |
| I19 | HR / Recruitment | Trung | T9+ | T9+ |
| I20 | Cybersecurity | Trung, regulated | Defer | Năm 2+ |
| **NEW** | I-MMO (Make Money Online) | Niche but loud | T6 (Phase 1) | T0–T6 |

### Khi khách hàng đến với ngành CHƯA CÓ L3 (ví dụ Agriculture)

**Workspace pipeline tự xử lý:**

```
P0 Intake — agent ghi nhận: "client làm AI quản lý vườn cà phê"
P1 Discovery (β industry researcher)
  → Web search: "AI in coffee farming Vietnam", "smart agriculture", "IoT crop monitoring"
  → 1-2h research, output: Industry context summary cho Agriculture
  → Cache vào MAESTRO/I-Agri folder cho reuse
P2 Proposal — α matching baselines
  → B01 Forecasting (weather, yield), B07 Anomaly (pest detection),
    B03 Computer Vision (drone imagery), B11 Knowledge Graph (crop knowledge)
  → Generate scope A proposal
P3+ tiếp tục pipeline bình thường
```

**Cost overhead:** ~30–60 phút research thêm vs ngành đã có L3. Pricing **vẫn giữ nguyên** $1.5–15K/sprint. Sau project → I-Agri có 1 sub-node mới = MAESTRO grow.

**Sales messaging:** "Bạn làm ngành nông nghiệp à? Chúng tôi vừa làm 2 dự án ngành tương tự (analogy generator), pipeline 2 tuần ra proposal cho bạn. Phí giống các ngành khác."

→ Đây chính là **"đề bài bất kỳ ngành nào cũng làm được"** — Engine generalize, không cần build trước.

---

## 9. Filter quyết định: vào Phase nào?

### Quy tắc 80/20 cho Phase 1 (T0–T6)

**Chỉ ship 6 sản phẩm.** Tất cả phải:
- ⭐⭐⭐ feasibility
- 🟢 fit (nuôi MAESTRO/Engine)
- Total effort ≤ 18 founder-weeks (3 founders × 6 tháng × ~1 ngày/tuần cho từng item)

**Đề xuất 6 sản phẩm Phase 1:**
1. **1.1** AI Roadmap PDF (T1) — $19–49
2. **1.4** Prompt Pack MMO + Ecom (T2) — $29–79
3. **1.16** Niche audit report Logistics (T2) — free lead-gen
4. **1.9** Course "AI Agent đầu tiên kiếm tiền" (T5–6) — $99–299
5. **2.1+2.2** AI Sprint A/B (T3+) — $1.5–5K
6. **3.18** n8n/Make workflow templates (T2–3) — $29–79

**Cộng thêm 1 channel-product:** TikTok content build-in-public (file 05) — không phải product nhưng là "asset" tốn time.

**Tổng:** 6 products + 1 channel = tải 18-20 founder-weeks. Khớp.

### Trap tránh trong Phase 1
- ❌ 2.13 Outsourced AI team T&M — agency trap, không scale
- ❌ 3.32 Mobile app — high effort, high churn, low ARPU
- ❌ 3.25 SEO content generator — red ocean, dùng pivot.ai etc đã có
- ❌ 4.1 MAESTRO Pro multi-tenant SaaS — không build trước khi có audience 10K+
- ❌ 5.4 Conference — premature scaling
- ❌ 1.12 1-1 coaching — không scale
- ❌ 1.19 Localization service — drain time
- ❌ 3.29 Mass video automation — TOS rủi ro

---

## 10. Update process

- Mỗi tháng 1 founder review catalog: thêm sản phẩm mới (đề bài lạ → analyze và xếp cấp)
- Mỗi quarter: re-rate feasibility (market change, tech change)
- Khi 1 sản phẩm chuyển từ ⭐ → ⭐⭐ → ⭐⭐⭐ → trigger build trong sprint kế tiếp
- Khi 1 sản phẩm chuyển từ 🟢 → 🟡 → 🔴 → kill nếu đang chạy

**Owner catalog:** CEO (review) + 1 founder làm secretary (update changelog)

---

## 11. Tóm tắt 1 trang

```
TỔNG SẢN PHẨM CATALOG: ~100 items across 5 cấp độ

CẤP 1 (Knowledge): 20 items — ship 5 trong Phase 1
CẤP 2 (Service):    23 items — ship 3 trong Phase 1
CẤP 3 (Software):   33 items — ship 1-2 trong Phase 1
CẤP 4 (Platform):   13 items — Phase 2-3
CẤP 5 (Ecosystem):  22 items — Phase 3+

PHASE 1 (T0-T6) ship list:
  1.1 PDF roadmap, 1.4 Prompt Pack, 1.9 Course, 1.16 Audit report,
  2.1/2.2 Sprint A/B, 3.18 n8n templates
  + Build-in-public TikTok content (channel asset)

GENERALIZATION GUARANTEE:
  Đề bài ngành mới (Agriculture, Healthcare, Pharma, Gaming, ...) =
  Engine xử lý được trong 2 tuần với +30-60 phút research overhead.
  KHÔNG cần build node trước khi sale.
```
