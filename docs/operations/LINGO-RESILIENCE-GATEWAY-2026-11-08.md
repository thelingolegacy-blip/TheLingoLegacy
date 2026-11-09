# LINGO Legacy Resilience Gateway — 2026-11-08

## Purpose

A small, independently addressed Cloudflare Worker that provides a static fallback landing page and machine-readable health/readiness endpoints. It is deliberately separate from `thelingolegacyv-5`, the root Worker, and all 21 existing production Worker routes.

## Runtime contract

- Worker: `lingo-resilience-gateway`
- Source: `cloudflare/resilience-gateway/worker.mjs`
- Config: `cloudflare/resilience-gateway/wrangler.toml`
- Runtime: Cloudflare Workers, ES module entry point
- Public endpoint: `https://lingo-resilience-gateway.thelingolegacy.workers.dev/`
- Health: `/healthz` and `/api/health`
- Readiness: `/readyz` and `/api/ready`
- Status/manifest: `/api/v1/status`, `/api/v1/manifest`
- Bindings/secrets: none
- External dependencies: none
- Billing/payment: disabled
- Existing production routes/DNS: unchanged

## Safety boundary

This is a standalone fallback/status surface. It does not proxy production traffic, access user data, accept writes, perform payments, or claim that the full LINGO platform is healthy. It must not be attached to the apex or www domain until a separately approved routing change is reviewed and the complete route inventory is reconciled.

## Verification

Run the dependency-free test suite with:

```bash
node --test cloudflare/resilience-gateway/worker.test.mjs
```

After publishing, verify the following URLs independently:

- `/` returns HTTP 200 and the standalone fallback page.
- `/healthz` returns HTTP 200 and `status=healthy`.
- `/readyz` returns HTTP 200 and all local checks pass.
- `/api/v1/status` and `/api/v1/manifest` return valid JSON.
- Unknown paths return HTTP 404.
- POST requests return HTTP 405.
- HEAD returns headers without a response body.

A successful upload alone is not operational acceptance. Record the deployed version/deployment IDs and independent HTTP probe results before marking the route operational.

## Rollback

Because this Worker has its own script identity and workers.dev hostname, rollback is isolated: deploy the previous known-good version of `lingo-resilience-gateway` or disable only its workers.dev subdomain. Do not change the apex/www routes, DNS records, or primary Worker deployments as part of rollback.
