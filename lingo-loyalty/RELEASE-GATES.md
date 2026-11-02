# LINGOloyalty release gate register

Status at initial implementation: all operational integrations remain **NOT VERIFIED**.

| Gate | Required evidence | State |
|---|---|---|
| Source isolation | Dedicated branch and package; no production bindings | Implemented in source; verify by diff |
| Ledger schema | D1 migration review, constraints and append-only behavior | Source drafted; migration not run |
| API behavior | Authenticated wallet, server-verified ad reward, game spend, merchant coupon | Source drafted; adapters absent |
| Idempotency | Duplicate callback and request replay tests | Local policy checks only; integration test pending |
| Abuse controls | daily caps, event signatures, rate limits, fraud review | Partial source controls; full abuse test pending |
| Shopify | product/collection linkage and checkout separation | Store read only; no wallet integration |
| Games | game identity and server-issued credit events | Adapter pending |
| Merchant redemption | signed coupon authorization and merchant acceptance | Partner agreements/adapters pending |
| Privacy/legal | terms, privacy, loyalty/tax/consumer and sweepstakes review | Owner/legal review required |
| Staging infrastructure | dedicated D1, secrets, Worker, observability | Not provisioned |
| Independent verification | independent code/security review and reproducible CI evidence | Pending |
| Production authorization | explicit owner approval after all prior gates | Not authorized |

A source commit or local test is not an acceptance or production authorization.