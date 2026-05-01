# 19 — Asia Localization (VN-first)

> **Vị trí trong stack**: L5 Strategy · localization layer (L5.5) đặt **trước khi** đụng L4 dự án và trước khi quote pricing cho lead châu Á. **Last updated**: 2026-04-26 · **v1.0 (VN-first)**.

**Quy tắc số 1**: facts pháp lý / tài chính / payment có timestamp. Mọi mục trong file này có **`[verify-by: YYYY-MM-DD]`** — quá hạn = không tin cậy được nữa, cần re-research trước khi cite cho client. Không bao giờ paste nguyên file vào proposal mà không re-verify section liên quan.

---

## 0. Tại sao cần file này

Skeleton 5-layer (`PROJECT.md`) **neutral về region**. Khi lead Việt Nam / SEA xuất hiện, ngay câu thoại đầu sẽ có 3–5 câu không trả lời được nếu thiếu file này:

- *"Các bạn có hiểu Nghị định 13 không?"*
- *"Tích hợp VNPay/Momo được không, chứ Stripe khách Việt không xài"*
- *"Hoá đơn điện tử / e-invoice handle thế nào?"*
- *"Báo giá VND hay USD? Có anchor không?"*
- *"Có support Shopee/Lazada/TikTok Shop API không?"*

File này = **playbook thắng 5 câu này**. Ngắn gọn, fact-checkable, refresh 6 tháng/lần.

---

## 1. Pháp lý & Compliance Việt Nam

### 1.1 Bảo vệ dữ liệu cá nhân — Nghị định 13/2023/NĐ-CP `[verify-by: 2026-10-26]`

- **Hiệu lực**: 1/7/2023.
- **Phạm vi**: bất kỳ tổ chức nào xử lý dữ liệu cá nhân của công dân VN, kể cả công ty nước ngoài.
- **Đối tượng dữ liệu cá nhân (DLCN)**: tên, CCCD/CMND, số ĐT, email, địa chỉ, dữ liệu sinh trắc, dữ liệu sức khỏe, vị trí, hành vi, etc.
- **DLCN nhạy cảm**: chính trị, tôn giáo, sức khỏe, sinh trắc, vị trí địa lý chính xác → yêu cầu cao hơn.
- **Yêu cầu chính**:
  - **Sự đồng ý** (consent) phải rõ ràng, có văn bản hoặc điện tử có thể chứng minh.
  - **DPIA (đánh giá tác động)** trước khi xử lý DLCN nhạy cảm.
  - **Thông báo Bộ Công an** khi có vi phạm trong 72h.
  - **Lưu trữ**: dữ liệu công dân VN có thể yêu cầu lưu trữ tại VN (theo Luật An ninh mạng 2018 + NĐ 53/2022).
  - **DPO (Data Protection Officer)** với tổ chức xử lý DLCN nhạy cảm quy mô lớn.
- **Phạt**: hành chính (NĐ 15/2020) + dân sự + hình sự (Điều 288 BLHS sửa đổi).
- **Tham chiếu khác**: Luật An toàn thông tin mạng 2015, Luật An ninh mạng 2018, Bộ luật Dân sự 2015.

**Implication cho studio**:
- Mọi project chạm DLCN của user VN → SOW phải có điều khoản consent + retention + breach notification.
- Stack rules: ưu tiên hosting có data center VN (Viettel IDC, FPT, VNG Cloud, CMC) khi NDS/sensitive.
- Skill card affected: T6-qa security checklist + T2-architect data residency clause.

### 1.2 Luật An ninh mạng 2018 + NĐ 53/2022 `[verify-by: 2026-10-26]`

- **Data localization**: 1 số loại dữ liệu (user-generated content, dữ liệu cá nhân, mối quan hệ) của user VN — provider trong nước phải lưu tại VN; provider nước ngoài có thể được yêu cầu nếu vi phạm.
- **Đại diện pháp lý**: provider xuyên biên giới có thể phải có đại diện tại VN.
- **Implication**: với SaaS bán cho khách VN scale lớn, cần roadmap data residency.

### 1.3 Hóa đơn điện tử (HDDT) `[verify-by: 2026-10-26]`

