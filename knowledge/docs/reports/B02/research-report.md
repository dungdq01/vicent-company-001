# Bao cao Nghien cuu: B02 — Document Intelligence (Tri tue Tai lieu)

## Tac gia: Dr. Archon (R-alpha) — Ngay: 2026-03-31
## Trang thai: CAN REVIEW
## Tiep theo: Dr. Praxis (beta) — tech-report.md

---

## 1. Tom tat tong quan

Document Intelligence (Tri tue Tai lieu) la linh vuc nghien cuu va ung dung cong nghe AI de tu dong hieu, phan tich va trich xuat thong tin tu tai lieu — bao gom anh chup, ban scan, file PDF, va cac dinh dang van ban so khac. Day la mot trong nhung linh vuc co tac dong kinh te lon nhat cua AI, boi moi to chuc doanh nghiep, co quan nha nuoc deu xu ly hang ngan tai lieu moi ngay. Tu hoa don (invoice), hop dong (contract), bao cao tai chinh, den giay to hanh chinh — tat ca deu can duoc so hoa, phan loai, trich xuat va hieu mot cach tu dong.

Linh vuc nay da trai qua mot cuoc cach mang tu nam 2020 den nay. Truoc day, OCR (Optical Character Recognition — Nhan dang ky tu quang hoc) truyen thong chi co the chuyen anh thanh van ban tho. Ngay nay, cac mo hinh multimodal (da phuong thuc) nhu LayoutLMv3, Donut, va dac biet la Vision LLM (GPT-4V, Claude Vision) co the hieu toan bo ngu canh cua tai lieu — bao gom bo cuc, bang bieu, hinh anh, chu viet tay — va tra loi cau hoi truc tiep ve noi dung tai lieu ma khong can pipeline OCR rieng biet. Xu huong "OCR-free" (khong can OCR) dang dan chiem uu the, noi cac mo hinh end-to-end (dau-cuoi) doc truc tiep tu anh tai lieu.

Doi voi thi truong Viet Nam, Document Intelligence co y nghia dac biet quan trong. He thong hanh chinh cong, ngan hang, bao hiem, logistics deu phu thuoc nang ne vao tai lieu giay. Tieng Viet voi dau thanh dieu (tone marks) va cac loai giay to dac thu (CMND/CCCD, so ho khau, giay khai sinh, hoa don do GTGT) dat ra nhung thach thuc rieng cho cac he thong Document Intelligence. Cac giai phap noi dia nhu FPT.AI, VinAI, Cinnamon AI da dang phat trien cac san pham chuyen biet cho thi truong nay.

---

## 2. Phan loai linh vuc (Field Taxonomy)

### 2.1. Vi tri trong he thong tri thuc

```
Artificial Intelligence (Tri tue Nhan tao)
  └── Computer Vision (Thi giac May tinh) [B01]
       └── Document Intelligence (Tri tue Tai lieu) [B02]  <-- LINH VUC HIEN TAI
  └── Natural Language Processing (Xu ly Ngon ngu Tu nhien) [B03]
       └── Information Extraction (Trich xuat Thong tin)
  └── Multimodal AI (AI Da phuong thuc) [B05]
       └── Vision-Language Models (Mo hinh Thi giac-Ngon ngu)
```

### 2.2. Cac linh vuc con (Sub-fields)

| STT | Linh vuc con | Mo ta | Do truong thanh |
|-----|-------------|-------|-----------------|
| 1 | OCR / Text Recognition | Nhan dang ky tu tu anh | Truong thanh |
| 2 | Layout Analysis | Phan tich bo cuc trang tai lieu | Truong thanh |
| 3 | Table Extraction | Trich xuat cau truc va du lieu bang bieu | Dang phat trien |
| 4 | Document Classification | Phan loai loai tai lieu tu dong | Truong thanh |
| 5 | Information Extraction (IE) | Trich xuat thuc the, quan he tu tai lieu | Dang phat trien |
| 6 | Handwriting Recognition (HWR) | Nhan dang chu viet tay | Thach thuc |
| 7 | Document Q&A | Hoi dap dua tren noi dung tai lieu | Moi noi |
| 8 | Document Summarization | Tom tat tai lieu tu dong | Dang phat trien |
| 9 | Document Generation | Tao tai lieu tu dong tu du lieu co cau truc | Moi noi |
| 10 | Document Forensics | Phat hien gia mao, xac thuc tai lieu | Chuyen biet |

### 2.3. Cac linh vuc lien quan

- **Computer Vision (B01)**: Cung cap ky thuat xu ly anh, object detection lam nen tang
- **NLP (B03)**: Xu ly van ban sau khi trich xuat, NER, relation extraction
- **Multimodal AI (B05)**: Ket hop thi giac va ngon ngu de hieu tai lieu toan dien
- **Knowledge Graphs (B06)**: Luu tru va lien ket thong tin trich xuat tu tai lieu
- **Generative AI (B08)**: Tao tom tat, tra loi cau hoi, tao tai lieu moi

### 2.4. Chuoi gia tri Document Intelligence (Value Chain)

```
[Anh/Scan tai lieu]
    --> [Tien xu ly anh: De-skew, De-noise, Binarization]
    --> [Layout Analysis: Xac dinh vung van ban, bang, hinh]
    --> [OCR/Text Recognition: Chuyen anh thanh van ban]
    --> [Information Extraction: Trich xuat thuc the, key-value]
    --> [Document Understanding: Hieu ngu nghia, phan loai]
    --> [Downstream Tasks: Q&A, Tom tat, Luu tru, Tim kiem]
```

---

## 3. Nen tang toan hoc (Mathematical Foundations)

### 3.1. Convolutional Neural Networks (CNN — Mang no-ron tich chap)

CNN la xu song cot cua OCR hien dai. Phep tich chap (convolution) tren anh duoc dinh nghia:

```
(f * g)(x, y) = SUM_i SUM_j f(i, j) * g(x - i, y - j)
```

Trong do `f` la anh dau vao, `g` la kernel/filter (bo loc). CNN hoc cac bo loc tu dong de nhan dang net chu, duong ke, goc canh trong tai lieu.

**Kien truc dien hinh cho OCR:**
- Input: Anh tai lieu (H x W x C)
- Conv layers: Trich xuat dac trung thi giac (visual features)
- Pooling layers: Giam kich thuoc, tang tinh bat bien (invariance)
- Fully connected / RNN / Transformer decoder: Chuyen dac trung thanh chuoi ky tu

### 3.2. Sequence-to-Sequence voi CTC Loss

CTC (Connectionist Temporal Classification — Phan loai thoi gian ket noi) la ham mat mat (loss function) cho phep huan luyen mo hinh nhan dang chuoi ky tu ma khong can canh chinh (alignment) chinh xac giua vi tri anh va ky tu.

```
P(Y | X) = SUM_{pi in B^(-1)(Y)} PRODUCT_t p(pi_t | X)
```

Trong do:
- `Y` la nhan chuoi ky tu muc tieu
- `X` la chuoi dac trung dau vao
- `B^(-1)(Y)` la tap tat ca cac duong di (paths) anh xa toi `Y` sau khi loai bo ky tu trong va ky tu lap
- `pi_t` la ky tu du doan tai thoi diem `t`

### 3.3. Transformer va Self-Attention (Co che Tu chu y)

Transformer la kien truc cot loi cua cac mo hinh Document Intelligence hien dai (LayoutLM, Donut, TrOCR). Co che self-attention cho phep mo hinh "nhin" toan bo tai lieu cung luc:

```
Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V
```

Trong do:
- `Q` (Query), `K` (Key), `V` (Value) la cac phep chieu tuyen tinh cua dau vao
- `d_k` la chieu cua key vector
- Softmax chuyen diem tuong dong thanh trong so xac suat

**Multi-Head Attention (Chu y da dau):**
```
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) * W_O
    trong do head_i = Attention(Q * W_Q_i, K * W_K_i, V * W_V_i)
```

### 3.4. 2D Position Encoding (Ma hoa vi tri 2 chieu)

Dac trung cua Document Intelligence so voi NLP thuan tuy: tai lieu co bo cuc 2 chieu (2D layout). LayoutLM tien phong viec ket hop vi tri 2D:

```
embedding = token_embedding + 1D_position + 2D_spatial_embedding

2D_spatial_embedding = emb(x_min) + emb(y_min) + emb(x_max) + emb(y_max)
                       + emb(width) + emb(height)
```

Trong do `(x_min, y_min, x_max, y_max)` la toa do bounding box cua token tren trang tai lieu. Dieu nay cho phep mo hinh hieu "token nay nam o dau tren trang" — thong tin cuc ky quan trong de hieu cau truc tai lieu.

### 3.5. Object Detection cho Layout Analysis

Layout analysis (phan tich bo cuc) su dung cac thuat toan object detection (phat hien doi tuong) de xac dinh vung van ban, bang bieu, hinh anh, tieu de:

**DETR (DEtection TRansformer):**
```
L_Hungarian = SUM_i [L_cls(c_i, c_hat_sigma(i)) + 1_{c_i != empty} * L_box(b_i, b_hat_sigma(i))]
```

Trong do:
- `sigma` la phep gan toi uu (Hungarian matching) giua du doan va ground truth
- `L_cls` la cross-entropy loss cho phan loai
- `L_box` la tong cua L1 loss va generalized IoU loss cho bounding box

### 3.6. Graph Neural Networks (GNN — Mang no-ron do thi) cho Document Understanding

Tai lieu co the duoc mo hinh hoa nhu do thi (graph) voi cac node la cac thanh phan (van ban, bang, hinh) va cac canh (edge) la quan he khong gian giua chung:

```
h_v^(l+1) = UPDATE(h_v^(l), AGGREGATE({h_u^(l) : u in N(v)}))
```

