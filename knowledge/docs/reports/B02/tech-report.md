# Bao cao Ky thuat: B02 — Document Intelligence
## Tac gia: Dr. Praxis (R-beta) — Ngay: 2026-03-31
## Trang thai: CAN REVIEW
## Tiep theo: Dr. Sentinel (gamma) — feasibility-report.md

---

## 1. Tom tat ky thuat

Document Intelligence (Tri tue Tai lieu) la linh vuc ung dung AI de tu dong hieu, phan tich va trich xuat thong tin tu tai lieu. Bao cao ky thuat nay tap trung vao **cach trien khai thuc te** — tu viec chon tech stack, thiet ke pipeline, den code patterns va uoc luong noi luc.

### 1.1. Boi canh ky thuat

Tu goc do ky thuat, Document Intelligence 2025-2026 co 3 paradigm (mo hinh tiep can) chinh:

| Paradigm | Mo ta | Dai dien | Phu hop |
|----------|-------|----------|---------|
| **Pipeline truyen thong** | OCR -> NER -> IE theo tung buoc | PaddleOCR + LayoutLMv3 | San pham on dinh, du lieu lon |
| **OCR-free end-to-end** | Doc truc tiep tu anh, sinh output | Donut, GOT, Nougat | San pham vua, it phu thuoc OCR |
| **Vision LLM** | Gui anh + prompt, nhan ket qua | Claude Vision, GPT-4V | Prototype nhanh, zero-shot, long-tail |

### 1.2. Khuyen nghi tong quat

Doi voi doi ngu Viet Nam (Smartlog AI Division va cac doi tuong tu):

- **MVP / Prototype**: Su dung Vision LLM (Claude API / GPT-4o) de validate y tuong nhanh nhat. Chi phi: token-based, khong can GPU.
- **Production v1**: Ket hop PaddleOCR (text extraction) + LayoutLMv3 fine-tuned (information extraction) cho cac loai tai lieu co dinh (hoa don, CCCD, hop dong).
- **Scale-up**: Xay dung pipeline hybrid — VLM xu ly truong hop kho, mo hinh chuyen biet xu ly truong hop pho bien (chi phi thap hon).

### 1.3. Cac yeu to quyet dinh chinh

1. **Ngon ngu**: Tieng Viet voi dau thanh dieu — uu tien PaddleOCR (tot cho ngon ngu Chau A) hoac vietocr (chuyen cho tieng Viet)
2. **Loai tai lieu**: Form co dinh (template-based) vs tai lieu tu do (free-form) quyet dinh kien truc
3. **Yeu cau privacy**: On-premise bat buoc -> loai bo VLM cloud, dung mo hinh local
4. **Thoi gian ra san pham**: < 2 thang -> VLM API; 3-6 thang -> pipeline chuyen biet

---

## 2. Ma tran quyet dinh Tech Stack (Decision Matrix)

### 2.1. Ma tran lua chon OCR Engine

| Tieu chi (Trong so) | PaddleOCR | Tesseract 5 | EasyOCR | DocTR | vietocr |
|---------------------|-----------|-------------|---------|-------|---------|
| **Do chinh xac tieng Viet (25%)** | 8/10 | 6/10 | 7/10 | 5/10 | 9/10 |
| **Toc do inference (20%)** | 9/10 | 5/10 | 6/10 | 7/10 | 7/10 |
| **De tich hop (15%)** | 7/10 | 9/10 | 8/10 | 8/10 | 7/10 |
| **Cong dong & Tai lieu (15%)** | 7/10 | 9/10 | 7/10 | 6/10 | 5/10 |
| **Mo hinh nhe / Edge (10%)** | 9/10 | 6/10 | 5/10 | 7/10 | 6/10 |
| **Layout Analysis (10%)** | 9/10 | 4/10 | 3/10 | 5/10 | 2/10 |
| **Table Extraction (5%)** | 8/10 | 2/10 | 2/10 | 3/10 | 1/10 |
| **TONG DIEM** | **8.15** | **6.20** | **5.95** | **6.10** | **6.30** |
| **Xep hang** | **#1** | #4 | #5 | #3 | #2 |

**Ket luan OCR**: PaddleOCR la lua chon hang dau cho production. vietocr la lua chon tot nhat neu chi can text recognition tieng Viet (khong can detection, layout). Tesseract phu hop cho prototype nhanh (cai dat don gian nhat).

### 2.2. Ma tran lua chon Document Understanding Model

| Tieu chi (Trong so) | LayoutLMv3 | Donut | GPT-4V/Claude Vision | UDOP | DocOwl 1.5 |
|---------------------|-----------|-------|----------------------|------|------------|
| **Do chinh xac (25%)** | 9/10 | 7/10 | 9/10 | 9/10 | 8/10 |
| **Zero-shot (20%)** | 3/10 | 4/10 | 10/10 | 5/10 | 6/10 |
| **Chi phi inference (15%)** | 9/10 | 8/10 | 3/10 | 7/10 | 7/10 |
| **Privacy/On-premise (15%)** | 10/10 | 10/10 | 2/10 | 8/10 | 9/10 |
| **De fine-tune (10%)** | 8/10 | 7/10 | 1/10 | 5/10 | 6/10 |
| **Multi-task (10%)** | 6/10 | 5/10 | 10/10 | 9/10 | 8/10 |
| **Tieng Viet (5%)** | 7/10 | 6/10 | 9/10 | 5/10 | 5/10 |
| **TONG DIEM** | **7.35** | **6.55** | **6.45** | **6.90** | **7.00** |
| **Xep hang** | **#1** | #5 | #4 | #3 | #2 |

**Ket luan Model**: LayoutLMv3 cho production on-premise. Vision LLM cho prototype va truong hop zero-shot. DocOwl 1.5 la loi chon can bang tot giua hieu suat va kha nang chay local.

### 2.3. Ma tran lua chon theo Use Case

| Use Case | Phuong an de xuat | Ly do |
|----------|-------------------|-------|
| eKYC (CMND/CCCD) | PaddleOCR + rule-based extraction | Template co dinh, can on-premise, toc do cao |
| Hoa don (Invoice) | PaddleOCR + LayoutLMv3 fine-tuned | Nhieu format, can IE chinh xac |
| Hop dong (Contract) | Claude Vision API + structured output | Tai lieu dai, nhieu dinh dang, can hieu ngu canh |
| Don thuoc (Prescription) | vietocr fine-tuned + domain LM | Chu viet tay tieng Viet, can mo hinh chuyen biet |
| Tai lieu hanh chinh | Hybrid: VLM (phan loai) + pipeline (trich xuat) | Da dang loai, can linh hoat |
| Bao cao tai chinh | Claude/GPT-4o + table extraction | Bang phuc tap, can suy luan |
| So hoa tai lieu cu | PaddleOCR + pre-processing nang | Chat luong anh thap, can tien xu ly manh |

---

## 3. Kien truc Pipeline chi tiet

### 3.1. Tong quan Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOCUMENT INTELLIGENCE PIPELINE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  [1. INGESTION]  →  [2. PRE-PROCESSING]  →  [3. OCR/PARSING]       │
│       │                    │                       │                  │
│   Upload API          De-skew              PaddleOCR                │
│   File watcher        De-noise             vietocr                  │
│   Email parser        Binarize             Vision LLM               │
│   Scanner SDK         Resolution ↑                                   │
│       │                    │                       │                  │
│       ▼                    ▼                       ▼                  │
│  [4. UNDERSTANDING]  →  [5. EXTRACTION]  →  [6. VALIDATION]        │
│       │                    │                       │                  │
│   Layout Analysis     Key-Value IE         Confidence check         │
│   Classification      Table extraction     Business rules           │
│   Page ordering       Entity linking       Human review queue       │
│       │                    │                       │                  │
│       ▼                    ▼                       ▼                  │
│  [7. STORAGE & OUTPUT]                                               │
│       │                                                               │
│   PostgreSQL / MongoDB                                               │
│   Elasticsearch (search)                                             │
│   S3/MinIO (files)                                                   │
│   API response (JSON)                                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2. Layer 1: Document Ingestion (Tiep nhan Tai lieu)

**Muc tieu**: Nhan tai lieu tu nhieu nguon, chuyen thanh dinh dang chuan.

**Cac nguon dau vao:**

| Nguon | Dinh dang | Xu ly |
|-------|-----------|-------|
| Upload API | PDF, JPEG, PNG, TIFF, HEIC | Chuyen tat ca thanh anh PNG/JPEG |
| Email attachment | PDF, DOC, XLS | Trich xuat attachment, chuyen sang anh |
| Scanner / Camera | JPEG, RAW | Nhan truc tiep |
| Cloud storage | Link URL | Download va xu ly |
| Batch upload | ZIP chua nhieu file | Giai nen va xu ly tung file |

**Xu ly PDF:**
- PDF dang anh (scanned): Chuyen moi trang thanh anh (dung `pdf2image` / `PyMuPDF`)
- PDF dang van ban (digital-born): Trich xuat text truc tiep (dung `PyMuPDF` / `pdfplumber`), khong can OCR
- PDF hon hop (mixed): Phat hien trang nao can OCR, trang nao lay text truc tiep

```python
# Phat hien PDF type
import fitz  # PyMuPDF

def classify_pdf_page(page):
    """Phan loai trang PDF: digital-born hay scanned."""
    text = page.get_text()
    images = page.get_images()

    if len(text.strip()) > 50:
        return "digital"  # Co text -> digital-born
    elif len(images) > 0:
        return "scanned"  # Chi co anh -> scanned
    else:
        return "empty"
```

**Metadata thu thap tai buoc nay:**
- File name, size, format, page count
- Upload timestamp, source
- MD5 hash (de-duplication)
- EXIF data (neu co)

### 3.3. Layer 2: Pre-processing (Tien xu ly)

**Muc tieu**: Cai thien chat luong anh de tang do chinh xac OCR.

**Pipeline tien xu ly theo thu tu:**

```
Original Image
  → [1] Orientation Detection & Correction (xoay dung chieu)
  → [2] De-skew (chinh nghieng)
  → [3] Noise Removal (khu nhieu)
  → [4] Binarization (nhi phan hoa) — tuy chon
  → [5] Resolution Check & Enhancement (kiem tra va tang do phan giai)
  → [6] Contrast Enhancement (tang do tuong phan) — tuy chon
  → Processed Image
```

