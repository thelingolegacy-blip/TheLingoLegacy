# Isolated source repair status — 2026-11-20

## PR #596 — Go test string escaping

- Branch: `implementation/lingo-core-v2-foundation`
- Repair commit: `9dd256532c056f4aa5985aa68fd3975e5f7d4d9a`
- File: `platform/lingo-core-v2/services/api/internal/httpapi/server_test.go`
- Change: corrected the 5,000-character request-body test's embedded quote escapes to single Go string escapes, matching the neighboring valid test.
- GitHub readback verified all four embedded-quote escape sequences in the target line are now single-backslash sequences.
- Current-head workflow run: `44822526118` (LINGO CORE V2 API), conclusion `startup_failure`, jobs array empty, artifacts empty.
- No gofmt, Go test, race, vet, build, or PostgreSQL integration test was executed. The repair is source-verified only.
- The #596 child branch remains diverged from current #594 parent (55 ahead / 8 behind).

PR comment: #596 comment 7051316188.

## PR #611 — dispatch contract completion and cost validation

- Branch: `feat/dispatch-contract-v1-2026-11-16`
- Repair head: `f779686eec42d10be0fbc8a2ac436304edc86e45`
- Changes:
  - Aligned the negative/non-finite cost test assertions with the fail-closed zero-cost error.
  - Added `ENVELOPE_STATUSES`, excluding terminal `COMPLETE` from initial job envelopes.
  - `validate_job()` now rejects direct `status=COMPLETE`; completion remains available only through the evidence-gated `transition()` path.
  - Removed `COMPLETE` from the initial job-envelope JSON Schema status enum.
  - Added direct-COMPLETE and schema-alignment regression tests.
  - Clarified the README.
- GitHub readback verified the code, test, schema and README changes.
- Current-head workflow run: `44822638372` (LLG Dispatch Contract CI), one job object `136587158445` concluded failure, but steps array was empty and artifacts were empty. No test step executed.
- No Python unit tests or schema-validation command was executed locally. The repair is source-verified only.

PR comment: #611 comment 7051310690.

## Acceptance boundary

These commits preserve the open draft PRs and do not modify main. Neither repair is CI-verified. Actions admission/job startup remains unresolved. The PRs must remain draft/unmerged until the exact current heads execute their tests, logs are retrievable, and independent review accepts the results. No runner activation, provider mutation, deployment, DNS change, payment activation, or production promotion occurred.