Trong do:
- `h_v^(l)` la bieu dien cua node `v` tai lop `l`
- `N(v)` la tap cac node lan can cua `v`
- AGGREGATE va UPDATE la cac ham hoc duoc

GNN hieu qua cho viec hieu quan he giua cac thanh phan tai lieu, vi du: "truong 'Ten' nam ngay tren truong 'Dia chi'" -> chung thuoc cung mot form.

### 3.7. Beam Search cho OCR Decoding

Khi giai ma (decode) chuoi ky tu tu mo hinh OCR, beam search tim kiem gan toi uu:

```
score(Y_1:t) = SUM_{i=1}^{t} log P(y_i | y_1:i-1, X)
```

Beam search giu lai `k` (beam width) ung vien tot nhat tai moi buoc, can bang giua do chinh xac va toc do.

### 3.8. IoU (Intersection over Union) cho danh gia Layout

```
IoU(A, B) = |A giao B| / |A hop B|
```

Dung de do luong do chinh xac cua viec phat hien vung (region detection) trong layout analysis. IoU >= 0.5 thuong duoc coi la phat hien dung.

---

## 4. Cac khai niem cot loi (Core Concepts) — 14 khai niem

### 4.1. OCR Pipeline (Quy trinh OCR)

**Dinh nghia:** OCR Pipeline la chuoi cac buoc xu ly tu anh tai lieu den van ban so, bao gom: tien xu ly anh -> phat hien vung van ban -> nhan dang ky tu -> hau xu ly.

**Y nghia:** Day la nen tang cua moi he thong Document Intelligence. Moi du lieu van ban duoc xu ly tiep (trich xuat, phan loai, Q&A) deu phu thuoc vao chat luong OCR.

**Do kho:** Trung binh (co the dung cac thu vien san co), nhung toi uu cho ngon ngu va tai lieu cu the doi hoi kinh nghiem.

**Cac thanh phan chinh:**
1. **Pre-processing (Tien xu ly):** Binarization (nhi phan hoa), de-skew (chinh nghieng), de-noise (khu nhieu), contrast enhancement (tang do tuong phan)
2. **Text Detection (Phat hien van ban):** Xac dinh vung chua van ban trong anh. Phuong phap pho bien: EAST, CRAFT, DBNet
3. **Text Recognition (Nhan dang van ban):** Chuyen vung van ban thanh chuoi ky tu. Mo hinh: CRNN + CTC, attention-based seq2seq, Transformer
4. **Post-processing (Hau xu ly):** Spell correction (sua loi chinh ta), language model re-ranking, dinh dang dau ra

### 4.2. Layout Analysis (Phan tich Bo cuc)

**Dinh nghia:** Qua trinh xac dinh cau truc vat ly (physical structure) cua trang tai lieu — bao gom vi tri va loai cua cac thanh phan nhu tieu de, doan van, bang bieu, hinh anh, header, footer, chu thich.

**Y nghia:** Hieu bo cuc la buoc tien quyet de trich xuat thong tin co cau truc. Khong co layout analysis, OCR chi tra ve "mot dong van ban dai" ma khong biet cau truc logic cua tai lieu.

**Do kho:** Cao — tai lieu co bo cuc phuc tap (bao cao tai chinh, tap chi, form hanh chinh) la thach thuc lon.

**Cac phuong phap:**
- **Rule-based (Dua tren luat):** Su dung khoang cach, kich thuoc font, vi tri de phan vung. Don gian nhung khong linh hoat.
- **ML-based object detection:** Dung Faster R-CNN, Mask R-CNN, DETR de phat hien cac thanh phan. Chinh xac cao nhung can du lieu huan luyen.
- **Pixel-level segmentation:** Phan doan tung pixel thuoc loai thanh phan nao. Chi tiet nhung ton tai nguyen.
- **Graph-based:** Mo hinh hoa quan he khong gian giua cac thanh phan.

**Dataset (Bo du lieu) quan trong:** PubLayNet (360K anh bai bao khoa hoc), DocLayNet (IBM, 80K trang da dang), PRIMA Layout Analysis.

### 4.3. Named Entity Recognition trong Tai lieu (Document NER)

**Dinh nghia:** Nhan dang va phan loai cac thuc the co ten (named entities) trong ngu canh tai lieu, co tinh den vi tri khong gian (spatial position) cua chung tren trang.

**Y nghia:** La buoc cot loi de trich xuat thong tin co cau truc tu tai lieu. Vi du: tu hoa don, trich xuat "ten nha cung cap", "so hoa don", "ngay lap", "tong tien".

**Do kho:** Cao — can ket hop thong tin van ban va vi tri khong gian; cac thuc the trong tai lieu khac voi NER trong van ban thuan (co them ngu canh bo cuc).

**Dac diem rieng so voi NER truyen thong:**
- Token co vi tri 2D tren trang (khong chi 1D nhu van ban thuan)
- Ngu canh thi giac (font, mau, duong ke) bo sung y nghia
- Quan he khong gian giua cac truong (key-value pairs thuong nam gan nhau)

### 4.4. Table Structure Recognition (Nhan dang Cau truc Bang)

**Dinh nghia:** Qua trinh phat hien bang trong tai lieu va xac dinh cau truc chi tiet — bao gom hang (rows), cot (columns), o (cells), o tron (merged cells), va tieu de (headers).

**Y nghia:** Bang bieu chua luong lon thong tin co cau truc trong bao cao tai chinh, hop dong, tai lieu ky thuat. Tu dong trich xuat bang cho phep phan tich du lieu quy mo lon.

**Do kho:** Rat cao — bang co duong ke (bordered tables), khong co duong ke (borderless tables), bang long nhau (nested tables), o tron (merged cells) deu la thach thuc.

**Cac buoc:**
1. Table Detection (Phat hien bang): Xac dinh vi tri bang trong trang
2. Table Structure Recognition: Xac dinh hang, cot, o
3. Cell Content Extraction: Trich xuat noi dung tung o
4. Table Serialization: Chuyen thanh dinh dang co cau truc (HTML, CSV, JSON)

**Dataset:** ICDAR 2019 Table, PubTables-1M, FinTabNet, SciTSR, WTW (Wired Table in the Wild).

### 4.5. Document Understanding — Multimodal (Hieu Tai lieu Da phuong thuc)

**Dinh nghia:** Kha nang hieu noi dung tai lieu bang cach ket hop dong thoi nhieu nguon thong tin: van ban (text), bo cuc khong gian (layout/spatial), va hinh anh thi giac (visual). Day la xu huong chinh cua linh vuc tu 2020.

**Y nghia:** Con nguoi doc tai lieu bang cach ket hop van ban, vi tri, va hinh thuc trinh bay. Mo hinh multimodal bat chuoc cach doc nay, dat do chinh xac cao hon han so voi chi dung van ban.

**Do kho:** Cao — can kien truc phuc tap, du lieu huan luyen lon, va tai nguyen tinh toan dang ke.

**Mo hinh dai dien:**
- **LayoutLM (2020):** Tien phong ket hop text + layout. Pre-train tren 11M trang tai lieu.
- **LayoutLMv2 (2021):** Them visual features tu anh tai lieu.
- **LayoutLMv3 (2022):** Unified multimodal pre-training voi Masked Image Modeling + Masked Language Modeling.
- **UDOP (2023):** Unified Document Processing — mot mo hinh cho nhieu tac vu.

### 4.6. Handwriting Recognition (Nhan dang Chu viet tay — HWR)

**Dinh nghia:** Nhan dang va chuyen doi chu viet tay (handwritten text) thanh van ban so. Gom hai loai: online (nhan dang theo net but real-time) va offline (nhan dang tu anh tinh).

**Y nghia:** Nhieu tai lieu quan trong van duoc viet tay: don thuoc bac si, phieu ghi nhan, chu ky, ghi chu tren hop dong. Tu dong hoa nhan dang chu viet tay giai phong nhan luc nhap lieu thu cong.

**Do kho:** Rat cao — chu viet tay co tinh bien thien (variability) cuc lon giua cac ca nhan; chu Viet voi dau thanh dieu cang kho hon.

**Thach thuc dac thu tieng Viet:**
- Dau thanh dieu (sac, huyen, hoi, nga, nang) rat nho va de bi nham
- Mot so chu viet tay tieng Viet co ky tu dac biet: a, a-breve, a-circumflex, o, o-circumflex, o-horn, u-horn, d-stroke
- Thieu du lieu huan luyen chu viet tay tieng Viet chat luong cao

### 4.7. Document Classification (Phan loai Tai lieu)

**Dinh nghia:** Tu dong xac dinh loai tai lieu (document type) tu anh hoac noi dung. Vi du: hoa don, hop dong, don xin viec, bao cao tai chinh, giay khai sinh.

**Y nghia:** La buoc dau tien trong quy trinh xu ly tai lieu tu dong. Phan loai dung giup dinh tuyen tai lieu den pipeline xu ly phu hop.

**Do kho:** Trung binh den cao, tuy thuoc so luong loai va do tuong dong giua cac loai.

**Phuong phap:**
- **Image-based (Dua tren anh):** Dung CNN (ResNet, EfficientNet) phan loai truc tiep tu anh tai lieu. Nhanh nhung khong dung thong tin van ban.
- **Text-based (Dua tren van ban):** OCR truoc roi dung text classifier (BERT, PhoBERT cho tieng Viet). Chinh xac cho tai lieu co van ban ro.
- **Multimodal (Da phuong thuc):** Ket hop anh + van ban + layout (LayoutLM). Chinh xac nhat nhung cham nhat.

**Dataset:** RVL-CDIP (400K anh, 16 loai tai lieu van phong), Tobacco-3482.

### 4.8. Information Extraction (Trich xuat Thong tin — IE)

**Dinh nghia:** Qua trinh tu dong trich xuat cac thong tin co cau truc (structured information) tu tai lieu phi cau truc hoac ban cau truc. Bao gom: Key-Value Extraction (trich xuat cap khoa-gia tri), Entity Extraction, Relation Extraction.

