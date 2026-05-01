# knowledge/data/raw/ — Raw Sources

**Parent**: [`@../../README.md`](../../README.md)

---

## Mục đích

Lưu **raw source materials** chưa qua xử lý:
- Industry taxonomies (input cho `industries/I0X.json`)
- Research dumps (papers, articles bulk-collected)
- Client briefs (anonymized, for pattern study)
- External datasets (CSV / parquet referenced by baselines)

→ Là *upstream* của `baselines/`, `industries/`, `matrix/`. Sau khi process bởi R-α/β/γ → data structured được lưu ở 3 folder kia.

---

## Filing Rules

- **Read-only** sau khi commit (immutable inputs)
- File name: `{type}-{source}-{YYYY-MM}.{ext}`
- Large files (> 10MB) → external storage; `*.metadata.md` here references it
- Sensitive data (client raw) → encrypted hoặc stored separately

---

## Examples

```
raw/
├── industry-taxonomy.txt              ← upstream cho I01-I20
├── papers-B10-agentic-2025.bib        ← BibTeX dump cho B10 research
├── client-briefs-anonymized/          ← pattern study
└── external-datasets/
    └── transport-logistics-2024.csv.metadata.md  ← references S3/Drive
```

---

## Cross-References

- Schema: [`@../../docs/DATA-SCHEMA.md`](../../docs/DATA-SCHEMA.md)
- Processed baselines: [`@../baselines/README.md`](../baselines/README.md)
- Processed industries: [`@../industries/README.md`](../industries/README.md)
- Re-research prompt: [`@../../../_shared/prompts/RE-RESEARCH.md`](../../../_shared/prompts/RE-RESEARCH.md)

---
*Last updated: 2026-04-26*
