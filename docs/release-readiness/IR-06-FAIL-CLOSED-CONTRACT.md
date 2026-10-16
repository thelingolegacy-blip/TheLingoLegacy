# IR-06 — Fail-Closed Release Readiness Contract

**Status:** Draft proposal; not yet wired into deployment workflows.  
**Baseline audited:** `ff2bf400d1a649db26d5ba628ec2fb5bcfcba26c`  
**Operational policy:** G02 blocked; production promotion held; last-known-good protected.

## Purpose

Define a deterministic contract for validating IR-01 through IR-06 before any release authorization. This change intentionally does not activate deployment, change production configuration, or declare any audit item passed.

## Required manifest

The manifest schema is `1.0` and must contain:

- `source.repository` and the exact 40-character `source.commitSha` being evaluated;
- a strict ISO-8601 UTC `generatedAt` timestamp (`YYYY-MM-DDTHH:mm:ss[.sss]Z`) no more than 24 hours old;
- all six required IDs: IR-01, IR-02, IR-03, IR-04, IR-05, IR-06;
- `status: PASS` for every item;
- reviewer-acceptance metadata and a recent strict ISO-8601 UTC `reviewerAcceptance.acceptedAt` for every item; this JSON field is descriptive metadata, not proof of reviewer identity or authorization;
- at least one evidence artifact per item, with a relative path and SHA-256 digest;
- evidence artifacts whose bytes match their recorded digests.

Missing, malformed, stale, future-dated, mismatched-commit, non-PASS, unreviewed, missing-artifact, hash-mismatched, or unexpected audit items cause a nonzero exit. The verifier does not convert missing information into a pass.

## Timestamp and reviewer trust boundaries

The verifier accepts only UTC timestamps in the form `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss.sssZ` (fractional seconds may contain one to three digits). It rejects date-only strings, locale-dependent formats, timezone offsets, invalid calendar dates, and timestamps outside the freshness/future-skew policy.

A plaintext `reviewer` value in `ir-evidence.json` must never be treated as authenticated identity or approval. Reviewer authorization must be established independently at the workflow/platform layer—for example, by required GitHub Environment reviewers and protected environment rules, with the workflow verifying the environment and run context. Where OIDC is used for evidence retrieval or signing, validate issuer, audience, repository identity, workflow identity, ref/commit SHA, and other required claims; the presence of an OIDC token alone is not approval. A signed attestation may additionally bind the evidence digest and candidate commit to an authorized workflow identity. Fail closed if any required identity, approval, provenance, or digest check is absent.

## Static verifier

Run:

```sh
node --test scripts/verify-ir-readiness.test.mjs
node scripts/verify-ir-readiness.mjs release/readiness/ir-evidence.template.json <exact-commit-sha>
```

The template is intentionally invalid for release authorization and must return `IR_READINESS=BLOCKED`.

## Critical integration constraint

The verifier is a policy primitive, not yet an enforced deployment boundary. A manifest committed into the same source commit cannot truthfully attest to that commit's own final SHA because changing the manifest changes the commit SHA. Therefore the deployment workflows must not simply read a checked-in PASS manifest.

Before wiring this verifier into deployment jobs, implement a trusted evidence transport that supplies a separately generated attestation for the exact candidate commit (for example, a protected, access-controlled CI artifact or signed attestation), verifies its provenance, and makes the artifact available to both deployment workflows. The retrieval identity, run ID, source SHA, artifact digest, reviewer acceptance, and retention window must be validated. If the artifact cannot be retrieved or verified, deployment must stop.

## G02 and production boundary

The existing `lingo-g02` runner gate remains mandatory. This contract does not replace the runner assignment predicate, real step execution, retrievable logs, artifact verification, or independent G02 acceptance. No merge, staging execution, production deployment, activation, or last-known-good change is authorized by this draft.

## Acceptance checklist

- [ ] Static tests pass on a real runner.
- [ ] Negative cases prove missing, stale, malformed/non-UTC, impossible-calendar, future-dated, mismatched, non-PASS, unreviewed, missing-artifact, path-escape, and digest-mismatched evidence blocks.
- [ ] Trusted evidence transport is implemented and threat-reviewed, including authenticated workflow provenance and independently enforced reviewer authorization.
- [ ] Both deployment workflows require the verifier after G02 and before any mutation.
- [ ] Every staging and production mutation path is included in the workflow dependency graph.
- [ ] Environment protection and branch governance are independently verified.
- [ ] G02 is certified using real assignment, steps, logs, artifact, and independent review.
