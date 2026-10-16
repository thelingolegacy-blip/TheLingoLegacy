# IR-06 Isolated Detached Evidence Prototype

**Status:** Prototype implementation only; not a release gate.  
**Scope:** PR #308 isolated branch. No deployment workflow is wired to this prototype.

## What is implemented

- `.github/workflows/ir06-detached-evidence-isolated.yml` runs the readiness tests against an exact candidate SHA in a single unprivileged job.
- The job is restricted to `contents: read`, checks the canonical repository name and immutable repository ID, checks out the exact candidate SHA without persisting checkout credentials, captures test stdout/stderr/exit code and Node version, and uploads a short-lived diagnostic artifact.
- `scripts/verify-detached-evidence.mjs` checks the diagnostic bundle's expected identity fields, timestamp, test result, exact file set, and SHA-256 digests.
- `scripts/verify-detached-evidence.test.mjs` covers candidate-SHA substitution, repository-ID mismatch, workflow identity/revision substitution, nonzero test exit, stale/future evidence, tampered files, extra or missing files, unsafe digest paths, run-attempt replay, and attempted trust-status escalation.

## Non-negotiable trust boundary

This workflow deliberately does **not** issue a signed attestation, verify GitHub OIDC, retrieve Environment approval records, or authorize release. Its summary is candidate-job output and is therefore untrusted even when the structural verifier accepts it. The verifier always returns `releaseAuthorized: false`.

A future trusted consumer must, in a separate trusted job sourced from a protected workflow revision:

1. Verify the bundle's GitHub artifact attestation cryptographically (for example, `gh attestation verify`) and enforce the expected repository and signer workflow identity.
2. Validate the signed predicate's subject digest, repository ID, candidate SHA, workflow revision, run ID and attempt.
3. Retrieve Environment deployment/status records through the GitHub API and verify the configured reviewer protection policy independently. A reviewer name in JSON is not authorization.
4. Fail closed on missing permissions, absent/ambiguous approval records, API errors, stale evidence, or identity mismatch.
5. Keep all OIDC and attestation permissions out of jobs that check out or execute candidate-controlled code.

The workflow file currently lives on this Draft PR branch. It is not a protected-ref trust anchor. Its output is diagnostic only and must never be used as production evidence.

## Execution status and acceptance

The existing isolated local run for the original readiness verifier recorded 12 passing tests against source commit `0737fed883e775f8a9499526dbe8a654f3c14ce1`. That does not cover the new detached-evidence tests. The container currently cannot resolve `github.com`, and the repository's Actions runner-dispatch problem remains open; therefore the new test suite and workflow have **not** yet been empirically executed in this environment.

Acceptance remains blocked until a functioning runner executes the new suite and independent review verifies real GitHub attestation provenance and Environment approval records. Do not merge, deploy, wire this prototype into staging/production, or infer that IR-06 has passed.
