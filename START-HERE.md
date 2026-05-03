# START HERE — Người mới đọc 30 phút hiểu toàn bộ

> **File này là entry point duy nhất**. Đọc top-to-bottom. Sau đó anh hiểu: studio làm gì, vận hành ra sao, đọc tiếp gì để start project.

**Last updated**: 2026-04-28 · **Đối tượng**: human mới · **Time**: 30 phút

---

## 1. Studio này là gì? (1 phút)

**AI Studio boutique** — 3 founders + team Agentic AI giao end-to-end từ research → ship cho client logistics, e-commerce, MMO, healthcare, F&B (mọi ngành).

**Pricing**: $500 (POC) → $50K+ (full enterprise build).

**Khác biệt**: 1 framework chuẩn áp cho mọi project size — chỉ khác phase nào được invoke.

**Bản chất**: studio = **wrapper engine** quanh AI agents. KHÔNG phải agency truyền thống. KHÔNG phải pure SaaS.

---

## 2. Triết lý cốt lõi (3 phút)

### 2.1 Quy tắc vàng

> *"Knowledge feeds Engine. Engine produces outputs. Business decides what to feed and what to ship. Loop closes when output updates Knowledge."*

= Studio là **learning system tự cải tiến qua mỗi project**. KHÔNG phải static framework.

### 2.2 Agent = Model + Harness

```
Agent (AI nhân viên)  =  Model (bộ não LLM)  +  Harness (môi trường công sở)
```

- **Model** (Claude/GPT/Gemini): thông minh nhưng hay quên, hallucinate, dễ bị manipulate
- **Harness**: rules + manifest + tools + memory + observability + recovery — biến model thành **nhân viên đáng tin cậy**

→ Studio cạnh tranh không phải ở model (ai cũng dùng Claude) — cạnh tranh ở **harness** (cách wrap model để reliable + auditable).

### 2.3 5-Layer architecture

```
┌─────────────────────────────────────────────────────────────┐
│  L1  knowledge/         "Tủ sách — CLIENT-FACING"           │
│      → 15 baselines × 20 industries (thay đổi theo project) │
├─────────────────────────────────────────────────────────────┤
│  L2  _shared/           "Toolbox — agents, rules, prompts"  │
│      → 30+ skill cards + 11 rules + 15+ standards           │
├─────────────────────────────────────────────────────────────┤
│  L3  experience/        "Phương pháp — pipeline + workflow" │
│      → P0-P10 + Path A/B/C/D + 8 business pipelines + W01-12│
├─────────────────────────────────────────────────────────────┤
│  L4  projects/          "Dự án cụ thể — per-client"         │
│      → mỗi project có harness/ folder + memory + decisions  │
├─────────────────────────────────────────────────────────────┤
│  L5  business-strategy/ "Định hướng kinh doanh"             │
│      → 18+ files: ICP, pricing, KPI, channels               │
├─────────────────────────────────────────────────────────────┤
│  ⊕   studio/wisdom/     "Internal-only — CEO opinions"      │
│      → KHÔNG inject vào client deliverable                  │
└─────────────────────────────────────────────────────────────┘
```

**Luồng**: L5 quyết → L4 thực thi → mượn L3 phương pháp → invoke L2 agents → đọc L1 knowledge.
**Loop ngược**: project retro → memory promotion → rules update → next project rẻ hơn 2-3x.

### 2.4 Framework là wrapper, không phải application

- Framework = **office building + rules + procedures**
- Project = **occupant của 1 phòng** (per-client deliverable)
- Agent = **nhân viên thuê work-by-task**
- File `.md` = **physical paperwork** trong filing cabinets

→ **R-MAS-16**: framework folders READ-ONLY mid-engagement. Per-project deviation đi vào `projects/{id}/`.

---

## 3. 5 Paths input → output (3 phút)

Khi có gì mới đến (lead, idea, content, knowledge gap, ops issue), dispatcher route 1 trong 5 paths:

| Path | Trigger | Pipeline | Owner |
|---|---|---|---|
| **A** Customer brief | Inbound từ ICP | P0-P9 + P10 | P3 sales lead |
| **B** Internal product | Founder ý tưởng | PATH-B (B0-B7) | CEO approve |
| **C** Content piece | Calendar / trending | PATH-C (C0-C7) | Voice owner |
| **D** Knowledge re-research | Phase priority hoặc industry mới | PATH-D (D0-D6) | CEO |
| **E** Ops issue | Hire/finance/incident | (no engine) | P3 / COO |

