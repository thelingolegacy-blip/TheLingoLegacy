# IR-06 Trusted Attestation and Approval Verification — Implementation Plan

**Status:** Design contract only; not implemented, not empirically validated, and not authorized for production use.  
**Branch:** `audit/ir06-fail-closed-contract-2026-10-16`  
**Release posture:** G02 BLOCKED; IR-06 NOT ACCEPTED; production promotion ON HOLD; last-known-good PROTECTED.

## 1. Security objective

Prove that a particular evidence bundle was produced by the approved workflow execution for the exact candidate commit, that the bundle has not changed, and that a distinct authorized reviewer approved the exact candidate for the required Environment. A successful structural JSON check alone is insufficient.

The gate must return a positive authorization result only if every required predicate below is independently established. Any missing field, unavailable API, unverifiable signature, stale or replayed evidence, unexpected workflow revision, missing approval, or policy ambiguity returns nonzero and blocks release.

## 2. Trust zones

### Zone A — Candidate execution (untrusted)

- Checks out the exact candidate SHA and runs tests against it.
- Has only the minimum read permissions needed to obtain source.
- Has no secrets, deployment credentials, Environment approval, signing permission, or `id-token: write`.
- Must not have access to a privileged attestor token.
- Produces raw test logs, exit status, runtime metadata, and a manifest containing file hashes.
- Its self-reported repository/workflow metadata is diagnostic until authenticated by the platform.

A candidate-controlled script or workflow is never permitted to mint the attestation used to authorize that same candidate.

### Zone B — Trusted attestation issuer (separate job/workflow)

- Workflow definition must come from a protected, reviewed ref; the candidate cannot modify the issuer's executing workflow.
- Does not check out or execute candidate-controlled code.
- Receives only the minimum required GitHub OIDC and attestation permissions.
- Validates the exact run identity and artifact identity before signing.
- Attests to the digest of the immutable evidence bundle and includes the candidate SHA and execution identifiers in a reviewed predicate.
- Never deploys or activates production.

Prefer GitHub Artifact Attestations with Sigstore-backed verification, using the official supported workflow and verification interfaces. Before implementation, confirm the repository's plan/organization support, policy settings, required permissions, action revisions, and verifier version with an authorized administrator. If the feature is unavailable, stop and select a separately reviewed equivalent; do not silently downgrade to an unsigned manifest.

### Zone C — Trusted release verifier (separate protected workflow)

- Uses verifier code from the protected workflow revision, not from the candidate commit.
- Does not run candidate build scripts or source code.
- Downloads an artifact by exact repository, workflow run ID, run attempt, and artifact ID; artifact name alone is not identity.
- Verifies the signed attestation cryptographically and checks signer/workflow identity, issuer, audience, repository name and immutable repository ID.
- Checks the signed subject digest against the downloaded bytes and verifies the predicate's candidate SHA, workflow path, workflow ref/revision, run ID, and run attempt.
- Independently fetches GitHub platform deployment/Environment records and verifies the approval applies to the exact candidate and required Environment.
- Emits an auditable allow/deny decision. Only the protected downstream release workflow may consume this decision.

The verifier must not accept a candidate-supplied boolean such as `releaseAuthorized: true`, a plaintext reviewer name, or a checked-in `PASS` manifest as authorization.

## 3. Required identity tuple

The signed predicate and independently queried platform records must correlate at minimum:

- Canonical repository: `thelingolegacy-blip/TheLingoLegacy`
- Immutable repository ID: `1279436411`
- Exact candidate commit SHA (40 lowercase hexadecimal characters)
- Workflow path and immutable workflow revision SHA
- Workflow run ID and run attempt
- Artifact ID and digest; artifact name is supplemental only
- Test suite identifier, test command, runtime/toolchain versions, exit code, and raw-log digests
- Evidence schema version and creation time
- Required IR evidence references and their digests
- Required Environment name and independently retrieved deployment/approval record IDs
- Authorized reviewer identity as reported by GitHub's platform records, with self-approval restrictions applied where supported

A PR-head attestation cannot substitute for evidence bound to a later merge commit. If the release candidate SHA changes, all required evidence and approval must be regenerated or revalidated for the new SHA.

## 4. Approval verification

Configure the required GitHub Environment through an authorized administrator with reviewer restrictions, branch/ref restrictions, and prevention of self-review where the platform supports it. Treat configuration as unverified until its live settings are inspected.

