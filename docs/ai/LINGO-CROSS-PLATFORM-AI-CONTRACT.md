# LINGO AI — Cross-Platform Integration Contract

Status: **CONTRACT / NOT CONNECTED / NOT PRODUCTION ENABLED**

This contract prepares all LINGO clients to share one AI boundary without embedding provider credentials or granting clients operational authority.

## Cost and release invariants

- Authorized OpenAI API spend: **$0**.
- No API credits, paid requests, automatic recharge, or paid inference are authorized.
- `LINGO_AI_PAID_API_ENABLED` and `LINGO_AI_BILLING_APPROVED` must remain unset or false.
- The API gateway must return `423 PAID_INFERENCE_DISABLED` before any provider network request.
- No production deployment, route mutation, key creation, or activation is authorized by this contract.
- The G02 release hold remains in force.

## One service, many clients

All clients use the first-party LINGO API boundary. No client calls api.openai.com directly.

| Surface | Client integration target | Current readiness |
|---|---|---|
| Web | Shared HTTPS API client | Contract prepared; identity not verified |
| iOS | Flutter/Dart API client | Firebase options are placeholders |
| Android | Flutter/Dart API client | Firebase options are placeholders |
| Desktop | Same HTTPS API contract | No client integration verified |
| Smart TV | Restricted HTTPS client | No client integration verified |
| Unity / Unreal games | Game-side service adapter | No client integration verified |

## Trust boundaries

1. Client sends an authenticated user session to a trusted first-party backend.
2. The backend verifies identity and authorization. Firebase ID tokens must be cryptographically verified server-side if Firebase Auth is selected; a client-supplied UID is never identity proof.
3. The backend enforces product, age, role, quota, consent, and abuse policy.
4. Only a trusted backend may call the internal inference route using a server-held credential.
5. The Worker enforces the independent paid-inference and billing-approval gates before calling OpenAI.
6. Provider keys and internal service tokens are never returned to clients or written to logs.

**Important:** The public askLINGO facade now verifies Firebase ID-token signatures and core claims before accepting requests. It does not perform token revocation or disabled-account checks yet. The internal inference route remains a separate server-to-server interface; never expose its token to browser, Flutter, desktop, TV, Unity, or Unreal clients.

## API endpoints

- `GET /api/v1/ai/status`: non-secret service mode status.
- `POST /api/v1/ai/responses`: private backend-only Responses API adapter. Requires a trusted internal token and both paid-use approval gates. It remains disabled under the current $0 policy.

The status route does not prove that an API key is valid, model access is enabled, or the upstream provider is reachable.

## Authenticated askLINGO facade (implemented but disabled)

`POST /api/v1/ask-lingo/query` accepts a Firebase bearer ID token and this bounded request:

```json
{
  "message": "User's message",
  "surface": "web",
  "locale": "en-US",
  "conversation_id": null
}
```

It must return a stable product envelope, independent of provider-specific response shapes:

```json
{
  "request_id": "server-generated-id",
  "answer": "Response text",
  "status": "ok"
}
```

The Worker validates the identity token, request fields, and message length, then returns HTTP 423 `ASKLINGO_DISABLED` while the zero-spend policy is active. It does not call a model or persist prompts. The facade's in-memory rate limit is per Worker isolate, not a shared global control. It must not forward the private internal token or provider credential to the client.

## No-cost development mode

During the $0 phase, test UI rendering and client networking against local mocks and deterministic fixtures. Do not add a public demo endpoint that can be mistaken for live AI. Mark mock responses as `source: mock` in development and never label them as model-generated. Keep mocks out of production builds unless a reviewed feature flag explicitly enables them.

## Privacy and retention

- Do not persist prompts, responses, user IDs, or conversation history until consent, retention, deletion, access control, child-safety, and legal requirements have been reviewed.
- Do not send account, payment, wallet, health, precise location, or other sensitive data to a model by default.
- Treat user input and retrieved content as untrusted. Model output is not authorization.
- Operational actions require separate role-based authorization and human approval; chat text cannot grant permissions.

## Completion gates

- [x] Provider credentials remain server-side by design.
- [x] Internal inference route requires a trusted backend token.
- [x] Paid inference and billing approval are independent gates.
- [x] Web, mobile, desktop, TV, and game-client boundaries documented.
- [x] Server-side Firebase ID-token signature and core claim verification implemented in the isolated feature branch.
- [ ] Genuine Firebase app options and Firebase project configuration independently verified.
- [x] Authenticated askLINGO facade scaffold validates Firebase bearer identity and request shape; inference remains disabled.
- [ ] Authenticated facade receives independent security review.
- [ ] Shared edge rate limiting across Worker isolates, quotas, abuse controls, and request tracing implemented. Current in-memory limit is per isolate only.
- [ ] Client SDKs integrated and tested on actual target platforms.
- [ ] Privacy/retention review completed.
- [ ] Staging probes and independent acceptance completed.
- [ ] Separate founder authorization for paid inference and production promotion.

## Rollback

Keep the paid-use gates false. If a future integration behaves unexpectedly, disable its product feature flag, remove the affected staging binding, and revert the isolated feature branch. Never roll back by weakening identity checks or release gates.
