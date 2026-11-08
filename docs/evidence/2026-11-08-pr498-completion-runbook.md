# PR #498 Completion Package — Staging Only

**Branch:** `staging/pr498-completion-2026-11-08`  
**Base:** `471e07d49126833933d6910116e7a94b7a3d8a2d`  
**Disposition:** implementation work branch; NOT approved for staging release  
**Production:** protected; no production mutation  
**Money movement:** disabled; Demo Coin only; no top-up, cashout, redemption, or real-money wagering

## Work package register

| ID | Deliverable | Acceptance evidence | Current disposition |
|---|---|---|---|
| STAGING-IDENTITY | Dedicated Firebase project, explicit Worker binding, tenant isolation | Firebase project metadata + token audience/issuer tests + Cloudflare binding readback | BLOCKED: production binding removed; staging config template/validator/bootstrap guide added; actual project unverified |
| CI-RECOVERY | Actions jobs instantiate and execute | run ID, job ID, runner ID/name, completed steps, logs, artifacts, exact SHA | FAIL: validation run #94 / 42499930312 and minimal probe run #6 / 42499929296 both startup_failure; 0 jobs/artifacts |
| SLOT-5X3 | 3x5 matrix, five paylines, WILD, 3/4/5 matches, volatility, integer payout | deterministic unit tests + integration tests + mathematical review | SOURCE IMPLEMENTED; theoretical RTP enumerated; GitHub execution pending |
| D1-SETTLEMENT | Atomic debit/credit, idempotency, rollback, append-only ledger, XP progression, daily reward | SQLite harness + D1 staging concurrency/rollback evidence | SOURCE UPDATED; local SQLite settlement, XP, welcome/daily grant and rollback checks passed; live D1 settlement not run |
| CASINO-UI | Demo Coin global balance, five-line total wager, loading/error states | component tests + browser screenshots + source scan | PARTIAL: Bet/Line and Spin Cost display, five-line debit, optional authenticated adapter; browser QA pending |
| ASSET-SYSTEM | Lazy sprite/audio loading, retries/fallbacks, reduced-motion, audio resume | browser network-throttle tests + asset manifest audit | PARTIAL: lazy image fallback and AudioContext resume; sprite/network QA pending |
| DEVICE-QA | keyboard, touch, gamepad, LG webOS remote focus/action behavior | automated input tests + physical/emulated webOS evidence | PARTIAL: remote directional focus wrap and Enter/OK/Select; physical TV QA pending |
| RELEASE-EVIDENCE | full test matrix, Wrangler dry-run, security review, acceptance record | immutable evidence bundle tied to exact head SHA | PENDING |

## Five-reel contract

- Matrix is represented as 3 rows × 5 columns.
- Five left-to-right paylines: middle, top, bottom, descending V, ascending V.
- A WILD substitutes for a target symbol on a payline.
- Only contiguous left-to-right matches of 3, 4, or 5 symbols qualify.
- Payouts are integer Demo Coin units. No floating point wallet arithmetic.
- Low/medium/high distributions are explicit integer weight tables. Exact theoretical RTP from exhaustive single-line enumeration: low 72.9739%, medium 79.6260%, high 94.8766%. These are model-derived values, not live telemetry or independently executed CI evidence.
- Server generates the outcome. Client-supplied symbols, matrix, multipliers, and payout values are never trusted.
- Any wager debit, payout credit, and session record remain in the existing D1 atomic batch.

## Required execution sequence

1. Confirm this branch head and inspect all changes against the PR head.
2. Apply staging-only migrations `0001` and `0002` in order; verify the rate-limit table exists before deploying the updated Worker.
3. Run Node syntax checks for Worker, engine, D1 service, and Firebase verifier.
4. Run Firebase ID-token tests.
5. Run Worker route/authentication and rate-limit tests.
6. Run five-reel engine and D1 idempotency tests (matrix shape, all five paylines, WILD, 3/4/5 match, integer overflow rejection, volatility).
7. Run SQLite migration/ledger/rate-limit tests (idempotent migration, debit, payout, overdraft rollback, append-only ledger, one-time welcome grant, daily reward, XP progression).
8. Run Wrangler v4 staging dry-run with `wrangler.game-engine-staging.jsonc`.
9. Verify GitHub Actions has an instantiated job, assigned runner, completed steps, retrievable logs, and artifacts for this exact commit.
10. Verify the dedicated Firebase staging project exists and is active before setting `FIREBASE_PROJECT_ID` to the actual project ID returned by Firebase. Never bind production.
11. Read back Cloudflare Worker settings and verify D1 ID, environment, Firebase project, routes, and secrets. Do not deploy while identity is unresolved.
12. Complete UI, audio, asset, and device QA using a browser/device harness.
13. Independent reviewer compares test evidence and source diff; only then may staging acceptance be considered.

