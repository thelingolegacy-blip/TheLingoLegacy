# LINGOlegacy flagship website build — 2026-11-15

## Scope
This change updates the source for the exact-root flagship discovery experience and its world directory. It is source-only on the existing website readiness branch and does not change Cloudflare routes, DNS, deployments, provider settings, identity, payments, secrets, or production data.

## Canonical public experience
- Root: `/` — flagship discovery and ecosystem landing page.
- Directory: `/worlds/` — canonical public portfolio index.
- Studio: `/studio/` — creative production entry point.
- Trust: `/trust-compliance/`.
- Support: `/contact/`.
- Legal: `/privacy/`, `/terms/`, `/community-guidelines/`.

## Brand and content rules
- Public master brand: The Lingo Legacy; flagship product identity: `LINGOlegacy`.
- Realm names follow the portfolio canon: `LINGOlane`, `LINGOslots`, `LINGOarcade`, `LINGOlibrary`, `LINGOmedia`, `LINGOworld`, and `LegacyXclub`.
- Loyalty Lane Designs is not presented as a separate current business name; Designs & Promotions is a capability within LINGOlane.
- No star glyph is included in product names.
- Use Industrial Noir with crimson, white, gold and restrained royal-purple accents.
- Every destination must have a real repository route or be clearly marked planned / gated.
- No fake signup, checkout, wallet, AI, or notification form is presented as operational.

## Shared platform architecture represented
- LINGOcore / Stack Engine: contracts, APIs, events, service health and feature gates.
- LINGOidentity / LINGO ID: authentication, authorization, account lifecycle and consent.
- LINGOstudio: creative, engineering, game, book, music and film workflows.
- Master Control Plane: portfolio registry, monitoring, dispatch, evidence and release authority.
- Recovery and dispatch: runbooks, incident routing, safe retries, ownership and audit.
- LINGOshield: security, privacy, abuse controls and resilience.
- Universal Legacy Wallet: future architecture only; value-bearing features remain gated.

## Readiness truth
The homepage distinguishes discovery and preview surfaces from production-certified services. Identity, payments, cash-out, redeemable rewards and real-money gameplay are not represented as active. The public page does not make provider connectivity or production readiness claims.

## Technical implementation
- `assets/flagship-home.css`: responsive visual system, accessible focus states, reduced-motion support, responsive navigation and card layouts.
- `assets/flagship-home.js`: client-side category filtering and search only; no network calls, storage, or backend assumptions.
- `index.html`: static fallback for the homepage.
- `cloudflare/flagship-root/worker.js`: exact-root Worker embeds the same homepage document.
- `worlds/index.html`: expanded realm directory.

## Verification still required
1. Run HTML/CSS/JS validation and link-target checks on this branch.
2. Execute GitHub-hosted checks on the exact head; no result is accepted unless jobs, steps, logs and artifacts exist.
3. Upload only to an isolated Cloudflare preview after review; do not promote the exact-root Worker.
4. Verify root and www behavior, route precedence, mobile widths, keyboard navigation, reduced motion, contrast, page metadata and all destination links in a real browser.
5. Confirm the preview does not load stale AppDeploy chunks or route-data JSON.
6. Preserve the current production exact-root Worker and last-known-good version until independent acceptance and separate promotion approval.

## Acceptance status
SOURCE UPDATED / NOT YET TESTED / NOT DEPLOYED / PRODUCTION HOLD.
