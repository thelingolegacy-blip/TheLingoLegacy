# Vercel OS deployment readiness

This repository currently deploys as a static Vercel site. It does not contain a Next.js App Router application, `/api/*` route handlers, or runtime middleware yet.

## Current production fit

Use these Vercel settings for the current static site:

- Framework preset: Other
- Build command: leave empty
- Output directory: leave empty / repository root
- Install command: leave empty
- Health check path: `/healthz`

The production domain is expected to be `thelingolegacy.com`, with `www.thelingolegacy.com` attached to the same Vercel project.

## Environment variables for the OS layer

`.env.example` lists the full key map for the planned OS backend layer. Add real values only in Vercel Project Settings > Environment Variables; never commit secret values.

Required groups:

- Identity/session: `AUTH_PUBLIC_KEY`, `AUTH_PRIVATE_KEY`, `SESSION_SECRET`
- Data layer: `POSTGRES_URL`, `REDIS_URL`
- Object storage: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `GLOBAL_ASSET_BUCKET`
- Internal services: `OS_INTERNAL_API_KEY`, `ACTIVEPIECES_WEBHOOK_URL`
- Wallet: `WALLET_SECRET`
- XP engine: `XP_ENGINE_SECRET`
- Admin Command Center: `ADMIN_COMMAND_CENTER_KEY`
- Lingo.ai: `LINGO_AI_ENDPOINT`, `LINGO_AI_KEY`

## Next.js migration checklist

To support the full prompt-driven OS architecture, migrate from static HTML to a Next.js App Router app in a separate implementation wave:

1. Add `package.json`, `next.config.*`, `app/layout.tsx`, and `app/page.tsx`.
2. Move public static pages into App Router routes or keep them under `public/` where appropriate.
3. Add route handlers for:
   - `/api/identity/verify`
   - `/api/identity/session`
   - `/api/wallet/initiate`
   - `/api/wallet/callback`
   - `/api/xp/progress`
   - `/api/xp/sync`
   - `/api/admin/execute`
   - `/api/admin/events`
   - `/api/assets/fetch`
4. Use Node.js runtime for Wallet, XP, Admin, and other heavier backend work.
5. Use middleware only for lightweight request routing and validation.
6. Add CORS responses only on API routes that need cross-origin access.
7. Add provider clients for Postgres, Redis, MinIO, Activepieces, and Lingo.ai after the real services and credentials exist.
8. Enable Web Analytics or Speed Insights in Vercel only after the app has the matching instrumentation package installed.

## Verification checklist

After each production deploy:

- `GET /` returns the public homepage.
- `GET /healthz` returns `ok`.
- `GET /robots.txt` and `GET /sitemap.xml` return successfully.
- `thelingolegacy.com` and `www.thelingolegacy.com` resolve to the Vercel project.
- Security headers from `vercel.json` are present.
- Any new API route returns the expected status without exposing secrets.
