# Bao cao Tong hop: B02 — Document Intelligence
## Tac gia: Ms. Scribe (R-sigma) — Ngay: 2026-03-31

---

## 1. Tom tat tong quan (Executive Summary)

Document Intelligence (Tri tue Tai lieu) la linh vuc ung dung AI de tu dong hieu, phan tich va trich xuat thong tin tu tai lieu — bao gom anh chup, ban scan, file PDF, va cac dinh dang van ban so khac. Day la mot trong nhung linh vuc co tac dong kinh te lon nhat cua AI, dac biet tai Viet Nam noi he thong hanh chinh cong, ngan hang, bao hiem, logistics deu phu thuoc nang ne vao tai lieu giay.

### 1.1. Ket luan chinh

| Hang muc | Ket qua |
|----------|---------|
| **Diem kha thi tong hop** | **7.05 / 10** |
| **Ket luan** | **CONDITIONAL GO** — Trien khai co dieu kien |
| **Do truong thanh cong nghe** | Cao — OCR va layout analysis da truong thanh; VLMs dang cach mang hoa |
| **Nhu cau thi truong VN** | Rat cao — $30-50 trieu USD (2025), CAGR 25-35% |
| **Thach thuc chinh** | Thieu du lieu huan luyen tieng Viet; dau thanh dieu; privacy |
| **Thoi gian MVP** | 6-8 tuan voi doi 2-3 ky su |
| **Thoi gian Production v1** | 4-5 thang voi doi 5-7 ky su |

### 1.2. Boi canh

Tu nam 2020 den 2026, Document Intelligence da trai qua cuoc cach mang lon. OCR truyen thong (chi chuyen anh thanh van ban tho) da duoc thay the boi cac mo hinh multimodal (LayoutLMv3, Donut) va Vision LLM (GPT-4V, Claude Vision) co the hieu toan bo ngu canh tai lieu — bo cuc, bang bieu, hinh anh, chu viet tay — ma khong can pipeline OCR rieng biet.

Ba paradigm ky thuat chinh hien nay:

| Paradigm | Dai dien | Phu hop |
|----------|----------|---------|
| **Pipeline truyen thong** | PaddleOCR + LayoutLMv3 | San pham on dinh, du lieu lon |
| **OCR-free end-to-end** | Donut, GOT, Nougat | San pham vua, it phu thuoc OCR |
| **Vision LLM** | Claude Vision, GPT-4V | Prototype nhanh, zero-shot |

### 1.3. Vi tri trong he sinh thai MAESTRO

Document Intelligence (B02) la nut ket noi quan trong trong Knowledge Graph:
- **Su dung** Computer Vision (B03) cho xu ly anh va object detection
- **Su dung** NLP (B04) cho xu ly van ban sau trich xuat
- **Bo sung** Search & RAG (B12) de xay dung he thong tim kiem tai lieu
- **Ung dung** truc tiep trong Finance (I02) va Logistics (I06)

---

## 2. Phat hien dong thuan (Consensus Findings)

Sau khi tong hop 3 bao cao chinh (research, tech, feasibility) va 9 ghi chu chuyen gia, cac phat hien dong thuan bao gom:

### 2.1. Cong nghe da san sang cho production

**Dong thuan 100%**: Tat ca cac bao cao deu xac nhan cong nghe Document Intelligence da du truong thanh de trien khai san pham. PaddleOCR, LayoutLMv3, va Vision LLM APIs deu la cong cu production-ready.

- R-alpha: "Cong nghe truong thanh, nhieu tool open-source"
- R-beta: "PaddleOCR la lua chon hang dau cho production"
- R-gamma: "Do truong thanh cong nghe: Cao (8/10)"

### 2.2. PaddleOCR la OCR engine tot nhat cho production

**Dong thuan cao**: PaddleOCR dat diem tong hop 8.15/10, xep hang #1 trong 5 OCR engine duoc danh gia (PaddleOCR, Tesseract 5, EasyOCR, DocTR, vietocr).

