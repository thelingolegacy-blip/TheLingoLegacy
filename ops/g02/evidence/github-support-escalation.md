# GitHub Support Escalation — Actions Runner Allocation/Initialization

**Prepared:** 2026-10-10  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Pull request:** [#257](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/257)  
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
