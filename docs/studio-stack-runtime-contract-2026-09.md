# Studio Stack Runtime Contract — 2026-09

This repository is Cloudflare-first and dynamic-runtime-first.

## Retired
- Vercel runtime/deployment
- static-only production classification
- provider-specific preview URLs as production truth

## Runtime authority
`GitHub → CI/CD gates → Cloudflare Worker → dynamic API/runtime → Cloudflare assets → thelingolegacy.com`

## Required runtime surfaces
- `/healthz`
- `/api/v1/runtime`
- `/api/v1/platform/manifest`
- `/api/v1/platform/status`
- application API routes

## Data plane
The application must consume authoritative runtime/configuration state from the designated backend. D1/KV/R2 are Cloudflare production resources where provisioned; Firebase remains the designated auth/data platform for ecosystem capabilities already assigned to it.

## Premium Studio requirements
- responsive command-center navigation
- cinematic loading/transition layer
- runtime-driven feature flags
- live status/health indicators
- role-aware admin surfaces
- analytics and audit events
- accessible motion-safe interaction
- resilient offline/error recovery
- product-specific world themes under the shared Lingo OS design language

## Release gate
No production release is certified merely because a build succeeds. Repository state, CI checks, Worker deployment, domain routing, backend bindings, data state, analytics/observability, safety controls, and live probes must agree.
