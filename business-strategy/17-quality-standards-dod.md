# Quality Standards & Definition of Done

**Mục đích:** Định nghĩa "good" và "shippable" cho mọi loại deliverable. Mọi work qua DoD này trước khi mark "done".

**Quy tắc vàng:** *"DoD là contract giữa team với chính team — và với khách. Không pass DoD = không ship."*

---

## 1. DoD philosophy

### 1.1 Why DoD matters

- **Consistency** — 3 founders + agents + freelance hiểu cùng 1 quality bar
- **No surprises** — khách nhận deliverable predictable
- **Eval gate** — bug/regression catch sớm
- **Learning loop** — DoD update sau mỗi project retro

### 1.2 DoD vs Acceptance criteria

| | DoD | Acceptance criteria |
|---|---|---|
| Scope | Generic, applies to all of this kind of work | Specific to this 1 deliverable |
| Owner | Team standard (this file) | Per-task, in proposal/SOW |
| Mutable | Updated quarterly | Negotiated per project |
| Example | "Markdown valid + spell-checked" | "Report includes ≥ 5 specific use cases for client X" |

**Both must pass before ship.**

---

## 2. Universal DoD (any deliverable)

| Check | Detail |
|---|---|
| ✅ **Authored** | Owner identified, date stamped |
| ✅ **Reviewed** | At least 1 founder OR agent (R-eval) reviewed |
| ✅ **Spell + grammar** | VN + EN sections both, checked (Grammarly or AI) |
| ✅ **Format consistent** | Per file 16 brand kit |
| ✅ **Citations checked** | Every fact/number/quote sourced |
| ✅ **Links valid** | All URLs resolve (no 404) |
| ✅ **Confidential ≠ public** | Internal info not in public-facing |
| ✅ **Stored in right location** | Per file 13 §3 folder structure |
| ✅ **Memory entry created** | If learning generalizable, save to MAESTRO memory |

---

## 3. Per-deliverable DoD

### 3.1 Discovery report (P1)

| Check | Standard |
|---|---|
| Length | 1500–4000 từ |
| Sections | Problem deep-dive | SOTA landscape | Recommended approach | Risk + mitigation | Data requirements | Cost estimate |
| SOTA references | ≥ 5 verifiable papers/articles 2023–2026 |
| Risk section | ≥ 5 risks, each with likelihood + impact + mitigation |
| Cost estimate | +/- 20% of actual delivery cost |
| Vietnamese context | If VN client, ≥ 2 VN-specific considerations |
| Eval | R-eval LLM-judge ≥ 7.5 |
| Forbidden | Fabricated citations, "as an AI language model", generic recommendations |

### 3.2 Proposal (P2)

| Check | Standard |
|---|---|
| Length | 5–10 trang client-facing PDF + 1-page exec summary |
| Sections per file 12 §5 template | All present |
| Pricing | Within file 10 ranges |
| Validity | 14-day clear |
| Personalization | Client name + specifics ≥ 5 references trong text |
| Out of scope | Explicit list ≥ 3 items |
| Next steps | Clear deadline + countersign instruction |
| Internal review | P3 polish + CEO technical sign-off |

### 3.3 Architecture doc (P3)

| Check | Standard |
|---|---|
| Diagram | High-level + detailed component diagram |
| Components | Each has rationale (≥ 1 sentence why this choice) |
| Tech stack | Versions specified, license noted |
| Failure modes | ≥ 5 documented + mitigation |
| Scaling | Capacity for 10x current load addressed |
| Eval | R-SA agent eval ≥ 7.5 |
| CEO sign-off | Technical correctness verified |

### 3.4 API design (P4a)

| Check | Standard |
|---|---|
| Endpoints | All listed with method, path, auth |
| Request/response | Schema specified (OpenAPI YAML) |
| Auth | Method + token strategy clear |
| Rate limiting | Defined |
| Error codes | All 4xx/5xx documented |
| Versioning | Strategy specified |
| Backward compat | Deprecation rules |

### 3.5 DB schema (P4b)