**Chi tiet ky thuat tung buoc:**

**Buoc 1 — Orientation Detection:**
- Su dung Tesseract OSD (Orientation and Script Detection) hoac PaddleOCR direction classifier
- Phat hien 4 goc: 0, 90, 180, 270 do
- Xoay anh ve dung chieu truoc khi OCR

**Buoc 2 — De-skew:**
- Phat hien goc nghieng bang Hough Line Transform hoac projection profile
- Goc nghieng chap nhan: -45 den +45 do (ngoai khoang nay -> co the la xoay 90 do)
- Su dung `cv2.getRotationMatrix2D` de xoay

**Buoc 3 — Noise Removal:**
- Gaussian Blur (kernel 3x3 hoac 5x5) cho nhieu nhe
- Median Filter cho nhieu salt-and-pepper
- Morphological operations (opening, closing) cho nhieu lon
- **Luu y**: Qua nhieu de-noise se mat chi tiet van ban nho

**Buoc 4 — Binarization:**
- Otsu's method: Tu dong tim nguong toi uu, tot cho tai lieu co tuong phan ro
- Sauvola: Adaptive local threshold, tot cho tai lieu co nen khong deu (stamp, watermark)
- Chi ap dung khi OCR engine yeu cau anh binary (Tesseract)
- PaddleOCR va VLMs hoat dong tot voi anh mau — khong can binarize

**Buoc 5 — Resolution Enhancement:**
- Kiem tra DPI: toi thieu 150 DPI cho van ban in, 300 DPI ly tuong
- Neu DPI thap: dung bicubic interpolation hoac Real-ESRGAN (deep learning super-resolution)
- **Luu y**: Super-resolution cham (~0.5-2s/anh tren GPU), chi dung khi thuc su can

**Buoc 6 — Contrast Enhancement:**
- CLAHE (Contrast Limited Adaptive Histogram Equalization) cho anh co tuong phan thap
- Chi ap dung cho tai lieu cu, bi o vang, bi bac mau

### 3.4. Layer 3: OCR / Parsing

**Muc tieu**: Chuyen anh tai lieu thanh van ban co vi tri (text + bounding boxes).

**3 chien luoc OCR:**

**Chien luoc A — PaddleOCR Pipeline (De xuat cho Production):**

```
Image → Text Detection (DBNet++) → Text Recognition (SVTR_LCNet) → Output
         ↓                           ↓
    Bounding boxes              Text + confidence
         ↓
    Direction Classifier (0°/180°)
```

- Thoi gian: ~50-100ms/trang tren GPU (T4), ~200-500ms/trang tren CPU
- Do chinh xac tieng Viet: ~85-92% (tuy chat luong anh)
- Mo hinh PP-OCRv4: server (20MB) va mobile (4.4MB)

**Chien luoc B — vietocr (De xuat cho Text Recognition tieng Viet):**

```
Image → Text Detection (CRAFT/DBNet) → Crop text regions → vietocr → Output
```

- vietocr su dung Transformer-based seq2seq, huan luyen rieng cho tieng Viet
- Do chinh xac dau thanh dieu cao hon PaddleOCR tren nhieu truong hop
- Can ket hop voi text detector rieng (CRAFT hoac DBNet tu PaddleOCR)

**Chien luoc C — Vision LLM (De xuat cho Prototype / Zero-shot):**

```
Image → Claude Vision API / GPT-4o → Structured JSON Output
```

- Khong can pipeline OCR rieng
- Chinh xac cao cho zero-shot, dac biet voi tai lieu phuc tap
- Chi phi: ~$0.01-0.05/trang (tuy resolution va prompt length)
- Latency: ~2-5s/trang

**Chien luoc D — Hybrid (De xuat cho Scale):**

```
Image → PaddleOCR (fast, cheap) → Confidence Check
         ↓                              ↓
    High confidence (>0.9)      Low confidence (<0.9)
         ↓                              ↓
    Accept result              Re-process with VLM
```

- Giam chi phi: ~80% tai lieu xu ly bang pipeline re, chi ~20% can VLM
- Dat do chinh xac cao nhat voi chi phi hop ly

### 3.5. Layer 4: Document Understanding

**Muc tieu**: Hieu cau truc va noi dung tai lieu (layout, loai, thu tu doc).

**4a — Layout Analysis:**

Su dung DiT (Document Image Transformer) hoac PP-Structure (PaddleOCR):

| Thanh phan | Mo ta | Model |
|------------|-------|-------|
| Text block | Vung van ban chinh | DiT / YOLO fine-tuned |
| Title | Tieu de, heading | DiT |
| Table | Bang bieu | Table Transformer |
| Figure | Hinh anh, bieu do | DiT |
| Header/Footer | Dau/cuoi trang | Rule-based + DiT |
| Page number | So trang | Rule-based |

**4b — Document Classification:**

```python
# Phan loai tai lieu bang LayoutLMv3
# Cac loai: hoa_don, hop_dong, cccd, don_thuoc, bao_cao, khac

from transformers import AutoModelForSequenceClassification, AutoProcessor

model = AutoModelForSequenceClassification.from_pretrained(
    "microsoft/layoutlmv3-base",
    num_labels=6  # so loai tai lieu
)
# Fine-tune tren du lieu tieng Viet
```

**4c — Reading Order Detection:**

- Xac dinh thu tu doc cac text block tren trang
- Phuong phap: Top-to-bottom, left-to-right, co tinh den layout nhieu cot
- Quan trong cho tai lieu nhieu cot (bao, tap chi)

### 3.6. Layer 5: Information Extraction (Trich xuat Thong tin)

**Muc tieu**: Trich xuat cac truong du lieu cu the tu tai lieu.

**5a — Key-Value Extraction voi LayoutLMv3:**

Mo hinh LayoutLMv3 fine-tuned cho NER tren tai lieu:
- Input: Token text + bounding box coordinates + image patches
- Output: BIO tags cho moi token (B-FIELD, I-FIELD, O)

Vi du cho hoa don:
```
Token:          "So"   "hoa"  "don"  ":"   "HD001"
BIO tag:        O       O      O      O    B-INVOICE_NO
Position:       (50,100,80,120)  ...  (200,100,280,120)
```

**5b — Table Extraction:**

Pipeline 2 buoc:
1. Table Detection: Phat hien vi tri bang trong trang (Table Transformer / DETR)
2. Table Structure Recognition: Xac dinh hang, cot, o (Table Transformer / SLANet)

Output: HTML table hoac JSON structured

**5c — Template-based Extraction (cho form co dinh):**

Voi cac loai form co bo cuc co dinh (CCCD, hoa don mau chuan):
- Dinh nghia template voi vi tri cac truong (ROI — Region of Interest)
- Dung template matching de align tai lieu voi template
- Crop tung vung va OCR rieng

```python
# Vi du template cho CCCD
CCCD_TEMPLATE = {
    "ho_ten":       {"roi": (150, 200, 500, 240), "type": "text"},
    "ngay_sinh":    {"roi": (150, 250, 350, 290), "type": "date"},
    "gioi_tinh":    {"roi": (400, 250, 500, 290), "type": "enum", "values": ["Nam", "Nu"]},
    "quoc_tich":    {"roi": (150, 300, 350, 340), "type": "text"},
    "so_cccd":      {"roi": (250, 100, 500, 150), "type": "numeric_12"},
    "noi_thuong_tru": {"roi": (150, 350, 500, 420), "type": "text"},
}
```

### 3.7. Layer 6: Validation (Kiem tra)

**Muc tieu**: Dam bao do chinh xac cua ket qua trich xuat.

**Cac tang kiem tra:**

| Tang | Loai kiem tra | Vi du |
|------|---------------|-------|
| 1 | Confidence threshold | Loai bo ket qua co confidence < 0.7 |
| 2 | Format validation | Ma so thue phai co 10 hoac 13 chu so |
| 3 | Business rules | Tong tien = SUM(thanh tien) + thue |
| 4 | Cross-field check | Ngay lap <= Ngay hien tai |
| 5 | Database lookup | Ma so thue ton tai trong CSDL doanh nghiep |
| 6 | Human review | Truong hop confidence thap -> gui cho nguoi review |

**Human-in-the-loop (HITL):**

```
Ket qua trich xuat → Confidence score → Routing:
  - Score >= 0.95: Tu dong chap nhan (auto-accept)
  - 0.7 <= Score < 0.95: Review nhanh (highlight truong khong chac chan)
  - Score < 0.7: Review toan bo (gui cho nguoi kiem tra)
```

Muc tieu: >80% tai lieu duoc tu dong xu ly (straight-through processing rate), ~15% review nhanh, <5% can review toan bo.

### 3.8. Layer 7: Storage & Output

**Schema luu tru:**

```sql
-- PostgreSQL schema
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(500),
    file_path VARCHAR(1000),
    file_type VARCHAR(50),      -- pdf, jpeg, png
    doc_type VARCHAR(100),       -- hoa_don, hop_dong, cccd
    page_count INT,
    status VARCHAR(50),          -- processing, completed, failed, review
    confidence_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    metadata JSONB
);

CREATE TABLE extracted_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id),
    page_number INT,
    field_name VARCHAR(200),     -- so_hoa_don, ten_nha_cung_cap
    field_value TEXT,
    confidence FLOAT,
    bounding_box JSONB,          -- {"x1": 100, "y1": 200, "x2": 300, "y2": 240}
    verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ocr_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id),
    page_number INT,
    full_text TEXT,
    words JSONB,                 -- [{"text": "abc", "bbox": [...], "conf": 0.95}]
    layout JSONB,                -- [{"type": "table", "bbox": [...]}]
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Output formats:**

| Format | Use case |
|--------|----------|
| JSON API response | Tich hop voi frontend / he thong khac |
| CSV export | Bao cao, phan tich du lieu |
| Elasticsearch index | Tim kiem full-text trong tai lieu |
| Webhook notification | Thong bao khi xu ly xong |

---

## 4. Code Patterns & Mini Examples

### 4.1. Example 1: OCR Pipeline voi PaddleOCR

```python
"""
Document OCR Pipeline voi PaddleOCR
Trich xuat van ban tu anh tai lieu tieng Viet
"""
from paddleocr import PaddleOCR
import cv2
import numpy as np
from pathlib import Path
from dataclasses import dataclass


