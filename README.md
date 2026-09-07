# That’s My Lingo by The Lingo Legacy

Cloudflare Worker–controlled, dynamic Studio web experience for That’s My Lingo and the wider Lingo Legacy ecosystem. The interface uses the shared Lingo OS visual language with premium Industrial Noir / Vegas presentation, runtime APIs, feature state, observability, commerce hooks, and production safety controls.

## Studio Runtime — v4

The production surface is **dynamic-runtime-first**. HTML/CSS/JS assets are build artifacts controlled by the Cloudflare Worker; the product is not classified or operated as a static-only site.

The Worker provides runtime headers, edge HTML transformation, platform context, health, manifest, status, checkout, and beacon APIs. Runtime feature state can be consumed from `/api/v1/site/context` and platform status from `/api/v1/platform/status`.

## Site map

The existing world routes remain available as Studio surfaces, including That’s My Lingo, LoadingPage, Studio Assets, Kotton’s Code, Tap Stitch, games, Ask Lingo, Admin Command Center, Casino Studio, Multiplayer Rap Arena, Auto Racing Universe, Studio World OS, Trust & Compliance, Economy Command Center, and the broader Universe map.

## Canonical stack

- **Source control:** GitHub
- **CI/CD:** GitHub Actions with fail-closed production gates
- **Web/runtime:** Cloudflare Workers
- **Edge/site routing:** Cloudflare
- **Data:** Cloudflare D1/KV/R2 where provisioned; Firebase Auth/Firestore/Storage for designated ecosystem services
- **Mobile:** Flutter
- **AI:** shared Ask Lingo ⭐ / Lingo.AI architecture with product-specific knowledge layers
- **Commerce:** Stripe/Shopify integrations where configured
- **Observability:** Cloudflare + application telemetry + release evidence
- **Domain:** `thelingolegacy.com` and `www.thelingolegacy.com`, Cloudflare-authoritative

**Vercel is retired. It is not a runtime, deployment provider, DNS authority, or production dependency.**

## Runtime endpoints

- `/healthz`
- `/api/v1/runtime`
- `/api/v1/platform/manifest`
- `/api/v1/platform/status`
- `/api/v1/site/context`
- `/api/create-checkout-session`
- `/api/beacon-text-alerts`

## Premium Studio capabilities

- cinematic LoadingPage / LL monogram boot experience
- responsive command-center navigation and world switching
- runtime feature flags and platform context
- live health/status telemetry
- role-aware operational surfaces
- Lingo ID / wallet / XP / rewards integration points
- Ask Lingo ⭐ product assistant integration points
- commerce and launch capture APIs
- analytics and audit-event architecture
- motion-safe animation and resilient error recovery
- product-specific visual worlds under one Lingo OS

## Development

Run the repository's validation and deployment checks through GitHub Actions. Local development may use a static file server only as a developer preview; that does **not** define the production architecture.

## Deployment

Production authority is:

`GitHub → GitHub Actions gates → Cloudflare Worker → dynamic runtime/API → Cloudflare assets → thelingolegacy.com`

The Worker entrypoint is `worker.js`; Cloudflare configuration is `wrangler.jsonc`. Secrets are injected by the owning deployment environment and never committed.

## Production gate

`RECONCILE → FIX → VERIFY → REVIEW → QA → PUSH → DEPLOY → VERIFY LIVE`

A successful build alone never marks production LIVE. Repository state, CI evidence, Worker deployment, domain routing, backend bindings, data, analytics/observability, safety controls, and live probes must agree.

## Canonical contract

See `docs/studio-stack-runtime-contract-2026-09.md` and the ecosystem contract in `LINGO_LEGACY_HQ/07_DOCS/studio-stack-development-contract-2026-09.md`.