| Check | Standard |
|---|---|
| ER diagram | Included |
| Tables | All with PK, FK, indexes |
| Constraints | NOT NULL, UNIQUE, CHECK explicit |
| Migration | From-current-state plan if existing system |
| Sample data | ≥ 5 rows per table for testing |
| Audit fields | created_at, updated_at on every row table |

### 3.6 ML algorithm spec (P4c)

| Check | Standard |
|---|---|
| Algorithm choice | Justified vs ≥ 2 alternatives |
| Training data | Requirements specified (volume, quality, bias) |
| Eval metrics | Defined + threshold (precision/recall/MAE/etc.) |
| Inference latency | Target specified |
| Failure modes | Hallucination handling, edge cases |
| CEO validation | Personal sign-off (file 08 §2.4) |

### 3.7 UI design (P4d)

| Check | Standard |
|---|---|
| Page list | All listed |
| Component breakdown | Reusable components identified |
| User flow | Diagram for top 3 flows |
| Wireframes | Low-fi for all pages |
| Responsive | Mobile + desktop breakpoints |
| Accessibility | WCAG AA target stated |

### 3.8 Project plan (P5)

| Check | Standard |
|---|---|
| Sprints | 2-week sprint breakdown |
| Milestones | M1/M2/M3 dates |
| RACI | Per task, owner clear |
| Dependencies | Mapped (no circular) |
| Risk register | ≥ 5 risks |
| Budget | Per sprint cost estimate |

### 3.9 Dev guides (P6)

| Check | Standard |
|---|---|
| Onboarding test | New engineer ramps in 1 day |
| Setup | Local dev environment instruction works |
| Conventions | Formatting + naming + error + logging |
| Code review checklist | Actionable items |
| Sample stub | Skeleton code for each component |

### 3.10 QA test plan (P7)

| Check | Standard |
|---|---|
| Coverage | Unit + integration + e2e per layer |
| Golden test set | ≥ 20 cases for AI components |
| Regression suite | Runnable in CI |
| Performance | Benchmarks defined + measurable |
| Security | OWASP basic check |
| Accessibility | If UI |

### 3.11 Deployment plan (P8)

| Check | Standard |
|---|---|
| Day-0 plan | Deploy steps |
| Day-1 plan | Smoke test + rollback condition |
| Day-7 plan | Monitoring tuning |
| Runbook | ≥ 10 common ops |
| Monitoring | Cost + latency + error + eval drift alerts |
| DR | Backup + restore tested |

### 3.12 Final delivery package (P9)

| Check | Standard |
|---|---|
| All deliverables zipped | Notion view + PDF + repo links |
| Recordings | Training sessions ≥ 1, walked through |
| Sign-off form | Client signed |
| Final invoice | Sent + paid |
| Retro doc | Internal complete |
| MAESTRO memory updated | New learnings captured |
| Case study | Drafted (if Founding Customer) |

---

## 4. Per-content DoD

### 4.1 LinkedIn post (P3)

| Check | Standard |
|---|---|
| Hook | First line ≤ 70 chars, attention-grabbing |
| Length | 800–2500 chars (LinkedIn algo sweet spot) |
| Format | Line breaks every 2–3 sentence |
| CTA | 1 clear action (comment, DM, link) |
| Hashtag | 3–5 relevant, not spam |
| Image (if any) | 1080×1350, brand template |
| Brand line | Footer 1 line |
| Spell-check | Pass |
| Voice | Voice B (file 16 §2.2) |

### 4.2 TikTok video (freelance)

| Check | Standard |
|---|---|
| Hook 0–3s | Visual + text + audio attention-grab |
| Length | 30–90 giây |
| Captions | Vietnamese auto, manually corrected |
| CTA | End-screen + bio link |
| Sound | Trending OR original (50/50) |
| Brand presence | Subtle (logo or color) |
| Voice | Voice C (file 16 §2.3) |
| Posting | Bio link updated to relevant offer |

### 4.3 YouTube long-form (CEO)

