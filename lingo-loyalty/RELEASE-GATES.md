# LINGOloyalty release gate register

Current checkpoint: 2026-11-02. This register is evidence-led; source presence and preview deployment do not imply acceptance.

| Gate | Required evidence | Current state |
|---|---|---|
| Source isolation | Dedicated feature branch and package; no production bindings | **Implemented** on `feature/lingo-loyalty-staging-ledger-2026-11-02`; PR #435 remains draft |
| Ledger schema | D1 migration review, constraints and append-only behavior | **Migration applied and objects verified** in dedicated staging D1; deeper constraint/concurrency tests pending |
| D1 staging | Dedicated isolated database, correct jurisdiction, no production binding | **Provisioned**: `lingo-loyalty-staging`, UUID `54ce928b-d540-4bce-816f-e89cb30b8fdf`, U.S. jurisdiction; zero user/reward rows seeded; not bound to a Worker |
| API behavior | Authenticated wallet, server-verified ad reward, trusted game grants/spend, merchant-authorized coupon | **Source draft only**; runtime adapter placeholders are not valid Cloudflare environment bindings and must be replaced before deployment |
| Idempotency | Duplicate callback and request replay tests | **Constraints and insert guards drafted; integration tests not executed** |
| Abuse controls | Daily caps, event signatures, rate limits, fraud review | **Partial source controls; callback signature, supported rate-limit implementation, negative-balance and concurrency tests pending** |
| Shopify | Product/collection linkage and checkout separation | **Read-only verification complete**: LINGOlane Apparel collection contains 7 active items; no wallet or checkout integration |
| Games | Game identity and server-issued credit events | **Adapter pending** |
| Merchant redemption | Signed coupon authorization and merchant acceptance | **Partner agreements/adapters pending** |
| Privacy/legal | Terms, privacy, loyalty/tax/consumer and sweepstakes review as applicable | **Owner/legal review required** |
| Visual staging preview | Mobile-first sample-only wallet UI | **AppDeploy status ready**: https://lingoloyalty-staging-preview-x4ld0h.v2.appdeploy.ai/; QA snapshot reported no frontend or network errors. This is not a live wallet or backend integration. |
| CI execution | Actual hosted runner assignment, job steps, test logs and artifacts | **Blocked**: latest run `41434594233` (`LINGOloyalty Staging Validation`) concluded `startup_failure`; no jobs executed. GitHub rejected retry with HTTP 403 because the run cannot be retried. |
| G02 runner | Actual host assignment, sentinel execution, telemetry and artifacts | **Blocked**; no persistent runner host execution evidence |
| Staging Worker | Reviewed Worker module, supported auth/rate-limit/signature implementations, D1 binding, secret bindings, no production routes | **Not deployed**; Worker source is explicitly marked not deployable as-is |
| Independent verification | Independent code/security review and reproducible CI evidence | **Pending**; PR #435 has no submitted reviews |
| Production authorization | Explicit owner approval after all prior gates | **Not authorized** |

## Safety boundary

- LINGOcoins are promotional points only; no cash-equivalent or stored-value balance is enabled.
- Game credits are separate and non-transferable.
- No cash-out, person-to-person transfer, payment processing, wagering, or real-money payout routes are authorized.
- No live ad network, game server, identity provider, or merchant adapter is connected.
- The AppDeploy preview is static/sample-only. It does not connect to a real account, Shopify checkout, D1, payment provider, ad network, game server, or merchant.
- The dedicated D1 staging database has schema only and is not connected to an application Worker.

A source commit, static preview deployment, or database migration does not satisfy runtime integration, independent acceptance, or production authorization.