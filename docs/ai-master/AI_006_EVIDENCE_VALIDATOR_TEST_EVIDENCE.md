# AI Master Evidence Validator — Local Test Evidence

- **Work package:** AI-006
- **Disposition:** LOCAL TESTS PASS; CI NOT RUN; independent acceptance pending
- **Timestamp (UTC):** 2026-11-06T13:00:08.889Z
- **Repository:** thelingolegacy-blip/TheLingoLegacy
- **Branch:** ai-master/bootstrap-phase0-1-2026-11-06
- **Validator Git blob SHA:** 8694019fc56460c73afc69e83e5b39611c02e63d
- **Test Git blob SHA:** 4c6bad28305361075281fa2be4fc1ae1d4d82390
- **Runtime:** Node.js v22.16.0
- **Command:** `node --test ai-master/test/evidence-validator.test.mjs`
- **Result:** 9 tests passed; 0 failed; 0 skipped.

## Test coverage
1. Accepts a complete structurally valid evidence package.
2. Rejects null, arrays and primitive inputs.
3. Reports missing required fields.
4. Rejects unsupported dispositions.
5. Requires timezone-qualified ISO timestamps.
6. Requires repository identity and commit.
7. Requires a 64-character hexadecimal SHA-256 for artifacts.
8. Checks typed execution, verification and rollback fields.
9. Explicitly distinguishes structural validity from independent acceptance.

## Source correlation
The Git blob hashes generated from the local test harness match the GitHub blob SHAs returned for the validator and test files on this branch.

## Scope limitations
- Tests ran locally in an isolated temporary harness, not GitHub Actions.
- The validator checks the required structure and selected constraints; it is not a complete implementation of every JSON Schema keyword.
- A valid structure does not establish that evidence is authentic, that execution occurred, or that an independent verifier accepted it.
- No provider, tool, production endpoint, credential or billing integration was invoked.
