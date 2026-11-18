# Slot Engine Integration — Known-Limitation Register

Status: isolated server-side prototype; not accepted as the production That’s My Lingo game engine.

## Verified source-level boundaries

The server slot engine is a separate implementation under `src/server/slot-engine.mjs`. It uses Node's cryptographic random bytes with rejection sampling for unbiased bounded integer selection. Tests inject a deterministic 32-bit source to make outcomes reproducible.

## Known product and integration gaps

1. **Payline mismatch:** the implementation evaluates a 3-row × 5-reel matrix with five paylines. The approved That’s My Lingo presentation target is 5×3 with 20 paylines. This engine is not math- or feature-parity with that product target.
2. **Volatility mismatch:** `low`, `medium`, and `high` currently use identical symbol weights. The selector does not currently change the outcome distribution and must not be marketed as distinct volatility profiles.
3. **No persistence:** `validateIdempotencyKey` validates key syntax only. There is no durable idempotency store, atomic debit/credit ledger, replay protection across processes, or transactional spin record.
4. **No authoritative service integration:** this module is not wired to an authenticated API, account service, server-side wallet, or shared balance ledger.
5. **No live-runtime parity:** the existing live page, `lingo-os`, and Studio-grade runtime have not yet been inspected in a real browser session in this recovery pass. Their loaded script URLs and math implementations remain unverified.
6. **No release evidence:** local test evidence is not hosted CI acceptance, product acceptance, or production authorization.

## Required follow-up

1. Implement and independently review the exact 20-payline product math before claiming game parity.
2. Define distinct, approved low/medium/high weight tables and publish their math/RTP assumptions for review.
3. Implement transactional, server-authoritative play-credit accounting and durable idempotency before any shared wallet integration.
4. Capture loaded script URLs from the live demo page on desktop and mobile.
5. Diff each runtime's reel generation, symbol weights, paylines, wild/scatter rules, payout table, rounding, and RNG source against the approved math specification.
6. Capture desktop and phone-browser screenshots of the demo loop as separate evidence items.

Do not connect this prototype to purchasable, transferable, cash-equivalent, or redeemable balances. No real-money wagering, payment, cash-out, or prize redemption is authorized.