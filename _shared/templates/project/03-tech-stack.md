---
file: 03-tech-stack
project_id: {{PROJECT_ID}}
phase: P3
filled_by: R-SA + CTO
last_updated: {{P3_DATE}}
status: draft | reviewed | signed
---

# {{PROJECT_NAME}} — Tech Stack Decision

> Companion to `03-architecture.md`. Each component has explicit rationale per R-MAS-04 (no FOMO).

---

## 1. Stack Allow-List Reference

This project follows [`@../../rules/10-stack-rules.md`](../../rules/10-stack-rules.md). Any deviation requires ADR.

---

## 2. Layer-by-Layer Decisions

### 2.1 Frontend
- **Framework**: [Fill: Next.js 16 App Router]
- **Language**: TypeScript strict
- **UI**: shadcn/ui + Tailwind + Lucide icons
- **State**: [Fill: server components + minimal client state · zustand if needed]
- **Form**: [Fill: react-hook-form + zod]
- **Why**: [Fill: alignment with R-STK-01 · client preference · team expertise]
- **Rejected alternatives**: [Fill: Remix because... · Svelte because...]

### 2.2 Backend / API
- **Framework**: [Fill: Next.js API routes · tRPC · Hono · FastAPI]
- **Language**: [Fill]
- **Auth**: [Fill: Clerk / NextAuth / Supabase Auth · NEVER roll-your-own per R-SEC-02]
- **Why**: [Fill]
- **Rejected**: [Fill]

### 2.3 Database
- **Primary**: [Fill: Postgres 16]
- **ORM**: [Fill: Drizzle / Prisma]
- **Vector** (if RAG): [Fill: pgvector]
- **Cache**: [Fill: Redis]
- **Search** (if needed): [Fill: Postgres FTS · Meilisearch]
- **Why**: [Fill]
- **Rejected**: [Fill]

### 2.4 LLM
- **Primary model**: [Fill: claude-sonnet-4-{date}]
- **Fallback**: [Fill: gpt-4o]
- **Cheap tier**: [Fill: claude-haiku for classification/extraction]
- **Eval / monitoring**: Helicone + Langfuse
- **Why per task**: [Fill: Sonnet for synthesis (eval ≥ 8) · Haiku for classification (cost)]
- **Cost projection**: [Fill: $/req · monthly]

### 2.5 ML / Data
- **Training**: [Fill: PyTorch · scikit-learn · etc. — only if ML in scope]
- **Inference**: [Fill: ONNX · TGI · vLLM]
- **Pipeline**: [Fill: Prefect · Airflow · cron]
- **Feature store** (if needed): [Fill]
- **Why**: [Fill]

### 2.6 Hosting / Infra
- **App hosting**: [Fill: Vercel · Railway · Fly.io · AWS]
- **DB hosting**: [Fill: Supabase · Neon · RDS]
- **File storage**: [Fill: Supabase Storage · S3]
- **CDN**: [Fill: Vercel · Cloudflare]
- **Why this tier**: [Fill: PaaS for MVP · cloud only if scale/compliance per R-STK-08]

### 2.7 CI/CD
- **CI**: [Fill: GitHub Actions]
- **CD**: [Fill: Vercel auto-deploy · Railway · GitOps]
- **Quality gates**: lint · typecheck · test · audit · eval golden set
- **Why**: [Fill]

### 2.8 Observability
- **Logs**: [Fill: Vercel logs · Logflare · Datadog]
- **Errors**: [Fill: Sentry]
- **Metrics**: [Fill: Vercel Analytics · PostHog]
- **LLM traces**: Helicone (mandatory)
- **Uptime**: [Fill: BetterStack · UptimeRobot]

### 2.9 Email / Notifications
- **Transactional**: [Fill: Resend · Postmark]
- **Push**: [Fill: FCM if mobile]

### 2.10 Payments (if applicable)
- **Provider**: [Fill: Stripe]
- **Why**: [Fill]

---

## 3. Dependency Manifest

### 3.1 Frontend `package.json` highlights
```json
{
  "dependencies": {
    "next": "[Fill version]",
    "react": "[Fill]",
    "tailwindcss": "[Fill]",
    "@anthropic-ai/sdk": "[Fill]"
    // ...
  }
}
```

### 3.2 Backend
[Fill]

### 3.3 ML / Data (if Python)
```toml
# requirements.txt or pyproject.toml
# [Fill]
```

💡 Hint: Pin versions per R-STK-04 (patch-pinned for prod, minor for dev).

---

## 4. Environment Configuration

### 4.1 Environments
| Env | Purpose | URL |
|---|---|---|
| dev | Local development | localhost |
| staging | Pre-prod testing | [Fill] |
| prod | Production | [Fill] |

### 4.2 Environment Variables
[Fill: list with description, not actual values]

```
# Application
NEXT_PUBLIC_APP_URL=...

# Database
DATABASE_URL=postgres://...

# LLM
ANTHROPIC_API_KEY=sk-ant-...
HELICONE_API_KEY=...

# Auth
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# [Fill more]
```

💡 Hint: Secrets MUST be in secret manager per R-SEC-01. `.env.example` committed without values.

---

## 5. Cost Projection

### 5.1 Monthly Operating Cost (post-launch)

| Item | Vendor | Cost (USD/mo) |
|---|---|---|
| App hosting | [Fill] | [Fill] |
| Database | [Fill] | [Fill] |
| LLM API | Anthropic | [Fill at projected volume] |
| LLM ops | Helicone | [Fill] |
| Auth | [Fill] | [Fill] |
| Email | [Fill] | [Fill] |
| Observability | [Fill] | [Fill] |
| **Total** | | **[Fill]** |

### 5.2 Cost at 10× Scale
[Fill: same table at 10× projected volume — sanity check]

---

## 6. Vendor Lock-In Assessment

Per R-STK-07. For each critical-path SaaS:

| Vendor | Lock-in risk | Export path | Alternative |
|---|---|---|---|
| [Fill] | Low/Med/High | [Fill] | [Fill] |

---

## 7. Stack Risks

[Fill: ≥ 3 stack-specific risks]

| Risk | Mitigation |
|---|---|
| [Fill] | [Fill] |

---

## 8. Anti-FOMO Confirmation

- [ ] All choices in `10-stack-rules.md` allow-list
- [ ] No new dependency without ADR
- [ ] No "trending on HN" justifications
- [ ] LLM model choice = cheapest-that-passes-eval per R-STK-03
- [ ] Version pinned per R-STK-04
- [ ] CTO confirms no FOMO

---

## 9. Sign-Off

- **R-SA**: [Fill]
- **CTO**: [Fill name · date]
- **Ready for P4**: [ ]

---

## Cross-References

- Stack rules: [`@../../rules/10-stack-rules.md`](../../rules/10-stack-rules.md)
- Personal stack policy: [`@../../../business-strategy/06-personal-development.md`](../../../business-strategy/06-personal-development.md)
- Cost budgets: [`@../../standards/cost-budgets.md`](../../standards/cost-budgets.md)

---
*Template v1.0*
