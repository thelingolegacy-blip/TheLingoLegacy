# Wave 1 — Core Systems execution plan

Wave 1 defines the first internal operating systems for Lingo Legacy OS.

## Objective

Create the scaffolding rules for XP, wallet, and identity services before runtime implementation begins.

## Core lanes

### XP Engine

- Define XP events before writing runtime logic.
- Track source, actor, action, points, timestamp, and verification state.
- Keep XP awards auditable and reversible.

### Wallet services

- Treat wallet movement as a ledger, not a mutable balance field.
- Track credits, debits, holds, reversals, and settlement notes.
- Require every ledger event to include a source and reason.

### Identity module

- Define user, creator, admin, partner, and system identities.
- Keep identity ownership separate from public display names.
- Require role changes to be auditable.

## Intervention points

Intervene only when:

- XP event schema is missing.
- Ledger rules are unclear.
- Identity roles drift across docs or implementation.
- A later wave needs core-system rules before it can proceed.

## Completion criteria

- XP Engine has a documented event model.
- Wallet services have ledger rules.
- Identity module has role and ownership rules.
- Wave 1 is linked from the doctrine and README.

## Core system scaffolds

Concrete Wave 1 scaffolds are documented in [`wave-1-core-system-scaffolds.md`](wave-1-core-system-scaffolds.md).

- XP event schema: [`../os/core/xp-events.schema.json`](../os/core/xp-events.schema.json).
- Wallet ledger schema: [`../os/core/wallet-ledger.schema.json`](../os/core/wallet-ledger.schema.json).
- Identity role registry: [`../os/core/identity-roles.json`](../os/core/identity-roles.json).
