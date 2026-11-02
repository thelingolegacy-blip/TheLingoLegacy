# LINGOloyalty — staging ledger

This package defines a non-cash loyalty ledger for LINGOlegacy, Loyalty Lane, and participating LINGO games. It is isolated from production Workers and Shopify checkout.

## Non-negotiable boundaries

- LINGOcoins are promotional loyalty points only; they are not money, stored value, a deposit, or a promise of cash value.
- Game credits are a separate, non-transferable gameplay unit.
- No cash-out, person-to-person transfer, purchase of coins, wagering, prize conversion, or real-money payout endpoints exist.
- Rewarded-ad credits require server-to-server verification. Client-side completion signals are never sufficient.
- Game credits require a trusted game-server grant or spend authorization.
- Coupon redemption requires merchant-side approval and a single-use redemption record.
- No production bindings, secrets, routes, Shopify checkout changes, or payment-provider credentials are included.

## Components

- `migrations/0001_ledger.sql`: D1 schema, append-only ledger, idempotency constraints, balance view, and coupon redemption records.\n- `migrations/0002_ledger_guards.sql`: unit/event compatibility, event-sign, and nonnegative-balance triggers.
- `worker.js`: fail-closed API draft. It is not deployable as-is: its `env.AUTHENTICATE`, `env.VERIFY_AD_REWARD`, `env.VERIFY_GAME_GRANT`, `env.VERIFY_GAME_EVENT`, `env.RATE_LIMITER`, and `env.AUTHORIZE_MERCHANT_REDEMPTION` hooks are interface placeholders, not Cloudflare binding types. Replace them with reviewed module implementations or supported bindings before deployment.
- `package.json`: Node policy test command.

## Staging database

A dedicated U.S.-jurisdiction Cloudflare D1 database named `lingo-loyalty-staging` has been provisioned and both migrations have been applied. Its identifier is recorded in the release-gate register. It is not a production database and is not bound to a Worker. No user, reward, or merchant data has been seeded. A separate ephemeral D1 database was used to execute positive-balance, negative-balance rejection, unit/event mismatch rejection, append-only update rejection, idempotency and separated-balance checks; it was deleted after the checks.

## API draft

- `GET /v1/wallet`: returns separated balances and recent ledger activity.
- `POST /v1/rewards/ad`: server-verified rewarded-ad event; idempotent.
- `POST /v1/game/grant`: trusted game-server credit grant.
- `POST /v1/game/spend`: consumes game credits only; trusted game event required.
- `POST /v1/coupons/redeem`: issues a merchant-approved, single-use coupon; never pays cash.

## Required implementation before deployment

- Replace function-shaped environment placeholders with supported Worker module implementations and secret/binding contracts.
- Implement Firebase/session token verification, expiry and revocation handling.
- Implement HMAC or provider-native signature validation and replay protection for ad, game, and merchant callbacks.
- Implement an atomic per-user/per-route rate limiter using supported Cloudflare primitives.
- Check every D1 mutation result and return explicit duplicate/idempotency outcomes.
- Add negative-balance protection, unit/event consistency constraints, and concurrency tests.
- Configure exact HTTPS origins, CSP, CORS, and security headers.
- Add integration tests for auth failures, replayed callbacks, duplicate events, daily caps, insufficient game credits, coupon reuse, and suspended wallets.

## Release gates

1. Source review and schema review.
2. Local unit/integration tests.
3. Dedicated staging D1 provisioning and migration.
4. Authentication and callback signature security review.
5. Ad-network server-side verification certification.
6. Merchant agreement, coupon inventory, and redemption adapter validation.
7. Privacy notice, loyalty terms, tax/accounting, consumer-protection and sweepstakes review as applicable.
8. Independent security review and abuse testing.
9. Staging Worker deployment with retrievable logs, test evidence, and rollback.
10. Explicit owner authorization before any production promotion.

A passing local test does not satisfy gates 4–10.
