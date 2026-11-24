# Cloudflare live inventory and truth patch — 2026-11-24

## Scope and evidence method

Read-only Cloudflare API inspection of the authenticated account, the `thelingolegacy.com` zone, Worker script list/settings, Worker routes, and D1 database list. No resource was created, updated, deleted, deployed, or rebound during this inspection.

Account display name: `Thelingolegacy@gmail.com's Account`.
Zone: `thelingolegacy.com`, status `active`, plan `Free Website`.

## Live inventory

### Workers

The account currently lists 11 Worker scripts:

- `asklingo-v2-staging`
- `lingo-ecosystem-atlas`
- `lingo-flagship-root`
- `lingo-flagship-site-preview`
- `lingo-integration-config-404`
- `lingo-resilience-gateway`
- `lingo-static-backup-proxy`
- `lingo-studio-control-center-staging`
- `lingo-unified-control-tower-preview`
- `thelingolegacy-web`
- `thelingolegacyv-5`

Worker settings fetched successfully for five targets:

| Worker | Observed settings/bindings |
|---|---|
| `thelingolegacyv-5` | Compatibility date 2026-09-01; `nodejs_compat`; observability enabled; bindings only `ASSETS`, `CANONICAL_DOMAIN`, `PUBLIC_SITE_URL`. |
| `lingo-flagship-root` | Compatibility date 2026-09-01; no bindings; metadata identifies preview-only navigation repair candidate from PR #548 / commit `9c58b0eb638ea73900a2132c886cd56c002405d2`. |
| `thelingolegacy-web` | Compatibility date 2026-11-19; no bindings; no zone route was observed for this Worker in the route list. |
| `asklingo-v2-staging` | Compatibility date 2026-11-22; tags `asklingo`, `staging`, `disabled`, `no-inference`; D1 binding `ASKLINGO_DB` to `asklingo-v2-staging-20261122`. |
| `lingo-studio-control-center-staging` | Compatibility date 2026-11-02; read-only/staging tags; no bindings. |

### Zone routes

The zone currently returns 27 Worker route records. Key ownership observations:

- `thelingolegacy.com/*` → `thelingolegacyv-5`
- `www.thelingolegacy.com/*` → `thelingolegacyv-5`
- `atlas.thelingolegacy.com/*` → `lingo-ecosystem-atlas`
- `launch.thelingolegacy.com/*` → `lingo-static-backup-proxy`
- Several portfolio subdomains route to `thelingolegacyv-5`.
- Multiple `integration-configurations` path-specific routes point to `lingo-integration-config-404`.
- An additional exact-root pattern `thelingolegacy.com/` also points to `thelingolegacyv-5`.

The separate Worker `lingo-flagship-root` was not the target of any route in the returned route list. Do not infer that its uploaded version is serving production traffic.

### D1 databases

Five D1 databases are listed:

| Database | UUID | Intended role from name only |
|---|---|---|
| `asklingo-v2-staging-20261122` | `e041e690-2a45-4c82-8b46-6e012d739972` | Staging |
| `lingo-game-engine-staging-20261107` | `793ab138-7818-47c9-ad01-b319ad34a8c5` | Staging |
| `lingo-loyalty-staging` | `54ce928b-d540-4bce-816f-e89cb30b8fdf` | Staging |
| `world-engine-db` | `3c307c69-c65a-43bf-9a01-33b33972177a` | Not established by name |
| `lingo-production` | `6b63b699-5cee-400d-b5c0-92d7c9708539` | Production |

Database existence does not prove schema correctness, access policy, backup/restore, or application connectivity. No D1 SQL query or migration was performed in this inventory pass.

### Pages projects

The Pages projects endpoint returned five projects:

- `lingo-flutter-firebase-preview`
- `lingo-execution-center-preview`
- `lingo-legacy-github-integration-test`
- `thelingolegacy-static-backup`
- `my-flutter-app`

Important live observations:

