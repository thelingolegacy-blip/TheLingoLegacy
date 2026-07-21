# Wave 2 — Command system scaffolds

Wave 2 now has concrete scaffolds for Admin Command Center actions, AI Ops boundaries, and Event Bus contracts.

## Files

- [`../os/command/admin-actions.schema.json`](../os/command/admin-actions.schema.json) — admin command action schema.
- [`../os/command/ai-ops-boundaries.json`](../os/command/ai-ops-boundaries.json) — AI Ops allowed actions, approval gates, and stop conditions.
- [`../os/command/event-bus.schema.json`](../os/command/event-bus.schema.json) — event routing contract schema.

## Admin Command Center scaffold

Every admin command records:

- `commandId`
- `name`
- `ownerRole`
- `intent`
- `status`
- `requestedAt`
- `validation`
- optional rollback and release notes

## AI Ops scaffold

AI Ops follows intervention-only continuous execution. It can scaffold, validate, summarize, expand runbooks, and prepare deployment notes. It requires approval for production promotion, destructive actions, credential changes, and billing changes.

## Event Bus scaffold

Every event contract records:

- `eventName`
- `source`
- `destination`
- `payload`
- `occurredAt`
- `retry`
- optional `traceId`

## Completion criteria

- Admin command action schema exists.
- AI Ops boundaries exist.
- Event Bus contract schema exists.
- Wave 2 plan links to the concrete scaffolds.

Validation marker: admin action schema.
