# Slot Engine Integration — Known-Limitation Register

The server slot engine is a separate implementation under `src/server/slot-engine.mjs`.
The Trinity browser prototype is intentionally isolated and must not be described as mathematically equivalent to the server engine or any existing production/demo runtime.

## Verified contract differences

| Area | Trinity browser prototype | Server engine |
|---|---|---|
| Grid | 5 reels × 3 rows | 5 reels × 3 rows |
| Paylines | 3 horizontal rows | 5 lines: middle, top, bottom, and 2 diagonals |
| Symbols | A, K, Q, J, 10, CHIP, DICE, WILD, SCATTER, MULT | LEGACY_LION, OBSIDIAN_BAR, SEVEN, DIAMOND, WILD |
| Wild | Substitutes for pay symbols | Substitution logic in server evaluator |
| Scatter | 3+ anywhere awards 8× wager | No scatter award in current server contract |
| Multiplier | Any MULT on a winning grid doubles total payout | No MULT symbol in current server contract |
| Paytable | Trinity-specific per-symbol 3/4/5 match values | Separate server paytable |
| Volatility | Weighted browser symbol draw | Low/medium/high keys currently use identical weights |
| RNG | Web Crypto `getRandomValues` | Node `crypto.randomBytes` with rejection sampling |

These are separate game-math contracts. Do not port one into the other, claim parity, or promote either as a production game until the product owner approves a single canonical math specification and the expected return/volatility model is independently reviewed.

## Required follow-up

1. Capture loaded script URLs from the existing That’s My Lingo page on desktop and mobile.
2. Identify each runtime's reel generation, symbol weights, paylines, wild/scatter/multiplier rules, payout table, rounding, and RNG source.
3. Compare the existing page, Trinity prototype, and server engine against the approved canonical math specification.
4. Record any divergence here as an explicit limitation; do not silently claim parity.
5. Capture desktop and phone-browser screenshots of the demo loop as separate evidence items.
6. Keep all demo credits non-purchasable, non-transferable, non-redeemable, and without cash value.

Production remains HOLD. No real-money wagering, payment, prize redemption, or production balance is authorized by this prototype.
