# P1 Slot Engine — Local Validation Evidence

**Classification:** LOCAL-ONLY; not GitHub-hosted CI evidence and not release acceptance.

- Repository: `thelingolegacy-blip/TheLingoLegacy`
- Branch: `recovery/p1-slot-engine-restore`
- Branch head read back for this run: `6c894f53345cae9416fb9390fbb39990440af650`
- Source engine blob: `6a5f79fc3cd9c34e1763104a9244628f9f7e4925`
- Test file blob: `364aac9199dfc4be35c00ed3443d422d46b9087a`
- Runtime: Node.js `v22.16.0`
- npm: `10.9.2`
- Command: `npm test`
- Result: **11 tests passed, 0 failed**.

## Validation scope

The branch-read-back engine, tests, and package manifest were copied into an isolated scratch directory and executed with the repository's `npm test` command. The suite covers the fixed 20-line geometry, equal total-wager allocation, exact divisibility rejection, line payout calculation, aggregate payout, invalid inputs, integer overflow, WILD substitution, and bounded RNG behavior.

The new stake contract uses `wagerUnits` as the total spin stake. The engine computes `lineStakeUnits = wagerUnits / 20`, rejects any wager that is not exactly divisible by the active line count, and calculates each winning line from its allocated line stake. The tests explicitly verify a 400-unit spin allocates 20 units to each line and rejects 401 units.

## Source SHA-256

- `package.json`: `01f918bfc14f6dda3699173312ebd324c597e571780be5d089b1dfccb36bde38`
- `src/server/slot-engine.mjs`: `ad1cc1345f64540750f053f586e7776faae9883754600985e805bad9b9f71b69`
- `scripts/tests/server-slot-engine.test.mjs`: `189fc9d6cc103e431875b663c2c33a50dedc7ca867503e168fd7b5c27846f256`

This evidence records a local isolated runtime execution of the fetched branch files. It does not establish that GitHub Actions started, that an Actions job completed, or that a hosted artifact was uploaded. Hosted acceptance still requires a completed GitHub-hosted run correlated to the final commit SHA, provider-observed runner identity, test logs, and retrievable evidence artifact.
