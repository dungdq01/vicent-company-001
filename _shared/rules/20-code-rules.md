---
file: 20-code-rules
version: v1.0
last_updated: 2026-04-26
owner: CTO
status: production
---

# Code Rules — Coding Conventions

> Apply to all engineering agents (T2) + R-FS + R-AE outputs.

---

## R-COD-01 — Language Defaults

| Language | Use for | Forbidden |
|---|---|---|
| TypeScript (strict) | All FE + BE web | JS without TS · `any` without justification |
| Python 3.11+ | ML / data / scripts | Python 2 · untyped (except notebook EDA) |
| SQL (Postgres flavor) | DB | MySQL syntax · vendor extensions w/o reason |
| Bash | Glue scripts only | Long logic (use Python instead) |

`tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`. Python: `mypy --strict` for prod modules.

---

## R-COD-02 — Naming

- **Files**: kebab-case (`user-profile.tsx`)
- **Components / Classes**: PascalCase (`UserProfile`)
- **Functions / variables**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE (`MAX_RETRIES`)
- **DB tables**: snake_case plural (`user_profiles`)
- **DB columns**: snake_case singular (`first_name`)
- **API endpoints**: kebab-case noun-based (`/api/user-profiles`)
- **Env vars**: UPPER_SNAKE prefixed (`STUDIO_LLM_API_KEY`)

> No abbreviations except universal (`id`, `url`, `api`). MUST NOT use `tmp`, `usr`, `mgr`.

---

## R-COD-03 — Function Length

- Functions SHOULD ≤ **40 lines** (excluding signatures + closing).
- > 80 lines → MUST refactor.
- Cyclomatic complexity ≤ **10**.

> Auto-check: ESLint `max-lines-per-function` · radon for Python.

---

## R-COD-04 — Comments

- Comments explain **WHY**, not WHAT.
- Public functions MUST have JSDoc/docstring with: purpose · params · returns · throws.
- TODOs MUST include owner + ticket: `// TODO(p1): handle auth refresh — TICKET-123`.
- MUST NOT leave commented-out code in main.

---

## R-COD-05 — Error Handling

- MUST NOT swallow errors silently (`catch (e) {}`).
- MUST distinguish: domain errors (typed) vs unexpected (logged + re-thrown).
- API endpoints MUST return structured errors: `{ code, message, details }`.
- LLM calls MUST handle: rate limit · timeout · partial response · content filter.

```typescript
// ❌ Wrong
try { await call(); } catch (e) { /* nothing */ }

// ✅ Right
try { await call(); }
catch (e) {
  if (e instanceof RateLimitError) return retryWithBackoff();
  logger.error("unexpected.call.failed", { e });
  throw e;
}
```

---

## R-COD-06 — Logging

- Structured (JSON) logs in production
- Levels: `debug` · `info` · `warn` · `error` · `fatal`
- MUST NOT log: PII · secrets · full prompts in production (sample 1% only)
- LLM calls: log model · token count · cost · latency · eval score (per Helicone schema)

---

## R-COD-07 — Testing

- Test pyramid: **many unit · some integration · few e2e**
- MUST test: happy path · ≥ 1 unhappy path · edge cases (empty, null, max)
- LLM components: golden set ≥ 20 cases per `_shared/eval/golden-sets/`
- E2E for: critical user flows + auth + payment
- MUST NOT chase coverage % — focus critical-path

---

## R-COD-08 — Type Safety

- `any` BANNED in production TypeScript. Use `unknown` + narrow.
- Schema validation at boundary (zod / pydantic / valibot) — MUST validate every external input
- Database queries MUST use ORM types (Drizzle / Prisma) — no string concat SQL

---

## R-COD-09 — Secrets

- MUST NOT commit secrets (.env in `.gitignore`)
- MUST use secret manager (Doppler · Vault · 1Password) in prod
- API keys rotated quarterly
- MUST NOT log full secrets — mask after 4 chars

---

## R-COD-10 — Dependencies

- MUST run `npm audit` / `pip-audit` / `trivy` in CI
- Critical CVE = block PR merge
- High CVE = patch within 7 days
- License compliance: MIT / Apache / BSD allowed; GPL → CTO sign

---

## R-COD-11 — Git Conventions

- Branch: `{type}/{issue}-{slug}` (e.g., `feat/123-add-auth`)
- Commit (Conventional): `feat:` `fix:` `chore:` `docs:` `refactor:` `test:`
- MUST squash before merge to `main`
- MUST link PR to issue / ADR
- MUST NOT force-push to shared branches
- `main` is always deployable

---

## R-COD-12 — Code Review

- All PRs MUST have ≥ 1 reviewer (not author)
- LLM-touching code → CTO review mandatory
- Reviewer MUST run code locally OR view CI green
- Use checklist per `06-dev-guides/code-review-checklist.md`

---

## R-COD-13 — Performance Awareness

- N+1 queries: MUST NOT exist in API endpoints (eager-load or batch)
- LLM calls: MUST batch when possible (parallel awaits)
- Frontend: lazy-load images · code-split routes
- DB: index hot queries · `EXPLAIN` slow queries

---

## R-COD-14 — Accessibility (Frontend)

- Semantic HTML (no `<div>` for buttons)
- WCAG AA contrast ratio (4.5:1 text)
- Keyboard navigable
- Alt text on images
- Focus indicators visible
- Auto-check: `axe-core` in CI

---

## R-COD-15 — Anti-Patterns (Forbidden)

- ❌ `console.log` in production code (use logger)
- ❌ `setTimeout` for race condition fixes
- ❌ Magic numbers (use named constants)
- ❌ Dead code / unreachable branches
- ❌ Mutating function arguments
- ❌ Global mutable state
- ❌ Catching `Exception` / `Error` at top level only
- ❌ String-concat SQL (always parameterized)
- ❌ Storing tokens in localStorage (use httpOnly cookie)
- ❌ Production code in `if (env === 'dev')` paths

---

## Quick Reference

```
CODE RULES (R-COD):
01 Lang defaults · 02 Naming · 03 Func length ≤ 40 lines
04 Comments WHY · 05 Error handling · 06 Logging structured
07 Test pyramid · 08 Type safety · 09 Secrets manager
10 Dep audit · 11 Git conventions · 12 Code review ≥ 1
13 Perf awareness · 14 a11y · 15 Anti-patterns banned
```

---
*v1.0*
