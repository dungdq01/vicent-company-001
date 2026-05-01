# Bao cao Danh gia Kha thi: B02 — Document Intelligence
## Tac gia: Dr. Sentinel (R-gamma) — Ngay: 2026-03-31
## Trang thai: CAN REVIEW
## Tiep theo: R-sigma — Tong hop va cap nhat Knowledge Graph

---

## 1. Tom tat danh gia

Document Intelligence (Tri tue Tai lieu) la mot trong nhung linh vuc AI co tiem nang ung dung thuc te lon nhat tai Viet Nam. Bao cao nay danh gia kha thi trien khai Document Intelligence tu cac goc do: ky thuat, thi truong, du lieu, rui ro, va canh tranh.

### 1.1. Tom tat nhanh

| Hang muc | Danh gia |
|----------|---------|
| **Do truong thanh cong nghe** | Cao — OCR va layout analysis da truong thanh; VLMs dang cach mang hoa linh vuc |
| **Nhu cau thi truong Viet Nam** | Rat cao — ngan hang, bao hiem, hanh chinh cong, logistics deu can |
| **Kha nang trien khai** | Kha thi — co san nhieu cong cu open-source, co the bat dau voi MVP 6-8 tuan |
| **Rao can gia nhap** | Trung binh — thach thuc chinh la du lieu huan luyen tieng Viet va dau thanh dieu |
| **Canh tranh** | Cao — FPT.AI, VinAI, Cinnamon da co mat; nhung con nhieu nich chua duoc phuc vu |
| **Ket luan** | **CONDITIONAL GO** — Co the trien khai thanh cong voi dieu kien tap trung vao nich cu the |

### 1.2. Tong quan phuong phap danh gia

Bao cao su dung khung danh gia 5 chieu:
1. **Technical Feasibility**: Cong nghe co san va du truong thanh khong?
2. **Market Demand**: Thi truong co du lon va co nhu cau thuc khong?
3. **Data Availability**: Du lieu huan luyen va benchmark co san khong?
4. **Implementation Risk**: Rui ro trien khai co the kiem soat khong?
5. **Competitive Landscape**: Co the canh tranh va khac biet hoa khong?

---

## 2. Diem kha thi (Feasibility Score)

### 2.1. Bang diem chi tiet

| Tieu chi | Diem | Trong so | Diem co trong so | Giai thich |
|----------|------|----------|-------------------|-----------|
| **Technical Feasibility** | 8/10 | 25% | 2.00 | Cong nghe truong thanh, nhieu tool open-source, VLMs manh |
| **Market Demand** | 9/10 | 25% | 2.25 | Nhu cau cuc lon tai VN: ngan hang, bao hiem, hanh chinh, logistics |
| **Data Availability** | 5/10 | 20% | 1.00 | Thieu dataset tieng Viet; XFUND-VI nho; can tu thu thap |
| **Implementation Risk** | 6/10 | 15% | 0.90 | Rui ro trung binh: dau thanh dieu, chat luong tai lieu, privacy |
| **Competitive Landscape** | 6/10 | 15% | 0.90 | Doi thu manh (FPT.AI, VinAI) nhung con nhieu nich |
| **TONG** | | 100% | **7.05/10** | |

### 2.2. Verdict (Ket luan)

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   VERDICT: CONDITIONAL GO (Trien khai co dieu kien)           ║
║                                                                ║
║   Diem tong: 7.05 / 10                                        ║
║                                                                ║
║   Dieu kien:                                                   ║
║   1. Tap trung vao 1-2 nich cu the (VD: hoa don + CCCD)      ║
║   2. Dau tu du lieu huan luyen tieng Viet (>5,000 anh/loai)  ║
║   3. Su dung hybrid pipeline (local + VLM) de giam rui ro     ║
║   4. Co ke hoach HITL (human-in-the-loop) cho giai doan dau  ║
║                                                                ║
║   Thang diem:                                                  ║
║   - 8.0-10.0: GO (Trien khai ngay)                            ║
║   - 6.0-7.9:  CONDITIONAL GO (Trien khai co dieu kien)       ║
║   - 4.0-5.9:  CAUTION (Can xem xet them)                     ║
║   - 0.0-3.9:  NO-GO (Khong khuyen nghi)                      ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### 2.3. Phan tich tung chieu

**Technical Feasibility (8/10):**
- Ly do diem cao: PaddleOCR, LayoutLMv3, Claude Vision deu la cong cu manh, san sang production
- Ly do tru diem: OCR tieng Viet chua dat do chinh xac tuong duong tieng Anh/Trung; chu viet tay tieng Viet chua co giai phap tot

**Market Demand (9/10):**
- Ly do diem cao: Moi doanh nghiep, co quan VN deu xu ly tai lieu hang ngay; chuyen doi so la chinh sach quoc gia
- Ly do tru diem: Mot so to chuc chua san sang tra tien cho giai phap AI (van dung nhap lieu thu cong)

