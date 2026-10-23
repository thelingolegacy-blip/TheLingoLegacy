# G02 Acceptance Contract — Runner Execution and Evidence

**Scope:** G02 runner-dispatch gate for \`thelingolegacy-blip/TheLingoLegacy\`  
**Default state:** BLOCKED until every mandatory predicate below is verified.  
**Purpose:** Establish that a real eligible runner executed the intended workflow and produced independently retrievable evidence tied to the exact source revision.

## 1. Non-negotiable acceptance chain

SOURCE → EXECUTION → EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION

G02 only evaluates runner execution and its evidence. Passing G02 does not, by itself, approve a pull request, certify a release, authorize a deployment, activate production, or promote LKG.

## 2. Canonical runner requirement

The canonical runner label set is:

- \`self-hosted\`
- \`linux\`
- \`x64\`
- \`lingo-g02\`

The expected runner name is \`lingo-legacy-g02\` unless a reviewed, human-authorized change updates this contract and the runner inventory. Do not remove the dedicated label, weaken the predicate, or substitute a hosted runner to clear the gate.

## 3. Mandatory conjunctive predicates

Every predicate is required. One missing, contradictory, zero, empty, or unverifiable value means G02 = BLOCKED.

- **P1 — Source identity:** Capture the full repository, workflow file/name, event, ref, commit SHA, workflow run ID, run attempt, and timestamp (UTC).
- **P2 — Real job assignment:** The authoritative GitHub Actions job response identifies an assigned runner with \`runner_id > 0\` and a non-empty \`runner_name\`. A queued run or a manually printed environment value does not satisfy this.
- **P3 — Runner eligibility:** The assigned runner matches the expected name and canonical label/OS/architecture policy. Verify actual runner inventory/labels through an authorized source when available; do not infer labels from a name.
- **P4 — Job identity:** Capture the numeric GitHub job ID separately from the workflow job name. \`github.job\` is a job name/key, not the numeric API job ID.
- **P5 — Step initialization:** The authoritative job response contains instantiated steps. An empty or missing step list is a failure/unknown, not a pass.
- **P6 — Sentinel execution:** The designated sentinel step actually ran and completed successfully. Capture its conclusion and relevant output; a job that only queued or initialized is insufficient.
- **P7 — Retrievable logs:** Fetch the job logs through the authorized GitHub API and verify the response contains the expected execution markers, runner identity, run/job identity, and commit SHA. A URL, HTTP success status alone, empty body, expired redirect, or \`BlobNotFound\` is not log evidence.
- **P8 — Required artifacts:** The run exposes the required evidence artifact(s), the artifact is downloadable, its archive can be opened, and its expected files are present and readable. A listed artifact name without downloadable content is insufficient.
- **P9 — Artifact integrity:** Record artifact ID, name, size, creation time, expiration time where available, source run ID, and SHA-256 of the downloaded archive and relevant extracted evidence files. Validate checksums against the downloaded bytes; do not trust a checksum merely because it is printed in the same unverified log.
- **P10 — Cross-source correlation:** Independently compare the run API response, job API response, step summaries, retrieved logs, artifact metadata, and artifact contents. The run ID, attempt, numeric job ID, commit SHA, runner identity, and artifact source must agree.
- **P11 — Independent review:** A reviewer/operator other than the agent that authored the change records the evidence sources, verification time, predicate-by-predicate result, and final disposition. If no independent verifier is available, the gate remains BLOCKED.
- **P12 — Freshness and scope:** Evidence belongs to the intended repository, workflow, run attempt, commit SHA, and acceptance request. Do not reuse artifacts or logs from a prior run to qualify a new run.

## 4. Required evidence manifest

For each candidate run, retain a machine-readable manifest or review record containing these fields where available:

- repository full name and workflow path/name;
- workflow run ID, run attempt, event, ref, commit SHA, created/updated timestamps;
- numeric job ID, job name, job status/conclusion, runner ID/name, runner OS/architecture;
- required runner labels and source used to verify them;
- step names, step numbers, status/conclusion, start/completion timestamps;
- log retrieval timestamp, retrieval result, byte count, and a redacted excerpt showing required markers;
- artifact ID/name/size/created/expired metadata, download result, SHA-256, extracted file inventory, and evidence-file checksums;
- independent verifier identity/role, verification timestamp, predicate results, exceptions, and disposition.

Do not store credentials, raw tokens, private keys, cookies, or unnecessary personal data in the manifest. Logs must be redacted before broad sharing; retain original access-controlled logs at the source.

## 5. Required sentinel markers

The sentinel should emit stable, unambiguous markers for:

- \`G02_SENTINEL=START\`
- \`G02_RUN_ID=<workflow run ID>\`
- \`G02_RUN_ATTEMPT=<attempt>\`
- \`G02_JOB_ID=<numeric job ID when safely provided by the workflow/API>\`
- \`G02_COMMIT_SHA=<full commit SHA>\`
- \`G02_RUNNER_NAME=<actual runner name>\`
- \`G02_RUNNER_ID=<positive runner ID, if available from a trusted runtime/API source>\`
- \`G02_SENTINEL=PASS\`

The independent verifier must cross-check markers against GitHub's authoritative run/job responses. A value echoing itself in a log is not independent proof of that value.

## 6. Decision table

| Observation | G02 disposition |
|---|---|
| Workflow queued or waiting for runner | BLOCKED — no execution proof |
| Job has runner ID 0, missing runner identity, or no assignment | FAIL / BLOCKED |
| Job response has no instantiated steps | FAIL / BLOCKED |
| Sentinel did not execute or failed | FAIL |
| Logs cannot be fetched, are empty, or lack expected markers | BLOCKED |
| Required artifact absent, expired, unreadable, or uncorrelated | BLOCKED |
| Run/job/SHA/runner/artifact metadata conflict | FAIL — investigate and preserve evidence |
| All predicates independently verified | G02 may be recorded PASS; downstream gates remain separate |

Do not turn a missing response, permission error, API outage, 404, 403, timeout, or expired artifact into a successful result. Distinguish technical failure from unknown evidence, but both prevent acceptance.

## 7. Remediation protocol

1. Preserve the failed run ID, attempt, job ID if available, exact API responses, timestamps, and error messages.
2. Inspect runner registration, daemon/service health, runner group/repository access, labels, organization/repository Actions policy, and platform restrictions using authorized read-only access.
3. Make one scoped diagnostic change at a time on an isolated branch; do not weaken the acceptance predicates.
4. Execute a fresh sentinel only after the runner eligibility issue is addressed.
5. Independently retrieve and correlate all evidence against that fresh run and exact commit.
6. Record the final result and unresolved limitations. Escalate persistent platform-level dispatch failures to the repository/organization administrator or GitHub Support with a redacted evidence bundle.

Do not rerun indefinitely without a hypothesis, remove the required label, change branch protection, or promote production to work around a blocked runner.

## 8. Gate authority and downstream separation

- **G02 acceptance:** requires all predicates above and independent review.
- **PR acceptance/merge:** requires its own diff review, required checks, effective repository rules, and authorized human decision.
- **Deployment:** requires a separately approved release candidate, target environment controls, credentials, rollback plan, and deployment evidence.
- **Production activation:** requires successful live probes and independent verification of runtime, routing, security, and observability.
- **LKG promotion:** requires an identified, retrievable, validated rollback target and explicit authorization.

Passing G02 never auto-authorizes these transitions.

## 9. Acceptance record template

- Candidate run ID / attempt:
- Commit SHA:
- Numeric job ID:
- Runner ID / name:
- Steps instantiated and sentinel result:
- Logs retrievable and verified:
- Artifact ID / name / SHA-256:
- Cross-source correlation:
- Independent verifier and timestamp:
- P1–P12 results:
- Exceptions / missing evidence:
- Disposition: BLOCKED / FAIL / PASS
- Next safe action:

**Default:** if the acceptance record is incomplete, disposition is BLOCKED.