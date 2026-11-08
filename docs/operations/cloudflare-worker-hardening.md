# Cloudflare Worker hardening — review and acceptance

## Scope
This branch hardens the existing `thelingolegacyv-5` Worker without changing production. It preserves the current Worker name, apex/www route declarations, asset binding, health endpoint, and fail-closed release policy.

## Changes
- Enables persisted Workers Logs and invocation logs.
- Enables persisted Workers Traces with 10% head sampling for cost-conscious initial telemetry.
- Redacts query strings from telemetry.
- Replaces isolate-local Beacon rate counters with an atomic Durable Object fixed-window counter (5 requests per IP+phone key per 60-minute window).
- Hashes the IP+phone key before using it as a Durable Object name; raw values are not persisted.
- Fails closed (429) when the Durable Object binding is missing or unavailable.
- Adds a SQLite-backed Durable Object migration.

## Required pre-deployment checks
1. Confirm the repository has no existing `BeaconRateLimiter` class or conflicting migration tag `v1`. If it does, reconcile the migration sequence before accepting this branch.
2. Validate `wrangler.jsonc` with the repository-pinned Wrangler version.
3. Run `npx wrangler deploy --dry-run` using the repository's actual build command and environment. A dry-run is validation only; do not deploy.
4. Run Worker unit tests for first five requests allowed, sixth rejected, expiry reset, concurrent request atomicity, missing binding fail-closed, and storage error fail-closed.
5. Verify both `https://thelingolegacy.com/healthz` and `https://www.thelingolegacy.com/healthz` without mutating DNS or Worker routes.
6. Confirm Durable Object migration preview is accepted by Wrangler before any real migration. Migration execution is a production change and remains separately gated.
7. Inspect Cloudflare live settings and binding inventory; do not overwrite credentials. Add secrets only through an approved secure secret workflow, never in repository files.
8. Verify Workers Logs and Traces ingestion after a separately authorized deployment. Configuration alone is not evidence of live telemetry.

## Important semantics
Cloudflare's simple Workers Rate Limiting binding supports 10- or 60-second periods and per-location approximate counters. It cannot preserve the existing five-per-hour policy. This branch therefore uses Durable Objects for the existing 60-minute policy rather than silently weakening it.

## Release controls
No production deployment, DNS change, secret rotation, route mutation, merge, or activation is authorized by this branch. G02 and subsequent release gates remain blocked until independent evidence is available.