**Y nghia:** Chuyen doi tai lieu phi cau truc thanh du lieu co cau truc de luu tru, phan tich, va tich hop vao he thong. Day la gia tri kinh doanh cot loi cua Document Intelligence.

**Do kho:** Cao — can hieu ngu canh, bo cuc, va ngon ngu dong thoi.

**Cac dang IE trong tai lieu:**
1. **Key-Value Pair Extraction:** Trich xuat cac cap nhu "So hoa don: HD001", "Ngay: 15/03/2026"
2. **Entity Linking:** Lien ket thuc the trich xuat voi co so du lieu/ontology
3. **Relation Extraction:** Xac dinh quan he giua cac thuc the ("Nguoi ky" -> "ky" -> "Hop dong so X")
4. **Semantic Role Labeling:** Xac dinh vai tro ngu nghia cua cac thanh phan

**Dataset:** FUNSD (Form Understanding in Noisy Scanned Documents), CORD (Consolidated Receipt Dataset), SROIE, XFUND (da ngon ngu, co tieng Viet).

### 4.9. Document Q&A (Hoi dap Tai lieu)

**Dinh nghia:** He thong co kha nang tra loi cau hoi cua nguoi dung dua tren noi dung tai lieu. Gom hai loai: Extractive Q&A (trich xuat doan tra loi tu tai lieu) va Generative Q&A (tao cau tra loi moi dua tren thong tin tai lieu).

**Y nghia:** Cho phep tuong tac tu nhien voi tai lieu bang ngon ngu tu nhien. Thay vi doc ca tai lieu dai, nguoi dung chi can hoi cau hoi cu the.

**Do kho:** Cao — can hieu sau noi dung, xu ly cau hoi da nghia, va xac dinh vi tri thong tin trong tai lieu dai.

**Phuong phap:**
- **Extractive (Trich xuat):** Tim va tra ve doan van ban chinh xac tu tai lieu chua cau tra loi. Mo hinh: LayoutLMv3 fine-tuned tren DocVQA.
- **Generative (Sinh):** Dung LLM de tao cau tra loi tu nhien dua tren ngu canh tai lieu. Mo hinh: GPT-4V, Claude Vision, Gemini.
- **Retrieval-Augmented (Tang cuong tim kiem - RAG):** Ket hop retrieval tu nhieu tai lieu voi generation. Phu hop cho he thong tai lieu lon.

**Dataset:** DocVQA, InfographicVQA, SlideVQA, MP-DocVQA (multi-page), DUDE (Document Understanding of Diverse types and Evaluations).

### 4.10. Document Summarization (Tom tat Tai lieu)

**Dinh nghia:** Tu dong tao ban tom tat ngan gon cua tai lieu dai, giu lai cac thong tin quan trong nhat. Gom: extractive (chon cau quan trong) va abstractive (viet lai noi dung moi).

**Y nghia:** Giup tiet kiem thoi gian doc tai lieu dai (bao cao tai chinh, hop dong, luat, bai bao khoa hoc). Dac biet huu ich khi can xu ly hang tram tai lieu.

**Do kho:** Trung binh den cao — LLM hien dai da rat gioi tom tat, nhung xu ly tai lieu dai (> 100 trang) va giu do chinh xac la thach thuc.

### 4.11. Document Pre-processing (Tien xu ly Tai lieu)

**Dinh nghia:** Cac ky thuat xu ly anh de cai thien chat luong dau vao truoc khi thuc hien OCR va phan tich.

**Y nghia:** "Garbage in, garbage out" — chat luong anh dau vao anh huong truc tiep den do chinh xac cua toan bo pipeline.

**Cac ky thuat chinh:**
- **Binarization (Nhi phan hoa):** Chuyen anh xam thanh trang-den. Phuong phap: Otsu, Sauvola, adaptive thresholding.
- **De-skew (Chinh nghieng):** Phat hien va sua goc nghieng cua tai lieu scan. Dung Hough Transform hoac projection profile.
- **De-noise (Khu nhieu):** Loai bo nhieu tu scan chat luong thap. Dung Gaussian blur, median filter, hoac deep learning denoising.
- **De-warp (Chinh cong):** Sua anh tai lieu bi cong (chup tu sach mo). Dung DocUNet, DewarpNet.
- **Resolution Enhancement (Tang do phan giai):** Super-resolution cho anh tai lieu mo. Dung ESRGAN, Real-ESRGAN.

### 4.12. Post-OCR Processing (Hau xu ly sau OCR)

**Dinh nghia:** Cac ky thuat cai thien chat luong van ban sau OCR, bao gom sua loi chinh ta, hoi phuc cau truc, va chuyen doi dinh dang.

**Cac ky thuat:**
- **Spell Correction:** Dung edit distance, language model, hoac domain-specific dictionary
- **Language Model Re-ranking:** Dung LM de chon ket qua OCR co xac suat ngon ngu cao nhat
- **Reading Order Detection:** Xac dinh thu tu doc cac khoi van ban tren trang
- **Structure Recovery:** Hoi phuc cau truc doan van, tieu de, danh sach tu ket qua OCR

### 4.13. Zero-shot Document Understanding (Hieu Tai lieu Khong can Huan luyen)

**Dinh nghia:** Kha nang hieu va xu ly loai tai lieu moi ma khong can huan luyen (fine-tune) tren du lieu cua loai tai lieu do. Cac Vision LLM (GPT-4V, Claude Vision) co kha nang nay.

**Y nghia:** Giam chi phi trien khai — khong can thu thap va gan nhan du lieu cho moi loai tai lieu moi. Dac biet huu ich cho doanh nghiep vua va nho.

**Do kho:** Trung binh (su dung) — chi can prompt engineering tot.

### 4.14. Document Digitization Pipeline (Quy trinh So hoa Tai lieu)

**Dinh nghia:** Toan bo quy trinh end-to-end tu tai lieu giay den du lieu so co cau truc, bao gom: scan -> pre-process -> OCR -> layout analysis -> IE -> validation -> storage.

**Y nghia:** Day la san pham hoan chinh ma doanh nghiep can, khong chi la tung thanh phan rieng le.

**Cac buoc:**
1. Document Acquisition: Scan, chup anh, nhan PDF
2. Quality Assessment: Danh gia chat luong anh tu dong
3. Pre-processing: Chinh sua anh
4. Classification: Phan loai loai tai lieu
5. Layout Analysis + OCR: Trich xuat van ban co cau truc
6. Information Extraction: Trich xuat truong du lieu
7. Validation: Kiem tra do chinh xac, human-in-the-loop
8. Integration: Dua du lieu vao he thong doanh nghiep (ERP, CRM, DMS)

---

## 5. Thuat toan & Phuong phap chinh (Key Algorithms) — 14 thuat toan

### 5.1. Tesseract OCR (Classical — Co dien)

**Loai:** OCR Engine (may nhan dang ky tu)
**Tac gia/To chuc:** HP Labs (1985), Google duy tri tu 2006
**Phien ban hien tai:** Tesseract 5.x (dung LSTM)

**Mo ta:**
Tesseract la OCR engine ma nguon mo (open-source) lau doi nhat va pho bien nhat. Phien ban 4+ su dung mang LSTM (Long Short-Term Memory) thay the cho may nhan dang ky tu truyen thong. Ho tro hon 100 ngon ngu, bao gom tieng Viet.

**Quy trinh:**
1. Adaptive thresholding -> nhi phan hoa anh
2. Connected component analysis -> tim vung ky tu
3. Line finding, word finding
4. LSTM-based recognition (2 pass: nhan dang -> tu dien -> nhan dang lai)

**Uu diem:**
- Ma nguon mo, mien phi hoan toan
- Ho tro nhieu ngon ngu bao gom tieng Viet
- Cong dong lon, tai lieu phong phu
- Co the fine-tune cho font/ngon ngu cu the

**Nhuoc diem:**
- Chat luong thap tren anh nhieu, anh nghieng, tai lieu phuc tap
- Khong co layout analysis tot
- Cham hon cac giai phap thuong mai
- Khong xu ly tot chu viet tay

**Do phuc tap:** O(n) voi n la so pixel, thuc te phu thuoc vao kich thuoc anh va do phuc tap tai lieu.

### 5.2. PaddleOCR

**Loai:** OCR Framework (Khung OCR toan dien)
**Tac gia/To chuc:** Baidu (Trung Quoc)
**Ngon ngu/Framework:** Python, PaddlePaddle

**Mo ta:**
PaddleOCR la framework OCR ma nguon mo toan dien cua Baidu, duoc thiet ke de su dung thuc te (production-ready). No cung cap toan bo pipeline: text detection (DB/DBNet++) + text recognition (SVTR, CRNN) + layout analysis + table recognition.

**Kien truc:**
- **Text Detection:** DBNet++ (Differentiable Binarization) — nhanh va chinh xac
- **Text Recognition:** SVTR (Scene Video Text Recognizer) hoac CRNN + CTC
- **Direction Classifier:** Phan loai huong van ban (0, 180 do)
- **Layout Analysis:** PP-Structure voi LayoutXLM
- **Table Recognition:** SLANet (Structure Location Aware Network)

**Uu diem:**
- Hieu suat rat tot cho tieng Trung va cac ngon ngu Chau A (bao gom tieng Viet)
- Mo hinh nhe (lightweight) — PP-OCRv4 mobile chi 4.4MB
- Toan bo pipeline tu detection den table extraction
- Ho tro 80+ ngon ngu
- Toi uu cho ca server va mobile/edge

**Nhuoc diem:**
- Phu thuoc PaddlePaddle framework (it pho bien hon PyTorch)
- Tai lieu chinh bang tieng Trung, ban tieng Anh khong day du
- Do chinh xac cho tieng Viet chua bang cac giai phap chuyen biet

