# P1 Slot Engine — Security Note

Status: isolated recovery branch; server-side prototype and test implementation only.

- Credits are demo-only units. They have no cash value and are not purchasable, transferable, or redeemable.
- No redemption, withdrawal, prize-claim, payment, or cash-out endpoint is implemented by this engine.
- The spin generator uses Node cryptographic random bytes with rejection sampling; deterministic test vectors are injected only in tests.
- The module is not connected to an authenticated API, durable idempotency store, transactional wallet ledger, or shared account balance.
- The current five-payline prototype is not equivalent to the approved 20-payline That’s My Lingo product target. Its three volatility labels currently use identical symbol weights.
- No secrets, API keys, tokens, credentials, or private configuration belong in this repository.
- This prototype is not authorization for real-money wagering or production balances.
- Any future payment, prize, sweepstakes, or redemption feature requires separate legal, security, accounting, and release review.
- Production remains PROTECTED HOLD. Do not merge or deploy based solely on local tests or source review.