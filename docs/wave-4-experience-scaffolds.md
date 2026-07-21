# Wave 4 — Experience scaffolds

Wave 4 now has concrete scaffolds for UI shell regions, Lingo.ai entry points, and OS Home navigation.

## Files

- [`../os/experience/ui-shell.schema.json`](../os/experience/ui-shell.schema.json) — UI shell region schema.
- [`../os/experience/lingo-ai-entrypoints.json`](../os/experience/lingo-ai-entrypoints.json) — Lingo.ai app entry point registry.
- [`../os/experience/os-home-navigation.json`](../os/experience/os-home-navigation.json) — OS Home navigation model.

## UI shell scaffold

Every UI shell region tracks:

- `regionId`
- `name`
- `purpose`
- `priority`
- `accessibility`
- optional routes

## Lingo.ai app scaffold

Initial entry points:

- `ask-lingo`
- `build-mode`
- `ops-summary`

Each entry separates user prompts, system actions, and operating outputs.

## OS Home scaffold

OS Home navigation keeps these lanes visible:

- Activation
- Assets
- Operations
- Stability
- Auto Mode
- Deploy

## Completion criteria

- UI shell schema exists.
- Lingo.ai entrypoint registry exists.
- OS Home navigation model exists.
- Wave 4 plan links to the concrete scaffolds.
