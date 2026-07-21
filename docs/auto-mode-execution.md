# Auto mode — Entirety execution map

Auto mode completes Lingo Legacy OS by keeping every wave, sprint, phase, deploy, and activation moving under the OS execution doctrine.

## Operating command

Complete all remaining waves, sprints, phases, deploys, and activations for the entirety on auto mode.

## Auto mode rules

- Continue the approved build plan without repeated instructions.
- Intervene only where a file, scaffold, validation, deploy, or activation is missing.
- Keep documentation, machine-readable maps, deployment notes, and pull request summaries aligned.
- Validate static pages, markdown links, JSON maps, activation markers, and deployment readiness before promotion.
- Stop only for missing access, destructive actions, or production-affecting uncertainty that cannot be verified.

## Execution surfaces

- Waves: [`os/auto-mode/entirety.json`](../os/auto-mode/entirety.json).
- Sprints: [`sprint-activation-map.md`](sprint-activation-map.md).
- Deploys: [`deploy-activation-runbook.md`](deploy-activation-runbook.md).
- Stability: [`stability-operation-sync.md`](stability-operation-sync.md).
- Doctrine: [`os-execution-doctrine.md`](os-execution-doctrine.md).

## Entirety loop

1. Load the active branch and Vercel project context.
2. Pick the next incomplete wave, sprint, phase, deploy, or activation.
3. Apply the smallest useful scaffold or implementation package.
4. Validate files, links, JSON, markers, and deployment readiness.
5. Update the pull request.
6. Promote only a verified Vercel `READY` deployment.
7. Continue to the next item until the map is complete.

## Completion criteria

- Full wave map exists.
- Sprint activation map exists.
- Deploy activation runbook exists.
- Machine-readable auto-mode map exists.
- README, doctrine, activation, stability, and deploy docs link to auto mode.

## Active expansion layers

- [`cycles-laundry-hub-network.md`](cycles-laundry-hub-network.md) — Cumberland + Philadelphia Laundry Hub geo-beacon expansion.

## Website build layer

- [`os-web-stack-v1.md`](os-web-stack-v1.md) — deployed Industrial Noir website architecture.
