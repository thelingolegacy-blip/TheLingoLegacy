# Slot Engine Integration — Known-Limitation Register

Status: isolated server-side prototype; not accepted as the production That’s My Lingo game engine.

## Verified source-level boundaries

The server slot engine is a separate implementation under `src/server/slot-engine.mjs`. It uses Node's cryptographic random bytes with rejection sampling for unbiased bounded integer selection. Tests inject a deterministic 32-bit source to make outcomes reproducible.

## Known product and integration gaps

1. **Payline geometry:** the implementation defines 20 unique candidate five-reel paths across a three-row matrix (5 reels × 3 rows). The evaluator now accepts `activePaylines` from 1 through 20 and evaluates the first N paths in configured order. Product-owner confirmation is still required for the approved path set, line numbering/order, activation behavior, line-direction rules, and wild behavior. This is source-level capability, not accepted math or feature parity.
2. **Stake remainder policy:** `wagerUnits` is the total spin stake. `calculateLineStakeAllocation` divides by the actual `activePaylines` count using integer arithmetic. A non-zero remainder is explicitly rejected with its remainder value; no floating-point allocation, silent truncation, or discarded stake is permitted. Product owner must confirm that rejection is the intended denomination policy.
3. **Feature multiplier:** the evaluator accepts a positive integer `featureMultiplier` and applies it once to the aggregate of winning-line payouts after the line payouts are summed. This does not implement bonus triggers, feature state, free spins, or a feature lifecycle. Fractional multipliers are not supported.
4. **Volatility mismatch:** `low`, `medium`, and `high` currently use identical symbol weights. The selector does not currently change the outcome distribution and must not be marketed as distinct volatility profiles.
5. **No persistence:** `validateIdempotencyKey` validates key syntax only. There is no durable idempotency store, atomic debit/credit ledger, replay protection across processes, or transactional spin record.
6. **No authoritative service integration:** this module is not wired to an authenticated API, account service, server-side wallet, or shared balance ledger.
7. **No live-runtime parity:** the existing live page, `lingo-os`, and Studio-grade runtime have not yet been inspected in a real browser session in this recovery pass. Their loaded script URLs and math implementations remain unverified.
8. **No release evidence:** local test evidence is not hosted CI acceptance, product acceptance, or production authorization. The updated local scratch suite reports 14 passed, 0 failed. Four exact-head GitHub workflow runs after the branch update ended `startup_failure`; the Jobs API and Artifacts API each returned zero records for all four runs, so no hosted test step executed.

## Required follow-up

1. Independently review and approve the candidate 20-line geometry, active-line ordering/selection, line-direction rules, remainder-rejection policy, feature-multiplier semantics, and exact product math before claiming game parity.
2. Define distinct, approved low/medium/high weight tables and publish their math/RTP assumptions for review.
3. Implement a real feature-trigger/state lifecycle only after product rules are approved; keep the current integer multiplier hook as a calculation contract only.
4. Implement transactional, server-authoritative play-credit accounting and durable idempotency before any shared wallet integration.
5. Capture loaded script URLs from the live demo page on desktop and mobile.
6. Diff each runtime's reel generation, symbol weights, paylines, wild/scatter rules, payout table, rounding, and RNG source against the approved math specification.
7. Capture desktop and phone-browser screenshots of the demo loop as separate evidence items.
8. **Local suite:** 14 passed, 0 failed in an isolated Node.js v22.16.0 scratch run. This is local-only evidence, not hosted acceptance. **Hosted suite:** four exact-head runs ended `startup_failure`; each returned zero jobs and zero artifacts.

Do not connect this prototype to purchasable, transferable, cash-equivalent, or redeemable balances. No real-money wagering, payment, cash-out, or prize redemption is authorized.

## Future demo-credit ledger design (proposal only)

This section is an implementation-neutral acceptance design. It does not authorize a wallet connection, payment integration, or live balance mutation.

### Transaction boundary

A future authenticated spin request should be processed as one database transaction:

1. Resolve the authenticated account identity server-side; never accept an account ID or balance as authoritative from the client.
2. Validate the request and compute a canonical request fingerprint covering game/version, wager units, selected approved volatility profile, and relevant ruleset version.
3. Insert a spin request row with a unique key on (account_id, idempotency_key). Persist the request fingerprint and state.
4. If the key already exists, compare fingerprints. Return the original committed result for an exact retry; reject a key reused with different request content.
5. Lock or atomically update the account's demo-credit balance and reject insufficient balance without partial writes.
6. Persist one immutable debit ledger entry, the spin outcome, payout calculation, and any credit ledger entry in the same transaction.
7. Commit the spin result and ledger entries together. A failure at any point must roll back all balance and spin mutations.
8. Return the stored result for retries; never regenerate a new random outcome for an already committed idempotency key.

### Minimum data and integrity constraints

- Spin request: account scope, idempotency key, canonical request hash, ruleset/version, state, outcome, wager units, payout units, timestamps.
- Ledger entry: immutable account-scoped record, unique transaction reference, entry type, signed integer units, associated spin ID, and creation timestamp.
- Database constraints: unique (account_id, idempotency_key), unique ledger transaction reference, foreign keys to account/spin records, positive wager, non-negative payout, and integer-safe balance arithmetic.
- Auditability: correlate each spin, debit, payout, and retry to one stable spin ID; do not log credentials or raw bearer tokens.
- Concurrency: serialize balance-affecting requests per account or use an atomic conditional update with a balance floor; verify behavior under concurrent duplicate requests.

### Acceptance tests required before integration

- Same key + same request returns byte-equivalent stored outcome without a second debit.
- Same key + different request is rejected and causes no ledger mutation.
- Two concurrent requests with the same key create exactly one spin and one debit.
- Insufficient balance creates no spin/debit/payout record.
- Forced failure after debit but before payout rolls back every write.
- Forced failure after outcome persistence but before commit rolls back every write.
- A retry after simulated client timeout returns the committed result.
- Balance reconciliation equals opening demo credits plus ledger entries.
- No client-supplied balance, payout, account ID, or RNG result can override server-calculated values.

### Volatility / RTP acceptance

Do not choose numeric weights by intuition. For each approved profile, retain the exact symbol-weight vector, reel independence assumptions, paytable version, wild/scatter rules, line set, and wager interpretation. Calculate theoretical RTP and hit frequency from the complete ruleset; use Monte Carlo only as a secondary implementation cross-check. Distinct labels must map to distinct approved distributions, and regression tests must prove profile separation. No RTP or volatility claim is accepted until the math is independently reviewed.
