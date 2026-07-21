# Wave 3 — Ecosystem scaffolds

Wave 3 now has concrete scaffolds for the Global Asset Manager, node registry, and sync engine.

## Files

- [`../os/ecosystem/assets.schema.json`](../os/ecosystem/assets.schema.json) — Global Asset Manager record schema.
- [`../os/ecosystem/node-registry.schema.json`](../os/ecosystem/node-registry.schema.json) — ecosystem node registry schema.
- [`../os/ecosystem/sync-contract.schema.json`](../os/ecosystem/sync-contract.schema.json) — sync engine contract schema.

## Global Asset Manager scaffold

Every asset record tracks:

- `assetId`
- `title`
- `type`
- `ownerId`
- `status`
- `usageRights`
- optional public URL and related node

## Node registry scaffold

Every ecosystem node tracks:

- `nodeId`
- `name`
- `lane`
- `ownerId`
- `status`
- `dependencies`
- optional activation phase and public URL

## Sync engine scaffold

Every sync contract records:

- `syncId`
- `source`
- `destination`
- `trigger`
- `ownerId`
- `validation`
- `rollback`

## Completion criteria

- Global Asset Manager schema exists.
- Node registry schema exists.
- Sync engine contract schema exists.
- Wave 3 plan links to the concrete scaffolds.
