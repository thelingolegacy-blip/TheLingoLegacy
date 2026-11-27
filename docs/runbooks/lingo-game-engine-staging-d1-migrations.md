# LINGO Game Engine — Staging D1 Migration Runbook

Status: **PREPARED — NOT EXECUTED**  
Environment: staging only  
Database: `lingo-game-engine-staging-20261107`  
Database UUID: `793ab138-7818-47c9-ad01-b319ad34a8c5`  
Wrangler config: `wrangler.game-engine-staging.jsonc`  
Production database: **out of scope; do not target**

## 1. Verified pre-migration state

Read-only Cloudflare inventory on 2026-11-27 confirmed that the configured staging D1 database exists and that its UUID matches the staging Wrangler config.

A read-only query against `sqlite_master` returned these application tables:

- `lingo_api_rate_limits` (legacy table; not defined in the current `0001` migration)
- `lingo_game_accounts`
- `lingo_game_progression`
- `lingo_game_sessions`
- `lingo_game_wallets`
- `lingo_wallet_ledger`

It also returned Cloudflare's internal `_cf_KV` table. The current schema includes wallet-ledger indexes and triggers.

No `lingo_saaae_*` tables and no `d1_migrations` table were present. The current staging database therefore has the initial game-wallet schema but no tracked Wrangler migration history; migrations `0002` and `0003` are not applied.

The D1 database-list response reported `num_tables: 0`, inconsistent with the live `sqlite_master` query. Use the live SQL metadata query for schema verification, not the `num_tables` field. The extra `lingo_api_rate_limits` table is legacy state: preserve it and do not drop or rewrite it as part of this work.

A current D1 Time Travel bookmark was retrieved read-only on 2026-11-27: `00000027-00000000-00005130-a38f57e72bde3a34d88ae14d5017ebef`. Refresh the bookmark immediately before any approved migration; this captured value is the current pre-migration reference, not a permanent substitute for a fresh backup check.

No application rows were read. No SQL writes were performed.

## 2. Preconditions before any remote migration

Do not run the remote migration until all of the following are true:

1. A named operator has approved a staging-only migration window.
2. The target is re-confirmed as database UUID `793ab138-7818-47c9-ad01-b319ad34a8c5` and name `lingo-game-engine-staging-20261107`.
3. The Wrangler config used for the command is `wrangler.game-engine-staging.jsonc`, not the production or flagship config.
4. A current Time Travel bookmark is recorded and the available restore-retention window is confirmed for this account/plan.
5. The current schema DDL, indexes, triggers, and foreign-key state are exported or recorded for comparison.
6. The operator has reviewed migrations `0001`, `0002`, and `0003` and confirmed the extra legacy table is preserved.
7. The staging Worker/game-math acceptance blocker is resolved. The current Worker still uses a three-reel engine while the That’s My Lingo source contract is 5×3; do not deploy it as the final game engine.

## 3. Migration review

The intended sequence is:

| Migration | Purpose | Current status |
| --- | --- | --- |
| `0001_lingo_game_wallet_staging.sql` | Initial game account, wallet, session, ledger, and progression schema | Core tables already exist; migration ledger is absent |
| `0002_lingo_saaae_staging.sql` | Principals, tenant memberships, scoped grants, approvals, audit events, and rate-limit buckets | Not applied |
| `0003_lingo_saaae_provisioning_evidence.sql` | Staging-only provisioning requests and append-only provisioning audit | Not applied |

Migration `0003` now constrains `target_firebase_project` to exactly `lingo-legacy-staging`. Its regression test rejects `lingo-legacy-production`.

All three migrations use idempotent `CREATE ... IF NOT EXISTS` patterns, but that does not replace a preflight DDL comparison. Confirm every existing table, index, and trigger against migration `0001` before establishing the migration ledger. Do not insert a hand-written `d1_migrations` record or mark a migration applied without proving that its complete SQL effects are already present.

## 4. Approved staging execution sequence

