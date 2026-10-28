# Homies CI and runner diagnostics

Status: operational guidance, not execution evidence.

## Homies validation lane
The workflow `.github/workflows/homies-validation.yml` uses GitHub-hosted `ubuntu-latest` and Node.js 22. It has read-only repository permissions and does not require production secrets, Firebase credentials, deployment credentials, or the canonical self-hosted runner. It runs only for Homies paths or manual dispatch.

This isolates package validation from the unresolved G02 runner-dispatch issue. It does not bypass or satisfy G02.

## When a workflow has no jobs or logs
Capture the run URL, run ID, workflow file, commit SHA, status/conclusion, job count, runner ID/name/labels, instantiated step count, artifact count, and log retrieval outcome. Do not infer a specific root cause from `startup_failure`, empty jobs, or a missing log blob alone.

## Canonical G02 recovery
Use existing repository tools and contracts:
- `docs/G02-ACCEPTANCE-CONTRACT.md`
- `docs/G02-SELF-HOSTED-RUNNER-RECOVERY.md`
- `ops/g02/diagnose-actions-dispatch.sh` (read-only evidence collection)
- `ops/g02/runner-control.sh status` on the authorized host (read-only status)

Expected canonical labels remain `self-hosted`, `linux`, `x64`, and `lingo-g02`; the exact runner name and all contract predicates must be verified against the current acceptance contract. Do not create duplicate registrations, broaden permissions, weaken labels, or alter production configuration to make a test pass.

## Evidence interpretation
A successful Homies test run proves only that the tested source and checks executed in that run. It does not prove the canonical runner is healthy, provider API works, mobile UI is accepted, or production is safe to promote. Preserve fail-closed gates and the last-known-good production state.
