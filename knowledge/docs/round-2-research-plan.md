# Round 2 Re-Research Plan — MAESTRO Knowledge Graph

**Version:** 1.0  
**Created:** 2026-04-01  
**Status:** 🔄 Planning — Not Started  
**Protocol:** SOP-AGENT-PROCESS.md §5.5 Workflow D  

> This file is Round 2–specific. For generic re-research rules, see `docs/SOP-AGENT-PROCESS.md §5.5 (Workflow D)`.  
> Future rounds (Round 3, Round 4…) should create their own equivalent file.

---

## OVERVIEW

**Round 1 result:** 15 baselines (B01–B15) researched.  
**Round 2 goal:** Bring ALL modules to GO (score ≥ 7.0).  
**Modules needing re-run:** 9 (Tier A: 3 | Tier B: 2 | Tier C: 4)  
**No re-run needed:** 6 (already at GO)

---

## MODULE ASSIGNMENTS

### 🔴 Tier A — Full Re-Research (score < 6.0)

| Module | Score (R1) | Primary Issue | Target |
|--------|-----------|---------------|--------|
| B10 Agentic AI | 5.1 | Missing core architecture content; shallow SOTA | ≥ 7.0 |
| B11 Knowledge Graph | 5.5 | Insufficient graph algorithms; weak implementation section | ≥ 7.0 |
| B15 Simulation & Digital Twin | 5.6 | Missing domain-specific frameworks; thin market analysis | ≥ 7.0 |

**Agents:** α (full) → β (full) → γ (full) + ALL Layer 2 + σ (full rewrite)

---

### 🟠 Tier B — Targeted Re-Research (score 6.0–6.7, specific gaps)

| Module | Score (R1) | Primary Issue | Target |
|--------|-----------|---------------|--------|
| B14 Speech & Audio | 6.4 | SOTA 2024-2026 outdated; missing Vietnam speech datasets | ≥ 7.0 |
| B05 Recommendation Systems | 6.6 | Weak competitive landscape; missing LLM-based rec systems | ≥ 7.0 |

**Agents:** α (update gap sections) → γ (re-score) → σ (partial)  
**Layer 2:** re-run only roles with outdated notes (Manager decides per module)

#### B14 Speech & Audio — Gap List for α dispatch

```
□ SOTA: Update với Whisper v4, SeamlessM4T, MMS (Meta), XTTS v2 (2024-2026)
□ Sources: Cần ≥10 sources. Add INTERSPEECH 2025, ICASSP 2025 papers
□ Vietnam context: VLSP datasets, Vivos corpus, FPT.AI speech API, Zalo AI challenge results
□ Concepts: Add "Speaker Diarization" — who spoke when (currently missing)
□ Concepts: Add "Voice Activity Detection (VAD)" — foundational, currently missing
□ Algorithms: Add Whisper v4 fine-tuning comparison approach
□ Cross-domain: Strengthen B14→B08 connection (Speech as input for Conversational AI)
```

#### B05 Recommendation Systems — Gap List for α dispatch

```
□ Competitive landscape: Expand — cần ≥2 additional competitors với pricing + S/W analysis
□ SOTA: Add LLM-based recommendation (LLM as ranker, prompt-based personalization) 2024-2026
□ Algorithms: Add "LLM-augmented recommendation" as emerging category
□ Use cases: Strengthen non-retail (healthcare treatment rec, education course rec)
□ Mini examples: Example 2 quá generic — need specific production scenario with metrics
```

---

### 🟡 Tier C — Score Recalculation Only (formula fix or borderline)

| Module | Score (R1) | Issue | Notes |
|--------|-----------|-------|-------|
| B04 NLP | 6.8 | Borderline — content OK, score needs validation | Re-score with full 30/30/20/20 formula |
| B03 Computer Vision | 6.8 | Borderline — content OK, score needs validation | Re-score with full 30/30/20/20 formula |
| B01 Forecasting | 6.9 | Borderline — content OK, score needs validation | Re-score with full 30/30/20/20 formula |
| B02 Doc Intelligence | 7.05* | **Weight bug** (see §B02 Note below) | Recalculate only |

**Agents:** γ only → σ (Feasibility section + verdict only)

---

### ✅ No Re-Run Needed (score ≥ 7.0, GO)

