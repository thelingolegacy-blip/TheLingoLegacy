# G02 / CI Evidence Intake and Startup-Failure Runbook

**Status:** Operational evidence procedure  
**Control mapping:** M04 / M05 / M06 / G02  
**Canonical repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Policy:** Fail closed. No G02 PASS without executed sentinel steps, retrievable evidence, hashes, and independent acceptance.

## 1. Evidence record template

Copy this record for every relevant workflow run or runner observation.

```yaml
record_type: g02-ci-evidence
date_utc: "YYYY-MM-DD HH:MM"
recorded_by: ""
master_matrix_ids: [M04, M05, M06, G02]

run_id: null
job_id: null
workflow_file: ""
workflow_name: ""
commit_sha: ""
branch: ""
event: ""

runner_name: ""
runner_labels: []
runner_id: null
job_assigned: unknown
steps_executed: unknown
sentinel_result: NOT_RUN
artifact_produced: false
artifact_name: ""
artifact_sha256: ""
full_log_sha256: ""
logs_url: ""
run_url: ""
runner_inventory_evidence: ""
collected_at_utc: ""
correlation_id: ""

g02_status: UNVERIFIED
failure_class: UNKNOWN
independent_reviewer: ""
independent_acceptance: false
next_required_action: ""
```

### Required semantics

- `job_assigned` is true only when a concrete job is assigned to a runner; a queued workflow is not assignment.
- `steps_executed` is true only when job steps are instantiated and execution is visible in job evidence.
- `sentinel_result` is `PASS` only when the required sentinel actually ran and passed.
- `artifact_produced` is true only when the artifact can be retrieved; include its SHA-256.
- `g02_status` remains `FAIL` or `UNVERIFIED` until an independent reviewer accepts the complete evidence package.
- Never infer runner identity, labels, service health, or assignment from workflow YAML alone.

## 2. Failed-at-startup diagnostic checklist

1. **Classify the failure**
   - Capture workflow run ID, URL, event, branch, commit SHA, workflow file, conclusion, and timestamps.
   - Determine whether a job was created.
   - Distinguish workflow-level startup failure from a job that started and failed in its first step.

2. **Inspect job creation and assignment**
   - Retrieve the run's jobs endpoint and preserve the raw response.
   - Record job IDs, status, conclusion, runner ID, runner name, labels, and step list.
   - A missing job, runner ID 0, or empty runner name is not successful runner execution.

3. **Verify the dedicated runner**
   - Required name: `lingo-legacy-g02`.
   - Required labels: `self-hosted`, `linux`, `x64`, `lingo-g02`.
   - Verify runner registration, online/idle state, repository access scope, and service health using authorized runner inventory and host evidence.
   - Do not register a duplicate runner or start a runner service without explicit change authorization and token-safety checks.

4. **Inspect Actions policy and scheduling**
   - Verify repository and organization self-hosted runner policies.
   - Verify runner-group access restrictions and repository allowlists.
   - Check concurrency limits, billing/usage restrictions, event permissions, workflow path filters, job-level `if:` conditions, and required labels.
   - Preserve policy evidence before proposing changes. Do not alter organization/repository access policy as a diagnostic shortcut.

5. **Retrieve and preserve evidence**
   - Download available workflow logs and artifacts.
   - Compute SHA-256 for downloaded logs and artifacts.
   - Record raw API output, UTC collection time, collector identity, and correlation ID.
   - If evidence is unavailable, record the retrieval failure; do not fabricate a hash or artifact reference.

6. **Record disposition**
   - Fill the evidence template.
   - Map the finding to M04, M05, M06, and G02.
   - Identify the next action and independent reviewer.
   - Keep production promotion blocked until acceptance.

## 3. Master control mapping

| Control | Scope | Acceptance evidence | Current baseline |
|---|---|---|---|
| M04 | GitHub Actions execution and startup diagnosis | Workflow run, instantiated job, step evidence, logs, artifact metadata | FAIL / BLOCKED |
| M05 | Dedicated G02 runner registration, health, labels, assignment | Authorized runner inventory, runner ID/name, required labels, service/host evidence, assigned job | FAIL / UNVERIFIED |
| M06 | PR #508 G02 sentinel path correction and regression | Reviewed diff, successful execution on required runner, sentinel output, artifact hash, independent review | OPEN / NOT EXECUTED |
| G02 | End-to-end release consistency gate | All M04/M05/M06 evidence plus independent acceptance | FAIL / UNVERIFIED |

Related recovery tracker: issue #480.  
Related PRs noted in the supplied 2026-11-08 evidence package: #508, #504, #497, #495. Recheck their live state before relying on this snapshot.

## 4. Evidence snapshot recorded 2026-11-08

The following is a point-in-time observation, not a claim about subsequent runs:

| Run | Workflow | Branch / commit | Observed result |
|---|---|---|---|
| 42536619213 | Lingo Legacy Static CI | `feat/lingo-master-registry-wave0-2026-11-08` / `89e83f6ca79f20a2bbf122927c5fd77a17547328` | `startup_failure`; no job instantiated in the inspected run |

Run URL: https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/42536619213

PR #511 is the registry baseline PR and is separate from PR #508. Do not conflate their branch or run evidence.

Additional findings supplied for the 2026-11-08 hardening branch:
- Multiple Static CI, Flutter/Firebase integrity, G02 runner image, mobile native build, and Crimson Smoke UI workflows reportedly failed at startup.
- The supplied public evidence set did not show assignment to `lingo-legacy-g02`.
- PR #508 was reported open/draft and not executed on the dedicated runner.
- Issue #480 was reported to retain G02 FAIL / UNVERIFIED and production HOLD.

