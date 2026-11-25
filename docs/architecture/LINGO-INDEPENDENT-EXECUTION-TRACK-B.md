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


## 15. SAAAE staging data-readiness check — 2026-11-24

Read-only `COUNT(*)` queries were executed separately against all six SAAAE staging tables in `asklingo-v2-staging`:

| SAAAE table | Current rows |
|---|---:|
| `principals` | 0 |
| `grants` | 0 |
| `approvals` | 0 |
| `audit_events` | 0 |
| `idempotency_keys` | 0 |
| `rate_limit_buckets` | 0 |

The schema is present, including staging-only grant constraints, requester/approver separation checks, approval-consumption checks, lookup indexes, and append-only audit update/delete triggers. However, all six tables are empty. Therefore SAAAE is **schema-established but not operationally provisioned**: no principal, grant, approval, audit history, idempotency state, or rate-limit state is currently registered in this database.

### Security gate consequence

B03/B07 remain **BLOCKED**. Do not interpret the existence of tables, constraints, or triggers as active authorization enforcement. Before any privileged executor or queue consumer is connected, the implementation must establish and verify:
1. A controlled principal bootstrap and revocation path.
2. Least-privilege staging grants with tenant/product/resource/operation/environment scoping and expiry.
3. Requester/reviewer separation and one-time, scope-bound approval consumption.
4. Append-only audit writes for allow and deny decisions.
5. Idempotency conflict and replay behavior.
6. Rate-limit enforcement and abuse tests.
7. Positive and negative end-to-end authorization tests through the actual controller.

No rows were inserted or changed; no migration, principal bootstrap, grant, approval, or policy record was created.


## 16. SAAAE relational integrity check — 2026-11-24

Read-only `PRAGMA foreign_key_check` completed successfully and returned zero violation rows for `asklingo-v2-staging`. This is a limited relational-integrity result, not an authorization acceptance result.

`PRAGMA integrity_check` was rejected by the D1 query service with SQLite authorization error `SQLITE_AUTH`; database-wide integrity status is therefore **NOT VERIFIED**. Do not interpret this permission denial as proof of corruption or proof of integrity.

Combined conclusion: the six-table SAAAE schema and append-only audit triggers exist; the foreign-key check returned no violations; all six application tables contain zero rows; database-wide integrity_check was not permitted; and the privileged-executor Access app has no attached policy. SAAAE remains **NOT OPERATIONAL / NOT ACCEPTED**.


## 17. Cross-PR execution readiness reconciliation — 2026-11-24

A read-only review of the existing open recovery PRs was performed to avoid duplicating implementation and to reconcile their actual code with the live Track B blockers.

### PR #659 — SAAAE Cloudflare Access privileged executor boundary

Useful proposed primitives:
- RS256 Cloudflare Access JWT signature verification and issuer/audience/time/subject checks.
- Server-owned operator registry keyed by immutable subject, with requester/reviewer/workload role separation.
- Fail-closed behavior for missing configuration, invalid identity, missing roster, and unavailable signing keys.
- Tests for unregistered identities, human/workload separation, and incomplete independent rosters.

Acceptance gaps confirmed against live Cloudflare:
- The Access application currently has zero attached policies.
- The six SAAAE D1 tables each have zero rows.
- The proposed operator authentication reads a static `SAAAE_OPERATOR_REGISTRY_JSON` setting; the reviewed files do not establish a live D1-backed operator/grant/approval/audit runtime.
- The registry parser checks the presence of an attestation ID and trusted issuer string; it does not retrieve or cryptographically validate the external workforce attestation.
- Endpoint-level authorization must still enforce role, exact request digest, one-time approval, expiry, replay protection, and separate workload identity.

A current-head acceptance review was posted to PR #659 (comment ID `7149731243`). **Disposition: keep unmerged and inaccessible; authentication primitives are not an accepted privileged executor.**

### PR #666 — dedicated G02 self-hosted runner

The current installer/runbook/probe were rechecked. Outstanding items include:
- Runner default remains `lingo-g02-<hostname>`, not the canonical `lingo-legacy-g02`.
- Ubuntu 24.04 dependency list still specifies `libssl3`; package compatibility is not established.
- Probe does not upload the required downloadable evidence artifact.
- It does not independently correlate authoritative numeric runner ID and job ID to run, logs, artifact, and exact commit.
- Runbook's $0.00 DigitalOcean ceiling conflicts with a separate owner budget update; the exact authorized ceiling, plan price, and total billing must be reconciled before provisioning.
- The probe is a separate manual workflow and does not supersede or bypass the protected canonical G02 sentinel.

A current-head acceptance review was posted to PR #666 (comment ID `7149731854`). **Disposition: keep unmerged; no VM, token, registration, or billable resource has been created.**

### PR #611 — LLG dispatch contract

The current validator now checks role identifiers against the role catalog, rejects unknown roles/tools/permission profiles, and requires human owner/reviewer roles. This resolves the earlier role-catalog-only validation gap in the inspected source. However:
- Repository/branch/commit values still require correlation to the actual source checkout or authoritative provider event.
- Evidence references are checked for presence/shape; the completion transition does not retrieve and independently verify artifact authenticity, run/job IDs, commit, logs, or reviewer authorization.
- The package remains a non-runtime contract validator, not a scheduler or authorization service.

