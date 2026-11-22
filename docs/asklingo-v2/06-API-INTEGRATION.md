# askLINGO v2.0 — API and Integration Registry

## Current contract compatibility

The existing `docs/ASKLINGO-AI-INTEGRATION.md` defines a proposed provider-neutral endpoint `POST /api/v1/ask-lingo/query`, explicitly not yet implemented. The existing facade accepts a constrained authenticated request but intentionally returns `ASKLINGO_DISABLED`. Preserve that behavior until a separately reviewed runtime implementation is approved.

## API principles

- One first-party versioned API for web, Flutter, voice, and approved embedded clients.
- Server-side identity, policy, approval, rate-limit, and audit enforcement.
- Strict request schemas, size limits, allowlisted fields, timeouts, and generic errors.
- Provider credentials remain server-side.
- No client-supplied role, user ID, product permission, or approval state is trusted.
- Every request has a server-generated request/correlation ID.
- No conversation persistence by default.

## Proposed public query contract (design only)

Request fields: `message`, optional `conversation_id` only after persistence is approved, `surface`, `locale`, and optional product context resolved server-side. Reject unknown fields.

Response fields: `request_id`, `answer`, `citations`, `suggested_actions`, `status`, and safe error code. Suggested actions are proposals, not executable authority.

## Integration registry

| Integration | Intended role | Current status |
|---|---|---|
| Cloudflare Worker | First-party API and edge enforcement | Existing runtime target; askLINGO route not verified live |
| Firebase Auth | Candidate human identity provider | Not established; placeholders noted |
| Model provider | Inference adapter | Not selected/verified for production |
| Conversation store | Optional persistence | Disabled pending privacy approval |
| Product APIs | Scoped product context/actions | Must be inventoried and individually authorized |
| LINGOassist | Internal orchestration | Specification exists; runtime state unverified |
| Voice/WebRTC | Realtime voice experience | Design requirement; implementation unverified |

## Provider abstraction

Define a provider-neutral interface for request, response, timeout, cancellation, usage accounting, safety metadata, and error normalization. Provider selection requires data-processing, retention, regional processing, security, latency, availability, cost ceiling, and exit-strategy review. Do not hardcode a provider choice into clients.

## Tool/action contract

Every tool definition declares identity requirements, capability, product/tenant scope, resource scope, input schema, risk tier, approval policy, idempotency, timeout, output schema, audit events, and verification predicate. Tool outputs are untrusted until validated.

## Error behavior

Use stable generic codes for malformed input, authentication failure, authorization denial, approval required, rate limit, unavailable dependency, provider timeout, and internal error. Never return stack traces, prompts, tokens, or provider response internals.

## Integration onboarding

For each product: identify owner, source-of-truth API, authentication method, scopes, data classification, rate limits, sandbox, contract tests, error behavior, audit requirements, cost, and rollback. No connector is enabled based only on a product name or a prior design document.
