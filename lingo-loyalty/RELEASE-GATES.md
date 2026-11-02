# LINGOloyalty release gate register

Current checkpoint: 2026-11-02. This register is evidence-led; source presence and preview deployment do not imply acceptance.

| Gate | Required evidence | Current state |
|---|---|---|
| Source isolation | Dedicated feature branch and package; no production bindings | **Implemented** on `feature/lingo-loyalty-staging-ledger-2026-11-02`; PR #435 remains draft |
| Ledger schema | D1 migrations, constraints and append-only behavior | **Migrations 0001–0003 applied and objects verified** in dedicated staging D1. Separate ephemeral D1 runtime checks passed: separated balances, duplicate idempotency no-op, negative-balance rejection, unit/event mismatch rejection, and append-only update rejection. Ephemeral database deleted after tests. |
| D1 staging | Dedicated isolated database, correct jurisdiction, no production binding | **Provisioned**: `lingo-loyalty-staging`, UUID `54ce928b-d540-4bce-816f-e89cb30b8fdf`, U.S. jurisdiction. Wallet, ledger, coupon and rate-limit tables have no remaining test rows. Not bound to a Worker. |
| Rate limiting | Atomic per-user/per-route window counter and cleanup | **D1 SQL runtime check passed**: 61 sequential upserts resulted in a capped count of 60; test row deleted. Daily cleanup handler and cron are source-configured, not deployed. |
| API security source | Firebase ID token verification, signed provider callbacks, replay controls, wallet-state checks | **Implemented in source draft**: Firebase RS256 JWKS verification; timestamped HMAC-SHA256 signatures for ad, game and merchant callbacks; unique event/idempotency constraints; active-wallet checks. Firebase token revocation is not checked and needs an approved strategy. |
| API runtime | Supported bindings, secrets, integration tests and runtime evidence | **Not deployed or runtime-tested**. Staging Firebase project ID and callback secrets are not configured; no Worker route or public workers.dev endpoint exists. |
| Abuse controls | Rate limits, daily caps, signature validation, negative balance protection, fraud review | **Database and source controls present**; IP-level abuse controls, concurrency testing, operational alerts and fraud review pending. |
| Shopify | Product/collection linkage and checkout separation | **Read-only verification complete**: LINGOlane Apparel collection contains 7 active items; no wallet or checkout integration |
| Games | Game identity and server-issued credit events | **Integration pending**; no game server connected |
| Merchant redemption | Merchant agreements, coupon inventory and signed authorization service | **Pending** |
| Privacy/legal | Terms, privacy, loyalty/tax/consumer and sweepstakes review as applicable | **Owner/legal review required** |
| Visual staging preview | Mobile-first sample-only wallet UI | **AppDeploy status ready**: https://lingoloyalty-staging-preview-x4ld0h.v2.appdeploy.ai/; QA snapshot reported no frontend or network errors. This is not a live wallet or backend integration. |
| CI execution | Actual hosted runner assignment, job steps, test logs and artifacts | **Blocked**: latest run `41436818353` (`LINGOloyalty Staging Validation`) concluded `startup_failure`; job list is empty. |
| G02 runner | Actual host assignment, sentinel execution, telemetry and artifacts | **Blocked**; no persistent runner host execution evidence |
| Independent verification | Independent code/security review and reproducible CI evidence | **Pending**; PR #435 has no submitted reviews |
| Production authorization | Explicit owner approval after all prior gates | **Not authorized** |

## Safety boundary

- LINGOcoins are promotional points only; no cash-equivalent or stored-value balance is enabled.
- Game credits are separate and non-transferable.
- No cash-out, person-to-person transfer, payment processing, wagering, or real-money payout routes are authorized.
- No live ad network, game server, identity provider, or merchant adapter is connected.
- The AppDeploy preview is static/sample-only. It does not connect to a real account, Shopify checkout, D1, payment provider, ad network, game server, or merchant.
- The dedicated D1 staging database has schema only and is not connected to an application Worker.
- The Worker is source-only; no secrets are set and no routes are configured.

A source commit, static preview deployment, database migration, or isolated SQL check does not satisfy end-to-end runtime integration, independent acceptance, or production authorization.