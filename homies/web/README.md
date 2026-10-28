# Homies Web — Next.js preview scaffold

This package is an isolated web/PWA companion scaffold for Homies under `homies/web/`. It is **not production-ready or release-certified**.

## Run locally

```sh
cd homies/web
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Implemented scaffold

- Next.js App Router + TypeScript + Tailwind CSS
- Crimson/charcoal landing page and responsive app shell
- Shared button, desktop sidebar, mobile navigation, React Query provider
- Explore and local-only Grok preview routes
- Web app manifest and baseline response security headers
- API request helper with explicit configuration checks

## Known gaps

- Authentication/session management and protected-route enforcement are not implemented.
- Profiles, discovery, messaging, circles, maps, admin, payments, and notifications are not connected to backend services.
- Grok preview does not send messages to xAI.
- A manifest alone is not a complete PWA; service worker/offline cache and install icons are not included.
- Mapbox token is optional and unused.
- No dependency installation, lockfile, lint, typecheck, production build, accessibility audit, or browser/device smoke test has been run.
- Do not deploy or promote until backend security review and release gates pass.

## Security

Never put JWT signing secrets, xAI API keys, Stripe secret keys, AWS credentials, or database URLs in `NEXT_PUBLIC_*` variables. Authorization must be enforced by the backend, not by hiding UI elements.