**Do phuc tap:** Text detection O(H*W), recognition O(W/stride * T), toan bo pipeline <100ms/trang tren GPU.

### 5.3. LayoutLM / LayoutLMv2 / LayoutLMv3 (Microsoft)

**Loai:** Pre-trained Document Understanding Model (Mo hinh Hieu Tai lieu Tien huan luyen)
**Tac gia/To chuc:** Microsoft Research
**Nam:** 2020 / 2021 / 2022

**Mo ta:**
Dong mo hinh LayoutLM la buoc dot pha trong Document Intelligence, lan dau tien ket hop hieu qua 3 nguon thong tin: van ban, vi tri 2D, va hinh anh.

**Tien hoa:**

| Phien ban | Nam | Input Modalities | Pre-training Tasks | Diem noi bat |
|-----------|-----|-------------------|-------------------|-------------|
| LayoutLM | 2020 | Text + 2D Position | MLM | Tien phong 2D position embedding |
| LayoutLMv2 | 2021 | Text + 2D + Image | MLM + TIA + TIM | Them visual backbone (ResNeXt-FPN) |
| LayoutLMv3 | 2022 | Text + 2D + Image Patch | MLM + MIM + WPA | Unified pre-training, patch-based vision |

**LayoutLMv3 chi tiet:**
- **Input:** Van ban tokens + vi tri bounding box + anh patches (nhu ViT)
- **Pre-training tasks:**
  - MLM (Masked Language Modeling): Du doan van ban bi che
  - MIM (Masked Image Modeling): Du doan anh patch bi che
  - WPA (Word-Patch Alignment): Hoc canh chinh giua van ban va anh
- **Fine-tuning tasks:** Form understanding, receipt IE, document classification, document VQA

**Uu diem:**
- SOTA tren nhieu benchmark: FUNSD, CORD, SROIE, RVL-CDIP, DocVQA
- Pre-trained tren du lieu lon -> transfer learning tot
- Xu ly tot tai lieu da ngon ngu (LayoutXLM)

**Nhuoc diem:**
- Van can OCR truoc (khong phai end-to-end)
- Mo hinh lon (125M-368M tham so), can GPU de inference
- Pre-training ton kem (nhieu ngay tren nhieu GPU)

### 5.4. DiT — Document Image Transformer

**Loai:** Pre-trained Vision Model cho tai lieu
**Tac gia/To chuc:** Microsoft Research
**Nam:** 2022

**Mo ta:**
DiT ap dung y tuong cua BEiT (BERT pre-training of Image Transformers) vao linh vuc tai lieu. Mo hinh duoc pre-train bang cach du doan cac visual tokens bi che (masked image modeling) tren 42M anh tai lieu (IIT-CDIP dataset).

**Kien truc:**
- Backbone: ViT (Vision Transformer)
- Pre-training: Masked image modeling voi discrete visual tokens (tu dVAE)
- Input: Anh tai lieu chia thanh 16x16 patches

**Uu diem:**
- Hieu qua cao cho document layout analysis va classification
- Khong can OCR — lam viec truc tiep tren anh
- Pre-trained tot cho mien tai lieu

**Nhuoc diem:**
- Chi su dung thong tin thi giac (khong co van ban)
- Can fine-tune cho tac vu cu the

**Ket qua:** SOTA tren PubLayNet (layout analysis) va RVL-CDIP (document classification) tai thoi diem ra mat.

### 5.5. Donut — OCR-free Document Understanding Transformer

**Loai:** End-to-end Document Understanding (Khong can OCR)
**Tac gia/To chuc:** Clova AI (Naver), Han Quoc
**Nam:** 2022

**Mo ta:**
Donut la mo hinh dot pha, loai bo hoan toan buoc OCR. Mo hinh doc truc tiep tu anh tai lieu va sinh ra van ban/thong tin co cau truc. Kien truc encoder-decoder: Swin Transformer encoder xu ly anh, BART decoder sinh van ban.

**Kien truc:**
```
Input: Anh tai lieu (H x W x 3)
  --> Swin Transformer Encoder --> Visual features
  --> BART/mBART Decoder --> Output text/JSON
```

**Pre-training:** SynthDoG — tao du lieu tai lieu tong hop (synthetic) tu nhieu ngon ngu, bao gom tieng Viet, Trung, Nhat, Han, Anh.

**Uu diem:**
- Khong can OCR engine rieng -> don gian hoa pipeline
- Moi truong khong anh huong boi loi OCR (OCR-free)
- Linh hoat: co the fine-tune cho nhieu tac vu (IE, classification, VQA)
- Nhanh hon pipeline truyen thong (1 lan inference thay vi nhieu buoc)

**Nhuoc diem:**
- Can nhieu du lieu huan luyen tong hop
- Do chinh xac van ban chua bang OCR chuyen dung tren mot so truong hop
- Xu ly tai lieu dai (nhieu trang) con han che

### 5.6. Table Transformer (DETR-based)

**Loai:** Table Detection & Structure Recognition
**Tac gia/To chuc:** Microsoft Research
**Nam:** 2022

**Mo ta:**
Ap dung kien truc DETR (DEtection TRansformer) cho hai tac vu: (1) phat hien bang trong trang tai lieu, va (2) nhan dang cau truc bang (hang, cot, o, spanning cells).

**Kien truc:**
- Backbone: ResNet-18/50 trich xuat features
- Transformer encoder-decoder voi object queries
- 2 mo hinh rieng: Table Detection + Table Structure Recognition

**Huan luyen:** PubTables-1M dataset (1 trieu bang tu bai bao khoa hoc)

**Uu diem:**
- Xu ly tot merged cells va bang phuc tap
- DETR architecture khong can NMS (Non-Maximum Suppression) va anchor boxes
- Du lieu huan luyen lon va da dang

**Nhuoc diem:**
- Cham hon cac phuong phap truyen thong
- Can 2 mo hinh rieng biet
- Khong xu ly tot bang khong co duong ke (borderless)

### 5.7. DocTR

**Loai:** OCR Library / Framework
**Tac gia/To chuc:** Mindee
**Nam:** 2021-hien tai

**Mo ta:**
DocTR (Document Text Recognition) la thu vien OCR hien dai, cung cap pipeline day du tu text detection den recognition. Duoc xay dung tren PyTorch va TensorFlow.

**Kien truc:**
- **Text Detection:** DBNet (Differentiable Binarization) hoac LinkNet
- **Text Recognition:** CRNN, SAR (Show, Attend and Read), ViTSTR, PARSeq
- **Pre-processing:** Automatic orientation detection, geometric correction

**Uu diem:**
- API sach, de su dung (Pythonic)
- Ho tro ca PyTorch va TensorFlow
- Mo hinh nhe, phu hop cho production
- Ket qua tot cho tieng Phap va cac ngon ngu Latin

**Nhuoc diem:**
- Ho tro tieng Viet con han che (can fine-tune)
- Cong dong nho hon Tesseract va PaddleOCR
- Khong co san layout analysis va table extraction

### 5.8. TrOCR — Transformer-based OCR

**Loai:** Text Recognition Model
**Tac gia/To chuc:** Microsoft Research
**Nam:** 2021

**Mo ta:**
TrOCR la mo hinh nhan dang van ban dau tien su dung hoan toan Transformer (ca encoder va decoder), khong co CNN hay RNN. Encoder la ViT (Vision Transformer) pre-trained (DeiT hoac BEiT), decoder la GPT-2-like language model.

**Kien truc:**
```
Input: Anh dong van ban (text line image)
  --> ViT Encoder (pre-trained) --> Visual features
  --> Transformer Decoder (pre-trained tu RoBERTa) --> Text output
```

**Uu diem:**
- Kien truc don gian, thuan Transformer
- Tan dung pre-training tu ca vision (DeiT/BEiT) va language (RoBERTa) domains
- SOTA tren nhieu benchmark text recognition
- Xu ly tot ca printed va handwritten text

**Nhuoc diem:**
- Chi lam text recognition (khong co text detection)
- Mo hinh lon, cham hon CRNN cho inference
- Can nhieu du lieu pre-training

### 5.9. Nougat — Neural Optical Understanding for Academic Documents

**Loai:** Academic PDF Parser (Phan tich PDF hoc thuat)
**Tac gia/To chuc:** Meta AI
**Nam:** 2023

**Mo ta:**
Nougat chuyen doi PDF hoc thuat (bai bao khoa hoc) thanh Markdown co cau truc, bao gom cong thuc toan hoc (LaTeX), bang bieu, va cau truc bai bao. Su dung kien truc tuong tu Donut: Swin Transformer encoder + mBART decoder.

**Uu diem:**
- Xu ly cong thuc toan hoc rat tot (chuyen thanh LaTeX)
- Giu cau truc bai bao (tieu de, tom tat, muc, tham khao)
- Khong can OCR rieng
- Dac biet huu ich cho linh vuc hoc thuat

**Nhuoc diem:**
- Chi toi uu cho PDF hoc thuat (khong phu hop cho hoa don, form)
- Cham (vai phut cho mot bai bao dai)
- Doi khi "ao giac" (hallucinate) noi dung khong co trong PDF

### 5.10. GPT-4V / Claude Vision / Gemini (Multimodal LLM Approach)

**Loai:** Vision Language Model cho Document Understanding
**Tac gia/To chuc:** OpenAI / Anthropic / Google
**Nam:** 2023-2026

**Mo ta:**
Cac mo hinh ngon ngu lon co kha nang thi giac (Vision LLMs) da thay doi hoan toan cach tiep can Document Intelligence. Thay vi xay dung pipeline phuc tap (OCR -> NER -> IE), nguoi dung chi can gui anh tai lieu kem cau hoi/prompt va mo hinh tra loi truc tiep.

