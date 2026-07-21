# Deployment notes

The Lingo Legacy site is deployed on Vercel as a static HTML project.

## Production flow

1. Merge or update the release branch.
2. Let the Vercel Git integration create a preview deployment.
3. Confirm the deployment is `Ready`.
4. Promote the verified deployment to production.
5. Check the production homepage, landing page, asset library, and docs links.
6. Run the stability operation-sync checklist before recording the release.

## Static site details

- Build command: none.
- Output directory: repository root.
- Root page: `index.html`.
- Landing page: `landing/index.html`.
- Asset library: `assets/index.html`.

## Activation phase 1–12 release

Phase 1–12 activation includes the production homepage, aligned landing page, activation documentation, deployment checklist, content runway, revenue pathways, community capture, metrics command, partnership pipeline, operations cadence, scale readiness, and launch governance lanes.

Before a full brand launch, replace `assets/logo.svg` with the final logo and verify all public contact details.

## Stability sync

Use [`stability-operation-sync.md`](stability-operation-sync.md) to verify static HTML, local links, phase markers, and command expansion terms before each production promotion.

## Auto mode deployment

Use [`deploy-activation-runbook.md`](deploy-activation-runbook.md) for auto-mode preview verification, promotion, and post-promotion activation.