Tieu chi vuot troi:
- Do chinh xac tieng Viet: 8/10
- Toc do inference: 9/10 (~50-100ms/trang tren GPU)
- Layout Analysis: 9/10
- Mo hinh nhe: PP-OCRv4 mobile chi 4.4MB

### 2.3. LayoutLMv3 la mo hinh document understanding tot nhat cho on-premise

**Dong thuan cao**: LayoutLMv3 dat diem tong hop 7.35/10, xep hang #1 cho production on-premise. Ket hop 3 nguon thong tin: van ban + vi tri 2D + hinh anh.

### 2.4. Hybrid pipeline la kien truc toi uu

**Dong thuan 100%**: Tat ca bao cao deu khuyen nghi hybrid pipeline — PaddleOCR xu ly truong hop de (>80% tai lieu, chi phi thap), Vision LLM xu ly truong hop kho (~20%, chi phi cao nhung chinh xac).

```
Image → PaddleOCR (nhanh, re) → Kiem tra Confidence
         ↓                              ↓
    Cao (>0.9): Chap nhan       Thap (<0.9): Xu ly lai voi VLM
```

### 2.5. Thi truong Viet Nam co nhu cau rat lon

**Dong thuan 100%**: Thi truong Document AI tai VN uoc tinh $30-50 trieu USD (2025), CAGR 25-35%.

Cac phan khuc co nhu cau cao nhat:
1. **Ngan hang & Tai chinh** ($10-15 trieu): eKYC bat buoc, xu ly chung tu
2. **Hanh chinh cong** ($5-8 trieu): So hoa giay to, dich vu cong truc tuyen
3. **Logistics & XNK** ($3-5 trieu): To khai hai quan, van don, C/O
4. **Ke toan & Thue** ($3-5 trieu): Hoa don dien tu, bao cao thue
5. **Bao hiem** ($3-5 trieu): Ho so boi thuong, hop dong

### 2.6. Tieng Viet la thach thuc dac thu quan trong

**Dong thuan 100%**: Dau thanh dieu (6 dau tren 12 nguyen am) la thach thuc lon nhat. OCR sai dau -> sai nghia hoan toan.

Vi du dien hinh: "ma" co 6 nghia khac nhau tuy dau (ma quai, ma/me, ngua/nhung, mo, ma/lua non, nao). Cac OCR engine hien tai chi dat ~85-90% chinh xac dau thanh dieu.

### 2.7. Thieu du lieu huan luyen tieng Viet

**Dong thuan 100%**: Day la diem yeu lon nhat (5/10). Chi co XFUND-VI (~200 mau) la benchmark cong khai cho document IE tieng Viet. Chu viet tay tieng Viet gan nhu khong co dataset cong khai.

---

## 3. Mau thuan & Giai quyet (Contradictions Resolved)

### 3.1. Pipeline truyen thong vs Vision LLM

**Mau thuan**: R-alpha nhan manh xu huong "OCR-free" voi Vision LLM, trong khi R-beta khuyen nghi pipeline truyen thong (PaddleOCR + LayoutLMv3) cho production.

**Giai quyet**: Khong co mau thuan thuc su — hai phuong an phu hop cho hai giai doan khac nhau:
- **MVP / Prototype**: Vision LLM (nhanh nhat, khong can GPU, zero-shot)
- **Production**: Pipeline truyen thong (on dinh, chi phi thap, on-premise)
- **Scale**: Hybrid (ket hop ca hai, toi uu chi phi va do chinh xac)

### 3.2. PaddleOCR vs vietocr cho tieng Viet

**Mau thuan**: PaddleOCR xep hang #1 tong the, nhung vietocr co do chinh xac dau thanh dieu cao hon (9/10 vs 8/10).

**Giai quyet**: Su dung PaddleOCR cho text detection + layout analysis, ket hop vietocr cho text recognition tieng Viet khi can do chinh xac cao nhat. PaddleOCR la nen tang, vietocr la bo sung chuyen biet.

### 3.3. On-premise vs Cloud