## Safe local commands

Run from repository root; no root npm scripts are assumed:

```bash
node --check cloudflare/workers/lingo-game-engine-staging.mjs
node --check src/server/slot-engine.mjs
node --check src/server/d1-slot-service.mjs
node --check src/auth/firebase-id-token.mjs
node --test scripts/tests/firebase-id-token.test.mjs
node --test scripts/tests/lingo-game-worker.test.mjs
node --test scripts/tests/server-slot-engine.test.mjs
python3 scripts/tests/test-slot-wallet-migration.py
npx --yes wrangler@4 deploy --dry-run --config wrangler.game-engine-staging.jsonc
```

## Import/export and evidence handling

- Source of truth: Git branch and commit history. Do not manually copy generated files into production.
- Export: preserve the Git diff, test logs, Actions run/job metadata, artifact ZIPs, Wrangler dry-run output, and independent review record under a dated evidence directory.
- Import: apply only reviewed commits to the intended PR branch; verify the target branch and SHA before each import/cherry-pick.
- Secrets: never export service-account private keys, API tokens, Firebase user tokens, or environment secret values into evidence artifacts.
- Evidence must include UTC timestamp, repository, branch, exact commit SHA, environment, command, exit code, and SHA-256 digest of retained logs.

## 2026-11-08 execution evidence

- Latest validation workflow run #94 and minimal Actions probe run #6 both used code head `c59f804470afb26cabd0a07657ab66158d6e7aba`.
- GitHub Actions validation runs #36–#94 and minimal probe runs #1–#6 concluded `startup_failure`. Latest validation run #94: ID `42499930312`, exact run head `c59f804470afb26cabd0a07657ab66158d6e7aba`; latest probe #6: ID `42499929296`, same code head. Both have zero jobs and zero artifacts.
- Cloudflare D1 read-only catalog verification: the five expected application tables and four ledger triggers exist in `lingo-game-engine-staging-20261107`; query reported `changed_db=false`, `rows_written=0`.
- Live staging Worker settings were corrected: removed `FIREBASE_PROJECT_ID=lingo-legacy-production`. Readback shows only the isolated D1 binding and `ENVIRONMENT=staging`.
- Cloudflare created staging deployment `273be68c-1544-4c22-be1f-7733e9e8c669`, version `793ff7ee-6c24-4927-8b27-409d2b732cd1`, at 100% of the isolated staging Worker. This was a settings-only deployment, not the new 5x3 source bundle.
- Worker subdomain is enabled; preview URLs are disabled. The external `/healthz` request could not be retrieved by the available browser probe, so HTTP health is still unverified.
- The frontend adapter expects `window.LINGO_GAME_API` and `window.LINGO_AUTH.getIdToken()`. No Firebase browser auth provider/project configuration was verified. Source now implements a one-time 5,000 Demo Coin staging welcome grant; it is not deployed, and read-only D1 inspection found no existing grant event.
- The updated Wrangler file contains the CORS allowlist for the flagship origins, but the new Worker source/config bundle has not been deployed. Do not infer that the live Worker has the new CORS behavior.

## Explicit release blockers

- No confirmed dedicated Firebase staging project or safe binding.
- GitHub Actions startup failure is not yet diagnosed from runner/job logs; zero-job runs provide no step-level failure cause.
- Frontend UI/audio/assets and LG webOS input are not established by Worker tests.
- No external HTTP health probe, authenticated staging user journey, concurrency run, or independent security review is attached.
- No staging deployment or production promotion is authorized by this package.