@dataclass
class OCRWord:
    text: str
    confidence: float
    bbox: list  # [x1, y1, x2, y2]


@dataclass
class OCRResult:
    words: list[OCRWord]
    full_text: str
    avg_confidence: float
    page_number: int = 1


class DocumentOCR:
    """OCR engine cho tai lieu tieng Viet."""

    def __init__(self, use_gpu: bool = True, lang: str = "vi"):
        self.ocr = PaddleOCR(
            use_angle_cls=True,    # Tu dong phat hien huong van ban
            lang=lang,              # Ngon ngu: vi (Viet), en, ch, ...
            use_gpu=use_gpu,
            show_log=False,
            det_model_dir=None,     # None = su dung model mac dinh
            rec_model_dir=None,
            cls_model_dir=None,
        )

    def preprocess(self, image: np.ndarray) -> np.ndarray:
        """Tien xu ly anh tai lieu."""
        # 1. Chuyen sang grayscale neu can
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        # 2. De-noise voi median filter
        denoised = cv2.medianBlur(gray, 3)

        # 3. Kiem tra va tang do tuong phan neu can
        mean_brightness = np.mean(denoised)
        if mean_brightness < 100 or mean_brightness > 200:
            # CLAHE cho anh co tuong phan thap
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            denoised = clahe.apply(denoised)

        # 4. Chuyen lai sang BGR cho PaddleOCR (can 3 channels)
        processed = cv2.cvtColor(denoised, cv2.COLOR_GRAY2BGR)
        return processed

    def detect_and_recognize(
        self,
        image_path: str,
        preprocess: bool = True,
        min_confidence: float = 0.5,
    ) -> OCRResult:
        """Thuc hien OCR tren 1 anh tai lieu."""
        image = cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Khong doc duoc anh: {image_path}")

        if preprocess:
            image = self.preprocess(image)

        # Chay PaddleOCR
        results = self.ocr.ocr(image, cls=True)

        words = []
        for line in results[0]:  # results[0] cho anh dau tien
            if line is None:
                continue
            bbox_points = line[0]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
            text = line[1][0]
            confidence = line[1][1]

            if confidence < min_confidence:
                continue

            # Chuyen polygon thanh rectangle bbox
            xs = [p[0] for p in bbox_points]
            ys = [p[1] for p in bbox_points]
            bbox = [min(xs), min(ys), max(xs), max(ys)]

            words.append(OCRWord(
                text=text,
                confidence=confidence,
                bbox=bbox,
            ))

        # Sap xep theo vi tri (top-to-bottom, left-to-right)
        words.sort(key=lambda w: (w.bbox[1], w.bbox[0]))

        full_text = " ".join(w.text for w in words)
        avg_conf = (
            sum(w.confidence for w in words) / len(words) if words else 0
        )

        return OCRResult(
            words=words,
            full_text=full_text,
            avg_confidence=avg_conf,
        )

    def process_pdf(
        self, pdf_path: str, max_pages: int = 50
    ) -> list[OCRResult]:
        """Xu ly toan bo file PDF."""
        import fitz  # PyMuPDF

        doc = fitz.open(pdf_path)
        results = []

        for page_num in range(min(len(doc), max_pages)):
            page = doc[page_num]

            # Kiem tra xem trang co text san khong
            text = page.get_text().strip()
            if len(text) > 50:
                # Digital PDF — lay text truc tiep
                results.append(OCRResult(
                    words=[],
                    full_text=text,
                    avg_confidence=1.0,
                    page_number=page_num + 1,
                ))
                continue

            # Scanned PDF — can OCR
            pix = page.get_pixmap(dpi=300)
            img_array = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
                pix.height, pix.width, pix.n
            )

            # Luu tam anh de OCR
            temp_path = f"/tmp/page_{page_num}.png"
            cv2.imwrite(temp_path, img_array)

            result = self.detect_and_recognize(temp_path)
            result.page_number = page_num + 1
            results.append(result)

        doc.close()
        return results


# Su dung
if __name__ == "__main__":
    ocr = DocumentOCR(use_gpu=True, lang="vi")

    # OCR 1 anh
    result = ocr.detect_and_recognize("hoa_don_scan.jpg")
    print(f"Van ban: {result.full_text}")
    print(f"Do chinh xac TB: {result.avg_confidence:.2%}")

    for word in result.words[:5]:
        print(f"  '{word.text}' (conf={word.confidence:.2f}, bbox={word.bbox})")

    # OCR file PDF
    pdf_results = ocr.process_pdf("bao_cao_tai_chinh.pdf")
    for page_result in pdf_results:
        print(f"\n--- Trang {page_result.page_number} ---")
        print(page_result.full_text[:200])
```

### 4.2. Example 2: Document Classification voi LayoutLMv3

```python
"""
Phan loai tai lieu tieng Viet voi LayoutLMv3
Fine-tune tren cac loai: hoa_don, hop_dong, cccd, don_xin, bao_cao, khac
"""
import torch
from transformers import (
    LayoutLMv3ForSequenceClassification,
    LayoutLMv3Processor,
    TrainingArguments,
    Trainer,
)
from datasets import Dataset
from PIL import Image
import json


# Dinh nghia cac loai tai lieu
DOC_TYPES = [
    "hoa_don",      # Invoice
    "hop_dong",     # Contract
    "cccd",         # Citizen ID Card
    "don_xin",      # Application form
    "bao_cao",      # Report
    "khac",         # Other
]

LABEL2ID = {label: i for i, label in enumerate(DOC_TYPES)}
ID2LABEL = {i: label for label, i in LABEL2ID.items()}


class DocumentClassifier:
    """Phan loai tai lieu tieng Viet bang LayoutLMv3."""

    def __init__(self, model_path: str = "microsoft/layoutlmv3-base"):
        self.processor = LayoutLMv3Processor.from_pretrained(
            model_path, apply_ocr=True  # Tu dong chay OCR
        )
        self.model = LayoutLMv3ForSequenceClassification.from_pretrained(
            model_path,
            num_labels=len(DOC_TYPES),
            label2id=LABEL2ID,
            id2label=ID2LABEL,
        )
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)

    def predict(self, image_path: str) -> dict:
        """Du doan loai tai lieu tu anh."""
        image = Image.open(image_path).convert("RGB")

        encoding = self.processor(
            image,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding="max_length",
        )

        # Chuyen sang device
        encoding = {k: v.to(self.device) for k, v in encoding.items()}

        with torch.no_grad():
            outputs = self.model(**encoding)

        probs = torch.softmax(outputs.logits, dim=-1)[0]
        predicted_class = torch.argmax(probs).item()

        return {
            "doc_type": ID2LABEL[predicted_class],
            "confidence": probs[predicted_class].item(),
            "all_scores": {
                ID2LABEL[i]: probs[i].item()
                for i in range(len(DOC_TYPES))
            },
        }

    def fine_tune(
        self,
        train_data: list[dict],  # [{"image_path": ..., "label": ...}]
        val_data: list[dict],
        output_dir: str = "./doc_classifier_model",
        epochs: int = 10,
        batch_size: int = 8,
        learning_rate: float = 2e-5,
    ):
        """Fine-tune mo hinh tren du lieu tieng Viet."""

        def preprocess_function(examples):
            images = [Image.open(p).convert("RGB") for p in examples["image_path"]]
            encoding = self.processor(
                images,
                return_tensors="pt",
                max_length=512,
                truncation=True,
                padding="max_length",
            )
            encoding["labels"] = torch.tensor(
                [LABEL2ID[l] for l in examples["label"]]
            )
            return encoding

        train_dataset = Dataset.from_list(train_data)
        val_dataset = Dataset.from_list(val_data)

        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=epochs,
            per_device_train_batch_size=batch_size,
            per_device_eval_batch_size=batch_size,
            learning_rate=learning_rate,
            weight_decay=0.01,
            eval_strategy="epoch",
            save_strategy="epoch",
            load_best_model_at_end=True,
            metric_for_best_model="accuracy",
            logging_steps=50,
            fp16=torch.cuda.is_available(),
        )

        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=train_dataset.map(
                preprocess_function, batched=True, batch_size=batch_size
            ),
            eval_dataset=val_dataset.map(
                preprocess_function, batched=True, batch_size=batch_size
            ),
        )

        trainer.train()
        trainer.save_model(output_dir)
        self.processor.save_pretrained(output_dir)

        print(f"Mo hinh da luu tai: {output_dir}")


# Su dung
if __name__ == "__main__":
    classifier = DocumentClassifier()

    result = classifier.predict("sample_invoice.jpg")
    print(f"Loai tai lieu: {result['doc_type']}")
    print(f"Do tin cay: {result['confidence']:.2%}")
    print("Chi tiet:", json.dumps(result["all_scores"], indent=2))
```

### 4.3. Example 3: Table Extraction Pipeline

```python
"""
Trich xuat bang bieu tu tai lieu
Su dung Table Transformer (DETR) cho detection + structure recognition
"""
import torch
from transformers import (
    TableTransformerForObjectDetection,
    DetrImageProcessor,
)
from PIL import Image, ImageDraw
import numpy as np
from dataclasses import dataclass


@dataclass
class TableCell:
    row: int
    col: int
    text: str
    bbox: list  # [x1, y1, x2, y2]
    row_span: int = 1
    col_span: int = 1


@dataclass
class ExtractedTable:
    bbox: list  # [x1, y1, x2, y2] vi tri bang trong trang
    rows: int
    cols: int
    cells: list[TableCell]
    html: str = ""
    confidence: float = 0.0