These additional observations are recorded as supplied context and must be refreshed against live GitHub evidence before operational decisions.

## 5. Suggested matrix / issue update

> **G02 / CI Status Update — 2026-11-08**
>
> M04: Multiple workflows were reported as failing at startup. Where no job was instantiated, no build, test, or sentinel execution occurred.
>
> M05: Assignment to the dedicated `lingo-legacy-g02` runner with labels `self-hosted, linux, x64, lingo-g02` has not been demonstrated by the current evidence set. Registration, service health, and assignment remain unverified.
>
> M06: PR #508 contains the reported sentinel-path correction but remains unmerged/unexecuted on the dedicated runner in the supplied snapshot. Regression evidence and independent acceptance remain outstanding.
>
> **Overall G02: FAIL / UNVERIFIED. Production promotion and mutation of last-known-good remain blocked.**
>
> Next actions: inspect runner inventory and Actions policy with authorized access; establish runner health and labels; execute the sentinel on the intended runner; retrieve and hash logs/artifacts; obtain independent acceptance before changing gate status.

## 6. Change-control and evidence integrity

- Read-only diagnostics first.
- No runner registration, runner service activation, access-policy changes, secret rotation, production route changes, or deployment without a change-specific authorization and rollback plan.
- Preserve last-known-good state.
- Record UTC timestamp, environment, actor, change type, authorization, and SHA-256 in the state-change manifest for every approved mutation.
- A proposed fix, green workflow badge, successful hosted smoke, or self-reported PASS is not G02 acceptance.
- A hosted `ubuntu-latest` smoke test is useful separate evidence, but it does not substitute for the dedicated self-hosted G02 runner.


## 7. Live GitHub refresh — 2026-11-08 23:48 UTC

Read-only refresh against the canonical repository confirmed:
- Registry PR #511 remains OPEN / DRAFT, base `main`, head `3ab09cfb48c40e9ae818f3d410dcfd2d49753c91`.
- PR #508 remains OPEN / DRAFT / UNMERGED; its validation section still states automated test execution was NOT RUN.
- The latest observed registry-branch runs on head `3ab09cfb48c40e9ae818f3d410dcfd2d49753c91` were:
  - Static CI `42536863874` — `startup_failure`.
  - Crimson Smoke UI static validation `42536864634` — `startup_failure`.
  - G02 Runner Image Build (no publish) `42536862999` — `startup_failure`.
- The separate read-only G02 Control Watch run `42536631210` on `main` also concluded `startup_failure`.
- The latest Static CI run `42536863874` returned an empty jobs array: zero instantiated jobs, therefore no steps or job artifacts to accept.
- Main branch API state reports `protected=false`, `protection.enabled=false`, and required status checks enforcement `off`. This is a governance/control gap. No branch-protection setting was changed.

Current refreshed mapping:
- M04: FAIL / BLOCKED — startup failures; latest inspected run has no jobs.
- M05: FAIL / UNVERIFIED — no evidence of dedicated runner assignment, registration, health, or completed sentinel steps.
- M06: OPEN / NOT EXECUTED — PR #508 remains draft and automated tests have not run.
- G02: FAIL / UNVERIFIED.
- Main protection: GAP / NOT ENFORCED — read-only API reports protection disabled.
- Production: HOLD; last-known-good preserved.

This refresh does not authorize reruns, runner activity, policy changes, merge, deployment, or production promotion.


## 8. Cross-stack refresh — Cloudflare and Firebase

Read-only Cloudflare version-detail inspection resolved the currently deployed versions:
- `thelingolegacyv-5`: deployed version **137**, ID `2d161fa5-598f-4998-ada8-7ac4c72c3461`; latest uploaded version is 270 and is not the deployed version.
- `lingo-flagship-root`: deployed version **1**, ID `658acd1a-997b-45cd-b8fc-e59c59b26b45`; latest uploaded version is 2 and is not the deployed version.
- The exact-root apex route overlaps `thelingolegacy.com/*`; precedence remains to be proven through isolated route probes.
- The apex A record points to `192.0.2.0` (TEST-NET-1). This is a critical origin/fallback validation blocker; no DNS change was made.

Read-only repository inspection found:
- `.firebaserc` defaults to `lingo-legacy-production`, but provider-side project identity is unverified.
- `firebase.client.json` and `lib/firebase_options.dart` contain placeholder API keys and app IDs.
- Root `firebase.json` publishes directory `.`; scope requires review before any deploy.
- No root `firestore.rules` exists; the discovered rules file is Oasis-specific under `studio-sites/games/oasis-platform/firebase-functions/`.

The new non-production API contract and Wave 0–4 checklist record these as blockers. No workflow dispatch, runner activity, Cloudflare deployment, route/DNS change, Firebase mutation, or production promotion occurred.


## 9. Latest branch-push CI result — 2026-11-08 23:58 UTC

The latest commits on the registry branch automatically generated new pull-request workflow runs. All three observed workflows again failed before job creation:
- Static CI `42537701303` — `startup_failure`, zero jobs.
- Crimson Smoke UI `42537702034` — `startup_failure`, zero jobs.
- G02 Runner Image Build (no publish) `42537700591` — `startup_failure`, zero jobs.

A read-only GitHub branch API refresh still reports `main.protected=false`, required-check enforcement `off`. The connected GitHub read interface rejects the repository runner-inventory endpoint as unsupported; therefore runner registration and service health cannot be independently inspected through this connection. No runner reset, registration, service activation, workflow dispatch, or branch-protection mutation was performed.

M04 remains FAIL/BLOCKED; M05 remains FAIL/UNVERIFIED; M06 remains OPEN/NOT EXECUTED; G02 remains FAIL/UNVERIFIED; production remains HOLD.