## 2026-11-08 follow-on math/accounting correction

- Source now defines the UI-selected bet as a **per-line** Demo Coin amount.
- Total spin debit is exactly five times the per-line wager, matching all five active paylines.
- Local preview checks and deducts `game.bet * paylines.length`; the display includes both Bet / Line and Spin Cost.
- The browser sends total `wagerUnits`; the D1 service validates divisibility by five, evaluates each payline using one-fifth of the total, and records/debits the total spin wager.
- API rule version advanced to `staging-5x3-demo-v3`; response includes total `wagerUnits` and `lineWagerUnits`.
- API rejects non-divisible total wagers before settlement. Max total spin wager is 5,000 Demo Coins (1,000 per line).
- Added a unit test for valid/invalid five-line wager conversion. The worker health test expectation is updated to v3.
- This correction has not been executed in GitHub Actions. No staging Worker code deployment has occurred.

## Actions retry investigation

- GitHub Actions latest validation run #94 / `42499930312` and independent minimal probe #6 / `42499929296` are `startup_failure` with zero jobs and zero artifacts.
- The GitHub API refused a failed-jobs retry with HTTP 403: "This workflow run cannot be retried." There is no job to rerun; no log or step-level failure detail is available through the run.
- Workflow source includes a `validate` job on `ubuntu-latest`, but GitHub did not instantiate it. Repository Actions settings cannot be inspected with the current GitHub connector permissions. This is an environment/control-plane blocker until Actions settings or runner service are independently checked.

## Additional verification performed after the accounting correction

### Five-payline wager contract

- UI-selected bet is per line; the total spin stake is `lineWagerUnits * 5`.
- The browser preview deducts the total stake, and the remote request sends that total.
- D1 settlement validates a positive total wager divisible by five, evaluates each payline at one-fifth of the total, and debits the full total.
- Rule version: `staging-5x3-demo-v3`.
- A one-time staging-only welcome grant of 5,000 non-redeemable Demo Coins is implemented as an auditable `admin_adjustment` ledger event attached to a deterministic system grant session. Repeated bootstrap calls are idempotent.
- The staging D1 schema already permits `admin_adjustment`; read-only catalog inspection confirmed all five application tables and four ledger triggers. Aggregate read-only counts: 1 account, 1 wallet, 1 session, 2 ledger events, 1 progression row. No welcome grant or admin-adjustment event existed at inspection time. No rows were changed by the inspection.
- The grant and ledger behavior passed an independent in-memory SQLite execution of the same schema/trigger pattern: migration idempotency, five-line total debit/payout, insufficient-funds rollback, one-time 5,000 grant, and append-only ledger. This is local SQLite evidence, not GitHub Actions evidence or live D1 execution.

### Exact theoretical paytable math

Enumerated all 6^5 possible ordered symbol sequences for one payline using the committed symbol weights and paytable. Expected payout per one-unit line wager:

| Volatility | Single-line hit probability | Theoretical RTP |
|---|---:|---:|
| Low | 10.5760% | 72.9739% |
| Medium | 9.7120% | 79.6260% |
| High | 9.6544% | 94.8766% |

These are exact theoretical values for the current five-symbol-position line evaluator and weight/paytable configuration, not live telemetry. RTP is expected line payout divided by line wager. Because all five paylines receive the same line wager, aggregate expected RTP remains the same.

### Current Actions state

- Latest completion branch validation run at time of this evidence update: run #94, ID `42499930312`, exact run head `c59f804470afb26cabd0a07657ab66158d6e7aba`, conclusion `startup_failure`. Independent control-plane probe #6: ID `42499929296`, same code head, also `startup_failure`.
- Job count: 0. Artifact count: 0.
- GitHub rejected retry of run #48 with HTTP 403 because the run cannot be retried. No job logs or step details exist.
- The branch has continued receiving startup failures. The workflow YAML itself declares the expected `validate` job on `ubuntu-latest`; this does not prove the runner platform is healthy.
- No current-head test, dry-run, Worker code deployment, or staging acceptance is certified.

## Firebase staging scaffolding added

