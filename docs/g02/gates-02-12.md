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

## Machine-enforced evidence-type minimums
The gate evaluator requires at least one separately hashed evidence file for each listed type. One artifact may support multiple gates, but a gate cannot reuse the same path/hash twice to satisfy multiple requirements. A synthetic fixture can test validator behavior only; it is never production evidence.

- **G02:** `host_telemetry`, `sentinel_execution`, `raw_logs`, `artifact_manifest`, `correlation_report`, `validator_report`
- **G03:** `workflow_job`, `workflow_logs`, `required_checks_report`
- **G04:** `certification_report`, `criteria_matrix`
- **G05:** `release_manifest`, `build_metadata`, `release_notes`, `acceptance_review`
- **G06:** `change_approval`, `deployment_plan`, `rollback_plan`, `artifact_sha_linkage`
- **G07:** `live_probe_response`, `expected_status_headers`, `independent_probe_review`
- **G08:** `revision_inventory`, `configuration_drift_report`, `checksum_reconciliation`
- **G09:** `activation_approval`, `activation_record`, `rollback_readiness`
- **G10:** `health_checks`, `telemetry_window`, `user_path_tests`, `threshold_comparison`
- **G11:** `operations_owner_acceptance`, `runbook`, `alerting_oncall_coverage`, `incident_rollback_procedure`
- **G12:** `gates_02_11_chain`, `independent_audit`, `final_authorization`

These type labels are schema checks, not proof that an artifact actually contains the named evidence. Independent reviewers must inspect source authority, content, scope, candidate SHA, timestamps, and integrity before accepting a gate. The evaluator also enforces chronology: evidence verification time must not be later than packet generation, and independent review must not predate packet generation.

## Status semantics
- `ACCEPTED`: every required predicate has verifiable evidence and an independent reviewer has accepted it.
- `BLOCKED`: evidence is missing or a prerequisite is not satisfied.
- `REJECTED`: evidence conflicts, integrity fails, or a required predicate is false.
- `UNKNOWN`: not assessed. UNKNOWN never counts as accepted.

## Promotion boundary
Passing G02 does not imply G03–G12 pass. This contract does not authorize a merge, deployment, activation, DNS/Worker change, or production promotion. Each gate requires its own evidence and acceptance record.
