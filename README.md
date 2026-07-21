# TheLingoLegacy — Website Repo

This repository contains the public static website for The Lingo Legacy project.

## Project structure

- `landing/` — static landing page content.
- `assets/` — placeholder logos, images, and asset library pages.
- `docs/` — project documentation, activation plans, and deployment notes.
- `index.html` — production homepage for the Vercel root route.

## Deployment

The site is deployed on Vercel as the `the-lingo-legacy` project under the `thelingolegacy` team.

Current production deployment flow:

1. Merge changes into the repository branch intended for release.
2. Vercel creates a preview deployment from the Git integration.
3. Confirm the preview deployment is `Ready` in Vercel.
4. Promote the verified deployment to production.

Production URL:

- https://the-lingo-legacy.vercel.app

Useful Vercel commands:

```bash
vercel list the-lingo-legacy --scope thelingolegacy
vercel promote <deployment-url> --scope thelingolegacy --yes
```

Because this is a static HTML site, no build step is required. The root `index.html` is the production homepage.

## Activation phase 1–12

The complete activation system is documented in [`docs/activation-phase-1-12.md`](docs/activation-phase-1-12.md) and includes:

1. Public HQ foundation.
2. Offer architecture.
3. Audience engine.
4. Production readiness.
5. Content runway.
6. Revenue pathways.
7. Community capture.
8. Metrics command.
9. Partnership pipeline.
10. Operations cadence.
11. Scale readiness.
12. Launch governance.

## OS execution doctrine

The intervention-only continuous execution rule is documented in [`docs/os-execution-doctrine.md`](docs/os-execution-doctrine.md). It keeps Lingo Legacy OS moving wave-by-wave: intervene where needed, avoid over-assisting, and continue the approved build plan without repeated instructions.

## Wave 0 foundation

Wave 0 foundation execution is documented in [`docs/wave-0-foundation.md`](docs/wave-0-foundation.md). It defines the current repo structure, static validation path, and Vercel preview-to-production flow.

## Wave 1–5 execution plans

- [Wave 1 core systems](docs/wave-1-core-systems.md) — XP Engine, wallet services, and identity module rules.
  - [Wave 1 core system scaffolds](docs/wave-1-core-system-scaffolds.md) — JSON scaffolds for XP events, wallet ledger entries, and identity roles.
- [Wave 2 command systems](docs/wave-2-command-systems.md) — Admin Command Center, AI Ops, and Event Bus rules.
  - [Wave 2 command system scaffolds](docs/wave-2-command-system-scaffolds.md) — JSON scaffolds for admin actions, AI Ops boundaries, and Event Bus contracts.
- [Wave 3 ecosystem layer](docs/wave-3-ecosystem-layer.md) — Global Asset Manager, node registry, and sync engine rules.
  - [Wave 3 ecosystem scaffolds](docs/wave-3-ecosystem-scaffolds.md) — JSON scaffolds for asset records, ecosystem nodes, and sync contracts.
- [Wave 4 experience layer](docs/wave-4-experience-layer.md) — UI shell, Lingo.ai app, and OS Home navigation rules.
  - [Wave 4 experience scaffolds](docs/wave-4-experience-scaffolds.md) — JSON scaffolds for UI shell regions, Lingo.ai entrypoints, and OS Home navigation.
- [Wave 5 deployment](docs/wave-5-deployment.md) — deployment stack, routing rules, and automation trigger rules.

## Auto mode entirety

Auto mode execution is documented in [`docs/auto-mode-execution.md`](docs/auto-mode-execution.md). It covers all remaining waves, sprints, phases, deploys, and activations using the OS doctrine.

- [Sprint activation map](docs/sprint-activation-map.md)
- [Deploy activation runbook](docs/deploy-activation-runbook.md)
- [Machine-readable auto-mode map](os/auto-mode/entirety.json)

## Laundry Hub network

The Cumberland + Philadelphia Cycles Laundry Hub network is documented in [`docs/cycles-laundry-hub-network.md`](docs/cycles-laundry-hub-network.md), with the machine-readable hub map at [`os/geo/laundry-hubs.json`](os/geo/laundry-hubs.json).

## OS Web Stack v1

The deployable Industrial Noir website architecture is implemented in [`docs/os-web-stack-v1.md`](docs/os-web-stack-v1.md), with live static pages under `site/`.

## Brand spine + social matrix

- [Brand spine](docs/brand-spine.md)
- [Social account matrix](docs/social-account-matrix.md)
- [Social launch calendar](docs/social-launch-calendar.md)
- [Lingo.ai game scaffold](site/lingoai/)

## Stability operation sync

Stability verification and command expansion are documented in [`docs/stability-operation-sync.md`](docs/stability-operation-sync.md). Use it after every production push to keep the homepage, landing page, activation docs, deployment notes, and pull request summary aligned.

## Launch checklist

- Replace `assets/logo.svg` with the final logo before launch.
- Verify all public links and contact details.
- Confirm the production deployment is `Ready` after promotion.
- Confirm the root homepage, landing page, asset library, and activation docs resolve in production.
- Confirm phase 9–12 partnership, operations, scale readiness, and governance lanes are represented before the next launch push.
- Run the stability operation-sync command expansion checklist before promotion.
