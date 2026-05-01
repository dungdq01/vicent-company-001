# Healthcare Domain Notes: B03 Computer Vision × Healthcare
## By R-D03 — Date: 2026-03-31

---

### 1. Medical Imaging Overview

Medical CV operates across fundamentally different imaging modalities, each with distinct technical and clinical characteristics:

**X-ray (Radiography)**: 2D projection imaging. Fast, low cost, high volume. Primary screening tool for TB, pneumonia, chest pathologies, and fractures. Most abundant labeled dataset source. Resolution typically 2000x2000px or higher. Primary format: DICOM. Dominant modality in Vietnamese public hospitals due to cost.

**CT (Computed Tomography)**: 3D volumetric imaging (stack of 2D slices). Rich structural detail. Used for lung cancer screening, COVID-19 severity, stroke detection, and abdominal pathologies. High data volume per scan (300-600 DICOM slices). Requires 3D-aware models (3D U-Net, nnU-Net). Computationally expensive.

**MRI**: High soft tissue contrast. Key for brain, spine, musculoskeletal, and prostate imaging. Long acquisition times. Multiple sequences per study (T1, T2, FLAIR, DWI) — models must handle multi-channel inputs. Less common in rural Vietnam due to equipment cost (USD 1-3M per unit).

**Pathology Slides (Digital Pathology / WSI)**: Gigapixel whole-slide images. Analyzed at multiple magnifications. Used for cancer grading, cell counting, tumor microenvironment analysis. Requires specialized architectures (patch-based CNNs, MIL — Multiple Instance Learning). Digitization is rapidly expanding in Vietnam's cancer centers (K Hospital Hanoi, Ung Buou HCMC).

**Dermatology**: Standard RGB images from smartphones or dermoscopes. Democratized modality — enables AI deployment with consumer hardware. Key applications: melanoma screening, wound assessment, skin disease classification.

**Endoscopy / Colonoscopy**: Video-based real-time polyp detection. Time-critical — model must run at 30fps during procedure. FDA-cleared systems (GI Genius) exist; represents the leading edge of real-time surgical AI.

**Ultrasound**: Real-time B-mode and Doppler imaging. Operator-dependent. High noise (speckle). Used for fetal assessment, cardiac function, liver disease screening. Portable ultrasound + AI is a high-impact vector for rural Vietnam primary care.

---

### 2. High-Value CV Use Cases in Healthcare

**Radiology AI (Chest X-ray)**
Automated detection of pneumonia, TB, pleural effusion, cardiomegaly, and lung nodules. Triage tool: flag abnormal X-rays for priority radiologist review. Proven clinical ROI: reduces reporting backlog by 20-40% in high-volume settings. CheXNet (Stanford, 2017) demonstrated radiologist-level performance — now multiple FDA-cleared products exist.

**Diabetic Retinopathy (DR) Screening**
Fundus photography analyzed for DR grade (0-4 ETDRS scale). IDx-DR was the first FDA-authorized autonomous AI diagnostic system (2018). Vietnam has 5-7 million diabetic patients (IDF 2025 estimate) with severely limited ophthalmologist capacity. Point-of-care AI screening in primary care clinics is one of the highest-impact CV applications available for Vietnam's health system.

**Skin Lesion Classification**
CNN-based classification of dermoscopic images into benign/malignant categories (melanoma detection). ISIC challenge benchmark. Smartphone-based apps (e.g., SkinVision) extend reach to dermatologist-scarce areas. Relevant for Vietnam's tropical dermatology burden (fungal infections, sun-exposure cancers).

**Surgical Assistance**
Real-time instrument tracking and anatomical landmark detection during laparoscopic surgery. Cholec80 dataset benchmark. Enables post-operative workflow analysis and resident training feedback. Emerging in Vietnam's top-tier hospitals (Viet Duc, Cho Ray).

**Pill / Medication Identification**
CV-based pill recognition from smartphone photos — supports pharmacy verification, medication adherence, and poison control. Highly relevant for Vietnam's fragmented pharmacy distribution system and counterfeit drug problem.

---

### 3. Vietnamese Healthcare Context

Vietnam's public healthcare system operates under significant resource constraints that shape AI deployment strategy:

**Hospital Digitization Status**: Tier-1 hospitals (Bach Mai, Cho Ray, Viet Duc) have implemented HIS/RIS systems and PACS. Tier-2 provincial hospitals have partial digitization. District hospitals and commune health centers largely operate on paper records or basic HIS without imaging integration. This creates a two-speed market: sophisticated AI integration possible at top hospitals; edge/standalone deployment required for primary care.

**VinAI Medical AI**: VinAI Research (Vingroup subsidiary) has published peer-reviewed work on chest X-ray analysis and retinal imaging, including VinDr-CXR, one of the largest Vietnamese chest X-ray datasets (18,000 studies with radiologist annotations). This is the most significant local medical AI asset and a potential collaboration or licensing target for MAESTRO.

