# FLOW 1 — Monthly Production Booking & Commitment

**Date:** 2026-04-28 (rewrite sau sự cố mất docs)
**Cadence:** Monthly · **Modules:** M11 → M12 → M13 → M14 → M15 → M16 → M17
**Mục tiêu:** Từ FC tháng → cam kết sản xuất với NM → theo dõi gap & quyết định scenario.

---

## 1. Big picture

```
M11 Demand v2     →  M12 S&OP Lock   →  M13 Booking    →  M14 Commitment 3-tier
  (FC 2-level         (Day 3/5/7/10)     (per NM×SKU)       (Hard/Firm/Soft → SENT)
   + B2B deals)              ↓                                       ↓
                                                          M15 NM Response
                                                          (PENDING/ACCEPT/COUNTER/REJECT)
                                                                    ↓
                                              M16 Hub ảo  ←  confirmed_qty
                                              (allocatable)        ↓
                                                    ↓        M17 Gap & Scenario
                                                    │        (3 view, A/B/C/D, carry)
                                          [feeds M23 nếu flag ON]
```

**1 cycle = 1 tháng.** Output cuối: commitment locked với NM cho tháng T+1..T+3 + carry-forward gap về cycle sau.

---

## 2. Timeline trong tháng T

| Day | Module | Action |
|-----|--------|--------|
| 1–3 | **M11** | Import FC Total + FC CN + B2B deals |
| 3   | **M12** | S&OP Tier 1: SC Manager review/adjust Total FC |
| 5   | **M12** | S&OP Tier 2: CN Manager review/adjust CN FC |
| 7   | **M12** | Variance check Σ(CN) vs Total ≤ ±10% (config `consistency_threshold_pct`) |
| 10  | **M12** | **LOCK cycle** → status=LOCKED, immutable |
| 10+ | **M13** | Hub netting + SS hub → `booking_plan.final_qty` per NM×SKU |
| 11  | **M14** | Tier split (Hard/Firm/Soft) → confirm → SENT to NM |
| 11–15 | **M15** | NM response window (SLA Day+3 remind, Day+5 escalate) |
| ≥15 | **M16** | Hub ảo recalculate khi M15 accept |
| EOM−10/−5/−2 | **M17** | Gap alert → scenario simulator → SC/CEO decide |
| EOM | **M17** | Carry-forward unresolved gap về cycle sau |

---

## 3. Module specs (gọn)

### M11 — Demand Aggregation v2

**Input:** ERP sales history, B2B pipeline, planner manual.
**Logic:**
- 2-level FC: `level=TOTAL` (per SKU) + `level=CN` (per CN×sku_group)
- B2B deals có `stage` + `probability` (M10 `b2b.stage_prob`); cascade vào FC khi stage change ≥ 20%
- Multi-CN deal → `b2b_deal_split` chia theo tỷ lệ

**Output:** `demand_snapshot` (status=FROZEN khi đóng), `b2b_deal`, `b2b_deal_stage_history`, `b2b_deal_split`.
**Contract:** `getDemandSnapshot(cycleMonth, level)` → snapshot lines.

### M12 — S&OP Consensus

**Input:** M11.demand_snapshot.
**Logic 4 milestone:**
1. **Day 3** — Tier 1 lock: SC Manager adjust TOTAL FC, mỗi adjustment phải có `reason_text`. Optimistic lock qua `version`.
2. **Day 5** — Tier 2 lock: CN Manager adjust CN FC.
3. **Day 7** — Variance check: `gap_pct = |Σ(CN) − Total| / Total`. Band GREEN/YELLOW/RED.
4. **Day 10** — Cycle LOCK: `saop_cycle.status=LOCKED`, frozen → M13.

**Output:** `saop_cycle`, `saop_adjustment` (2 grain partial unique TOTAL/CN), `saop_deadline`, `fva_log` (Phase 2 FVA backfill).
**Contract:** `getLockedDemand(cycleMonth)` → totalLevel + cnLevel maps.

### M13 — Production Lot Sizing & Hub Booking

