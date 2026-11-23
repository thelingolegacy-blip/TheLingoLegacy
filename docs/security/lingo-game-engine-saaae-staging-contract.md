# LINGO game-engine staging SAAAE contract

**Disposition:** staging source only; protected hold remains active. This document describes the reviewed source contract, not a live deployment.

## Identity and tenant context

Protected API requests require:
- A Firebase Authentication ID token for the configured non-production project.
- `X-Lingo-Tenant` containing the tenant context.
- An active `lingo_saaae_principals` row whose `token_valid_after_epoch` does not invalidate the token's Firebase `auth_time`.
- An active membership for the exact Firebase UID and tenant.
- An exact active allow grant for the product, resource, and operation. A matching active deny grant takes precedence.

The tenant header is an untrusted selector, not authority. The database membership and grant checks decide whether it is valid.

## Resource and operation scopes

| Endpoint | Required resource | Required operation |
|---|---|---|
| `POST /api/v1/accounts/bootstrap` | `account:{firebaseUid}` | `account.bootstrap` |
| `GET /api/v1/wallet/balance` | `wallet:{firebaseUid}` | `wallet.read` |
| `POST /api/v1/admin/approvals` | `game:thats-my-lingo` | `approval.approve` |
| `POST /api/v1/slots/spin` | `game:thats-my-lingo` | `spin` |

All four routes are scoped to product `thats-my-lingo`. Wildcard grants are not accepted by this Worker.

## Approval lifecycle

A separately privileged approver calls `POST /api/v1/admin/approvals` with:
- `requesterUid`: Firebase UID of the player who will perform the spin.
- `wagerUnits`: integer from 1 through 100.
- `idempotencyKey`: 16–128 characters matching `[A-Za-z0-9._:-]`.

The Worker computes the action digest; clients cannot supply or override it. Issuance requires the approver's exact `approval.approve` grant and verifies that the requester has an active principal, tenant membership, and exact `spin` allow grant with no matching deny. The requester and approver must differ. The approval expires after five minutes.

The player calls `POST /api/v1/slots/spin` with the same `wagerUnits`, `idempotencyKey`, and returned `approvalId`. The request must use the same tenant. Approval consumption is bound to the exact action digest and is performed in the same D1 batch as session creation, wallet ledger settlement, and the approval-consumed audit event. A consumed approval is terminal and retained. A retry of an already-settled idempotency key returns the original result without consuming approval again.

## Rate limits

Current staging source limits each Firebase UID per route and 60-second window:
- Account bootstrap: 5
- Wallet balance: 60
- Approval issuance: 10
- Slot spin: 20

The D1 upsert increments a bucket only while below its configured limit. Missing rate-limit state or audit persistence errors fail closed.

## Provisioning prerequisite

This Worker does not self-register principals, create tenant memberships, or grant privileges. A separate, reviewed privileged administrative process must establish:
1. Principal rows for player and approver UIDs.
2. Active tenant memberships.
3. Exact product/resource/operation grants for each permitted action.
4. A separate `approval.approve` grant for approvers.

No default tenant, wildcard grant, client-side role, or Firebase-authenticated self-provisioning is permitted.

## Operational gates

- Apply `migrations/0002_lingo_saaae_staging.sql` only after review and successful migration/Cloudflare D1 tests.
- The `/healthz` endpoint must remain degraded until all six SAAAE tables exist.
- Run Node policy tests, endpoint tests, approval race/replay tests, D1 atomic rollback tests, Wrangler dry-run, Firebase staging identity verification, and staging-only integration checks.
- Verify the actual Cloudflare account and staging Firebase project before provisioning the Worker.
- Keep the Worker on staging-only workers.dev until a separate route review and release approval.
- Never point this Worker at production Firebase, D1, or production routes.

No live D1 migration, principal/grant provisioning, Worker upload/deployment, route change, or production mutation is authorized by this contract.
