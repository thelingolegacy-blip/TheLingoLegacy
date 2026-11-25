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

## 13. Live control-plane inventory addendum — 2026-11-24

A fresh authenticated Cloudflare API read was performed after the initial inventory. These observations supersede earlier estimates for the resources below:

| Resource | Live observation | Consequence |
|---|---|---|
| Worker scripts | 11 listed | Do not create a duplicate controller Worker until ownership and existing staging assets are reconciled. |
| Queue `game-events` | Queue ID `427092cfb8644e439938b49da8b9e353`; 0 producers; 0 consumers; 86,400-second message retention | Product-domain queue; do not repurpose for operations dispatch. |
| Queue `order-queue` | Queue ID `8abcfb33f9d24ce88eae860734d5d600`; 0 producers; 0 consumers; 86,400-second message retention | Order-domain queue; do not repurpose for operations dispatch. |
| Workflows | 0 registered | No durable orchestration currently exists. |
| R2 buckets | API read returned HTTP 403, error 10042: enable R2 through Cloudflare Dashboard | R2 is an activation prerequisite; no bucket or artifact store is available/verified. |

The Worker inventory includes existing staging-oriented assets such as `asklingo-v2-staging`, `lingo-studio-control-center-staging`, and `lingo-unified-control-tower-preview`. Their presence is not proof that they implement the Track B controller contract, have the required bindings, or are safe to extend. Inspect their source, settings, D1 bindings, service bindings, Access integration, and deployment state before selecting any as the implementation base.

The exact queue IDs and names establish that the two existing queues are not yet connected to producers or consumers. They remain reserved for their named product domains unless a separately reviewed ownership change proves otherwise. Track B should use a dedicated operations queue only after a cost/plan check, schema review, and explicit resource-creation approval.

### Updated B01 result

- Worker/queue/Workflow/R2 inventory: **VERIFIED as a read-only observation**.
- D1 table inventory and schema preservation: **VERIFIED as a read-only observation** in the preceding section.
- Queue ownership/message-schema suitability: **NOT VERIFIED**; zero producers/consumers means there is no live message contract to validate.
- Operations Workflow and consumer: **ABSENT**.
- R2 storage: **BLOCKED** pending account activation.
- B01 overall: **PARTIAL**; it is not promoted to PASS because account/plan cost limits, Access policy attachment, worker binding review, and Azure resource prerequisites remain open.

No queue, Worker, Workflow, R2, D1, DNS, Access policy, secret, or production resource was changed by this inventory.


## 14. Staging Worker and Access readiness review — 2026-11-24

A second read-only inspection checked settings for three existing staging/control candidates and enumerated account Access applications.

| Candidate | Observed bindings/settings | Track B disposition |
|---|---|---|
| `asklingo-v2-staging` | Tags include `staging`, `disabled`, `no-inference`; one D1 binding named `ASKLINGO_DB` to the askLINGO staging database | Preserve disabled/no-inference posture. Not a build controller; do not enable or repurpose. |
| `lingo-studio-control-center-staging` | Tags include `staging`, `read-only`; no bindings | Read-only catalog candidate only; no operations persistence or execution binding. |
| `lingo-unified-control-tower-preview` | Preview annotations describe an isolated read-only snapshot; no bindings | Preview evidence surface only; not a controller or executor. |

The Access application named **LINGO SAAAE Staging Privileged Executor** exists for `saaae-staging.thelingolegacy.com`, but its live Access application record reports **zero attached policies**. It also has an allowed identity-provider reference and a one-hour session duration; neither substitutes for an attached allow policy. Treat the application as **not authorized for privileged execution** until a separately reviewed, least-privilege policy is attached and independently tested. No Access policy was added or changed.

### Updated security gate

- Existing SAAAE privileged-executor Access application: **FOUND / NOT READY**.
- Attached Access policies: **0**.
- Staging candidate Workers: **FOUND / NOT A TRACK B CONTROLLER**.
- Controller authentication and SAAAE enforcement: **NOT IMPLEMENTED / NOT VERIFIED**.
- No workload identity, VM, consumer, or privileged execution path is accepted.

This is a blocking security prerequisite for B03/B07. Do not connect an Azure executor, queue consumer, or privileged Worker to this Access application until policy attachment, requester/reviewer separation, workload identity restrictions, expiry/revocation, and negative-access tests have passed.

No Worker settings, Access applications/policies, bindings, routes, D1 schemas, secrets, or production resources were changed.