**COVID-19 CT Screening**: During the 2020-2022 pandemic, Vietnam deployed CT-based AI triage tools at major hospitals (Hanoi's National Lung Hospital, Hue Central Hospital) in collaboration with international partners. This created operational experience with medical AI deployment — clinical staff in these institutions have AI familiarity that smooths future adoption.

**Radiologist Shortage**: Vietnam has approximately 0.3 radiologists per 10,000 population (WHO data), versus 1.2 in developed markets. This structural shortage is the primary economic driver for radiology AI adoption. The business case writes itself.

---

### 4. Technical Challenges in Medical CV

**Small Datasets**: Rare conditions may have only 100-500 labeled cases nationally. Mitigation: transfer learning from large public datasets (CheXPert, MIMIC-CXR), synthetic data augmentation (CycleGAN for domain adaptation), and federated learning across hospital networks.

**Class Imbalance**: Pathological findings are rare (1-5% prevalence in screening populations). Standard accuracy metrics are meaningless. Require Dice loss or focal loss during training; evaluate with sensitivity/specificity at operating points selected by clinicians (not engineers).

**Distribution Shift Between Hospitals**: A model trained on data from Bach Mai Hospital (Siemens CT, GE X-ray equipment) may underperform at a provincial hospital using different scanner makes and acquisition protocols. Mandatory: multi-site validation before any claimed generalization.

**DICOM Format Complexity**: DICOM files contain hundreds of metadata tags affecting pixel interpretation: window center/width, pixel spacing, rescale slope/intercept, photometric interpretation, and multi-frame sequences. Incorrect DICOM parsing is a silent source of model degradation. Use dedicated libraries (pydicom, MONAI's DICOM reader) rather than generic image loaders.

---

### 5. Regulatory Requirements

**FDA SaMD (Software as Medical Device)**: AI/ML-based CV tools analyzing medical images are classified as SaMD. Risk classification (Class I/II/III) determines regulatory pathway. Most radiology AI falls under Class II — requires 510(k) clearance with substantial equivalence demonstration. FDA's 2021 AI/ML Action Plan introduces continuous learning oversight requirements.

**CE Marking (EU MDR)**: Required for Vietnam's export market and multinational hospital chains (FV Hospital, Vinmec International). Article 22 of EU MDR 2017/745 applies to AI-based diagnostic tools. Technical documentation must include clinical validation evidence.

**Vietnam Ministry of Health (MoH)**: Circular 22/2023/TT-BYT establishes the framework for medical device registration in Vietnam. AI diagnostic software is classified as a medical device and requires registration with the Drug Administration of Vietnam (DAV). As of 2026, the regulatory pathway remains less defined than FDA/CE but is actively developing. Engaging with National Hospital for Tropical Diseases and relevant MoH departments during pilot phases builds the regulatory relationship needed for eventual approval.

---

### 6. Key Datasets

- **ChestX-ray14 (NIH)**: 112,120 frontal chest X-rays, 14 disease labels. Widely used but label noise documented. Public.
- **MIMIC-CXR**: 227,835 radiographs with paired radiology reports. Requires PhysioNet credentialing. Gold standard for NLP+CV combined models.
- **VinDr-CXR**: 18,000 chest X-rays annotated by 17 Vietnamese radiologists. Publicly available on PhysioNet. The most relevant dataset for Vietnam deployment validation.
- **ISIC Skin Lesion Dataset**: 33,000+ dermoscopic images. Annual challenge benchmark. Public.
- **Vietnamese hospital datasets**: Available under research agreements (Bach Mai, Cho Ray, 108 Military Hospital). Data sharing agreements (DSA) require ethics board approval at both institutions. Federated analysis without data transfer is the preferred approach for privacy compliance.

---

### 7. ROI & Business Case

**Radiologist Shortage Economics**: Vietnam needs approximately 8,000 radiologists; current supply is under 2,000. Each radiologist reads approximately 30-50 chest X-rays/hour. AI triage tools that handle normal cases (typically 60-70% of volume) effectively double a radiologist's useful capacity without hiring.

**Cost Per Read**: Manual chest X-ray read cost in Vietnam public hospitals: approximately USD 3-8 per study (loaded cost including radiologist salary, overhead). AI-assisted read: USD 0.50-1.50 per study at scale (cloud API or amortized model cost). At 1 million reads/year for a provincial hospital network, annual savings of USD 2-6M.

**Error Reduction**: Studies show AI-assisted reading reduces miss rate for critical findings (pneumothorax, large effusions) by 30-60%. In a system with structural radiologist fatigue (overwork is endemic), this represents genuine clinical value beyond cost savings.

---

### 8. Recommended Stack for Medical CV

**Core Framework**: MONAI (Medical Open Network for AI) — PyTorch-based, built for medical imaging. Provides DICOM I/O, medical-specific augmentations, 3D model architectures (nnU-Net, SwinUNETR), and a deployment SDK (MONAI Deploy). Backed by NVIDIA and major US hospital systems.

**Federated Learning**: NVIDIA FLARE or PySyft for hospital data sharing without centralization. Critical for Vietnam multi-hospital model development given data governance constraints. Allows a model to be trained across Bach Mai, Cho Ray, and Hue Central Hospital without any patient data leaving each institution.

**Explainability**: Grad-CAM, SHAP, and LIME are minimum requirements for radiologist-facing tools. Regulators and clinicians require visual evidence of what the model attended to. Vietnamese radiologists interviewed in VinDr studies specifically noted trust is conditioned on seeing the AI's "reasoning" overlaid on the image.

**Inference Infrastructure**: NVIDIA Triton Inference Server for multi-model serving. TensorRT optimization for T4/A10 GPUs common in Vietnam cloud providers. MONAI Deploy App Server for end-to-end DICOM workflow integration.
