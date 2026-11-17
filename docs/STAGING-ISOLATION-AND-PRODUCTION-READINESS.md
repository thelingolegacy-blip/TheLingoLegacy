# Staging Isolation and Production Readiness Contract

**Status:** Implementation gate / not a production authorization  
**Canonical repo:** `thelingolegacy-blip/TheLingoLegacy`  
**Production config:** `wrangler.jsonc`  
**Staging config target:** `wrangler.staging.jsonc` (not yet provisioned)

## Current verified baseline

- The flagship Worker is `thelingolegacyv-5`.
- Its checked-in Wrangler config defines the Worker entry point, apex/www routes, public domain variables, observability, and static assets.
- The live flagship Worker binding inventory currently contains `ASSETS`, `CANONICAL_DOMAIN`, and `PUBLIC_SITE_URL`; no KV, D1, R2, Durable Object, Queue, or Service binding was returned.
- The Cloudflare account currently returns zero Durable Object namespaces.
- The account has five KV namespaces and four D1 databases. Their names alone do not establish ownership or safe staging/production separation.
- Two D1 databases have staging-like names but zero tables. They are not yet proven attached to a staging Worker.
- The repository's `.firebaserc` default points to `lingo-legacy-production`; no separate staging Firebase project mapping is currently checked in.
- Observability destinations and issue automations currently return empty lists.

## Additional live-account reconciliation (2026-11-11)

A fresh read-only Cloudflare account inventory returned:

- Seven Workers: `lingo-ecosystem-atlas`, `lingo-flagship-root`, `lingo-flagship-site-preview`, `lingo-resilience-gateway`, `lingo-static-backup-proxy`, `lingo-studio-control-center-staging`, and `thelingolegacyv-5`.
- Five KV namespaces: `LEADERBOARD_KV`, `STUDIO_KV`, `G03_EVIDENCE`, `SUBMISSIONS`, and `JACKPOT_KV`. Their names do not establish environment ownership or whether they are attached to any Worker.
- Four D1 databases: `lingo-game-engine-staging-20261107` and `lingo-loyalty-staging` (both zero tables), `world-engine-db` (zero tables), and `lingo-production` (zero tables).
- Zero Durable Object namespaces.
- Zero Observability destinations and zero issue automations.

**Critical route/config drift:** the deployed `thelingolegacyv-5` Worker currently reports 18 routes, including the apex, www, and multiple product subdomains. The checked-in root `wrangler.jsonc` declares only the apex and www routes. This discrepancy must be reconciled before any deployment or route mutation. Do not assume the source config fully represents the deployed route state.

The two staging-named D1 databases are not proven to be attached to the staging Worker. Their zero-table state is not evidence that they are safe, unused, or production-isolated. Verify binding references from each deployed Worker's settings before assigning ownership or reusing them.

## Required environment contract

Staging must be a separately named Worker and must use independently provisioned resource identifiers for every stateful binding:

| Resource | Production | Staging requirement |
|---|---|---|
| Worker | `thelingolegacyv-5` | Unique Worker name |
| KV | Existing production IDs, if later bound | Dedicated KV namespaces |
| D1 | Existing production IDs, if later bound | Dedicated D1 databases |
| Durable Objects | None currently provisioned | Dedicated namespace(s) and migration history |
| R2 | None currently bound | Dedicated buckets |
| Queues / Workflows | None currently bound | Dedicated queues/workflows |
| Firebase | `lingo-legacy-production` | Separate Firebase project, Auth tenant/config, database and rules |
| Secrets | Production secret store | Independent staging secrets; never copied from production |
| Identity data | Production users | Synthetic staging users only |
| Analytics | Production destination | Separate staging destination and retention policy |

Never use a production resource ID in staging. Do not create bindings with guessed IDs. Do not use a staging label as proof of resource isolation.

## Wrangler configuration rules