- `lingo-flutter-firebase-preview` and `lingo-execution-center-preview` each showed a latest preview deployment for Core commit `73578c7ce0cba12a9f14fff8bd6d9f3f6157c776` with stages still queued/idle and `is_skipped: true`, reason `path_config`. This is not a successful build or deployment.
- `lingo-flutter-firebase-preview` reports `production_deployments_enabled: false` and preview path filters; its returned preview and production config both contain `fail_open: true`.
- `lingo-execution-center-preview` reports preview-only path filtering and `fail_open: false` for both returned environments.
- `lingo-legacy-github-integration-test` has deployments disabled and preview setting `none`; its returned preview/production config contains `fail_open: true`.
- `thelingolegacy-static-backup` has a successful historical production deployment from 2026-10-25; its returned preview/production config contains `fail_open: true`.
- `my-flutter-app` has the custom domain `app.thelingolegacy.com`, a historical production deployment dated 2026-08-30, and returned preview/production config contains `fail_open: true`. This project is a legacy/overlap candidate requiring ownership and traffic review, not an assumed canonical app target.

The `fail_open` values above are transcribed from live configuration. This document does not assert their runtime effect or change them.

## Reconciliation decisions

1. Keep `thelingolegacyv-5` as the observed apex/www route owner; do not move routes based on Worker upload metadata alone.
2. Keep `thelingolegacy-web` isolated until route ownership, required bindings, health checks, and Web acceptance are verified.
3. Treat `lingo-flagship-root` as an un-routed Worker resource unless later route/deployment evidence establishes another role.
4. Preserve the existing staging D1 databases. Do not apply schema migrations until schema inspection, migration order, backup/restore, and test evidence are recorded.
5. Treat the two skipped Pages preview builds as non-executions. Revisit path filters and the Pages project build trigger separately; do not mark the Core baseline preview as built.
6. Review Pages projects with `fail_open: true` against Cloudflare's documented semantics before proposing any configuration change.
7. No production route, DNS, Worker, Pages, D1, or Access mutation is authorized by this inventory.

## Current acceptance status

- Cloudflare account and zone identity: VERIFIED.
- Worker script inventory: VERIFIED (11 listed).
- Zone route inventory: VERIFIED (27 listed).
- D1 database inventory: VERIFIED (5 listed).
- Pages project inventory: VERIFIED (5 listed).
- Worker settings for five named scripts: VERIFIED as returned by API.
- Pages deployment state for five projects: PARTIALLY VERIFIED; two latest previews explicitly skipped, one historical backup deployment success, other current app readiness not established.
- Runtime behavior, SAAAE end-to-end enforcement, database schema/data integrity, backup restore, production traffic health, and product acceptance: NOT VERIFIED.
- Production mutations: NONE.


## Read-only D1 schema inspection — 2026-11-24

A read-only `SELECT name, type, sql FROM sqlite_master` was executed against three databases. Cloudflare returned `changes: 0` and `rows_written: 0` for all three queries. No application records or user rows were selected.

### askLINGO staging database

`asklingo-v2-staging-20261122` contains the following SAAAE-oriented tables:

- `principals`
- `grants`
- `approvals`
- `audit_events`
- `idempotency_keys`
- `rate_limit_buckets`

The returned DDL includes staging-only grant environment constraints, constrained principal/grant/approval states, distinct requester/approver check, approval expiry/consumption fields, and audit correlation fields. This establishes that the schema objects exist in this database; it does not prove that the deployed Worker enforces them correctly or that policy data is provisioned.

### Game-engine staging database

`lingo-game-engine-staging-20261107` currently returns these application tables:

- `lingo_api_rate_limits`
- `lingo_game_accounts`
- `lingo_game_progression`
- `lingo_game_sessions`
- `lingo_game_wallets`
- `lingo_wallet_ledger`

The six SAAAE tables listed above were not present in this database's returned table/index inventory. This confirms the dependency described by PR #658: the game-engine SAAAE runtime cannot be accepted against this database until its migration is reviewed, safely applied to staging, and verified. No migration was applied.

### Production database schema signal

The production database `lingo-production` returned legacy schema objects including `users`, `sessions`, `ai_conversations`, `gps_logs`, `game_spins`, `jackpot_spins`, `leaderboard`, `submissions`, and `studio_projects`. The DDL includes fields named for email, session token, latitude/longitude, and conversation message content. This is schema-level evidence only; no rows, tokens, messages, or location values were read. It triggers a required privacy/data-retention/security review before any migration or new integration.

