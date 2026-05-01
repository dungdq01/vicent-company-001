---
file: 04a-api-design
project_id: {{PROJECT_ID}}
phase: P4a
filled_by: R-BE
last_updated: {{P4_DATE}}
status: draft | reviewed | signed
---

# {{PROJECT_NAME}} — API Design

> P4a deliverable. Implementable API spec. Source for backend implementation + frontend client + integration tests.

---

## 0. Document Control

- **Author**: R-BE
- **Reviewers**: R-FE (consumer) · R-SA (architecture fit) · CTO
- **Eval (R-BE)**: [Fill ≥ 7.5]
- **OpenAPI spec**: [`./openapi.yaml`](./openapi.yaml) (companion file)

---

## 1. Overview

- **Style**: [Fill: REST · tRPC · GraphQL]
- **Base URL**: `{{API_BASE_URL}}`
- **Versioning**: [Fill: URL `/v1/` · header `Accept-Version`]
- **Auth**: [Fill: Bearer JWT · session cookie · API key]
- **Content type**: `application/json`
- **Error format**: see §4

---

## 2. Authentication & Authorization

### 2.1 Auth Mechanism
[Fill: Clerk JWT · NextAuth session · etc.]

### 2.2 Roles & Scopes

| Role | Scopes |
|---|---|
| `admin` | all |
| `user` | [Fill] |
| `viewer` | [Fill: read-only] |

### 2.3 Endpoint → Required Scope Map
See §3 per endpoint.

---

## 3. Endpoints

### 3.1 Resource: `[Fill: e.g., Users]`

#### `POST /v1/[resource]` — Create
- **Auth**: required · scope `[Fill]`
- **Request body**:
  ```json
  {
    "field1": "string",
    "field2": 0
  }
  ```
- **Validation**: [Fill: zod/pydantic schema · field constraints]
- **Response 201**:
  ```json
  {
    "id": "uuid",
    "field1": "string",
    "createdAt": "2026-04-26T10:00:00Z"
  }
  ```
- **Errors**: 400 (validation) · 401 (auth) · 409 (duplicate)
- **Rate limit**: [Fill: e.g., 100/min per user]

#### `GET /v1/[resource]` — List
- **Auth**: [Fill]
- **Query params**: `?page=1&limit=20&sort=createdAt:desc&filter=...`
- **Response 200**:
  ```json
  {
    "data": [...],
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  }
  ```
- **Pagination**: cursor or offset (specify)

#### `GET /v1/[resource]/:id` — Read
- [Fill same pattern]

#### `PATCH /v1/[resource]/:id` — Update
- [Fill]

#### `DELETE /v1/[resource]/:id` — Delete
- [Fill: hard delete or soft? per R-DBE]

### 3.2 Resource: `[Fill]`
[Repeat structure]

---

## 4. Error Format

All error responses follow:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": [
      { "field": "email", "issue": "invalid_format" }
    ],
    "requestId": "req_abc123"
  }
}
```

### 4.1 Error Codes

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Schema invalid |
| 401 | `UNAUTHENTICATED` | Missing/invalid token |
| 403 | `FORBIDDEN` | Auth ok, scope insufficient |
| 404 | `NOT_FOUND` | Resource missing |
| 409 | `CONFLICT` | Duplicate or version conflict |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server bug · always logged |
| 503 | `SERVICE_UNAVAILABLE` | Upstream down · retry-able |

---

## 5. Pagination Standard

[Fill: cursor-based or offset · default page size · max]

---

## 6. Filtering & Sorting

[Fill: query syntax · allowed fields per endpoint]

---

## 7. Rate Limiting

| Tier | Requests/min | Burst |
|---|---|---|
| Anonymous | [Fill] | [Fill] |
| Authenticated | [Fill] | [Fill] |
| Admin | [Fill] | [Fill] |

Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

---

## 8. Webhooks (if applicable)

| Event | Payload | Retry policy |
|---|---|---|
| `[event.name]` | [Fill schema] | exp backoff 5×, max 24h |

Signing: HMAC-SHA256 with shared secret. Header `X-Signature`.

---

## 9. LLM-Specific Endpoints (if applicable)

### 9.1 `POST /v1/agents/[task]`
- **Streaming**: SSE or WebSocket?
- **Token limit**: [Fill]
- **Cost telemetry**: every call logs to Helicone
- **Eval hook**: every response evaluated per R-QAL-02

### 9.2 Prompt Injection Protection
[Fill per R-SEC-06]

---

## 10. Versioning Policy

- **Breaking change**: new major version `/v2/`
- **Additive change**: same version
- **Deprecation**: 6-month notice via `Deprecation` header

---

## 11. CORS

- **Allowed origins**: [Fill: e.g., {{FRONTEND_URL}}]
- **Allowed methods**: [Fill]
- **Credentials**: [Fill: include/exclude]

---

## 12. Idempotency

For non-idempotent operations (POST that creates), accept `Idempotency-Key` header. Same key within 24h returns cached response.

---

## 13. Examples Library

→ See [`./examples/`](./examples/) for request/response examples per endpoint (Postman / Bruno collection).

💡 Hint: Per R-TC-04, every endpoint has ≥ 1 example.

---

## 14. Sign-Off

- **R-BE eval**: [Fill]
- **R-FE consumer review**: [Fill]
- **R-SA architecture fit**: [Fill]
- **CTO**: [Fill]

---

## Cross-References

- PRD: [`04-prd.md`](04-prd.md)
- DB schema: [`04b-db-schema.md`](04b-db-schema.md)
- Integration: [`04e-integration.md`](04e-integration.md)
- Code rules: [`@../../rules/20-code-rules.md`](../../rules/20-code-rules.md)

---
*Template v1.0*
