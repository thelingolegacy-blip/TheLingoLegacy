# LINGO Legacy Recovery Framework
## Restore · Reform · ReFrame · Reconstruct · Restate · Rebuild

**Authority:** recovery planning and evidence collection only.  
**Current gate state:** G02 BLOCKED · PRODUCTION HOLD · FAIL-CLOSED ACTIVE · LAST-KNOWN-GOOD PROTECTED.  
**No automatic release authority:** this framework cannot unlock a gate, deploy production, or authorize a destructive operation.

## 1. RESTORE — preserve before repair

### Objectives
- Preserve the current production last-known-good version and the evidence describing it.
- Inventory source branches, draft pull requests, workflow runs, build artifacts, DNS, Cloudflare/Vercel routing, Firebase configuration, backups, and relevant access boundaries.
- Restore only from a verified source, known-good artifact, or integrity-checked backup.

### Required evidence
- Source repository, branch, commit SHA, and retrieval timestamp.
- Current production target and independently verified live response.
- Backup identity, creation time, integrity result, scope, and restoration rehearsal result.
- Before/after evidence and an explicit rollback plan for any approved mutation.

### Prohibitions
No production overwrite, restore, deployment, DNS mutation, or deletion during inventory. A checksum proves byte integrity, not truth or recoverability.

## 2. REFORM — correct operating controls

- Default to read-only access and least privilege.
- Require explicit human approval for runner installation/re-registration, label or group changes, service restarts, permissions, secrets, DNS, production deployment, data restoration, paid resources, and external communications.
- Separate proposer, executor, and independent reviewer where feasible; never allow a workflow to approve its own release.
- Keep workflows bounded, idempotent where possible, time-limited, and auditable.
- Record unknowns as unknown; never infer zero inventory from an API permission error.
- Keep recurring polling, external alerts, and notification destinations disabled until their owner, cadence, retention, access, and cost are approved.

## 3. REFRAME — establish one source of truth

Maintain a single evidence record with:
- repository and workflow identity;
- run ID, run attempt, event, ref, and commit SHA;
- job ID and job result;
- runner ID, runner name, labels, online/busy state, and runner-group access where available;
- step names/status/conclusions;
- log retrieval status without copying secrets or unnecessarily retaining raw logs;
- artifact ID/name, expiration status, run/attempt correlation, and integrity digest;
- observer, timestamp, limitations, and independent acceptance decision.

Label every statement as **verified**, **inferred**, **unknown**, or **proposed**. Never merge evidence from different run attempts into one acceptance claim.

## 4. RECONSTRUCT — map dependencies and failure domains

Inventory the recovery path across:
1. GitHub Actions event receipt and workflow parsing;
2. hosted-runner availability and job startup;
3. self-hosted runner service, polling, labels, groups, and assignment;
4. job initialization, steps, and log generation;
5. artifact creation, retention, retrieval, and correlation;
6. GitHub permissions, organization/repository Actions policies, and branch protection;
7. Cloudflare, Vercel, DNS, Firebase, application runtime, telemetry, and production routing.

For the current startup failure, begin with authorized administrator inspection of Actions policy, hosted-runner restrictions/availability, runner-group access, and self-hosted service polling. Empty jobs indicate failure before observable job execution but do not alone prove a particular root cause.

Do not weaken runner labels to make a job start. Do not execute unreviewed pull-request code on the self-hosted production-capable host.

## 5. RESTATE — publish canonical status

Every status update must state:
- what changed and the exact branch/commit/PR;
- what was actually executed and the evidence reference;
- what passed, failed, or remains unverified;
- limitations or missing access;
- current gate matrix and next authorized action.

Current canonical state remains:
- **G02:** BLOCKED
- **Production:** HOLD
- **Fail-closed:** ACTIVE
- **Last-known-good:** PROTECTED

A draft PR, passing preview build, workflow event receipt, host heartbeat, or successful API read is not G02 acceptance.

## 6. REBUILD — execute in independently verified increments

### Stage A — establish dispatch
- Resolve the cause of startup failures through authorized GitHub/runner administration.
- Demonstrate a real job is assigned and started.
- Preserve run ID, attempt, SHA, job ID, runner ID/name, and retrievable logs.

### Stage B — validate the evidence path
- Run static policy validation on a functioning runner.
- Execute the minimal target sentinel only after review and explicit authorization.
- Verify the artifact belongs to the same run/attempt and commit SHA.
- Test missing-artifact, inaccessible-log, offline-runner, and permission-denied behavior.

### Stage C — independently accept G02
All required predicates must pass for the same run and attempt:
1. runner ID > 0 and runner name populated;
2. intended job assigned to the expected runner;
3. steps instantiated and sentinel completed successfully;
4. logs independently retrievable;
5. non-expired artifact present and correlated to the exact run/attempt/SHA;
6. evidence independently reviewed and acceptance recorded.

### Stage D — proceed through release gates
Only after G02 acceptance, evaluate remaining build, security, accessibility, configuration, live-route, synchronization, and acceptance gates. Production release authorization is separate and requires its own explicit approval and evidence.

## Dispatch workflow availability caveat

GitHub's manual `workflow_dispatch` trigger requires the workflow file to exist on the repository's default branch. This recovery workflow is currently in an unmerged draft PR, so do not assume it can be manually dispatched from the feature branch alone. Do not merge it solely to enable dispatch while startup failures and code validation remain unresolved. Use the existing authorized diagnostics path and administrator-reviewed recovery procedure first.

## Completion definition

This framework is complete only as a recovery plan. Operational recovery is **not complete** until the actual dispatch failure is resolved, real correlated evidence is produced, G02 is independently accepted, and all subsequent release gates are passed with separate authorization.