1. Keep `wrangler.jsonc` as the canonical production config. Do not replace its routes or Worker identity as part of staging work.
2. Add `wrangler.staging.jsonc` only after the staging Worker and its resource IDs have been verified from Cloudflare.
3. Staging must not declare production routes. Prefer a protected preview hostname or controlled `workers.dev` endpoint until access controls are verified.
4. Bind only staging-owned KV/D1/R2/DO resources in the staging config.
5. For Durable Objects, use unique staging namespace IDs and explicit migration tags. Treat state migration as forward-only unless a tested data rollback procedure exists.
6. Keep secrets out of config files and Git. Use separate provider secret stores/values for each environment.
7. Run `node scripts/verify-staging-isolation.mjs` in CI. A missing staging config is a BLOCKED result, not a pass.
8. The static audit is necessary but not sufficient: independently compare the deployed Worker settings/bindings with the checked-in configuration.

## Security and identity acceptance

Before enabling SSO or cross-product sessions, test:

- Firebase ID-token signature, issuer, audience, expiry, and project/tenant;
- OAuth callback state and nonce; PKCE where applicable;
- session cookie attributes, rotation, expiration, revocation, and logout;
- account-linking ownership and collision handling;
- role and product entitlement checks on the server;
- cross-tenant and cross-environment token rejection;
- replay, CSRF, CORS, origin, malformed payload, and rate-limit cases;
- child/youth privacy, consent, deletion, retention, and parental controls where applicable.

The existing askLINGO contract explicitly states that Firebase Auth is not active and Flutter Firebase options contain placeholders. Do not infer a working identity graph from UI or documentation.

## Load and recovery acceptance

Run tests only against isolated staging with synthetic identities:

- HTTP ramp test with fixed concurrency steps and recorded p50/p95/p99;
- WebSocket connection, message ordering, reconnect, and disconnect soak;
- Durable Object state read/write consistency and contention;
- D1 query latency, transaction behavior, and connection limits;
- rate-limit and abuse tests from multiple clients/regions;
- controlled dependency timeout and failure injection;
- rollback rehearsal with a known-good Worker version and compatible state schema.

Record source commit, config hash, test tool/version, region, workload profile, run ID, result artifacts, thresholds, and independent reviewer. Do not call a test passed without its execution output.

## Telemetry and rollout

- Configure alert destinations and issue automations only after routing, access, and retention are reviewed.
- Enable trace sampling with privacy-safe redaction; do not collect message bodies, credentials, or unnecessary personal data.
- Monitor request volume, error rate, p50/p95/p99 latency, CPU/duration, WebSocket health, DO storage/alarms, auth failures, and product funnel events.
- A/B assignment must be stable and privacy-reviewed. Lifecycle messaging requires documented opt-in and unsubscribe handling.
- Waitlist activation, marketing messages, commerce activation, and public promotional traffic require separate human release approval.

## Rollback constraints

Worker version rollback does not reverse D1, KV, R2, or Durable Object data mutations. Use expand/contract schema changes, backup/restore rehearsals, idempotent writes, and forward-compatible code. A rollback automation must first detect a defined health regression, select a verified compatible version, record the decision, and verify recovery. Never auto-promote or auto-rollback stateful schema changes without a tested recovery path.

## Current gate disposition

- Production Worker config baseline: **VERIFIED read-only snapshot**.
- Staging Worker/config/resource separation: **BLOCKED** pending dedicated resource IDs and config.
- Firebase staging/SSO: **BLOCKED** pending project and end-to-end auth implementation.
- Durable Objects: **BLOCKED**; no namespace currently provisioned.
- Security certification: **NOT RUN**.
- Load/concurrency test: **NOT RUN**.
- Alert destinations/automations: **BLOCKED**; none configured.
- Waitlist/promotional rollout: **NOT AUTHORIZED**.
- Production promotion: **HOLD**; G02 and subsequent release gates remain blocked.

This contract is an implementation checklist and static test scaffold. It is not evidence of deployment, compliance certification, or release acceptance.
