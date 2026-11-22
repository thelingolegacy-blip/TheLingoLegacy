# GitHub Actions startup-failure recovery — LINGO

**Status: INVESTIGATION / NOT VERIFIED. Production: HOLD. G02: QUARANTINED.**  
**Owner repo:** `thelingolegacy-blip/TheLingoLegacy` · **Baseline checked:** 2026-11-14

## Incident statement

The hosted-runner recovery workflow run **43582675480**, commit **e99fbc34dd734b6b9bd1fecae6af9738d0a2fcd9**, returned `startup_failure`. The GitHub jobs endpoint returned **zero jobs** and the artifacts endpoint returned **zero artifacts**. The workflow source selected `ubuntu-latest`; it did not select the protected G02 self-hosted runner. Therefore no runner identity, step execution, job logs, or workflow artifact was available for that run. This proves a pre-job startup failure for that attempt; it does **not** identify the root cause.

## Controlled probe added with this document

`.github/workflows/actions-startup-probe.yml` is intentionally narrow: manual dispatch and pull requests that change only this probe or its runbook. It requests only `contents: read`, uses GitHub-hosted `ubuntu-latest`, has no secrets, no deployment, no write token, no self-hosted labels, and no G02 reference. It captures run/attempt/commit/ref and runner metadata, OS/tool versions, step outcomes, and a SHA-256 manifest as an artifact. This probe tests whether GitHub can allocate and execute a basic hosted job; it does not test application correctness.

## Execute and collect evidence

1. Open the draft recovery PR and inspect its Checks tab. A PR event should start the narrow probe. If no run appears, use Actions → **Actions startup probe** → **Run workflow** on this branch (manual dispatch).
2. Record the workflow run URL, run ID, attempt, head SHA, conclusion, and timestamps.
3. Inspect the run's Jobs view. For each job, record job ID, `runner_name`, `runner_group_name`, `runner_id` where exposed, start/completion times, and every step's conclusion.
4. Download the `lingo-actions-startup-evidence` artifact. Verify `SHA256SUMS` and confirm the evidence JSON matches the run ID, attempt, commit SHA, and runner identity.
5. Repeat once after a successful first execution to establish repeatability. Preserve both attempts; do not overwrite prior evidence.

## Triage when startup still fails

If the run again reports `startup_failure` with zero jobs, stop changing workflow YAML: no job ran, so there are no step logs to diagnose. Capture the run URL/ID, repository, workflow file path and SHA, event, head SHA, timestamp/time zone, and the empty jobs/artifacts API results. Check, with an authorized repository/organization owner:

- Actions enabled at repository and organization levels; organization allow-list and policy restrictions.
- GitHub-hosted runner availability, plan/usage limits, billing holds, and concurrency/parallel-job limits.
- Workflow/event restrictions, PR source/fork policy, required approval gates, and repository/organization rules.
- GitHub Actions service status for the incident window.
- Whether a minimal manually dispatched workflow in the same repository also fails.

Escalate the run ID and captured metadata to GitHub Support if the hosted job cannot be instantiated. Do not claim a billing, policy, service, or scheduler root cause until GitHub or reproducible evidence confirms it. A missing job means no job log exists; do not fabricate one.

## Acceptance gate

Mark hosted Actions **RECOVERED** only when all are true:

- A GitHub-hosted `ubuntu-latest` job is instantiated (job ID present; runner identity populated where GitHub exposes it).
- Every diagnostic step starts and completes; job conclusion is successful.
- Evidence artifact is present, downloadable, checksum-valid, and correlated to run ID + attempt + commit SHA + runner identity.
- A second independent run also succeeds.
- No G02/self-hosted runner was selected or activated.

Then validate the real application workflows and their required checks separately. Revisit PR #574 security repair only after workflows execute and its tests/evidence can be inspected.

## Safety and release controls

- **G02 remains quarantined.** Do not register, start, or activate the self-hosted runner as a workaround for hosted-runner startup failure.
- **Production remains HOLD.** No merge to `main`, release promotion, Cloudflare route/DNS changes, Firebase publish, payment activation, or last-known-good replacement is authorized by this probe.
- Keep secrets out of diagnostic output. Keep permissions least-privilege. Do not add broad `push` triggers, deployment steps, or privileged tokens.
- If the probe changes production behavior, requests write permissions, selects a self-hosted runner, or produces uncorrelated evidence, stop and close the gate.

**Current disposition:** probe prepared; execution and root-cause verification pending GitHub job-instantiation evidence.
