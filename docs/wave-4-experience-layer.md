# Wave 4 — Experience Layer execution plan

Wave 4 defines the user-facing OS experience layer.

## Objective

Prepare the UI, Lingo.ai surface, and OS Home navigation model before visual buildout.

## Experience lanes

### UI shell

- Define page regions before styling details.
- Keep navigation, status, content, and action areas distinct.
- Preserve accessibility basics on every public page.

### Lingo.ai app

- Define the assistant entry points before wiring AI behavior.
- Separate user prompts, system actions, and operating outputs.
- Keep AI actions traceable through docs or logs.

### OS Home

- Route users to activation, assets, operations, metrics, and launch lanes.
- Keep primary actions visible and low-friction.
- Avoid burying production-critical links.

## Intervention points

Intervene only when:

- UI shell structure is missing.
- Lingo.ai frontend structure needs scaffolding.
- OS Home navigation logic is unclear.
- Experience surfaces conflict with activation docs.

## Completion criteria

- UI shell rules are documented.
- Lingo.ai app structure is documented.
- OS Home navigation model is documented.
- Wave 4 is linked from the doctrine and README.
