# Memory and Recovery Restoration Runbook

## Purpose

Restore the LINGO Legacy project state after a context loss, agent restart, repository move, CI outage, or interrupted work. Restoration reconstructs the evidence trail; it does not automatically resume execution or change release state.

## Source precedence

1. **Current live provider records** read through authorized tools: current PR state, run/attempt metadata, job/step/log/artifact records, project configuration and accessible platform status.
2. **Current canonical repository files** on the exact branch/commit being reviewed, including `AGENTS.md`, gate matrices, acceptance contracts, release records and policy files.
3. **Immutable run/commit/artifact evidence** with source SHA, run ID, attempt, artifact identity, timestamp and integrity metadata.
4. **Approved issue/incident records** such as GitHub issues/PR discussions and Jira issues, correlated to the same source or incident.
5. **Prior runbooks and recovery summaries**, including known limitations and source dates.
6. **Conversation summaries or operator notes** as navigation aids only; verify claims against higher-authority sources where possible.

Never treat a prior summary as fresher than a current provider record. A current provider API failure is not proof the resource does not exist.

## Restoration procedure

1. Create a restoration session ID and record UTC time, repository, branch, commit SHA, and current user-authorized scope.
2. Fetch current canonical instructions and gate matrices.
3. Fetch current PR/run/attempt/job/step/log/artifact records for the active incident. Preserve separate run IDs and attempts; never combine partial evidence from different runs to manufacture a pass.
4. Reconstruct gate states from their acceptance predicates. For missing or inaccessible evidence use `UNKNOWN`, `NOT_RUN`, or `BLOCKED`, as appropriate.
5. Compare current evidence with previous records; mark each item `CURRENT`, `STALE`, `CONFLICTING`, or `UNVERIFIED`.
6. Restore the open task list, dependencies, deadlines, owners, and explicit stop conditions.
7. Generate a concise restoration report with source links, timestamps, known facts, unresolved hypotheses, and recommended next actions.
8. Require human confirmation before resuming any write-capable action. Production change requires a separate change request and acceptance record.

## Required restoration report

- Restoration session ID and timestamp.
- Source inventory with exact URL/resource ID, branch/SHA or run/attempt, observed timestamp, retrieval method, and limitations.
- Canonical production invariants.
- Gate-by-gate state with acceptance predicate and evidence pointer.
- Confirmed facts separated from hypotheses.
- Current task/dependency ledger.
- Credentials/permissions status stated only as verified or unknown; never include secret values.
- Drift, conflicts, stale records, and inaccessible resources.
- Safe next step and the condition that would unblock it.
- Independent reviewer and acceptance status, if any.

## Known recovery invariants

- `G02 = BLOCKED` until its exact acceptance predicate is met by independently retrievable evidence.
- `PRODUCTION = HOLD` until separately authorized release acceptance.
- `FAIL_CLOSED = ACTIVE`.
- `LKG = PROTECTED` until an authorized, evidenced change supersedes it.
- An online runner heartbeat, PR existence, event receipt, green preview, or static validator definition does not by itself satisfy G02.
- Do not delete or overwrite incident records when a later observation disagrees. Append a new observation and explain the discrepancy.

## What to do next after restoration

1. Refresh current GitHub Actions runs and inspect workflow/event discrepancies.
2. Ask an authorized GitHub administrator to verify Actions policy, runner groups, active runner polling and workflow association metadata.
3. Obtain same-run/attempt runner identity, job assignment, instantiated steps, sentinel success, retrievable logs and correlated artifact.
4. Independently validate all required release gates.
5. Only then consider a separately authorized change request. Until then, continue read-only work.