**Mau thuan**: Vision LLM (cloud) dat do chinh xac cao nhat nhung khong dap ung yeu cau privacy cua ngan hang, y te, chinh phu. Mo hinh local (on-premise) bao mat nhung kem chinh xac hon.

**Giai quyet**: Phan loai tai lieu theo muc do nhay cam:
- **Nhay cam cao** (CMND, ho so benh an, tai chinh): On-premise only (PaddleOCR + LayoutLMv3)
- **Nhay cam trung binh** (hoa don, hop dong thuong mai): Hybrid voi PII masking truoc khi gui cloud
- **Nhay cam thap** (tai lieu cong khai, catalogue): Cloud VLM (toi uu chi phi va toc do)

### 3.4. Scope rong vs Tap trung nich

**Mau thuan**: R-alpha mo ta 10 linh vuc con rong lon, trong khi R-gamma khuyen nghi tap trung 1-2 nich cu the.

**Giai quyet**: Dong y voi R-gamma — bat dau voi 1-2 nich cu the (hoa don + CCCD) de xay dung uy tin va dataset, sau do mo rong dan. Roadmap 3 giai doan:
1. **MVP**: Hoa don (invoice) extraction
2. **Production v1**: Hoa don + eKYC (CCCD)
3. **Full platform**: Mo rong them chung tu logistics, hop dong, don thuoc

---

## 4. Khuyen nghi tich hop (Integrated Recommendations)

### 4.1. Chien luoc ky thuat

#### 4.1.1. Tech Stack khuyen nghi

**OCR Layer:**
- Primary: PaddleOCR v4 (text detection + layout analysis)
- Secondary: vietocr (text recognition tieng Viet khi can chinh xac cao)
- Fallback: Claude Vision API (zero-shot cho tai lieu kho)

**Document Understanding Layer:**
- Production: LayoutLMv3 fine-tuned tren du lieu tieng Viet
- Layout Analysis: DiT (Document Image Transformer)
- Table Extraction: Table Transformer (DETR-based)

**Infrastructure Layer:**
- Backend: Python (FastAPI)
- Queue: Celery + Redis
- Storage: PostgreSQL + MinIO (files) + Elasticsearch (search)
- ML Ops: MLflow + Label Studio + DVC
- Deployment: Docker + Kubernetes

**Frontend Layer:**
- Web app: Next.js + React
- Annotation tool: Label Studio (tich hop)

#### 4.1.2. Pipeline Architecture

```
[1. INGESTION]     → Upload API, Email parser, Scanner SDK
      ↓
[2. PRE-PROCESSING] → De-skew, De-noise, Resolution check
      ↓
[3. OCR/PARSING]   → PaddleOCR (primary) / vietocr / VLM (fallback)
      ↓
[4. UNDERSTANDING] → Layout Analysis (DiT) + Classification (LayoutLMv3)
      ↓
[5. EXTRACTION]    → Key-Value IE + Table extraction + Entity linking
      ↓
[6. VALIDATION]    → Confidence check + Business rules + HITL queue
      ↓
[7. OUTPUT]        → PostgreSQL + Elasticsearch + S3 + API (JSON)
```

#### 4.1.3. Chien luoc theo Use Case

| Use Case | Phuong an | Ly do |
|----------|-----------|-------|
| eKYC (CMND/CCCD) | PaddleOCR + rule-based | Template co dinh, on-premise, toc do cao |
| Hoa don (Invoice) | PaddleOCR + LayoutLMv3 fine-tuned | Nhieu format, can IE chinh xac |
| Hop dong (Contract) | Claude Vision API + structured output | Tai lieu dai, da dang, can hieu ngu canh |
| Don thuoc (Prescription) | vietocr fine-tuned + domain LM | Chu viet tay, can mo hinh chuyen biet |
| Chung tu logistics | Hybrid: VLM phan loai + pipeline trich xuat | Da dang loai, can linh hoat |
| Bao cao tai chinh | Claude/GPT-4o + table extraction | Bang phuc tap, can suy luan |

### 4.2. Chien luoc du lieu

#### 4.2.1. Thu thap du lieu

