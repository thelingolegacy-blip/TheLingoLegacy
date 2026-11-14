# Cloudflare Worker hardening — review and acceptance

## Scope
This branch hardens the existing `thelingolegacyv-5` Worker without changing production. It preserves the current Worker name, asset binding, health endpoint, and fail-closed release policy. The Wrangler route list now mirrors all 18 live routes assigned to this Worker. Three other live routes remain intentionally outside this config because they belong to `lingo-static-backup-proxy`, `lingo-flagship-root`, and `lingo-ecosystem-atlas`; do not transfer or remove those routes.

## Changes
- Enables persisted Workers Logs and invocation logs.
- Enables persisted Workers Traces with 10% head sampling for cost-conscious initial telemetry.
- Redacts query strings from telemetry.
- Replaces isolate-local Beacon rate counters with an atomic Durable Object fixed-window counter (5 requests per IP+phone key per 60-minute window).
- Hashes the IP+phone key before using it as a Durable Object name; raw values are not persisted.
- Fails closed (429) when the Durable Object binding is missing or unavailable.
- Adds a SQLite-backed Durable Object migration.
- Reconciles the 18 route patterns currently assigned to `thelingolegacyv-5`, without adopting the three routes assigned to separate Workers.

## Required pre-deployment checks
1. Confirm the repository and live Cloudflare Worker have no existing `BeaconRateLimiter` class or conflicting migration tag `v1`. The current live Worker settings inspection showed no Durable Object binding; inspect its complete migration history before accepting this migration.
2. Validate `wrangler.jsonc` with the repository-pinned Wrangler version.
3. Run `npx wrangler deploy --dry-run` using the repository's actual build command and environment. A dry-run is validation only; do not deploy.
4. Run Worker unit tests for first five requests allowed, sixth rejected, expiry reset, concurrent request atomicity, missing binding fail-closed, and storage error fail-closed.
5. Verify both `https://thelingolegacy.com/healthz` and `https://www.thelingolegacy.com/healthz` without mutating DNS or Worker routes.
6. Confirm Durable Object migration preview is accepted by Wrangler before any real migration. Migration execution is a production change and remains separately gated.
7. Inspect Cloudflare live settings and binding inventory; the live Worker currently exposes only `ASSETS`, `CANONICAL_DOMAIN`, and `PUBLIC_SITE_URL`. Do not overwrite credentials. Add secrets only through an approved secure secret workflow, never in repository files.
8. Compare the proposed 18-route declaration with the current live route inventory and confirm the three separately owned routes remain assigned to their existing Workers.
9. Verify Workers Logs and Traces ingestion after a separately authorized deployment. Configuration alone is not evidence of live telemetry.

## Important semantics
Cloudflare's simple Workers Rate Limiting binding supports 10- or 60-second periods and per-location approximate counters. It cannot preserve the existing five-per-hour policy. This branch therefore uses Durable Objects for the existing 60-minute policy rather than silently weakening it.

## Release controls
No production deployment, DNS change, secret rotation, route mutation, merge, or activation is authorized by this branch. G02 and subsequent release gates remain blocked until independent evidence is available.