**Data Availability (5/10):**
- Ly do diem thap: Thieu dataset OCR tieng Viet lon; thieu benchmark form/hoa don VN; XFUND-VI chi co ~200 mau; chu viet tay tieng Viet gan nhu khong co dataset cong khai
- Giai phap: Tu thu thap, synthetic data (SynthDoG), active learning

**Implementation Risk (6/10):**
- Rui ro chinh: Dau thanh dieu sai -> sai nghia hoan toan ("ma" vs "ma" vs "ma" vs "ma" vs "ma"); tai lieu cu chat luong thap; yeu cau privacy cao (ngan hang, y te)
- Giai phap: HITL, hybrid pipeline, on-premise deployment

**Competitive Landscape (6/10):**
- Doi thu manh: FPT.AI (biggest), VinAI (research), Cinnamon (Japan-Vietnam)
- Co hoi: Cac nich chuyen sau (don thuoc, chung tu xuat nhap khau, tai lieu co) chua co giai phap tot

---

## 3. Phan tich thi truong Viet Nam

### 3.1. Quy mo thi truong

| Chi so | Gia tri | Nguon |
|--------|--------|-------|
| **Thi truong Document AI toan cau** | ~$7.5 ty USD (2025), CAGR ~30% | MarketsandMarkets |
| **Thi truong AI Viet Nam** | ~$500 trieu USD (2025) | Vietnam AI Report 2025 |
| **Phan Document AI tai VN (uoc tinh)** | ~$30-50 trieu USD (2025) | Uoc tinh dua tren ty le toan cau |
| **Tang truong du kien** | 25-35% CAGR den 2030 | |
| **So doanh nghiep Viet Nam** | ~900,000 doanh nghiep dang hoat dong | Tong cuc Thong ke 2025 |

### 3.2. Phan khuc thi truong tai Viet Nam

| Phan khuc | Quy mo uoc tinh | Do san sang | Nhu cau cap bach |
|-----------|-----------------|-------------|------------------|
| **Ngan hang & Tai chinh** | $10-15 trieu | Cao | Rat cao — eKYC bat buoc, xu ly chung tu hang trieu/ngay |
| **Bao hiem** | $3-5 trieu | Trung binh | Cao — ho so boi thuong, hop dong bao hiem |
| **Hanh chinh cong** | $5-8 trieu | Thap-Trung binh | Cao — so hoa giay to cong dan, cai cach hanh chinh |
| **Logistics & XNK** | $3-5 trieu | Trung binh | Cao — to khai hai quan, van don, C/O |
| **Y te** | $2-3 trieu | Thap | Trung binh — don thuoc, ho so benh an |
| **Ke toan & Thue** | $3-5 trieu | Trung binh-Cao | Cao — hoa don dien tu, bao cao thue |
| **Bat dong san & Phap ly** | $2-3 trieu | Thap | Trung binh — hop dong, giay to nha dat |
| **Giao duc** | $1-2 trieu | Thap | Thap — cham thi, so hoa tai lieu |
| **TONG** | **$30-50 trieu** | | |

### 3.3. Nhu cau doanh nghiep cu the

**Ngan hang (Top priority):**
- eKYC: Xac thuc CMND/CCCD cho mo tai khoan online (bat buoc theo Thong tu 16/2020/TT-NHNN)
- Xu ly uy nhiem chi, phieu chuyen tien: hang trieu giao dich/ngay
- Phe duyet tin dung: doc va phan tich bao cao tai chinh, giay to dam bao
- KYB (Know Your Business): Xac minh giay phep kinh doanh, giay dang ky doanh nghiep

**Bao hiem:**
- Ho so boi thuong bao hiem suc khoe: don thuoc + hoa don vien phi + giay ra vien
- Hop dong bao hiem: trich xuat dieu khoan, quyen loi, loai tru
- Xac minh tai lieu: phat hien giay to gia mao

**Hanh chinh cong:**
- Dich vu cong truc tuyen muc do 4: so hoa va xu ly giay to cong dan
- Chuyen doi so tai lieu hanh chinh: so ho khau -> du lieu dien tu
- Luu tru quoc gia: so hoa tai lieu lich su

**Logistics:**
- Customs automation: doc to khai hai quan tu dong
- Bill of Lading processing: trich xuat thong tin hang hoa
- Certificate of Origin: xac minh xuat xu hang hoa

### 3.4. Xu huong chinh sach ho tro

