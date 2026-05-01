---
file: pii-redaction
version: v1.0
last_updated: 2026-04-27
owner: R-DataOps + CTO
status: production
---

# PII Redaction Standard

> When real client data is used (in eval golden sets, in case studies, in retro examples), PII MUST be redacted. Standard defines what PII is, redaction methods, verification.

---

## 1. PII Categories

### Direct identifiers (always redact)
- Names (full + given + family)
- Phone numbers
- Email addresses
- Physical addresses
- Government IDs (CMND, CCCD, passport)
- Bank account numbers
- Credit card numbers
- Health insurance IDs
- License plates
- Biometric data
- IP addresses (when identifiable to individual)
- Social media handles (when not public-facing)

### Quasi-identifiers (consider in combination)
- Date of birth
- ZIP/postal code
- Gender + ethnicity + age range
- Occupation + employer + location
- Photographs containing recognizable face

→ K-anonymity ≥ 5 rule: combination must not uniquely identify within sample.

### Sensitive attributes (redact + flag)
- Health conditions
- Sexual orientation
- Religious affiliation
- Political opinions
- Criminal record
- Financial situation
- Trade union membership
- Genetic data

---

## 2. Redaction Methods

### Method A: Replacement with placeholder
```
Original: "Anh Hùng (0901234567, hung@gmail.com) ở 123 Lê Lợi, Q1"
Redacted: "[NAME] ([PHONE], [EMAIL]) ở [ADDRESS]"
```

Use when: structure preservation matters (eval golden sets need realistic shape).

### Method B: Synthetic generation
```
Original: "Anh Hùng" → Synthetic: "Anh Tuấn"
Original: "0901234567" → Synthetic: "0900000XXX" (preserves format, not identity)
```

Use when: realism + readability needed (case study, demo).

### Method C: Hashing (one-way)
```
Original: "0901234567" → Hashed: "sha256:a3f5..."
```

Use when: cross-record linkage needed but identity protected (e.g., dedup in dataset).

### Method D: Bucketing / generalization
```
Original DOB: "1991-03-15" → Bucketed: "early-30s" or "1990-1995"
```

Use when: aggregate stats matter, not individual.

### Method E: Full removal
Use when: PII not needed for purpose at all.

---

## 3. Per-Use-Case Mapping

| Use case | Default method | Notes |
|---|---|---|
| Eval golden set | Method B (synthetic) | Realism matters; keep distribution |
| Case study (published) | Method B + Method E for non-essential | Client also reviews + signs off |
| Internal retro | Method A | Brief, minimal — placeholder OK |
| Studio wisdom file | Method A | Per `boundaries.md` — anonymized |
| Audit / compliance evidence | Method C | Need to demonstrate dedup, etc. |
| Analytics report | Method D | Aggregate only |

---

## 4. Verification

After redaction, run verification BEFORE adding to staging/eval/case-study:

```bash
# Run PII scanner (planned tool: _shared/eval/pii-scan.sh)
pii-scan.sh path/to/redacted.md

# Manual sample: random 5 entries → human review
```

**Pass criteria**: 0 direct identifiers remaining, quasi-identifiers passing k-anon ≥ 5.

If fail → cannot publish/use; iterate redaction.

---

## 5. Tooling

### Phase 1 (manual + scripts)
- `pii-scan.sh` (regex scan): phone format, email pattern, VN national ID pattern, IBAN pattern, etc.
- Manual review of 5+ random samples
- 2nd reviewer (R-DataOps + R-σ) sign

### Phase 2+ (automated)
- LLM-based redactor with structured envelope
- Differential privacy for analytics
- k-anon enforcer for quasi-identifiers

Phase 1 is acceptable for initial projects; Phase 2 needed when volume > 1000 records / month.

---

## 5.5 Enforce hook for runtime logs (Tier S #6, v1.1)

**`projects/_ops/dispatch-log.jsonl`** logs append every dispatch — by default may contain client PII (name, email from `_meta.json`, contact info, brief excerpt).

**Mandatory redaction at write time** (NOT post-hoc):

```python
# Engine pseudo-code, dispatch-log writer
def write_dispatch_log(event):
    # 1. Redact direct identifiers BEFORE write
    event = pii_redact(event, mode="hashing")  # Method C — preserves linkage
    
    # 2. Specific fields ALWAYS hash (even if not flagged)
    if "client_email" in event: event.client_email = sha256(event.client_email)
    if "client_phone" in event: event.client_phone = sha256(event.client_phone)
    if "client_name" in event: event.client_name = first_initial_only(event.client_name)
    
    # 3. Brief excerpt — strip first
    if "brief_excerpt" in event:
        event.brief_excerpt = pii_redact(event.brief_excerpt, mode="placeholder")
    
    append_to_jsonl(event, "projects/_ops/dispatch-log.jsonl")
```

**Hard rule**: dispatch-log NEVER contains:
- Plaintext client email / phone / address / national ID
- Plaintext customer-end-user data (their messages, their PII)
- Brief content > 200 chars (truncate + hash for dedup)

**What's OK to log unredacted**:
- `project_id` (studio's internal ID)
- `agent_id`, `phase`, `cost_usd`, `duration_ms`
- `client_name` first-initial only ("A. Hùng" instead of "Anh Hùng")
- Coarse industry tag (e.g., "logistics") not specific company

**Verification**:
- R-DataOps weekly audit: sample 100 log entries → 0 PII detected
- Cron: `pii-scan.sh projects/_ops/dispatch-log.jsonl` daily

**Same rule applies to**:
- `projects/_ops/active-paths.json`
- `projects/_ops/resource-lock.json`
- All `harness/traces/*.jsonl` per project (project-scoped, lighter restriction but still redact PII)

Per VN PDPA + DPA template (§7) — logs are processor records, fall under retention + access rules.

---

## 6. Cross-Project / Cross-Client Pollution

Per `boundaries.md` §4:
- Project A's PII NEVER appears in Project B's golden set
- Even after redaction, structural pattern unique to one client (their SKU naming) → don't reuse
- One golden set per project unless explicit ADR

---

## 7. Failure Modes

| Failure | Detection | Recovery |
|---|---|---|
| Direct identifier slipped through | Scanner finds in sample | Re-redact + re-verify; Sev-2 incident |
| Quasi-identifier combination unique | k-anon < 5 | Bucket more aggressively or remove |
| Synthetic replacement is real person | "John Smith" used → matches actual person | Use truly synthetic generators (Faker) |
| Redaction breaks downstream use | Eval fail because lost too much info | Choose different method (B not A) |

---

## 8. Cross-References

- VN compliance: [`@./compliance/vn.md`](compliance/vn.md)
- Curation (real data in eval): [`@./knowledge-curation.md`](knowledge-curation.md) §4
- Boundaries (cross-project pollution): [`@./boundaries.md`](boundaries.md) §4
- DPA (consent for use): [`@../templates/legal/DPA-template.md`](../templates/legal/DPA-template.md)
- R-DataOps (audits): [`@../.agents/tier-2-engineering/R-DataOps-data-operations.md`](../.agents/tier-2-engineering/R-DataOps-data-operations.md)

---
*v1.0 — Adopted 2026-04-27.*
