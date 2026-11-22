# LLG AI Gateway API Contract

**Owner:** LLG Tech Corps — AI Systems  
**Status:** Design contract for review; not an implementation or activation authorization  
**Scope:** First-party gateway boundary for AI Chat, AI Compare, AI Agents, and AI Developer  
**Providers:** OpenAI / GPT, Anthropic / Claude, Google / Gemini, xAI / Grok

## 1. Non-negotiable architecture

1. Web, Flutter, and game clients call only authenticated LLG-owned endpoints.
2. Provider credentials exist only in server-side secret bindings. They are never returned to clients, embedded in bundles, or written to logs.
3. The gateway authenticates the caller, authorizes the requested capability, validates input, applies policy and budget controls, and selects only explicitly enabled providers.
4. Provider adapters remain isolated. No silent fallback, implicit cross-provider forwarding, or cross-provider prompt enrichment is permitted.
5. Provider execution is disabled by default. A provider requires an explicit global flag, provider flag, valid credential, approved model allowlist, account approval, budget authorization, and successful live acceptance evidence.
6. No conversation persistence is implied by this API. Any future retention feature requires a separate product, privacy, security, and legal review with explicit user-facing controls.

## 2. API surface

All routes are versioned under `/api/ai/v1`. The gateway must reject unknown routes and methods.

| Method | Route | Capability | Initial disposition |
|---|---|---|---|
| POST | `/chat` | One explicitly selected provider | Disabled |
| POST | `/compare` | Independent parallel provider calls | Disabled |
| POST | `/agents/plan` | Produce a non-executing structured plan | Local-only prototype |
| POST | `/agents/run` | Execute an approved bounded workflow | Not implemented; disabled |
| POST | `/developer/analyze` | Analyze user-supplied code/context | Disabled |
| GET | `/providers` | Return caller-safe provider capability/status metadata | Not implemented |
| GET | `/usage` | Return caller's authorized usage summary | Not implemented |

The public client must not choose arbitrary upstream URLs, headers, provider endpoints, or secret names. The server owns the provider-to-endpoint mapping.

## 3. Request envelope

Chat request:

```json
{
  "provider": "openai",
  "message": "User-authored prompt"
}
```

Compare request:

```json
{
  "providers": ["openai", "claude"],
  "message": "Same user-authored prompt for each provider"
}
```

Validation requirements:

- Content type must be JSON; reject unsupported media types.
- Require a non-empty UTF-8 message. Enforce the adapter's 2,000-character limit and a separate byte limit at the HTTP boundary.
- Reject unknown fields unless a future schema version explicitly permits them.
- Provider IDs must be from the fixed server registry: `openai`, `claude`, `gemini`, `grok`.
- Compare must contain 2–4 unique providers. Each selected model is validated against that provider's server-side allowlist.
- The initial source-only validator accepts only `provider` and `message` for chat, and `providers` and `message` for compare. Model selection remains server-configured in provider environment bindings; no client model override is accepted.
- Never accept client-supplied role, system prompt, tool permissions, budget, tenant ID, user ID, provider credential, or approval fields as authoritative.
- Agent request bodies are limited to `agent_id` and `task`; tool grants, role claims, tenant IDs, and approval flags are rejected.
- Developer request bodies are limited to `language`, `task`, and optional `code`; language and text/code lengths are allowlisted and bounded.
- Route handlers must enforce a byte limit before JSON parsing. The source-only helper validates parsed objects and does not itself impose an HTTP body-byte limit.
- Enforce request-body size before parsing and before any provider call.

## 4. Authentication and authorization

The gateway must integrate with the verified LINGO ID identity provider. Firebase project IDs and app registrations must be verified before selecting Firebase Auth as the production token issuer.

The server must validate token signature, issuer, audience, expiry, not-before time, and revocation/session policy. A decoded but unverified JWT is not authentication.

Required server-derived authorization context:

| Claim / context | Purpose | Trust rule |
|---|---|---|
| `sub` | Stable user identifier | Token-verified; never accepted from request body |
| `tenant_id` | Organization/account boundary | Token-verified and membership checked |
| `roles` | Coarse product roles | Token-verified; least privilege |
| `scopes` | Specific AI capabilities | Server-issued and checked per route |
| `plan` | Entitlement tier | Server-side entitlement lookup; token claim alone is not spend authority |
| `session_id` | Session correlation/revocation | Verified or server-derived |

Minimum scope mapping:

- `ai:chat` — one provider chat request.
- `ai:compare` — independent comparison request.
- `ai:agents:plan` — create a non-executing plan.
- `ai:agents:run` — execute an approved workflow.
- `ai:developer:analyze` — analyze supplied code/context.
- `ai:usage:read` — read the caller's own usage summary.
- Administrative scopes are separate, unavailable to ordinary chat sessions, and never inferred from a user prompt.

Every request must enforce tenant isolation. A user cannot read another user's conversations, usage, quotas, audit events, or tool results by changing identifiers.

## 5. Rate limits, budgets, and spend controls