### Updated database acceptance

- askLINGO staging SAAAE table presence: VERIFIED at schema level only.
- Game-engine staging SAAAE table presence: NOT PRESENT in returned schema; migration gate BLOCKED.
- Production schema privacy review: REQUIRED / NOT STARTED.
- Data quality, row-level authorization, retention, backup/restore, and runtime enforcement: NOT VERIFIED.
- All queries were read-only; Cloudflare reported zero changed rows and zero rows written.


## Access executor and production Worker verification — 2026-11-24

### SAAAE Access application

A fresh read of the Cloudflare Access application and account-member APIs confirms:

- Application `LINGO SAAAE Staging Privileged Executor` exists at `saaae-staging.thelingolegacy.com`.
- The application currently has **zero attached Access policies**.
- The account has **one accepted member**.
- The returned account-member record reports account-level two-factor authentication disabled.
- The current operator-registry implementation requires two distinct human operators (requester and reviewer) with independent attestations, plus a separate workload executor.

This staging privileged-executor boundary is therefore NOT READY. Do not add permissive policies or invent operator identities. A second independently authenticated human identity, an attestation process, a distinct workload identity, and policy review are prerequisites. No Access policy, member, DNS, or Worker route was changed.

### Core Worker deployment provenance

The current 100% deployment for `thelingolegacyv-5` points to version 137, version ID `2d161fa5-598f-4998-ada8-7ac4c72c3461`, created 2026-10-25. This confirms the active deployment record; a newer uploaded version or source upload timestamp is not equivalent to production activation.

The Worker remains the route owner for apex/www wildcard traffic. No new deployment or traffic split was performed.

### Updated acceptance status

- SAAAE privileged Access app existence: VERIFIED.
- Access policy attachment: ZERO; BLOCKED.
- Independent human requester/reviewer: NOT AVAILABLE in the current accepted-member roster.
- Account-level 2FA: DISABLED for the sole accepted member; remediation prerequisite.
- Separate workload executor identity: NOT VERIFIED.
- Active Core Worker deployment version: VERIFIED as v137 at 100%.
- Production Worker update/promotion: NOT PERFORMED.


### Latest-upload versus active deployment drift

A fresh Worker versions API read returned the latest uploaded `thelingolegacyv-5` version as **v378** (version ID `cf7059ef-a9af-47f0-8f9f-49c5a3cad759`, created 2026-11-21T18:33:17Z). The active 100% deployment remains **v137** (version ID `2d161fa5-598f-4998-ada8-7ac4c72c3461`, created 2026-10-25T14:04:26Z). The 241-version gap is a verified upload/deployment drift signal, not proof that v378 is safe or should be promoted.

The current v378 version must be reviewed against canonical GitHub source, preview/test evidence, bindings, route behavior, and rollback before any promotion. No promotion was performed.


### Game-engine staging Worker presence

The live Worker script inventory does **not** include `lingo-game-engine-staging`. The staging D1 database exists, and PR #655 contains a Wrangler configuration naming that Worker and binding the existing D1 database, but the Worker resource itself was not present in the account's returned 11-script inventory. No zone route points to it. Therefore the game-engine SAAAE code and migration remain source-only; there is no deployed staging Worker to health-check or exercise. Worker creation/upload/deployment remains blocked pending CI, migration review, operator readiness, and separate staging deployment approval.


## Master reconciliation refresh — 2026-11-24 21:21 UTC

This refresh was performed after the preceding inventory update. It re-queried the live Cloudflare account, zone routes, Access policy attachment, staging D1 schemas, and GitHub commit-associated workflow runs. All Cloudflare calls in this refresh were read-only.

### Current GitHub execution evidence

Core reconstruction head `1aeadb7f9e8a4444864450915412fd7c670528ec` still has three associated workflow runs:
- `45489740857` — Crimson Smoke UI static validation: `startup_failure`
- `45489738908` — Lingo Legacy Static CI: `startup_failure`
- `45489736932` — G02 Runner Image Build (no publish): `startup_failure`

The recorded Jobs API and Artifacts API responses for these runs were empty. No job steps executed. G02 remains quarantined and unverified.