| Module | Score (R1) | Status |
|--------|-----------|--------|
| B06 Optimization | 8.4 | ✅ GO |
| B07 Anomaly Detection | 7.3 | ✅ GO |
| B08 Conversational AI & Chatbots | 7.0 | ✅ GO |
| B09 Generative AI | 7.0 | ✅ GO |
| B12 Search & RAG | 8.0 | ✅ GO |
| B13 Tabular ML & Predictive Analytics | 8.5 | ✅ GO |

---

## SCORING CALIBRATION REFERENCE

γ re-scoring PHẢI dùng calibration anchors sau để consistent across modules.

**Weights:** Tech × 0.30 + Market × 0.30 + Data × 0.20 + (10 - Risk) × 0.20  
**Full reference:** R-γ skill card §Scoring Formula

```
Technical Feasibility (1-10):
  10: Mature, proven at scale — ví dụ: LightGBM tabular, YOLO detection
   7: Production-ready nhưng cần expertise — ví dụ: TFT forecasting, RAG pipeline
   4: Experimental, ít production cases — ví dụ: Physics-Informed NN, autonomous agents
   1: Purely theoretical, chưa có implementation viable

Market Demand (1-10):
  10: Every enterprise needs this — ví dụ: RAG/chatbot, demand forecasting, fraud detection
   7: Strong demand trong specific verticals — ví dụ: CV manufacturing, OCR logistics
   4: Niche demand, early adopters only — ví dụ: Knowledge Graph standalone, DT for SMEs
   1: No clear buyer, solution looking for problem

Data Availability (1-10):
  10: Client luôn có data sẵn, quality tốt — ví dụ: transaction data, network logs
   7: Data có nhưng cần cleaning — ví dụ: medical records (siloed)
   4: Data sparse, expensive to collect — ví dụ: agricultural sensors, rare disease datasets
   1: Hầu như không có data, phải build from scratch

Implementation Risk (1-10, 10 = RISKIEST):
  10: Novel tech, no precedent, regulatory minefield
   7: Complex integration, data quality unknown
   4: Proven approach, manageable complexity
   1: Well-established, plug-and-play solutions

Note: Risk is INVERTED in formula — Risk_inv = (10 - Risk_score).
High risk (10) → Risk_inv = 0 → drags overall DOWN.
Low risk (1)  → Risk_inv = 9 → boosts overall UP.
```

---

## B02 WEIGHT BUG — EXPLANATION

**Problem:** R-γ applied equal weights (0.25 × 4 = 1.0) instead of the defined 30/30/20/20 formula.

```
WRONG (applied in Round 1):
  Technical Feasibility:  0.25
  Market Demand:          0.25
  Data Availability:      0.25
  Implementation Risk:    0.25
  Sum: 1.00

CORRECT (per R-γ skill card §Scoring Formula):
  Technical Feasibility:  0.30
  Market Demand:          0.30
  Data Availability:      0.20
  Implementation Risk:    0.20  (inverted: 10-risk)
  Sum: 1.00
```

**Fix:** R-γ must re-read raw dimension scores from `feasibility-report.md` and
recalculate using 30/30/20/20. σ then updates `feasibility_score` in `data/baselines/B02.json`.

**Expected impact:** Score may change ±0.3–0.5 depending on dimension imbalance.  
If recalculated score ≥ 7.0 → B02 stays GO. If < 7.0 → upgrade to Tier C or Tier B.

---

## STEP 0 — SCORE VALIDATION (chạy TRƯỚC mọi Tier)

> ⚠️ Round 1 scores có thể inaccurate — γ scoring formula không consistent (confirmed: B02 bug).
> Step này quick-validate ALL 6 "No Re-Run" modules trước khi assume chúng GO.

```
PROCESS (γ only, ~5 min/module, ~30 min total):
  1. γ đọc feasibility-report.md của từng module (6 modules)
  2. Extract raw dimension scores (Tech, Market, Data, Risk)
  3. Recalculate với CORRECT formula:
     Overall = Tech × 0.30 + Market × 0.30 + Data × 0.20 + (10 - Risk) × 0.20
  4. Apply verdict thresholds:
     GO:             overall ≥ 7.0 AND no dimension < 5
     CONDITIONAL GO: overall 5.0–6.9
     NO-GO:          overall < 5.0

OUTCOMES:
  Score vẫn ≥ 7.0 → confirm GO, không re-run
  Score drops 6.8–6.9 → promote to Tier C (add to list)
  Score drops 6.0–6.7 → promote to Tier B (add gap list + dispatch α)
  Score drops < 6.0   → promote to Tier A (full re-run)

Update MODULE ASSIGNMENTS section nếu có promotions.
AGENT: γ only. σ NOT needed at this step.
```