| Chinh sach | Tac dong |
|------------|---------|
| **Chuong trinh Chuyen doi so quoc gia (2022-2025)** | Thuc day so hoa tai lieu trong co quan nha nuoc |
| **Nghi dinh 123/2020 ve Hoa don dien tu** | Bat buoc hoa don dien tu tu 07/2022, thuc day xu ly hoa don tu dong |
| **Thong tu 16/2020 ve eKYC** | Bat buoc xac thuc dien tu, thuc day OCR cho giay to tuy than |
| **De an 06 (2022) ve CCCD gan chip** | Du lieu sinh trac tren CCCD, thuc day AI xac thuc |
| **Luat Giao dich dien tu 2023** | Cong nhan gia tri phap ly cua tai lieu so |

---

## 4. Thach thuc nghien cuu (Research Challenges)

### 4.1. Thach thuc dac thu tieng Viet

| # | Thach thuc | Muc do | Chi tiet |
|---|-----------|--------|---------|
| 1 | **Dau thanh dieu (Tone marks)** | Nghiem trong | 6 dau thanh dieu (ngang, sac, huyen, hoi, nga, nang) tren 12 nguyen am co ban. OCR sai dau -> sai nghia hoan toan. Vi du: "ma" (ghost), "ma" (cheek/mother), "ma" (horse/but), "ma" (tomb), "ma" (rice seedling), "ma" (which). Cac OCR engine hien tai dat ~85-90% chinh xac dau thanh dieu. |
| 2 | **Ky tu dac biet tieng Viet** | Cao | Cac ky tu co dau: a-breve (ă), a-circumflex (â), o-circumflex (ô), o-horn (ơ), u-horn (ư), d-stroke (đ). Nhieu OCR engine nham lan giua: a/ă/â, o/ô/ơ, u/ư, d/đ. |
| 3 | **Chu viet tay tieng Viet** | Rat cao | Dau thanh dieu trong chu viet tay rat nho, de bi bo qua hoac nham. Chua co dataset HWR tieng Viet quy mo lon. Chua co mo hinh thuong mai dat do chinh xac chap nhan duoc. |
| 4 | **Tai lieu da the he** | Cao | Giay to tu truoc 1975, thoi ky 1975-2000, va hien dai co format, font, chat luong rat khac nhau. Can mo hinh robust xu ly duoc tat ca. |
| 5 | **Thieu du lieu benchmark** | Cao | Chi co XFUND-VI (~200 mau) la benchmark cong khai cho document IE tieng Viet. Can dataset lon hon nhieu cho OCR, layout, table, HWR. |

### 4.2. Thach thuc nghien cuu mo (Open Research Problems)

| # | Van de | Trang thai hien tai | Huong nghien cuu |
|---|--------|-------------------|------------------|
| 1 | **Multi-page document understanding** | Hau het mo hinh chi 1 trang; VLMs dang giai quyet (1M context) | Cross-page attention, hierarchical document models |
| 2 | **Complex table extraction** | ~85% accuracy tren bang phuc tap | Graph neural networks cho table structure, VLM-based extraction |
| 3 | **Document forgery detection** | Nghien cuu con so khai, thieu dataset | Combining image forensics + content consistency checking |
| 4 | **Privacy-preserving Document AI** | Federated learning con han che cho document tasks | On-device models (<1B params), federated fine-tuning |
| 5 | **Active learning cho Document AI** | Co nghien cuu nhung chua ap dung rong rai | Human-in-the-loop voi intelligent sample selection |
| 6 | **Han-Nom OCR** | Rat so khai, vai nghin ky tu duoc so hoa | Chuyen gia su hoc + AI collaboration |
| 7 | **Domain adaptation** | Mo hinh huan luyen tren tieng Anh kem tren tieng Viet | Few-shot adaptation, cross-lingual transfer (LayoutXLM) |
| 8 | **Agentic Document Workflows** | Moi bat dau, chua co san pham hoan chinh | Multi-agent systems cho document processing pipelines |

### 4.3. Gap (khoang trong) giua nghien cuu va thuc te

| Gap | Chi tiet |
|-----|---------|
| **Benchmark vs thuc te** | Mo hinh dat 96% tren FUNSD nhung chi 80-85% tren tai lieu thuc te VN (nhieu, mo, nghieng) |
| **Tieng Anh vs tieng Viet** | Hau het nghien cuu tren tieng Anh; khi ap dung cho tieng Viet, accuracy giam 5-15% |
| **Clean vs noisy** | Dataset benchmark thuong clean; tai lieu thuc te co nhieu, stamp, ghi chu tay, photocopy |
| **Single-page vs multi-page** | Benchmark thuong 1 trang; doanh nghiep can xu ly tai lieu 10-100 trang |
| **Lab vs production** | Research khong tinh den latency, cost, scaling, monitoring |

---

## 5. Thach thuc ky thuat (Technical Challenges)

### 5.1. Thach thuc trien khai

