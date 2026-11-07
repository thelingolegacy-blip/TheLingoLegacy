# LINGO Server-Authoritative Game Foundation — Staging Implementation Package

**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Disposition:** Draft implementation; staging only; not deployed or production accepted.  
**Production mutation:** None.  
**Payment / cashout activation:** None.

## Included

- Unbiased bounded integer sampling over Web Crypto `getRandomValues` using rejection sampling.
- Integer-unit wager and payout validation; no floating-point wallet arithmetic.
- D1 transaction-oriented spin persistence with per-user idempotency keys.
- Append-only wallet ledger triggers that atomically apply ledger deltas and reject overdrafts.
- Staging-only additive schema with account, wallet, session, ledger, and progression tables.
- Deterministic unit tests using an injected random source.

## Integration contract

The caller must first verify a Firebase ID token with the existing `src/auth/firebase-id-token.mjs` verifier, then pass only the verified Firebase UID to `playAndSettleD1Spin`. The identity verifier does not itself authorize a wager. The caller must validate game access, wager limits, account state, game/rule version, request rate limits, and idempotency key before settlement.

The SQL migration is not applied to any Cloudflare D1 database by this PR. The current production D1 schema uses an existing integer-ID `users` table and does not contain the new wallet/session tables. Apply only to a dedicated staging D1 database after a database backup and migration dry-run. Do not bind this schema to production until compatibility, concurrency, and rollback tests pass.

## Deliberate non-goals

- No Stripe webhook or top-up endpoint.
- No redeemable currency, cash prizes, cashout, or real-money wagering.
- No production Worker route, DNS, Cloudflare binding, or secret changes.
- No claim of certified RTP, game fairness, regulatory approval, or production readiness.

## Local verification

Run:

```bash
node --test scripts/tests/server-slot-engine.test.mjs
python3 scripts/tests/test-slot-wallet-migration.py
```

The Node suite validates pure game-engine primitives. The Python standard-library SQLite harness validates migration syntax, ledger triggers, overdraft rejection, and append-only behavior against SQLite. Cloudflare D1 concurrency and API integration still require tests against a disposable staging D1 database.
