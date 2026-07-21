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

## Activation phase 1–4

Phase 1–4 activation is documented in [`docs/activation-phase-1-4.md`](docs/activation-phase-1-4.md) and includes:

1. Public HQ foundation.
2. Offer architecture.
3. Audience engine.
4. Production readiness.

## Launch checklist

- Replace `assets/logo.svg` with the final logo before launch.
- Verify all public links and contact details.
- Confirm the production deployment is `Ready` after promotion.
- Confirm the root homepage, landing page, asset library, and activation docs resolve in production.