**Cach su dung:**
```python
# Vi du voi Claude Vision (Anthropic)
import anthropic
client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": base64_image}},
            {"type": "text", "text": "Trich xuat tat ca thong tin tu hoa don nay thanh JSON."}
        ]
    }]
)
```

**Uu diem:**
- Zero-shot: Khong can huan luyen, khong can du lieu gan nhan
- Cuc ky linh hoat: mot mo hinh cho moi loai tai lieu va tac vu
- Hieu ngu canh phuc tap, suy luan logic
- Ho tro da ngon ngu tu nhien (tieng Viet tot)
- Don gian hoa pipeline: 1 API call thay vi nhieu buoc

**Nhuoc diem:**
- Chi phi cao cho xu ly quy mo lon (tinh theo token)
- Latency cao hon cac mo hinh chuyen biet
- Khong on dinh 100% (ket qua co the khac nhau giua cac lan goi)
- Can internet / API access
- Privacy concerns: du lieu gui len cloud
- Khong phu hop cho on-premise / offline deployments

**Do chinh xac:** Tren nhieu benchmark, GPT-4V va Claude Vision dat do chinh xac tuong duong hoac vuot cac mo hinh fine-tuned chuyen biet, dac biet tren zero-shot tasks.

### 5.11. UDOP — Unified Document Processing

**Loai:** Unified Foundation Model cho Document AI
**Tac gia/To chuc:** Microsoft Research
**Nam:** 2023

**Mo ta:**
UDOP (Unified Document Processing) la mo hinh nen tang (foundation model) thong nhat cho Document AI. No xu ly dong thoi text, image, va layout trong mot kien truc duy nhat, va co the thuc hien nhieu tac vu: classification, IE, Q&A, layout analysis, document generation.

**Kien truc:**
- Dua tren T5 (Text-to-Text Transfer Transformer)
- Vision encoder (MAE-based) xu ly anh patches
- Layout encoder tich hop vi tri 2D
- Unified text-to-text format: moi tac vu duoc chuyen thanh dang text input -> text output

**Pre-training tasks:**
1. Joint Text-Layout Reconstruction: Du doan van ban va vi tri bi che
2. Visual Text Recognition: OCR tu patch anh
3. Layout Modeling: Du doan layout tu van ban
4. Masked Autoencoding: Hoi phuc anh bi che

**Uu diem:**
- Mot mo hinh, nhieu tac vu (khong can fine-tune rieng cho tung tac vu)
- SOTA tren 8/9 benchmark tai thoi diem ra mat
- Kha nang document generation (tao tai lieu)

**Nhuoc diem:**
- Mo hinh rat lon, can GPU cao cap
- Pre-training cuc ky ton kem
- Chua co ma nguon mo day du tai thoi diem nghien cuu

### 5.12. PARSeq — Permuted Autoregressive Sequence Models

**Loai:** Scene Text Recognition / OCR
**Tac gia/To chuc:** Darwin Bautista, Rowel Atienza
**Nam:** 2022

**Mo ta:**
PARSeq thong nhat cac phuong phap text recognition: autoregressive (AR), non-autoregressive (NAR), va CTC bang cach huan luyen voi nhieu permutation cua thu tu du doan. Dieu nay cho phep mo hinh hoc context tu moi huong.

**Uu diem:**
- SOTA tren nhieu benchmark text recognition
- Linh hoat: co the chay AR (chinh xac) hoac NAR (nhanh) tai inference
- Mo hinh nhe, nhanh

**Nhuoc diem:**
- Chi lam text recognition (khong co detection)
- Can ket hop voi text detector

### 5.13. DBNet++ (Differentiable Binarization Network)

**Loai:** Text Detection (Phat hien van ban)
**Tac gia/To chuc:** Liao et al.
**Nam:** 2022

**Mo ta:**
DBNet va phien ban cai tien DBNet++ la thuat toan phat hien van ban hang dau, su dung ky thuat "differentiable binarization" de chuyen probability map thanh binary map mot cach kha vi phan (differentiable), cho phep end-to-end training.

**Kien truc:**
- Feature Pyramid Network (FPN) trich xuat da ty le
- Probability map prediction
- Threshold map prediction (adaptive per-pixel threshold)
- Differentiable binarization: `B = sigmoid(k * (P - T))` voi P la probability, T la threshold, k la he so khuech dai

**Uu diem:**
- Nhanh (inference real-time)
- Xu ly tot van ban cong, van ban nghieng
- Ket qua chinh xac tren nhieu benchmark (ICDAR, Total-Text)
- Duoc su dung rong rai trong PaddleOCR va nhieu framework khac

**Nhuoc diem:**
- Xu ly van ban rat nho hoac rat day con han che
- Can post-processing de chuyen contour thanh bounding box/polygon

### 5.14. Florence-2 va DocOwl (Multimodal Document Models moi)

**Loai:** Multimodal Foundation Models
**Tac gia/To chuc:** Microsoft (Florence-2), Alibaba (mPLUG-DocOwl)
**Nam:** 2024

**Mo ta:**
The he moi nhat cua cac mo hinh multimodal chuyen cho tai lieu:

**Florence-2 (Microsoft):**
- Unified vision foundation model voi prompting
- Xu ly nhieu tac vu vision (bao gom OCR, captioning, detection) voi 1 mo hinh
- Nhe (0.23B va 0.77B params) nhung hieu suat cao

**mPLUG-DocOwl 1.5 (Alibaba):**
- Chuyen biet cho document understanding
- Unified structure learning de nhan dang cau truc tai lieu
- Ho tro multi-page document understanding
- SOTA tren 10/10 document understanding benchmarks tai thoi diem ra mat

**Uu diem:**
- Nhe hon cac LLM lon (GPT-4V, Claude) nhieu lan
- Co the chay on-premise
- Chuyen biet cho tai lieu -> chinh xac hon LLM da nang tren mot so tac vu

**Nhuoc diem:**
- Chua linh hoat bang LLM lon trong zero-shot
- Can fine-tune cho domain cu the
- Cong dong va ecosystem con nho

---

## 6. Bai bao quan trong (Key Papers) — 12 bai bao

### 6.1. LayoutLM: Pre-training of Text and Layout for Document Image Understanding

- **Tac gia:** Yiheng Xu, Minghao Li, Lei Cui, Shaohan Huang, Furu Wei, Ming Zhou
- **Nam:** 2020
- **Hoi nghi:** KDD 2020
- **Dong gop:** Lan dau tien ket hop text embeddings voi 2D position embeddings (bounding box coordinates) trong pre-training. Mo hinh hoc cach dung dong thoi ngon ngu va bo cuc khong gian cua tai lieu.
- **Tac dong:** Mo ra huong nghien cuu moi — multimodal document pre-training. Tro thanh nen tang cho hang loat cong trinh tiep theo (LayoutLMv2, v3, LayoutXLM, UDOP). Duoc trich dan hon 2000 lan.

### 6.2. LayoutLMv3: Pre-training for Document AI with Unified Text and Image Masking

- **Tac gia:** Yupan Huang, Tengchao Lv, Lei Cui, Yutong Lu, Furu Wei
- **Nam:** 2022
- **Hoi nghi:** ACM Multimedia 2022
- **Dong gop:** Thong nhat pre-training cho text va image bang masked modeling: MLM cho text, MIM cho image patches, va WPA (Word-Patch Alignment) de lien ket text-image. Khong can CNN backbone nhu LayoutLMv2.
- **Tac dong:** Dat SOTA tren hang loat benchmark: FUNSD (92.08 F1), CORD (96.56 F1), DocVQA (83.37 ANLS). Tro thanh mo hinh mac dinh cho document understanding research.

### 6.3. OCR-free Document Understanding Transformer (Donut)

- **Tac gia:** Geewook Kim, Teakgyu Hong, Moonbin Yim, JeongYeon Nam, Jinyoung Park, Jinyeong Yim, Wonseok Hwang, Sangdoo Yun, Dongyoon Han, Seunghyun Park
- **Nam:** 2022
- **Hoi nghi:** ECCV 2022
- **Dong gop:** Chung minh rang co the hieu tai lieu ma khong can OCR. Kien truc Swin Transformer encoder + BART decoder doc truc tiep tu anh va sinh structured output (JSON). Gioi thieu SynthDoG de tao du lieu tong hop da ngon ngu.
- **Tac dong:** Khai mo xu huong "OCR-free" trong Document AI. Anh huong lon den cac mo hinh tiep theo (Pix2Struct, Nougat). Duoc trich dan hon 800 lan.

### 6.4. PubLayNet: Largest Dataset Ever for Document Layout Analysis

- **Tac gia:** Zhong Xu, Minghao Li, Yiheng Xu, Lei Cui, Shaohan Huang, Furu Wei, Ming Zhou
- **Nam:** 2019
- **Hoi nghi:** ICDAR 2019
- **Dong gop:** Tao bo du lieu layout analysis lon nhat (360K+ anh) tu PubMed Central, voi annotation tu dong tu XML. 5 loai thanh phan: text, title, list, table, figure.
- **Tac dong:** Tro thanh benchmark chuan cho layout analysis. Cho phep huan luyen cac mo hinh deep learning lon cho layout detection.

### 6.5. TrOCR: Transformer-based Optical Character Recognition with Pre-trained Models

- **Tac gia:** Minghao Li, Tengchao Lv, Jingye Chen, Lei Cui, Yijuan Lu, Dinei Florencio, Cha Zhang, Zhoujun Li, Furu Wei
- **Nam:** 2021
- **Hoi nghi:** AAAI 2023
- **Dong gop:** Dau tien su dung hoan toan Transformer cho text recognition (khong co CNN, khong co RNN, khong co CTC). Encoder la pre-trained ViT, decoder la pre-trained language model. SOTA tren printed va handwritten text recognition.
- **Tac dong:** Chung minh Transformer co the thay the hoan toan CNN+RNN+CTC trong OCR. Kien truc don gian nhung manh me.

