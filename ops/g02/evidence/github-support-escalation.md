# GitHub Support Escalation — Actions Runner Allocation/Initialization

**Prepared:** 2026-11-08  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Current remediation PR:** [#501](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/501)  
**Affected workflow:** Cloudflare Worker Hardening — Dry Run  
**Environment:** GitHub Actions, pull-request-triggered workflows  
**Impact:** No executable CI evidence is available; release gates remain blocked.

## Suggested support subject

Multiple GitHub Actions workflows terminate with `startup_failure` before any job or executable step is exposed

## Support request

Please investigate a GitHub Actions startup/runner initialization failure affecting multiple workflows in this repository.

On the current remediation branch head, four independent workflows returned `completed / startup_failure`. The GitHub connector exposed no executable job or step evidence for these runs. The Cloudflare hardening workflow therefore did not execute its contract checks, Durable Object regression tests, or Wrangler dry-run.

Earlier repository evidence, recorded in issue #209, includes hosted `ubuntu-latest` jobs that completed as failures with `runner_id: 0`, empty `runner_name`, `steps: []`, no retrievable logs (`BlobNotFound`), and zero artifacts. The repository-side record documents repeated occurrences across unrelated workflows and commits. The current startup-failure observations do not independently establish the provider-side cause.

Please verify:
1. Whether hosted-runner dispatch, allocation, or job initialization is failing for this repository/account.
2. Whether an account-level quota, billing/build limit, policy, suspension, or service-side restriction is preventing normal job startup.
3. Whether the current `startup_failure` records and historical empty runner identity/steps/logs share a provider-side cause.
4. Whether any repository/org Actions policy or inherited restriction is involved.
5. What provider-side remediation and evidence are required to restore normal runner execution.

## Latest branch-head reproduction evidence

Observed 2026-11-08 for the current PR #501 head `e9198541b2f1861e7c00fdbca24bb10f387db5f7`:

| Run | Workflow | Run status | Conclusion |
|---:|---|---|---|
| [42464642366](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/42464642366) | Cloudflare Worker Hardening — Dry Run | completed | startup_failure |
| [42464643961](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/42464643961) | Lingo Legacy Static CI | completed | startup_failure |
| [42464644547](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/42464644547) | G02 Runner Image Build (no publish) | completed | startup_failure |
| [42464643165](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/42464643165) | Crimson Smoke UI — static validation | completed | startup_failure |

The workflow-run API returned these four records for the current commit. The connector's workflow-run wrapper does not return job payloads or logs; no runner identity, instantiated steps, or executable result can be inferred from these records.

### Historical corroboration

Repository issue [#209](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/209) contains prior repeated examples on GitHub-hosted `ubuntu-latest`:
- `runner_id = 0`
- empty `runner_name`
- `steps = []`
- log retrieval failures including `BlobNotFound`
- zero artifacts on inspected runs
- failures across unrelated workflows on the same commit

Issue #209 also records that repository-side workflow minimization, retries, and cross-workflow corroboration were exhausted. It directs escalation to GitHub's hosted Actions/account boundary rather than further workflow complexity or runner substitution.

## Required expected behavior

A genuine GitHub-hosted job must be assigned to a real runner, expose a nonzero runner ID and populated runner name, instantiate and execute steps, and provide retrievable logs. The hardening workflow must then produce real test output and a Wrangler dry-run result tied to the current commit.

## Release safety

- G02: FAIL / UNVERIFIED
- G03–G11: BLOCKED
- PR #501: DRAFT / OPEN / UNMERGED
- Production mutation: FROZEN
- Last-known-good: PROTECTED
- No production merge, deployment, DNS change, route mutation, secret mutation, or activation is authorized by this report.

Do not share runner registration tokens, access tokens, secret values, private host credentials, or unredacted environment dumps in the ticket. The run IDs above and issue #209 provide concrete starting evidence.

## Submission status

**Prepared only — NOT SUBMITTED.** This repository connector cannot create an authenticated GitHub Support case or return an official Support case ID. The account owner must submit this packet through https://support.github.com/contact and record the official case ID and response in the repository.
