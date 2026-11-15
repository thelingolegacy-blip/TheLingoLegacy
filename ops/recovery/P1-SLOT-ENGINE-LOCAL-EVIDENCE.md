# P1 Slot Engine — Local Validation Evidence

**Classification:** LOCAL-ONLY; not GitHub-hosted CI evidence and not release acceptance.

- Repository: `thelingolegacy-blip/TheLingoLegacy`
- Branch: `recovery/p1-slot-engine-restore`
- Source baseline commit inspected: `7d5d4ddaf668ca219f6b3948f800a2a67675256b`
- Source engine blob inspected: `5bb7ea09d1eb8cb7d45836d01ef7e42faa15dd94`
- Runtime: Node.js `v22.16.0`
- npm: `10.9.2`
- Command: `npm test`
- Result: **10 tests passed, 0 failed**.

## Test correction

Two deterministic fixtures placed the first configured payline's symbols in row 0. The configured first payline is the center row `[1,1,1,1,1]`. The fixtures were corrected to place their intended winning sequences in row 1. No slot-engine implementation code was changed in this validation.

## Source SHA-256

- `package.json`: `01f918bfc14f6dda3699173312ebd324c597e571780be5d089b1dfccb36bde38`
- `src/server/slot-engine.mjs`: `8f772bbecfdd682f2a96157df55383ca9bced214bede7454d54b269e14365a9c`
- `scripts/tests/server-slot-engine.test.mjs` (corrected): `164c9bb40a1973dcb9cb05061efcdf952b408b60b735abb5a58c14aee282ba0f`

This evidence records a local isolated runtime execution of the fetched source plus corrected test fixture. It does not establish that GitHub Actions started, that an Actions job completed, or that an artifact was uploaded. Those require a separate completed hosted run correlated to the final commit SHA.
