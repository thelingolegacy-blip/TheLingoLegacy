# LINGOloyalty release gate register

Current checkpoint: 2026-11-02. This register is evidence-led; source presence and deployment readiness do not imply acceptance.

| Gate | Required evidence | Current state |
|---|---|---|
| Source isolation | Dedicated feature branch and package; no production bindings | **Implemented** on `feature/lingo-loyalty-staging-ledger-2026-11-02`; PR #435 remains draft |
| Ledger schema | D1 migration review, constraints and append-only behavior | **Source drafted; migration not run** |
| API behavior | Authenticated wallet, server-verified ad reward, trusted game grants/spend, merchant-authorized coupon | **Source drafted; no runtime backend deployed** |
| Idempotency | Duplicate callback and request replay tests | **Constraints and insert guards drafted; integration tests not executed** |
| Abuse controls | Daily caps, event signatures, rate limits, fraud review | **Partial controls in source; adapters and abuse tests pending** |
| Shopify | Product/collection linkage and checkout separation | **Read-only verification complete**: LINGOlane Apparel collection contains 7 active items; no wallet or checkout integration |
| Games | Game identity and server-issued credit events | **Adapter pending** |
| Merchant redemption | Signed coupon authorization and merchant acceptance | **Partner agreements/adapters pending** |
| Privacy/legal | Terms, privacy, loyalty/tax/consumer and sweepstakes review as applicable | **Owner/legal review required** |
| Visual staging preview | Mobile-first sample-only wallet UI | **AppDeploy status ready**: https://lingoloyalty-staging-preview-x4ld0h.v2.appdeploy.ai/; QA snapshot reported no frontend or network errors. This is not a live wallet or backend integration. |
| CI execution | Actual hosted runner assignment, job steps, test logs and artifacts | **Blocked**: run 41434055668 (`LINGOloyalty Staging Validation`) concluded `startup_failure`; no jobs executed |
| Staging infrastructure | Dedicated D1, secrets, Worker, observability | **Not provisioned** |
| Independent verification | Independent code/security review and reproducible CI evidence | **Pending** |
| Production authorization | Explicit owner approval after all prior gates | **Not authorized** |

## Safety boundary

- LINGOcoins are promotional points only; no cash-equivalent or stored-value balance is enabled.
- Game credits are separate and non-transferable.
- No cash-out, person-to-person transfer, payment processing, wagering, or real-money payout routes are authorized.
- Reward/ad, game, authentication, rate-limit, and merchant adapters remain unconfigured and must fail closed.
- The AppDeploy preview is static/sample-only. It does not connect to a real account, Shopify checkout, D1, payment provider, ad network, game server, or merchant.

A source commit, static preview deployment, or UI QA snapshot does not satisfy runtime integration, independent acceptance, or production authorization.