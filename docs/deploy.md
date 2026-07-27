# Deployment notes

That’s My Lingo deploys on Vercel. The current production site has been static HTML; this branch adds a Next.js App Router OS layer.

## Vercel settings after the Next.js OS branch merges

- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: leave empty; Vercel manages the `.next` output
- Install command: default package-manager install
- Node.js version: 24.x

## Important routes

- `/` — Lingo Legacy OS homepage
- `/healthz` — health check endpoint returning `ok`
- `/identity/login` — identity login shell
- `/wallet` — wallet dashboard shell
- `/xp` — XP engine shell
- `/admin` — protected Admin Command Center shell
- `/avalon/archive` — Avalon cultural archive shell
- `/api/*` — OS API route handlers
- `/assets/*` — static brand assets served from `public/assets`

After merging changes to the production branch, Vercel will create a new production deployment automatically if the project is connected to this repository.

For the OS backend layer, see `nextjs-os-live-app.md`, `vercel-os-deployment-readiness.md`, and `.env.example`. Add real secret values through Vercel Environment Variables only; never commit them.