Apply controls in this order, before provider dispatch:

1. Global emergency stop.
2. Global AI feature flag.
3. Tenant/account status and entitlement.
4. User and tenant route scope.
5. Provider-specific enablement and model allowlist.
6. Per-user, per-tenant, and per-provider rate limits.
7. Request concurrency ceiling.
8. Estimated token and monetary budget reservation.
9. Provider dispatch.

Required controls:

- Rate-limit by verified user, tenant, route, and provider; include burst and sustained windows.
- Enforce maximum input/output tokens and request duration server-side.
- Reserve estimated spend before dispatch; reconcile against actual provider usage after response.
- Set hard daily and monthly ceilings at both user and tenant levels.
- Define an explicit behavior for exhausted budgets: reject with a normalized quota error; never silently switch providers or charge another tenant.
- If cost metadata is unavailable, apply the configured conservative maximum charge or reject the request.
- Provide a global kill switch and provider-specific kill switches.
- All limits and prices must be configuration-backed, reviewed, and auditable. Do not invent pricing or enable paid use by default.

No provider account, payment method, billing plan, or spending limit is authorized by this design document.

## 6. Moderation, safety, and data boundaries

- Apply request safety policy before dispatch and response policy before returning output.
- Define separate policy profiles for general chat, code assistance, agent execution, and any future high-impact workflow.
- Do not treat model output as trusted instructions, authorization, code approval, or a tool permission grant.
- Tool use is denied by default. Every tool must have an explicit allowlisted name, schema, scope, resource boundary, timeout, and audit event.
- Agent workflows require declared inputs, outputs, tools, maximum steps, wall-clock limit, token/spend budget, and stop conditions.
- Destructive, financial, external-communication, identity, release, and production-infrastructure actions require explicit human approval at the point of action.
- Never expose provider error bodies, stack traces, credentials, internal network details, or raw policy internals to clients.
- Do not log raw prompts, model outputs, access tokens, provider keys, or sensitive user content by default. Security logging should use minimized metadata and approved retention.
- Provider-side retention, training use, regional processing, and data-processing terms must be reviewed separately before activation. A client-side `store: false` request flag does not establish zero retention by the provider.

## 7. Comparison semantics

- Each selected provider receives the same user-authored message and only the context explicitly approved for that request.
- Calls are independent and may execute concurrently under one parent request ID.
- No provider receives another provider's response.
- Partial success is represented per provider. Do not discard a successful result merely because another provider failed.
- Return provider, approved model identifier, normalized status, answer when successful, elapsed time, and a safe correlation ID.
- Never compare or rank providers using fabricated latency, quality, token usage, or cost data.
- If the caller lacks authorization for any selected provider, reject the comparison before dispatch; do not silently omit that provider.

## 8. Response and error envelope

Successful single-provider response:

```json
{
  "ok": true,
  "request_id": "server-generated-uuid",
  "provider": "openai",
  "model": "server-approved-model-id",
  "answer": "Provider response",
  "usage": {
    "input_tokens": null,
    "output_tokens": null,
    "cost_microunits": null
  }
}
```

Normalized error response:

```json
{
  "ok": false,
  "request_id": "server-generated-uuid",
  "error": {
    "code": "AI_PROVIDER_DISABLED",
    "message": "The requested AI capability is unavailable.",
    "retryable": false
  }
}
```

Stable error codes should include:

- `AUTHENTICATION_REQUIRED` (401)
- `AUTHORIZATION_DENIED` (403)
- `REQUEST_INVALID` (400)
- `REQUEST_TOO_LARGE` (413)
- `RATE_LIMITED` (429)
- `QUOTA_EXCEEDED` (429)
- `AI_FEATURE_DISABLED` (503)
- `AI_PROVIDER_DISABLED` (503)
- `AI_MODEL_NOT_ALLOWED` (403)
- `AI_PROVIDER_TIMEOUT` (504)
- `AI_PROVIDER_UNAVAILABLE` (502)
- `AI_PROVIDER_INVALID_RESPONSE` (502)
- `AI_PROVIDER_RESPONSE_TOO_LARGE` (502)
- `INTERNAL_ERROR` (500)

The public message must remain generic. A server-side diagnostic may record a sanitized internal reason, but must not contain secrets or raw content.

## 9. Audit and observability

Record only approved, minimized metadata:

- server request ID and optional client request ID;
- UTC timestamp, environment, route, and outcome;
- pseudonymous user and tenant references;
- provider/model identifiers;
- policy decision and normalized error code;
- latency, token counts, and cost only when returned and validated by the provider;
- budget reservation/reconciliation outcome;
- approval reference for any agent/tool action.

Do not record raw prompt/answer content by default. Define retention, access, deletion, and incident procedures before enabling audit storage. Correlation IDs must not be treated as authentication credentials.

## 10. Idempotency and concurrency

