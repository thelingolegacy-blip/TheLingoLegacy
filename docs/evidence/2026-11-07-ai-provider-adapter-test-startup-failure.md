# AI Provider Adapter Test Workflow — Execution Evidence

**Date:** 2026-11-07  
**Repository:** thelingolegacy-blip/TheLingoLegacy  
**Pull request:** #500  
**Commit:** `a6adff3038cbf2aa23a1dc43aef84592af9920a2`  
**Workflow:** LLG AI Provider Adapter Tests  
**Run ID:** `42407155959`  
**Run URL:** https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/42407155959  
**Trigger:** pull_request  
**Disposition:** STARTUP_FAILURE — test process did not execute.

## Observed GitHub Actions state

- Workflow run status: completed.
- Workflow conclusion: `startup_failure`.
- Run attempt: 1.
- Jobs returned by the GitHub Actions jobs endpoint: 0.
- Artifacts returned by the run artifacts endpoint: 0.
- No runner-assigned job, step execution, test log, or uploaded artifact is available for this run.

## Interpretation

This is an Actions orchestration/startup failure, not a provider-adapter test failure and not a passing test. Since no job was instantiated, no assertion in `src/ai/provider-adapters.test.mjs` is known to have executed. No test result is inferred.

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

## Required recovery

1. Restore GitHub Actions job startup/hosted runner availability.
2. Re-run the workflow on the exact current PR head.
3. Verify runner assignment, instantiated/completed steps, exit code, test summary and retrievable artifact.
4. Correlate evidence to exact commit, run, job and artifact.
5. Keep provider live smoke tests separate; they require explicit provider account, secret and spend authorization.
6. Preserve G02 FAIL / UNVERIFIED and production PROTECTED HOLD until their independent criteria are met.

**Acceptance:** NOT MET. **Production authorization:** NOT GRANTED.