| Check | Standard |
|---|---|
| Hook 0–60s | Promise + preview |
| Length | 8–15 phút |
| Title | SEO + curiosity gap, ≤ 70 chars |
| Description | 200+ words, timestamp, links |
| Thumbnail | Brand template + face if face-on-camera |
| Captions | Vietnamese auto-gen, manually reviewed |
| EN auto-subs | YouTube auto + reviewed |
| Pinned comment | CTA + Substack/OSS link |
| Voice | Voice A (file 16 §2.1) |

### 4.4 Substack newsletter (CEO)

| Check | Standard |
|---|---|
| Length | 800–1500 từ main section |
| Bilingual | VN main + EN translation reviewed |
| Code blocks | Syntax-highlighted, runnable |
| Images | Hero + ≥ 1 in-article |
| Links | ≥ 3 to MAESTRO/OSS/YouTube |
| Subject line | A/B test option (Beehiiv supports) |

### 4.5 X (Twitter) thread (CEO)

| Check | Standard |
|---|---|
| Tweet 1 | Hook ≤ 280 chars, no link |
| Length | 8–12 tweets |
| 1 idea per tweet | No run-on |
| Code/screenshot | ≥ 2 image in thread |
| Last tweet | CTA + link to long-form |
| Engagement | Reply game first 24h |

### 4.6 Niche audit report (P3 + agents)

| Check | Standard |
|---|---|
| Length | 8–15 trang PDF |
| Cover | Brand template |
| TOC | Auto-gen |
| Use cases | ≥ 10 specific, sorted by ROI |
| Per use case | Pain | Solution | Cost estimate | ROI estimate | Effort |
| References | ≥ 5 sources verified |
| Anonymized examples | If using client data |
| CTA | "Book free 30-min consultation" + Calendly |
| Gated | Email capture before download |

---

## 5. Per-code DoD

### 5.1 Pull request (P2 owns)

| Check | Standard |
|---|---|
| Description | Why + what + how |
| Tests | Pass + new tests for new code |
| Type check | Mypy strict / TypeScript strict |
| Lint | Pass (Ruff / ESLint) |
| Format | Pass (Black / Prettier) |
| Doc updated | If API/behavior change |
| Changelog | Updated for user-facing change |
| Eval | If touches agent prompt, eval delta ≥ 0 |
| Reviewer | ≥ 1 founder or auto-merge if minor (typo) |

### 5.2 Agent prompt change (CEO owns)

| Check | Standard |
|---|---|
| Version bump | semver per file 07 §5.2 |
| Changelog | Per file 07 §5.4 |
| Golden test | Run vs baseline |
| Eval delta | ≥ +0.3 avg score |
| Cost delta | ≤ +5% (or justified) |
| Rollback condition | Specified |

### 5.3 OSS commit (CEO owns)

| Check | Standard |
|---|---|
| Tests | Pass CI |
| Bilingual examples | If new feature |
| Doc | Updated |
| Breaking change | Major version bump, migration guide |
| Issue link | If fixing reported issue |

---

## 6. Per-customer-deliverable DoD

### 6.1 Sprint A delivery (Discovery + Proposal)

| Check | Standard |
|---|---|
| Discovery report | Per §3.1 |
| Proposal | Per §3.2 |
| Executive summary | 1 page, scannable |
| SOW | Ready to sign |
| Estimated invest | Within ±10% of actual |
| Client review | Walk-through call done |
| Acceptance | Client signed acceptance OR feedback action items |

### 6.2 LLMOps Audit delivery (ICP-E, 1 week)

| Check | Standard |
|---|---|
| Cost analysis | Current spend breakdown + identified savings ≥ 30% |
| Eval gap analysis | Current state + recommended state |
| Prompt versioning audit | Current state + recommendation |
| Memory hygiene | Current + recommendation |
| Failure modes | Top 5 risks with fix |
| Implementation roadmap | 90-day plan, prioritized |
| Cost estimate (us) | Cost Sprint quote ready |
| Refund condition met | ≥ $1K/mo savings identified OR refund 50% |

---

## 7. DoD review process

### 7.1 Self-check

Author runs DoD checklist before requesting review.

### 7.2 Peer review

