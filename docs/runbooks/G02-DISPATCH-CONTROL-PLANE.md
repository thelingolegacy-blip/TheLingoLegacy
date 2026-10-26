# G02 Dispatch Control Plane — Operations and Acceptance

## Status and boundary

This change adds an auditable dispatch diagnostic path; it does not repair or register a runner by itself. It is draft code until reviewed and merged. No production resources, runner services, secrets, DNS, repository permissions, or paid infrastructure are changed by this PR.

Fail-closed invariants: **G02 BLOCKED · PRODUCTION HOLD · FAIL-CLOSED ACTIVE · LAST-KNOWN-GOOD PROTECTED**.

## Components

- `.github/workflows/g02-dispatch-control-plane.yml`: workflow dispatch, pull-request and scoped branch-push triggers; read-only control-plane job; optional explicitly requested target-runner sentinel; evidence artifact; fail-closed summary.
- `ops/g02/dispatch_diagnostics.py`: reads run/job/artifact/runner inventory using the GitHub CLI and the workflow's read-only token. It records API access failures as unknown rather than interpreting them as zero runners.
- Control-plane artifact: `g02-control-plane-RUN_ID-ATTEMPT`, containing JSON diagnostics and a Markdown summary.
- Target sentinel artifact: `g02-target-sentinel-RUN_ID-ATTEMPT`, emitted only after a matching self-hosted runner receives the job and executes the sentinel.

## Triggers and assignment

1. **pull_request** — validates workflow/code changes on a hosted runner; does not execute the target sentinel.
2. **push** — scoped to this recovery branch and relevant paths.
3. **workflow_dispatch** — accepts an optional prior run ID for correlation and an explicit `enable_target_runner_probe` boolean, default false.
4. The target job uses the exact labels `self-hosted`, `linux`, `x64`, `lingo-g02`. If no online runner matches, the target job remains queued; that is a failure signal, not success.
5. The self-hosted job deliberately performs no checkout and executes no repository script. It only emits minimal run/runner metadata and a sentinel record.

Scheduled polling is intentionally not enabled in this draft. Enabling recurring runs or external alerting requires explicit review of cadence, notification destination, CI-minute budget, and retention.

## Access and approval rules

- Workflow permissions are limited to `actions: read` and `contents: read` for the control-plane collector; target sentinel gets `contents: read` only.
- No secrets, runner registration tokens, environment dumps, log bodies, or signed artifact/log URLs are written to evidence.
- Runner inventory can be unavailable due to token scope. The report must say **unknown** rather than zero.
- No runner installation, re-registration, relabeling, service restart, permissions changes, release gate mutation, deployment, DNS update, or restore action is performed.
- A real runner probe must be manually requested after the workflow and branch have been reviewed. Do not run arbitrary PR code on a self-hosted runner.

## Evidence and correlation model

Every evidence record must correlate repository, run ID, run attempt, workflow event, commit SHA, target job ID, runner ID and name, step summaries, log retrieval result, and target artifact name/ID. Use the exact run ID and attempt; never combine evidence across runs.

The collector checks:

- API access and run metadata
- jobs returned and target job presence
- nonzero runner ID and populated runner name
- instantiated steps and successful target sentinel
- log endpoint retrieval check without retaining log contents
- target sentinel artifact belonging to the same run ID and attempt
- runner inventory access state and returned runner status/labels

The control-plane report is deliberately stamped `G02 BLOCKED_PENDING_INDEPENDENT_ACCEPTANCE` even if its diagnostic predicates look good. An independent reviewer must compare the raw GitHub run/job records and artifact against the canonical acceptance predicate.

## Failure signals and response

| Signal | Interpretation | Safe response |
|---|---|---|
| `startup_failure` and empty jobs | GitHub did not instantiate an observable job; cause is not established by this fact alone | Preserve run ID and timestamp; inspect Actions policy, runner assignment, service/host state, repository/org restrictions, and GitHub incident status through authorized channels |
| Target job queued with no runner ID/name | No runner assignment evidence yet | Check exact labels, runner online/busy state, runner group access, service polling and restrictions; do not loosen labels blindly |
| API inventory 403/401 | Permission/scope limitation | Mark unknown and request authorized read access; do not infer no runners exist |
| Job exists but steps are empty | Job did not execute a step | Preserve run/job IDs and inspect runner dispatch/startup telemetry |
| Logs unavailable | Evidence cannot be independently reviewed | Keep G02 blocked; retry retrieval later and preserve the API error/status |
| Artifact missing, expired, or from another attempt | Correlation incomplete | Re-run the diagnostic and preserve matching artifact metadata; do not synthesize evidence |
| Sentinel passes but runner assignment/log/artifact checks fail | Host probe alone is insufficient | Keep G02 blocked |

## Canonical G02 acceptance

All of the following must be independently verified for the same run and attempt:

1. Runner ID is greater than zero and runner name is populated.
2. Job is assigned to the intended runner with the required labels.
3. Job steps are instantiated and the sentinel step executes successfully.
4. Logs are retrievable and show the expected step execution.
5. A non-expired sentinel artifact is present and correlated to the exact run/attempt/SHA.
6. Evidence is retained with timestamps and an integrity digest; integrity proves bytes are unchanged, not that claims are true.
7. An authorized reviewer records acceptance separately from production release authorization.

## Manual operator procedure

1. Review the draft PR and ensure its base/branch are correct.
2. After the workflow is present on the selected ref, open Actions → **G02 Dispatch Control Plane** → Run workflow.
3. First run with `enable_target_runner_probe=false` to validate control-plane API access and artifact creation without touching the self-hosted runner.
4. Review the control-plane artifact. If a historical failure is being investigated, set `target_run_id` to that exact run ID.
5. Only after code review and explicit authorization, run again with `enable_target_runner_probe=true`. If it queues, capture the run ID and do not treat the queued state as a pass.
6. Download the control-plane artifact independently; inspect the target job, runner assignment, logs and target artifact in GitHub's UI/API.
7. Record the acceptance decision. No automated component in this PR can unlock G02 or production.

## Current blockers

- The latest known policy-validation run `40251351240` ended with `startup_failure` and an empty jobs list; the workflow did not execute.
- Repository runner inventory and branch-protection settings must be confirmed with authorized access. API access failures do not prove that the inventory or protection is absent.
- This workflow has not yet been run from the newly created branch, and no evidence artifact has been generated by this implementation.
- Production remains on HOLD until all release gates have independent evidence.