class TableExtractor:
    """Trich xuat bang bieu tu anh tai lieu."""

    def __init__(self):
        # Mo hinh 1: Phat hien bang trong trang
        self.det_processor = DetrImageProcessor.from_pretrained(
            "microsoft/table-transformer-detection"
        )
        self.det_model = TableTransformerForObjectDetection.from_pretrained(
            "microsoft/table-transformer-detection"
        )

        # Mo hinh 2: Nhan dang cau truc bang
        self.str_processor = DetrImageProcessor.from_pretrained(
            "microsoft/table-transformer-structure-recognition-v1.1-all"
        )
        self.str_model = TableTransformerForObjectDetection.from_pretrained(
            "microsoft/table-transformer-structure-recognition-v1.1-all"
        )

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.det_model.to(self.device)
        self.str_model.to(self.device)

    def detect_tables(
        self, image: Image.Image, threshold: float = 0.7
    ) -> list[dict]:
        """Phat hien tat ca cac bang trong anh."""
        inputs = self.det_processor(images=image, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.det_model(**inputs)

        target_sizes = torch.tensor([image.size[::-1]]).to(self.device)
        results = self.det_processor.post_process_object_detection(
            outputs, threshold=threshold, target_sizes=target_sizes
        )[0]

        tables = []
        for score, label, box in zip(
            results["scores"], results["labels"], results["boxes"]
        ):
            tables.append({
                "bbox": box.cpu().tolist(),
                "confidence": score.item(),
                "label": self.det_model.config.id2label[label.item()],
            })

        return tables

    def recognize_structure(
        self, table_image: Image.Image, threshold: float = 0.5
    ) -> dict:
        """Nhan dang cau truc bang (hang, cot, o)."""
        inputs = self.str_processor(images=table_image, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.str_model(**inputs)

        target_sizes = torch.tensor([table_image.size[::-1]]).to(self.device)
        results = self.str_processor.post_process_object_detection(
            outputs, threshold=threshold, target_sizes=target_sizes
        )[0]

        structure = {"rows": [], "columns": [], "cells": []}

        for score, label, box in zip(
            results["scores"], results["labels"], results["boxes"]
        ):
            label_name = self.str_model.config.id2label[label.item()]
            item = {
                "bbox": box.cpu().tolist(),
                "confidence": score.item(),
            }

            if "row" in label_name and "column" not in label_name:
                structure["rows"].append(item)
            elif "column" in label_name and "row" not in label_name:
                structure["columns"].append(item)
            elif "cell" in label_name or "spanning" in label_name:
                structure["cells"].append(item)

        # Sap xep rows va columns theo vi tri
        structure["rows"].sort(key=lambda x: x["bbox"][1])
        structure["columns"].sort(key=lambda x: x["bbox"][0])

        return structure

    def extract_tables(
        self, image_path: str, ocr_engine=None
    ) -> list[ExtractedTable]:
        """Pipeline day du: detect -> structure -> OCR -> output."""
        image = Image.open(image_path).convert("RGB")

        # Buoc 1: Phat hien bang
        detected_tables = self.detect_tables(image)

        extracted = []
        for table_info in detected_tables:
            bbox = table_info["bbox"]

            # Crop bang tu anh goc
            table_image = image.crop(bbox)

            # Buoc 2: Nhan dang cau truc
            structure = self.recognize_structure(table_image)

            n_rows = len(structure["rows"])
            n_cols = len(structure["columns"])

            # Buoc 3: OCR tung cell (neu co OCR engine)
            cells = []
            if ocr_engine and structure["cells"]:
                for i, cell_info in enumerate(structure["cells"]):
                    cell_bbox = cell_info["bbox"]
                    cell_image = table_image.crop(cell_bbox)

                    # OCR cell
                    cell_path = f"/tmp/cell_{i}.png"
                    cell_image.save(cell_path)
                    ocr_result = ocr_engine.detect_and_recognize(cell_path)

                    # Xac dinh row/col cua cell
                    cell_center_y = (cell_bbox[1] + cell_bbox[3]) / 2
                    cell_center_x = (cell_bbox[0] + cell_bbox[2]) / 2

                    row_idx = self._find_index(
                        structure["rows"], cell_center_y, axis="y"
                    )
                    col_idx = self._find_index(
                        structure["columns"], cell_center_x, axis="x"
                    )

                    cells.append(TableCell(
                        row=row_idx,
                        col=col_idx,
                        text=ocr_result.full_text,
                        bbox=cell_bbox,
                    ))

            # Tao HTML output
            html = self._cells_to_html(cells, n_rows, n_cols)

            extracted.append(ExtractedTable(
                bbox=bbox,
                rows=n_rows,
                cols=n_cols,
                cells=cells,
                html=html,
                confidence=table_info["confidence"],
            ))

        return extracted

    def _find_index(self, items: list, center: float, axis: str) -> int:
        """Tim index cua row/column chua diem center."""
        for i, item in enumerate(items):
            bbox = item["bbox"]
            if axis == "y":
                if bbox[1] <= center <= bbox[3]:
                    return i
            else:
                if bbox[0] <= center <= bbox[2]:
                    return i
        return 0

    def _cells_to_html(
        self, cells: list[TableCell], n_rows: int, n_cols: int
    ) -> str:
        """Chuyen cells thanh bang HTML."""
        if not cells:
            return "<table></table>"

        # Tao grid
        grid = [["" for _ in range(n_cols)] for _ in range(n_rows)]
        for cell in cells:
            if 0 <= cell.row < n_rows and 0 <= cell.col < n_cols:
                grid[cell.row][cell.col] = cell.text

        # Tao HTML
        html_parts = ["<table border='1'>"]
        for row in grid:
            html_parts.append("  <tr>")
            for cell_text in row:
                html_parts.append(f"    <td>{cell_text}</td>")
            html_parts.append("  </tr>")
        html_parts.append("</table>")

        return "\n".join(html_parts)


# Su dung
if __name__ == "__main__":
    from document_ocr import DocumentOCR  # Tu Example 1

    ocr = DocumentOCR(use_gpu=True, lang="vi")
    extractor = TableExtractor()

    tables = extractor.extract_tables(
        "bao_cao_tai_chinh.jpg", ocr_engine=ocr
    )

    for i, table in enumerate(tables):
        print(f"\n=== Bang {i+1} ===")
        print(f"Vi tri: {table.bbox}")
        print(f"Kich thuoc: {table.rows} hang x {table.cols} cot")
        print(f"HTML:\n{table.html}")
```

### 4.4. Example 4: Invoice Extraction voi Claude Vision API

```python
"""
Trich xuat thong tin hoa don bang Claude Vision API
Zero-shot — khong can huan luyen
"""
import anthropic
import base64
import json
from pathlib import Path
from pydantic import BaseModel


class InvoiceLineItem(BaseModel):
    stt: int
    ten_hang: str
    don_vi: str
    so_luong: float
    don_gia: float
    thanh_tien: float


class InvoiceData(BaseModel):
    so_hoa_don: str
    ky_hieu: str
    ngay_lap: str
    ten_nguoi_ban: str
    mst_nguoi_ban: str
    dia_chi_nguoi_ban: str
    ten_nguoi_mua: str
    mst_nguoi_mua: str
    dia_chi_nguoi_mua: str
    hinh_thuc_thanh_toan: str
    hang_hoa: list[InvoiceLineItem]
    cong_tien_hang: float
    thue_suat_gtgt: float
    tien_thue_gtgt: float
    tong_tien_thanh_toan: float
    so_tien_bang_chu: str


class InvoiceExtractor:
    """Trich xuat hoa don bang Claude Vision API."""

    def __init__(self, api_key: str = None):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-20250514"

    def _encode_image(self, image_path: str) -> tuple[str, str]:
        """Encode anh thanh base64."""
        path = Path(image_path)
        suffix = path.suffix.lower()

        media_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
        }
        media_type = media_types.get(suffix, "image/png")

        with open(path, "rb") as f:
            data = base64.standard_b64encode(f.read()).decode("utf-8")

        return data, media_type

    def extract(self, image_path: str) -> InvoiceData:
        """Trich xuat thong tin hoa don tu anh."""
        image_data, media_type = self._encode_image(image_path)

        prompt = """Hay trich xuat CHINH XAC tat ca thong tin tu hoa don nay thanh JSON.

Yeu cau:
1. Trich xuat chinh xac tung truong, giu nguyen dau tieng Viet
2. Cac truong so (so_luong, don_gia, thanh_tien) phai la so, khong co dau cham ngan cach hang nghin
3. Neu truong nao khong co, de chuoi rong ""
4. Kiem tra: cong_tien_hang = SUM(thanh_tien cua cac dong hang hoa)

Tra ve JSON voi cau truc:
{
    "so_hoa_don": "...",
    "ky_hieu": "...",
    "ngay_lap": "DD/MM/YYYY",
    "ten_nguoi_ban": "...",
    "mst_nguoi_ban": "...",
    "dia_chi_nguoi_ban": "...",
    "ten_nguoi_mua": "...",
    "mst_nguoi_mua": "...",
    "dia_chi_nguoi_mua": "...",
    "hinh_thuc_thanh_toan": "...",
    "hang_hoa": [
        {"stt": 1, "ten_hang": "...", "don_vi": "...", "so_luong": 0, "don_gia": 0, "thanh_tien": 0}
    ],
    "cong_tien_hang": 0,
    "thue_suat_gtgt": 0,
    "tien_thue_gtgt": 0,
    "tong_tien_thanh_toan": 0,
    "so_tien_bang_chu": "..."
}

CHI TRA VE JSON, KHONG THEM BAT KY TEXT NAO KHAC."""

        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data,
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            }],
        )

        response_text = message.content[0].text.strip()

        # Parse JSON tu response
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        data = json.loads(response_text)
        return InvoiceData(**data)

    def validate(self, invoice: InvoiceData) -> list[str]:
        """Kiem tra tinh hop le cua du lieu trich xuat."""
        errors = []

        # Kiem tra tong tien hang
        expected_sum = sum(item.thanh_tien for item in invoice.hang_hoa)
        if abs(expected_sum - invoice.cong_tien_hang) > 1:
            errors.append(
                f"Cong tien hang sai: expected={expected_sum}, "
                f"actual={invoice.cong_tien_hang}"
            )

        # Kiem tra thue GTGT
        expected_tax = invoice.cong_tien_hang * invoice.thue_suat_gtgt / 100
        if abs(expected_tax - invoice.tien_thue_gtgt) > 1:
            errors.append(
                f"Tien thue GTGT sai: expected={expected_tax}, "
                f"actual={invoice.tien_thue_gtgt}"
            )

        # Kiem tra tong thanh toan
        expected_total = invoice.cong_tien_hang + invoice.tien_thue_gtgt
        if abs(expected_total - invoice.tong_tien_thanh_toan) > 1:
            errors.append(
                f"Tong thanh toan sai: expected={expected_total}, "
                f"actual={invoice.tong_tien_thanh_toan}"
            )

        # Kiem tra MST format (10 hoac 13 so)
        for field_name, mst in [
            ("MST nguoi ban", invoice.mst_nguoi_ban),
            ("MST nguoi mua", invoice.mst_nguoi_mua),
        ]:
            if mst and not (len(mst.replace("-", "")) in [10, 13]):
                errors.append(f"{field_name} khong hop le: {mst}")

        return errors