### 6.6. Table Transformer (PubTables-1M)

- **Tac gia:** Brandon Smock, Rohith Pesala, Robin Abraham
- **Nam:** 2022
- **Hoi nghi:** CVPR 2022
- **Dong gop:** (1) Tao PubTables-1M — dataset 1 trieu bang tu bai bao khoa hoc voi annotation chi tiet (rows, columns, spanning cells). (2) Ap dung DETR cho table detection va structure recognition, dat SOTA.
- **Tac dong:** Thuc day nghien cuu table extraction voi dataset quy mo lon va mo hinh manh.

### 6.7. Nougat: Neural Optical Understanding for Academic Documents

- **Tac gia:** Lukas Blecher, Guillem Cucurull, Thomas Scialom, Robert Stojnic
- **Nam:** 2023
- **To chuc:** Meta AI
- **Dong gop:** Chuyen doi PDF hoc thuat thanh Markdown + LaTeX end-to-end. Xu ly tot cong thuc toan hoc — van de lon ma OCR truyen thong khong giai quyet duoc.
- **Tac dong:** Giai phap thuc te cho viec so hoa tai lieu hoc thuat. Duoc su dung rong rai trong cong cu nghien cuu.

### 6.8. DocVQA: A Dataset for VQA on Document Images

- **Tac gia:** Minesh Mathew, Dimosthenis Karatzas, R. Manmatha, C.V. Jawahar
- **Nam:** 2021
- **Hoi nghi:** WACV 2021
- **Dong gop:** Gioi thieu benchmark DocVQA voi 50K cau hoi tren 12K anh tai lieu cong nghiep (industry documents). Dinh nghia metrric ANLS (Average Normalized Levenshtein Similarity) de danh gia.
- **Tac dong:** Tro thanh benchmark chuan cho Document Visual Question Answering. Thuc day nghien cuu document Q&A.

### 6.9. XFUND: A Benchmark Dataset for Multilingual Visually Rich Form Understanding

- **Tac gia:** Yiheng Xu, Tengchao Lv, Lei Cui, Guoxin Wang, Yijuan Lu, Dinei Florencio, Cha Zhang, Furu Wei
- **Nam:** 2022
- **To chuc:** Microsoft Research
- **Dong gop:** Dataset form understanding da ngon ngu (7 ngon ngu bao gom tieng Viet — XFUND-VI). Cho phep danh gia kha nang cross-lingual transfer cua cac mo hinh.
- **Tac dong:** Dac biet quan trong cho nghien cuu Document AI tai Viet Nam — cung cap du lieu benchmark tieng Viet chinh thuc.

### 6.10. UDOP: Unifying Vision, Text, and Layout for Universal Document Processing

- **Tac gia:** Zineng Tang, Ziyi Yang, Guoxin Wang, Yuwei Fang, Yang Liu, Chenguang Zhu, Michael Zeng, Cha Zhang, Mohit Bansal
- **Nam:** 2023
- **Hoi nghi:** CVPR 2023
- **Dong gop:** Thong nhat document AI thanh text-to-text framework dua tren T5. Mot mo hinh xu ly moi tac vu: OCR, IE, classification, Q&A, layout analysis, va ca document generation.
- **Tac dong:** Dinh huong tuong lai cua Document AI — mot unified model thay vi nhieu mo hinh rieng le.

### 6.11. mPLUG-DocOwl 1.5: Unified Structure Learning for OCR-free Document Understanding

- **Tac gia:** Anwen Hu, Haiyang Xu, Jiabo Ye, Ming Yan, Liang Zhang, Bo Zhang, Chen Li, Ji Zhang, Qin Jin, Fei Huang, Jingren Zhou
- **Nam:** 2024
- **To chuc:** Alibaba DAMO Academy
- **Dong gop:** Unified structure learning framework voi H-Reducer de tang do phan giai hieu qua. SOTA tren 10/10 document understanding benchmarks bao gom DocVQA, InfographicVQA, TabFact.
- **Tac dong:** Chung minh cac mo hinh nho (7B-13B) chuyen biet co the vuot LLM lon tren document tasks.

### 6.12. GOT: General OCR Theory

- **Tac gia:** Haoran Wei, Chenglong Liu, Jinyue Chen, Jia Wang, Lingyu Kong, Yanming Xu, Zheng Ge, Liang Zhao, Jianjian Sun, Yuang Peng, Chunrui Han, Xiangyu Zhang
- **Nam:** 2024
- **To chuc:** StepFun & HUST
- **Dong gop:** Gioi thieu OCR-2.0 — he thong OCR tong quat co the xu ly scene text, document text, cong thuc toan hoc, bieu do, sheet music, hinh hoc trong mot mo hinh thong nhat 580M params. End-to-end, OCR-free.
- **Tac dong:** Mo rong khai niem OCR tu "nhan dang ky tu" thanh "nhan dang moi thu dang ky hieu thi giac".

---

## 7. Tien hoa linh vuc (Evolution Timeline)

### Giai doan 1: OCR Co dien (1950s-2000s)

| Nam | Cot moc | Y nghia |
|-----|---------|---------|
| 1951 | GISMO (M. Sheppard) — may doc chu dau tien | Khai sinh OCR |
| 1966 | IBM 1418 — may doc thu OCR thuong mai | OCR tro thanh san pham |
| 1974 | Ray Kurzweil — may doc sach cho nguoi mu | OCR ung dung xa hoi |
| 1985 | Tesseract (HP Labs) | OCR engine co anh huong nhat |
| 1990s | Commercial OCR: ABBYY FineReader, OmniPage | OCR vao doanh nghiep |
| 1998 | LeNet-5 (LeCun) — CNN cho nhan dang chu so | Deep learning cho OCR |

### Giai doan 2: Deep Learning OCR (2012-2019)

| Nam | Cot moc | Y nghia |
|-----|---------|---------|
| 2012 | AlexNet thang ImageNet | CNN revolution bat dau |
| 2015 | CRNN (Shi et al.) — CNN + RNN + CTC | Kien truc chuan cho text recognition |
| 2017 | EAST (Zhou et al.) — Efficient text detection | Real-time text detection |
| 2017 | Attention-based seq2seq cho OCR | Thay the CTC cho nhieu truong hop |
| 2018 | Tesseract 4.0 voi LSTM | OCR open-source chuyen sang deep learning |
| 2019 | CRAFT (Baek et al.) — character-level detection | Text detection chinh xac hon |
| 2019 | PubLayNet | Dataset layout analysis quy mo lon dau tien |
| 2019 | BERT cho document classification | Pre-trained LM vao document AI |

### Giai doan 3: Multimodal Document Pre-training (2020-2022)

| Nam | Cot moc | Y nghia |
|-----|---------|---------|
| 2020 | **LayoutLM** (Microsoft) | Dot pha: text + layout pre-training |
| 2020 | PaddleOCR ra mat | OCR framework production-ready |
| 2021 | LayoutLMv2 — them visual features | Multimodal day du |
| 2021 | TrOCR — Transformer-only OCR | Chung minh Transformer du cho OCR |
| 2021 | DocVQA benchmark | Chuan hoa document Q&A |
| 2022 | **LayoutLMv3** | SOTA multimodal document understanding |
| 2022 | **Donut** — OCR-free | Mo xu huong khong can OCR |
| 2022 | DiT — Document Image Transformer | Pre-trained ViT cho tai lieu |
| 2022 | Table Transformer + PubTables-1M | Thuc day table extraction |
| 2022 | XFUND (co tieng Viet) | Benchmark da ngon ngu |

### Giai doan 4: LLM va Foundation Models (2023-2026)

| Nam | Cot moc | Y nghia |
|-----|---------|---------|
| 2023 | **GPT-4V** (OpenAI) | Vision LLM doc tai lieu zero-shot |
| 2023 | **Claude Vision** (Anthropic) | Canh tranh voi GPT-4V cho document AI |
| 2023 | Nougat (Meta) | PDF hoc thuat -> Markdown |
| 2023 | UDOP (Microsoft) | Unified document processing |
| 2023 | Gemini (Google) | Multimodal LLM voi context window lon |
| 2024 | **Claude 3.5** voi document analysis vuot troi | Chinh xac cao tren form, hoa don |
| 2024 | mPLUG-DocOwl 1.5 | Mo hinh nho vuot mo hinh lon tren document tasks |
| 2024 | Florence-2 (Microsoft) | Vision foundation model nhe |
| 2024 | GOT (OCR-2.0) | OCR tong quat end-to-end |
| 2024 | Phi-3-Vision, LLaVA-Next | Small VLMs cho document |
| 2025 | Claude 3.6/Opus 4 voi 1M context | Xu ly tai lieu cuc dai |
| 2025 | Colpali / ColQwen — Retrieval voi vision embeddings | Document retrieval khong can OCR |
| 2025-26 | On-device Document AI | Xu ly tai lieu tren dien thoai, edge |

### Xu huong chinh:
1. **Tu pipeline -> end-to-end:** Giam so buoc, tang do don gian
2. **Tu OCR-dependent -> OCR-free:** Loai bo OCR, doc truc tiep tu anh
3. **Tu single-task -> multi-task:** Mot mo hinh, nhieu tac vu
4. **Tu cloud-only -> on-device:** Xu ly tren thiet bi, bao ve quyen rieng tu
5. **Tu fine-tuned -> zero-shot:** Khong can huan luyen, chi can prompt

---

## 8. State of the Art (SOTA) 2024-2026

### 8.1. Benchmark chinh va ket qua SOTA

#### Document Visual Question Answering (DocVQA)