- **Bắt buộc 100%** với mọi doanh nghiệp từ 1/7/2022 (theo NĐ 123/2020 + Thông tư 78/2021).
- **Tích hợp**: cần kết nối với Tổng cục Thuế (T-VAN) qua provider được cấp phép (Viettel, FPT, MISA, VNPT, BKAV, Easyinvoice, Bkav, etc.).
- **Format**: XML chuẩn TCT.
- **Implication**: client SMB/Mid VN sẽ hỏi "có tích hợp HDDT không?" — answer: tích hợp qua API provider, không build từ đầu.

### 1.4 Thuế

- **VAT**: chuẩn 10%, 1 số mặt hàng 5%, dịch vụ xuất khẩu 0%. Có giai đoạn giảm 8% theo policy. `[verify-by: 2026-07-01]`
- **CIT (thuế thu nhập DN)**: 20% standard, 17% với DN nhỏ một số ngành/giai đoạn ưu đãi. `[verify-by: 2026-10-26]`
- **PIT (thu nhập cá nhân)**: lũy tiến 5%–35%, 7 bậc.
- **Withholding tax dịch vụ nước ngoài**: thường 5% VAT + 5% CIT = 10% trên gross hoặc theo công thức cụ thể (FCT — Foreign Contractor Tax).
- **Implication**: client VN trả cho studio VN dùng VAT invoice; client VN trả cho contractor nước ngoài → FCT có thể áp. SOW phải clarify ai chịu FCT.

### 1.5 Hợp đồng & lao động

- **Hợp đồng dân sự** giữa studio và client B2B: theo BLDS 2015. E-signature hợp lệ theo Luật GDĐT 2005 (đang sửa đổi 2026 `[verify-by: 2026-12-31]`).
- **Lao động**: BLLĐ 2019 hiệu lực 1/1/2021. 5-day or 6-day workweek, max 48h/tuần (linh hoạt với agreement). Bảo hiểm xã hội bắt buộc.
- **Freelancer/contractor**: hợp đồng dịch vụ (BLDS), không phải lao động — không bảo hiểm bắt buộc, nhưng cần kê khai PIT.

---

## 2. Payment Vietnam

### 2.1 Domestic — B2C (cần khi project có thanh toán user cuối)

| Cổng | Loại | Phí typical | Settlement | Khi dùng |
|---|---|---|---|---|
| **VNPay** | Bank gateway (QR + ATM + Visa/MC) | 1.0–2.0% | T+1 | E-com, ngân hàng, large merchant |
| **OnePay** | Bank gateway | 1.5–3.0% | T+1 | Travel, hospitality |
| **NganLuong** | Wallet + gateway | 1.5–3.0% | T+1 | E-com nhỏ |
| **Momo** | Wallet (28M+ users `[verify-by: 2026-04-01]`) | 1.5–2.5% | T+1 | C2C + mass-market |
| **ZaloPay** | Wallet (VNG ecosystem) | 1.5–2.5% | T+1 | Zalo-integrated apps |
| **ViettelPay** | Wallet (Viettel) | 1.0–2.0% | T+1 | Tier-2/3 cities, telco bundle |
| **ShopeePay** | Wallet (Shopee) | varies | T+1 | E-com tích hợp Shopee |
| **Apple Pay / Google Pay** | Tokenized cards | qua VNPay/OnePay | T+1 | iOS/Android premium |

**Lưu ý**:
- **Stripe KHÔNG hoạt động native ở VN** cho merchant VN. Khách VN có thể thanh toán bằng Visa/MC qua Stripe nhưng merchant phải có entity nước ngoài (SG/HK/US). `[verify-by: 2026-10-26]`
- **PayPal** hoạt động cho B2C inbound nhưng phí cao + payout phức tạp.
- **Crypto**: VN cấm thanh toán crypto chính thức, nhưng OTC/USDT phổ biến cross-border. Không recommend đưa vào SOW.

### 2.2 Domestic — B2B (cho client trả studio)

- **Chuyển khoản ngân hàng (chủ yếu)**: Vietcombank, Techcombank, BIDV, MB Bank, ACB, VPBank, TPBank.
- **NAPAS 247**: chuyển khoản nhanh 24/7 giữa ngân hàng VN, free hoặc rất rẻ.
- **Hóa đơn VAT** kèm theo (HDDT §1.3).
- Studio VN nên có account đa ngân hàng (≥ 2) để client linh hoạt.

### 2.3 Cross-border — client VN trả studio nước ngoài (hoặc ngược lại)