**95% time** = Path A. B/C/D = strategic. E = administrative.

---

## 4. Một project chạy E2E như thế nào? (5 phút)

Lấy ví dụ: **1 client 3PL VN tier-2 (Acme Logistics) cần demand forecast**.

```
Day 0  INBOUND
       LinkedIn DM → P3 reply, book Calendly

Day 1  DISCOVERY CALL (30')
       P3 chạy BANT+Fit → SQL ✅, đề xuất Sprint A $1,500

Day 2  P0 INTAKE (manual HOẶC R-CoS automation)
       ⭐ Shortcut: gõ "Đóng vai R-CoS theo `_shared/.agents/tier-0-executive/R-CoS-chief-of-staff.md`"
          → R-CoS sẽ làm thay user các bước thủ công bên dưới
          (intent recognition · file ops · sub-agent dispatch · status report)
       1. mkdir projects/D-202604-001-{slug}/
       2. cp ../BRIEF-INTAKE.md (root template) → projects/{id}/BRIEF-INTAKE.md
       3. CEO/khách điền 6 block trong BRIEF-INTAKE.md (5–15')
          + block 7 (optional): declare attachments — skill addon / docs / GitHub repo
            (path/URL only, KHÔNG paste content)
       4. cp _shared/templates/project/* vào đó (skip BRIEF-INTAKE.md đã có)
       5. Nếu có attachments: copy file vào _attachments/docs/, append _refs.yaml,
          tạo .agents/{addon}.md, declare ở _meta.json.attachments[]
          Spec: _shared/standards/project-attachments.md
       6. Ra lệnh "Dispatch P0.1 với BRIEF-INTAKE.md"
          → P0.1 sanitize + parse → P0.2 R-Match → P0.2b gap pre-scan
          → P0.2c attachment intake (PII + license + size + sha256 verify)
          → P0.3 team assembly → P0.4 generate brief → P0.5 CEO confirm
       7. CEO review 00-intake.md §11 + approve → P1 start

Day 3-4 P1 DISCOVERY (4 agents parallel)
       R-α (SOTA research) + R-β (tech stack) + R-D06 (logistics domain)
       + R-MLE (ML feasibility) → R-σ consolidate → discovery-report.md
       R-eval Layer 2 chấm 8.7 ✅
       Layer 3 harness compliance check ✅
       CEO sign

Day 5  P2 PROPOSAL
       R-γ feasibility 78/100 GO → R-σ proposal.pdf + SOW + DPA bundle

Day 6-12  WAIT (client review)

Day 13  G1 SIGNED — 50% deposit $750

Day 14-25 SPRINT A delivery (P0-P2 outputs polished)

Day 26 P9 RETRO
       99-retro.md với Harness Health section
       → memory promotion candidates → knowledge/staging/
       → permanent-fix promote candidates queue

Day 30+ P10 LONG-TERM
       Day-60 NPS check, Day-90 expansion review
       (E0-E3 nếu 🟢 health)
```

**Mỗi agent dispatch** đi qua W04 runbook 13 bước:
1. 6 pre-checks (rules + harness valid)
2. Load 4-tier context (T1 stable → T4 dynamic, cache 70%+)
3. Build prompt + dispatch
4. Eval 3 layers (structural + R-eval + harness compliance)
5. Human review
6. Commit + state update

→ **Mỗi turn = traced. Mỗi failure = permanent-fix entry. Mỗi insight = memory promotion candidate.**

---

## 5. Top 5 critical rules (3 phút)

Anh KHÔNG cần nhớ tất cả 16 invariants + 11 rule files. Chỉ 5 này quan trọng nhất:

| # | Rule | Ý nghĩa |
|---|---|---|
| 1 | **R-MAS-01 Single source of truth** | Mỗi concept ở 1 file canonical. Khác chỉ link, không copy. |
| 2 | **R-MAS-06 Anti-hallucination** | Agent cite hoặc nói "I don't know". KHÔNG bịa số liệu/citation. |
| 3 | **R-MAS-07 Cost discipline** | Mọi agent run trong cap. Hard block 100%, không soft warning. |
| 4 | **R-MAS-09 Human gates** | Mỗi phase có human checkpoint. Engine MUST pause + emit `awaiting_human`. |
| 5 | **R-MAS-16 Framework read-only** | Mid-engagement KHÔNG ghi `_shared/` `knowledge/data/` `experience/`. Project-specific đi `projects/{id}/`. |