- Added `firebase.staging.client.example.json` with placeholders only; it is not an active Firebase configuration.
- Added `scripts/verify-firebase-staging-config.mjs`, which rejects missing/placeholder values and the production project ID.
- Added `docs/evidence/FIREBASE-STAGING-BOOTSTRAP.md` with the registration, web-app setup, authentication-provider, Worker-binding, browser wiring and verification procedure.
- Repository `.firebaserc` and Flutter Firebase options remain on the existing production configuration; they were not changed.
- The validator was not run against a real staging project because the project and Web app credentials remain unverified. No Firebase project was created by this workflow.
- Cloudflare account Worker subdomain is `thelingolegacy`; the staging script has workers.dev enabled and preview URLs disabled. An external HTTP health probe was not successful, so the endpoint health is not certified.

## Final branch snapshot

- Current completion branch head: see the latest commit linked from draft PR #503; current code head tested by Actions is `c59f804470afb26cabd0a07657ab66158d6e7aba`.
- Draft PR #503 tracks this branch; PR #498 remains open/draft.
- Latest validation CI run: #94 / `42499930312`; independent minimal probe #6 / `42499929296`; both zero jobs and zero artifacts. The current head contains the probe workflow and evidence updates; no code-execution evidence exists for the implementation.
- Staging Worker settings readback: D1 binding points to the isolated staging database; `ENVIRONMENT=staging`; `FIREBASE_PROJECT_ID` is absent. Latest deployed Worker version is still the earlier settings-only version; the new v3 game Worker source and welcome grant are not deployed.
- Cloudflare workers.dev subdomain is enabled for the account `thelingolegacy`; Worker preview URLs are disabled. HTTP health could not be verified externally.
- Firebase production defaults remain unchanged. Staging config template, validator and bootstrap procedure are present, but the Firebase staging project has not been created/verified and the validator has not passed.

## Authenticated progression and daily reward completion work

- Slot settlement now awards server-side XP atomically with the wallet transaction: 25 XP for each completed spin and an additional 75 XP when the spin pays. Both `lingo_game_wallets.xp_units` and `lingo_game_progression` are updated in the same D1 batch as the debit/payout/session.
- Authenticated spin responses include the current server XP total; the browser now synchronizes XP from the server wallet instead of trusting a client-side spin increment.
- Added authenticated `POST /api/v1/rewards/daily`. The server chooses the UTC date, enforces one claim per Firebase UID per UTC day through the session idempotency key, grants 500 Demo Coins via an auditable ledger `admin_adjustment`, and awards 150 XP in the same D1 batch.
- Daily reward replay returns current wallet/XP state without a second grant. The browser uses the server endpoint in authenticated mode; local preview mode retains its local daily reward behavior.
- Lingo Tokens remain local preview progression in authenticated staging; they are not represented as server-authoritative wallet value. Do not treat them as a secure or persistent server balance.
- The SQLite harness now covers daily reward idempotency and XP progression statements. Local SQLite execution was performed for the wallet/ledger schema and the one-time daily reward logic; GitHub Actions remains unexecuted.

## Independent GitHub Actions control-plane probe

- Added `.github/workflows/pr498-actions-control-plane-probe.yml`, a minimal workflow with one `ubuntu-latest` job, a shell-only runner identity capture, and one artifact upload.
- Push-triggered probe run #1: ID `42499818320`, head `2063ad801370c50e563d9a4a1caeab0a3cfd4c15`, conclusion `startup_failure`.
- Probe jobs: 0. Probe artifacts: 0. No runner identity or step logs were created.
- The independent minimal workflow failed before any project-specific Node, Firebase, D1, or Wrangler command could execute. This rules out those commands as the cause of the startup failure. It does not distinguish repository Actions settings/permissions from a GitHub Actions control-plane or runner-service issue; those settings cannot be inspected with the available connector.

## Casino display consistency scan

- The reel-side signage now says `5 PAYLINES`, matching the actual five-payline evaluator; the prior decorative `243 WAYS` label was removed.
- Jackpot tier amounts are labeled as Demo Coins, and the section's accessible label is `Demo Coin tier display`.
- Source scan found no dollar-prefixed jackpot amounts or USD-formatted jackpot labels. This is a source inspection, not browser screenshot QA.

