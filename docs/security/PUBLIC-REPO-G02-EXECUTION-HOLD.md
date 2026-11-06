# Public repository G02 execution hold

**Disposition: SECURITY DISABLED — G02 remains FAIL / UNVERIFIED.**

The canonical GitHub runner `lingo-legacy-g02` is a privileged, persistent host. This repository is public and contains workflows that can be invoked by repository events or manual dispatch. A public workflow must not execute checkout-controlled code on that host until the trust boundary is independently established.

## Current control

The G02 job in each public-repository workflow is hard-disabled with `if: ${{ false }}`. Canonical runner labels are intentionally preserved so the contract is not weakened or replaced with a GitHub-hosted runner.

This is a security containment measure. It does **not** repair runner registration, prove the host is online, or satisfy G02.

## Re-enable prerequisites

1. Establish a private control-plane repository with restricted membership and protected immutable workflow revisions.
2. Ensure only trusted, reviewed code and approved events can reach the persistent runner.
3. Isolate the runner service account, workspace, caches, Docker access, network egress, and host credentials from untrusted jobs and unrelated workloads.
4. Keep production secrets out of build/test jobs; use narrowly scoped, short-lived credentials only where required.
5. Verify runner name `lingo-legacy-g02`, labels `self-hosted, linux, x64, lingo-g02`, and a positive runner ID without registering duplicates.
6. Execute one authorized sentinel from the private control plane and retain the run, job, step, log, artifact, commit, and host evidence.
7. Have an independent verifier correlate and accept the evidence before re-enabling any public workflow or downstream release gate.

## Release boundary

A queued job, online/idle runner status, workflow dispatch, successful hosted smoke test, or Vercel status is not G02 acceptance. Production remains protected until the complete release evidence chain and rollback checks pass.
