# G02 — GitHub Actions pre-job dispatch escalation packet

**Status:** Draft template; fill in timestamps and attach redacted evidence before submitting.  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Current recovery branch:** `repair/g02-self-hosted-runner-naming-2026-10-24`  
**Production posture:** Protected hold; no deployment or promotion authorized.

## Summary for support

Multiple workflows on the same commit have concluded `startup_failure` before any job was initialized. The latest observed runs report zero jobs and zero artifacts. This is an execution/dispatch evidence gap, not proof that application tests ran and failed. The root cause is undetermined.

Please investigate whether these runs were rejected or failed during GitHub Actions workflow/job dispatch, runner assignment, or log/artifact initialization. We need the platform-side failure reason and any relevant repository/account policy restriction, not another workflow retry.

## Latest parallel recheck (2026-10-24)

Read-only checks were repeated across the following runs. Each returned `startup_failure`, with zero jobs and zero artifacts in the connected run-jobs and run-artifacts endpoint responses. This is evidence of pre-job failure, not proof of an application test failure. Exact UTC timestamps should be copied from the run metadata before submitting the ticket.

- Crimson Smoke UI — static validation: https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40133631033
- Lingo Legacy Static CI: https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40133631843
- G02 Runner Image Build (no publish): https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40133630232
- Earlier corroborating run: https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40127783265

No workflow retry, merge, runner-setting mutation, or production change was performed during this recheck.

## Latest run evidence

| Workflow | Run ID | Observed conclusion | Jobs | Artifacts |
|---|---:|---|---:|---:|
| Crimson Smoke UI — static validation | 40127783265 | `startup_failure` | 0 | 0 |
| Crimson Smoke UI — static validation | 40127528789 | `startup_failure` | 0 | 0 |
| Lingo Legacy Static CI | 40127528124 | `startup_failure` | 0 | 0 |
| G02 Runner Image Build (no publish) | 40127527347 | `startup_failure` | 0 | 0 |

Previous observed runs (also `startup_failure`, 0 jobs, 0 artifacts):

| Workflow | Run ID | Observed conclusion | Jobs | Artifacts |
|---|---:|---|---:|---:|
| Crimson Smoke UI — static validation | 40125931229 | `startup_failure` | 0 | 0 |
| Lingo Legacy Static CI | 40125930706 | `startup_failure` | 0 | 0 |
| G02 Runner Image Build (no publish) | 40125931937 | `startup_failure` | 0 | 0 |

Earlier corroborating runs:

| Workflow | Run ID | Observed conclusion | Jobs | Artifacts |
|---|---:|---|---:|---:|
| Crimson Smoke UI — static validation | 40124210534 | `startup_failure` | 0 | 0 |
| Lingo Legacy Static CI | 40124209733 | `startup_failure` | 0 | 0 |
| G02 Runner Image Build (no publish) | 40124209037 | `startup_failure` | 0 | 0 |

| Workflow | Run ID | Observed conclusion | Jobs | Artifacts |
|---|---:|---|---:|---:|
| Crimson Smoke UI — static validation | 40123956734 | `startup_failure` | 0 | 0 |
| Lingo Legacy Static CI | 40123955882 | `startup_failure` | 0 | 0 |
| G02 Runner Image Build (no publish) | 40123955061 | `startup_failure` | 0 | 0 |
| G02 Runner Image Build (no publish) | 40123862743 | `startup_failure` | 0 | 0 |
| Lingo Legacy Static CI | 40123862003 | `startup_failure` | 0 | 0 |
| Crimson Smoke UI — static validation | 40123861256 | `startup_failure` | 0 | 0 |

Run observations must be refreshed before filing. Attach fresh run pages/API responses and timestamps. Do not attach tokens, runner registration credentials, private keys, or unredacted environment dumps.

## Exact PR-head CI refresh — 2026-10-24

Read-only inspection of the three automatic workflow runs associated with the PR-head documentation commit `25a83163643d7a2bba7c2b38b0148a9234884ccc` found the same pre-job failure pattern. The jobs and artifacts endpoints were checked directly for each run and returned empty lists:

| Workflow | Run ID | Workflow ID | Conclusion | Jobs | Artifacts |
|---|---:|---:|---|---:|---:|
| Crimson Smoke UI — static validation | 40127528789 | 393318662 | `startup_failure` | 0 | 0 |
| Lingo Legacy Static CI | 40127528124 | 307685658 | `startup_failure` | 0 | 0 |
| G02 Runner Image Build (no publish) | 40127527347 | 391713646 | `startup_failure` | 0 | 0 |

The available commit-runs wrapper does not return the associated check-suite IDs or full run metadata for these runs. The upgraded collector now captures `check_suite_id` from each run metadata response and dynamically adds discovered suite IDs to its check-suite/check-run capture, so the authorized administrator can collect the missing platform diagnostics without manually guessing IDs. These observations do not establish a root cause. Do not interpret the unrelated Vercel preview success status as a passing GitHub Actions job or G02 acceptance.

## Expanded diagnostics and parallel triage — 2026-10-24

A subsequent read-only query found run [40127783265](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40127783265) on documentation commit `43a6a21031e818f52a53f50115aee7a3c08e93b6`: Crimson Smoke UI — static validation, `startup_failure`, zero jobs and zero artifacts. It is now included in the collector's default run list.

The collector has been expanded to capture the run timing endpoint for each requested run and check runs indexed by each distinct head commit SHA, in addition to run metadata, jobs, artifact inventory, runner/workflow inventory, repository and optional organization/enterprise permissions, check-suite metadata, and check-run output. These independent views are intended to improve observability at the startup boundary; they do not create jobs or change GitHub's dispatch state.

### Parallel triage lanes

1. **Run / check evidence:** correlate run metadata, timing, check-suite output, commit-level check runs, jobs and artifact inventories for each new failure.
2. **Policy / capacity:** authorized repository/org/enterprise administrators verify Actions enabled state, policy inheritance, billing/capacity signals and runner-group access. A denied API endpoint is unavailable evidence, not an empty inventory.
3. **Workflow resolution:** inspect the exact workflow files and event/ref on the failing runs; compare against the registered workflow IDs and known-good history without renaming/deleting workflows or making speculative permission changes.
4. **Runner path:** verify actual runner registration, status, group access, labels and daemon health only where a self-hosted runner is in scope. Because GitHub-hosted workflows also fail, do not assume the self-hosted daemon is the sole cause.
5. **Release governance:** keep the gate matrix fail-closed and track accessibility, Firebase placeholders, administrator governance and hosting access separately from G02.

### Positive G02 operating rule

Keep the objective positive and the evidence standard strict: G02 advances only when a real job is assigned to a runner, has initialized steps, executes the canonical sentinel successfully, and produces retrievable logs plus an evidence artifact linked to the exact run/job/commit. Until then, report `BLOCKED — diagnosis progressing`, not PASS. Do not add artificial jobs or empty artifacts merely to increase counts; they would obscure the pre-job failure rather than solve it.

## Newest corroborating run and check-suite identifiers — 2026-10-24

The three newest read-only inspections (retrieved 2026-10-24 around 19:55 UTC) found that the run records reference registered workflow IDs and existing workflow paths, while the jobs endpoint returned an empty list and the artifact endpoint returned no artifacts. All three runs reference commit `8e68550f3945c46c23c297bb3d9dd87e704c5e19`:

| Workflow | Run ID | Workflow ID | Check suite ID | Result |
|---|---:|---:|---:|---|
| Crimson Smoke UI — static validation | 40127462871 | 393318662 | 108765123220 | `startup_failure`, 0 jobs, 0 artifacts |
| Lingo Legacy Static CI | 40127461935 | 307685658 | 108765120960 | `startup_failure`, 0 jobs, 0 artifacts |
| G02 Runner Image Build (no publish) | 40127461258 | 391713646 | 108765119082 | `startup_failure`, 0 jobs, 0 artifacts |