---

## EXECUTION ORDER (recommended)

```
Step 0 (score validation):
  γ quick-validate 6 "No Re-Run" modules (recalc 30/30/20/20)     → ~30 min
  Update tier assignments nếu có promotions

Phase 1 — Quick wins (Tier C, parallel where possible):
  B02 weight bug recalc (γ only)                                    → ~20 min
  B01, B03, B04 re-score (γ + σ each)                              → ~30 min each (~1.5h)
  Phase 1 total: ~2h (includes Step 0)

Phase 2 — Targeted (Tier B, sequential within module):
  B14 Speech & Audio (α gaps + γ + σ)                              → ~3h (α web search heavy)
  B05 Recommendation (α gaps + γ + σ)                              → ~3h
  Phase 2 total: ~6h

Phase 3 — Full re-research (Tier A, most effort):
  B15 Simulation & DT (full α→β→γ→L2→σ)                          → ~6-8h (2-3 sessions)
  B11 Knowledge Graph (full pipeline)                               → ~6-8h (2-3 sessions)
  B10 Agentic AI (full pipeline)                                    → ~6-8h (2-3 sessions)
  Phase 3 total: ~18-24h

Phase 4 — Cross-module consistency (sau khi TẤT CẢ re-runs pass):
  σ reads ALL 15 final-reports + JSONs                              → ~2h
  Check: terminology, scoring calibration, bidirectional edges, boundary rules
  Output: docs/reports/round-2-consistency-report.md + verified graph.json

GRAND TOTAL: ~28-34h (~10-12 sessions)
```

**Rationale:** Step 0 first (may change tier assignments) → Tier C quick wins → Tier B → Tier A → Phase 4 final consistency check.

---

## PROGRESS TRACKER

| Module | Tier | Status | Round 2 Score | Notes |
|--------|------|--------|--------------|-------|
| B02 | C | ⬜ Not Started | — | Weight bug fix |
| B01 | C | ⬜ Not Started | — | |
| B03 | C | ⬜ Not Started | — | |
| B04 | C | ⬜ Not Started | — | |
| B14 | B | ⬜ Not Started | — | |
| B05 | B | ⬜ Not Started | — | |
| B15 | A | ⬜ Not Started | — | |
| B11 | A | ⬜ Not Started | — | |
| B10 | A | ⬜ Not Started | — | |

---

## VERIFICATION

After each module completes, run MODULE-TEST-PROTOCOL per Workflow D §D.7:

- **Tier A:** Full Layer 0 + Layers 1–5
- **Tier B:** Layer 0 + Layer 1 + Layer 3 (α §L3.1 + γ §L3.3 + σ §L3.4) + Layer 4
- **Tier C:** Layer 0 + Layer 1 + Layer 3 (γ §L3.3 + σ §L3.4) + Layer 4.2

Update Progress Tracker above after each verification passes.

---

## ROLLBACK PLAN

Nếu Round 2 re-run làm module WORSE (agent introduces hallucination, score drops, quality giảm):

```
DETECTION:
  - MODULE-TEST-PROTOCOL post-R2 score LOWER than post-R1
  - Manager review thấy content quality giảm (hallucinated papers, weaker analysis)
  - σ flags regression trong consolidation notes

RESPONSE:
  1. STOP re-run cho module đó immediately
  2. Git revert affected files to Round 1 state:
     git checkout HEAD~N -- docs/reports/{MODULE_ID}/
     git checkout HEAD~N -- data/baselines/{MODULE_ID}.json
  3. Log trong Progress Tracker: "{BXX}: Reverted to R1 — [reason]"
  4. Options (chọn 1):
     a) Accept Round 1 output as-is (good enough)
     b) Manager manual fix specific issues only (no agent re-run)
     c) Defer to Round 3 với different prompt/approach

MAX ATTEMPTS RULE: 2 attempts per module maximum.
  Attempt 1: Workflow D theo assigned tier
  Attempt 2: Fix specific failures from attempt 1 only
  Attempt 3: KHÔNG có. Fix root cause (prompt/skill card) hoặc defer.
  Rationale: 2 failures = root cause is prompt design, not agent effort.
```
