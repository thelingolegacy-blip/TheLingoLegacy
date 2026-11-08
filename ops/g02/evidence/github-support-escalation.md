# GitHub Support Escalation — Actions Pre-Job Startup Failure

**Evidence refreshed:** 2026-11-05  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Environment:** GitHub Actions; affected workflows request GitHub-hosted Linux runners  
**Impact:** CI cannot instantiate jobs or produce execution evidence; G02 and downstream release gates remain blocked.  
**Support status:** No official GitHub Support case ID is recorded; this packet is prepared for owner submission and is not itself a filed ticket.

## Suggested support subject

GitHub Actions runs terminate with `startup_failure` before job creation; Jobs API returns zero jobs and no artifacts

## Support request

Please investigate a repository/account-specific GitHub Actions event-to-job / hosted-runner startup failure affecting multiple independent workflows in this repository.

Recent workflow runs associated with commit `9f25da0f49cdb87672da081478a0a021c286af29` completed with `startup_failure`. For each run, the Jobs API returned an empty `jobs` array and the Artifacts API returned zero artifacts. No job ID, runner ID, runner name, instantiated step, job log, or artifact is available. This is earlier than ordinary job-step execution, so the available evidence cannot establish a source-code test failure or identify the internal provider-side cause.

The affected workflows include static validation and the no-publish G02 runner image build. The repository's prior audit records that these workflows request GitHub-hosted Ubuntu runners; they are not waiting for the canonical self-hosted `lingo-legacy-g02` runner. Please confirm the exact runner assignment configuration from the run records.

Please investigate:
1. Whether the workflow event was accepted and translated into job records for these run IDs.
2. Whether hosted-runner allocation, queue admission, or job initialization failed before job creation.
3. Whether account-level usage limits, billing restrictions, repository/org Actions policies, concurrency controls, or service-side restrictions affected these runs.
4. Why the run-level conclusion is `startup_failure` while the Jobs API has no jobs and the Artifacts API has no artifacts.
5. Whether GitHub can provide internal event, queue, and runner-provisioning traces for the run IDs below.
6. What account-specific remediation or safe verification is required before another no-secret hosted-runner test.

## Latest reproduction evidence — 2026-11-05

Commit: `9f25da0f49cdb87672da081478a0a021c286af29`

| Workflow | Run ID | Run number | Conclusion | Jobs API | Artifacts API |
|---|---:|---:|---|---:|---:|
| Crimson Smoke UI — static validation | [42025730058](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/42025730058) | 630 | `startup_failure` | 0 | 0 |
| Lingo Legacy Static CI | [42025728232](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/42025728232) | 2148 | `startup_failure` | 0 | 0 |
| G02 Runner Image Build (no publish) | [42025726706](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/42025726706) | 646 | `startup_failure` | 0 | 0 |

For each run, read-only retrieval of:
- `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs` returned `jobs: []`.
- `GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts` returned an empty artifact list.

The connector's available run response did not expose timestamps or a provider-side failure reason. No numeric job IDs, runner IDs, runner names, steps, logs, or artifact bytes were returned. Do not infer missing values.

## Public service status context

The official GitHub status page was checked on 2026-11-05:
- GitHub currently reports **All Systems Operational**, including Actions.
- The page records an Actions incident on Nov 4, 2026, from 17:40 to 18:16 UTC, resolved.
- The Nov 4 incident update said GitHub had identified an issue with events that might trigger Actions and applied mitigations.
- A separate Actions and Pages incident on Nov 4, 16:05–17:01 UTC, was also marked resolved.

Official status page: https://www.githubstatus.com/

The Nov 4 incidents are relevant context but are not proof of the cause of these later run IDs. Since the public status page is now operational while the listed runs still show pre-job startup failure, please investigate repository/account-specific orchestration and policy state rather than attributing these failures solely to a current global outage.

## Earlier reproduction history

