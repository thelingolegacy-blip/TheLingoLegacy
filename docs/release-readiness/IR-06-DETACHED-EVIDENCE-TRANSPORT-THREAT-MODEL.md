# IR-06 — Detached Evidence Transport and Threat Model

**Status:** Threat model documented; an unprivileged diagnostic prototype is implemented on the Draft PR branch. Cryptographic attestation and authenticated approval remain unimplemented; nothing is wired into deployment workflows.  
**Related change:** PR #308  
**Current posture:** G02 BLOCKED; IR-06 NOT ACCEPTED; production promotion ON HOLD; last-known-good PROTECTED.

## 1. Decision

Use a detached, immutable evidence bundle plus a cryptographically signed provenance attestation. Bind it to the exact candidate commit and canonical repository identity. Generate attestations only from a trusted workflow definition on a protected ref. Reviewer authorization must come from protected GitHub Environment policy and platform approval records—not plaintext JSON fields.

Do not put a PASS manifest into the candidate source commit. Do not grant OIDC, secrets, signing permissions, or write permissions to any job that executes candidate-controlled code. This proposal does not modify deployment workflows.

## 2. Proposed architecture

1. **Select immutable candidate.** A workflow definition loaded from a protected ref accepts an exact commit SHA, resolves it through GitHub API, and verifies repository ID/name plus allowed ref/PR context. Branch names and tags are traceability only, never the binding.
2. **Run tests without privilege.** Check out the exact candidate SHA and run `node --test scripts/verify-ir-readiness.test.mjs` in an isolated job. Grant read-only content access only. No secrets, `id-token: write`, deployment credentials, or attestation/write permissions. Capture stdout, stderr, exit code, Node version, test summary, workflow run ID/attempt, workflow revision SHA, and candidate SHA.
3. **Publish run-scoped evidence.** Upload logs, test results, manifest/evidence inputs, and a machine-readable run summary. Record immutable artifact ID, digest, size, run ID, creation time, and expiry. Never select an artifact by name alone or from “latest successful run.”
4. **Verify in a separate trusted job.** A separate job from the protected workflow downloads artifacts by exact run ID and artifact ID. It does not check out or execute candidate code. It verifies repository identity, workflow path/ref/revision, run attempt, exact candidate SHA, exit status, schema, freshness, path confinement, all artifact digests, required IR items, and absence of unexpected items. Missing or ambiguous evidence fails closed.
5. **Enforce human approval outside the manifest.** Gate attestation on a protected GitHub Environment (e.g. `ir-evidence-approval`) configured by an authorized administrator with required reviewers, branch/ref restrictions, and prevention of self-review where supported. Independently retrieve and validate the Environment deployment/status record and bind its environment, run, candidate SHA, and approval state to the signed predicate. A successful job does not prove the environment was configured correctly; preserve evidence of the actual environment policy.
6. **Sign detached evidence.** Use GitHub artifact attestations/Sigstore OIDC or an equivalently reviewed signing system to attest the evidence-bundle digest. The signed predicate binds canonical repository name and immutable ID, exact candidate SHA, trusted workflow path/ref/revision, run ID/attempt, test result, command/runtime, artifact IDs/digests, manifest digest, generation time, verifier/policy version, and Environment approval record reference. Grant `id-token: write` and attestation permissions only to the dedicated trusted attestor job. Pin the attestation action to a reviewed full commit SHA.
7. **Verify at consumption.** Before any mutation, independently verify signature and attestation issuer, audience, repository, trusted workflow identity/revision, candidate SHA, run ID/attempt, subject digest, predicate schema, freshness, and Environment approval record. Do not trust JSON fields, artifact names, logs alone, or a signature from an unapproved signer identity.
8. **Fail closed.** Missing API access, expired artifact, stale evidence, invalid signature, wrong SHA/identity, missing approval, unexpected workflow revision, or verifier outage means BLOCKED. No checked-in-manifest or manual-override fallback.

## 3. Exact-commit binding without a circular hash

The candidate commit exists before evidence generation. A trusted workflow receives that immutable SHA as input; the detached manifest records it, while the signed attestation binds the evidence bundle digest to that SHA. The evidence is not committed back into the candidate, so the candidate SHA does not change.

The consumer must compare the attested SHA with the exact SHA about to be promoted. Evidence for a PR head must not be reused for a later merge commit; if the release candidate is a merge commit, evidence must be generated or validated for that exact final commit.

## 4. Trust boundaries

- **Candidate checkout and test process:** untrusted. May modify scripts, tests, package hooks, and workflow files.
- **Trusted workflow controller:** workflow source must come from a protected ref, not a candidate-modified workflow.
- **Test job:** isolated and unprivileged; no secrets or OIDC/signing capability.
- **Attestor/verifier job:** trusted code only, separate job, no candidate code execution, minimal permissions.
- **Reviewer:** authenticated by GitHub Environment policy and platform records, never by a manifest string.
- **Release gate:** independently checks cryptographic provenance and platform approval before every mutation path.
- **GitHub control plane:** OIDC claims and Environment records are external trust dependencies; validate them explicitly and retain their evidence.

Do not use `pull_request_target` to check out and execute untrusted candidate code with elevated permissions. A workflow triggered from an untrusted PR must not be able to alter the privileged workflow definition or obtain its OIDC token. Prefer a trusted workflow dispatched from a protected ref with an exact candidate SHA input, and keep the candidate-executing job unprivileged.