| Deliverable type | Reviewer |
|---|---|
| Code | P2 (or CEO if AI/eval) |
| Agent prompt | CEO |
| Discovery/Proposal | P3 (polish) + CEO (tech) |
| Architecture/Design | CEO |
| Content | P3 (LinkedIn, audit) | CEO (technical) | freelance auto-publish (TikTok, after 5 trial review) |
| Pricing/SOW | P3 + CEO |
| Customer-facing | P3 + at least 1 founder |

### 7.3 Eval gate (for agent output)

R-eval (when available) auto-scores. If < 7.5, retry với feedback. After 3 retries fail → escalate to human.

### 7.4 Escalation

If DoD fail repeatedly (3x):
- Author + reviewer 1-1 to identify root cause
- Update DoD if standard unclear
- Update prompt if agent issue
- Coaching if author capability gap

---

## 8. Quality metrics — track monthly

| Metric | Target | Measure |
|---|---|---|
| % deliverable pass DoD first try | ≥ 80% | Monthly retro |
| % R-eval ≥ 7.5 first try | ≥ 80% | Eval dashboard |
| % client deliverable revision needed | ≤ 20% | Per project |
| Critical bug post-delivery | 0 / month | Incident log |
| Content publish on schedule | ≥ 90% | Calendar |
| Content engagement ≥ baseline | ≥ 70% of posts | Channel analytics |

**Trigger for action:**
- Pass-first-try < 60% → DoD review session, identify gaps
- Eval < 7.5 for 2 weeks → freeze new agent, fix prompt
- Bug in delivery → P0 incident response per file 15 §8.2

---

## 9. DoD evolution

DoD is a **living document**. Update triggers:

1. **Post-project retro** — new failure mode found → add criterion
2. **Customer feedback** — quality complaint → tighten criterion
3. **New deliverable type** — add new section
4. **Quarterly review** — remove unused criteria, simplify

**Owner:** CEO maintains, P3 enforces.

**Cadence:** Updated end of each quarter.

---

## 10. Tóm tắt 1 trang

```
DoD = contract for "shippable". KHÔNG pass = KHÔNG ship.

UNIVERSAL (every deliverable):
  Authored | Reviewed | Spell+grammar | Format | Citations | Links
  Confidentiality | Storage location | Memory entry if generalizable

PER-DELIVERABLE:
  P1 Discovery: 1500-4000 từ, ≥5 SOTA refs, ≥5 risks, R-eval ≥ 7.5
  P2 Proposal:  per template file 12 §5, validity 14-day, P3+CEO sign-off
  P3 Arch:      diagram + rationale + ≥5 failure modes + CEO sign-off
  P4 Design:    per sub-phase (API/DB/ML/UI) detailed criteria
  P5 Plan:      sprints, RACI, dependency map, ≥5 risks
  P6 Guides:    new engineer onboards in 1 day
  P7 QA:        ≥20 golden tests, regression in CI
  P8 Deploy:    Day-0/1/7 plan, runbook ≥10 ops
  P9 Delivery:  client signed, retro done, MAESTRO memory updated

PER-CONTENT:
  LinkedIn: hook + 800-2500 chars + CTA + voice B
  TikTok:   hook 0-3s + 30-90s + CTA + voice C
  YouTube:  hook 0-60s + 8-15min + bilingual subs + voice A
  Substack: 800-1500 từ + bilingual + ≥3 links
  X thread: hook + 8-12 tweet + ≥2 image + CTA last
  Audit:    8-15p + ≥10 use case + ≥5 sources + gated

PER-CODE:
  PR:       desc + tests + type + lint + format + doc + reviewer
  Prompt:   semver + changelog + eval delta ≥+0.3 + cost ≤+5%
  OSS:      bilingual examples + doc + migration if breaking

REVIEW PROCESS: Self-check → Peer review → Eval gate (agent) → Escalate if 3x fail

METRICS MONTHLY:
  Pass-first-try ≥ 80% | R-eval ≥ 7.5 first try ≥ 80%
  Revision ≤ 20% | Critical bug 0/mo | Content schedule ≥ 90%

DoD EVOLVES quarterly. CEO owns, P3 enforces.
```
