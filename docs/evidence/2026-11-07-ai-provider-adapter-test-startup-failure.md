# AI Provider Adapter Test Workflow — Execution Evidence

**Date:** 2026-11-07  
**Repository:** thelingolegacy-blip/TheLingoLegacy  
**Pull request:** #500  
**Current audited PR head:** `a6cd1066b3c8d59d297f2a35dd0d362f730ce78b`  
**Workflow:** LLG AI Provider Adapter Tests  
**Latest observed run:** `42407437725`  
**Run URL:** https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/42407437725  
**Trigger:** pull_request  
**Disposition:** STARTUP_FAILURE — test process did not execute.

## Latest exact-head Actions evidence

The current PR head produced these six workflow runs:

| Workflow | Run ID | Conclusion | Jobs | Artifacts |
|---|---:|---|---:|---:|
| Crimson Smoke UI — static validation | 42407441912 | `startup_failure` | 0 | 0 |
| Studio Static Validation | 42407441106 | `startup_failure` | 0 | 0 |
| G02 Runner Image Build (no publish) | 42407440239 | `startup_failure` | 0 | 0 |
| Studio Preview Package | 42407438607 | `startup_failure` | 0 | 0 |
| Lingo Legacy Static CI | 42407439452 | `startup_failure` | 0 | 0 |
| LLG AI Provider Adapter Tests | 42407437725 | `startup_failure` | 0 | 0 |

For all six runs, the GitHub Actions jobs endpoint returned an empty job list and the artifacts endpoint returned an empty artifact list. Therefore there is no runner assignment, instantiated job, step execution, job log, test report or uploaded artifact for these runs.

A retry was attempted for run `42407437725` using GitHub's failed-jobs retry operation. GitHub rejected it with HTTP 403: `This workflow run cannot be retried`. This is consistent with a run that never created a retryable failed job; it does not repair the underlying Actions startup issue.

## Interpretation

This is an Actions orchestration/startup failure, not a provider-adapter test failure and not a passing test. Since no job was instantiated, no assertion in `src/ai/provider-adapters.test.mjs` is known to have executed on GitHub Actions. No test result is inferred from these workflow runs.

The failure is not isolated to the new provider test: five other workflows on the same exact PR head also failed before job creation. This cross-workflow pattern warrants investigation through the existing infrastructure recovery issue [#437](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/437). The current evidence does not establish whether the root cause is GitHub's event-to-job orchestration, repository Actions configuration/policy, or hosted-runner provisioning.

## Test workflow safety scope

The added workflow:
- uses GitHub-hosted `ubuntu-latest`;
- uses Node.js 22;
- grants `contents: read` only;
- checks out source without persisting credentials;
- makes mocked requests through injected fetch functions;
- does not require or access provider API keys;
- does not call paid model APIs;
- uploads the test log only after a job actually starts.

## Separate local test evidence

The exact adapter and test source blobs remain unchanged on the current branch:
- `src/ai/provider-adapters.mjs`: `c11a0a076410ae7ff1e50f056cc9417dcd7b5071`
- `src/ai/provider-adapters.test.mjs`: `61d4f577296f5801fd17490aa1f82018ad525796`

The prior isolated local Node.js v22.16.0 execution recorded 15 passed, 0 failed. See [local executable test evidence](2026-11-07-ai-provider-adapter-local-tests.md). That result is not a GitHub-hosted runner execution and is not G02 acceptance.

## Required recovery

1. Resolve the common Actions pre-job startup failure through the existing infrastructure recovery workstream [#437](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/437).
2. Obtain a fresh workflow run on the exact current PR head after the Actions event-to-job path is restored.
3. Verify a non-empty job list, runner assignment, instantiated/completed steps, exit code, test summary and retrievable artifact.
4. Correlate evidence to exact commit, run, job and artifact; hash the retrieved artifact and preserve raw run/job responses.
5. Keep provider live smoke tests separate; they require explicit provider account, secret, privacy and spend authorization.
6. Preserve G02 FAIL / UNVERIFIED and production PROTECTED HOLD until their independent criteria are met.

**Acceptance:** NOT MET. **Production authorization:** NOT GRANTED.
