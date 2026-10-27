# LINGO Legacy — Frontend + Backend Architecture

**Canonical architecture:** [Landing Page Infrastructure Architecture](landing-page-infrastructure-architecture.md)

## Current implemented web architecture

The production web surface is a static-first site controlled by a Cloudflare Worker. The repository's checked-in entrypoints are HTML files in the root and route folders; shared assets live under `assets/`. The current production Worker is configured in `wrangler.jsonc` and enters through `worker.js`.

- **Public UI:** `index.html` plus route-specific `<route>/index.html` files.
- **Shared presentation:** design tokens under `config/design/design-tokens.json` and CSS/JS under `assets/`.
- **Edge control plane:** `worker.js` handles canonical-host redirects, security headers, health/status/runtime endpoints, API boundaries, and forwarding to the asset binding.
- **Asset publication:** `.assetsignore` excludes repository source, operator tooling, configuration, and credential-bearing files from public static delivery.
- **Release authority:** GitHub source and CI evidence; Cloudflare Worker deployment and live validation; explicit fail-closed release gates.

This repository does not have a root Next.js application entrypoint or root `package.json` on the current `main` baseline. Do not represent Next.js as the current production framework unless a separately reviewed migration adds and validates it. Do not create a second hosting origin to work around a CI or runner failure.

## Request and routing model

```text
Browser
  -> Cloudflare DNS / TLS / custom domain
  -> worker.js
       -> canonicalize www to apex
       -> handle /healthz and /api/*
       -> apply security/runtime headers
       -> forward public documents/assets to ASSETS
  -> Workers Static Assets
```

The canonical public origin is `https://thelingolegacy.com`; `www.thelingolegacy.com` redirects to the apex. The Worker exposes explicit runtime contracts including `/api/v1/runtime`, `/api/v1/platform/manifest`, `/api/v1/platform/status`, `/api/v1/platform/gates`, `/api/v1/platform/modules`, and `/api/v1/site/context`.

## Product boundaries

- The landing page is a discovery and navigation surface, not an authority for account, wallet, checkout, reward, or release state.
- Authentication and persistence must be served by authorized backend services. Firebase placeholders do not constitute a live integration.
- Shopify and Stripe remain external commerce/payment boundaries; no UI should claim a transaction succeeded without provider confirmation.
- AI, game persistence, personalization, realtime features and analytics must expose configured/preview/gated states based on evidence.
- Static HTML must remain navigable without JavaScript. JavaScript is progressive enhancement, not the only path to primary routes.

## Design and accessibility

Use the shared design token registry, mobile-first layout, semantic landmarks, descriptive headings, keyboard-visible focus, reduced-motion support, useful alt text, and touch targets of at least 48px where practical. The landing page should prioritize a single value proposition, a primary action, a secondary action, a small set of product destinations, proof/status clarity, and trust/legal links. Operator dashboards belong in secondary navigation rather than competing with the primary visitor journey.

## Quality and release gates

The static gate stack includes asset publication scope, shared design tokens, platform registries, dynamic runtime contracts, gateway security, release configuration consistency, and HTML/link validation. The landing-page architecture contract is enforced by `scripts/verify-landing-page-architecture.mjs` and its test.

A passing source check does not prove a real browser render, live DNS/routing, deployed-version provenance, runner assignment, backend connectivity, or release authorization. G02 and downstream release gates must pass with independently retrievable evidence before production promotion.

## Future native application layer

Flutter and Firebase are separate planned/in-progress product layers. They must consume the same approved domain contracts and brand tokens but must not be described as production-ready until real credentials, service connectivity, platform builds, tests and security rules are verified. A future framework migration requires its own architecture decision, staged preview, parity checks, cost/security review, and explicit release approval.
