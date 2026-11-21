# P1 Slot Engine — Local Validation Evidence

**Classification:** LOCAL-ONLY; not GitHub-hosted CI evidence and not release acceptance.

- Repository: `thelingolegacy-blip/TheLingoLegacy`
- Current branch: `recovery/slot-engine-option2-main-sync-2026-11-21`
- Base main SHA: `4cc0f348eae77a9a7691b11b7ba099674fa33058`
- Source engine blob: `3193be9754b8d7f235e40dfd71fae1048a7661bc`
- Test file blob: `26c689feea1d3ac95d34db22c6d8c6f825a033f8`
- Runtime: Node.js `v22.16.0`
- npm: `10.9.2`
- Command: `node --test scripts/tests/server-slot-engine.test.mjs`
- Result: **14 tests passed, 0 failed** in an isolated local scratch directory in the current recovery pass.

## Validation scope

The suite covers the candidate 20-line geometry, active-payline counts from 1 through 20, integer total-wager allocation using the actual active count, explicit non-zero remainder rejection, line payout calculation, aggregate payout, feature multiplier application after aggregation, invalid inputs, integer overflow, WILD substitution, and bounded RNG behavior.

The selected stake contract uses `wagerUnits` as the total spin stake. The engine computes `lineStakeUnits = floor(wagerUnits / activePaylines)`, exposes the remainder, and rejects any non-zero remainder rather than rounding or discarding units. Tests verify 400 units across 20 lines allocates 20 per line, 100 units across 5 lines allocates 20 per line, and 401 units across 20 lines is rejected with `remainderUnits=1`.

## Known limitations — not production acceptance

- The 20 paths are candidate geometry; exact ordering, display mapping, and wild behavior still require product acceptance.
- Low, medium, and high volatility labels currently use identical weight tables. They are not distinct profiles and must not be marketed as such.
- Paytable values are fixtures, not approved economics or RTP.
- There is no durable idempotency store, account service, transactional ledger, authenticated API, wallet integration, bonus lifecycle, or shared balance.
- The engine is not connected to the live That's My Lingo experience.
- No real-money wagering, purchases, transfers, cash-out, prize redemption, or production wallet integration is implemented or authorized.

## Hosted CI status

GitHub-hosted Actions runs on the prior candidate ended `startup_failure` before job creation. No hosted test step or artifact is claimed. The new `.github/workflows/slot-engine-contract-tests.yml` provides a focused hosted test lane for future runs, but it is not considered passed until an actual job, steps, logs, and correlated artifacts are returned.

Local test success is not hosted CI acceptance, product math approval, security acceptance, or production authorization.
