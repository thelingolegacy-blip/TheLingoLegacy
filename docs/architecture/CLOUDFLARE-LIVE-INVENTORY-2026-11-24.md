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