→ Vi phạm = output revoke. Conflict giữa rules → master thắng.

---

## 6. Reading Pipeline — đọc gì kế tiếp? (5 phút)

> **Linear sequence**, KHÔNG phải multi-track. Mọi người mới đi cùng path đến hết Step 10. Sau đó branch theo role.

### 🔵 PRIMARY PIPELINE — Core ~3 giờ (mandatory cho ALL newcomers)

```
☐ Step 1   START-HERE.md (file này)                          30'
              ↓
☐ Step 2   PROJECT.md                                        15'
              "Token-optimal wrapper. Routing tables."
              ↓
☐ Step 3   01-FRAMEWORK.md                                   15'
              "5-layer philosophy + studio boundary chi tiết."
              ↓
☐ Step 4   00-OPERATING-MANUAL.md                            30'
              "5 paths A/B/C/D/E. Khi có input mới đi đâu."
              ↓
☐ Step 5   _shared/prompts/AGENT-MANUAL.md                   20'
              "Agent operating model. Read once, internalize."
              (Skip nếu là pure business role)
              ↓
☐ Step 6   experience/.../workflows/W03-new-project-walkthrough.md  5'
              "Cross-pipeline MAP. Day 0 → Day 90+."
              ↓
☐ Step 7   experience/.../pipeline/README.md                 10'
              "Phase index P0-P10 + Path A/B/C/D."
              ↓
☐ Step 8   experience/.../workflows/W04-agent-dispatch-runbook.md   30'
              "13-step dispatch runbook. Mỗi lần invoke agent."
              (Skip nếu pure business role; skim nếu COO)
              ↓
☐ Step 9   _shared/rules/00-MASTER-RULES.md                  10'
              "16 invariants. Constitution."
              ↓
☐ Step 10  _shared/standards/glossary.md                      5'
              "Authoritative terminology. Lookup khi gặp jargon."
              ↓
       ✅ CORE COMPLETE (~3h). Anh ready to start project.
```

→ **Self-check**: nếu hiểu §11 Final checklist (10 items) ≥ 8/10 ☑ → core done. Branch theo role.

### 🟢 BRANCH 1 — Sau core, role = Dev / CTO (~3h thêm)

```
☐ Step 11  ONBOARDING.md (Day 1-5 plan technical track)      30'
☐ Step 12  _shared/rules/80-harness-rules.md                  30'  ← R-HRN-01..17 (v1.2)
☐ Step 13  _shared/rules/90-lifecycle-rules.md                20'  ← demote/sunset/multi-path
☐ Step 14  _shared/rules/100-orchestration-rules.md           20'  ← tiebreak/handoff QA
☐ Step 15  _shared/standards/learning-system.md               20'  ← framework continuous evolve
☐ Step 16  _shared/standards/output-validation.md             15'  ← 4-layer eval gate
☐ Step 17  _shared/standards/input-sanitization.md            15'  ← prompt injection defense
☐ Step 18  _shared/standards/drift-detection.md               15'  ← daily ops
☐ Step 19  Tier-2 ops skill cards (R-LLMOps + R-SRE + R-DataOps)   30'
☐ Step 20  1 skill card relevant role (R-α / R-MLE / R-AE...)      20'
```

### 🟡 BRANCH 2 — Sau core, role = COO / Sales / CS (~3h thêm)

```
☐ Step 11  business-strategy/12-sales-playbook.md             30'  ← BANT+Fit + objections
☐ Step 12  business-strategy/14-customer-success-playbook.md  30'  ← Day-60/90/QBR
☐ Step 13  pipelines-business/sales/ (S0-S5 skim)             30'
☐ Step 14  pipelines-business/marketing/ (M0-M5 skim)         30'  ← lead gen funnel
☐ Step 15  pipelines-business/expansion/ (E0-E3)              20'  ← offensive expand
☐ Step 16  pipelines-business/partnership/ (BD0-BD4 skim)     20'  ← BD types
☐ Step 17  pipelines-business/customer-success/ (CS0-CS3)     20'
☐ Step 18  _shared/standards/pricing-decisions.md             15'  ← when raise/discount
☐ Step 19  _shared/templates/legal/DPA-template.md            10'
☐ Step 20  _shared/templates/legal/NDA-template.md            10'
```

