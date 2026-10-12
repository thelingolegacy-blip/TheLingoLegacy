# G02 Sentinel Evidence Contract

**Status:** Proposed acceptance contract; not proof that execution or evidence currently exists.  
**Scope:** G02 runner execution only. This document does not authorize merge, release, deployment, credential changes, runner re-registration, or production mutation.

## Objective

Establish a reproducible, independently verifiable chain from GitHub workflow dispatch to an actual runner, executed sentinel steps, retrievable logs, and a downloadable evidence artifact correlated to the same run, job, commit, and runner identity.

## Preconditions

Before interpreting a sentinel result, record:

- Repository full name and workflow path.
- Workflow run ID, attempt number, event, ref, and full commit SHA.
- Job ID, job name, requested runs-on labels, and job status.
- Runner ID, runner name, runner group, operating system, architecture, and observed labels, as exposed by GitHub.
- UTC timestamps for dispatch, assignment, first step, completion, and evidence retrieval.
- The source of each observation and the time it was captured.

Do not infer runner identity from a label string, host name supplied in chat, or workflow configuration alone. Prefer GitHub's assigned job metadata and host-side service evidence collected by an authorized operator.

## Conjunctive acceptance predicates

G02 may be marked **PASS** only when every predicate below is true and its supporting evidence is retrievable:

1. **P1 — Matching runner exists:** an actual runner is registered for the intended repository or authorized runner group.
2. **P2 — Nonzero runner ID:** the assigned job reports runner_id greater than zero.
3. **P3 — Named runner:** the assigned job reports a non-empty runner_name.
4. **P4 — Assignment:** GitHub records the sentinel job as assigned to that runner, not merely queued or waiting.
5. **P5 — Steps instantiated:** the job API returns the expected step list with timestamps and conclusions where applicable.
6. **P6 — Sentinel executed:** a harmless sentinel step completes and emits a unique run-scoped marker.
7. **P7 — Logs generated:** job logs include the marker and enough context to establish the executed step and result.
8. **P8 — Logs retrievable:** an authorized reviewer can retrieve the actual logs through the GitHub API/UI; metadata or an inaccessible URL is insufficient.
9. **P9 — Artifact produced and retrievable:** the run exposes a downloadable evidence artifact containing the manifest described below.
10. **P10 — Correlation verified:** an independent reviewer confirms that run ID, attempt, job ID, full commit SHA, runner identity, timestamps, log marker, and artifact manifest agree.
11. **P11 — Integrity verified:** the downloaded artifact is checked for completeness and integrity (for example, a recorded SHA-256 digest); missing or mismatched values fail acceptance.

These predicates are conjunctive. One false, missing, stale, or unverifiable predicate means **G02 remains HOLD**. Do not downgrade the predicate set to make a run pass.

## Evidence artifact manifest

The artifact should include a machine-readable manifest.json with:

- schema_version
- repository
- workflow_path
- run_id
- run_attempt
- job_id
- commit_sha
- ref
- event
- runner_id
- runner_name
- runner_group
- runner_labels (as observed, not merely requested)
- os and architecture
- started_at_utc and completed_at_utc
- sentinel_marker
- job_conclusion
- log_capture_reference
- artifact_created_at_utc
- sha256 for included evidence files

Do not put secrets, access tokens, environment dumps, personal data, or unrelated production configuration in the artifact. Redact sensitive values without destroying the fields required for correlation.

## Independent verification procedure

1. Retrieve the run metadata from GitHub.
2. Retrieve the latest-attempt job record and its step list.
3. Verify the assigned runner fields are populated and consistent with the authorized G02 runner.
4. Retrieve logs independently; locate the unique sentinel marker and compare timestamps and outcome.
5. List the run's artifacts, download the evidence artifact, parse the manifest, and verify digests.
6. Compare every correlation field across run metadata, job record, logs, and artifact.
7. Record the reviewer, UTC verification time, evidence references, per-predicate result, and any discrepancy.
8. Have the designated gatekeeper record PASS only after all predicates pass. Otherwise record HOLD with the exact failed or missing predicates.

## Failure classification (no speculative root-cause claims)

- **Queued / no runner assignment:** dispatch or eligibility remains unresolved; investigate runner availability, group access, labels, and repository Actions policy using read-only evidence first.
- **Assigned but no steps:** execution initialization failure; preserve run/job IDs and platform error details.
- **Steps present but sentinel fails:** execution or workflow failure; use step conclusions and retrievable logs.
- **Logs or artifacts unavailable:** evidence pipeline failure, even if the UI says the job completed.
- **Correlation or integrity mismatch:** reject the evidence and keep G02 on HOLD.

A single failure signature is not sufficient to assert a definitive root cause. Distinguish observed facts from hypotheses.

## Safety and change control

- Keep production, DNS, Worker routes, credentials, access controls, and deployment settings untouched during this evidence-gathering phase.
- Do not restart, terminate, re-register, or relabel a runner as part of this contract without a separately reviewed, explicitly authorized change plan.
- Do not merge this draft or any recovery PR as a substitute for successful runtime evidence.
- Preserve the last-known-good state and fail closed.
- Do not represent a document, configured workflow, queued job, or logical role as a functioning runner, bot, backup, or deployed control.

## Acceptance record

| Predicate | Result | Evidence reference | Reviewer / UTC |
|---|---|---|---|
| P1–P11 | NOT VERIFIED | Pending real sentinel execution | Pending |

**Current decision:** G02 = HOLD / NOT ACCEPTED. Production promotion = BLOCKED. Last-known-good = PROTECTED.