| # | Thach thuc | Muc do | Giai phap de xuat |
|---|-----------|--------|-------------------|
| 1 | **Tich hop PaddlePaddle** | Trung binh | PaddlePaddle it pho bien hon PyTorch; can setup rieng. Giai phap: export ONNX, dung Docker container san. |
| 2 | **GPU management** | Trung binh | Nhieu mo hinh can GPU dong thoi (OCR + IE + Table). Giai phap: GPU sharing (NVIDIA MPS), model batching (Triton). |
| 3 | **Latency budget** | Trung binh | Pipeline nhieu buoc -> latency cong don. Target: <5s cho interactive. Giai phap: Parallel processing, caching, async pipeline. |
| 4 | **Model versioning** | Thap-Trung binh | Nhieu mo hinh, nhieu phien ban. Giai phap: MLflow Model Registry, DVC. |
| 5 | **Data pipeline** | Trung binh | Thu thap, gan nhan, versioning du lieu huan luyen. Giai phap: Label Studio + DVC + CI/CD. |
| 6 | **PDF diversity** | Cao | PDF co hang tram cach tao (Word, LaTeX, scan, screenshot). Giai phap: Robust ingestion layer voi fallback. |
| 7 | **Scaling** | Trung binh | Tu 100 tai lieu/ngay len 100,000 tai lieu/ngay. Giai phap: Kubernetes + Celery + auto-scaling. |

### 5.2. Thach thuc hieu suat

| Metric | Muc tieu MVP | Muc tieu Production | Thach thuc |
|--------|-------------|---------------------|-----------|
| **OCR accuracy (char level)** | >85% | >93% | Dau thanh dieu, chat luong anh |
| **IE accuracy (field level)** | >80% | >92% | Da dang format, truong tu do |
| **Latency (per page)** | <10s | <3s | Pipeline nhieu buoc |
| **Throughput** | 500 docs/day | 20,000 docs/day | GPU cost, scaling |
| **Straight-through rate** | >60% | >85% | Confidence calibration |
| **Uptime** | >95% | >99.5% | Infrastructure reliability |

### 5.3. Thach thuc bao mat va privacy

| Van de | Muc do nghiem trong | Giai phap |
|--------|---------------------|-----------|
| **Du lieu ca nhan (PII)** | Rat cao | Encryption at rest va in transit; PII masking trong logs; access control |
| **On-premise requirement** | Cao | Nhieu khach hang (ngan hang, chinh phu) yeu cau on-premise. Can mo hinh chay local. |
| **Data retention** | Cao | Luat An ninh mang VN yeu cau luu tru du lieu tai VN. Cloud provider can co DC tai VN. |
| **Audit trail** | Trung binh | Ghi log tat ca truy cap va thao tac tren tai lieu nhay cam |
| **Model security** | Trung binh | Chong model extraction qua API; watermarking |

---

## 6. Top 5 Rui ro

### 6.1. Ma tran rui ro

```
Tac dong (Impact)
  Rat cao │     [R4]          [R1]
          │
  Cao     │ [R5]      [R2]
          │
  Trung   │               [R3]
  binh    │
          │
  Thap    │
          └──────────────────────────────
            Thap    Trung   Cao    Rat cao
                    binh
                    Xac suat (Probability)
```

### 6.2. Chi tiet Top 5 rui ro

#### Rui ro 1: Do chinh xac khong du cho production (Score: 9/10)

| Thuoc tinh | Chi tiet |
|------------|---------|
| **Mo ta** | OCR va IE tren tai lieu tieng Viet thuc te khong dat accuracy yeu cau (>90%), dac biet voi dau thanh dieu va tai lieu chat luong thap |
| **Xac suat** | Cao (70%) |
| **Tac dong** | Rat cao — khach hang tu choi san pham, mat uy tin |
| **Nguyen nhan goc** | Thieu du lieu huan luyen tieng Viet; OCR chua toi uu cho dau thanh dieu; tai lieu thuc te nhieu noise |
| **Bien phap phong ngua** | 1. Thu thap >5,000 anh/loai tai lieu de fine-tune. 2. Su dung hybrid pipeline voi VLM fallback. 3. Implement HITL cho giai doan dau. 4. Fine-tune vietocr cho text recognition tieng Viet. |
| **Bien phap ung pho** | 1. Ha thap nguong auto-accept, tang review thu cong. 2. Chuyen sang VLM-first approach (chi phi cao nhung chinh xac). 3. Gioi han scope chi xu ly loai tai lieu dat accuracy. |
| **KPI giam sat** | Character accuracy, field accuracy, straight-through rate |

#### Rui ro 2: Chi phi VLM API khong kiem soat (Score: 7/10)

