# Next.js OS live app

This branch adds the first deployable Next.js App Router layer for Lingo Legacy OS.

## Included

- App Router layout, homepage, module pages, and Industrial Noir global styling
- Shared UI components: `Button`, `Card`, `Section`, `CommandTile`, and `XPBurst`
- Middleware guarding `/admin`, `/wallet`, and `/xp` routes when a session cookie exists or admin access is required
- API route handlers for identity, wallet, XP, admin commands, admin events, asset lookup, and health checks
- Static brand assets copied under `public/assets` so existing `/assets/*` URLs remain available in the Next.js app
- Catch-all legacy route placeholder for static pages that still need App Router rebuilds
- Runtime helper modules for auth, OS commands, MinIO-style asset URL assembly, Postgres config checks, Redis config checks, and sound hooks

## Runtime split

- Node.js runtime is used for API routes and health checks.
- Middleware stays lightweight and uses Web Crypto-compatible session verification.
- Heavier wallet, XP, admin, database, Redis, and object-storage integrations should stay in Node.js routes.

## Production cutover notes

The existing production site is static HTML. Merging this branch changes the project into a Next.js application because `package.json`, `next.config.mjs`, and `app/layout.tsx` are present.

Before promoting to production:

1. Add real secret values in Vercel Environment Variables.
2. Test the preview deployment routes listed below.
3. Confirm static legacy pages that still matter have been migrated to App Router pages or intentionally retired.
4. Merge only after the preview looks correct.

## Verification routes

- `/`
- `/healthz`
- `/identity/login`
- `/wallet`
- `/xp`
- `/admin`
- `/avalon/archive`
- `/api/xp/sync`

Admin endpoints require `x-admin-key` matching `ADMIN_COMMAND_CENTER_KEY`.