The following earlier runs were recorded in the Oct 10 support packet. They showed a different API shape: jobs existed but reported runner ID 0, empty runner name, and no steps. They are retained as historical context and should not be conflated with the Nov 5 zero-job runs.

| Run | Workflow | Job ID | Commit | Requested runner | Runner ID | Runner name | Steps |
|---|---|---:|---|---|---:|---|---|
| [38076892083](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076892083) | Studio Sandbox Guard | 114285643465 | `6eaa828b5fd8249e02e012eb3fc0530c5f6c9bd6` | `ubuntu-latest` | 0 | empty | `[]` |
| [38076892062](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076892062) | Lingo Legacy Static CI | 114285643511 | `6eaa828b5fd8249e02e012eb3fc0530c5f6c9bd6` | `ubuntu-latest` | 0 | empty | `[]` |
| [38076850060](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076850060) | Studio Sandbox Guard | 114285514743 | `1c20b69c59ddcca1f8a941d7e19167ded180f7b8` | `ubuntu-latest` | 0 | empty | `[]` |
| [38076850062](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076850062) | Lingo Legacy Static CI | 114285514623 | `1c20b69c59ddcca1f8a941d7e19167ded180f7b8` | `ubuntu-latest` | 0 | empty | `[]` |
| [38076793713](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076793713) | Studio Sandbox Guard | 114285344938 | `8715bd79ee623dc46e85e3882be4f909b77586c5` | `ubuntu-latest` | 0 | empty | `[]` |
| [38076793697](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076793697) | Lingo Legacy Static CI | 114285344450 | `8715bd79ee623dc46e85e3882be4f909b77586c5` | `ubuntu-latest` | 0 | empty | `[]` |
| [38076658254](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076658254) | Lingo Legacy Static CI | 114284945890 | `92eb918b73abb3700926215d774679f41f37ecf9` | `ubuntu-latest` | 0 | empty | `[]` |

Historical supporting observations:
- A prior artifact query for run `38076658254` returned zero artifacts.
- Log retrieval for job `114284945890` returned `BlobNotFound`.
- The GitHub connector cannot read repository runner inventory or effective Actions policy endpoints; no runner inventory or account policy is asserted here.
- A separate Vercel status context previously reported an account deployment-blocked/build-rate-limit condition; this is not evidence about GitHub Actions runner assignment.

## Separate G02 host boundary

- The canonical G02 runner requires a dedicated Linux x64 host and exact runner identity `lingo-legacy-g02`.
- Repository records and issue #242 state that no dedicated host or active runner daemon has been verified.
- The Cloudflare control Worker is not a Linux runner.
- The inactive Legacy Loop tunnel is not proof of a host or runner.
- Hosted-runner startup failures and the missing canonical self-hosted host are separate blockers.

## Requested provider response

Please return:
- Whether each run's workflow event was accepted.
- Whether a job object was created internally and, if not, the stage at which creation failed.
- Whether runner allocation was attempted and the failure category, if applicable.
- Any relevant account usage, billing, policy, or suspension restriction.
- The recommended remediation and the safest low-impact validation method.

## Release safety and handling

- G02: **FAIL / UNVERIFIED**
- G03–G11: **HOLD**
- Production mutation: **FROZEN**
- Last-known-good: **PROTECTED**
- No production merge, deployment, DNS change, secret mutation, runner registration, or activation is authorized by this packet.
- No workflow was dispatched to create this evidence; no additional Actions usage was consumed.
- Do not include runner registration tokens, access tokens, secret values, private host credentials, or unredacted environment dumps in the support ticket.
- The linked run IDs and API response counts are sufficient for GitHub to begin backend investigation.

## Related repository tracking

- [Issue #437 — G02 recovery: investigate pre-job Actions startup failures](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/437)
- [Issue #242 — Provision isolated runner host and prove job assignment](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/242)
- [PR #452 — Hard-disable public-repository self-hosted execution pending a trusted private control plane](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/452)
- [PR #436 — Existing production workflow dependency correction](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/436)
