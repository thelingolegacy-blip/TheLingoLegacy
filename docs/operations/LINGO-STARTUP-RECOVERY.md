# LINGO Startup Recovery System

**Status:** Draft / manual execution required  
**Scope:** GitHub-hosted CI bootstrap only  
**Production:** Protected hold; no production access or promotion  
**G02:** Separate qualification gate; not satisfied by this bootstrap

## Purpose

Establish one canonical, low-risk starting point for diagnosing whether GitHub Actions can instantiate and execute a hosted job. Reuse the existing isolated hosted-runner probe rather than adding another overlapping workflow.

## Canonical bootstrap

Workflow: `.github/workflows/isolated-hosted-runner-probe.yml`  
Display name: **LINGO Startup Recovery Bootstrap**  
Trigger: manual `workflow_dispatch` only  
Runner: `ubuntu-latest`  
Permissions: `contents: none`  
External actions: none  
Secrets: none  
Checkout: none  
Network calls: none  
Production bindings: none

The bootstrap records the documented hosted-runner name, environment, operating system and architecture, verifies a minimal baseline toolchain, and writes a correlated evidence record to the job summary and logs. GitHub's provider job ID and runner ID are not exposed through the documented runner context; retrieve both from the GitHub Jobs API after the job starts.

## Execution procedure

1. Open the repository Actions page.
2. Select **LINGO Startup Recovery Bootstrap**.
3. Select the intended branch containing this change and run the workflow manually.
4. Inspect the workflow run, job, step results, and job summary.
5. Retrieve the provider job ID and runner ID from the GitHub Jobs API. Record the run ID, attempt, commit SHA, job ID, runner ID, runner name, completed steps, and conclusion.
6. Preserve the run URL, job API response, summary and logs with the recovery checkpoint.

## Acceptance criteria

A hosted bootstrap is accepted only when all are true:

- A workflow run is created and a job is instantiated.
- The job has a positive provider-assigned job ID.
- GitHub reports a positive runner ID and a non-empty runner name.
- GitHub reports the runner environment as `github-hosted`, with Linux/X64 platform.
- Both identity and baseline steps execute and complete successfully.
- The run conclusion is successful and the summary contains `HOSTED_BOOTSTRAP_PASS`.
- Run ID, attempt, commit SHA, job ID, and runner identity are correlated.

The bootstrap intentionally does not upload an artifact. The evidence record is emitted into the job summary/logs, and provider-assigned IDs are captured from the Jobs API. Do not expect a workflow artifact for this bootstrap.

A workflow record with zero jobs, no runner assignment, or no executed steps is a startup/dispatch failure—not a passing test and not evidence that the application tests failed.

## Recovery decision tree

- **No job is instantiated:** stop. Capture run metadata and request GitHub Actions/repository-level diagnostics. Do not create duplicate workflows or repeatedly rerun a pre-job failure.
- **Job exists but runner is not assigned:** inspect hosted-runner availability and repository/org Actions policy with an administrator.
- **Runner starts but baseline fails:** preserve logs and repair only the specific environment prerequisite on a new reviewed change.
- **Bootstrap passes:** proceed to the existing Flutter/Firebase, static CI, UI, and canary workflows one at a time, verifying job creation and evidence after each.
- **Existing workflows still fail before job creation:** treat as a separate Actions orchestration/policy issue; do not misclassify it as a code-test failure.

## Downstream gates

1. **Hosted CI restoration:** bootstrap accepted; workflow dispatch/job creation confirmed.
2. **Application validation:** Flutter dependency resolution, formatting, analysis, unit/widget/integration tests, Android/iOS staging builds, and Firestore emulator allow/deny tests completed with evidence.
3. **Firebase staging authorization:** project ownership/access, app registrations, staging-only configuration, Auth/session behavior, and rules verified. Production remains disconnected.
4. **Cloudflare game-engine staging:** implement and test SAAAE authorization decisions, rate limiting, approval binding, audit records, runtime secrets/bindings, and health checks before any deployment.
5. **G02 self-hosted qualification:** separately prove the exact runner identity, runner ID, non-empty name, completed steps, logs, artifacts, and correlated run/job/commit evidence. Hosted bootstrap success does not satisfy G02.

## Safety invariants

- Default-deny authorization and least privilege remain mandatory.
- No secrets are printed, committed, or requested in chat.
- No self-hosted runner is invoked by this bootstrap.
- No production credentials, routes, data, or deployments are touched.
- Do not merge, promote, or certify releases until required checks and approvals are independently verified.
- Preserve existing workflows and last-known-good assets; do not delete or silently replace historical evidence.

## Completion record

This change prepares the canonical bootstrap and its runbook. It is not operationally certified until a manual run produces the acceptance evidence above.

## Initial PR-triggered diagnostic checkpoint — 2026-11-23

Opening draft PR #656 caused three existing pull-request workflows to start, but each concluded `startup_failure` before job creation:

| Workflow | Run ID | Conclusion | Jobs | Artifacts |
|---|---:|---|---:|---:|
| Crimson Smoke UI — static validation | 45251531052 | `startup_failure` | 0 | 0 |
| Lingo Legacy Static CI | 45251529304 | `startup_failure` | 0 | 0 |
| G02 Runner Image Build (no publish) | 45251526852 | `startup_failure` | 0 | 0 |

The provider job and artifact endpoints returned empty collections for all three runs. Therefore no runner assignment, step execution, or workflow artifact is evidenced. This is consistent with the previously observed pre-job startup blocker and does not demonstrate a defect in the new bootstrap's shell steps.

The bootstrap itself is manual-only and did not run as a result of opening the PR. The current GitHub integration exposes read and selected rerun operations but no workflow-dispatch action. Do not misrepresent a PR-triggered workflow as a manual bootstrap run. Preserve this checkpoint and use the repository's supported GitHub Actions manual-dispatch interface when available.