- **SWIFT wire**: $25–50 phí + 1–3 ngày, dùng cho ≥ $5K invoice.
- **Wise (formerly TransferWise)**: rẻ hơn SWIFT, multi-currency.
- **Payoneer**: phổ biến với freelancer VN nhận USD.
- **Crypto USDT (TRC20)**: thực tế dùng nhiều nhưng grey-zone, không bao giờ ghi vào SOW chính thức.
- **FCT**: nhớ chuẩn bị (§1.4).

### 2.4 Implication cho stack rules

Update `_shared/rules/10-stack-rules.md` §approved-payment-providers (VN section):
- Default B2C: VNPay (gateway) + Momo (wallet) — cover ~80% volume.
- Add ZaloPay nếu integrate Zalo Mini App.
- Stripe chỉ khi entity SG/HK/US.

---

## 3. E-Commerce & MMO Vietnam / SEA

### 3.1 E-commerce VN — marketplace

| Sàn | Market share VN `[verify-by: 2026-04-01]` | API public | Đặc trưng |
|---|---|---|---|
| **Shopee** | #1 (~60%+ GMV) | Shopee Open Platform | Mass market, free shipping ecosystem, ShopeePay |
| **TikTok Shop** | #2 và tăng nhanh `[verify-by: 2026-04-01]` | TikTok Shop API | Live commerce, video-first |
| **Lazada** | Top 3 | Lazada OpenAPI | Brand-leaning, Alibaba ecosystem |
| **Tiki** | Top 4 | Tiki API | Books / electronics, premium positioning |
| **Sendo** | Tier 2 | Sendo OpenAPI | Tier-2/3 cities |

**Implication**: nếu client là seller / brand VN, project thường gồm:
- Multi-marketplace inventory sync (skill: T4-dev-backend + T3-integration)
- Order aggregation
- Pricing/promotion automation
- Live-commerce analytics (TikTok Shop)
- Shopee SLT (Shopee Live Tools) integration

Knowledge to seed (sau Project 0): `knowledge/industries/I02-ecommerce-SEA/marketplaces/`.

### 3.2 MMO / Gaming Asia `[verify-by: 2026-10-26]`

