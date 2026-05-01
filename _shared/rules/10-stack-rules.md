---
file: 10-stack-rules
version: v1.0
last_updated: 2026-04-26
owner: CTO
status: production
---

# Stack Rules — Approved Tech Stack & Anti-FOMO

> Mọi tech choice MUST follow allow-list. Thêm gì = ADR.

---

## R-STK-01 — Approved Stack (Phase 1)

Engine + product builds MUST use:

| Layer | Approved | Avoid (until ADR) |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) · React · TypeScript strict | SvelteKit · Remix (until eval delta proof) · Vue |
| **UI components** | shadcn/ui · Tailwind CSS · Lucide icons | Custom design systems · MUI · Chakra |
| **Backend / API** | Next.js API Routes · tRPC · REST | gRPC (only if scale demands) · GraphQL (heavy ops) |
| **Database** | Postgres · Drizzle ORM · pgvector | MongoDB · MySQL (legacy only) · DynamoDB (special-case) |
| **Cache / Queue** | Redis · BullMQ | RabbitMQ · Kafka (only at scale) |
| **LLM** | Claude (Sonnet/Haiku/Opus) · OpenAI (fallback) · open-weight via vLLM | Proprietary closed-weight without eval delta |
| **LLM ops** | Helicone · Langfuse · Anthropic Workbench | LangSmith (eval delta required) |
| **Vector / RAG** | pgvector · Qdrant | Pinecone (cost) · Weaviate (complexity) |
| **Hosting** | Vercel · Railway · Fly.io | AWS (only Sprint D+ scale/compliance) |
| **Storage** | Supabase Storage · S3 | Custom file servers |
| **Auth** | Clerk · NextAuth · Supabase Auth | **MUST NOT roll-your-own auth** |
| **Payments** | Stripe · Payoneer · local bank | Crypto (until ADR) |
| **Analytics** | Plausible · PostHog | GA4 (privacy concerns) |
| **Email** | Resend · Postmark | SendGrid (cost) |
| **Mobile** | React Native (Expo) · Flutter | Native unless niche need |

---

## R-STK-02 — Add Dependency Rule

Adding any new dependency (npm / pip / etc.) MUST:
1. Check if existing approved alternative covers 80%+
2. If new → ADR with: rationale · alternative considered · maintenance cost · security audit
3. CTO sign in ADR
4. Add to allow-list

> Auto-check: CI lint compares `package.json` diff vs allow-list; new entry → ADR ID required.

---

## R-STK-03 — LLM Model Selection

Per task, use *cheapest model that passes eval*:

| Task type | Default | Upgrade trigger |
|---|---|---|
| Classification / extraction | Claude Haiku | Eval < 7.5 |
| Reasoning / synthesis | Claude Sonnet | Complex domain · CTO sign |
| Strategic / creative | Claude Opus | Only highest-leverage tasks |
| Translation / boilerplate | Haiku | — |

MUST log model choice in agent skill card. Switch up = ADR (cost impact).

---

## R-STK-04 — Version Pinning

- Production deps: pinned to **patch** (`^1.2.x` not `^1.x`)
- Dev deps: pinned to **minor** (`^1.2`)
- LLM model versions: **exact** (e.g., `claude-sonnet-4-20250514`)
- Lock files committed (package-lock.json / pnpm-lock.yaml)

---

## R-STK-05 — Anti-FOMO List

The following are **explicitly banned** until ADR with eval delta proof:

- ❌ New JS framework < 6 months old in production
- ❌ Bun (until 1.x stable + ecosystem coverage)
- ❌ Microservices for MVP (default monolith)
- ❌ Kubernetes for < 10K users (use PaaS)
- ❌ Custom ORM
- ❌ "Modern" JS runtimes that aren't Node LTS or Bun stable
- ❌ Pre-1.0 libraries in critical path
- ❌ "X is dead, Y is the future" arguments without benchmark

---

## R-STK-06 — Deprecation Process

When tech becomes deprecated:
1. R-OPS files ADR with deprecation rationale
2. CTO sets sunset date (3-12 months)
3. Migration plan written before sunset
4. New work MUST use new stack
5. Old codebases migrate per phase (no big-bang)

---

## R-STK-07 — Vendor Lock-In Awareness

Critical-path SaaS MUST have:
- Documented data export path
- Cost projection at 10× current usage
- Identified alternative (with switching cost estimate)

R-OPS reviews quarterly per `15-ops §4`.

---

## R-STK-08 — Self-Hosting Threshold

MAY self-host (vs SaaS) when:
- Vendor cost > $300/mo AND alternative open-source mature
- Compliance requires data residency
- Vendor has pricing risk (rumored acquisition, IPO)

MUST stay SaaS (no self-host) when:
- Team size ≤ 3 (ops overhead too high)
- Niche tool not in critical path

---

## Quick Reference

```
STACK RULES (R-STK):
01 Approved stack only · 02 ADR for new deps · 03 LLM cheapest-passes
04 Version pinning · 05 Anti-FOMO list · 06 Deprecation process
07 Vendor lock-in awareness · 08 Self-host threshold
```

---

## Cross-References

- Personal stack policy: [`@../../business-strategy/06-personal-development.md`](../../business-strategy/06-personal-development.md)
- CTO charter: [`@../.agents/tier-0-executive/CTO-charter.md`](../.agents/tier-0-executive/CTO-charter.md)
- ADR template: [`@../../business-strategy/15-business-operations.md:321`](../../business-strategy/15-business-operations.md)
- Tools standards: [`@../../business-strategy/15-business-operations.md:427`](../../business-strategy/15-business-operations.md)

---
*v1.0*
