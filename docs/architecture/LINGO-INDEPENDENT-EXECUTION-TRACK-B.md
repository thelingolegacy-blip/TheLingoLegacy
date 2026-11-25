# LINGO Independent Execution — Recovery Track B

**Status:** Architecture and implementation contract; not deployed or runtime-accepted  
**Date:** 2026-11-24  
**Canonical control repository:** thelingolegacy-blip/TheLingoLegacy  
**Control platform:** Cloudflare  
**Independent compute target:** Azure Linux VM (provisioning/access not verified)  
**Relationship to Track A:** GitHub Actions recovery remains separate. Track B must execute without GitHub Actions.

## 1. Objective and invariants

Track B lets LINGO build, test, package, and produce evidence independently of GitHub Actions. Cloudflare coordinates and records work; a dedicated Linux host performs builds and tests.

Mandatory invariants:
1. Production denied by default; initial jobs are staging-only.
2. Every job binds immutable source repository, commit SHA, tree/archive digest, environment, recipe version, job ID, attempt, principal, and policy decision.
3. Queue messages are dispatch hints, never authorization. The controller revalidates D1 job state, principal, approval, environment, lease, and idempotency before dispatch and result acceptance.
4. Host credentials are short-lived and narrowly scoped. No long-lived Cloudflare token or production secret on the host.
5. Logs and artifacts are redacted, content-addressed, checksummed, and retained by policy.
6. Retries are bounded and idempotent; a retry creates a distinct attempt.
7. Build success is not test, deployment, release, or production acceptance.
8. Production promotion, DNS/route changes, secret rotation, data migration, destructive operations, and hold removal require separate explicit approvals.

## 2. Logical architecture

- **LINGO Master Control:** policy, approval, schedule, gate status, audit review.
- **Operations Controller Worker:** validates job envelopes, authenticates workload principals, applies SAAAE, leases jobs, dispatches, accepts signed results, and records audit events.
- **D1 control store:** job/attempt metadata, leases, approval references, idempotency, verifier results, and audit references. Reuse existing schemas only after mapping; do not repurpose product or financial ledgers.
- **Cloudflare Queues:** reuse only after exact queue names, producers, consumers, schemas, retry/ack and dead-letter behavior are verified. Do not mix build dispatch with game/order/finance events.
- **Cloudflare Workflows:** durable orchestration, bounded retries, timeout and recovery coordination. Register staging-only first.
- **R2:** immutable non-secret artifacts/log bundles with SHA-256 manifests. R2 activation is a prerequisite; no storage capability is claimed before write/read integrity verification.
- **Azure Linux compute:** dedicated isolated host running allowlisted recipes under a distinct workload identity.
- **Track A/GitHub:** optional source and evidence integration, not an execution dependency.

## 3. Existing database preservation

Read-only SQL inspection on 2026-11-24 confirmed five D1 databases and 45 application tables (excluding internal _cf_KV):

| Database | Application tables | Handling |
|---|---:|---|
| askLINGO / SAAAE staging | 6 | Preserve; principals, grants, approvals, audit, idempotency, rate limits |
| Game engine staging | 6 | Preserve; product wallet/game ledger is not an operations store |
| Loyalty staging | 4 | Preserve; loyalty ledger remains isolated |
| World engine | 11 | Preserve; retain current service ownership |
| Production | 18 | Read-only; no Track B writes, migrations, or data copies |

SAAAE staging has principals, grants, approvals, audit_events, idempotency_keys, and rate_limit_buckets. Schema presence does not prove runtime enforcement or policy data readiness. Validate tenant scoping, foreign keys/indexes, principal lifecycle, approver/requester separation, expiry/revocation, one-time approval consumption, audit completeness, and negative authorization behavior before controller integration. No migration is authorized by this document.

## 4. Versioned job envelope

Required fields: schema_version; job_id; tenant_id; product_id; operation; source repository/commit SHA/tree SHA/archive SHA-256; environment (initially exactly staging); recipe ID/version and allowlisted command profile; resource limits; requester and workload principal; policy decision and required approval reference; idempotency key; correlation ID; creation/expiry; timeout/retry budget; expected output manifest.

Reject unknown schema versions, mutable refs without immutable SHA resolution, missing provenance, expired requests, production targets, unapproved command profiles, unbounded resources, and idempotency-key payload mismatches.

## 5. Job lifecycle

requested → validated → authorized → queued → leased → running → collecting → verifying → succeeded | failed | cancelled | expired

State transitions are server-side and validated. Leases include owner principal, attempt, issue/expiry times, and heartbeat deadline. Lease expiry enables recovery; it does not imply success. Results are accepted only from the authenticated workload identity holding the active lease. Executor status and independent verifier status remain separate. Every retry retains prior logs and creates a new attempt.

## 6. Azure compute security baseline