| Mo hinh | ANLS | Nam | Ghi chu |
|---------|------|-----|---------|
| InternVL2-Pro | 94.1 | 2024 | Open-source VLM |
| GPT-4o | 92.8 | 2024 | Commercial API |
| Claude 3.5 Sonnet | 91.5 | 2024 | Commercial API |
| Qwen2-VL-72B | 96.5 | 2024 | Open-source VLM |
| mPLUG-DocOwl 1.5 | 82.2 | 2024 | 7B params |
| LayoutLMv3-large | 83.4 | 2022 | Fine-tuned |
| Donut | 67.5 | 2022 | OCR-free |

#### Form Understanding (FUNSD - F1 Score)

| Mo hinh | F1 | Nam |
|---------|-----|-----|
| LayoutLMv3-large | 92.08 | 2022 |
| UDOP | 93.38 | 2023 |
| GPT-4V (zero-shot) | ~85 | 2024 |
| Claude 3.5 (zero-shot) | ~87 | 2024 |

#### Receipt Information Extraction (CORD - F1 Score)

| Mo hinh | F1 | Nam |
|---------|-----|-----|
| LayoutLMv3 | 96.56 | 2022 |
| Donut | 84.11 | 2022 |
| UDOP | 97.58 | 2023 |

#### Document Layout Analysis (DocLayNet - mAP)

| Mo hinh | mAP | Nam |
|---------|------|-----|
| DiT-large | 79.3 | 2022 |
| YOLOv8 + fine-tune | 81.5 | 2024 |
| DINO + Swin-L | 82.4 | 2024 |

#### Table Structure Recognition (PubTables-1M)

| Mo hinh | GriTS-Acc | Nam |
|---------|-----------|-----|
| Table Transformer | 98.4 | 2022 |
| LORE | 97.3 | 2023 |

#### Document Classification (RVL-CDIP - Accuracy)

| Mo hinh | Accuracy | Nam |
|---------|----------|-----|
| DiT-large | 92.69% | 2022 |
| LayoutLMv3 | 95.44% | 2022 |
| UDOP | 96.38% | 2023 |

### 8.2. Xu huong SOTA 2025-2026

**1. Vision Language Models (VLMs) chiem uu the:**
- Qwen2-VL, InternVL2, LLaVA-OneVision la cac open-source VLMs dat ket qua xuat sac tren document benchmarks
- Claude, GPT-4o, Gemini 2.0 tiep tuc cai thien kha nang document understanding
- Xu huong: VLMs dang dan thay the cac mo hinh chuyen biet fine-tuned

**2. Long-context document processing:**
- Claude voi 1M context window co the xu ly tai lieu hang tram trang
- Gemini 2.0 voi 2M token context
- Cho phep multi-page document understanding ma khong can chia nho

**3. On-device / Edge deployment:**
- Phi-3-Vision (Microsoft): 4.2B params, chay tren mobile
- SmolVLM (Hugging Face): <2B params
- MobileVLM, MoE-LLaVA: Toi uu cho edge
- PaddleOCR mobile: 4.4MB model

**4. Structured output (JSON mode):**
- Cac VLMs ho tro JSON structured output, giup trich xuat thong tin truc tiep thanh format co cau truc
- Function calling / tool use cho document extraction pipelines

**5. Agentic Document Processing:**
- AI agents tu dong xu ly tai lieu phuc tap: doc -> hieu -> trich xuat -> kiem tra -> luu tru
- Multi-agent systems: mot agent doc OCR, mot agent phan tich, mot agent kiem tra

### 8.3. So sanh cac phuong phap tiep can

| Tieu chi | Fine-tuned Models (LayoutLM) | OCR-free (Donut) | Vision LLMs (Claude/GPT) |
|----------|------------------------------|-------------------|--------------------------|
| Do chinh xac | Cao nhat (voi du lieu) | Trung binh-Cao | Cao (zero-shot) |
| Chi phi huan luyen | Cao | Trung binh | Khong can |
| Chi phi inference | Thap | Thap | Cao |
| Linh hoat | Thap (can retrain) | Trung binh | Cuc cao |
| Toc do | Nhanh | Nhanh | Cham |
| Privacy | On-premise OK | On-premise OK | Cloud (thuong) |
| Phu hop cho | San pham lon, du lieu nhieu | San pham vua | Prototype, long-tail |

---

## 9. Ung dung thuc te tai Viet Nam

### 9.1. Xu ly Hoa don (Invoice Processing)

**Boi canh:** Viet Nam co quy dinh ve hoa don dien tu (e-invoice) tu 2022 (Nghi dinh 123/2020/ND-CP), nhung van con luong lon hoa don giay va hoa don scan can so hoa.

**Cac truong can trich xuat:**
- Ma so thue (MST) nguoi ban va nguoi mua
- Ten don vi, dia chi
- So hoa don, ky hieu, ngay lap
- Danh sach hang hoa/dich vu (ten, don vi, so luong, don gia, thanh tien)
- Tong tien, thue GTGT, tong thanh toan

**Giai phap hien co tai Viet Nam:**
- **FPT.AI eKYC/Document AI:** Xu ly hoa don, chung tu, CMND/CCCD
- **VinAI:** Nghien cuu OCR tieng Viet
- **Cinnamon AI (Nhat/Viet):** AI document extraction cho doanh nghiep
- **VNPT AI:** OCR va xu ly giay to

**Thach thuc rieng:**
- Hoa don tu nhieu nha cung cap co format khac nhau
- Hoa don viet tay (cac cua hang nho)
- Chat luong scan thap, hoa don bi nhau, bi mo

### 9.2. eKYC — Xac thuc Giay to Tuy than

**Boi canh:** Ngan hang va fintech Viet Nam bat buoc eKYC (Thong tu 16/2020/TT-NHNN). Can doc va xac thuc CMND, CCCD (Citizen Identity Card — Can cuoc Cong dan), ho chieu.

**Quy trinh:**
1. Chup anh mat truoc + mat sau CMND/CCCD
2. OCR trich xuat: Ho ten, ngay sinh, gioi tinh, que quan, noi thuong tru, so CMND/CCCD, ngay cap, noi cap
3. Face matching: So sanh anh tren the voi anh selfie
4. Liveness detection: Chong gia mao

**Dac diem CCCD gan chip (2021+):**
- Ma QR code chua thong tin ca nhan (doc bang camera)
- Chip NFC chua du lieu sinh trac (doc bang dien thoai NFC)
- Giup kiem chung chenh (cross-validate) voi OCR

**Thach thuc:**
- CMND cu (the giay) chat luong in va scan rat thap
- Anh chup bi choi, bi nghieng, bi cat
- Ten dia danh tieng Viet co dau rat de bi OCR nham
- Can do chinh xac >99% cho ung dung tai chinh

### 9.3. Xu ly Chung tu Ngan hang va Bao hiem

**Ung dung:**
- Phieu chuyen tien (transfer slips)
- Uy nhiem chi (payment orders)
- Ho so boi thuong bao hiem (insurance claims): don thuoc, hoa don vien phi, giay ra vien
- Bao cao tai chinh doanh nghiep

**Giai phap:**
- Cac ngan hang lon (Vietcombank, BIDV, Techcombank) da co he thong tu dong hoa chung tu noi bo
- Startup: Kobiton, Ami, Misa — tich hop OCR vao phan mem ke toan

### 9.4. Xu ly Giay to Hanh chinh Cong

**Loai giay to:**
- Giay khai sinh (Birth certificate)
- So ho khau (Household registration book)
- Giay dang ky ket hon (Marriage certificate)
- Giay phep kinh doanh (Business license)
- So do, giay chung nhan quyen su dung dat (Land use right certificate)

**Thach thuc dac biet:**
- Nhieu loai form khac nhau qua cac thoi ky (truoc 1975, 1975-2000, 2000-nay)
- Giay to cu bi o vang, nham, mo
- Chu viet tay cua can bo (dac biet khong doc)
- Dau moc (stamps/seals) che phu van ban

### 9.5. Logistics va Xuat nhap khau

**Ung dung:**
- Bill of Lading (Van don): Trich xuat thong tin hang hoa, nguoi gui/nhan, cang di/den
- Customs Declaration (To khai hai quan): Trich xuat ma HS, so luong, tri gia
- Packing List, Commercial Invoice
- Chung tu xuat xu (Certificate of Origin — C/O)

**Giai phap:** Cac cong ty logistics lon (Gemadept, Transimex) dang trien khai Document AI de tu dong hoa quy trinh thong quan.

### 9.6. Y te va Duoc pham

**Ung dung:**
- Don thuoc (Prescriptions): Nhan dang chu viet tay bac si — mot trong nhung bai toan kho nhat
- Ho so benh an (Medical records)
- Ket qua xet nghiem (Lab results)
- Hoa don vien phi (Medical bills)

**Thach thuc:** Chu viet tay bac si la "hieu tham" — cuc ky kho nhan dang, ngay ca voi con nguoi. Can mo hinh chuyen biet voi du lieu huan luyen tu benh vien.

### 9.7. Giao duc

**Ung dung:**
- Cham thi trac nghiem tu dong (OMR — Optical Mark Recognition)
- Cham bai tu luan (handwriting recognition + NLP grading)
- So hoa tai lieu hoc thuat (sach giao khoa, giao trinh)
- Trich xuat thong tin tu bang diem, hoc ba

### 9.8. Bat dong san va Phap ly

**Ung dung:**
- Phan tich hop dong (contract analysis): Trich xuat cac dieu khoan quan trong, ngay het han, nghia vu
- So hoa giay to nha dat
- Due diligence tu dong: Doc va tom tat hang tram tai lieu phap ly

---

## 10. Khoang trong nghien cuu (Research Gaps)

### 10.1. Thach thuc cho Tieng Viet

**1. Thieu du lieu huan luyen chat luong:**
- Chua co dataset OCR tieng Viet quy mo lon (>1M anh) nhu cac ngon ngu lon
- Dataset chu viet tay tieng Viet gan nhu khong co (chi co vai nghin mau tu cac truong dai hoc)
- Dataset tai lieu hanh chinh Viet Nam: khong co benchmark cong khai
- Can: Ngan sach quoc gia cho viec xay dung dataset Document AI tieng Viet