| Thuoc tinh | Chi tiet |
|------------|---------|
| **Mo ta** | Khi scale len, chi phi goi Claude Vision / GPT-4o tang nhanh, an mon loi nhuan |
| **Xac suat** | Trung binh-Cao (50%) |
| **Tac dong** | Cao — lam mat loi nhuan, khong the scale |
| **Nguyen nhan goc** | Token-based pricing; moi trang tai lieu ton $0.01-0.05; 100,000 trang/thang = $1,000-5,000 |
| **Bien phap phong ngua** | 1. Hybrid pipeline: chi dung VLM cho truong hop kho (~20%). 2. Set daily/monthly budget limits. 3. Cache ket qua (tai lieu giong nhau khong goi lai). 4. Dan chuyen sang mo hinh local khi du du lieu fine-tune. |
| **Bien phap ung pho** | 1. Tang ty le xu ly local, giam VLM calls. 2. Dung mo hinh nho hon (Claude Haiku thay Sonnet). 3. Negotiate volume pricing voi provider. |
| **KPI giam sat** | Cost per document, VLM fallback rate, monthly API spend |

#### Rui ro 3: Doi thu canh tranh vuot mat (Score: 6/10)

| Thuoc tinh | Chi tiet |
|------------|---------|
| **Mo ta** | FPT.AI, VinAI, hoac startup khac ra san pham tot hon, gia re hon truoc khi san pham hoan thien |
| **Xac suat** | Trung binh-Cao (50%) |
| **Tac dong** | Trung binh — mat co hoi thi truong, can pivot |
| **Nguyen nhan goc** | Doi thu co nhieu nguon luc hon (FPT.AI co data tu FPT, VinAI co research team manh) |
| **Bien phap phong ngua** | 1. Tap trung vao nich chuyen sau (VD: chung tu logistics, don thuoc). 2. Speed-to-market: MVP truoc, iterate nhanh. 3. Khac biet hoa bang trai nghiem khach hang, tich hop sau. 4. Open-source mot so component de xay community. |
| **Bien phap ung pho** | 1. Pivot sang nich khac chua co doi thu. 2. Partnership voi doi thu (cung cap component chuyen biet). 3. Chuyen sang B2B integration (API provider). |
| **KPI giam sat** | Market share, win rate, feature comparison |

#### Rui ro 4: Bao mat va Privacy (Score: 8/10)

| Thuoc tinh | Chi tiet |
|------------|---------|
| **Mo ta** | Lo lot du lieu tai lieu nhay cam (CMND, thong tin tai chinh, ho so benh an) |
| **Xac suat** | Thap-Trung binh (30%) |
| **Tac dong** | Rat cao — vi pham phap luat, mat uy tin vinh vien, bi phat |
| **Nguyen nhan goc** | Du lieu tai lieu chua PII; gui len cloud API; luu tru khong an toan |
| **Bien phap phong ngua** | 1. On-premise deployment cho tai lieu nhay cam. 2. Encryption at rest va in transit. 3. PII masking/redaction tu dong. 4. Access control va audit logging. 5. Tuan thu Luat An ninh Mang VN. |
| **Bien phap ung pho** | 1. Incident response plan. 2. Thong bao khach hang ngay lap tuc. 3. Forensics va khac phuc. |
| **KPI giam sat** | Security audit findings, penetration test results, compliance score |

#### Rui ro 5: Thieu nhan su AI co kinh nghiem (Score: 6/10)

| Thuoc tinh | Chi tiet |
|------------|---------|
| **Mo ta** | Khong tuyen duoc ML Engineers co kinh nghiem Document AI tai Viet Nam |
| **Xac suat** | Thap-Trung binh (40%) |
| **Tac dong** | Cao — cham tien do, chat luong thap |
| **Nguyen nhan goc** | Document AI la linh vuc chuyen sau; it nguoi co kinh nghiem thuc te; canh tranh nhan su voi FPT, VinAI, cac cong ty lon |
| **Bien phap phong ngua** | 1. Tuyen ML Engineers gioi va dao tao them Document AI. 2. Su dung VLM APIs de giam yeu cau chuyen mon sau. 3. Partnership voi truong dai hoc (HUST, UIT, VNUHCM). 4. Remote hiring (nhan su tu Ha Noi, Da Nang). |
| **Bien phap ung pho** | 1. Outsource mot so phan cho agency/consultant. 2. Su dung SaaS tools (Nanonets, Rossum) thay vi tu xay. 3. Giam scope, tap trung vao phan co the lam voi nhan su hien co. |
| **KPI giam sat** | Time-to-fill, team retention rate, velocity |

---

## 7. Phan tich doi thu canh tranh

### 7.1. Doi thu noi dia (Viet Nam)

#### FPT.AI

