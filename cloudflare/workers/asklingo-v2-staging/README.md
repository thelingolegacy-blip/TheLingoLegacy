# askLINGO Cloudflare staging gateway

**Status: source-only staging candidate; not deployed.** This Worker is intentionally an authorization preflight, not a functioning chat service.

## Safety behavior
- Firebase ID tokens are signature-verified server-side against Google's Secure Token signing keys, with issuer and audience pinned to `FIREBASE_PROJECT_ID`.
- Every request checks Firebase account status and `validSince` through the Identity Toolkit account lookup, rejecting disabled users and tokens issued before revocation.
- A verified UID and signed `tenant_id` custom claim must map to one active `principals` row; a non-expired, non-revoked staging grant must match that exact tenant and `asklingo / assistant / query / query` scope for web/mobile, or `asklingo / studio-assistant / query / query` for studio. These are distinct grants. Client-supplied tenant IDs are rejected.
- Authenticated-principal rate limits and security audit events use the existing D1 tables. Raw tokens and message bodies are not persisted.
- A Cloudflare edge/IP rate-limit rule for unauthenticated traffic is still a required deployment prerequisite; the D1 principal bucket cannot protect requests before identity verification.
- Missing identity configuration, D1 binding, principal, grant, audit persistence, or provider/privacy approval fails closed.
- No provider adapter, inference, conversation history, agent tools, operational actions, payment actions, or production route is enabled.

## Required staging bindings and variables
- `ASKLINGO_DB`: existing dedicated staging D1 database binding.
- `FIREBASE_PROJECT_ID`: exact, independently verified staging Firebase project ID. Do not set until ownership and app registration are verified.
- `FIREBASE_WEB_API_KEY`: the staging project's public Firebase web API key, supplied as a Worker variable and never committed. The account-status/revocation lookup fails closed when absent.
- `ASKLINGO_ALLOWED_ORIGINS`: comma-separated exact HTTPS origins; no wildcard.

Do not add credentials or secret values to source. Provider configuration is deliberately absent. This candidate returns `503 PROVIDER_AND_PRIVACY_GATE_PENDING` after identity and grant checks.

## D1 authorization model
- `principals`: maps verified `(issuer, subject, tenant_id)` to an active principal.
- `grants`: requires exact product, resource, operation, staging environment, active status and validity interval.
- `rate_limit_buckets`: atomic per-principal minute window.
- `audit_events`: deny/blocked decisions with correlation IDs and non-sensitive reason metadata.
- `approvals`: reserved for separately designed action workflows; this read-only query endpoint cannot consume approvals or execute actions.
- `idempotency_keys`: not used because this candidate does not execute or persist a mutation.

## Local verification
Run `npm test` from this directory with Node.js 20 or later. Tests exercise the fail-closed routing and request validation; they do not replace signed-token, live D1, Cloudflare integration, privacy, or independent security acceptance.

## Deployment gate
Do not deploy or attach routes until staging Firebase ownership/configuration, migration review, signed-token integration tests, D1 audit/grant tests, CORS origin review, privacy/provider decisions, rollback evidence and separate release authorization are complete.