**2. Dau thanh dieu (Tone marks):**
- OCR thuong bi nham cac dau: sac/nga, hoi/nang, a/a-breve, o/o-circumflex/o-horn
- Chu viet tay: dau thanh dieu rat nho, de bi bo qua
- Chua co nghien cuu chuyen sau ve tone-aware OCR cho tieng Viet

**3. Tai lieu da the he (Multi-era documents):**
- Giay to truoc 1975 (chu Phap, chu Nom co the xuat hien)
- Giay to thoi bao cap (1975-1990): giay xuong cap, in lito (lithograph)
- Giay to hien dai (2000+): in laser, chon chat luong
- Can mo hinh co the xu ly tat ca cac loai

**4. Chu Nom (Han-Nom) OCR:**
- Co hang trieu trang sach co (dien tich Han-Nom)
- OCR cho Chu Nom van con o giai doan so khai
- Thieu du lieu huan luyen, thieu chuyen gia so hoa

### 10.2. Thach thuc Ky thuat Chung

**5. Multi-page Document Understanding:**
- Hau het cac mo hinh chi xu ly 1 trang (single-page)
- Tai lieu thuc te thuong dai hang chuc den hang tram trang
- Thong tin co the nam roi rac o nhieu trang
- Can: Mo hinh hieu ngu canh lien trang (cross-page context)
- Tien bo: Claude 1M context, Gemini 2M context dang giai quyet phan nao

**6. Low-quality Document Processing:**
- Tai lieu cu, bi o vang, bi nuoc, bi rach
- Anh chup (khong phai scan): bi choi, bi nghieng, bi mo, doc kem
- Tai lieu photocopy nhieu lan: mat net, bi nhoe
- Can: Mo hinh robust hon voi nhieu loai noise

**7. Complex Table Extraction:**
- Bang long nhau (nested tables)
- Bang khong co duong ke (borderless)
- Bang trai nhieu trang (multi-page tables)
- O tron phuc tap (complex merged cells)
- Van la bai toan kho — SOTA chi dat ~85% tren cac truong hop phuc tap

**8. Handwriting Recognition cho tieng Viet:**
- Gần nhu chua co he thong thuong mai nhan dang chu viet tay tieng Viet chinh xac
- Can du lieu lon tu nhieu nguoi viet khac nhau
- Chu viet tay bac si, ghi chu nhanh: rat kho

**9. Document Forgery Detection (Phat hien Gia mao):**
- Phat hien giay to gia (CMND/CCCD gia, bang cap gia, hop dong gia)
- Can ket hop Computer Vision (phat hien chinh sua anh) va Document AI (kiem tra tinh nhat quan noi dung)
- Chua co dataset gia mao tai lieu tieng Viet

**10. Privacy-preserving Document AI:**
- Tai lieu chua thong tin ca nhan nhay cam
- Can xu ly on-premise (khong gui len cloud)
- Can mo hinh nhe chay tren may noi bo
- Federated learning cho document AI: nghien cuu con han che

**11. Domain Adaptation (Thich ung Mien):**
- Mo hinh huan luyen tren tai lieu tieng Anh/Trung hoat dong kem tren tai lieu tieng Viet
- Can phuong phap domain adaptation hieu qua
- Few-shot / zero-shot adaptation cho loai tai lieu moi

**12. Evaluation Metrics (Do luong Danh gia):**
- ANLS (DocVQA) chi do do tuong dong van ban, khong do hieu dung ngu nghia
- Can metrics tot hon cho: table extraction (GriTS), layout analysis, IE
- Can benchmark tong hop cho tieng Viet

### 10.3. Huong Nghien cuu Tuong lai

1. **Unified Document Foundation Model cho tieng Viet:** Mot mo hinh duy nhat xu ly moi tac vu tren tai lieu tieng Viet
2. **On-device Document AI:** Mo hinh <1B params chay tren dien thoai cho eKYC, scan hoa don
3. **Self-supervised pre-training tren tai lieu tieng Viet:** Thu thap va pre-train tren hang trieu trang tai lieu tieng Viet
4. **Active Learning cho Document AI:** Giam luong du lieu can gan nhan bang human-in-the-loop
5. **Multimodal RAG cho tai lieu doanh nghiep:** Ket hop document retrieval + VLM de hoi dap tren kho tai lieu lon
6. **Han-Nom digitization:** So hoa di san van hoa bang AI
7. **Agentic Document Workflows:** AI agents tu dong hoa toan bo quy trinh xu ly tai lieu doanh nghiep

---

## 11. Tai lieu tham khao

### Bai bao chinh (Primary Papers)

1. Xu, Y., et al. (2020). "LayoutLM: Pre-training of Text and Layout for Document Image Understanding." *KDD 2020*. [arXiv:1912.13318]

2. Huang, Y., et al. (2022). "LayoutLMv3: Pre-training for Document AI with Unified Text and Image Masking." *ACM Multimedia 2022*. [arXiv:2204.08387]

3. Kim, G., et al. (2022). "OCR-free Document Understanding Transformer (Donut)." *ECCV 2022*. [arXiv:2111.15664]

4. Li, M., et al. (2021). "TrOCR: Transformer-based Optical Character Recognition with Pre-trained Models." *AAAI 2023*. [arXiv:2109.10282]

5. Smock, B., et al. (2022). "PubTables-1M: Towards comprehensive table extraction from unstructured documents." *CVPR 2022*. [arXiv:2110.00061]

6. Blecher, L., et al. (2023). "Nougat: Neural Optical Understanding for Academic Documents." *arXiv:2308.13418*.

7. Mathew, M., et al. (2021). "DocVQA: A Dataset for VQA on Document Images." *WACV 2021*. [arXiv:2007.00398]

8. Xu, Y., et al. (2022). "XFUND: A Benchmark Dataset for Multilingual Visually Rich Form Understanding." *ACL 2022 Findings*. [arXiv:2104.08836]

9. Tang, Z., et al. (2023). "Unifying Vision, Text, and Layout for Universal Document Processing." *CVPR 2023*. [arXiv:2212.02623]

10. Hu, A., et al. (2024). "mPLUG-DocOwl 1.5: Unified Structure Learning for OCR-free Document Understanding." [arXiv:2403.12895]

11. Wei, H., et al. (2024). "General OCR Theory: Towards OCR-2.0 via a Unified End-to-end Model." [arXiv:2409.01704]

12. Zhong, X., et al. (2019). "PubLayNet: Largest Dataset Ever for Document Layout Analysis." *ICDAR 2019*. [arXiv:1908.07836]

### Bai bao bo sung (Supplementary Papers)

13. Liao, M., et al. (2022). "Real-Time Scene Text Detection with Differentiable Binarization and Adaptive Scale Fusion." *TPAMI 2022*. (DBNet++)

14. Bautista, D., & Atienza, R. (2022). "Scene Text Recognition with Permuted Autoregressive Sequence Models." *ECCV 2022*. (PARSeq)

15. Li, J., et al. (2020). "STRUCT-BERT: Incorporating Language Structures into Pre-training for Deep Language Understanding." (Nen tang cho document NER)

16. Xu, Y., et al. (2021). "LayoutXLM: Multimodal Pre-training for Multilingual Visually-rich Document Understanding." [arXiv:2104.08836]

17. Lee, C.Y., & Osindero, S. (2016). "Recursive Recurrent Nets with Attention Modeling for OCR in the Wild." *CVPR 2016*.

18. Shi, B., Bai, X., & Yao, C. (2017). "An End-to-End Trainable Neural Network for Image-Based Sequence Recognition and Its Application to Scene Text Recognition." *TPAMI 2017*. (CRNN)

### Tai nguyen va Dataset

19. FUNSD: https://guillaumejaume.github.io/FUNSD/ — Form Understanding in Noisy Scanned Documents
20. CORD: https://github.com/clovaai/cord — Consolidated Receipt Dataset
21. SROIE: ICDAR 2019 Scanned Receipts OCR and Information Extraction
22. DocVQA: https://www.docvqa.org/
23. PubLayNet: https://github.com/ibm-aur-nlp/PubLayNet
24. PubTables-1M: https://github.com/microsoft/table-transformer
25. RVL-CDIP: https://adamharley.com/rvl-cdip/
26. XFUND-VI (tieng Viet): https://github.com/nicheerfeng/LayoutXLM-XFUND-VI

### Thu vien va Framework

27. Tesseract OCR: https://github.com/tesseract-ocr/tesseract
28. PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
29. DocTR: https://github.com/mindee/doctr
30. Hugging Face Transformers (LayoutLM, TrOCR, DiT): https://huggingface.co/models
31. Unstructured.io: https://github.com/Unstructured-IO/unstructured — Thu vien xu ly tai lieu da dinh dang
32. LlamaIndex / LangChain: Document parsing va RAG pipelines

### Tai nguyen tieng Viet

33. VinAI/PhoNLP: https://github.com/VinAIResearch/PhoNLP — NLP tools cho tieng Viet
34. vietocr: https://github.com/pbcquoc/vietocr — OCR chuyen cho tieng Viet (Transformer-based)
35. FPT.AI Document AI: https://fpt.ai/ — Nen tang Document AI Viet Nam

---

*Bao cao nay duoc bien soan boi Dr. Archon (R-alpha) nhu mot phan cua du an MAESTRO Knowledge Graph, Phase 1, Module B02. Noi dung dua tren nghien cuu tong hop cac bai bao, benchmark, va xu huong den thang 3/2026.*

*Buoc tiep theo: Dr. Praxis (beta) se bien soan tech-report.md voi cac chi tiet ky thuat trien khai, so sanh hieu suat, va huong dan thuc hanh.*
