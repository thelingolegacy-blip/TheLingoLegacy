# LINGOloyalty — staging ledger

This package defines a non-cash loyalty ledger for LINGOlegacy, Loyalty Lane, and participating LINGO games. It is intentionally isolated from the production Worker and Shopify checkout.

## Non-negotiable boundaries

- LINGOcoins are promotional loyalty points only; they are not money, stored value, a deposit, or a promise of cash value.
- Game credits are a separate, non-transferable gameplay unit.
- No cash-out, person-to-person transfer, purchase of coins, wagering, prize conversion, or real-money payout endpoints exist.
- Rewarded-ad credits require server-to-server verification. Client-side completion signals are never sufficient.
- Coupon redemption requires a merchant-side approval adapter and a single-use redemption record.
- All writes require authenticated identity, origin allowlisting, idempotency, and audit records.
- No production bindings, secrets, routes, Shopify checkout changes, or payment-provider credentials are included.

## Components

- `migrations/0001_ledger.sql`: D1 schema, append-only ledger, event idempotency, daily earning controls, coupon redemption records.
- `worker.js`: fail-closed Cloudflare Worker API. It expects injected `AUTHENTICATE`, `VERIFY_AD_REWARD`, and `AUTHORIZE_MERCHANT_REDEMPTION` adapters. Missing adapters cause denial, not fallback.
- `package.json`: local test command.

## Required environment bindings

- `DB`: dedicated staging D1 database only.
- `ALLOWED_ORIGINS`: comma-separated exact HTTPS origins.
- `AUTHENTICATE(request)`: validates session and returns `{ userId }`; must reject expired, revoked, or invalid sessions.
- `VERIFY_AD_REWARD(payload)`: validates network-signed server-side callback and returns `{ userId, eventId, coins }`; reject client-supplied proof.
- `AUTHORIZE_MERCHANT_REDEMPTION(payload, userId)`: checks merchant, offer, eligibility, and available coupon inventory, returning a signed/unique authorization.

No production deployment is authorized by this package. Do not bind a production database or route.

## API

- `GET /v1/wallet`: returns separated balances and recent ledger activity.
- `POST /v1/rewards/ad`: server-verified rewarded-ad event; idempotent.
- `POST /v1/game/spend`: consumes game credits only; server-issued game event required.
- `POST /v1/coupons/redeem`: issues a merchant-approved, single-use coupon; never pays cash.

All mutation requests require an `Idempotency-Key` header. Requests without one are rejected.

## Release gates

1. Source review and schema review.
2. Local unit/integration tests.
3. Dedicated staging D1 provisioning and migration.
4. Authentication adapter security review.
5. Ad-network server-side verification certification.
6. Merchant agreement, coupon inventory, and redemption adapter validation.
7. Privacy notice, loyalty terms, tax/accounting, consumer-protection and sweepstakes review as applicable.
8. Independent security review and abuse testing.
9. Staging deployment with retrievable logs, test evidence, and rollback.
10. Explicit owner authorization before any production promotion.

A passing local test does not satisfy gates 3–10.