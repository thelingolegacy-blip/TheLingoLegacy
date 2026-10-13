# G02 Two-Sided Readiness Protocol

## Purpose

Prevent a G02 dispatch from being treated as ready until GitHub-side and host-side evidence agree. This protocol is fail-closed and does not authorize production promotion.

## Signals and predicates

1. **G02_READY** — fresh GitHub-side evidence and fresh host-side evidence are both present and correlated to the same runner identity and readiness window.
2. **G02_SET** — repository access, runner group, required labels (`self-hosted`, `linux`, `x64`, `lingo-g02`), listener connectivity, and acceptance of jobs are verified.
3. **G02_ACTIVATE** — GitHub's job record shows a positive runner ID and populated runner name for the qualifying job.
4. **G02_EXECUTION_PASS** — expected steps ran, sentinel returned success, logs are retrievable, and a correlated evidence artifact matches run ID, attempt, job ID, and commit SHA.
5. **G02_ACCEPTED** — an independent verifier validates the evidence and records formal acceptance.

Any missing, stale, contradictory, or uncorrelated signal means BLOCKED.

## Two-sided handshake

### GitHub side

Capture the workflow run and job records, expected labels, runner ID/name/group, job assignment, instantiated steps, conclusion, logs availability, and artifact metadata. Do not infer account-wide policy state from a connector error or unsupported endpoint.

### Host side

Run `scripts/g02-host-readiness.sh` on the existing intended runner host. It performs read-only checks for runner service/process presence, DNS resolution, and HTTPS reachability. It does not read credentials, expose runner configuration files, restart services, modify network policy, or register a runner.

The script's `host_precheck=PASS` is only a local transport/service precheck. It is **not** proof of authenticated runner polling, repository authorization, or GitHub job assignment.

## Trusted coordination requirement

A pre-dispatch coordinator must consume the host report over an authenticated, integrity-protected channel, validate its freshness and identity, and correlate it with GitHub's authoritative runner/job records. Do not store runner registration tokens, private keys, or long-lived personal access tokens in reports or repository files. Prefer an approved short-lived GitHub App credential or an established secret manager. Do not implement automatic dispatch until the coordinator can verify both sides.

## Safe recovery order

1. Collect host precheck report and checksum.
2. Independently inspect runner registration, labels, group/repository access, and Actions policy in GitHub settings.
3. Correlate the host identity with the registered runner identity.
4. Repair only the evidenced failing layer; do not create duplicate registrations or broaden network access speculatively.
5. Dispatch one controlled sentinel.
6. Require positive runner ID/name, instantiated steps, sentinel success, retrievable logs, and correlated artifact.
7. Independently verify evidence before changing G02 acceptance.

## Current limits

The repository connector cannot start or restart a host service and does not itself prove pre-dispatch runner polling. Host execution and the authenticated coordination channel must be established separately. Until then, G02 remains blocked.
