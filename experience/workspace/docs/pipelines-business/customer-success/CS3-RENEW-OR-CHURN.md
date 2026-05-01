# CS3 — Renew, Expand, or Churn (Clean Exit)

> T-30 days before contract end OR red health → decide path.

**Canonical**: [`@../../../../../business-strategy/14-customer-success-playbook.md:157`](../../../../../business-strategy/14-customer-success-playbook.md) · `§7` (churn handling)
**Owner**: COO · **Agents**: R-CS + R-AM (renewal close)

---

## Three Paths

```
                Health + signal
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     GREEN         YELLOW          RED
   + signal      + on-fence      → CHURN SAVE
        │             │             │
        ▼             ▼             ▼
   EXPAND         RENEW         (24h response)
   (upsell)    (defend)             │
        │             │             ▼
        └─────┬───────┘        ┌────┴────┐
              ▼                Save?    Clean exit?
           NEW SOW              │          │
        (R-AM closes)          renew     refund?
                                          retro
```

## Engine Orchestration — Path A: Expansion (Green)

| Step | Agent | Action |
|---|---|---|
| A.1 | R-CS | T-45: identify expansion signal (volume, scope, persona) |
| A.2 | R-CS | T-30: expansion pitch deck |
| A.3 | R-AM | T-21: discovery call for expansion scope |
| A.4 | R-AM | T-14: SOW + new pricing |
| A.5 | R-AM + R-LEG | T-7: signature |
| A.6 | R-FIN | T-0: invoice + handoff to product P0 (new sub-project) |

## Path B: Standard Renewal (Yellow)

| Step | Agent | Action |
|---|---|---|
| B.1 | R-CS | T-30: send renewal notice + summary of value delivered |
| B.2 | R-CS + COO | T-21: 30-min "renewal sync" call |
| B.3 | R-AM | T-14: address concerns; pricing if changed |
| B.4 | R-AM | T-7: renewal SOW signed (or graceful exit) |

## Path C: Churn Save (Red Health)

Per `14-CS §7`:

| Step | Time | Action |
|---|---|---|
| C.1 | T+0 (red flagged) | R-CS escalates COO + CEO within 4h |
| C.2 | T+24h | Fact-find call (COO + client decision-maker) |
| C.3 | T+48h | Hypothesis the *real* reason (not stated reason) |
| C.4 | T+72h | One of: scope adjust · pause · partial refund · clean exit |
| C.5 | T+7d | Decision communicated, retro doc filed |

**Anti-pattern**: never beg, never discount > 20% to retain.

## Outputs
```
projects/{PROJECT_ID}/_cs/cs3/
├── path-decision.md          ← which path + rationale
├── expansion-proposal.md     ← path A
├── renewal-sow.md            ← path B
├── churn-save-plan.md        ← path C
└── churn-retro.md            ← if exited (per 14-CS §7 template)
```

## Definition of Done
- ✅ Decision made by T-7 (no auto-renew silence, no auto-churn drift)
- ✅ If churn: real reason captured (hypothesis ≠ stated)
- ✅ If expansion: scope tier matches `10-pricing`
- ✅ Action items + memory entry promoted to `knowledge/docs/memory/`

## Failure Modes
- **Beg-mode save**: > 20% discount → accept clean exit instead
- **Stated reason ≠ real reason**: enforce `14-CS §7` hypothesis section
- **Auto-renew silence**: every renewal needs explicit re-signature
- **Churn without retro**: hard block invoice closure

## Cross-References
- Churn handling: [`@../../../../../business-strategy/14-customer-success-playbook.md:211`](../../../../../business-strategy/14-customer-success-playbook.md)
- Expansion playbook: [`@../../../../../business-strategy/14-customer-success-playbook.md:157`](../../../../../business-strategy/14-customer-success-playbook.md)

---
*v1.0*