Web PR #50 remains open, draft, and unmerged at head `0b020cc6af9f59c48bd9aebdf242d5d8af66f06b`. Its PR description records a successful Cloudflare preview build `5bb3bc1b-7a0b-4042-995c-8de2226f998d`, with 4/4 tests and successful OpenNext/Wrangler preview build. This is branch-preview evidence only; browser/device QA is still unverified. The associated Web Actions runs `45308373515` and `45305514299` both concluded `startup_failure`. Thus preview build success does not restore or certify GitHub Actions.

### Current Cloudflare reconciliation

- Account Worker inventory still contains 11 scripts. `thelingolegacy-web` exists; `lingo-game-engine-staging` does not.
- The current zone route list contains 27 routes. Apex wildcard and `www` remain routed to `thelingolegacyv-5`; no returned route targets `thelingolegacy-web` or `lingo-game-engine-staging`.
- The `thelingolegacy-web` Worker has deployment records, but its existence/deployment record does not establish zone traffic ownership or public route readiness.
- The SAAAE privileged-executor Access application still has zero policies.
- The account roster still returns one accepted member. That member's account-level 2FA flag is false. The member's role is Super Administrator; this does not satisfy independent requester/reviewer separation.
- Read-only query of game-engine staging D1 `793ab138-7818-47c9-ad01-b319ad34a8c5` returns the six game foundation tables and no SAAAE tables.
- Read-only query of askLINGO staging D1 `e041e690-2a45-4c82-8b46-6e012d739972` confirms the six SAAAE tables: `principals`, `grants`, `approvals`, `audit_events`, `idempotency_keys`, `rate_limit_buckets`.
- Both D1 queries report zero changed rows and zero rows written. No migration or data mutation was performed.

### Updated disposition

| Gate | Current status |
|---|---|
| Core reconstruction documentation | Source present; PR #664 draft/unmerged |
| GitHub Actions admission | BLOCKED — startup_failure before job creation in Core and Web |
| Web isolated preview build | PREVIEW BUILD PASS recorded for PR #50; browser/device QA outstanding |
| Web public route ownership | NOT CONFIGURED / NOT VERIFIED |
| Game-engine staging Worker | ABSENT |
| Game-engine staging SAAAE schema | NOT PRESENT |
| askLINGO staging SAAAE schema | PRESENT; runtime enforcement not certified |
| SAAAE Access policy | ZERO; blocked |
| Independent requester/reviewer identities | NOT ESTABLISHED |
| Account-level 2FA | DISABLED for sole accepted member |
| Core production Worker | Existing route owner/deployment preserved; uploaded v378 not promoted |
| Production privacy/retention review | REQUIRED; not completed |
| Production release | PROTECTED HOLD; NOT AUTHORIZED BY THIS DOCUMENT |

### Required next actions and authority boundaries

1. Repository/account owner: inspect GitHub Actions entitlement, usage/billing stop conditions, organization/repository Actions policy, and runner-group restrictions; if clear, escalate the correlated run IDs and zero-job evidence to GitHub Support.
2. Account owner: enable 2FA and establish separately controlled requester and reviewer identities. Do not create identities or Access allow policies by inference.
3. Security/operator owner: define and verify the distinct workload executor, operator registry, approval lifecycle, and audit enforcement before attaching any policy.
4. Engineering: complete tests for PR #658 and review the additive migration, backup/restore path, migration ordering, and rollback before any staging D1 migration.
5. Engineering: create and verify the staging game Worker only after CI, migration, identity, and explicit staging deployment gates pass.
6. Web owner: reconcile Web Worker route ownership, required bindings, and independent browser/device/accessibility acceptance before any public route change.
7. Core owner: compare uploaded `thelingolegacyv-5` v378 to canonical source, tests, bindings, route behavior, and rollback; do not promote based on upload sequence.
8. Privacy/security reviewer: complete production schema data classification, purpose, consent, retention, deletion, access, and logging review before new integration or migration.

No production deployment, route/DNS mutation, Access policy/member change, 2FA change, D1 migration, secret rotation, runner registration, billing change, or production-hold lift occurred in this refresh.
