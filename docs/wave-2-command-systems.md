# Wave 2 — Command Systems execution plan

Wave 2 defines the command layer that coordinates Lingo Legacy OS operations.

## Objective

Create the operating structure for admin control, AI operations, and event routing.

## Command lanes

### Admin Command Center

- Centralize status, actions, approvals, and release notes.
- Track what changed, who owns it, and what validation passed.
- Keep admin commands explicit and reversible where possible.

### AI Ops

- Use AI assistance for scaffolding, validation, summaries, and command expansion.
- Avoid over-assisting when the execution path is already clear.
- Record AI-driven changes in pull request summaries.

### Event Bus

- Define events before wiring consumers.
- Include event name, payload, source, destination, timestamp, and retry rules.
- Keep critical events observable.

## Intervention points

Intervene only when:

- Admin workflows need structure.
- AI automation logic needs guardrails.
- Event routing is missing or ambiguous.
- Command actions lack validation criteria.

## Completion criteria

- Admin Command Center responsibilities are documented.
- AI Ops rules match the OS execution doctrine.
- Event Bus routing rules are defined.
- Wave 2 is linked from the doctrine and README.
