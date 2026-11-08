# Release Pipeline Acceptance and Promotion Runbook

## Purpose

Define the evidence required to move a change from an isolated pull request to a verified preview and, only later, an authorized production release. This runbook is deliberately fail-closed: a successful build, preview URL, or green provider status is not by itself release authorization.

## Non-negotiable production controls

- Keep production on **PROTECTED HOLD** until every applicable gate has independently verifiable evidence and the authorized release owner approves promotion.
- Do not deploy, promote, activate, change production traffic, or overwrite the last-known-good (LKG) version as part of diagnostics.
- Do not treat an empty workflow job list, queued job, runner registration alone, or a missing log URL as successful CI execution.
- Never place access tokens, service-account private keys, Firebase secrets, or unredacted environment dumps in commits, artifacts, issues, or logs.
- Run untrusted pull-request code only on appropriately isolated hosted or ephemeral runners. Do not expose production credentials to fork or untrusted PR workflows.
- Keep repairs in small, single-purpose PRs. Do not combine runner recovery, Firebase credentials, UI/accessibility, and production routing changes into one PR.

## Gate sequence

| Gate | Required evidence | Failure disposition |
|---|---|---|
| G00 Source authority | Approved repository, branch, commit SHA, and change scope | Stop if source identity is unclear |
| G01 Repository integrity | PR diff reviewed; required approvals and branch rules verified by an administrator | Keep PR draft / unmerged |
| G02 Runner dispatch | Job assigned to a real runner; runner ID greater than zero; runner name populated; steps instantiated; sentinel executes; logs retrievable | Stop. Diagnose runner host and Actions policy; do not infer cause |
| G03 CI execution | Required syntax, unit/contract, static, security, build, and artifact checks execute on the exact commit | Block if any required check is missing, skipped unexpectedly, or failed |
| G04 Certification | Test outputs, commit SHA, workflow run/attempt, job IDs, tool versions, and artifact checksums are retained | Block if evidence cannot be tied to the reviewed SHA |
| G05 Release candidate | Immutable candidate identity and all required checks accepted | Do not label a candidate release-ready from preview smoke tests alone |
| G06 Deployment authorization | Explicit approval by authorized release owner after reviewing gate evidence | No production mutation without authorization |
| G07 Live validation | Approved post-deployment health, route, security-header, and critical-flow checks | Halt progression; use the approved rollback procedure if the release is unhealthy |
| G08 Synchronization | Deployed revision, repository revision, provider deployment record, and release evidence agree | Keep activation blocked if revisions differ |
| G09 Activation | Explicit authorization and successful prerequisites | No traffic shift or feature activation before authorization |
| G10 Post-activation | Monitored health, errors, key user flows, and rollback readiness | Roll back or disable via the approved procedure if acceptance fails |
| G11 Acceptance | Independent evidence review and recorded release-owner acceptance | Keep release unaccepted until evidence is complete |

## G02 runner diagnosis

1. Inspect the repository's existing Actions runner inventory before provisioning anything; do not register a duplicate runner.
2. On the approved isolated Linux x64 host, inspect the runner service, daemon process, service state, runner labels, network/DNS/HTTPS connectivity, and redacted service logs.
3. Use the repository's approved diagnostic script when available: `bash ops/g02/diagnose-runner.sh`.
4. Return the redacted report and its checksum to the incident record. Do not include credentials or environment secrets.
5. After an administrator-approved correction, execute a controlled sentinel workflow and preserve the run ID, attempt, job ID, runner ID/name, full commit SHA, step results, retrievable logs, artifact inventory, and checksums.
6. Accept G02 only when a real job has been assigned, the sentinel step has executed, logs are retrievable, and the evidence correlates to the intended commit. A runner shown as Online/Idle is not sufficient.

## CI pipeline contract

Every required workflow should:

- Pin or explicitly declare supported runtime/tool versions and use a deterministic dependency lockfile.
- Fail on non-zero subprocess exits, missing required inputs, missing expected artifacts, and unexpected skipped checks.
- Emit a machine-readable summary containing repository, full commit SHA, workflow run ID and attempt, job identity, runner identity, check names/results, and artifact checksums.
- Upload diagnostics and test reports even when a test fails, where safe and supported; never mask the original failing exit code.
- Distinguish infrastructure startup failures from application test failures. If no job initializes, report CI infrastructure failure and do not claim application tests passed.
- Keep preview verification distinct from production acceptance and release authorization.
- Avoid logging secrets; redact sensitive values before artifacts are retained.
- Use a bounded timeout and explicit failure handling for each subprocess.

## Firebase configuration acceptance

- Generate platform configuration from the authorized Firebase project using the approved Firebase/FlutterFire tooling; never invent project identifiers or API keys.
- Run the repository's Firebase configuration verifier and its regression tests.
- Keep service-account private keys and privileged credentials out of client configuration and source control.
- A static configuration pass is necessary but not sufficient: separately validate authorized live connectivity, Auth, database access, security rules, and expected platform behavior in a non-production validation environment.
- If required configuration is missing or contains placeholders, fail closed and keep the Firebase gate blocked.

## Preview and release evidence bundle

Retain a compact, redacted evidence bundle containing:

- Reviewed PR number, base/head branch, full head SHA, and approval status.
- Workflow run ID and attempt, initialized job ID, runner ID/name, and timestamps.
- Required check names, final exit statuses, and relevant test summaries.
- Build/deployment provider identifier and immutable preview/candidate revision.
- Route and critical-flow smoke results, browser/accessibility checks where required, and security-header results.
- Artifact names, SHA-256 checksums, and a manifest linking each artifact to the exact commit and workflow attempt.
- Explicit gate disposition and the identity/record of the authorized approver.

Missing or contradictory evidence means **BLOCKED**, not presumed success.

## Rollback readiness

Before any future production release is considered, document the current LKG identifier, the provider-supported rollback action, the authorized operator, health signals that trigger rollback, and the post-rollback validation steps. Do not execute a rollback or traffic change as a substitute for diagnosis or approval.

## Current baseline note

This runbook does not assert that CI is currently healthy, that Firebase configuration is valid, or that any release gate has passed. The active recovery record remains authoritative for live status. In particular, runner dispatch must be proven with real initialized-job evidence before CI-based validation is relied upon, and production remains on hold until all required gates are accepted.
