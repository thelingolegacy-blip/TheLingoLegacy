# G02 Dispatch Evidence — 2026-10-10

## Evidence source

Repository: `thelingolegacy-blip/TheLingoLegacy`  
Pull request: #257  
Feature branch: `studio/creative-experience-upgrade-2026-10-10`  
Observed run: [Lingo Legacy Static CI — run 38076658254](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38076658254)  
Observed commit: `92eb918b73abb3700926215d774679f41f37ecf9`  
Workflow: `.github/workflows/jekyll-docker.yml`  
Event: `pull_request`  
Observed window: 2026-10-10 18:39:26–18:39:29 UTC

## Direct API observations

The GitHub Actions run and job endpoints returned:

- Run status: `completed`
- Run conclusion: `failure`
- Job status: `completed`
- Job conclusion: `failure`
- Requested runner label: `ubuntu-latest`
- `runner_id`: `0`
- `runner_name`: empty
- `runner_group_id`: `0`
- `runner_group_name`: empty
- `steps`: empty array
- Artifacts: `total_count = 0`
- Logs endpoint: empty response; connector log retrieval returned `BlobNotFound`

This is direct provider-returned evidence that this observed hosted-runner job did not expose a real assigned runner, instantiated steps, retrievable logs, or artifacts. It is not evidence that the source code itself failed during a test step, because no test step is recorded.

## Gate interpretation

- G02 — Runner dispatch: **FAIL / UNVERIFIED**
- G03 — CI execution: **BLOCKED**
- G04–G11: **BLOCKED**
- Production mutation: **FROZEN**
- Last-known-good: **PROTECTED**
- Merge/deploy/activation: **NOT AUTHORIZED**

The failure reproduces the previously recorded pre-step dispatch signature, now on a job requesting GitHub-hosted `ubuntu-latest`. Therefore changing the target job's runner labels alone is not a justified fix.

## Required provider/host escalation packet

Capture and correlate the following without changing production:
1. GitHub Actions run ID, job ID, commit SHA, event, requested labels, timestamps, returned runner fields, and log/artifact results.
2. Repository and organization Actions policies, hosted-runner availability/limits, runner groups/restrictions, and enterprise inheritance where applicable.
3. For the self-hosted target, the registered runner's exact name, ID, group, labels, online state, last check-in, and daemon/service telemetry from the actual host.
4. GitHub Support response or a successful controlled run with a nonzero runner ID, populated runner name, executed steps, retrievable logs, and independently verified artifact.

Do not publish access tokens, runner registration tokens, secrets, private host credentials, or unredacted environment dumps in this report.

## Current implementation branch

The isolated branch includes the G02 sentinel, Studio Control Center, LINGO AI sandbox prototype, Google AI Studio Build prompt, read-only sandbox validation script, and a new sandbox-guard workflow. Those files have been retrieved from GitHub for existence verification. The sandbox guard workflow has not yet produced a successful execution artifact.

## Decision

Keep the PR in draft and maintain the protected hold. A passing source review or an AI-generated diagnosis cannot replace the missing runner/job/log/artifact evidence.