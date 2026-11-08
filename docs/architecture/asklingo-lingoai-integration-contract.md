# askLINGO / LINGOai Integration Contract

**Status:** DESIGN ONLY — NOT IMPLEMENTED OR ENABLED  
**Production policy:** fail closed; no promotion while G02 is blocked  
**Canonical runtime:** Cloudflare Worker in `worker.js`

## Verified current state

The canonical Worker exposes runtime, platform status, gate, module, site-context, checkout, and beacon-alert routes. Unknown `/api/*` paths return 404. The inspected Worker does not implement an askLINGO request endpoint or a model-provider gateway. The site-context response currently advertises an `ask_lingo` feature flag, which must not be interpreted as proof of a functioning AI integration.

## Target route contract

| Route | Method | Purpose | Required behavior |
|---|---|---|---|
| `/api/v1/assistant/status` | GET | Safe capability status | Report enabled/disabled state and release gate without disclosing secrets or provider credentials |
| `/api/v1/assistant/ask` | POST | User prompt submission | Validate request schema and session; enforce rate, token, and cost limits; invoke only a server-side gateway |
| `/api/v1/assistant/feedback` | POST | Optional user feedback | Consent-aware, size-limited, PII-minimized and auditable |

The routes above are **proposed**, not evidence of currently available endpoints.

## LINGOai gateway requirements

1. **Server-side provider boundary:** API keys and provider credentials stay in Cloudflare secrets or a dedicated gateway. Never ship secrets in HTML, JavaScript, app bundles, repository files, or logs.
2. **Explicit service contract:** define request/response schemas, model allowlist, maximum input/output tokens, timeout, retry policy, circuit breaker, and safe error mapping.
3. **Shared abuse controls:** enforce a distributed rate limit and per-session/user quotas. An isolate-local in-memory map is not a reliable cross-isolate or cross-region limiter.
4. **Identity and authorization:** define anonymous versus authenticated use, Lingo ID session validation, abuse handling, and any age-appropriate experience constraints before enabling the feature.
5. **Privacy:** do not log raw prompts by default. Define retention, redaction, consent, data residency, deletion, and incident-response rules before collecting conversation history.
6. **Prompt safety:** treat user input and retrieved documents as untrusted data; delimit system instructions; validate tool calls; never allow the model to trigger deployments, financial transactions, wallet changes, or production mutations without separately authorized deterministic workflows.
7. **Observability:** record request ID, model alias, latency, token/cost estimate, status class, and safety outcome without storing secrets or unnecessary prompt content.
8. **Fail-closed state:** if gateway, auth/session validation, shared rate limiter, budget policy, or required telemetry is unavailable, the assistant must return a bounded unavailable response rather than falling back to a public provider call.

## Activation gates

The assistant must remain disabled until all are evidenced:

- G02 runner dispatch and static CI execution pass.
- Gateway binding and secret presence are verified without exposing values.
- Shared rate limiter and authentication/session contract are verified.
- Request schema, body-size limits, timeout and budget caps are tested.
- Abuse, prompt-injection, privacy, and error-path tests pass.
- E2E tests prove UI status agrees with API status and no secret appears in client assets or logs.
- Independent review accepts the evidence; only then may release authorization consider activation.

## Required test matrix

- Missing provider binding → bounded unavailable response; no outbound model request.
- Missing/invalid session or quota exceeded → rejected before provider invocation.
- Unsupported content type, malformed JSON, oversized body, empty prompt, or prompt over limit → 4xx response.
- Gateway timeout, 429, 5xx, malformed response → sanitized failure; no secret or provider payload leak.
- Cross-origin request → CORS policy enforced.
- Repeated requests across multiple isolates → shared limiter still enforces quota.
- User asks for a deployment, wallet mutation, payment, or secret → no direct privileged action; deterministic authorization gates remain authoritative.
- Logs and artifacts → no API keys, authorization headers, or raw prompt content by default.

## Current decision

No askLINGO/LINGOai provider call should be activated from this contract alone. The production Worker remains unchanged by this document. Implement route handlers only after gateway and shared-rate-limit interfaces are concretely configured and independently reviewable.
