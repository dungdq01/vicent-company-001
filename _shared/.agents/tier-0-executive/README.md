# tier-0-executive/ — Executive Charters (Human-Owned)

**Parent**: [`@../README.md`](../README.md) (Agents registry)

---

## Mục đích

Tier 0 = **3 charter doc** (founder hats — human-owned) **+ 1 concierge agent** (R-CoS — automation lễ tân).

**Charter docs** định nghĩa accountability / authority / sign-off / KPI cho 3 founders. Mọi agent T1–T5 escalate về Tier 0 charters khi vượt quyền.

**R-CoS agent** giúp founder đỡ thao tác thủ công — invoke qua Claude Code, dispatch sub-agents per W04.

---

## Roster (3 founder hats + 1 agent)

| Role | File | Owner | Phạm vi |
|---|---|---|---|
| **CEO** | [`CEO-charter.md`](CEO-charter.md) | bạn (P1) | Vision · LLMOps moat · pricing · final tech sign-off · external face |
| **COO** | [`COO-charter.md`](COO-charter.md) | P3 | Delivery · operations · client success · finance ops · vendor mgmt |
| **CTO** | [`CTO-charter.md`](CTO-charter.md) | bạn / co-founder | Tech stack · agent maturity · eval framework · security · infra cost |
| **R-CoS** *(agent v1.0)* | [`R-CoS-chief-of-staff.md`](R-CoS-chief-of-staff.md) | Auto (Claude Code) | Front-desk concierge: intent → action mapper, dispatch orchestrator, status reporter. KHÔNG approve / mod rules / write deliverables |

> *Triumvirate Model* — 3 người chia 3 hat nhưng **shared engine + shared knowledge matrix**. Mỗi người sở hữu 1 vertical (P1 MMO, P2 E-commerce, P3 Logistic) song song với hat exec. R-CoS phục vụ cả 3.

---

## Charter Format

Mỗi file `*-charter.md` có sections:

1. **Identity** — ai giữ hat này
2. **Accountability** — KPI ownership (số đo cụ thể)
3. **Decision Rights** — quyết được gì không cần hỏi ai
4. **Sign-off Authority** — gate nào yêu cầu chữ ký
5. **Escalation Path** — khi nào / ai escalate vào, ra hướng nào
6. **Time Allocation** — phần trăm thời gian cho mỗi nhóm việc
7. **Anti-Patterns** — việc tuyệt đối không làm

---

## Decision Authority Matrix (RACI tóm tắt)

| Quyết định | CEO | COO | CTO |
|---|---|---|---|
| Vision / strategy update | **A** | C | C |
| Pricing change > 20% | **A** | C | I |
| Hire / fire | **A** | R | C |
| Adopt new framework / lib | C | I | **A** |
| Production deploy P8 | I | C | **A** |
| Client SOW > $10K | C | **A** | I |
| Client refund / churn save | C | **A** | I |
| Eval threshold change | I | I | **A** |
| Quarter OKRs | **A** | R | R |
| ADR (architecture decision) | I | I | **A** |
| Vendor / tool selection | C | **A** | C |
| Brand / content tone change | **A** | C | I |

`R = Responsible · A = Accountable · C = Consulted · I = Informed`

---

## Cross-References

| Need | Path |
|---|---|
| Personal development per founder | [`@../../../business-strategy/06-personal-development.md`](../../../business-strategy/06-personal-development.md) |
| Agent team development | [`@../../../business-strategy/07-agent-team-development.md`](../../../business-strategy/07-agent-team-development.md) |
| CEO LLMOps leverage | [`@../../../business-strategy/08-ceo-technical-leverage.md`](../../../business-strategy/08-ceo-technical-leverage.md) |
| Phase 1 execution | [`@../../../business-strategy/09-phase1-execution-plan.md`](../../../business-strategy/09-phase1-execution-plan.md) |
| Decision-making framework | [`@../../../business-strategy/15-business-operations.md:321`](../../../business-strategy/15-business-operations.md) |

---
*Last updated: 2026-04-26*