**Input:** M12 locked FC (T+1..T+3), `supply_snapshot` (hub + CN stocks), M17 carry-forward gap (nếu có).
**Logic 3 step:**
```
1. hub_available = Σ stock_cn + hub_inbound − Σ ss_cn       (hub mode = GROSS Phase 1)
2. ss_hub = z × σ × √LT_hub                                  (formula M10)
3. final_qty = MAX(0, fc_3months − hub_available + ss_hub)
                                + carried_forward_qty (M17)
```
- MOQ check từ `sku_nm_mapping.moq` → warning, KHÔNG auto-round.
- σ source: `M28_ACTUAL` (preferred) → `FC_PROXY` → `SEED`.

**Output:** `booking_run` (wrapper), `hub_snapshot`, `ss_hub`, `booking_plan`.
**Contract:** `getConfirmedBooking(cycleMonth)` → plan rows status=LOCKED.

### M14 — FC Commitment 3-Tier

**Input:** M13.booking_plan.final_qty.
**Logic:**
- Split proportional: `hard_qty + firm_qty + soft_qty = final_qty`.
- Tolerance per tier (M10): Hard ±5%, Firm ±15%, Soft ±30%.
- Lifecycle: DRAFT → LOCKED → SENT → ACK → VOID (cancel).
- Version increment khi adjust → unique `(commitment_run_id, nm_id, sku_id, tier, version)`.
- SC Manager confirm → status=SENT trigger M15.

**Output:** `commitment_run` (wrapper), `fc_commitment`, `commitment_penalty` (Phase 2, EOM cron khi vi phạm tolerance).
**Contract:** `getCommittedVsDemand(cycleMonth)` → grain NM×SKU×horizon.

### M15 — NM Response & Negotiation

**Input:** M14.fc_commitment status=SENT.
**3-field model (TÁCH BẠCH semantics):**
| Field | Values |
|-------|--------|
| `response_type` | PENDING · ACCEPTED · COUNTER · REJECTED (NM trả lời gì) |
| `sla_state`     | NONE · REMINDED · ESCALATED (auto SLA timer) |
| `sc_decision`   | NULL · CONFIRM · OVERRIDE · SPLIT · ROLLOVER (SC quyết định khi COUNTER) |

**SLA (M10 config):** Day+3 → REMINDED, Day+5 → ESCALATED. Soft tier có thể skip SLA (config `nm.sla_skip_soft_tier`).
**Multi-round:** mỗi counter → `nm_negotiation_round` row mới, `round++`. Max rounds = 3 (M10).
**Trigger M16** khi `response_type=ACCEPTED` hoặc sc_decision quyết định cuối.

**Output:** `nm_response`, `nm_negotiation_round`.
**Contract:** `getResponseSummary(cycleMonth)` → {confirmed, pending, escalated}.

### M16 — Hub ảo Virtual Inventory

**Input:** M13.ss_hub, M15.confirmed_qty (Σ tháng cycle), `supply_snapshot.released_qty` (actual dispatch).
**Logic:**
```
hub_available = confirmed_qty − released_qty
allocatable   = MAX(0, hub_available − ss_hub)
```
**3 trigger recalc:**
1. M15 response thay đổi (event)
2. M13 ss_hub update (event)
3. Daily cron 00:30

**Cross-flow gate:**
- Flag `m16_hub_virtual_feeds_drp = TRUE` → M23 `plan_run.hub_source=VIRTUAL`, swap `supply_snapshot.hub_qty` bằng `allocatable`.
- Flag OFF (default Phase 1) → M23 dùng supply_snapshot trực tiếp (fallback an toàn).

**Output:** `hub_virtual_snapshot`.
**Contract:** `getVirtualInventory(skuId, at?)` → {hub_available, allocatable, ss_hub}.

### M17 — Gap Monitor & Scenario Simulator

**Input:** M14.committed, M15.nm_response, M16.allocatable.
**3 view (discriminator `gap_view_type`):**
| View | Compare |
|------|---------|
| **RELEASE** | `release_qty` (PO actual) vs `final_qty` (M13) |
| **NM**      | NM `confirmed_qty` (M15) vs `committed_qty` (M14) |
| **HUB**     | `allocatable` (M16) vs `demand_total` (M12) |