| Thuoc tinh | Chi tiet |
|------------|---------|
| **Cong ty** | FPT Corporation — Cong ty CNTT lon nhat Viet Nam |
| **San pham** | FPT.AI Reader — Doc va trich xuat tai lieu; FPT.AI eKYC — Xac thuc giay to |
| **Diem manh** | Brand manh nhat VN; du lieu lon tu FPT group (ngan hang, vien thong); doi ML/AI >500 nguoi; khach hang enterprise san co |
| **Diem yeu** | Gia cao; tuy chinh cham (bureaucracy lon); khong tap trung 100% vao Document AI |
| **Thi phan uoc tinh** | 30-40% thi truong Document AI VN |
| **Moi de doa** | Rat cao — co the copy bat ky tinh nang nao voi nguon luc lon |

#### VinAI Research

| Thuoc tinh | Chi tiet |
|------------|---------|
| **Cong ty** | Vingroup — Tap doan tu nhan lon nhat Viet Nam |
| **San pham** | PhoNLP, PhoBERT — cong cu NLP tieng Viet; nghien cuu OCR, Document AI |
| **Diem manh** | Doi ngu nghien cuu manh (nhieu PhD); co bai bao tai top conferences; PhoNLP/PhoBERT la de-facto standard cho NLP tieng Viet |
| **Diem yeu** | Tap trung nghien cuu hon la san pham thuong mai; khong co san pham Document AI hoan chinh |
| **Thi phan uoc tinh** | 5-10% (gian tiep qua cong cu NLP) |
| **Moi de doa** | Trung binh — co the ra san pham canh tranh neu quyet dinh lam |

#### Cinnamon AI

| Thuoc tinh | Chi tiet |
|------------|---------|
| **Cong ty** | Cinnamon Inc — Startup AI Nhat-Viet |
| **San pham** | Cinnamon AI Document Parser — trich xuat tai lieu cho doanh nghiep Nhat va Viet Nam |
| **Diem manh** | Kinh nghiem xu ly tai lieu tieng Nhat (phuc tap); co khach hang enterprise tai Nhat va VN; ky thuat tinh tuy |
| **Diem yeu** | Quy mo nho; tap trung chinh vao thi truong Nhat; gia cao (dinh vi premium) |
| **Thi phan uoc tinh** | 5-10% |
| **Moi de doa** | Thap-Trung binh — khac nich thi truong |

#### VNPT AI

| Thuoc tinh | Chi tiet |
|------------|---------|
| **Cong ty** | VNPT — Tap doan Buu chinh Vien thong Viet Nam |
| **San pham** | VNPT AI OCR — Doc CMND, CCCD, giay to; VNPT eKYC |
| **Diem manh** | Lien ket voi co quan nha nuoc (Bo Cong an, Bo Thong tin); du lieu CCCD lon |
| **Diem yeu** | Chat luong san pham binh thuong; innovation cham; phu thuoc vao moi quan he chinh phu |
| **Thi phan uoc tinh** | 10-15% (chinh phu sector) |
| **Moi de doa** | Trung binh — manh trong government sector |

### 7.2. Doi thu quoc te co mat tai Viet Nam

| Doi thu | San pham | Diem manh | Diem yeu tai VN |
|---------|---------|-----------|-----------------|
| **Google Document AI** | Document AI API | Cong nghe hang dau, da ngon ngu | Tieng Viet chua tot; gia cao; data phai gui len Google Cloud |
| **AWS Textract** | Textract API | Infrastructure manh, tich hop AWS ecosystem | Tieng Viet han che; API-only, khong on-premise |
| **Microsoft Azure AI Document Intelligence** | Form Recognizer | LayoutLM goc; tich hop Office 365 | Tieng Viet trung binh; can Azure subscription |
| **ABBYY** | FineReader, Vantage | OCR truyen thong tot nhat; 30+ nam kinh nghiem | Gia rat cao; tieng Viet han che; khong co doi ngu tai VN |
| **Nanonets** | Nanonets OCR | De su dung; no-code training | Tieng Viet chua duoc test ky; chi cloud |

### 7.3. Ma tran canh tranh

| Tieu chi | FPT.AI | VinAI | Cinnamon | Google DocAI | **Smartlog (Chung ta)** |
|----------|--------|-------|----------|-------------|------------------------|
| **Tieng Viet** | 8/10 | 7/10 | 7/10 | 5/10 | **Target: 8/10** |
| **Gia ca** | 5/10 | N/A | 4/10 | 6/10 | **Target: 7/10** |
| **Tuy chinh** | 6/10 | N/A | 7/10 | 4/10 | **Target: 8/10** |
| **On-premise** | 7/10 | N/A | 7/10 | 3/10 | **Target: 9/10** |
| **De tich hop** | 6/10 | 5/10 | 6/10 | 8/10 | **Target: 8/10** |
| **Zero-shot** | 4/10 | 5/10 | 4/10 | 7/10 | **Target: 8/10** (VLM) |
| **Nich chuyen sau** | 5/10 | 3/10 | 7/10 | 3/10 | **Target: 9/10** |

