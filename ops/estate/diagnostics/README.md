# G02 Runner Agents, Workers, Triggers, and Diagnostics

## Safety model
- Never run self-hosted jobs on `pull_request`, `pull_request_target`, or unreviewed push events.
- This repository may be public; a self-hosted runner must not execute untrusted fork code or hold production credentials.
- The sentinel workflow is manual-only and requires the `main` ref, repository variable `LINGO_G02_SENTINEL_ENABLED=true`, a valid issue/PR authorization reference, and explicit sentinel confirmation.
- Keep `LINGO_G02_SENTINEL_ENABLED` unset/false until the real host, runner name, labels, service, and repository Actions policy are verified.
- No automatic merges, deployment, production activation, DNS/Worker mutations, or production secrets.
- Diagnostics are not proof of acceptance by themselves.

## Workflows
- `.github/workflows/g02-diagnostics-watch.yml`: hourly and manual hosted-runner diagnostics; creates a short-retention evidence artifact.
- `.github/workflows/g02-runner-control-plane.yml`: manual-only, gated self-hosted sentinel with exact labels and run-scoped evidence.
- `ops/estate/diagnostics/verify-g02-evidence.sh`: local package and checksum validator.

## Agent roles
- Host discovery: read-only host/service/process telemetry.
- Sentinel: one explicit non-destructive runtime check.
- Evidence verifier: correlates run, job, commit, runner, logs, and checksums; must not infer missing values.
- Restore planner: propose safe repairs only.
- Workers are execution roles, not separate machines; no new VM or daemon is created by these definitions.

## Acceptance checklist
1. Authorized VM identity and Ubuntu version captured.
2. GitHub runner inventory shows `lingo-legacy-g02` with `self-hosted,linux,x64,lingo-g02`.
3. Service active and runner log says connected/listening.
4. A manual sentinel job is assigned with `runner_id > 0` and populated `runner_name`.
5. Steps are instantiated and sentinel exits 0.
6. Job logs and artifact are retrievable; checksums pass.
7. Independent reviewer correlates repository, run, attempt, job, commit, runner, logs, and artifact.
8. All G02 predicates pass before G02 changes state.

Do not interpret a queued job, Online/Idle UI, a hosted diagnostics pass, or a locally valid checksum as G02 acceptance.
