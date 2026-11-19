# P1 Slot Engine — Local Validation Evidence

**Classification:** LOCAL-ONLY; not GitHub-hosted CI evidence and not release acceptance.

- Repository: `thelingolegacy-blip/TheLingoLegacy`
- Branch: `recovery/p1-slot-engine-restore`
- Implementation commit: `2fd439c80e8f96f35ee8686ea5fa2c0191c9552f`\n- Test commit / current branch head: `3e373e17339aabe6088dd8e7d4862f9cb2d4c29b`
- Package manifest blob: `2b36af54e8b4278ca0ce9bf4ac64861cce3bdb47`
- Source engine blob: `3193be9754b8d7f235e40dfd71fae1048a7661bc`
- Test file blob: `26c689feea1d3ac95d34db22c6d8c6f825a033f8`
- Runtime: Node.js `v22.16.0`
- npm: `10.9.2`
- Command: `node --test scripts/tests/server-slot-engine.test.mjs`
- Result: **14 tests passed, 0 failed**.

## Validation scope

The candidate engine and 14-test suite were executed in an isolated local scratch directory using Node.js v22.16.0. The suite covers the 20-line candidate geometry, active-payline counts from 1 through 20, integer total-wager allocation using the active count, explicit non-zero remainder rejection, line payout calculation, aggregate payout, feature multiplier application after aggregation, invalid inputs, integer overflow, WILD substitution, and bounded RNG behavior. The source and test blob SHAs above identify the corresponding GitHub branch files; this record is LOCAL-ONLY and is not a hosted run.

The selected stake contract uses `wagerUnits` as the total spin stake. The engine computes `lineStakeUnits = floor(wagerUnits / activePaylines)` using the actual active count, exposes the remainder, and explicitly rejects any non-zero remainder rather than rounding or discarding units. The tests verify 400 units across 20 lines allocates 20 per line, 100 units across 5 lines allocates 20 per line, and 401 units across 20 lines is rejected with `remainderUnits=1`. The engine also applies a positive integer feature multiplier once to the aggregate line payout; no feature trigger/state lifecycle is implemented.

## Source SHA-256

- `package.json`: `95ee7e11725e3d192d46c56e7d039454f88227fab13286bfec394cc328f53888`
- `src/server/slot-engine.mjs`: `ad1cc1345f64540750f053f586e7776faae9883754600985e805bad9b9f71b69`
- `scripts/tests/server-slot-engine.test.mjs`: `189fc9d6cc103e431875b663c2c33a50dedc7ca867503e168fd7b5c27846f256`

Four exact-head GitHub workflow runs after the branch update (44623470621, 44623468757, 44623465288, 44623466883) completed with `startup_failure`. For each run, the Jobs API returned zero jobs and the Artifacts API returned zero artifacts. No hosted test step ran. This evidence records local-only validation and does not establish hosted acceptance. Hosted acceptance still requires a completed GitHub-hosted run correlated to the final commit SHA, provider-observed runner identity, completed test steps, retrievable logs, and a verified evidence artifact.
