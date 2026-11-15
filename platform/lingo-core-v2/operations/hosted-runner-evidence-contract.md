# Hosted Runner Evidence Contract

**Status:** Draft implementation contract  
**Scope:** GitHub-hosted Linux runner availability probe  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`  
**Related controls:** CORE V2 issues #575 and #597; implementation PR #596

## Purpose

The isolated hosted-runner probe answers one narrow question: can GitHub instantiate and execute a non-deploying `ubuntu-latest` job for this repository?

It does not test application code, certify CORE V2, qualify G02, or authorize production release.

## Execution boundary

- Trigger: manual `workflow_dispatch` only.
- Runner: `ubuntu-latest`.
- Permissions: `contents: none`, job-scoped `actions: read`.
- No checkout, repository writes, deployment permissions, production secrets, self-hosted runner, or cloud mutation.
- Artifact upload uses an immutable action commit reference.
- Evidence retention: 14 days.
- Concurrency group prevents overlapping probe runs.

## Evidence package

The workflow produces:

| File | Purpose |
|---|---|
| `execution-identity.txt` | Repository, workflow, run, attempt, commit, event and runner environment |
| `host-facts.txt` | Minimal OS/kernel/tool availability facts |
| `execution-result.txt` | Explicit successful execution marker |
| `provider-job-record.json` | GitHub API-observed job ID, runner ID/name/group, labels, steps and log availability |
| `manifest.json` | Correlation envelope and scope statement |
| `SHA256SUMS` | SHA-256 integrity hashes for evidence files |

## Acceptance rules

A hosted-runner probe is eligible for PASS only when all of the following are retrievable and correlated:

1. Workflow run ID and attempt.
2. Exact source commit SHA and repository.
3. A completed job with a positive job ID.
4. A positive provider-reported runner ID and non-empty runner name.
5. Provider-observed instantiated steps and successful job conclusion.
6. Retrievable job logs.
7. A retrievable evidence artifact with manifest and checksum file.
8. Checksum verification succeeds.

A run that fails before job creation, has no jobs, has no runner identity, has no steps, or has no artifact is BLOCKED/UNVERIFIED—not PASS and not an application test failure.

The probe's `runner_id` is GitHub-hosted infrastructure evidence only. It must never be represented as the dedicated G02 runner identity.

## Follow-on sequence

1. Run the manual probe only after the repository/org owner confirms GitHub Actions policy, hosted Linux availability, quota/billing and concurrency.
2. Retrieve run, job, attempt, logs and artifact through GitHub.
3. Verify the artifact checksums and compare all run/commit identifiers.
4. Only after the hosted smoke passes, run the existing CORE V2 API workflow and inspect its PostgreSQL-backed test results.
5. Preserve G02 quarantine and production HOLD until their separate acceptance gates pass.

## Operational diagnosis

When a workflow reports `startup_failure` and the provider returns zero jobs, inspect account/org-level Actions policy, hosted-runner entitlement/capacity, quota/billing, concurrency and provider restrictions. Repository YAML changes alone cannot repair an account-level denial or provider outage.

The available repository connector may not expose organization Actions administration or billing/quota endpoints. If those checks are unavailable, record the exact limitation and escalate to the GitHub organization/account owner rather than guessing or repeatedly retrying.

## Safety

No automatic retries, runner registration, secrets/variables changes, G02 activation, paid provisioning, PR merge, production deployment, DNS/Cloudflare mutation, or release authorization is included in this contract.
