# G02 Infrastructure Bridge — Recovery Target

## Purpose
The bridge is a separate, manually dispatchable diagnostic target for the G02 execution blocker. It tests two paths independently:
1. `g02-hosted-control-plane-probe` — whether a GitHub-hosted runner can start steps and reach the GitHub Actions jobs API.
2. `g02-self-hosted-sentinel` — whether the dedicated Linux x64 self-hosted runner can start steps, report the required identity, and produce correlated evidence.

A successful hosted probe is diagnostic only. It does not satisfy or substitute for the G02 self-hosted acceptance gate.

## Target
Workflow: `.github/workflows/g02-infrastructure-bridge.yml`
Branch: `ops/g02-infrastructure-bridge-2026-10-10`
Dispatch URL: https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/workflows/g02-infrastructure-bridge.yml

The workflow runs on `workflow_dispatch` and on pushes to this isolated branch. It does not deploy, modify DNS, change Cloudflare Workers, merge pull requests, or mutate production.

## Evidence artifacts
- `g02-bridge-hosted-<run_id>`: hosted runner identity, API response, run/commit context.
- `g02-bridge-self-hosted-<run_id>`: self-hosted runner identity, API job record, host diagnostics, manifest, and checksums.

Artifacts are evidence captures, not self-accepting certification. Review run ID, attempt, job ID, full commit SHA, runner ID/name/OS/architecture/environment, final job state, logs, and artifact contents independently.

## Interpreting outcomes
- Both jobs queued with no steps: execution dispatch/platform policy remains the first blocker; inspect repository/account Actions policy and open a GitHub Support case with the run and job IDs.
- Hosted probe runs, self-hosted job queued: hosted path works; investigate self-hosted daemon, matching labels, registration, and repository runner access.
- Self-hosted job starts but identity gate fails: runner is executing, but the wrong identity/runtime is assigned; do not accept G02.
- Both execute: inspect real logs and downloadable artifacts, verify SHA256 checksums and run/job/commit correlation, then obtain independent acceptance.

## Safety and release gates
- Never put registration tokens, PATs, or secrets in the repository or artifact.
- Do not execute untrusted pull-request code on a privileged persistent runner.
- This bridge does not change the existing mutation freeze or Last Known Good protection.
- G02 remains blocked until the complete evidence predicate passes and is independently accepted.
- No merge, deployment, DNS change, Worker mutation, activation, or production promotion is authorized by this diagnostic workflow.