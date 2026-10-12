# G02 evidence bundle contract

## Purpose

This contract prevents queue state, runner registration, status labels, or self-asserted artifact fields from being mistaken for actual G02 acceptance. The verifier fails closed if any required file, API correlation, execution log, artifact, or independent acceptance record is missing.

## Required bundle

Capture these files from the actual completed workflow run and its GitHub API endpoints:

- `run.json`: raw workflow run response, including positive run ID, completed/success conclusion, and exact head SHA.
- `job.json`: raw matching job response, including positive job ID, positive runner ID, exact runner name, required runner labels, run ID, and head SHA.
- `steps.json`: raw array of step summaries returned by the job-steps API.
- `logs.txt`: retrieved raw job log text, not a URL or a screenshot of the log page.
- `artifact.zip`: actual downloaded `g02-execution-evidence-<run_id>` archive.
- `acceptance.json`: separate independent review record, written only after run/job/steps/logs/artifact are retrieved and cross-checked.

Expected runner identity: `lingo-legacy-g02`, Linux/X64, labels `self-hosted, linux, x64, lingo-g02`.

## Verify

Place the files in `evidence/g02/`, then run:

```bash
node scripts/verify-g02-evidence.mjs evidence/g02
```

The acceptance record must contain `decision: ACCEPTED`, `independent_verification: true`, `formal_acceptance: true`, a reviewer identity distinct from the workflow actor, an ISO timestamp, matching run/job/commit/runner fields, SHA-256 hashes for the retrieved logs and artifact, and all predicates `P1` through `P9` set to true. The `evidence_source` must be `independent-github-api-review`.

The verifier checks bundle consistency and explicit acceptance metadata. It does not itself establish a human reviewer's identity or authorize deployment; the reviewer must validate the underlying evidence before creating `acceptance.json`.

## Acceptance boundary

G02 is PASS only after actual runner assignment, executed steps, sentinel success, retrievable logs and artifact, independent verification, and formal acceptance. No output from this verifier can bypass the release mutex. Production remains frozen and LKG protected until the separate promotion authority unlocks.