The verifier must query authoritative GitHub deployment/status and Environment review records and establish:

1. The deployment refers to the expected repository and required Environment.
2. The deployment SHA equals the exact candidate SHA.
3. The reviewer approval record belongs to that deployment and required Environment.
4. The reviewer is authorized under the current policy and is not the prohibited self-approver.
5. The approval was recorded before the release authorization decision and has not been superseded or invalidated.
6. API response pagination is complete and the API response is authenticated; missing scopes, partial responses, or errors deny authorization.

Do not infer approval from the presence of an Environment in YAML or from user-authored JSON.

## 5. Proposed decision predicate

Release authorization may be considered only when all terms are true:

```text
ALLOW =
  exact_candidate_sha
  AND trusted_protected_workflow_identity
  AND exact_run_and_attempt
  AND exact_artifact_id_and_digest
  AND valid_signature_and_expected_issuer
  AND expected_repository_identity
  AND expected_workflow_path_and_revision
  AND test_exit_code_zero
  AND complete_required_evidence
  AND fresh_evidence
  AND authenticated_environment_approval
  AND authorized_reviewer
  AND no_prohibited_self_review
  AND G02_independently_accepted
  AND all_other_release_gates_accepted
```

This is a policy specification, not executable implementation. The G02 term must be supported by independently verifiable runner assignment, initialized steps, executed sentinel, retrievable logs, and accepted evidence. A signed attestation cannot itself make G02 pass.

## 6. Required negative tests

The implementation is not accepted until real integration tests demonstrate rejection of:

- altered bundle bytes or mismatched subject digest;
- invalid signature, unknown issuer, wrong audience, or wrong signer workflow;
- wrong repository name or immutable repository ID;
- candidate SHA substitution or merge-commit substitution;
- workflow path, ref, or revision mismatch;
- wrong run ID, attempt, artifact ID, or replayed prior-run evidence;
- nonzero test exit, missing logs, incomplete evidence, stale or future-dated evidence;
- missing, unauthorized, wrong-Environment, superseded, or self-approval;
- partial/paginated API response, revoked token, denied permission, rate limit, or API outage;
- a candidate-modified workflow attempting to acquire signing privileges;
- a release workflow that can deploy without consuming a successful trusted decision;
- missing G02 evidence or any other required gate not in accepted state.

Every negative case must deny release and produce an inspectable reason without leaking credentials.

## 7. Repository-wide enforcement proof

Before any production workflow wiring is proposed:

1. Enumerate every workflow file and every deployment-capable job in the exact candidate commit.
2. Identify all production mutation paths, including direct Wrangler deployment, promotion, auto-repair, manual activation, API-triggered deployment, and reusable workflows.
3. Demonstrate that each path is unreachable without the trusted verifier's successful decision and independent G02 acceptance.
4. Test direct/manual workflow invocation, altered inputs, reruns, stale artifacts, and failure of the verifier service.
5. Keep privileged attestation permissions confined to the trusted issuer and keep deployment credentials confined to the separately approved deployment boundary.
6. Have an independent reviewer inspect the workflow graph, permission model, branch/Environment policy, test results, and logs.

## 8. Implementation sequence

1. Restore G02 and collect independently retrievable execution evidence.
2. Execute the current readiness and detached-evidence test suites against the exact branch head and preserve raw logs, exit codes, runtime versions, and source identities.
3. Confirm Artifact Attestations support and Environment review API access with an authorized repository/organization administrator.
4. Implement the trusted issuer and verifier in a separate isolated change, using official supported interfaces and verified immutable action revisions.
5. Add positive and adversarial integration tests without enabling deployment.
6. Verify every deployment-capable path is fail-closed under the new gate.
7. Obtain independent security and administrative acceptance.
8. Only then submit a separate proposal to wire the accepted gate into deployment workflows.

## 9. Current checkpoint

This document records the intended architecture only. No signed attestation has been generated, no Environment setting has been changed, no production workflow has been wired to this plan, and no deployment has been triggered. The current combined test suite is not empirically certified because recent workflow runs exposed no initialized steps or retrievable logs.

**G02: BLOCKED · IR-06: NOT ACCEPTED · PRODUCTION PROMOTION: ON HOLD · LAST-KNOWN-GOOD: PROTECTED**
