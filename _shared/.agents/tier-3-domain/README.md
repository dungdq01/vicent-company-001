# Tier 3 — Domain Expert Agents

**Parent**: [`@../README.md`](../README.md) | **Roster**: [`@../TEAM-CONFIG.md`](../TEAM-CONFIG.md) §I + §III

**Mục đích**: 20 domain expert agents — 1 cho mỗi industry (R-D01 → R-D20). Provide industry-specific context, domain validation, regulatory awareness.

## Roster (TEAM-CONFIG §III)

| ID | Industry | ID | Industry |
|---|---|---|---|
| R-D01 | Retail & E-com | R-D11 | Legal |
| R-D02 | Finance & Banking | R-D12 | Media & Entertainment |
| R-D03 | Healthcare | R-D13 | Transportation |
| R-D04 | Manufacturing | R-D14 | F&B / Hospitality |
| R-D05 | Agriculture | R-D15 | Insurance |
| R-D06 | Logistics | R-D16 | Pharma |
| R-D07 | Energy | R-D17 | Gaming |
| R-D08 | Construction | R-D18 | Marketing/AdTech |
| R-D09 | Education | R-D19 | HR / Talent |
| R-D10 | Telecom | R-D20 | Cybersecurity |

## Approach — Single Template + Per-Industry Context

Thay vì 20 skill cards riêng (drift, duplicate effort), dùng **1 template** `R-Dxx-template.md` + **per-industry context loading** từ `knowledge/data/industries/I0X.json`.

→ Template + JSON = effective skill card cho R-D{N}. Maintain 1 template, scale to 20 industries free.

## Promote To Standalone Card

Khi 1 industry được serve nhiều (≥5 projects) → promote `R-D{N}.md` riêng với:
- Industry-specific failure modes
- Regulatory checklist (vd: HIPAA cho R-D03, GDPR cho R-D02)
- Calibration anchors per domain

Phase 1 không expect promotion. Phase 2-3 likely promote R-D06 (Logistics) và R-D02 (Finance).

## Cross-References
- TEAM-CONFIG: §III industry mapping
- Industry data: `@../../../knowledge/data/industries/`
- Pipeline invoke: P1 (discovery) parallel với T2

*Last updated: 2026-04-26*
