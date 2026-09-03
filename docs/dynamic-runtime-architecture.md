# The Lingo Legacy Dynamic Runtime Architecture

## Production contract

The production site is a Cloudflare Worker-controlled runtime with a dynamic API boundary. Static files are delivery assets only; user-visible operational state must be sourced from runtime APIs or connected systems.

## Runtime layers

- Cloudflare Worker: request routing, security headers, runtime manifest, checkout and beacon API boundaries.
- Dynamic API: `/api/v1/runtime`, `/api/v1/platform/manifest`, and future domain APIs.
- Frontend: consumes backend state instead of treating hard-coded page data as authoritative.
- GitHub Actions: validates the dynamic runtime contract, Cloudflare-only boundary, bindings, and live probes before promotion.
- AppDeploy: dynamic frontend/backend Studio OS remains the richer command surface; deployment is currently quota-blocked at the account level.

## Integration truthfulness

Flutter, Firebase, Cloudflare, GitHub, AppDeploy, commerce, AI, and other integrations must report configured/ready/gated states from evidence. Credentials are never invented and secrets never enter source control.

## Safety contract

Safety controls remain fail-closed. Real-money wagering, cash-out, harmful capabilities, and security bypasses are not enabled to remove deployment friction.
