# Integration boundaries and acceptance plan

## Authority

This integration is a branch-only feature under Studio VNext. The canonical production Worker remains `thelingolegacyv-5`; this work does not alter `worker.js`, `wrangler.jsonc`, production bindings, DNS, or custom domains. The existing `PROTECTED HOLD` and G02 blocked state remain authoritative.

## UI feature map

| Feature | Current implementation | Production requirement |
|---|---|---|
| Avalon / Kiki / LINGO switching | Client-side presentation state | Approved content registry and owner review |
| Studio Worlds | Local navigation cards | Real route registry and approved access classifications |
| Grant allocation | $250,000 illustrative arithmetic | Board-approved budget plus finance ledger/evidence; never infer funding |
| House Pass | Local demo card with DEMO identifier | Authenticated member record, unique server-issued ID, revocation, audit trail |
| LINGOassist | Disabled unless status API reports ready/auth verified | Server-side model binding, authz, rate limits, prompt safety, usage limits, audit controls |
| Email | Disabled; no dispatch implementation | Verified sender, provider integration, allowlist/abuse protection, idempotency and provider receipt |
| DNS diagnostics | Allowlisted domains, status API contract only | Actual DNS resolver query, timestamps, TTL, failure handling and independently repeatable evidence |
| Kiki countdown | Client-side countdown to July 20, 2027 18:00 America/New_York | Confirmed date/time/venue; registration service if signups are required |
| Audio | Locally synthesized demo tones | Rights-cleared media if recorded tracks are introduced |
| Brackets | Randomly generated simulation outcomes | Judge identity, scoring rubric, tie resolution, immutable results, owner-approved publication |

## API contract

The isolated `api/worker.mjs` has no external service bindings. Its purpose is to establish truthful route/method/security contracts and prevent fake success states. The API intentionally fails closed for all operations that would require an external service.

- Status is read-only and uses `Cache-Control: no-store`.
- Non-allowlisted DNS query domains receive HTTP 400.
- Unconfigured provider actions return HTTP 503 with `INTEGRATION_NOT_CONFIGURED`.
- Unsupported methods return HTTP 405 with an `Allow` header.
- Unknown routes return JSON HTTP 404.
- No route issues a credential, sends an email, calls an AI provider, or certifies live DNS.

## Acceptance evidence required

- [ ] Frontend and API contract tests pass in an actual local Node 20+ checkout.
- [ ] Existing Studio VNext test suite passes.
- [ ] Browser checks cover 390×844 and 1440×900; navigation, form states, timer, audio cleanup and bracket reset are verified.
- [ ] Keyboard-only navigation, focus order, screen-reader announcements, contrast, reduced-motion and forced-colors are independently audited.
- [ ] API module is wired to a separately named preview Worker, not the production Worker, and route probes match the contract.
- [ ] Secret scanning and dependency review pass; no client-side provider keys.
- [ ] G02 passes its full predicate: positive runner ID, expected runner name, job assignment, initialized steps, executed sentinel, retrievable logs, and correlated artifact evidence.
- [ ] Independent review and explicit release authorization recorded before any promotion.

Unknown, unavailable, or unverified states remain blocked. Do not promote from this branch.