| Publisher | HQ | Mạnh ở | Game flagship |
|---|---|---|---|
| **VNG** | VN | VN, SEA | Liên Quân Mobile (tencent license), PUBG Mobile VN, Zalo |
| **Garena (SEA)** | SG (Sea Group) | SEA wide | Free Fire (#1 mobile SEA), Liên Quân, FIFA Online |
| **Funtap** | VN | VN | RPG mobile chinese-imported |
| **SohaGame** | VN (VCCorp) | VN | Webgame + mobile imported |
| **Riot Games** | US (Tencent) | Global, VN có server | LoL Wild Rift, Valorant |
| **Tencent direct** | CN | CN, ASEAN partial | PUBG Mobile, Honor of Kings |
| **NetEase** | CN | CN, expand SEA | Identity V, Onmyoji, Marvel Rivals |

**Implication MMO product line**:
- $30 PDF "Gacha rates analysis VN servers" — viable.
- $30 PDF "MMO publisher landscape VN" — recurring evergreen.
- Player metrics tools, payment optimization (Apple/Google IAP geo-pricing VN), KOL/streamer analytics — service tier.

Knowledge to seed: `knowledge/industries/I03-MMO-Asia/publishers/`, `monetization/`, `regulatory/`.

### 3.3 Logistics VN `[verify-by: 2026-10-26]`

- **Last-mile**: Giao Hàng Nhanh (GHN), Giao Hàng Tiết Kiệm (GHTK), Viettel Post, J&T Express, Best Express, Shopee Express, Lazada Logistics.
- **3PL / fulfillment**: Boxme, AhaMove (intracity), Lalamove.
- **Cold chain**: Vinafco, Gemadept, ITL.
- **Customs / cross-border**: Cainiao, DHL, FedEx, UPS, Viettel Post International.

**Pain points client thường có**:
- Multi-carrier rate comparison + auto-select
- Track-and-trace unified API
- Cash-on-delivery (COD) reconciliation — vẫn rất phổ biến VN
- Returns flow

Knowledge to seed: `knowledge/industries/I01-logistics-VN/carriers/`, `cod-reconciliation/`, `tms-stack/`.

---

## 4. Pricing — Anchor Theo Region

### 4.1 USD baseline (từ `business-strategy/10-pricing-sheet.md`)

Pricing chính = **USD**. Lý do: studio định vị international, currency hedging, cross-border B2B contracts.

### 4.2 Anchor theo currency địa phương `[verify-by: 2026-07-01]`

| Tier | USD | VND (≈25,000) | SGD (≈1.35) | THB (≈36) | IDR (≈16,000) | MYR (≈4.7) |
|---|---|---|---|---|---|---|
| MMO PDF | $30 | 750K | 41 SGD | 1,080 THB | 480K IDR | 141 MYR |
| Sprint A POC | $500 | 12.5M | 675 SGD | 18K THB | 8M IDR | 2,350 MYR |
| Sprint B | $2K–$5K | 50M–125M | 2.7K–6.7K SGD | 72K–180K THB | 32M–80M IDR | 9.4K–23.5K MYR |
| Sprint C | $10K–$25K | 250M–625M | 13.5K–33.7K SGD | 360K–900K THB | 160M–400M IDR | 47K–117.5K MYR |
| Sprint D | $25K+ | 625M+ | 33.7K+ SGD | 900K+ THB | 400M+ IDR | 117.5K+ MYR |

**Quy tắc quote**:
- Quote chính bằng USD.
- Đề cập VND equivalent với client VN, nhưng SOW signed bằng USD nếu cross-border.
- Nếu client VN entity và pay bằng VND → invoice VND, cố định tỷ giá tại ngày sign trong SOW (clause "tỷ giá VND/USD = X tại ngày Y, áp dụng cho mọi milestone").
- **KHÔNG discount** > 10% chỉ vì "thị trường VN giá thấp hơn". USP của studio là quality + speed, không phải cheap.

### 4.3 Currency conversion refresh

- Tỷ giá quote refresh **mỗi quý** (review trong W02 quarterly off-site, xem `business-strategy/09`).
- Trong file này dùng tỷ giá tham khảo `[verify-by: 2026-07-01]` — quá hạn → refresh trước khi dùng.

---

## 5. Language Operations

### 5.1 Tier 1 — VN + EN (mặc định)

- **Vietnamese**: 100% docs cho client VN entity. Tone: trang trọng vừa, không dùng quá nhiều English jargon trừ technical term.
- **English**: 100% nội bộ docs studio (file system này). Cross-border B2B contract.
- **Bilingual deliverable**: nếu client VN tier C/D, có thể bundle English version cho parent company / international auditor (charge extra 15–20%).

### 5.2 Tier 2 — Expand (sau Project 0–5, nếu có lead thực sự)

| Lang | Khi cần | Resource |
|---|---|---|
| 中文 (CN) | Client VN có parent company TQ; hoặc client SG/MY Chinese-speaking | Native translator partner, không tự dịch |
| ไทย (TH) | Lead Thailand | Translator partner |
| Bahasa Indonesia | Lead ID | Translator partner |
| 한국어 (KR) | Lead KR (rare for studio) | Translator partner |

**Quy tắc**: KHÔNG promise multi-language ops cho lead nếu chưa có translator partner ký NDA. Chốt partner trước, không sau.

### 5.3 LLM language considerations

- Vietnamese: Claude (Sonnet 4) + GPT-4o đều OK; Gemini 2.0+ tốt với VN.
- Tiếng Việt có dấu: prompt phải explicit "trả lời tiếng Việt có dấu đầy đủ", không thì có model trả về không dấu.
- Domain term VN (logistics / e-com / luật): luôn fact-check, mức độ hallucinate cao hơn EN ~ 1.5×.

Update `_shared/rules/10-stack-rules.md` §llm-language-policy.

---

## 6. Cultural & Operational

### 6.1 Lịch nghỉ VN `[verify-by: yearly]`

- **Tết Nguyên Đán**: ~7–9 ngày (cuối Jan / đầu Feb tuỳ năm). **Nguyên tháng trước Tết, business gần như đóng**.
- **Giỗ Tổ Hùng Vương**: 10/3 âm lịch (~April).
- **30/4 + 1/5**: 2 ngày nghỉ (Reunification + Labor).
- **2/9**: Quốc khánh.
- **Implication**: tránh schedule G1/G2 gate hoặc go-live trong tuần Tết. SOW timeline phải tránh.

### 6.2 Lịch nghỉ SEA `[verify-by: yearly]`

- **Tết Trung Hoa (CNY)**: SG/MY/ID-Chinese (~Feb).
- **Songkran TH**: 13–15/4.
- **Hari Raya**: ID/MY (cuối Ramadan).
- **Implication**: project cross-SEA cần buffer 2 tuần / năm cho holiday.

### 6.3 Business etiquette

- **VN**: meeting bắt đầu social 10–15', sau đó vào việc. Title quan trọng (anh/chị, không gọi tên trống). Card visit (danh thiếp) đưa hai tay với client tier C/D.
- **Decision**: thường top-down, đợi quyết của leader. Câu hỏi quan trọng → lúc 1-on-1 sau meeting, không trên bàn.
- **Pace**: ban đầu chậm (relationship), về sau nhanh khi đã trust.

### 6.4 Work hours

- **VN**: 8:00–17:00 hoặc 8:30–17:30, lunch 12:00–13:00 hoặc 13:30. Sat off (nhiều cty) hoặc Sat sáng (cty truyền thống).
- **SG**: 9:00–18:00 chuẩn corporate.
- **TH/ID**: 8:30–17:30, prayer break ID/MY khi giờ Hồi giáo.

### 6.5 Communication channel preferences

- **VN client B2B**: Zalo (cá nhân / nhóm dự án), email (formal), Slack/Teams (rare ngoài tech). Skype + Microsoft Teams phổ biến với enterprise.
- **SG/MY**: WhatsApp + email + Slack.
- **TH**: Line + email.
- **ID**: WhatsApp dominant.

**Implication**: studio cần chuẩn bị Zalo OA (Official Account) hoặc nhân viên dùng Zalo cá nhân cho client VN. Thoả thuận trước trong handoff S5.

---

## 7. Compliance khi hiring tại Việt Nam (nếu studio scale)

### 7.1 Hiring nhân viên FT VN `[verify-by: 2026-10-26]`

- **Hợp đồng lao động** theo BLLĐ 2019: HĐ xác định thời hạn (≤ 36 tháng, max 1 lần ký lại) hoặc HĐ không xác định thời hạn.
- **BHXH bắt buộc**: ~21.5% lương từ employer + 10.5% từ employee (BHXH + BHYT + BHTN).
- **Thử việc**: max 60 ngày (chuyên môn cao) hoặc 30 ngày (lao động phổ thông).
- **PIT khấu trừ tại nguồn**.

### 7.2 Hiring contractor / freelancer

- HĐ dịch vụ theo BLDS, không bảo hiểm bắt buộc.
- Studio chỉ cần PIT 10% nếu freelancer chưa có MST + thu nhập ≥ 2M/lần (theo TT 111/2013) — hoặc theo declarations contractor.
- Đơn giản hơn FT, recommend cho team agentic AI period bootstrap.

### 7.3 Implication cho `business-strategy/07-agent-team-development.md`

- Default first 5 hires: contractor, không FT, để giảm overhead BHXH + flexibility.
- FT chỉ khi MRR > $10K/tháng stable 6 tháng.

---

## 8. Localization Checklist cho Mỗi Project (chèn vào P0 Intake)

Khi `00-intake.md` có client VN/SEA, driver phải tích đủ trước khi dispatch P1:

- [ ] Xác định **client entity location**: VN entity / SG/HK shell / parent country?
- [ ] Xác định **target users location**: VN-only / SEA / global?
- [ ] **Data residency** required? → trigger NĐ 13 + LANM clauses.
- [ ] **Payment integration** scope? → list cổng theo §2.
- [ ] **Marketplace integration** scope? → list theo §3.1.
- [ ] **HDDT / e-invoice** integration needed?
- [ ] **Currency / pricing**: VND / USD / dual?
- [ ] **Language deliverable**: VN-only / EN-only / bilingual?
- [ ] **Holiday window** ảnh hưởng timeline? (Tết, Songkran, Ramadan)
- [ ] **Communication channel**: Zalo cần setup?

Add this checklist vào `_shared/templates/project/00-intake.md` §regional-context (next update).

---

## 9. SEA Expansion Outline (v2.0 — chỉ skeleton)

Khi studio có ≥ 1 lead/customer ở SG/TH/ID/MY/PH, expand từng country thành section riêng theo template:

```
## X.Y Country: {NAME}
### X.Y.1 Pháp lý chính (data, tax, e-invoice)
### X.Y.2 Payment (gateway, wallet, B2B)
### X.Y.3 E-com / vertical chính
### X.Y.4 Currency anchor
### X.Y.5 Language + culture quirks
### X.Y.6 Holiday calendar
```

**Bộ skeleton SEA cần fill khi có lead** (priority order):
1. **Singapore** — easiest, English, PDPA, GST 9%, PayNow + Stripe-friendly.
2. **Indonesia** — biggest SEA market, UU PDP 2022, GoPay/OVO/DANA, Tokopedia/Shopee, Bahasa.
3. **Thailand** — PDPA TH, PromptPay, Line dominant, Lazada strong.
4. **Malaysia** — bilingual (BM+EN), PDPA 2010, Touch'n Go/Boost, Shopee/Lazada.
5. **Philippines** — Data Privacy Act 2012, GCash/Maya, English-friendly.

KHÔNG fill v0.1 từ tưởng tượng. Fill khi có **dữ kiện thật** từ project hoặc lead conversation. Ghi `[verify-by]` mỗi facts.

---

## 10. Knowledge Seeding Plan (sau localization, gắn với Option 1)

File này giúp **seed có hướng** cho `knowledge/industries/`:

- `I01-logistics-VN/`: § 3.3 + §1.5 contractor patterns
- `I02-ecommerce-SEA/`: §3.1 + §2 payment + §1.3 HDDT
- `I03-MMO-Asia/`: §3.2 + §2.1 wallet (Momo/ZaloPay) + §6.1 holiday impact gacha
- `_taxonomy/regulatory/`: §1 entire
- `_taxonomy/payment/`: §2 entire

Tách facts ra knowledge layer **chỉ sau khi đã verified qua 1 project thật** (Option 3 dogfood). Nguyên tắc: facts trong file này được fact-check 1 lần lúc viết; promote lên `knowledge/` chỉ khi **lần 2 verify thành công** trong project context.

---

## 11. Risk & Anti-Pattern

| Risk | Hậu quả | Mitigation |
|---|---|---|
| File này stale ≥ 12 tháng | Quote cho client sai luật / payment | Quarterly refresh cycle (W02 quarterly review) |
| Founder không đọc Section 1 trước Sales call client VN | Mất uy tín ngay câu đầu | Onboarding W06 yêu cầu đọc §1+§2+§3 cho Role B Sales |
| Promise multi-language nhưng không có translator partner | Delivery fail | §5.2 rule: chốt partner trước promise |
| Build payment custom thay vì dùng VNPay/Momo SDK | Compliance + cost + maintenance | Stack rule §2.4 |
| Quote VND fixed mà tỷ giá biến động | Lỗ FX khi delivery | §4.2 clause "tỷ giá tại ngày sign" |
| Schedule go-live tuần Tết | Không support được nếu sự cố | §6.1 rule + W03 timeline check |

---

## 12. Cross-References

- Strategy: `01-strategy-overview.md`, `02-customer-segments.md` (refine ICP châu Á), `09-phase1-execution-plan.md`
- Pricing: `10-pricing-sheet.md` (sync §4 anchor table)
- Sales playbook: `12-sales-playbook.md` (add VN/SEA objection handling)
- Hiring: `07-agent-team-development.md` (sync §7 contractor-first)
- Ops: `15-business-operations.md` (sync §6 holiday + work hours)
- Stack rules: `@../_shared/rules/10-stack-rules.md` (sync payment + LLM language)
- Project intake: `@../_shared/templates/project/00-intake.md` (add §8 checklist)
- Knowledge seed plan: `@../knowledge/README.md` + Option 1 future
- Pipeline P0: `@../experience/workspace/docs/pipeline/P0-INTAKE.md` (driver tick checklist §8)

---

## 13. Update Log

| Date | Version | What | By |
|---|---|---|---|
| 2026-04-26 | 1.0 | VN-first creation, SEA outline skeleton | (this session) |

**Next refresh due**: 2026-10-26 (6 tháng) cho §1 pháp lý + §2 payment + §4 currency. Yearly refresh §6.1/§6.2 holiday lists.

---

*v1.0 · ~7K tokens · designed as L5.5 between Strategy and Project layer*
