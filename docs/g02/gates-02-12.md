# Independent Gate Acceptance Contract: G02–G12

This matrix defines what evidence is required to accept each gate. The matrix is not evidence of acceptance. All gates begin UNKNOWN/BLOCKED. Evidence must be retrieved from authoritative sources, hash-verified, correlated to the exact candidate SHA, and reviewed by an independent verifier. A status string supplied by an operator is not sufficient on its own.

| Gate | Scope | Minimum independent acceptance evidence |
|---|---|---|
| G02 | Runner dispatch and sentinel | Complete Packet A + Packet B; real runner ID > 0; exact runner name; assigned job; instantiated steps; sentinel exit 0; raw logs/artifacts retrievable; independent correlation; validator PASS |
| G03 | CI execution | Actual workflow/job records for the candidate SHA; all required checks completed successfully; raw logs retrievable; no skipped required checks |
| G04 | Certification | Versioned certification report, explicit criteria, evidence references, verifier identity, UTC timestamp, candidate SHA, and all required checks accepted |
| G05 | Release candidate | Immutable candidate manifest, source commit, dependency/build metadata, checksum(s), release notes, and acceptance review |
| G06 | Deployment authorization | Approved change record, target/environment, deployment plan, rollback plan, required approvals, and artifact-to-SHA linkage |
| G07 | Live validation | Authoritative public/target probes, expected status/body/headers, timestamped raw responses, and independent verifier results |
| G08 | Synchronization | Source/target revision inventory, config drift report, exact commit/reference mapping, and reconciled checksums |
| G09 | Activation | Explicit activation approval, scoped target, preconditions, observable activation evidence, and rollback readiness |
| G10 | Post-activation | Health checks, telemetry, error rates, user-path tests, monitoring window, and comparison to acceptance thresholds |
| G11 | Operational acceptance | Named operational owner, runbook, alerting/on-call coverage, incident/rollback procedure, and signed acceptance |
| G12 | Final acceptance | Complete G02–G11 evidence chain, independent audit, no unresolved critical findings, and separately recorded final authorization |

## Status semantics
- `ACCEPTED`: every required predicate has verifiable evidence and an independent reviewer has accepted it.
- `BLOCKED`: evidence is missing or a prerequisite is not satisfied.
- `REJECTED`: evidence conflicts, integrity fails, or a required predicate is false.
- `UNKNOWN`: not assessed. UNKNOWN never counts as accepted.

## Promotion boundary
Passing G02 does not imply G03–G12 pass. This contract does not authorize a merge, deployment, activation, DNS/Worker change, or production promotion. Each gate requires its own evidence and acceptance record.