**Alert ladder (EOM-relative, M10):**
- EOM−10: gap > 15% → status=ALERT
- EOM−5 : gap > 10% → status=ESCALATED
- EOM−2 : auto status=SCENARIO_REQUIRED

**Scenario simulator (chỉ trigger từ RELEASE view):**
| Code | Action | Cost |
|------|--------|------|
| **A** | Buy gap ở giá standard | gap × `price_tier_1` |
| **B** | Buy retroactive ở giá premium | gap × `price_tier_2` |
| **C** | Rollover sang tháng sau | 0 (rủi ro stockout) |
| **D** | Hybrid (A% + C%) | blended |
| **E** | CEO escalate, custom override | manual |

SC chọn → `gap_scenario_decision`. Nếu C/D có rollover → set `carry_to_cycle_month`.

**Carry-forward:**
- EOM unresolved → `gap_snapshot.status=CARRIED_FORWARD`
- `getCarriedForwardGaps(targetCycle)` → M13 next cycle: `booking_plan.carried_forward_qty++`.

**Penalty workflow (M14):** `commitment_penalty` chạy độc lập EOM cron, KHÔNG block carry-forward.

**Output:** `gap_snapshot` (3 rows per NM×SKU per compute), `gap_scenario_decision`.
**Contract:** `getGapStatus(cycleMonth, viewType)`, `getCarriedForwardGaps(targetCycle)`.

---

## 4. Cross-flow integration

| From | To | Trigger | Data |
|------|-----|---------|------|
| M16 | M23 (Flow 2) | flag `m16_hub_virtual_feeds_drp=TRUE` | `allocatable` swap `supply_snapshot.hub_qty` |
| M17 | M13 (next cycle) | EOM carry-forward | `carried_forward_qty` cộng vào fc_3months |
| M28 (weekly) | M13 | sigma refresh | new σ → ss_hub formula chính xác hơn |

---

## 5. Feature flags

```
m11_demand_v2_enabled            m15_nm_response_enabled
m12_saop_consensus_enabled       m16_hub_virtual_enabled
m13_prod_lot_sizing_enabled      m16_hub_virtual_feeds_drp   ← cross-flow
m14_fc_commitment_enabled        m17_gap_scenario_enabled
```
Flag OFF → endpoint trả 503, fallback logic Phase 1 (M1-M5 cũ).

---

## 6. Data tables (canonical)

| Module | Tables (NEW unless noted) |
|--------|---------------------------|
| M11 | `demand_snapshot` (EXT), `demand_snapshot_line` (EXT), `b2b_deal`, `b2b_deal_stage_history`, `b2b_deal_split` |
| M12 | `saop_cycle`, `saop_adjustment`, `saop_deadline`, `fva_log` |
| M13 | `booking_run`, `hub_snapshot`, `ss_hub`, `booking_plan` |
| M14 | `commitment_run`, `fc_commitment`, `commitment_penalty` |
| M15 | `nm_response`, `nm_negotiation_round` |
| M16 | `hub_virtual_snapshot` |
| M17 | `gap_snapshot`, `gap_scenario_decision` |

---

## 7. Key business rules (đừng quên)

1. **M12 LOCK = immutable:** Sau Day 10, mọi adjustment phải tạo cycle mới. Không patch in-place.
2. **M14 SUM invariant:** `hard + firm + soft = M13.final_qty` luôn đúng.
3. **M15 3-field tách bạch:** Đừng gộp business-answer/SLA/SC-decision vào 1 enum.
4. **M16 không Σ ss_cn:** Allocatable trừ `ss_hub` (không phải tổng SS từng CN — đó là chuyện M23).
5. **M17 scenario chỉ từ RELEASE view:** NM/HUB views chỉ informational.
6. **Carry-forward độc lập penalty:** Hai workflow song song, không block nhau.
7. **Cross-flow gate có fallback:** Flag OFF → Flow 2 không vỡ, dùng supply_snapshot trực tiếp.

---

*FLOW-1-SPEC.md — 2026-04-28*