# Su dung
if __name__ == "__main__":
    extractor = InvoiceExtractor()

    invoice = extractor.extract("hoa_don_gtgt.jpg")
    print(f"So hoa don: {invoice.so_hoa_don}")
    print(f"Nguoi ban: {invoice.ten_nguoi_ban}")
    print(f"Tong thanh toan: {invoice.tong_tien_thanh_toan:,.0f} VND")

    errors = extractor.validate(invoice)
    if errors:
        print("\nLoi phat hien:")
        for err in errors:
            print(f"  - {err}")
    else:
        print("\nDu lieu hop le!")
```

### 4.5. Example 5: Hybrid Pipeline (Production Pattern)

```python
"""
Hybrid Document Processing Pipeline
Ket hop mo hinh local (nhanh, re) voi VLM (chinh xac, dat)
"""
import asyncio
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional


class ProcessingRoute(Enum):
    LOCAL_ONLY = "local"           # Chi dung mo hinh local
    VLM_ONLY = "vlm"              # Chi dung Vision LLM
    LOCAL_THEN_VLM = "hybrid"     # Local truoc, VLM neu khong chac chan


@dataclass
class ProcessingConfig:
    confidence_threshold: float = 0.90   # Nguong chap nhan ket qua local
    vlm_fallback: bool = True            # Co dung VLM lam fallback khong
    max_vlm_cost_per_doc: float = 0.10   # Chi phi toi da VLM cho 1 tai lieu (USD)
    batch_size: int = 10                 # So tai lieu xu ly song song


@dataclass
class ProcessingResult:
    document_id: str
    doc_type: str
    extracted_data: dict
    confidence: float
    route_used: ProcessingRoute
    processing_time_ms: float
    cost_usd: float = 0.0
    warnings: list[str] = field(default_factory=list)