- **Muc tieu**: >5,000 anh/loai tai lieu cho fine-tuning
- **Phuong phap**:
  1. Synthetic data (SynthDoG) cho pre-training
  2. Partnership voi doanh nghiep de thu thap tai lieu thuc
  3. Active learning: HITL trong giai doan MVP de xay dung dataset
  4. Data augmentation: xoay, nhieu, thay doi do tuong phan

#### 4.2.2. Benchmark noi bo

- Xay dung benchmark rieng cho tieng Viet: hoa don, CCCD, hop dong
- Muc tieu: >500 mau/loai voi ground truth chat luong cao
- Cong cu gan nhan: Label Studio voi custom annotation schema

### 4.3. Chien luoc kinh doanh

#### 4.3.1. Go-to-market

1. **Nich dau tien**: Hoa don dien tu (e-invoice) — nhu cau bat buoc theo Nghi dinh 123/2020
2. **Nich thu hai**: eKYC cho fintech/ngan hang — bat buoc theo Thong tu 16/2020
3. **Mo rong**: Chung tu logistics, bao hiem, hanh chinh cong

#### 4.3.2. Mo hinh kinh doanh

- **SaaS API**: Tinh phi theo so trang xu ly ($0.01-0.10/trang)
- **On-premise license**: Cho khach hang lon can bao mat (ngan hang, chinh phu)
- **Consulting**: Tuy chinh giai phap cho nganh cu the

#### 4.3.3. Khac biet hoa

- **Tieng Viet chuyen sau**: Toi uu hoa dau thanh dieu, ky tu dac biet
- **Nich chuyen biet**: Chung tu logistics (to khai, van don, C/O), don thuoc
- **Tich hop sau**: API de nham voi ERP, CRM pho bien tai VN
- **Hybrid pipeline**: Ket hop on-premise va cloud linh hoat

---

## 5. Tom tat rui ro (Risk Summary)

### 5.1. Ma tran rui ro

| # | Rui ro | Xac suat | Tac dong | Diem | Bien phap chinh |
|---|--------|----------|----------|------|-----------------|
| R1 | **Do chinh xac khong du** — OCR/IE tieng Viet <90% | Cao (70%) | Rat cao | 9/10 | HITL, hybrid VLM fallback, fine-tune vietocr, >5K anh/loai |
| R2 | **Chi phi VLM API khong kiem soat** — scale tang chi phi | TB-Cao (50%) | Cao | 7/10 | Hybrid pipeline (80% local), budget limits, cache |
| R3 | **Doi thu canh tranh** — FPT.AI, VinAI vuot mat | TB-Cao (50%) | TB | 6/10 | Tap trung nich, speed-to-market, khac biet hoa |
| R4 | **Bao mat & Privacy** — lo lot PII | Thap-TB (30%) | Rat cao | 8/10 | On-premise, encryption, PII masking, Luat ANMVN |
| R5 | **Thieu du lieu huan luyen** — khong du data tieng Viet | Cao (60%) | Cao | 7/10 | Synthetic data, active learning, partnership |

### 5.2. Rui ro bo sung tu goc nhin chuyen gia

Tu cac ghi chu chuyen gia (R-MLE, R-DE, R-DA, R-BE, R-DO, R-QA, R-SA, R-FE, R-D02):

| Rui ro | Nguon | Muc do | Giai phap |
|--------|-------|--------|-----------|
| PaddlePaddle dependency | R-DE | TB | Export ONNX, Docker container |
| GPU management phuc tap | R-DO | TB | NVIDIA MPS, Triton, model batching |
| PDF da dang qua lon | R-BE | Cao | Robust ingestion voi fallback |
| Latency cong don (pipeline nhieu buoc) | R-SA | TB | Parallel processing, caching, async |
| Model versioning phuc tap | R-DO | Thap-TB | MLflow Model Registry, DVC |
| Scaling tu 100 len 100K docs/ngay | R-DE | TB | Kubernetes + Celery + auto-scaling |

### 5.3. Chien luoc giam rui ro tong the

