# GitHub Actions Startup-Failure Recovery Runbook

## Purpose

Use this runbook when a workflow run completes with `startup_failure` and the Actions Jobs and Artifacts endpoints both return empty collections. It separates repository/organization-level Actions dispatch problems from a self-hosted runner availability problem.

**Current recovery baseline (2026-10-24):** five PR-triggered workflows associated with commit `850c7e20569cfbec3d4d1387a134ab5a0bba99bc` reported `startup_failure`: Studio VNext Runner Signal, G02 Runner Image Build, Lingo Legacy Static CI, Studio VNext Contract Checks, and Crimson Smoke UI. All five returned zero jobs and zero artifacts. At least two affected workflows use `ubuntu-latest`, so a mismatch in the dedicated `lingo-g02` labels does not explain the full incident.

## Safety boundary

- Do not repeatedly dispatch or rerun workflows while the failure is at startup and no job is initialized.
- Do not merge the recovery PR, change production routing, or promote any gate to work around a CI outage.
- Do not place a self-hosted runner on untrusted pull-request code. Keep the G02 sentinel manual-only and on a dedicated, least-privileged runner.
- Do not share runner registration tokens, PATs, environment dumps, private keys, or full process command lines in evidence.
- A runner shown as Online/Idle is not proof that it is authorized for this repository, matches the job labels, is polling, or can accept a job.

## Diagnostic decision tree

### 1. Confirm the failure boundary (read-only)

For each affected run, record:
- run ID, workflow name, event, commit SHA, status, conclusion, and creation time;
- job endpoint result, including whether the job array is empty;
- artifact endpoint result, including whether the artifact array is empty;
- whether any runner/job IDs, steps, logs, or artifacts exist.

If the run is `startup_failure` with zero jobs and zero artifacts, classify it as **pre-job initialization failure**. Do not describe it as a test failure: no test step ran. Preserve the run URLs and timestamps.

### 2. Administrator checks — repository and organization

A repository/org administrator should verify these in the GitHub Actions settings and account billing/usage pages, without exposing secrets:

1. Actions are enabled for the repository and the organization/enterprise policy permits this repository to use them.
2. The relevant workflows and actions are permitted by policy; no organization or enterprise restriction is preventing workflow execution.
3. GitHub-hosted runner use is eligible for this repository/account, and available minutes/concurrency/usage restrictions are not preventing hosted jobs from starting.
4. Repository, organization, and enterprise restrictions/inheritance are consistent; note any policy source that overrides repository settings.
5. There is no platform incident affecting Actions. If account settings are correct but startup failures persist across hosted-runner workflows, preserve examples and escalate to GitHub Support.

Record each check as **PASS**, **FAIL**, or **UNVERIFIED**, with the administrator, UTC timestamp, and sanitized evidence reference. Do not infer a setting from an empty API response or from the run conclusion alone.

### 3. Separately verify the dedicated self-hosted runner

On the actual `lingo-legacy-g02` host, an administrator should:

1. Run `bash studio-vnext/host-inspection-linux.sh` from a reviewed checkout and inspect the output locally before sharing.
2. Verify the installed runner service is configured and active, and confirm its listener process is polling GitHub. A process or service listing alone is not acceptance evidence.
3. In GitHub's repository/org runner inventory, confirm the runner is online, authorized for this repository, assigned to an eligible runner group, and has the exact labels `self-hosted`, `linux`, `x64`, and `lingo-g02`.
4. Confirm the configured runner name and the actual GitHub runner identity. Do not manufacture a numeric runner ID or assume a display name proves registration.
5. Check outbound HTTPS/DNS connectivity to GitHub Actions endpoints using approved host procedures; DNS lookup alone does not prove successful polling.

The dedicated runner check cannot explain failures on `ubuntu-latest` by itself. Investigate both paths independently.

### 4. Controlled recovery run — only after administrator confirmation

After the administrator documents the root cause and correction:

1. Obtain explicit change-control approval and record an incident reference.
2. Run one controlled diagnostic. Do not launch a batch of speculative retries.
3. Require a real initialized job, positive numeric `job_id` and `runner_id`, populated runner name, executed sentinel line, retrievable logs, evidence artifact, and verified SHA-256 checksums.
4. Independently inspect the run, job, logs, artifact, and checksum before changing G02 to PASS.
5. If startup failure repeats, stop further retries and return to the administrator/platform diagnosis.

## Acceptance criteria

G02 stays **BLOCKED** until all evidence is independently verified. A successful Vercel preview, successful static/local tests, a workflow file existing in Git, or a runner reported Online/Idle does not satisfy G02.

The release chain remains:

`SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION`

Production remains **PROTECTED HOLD** until all required gates pass and separate promotion authorization is recorded.
