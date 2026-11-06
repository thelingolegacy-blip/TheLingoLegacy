# askLINGO — Assistant Service Contract

**Status: PLANNED / NOT PRODUCTION ENABLED.** This document defines the intended integration boundary. It is not evidence that an AI provider, chat endpoint, conversation store, or app integration is live.

## Verified runtime state

At the current source baseline:

- The production Worker exposes platform status, runtime, gate, module, and site-context endpoints.
- `/api/v1/site/context` explicitly reports `ask_lingo: false`.
- The Worker returns 404 for unrecognized `/api/*` routes. There is no implemented askLINGO query/chat route in the production Worker.
- The production Worker bindings currently include the static asset binding and public canonical-domain variables. No D1, KV, Firebase, or model-provider binding is configured on that Worker.
- Cloudflare D1 databases and KV namespaces exist in the account, but their existence does not mean this Worker is bound to them or that conversation storage is active.
- Flutter Firebase options still contain placeholder API keys and app IDs. Firebase authentication cannot be treated as configured from those values.
- No model provider has been selected or verified for production. Do not claim Claude, Gemini, OpenAI, or any other provider is connected until the provider credential, binding, and live request are independently verified.

## Current implementation work (not yet accepted)

An OpenAI Responses API adapter is being prepared on draft PR #490. It is a private server-side integration scaffold, not a production provider connection. Paid inference and billing approval are separately gated and remain disabled under the $0 authorization. The adapter sets `store: false`, applies bounded input/output and timeout controls, and requires a trusted internal caller token. The public askLINGO query facade, Firebase identity verification, global rate limiting, and client integrations are not implemented by that adapter.

## Intended architecture

Use one provider-neutral askLINGO service behind the Cloudflare Worker. Web pages, subdomains, Flutter, and studio surfaces should call the same first-party API client. Provider credentials must remain in Cloudflare Worker secrets or another approved server-side secret store; never ship them to browser or mobile clients.

The provider adapter should be selected only after latency, data handling, safety, rate-limit, and cost review. Multi-provider routing or fallback is optional future work, not a prerequisite for the first safe implementation.

### Proposed endpoint contract — not yet implemented

`POST /api/v1/ask-lingo/query`

Request:

```json
{
  "message": "A user question",
  "conversation_id": null,
  "surface": "web",
  "locale": "en-US"
}
```

Successful response:

```json
{
  "request_id": "server-generated-id",
  "answer": "Assistant response",
  "citations": [],
  "suggested_actions": [],
  "status": "ok"
}
```

The request and response are a proposed contract only. The endpoint must not be presented as available until implemented and live-probed.

Expected failure behavior:

- `400`: malformed or over-limit request.
- `401`: required identity token is absent or invalid.
- `429`: rate limit exceeded.
- `503`: provider or service is not configured or temporarily unavailable.
- `500`: generic error only; never return provider credentials, stack traces, or internal prompts.

## Security and privacy requirements

1. Validate request shape, content type, message length, and allowed fields server-side.
2. Keep provider keys server-side and rotate them through the provider's secret manager; never commit credentials.
3. Verify Firebase ID tokens server-side if Firebase Auth is selected. Do not trust a client-supplied user ID.
4. Require stronger authorization for studio, operational, finance, and executive actions. Public chat must not grant operational permissions.
5. Apply edge rate limiting and abuse controls across Worker isolates. An in-memory per-isolate map is not a global rate limiter.
6. Treat user messages, uploaded content, and retrieved documents as untrusted input. Defend against prompt injection and tool/action escalation.
7. Do not persist conversation contents until retention, consent, deletion, access controls, and applicable child-privacy requirements have been reviewed.
8. If conversation persistence is later approved, use a dedicated schema with tenant/user isolation, retention limits, deletion handling, and audit metadata. Existing D1 tables are not automatically approved for chat history.
9. Do not describe the service as GDPR- or COPPA-compliant until an appropriate privacy and legal review verifies the implementation and operating practices.

## Integration sequence

1. Approve provider, data-processing terms, cost ceiling, and secret ownership.
2. Implement the Worker endpoint with request validation, provider adapter, timeout, rate limit, and generic failure responses.
3. Add identity verification and role-based access for any personalized or operational capabilities.
4. Add the shared web client and Flutter client. All active subdomains should consume the same endpoint rather than duplicating provider logic.
5. Keep the UI feature flag off until live endpoint probes and security tests pass.
6. Test web, mobile, CORS, invalid tokens, provider timeout, rate limiting, abuse cases, secret leakage, deletion/retention, and accessibility.
7. Enable the feature only after independent verification and release authorization.

## Explicit non-claims

- No active production askLINGO endpoint.
- No confirmed provider connection or provider credentials.
- No verified chat-history persistence.
- No active Firebase Auth integration.
- No operational agent/webhook permissions.
- No production launch or compliance certification.

**Branding:** use `askLINGO` and The Lingo Legacy naming. Do not add star symbols to product names.