The prior review comments on PR #611 remain applicable for provenance and evidence-verification boundaries. **Disposition: do not grant dispatch authority or mark execution evidence accepted based on this package.**

### Integration decision

Continue using these existing PRs as the source of proposed work; do not fork duplicate implementations. The sequence is:
1. Correct and independently validate the G02 installer/probe contract, but do not provision until the approved cost ceiling and exact plan total are reconciled.
2. Finish SAAAE runtime integration with authoritative staging state, externally verified human independence attestations, an explicit least-privilege Access policy, and positive/negative end-to-end tests.
3. Implement the Track B controller only after SAAAE and workload identity are operational.
4. Add a dedicated operations queue and Workflow only after ownership, message schema, retention, plan limits, and cost are approved.
5. Activate R2 and verify immutable artifact storage before claiming independent build evidence.
6. Execute Core and Web build/test recipes on an independently verified host and correlate all logs/artifacts to the exact source commit.

No PR was merged, no policy was attached, no Worker/Workflow/queue consumer was deployed, no VM was provisioned, and no production resource was changed by this review.


## 18. D1 schema ownership and SAAAE stack reconciliation — 2026-11-24

A fresh read-only `sqlite_master` inventory enumerated every application table/view in all five existing D1 databases. This resolves an important naming/ownership ambiguity across the open SAAAE PR stack.

### Live D1 table ownership

| D1 database | Live application tables/views | SAAAE observation |
|---|---:|---|
| `asklingo-v2-staging` | 6 tables | Contains `principals`, `grants`, `approvals`, `audit_events`, `idempotency_keys`, `rate_limit_buckets`; all six currently contain zero rows. |
| `lingo-game-engine-staging-20261107` | 6 tables | Contains game accounts, sessions, wallets, ledger, progression and API rate limits. No `lingo_saaae_*` tables are currently present. |
| `lingo-loyalty-staging` | 4 tables + 1 view | Loyalty wallets/ledger/redemptions/rate limits; not an operations store. |
| `world-engine-db` | 11 tables | World content, assets, versions, events, knowledge base, feature flags, audit and idempotency; not an operations store. |
| `lingo-production` | 18 application tables | Production product data; explicitly out of scope for Track B mutations. |

### Open SAAAE implementation layers

- **PR #643 — SAAAE foundation:** shared policy, authorization, approval, audit, canonicalization, idempotency and adapter contracts. This is the best candidate for the reusable policy/decision core, subject to code review and adapter verification.
- **PR #658 — game-engine staging adapter:** introduces game-engine-specific `lingo_saaae_*` tables and D1 authorization/approval code. The migration files are proposed changes only; the live game-engine D1 inventory currently has no such tables, so this migration has not been applied to that database.
- **PR #659 — privileged provisioning identity boundary:** adds Cloudflare Access JWT verification and a separate operator roster for the administrative provisioning path. It is not a replacement for the product authorization core or the D1 approval/ledger path.
- **PR #657 — askLINGO staging edge preflight:** has a separate Firebase-token/tenant-scoped Worker and its own staging D1 binding. Do not assume its identity model or tables are interchangeable with Cloudflare Access operator identity or the game-engine adapter.

### Canonicalization decision

Treat SAAAE as **one shared policy and authorization standard with domain-specific adapters**, not one shared set of tables reused across unrelated products. Keep:
1. The shared decision/approval/audit/idempotency semantics in the common SAAAE core.
2. Product-specific identity and resource adapters in their own staging domains.
3. The privileged master-operations principal/approval/audit state in a dedicated operations store once the account plan, ownership, and cost are reviewed.

Do not repurpose `asklingo-v2-staging` merely because its six table names resemble an operations schema. It is currently bound to the askLINGO staging domain. Do not apply PR #658 migrations to game-engine D1 until migration tests, exact database binding, rollback, and explicit staging-migration authorization are recorded. Never apply any of these migrations to production as part of Track B.

This reconciliation is read-only. No migration was applied, no table was created, and no database binding or Worker was changed.


## 19. Shared SAAAE approval default-deny finding — 2026-11-24

A further source review of PR #643 identified a fail-closed gap in `src/security/saaae/approval.mjs`: requester/approver separation is enforced only when the caller sets `expected.requireSeparationOfDuties === true`. If the caller omits the flag or passes false, a self-approved record can proceed to signature verification and atomic consumption.

For privileged LINGO operations, separation of duties is a mandatory invariant. It must not depend on a caller-supplied optional boolean. The shared approval verifier must either enforce distinct requester/approver principals unconditionally or load a trusted, non-weakenable policy that defaults to deny. The verifier must also revalidate that both are distinct, active human principals immediately before durable single-use consumption.

A review comment was posted to PR #643 (comment ID `7149781763`) requiring the unconditional/default-deny correction and regression tests for omitted, false, true, and malformed values.

**Disposition:** PR #643 remains a candidate shared SAAAE foundation, not an accepted runtime authorization boundary. The shared approval default-deny issue is now an explicit blocking review item, in addition to the unverified Firebase project/IAM, approval key custody, principal/policy adapter, and protected-operation integration gates.
