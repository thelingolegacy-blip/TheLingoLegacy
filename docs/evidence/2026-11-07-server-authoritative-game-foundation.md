# LINGO Server-Authoritative Game Foundation — Staging Implementation Package

**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Disposition:** Draft implementation; isolated staging deployed; not production accepted.  
**Production mutation:** None.  
**Payment / cashout activation:** None.

## Included

- Unbiased bounded integer sampling over Web Crypto `getRandomValues` using rejection sampling.
- Integer-unit wager and payout validation; no floating-point wallet arithmetic.
- D1 transaction-oriented spin persistence with per-user idempotency keys.
- Append-only wallet ledger triggers that atomically apply ledger deltas and reject overdrafts.
- Staging-only additive schema with account, wallet, session, ledger, and progression tables.
- Deterministic unit tests using an injected random source.
- A staging Worker wrapper with health, account bootstrap, wallet balance, and slot spin routes.

## Integration contract

The Worker verifies a Firebase ID token with the existing `src/auth/firebase-id-token.mjs` verifier, then passes only the verified Firebase UID to `playAndSettleD1Spin`. The identity verifier does not itself authorize a wager. The API must still validate game access, wager limits, account state, game/rule version, request rate limits, and idempotency key before settlement.

The SQL migration has been applied only to the dedicated staging D1 database `lingo-game-engine-staging-20261107` (`793ab138-7818-47c9-ad01-b319ad34a8c5`). It has not been applied to the production D1 database. The current production D1 schema uses an existing integer-ID `users` table and does not contain these wallet/session tables. See [live staging verification](2026-11-07-staging-game-engine-live-check.md).

## Deliberate non-goals

- No Stripe webhook or top-up endpoint.
- No redeemable currency, cash prizes, cashout, or real-money wagering.
- No production Worker route, DNS, Cloudflare binding, or secret changes.
- No claim of certified RTP, regulatory approval, or production readiness.

## Local verification

Run:

```bash
node --check cloudflare/workers/lingo-game-engine-staging.mjs
node --check src/server/slot-engine.mjs
node --check src/server/d1-slot-service.mjs
node --test scripts/tests/lingo-game-worker.test.mjs scripts/tests/server-slot-engine.test.mjs
python3 scripts/tests/test-slot-wallet-migration.py
```

The Node suite validates pure engine primitives and the Worker health/auth-fail-closed route behavior. The Python standard-library SQLite harness validates migration syntax, ledger triggers, overdraft rollback, and append-only behavior. A successful D1 staging transaction and overdraft rollback were also exercised directly. Distributed concurrency, Firebase customer-token flow, external HTTP health, frontend integration, and production acceptance remain outstanding.