## 5. Threat model

| Threat | Mitigation | Required result |
|---|---|---|
| Candidate modifies workflow to obtain OIDC/signing authority | Protected workflow revision; no OIDC or write permissions in candidate-executing job | Reject/deny attestation |
| Candidate fabricates PASS JSON | Trusted verifier in separate job validates actual process status and evidence; JSON is data only | BLOCK |
| Evidence for commit A replayed for B | Signed predicate binds repo ID and exact SHA; compare with promotion SHA | BLOCK |
| Artifact name or branch pointer replaced | Fetch by exact run/artifact IDs and verify digest/attestation subject | BLOCK |
| Plaintext reviewer name forged | Protected Environment approval and independently queried platform record | BLOCK |
| Fork/unauthorized repository requests signing | Allowlist immutable repo ID/name, workflow path/ref, issuer/audience and run context | BLOCK |
| Workflow/action supply-chain compromise | Full-SHA action pins, minimal permissions, protected workflow revision, allowlist and provenance checks | BLOCK pending investigation |
| Old evidence replayed | Freshness/expiry policy; bind run attempt and candidate SHA | BLOCK |
| Path traversal or symlink escape | Confined paths, safe archive extraction, digest validation, reject links escaping evidence root | BLOCK |
| GitHub API or attestation service unavailable | No success fallback; retain diagnostics | BLOCK |
| Self-review or compromised reviewer | Required reviewers, self-review prevention where supported, least privilege and audit review; production may require a second person | BLOCK/escalate |
| Misleading logs/test output | Logs are diagnostic, not sole proof; validate trusted workflow metadata and independently computed artifact digests | BLOCK if proof incomplete |

## 6. Minimum signed predicate fields

- Versioned schema and predicate type.
- Canonical repository name and immutable repository ID.
- Exact candidate SHA and candidate ref/PR context for traceability.
- Trusted workflow path, protected ref, workflow revision SHA, run ID and run attempt.
- Test command, runtime, job conclusion, exit code and result summary.
- Evidence bundle digest, manifest digest, artifact IDs/digests/sizes.
- Generation time and expiry/freshness policy.
- Protected Environment name and deployment/status record ID; approval decision/identity sourced from platform API.
- Verifier revision and policy version.

Never place tokens, credentials, private keys, or secrets in manifests, predicates, logs, or artifacts. A digest proves byte integrity relative to that digest; it does not prove that evidence is truthful. Cryptographic provenance and independent policy enforcement are both required.

## 7. Permissions and controls

- Default to `contents: read`; grant `id-token: write` and attestation write permissions only to the isolated attestor job.
- No secrets, deployment credentials, write tokens, or OIDC tokens in jobs executing candidate code.
- Pin third-party actions to reviewed full commit SHAs and minimize workflow/job permissions.
- Validate immutable repository ID as well as repository name; allow only approved refs and trusted workflow identity.
- Configure Environment protection outside this PR and preserve evidence of reviewer policy and approval records.
- Restrict artifact access/retention and signing identities. Repository write access alone is not authority to certify release evidence.
- The manifest is data, never policy authority; the verifier and release gate independently enforce provenance and approval.

## 8. Acceptance tests before workflow wiring

- Correct attestation for exact SHA succeeds; the same bundle bound to another SHA fails.
- Wrong repository ID/name, workflow path/ref/revision, issuer, audience, run ID, or attempt fails.
- Missing, malformed, expired, or digest-mismatched artifact fails.
- Same-named artifact from another run fails.
- Missing/denied approval, wrong Environment, approval for another SHA, or prohibited self-approval fails.
- Candidate-modified workflow cannot obtain attestation permissions or sign artifacts.
- Missing GitHub API access, expired artifact, or verifier outage fails closed.
- Checked-in template and plaintext reviewer metadata never satisfy the production gate.
- Every staging/production mutation path is proven to depend on successful provenance and approval checks, while G02 remains mandatory.

## 9. Rollout gates

1. Review and approve this threat model.
2. Verify repository/org permissions, allowed actions, and Environment protection using an authorized administrator.
3. **Partially complete:** an isolated, unprivileged diagnostic workflow and structural bundle verifier now exist on the PR branch. They do not mint attestations, verify OIDC, authenticate reviewer approval, or authorize releases.
4. Run the new positive/negative test suite on a functioning runner and preserve logs and run metadata. Current Actions runner-dispatch failures prevent this acceptance step.
5. Implement and threat-review a trusted-ref attestor/verifier that checks GitHub's signed attestation and independently fetches Environment approval records; keep privileged permissions out of candidate-executing jobs.
6. Run positive/negative integration tests for signatures, issuer/audience, repository ID, workflow identity/revision, exact SHA, run ID/attempt, artifact digest, Environment approval, self-review, replay, stale evidence, and API failure.
7. Only after G02 is repaired and acceptance evidence independently verified may a separate change propose wiring the gate into every deployment-capable workflow.
8. Keep PR #308 Draft; do not merge or deploy until separately authorized.

## 10. Current disposition

The isolated diagnostic workflow and structural verifier are implemented, but the new suite has not yet been empirically executed. No deployment workflow or Environment policy changed; no attestation generated; no deployment triggered. The prototype is not a trust anchor and its verifier always returns releaseAuthorized=false. G02 remains BLOCKED; IR-06 remains NOT ACCEPTED; production promotion remains ON HOLD; last-known-good remains PROTECTED.
