# Evidence Ledger & Independent Acceptance Standard

## Evidence record

Each evidence item must include:

- Evidence ID, type, title and concise claim it supports.
- Source provider, repository/project and exact source URL or immutable ID.
- Commit SHA and branch/ref where relevant.
- Workflow run ID, job ID, step/test name and conclusion where relevant.
- Artifact name, immutable digest/checksum, size and retention location.
- Environment, region, build/toolchain versions and dependency lock state.
- Started/completed/observed timestamps in UTC.
- Actor/service identity and authorization/change reference.
- Reviewer, review time, decision and comments.
- Data classification, redaction status and retention class.

## Evidence types

Source review; architecture decision; configuration inspection; static analysis; build log; unit/integration/contract/E2E test; browser/device capture; security scan; SBOM; provenance attestation; deployment record; runtime health check; backup/restore proof; rollback rehearsal; accessibility/performance result; approval; acceptance record; incident timeline; training completion.

## Evidence quality

- **E0 — Assertion:** statement without supporting artifact. Not sufficient.
- **E1 — Static:** source/configuration inspected; proves only static properties.
- **E2 — Executed:** command/test ran and produced logs/result.
- **E3 — Correlated:** execution tied to commit, environment, run/job and immutable artifact.
- **E4 — Independently reviewed:** reviewer confirms scope, method, result and provenance.
- **E5 — Operationally accepted:** product/operations owner accepts with release decision and rollback evidence.

Do not describe E0/E1 as execution success. A workflow with zero jobs is not E2. Screenshots alone do not replace machine-readable logs or artifacts.

## Result semantics

PASS, FAIL, BLOCKED, NOT_RUN, UNVERIFIED, STALE, PARTIAL, HELD, ACCEPTED, REJECTED. Include reason and freshness. Missing provider access is BLOCKED or UNVERIFIED, never PASS.

## Independent verification

The verifier must be independent of the execution for critical changes. Verify:
1. Correct requirement and test scope.
2. Trusted source and artifact provenance.
3. Correct environment and version.
4. Reproducible command and complete logs.
5. Expected and negative-path behavior.
6. No unapproved side effects.
7. Security, privacy and data boundaries.
8. Recovery and rollback readiness.
9. Residual risks and approved exceptions.
10. Evidence retention and traceability.

## Acceptance record

`acceptance_id, deliverable_id, criteria_version, evidence_ids[], reviewer_id, owner_id, decision, residual_risks[], exceptions[], environment, accepted_at_utc, expiry_or_revalidation_date`

Acceptance is explicit. Merge, successful build, deployment or a green dashboard is not itself acceptance.

## Retention and integrity

- Store authoritative evidence in access-controlled, durable storage.
- Use immutable artifact digests and tamper-evident audit trails.
- Apply retention schedule by data class and legal obligation.
- Redact personal data and secrets before indexing or exporting.
- Keep source links and metadata when binary artifacts expire; mark evidence expired.
- Do not store sensitive evidence in public repositories or browser local storage.
