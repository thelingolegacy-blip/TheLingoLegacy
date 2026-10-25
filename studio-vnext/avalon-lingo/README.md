# Avalon × LINGO Legacy Integration Preview

**State:** isolated preview implementation on `studio/avalon-lingo-integration-2026-10-25`. This is not production and does not change the canonical Worker, apex/www DNS, Firebase production, email provider settings, grants, or event registration.

## Included

- `avalon-lingo.html`: responsive, dependency-free studio surface with Avalon / Kiki / LINGO domain switching; Studio Worlds cards; proposed grant-allocation visualization; demo-only House Pass; assistant readiness gate; DNS/email diagnostic state; timezone-aware event countdown; synthesized local soundboard; and explicitly simulated bracket outcomes.
- `api/worker.mjs`: isolated Cloudflare Worker API contract. It reports current preview configuration honestly and returns HTTP 503 for assistant, email, DNS, and official identity operations until real provider adapters and authentication are implemented and reviewed.
- `tests/avalon-lingo-frontend.test.mjs` and `tests/avalon-lingo-api.test.mjs`: static UI/security contracts and backend route contracts.
- `INTEGRATION.md`: integration boundary and release acceptance plan.

## Backend contract

- `GET /api/v1/avalon/status`: read-only capability state; returns `PROTECTED_HOLD` and `NOT_CONFIGURED` values in this branch.
- `POST /api/v1/avalon/assistant`: returns 503 until an authenticated, server-side AI adapter is implemented.
- `POST /api/v1/avalon/email/dispatch`: returns 503 until an authenticated provider, sender policy, abuse controls, and delivery evidence are implemented.
- `GET /api/v1/avalon/dns-check?domain=...`: allowlists only `thelingolegacy.com` and `avalonphilly.org`, but returns 503 until a real resolver adapter is wired.
- `POST /api/v1/avalon/house-id`: returns 503 until verified identity, durable unique ID issuance, authorization, and audit logging are implemented.

The browser never embeds provider credentials. No endpoint in this preview claims a message was sent, a DNS record was found, a grant was funded, an event registration was recorded, or an official ID was issued.

## Test

From `studio-vnext/` with Node.js 20 or newer:

```sh
npm test
npm run check
```

These commands are documented for execution; no GitHub Actions run is claimed by this change. The existing G02 runner-dispatch gate remains blocked until the actual assigned runner, executed sentinel, retrievable logs, and correlated evidence are independently verified.

## Production integration plan

1. Review and accept this isolated preview branch.
2. Wire the API module only to a separately named non-production Worker and verify its bindings and routes.
3. Add server-side identity validation and rate limiting before any AI or email provider integration.
4. Add real DNS resolver evidence, delivery-provider message IDs, auditable ID issuance, and persistent event-registration storage.
5. Run automated tests, browser E2E, keyboard-only, contrast, reduced-motion, forced-colors, and security checks.
6. Independently reconcile repository SHA, CI job/runner/log evidence, preview version, and live HTTP evidence.
7. Preserve `PROTECTED HOLD` until every required gate passes and independent authorization is recorded.