### 🟠 BRANCH 3 — Sau core, role = CEO / Founder (~2h thêm)

```
☐ Step 11  business-strategy/01-strategy-overview.md          20'
☐ Step 12  business-strategy/02-customer-segments.md          20'  ← ICP A-E
☐ Step 13  business-strategy/03-goals-and-roadmap.md          20'  ← KPI + phase plan
☐ Step 14  business-strategy/09-phase1-execution-plan.md      20'  ← 90-day execution
☐ Step 15  studio/wisdom/ (read all — internal context)       30'  ← voice + churn + hot takes
☐ Step 16  _shared/.agents/tier-0-executive/CEO-charter.md    10'
```

### 🟣 BRANCH 4 — Sau core, role = Designer / Researcher (~2h thêm)

```
☐ Step 11  knowledge/INDEX.md                                 15'  ← 15 baselines × 20 industries lite
☐ Step 12  business-strategy/04-capability-catalog.md         20'
☐ Step 13  experience/.../pipeline/P1-DISCOVERY.md            15'  ← research phase
☐ Step 14  experience/.../pipeline/P4-DESIGN.md               15'  ← design phase
☐ Step 15  _shared/templates/project/04d-ui-spec.md           10'
☐ Step 16  R-Match + R-α + R-σ skill cards                    30'
☐ Step 17  business-strategy/16-brand-content-kit.md          15'  ← voice
```

### 📊 Reading time summary

| Profile | Core | Branch | Total |
|---|---|---|---|
| Anyone (minimum) | 3h | — | **3h** |
| Dev / CTO | 3h | +3h | 6h |
| COO / Sales / CS | 3h | +3h | 6h |
| CEO / Founder | 3h | +2h | 5h |
| Designer / Researcher | 3h | +2h | 5h |

→ KHÔNG đọc cả 4 branches. Pick 1 theo role chính.

### 🤖 Special — AI Agent newcomer (different path)

Agent KHÔNG đọc tuần tự human. Engine inject 4-tier context per dispatch (per W04 §2 + R-HRN-10).

Agent đọc **once at first invoke**:
1. RULES-PREAMBLE.md (auto-injected runtime, 16 invariants + harness/orc/lcy contracts)
2. AGENT-MANUAL.md (read-once internalize operating model)
3. Own skill card (job description)

Sau đó per-dispatch nhận context auto-loaded. Agent KHÔNG cần đọc 20 file như human.

---

## 6.5 Old-format alternatives (nếu anh muốn time-box)

KHÔNG recommend default — chỉ liệt kê nếu anh có hard time constraint:

### Nếu chỉ 1 GIỜ — minimum viable
```
Step 1 + Step 2 + Step 3 only (START-HERE + PROJECT + 01-FRAMEWORK)
→ Hiểu studio identity + 5-layer. Đủ converse, KHÔNG đủ start project.
```

### Nếu chỉ 30 PHÚT — emergency brief
```
Step 1 only (START-HERE) — đọc kỹ.
→ Hiểu basics. Phải đọc rest sớm.
```

---

## 6.9 Bonus — branch selection guide

Câu hỏi xác định role nếu anh không chắc:

| Câu hỏi | Answer | Branch |
|---|---|---|
| Tôi sẽ dispatch agent / write skill cards / debug eval? | yes | **Branch 1 Dev/CTO** |
| Tôi sẽ outbound / qualify / close deal / handle CS? | yes | **Branch 2 COO/Sales** |
| Tôi sẽ quyết strategy / pricing / hiring / partnerships? | yes | **Branch 3 CEO** |
| Tôi sẽ research / design / domain expert? | yes | **Branch 4 Designer** |
| Tôi đa-role overlap (founder cò 3 hat)? | yes | Read Branch 1 + 3 (most common combo) |

---

## 7. Để start project hôm nay — 6 bước cụ thể (5 phút)

### Pre-flight (1 lần setup, 1h)
```bash
# 1. Studio identity decided?
- Pick: serve consulting / own products / hybrid
- Lock vào business-strategy/01-strategy-overview.md (1 line)

# 2. Legal floor (5 checks)?
- Vietnam company entity registered?
- Stripe/Wise payment infrastructure ready?
- DPA template reviewed (legal counsel)?
- VN compliance checklist run (compliance/vn.md)?
- Secrets management setup (Doppler/1Password)?

# 3. First brand assets?
- Domain registered, social handles
- Email + LinkedIn studio profile
```