After the preconditions and explicit migration approval are satisfied:

1. Run `wrangler d1 migrations list lingo-game-engine-staging-20261107 --remote --config wrangler.game-engine-staging.jsonc` and save the output.
2. Review the exact unapplied migration names and their order.
3. Apply only to the named staging database with `wrangler d1 migrations apply lingo-game-engine-staging-20261107 --remote --config wrangler.game-engine-staging.jsonc`.
4. Capture the complete CLI output and resulting migration ledger.
5. Re-query `sqlite_master` for tables, indexes, and triggers.
6. Run `PRAGMA foreign_key_check` and require an empty result.
7. Confirm the six SAAAE tables from migration `0002` and the two provisioning tables plus their triggers from migration `0003` exist.
8. Confirm `lingo_api_rate_limits` remains present and unchanged.
9. Run the D1 integration tests against the staging binding, then verify the Worker health endpoint only after a staging-only deployment is separately approved.

Do not run these commands against `lingo-production`, the flagship Worker database, or any database selected from an implicit default binding.

## 5. Failure handling and rollback

Cloudflare documents that a failed D1 migration is rolled back and the previous successful migration remains applied. The migration command also captures a backup after applying migrations.

For a migration that completes but causes an unexpected schema or runtime result:

1. Stop further writes and stop the staging Worker if it has been separately deployed.
2. Capture the failing query, migration name, timestamps, and current migration ledger.
3. Identify the last known-good Time Travel bookmark or timestamp.
4. Obtain explicit approval before restoring the database.
5. Restore the exact staging database to the approved bookmark/timestamp using D1 Time Travel.
6. Re-run schema metadata checks and `PRAGMA foreign_key_check`.
7. Reconcile the restored schema with the migration ledger before retrying. Never blindly re-run or manually edit the ledger.

D1 Time Travel is documented at <https://developers.cloudflare.com/d1/reference/time-travel/>. Retention depends on the account plan and must be checked at execution time. The D1 database API's `version: production` field denotes the newer D1 storage subsystem; it does **not** mean this application database is the production environment.

Do not create ad hoc reverse SQL for these migrations. If a rollback is required, use the approved Time Travel restore procedure or a reviewed forward-fix migration.

## 6. Acceptance evidence required

The staging migration is accepted only when the evidence bundle contains:

- Target database name and UUID.
- Pre-migration and post-migration schema metadata.
- Wrangler migration-list output before and after apply.
- Complete migration apply output.
- Foreign-key check output.
- SAAAE and provisioning table/index/trigger inventory.
- Proof the legacy `lingo_api_rate_limits` table remains present.
- D1 integration-test output from the exact PR commit.
- Staging Worker version and health-check response, if a staging deployment is separately approved.
- Independent reviewer sign-off.

A successful SQL apply alone is not product acceptance, release authorization, or production promotion.

## 7. Explicit non-actions

This runbook does not authorize production migration, data transfer, deletion, secret rotation, DNS changes, Worker deployment, route attachment, or lifting the G02 protected hold.


## Migration 0004 — immutable game ruleset digest

Migration `migrations/0004_lingo_game_ruleset_digest.sql` adds `ruleset_digest` to `lingo_game_sessions` without dropping or rewriting existing rows. Existing rows receive an empty value and are intentionally not eligible for replay under the new versioned 5×3 contract. New settlements persist a 64-character lowercase SHA-256 digest of the exact server-owned weighted-symbol and paytable configuration, grid geometry, and Option 2 allocation contract.

Apply only after confirming the live staging schema and current Time Travel bookmark. Verify:
- `PRAGMA table_info(lingo_game_sessions)` includes `ruleset_digest`.
- Existing session rows remain unchanged apart from the additive default value.
- New session writes reject malformed non-empty digests.
- Idempotency replay returns the original settlement only when game ID, rules version, ruleset digest, wager, and idempotency key all match; changed ruleset digest must conflict.
- No production database is a target.
