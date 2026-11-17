# G02 Host Recovery Runbook

**Mode:** Read-only first; mutation only with explicit change approval  
**Canonical runner:** `lingo-legacy-g02`  
**Expected path:** `/opt/actions-runner`  
**Expected systemd unit:** `actions.runner.lingo-legacy-g02.service`

## Phase 0 — Scope and freeze

1. Confirm repository, environment, source commit, intended workflow, and operator.
2. Confirm production/LKG protection and active mutation freeze.
3. Confirm no new billing is authorized. If the only host option requires paid compute, stop and report the cost gate.
4. Do not dispatch recovery jobs until host identity and isolation have been established.

## Phase 1 — Read-only host inventory

On the authorized host, collect and preserve raw output for:

```bash
date -u --iso-8601=seconds
hostnamectl
uname -a
id
df -h
free -h
uptime
systemctl status actions.runner.lingo-legacy-g02.service --no-pager
systemctl is-enabled actions.runner.lingo-legacy-g02.service
ps -eo pid,ppid,user,stat,lstart,args | grep -E '[R]unner.Listener|[R]unner.Worker'
find /opt/actions-runner -maxdepth 2 -type f \
  \( -name '.runner' -o -name '.credentials' -o -name '.service' \) -printf '%p\n'
find /opt/actions-runner/_diag -maxdepth 1 -type f -printf '%TY-%Tm-%TdT%TH:%TM:%TSZ %p\n' 2>/dev/null
journalctl -u actions.runner.lingo-legacy-g02.service --since '24 hours ago' --no-pager
```

Do not print credential file contents. Capture metadata only. Do not run broad recursive searches through secrets.

Record CPU, memory, disk, OS, architecture, image digest, runner version, service state, process state, last diagnostic timestamp, and network egress policy.

## Phase 2 — Identity and registration reconciliation

1. Query GitHub runner inventory read-only.
2. Match exact runner ID, name, labels, status, and repository scope.
3. Compare registered runner identity to host inventory and service configuration.
4. Investigate duplicate registrations without deleting or replacing any runner.
5. If no persistent host is accessible, record `HOST_ACCESS_UNAVAILABLE`; do not infer host health from GitHub's online indicator.

## Phase 3 — Failure classification

Classify the earliest failed boundary:

- `DISPATCH_NOT_CREATED`: workflow run absent.
- `JOB_NOT_CREATED`: run exists but no job object.
- `RUNNER_NOT_ASSIGNED`: job has no positive runner ID/name.
- `HOST_SERVICE_UNHEALTHY`: host or service evidence shows unhealthy.
- `HOST_RESOURCE_EXHAUSTION`: measured CPU, memory, or disk pressure exceeds approved limits.
- `NETWORK_OR_AUTH_FAILURE`: direct evidence identifies DNS, TLS, egress, or authentication failure.
- `STEP_EXECUTION_FAILURE`: runner assigned and a step actually failed.
- `EVIDENCE_PUBLICATION_FAILURE`: execution occurred but logs/artifacts are unavailable or incomplete.
- `UNKNOWN_PRE_JOB_FAILURE`: startup failure with no job/host evidence. Do not guess a root cause.

## Phase 4 — Controlled repair

A repair requires an approved change record and rollback plan. Make one change at a time. Examples include correcting a documented service configuration, restoring a verified runner binary, or repairing a proven host resource issue. Do not rotate credentials, delete runner registrations, reimage, replace the host, or change production infrastructure without separate approval.

After a repair, capture before/after snapshots and hashes. Confirm the service and host are healthy before a workflow is dispatched.

## Phase 5 — Fresh assignment probe

Use the existing canonical workflow only after host identity has been verified. Dispatch a single bounded probe with no production credentials and no untrusted code. Require:

- run ID and attempt
- numeric job ID
- positive runner ID
- exact runner name
- Linux / X64 identity
- expected labels
- instantiated steps and terminal conclusions
- sentinel output
- retrievable logs and artifact
- source/run/job/commit correlation

A queued or cancelled job is not an execution. A job without a positive runner ID is not G02 assignment.

## Phase 6 — Evidence publication and independent verification

1. Download raw logs and artifacts.
2. Create a manifest with SHA-256 hashes.
3. Recompute hashes independently after download.
4. Compare runner ID/name and commit/run/job IDs across all evidence.
5. Confirm no secrets appear in logs or artifacts.
6. Have a reviewer who did not perform the repair record ACCEPTED or REJECTED with reasons.

## Phase 7 — Recovery disposition

- If all criteria pass: request separate G02 acceptance and release-authority decision.
- If any evidence is missing: retain `UNVERIFIED`.
- If host integrity or credential exposure is suspected: quarantine host and follow incident response.
- If cost approval is absent: keep host unprovisioned and document the blocker.
- Never auto-promote production after G02 acceptance.

## Rollback

Stop the runner service only with change approval. Preserve diagnostic logs and forensic evidence first. Restore the prior verified configuration or image. Do not delete runner registration or host resources until retention and incident review are complete.