### 7.4. Chien luoc canh tranh de xuat

| Chien luoc | Chi tiet |
|-----------|---------|
| **Nich focus** | Tap trung vao 1-2 nganh chuyen sau (VD: logistics, ke toan) thay vi lam general Document AI |
| **Hybrid approach** | Ket hop mo hinh local (re, nhanh) + VLM (chinh xac, linh hoat) — khong doi thu nao lam tot viec nay |
| **On-premise first** | Nhieu khach hang VN (ngan hang, chinh phu) yeu cau on-premise — day la rao can cho Google/AWS |
| **Developer experience** | API de su dung, SDK da ngon ngu, tai lieu tieng Viet day du — khac biet voi doi thu noi dia |
| **Transparent pricing** | Gia minh bach, co free tier — khac biet voi FPT.AI va Cinnamon (gia khong cong khai) |
| **Community building** | Open-source mot so component, to chuc meetup AI, chia se kien thuc |

---

## 8. Ket luan & Khuyen nghi

### 8.1. Ket luan tong quat

Document Intelligence la linh vuc **kha thi ve ky thuat** va **co nhu cau thi truong lon** tai Viet Nam. Tuy nhien, **rao can du lieu** (thieu dataset tieng Viet) va **canh tranh cao** (FPT.AI, VinAI) doi hoi chien luoc trien khai can than.

Verdict: **CONDITIONAL GO** voi cac dieu kien:

### 8.2. Dieu kien trien khai

| # | Dieu kien | Ly do | Uu tien |
|---|----------|-------|---------|
| 1 | **Tap trung vao 1-2 nich cu the** | Khong nen canh tranh toan dien voi FPT.AI | Bat buoc |
| 2 | **Dau tu du lieu huan luyen tieng Viet** | Day la rao can lon nhat; can toi thieu 5,000 anh/loai | Bat buoc |
| 3 | **Hybrid pipeline (local + VLM)** | Giam rui ro accuracy va cost dong thoi | Bat buoc |
| 4 | **HITL tu dau** | Khong the tin 100% vao AI cho giai doan dau | Bat buoc |
| 5 | **On-premise capability** | Nhieu khach hang VN yeu cau; loi the canh tranh | Rat nen |
| 6 | **MVP truoc 8 tuan** | Speed-to-market quan trong; validate som | Rat nen |
| 7 | **Partnership nganh** | Hop tac voi 1-2 khach hang pilot de co du lieu thuc te | Nen |
| 8 | **Team 3-5 nguoi ban dau** | Du de lam MVP; khong qua lon de burn nhanh | Nen |

### 8.3. Lo trinh khuyen nghi

```
Phase 0 (Thang 1-2): MVP
├── Chon nich: Hoa don + CCCD (co nhu cau va du lieu san co nhat)
├── Tech: PaddleOCR + Claude Vision API (hybrid)
├── Nhan su: 2 ML Engineers + 1 Fullstack Dev
├── Muc tieu: Demo hoat dong, accuracy >85% tren mau thu nghiem
└── Output: Working prototype, feedback tu 2-3 khach hang pilot

Phase 1 (Thang 3-6): Production v1
├── Mo rong: Them 3-5 loai tai lieu (hop dong, chung tu ngan hang, ...)
├── Fine-tune: LayoutLMv3 tren du lieu tieng Viet thu thap duoc
├── HITL: Review UI hoan chinh
├── Muc tieu: accuracy >92%, 5,000+ tai lieu/ngay
└── Output: San pham ban duoc, 5-10 khach hang tra tien

Phase 2 (Thang 7-12): Scale
├── Mo rong: 10-20 loai tai lieu
├── Self-learning: Active learning tu HITL feedback
├── On-premise: Deployment package cho khach hang enterprise
├── Multi-tenant: Platform SaaS
└── Output: Platform hoan chinh, 50+ khach hang

Phase 3 (Nam 2): Full Platform
├── HWR tieng Viet: Nhan dang chu viet tay
├── Agentic workflows: Tu dong hoa toan bo quy trinh
├── Marketplace: Template marketplace cho cac loai tai lieu
└── Output: Market leader trong nich da chon
```

### 8.4. KPIs theo phase

| KPI | Phase 0 | Phase 1 | Phase 2 | Phase 3 |
|-----|---------|---------|---------|---------|
| **OCR Accuracy (VN)** | >85% | >90% | >93% | >95% |
| **IE Field Accuracy** | >80% | >88% | >92% | >95% |
| **Straight-through Rate** | >50% | >70% | >85% | >90% |
| **Latency / page** | <10s | <5s | <3s | <2s |
| **Tai lieu / ngay** | 100 | 5,000 | 50,000 | 200,000 |
| **Khach hang** | 2-3 pilot | 5-10 | 50+ | 200+ |
| **Doanh thu / thang** | $0 | $3,000-10,000 | $20,000-50,000 | $100,000+ |