class HybridPipeline:
    """Pipeline xu ly tai lieu ket hop local + VLM."""

    def __init__(
        self,
        ocr_engine,        # DocumentOCR tu Example 1
        classifier,         # DocumentClassifier tu Example 2
        table_extractor,    # TableExtractor tu Example 3
        vlm_extractor,      # InvoiceExtractor tu Example 4
        config: ProcessingConfig = None,
    ):
        self.ocr = ocr_engine
        self.classifier = classifier
        self.table_ext = table_extractor
        self.vlm = vlm_extractor
        self.config = config or ProcessingConfig()

    async def process_document(
        self,
        document_id: str,
        image_path: str,
        route: ProcessingRoute = ProcessingRoute.LOCAL_THEN_VLM,
    ) -> ProcessingResult:
        """Xu ly 1 tai lieu."""
        import time
        start = time.time()

        # Buoc 1: Phan loai tai lieu
        classification = self.classifier.predict(image_path)
        doc_type = classification["doc_type"]

        # Buoc 2: Chon chien luoc xu ly
        if route == ProcessingRoute.VLM_ONLY:
            result = await self._process_with_vlm(
                document_id, image_path, doc_type
            )
        elif route == ProcessingRoute.LOCAL_ONLY:
            result = await self._process_with_local(
                document_id, image_path, doc_type
            )
        else:  # HYBRID
            # Thu local truoc
            local_result = await self._process_with_local(
                document_id, image_path, doc_type
            )

            if local_result.confidence >= self.config.confidence_threshold:
                result = local_result
            elif self.config.vlm_fallback:
                # Fallback sang VLM
                result = await self._process_with_vlm(
                    document_id, image_path, doc_type
                )
                result.warnings.append(
                    f"Local confidence thap ({local_result.confidence:.2f}), "
                    f"da dung VLM fallback"
                )
            else:
                result = local_result
                result.warnings.append(
                    f"Confidence thap ({local_result.confidence:.2f}), "
                    f"can review thu cong"
                )

        result.processing_time_ms = (time.time() - start) * 1000
        return result

    async def _process_with_local(
        self, doc_id: str, image_path: str, doc_type: str
    ) -> ProcessingResult:
        """Xu ly bang pipeline local (PaddleOCR + LayoutLMv3)."""
        # OCR
        ocr_result = self.ocr.detect_and_recognize(image_path)

        # Table extraction neu co
        tables = self.table_ext.extract_tables(image_path, self.ocr)

        extracted = {
            "full_text": ocr_result.full_text,
            "words": [
                {"text": w.text, "bbox": w.bbox, "conf": w.confidence}
                for w in ocr_result.words
            ],
            "tables": [
                {"html": t.html, "rows": t.rows, "cols": t.cols}
                for t in tables
            ],
        }

        return ProcessingResult(
            document_id=doc_id,
            doc_type=doc_type,
            extracted_data=extracted,
            confidence=ocr_result.avg_confidence,
            route_used=ProcessingRoute.LOCAL_ONLY,
            processing_time_ms=0,
            cost_usd=0.0,
        )

    async def _process_with_vlm(
        self, doc_id: str, image_path: str, doc_type: str
    ) -> ProcessingResult:
        """Xu ly bang Vision LLM (Claude Vision)."""
        # Uoc tinh chi phi
        estimated_cost = 0.02  # ~$0.02/trang cho Claude Sonnet

        if estimated_cost > self.config.max_vlm_cost_per_doc:
            return ProcessingResult(
                document_id=doc_id,
                doc_type=doc_type,
                extracted_data={},
                confidence=0.0,
                route_used=ProcessingRoute.VLM_ONLY,
                processing_time_ms=0,
                cost_usd=0.0,
                warnings=["Vuot qua gioi han chi phi VLM"],
            )

        # Goi VLM API
        invoice_data = self.vlm.extract(image_path)

        return ProcessingResult(
            document_id=doc_id,
            doc_type=doc_type,
            extracted_data=invoice_data.model_dump(),
            confidence=0.95,  # VLM thuong co confidence cao
            route_used=ProcessingRoute.VLM_ONLY,
            processing_time_ms=0,
            cost_usd=estimated_cost,
        )

    async def process_batch(
        self, documents: list[dict]
    ) -> list[ProcessingResult]:
        """Xu ly nhieu tai lieu song song."""
        tasks = [
            self.process_document(
                doc["id"],
                doc["image_path"],
                doc.get("route", ProcessingRoute.LOCAL_THEN_VLM),
            )
            for doc in documents
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Xu ly loi
        final_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                final_results.append(ProcessingResult(
                    document_id=documents[i]["id"],
                    doc_type="error",
                    extracted_data={},
                    confidence=0.0,
                    route_used=ProcessingRoute.LOCAL_ONLY,
                    processing_time_ms=0,
                    warnings=[f"Loi xu ly: {str(result)}"],
                ))
            else:
                final_results.append(result)

        return final_results


# Su dung
async def main():
    from document_ocr import DocumentOCR
    from document_classifier import DocumentClassifier
    from table_extractor import TableExtractor
    from invoice_extractor import InvoiceExtractor

    pipeline = HybridPipeline(
        ocr_engine=DocumentOCR(use_gpu=True, lang="vi"),
        classifier=DocumentClassifier(),
        table_extractor=TableExtractor(),
        vlm_extractor=InvoiceExtractor(),
        config=ProcessingConfig(
            confidence_threshold=0.90,
            vlm_fallback=True,
        ),
    )

    documents = [
        {"id": "doc_001", "image_path": "hoa_don_1.jpg"},
        {"id": "doc_002", "image_path": "hop_dong_1.jpg"},
        {"id": "doc_003", "image_path": "cccd_scan.jpg"},
    ]

    results = await pipeline.process_batch(documents)

    for r in results:
        print(f"\n{r.document_id}: {r.doc_type}")
        print(f"  Route: {r.route_used.value}")
        print(f"  Confidence: {r.confidence:.2%}")
        print(f"  Time: {r.processing_time_ms:.0f}ms")
        print(f"  Cost: ${r.cost_usd:.4f}")
        if r.warnings:
            print(f"  Warnings: {r.warnings}")


if __name__ == "__main__":
    asyncio.run(main())
```

---

## 5. Cong cu & Thu vien de xuat (Decision Matrix)

### 5.1. OCR Engines — So sanh chi tiet

#### PaddleOCR vs Tesseract vs EasyOCR vs DocTR

| Tieu chi | PaddleOCR v4 | Tesseract 5 | EasyOCR | DocTR |
|----------|-------------|-------------|---------|-------|
| **Framework** | PaddlePaddle | C++ / Python wrapper | PyTorch | PyTorch / TF |
| **Text Detection** | DBNet++ | Connected components | CRAFT | DBNet / LinkNet |
| **Text Recognition** | SVTR_LCNet | LSTM | CRNN | CRNN / ViTSTR / PARSeq |
| **Ngon ngu** | 80+ (co VN) | 100+ (co VN) | 80+ (co VN) | ~15 (VN han che) |
| **Layout Analysis** | Co (PP-Structure) | Khong | Khong | Khong |
| **Table Extraction** | Co (SLANet) | Khong | Khong | Khong |
| **Kich thuoc mo hinh** | Server: 20MB, Mobile: 4.4MB | ~40MB | ~100MB | ~50MB |
| **Toc do (GPU)** | ~50ms/trang | ~200ms/trang | ~300ms/trang | ~100ms/trang |
| **Toc do (CPU)** | ~200ms/trang | ~500ms/trang | ~1000ms/trang | ~400ms/trang |
| **Do chinh xac (VN)** | 85-92% | 70-82% | 80-88% | 75-85% |
| **License** | Apache 2.0 | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| **De cai dat** | Trung binh (PaddlePaddle dep) | De (apt-get) | De (pip) | De (pip) |
| **API design** | Tot | Co ban | Tot | Rat tot |
| **GPU support** | CUDA, TensorRT | Khong | CUDA | CUDA |

**Khuyen nghi:**
- **Production (Server)**: PaddleOCR — toan dien nhat, nhanh nhat
- **Production (Mobile/Edge)**: PaddleOCR Lite (PP-OCRv4 mobile)
- **Prototype nhanh**: EasyOCR (cai dat don gian nhat) hoac Tesseract
- **Tieng Viet chuyen sau**: vietocr (Transformer-based, huan luyen rieng cho VN)

#### vietocr — Chi tiet

vietocr la thu vien OCR chuyen cho tieng Viet, duoc phat trien boi cong dong Viet Nam:

| Thuoc tinh | Chi tiet |
|------------|---------|
| **Kien truc** | VGG/ResNet encoder + Transformer decoder |
| **Pre-trained** | Tren ~10M anh chu tieng Viet |
| **Do chinh xac** | 90-95% tren tieng Viet (cao hon PaddleOCR cho text recognition) |
| **Han che** | Chi lam text recognition (can text detector rieng) |
| **Cai dat** | `pip install vietocr` |
| **GitHub** | github.com/pbcquoc/vietocr |

### 5.2. Document Understanding Models — So sanh chi tiet

#### LayoutLMv3 vs Donut vs GPT-4V vs DocOwl

| Tieu chi | LayoutLMv3 | Donut | GPT-4V / Claude | DocOwl 1.5 |
|----------|-----------|-------|-----------------|------------|
| **Kien truc** | Transformer + 2D pos | Swin + BART | Proprietary VLM | LLaVA-based |
| **Can OCR?** | Co (can OCR truoc) | Khong (OCR-free) | Khong | Khong |
| **Params** | 125M-368M | 200M | >>100B | 7B-13B |
| **Fine-tune** | De (HF Trainer) | De (HF Trainer) | Khong the | De (LoRA) |
| **FUNSD F1** | 92.08 | 71.8 | ~85 (zero-shot) | ~82 |
| **CORD F1** | 96.56 | 84.11 | ~90 (zero-shot) | ~88 |
| **DocVQA ANLS** | 83.37 | 67.5 | ~92 (zero-shot) | 82.2 |
| **Inference time** | ~50ms (GPU) | ~100ms (GPU) | ~3000ms (API) | ~500ms (GPU) |
| **Chi phi / 1000 trang** | ~$0 (self-hosted) | ~$0 (self-hosted) | ~$20-50 | ~$0 (self-hosted) |
| **On-premise** | Co | Co | Khong (thuong) | Co |
| **Zero-shot** | Khong | Khong | Co | Han che |
| **Tieng Viet** | LayoutXLM (da ngon ngu) | SynthDoG (co VN) | Tot | Trung binh |
| **GPU can thiet** | 1x T4 (16GB) | 1x T4 (16GB) | Cloud API | 1x A100 (40GB) |

**Khuyen nghi:**
- **On-premise + do chinh xac cao**: LayoutLMv3 / LayoutXLM fine-tuned
- **On-premise + don gian**: Donut fine-tuned (khong can OCR pipeline)
- **Cloud + linh hoat**: Claude Vision / GPT-4o
- **Can bang**: DocOwl 1.5 voi LoRA fine-tuning

### 5.3. Infrastructure Tools

| Cong cu | Muc dich | De xuat |
|---------|----------|---------|
| **PyMuPDF (fitz)** | Doc PDF, chuyen trang sang anh | Bat buoc |
| **pdfplumber** | Trich xuat text + table tu digital PDF | Rat nen dung |
| **Pillow (PIL)** | Xu ly anh co ban | Bat buoc |
| **OpenCV (cv2)** | Tien xu ly anh nang cao | Bat buoc |
| **Unstructured.io** | Parser da dinh dang (PDF, DOC, HTML, ...) | Nen dung cho ingest |
| **FastAPI** | API server cho pipeline | De xuat |
| **Celery / RQ** | Task queue cho xu ly bat dong bo | De xuat cho batch |
| **MinIO** | Object storage (tuong thich S3) cho anh va PDF | De xuat |
| **PostgreSQL** | Luu tru ket qua, metadata | De xuat |
| **Elasticsearch** | Full-text search tren tai lieu da OCR | Tuy chon |
| **Redis** | Cache, rate limiting | De xuat |
| **MLflow** | Tracking experiment, model versioning | De xuat |
| **DVC** | Data versioning cho dataset huan luyen | Tuy chon |
| **Weights & Biases** | Experiment tracking (alternative cho MLflow) | Tuy chon |

### 5.4. Deployment Stack

| Tang | Cong nghe de xuat | Ghi chu |
|------|-------------------|---------|
| **Container** | Docker + Docker Compose | Bat buoc |
| **Orchestration** | Kubernetes (K8s) hoac Docker Swarm | Production |
| **GPU Inference** | NVIDIA Triton Inference Server | Nhieu mo hinh, high throughput |
| **Model Serving** | TorchServe hoac Triton | 1-2 mo hinh |
| **API Gateway** | Kong / Traefik | Rate limiting, auth |
| **Monitoring** | Prometheus + Grafana | Metrics |
| **Logging** | ELK Stack (Elasticsearch, Logstash, Kibana) | Logs |
| **CI/CD** | GitHub Actions + ArgoCD | Auto deploy |
| **Cloud (neu can)** | AWS (SageMaker, S3) hoac GCP (Vertex AI) | Scale |

---

## 6. Mau thiet ke Production (Production Patterns)

### 6.1. Pattern 1: Microservice Architecture

```
┌────────────┐     ┌──────────────┐     ┌────────────────┐
│ API Gateway │────▶│ Doc Ingestion │────▶│ Message Queue  │
│ (FastAPI)   │     │ Service       │     │ (Redis/RabbitMQ)│
└────────────┘     └──────────────┘     └───────┬────────┘
                                                 │
                   ┌─────────────────────────────┼──────────┐
                   │                             │          │
              ┌────▼────┐  ┌─────────────┐  ┌───▼──────┐  │
              │ OCR      │  │ Layout       │  │ IE       │  │
              │ Service  │  │ Analysis Svc │  │ Service  │  │
              │ (Paddle) │  │ (DiT/LayoutLM│  │ (LayoutLM│  │
              └────┬────┘  └──────┬──────┘  └───┬──────┘  │
                   │              │              │          │
                   └──────────────┼──────────────┘          │
                                  │                         │
                          ┌───────▼──────┐   ┌─────────────▼──┐
                          │ Validation   │   │ VLM Fallback   │
                          │ Service      │   │ Service (Claude)│
                          └───────┬──────┘   └────────────────┘
                                  │
                          ┌───────▼──────┐
                          │ Storage      │
                          │ (PG + MinIO) │
                          └──────────────┘
```

**Uu diem:**
- Scale tung service doc lap (OCR co the can nhieu GPU hon IE)
- Thay the/nang cap tung thanh phan khong anh huong toan bo
- Monitoring chi tiet tung service

**Nhuoc diem:**
- Phuc tap hon monolith
- Can quan ly network giua cac service
- Latency tang do inter-service communication

### 6.2. Pattern 2: Event-Driven Processing

```python
# Event-driven document processing voi Celery

from celery import Celery, chain

app = Celery("docai", broker="redis://localhost:6379/0")

@app.task(bind=True, max_retries=3)
def task_ingest(self, file_path: str, doc_id: str):
    """Buoc 1: Tiep nhan va chuyen doi tai lieu."""
    # Convert PDF -> images, extract metadata
    pages = convert_to_images(file_path)
    return {"doc_id": doc_id, "pages": pages, "page_count": len(pages)}

@app.task(bind=True, max_retries=3)
def task_preprocess(self, ingest_result: dict):
    """Buoc 2: Tien xu ly anh."""
    processed_pages = []
    for page in ingest_result["pages"]:
        processed = preprocess_image(page)
        processed_pages.append(processed)
    return {**ingest_result, "pages": processed_pages}

@app.task(bind=True, max_retries=3)
def task_ocr(self, preprocess_result: dict):
    """Buoc 3: OCR."""
    ocr_results = []
    for page in preprocess_result["pages"]:
        result = paddle_ocr(page)
        ocr_results.append(result)
    return {**preprocess_result, "ocr": ocr_results}

@app.task(bind=True, max_retries=3)
def task_extract(self, ocr_result: dict):
    """Buoc 4: Trich xuat thong tin."""
    extracted = run_extraction(ocr_result)
    return {**ocr_result, "extracted": extracted}

@app.task
def task_validate_and_store(extract_result: dict):
    """Buoc 5: Kiem tra va luu tru."""
    validated = validate(extract_result["extracted"])
    store_to_database(extract_result["doc_id"], validated)
    return {"doc_id": extract_result["doc_id"], "status": "completed"}


# Chay pipeline
def process_document(file_path: str, doc_id: str):
    """Khoi chay pipeline xu ly tai lieu."""
    pipeline = chain(
        task_ingest.s(file_path, doc_id),
        task_preprocess.s(),
        task_ocr.s(),
        task_extract.s(),
        task_validate_and_store.s(),
    )
    result = pipeline.apply_async()
    return result.id
```

### 6.3. Pattern 3: Batch Processing voi Rate Limiting

```python
"""
Batch processing voi rate limiting cho VLM API calls.
Tranh vuot qua API quota va kiem soat chi phi.
"""
import asyncio
from asyncio import Semaphore
import time


class RateLimitedBatchProcessor:
    """Xu ly batch tai lieu voi rate limiting."""

    def __init__(
        self,
        max_concurrent: int = 5,       # So tai lieu xu ly song song
        vlm_requests_per_minute: int = 50,  # API rate limit
        max_daily_cost_usd: float = 100.0,  # Gioi han chi phi/ngay
    ):
        self.semaphore = Semaphore(max_concurrent)
        self.vlm_semaphore = Semaphore(vlm_requests_per_minute)
        self.daily_cost = 0.0
        self.max_daily_cost = max_daily_cost_usd
        self.vlm_interval = 60.0 / vlm_requests_per_minute
        self.last_vlm_call = 0

    async def process_with_rate_limit(self, document: dict, pipeline):
        """Xu ly 1 tai lieu voi rate limiting."""
        async with self.semaphore:
            result = await pipeline.process_document(
                document["id"],
                document["image_path"],
            )

            # Cap nhat chi phi
            self.daily_cost += result.cost_usd

            # Kiem tra gioi han chi phi
            if self.daily_cost >= self.max_daily_cost:
                raise Exception(
                    f"Vuot gioi han chi phi ngay: "
                    f"${self.daily_cost:.2f} >= ${self.max_daily_cost:.2f}"
                )

            return result

    async def process_batch(
        self, documents: list[dict], pipeline
    ) -> list:
        """Xu ly batch voi rate limiting."""
        tasks = [
            self.process_with_rate_limit(doc, pipeline)
            for doc in documents
        ]
        return await asyncio.gather(*tasks, return_exceptions=True)
```

### 6.4. Pattern 4: Model A/B Testing

```python
"""
A/B testing giua cac mo hinh Document AI.
So sanh hieu suat thuc te de chon mo hinh tot nhat.
"""
import random
import time
from dataclasses import dataclass


@dataclass
class ABTestResult:
    model_name: str
    accuracy: float          # So voi ground truth
    latency_ms: float
    cost_per_doc: float
    sample_size: int


class ModelABTester:
    """A/B testing cho Document AI models."""

    def __init__(self, models: dict, traffic_split: dict = None):
        """
        models: {"model_a": pipeline_a, "model_b": pipeline_b}
        traffic_split: {"model_a": 0.5, "model_b": 0.5}
        """
        self.models = models
        self.traffic_split = traffic_split or {
            name: 1.0 / len(models) for name in models
        }
        self.results = {name: [] for name in models}

    def select_model(self) -> str:
        """Chon mo hinh dua tren traffic split."""
        rand = random.random()
        cumulative = 0.0
        for name, weight in self.traffic_split.items():
            cumulative += weight
            if rand <= cumulative:
                return name
        return list(self.models.keys())[-1]

    async def process_and_compare(
        self, document: dict, ground_truth: dict = None
    ):
        """Xu ly tai lieu va ghi nhan ket qua."""
        model_name = self.select_model()
        pipeline = self.models[model_name]

        start = time.time()
        result = await pipeline.process_document(
            document["id"], document["image_path"]
        )
        latency = (time.time() - start) * 1000

        # Tinh accuracy neu co ground truth
        accuracy = 0.0
        if ground_truth:
            accuracy = self._compute_accuracy(
                result.extracted_data, ground_truth
            )

        self.results[model_name].append({
            "accuracy": accuracy,
            "latency_ms": latency,
            "cost": result.cost_usd,
        })

        return result

    def _compute_accuracy(self, predicted: dict, ground_truth: dict) -> float:
        """Tinh do chinh xac (field-level exact match)."""
        if not ground_truth:
            return 0.0

        total_fields = len(ground_truth)
        correct = 0
        for key, expected_value in ground_truth.items():
            if key in predicted:
                if str(predicted[key]).strip() == str(expected_value).strip():
                    correct += 1

        return correct / total_fields if total_fields > 0 else 0.0

    def get_report(self) -> dict:
        """Tao bao cao so sanh."""
        report = {}
        for name, results in self.results.items():
            if not results:
                continue
            report[name] = ABTestResult(
                model_name=name,
                accuracy=sum(r["accuracy"] for r in results) / len(results),
                latency_ms=sum(r["latency_ms"] for r in results) / len(results),
                cost_per_doc=sum(r["cost"] for r in results) / len(results),
                sample_size=len(results),
            )
        return report
```

### 6.5. Pattern 5: Caching va Deduplication

```python
"""
Caching ket qua OCR/extraction va phat hien tai lieu trung lap.
"""
import hashlib
import redis
import json


class DocumentCache:
    """Cache ket qua xu ly tai lieu."""

    def __init__(self, redis_url: str = "redis://localhost:6379/1"):
        self.redis = redis.from_url(redis_url)
        self.ttl = 86400 * 7  # Cache 7 ngay

    def _compute_hash(self, image_path: str) -> str:
        """Tinh hash cua file anh de lam cache key."""
        with open(image_path, "rb") as f:
            return hashlib.md5(f.read()).hexdigest()

    def get_cached_result(self, image_path: str) -> dict | None:
        """Lay ket qua da cache."""
        file_hash = self._compute_hash(image_path)
        cached = self.redis.get(f"docai:result:{file_hash}")
        if cached:
            return json.loads(cached)
        return None

    def cache_result(self, image_path: str, result: dict):
        """Luu ket qua vao cache."""
        file_hash = self._compute_hash(image_path)
        self.redis.setex(
            f"docai:result:{file_hash}",
            self.ttl,
            json.dumps(result, ensure_ascii=False),
        )

    def is_duplicate(self, image_path: str) -> tuple[bool, str | None]:
        """Kiem tra tai lieu trung lap."""
        file_hash = self._compute_hash(image_path)
        existing_id = self.redis.get(f"docai:hash:{file_hash}")
        if existing_id:
            return True, existing_id.decode()
        return False, None

    def register_document(self, image_path: str, doc_id: str):
        """Dang ky hash cua tai lieu moi."""
        file_hash = self._compute_hash(image_path)
        self.redis.setex(
            f"docai:hash:{file_hash}",
            self.ttl,
            doc_id,
        )
```

---

## 7. Uoc luong noi luc (Effort Estimate)

### 7.1. MVP — Minimum Viable Product

**Muc tieu:** Xu ly 1-3 loai tai lieu cu the (vd: hoa don + CCCD), accuracy >85%, xu ly <500 tai lieu/ngay.

| Hang muc | Cong viec | Thoi gian | Nhan su |
|----------|-----------|-----------|---------|
| Nghien cuu & Setup | Chon tech stack, setup env, thu nghiem OCR | 1 tuan | 1 ML Engineer |
| OCR Pipeline | Tich hop PaddleOCR, pre-processing, basic extraction | 2 tuan | 1 ML Engineer |
| VLM Integration | Tich hop Claude Vision API cho extraction | 1 tuan | 1 Backend Dev |
| API & UI | FastAPI backend, basic upload UI | 2 tuan | 1 Fullstack Dev |
| Testing & Tuning | Thu nghiem tren du lieu thuc, tinh chinh | 1 tuan | 1 ML + 1 QA |
| **TONG** | | **6-8 tuan** | **2-3 nguoi** |

**Chi phi uoc tinh:**
- Nhan su: 2-3 nguoi x 2 thang x $2,000-3,000/nguoi = $8,000-18,000
- Infrastructure: GPU server (1x T4): ~$300/thang; Cloud API: ~$100-300/thang
- **Tong MVP: $10,000 - $25,000**

**Stack MVP:**
- PaddleOCR (OCR engine)
- Claude Vision API (fallback / zero-shot)
- FastAPI (backend)
- PostgreSQL (database)
- React / Next.js (frontend)
- Docker (deployment)

### 7.2. Production v1

**Muc tieu:** Xu ly 5-10 loai tai lieu, accuracy >92%, xu ly 5,000+ tai lieu/ngay, co HITL review.

| Hang muc | Cong viec | Thoi gian | Nhan su |
|----------|-----------|-----------|---------|
| Data Collection | Thu thap va gan nhan 5,000+ anh tai lieu VN | 4 tuan | 2 Data Annotators |
| Model Fine-tuning | Fine-tune LayoutLMv3/LayoutXLM tren du lieu VN | 3 tuan | 1 ML Engineer |
| OCR Optimization | Toi uu PaddleOCR + vietocr cho tieng Viet | 2 tuan | 1 ML Engineer |
| Table Extraction | Tich hop Table Transformer, fine-tune | 2 tuan | 1 ML Engineer |
| Hybrid Pipeline | Xay dung pipeline hybrid (local + VLM) | 2 tuan | 1 ML + 1 Backend |
| Validation Layer | Business rules, cross-field checks, HITL UI | 3 tuan | 1 Fullstack Dev |
| API & Integration | REST API, webhook, batch processing | 2 tuan | 1 Backend Dev |
| Monitoring & Ops | Logging, metrics, alerting, model versioning | 2 tuan | 1 DevOps |
| Testing | Unit tests, integration tests, load tests | 2 tuan | 1 QA Engineer |
| **TONG** | | **4-5 thang** | **5-7 nguoi** |

**Chi phi uoc tinh:**
- Nhan su: 5-7 nguoi x 4-5 thang x $2,000-4,000/nguoi = $40,000-140,000
- GPU: 2-4x T4 hoac 1x A100 = $500-2,000/thang
- Data annotation: ~$0.5-1/anh x 5,000 anh = $2,500-5,000
- Cloud API budget: $500-1,000/thang
- **Tong Production v1: $60,000 - $180,000**

**Stack Production v1:**
- PaddleOCR + vietocr (OCR)
- LayoutLMv3 fine-tuned (IE)
- Table Transformer (table extraction)
- Claude Vision API (VLM fallback)
- FastAPI + Celery (backend + async processing)
- PostgreSQL + Redis + MinIO (storage)
- React / Next.js (frontend + HITL review UI)
- Docker + Kubernetes (deployment)
- Prometheus + Grafana (monitoring)

### 7.3. Full Platform

**Muc tieu:** Xu ly 20+ loai tai lieu, accuracy >95%, 50,000+ tai lieu/ngay, multi-tenant, self-learning.

| Hang muc | Cong viec | Thoi gian | Nhan su |
|----------|-----------|-----------|---------|
| Data Platform | Pipeline thu thap, gan nhan, versioning du lieu | 6 tuan | 2 Data Engineers |
| Model Training Infra | MLOps pipeline, A/B testing, auto-retrain | 6 tuan | 2 ML Engineers |
| Custom Models | Huan luyen mo hinh OCR/IE rieng cho tieng Viet | 8 tuan | 2 ML Engineers |
| HWR Module | Nhan dang chu viet tay tieng Viet | 8 tuan | 1 ML Researcher |
| Multi-tenant Platform | Tenant isolation, custom templates, billing | 6 tuan | 2 Backend Devs |
| Admin Dashboard | Analytics, model management, user management | 4 tuan | 2 Fullstack Devs |
| SDK & Documentation | Client SDKs (Python, JS), API docs | 3 tuan | 1 Dev |
| Security & Compliance | Encryption, audit logs, GDPR/PDPA compliance | 4 tuan | 1 Security Engineer |
| Performance Optimization | GPU optimization, caching, CDN | 3 tuan | 1 DevOps |
| **TONG** | | **9-12 thang** | **10-15 nguoi** |

**Chi phi uoc tinh:**
- Nhan su: 10-15 nguoi x 9-12 thang x $2,000-5,000/nguoi = $180,000-900,000
- GPU cluster: 4-8x A100 = $3,000-10,000/thang
- Data annotation: 50,000+ anh = $25,000-50,000
- Infrastructure: $2,000-5,000/thang
- **Tong Full Platform: $250,000 - $1,000,000+**

### 7.4. Timeline tong hop

```
Thang:    1    2    3    4    5    6    7    8    9   10   11   12
          ├────├────├────├────├────├────├────├────├────├────├────├────┤
MVP:      [====▓====]
                     Production v1:
                     [=========▓==========▓===========]
                                                        Full Platform:
                                    [=========================▓==========▓=====]

▓ = milestone / release
```

### 7.5. ROI Analysis (Phan tich Hieu qua Dau tu)

| Chi so | Thu cong | MVP | Production v1 | Full Platform |
|--------|---------|-----|---------------|---------------|
| Thoi gian xu ly / tai lieu | 5-15 phut | 10-30 giay | 3-10 giay | 1-5 giay |
| Chi phi / tai lieu | $0.50-2.00 | $0.05-0.15 | $0.01-0.05 | $0.005-0.02 |
| Do chinh xac | 95-99% | 85-90% | 92-96% | 95-98% |
| Throughput / ngay | 50-200 | 500-2,000 | 5,000-20,000 | 50,000+ |
| Breakeven (so tai lieu) | - | ~5,000 | ~50,000 | ~500,000 |

**Nhan xet:** Voi 10,000 tai lieu/thang, Production v1 se tiet kiem ~$3,000-15,000/thang so voi xu ly thu cong, hoan von (breakeven) trong 4-12 thang.

---

## 8. Han che & Rui ro ky thuat

### 8.1. Han che cua cac mo hinh hien tai

| Han che | Chi tiet | Muc do nghiem trong |
|---------|---------|---------------------|
| **Dau thanh dieu tieng Viet** | OCR thuong nham sac/nga, hoi/nang, a/a-breve | Cao |
| **Chu viet tay tieng Viet** | Chua co mo hinh production-ready cho HWR tieng Viet | Rat cao |
| **Tai lieu cu / chat luong thap** | Anh mo, o vang, nhau nat -> accuracy giam manh | Cao |
| **Bang khong co duong ke** | Borderless tables van la bai toan kho | Trung binh |
| **Tai lieu nhieu trang** | Hau het mo hinh chi xu ly 1 trang | Trung binh |
| **Dau moc (stamp/seal)** | Dau moc che phu van ban, gay nhieu cho OCR | Trung binh |
| **Mixed language** | Tai lieu chua ca tieng Viet va tieng Anh/Phap | Trung binh |
| **Phong chu da dang** | Font chu doc la, font thu phap -> OCR sai | Thap-Trung binh |

### 8.2. Rui ro ky thuat va bien phap giam thieu

| # | Rui ro | Xac suat | Tac dong | Bien phap giam thieu |
|---|--------|----------|---------|----------------------|
| 1 | **Do chinh xac khong du cho production** | Cao | Cao | A/B testing, HITL review, trich xuat confidence scoring |
| 2 | **Chi phi VLM API tang khi scale** | Cao | Trung binh | Hybrid pipeline: dung VLM chi cho truong hop kho |
| 3 | **Thieu du lieu huan luyen tieng Viet** | Cao | Cao | Data augmentation, synthetic data (SynthDoG), active learning |
| 4 | **Mo hinh bi hallucinate** | Trung binh | Cao | Validation rules, cross-check, human review cho truong hop nhay cam |
| 5 | **GPU khong du cho inference** | Trung binh | Trung binh | Model quantization (INT8), TensorRT, batching |
| 6 | **API downtime (Claude/GPT)** | Thap | Cao | Fallback sang mo hinh local, circuit breaker pattern |
| 7 | **Data privacy / bao mat** | Trung binh | Rat cao | On-premise deployment, encryption, access control |
| 8 | **Model drift theo thoi gian** | Trung binh | Trung binh | Monitoring accuracy, auto-retrain pipeline |
| 9 | **PaddlePaddle dependency** | Thap | Trung binh | Backup plan voi DocTR (PyTorch), ONNX export |
| 10 | **Tai lieu moi khong tuong thich** | Cao | Trung binh | Zero-shot VLM fallback, rapid fine-tuning pipeline |

### 8.3. Anti-patterns can tranh

| Anti-pattern | Mo ta | Thay the bang |
|-------------|-------|---------------|
| **Chi dung 1 mo hinh** | Dat cuoc tat ca vao 1 approach | Hybrid pipeline, A/B testing |
| **Khong co HITL** | Tin tuong 100% vao AI | Luon co human review cho low-confidence |
| **Over-engineering MVP** | Xay Kubernetes cluster cho 100 tai lieu/ngay | Bat dau voi Docker Compose, scale sau |
| **Bo qua pre-processing** | Dua anh tho vao OCR | Luon tien xu ly: de-skew, de-noise |
| **Hard-code templates** | Viet rule rieng cho tung loai hoa don | Dung ML-based extraction (LayoutLM) |
| **Khong version du lieu** | Training data khong duoc track | Dung DVC hoac MLflow Artifacts |
| **Khong monitor production** | Khong biet khi nao model degrade | Prometheus metrics, accuracy dashboards |

### 8.4. Security Considerations

| Moi nguy | Chi tiet | Bien phap |
|----------|---------|-----------|
| **Data leakage** | Tai lieu nhay cam gui len cloud API | On-premise cho tai lieu nhay cam |
| **PII exposure** | Thong tin ca nhan (CMND, MST) trong logs | PII masking trong logs, encryption at rest |
| **Model extraction** | Do trom mo hinh qua API | Rate limiting, authentication, watermarking |
| **Adversarial attacks** | Tai lieu gia mao danh lua AI | Forgery detection module, multi-factor verification |
| **Supply chain** | Thu vien doc hai trong dependencies | Dependency scanning, pinned versions |

---

## Phu luc A: Checklist Trien khai

### A1. Truoc khi bat dau (Pre-development)

- [ ] Xac dinh ro loai tai lieu muc tieu (bao nhieu loai? template co dinh hay tu do?)
- [ ] Thu thap mau tai lieu thuc te (toi thieu 100 mau/loai)
- [ ] Xac dinh yeu cau accuracy (thuong >90% cho production)
- [ ] Xac dinh yeu cau latency (thuong <5s cho interactive, <30s cho batch)
- [ ] Xac dinh yeu cau privacy (on-premise hay cloud OK?)
- [ ] Du tru ngan sach GPU (1x T4 ~$300/thang, 1x A100 ~$1,500/thang)

### A2. Development

- [ ] Setup dev environment (Docker + GPU)
- [ ] Benchmark OCR engines tren du lieu thuc te tieng Viet
- [ ] Xay dung data annotation pipeline (Label Studio / CVAT)
- [ ] Implement pre-processing pipeline
- [ ] Implement OCR + extraction pipeline
- [ ] Implement validation layer
- [ ] Implement HITL review UI
- [ ] Unit tests + integration tests
- [ ] Load testing

### A3. Deployment

- [ ] Dockerize tat ca services
- [ ] Setup CI/CD pipeline
- [ ] Setup monitoring (Prometheus + Grafana)
- [ ] Setup logging (ELK)
- [ ] Setup alerting (PagerDuty / Slack)
- [ ] Performance optimization (quantization, caching)
- [ ] Security audit
- [ ] Documentation

### A4. Post-deployment

- [ ] Monitor accuracy metrics hang ngay
- [ ] Thu thap feedback tu HITL reviewers
- [ ] Retrain mo hinh dinh ky (hang thang)
- [ ] A/B test mo hinh moi vs mo hinh cu
- [ ] Expand loai tai lieu ho tro

---

## Phu luc B: Benchmark Reference

### B1. Thoi gian inference tham khao (1 trang A4, 300 DPI)

| Mo hinh / Tool | GPU (T4) | GPU (A100) | CPU (8 core) |
|---------------|----------|-----------|-------------|
| PaddleOCR (full pipeline) | 80ms | 30ms | 350ms |
| Tesseract 5 | - | - | 500ms |
| vietocr (recognition only) | 20ms | 8ms | 150ms |
| LayoutLMv3 (classification) | 40ms | 15ms | 200ms |
| LayoutLMv3 (token classification / IE) | 50ms | 20ms | 250ms |
| Table Transformer (detection) | 60ms | 25ms | 300ms |
| Table Transformer (structure) | 80ms | 35ms | 400ms |
| Donut (IE) | 150ms | 50ms | 800ms |
| Claude Vision API | 2000-5000ms (network) | - | - |

### B2. Do chinh xac tham khao tren du lieu tieng Viet

| Tac vu | Dataset | Mo hinh tot nhat | Accuracy |
|--------|---------|-----------------|----------|
| OCR tieng Viet (in) | Internal test set | PaddleOCR + vi lang | ~90% char accuracy |
| OCR tieng Viet (in) | Internal test set | vietocr | ~93% char accuracy |
| Form IE | XFUND-VI | LayoutXLM | ~82% F1 |
| Document Classification | Internal VN docs | LayoutLMv3 fine-tuned | ~94% accuracy |
| Invoice IE | Internal invoices | Claude Vision (zero-shot) | ~88% field accuracy |
| CCCD OCR | Internal CCCD | PaddleOCR + post-process | ~95% field accuracy |

*Luu y: Cac con so tren la uoc tinh dua tren kinh nghiem va benchmark cong bo. Ket qua thuc te phu thuoc vao chat luong du lieu cu the.*

---

*Bao cao nay duoc bien soan boi Dr. Praxis (R-beta) nhu mot phan cua du an MAESTRO Knowledge Graph, Phase 1, Module B02. Noi dung tap trung vao khia canh ky thuat trien khai thuc te cho thi truong Viet Nam.*

*Buoc tiep theo: Dr. Sentinel (gamma) se bien soan feasibility-report.md voi danh gia kha thi, phan tich thi truong, va rui ro.*