1. **HITL tu dau**: Human-in-the-loop cho giai doan MVP va Production v1, giam dan khi model cai thien
2. **Hybrid pipeline**: Khong phu thuoc 100% vao bat ky cong nghe nao
3. **Nich truoc, rong sau**: Bat dau voi 1-2 loai tai lieu, mo rong dan
4. **Dataset la moat**: Dau tu xay dung dataset tieng Viet chat luong cao — day la loi the canh tranh dai han
5. **On-premise san sang**: Luon co phuong an on-premise cho khach hang nhay cam

---

## 6. Lo trinh trien khai (Implementation Roadmap)

### 6.1. Giai doan 1: MVP (6-8 tuan, 2-3 ky su)

**Muc tieu**: Chung minh kha thi voi 1 loai tai lieu (hoa don)

| Tuan | Cong viec | Output |
|------|-----------|--------|
| 1-2 | Setup infrastructure, thu thap ~500 hoa don mau | Docker setup, dataset v0 |
| 3-4 | PaddleOCR integration, pre-processing pipeline | OCR pipeline chay duoc |
| 5-6 | LayoutLMv3 fine-tune tren hoa don VN, IE pipeline | IE accuracy >80% |
| 7-8 | FastAPI endpoint, validation, demo UI | API + demo san sang |

**Tieu chi thanh cong MVP:**
- OCR accuracy (char level): >85%
- IE accuracy (field level): >80%
- Latency: <10s/trang
- Throughput: 500 docs/ngay
- Straight-through rate: >60%

### 6.2. Giai doan 2: Production v1 (4-5 thang, 5-7 ky su)

**Muc tieu**: San pham on dinh cho 2 loai tai lieu (hoa don + CCCD)

| Thang | Cong viec | Output |
|-------|-----------|--------|
| 1 | Mo rong dataset (>5K anh/loai), CCCD pipeline | Dataset v1, CCCD extraction |
| 2 | Hybrid pipeline (PaddleOCR + VLM fallback), HITL | Hybrid system, review queue |
| 3 | Table extraction, multi-page support, monitoring | Table IE, Evidently monitoring |
| 4 | Security hardening, on-premise packaging, load testing | On-premise ready, 20K docs/ngay |
| 4-5 | Beta testing voi 2-3 khach hang pilot | Feedback, SLA dat |

**Tieu chi thanh cong Production v1:**
- OCR accuracy: >93%
- IE accuracy: >92%
- Latency: <3s/trang
- Throughput: 20,000 docs/ngay
- Straight-through rate: >85%
- Uptime: >99.5%

### 6.3. Giai doan 3: Full Platform (12-18 thang, 8-12 ky su)

**Muc tieu**: Nen tang da loai tai lieu, da nganh, da nguoi dung

| Quy | Cong viec |
|-----|-----------|
| Q1 | Mo rong them loai tai lieu: hop dong, chung tu logistics |
| Q2 | Document Q&A (RAG), summarization, multi-page |
| Q3 | HWR tieng Viet, document forensics, multi-tenant |
| Q4 | SaaS platform, self-service onboarding, marketplace |

**Tieu chi thanh cong Full Platform:**
- Ho tro >10 loai tai lieu
- Multi-tenant SaaS
- >10 khach hang tra phi
- Self-service onboarding <1 ngay

---

## 7. Checklist chat luong

### 7.1. Kiem tra noi dung bao cao

| # | Tieu chi | Trang thai |
|---|---------|-----------|
| 1 | Tong hop day du 3 bao cao chinh (research, tech, feasibility) | DONE |
| 2 | Tong hop 9+ ghi chu chuyen gia | DONE |
| 3 | Xac dinh cac phat hien dong thuan | DONE |
| 4 | Xac dinh va giai quyet cac mau thuan | DONE |
| 5 | Khuyen nghi tech stack cu the | DONE |
| 6 | Lo trinh trien khai co moc thoi gian | DONE |
| 7 | Ma tran rui ro voi bien phap giam thieu | DONE |
| 8 | Tieu chi thanh cong do luong duoc | DONE |
| 9 | Ket noi lien mien (B03, B04, B12, I02, I06) | DONE |
| 10 | Noi dung bang tieng Viet | DONE |