### 8.5. Go / No-Go Criteria cho tung phase

**Phase 0 -> Phase 1 (Go neu):**
- [ ] OCR accuracy >= 85% tren 3 loai tai lieu muc tieu
- [ ] Co it nhat 2 khach hang pilot san sang tra tien
- [ ] Team co it nhat 1 ML Engineer co kinh nghiem
- [ ] Du ngan sach cho 6 thang tiep theo

**Phase 1 -> Phase 2 (Go neu):**
- [ ] IE accuracy >= 88% tren 5+ loai tai lieu
- [ ] Co it nhat 5 khach hang tra tien
- [ ] Doanh thu >= $3,000/thang (hoac tang truong >30%/thang)
- [ ] Pipeline on dinh, uptime >= 98%

**Phase 2 -> Phase 3 (Go neu):**
- [ ] 50+ khach hang, doanh thu >= $20,000/thang
- [ ] Platform on dinh, uptime >= 99.5%
- [ ] Team >= 8 nguoi, co kinh nghiem production
- [ ] Co competitive moat ro rang (du lieu, cong nghe, hoac khach hang)

---

## 9. Ban giao cho R-sigma

### 9.1. Tom tat ban giao

| Hang muc | Noi dung |
|----------|---------|
| **Baseline** | B02 — Document Intelligence |
| **Verdict** | CONDITIONAL GO (7.05/10) |
| **Dieu kien chinh** | Nich focus + du lieu VN + hybrid pipeline + HITL |
| **Rui ro cao nhat** | Accuracy khong du (#1), Chi phi VLM (#2), Bao mat (#4) |
| **Lo trinh** | 4 phase, 12-24 thang den full platform |
| **Ngan sach MVP** | $10,000-25,000 / 6-8 tuan |
| **Ngan sach Production v1** | $60,000-180,000 / 4-5 thang |

### 9.2. Tac vu cho R-sigma

1. **Cap nhat Knowledge Graph**: Them node B02 voi verdict CONDITIONAL GO, diem 7.05/10
2. **Cap nhat Layer 2 notes**: Danh dau hoan thanh A1 (research), A2 (tech), A3 (feasibility)
3. **Lien ket voi baseline khac**:
   - B01 (Computer Vision): B02 phu thuoc nang vao CV cho OCR, layout analysis
   - B03 (NLP): B02 can NLP cho post-OCR processing, NER, language model
   - B05 (Multimodal AI): B02 la ung dung truc tiep cua multimodal (text + image + layout)
   - B06 (Knowledge Graphs): B02 co the feed extracted data vao KG
   - B08 (Generative AI): VLMs la thanh phan quan trong cua B02 hien dai
4. **Danh dau trang thai**: B02 — Phase 1 Research COMPLETE, ready for Phase 2 (Implementation Planning)

### 9.3. File da tao trong B02

| File | Tac gia | Trang thai | Dong |
|------|---------|-----------|------|
| `research-report.md` | Dr. Archon (R-alpha) | Hoan thanh | ~1304 |
| `tech-report.md` | Dr. Praxis (R-beta) | Hoan thanh | ~850 |
| `feasibility-report.md` | Dr. Sentinel (R-gamma) | Hoan thanh | ~650 |
| `R-SA-notes.md` | R-SA (Solution Architect) | Hoan thanh | Layer 2 |
| `R-MLE-notes.md` | R-MLE (ML Engineer) | Hoan thanh | Layer 2 |
| `R-DE-notes.md` | R-DE (Data Engineer) | Hoan thanh | Layer 2 |
| `R-FE-notes.md` | R-FE (Frontend) | Hoan thanh | Layer 2 |
| `R-BE-notes.md` | R-BE (Backend) | Hoan thanh | Layer 2 |
| `R-DA-notes.md` | R-DA (Data Analyst) | Hoan thanh | Layer 2 |
| `R-DO-notes.md` | R-DO (DevOps) | Hoan thanh | Layer 2 |
| `R-QA-notes.md` | R-QA (QA) | Hoan thanh | Layer 2 |
| `R-D02-notes.md` | R-D02 (Domain Expert) | Hoan thanh | Layer 2 |

---

*Bao cao nay duoc bien soan boi Dr. Sentinel (R-gamma) nhu mot phan cua du an MAESTRO Knowledge Graph, Phase 1, Module B02. Noi dung dua tren phan tich ky thuat tu Dr. Praxis (R-beta), nghien cuu tu Dr. Archon (R-alpha), va khao sat thi truong Document AI tai Viet Nam.*

*Buoc tiep theo: R-sigma se tong hop tat ca bao cao va cap nhat Knowledge Graph.*
