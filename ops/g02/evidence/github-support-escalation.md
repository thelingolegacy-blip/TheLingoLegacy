# GitHub Support Escalation — Actions Runner Allocation/Initialization

**Prepared:** 2026-10-16  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Current recovery pull request:** [#309](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/309)  
**Environment:** GitHub Actions, public repository, pull_request-triggered jobs  
**Impact:** CI cannot provide execution evidence; release gates remain blocked.

## Suggested support subject

GitHub Actions jobs complete as failures before step initialization; runner_id=0, empty runner_name, no steps/logs/artifacts

## Support request

Please investigate a GitHub Actions runner allocation/initialization failure affecting multiple workflows in this repository.

Multiple jobs requesting the standard GitHub-hosted `ubuntu-latest` runner are marked completed/failure almost immediately, but the Jobs API reports `runner_id: 0`, empty `runner_name`, `runner_group_id: 0`, and `steps: []`. The logs endpoint returns no retrievable logs; the connected log retrieval returned `BlobNotFound`. The artifact endpoint reports zero artifacts. Because no step is instantiated, the available evidence does not show a source-level test failure.

This issue reproduces in both the existing CI workflow and a minimal read-only validation workflow. A separate G02 sentinel requires a self-hosted runner, but the hosted-runner jobs failing with `ubuntu-latest` indicate that simply adjusting custom labels is not a sufficient explanation.

Please verify:
1. Whether hosted-runner dispatch/allocation or job initialization is failing for this repository/account.
2. Whether an account-level hosted-runner quota, billing/build limit, policy, suspension, or service-side restriction is preventing runner assignment.
3. Whether the empty step list and missing log blob are expected consequences of a pre-initialization failure.
4. What provider-side evidence or remediation is required to restore normal runner assignment.
5. Whether any repository/org Actions policy or inherited restriction is involved.

## Reproduction evidence

All times UTC on 2026-10-10.

| Run | Workflow | Job ID | Commit | Requested runner | Runner ID | Runner name | Steps | Result |
|---|---|---:|---|---|---:|---|---|---|
| [38076892083](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076892083) | Studio Sandbox Guard | 114285643465 | `6eaa828b5fd8249e02e012eb3fc0530c5f6c9bd6` | `ubuntu-latest` | 0 | empty | `[]` | failure |
| [38076892062](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076892062) | Lingo Legacy Static CI | 114285643511 | `6eaa828b5fd8249e02e012eb3fc0530c5f6c9bd6` | `ubuntu-latest` | 0 | empty | `[]` | failure |
| [38076850060](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076850060) | Studio Sandbox Guard | 114285514743 | `1c20b69c59ddcca1f8a941d7e19167ded180f7b8` | `ubuntu-latest` | 0 | empty | `[]` | failure |
| [38076850062](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076850062) | Lingo Legacy Static CI | 114285514623 | `1c20b69c59ddcca1f8a941d7e19167ded180f7b8` | `ubuntu-latest` | 0 | empty | `[]` | failure |
| [38076793713](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076793713) | Studio Sandbox Guard | 114285344938 | `8715bd79ee623dc46e85e3882be4f909b77586c5` | `ubuntu-latest` | 0 | empty | `[]` | failure |
| [38076793697](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076793697) | Lingo Legacy Static CI | 114285344450 | `8715bd79ee623dc46e85e3882be4f909b77586c5` | `ubuntu-latest` | 0 | empty | `[]` | failure |
| [38076658254](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076658254) | Lingo Legacy Static CI | 114284945890 | `92eb918b73abb3700926215d774679f41f37ecf9` | `ubuntu-latest` | 0 | empty | `[]` | failure |

Additional observed API responses:
- `GET /actions/runs/{run_id}/jobs` consistently returned runner ID 0, empty runner name, and empty steps for the listed jobs.
- `GET /actions/runs/38076658254/artifacts` returned `total_count: 0`.
- Log retrieval for job `114284945890` returned `BlobNotFound`.
- The GitHub repository connector could not read the repository runner inventory or Actions permission endpoints, so runner inventory and effective policy are not asserted here.
- A separate Vercel status context is also failing with an account deployment-blocked/build-rate-limit destination. Please distinguish that external status from the missing GitHub runner assignment.

## Expected behavior

Each job should be assigned to a real runner, have a nonzero runner ID and populated runner name, instantiate steps, execute the first step, and produce retrievable logs. The validation workflow should then produce its normal success/failure result and evidence.

## Release safety

The repository is maintaining a protected hold:
- G02: FAIL / UNVERIFIED
- G03–G11: BLOCKED
- Production mutation: FROZEN
- Last-known-good: PROTECTED
- No production merge, deployment, DNS change, secret mutation, or activation is authorized by this report.

Do not share runner registration tokens, access tokens, secret values, private host credentials, or unredacted environment dumps in the ticket. The linked run/job IDs are sufficient to begin provider-side investigation.


## Current-head addendum — 2026-10-16

**Recovery commit under test:** `3ff82550a20b819c53b2831e8414ad333b7107f5`  
**Recovery branch:** `infra/lingoassist-reformed-infrastructure-2026-10-16`

The following latest PR-triggered runs were independently re-read through the GitHub Actions connector on 2026-10-16:

| Run | Workflow | Job ID | Terminal result | Steps | Logs |
|---|---|---:|---|---|---|
| [38962457522](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38962457522) | Lingo Legacy Static CI | 117180653120 | completed / failure | null | null |
| [38962457284](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38962457284) | LINGOassist Recovery Diagnostics | 117180651616 | completed / failure | null | null |
| [38962457450](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38962457450) | LINGO Recovery Foundation Gate | 117180652667 | completed / failure | null | null |

These records remain pre-step failures: the latest Jobs API responses contain `steps: null` and `logs_url: null`. They do not provide evidence that any workflow command ran or that application tests failed. Runner identity remains unobserved in these normalized job responses; the established historical evidence of `runner_id=0` and empty `runner_name` is documented above in the incident history.

## Independent source-validation path (not a G02 substitute)

Cloudflare Builds successfully cloned the recovery branch and ran the source validation after the queued-job gate fix:
- Successful build: `b916ff85-db01-4029-a1f4-aeffe01ced22`
- Commit: `3ff82550a20b819c53b2831e8414ad333b7107f5`
- Test result: 33 tests passed
- Python compilation: PASS
- Bash syntax checks: PASS
- Worker deployment during this source-validation retest: SKIPPED
- Production promotion: FORBIDDEN

This provides an alternate isolated source-validation path, but does not resolve GitHub-hosted runner allocation, supply a GitHub Actions execution record, or satisfy G02 acceptance.

## Current escalation status

The official GitHub Support case is **not confirmed submitted** and no official Support ticket ID is recorded. The repository issue numbers and workflow run IDs are not Support case IDs. Submit this packet through the authenticated GitHub Support portal and ask for provider-side investigation of runner allocation/initialization and missing log blobs. Do not include secrets, runner registration tokens, or host credentials.

Current gates remain:
- G02: BLOCKED / FAIL-UNVERIFIED
- Production promotion and activation: BLOCKED
- Last-known-good release: PROTECTED


## Post-cleanup checkpoint — 2026-10-16

**Current PR head at inspection:** `cb494d5826465731b7d74e2778385c997c6b88ec`  
**Cleanup:** removed the redundant `.github/workflows/lingoassist-recovery-diagnostics.yml` from this isolated PR branch. The remaining changed files are the agent operating contract, infrastructure reform plan, this escalation packet, and `ops/recovery/unified_gate.py`.

The cleanup commit triggered these additional PR workflow runs. The GitHub Actions Jobs API was queried after completion:

| Run | Workflow | Job ID | Status / conclusion | Steps | Logs URL | Artifacts |
|---|---|---:|---|---|---|---|
| [38963664122](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38963664122) | Lingo Legacy Static CI | 117184692047 | completed / failure | null | null | none |
| [38963664057](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38963664057) | LINGO Recovery Foundation Gate | 117184692293 | completed / failure | null | null | none |

These are additional pre-step evidence failures. They do not establish that source tests executed or failed and do not establish a root cause. The earlier three-run table above remains historical evidence for commit `3ff82550a20b819c53b2831e8414ad333b7107f5`; it is not the latest run set.

**Support status:** no official GitHub Support case or ticket number has been verified. Submit this packet through the authenticated GitHub Support portal and request provider-side investigation of runner allocation/initialization and missing log blobs. Do not represent repository issue or Actions run IDs as a Support ticket number.

**Gate state:** G02 BLOCKED / FAIL-UNVERIFIED; production promotion and activation BLOCKED; LKG PROTECTED. No merge or production deployment is authorized by this update.
