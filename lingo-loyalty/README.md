# LINGOloyalty — staging ledger

This package defines a non-cash loyalty ledger for LINGOlegacy, Loyalty Lane, and participating LINGO games. It is isolated from production Workers and Shopify checkout.

## Non-negotiable boundaries

- LINGOcoins are promotional loyalty points only; they are not money, stored value, a deposit, or a promise of cash value.
- Game credits are a separate, non-transferable gameplay unit.
- No cash-out, person-to-person transfer, purchase of coins, wagering, prize conversion, or real-money payout endpoints exist.
- Rewarded-ad credits require a server-to-server HMAC-signed callback. Client-side completion signals are never sufficient.
- Game credits require a game-server HMAC-signed grant or spend event.
- Coupon redemption requires a merchant-authorized HMAC-signed request and a single-use redemption record.
- No production bindings, secrets, routes, Shopify checkout changes, or payment-provider credentials are included.

## Components

- `migrations/0001_ledger.sql`: D1 schema, append-only ledger, idempotency constraints, balance view, and coupon redemption records.
- `migrations/0002_ledger_guards.sql`: unit/event compatibility, event-sign, and nonnegative-balance triggers.
- `migrations/0003_rate_limits.sql`: atomic per-user/per-route request-window counters.
- `worker.js`: Cloudflare module Worker draft with Firebase ID-token signature validation, HMAC callback verification, D1-backed rate limits, idempotency checks, wallet-state checks, and scheduled rate-limit cleanup.
- `wrangler.toml`: isolated staging D1 binding, no route or workers.dev exposure, and daily cleanup cron. It contains no secret values.
- `package.json`: Node policy test command.

## Staging database

A dedicated U.S.-jurisdiction Cloudflare D1 database named `lingo-loyalty-staging` has been provisioned and migrations 0001–0003 have been applied. Identifier: `54ce928b-d540-4bce-816f-e89cb30b8fdf`. It is not bound to a Worker. No user, reward, or merchant data has been seeded.

A separate ephemeral D1 database was used to execute balance-separation, duplicate-idempotency, negative-balance rejection, unit/event mismatch rejection, and append-only update-rejection checks; it was deleted after the checks.

## Worker configuration required before deployment

Set these values only in the Cloudflare staging Worker environment; never commit secret values:

- `FIREBASE_PROJECT_ID`: exact Firebase project ID for the staging identity project.
- `ALLOWED_ORIGINS`: exact HTTPS origins allowed to call the browser API.
- `AD_REWARD_HMAC_SECRET`: random secret shared only with the approved ad callback service.
- `GAME_EVENT_HMAC_SECRET`: random secret shared only with the trusted LINGO game server.
- `MERCHANT_AUTH_HMAC_SECRET`: random secret shared only with the approved merchant authorization service.

HMAC callbacks use `X-LINGO-Timestamp` and `X-LINGO-Signature`; signatures cover `timestamp + "." + raw request body`, use HMAC-SHA256 hex, and are accepted only within a five-minute clock window. Unique event IDs and idempotency keys prevent replayed credits.

Firebase ID-token signature, issuer, audience and expiry are checked against Google's published signing keys. **Token revocation is not checked by this implementation**; before production, add a reviewed revocation strategy or a trusted identity gateway with revocation enforcement.

The Worker must not be deployed until the staging Firebase project, callback signers, secret rotation procedure, origin list, rate-limit thresholds and operational alerting are approved and tested. Use Wrangler secret commands from an authorized owner-controlled environment; do not paste secrets into chat or Git.

## API

- `GET /v1/wallet`: Firebase-authenticated balances and recent ledger activity.
- `POST /v1/rewards/ad`: signed server-side rewarded-ad event.
- `POST /v1/game/grant`: signed game-server credit grant.
- `POST /v1/game/spend`: Firebase-authenticated, signed game spend event.
- `POST /v1/coupons/redeem`: Firebase-authenticated, merchant-signed coupon authorization.

All mutations require an idempotency key and an active wallet. D1 triggers reject invalid unit/event combinations and negative balances. Rate limits are stored in D1 and old windows are pruned daily.

## Remaining release gates

1. Local Node test suite and static type/syntax validation.
2. Independent review of JWT, HMAC, replay, CORS, rate limiting, SQL concurrency and coupon authorization.
3. Configure staging Firebase project and approved callback signers.
4. Execute integration tests against staging Worker with retrievable logs and rollback.
5. Ad-network server-side verification certification.
6. Merchant agreements, coupon inventory and merchant redemption tests.
7. Privacy notice, loyalty terms, tax/accounting, consumer-protection and sweepstakes review as applicable.
8. Abuse testing, operational alerting and incident/secret-rotation runbooks.
9. Independent security acceptance.
10. Explicit owner authorization before any production promotion.

A passing local test or static preview does not satisfy gates 2–10.
