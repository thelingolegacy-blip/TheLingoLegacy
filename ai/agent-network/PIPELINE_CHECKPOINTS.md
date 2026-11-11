# Distributed Pipeline Checkpoints and Recovery

Status: Required operating contract / checkpoint service not yet connected

## 1. Non-negotiable rule

Every meaningful stage boundary and every risky mutation must have a recoverable checkpoint. Checkpoints are distributed across all agent spots and owned by the project/work item, not by one agent or one human's memory. The checkpoint service must be durable, versioned, integrity-checked and independently restorable.

A checkpoint is not a backup unless restoration has been tested. A Git commit is a source checkpoint, but does not automatically capture databases, object storage, provider configuration or runtime state.

## 2. Checkpoint moments

Create or confirm a checkpoint:
- before starting a new stage;
- before changing shared components, routing, schemas, design tokens, permissions or infrastructure;
- before dependency upgrades or migrations;
- before merging branches or integrating parallel work;
- after a verified milestone;
- before release or publication;
- after a successful restore;
- at configured periodic intervals for long-running work.

Minimum lifecycle: BASELINE → PRE_MUTATION → WORKING → VERIFIED → ACCEPTED → RELEASED. Failed or superseded checkpoints remain immutable and traceable.

## 3. Checkpoint manifest

Each checkpoint records:
- checkpoint_id, project_id, work_item_id, stage_id;
- created_at_utc, created_by_agent_id, owner_id;
- source repository, branch, commit SHA and dirty-worktree indicator;
- affected files, components, routes, services, schemas and assets;
- dependency lockfile and build/runtime versions;
- environment identifier (never secrets);
- data snapshot/backup reference and encryption/key reference where applicable;
- configuration version references, not raw secret values;
- test/evidence references and hashes;
- parent checkpoint and last-known-good checkpoint;
- restore instructions, restore scope and known limitations;
- status and independent restore-verification result.

Sign or hash manifests and artifacts; verify hashes before restore. Never put credentials or secret values in checkpoint metadata.

## 4. Restore hierarchy

Choose the smallest safe recovery scope:
1. Revert the isolated work item or file set.
2. Restore the component or page checkpoint.
3. Restore the project/world checkpoint.
4. Restore the shared platform checkpoint only when impact analysis proves it is necessary.
5. Invoke disaster recovery only under the incident plan and authorized human direction.

Prefer forward fixes or scoped rollback over resetting the entire ecosystem. A restore must not erase newer accepted work belonging to another project.

## 5. Daily reset is not a project reset

At the start of each operating day, reset only ephemeral coordination state:
- refresh agent availability and capacity;
- open a new daily planning window;
- expire stale temporary room leases and task locks safely;
- reconcile stale queued/retry tasks;
- refresh service-health snapshots;
- roll daily metrics and cost counters;
- re-evaluate priorities and carryovers.

Never reset or delete:
- source history, accepted checkpoints or project memory;
- active work, open issues/PRs or uncommitted changes;
- protected release holds or approvals;
- user data, audit history or durable conversations;
- secrets/configuration, identity or access policy;
- unresolved incidents or rollback evidence.

Unfinished tasks carry forward with their owner, stage, blockers, checkpoint and next action. A task is not marked complete simply because the day ended.

## 6. Distributed ownership and redundancy

Every project has a primary owner plus a recovery steward. Every critical shared component has a technical owner and an independent reviewer. Neveah coordinates the index but is not the sole custodian. Datrell validates test evidence; Dialoe reviews security and recovery exposure; Daizhur implements approved technical recovery; the originating owner confirms functional integrity.

Store checkpoint indexes in durable, access-controlled storage with redundant backup. Separate backup credentials from runtime credentials. Apply retention tiers and test restore procedures on a schedule. Recovery must work when the originating agent is unavailable.

## 7. Restore procedure

1. Declare incident and freeze overlapping writes.
2. Identify blast radius and last-known-good checkpoint.
3. Compare current state with the checkpoint manifest and verify integrity hashes.
4. Confirm restore scope, data-loss window and dependent components.
5. Obtain human approval for production, destructive or sensitive restoration.
6. Restore in isolated/staging environment first where feasible.
7. Run smoke, regression, security, data-integrity and route checks.
8. Have an independent reviewer compare restored state to expected state.
9. Resume traffic/writes only after acceptance and authorization.
10. Record incident timeline, root cause, recovery evidence and preventive action.

## 8. Recovery objectives

Define RPO and RTO separately for each data class and service. Do not use one global target for the whole ecosystem. The owner must approve objectives based on business impact, storage cost and provider capability. Record actual measured backup age and restore duration; do not report a target as achieved without a restore drill.

## 9. Prohibited behavior

- No daily deletion/reset of project state.
- No overwrite of last-known-good checkpoints.
- No force-push or destructive restore without explicit approval.
- No restore from unverified or hash-mismatched artifacts.
- No agent may approve its own recovery action.
- No automatic promotion from a successful restore to production.