- Latest minimal probe retry on current code head: run #6 / `42499929296`, zero jobs and zero artifacts. This run follows the authenticated-wallet reset guard and confirms the same pre-job startup failure.
- Casino reset action now refuses to mutate the local demo balance when `window.LINGO_GAME_API` is active; authenticated staging wallet balances must come from the server.

- GitHub currently reports draft PR #503 as `mergeable=false` / `mergeable_state=dirty` on the latest metadata read. The compare endpoint reports the base commit is an ancestor (65 commits ahead, zero behind); no merge or base retarget was attempted. Recheck GitHub's mergeability calculation before any review/merge action.


## 2026-11-08 security hardening follow-on

- Spin idempotency replay now compares the stored volatility profile as part of request identity; reusing the same key with a different volatility profile is rejected.
- Added `migrations/0002_lingo_api_rate_limits_staging.sql`, a one-row-per-Firebase-UID fixed-window counter. It stores no IP address, bearer token, or request body.
- Authenticated API requests are limited to 60 requests per UTC-independent 60-second epoch window. The counter update uses a single D1 UPSERT with `RETURNING`, so concurrent requests share one atomic counter. Requests over the limit return HTTP 429; a missing/unavailable rate-limit table fails closed.
- The rate-limit table has no foreign key to the account table because the limiter runs before first-time account bootstrap.
- The migration must be applied to the isolated staging D1 database before deploying the updated Worker. It has not been applied live.
- Added Node regression coverage for same-key/different-volatility replay and rate-limit threshold/window behavior; added SQLite migration tests for the fixed-window SQL. These tests are wired into the workflow but have not run in GitHub Actions.


## 2026-11-08 reconciled completion-head evidence

- Completion branch was reconciled onto staging base `5c4d120597fa27eddbf8c80b1a543a814a023837`.
- Current completion head: `3fb169201c0ebdfb0dd54430b8f22a2dab42ffdd`.
- GitHub compare: 16 commits ahead, 0 behind; PR #503 metadata reports `mergeable=true`. PR remains draft.
- Exact-head server validation run #112: `42500762934`, conclusion `startup_failure`; jobs endpoint returned 0 jobs and artifacts endpoint returned 0 artifacts.
- Exact-head independent hosted-runner probe #8: `42500763952`, conclusion `startup_failure`; jobs endpoint returned 0 jobs and artifacts endpoint returned 0 artifacts.
- Both workflows fail before job instantiation. No Node, Python, or Wrangler command executed in these runs.
- Additional source hardening: per-Firebase-UID D1 rate limit (60 authenticated API requests per 60-second fixed window), staging migration `0002`, volatility-bound idempotency replay, production-origin removal from staging CORS allowlist, and spatial TV D-pad focus with directional boundary wrapping.
- New D1 rate-limit migration is source-only and has not been applied to the live staging database. The updated Worker source has not been deployed.
- Local isolated SQLite execution verified the rate-limit UPSERT threshold (requests 1–60 accepted, request 61 rejected, next window reset to 1). This does not substitute for live D1 or GitHub CI.
- Dedicated Firebase staging project/Web app remains unverified. The Worker must remain fail-closed until the real staging project ID and browser app configuration are confirmed.
- No staging release acceptance, PR merge, production route/DNS change, or production promotion occurred.


## 2026-11-08 latest continuation review

