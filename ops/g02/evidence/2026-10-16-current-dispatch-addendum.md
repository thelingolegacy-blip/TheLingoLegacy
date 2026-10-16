# G02 Support Packet Addendum — 2026-10-16

## Purpose

Append current branch-head evidence to the prepared GitHub Support escalation packet. This addendum supplements, rather than silently replaces, the historical evidence in `ops/g02/evidence/github-support-escalation.md`.

## Latest observed dispatch failure

- Repository: `thelingolegacy-blip/TheLingoLegacy`
- Pull request: [#277 — isolated Cloudflare staging](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/277)
- Branch: `repair/cloudflare-preview-vars-main-2026-10-13`
- Observed head commit: `7ceb5fe58edde9396434eaac7c9b11d9f3e671c8`
- Workflow run: [Lingo Legacy Static CI #38867252460](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38867252460)
- Job: `116862822394`
- Requested runner: `ubuntu-latest`
- Returned runner ID: `0`
- Runner name: empty
- Steps: `[]`
- Outcome: failed before executable steps were initialized

The provider-returned job record indicates that no executable step result was exposed for this run. This is evidence of a pre-step runner-allocation/initialization failure; it is not evidence that the staging verifier or application tests ran and failed.

A previous run, [#38867139102](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38867139102), was also recorded as failing before step initialization. Its detailed job identity is not repeated here because it was not independently re-read for this addendum.

## Impact on staging execution

PR #277 adds a staging deployment workflow using `workflow_dispatch`, but the workflow exists only on the unmerged PR branch. GitHub's manual-dispatch mechanism requires the workflow to be present on the default branch. The current PR therefore cannot bootstrap this manual deployment workflow while remaining unmerged.

This sequencing issue is separate from the runner-allocation incident. It does not justify merging around G02 or deploying directly through Cloudflare. The safe sequence remains: resolve runner/account execution, obtain real CI evidence, complete required review gates, then make the staging workflow available through the approved merge path and execute its validation/deployment steps.

## Current gate and safety state

- G02: FAIL / UNVERIFIED
- Staging verifier: NOT EXECUTED
- Wrangler dry-run for the dedicated staging config: NOT EXECUTED
- Dedicated staging Worker: NOT CREATED / NOT VERIFIED
- Production mutation: FROZEN
- Last-known-good: PROTECTED
- PR #277: open, draft, unmerged

## Support case status

This is a prepared evidence addendum, not a submitted GitHub Support case. No official Support ticket ID or provider diagnosis has been verified. The next external action remains submitting the prepared escalation materials through the authenticated GitHub Support portal and recording the official case number and response.

Do not include tokens, secret values, runner registration credentials, or unredacted host environment data in the case.
