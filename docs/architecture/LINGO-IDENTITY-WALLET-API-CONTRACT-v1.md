# LINGO Identity, Wallet and API Contract — v1 proposal

**Status: DESIGN / NON-PRODUCTION.** This contract is an implementation baseline, not a claim that Firebase, LINGO ID, wallet, or API services are live.

## 1. Authority and trust boundaries

- GitHub is the source of truth for application code, schemas, policy and migrations.
- Firebase Authentication is the proposed identity provider; Firebase ID tokens establish identity, not authorization.
- Cloudflare Workers are the proposed public API edge and request-policy layer.
- Trusted server functions own profile mutations, entitlements, wallet writes and ledger append operations.
- Clients may request operations and read authorized projections. Clients must never directly write balances, ledger entries, entitlement grants or role assignments.
- Games and product surfaces consume versioned APIs; no product may create a competing user identity or wallet.

## 2. Canonical identity

Proposed stable principal: `uid` from the verified Firebase ID token, scoped to the authoritative Firebase project. Never use email, display name, device ID or client-supplied UID as the primary key.

Token validation requirements:
- Verify RS256 signature against Google's published signing keys.
- Require `aud` and `iss` to match the configured project ID.
- Require valid `sub`, `exp`, `iat`, and `auth_time`.
- Reject expired, malformed, wrong-project, or unverifiable tokens closed.
- Perform server-side authorization after identity verification for every resource and action.
- Apply App Check/device attestation as an additional abuse signal where supported; it does not replace user authorization.

The repository contains `src/auth/firebase-id-token.mjs`, but its presence alone does not prove every Worker/API route uses it correctly.

## 3. Proposed resource model

| Resource | Canonical key | Write authority |
|---|---|---|
| User profile | `users/{uid}` | trusted profile service; allowlisted user-editable fields only |
| Private preferences | `users/{uid}/preferences/{key}` | owner-scoped service |
| Entitlements | `users/{uid}/entitlements/{entitlementId}` | entitlement service only |
| Wallet account | `walletAccounts/{uid}:{currency}` | wallet service only |
| Ledger entry | `walletLedger/{entryId}` | append-only wallet service only |
| Idempotency record | `idempotency/{scope}:{key}` | operation service only |
| Audit event | `auditEvents/{eventId}` | server-only append |
| Product catalog | `catalog/{itemId}` | catalog administration only |

Keep demo/game currencies namespaced (for example `DOUGH`) and separate from Lingo Coins. Lingo Coins remain non-redeemable, non-transferable unless separately approved, and have no cash value. No cash-out, conversion, sweepstakes entry, or wagering behavior is implied by this contract.

## 4. Wallet ledger invariants

1. Integer minor units only; never floating-point balances.
2. Every posted ledger entry is immutable and has a unique server-generated ID.
3. Each command carries an idempotency key scoped to user + operation + product.
4. Replays return the original result; reusing a key with a different payload is rejected.
5. A balance projection is updated atomically with its ledger entry in one database transaction.
6. Enforce non-negative balances unless a separately specified account type explicitly permits a negative balance.
7. Record currency, delta, reason code, source product, actor, correlation ID, timestamp, schema version and balance-after.
8. Reconciliation recomputes balances from ledger history and flags drift; no silent repair.
9. Client writes to balance, ledger, entitlement, or cash-value fields are denied.
10. Separate accounting namespaces for demo currency, loyalty points and Lingo Coins.

## 5. Proposed API surface

Base path: `/api/v1`. All authenticated routes require a Firebase bearer token and server-side authorization.

| Method | Path | Purpose |
|---|---|---|
| GET | `/me` | current user's minimal profile |
| PATCH | `/me` | allowlisted profile updates |
| GET | `/me/entitlements` | user's effective entitlements |
| GET | `/me/wallets` | wallet summary by currency |
| GET | `/me/wallets/{currency}/ledger` | paginated immutable ledger |
| POST | `/wallet/commands` | idempotent server-authorized credit/debit command |
| GET | `/healthz` | non-sensitive service health |
| GET | `/readyz` | dependency readiness; no secrets or internal topology |

Command body is allowlisted: `operationId`, `currency`, `amountMinor`, `reasonCode`, `sourceProduct`, `idempotencyKey`, and optional bounded metadata. The server determines the actor, eligibility, price, balance, entitlement and resulting balance. Clients cannot submit `balanceAfter`, `cashValue`, `role`, or `uid`.

## 6. Error contract

Use stable machine-readable codes: `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `INVALID_ARGUMENT` (400), `IDEMPOTENCY_CONFLICT` (409), `INSUFFICIENT_BALANCE` (409), `RATE_LIMITED` (429), `DEPENDENCY_UNAVAILABLE` (503), and `INTERNAL` (500). Never leak tokens, secrets, stack traces or account existence details.

## 7. Required test plan

- Wrong-project, expired, malformed, tampered and unverifiable Firebase tokens rejected.
- Valid identity without required role/ownership rejected.
- User A cannot read or mutate User B's profile, wallet, inventory or ledger.
- Direct client writes to all protected collections denied.
- Duplicate idempotency key returns same result without duplicate debit/credit.
- Same key with different payload rejected.
- Concurrent spend requests cannot overdraw.
- Ledger append and balance projection are atomic.
- Replay, reconciliation, corruption and restore drills produce auditable outcomes.
- Demo currency and Lingo Coins cannot cross-convert or cash out.
- Rate limiting and abuse controls apply to authenticated and anonymous surfaces.
- API contract tests run against emulator/staging project only.

## 8. Implementation blockers

- `.firebaserc` names `lingo-legacy-production`, but provider-side project ownership and app registrations are not verified.
- `firebase.client.json` and `lib/firebase_options.dart` contain placeholder API keys and app IDs.
- Root `firebase.json` configures Hosting only and publishes `.`; the intended deploy scope must be narrowed and reviewed.
- No root `firestore.rules` exists. A separate Oasis-specific rules file exists under `studio-sites/games/oasis-platform/firebase-functions/firestore.rules`; do not assume it protects the flagship project.
- No evidence yet of production Auth providers, App Check, indexes, backups, restore drill or API route integration.

## 9. Gate

Design review -> emulator tests -> isolated staging project -> independent security review -> backup/restore evidence -> candidate API verification -> owner acceptance. Production remains HOLD throughout this proposal.
