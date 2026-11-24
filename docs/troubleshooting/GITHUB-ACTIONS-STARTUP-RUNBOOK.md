# GitHub Actions Startup Failure Runbook

**Status:** diagnostic runbook; no root cause asserted.
**Scope:** GitHub Actions workflow runs that fail or stall before executable job steps are instantiated.

## Symptom classification
Separate these observations:
- Dispatch request accepted.
- Workflow run record created.
- Job record created.
- Runner assigned (positive runner ID and populated runner name).
- Steps instantiated.
- Steps executed with exit results.
- Logs retrievable.
- Artifacts retrievable and correlated.

A run record is not proof of job creation. A job record is not proof of step execution. A green conclusion without inspectable required evidence is insufficient for acceptance.

## Competing hypotheses
H1 account/organization Actions policy or hosted-runner entitlement/admission.
H2 repository Actions permissions or policy restrictions.
H3 workflow syntax, event, environment, concurrency, or permissions configuration.
H4 hosted runner provisioning or provider-side service incident.
H5 workflow-specific dependency or setup issue (only plausible after steps begin).

Do not call H5 the cause when no steps were instantiated.

## Read-only diagnostic sequence
1. Record repository, branch, exact commit SHA, workflow path, run ID, attempt, event, actor, created/updated timestamps, status, and conclusion.
2. Fetch jobs for the exact run. Record job ID, status, conclusion, runner ID, runner name, labels, and timestamps.
3. Fetch steps and logs only when a job exists. Preserve API errors as evidence, not as proof of a specific cause.
4. Fetch artifacts and record an explicit empty result when none exist.
5. Compare a minimal read-only workflow on the affected repository with a permitted control repository or workflow. Ensure equivalent event, runner class, and permissions; document any differences.
6. Review owner/admin-visible Actions policy, runner group access, billing/usage restrictions, and hosted runner availability through authorized account interfaces. The repository connector may not expose organization-level settings; report this limitation rather than infer policy state.
7. Compare provider status and incident window where applicable.
8. Rank hypotheses by evidence and choose the smallest next test that separates them.

## Minimal probe acceptance
A probe is diagnostic only. It must use least privilege, no secrets, no checkout unless required, no third-party actions, no deployment, and no production credentials. It must record a unique sentinel, job/runner identity, timestamps, and retrievable logs. Do not add automatic push/PR triggers merely to force execution.

## Stop conditions
Stop and preserve evidence if no job is created, runner identity is absent, permissions are unclear, the control test is not comparable, or an action would mutate production. Escalate owner/admin admission checks rather than repeatedly dispatching identical runs.

## G02 distinction
A GitHub-hosted runner probe does not satisfy the canonical LINGO self-hosted G02 contract. G02 requires the approved self-hosted runner identity/labels, real assignment, instantiated and executed steps, passing sentinel, retrievable logs and artifacts, correlated run/job/commit evidence, and independent verification.

## Current incident baseline
Prior inspected run 45308879951 was reported with zero jobs and zero artifacts. That observation supports a pre-step startup/admission failure classification only. It does not establish whether the cause is account policy, repository configuration, runner provisioning, or provider infrastructure. Refresh live evidence before making a current-state claim.

## Required incident output
Provide a timeline, exact evidence references, hypothesis matrix, confirmed/unknown cause, next discriminating test, risk and rollback plan, and independent verification result. Do not mark fixed until a subsequent comparable run passes the required acceptance criteria.


## Incident evidence refresh — 2026-11-24

### Current reproduction set
Core repository `thelingolegacy-blip/TheLingoLegacy`, PR #664 head `f6705a3d22ce8fe04d00ed726977398211b0445e`:
- `45494361261` — Static CI
- `45494363413` — Crimson Smoke UI
- `45494358311` — G02 Runner Image Build
- All three concluded `startup_failure`; the Jobs API returned an empty job list and the Artifacts API returned an empty artifact list.

Private Web repository `thelingolegacy-blip/TheLingoLegacy-Web`, PR #44 latest head `67664892cd2c86f42ea278d6938591119d0f0a66`:
- Run `45496202532` concluded `startup_failure`.
- The Jobs API returned an empty job list and the Artifacts API returned an empty artifact list.

This is a fresh cross-repository reproduction of the pre-job admission failure. It does not identify the provider-side cause. No checkout, runtime, install, test, or G02 step executed.

### Current account/authority observations relevant to G04
- Cloudflare account-level two-factor enforcement is false.
- Exactly one accepted Cloudflare account member is returned; that member's account-level 2FA is false.
- The SAAAE staging privileged-executor Access application has zero attached policies.
- These are separate G04 identity/separation-of-duties blockers, not proven causes of GitHub Actions admission failure. No settings or policies were changed.

### Administrator/provider action still required
1. Inspect GitHub account billing and included Actions compute/usage without increasing spending limits.
2. Inspect organization and repository Actions enablement, allowed actions and runner restrictions.
3. Inspect runner-group repository access and organization policy overrides.
4. If those checks are clear, escalate to GitHub Support with the two repository names, the run IDs above, exact commit SHAs and the zero-job/zero-artifact API responses.
5. Do not change workflow Node versions, runner labels, or application source as a substitute for provider-side admission diagnosis.

### Acceptance remains unchanged
A recovery is accepted only after a new run creates a job, receives a real runner ID/name, executes diagnostic steps, exposes retrievable logs, and uploads a commit-correlated non-secret artifact. Repeat independently in Core and Web. Hosted GitHub runner success does not certify the separate G02 self-hosted runner.
