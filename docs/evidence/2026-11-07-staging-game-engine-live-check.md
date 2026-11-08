# LINGO Game Engine Staging — Live Resource and D1 Transaction Evidence

**Captured:** 2026-11-07 (Cloudflare control-plane timestamps are UTC)  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `staging/server-authoritative-game-foundation-2026-11-07`  
**PR:** #498  
**Source commit correlated to Worker version 2:** `6227d72d1af65ef83d79e41e18bd89dcc7d329c4`  
**Environment:** Dedicated staging only  
**Production mutation:** None

## Cloudflare resources

| Resource | Observed value |
|---|---|
| D1 database | `lingo-game-engine-staging-20261107` |
| D1 database ID | `793ab138-7818-47c9-ad01-b319ad34a8c5` |
| D1 created | `2026-11-07T18:06:58.147Z` |
| D1 jurisdiction | US |
| D1 created region | ENAM |
| Worker | `lingo-game-engine-staging` |
| Active Worker version | 2 |
| Active Worker version ID | `feb07379-9517-4b06-9f47-5eb1b50aa309` |
| Active deployment ID | `2b771227-9c7f-49a1-a935-9806646c7c09` |
| Deployment traffic allocation | 100% of this isolated staging Worker |
| workers.dev subdomain | Enabled; previews disabled |
| Custom production routes | None |

Worker version 2 carries Cloudflare annotations for the repository URL and source commit above. Its upload bundle normalizes relative module import paths for the Cloudflare module upload; the committed source remains the canonical implementation.

Worker bindings observed from Cloudflare settings:
- D1 binding `DB` → the dedicated staging D1 ID above.
- `FIREBASE_PROJECT_ID` → `lingo-legacy-production`.
- `ENVIRONMENT` → `staging`.

The Worker is not attached to `thelingolegacy.com`, `www`, or any production custom domain. The 100% allocation applies only to the new staging Worker.

## Database schema observed

Application tables:
- `lingo_game_accounts`
- `lingo_game_wallets`
- `lingo_game_sessions`
- `lingo_wallet_ledger`
- `lingo_game_progression`

Triggers:
- `lingo_wallet_ledger_validate_insert`
- `lingo_wallet_ledger_apply_insert`
- `lingo_wallet_ledger_no_update`
- `lingo_wallet_ledger_no_delete`

Indexes:
- `idx_lingo_game_sessions_uid_created`
- `idx_lingo_wallet_ledger_uid_created`

## Live D1 transaction exercise

A synthetic staging-only identity `__staging_integration_test__` was provisioned with 1,000 integer credit units. No real user or production account was used.

Successful transaction:
- Wager debit: 25 units.
- Payout credit: 50 units.
- Final wallet: 1,025 units.
- Session status: `settled`.
- Session balance snapshot: 1,025 units.
- Ledger events: 2.

Overdraft exercise:
- Attempted debit: 5,000 units against a 1,025-unit wallet.
- D1 rejected the ledger insert with `INSUFFICIENT_FUNDS`.
- The D1 batch rolled back the pending session.
- Follow-up query confirmed zero overdraft session rows and the wallet remained unchanged.

These results verify the D1 schema and ledger-trigger behavior in the dedicated staging database. They do not certify production concurrency, game RTP, or a live customer journey.

## Runtime and release limitations

- Worker version 2 and its 100% staging deployment are confirmed by Cloudflare control-plane records.
- The workers.dev subdomain is enabled. An external HTTP probe of `/healthz` was not successfully retrieved through the available browser/network path in this session; runtime endpoint acceptance remains pending.
- Local Node validation: 13/13 tests passed across Firebase JWT signature/claim validation, Worker health/auth-fail-closed routing, and game-engine primitives.
- Local Python SQLite migration/ledger validation passed: migration rerun, ledger updates, overdraft rollback, and append-only protections.
- GitHub Actions for the branch still conclude `startup_failure` with no executed jobs. Local tests are not a substitute for CI evidence.
- The Cloudflare version is annotated with the exact GitHub source commit. A successful Wrangler CI build and provider-executed test run remain outstanding.
- Firebase browser client configuration still contains placeholders elsewhere in the repository. No client login flow or authenticated frontend integration is certified by this staging Worker.

## Safety boundary

This is a staging virtual-credit vertical slice. It has no Stripe webhook, no wallet top-up, no redeemable balance, no cashout, and no real-money wagering. The provisional three-reel paytable is not a certified production game configuration. Do not connect it to the flagship production domain or production wallet.


## Follow-up branch changes — 2026-11-08

The historical Cloudflare control-plane snapshot above records the deployed Worker version at capture time. It does **not** mean the subsequent PR #498 source edits have been deployed. The PR branch now contains a targeted correction to the Worker module's duplicate/incomplete function declaration and a runtime guard that rejects staging authentication if the Firebase project binding is absent or equals `lingo-legacy-production`. Regression coverage was added for both unsafe binding cases.

The Wrangler configuration is a standalone staging config file (`wrangler.game-engine-staging.jsonc`), not a `wrangler.toml` with a nested `[env.staging]` profile. It already binds the dedicated staging D1 database ID shown above. Validate/build it with:

```bash
npx --yes wrangler@4 deploy --dry-run --config wrangler.game-engine-staging.jsonc
```

Do not add `--env staging` to that command unless a named environment is explicitly added to the config. Do not deploy this branch until a dedicated Firebase staging project ID has been created and bound to the staging Worker. The currently deployed dashboard binding remains the production project ID until that separate staging configuration change is made; the new guard exists in source but is not active in the deployed Worker until a reviewed staging deployment.

GitHub Actions runs observed after the earlier commits still failed at workflow startup with zero jobs. Therefore none of the new source checks, Wrangler dry-run, or regression tests has yet been executed by GitHub Actions.


### Local follow-up validation — 2026-11-08

- Node.js v22 syntax check of the corrected Worker module: passed.
- Isolated Worker route regression harness: 6/6 passed. The harness used stubbed downstream Firebase/D1 modules; it verifies bearer parsing, health response behavior, fail-closed handling for absent/production Firebase project IDs, and unknown-route behavior. It is not a full integration test of Firebase signature verification or D1 settlement.
- Full repository Node/Python suites were not executed in this runtime. A root `package.json` is absent on this branch, so the proposed `npm run check`, `npm run lint`, and `npm run build` commands are not defined here.
- Wrangler dry-run was not executed locally because this runtime cannot resolve external package hosts to obtain Wrangler. The dry-run is now included in the GitHub Actions workflow, but GitHub has not started any job for the latest run.
