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
- Command: `node --test` against the isolated scratch copy of `scripts/tests/server-slot-engine.test.mjs`
- Result: **14 tests passed, 0 failed**.

## Validation scope

The candidate engine and 14-test suite were executed in an isolated local scratch directory using Node.js v22.16.0. The suite covers the 20-line candidate geometry, active-payline counts from 1 through 20, integer total-wager allocation using the active count, explicit non-zero remainder rejection, line payout calculation, aggregate payout, feature multiplier application after aggregation, invalid inputs, integer overflow, WILD substitution, and bounded RNG behavior. The source and test blob SHAs above identify the corresponding GitHub branch files; this record is LOCAL-ONLY and is not a hosted run.

The selected stake contract uses `wagerUnits` as the total spin stake. The engine computes `lineStakeUnits = floor(wagerUnits / activePaylines)` using the actual active count, exposes the remainder, and explicitly rejects any non-zero remainder rather than rounding or discarding units. The tests verify 400 units across 20 lines allocates 20 per line, 100 units across 5 lines allocates 20 per line, and 401 units across 20 lines is rejected with `remainderUnits=1`. The engine also applies a positive integer feature multiplier once to the aggregate line payout; no feature trigger/state lifecycle is implemented.

## Source SHA-256

The SHA-256 values from the prior 11-test snapshot are superseded by the active-payline and feature-multiplier update. The GitHub blob IDs for the updated source and test files are recorded above. A fresh local SHA-256 capture for these updated bytes remains pending; no stale digest is represented as current evidence.

Four exact-head GitHub workflow runs after the branch update (44623470621, 44623468757, 44623465288, 44623466883) completed with `startup_failure`. For each run, the Jobs API returned zero jobs and the Artifacts API returned zero artifacts. No hosted test step ran. This evidence records local-only validation and does not establish hosted acceptance. Hosted acceptance still requires a completed GitHub-hosted run correlated to the final commit SHA, provider-observed runner identity, completed test steps, retrievable logs, and a verified evidence artifact.