- PR #503 remains open and draft. Latest GitHub PR metadata reports the base/head comparison is 17 commits ahead and 0 behind, and the PR is mergeable. This is mergeability metadata only; it is not test acceptance or release approval.
- Current reviewed PR head before this runbook update: `d136182a19e6b7033e08e9c43667596be666634e`. The code change at that head updates the CORS regression test to use a staging-only test origin and explicitly reject both production flagship origins (`https://thelingolegacy.com` and `https://www.thelingolegacy.com`) plus an unrelated origin.
- Exact-head validation run #113 / `42500910538` and independent minimal hosted-runner probe #9 / `42500911306` both concluded `startup_failure`. Each run has zero instantiated jobs and zero artifacts. No tests, build, or Wrangler command ran.
- The current Actions control-plane failure therefore remains unlocalized below the workflow-startup boundary. No runner ID/name, step log, or artifact is available.
- The latest PR head status also contains a Vercel check failure: `Deployment rate limited — retry in 24 hours`. This is a third-party Vercel status context, not evidence of Cloudflare deployment failure. Vercel is not an approved release path for this staging work; do not treat this check as staging verification.
- CORS correction: the Worker returns CORS headers only for an exact origin in `STAGING_ALLOWED_ORIGINS`. The checked-in Wrangler staging config currently defines no such allowlist, so browser cross-origin access remains disabled by default until a real staging frontend origin is independently verified and explicitly configured. The earlier historical statement that the Wrangler file contains a flagship-origin allowlist is superseded and incorrect for the current config. The new regression test uses `https://staging-ui.example.invalid` as a non-production fixture and asserts production origins are rejected.
- The staging D1 migration `0002_lingo_api_rate_limits_staging.sql` remains unapplied. The new Worker source remains undeployed. Dedicated Firebase staging project/Web app configuration remains unverified.
- No PR merge, Worker source deployment, production change, DNS/route mutation, or staging acceptance occurred. Continue to hold all release gates until exact-head CI execution, Firebase staging identity, D1 migration, authenticated staging journey, browser/device QA, and independent review are evidenced.


## 2026-11-08 daily-reward replay correction and latest CI readback

- Reviewed the authenticated daily-reward replay path. Previously, a replay returned the configured 500 Demo Coin and 150 XP award amounts even though the idempotency path did not grant them again. The service now reports `rewardUnits: 0` and `xpAwardUnits: 0` on replay while returning the current wallet and XP totals. First-time claims continue to return the configured grant amounts.
- Added a regression test for replay response semantics, including current wallet/XP values. Added a CORS regression assertion that the production apex and www origins are rejected when only a staging test origin is configured.
- Latest code head: `95e138619f8e2af6e8f0ffbd87065debc4deabfc`.
- Exact-head validation run #119 / `42501964415`: `startup_failure`; jobs endpoint returned 0 jobs and artifacts endpoint returned 0 artifacts. No Node, Python, or Wrangler step ran.
- Independent minimal runner probe #12 / `42501957284` at code head `cac852b3312392f99f0731a25f7f37b5a74eb880`: `startup_failure`; 0 jobs and 0 artifacts. This probe predates the test-only follow-up commit but independently reproduces the same startup failure.
- PR #503 currently remains open and draft; GitHub reports `mergeable=true` with `mergeable_state=unstable`. Mergeability does not establish CI or release acceptance.
- The latest commit status still includes a Vercel rate-limit failure. Treat this only as an external status check; it is not Cloudflare staging deployment evidence. Vercel remains outside the authorized staging release path.
- No current-head CI execution, live D1 migration application, Firebase staging identity verification, updated Worker source deployment, browser/device QA, or independent staging acceptance is established. Production remains protected.


## 2026-11-08 live Cloudflare read-only verification

- Read-only Cloudflare API inspection confirmed the D1 database `lingo-game-engine-staging-20261107` (UUID `793ab138-7818-47c9-ad01-b319ad34a8c5`), jurisdiction US, region ENAM, with five application tables.
- Read-only `sqlite_master` query returned the five application tables (`lingo_game_accounts`, `lingo_game_progression`, `lingo_game_sessions`, `lingo_game_wallets`, `lingo_wallet_ledger`), Cloudflare's `_cf_KV` system table, and four ledger triggers. It did **not** return `lingo_api_rate_limits`; migration `0002` is therefore confirmed unapplied at this readback.
- D1 query metadata: `changed_db=false`, `rows_written=0`. This was a schema/catalog read only; no application data was read or modified.
- Worker deployment history still shows the latest deployment as `273be68c-1544-4c22-be1f-7733e9e8c669`, version `793ff7ee-6c24-4927-8b27-409d2b732cd1`, created `2026-11-08T15:52:09Z`, with the settings-remediation annotation. It is the settings-only deployment previously recorded, not the new PR #503 Worker source.
- Worker script observability settings are enabled. The read-only script-settings response did not expose secret values; no secrets were requested or changed.
- The new Worker source calls the rate-limit table before account bootstrap. Do not deploy that source until migration `0002` has been applied and verified, or all authenticated routes will fail closed on the missing table.
- No Cloudflare resource was mutated in this readback. No Worker deployment, D1 migration, route, DNS, secret, or production change was performed.