### 7.2. Kiem tra tinh nhat quan

| # | Tieu chi | Trang thai |
|---|---------|-----------|
| 1 | Diem kha thi nhat quan giua cac bao cao (7.05/10) | DONE |
| 2 | Verdict nhat quan (CONDITIONAL GO) | DONE |
| 3 | Tech stack nhat quan giua tech-report va final-report | DONE |
| 4 | Effort estimate nhat quan | DONE |
| 5 | Rui ro nhat quan va co them tu goc nhin chuyen gia | DONE |

### 7.3. Kiem tra chat luong JSON

| # | Tieu chi | Trang thai |
|---|---------|-----------|
| 1 | JSON hop le (valid syntax) | DONE |
| 2 | Theo dung NormalizedNode schema (giong B01) | DONE |
| 3 | Tat ca truong bat buoc co du | DONE |
| 4 | >=8 core_concepts | DONE |
| 5 | >=8 algorithms | DONE |
| 6 | >=6 key_papers | DONE |
| 7 | Feasibility score khop voi feasibility-report | DONE |
| 8 | Cross-domain connections chinh xac | DONE |
| 9 | Noi dung tieng Viet | DONE |

---

## 8. Ban giao cho Manager

### 8.1. Tom tat ban giao

**Baseline**: B02 — Document Intelligence
**Trang thai**: Da tong hop xong, san sang cap nhat Knowledge Graph
**Nguoi tong hop**: Ms. Scribe (R-sigma)
**Ngay**: 2026-03-31

### 8.2. Cac san pham ban giao

| # | San pham | Duong dan | Mo ta |
|---|---------|-----------|-------|
| 1 | Bao cao tong hop | `docs/reports/B02/final-report.md` | Bao cao nay |
| 2 | JSON production-ready | `data/baselines/B02-document-intelligence.json` | Du lieu node cho Knowledge Graph |
| 3 | Graph cap nhat | `data/graph.json` | Them node B02 va 5 edges moi |

### 8.3. Cac dieu kien trien khai (GO Conditions)

De chuyen tu CONDITIONAL GO sang GO, can:

1. **Thu thap du lieu**: >5,000 anh hoa don tieng Viet de fine-tune (2-4 tuan)
2. **Pilot customer**: Tim 1-2 khach hang pilot (fintech/logistics) de validate nhu cau thuc te
3. **Team**: Dam bao 2-3 ky su (1 ML + 1 backend + 0.5 frontend) co kinh nghiem Python/PyTorch
4. **GPU budget**: Xac nhan ngan sach GPU cho fine-tuning va inference ($200-500/thang giai doan dau)
5. **Privacy plan**: Xac dinh ro chinh sach xu ly PII truoc khi tiep xuc tai lieu khach hang

### 8.4. Cac luu y dac biet

1. **Thoi gian la quan trong**: FPT.AI va VinAI dang mo rong nhanh. Can speed-to-market voi MVP trong 6-8 tuan.
2. **Dataset la moat**: Dau tu xay dung dataset tieng Viet tu dau — day la loi the canh tranh ma doi thu kho sao chep.
3. **Privacy-first**: Ngan hang va chinh phu se khong dung giai phap cloud. Can co phuong an on-premise tu dau.
4. **HITL khong phai la that bai**: Human-in-the-loop la chien luoc dung dan cho giai doan dau — no giup xay dung dataset va cai thien model lien tuc.

### 8.5. Viec tiep theo

1. Manager review va phe duyet bao cao nay
2. Cap nhat Knowledge Graph voi B02 node
3. Len ke hoach chi tiet cho giai doan MVP
4. Tim kiem khach hang pilot
5. Bat dau thu thap du lieu hoa don tieng Viet

---

*Ban giao boi Ms. Scribe (R-sigma) — 2026-03-31*
*Tong hop tu 3 bao cao chinh + 9 ghi chu chuyen gia*
*Da kiem tra tinh nhat quan va chat luong*