- Support an idempotency key for agent execution and other state-changing operations; scope it to verified tenant + user + route.
- Repeated keys with the same request digest return the original result; repeated keys with a different digest return a conflict.
- Chat and compare are non-persistent by default. If retries are supported, document duplicate provider billing behavior and use a bounded retry policy only for explicitly safe transport failures.
- Never retry authorization failures, invalid requests, quota failures, or provider policy rejections.
- Cap concurrent provider calls per user and tenant. Cancellation must abort upstream work where supported and reconcile any reserved budget.

## 11. Acceptance gates before implementation or activation

The contract is not accepted merely because it is documented. Before a production gateway can be enabled, evidence must include:

1. Verified LINGO ID issuer, audience, token validation, revocation, and tenant membership.
2. Threat model and security review covering auth bypass, tenant escape, prompt injection, SSRF, secret exposure, abuse, and denial of service.
3. Approved provider accounts, model allowlists, privacy terms, and explicit spend ceilings.
4. Executable schema validation and negative tests for every route.
5. Authorization matrix tests for user, tenant, role, and scope boundaries.
6. Rate-limit, quota reservation, concurrency, timeout, cancellation, and kill-switch tests.
7. Provider adapter contract tests with mocked upstreams, followed by controlled live tests only after credentials and budgets are explicitly authorized.
8. Audit redaction and retention verification.
9. Browser, mobile, accessibility, and security QA tied to exact source commit and build artifacts.
10. Independent acceptance and explicit release authorization.

## 12. Source-only request validation boundary

Added `src/ai/gateway-request-validation.mjs` and `src/ai/gateway-request-validation.test.mjs`. The helper validates four request classes (`chat`, `compare`, `agents`, and `developer`) against strict allowlisted fields, provider identifiers, compare cardinality and uniqueness, agent identifiers, developer languages, bounded text/code lengths, and control-character rejection. It returns normalized values and rejects unknown identity, tenant, role, budget, tool, and approval fields rather than trusting client-supplied authority.

This helper validates already-parsed JavaScript objects. It is not an HTTP body parser, content-type validator, route, authorization decision, moderation layer, quota service, or production integration. A future route must enforce byte limits before parsing, authenticate and authorize the caller, derive tenant and policy context server-side, and invoke this validation before dispatch.

Ten Node test cases were added for valid and invalid chat/compare/agent/developer requests, unknown fields, identity/policy injection, boundary lengths, malformed bodies, and text control characters. The GitHub Actions workflow includes this suite and uploads `gateway-request-validation-test.log`. The workflow definition is not execution evidence.

## 13. Source-only HTTP handler boundary

Added `src/ai/gateway-handler.mjs` and `src/ai/gateway-handler.test.mjs`. The handler factory defines POST routes for Chat, Compare, Agents Plan, and Developer Analyze. It authenticates before reading the body, enforces JSON content type and a 16 KiB streamed-body ceiling, validates the route-specific schema, then requires injected authorization, input moderation, budget reservation, dispatch, output moderation, and budget reconciliation services. It returns normalized errors and keeps `/agents/run` explicitly disabled.

The handler refuses to initialize without every required dependency. The dependencies are interfaces only; this module does not implement or bind a cryptographic identity verifier, tenant/role policy service, moderation service, budget ledger, provider dispatcher, audit store, or production HTTP runtime. It is not connected to the Command Center or deployed to Cloudflare/Firebase. A source-level route factory is not evidence that any endpoint is reachable.

Nineteen Node test cases cover missing dependencies, route/method handling, disabled agent execution, authentication-before-body parsing, content-type and body limits, invalid fields, authorization and moderation denials, budget denial/malformed reservation, success ordering, compare provider selection, execution failure, output moderation, and failed budget reconciliation. The CI workflow includes this suite and uploads `gateway-handler-test.log`; execution remains subject to exact-head hosted-runner evidence.

## 14. Current implementation disposition

A source-only authentication boundary has been added at `src/ai/gateway-auth.mjs`, with Node test coverage in `src/ai/gateway-auth.test.mjs`. It is deliberately dependency-injected: the caller must supply a cryptographic `verifyToken` implementation, expected issuer/audience, required scopes, and a tenant-membership resolver. It validates verified claims, expiry/not-before, scopes, and tenant membership, and fails closed when required dependencies are absent or unavailable.

This helper is not a JWT verifier, identity-provider integration, HTTP route, session revocation service, entitlement lookup, or production authorization system. It is not wired to the Command Center or provider adapters. Its tests are included in the adapter workflow definition, but test execution on the current commit is not yet evidenced.

- The existing provider adapter module is a source-level component, not an authenticated public gateway.
- The Command Center remains a local-only prototype; provider execution controls remain disabled.
- No verified production identity issuer, tenant model, billing ledger, budget service, or audit store is established by this contract.
- No provider credentials, paid provider calls, Firebase activation, Cloudflare route changes, or production deployments are authorized.
- GitHub Actions execution evidence remains separately gated; a workflow definition is not proof that its tests ran.

**Decision requested:** technical review of this contract before gateway implementation. Until approved and backed by verified identity, policy, and budget services, keep every provider disabled.
