# LINGO Game Engine Staging — Live Resource and D1 Transaction Evidence

**Captured:** 2026-11-07 (Cloudflare control-plane timestamps below are UTC)  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `staging/server-authoritative-game-foundation-2026-11-07`  
**PR:** #498  
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
| Worker version | 1 |
| Worker version ID | `feb80240-f557-483f-b48c-c271a97a1da9` |
| Deployment ID | `e984368f-45df-4a70-bf92-00683cdd9371` |
| Traffic allocation | 100% of this isolated staging Worker |
| workers.dev subdomain | Enabled; previews disabled |
| Custom production routes | None |

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

- Worker upload and 100% staging deployment are confirmed by Cloudflare control-plane records.
- The workers.dev subdomain is enabled. An external HTTP probe of `/healthz` was not successfully retrieved through the available browser/network path in this session; runtime endpoint acceptance remains pending.
- Local Node tests cover the Worker health response, missing-token 401 behavior, and unknown-route 404 behavior.
- GitHub Actions for the branch still conclude `startup_failure` with no executed jobs. Local tests are not a substitute for CI evidence.
- The Cloudflare upload preceded the final GitHub Worker wrapper commit; exact immutable source-to-version correlation and a Wrangler-built redeployment remain outstanding.
- Firebase browser client configuration still contains placeholders elsewhere in the repository. No client login flow or authenticated frontend integration is certified by this staging Worker.

## Safety boundary

This is a staging virtual-credit vertical slice. It has no Stripe webhook, no wallet top-up, no redeemable balance, no cashout, and no real-money wagering. The provisional three-reel paytable is not a certified production game configuration. Do not connect it to the flagship production domain or production wallet.