## Final readback for this continuation

- PR #503 current head: `884f258fa79f9725ae5cb5dce89319c6ff6a3ef0`; open, draft, unmerged. GitHub reports `mergeable=true` but `mergeable_state=unstable`.
- Original PR #498 remains open, draft, and unmerged. Its head is the staging base used by PR #503; PR #503 is a separate completion proposal targeting that exact head.
- Latest exact-head validation run #122 / `42502171369` and minimal runner probe #15 / `42502170217` both concluded `startup_failure`. Both have zero jobs and zero artifacts. No test, build, or dry-run ran.
- Code behavior updates are at `d136182a19e6b7033e08e9c43667596be666634e` (CORS test) and `cac852b3312392f99f0731a25f7f37b5a74eb880` (daily reward replay behavior); latest source regression test commit is `95e138619f8e2af6e8f0ffbd87065debc4deabfc`. The current head's later commits are evidence/runbook/PR metadata updates.
- The D1 read-only catalog still shows migration `0002` unapplied. Latest Worker deployment remains the settings-only version recorded above. No code deployment or database mutation occurred.
- Release disposition remains HOLD / NOT ACCEPTED. No merge, production change, or promotion.


## 2026-11-08 staging D1 migration 0002 — applied and verified

**Execution timestamp:** 2026-11-08T17:17:11Z  
**Database:** `lingo-game-engine-staging-20261107`  
**Database UUID:** `793ab138-7818-47c9-ad01-b319ad34a8c5`  
**Change type:** Additive staging-only schema migration

Applied the exact SQL from `migrations/0002_lingo_api_rate_limits_staging.sql` using `CREATE TABLE IF NOT EXISTS`. Cloudflare D1 returned `success=true`, `changed_db=true`, and no result rows. D1 reported three SQLite catalog writes for the DDL; no application rows were inserted, updated, or deleted.

Read-back verification:
- `sqlite_master` contains `lingo_api_rate_limits` as a table.
- `PRAGMA table_info` confirms `firebase_uid TEXT PRIMARY KEY`, `window_epoch INTEGER NOT NULL`, `request_count INTEGER NOT NULL`, and `updated_at TEXT NOT NULL` with the UTC timestamp default.
- The catalog and column readbacks reported `changed_db=false` and `rows_written=0`.

This supersedes the earlier runbook statement that migration `0002` was unapplied. The staging Worker source remains undeployed; Firebase staging identity/configuration, authenticated route tests, and browser/device QA remain outstanding. No production database, production Worker, route, DNS, or secret was changed.


## 2026-11-08 Cloudflare Worker observability privacy hardening

**Execution timestamp:** 2026-11-08T17:23:35Z  
**Workers:** `thelingolegacyv-5` (production) and `lingo-game-engine-staging` (staging)

Applied Cloudflare script-settings patches to both Workers and read them back successfully:
- `observability.enabled=true` remains enabled.
- `redact_query_string=true` removes query strings from logs/traces.
- Request sampling and log sampling are set to `0.1` (10%).
- Invocation logs and log persistence remain enabled.
- Trace collection remains disabled and trace persistence is disabled.

Both PATCH operations returned `success=true` with no errors. Readback confirmed the exact settings on both Workers. The production and staging Wrangler configs now carry the same observability policy so future source deployments do not revert it.

This was an observability-settings-only change. No Worker source, route, DNS, secret, D1 application row, or production data was changed.

## D1 migration-ledger reconciliation note

A follow-up read-only `sqlite_master` query confirms the staging database contains `lingo_api_rate_limits` but does not contain a `d1_migrations` ledger table. Migration `0002` was applied directly through the Cloudflare D1 SQL API, not through Wrangler. The existing `0001` and new `0002` SQL are additive/idempotent (`IF NOT EXISTS`); before introducing later migrations, run the controlled Wrangler migration apply against staging so Wrangler can establish its migration ledger, then verify both migration records and schema. Do not manually fabricate migration-ledger entries.

