# Wave 1 — Core system scaffolds

Wave 1 now has concrete scaffolds for XP events, wallet ledger entries, and identity roles.

## Files

- [`../os/core/xp-events.schema.json`](../os/core/xp-events.schema.json) — XP event schema.
- [`../os/core/wallet-ledger.schema.json`](../os/core/wallet-ledger.schema.json) — wallet ledger entry schema.
- [`../os/core/identity-roles.json`](../os/core/identity-roles.json) — identity role registry.

## XP Engine scaffold

Every XP event records:

- `eventId`
- `source`
- `actorId`
- `action`
- `points`
- `occurredAt`
- `verificationState`

XP can be pending, verified, or reversed. Reversals use negative points or linked reversal events.

## Wallet ledger scaffold

Wallet state is derived from ledger entries. Valid entry types:

- `credit`
- `debit`
- `hold`
- `release`
- `reversal`
- `settlement`

Every entry requires source and reason so future wallet movement is auditable.

## Identity scaffold

Initial roles:

- `user`
- `creator`
- `admin`
- `partner`
- `system`

Role changes must keep actor, reason, timestamp, and previous role available for audit.

## Completion criteria

- XP event schema exists.
- Wallet ledger schema exists.
- Identity role registry exists.
- Wave 1 plan links to the concrete scaffolds.