### Khi inbound đầu tiên đến — concrete action
```bash
# Step 1: P3 receive lead (LinkedIn/email)
# Step 2: P3 book discovery call (Calendly)
# Step 3: 30-min call → BANT+Fit per business-strategy/12 §3

# Step 4: Bootstrap project folder
mkdir projects/P-202605-001-{client-slug}/
cp -r _shared/templates/project/* projects/P-202605-001-{client-slug}/

# Step 5: Fill _meta.json
- framework_version: v1.1
- harness_profile: L1 (default cho Sprint A)
- knowledge_match: TODO (R-Match populate ở P0.2)
- voice.client_facing: voice_b_business

# Step 6: Init _state.json
- lifecycle.current_phase: P0
- gates.G1_proposal_signed.status: pending

# Step 7: Register projects/_ops/active-paths.json

# Step 8: Dispatch R-Match (P0.2) → R-BA (P0.4) per W04 runbook
#
# ⚠️ Engine MVP chưa build. Hiện manual orchestration:
- Open Claude.ai web tab
- Paste: RULES-PREAMBLE + R-Match skill card + brief
- Receive classify-match.json
- Human review classification
- Then dispatch R-BA same pattern
#
# Khi engine ship (Phase 2), command sẽ là:
#   $ studio dispatch P-202605-001 R-Match
#   $ studio dispatch P-202605-001 R-BA
```

→ Day 1 productive. Day 5 first proposal sent.

---

## 8. Where to look for X — quick lookup (3 phút)

> ⭐ **Cookbook đầy đủ 40 use cases × 8 nhóm**: `HOW-TO.md` (root). Section này là extract gọn — nếu không thấy task của anh ở đây, mở HOW-TO.

| Cần làm gì? | Đọc file nào? |
|---|---|
| ⭐ Tra cứu task → file (cookbook) | **`HOW-TO.md`** (root) |
| Hiểu tổng quan studio | `PROJECT.md` |
| Hiểu sâu philosophy 5-layer | `01-FRAMEWORK.md` |
| Hiểu 5 paths | `00-OPERATING-MANUAL.md` |
| Dispatch 1 agent | `experience/.../workflows/W04-agent-dispatch-runbook.md` |
| Hiểu phase X (P0, P1, ...) | `experience/.../pipeline/P{N}-*.md` |
| Hiểu agent X (R-α, R-MLE, ...) | `_shared/.agents/tier-{N}/{agent-id}.md` |
| Bắt đầu dự án mới | `_shared/templates/project/README.md` + `harness/` |
| Pricing / SOW | `business-strategy/10-pricing-sheet.md` + `_shared/templates/project/02-sow.md` |
| Eval gate | `_shared/eval/SPEC.md` + `_shared/standards/output-validation.md` |
| Rule cụ thể | `_shared/rules/{NN}-*.md` (00 → 100) |
| Knowledge baseline / industry | `knowledge/data/baselines/B0X.json` hoặc `industries/I0Y.json` |
| Knowledge taxonomy index | `knowledge/INDEX.md` |
| Tất cả docs studio ship | `_shared/standards/document-catalog.md` |
| **Map 43 framework README (single-load nav)** | **`STRUCTURE-README.md`** (root, peer file này) |
| **Add new folder / README / standard file** | **`_shared/standards/change-management.md`** §5.4 (mandatory checklist + frontmatter spec + ≥3 inbound refs rule) |
| Glossary thuật ngữ | `_shared/standards/glossary.md` |
| Voice contract | `studio/wisdom/voice-registry.yaml` + `_shared/standards/boundaries.md` §2 |
| VN compliance (PDPA + NĐ 13) | `_shared/standards/compliance/vn.md` |
| Sự cố Sev 0/1/2 | `experience/.../workflows/W05-incident-response.md` + `_shared/standards/incident-severity.md` |
| Quarterly framework retro | `experience/.../workflows/W08-framework-retro.md` |
| Cách framework học từ project | `_shared/standards/learning-system.md` |
| **Thêm/sửa/bớt agent/knowledge/rule/workflow (PROPAGATION CHECKLIST)** | `_shared/standards/change-management.md` |