Before accepting builds:
- Verify subscription, resource group, region, VM identity, network path, owner, and cost controls.
- Use supported Ubuntu LTS, encrypted disks, security updates, restrictive inbound firewall, and egress allowlists.
- Run executor as an unprivileged OS account with systemd restart/resource limits and isolated per-attempt workspaces.
- Pin toolchain/container images by digest; prohibit privileged Docker access for untrusted jobs.
- Separate trusted staging recipes from arbitrary pull-request code; never run untrusted code on a persistent privileged runner.
- Use managed workload identity or short-lived credentials, never credentials baked into images or repository files.
- Emit host health, heartbeat, image digest, tool versions, assignment, and restart events.
- Verify NTP, disk/memory/CPU headroom, DNS, TLS, and artifact connectivity.
- Prove restart and lease recovery using a harmless sentinel.

No Azure VM is currently represented as provisioned or authenticated.

## 7. Artifact and evidence contract

Each attempt produces a manifest with job/attempt IDs, source digests, recipe/toolchain versions, start/end times, exit status, test summary, log/artifact object keys and SHA-256 values, executor identity, and independent verifier result. Controller independently reads and hashes objects before accepting results. Exclude secrets, tokens, production records, personal data, and financial ledger contents.

R2 acceptance requires activation, least-privilege binding, staging namespace, write/read round trip, checksum match, unauthorized-access denial, retention test, and recovery documentation.

## 8. Queue and Workflow rules

Inventory exact queue names, producers, consumers, message schemas, acknowledgement/visibility semantics, retry policy, dead-letter destination, and current traffic before reuse. If existing queues are semantically unsuitable, propose a dedicated operations queue rather than mixing domains. Consumers must reconcile every message against authorized D1 state; replayed or forged messages cannot create or authorize jobs.

A staging Workflow coordinates validation, authorization, enqueue, lease/heartbeat, timeout, result collection, independent verification, and terminal-state recording. Workflow state is orchestration state, not the sole audit record.

## 9. Initial recipes

Allow only reviewed, fixed staging recipes:
- Core: lockfile install, static checks, unit tests, package/build.
- Web: Node 22/npm 10, lockfile install, typecheck, lint, production build, OpenNext/Cloudflare build, focused route smoke tests.
- Security: schema/policy contract tests, dependency/config scans, secret-pattern scans, authorization negative tests.

No production deploy, migrations, payment operations, wallet settlement, data export, or requester-supplied arbitrary shell. Preserve Core/Web runtime differences and Android minSdk 21.

## 10. Acceptance gates

| Gate | Evidence | Current state |
|---|---|---|
| B01 Inventory | Queue details, D1 mapping, resource/account prerequisites | PARTIAL |
| B02 Compute | Verified Azure VM, identity, hardening, health | BLOCKED / not verified |
| B03 Controller | Staging Worker, auth and fail-closed tests | NOT DEPLOYED |
| B04 Orchestration | Staging Workflow, consumer, retry/replay tests | NOT DEPLOYED |
| B05 Storage | R2 activation, bucket, checksum round-trip, access denial | BLOCKED / activation required |
| B06 Execution | Real independent Core/Web builds, logs, artifacts | NOT EXECUTED |
| B07 Security | SAAAE positive/negative tests, approval separation, audit | NOT ACCEPTED |
| B08 Recovery | Restart, lost lease, duplicate message, retry, restore drills | NOT EXECUTED |
| B09 Master integration | Evidence-linked status and independent verifier | NOT INTEGRATED |

A gate is VERIFIED only with retrievable evidence tied to exact source and configuration. A document, resource listing, queued message, API upload, or workflow definition is not execution evidence.

## 11. Rollback and incident handling

Stop admission for the affected recipe; preserve queue records and evidence. Revoke compromised workload principals and expire leases. Quarantine a suspect host and preserve logs. Disable only staging controller/consumer bindings through an approved change. Re-run from a clean image/workspace. Restore only through documented staging recovery; never restore over production. Verify accepted source/artifact digests before resuming.

## 12. Ordered activation plan

1. Complete read-only queue names/settings/consumer, Workflow, Worker binding, Access app/policy, and account-plan inventory.
2. Confirm Azure subscription and VM access; create compute only after explicit region, size, budget, and billing approval.
3. Enable R2 in Cloudflare; create a staging bucket only after activation and bucket/region approval.
4. Implement controller against existing SAAAE schema with no production binding.
5. Register staging Workflow and dedicated queue consumer.
6. Provision/harden executor and establish short-lived workload identity.
7. Run harmless sentinel, then Core and Web staging recipes.
8. Independently verify logs, hashes, identity, retries, restart recovery, and rollback.
9. Integrate accepted evidence into Master Control.

**Current truth:** Architecture and schema observations are established. Track B is not deployed; no Azure runner is verified; R2 is not activated; no operations Workflow or consumer is registered; no independent Core/Web build has executed. Production remains outside scope.