The workflow sources exist on both `main` and the recovery branch. These facts do not prove a YAML defect, runner-label mismatch, or self-hosted daemon failure; at least one affected workflow is configured for GitHub-hosted execution. Check-suite/check-run output and administrator policy evidence are still required to distinguish admission/policy issues from a GitHub-side dispatch or logging fault.

### Authenticated administrator diagnostic commands

Run from a trusted workstation with an authorized GitHub CLI session. These commands are read-only and must not be run with a token pasted into chat:

```bash
gh auth status
command -v jq
bash -n ops/g02/collect-admin-evidence.sh
gh api repos/thelingolegacy-blip/TheLingoLegacy/actions/runs/40127527347 --jq '{id,name,path,workflow_id,check_suite_id,event,head_sha,conclusion,status,created_at}'
bash ops/g02/collect-admin-evidence.sh
gh api repos/thelingolegacy-blip/TheLingoLegacy/actions/permissions
gh api repos/thelingolegacy-blip/TheLingoLegacy/actions/permissions/workflow
gh api 'repos/thelingolegacy-blip/TheLingoLegacy/actions/runner-groups?per_page=100'
# Optional: set ORG and/or ENTERPRISE_SLUG when authorized to inspect inherited policy.
gh api orgs/ORG_SLUG/actions/permissions
gh api 'orgs/ORG_SLUG/actions/runner-groups?per_page=100'
gh api enterprises/ENTERPRISE_SLUG/actions/permissions
gh api 'enterprises/ENTERPRISE_SLUG/actions/runner-groups?per_page=100'
```

The updated collector records `check_suite_id` for each run, dynamically captures check-suite/check-run output for every discovered suite, captures timing for each run, captures commit-indexed check runs for each discovered head SHA, captures all available job attempts, inventories repository runner groups, and probes each run's log-download endpoint while discarding the response body so potentially sensitive log contents are not written by the collector. Run `bash -n ops/g02/collect-admin-evidence.sh` before executing it and stop if syntax validation fails. A successful log-endpoint probe confirms endpoint availability only; an authorized operator must still inspect logs through an approved controlled process and correlate them to the exact job/run. Set `ORG` and/or `ENTERPRISE_SLUG` only to the correct organization/enterprise slug for which the authenticated administrator is authorized; leave them unset otherwise. Preserve complete response metadata and UTC timestamps; redact sensitive account details before sharing. Repository-level endpoints do not establish inherited organization/enterprise policy. If any endpoint is denied, record the exact HTTP status and authenticated account's access level rather than changing permissions speculatively.

## Questions for GitHub Support

1. What exact platform-side reason produced `startup_failure` for these run IDs?
2. Were jobs created and rejected before runner assignment, or did dispatch fail before job creation?
3. Is there a repository, organization, enterprise, billing, policy, runner-group, or service-side restriction affecting these runs?
4. Are the missing job records/log artifacts expected for this failure class, or is there a log/artifact service incident?
5. What specific corrective action and verification would establish that dispatch is healthy?

## Evidence the repository owner must add

- UTC timestamp when the latest run details were retrieved.
- Output from `bash ops/g02/collect-admin-evidence.sh`, especially `collection-status.txt` and filtered job snapshots.
- Repository Settings → Actions → General: enabled state and applicable policies, with inherited/organization restrictions noted.
- Settings → Actions → Runners: exact runner ID/name/status/labels/group/access scope, or explicit note that no repository runner is configured.
- If using self-hosted infrastructure: redacted `ops/g02/diagnose-runner.sh` report from the approved host, including daemon/service status and reachability.
- GitHub Support case ID and any support-provided root-cause statement.

## Required safety boundaries

- Do not repeatedly retry or dispatch the same workflow while zero-job failures persist.
- Do not disable branch protections, broaden token permissions, expose secrets, or provision duplicate runners as a speculative fix.
- Do not run untrusted pull-request code on a privileged self-hosted host.
- Do not merge PR #353, promote a release, or change production deployment settings to test dispatch.
- Keep G02 blocked until the canonical sentinel completes with a positive runner ID/name, initialized steps, actual sentinel PASS, retrievable logs and evidence artifact, and matching run/job/commit identifiers.
