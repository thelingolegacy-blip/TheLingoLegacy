# G02 Proactive Recovery Plan

Status: proposed operational plan; not acceptance evidence. Production remains HOLD.

## Purpose
Detect runner-host degradation early, separate host failures from GitHub-side admission failures, preserve sanitized evidence, and prevent speculative repair loops. The companion `ops/g02/proactive-host-watch.sh` is read-only and returns 0 (no threshold tripped), 1 (warning), or 2 (critical). It does not restart, re-register, relabel, dispatch, deploy, or promote.

## Initial signals and triggers
- **Critical immediately:** expected runner systemd unit missing/inactive; `Runner.Listener` absent; GitHub DNS lookup failure; HTTPS/TLS check failure; load per CPU >= 2.0; memory >= 95%; disk or inode usage >= 95%; G02 run reports `startup_failure` or expected job list is empty.
- **Investigate promptly:** load per CPU >= 1.0; memory, disk, or inode usage >= 90%; stale runner last-seen time; repeated queue-without-assignment; missing logs/artifacts; increasing diagnostic error counts.
- **Signal only:** log keyword counts. They are not a root-cause finding; correlate timestamps and inspect authorized raw logs separately.

Thresholds are initial defaults and require review against a measured baseline. Do not weaken the canonical G02 acceptance contract.

## Response runbook
1. Preserve UTC timestamped host-watch report and checksum, actual unit status, recent journal output, runner _diag metadata, and GitHub run/job/artifact records. Sanitize output before sharing.
2. If service is inactive or listener absent, verify actual unit and install path, last exit, service user/permissions, and resource/network signals. Restart only after a specific cause is evidenced, logs are preserved, and an authorized operator approves.
3. If host is healthy but jobs remain unassigned or no jobs initialize, stop repeating host restarts. Verify runner ID/name/last-seen, exact labels (`self-hosted`, `linux`, `x64`, `lingo-g02`), runner-group scope, repository authorization, and Actions policy. Mark inaccessible facts UNVERIFIED.
4. If both hosted and self-hosted workflows fail before job initialization, collect run IDs, workflow IDs, timestamps, source SHA, zero-job/artifact observations, and log retrieval errors for GitHub Support. Do not assume the host is the root cause.
5. Correct only the evidenced failure in a reviewed change with explicit authorization and rollback plan. Repeat the same read-only diagnostics after the change.
6. Run one controlled canonical sentinel only after authorization. G02 remains BLOCKED until all nine predicates in the canonical runbook are independently verified: real runner, positive runner ID, canonical runner name, assigned job, instantiated steps, successful sentinel, generated logs, retrievable logs, and independently verified/correlated evidence artifact.
7. G02 PASS never authorizes downstream certification or production promotion.

## Monitoring architecture
- Proposed host cadence: every 5 minutes, managed by an authorized host operator; restricted report directory and rotation required. This patch does not install a timer or cron job.
- Proposed control-plane cadence: hourly inspection of recent G02 runs plus verification that the monitoring workflow itself initialized.
- Independent heartbeat: an external monitor must alert if the scheduled workflow heartbeat goes stale or a run reports startup_failure/zero jobs. A workflow that depends on GitHub runner startup cannot reliably alert on its own failure.
- Daily/after incident: review trends, false positives, stale runner state, and evidence completeness.

## Change controls and evidence
Every observation should capture UTC time, source, host or run ID, workflow/job IDs when available, commit SHA, attempt, result, artifact ID/name, retrieval status, checksum, and independent verifier. Unknown fields stay UNVERIFIED.
Any restart, runner replacement/re-registration, label/group/policy change, workspace cleanup, or network configuration change requires an incident record, explicit authorization, before/after evidence, and rollback plan.

## Safety boundary
No automatic remediation, no credential changes, no runner re-registration, no label/group changes, no workflow dispatch, no deployment, no merge, and no production promotion are included. Current disposition: G02=BLOCKED; PRODUCTION=HOLD; FAIL-CLOSED=ACTIVE; LKG=PROTECTED.
