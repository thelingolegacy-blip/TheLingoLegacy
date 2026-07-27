# Deployment notes

That’s My Lingo is a static HTML site and deploys on Vercel without a build command.

## Vercel settings

- Framework preset: Other
- Build command: leave empty
- Output directory: leave empty / repository root
- Install command: leave empty

## Important routes

- `/` — production homepage
- `/landing/` — campaign landing page
- `/app/` — playable daily game shell
- `/assets/` — brand asset library
- `/universe/` — connected universe route map for production, command center, assets, game rooms, and brand-world pages
- `/tapstich/` — static apparel customization lane; no Vercel Functions, middleware, database, Blob, Shopify API, or added telemetry scripts

After merging changes to the production branch, Vercel will create a new production deployment automatically if the project is connected to this repository.

For the planned OS backend layer, see `vercel-os-deployment-readiness.md` and `.env.example`. The current repository is static HTML; add Next.js App Router files, route handlers, and middleware in a separate implementation wave before enabling `/api/*` functions or runtime environment-variable usage.
