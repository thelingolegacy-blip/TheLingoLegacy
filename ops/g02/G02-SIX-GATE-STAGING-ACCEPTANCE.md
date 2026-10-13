# G02 six-gate verification checklist — staging only

This checklist describes evidence required to pass the isolated staging trial. It does not authorize production promotion and does not assert that any gate has passed.

## Credential handling correction

The staging recovery agent uses Google Application Default Credentials (ADC) and a dedicated non-production project ID. Prefer workload identity / ADC over a long-lived service-account JSON key. Do not commit credentials, paste them into logs, or place them in GitHub variables.

If a key is unavoidable, provision it through the organization's approved secret-delivery mechanism and run the agent under a dedicated service identity that can read it. A file owned by root with mode 0600 is not readable by an unprivileged runner account unless the agent runs as root; do not run the whole GitHub runner as root merely to read a key. Use least privilege and a separately scoped staging project.

Required environment:
- `FIREBASE_ENV=staging`
- `FIREBASE_PROJECT_ID=<dedicated non-production project id>`, not `lingo-legacy-production`
- `RUNNER_NAME` must identify the staging runner
- `GITHUB_RUN_ID`, `GITHUB_RUN_ATTEMPT`, `GITHUB_SHA` supplied by Actions

The agent writes new records to `g02_staging_evidence/{run_id}-{run_attempt}`, not `runner_evidence/lingo-legacy-g02-staging`. This avoids overwriting prior evidence and preserves run correlation.

## Gate 1 — Control-plane authentication

**Required evidence:** the agent successfully initializes the Firebase Admin SDK through ADC/workload identity and creates a record in the dedicated staging project with least-privilege permissions. Record the project ID, run ID, attempt, document ID, and operation result; never record tokens or private keys.

**Pass condition:** a real staging Firestore write is independently visible and correlated to the run. Merely importing the SDK or generating JSON is not a pass.

## Gate 2 — Host connection and health

**Required evidence:** real staging-host uptime, root filesystem capacity, runner process/service observations, host timestamp, and tool availability in the uploaded JSON report.

**Pass condition:** values were collected on the intended staging host during the actual run. A local mock or a report assembled off-host does not pass.

## Gate 3 — Staging runner registration

**Required evidence:** GitHub runner settings or API show an online runner with labels `self-hosted`, `linux`, `x64`, `lingo-legacy-g02-staging`; runner name includes `staging`. Confirm it is a distinct registration from production `lingo-legacy-g02`.

**Pass condition:** the staging runner is online and independently identifiable. Do not register a duplicate production runner or change production labels.

## Gate 4 — Sentinel execution

**Required evidence:** a real GitHub Actions run ID and attempt, job ID, assigned runner ID > 0, populated runner name, instantiated steps, successful sentinel completion, and retrievable original job logs. The job must target only the staging label.

**Pass condition:** all required evidence comes from the actual GitHub run and is correlated to its commit SHA. A queued job or an empty steps array fails this gate.

## Gate 5 — Evidence and artifacts

**Required evidence:** uploaded artifact named with run ID and attempt; JSON record includes run ID, attempt, commit SHA, runner name, project ID, and timestamp; SHA-256 sidecar verifies against the downloaded artifact; Firestore document ID corresponds to the same run/attempt.

**Pass condition:** independently download the original artifact, verify its checksum, inspect its contents, and compare all correlation fields to GitHub run/job data. A Firestore success message without an independently observable record does not pass.

## Gate 6 — Production lock and independent acceptance

**Required evidence:** review the recovery branch diff and workflow permissions; confirm no production runner registration, production Firebase project, deployment, merge, or production credential was changed. Obtain independent review of Gates 1–5 and record reviewer, timestamp, commit SHA, run ID/attempt, artifact checksum, and explicit accept/reject decision.

**Pass condition:** production lock is still intact and an independent reviewer explicitly accepts the correlated staging evidence. A staging pass is not, by itself, production G02 acceptance.

## Overall disposition

- Staging trial: **NOT VERIFIED until all six gates are evidenced**
- Production G02: **BLOCKED**
- Production promotion: **NOT AUTHORIZED**
- Mutation freeze: **ACTIVE**

Do not report a gate as passed based on this checklist alone. Attach source evidence and record the result for each gate.
