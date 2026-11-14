# Slot Engine Integration — Known-Limitation Register

The server slot engine is a separate implementation under `src/server/slot-engine.mjs`.
The existing live page, `lingo-os`, and Studio-grade runtime have not yet been inspected in a real browser session in this recovery pass. Their loaded script URLs and math implementations therefore remain unverified.

Required follow-up:
1. Capture loaded script URLs from the live demo page on desktop and mobile.
2. Identify each runtime's reel generation, symbol weights, paylines, wild/scatter rules, payout table, rounding, and RNG source.
3. Diff each runtime against this engine.
4. Record any divergence here as an explicit limitation; do not silently claim parity.
5. Capture desktop and phone-browser screenshots of the demo loop as separate evidence items.
