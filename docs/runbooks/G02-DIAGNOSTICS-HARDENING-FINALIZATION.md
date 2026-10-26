# G02 Diagnostics Hardening — Finalization Runbook

## Authority and release boundary

This change is a diagnostic hardening package. It does not grant itself authorization to unlock G02, change GitHub organization policy, register/relabel/restart runners, modify secrets, alter DNS, deploy production, or change release gates.

Canonical protected state until independently accepted:

- G02: **BLOCKED**
- Production: **HOLD**
- Fail-closed: **ACTIVE**
- Last-known-good: **PROTECTED**

## Parallel workstreams

| Workstream | Scope | Exit evidence |
|---|---|---|
| A — Diagnostic correctness | Run/attempt/SHA identity, job assignment, named sentinel step, log endpoint, artifact metadata | Regression tests pass; unavailable data remains unknown/fail-closed |
| B — Workflow validation | YAML parse, static policy validation, unit tests | Hosted job reaches steps and all checks return success |
| C — Security | Least-privilege token, opt-in target probe, no checkout or repository scripts on target runner, no secrets in artifacts | Reviewed workflow diff and effective permission checks |
| D — Runner dispatch | Actions policy, runner group access, runner service polling, labels and capacity | Real target job assigned to runner ID > 0 with expected name |
| E — Evidence acceptance | Exact run/attempt/SHA, step result, retrievable logs, artifact bytes and embedded manifest | Independent reviewer records a correlated evidence decision |
| F — Release governance | Remaining G00–G11, Firebase, accessibility, production-domain and deployment gates | Separate, explicit production authorization after all applicable gates pass |

Workstreams A–C can proceed in parallel as code review and static validation. Workstream D requires authorized GitHub/host administration. Workstream E depends on an actual execution. Workstream F must not begin production promotion before the prior gates pass.

## Permission and approval matrix

| Operation | Minimum access / approval | Current handling |
|---|---|---|
| Read run/job/artifact metadata | GitHub Actions read scope | Used by read-only collector |
| Read runner inventory | Appropriate repository/org runner read scope | Report unknown when denied; do not infer zero runners |
| Commit diagnostic code | Repository contents write | Changes isolated on the hardening branch |
| Execute hosted static checks | GitHub Actions execution permission and a functioning hosted runner | Workflow configured; execution not yet evidenced |
| Probe self-hosted runner | Explicit operator dispatch with probe enabled, reviewed workflow, matching runner labels | Opt-in and disabled by default |
| Install/re-register/relabel/restart runner | Explicit owner/admin approval and host access | Not performed |
| Change organization Actions policy or runner-group access | Organization administrator approval | Not performed; must be verified by authorized administrator |
| Change credentials, secrets, or service tokens | Explicit secret owner approval and least-privilege review | Not performed |
| DNS, deployment, gate unlock, production data mutation | Separate release authorization with independent acceptance | Prohibited by this change |

Repository-level write/admin permission does not by itself prove organization-level runner access, host control, or branch-protection configuration.

## G02 acceptance predicate

All conditions must refer to the same repository, run ID, run attempt, and commit SHA:

1. The workflow run record is readable.
2. The target job is present and assigned to a runner with a positive runner ID and populated runner name.
3. The expected named sentinel step is instantiated and completes successfully; the containing job also completes successfully.
4. Job logs are retrievable for independent review.
5. A non-expired target artifact exists for the same run and attempt.
6. Artifact bytes are downloaded and inspected independently; the embedded run ID, attempt, SHA, runner identity, and schema are compared to GitHub run/job records. A matching artifact name alone is insufficient.
7. Artifact integrity is checked and the evidence is retained with provenance. A digest proves byte integrity, not the truth of the claims inside.
8. An authorized reviewer records G02 acceptance separately from production release authorization.

## Current implementation limitations

- The diagnostic collector tests whether the log endpoint is retrievable; it does not independently parse the log body for the sentinel output.
- The collector intentionally marks artifact-content/SHA verification as not performed. The separate reviewer must inspect the downloaded artifact.
- Historical-run SHA comparison requires an explicit expected SHA; the collector must not compare a run SHA to itself and label it independent verification.
- The regression suite and workflow YAML parsing are wired into the workflow, but no successful GitHub Actions execution has yet been evidenced for this hardening branch.
- A startup failure or empty jobs list is evidence that execution did not reach an observable job; it does not, by itself, establish the underlying cause.

## Finalization sequence

1. Review the draft PR and validate the four modified/new code files plus this runbook.
2. On a functioning hosted runner, pass YAML parsing, static policy validation, and all offline regression tests.
3. Investigate Actions policy, runner-group restrictions, service polling/host state, and runner capacity through authorized administration without weakening labels blindly.
4. Run the control-plane-only diagnostic and confirm artifacts are created.
5. Only after review, dispatch the explicit target sentinel.
6. Independently inspect run/job/step records, logs, and downloaded artifact contents for exact correlation.
7. Record the G02 acceptance decision.
8. Reassess the remaining gates individually. Production release requires its own approval.

No step in this runbook treats a draft PR, successful static check, runner heartbeat, or control-plane artifact as production authorization.