→ KHÔNG biết tìm đâu? Mở `PROJECT.md` §5 routing table OR `_shared/standards/document-catalog.md`.

---

## 9. When stuck — escalation (1 phút)

| Tình huống | Action |
|---|---|
| Không biết rule nào áp dụng | Đọc `_shared/rules/00-MASTER-RULES.md` (1 trang) |
| Không biết phase kế tiếp | Check `_state.json.lifecycle.current_phase` + phase doc |
| Doc cũ vs doc mới conflict | Doc có `last_updated` mới hơn thắng. Update doc cũ ngay. |
| Cần thay đổi scope | Viết SCR (`_shared/templates/project/SCR-template.md`), KHÔNG edit SOW |
| Agent fail eval 2 lần | Permanent-fix entry → escalate CTO |
| Sự cố Sev 0/1 | W05-incident-response.md ngay |
| Framework gap nhỏ thấy được | Log vào project's `harness/permanent-fixes.md`, KHÔNG fix framework mid-engagement |
| Confusion authority "ai sign cái gì" | Decision rights matrix (chưa có vì 3 founders solo-decide) — hỏi trực tiếp |
| Hoàn toàn lost | Quay lại file này (`START-HERE.md`) đọc lại §6-§8 |

---

## 10. 3 mental models để nhớ

```
1. "Agent = Model + Harness."
   Studio's competitive moat KHÔNG phải model. Là harness.

2. "Framework = wrapper. Project = occupant. Agent = employee."
   Framework folders READ-ONLY mid-engagement.
   Project-specific deviation đi vào projects/{id}/.

3. "Self-evolving system. Failure → permanent-fix → next project rẻ hơn."
   Càng chạy nhiều project, framework càng giỏi.
   Quarterly W08 retro promote rules across projects.
```

---

## 11. Final checklist — anh đã hiểu chưa?

Đánh dấu ☑ nếu hiểu, ☐ nếu cần đọc lại:

- [ ] Studio's identity (boutique consultancy + agentic engine, 5-layer + studio boundary)
- [ ] Quy tắc vàng (Knowledge feeds Engine, Engine produces outputs, Business decides, Loop updates Knowledge)
- [ ] Agent = Model + Harness — moat ở harness
- [ ] 5 paths (A/B/C/D/E) khi có input mới
- [ ] Phase pipeline P0-P9 + P10 long-term
- [ ] 6 tier agents (T0 charter / T1 research / T2 engineering / T3 domain / T4 delivery / T5 business)
- [ ] 11 rule files (anchors: MAS, HRN, LCY, ORC)
- [ ] Top 5 critical rules (R-MAS-01/06/07/09/16)
- [ ] How a project flows Day 0 → Day 30+
- [ ] What to do today nếu lead inbound đến

→ Nếu ≥ 8/10 ☑ — anh ready to start.
→ Nếu < 8/10 — đọc lại §2-§4 và §7.

---

## 12. Action ngay sau khi đọc xong

```
1. Confirm legal floor (8 ops checks per §7)
2. Confirm studio identity 1-line (per §7 pre-flight)
3. Pick mode:
   ☐ Dry-run với fake brief (no client risk, learn framework)
   ☐ Outbound real (LinkedIn ICP-B 30 connection requests/day)
4. Block calendar 30 min/Friday cho weekly retro (W02)
5. Block calendar quarterly cho framework retro (W08)
```

---

## Cross-References

- Wrapper ngắn: [`PROJECT.md`](PROJECT.md)
- Framework deep: [`01-FRAMEWORK.md`](01-FRAMEWORK.md)
- 5 paths flow: [`00-OPERATING-MANUAL.md`](00-OPERATING-MANUAL.md)
- 5-day onboarding plan: [`ONBOARDING.md`](ONBOARDING.md)
- Agent operating model: [`_shared/prompts/AGENT-MANUAL.md`](_shared/prompts/AGENT-MANUAL.md)
- Document catalog (everything studio ships): [`_shared/standards/document-catalog.md`](_shared/standards/document-catalog.md)
- Glossary: [`_shared/standards/glossary.md`](_shared/standards/glossary.md)

---

*START-HERE v1.0 — Adopted 2026-04-28. Đọc 30 phút → ready to onboard.*
