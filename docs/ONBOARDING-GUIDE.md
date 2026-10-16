# LingoLegacy — Git, GitHub, and Deployment Onboarding Guide

## Purpose and scope

This guide describes the repository's release boundary and the evidence required before a change can be promoted. It is an operational guide, not a certification that any gate currently passes.

## Architecture scope

- **Authoritative edge:** Cloudflare Workers / Cloudflare Pages, subject to live routing verification.
- **Assistant modules:** LINGOassist, LINGOassister, LINGOassisthem, LINGOai, and askLINGO.
- **CI/CD:** GitHub Actions, with G02 runner assignment and execution evidence required for workflows governed by that gate.
- **Release evidence:** immutable candidate commit, independently verifiable artifacts, test results, provenance, approval records, and live/rollback evidence.

## Release boundary and governance

1. **Fail closed.** No production promotion or activation while any required gate is BLOCKED, NOT_RUN, UNVERIFIED, or otherwise not accepted.
2. **Exact candidate binding.** Readiness evidence must identify the exact commit being promoted. Evidence for a PR head cannot silently substitute for evidence for a later merge commit.
3. **Supply-chain integrity.** Third-party GitHub Actions should be pinned to verified full commit SHAs. Each SHA must resolve to the intended action repository and revision; length alone is not verification.
4. **G02 remains mandatory.** A workflow run is not evidence of execution unless a real runner is assigned, steps initialize, a sentinel executes, and logs are retrievable.
5. **Trusted evidence transport.** Candidate-controlled code must not be able to mint release attestations or approve itself. The privileged verifier must come from a protected workflow revision, validate cryptographic provenance, and independently verify platform approval records.
6. **No plaintext approval authority.** A reviewer name in JSON or a checked-in PASS manifest is not proof of an authenticated approval.
7. **Deployment workflow changes require separate review.** Do not wire a structural-only verifier into staging or production mutation paths until signed provenance, approval verification, and adversarial integration tests are accepted.
8. **Preserve last-known-good.** Do not merge, promote, deploy, or activate while the applicable release gates remain blocked.

## Readiness audit status

The following is the current proposal status, not a claim that the items have passed:

| Item | Acceptance evidence required | Current disposition |
|---|---|---|
| IR-01 — Guide synchronization | This canonical guide exists and is reviewed against actual repository practices | Guide added on isolated Draft PR branch; review pending |
| IR-02 — Kubernetes / Helm scope | Explicit, reviewed scope decision plus repository inventory; do not infer absence from a partial scan | Pending independent review |
| IR-03 — Supply-chain pinning | Exhaustive workflow inventory; each external action SHA resolved to the intended action revision; exceptions documented | Pending exhaustive verification |
| IR-04 — Routing authority | Current authoritative DNS/Cloudflare configuration and independent public probes | Not certified by repository files alone |
| IR-05 — Staging reproducibility | Repeatable isolated staging build/deploy, recorded environment and artifact identities, successful probes | Pending runtime evidence |
| IR-06 — Fail-closed release boundary | Trusted detached evidence, cryptographic attestation verification, independent approval verification, adversarial tests, and proof every deployment path depends on the gate | NOT ACCEPTED |
| G02 — Runner operation | Nonzero runner ID, populated runner name, initialized steps, executed sentinel, retrievable logs, independently verified evidence | BLOCKED |

## Safe recovery sequence

1. Preserve the last-known-good release and keep promotion disabled.
2. Restore and verify G02 runner dispatch before treating workflow failures as test outcomes.
3. Execute unit and adversarial tests on the exact isolated branch head; retain raw logs, exit code, runtime version, and source SHA.
4. Complete the workflow/action inventory and verify every action pin against its canonical action repository.
5. Implement and test a protected-ref trusted verifier/attestor, separate from candidate execution.
6. Independently verify signed provenance and GitHub Environment approval records.
7. Prove all deployment-capable paths enforce the accepted gate, while retaining G02 as mandatory.
8. Obtain independent administrative review and explicit release authorization before any merge or production mutation.

## Current checkpoint

PR #308 is an isolated Draft proposal. G02 remains BLOCKED, IR-06 remains NOT ACCEPTED, production promotion remains ON HOLD, and last-known-good remains PROTECTED. This guide does not change those states or authorize deployment.
