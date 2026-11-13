# Wave 00.2 — Spades Wallet Ledger Remediation Specification

Status: SPECIFICATION ONLY — NOT DEPLOYED

## Finding

The inspected `Spades-is-my_Lingo/firestore.rules` allows an authenticated profile owner to update wallet/progression fields including `chips`, `sweepstakesTickets`, `level`, `xp`, and `streakDays`. Owner identity does not make client-supplied balances authoritative.

## Required target architecture

1. Client sends an authenticated, App Check-protected intent to a trusted ledger endpoint.
2. The endpoint validates identity, entitlement, product policy, idempotency key, request size, rate limits and allowed operation type.
3. A trusted server transaction reads the wallet and relevant inventory/ledger state, validates sufficient balance and policy, then atomically writes:
   - immutable ledger entry;
   - updated balance snapshot;
   - idempotency result;
   - audit/event record.
4. The client receives the authoritative result and treats local/offline values as pending display state only.
5. Reconciliation jobs detect duplicate, missing, out-of-order or impossible ledger transitions.

## Client Firestore rule requirements

- Deny client writes to `chips`, `sweepstakesTickets`, cash-equivalent, redemption, prize, payout, level and XP authority fields.
- Keep cosmetic profile fields in a separate allowlist.
- Deny client ledger writes and deletes.
- Permit reads only for the authenticated owner and only where product privacy rules allow.
- Validate exact allowed keys, types, bounds and immutable identifiers.
- Keep default-deny catch-all.

## Virtual economy separation

- Play Coins are non-redeemable gameplay units.
- Apparel discounts are promotional entitlements with separate identifiers and terms.
- No conversion, transfer, cash-out, purchase, prize, or redemption bridge may connect Play Coins to real-world currency.
- Sweepstakes eligibility and prizes, if any, require separate legal review and explicit product controls.

## Required tests before implementation can be accepted

- unauthenticated and wrong-owner requests rejected;
- direct client balance/ticket/ledger writes denied;
- duplicate idempotency key does not double-credit;
- concurrent spends cannot overspend;
- invalid/negative/overflow values rejected;
- ledger and balance snapshot commit atomically;
- rollback leaves no partial balance mutation;
- replayed, stale and reordered events do not create duplicate value;
- no Play Coin to currency conversion path exists.

## Deployment gate

This document does not change the Spades repository rules or deploy a Worker/Function. Implementation must be made in an isolated product branch, pass emulator and integration tests, receive security review, and be merged/released only through the canonical G02 and production gates.
